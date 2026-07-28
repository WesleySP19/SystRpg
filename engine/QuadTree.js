/**
 * SPATIAL INDEX: QUADTREE v1.0
 * High-performance 2D spatial partitioning tree for fast spatial queries.
 * Speeds up raycasting, collision detection, and token lookup.
 */
export class QuadTree {
    /**
     * @param {object} boundary - { x, y, w, h } (x, y is top-left, w, h is width, height)
     * @param {number} capacity - Max elements before splitting
     * @param {number} maxDepth - Max recursion depth
     */
    constructor(boundary, capacity = 8, maxDepth = 6, depth = 0) {
        this.boundary = boundary; // { x, y, w, h }
        this.capacity = capacity;
        this.maxDepth = maxDepth;
        this.depth = depth;
        this.elements = [];
        this.divided = false;
        
        // Children
        this.nw = null;
        this.ne = null;
        this.sw = null;
        this.se = null;
    }

    /**
     * Clear the QuadTree
     */
    clear() {
        this.elements = [];
        this.divided = false;
        this.nw = null;
        this.ne = null;
        this.sw = null;
        this.se = null;
    }

    /**
     * Subdivide the node into four quadrants
     */
    subdivide() {
        const { x, y, w, h } = this.boundary;
        const hw = w / 2;
        const hh = h / 2;

        this.nw = new QuadTree({ x, y, w: hw, h: hh }, this.capacity, this.maxDepth, this.depth + 1);
        this.ne = new QuadTree({ x: x + hw, y, w: hw, h: hh }, this.capacity, this.maxDepth, this.depth + 1);
        this.sw = new QuadTree({ x, y: y + hh, w: hw, h: hh }, this.capacity, this.maxDepth, this.depth + 1);
        this.se = new QuadTree({ x: x + hw, y: y + hh, w: hw, h: hh }, this.capacity, this.maxDepth, this.depth + 1);

        this.divided = true;

        // Distribute existing elements to children
        const temp = this.elements;
        this.elements = [];
        for (const el of temp) {
            this.insert(el);
        }
    }

    /**
     * Insert an element into the QuadTree
     * @param {object} el - Must have boundary `{ x, y, w, h }` and arbitrary `data`
     * @returns {boolean} - True if successfully inserted
     */
    insert(el) {
        if (!el || !el.boundary) return false;

        // If the element does not overlap this quad's boundary, we can't insert it here
        if (!this._intersects(this.boundary, el.boundary)) {
            return false;
        }

        // If we haven't divided and are under capacity (or reached max depth), store here
        if (!this.divided) {
            if (this.elements.length < this.capacity || this.depth >= this.maxDepth) {
                this.elements.push(el);
                return true;
            }
            // Otherwise subdivide and insert
            this.subdivide();
        }

        // Try inserting into children
        let inserted = false;
        if (this.nw.insert(el)) inserted = true;
        if (this.ne.insert(el)) inserted = true;
        if (this.sw.insert(el)) inserted = true;
        if (this.se.insert(el)) inserted = true;

        return inserted;
    }

    /**
     * Query elements within a range
     * @param {object} range - { x, y, w, h } boundary
     * @param {Set} found - Optional set to prevent duplicates when elements span borders
     * @returns {Array} - Matching elements
     */
    query(range, found = new Set()) {
        const results = [];

        // If range doesn't overlap this node, return empty
        if (!this._intersects(this.boundary, range)) {
            return results;
        }

        // Check local elements
        for (const el of this.elements) {
            if (this._intersects(el.boundary, range)) {
                if (!found.has(el)) {
                    found.add(el);
                    results.push(el);
                }
            }
        }

        // If divided, query children
        if (this.divided) {
            results.push(...this.nw.query(range, found));
            results.push(...this.ne.query(range, found));
            results.push(...this.sw.query(range, found));
            results.push(...this.se.query(range, found));
        }

        return results;
    }

    /**
     * Helper: AABB intersection check
     */
    _intersects(b1, b2) {
        return (
            b1.x < b2.x + b2.w &&
            b1.x + b1.w > b2.x &&
            b1.y < b2.y + b2.h &&
            b1.y + b1.h > b2.y
        );
    }
}
