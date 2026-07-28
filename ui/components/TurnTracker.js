// ui/components/TurnTracker.js
import { Component } from '../core/Component.js';
/**
 * TurnTracker - displays the initiative order and highlights the current turn.
 */
export class TurnTracker extends Component {
  constructor(opts) {
    super(opts);
  }

  /**
   * Advance to next turn.
   */
  next() {
    this.store.setState({ initiativeIndex: (this.store.state.initiativeIndex + 1) % this.store.state.initiativeOrder.length });
    // Optionally notify other components via BroadcastChannel
    if (this.channel) this.channel.postMessage({ type: 'turn-change' });
  }

  template() {
    const { initiativeOrder = [], initiativeIndex = 0 } = this.store.state;
    return `
      <div class="turn-tracker glass" style="padding:12px; border-radius:10px; background:rgba(10,12,16,0.75); border:1px solid rgba(197,160,89,0.2); box-shadow:0 4px 12px rgba(0,0,0,0.4); margin-top:10px;">
        <div style="font-family:'Cinzel', serif; color:var(--accent); font-weight:800; margin-bottom:6px;">Turno Atual</div>
        <ul style="list-style:none; padding:0; margin:0; font-family:'Outfit', sans-serif; font-size:0.75rem; color:#fff;">
          ${initiativeOrder.map((id, idx) => `
            <li style="padding:4px 6px; ${idx===initiativeIndex ? 'background:rgba(197,160,89,0.12); border-left:3px solid var(--accent);' : ''}">
              ${id}
            </li>`).join('')}
        </ul>
        <button class="btn btn-primary" style="margin-top:8px; width:100%;" data-action="nextTurn">Próximo Turno</button>
      </div>
    `;
  }
}
