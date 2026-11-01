import { NextResponse } from "next/server";

/**
 * Receives Booking and Join Us submissions and emails them to the choir
 * through Resend (https://resend.com). Configure in Vercel → Settings →
 * Environment Variables:
 *   RESEND_API_KEY, ENQUIRY_TO_EMAIL, ENQUIRY_FROM_EMAIL
 * Until those exist, the route answers 503 { fallback: true } and the
 * form offers WhatsApp instead.
 */

const SUBJECTS = {
  booking: "New booking request",
  join: "New membership application",
} as const;

type Kind = keyof typeof SUBJECTS;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { kind, values, website } = (body ?? {}) as { kind?: string; values?: Record<string, unknown>; website?: string };

  // Honeypot: bots fill hidden fields. Pretend success.
  if (website) return NextResponse.json({ ok: true });

  if (!kind || !(kind in SUBJECTS) || !values || typeof values !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const entries = Object.entries(values)
    .slice(0, 30)
    .map(([k, v]) => [k.slice(0, 60), String(v ?? "").slice(0, 3000).trim()] as const)
    .filter(([, v]) => v);

  const get = (k: string) => entries.find(([key]) => key === k)?.[1] ?? "";
  if (!get("name") || (!get("phone") && !get("email"))) {
    return NextResponse.json({ error: "Please give your name and a phone number or email." }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL;
  const from = process.env.ENQUIRY_FROM_EMAIL ?? "Melodies of Praise <onboarding@resend.dev>";
  if (!key || !to) {
    return NextResponse.json({ error: "Email is not configured.", fallback: true }, { status: 503 });
  }

  const subject = `${SUBJECTS[kind as Kind]}: ${get("name")}`;
  const rows = entries
    .map(([k, v]) => `<tr><th align="left" style="padding:6px 12px 6px 0;vertical-align:top">${escapeHtml(k)}</th><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
    .join("");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((s) => s.trim()),
      reply_to: get("email") || undefined,
      subject,
      html: `<h2 style="font-family:Georgia,serif">${escapeHtml(subject)}</h2><table>${rows}</table>`,
      text: entries.map(([k, v]) => `${k}: ${v}`).join("\n"),
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ error: "We could not send your message. Please try again.", fallback: true }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
