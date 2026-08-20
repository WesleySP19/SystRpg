import { Raycaster } from '../../utils/Raycaster.js';

export class TacticalMapEngine {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.isDM = options.isDM || false;
        
        this.tokens = new Map();
        this.isGridActive = false;
        this.activeTool = 'pan'; // 'pan' or 'eraser'
        
        this.stage = new Konva.Stage({
            container: containerId,
            width: options.width || window.innerWidth,
            height: options.height || window.innerHeight,
            draggable: this.isDM // DM can pan by default
        });

        this.bgLayer = new Konva.Layer({ listening: false, perfectDrawEnabled: false });
        this.gridLayer = new Konva.Layer({ listening: false, perfectDrawEnabled: false });
        this.wallLayer = new Konva.Layer(); // Phase 9: Walls
        this.fogLayer = new Konva.Layer({ listening: false, perfectDrawEnabled: false });
        this.tokenLayer = new Konva.Layer();
        this.uiLayer = new Konva.Layer();
        
        this.stage.add(this.bgLayer);
        this.stage.add(this.gridLayer);
        this.stage.add(this.wallLayer); // Draw walls under fog
        this.stage.add(this.fogLayer); // Fog is drawn over background, grid and walls
        this.stage.add(this.tokenLayer); // Tokens go above fog
        this.stage.add(this.uiLayer);

        this.walls = [];
        this.isDynamicLightingEnabled = false;

        this.mapImage = new Konva.Image({ x: 0, y: 0 });
        this.bgLayer.add(this.mapImage);

        // V18.4 Culling / Lazy Rendering (IntersectionObserver)
        this.isVisible = true;
        this._setupLazyRendering();
        this._setupInteractions();
    }

    _setupInteractions() {
        // --- ZOOM (Wheel) ---
        this.stage.on('wheel', (e) => {
            e.evt.preventDefault();
            const scaleBy = 1.1;
            const stage = this.stage;
            const oldScale = stage.scaleX();
            const pointer = stage.getPointerPosition();

            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };

            let direction = e.evt.deltaY > 0 ? -1 : 1;
            const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
            
            // Limit zoom bounds
            if (newScale < 0.1 || newScale > 10) return;

            stage.scale({ x: newScale, y: newScale });

            const newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            };
            stage.position(newPos);
            
            if (this.isDM) this._dispatchCameraUpdate();
        });

        // --- PAN (Drag Stage) ---
        this.stage.on('dragend', (e) => {
            if (e.target === this.stage && this.isDM) {
                 this._dispatchCameraUpdate();
            }
        });

        // --- FOG ERASER & WALL DRAWING ---
        this.isDrawingFog = false;
        this.isDrawingWall = false;
        
        this.stage.on('mousedown touchstart', (e) => {
            if (e.evt.button === 2) return;
            if (!this.isDM) return;
            
            const pos = this.stage.getPointerPosition();
            const transform = this.stage.getAbsoluteTransform().copy();
            transform.invert();
            const relPos = transform.point(pos);

            if (this.activeTool === 'eraser') {
                this.isDrawingFog = true;
                this.currentFogLine = new Konva.Line({
                    stroke: 'black',
                    strokeWidth: 60,
                    globalCompositeOperation: 'destination-out',
                    lineCap: 'round',
                    lineJoin: 'round',
                    points: [relPos.x, relPos.y, relPos.x, relPos.y],
                });
                this.fogLayer.add(this.currentFogLine);
            } else if (this.activeTool === 'wall') {
                this.isDrawingWall = true;
                this.wallStartPos = relPos;
                this.currentWallLine = new Konva.Line({
                    stroke: '#0ea5e9', // Cyan color for DM wall visibility
                    strokeWidth: 4,
                    lineCap: 'round',
                    points: [relPos.x, relPos.y, relPos.x, relPos.y],
                    opacity: 0.8
                });
                this.wallLayer.add(this.currentWallLine);
            }
        });

        this.stage.on('mousemove touchmove', (e) => {
            if (!this.isDM) return;
            const pos = this.stage.getPointerPosition();
            const transform = this.stage.getAbsoluteTransform().copy();
            transform.invert();
            const relPos = transform.point(pos);
            
            if (this.isDrawingFog && this.activeTool === 'eraser') {
                const newPoints = this.currentFogLine.points().concat([relPos.x, relPos.y]);
                this.currentFogLine.points(newPoints);
            } else if (this.isDrawingWall && this.activeTool === 'wall') {
                this.currentWallLine.points([this.wallStartPos.x, this.wallStartPos.y, relPos.x, relPos.y]);
                if (this.isVisible) this.wallLayer.draw();
            }
        });

        this.stage.on('mouseup touchend', () => {
            if (this.isDrawingFog) {
                this.isDrawingFog = false;
                if (this.isDM && this.currentFogLine) {
                    this._dispatchFogPath(this.currentFogLine.points());
                }
            } else if (this.isDrawingWall) {
                this.isDrawingWall = false;
                if (this.isDM && this.currentWallLine) {
                    const pts = this.currentWallLine.points();
                    const newWall = { p1: { x: pts[0], y: pts[1] }, p2: { x: pts[2], y: pts[3] } };
                    this.walls.push(newWall);
                    this._dispatchWall(newWall);
                    if (this.isDynamicLightingEnabled) this.renderDynamicLighting();
                }
            }
        });
    }

    setTool(tool) {
        this.activeTool = tool;
        if (tool === 'eraser' || tool === 'wall') {
            this.stage.draggable(false);
            this.container.style.cursor = 'crosshair';
        } else {
            this.stage.draggable(this.isDM);
            this.container.style.cursor = 'grab';
        }
    }

    _dispatchCameraUpdate() {
        const evt = new CustomEvent('tome:camera_update', {
            detail: { 
                x: this.stage.x(), 
                y: this.stage.y(), 
                scale: this.stage.scaleX() 
            }
        });
        window.dispatchEvent(evt);
    }

    _dispatchFogPath(points) {
        const evt = new CustomEvent('tome:fog_path', {
            detail: { points }
        });
        window.dispatchEvent(evt);
    }

    _dispatchWall(wall) {
        const evt = new CustomEvent('tome:wall_drawn', {
            detail: { wall }
        });
        window.dispatchEvent(evt);
    }

    setDynamicLightingEnabled(enabled) {
        this.isDynamicLightingEnabled = enabled;
        // Trigger a re-render of the fog
        if (enabled) {
            this.renderDynamicLighting();
        } else {
            // Se desativar, redesenha o fog convencional (precisa de um refresh externo idealmente)
            this.fogLayer.destroyChildren();
            this.setFog({ enabled: true, paths: [] }); 
        }
    }

    renderDynamicLighting() {
        if (!this.isDynamicLightingEnabled) return;
        
        // Remove cutouts antigos (mas mantem o retangulo preto)
        const children = this.fogLayer.getChildren().toArray();
        children.forEach(c => {
            if (c.attrs.id !== 'global-darkness') c.destroy();
        });

        // Para cada token (simulando que todos emitem luz de 800px para simplificar)
        for (const token of this.tokens.values()) {
            const origin = { x: token.x(), y: token.y() };
            const radius = 800; // Raio de luz padrão
            
            const polygonPoints = Raycaster.computePolygon(origin, radius, this.walls);
            
            const lightShape = new Konva.Line({
                points: polygonPoints,
                fillRadialGradientStartPoint: { x: origin.x, y: origin.y },
                fillRadialGradientStartRadius: 0,
                fillRadialGradientEndPoint: { x: origin.x, y: origin.y },
                fillRadialGradientEndRadius: radius,
                fillRadialGradientColorStops: [0, 'rgba(255,255,255,1)', 0.8, 'rgba(255,255,255,0.8)', 1, 'rgba(255,255,255,0)'],
                closed: true,
                globalCompositeOperation: 'destination-out',
                listening: false
            });

            this.fogLayer.add(lightShape);
        }

        if (this.isVisible) this.fogLayer.draw();
    }

    setCamera(x, y, scale) {
        this.stage.to({
            x, y, scaleX: scale, scaleY: scale,
            duration: 0.5,
            easing: Konva.Easings.EaseOut
        });
    }

    addFogPath(points) {
        const line = new Konva.Line({
            stroke: 'black',
            strokeWidth: 60,
            globalCompositeOperation: 'destination-out',
            lineCap: 'round',
            lineJoin: 'round',
            points: points,
        });
        this.fogLayer.add(line);
        if (this.isVisible) this.fogLayer.draw();
    }

    _setupLazyRendering() {
        if (!this.container) return;
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.isVisible = true;
                    this.stage.listening(true);
                    this.stage.batchDraw(); 
                } else {
                    this.isVisible = false;
                    this.stage.listening(false);
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
        this.fogLayer.destroyChildren();
        if (fogData && fogData.enabled) {
            const rect = new Konva.Rect({
                x: -5000, y: -5000,
                width: 10000,
                height: 10000, // Cover a massive area to allow panning
                fill: 'black',
                opacity: 0.95,
                id: 'global-darkness'
            });
            this.fogLayer.add(rect);
            
            if (this.isDynamicLightingEnabled) {
                this.renderDynamicLighting();
            } else {
                // Renderiza caminhos de fog que vieram do sync (se houver)
                if (fogData.paths && Array.isArray(fogData.paths)) {
                    fogData.paths.forEach(p => this.addFogPath(p));
                }
            }
        }
        if (this.isVisible) this.fogLayer.draw();
    }

    setGrid(isActive, scale) {
        this.isGridActive = isActive;
        this.gridLayer.destroyChildren();
        if (isActive) {
            const step = 50; 
            const maxW = 5000;
            const maxH = 5000;
            for (let i = 0; i < maxW / step; i++) {
                this.gridLayer.add(new Konva.Line({
                    points: [Math.round(i * step) + 0.5, 0, Math.round(i * step) + 0.5, maxH],
                    stroke: 'rgba(255, 255, 255, 0.2)',
                    strokeWidth: 1,
                }));
            }
            for (let j = 0; j < maxH / step; j++) {
                this.gridLayer.add(new Konva.Line({
                    points: [0, Math.round(j * step) + 0.5, maxW, Math.round(j * step) + 0.5],
                    stroke: 'rgba(255, 255, 255, 0.2)',
                    strokeWidth: 1,
                }));
            }
        }
        if (this.isVisible) this.gridLayer.draw();
    }

    updateTokens(tokensArray) {
        const newIds = new Set(tokensArray.map(t => t.id));
        for (const [id, tokenGroup] of this.tokens.entries()) {
            if (!newIds.has(id)) {
                // Smooth disappear animation
                tokenGroup.to({
                    scaleX: 0, scaleY: 0, opacity: 0, duration: 0.3,
                    onFinish: () => {
                        tokenGroup.destroy();
                        this.tokens.delete(id);
                    }
                });
            }
        }

        tokensArray.forEach(tData => {
            let token = this.tokens.get(tData.id);
            if (!token) {
                token = this._createToken(tData);
                this.tokens.set(tData.id, token);
                this.tokenLayer.add(token);
                // Smooth appear animation
                token.scale({x:0, y:0});
                token.opacity(0);
                token.to({ scaleX: 1, scaleY: 1, opacity: 1, duration: 0.4, easing: Konva.Easings.ElasticEaseOut });
            } else {
                this._updateToken(token, tData);
            }
        });

        if (this.isVisible) this.tokenLayer.draw();
    }

    _createToken(data) {
        const group = new Konva.Group({
            id: data.id,
            x: data.x || 0,
            y: data.y || 0,
            draggable: this.isDM
        });

        const circle = new Konva.Circle({
            radius: data.size || 25,
            fill: data.color || 'blue',
            stroke: 'white',
            strokeWidth: 2,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: { x: 2, y: 5 },
            shadowOpacity: 0.5
        });
        
        const text = new Konva.Text({
            text: data.name ? data.name.substring(0, 1).toUpperCase() : '',
            fontSize: (data.size || 25),
            fontFamily: 'Cinzel',
            fill: 'white',
            x: -(data.size || 25) / 2,
            y: -(data.size || 25) / 2,
            width: (data.size || 25) * 2,
            align: 'center',
            verticalAlign: 'middle',
            shadowColor: 'black',
            shadowBlur: 5
        });

        group.add(circle);
        group.add(text);

        if (data.avatar) {
            const img = new Image();
            img.onload = () => {
                circle.fillPatternImage(img);
                circle.fillPatternOffset({ x: img.width / 2, y: img.height / 2 });
                circle.fillPatternScale({ x: ((data.size || 25) * 2) / img.width, y: ((data.size || 25) * 2) / img.height });
                text.hide(); 
                
                // Cache the token to improve performance (convert to bitmap)
                group.cache({ pixelRatio: 2 });
                
                if (this.isVisible) this.tokenLayer.draw();
            };
            img.src = data.avatar;
        } else {
            // Cache text-only token as well
            group.cache({ pixelRatio: 2 });
        }

        if (this.isDM) {
            group.on('dragstart', () => {
                group.moveToTop();
            });
            group.on('dragmove', () => {
                if (this.isDynamicLightingEnabled) {
                    this.renderDynamicLighting();
                }
            });
            group.on('dragend', (e) => {
                let x = e.target.x();
                let y = e.target.y();
                
                // Snap to Grid
                if (this.isGridActive) {
                    const step = 50;
                    x = Math.round(x / step) * step;
                    y = Math.round(y / step) * step;
                    e.target.to({ x, y, duration: 0.2, easing: Konva.Easings.EaseOut });
                    // Re-render lighting after snap animation finishes
                    if (this.isDynamicLightingEnabled) {
                        setTimeout(() => this.renderDynamicLighting(), 210);
                    }
                }

                // Recache to avoid bleeding
                group.clearCache();
                group.cache({ pixelRatio: 2 });

                const evt = new CustomEvent('tome:token_moved', {
                    detail: { id: data.id, x, y }
                });
                window.dispatchEvent(evt);
            });
        }
        
        return group;
    }

    _updateToken(group, data) {
        // Only animate if position actually changed significantly
        if (Math.abs(group.x() - data.x) > 2 || Math.abs(group.y() - data.y) > 2) {
            group.clearCache();
            group.to({
                x: data.x,
                y: data.y,
                duration: 0.4,
                easing: Konva.Easings.EaseInOut,
                onFinish: () => {
                    group.cache({ pixelRatio: 2 });
                }
            });
        }
    }

    resize(width, height) {
        this.stage.width(width);
        this.stage.height(height);
        if (this.isVisible) this.stage.draw();
    }

    showPing(x, y, color = 'red') {
        if (!this.isVisible) return; 
        
        // Círculo interno que expande e some
        const ring = new Konva.Ring({
            innerRadius: 5,
            outerRadius: 10,
            x: x,
            y: y,
            fill: color,
            opacity: 0.8,
            shadowColor: color,
            shadowBlur: 20
        });
        
        // Círculo central fixo por um instante
        const center = new Konva.Circle({
            radius: 8,
            x: x, y: y,
            fill: color,
            opacity: 1
        });
        
        this.uiLayer.add(ring);
        this.uiLayer.add(center);
        
        ring.to({
            outerRadius: 80,
            innerRadius: 70,
            opacity: 0,
            duration: 1.2,
            easing: Konva.Easings.EaseOut,
            onFinish: () => ring.destroy()
        });

        center.to({
            opacity: 0,
            duration: 1.5,
            easing: Konva.Easings.EaseOut,
            onFinish: () => center.destroy()
        });
    }

    /**
     * Efeito Visual Cinematográfico para Spells e Attacks (Phase 5)
     */
    showSpellEffect(x, y, color, type = 'spell') {
        const particleCount = type === 'spell' ? 12 : 6;
        const group = new Konva.Group({ x, y });
        
        // Círculo de Explosão Central
        const burst = new Konva.Circle({
            radius: 5,
            fill: color,
            opacity: 0.9,
            shadowColor: color,
            shadowBlur: 15
        });
        group.add(burst);

        burst.to({
            radius: type === 'spell' ? 60 : 40,
            opacity: 0,
            duration: 0.8,
            easing: Konva.Easings.EaseOut,
            onFinish: () => burst.destroy()
        });

        // Partículas Orbitais
        for(let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const distance = type === 'spell' ? 70 : 45;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            
            const p = new Konva.Circle({
                x: 0, y: 0,
                radius: type === 'spell' ? 4 : 2,
                fill: color,
                opacity: 1,
                shadowColor: color,
                shadowBlur: 10
            });
            group.add(p);

            // Animação de espalhamento
            p.to({
                x: endX + (Math.random() * 20 - 10),
                y: endY + (Math.random() * 20 - 10),
                opacity: 0,
                radius: 0,
                duration: 0.6 + Math.random() * 0.4,
                easing: Konva.Easings.EaseOut,
                onFinish: () => p.destroy()
            });
        }
        
        this.uiLayer.add(group);
        
        // Destroi o grupo depois da animação
        setTimeout(() => {
            group.destroy();
        }, 1200);
    }
}
