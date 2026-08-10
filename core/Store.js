import { signal } from '@preact/signals';

/**
 * REACTIVE STORE v15.0 — Leve, Direto e Sem Conflitos Yjs
 *
 * Eliminamos o SyncedStore do frontend para evitar a duplicação de instâncias
 * de Yjs ('Yjs was already imported') e o erro 'cannot set new elements on root doc'.
 * A sincronização CRDT é feita exclusivamente pelo CRDTManager (via WebSocket),
 * enquanto o Store cuida apenas do estado local reativo da UI.
 */
export class Store {
    constructor(initialState = {}) {
        this._pendingNotify = false;

        this._data = this._sanitize(initialState);
        this.signal = signal(this._data);

        // Sub-divisão reativa para evitar re-render global (V17.8)
        this.pathSignals = {};
        for (const key of Object.keys(this._data)) {
            this.pathSignals[key] = signal(this._data[key]);
        }

        this.state = new Proxy(this._data, {
            get: (target, prop) => {
                return target[prop];
            },
            set: (target, prop, value) => {
                const cloned = this._deepClone(value);
                target[prop] = cloned;
                
                if (!this.pathSignals[prop]) {
                    this.pathSignals[prop] = signal(cloned);
                } else {
                    this.pathSignals[prop].value = cloned;
                }

                this._scheduleNotify();
                this.signal.value = { ...this._data };
                return true;
            }
        });
    }

    _sanitize(obj) {
        if (!obj || typeof obj !== 'object') return {};
        const copy = this._deepClone(obj);
        let result = { ...copy };
        while (result && result.state && typeof result.state === 'object' && !Array.isArray(result.state)) {
            const nested = result.state;
            delete result.state;
            result = { ...nested, ...result };
        }
        return result;
    }

    _deepClone(value) {
        if (value === null || value === undefined) return value;
        if (typeof value !== 'object') return value;
        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return value;
        }
    }

    _scheduleNotify() {
        if (this._pendingNotify) return;
        this._pendingNotify = true;
        queueMicrotask(() => {
            this._pendingNotify = false;
        });
    }

    update(fn) {
        fn(this.state);
        this._scheduleNotify();
        this.signal.value = { ...this._data };
        
        // Push updates to pathSignals
        for (const key of Object.keys(this._data)) {
            if (!this.pathSignals[key]) {
                this.pathSignals[key] = signal(this._data[key]);
            } else {
                this.pathSignals[key].value = this._data[key];
            }
        }
    }

    merge(partial) {
        if (!partial || typeof partial !== 'object') return;
        const clean = this._sanitize(partial);
        Object.assign(this._data, clean);
        this._scheduleNotify();
        this.signal.value = { ...this._data };
        
        for (const key of Object.keys(clean)) {
            if (!this.pathSignals[key]) {
                this.pathSignals[key] = signal(this._data[key]);
            } else {
                this.pathSignals[key].value = this._data[key];
            }
        }
    }

    subscribe(listener) {
        return this.signal.subscribe(listener);
    }

    subscribeTo(path, listener) {
        if (!this.pathSignals[path]) {
            this.pathSignals[path] = signal(this._data[path]);
        }
        return this.pathSignals[path].subscribe(listener);
    }

    /**
     * Retorna snapshot JSON limpo do estado atual, sem referências circulares.
     */
    snapshot() {
        try {
            return this._deepClone(this._data) || {};
        } catch {
            return {};
        }
    }
}
