let ctx = null;
let canvas = null;
let particles = [];
let ambientDensity = 60;
let minDepth = 1;
let maxDepth = 3;
let animationId = null;
function random(min, max) {
return Math.random() * (max - min) + min;
}
function initAmbient(width, height) {
particles = particles.filter(p => p.isBurst);
for (let i = 0; i < ambientDensity; i++) {
const depth = random(minDepth, maxDepth);
const size = (1 / depth) * 3 + 1;
const opacity = 0.4 + (1 - depth / maxDepth) * 0.5;
particles.push({
x: Math.random() * width,
y: Math.random() * height,
vx: (Math.random() - 0.5) * 0.3,
vy: (Math.random() - 0.5) * 0.3,
size,
opacity,
baseOpacity: opacity,
depth,
color: '255,255,255',
isBurst: false
});
}
}
function spawnBurst(x, y, colorStr, count, speedFactor) {
for (let i = 0; i < count; i++) {
const angle = Math.random() * Math.PI * 2;
const speed = Math.random() * speedFactor;
particles.push({
x: x,
y: y,
vx: Math.cos(angle) * speed,
vy: Math.sin(angle) * speed - 1.5, // Leve tendência para cima (gravidade afetará)
size: random(2, 6),
opacity: 1,
depth: 1,
color: colorStr,
isBurst: true,
life: 1.0, // Vida de 1.0 a 0.0
decay: random(0.01, 0.03),
gravity: 0.1
});
}
}
function updateAndDraw() {
if (!ctx || !canvas) return;
const width = canvas.width;
const height = canvas.height;
ctx.clearRect(0, 0, width, height);
for (let i = particles.length - 1; i >= 0; i--) {
const p = particles[i];
if (p.isBurst) {
p.vy += p.gravity;
p.x += p.vx;
p.y += p.vy;
p.life -= p.decay;
p.opacity = p.life;
if (p.life <= 0) {
particles.splice(i, 1);
continue;
}
} else {
p.x += p.vx;
p.y += p.vy;
if (p.x < 0) p.x = width;
if (p.x > width) p.x = 0;
if (p.y < 0) p.y = height;
if (p.y > height) p.y = 0;
}
ctx.beginPath();
ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
ctx.fill();
}
animationId = requestAnimationFrame(updateAndDraw);
}
self.onmessage = function(e) {
const msg = e.data;
if (msg.type === 'INIT') {
canvas = msg.canvas;
ctx = canvas.getContext('2d');
ambientDensity = msg.density || 60;
minDepth = msg.depthRange ? msg.depthRange[0] : 1;
maxDepth = msg.depthRange ? msg.depthRange[1] : 3;
initAmbient(canvas.width, canvas.height);
if (!animationId) {
updateAndDraw();
}
} else if (msg.type === 'RESIZE') {
if (canvas) {
canvas.width = msg.width;
canvas.height = msg.height;
initAmbient(msg.width, msg.height);
}
} else if (msg.type === 'EXPLOSION') {
if (canvas) {
const x = msg.x !== undefined ? msg.x : canvas.width / 2;
const y = msg.y !== undefined ? msg.y : canvas.height / 2;
spawnBurst(x, y, msg.color || '220,38,38', msg.count || 150, msg.speed || 8);
if (!animationId) updateAndDraw();
}
} else if (msg.type === 'STOP') {
if (animationId) {
cancelAnimationFrame(animationId);
animationId = null;
}
if (ctx && canvas) {
ctx.clearRect(0, 0, canvas.width, canvas.height);
}
}
};