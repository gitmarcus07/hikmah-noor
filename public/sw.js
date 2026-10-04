/* Hikmah Noor service worker — offline-first reading (v5: bounded caches).
 * v5 adds the Ramadan 2027 hub + Eid/Ramadan tools to the install precache.
 * Same-origin GET requests are cached at runtime; navigations fall back
 * to /offline/ when the network fails. Third-party (fonts, audio, APIs)
 * is left alone so it never breaks the shell.
 * /api/* is NEVER cached (notices, search must always be fresh).
 *
 * v4 policy (intentional, not blind):
 * - navigations: network-first, cache fallback, capped (offline fallback).
 * - app JSON (search-index, search-ayahs, habits): network-first so fresh
 *   content always wins when online; cached copy keeps search working
 *   offline. Capped separately.
 * - static assets (JS/CSS/fonts/images): cache-first, capped.
 * - same-origin media (*.mp3/*.m4a/...) is NEVER cached: audio files are
 *   large and often served cross-origin anyway; caching them would bloat
 *   device storage without consent.
 * Cache caps prevent unbounded growth on a 30k-page site. Version bump
 * (V) invalidates older caches on update.
 */
const V = 'hn-v5';
const CORE = ['/', '/offline/', '/favicon.svg', '/ramadan-2027/', '/tools/eid-takbeer/', '/tools/qurbani-dua/', '/tools/shawwal-tracker/', '/tools/qada-tracker/', '/tools/kids-roza-chart/'];
const NAV_CAP = 60;
const ASSET_CAP = 200;
const JSON_CAP = 30;
const MEDIA_RE = /\.(mp3|m4a|ogg|oga|wav|webm|mp4)(\?|#|$)/i;

async function trim(cacheName, cap) {
  try {
    const c = await caches.open(cacheName);
    const keys = await c.keys();
    if (keys.length > cap) {
      await Promise.all(keys.slice(0, keys.length - cap).map((k) => c.delete(k)));
    }
  } catch { /* storage constrained — keep serving */ }
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()).catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // API responses must always be fresh — never serve or store them.
  if (url.pathname.startsWith('/api/')) return;
  // Same-origin media is never cached (large files, no consent).
  if (MEDIA_RE.test(url.pathname)) return;
  const isJson = url.pathname.endsWith('.json');
  const cacheName = isJson ? `${V}-json` : V;
  const cap = isJson ? JSON_CAP : request.mode === 'navigate' ? NAV_CAP : ASSET_CAP;
  if (request.mode === 'navigate' || isJson) {
    // Network-first: fresh content wins online; cache covers offline.
    e.respondWith(
      fetch(request)
        .then((r) => {
          if (r && r.ok) {
            const copy = r.clone();
            caches.open(cacheName).then((c) => c.put(request, copy)).catch(() => {});
            trim(cacheName, cap);
          }
          return r;
        })
        .catch(() =>
          caches.match(request, { cacheName }).then((m) => m || caches.match('/offline/'))
        )
    );
    return;
  }
  e.respondWith(
    caches.match(request).then(
      (m) =>
        m ||
        fetch(request)
          .then((r) => {
            if (r && r.ok) {
              const copy = r.clone();
              caches.open(V).then((c) => c.put(request, copy)).catch(() => {});
              trim(V, ASSET_CAP);
            }
            return r;
          })
          .catch(() => m)
    )
  );
});
