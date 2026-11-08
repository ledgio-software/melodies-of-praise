import type { Metadata } from "next";
import Link from "next/link";
import { deleteOutreach, saveOutreach } from "../../actions/outreach";
import { ConfirmButton, SubmitButton } from "@/components/admin/Buttons";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { MultiPhotoInput } from "@/components/admin/MultiPhotoInput";
import { requireUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { OUTREACH_COLS, type OutreachRow } from "@/lib/outreach";

export const metadata: Metadata = { title: "Outreach" };

type Row = OutreachRow & { pretty: string };
const COLS = `${OUTREACH_COLS}, to_char(happened_on,'DD Mon YYYY') AS pretty`;

export default async function OutreachAdmin({ searchParams }: { searchParams: FlashParams }) {
  await requireUser();
  const { ok, error, edit, new: isNew } = await searchParams;
  const items = await query<Row>(`SELECT ${COLS} FROM outreach ORDER BY happened_on DESC, id DESC`);
  const editing = edit ? await queryOne<Row>(`SELECT ${COLS} FROM outreach WHERE id=$1`, [Number(edit) || 0]) : null;
  const showForm = Boolean(editing || isNew);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="adm-head">
        <h1>Outreach</h1>
        <p>Share how the choir supports the community: visits, donations, hospital and prison ministry, and more. Each outreach appears on the Outreach page with its photos.</p>
      </div>
      <Flash ok={ok} error={error} />

      {!showForm ? (
        <p><Link href="/admin/outreach?new=1#form" className="btn">Add an outreach</Link></p>
      ) : (
        <div className="adm-card" id="form">
          <h2>{editing ? "Edit outreach" : "New outreach"}</h2>
          <form action={saveOutreach} className="form" key={editing?.id ?? "new"}>
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="field">
              <label htmlFor="title">Title <span className="req">*</span></label>
              <input id="title" name="title" required maxLength={160} defaultValue={editing?.title} placeholder="e.g. Visit to the Lapaz Children's Home" />
            </div>
            <div className="form__row">
              <div className="field">
                <label htmlFor="place">Place</label>
                <input id="place" name="place" maxLength={160} defaultValue={editing?.place} placeholder="e.g. Lapaz, Accra" />
              </div>
              <div className="field">
                <label htmlFor="date">Date <span className="req">*</span></label>
                <input id="date" name="date" type="date" required defaultValue={editing?.date ?? today} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="story">What we did</label>
              <textarea id="story" name="story" maxLength={10000} rows={8} style={{ minHeight: 200 }} defaultValue={editing?.story}
                placeholder={"Tell the story: who you visited, what was donated, how people were blessed.\n\nLeave an empty line between paragraphs."} />
              <div className="field__hint">Please only share names or faces of people (especially children or patients) who are happy to appear online.</div>
            </div>
            {editing && editing.photos.length > 0 && (
              <div className="field">
                <label>Photos on the website (tick any to remove)</label>
                <div className="adm-photo-grid">
                  {editing.photos.map((p) => (
                    <label key={p.src} className="adm-photo-pick">
                      <input type="checkbox" name="remove_photo" value={p.src} aria-label="Remove this photo" />
                      <img src={p.src} alt={p.alt} />
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="field">
              <label>{editing?.photos.length ? "Add more photos" : "Photos"}</label>
              <MultiPhotoInput />
            </div>
            <div className="field">
              <label htmlFor="alt">Photo description</label>
              <input id="alt" name="alt" maxLength={200} placeholder="e.g. Choir members presenting gifts" />
              <div className="field__hint">Used for the new photos, to help visitors using screen readers. Leave empty to use the title.</div>
            </div>
            <div className="field">
              <label className="adm-check"><input type="checkbox" name="published" defaultChecked={editing ? editing.published : true} /> Show on the website</label>
            </div>
            <div className="actions">
              <SubmitButton>{editing ? "Save changes" : "Save outreach"}</SubmitButton>
              <Link href="/admin/outreach" className="btn btn--ghost">Cancel</Link>
            </div>
          </form>
        </div>
      )}

      <div className="adm-card">
        <h2>All outreach ({items.length})</h2>
        {items.length === 0 ? <p className="adm-muted">No outreach yet.</p> : (
          <ul className="adm-list">
            {items.map((o) => (
              <li key={o.id}>
                {o.photos[0] ? <img src={o.photos[0].src} alt="" className="adm-thumb" /> : <span className="adm-thumb" aria-hidden="true" />}
                <div className="adm-list__main">
                  {o.published ? <span className="adm-tag adm-tag--new">Live</span> : <span className="adm-tag">Draft</span>}
                  <strong style={{ display: "inline" }}>{o.title}</strong>
                  <div className="adm-muted">{o.pretty}{o.place ? ` · ${o.place}` : ""} · {o.photos.length} photo{o.photos.length === 1 ? "" : "s"}</div>
                </div>
                <div className="adm-row-actions">
                  <Link href={`/admin/outreach?edit=${o.id}#form`} className="adm-btn-sm">Edit</Link>
                  <form action={deleteOutreach}><input type="hidden" name="id" value={o.id} />
                    <ConfirmButton message={`Delete “${o.title}” and its photos?`}>Delete</ConfirmButton></form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
