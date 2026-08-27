import { TOME } from '../core/Registry.js';
import { FrontendDirectoryService } from '../ui/services/FrontendDirectoryService.js';
import { MediaService } from './MediaService.js';
import { SessionManager } from './SessionManager.js';
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
console.log('[Persistence] Iniciando motor de Auto-Save (3s debounce)...');
TOME.store.subscribe(() => {
if (this._saveTimeout) clearTimeout(this._saveTimeout);
this._saveTimeout = setTimeout(() => {
this.save();
}, 3000);
});
}
static async getMastersDirectory() { return FrontendDirectoryService.getMastersDirectory(); }
static async saveMastersDirectory(directory) { return FrontendDirectoryService.saveMastersDirectory(directory); }
static async getOrCreateMaster(name, phone) { return FrontendDirectoryService.getOrCreateMaster(name, phone); }
static async getTablesDirectory() { return FrontendDirectoryService.getTablesDirectory(); }
static async saveTablesDirectory(directory) { return FrontendDirectoryService.saveTablesDirectory(directory); }
static async createTable(mestrePhone) { return FrontendDirectoryService.createTable(mestrePhone); }
static async linkTable(tableId, mestrePhone) { return FrontendDirectoryService.linkTable(tableId, mestrePhone); }
async save() { return SessionManager.save(this.filename, TOME.store); }
async load() { return SessionManager.load(this.filename, TOME.store); }
async switchSession(newFilename) { return SessionManager.switchSession(newFilename, TOME.store); }
static async startNewSession(tableId) { return SessionManager.startNewSession(tableId); }
async updateTableStats(state) { return SessionManager.updateTableStats(this.filename, state); }
static async resolveAndUpload(filename, value) { return MediaService.resolveAndUpload(filename, value); }
static async uploadImage(filename, base64) { return MediaService.uploadImage(filename, base64); }
}