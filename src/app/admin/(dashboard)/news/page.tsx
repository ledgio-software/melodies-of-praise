import type { Metadata } from "next";
import Link from "next/link";
import { deleteNews, saveNews } from "../../actions/news";
import { ConfirmButton, SubmitButton } from "@/components/admin/Buttons";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { PhotoInput } from "@/components/admin/PhotoInput";
import { requireUser } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

export const metadata: Metadata = { title: "News" };

type Post = {
  id: number; slug: string; title: string; summary: string; body: string; cover_url: string | null; cover_alt: string;
  published: boolean; date: string; pretty: string; future: boolean;
};

const COLS = `id, slug, title, summary, body, cover_url, cover_alt, published,
  to_char(published_on,'YYYY-MM-DD') AS date, to_char(published_on,'DD Mon YYYY') AS pretty, published_on > CURRENT_DATE AS future`;

export default async function NewsAdmin({ searchParams }: { searchParams: FlashParams }) {
  await requireUser();
  const { ok, error, edit, new: isNew } = await searchParams;
  const posts = await query<Post>(`SELECT ${COLS} FROM news ORDER BY published_on DESC, id DESC`);
  const editing = edit ? await queryOne<Post>(`SELECT ${COLS} FROM news WHERE id=$1`, [Number(edit) || 0]) : null;
  const showForm = Boolean(editing || isNew);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="adm-head">
        <h1>News</h1>
        <p>Share choir news, testimonies and reports. Published posts appear on the News page and the latest three on the home page.</p>
      </div>
      <Flash ok={ok} error={error} />

      {!showForm ? (
        <p><Link href="/admin/news?new=1#form" className="btn">Write a news post</Link></p>
      ) : (
        <div className="adm-card" id="form">
          <h2>{editing ? "Edit post" : "New post"}</h2>
          <form action={saveNews} className="form" key={editing?.id ?? "new"}>
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="field">
              <label htmlFor="title">Headline <span className="req">*</span></label>
              <input id="title" name="title" required maxLength={160} defaultValue={editing?.title} placeholder="e.g. MOP wins area music competition" />
            </div>
            <div className="field">
              <label htmlFor="summary">Summary <span className="req">*</span></label>
              <textarea id="summary" name="summary" required maxLength={300} rows={2} style={{ minHeight: 80 }} defaultValue={editing?.summary}
                placeholder="One or two sentences shown on the News list and home page." />
            </div>
            <div className="field">
              <label htmlFor="body">Full story</label>
              <textarea id="body" name="body" maxLength={20000} rows={12} style={{ minHeight: 260 }} defaultValue={editing?.body}
                placeholder={"Write the full story here.\n\nLeave an empty line between paragraphs."} />
              <div className="field__hint">Leave an empty line between paragraphs.</div>
            </div>
            <div className="field">
              <label>Cover photo {editing?.cover_url ? "(choose a new one to replace it)" : "(optional)"}</label>
              <PhotoInput current={editing?.cover_url} />
              {editing?.cover_url && (
                <label className="adm-check"><input type="checkbox" name="remove_cover" /> Remove the cover photo</label>
              )}
            </div>
            <div className="field">
              <label htmlFor="cover_alt">Photo description</label>
              <input id="cover_alt" name="cover_alt" maxLength={200} defaultValue={editing?.cover_alt} placeholder="e.g. The choir receiving the trophy" />
            </div>
            <div className="form__row">
              <div className="field">
                <label htmlFor="date">Date <span className="req">*</span></label>
                <input id="date" name="date" type="date" required defaultValue={editing?.date ?? today} />
                <div className="field__hint">Choose a future date to schedule the post.</div>
              </div>
              <div className="field">
                <label>Status</label>
                <label className="adm-check"><input type="checkbox" name="published" defaultChecked={editing ? editing.published : true} /> Publish on the website</label>
                <div className="field__hint">Untick to keep it as a draft.</div>
              </div>
            </div>
            <div className="actions">
              <SubmitButton>{editing ? "Save changes" : "Save post"}</SubmitButton>
              <Link href="/admin/news" className="btn btn--ghost">Cancel</Link>
              {editing?.published && !editing.future && (
                <a href={`/news/${editing.slug}`} target="_blank" rel="noopener" className="btn btn--ghost">View on website ↗</a>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="adm-card">
        <h2>All posts ({posts.length})</h2>
        {posts.length === 0 ? <p className="adm-muted">No news yet.</p> : (
          <ul className="adm-list">
            {posts.map((p) => (
              <li key={p.id}>
                {p.cover_url ? <img src={p.cover_url} alt="" className="adm-thumb" /> : <span className="adm-thumb" aria-hidden="true" />}
                <div className="adm-list__main">
                  {!p.published ? <span className="adm-tag">Draft</span> : p.future ? <span className="adm-tag">Scheduled</span> : <span className="adm-tag adm-tag--new">Live</span>}
                  <strong style={{ display: "inline" }}>{p.title}</strong>
                  <div className="adm-muted">{p.pretty}</div>
                </div>
                <div className="adm-row-actions">
                  <Link href={`/admin/news?edit=${p.id}#form`} className="adm-btn-sm">Edit</Link>
                  <form action={deleteNews}><input type="hidden" name="id" value={p.id} />
                    <ConfirmButton message={`Delete “${p.title}”?`}>Delete</ConfirmButton></form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
