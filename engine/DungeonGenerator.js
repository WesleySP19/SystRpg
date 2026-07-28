/**
 * DUNGEON GENERATOR v2.0
 * Procedural generation for Dungeons, Forests, and Quests.
 */
export class DungeonGenerator {
    /**
     * Generates a complete random dungeon scenario.
     */
    static generateDungeon(cols, rows, cellSize) {
        const rooms = [];
        const floorCells = new Set();
        const corridorCells = new Set();
        const walls = [];
        const doors = [];
        const elements = [];
        const lights = [];
        
        // Root partition covers the whole grid space
        const root = { x: 0, y: 0, w: cols, h: rows };
        const leaves = [];
        
        const splitNode = (node, depth) => {
            if (depth >= 4 || (node.w <= 8 && node.h <= 8)) {
                leaves.push(node);
                return;
            }
            let splitH = Math.random() > 0.5;
            if (node.w > node.h * 1.5) splitH = false;
            else if (node.h > node.w * 1.5) splitH = true;
            
            const minSize = 5;
            if (splitH) {
                if (node.h < minSize * 2) { leaves.push(node); return; }
                const splitY = Math.floor(minSize + Math.random() * (node.h - minSize * 2));
                splitNode({ x: node.x, y: node.y, w: node.w, h: splitY }, depth + 1);
                splitNode({ x: node.x, y: node.y + splitY, w: node.w, h: node.h - splitY }, depth + 1);
            } else {
                if (node.w < minSize * 2) { leaves.push(node); return; }
                const splitX = Math.floor(minSize + Math.random() * (node.w - minSize * 2));
                splitNode({ x: node.x, y: node.y, w: splitX, h: node.h }, depth + 1);
                splitNode({ x: node.x + splitX, y: node.y, w: node.w - splitX, h: node.h }, depth + 1);
            }
        };
        splitNode(root, 0);
        
        // Create rooms inside the leaf nodes
        leaves.forEach(leaf => {
            const rw = Math.max(4, leaf.w - 2 - Math.floor(Math.random() * 2));
            const rh = Math.max(4, leaf.h - 2 - Math.floor(Math.random() * 2));
            const rx = leaf.x + 1 + Math.floor(Math.random() * (leaf.w - rw - 1));
            const ry = leaf.y + 1 + Math.floor(Math.random() * (leaf.h - rh - 1));
            
            const room = { x: rx, y: ry, w: rw, h: rh };
            rooms.push(room);
            
            for (let c = rx; c < rx + rw; c++) {
                for (let r = ry; r < ry + rh; r++) {
                    floorCells.add(`${c},${r}`);
                }
            }
        });
        
        // Connect partitions with corridors (thicker corridors)
        for (let i = 0; i < rooms.length - 1; i++) {
            const r1 = rooms[i];
            const r2 = rooms[i + 1];
            const c1 = { x: Math.floor(r1.x + r1.w / 2), y: Math.floor(r1.y + r1.h / 2) };
            const c2 = { x: Math.floor(r2.x + r2.w / 2), y: Math.floor(r2.y + r2.h / 2) };
            
            let currY = c1.y;
            const startX = Math.min(c1.x, c2.x);
            const endX = Math.max(c1.x, c2.x);
            for (let x = startX; x <= endX; x++) {
                corridorCells.add(`${x},${currY}`);
                corridorCells.add(`${x},${currY+1}`); // 2-tile wide corridor
            }
            
            const startY = Math.min(c1.y, c2.y);
            const endY = Math.max(c1.y, c2.y);
            for (let y = startY; y <= endY; y++) {
                corridorCells.add(`${c2.x},${y}`);
                corridorCells.add(`${c2.x+1},${y}`); // 2-tile wide corridor
            }
            
            // Add a doorway at room borders
            if (Math.random() > 0.3) {
                if (c2.x !== c1.x) {
                    const borderX = c2.x > c1.x ? r1.x + r1.w : r1.x - 1;
                    doors.push({ x1: borderX * cellSize, y1: c1.y * cellSize, x2: borderX * cellSize, y2: (c1.y + 2) * cellSize, isOpen: false });
                } else {
                    const borderY = c2.y > c1.y ? r1.y + r1.h : r1.y - 1;
                    doors.push({ x1: c1.x * cellSize, y1: borderY * cellSize, x2: (c1.x + 2) * cellSize, y2: borderY * cellSize, isOpen: false });
                }
            }
        }

        const isFloor = (c, r) => floorCells.has(`${c},${r}`) || corridorCells.has(`${c},${r}`);
        
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                if (isFloor(c, r)) {
                    // Draw cell specific elements (corridor or room cells to be parsed by renderer)
                    elements.push({
                        id: `cell_${c}_${r}_${Date.now()}`,
                        type: 'rect',
                        x1: c * cellSize,
                        y1: r * cellSize,
                        x2: (c + 1) * cellSize,
                        y2: (r + 1) * cellSize,
                        theme: corridorCells.has(`${c},${r}`) && !floorCells.has(`${c},${r}`) ? 'corridor' : 'room_stone'
                    });

                    // North wall
                    if (!isFloor(c, r - 1)) walls.push({ x1: c * cellSize, y1: r * cellSize, x2: (c + 1) * cellSize, y2: r * cellSize });
                    // South wall
                    if (!isFloor(c, r + 1)) walls.push({ x1: c * cellSize, y1: (r + 1) * cellSize, x2: (c + 1) * cellSize, y2: (r + 1) * cellSize });
                    // West wall
                    if (!isFloor(c - 1, r)) walls.push({ x1: c * cellSize, y1: r * cellSize, x2: c * cellSize, y2: (r + 1) * cellSize });
                    // East wall
                    if (!isFloor(c + 1, r)) walls.push({ x1: (c + 1) * cellSize, y1: r * cellSize, x2: (c + 1) * cellSize, y2: (r + 1) * cellSize });
                }
            }
        }
        
        const filteredDoors = doors.filter(d => !walls.some(w => (Math.abs(w.x1 - d.x1) < 2 && Math.abs(w.y1 - d.y1) < 2 && Math.abs(w.x2 - d.x2) < 2 && Math.abs(w.y2 - d.y2) < 2)));

        rooms.forEach((room, idx) => {
            // Room torch lights
            if (Math.random() > 0.2) {
                const lx = (room.x + Math.floor(room.w / 2)) * cellSize + cellSize / 2;
                const ly = (room.y + Math.floor(room.h / 2)) * cellSize + cellSize / 2;
                lights.push({ id: `light_${idx}_${Date.now()}`, x: lx, y: ly, range: 45 + Math.floor(Math.random() * 20), color: '#ff9c33', intensity: 1.2 });
                
                // Add a brazier prop
                elements.push({ id: `prop_brazier_${idx}`, type: 'prop', propType: 'brazier', x: lx, y: ly, radius: cellSize * 0.4 });
            }

            // Central prop (table, altar, etc)
            if (Math.random() > 0.5) {
                const cx = (room.x + room.w / 2) * cellSize;
                const cy = (room.y + room.h / 2) * cellSize;
                elements.push({ id: `prop_center_${idx}`, type: 'prop', propType: Math.random() > 0.5 ? 'table' : 'altar', x: cx, y: cy, radius: cellSize * 0.8, rotation: Math.floor(Math.random() * 4) * 90 });
            }

            // Scatter room chest stamp
            if (Math.random() > 0.6) {
                elements.push({ id: `stamp_chest_${idx}`, type: 'stamp', x: (room.x + 1) * cellSize, y: (room.y + 1) * cellSize, key: '📦', scale: 0.85, rotation: 0 });
            }
        });

        return { walls, doors: filteredDoors.map((d, i) => ({ ...d, id: `door_proc_${i}_${Date.now()}` })), elements, lights };
    }

    /**
     * Generates a complete random forest scenario using Cellular Automata.
     */
    static generateForest(cols, rows, cellSize) {
        const floorCells = new Set();
        const waterCells = new Set();
        const walls = [];
        const elements = [];
        const lights = [];

        // Simple Cellular Automata for organic generation (Tree boundaries vs Clearings)
        let map = [];
        let waterMap = [];
        for (let r = 0; r < rows; r++) {
            let row = [];
            let wRow = [];
            for (let c = 0; c < cols; c++) {
                row.push(Math.random() < 0.55 ? 1 : 0);
                wRow.push(Math.random() < 0.05 ? 1 : 0); // 5% chance for water seeds
            }
            map.push(row);
            waterMap.push(wRow);
        }

        const smooth = (grid, threshold, steps) => {
            let current = grid;
            for (let i = 0; i < steps; i++) {
                let nextMap = [];
                for (let r = 0; r < rows; r++) {
                    let row = [];
                    for (let c = 0; c < cols; c++) {
                        let neighbors = 0;
                        for (let dr = -1; dr <= 1; dr++) {
                            for (let dc = -1; dc <= 1; dc++) {
                                if (dr === 0 && dc === 0) continue;
                                let nr = r + dr, nc = c + dc;
                                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) neighbors++;
                                else if (current[nr][nc] === 0) neighbors++;
                            }
                        }
                        if (neighbors > threshold) row.push(0);
                        else if (neighbors < threshold) row.push(1);
                        else row.push(current[r][c]);
                    }
                    nextMap.push(row);
                }
                current = nextMap;
            }
            return current;
        };

        map = smooth(map, 4, 5);
        waterMap = smooth(waterMap, 3, 3); // expand water pools

        const isFloor = (c, r) => (c >= 0 && c < cols && r >= 0 && r < rows) && map[r][c] === 1;

        // Base Grass Floor
        elements.push({ id: `floor_forest_base`, type: 'rect', x1: 0, y1: 0, x2: cols * cellSize, y2: rows * cellSize, theme: 'grass' });

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (waterMap[r][c] === 0 && map[r][c] === 1) {
                    // Water overrides grass
                    elements.push({ id: `water_${c}_${r}`, type: 'rect', x1: c*cellSize, y1: r*cellSize, x2: (c+1)*cellSize, y2: (r+1)*cellSize, theme: 'water' });
                }

                if (isFloor(c, r)) {
                    floorCells.add(`${c},${r}`);
                    if (!isFloor(c, r - 1)) walls.push({ x1: c * cellSize, y1: r * cellSize, x2: (c + 1) * cellSize, y2: r * cellSize });
                    if (!isFloor(c, r + 1)) walls.push({ x1: c * cellSize, y1: (r + 1) * cellSize, x2: (c + 1) * cellSize, y2: (r + 1) * cellSize });
                    if (!isFloor(c - 1, r)) walls.push({ x1: c * cellSize, y1: r * cellSize, x2: c * cellSize, y2: (r + 1) * cellSize });
                    if (!isFloor(c + 1, r)) walls.push({ x1: (c + 1) * cellSize, y1: r * cellSize, x2: (c + 1) * cellSize, y2: (r + 1) * cellSize });
                } else {
                    // Solid block = Tree cluster
                    if (Math.random() > 0.1) {
                        elements.push({
                            id: `tree_${c}_${r}_${Date.now()}`,
                            type: 'tree',
                            x: c * cellSize + cellSize / 2 + (Math.random() * 16 - 8),
                            y: r * cellSize + cellSize / 2 + (Math.random() * 16 - 8),
                            radius: cellSize * (0.8 + Math.random() * 0.4),
                            rotation: Math.random() * Math.PI * 2
                        });
                    }
                }
            }
        }

        // Add a campfire in a random floor clearing
        const floorsArray = Array.from(floorCells);
        if (floorsArray.length > 0) {
            const randomFloor = floorsArray[Math.floor(Math.random() * floorsArray.length)];
            const [fc, fr] = randomFloor.split(',').map(Number);
            const campX = fc * cellSize + cellSize/2;
            const campY = fr * cellSize + cellSize/2;
            
            elements.push({ id: `camp_${Date.now()}`, type: 'prop', propType: 'campfire', x: campX, y: campY, radius: cellSize * 0.5 });
            lights.push({ id: `camp_light_${Date.now()}`, x: campX, y: campY, range: 60, color: '#ff7700', intensity: 1.5 });
        }

        return { walls, doors: [], elements, lights };
    }

    /**
     * Generates a linear/branching Quest Map: Entrance -> Challenge 1 -> Challenge 2 -> Boss Room.
     */
    static generateQuestMap(cols, rows, cellSize) {
        const walls = [];
        const doors = [];
        const elements = [];
        const lights = [];
        const floorCells = new Set();
        
        // Let's create a flow of rooms from left to right
        const roomConfigs = [
            { id: 'entrance', w: 6, h: 6, theme: 'room_stone', content: 'entrance' },
            { id: 'challenge1', w: 8, h: 8, theme: 'room_stone', content: 'puzzle' },
            { id: 'challenge2', w: 10, h: 8, theme: 'room_stone', content: 'combat' },
            { id: 'boss', w: 12, h: 12, theme: 'room_stone', content: 'boss' }
        ];

        let currentX = 2; // start margin
        const centerY = Math.floor(rows / 2);

        const rooms = [];

        roomConfigs.forEach((rc, i) => {
            const rx = currentX;
            const ry = centerY - Math.floor(rc.h / 2);
            rooms.push({ ...rc, x: rx, y: ry });
            currentX += rc.w + 4; // gap for corridors
        });

        rooms.forEach((room, i) => {
            // Register floor
            for (let c = room.x; c < room.x + room.w; c++) {
                for (let r = room.y; r < room.y + room.h; r++) {
                    floorCells.add(`${c},${r}`);
                    elements.push({ id: `qcell_${c}_${r}`, type: 'rect', x1: c*cellSize, y1: r*cellSize, x2: (c+1)*cellSize, y2: (r+1)*cellSize, theme: room.theme });
                }
            }

            // Decorate based on content
            const cx = (room.x + room.w/2) * cellSize;
            const cy = (room.y + room.h/2) * cellSize;

            if (room.content === 'entrance') {
                elements.push({ id: `prop_entrance`, type: 'text', x: cx, y: cy - cellSize, text: 'ENTRADA', size: 24, color: '#4ade80' });
                lights.push({ id: `l_ent`, x: cx, y: cy, range: 40, color: '#a7f3d0', intensity: 1 });
            } else if (room.content === 'puzzle') {
                elements.push({ id: `prop_statue1`, type: 'prop', propType: 'statue', x: room.x*cellSize + cellSize, y: room.y*cellSize + cellSize, radius: cellSize*0.6 });
                elements.push({ id: `prop_statue2`, type: 'prop', propType: 'statue', x: (room.x+room.w-1)*cellSize, y: (room.y+room.h-1)*cellSize, radius: cellSize*0.6 });
            } else if (room.content === 'combat') {
                elements.push({ id: `prop_bones`, type: 'stamp', x: cx, y: cy, key: '💀', scale: 1.5, rotation: 45 });
                elements.push({ id: `prop_blood`, type: 'stamp', x: cx + cellSize, y: cy - cellSize, key: '🩸', scale: 1.2, rotation: 0 });
            } else if (room.content === 'boss') {
                elements.push({ id: `prop_throne`, type: 'prop', propType: 'altar', x: (room.x + room.w - 2)*cellSize, y: cy, radius: cellSize, rotation: 0 });
                elements.push({ id: `prop_loot`, type: 'stamp', x: (room.x + room.w - 1)*cellSize, y: cy + cellSize, key: '👑', scale: 1.5, rotation: 0 });
                lights.push({ id: `l_boss1`, x: room.x*cellSize + cellSize, y: room.y*cellSize + cellSize, range: 60, color: '#ef4444', intensity: 1.5 });
                lights.push({ id: `l_boss2`, x: room.x*cellSize + cellSize, y: (room.y+room.h-1)*cellSize + cellSize, range: 60, color: '#ef4444', intensity: 1.5 });
            }

            // Create corridor to next room
            if (i < rooms.length - 1) {
                const nextRoom = rooms[i + 1];
                const startX = room.x + room.w;
                const endX = nextRoom.x;
                const corrY = centerY;
                
                for (let x = startX; x < endX; x++) {
                    floorCells.add(`${x},${corrY}`);
                    floorCells.add(`${x},${corrY+1}`);
                    elements.push({ id: `qcorr_${x}`, type: 'rect', x1: x*cellSize, y1: corrY*cellSize, x2: (x+1)*cellSize, y2: (corrY+2)*cellSize, theme: 'corridor' });
                }

                // Add doors
                doors.push({ x1: startX*cellSize, y1: corrY*cellSize, x2: startX*cellSize, y2: (corrY+2)*cellSize, isOpen: false, id: `qd_${i}_a` });
                doors.push({ x1: endX*cellSize, y1: corrY*cellSize, x2: endX*cellSize, y2: (corrY+2)*cellSize, isOpen: false, id: `qd_${i}_b` });
            }
        });

        // Walls around the quest flow
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                if (floorCells.has(`${c},${r}`)) {
                    if (!floorCells.has(`${c},${r-1}`)) walls.push({ x1: c*cellSize, y1: r*cellSize, x2: (c+1)*cellSize, y2: r*cellSize });
                    if (!floorCells.has(`${c},${r+1}`)) walls.push({ x1: c*cellSize, y1: (r+1)*cellSize, x2: (c+1)*cellSize, y2: (r+1)*cellSize });
                    if (!floorCells.has(`${c-1},${r}`)) walls.push({ x1: c*cellSize, y1: r*cellSize, x2: c*cellSize, y2: (r+1)*cellSize });
                    if (!floorCells.has(`${c+1},${r}`)) walls.push({ x1: (c+1)*cellSize, y1: r*cellSize, x2: (c+1)*cellSize, y2: (r+1)*cellSize });
                }
            }
        }

        const filteredDoors = doors.filter(d => !walls.some(w => (Math.abs(w.x1 - d.x1) < 2 && Math.abs(w.y1 - d.y1) < 2 && Math.abs(w.x2 - d.x2) < 2 && Math.abs(w.y2 - d.y2) < 2)));

        return { walls, doors: filteredDoors, elements, lights };
    }
}
