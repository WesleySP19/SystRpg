export class TacticalMapEngine {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.isDM = options.isDM || false;
        
        this.tokens = new Map();
        
        this.stage = new Konva.Stage({
            container: containerId,
            width: options.width || window.innerWidth,
            height: options.height || window.innerHeight,
        });

        this.bgLayer = new Konva.Layer();
        this.gridLayer = new Konva.Layer();
        this.tokenLayer = new Konva.Layer();
        this.fogLayer = new Konva.Layer();
        this.uiLayer = new Konva.Layer(); // For pings
        
        this.stage.add(this.bgLayer);
        this.stage.add(this.gridLayer);
        this.stage.add(this.tokenLayer);
        this.stage.add(this.fogLayer);
        this.stage.add(this.uiLayer);

        this.mapImage = new Konva.Image({ x: 0, y: 0 });
        this.bgLayer.add(this.mapImage);

        // V18.4 Culling / Lazy Rendering (IntersectionObserver)
        this.isVisible = true;
        this._setupLazyRendering();
    }

    _setupLazyRendering() {
        if (!this.container) return;
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.isVisible = true;
                    this.stage.listening(true);
                    this.stage.batchDraw(); // Refresh
                    console.log('[TacticalMapEngine] Culling OFF (Visível - GPU Restaurada)');
                } else {
                    this.isVisible = false;
                    this.stage.listening(false);
                    // Não dar draw enquanto invisível economiza muita VRAM
                    console.log('[TacticalMapEngine] Culling ON (Invisível - GPU Suspensa)');
                }
            });
        }, { threshold: 0.05 });
        
        this.observer.observe(this.container);
    }

    setMapUrl(url) {
        if (!url) {
            this.mapImage.image(null);
            if (this.isVisible) this.bgLayer.draw();
            return;
        }
        const img = new Image();
        img.onload = () => {
            this.mapImage.image(img);
            this.mapImage.width(img.width);
            this.mapImage.height(img.height);
            if (this.isVisible) this.bgLayer.draw();
        };
        img.src = url;
    }

    setFog(fogData) {
        // Implementação simplificada de fog
        this.fogLayer.destroyChildren();
        if (fogData && fogData.enabled) {
            const rect = new Konva.Rect({
                x: 0, y: 0,
                width: this.stage.width(),
                height: this.stage.height(),
                fill: 'black',
                opacity: 0.8
            });
            this.fogLayer.add(rect);
        }
        if (this.isVisible) this.fogLayer.draw();
    }

    setGrid(isActive, scale) {
        this.gridLayer.destroyChildren();
        if (isActive) {
            // Draw grid lines
            const step = 50; // default 50px per square
            for (let i = 0; i < this.stage.width() / step; i++) {
                this.gridLayer.add(new Konva.Line({
                    points: [Math.round(i * step) + 0.5, 0, Math.round(i * step) + 0.5, this.stage.height()],
                    stroke: 'rgba(255, 255, 255, 0.2)',
                    strokeWidth: 1,
                }));
            }
            for (let j = 0; j < this.stage.height() / step; j++) {
                this.gridLayer.add(new Konva.Line({
                    points: [0, Math.round(j * step) + 0.5, this.stage.width(), Math.round(j * step) + 0.5],
                    stroke: 'rgba(255, 255, 255, 0.2)',
                    strokeWidth: 1,
                }));
            }
        }
        if (this.isVisible) this.gridLayer.draw();
    }

    updateTokens(tokensArray) {
        // Remove deleted tokens
        const newIds = new Set(tokensArray.map(t => t.id));
        for (const [id, tokenGroup] of this.tokens.entries()) {
            if (!newIds.has(id)) {
                tokenGroup.destroy();
                this.tokens.delete(id);
            }
        }

        // Add or update
        tokensArray.forEach(tData => {
            let token = this.tokens.get(tData.id);
            if (!token) {
                token = this._createToken(tData);
                this.tokens.set(tData.id, token);
                this.tokenLayer.add(token);
            } else {
                this._updateToken(token, tData);
            }
        });

        if (this.isVisible) this.tokenLayer.draw();
    }

    _createToken(data) {
        const group = new Konva.Group({
            x: data.x || 0,
            y: data.y || 0,
            draggable: this.isDM
        });

        const circle = new Konva.Circle({
            radius: data.size || 25,
            fill: data.color || 'blue',
            stroke: 'white',
            strokeWidth: 2
        });
        group.add(circle);

        if (data.avatar) {
            const img = new Image();
            img.onload = () => {
                circle.fillPatternImage(img);
                circle.fillPatternOffset({ x: img.width / 2, y: img.height / 2 });
                circle.fillPatternScale({ x: (data.size * 2) / img.width, y: (data.size * 2) / img.height });
                if (this.isVisible) this.tokenLayer.draw();
            };
            img.src = data.avatar;
        }

        if (this.isDM) {
            group.on('dragend', (e) => {
                // Dispatch event to sync
                const evt = new CustomEvent('tome:token_moved', {
                    detail: { id: data.id, x: e.target.x(), y: e.target.y() }
                });
                window.dispatchEvent(evt);
            });
        }
        
        return group;
    }

    _updateToken(group, data) {
        group.to({
            x: data.x,
            y: data.y,
            duration: 0.3,
            easing: Konva.Easings.EaseInOut
        });
    }

    resize(width, height) {
        this.stage.width(width);
        this.stage.height(height);
        if (this.isVisible) this.stage.draw();
    }

    showPing(x, y, color = 'red') {
        if (!this.isVisible) return; // Se está off-screen, não renderiza pings
        const ring = new Konva.Ring({
            innerRadius: 10,
            outerRadius: 15,
            x: x,
            y: y,
            fill: color,
            opacity: 1
        });
        this.uiLayer.add(ring);
        
        ring.to({
            outerRadius: 60,
            innerRadius: 50,
            opacity: 0,
            duration: 1,
            easing: Konva.Easings.EaseOut,
            onFinish: () => ring.destroy()
        });
    }
}
