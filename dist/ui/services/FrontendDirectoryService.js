import { IndexedDBService } from './IndexedDBService.js';
export class FrontendDirectoryService {
static _getAuthHeaders(headers = {}) {
const token = localStorage.getItem('DM_JWT_TOKEN');
const newHeaders = { ...headers };
if (token) {
newHeaders['Authorization'] = `Bearer ${token}`;
}
return newHeaders;
}
static forceLogout() {
console.warn('[DirectoryService] Sessão inválida ou expirada. Forçando logout...');
localStorage.removeItem('DM_JWT_TOKEN');
localStorage.removeItem('DM_SESSION_ID');
localStorage.removeItem('DM_SESSION_START');
localStorage.removeItem('DM_ACTIVE_TABLE');
localStorage.removeItem('DM_PHONE');
localStorage.removeItem('DM_MASTER_NAME');
localStorage.removeItem('DM_MASTER_ID');
localStorage.removeItem('DM_INTERNAL_ID');
localStorage.removeItem('TOME_ACTIVE_SESSION');
window.location.reload();
}
static async getMastersDirectory() {
try {
const response = await fetch(`/data/masters_directory.json?t=${Date.now()}`, {
headers: this._getAuthHeaders()
});
if (response.status === 401 || response.status === 403) {
this.forceLogout();
return [];
}
if (!response.ok) throw new Error('Não ok');
const data = await response.json();
return Array.isArray(data) ? data : [];
} catch (err) {
console.warn('[DirectoryService] Diretorio de mestres nao encontrado via HTTP. Tentando IndexedDB.', err);
const localData = await IndexedDBService.get('TOME_MASTERS_DIRECTORY');
if (localData) {
try {
const parsed = typeof localData === 'string' ? JSON.parse(localData) : localData;
return Array.isArray(parsed) ? parsed : [];
} catch(e) {}
}
return [];
}
}
static async saveMastersDirectory(directory) {
try {
const response = await fetch('/api/save', {
method: 'POST',
headers: this._getAuthHeaders({ 'Content-Type': 'application/json' }),
body: JSON.stringify({
filename: 'masters_directory.json',
data: directory
})
});
if (response.status === 401 || response.status === 403) {
console.warn('[DirectoryService] Auth fail on save, falling back to IndexedDB');
await IndexedDBService.set('TOME_MASTERS_DIRECTORY', JSON.stringify(directory));
return true;
}
if (!response.ok) throw new Error('Erro na resposta do servidor ao salvar diretorio de mestres.');
return true;
} catch (err) {
console.warn('[DirectoryService] Erro ao salvar diretorio de mestres no servidor, usando IndexedDB:', err);
await IndexedDBService.set('TOME_MASTERS_DIRECTORY', JSON.stringify(directory));
return true;
}
}
static async getOrCreateMaster(name, phone) {
const directory = await this.getMastersDirectory();
const normalizedPhone = phone.replace(/\D/g, '');
let master = directory.find(m => m.phone.replace(/\D/g, '') === normalizedPhone);
if (!master) {
const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
const masterId = `${cleanName}-${normalizedPhone}`;
let internalId = '';
let isUnique = false;
while (!isUnique) {
const hex = Math.floor(0x100000 + Math.random() * 0xefffff).toString(16).toUpperCase();
internalId = `DGH-MST-${hex}`;
isUnique = !directory.some(m => m.internalId === internalId);
}
master = {
name: name.trim(),
phone: phone.trim(),
masterId: masterId,
internalId: internalId,
tables: [],
createdAt: Date.now()
};
directory.push(master);
await this.saveMastersDirectory(directory);
} else if (name && name.trim() && master.name !== name.trim()) {
master.name = name.trim();
await this.saveMastersDirectory(directory);
}
return master;
}
static async getTablesDirectory() {
try {
const response = await fetch(`/data/tables_directory.json?t=${Date.now()}`, {
headers: this._getAuthHeaders()
});
if (response.status === 401 || response.status === 403) {
this.forceLogout();
return [];
}
if (!response.ok) throw new Error('Não ok');
const data = await response.json();
return Array.isArray(data) ? data : [];
} catch (err) {
console.warn('[DirectoryService] Diretorio de mesas nao encontrado via HTTP. Tentando IndexedDB.', err);
const localData = await IndexedDBService.get('TOME_TABLES_DIRECTORY');
if (localData) {
try {
const parsed = typeof localData === 'string' ? JSON.parse(localData) : localData;
return Array.isArray(parsed) ? parsed : [];
} catch(e) {}
}
return [];
}
}
static async saveTablesDirectory(directory) {
try {
const response = await fetch('/api/save', {
method: 'POST',
headers: this._getAuthHeaders({ 'Content-Type': 'application/json' }),
body: JSON.stringify({
filename: 'tables_directory.json',
data: directory
})
});
if (response.status === 401 || response.status === 403) {
console.warn('[DirectoryService] Auth fail on save, falling back to IndexedDB');
await IndexedDBService.set('TOME_TABLES_DIRECTORY', JSON.stringify(directory));
return true;
}
if (!response.ok) throw new Error('Erro na resposta do servidor ao salvar diretorio.');
return true;
} catch (err) {
console.warn('[DirectoryService] Erro ao salvar diretorio de mesas no servidor, usando IndexedDB:', err);
await IndexedDBService.set('TOME_TABLES_DIRECTORY', JSON.stringify(directory));
return true;
}
}
static async createTable(mestrePhone) {
const directory = await this.getTablesDirectory();
let tableId = '';
let isUnique = false;
while (!isUnique) {
tableId = Math.floor(100000 + Math.random() * 900000).toString();
isUnique = !directory.some(t => t.id === tableId);
}
const newTable = {
id: tableId,
mestrePhone: mestrePhone,
sessionNum: 1,
heroesCount: 0,
createdAt: Date.now()
};
directory.push(newTable);
await this.saveTablesDirectory(directory);
const masterId = localStorage.getItem('DM_MASTER_ID');
if (masterId) {
const mDir = await this.getMastersDirectory();
const master = mDir.find(m => m.masterId === masterId);
if (master) {
if (!master.tables) master.tables = [];
if (!master.tables.includes(tableId)) {
master.tables.push(tableId);
await this.saveMastersDirectory(mDir);
}
}
}
return newTable;
}
static async linkTable(tableId, mestrePhone) {
const directory = await this.getTablesDirectory();
const table = directory.find(t => t.id === tableId);
if (!table) {
throw new Error('Mesa não encontrada. Verifique o ID de 6 dígitos.');
}
if (table.mestrePhone !== mestrePhone) {
table.mestrePhone = mestrePhone;
await this.saveTablesDirectory(directory);
}
const masterId = localStorage.getItem('DM_MASTER_ID');
if (masterId) {
const mDir = await this.getMastersDirectory();
const master = mDir.find(m => m.masterId === masterId);
if (master) {
if (!master.tables) master.tables = [];
if (!master.tables.includes(tableId)) {
master.tables.push(tableId);
await this.saveMastersDirectory(mDir);
}
}
}
return table;
}
}