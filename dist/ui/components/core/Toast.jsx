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
background: linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(15, 17, 26, 0.8) 100%);
backdrop-filter: blur(24px) saturate(130%);
-webkit-backdrop-filter: blur(24px) saturate(130%);
border: 1px solid rgba(212, 175, 55, 0.25);
border-top: 1px solid rgba(212, 175, 55, 0.4);
color: #e8e8ef;
padding: 12px 20px; border-radius: 12px;
font-family: 'Outfit',sans-serif; font-size: 0.85rem; font-weight: 500;
box-shadow: 0 15px 35px rgba(0,0,0,0.9), 0 0 25px rgba(212, 175, 55, 0.25);
transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
animation: toastIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-success { border-left: 3px solid #34d399; box-shadow: 0 15px 35px rgba(0,0,0,0.9), 0 0 25px rgba(52, 211, 153, 0.25); }
.toast-error   { border-left: 3px solid #f43f5e; box-shadow: 0 15px 35px rgba(0,0,0,0.9), 0 0 25px rgba(244, 63, 94, 0.25); }
.toast-info    { border-left: 3px solid #60a5fa; box-shadow: 0 15px 35px rgba(0,0,0,0.9), 0 0 25px rgba(96, 165, 250, 0.25); }
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