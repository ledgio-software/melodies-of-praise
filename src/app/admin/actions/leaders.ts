"use server";

import { requireUser } from "@/lib/auth";
import { handle, int, refreshSite, text } from "@/lib/admin";
import { query, queryOne } from "@/lib/db";
import { deletePhoto, savePhoto } from "@/lib/storage";

const PATH = "/admin/leaders";

export async function saveLeader(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    const name = text(fd, "name", { required: true, max: 120, label: "Name" });
    const title = text(fd, "title", { required: true, max: 120, label: "Title" });
    const id = fd.get("id") ? int(fd, "id") : null;
    const file = fd.get("photo");
    const newPhoto = file instanceof File && file.size > 0 ? await savePhoto(file, "leaders") : null;
    if (id) {
      const old = await queryOne<{ photo_url: string | null }>(`SELECT photo_url FROM leaders WHERE id=$1`, [id]);
      await query(`UPDATE leaders SET name=$1, title=$2, photo_url=COALESCE($3, photo_url) WHERE id=$4`, [
        name, title, newPhoto, id,
      ]);
      if (newPhoto && old?.photo_url) await deletePhoto(old.photo_url);
    } else {
      await query(
        `INSERT INTO leaders (name, title, photo_url, sort) VALUES ($1, $2, $3, (SELECT COALESCE(MAX(sort), 0) + 1 FROM leaders))`,
        [name, title, newPhoto],
      );
    }
    refreshSite();
    return id ? "Leader updated." : "Leader added.";
  });
}

export async function moveLeader(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    const id = int(fd, "id");
    const rows = await query<{ id: number }>(`SELECT id FROM leaders ORDER BY sort, id`);
    const i = rows.findIndex((r) => r.id === id);
    const j = fd.get("dir") === "up" ? i - 1 : i + 1;
    if (i >= 0 && j >= 0 && j < rows.length) {
      [rows[i], rows[j]] = [rows[j], rows[i]];
      for (const [n, r] of rows.entries()) await query(`UPDATE leaders SET sort=$1 WHERE id=$2`, [n, r.id]);
      refreshSite();
    }
    return "Order updated.";
  });
}

export async function deleteLeader(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    const row = await queryOne<{ photo_url: string | null }>(`DELETE FROM leaders WHERE id=$1 RETURNING photo_url`, [
      int(fd, "id"),
    ]);
    await deletePhoto(row?.photo_url);
    refreshSite();
    return "Leader removed.";
  });
}
