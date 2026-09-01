import { TOME } from './Registry.js';
import { saveLocalState, getLocalState, queueOfflineSave, popOfflineSaves } from './LocalDatabase.js';

/**
 * PersistenceService V22
 * Unified service for local-first persistence via Dexie and real-time sync via Socket.IO
 */
export class PersistenceService {
    /**
     * Saves the state using the active Socket.IO connection.
     * Uses exponential backoff (2s→4s→8s) with 3 retries before falling back to REST.
     */
    static async saveState(filename, data) {
        await this.saveLocalOnly(filename, data);
        return await this.saveNetworkOnly(filename, data);
    }

    static async saveLocalOnly(filename, data) {
        await saveLocalState(filename, data);
    }

    static async saveNetworkOnly(filename, data) {
        // Tenta sincronizar com o servidor (se conectado)
        if (TOME.socket && TOME.socket.connected) {
            const MAX_RETRIES = 3;
            let attempt = 0;

            while (attempt < MAX_RETRIES) {
                try {
                    await PersistenceService._saveViaSocket(filename, data, 2000 * Math.pow(2, attempt));
                    return true;
                } catch (err) {
                    attempt++;
                    if (attempt < MAX_RETRIES) {
                        console.warn(`[PersistenceService] Save timeout (tentativa ${attempt}/${MAX_RETRIES}), retentando em ${2000 * Math.pow(2, attempt)}ms...`);
                    }
                }
            }
            console.warn('[PersistenceService] WebSocket esgotou tentativas, fallback para REST...');
        }

        // Fallback para REST
        try {
            const token = localStorage.getItem('DM_JWT_TOKEN');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/save', {
                method: 'POST',
                headers,
                body: JSON.stringify({ filename, data })
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) TOME.events.emit('AUTH_REQUIRED');
                throw new Error(`REST Save Error: ${res.status}`);
            }
            return true;
        } catch (err) {
            await PersistenceService._queueOfflineSave(filename, data);
            throw err;
        }
    }

    /**
     * Tenta salvar via WebSocket com timeout configurável.
     */
    static _saveViaSocket(filename, data, timeoutMs) {
        return new Promise((resolve, reject) => {
            const onSuccess = (response) => {
                if (response.filename === filename) {
                    TOME.socket.off('save_success', onSuccess);
                    TOME.socket.off('save_error', onError);
                    clearTimeout(timer);
                    resolve(true);
                }
            };

            const onError = (error) => {
                TOME.socket.off('save_success', onSuccess);
                TOME.socket.off('save_error', onError);
                clearTimeout(timer);
                reject(new Error(error.error || 'Unknown save error'));
            };

            TOME.socket.on('save_success', onSuccess);
            TOME.socket.on('save_error', onError);

            const timer = setTimeout(() => {
                TOME.socket.off('save_success', onSuccess);
                TOME.socket.off('save_error', onError);
                reject(new Error(`Save timeout (${timeoutMs}ms)`));
            }, timeoutMs);

            TOME.socket.emit('save_state', { filename, data });
        });
    }

    /**
     * Enfileira o estado no Dexie quando offline.
     */
    static async _queueOfflineSave(filename, data) {
        console.warn('[PersistenceService] Offline. Enfileirando snapshot no IndexedDB.');
        await queueOfflineSave(filename, data);
    }

    /**
     * Inicializa os listeners de rede para sincronizar automaticamente quando a internet voltar.
     */
    static initNetworkListeners() {
        if (this._networkListenersInitialized) return;
        this._networkListenersInitialized = true;

        window.addEventListener('online', async () => {
            console.log('[PersistenceService] Conexão restaurada! Verificando fila offline (Dexie)...');
            const saves = await popOfflineSaves();
            
            if (saves && saves.length > 0) {
                console.log(`[PersistenceService] Sincronizando ${saves.length} estado(s) offline pendente(s)...`);
                try {
                    for (const backup of saves) {
                        await PersistenceService.saveState(backup.filename, backup.data);
                    }
                    console.log('[PersistenceService] Sincronização offline concluída com sucesso.');
                    
                    if (TOME.events) {
                        TOME.events.emit('SYSTEM_NOTIFICATION', { text: 'Sincronização offline concluída!', type: 'success' });
                    }
                } catch (e) {
                    console.error('[PersistenceService] Falha ao sincronizar o estado offline pendente:', e);
                    // Devolve para a fila em caso de erro na reconexão
                    for (const backup of saves) {
                        await queueOfflineSave(backup.filename, backup.data);
                    }
                }
            }
        });
    }

    /**
     * Loads the initial state via Local IndexedDB (First) -> REST -> Cache (Fallback)
     */
    static async loadState(filename) {
        // Tenta sempre carregar do cache local primeiro (Offline-First)
        const localData = await getLocalState(filename);
        if (localData) {
            console.log(`[PersistenceService] Carregado do Local-First (Dexie)`);
            return localData;
        }

        const token = localStorage.getItem('DM_JWT_TOKEN');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`/data/${filename}?t=${Date.now()}`, { headers }).catch(() => null);
        
        if (!response || !response.ok) {
            if (response && (response.status === 401 || response.status === 403)) TOME.events.emit('AUTH_REQUIRED');
            
            throw new Error(`Load Error: Servidor inacessível e sem cache offline.`);
        }
        
        const data = await response.json();
        // Salva localmente para uso futuro
        await saveLocalState(filename, data);
        
        return data;
    }
}
