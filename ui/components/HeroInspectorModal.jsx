import { ReactiveComponent } from '../core/ReactiveComponent.js';
import { html } from 'htm/preact';
import { TOME } from '../../core/Registry.js';
import { RulesEngine } from '../../core/RulesEngine.js';

/**
 * HERO INSPECTOR MODAL V22.0.0
 * Allows DM to inspect a player's inventory, spells, and cards.
 */
export class HeroInspectorModal extends ReactiveComponent {
    constructor(opts) {
        super(opts);
        this.playerId = opts.playerId;
        this.player = null;
        this._activeTab = 'inventory'; // 'inventory' | 'spells' | 'cards'
    }

    close = () => {
        if (this.element && this.element.parentNode) {
            if (this.element.parentNode.parentNode) {
                this.element.parentNode.parentNode.removeChild(this.element.parentNode);
            }
        }
        this.unmount();
    }

    setTab = (tab) => {
        this._activeTab = tab;
        this.render();
    }

    _renderInventory() {
        const inv = this.player.inventory || [];
        return html`
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:15px; margin-top:15px;">
                ${inv.length === 0 ? html`<div style="opacity:0.5; text-align:center; padding:20px; grid-column:1/-1;">Inventário vazio.</div>` : ''}
                ${inv.map(item => html`
                    <div class="card glass" style="padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:12px;">
                        <div style="width:40px; height:40px; border-radius:8px; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; color:var(--accent);">
                            <i class="fa-solid ${item.type === 'weapon' ? 'fa-khanda' : item.type === 'armor' ? 'fa-shield' : 'fa-box'}"></i>
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:bold; font-size:0.9rem; color:#fff;">${item.name}</div>
                            <div style="font-size:0.7rem; color:var(--text-dim);">${item.damage ? `Dano: ${item.damage}` : (item.desc || 'Item Comum')}</div>
                        </div>
                    </div>
                `)}
            </div>
        `;
    }

    _renderSpells() {
        const p = this.player;
        const levels = [0,1,2,3,4,5,6,7,8,9];
        return html`
            <div style="display:flex; flex-direction:column; gap:15px; margin-top:15px; max-height:450px; overflow-y:auto; padding-right:10px;" class="custom-scroll">
                ${levels.map(lv => {
                    const levelSpellsStr = p.spells?.[`lvl${lv}`] || '';
                    if (!levelSpellsStr.trim()) return '';
                    
                    const spells = levelSpellsStr.split('\n').filter(s => s.trim());
                    if (spells.length === 0) return '';
                    
                    const slots = p.spellSlots?.[lv] || { total: 0, used: 0 };

                    return html`
                        <div class="card glass-accent" style="padding:15px; border-radius:12px; border:1px solid rgba(197,160,89,0.2);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
                                <div style="font-family:'Cinzel'; font-weight:bold; color:var(--accent); font-size:1.1rem;">
                                    ${lv === 0 ? 'TRUQUES' : `NÍVEL ${lv}`}
                                </div>
                                ${lv > 0 ? html`
                                    <div style="font-size:0.8rem; color:var(--text-dim);">
                                        Slots: <span style="color:#fff;">${slots.total - slots.used} / ${slots.total}</span>
                                    </div>
                                ` : ''}
                            </div>
                            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px;">
                                ${spells.map(s => html`
                                    <div style="background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.05); font-size:0.85rem; color:#e2e8f0; display:flex; align-items:center; gap:8px;">
                                        <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent); font-size:0.7rem;"></i> ${s}
                                    </div>
                                `)}
                            </div>
                        </div>
                    `;
                })}
            </div>
        `;
    }

    template() {
        this.player = this.store.state.players.find(p => p.id === this.playerId);
        if (!this.player) return html`<div>Heroi não encontrado.</div>`;
        
        const hp = RulesEngine.getHP(this.player);

        return html`
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px);">
                <div class="card glass-accent animate-scaleIn" style="max-width:800px; width:100%; padding:0; border:2px solid var(--accent); max-height:90vh; overflow:hidden; background:rgba(15,12,16,0.95); position:relative; display:flex; flex-direction:column;">
                    
                    <!-- Header -->
                    <div style="padding:25px; border-bottom:1px solid rgba(197,160,89,0.3); background:linear-gradient(to bottom, rgba(197,160,89,0.1), transparent); display:flex; align-items:center; gap:20px;">
                        <button class="btn btn-ghost" onClick=${this.close} style="position:absolute; top:20px; right:20px; border-radius:50%; width:36px; height:36px; padding:0;">
                            <i class="fa-solid fa-times"></i>
                        </button>
                        
                        <div style="width:70px; height:70px; border-radius:50%; border:2px solid var(--accent); background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-family:'Cinzel'; color:var(--accent); overflow:hidden;">
                            ${this.player.img ? html`<img src="${this.player.img}" style="width:100%; height:100%; object-fit:cover;" />` : this.player.name.substring(0,1)}
                        </div>
                        
                        <div style="flex:1;">
                            <h2 style="margin:0; font-family:'Cinzel'; color:var(--accent); font-size:1.8rem; text-shadow:0 0 10px rgba(197,160,89,0.5);">${this.player.name}</h2>
                            <div style="font-size:0.9rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">
                                ${this.player.race} ${this.player.class} • Nível ${this.player.level || 1}
                            </div>
                        </div>
                        
                        <div style="text-align:right; padding-right:40px;">
                            <div style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">Pontos de Vida</div>
                            <div style="font-size:1.5rem; font-weight:bold; font-family:'Cinzel'; color:${hp.current > 0 ? '#10b981' : '#ef4444'};">
                                ${hp.current} <span style="font-size:1rem; color:var(--text-dim);">/ ${hp.max}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tabs -->
                    <div style="display:flex; border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.4);">
                        <button class="btn ${this._activeTab === 'inventory' ? 'btn-primary' : 'btn-ghost'}" style="flex:1; border-radius:0; padding:15px; font-weight:bold;" onClick=${() => this.setTab('inventory')}>
                            <i class="fa-solid fa-backpack" style="margin-right:8px;"></i> Equipamento
                        </button>
                        <button class="btn ${this._activeTab === 'spells' ? 'btn-primary' : 'btn-ghost'}" style="flex:1; border-radius:0; padding:15px; font-weight:bold;" onClick=${() => this.setTab('spells')}>
                            <i class="fa-solid fa-book-journal-whills" style="margin-right:8px;"></i> Grimório / Magias
                        </button>
                    </div>

                    <!-- Content -->
                    <div style="padding:25px; flex:1; overflow-y:auto;">
                        ${this._activeTab === 'inventory' ? this._renderInventory() : this._renderSpells()}
                    </div>
                </div>
            </div>
        `;
    }
}
