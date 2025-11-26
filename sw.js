const CACHE_NAME = 'posterpoint-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/index10_cartfixed.html',
  '/assets/logo-48.png',
  '/assets/logo-96.png',
  '/output-fallback.jpg',
  '/js/app.index.js',
  '/js/app.shop.js',
  '/styles.index.css',
  '/styles.shop.css',
  '/outputsIndex.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isImageRequest = /\.(jpg|jpeg|png|webp|gif)$/i.test(url.pathname) || url.pathname.startsWith('/outputs/') || url.pathname.startsWith('/images/');

  // Network-first for image requests (avoid serving stale broken images)
  if (isImageRequest) {
    event.respondWith(
      fetch(req).then(res => {
        // Update cache with a fresh copy if successful
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // For other assets use cache-first then network
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      try {
        if (res && res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        }
      } catch (e){}
      return res;
    }).catch(() => cached))
  );
});
