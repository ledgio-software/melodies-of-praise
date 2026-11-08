# Melodies of Praise: choir website

Official website of **Melodies of Praise (MOP)**, The Church of Pentecost, Lapaz Central.
Built with Next.js and deployed on Vercel.

## Pages
Home · About (history, milestones, mission & vision, leadership) · News · Music · Events · Outreach · Gallery ·
Join Us (form) · Bookings (form) · Donate (MTN MoMo) · Contact (map), plus the “Ask MOP” AI help desk on every page

## Admin dashboard (`/admin`)
The publicity team manages the site at **/admin**, from a phone or computer:

| Section | What it does |
|---|---|
| Inbox | Booking requests and Join Us applications from the website, with one-tap WhatsApp / call / email replies |
| News | Write posts with a cover photo; publish, keep as draft, or schedule for a future date. Shown at /news, one page per story, latest three on the home page |
| Events | Add, edit, delete events (past ones move to “Recent” automatically) |
| Outreach | Community outreach stories with several photos each, shown at /outreach |
| Photos & slideshow | Upload photos (resized in the browser), choose slideshow / gallery, reorder, pick the page-banner photo |
| Leaders | Names, titles, portraits and order on the About page |
| Music videos | Paste a YouTube link to feature it on the Music page |
| Site settings | Rehearsal time, contact details, social links, MoMo details, Join requirements |
| Team & logins | Admins add or remove team members and reset passwords (editors can’t) |

Changes appear on the website immediately.

### One-time setup in Vercel
1. **Storage → Create Database → Neon** (free) → connect to this project. This sets `DATABASE_URL`.
2. **Storage → Create → Blob** → connect to this project. This sets `BLOB_READ_WRITE_TOKEN`.
3. **Settings → Environment Variables** → add `ADMIN_SETUP_CODE` (a long secret phrase).
4. **Redeploy**, open `/admin/setup`, enter the setup code and create the first admin account.
5. Add the rest of the team under **Team & logins**.

On first connection the database fills itself from `src/content/site.ts`, so the site looks the same as before.
Until a database is connected, the public site keeps using `src/content/site.ts` and `/admin` shows these setup steps.

### How it works
- Content, logins and form submissions live in Postgres (`src/lib/db.ts` creates the tables automatically).
- Passwords are hashed with scrypt; sessions are random tokens in an http-only cookie (14 days).
  Failed logins are limited to 8 per email per 15 minutes.
- Every server action checks the signed-in user (`requireUser`); the Team page requires the admin role.
- If the database is ever unreachable, the public site falls back to `src/content/site.ts` instead of failing.

## Static content
Text that rarely changes (history, mission, vision, milestones, scripture) stays in `src/content/site.ts`.
**Colours** are tokens at the top of `src/app/globals.css` (maroon `#670B20` from the official logo, black and white). Logo files live in `public/brand/`.

## Forms (Bookings & Join Us)
Submissions are saved to the dashboard Inbox when the database is connected. Optionally, a copy is emailed via
[Resend](https://resend.com) when `RESEND_API_KEY` and `ENQUIRY_TO_EMAIL` are set. If neither is available,
the forms open WhatsApp with the details pre-filled (needs a WhatsApp number in Site settings).

## AI help desk (“Ask MOP”)
A chat button on every page answers visitors' questions using **Claude (Anthropic)**, from the website's own
public content only (rehearsals, joining, bookings, donating, leaders, events, news, outreach). It's built in
`src/lib/helpdesk.ts` (what it knows and how it answers) and `src/app/api/helpdesk/route.ts`.

- **Turn it on:** create an API key at [console.anthropic.com](https://console.anthropic.com), set a monthly
  spend limit there, then add `ANTHROPIC_API_KEY` in Vercel → Settings → Environment Variables and redeploy.
  The button stays hidden until the key is set. `HELPDESK_MODEL` optionally changes the model.
- **Privacy:** chats aren't stored. Nothing from the database that isn't already on the public website is sent.
  For rate limiting, only a one-way hash of the visitor's IP address and the time are kept, for one day.
  Data sent through the Anthropic API isn't used to train their models by default (see Anthropic's commercial terms).
- **Cost limits:** 20 questions per visitor per 30 minutes and 600 per day across the site (`HELPDESK_LIMITS`).

## Deploying to Vercel
1. On vercel.com → **Add New → Project** → import `ledgio-software/melodies-of-praise`.
2. Framework is detected as Next.js; keep defaults and click **Deploy**.
3. Every push to `main` redeploys automatically; pull requests get preview links.
4. Once a custom domain is attached, update `site.url` in `src/content/site.ts`.

## Local development
```bash
npm install
LOCAL_DB=pglite ADMIN_SETUP_CODE=local-setup-code npm run dev
```
`LOCAL_DB=pglite` runs a real Postgres inside Node (stored in `.pglite/`), and uploads go to `public/uploads/`; both are git-ignored.
