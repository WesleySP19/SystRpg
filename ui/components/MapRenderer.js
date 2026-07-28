import { LightingEngine } from '../../engine/LightingEngine.js';
import { TokenEngine, CONDITIONS } from '../../engine/TokenEngine.js';
import { MonsterArt } from '../../services/MonsterArt.js';

/**
 * MAP RENDERER v2.0
 * Implements the 6-Layer Rendering Pipeline (L0: bg tiles, L1: terrain, L2: FOW, L3: tokens, L4: lighting, L5: UI).
 */
export class MapRenderer {
    constructor(mapManager) {
        this.map = mapManager;
        this._bgCacheCanvas = null;
        this._bgCacheInvalidated = true;
        this._particles = [];
        this._weatherType = 'none';
    }

    invalidateCache() {
        this._bgCacheInvalidated = true;
    }

    /**
     * Core rendering pipeline coordinator
     */
    render() {
        if (!this.map._ctxGrid) return;
        
        const ctx = this.map._ctxGrid;
        const W = this.map._W || 900;
        const H = this.map._H || 540;
        
        // Clear canvas for redrawing
        ctx.clearRect(0, 0, W, H);
        
        const cs = this.map._grid.cellSize;
        const zoom = this.map._zoom;
        const ox = this.map._pan.x;
        const oy = this.map._pan.y;

        ctx.save();
        ctx.translate(ox, oy);
        ctx.scale(zoom, zoom);

        if (this.map._gridType === 'iso') {
            const isoW = this.map._grid.cols * cs * 1.5;
            const isoOffset = isoW / 2;
            ctx.translate(isoOffset, 50);
            ctx.scale(1, 0.5);
            ctx.rotate(Math.PI / 4);
        }

        // ── LAYER 0: BACKGROUND TILES (L0) ──
        this._renderL0Background(ctx);

        // ── LAYER 1: TERRAIN & OBSTACLES (L1) ──
        this._renderL1Terrain(ctx, cs);

        // ── LAYER 5 (Part A): GRID LINES & MOVEMENT (L5) ──
        this._renderL5Grid(ctx, cs);

        // ── LAYER 1 (Part B): DOORS & WALLS (L1) ──
        this._renderL1WallsAndDoors(ctx, cs);

        // ── LAYER 5 (Part B): PREVIEWS (L5) ──
        this._renderL5Previews(ctx, cs);

        ctx.restore();

        // ── LAYER 2: FOW (L2) ──
        // Fog canvas renders independently inside the manager's gameloop

        // ── LAYER 3: TOKENS / ENTITIES (L3) ──
        this._drawTokens();

        // ── LAYER 4: LIGHTING (L4) ──
        this._renderL4Lighting(ctx, zoom);

        // ── LAYER 5 (Part C): TEXTS & BILLBOARDED LABELS (L5) ──
        this._renderL5Labels(ctx, zoom);

        // ── LAYER 5 (Part E): TACTICAL PINGS ──
        this._renderL5Pings(ctx, zoom);

        // ── LAYER 5 (Part D): WEATHER PARTICLES ──
        this._updateWeatherParticles(W, H, this.map._weather);
        this._drawWeather(ctx, W, H, this.map._weather);
    }

    /* ── Layer 0: Background Tiles ───────────────────────────────── */
    
    _renderL0Background(ctx) {
        if (this._bgCacheInvalidated || !this._bgCacheCanvas) {
            this._renderStaticBackground();
        }
        ctx.drawImage(this._bgCacheCanvas, 0, 0);
    }

    _renderStaticBackground() {
        let W = this.map._mapWidth;
        let H = this.map._mapHeight;
        if (this.map._gridType === 'iso') {
            W = this.map._grid.cols * this.map._grid.cellSize * 1.5;
            H = this.map._grid.rows * this.map._grid.cellSize * 1.1 + 100;
        }
        
        if (!this._bgCacheCanvas) {
            this._bgCacheCanvas = document.createElement('canvas');
        }
        if (this._bgCacheCanvas.width !== W || this._bgCacheCanvas.height !== H) {
            this._bgCacheCanvas.width = W;
            this._bgCacheCanvas.height = H;
        }
        const bctx = this._bgCacheCanvas.getContext('2d', { alpha: false });
        
        bctx.fillStyle = '#101216';
        bctx.fillRect(0, 0, W, H);
        
        if (this.map._mapImg) {
            bctx.drawImage(this.map._mapImg, 0, 0, W, H);
        } else {
            // Procedural tiles
            for (let r = 0; r < this.map._grid.rows; r++) {
                for (let c = 0; c < this.map._grid.cols; c++) {
                    this._drawCellBackground(bctx, c, r, this.map._grid.cellSize, this.map._mapTheme);
                }
            }
        }
        this._bgCacheInvalidated = false;
    }

    _drawCellBackground(ctx, col, row, cs, theme) {
        const x = col * cs;
        const y = row * cs;
        
        if (theme === 'tavern') {
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(x, y, cs, cs);
            ctx.strokeStyle = '#2d1a15';
            ctx.lineWidth = 1;
            const ph = cs / 3;
            ctx.strokeRect(x, y, cs, cs);
            ctx.beginPath();
            ctx.moveTo(x, y + ph); ctx.lineTo(x + cs, y + ph);
            ctx.moveTo(x, y + ph * 2); ctx.lineTo(x + cs, y + ph * 2);
            ctx.stroke();
        } else if (theme === 'cave') {
            ctx.fillStyle = '#263238';
            ctx.fillRect(x, y, cs, cs);
            ctx.fillStyle = '#1e272c';
            ctx.beginPath();
            ctx.arc(x + cs*0.35, y + cs*0.4, cs*0.25, 0, Math.PI*2);
            ctx.arc(x + cs*0.7, y + cs*0.75, cs*0.2, 0, Math.PI*2);
            ctx.fill();
        } else if (theme === 'scifi') {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(x, y, cs, cs);
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y, cs, cs);
        } else if (theme === 'scrawl') {
            ctx.fillStyle = '#f4f1e1';
            ctx.fillRect(x, y, cs, cs);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        } else if (theme === 'scrawl-classic') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, y, cs, cs);
            ctx.fillStyle = '#000000';
            ctx.fillRect(x - 1, y - 1, 2, 2);
        } else {
            // Classic dungeon
            ctx.fillStyle = '#18191e';
            ctx.fillRect(x, y, cs, cs);
            ctx.strokeStyle = '#111216';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cs, cs);
        }
    }

    /* ── Layer 1: Terrain & Obstacles ────────────────────────────── */
    
    _renderL1Terrain(ctx, cs) {
        this.map._mapElements.forEach(el => {
            if (el.type === 'rect') {
                if (el.theme === 'grass') ctx.fillStyle = '#2d4c1e';
                else if (el.theme === 'water') ctx.fillStyle = 'rgba(28, 96, 122, 0.8)';
                else if (el.theme === 'room_stone') ctx.fillStyle = '#2c2e33';
                else if (el.theme === 'corridor') ctx.fillStyle = '#1e1f22';
                else if (el.theme === 'cave') ctx.fillStyle = '#1e272c';
                else ctx.fillStyle = '#22232a';
                
                ctx.fillRect(Math.min(el.x1, el.x2), Math.min(el.y1, el.y2), Math.abs(el.x2-el.x1), Math.abs(el.y2-el.y1));
            } else if (el.type === 'tree') {
                ctx.save();
                ctx.translate(el.x, el.y);
                ctx.rotate(el.rotation || 0);
                
                ctx.beginPath();
                ctx.arc(4, 4, el.radius, 0, Math.PI*2);
                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(0, 0, el.radius, 0, Math.PI*2);
                ctx.fillStyle = '#1e3814';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(-el.radius*0.15, -el.radius*0.15, el.radius*0.8, 0, Math.PI*2);
                ctx.fillStyle = '#2a4b1c';
                ctx.fill();
                ctx.restore();
            } else if (el.type === 'prop') {
                ctx.save();
                ctx.translate(el.x, el.y);
                if (el.rotation) ctx.rotate(el.rotation * Math.PI/180);
                
                if (el.propType === 'brazier' || el.propType === 'campfire') {
                    ctx.fillStyle = '#424242';
                    ctx.beginPath();
                    ctx.arc(0, 0, el.radius, 0, Math.PI*2);
                    ctx.fill();
                    ctx.fillStyle = '#e65100';
                    ctx.beginPath();
                    ctx.arc(0, 0, el.radius*0.6, 0, Math.PI*2);
                    ctx.fill();
                } else if (el.propType === 'table') {
                    ctx.fillStyle = '#5d4037';
                    ctx.fillRect(-el.radius, -el.radius*0.6, el.radius*2, el.radius*1.2);
                } else if (el.propType === 'altar') {
                    ctx.fillStyle = '#607d8b';
                    ctx.fillRect(-el.radius, -el.radius*0.5, el.radius*2, el.radius);
                } else if (el.propType === 'statue') {
                    ctx.fillStyle = '#78909c';
                    ctx.beginPath();
                    ctx.arc(0, 0, el.radius, 0, Math.PI*2);
                    ctx.fill();
                }
                ctx.restore();
            } else if (el.type === 'circle') {
                ctx.fillStyle = '#22232a';
                ctx.beginPath();
                ctx.arc(el.cx, el.cy, el.r, 0, Math.PI*2);
                ctx.fill();
            } else if (el.type === 'freehand') {
                if (el.points && el.points.length > 1) {
                    ctx.strokeStyle = '#34d399';
                    ctx.lineWidth = 3;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.beginPath();
                    el.points.forEach((p, idx) => {
                        if (idx === 0) ctx.moveTo(p.x, p.y);
                        else ctx.lineTo(p.x, p.y);
                    });
                    ctx.stroke();
                }
            } else if (el.type === 'stairs') {
                ctx.strokeStyle = '#c5a059';
                ctx.lineWidth = 2.5;
                const dx = el.x2 - el.x1;
                const dy = el.y2 - el.y1;
                const len = Math.hypot(dx, dy);
                const angle = Math.atan2(dy, dx);
                
                ctx.save();
                ctx.translate(el.x1, el.y1);
                ctx.rotate(angle);
                ctx.strokeRect(0, -cs / 3, len, cs * 2 / 3);
                
                const steps = Math.max(3, Math.floor(len / 12));
                ctx.beginPath();
                for (let i = 1; i < steps; i++) {
                    const sx = (len / steps) * i;
                    ctx.moveTo(sx, -cs / 3);
                    ctx.lineTo(sx, cs / 3);
                }
                ctx.stroke();
                ctx.restore();
            }
        });
    }

    _renderL1WallsAndDoors(ctx, cs) {
        // Render doors
        const doors = this.map._grid.getDoors ? this.map._grid.getDoors() : [];
        doors.forEach(d => {
            ctx.strokeStyle = d.isOpen ? 'rgba(52, 211, 153, 0.8)' : 'rgba(239, 68, 68, 0.9)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(d.x1, d.y1);
            ctx.lineTo(d.x2, d.y2);
            ctx.stroke();
            
            const mx = (d.x1 + d.x2)/2;
            const my = (d.y1 + d.y2)/2;
            ctx.fillStyle = d.isOpen ? '#10b981' : '#ef4444';
            ctx.beginPath();
            ctx.arc(mx, my, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Render walls
        const isScrawl = this.map._mapTheme === 'scrawl' || this.map._mapTheme === 'scrawl-classic';
        ctx.strokeStyle = this.map._mapTheme === 'scifi' ? '#06b6d4' : this.map._mapTheme === 'tavern' ? '#6d4c41' : this.map._mapTheme === 'cave' ? '#78909c' : isScrawl ? '#000000' : '#c5a059';
        ctx.lineWidth = isScrawl ? 4 : 3.5;
        ctx.lineCap = isScrawl ? 'square' : 'round';
        ctx.lineJoin = 'miter';

        const walls = this.map._grid.getWalls();
        ctx.beginPath();
        walls.forEach(w => {
            ctx.moveTo(w.x1, w.y1);
            ctx.lineTo(w.x2, w.y2);
        });
        ctx.stroke();
    }

    /* ── Layer 4: Lighting (L4) ──────────────────────────────────── */

    _renderL4Lighting(ctx, zoom) {
        // Collect points of lights
        const tokenLights = this.map._tokens.getAllTokens()
            .filter(t => t.lightRadius > 0)
            .map(t => ({
                id: `tokLight_${t.id}`,
                x: t.x,
                y: t.y,
                range: t.lightRadius,
                color: '#ffddaa',
                intensity: 0.95,
                flicker: true,
                flickerSeed: t.id.charCodeAt(0) || 0
            }));

        const allLights = [...(this.map._mapLights || []), ...tokenLights];

        this.map._grid.timeOfDayMode = this.map._timeOfDayMode;
        LightingEngine.renderLights(
            ctx,
            allLights,
            this.map._grid,
            (mx, my) => this.map.getProjectedCoords(mx, my),
            zoom,
            this.map._pan,
            this.map._fogEnabled,
            this.map._offscreenCanvas,
            this.map._quadTree // High speed QuadTree lookup
        );
    }

    /* ── Layer 5: UI Overlay & Grid (L5) ────────────────────────── */

    _renderL5Grid(ctx, cs) {
        if (this.map._showGrid) {
            if (this.map._gridType === 'hex') {
                ctx.strokeStyle = 'rgba(212,175,55,0.07)';
                ctx.lineWidth = 0.5;
                const radius = cs / Math.sqrt(3);
                const vSpacing = cs * 0.866;
                for (let r = 0; r < this.map._grid.rows; r++) {
                    for (let c = 0; c < this.map._grid.cols; c++) {
                        const cx = c * cs + (r % 2 === 1 ? cs / 2 : 0);
                        const cy = r * vSpacing;
                        ctx.beginPath();
                        ctx.moveTo(cx + radius * Math.cos(Math.PI/6), cy + radius * Math.sin(Math.PI/6));
                        for (let i = 1; i <= 6; i++) {
                            const angle = (Math.PI / 3) * i + Math.PI / 6;
                            ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
                        }
                        ctx.stroke();
                    }
                }
            } else {
                ctx.strokeStyle = 'rgba(212,175,55,0.06)';
                ctx.lineWidth = 0.5;
                for (let c = 0; c <= this.map._grid.cols; c++) {
                    ctx.beginPath(); ctx.moveTo(c * cs, 0); ctx.lineTo(c * cs, this.map._grid.rows * cs); ctx.stroke();
                }
                for (let r = 0; r <= this.map._grid.rows; r++) {
                    ctx.beginPath(); ctx.moveTo(0, r * cs); ctx.lineTo(this.map._grid.cols * cs, r * cs); ctx.stroke();
                }
            }
        }

        // Draw movement highlights
        const sel = this.map._selectedTokenId ? this.map._tokens.getToken(this.map._selectedTokenId) : null;
        if (sel && sel.isCurrentTurn) {
            const remFt = this.map._tokens.getRemainingMove(sel.id);
            if (remFt > 0) {
                const sc = this.map._grid.pixelToCell(sel.x, sel.y);
                const reachable = this.map._grid.getReachableCells(sc.col, sc.row, remFt);
                ctx.fillStyle = 'rgba(96,165,250,0.11)';
                reachable.forEach(({col, row}) => {
                    ctx.fillRect(col * cs + 1, row * cs + 1, cs - 2, cs - 2);
                });
            }
        }
    }

    _renderL5Previews(ctx, cs) {
        // Draw measurement tool lines
        if (this.map._measuring && this.map._measureStart && this.map._measureEnd) {
            const ms = this.map._measureStart, me = this.map._measureEnd;
            ctx.strokeStyle = 'var(--accent, #d4af37)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 3]);
            ctx.beginPath();
            ctx.moveTo(ms.x, ms.y);
            ctx.lineTo(me.x, me.y);
            ctx.stroke();
            ctx.setLineDash([]);
            
            const ft = this.map._grid.feetBetweenPixels(ms.x, ms.y, me.x, me.y);
            const mx = (ms.x + me.x)/2, my = (ms.y + me.y)/2;
            ctx.save();
            ctx.fillStyle = '#d4af37'; 
            ctx.font = 'bold 14px Outfit, sans-serif'; 
            ctx.textAlign = 'center';
            ctx.fillText(`${ft} ft`, mx, my - 8);
            ctx.restore();
        }

        // Mouse drawing previews
        if (this.map._drawingStart && this.map._currentMousePos) {
            ctx.strokeStyle = '#e5c17b';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 3]);
            
            const ms = this.map._drawingStart;
            const me = this.map._currentMousePos;
            
            if (this.map._tool === 'wall' || this.map._tool === 'door') {
                ctx.beginPath(); ctx.moveTo(ms.x, ms.y); ctx.lineTo(me.x, me.y); ctx.stroke();
            } else if (this.map._tool === 'floor_rect') {
                ctx.strokeRect(Math.min(ms.x, me.x), Math.min(ms.y, me.y), Math.abs(me.x - ms.x), Math.abs(me.y - ms.y));
            } else if (this.map._tool === 'floor_circle') {
                ctx.beginPath();
                ctx.arc(ms.x, ms.y, Math.hypot(me.x - ms.x, me.y - ms.y), 0, Math.PI * 2);
                ctx.stroke();
            } else if (this.map._tool === 'stairs') {
                ctx.strokeRect(ms.x, ms.y - cs/3, me.x - ms.x, cs*2/3);
            }
            ctx.setLineDash([]);
        }

        // Draw JPS path preview
        if (this.map._isDraggingToken && this.map._dragPath && this.map._dragPath.length > 1) {
            ctx.strokeStyle = 'rgba(96, 165, 250, 0.7)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            this.map._dragPath.forEach((node, idx) => {
                const center = this.map._grid.cellCenter(node.col, node.row);
                if (idx === 0) ctx.moveTo(center.x, center.y);
                else ctx.lineTo(center.x, center.y);
            });
            ctx.stroke();
            
            // Draw path node markers
            ctx.fillStyle = '#60a5fa';
            this.map._dragPath.forEach(node => {
                const center = this.map._grid.cellCenter(node.col, node.row);
                ctx.beginPath();
                ctx.arc(center.x, center.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }

    _renderL5Labels(ctx, zoom) {
        this.map._mapElements.forEach(el => {
            if (el.type === 'stamp') {
                const sc = this.map.getProjectedCoords(el.x, el.y);
                ctx.save();
                ctx.translate(sc.x, sc.y);
                ctx.rotate((el.rotation || 0) * Math.PI / 180);
                ctx.scale((el.scale || 1.0) * zoom, (el.scale || 1.0) * zoom);
                ctx.font = '28px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(el.key, 0, 0);
                ctx.restore();
            } else if (el.type === 'text') {
                const sc = this.map.getProjectedCoords(el.x, el.y);
                ctx.save();
                ctx.translate(sc.x, sc.y);
                ctx.scale(zoom, zoom);
                ctx.fillStyle = el.color || '#ffffff';
                ctx.font = `bold ${el.size || 14}px Outfit, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(el.text, 0, 0);
                ctx.restore();
            }
        });
    }

    _renderL5Pings(ctx, zoom) {
        if (!this.map._activePings || this.map._activePings.length === 0) return;
        
        const now = performance.now();
        
        for (let i = this.map._activePings.length - 1; i >= 0; i--) {
            const p = this.map._activePings[i];
            const age = now - p.timestamp;
            
            if (age > 2000) {
                this.map._activePings.splice(i, 1);
                continue;
            }
            
            this.map.requestRender();
            
            const sc = this.map.getProjectedCoords(p.x, p.y);
            const progress = age / 2000;
            const radius = 5 + (progress * 50 * zoom);
            const alpha = 1 - progress;
            
            ctx.save();
            ctx.translate(sc.x, sc.y);
            
            ctx.beginPath();
            ctx.arc(0, 0, 4 * zoom, 0, Math.PI * 2);
            ctx.fillStyle = p.color || '#facc15';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            // using exact color if possible, fallback to yellow
            ctx.strokeStyle = `rgba(250, 204, 21, ${alpha})`;
            ctx.lineWidth = 3 * zoom;
            ctx.stroke();
            
            ctx.restore();
        }
    }

    /* ── Layer 3: Tokens / Entities ──────────────────────────────── */
    
    _drawTokens() {
        const layer = this.map.$('#tmap-tokens');
        if (!layer) return;
        const cs = this.map._grid.cellSize * this.map._zoom;
        const tokens = this.map._tokens.getAllTokens();

        const existing = {};
        layer.querySelectorAll('.tmap-tok').forEach(el => existing[el.dataset.tid] = el);

        tokens.forEach(t => {
            const sc = this.map.getProjectedCoords(t.x, t.y);
            const px = sc.x;
            const py = sc.y;
            
            const sz = Math.max(30, cs * 0.85);
            const hpPct = Math.round(t.hp.current / t.hp.max * 100);
            const hpCol = TokenEngine.hpColor(hpPct);
            const isSel = t.id === this.map._selectedTokenId;
            const isDead = t.isDead;

            let el = existing[t.id];
            if (!el) {
                el = document.createElement('div');
                el.className = 'tmap-tok';
                el.dataset.tid = t.id;
                el.style.pointerEvents = 'auto';
                layer.appendChild(el);
            } else {
                delete existing[t.id];
            }

            el.style.position = 'absolute';
            el.style.left = `${px}px`;
            el.style.top = `${py}px`;
            el.style.width = `${sz}px`;
            el.style.height = `${sz}px`;
            el.style.transform = 'translate(-50%,-50%)';
            el.style.cursor = isDead ? 'not-allowed' : 'grab';
            el.style.opacity = isDead ? 0.4 : 1;
            el.style.zIndex = '15';

            const fallbackImg = t.type === 'monster' ? MonsterArt.getImage(t) : null;
            const safeImg = t.img && !t.img.startsWith('db://') ? t.img : (fallbackImg && !fallbackImg.startsWith('db://') ? fallbackImg : null);
            const dataHash = `${hpPct}_${isSel}_${t.isCurrentTurn}_${t.conditions.join(',')}_${t.name}_${safeImg}`;
            if (el.dataset.hash !== dataHash) {
                el.dataset.hash = dataHash;
                el.innerHTML = `
                    <div class="tmap-tok-ring ${t.type} ${isSel?'sel':''} ${t.isCurrentTurn?'active':''}"
                         style="width:${sz}px;height:${sz}px;background:${safeImg ? `url(${safeImg}) center/cover` : (t.type==='monster'?'rgba(40,10,10,0.9)':'rgba(10,20,40,0.9)')};border:${isSel?3:2}px solid ${t.type==='monster'?'var(--danger)':'var(--info)'};border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Cinzel,serif;font-weight:800;font-size:${sz*0.3}px;color:${t.type==='monster'?'var(--danger)':'var(--info)'};box-shadow:${t.isCurrentTurn?'0 0 16px var(--accent)':isSel?'0 0 10px rgba(255,255,255,0.3)':'0 2px 8px rgba(0,0,0,0.6)'};">
                        ${!safeImg ? (t.emoji || t.name.substring(0,1)) : ''}
                        ${t.conditions.length ? `<div style="position:absolute;top:-8px;right:-8px;font-size:${sz*0.22}px; z-index:100;">${t.conditions.slice(0,2).map(c=>CONDITIONS[c]?.icon||'').join('')}</div>` : ''}
                    </div>
                    <div style="position:absolute;bottom:-4px;left:10%;width:80%;height:4px;background:rgba(0,0,0,0.5);border-radius:2px;overflow:hidden;">
                        <div style="height:100%;width:${hpPct}%;background:${hpCol};transition:width 0.3s;"></div>
                    </div>
                    <div style="position:absolute;bottom:-16px;left:50%;transform:translateX(-50%);font-size:${Math.max(8,sz*0.15)}px;white-space:nowrap;background:rgba(10,12,16,0.85);border:1px solid rgba(255,255,255,0.06);padding:1px 6px;border-radius:4px;color:#fff;pointer-events:none;">
                        ${t.name}
                    </div>
                    ${isDead ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${sz*0.4}px;">💀</div>` : ''}
                `;
            }
        });

        Object.values(existing).forEach(el => el.remove());
    }

    _updateWeatherParticles(W, H, weather) {
        if (this._weatherType !== weather) {
            this._weatherType = weather;
            this._particles = [];
        }
        
        if (!weather || weather === 'none') return;
        
        const maxParticles = weather === 'rain' ? 120 : weather === 'snow' ? 100 : weather === 'fog' ? 15 : 0;
        
        while (this._particles.length < maxParticles) {
            if (weather === 'rain') {
                this._particles.push({
                    x: Math.random() * W,
                    y: Math.random() * H - H,
                    speed: 10 + Math.random() * 10,
                    len: 12 + Math.random() * 12,
                    angle: 1.2 + Math.random() * 0.2
                });
            } else if (weather === 'snow') {
                this._particles.push({
                    x: Math.random() * W,
                    y: Math.random() * H - H,
                    speed: 1 + Math.random() * 2,
                    r: 1.5 + Math.random() * 2.5,
                    amp: 1.5 + Math.random() * 2.5,
                    phase: Math.random() * Math.PI * 2
                });
            } else if (weather === 'fog') {
                this._particles.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    vx: 0.15 + Math.random() * 0.3,
                    vy: (Math.random() - 0.5) * 0.1,
                    r: 80 + Math.random() * 100,
                    alpha: 0.03 + Math.random() * 0.05
                });
            }
        }
        
        this._particles.forEach(p => {
            if (weather === 'rain') {
                p.y += p.speed;
                p.x += Math.cos(p.angle) * p.speed * 0.25;
                if (p.y > H) {
                    p.y = -20;
                    p.x = Math.random() * W;
                    p.speed = 10 + Math.random() * 10;
                }
            } else if (weather === 'snow') {
                p.y += p.speed;
                p.phase += 0.02;
                p.x += Math.sin(p.phase) * p.amp * 0.3;
                if (p.y > H) {
                    p.y = -10;
                    p.x = Math.random() * W;
                    p.speed = 1 + Math.random() * 2;
                }
            } else if (weather === 'fog') {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x - p.r > W) {
                    p.x = -p.r;
                    p.y = Math.random() * H;
                }
            }
        });
    }

    _drawWeather(ctx, W, H, weather) {
        if (!weather || weather === 'none') return;
        
        ctx.save();
        if (weather === 'rain') {
            ctx.strokeStyle = 'rgba(156, 180, 220, 0.45)';
            ctx.lineWidth = 1.2;
            ctx.lineCap = 'round';
            this._particles.forEach(p => {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + Math.cos(p.angle) * p.len * 0.25, p.y + p.len);
                ctx.stroke();
            });
        } else if (weather === 'snow') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this._particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });
        } else if (weather === 'fog') {
            this._particles.forEach(p => {
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                grad.addColorStop(0, `rgba(200, 205, 220, ${p.alpha})`);
                grad.addColorStop(0.5, `rgba(200, 205, 220, ${p.alpha * 0.4})`);
                grad.addColorStop(1, 'rgba(200, 205, 220, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        ctx.restore();
    }
}
