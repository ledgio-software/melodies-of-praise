import { NextResponse } from "next/server";
import { dbEnabled, query } from "@/lib/db";

/**
 * Receives Booking and Join Us submissions.
 *
 * 1. When the database is connected, the request is saved and appears in the
 *    admin dashboard inbox.
 * 2. When Resend is configured (RESEND_API_KEY, ENQUIRY_TO_EMAIL, optional
 *    ENQUIRY_FROM_EMAIL), it is also emailed to the choir.
 * If neither works, the route answers 503 { fallback: true } and the form
 * offers WhatsApp instead.
 */

const SUBJECTS = {
  booking: "New booking request",
  join: "New membership application",
} as const;

type Kind = keyof typeof SUBJECTS;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

async function sendEmail(kind: Kind, name: string, entries: (readonly [string, string])[], replyTo: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL;
  if (!key || !to) return null; // not configured
  const from = process.env.ENQUIRY_FROM_EMAIL ?? "Melodies of Praise <onboarding@resend.dev>";
  const subject = `${SUBJECTS[kind]}: ${name}`;
  const rows = entries
    .map(
      ([k, v]) =>
        `<tr><th align="left" style="padding:6px 12px 6px 0;vertical-align:top">${escapeHtml(k)}</th><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((s) => s.trim()),
      reply_to: replyTo || undefined,
      subject,
      html: `<h2 style="font-family:Georgia,serif">${escapeHtml(subject)}</h2><table>${rows}</table>`,
      text: entries.map(([k, v]) => `${k}: ${v}`).join("\n"),
    }),
  });
  if (!res.ok) console.error("Resend error", res.status, await res.text().catch(() => ""));
  return res.ok;
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
  const name = get("name").slice(0, 200);
  if (!name || (!get("phone") && !get("email"))) {
    return NextResponse.json({ error: "Please give your name and a phone number or email." }, { status: 400 });
  }

  let saved = false;
  if (dbEnabled) {
    try {
      await query(`INSERT INTO enquiries (kind, name, data) VALUES ($1, $2, $3::jsonb)`, [
        kind,
        name,
        JSON.stringify(Object.fromEntries(entries)),
      ]);
      saved = true;
    } catch (err) {
      console.error("Could not save enquiry", err);
    }
  }

  const emailed = await sendEmail(kind as Kind, name, entries, get("email")).catch((err) => {
    console.error("Email failed", err);
    return false;
  });

  if (saved || emailed) return NextResponse.json({ ok: true });
  if (emailed === false) {
    return NextResponse.json({ error: "We could not send your message. Please try again.", fallback: true }, { status: 502 });
  }
  return NextResponse.json({ error: "Online submissions are not configured.", fallback: true }, { status: 503 });
}
