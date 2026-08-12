import { html } from 'htm/preact';

export function CombatantListV19({ store, combatants, turnIndex }) {

    if (!combatants || combatants.length === 0) {
        return html`
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; opacity:0.4; text-align:center;">
                <i class="fa-solid fa-ghost fa-4x" style="margin-bottom:20px; color:var(--accent);"></i>
                <h3 style="font-family:'Cinzel'; margin:0; font-size:1.5rem;">A Arena está vazia</h3>
                <p style="font-size:0.9rem; margin-top:10px;">Adicione heróis e monstros para iniciar o combate.</p>
            </div>
        `;
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
            const arr = [...s.combatants];
            const item = arr.splice(dragIndex, 1)[0];
            arr.splice(dropIndex, 0, item);
            s.combatants = arr;
            // Adjust turnIndex
            if (s.turnIndex === dragIndex) {
                s.turnIndex = dropIndex;
            } else if (s.turnIndex > dragIndex && s.turnIndex <= dropIndex) {
                s.turnIndex--;
            } else if (s.turnIndex < dragIndex && s.turnIndex >= dropIndex) {
                s.turnIndex++;
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

    const handleRemove = (id) => {
        store.update(s => {
            s.combatants = s.combatants.filter(x => x.id !== id);
            if (s.turnIndex >= s.combatants.length) {
                s.turnIndex = Math.max(0, s.combatants.length - 1);
            }
        });
    };

    return html`
        <div style="display:flex; flex-direction:column; gap:16px;">
            ${combatants.map((c, idx) => {
                const isTurn = idx === turnIndex;
                const isHero = c.type === 'hero';
                const hpCurrent = typeof c.hp === 'number' ? c.hp : (c.hp?.current || 0);
                const hpMax = c.hpMax || c.hp?.max || hpCurrent;
                const hpPercent = Math.max(0, Math.min(100, (hpCurrent / hpMax) * 100));
                
                let hpColor = '#10b981'; // Emerald 500
                if (hpPercent <= 50) hpColor = '#f59e0b'; // Amber 500
                if (hpPercent <= 20) hpColor = '#ef4444'; // Red 500

                return html`
                    <div 
                        draggable="true"
                        onDragStart=${(e) => handleDragStart(e, idx)}
                        onDragEnd=${handleDragEnd}
                        onDragOver=${handleDragOver}
                        onDrop=${(e) => handleDrop(e, idx)}
                        style="
                        position:relative;
                        cursor: grab;
                        background:${isTurn ? 'rgba(212,175,55,0.1)' : 'rgba(15,23,42,0.4)'};
                        border:1px solid ${isTurn ? 'var(--accent)' : 'rgba(255,255,255,0.05)'};
                        border-left:5px solid ${isHero ? '#3b82f6' : '#ef4444'};
                        border-radius:16px;
                        padding:16px 24px;
                        display:flex;
                        flex-direction:column;
                        gap:16px;
                        box-shadow:${isTurn ? '0 0 25px rgba(212,175,55,0.2)' : '0 4px 15px rgba(0,0,0,0.3)'};
                        backdrop-filter: blur(10px);
                        transform:${isTurn ? 'scale(1.02)' : 'scale(1)'};
                        transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    ">
                        
                        <div style="display:grid; grid-template-columns: 50px 60px 1fr 180px 40px; gap:15px; align-items:center;">
                            <!-- Initiative Badge -->
                            <div style="background:rgba(255,255,255,0.05); border-radius:10px; padding:12px 0; text-align:center; font-weight:900; font-family:'Cinzel'; font-size:1.3rem; color:var(--accent); border: 1px solid rgba(212,175,55,0.2);">
                                ${c.initiative || 0}
                            </div>

                            <!-- Avatar -->
                            <div style="width:54px; height:54px; border-radius:50%; background:rgba(0,0,0,0.5); border:2px solid ${isHero ? '#3b82f6' : '#ef4444'}; overflow:hidden; display:flex; align-items:center; justify-content:center; position:relative; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
                                ${c.portraitData 
                                    ? html`<img src=${c.portraitData} style="width:100%; height:100%; object-fit:cover; filter:${c.isDead || (hpCurrent===0 && !isHero) ? 'grayscale(100%)' : 'none'};" />`
                                    : html`<i class="fa-solid ${isHero ? 'fa-user' : 'fa-dragon'}" style="filter:${c.isDead || (hpCurrent===0 && !isHero) ? 'grayscale(100%)' : 'none'};"></i>`
                                }
                                ${(c.isDead || (hpCurrent===0 && !isHero)) ? html`<div style="position:absolute; inset:0; background:rgba(239,68,68,0.4); display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-skull" style="color:#fff; text-shadow:0 0 8px #000; font-size:1.2rem;"></i></div>` : null}
                            </div>

                            <!-- Info -->
                            <div>
                                <div style="font-weight:900; font-size:1.15rem; color:${c.isDead || (hpCurrent===0 && !isHero) ? '#64748b' : '#f1f5f9'}; font-family:'Cinzel'; display:flex; align-items:center; gap:8px;">
                                    ${c.name}
                                    ${isTurn ? html`<span class="badge" style="background:var(--accent); color:#000; font-size:0.65rem; padding:3px 8px; border-radius:12px; box-shadow: 0 0 8px rgba(212,175,55,0.5);">SEU TURNO</span>` : ''}
                                </div>
                                <div style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-top:4px;">
                                    AC ${c.ac || 10} • ${isHero ? 'Herói' : 'Monstro'}
                                </div>
                            </div>

                            <!-- HP Control -->
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; font-weight:800;">
                                    <span style="color:#94a3b8;">HP</span>
                                    <div style="display:flex; align-items:center; gap:6px;">
                                        <input type="number" 
                                               value=${hpCurrent} 
                                               onChange=${(e) => handleHpChange(e, c.id, hpMax)}
                                               style="width:55px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#fff; font-weight:900; text-align:center; padding:5px; transition: border-color 0.2s;" />
                                        <span style="color:#94a3b8;">/ ${hpMax}</span>
                                    </div>
                                </div>
                                <!-- HP Bar -->
                                <div style="height:8px; background:rgba(0,0,0,0.6); border-radius:4px; overflow:hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);">
                                    <div style="height:100%; width:${hpPercent}%; background:${hpColor}; box-shadow: 0 0 8px ${hpColor}; transition:width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s ease;"></div>
                                </div>
                            </div>

                            <!-- Delete -->
                            <button class="btn btn-ghost btn-sm" onClick=${() => handleRemove(c.id)} style="color:#64748b; padding:10px; border-radius:50%; transition: all 0.2s;" onMouseOver=${e => { e.currentTarget.style.color='#ef4444'; e.currentTarget.style.background='rgba(239,68,68,0.1)'; }} onMouseOut=${e => { e.currentTarget.style.color='#64748b'; e.currentTarget.style.background='transparent'; }}>
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>

                        <!-- DEATH SAVES (Só aparece para Heróis com 0 HP) -->
                        ${isHero && hpCurrent === 0 ? html`
                            <div style="background: rgba(239, 68, 68, 0.1); border-radius: 12px; padding: 14px 24px; border: 1px solid rgba(239, 68, 68, 0.3); display: flex; justify-content: space-between; align-items: center; animation: fadeIn 0.4s ease;">
                                <span style="font-family: 'Cinzel'; color: #f87171; font-weight: bold; font-size: 1.1rem; display:flex; align-items:center; gap:8px;">
                                    <i class="fa-solid fa-skull"></i> 
                                    ${c.isDead ? 'HERÓI MORTO' : 'TESTES CONTRA A MORTE'}
                                </span>
                                
                                ${!c.isDead ? html`
                                    <div style="display: flex; gap: 40px;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <span style="color: #34d399; font-size: 0.85rem; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">Sucessos</span>
                                            <div style="display:flex; gap:8px;">
                                                ${[1, 2, 3].map(i => html`<input type="checkbox" checked=${c.deathSaves?.successes >= i} onChange=${(e) => handleDeathSave(c.id, 'successes', e.target.checked ? i : i-1)} style="accent-color: #10b981; width:20px; height:20px; cursor:pointer;" />`)}
                                            </div>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <span style="color: #f87171; font-size: 0.85rem; font-weight:bold; text-transform:uppercase; letter-spacing:1px;">Falhas</span>
                                            <div style="display:flex; gap:8px;">
                                                ${[1, 2, 3].map(i => html`<input type="checkbox" checked=${c.deathSaves?.failures >= i} onChange=${(e) => handleDeathSave(c.id, 'failures', e.target.checked ? i : i-1)} style="accent-color: #ef4444; width:20px; height:20px; cursor:pointer;" />`)}
                                            </div>
                                        </div>
                                    </div>
                                ` : html`
                                    <span style="color: #fca5a5; font-size:0.95rem; font-style:italic;">A alma deste aventureiro deixou o plano material...</span>
                                `}
                            </div>
                        ` : null}

                    </div>
                `;
            })}
        </div>
    `;
}
