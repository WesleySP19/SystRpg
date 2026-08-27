import { useStore } from '../core/hooks.js';
import { useRef } from 'preact/hooks';
export function TurnTracker() {
const storeState = useStore();
const initiativeOrder = storeState?.initiativeOrder || [];
const initiativeIndex = storeState?.initiativeIndex || 0;
const channelRef = useRef(new BroadcastChannel('tome_map'));
const nextTurn = () => {
if (window.TOME?.store) {
window.TOME.store.update(s => {
if (!s.initiativeOrder?.length) return;
s.initiativeIndex = (s.initiativeIndex + 1) % s.initiativeOrder.length;
});
}
channelRef.current.postMessage({ type: 'turn-change' });
};
return (
<div class="turn-tracker glass" style={{ padding: '12px', borderRadius: '10px', background: 'rgba(10,12,16,0.75)', border: '1px solid rgba(197,160,89,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', marginTop: '10px' }}>
<div style={{ fontFamily: "'Cinzel', serif", color: 'var(--accent)', fontWeight: 800, marginBottom: '6px' }}>Turno Atual</div>
<ul style={{ listStyle: 'none', padding: 0, margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', color: '#fff' }}>
{initiativeOrder.map((c, idx) => (
<li key={idx} style={{ padding: '4px 6px', background: idx === initiativeIndex ? 'rgba(197,160,89,0.12)' : 'transparent', borderLeft: idx === initiativeIndex ? '3px solid var(--accent)' : 'none' }}>
{typeof c === 'object' ? c.name : c}
</li>
))}
</ul>
<button class="btn btn-primary" style={{ marginTop: '8px', width: '100%' }} onClick={nextTurn}>Próximo Turno</button>
</div>
);
}