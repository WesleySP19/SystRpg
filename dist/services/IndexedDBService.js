export class IndexedDBService {
constructor(dbName = 'RPGMasterDB', storeName = 'states') {
this.dbName = dbName;
this.storeName = storeName;
this.db = null;
}
async init() {
if (this.db) return this.db;
const { openDB } = await import('https://unpkg.com/idb?module');
this.db = await openDB(this.dbName, 2, {
upgrade(db) {
if (!db.objectStoreNames.contains('states')) {
db.createObjectStore('states');
}
if (!db.objectStoreNames.contains('media')) {
db.createObjectStore('media');
}
},
});
return this.db;
}
async set(key, value) {
const db = await this.init();
return db.put(this.storeName, value, key);
}
async get(key) {
const db = await this.init();
return db.get(this.storeName, key);
}
async delete(key) {
const db = await this.init();
return db.delete(this.storeName, key);
}
async setMedia(key, value) {
const db = await this.init();
return db.put('media', value, key);
}
async getMedia(key) {
const db = await this.init();
return db.get('media', key);
}
async clear() {
const db = await this.init();
await db.clear('media');
return db.clear(this.storeName);
}
}