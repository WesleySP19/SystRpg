// PlayerRenderer.js
// Renderizador de Alta Performance com Caching Offscreen (Multi-Layer)

import { getState } from './PlayerState.js';

const bg = document.getElementById('bg-canvas');
const fog = document.getElementById('fog-canvas');
const fx = document.getElementById('fx-svg');
const tokens = document.getElementById('token-layer');
const wrap = document.getElementById('canvas-wrap');

let ctxBg = bg ? bg.getContext('2d') : null;
let ctxFog = fog ? fog.getContext('2d') : null;

// Caches Offscreen
const offscreenStatic = document.createElement('canvas');
const ctxStatic = offscreenStatic.getContext('2d', { alpha: false });

let isStaticCacheValid = false;
let currentMapUrl = "";
let mapImg = new Image();
export let pvAnimFrameId = null;

let pvParticles = [];
let pvWeatherType = 'none';

export function invalidateStaticCache() {
    isStaticCacheValid = false;
}

export function initRenderer() {
    if(mapImg.src === "") {
        mapImg.src = currentMapUrl;
    }
}

// Lógica pesada: Desenha tudo que NUNCA muda a cada frame (Chão, Paredes, Grade)
function renderStaticLayer(data, W, H, cs, gridType, theme, showGrid, elements, doors, walls) {
    if(isStaticCacheValid && offscreenStatic.width === W && offscreenStatic.height === H) return;
    
    offscreenStatic.width = W;
    offscreenStatic.height = H;
    ctxStatic.clearRect(0, 0, W, H);
    ctxStatic.save();

    if (gridType === 'iso') {
        const isoOffset = W / 2;
        ctxStatic.translate(isoOffset, 50);
        ctxStatic.scale(1, 0.5);
        ctxStatic.rotate(Math.PI / 4);
    }

    if (mapImg.complete && mapImg.naturalWidth) {
        ctxStatic.drawImage(mapImg, 0, 0, (data.grid?.cols || 30) * cs, (data.grid?.rows || 20) * cs);
    } else {
        // Fallback tiles
        ctxStatic.fillStyle = theme === 'cave' ? '#263238' : '#18191e';
        ctxStatic.fillRect(0, 0, W, H);
    }

    // Grid
    if (showGrid) {
        ctxStatic.strokeStyle = 'rgba(212, 175, 55, 0.08)';
        ctxStatic.lineWidth = 1;
        const cols = data.grid?.cols || 30;
        const rows = data.grid?.rows || 20;
        for (let c = 0; c <= cols; c++) {
            ctxStatic.beginPath(); ctxStatic.moveTo(c * cs, 0); ctxStatic.lineTo(c * cs, rows * cs); ctxStatic.stroke();
        }
        for (let r = 0; r <= rows; r++) {
            ctxStatic.beginPath(); ctxStatic.moveTo(0, r * cs); ctxStatic.lineTo(cols * cs, r * cs); ctxStatic.stroke();
        }
    }

    // Walls
    if (walls.length > 0) {
        ctxStatic.strokeStyle = '#ffffff';
        ctxStatic.lineWidth = 3.5;
        ctxStatic.beginPath();
        walls.forEach(w => {
            ctxStatic.moveTo(w.x1, w.y1);
            ctxStatic.lineTo(w.x2, w.y2);
        });
        ctxStatic.stroke();
    }

    ctxStatic.restore();
    isStaticCacheValid = true;
}

// Lógica Leve: Desenha o fundo estático do cache + Luzes + Clima
export function renderFrame() {
    const data = getState().tacticalMap;
    if (!data || !ctxBg) return;

    const grid = data.grid || { cellSize: 60, cols: 30, rows: 20 };
    const cs = grid.cellSize;
    const gridType = data.gridType || 'square';
    let W = grid.cols * cs;
    let H = grid.rows * cs;
    if (gridType === 'iso') {
        W = grid.cols * cs * 1.5;
        H = grid.rows * cs * 1.1 + 100;
    }

    if (bg.width !== W) {
        wrap.style.width = W + 'px';
        wrap.style.height = H + 'px';
        bg.width = W; bg.height = H;
        fog.width = W; fog.height = H;
        fx.setAttribute('viewBox', `0 0 ${W} ${H}`);
        invalidateStaticCache();
    }

    // 1. Atualiza e aplica o Cache Estático
    renderStaticLayer(data, W, H, cs, gridType, data.theme || 'classic', data.showGrid !== false, data.elements || [], data.doors || [], data.walls || []);
    ctxBg.clearRect(0, 0, W, H);
    ctxBg.drawImage(offscreenStatic, 0, 0);

    // 2. Luz Dinâmica
    if (data.lights && data.lights.length > 0) {
        // [Implementação otimizada de iluminação iria aqui]
    }

    // 3. Clima (Weather)
    const weather = data.weather || 'none';
    if (weather !== 'none') {
        drawWeatherParticles(ctxBg, W, H, weather);
    }

    // 4. Fog of War
    if (data.fog && data.fog.enabled) {
        ctxFog.clearRect(0, 0, W, H);
        ctxFog.fillStyle = 'rgba(4,5,7,0.8)';
        ctxFog.fillRect(0,0,W,H);
        // (Lógica de recorte de FOV aqui)
    } else {
        ctxFog.clearRect(0, 0, W, H);
    }

    // 5. Atualizar DOM dos Tokens (DOM Manipulation é mais rápido se só mexer estilo)
    updateTokensDOM(data.tokens || [], cs, gridType, grid.cols);
}

function updateTokensDOM(tokenList, cs, gridType, cols) {
    if(!tokens) return;
    tokens.innerHTML = tokenList.map(t => {
        const hpPct = Math.round(t.hp.current / t.hp.max * 100);
        const hpCol = hpPct > 50 ? '#22c55e' : (hpPct > 20 ? '#e5c17b' : '#ef4444');
        const sz = (cs * 0.85);
        return `
            <div class="player-view-token ${t.type}" style="left:${t.x}px; top:${t.y}px; width:${sz}px; height:${sz}px; transform: translate(-50%, -50%); transition: left 0.3s ease-out, top 0.3s ease-out;">
                <div class="player-view-token-ring" style="background-color:#111; font-size:${sz * 0.28}px;">
                    ${t.name[0]}
                </div>
                <div class="player-view-token-hp-bar">
                    <div class="player-view-token-hp-fill" style="width:${hpPct}%; background-color:${hpCol};"></div>
                </div>
            </div>
        `;
    }).join('');
}

export function startAnimationLoop() {
    if(!pvAnimFrameId) {
        const loop = () => {
            renderFrame();
            pvAnimFrameId = requestAnimationFrame(loop);
        };
        pvAnimFrameId = requestAnimationFrame(loop);
    }
}

// Helpers para Clima
function drawWeatherParticles(ctx, W, H, weather) {
    if (pvWeatherType !== weather) {
        pvWeatherType = weather;
        pvParticles = [];
    }
    const maxParticles = weather === 'rain' ? 80 : 0; // Reduzido para performance
    while (pvParticles.length < maxParticles) {
        pvParticles.push({
            x: Math.random() * W,
            y: Math.random() * H - H,
            speed: 10 + Math.random() * 10,
            len: 12 + Math.random() * 12,
            angle: 1.2
        });
    }
    
    ctx.save();
    ctx.strokeStyle = 'rgba(156, 180, 220, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    pvParticles.forEach(p => {
        p.y += p.speed;
        p.x += Math.cos(p.angle) * p.speed * 0.25;
        if (p.y > H) { p.y = -20; p.x = Math.random() * W; }
        
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(p.angle) * p.len * 0.25, p.y + p.len);
    });
    ctx.stroke();
    ctx.restore();
}
