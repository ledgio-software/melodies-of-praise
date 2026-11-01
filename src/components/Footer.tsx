import Link from "next/link";
import { nav, site } from "@/content/site";
import { socialLinks } from "./Social";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">{site.name}</div>
            <p>
              {site.church}, {site.assembly}. Ministering in song since {site.foundedYear}.
            </p>
            <p style={{ fontStyle: "italic" }}>
              “{site.scripture.text}” · {site.scripture.reference}
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              {nav.slice(0, 5).map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Get involved</h4>
            <ul>
              {nav.slice(5).map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Follow us</h4>
            <ul>
              {socialLinks.map(({ href, label }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {label}
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
            Rehearsals {site.rehearsal.day} · {site.rehearsal.time}
          </span>
        </div>
      </div>
    </footer>
  );
}
