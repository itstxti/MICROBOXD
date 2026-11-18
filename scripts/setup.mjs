#!/usr/bin/env node
// Point your copy of Microboxd at YOUR Supabase project.
// Usage: node scripts/setup.mjs <project-url> <publishable-key>
import { readFileSync, writeFileSync } from "node:fs";

const [url, key] = process.argv.slice(2);
if (!url || !key) {
  console.error("Usage: node scripts/setup.mjs https://<ref>.supabase.co <publishable-or-anon-key>");
  process.exit(1);
}
if (!/^https:\/\/[a-z0-9]{10,30}\.supabase\.co\/?$/.test(url)) { console.error("That doesn't look like a Supabase project URL (https://<ref>.supabase.co)."); process.exit(1); }
if (/service_role|sb_secret_/.test(key)) { console.error("That is a SECRET key. Use the publishable (or legacy anon) key — never ship a secret key in a web app."); process.exit(1); }
if (!/^(sb_publishable_[\w-]+|eyJ[\w-]+\.[\w-]+\.[\w-]+)$/.test(key)) { console.error("Key format not recognised (expected sb_publishable_… or a legacy anon JWT)."); process.exit(1); }

const file = new URL("../index.html", import.meta.url);
const src = readFileSync(file, "utf8");
const re = /const SB_URL="[^"]*",SB_KEY="[^"]*";/;
if (!re.test(src)) { console.error("Could not find the SB_URL/SB_KEY line in index.html."); process.exit(1); }
writeFileSync(file, src.replace(re, () => `const SB_URL="${url.replace(/\/$/, "")}",SB_KEY="${key}";`));
console.log("index.html now points at " + url.replace(/\/$/, ""));
console.log("Next: apply supabase/migrations/*.sql in order (SQL editor, or `supabase db push`), then `npx serve .`");
