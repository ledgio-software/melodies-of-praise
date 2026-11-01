import type { Metadata } from "next";
import { PageBanner } from "@/components/PageBanner";
import { SocialButtons } from "@/components/Social";
import { getContent } from "@/lib/content";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Music",
  description: `Watch and listen to ministrations by ${site.name}.`,
};

export default async function Music() {
  const c = await getContent();
  return (
    <>
      <PageBanner eyebrow="Listen & watch" title="Our Music" intro="Songs of praise and worship ministered to bless the body of Christ." />
      <section className="section">
        <div className="container">
          {c.videos.length > 0 ? (
            <div className="grid grid--2">
              {c.videos.map((v) => (
                <figure key={v.youtubeId} className="video">
                  <div className="video__frame">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}`}
                      title={v.title}
                      loading="lazy"
                      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <figcaption>{v.title}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="empty">
              <h3>Featured recordings coming soon</h3>
              <p>In the meantime, find our ministrations on our YouTube channel.</p>
              <a className="btn" href={c.social.youtube} target="_blank" rel="noopener noreferrer">
                Visit our YouTube channel
              </a>
            </div>
          )}
        </div>
      </section>
      <section className="section section--parchment center">
        <div className="container narrow">
          <h2>More from MOP</h2>
          <div className="ornament" aria-hidden="true">✦</div>
          <p className="lead">Short clips, rehearsals and behind-the-scenes moments live on our social pages.</p>
          <SocialButtons social={c.social} />
        </div>
      </section>
    </>
  );
}
