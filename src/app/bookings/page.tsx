import type { Metadata } from "next";
import { EnquiryForm, type Field } from "@/components/EnquiryForm";
import { PageBanner } from "@/components/PageBanner";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Bookings",
  description: `Invite ${site.name} to minister at your wedding, funeral, thanksgiving or church programme.`,
};

const occasions = ["Wedding", "Funeral / Memorial service", "Thanksgiving service", "Church programme", "Crusade / Outreach", "Concert", "Other"];

const fields: Field[] = [
  { name: "name", label: "Your name", required: true, half: true },
  { name: "organisation", label: "Church / Organisation", half: true },
  { name: "phone", label: "Phone / WhatsApp", type: "tel", required: true, half: true },
  { name: "email", label: "Email", type: "email", half: true },
  { name: "occasion", label: "Occasion", type: "select", options: occasions, required: true, half: true },
  { name: "date", label: "Date of programme", type: "date", required: true, half: true },
  { name: "time", label: "Start time", type: "time", half: true },
  { name: "venue", label: "Venue / Location", required: true, half: true },
  { name: "message", label: "Programme details", type: "textarea", hint: "Expected duration, number of ministrations, any songs you would like, and anything else we should know." },
];

export default function Bookings() {
  return (
    <>
      <PageBanner eyebrow="Invitations" title="Invite the Choir" intro="We would be honoured to minister at your special occasion." />
      <section className="section">
        <div className="container">
          <div className="grid grid--2" style={{ alignItems: "start" }}>
            <div>
              <h2>We minister at</h2>
              <div className="ornament ornament--left" aria-hidden="true">✦</div>
              <ul className="checklist">
                <li>Weddings and engagements</li>
                <li>Funerals, memorial and thanksgiving services</li>
                <li>Church programmes, conventions and harvests</li>
                <li>Crusades, outreaches and concerts</li>
              </ul>
              <h3>How bookings work</h3>
              <ol className="steps">
                <li>Send your request with the form. Please give us at least two weeks’ notice where possible.</li>
                <li>Our team contacts you to confirm availability and details.</li>
                <li>We agree on the programme, logistics and any transport arrangements.</li>
                <li>We come and minister, to God be the glory.</li>
              </ol>
            </div>
            <div className="card">
              <h3>Booking request</h3>
              <EnquiryForm kind="booking" subject="Booking request" fields={fields} submitLabel="Send request" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
