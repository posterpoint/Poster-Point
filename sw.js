const CACHE_NAME = 'posterpoint-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/index10_cartfixed.html',
  '/assets/logo-48.png',
  '/assets/logo-96.png',
  '/output-fallback.jpg',
  '/js/app.js'
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
  event.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        try {
          if(res && res.status === 200){
            const resClone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
          }
        } catch(e){}
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
