#!/usr/bin/env node
// Zero-dependency sanity checks. Run: node scripts/check.mjs
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeFileSync, mkdtempSync } from "node:fs";

let fail = 0;
const ok = (m) => console.log("  ok  " + m);
const bad = (m) => { console.error("  FAIL " + m); fail++; };
const read = (f) => readFileSync(new URL("../" + f, import.meta.url), "utf8");

// 1. JSON files parse
for (const f of ["manifest.json", "version.json", "vercel.json", "package.json"]) {
  try { JSON.parse(read(f)); ok(f + " is valid JSON"); } catch (e) { bad(f + ": " + e.message); }
}

// 2. Inline <script> blocks parse as JavaScript
const html = read("index.html");
const dir = mkdtempSync(join(tmpdir(), "mbx-"));
let n = 0;
for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
  const f = join(dir, `inline${n++}.js`);
  writeFileSync(f, m[1]);
  try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); ok(`inline script #${n} parses`); }
  catch (e) { bad(`inline script #${n}: ` + String(e.stderr || e.message).split("\n").slice(0, 4).join(" | ")); }
}
if (!n) bad("no inline scripts found in index.html");

// 3. sw.js parses
try { execFileSync(process.execPath, ["--check", new URL("../sw.js", import.meta.url).pathname], { stdio: "pipe" }); ok("sw.js parses"); }
catch (e) { bad("sw.js: " + e.message); }

// 4. Version triple is in sync (BUILD in index.html == version.json.b)
const build = (html.match(/const BUILD="(\d+)"/) || [])[1];
const vj = JSON.parse(read("version.json")).b;
if (!build) bad("BUILD constant not found in index.html");
else if (build !== String(vj)) bad(`BUILD (${build}) != version.json (${vj})`);
else ok("BUILD matches version.json");
if (!/const V = "mbx-v\d+"/.test(read("sw.js"))) bad("sw.js cache name (mbx-vNN) not found"); else ok("sw.js cache name present");

// 5. Migrations: contiguous 0001..N, unique, .sql
const mig = readdirSync(new URL("../supabase/migrations/", import.meta.url)).filter((f) => f.endsWith(".sql")).sort();
mig.forEach((f, i) => {
  const want = String(i + 1).padStart(4, "0");
  if (!f.startsWith(want + "_")) bad(`migration #${i + 1} should start with ${want}_ (got ${f})`);
});
if (mig.length && !fail) ok(`${mig.length} migrations numbered contiguously`);

// 6. Referenced local assets exist
for (const f of ["icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/icon-maskable-512.png", "LICENSE", "README.md", "CHANGELOG.md"]) {
  existsSync(new URL("../" + f, import.meta.url)) ? ok(f + " exists") : bad(f + " missing");
}

// 7. No secret-looking keys committed (service role / secret keys)
const secret = /(sb_secret_[A-Za-z0-9_-]{10,}|service_role["']?\s*[:=]\s*["']eyJ|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/;
for (const f of ["index.html", "sw.js", "README.md"]) if (secret.test(read(f))) bad("possible secret in " + f);
ok("no secret patterns in main files");

console.log(fail ? `\n${fail} check(s) failed` : "\nAll checks passed");
process.exit(fail ? 1 : 0);
