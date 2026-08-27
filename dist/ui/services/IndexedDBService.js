export class IndexedDBService {
static _dbName = 'TomeRPGDB';
static _dbVersion = 1;
static _dbPromise = null;
static async getDB() {
if (!this._dbPromise) {
this._dbPromise = new Promise((resolve, reject) => {
const request = indexedDB.open(this._dbName, this._dbVersion);
request.onupgradeneeded = (event) => {
const db = event.target.result;
if (!db.objectStoreNames.contains('state')) {
db.createObjectStore('state');
}
};
request.onsuccess = (event) => resolve(event.target.result);
request.onerror = (event) => reject(event.target.error);
});
}
return this._dbPromise;
}
static async set(key, value) {
const db = await this.getDB();
return new Promise((resolve, reject) => {
const tx = db.transaction('state', 'readwrite');
const store = tx.objectStore('state');
const request = store.put(value, key);
request.onsuccess = () => resolve();
request.onerror = (e) => reject(e.target.error);
});
}
static async get(key) {
const db = await this.getDB();
return new Promise((resolve, reject) => {
const tx = db.transaction('state', 'readonly');
const store = tx.objectStore('state');
const request = store.get(key);
request.onsuccess = () => resolve(request.result);
request.onerror = (e) => reject(e.target.error);
});
}
static async remove(key) {
const db = await this.getDB();
return new Promise((resolve, reject) => {
const tx = db.transaction('state', 'readwrite');
const store = tx.objectStore('state');
const request = store.delete(key);
request.onsuccess = () => resolve();
request.onerror = (e) => reject(e.target.error);
});
}
}