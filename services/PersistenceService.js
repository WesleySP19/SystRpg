import { TOME } from '../core/Registry.js';
import { FrontendDirectoryService } from '../ui/services/FrontendDirectoryService.js';
import { MediaService } from './MediaService.js';
import { SessionManager } from './SessionManager.js';

/**
 * PERSISTENCE SERVICE v5.0 — "Orquestrador Facade"
 * Agora atua apenas como uma casca de compatibilidade, delegando as operações pesadas
 * para os novos sub-módulos: DirectoryService, MediaService e SessionManager.
 */
export class PersistenceService {
    constructor() {
        this.filename = localStorage.getItem('TOME_ACTIVE_SESSION') || 'state.json';
    }

    async init() {
        console.log('[Persistence] Inicializando Orquestrador de Sessão (Facade)...');
        
        window.addEventListener('storage', (e) => {
            if (e.key === `TOME_PRO_STATE_${this.filename}` && e.newValue) {
                try {
                    const data = JSON.parse(e.newValue);
                    const current = TOME.store.snapshot();
                    if (JSON.stringify(current) !== e.newValue) {
                        TOME.store.update(s => Object.assign(s, data));
                    }
                } catch (err) {
                    console.error('[Persistence] Falha ao reativo-sincronizar abas:', err);
                }
            }
        });
        return Promise.resolve();
    }

    startAutoSave() {
        console.log('[Persistence] Iniciando motor de Auto-Save (Local 200ms, Network 3s)...');
        TOME.store.subscribe(() => {
            // Local-First: Debounce curtíssimo (200ms) para gravação instantânea no IndexedDB
            if (this._localSaveTimeout) clearTimeout(this._localSaveTimeout);
            this._localSaveTimeout = setTimeout(() => {
                this.saveLocalOnly();
            }, 200);

            // Network: Debounce longo (3s) para agrupar uploads pro servidor/WebSocket
            if (this._networkSaveTimeout) clearTimeout(this._networkSaveTimeout);
            this._networkSaveTimeout = setTimeout(() => {
                this.saveNetworkOnly();
            }, 3000);
        });
    }

    // --- DELEGATE TO DIRECTORY SERVICE ---
    static async getMastersDirectory() { return FrontendDirectoryService.getMastersDirectory(); }
    static async saveMastersDirectory(directory) { return FrontendDirectoryService.saveMastersDirectory(directory); }
    static async getOrCreateMaster(name, phone) { return FrontendDirectoryService.getOrCreateMaster(name, phone); }
    static async getTablesDirectory() { return FrontendDirectoryService.getTablesDirectory(); }
    static async saveTablesDirectory(directory) { return FrontendDirectoryService.saveTablesDirectory(directory); }
    static async createTable(mestrePhone) { return FrontendDirectoryService.createTable(mestrePhone); }
    static async linkTable(tableId, mestrePhone) { return FrontendDirectoryService.linkTable(tableId, mestrePhone); }

    // --- DELEGATE TO SESSION MANAGER ---
    async save() { return SessionManager.save(this.filename, TOME.store); }
    async saveLocalOnly() { return SessionManager.saveLocalOnly(this.filename, TOME.store); }
    async saveNetworkOnly() { return SessionManager.saveNetworkOnly(this.filename, TOME.store); }
    async load() { return SessionManager.load(this.filename, TOME.store); }
    async switchSession(newFilename) { return SessionManager.switchSession(newFilename, TOME.store); }
    static async startNewSession(tableId) { return SessionManager.startNewSession(tableId); }
    async updateTableStats(state) { return SessionManager.updateTableStats(this.filename, state); }

    // --- DELEGATE TO MEDIA SERVICE ---
    static async resolveAndUpload(filename, value) { return MediaService.resolveAndUpload(filename, value); }
    static async uploadImage(filename, base64) { return MediaService.uploadImage(filename, base64); }
}
