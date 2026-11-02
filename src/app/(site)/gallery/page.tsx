import type { Metadata } from "next";
import { PageBanner } from "@/components/PageBanner";
import { getContent } from "@/lib/content";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Photos of ${site.name} in ministry.`,
};

export default async function Gallery() {
  const c = await getContent();
  return (
    <>
      <PageBanner eyebrow="Moments" title="Gallery" intro="Snapshots of ministry, fellowship and celebration." />
      <section className="section">
        <div className="container">
          {c.gallery.length > 0 ? (
            <div className="gallery">
              {c.gallery.map((p) => (
                <figure key={p.src}>
                  <img src={p.src} alt={p.alt} loading="lazy" />
                </figure>
              ))}
            </div>
          ) : (
            <div className="empty">
              <h3>Photos coming soon</h3>
              <p>Our publicity team is gathering pictures. Meanwhile, see more on Instagram.</p>
              <a className="btn" href={c.social.instagram} target="_blank" rel="noopener noreferrer">
                View on Instagram
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
