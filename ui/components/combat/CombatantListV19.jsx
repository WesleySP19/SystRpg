import { useCombat } from '../../hooks/useCombat.js';
import { TOME } from '../../../core/Registry.js';

export function CombatantListV19() {
    const { combatants, turnIndex, removeCombatant, updateCombatantHP } = useCombat();
    const store = TOME.store;

    if (!combatants || combatants.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.4, textAlign: 'center' }}>
                <i className="fa-solid fa-ghost fa-4x" style={{ marginBottom: '20px', color: 'var(--accent)' }}></i>
                <h3 style={{ fontFamily: "'Cinzel'", margin: 0, fontSize: '1.5rem' }}>A Arena está vazia</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Adicione heróis e monstros para iniciar o combate.</p>
            </div>
        );
    }

    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.4';
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (isNaN(dragIndex) || dragIndex === dropIndex) return;

        store.update(s => {
            const arr = [...s.initiativeOrder];
            const item = arr.splice(dragIndex, 1)[0];
            arr.splice(dropIndex, 0, item);
            s.initiativeOrder = arr;
            if (s.initiativeIndex === dragIndex) {
                s.initiativeIndex = dropIndex;
            } else if (s.initiativeIndex > dragIndex && s.initiativeIndex <= dropIndex) {
                s.initiativeIndex--;
            } else if (s.initiativeIndex < dragIndex && s.initiativeIndex >= dropIndex) {
                s.initiativeIndex++;
            }
        });
    };

    const handleHpChange = (e, id, maxHp) => {
        const val = parseInt(e.target.value);
        if (isNaN(val)) return;
        
        store.update(s => {
            const c = s.combatants.find(x => x.id === id);
            if (c) {
                const oldHp = typeof c.hp === 'number' ? c.hp : (c.hp?.current || 0);
                
                if (c.hp !== undefined && typeof c.hp === 'number') {
                    c.hp = Math.max(0, Math.min(val, maxHp || val));
                } else if (c.hp && c.hp.current !== undefined) {
                    c.hp.current = Math.max(0, Math.min(val, c.hp.max || val));
                }

                const newHp = typeof c.hp === 'number' ? c.hp : (c.hp?.current || 0);

                if (oldHp > 0 && newHp === 0) {
                    if (c.type !== 'hero') {
                        if (window.TOME?.events) {
                            window.TOME.events.emit('ENTITY_SLAIN', { entity: c, name: c.name });
                        }
                    } else {
                        c.deathSaves = { successes: 0, failures: 0 };
                        c.isDead = false;
                    }
                }
            }
        });
    };

    const handleDeathSave = (id, type, value) => {
        store.update(s => {
            const c = s.combatants.find(x => x.id === id);
            if (c && c.deathSaves) {
                c.deathSaves[type] = value;
                if (c.deathSaves.failures >= 3 && !c.isDead) {
                    c.isDead = true;
                    if (window.TOME?.events) {
                        window.TOME.events.emit('HERO_FALLEN', { player: c, name: c.name });
                    }
                }
            }
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {combatants.map((c, idx) => {
                const isTurn = idx === turnIndex;
                const isHero = c.isHero || c.type === 'hero';
                const hpCurrent = typeof c.hp === 'number' ? c.hp : (c.hp?.current || 0);
                const hpMax = c.hpMax || c.hp?.max || hpCurrent;
                const hpPercent = Math.max(0, Math.min(100, (hpCurrent / hpMax) * 100));
                
                let hpColor = '#10b981';
                if (hpPercent <= 50) hpColor = '#f59e0b';
                if (hpPercent <= 20) hpColor = '#ef4444';

                return (
                    <div 
                        key={c.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        style={{
                            position: 'relative',
                            cursor: 'grab',
                            background: isTurn ? 'rgba(212,175,55,0.1)' : 'rgba(15,23,42,0.4)',
                            border: `1px solid ${isTurn ? 'var(--accent)' : 'rgba(255,255,255,0.05)'}`,
                            borderLeft: `5px solid ${isHero ? '#3b82f6' : '#ef4444'}`,
                            borderRadius: '16px',
                            padding: '16px 24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            boxShadow: isTurn ? '0 0 25px rgba(212,175,55,0.2)' : '0 4px 15px rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(10px)',
                            transform: isTurn ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: '50px 60px 1fr 180px 40px', gap: '15px', alignItems: 'center' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 0', textAlign: 'center', fontWeight: 900, fontFamily: "'Cinzel'", fontSize: '1.3rem', color: 'var(--accent)', border: '1px solid rgba(212,175,55,0.2)' }}>
                                {c.initiative || 0}
                            </div>

                            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: `2px solid ${isHero ? '#3b82f6' : '#ef4444'}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                                {c.portraitData 
                                    ? <img src={c.portraitData} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: c.isDead || (hpCurrent===0 && !isHero) ? 'grayscale(100%)' : 'none' }} />
                                    : <i className={`fa-solid ${isHero ? 'fa-user' : 'fa-dragon'}`} style={{ filter: c.isDead || (hpCurrent===0 && !isHero) ? 'grayscale(100%)' : 'none' }}></i>
                                }
                                {(c.isDead || (hpCurrent===0 && !isHero)) && (
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="fa-solid fa-skull" style={{ color: '#fff', textShadow: '0 0 8px #000', fontSize: '1.2rem' }}></i>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div style={{ fontWeight: 900, fontSize: '1.15rem', color: c.isDead || (hpCurrent===0 && !isHero) ? '#64748b' : '#f1f5f9', fontFamily: "'Cinzel'", display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {c.name}
                                    {isTurn && <span className="badge" style={{ background: 'var(--accent)', color: '#000', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '12px', boxShadow: '0 0 8px rgba(212,175,55,0.5)' }}>SEU TURNO</span>}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
                                    AC {c.ac || 10} • {isHero ? 'Herói' : 'Monstro'}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                                    <span style={{ color: '#94a3b8' }}>HP</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <input type="number" 
                                               value={hpCurrent} 
                                               onChange={(e) => handleHpChange(e, c.id, hpMax)}
                                               style={{ width: '55px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontWeight: 900, textAlign: 'center', padding: '5px', transition: 'border-color 0.2s' }} />
                                        <span style={{ color: '#94a3b8' }}>/ {hpMax}</span>
                                    </div>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}>
                                    <div style={{ height: '100%', width: `${hpPercent}%`, background: hpColor, boxShadow: `0 0 8px ${hpColor}`, transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s ease' }}></div>
                                </div>
                            </div>

                            <button className="btn btn-ghost btn-sm" onClick={() => removeCombatant(c.id)} style={{ color: '#64748b', padding: '10px', borderRadius: '50%', transition: 'all 0.2s' }}>
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>

                        {isHero && hpCurrent === 0 && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', padding: '14px 24px', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeIn 0.4s ease' }}>
                                <span style={{ fontFamily: "'Cinzel'", color: '#f87171', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-skull"></i> 
                                    {c.isDead ? 'HERÓI MORTO' : 'TESTES CONTRA A MORTE'}
                                </span>
                                
                                {!c.isDead && (
                                    <div style={{ display: 'flex', gap: '40px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Sucessos</span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {[1, 2, 3].map(i => (
                                                    <input key={i} type="checkbox" checked={c.deathSaves?.successes >= i} onChange={(e) => handleDeathSave(c.id, 'successes', e.target.checked ? i : i-1)} style={{ accentColor: '#10b981', width: '20px', height: '20px', cursor: 'pointer' }} />
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Falhas</span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {[1, 2, 3].map(i => (
                                                    <input key={i} type="checkbox" checked={c.deathSaves?.failures >= i} onChange={(e) => handleDeathSave(c.id, 'failures', e.target.checked ? i : i-1)} style={{ accentColor: '#ef4444', width: '20px', height: '20px', cursor: 'pointer' }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
