"use server";

import { requireUser } from "@/lib/auth";
import { FormError, handle, int, refreshSite, text, youtubeId } from "@/lib/admin";
import { query } from "@/lib/db";

const PATH = "/admin/music";

export async function addVideo(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    const link = text(fd, "link", { required: true, max: 300, label: "YouTube link" });
    const id = youtubeId(link);
    if (!id) throw new FormError("That doesn’t look like a YouTube link. Copy it from the Share button on YouTube.");
    const title = text(fd, "title", { required: true, max: 150, label: "Title" });
    await query(`INSERT INTO videos (youtube_id, title, sort) VALUES ($1, $2, (SELECT COALESCE(MAX(sort), 0) + 1 FROM videos))`, [
      id, title,
    ]);
    refreshSite();
    return "Video added.";
  });
}

export async function updateVideo(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    const title = text(fd, "title", { required: true, max: 150, label: "Title" });
    await query(`UPDATE videos SET title=$1 WHERE id=$2`, [title, int(fd, "id")]);
    refreshSite();
    return "Video updated.";
  });
}

export async function moveVideo(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    const id = int(fd, "id");
    const rows = await query<{ id: number }>(`SELECT id FROM videos ORDER BY sort, id`);
    const i = rows.findIndex((r) => r.id === id);
    const j = fd.get("dir") === "up" ? i - 1 : i + 1;
    if (i >= 0 && j >= 0 && j < rows.length) {
      [rows[i], rows[j]] = [rows[j], rows[i]];
      for (const [n, r] of rows.entries()) await query(`UPDATE videos SET sort=$1 WHERE id=$2`, [n, r.id]);
      refreshSite();
    }
    return "Order updated.";
  });
}

export async function deleteVideo(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    await query(`DELETE FROM videos WHERE id=$1`, [int(fd, "id")]);
    refreshSite();
    return "Video removed.";
  });
}
