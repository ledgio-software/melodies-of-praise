"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/content/site";

/** Photo grid that opens each photo full-screen, with arrows, swipe and Esc to close. */
export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);

  const show = useCallback((i: number) => {
    setOpen(i);
    dialog.current?.showModal();
  }, []);
  const close = useCallback(() => dialog.current?.close(), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onClose = () => setOpen(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    el.addEventListener("close", onClose);
    el.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("close", onClose);
      el.removeEventListener("keydown", onKey);
    };
  }, [step]);

  const current = open === null ? null : photos[open];

  return (
    <>
      <div className="gallery">
        {photos.map((p, i) => (
          <button key={p.src} type="button" className="gallery__item" onClick={() => show(i)} aria-label={`View photo: ${p.alt}`}>
            <Image src={p.src} alt={p.alt} fill sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 360px" quality={90} />
          </button>
        ))}
      </div>

      <dialog
        ref={dialog}
        className="lightbox"
        aria-label="Photo viewer"
        onClick={(e) => {
          // a click on the dark backdrop (not the photo or buttons) closes it
          if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("lightbox__stage")) close();
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {current && (
          <div className="lightbox__stage">
            <figure className="lightbox__figure">
              <Image src={current.src} alt={current.alt} width={2400} height={1600} sizes="95vw" quality={90} className="lightbox__img" />
              <figcaption>
                {current.alt}
                <span className="lightbox__count">
                  {(open ?? 0) + 1} / {photos.length}
                </span>
              </figcaption>
            </figure>
            {photos.length > 1 && (
              <>
                <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => step(-1)} aria-label="Previous photo">‹</button>
                <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => step(1)} aria-label="Next photo">›</button>
              </>
            )}
            <button type="button" className="lightbox__close" onClick={close} aria-label="Close">×</button>
          </div>
        )}
      </dialog>
    </>
  );
}
