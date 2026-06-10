const CACHE_NAME = 'target-id-v3';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // index.html is network-first so deploys reach users without a cache-name
  // bump. All navigations (/, /index.html) share one cache entry so the app
  // launches offline regardless of which URL was installed. On slow
  // connections the cached copy is served after 3s instead of hanging.
  if (e.request.mode === 'navigate' || new URL(e.request.url).pathname.endsWith('/index.html')) {
    e.respondWith((async () => {
      const network = fetch(e.request).then(res => {
        caches.open(CACHE_NAME).then(cache => cache.put('./index.html', res.clone()));
        return res;
      });
      network.catch(() => {}); // handled below; avoid unhandled-rejection noise
      const cachedAfterTimeout = new Promise(resolve =>
        setTimeout(() => caches.match('./index.html').then(resolve), 3000)
      );
      try {
        // null when the timeout wins but nothing is cached yet (first visit)
        return (await Promise.race([network, cachedAfterTimeout])) || (await network);
      } catch (_) {
        return (await caches.match('./index.html')) || network;
      }
    })());
    return;
  }
  // Static assets stay cache-first.
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
