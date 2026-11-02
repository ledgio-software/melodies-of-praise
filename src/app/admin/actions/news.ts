"use server";

import { requireUser } from "@/lib/auth";
import { FormError, bool, handle, int, refreshSite, text } from "@/lib/admin";
import { query, queryOne } from "@/lib/db";
import { slugify } from "@/lib/news";
import { deletePhoto, savePhoto } from "@/lib/storage";

const PATH = "/admin/news";

async function uniqueSlug(title: string) {
  const base = slugify(title);
  let slug = base;
  for (let n = 2; await queryOne(`SELECT 1 FROM news WHERE slug=$1`, [slug]); n++) slug = `${base}-${n}`;
  return slug;
}

export async function saveNews(fd: FormData) {
  await requireUser();
  const id = fd.get("id") ? int(fd, "id") : null;
  await handle(id ? `${PATH}?edit=${id}` : PATH, async () => {
    const title = text(fd, "title", { required: true, max: 160, label: "Headline" });
    const summary = text(fd, "summary", { required: true, max: 300, label: "Summary" });
    const body = text(fd, "body", { max: 20000, label: "Story" });
    const date = text(fd, "date", { required: true, max: 10, label: "Date" });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new FormError("Please choose a valid date.");
    const coverAlt = text(fd, "cover_alt", { max: 200, label: "Photo description" });
    const published = bool(fd, "published");
    const file = fd.get("photo");
    const newCover = file instanceof File && file.size > 0 ? await savePhoto(file, "photos") : null;
    const removeCover = bool(fd, "remove_cover");

    if (id) {
      const old = await queryOne<{ cover_url: string | null }>(`SELECT cover_url FROM news WHERE id=$1`, [id]);
      const cover = newCover ?? (removeCover ? null : old?.cover_url ?? null);
      await query(
        `UPDATE news SET title=$1, summary=$2, body=$3, published_on=$4, cover_url=$5, cover_alt=$6, published=$7, updated_at=now() WHERE id=$8`,
        [title, summary, body, date, cover, coverAlt, published, id],
      );
      if (old?.cover_url && old.cover_url !== cover) await deletePhoto(old.cover_url);
    } else {
      await query(
        `INSERT INTO news (slug, title, summary, body, published_on, cover_url, cover_alt, published) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [await uniqueSlug(title), title, summary, body, date, newCover, coverAlt, published],
      );
    }
    refreshSite();
    if (!published) return "Saved as a draft. It is not on the website yet.";
    return date > new Date().toISOString().slice(0, 10)
      ? `Scheduled: it will appear on the website on ${date}.`
      : "Published. It is now on the website.";
  });
}

export async function deleteNews(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    const row = await queryOne<{ cover_url: string | null }>(`DELETE FROM news WHERE id=$1 RETURNING cover_url`, [int(fd, "id")]);
    await deletePhoto(row?.cover_url);
    refreshSite();
    return "Post deleted.";
  });
}
