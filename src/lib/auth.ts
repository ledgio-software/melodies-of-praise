import "server-only";
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { dbEnabled, query, queryOne } from "./db";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const SESSION_COOKIE = "mop_session";
const SESSION_DAYS = 14;
const MAX_FAILED_LOGINS = 8; // per email, per 15 minutes

export type Role = "admin" | "editor";
export type User = { id: number; email: string; name: string; role: Role };

// ---------- passwords ----------
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function passwordProblem(pw: string): string | null {
  if (pw.length < 10) return "Password must be at least 10 characters.";
  if (pw.length > 200) return "Password is too long.";
  return null;
}

/** Readable temporary password, e.g. "harp-7342-psalm-9915". */
export function temporaryPassword(): string {
  const words = ["praise", "psalm", "harp", "hymn", "grace", "zion", "selah", "glory", "tenor", "alto", "choir", "anthem"];
  const pick = () => words[randomBytes(1)[0] % words.length];
  const num = () => String(1000 + (randomBytes(2).readUInt16BE() % 9000));
  return `${pick()}-${num()}-${pick()}-${num()}`;
}

// ---------- sessions ----------
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await query(`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)`, [
    sha256(token),
    userId,
    expires.toISOString(),
  ]);
  // tidy up old sessions now and then
  await query(`DELETE FROM sessions WHERE expires_at < now()`);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && dbEnabled) await query(`DELETE FROM sessions WHERE token_hash = $1`, [sha256(token)]);
  jar.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!dbEnabled) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return queryOne<User>(
    `SELECT u.id, u.email, u.name, u.role FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [sha256(token)],
  );
});

/** Use at the top of every protected page and server action. */
export async function requireUser(role?: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (role === "admin" && user.role !== "admin") redirect("/admin?error=Only+admins+can+do+that");
  return user;
}

// ---------- login throttling ----------
export async function tooManyAttempts(email: string): Promise<boolean> {
  const row = await queryOne<{ n: number }>(
    `SELECT count(*)::int AS n FROM login_attempts WHERE email = $1 AND at > now() - interval '15 minutes'`,
    [email],
  );
  return (row?.n ?? 0) >= MAX_FAILED_LOGINS;
}

export async function recordFailedLogin(email: string) {
  await query(`INSERT INTO login_attempts (email) VALUES ($1)`, [email]);
  await query(`DELETE FROM login_attempts WHERE at < now() - interval '1 day'`);
}

export async function clearFailedLogins(email: string) {
  await query(`DELETE FROM login_attempts WHERE email = $1`, [email]);
}
