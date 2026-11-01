"use server";

import { requireUser } from "@/lib/auth";
import { bool, handle, int, refreshSite, text } from "@/lib/admin";
import { query, queryOne } from "@/lib/db";
import { deletePhoto, savePhoto } from "@/lib/storage";

const PATH = "/admin/photos";

export async function uploadPhoto(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    const alt = text(fd, "alt", { required: true, max: 200, label: "Description" });
    const url = await savePhoto(fd.get("photo") as File, "photos");
    await query(
      `INSERT INTO photos (url, alt, in_slideshow, in_gallery, sort)
       VALUES ($1, $2, $3, $4, (SELECT COALESCE(MAX(sort), 0) + 1 FROM photos))`,
      [url, alt, bool(fd, "in_slideshow"), bool(fd, "in_gallery")],
    );
    refreshSite();
    return "Photo uploaded.";
  });
}

export async function updatePhoto(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    const alt = text(fd, "alt", { required: true, max: 200, label: "Description" });
    await query(`UPDATE photos SET alt=$1, in_slideshow=$2, in_gallery=$3 WHERE id=$4`, [
      alt, bool(fd, "in_slideshow"), bool(fd, "in_gallery"), int(fd, "id"),
    ]);
    refreshSite();
    return "Photo updated.";
  });
}

export async function movePhoto(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    const id = int(fd, "id");
    const dir = fd.get("dir") === "up" ? "up" : "down";
    const rows = await query<{ id: number }>(`SELECT id FROM photos ORDER BY sort, id`);
    const i = rows.findIndex((r) => r.id === id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i >= 0 && j >= 0 && j < rows.length) {
      [rows[i], rows[j]] = [rows[j], rows[i]];
      for (const [n, r] of rows.entries()) await query(`UPDATE photos SET sort=$1 WHERE id=$2`, [n, r.id]);
      refreshSite();
    }
    return "Order updated.";
  });
}

export async function setBanner(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    const p = await queryOne<{ url: string; alt: string }>(`SELECT url, alt FROM photos WHERE id=$1`, [int(fd, "id")]);
    if (p) {
      await query(
        `INSERT INTO settings (key, value) VALUES ('banner', $1::jsonb)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [JSON.stringify({ src: p.url, alt: p.alt })],
      );
      refreshSite();
    }
    return "Page banner photo updated.";
  });
}

export async function removePhoto(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    const p = await queryOne<{ url: string }>(`DELETE FROM photos WHERE id=$1 RETURNING url`, [int(fd, "id")]);
    if (p) {
      // stop using it as the page banner
      await query(`DELETE FROM settings WHERE key='banner' AND value->>'src' = $1`, [p.url]);
      await query(`INSERT INTO settings (key, value) VALUES ('banner', 'null'::jsonb) ON CONFLICT (key) DO NOTHING`);
      const stillUsed = await queryOne(`SELECT 1 FROM leaders WHERE photo_url=$1`, [p.url]);
      if (!stillUsed) await deletePhoto(p.url);
    }
    refreshSite();
    return "Photo deleted.";
  });
}
