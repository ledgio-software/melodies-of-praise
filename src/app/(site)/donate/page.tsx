import type { Metadata } from "next";
import { CopyButton } from "@/components/CopyButton";
import { PageBanner } from "@/components/PageBanner";
import { getContent } from "@/lib/content";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Donate",
  description: `Support the ministry of ${site.name} through Mobile Money.`,
};

export default async function Donate() {
  const c = await getContent();
  const d = c.donation;
  const pretty = d.number.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");
  return (
    <>
      <PageBanner eyebrow="Support the ministry" title="Donate" intro="“Each of you should give what you have decided in your heart to give… for God loves a cheerful giver.” · 2 Corinthians 9:7" image={site.pageBanners.give} />
      <section className="section">
        <div className="container narrow">
          <div className="card card--framed momo">
            <span className="eyebrow">{d.network}</span>
            <div className="momo__number">{pretty}</div>
            <div className="momo__name">
              Account name: <strong>{d.accountName}</strong>
            </div>
            <div className="actions" style={{ justifyContent: "center" }}>
              <CopyButton value={d.number} />
            </div>
          </div>

          <div className="grid grid--2" style={{ marginTop: "3rem" }}>
            <div>
              <h3>How to send</h3>
              <ol className="steps">
                <li>Dial <strong>*170#</strong> on MTN, or open your MoMo app.</li>
                <li>Choose <em>Transfer Money</em>, then <em>MoMo User</em>.</li>
                <li>Enter <strong>{pretty}</strong> and confirm the name reads <strong>{d.accountName}</strong>.</li>
                <li>Enter the amount and your reference, then your PIN.</li>
              </ol>
              <p className="field__hint">{d.note}</p>
              <p className="scam-note" role="note">
                <strong>Stay safe:</strong> {site.name} will never call or message you asking you to send money to any other number.
                The only number we use is <strong>{pretty}</strong> ({d.accountName}). If someone asks otherwise, please don’t send, and let a choir leader know.
              </p>
            </div>
            <div>
              <h3>What your gift supports</h3>
              <ul className="checklist">
                <li>Choir robes and uniforms</li>
                <li>Musical instruments and sound equipment</li>
                <li>Transport to ministrations and outreaches</li>
                <li>Recordings that carry the gospel further</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
