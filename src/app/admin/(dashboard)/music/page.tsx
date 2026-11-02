import type { Metadata } from "next";
import { addVideo, deleteVideo, moveVideo, updateVideo } from "../../actions/music";
import { ConfirmButton, SubmitButton } from "@/components/admin/Buttons";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const metadata: Metadata = { title: "Music videos" };

export default async function MusicAdmin({ searchParams }: { searchParams: FlashParams }) {
  await requireUser();
  const { ok, error } = await searchParams;
  const videos = await query<{ id: number; youtube_id: string; title: string }>(`SELECT id, youtube_id, title FROM videos ORDER BY sort, id`);

  return (
    <>
      <div className="adm-head">
        <h1>Music videos</h1>
        <p>YouTube videos shown on the Music page.</p>
      </div>
      <Flash ok={ok} error={error} />

      <div className="adm-card">
        <h2>Add a video</h2>
        <form action={addVideo} className="form">
          <div className="field">
            <label htmlFor="link">YouTube link <span className="req">*</span></label>
            <input id="link" name="link" required maxLength={300} inputMode="url" placeholder="https://youtu.be/…" />
            <div className="field__hint">On YouTube, tap <strong>Share → Copy link</strong> and paste it here.</div>
          </div>
          <div className="field">
            <label htmlFor="title">Title <span className="req">*</span></label>
            <input id="title" name="title" required maxLength={150} placeholder="e.g. Ye Koto Srewa (Live)" />
          </div>
          <div><SubmitButton>Add video</SubmitButton></div>
        </form>
      </div>

      <div className="adm-card">
        <h2>Videos on the website</h2>
        {videos.length === 0 ? <p className="adm-muted">No videos yet. Until you add some, the Music page links to the YouTube channel.</p> : (
          <ul className="adm-list">
            {videos.map((v, i) => (
              <li key={v.id}>
                <img src={`https://i.ytimg.com/vi/${v.youtube_id}/mqdefault.jpg`} alt="" className="adm-thumb" style={{ width: 96, height: 54 }} />
                <form action={updateVideo} className="adm-list__main" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <input type="hidden" name="id" value={v.id} />
                  <div className="field" style={{ flex: "1 1 200px" }}>
                    <label className="visually-hidden" htmlFor={`t-${v.id}`}>Title</label>
                    <input id={`t-${v.id}`} name="title" defaultValue={v.title} required maxLength={150} />
                  </div>
                  <SubmitButton className="adm-btn-sm">Save</SubmitButton>
                </form>
                <div className="adm-row-actions">
                  <form action={moveVideo}><input type="hidden" name="id" value={v.id} /><input type="hidden" name="dir" value="up" />
                    <button className="adm-btn-sm" disabled={i === 0} aria-label="Move up">↑</button></form>
                  <form action={moveVideo}><input type="hidden" name="id" value={v.id} /><input type="hidden" name="dir" value="down" />
                    <button className="adm-btn-sm" disabled={i === videos.length - 1} aria-label="Move down">↓</button></form>
                  <a className="adm-btn-sm" href={`https://youtu.be/${v.youtube_id}`} target="_blank" rel="noopener">Watch</a>
                  <form action={deleteVideo}><input type="hidden" name="id" value={v.id} />
                    <ConfirmButton message={`Remove “${v.title}”?`}>Remove</ConfirmButton></form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
