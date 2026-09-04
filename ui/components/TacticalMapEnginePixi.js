import * as PIXI from '../../public/vendor/pixi.min.mjs';
import { Raycaster } from '../../utils/Raycaster.js';
import { MonsterArt } from '../../services/MonsterArt.js';
import { CommandStack, PixiAddWallCommand, PixiPaintFogCommand, PixiMoveTokenCommand } from '../../engine/UndoRedo.js';

export class TacticalMapEnginePixi {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.isDM = options.isDM || false;
        
        this.tokens = new Map();
        this.isGridActive = false;
        this.snapToGrid = true;
        this.gridStep = 50;
        this.activeTool = 'pan'; 
        this.walls = [];
        this.wallStart = null;
        this.wallPreviewGraphics = new PIXI.Graphics();
        this.fogPaths = [];
        this.isDynamicLightingEnabled = false;
        this.isFogEnabled = false;
        this.isVisible = true;
        this.commandStack = new CommandStack(this);
    }

    async init(width, height) {
        this.app = new PIXI.Application();
        await this.app.init({ 
            width: width || window.innerWidth, 
            height: height || window.innerHeight, 
            backgroundAlpha: 0,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        this.container.appendChild(this.app.canvas);

        // Core Containers
        this.mapContainer = new PIXI.Container();
        this.app.stage.addChild(this.mapContainer);

        this.bgLayer = new PIXI.Container();
        this.gridLayer = new PIXI.Container();
        this.aoeLayer = new PIXI.Container();
        this.wallLayer = new PIXI.Container();
        this.fogLayer = new PIXI.Container();
        this.tokenLayer = new PIXI.Container();
        this.measureLayer = new PIXI.Container();
        this.uiLayer = new PIXI.Container();

        this.mapContainer.addChild(this.bgLayer);
        this.mapContainer.addChild(this.gridLayer);
        this.mapContainer.addChild(this.aoeLayer);
        this.mapContainer.addChild(this.wallLayer);
        this.mapContainer.addChild(this.fogLayer);
        this.mapContainer.addChild(this.tokenLayer);
        this.mapContainer.addChild(this.measureLayer);
        this.mapContainer.addChild(this.uiLayer);

        this.mapSprite = new PIXI.Sprite();
        this.bgLayer.addChild(this.mapSprite);
        this.uiLayer.addChild(this.wallPreviewGraphics);

        this._setupInteractions();
        this._setupTouchGestures();
        this._setupLazyRendering();
        this._setupWebRTCSync();
        this._setupKeyboardShortcuts();
        
        // Setup Ticker for Lerp and Culling
        this.app.ticker.add((delta) => this._updateLoop(delta));
        
        return this;
    }

    _setupInteractions() {
        // For Pixi, we handle zooming and panning on the canvas element directly
        this.app.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const scaleBy = 1.1;
            const direction = e.deltaY > 0 ? -1 : 1;
            const newScale = direction > 0 ? this.mapContainer.scale.x * scaleBy : this.mapContainer.scale.x / scaleBy;
            
            if (newScale < 0.1 || newScale > 10) return;

            // Get local position before scale
            const rect = this.app.canvas.getBoundingClientRect();
            const pointerX = e.clientX - rect.left;
            const pointerY = e.clientY - rect.top;

            const localX = (pointerX - this.mapContainer.x) / this.mapContainer.scale.x;
            const localY = (pointerY - this.mapContainer.y) / this.mapContainer.scale.y;

            this.mapContainer.scale.set(newScale);

            // Adjust container position to zoom at pointer
            this.mapContainer.x = pointerX - localX * newScale;
            this.mapContainer.y = pointerY - localY * newScale;

            if (this.isDM) this._dispatchCameraUpdate();
        });

        let isDragging = false;
        let lastPos = null;
        let measureStart = null;
        let measureGraphics = new PIXI.Graphics();
        let measureText = new PIXI.Text({ text: '', style: { fontFamily: 'Cinzel', fontSize: 24, fill: 0xffffff, stroke: 0x000000, strokeThickness: 4 } });
        measureText.anchor.set(0.5);
        this.measureLayer.addChild(measureGraphics);
        this.measureLayer.addChild(measureText);

        this.app.canvas.addEventListener('pointerdown', (e) => {
            if (e.button === 2) return; // Right click
            const rect = this.app.canvas.getBoundingClientRect();
            const pointerX = e.clientX - rect.left;
            const pointerY = e.clientY - rect.top;
            let localX = (pointerX - this.mapContainer.x) / this.mapContainer.scale.x;
            let localY = (pointerY - this.mapContainer.y) / this.mapContainer.scale.y;

            if (this.snapToGrid && (this.activeTool === 'wall' || this.activeTool === 'ruler')) {
                localX = Math.round(localX / this.gridStep) * this.gridStep;
                localY = Math.round(localY / this.gridStep) * this.gridStep;
            }

            if (this.activeTool === 'pan' && this.isDM) {
                isDragging = true;
                lastPos = { x: e.clientX, y: e.clientY };
            } else if (this.activeTool === 'ruler') {
                isDragging = true;
                measureStart = { x: localX, y: localY };
            } else if ((this.activeTool === 'fog' || this.activeTool === 'eraser') && this.isDM) {
                isDragging = true;
                this._paintFog(localX, localY, 150, true, true);
            } else if (this.activeTool === 'wall' && this.isDM) {
                isDragging = true;
                this.wallStart = { x: localX, y: localY };
            }
        });

        window.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const rect = this.app.canvas.getBoundingClientRect();
            const pointerX = e.clientX - rect.left;
            const pointerY = e.clientY - rect.top;
            let localX = (pointerX - this.mapContainer.x) / this.mapContainer.scale.x;
            let localY = (pointerY - this.mapContainer.y) / this.mapContainer.scale.y;

            if (this.snapToGrid && (this.activeTool === 'wall' || this.activeTool === 'ruler')) {
                localX = Math.round(localX / this.gridStep) * this.gridStep;
                localY = Math.round(localY / this.gridStep) * this.gridStep;
            }

            if (this.activeTool === 'pan' && this.isDM) {
                const dx = e.clientX - lastPos.x;
                const dy = e.clientY - lastPos.y;
                this.mapContainer.x += dx;
                this.mapContainer.y += dy;
                lastPos = { x: e.clientX, y: e.clientY };
                if (this.isDM) {
                    this._dispatchCameraUpdate();
                }
            } else if (this.activeTool === 'ruler') {
                measureGraphics.clear();
                measureGraphics.lineStyle(4, 0xeab308, 0.8);
                measureGraphics.moveTo(measureStart.x, measureStart.y);
                measureGraphics.lineTo(localX, localY);
                measureGraphics.beginFill(0xeab308);
                measureGraphics.drawCircle(measureStart.x, measureStart.y, 6);
                measureGraphics.drawCircle(localX, localY, 6);
                measureGraphics.endFill();

                const dx = localX - measureStart.x;
                const dy = localY - measureStart.y;
                const distPx = Math.sqrt(dx*dx + dy*dy);
                const distMeters = ((distPx / 50) * 1.5).toFixed(1);
                const distFeet = ((distPx / 50) * 5).toFixed(0);

                measureText.text = `${distMeters}m / ${distFeet}ft`;
                measureText.x = measureStart.x + dx/2;
                measureText.y = measureStart.y + dy/2 - 30;
                
                // Broadcast measure
                window.dispatchEvent(new CustomEvent('tome:measure', {
                    detail: { sx: measureStart.x, sy: measureStart.y, ex: localX, ey: localY, text: measureText.text }
                }));
            } else if ((this.activeTool === 'fog' || this.activeTool === 'eraser') && this.isDM) {
                this._paintFog(localX, localY, 150, true, false);
            } else if (this.activeTool === 'wall' && this.isDM && this.wallStart) {
                this.wallPreviewGraphics.clear();
                this.wallPreviewGraphics.lineStyle(3, 0x3b82f6, 0.85);
                this.wallPreviewGraphics.moveTo(this.wallStart.x, this.wallStart.y);
                this.wallPreviewGraphics.lineTo(localX, localY);
                this.wallPreviewGraphics.beginFill(0x3b82f6);
                this.wallPreviewGraphics.drawCircle(this.wallStart.x, this.wallStart.y, 4);
                this.wallPreviewGraphics.drawCircle(localX, localY, 4);
                this.wallPreviewGraphics.endFill();
            }
        });

        window.addEventListener('pointerup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            lastPos = null;

            if (this.activeTool === 'ruler') {
                measureGraphics.clear();
                measureText.text = '';
                window.dispatchEvent(new CustomEvent('tome:measure_end'));
            } else if (this.activeTool === 'wall' && this.isDM && this.wallStart) {
                const rect = this.app.canvas.getBoundingClientRect();
                let localX = (e.clientX - rect.left - this.mapContainer.x) / this.mapContainer.scale.x;
                let localY = (e.clientY - rect.top - this.mapContainer.y) / this.mapContainer.scale.y;
                if (this.snapToGrid) {
                    localX = Math.round(localX / this.gridStep) * this.gridStep;
                    localY = Math.round(localY / this.gridStep) * this.gridStep;
                }
                this.wallPreviewGraphics.clear();
                const dist = Math.hypot(localX - this.wallStart.x, localY - this.wallStart.y);
                if (dist >= 10) {
                    const wall = {
                        id: 'w_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                        x1: this.wallStart.x,
                        y1: this.wallStart.y,
                        x2: localX,
                        y2: localY
                    };
                    this.commandStack.execute(new PixiAddWallCommand(wall));
                    window.dispatchEvent(new CustomEvent('tome:wall_added', { detail: wall }));
                }
                this.wallStart = null;
            }
        });
    }

    _setupTouchGestures() {
        let touchStartDist = 0;
        let startScale = 1;
        let lastTouchPos = null;

        this.app.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                lastTouchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                touchStartDist = Math.sqrt(dx * dx + dy * dy);
                startScale = this.mapContainer.scale.x;
            }
        }, { passive: false });

        this.app.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && lastTouchPos) {
                e.preventDefault();
                const dx = e.touches[0].clientX - lastTouchPos.x;
                const dy = e.touches[0].clientY - lastTouchPos.y;
                this.mapContainer.x += dx;
                this.mapContainer.y += dy;
                lastTouchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                if (this.isDM) this._dispatchCameraUpdate();
            } else if (e.touches.length === 2 && touchStartDist > 0) {
                e.preventDefault();
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const currentDist = Math.sqrt(dx * dx + dy * dy);
                const factor = currentDist / touchStartDist;
                const newScale = Math.max(0.1, Math.min(10, startScale * factor));
                this.mapContainer.scale.set(newScale);
                if (this.isDM) this._dispatchCameraUpdate();
            }
        }, { passive: false });

        this.app.canvas.addEventListener('touchend', () => {
            touchStartDist = 0;
            lastTouchPos = null;
        });
    }

    _paintFog(x, y, radius = 150, broadcast = true, recordUndo = false) {
        if (!this.fogLayer.children.length) return;
        const hole = new PIXI.Graphics();
        hole.beginFill(0xffffff, 1);
        hole.drawCircle(x, y, radius);
        hole.endFill();
        hole.blendMode = 'erase';
        this.fogLayer.addChild(hole);

        const point = { x: Math.round(x), y: Math.round(y), radius };
        this.fogPaths.push(point);

        if (recordUndo) {
            this.commandStack.execute(new PixiPaintFogCommand(point));
        }

        if (broadcast && this.isDM) {
            window.dispatchEvent(new CustomEvent('tome:fog_path', {
                detail: { points: point, paths: this.fogPaths }
            }));
        }
    }

    setTool(tool) {
        this.activeTool = tool;
        if (tool === 'fog' || tool === 'eraser') {
            this.container.style.cursor = 'crosshair';
        } else if (tool === 'ruler') {
            this.container.style.cursor = 'crosshair';
        } else {
            this.container.style.cursor = 'grab';
        }
    }

    setSnapToGrid(enabled, step = 50) {
        this.snapToGrid = enabled;
        this.gridStep = step;
    }

    _dispatchCameraUpdate() {
        window.dispatchEvent(new CustomEvent('tome:camera_update', {
            detail: { x: this.mapContainer.x, y: this.mapContainer.y, scale: this.mapContainer.scale.x }
        }));
    }

    setCamera(x, y, scale) {
        this.mapContainer.x = x;
        this.mapContainer.y = y;
        this.mapContainer.scale.set(scale);
    }

    async setMapUrl(url) {
        if (!url) {
            this.mapSprite.texture = PIXI.Texture.EMPTY;
            return;
        }
        try {
            const texture = await PIXI.Assets.load(url);
            this.mapSprite.texture = texture;
        } catch(e) {
            console.error('[PixiJS] Failed to load map URL', url, e);
        }
    }

    setFog(fogData) {
        this.fogLayer.removeChildren();
        this.fogPaths = [];
        
        if (fogData && fogData.enabled) {
            const darkness = new PIXI.Graphics();
            darkness.beginFill(0x000000, 0.96);
            darkness.drawRect(-10000, -10000, 20000, 20000);
            darkness.endFill();
            this.fogLayer.addChild(darkness);

            // Restaura buracos de névoa anteriores
            if (Array.isArray(fogData.paths)) {
                fogData.paths.forEach(p => {
                    const px = p.x !== undefined ? p.x : (Array.isArray(p) ? p[0] : 0);
                    const py = p.y !== undefined ? p.y : (Array.isArray(p) ? p[1] : 0);
                    const pr = p.radius || 150;
                    this._paintFog(px, py, pr, false, false);
                });
            }
        }
    }

    setDynamicLightingEnabled(enabled) {
        this.isDynamicLightingEnabled = enabled;
        if (enabled) {
            this.renderDynamicLighting();
        } else {
            this.setFog({ enabled: this.isFogEnabled || this.fogPaths.length > 0, paths: this.fogPaths });
        }
    }

    renderDynamicLighting() {
        if (!this.isDynamicLightingEnabled) return;
        
        this.fogLayer.removeChildren();
        const darkness = new PIXI.Graphics();
        darkness.beginFill(0x000000, 0.96);
        darkness.drawRect(-10000, -10000, 20000, 20000);
        darkness.endFill();
        this.fogLayer.addChild(darkness);

        // Re-aplica furos manuais de névoa revelada
        if (this.fogPaths && this.fogPaths.length > 0) {
            this.fogPaths.forEach(p => {
                const hole = new PIXI.Graphics();
                hole.beginFill(0xffffff, 1);
                hole.drawCircle(p.x, p.y, p.radius || 150);
                hole.endFill();
                hole.blendMode = 'erase';
                this.fogLayer.addChild(hole);
            });
        }

        // Paredes para o Raycaster
        const segments = (this.walls || []).map(w => ({
            p1: { x: w.x1, y: w.y1 },
            p2: { x: w.x2, y: w.y2 }
        }));

        // Renderiza linha de visão por token
        for (const token of this.tokens.values()) {
            const origin = { x: token.x, y: token.y };
            const radius = token.lightRadius || 500; // Raio de iluminação padrão (15m / 50ft)
            
            const polygonPoints = Raycaster.computePolygon(origin, radius, segments);
            if (polygonPoints && polygonPoints.length >= 6) {
                const lightHole = new PIXI.Graphics();
                lightHole.beginFill(0xffffff, 1);
                lightHole.drawPolygon(polygonPoints);
                lightHole.endFill();
                lightHole.blendMode = 'erase';
                this.fogLayer.addChild(lightHole);
            }
        }
    }

    _renderWalls() {
        this.wallLayer.removeChildren();
        if (!this.walls || this.walls.length === 0) return;
        
        const g = new PIXI.Graphics();
        this.walls.forEach(w => {
            g.lineStyle(4, 0x3b82f6, this.isDM ? 0.9 : 0);
            g.moveTo(w.x1, w.y1);
            g.lineTo(w.x2, w.y2);
            if (this.isDM) {
                g.beginFill(0x60a5fa);
                g.drawCircle(w.x1, w.y1, 4);
                g.drawCircle(w.x2, w.y2, 4);
                g.endFill();
            }
        });
        this.wallLayer.addChild(g);

        if (this.isDynamicLightingEnabled) {
            this.renderDynamicLighting();
        }
    }

    undo() {
        const res = this.commandStack.undo();
        if (this.isDynamicLightingEnabled) this.renderDynamicLighting();
        return res;
    }

    redo() {
        const res = this.commandStack.redo();
        if (this.isDynamicLightingEnabled) this.renderDynamicLighting();
        return res;
    }

    canUndo() {
        return this.commandStack.canUndo();
    }

    canRedo() {
        return this.commandStack.canRedo();
    }

    _setupKeyboardShortcuts() {
        this._keyHandler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) this.redo();
                else this.undo();
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                this.redo();
            }
        };
        window.addEventListener('keydown', this._keyHandler);
    }

    setCamera(x, y, scale = null) {
        if (!this.mapContainer) return;
        if (x !== undefined && x !== null) this.mapContainer.x = x;
        if (y !== undefined && y !== null) this.mapContainer.y = y;
        if (scale !== undefined && scale !== null) {
            this.mapContainer.scale.set(scale);
        }
    }

    focusOn(localX, localY, targetScale = null) {
        if (!this.mapContainer || !this.app) return;
        const scale = targetScale || this.mapContainer.scale.x || 1;
        if (targetScale) this.mapContainer.scale.set(scale);
        
        const screenW = this.app.screen.width;
        const screenH = this.app.screen.height;
        const targetX = screenW / 2 - localX * scale;
        const targetY = screenH / 2 - localY * scale;

        let step = 0;
        const totalSteps = 20;
        const startX = this.mapContainer.x;
        const startY = this.mapContainer.y;

        const panTick = () => {
            step++;
            const t = step / totalSteps;
            const ease = t * (2 - t);
            this.mapContainer.x = startX + (targetX - startX) * ease;
            this.mapContainer.y = startY + (targetY - startY) * ease;
            if (step >= totalSteps) {
                this.app.ticker.remove(panTick);
            }
        };
        this.app.ticker.add(panTick);
    }

    showPing(x, y, color = '#10b981') {
        const pingGroup = new PIXI.Container();
        pingGroup.x = x;
        pingGroup.y = y;
        this.uiLayer.addChild(pingGroup);

        const hexColor = typeof color === 'string' ? parseInt(color.replace('#', '0x'), 16) : color;

        const dot = new PIXI.Graphics();
        dot.beginFill(hexColor, 1);
        dot.drawCircle(0, 0, 8);
        dot.endFill();
        pingGroup.addChild(dot);

        const ring = new PIXI.Graphics();
        pingGroup.addChild(ring);

        let elapsed = 0;
        const duration = 60; // ~1s a 60fps

        const onTick = () => {
            elapsed++;
            const t = elapsed / duration;
            const radius = t * 90;
            const alpha = Math.max(0, 1 - t);

            ring.clear();
            ring.lineStyle(3, hexColor, alpha);
            ring.drawCircle(0, 0, radius);

            if (elapsed >= duration) {
                this.app.ticker.remove(onTick);
                this.uiLayer.removeChild(pingGroup);
                pingGroup.destroy({ children: true });
            }
        };

        this.app.ticker.add(onTick);
    }

    showSpellEffect(x, y, color = '#9c27b0', type = 'spell') {
        const fxGroup = new PIXI.Container();
        fxGroup.x = x;
        fxGroup.y = y;
        this.uiLayer.addChild(fxGroup);

        const hexColor = typeof color === 'string' ? parseInt(color.replace('#', '0x'), 16) : color;
        const ring = new PIXI.Graphics();
        fxGroup.addChild(ring);

        const particles = [];
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const p = new PIXI.Graphics();
            p.beginFill(hexColor, 1);
            p.drawCircle(0, 0, 4);
            p.endFill();
            fxGroup.addChild(p);
            particles.push({ gfx: p, angle });
        }

        let elapsed = 0;
        const duration = 45;

        const onTick = () => {
            elapsed++;
            const t = elapsed / duration;
            const radius = t * 120;
            const alpha = Math.max(0, 1 - t);

            ring.clear();
            ring.lineStyle(4, hexColor, alpha);
            ring.drawCircle(0, 0, radius);

            particles.forEach(p => {
                p.gfx.x = Math.cos(p.angle) * radius * 0.8;
                p.gfx.y = Math.sin(p.angle) * radius * 0.8;
                p.gfx.alpha = alpha;
            });

            if (elapsed >= duration) {
                this.app.ticker.remove(onTick);
                this.uiLayer.removeChild(fxGroup);
                fxGroup.destroy({ children: true });
            }
        };

        this.app.ticker.add(onTick);
    }

    setAoeTemplate({ type = 'sphere', x, y, radius = 150, angle = 0, color = 0xef4444 }) {
        this.clearAoeTemplates();
        const g = new PIXI.Graphics();
        const hexColor = typeof color === 'string' ? parseInt(color.replace('#', '0x'), 16) : color;

        g.lineStyle(2, hexColor, 0.85);
        g.beginFill(hexColor, 0.25);

        if (type === 'sphere' || type === 'circle') {
            g.drawCircle(x, y, radius);
        } else if (type === 'cone') {
            const halfAngle = (53 * Math.PI) / 360;
            g.moveTo(x, y);
            g.arc(x, y, radius, angle - halfAngle, angle + halfAngle);
            g.lineTo(x, y);
        } else if (type === 'line') {
            const width = 50;
            g.drawRect(x - width / 2, y, width, radius * 2);
            g.rotation = angle;
        } else if (type === 'cube') {
            const side = radius * 2;
            g.drawRect(x - radius, y - radius, side, side);
        }
        g.endFill();
        this.aoeLayer.addChild(g);
    }

    clearAoeTemplates() {
        if (this.aoeLayer) {
            this.aoeLayer.removeChildren();
        }
    }

    setGrid(isActive, scale) {
        this.isGridActive = isActive;
        this.gridLayer.removeChildren();
        
        if (isActive) {
            const step = 50; 
            const gridG = new PIXI.Graphics();
            gridG.lineStyle(1, 0xffffff, 0.2);
            
            for (let i = 0; i < 5000 / step; i++) {
                gridG.moveTo(Math.round(i * step), 0);
                gridG.lineTo(Math.round(i * step), 5000);
            }
            for (let j = 0; j < 5000 / step; j++) {
                gridG.moveTo(0, Math.round(j * step));
                gridG.lineTo(5000, Math.round(j * step));
            }
            this.gridLayer.addChild(gridG);
        }
    }

    updateTokens(tokensArray) {
        const newIds = new Set(tokensArray.map(t => t.id));
        for (const [id, tokenGroup] of this.tokens.entries()) {
            if (!newIds.has(id)) {
                this.tokenLayer.removeChild(tokenGroup);
                tokenGroup.destroy();
                this.tokens.delete(id);
            }
        }

        tokensArray.forEach(async tData => {
            let token = this.tokens.get(tData.id);
            if (!token) {
                token = await this._createToken(tData);
                this.tokens.set(tData.id, token);
                this.tokenLayer.addChild(token);
            } else {
                this._updateToken(token, tData);
            }
        });
    }

    async _createToken(data) {
        const group = new PIXI.Container();
        group.id = data.id;
        group.x = data.x || 0;
        group.y = data.y || 0;
        group.targetX = group.x;
        group.targetY = group.y;
        group.lightRadius = data.lightRadius || 350;
        
        const size = data.size || 25;
        
        // Faction Colors: Verde (Aliado), Vermelho (Inimigo), Roxo (Boss), Amarelo (Neutro)
        let ringColor = 0x0000ff;
        if (data.faction === 'ally') ringColor = 0x22c55e; // Green
        else if (data.faction === 'enemy') ringColor = 0xef4444; // Red
        else if (data.faction === 'boss') ringColor = 0xa855f7; // Purple
        else if (data.faction === 'neutral') ringColor = 0xeab308; // Yellow
        else if (data.color) ringColor = parseInt(data.color.replace('#', '0x'));

        // Base Circle Ring
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(3, ringColor, 1);
        graphics.beginFill(0x1a1a1a);
        graphics.drawCircle(0, 0, size);
        graphics.endFill();
        group.addChild(graphics);

        let avatarUrl = data.avatar || data.img || null;
        if (!avatarUrl && data.name) {
            avatarUrl = MonsterArt.getImage({ name: data.name, type: data.type }, true);
        }

        if (avatarUrl) {
            try {
                const texture = await PIXI.Assets.load(avatarUrl);
                const sprite = new PIXI.Sprite(texture);
                sprite.anchor.set(0.5);
                // Cover the circle
                const scale = Math.max((size * 2) / sprite.width, (size * 2) / sprite.height);
                sprite.scale.set(scale);
                
                const mask = new PIXI.Graphics();
                mask.beginFill(0xffffff);
                mask.drawCircle(0, 0, size - 2);
                mask.endFill();
                
                group.addChild(mask);
                sprite.mask = mask;
                group.addChild(sprite);
            } catch(e) {
                const text = new PIXI.Text(data.name ? data.name.substring(0, 2).toUpperCase() : '', {
                    fontFamily: 'Cinzel',
                    fontSize: size * 0.8,
                    fill: 0xffffff,
                    align: 'center'
                });
                text.anchor.set(0.5);
                group.addChild(text);
            }
        } else {
            const text = new PIXI.Text(data.name ? data.name.substring(0, 2).toUpperCase() : '', {
                fontFamily: 'Cinzel',
                fontSize: size * 0.8,
                fill: 0xffffff,
                align: 'center'
            });
            text.anchor.set(0.5);
            group.addChild(text);
        }

        // Name Tag Label
        const nameText = new PIXI.Text(data.name || 'Token', {
            fontFamily: 'Outfit',
            fontSize: 11,
            fontWeight: 'bold',
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 3,
            align: 'center'
        });
        nameText.anchor.set(0.5, 0);
        nameText.y = size + 12;
        group.addChild(nameText);

        // HP Bar
        const hpContainer = new PIXI.Container();
        hpContainer.y = size + 5;
        const hpBg = new PIXI.Graphics();
        hpBg.beginFill(0x000000, 0.7);
        hpBg.drawRect(-size, 0, size * 2, 6);
        hpBg.endFill();
        const hpFill = new PIXI.Graphics();
        hpFill.beginFill(0x22c55e); // green
        const hpPct = (data.hp !== undefined && data.maxHp) ? Math.max(0, Math.min(1, data.hp / data.maxHp)) : 1;
        hpFill.drawRect(-size, 0, (size * 2) * hpPct, 6);
        hpFill.endFill();
        hpContainer.addChild(hpBg);
        hpContainer.addChild(hpFill);
        group.addChild(hpContainer);
        group.hpFill = hpFill; // Store ref for updates

        // Conditions Icons Placeholder (Simplification for now: colored dots)
        const conditionsContainer = new PIXI.Container();
        conditionsContainer.y = -size - 10;
        group.addChild(conditionsContainer);
        group.conditionsContainer = conditionsContainer;
        this._updateConditions(group, data.conditions || []);

        if (this.isDM) {
            group.eventMode = 'dynamic';
            group.cursor = 'pointer';
            
            let isDragging = false;
            let offset = { x: 0, y: 0 };

            group.on('pointerdown', (e) => {
                isDragging = true;
                const localPos = e.data.getLocalPosition(group.parent);
                offset.x = group.x - localPos.x;
                offset.y = group.y - localPos.y;
            });

            group.on('pointerup', (e) => {
                isDragging = false;
                if (this.isGridActive) {
                    const step = 50;
                    group.x = Math.round(group.x / step) * step;
                    group.y = Math.round(group.y / step) * step;
                }

                if (this.isDynamicLightingEnabled) {
                    this.renderDynamicLighting();
                }
                
                window.dispatchEvent(new CustomEvent('tome:token_moved', {
                    detail: { id: data.id, x: group.x, y: group.y }
                }));
            });
            
            group.on('pointerupoutside', () => { isDragging = false; });

            group.on('pointermove', (e) => {
                if (isDragging) {
                    const localPos = e.data.getLocalPosition(group.parent);
                    group.x = localPos.x + offset.x;
                    group.y = localPos.y + offset.y;

                    if (this.isDynamicLightingEnabled) {
                        this.renderDynamicLighting();
                    }

                    // Emit high-frequency event for WebRTC broadcast
                    window.dispatchEvent(new CustomEvent('tome:token_dragging', {
                        detail: { id: data.id, x: group.x, y: group.y }
                    }));
                }
            });
        }
        
        return group;
    }

    _updateConditions(group, conditions) {
        group.conditionsContainer.removeChildren();
        let currentX = 0;
        conditions.forEach((cond) => {
            const dot = new PIXI.Graphics();
            // Colors based on condition
            let color = 0xffffff;
            if (cond === 'stunned') color = 0xeab308; // yellow
            else if (cond === 'prone') color = 0x94a3b8; // gray
            else if (cond === 'blinded') color = 0x333333; // dark
            else if (cond === 'concentrating') color = 0x3b82f6; // blue
            
            dot.beginFill(color);
            dot.drawCircle(currentX, 0, 4);
            dot.endFill();
            dot.lineStyle(1, 0x000000, 1);
            group.conditionsContainer.addChild(dot);
            currentX += 10;
        });
        group.conditionsContainer.x = - (conditions.length * 10) / 2 + 5;
    }

    _updateToken(group, data) {
        group.targetX = data.x;
        group.targetY = data.y;
        if (data.lightRadius !== undefined) group.lightRadius = data.lightRadius;
        
        if (group.hpFill && data.maxHp) {
            const size = data.size || 25;
            const hpPct = Math.max(0, Math.min(1, data.hp / data.maxHp));
            group.hpFill.clear();
            group.hpFill.beginFill(hpPct > 0.5 ? 0x22c55e : (hpPct > 0.2 ? 0xeab308 : 0xef4444));
            group.hpFill.drawRect(-size, 0, (size * 2) * hpPct, 6);
            group.hpFill.endFill();
        }
        
        if (group.conditionsContainer && data.conditions) {
            this._updateConditions(group, data.conditions);
        }
    }

    _updateLoop(delta) {
        const lerpFactor = 0.2 * delta; // Smooth movement
        
        // Viewport rect for culling
        const viewRect = {
            x: -this.mapContainer.x / this.mapContainer.scale.x,
            y: -this.mapContainer.y / this.mapContainer.scale.y,
            w: this.app.screen.width / this.mapContainer.scale.x,
            h: this.app.screen.height / this.mapContainer.scale.y
        };
        const padding = 200; // Extra padding to avoid pop-in
        let anyMoved = false;

        for (const [id, group] of this.tokens.entries()) {
            // Lerp Position
            if (group.targetX !== undefined && group.targetY !== undefined) {
                if (Math.abs(group.targetX - group.x) > 0.5) {
                    group.x += (group.targetX - group.x) * lerpFactor;
                    anyMoved = true;
                } else {
                    group.x = group.targetX;
                }
                
                if (Math.abs(group.targetY - group.y) > 0.5) {
                    group.y += (group.targetY - group.y) * lerpFactor;
                    anyMoved = true;
                } else {
                    group.y = group.targetY;
                }
            }

            // Culling logic
            const isVisible = (
                group.x >= viewRect.x - padding &&
                group.x <= viewRect.x + viewRect.w + padding &&
                group.y >= viewRect.y - padding &&
                group.y <= viewRect.y + viewRect.h + padding
            );
            group.visible = isVisible;
        }

        if (anyMoved && this.isDynamicLightingEnabled) {
            this.renderDynamicLighting();
        }
    }

    _setupWebRTCSync() {
        this._webrtcSyncHandler = (e) => {
            const { id, x, y } = e.detail;
            const group = this.tokens.get(id);
            if (group) {
                group.targetX = x;
                group.targetY = y;
            }
        };
        window.addEventListener('webrtc:token_sync', this._webrtcSyncHandler);
    }

    _setupLazyRendering() {
        if (!this.container) return;
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
                if (this.app) {
                    if (this.isVisible) this.app.start();
                    else this.app.stop();
                }
            });
        }, { threshold: 0.05 });
        this.observer.observe(this.container);
    }

    resize(width, height) {
        if (this.app) {
            this.app.renderer.resize(width, height);
        }
    }

    destroy() {
        if (this.app) {
            this.app.destroy(true, true);
        }
        if (this._webrtcSyncHandler) {
            window.removeEventListener('webrtc:token_sync', this._webrtcSyncHandler);
        }
        if (this._keyHandler) {
            window.removeEventListener('keydown', this._keyHandler);
        }
    }
}
