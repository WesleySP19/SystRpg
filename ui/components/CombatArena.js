import { Component } from '../core/Component.js';
import { TokenOverlay } from './TokenOverlay.js';
import { TurnTracker } from './TurnTracker.js';
import { combat } from '../../utils/combat.js';

/**
 * CombatArena - Container principal da arena tática em modo combate.
 * Renderiza o canvas do mapa, os tokens com overlay de vida/status e o HUD de combate.
 */
export class CombatArena extends Component {
  constructor(opts) {
    super(opts);
    // Espera receber o manager via options para acessar estado compartilhado
    this.mapManager = opts.mapManager; // referência ao MapManager
  }

  /**
   * Inicializa a arena quando o combate começa.
   * Calcula a ordem de iniciativa e guarda no store.
   */
  initCombat() {
    const tokens = this.mapManager._tokens.getAllTokens();
    const order = combat.startCombat(tokens);
    this.store.setState({ initiativeOrder: order, initiativeIndex: 0, combatActive: true });
  }

  /**
   * Avança para o próximo turno.
   */
  nextTurn() {
    const { initiativeOrder, initiativeIndex } = this.store.state;
    const nextIdx = (initiativeIndex + 1) % initiativeOrder.length;
    this.store.setState({ initiativeIndex: nextIdx });
    combat.nextTurn();
  }

  template() {
    const { combatActive, initiativeOrder = [], initiativeIndex = 0 } = this.store.state;
    const currentId = initiativeOrder[initiativeIndex];
    const tokens = this.mapManager._tokens.getAllTokens();
    const tokenHtml = tokens.map(t => {
      const isActive = t.id === currentId;
      return `<${TokenOverlay.name} token={${JSON.stringify(t)}} isActive={${isActive}} />`;
    }).join('');
    return `
      <div class="combat-arena">
        <div class="canvas-wrapper">
          ${this.mapManager._renderCanvas()}
        </div>
        <div class="tokens-layer">
          ${tokenHtml}
        </div>
        ${combatActive ? `<${TurnTracker.name} />` : ''}
      </div>
    `;
  }
}
