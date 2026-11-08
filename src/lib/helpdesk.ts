import "server-only";
import { createHash } from "node:crypto";
import { site, nav } from "@/content/site";
import { getContent } from "./content";
import { dbEnabled, query } from "./db";
import { upcomingEvents } from "./events";
import { formatNewsDate, listNews } from "./news";
import { listOutreach } from "./outreach";

/** The help desk is on when an Anthropic API key is set in the project's environment variables. */
export const helpdeskEnabled = Boolean(process.env.ANTHROPIC_API_KEY);

export const HELPDESK_LIMITS = {
  perVisitor: 20, // questions per visitor
  windowMinutes: 30,
  perDay: 600, // questions across the whole site per day, to cap the bill
};

const memoryHits = new Map<string, number[]>();

/**
 * Returns a message when the visitor (or the whole site) has asked too many
 * questions. Stores only a one-way hash of the visitor's IP and a time, which
 * are deleted after a day.
 */
export async function checkHelpdeskLimit(ip: string): Promise<string | null> {
  const salt = process.env.ADMIN_SETUP_CODE ?? process.env.DATABASE_URL ?? "mop";
  const visitor = createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
  const { perVisitor, windowMinutes, perDay } = HELPDESK_LIMITS;
  const busy = "Lots of people are asking questions right now. Please try again a little later, or contact the choir directly.";
  const slow = "You’ve asked a lot of questions in a short time. Please wait a few minutes and try again.";

  if (dbEnabled) {
    try {
      await query(`DELETE FROM helpdesk_hits WHERE at < now() - interval '1 day'`);
      const [mine, all] = await Promise.all([
        query<{ n: number }>(`SELECT count(*)::int AS n FROM helpdesk_hits WHERE visitor=$1 AND at > now() - make_interval(mins => $2)`, [visitor, windowMinutes]),
        query<{ n: number }>(`SELECT count(*)::int AS n FROM helpdesk_hits`),
      ]);
      if ((all[0]?.n ?? 0) >= perDay) return busy;
      if ((mine[0]?.n ?? 0) >= perVisitor) return slow;
      await query(`INSERT INTO helpdesk_hits (visitor) VALUES ($1)`, [visitor]);
      return null;
    } catch (err) {
      console.error("Help desk limit check failed; using memory", err);
    }
  }
  // best effort without a database (resets when the server restarts)
  const now = Date.now();
  const recent = (memoryHits.get(visitor) ?? []).filter((t) => now - t < windowMinutes * 60_000);
  if (recent.length >= perVisitor) return slow;
  recent.push(now);
  memoryHits.set(visitor, recent);
  return null;
}

const lines = (xs: (string | null)[]) => xs.filter((x) => x !== null).join("\n");

/** Everything the help desk may answer from: only what is already public on the website. */
export async function buildKnowledge(): Promise<string> {
  const [c, news, outreach] = await Promise.all([getContent(), listNews(5), listOutreach()]);
  const upcoming = upcomingEvents(c.events).slice(0, 10);
  const ct = c.contact;
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Accra" });
  return lines([
    `Today is ${today} (Ghana time).`,
    "",
    "## About",
    `${site.name} (${site.shortName}) is a choir of ${site.church}, ${site.assembly} assembly, founded in ${site.foundedYear}. Tagline: ${site.tagline}.`,
    `Mission: ${site.mission}`,
    `Vision: ${site.vision}`,
    `Theme scripture: "${site.scripture.text}" (${site.scripture.reference})`,
    "",
    "## History",
    ...site.history,
    "Milestones:",
    ...site.milestones.map((m) => `- ${m.year}: ${m.text}`),
    "",
    "## Leadership",
    ...c.leaders.map((l) => `- ${l.name}: ${l.title}`),
    "",
    "## Rehearsals",
    `${c.rehearsal.day} at ${c.rehearsal.time}, ${c.rehearsal.venue}. Visitors and prospective members are welcome to come and see a rehearsal.`,
    "",
    "## Joining the choir (page: /join)",
    "We look for: a personal relationship with Christ and a heart for worship; a passion and interest in music (training is given, every voice can grow); commitment to rehearsals.",
    "To join, fill in the form on the Join Us page. The team gets back to applicants.",
    c.join.minimumAge ? `Minimum age: ${c.join.minimumAge}.` : "Minimum age: not published yet.",
    c.join.monthlyDues ? `Monthly dues: ${c.join.monthlyDues}.` : "Monthly dues: not published yet.",
    c.join.probation ? `Probation: ${c.join.probation}.` : null,
    "",
    "## Bookings (page: /bookings)",
    "The choir ministers at weddings and engagements; funerals, memorial and thanksgiving services; church programmes, conventions and harvests; crusades, outreaches and concerts.",
    "How it works: 1) send the booking request form on the Bookings page, ideally at least two weeks before; 2) the team contacts you to confirm availability and details; 3) you agree the programme, logistics and transport; 4) the choir ministers.",
    "Fees are not published. They are discussed with the team after a booking request.",
    "",
    "## Donations (page: /donate)",
    `Network: ${c.donation.network}. Number: ${c.donation.number}. Account name: ${c.donation.accountName}. ${c.donation.note}`,
    "Donations support choir robes and uniforms, instruments and sound equipment, transport to ministrations and outreaches, and recordings.",
    `SAFETY: ${c.donation.number} (${c.donation.accountName}) is the only number. The choir never calls or messages people asking them to send money to any other number.`,
    "",
    "## Contact (page: /contact)",
    `Address: ${ct.address}.`,
    ct.phone ? `Phone: ${ct.phone}.` : null,
    ct.whatsapp ? `WhatsApp: +${ct.whatsapp}.` : null,
    ct.email ? `Email: ${ct.email}.` : null,
    !ct.phone && !ct.whatsapp && !ct.email ? "No public phone or email is listed yet; people can reach the choir through social media or by visiting a rehearsal." : null,
    `Social media: YouTube ${c.social.youtube}; Instagram ${c.social.instagram}; Facebook ${c.social.facebook}; TikTok ${c.social.tiktok}.`,
    "",
    "## Upcoming events (page: /events)",
    ...(upcoming.length
      ? upcoming.map((e) => `- ${e.title}: ${e.date}${e.time ? ` at ${e.time}` : ""}, ${e.venue}${e.description ? `. ${e.description}` : ""}`)
      : ["No upcoming events are listed right now."]),
    "",
    "## Latest news (page: /news)",
    ...(news.length ? news.map((n) => `- ${formatNewsDate(n.date)}: ${n.title}. ${n.summary} (/news/${n.slug})`) : ["No news posts yet."]),
    "",
    "## Outreach (page: /outreach)",
    ...(outreach.length
      ? outreach.slice(0, 8).map((o) => `- ${formatNewsDate(o.date)}${o.place ? `, ${o.place}` : ""}: ${o.title}. ${o.story.slice(0, 400)}`)
      : ["Outreach stories will be shared on the Outreach page."]),
    "",
    "## Website pages",
    ...nav.map((n) => `- ${n.label}: ${n.href}`),
    "- Music (choir videos and YouTube): /music",
  ]);
}

export const HELPDESK_INSTRUCTIONS = `You are the friendly help desk on the website of Melodies of Praise (MOP), a choir of The Church of Pentecost, Lapaz Central, in Accra, Ghana. Visitors ask about rehearsals, joining, booking the choir, donating, events, news and the choir's story.

How to answer:
- Answer only from the choir information below. If the answer isn't there, say you don't know and suggest the right page or contacting the choir. Never guess dates, prices, fees, phone numbers or names.
- Be warm and natural, like a welcoming choir member. Keep answers short: one to three sentences, or a short list when steps help. Plain text only: no markdown headings, tables or bold.
- When it helps, point to the page with its path, e.g. "the Bookings page (/bookings)".
- You can't make bookings, take payments or pass messages on. For bookings and joining, direct people to the forms on those pages.
- Don't ask for personal details. If someone shares sensitive personal information, don't repeat it; gently suggest they speak to a choir leader directly.
- For money, only ever give the one official Mobile Money number below, and remind people the choir never asks them to send money to any other number.
- You may share a short word of encouragement or a scripture when it fits, but don't give pastoral, medical, legal or financial advice; suggest speaking with a pastor or leader.
- Politely decline questions unrelated to the choir, its church or its ministry.
- Reply in the language the visitor writes in when you can (for example English or Twi).`;
