/**
 * BASE COMPONENT v3.0
 * Lifecycle-managed UI component with memoized rendering and event delegation.
 * 
 * Features:
 * - Memoized render (skips identical HTML)
 * - requestAnimationFrame for DOM writes
 * - Automatic cleanup on unmount (prevents memory leaks)
 * - data-action event delegation
 * - Scoped query helpers
 */
export class Component {
    constructor(options = {}) {
        this.store = options.store || null;
        this.element = options.element || null;
        this.props = options.props || {};
        this._lastHTML = '';
        this._unsubscribe = null;
        this._eventCleanups = [];
        this._mounted = false;
    }

    /**
     * Mount: Subscribe to store + first render + bind events.
     * Called automatically by the Router / Dashboard.
     */
    mount() {
        if (this._mounted) return;
        this._mounted = true;

        if (this.store) {
            this._unsubscribe = this.store.subscribe(() => this.render());
        }

        this._setupDelegation();
        this.render();
    }

    /**
     * Unmount: Clean up all subscriptions and event listeners.
     */
    unmount() {
        this._mounted = false;
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
        this._eventCleanups.forEach(fn => fn());
        this._eventCleanups = [];
        this.onUnmount();
        if (this.element) this.element.innerHTML = '';
    }

    /**
     * Memoized Render: Only touches the DOM when output changes.
     */
    render() {
        if (!this.element || !this._mounted) return;

        const html = this.template();
        
        // Fast-path memoization: compare length and boundaries before full string comparison
        if (this._lastHTML && 
            html.length === this._lastHTML.length && 
            html[0] === this._lastHTML[0] && 
            html[html.length-1] === this._lastHTML[html.length-1] &&
            html === this._lastHTML) return;

        requestAnimationFrame(() => {
            if (!this._mounted) return;
            this.element.innerHTML = html;
            this._lastHTML = html;
            // No need to call _bindDelegatedEvents here if we use root delegation
            this.onMount();
        });
    }

    /**
     * Template: Override in subclasses. Must return HTML string.
     */
    template() { return ''; }

    /**
     * Lifecycle hooks — override in subclasses.
     */
    onMount() {}
    onUnmount() {}

    /**
     * Root-level event delegation: Captures all clicks and routes [data-action].
     */
    _setupDelegation() {
        this._delegateHandler = (e) => {
            const el = e.target.closest('[data-action]');
            if (!el) return;
            
            const action = el.dataset.action;
            if (typeof this[action] === 'function') {
                this[action](e, el);
            }
        };
        this.element.addEventListener('click', this._delegateHandler);
        this._eventCleanups.push(() => this.element.removeEventListener('click', this._delegateHandler));
    }

    /**
     * Safe event listener that auto-cleans on unmount.
     */
    listen(target, event, handler) {
        target.addEventListener(event, handler);
        this._eventCleanups.push(() => target.removeEventListener(event, handler));
    }

    /**
     * Scoped query helpers.
     */
    $(selector) { return this.element?.querySelector(selector) || null; }
    $$(selector) { return this.element?.querySelectorAll(selector) || []; }
}
