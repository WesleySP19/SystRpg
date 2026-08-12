import { TOME } from './Registry.js';

/**
 * PersistenceService V19.3.0
 * Unified service for real-time and persistent state synchronization via Socket.IO
 */
export class PersistenceService {
    /**
     * Saves the state using the active Socket.IO connection.
     * Fallbacks to REST API if Socket is unavailable (e.g. initial load or network issues).
     */
    static async saveState(filename, data) {
        return new Promise((resolve, reject) => {
            if (TOME.socket && TOME.socket.connected) {
                // Configura listener temporário para pegar a resposta do save
                const onSuccess = (response) => {
                    if (response.filename === filename) {
                        TOME.socket.off('save_success', onSuccess);
                        TOME.socket.off('save_error', onError);
                        resolve(true);
                    }
                };

                const onError = (error) => {
                    TOME.socket.off('save_success', onSuccess);
                    TOME.socket.off('save_error', onError);
                    console.error('[PersistenceService] Save error from server:', error);
                    reject(new Error(error.error || 'Unknown save error'));
                };

                TOME.socket.on('save_success', onSuccess);
                TOME.socket.on('save_error', onError);

                // Timeout de segurança (5 segundos)
                setTimeout(() => {
                    TOME.socket.off('save_success', onSuccess);
                    TOME.socket.off('save_error', onError);
                    reject(new Error('Save timeout via WebSocket'));
                }, 5000);

                TOME.socket.emit('save_state', { filename, data });
            } else {
                // Fallback para REST se o socket caiu
                const token = localStorage.getItem('DM_JWT_TOKEN');
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                fetch('/api/save', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ filename, data })
                }).then(res => {
                    if (!res.ok) {
                        if (res.status === 401 || res.status === 403) TOME.events.emit('AUTH_REQUIRED');
                        throw new Error(`REST Save Error: ${res.status}`);
                    }
                    resolve(true);
                }).catch(err => {
                    PersistenceService._queueOfflineSave(filename, data);
                    reject(err);
                });
            }
        });
    }

    /**
     * Enfileira o estado no IndexedDB quando offline, mantendo apenas o mais recente.
     */
    static _queueOfflineSave(filename, data) {
        if (!TOME.db) return;
        console.warn('[PersistenceService] Offline. Salvando snapshot no cache local (IndexedDB).');
        TOME.db.set('offline_state_backup', { filename, data, timestamp: Date.now() });
    }

    /**
     * Inicializa os listeners de rede para sincronizar automaticamente quando a internet voltar.
     */
    static initNetworkListeners() {
        if (this._networkListenersInitialized) return;
        this._networkListenersInitialized = true;

        window.addEventListener('online', async () => {
            console.log('[PersistenceService] Conexão restaurada! Verificando fila offline...');
            if (TOME.db) {
                const backup = await TOME.db.get('offline_state_backup');
                if (backup) {
                    console.log('[PersistenceService] Sincronizando estado offline pendente...');
                    try {
                        await PersistenceService.saveState(backup.filename, backup.data);
                        await TOME.db.delete('offline_state_backup');
                        console.log('[PersistenceService] Sincronização offline concluída com sucesso.');
                        
                        if (TOME.events) {
                            TOME.events.emit('SYSTEM_NOTIFICATION', { text: 'Sincronização offline concluída!', type: 'success' });
                        }
                    } catch (e) {
                        console.error('[PersistenceService] Falha ao sincronizar o estado offline pendente:', e);
                    }
                }
            }
        });
    }

    /**
     * Loads the initial state via REST (HTTP GET is cacheable and faster for initial heavy payloads)
     */
    static async loadState(filename) {
        const token = localStorage.getItem('DM_JWT_TOKEN');
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`/data/${filename}?t=${Date.now()}`, { headers }).catch(() => null);
        
        if (!response || !response.ok) {
            if (response && (response.status === 401 || response.status === 403)) TOME.events.emit('AUTH_REQUIRED');
            
            // Se falhou (offline), tenta recuperar do backup local mais recente
            console.warn('[PersistenceService] Falha ao carregar estado da rede. Tentando cache offline...');
            if (TOME.db) {
                const backup = await TOME.db.get('offline_state_backup');
                if (backup && backup.filename === filename) {
                    console.log('[PersistenceService] Estado carregado do cache offline local!');
                    return backup.data;
                }
            }
            throw new Error(`Load Error: Servidor inacessível e sem cache offline.`);
        }
        return response.json();
    }
}
