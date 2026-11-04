import type { Metadata } from "next";
import { GalleryGrid } from "@/components/GalleryGrid";
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
            <GalleryGrid photos={c.gallery} />
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
