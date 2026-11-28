// Importador de FlickReels para MICROBOXD (se ejecuta en la consola del navegador).
//   1. Abre https://www.flickreels.net/classify
//   2. F12 > Consola, pega este archivo entero y pulsa Enter.
//   3. La primera vez deja TEST = true y revisa el JSON. Si está bien, pon TEST = false.
// Parar: window.__stop = true          Volver a bajar lo de esta sesión: window.__redescargar()
// Olvidar lo ya recogido: localStorage.removeItem("frl_seen")
// Para un género: abre su listado (/classify/{género}/{id}/1) y ejecuta ahí el script; usa la ruta de la pestaña.
(async () => {
  const TEST = true;            // true: solo 3 series, no recuerda nada
  const START = 1, END = 20;    // rango de páginas (si END supera el total, se recorta solo)
  const LIST = location.pathname.replace(/\/\d+\/?$/, "").replace(/\/$/, "") || "/classify"; // listado actual (sin nº de página)
  const CHUNK = 10;             // cada cuántas páginas se descarga un archivo
  const CONC = 2;               // peticiones a la vez (no subas esto)
  const PAUSE = 800;            // ms de pausa entre peticiones
  const SKIP_DUBBED = true;    // true: omite las versiones "(Dubbed)"
  const MAX_FAILS = 6;          // fallos seguidos antes de parar
  const MAX_FILE = 300;         // la app ignora sin avisar lo que pase de 300 por archivo
  const APP = "FlickReels";

  if (!/(^|\.)flickreels\.net$/.test(location.hostname)) { console.error("Ejecuta esto en https://www.flickreels.net" + LIST); return; }
  if (window.__frlRunning) { console.warn("Ya hay una importación en marcha. Para pararla: window.__stop = true"); return; }
  window.__frlRunning = true;
  window.__stop = false;

  // ── cuadro de progreso (cuelga de <html>, se re-monta si la web lo borra) ──
  document.getElementById("__box")?.remove();
  const box = document.createElement("pre");
  box.id = "__box";
  Object.assign(box.style, { position: "fixed", top: "0", left: "0", zIndex: 2147483647, background: "#000", color: "#0f0", font: "12px monospace", padding: "8px", maxWidth: "70vw", maxHeight: "40vh", overflow: "auto", margin: 0, whiteSpace: "pre-wrap" });
  const mount = () => { if (!box.isConnected) document.documentElement.appendChild(box); };
  mount();
  const mounter = setInterval(mount, 1000);
  const baseTitle = document.title;
  const log = (...a) => {
    const line = a.join(" ");
    console.log(line);
    box.textContent += line + "\n";
    box.scrollTop = box.scrollHeight;
    document.title = "[" + line.slice(0, 40) + "] " + baseTitle;
  };

  // ── utilidades ──
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms + Math.random() * 400));
  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
  const abs = (u) => { try { return u ? new URL(u, location.origin).href : ""; } catch { return ""; } };
  const uniq = (a) => [...new Map(a.map((x) => [x.toLowerCase(), x])).values()];
  const isTag = (t) => t && t.length <= 40 && !/^(all|more|browse|\d+)$/i.test(t);

  const imgSrc = (img) => {
    if (!img) return "";
    const raw = [img.getAttribute("data-src"), img.getAttribute("data-lazy-src"), img.getAttribute("src"), img.getAttribute("srcset")?.trim().split(/\s+/)[0]]
      .find((v) => v && !v.startsWith("data:"));
    const url = abs(raw);
    try { const u = new URL(url); if (u.pathname === "/_next/image") return abs(u.searchParams.get("url")); } catch {}
    return url;
  };

  const EPS = /(\d{1,4})\s*(?:Episodes?|EPs?|Eps)\b/i;
  const PL = /\/playlist\/[^/]+\/(\d+)/;
  const plId = (href) => { try { return (new URL(href, location.origin).pathname.match(PL) || [])[1] || ""; } catch { return ""; } };
  const epsIn = (root) => { const m = clean(root.textContent).match(EPS); return m ? +m[1] : 0; };
  const maxEpLink = (root) => Math.max(0, ...[...root.querySelectorAll('a[href*="/episode-"]')].map((a) => +((a.getAttribute("href").match(/\/episode-(\d+)/) || [0, 0])[1])));

  // ── datos embebidos (Next/Nuxt/JSON-LD), indexados por id de serie ──
  const embedded = (doc) => {
    const out = new Map();
    const roots = [];
    for (const s of doc.querySelectorAll('script#__NEXT_DATA__, script#__NUXT_DATA__, script[type="application/ld+json"], script[type="application/json"]')) {
      try { roots.push(JSON.parse(s.textContent)); } catch {}
    }
    const pick = (o, keys) => keys.map((k) => o[k]).find((v) => v !== undefined && v !== null && v !== "");
    const stack = [...roots];
    while (stack.length) {
      const o = stack.pop();
      if (!o || typeof o !== "object") continue;
      for (const v of Object.values(o)) if (v && typeof v === "object") stack.push(v);
      const id = String(pick(o, ["playlist_id", "playlistId", "series_id", "seriesId", "id"]) ?? "");
      if (!/^\d{3,}$/.test(id)) continue;
      const title = clean(pick(o, ["title", "name", "playlist_name", "playletName"]));
      if (!title) continue;
      const r = out.get(id) || { title: "", syn: "", eps: 0, tags: [], poster: "" };
      const syn = clean(pick(o, ["introduction", "intro", "synopsis", "description", "desc", "summary"]));
      const tags = pick(o, ["tags", "labels", "genres", "tag_list", "category_names"]);
      r.title ||= title;
      if (syn.length > r.syn.length) r.syn = syn;
      r.eps ||= Math.max(0, parseInt(pick(o, ["episodeCount", "episode_count", "total_episodes", "totalEpisodes", "chapter_count", "numberOfEpisodes"]), 10) || 0);
      r.poster ||= abs(typeof (pick(o, ["cover", "cover_url", "coverUrl", "poster", "image"])) === "string" ? pick(o, ["cover", "cover_url", "coverUrl", "poster", "image"]) : "");
      if (Array.isArray(tags)) r.tags = uniq([...r.tags, ...tags.map((t) => clean(typeof t === "string" ? t : t?.name || t?.tag_name)).filter(isTag)]);
      out.set(id, r);
    }
    return out;
  };

  // ── listado: una tarjeta por id, sin depender de clases CSS ──
  const parseList = (doc) => {
    const data = embedded(doc);
    const byId = new Map();
    for (const a of doc.querySelectorAll("a[href]")) {
      const id = plId(a.getAttribute("href"));
      if (id) byId.set(id, [...(byId.get(id) || []), a]);
    }
    const onlyThis = (node, id) => [...node.querySelectorAll("a[href]")].every((x) => ["", id].includes(plId(x.getAttribute("href"))));
    const cards = [];
    for (const [id, links] of byId) {
      let card = links[0];
      while (!card.querySelector("img") && card.parentElement && card.parentElement !== doc.body && onlyThis(card.parentElement, id)) card = card.parentElement;
      const img = card.querySelector("img");
      if (!img) continue;
      const rec = data.get(id) || { title: "", syn: "", eps: 0, tags: [], poster: "" };
      const titleLink = links.find((a) => !a.querySelector("img") && clean(a.textContent) && !EPS.test(clean(a.textContent)));
      cards.push({
        id,
        url: abs(links[0].getAttribute("href")).split(/[?#]/)[0],
        title: rec.title || clean(titleLink?.textContent) || clean(img.getAttribute("alt")),
        eps: rec.eps || epsIn(card),
        syn: rec.syn,
        tags: rec.tags,
        poster: imgSrc(img) || rec.poster,
      });
    }
    return cards;
  };

  // ── paginación: se deduce de los enlaces del propio paginador ──
  let pageTpl = null; // función p -> URL
  const pagerLinks = (doc) => [...doc.querySelectorAll("a[href]")].map((a) => {
    try {
      const u = new URL(a.getAttribute("href"), location.origin);
      if (u.origin !== location.origin || !u.pathname.startsWith("/classify")) return null;
      const m = u.pathname.match(/^(.*\/)(\d+)\/?$/);
      if (m) return { n: +m[2], make: (p) => location.origin + m[1] + p + u.search };
      const q = u.searchParams.get("page");
      if (q && /^\d+$/.test(q)) return { n: +q, make: (p) => { const v = new URL(u); v.searchParams.set("page", p); return v.href; } };
    } catch {}
    return null;
  }).filter(Boolean);
  const totalPages = (doc) => {
    const fromText = (clean(doc.body?.textContent).match(/\b1\s*\/\s*(\d{1,5})\b/) || [0, 0])[1];
    return Math.max(+fromText || 0, 0, ...pagerLinks(doc).map((x) => x.n));
  };
  const learnTemplate = (doc) => { const l = pagerLinks(doc).find((x) => x.n === 2) || pagerLinks(doc)[0]; if (l) pageTpl = l.make; };
  const pageUrl = (p) => (pageTpl ? pageTpl(p) : location.origin + LIST + "/" + p);

  // ── ficha /playlist/{slug}/{id}/episode-1 ──
  const parseDetail = (doc, id) => {
    const rec = embedded(doc).get(id) || { title: "", syn: "", eps: 0, tags: [], poster: "" };
    const meta = (k) => clean(doc.querySelector(`meta[property="${k}"],meta[name="${k}"]`)?.content);
    const title = rec.title || clean(doc.querySelector("h1")?.textContent) || meta("og:title");
    const eps = rec.eps || maxEpLink(doc) || epsIn(doc.body);
    let syn = rec.syn;
    if (!syn) {
      for (const el of doc.querySelectorAll("h2,h3,h4,div,p,span")) {
        if (!/^(synopsis|introduction|description|summary|about)\s*:?$/i.test(clean(el.textContent))) continue;
        const text = clean((el.nextElementSibling || el.parentElement?.nextElementSibling)?.textContent);
        if (text.length >= 20) { syn = text; break; }
      }
    }
    if (!syn) { const m = meta("og:description") || meta("description"); if (m.length > 30) syn = m; } // puede venir recortada
    const tags = uniq([...rec.tags, ...[...doc.querySelectorAll('a[href*="/classify/"]')].map((a) => clean(a.textContent)).filter(isTag)]);
    const cover = meta("og:image") || rec.poster || imgSrc([...doc.querySelectorAll("img[alt]")].find((i) => clean(i.getAttribute("alt")) === title));
    return { title, eps, syn, tags, poster: abs(cover) };
  };

  // ── red: 403/429 detiene todo; el resto se reintenta con espera creciente ──
  class Blocked extends Error {}
  const getDoc = async (url) => {
    for (let i = 1; ; i++) {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 20000);
      try {
        const r = await fetch(url, { signal: ctl.signal });
        if (r.status === 403 || r.status === 429) throw new Blocked("HTTP " + r.status);
        if (!r.ok) throw Object.assign(new Error("HTTP " + r.status), { final: r.status === 404 });
        return new DOMParser().parseFromString(await r.text(), "text/html");
      } catch (e) {
        if (e instanceof Blocked || e.final || i >= 3 || halted()) throw e;
        await sleep(2000 * i);
      } finally { clearTimeout(t); }
    }
  };

  // Devuelve un registro COMPLETO o lanza error. Lo incompleto no se exporta ni se marca como visto.
  const build = async (c) => {
    let { title, eps, syn, tags, poster } = c;
    let fetched = false;
    if (!eps || !syn || /(\.\.\.|…)$/.test(syn)) { // la ficha solo se pide si el listado no basta
      fetched = true;
      const d = parseDetail(await getDoc(c.url), c.id);
      title ||= d.title;
      eps = d.eps || eps;
      syn = d.syn || syn;
      tags = uniq([...tags, ...d.tags]);
      poster = d.poster || poster;
    }
    const missing = [!title && "título", !eps && "episodios", !syn && "sinopsis"].filter(Boolean);
    if (missing.length) throw Object.assign(new Error("faltan: " + missing.join(", ")), { fetched });
    return {
      fetched,
      item: { source: "flickreels", source_id: c.id, url: c.url, title: title.slice(0, 160), app: APP, episodes: Math.min(eps, 2000), tropes: tags.slice(0, 20), synopsis: syn.slice(0, 2000), cover: "", cover_url: poster },
    };
  };

  // ── memoria entre tandas + punto de control por si se cierra la pestaña ──
  const load = (k) => { try { const v = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };
  let storageWarned = false;
  const store = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); }
    catch { if (!storageWarned) { storageWarned = true; log("AVISO: no puedo guardar en localStorage; si repites, saldrán series repetidas."); } }
  };
  const download = (items, name) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(items, null, 1)], { type: "application/json" }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 60000);
  };

  const seen = new Set(TEST ? [] : load("frl_seen"));
  const markSeen = (items) => { items.forEach((x) => seen.add(x.source_id)); store("frl_seen", [...seen]); };

  const all = (window.__all = []);
  const failed = (window.__failed = []);
  window.__redescargar = () => { for (let i = 0; i < all.length; i += MAX_FILE) download(all.slice(i, i + MAX_FILE), `flickreels-sesion-${i / MAX_FILE + 1}.json`); };

  let chunk = [], chunkFirst = START;
  const flush = (toPage) => {
    if (!chunk.length) { chunkFirst = toPage + 1; return; }
    const name = `flickreels-p${String(chunkFirst).padStart(3, "0")}-p${String(Math.max(toPage, chunkFirst)).padStart(3, "0")}.json`;
    download(chunk, name);
    markSeen(chunk);
    store("frl_pending", []);
    log(`>> Descargado ${name} (${chunk.length} series)`);
    chunk = [];
    chunkFirst = toPage + 1;
  };

  let end = END, done = START - 1, touched = START - 1, total = 0, stopReason = "", failStreak = 0, pageErrStreak = 0;
  const failedPages = [], signatures = new Set();
  const halted = () => !!(window.__stop || stopReason);

  try {
    if (!TEST) {
      const pending = load("frl_pending");
      if (pending.length) {
        download(pending, `flickreels-recuperado-${Date.now()}.json`);
        markSeen(pending);
        store("frl_pending", []);
        log(`>> Recuperadas ${pending.length} series de una ejecución interrumpida`);
      }
    }
    log(`FlickReels ${TEST ? "(MODO PRUEBA)" : ""} · ${seen.size} series ya recogidas`);

    if (START > 1) { try { learnTemplate(await getDoc(location.origin + location.pathname)); } catch {} }
    for (let p = START; p <= end && !halted(); p++) {
      let doc;
      try {
        doc = await getDoc(p === 1 ? location.origin + location.pathname : pageUrl(p));
        pageErrStreak = 0;
      } catch (e) {
        if (e instanceof Blocked) { stopReason = `el servidor bloquea (${e.message}). Espera un rato antes de seguir`; break; }
        failedPages.push(p);
        log(`Página ${p}: error ${e.message}`);
        if (++pageErrStreak >= 3) { stopReason = "3 páginas fallidas seguidas"; break; }
        await sleep(3000);
        continue;
      }

      if (p === START) {
        learnTemplate(doc);
        total = totalPages(doc);
        if (total) { end = Math.min(END, total); log(`El listado tiene ${total} páginas`); }
      }

      const cards = parseList(doc);
      if (!cards.length) {
        stopReason = `0 tarjetas en la página ${p} (¿fin, captcha o cambio de HTML?) · enlaces /playlist/: ${doc.querySelectorAll('a[href*="/playlist/"]').length}, título: "${clean(doc.title)}"`;
        break;
      }
      const sig = cards.map((c) => c.id).sort().join();
      if (signatures.has(sig)) { stopReason = `la página ${p} repite una anterior (la paginación no avanza)`; break; }
      signatures.add(sig);

      let jobs = cards.filter((c) => !seen.has(c.id) && !chunk.some((x) => x.source_id === c.id) && !(SKIP_DUBBED && /[(（]\s*dubbed\s*[)）]/i.test(c.title)));
      if (TEST) jobs = jobs.slice(0, 3);

      touched = p;
      let next = 0, ok = 0;
      const worker = async () => {
        while (next < jobs.length && !halted()) {
          const c = jobs[next++];
          let fetched = true;
          try {
            const r = await build(c);
            fetched = r.fetched;
            failStreak = 0; ok++;
            chunk.push(r.item); all.push(r.item);
            if (!TEST) { store("frl_pending", chunk); if (chunk.length >= MAX_FILE) flush(p); }
          } catch (e) {
            if (e instanceof Blocked) { stopReason = `el servidor bloquea (${e.message}). Espera un rato antes de seguir`; return; }
            fetched = e.fetched !== false;
            failed.push({ page: p, id: c.id, title: c.title, url: c.url, error: e.message });
            log(`  x ${c.title || c.id}: ${e.message}`);
            if (++failStreak >= MAX_FAILS) { stopReason = `${MAX_FAILS} fichas fallidas seguidas (¿captcha o cambio de HTML?)`; return; }
          }
          if (fetched) await sleep(PAUSE);
        }
      };
      // los workers no lanzan por bloqueo: se espera a todos antes de guardar
      await Promise.all(Array.from({ length: CONC }, worker));
      if (halted()) break; // página a medias: se repite en la siguiente tanda

      done = p;
      log(`Página ${p}/${end}: ${cards.length} tarjetas, ${jobs.length} nuevas, ${ok} guardadas | total ${all.length}`);
      if (TEST) break;
      if (p - chunkFirst + 1 >= CHUNK) flush(p);
      await sleep(PAUSE); // también cuando toda la página ya estaba vista
    }
  } catch (e) {
    stopReason = "error inesperado: " + (e?.message || e);
    console.error(e);
  } finally {
    if (stopReason) log("PARO: " + stopReason);
    if (TEST) {
      if (all.length) { download(all, "flickreels-test.json"); console.table(all.map((x) => ({ titulo: x.title, episodios: x.episodes, tropes: x.tropes.join(", "), sinopsis: x.synopsis.slice(0, 60), portada: x.cover_url }))); }
      log(`PRUEBA terminada: ${all.length} correctas, ${failed.length} fallidas. Si flickreels-test.json está bien, pon TEST = false.`);
    } else {
      flush(touched);
      log(`LISTO. Recogidas: ${all.length}. Fallidas: ${failed.length}${failed.length ? " (ver window.__failed)" : ""}.`);
      if (failedPages.length) log("Páginas con error (repítelas): " + failedPages.join(", "));
      const retry = [...new Set(failed.map((f) => f.page))].sort((a, b) => a - b);
      if (retry.length) log("Para reintentar las fallidas, vuelve a pasar las páginas: " + retry.join(", "));
      log(total && done >= total ? "Listado completo." : "Siguiente tanda: START = " + (done + 1));
    }
    clearInterval(mounter);
    window.__frlRunning = false;
  }
})();
