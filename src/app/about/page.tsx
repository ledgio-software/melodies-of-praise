import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/PageBanner";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `The story, mission and leadership of ${site.name}, ${site.church}, ${site.assembly}.`,
};

export default function About() {
  return (
    <>
      <PageBanner eyebrow={`Since ${site.foundedYear}`} title="Our Story" intro="How God has led Melodies of Praise from a district choir to a ministry reaching the area and beyond." />

      <section className="section">
        <div className="container narrow">
          {site.history.map((p, i) => (
            <p key={i} className={i === 0 ? "lead" : undefined}>
              {p}
            </p>
          ))}
          <p>
            We have had the privilege of ministering on various platforms both within and outside the area, and we
            have also had opportunities to feature on Pent Vars. In addition, we are grateful to God for enabling us to
            win the music competition at the area level. These milestones are testimonies of God’s faithfulness, and we
            give Him all the glory.
          </p>
        </div>
      </section>

      <section className="section section--parchment">
        <div className="container narrow">
          <span className="eyebrow">God’s faithfulness</span>
          <h2>Milestones</h2>
          <div className="ornament ornament--left" aria-hidden="true">✦</div>
          <ol className="timeline">
            {site.milestones.map((m) => (
              <li key={m.year}>
                <span className="timeline__year">{m.year}</span>
                {m.text}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid--2">
            <div className="card card--framed">
              <span className="eyebrow">Why we sing</span>
              <h3>Our Mission</h3>
              <p>{site.mission}</p>
            </div>
            <div className="card card--framed">
              <span className="eyebrow">Where we are going</span>
              <h3>Our Vision</h3>
              <p>{site.vision}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--parchment">
        <div className="container">
          <div className="center">
            <span className="eyebrow">Shepherds &amp; servants</span>
            <h2>Our Leadership</h2>
            <div className="ornament" aria-hidden="true">✦</div>
          </div>
          <div className="grid grid--3">
            {site.leaders.map((l) => (
              <div key={l.name} className="leader">
                {l.photo ? (
                  <img className="leader__photo" src={l.photo} alt={l.name} />
                ) : (
                  <div className="leader__placeholder" aria-hidden="true">
                    {initials(l.name)}
                  </div>
                )}
                <div className="leader__title">{l.title}</div>
                <h3>{l.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section center">
        <div className="container narrow">
          <h2>Minister with us</h2>
          <p className="lead">Whether you would like to sing with us or invite us to your programme, we would love to hear from you.</p>
          <div className="actions">
            <Link href="/join" className="btn">Join the choir</Link>
            <Link href="/bookings" className="btn btn--ghost">Invite the choir</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function initials(name: string) {
  const parts = name.replace(/^(Elder|Pastor|Deacon|Deaconess|Mrs?\.?|Ms\.?|Dr\.?)\s+/i, "").split(/\s+/);
  return (parts[0][0] + (parts[parts.length - 1][0] ?? "")).toUpperCase();
}
