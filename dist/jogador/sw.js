const CACHE_NAME = 'tome-jogador-v23.1.0';
const STATIC_ASSETS = [
  '/jogador/index.html',
  '/jogador/css/theme.css',
  '/jogador/js/UI.js',
  '/jogador/js/Engine.js',
  '/jogador/js/app.js',
  '/jogador/manifest.json',
  '/assets/logo.png',
  '/assets/tailwind.css',
  '/assets/tome-master.css',
  '/vendor/yjs.js',
  '/vendor/y-websocket.js',
  '/vendor/qrious.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Ignorando erros se algum asset falhar no cache (ex: URLs indisponíveis)
      return Promise.allSettled(STATIC_ASSETS.map(url => {
        return fetch(url).then(response => {
          if (!response.ok) throw new Error('Not ok');
          return cache.put(url, response);
        });
      }));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name.startsWith('tome-jogador-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Bypass para rotas em tempo real e arquivos dinâmicos de dados
  const url = event.request.url;
  if (url.includes('/socket.io/') || url.includes('/api/') || url.includes('/data/') || url.includes('/yjs')) {
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try { cache.put(event.request, responseClone); } catch(e){}
          });
        }
        return networkResponse;
      }).catch(() => cached || new Response('Offline Mode', { status: 503 }));
      
      return cached || fetchPromise;
    })
  );
});
