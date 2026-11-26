(async () => {
  const START = 1, END = 20;   // rango de páginas a recorrer
  const CHUNK = 10;            // cada cuántas páginas se descarga un archivo
  const CONC = 2;              // peticiones a la vez (no subas esto)
  const PAUSE = 800;           // ms de pausa entre peticiones
  const APP = "NetShort";

  // ── cuadro de progreso (cuelga de <html>, se re-monta si la web lo borra) ──
  document.getElementById("__box")?.remove();
  const box = document.createElement("pre");
  box.id = "__box";
  Object.assign(box.style, { position: "fixed", top: "0", left: "0", zIndex: 2147483647, background: "#000", color: "#0f0", font: "12px monospace", padding: "8px", maxWidth: "70vw", maxHeight: "40vh", overflow: "auto", margin: 0, whiteSpace: "pre-wrap" });
  const mount = () => { if (!box.isConnected) document.documentElement.appendChild(box); };
  mount();
  setInterval(mount, 1000);
  const baseTitle = document.title;
  const log = (...a) => {
    const line = a.join(" ");
    box.textContent += line + "\n";
    box.scrollTop = box.scrollHeight;
    document.title = "[" + line.slice(0, 40) + "] " + baseTitle;
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms + Math.random() * 400));
  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
  const abs = (u) => { try { return new URL(u, location.origin).href; } catch { return ""; } };
  window.__stop = false;            // pon window.__stop = true para parar y descargar lo hecho

  // series ya guardadas en tandas anteriores (para no repetir)
  let seen = new Set();
  try { seen = new Set(JSON.parse(localStorage.getItem("ns_seen") || "[]")); } catch {}
  const saveSeen = () => { try { localStorage.setItem("ns_seen", JSON.stringify([...seen])); } catch {} };

  class Blocked extends Error {}
  const getText = async (url) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15000);
    try {
      const r = await fetch(url, { signal: ctl.signal });
      if (r.status === 403 || r.status === 429) throw new Blocked(r.status);
      if (!r.ok) throw new Error(r.status);
      return await r.text();
    } finally { clearTimeout(t); }
  };

  const parseDetail = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    let syn = "";
    const h2 = [...doc.querySelectorAll("h2")].find((h) => /^synopsis$/i.test(clean(h.textContent)));
    if (h2) syn = clean(h2.nextElementSibling?.firstElementChild?.textContent || h2.nextElementSibling?.textContent);
    let eps = 0;
    for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const j = JSON.parse(s.textContent);
        for (const o of (Array.isArray(j) ? j : [j])) if (!eps && +o?.numberOfEpisodes > 0) eps = +o.numberOfEpisodes;
      } catch {}
    }
    if (!eps) {
      const m = html.match(/\\?"totalEpisode\\?":\s*(\d{1,4})/) || html.match(/\\?"numberOfEpisodes\\?":\s*(\d{1,4})/);
      if (m) eps = +m[1];
    }
    return { syn, eps };
  };

  const getDetail = async (urls) => {
    const best = { syn: "", eps: 0 };
    for (const u of urls) {
      for (let i = 1; i <= 2; i++) {
        try {
          const d = parseDetail(await getText(u));
          if (d.syn && !best.syn) best.syn = d.syn;
          if (d.eps && !best.eps) best.eps = d.eps;
          break;
        } catch (e) { if (e instanceof Blocked) throw e; await sleep(2000); }
      }
      if (best.syn && best.eps) break;
    }
    return best;
  };

  const download = (items, name) => {
    const l = document.createElement("a");
    l.href = URL.createObjectURL(new Blob([JSON.stringify(items, null, 1)], { type: "application/json" }));
    l.download = name; l.click();
  };

  let chunk = [], chunkFirst = START, total = 0;
  window.__all = [];
  const flush = (lastPage) => {
    if (!chunk.length) { chunkFirst = lastPage + 1; return; }
    const name = `netshort-p${String(chunkFirst).padStart(3, "0")}-p${String(lastPage).padStart(3, "0")}.json`;
    download(chunk, name);
    chunk.forEach((x) => seen.add(x.source_id));
    saveSeen();
    log(`>> Descargado ${name} (${chunk.length} series)`);
    chunk = []; chunkFirst = lastPage + 1;
  };

  let lastPage = START - 1, blockedStreak = 0;
  try {
    for (let p = START; p <= END && !window.__stop; p++) {
      let html;
      try { html = await getText(`/drama/all-plots/page/${p}`); blockedStreak = 0; }
      catch (e) {
        if (e instanceof Blocked) {
          if (++blockedStreak >= 3) { log("El servidor bloquea (" + e.message + "). Paro."); break; }
          log("Respuesta " + e.message + ". Espero 60 s y reintento la página " + p);
          await sleep(60000); p--; continue;
        }
        log("Página " + p + ": error " + e.message); await sleep(3000); continue;
      }
      const doc = new DOMParser().parseFromString(html, "text/html");
      const cards = [...doc.querySelectorAll("li.video-list-item")];
      if (!cards.length) { log("Página " + p + ": 0 tarjetas (¿fin del listado o se carga con JS?). Paro."); break; }

      const jobs = cards.map((c) => {
        const nameA = c.querySelector("a.video-list-item-name");
        const imgA = c.querySelector("a[href^='/episode/']");
        const detailHref = nameA?.getAttribute("href") || "";
        const episodeHref = imgA?.getAttribute("href") || "";
        const slugId = (detailHref || episodeHref).split("/").pop().split("?")[0];
        return {
          id: (slugId.match(/(\d{10,})$/) || [])[1] || slugId,
          title: clean(nameA?.textContent || c.querySelector("img")?.getAttribute("alt")),
          detailHref, episodeHref,
          tags: [...c.querySelectorAll("p a[href^='/drama/']")].map((a) => clean(a.textContent)).filter(Boolean),
          poster: abs(c.querySelector("img")?.getAttribute("src") || ""),
        };
      }).filter((j) => j.id && !seen.has(j.id) && !chunk.some((x) => x.source_id === j.id));

      let idx = 0, noSyn = 0;
      const worker = async () => {
        while (idx < jobs.length && !window.__stop) {
          const j = jobs[idx++];
          const d = await getDetail([j.episodeHref, j.detailHref].filter(Boolean).map(abs));
          if (!d.syn) noSyn++;
          const item = { source: "netshort", source_id: j.id, url: abs(j.detailHref || j.episodeHref), title: j.title, app: APP, episodes: d.eps, tropes: j.tags, synopsis: d.syn, cover: "", cover_url: j.poster };
          chunk.push(item); window.__all.push(item); total++;
          await sleep(PAUSE);
        }
      };
      try { await Promise.all(Array.from({ length: CONC }, worker)); }
      catch (e) {
        if (e instanceof Blocked) { log("Bloqueo (" + e.message + ") en página " + p + ". Descargo lo conseguido y paro."); lastPage = p - 1; break; }
        throw e;
      }

      lastPage = p;
      log(`Página ${p}/${END}: ${cards.length} tarjetas, ${jobs.length} nuevas, ${noSyn} sin sinopsis | total ${total}`);
      if ((p - chunkFirst + 1) >= CHUNK) flush(p);
    }
  } catch (e) { log("ERROR:", e && e.message ? e.message : e); }

  flush(Math.max(lastPage, chunkFirst));
  log("LISTO. Total recogido: " + total + ". Siguiente tanda: START = " + (lastPage + 1));
})();