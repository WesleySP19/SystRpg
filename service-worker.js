// service-worker.js — TOME PRO v3.0
const CACHE_NAME = 'tome-pro-v3.0';
const SHELL_ASSETS = [
  './',
  './index.html',
  './assets/styles.css'
];

// Install: Cache critical shell assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .catch(err => console.warn('[SW] Cache failed:', err))
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: Network First, then Cache (Safe for debugging and large assets)
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Optional: Update cache if needed, but skip for now to avoid "put" errors
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
