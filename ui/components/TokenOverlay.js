import { Component } from '../core/Component.js';

/**
 * TokenOverlay - Displays a single token's overlay info (HP bar, status, name).
 * Used inside CombatArena for per-token rendering.
 */
export class TokenOverlay extends Component {
    constructor(opts) {
        super(opts);
        this.token = opts.token || null;
        this.isActive = opts.isActive || false;
    }

    template() {
        const t = this.token;
        if (!t) return '';
        const hpPct = Math.round((t.hp.current / t.hp.max) * 100);
        const hpColor = hpPct > 60 ? '#10b981' : hpPct > 30 ? '#f59e0b' : '#ef4444';
        const isActive = this.isActive;

        return `
            <div class="token-overlay" style="
                position: absolute;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
                pointer-events: none;
            ">
                <div style="
                    font-family: 'Cinzel', serif;
                    font-size: 0.6rem;
                    font-weight: 800;
                    color: ${isActive ? 'var(--accent)' : '#fff'};
                    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
                    white-space: nowrap;
                ">${t.name}</div>
                <div style="
                    width: 40px;
                    height: 4px;
                    background: rgba(0,0,0,0.5);
                    border-radius: 2px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.1);
                ">
                    <div style="
                        height: 100%;
                        width: ${Math.max(0, Math.min(100, hpPct))}%;
                        background: ${hpColor};
                        transition: width 0.3s ease;
                    "></div>
                </div>
                ${t.conditions && t.conditions.length > 0 ? `
                    <div style="font-size: 0.7rem; margin-top: 1px;">
                        ${t.conditions.slice(0, 3).map(c => c).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
}
