import "server-only";
import { cache } from "react";
import type { Photo } from "@/content/site";
import { dbEnabled, query } from "./db";

export type Outreach = {
  id: number;
  title: string;
  place: string;
  story: string;
  photos: Photo[];
  /** ISO date, e.g. "2026-11-01" */
  date: string;
};

export type OutreachRow = {
  id: number; title: string; place: string; story: string; photos: Photo[]; published: boolean; date: string;
};

export const OUTREACH_COLS = `id, title, place, story, photos, published, to_char(happened_on, 'YYYY-MM-DD') AS date`;

/** Published outreach reports, newest first. Empty when no database is connected. */
export const listOutreach = cache(async (): Promise<Outreach[]> => {
  if (!dbEnabled) return [];
  try {
    const rows = await query<OutreachRow>(
      `SELECT ${OUTREACH_COLS} FROM outreach WHERE published ORDER BY happened_on DESC, id DESC LIMIT 100`,
    );
    return rows.map(({ published: _p, ...r }) => ({ ...r, photos: Array.isArray(r.photos) ? r.photos : [] }));
  } catch (err) {
    console.error("Could not load outreach", err);
    return [];
  }
});
