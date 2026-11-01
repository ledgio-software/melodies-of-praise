import type { Social } from "@/lib/content";
import { IconFacebook, IconInstagram, IconTikTok, IconYouTube } from "./Icons";

export function socialLinks(social: Social) {
  return [
    { href: social.youtube, label: "YouTube", Icon: IconYouTube },
    { href: social.instagram, label: "Instagram", Icon: IconInstagram },
    { href: social.facebook, label: "Facebook", Icon: IconFacebook },
    { href: social.tiktok, label: "TikTok", Icon: IconTikTok },
  ].filter((l) => l.href);
}

export function SocialButtons({ social }: { social: Social }) {
  return (
    <div className="social">
      {socialLinks(social).map(({ href, label, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer">
          <Icon /> {label}
        </a>
      ))}
    </div>
  );
}
