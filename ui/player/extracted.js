        import { IndexedDBService } from './services/IndexedDBService.js';
        import { TelemetryService } from './services/TelemetryService.js';

        const viewport = document.getElementById('viewport');
        const wrap = document.getElementById('canvas-wrap');
        const bg = document.getElementById('bg-canvas');
        const fog = document.getElementById('fog-canvas');
        const fx = document.getElementById('fx-svg');
        const tokens = document.getElementById('token-layer');
        const ui = document.getElementById('ui-layer');
        const refOverlay = document.getElementById('ref-overlay');
        const refImg = document.getElementById('ref-img');
        const standbyScreen = document.getElementById('standby-screen');

        let lastStateStr = "";
        let mapImg = new Image();
        let currentMapUrl = "";
        let lastCombatRound = -1;
        let lastTurnIdx = -1;
        let pvActivePings = [];

        const ctxBg = bg.getContext('2d');
        const ctxFog = fog.getContext('2d');

        // Setup BroadcastChannel for real-time sync
        const channel = new BroadcastChannel('tome_map');
        const refChannel = new BroadcastChannel('tome_reference');

        channel.onmessage = (e) => {
            if (e.data.type === 'MAP_UPDATE') updateFromData(e.data);
            if (e.data.type === 'COMBAT_UPDATE') updateCombatUI(e.data.state);
            if (e.data.type === 'DELTA_UPDATE') applyDelta(e.data.deltaType, e.data.data);
            if (e.data.type === 'PING') {
                pvActivePings.push({ x: e.data.position.x, y: e.data.position.y, color: e.data.color, timestamp: performance.now() });
                if (!pvAnimFrameId) pvAnimFrameId = requestAnimationFrame(animatePV);
            }
        };

        refChannel.onmessage = (e) => {
            if (e.data.type === 'REFERENCE_IMAGE') showReference(e.data.data);
        };

        function applyDelta(deltaType, data) {
            if (!pvLastStateData || !pvLastStateData.tokens) return;
            
            if (deltaType === 'TOKEN_MOVE') {
                const tok = pvLastStateData.tokens.find(t => t.id === data.id);
                if (tok) {
                    tok.x = data.x;
                    tok.y = data.y;
                    renderAll(pvLastStateData); // Renderiza a posição nova (ainda usa renderAll mas sem buscar do server)
                }
            }
        }

        function showReference(data) {
            if (!data) {
                refOverlay.classList.remove('active');
                return;
            }
            refImg.src = data;
            refOverlay.classList.add('active');
        }

        // Close reference on click
        refOverlay.onclick = () => {
            refOverlay.classList.remove('active');
        };

        // ── MAP DRAG & ZOOM CONTROLS (PAN & PINCH) ──
        let isDragging = false;
        let startX = 0, startY = 0;
        let scale = 1.0;
        let panX = 0, panY = 0;

        function applyTransform() {
            wrap.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
        }

        // Setup mouse drag & zoom
        viewport.style.cursor = 'grab';
        
        viewport.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Só arrasta com clique esquerdo
            isDragging = true;
            startX = e.clientX - panX;
            startY = e.clientY - panY;
            viewport.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            panX = e.clientX - startX;
            panY = e.clientY - startY;
            applyTransform();
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                viewport.style.cursor = 'grab';
            }
        });

        viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = 1.1;
            const oldScale = scale;
            
            if (e.deltaY < 0) {
                scale = Math.min(5.0, scale * zoomFactor);
            } else {
                scale = Math.max(0.2, scale / zoomFactor);
            }
            
            const rect = viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - rect.width / 2;
            const mouseY = e.clientY - rect.top - rect.height / 2;
            
            panX = mouseX - (mouseX - panX) * (scale / oldScale);
            panY = mouseY - (mouseY - panY) * (scale / oldScale);
            
            applyTransform();
        }, { passive: false });

        // Setup mobile touch pinch & zoom
        let touchStartDist = 0;
        let touchStartScale = 1.0;
        
        viewport.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                startX = e.touches[0].clientX - panX;
                startY = e.touches[0].clientY - panY;
            } else if (e.touches.length === 2) {
                isDragging = false;
                touchStartDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                touchStartScale = scale;
                
                startX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                startY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            }
        }, { passive: true });

        viewport.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && isDragging) {
                panX = e.touches[0].clientX - startX;
                panY = e.touches[0].clientY - startY;
                applyTransform();
            } else if (e.touches.length === 2) {
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const factor = dist / touchStartDist;
                const oldScale = scale;
                scale = Math.min(5.0, Math.max(0.2, touchStartScale * factor));
                
                const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                
                const rect = viewport.getBoundingClientRect();
                const clientX = midX - rect.left - rect.width / 2;
                const clientY = midY - rect.top - rect.height / 2;
                
                panX = clientX - (clientX - panX) * (scale / oldScale);
                panY = clientY - (clientY - panY) * (scale / oldScale);
                
                applyTransform();
            }
        }, { passive: true });

        viewport.addEventListener('touchend', () => {
            isDragging = false;
        });

        // ── WEBSOCKETS REAL-TIME CONNECT (Socket.io) ──
        let socket = null;
        let socketConnected = false;

        function initSocketConnection() {
            if (mesaId === 'local' || typeof io === 'undefined') {
                return;
            }
            
            try {
                socket = io();
                
                socket.on('connect', () => {
                    console.log(`[PlayerView] Socket conectado ao servidor. Entrando na sala: ${mesaId}`);
                    socketConnected = true;
                    socket.emit('joinRoom', { mesaId });
                    
                    // Inicializa o monitoramento de latência WebSocket
                    try {
                        TelemetryService.initLatencyMonitor(socket);
                    } catch (err) {
                        console.warn('[PlayerView] Falha ao iniciar monitor de latência:', err);
                    }
                });
                
                socket.on('state_update', async (data) => {
                    console.log('[PlayerView] Estado recebido em tempo real via Socket.io.');
                    const stateRaw = typeof data === 'string' ? data : JSON.stringify(data);
                    await processState(stateRaw);
                    
                    // Propaga para outras abas locais
                    if (isLeader) {
                        stateSyncChannel.postMessage({
                            type: 'STATE_UPDATE',
                            stateRaw
                        });
                    }
                });

                socket.on('delta_update', (payload) => {
                    if (payload && payload.deltaType) {
                        applyDelta(payload.deltaType, payload.data);
                    }
                });

                socket.on('ping', (data) => {
                    if (data && data.position) {
                        pvActivePings.push({ x: data.position.x, y: data.position.y, color: data.color, timestamp: performance.now() });
                        if (!pvAnimFrameId) pvAnimFrameId = requestAnimationFrame(animatePV);
                    }
                });
                
                socket.on('disconnect', () => {
                    console.warn('[PlayerView] Socket desconectado. Reativando polling adaptativo...');
                    socketConnected = false;
                });
            } catch (err) {
                console.warn('[PlayerView] Erro ao instanciar Socket.io. Polling ativo.', err);
                socketConnected = false;
            }
        }

        // Carrega dinamicamente o client-script do Socket.io para fallback seguro
        function loadSocketScript() {
            if (mesaId === 'local') return;
            
            const script = document.createElement('script');
            script.src = '/socket.io/socket.io.js';
            script.onload = () => {
                console.log('[PlayerView] Biblioteca cliente do Socket.io carregada.');
                initSocketConnection();
            };
            script.onerror = () => {
                console.warn('[PlayerView] Falha ao carregar Socket.io. Mantendo apenas HTTP Polling.');
            };
            document.head.appendChild(script);
        }

        loadSocketScript();

        // ── TAB COORDINATION & ADAPTIVE POLLING ──
        const tabId = Math.random().toString(36).substring(2);
        const urlParams = new URLSearchParams(window.location.search);
        const mesaId = urlParams.get('mesa') || 'local';
        const stateSyncChannel = new BroadcastChannel('tome_state_sync_' + mesaId);
        
        let activeTabs = new Map(); // tabId -> { timestamp, isVisible }
        let isLeader = false;
        let db = null;
        const resolvedImageCache = new Map();

        // Initialize IndexedDB
        try {
            db = new IndexedDBService();
            await db.init();
            window.TOME = window.TOME || {};
            window.TOME.db = db;
            console.log('[PlayerView] IndexedDB inicializado.');
        } catch (e) {
            console.warn('[PlayerView] Falha ao inicializar IndexedDB:', e);
        }

        // Initialize Telemetry and FPS tracking
        try {
            let sentryDsn = null;
            try {
                const configRes = await fetch('/api/config');
                if (configRes.ok) {
                    const config = await configRes.json();
                    sentryDsn = config.sentryDsn;
                }
            } catch (cfgErr) {
                console.log('[PlayerView] Não foi possível obter configuração do servidor, usando fallback local.');
            }

            await TelemetryService.init(sentryDsn);
            
            // Monitora a taxa de quadros (FPS) do Canvas em tempo real
            TelemetryService.initFpsMonitor((fps) => {
                console.log(`[Telemetry] Taxa de FPS: ${fps}`);
            });
        } catch (e) {
            console.warn('[PlayerView] Falha ao inicializar TelemetryService:', e);
        }

        // Send presence heartbeat
        function sendHeartbeat() {
            if (mesaId !== 'local') {
                stateSyncChannel.postMessage({
                    type: 'HEARTBEAT',
                    tabId,
                    isVisible: !document.hidden
                });
            }
        }

        // BroadcastChannel sync handling
        stateSyncChannel.onmessage = (e) => {
            if (e.data.type === 'HEARTBEAT') {
                activeTabs.set(e.data.tabId, {
                    timestamp: Date.now(),
                    isVisible: e.data.isVisible
                });
                updateLeadership();
            } else if (e.data.type === 'STATE_UPDATE') {
                if (!isLeader) {
                    processState(e.data.stateRaw);
                }
            } else if (e.data.type === 'REQUEST_STATE') {
                if (isLeader && lastStateStr) {
                    stateSyncChannel.postMessage({
                        type: 'STATE_UPDATE',
                        stateRaw: lastStateStr
                    });
                }
            }
        };

        function updateLeadership() {
            activeTabs.set(tabId, {
                timestamp: Date.now(),
                isVisible: !document.hidden
            });

            // Clean expired heartbeats (> 5s)
            const now = Date.now();
            for (let [id, val] of activeTabs.entries()) {
                if (now - val.timestamp > 5000) {
                    activeTabs.delete(id);
                }
            }

            // Visible tabs take priority, then lexicographically sorted tabId
            const visibleTabs = [...activeTabs.entries()].filter(([_, val]) => val.isVisible);
            const candidates = visibleTabs.length > 0 ? visibleTabs : [...activeTabs.entries()];
            candidates.sort((a, b) => a[0].localeCompare(b[0]));
            
            const electedLeaderId = candidates[0]?.[0];
            const wasLeader = isLeader;
            isLeader = (electedLeaderId === tabId);
            
            if (isLeader && !wasLeader) {
                console.log('[PlayerView] Esta aba foi eleita LÍDER de sincronização.');
                // Ask other tabs or poll immediately
                stateSyncChannel.postMessage({ type: 'REQUEST_STATE' });
                pollState();
            }
        }

        // Periodically announce presence and run election
        setInterval(sendHeartbeat, 2000);
        sendHeartbeat();
        updateLeadership();

        // Local storage sync events (for local multi-tab when mesa is not defined)
        if (mesaId === 'local') {
            window.addEventListener('storage', (e) => {
                const activeSession = localStorage.getItem('TOME_ACTIVE_SESSION') || 'state.json';
                if (e.key === 'TOME_PRO_STATE_' + activeSession && e.newValue) {
                    processState(e.newValue);
                }
            });
        }

        // Preload db:// images from IndexedDB
        async function preloadStateImages(state) {
            if (!state) return;
            
            const dbRefs = new Set();
            const traverse = (obj) => {
                if (!obj || typeof obj !== 'object') return;
                for (let k of Object.keys(obj)) {
                    const val = obj[k];
                    if (typeof val === 'string' && val.startsWith('db://')) {
                        dbRefs.add(val);
                    } else if (typeof val === 'object' && val !== null) {
                        traverse(val);
                    }
                }
            };
            
            traverse(state);
            
            for (let ref of dbRefs) {
                if (!resolvedImageCache.has(ref)) {
                    const key = ref.replace('db://', '');
                    try {
                        let data = null;
                        if (db) {
                            data = await db.getMedia(key);
                        }
                        resolvedImageCache.set(ref, data || '');
                    } catch (e) {
                        console.warn('[PlayerView] Falha ao resolver imagem do IndexedDB:', ref, e);
                        resolvedImageCache.set(ref, '');
                    }
                }
            }
        }

        // Process a raw state string
        async function processState(stateRaw) {
            if (!stateRaw || stateRaw === lastStateStr) return;

            const isFirstLoad = lastStateStr === "";
            lastStateStr = stateRaw;

            try {
                const state = JSON.parse(stateRaw);
                
                // Preload offline resources before rendering
                await preloadStateImages(state);

                // Environment sync
                document.body.className = 'player-view';
                if (state.currentEnvironment && state.currentEnvironment !== 'default') {
                    document.body.classList.add(`env-${state.currentEnvironment}`);
                }

                // Reference sync
                if (state.referenceBroadcast && state.referenceCurrentImg) {
                    const resolvedRef = getValidImg(state.referenceCurrentImg);
                    if (resolvedRef) {
                        refImg.src = resolvedRef;
                        refOverlay.classList.add('active');
                    } else {
                        refOverlay.classList.remove('active');
                    }
                } else {
                    refOverlay.classList.remove('active');
                }

                if (state.tacticalMap && state.tacticalMap.mapUrl) {
                    if (isFirstLoad && standbyScreen) {
                        standbyScreen.style.transition = 'none';
                        standbyScreen.style.opacity = '0';
                        standbyScreen.style.pointerEvents = 'none';
                        standbyScreen.classList.add('fade-out');
                        requestAnimationFrame(() => { standbyScreen.style.transition = ''; });
                    }
                    updateFromData(state.tacticalMap);
                } else {
                    if (standbyScreen && standbyScreen.classList.contains('fade-out')) {
                        standbyScreen.classList.remove('fade-out');
                        standbyScreen.style.opacity = '';
                        standbyScreen.style.pointerEvents = '';
                    }
                }

                updateCombatUI(state);
            } catch (e) { console.error(e); }
        }

        // Poll the state
        async function pollState() {
            if (socketConnected) {
                return; // Se conectado via WebSockets, ignora o polling HTTP
            }

            if (mesaId !== 'local' && !isLeader) {
                return;
            }

            let stateRaw = null;
            if (mesaId !== 'local') {
                try {
                    const response = await fetch('/data/mesa_' + mesaId + '.json?t=' + Date.now());
                    if (response.ok) {
                        const json = await response.json();
                        stateRaw = JSON.stringify(json);
                    }
                } catch (e) {
                    console.warn('[PlayerView] Falha ao fazer fetch do estado remoto:', e);
                }
            } else {
                const activeSession = localStorage.getItem('TOME_ACTIVE_SESSION') || 'state.json';
                stateRaw = localStorage.getItem('TOME_PRO_STATE_' + activeSession);
            }

            if (stateRaw) {
                await processState(stateRaw);
                
                // Leader broadcasts to other tabs
                if (mesaId !== 'local' && isLeader) {
                    stateSyncChannel.postMessage({
                        type: 'STATE_UPDATE',
                        stateRaw
                    });
                }
            }
        }

        // Dynamic, adaptive polling timeout loop
        let pollTimeoutId = null;

        function scheduleNextPoll() {
            if (pollTimeoutId) clearTimeout(pollTimeoutId);

            let interval = 3000; // Default exploration
            if (document.hidden) {
                interval = 5000; // Background tab
            } else {
                let isCombat = false;
                if (lastStateStr) {
                    try {
                        const state = JSON.parse(lastStateStr);
                        if (state.combatActive) isCombat = true;
                    } catch (e) {}
                }
                interval = isCombat ? 1000 : 3000;
            }

            pollTimeoutId = setTimeout(async () => {
                try {
                    await pollState();
                } finally {
                    scheduleNextPoll();
                }
            }, interval);
        }

        // React immediately to visibility change
        document.addEventListener('visibilitychange', () => {
            sendHeartbeat();
            updateLeadership();
            scheduleNextPoll();
        });

        // Initialize adaptive polling
        scheduleNextPoll();
        pollState();

        function getValidImg(imgStr) {
            if (!imgStr) return '';
            if (imgStr.startsWith('db://')) {
                return resolvedImageCache.get(imgStr) || '';
            }
            return imgStr;
        }

        const getProjectedCoords = (mx, my, gridType, cellSize, cols) => {
            if (gridType === 'iso') {
                const W = cols * cellSize * 1.5;
                const isoOffset = W / 2;
                const isoX = (mx - my) * Math.cos(Math.PI / 4);
                const isoY = (mx + my) * Math.sin(Math.PI / 4) * 0.5;
                return {
                    x: isoOffset + isoX,
                    y: 50 + isoY
                };
            }
            return { x: mx, y: my };
        };

        function drawCellBackground(ctx, col, row, cs, theme) {
            const x = col * cs;
            const y = row * cs;
            if (theme === 'tavern') {
                ctx.fillStyle = '#3e2723';
                ctx.fillRect(x, y, cs, cs);
                ctx.strokeStyle = '#2d1a15';
                ctx.lineWidth = 1;
                const ph = cs / 3;
                ctx.strokeRect(x, y, cs, cs);
                ctx.beginPath();
                ctx.moveTo(x, y + ph); ctx.lineTo(x + cs, y + ph);
                ctx.moveTo(x, y + ph * 2); ctx.lineTo(x + cs, y + ph * 2);
                ctx.stroke();
            } else if (theme === 'cave') {
                ctx.fillStyle = '#263238';
                ctx.fillRect(x, y, cs, cs);
                ctx.fillStyle = '#1e272c';
                ctx.beginPath();
                ctx.arc(x + cs*0.35, y + cs*0.4, cs*0.25, 0, Math.PI*2);
                ctx.arc(x + cs*0.7, y + cs*0.75, cs*0.2, 0, Math.PI*2);
                ctx.fill();
            } else if (theme === 'scifi') {
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(x, y, cs, cs);
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(x, y, cs, cs);
                ctx.strokeStyle = '#020617';
                ctx.strokeRect(x + 3, y + 3, cs - 6, cs - 6);
                ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
                ctx.fillRect(x + 4, y + 4, 3, 3);
            } else if (theme === 'scrawl') {
                ctx.fillStyle = '#f4f1e1';
                ctx.fillRect(x, y, cs, cs);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            } else if (theme === 'scrawl-classic') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x, y, cs, cs);
                ctx.fillStyle = '#000000';
                ctx.fillRect(x - 1, y - 1, 2, 2);
            } else {
                ctx.fillStyle = '#18191e';
                ctx.fillRect(x, y, cs, cs);
                ctx.strokeStyle = '#111216';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cs, cs);
                ctx.beginPath();
                ctx.moveTo(x + cs/2, y); ctx.lineTo(x + cs/2, y + cs/2);
                ctx.moveTo(x, y + cs/2); ctx.lineTo(x + cs, y + cs/2);
                ctx.moveTo(x + cs/4, y + cs/2); ctx.lineTo(x + cs/4, y + cs);
                ctx.moveTo(x + cs*0.75, y + cs/2); ctx.lineTo(x + cs*0.75, y + cs);
                ctx.stroke();
            }
        }

        function calculateLightPolygon(lx, ly, rangeFt, grid) {
            const cs = grid.cellSize || 60;
            const rangePx = (rangeFt / 5) * cs;

            const minX = lx - rangePx;
            const maxX = lx + rangePx;
            const minY = ly - rangePx;
            const maxY = ly + rangePx;

            const segments = [];
            (grid.walls || []).forEach(w => {
                if (Math.max(w.x1, w.x2) >= minX && Math.min(w.x1, w.x2) <= maxX &&
                    Math.max(w.y1, w.y2) >= minY && Math.min(w.y1, w.y2) <= maxY) {
                    segments.push(w);
                }
            });
            (grid.doors || []).forEach(d => {
                if (!d.isOpen) {
                    if (Math.max(d.x1, d.x2) >= minX && Math.min(d.x1, d.x2) <= maxX &&
                        Math.max(d.y1, d.y2) >= minY && Math.min(d.y1, d.y2) <= maxY) {
                        segments.push(d);
                    }
                }
            });

            const points = [];
            segments.forEach(s => {
                points.push({ x: s.x1, y: s.y1 });
                points.push({ x: s.x2, y: s.y2 });
            });

            points.push({ x: minX, y: minY });
            points.push({ x: maxX, y: minY });
            points.push({ x: maxX, y: maxY });
            points.push({ x: minX, y: maxY });

            const uniqueAngles = new Set();
            const angles = [];
            points.forEach(p => {
                const dx = p.x - lx;
                const dy = p.y - ly;
                const angle = Math.atan2(dy, dx);
                [angle - 0.0001, angle, angle + 0.0001].forEach(a => {
                    let norm = a;
                    if (norm < -Math.PI) norm += 2 * Math.PI;
                    if (norm > Math.PI) norm -= 2 * Math.PI;
                    const rounded = Math.round(norm * 100000);
                    if (!uniqueAngles.has(rounded)) {
                        uniqueAngles.add(rounded);
                        angles.push(norm);
                    }
                });
            });

            angles.sort((a, b) => a - b);

            const polygon = [];
            angles.forEach(angle => {
                const dx = Math.cos(angle);
                const dy = Math.sin(angle);
                let closestT = 1;
                let intersectX = lx + dx * rangePx;
                let intersectY = ly + dy * rangePx;

                for (const s of segments) {
                    const rx1 = lx, ry1 = ly;
                    const rx2 = lx + dx * rangePx, ry2 = ly + dy * rangePx;
                    const sx1 = s.x1, sy1 = s.y1;
                    const sx2 = s.x2, sy2 = s.y2;

                    const denom = (rx2 - rx1) * (sy2 - sy1) - (ry2 - ry1) * (sx2 - sx1);
                    if (Math.abs(denom) < 1e-10) continue;

                    const t = ((sx1 - rx1) * (sy2 - sy1) - (sy1 - ry1) * (sx2 - sx1)) / denom;
                    const u = ((sx1 - rx1) * (ry2 - ry1) - (sy1 - ry1) * (rx2 - rx1)) / denom;

                    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
                        if (t < closestT) {
                            closestT = t;
                            intersectX = lx + dx * rangePx * t;
                            intersectY = ly + dy * rangePx * t;
                        }
                    }
                }
                polygon.push({ x: intersectX, y: intersectY });
            });

            return polygon;
        }

        function getCycleAmbientColor(normTime) {
            let r, g, b, a;
            if (normTime >= 0.0 && normTime < 0.2) {
                r = 4; g = 5; b = 12; a = 0.90;
            } else if (normTime >= 0.2 && normTime < 0.35) {
                const pct = (normTime - 0.2) / 0.15;
                r = Math.round(4 + (45 - 4) * pct);
                g = Math.round(5 + (15 - 5) * pct);
                b = Math.round(12 + (35 - 12) * pct);
                a = 0.90 + (0.50 - 0.90) * pct;
            } else if (normTime >= 0.35 && normTime < 0.45) {
                const pct = (normTime - 0.35) / 0.10;
                r = Math.round(45 + (255 - 45) * pct);
                g = Math.round(15 + (240 - 15) * pct);
                b = Math.round(35 + (200 - 35) * pct);
                a = 0.50 + (0.04 - 0.50) * pct;
            } else if (normTime >= 0.45 && normTime < 0.70) {
                r = 255; g = 240; b = 200; a = 0.04;
            } else if (normTime >= 0.70 && normTime < 0.82) {
                const pct = (normTime - 0.70) / 0.12;
                r = Math.round(255 + (55 - 255) * pct);
                g = Math.round(240 + (15 - 240) * pct);
                b = Math.round(200 + (45 - 200) * pct);
                a = 0.04 + (0.55 - 0.04) * pct;
            } else if (normTime >= 0.82 && normTime < 0.92) {
                const pct = (normTime - 0.82) / 0.10;
                r = Math.round(55 + (4 - 55) * pct);
                g = Math.round(15 + (5 - 15) * pct);
                b = Math.round(45 + (12 - 45) * pct);
                a = 0.55 + (0.90 - 0.55) * pct;
            } else {
                r = 4; g = 5; b = 12; a = 0.90;
            }
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }

        function renderPlayerViewLights(ctx, lights, grid, gridType, showGrid, fogEnabled) {
            const W = ctx.canvas.width;
            const H = ctx.canvas.height;
            const cs = grid.cellSize || 60;

            const getProjected = (mx, my) => {
                if (gridType === 'iso') {
                    const isoOffset = W / 2;
                    const isoX = (mx - my) * Math.cos(Math.PI / 4);
                    const isoY = (mx + my) * Math.sin(Math.PI / 4) * 0.5;
                    return { x: isoOffset + isoX, y: 50 + isoY };
                }
                return { x: mx, y: my };
            };

            const offscreen = document.createElement('canvas');
            offscreen.width = W;
            offscreen.height = H;
            const octx = offscreen.getContext('2d');
            
            let ambientColor = 'rgba(8, 10, 16, 0.78)';
            if (fogEnabled) {
                ambientColor = 'rgba(4, 5, 8, 0.95)';
            } else {
                const timeMode = grid.timeOfDayMode || 'auto';
                if (timeMode === 'day') {
                    ambientColor = 'rgba(255, 245, 230, 0.03)';
                } else if (timeMode === 'night') {
                    ambientColor = 'rgba(4, 5, 12, 0.90)';
                } else {
                    const cycleMs = 600000;
                    const normTime = (Date.now() % cycleMs) / cycleMs;
                    ambientColor = getCycleAmbientColor(normTime);
                }
            }
            octx.fillStyle = ambientColor;
            octx.fillRect(0, 0, W, H);

            octx.save();
            octx.globalCompositeOperation = 'destination-out';

            lights.forEach(light => {
                const sc = getProjected(light.x, light.y);
                const rangePx = (light.range / 5) * cs;

                const polygon = calculateLightPolygon(light.x, light.y, light.range, grid);
                if (polygon.length > 1) {
                    octx.beginPath();
                    const p0 = getProjected(polygon[0].x, polygon[0].y);
                    octx.moveTo(p0.x, p0.y);
                    for (let i = 1; i < polygon.length; i++) {
                        const p = getProjected(polygon[i].x, polygon[i].y);
                        octx.lineTo(p.x, p.y);
                    }
                    octx.closePath();

                    const grad = octx.createRadialGradient(sc.x, sc.y, 0, sc.x, sc.y, rangePx);
                    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
                    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.85)');
                    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
                    octx.fillStyle = grad;
                    octx.fill();
                }
            });

            octx.restore();
            ctx.drawImage(offscreen, 0, 0);

            // Additive colored glows
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            lights.forEach(light => {
                const sc = getProjected(light.x, light.y);
                const rangePx = (light.range / 5) * cs;

                const polygon = calculateLightPolygon(light.x, light.y, light.range, grid);
                if (polygon.length > 1) {
                    ctx.beginPath();
                    const p0 = getProjected(polygon[0].x, polygon[0].y);
                    ctx.moveTo(p0.x, p0.y);
                    for (let i = 1; i < polygon.length; i++) {
                        const p = getProjected(polygon[i].x, polygon[i].y);
                        ctx.lineTo(p.x, p.y);
                    }
                    ctx.closePath();

                    const grad = ctx.createRadialGradient(sc.x, sc.y, 0, sc.x, sc.y, rangePx);
                    const color = light.color || '#ffaa44';
                    
                    let r = 255, g = 170, b = 68;
                    if (color.startsWith('#')) {
                        const hex = color.slice(1);
                        if (hex.length === 6) {
                            r = parseInt(hex.substring(0, 2), 16);
                            g = parseInt(hex.substring(2, 4), 16);
                            b = parseInt(hex.substring(4, 6), 16);
                        }
                    }
                    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.35)`);
                    grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.15)`);
                    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                    
                    ctx.fillStyle = grad;
                    ctx.fill();
                }
            });
            ctx.restore();
        }

        let pvAnimFrameId = null;
        let pvLastStateData = null;
        let pvParticles = [];
        let pvWeatherType = 'none';

        function updatePVWeatherParticles(W, H, weather) {
            if (pvWeatherType !== weather) {
                pvWeatherType = weather;
                pvParticles = [];
            }
            if (!weather || weather === 'none') return;
            const maxParticles = weather === 'rain' ? 120 : weather === 'snow' ? 100 : weather === 'fog' ? 15 : 0;
            while (pvParticles.length < maxParticles) {
                if (weather === 'rain') {
                    pvParticles.push({
                        x: Math.random() * W,
                        y: Math.random() * H - H,
                        speed: 10 + Math.random() * 10,
                        len: 12 + Math.random() * 12,
                        angle: 1.2 + Math.random() * 0.2
                    });
                } else if (weather === 'snow') {
                    pvParticles.push({
                        x: Math.random() * W,
                        y: Math.random() * H - H,
                        speed: 1 + Math.random() * 2,
                        r: 1.5 + Math.random() * 2.5,
                        amp: 1.5 + Math.random() * 2.5,
                        phase: Math.random() * Math.PI * 2
                    });
                } else if (weather === 'fog') {
                    pvParticles.push({
                        x: Math.random() * W,
                        y: Math.random() * H,
                        vx: 0.15 + Math.random() * 0.3,
                        vy: (Math.random() - 0.5) * 0.1,
                        r: 80 + Math.random() * 100,
                        alpha: 0.03 + Math.random() * 0.05
                    });
                }
            }
            pvParticles.forEach(p => {
                if (weather === 'rain') {
                    p.y += p.speed;
                    p.x += Math.cos(p.angle) * p.speed * 0.25;
                    if (p.y > H) {
                        p.y = -20;
                        p.x = Math.random() * W;
                        p.speed = 10 + Math.random() * 10;
                    }
                } else if (weather === 'snow') {
                    p.y += p.speed;
                    p.phase += 0.02;
                    p.x += Math.sin(p.phase) * p.amp * 0.3;
                    if (p.y > H) {
                        p.y = -10;
                        p.x = Math.random() * W;
                        p.speed = 1 + Math.random() * 2;
                    }
                } else if (weather === 'fog') {
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x - p.r > W) {
                        p.x = -p.r;
                        p.y = Math.random() * H;
                    }
                }
            });
        }

        function drawPVWeather(ctx, W, H, weather) {
            if (!weather || weather === 'none') return;
            ctx.save();
            if (weather === 'rain') {
                ctx.strokeStyle = 'rgba(156, 180, 220, 0.45)';
                ctx.lineWidth = 1.2;
                ctx.lineCap = 'round';
                pvParticles.forEach(p => {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + Math.cos(p.angle) * p.len * 0.25, p.y + p.len);
                    ctx.stroke();
                });
            } else if (weather === 'snow') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                pvParticles.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fill();
                });
            } else if (weather === 'fog') {
                pvParticles.forEach(p => {
                    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                    grad.addColorStop(0, `rgba(200, 205, 220, ${p.alpha})`);
                    grad.addColorStop(0.5, `rgba(200, 205, 220, ${p.alpha * 0.4})`);
                    grad.addColorStop(1, 'rgba(200, 205, 220, 0)');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fill();
                });
            }
            ctx.restore();
        }

        function animatePV() {
            if (!pvLastStateData) return;
            const W = bg.width, H = bg.height;
            const weather = pvLastStateData.weather || 'none';
            const timeMode = pvLastStateData.timeOfDayMode || 'auto';
            
            renderAll(pvLastStateData);
            
            updatePVWeatherParticles(W, H, weather);
            drawPVWeather(ctxBg, W, H, weather);
            
            const hasWeather = weather && weather !== 'none';
            const hasAutoTime = timeMode === 'auto';
            
            if (hasWeather || hasAutoTime || (pvActivePings && pvActivePings.length > 0)) {
                pvAnimFrameId = requestAnimationFrame(animatePV);
            } else {
                pvAnimFrameId = null;
            }
        }

        function updateFromData(data) {
            pvLastStateData = data;
            
            if (data && data.mapUrl) {
                if (standbyScreen && !standbyScreen.classList.contains('fade-out')) {
                    standbyScreen.classList.add('fade-out');
                }
            } else {
                if (standbyScreen && standbyScreen.classList.contains('fade-out')) {
                    standbyScreen.classList.remove('fade-out');
                }
                return;
            }

            const grid = data.grid || { cellSize: 60, cols: 30, rows: 20 };
            const gridType = data.gridType || 'square';
            let W = grid.cols * grid.cellSize;
            let H = grid.rows * grid.cellSize;
            
            if (gridType === 'iso') {
                W = grid.cols * grid.cellSize * 1.5;
                H = grid.rows * grid.cellSize * 1.1 + 100;
            }

            if (wrap.style.width !== W + 'px') {
                wrap.style.width = W + 'px';
                wrap.style.height = H + 'px';
                bg.width = W; bg.height = H;
                fog.width = W; fog.height = H;
                fx.setAttribute('viewBox', `0 0 ${W} ${H}`);
            }

            const weather = data.weather || 'none';
            const timeMode = data.timeOfDayMode || 'auto';
            const hasWeather = weather && weather !== 'none';
            const hasAutoTime = timeMode === 'auto';

            // Map Image Transition
            if (data.mapUrl && data.mapUrl !== currentMapUrl) {
                currentMapUrl = data.mapUrl;
                mapImg.src = data.mapUrl;
                mapImg.onload = () => {
                    if (hasWeather || hasAutoTime) {
                        if (!pvAnimFrameId) {
                            pvAnimFrameId = requestAnimationFrame(animatePV);
                        }
                    } else {
                        if (pvAnimFrameId) {
                            cancelAnimationFrame(pvAnimFrameId);
                            pvAnimFrameId = null;
                        }
                        renderAll(data);
                    }
                    wrap.classList.remove('cinematic-transition');
                    void wrap.offsetWidth;
                    wrap.classList.add('cinematic-transition');
                };
            } else {
                if (hasWeather || hasAutoTime) {
                    if (!pvAnimFrameId) {
                        pvAnimFrameId = requestAnimationFrame(animatePV);
                    }
                } else {
                    if (pvAnimFrameId) {
                        cancelAnimationFrame(pvAnimFrameId);
                        pvAnimFrameId = null;
                    }
                    renderAll(data);
                }
            }
        }

        function renderAll(data) {
            const grid = data.grid || { cellSize: 60, cols: 30, rows: 20 };
            const cs = grid.cellSize;
            const W = bg.width, H = bg.height;
            const gridType = data.gridType || 'square';
            const theme = data.theme || 'classic';
            const showGrid = data.showGrid !== false;
            const elements = data.elements || [];
            const doors = grid.doors || [];
            const walls = grid.walls || [];
            const lights = data.lights || [];

            // 1. Background, Flooring & Elements
            ctxBg.clearRect(0, 0, W, H);
            
            ctxBg.save();
            if (gridType === 'iso') {
                const isoOffset = W / 2;
                ctxBg.translate(isoOffset, 50);
                ctxBg.scale(1, 0.5);
                ctxBg.rotate(Math.PI / 4);
            }

            if (mapImg.complete && mapImg.naturalWidth) {
                ctxBg.drawImage(mapImg, 0, 0, grid.cols * cs, grid.rows * cs);
            } else {
                for (let r = 0; r < grid.rows; r++) {
                    for (let c = 0; c < grid.cols; c++) {
                        drawCellBackground(ctxBg, c, r, cs, theme);
                    }
                }
            }

            elements.forEach(el => {
                if (el.type === 'rect') {
                    ctxBg.fillStyle = theme === 'tavern' ? '#5d4037' : theme === 'scifi' ? '#1c2d37' : theme === 'cave' ? '#2e3d44' : '#22232a';
                    ctxBg.fillRect(Math.min(el.x1, el.x2), Math.min(el.y1, el.y2), Math.abs(el.x2-el.x1), Math.abs(el.y2-el.y1));
                    ctxBg.strokeStyle = 'rgba(255,255,255,0.06)';
                    ctxBg.strokeRect(Math.min(el.x1, el.x2), Math.min(el.y1, el.y2), Math.abs(el.x2-el.x1), Math.abs(el.y2-el.y1));
                } else if (el.type === 'circle') {
                    ctxBg.fillStyle = theme === 'tavern' ? '#5d4037' : theme === 'scifi' ? '#1c2d37' : theme === 'cave' ? '#2e3d44' : '#22232a';
                    ctxBg.beginPath();
                    ctxBg.arc(el.cx, el.cy, el.r, 0, Math.PI*2);
                    ctxBg.fill();
                    ctxBg.strokeStyle = 'rgba(255,255,255,0.06)';
                    ctxBg.stroke();
                } else if (el.type === 'freehand') {
                    ctxBg.strokeStyle = '#c5a059';
                    ctxBg.lineWidth = 3;
                    ctxBg.lineCap = 'round';
                    ctxBg.lineJoin = 'round';
                    ctxBg.beginPath();
                    el.points.forEach((p, idx) => {
                        if (idx === 0) ctxBg.moveTo(p.x, p.y);
                        else ctxBg.lineTo(p.x, p.y);
                    });
                    ctxBg.stroke();
                } else if (el.type === 'stairs') {
                    ctxBg.strokeStyle = '#c5a059';
                    ctxBg.lineWidth = 2.5;
                    const dx = el.x2 - el.x1;
                    const dy = el.y2 - el.y1;
                    const len = Math.hypot(dx, dy);
                    const angle = Math.atan2(dy, dx);
                    ctxBg.save();
                    ctxBg.translate(el.x1, el.y1);
                    ctxBg.rotate(angle);
                    ctxBg.strokeRect(0, -cs / 3, len, cs * 2 / 3);
                    const steps = Math.max(3, Math.floor(len / 12));
                    ctxBg.beginPath();
                    for (let i = 1; i < steps; i++) {
                        const sx = (len / steps) * i;
                        ctxBg.moveTo(sx, -cs / 3);
                        ctxBg.lineTo(sx, cs / 3);
                    }
                    ctxBg.stroke();
                    ctxBg.restore();
                }
            });

            if (showGrid) {
                if (gridType === 'hex') {
                    ctxBg.strokeStyle = 'rgba(212,175,55,0.07)';
                    ctxBg.lineWidth = 0.5;
                    const radius = cs / Math.sqrt(3);
                    const vSpacing = cs * 0.866;
                    for (let r = 0; r < grid.rows; r++) {
                        for (let c = 0; c < grid.cols; c++) {
                            const cx = c * cs + (r % 2 === 1 ? cs / 2 : 0);
                            const cy = r * vSpacing;
                            ctxBg.beginPath();
                            ctxBg.moveTo(cx + radius * Math.cos(Math.PI/6), cy + radius * Math.sin(Math.PI/6));
                            for (let i = 1; i <= 6; i++) {
                                const angle = (Math.PI / 3) * i + Math.PI / 6;
                                ctxBg.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
                            }
                            ctxBg.stroke();
                        }
                    }
                } else {
                    ctxBg.strokeStyle = 'rgba(212, 175, 55, 0.08)';
                    ctxBg.lineWidth = 1;
                    for (let c = 0; c <= grid.cols; c++) {
                        ctxBg.beginPath(); ctxBg.moveTo(c * cs, 0); ctxBg.lineTo(c * cs, grid.rows * cs); ctxBg.stroke();
                    }
                    for (let r = 0; r <= grid.rows; r++) {
                        ctxBg.beginPath(); ctxBg.moveTo(0, r * cs); ctxBg.lineTo(grid.cols * cs, r * cs); ctxBg.stroke();
                    }
                }
            }

            doors.forEach(d => {
                if (theme === 'scrawl-classic') {
                    ctxBg.strokeStyle = '#000000';
                    ctxBg.lineWidth = 4;
                    ctxBg.beginPath();
                    ctxBg.moveTo(d.x1, d.y1);
                    ctxBg.lineTo(d.x2, d.y2);
                    ctxBg.stroke();
                    
                    ctxBg.strokeStyle = '#ffffff';
                    ctxBg.lineWidth = 2;
                    ctxBg.beginPath();
                    ctxBg.moveTo(d.x1, d.y1);
                    ctxBg.lineTo(d.x2, d.y2);
                    ctxBg.stroke();
                } else {
                    ctxBg.strokeStyle = d.isOpen ? 'rgba(52, 211, 153, 0.8)' : 'rgba(239, 68, 68, 0.9)';
                    ctxBg.lineWidth = 5;
                    ctxBg.beginPath();
                    ctxBg.moveTo(d.x1, d.y1);
                    ctxBg.lineTo(d.x2, d.y2);
                    ctxBg.stroke();
                }
            });

            const isScrawl = theme === 'scrawl' || theme === 'scrawl-classic';
            const isClassicScrawl = theme === 'scrawl-classic';

            ctxBg.strokeStyle = theme === 'scifi' ? '#06b6d4' : theme === 'tavern' ? '#6d4c41' : theme === 'cave' ? '#78909c' : isScrawl ? '#000000' : '#c5a059';
            ctxBg.lineWidth = isScrawl ? 4 : 3.5;
            ctxBg.lineCap = isScrawl ? 'square' : 'round';
            ctxBg.lineJoin = 'miter';

            if (isScrawl && !isClassicScrawl) {
                ctxBg.beginPath();
                ctxBg.strokeStyle = '#000000';
                ctxBg.lineWidth = 1.5;
                walls.forEach(w => {
                    const dx = w.x2 - w.x1;
                    const dy = w.y2 - w.y1;
                    const len = Math.hypot(dx, dy);
                    const nx = dy / len;
                    const ny = -dx / len;
                    const steps = Math.floor(len / 8);
                    for (let i = 0; i <= steps; i++) {
                        const px = w.x1 + (dx * i) / steps;
                        const py = w.y1 + (dy * i) / steps;
                        ctxBg.moveTo(px, py);
                        ctxBg.lineTo(px + nx * 6, py + ny * 6);
                    }
                });
                ctxBg.stroke();
                
                ctxBg.strokeStyle = '#000000';
                ctxBg.lineWidth = 4;
            }

            ctxBg.beginPath();
            walls.forEach(w => {
                ctxBg.moveTo(w.x1, w.y1);
                ctxBg.lineTo(w.x2, w.y2);
            });
            ctxBg.stroke();

            ctxBg.strokeStyle = isScrawl ? (isClassicScrawl ? '#000000' : '#ffffff') : ctxBg.strokeStyle;
            ctxBg.lineWidth = isScrawl ? (isClassicScrawl ? 4 : 2) : 3.5;
            ctxBg.beginPath();
            walls.forEach(w => {
                ctxBg.moveTo(w.x1, w.y1);
                ctxBg.lineTo(w.x2, w.y2);
            });
            ctxBg.stroke();
            ctxBg.lineCap = 'butt';

            ctxBg.restore();

            // 2. Dynamic Lighting Overlay
            grid.timeOfDayMode = data.timeOfDayMode;
            renderPlayerViewLights(ctxBg, lights || [], grid, gridType, showGrid, data.fog?.enabled);

            // Draw stamps & texts
            elements.forEach(el => {
                if (el.type === 'stamp') {
                    const sc = getProjectedCoords(el.x, el.y, gridType, cs, grid.cols);
                    ctxBg.save();
                    ctxBg.translate(sc.x, sc.y);
                    ctxBg.rotate(el.rotation * Math.PI / 180);
                    ctxBg.scale(el.scale, el.scale);
                    ctxBg.font = '28px sans-serif';
                    ctxBg.textAlign = 'center';
                    ctxBg.textBaseline = 'middle';
                    ctxBg.shadowColor = 'rgba(0,0,0,0.6)';
                    ctxBg.shadowBlur = 5;
                    ctxBg.shadowOffsetY = 2;
                    ctxBg.fillText(el.key, 0, 0);
                    ctxBg.restore();
                } else if (el.type === 'text') {
                    const sc = getProjectedCoords(el.x, el.y, gridType, cs, grid.cols);
                    ctxBg.save();
                    ctxBg.translate(sc.x, sc.y);
                    ctxBg.fillStyle = el.color || '#ffffff';
                    ctxBg.font = `bold ${el.size || 14}px Outfit, sans-serif`;
                    ctxBg.textAlign = 'center';
                    ctxBg.textBaseline = 'middle';
                    ctxBg.strokeStyle = '#000000';
                    ctxBg.lineWidth = 3;
                    ctxBg.strokeText(el.text, 0, 0);
                    ctxBg.fillText(el.text, 0, 0);
                    ctxBg.restore();
                }

            });

            // 2.5 Tactical Pings
            if (pvActivePings && pvActivePings.length > 0) {
                const now = performance.now();
                for (let i = pvActivePings.length - 1; i >= 0; i--) {
                    const p = pvActivePings[i];
                    const age = now - p.timestamp;
                    
                    if (age > 2000) {
                        pvActivePings.splice(i, 1);
                        continue;
                    }
                    
                    const sc = getProjectedCoords(p.x, p.y, gridType, cs, grid.cols);
                    const progress = age / 2000;
                    const radius = 5 + (progress * 50 * scale); // scale instead of zoom
                    const alpha = 1 - progress;
                    
                    ctxBg.save();
                    ctxBg.translate(sc.x, sc.y);
                    
                    ctxBg.beginPath();
                    ctxBg.arc(0, 0, 4 * scale, 0, Math.PI * 2);
                    ctxBg.fillStyle = p.color || '#facc15';
                    ctxBg.fill();
                    
                    ctxBg.beginPath();
                    ctxBg.arc(0, 0, radius, 0, Math.PI * 2);
                    ctxBg.strokeStyle = `rgba(250, 204, 21, ${alpha})`;
                    ctxBg.lineWidth = 3 * scale;
                    ctxBg.stroke();
                    
                    ctxBg.restore();
                }
            }

            // 3. Fog of War
            ctxFog.clearRect(0, 0, W, H);
            const fogData = data.fog || { cells: {}, enabled: false };
            if (fogData.enabled) {
                if (gridType === 'iso') {
                    ctxFog.save();
                    const isoOffset = W / 2;
                    ctxFog.translate(isoOffset, 50);
                    ctxFog.scale(1, 0.5);
                    ctxFog.rotate(Math.PI / 4);
                    for(let c=0; c<grid.cols; c++) {
                        for(let r=0; r<grid.rows; r++) {
                            const s = fogData.cells[`${c},${r}`] || 'hidden';
                            if (s === 'hidden') { ctxFog.fillStyle = '#040507'; ctxFog.fillRect(c*cs, r*cs, cs, cs); }
                            else if (s === 'explored') { ctxFog.fillStyle = 'rgba(4,5,7,0.75)'; ctxFog.fillRect(c*cs, r*cs, cs, cs); }
                        }
                    }
                    ctxFog.restore();
                } else {
                    for(let c=0; c<grid.cols; c++) {
                        for(let r=0; r<grid.rows; r++) {
                            const s = fogData.cells[`${c},${r}`] || 'hidden';
                            if (s === 'hidden') { ctxFog.fillStyle = '#040507'; ctxFog.fillRect(c*cs, r*cs, cs, cs); }
                            else if (s === 'explored') { ctxFog.fillStyle = 'rgba(4,5,7,0.7)'; ctxFog.fillRect(c*cs, r*cs, cs, cs); }
                        }
                    }
                }
            }

            // 4. Tokens
            const tokenList = data.tokens || [];
            tokens.innerHTML = tokenList.map(t => {
                const hpPct = Math.round(t.hp.current / t.hp.max * 100);
                const hpCol = hpPct > 50 ? '#22c55e' : (hpPct > 20 ? '#e5c17b' : '#ef4444');
                const sz = (cs * 0.85);
                const isActive = t.isCurrentTurn ? 'active-turn' : '';
                const sc = getProjectedCoords(t.x, t.y, gridType, cs, grid.cols);

                const validImg = getValidImg(t.img);
                return `
                    <div class="player-view-token ${t.type} ${isActive} ${t.isDead ? 'is-dead' : ''}" style="left:${sc.x}px; top:${sc.y}px; width:${sz}px; height:${sz}px; transform: translate(-50%, -50%);">
                        <div class="player-view-token-ring" style="background-image:${validImg ? "url('" + validImg + "')" : 'none'}; background-color:#111; font-size:${sz * 0.28}px;">
                            ${!validImg ? (t.emoji || t.name[0]) : ''}
                            ${t.isDead ? '<div class="player-view-token-dead-tag">💀</div>' : ''}
                        </div>
                        <div class="player-view-token-hp-bar">
                            <div class="player-view-token-hp-fill" style="width:${hpPct}%; background-color:${hpCol};"></div>
                        </div>
                        <div class="player-view-token-name">${t.name}</div>
                    </div>
                `;
            }).join('');

            // 5. Visual effects (D&D areas)
            const effectsList = data.effects || [];
            fx.innerHTML = effectsList.map(eff => {
                const effectColors = {
                    fire:     { fill: 'rgba(239,68,68,0.22)',    stroke: '#ef4444' },
                    cold:     { fill: 'rgba(96,165,250,0.22)',   stroke: '#60a5fa' },
                    lightning:{ fill: 'rgba(250,204,21,0.22)',   stroke: '#facc15' },
                    poison:   { fill: 'rgba(34,197,94,0.22)',    stroke: '#22c55e' },
                    necrotic: { fill: 'rgba(168,85,247,0.22)',   stroke: '#a855f7' },
                    radiant:  { fill: 'rgba(251,191,36,0.22)',   stroke: '#fbbf24' },
                    default:  { fill: 'rgba(197,160,89,0.18)',    stroke: '#c5a059' }
                };
                const color = effectColors[eff.colorKey] || effectColors.default;
                const radiusPx = (eff.sizeFt / 5) * cs;

                const sco = getProjectedCoords(eff.ox, eff.oy, gridType, cs, grid.cols);
                const sct = getProjectedCoords(eff.tx, eff.ty, gridType, cs, grid.cols);

                let shapeSVG = '';
                const angle = Math.atan2(sct.y - sco.y, sct.x - sco.x);

                if (eff.shape === 'sphere' || eff.shape === 'cylinder') {
                    shapeSVG = `
                        <circle cx="${sco.x}" cy="${sco.y}" r="${radiusPx}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="2" style="filter: drop-shadow(0 0 5px ${color.stroke});" />
                        <circle cx="${sco.x}" cy="${sco.y}" r="4" fill="${color.stroke}" />
                    `;
                } else if (eff.shape === 'cone') {
                    const halfAngle = 53.13 / 2 * (Math.PI / 180);
                    const x1 = sco.x + Math.cos(angle - halfAngle) * radiusPx;
                    const y1 = sco.y + Math.sin(angle - halfAngle) * radiusPx;
                    const x2 = sco.x + Math.cos(angle + halfAngle) * radiusPx;
                    const y2 = sco.y + Math.sin(angle + halfAngle) * radiusPx;
                    const d = `M ${sco.x} ${sco.y} L ${x1} ${y1} A ${radiusPx} ${radiusPx} 0 0 1 ${x2} ${y2} Z`;
                    shapeSVG = `<path d="${d}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="2" style="filter: drop-shadow(0 0 5px ${color.stroke});" />`;
                } else if (eff.shape === 'cube') {
                    const halfPx = radiusPx / 2;
                    shapeSVG = `<rect x="${sct.x - halfPx}" y="${sct.y - halfPx}" width="${halfPx * 2}" height="${halfPx * 2}" fill="${color.fill}" stroke="${color.stroke}" stroke-width="2" style="filter: drop-shadow(0 0 5px ${color.stroke});" />`;
                } else if (eff.shape === 'line') {
                    const widthPx = cs;
                    const ex = sco.x + Math.cos(angle) * radiusPx;
                    const ey = sco.y + Math.sin(angle) * radiusPx;
                    shapeSVG = `
                        <line x1="${sco.x}" y1="${sco.y}" x2="${ex}" y2="${ey}" stroke="${color.stroke}" stroke-width="${widthPx}" stroke-linecap="round" fill="none" opacity="0.6" style="filter: drop-shadow(0 0 5px ${color.stroke});" />
                        <circle cx="${ex}" cy="${ey}" r="5" fill="${color.stroke}" />
                    `;
                }

                let labelSVG = '';
                if (eff.label) {
                    labelSVG = `<text x="${sco.x}" y="${sco.y - 12}" text-anchor="middle" fill="${color.stroke}" font-size="12" font-weight="bold" font-family="'Outfit', sans-serif" filter="drop-shadow(0 0 3px rgba(0,0,0,0.9))">${eff.label}</text>`;
                }

                return shapeSVG + labelSVG;
            }).join('');
        }

        // ── CONDITION MAP ──────────────────────────────────────────────
        const COND_EMOJIS = {
            'abalado':'😰','amedrontado':'😨','agarrado':'🤝','atordoado':'💫',
            'cego':'🙈','caído':'🤕','enfeitiçado':'💜','envenenado':'🤢',
            'exausto':'😫','incapacitado':'😵','invisível':'👻','paralisado':'🧊',
            'petrificado':'🗿','preso':'🕸️','amaldiçoado':'🧿','surdo':'🔇',
        };

        function hpColor(cur, max) {
            if (!max) return '#94a3b8';
            const p = cur / max;
            if (p > 0.5) return '#22c55e';
            if (p > 0.2) return '#e5c17b';
            return '#ef4444';
        }

        function hpPct(cur, max) {
            if (!max) return 0;
            return Math.min(100, Math.max(0, Math.round((cur / max) * 100)));
        }

        // Helper: resolve HP for both players and monsters
        function resolveHP(c) {
            if (c.hp_current !== undefined) return { cur: c.hp_current ?? c.hp_max, max: c.hp_max ?? 0 };
            if (c.combat)  return { cur: c.combat.hp_current ?? c.combat.hp_max, max: c.combat.hp_max ?? 0 };
            return { cur: 0, max: 0 };
        }

        // ── FULL INITIATIVE HUD UPDATE ─────────────────────────────────
        function updateCombatUI(state) {
            const roundLabel = document.getElementById('pv-round-label');
            const spotlight = document.getElementById('pv-spotlight');
            const queue = document.getElementById('pv-queue');
            const spAvatar = document.getElementById('pv-sp-avatar');
            const spName = document.getElementById('pv-sp-name');
            const spMeta = document.getElementById('pv-sp-meta');
            const spHpFill = document.getElementById('pv-sp-hp-fill');
            const announce = document.getElementById('pv-turn-announce');

            if (!state || !state.combatActive || !state.combatInitiative || state.combatInitiative.length === 0) {
                if (roundLabel) roundLabel.innerText = "Combate Inativo";
                if (spotlight) spotlight.style.display = "none";
                if (queue) queue.innerHTML = '<div class="pv-queue-label">Aguardando combate...</div>';
                lastCombatRound = -1;
                lastTurnIdx = -1;
                return;
            }

            const init = state.combatInitiative;
            const turnIdx = state.combatCurrentTurn || 0;
            const current = init[turnIdx];

            // Auto-show HUD when combat starts
            if (lastCombatRound === -1 && typeof window._autoShowHud === 'function') {
                window._autoShowHud();
            }

            // Cinematic Turn Announcement overlay
            if (current && (state.combatRound !== lastCombatRound || turnIdx !== lastTurnIdx)) {
                if (lastCombatRound !== -1 && announce) {
                    announce.innerHTML = '<div class="pv-announce-title">TURNO DE</div>' +
                        '<div class="pv-announce-name">' + current.name + '</div>';
                    announce.classList.remove('active');
                    void announce.offsetWidth; // trigger reflow
                    announce.classList.add('active');
                    setTimeout(() => {
                        announce.classList.remove('active');
                    }, 3500);
                }
                lastCombatRound = state.combatRound || 1;
                lastTurnIdx = turnIdx;
            }

            // Update round label
            if (roundLabel) roundLabel.innerText = 'Rodada ' + (state.combatRound || 1);

            // Update Spotlight (current turn)
            if (current) {
                if (spotlight) spotlight.style.display = "block";
                const hp = resolveHP(current);
                const pct = hpPct(hp.cur, hp.max);
                const col = hpColor(hp.cur, hp.max);

                if (spAvatar) {
                    const validImg = getValidImg(current.img);
                    spAvatar.style.backgroundImage = validImg ? "url('" + validImg + "')" : 'none';
                    spAvatar.innerText = validImg ? '' : (current.emoji || current.name[0]);
                }
                if (spName) spName.innerText = current.name;
                if (spMeta) {
                    var caText = current.ac !== undefined ? 'CA ' + current.ac : '';
                    var hpText = hp.max > 0 ? 'HP ' + hp.cur + '/' + hp.max : '';
                    spMeta.innerText = [caText, hpText].filter(Boolean).join(' • ');
                }
                if (spHpFill) {
                    spHpFill.style.width = pct + "%";
                    spHpFill.style.backgroundColor = col;
                }
            } else {
                if (spotlight) spotlight.style.display = "none";
            }

            // Update Queue (Upcoming combatants list)
            if (queue) {
                const upcoming = [];
                // Render upcoming combatants starting after the current turn
                for (let i = 1; i < init.length; i++) {
                    const idx = (turnIdx + i) % init.length;
                    const c = init[idx];
                    if (c) {
                        const hp = resolveHP(c);
                        const pct = hpPct(hp.cur, hp.max);
                        const col = hpColor(hp.cur, hp.max);
                        const emoji = COND_EMOJIS[c.condition] || '';
                        
                        const validImg = getValidImg(c.img);
                        var avatarBg = validImg ? "url('" + validImg + "')" : 'none';
                        var avatarInner = validImg ? '' : (c.emoji || c.name[0]);
                        upcoming.push(
                            '<div class="pv-queue-row ' + c.type + '">' +
                                '<div class="pv-avatar mini" style="background-image: ' + avatarBg + '">' + avatarInner + '</div>' +
                                '<div class="pv-queue-info">' +
                                    '<div class="pv-queue-name">' + c.name + ' ' + emoji + '</div>' +
                                    '<div class="pv-queue-hp-bar">' +
                                        '<div class="pv-queue-hp-fill" style="width: ' + pct + '%; background-color: ' + col + ';"></div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>'
                        );
                    }
                }
                queue.innerHTML = upcoming.join('');
            }
        }
