import { TOME } from '../core/Registry.js';
import { MediaService } from './MediaService.js';
import { FrontendDirectoryService } from '../ui/services/FrontendDirectoryService.js';

/**
 * SESSION MANAGER
 * Centraliza a lógica de Save e Load do arquivo JSON principal da sessão atual.
 */
const DEFAULT_INITIAL_STATE = {
    activeView: 'home',
    activeTab: 'dashboard',
    players: [],
    monsters: [],
    savedNPCs: [],
    initiativeOrder: [],
    concentration: [],
    combatRound: 0,
    combatActive: false,
    journalEntries: [],
    sessionNotes: '',
    sessionTitle: '',
    sessionNumber: 1,
    sessionsHistory: [],
    campaigns: [],
    activeCampaignId: null,
    quests: [],
    tacticalMap: { fog: null, mapUrl: null, tokens: [] },
    lastLoot: null,
    audioMuted: false,
    currentTheme: 'default',
    currentEnvironment: 'default',
    resources: { potions: 0, scrolls: 0 },
    xpDistributed: 0,
    schemaVersion: 5
};

export class SessionManager {
    static _isSaving = false;
    static _isApplyingNetworkState = false;

    static _getAuthHeaders(headers = {}) {
        const token = localStorage.getItem('DM_JWT_TOKEN');
        const newHeaders = { ...headers };
        if (token) {
            newHeaders['Authorization'] = `Bearer ${token}`;
        }
        return newHeaders;
    }

    static async save(filename, store) {
        if (this._isSaving || this._isApplyingNetworkState) return false;
        this._isSaving = true;

        try {
            const rawState = store.snapshot();
            const cleanState = await MediaService.extractMedia(rawState, filename.split('.')[0]);
            
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: this._getAuthHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({
                    filename: filename,
                    data: cleanState
                })
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.warn('[SessionManager] Sessão remota expirada. O jogo continuará salvando no Cache Local/CRDT, mas a sincronização com o banco pode falhar.');
                    // TOME.events.emit('AUTH_REQUIRED'); // Removido para evitar loop de recarregamento
                }
                throw new Error(`Erro na resposta do servidor: ${response.status}`);
            }
            
            this.updateTableStats(filename, cleanState);
            this._isSaving = false;
            return true;
        } catch (e) {
            console.error('[SessionManager] Sync Failed (Server):', e);
            this._isSaving = false;
            return false;
        }
    }

    static async load(filename, store) {
        try {
            console.log(`[SessionManager] Solicitando state do Node (arquivo: ${filename})`);
            const response = await fetch(`/data/${filename}?t=${Date.now()}`, {
                headers: this._getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    TOME.events.emit('AUTH_REQUIRED');
                }
                console.warn(`[SessionManager] Server state file /data/${filename} not found or unauthorized. Using default.`);
                store.update(s => Object.assign(s, DEFAULT_INITIAL_STATE));
                return false;
            }

            const data = await response.json();
            const loadedState = await MediaService.restoreMedia(data);
            
            if (loadedState.activeView === 'login') loadedState.activeView = 'home';
            if (loadedState.activeTab === 'map') loadedState.activeTab = 'dmtable';
            
            store.update(s => Object.assign(s, loadedState));
            console.log('[SessionManager] Carregamento Concluído!');
            return true;
        } catch (e) {
            console.error('[SessionManager] Falha ao carregar estado do servidor:', e);
            store.update(s => Object.assign(s, DEFAULT_INITIAL_STATE));
            return false;
        }
    }

    static async startNewSession(tableId) {
        const table = await FrontendDirectoryService.linkTable(tableId, localStorage.getItem('DM_MASTER_PHONE') || 'local');
        
        const newState = {
            ...DEFAULT_INITIAL_STATE,
            sessionNumber: table.sessionNum,
            sessionTitle: `Mesa #${tableId}`,
            activeTab: 'dmtable',
            activeView: 'home'
        };

        const filename = `state_${tableId}.json`;
        localStorage.setItem('DM_ACTIVE_TABLE', tableId);
        localStorage.setItem('TOME_ACTIVE_SESSION', filename);

        const response = await fetch('/api/save', {
            method: 'POST',
            headers: this._getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                filename: filename,
                data: newState
            })
        });

        if (!response.ok) throw new Error('Erro ao inicializar arquivo da mesa no servidor.');
        return filename;
    }

    static async switchSession(newFilename, store) {
        console.log(`[SessionManager] Trocando sessão atual para: ${newFilename}`);
        const response = await fetch('/api/save', {
            method: 'POST',
            headers: this._getAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
                filename: newFilename,
                data: store.snapshot()
            })
        });
        
        localStorage.setItem('TOME_ACTIVE_SESSION', newFilename);
        window.location.reload();
    }

    static async updateTableStats(filename, state) {
        const tableId = localStorage.getItem('DM_ACTIVE_TABLE');
        if (!tableId) return;

        const directory = await FrontendDirectoryService.getTablesDirectory();
        const table = directory.find(t => t.id === tableId);
        if (table) {
            table.heroesCount = (state.players || []).length;
            table.sessionNum = state.sessionNumber || 1;
            table.lastActive = Date.now();
            await FrontendDirectoryService.saveTablesDirectory(directory);
        }
    }
}
