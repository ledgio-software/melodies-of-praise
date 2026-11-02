import type { Metadata } from "next";
import Image from "next/image";
import { movePhoto, removePhoto, setBanner, updatePhoto, uploadPhoto } from "../../actions/photos";
import { ConfirmButton, SubmitButton } from "@/components/admin/Buttons";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { PhotoInput } from "@/components/admin/PhotoInput";
import { requireUser } from "@/lib/auth";
import { getSetting } from "@/lib/content";
import { query } from "@/lib/db";

export const metadata: Metadata = { title: "Photos & slideshow" };

type P = { id: number; url: string; alt: string; in_slideshow: boolean; in_gallery: boolean };

export default async function PhotosAdmin({ searchParams }: { searchParams: FlashParams }) {
  await requireUser();
  const { ok, error } = await searchParams;
  const photos = await query<P>(`SELECT id, url, alt, in_slideshow, in_gallery FROM photos ORDER BY sort, id`);
  const banner = await getSetting<{ src: string } | null>("banner", null);

  return (
    <>
      <div className="adm-head">
        <h1>Photos &amp; slideshow</h1>
        <p>Choose which photos slide behind the logo on the home page, which appear in the Gallery, and which one is the banner on the Our Story and Visit Us pages.</p>
      </div>
      <Flash ok={ok} error={error} />

      <div className="adm-card">
        <h2>Upload a photo</h2>
        <form action={uploadPhoto} className="form">
          <PhotoInput required />
          <div className="field">
            <label htmlFor="alt">Short description <span className="req">*</span></label>
            <input id="alt" name="alt" required maxLength={200} placeholder="e.g. The choir ministering at Easter convention" />
            <div className="field__hint">Read aloud to visitors who use screen readers, and shown if the photo can’t load.</div>
          </div>
          <div className="adm-checks">
            <label className="adm-check"><input type="checkbox" name="in_gallery" defaultChecked /> Show in Gallery</label>
            <label className="adm-check"><input type="checkbox" name="in_slideshow" /> Add to home slideshow</label>
          </div>
          <div><SubmitButton pendingText="Uploading…">Upload photo</SubmitButton></div>
        </form>
      </div>

      <h2>Your photos ({photos.length})</h2>
      <p className="adm-muted">Wide (landscape) photos look best in the slideshow; 3 to 6 slides is ideal. Use the arrows to change the order.</p>
      <div className="adm-photos">
        {photos.map((p, i) => (
          <div key={p.id} className="adm-photo">
            <div className="adm-photo__img">
              <Image src={p.url} alt={p.alt} fill sizes="(max-width: 600px) 100vw, 300px" />
            </div>
            <div className="adm-photo__body">
              <div>
                {p.in_slideshow && <span className="adm-tag adm-tag--new">Slideshow</span>}
                {p.in_gallery && <span className="adm-tag">Gallery</span>}
                {banner?.src === p.url && <span className="adm-tag">Page banner</span>}
              </div>
              <form action={updatePhoto} className="form" style={{ gap: "0.6rem" }}>
                <input type="hidden" name="id" value={p.id} />
                <div className="field">
                  <label htmlFor={`alt-${p.id}`}>Description</label>
                  <input id={`alt-${p.id}`} name="alt" defaultValue={p.alt} required maxLength={200} />
                </div>
                <div className="adm-checks">
                  <label className="adm-check"><input type="checkbox" name="in_slideshow" defaultChecked={p.in_slideshow} /> Slideshow</label>
                  <label className="adm-check"><input type="checkbox" name="in_gallery" defaultChecked={p.in_gallery} /> Gallery</label>
                </div>
                <SubmitButton className="adm-btn-sm">Save</SubmitButton>
              </form>
              <div className="adm-row-actions">
                <form action={movePhoto}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="dir" value="up" />
                  <button className="adm-btn-sm" disabled={i === 0} aria-label="Move earlier">↑</button></form>
                <form action={movePhoto}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="dir" value="down" />
                  <button className="adm-btn-sm" disabled={i === photos.length - 1} aria-label="Move later">↓</button></form>
                {banner?.src !== p.url && (
                  <form action={setBanner}><input type="hidden" name="id" value={p.id} />
                    <SubmitButton className="adm-btn-sm">Use as banner</SubmitButton></form>
                )}
                <form action={removePhoto}><input type="hidden" name="id" value={p.id} />
                  <ConfirmButton message="Delete this photo from the website?">Delete</ConfirmButton></form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
