import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';

/**
 * DASHBOARD v6.0 — "Master's Table" Edition
 * Unified with the Legacy Parchment theme.
 */
export class Dashboard extends Component {
    constructor(opts) {
        super(opts);
        this._activeChild = null;
        this._lastTab = null;
    }

    template() {
        return `
            <div id="view-content" style="width:100%; height:100%; overflow-y:auto; scrollbar-width:thin;"></div>
            <div id="hud-target"></div>
        `;
    }

    async onMount() {
        this._loadView();
        
        // Load HUD (Compact Party View)
        const { PartyStatusHUD } = await import('../components/PartyStatusHUD.js');
        this._hud = new PartyStatusHUD({
            store: this.store,
            element: this.$('#hud-target')
        });
        this._hud.mount();
    }

    render() {
        const tab = this.store.state.activeTab;
        if (!this.$('#view-content')) {
            super.render();
            return;
        }
        if (tab !== this._lastTab) {
            this._loadView();
        }
    }

    async _loadView() {
        const tab = this.store.state.activeTab;
        if (tab === this._lastTab && this._activeChild) return;
        this._lastTab = tab;

        const target = this.$('#view-content');
        if (!target) return;

        if (this._activeChild) {
            this._activeChild.unmount();
            this._activeChild = null;
        }

        if (tab === 'dashboard') {
            target.innerHTML = this._homePage();
            this._bindHomeActions(target);
            return;
        }

        // Cinematic Loader
        target.innerHTML = `
            <div style="height:80vh; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--sheet-label-color); gap:20px;">
                <i class="fa-solid fa-feather-pointed fa-3x fa-bounce"></i>
                <div style="font-family:'Cinzel'; letter-spacing:3px;">Abrindo Tomo...</div>
            </div>
        `;

        try {
            const moduleMap = {
                'campaign': { path: '../components/CampaignManager.js', cls: 'CampaignManager' },
                'dmshield': { path: '../components/WorldBuilder.js',    cls: 'WorldBuilder' },
                'combat':   { path: '../components/CombatTracker.js',  cls: 'CombatTracker' },
                'map':      { path: '../components/MapManager.js',     cls: 'MapManager' },
                'builder':  { path: '../components/PlayerForm.js',     cls: 'PlayerForm' },
                'bestiary': { path: '../components/MonsterForm.js',    cls: 'MonsterForm' },
                'journal':  { path: '../components/SessionJournal.js', cls: 'SessionJournal' },
                'loot':     { path: '../components/LootGenerator.js',  cls: 'LootGenerator' },
                'vault':    { path: '../components/VaultExplorer.js',  cls: 'VaultExplorer' },
                'npc':      { path: '../components/NPCHelper.js',     cls: 'NPCHelper' },
                'quests':   { path: '../components/QuestManager.js',   cls: 'QuestManager' },
                'quickref': { path: '../components/QuickReference.js', cls: 'QuickReference' }
            };

            const entry = moduleMap[tab];
            if (!entry) {
                target.innerHTML = `<div class="legacy-sheet-container">Módulo não encontrado.</div>`;
                return;
            }

            const mod = await import(entry.path);
            const Cls = mod[entry.cls];
            target.innerHTML = '';
            this._activeChild = new Cls({ store: this.store, element: target });
            this._activeChild.mount();

        } catch (err) {
            console.error('[Dashboard] Error:', err);
            target.innerHTML = `<div class="legacy-sheet-container">Erro ao carregar módulo: ${err.message}</div>`;
        }
    }

    _homePage() {
        const stats = this.store.state;
        const playerCount = (stats.players || []).length;
        const monsterCount = (stats.monsters || []).length;
        const activeCombat = stats.combatActive ? '⚔️ EM COMBATE' : '📜 EXPLORAÇÃO';

        return `
            <div class="animate-fade" style="max-width:1400px; margin:0 auto;">
                <!-- WELCOME BANNER -->
                <header style="text-align:center; margin-bottom:60px; position:relative;">
                    <h1 style="font-size:4rem; margin:0; filter: drop-shadow(0 0 15px hsla(var(--h-gold), 50%, 50%, 0.2));">DOMÍNIO RPG</h1>
                    <div style="display:flex; align-items:center; justify-content:center; gap:20px; margin-top:10px;">
                        <span style="height:1px; width:100px; background:var(--primary); opacity:0.3;"></span>
                        <p style="font-family:'Outfit'; text-transform:uppercase; letter-spacing:6px; color:var(--primary); font-weight:800; font-size:0.75rem;">Mesa do Mestre • Pro v6.0</p>
                        <span style="height:1px; width:100px; background:var(--primary); opacity:0.3;"></span>
                    </div>
                </header>

                <!-- QUICK STATS -->
                <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-bottom:50px;">
                    ${this._statBox('STATUS', activeCombat, stats.combatActive ? 'var(--danger)' : 'var(--primary)')}
                    ${this._statBox('HERÓIS', `${playerCount} REGISTROS`, 'white')}
                    ${this._statBox('BESTIÁRIO', `${monsterCount} CRIATURAS`, 'white')}
                    ${this._statBox('DATA', new Date().toLocaleDateString('pt-BR'), 'white')}
                </div>

                <!-- MAIN TOOLS GRID -->
                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:40px;">
                    <div style="display:flex; flex-direction:column; gap:30px;">
                        <section style="background:var(--bg-glass); padding:40px; border-radius:var(--radius-lg); border:1px solid var(--border-glass); box-shadow:var(--shadow-premium);">
                            <h2 style="font-size:1.2rem; margin-bottom:30px; color:var(--primary); border-bottom:1px solid var(--border-glass); padding-bottom:15px;">🛡️ FERRAMENTAS RÁPIDAS</h2>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                                ${this._quickAction('dmshield', 'Oráculo de Cena', 'Narrações dinâmicas com IA.', 'fa-wand-magic-sparkles')}
                                ${this._quickAction('builder', 'Codex de Heróis', 'Gerenciar fichas legacy.', 'fa-user-plus')}
                                ${this._quickAction('loot', 'Cofre de Itens', 'Gerador de tesouros.', 'fa-coins')}
                                ${this._quickAction('bestiary', 'Grimório', 'Consultar ameaças.', 'fa-dragon')}
                            </div>
                        </section>

                        <!-- RECENT ENTRIES -->
                        <div style="background:var(--bg-glass); padding:30px; border-radius:var(--radius-lg); border:1px solid var(--border-glass);">
                            <h3 style="font-size:0.9rem; opacity:0.6; margin-bottom:20px;">📜 ÚLTIMOS REGISTROS DO DIÁRIO</h3>
                            <div style="display:flex; flex-direction:column; gap:15px;">
                                ${(stats.journalEntries || []).slice(-3).reverse().map(e => `
                                    <div style="padding:20px; background:rgba(255,255,255,0.03); border-radius:8px; border-left:3px solid var(--primary);">
                                        <div style="font-size:0.6rem; opacity:0.5; font-weight:800; margin-bottom:5px;">${e.date}</div>
                                        <div style="font-size:0.9rem; font-style:italic; color:#cbd5e1;">"${e.content}"</div>
                                    </div>
                                `).join('') || '<p style="text-align:center; opacity:0.3; padding:20px;">Nenhum registro recente.</p>'}
                            </div>
                        </div>
                    </div>

                    <!-- SIDEBAR INFO -->
                    <div style="display:flex; flex-direction:column; gap:30px;">
                        <div style="background:var(--bg-glass); padding:30px; border-radius:var(--radius-lg); border:1px solid var(--border-glass); text-align:center;">
                            <h3 style="font-size:0.9rem; margin-bottom:20px;">MONITOR DE INICIATIVA</h3>
                            ${stats.combatActive ? this._renderCombatMiniPreview() : '<div style="padding:40px; opacity:0.3;"><i class="fa-solid fa-hourglass-start fa-2x"></i><p style="font-size:0.7rem; margin-top:15px;">Mesa em exploração...</p></div>'}
                            <button class="btn btn-primary btn-block" style="width:100%; margin-top:20px;" data-action="quickNav" data-tab="combat">ABRIR ARENA</button>
                        </div>
                        
                        <div style="padding:30px; background:linear-gradient(135deg, rgba(197, 160, 89, 0.1), transparent); border-radius:var(--radius-lg); border:1px solid var(--border-glass); text-align:center;">
                            <i class="fa-solid fa-lightbulb" style="color:var(--primary); margin-bottom:15px;"></i>
                            <p style="font-size:0.75rem; color:var(--text-dim); line-height:1.6;">Dica: Use o <strong>Oráculo</strong> para gerar reviravoltas narrativas quando o ritmo da sessão cair!</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    _statBox(label, val, color) {
        return `
            <div style="background:var(--bg-glass); padding:25px; border-radius:var(--radius-md); border:1px solid var(--border-glass); text-align:center; backdrop-filter:blur(10px);">
                <label style="font-size:0.6rem; font-weight:900; letter-spacing:2px; color:var(--text-dim); display:block; margin-bottom:10px;">${label}</label>
                <div style="font-size:1rem; font-weight:800; color:${color}; font-family:'Cinzel';">${val}</div>
            </div>
        `;
    }

    _quickAction(tab, title, desc, icon) {
        return `
            <button class="btn-action-card" data-action="quickNav" data-tab="${tab}" style="background:rgba(255,255,255,0.02); border:1px solid var(--border-glass); padding:25px; border-radius:12px; text-align:left; cursor:pointer; transition:all 0.3s;">
                <i class="fa-solid ${icon}" style="font-size:1.5rem; color:var(--primary); margin-bottom:15px; display:block;"></i>
                <strong style="display:block; color:#fff; margin-bottom:5px;">${title}</strong>
                <small style="color:var(--text-dim); font-size:0.75rem;">${desc}</small>
            </button>
        `;
    }

    _renderCombatMiniPreview() {
        const combatants = (this.store.state.initiativeOrder || []).slice(0, 4);
        return `
            <div style="display:flex; flex-direction:column; gap:12px;">
                ${combatants.map(c => `
                    <div style="display:flex; align-items:center; gap:15px; padding:12px; background:rgba(255,255,255,0.03); border-radius:8px;">
                        <div style="font-weight:900; color:var(--primary); font-size:1.1rem;">${c.initiative || 0}</div>
                        <div style="flex:1; text-align:left; font-size:0.85rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.name}</div>
                        <div style="font-size:0.7rem; opacity:0.6;">${c.hp_current}/${c.hp_max}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    _bindHomeActions(target) {
        target.querySelectorAll('[data-action="quickNav"]').forEach(el => {
            el.onclick = () => TOME.store.update(s => s.activeTab = el.dataset.tab);
        });
    }
}
