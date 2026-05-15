import { Component } from '../core/Component.js';

/**
 * MODAL COMPONENT v1.0
 * High-fidelity, diegetic modal system with Glassmorphism.
 * Replaces native alert() and confirm().
 */
export class Modal extends Component {
    constructor(opts = {}) {
        super(opts);
        this._title = opts.title || 'Aviso';
        this._content = opts.content || '';
        this._type = opts.type || 'info'; // 'info' | 'confirm' | 'danger'
        this._onConfirm = opts.onConfirm || null;
        this._onCancel = opts.onCancel || null;
        this._resolve = null;
    }

    static show(opts) {
        const target = document.createElement('div');
        target.id = `modal-${Date.now()}`;
        document.body.appendChild(target);
        
        const modal = new Modal({
            ...opts,
            element: target
        });
        modal.mount();
        return modal;
    }

    /**
     * Promise-based confirm
     */
    static confirm(title, content, type = 'confirm') {
        return new Promise((resolve) => {
            Modal.show({
                title,
                content,
                type,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }

    /**
     * Promise-based alert
     */
    static alert(title, content, type = 'info') {
        return new Promise((resolve) => {
            Modal.show({
                title,
                content,
                type,
                onConfirm: () => resolve(true)
            });
        });
    }

    template() {
        const color = this._type === 'danger' ? 'var(--danger)' : 'var(--primary)';
        const icon = this._type === 'danger' ? 'fa-triangle-exclamation' : 
                     this._type === 'confirm' ? 'fa-circle-question' : 'fa-circle-info';

        return `
            <div class="modal-overlay animate-fade" style="position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(8px); z-index:20000; display:flex; align-items:center; justify-content:center; padding:20px;">
                <div class="modal-card glass-accent" style="width:min(90%, 500px); border-top:4px solid ${color}; padding:0; overflow:hidden; animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
                    <div class="modal-header" style="padding:20px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:12px;">
                        <i class="fa-solid ${icon}" style="color:${color}; font-size:1.2rem;"></i>
                        <h2 style="margin:0; font-family:'Cinzel', serif; font-size:1.1rem; letter-spacing:1px;">${this._title}</h2>
                    </div>
                    
                    <div class="modal-body" style="padding:25px; font-size:0.9rem; color:var(--text-bright); line-height:1.6;">
                        ${this._content.replace(/\n/g, '<br>')}
                    </div>
                    
                    <div class="modal-footer" style="padding:15px 25px; background:rgba(0,0,0,0.2); display:flex; justify-content:flex-end; gap:10px;">
                        ${this._type === 'confirm' || this._type === 'danger' ? `
                            <button class="btn btn-ghost btn-sm" data-action="cancel">CANCELAR</button>
                        ` : ''}
                        <button class="btn btn-primary btn-sm" style="background:${color}; min-width:100px;" data-action="confirm">
                            ${this._type === 'confirm' || this._type === 'danger' ? 'CONFIRMAR' : 'OK'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    confirm() {
        if (this._onConfirm) this._onConfirm();
        this.close();
    }

    cancel() {
        if (this._onCancel) this._onCancel();
        this.close();
    }

    close() {
        this.unmount();
        this.element.remove();
    }
}
