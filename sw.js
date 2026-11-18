const V = "mbx-v58";
const CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
const SHELL = ["/", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png"];

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
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  // API, auth y Storage de Supabase: siempre red (nunca caché)
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
