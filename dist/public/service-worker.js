const CACHE_VERSION = 'tome-v22-0-0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DATA = `${CACHE_VERSION}-data`;
const STATIC_ASSETS = [
'/',
'/index.html',
'/manifest.json',
'/assets/tome-master.css',
'/assets/logo.png',
'/data/spells-5e.js',
];
self.addEventListener('install', (event) => {
event.waitUntil(
caches.open(CACHE_STATIC).then(async (cache) => {
console.log(`[SW] Iniciando cache iterativo para ${STATIC_ASSETS.length} assets...`);
let sucessos = 0;
let falhas = 0;
await Promise.all(STATIC_ASSETS.map(async (url) => {
try {
const req = new Request(url, { cache: 'reload' });
const res = await fetch(req);
if (res.ok) {
await cache.put(req, res);
sucessos++;
} else {
console.warn(`[SW] Aviso: Asset não encontrado (Ignorado no cache): ${url} (Status: ${res.status})`);
falhas++;
}
} catch (err) {
console.warn(`[SW] Aviso: Falha de rede ao cachear asset: ${url}`, err);
falhas++;
}
}));
console.log(`[SW] Cache finalizado! Sucessos: ${sucessos}, Falhas/Ausentes: ${falhas}`);
return self.skipWaiting();
})
);
});
self.addEventListener('activate', (event) => {
const VALID_CACHES = [CACHE_STATIC, CACHE_DATA];
event.waitUntil(
caches
.keys()
.then((keys) =>
Promise.all(
keys
.filter((key) => !VALID_CACHES.includes(key))
.map((key) => caches.delete(key)),
),
)
.then(() => self.clients.claim()),
);
});
self.addEventListener('fetch', (event) => {
const { request } = event;
const url = new URL(request.url);
if (request.method !== 'GET') {
return;
}
if (!url.protocol.startsWith('http')) {
return;
}
if (url.pathname.startsWith('/data/') || url.pathname.startsWith('/api/')) {
event.respondWith(networkFirst(request, CACHE_DATA));
return;
}
if (
!url.hostname.includes('localhost') &&
!url.hostname.includes('127.0.0.1')
) {
const isFontOrStyle = url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.includes('font') || url.hostname.includes('cdnjs') || url.hostname.includes('googleapis');
if (isFontOrStyle) {
event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
return;
}
return;
}
if (request.mode === 'navigate' || (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
event.respondWith(networkFirst(request, CACHE_STATIC));
return;
}
event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
});
async function cacheFirst(request, cacheName) {
const cached = await caches.match(request, { ignoreSearch: true });
if (cached) return cached;
try {
const response = await fetch(request);
if (response && response.status === 200 && request.method === 'GET' && request.url.startsWith('http') && (response.type === 'basic' || response.type === 'cors' || response.type === 'default')) {
const cache = await caches.open(cacheName);
try { await cache.put(request, response.clone()); } catch (e) { console.warn('[SW] Falha segura ao cachear:', e); }
}
return response;
} catch {
return new Response('Offline — asset não encontrado no cache.', {
status: 503,
});
}
}
async function networkFirst(request, cacheName) {
try {
const response = await fetch(request);
if (response && response.status === 200 && request.method === 'GET' && request.url.startsWith('http') && (response.type === 'basic' || response.type === 'cors' || response.type === 'default')) {
const cache = await caches.open(cacheName);
try { await cache.put(request, response.clone()); } catch (e) {}
}
return response;
} catch {
const cached = await caches.match(request, { ignoreSearch: true });
return cached || new Response('Offline — dados não disponíveis.', { status: 503 });
}
}
async function staleWhileRevalidate(request, cacheName) {
const cache = await caches.open(cacheName);
const cached = await cache.match(request, { ignoreSearch: true });
const fetchPromise = fetch(request)
.then(async (response) => {
if (response && response.status === 200 && request.method === 'GET' && request.url.startsWith('http') && (response.type === 'basic' || response.type === 'cors' || response.type === 'default')) {
try { await cache.put(request, response.clone()); } catch (e) {}
}
return response;
})
.catch(() => cached || new Response('Offline', { status: 503 }));
return cached || fetchPromise;
}