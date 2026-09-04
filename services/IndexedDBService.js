/**
 * IndexedDBService — "Resilient Local-First Cache"
 * 100% Offline e nativo, sem qualquer dependência externa ou CDN.
 * Suporta operações por instância (new IndexedDBService()) e chamadas estáticas.
 */
export class IndexedDBService {
    static _dbName = 'RPGMasterDB';
    static _dbVersion = 2;
    static _defaultStore = 'states';
    static _instance = null;

    /**
     * @param {string} dbName - Nome do banco IndexedDB.
     * @param {string} storeName - Object store padrão para estados.
     */
    constructor(dbName = IndexedDBService._dbName, storeName = IndexedDBService._defaultStore) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = null;
        IndexedDBService._instance = this;
    }

    /**
     * Inicializa a conexão com o IndexedDB nativo do navegador.
     * @returns {Promise<IDBDatabase>}
     */
    async init() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            if (typeof indexedDB === 'undefined') {
                return reject(new Error('IndexedDB não suportado neste ambiente.'));
            }

            const request = indexedDB.open(this.dbName, IndexedDBService._dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('states')) {
                    db.createObjectStore('states');
                }
                if (!db.objectStoreNames.contains('media')) {
                    db.createObjectStore('media');
                }
                if (!db.objectStoreNames.contains('state')) {
                    db.createObjectStore('state');
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('[IndexedDBService] Erro ao abrir banco de dados:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    /**
     * Salva um valor serializável sob uma chave no store configurado.
     */
    async set(key, value, storeName = this.storeName) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                const req = store.put(value, key);
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Recupera um valor do store configurado pela chave.
     */
    async get(key, storeName = this.storeName) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction([storeName], 'readonly');
                const store = tx.objectStore(storeName);
                const req = store.get(key);
                req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
                req.onerror = () => reject(req.error);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Remove uma chave do store configurado.
     */
    async delete(key, storeName = this.storeName) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                const req = store.delete(key);
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Armazena um asset de mídia (imagem, token, som em base64/blob).
     */
    async setMedia(key, value) {
        return this.set(key, value, 'media');
    }

    /**
     * Recupera um asset de mídia armazenado.
     */
    async getMedia(key) {
        return this.get(key, 'media');
    }

    /**
     * Limpa os stores principais.
     */
    async clear(storeName = this.storeName) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                const req = store.clear();
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            } catch (err) {
                reject(err);
            }
        });
    }

    // --- Métodos Estáticos (Compatibilidade com FrontendDirectoryService) ---

    static _getDefaultInstance() {
        if (!this._instance) {
            this._instance = new IndexedDBService();
        }
        return this._instance;
    }

    static async set(key, value, storeName) {
        return this._getDefaultInstance().set(key, value, storeName || this._defaultStore);
    }

    static async get(key, storeName) {
        return this._getDefaultInstance().get(key, storeName || this._defaultStore);
    }

    static async delete(key, storeName) {
        return this._getDefaultInstance().delete(key, storeName || this._defaultStore);
    }

    static async remove(key, storeName) {
        return this._getDefaultInstance().delete(key, storeName || this._defaultStore);
    }

    static async setMedia(key, value) {
        return this._getDefaultInstance().setMedia(key, value);
    }

    static async getMedia(key) {
        return this._getDefaultInstance().getMedia(key);
    }
}
