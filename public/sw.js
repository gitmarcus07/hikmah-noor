/* Hikmah Noor service worker — offline-first reading (v3: new domain).
 * Same-origin GET requests are cached at runtime; navigations fall back
 * to /offline/ when the network fails. Third-party (fonts, audio, APIs)
 * is left alone so it never breaks the shell.
 * /api/* is NEVER cached (notices, search must always be fresh).
 */
const V = 'hn-v3';
const CORE = ['/', '/offline/', '/favicon.svg'];

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
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((r) => {
          const copy = r.clone();
          caches.open(V).then((c) => c.put(request, copy)).catch(() => {});
          return r;
        })
        .catch(() =>
          caches.match(request).then((m) => m || caches.match('/offline/'))
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
            }
            return r;
          })
          .catch(() => m)
    )
  );
});
