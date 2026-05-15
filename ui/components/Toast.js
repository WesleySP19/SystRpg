/**
 * TOAST v3.0 — Notification system.
 * Singleton pattern: injects container on first use.
 */
export class Toast {
    static _container = null;

    static show(message, type = 'success') {
        const c = this._getContainer();
        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.innerHTML = `<div class="toast-inner"><i class="fa-solid ${this._icon(type)}"></i><span>${message}</span></div>`;
        c.appendChild(el);

        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateX(40px)';
            setTimeout(() => el.remove(), 400);
        }, 3500);
    }

    static _getContainer() {
        if (this._container) return this._container;

        this._container = document.createElement('div');
        this._container.id = 'toast-container';
        Object.assign(this._container.style, {
            position: 'fixed', bottom: '20px', right: '20px',
            zIndex: '9999', display: 'flex', flexDirection: 'column', gap: '8px'
        });
        document.body.appendChild(this._container);

        const s = document.createElement('style');
        s.textContent = `
            .toast {
                background: rgba(14,14,18,0.92); backdrop-filter: blur(12px);
                border: 1px solid rgba(255,255,255,0.08); color: #e8e8ef;
                padding: 10px 18px; border-radius: 10px;
                font-family: 'Outfit',sans-serif; font-size: 0.85rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
                animation: toastIn 0.35s ease-out;
            }
            .toast-success { border-left: 3px solid #34d399; }
            .toast-error   { border-left: 3px solid #f43f5e; }
            .toast-info    { border-left: 3px solid #60a5fa; }
            .toast-inner { display: flex; align-items: center; gap: 10px; }
            @keyframes toastIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        `;
        document.head.appendChild(s);
        return this._container;
    }

    static _icon(t) {
        return t === 'success' ? 'fa-circle-check' : t === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';
    }
}
