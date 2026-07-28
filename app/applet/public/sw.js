const CACHE_NAME = 'json-studio-v2.7.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/robots.txt',
  '/sitemap.xml',
  '/llms.txt',
  '/llms-full.txt'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(async (networkResponse) => {
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            await cache.put('/index.html', responseToCache);
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html') || await caches.match('/');
          return cached || new Response('JSON Studio is unavailable offline until it has been opened once.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        void fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status !== 200) return;
            return caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          })
          .catch(() => undefined);
        return cachedResponse;
      }

      return fetch(event.request)
        .then(async (networkResponse) => {
          if (networkResponse.status !== 200 || networkResponse.type !== 'basic') return networkResponse;
          const responseToCache = networkResponse.clone();
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, responseToCache);
          return networkResponse;
        })
        .catch(async () => {
          if (event.request.headers.get('accept')?.includes('text/html')) {
            const cached = await caches.match('/index.html');
            if (cached) return cached;
          }
          return new Response('Resource unavailable offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        });
    })
  );
});
