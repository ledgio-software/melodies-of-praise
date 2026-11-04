import type { Metadata } from "next";
import Link from "next/link";
import { EventList } from "@/components/EventList";
import { PageBanner } from "@/components/PageBanner";
import { getContent } from "@/lib/content";
import { site } from "@/content/site";
import { pastEvents, upcomingEvents } from "@/lib/events";

export const metadata: Metadata = {
  title: "Events",
  description: `Upcoming ministrations and programmes by ${site.name}.`,
};

export const revalidate = 3600;

export default async function Events() {
  const c = await getContent();
  const upcoming = upcomingEvents(c.events);
  const past = pastEvents(c.events).slice(0, 6);
  return (
    <>
      <PageBanner eyebrow="Diary" title="Events" intro="Come and worship with us. All are welcome." image={site.pageBanners.events} />
      <section className="section">
        <div className="container narrow">
          <h2>Upcoming</h2>
          <div className="ornament ornament--left" aria-hidden="true">✦</div>
          <EventList events={upcoming} />
          <div className="card" style={{ marginTop: "2.5rem" }}>
            <h3>Weekly rehearsal</h3>
            <p>
              Every {c.rehearsal.day.replace(/s$/, "")} at {c.rehearsal.time}, {c.rehearsal.venue}.{" "}
              <Link href="/join">Thinking of joining?</Link>
            </p>
          </div>
        </div>
      </section>
      {past.length > 0 && (
        <section className="section section--parchment">
          <div className="container narrow">
            <h2>Recent</h2>
            <div className="ornament ornament--left" aria-hidden="true">✦</div>
            <EventList events={past} />
          </div>
        </section>
      )}
    </>
  );
}
