/**
 * TOKEN ENGINE v1.0 — D&D 5e Tactical Map
 * Manages the logical state of all tokens on the map.
 * Handles: token creation, drag state, conditions, HP, size.
 * Does NOT touch the DOM directly — the MapManager renders.
 */

import { MonsterArt } from '../services/MonsterArt.js';

export const CONDITIONS = {
    poisoned:    { label: 'Envenenado',  icon: '☠️',  color: '#22c55e' },
    blinded:     { label: 'Cego',        icon: '👁️',  color: '#6b7280' },
    prone:       { label: 'Caído',       icon: '⬇️',  color: '#f97316' },
    paralyzed:   { label: 'Paralisado',  icon: '⚡',  color: '#a855f7' },
    invisible:   { label: 'Invisível',   icon: '👻',  color: 'rgba(255,255,255,0.6)' },
    concentrating:{ label: 'Concentrando', icon: '💎', color: '#3b82f6' },
    stunned:     { label: 'Atordoado',   icon: '💫',  color: '#eab308' },
    frightened:  { label: 'Amedrontado', icon: '😨',  color: '#ef4444' },
    charmed:     { label: 'Enfeitiçado', icon: '💜',  color: '#ec4899' },
    incapacitated:{ label: 'Incapacitado',icon: '❌', color: '#ef4444' },
    deafened:    { label: 'Surdo',       icon: '🔇',  color: '#9ca3af' },
    exhausted:   { label: 'Exausto',     icon: '💤',  color: '#7c3aed' }
};

export const TOKEN_SIZES = {
    tiny:    { label: 'Minúsculo', cells: 0.5, px: 30 },
    small:   { label: 'Pequeno',   cells: 1,   px: 50 },
    medium:  { label: 'Médio',     cells: 1,   px: 50 },
    large:   { label: 'Grande',    cells: 2,   px: 100 },
    huge:    { label: 'Enorme',    cells: 3,   px: 150 },
    gargantuan:{ label: 'Colossal', cells: 4,  px: 200 }
};

export class TokenEngine {
    constructor() {
        /** @type {Map<string, Token>} */
        this._tokens = new Map();
        this._nextId = 1;

        // Drag state
        this._dragging = null; // { tokenId, offsetX, offsetY }
    }

    /* ── CRUD ───────────────────────────────────────────────────── */

    /**
     * Create a new token from an entity (player / monster)
     * @param {object} entity — from store.players or store.monsters
     * @param {number} x — pixel x (will be snapped externally)
     * @param {number} y — pixel y
     * @returns {Token}
     */
    addToken(entity, x = 100, y = 100) {
        const isMonster = !!(entity.hp_max || entity.originalData);
        const id = `tok-${Date.now()}-${this._nextId++}`;
        const hpMax   = entity.hp_max || entity.hp?.max || entity.hp || 10;
        const hpCurr  = entity.hp?.current || hpMax;
        const size    = entity.size ? entity.size.toLowerCase() : 'medium';

        /** @type {Token} */
        const token = {
            id,
            entityId: entity.id,
            name:     entity.name,
            type:     isMonster ? 'monster' : 'player',
            img:      entity.img || entity.portraitData || (isMonster ? MonsterArt.getImage(entity) : null),
            emoji:    entity.emoji || null,
            x, y,
            // D&D stats
            hp:       { current: hpCurr, max: hpMax },
            ac:       entity.ac || 10,
            speed:    entity.speed || 30,
            initiative: entity.initiative || 0,
            visionRange: entity.visionRange !== undefined ? entity.visionRange : 60,
            darkvision: entity.darkvision || 0,
            lightRadius: entity.lightRadius || 0,
            size:     TOKEN_SIZES[size] ? size : 'medium',
            // State
            conditions: [],
            movedFt:  0,      // Feet already moved this turn
            hasTakenAction: false,
            hasTakenBonus: false,
            isCurrentTurn: false,
            isDead: false,
            aura:    null,    // { radiusFt, color } optional
        };

        this._tokens.set(id, token);
        return token;
    }

    removeToken(id) {
        return this._tokens.delete(id);
    }

    getToken(id) {
        return this._tokens.get(id);
    }

    getAllTokens() {
        return [...this._tokens.values()];
    }

    /** Returns only tokens of a given type */
    getTokensByType(type) {
        return this.getAllTokens().filter(t => t.type === type);
    }

    /* ── Position ───────────────────────────────────────────────── */

    setPosition(id, x, y) {
        const t = this._tokens.get(id);
        if (t) { t.x = x; t.y = y; }
    }

    /* ── HP Management ──────────────────────────────────────────── */

    modifyHP(id, delta) {
        const t = this._tokens.get(id);
        if (!t) return;
        t.hp.current = Math.max(0, Math.min(t.hp.max, t.hp.current + delta));
        t.isDead = t.hp.current === 0;
        return t.hp;
    }

    setHP(id, value) {
        const t = this._tokens.get(id);
        if (!t) return;
        t.hp.current = Math.max(0, Math.min(t.hp.max, value));
        t.isDead = t.hp.current === 0;
    }

    /** HP as percentage 0–100 */
    hpPercent(id) {
        const t = this._tokens.get(id);
        if (!t || t.hp.max === 0) return 100;
        return Math.round((t.hp.current / t.hp.max) * 100);
    }

    /** Returns hp bar color based on percent */
    static hpColor(pct) {
        if (pct > 50) return '#34d399'; // green
        if (pct > 25) return '#fbbf24'; // yellow
        return '#f43f5e';               // red
    }

    /* ── Conditions ─────────────────────────────────────────────── */

    addCondition(id, condition) {
        const t = this._tokens.get(id);
        if (!t || !CONDITIONS[condition]) return;
        if (!t.conditions.includes(condition)) t.conditions.push(condition);
    }

    removeCondition(id, condition) {
        const t = this._tokens.get(id);
        if (!t) return;
        t.conditions = t.conditions.filter(c => c !== condition);
    }

    toggleCondition(id, condition) {
        const t = this._tokens.get(id);
        if (!t) return;
        if (t.conditions.includes(condition)) this.removeCondition(id, condition);
        else this.addCondition(id, condition);
    }

    clearConditions(id) {
        const t = this._tokens.get(id);
        if (t) t.conditions = [];
    }

    /* ── Turn Management ────────────────────────────────────────── */

    setCurrentTurn(id) {
        this._tokens.forEach(t => { t.isCurrentTurn = false; });
        const t = this._tokens.get(id);
        if (t) {
            t.isCurrentTurn = true;
            t.movedFt = 0; // Reset movement at start of turn
            t.hasTakenAction = false;
            t.hasTakenBonus = false;
        }
    }

    recordMovement(id, feet) {
        const t = this._tokens.get(id);
        if (t) t.movedFt += feet;
    }

    getRemainingMove(id) {
        const t = this._tokens.get(id);
        if (!t) return 0;
        return Math.max(0, t.speed - t.movedFt);
    }

    /* ── Drag State ─────────────────────────────────────────────── */

    startDrag(tokenId, offsetX = 0, offsetY = 0) {
        this._dragging = { tokenId, offsetX, offsetY };
    }

    updateDrag(mouseX, mouseY) {
        if (!this._dragging) return null;
        const { tokenId, offsetX, offsetY } = this._dragging;
        const t = this._tokens.get(tokenId);
        if (t) {
            t.x = mouseX - offsetX;
            t.y = mouseY - offsetY;
        }
        return tokenId;
    }

    endDrag() {
        const d = this._dragging;
        this._dragging = null;
        return d ? d.tokenId : null;
    }

    isDragging() { return this._dragging !== null; }
    getDraggingId() { return this._dragging?.tokenId || null; }

    /* ── Serialization ──────────────────────────────────────────── */

    serialize() {
        const tokens = [];
        this._tokens.forEach(t => tokens.push({ ...t }));
        return tokens;
    }

    static deserialize(data = []) {
        const engine = new TokenEngine();
        data.forEach(t => engine._tokens.set(t.id, { ...t }));
        return engine;
    }
}
