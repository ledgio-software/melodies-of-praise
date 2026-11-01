"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Photo } from "@/content/site";

const INTERVAL_MS = 6000;

/**
 * Cross-fading background photos for the home page hero.
 * Sits behind the logo; a dark overlay keeps the logo readable.
 * Auto-advance stops for visitors who prefer reduced motion.
 */
export function HeroSlideshow({ slides }: { slides: Photo[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slides.length, paused]);

  if (slides.length === 0) return null;

  return (
    <>
      <div className="hero__slides" aria-hidden="true">
        {slides.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt=""
            fill
            sizes="100vw"
            quality={90}
            priority={i === 0}
            className="hero__slide"
            data-active={i === index}
          />
        ))}
      </div>
      {slides.length > 1 && (
        <div
          className="hero__dots"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              className="hero__dot"
              aria-label={`Show photo ${i + 1} of ${slides.length}: ${s.alt}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </>
  );
}
