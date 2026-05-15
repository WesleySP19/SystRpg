/**
 * REACTIVE STORE v4.0 — "Granular Pulse" Edition
 * High-performance state management with selective reactivity.
 */
export class Store {
    constructor(initialState = {}) {
        this._listeners = new Set(); // Global listeners
        this._keyListeners = new Map(); // Selective listeners: key -> Set(cb)
        this._pendingNotify = false;
        this._changedKeys = new Set();
        this._proxyCache = new WeakMap(); // Instance-level proxy cache
        
        this._rawState = structuredClone(initialState);
        this.state = this._createProxy(this._rawState, '');
    }

    /**
     * Creates a deep reactive Proxy with path tracking.
     */
    _createProxy(obj, path) {
        const self = this;

        const handler = {
            set(target, key, value) {
                if (target[key] === value) return true;
                
                // Invalidate cached proxy for replaced objects
                const old = target[key];
                if (old !== null && typeof old === 'object') {
                    self._proxyCache.delete(old);
                }
                
                target[key] = value;
                const fullPath = path ? `${path}.${key}` : key;
                
                // Track the specific key that changed
                self._changedKeys.add(key); // Root level key
                if (path) self._changedKeys.add(path.split('.')[0]); // Main branch key
                
                self._scheduleNotify();
                return true;
            },
            get(target, key) {
                const val = target[key];
                if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
                    if (self._proxyCache.has(val)) return self._proxyCache.get(val);
                    const newPath = path ? `${path}.${key}` : key;
                    const proxy = self._createProxy(val, newPath);
                    self._proxyCache.set(val, proxy);
                    return proxy;
                }
                return val;
            }
        };

        return new Proxy(obj, handler);
    }

    /**
     * Batched notification using microtask queue.
     * Notifies only relevant listeners based on changed keys.
     */
    _scheduleNotify() {
        if (this._pendingNotify) return;
        this._pendingNotify = true;

        queueMicrotask(() => {
            const keys = Array.from(this._changedKeys);
            
            // 1. Notify Global Listeners
            this._listeners.forEach(cb => {
                try { cb(this.state, keys); }
                catch (e) { console.error('[Store] Global Listener error:', e); }
            });

            // 2. Notify Selective Listeners
            keys.forEach(key => {
                const listeners = this._keyListeners.get(key);
                if (listeners) {
                    listeners.forEach(cb => {
                        try { cb(this.state[key]); }
                        catch (e) { console.error(`[Store] Key Listener error (${key}):`, e); }
                    });
                }
            });

            this._changedKeys.clear();
            this._pendingNotify = false;
        });
    }

    /**
     * Subscribe to state changes.
     * @param {Function} callback 
     * @param {String} key Optional key to listen to specifically.
     */
    subscribe(callback, key = null) {
        if (key) {
            if (!this._keyListeners.has(key)) {
                this._keyListeners.set(key, new Set());
            }
            this._keyListeners.get(key).add(callback);
            return () => this._keyListeners.get(key).delete(callback);
        } else {
            this._listeners.add(callback);
            return () => this._listeners.delete(callback);
        }
    }

    /**
     * Batch-update state via a mutator function.
     */
    update(fn) {
        fn(this.state);
    }

    /**
     * Get a plain snapshot.
     */
    snapshot() {
        return JSON.parse(JSON.stringify(this._rawState));
    }
}
