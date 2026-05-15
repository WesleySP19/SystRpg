/**
 * EVENT BUS v3.0
 * Pub/Sub for decoupled communication between services and UI.
 * 
 * Features:
 * - Namespaced events
 * - One-time listeners (once)
 * - Returns unsubscribe function
 */
class EventBus {
    constructor() {
        this._events = new Map();
    }

    /**
     * Subscribe to an event. Returns unsubscribe function.
     */
    on(event, callback) {
        if (!this._events.has(event)) this._events.set(event, new Set());
        this._events.get(event).add(callback);
        return () => this.off(event, callback);
    }

    /**
     * Subscribe once — auto-removes after first fire.
     */
    once(event, callback) {
        const wrapper = (data) => {
            this.off(event, wrapper);
            callback(data);
        };
        return this.on(event, wrapper);
    }

    off(event, callback) {
        const listeners = this._events.get(event);
        if (listeners) listeners.delete(callback);
    }

    emit(event, data) {
        const listeners = this._events.get(event);
        if (!listeners) return;
        listeners.forEach(cb => {
            try { cb(data); }
            catch (e) { console.error(`[EventBus] Error in '${event}':`, e); }
        });
    }
}

export const events = new EventBus();
