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
        
        const borderClass = this._type === 'danger' ? 'border-red-500' : 'border-tomeGold';
        const iconClass = this._type === 'danger' ? 'text-red-500' : 'text-tomeGold';
        const btnClass = this._type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-tomeGold hover:bg-tomeGold-bright';

        return `
            <div class="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-md z-[20000] flex items-center justify-center p-5 animate-in fade-in duration-300">
                <div class="modal-card relative w-full max-w-[500px] border-t-4 ${borderClass} bg-obsidian-900/95 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <div class="modal-header px-6 py-5 border-b border-white/5 flex items-center gap-3">
                        <i class="fa-solid ${icon} ${iconClass} text-xl"></i>
                        <h2 class="m-0 font-cinzel text-lg font-bold tracking-wide text-slate-100">${this._title}</h2>
                    </div>
                    
                    <div class="modal-body px-7 py-6 text-sm text-slate-300 leading-relaxed font-sans">
                        ${this._content.replace(/\n/g, '<br>')}
                    </div>
                    
                    <div class="modal-footer px-7 py-4 bg-black/40 flex justify-end gap-3">
                        ${this._type === 'confirm' || this._type === 'danger' ? `
                            <button class="px-4 py-2 rounded-lg font-sans text-sm font-semibold text-slate-400 bg-white/5 hover:bg-white/10 hover:text-slate-200 transition-colors" data-action="cancel">CANCELAR</button>
                        ` : ''}
                        <button class="px-6 py-2 rounded-lg font-sans text-sm font-semibold text-white ${btnClass} min-w-[100px] transition-colors shadow-lg" data-action="confirm">
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
