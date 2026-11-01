import Image from "next/image";
import type { Photo } from "@/content/site";

export function PageBanner({
  eyebrow,
  title,
  intro,
  image,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  /** Optional background photo, shown behind a dark veil */
  image?: Photo;
}) {
  return (
    <section className={image ? "banner banner--photo" : "banner"}>
      {image && (
        <Image src={image.src} alt="" fill priority sizes="100vw" quality={90} className="banner__img" aria-hidden="true" />
      )}
      <div className="container">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <div className="ornament" aria-hidden="true">✦</div>
        {intro && <p>{intro}</p>}
      </div>
    </section>
  );
}
