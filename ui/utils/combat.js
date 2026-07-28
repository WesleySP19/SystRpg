// ui/utils/combat.js
/**
 * Simple combat utility functions for D&D style encounters.
 * Stores combat order in localStorage under key `TOME_COMBAT_META_{mesaId}`.
 */
export const combat = {
  /**
   * Initialize combat order.
   * @param {Array} tokens - Array of token objects with optional `initiative` property.
   * @returns {Array} ordered array of token ids.
   */
  startCombat(tokens) {
    // Determine initiative value: use token.initiative if present, otherwise roll d20.
    const withInit = tokens.map(t => {
      const init = typeof t.initiative === 'number' ? t.initiative : Math.floor(Math.random() * 20) + 1;
      return { id: t.id, init };
    });
    // Sort descending (higher initiative first)
    withInit.sort((a, b) => b.init - a.init);
    const order = withInit.map(o => o.id);
    // Persist to localStorage (mesaId is inferred from global state)
    const mesaId = window.TOME?.state?.currentTableId || 'default';
    localStorage.setItem(`TOME_COMBAT_META_${mesaId}`, JSON.stringify({ order, index: 0 }));
    return order;
  },

  /**
   * Advance to the next turn.
   * Updates stored index and returns the new index.
   */
  nextTurn() {
    const mesaId = window.TOME?.state?.currentTableId || 'default';
    const meta = JSON.parse(localStorage.getItem(`TOME_COMBAT_META_${mesaId}`) || '{}');
    if (!meta.order) return 0;
    const nextIdx = (meta.index + 1) % meta.order.length;
    meta.index = nextIdx;
    localStorage.setItem(`TOME_COMBAT_META_${mesaId}`, JSON.stringify(meta));
    return nextIdx;
  },

  /**
   * Retrieve current combat metadata.
   */
  getMeta() {
    const mesaId = window.TOME?.state?.currentTableId || 'default';
    return JSON.parse(localStorage.getItem(`TOME_COMBAT_META_${mesaId}`) || '{}');
  }
};
