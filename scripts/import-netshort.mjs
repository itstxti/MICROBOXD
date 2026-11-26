(async () => {
  document.getElementById("__box")?.remove();
  const box = document.createElement("pre");
  box.id = "__box";
  Object.assign(box.style, { position: "fixed", top: "0", left: "0", zIndex: 2147483647, background: "#000", color: "#0f0", font: "12px monospace", padding: "8px", maxWidth: "70vw", maxHeight: "50vh", overflow: "auto", margin: 0, whiteSpace: "pre-wrap" });
  document.body.appendChild(box);
  const log = (...a) => { box.textContent += a.join(" ") + "\n"; box.scrollTop = box.scrollHeight; };

  const out = [];
  window.__out = out;
  const download = () => {
    const l = document.createElement("a");
    l.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 1)], { type: "application/json" }));
    l.download = "netshort-import.json"; l.click();
  };

  try {
    const MAX = 24, APP = "NetShort";
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms + Math.random() * 500));
    const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
    const abs = (u) => { try { return new URL(u, location.origin).href; } catch { return ""; } };

    const fetchT = async (url, opts = {}, ms = 15000) => {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), ms);
      try { return await fetch(url, { ...opts, signal: ctl.signal }); }
      finally { clearTimeout(t); }
    };

    const toData = async (src) => {
      if (!src) return "";
      try {
        const r = await fetchT(src, { referrerPolicy: "no-referrer" }, 8000);
        const b = await r.blob();
        if (!r.ok || b.size > 2e6 || !b.type.startsWith("image/")) return "";
        return await new Promise((res) => { const f = new FileReader(); f.onload = () => res(f.result); f.onerror = () => res(""); f.readAsDataURL(b); });
      } catch { return ""; }
    };

    const parseDetail = (html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      let syn = "";
      const h2 = [...doc.querySelectorAll("h2")].find((h) => /^synopsis$/i.test(clean(h.textContent)));
      if (h2) syn = clean(h2.nextElementSibling?.firstElementChild?.textContent || h2.nextElementSibling?.textContent);
      if (!syn) { const v = clean(doc.querySelector('meta[property="og:description"]')?.content); if (v.length > 30 && !/Browse|Hit Series/i.test(v)) syn = v; }

      // total de episodios: JSON-LD (numberOfEpisodes) o datos de Next (totalEpisode)
      let eps = 0, via = "";
      for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
        try {
          const j = JSON.parse(s.textContent);
          for (const o of (Array.isArray(j) ? j : [j])) if (!eps && +o?.numberOfEpisodes > 0) { eps = +o.numberOfEpisodes; via = "ld+json"; }
        } catch {}
      }
      if (!eps) {
        const m = html.match(/\\?"totalEpisode\\?":\s*(\d{1,4})/) || html.match(/\\?"numberOfEpisodes\\?":\s*(\d{1,4})/);
        if (m) { eps = +m[1]; via = "next"; }
      }
      return { syn, eps, via };
    };

    const getDetail = async (urls) => {
      const best = { syn: "", eps: 0 };
      for (const u of urls) {
        for (let i = 1; i <= 2; i++) {
          try {
            const r = await fetchT(u);
            if (!r.ok) throw new Error(r.status);
            const d = parseDetail(await r.text());
            if (d.syn && !best.syn) best.syn = d.syn;
            if (d.eps && !best.eps) best.eps = d.eps;
            break;
          } catch (e) { log("   fallo:", e.name === "AbortError" ? "sin respuesta en 15 s" : e.message); await sleep(2000); }
        }
        if (best.syn && best.eps) break;
      }
      return best;
    };

    const cards = [...document.querySelectorAll("li.video-list-item")].slice(0, MAX);
    log(cards.length + " tarjetas a procesar");

    for (const c of cards) {
      const nameA = c.querySelector("a.video-list-item-name");
      const imgA = c.querySelector("a[href^='/episode/']");
      const title = clean(nameA?.textContent || c.querySelector("img")?.alt);
      const detailHref = nameA?.getAttribute("href") || "";
      const episodeHref = imgA?.getAttribute("href") || "";
      const slugId = (detailHref || episodeHref).split("/").pop().split("?")[0];
      const id = (slugId.match(/(\d{10,})$/) || [])[1] || slugId;
      const tags = [...c.querySelectorAll("p a[href^='/drama/']")].map((a) => clean(a.textContent)).filter(Boolean);
      const poster = abs(c.querySelector("img")?.getAttribute("src") || "");

      log((out.length + 1) + "/" + cards.length, title);
      const d = await getDetail([episodeHref, detailHref].filter(Boolean).map(abs));
      const cover = await toData(poster);

      out.push({ source: "netshort", source_id: id, url: abs(detailHref || episodeHref), title, app: APP, episodes: d.eps, tropes: tags, synopsis: d.syn, cover, cover_url: cover ? "" : poster });
      log("  ->", d.syn ? "sinopsis OK" : "SIN sinopsis", "|", d.eps ? d.eps + " ep" : "SIN episodios", "|", cover ? "portada OK" : "SIN portada (cover_url)");
      await sleep(1500);
    }

    download();
    log("LISTO. Se ha descargado netshort-import.json");
  } catch (e) {
    log("ERROR:", e && e.message ? e.message : e);
    if (out.length) { download(); log("Se descargó lo conseguido hasta ahora."); }
  }
})();