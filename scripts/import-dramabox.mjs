(async () => {
  const MAX = 20, APP = "NetShort";
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms + Math.random() * 800));
  const abs = (u) => { try { return new URL(u, location.origin).href; } catch { return ""; } };
  const imgSrc = (img) => [img?.dataset?.src, img?.dataset?.lazySrc, img?.currentSrc, img?.getAttribute("src")].find((v) => v && !v.startsWith("data:")) || "";

  // 1) tarjetas = enlaces a /drama/... con imagen (sin repetir)
  const seen = new Set(), cards = [];
  for (const a of document.querySelectorAll("a[href*='/drama/']")) {
    const href = abs(a.getAttribute("href"));
    if (!href || /\/drama\/all-plots|\/drama\/?$/.test(href) || seen.has(href.split("?")[0])) continue;
    const img = a.querySelector("img") || a.closest("div,li,article")?.querySelector("img");
    if (!img) continue;
    seen.add(href.split("?")[0]);
    cards.push({ a, img, href });
  }
  console.log(cards.length + " tarjetas encontradas");
  if (!cards.length) { console.log("Nada encontrado. Pásame el HTML de UNA tarjeta (clic derecho > Inspeccionar > Copy outerHTML)."); return; }
  console.log("Ejemplo:", cards[0].a.outerHTML.slice(0, 600));

  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
  const getDetail = async (url) => {
    for (let i = 1; i <= 3; i++) {
      try {
        const r = await fetch(url);
        if (!r.ok) throw 0;
        const html = await r.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        let syn = "", via = "";
        // JSON-LD
        for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
          try { const j = JSON.parse(s.textContent); const arr = Array.isArray(j) ? j : [j];
            for (const o of arr) if (o?.description && clean(o.description).length > 30) { syn = clean(o.description); via = "ld+json"; } } catch {}
          if (syn) break;
        }
        // __NEXT_DATA__
        if (!syn) { try {
          const nd = JSON.parse(doc.querySelector("#__NEXT_DATA__")?.textContent || "null");
          const best = []; (function walk(o) { if (o && typeof o === "object") for (const k in o) {
            if (/^(intro|synopsis|description|summary|introduction|desc)$/i.test(k) && typeof o[k] === "string" && o[k].length > 30) best.push(o[k]); else walk(o[k]); } })(nd);
          if (best.length) { syn = clean(best.sort((a, b) => b.length - a.length)[0]); via = "next-data"; }
        } catch {} }
        if (!syn) { const v = doc.querySelector('meta[property="og:description"]')?.content; if (clean(v).length > 30) { syn = clean(v); via = "og"; } }
        if (!syn) { const v = doc.querySelector('meta[name="description"]')?.content; if (clean(v).length > 30) { syn = clean(v); via = "meta"; } }
        const title = clean(doc.querySelector('meta[property="og:title"]')?.content || doc.querySelector("h1")?.textContent);
        const og = doc.querySelector('meta[property="og:image"]')?.content || "";
        return { syn, via, title, og: abs(og) };
      } catch { await sleep(4000); }
    }
    return { syn: "", via: "error", title: "", og: "" };
  };

  const toData = async (src) => {
    if (!src) return "";
    try {
      const r = await fetch(src, { referrerPolicy: "no-referrer" });
      const b = await r.blob();
      if (!r.ok || b.size > 2e6 || !b.type.startsWith("image/")) return "";
      return await new Promise((res) => { const f = new FileReader(); f.onload = () => res(f.result); f.readAsDataURL(b); });
    } catch { return ""; }
  };

  const out = [];
  for (const c of cards.slice(0, MAX)) {
    const box = c.a.closest("div,li,article") || c.a;
    const txt = clean(box.textContent);
    const eps = +((txt.match(/(\d+)\s*(?:EP|Ep|ep|Episodes?|episodes?|集)/) || txt.match(/(?:EP|Ep|Episodes?)\.?\s*(\d+)/) || [0, 0])[1]);
    const poster = abs(imgSrc(c.img));
    const d = await getDetail(c.href.split("?")[0]);
    const title = d.title?.replace(/\s*[|\-–].*NetShort.*$/i, "") || clean(c.img.alt) || clean(c.a.getAttribute("title")) || txt.slice(0, 80);
    let cover = await toData(poster);
    if (!cover && d.og) cover = await toData(d.og);
    out.push({ source: "netshort", source_id: c.href.split("?")[0].split("/").pop(), url: c.href, title, app: APP, episodes: eps, tropes: [], synopsis: d.syn, cover, cover_url: cover ? "" : (poster || d.og) });
    console.log(`${out.length}/${Math.min(MAX, cards.length)} ${title}: ${d.syn ? "sinopsis OK (" + d.via + ")" : "SIN sinopsis"}, ${eps ? eps + " ep" : "SIN episodios"}, ${cover ? "portada OK" : "SIN portada (cover_url)"}`);
    await sleep(2500);
  }
  const l = document.createElement("a");
  l.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 1)], { type: "application/json" }));
  l.download = "netshort-import.json"; l.click();
  console.log("Listo.");
})();