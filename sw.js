// Offline cache for the web version (iPhone / browser).
// App files: served from the cache at once and refreshed in the background.
// Catalog and version info: network first, the cache only when offline.
const CACHE = 'studypath-v2';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const fresh = /\/courses\/|version\.json$/.test(url.pathname);
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const cached = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => cached);
    return fresh ? net : cached || net;
  }));
});
