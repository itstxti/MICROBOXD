#!/usr/bin/env node
// Collects series (title, episodes, tags) from the public listing pages of narto-drama.com into a
// JSON file the app can import (Settings -> Import series). Run it on YOUR computer (Node 18+).
//
//   node scripts/import-narto.mjs --max 40
//   node scripts/import-narto.mjs --list /tag/romance --max 40 --app DramaBox
//   node scripts/import-narto.mjs --reset        # forget which series were already collected
//
// Everything needed is on the listing pages (server-rendered cards), so it makes one request per
// page of ~24 series, not one per series. Polite: identified user agent, ~3 s between requests,
// stops at the first 403/429. It avoids the paths robots.txt disallows (/search, ?q=, /e/, /go).
// It remembers collected series in narto-seen.json so every run gives NEW ones. Metadata only.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const BASE = process.env.NARTO_BASE || "https://narto-drama.com";
const UA = "MicroboxdBot/0.1 (personal catalog helper; +https://github.com/itstxti/MICROBOXD)";
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms + Math.random() * 800));
class Blocked extends Error {}

const decode = (s) => String(s || "").replace(/&quot;/g, '"').replace(/&#0?39;|&#x27;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const clean = (s) => decode(s).replace(/\s+/g, " ").trim();

async function page(path) {
  const r = await fetch(BASE + path, { headers: { "user-agent": UA, accept: "text/html" } });
  if (r.status === 403 || r.status === 429) throw new Blocked(`${r.status} on ${path}`);
  return r.ok ? r.text() : null;
}

// One <article class="card" data-movie-id=... data-movie-title=...> per series.
export function parseCards(html, app) {
  const out = [];
  const re = /<article\s+class="card"([\s\S]*?)<\/article>/g;
  let m;
  while ((m = re.exec(html))) {
    const b = m[0];
    const id = (b.match(/data-movie-id="(\d+)"/) || [])[1];
    let title = clean((b.match(/data-movie-title="([^"]*)"/) || [])[1]);
    if (/^".*"$/.test(title) && title.split('"').length === 3) title = title.slice(1, -1).trim(); // the site wraps some titles in quotes
    const eps = +((b.match(/episode-badge">\s*Ep:\s*(\d+)/i) || [])[1] || 0);
    const url = decode((b.match(/data-watch-url="([^"?]*)/) || [])[1] || "");
    const tropes = [...b.matchAll(/class="movie-tag[^"]*"[^>]*>\s*#?([^<]+?)\s*<\/a>/g)].map((x) => clean(x[1])).filter(Boolean);
    if (id && title && eps) out.push({ source: "narto", source_id: id, url, title, app, episodes: eps, tropes: [...new Set(tropes)].slice(0, 12), synopsis: "" });
  }
  return out;
}

async function main() {
  const SEEN = "narto-seen.json";
  const seen = new Set(!args.includes("--reset") && existsSync(SEEN) ? JSON.parse(readFileSync(SEEN, "utf8")) : []);
  const list = String(opt("list", "/")), pages = +opt("pages", 8), max = +opt("max", 30), app = String(opt("app", "Otra"));
  if (/^\/(search|e\/|go)|[?&]q=/.test(list)) { console.error("That path is disallowed by the site's robots.txt."); process.exit(1); }
  console.log(`${seen.size} series already collected in earlier runs (skipped).`);
  const out = [], got = new Set();
  try {
    for (let p = 1; p <= pages && out.length < max; p++) {
      const h = await page(p === 1 ? list : `${list}${list.includes("?") ? "&" : "?"}page=${p}`);
      if (!h) break;
      const cards = parseCards(h, app);
      const before = got.size;
      for (const c of cards) {
        if (got.has(c.source_id)) continue;
        got.add(c.source_id);
        if (!seen.has(c.source_id) && out.length < max) { out.push(c); seen.add(c.source_id); }
      }
      console.log(`${list} page ${p}: ${cards.length} cards, ${out.length} new so far`);
      if (got.size === before) break; // nothing new on this page: no more pages
      await sleep(3000);
    }
  } catch (e) {
    if (e instanceof Blocked) console.log("\nThe site refused a request (" + e.message + "). Stopping; saving what was collected.");
    else throw e;
  }
  writeFileSync("narto-import.json", JSON.stringify(out, null, 1));
  writeFileSync(SEEN, JSON.stringify([...seen]));
  console.log(`\nSaved ${out.length} NEW series to narto-import.json. Import it from the app: Settings -> Import series.`);
}
if (process.argv[1] && process.argv[1].endsWith("import-narto.mjs")) main().catch((e) => { console.error(e); process.exit(1); });
