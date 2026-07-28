import { TelemetryService } from '../../services/TelemetryService.js';

let socket = null;
export let socketConnected = false;
export let isLeader = false;
export const tabId = Math.random().toString(36).substring(2);

const urlParams = new URLSearchParams(window.location.search);
export const mesaId = urlParams.get('mesa') || 'local';
export const stateSyncChannel = new BroadcastChannel('tome_state_sync_' + mesaId);

let activeTabs = new Map();

export function initSocketConnection() {
    if (mesaId === 'local' || typeof io === 'undefined') {
        return;
    }
    
    try {
        socket = io();
        
        socket.on('connect', () => {
            console.log(`[PlayerView] Socket conectado ao servidor. Entrando na sala: ${mesaId}`);
            socketConnected = true;
            socket.emit('joinRoom', { mesaId });
            
            try {
                TelemetryService.initLatencyMonitor(socket);
            } catch (err) {
                console.warn('[PlayerView] Falha ao iniciar monitor de latência:', err);
            }
        });
        
        socket.on('state_update', async (data) => {
            console.log('[PlayerView] Estado recebido em tempo real via Socket.io.');
            const stateRaw = typeof data === 'string' ? data : JSON.stringify(data);
            await window.App.processState(stateRaw);
            
            if (isLeader) {
                stateSyncChannel.postMessage({
                    type: 'STATE_UPDATE',
                    stateRaw
                });
            }
        });

        socket.on('delta_update', (payload) => {
            if (payload && payload.deltaType) {
                window.App.applyDelta(payload.deltaType, payload.data);
            }
        });

        socket.on('ping', (data) => {
            if (data && data.position) {
                window.pvActivePings = window.pvActivePings || [];
                window.pvActivePings.push({ x: data.position.x, y: data.position.y, color: data.color, timestamp: performance.now() });
                if (!window.pvAnimFrameId) window.pvAnimFrameId = requestAnimationFrame(window.App.animatePV);
            }
        });
        
        socket.on('disconnect', () => {
            console.warn('[PlayerView] Socket desconectado.');
            socketConnected = false;
        });
    } catch (err) {
        console.warn('[PlayerView] Erro ao instanciar Socket.io.', err);
        socketConnected = false;
    }
}

export function loadSocketScript() {
    if (mesaId === 'local') return;
    
    const script = document.createElement('script');
    script.src = '/socket.io/socket.io.js';
    script.onload = () => {
        console.log('[PlayerView] Biblioteca cliente do Socket.io carregada.');
        initSocketConnection();
    };
    script.onerror = () => {
        console.warn('[PlayerView] Falha ao carregar Socket.io.');
    };
    document.head.appendChild(script);
}

export function sendHeartbeat() {
    if (mesaId !== 'local') {
        stateSyncChannel.postMessage({
            type: 'HEARTBEAT',
            tabId,
            isVisible: !document.hidden
        });
    }
}

export function updateLeadership() {
    activeTabs.set(tabId, {
        timestamp: Date.now(),
        isVisible: !document.hidden
    });

    const now = Date.now();
    for (let [id, val] of activeTabs.entries()) {
        if (now - val.timestamp > 5000) {
            activeTabs.delete(id);
        }
    }

    const visibleTabs = [...activeTabs.entries()].filter(([_, val]) => val.isVisible);
    const candidates = visibleTabs.length > 0 ? visibleTabs : [...activeTabs.entries()];
    candidates.sort((a, b) => a[0].localeCompare(b[0]));
    
    const electedLeaderId = candidates[0]?.[0];
    const wasLeader = isLeader;
    isLeader = (electedLeaderId === tabId);
    
    if (isLeader && !wasLeader) {
        console.log('[PlayerView] Esta aba foi eleita LÍDER de sincronização.');
        stateSyncChannel.postMessage({ type: 'REQUEST_STATE' });
        if(window.App && window.App.pollState) window.App.pollState();
    }
}

export function setupNetworkSync() {
    loadSocketScript();

    stateSyncChannel.onmessage = (e) => {
        if (e.data.type === 'HEARTBEAT') {
            activeTabs.set(e.data.tabId, {
                timestamp: Date.now(),
                isVisible: e.data.isVisible
            });
            updateLeadership();
        } else if (e.data.type === 'STATE_UPDATE') {
            if (!isLeader) {
                window.App.processState(e.data.stateRaw);
            }
        } else if (e.data.type === 'REQUEST_STATE') {
            if (isLeader && window.lastStateStr) {
                stateSyncChannel.postMessage({
                    type: 'STATE_UPDATE',
                    stateRaw: window.lastStateStr
                });
            }
        }
    };

    setInterval(sendHeartbeat, 2000);
    sendHeartbeat();
    updateLeadership();

    if (mesaId === 'local') {
        window.addEventListener('storage', (e) => {
            const activeSession = localStorage.getItem('TOME_ACTIVE_SESSION') || 'state.json';
            if (e.key === 'TOME_PRO_STATE_' + activeSession && e.newValue) {
                window.App.processState(e.newValue);
            }
        });
    }
}
