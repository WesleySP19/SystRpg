export class DiceBoxService {
constructor() {
this.box = null;
this.initialized = false;
this.containerId = 'dice-box-container';
if (!document.getElementById(this.containerId)) {
const container = document.createElement('div');
container.id = this.containerId;
document.body.appendChild(container);
}
}
async init() {
if (this.initialized) return;
try {
const { default: DiceBox } = await import('https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/dice-box.es.min.js');
this.box = new DiceBox(`#${this.containerId}`, {
assetPath: 'https://unpkg.com/@3d-dice/dice-box@1.1.3/dist/assets/',
theme: 'default',
themeColor: '#c5a059',
scale: 6,
spinForce: 5,
throwForce: 7,
gravity: 3,
mass: 2,
friction: 0.8
});
await this.box.init();
const canvas = document.querySelector(`#${this.containerId} canvas`);
if (canvas) {
canvas.style.pointerEvents = 'none';
}
this.initialized = true;
console.log('[DiceBoxService] Motor de física 3D inicializado com sucesso.');
} catch (error) {
console.error('[DiceBoxService] Erro ao inicializar motor 3D:', error);
throw error;
}
}
async roll(notation) {
if (!this.initialized) await this.init();
let rollString = typeof notation === 'number' ? `1d${notation}` : notation;
try {
const results = await this.box.roll(rollString);
let total = 0;
if (Array.isArray(results)) {
total = results.reduce((acc, group) => acc + (group.value || 0), 0);
} else if (results.value) {
total = results.value;
} else {
total = results;
}
setTimeout(() => {
this.box.clear();
}, 3000);
return total;
} catch (err) {
console.error('[DiceBoxService] Erro ao rolar:', err);
return Math.floor(Math.random() * (typeof notation === 'number' ? notation : 20)) + 1;
}
}
}