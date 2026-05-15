import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';

/**
 * PARTY STATUS HUD v1.0
 * Fixed monitoring bar for player vitals.
 */
export class PartyStatusHUD extends Component {
    template() {
        const { players, showPartyHUD } = this.store.state;
        if (!players || players.length === 0 || !showPartyHUD) return '';

        return `
            <div class="party-hud glass animate-fade-in" style="position:fixed; top:90px; right:20px; z-index:1000; padding:15px; display:flex; flex-direction:column; gap:12px; border-color:var(--accent-glow); min-width:180px; max-height:calc(100vh - 120px); overflow-y:auto; background:rgba(0,0,0,0.7); backdrop-filter:blur(15px); border-radius:var(--radius-lg); box-shadow:var(--shadow-premium);">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">
                    <div style="font-size:0.65rem; font-weight:900; color:var(--accent); text-transform:uppercase; letter-spacing:1px;">Vitais do Grupo</div>
                    <button class="btn btn-ghost" style="padding:2px 5px; font-size:0.5rem; color:var(--success);" data-action="longRest" title="Descanso Longo">🏠 REST</button>
                </div>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    ${players.map(p => this._renderPlayerMini(p)).join('')}
                </div>
            </div>
        `;
    }

    _renderPlayerMini(p) {
        const current = p.hp?.current !== undefined ? p.hp.current : (p.hp_current || 0);
        const max = p.hp?.max !== undefined ? p.hp.max : (p.hp_max || 10);
        const hpPct = (current / max) * 100;
        const hpColor = hpPct < 30 ? 'var(--danger)' : hpPct < 60 ? 'var(--warning)' : 'var(--success)';

        return `
            <div class="hud-item" style="display:flex; flex-direction:column; gap:4px; min-width:80px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.65rem; font-weight:800; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:60px;">${p.name}</span>
                    <span style="font-size:0.55rem; color:var(--accent); font-weight:700;">CA ${p.ac}</span>
                </div>
                <div class="hp-bar" style="height:4px; background:rgba(255,255,255,0.05);">
                    <div class="hp-bar-fill" style="width:${hpPct}%; background:${hpColor}; box-shadow: 0 0 5px ${hpColor}44;"></div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.5rem; color:var(--text-dim);">HP ${current}/${max}</span>
                    <span style="font-size:0.5rem; color:var(--info);">👁️ ${this._getPassivePerception(p)}</span>
                </div>
            </div>
        `;
    }

    _getPassivePerception(p) {
        const wis = p.stats?.wis || 10;
        const mod = Math.floor((wis - 10) / 2);
        const isProf = p.skills?.includes('perception');
        const prof = p.proficiencyBonus || 2;
        return 10 + mod + (isProf ? prof : 0);
    }

    longRest() {
        if (!confirm('Deseja aplicar um Descanso Longo para toda a party? (Recupera HP total)')) return;
        TOME.store.update(s => {
            s.players.forEach(p => {
                if (p.hp) p.hp.current = p.hp.max;
                if (p.hp_current !== undefined) p.hp_current = p.hp_max;
            });
        });
        Toast.show('Descanso Longo concluído! Party recuperada.', 'success');
    }
}
