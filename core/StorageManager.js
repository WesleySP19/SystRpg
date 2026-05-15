/**
 * STORAGE MANAGER v1.0
 * Handles large binary data (Images/Maps) using IndexedDB.
 * Keeps the main State (localStorage) light and fast.
 */
export class StorageManager {
    constructor() {
        this._dbName = 'TOME_STORAGE';
        this._storeName = 'blobs';
        this._db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this._dbName, 1);
            
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this._storeName)) {
                    db.createObjectStore(this._storeName);
                }
            };

            request.onsuccess = (e) => {
                this._db = e.target.result;
                console.log('[Storage] IndexedDB initialized.');
                resolve();
            };

            request.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * Store a value (usually base64 or blob) with a unique key.
     */
    async set(key, value) {
        if (!this._db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this._db.transaction(this._storeName, 'readwrite');
            const store = tx.objectStore(this._storeName);
            const req = store.put(value, key);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * Retrieve a value by key.
     */
    async get(key) {
        if (!this._db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this._db.transaction(this._storeName, 'readonly');
            const store = tx.objectStore(this._storeName);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * Delete a value by key.
     */
    async delete(key) {
        if (!this._db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this._db.transaction(this._storeName, 'readwrite');
            const store = tx.objectStore(this._storeName);
            const req = store.delete(key);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * Clear the entire storage.
     */
    async clear() {
        if (!this._db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this._db.transaction(this._storeName, 'readwrite');
            const store = tx.objectStore(this._storeName);
            const req = store.clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }
}

export const Storage = new StorageManager();
