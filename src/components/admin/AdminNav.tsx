"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string; badge?: number };

export function AdminNav({ items, userName, logout }: { items: Item[]; userName: string; logout: () => Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <aside className="adm-side" data-open={open}>
      <div className="adm-side__top">
        <Link href="/admin" className="adm-brand">
          <img src="/brand/mop-emblem.png" alt="" width={36} height={36} />
          <span>
            MOP <small>Dashboard</small>
          </span>
        </Link>
        <button type="button" className="adm-menu" aria-expanded={open} aria-controls="adm-nav" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <nav id="adm-nav" className="adm-nav" aria-label="Dashboard">
        {items.map((i) => {
          const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
          return (
            <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined}>
              {i.label}
              {i.badge ? <span className="adm-badge">{i.badge}</span> : null}
            </Link>
          );
        })}
        <div className="adm-nav__foot">
          <a href="/" target="_blank" rel="noopener">
            View website ↗
          </a>
          <span className="adm-muted">Signed in as {userName}</span>
          <form action={logout}>
            <button type="submit" className="adm-link">
              Log out
            </button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
