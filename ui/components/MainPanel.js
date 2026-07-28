// MainPanel component – cinematic UI with hero image and particle effect
import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import ParticleEngine from '../utils/ParticleEngine.js';
// CSS is loaded via a <link> tag in the template

/**
 * MainPanel renders a premium visual panel with:
 *  - Dark translucent overlay with backdrop blur
 *  - Hero image that breaks the top border (out‑of‑bounds effect)
 *  - Canvas‑based particle animation for ambience
 */
export class MainPanel extends Component {
  constructor(opts) {
    super(opts);
    this._particleEngine = null;
  }

  template() {
    return `
<link rel="stylesheet" href="ui/components/main-panel.css">

      <div class="panel-overlay">
        <canvas class="particles-canvas" id="particleCanvas"></canvas>
        <img class="character-hero" src="${this._heroImageUrl()}" alt="Hero" />
        <div class="panel-content">
          <h1 class="panel-title">Bem‑vindo ao Mundo</h1>
          <p class="panel-subtitle">Sua aventura começa aqui.</p>
        </div>
      </div>
    `;
  }

  // Resolve hero image URL from store or fallback placeholder
  _heroImageUrl() {
    const url = this.store?.state?.heroImage;
    return url || 'assets/placeholder-hero.png';
  }

  async onMount() {
    // Initialize particle engine on the canvas
    const canvas = this.$('#particleCanvas');
    if (canvas) {
      this._particleEngine = new ParticleEngine(canvas, {
        density: 80,
        depthRange: [1, 4]
      });
      this._particleEngine.start();
    }
  }

  onUnmount() {
    if (this._particleEngine) {
      this._particleEngine.stop();
      this._particleEngine = null;
    }
  }
}
