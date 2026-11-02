"use server";

import { requireUser } from "@/lib/auth";
import { FormError, handle, int, optional, refreshSite, text } from "@/lib/admin";
import { query } from "@/lib/db";

const PATH = "/admin/events";

export async function saveEvent(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    const title = text(fd, "title", { required: true, max: 150, label: "Title" });
    const date = text(fd, "date", { required: true, max: 10, label: "Date" });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new FormError("Please choose a valid date.");
    const time = optional(text(fd, "time", { max: 40, label: "Time" }));
    const venue = text(fd, "venue", { required: true, max: 200, label: "Venue" });
    const description = optional(text(fd, "description", { max: 2000, label: "Description" }));
    const id = fd.get("id") ? int(fd, "id") : null;
    if (id) {
      await query(`UPDATE events SET title=$1, date=$2, time=$3, venue=$4, description=$5 WHERE id=$6`, [
        title, date, time, venue, description, id,
      ]);
    } else {
      await query(`INSERT INTO events (title, date, time, venue, description) VALUES ($1,$2,$3,$4,$5)`, [
        title, date, time, venue, description,
      ]);
    }
    refreshSite();
    return id ? "Event updated." : "Event added.";
  });
}

export async function deleteEvent(fd: FormData) {
  await requireUser();
  await handle(PATH, async () => {
    await query(`DELETE FROM events WHERE id=$1`, [int(fd, "id")]);
    refreshSite();
    return "Event deleted.";
  });
}
