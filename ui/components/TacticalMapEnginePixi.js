import * as PIXI from '../../public/vendor/pixi.min.mjs';
import { Raycaster } from '../../utils/Raycaster.js';

export class TacticalMapEnginePixi {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.isDM = options.isDM || false;
        
        this.tokens = new Map();
        this.isGridActive = false;
        this.activeTool = 'pan'; 
        this.walls = [];
        this.isDynamicLightingEnabled = false;
        this.isVisible = true;
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
        this.wallLayer = new PIXI.Container();
        this.fogLayer = new PIXI.Container();
        this.tokenLayer = new PIXI.Container();
        this.measureLayer = new PIXI.Container();
        this.uiLayer = new PIXI.Container();

        this.mapContainer.addChild(this.bgLayer);
        this.mapContainer.addChild(this.gridLayer);
        this.mapContainer.addChild(this.wallLayer);
        this.mapContainer.addChild(this.fogLayer);
        this.mapContainer.addChild(this.tokenLayer);
        this.mapContainer.addChild(this.measureLayer);
        this.mapContainer.addChild(this.uiLayer);

        this.mapSprite = new PIXI.Sprite();
        this.bgLayer.addChild(this.mapSprite);

        this._setupInteractions();
        this._setupLazyRendering();
        this._setupWebRTCSync();
        
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
            const localX = (pointerX - this.mapContainer.x) / this.mapContainer.scale.x;
            const localY = (pointerY - this.mapContainer.y) / this.mapContainer.scale.y;

            if (this.activeTool === 'pan' && this.isDM) {
                isDragging = true;
                lastPos = { x: e.clientX, y: e.clientY };
            } else if (this.activeTool === 'ruler') {
                isDragging = true;
                measureStart = { x: localX, y: localY };
            } else if (this.activeTool === 'fog' && this.isDM) {
                isDragging = true;
                this._paintFog(localX, localY);
            }
        });

        window.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const rect = this.app.canvas.getBoundingClientRect();
            const pointerX = e.clientX - rect.left;
            const pointerY = e.clientY - rect.top;
            const localX = (pointerX - this.mapContainer.x) / this.mapContainer.scale.x;
            const localY = (pointerY - this.mapContainer.y) / this.mapContainer.scale.y;

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
            } else if (this.activeTool === 'fog' && this.isDM) {
                this._paintFog(localX, localY);
            }
        });

        window.addEventListener('pointerup', () => {
            isDragging = false;
            lastPos = null;
            if (this.activeTool === 'ruler') {
                measureGraphics.clear();
                measureText.text = '';
                window.dispatchEvent(new CustomEvent('tome:measure_end'));
            }
        });
    }

    _paintFog(x, y) {
        if (!this.fogLayer.children.length) return;
        const hole = new PIXI.Graphics();
        hole.beginFill(0xffffff, 1);
        hole.drawCircle(x, y, 150); // Brush size
        hole.endFill();
        hole.blendMode = 'erase';
        this.fogLayer.addChild(hole);
    }

    setTool(tool) {
        this.activeTool = tool;
        if (tool === 'fog') {
            this.container.style.cursor = 'crosshair';
        } else if (tool === 'ruler') {
            this.container.style.cursor = 'crosshair';
        } else {
            this.container.style.cursor = 'grab';
        }
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
        // Remove existing fog graphics
        this.fogLayer.removeChildren();
        
        if (fogData && fogData.enabled) {
            const darkness = new PIXI.Graphics();
            darkness.beginFill(0x000000, 0.95);
            darkness.drawRect(-5000, -5000, 10000, 10000);
            darkness.endFill();
            this.fogLayer.addChild(darkness);
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
        group.x = data.x || 0;
        group.y = data.y || 0;
        group.targetX = group.x;
        group.targetY = group.y;
        
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

        if (data.avatar) {
            try {
                const texture = await PIXI.Assets.load(data.avatar);
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
            } catch(e) {}
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

        for (const [id, group] of this.tokens.entries()) {
            // Lerp Position
            if (group.targetX !== undefined && group.targetY !== undefined) {
                if (Math.abs(group.targetX - group.x) > 0.5) group.x += (group.targetX - group.x) * lerpFactor;
                else group.x = group.targetX;
                
                if (Math.abs(group.targetY - group.y) > 0.5) group.y += (group.targetY - group.y) * lerpFactor;
                else group.y = group.targetY;
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
    }
}
