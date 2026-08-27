export default class ParticleEngine {
constructor(canvas, { density = 60, depthRange = [1, 3] } = {}) {
this.canvas = canvas;
this.density = density;
this.depthRange = depthRange;
this.worker = null;
this._onResize = () => this.resize();
}
start() {
if (this.worker) return;
if (!('OffscreenCanvas' in window) || typeof this.canvas.transferControlToOffscreen !== 'function') {
console.warn('[ParticleEngine] OffscreenCanvas não suportado no seu navegador. Otimização V15.9 ignorada.');
return;
}
try {
if (this.canvas._transferred) return;
const offscreen = this.canvas.transferControlToOffscreen();
this.canvas._transferred = true;
this.worker = new Worker('/public/workers/particleWorker.js');
const rect = this.canvas.parentElement
? this.canvas.parentElement.getBoundingClientRect()
: { width: this.canvas.width || window.innerWidth, height: this.canvas.height || window.innerHeight };
offscreen.width = rect.width;
offscreen.height = rect.height;
this.worker.postMessage({
type: 'INIT',
canvas: offscreen,
density: this.density,
depthRange: this.depthRange
}, [offscreen]);
window.addEventListener('resize', this._onResize);
} catch(e) {
console.warn('[ParticleEngine] Falha ao iniciar worker isolado:', e);
}
}
resize() {
if (!this.worker || !this.canvas || !this.canvas.parentElement) return;
const rect = this.canvas.parentElement.getBoundingClientRect();
this.worker.postMessage({
type: 'RESIZE',
width: rect.width,
height: rect.height
});
}
explosion({ x, y, color, count, speed } = {}) {
if (this.worker) {
this.worker.postMessage({
type: 'EXPLOSION',
x, y, color, count, speed
});
}
}
stop() {
if (this.worker) {
this.worker.postMessage({ type: 'STOP' });
setTimeout(() => {
if (this.worker) {
this.worker.terminate();
this.worker = null;
}
}, 100);
}
if (this._onResize) {
window.removeEventListener('resize', this._onResize);
}
}
}