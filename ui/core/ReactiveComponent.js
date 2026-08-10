import { Component } from './Component.js';
import { render } from 'preact';

/**
 * ReactiveComponent
 * A bridge class that inherits from the legacy Vanilla JS Component system 
 * but uses Preact for virtual DOM rendering, unlocking fine-grained reactivity.
 */
export class ReactiveComponent extends Component {
    constructor(opts) {
        super(opts);
        this._preactRoot = null;
        this.storePath = opts.storePath || null;
    }

    /**
     * Override mount to use Preact's render method instead of innerHTML.
     */
    mount(target) {
        if (target) this.element = target;
        this.target = this.element;
        
        if (!this.target) {
            console.error('[ReactiveComponent] Erro: elemento raiz não definido.', this);
            return;
        }
        // Se a store existir, garante que estamos ouvindo mudanças do Vuex-like store legado
        if (this.store) {
            if (this.storePath && this.store.subscribeTo) {
                this.unsubscribe = this.store.subscribeTo(this.storePath, () => this.update());
            } else {
                this.unsubscribe = this.store.subscribe(() => this.update());
            }
        }

        // Setup event delegation once
        if (this.events) {
            for (const [evt, handler] of Object.entries(this.events)) {
                const [eventName, selector] = evt.split(' ', 2);
                this.target.addEventListener(eventName, (e) => {
                    const match = e.target.closest(selector);
                    if (match) {
                        handler.call(this, e, match);
                    }
                });
            }
        }
        
        // Bind action handlers
        this.target.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn && this[actionBtn.dataset.action]) {
                this[actionBtn.dataset.action](e, actionBtn);
            }
        });

        this.onMount();
        this.update(); // Trigger first Preact render
    }

    /**
     * Override update to use Virtual DOM rendering
     */
    update() {
        if (!this.target) return;
        
        // Executa o template Reativo (que deve retornar VNodes do Preact/HTM)
        const vnode = this.template();
        
        // Renderiza no DOM real através do Preact
        render(vnode, this.target);
    }

    /**
     * Override unmount to cleanly unmount Preact trees
     */
    unmount() {
        if (this.unsubscribe) this.unsubscribe();
        if (this.target) {
            render(null, this.target); // Limpa o Virtual DOM
            this.target.innerHTML = '';
        }
        this.onUnmount();
    }
}
