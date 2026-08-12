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

        this.bgLayer = new Konva.Layer();
        this.gridLayer = new Konva.Layer();
        this.fogLayer = new Konva.Layer();
        this.tokenLayer = new Konva.Layer();
        this.uiLayer = new Konva.Layer();
        
        this.stage.add(this.bgLayer);
        this.stage.add(this.gridLayer);
        this.stage.add(this.fogLayer); // Fog is drawn over background and grid
        this.stage.add(this.tokenLayer); // Tokens go above fog
        this.stage.add(this.uiLayer);

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

        // --- FOG ERASER ---
        this.isDrawingFog = false;
        this.stage.on('mousedown touchstart', (e) => {
            // Se clicar com botão direito, não desenha
            if (e.evt.button === 2) return;
            
            if (this.activeTool !== 'eraser' || !this.isDM) return;
            this.isDrawingFog = true;
            
            const pos = this.stage.getPointerPosition();
            const transform = this.stage.getAbsoluteTransform().copy();
            transform.invert();
            const relPos = transform.point(pos);

            this.currentFogLine = new Konva.Line({
                stroke: 'black',
                strokeWidth: 60,
                globalCompositeOperation: 'destination-out',
                lineCap: 'round',
                lineJoin: 'round',
                points: [relPos.x, relPos.y, relPos.x, relPos.y],
            });
            this.fogLayer.add(this.currentFogLine);
        });

        this.stage.on('mousemove touchmove', (e) => {
            if (!this.isDrawingFog || !this.isDM || this.activeTool !== 'eraser') return;
            const pos = this.stage.getPointerPosition();
            const transform = this.stage.getAbsoluteTransform().copy();
            transform.invert();
            const relPos = transform.point(pos);
            
            const newPoints = this.currentFogLine.points().concat([relPos.x, relPos.y]);
            this.currentFogLine.points(newPoints);
        });

        this.stage.on('mouseup touchend', () => {
            if (!this.isDrawingFog) return;
            this.isDrawingFog = false;
            
            if (this.isDM && this.currentFogLine) {
                this._dispatchFogPath(this.currentFogLine.points());
            }
        });
    }

    setTool(tool) {
        this.activeTool = tool;
        if (tool === 'eraser') {
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
                opacity: 0.95
            });
            this.fogLayer.add(rect);
            
            // Renderiza caminhos de fog que vieram do sync (se houver)
            if (fogData.paths && Array.isArray(fogData.paths)) {
                fogData.paths.forEach(p => this.addFogPath(p));
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
                if (this.isVisible) this.tokenLayer.draw();
            };
            img.src = data.avatar;
        }

        if (this.isDM) {
            group.on('dragstart', () => {
                group.moveToTop();
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
                }

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
            group.to({
                x: data.x,
                y: data.y,
                duration: 0.4,
                easing: Konva.Easings.EaseInOut
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
}
