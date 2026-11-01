import type { Metadata } from "next";
import Link from "next/link";
import { deleteEvent, saveEvent } from "../../actions/events";
import { ConfirmButton, SubmitButton } from "@/components/admin/Buttons";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { requireUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export const metadata: Metadata = { title: "Events" };

type Ev = { id: number; title: string; date: string; time: string | null; venue: string; description: string | null; past: boolean };

export default async function EventsAdmin({ searchParams }: { searchParams: FlashParams }) {
  await requireUser();
  const { ok, error, edit } = await searchParams;
  const events = await query<Ev & { pretty: string }>(
    `SELECT id, title, to_char(date,'YYYY-MM-DD') AS date, to_char(date,'Dy DD Mon YYYY') AS pretty, time, venue, description,
            date < CURRENT_DATE AS past FROM events ORDER BY date DESC`,
  );
  const editing = edit ? await queryOne<Ev>(
    `SELECT id, title, to_char(date,'YYYY-MM-DD') AS date, time, venue, description FROM events WHERE id=$1`, [Number(edit) || 0],
  ) : null;

  return (
    <>
      <div className="adm-head">
        <h1>Events</h1>
        <p>Upcoming events show on the Home and Events pages. Past events move to “Recent” automatically.</p>
      </div>
      <Flash ok={ok} error={error} />

      <div className="adm-card" id="form">
        <h2>{editing ? "Edit event" : "Add an event"}</h2>
        <form action={saveEvent} className="form" key={editing?.id ?? "new"}>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="field">
            <label htmlFor="title">Title <span className="req">*</span></label>
            <input id="title" name="title" required maxLength={150} defaultValue={editing?.title} placeholder="e.g. Annual Praise Night" />
          </div>
          <div className="form__row">
            <div className="field">
              <label htmlFor="date">Date <span className="req">*</span></label>
              <input id="date" name="date" type="date" required defaultValue={editing?.date} />
            </div>
            <div className="field">
              <label htmlFor="time">Time</label>
              <input id="time" name="time" maxLength={40} defaultValue={editing?.time ?? ""} placeholder="e.g. 6:00 pm" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="venue">Venue <span className="req">*</span></label>
            <input id="venue" name="venue" required maxLength={200} defaultValue={editing?.venue} placeholder="e.g. Lapaz Central Auditorium" />
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" maxLength={2000} defaultValue={editing?.description ?? ""} />
          </div>
          <div className="actions">
            <SubmitButton>{editing ? "Save changes" : "Add event"}</SubmitButton>
            {editing && <Link href="/admin/events" className="btn btn--ghost">Cancel</Link>}
          </div>
        </form>
      </div>

      <div className="adm-card">
        <h2>All events</h2>
        {events.length === 0 ? <p className="adm-muted">No events yet.</p> : (
          <ul className="adm-list">
            {events.map((e) => (
              <li key={e.id}>
                <div className="adm-list__main">
                  {e.past && <span className="adm-tag">Past</span>}
                  <strong style={{ display: "inline" }}>{e.title}</strong>
                  <div className="adm-muted">{e.pretty}{e.time ? ` · ${e.time}` : ""} · {e.venue}</div>
                </div>
                <div className="adm-row-actions">
                  <Link href={`/admin/events?edit=${e.id}#form`} className="adm-btn-sm">Edit</Link>
                  <form action={deleteEvent}>
                    <input type="hidden" name="id" value={e.id} />
                    <ConfirmButton message={`Delete “${e.title}”?`}>Delete</ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
