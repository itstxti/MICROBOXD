#!/usr/bin/env node
// Collects series metadata from public DramaBox pages into a JSON file that the app can
// import (Settings -> Import series). Run it on YOUR computer (Node 18+), not on a server:
//
//   node scripts/import-dramabox.mjs --list /browse/498 --pages 3 --max 40
//   node scripts/import-dramabox.mjs --probe            # saves the raw page data for debugging
//   node scripts/import-dramabox.mjs --reset            # forget which series were already collected
//
// It remembers collected series in dramabox-seen.json, so every run gives NEW ones.
//
// Polite by design: identified user agent, one request every ~3 s, a hard cap, and it
// stops at the first 403/429 instead of trying to get around it. Metadata only (no covers).
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const BASE = process.env.DRAMABOX_BASE || "https://www.dramaboxapp.com";
const UA = "MicroboxdBot/0.1 (personal catalog helper; +https://github.com/itstxti/MICROBOXD)";
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms + Math.random() * 800));

class Blocked extends Error {}
async function page(path) {
  const r = await fetch(BASE + path, { headers: { "user-agent": UA, accept: "text/html" } });
  if (r.status === 403 || r.status === 429) throw new Blocked(`${r.status} on ${path}`);
  if (!r.ok) return null;
  return r.text();
}

const decode = (s) => String(s || "").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const clean = (s) => decode(s).replace(/\s+/g, " ").trim();
const nextData = (h) => { const m = h.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/); try { return m ? JSON.parse(m[1]) : null; } catch { return null; } };
const filmIds = (h) => [...new Set((h.match(/\/film\/(\d{6,})/g) || []).map((x) => x.replace("/film/", "")))];

// Walk the embedded JSON and find the object that looks like "this series": it has a name and an episode count.
function findSeries(root) {
  let best = null, bestScore = -1;
  (function walk(o, d) {
    if (!o || typeof o !== "object" || d > 14) return;
    if (!Array.isArray(o)) {
      const keys = Object.keys(o);
      const name = keys.find((k) => /^(book_?name|drama_?name|title|name)$/i.test(k) && typeof o[k] === "string" && o[k].length > 1);
      const eps = keys.find((k) => /(chapter|episode)s?_?(count|num|total)?$/i.test(k) && Number.isFinite(+o[k]) && +o[k] > 0);
      if (name && eps) {
        const score = keys.length + (keys.some((k) => /intro|synopsis|desc/i.test(k)) ? 20 : 0) + (keys.some((k) => /tag|label|type|genre/i.test(k)) ? 10 : 0);
        if (score > bestScore) { best = { o, name, eps }; bestScore = score; }
      }
    }
    for (const v of Object.values(o)) walk(v, d + 1);
  })(root, 0);
  return best;
}
const strList = (v) => (Array.isArray(v) ? v : []).map((x) => (typeof x === "string" ? x : x && (x.name || x.tagName || x.label || x.title))).filter((x) => typeof x === "string" && x.trim()).map(clean);

function parseFilm(id, html) {
  const url = `${BASE}/film/${id}`;
  const nd = nextData(html), f = nd && findSeries(nd.props || nd);
  let title, episodes, synopsis = "", tropes = [];
  if (f) {
    const o = f.o;
    title = clean(o[f.name]); episodes = +o[f.eps];
    const intro = Object.keys(o).filter((k) => /intro|synopsis|desc|summary/i.test(k) && typeof o[k] === "string").map((k) => o[k]).sort((a, b) => b.length - a.length)[0];
    synopsis = clean(intro || "");
    for (const k of Object.keys(o)) if (/tag|label|genre|categor|type/i.test(k)) tropes.push(...strList(o[k]));
  }
  // Fallbacks from the visible page when the embedded data has a different shape.
  if (!title) { const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/); title = h1 ? clean(h1[1].replace(/<[^>]+>/g, " ")) : ""; }
  if (!episodes) { const m = html.replace(/<[^>]+>/g, " ").match(/(\d+)\s+Episodes/i); episodes = m ? +m[1] : 0; }
  if (!synopsis) { const m = html.match(/<meta name="description" content="([^"]*)"/); synopsis = clean(m ? m[1] : "").replace(new RegExp("^" + title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*(Movie\\s*)?", "i"), "").replace(/\.\.\.$/, ""); }
  tropes = [...new Set(tropes)].slice(0, 12);
  return title && episodes ? { source: "dramabox", source_id: id, url, title, app: "DramaBox", episodes, tropes, synopsis } : null;
}

async function main() {
  if (args.includes("--probe")) {
    const html = await page("/film/41000119953");
    const nd = html && nextData(html);
    writeFileSync("dramabox-probe.json", JSON.stringify({ film: parseFilm("41000119953", html || ""), nextData: nd }, null, 1));
    console.log("Saved dramabox-probe.json. Parsed:", parseFilm("41000119953", html || ""));
    return;
  }
  const SEEN = "dramabox-seen.json";
  const seen = new Set(!args.includes("--reset") && existsSync(SEEN) ? JSON.parse(readFileSync(SEEN, "utf8")) : []);
  const lists = [].concat(opt("list", "/more/trending")), pages = +opt("pages", 8), max = +opt("max", 30);
  const ids = [], fresh = () => ids.filter((i) => !seen.has(i));
  console.log(`${seen.size} series already collected in earlier runs (skipped).`);
  for (const l of lists) for (let p = 1; p <= pages && fresh().length < max; p++) {
    const h = await page(p === 1 ? l : `${l}${l.includes("?") ? "&" : "?"}page=${p}`);
    if (!h) break;
    const before = ids.length;
    for (const id of filmIds(h)) if (!ids.includes(id)) ids.push(id);
    console.log(`${l} page ${p}: +${ids.length - before} series`);
    if (ids.length === before) break; // no new series: no more pages
    await sleep(3000);
  }
  const out = [];
  try {
    for (const id of fresh().slice(0, max)) {
      const h = await page("/film/" + id);
      const it = h && parseFilm(id, h);
      if (it) { out.push(it); seen.add(id); console.log(`  ${out.length}. ${it.title} (${it.episodes} ep, ${it.tropes.join("/") || "no tags"})`); }
      else console.log("  skipped", id);
      await sleep(3000);
    }
  } catch (e) {
    if (e instanceof Blocked) console.log("\nThe site refused a request (" + e.message + "). Stopping; saving what was collected.");
    else throw e;
  }
  writeFileSync("dramabox-import.json", JSON.stringify(out, null, 1));
  writeFileSync(SEEN, JSON.stringify([...seen]));
  console.log(`\nSaved ${out.length} NEW series to dramabox-import.json. Import it from the app: Settings -> Import series.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
