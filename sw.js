const V = "mbx-v96";
const IMG = "mbx-img";
const CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
const SHELL = ["/", "/css/app.css?b=1795593528", "/js/theme.js?b=1795593528", "/js/i18n.js?b=1795593528", "/js/core.js?b=1795593528", "/js/desktop.js?b=1795593528", "/js/shell.js?b=1795593528", "/js/filters.js?b=1795593528", "/js/settings.js?b=1795593528", "/js/detail.js?b=1795593528", "/js/log.js?b=1795593528", "/js/diary.js?b=1795593528", "/js/lists.js?b=1795593528", "/js/config.js?b=1795593528", "/js/data.js?b=1795593528", "/js/gestures.js?b=1795593528", "/js/reviews.js?b=1795593528", "/js/people.js?b=1795593528", "/js/form.js?b=1795593528", "/js/crop.js?b=1795593528", "/js/nav.js?b=1795593528", "/js/runtime.js?b=1795593528", "/js/anim-tabs.js?b=1795593528", "/js/anim-extra.js?b=1795593528", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(V)
      .then(async c => { await c.addAll(SHELL); try { await c.add(new Request(CDN, { mode: "cors" })); } catch (_) {} })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V && k !== IMG).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  // Portadas públicas de Supabase Storage: caché primero (las rutas no se reutilizan al cambiar la imagen)
  if (u.hostname.endsWith("supabase.co") && u.pathname.startsWith("/storage/v1/object/public/covers/")) {
    e.respondWith(
      caches.open(IMG).then(c => c.match(r.url).then(hit => hit || fetch(new Request(r.url, { mode: "cors" })).then(x => {
        if (x.ok) { c.put(r.url, x.clone()); c.keys().then(ks => { if (ks.length > 400) c.delete(ks[0]); }); }
        return x;
      }).catch(() => fetch(r))))
    );
    return;
  }
  // API, auth y resto de Supabase: siempre red (nunca caché)
  if (u.hostname.endsWith("supabase.co")) return;
  // Comprobación de versión: siempre red
  if (u.searchParams.has("__v")) return;
  // Navegación: red primero, caché si no hay conexión
  if (r.mode === "navigate") {
    e.respondWith(
      fetch(r).then(x => { const c = x.clone(); caches.open(V).then(h => h.put("/", c)); return x; })
        .catch(() => caches.match("/"))
    );
    return;
  }
  // Estáticos propios y la librería del CDN: caché + revalidar en segundo plano
  if (u.origin === location.origin || u.href === CDN) {
    e.respondWith(
      caches.match(r).then(hit => {
        const net = fetch(r).then(x => { if (x.ok) { const c = x.clone(); caches.open(V).then(k => k.put(r, c)); } return x; }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
