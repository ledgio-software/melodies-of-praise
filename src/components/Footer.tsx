import Image from "next/image";
import Link from "next/link";
import { nav, site } from "@/content/site";
import type { Rehearsal, Social } from "@/lib/content";
import { socialLinks } from "./Social";

export function Footer({ rehearsal, social }: { rehearsal: Rehearsal; social: Social }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand-col">
            <Image src="/brand/mop-logo-white.png" alt={site.name} width={1089} height={499} className="footer__logo" />
            <p>
              {site.church}, {site.assembly}. Ministering in song since {site.foundedYear}.
            </p>
            <p className="footer__verse">
              “{site.scripture.text}” · {site.scripture.reference}
            </p>
          </div>
          <div className="footer__links">
            <h4>Explore</h4>
            <ul>
              {nav.slice(0, 6).map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer__links">
            <h4>Get involved</h4>
            <ul>
              {nav.slice(6).map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer__follow">
            <h4>Follow us</h4>
            <ul className="footer__social">
              {socialLinks(social).map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${site.name} on ${label}`}>
                    <Icon size={18} /> <span className="footer__social-label">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>
            © {year} {site.name} ({site.shortName}). All glory to God.
          </span>
          <span>
            Rehearsals {rehearsal.day} · {rehearsal.time}
          </span>
        </div>
      </div>
    </footer>
  );
}
