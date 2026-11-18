<div align="center">

# Microboxd

**A Letterboxd-style diary for AI micro-series: log, rate, review and share what you watch.**

[**Live demo →**](https://microboxd.vercel.app) · [Changelog](CHANGELOG.md) · [Contributing](CONTRIBUTING.md) · [Español](README.es.md)

[![CI](https://github.com/itstxti/microboxd/actions/workflows/ci.yml/badge.svg)](https://github.com/itstxti/microboxd/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

<img src="docs/demo.gif" alt="Microboxd demo: browsing series, a series page, profile" width="300">

</div>

Microboxd is an installable PWA for people who binge vertical micro-series (DramaBox, ReelShort, ShortMax…). Keep a diary with half-star ratings, rewatches and spoiler-safe reviews, build lists, follow friends and see their activity. Mobile-first, with a full desktop layout.

**No build step, no framework:** the whole app is one `index.html` (vanilla JS) on top of [Supabase](https://supabase.com) (Auth, Postgres with Row Level Security, Storage).

## Quick start (one command)
```bash
npx degit itstxti/microboxd microboxd && npx serve microboxd
```
Open http://localhost:3000. Out of the box it connects to the **shared public demo backend**, so you can try it immediately; please be kind with the data. To run your own backend, see below.

## Features
- Diary with multiple logs per series, half-star ratings, likes, rewatches, reviews with spoiler hiding
- Watchlist, lists (with tags and likes), four favourites on your profile
- Social: public profiles, follow, friends' activity feed, member search
- Stats: rating histogram, averages, totals
- Filters and sorting (Explore, Series, Watchlist, Likes), saved between sessions
- Series form with theme chips, ordered cast, custom platforms
- Spanish / English, installable PWA with automatic updates, desktop layout (≥1024px)

## Self-hosting
1. Create a free project at [supabase.com](https://supabase.com).
2. Apply `supabase/migrations/0001…` to the latest, **in order** (SQL editor, or `supabase link` + `supabase db push`).
3. Point the app at your project (use the **publishable** key, never a secret key):
   ```bash
   node scripts/setup.mjs https://<your-ref>.supabase.co <publishable-key>
   ```
4. Supabase → *Authentication → URL Configuration*: set **Site URL** to your domain and add `http://localhost:3000` to *Redirect URLs*. For production configure a custom SMTP (the built-in one is heavily rate-limited), or disable "Confirm email" while testing.
5. Deploy the folder to any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages). `vercel.json` carries the security headers for Vercel.

> The publishable key is public by design; all access is enforced by the RLS policies in `supabase/migrations/`.

## Architecture
| Path | What |
| --- | --- |
| `index.html` | The entire app (HTML, CSS, JS) |
| `sw.js`, `manifest.json`, `icons/` | PWA shell cache and install metadata (Supabase calls are never cached) |
| `version.json` | Build id polled by the app to prompt/apply updates |
| `supabase/migrations/` | Schema, RLS, storage bucket |
| `scripts/` | `check.mjs` (CI checks), `setup.mjs` (self-host config) |

## Development
```bash
npm run dev     # serve on :3000
npm run check   # same checks as CI
```
See [CONTRIBUTING.md](CONTRIBUTING.md). Security issues: [SECURITY.md](SECURITY.md).

## Notes
- The catalogue is loaded client-side (up to 1000 series). Past that, move search server-side (`pg_trgm` is enabled).
- Not affiliated with Letterboxd or any streaming platform. Demo data is fictional.

## License
[MIT](LICENSE)
