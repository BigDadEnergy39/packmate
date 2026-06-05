const CACHE_NAME = 'packmate-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.9/babel.min.js',
  'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Crimson+Pro:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap'
];

// Install: cache all core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Some assets failed to cache:', err);
        // Cache what we can, don't fail the whole install
        return Promise.allSettled(
          ASSETS_TO_CACHE.map((url) => cache.add(url).catch(() => {}))
        );
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache first, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful GET responses for future offline use
        // Only cache same-origin GET responses to avoid caching sensitive cross-origin data
        const url = new URL(event.request.url);
        const isSameOrigin = url.origin === self.location.origin;
        const isTrustedCDN = event.request.url.startsWith('https://cdnjs.cloudflare.com/') ||
                             event.request.url.startsWith('https://fonts.googleapis.com/') ||
                             event.request.url.startsWith('https://fonts.gstatic.com/');
        if (response.ok && event.request.method === 'GET' && (isSameOrigin || isTrustedCDN)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // If both cache and network fail, return a basic offline fallback
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
