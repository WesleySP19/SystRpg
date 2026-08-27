import { TOME } from '../core/Registry.js';
import { battleManager } from './BattleManager.js';
class FXEngineService {
constructor() {
this._bc = null;
this._injectedStyles = false;
this._overlayRoot = null;
}
init() {
this._injectCSS();
this._ensureOverlayRoot();
if (typeof BroadcastChannel !== 'undefined') {
this._bc = new BroadcastChannel('tome_fx_mesh');
this._bc.onmessage = (ev) => {
if (ev && ev.data && ev.data.event) {
this.play(ev.data.event, ev.data.targetName, ev.data.details, false);
}
};
}
battleManager.on('ENTITY_SLAIN', ({ entity, name, id }) => {
this.trigger('ENTITY_SLAIN', name || entity?.name || 'Monstro Desconhecido', id || 'm-slain');
});
battleManager.on('HERO_FALLEN', ({ entity, name, id }) => {
this.trigger('HERO_FALLEN', name || entity?.name || 'Herói Bravo', id || 'p-fallen');
});
if (TOME?.events) {
TOME.events.on('FX_TRIGGERED', (data) => {
this.play(data.event, data.targetName, data.details, false);
});
}
window.addEventListener('tome:socket_ready', () => this._bindSocket());
if (window.TOME?.socket) {
this._bindSocket();
}
console.log('[FXEngine] Sistema de Animações Cinematográficas inicializado com sucesso.');
}
_bindSocket() {
const socket = window.TOME?.socket;
if (socket && !socket._fxBound) {
socket._fxBound = true;
socket.on('fx_animation', (data) => {
if (data && data.event) {
this.play(data.event, data.targetName, data.details, false);
}
});
}
}
async trigger(eventName, targetName, targetId, details = {}) {
console.log(`[FXEngine] Disparando evento cinemático: ${eventName} para [${targetName}]`);
this.play(eventName, targetName, details, true);
if (this._bc) {
this._bc.postMessage({ event: eventName, targetName, targetId, details });
}
if (window.TOME?.socket) {
window.TOME.socket.emit('fx_animation', { event: eventName, targetName, targetId, details });
}
try {
fetch('/api/fx/trigger', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ event: eventName, targetName, targetId, details })
}).catch(() => {});
let chatText = '';
if (eventName === 'ENTITY_SLAIN') {
chatText = `⚡ ANIQUILAÇÃO ARCANA: A criatura hostil [${targetName}] foi inteiramente destruída no campo de batalha!`;
} else if (eventName === 'HERO_FALLEN') {
chatText = `🥀 RÉQUIEM DOS BRAVOS: O destino sela o fim... O herói [${targetName}] sucumbiu ferido em seu último teste de sobrevivência!`;
}
if (chatText) {
const tableId = TOME?.state?.currentTableId || 'global';
fetch('/api/chat/send', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
tableId,
message: {
sender: 'Sistema Arcano',
conteudo: chatText,
isSystem: true,
tipo: 'sistema'
}
})
}).catch(() => {});
}
} catch (err) {
console.warn('[FXEngine] Aviso no envio HTTP de rede:', err.message);
}
if (TOME?.store?.update) {
TOME.store.update(s => {
s.journalEntries = s.journalEntries || [];
s.journalEntries.push({
type: eventName === 'ENTITY_SLAIN' ? 'combat' : 'danger',
title: eventName === 'ENTITY_SLAIN' ? `Monstro Aniquilado: ${targetName}` : `Morte em Batalha: ${targetName}`,
content: eventName === 'ENTITY_SLAIN'
? `A ameaça imposta por ${targetName} foi erradicada em combate ardente.`
: `O aventureiro ${targetName} pereceu no campo, deixando uma lenda de honra e sacrifício.`,
timestamp: Date.now()
});
});
}
}
play(eventName, targetName = 'Alvo Arcano', details = {}, isOrigin = false) {
this._ensureOverlayRoot();
if (eventName === 'ENTITY_SLAIN') {
this._playMonsterSlain(targetName);
} else if (eventName === 'HERO_FALLEN') {
this._playHeroFallen(targetName);
}
}
_playMonsterSlain(name) {
if (typeof navigator.vibrate === 'function') {
navigator.vibrate([150, 80, 150, 80, 400]);
}
const appEl = document.getElementById('app') || document.body;
appEl.classList.add('fx-screen-shake');
setTimeout(() => appEl.classList.remove('fx-screen-shake'), 600);
const el = document.createElement('div');
el.className = 'fx-banner fx-banner-slain';
el.innerHTML = `
<div class="fx-icon-pulse" style="font-size: 3.5rem; margin-bottom: 8px;">⚔️ 💀 ⚔️</div>
<h1 style="font-family: 'Cinzel', serif; color: #f87171; font-size: 2.2rem; font-weight: 900; text-shadow: 0 0 25px rgba(239, 68, 68, 0.9); margin: 0; letter-spacing: 2px;">ANIQUILAÇÃO!</h1>
<div style="width: 60%; height: 2px; background: linear-gradient(to right, transparent, #ef4444, transparent); margin: 10px auto;"></div>
<p style="font-size: 1.4rem; color: #f3f4f6; margin: 0; text-shadow: 0 2px 8px rgba(0,0,0,0.9); font-family: 'Inter', sans-serif;">
<strong style="color: #ffdda1; font-size: 1.6rem; text-transform: uppercase;">${name}</strong> foi destroçado em combate!
</p>
`;
this._overlayRoot.appendChild(el);
const flash = document.createElement('div');
flash.className = 'fx-screen-flash-red';
document.body.appendChild(flash);
setTimeout(() => flash.remove(), 800);
setTimeout(() => {
el.style.opacity = '0';
el.style.transform = 'scale(0.8) translateY(-30px)';
setTimeout(() => el.remove(), 500);
}, 3800);
}
_playHeroFallen(name) {
if (typeof navigator.vibrate === 'function') {
navigator.vibrate([400, 200, 400, 300, 700]);
}
const appEl = document.getElementById('app') || document.body;
appEl.classList.add('fx-mourning-screen');
setTimeout(() => appEl.classList.remove('fx-mourning-screen'), 7000);
const el = document.createElement('div');
el.className = 'fx-banner fx-banner-fallen';
el.innerHTML = `
<div class="fx-icon-pulse" style="font-size: 4rem; margin-bottom: 12px;">🥀 🖤 🕊️</div>
<h1 style="font-family: 'Cinzel', serif; color: #e5c17b; font-size: 2.5rem; font-weight: 900; text-shadow: 0 0 30px rgba(229, 193, 123, 0.8); margin: 0; letter-spacing: 3px;">O RÉQUIEM DOS BRAVOS</h1>
<div style="width: 75%; height: 2px; background: linear-gradient(to right, transparent, #e5c17b, #a855f7, transparent); margin: 14px auto;"></div>
<p style="font-size: 1.3rem; color: #e5e7eb; margin: 0; line-height: 1.6; max-width: 650px; text-shadow: 0 2px 10px rgba(0,0,0,0.9); font-family: 'Inter', sans-serif;">
As chamas de um destino heroico se apagam no silêncio da eternidade...<br/>
O herói <strong style="color: #f87171; font-size: 1.7rem; font-family: 'Cinzel', serif; text-decoration: underline;">${name}</strong> tombou em batalha!
</p>
`;
this._overlayRoot.appendChild(el);
const darkVignette = document.createElement('div');
darkVignette.className = 'fx-screen-vignette';
document.body.appendChild(darkVignette);
setTimeout(() => darkVignette.remove(), 7000);
setTimeout(() => {
el.style.opacity = '0';
el.style.transform = 'scale(0.9) translateY(20px)';
setTimeout(() => el.remove(), 800);
}, 6500);
}
_ensureOverlayRoot() {
if (!this._overlayRoot) {
let el = document.getElementById('tome-fx-root');
if (!el) {
el = document.createElement('div');
el.id = 'tome-fx-root';
el.style.cssText = 'position: fixed; inset: 0; pointer-events: none; z-index: 99999; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 20px; overflow: hidden;';
document.body.appendChild(el);
}
this._overlayRoot = el;
}
}
_injectCSS() {
if (this._injectedStyles || document.getElementById('tome-fx-styles')) return;
this._injectedStyles = true;
const link = document.createElement('link');
link.id = 'tome-fx-styles';
link.rel = 'stylesheet';
link.href = '/css/tome-fx.css';
document.head.appendChild(link);
}
}
export const FXEngine = new FXEngineService();