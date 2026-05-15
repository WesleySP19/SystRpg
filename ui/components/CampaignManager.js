import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';

/**
 * CAMPAIGN COMMAND CENTER v6.0 — "The Official Sheet"
 * Integrated D&D 5e Official Layout for PDF/Print Export.
 */
export class CampaignManager extends Component {
    constructor(opts) {
        super(opts);
        this._selectedHeroId = null;
        this._viewMode = 'group'; // 'group' or 'hero'
    }

    template() {
        const { players, campaignData = {} } = this.store.state;
        const selected = players?.find(p => p.id === this._selectedHeroId);

        return `
            <div class="page" style="max-width: 1400px;">
                <!-- HIDDEN PRINT TEMPLATE -->
                ${selected ? this._renderPrintTemplate(selected) : ''}

                <div class="section-header">
                    <div>
                        <h2 class="section-title">
                            <i class="fa-solid fa-flag" style="color:var(--accent); margin-right:12px;"></i> 
                            ${campaignData.title || 'Centro de Comando'}
                        </h2>
                        <p class="section-subtitle">${campaignData.location || 'Fronteiras do Mundo'} • Dia ${campaignData.day || 1}</p>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="sheet-tab-btn ${this._viewMode === 'group' ? 'active' : ''}" data-action="setViewMode" data-mode="group">VISÃO DO GRUPO</button>
                        <button class="sheet-tab-btn ${this._viewMode === 'hero' ? 'active' : ''}" data-action="setViewMode" data-mode="hero">GERIR HERÓIS</button>
                    </div>
                </div>

                ${this._viewMode === 'group' ? this._renderGroupView() : this._renderHeroManager()}
            </div>
        `;
    }

    _renderGroupView() {
        const { players = [], campaignData = {} } = this.store.state;
        return `
            <div style="display:grid; grid-template-columns: 1fr 350px; gap:var(--space-lg); animation: fadeIn 0.3s;">
                <div style="display:flex; flex-direction:column; gap:25px;">
                    <!-- PARTY STATS TABLE -->
                    <div class="card" style="padding:0; overflow:hidden;">
                        <div class="card-header" style="background:rgba(212,175,55,0.05);">
                            <span class="card-title"><i class="fa-solid fa-users"></i> Monitor da Equipe</span>
                        </div>
                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                            <thead>
                                <tr style="background:rgba(255,255,255,0.02); text-align:left;">
                                    <th style="padding:15px;">HERÓI</th>
                                    <th>HP</th>
                                    <th>CA</th>
                                    <th>PASSIVOS (P/I/I)</th>
                                    <th>NÍVEL / XP</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${players.map(p => this._renderGroupRow(p)).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- CAMPAIGN SETTINGS & FACTIONS -->
                    <div class="grid grid-2" style="gap:20px;">
                        <div class="card">
                            <div class="card-header"><span class="card-title">🗺️ Dados da Campanha</span></div>
                            <div class="form-group"><label class="attr-label">TÍTULO</label><input class="legacy-input" data-action="updateCampaign" data-key="title" value="${campaignData.title || ''}"></div>
                            <div class="form-group" style="margin-top:10px;"><label class="attr-label">LOCAL ATUAL</label><input class="legacy-input" data-action="updateCampaign" data-key="location" value="${campaignData.location || ''}"></div>
                            <div style="display:flex; gap:10px; margin-top:10px;">
                                <div class="form-group" style="flex:1;"><label class="attr-label">DIA ATUAL</label><input type="number" class="legacy-input" data-action="updateCampaign" data-key="day" value="${campaignData.day || 1}"></div>
                                <div style="display:flex; align-items:flex-end; gap:5px; flex:1;">
                                    <button class="btn btn-ghost btn-sm btn-block" data-action="groupRest" data-mode="short">DESCANSO CURTO</button>
                                    <button class="btn btn-primary btn-sm btn-block" data-action="groupRest" data-mode="long">DESCANSO LONGO</button>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                                <span class="card-title">🚩 Fações & Reputação</span>
                                <button class="btn btn-ghost btn-sm" data-action="addFaction">+</button>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:8px; max-height:150px; overflow-y:auto; padding-right:5px;">
                                ${(campaignData.factions || []).map((f, i) => `
                                    <div style="display:flex; align-items:center; gap:10px; font-size:0.75rem; background:rgba(255,255,255,0.02); padding:8px; border-radius:4px;">
                                        <input class="legacy-input" style="flex:2; font-size:0.7rem;" value="${f.name}" data-action="updateFaction" data-index="${i}" data-prop="name">
                                        <select class="legacy-input" style="flex:1; font-size:0.7rem;" data-action="updateFaction" data-index="${i}" data-prop="status">
                                            <option value="Aliado" ${f.status === 'Aliado' ? 'selected' : ''}>Aliado</option>
                                            <option value="Amigável" ${f.status === 'Amigável' ? 'selected' : ''}>Amigável</option>
                                            <option value="Neutro" ${f.status === 'Neutro' ? 'selected' : ''}>Neutro</option>
                                            <option value="Hostil" ${f.status === 'Hostil' ? 'selected' : ''}>Hostil</option>
                                        </select>
                                        <button class="btn btn-danger btn-sm" data-action="removeFaction" data-index="${i}">✕</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header"><span class="card-title">💰 Recursos & Tesouros</span></div>
                        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px;">
                             <div class="form-group"><label class="attr-label">OURO COLETIVO (PO)</label><input type="number" class="legacy-input" data-action="updateCampaign" data-key="groupGold" value="${campaignData.groupGold || 0}"></div>
                             <div class="form-group"><label class="attr-label">RAÇÕES</label><input type="number" class="legacy-input" data-action="updateCampaign" data-key="rations" value="${campaignData.rations || 0}"></div>
                             <div class="form-group"><label class="attr-label">ÁGUA (L)</label><input type="number" class="legacy-input" data-action="updateCampaign" data-key="water" value="${campaignData.water || 0}"></div>
                        </div>
                    </div>
                </div>

                <!-- SIDE LOGS / QUICK REF -->
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div class="card glass-accent">
                        <div class="card-header"><span class="card-title">📋 Notas do Mestre</span></div>
                        <textarea class="form-textarea" rows="15" placeholder="Resumo dos eventos importantes..." data-action="updateCampaign" data-key="notes">${campaignData.notes || ''}</textarea>
                    </div>
                </div>
            </div>
        `;
    }

    _renderGroupRow(p) {
        const hpPct = (p.hp?.current / p.hp?.max) * 100;
        const passives = this._calculatePassives(p);
        const xpInfo = this._getXPProgress(p.xp, p.level);

        return `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="padding:15px; display:flex; align-items:center; gap:10px;">
                    <div class="token-avatar" style="width:30px; height:30px; font-size:0.6rem;">${p.name.substring(0,2)}</div>
                    <div>
                        <div style="font-weight:700;">${p.name}</div>
                        <div style="font-size:0.6rem; opacity:0.5;">${p.race} ${p.class}</div>
                    </div>
                </td>
                <td style="width:120px;">
                    <div style="font-size:0.65rem; margin-bottom:4px;">${p.hp?.current}/${p.hp?.max}</div>
                    <div class="hp-bar" style="height:4px;"><div class="hp-bar-fill ${hpPct < 30 ? 'hp-red' : 'hp-green'}" style="width:${hpPct}%;"></div></div>
                </td>
                <td><div class="glass" style="width:35px; text-align:center; padding:5px; font-weight:800; border-radius:4px; border-color:var(--info);">${p.ac}</div></td>
                <td><div style="font-size:0.7rem; color:var(--accent);">${passives.perception} / ${passives.investigation} / ${passives.insight}</div></td>
                <td>
                    <div style="font-size:0.65rem; margin-bottom:4px;">Nv ${p.level} (${p.xp} XP)</div>
                    <div class="hp-bar" style="height:4px; background:rgba(255,255,255,0.05);"><div class="hp-bar-fill" style="width:${xpInfo.pct}%; background:var(--info);"></div></div>
                    <div style="font-size:0.55rem; color:var(--text-dim); margin-top:4px;">Próximo: ${xpInfo.next} XP</div>
                </td>
            </tr>
        `;
    }

    _renderHeroManager() {
        const { players = [] } = this.store.state;
        const selected = players.find(p => p.id === this._selectedHeroId);

        return `
            <div style="display:grid; grid-template-columns: 320px 1fr; gap:var(--space-lg); align-items:start; animation: fadeIn 0.3s;">
                <!-- HERO SELECTOR -->
                <div class="card" style="padding:0; overflow:hidden; border:1px solid rgba(212,175,55,0.1);">
                    <div class="card-header" style="background:rgba(212,175,55,0.05); padding:15px; margin-bottom:0;">
                        <span class="card-title" style="font-size:0.75rem;">SELECIONAR HERÓI</span>
                    </div>
                    <div style="display:flex; flex-direction:column;">
                        ${players.map(p => this._renderHeroItem(p)).join('') || '<p style="padding:20px; font-size:0.7rem; opacity:0.5;">Crie heróis na aba de criação.</p>'}
                    </div>
                </div>

                <div id="command-ui">
                    ${selected ? this._renderCommandPanel(selected) : `
                        <div class="card empty-state" style="height:60vh;">
                            <i class="fa-solid fa-sync fa-spin" style="font-size:3rem; opacity:0.1; margin-bottom:20px;"></i>
                            <p>Selecione um herói para gerenciar individualmente.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    _renderPrintTemplate(p) {
        const stats = p.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 };
        const getMod = (v) => Math.floor((v - 10) / 2);
        
        return `
            <div class="dnd-print-template">
                <div class="dnd-header">
                    <div style="flex:1;">
                        <h1 style="margin:0; font-size:24px;">${p.name}</h1>
                        <span style="font-size:10px; text-transform:uppercase;">Nome do Personagem</span>
                    </div>
                    <div style="flex:2; display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; font-size:10px;">
                        <div><strong>Classe/Nível:</strong> ${p.class} ${p.level}</div>
                        <div><strong>Raça:</strong> ${p.race}</div>
                        <div><strong>XP:</strong> ${p.xp || 0}</div>
                    </div>
                </div>

                <div class="dnd-main-stats">
                    <div class="dnd-box"><div class="val">${10 + getMod(stats.dex)}</div><div class="label">CA</div></div>
                    <div class="dnd-box"><div class="val">+${getMod(stats.dex)}</div><div class="label">Iniciativa</div></div>
                    <div class="dnd-box"><div class="val">30ft</div><div class="label">Deslocamento</div></div>
                    <div class="dnd-box" style="flex:2;"><div class="val">${p.hp?.current} / ${p.hp?.max}</div><div class="label">Pontos de Vida Atuais</div></div>
                </div>

                <div class="dnd-grid">
                    <div class="dnd-stats-column">
                        ${Object.entries(stats).map(([s, v]) => `
                            <div class="stat-box">
                                <div class="stat-label">${s}</div>
                                <div class="stat-mod">${getMod(v) >= 0 ? '+' : ''}${getMod(v)}</div>
                                <div class="stat-val">${v}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="skill-list card" style="padding:15px; border:2px solid #000;">
                        <div style="font-weight:800; border-bottom:1px solid #000; margin-bottom:10px;">PERÍCIAS & TESTES</div>
                        ${this._getSkillsList().map(sk => {
                            const isProf = p.skills?.includes(sk.id.toLowerCase());
                            return `<div class="skill-item">${isProf ? '●' : '○'} ${sk.label} (${sk.attr})</div>`;
                        }).join('')}
                    </div>

                    <div style="display:flex; flex-direction:column; gap:15px;">
                        <div class="card" style="border:2px solid #000; padding:10px; flex:1;">
                            <div class="stat-label">Equipamento & Itens</div>
                            <div style="font-size:9px; margin-top:5px; white-space:pre-wrap;">${p.equipment?.items || ''}</div>
                        </div>
                        <div class="card" style="border:2px solid #000; padding:10px; flex:1;">
                            <div class="stat-label">Características & Traços</div>
                            <div style="font-size:9px; margin-top:5px; white-space:pre-wrap;">${p.roleplay?.traits || ''}</div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top:20px; font-size:8px; text-align:center; opacity:0.5;">
                    Gerado pelo DOMÍNIO RPG Architect — Ficha Oficial de Referência 5e
                </div>
            </div>
        `;
    }

    _renderHeroItem(p) {
        const isActive = p.id === this._selectedHeroId;
        return `
            <div class="init-row ${isActive ? 'active' : ''}" style="padding:15px; cursor:pointer;" data-action="selectHero" data-id="${p.id}">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="token-avatar" style="width:35px; height:35px; border-color:${isActive ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}">${p.name.substring(0,2)}</div>
                    <div>
                        <div style="font-weight:700; font-size:0.85rem; color:${isActive ? 'var(--accent)' : 'var(--text)'}">${p.name}</div>
                        <div style="font-size:0.6rem; color:var(--text-dim);">Nv ${p.level} • ${p.hp?.current}/${p.hp?.max} HP</div>
                    </div>
                </div>
            </div>
        `;
    }

    _renderCommandPanel(p) {
        const hpPct = (p.hp?.current / p.hp?.max) * 100;
        return `
            <div style="display:flex; flex-direction:column; gap:var(--space-lg); animation: fadeIn 0.2s;">
                <div class="card glass-accent" style="padding:25px; border:1px solid var(--accent);">
                    <div style="display:flex; gap:25px; align-items:center;">
                        <div class="token-avatar" style="width:80px; height:80px; border-width:3px; border-color:var(--accent);">${p.name.substring(0,2)}</div>
                        <div style="flex:1;">
                            <h1 style="margin:0; font-size:2rem; font-family:var(--font-heading); color:var(--accent);">${p.name}</h1>
                            <p style="color:var(--text-dim); font-size:0.9rem; margin-top:5px;">${p.race} ${p.class} • Nível ${p.level}</p>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:0.6rem; color:var(--text-dim);">EXPERIÊNCIA (XP)</div>
                            <div style="font-size:1.5rem; font-weight:800; color:var(--info);">${p.xp || 0}</div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-3" style="gap:var(--space-md);">
                    <div class="card" style="background:rgba(0,0,0,0.2);">
                        <div style="font-size:0.7rem; color:var(--text-dim); margin-bottom:10px; font-weight:700;">VIDA ATUAL: ${p.hp?.current} / ${p.hp?.max}</div>
                        <div class="hp-bar" style="height:10px; margin-bottom:15px;"><div class="hp-bar-fill ${hpPct < 30 ? 'hp-red' : 'hp-green'}" style="width:${hpPct}%;"></div></div>
                        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:5px;">
                            <button class="btn btn-danger btn-sm" data-action="adjustHP" data-val="-5">-5</button>
                            <button class="btn btn-ghost btn-sm" data-action="adjustHP" data-val="-1">-1</button>
                            <button class="btn btn-ghost btn-sm" data-action="adjustHP" data-val="1">+1</button>
                            <button class="btn btn-primary btn-sm" data-action="adjustHP" data-val="5">+5</button>
                        </div>
                    </div>

                    <div class="card" style="background:rgba(0,0,0,0.2); display:flex; flex-direction:column; gap:10px;">
                        <span style="font-size:0.7rem; font-weight:700; color:var(--info);">GERIR EXPERIÊNCIA</span>
                        <div class="grid grid-2" style="gap:5px;">
                            <button class="btn btn-ghost btn-sm" data-action="adjustXP" data-val="100">+100</button>
                            <button class="btn btn-ghost btn-sm" data-action="adjustXP" data-val="500">+500</button>
                        </div>
                        <div style="display:flex; gap:5px;">
                            <button class="btn btn-info btn-sm" style="flex:1;" data-action="customXP">Add XP</button>
                            <button class="btn btn-success btn-sm" style="flex:1;" data-action="levelUp">LEVEL UP</button>
                        </div>
                    </div>

                    <div class="card" style="background:rgba(0,0,0,0.2); display:flex; flex-direction:column; gap:8px;">
                        <span style="font-size:0.7rem; font-weight:700; color:var(--accent);">🎁 FERRAMENTAS DE PDF</span>
                        <button class="btn btn-primary btn-sm btn-block" data-action="printSheet"><i class="fa-solid fa-file-pdf"></i> Imprimir Ficha Oficial 5e</button>
                        <button class="btn btn-ghost btn-sm btn-block" data-action="printCard">Imprimir Card Rápido</button>
                    </div>
                </div>

                <div class="card" style="background:rgba(0,0,0,0.2);">
                    <div class="grid grid-6" style="gap:10px;">
                        ${Object.entries(p.stats || {str:10,dex:10,con:10,int:10,wis:10,cha:10}).map(([s,v]) => `
                            <div style="text-align:center; padding:10px; background:rgba(255,255,255,0.03); border-radius:8px;">
                                <div style="font-size:0.6rem; color:var(--accent); font-weight:800;">${s.toUpperCase()}</div>
                                <div style="font-size:1.2rem; font-weight:900;">${v}</div>
                                <div style="font-size:0.6rem; opacity:0.5;">Mod: +${Math.floor((v-10)/2)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="grid grid-2" style="gap:var(--space-md);">
                    <div class="card"><div class="card-header"><span class="card-title">🎒 Itens</span></div><textarea class="form-textarea" rows="4" data-action="updateItems">${p.equipment?.items || ''}</textarea></div>
                    <div class="card"><div class="card-header"><span class="card-title">📝 Notas</span></div><textarea class="form-textarea" rows="4" data-action="updateNotes">${p.roleplay?.traits || ''}</textarea></div>
                </div>
            </div>
        `;
    }

    setViewMode(e, el) { this._viewMode = el.dataset.mode; this.render(); }
    selectHero(e, el) { this._selectedHeroId = el.dataset.id; this.render(); }
    printSheet() { window.print(); }
    printCard() { window.print(); }

    updateCampaign(e, el) {
        const key = el.dataset.key;
        const val = el.type === 'number' ? parseInt(el.value) : el.value;
        TOME.store.update(s => {
            if (!s.campaignData) s.campaignData = {};
            s.campaignData[key] = val;
        });
    }

    _calculatePassives(p) {
        const prof = p.proficiencyBonus || 2;
        const mod = (v) => Math.floor(((v || 10) - 10) / 2);
        const getSkill = (id) => (p.skills || []).includes(id.toLowerCase()) ? prof : 0;

        return {
            perception: 10 + mod(p.stats?.wis) + getSkill('perception'),
            investigation: 10 + mod(p.stats?.int) + getSkill('investigation'),
            insight: 10 + mod(p.stats?.wis) + getSkill('insight')
        };
    }

    _getXPProgress(xp, level) {
        const table = [
            0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
            85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
        ];
        const currentLevel = Math.max(1, Math.min(20, parseInt(level) || 1));
        const min = table[currentLevel - 1];
        const max = table[currentLevel] || table[19];
        const pct = Math.min(100, Math.max(0, ((xp - min) / (max - min)) * 100));
        
        return {
            current: min,
            next: max,
            pct: pct
        };
    }

    addFaction() {
        TOME.store.update(s => {
            if (!s.campaignData.factions) s.campaignData.factions = [];
            s.campaignData.factions.push({ name: 'Nova Facção', status: 'Neutro' });
        });
        this.render();
    }

    removeFaction(e, el) {
        const idx = parseInt(el.dataset.index);
        TOME.store.update(s => s.campaignData.factions.splice(idx, 1));
        this.render();
    }

    updateFaction(e, el) {
        const idx = parseInt(el.dataset.index);
        const prop = el.dataset.prop;
        TOME.store.update(s => s.campaignData.factions[idx][prop] = el.value);
    }

    groupRest(e, el) {
        const mode = el.dataset.mode;
        const msg = mode === 'long' ? 'Aplicar Descanso Longo para todos? (HP Total)' : 'Aplicar Descanso Curto para todos? (Recuperação base)';
        if (!confirm(msg)) return;

        TOME.store.update(s => {
            s.players.forEach(p => {
                if (mode === 'long') {
                    p.hp.current = p.hp.max;
                } else {
                    p.hp.current = Math.min(p.hp.max, p.hp.current + Math.floor(p.hp.max * 0.25));
                }
                const combatant = s.initiativeOrder?.find(c => c.name === p.name);
                if (combatant) combatant.hp_current = p.hp.current;
            });
        });
        Toast.show(`Descanso ${mode === 'long' ? 'Longo' : 'Curto'} aplicado!`, 'success');
        this.render();
    }

    adjustHP(e, el) {
        const val = parseInt(el.dataset.val);
        TOME.store.update(s => {
            const p = s.players.find(x => x.id === this._selectedHeroId);
            if (p) {
                p.hp.current = Math.max(0, Math.min(p.hp.max, p.hp.current + val));
                const combatant = s.initiativeOrder?.find(c => c.name === p.name);
                if (combatant) combatant.hp_current = p.hp.current;
            }
        });
        this.render();
    }

    adjustXP(e, el) {
        const val = parseInt(el.dataset.val);
        TOME.store.update(s => {
            const p = s.players.find(x => x.id === this._selectedHeroId);
            if (p) p.xp = (p.xp || 0) + val;
        });
        this.render();
    }

    customXP() {
        const val = parseInt(prompt('Quantidade de XP:'));
        if (!isNaN(val)) {
            TOME.store.update(s => {
                const p = s.players.find(x => x.id === this._selectedHeroId);
                if (p) p.xp = (p.xp || 0) + val;
            });
            this.render();
        }
    }

    updateItems(e, el) {
        clearTimeout(this._updTimer);
        this._updTimer = setTimeout(() => {
            TOME.store.update(s => {
                const p = s.players.find(x => x.id === this._selectedHeroId);
                if (p) p.equipment.items = el.value;
            });
        }, 500);
    }

    updateNotes(e, el) {
        clearTimeout(this._updTimerN);
        this._updTimerN = setTimeout(() => {
            TOME.store.update(s => {
                const p = s.players.find(x => x.id === this._selectedHeroId);
                if (p) p.roleplay.traits = el.value;
            });
        }, 500);
    }

    levelUp() {
        TOME.store.update(s => {
            const p = s.players.find(x => x.id === this._selectedHeroId);
            if (p) {
                p.level = (parseInt(p.level) || 1) + 1;
                p.hp.max += 8; // Default increase
                p.hp.current = p.hp.max;
                Toast.show(`${p.name} subiu para o nível ${p.level}!`, 'success');
            }
        });
        this.render();
    }

    _getSkillsList() {
        return [
            { id: 'Acrobatics', label: 'Acrobacia', attr: 'Des' },
            { id: 'Animal Handling', label: 'Adestrar Animais', attr: 'Sab' },
            { id: 'Arcana', label: 'Arcanismo', attr: 'Int' },
            { id: 'Athletics', label: 'Atletismo', attr: 'For' },
            { id: 'Deception', label: 'Enganação', attr: 'Car' },
            { id: 'History', label: 'História', attr: 'Int' },
            { id: 'Insight', label: 'Intuição', attr: 'Sab' },
            { id: 'Intimidation', label: 'Intimidação', attr: 'Car' },
            { id: 'Investigation', label: 'Investigação', attr: 'Int' },
            { id: 'Medicine', label: 'Medicina', attr: 'Sab' },
            { id: 'Nature', label: 'Natureza', attr: 'Int' },
            { id: 'Perception', label: 'Percepção', attr: 'Sab' },
            { id: 'Performance', label: 'Atuação', attr: 'Car' },
            { id: 'Persuasion', label: 'Persuasão', attr: 'Car' },
            { id: 'Religion', label: 'Religião', attr: 'Int' },
            { id: 'Sleight of Hand', label: 'Prestidigitação', attr: 'Des' },
            { id: 'Stealth', label: 'Furtividade', attr: 'Des' },
            { id: 'Survival', label: 'Sobrevivência', attr: 'Sab' }
        ];
    }
}
