import Link from "next/link";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { requireUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { blobToken } from "@/lib/storage";

export default async function Overview({ searchParams }: { searchParams: FlashParams }) {
  const user = await requireUser();
  const { ok, error } = await searchParams;
  const [counts, recent, next] = await Promise.all([
    queryOne<{ unread: number; upcoming: number; photos: number; slides: number }>(`
      SELECT (SELECT count(*)::int FROM enquiries WHERE status='new') AS unread,
             (SELECT count(*)::int FROM events WHERE date >= CURRENT_DATE) AS upcoming,
             (SELECT count(*)::int FROM photos) AS photos,
             (SELECT count(*)::int FROM photos WHERE in_slideshow) AS slides`),
    query<{ id: number; kind: string; name: string; status: string; created: string }>(
      `SELECT id, kind, name, status, to_char(created_at AT TIME ZONE 'Africa/Accra', 'DD Mon, HH24:MI') AS created
       FROM enquiries WHERE status <> 'archived' ORDER BY created_at DESC LIMIT 5`,
    ),
    query<{ id: number; title: string; date: string }>(
      `SELECT id, title, to_char(date, 'Dy DD Mon YYYY') AS date FROM events WHERE date >= CURRENT_DATE ORDER BY date LIMIT 3`,
    ),
  ]);
  const blob = Boolean(blobToken());
  const email = Boolean(process.env.RESEND_API_KEY && process.env.ENQUIRY_TO_EMAIL);

  return (
    <>
      <div className="adm-head">
        <h1>Welcome, {user.name.split(" ")[0]}</h1>
        <p>Everything you change here appears on the website straight away.</p>
      </div>
      <Flash ok={ok} error={error} />

      <div className="adm-stats">
        <Link href="/admin/inbox" className="adm-stat"><b>{counts?.unread ?? 0}</b>New messages</Link>
        <Link href="/admin/events" className="adm-stat"><b>{counts?.upcoming ?? 0}</b>Upcoming events</Link>
        <Link href="/admin/photos" className="adm-stat"><b>{counts?.photos ?? 0}</b>Photos ({counts?.slides ?? 0} in slideshow)</Link>
      </div>

      <div className="adm-card">
        <h2>Latest messages</h2>
        {recent.length === 0 ? (
          <p className="adm-muted">No booking or membership requests yet. They will appear here when people use the forms on the website.</p>
        ) : (
          <ul className="adm-list">
            {recent.map((e) => (
              <li key={e.id}>
                <div className="adm-list__main">
                  {e.status === "new" && <span className="adm-tag adm-tag--new">New</span>}
                  <span className="adm-tag">{e.kind === "booking" ? "Booking" : "Join"}</span>
                  <strong style={{ display: "inline" }}>{e.name}</strong>
                  <div className="adm-muted">{e.created}</div>
                </div>
                <Link href={`/admin/inbox/${e.id}`} className="adm-btn-sm">Open</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="adm-card">
        <h2>Coming up</h2>
        {next.length === 0 ? (
          <p className="adm-muted">No upcoming events. <Link href="/admin/events">Add one</Link> so visitors know where to find you.</p>
        ) : (
          <ul className="adm-list">
            {next.map((e) => (
              <li key={e.id}>
                <div className="adm-list__main"><strong>{e.title}</strong><span className="adm-muted">{e.date}</span></div>
                <Link href={`/admin/events?edit=${e.id}`} className="adm-btn-sm">Edit</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="adm-card">
        <h2>Setup status</h2>
        <ul className="adm-checklist">
          <li><span className="adm-ok">✓</span> Database connected</li>
          <li>{blob ? <span className="adm-ok">✓</span> : <span className="adm-todo">!</span>} Photo storage {blob ? "connected" : "not connected yet: add a Vercel Blob store so photo uploads work on the live site"}</li>
          <li>{email ? <span className="adm-ok">✓</span> : <span className="adm-muted">○</span>} Email copies of new messages {email ? "on" : "off (optional: messages are always saved in the Inbox)"}</li>
        </ul>
      </div>
    </>
  );
}
