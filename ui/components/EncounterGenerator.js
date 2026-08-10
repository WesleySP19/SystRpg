import { ReactiveComponent } from '../core/ReactiveComponent.js';
import { html } from 'htm/preact';
import { TOME } from '../../core/Registry.js';
import { MonsterData } from '../../data/MonsterData.js';
import { Toast } from './Toast.js';

/**
 * ENCOUNTER GENERATOR v1.0
 * Lê a party atual, calcula o nível médio e sugere encontros aleatórios do MonsterData.
 */
export class EncounterGenerator extends ReactiveComponent {
    constructor(opts) {
        super(opts);
        this._difficulty = 'medium';
        this._generatedMonsters = [];
        this._partyLevel = this._calculatePartyLevel();
    }

    _calculatePartyLevel() {
        const players = this.store.state.players || [];
        if (players.length === 0) return 1;
        const totalLevel = players.reduce((sum, p) => sum + (parseInt(p.level) || 1), 0);
        return Math.max(1, Math.round(totalLevel / players.length));
    }

    _generateEncounter() {
        let targetCR = this._partyLevel;
        if (this._difficulty === 'easy') targetCR = Math.max(1, this._partyLevel - 1);
        if (this._difficulty === 'hard') targetCR = this._partyLevel + 1;
        if (this._difficulty === 'deadly') targetCR = this._partyLevel + 3;

        // Limita ao nivel maximo de monstros disponíveis (20)
        targetCR = Math.min(20, targetCR);
        
        const tierKey = `Nível ${targetCR}`;
        const monsterPool = MonsterData[tierKey] || MonsterData['Nível 1'];
        
        if (!monsterPool || monsterPool.length === 0) {
            Toast.show('Nenhum monstro encontrado para esta dificuldade.', 'error');
            return;
        }

        // Seleciona de 1 a 4 monstros (ou 1 boss) dependendo do nível e party size
        const partySize = Math.max(1, (this.store.state.players || []).length);
        const enemyCount = this._difficulty === 'deadly' ? 1 : Math.max(1, Math.floor(Math.random() * partySize) + 1);

        this._generatedMonsters = [];
        for (let i = 0; i < enemyCount; i++) {
            const randomMonster = monsterPool[Math.floor(Math.random() * monsterPool.length)];
            this._generatedMonsters.push(structuredClone(randomMonster));
        }

        this.render();
    }

    setDifficulty(e, el) {
        this._difficulty = el.dataset.diff;
        this._generateEncounter();
    }

    dispatchEncounter() {
        if (this._generatedMonsters.length === 0) return;

        let spawnCount = 0;
        this._generatedMonsters.forEach(m => {
            const entity = {
                id: 'gen-' + Date.now() + '-' + Math.random(),
                name: m.name,
                hp_max: m.hp,
                hp: m.hp,
                ac: m.ac || 10,
                emoji: m.emoji || '👹',
                size: m.size || 'medium',
                speed: m.speed || '30 ft.',
                type: m.type || 'monster',
                img: m.img || ''
            };
            // Espalha a invocação ligeiramente para animar melhor e evitar lock
            setTimeout(() => {
                TOME.events.emit('MONSTER_INVOKED', entity);
            }, spawnCount * 150);
            spawnCount++;
        });

        setTimeout(() => this.close(), spawnCount * 150 + 200);
    }

    close() {
        this.unmount();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    template() {
        return html`
            <div class="modal-overlay animate-fadeIn" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px);">
                <div class="card glass-accent animate-scaleIn" style="max-width:500px; width:100%; padding:30px; border:2px solid var(--accent); max-height:90vh; overflow-y:auto; background:rgba(15,12,16,0.95);">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(197,160,89,0.3); padding-bottom:15px; margin-bottom:20px;">
                        <div>
                            <h2 style="margin:0; font-family:'Cinzel'; color:var(--accent); font-size:1.5rem;"><i class="fa-solid fa-wand-magic-sparkles"></i> Gerador de Encontros</h2>
                            <span style="font-size:0.75rem; color:var(--text-dim);">Nível Médio do Grupo: ${this._partyLevel}</span>
                        </div>
                        <button class="btn btn-ghost" onClick=${() => this.close()} style="border-radius:50%; width:36px; height:36px; padding:0;"><i class="fa-solid fa-times"></i></button>
                    </div>

                    <div style="display:flex; gap:10px; margin-bottom:25px;">
                        <button class="btn ${this._difficulty === 'easy' ? 'btn-primary' : 'btn-ghost'}" style="flex:1; font-size:0.8rem; padding:8px;" onClick=${(e) => this.setDifficulty(e, e.currentTarget)} data-diff="easy">Fácil</button>
                        <button class="btn ${this._difficulty === 'medium' ? 'btn-primary' : 'btn-ghost'}" style="flex:1; font-size:0.8rem; padding:8px;" onClick=${(e) => this.setDifficulty(e, e.currentTarget)} data-diff="medium">Médio</button>
                        <button class="btn ${this._difficulty === 'hard' ? 'btn-primary' : 'btn-ghost'}" style="flex:1; font-size:0.8rem; padding:8px;" onClick=${(e) => this.setDifficulty(e, e.currentTarget)} data-diff="hard">Difícil</button>
                        <button class="btn ${this._difficulty === 'deadly' ? 'btn-primary' : 'btn-ghost'}" style="flex:1; font-size:0.8rem; padding:8px; background:${this._difficulty === 'deadly' ? 'var(--danger)' : ''}" onClick=${(e) => this.setDifficulty(e, e.currentTarget)} data-diff="deadly">Mortal</button>
                    </div>

                    ${this._generatedMonsters.length > 0 ? html`
                        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:15px; margin-bottom:20px; min-height:150px;">
                            <h4 style="margin:0 0 10px 0; color:var(--text-dim); font-size:0.8rem; text-transform:uppercase;">Inimigos Sorteados:</h4>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                ${this._generatedMonsters.map(m => html`
                                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.5); padding:10px 15px; border-radius:8px; border-left:3px solid var(--accent);">
                                        <div style="display:flex; align-items:center; gap:12px;">
                                            <span style="font-size:1.5rem;">${m.emoji}</span>
                                            <strong style="color:#fff;">${m.name}</strong>
                                        </div>
                                        <div style="text-align:right;">
                                            <div style="font-size:0.75rem; color:var(--text-dim);">HP ${m.hp} | CA ${m.ac}</div>
                                            <div style="font-size:0.7rem; color:var(--danger);">${m.damage} dmg</div>
                                        </div>
                                    </div>
                                `)}
                            </div>
                        </div>
                        <button class="btn btn-premium btn-block" style="padding:15px; font-size:1.1rem; font-family:'Cinzel';" onClick=${() => this.dispatchEncounter()}>
                            <i class="fa-solid fa-swords"></i> Despachar para o Combate
                        </button>
                    ` : html`
                        <div style="text-align:center; padding:40px 20px; color:var(--text-dim);">
                            <i class="fa-solid fa-dice-d20" style="font-size:2.5rem; opacity:0.5; margin-bottom:15px;"></i>
                            <p style="margin:0; font-size:0.9rem;">Selecione uma dificuldade acima para sortear os inimigos.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
}
