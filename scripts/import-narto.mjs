#!/usr/bin/env node
// Collects series (title, episodes, tags) from the public listing pages of narto-drama.com into a
// JSON file the app can import (Settings -> Import series). Run it on YOUR computer (Node 18+).
//
//   node scripts/import-narto.mjs --max 40
//   node scripts/import-narto.mjs --provider reelshort --max 40   # only that provider's series
//   node scripts/import-narto.mjs --provider reelshort --max 20 --covers   # also download the posters
//
// The site checks that visitors are real browsers ("Checking your browser..."), which a script cannot
// pass honestly. So the reliable way is to SAVE the listing pages from your browser and read those files:
//   1. open narto-drama.com in your browser (pick a provider in its filter if you want one)
//   2. Ctrl+S -> "Webpage, complete" for page 1, then for page 2, 3... (keep each in a folder)
//   3. node scripts/import-narto.mjs --files "C:\\path\\to\\pages\\*.html" --app ReelShort --max 40 --covers
// Covers are read from the saved "_files" folders when they are there.
//
//   node scripts/import-narto.mjs --providers                     # list the provider names
//   node scripts/import-narto.mjs --list /tag/romance --max 40 --app DramaBox
//   node scripts/import-narto.mjs --reset        # forget which series were already collected
//
// Everything needed is on the listing pages (server-rendered cards), so it makes one request per
// page of ~24 series, not one per series. Polite: identified user agent, ~3 s between requests,
// stops at the first 403/429. It avoids the paths robots.txt disallows (/search, ?q=, /e/, /go).
// It remembers collected series in narto-seen.json so every run gives NEW ones. Metadata only.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, basename, join, extname } from "node:path";
let lastInfo = null;

const BASE = process.env.NARTO_BASE || "https://narto-drama.com";
const UA = "MicroboxdBot/0.1 (personal catalog helper; +https://github.com/itstxti/MICROBOXD)";
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms + Math.random() * 800));
class Blocked extends Error {}

// Providers offered by the site's own filter (?tab-provider=<slug>) -> platform name used in the app.
const PROVIDERS = { bibishort: "BibiShort", cubetv: "CubeTV", dramabite: "Dramabite", dramabox: "DramaBox", dramawave: "DramaWave", flickreels: "FlickReels", idrama: "iDrama", joyreels: "JoyReels", melolo: "Melolo", moviebox: "MovieBox", netshort: "NetShort", reelshort: "ReelShort", shortmax: "ShortMax", stardusttv: "StardustTV", storeel: "Storeel", vigloo: "Vigloo", anyreel: "AnyReel", bilitv: "BiliTV", candyjar: "CandyJar", cinerrashort: "CinerraShort", dotdrama: "DotDrama", dotdrama2: "DotDrama II", dramanova: "DramaNova", dramashine: "DramaShine", dramashorts: "DramaShorts", dramatv: "DramaTV", dreameshort: "DreameShort", flareflow: "FlareFlow", flextv: "FlexTV", freedrama: "FreeDrama", freereels: "FreeReels", fundrama: "Fun Drama", goodshort: "GoodShort", gorogoro: "GoroGoro", happyshort: "HappyShort", kalostv: "KalosTV", microdrama: "MicroDrama", minishorts: "MiniShorts", minutedrama: "MinuteDrama", moboreels: "MoboReels", mydrama: "My Drama", myrelle: "MyRelle", ohmytv: "OhMyTV", pinedrama: "PineDrama", playlet: "Playlet", rapidtv: "RapidTV", rapidtv2: "RapidTV II", raptdrama: "RaptDrama", reelala: "Reelala", reelbuzz: "ReelBuzz", reelife: "Reelife", sarostv: "SarosTV", serealplus: "SerealPlus", shortical: "Shortical", shortpeak: "ShortPeak", shortxdrama: "ShortXDrama", sixthshort: "SixthShort", solona: "Solona", starshort: "StarShort", storyreel: "StoryReel", topdrama: "TopDrama", velolo: "Velolo", vibeshort: "VibeShort", vidiodotcom: "VidioCom", vyntage: "Vyntage" };

const decode = (s) => String(s || "").replace(/&quot;/g, '"').replace(/&#0?39;|&#x27;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const clean = (s) => decode(s).replace(/\s+/g, " ").trim();

async function page(path) {
  const r = await fetch(BASE + path, { headers: { "user-agent": UA, accept: "text/html" } });
  if (r.status === 403 || r.status === 429) throw new Blocked(`${r.status} on ${path}`);
  const text = r.ok ? await r.text() : null;
  lastInfo = { status: r.status, type: r.headers.get("content-type"), finalUrl: r.url, text };
  return text;
}

// One <article class="card" data-movie-id=... data-movie-title=...> per series.
export function parseCards(html, app) {
  const out = [];
  const re = /<article\s+class="card(?:\s[^"]*)?"([\s\S]*?)<\/article>/g;
  let m;
  while ((m = re.exec(html))) {
    const b = m[0];
    const id = (b.match(/data-movie-id="(\d+)"/) || [])[1];
    let title = clean((b.match(/data-movie-title="([^"]*)"/) || [])[1]);
    if (/^".*"$/.test(title) && title.split('"').length === 3) title = title.slice(1, -1).trim(); // the site wraps some titles in quotes
    const eps = +((b.match(/episode-badge">\s*Ep:\s*(\d+)/i) || [])[1] || 0);
    const url = decode((b.match(/data-watch-url="([^"?]*)/) || [])[1] || "");
    const tropes = [...b.matchAll(/class="movie-tag[^"]*"[^>]*>\s*#?([^<]+?)\s*<\/a>/g)].map((x) => clean(x[1])).filter(Boolean);
    const poster = (b.match(/<img[^>]*class="poster"[^>]*\ssrc="([^"]+)"/) || b.match(/<img[^>]*\ssrc="([^"]+)"[^>]*class="poster"/) || [])[1];
    if (id && title && eps) out.push({ source: "narto", source_id: id, url, title, app, episodes: eps, tropes: [...new Set(tropes)].slice(0, 12), synopsis: "", poster: poster ? decode(poster) : "" });
  }
  return out;
}

// Downloads a poster and returns it as a data URL (the app converts it to JPEG on import). Skips big files.
function localCover(it) {
  if (!it._dir || !it.poster || /^(https?:)?\/\//.test(it.poster) || it.poster.startsWith("/")) return "";
  try {
    const f = join(it._dir, decodeURIComponent(it.poster.split("?")[0]));
    const type = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" }[extname(f).toLowerCase()];
    if (!type || !existsSync(f)) return "";
    const buf = readFileSync(f);
    return buf.length <= 2_000_000 ? `data:${type};base64,${buf.toString("base64")}` : "";
  } catch { return ""; }
}
function expandFiles(list) {
  const out = [];
  for (const a of list) {
    if (a.includes("*")) {
      const d = dirname(a), re = new RegExp("^" + basename(a).replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$", "i");
      try { out.push(...readdirSync(d).filter((f) => re.test(f)).sort().map((f) => join(d, f))); } catch {}
    } else out.push(a);
  }
  return out;
}
async function cover(src) {
  try {
    const r = await fetch(new URL(src, BASE), { headers: { "user-agent": UA, accept: "image/*" } });
    if (r.status === 403 || r.status === 429) throw new Blocked(`${r.status} on ${src}`);
    const type = (r.headers.get("content-type") || "").split(";")[0];
    if (!r.ok || !type.startsWith("image/")) return "";
    const buf = Buffer.from(await r.arrayBuffer());
    return buf.length <= 2_000_000 ? `data:${type};base64,${buf.toString("base64")}` : "";
  } catch (e) { if (e instanceof Blocked) throw e; return ""; }
}

async function main() {
  if (args.includes("--providers")) { console.log(Object.entries(PROVIDERS).map(([k, v]) => `${k.padEnd(14)} ${v}`).join("\n")); return; }
  const SEEN = "narto-seen.json";
  const seen = new Set(!args.includes("--reset") && existsSync(SEEN) ? JSON.parse(readFileSync(SEEN, "utf8")) : []);
  const fi = args.indexOf("--files");
  const fl = []; if (fi >= 0) for (const a of args.slice(fi + 1)) { if (a.startsWith("--")) break; fl.push(a); }
  const files = fi < 0 ? null : expandFiles(fl);
  const prov = opt("provider", null);
  if (prov && !PROVIDERS[String(prov).toLowerCase()]) { console.error(`Unknown provider "${prov}". Run with --providers to see the list.`); process.exit(1); }
  const slug = prov && String(prov).toLowerCase();
  const list = slug ? `/?tab-provider=${slug}` : String(opt("list", "/")), pages = +opt("pages", 8), max = +opt("max", 30);
  const app = String(opt("app", slug ? PROVIDERS[slug] : "Desconocido"));
  if (/^\/(search|e\/|go)|[?&]q=/.test(list)) { console.error("That path is disallowed by the site's robots.txt."); process.exit(1); }
  console.log(`${seen.size} series already collected in earlier runs (skipped).`);
  const out = [], got = new Set();
  if (files) {
    if (!files.length) { console.error("No files found for --files."); process.exit(1); }
    for (const f of files) {
      const h = readFileSync(f, "utf8");
      const cards = parseCards(h, app);
      cards.forEach((c) => (c._dir = dirname(f)));
      let added = 0;
      for (const c of cards) {
        if (got.has(c.source_id)) continue;
        got.add(c.source_id);
        if (!seen.has(c.source_id) && out.length < max) { out.push(c); seen.add(c.source_id); added++; }
      }
      console.log(`${basename(f)}: ${cards.length} cards, ${added} new`);
      if (!cards.length) console.log("  (no series found; was this saved from the listing page, after the page finished loading?)");
    }
  } else try {
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
      if (!cards.length && lastInfo) {
        writeFileSync("narto-debug.html", h);
        const t = (h.match(/<title>([^<]*)/) || [])[1];
        console.log(`  DEBUG: HTTP ${lastInfo.status}, ${lastInfo.type}, ${h.length} bytes, title: ${t ? t.trim() : "(none)"}`);
        console.log(`  DEBUG: final URL ${lastInfo.finalUrl}; <article> tags: ${(h.match(/<article/g) || []).length}; data-movie-id: ${(h.match(/data-movie-id/g) || []).length}`);
        console.log("  Saved the page as narto-debug.html (send it to Claude if it is not obvious).");
      }
      if (got.size === before) break; // nothing new on this page: no more pages
      await sleep(3000);
    }
  } catch (e) {
    if (e instanceof Blocked) console.log("\nThe site refused a request (" + e.message + "). Stopping; saving what was collected.");
    else throw e;
  }
  if (args.includes("--covers")) {
    try {
      let n = 0;
      for (const it of out) {
        if (!it.poster) continue;
        it.cover = localCover(it);
        if (!it.cover && !files) { it.cover = await cover(it.poster); await sleep(1000); }
        else if (!it.cover && files && /^https?:\/\//.test(it.poster)) { it.cover = await cover(it.poster); await sleep(1000); }
        if (it.cover) n++;
      }
      console.log(`Downloaded ${n} of ${out.length} covers.`);
    } catch (e) {
      if (e instanceof Blocked) console.log("\nThe image server refused a request (" + e.message + "). Keeping the covers downloaded so far.");
      else throw e;
    }
  }
  out.forEach((it) => { delete it.poster; delete it._dir; });
  writeFileSync("narto-import.json", JSON.stringify(out, null, 1));
  writeFileSync(SEEN, JSON.stringify([...seen]));
  console.log(`\nSaved ${out.length} NEW series to narto-import.json. Import it from the app: Settings -> Import series.`);
}
if (process.argv[1] && process.argv[1].endsWith("import-narto.mjs")) main().catch((e) => { console.error(e); process.exit(1); });
