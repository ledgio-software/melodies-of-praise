# Melodies of Praise: choir website

Official website of **Melodies of Praise (MOP)**, The Church of Pentecost, Lapaz Central.
Built with Next.js and deployed on Vercel.

## Pages
Home · About (history, milestones, mission & vision, leadership) · Music · Events · Gallery ·
Join Us (form) · Bookings (form) · Give (MTN MoMo) · Contact (map)

## Updating content
Nearly everything the publicity team sends goes into **one file: `src/content/site.ts`**.

| To add… | Do this |
|---|---|
| An event | Add `{ title, date: "2026-12-20", time, venue, description }` to `events`. Past events move to “Recent” automatically. |
| A YouTube video | Add `{ youtubeId, title }` to `videos` (the ID is the part after `watch?v=`). |
| Photos | Put files in `public/photos/`, then add `{ src: "/photos/name.jpg", alt }` to `photos`. |
| Home page slideshow | Add 3–6 wide photos to `heroSlides` (same format). If empty, the first five gallery photos slide instead. |
| A leader | Add `{ name, title, photo }` to `leaders` (photo in `public/photos/leaders/`). |
| Contact details | Fill `contact.phone`, `contact.whatsapp` (e.g. `233240000000`), `contact.email`. |
| Join requirements | Fill `join.minimumAge`, `join.monthlyDues`, `join.probation`. |

Anything left `null` or empty is hidden. **Colours** are tokens at the top of `src/app/globals.css` (brand colours: maroon `#670B20` from the official logo, black and white). Logo files live in `public/brand/`.

## Forms (Bookings & Join Us)
Submissions are emailed via [Resend](https://resend.com) when these Vercel environment variables are set:
`RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL` (see `.env.example`).
Until then, the forms open WhatsApp with the details pre-filled (needs `contact.whatsapp`).

## Deploying to Vercel
1. On vercel.com → **Add New → Project** → import `ledgio-software/melodies-of-praise`.
2. Framework is detected as Next.js; keep defaults and click **Deploy**.
3. Every push to `main` redeploys automatically; pull requests get preview links.
4. Once a custom domain is attached, update `site.url` in `src/content/site.ts`.

## Local development
```bash
npm install
npm run dev
```
