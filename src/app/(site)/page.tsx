import Link from "next/link";
import Image from "next/image";
import { IconCalendar, IconHeart, IconMusic, IconUsers } from "@/components/Icons";
import { SocialButtons } from "@/components/Social";
import { getContent } from "@/lib/content";
import { site } from "@/content/site";
import { upcomingEvents } from "@/lib/events";
import { EventList } from "@/components/EventList";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { NewsCards } from "@/components/NewsCards";
import { listNews } from "@/lib/news";

export const revalidate = 3600;

export default async function Home() {
  const c = await getContent();
  const news = await listNews(3);
  const events = upcomingEvents(c.events).slice(0, 3);
  return (
    <>
      <section className="hero">
        <HeroSlideshow slides={c.heroSlides.length > 0 ? c.heroSlides : c.gallery.slice(0, 5)} />
        <div className="container hero__inner">
          <h1>
            <Image
              src="/brand/mop-logo-white.png"
              alt={`${site.name} (${site.shortName})`}
              width={1089}
              height={499}
              className="hero__logo"
              priority
            />
          </h1>
          <span className="eyebrow">
            {site.church} · {site.assembly}
          </span>
          <p className="hero__tagline">{site.tagline}</p>
          <div className="actions" style={{ justifyContent: "center" }}>
            <Link href="/bookings" className="btn btn--gold">
              Invite the choir
            </Link>
            <Link href="/music" className="btn btn--light">
              Listen to our music
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow center">
          <span className="eyebrow">Welcome</span>
          <h2>Singing to bless the body of Christ</h2>
          <div className="ornament" aria-hidden="true">✦</div>
          <p className="lead">{site.history[0]}</p>
          <p>
            Since {site.foundedYear}, MOP has grown from a district choir into a vibrant ministry, serving across the
            area and beyond. By God’s grace we have won the area-level music competition and featured on Pent Vars.
          </p>
          <Link href="/about" className="btn btn--ghost">
            Read our story
          </Link>
        </div>
      </section>

      <section className="section section--parchment">
        <div className="container">
          <div className="facts">
            <div className="fact">
              <span className="fact__label">Founded</span>
              <span className="fact__value">{site.foundedYear}</span>
            </div>
            <div className="fact">
              <span className="fact__label">Rehearsals</span>
              <span className="fact__value">
                {c.rehearsal.day}, {c.rehearsal.time}
              </span>
            </div>
            <div className="fact">
              <span className="fact__label">Home</span>
              <span className="fact__value">{c.rehearsal.venue}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="center">
            <span className="eyebrow">Our calling</span>
            <h2>Mission &amp; Vision</h2>
            <div className="ornament" aria-hidden="true">✦</div>
          </div>
          <div className="grid grid--2">
            <div className="card card--framed">
              <h3>Our Mission</h3>
              <p>{site.mission}</p>
            </div>
            <div className="card card--framed">
              <h3>Our Vision</h3>
              <p>{site.vision}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--brand center verse">
        <div className="verse__photos" aria-hidden="true">
          {site.scripture.background.map((src) => (
            <div key={src} className="verse__photo">
              <Image src={src} alt="" fill sizes="(max-width: 720px) 20vw, 280px" />
            </div>
          ))}
        </div>
        <div className="container verse__text">
          <p className="quote">“{site.scripture.text}”</p>
          <span className="quote__ref">{site.scripture.reference}</span>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="center">
            <span className="eyebrow">How we serve</span>
            <h2>Ministry with Melodies of Praise</h2>
            <div className="ornament" aria-hidden="true">✦</div>
          </div>
          <div className="grid grid--2">
            <ServeCard icon={<IconCalendar size={34} />} title="Invite us to minister" href="/bookings" cta="Make a booking">
              Weddings, thanksgiving services, funerals, crusades and church programmes. We would be honoured to
              minister with you.
            </ServeCard>
            <ServeCard icon={<IconUsers size={34} />} title="Join the choir" href="/join" cta="How to join">
              Have a passion for music and worship? We rehearse on {c.rehearsal.day} at{" "}
              {c.rehearsal.time} and warmly welcome new voices.
            </ServeCard>
            <ServeCard icon={<IconMusic size={34} />} title="Listen & watch" href="/music" cta="Our music">
              Ministrations, rehearsals and special performances, on YouTube and across our social pages.
            </ServeCard>
            <ServeCard icon={<IconHeart size={34} />} title="Support the ministry" href="/donate" cta="Give">
              Your gifts help with robes, instruments, transport and outreach as we take the gospel in song further.
            </ServeCard>
          </div>
        </div>
      </section>

      {news.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="center">
              <span className="eyebrow">From the choir</span>
              <h2>Latest News</h2>
              <div className="ornament" aria-hidden="true">✦</div>
            </div>
            <NewsCards posts={news} />
            <p className="center" style={{ marginTop: "2rem" }}>
              <Link href="/news" className="btn btn--ghost">All news</Link>
            </p>
          </div>
        </section>
      )}

      <section className="section section--parchment">
        <div className="container narrow">
          <div className="center">
            <span className="eyebrow">Diary</span>
            <h2>Upcoming Events</h2>
            <div className="ornament" aria-hidden="true">✦</div>
          </div>
          <EventList events={events} />
          {events.length > 0 && (
            <p className="center" style={{ marginTop: "2rem" }}>
              <Link href="/events" className="btn btn--ghost">
                All events
              </Link>
            </p>
          )}
        </div>
      </section>

      <section className="section center">
        <div className="container narrow">
          <span className="eyebrow">Stay connected</span>
          <h2>Follow Melodies of Praise</h2>
          <div className="ornament" aria-hidden="true">✦</div>
          <p className="lead">Ministrations, rehearsals and news, wherever you are.</p>
          <SocialButtons social={c.social} />
        </div>
      </section>
    </>
  );
}

function ServeCard({ icon, title, children, href, cta }: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  href: string;
  cta: string;
}) {
  return (
    <div className="card">
      <div className="card__icon">{icon}</div>
      <h3>{title}</h3>
      <p>{children}</p>
      <Link href={href}>{cta} →</Link>
    </div>
  );
}
