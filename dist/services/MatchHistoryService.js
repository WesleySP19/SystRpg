function getStorageKey() {
const activeTable = localStorage.getItem('DM_ACTIVE_TABLE') || '';
return activeTable ? `TOME_MATCH_HISTORY_${activeTable}` : 'TOME_MATCH_HISTORY';
}
function getSessionListKey() {
const activeTable = localStorage.getItem('DM_ACTIVE_TABLE') || '';
return activeTable ? `TOME_SESSION_LIST_${activeTable}` : 'TOME_SESSION_LIST';
}
function readJson(key, fallback) {
try {
const raw = localStorage.getItem(key);
return raw ? JSON.parse(raw) : fallback;
} catch {
return fallback;
}
}
function writeJson(key, value) {
localStorage.setItem(key, JSON.stringify(value));
}
function formatDate(ts) {
if (!ts) return '—';
return new Date(ts).toLocaleString('pt-BR', {
day: '2-digit', month: '2-digit', year: 'numeric',
hour: '2-digit', minute: '2-digit'
});
}
export class MatchHistoryService {
static _read() {
return readJson(getStorageKey(), []);
}
static _write(list) {
writeJson(getStorageKey(), list);
}
static _getSessionList() {
const list = readJson(getSessionListKey(), []);
if (!list.some(s => s.file === 'state.json')) {
list.unshift({ name: 'Sessão Padrão', file: 'state.json' });
writeJson(getSessionListKey(), list);
}
return list;
}
static syncFromSessionList() {
const sessions = this._getSessionList();
const history = this._read();
const byFile = new Map(history.map(h => [h.file, h]));
const now = Date.now();
sessions.forEach(s => {
if (!byFile.has(s.file)) {
byFile.set(s.file, {
id: s.file,
file: s.file,
name: s.name || s.file,
createdAt: now,
lastPlayedAt: null,
sessionTitle: '',
heroCount: 0,
journalCount: 0,
combatRounds: 0,
combatActive: false
});
} else {
const entry = byFile.get(s.file);
if (s.name && entry.name !== s.name) entry.name = s.name;
}
});
this._write(Array.from(byFile.values()));
}
static register(name, file, meta = {}) {
if (!file.endsWith('.json')) file += '.json';
const history = this._read();
const now = Date.now();
const existing = history.find(h => h.file === file);
if (existing) {
existing.name = name;
existing.lastPlayedAt = now;
Object.assign(existing, meta);
} else {
history.push({
id: file,
file,
name,
createdAt: now,
lastPlayedAt: now,
sessionTitle: '',
heroCount: 0,
journalCount: 0,
combatRounds: 0,
combatActive: false,
...meta
});
}
this._write(history);
this.syncFromSessionList();
}
static touchSession(file, state = null) {
if (!file) return;
if (!file.endsWith('.json')) file += '.json';
this.syncFromSessionList();
const history = this._read();
let entry = history.find(h => h.file === file);
const now = Date.now();
if (!entry) {
const sessions = this._getSessionList();
const match = sessions.find(s => s.file === file);
entry = {
id: file,
file,
name: match?.name || file,
createdAt: now,
lastPlayedAt: now,
sessionTitle: '',
heroCount: 0,
journalCount: 0,
combatRounds: 0,
combatActive: false
};
history.push(entry);
}
entry.lastPlayedAt = now;
if (state) this._applyStateSnapshot(entry, state);
this._write(history);
}
static _applyStateSnapshot(entry, state) {
entry.sessionTitle = state.sessionTitle || entry.sessionTitle || '';
entry.heroCount = (state.players || []).length;
entry.journalCount = (state.journalEntries || []).length;
entry.combatRounds = state.combatRound || 0;
entry.combatActive = !!state.combatActive;
}
static updateCurrent(state, filename) {
const file = filename || localStorage.getItem('TOME_ACTIVE_SESSION') || 'state.json';
this.touchSession(file, state);
}
static getAll() {
this.syncFromSessionList();
return this._read()
.slice()
.sort((a, b) => (b.lastPlayedAt || b.createdAt || 0) - (a.lastPlayedAt || a.createdAt || 0));
}
static getActiveFile() {
return localStorage.getItem('TOME_ACTIVE_SESSION') || 'state.json';
}
static remove(file) {
if (!file.endsWith('.json')) file += '.json';
const history = this._read().filter(h => h.file !== file);
this._write(history);
const sessions = this._getSessionList().filter(s => s.file !== file);
writeJson(getSessionListKey(), sessions);
}
static formatCreated(entry) {
return formatDate(entry.createdAt);
}
static formatLastPlayed(entry) {
return entry.lastPlayedAt ? formatDate(entry.lastPlayedAt) : 'Nunca aberta';
}
static getSummary() {
const all = this.getAll();
const activeFile = this.getActiveFile();
const active = all.find(e => e.file === activeFile);
return {
total: all.length,
activeName: active?.name || 'Sessão Padrão',
activeFile
};
}
}