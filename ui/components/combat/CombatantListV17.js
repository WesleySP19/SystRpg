import { html } from 'htm/preact';

export function CombatantListV17({ store, combatants, turnIndex }) {

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
                        // Monstro morre direto ao chegar em 0 HP
                        if (window.TOME?.events) {
                            window.TOME.events.emit('ENTITY_SLAIN', { entity: c, name: c.name });
                        }
                    } else {
                        // Herói cai, inicia Death Saves
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
        <div style="display:flex; flex-direction:column; gap:12px;">
            ${combatants.map((c, idx) => {
                const isTurn = idx === turnIndex;
                const isHero = c.type === 'hero';
                const hpCurrent = typeof c.hp === 'number' ? c.hp : (c.hp?.current || 0);
                const hpMax = c.hpMax || c.hp?.max || hpCurrent;
                const hpPercent = Math.max(0, Math.min(100, (hpCurrent / hpMax) * 100));
                
                let hpColor = '#22c55e';
                if (hpPercent <= 50) hpColor = '#eab308';
                if (hpPercent <= 20) hpColor = '#ef4444';

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
                        background:${isTurn ? 'rgba(197,160,89,0.1)' : 'rgba(0,0,0,0.3)'};
                        border:1px solid ${isTurn ? 'var(--accent)' : 'rgba(255,255,255,0.05)'};
                        border-left:4px solid ${isHero ? 'var(--info)' : 'var(--danger)'};
                        border-radius:12px;
                        padding:15px 20px;
                        display:flex;
                        flex-direction:column;
                        gap:15px;
                        box-shadow:${isTurn ? '0 0 20px rgba(197,160,89,0.2)' : 'none'};
                        transform:${isTurn ? 'scale(1.02)' : 'scale(1)'};
                        transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    ">
                        
                        <div style="display:grid; grid-template-columns: 50px 60px 1fr 180px 40px; gap:15px; align-items:center;">
                            <!-- Initiative Badge -->
                            <div style="background:rgba(255,255,255,0.05); border-radius:8px; padding:10px 0; text-align:center; font-weight:900; font-family:'Cinzel'; font-size:1.2rem; color:var(--accent);">
                                ${c.initiative || 0}
                            </div>

                            <!-- Avatar -->
                            <div style="width:50px; height:50px; border-radius:50%; background:rgba(0,0,0,0.5); border:2px solid ${isHero ? 'var(--info)' : 'var(--danger)'}; overflow:hidden; display:flex; align-items:center; justify-content:center; position:relative;">
                                ${c.portraitData 
                                    ? html`<img src=${c.portraitData} style="width:100%; height:100%; object-fit:cover; filter:${c.isDead || (hpCurrent===0 && !isHero) ? 'grayscale(100%)' : 'none'};" />`
                                    : html`<i class="fa-solid ${isHero ? 'fa-user' : 'fa-dragon'}" style="filter:${c.isDead || (hpCurrent===0 && !isHero) ? 'grayscale(100%)' : 'none'};"></i>`
                                }
                                ${(c.isDead || (hpCurrent===0 && !isHero)) ? html`<div style="position:absolute; inset:0; background:rgba(239,68,68,0.3); display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-skull" style="color:#fff; text-shadow:0 0 5px #000;"></i></div>` : null}
                            </div>

                            <!-- Info -->
                            <div>
                                <div style="font-weight:900; font-size:1.1rem; color:${c.isDead || (hpCurrent===0 && !isHero) ? '#6b7280' : '#fff'}; font-family:'Cinzel'; display:flex; align-items:center; gap:8px;">
                                    ${c.name}
                                    ${isTurn ? html`<span class="badge" style="background:var(--accent); color:#000; font-size:0.6rem; padding:2px 6px;">SEU TURNO</span>` : ''}
                                </div>
                                <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; margin-top:4px;">
                                    AC ${c.ac || 10} • ${isHero ? 'Herói' : 'Monstro'}
                                </div>
                            </div>

                            <!-- HP Control -->
                            <div style="display:flex; flex-direction:column; gap:6px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; font-weight:800;">
                                    <span style="color:var(--text-dim);">HP</span>
                                    <div style="display:flex; align-items:center; gap:4px;">
                                        <input type="number" 
                                               value=${hpCurrent} 
                                               onChange=${(e) => handleHpChange(e, c.id, hpMax)}
                                               style="width:50px; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); border-radius:4px; color:#fff; font-weight:900; text-align:center; padding:4px;" />
                                        <span style="color:var(--text-dim);">/ ${hpMax}</span>
                                    </div>
                                </div>
                                <!-- HP Bar -->
                                <div style="height:6px; background:rgba(0,0,0,0.5); border-radius:3px; overflow:hidden;">
                                    <div style="height:100%; width:${hpPercent}%; background:${hpColor}; transition:width 0.3s ease-out, background 0.3s ease;"></div>
                                </div>
                            </div>

                            <!-- Delete -->
                            <button class="btn btn-ghost btn-sm" onClick=${() => handleRemove(c.id)} style="color:rgba(255,255,255,0.2); padding:8px; border-radius:50%;" onMouseOver=${e => e.currentTarget.style.color='var(--danger)'} onMouseOut=${e => e.currentTarget.style.color='rgba(255,255,255,0.2)'}>
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>

                        <!-- DEATH SAVES (Só aparece para Heróis com 0 HP) -->
                        ${isHero && hpCurrent === 0 ? html`
                            <div style="background: rgba(239, 68, 68, 0.1); border-radius: 8px; padding: 12px 20px; border: 1px solid rgba(239, 68, 68, 0.3); display: flex; justify-content: space-between; align-items: center; animation: fadeIn 0.4s ease;">
                                <span style="font-family: 'Cinzel'; color: var(--danger); font-weight: bold; font-size: 1.1rem; display:flex; align-items:center; gap:8px;">
                                    <i class="fa-solid fa-skull"></i> 
                                    ${c.isDead ? 'HERÓI MORTO' : 'TESTES CONTRA A MORTE'}
                                </span>
                                
                                ${!c.isDead ? html`
                                    <div style="display: flex; gap: 30px;">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <span style="color: var(--success); font-size: 0.85rem; font-weight:bold; text-transform:uppercase;">Sucessos</span>
                                            <div style="display:flex; gap:6px;">
                                                ${[1, 2, 3].map(i => html`<input type="checkbox" checked=${c.deathSaves?.successes >= i} onChange=${(e) => handleDeathSave(c.id, 'successes', e.target.checked ? i : i-1)} style="accent-color: var(--success); width:18px; height:18px;" />`)}
                                            </div>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <span style="color: var(--danger); font-size: 0.85rem; font-weight:bold; text-transform:uppercase;">Falhas</span>
                                            <div style="display:flex; gap:6px;">
                                                ${[1, 2, 3].map(i => html`<input type="checkbox" checked=${c.deathSaves?.failures >= i} onChange=${(e) => handleDeathSave(c.id, 'failures', e.target.checked ? i : i-1)} style="accent-color: var(--danger); width:18px; height:18px;" />`)}
                                            </div>
                                        </div>
                                    </div>
                                ` : html`
                                    <span style="color: var(--danger); font-size:0.9rem; font-style:italic;">A alma deste aventureiro deixou o plano material...</span>
                                `}
                            </div>
                        ` : null}

                    </div>
                `;
            })}
        </div>
    `;
}
