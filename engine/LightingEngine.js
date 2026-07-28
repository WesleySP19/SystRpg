/**
 * LIGHTING ENGINE v2.0
 * Real-time 2D Raycasting Shadow System.
 * Supports: QuadTree segment lookup, 360° sweeps, cone constraints,
 *           ambient global dimming, dim zones, and composite torch flicker.
 */
export class LightingEngine {
    /**
     * Calculates the visibility polygon (shadow casting) for a single light source.
     * @param {number} lx - light source X in map space
     * @param {number} ly - light source Y in map space
     * @param {number} rangeFt - light radius in feet
     * @param {object} grid - GridEngine instance
     * @param {object} quadTree - Optional QuadTree spatial index
     * @param {number} arcDeg - Angle of light cone (default 360)
     * @param {number} facingRad - Angle facing in radians (default 0)
     */
    static calculateLightPolygon(lx, ly, rangeFt, grid, quadTree = null, arcDeg = 360, facingRad = 0) {
        const cellSize = grid.cellSize;
        const feetPerCell = grid.feetPerCell;
        const rangePx = (rangeFt / feetPerCell) * cellSize;

        // Bounding box for range check
        const minX = lx - rangePx;
        const maxX = lx + rangePx;
        const minY = ly - rangePx;
        const maxY = ly + rangePx;

        // Get segments near/intersecting the light range
        const segments = [];
        
        if (quadTree) {
            const queryRange = { x: minX, y: minY, w: rangePx * 2, h: rangePx * 2 };
            const results = quadTree.query(queryRange);
            for (const item of results) {
                if (item.data) {
                    if (item.data.type === 'wall') {
                        segments.push(item.data.segment);
                    } else if (item.data.type === 'door' && !item.data.segment.isOpen) {
                        segments.push(item.data.segment);
                    }
                }
            }
        } else {
            // Fallback: iterate all walls
            grid.getWalls().forEach(w => {
                if (Math.max(w.x1, w.x2) >= minX && Math.min(w.x1, w.x2) <= maxX &&
                    Math.max(w.y1, w.y2) >= minY && Math.min(w.y1, w.y2) <= maxY) {
                    segments.push({ x1: w.x1, y1: w.y1, x2: w.x2, y2: w.y2 });
                }
            });
            const doors = grid.getDoors ? grid.getDoors() : [];
            doors.forEach(d => {
                if (!d.isOpen) {
                    if (Math.max(d.x1, d.x2) >= minX && Math.min(d.x1, d.x2) <= maxX &&
                        Math.max(d.y1, d.y2) >= minY && Math.min(d.y1, d.y2) <= maxY) {
                        segments.push({ x1: d.x1, y1: d.y1, x2: d.x2, y2: d.y2 });
                    }
                }
            });
        }

        // Collect endpoints
        const points = [];
        segments.forEach(s => {
            points.push({ x: s.x1, y: s.y1 });
            points.push({ x: s.x2, y: s.y2 });
        });

        // Add the 4 corners of the bounding box to close the polygon at range limits
        points.push({ x: minX, y: minY });
        points.push({ x: maxX, y: minY });
        points.push({ x: maxX, y: maxY });
        points.push({ x: minX, y: maxY });

        // Generate unique angles
        const uniqueAngles = new Set();
        const angles = [];
        
        const halfArcRad = ((arcDeg / 2) * Math.PI) / 180;
        const addAngle = (angle) => {
            // Normalize angle to [-PI, PI]
            let norm = angle;
            while (norm < -Math.PI) norm += 2 * Math.PI;
            while (norm > Math.PI) norm -= 2 * Math.PI;
            
            // Check cone constraints
            if (arcDeg < 360) {
                let diff = Math.abs(norm - facingRad);
                if (diff > Math.PI) diff = 2 * Math.PI - diff;
                if (diff > halfArcRad) return; // Out of cone
            }

            const rounded = Math.round(norm * 100000);
            if (!uniqueAngles.has(rounded)) {
                uniqueAngles.add(rounded);
                angles.push(norm);
            }
        };

        // Add cone edge angles explicitly if using cone
        if (arcDeg < 360) {
            addAngle(facingRad - halfArcRad);
            addAngle(facingRad + halfArcRad);
        }

        points.forEach(p => {
            const dx = p.x - lx;
            const dy = p.y - ly;
            const angle = Math.atan2(dy, dx);
            
            // Cast rays directly, and slightly offset to cover corner shadows
            [angle - 0.0001, angle, angle + 0.0001].forEach(a => {
                addAngle(a);
            });
        });

        // Sort angles
        angles.sort((a, b) => a - b);

        const polygon = [];

        // Raycast
        angles.forEach(angle => {
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);
            
            let closestT = 1;
            let intersectX = lx + dx * rangePx;
            let intersectY = ly + dy * rangePx;

            for (const s of segments) {
                const rx1 = lx, ry1 = ly;
                const rx2 = lx + dx * rangePx, ry2 = ly + dy * rangePx;
                const sx1 = s.x1, sy1 = s.y1;
                const sx2 = s.x2, sy2 = s.y2;

                const denom = (rx2 - rx1) * (sy2 - sy1) - (ry2 - ry1) * (sx2 - sx1);
                if (Math.abs(denom) < 1e-10) continue; // Parallel

                const t = ((sx1 - rx1) * (sy2 - sy1) - (sy1 - ry1) * (sx2 - sx1)) / denom;
                const u = ((sx1 - rx1) * (ry2 - ry1) - (sy1 - ry1) * (rx2 - rx1)) / denom;

                if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
                    if (t < closestT) {
                        closestT = t;
                        intersectX = lx + dx * rangePx * t;
                        intersectY = ly + dy * rangePx * t;
                    }
                }
            }

            polygon.push({ x: intersectX, y: intersectY });
        });

        // If cone, close the triangle to the light source center to form a proper slice
        if (arcDeg < 360 && polygon.length > 0) {
            polygon.unshift({ x: lx, y: ly });
            polygon.push({ x: lx, y: ly });
        }

        return polygon;
    }

    /**
     * Smooth harmonic noise function for natural torch flicker
     */
    static getTorchFlicker(time, seed = 0) {
        return (
            Math.sin(time * 0.008 + seed) * 0.35 +
            Math.cos(time * 0.017 + seed * 1.5) * 0.25 +
            Math.sin(time * 0.034 + seed * 2.2) * 0.2
        );
    }

    /**
     * Renders dark ambient shadows and overlay light sources in real-time.
     */
    static renderLights(ctx, lights, grid, getProjectedCoords, zoom, pan, fogEnabled, offscreenCanvas, quadTree = null) {
        if (!lights) return;

        const W = ctx.canvas.width;
        const H = ctx.canvas.height;

        if (!offscreenCanvas) {
            offscreenCanvas = document.createElement('canvas');
        }
        if (offscreenCanvas.width !== W || offscreenCanvas.height !== H) {
            offscreenCanvas.width = W;
            offscreenCanvas.height = H;
        }

        const octx = offscreenCanvas.getContext('2d');
        octx.clearRect(0, 0, W, H);

        // Fill with ambient darkness (L4: Lighting dark global layer)
        let ambientColor = 'rgba(10, 12, 18, 0.74)';
        if (fogEnabled) {
            ambientColor = 'rgba(5, 6, 10, 0.96)';
        } else {
            const timeMode = grid.timeOfDayMode || 'auto';
            if (timeMode === 'day') {
                ambientColor = 'rgba(255, 245, 230, 0.03)';
            } else if (timeMode === 'night') {
                ambientColor = 'rgba(4, 5, 12, 0.90)';
            } else {
                // Auto: 10 minutes cycle (600000ms)
                const cycleMs = 600000;
                const normTime = (Date.now() % cycleMs) / cycleMs;
                ambientColor = LightingEngine.getCycleAmbientColor(normTime);
            }
        }
        octx.fillStyle = ambientColor;
        octx.fillRect(0, 0, W, H);

        // Cut out lit shapes from darkness
        octx.save();
        octx.globalCompositeOperation = 'destination-out';

        const timeNow = Date.now();

        lights.forEach(light => {
            // Apply flicker noise if enabled
            let range = light.range;
            let intensity = light.intensity || 1.0;
            if (light.flicker !== false) {
                const seed = light.flickerSeed || (light.id ? light.id.charCodeAt(0) || 0 : 0);
                const flickerVal = this.getTorchFlicker(timeNow, seed);
                range += flickerVal * 2.2; // fluctuate range in feet
                intensity += flickerVal * 0.08;
            }

            const sc = getProjectedCoords(light.x, light.y);
            const rangePx = (range / grid.feetPerCell) * grid.cellSize * zoom;

            const polygon = this.calculateLightPolygon(
                light.x, 
                light.y, 
                range, 
                grid, 
                quadTree, 
                light.arc || 360, 
                light.facing || 0
            );

            if (polygon.length > 1) {
                octx.beginPath();
                const p0 = getProjectedCoords(polygon[0].x, polygon[0].y);
                octx.moveTo(p0.x, p0.y);
                for (let i = 1; i < polygon.length; i++) {
                    const p = getProjectedCoords(polygon[i].x, polygon[i].y);
                    octx.lineTo(p.x, p.y);
                }
                octx.closePath();

                // Create radial gradient for light falloff with dim light zones
                const grad = octx.createRadialGradient(sc.x, sc.y, 0, sc.x, sc.y, rangePx);
                grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
                grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.75)'); // Bright light zone limit
                grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.25)'); // Dim light zone transition
                grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');   // Shadow boundary
                octx.fillStyle = grad;
                octx.fill();
            }
        });

        octx.restore();

        // Draw ambient mask
        ctx.save();
        ctx.drawImage(offscreenCanvas, 0, 0);
        ctx.restore();

        // Draw secondary colored light glows (additive blend for magic ambiance!)
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        lights.forEach(light => {
            let range = light.range;
            let intensity = light.intensity || 1.0;
            if (light.flicker !== false) {
                const seed = light.flickerSeed || (light.id ? light.id.charCodeAt(0) || 0 : 0);
                const flickerVal = this.getTorchFlicker(timeNow, seed);
                range += flickerVal * 2.2;
                intensity += flickerVal * 0.08;
            }

            const sc = getProjectedCoords(light.x, light.y);
            const rangePx = (range / grid.feetPerCell) * grid.cellSize * zoom;

            const polygon = this.calculateLightPolygon(
                light.x, 
                light.y, 
                range, 
                grid, 
                quadTree, 
                light.arc || 360, 
                light.facing || 0
            );

            if (polygon.length > 1) {
                ctx.beginPath();
                const p0 = getProjectedCoords(polygon[0].x, polygon[0].y);
                ctx.moveTo(p0.x, p0.y);
                for (let i = 1; i < polygon.length; i++) {
                    const p = getProjectedCoords(polygon[i].x, polygon[i].y);
                    ctx.lineTo(p.x, p.y);
                }
                ctx.closePath();

                const grad = ctx.createRadialGradient(sc.x, sc.y, 0, sc.x, sc.y, rangePx);
                const color = light.color || '#ffaa44';
                
                // Convert hex to rgb
                let r = 255, g = 170, b = 68;
                if (color.startsWith('#')) {
                    const hex = color.slice(1);
                    if (hex.length === 6) {
                        r = parseInt(hex.substring(0, 2), 16);
                        g = parseInt(hex.substring(2, 4), 16);
                        b = parseInt(hex.substring(4, 6), 16);
                    }
                }

                grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.32 * intensity})`);
                grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.14 * intensity})`);
                grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
                
                ctx.fillStyle = grad;
                ctx.fill();
            }
        });
        ctx.restore();
    }

    /**
     * Calculates ambient color for dynamic day/night cycles based on normalized time [0, 1]
     */
    static getCycleAmbientColor(normTime) {
        let r, g, b, a;
        if (normTime >= 0.0 && normTime < 0.2) {
            r = 4; g = 5; b = 12; a = 0.90;
        } else if (normTime >= 0.2 && normTime < 0.35) {
            const pct = (normTime - 0.2) / 0.15;
            r = Math.round(4 + (45 - 4) * pct);
            g = Math.round(5 + (15 - 5) * pct);
            b = Math.round(12 + (35 - 12) * pct);
            a = 0.90 + (0.50 - 0.90) * pct;
        } else if (normTime >= 0.35 && normTime < 0.45) {
            const pct = (normTime - 0.35) / 0.10;
            r = Math.round(45 + (255 - 45) * pct);
            g = Math.round(15 + (240 - 15) * pct);
            b = Math.round(35 + (200 - 35) * pct);
            a = 0.50 + (0.04 - 0.50) * pct;
        } else if (normTime >= 0.45 && normTime < 0.70) {
            r = 255; g = 240; b = 200; a = 0.04;
        } else if (normTime >= 0.70 && normTime < 0.82) {
            const pct = (normTime - 0.70) / 0.12;
            r = Math.round(255 + (55 - 255) * pct);
            g = Math.round(240 + (15 - 240) * pct);
            b = Math.round(200 + (45 - 200) * pct);
            a = 0.04 + (0.55 - 0.04) * pct;
        } else if (normTime >= 0.82 && normTime < 0.92) {
            const pct = (normTime - 0.82) / 0.10;
            r = Math.round(55 + (4 - 55) * pct);
            g = Math.round(15 + (5 - 15) * pct);
            b = Math.round(45 + (12 - 45) * pct);
            a = 0.55 + (0.90 - 0.55) * pct;
        } else {
            r = 4; g = 5; b = 12; a = 0.90;
        }
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
}

