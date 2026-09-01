import { Application, Container, Graphics, Text, Assets, Sprite, Texture } from '/public/vendor/pixi.min.mjs';
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
        this.uiLayer = new PIXI.Container();

        this.mapContainer.addChild(this.bgLayer);
        this.mapContainer.addChild(this.gridLayer);
        this.mapContainer.addChild(this.wallLayer);
        this.mapContainer.addChild(this.fogLayer);
        this.mapContainer.addChild(this.tokenLayer);
        this.mapContainer.addChild(this.uiLayer);

        this.mapSprite = new PIXI.Sprite();
        this.bgLayer.addChild(this.mapSprite);

        this._setupInteractions();
        this._setupLazyRendering();
        this._setupWebRTCSync();
        
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

        this.app.canvas.addEventListener('pointerdown', (e) => {
            if (e.button === 2) return; // Right click
            if (this.activeTool === 'pan' && this.isDM) {
                isDragging = true;
                lastPos = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('pointermove', (e) => {
            if (isDragging) {
                const dx = e.clientX - lastPos.x;
                const dy = e.clientY - lastPos.y;
                this.mapContainer.x += dx;
                this.mapContainer.y += dy;
                lastPos = { x: e.clientX, y: e.clientY };
                if (this.isDM) {
                    this._dispatchCameraUpdate();
                    // Optional: Broadcast DM pan to others via WebRTC
                    window.dispatchEvent(new CustomEvent('tome:camera_dragging', {
                        detail: { x: this.mapContainer.x, y: this.mapContainer.y, scale: this.mapContainer.scale.x }
                    }));
                }
            }
        });

        window.addEventListener('pointerup', () => {
            isDragging = false;
            lastPos = null;
        });
    }

    setTool(tool) {
        this.activeTool = tool;
        if (tool === 'eraser' || tool === 'wall') {
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
        
        const size = data.size || 25;
        
        // Base Circle
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(2, 0xffffff, 1);
        graphics.beginFill(data.color ? parseInt(data.color.replace('#', '0x')) : 0x0000ff);
        graphics.drawCircle(0, 0, size);
        graphics.endFill();
        group.addChild(graphics);

        if (data.avatar) {
            try {
                const texture = await PIXI.Assets.load(data.avatar);
                const sprite = new PIXI.Sprite(texture);
                sprite.anchor.set(0.5);
                sprite.width = size * 2;
                sprite.height = size * 2;
                
                // Mask the sprite as a circle
                const mask = new PIXI.Graphics();
                mask.beginFill(0xffffff);
                mask.drawCircle(0, 0, size);
                mask.endFill();
                
                group.addChild(mask);
                sprite.mask = mask;
                group.addChild(sprite);
            } catch(e) {}
        } else {
            const text = new PIXI.Text(data.name ? data.name.substring(0, 1).toUpperCase() : '', {
                fontFamily: 'Cinzel',
                fontSize: size,
                fill: 0xffffff,
                align: 'center'
            });
            text.anchor.set(0.5);
            group.addChild(text);
        }

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

    _updateToken(group, data) {
        if (Math.abs(group.x - data.x) > 2 || Math.abs(group.y - data.y) > 2) {
            group.x = data.x;
            group.y = data.y;
        }
    }

    _setupWebRTCSync() {
        this._webrtcSyncHandler = (e) => {
            const { id, x, y } = e.detail;
            const group = this.tokens.get(id);
            if (group) {
                // Instantly update visual position for P2P sync, bypassing React render
                group.x = x;
                group.y = y;
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
