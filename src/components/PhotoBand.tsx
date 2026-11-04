import Image from "next/image";

/**
 * A maroon band with photos side by side behind its content, e.g. the
 * scripture verse on the home page and "Minister with us" on About.
 */
export function PhotoBand({ photos, children }: { photos: readonly string[]; children: React.ReactNode }) {
  return (
    <section className="section section--brand center verse">
      <div className="verse__photos" style={{ gridTemplateColumns: `repeat(${photos.length}, 1fr)` }} aria-hidden="true">
        {photos.map((src) => (
          <div key={src} className="verse__photo">
            <Image src={src} alt="" fill sizes={`(max-width: 720px) ${Math.round(100 / photos.length)}vw, 280px`} />
          </div>
        ))}
      </div>
      <div className="container verse__text">{children}</div>
    </section>
  );
}
