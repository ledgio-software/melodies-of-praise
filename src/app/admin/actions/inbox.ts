"use server";

import { requireUser } from "@/lib/auth";
import { handle, int } from "@/lib/admin";
import { query } from "@/lib/db";

const STATUSES = ["new", "read", "archived"] as const;

export async function setEnquiryStatus(fd: FormData) {
  await requireUser();
  const id = int(fd, "id");
  const status = STATUSES.find((s) => s === fd.get("status")) ?? "read";
  // "mark as unread" returns to the list; reopening the message would mark it read again
  const back = fd.get("back") === "list" || status === "new" ? "/admin/inbox" : `/admin/inbox/${id}`;
  await handle(back, async () => {
    await query(`UPDATE enquiries SET status=$1 WHERE id=$2`, [status, id]);
    return status === "archived" ? "Moved to archive." : status === "new" ? "Marked as unread." : "Marked as read.";
  });
}

export async function deleteEnquiry(fd: FormData) {
  await requireUser();
  await handle("/admin/inbox", async () => {
    await query(`DELETE FROM enquiries WHERE id=$1`, [int(fd, "id")]);
    return "Message deleted.";
  });
}
