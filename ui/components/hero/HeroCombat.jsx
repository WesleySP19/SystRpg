import { html } from 'htm/preact';
import { useState } from 'preact/hooks';
import spellsData from '../../../data/spells-5e.js';

export function HeroCombat({ hero }) {
    if (!hero) return null;

    // Local state for tabs
    const [activeTab, setActiveTab] = useState('weapons'); // 'weapons' or 'spells'

    const handleDragStart = (e, itemType, itemData) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: itemType,
            data: itemData,
            sourceHeroId: hero.id,
            sourceHeroName: hero.name
        }));
        e.dataTransfer.effectAllowed = 'copy';
        // Efeito visual sutil ao arrastar
        e.currentTarget.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        e.currentTarget.style.opacity = '1';
    };

    const deathSuccess = hero.deathSaves?.success || [false, false, false];
    const deathFailure = hero.deathSaves?.failure || [false, false, false];
    const lvl = parseInt(hero.level) || 1;
    const hitDiceCurrent = hero.hitDiceCurrent !== undefined ? hero.hitDiceCurrent : lvl;
    const hitDie = 'd8'; // placeholder until logic is ported

    const stats = hero.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 };
    const getMod = (v) => Math.floor(((parseInt(v) || 10) - 10) / 2);
    const profBonus = Math.floor((lvl - 1) / 4) + 2;

    const spellStat = hero.class?.toLowerCase().includes('mago') ? 'int' : 
                      (hero.class?.toLowerCase().includes('druida') || hero.class?.toLowerCase().includes('clérigo') || hero.class?.toLowerCase().includes('patrulheiro')) ? 'wis' : 'cha';
    const spellDC = 8 + profBonus + getMod(stats[spellStat]);
    const spellAttack = profBonus + getMod(stats[spellStat]);

    const heroSpells = [];
    if (hero.spells) {
        Object.entries(hero.spells).forEach(([lvlKey, spellListStr]) => {
            if (!spellListStr) return;
            const slvl = parseInt(lvlKey.replace('lvl', '')) || 0;
            const lines = spellListStr.split('\\n').map(l => l.trim()).filter(Boolean);
            lines.forEach(name => {
                heroSpells.push({ name: name, level: slvl });
            });
        });
    }

    return html`
        <div style="display:flex; flex-direction:column; gap:25px;">
            <!-- Vital Combat Controls -->
            <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:20px;">
                <!-- Death Saves -->
                <div class="card glass-accent" style="padding:15px 20px; background:rgba(0,0,0,0.3); border-top:3px solid var(--danger);">
                    <div style="font-size:0.65rem; color:var(--danger); font-weight:900; text-transform:uppercase; margin-bottom:10px;">💀 TESTES DE MORTE</div>
                    <div style="display:flex; flex-direction:column; gap:6px; font-size:0.75rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span>Sucessos</span>
                            <div style="display:flex; gap:6px;">
                                ${deathSuccess.map((checked) => html`<i class="fa-${checked ? 'solid' : 'regular'} fa-heart" style="color:${checked ? 'var(--success)' : 'rgba(255,255,255,0.2)'}; cursor:pointer;"></i>`)}
                            </div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span>Falhas</span>
                            <div style="display:flex; gap:6px;">
                                ${deathFailure.map((checked) => html`<i class="fa-${checked ? 'solid' : 'regular'} fa-circle-xmark" style="color:${checked ? 'var(--danger)' : 'rgba(255,255,255,0.2)'}; cursor:pointer;"></i>`)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Hit Dice -->
                <div class="card glass-accent" style="padding:15px 20px; background:rgba(0,0,0,0.3); border-top:3px solid var(--info); display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <div style="font-size:0.65rem; color:var(--info); font-weight:900; text-transform:uppercase; margin-bottom:5px;">🎲 DADO DE VIDA</div>
                    <div style="font-size:1.6rem; font-weight:900; font-family:'Cinzel'; display:flex; align-items:center; gap:8px;">
                        ${hitDiceCurrent} / ${lvl} <span style="font-size:0.8rem; color:var(--accent);">${hitDie}</span>
                    </div>
                </div>
            </div>

            <!-- Attacks & Spells Section -->
            <div class="card glass-accent p-5" style="background:rgba(0,0,0,0.25); border:1px solid rgba(197,160,89,0.2);">
                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:15px; padding-bottom:6px; color:var(--accent); font-family:'Cinzel'; font-size:0.85rem; display:flex; justify-content:space-between; align-items:center;">
                    <span><i class="fa-solid fa-wand-magic-sparkles" style="margin-right:8px;"></i> ATAQUES & MAGIAS</span>
                    <div style="display:flex; gap:10px; font-size:0.7rem; font-family:sans-serif; opacity:0.8;">
                        <span>CD: <strong>${spellDC}</strong></span>
                        <span>•</span>
                        <span>Ataque Mágico: <strong>+${spellAttack}</strong></span>
                    </div>
                </div>

                <!-- Tabs -->
                <div style="display:flex; gap:10px; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
                    <button class="btn btn-ghost btn-sm" 
                            style="font-size:0.7rem; padding:6px 12px; border-radius:6px; font-family:'Cinzel'; font-weight:700; 
                                   border:1px solid ${activeTab === 'weapons' ? 'rgba(197,160,89,0.3)' : 'transparent'}; 
                                   background:${activeTab === 'weapons' ? 'rgba(197,160,89,0.1)' : 'transparent'};
                                   color:${activeTab === 'weapons' ? 'var(--accent)' : 'var(--text-dim)'};" 
                            onClick=${() => setActiveTab('weapons')}>
                        ⚔️ Armas
                    </button>
                    <button class="btn btn-ghost btn-sm" 
                            style="font-size:0.7rem; padding:6px 12px; border-radius:6px; font-family:'Cinzel'; font-weight:700; 
                                   border:1px solid ${activeTab === 'spells' ? 'rgba(197,160,89,0.3)' : 'transparent'}; 
                                   background:${activeTab === 'spells' ? 'rgba(197,160,89,0.1)' : 'transparent'};
                                   color:${activeTab === 'spells' ? 'var(--accent)' : 'var(--text-dim)'};" 
                            onClick=${() => setActiveTab('spells')}>
                        🔮 Magias (${heroSpells.length})
                    </button>
                </div>

                <!-- Content -->
                <div style="display:${activeTab === 'weapons' ? 'flex' : 'none'}; flex-direction:column; gap:10px;">
                    ${hero.attacks && hero.attacks.length > 0 ? hero.attacks.map(a => html`
                        <div class="glass interactive-roll-row" style="padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.2); display:flex; justify-content:space-between; align-items:center; cursor:grab;"
                             draggable="true" 
                             onDragStart=${e => handleDragStart(e, 'attack', a)} 
                             onDragEnd=${handleDragEnd}
                             onMouseOver=${e => { e.currentTarget.style.background='rgba(197,160,89,0.08)'; e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.transform='scale(1.02)'; }}
                             onMouseOut=${e => { e.currentTarget.style.background='rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.05)'; e.currentTarget.style.transform='none'; }}>
                            <div>
                                <div style="font-weight:900; font-size:0.85rem; color:#fff;">${a.name}</div>
                                <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase;">Alcance: ${a.range || '5 ft'}</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-weight:900; color:var(--accent); font-size:0.9rem;">${a.bonus >= 0 ? '+' : ''}${a.bonus}</div>
                                <div style="font-size:0.65rem; font-weight:800; color:var(--danger);"><i class="fa-solid fa-droplet text-[0.55rem]"></i> ${a.damage || '1d6'}</div>
                            </div>
                        </div>
                    `) : html`<div style="font-size:0.75rem; color:var(--text-dim); font-style:italic;">Nenhum ataque configurado.</div>`}
                </div>

                <div style="display:${activeTab === 'spells' ? 'flex' : 'none'}; flex-direction:column; gap:10px;">
                    ${heroSpells.length > 0 ? heroSpells.map(s => html`
                        <div class="glass interactive-roll-row" style="padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.2); display:flex; justify-content:space-between; align-items:center; cursor:grab;"
                             draggable="true"
                             onDragStart=${e => handleDragStart(e, 'spell', s)}
                             onDragEnd=${handleDragEnd}
                             onMouseOver=${e => { e.currentTarget.style.background='rgba(156,39,176,0.1)'; e.currentTarget.style.borderColor='#9c27b0'; e.currentTarget.style.transform='scale(1.02)'; }}
                             onMouseOut=${e => { e.currentTarget.style.background='rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.05)'; e.currentTarget.style.transform='none'; }}>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <div style="width:24px; height:24px; border-radius:50%; background:rgba(156,39,176,0.2); border:1px solid #9c27b0; display:flex; align-items:center; justify-content:center; font-size:0.6rem; color:#e1bee7; font-weight:900;">
                                    ${s.level === 0 ? 'T' : s.level}
                                </div>
                                <div style="font-weight:900; font-size:0.8rem; color:#fff;">${s.name}</div>
                            </div>
                        </div>
                    `) : html`<div style="font-size:0.75rem; color:var(--text-dim); font-style:italic;">Nenhuma magia preparada.</div>`}
                </div>
            </div>
        </div>
    `;
}
