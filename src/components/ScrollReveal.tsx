"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Elements that fade gently into place as they scroll into view. */
const TARGETS = [
  ".section h2",
  ".section .lead",
  ".section .card",
  ".facts",
  ".timeline li",
  ".leader",
  ".news-card",
  ".event",
  ".gallery__item",
  ".welcome__photo",
  ".verse__text",
  ".empty",
].join(",");

/**
 * Adds a soft fade-up as content scrolls into view. The hidden starting state is
 * only applied here, by JavaScript, so pages without JS (or visitors who prefer
 * reduced motion) see everything immediately.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    // only animate what is still below the fold; content already on screen stays put
    const fold = window.innerHeight;
    const els = [...document.querySelectorAll<HTMLElement>(TARGETS)].filter(
      (el) => !el.closest(".hero") && !el.classList.contains("reveal") && el.getBoundingClientRect().top > fold,
    );
    // stagger siblings slightly (cards in a row, leaders in a grid)
    for (const el of els) {
      const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => els.includes(c as HTMLElement)) : [];
      const i = Math.max(0, siblings.indexOf(el));
      el.style.setProperty("--reveal-delay", `${Math.min(i, 5) * 80}ms`);
      el.classList.add("reveal");
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
