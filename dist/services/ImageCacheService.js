export class ImageCacheService {
static dbName = 'TomeV22CacheDB';
static storeName = 'images';
static db = null;
static initPromise = null;
static async init() {
if (this.initPromise) return this.initPromise;
this.initPromise = new Promise((resolve, reject) => {
const request = indexedDB.open(this.dbName, 1);
request.onupgradeneeded = (e) => {
const db = e.target.result;
if (!db.objectStoreNames.contains(this.storeName)) {
db.createObjectStore(this.storeName, { keyPath: 'url' });
}
};
request.onsuccess = (e) => {
this.db = e.target.result;
resolve();
};
request.onerror = (e) => reject(e.target.error);
});
return this.initPromise;
}
static async getBlobUrl(url) {
if (!url) return null;
if (url.startsWith('data:') || url.startsWith('blob:')) return url;
await this.init();
return new Promise((resolve, reject) => {
const tx = this.db.transaction(this.storeName, 'readonly');
const store = tx.objectStore(this.storeName);
const request = store.get(url);
request.onsuccess = async (e) => {
const result = e.target.result;
if (result && result.blob) {
resolve(URL.createObjectURL(result.blob));
} else {
try {
const response = await fetch(url, { cache: 'force-cache' });
if (!response.ok) throw new Error('Network error');
const blob = await response.blob();
const writeTx = this.db.transaction(this.storeName, 'readwrite');
writeTx.objectStore(this.storeName).put({ url, blob });
resolve(URL.createObjectURL(blob));
} catch (fetchErr) {
console.error('ImageCacheService fetch error:', fetchErr);
resolve(url); // Fallback to raw URL
}
}
};
request.onerror = () => resolve(url);
});
}
}