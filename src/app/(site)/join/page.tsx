import type { Metadata } from "next";
import { EnquiryForm, type Field } from "@/components/EnquiryForm";
import { PageBanner } from "@/components/PageBanner";
import { getContent } from "@/lib/content";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Join Us",
  description: `Become a member of ${site.name}. Rehearsals ${site.rehearsal.day}, ${site.rehearsal.time}.`,
};

const fields: Field[] = [
  { name: "name", label: "Full name", required: true },
  { name: "phone", label: "Phone / WhatsApp", type: "tel", required: true, half: true },
  { name: "email", label: "Email", type: "email", half: true },
  { name: "assembly", label: "Your assembly", placeholder: "e.g. Lapaz Central", half: true },
  { name: "age", label: "Age", type: "number", half: true },
  { name: "voice", label: "Voice part (if known)", type: "select", options: ["Soprano", "Alto", "Tenor", "Bass", "Not sure yet"], half: true },
  { name: "instrument", label: "Do you play an instrument?", placeholder: "e.g. keyboard, drums", half: true },
  { name: "message", label: "Tell us a little about yourself", type: "textarea", hint: "Your experience with music, and why you would like to join." },
];

export default async function Join() {
  const c = await getContent();
  const { minimumAge, monthlyDues, probation } = c.join;
  return (
    <>
      <PageBanner eyebrow="New voices welcome" title="Join the Choir" intro="If God has placed a song in your heart, come and serve with us." image={site.pageBanners.join} />
      <section className="section">
        <div className="container">
          <div className="grid grid--2" style={{ alignItems: "start" }}>
            <div>
              <h2>What we look for</h2>
              <div className="ornament ornament--left" aria-hidden="true">✦</div>
              <ul className="checklist">
                <li>A personal relationship with Christ and a heart for worship</li>
                <li>A passion and interest in music. Training is given, and every voice can grow</li>
                <li>
                  Commitment to rehearsals: {c.rehearsal.day}, {c.rehearsal.time}, {c.rehearsal.venue}
                </li>
                <li>A teachable spirit and respect for choir leadership and discipline</li>
                {minimumAge && <li>Minimum age: {minimumAge} years</li>}
                {monthlyDues && <li>Monthly dues: {monthlyDues}</li>}
                {probation && <li>Probation period: {probation}</li>}
              </ul>
              <h3>How to join</h3>
              <ol className="steps">
                <li>Send us your details with the form.</li>
                <li>Come along to a {c.rehearsal.day.replace(/s$/, "")} rehearsal and meet the leadership.</li>
                <li>A short voice placement to find your part.</li>
                <li>Welcome to Melodies of Praise!</li>
              </ol>
            </div>
            <div className="card">
              <h3>Membership interest form</h3>
              <EnquiryForm kind="join" subject="Membership application" fields={fields} submitLabel="Send my details" whatsapp={c.contact.whatsapp} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
