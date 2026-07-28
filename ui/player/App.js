// App.js (V2 - Arquitetura de Alta Performance e Componentizada)

import { IndexedDBService } from '../../services/IndexedDBService.js';
import { setupNetworkSync, mesaId } from './PlayerNetwork.js';
import { updateCombatUI } from './PlayerHUD.js';
import { initInput } from './PlayerInput.js';
import { initRenderer, renderFrame, startAnimationLoop, invalidateStaticCache } from './PlayerRenderer.js';
import { getState, setState, applyDelta, subscribe } from './PlayerState.js';

// Inicialização Global
window.TOME = window.TOME || {};
export const resolvedImageCache = new Map();

let db = null;

export async function processState(stateStr) {
    if (!stateStr) return;
    
    // 1. Atualiza a "Única Fonte de Verdade" (State)
    setState(stateStr);
}

// 2. Reagir a mudanças de Estado (Reactivity)
subscribe((state, eventType) => {
    const data = state.tacticalMap;
    if (!data) return;

    // Se a imagem de fundo mudar, força refazer o cache estático
    if (data.mapUrl && data.mapUrl !== window.currentMapUrl) {
        window.currentMapUrl = data.mapUrl;
        invalidateStaticCache();
        preloadStateImages(state);
    }
    
    // Desliga a tela de loading
    const standbyScreen = document.getElementById('standby-screen');
    if (standbyScreen) {
        standbyScreen.style.opacity = '0';
        setTimeout(() => { standbyScreen.style.display = 'none'; }, 500);
    }

    // Atualiza a UI do HUD (Iniciativa, HP, Turno)
    updateCombatUI(state);
    
    // Como a UI é baseada em Canvas Game Loop, certifique-se de que o loop está rodando
    startAnimationLoop();
});

// Tornar métodos disponíveis globalmente (para os callbacks de Network)
window.App = {
    processState,
    applyDelta,
    resolvedImageCache,
    pollState
};

export async function pollState() {
    if (mesaId === 'local') return;
    try {
        const res = await fetch('/data/mesa_' + mesaId + '.json');
        if (res.ok) {
            const text = await res.text();
            processState(text);
        } else {
            console.warn('[PlayerView] Estado não encontrado no servidor. Aguardando...');
        }
    } catch (e) {
        console.warn('[PlayerView] Erro no polling de estado:', e);
    }
}

export async function preloadStateImages(state) {
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
    for (let url of dbRefs) {
        if (!resolvedImageCache.has(url) && window.TOME.db) {
            try {
                const doc = await window.TOME.db.getDocument(url);
                if (doc && doc.data) {
                    resolvedImageCache.set(url, doc.data);
                    invalidateStaticCache(); // Refaz o render se uma textura nova carregar
                }
            } catch (err) {}
        }
    }
}

// Bootstrap
async function initApp() {
    try {
        db = new IndexedDBService();
        await db.init();
        window.TOME.db = db;
        console.log('[App V2] IndexedDB inicializado.');
    } catch (e) {
        console.warn('[App V2] Falha ao inicializar IndexedDB:', e);
    }

    initInput();
    initRenderer();
    setupNetworkSync();
    
    if(mesaId !== 'local') {
        pollState();
    }
}

// Start!
initApp();
