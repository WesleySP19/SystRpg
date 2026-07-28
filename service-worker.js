/**
 * SERVICE WORKER v3.0 — DOMÍNIO RPG VTT
 * Estratégia:
 *   - Assets estáticos (JS, CSS, HTML, fontes): Cache-First
 *   - Dados da campanha (/data/, /api/): Network-First (sempre tenta rede, cai no cache)
 *   - Recursos externos (CDN, fontes Google): StaleWhileRevalidate
 */

const CACHE_VERSION = 'tome-v24';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DATA = `${CACHE_VERSION}-data`;

// Assets que DEVEM estar no cache para o app funcionar offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/player-view.html',
  '/master-map.html',
  '/ui/components/MapLauncher.js',
  '/ui/components/AuthScreen.js',
  '/manifest.json',
  '/assets/styles.css',
  '/assets/sheet-theme.css',
  '/assets/tmap.css',
  '/assets/logo.png',
  '/assets/bestiary-statblock.css',
  '/assets/match-history.css',
  '/assets/initiative-monitor.css',
  // Core modules
  '/core/Registry.js',
  '/core/Store.js',
  '/core/EventBus.js',
  '/core/RulesEngine.js',
  '/core/index.js',
  // Services
  '/services/AIService.js',
  '/services/AudioService.js',
  '/services/PersistenceService.js',
  '/services/CardRenderer.js',
  '/services/LootEngine.js',
  '/services/IndexedDBService.js',
  '/services/TelemetryService.js',
  '/services/MatchHistoryService.js',
  '/services/MonsterArt.js',
  // UI Core
  '/ui/core/Component.js',
  // UI Pages
  '/ui/pages/Dashboard.js',
  '/ui/pages/Bestiary.js',
  // UI Components
  '/ui/components/Sidebar.js',
  '/ui/components/Toast.js',
  '/ui/components/CombatTracker.js',
  '/ui/components/DMShield.js',
  '/ui/components/WorldBuilder.js',
  '/ui/components/PlayerForm.js',
  '/ui/components/NPCHelper.js',
  '/ui/components/CampaignManager.js',
  '/ui/components/LootGenerator.js',
  '/ui/components/SpellBook.js',
  '/ui/components/MapManager.js',
  '/ui/components/TurnTracker.js',
  '/ui/components/CombatArena.js',
  '/ui/components/TokenOverlay.js',
  '/ui/components/QuestManager.js',
  '/ui/components/SessionJournal.js',
  '/ui/components/QuickReference.js',
  '/ui/components/MonsterForm.js',
  '/ui/components/PartyStatusHUD.js',
  // Engine
  '/engine/GridEngine.js',
  '/engine/TokenEngine.js',
  '/engine/FogEngine.js',
  '/engine/EffectEngine.js',
  '/engine/VisionEngine.js',
  '/engine/ReferencePanel.js',
  '/engine/LightingEngine.js',
  '/engine/DungeonGenerator.js',
  // Utils & Data
  '/utils/Dice.js',
  '/utils/combat.js',
  '/data/schemas.js',
  '/data/spells-5e.js',
  '/data/MonsterData.js',
  '/data/MonsterLibrary.js',
];

// --- INSTALL: pré-cacheia assets estáticos ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_STATIC)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] Pre-cache parcial:', err)),
  );
});

// --- ACTIVATE: limpa versões antigas do cache ---
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

// --- FETCH: estratégias por tipo de requisição ---
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-GET e deixa o navegador tratar nativamente
  if (request.method !== 'GET') {
    return;
  }

  // Ignora extensões de devtools e chrome-extension (protocolos não-HTTP)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Dados dinâmicos da campanha: Network-First
  if (url.pathname.startsWith('/data/') || url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, CACHE_DATA));
    return;
  }

  // CDN e fontes externas
  if (
    !url.hostname.includes('localhost') &&
    !url.hostname.includes('127.0.0.1')
  ) {
    const isFontOrStyle = url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.includes('font') || url.hostname.includes('cdnjs') || url.hostname.includes('googleapis');
    if (isFontOrStyle) {
      event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
      return;
    }
    // Deixa áudios, imagens e outros recursos externos passarem direto pela rede nativamente (sem chamar event.respondWith)
    // para evitar problemas de CORS e permitir suporte total a Range requests do navegador.
    return;
  }

  // Assets estáticos locais: Cache-First
  event.respondWith(cacheFirst(request, CACHE_STATIC));
});

// Cache-First: responde do cache, busca na rede só se não encontrar
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline — asset não encontrado no cache.', {
      status: 503,
    });
  }
}

// Network-First: tenta rede, cai no cache se falhar
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return (
      cached ||
      new Response('Offline — dados não disponíveis.', { status: 503 })
    );
  }
}

// Stale-While-Revalidate: responde do cache, atualiza em background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}
