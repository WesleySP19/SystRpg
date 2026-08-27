import { useState, useEffect, useRef } from 'preact/hooks';
import { TOME } from '../../core/Registry.js';
import { Dice } from '../../utils/Dice.js';
import { Toast } from '../components/core/Toast.jsx';
import { RulesEngine } from '../../core/RulesEngine.js';
import { MonsterArt } from '../../services/MonsterArt.js';
import { FXEngine } from '../../services/FXEngine.js';
import { useStore } from '../core/hooks.js';
const CONDITIONS = {
'abalado':       { emoji: '😰', label: 'Abalado' },
'amedrontado':   { emoji: '😨', label: 'Amedrontado' },
'agarrado':      { emoji: '🤝', label: 'Agarrado' },
'atordoado':     { emoji: '💫', label: 'Atordoado' },
'cego':          { emoji: '🙈', label: 'Cego' },
'caído':         { emoji: '🤕', label: 'Caído' },
'enfeitiçado':   { emoji: '💜', label: 'Enfeitiçado' },
'envenenado':    { emoji: '🤢', label: 'Envenenado' },
'exausto':       { emoji: '😫', label: 'Exausto' },
'incapacitado':  { emoji: '😵', label: 'Incapacitado' },
'invisível':     { emoji: '👻', label: 'Invisível' },
'paralisado':    { emoji: '🧊', label: 'Paralisado' },
'petrificado':   { emoji: '🗿', label: 'Petrificado' },
'preso':         { emoji: '🕸️', label: 'Preso' },
'amaldiçoado':   { emoji: '🧿', label: 'Amaldiçoado' },
'surdo':         { emoji: '🔇', label: 'Surdo' },
};
export function InitiativeMonitor() {
const storeState = useStore();
const initiativeOrder = storeState?.initiativeOrder || [];
const initiativeIndex = storeState?.initiativeIndex || 0;
const combatActive = storeState?.combatActive || false;
const combatRound = storeState?.combatRound || 0;
const players = storeState?.players || [];
const monsters = storeState?.monsters || [];
const [economy, setEconomy] = useState({ action: true, bonus: true, reaction: true, movement: 30 });
const [quickAdd, setQuickAdd] = useState({ name: '', init: '', hp: '', type: 'Enemy' });
const [selectedCond, setSelectedCond] = useState('envenenado');
const [focusId, setFocusId] = useState(null);
const [showTurnAnnounce, setShowTurnAnnounce] = useState(false);
const [announceText, setAnnounceText] = useState('');
const [dmgInput, setDmgInput] = useState('');
const broadcastRef = useRef(null);
useEffect(() => {
if (!broadcastRef.current) {
broadcastRef.current = new BroadcastChannel('tome_map');
}
const handleSummon = (entity) => {
const initRoll = Dice.roll(20).total;
const combatant = {
id: entity.id || 'm-' + Date.now(),
name: entity.name,
initiative: initRoll,
hp: { current: entity.hp_max, max: entity.hp_max },
ac: entity.ac || 10,
type: entity.type || 'Enemy',
emoji: entity.emoji || '👹',
img: entity.img || '',
conditions: []
};
if (window.TOME?.store) {
window.TOME.store.update(s => {
if (!s.initiativeOrder) s.initiativeOrder = [];
s.initiativeOrder.push(combatant);
if (s.combatActive) {
s.initiativeOrder.sort((a, b) => b.initiative - a.initiative);
}
});
}
Toast.show(`🧙 Invocação: ${entity.name} (Iniciativa: ${initRoll})`, 'success');
};
if (window.TOME?.events) {
window.TOME.events.on('MONSTER_INVOKED', handleSummon);
}
return () => {
if (broadcastRef.current) {
broadcastRef.current.close();
broadcastRef.current = null;
}
if (window.TOME?.events) {
window.TOME.events.off('MONSTER_INVOKED', handleSummon);
}
};
}, []);
useEffect(() => {
if (showTurnAnnounce) {
const timer = setTimeout(() => {
setShowTurnAnnounce(false);
setAnnounceText('');
}, 2000);
return () => clearTimeout(timer);
}
}, [showTurnAnnounce]);
useEffect(() => {
const activeEl = document.querySelector('.im-combatant.im-active');
if (activeEl) {
activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
}, [initiativeIndex]);
const getOrderWithHP = () => {
return initiativeOrder.map(c => {
const hp = RulesEngine.getHP(c);
return { ...c, _hpCurrent: hp.current, _hpMax: hp.max };
});
};
const getHpColor = (current, max) => {
if (max <= 0) return 'var(--text-dim)';
const pct = current / max;
if (pct > 0.5) return 'var(--success)';
if (pct > 0.2) return '#e5c17b';
return 'var(--danger)';
};
const getHpPct = (current, max) => {
if (max <= 0) return 0;
return Math.min(100, Math.max(0, Math.round((current / max) * 100)));
};
const broadcastStateUpdate = () => {
if (!broadcastRef.current || !window.TOME?.store) return;
try {
const s = window.TOME.store.state;
const idx = s.initiativeIndex || 0;
broadcastRef.current.postMessage({
type: 'COMBAT_UPDATE',
state: {
combatActive: s.combatActive,
combatRound: s.combatRound,
initiativeOrder: s.initiativeOrder,
initiativeIndex: idx,
}
});
} catch (e) { }
};
const order = getOrderWithHP();
const current = order[initiativeIndex];
const focused = focusId ? order.find(c => c.id === focusId) || current : current;
const isEmpty = !combatActive || order.length === 0;
const hasParty = players.length + monsters.length > 0;
const nextTurn = () => {
if (!order.length) return;
let idx = initiativeIndex + 1;
let newRound = combatRound || 1;
let isNewRound = false;
if (idx >= order.length) {
idx = 0;
newRound++;
isNewRound = true;
}
setEconomy({ action: true, bonus: true, reaction: true, movement: 30 });
setFocusId(null);
const nextActor = order[idx];
if (nextActor) {
setShowTurnAnnounce(true);
setAnnounceText(isNewRound ? `⚔️ RODADA ${newRound} — Vez de ${nextActor.name}` : `Vez de ${nextActor.name}`);
}
if (window.TOME?.store) {
window.TOME.store.update(s => {
s.initiativeIndex = idx;
if (isNewRound) s.combatRound = newRound;
if (s.initiativeOrder) {
s.initiativeOrder = s.initiativeOrder.map((c, i) => ({
...c,
isCurrentTurn: i === idx
}));
}
});
}
setTimeout(() => broadcastStateUpdate(), 50);
Toast.show(`⚔️ Vez de ${nextActor?.name}${isNewRound ? ` · Rodada ${newRound}` : ''}`, 'info');
};
const startCombat = () => {
const allCombatants = [
...players.map(p => ({
...p,
type: 'Player',
init: Dice.quick(20) + Math.floor(((p.stats?.dex || 10) - 10) / 2),
conditions: p.conditions || [],
isCurrentTurn: false,
})),
...monsters.map(m => ({
...m,
type: 'Monster',
init: Dice.quick(20) + Math.floor(((m.stats?.dex || 10) - 10) / 2),
conditions: m.conditions || [],
isCurrentTurn: false,
}))
];
if (!allCombatants.length) {
Toast.show('Adicione heróis ou monstros antes de iniciar o combate.', 'warning');
return;
}
allCombatants.sort((a, b) => (b.init ?? 0) - (a.init ?? 0));
if (allCombatants.length > 0) allCombatants[0].isCurrentTurn = true;
setEconomy({ action: true, bonus: true, reaction: true, movement: 30 });
setFocusId(null);
setShowTurnAnnounce(true);
setAnnounceText(`⚔️ RODADA 1 — Vez de ${allCombatants[0]?.name}`);
if (window.TOME?.store) {
window.TOME.store.update(s => {
s.initiativeOrder = allCombatants;
s.initiativeIndex = 0;
s.combatRound = 1;
s.combatActive = true;
});
}
setTimeout(() => broadcastStateUpdate(), 50);
Toast.show('⚔️ Combate iniciado! Iniciativa rolada automaticamente.', 'success');
};
const rollAllInitiative = () => {
if (window.TOME?.store) {
window.TOME.store.update(s => {
if (!s.initiativeOrder?.length) return;
s.initiativeOrder = s.initiativeOrder.map(c => ({
...c,
init: Dice.quick(20) + Math.floor(((c.stats?.dex || 10) - 10) / 2),
})).sort((a, b) => (b.init ?? 0) - (a.init ?? 0));
s.initiativeIndex = 0;
s.combatRound = 1;
});
}
setEconomy({ action: true, bonus: true, reaction: true, movement: 30 });
Toast.show('🎲 Iniciativa rerolada!', 'info');
};
const endCombat = () => {
if (window.TOME?.store) {
window.TOME.store.update(s => {
s.combatActive = false;
s.initiativeOrder = [];
s.initiativeIndex = 0;
s.combatRound = 0;
});
}
setTimeout(() => broadcastStateUpdate(), 50);
Toast.show('🏁 Combate encerrado.', 'info');
};
const toggleEconomy = (type) => {
setEconomy(prev => ({ ...prev, [type]: !prev[type] }));
};
const toggleMovement = () => {
setEconomy(prev => ({ ...prev, movement: Math.max(0, prev.movement - 5) }));
};
const moveUp = (id, e) => {
e.stopPropagation();
if (window.TOME?.store) {
window.TOME.store.update(s => {
const arr = s.initiativeOrder || [];
const i = arr.findIndex(c => c.id === id);
if (i > 0) {
[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
}
});
}
};
const moveDown = (id, e) => {
e.stopPropagation();
if (window.TOME?.store) {
window.TOME.store.update(s => {
const arr = s.initiativeOrder || [];
const i = arr.findIndex(c => c.id === id);
if (i < arr.length - 1) {
[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
}
});
}
};
const removeCombatant = (id, e) => {
e.stopPropagation();
if (window.TOME?.store) {
window.TOME.store.update(s => {
s.initiativeOrder = (s.initiativeOrder || []).filter(c => c.id !== id);
if (s.initiativeIndex >= s.initiativeOrder.length) {
s.initiativeIndex = Math.max(0, s.initiativeOrder.length - 1);
}
});
}
if (focusId === id) setFocusId(null);
};
const getTarget = () => {
return focusId ? order.find(c => c.id === focusId) || current : current;
};
const applyDamage = () => {
const target = getTarget();
if (!target) return;
const val = parseInt(dmgInput || '0', 10);
if (isNaN(val) || val <= 0) {
Toast.show('Insira um valor de dano válido.', 'warning');
return;
}
let killedNow = false;
let actorType = 'Enemy';
if (window.TOME?.store) {
window.TOME.store.update(s => {
const actor = (s.initiativeOrder || []).find(c => c.id === target.id);
if (!actor) return;
actorType = actor.type || 'Enemy';
const oldHp = RulesEngine.getHP(actor).current;
if ('hp_current' in actor) {
actor.hp_current = Math.max(0, (actor.hp_current ?? actor.hp_max) - val);
if (actor.hp_current === 0 && oldHp > 0) killedNow = true;
} else if (actor._tempHP !== undefined) {
const tempDmg = Math.min(actor._tempHP || 0, val);
actor._tempHP = (actor._tempHP || 0) - tempDmg;
const remaining = val - tempDmg;
if (actor.combat) {
actor.combat.hp_current = Math.max(0, (actor.combat.hp_current ?? 0) - remaining);
if (actor.combat.hp_current === 0 && oldHp > 0) killedNow = true;
}
} else if (actor.combat) {
actor.combat.hp_current = Math.max(0, (actor.combat.hp_current ?? actor.combat.hp_max ?? 10) - val);
if (actor.combat.hp_current === 0 && oldHp > 0) killedNow = true;
}
});
}
setTimeout(() => broadcastStateUpdate(), 50);
Toast.show(`💥 ${val} de dano aplicado a ${target.name}`, 'danger');
setDmgInput('');
if (killedNow) {
if (actorType === 'Player' || target.type === 'Player') {
FXEngine.trigger('HERO_FALLEN', target.name, target.id);
} else {
FXEngine.trigger('ENTITY_SLAIN', target.name, target.id);
}
}
};
const applyHeal = () => {
const target = getTarget();
if (!target) return;
const val = parseInt(dmgInput || '0', 10);
if (isNaN(val) || val <= 0) {
Toast.show('Insira um valor de cura válido.', 'warning');
return;
}
if (window.TOME?.store) {
window.TOME.store.update(s => {
const actor = (s.initiativeOrder || []).find(c => c.id === target.id);
if (!actor) return;
if ('hp_current' in actor) {
actor.hp_current = Math.min(actor.hp_max ?? 999, (actor.hp_current ?? 0) + val);
} else if (actor.combat) {
actor.combat.hp_current = Math.min(actor.combat.hp_max ?? 999, (actor.combat.hp_current ?? 0) + val);
}
});
}
setTimeout(() => broadcastStateUpdate(), 50);
Toast.show(`💚 ${val} HP restaurados para ${target.name}`, 'success');
setDmgInput('');
};
const rollDice = () => {
const result = Dice.roll(6);
setDmgInput(result.toString());
Toast.show(`🎲 1d6 = ${result}`, 'info');
};
const applyCondition = () => {
const target = getTarget();
if (!target) return;
const cond = selectedCond;
if (window.TOME?.store) {
window.TOME.store.update(s => {
const actor = (s.initiativeOrder || []).find(c => c.id === target.id);
if (!actor) return;
if (!actor.conditions) actor.conditions = [];
if (!actor.conditions.includes(cond)) {
actor.conditions.push(cond);
}
});
}
const info = CONDITIONS[cond] || { emoji: '⚠️', label: cond };
Toast.show(`${info.emoji} ${info.label} aplicado a ${target.name}`, 'warning');
};
const removeConditionFromActive = (cond) => {
if (!current) return;
if (window.TOME?.store) {
window.TOME.store.update(s => {
const actor = (s.initiativeOrder || []).find(c => c.id === current.id);
if (actor?.conditions) {
actor.conditions = actor.conditions.filter(c => c !== cond);
}
});
}
};
const clearConditions = () => {
const target = getTarget();
if (!target) return;
if (window.TOME?.store) {
window.TOME.store.update(s => {
const actor = (s.initiativeOrder || []).find(c => c.id === target.id);
if (actor) actor.conditions = [];
});
}
Toast.show(`✅ Condições limpas de ${target.name}`, 'success');
};
const quickAddRollInit = () => {
const init = Dice.quick(20);
setQuickAdd(prev => ({ ...prev, init: init.toString() }));
Toast.show(`🎲 Iniciativa rolada: ${init}`, 'info');
};
const quickAddCombatant = (type) => {
const name = quickAdd.name.trim();
const init = parseInt(quickAdd.init || '0', 10) || Dice.quick(20);
const hp = parseInt(quickAdd.hp || '10', 10) || 10;
if (!name) {
Toast.show('Insira um nome para o combatente.', 'warning');
return;
}
const newCombatant = {
id: `qc-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
name, type, init, ac: 10, hp_current: hp, hp_max: hp, conditions: [], isCurrentTurn: false,
};
if (window.TOME?.store) {
window.TOME.store.update(s => {
if (!s.initiativeOrder) s.initiativeOrder = [];
s.initiativeOrder.push(newCombatant);
s.initiativeOrder.sort((a, b) => (b.init ?? 0) - (a.init ?? 0));
if (!s.combatActive) {
s.combatActive = true;
s.combatRound = s.combatRound || 1;
s.initiativeIndex = 0;
}
});
}
setTimeout(() => broadcastStateUpdate(), 50);
setQuickAdd({ name: '', init: '', hp: '', type: 'Enemy' });
Toast.show(`➕ ${name} adicionado como ${type === 'Player' ? 'Herói' : 'Inimigo'}`, 'success');
};
const navigateToCombat = () => {
if (window.TOME?.store) {
window.TOME.store.update(s => { s.activeTab = 'campaign'; });
}
};
return (
<div class="im-root" style={{ height: '100%', position: 'relative' }}>
<div class="im-header" style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
<h2 class="im-title" style={{ margin: 0, fontSize: '1rem', color: '#fff', fontFamily: 'Cinzel' }}>
<i class="fa-solid fa-swords" style={{ color: 'var(--danger)', fontSize: '0.9rem', marginRight: '8px' }}></i>
ORDEM DE BATALHA
</h2>
{combatActive ? (
<span class="im-round-badge" style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'rgba(197,160,89,0.1)', color: 'var(--accent)', borderRadius: '4px', border: '1px solid rgba(197,160,89,0.3)' }}>⚔️ RODADA {combatRound || 1}</span>
) : (
<span class="im-round-badge" style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>COMBATE INATIVO</span>
)}
</div>
<div class="im-header-controls" style={{ display: 'flex', gap: '8px' }}>
{combatActive ? (
<>
<button class="btn btn-ghost" style={{ fontSize: '0.6rem', padding: '5px 10px' }} onClick={rollAllInitiative} title="Rerolar Iniciativa">
<i class="fa-solid fa-dice-d20"></i> Rolar Tudo
</button>
<button class="btn btn-primary" style={{ fontSize: '0.7rem', padding: '6px 16px', fontFamily: 'Cinzel' }} onClick={nextTurn}>
PRÓXIMO <i class="fa-solid fa-chevron-right"></i>
</button>
<button class="btn btn-ghost" style={{ fontSize: '0.6rem', padding: '5px 8px', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)' }} onClick={endCombat} title="Encerrar Combate">
<i class="fa-solid fa-flag-checkered"></i>
</button>
</>
) : (
<button class="btn btn-primary" style={{ fontSize: '0.75rem', padding: '7px 18px', fontFamily: 'Cinzel', letterSpacing: '1px' }} onClick={startCombat}>
<i class="fa-solid fa-dice-d20"></i> INICIAR COMBATE
</button>
)}
</div>
</div>
{isEmpty ? (
<div class="im-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
<div class="im-empty-icon" style={{ fontSize: '3rem', marginBottom: '16px' }}>⚔️</div>
<div class="im-empty-title" style={{ fontSize: '1.2rem', fontFamily: 'Cinzel', color: '#fff' }}>Arena Silenciosa</div>
<p class="im-empty-sub" style={{ fontSize: '0.8rem', textAlign: 'center', maxWidth: '80%', color: 'var(--text-dim)', marginTop: '8px', marginBottom: '24px' }}>
{hasParty ? 'Clique em "Iniciar Combate" para rolar iniciativa automática.' : 'Adicione heróis e monstros à campanha primeiro.'}
</p>
{hasParty ? (
<button class="btn btn-primary" style={{ fontFamily: 'Cinzel', padding: '12px 28px', letterSpacing: '1px', fontSize: '0.85rem' }} onClick={startCombat}>
<i class="fa-solid fa-dice-d20"></i> INICIAR COMBATE
</button>
) : (
<button class="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={navigateToCombat}>
Ir para Campanha →
</button>
)}
</div>
) : (
<div style={{ padding: '20px', overflowY: 'auto', height: 'calc(100% - 60px)' }}>
{}
<div class="im-spotlight" style={{ background: 'linear-gradient(to right, rgba(14,16,22,0.7), rgba(8,10,15,0.85))', backdropFilter: 'blur(12px)', border: '1px solid rgba(197, 160, 89, 0.4)', borderRadius: '12px', marginBottom: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
<div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: current?.type !== 'Player' ? 'var(--danger)' : 'var(--success)', boxShadow: `0 0 15px ${current?.type !== 'Player' ? 'var(--danger)' : 'var(--success)'}` }}></div>
<div class="im-spotlight-inner" style={{ padding: '20px 24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
{}
{(() => {
const isEnemy = current?.type !== 'Player';
const rawImg = current?.img || current?.portraitData || (isEnemy ? MonsterArt.getImage(current) : null);
const safeImg = rawImg && !rawImg.startsWith('db://') ? rawImg : null;
const avatarBg = safeImg ? `url('${safeImg}')` : 'none';
return (
<div class={`im-spotlight-avatar ${isEnemy ? 'enemy' : ''}`} style={{ backgroundImage: avatarBg, width: '85px', height: '85px', borderRadius: '50%', boxShadow: '0 0 25px rgba(0,0,0,0.8)', border: `2.5px solid ${isEnemy ? 'var(--danger)' : 'var(--success)'}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontFamily: 'Cinzel', fontWeight: 900, color: '#fff', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
{!safeImg && <span>{current?.name?.substring(0,2).toUpperCase()}</span>}
</div>
);
})()}
{}
<div class="im-spotlight-info" style={{ flex: 1, minWidth: '250px' }}>
<div class="im-spotlight-label" style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
{current?.type !== 'Player' ? <><i class="fa-solid fa-skull" style={{ color: 'var(--danger)' }}></i> <span style={{ color: 'var(--danger)' }}>INIMIGO</span></> : <><i class="fa-solid fa-shield-halved" style={{ color: 'var(--success)' }}></i> <span style={{ color: 'var(--success)' }}>HERÓI</span></>}
<span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span> TURNO {initiativeIndex + 1}
</div>
<div class="im-spotlight-name" style={{ fontSize: '1.8rem', fontFamily: "'Cinzel', serif", fontWeight: 900, color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.9)', marginBottom: '14px', lineHeight: 1.1 }}>
{current?.name}
</div>
<div class="im-spotlight-meta" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
<div class="im-hp-block" style={{ minWidth: '180px', flexShrink: 0 }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px' }}>
<div class="im-hp-label" style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '1px' }}>Pontos de Vida</div>
<div class="im-hp-values" style={{ color: getHpColor(current?._hpCurrent, current?._hpMax), fontWeight: 900, fontSize: '1.2rem', textShadow: `0 0 12px ${getHpColor(current?._hpCurrent, current?._hpMax)}`, lineHeight: 1 }}>
{current?._hpCurrent} <span style={{ opacity: 0.5, fontSize: '0.8rem', fontWeight: 700 }}>/ {current?._hpMax}</span>
</div>
</div>
<div class="im-hp-bar-track" style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.7)', borderRadius: '4px', overflow: 'hidden', boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.9)' }}>
<div class="im-hp-bar-fill" style={{ width: `${getHpPct(current?._hpCurrent, current?._hpMax)}%`, height: '100%', background: getHpColor(current?._hpCurrent, current?._hpMax), transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: `0 0 10px ${getHpColor(current?._hpCurrent, current?._hpMax)}` }}></div>
</div>
</div>
<div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
<div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, background: 'rgba(255,255,255,0.02)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', width: 'fit-content' }}>
<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i class="fa-solid fa-bolt" style={{ color: 'var(--accent)' }}></i> Inic: <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{current?.init ?? 0}</strong></span>
<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i class="fa-solid fa-shield" style={{ color: '#cbd5e1' }}></i> CA: <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{current?.ac ?? 10}</strong></span>
{current?.speed && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><i class="fa-solid fa-shoe-prints" style={{ color: '#60a5fa' }}></i> Mov: <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{current.speed}ft</strong></span>}
</div>
<div class="im-economy-value" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
<button class="im-econ-btn" style={{ background: economy.action ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.02)', color: economy.action ? '#86efac' : 'var(--text-dim)', border: `1px solid ${economy.action ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '20px', padding: '6px 12px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => toggleEconomy('action')} title="Ação Principal (Clique para alternar)">
<i class={`fa-solid ${economy.action ? 'fa-play' : 'fa-check'}`}></i> {economy.action ? 'AÇÃO' : 'USADA'}
</button>
<button class="im-econ-btn" style={{ background: economy.bonus ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.02)', color: economy.bonus ? '#fde047' : 'var(--text-dim)', border: `1px solid ${economy.bonus ? 'rgba(250,204,21,0.4)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '20px', padding: '6px 12px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => toggleEconomy('bonus')} title="Ação Bônus (Clique para alternar)">
<i class={`fa-solid ${economy.bonus ? 'fa-sparkles' : 'fa-check'}`}></i> {economy.bonus ? 'BÔNUS' : 'USADO'}
</button>
<button class="im-econ-btn" style={{ background: economy.reaction ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.02)', color: economy.reaction ? '#93c5fd' : 'var(--text-dim)', border: `1px solid ${economy.reaction ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '20px', padding: '6px 12px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => toggleEconomy('reaction')} title="Reação (Clique para alternar)">
<i class={`fa-solid ${economy.reaction ? 'fa-reply' : 'fa-check'}`}></i> {economy.reaction ? 'REAÇÃO' : 'USADA'}
</button>
<button class="im-econ-btn" style={{ background: 'rgba(168,85,247,0.15)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.4)', borderRadius: '20px', padding: '6px 12px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 10px rgba(168,85,247,0.1)' }} onClick={toggleMovement} title="Movimento (Clique para subtrair 5ft)">
<i class="fa-solid fa-person-running"></i> {economy.movement}ft
</button>
</div>
</div>
</div>
{current?.conditions?.length > 0 && (
<div class="im-cond-list" style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
{current.conditions.map(c => {
const info = CONDITIONS[c] || { emoji: '⚠️', label: c };
return <button key={c} class="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', transition: 'all 0.2s' }} onClick={() => removeConditionFromActive(c)} title="Clique para remover condição">{info.emoji} {info.label} <i class="fa-solid fa-times" style={{ marginLeft: '6px', opacity: 0.5, fontSize: '0.6rem' }}></i></button>;
})}
</div>
)}
</div>
</div>
</div>
{}
<div class="im-queue-section" style={{ marginBottom: '24px' }}>
<div class="im-queue-header" style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '2px', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
<span><i class="fa-solid fa-list-ol" style={{ marginRight: '6px' }}></i> FILA DE INICIATIVA</span>
<span style={{ color: 'var(--accent)' }}>{order.length} COMBATENTES</span>
</div>
<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
{order.map((c, i) => {
const isActive = i === initiativeIndex;
const isTargeted = focusId === c.id && !isActive;
const isDead = c._hpCurrent <= 0;
const isEnemy = c.type !== 'Player';
const hpPct = getHpPct(c._hpCurrent, c._hpMax);
const hpColor = getHpColor(c._hpCurrent, c._hpMax);
const rawImg = c.img || c.portraitData || (c.type !== 'Player' ? MonsterArt.getImage(c) : null);
const safeImg = rawImg && !rawImg.startsWith('db://') ? rawImg : null;
const cardBg = isActive
? 'linear-gradient(90deg, rgba(197, 160, 89, 0.1), rgba(14, 16, 22, 0.8))'
: isTargeted
? 'linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(14, 16, 22, 0.6))'
: 'rgba(14, 16, 22, 0.6)';
const cardBorder = isActive
? '1px solid rgba(197, 160, 89, 0.6)'
: isTargeted
? '1px solid rgba(255, 255, 255, 0.3)'
: '1px solid rgba(255, 255, 255, 0.03)';
return (
<div key={c.id} class={`im-combatant ${isActive ? 'im-active' : ''}`} style={{ background: cardBg, backdropFilter: 'blur(8px)', border: cardBorder, boxShadow: isActive ? '0 0 15px rgba(197, 160, 89, 0.2)' : 'none', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', opacity: isDead ? 0.5 : 1, position: 'relative', overflow: 'hidden', minHeight: '60px' }} onClick={() => setFocusId(focusId === c.id ? null : c.id)} title={isActive ? 'Turno Atual' : 'Clique para focar ações'}>
<div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: isEnemy ? 'var(--danger)' : 'var(--success)', opacity: isActive ? 1 : 0.4 }}></div>
<div style={{ fontFamily: "'Cinzel', serif", fontSize: '1rem', fontWeight: 900, color: isActive ? 'var(--accent)' : 'var(--text-dim)', width: '24px', textAlign: 'center' }}>{i + 1}</div>
<div style={{ backgroundImage: safeImg ? `url('${safeImg}')` : 'none', width: '40px', height: '40px', borderRadius: '50%', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'rgba(0,0,0,0.5)', border: `1.5px solid ${isEnemy ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.5)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
{!safeImg && <span>{c.name.substring(0,2).toUpperCase()}</span>}
</div>
<div style={{ flex: 1, minWidth: 0 }}>
<div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.95rem', color: isActive ? '#fff' : (isEnemy ? '#fca5a5' : '#e2e8f0'), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '8px' }}>
{isDead && <i class="fa-solid fa-skull"></i>} {c.name}
{isActive && <span style={{ fontSize: '0.5rem', background: 'var(--accent)', color: '#000', padding: '2px 6px', borderRadius: '10px', fontWeight: 900, letterSpacing: '1px' }}>VEZ</span>}
</div>
<div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'flex', gap: '12px', marginTop: '4px', fontWeight: 600 }}>
<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><i class="fa-solid fa-heart" style={{ color: hpColor }}></i> {c._hpCurrent}/{c._hpMax}</span>
<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><i class="fa-solid fa-shield-halved"></i> {c.ac ?? 10}</span>
{c.concentration?.length > 0 && <span title="Concentração" style={{ color: '#60a5fa' }}><i class="fa-solid fa-brain"></i> Conc</span>}
</div>
<div style={{ width: '100%', maxWidth: '200px', height: '3px', background: 'rgba(0,0,0,0.5)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
<div style={{ width: `${hpPct}%`, height: '100%', background: hpColor, transition: 'width 0.3s ease' }}></div>
</div>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
{(c.conditions || []).length > 0 && (
<div style={{ display: 'flex', gap: '4px' }}>
{(c.conditions || []).slice(0, 4).map(cond => {
const info = CONDITIONS[cond] || { emoji: '⚠️' };
return <span key={cond} style={{ fontSize: '0.8rem' }} title={cond}>{info.emoji}</span>;
})}
</div>
)}
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
<div style={{ fontFamily: "'Cinzel', serif", fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent)', textShadow: '0 0 8px rgba(197,160,89,0.3)' }}>{c.init ?? 0}</div>
</div>
<div class="im-card-controls" style={{ display: 'flex', gap: '4px', opacity: isActive ? 1 : 0.3, transition: 'opacity 0.2s' }}>
<button class="btn btn-ghost" style={{ padding: '6px', fontSize: '0.65rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }} onClick={(e) => moveUp(c.id, e)} title="Subir Fila"><i class="fa-solid fa-chevron-up"></i></button>
<button class="btn btn-ghost" style={{ padding: '6px', fontSize: '0.65rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }} onClick={(e) => moveDown(c.id, e)} title="Descer Fila"><i class="fa-solid fa-chevron-down"></i></button>
<button class="btn btn-ghost" style={{ padding: '6px', fontSize: '0.65rem', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }} onClick={(e) => removeCombatant(c.id, e)} title="Remover"><i class="fa-solid fa-trash-can"></i></button>
</div>
</div>
</div>
);
})}
</div>
</div>
{}
{focused && (
<div style={{ background: 'linear-gradient(to top, rgba(8,10,15,0.85), rgba(14,16,22,0.7))', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(197, 160, 89, 0.4)', padding: '16px 24px', flexShrink: 0, boxShadow: '0 -10px 20px rgba(0,0,0,0.5)', borderRadius: '12px 12px 0 0', position: 'relative', zIndex: 10 }}>
<div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
<i class="fa-solid fa-crosshairs"></i>
{!focusId || focusId === current?.id ? 'AÇÕES DO COMBATENTE ATIVO' : `FOCO MANUL: ${focused.name}`}
</span>
{(focusId && focusId !== current?.id) && (
<button class="btn btn-ghost" style={{ fontSize: '0.6rem', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setFocusId(null)}>✕ Limpar foco</button>
)}
</div>
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', justifyContent: 'flex-start', marginBottom: '8px' }}>
<div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
<input type="number" class="form-input" placeholder="Valor" min="0" style={{ width: '90px', fontSize: '0.9rem', padding: '8px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff' }} value={dmgInput} onInput={e => setDmgInput(e.target.value)} />
<button class="btn" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.75rem', padding: '6px 14px', borderRadius: '6px', fontWeight: 700, transition: 'all 0.2s' }} onClick={applyDamage}><i class="fa-solid fa-heart-crack" style={{ marginRight: '4px' }}></i> Dano</button>
<button class="btn" style={{ background: 'rgba(34,197,94,0.15)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)', fontSize: '0.75rem', padding: '6px 14px', borderRadius: '6px', fontWeight: 700, transition: 'all 0.2s' }} onClick={applyHeal}><i class="fa-solid fa-heart-pulse" style={{ marginRight: '4px' }}></i> Cura</button>
<button class="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)' }} onClick={rollDice} title="Rolar 1d6"><i class="fa-solid fa-dice"></i></button>
</div>
<div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', flex: 1, minWidth: '280px' }}>
<select class="form-select" style={{ fontSize: '0.85rem', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', flex: 1 }} value={selectedCond} onChange={e => setSelectedCond(e.target.value)}>
{Object.entries(CONDITIONS).map(([k, v]) => (
<option key={k} value={k}>{v.emoji} {v.label}</option>
))}
</select>
<button class="btn" style={{ background: 'rgba(168,85,247,0.15)', color: '#d8b4fe', border: '1px solid rgba(168,85,247,0.3)', fontSize: '0.75rem', padding: '6px 14px', borderRadius: '6px', fontWeight: 700 }} onClick={applyCondition}><i class="fa-solid fa-plus" style={{ marginRight: '4px' }}></i> Status</button>
<button class="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 12px', color: 'var(--danger)', borderRadius: '6px', background: 'rgba(239,68,68,0.05)' }} onClick={clearConditions} title="Limpar todos os status"><i class="fa-solid fa-broom"></i></button>
</div>
</div>
</div>
)}
{}
<div class="im-quick-add" style={{ marginTop: '20px' }}>
<div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
<i class="fa-solid fa-plus" style={{ marginRight: '4px' }}></i> ADICIONAR COMBATENTE
</div>
<div class="im-quick-add-row" style={{ display: 'flex', gap: '8px' }}>
<input type="text" class="form-input" style={{ fontSize: '0.75rem', padding: '6px 10px', flex: 1 }} placeholder="Nome..." value={quickAdd.name} onInput={e => setQuickAdd(prev => ({ ...prev, name: e.target.value }))} />
<input type="number" class="form-input" style={{ fontSize: '0.75rem', padding: '6px 8px', width: '60px' }} placeholder="Inic" min="-5" max="30" value={quickAdd.init} onInput={e => setQuickAdd(prev => ({ ...prev, init: e.target.value }))} />
<input type="number" class="form-input" style={{ fontSize: '0.75rem', padding: '6px 8px', width: '60px' }} placeholder="HP" min="1" max="999" value={quickAdd.hp} onInput={e => setQuickAdd(prev => ({ ...prev, hp: e.target.value }))} />
<div style={{ display: 'flex', gap: '4px' }}>
<button class="btn btn-ghost btn-sm" style={{ fontSize: '0.6rem', padding: '5px 8px', background: 'rgba(96,165,250,0.08)', borderColor: 'rgba(96,165,250,0.2)', color: '#93c5fd' }} onClick={() => quickAddCombatant('Player')} title="Adicionar como Herói"><i class="fa-solid fa-shield"></i></button>
<button class="btn btn-ghost btn-sm" style={{ fontSize: '0.6rem', padding: '5px 8px', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', color: '#fca5a5' }} onClick={() => quickAddCombatant('Monster')} title="Adicionar como Inimigo"><i class="fa-solid fa-skull"></i></button>
<button class="btn btn-ghost btn-sm" style={{ fontSize: '0.6rem', padding: '5px 8px' }} onClick={quickAddRollInit} title="Rolar iniciativa automática"><i class="fa-solid fa-dice-d20"></i></button>
</div>
</div>
</div>
</div>
)}
{showTurnAnnounce && (
<div class="im-turn-announce" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, pointerEvents: 'none', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', animation: 'fadeIn 0.3s' }}>
<div class="im-turn-announce-inner" style={{ background: 'linear-gradient(to right, transparent, rgba(197, 160, 89, 0.2), transparent)', padding: '20px 80px', color: '#fff', fontFamily: 'Cinzel', fontSize: '2.5rem', fontWeight: 900, textShadow: '0 0 20px rgba(197,160,89,0.8), 0 5px 15px rgba(0,0,0,0.8)', letterSpacing: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', animation: 'scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
<i class="fa-solid fa-swords" style={{ color: 'var(--accent)' }}></i>
{announceText}
</div>
</div>
)}
</div>
);
}