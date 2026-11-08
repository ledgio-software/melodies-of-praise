"use server";

import { requireUser } from "@/lib/auth";
import { FormError, bool, handle, int, refreshSite, text } from "@/lib/admin";
import { query, queryOne } from "@/lib/db";
import { deletePhoto, savePhoto } from "@/lib/storage";
import type { Photo } from "@/content/site";

const PATH = "/admin/outreach";
const MAX_PHOTOS = 24;

export async function saveOutreach(fd: FormData) {
  await requireUser();
  const id = fd.get("id") ? int(fd, "id") : null;
  await handle(id ? `${PATH}?edit=${id}#form` : PATH, async () => {
    const title = text(fd, "title", { required: true, max: 160, label: "Title" });
    const place = text(fd, "place", { max: 160, label: "Place" });
    const story = text(fd, "story", { max: 10000, label: "Story" });
    const date = text(fd, "date", { required: true, max: 10, label: "Date" });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new FormError("Please choose a valid date.");
    const alt = text(fd, "alt", { max: 200, label: "Photo description" }) || title;
    const published = bool(fd, "published");

    const old = id ? await queryOne<{ photos: Photo[] }>(`SELECT photos FROM outreach WHERE id=$1`, [id]) : null;
    if (id && !old) throw new FormError("That outreach was not found. It may have been deleted.");
    const remove = new Set(fd.getAll("remove_photo").map(String));
    const kept = (old?.photos ?? []).filter((p) => !remove.has(p.src));
    const files = fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
    if (kept.length + files.length > MAX_PHOTOS) throw new FormError(`Please keep it to ${MAX_PHOTOS} photos or fewer per outreach.`);

    const added: Photo[] = [];
    for (const f of files) added.push({ src: await savePhoto(f, "photos"), alt });
    const photos = [...kept, ...added];

    if (id) {
      await query(
        `UPDATE outreach SET title=$1, place=$2, story=$3, happened_on=$4, photos=$5::jsonb, published=$6 WHERE id=$7`,
        [title, place, story, date, JSON.stringify(photos), published, id],
      );
      for (const p of old!.photos.filter((p) => remove.has(p.src))) await deletePhoto(p.src);
    } else {
      await query(
        `INSERT INTO outreach (title, place, story, happened_on, photos, published) VALUES ($1,$2,$3,$4,$5::jsonb,$6)`,
        [title, place, story, date, JSON.stringify(photos), published],
      );
    }
    refreshSite();
    return published ? "Saved. It is now on the Outreach page." : "Saved as a draft. It is not on the website yet.";
  });
}

export async function deleteOutreach(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    const row = await queryOne<{ photos: Photo[] }>(`DELETE FROM outreach WHERE id=$1 RETURNING photos`, [int(fd, "id")]);
    for (const p of row?.photos ?? []) await deletePhoto(p.src);
    refreshSite();
    return "Outreach deleted.";
  });
}
