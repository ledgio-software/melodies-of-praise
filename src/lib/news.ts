import "server-only";
import { cache } from "react";
import { dbEnabled, query, queryOne } from "./db";

export type NewsPost = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  coverUrl: string | null;
  coverAlt: string;
  /** ISO date, e.g. "2026-11-01" */
  date: string;
};

type Row = { id: number; slug: string; title: string; summary: string; body: string; cover_url: string | null; cover_alt: string; date: string };

const COLS = `id, slug, title, summary, body, cover_url, cover_alt, to_char(published_on, 'YYYY-MM-DD') AS date`;

const toPost = (r: Row): NewsPost => ({
  id: r.id, slug: r.slug, title: r.title, summary: r.summary, body: r.body,
  coverUrl: r.cover_url, coverAlt: r.cover_alt, date: r.date,
});

/** Published posts, newest first. Empty when no database is connected. */
export const listNews = cache(async (limit = 100): Promise<NewsPost[]> => {
  if (!dbEnabled) return [];
  try {
    const rows = await query<Row>(
      `SELECT ${COLS} FROM news WHERE published AND published_on <= CURRENT_DATE
       ORDER BY published_on DESC, id DESC LIMIT $1`,
      [limit],
    );
    return rows.map(toPost);
  } catch (err) {
    console.error("Could not load news", err);
    return [];
  }
});

export const getNewsBySlug = cache(async (slug: string): Promise<NewsPost | null> => {
  if (!dbEnabled) return null;
  try {
    const r = await queryOne<Row>(
      `SELECT ${COLS} FROM news WHERE slug = $1 AND published AND published_on <= CURRENT_DATE`,
      [slug],
    );
    return r ? toPost(r) : null;
  } catch (err) {
    console.error("Could not load news post", err);
    return null;
  }
});

export function formatNewsDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** URL-friendly slug from a title, e.g. "Praise Night 2026!" -> "praise-night-2026". */
export function slugify(title: string) {
  return (
    title
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "post"
  );
}
