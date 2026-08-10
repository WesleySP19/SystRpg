// MainPanel component – cinematic UI with hero image and particle effect
import { Component } from '../core/Component.js';
import { html } from 'htm/preact';
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
    return html`
      <div class="panel-overlay">
        <link rel="stylesheet" href="ui/components/main-panel.css" />
        <canvas class="particles-canvas" id="particleCanvas"></canvas>
        <img class="character-hero" src="${this._heroImageUrl()}" alt="Hero" />
      </div>
    `;
  }

  // Resolve hero image URL from store or fallback placeholder
  _heroImageUrl() {
    const url = this.store?.state?.heroImage;
    return url || 'assets/logo.png';
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

    if (TOME?.events) {
        this._slainListener = () => {
            if (this._particleEngine && this.element) {
                const rect = this.element.getBoundingClientRect();
                this._particleEngine.explosion({
                    x: rect.width / 2, 
                    y: rect.height / 2, 
                    color: '239,68,68', // Sangue / Escarlate
                    count: 350, 
                    speed: 18 
                });
            }
        };
        
        this._fallenListener = () => {
            if (this._particleEngine && this.element) {
                const rect = this.element.getBoundingClientRect();
                this._particleEngine.explosion({
                    x: rect.width / 2, 
                    y: rect.height / 2, 
                    color: '229,193,123', // Ouro Frio / Cinzas Arcanas
                    count: 400, 
                    speed: 25 
                });
            }
        };

        TOME.events.on('ENTITY_SLAIN', this._slainListener);
        TOME.events.on('HERO_FALLEN', this._fallenListener);
    }
  }

  onUnmount() {
    if (this._particleEngine) {
      this._particleEngine.stop();
      this._particleEngine = null;
    }
    if (TOME?.events) {
        if (this._slainListener) TOME.events.off('ENTITY_SLAIN', this._slainListener);
        if (this._fallenListener) TOME.events.off('HERO_FALLEN', this._fallenListener);
    }
  }
}
