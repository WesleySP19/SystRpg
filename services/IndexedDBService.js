/*
 * IndexedDB Service
 * Simple wrapper around idb (https://github.com/jakearchibald/idb) for fast local caching.
 * The service opens a database with a single object store (named by "storeName")
 * and provides async methods to set, get and delete entries.
 */

export class IndexedDBService {
    /**
     * @param {string} dbName - Name of the IndexedDB database.
     * @param {string} storeName - Name of the object store where key/value pairs are kept.
     */
    constructor(dbName = 'RPGMasterDB', storeName = 'states') {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
    }

    /**
     * Initialise the database. Returns a promise that resolves when the DB is ready.
     */
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

    /**
     * Store a value under a given key.
     * @param {string} key - The filename or identifier.
     * @param {any} value - JSON‑serialisable value.
     */
    async set(key, value) {
        const db = await this.init();
        return db.put(this.storeName, value, key);
    }

    /**
     * Retrieve a value by key.
     * @param {string} key
     * @returns {Promise<any|null>}
     */
    async get(key) {
        const db = await this.init();
        return db.get(this.storeName, key);
    }

    /**
     * Delete a stored entry.
     */
    async delete(key) {
        const db = await this.init();
        return db.delete(this.storeName, key);
    }

    /**
     * Store a media asset (e.g. Base64 portrait/token).
     */
    async setMedia(key, value) {
        const db = await this.init();
        return db.put('media', value, key);
    }

    /**
     * Retrieve a stored media asset.
     */
    async getMedia(key) {
        const db = await this.init();
        return db.get('media', key);
    }

    /**
     * Clear the entire store (useful for debugging).
     */
    async clear() {
        const db = await this.init();
        await db.clear('media');
        return db.clear(this.storeName);
    }
}
