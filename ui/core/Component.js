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
            this._unsubscribe = this.store.subscribe((state) => this.onStoreUpdate(state));
        }

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
     * Store update hook. Can be overridden in subclasses for granular updates.
     */
    onStoreUpdate(state) {
        this.render();
    }

    /**
     * Memoized Render: Only touches the DOM when output changes.
     * Optionally accepts a subKey for targeting a specific sub-render method.
     */
    render(subKey) {
        if (!this.element || !this._mounted) return;

        if (subKey && typeof this['render_' + subKey] === 'function') {
            requestAnimationFrame(() => {
                if (!this._mounted) return;
                this['render_' + subKey]();
            });
            return;
        }

        const html = this.template().trim();
        if (html === this._lastHTML) return;

        requestAnimationFrame(() => {
            if (!this._mounted) return;
            // Clean up previous event listeners before rendering new ones
            this._eventCleanups.forEach(fn => fn());
            this._eventCleanups = [];

            this.element.innerHTML = html;
            this._lastHTML = html;
            this._bindDelegatedEvents();
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
     * Event delegation: Finds all [data-action] elements
     * and maps them to class methods.
     */
    _bindDelegatedEvents() {
        this.element.querySelectorAll('[data-action]').forEach(el => {
            const action = el.dataset.action;
            if (typeof this[action] === 'function') {
                el.onclick = (e) => this[action](e, el);
            }
        });
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
