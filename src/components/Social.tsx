import { site } from "@/content/site";
import { IconFacebook, IconInstagram, IconTikTok, IconYouTube } from "./Icons";

export const socialLinks = [
  { href: site.social.youtube, label: "YouTube", Icon: IconYouTube },
  { href: site.social.instagram, label: "Instagram", Icon: IconInstagram },
  { href: site.social.facebook, label: "Facebook", Icon: IconFacebook },
  { href: site.social.tiktok, label: "TikTok", Icon: IconTikTok },
];

export function SocialButtons() {
  return (
    <div className="social">
      {socialLinks.map(({ href, label, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer">
          <Icon /> {label}
        </a>
      ))}
    </div>
  );
}
