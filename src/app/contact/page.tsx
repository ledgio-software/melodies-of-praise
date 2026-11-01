import type { Metadata } from "next";
import { IconClock, IconPin } from "@/components/Icons";
import { PageBanner } from "@/components/PageBanner";
import { SocialButtons } from "@/components/Social";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Find and contact ${site.name}, ${site.church}, ${site.assembly}.`,
};

export default function Contact() {
  const c = site.contact;
  return (
    <>
      <PageBanner eyebrow="Find us" title="Contact" intro="We would love to hear from you, and to see you at rehearsal." />
      <section className="section">
        <div className="container">
          <div className="grid grid--2" style={{ alignItems: "start" }}>
            <div>
              <div className="card" style={{ marginBottom: "1.75rem" }}>
                <div className="card__icon"><IconClock size={30} /></div>
                <h3>Rehearsals</h3>
                <p>
                  {site.rehearsal.day}, {site.rehearsal.time}
                  <br />
                  {site.rehearsal.venue}
                </p>
              </div>
              <div className="card" style={{ marginBottom: "1.75rem" }}>
                <div className="card__icon"><IconPin size={30} /></div>
                <h3>Address</h3>
                <p>{c.address}</p>
                {(c.phone || c.whatsapp || c.email) && (
                  <p>
                    {c.phone && (<>Phone: <a href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a><br /></>)}
                    {c.whatsapp && (<>WhatsApp: <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer">Message us</a><br /></>)}
                    {c.email && (<>Email: <a href={`mailto:${c.email}`}>{c.email}</a></>)}
                  </p>
                )}
              </div>
              <h3>Follow us</h3>
              <SocialButtons />
            </div>
            <iframe
              className="map"
              title="Map to Church of Pentecost, Lapaz Central"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(c.mapQuery)}&z=15&output=embed`}
            />
          </div>
        </div>
      </section>
    </>
  );
}
