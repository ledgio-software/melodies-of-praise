import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** Validation problem to show back to the user. */
export class FormError extends Error {}

type TextOpts = { max?: number; required?: boolean; label?: string };

export function text(fd: FormData, name: string, { max = 300, required = false, label = name }: TextOpts = {}) {
  const v = String(fd.get(name) ?? "").trim();
  if (required && !v) throw new FormError(`${label} is required.`);
  if (v.length > max) throw new FormError(`${label} is too long (max ${max} characters).`);
  return v;
}

export const optional = (v: string) => (v === "" ? null : v);

export function int(fd: FormData, name: string): number {
  const n = Number(fd.get(name));
  if (!Number.isInteger(n) || n <= 0) throw new FormError("Something went wrong. Please reload and try again.");
  return n;
}

export const bool = (fd: FormData, name: string) => fd.get(name) === "on";

/** Refresh every public page after content changes. */
export function refreshSite() {
  revalidatePath("/", "layout");
}

function withMsg(path: string, key: "ok" | "error", msg: string) {
  // keep any #section anchor at the end, after the query string
  const [base, hash] = path.split("#");
  return `${base}${base.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(msg)}${hash ? `#${hash}` : ""}`;
}

export function done(path: string, msg: string): never {
  redirect(withMsg(path, "ok", msg));
}

export function fail(path: string, msg: string): never {
  redirect(withMsg(path, "error", msg));
}

/** Run a form action; validation errors are sent back to `path` as a message. */
export async function handle(path: string, fn: () => Promise<string>): Promise<never> {
  let msg: string;
  try {
    msg = await fn();
  } catch (err) {
    if (err instanceof FormError) fail(path, err.message);
    throw err;
  }
  done(path, msg);
}

/** Extract an 11-character YouTube video ID from a link or a bare ID. */
export function youtubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.endsWith("youtu.be")) return u.pathname.slice(1, 12) || null;
    if (u.searchParams.get("v")) return u.searchParams.get("v")!.slice(0, 11);
    const m = u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{11})/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** Ghana phone number to WhatsApp form: "024 123 4567" -> "233241234567". */
export function toWhatsApp(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("233")) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `233${digits.slice(1)}`;
  return digits.length >= 9 ? digits : null;
}
