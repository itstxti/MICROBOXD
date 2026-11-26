#!/usr/bin/env node
// Fills "cover" (data URL) from "cover_url" for every JSON in imports\sin-cover
// and writes the result to imports\concover (same file name).
//   node scripts/fill-covers.mjs                 -> all .json files in sin-cover
//   node scripts/fill-covers.mjs netshort.json   -> only that file (name inside sin-cover)
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, basename } from "node:path";

const IN_DIR = "C:\\Users\\Usuario-\\Documents\\app\\MICROBOXD\\imports\\sin-cover";
const OUT_DIR = "C:\\Users\\Usuario-\\Documents\\app\\MICROBOXD\\imports\\concover";
mkdirSync(IN_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const UA = "MicroboxdBot/0.1 (personal catalog helper; +https://github.com/itstxti/MICROBOXD)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms + Math.random() * 400));

const arg = process.argv[2];
const files = arg
  ? [basename(arg)]
  : readdirSync(IN_DIR).filter((f) => /\.json$/i.test(f)).sort();

if (!files.length) {
  console.log(`No hay archivos .json en ${IN_DIR}\nPon ahí los JSON descargados y vuelve a ejecutar.`);
  process.exit(0);
}

let stop = false;
for (const file of files) {
  if (stop) break;
  const inPath = join(IN_DIR, file);
  if (!existsSync(inPath)) { console.log(`No existe: ${inPath}`); continue; }
  const outPath = join(OUT_DIR, file);
  console.log(`\n=== ${file} ===`);

  const items = JSON.parse(readFileSync(inPath, "utf8"));
  let ok = 0, skipped = 0;
  const failed = [];

  for (const it of items) {
    if (it.cover) { skipped++; continue; }
    if (!it.cover_url) { failed.push(it.title + " (sin cover_url)"); continue; }
    try {
      const origin = new URL(it.url || it.cover_url).origin;
      const r = await fetch(it.cover_url, { headers: { "user-agent": UA, accept: "image/*", referer: origin + "/" } });
      if (r.status === 403 || r.status === 429) {
        console.log(`El servidor de imágenes respondió ${r.status}. Paro aquí y guardo lo conseguido.`);
        stop = true;
        break;
      }
      const type = (r.headers.get("content-type") || "").split(";")[0];
      if (!r.ok || !type.startsWith("image/")) throw new Error(`HTTP ${r.status} ${type}`);
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length > 2_000_000) throw new Error("más de 2 MB");
      it.cover = `data:${type};base64,${buf.toString("base64")}`;
      it.cover_url = "";
      ok++;
      console.log(`OK  ${it.title} (${Math.round(buf.length / 1024)} KB)`);
    } catch (e) {
      failed.push(`${it.title} (${e.message})`);
      console.log(`ERR ${it.title}: ${e.message}`);
    }
    await sleep(800);
  }

  writeFileSync(outPath, JSON.stringify(items, null, 1));
  console.log(`${ok} descargadas, ${skipped} ya tenían portada, ${failed.length} fallidas.`);
  if (failed.length) console.log("Fallidas:\n - " + failed.join("\n - "));
  console.log(`Guardado en ${outPath}`);
}
console.log("\nListo. Importa los archivos de imports\\concover en Settings -> Import series.");