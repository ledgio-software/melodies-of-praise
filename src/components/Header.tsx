"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, site } from "@/content/site";
import Image from "next/image";
import { IconClose, IconMenu } from "./Icons";
import { socialLinks } from "./Social";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <div className="topbar">
        <div className="container">
          <span className="topbar__info">
            <span className="topbar__long">
              Rehearsals: {site.rehearsal.day}, {site.rehearsal.time} · {site.rehearsal.venue}
            </span>
            <span className="topbar__short" aria-hidden="true">
              Rehearsals {site.rehearsal.day}, {site.rehearsal.time}
            </span>
          </span>
          <span className="topbar__social">
            {socialLinks.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${site.name} on ${label}`} title={label}>
                <Icon size={16} />
              </a>
            ))}
          </span>
        </div>
      </div>
      <header className="header">
        <div className="container header__inner">
          <Link href="/" className="brand" aria-label={`${site.name}, home`}>
            <Image src="/brand/mop-emblem.png" alt="" width={50} height={50} className="brand__emblem" priority />
            <span>
              <span className="brand__name">{site.name}</span>
              <span className="brand__sub">
                {site.church} · {site.assembly}
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>
          <nav id="site-nav" className="nav" data-open={open} aria-label="Main">
            <ul className="nav__list">
              {nav.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link href={item.href} className="nav__link" aria-current={active ? "page" : undefined}>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}
