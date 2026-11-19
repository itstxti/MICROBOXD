# Contributing to Microboxd

Thanks for helping! Microboxd is intentionally small: **plain HTML + one CSS file + vanilla JS files, no build step**, plus Supabase for the backend. Please keep it that way.

`js/*.js` are classic scripts that share one global scope and are loaded **in the order listed in `index.html`**. Top-level code runs at load, so keep that order when adding files.

## Run it locally
```bash
git clone https://github.com/itstxti/microboxd.git
cd microboxd
npm run dev        # = npx serve .  → http://localhost:3000
```
By default the app talks to the public demo backend. To use your own, see [Self-hosting](README.md#self-hosting).

## Before you open a PR
```bash
npm run check      # = node scripts/check.mjs (the same thing CI runs)
```
It validates JSON, that every `js/*.js` parses, that `BUILD` (in `js/runtime.js`) ↔ `version.json` agree, that assets are versioned and pre-cached in `sw.js`, migration numbering, and that no secret key is committed.

## Guidelines
- **Mobile first.** Desktop (≥1024px) is CSS-only inside `@media (min-width:1024px)` in `css/app.css`; don't change mobile pixels when working on desktop.
- **i18n.** Every user-facing string needs Spanish and English: `L2("es","en")` in templates, or an entry in the `D` map for plain strings.
- **Database changes** go in a new `supabase/migrations/NNNN_name.sql` (next number, never edit an applied one) and must keep RLS on.
- **Never commit secrets.** Only the *publishable* key belongs in the client. If you find a leaked secret key, see [SECURITY.md](SECURITY.md).
- Don't bump `BUILD`, `version.json` or the `sw.js` cache name in your PR; maintainers do that when releasing. New `css/`/`js/` files must be added to `index.html` and to `SHELL` in `sw.js` (`npm run check` tells you).
- Keep PRs focused; one change per PR. Describe what you tested and on which screen sizes.
- Use clear commit messages (`Fix: …`, `Add: …`).

## Reporting bugs / ideas
Use the issue templates. Screenshots (mobile and desktop) help a lot.

By contributing you agree your work is released under the [MIT License](LICENSE).
