import "server-only";
import { site } from "@/content/site";

/**
 * Database access.
 *
 * Production: Neon Postgres (added from the Vercel Marketplace), which sets
 * DATABASE_URL. Local development: set LOCAL_DB=pglite to use an embedded
 * Postgres stored in ./.pglite, no install needed.
 *
 * When neither is configured, `dbEnabled` is false and the public site falls
 * back to the static content in src/content/site.ts.
 */

type Row = Record<string, unknown>;
type QueryFn = (text: string, params?: unknown[]) => Promise<Row[]>;

export const dbEnabled = Boolean(process.env.DATABASE_URL) || process.env.LOCAL_DB === "pglite";

let queryFn: Promise<QueryFn> | null = null;

async function connect(): Promise<QueryFn> {
  if (process.env.DATABASE_URL) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL);
    return async (text, params = []) => (await sql.query(text, params)) as Row[];
  }
  if (process.env.LOCAL_DB === "pglite") {
    const { PGlite } = await import("@electric-sql/pglite");
    const g = globalThis as unknown as { __mopPglite?: InstanceType<typeof PGlite> };
    g.__mopPglite ??= new PGlite("./.pglite");
    const db = g.__mopPglite;
    return async (text, params = []) => (await db.query<Row>(text, params)).rows;
  }
  throw new Error("Database is not configured (set DATABASE_URL).");
}

let ready: Promise<void> | null = null;

/** Run a parameterised query ($1, $2, …). Creates and seeds tables on first use. */
export async function query<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  queryFn ??= connect();
  const run = await queryFn;
  ready ??= migrate(run).catch((e) => {
    ready = null;
    throw e;
  });
  await ready;
  return (await run(text, params)) as T[];
}

export async function queryOne<T = Row>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS login_attempts (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT,
    venue TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    alt TEXT NOT NULL DEFAULT '',
    in_slideshow BOOLEAN NOT NULL DEFAULT false,
    in_gallery BOOLEAN NOT NULL DEFAULT true,
    sort INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS leaders (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    photo_url TEXT,
    sort INT NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    youtube_id TEXT NOT NULL,
    title TEXT NOT NULL,
    sort INT NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS enquiries (
    id SERIAL PRIMARY KEY,
    kind TEXT NOT NULL,
    name TEXT NOT NULL,
    data JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS enquiries_status_idx ON enquiries (status, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    cover_url TEXT,
    cover_alt TEXT NOT NULL DEFAULT '',
    published BOOLEAN NOT NULL DEFAULT false,
    published_on DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS news_published_idx ON news (published, published_on DESC)`,
];

async function migrate(run: QueryFn) {
  for (const stmt of SCHEMA) await run(stmt);

  // Seed once from the static content so the site looks the same after connecting.
  const claimed = await run(
    `INSERT INTO settings (key, value) VALUES ('seeded', 'true'::jsonb) ON CONFLICT (key) DO NOTHING RETURNING key`,
  );
  if (claimed.length > 0) await seed(run);
  await addLeadersOnce(run, "leaders_v8");
}

/**
 * One-time update: add leaders from src/content/site.ts that a database set up
 * earlier doesn't have yet (v2: full leadership, v3: Music Director, v4: Organizing Secretary,
 * v5: President's photo, v6: Prayer Secretary's photo,
 * v7: Executive Member's photo, v8: Head of Costume). Also fills in photos for existing leaders who have none.
 * Runs once per key and database. Leaders already present (matched by name) are
 * otherwise left untouched, so dashboard edits and uploaded photos are kept.
 * Bump the key when adding leaders or photos to site.ts that existing databases
 * should receive.
 */
async function addLeadersOnce(run: QueryFn, key: string) {
  const claimed = await run(
    `INSERT INTO settings (key, value) VALUES ($1, 'true'::jsonb) ON CONFLICT (key) DO NOTHING RETURNING key`,
    [key],
  );
  if (claimed.length === 0) return;
  const existing = new Set(
    (await run(`SELECT lower(name) AS name FROM leaders`)).map((r) => String(r.name)),
  );
  for (const [i, l] of site.leaders.entries()) {
    if (existing.has(l.name.toLowerCase())) {
      // only fill an empty photo; never replace one uploaded from the dashboard
      if (l.photo) await run(`UPDATE leaders SET photo_url = $1 WHERE lower(name) = $2 AND photo_url IS NULL`, [l.photo, l.name.toLowerCase()]);
      continue;
    }
    // make room so the new leader appears in the same position as in site.ts
    await run(`UPDATE leaders SET sort = sort + 1 WHERE sort >= $1`, [i]);
    await run(`INSERT INTO leaders (name, title, photo_url, sort) VALUES ($1, $2, $3, $4)`, [l.name, l.title, l.photo, i]);
  }
}

async function seed(run: QueryFn) {
  const settings: Record<string, unknown> = {
    rehearsal: site.rehearsal,
    contact: site.contact,
    social: site.social,
    donation: site.donation,
    join: site.join,
    banner: site.groupPhoto,
  };
  for (const [key, value] of Object.entries(settings)) {
    await run(`INSERT INTO settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO NOTHING`, [
      key,
      JSON.stringify(value),
    ]);
  }
  const seen = new Set<string>();
  let sort = 0;
  for (const p of [...site.heroSlides, ...site.photos]) {
    if (seen.has(p.src)) continue;
    seen.add(p.src);
    const inSlides = site.heroSlides.some((s) => s.src === p.src);
    await run(`INSERT INTO photos (url, alt, in_slideshow, in_gallery, sort) VALUES ($1, $2, $3, true, $4)`, [
      p.src,
      p.alt,
      inSlides,
      sort++,
    ]);
  }
  for (const [i, l] of site.leaders.entries()) {
    await run(`INSERT INTO leaders (name, title, photo_url, sort) VALUES ($1, $2, $3, $4)`, [l.name, l.title, l.photo, i]);
  }
  for (const e of site.events) {
    await run(`INSERT INTO events (title, date, time, venue, description) VALUES ($1, $2, $3, $4, $5)`, [
      e.title,
      e.date,
      e.time,
      e.venue,
      e.description,
    ]);
  }
  for (const [i, v] of site.videos.entries()) {
    await run(`INSERT INTO videos (youtube_id, title, sort) VALUES ($1, $2, $3)`, [v.youtubeId, v.title, i]);
  }
}
