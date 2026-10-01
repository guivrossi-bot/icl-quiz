# ICL Quiz — "Could you pass a shop floor audit?"

A 15-question industrial cutting quiz (plasma / laser / waterjet / decision) that
feeds the Industrial Cutting Processes newsletter and ICL. EN / PT-BR / ES.

Built to match the other ICL apps: **Vite + React 19 (plain JSX) + Supabase +
Vercel Analytics** — not Next.js. (The brief allowed following the existing apps'
tooling; they are all Vite.) The two things the brief wanted from Next.js — the OG
image and the server-rendered share page — are done with **Vercel serverless/edge
functions** under `api/`.

## Stack & layout

```
content/questions.json     15 questions, 3 languages (content source of truth)
shared/                    framework-free modules used by BOTH the SPA and the API
  content.js               bands, block labels, card strings, weakest-block routing, tokens
  scoring.js               score-code encode/decode + validation, weakest block
  links.js                 ALL outbound links (swap TODOs here)
src/                       the React SPA ( / and /quiz )
  components/              StartScreen, Quiz, Results, ShareCard (SVG preview), LangSwitcher
  lib/                     i18n, supabase client, anonymous tracker
api/
  og.js                    edge: 1200×627 PNG share card  (@vercel/og)
  r/[code].js              node: server-rendered /r/<code> page with OG/Twitter meta
supabase/schema.sql        tables + RLS + analytics views
```

## Routes

- `/` — start screen. Language: `?lang=` → `Accept-Language` (pt*/es*) → `en`.
- `/quiz` — the 15-question flow (client state in memory), ending in the result screen.
- `/r/<code>?lang=` — shareable result page. `code = total-plasma-laser-waterjet-decision`
  (e.g. `/r/11-4-2-3-2?lang=pt`). Invalid codes redirect to `/`.
- `/api/og?code=&lang=` — the PNG share card (also previewed in-page on the result screen).

## Local dev

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase values (see below)
npm run dev                  # SPA on http://localhost:5173
```

The `/api/*` routes only run on Vercel (or `vercel dev`). The SPA works without them;
without Supabase env the quiz still runs and analytics simply no-op.

## Environment

Use the **same Supabase project** as the other ICL apps. Put these in `.env.local`
(local) and in the Vercel project settings (Production):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL` = `https://quiz.industrialcuttinglabs.com` (used to build absolute
  share/OG URLs; the `/r` function also reads this server-side)

## Supabase

Run `supabase/schema.sql` once in the shared project. It creates `quiz_answers` and
`quiz_completions`, enables RLS (anon = insert-only, plus the one blind `update` to
flag `shared`), and adds `quiz_question_stats` (the "68% missed this one" view) and
`quiz_completion_stats`.

## Deploy (Vercel)

1. New Vercel project from this repo (framework auto-detects as **Vite**).
2. Add the three env vars above (Production + Preview).
3. Map the domain `quiz.industrialcuttinglabs.com`.
4. After launch, run the shared URL through the **LinkedIn Post Inspector** so it
   caches the per-score card.

## Still needs Gui (see brief §14)

- **`public/images/p1-dross.jpg`** — the P1 field photo (P1 renders without it, but
  add before launch). See `public/images/README.md`.
- **TODO link URLs** in `shared/links.js`: Plasma 101 Parts 2–5, Plasma 101 /
  Waterjet 101 Part 1, and "Buying a Solution, or a Future Problem?". They fall back
  to the newsletter page until filled.
- **Confirm the tool URLs** in `shared/links.js` (`TOOLS`): `cutbench` is confirmed
  at `/labs/cutbench`; double-check `ignite` and `jetcalc` paths.
- Review PT/ES technical terms; set a target quarter for Laser 101 (the "coming soon"
  badge).
