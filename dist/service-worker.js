/**
 * SERVICE WORKER v15.9 — DOMÍNIO RPG VTT
 * Estratégia Otimizada (Auto-Update):
 *   - HTML (app shell): Network-First
 *   - Assets estáticos locais: Stale-While-Revalidate (sempre atualiza no background)
 *   - Dados da campanha: Network-First
 *   - Recursos externos: Stale-While-Revalidate
 */

const CACHE_VERSION = 'tome-v18-0-0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DATA = `${CACHE_VERSION}-data`;

// Assets que DEVEM estar no cache para o app funcionar offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/ui/components/AuthScreen.js',
  '/manifest.json',
  '/assets/tome-master.css',
  '/assets/logo.png',
  
  // Core
  '/core/EventBus.js',
  '/core/Store.js',
  '/ui/core/Component.js',
  '/ui/core/ReactiveComponent.js',
  '/core/RulesEngine.js',
  '/core/Registry.js',

  // Services
  '/services/PersistenceService.js',
  '/ui/services/FrontendDirectoryService.js',
  '/services/MediaService.js',
  '/services/SessionManager.js',
  '/services/CardRenderer.js',
  '/services/TelemetryService.js',
  '/services/MatchHistoryService.js',
  '/services/MonsterArt.js',

  // Utils
  '/utils/Dice.js',
  '/utils/combat.js',
  '/utils/db.js',
  '/ui/utils/imageExport.js',

  // Components base
  '/ui/components/MainPanel.js',
  '/ui/components/PartyStatusHUD.js',
  '/ui/components/ChatBox.js',
  '/ui/components/HeroHub.js',
  '/ui/components/PlayerForm.js',
  '/ui/components/CampaignManager.js',
  '/ui/components/combat/CombatTrackerV14.js',
  '/ui/components/combat/CombatantList.js',
  '/ui/components/combat/CombatControls.js',
  '/ui/components/SessionJournal.js',
  '/ui/components/QuestManager.js',
  '/ui/components/LootGenerator.js',
  '/ui/components/NPCHelper.js',
  '/ui/components/SpellBook.js',
  '/ui/components/DynamicCharacterBuilder.js',
  '/ui/components/QuickReference.js',
  '/ui/components/DMShield.js',
  '/ui/components/WorldBuilder.js',
  '/ui/components/InitiativeMonitor.js',
  '/ui/components/EncounterGenerator.js',
  '/ui/components/CardGenerator.js',
  '/ui/components/TomeSinalPanel.js',

  // Pages
  '/ui/pages/Dashboard.js',
  '/ui/pages/Bestiary.js',
  '/data/schemas.js',
  '/data/spells-5e.js',
  '/data/MonsterData.js',
  '/data/MonsterLibrary.js',
];

// --- INSTALL: pré-cacheia assets estáticos com resiliência ---
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

  // HTML files and direct navigations: Network-First to ensure we always load the latest app shell
  if (request.mode === 'navigate' || (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))) {
    event.respondWith(networkFirst(request, CACHE_STATIC));
    return;
  }

  // Assets estáticos locais: Stale-While-Revalidate para garantir que atualizações ocorram no background
  event.respondWith(staleWhileRevalidate(request, CACHE_STATIC));
});

// Cache-First: responde do cache, busca na rede só se não encontrar
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

// Network-First: tenta rede, cai no cache se falhar
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

// Stale-While-Revalidate: responde do cache, atualiza em background
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
