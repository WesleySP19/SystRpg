export const combat = {
startCombat(tokens) {
const withInit = tokens.map(t => {
const init = typeof t.initiative === 'number' ? t.initiative : Math.floor(Math.random() * 20) + 1;
return { id: t.id, init };
});
withInit.sort((a, b) => b.init - a.init);
const order = withInit.map(o => o.id);
const mesaId = window.TOME?.state?.currentTableId || 'default';
localStorage.setItem(`TOME_COMBAT_META_${mesaId}`, JSON.stringify({ order, index: 0 }));
return order;
},
nextTurn() {
const mesaId = window.TOME?.state?.currentTableId || 'default';
const meta = JSON.parse(localStorage.getItem(`TOME_COMBAT_META_${mesaId}`) || '{}');
if (!meta.order) return 0;
const nextIdx = (meta.index + 1) % meta.order.length;
meta.index = nextIdx;
localStorage.setItem(`TOME_COMBAT_META_${mesaId}`, JSON.stringify(meta));
return nextIdx;
},
getMeta() {
const mesaId = window.TOME?.state?.currentTableId || 'default';
return JSON.parse(localStorage.getItem(`TOME_COMBAT_META_${mesaId}`) || '{}');
}
};