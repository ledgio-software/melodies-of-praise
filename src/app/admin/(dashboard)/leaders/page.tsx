import type { Metadata } from "next";
import Link from "next/link";
import { deleteLeader, moveLeader, saveLeader } from "../../actions/leaders";
import { ConfirmButton, SubmitButton } from "@/components/admin/Buttons";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { PhotoInput } from "@/components/admin/PhotoInput";
import { requireUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export const metadata: Metadata = { title: "Leaders" };

type L = { id: number; name: string; title: string; photo_url: string | null };

export default async function LeadersAdmin({ searchParams }: { searchParams: FlashParams }) {
  await requireUser();
  const { ok, error, edit } = await searchParams;
  const leaders = await query<L>(`SELECT id, name, title, photo_url FROM leaders ORDER BY sort, id`);
  const editing = edit ? await queryOne<L>(`SELECT id, name, title, photo_url FROM leaders WHERE id=$1`, [Number(edit) || 0]) : null;

  return (
    <>
      <div className="adm-head">
        <h1>Leaders</h1>
        <p>Shown under “Our Leadership” on the About page, in this order.</p>
      </div>
      <Flash ok={ok} error={error} />

      <div className="adm-card" id="form">
        <h2>{editing ? `Edit ${editing.name}` : "Add a leader"}</h2>
        <form action={saveLeader} className="form" key={editing?.id ?? "new"}>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="form__row">
            <div className="field">
              <label htmlFor="name">Name <span className="req">*</span></label>
              <input id="name" name="name" required maxLength={120} defaultValue={editing?.name} placeholder="e.g. Elder Micaiah Kofi Tsibuah" />
            </div>
            <div className="field">
              <label htmlFor="title">Title <span className="req">*</span></label>
              <input id="title" name="title" required maxLength={120} defaultValue={editing?.title} placeholder="e.g. Choir Director" />
            </div>
          </div>
          <div className="field">
            <label>Photo {editing?.photo_url ? "(choose a new one to replace it)" : ""}</label>
            <PhotoInput current={editing?.photo_url} />
            <div className="field__hint">A portrait (taller than wide) head-and-shoulders photo works best.</div>
          </div>
          <div className="actions">
            <SubmitButton>{editing ? "Save changes" : "Add leader"}</SubmitButton>
            {editing && <Link href="/admin/leaders" className="btn btn--ghost">Cancel</Link>}
          </div>
        </form>
      </div>

      <div className="adm-card">
        <h2>Leadership</h2>
        {leaders.length === 0 ? <p className="adm-muted">No leaders added yet.</p> : (
          <ul className="adm-list">
            {leaders.map((l, i) => (
              <li key={l.id}>
                {l.photo_url ? <img src={l.photo_url} alt="" className="adm-thumb" /> : <span className="adm-thumb" aria-hidden="true" />}
                <div className="adm-list__main"><strong>{l.name}</strong><span className="adm-muted">{l.title}</span></div>
                <div className="adm-row-actions">
                  <form action={moveLeader}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="dir" value="up" />
                    <button className="adm-btn-sm" disabled={i === 0} aria-label="Move up">↑</button></form>
                  <form action={moveLeader}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="dir" value="down" />
                    <button className="adm-btn-sm" disabled={i === leaders.length - 1} aria-label="Move down">↓</button></form>
                  <Link href={`/admin/leaders?edit=${l.id}#form`} className="adm-btn-sm">Edit</Link>
                  <form action={deleteLeader}><input type="hidden" name="id" value={l.id} />
                    <ConfirmButton message={`Remove ${l.name} from the website?`}>Remove</ConfirmButton></form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
