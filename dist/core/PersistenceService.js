import { TOME } from './Registry.js';
import { saveLocalState, getLocalState, queueOfflineSave, popOfflineSaves } from './LocalDatabase.js';
export class PersistenceService {
static async saveState(filename, data) {
await saveLocalState(filename, data);
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
static async _queueOfflineSave(filename, data) {
console.warn('[PersistenceService] Offline. Enfileirando snapshot no IndexedDB.');
await queueOfflineSave(filename, data);
}
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
for (const backup of saves) {
await queueOfflineSave(backup.filename, backup.data);
}
}
}
});
}
static async loadState(filename) {
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
await saveLocalState(filename, data);
return data;
}
}