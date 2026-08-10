/**
 * CRDT Manager v15.0 — Yjs WebSocket (Offline/LAN Ready)
 * Gerencia o documento compartilhado em tempo real.
 * Usa APENAS o arquivo vendor local para evitar duplicação de instâncias Yjs.
 */
import * as Y from '/public/vendor/yjs.js';
import { WebsocketProvider } from '/public/vendor/y-websocket.js';

export class CRDTManager {
    static ydoc = new Y.Doc();
    static provider = null;
    static connectionStatus = 'disconnected';
    static _connectCalled = false;

    // Shared state arrays/maps
    static chatHistory = CRDTManager.ydoc.getArray('chatHistory');
    static battleEntities = CRDTManager.ydoc.getMap('battleEntities');
    static tacticalState = CRDTManager.ydoc.getMap('tacticalState');
    static tacticalTokens = CRDTManager.ydoc.getMap('tacticalTokens');

    /**
     * Otimização para evitar travamento da thread durante sync intensivo do Yjs.
     * Envolve o callback num requestAnimationFrame.
     */
    static observeOptimized(yType, callback) {
        let queued = false;
        const handler = (event) => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => {
                queued = false;
                callback(event);
            });
        };
        yType.observe(handler);
        return () => yType.unobserve(handler);
    }

    static connect(tableId, userName = 'Jogador') {
        // Evita reconexões desnecessárias para o mesmo tableId
        if (this._connectCalled && this.provider && this.provider.roomname === `table-${tableId}`) {
            return;
        }
        this._connectCalled = true;

        if (this.provider) {
            this.provider.destroy();
            this.provider = null;
        }

        // Determina a URL do WebSocket a partir da origem atual
        let serverUrl;
        try {
            const origin = window.location.origin;
            serverUrl = origin.replace(/^http/, 'ws');
            if (serverUrl.endsWith('/')) serverUrl = serverUrl.slice(0, -1);
            serverUrl += '/yjs';
        } catch {
            serverUrl = 'ws://localhost:3000/yjs';
        }

        const roomName = `table-${tableId}`;

        try {
            this.provider = new WebsocketProvider(serverUrl, roomName, this.ydoc, {
                // Tenta reconectar a cada 2s em caso de falha (resiliente a desconexão LAN)
                WebSocketPolyfill: typeof WebSocket !== 'undefined' ? WebSocket : undefined
            });

            this.provider.on('status', event => {
                this.connectionStatus = event.status;
                console.log(`[CRDTManager] Status: ${event.status} (sala: ${roomName})`);
                window.dispatchEvent(new CustomEvent('crdt:status', { detail: event.status }));
            });

        } catch (err) {
            console.warn('[CRDTManager] Falha ao conectar WebSocket Yjs. Modo offline ativo.', err.message);
            this.connectionStatus = 'offline';
        }
    }

    static disconnect() {
        if (this.provider) {
            this.provider.disconnect();
            this.provider = null;
        }
        this._connectCalled = false;
        this.connectionStatus = 'disconnected';
    }
}
