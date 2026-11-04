import "server-only";
import { cache } from "react";
import { site, type ChoirEvent, type Leader, type Photo, type Video } from "@/content/site";
import { dbEnabled, query } from "./db";

export type Rehearsal = typeof site.rehearsal;
export type Contact = typeof site.contact;
export type Social = typeof site.social;
export type Donation = typeof site.donation;
export type JoinInfo = typeof site.join;

/** Everything on the public site that the dashboard can change. */
export type Content = {
  rehearsal: Rehearsal;
  contact: Contact;
  social: Social;
  donation: Donation;
  join: JoinInfo;
  banner: Photo | null;
  events: ChoirEvent[];
  videos: Video[];
  leaders: Leader[];
  heroSlides: Photo[];
  gallery: Photo[];
};

export const staticContent: Content = {
  rehearsal: site.rehearsal,
  contact: site.contact,
  social: site.social,
  donation: site.donation,
  join: site.join,
  banner: site.groupPhoto,
  events: site.events,
  videos: site.videos,
  leaders: site.leaders,
  heroSlides: site.heroSlides,
  // until gallery photos are added, show the slideshow photos
  gallery: site.photos.length > 0 ? site.photos : site.heroSlides,
};

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const rows = await query<{ value: T }>(`SELECT value FROM settings WHERE key = $1`, [key]);
  if (!rows[0]) return fallback;
  // keep any new fields added to the defaults later
  const v = rows[0].value;
  return v && typeof v === "object" && !Array.isArray(v) && fallback && typeof fallback === "object"
    ? ({ ...fallback, ...v } as T)
    : v;
}

async function load(): Promise<Content> {
  const [rehearsal, contact, social, donation, join, banner, events, videos, leaders, photos] = await Promise.all([
    getSetting("rehearsal", site.rehearsal),
    getSetting("contact", site.contact),
    getSetting("social", site.social),
    getSetting("donation", site.donation),
    getSetting("join", site.join),
    getSetting<Photo | null>("banner", site.groupPhoto),
    query<ChoirEvent>(
      `SELECT title, to_char(date, 'YYYY-MM-DD') AS date, time, venue, description FROM events ORDER BY date`,
    ),
    query<{ youtube_id: string; title: string }>(`SELECT youtube_id, title FROM videos ORDER BY sort, id`),
    query<{ name: string; title: string; photo_url: string | null }>(
      `SELECT name, title, photo_url FROM leaders ORDER BY sort, id`,
    ),
    query<{ url: string; alt: string; in_slideshow: boolean; in_gallery: boolean }>(
      `SELECT url, alt, in_slideshow, in_gallery FROM photos ORDER BY sort, id`,
    ),
  ]);
  const toPhoto = (p: { url: string; alt: string }): Photo => ({ src: p.url, alt: p.alt });
  return {
    rehearsal,
    contact,
    social,
    donation,
    join,
    banner,
    events,
    videos: videos.map((v) => ({ youtubeId: v.youtube_id, title: v.title })),
    leaders: leaders.map((l) => ({ name: l.name, title: l.title, photo: l.photo_url })),
    heroSlides: photos.filter((p) => p.in_slideshow).map(toPhoto),
    gallery: photos.filter((p) => p.in_gallery).map(toPhoto),
  };
}

/** Site content for the current request: from the database when connected, else the static defaults. */
export const getContent = cache(async (): Promise<Content> => {
  if (!dbEnabled) return staticContent;
  try {
    return await load();
  } catch (err) {
    // Never take the public site down because of the database.
    console.error("Falling back to static content:", err);
    return staticContent;
  }
});
