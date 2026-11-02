import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEnquiry, setEnquiryStatus } from "../../../actions/inbox";
import { ConfirmButton, SubmitButton } from "@/components/admin/Buttons";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { toWhatsApp } from "@/lib/admin";
import { requireUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export const metadata: Metadata = { title: "Message" };

const LABELS: Record<string, string> = {
  name: "Name", phone: "Phone / WhatsApp", email: "Email", organisation: "Church / organisation", occasion: "Occasion",
  date: "Date", time: "Start time", venue: "Venue", message: "Message", assembly: "Assembly", age: "Age",
  voice: "Voice part", instrument: "Instrument",
};

/** Show fields in the order of the website forms (the database stores them sorted). */
function ordered(data: Record<string, string>) {
  const order = Object.keys(LABELS);
  return Object.entries(data).sort(([a], [b]) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
}

export default async function EnquiryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: FlashParams }) {
  await requireUser();
  const id = Number((await params).id);
  const { ok, error } = await searchParams;
  const e = await queryOne<{ id: number; kind: string; name: string; status: string; data: Record<string, string>; created: string }>(
    `SELECT id, kind, name, status, data, to_char(created_at AT TIME ZONE 'Africa/Accra', 'Day DD Month YYYY, HH24:MI') AS created
     FROM enquiries WHERE id=$1`, [Number.isInteger(id) ? id : 0],
  );
  if (!e) notFound();
  // opening a new message marks it as read
  if (e.status === "new") await query(`UPDATE enquiries SET status='read' WHERE id=$1`, [e.id]);

  const phone = e.data.phone ?? "";
  const wa = phone ? toWhatsApp(phone) : null;
  const first = e.name.split(" ")[0];
  const waText = e.kind === "booking"
    ? `Hello ${first}, thank you for inviting Melodies of Praise to your ${e.data.occasion?.toLowerCase() ?? "programme"}${e.data.date ? ` on ${e.data.date}` : ""}. `
    : `Hello ${first}, thank you for your interest in joining Melodies of Praise. `;

  return (
    <>
      <p><Link href="/admin/inbox">← Back to inbox</Link></p>
      <div className="adm-head">
        <span className="adm-tag">{e.kind === "booking" ? "Booking request" : "Membership application"}</span>
        <h1>{e.name}</h1>
        <p>Received {e.created}</p>
      </div>
      <Flash ok={ok} error={error} />

      <div className="adm-card">
        <div className="actions" style={{ marginBottom: "1.25rem" }}>
          {wa && <a className="btn" href={`https://wa.me/${wa}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener">Reply on WhatsApp</a>}
          {phone && <a className="btn btn--ghost" href={`tel:${phone.replace(/\s/g, "")}`}>Call</a>}
          {e.data.email && <a className="btn btn--ghost" href={`mailto:${e.data.email}?subject=${encodeURIComponent("Melodies of Praise")}`}>Email</a>}
        </div>
        <dl className="adm-dl">
          {ordered(e.data).map(([k, v]) => (
            <div key={k} style={{ display: "contents" }}>
              <dt>{LABELS[k] ?? k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="adm-row-actions">
        <form action={setEnquiryStatus}>
          <input type="hidden" name="id" value={e.id} />
          <input type="hidden" name="status" value={e.status === "archived" ? "read" : "archived"} />
          <SubmitButton className="adm-btn-sm">{e.status === "archived" ? "Move back to inbox" : "Archive"}</SubmitButton>
        </form>
        <form action={setEnquiryStatus}>
          <input type="hidden" name="id" value={e.id} /><input type="hidden" name="status" value="new" />
          <SubmitButton className="adm-btn-sm">Mark as unread</SubmitButton>
        </form>
        <form action={deleteEnquiry}>
          <input type="hidden" name="id" value={e.id} />
          <ConfirmButton message="Delete this message permanently?">Delete</ConfirmButton>
        </form>
      </div>
    </>
  );
}
