import type { Metadata } from "next";
import Link from "next/link";
import { GalleryGrid } from "@/components/GalleryGrid";
import { PageBanner } from "@/components/PageBanner";
import { formatNewsDate } from "@/lib/news";
import { listOutreach } from "@/lib/outreach";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Outreach",
  description: `How ${site.name} serves and supports the community beyond the church walls.`,
};

export default async function OutreachPage() {
  const items = await listOutreach();
  const cover = items.find((o) => o.photos.length > 0)?.photos[0];
  return (
    <>
      <PageBanner
        eyebrow="Serving our community"
        title="Outreach"
        intro="“Let us not love with words or speech but with actions and in truth.” · 1 John 3:18"
        image={cover ?? site.pageBanners.outreach}
      />
      <section className="section">
        <div className="container">
          {items.length > 0 ? (
            <div className="outreach">
              {items.map((o) => (
                <article key={o.id} className="outreach__item">
                  <header className="outreach__head">
                    <span className="eyebrow">
                      <time dateTime={o.date}>{formatNewsDate(o.date)}</time>
                      {o.place ? ` · ${o.place}` : ""}
                    </span>
                    <h2>{o.title}</h2>
                  </header>
                  {o.story && (
                    <div className="outreach__story">
                      {o.story.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p, i) => (
                        <p key={i} style={{ whiteSpace: "pre-line" }}>{p}</p>
                      ))}
                    </div>
                  )}
                  {o.photos.length > 0 && <GalleryGrid photos={o.photos} />}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">
              <h3>Outreach stories coming soon</h3>
              <p>
                Beyond ministering in song, Melodies of Praise reaches out to support people in our community.
                Photos and stories from our visits will be shared here.
              </p>
            </div>
          )}
          <div className="empty" style={{ marginTop: "3rem" }}>
            <h3>Partner with us</h3>
            <p>Know a home, school or community we could visit, or want to support an outreach?</p>
            <div className="actions" style={{ justifyContent: "center" }}>
              <Link href="/contact" className="btn">Get in touch</Link>
              <Link href="/donate" className="btn btn--ghost">Donate</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
