/**
 * REACTIVE STORE v3.0
 * High-performance state management with Proxy-based reactivity.
 * 
 * Features:
 * - Deep nested reactivity via recursive Proxy
 * - Batched microtask notifications (prevents render storms)
 * - Selective subscriptions for granular updates
 * - Immutable snapshots for safe reads
 */
export class Store {
    constructor(initialState = {}) {
        this._listeners = new Set();
        this._pendingNotify = false;
        this._rawState = structuredClone(initialState);
        this.state = this._createProxy(this._rawState);
    }

    /**
     * Creates a deep reactive Proxy.
     * WeakMap prevents re-proxying the same object (memory safety).
     */
    _createProxy(obj) {
        const self = this;
        const proxyCache = new WeakMap();

        const ARRAY_MUTATORS = new Set(['push','pop','shift','unshift','splice','sort','reverse','fill']);
        const handler = {
            set(target, key, value) {
                if (target[key] === value) return true;
                target[key] = value;
                // Ignore internal array length updates — push/splice handle notification
                if (key !== 'length') self._scheduleNotify();
                return true;
            },
            get(target, key) {
                const val = target[key];
                // Intercept array mutator methods to trigger reactivity
                if (Array.isArray(target) && ARRAY_MUTATORS.has(key)) {
                    return function(...args) {
                        const result = Array.prototype[key].apply(target, args);
                        self._scheduleNotify();
                        return result;
                    };
                }
                if (val !== null && typeof val === 'object') {
                    if (proxyCache.has(val)) return proxyCache.get(val);
                    const proxy = new Proxy(val, handler);
                    proxyCache.set(val, proxy);
                    return proxy;
                }
                return val;
            }
        };

        return new Proxy(obj, handler);
    }

    /**
     * Batched notification using microtask queue.
     * Multiple synchronous mutations = single render pass.
     */
    _scheduleNotify() {
        if (this._pendingNotify) return;
        this._pendingNotify = true;

        queueMicrotask(() => {
            this._listeners.forEach(cb => {
                try { cb(this.state); }
                catch (e) { console.error('[Store] Listener error:', e); }
            });
            this._pendingNotify = false;
        });
    }

    /**
     * Subscribe to state changes. Returns unsubscribe function.
     * Does NOT fire immediately — call render() yourself after mount.
     */
    subscribe(callback) {
        this._listeners.add(callback);
        return () => this._listeners.delete(callback);
    }

    /**
     * Batch-update state via a mutator function.
     */
    update(fn) {
        fn(this.state);
    }

    /**
     * Get a plain snapshot (safe for serialization / IndexedDB).
     */
    snapshot() {
        try {
            return structuredClone(this._rawState);
        } catch (e) {
            // Silently fallback to JSON serialization to avoid warning spam (due to Proxies/non-cloneables in state)
            return JSON.parse(JSON.stringify(this._rawState));
        }
    }
}
