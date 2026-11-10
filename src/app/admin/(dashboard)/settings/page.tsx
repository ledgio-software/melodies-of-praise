import type { Metadata } from "next";
import { saveSettings } from "../../actions/settings";
import { SubmitButton } from "@/components/admin/Buttons";
import { Flash, type FlashParams } from "@/components/admin/Flash";
import { requireUser } from "@/lib/auth";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { title: "Site settings" };

function F({ name, label, value, hint, required, type = "text", placeholder }: {
  name: string; label: string; value?: string | number | null; hint?: string; required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label} {required && <span className="req">*</span>}</label>
      <input id={name} name={name} type={type} defaultValue={value ?? ""} required={required} placeholder={placeholder} />
      {hint && <div className="field__hint">{hint}</div>}
    </div>
  );
}

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="adm-card" id={id}>
      <h2>{title}</h2>
      {intro && <p className="adm-muted">{intro}</p>}
      <form action={saveSettings} className="form">
        <input type="hidden" name="section" value={id} />
        {children}
        <div><SubmitButton>Save</SubmitButton></div>
      </form>
    </div>
  );
}

export default async function SettingsAdmin({ searchParams }: { searchParams: FlashParams }) {
  await requireUser();
  const { ok, error } = await searchParams;
  const c = await getContent();
  const wa = c.contact.whatsapp ? `0${c.contact.whatsapp.replace(/^233/, "")}` : "";

  return (
    <>
      <div className="adm-head">
        <h1>Site settings</h1>
        <p>Details used across the website. Each section saves on its own.</p>
      </div>
      <Flash ok={ok} error={error} />

      <Section id="rehearsal" title="Rehearsals" intro="Shown in the top bar, footer, home page, Join Us and Visit Us.">
        <div className="form__row">
          <F name="day" label="Day" value={c.rehearsal.day} required placeholder="e.g. Sundays" />
          <F name="time" label="Time" value={c.rehearsal.time} required placeholder="e.g. 6:00 pm" />
        </div>
        <F name="venue" label="Venue" value={c.rehearsal.venue} required />
      </Section>

      <Section id="contact" title="Contact details" intro="Leave a field empty to hide it. The WhatsApp number also receives form messages if the inbox is ever unavailable.">
        <div className="form__row">
          <F name="phone" label="Phone" value={c.contact.phone} type="tel" placeholder="024 123 4567" />
          <F name="whatsapp" label="WhatsApp number" value={wa} type="tel" placeholder="024 123 4567" />
        </div>
        <F name="email" label="Email" value={c.contact.email} type="email" />
        <F name="address" label="Address" value={c.contact.address} required />
        <F name="mapQuery" label="Map search" value={c.contact.mapQuery} required hint="What to search on Google Maps for the map on the Visit Us page." />
      </Section>

      <Section id="social" title="Social media" intro="Full links starting with https://. Leave empty to hide an icon.">
        <F name="youtube" label="YouTube" value={c.social.youtube} type="url" />
        <F name="instagram" label="Instagram" value={c.social.instagram} type="url" />
        <F name="facebook" label="Facebook" value={c.social.facebook} type="url" />
        <F name="tiktok" label="TikTok" value={c.social.tiktok} type="url" />
      </Section>

      <Section id="donation" title="Donations (Mobile Money)" intro="Shown on the Donate page. Double-check the number: people will send money to it.">
        <div className="form__row">
          <F name="network" label="Network" value={c.donation.network} required placeholder="e.g. MTN Mobile Money" />
          <F name="number" label="MoMo number" value={c.donation.number} type="tel" required />
        </div>
        <F name="accountName" label="Account name" value={c.donation.accountName} required />
        <F name="note" label="Note to givers" value={c.donation.note} />
      </Section>

      <Section id="join" title="Join Us requirements" intro="Optional extras shown on the Join Us page. Leave empty to hide.">
        <div className="form__row">
          <F name="minimumAge" label="Minimum age" value={c.join.minimumAge} type="number" />
          <F name="monthlyDues" label="Monthly dues" value={c.join.monthlyDues} placeholder="e.g. GH₵ 20" />
        </div>
        <F name="probation" label="Probation period" value={c.join.probation} placeholder="e.g. 3 months" />
      </Section>
    </>
  );
}
