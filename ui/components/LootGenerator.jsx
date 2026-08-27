import { ReactiveComponent } from '../core/ReactiveComponent.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { Dice } from '../../utils/Dice.js';
import { html } from 'htm/preact';
import { signal } from '@preact/signals';

/**
 * LOOT GENERATOR v14.0 — "The Vault"
 * Reactive (Preact+Signals) implementation.
 */
export class LootGenerator extends ReactiveComponent {
  constructor(opts) {
    super(opts);
    
    // Sinais Reativos (Signals)
    this.selectedTier = signal('0-4');
    this.result = signal(null);
    this.showDistribute = signal(false);
    this.selectedPlayers = signal([]);
    this.splitMode = signal('equal'); // 'equal', 'custom'
    this.customAmounts = signal({});

    this._armadinhas = {
      '0-4': [
        { name: 'Dagger', damage: '1d4', type: 'piercing' },
        { name: 'Club', damage: '1d4', type: 'bludgeoning' },
        { name: 'Shortbow', damage: '1d6', type: 'piercing' },
      ],
      '5-10': [
        { name: 'Short Sword', damage: '1d6', type: 'piercing' },
        { name: 'Handaxe', damage: '1d6', type: 'slashing' },
        { name: 'Light Crossbow', damage: '1d8', type: 'piercing' },
      ],
      '11-16': [
        { name: 'Longsword', damage: '1d8', type: 'slashing' },
        { name: 'Warhammer', damage: '1d8', type: 'bludgeoning' },
        { name: 'Battleaxe', damage: '1d8', type: 'slashing' },
      ],
      '17+': [
        { name: 'Greatsword', damage: '2d6', type: 'slashing' },
        { name: 'Maul', damage: '2d6', type: 'bludgeoning' },
        { name: 'Heavy Crossbow', damage: '1d10', type: 'piercing' },
      ],
    };

    this._tables = {
      '0-4': [
        { range: [1, 30], dice: '5d6', coin: 'cp' },
        { range: [31, 60], dice: '4d4', coin: 'sp' },
        { range: [61, 70], dice: '3d6', coin: 'ep' },
        { range: [71, 95], dice: '3d6', coin: 'gp' },
        { range: [96, 100], dice: '1d6', coin: 'pp' },
      ],
      '5-10': [
        { range: [1, 30], dice: '4d6*10', coin: 'cp' },
        { range: [31, 60], dice: '3d6*10', coin: 'sp' },
        { range: [61, 70], dice: '3d6*10', coin: 'ep' },
        { range: [71, 95], dice: '4d10*10', coin: 'gp' },
        { range: [96, 100], dice: '2d6*10', coin: 'gp' },
      ],
      '11-16': [
        { range: [1, 20], dice: '4d6*100', coin: 'sp' },
        { range: [21, 35], dice: '1d6*100', coin: 'ep' },
        { range: [36, 75], dice: '2d10*100', coin: 'gp' },
        { range: [76, 100], dice: '2d10*100', coin: 'gp' },
      ],
      '17+': [
        { range: [1, 15], dice: '2d10*1000', coin: 'ep' },
        { range: [16, 55], dice: '1d6*1000', coin: 'gp' },
        { range: [56, 100], dice: '1d6*1000', coin: 'gp' },
      ],
    };
  }

  close = () => {
    if (this.element && this.element.parentNode) {
      if (this.element.parentNode.parentNode) {
        this.element.parentNode.parentNode.removeChild(this.element.parentNode);
      }
    }
    this.unmount();
  }

  _getSuggestedTier(monsters) {
    if (!monsters?.length) return '0-4';
    const maxCR = Math.max(...monsters.map((m) => parseInt(m.cr) || 0));
    if (maxCR <= 4) return '0-4';
    if (maxCR <= 10) return '5-10';
    if (maxCR <= 16) return '11-16';
    return '17+';
  }

  setTier = (tier) => {
    this.selectedTier.value = tier;
  }

  _rollArmadinhas(tier) {
    const list = this._armadinhas[tier] || [];
    if (!list.length) return [];
    const count = Dice.roll('1d2').total;
    const items = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * list.length);
      items.push(list[idx]);
    }
    return items;
  }

  rollLoot = () => {
    TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/1271/1271-preview.mp3');
    const roll = Dice.roll('1d100').total;
    const tier = this.selectedTier.value;
    const table = this._tables[tier];
    const match = table.find((r) => roll >= r.range[0] && roll <= r.range[1]);

    if (match) {
      const diceParts = match.dice.split('*');
      let total = Dice.roll(diceParts[0]).total;
      if (diceParts[1]) total *= parseInt(diceParts[1]);

      const items = this._rollArmadinhas(tier);
      this.result.value = {
        roll: roll,
        total: total,
        coin: match.coin,
        items: items,
      };
    }
  }

  copyLoot = () => {
    if (!this.result.value) return;
    const text = `💰 Saque: ${this.result.value.total} ${this.result.value.coin}`;
    navigator.clipboard.writeText(text);
    Toast.show('Copiado para a área de transferência!');
  }

  clearResult = () => {
    this.result.value = null;
  }

  openDistribute = () => {
    this.selectedPlayers.value = (this.store.state.players || []).map((p) => p.id);
    this.splitMode.value = 'equal';
    this.customAmounts.value = {};
    this.showDistribute.value = true;
  }

  closeDistribute = () => {
    this.showDistribute.value = false;
  }

  togglePlayerSelection = (id) => {
    if (this.selectedPlayers.value.includes(id)) {
      this.selectedPlayers.value = this.selectedPlayers.value.filter((x) => x !== id);
    } else {
      this.selectedPlayers.value = [...this.selectedPlayers.value, id];
    }
    this.splitMode.value = 'equal'; // Reset on toggle
  }

  updateCustomAmount = (id, amount) => {
    this.splitMode.value = 'custom';
    this.customAmounts.value = { ...this.customAmounts.value, [id]: parseInt(amount) || 0 };
  }

  confirmDistribution = () => {
    const res = this.result.value;
    const players = this.selectedPlayers.value;
    if (!res || players.length === 0) return;

    const coinKey = res.coin.split(',')[0].trim().toLowerCase();
    
    let totalDistributed = 0;
    
    TOME.store.update((s) => {
      s.players.forEach((p) => {
        if (players.includes(p.id)) {
          let amountPerHero = 0;
          if (this.splitMode.value === 'equal') {
            amountPerHero = Math.floor(res.total / players.length);
          } else {
            amountPerHero = this.customAmounts.value[p.id] || 0;
          }
          
          totalDistributed += amountPerHero;

          if (!p.currency) p.currency = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
          const current = parseInt(p.currency[coinKey]) || 0;
          p.currency[coinKey] = current + amountPerHero;
        }
      });
      const names = s.players
        .filter((p) => players.includes(p.id))
        .map((p) => p.name)
        .join(', ');
      if (!s.journalEntries) s.journalEntries = [];
      s.journalEntries.push({
        id: Date.now(),
        timestamp: Date.now(),
        type: 'loot',
        title: 'Tesouro Distribuído',
        content: `O saque de ${res.total} ${coinKey.toUpperCase()} foi dividido entre: ${names}. Foram distribuídos um total de ${totalDistributed} ${coinKey.toUpperCase()}.`,
      });
    });

    const remainder = res.total - totalDistributed;

    Toast.show(`💰 ${totalDistributed} ${coinKey.toUpperCase()} distribuídos para ${players.length} heróis!`);
    if (remainder > 0) Toast.show(`Sobrou ${remainder} ${coinKey.toUpperCase()} no baú.`, 'info');
    else if (remainder < 0) Toast.show(`Aviso: Foram distribuídos ${Math.abs(remainder)} moedas a mais do que existia no baú.`, 'warning');

    this.showDistribute.value = false;
    this.result.value = null;
  }

  distributeItems = () => {
    const res = this.result.value;
    const players = this.selectedPlayers.value;
    if (!res || !res.items || res.items.length === 0 || players.length === 0) return;
    
    TOME.store.update((s) => {
      s.players.forEach((p) => {
        if (players.includes(p.id)) {
          if (!p.inventory) p.inventory = [];
          const cloned = res.items.map((it) => ({ ...it }));
          p.inventory.push(...cloned);
        }
      });
      const names = s.players
        .filter((p) => players.includes(p.id))
        .map((p) => p.name)
        .join(', ');
      if (!s.journalEntries) s.journalEntries = [];
      s.journalEntries.push({
        id: Date.now(),
        timestamp: Date.now(),
        type: 'loot',
        title: 'Armadinhas Distribuídas',
        content: `Armadinhas (${res.items.map((it) => it.name).join(', ')}) foram entregues a: ${names}.`,
      });
    });
    Toast.show(`⚔️ Armadinhas distribuídas para ${players.length} heróis!`);
  }

  // HTM PREACT TEMPLATE
  template() {
    const { monsters, players } = this.store.state;
    const suggestedTier = this._getSuggestedTier(monsters);
    
    // Acesso aos Signals
    const tier = this.selectedTier.value;
    const res = this.result.value;
    const dist = this.showDistribute.value;
    const selectedIds = this.selectedPlayers.value;

    return html`
      <div class="page p-6 w-full max-w-[1100px] mx-auto animate-fadeIn relative loot-generator">
        <div class="absolute top-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div class="card glass-accent relative z-10" style="width:100%; padding:30px; border:1px solid rgba(197,160,89,0.2); background:rgba(15,12,16,0.6); backdrop-filter:blur(10px); border-radius:16px;">
            
            <div class="section-header" style="border-bottom:1px solid rgba(197,160,89,0.3); padding-bottom:15px; margin-bottom:25px;">
                <div>
                    <h2 class="section-title" style="margin:0; font-family:'Cinzel'; color:var(--accent); text-shadow:0 0 10px rgba(197,160,89,0.5);">
                        <i class="fa-solid fa-coins" style="margin-right:12px;"></i> Gerador de Tesouros (Motor Preact)
                    </h2>
                    <p class="section-subtitle" style="margin:4px 0 0 0; font-size:0.8rem; color:var(--text-dim);">Tabelas do Guia do Mestre renderizadas via Virtual DOM.</p>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 380px; gap:30px; align-items:start;">
                <div style="display:flex; flex-direction:column; gap:25px;">
                    <div class="card glass-accent" style="padding:30px; background:rgba(197,160,89,0.02); border:1px solid rgba(197,160,89,0.25); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.6);">
                        <div style="display:flex; align-items:center; gap:10px; background:rgba(197,160,89,0.06); padding:10px 15px; border-radius:30px; border:1px solid rgba(197,160,89,0.15); margin-bottom:20px; width:fit-content;">
                            <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent);"></i>
                            <span style="font-size:0.85rem; color:var(--text-main);">Sugestão da Arena: <strong style="color:var(--accent); font-family:'Cinzel';">ND ${suggestedTier}</strong></span>
                        </div>

                        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin-bottom:25px;">
                            ${Object.keys(this._tables).map((t) => {
                                const active = tier === t;
                                return html`
                                    <button class="btn ${active ? 'btn-primary' : 'btn-ghost'}" 
                                            style="height:auto; padding:15px; border-radius:12px; flex-direction:column; border:1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.08)'}; transition:all 0.2s;"
                                            onClick=${() => this.setTier(t)}>
                                        <span style="font-size:0.6rem; opacity:0.6; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Nível</span>
                                        <span style="font-size:1.3rem; font-weight:900; font-family:'Cinzel';">${t}</span>
                                    </button>
                                `;
                            })}
                        </div>

                        <button class="btn btn-primary btn-block" style="padding:18px; font-size:1.2rem; font-family:'Cinzel'; font-weight:700; letter-spacing:2px; border-radius:12px; box-shadow:0 0 15px rgba(197,160,89,0.3);" onClick=${this.rollLoot}>
                            <i class="fa-solid fa-dice-d20 fa-spin-hover" style="margin-right:12px;"></i> Canalizar Rolagem
                        </button>
                    </div>

                    ${res ? html`
                        <div class="card glass-accent" style="padding:35px; border:2px solid var(--accent); border-radius:16px; text-align:center; animation: scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow:0 0 25px rgba(197,160,89,0.25);">
                            <div style="font-size:0.75rem; color:var(--accent); letter-spacing:2px; font-weight:800; text-transform:uppercase; margin-bottom:15px;">
                                <i class="fa-solid fa-gem"></i> Fortuna Desescoberta (d100: ${res.roll}) <i class="fa-solid fa-gem"></i>
                            </div>
                            <div style="display:flex; justify-content:center; gap:25px; align-items:center; margin-bottom:25px; background:rgba(0,0,0,0.4); padding:20px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                                <i class="fa-solid fa-coins" style="font-size:4rem; color:var(--accent); filter:drop-shadow(0 0 10px rgba(197,160,89,0.6));"></i>
                                <div style="text-align:left;">
                                    <div style="font-size:3.5rem; font-weight:900; color:#fff; line-height:1; font-family:'Cinzel'; text-shadow:0 2px 10px #000;">${res.total}</div>
                                    <div style="font-size:1.2rem; color:var(--accent); font-weight:900; letter-spacing:2px; margin-top:5px;">${res.coin.toUpperCase()}</div>
                                </div>
                            </div>
                            ${res.items && res.items.length ? html`
                            <div style="margin-top:10px; font-size:0.9rem; color:var(--text-main);">
                                <strong>Armadinhas Geradas:</strong>
                                <ul style="list-style:none; padding:0; margin-top:5px;">
                                    ${res.items.map((it) => html`<li>⚔️ ${it.name} (${it.damage} ${it.type})</li>`)}
                                </ul>
                            </div>` : ''}
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top: 20px;">
                                <button class="btn btn-ghost" style="border-radius:10px; padding:12px;" onClick=${this.copyLoot}>
                                    <i class="fa-solid fa-copy" style="margin-right:6px;"></i> Copiar Notas
                                </button>
                                <button class="btn btn-primary" style="border-radius:10px; padding:12px; background:var(--success); border-color:var(--success); box-shadow:0 0 10px rgba(46,204,113,0.3);" onClick=${this.openDistribute}>
                                    <i class="fa-solid fa-hand-holding-dollar" style="margin-right:6px;"></i> Distribuir Saque
                                </button>
                                ${res.items && res.items.length ? html`<button class="btn btn-ghost" style="border-radius:10px; padding:12px;" onClick=${this.distributeItems}>Distribuir Itens</button>` : ''}
                                <button class="btn btn-ghost" style="grid-column: span 2; border-color:rgba(255,255,255,0.1); border-radius:10px; padding:10px; font-size:0.85rem;" onClick=${this.clearResult}>
                                    <i class="fa-solid fa-trash-can" style="margin-right:6px;"></i> Limpar Câmara
                                </button>
                            </div>
                        </div>
                    ` : html`
                        <div class="card glass-accent empty-state" style="height:220px; border-radius:16px; border:1px dashed rgba(255,255,255,0.08); display:flex; flex-direction:column; justify-content:center; align-items:center; opacity:0.4;">
                            <i class="fa-solid fa-dungeon fa-3x" style="margin-bottom:15px; color:var(--accent);"></i>
                            <h4 style="font-family:'Cinzel'; margin:0;">Câmara de Tesouros Selada</h4>
                            <p style="font-size:0.8rem; margin-top:5px;">Aguardando uma rolagem d100...</p>
                        </div>
                    `}
                </div>

                <div class="card glass-accent" style="padding:0; overflow:hidden; border-radius:16px; border:1px solid rgba(197,160,89,0.15);">
                    <div class="card-header" style="background:rgba(197,160,89,0.05); padding:18px 20px; border-bottom:1px solid rgba(197,160,89,0.15); margin:0;">
                        <span class="card-title" style="font-size:0.85rem; font-family:'Cinzel'; color:var(--accent); letter-spacing:1px;">📋 Sorteios (ND ${tier})</span>
                    </div>
                    <div style="padding:20px;">
                        <table style="width:100%; font-size:0.8rem; border-collapse:collapse;">
                            <thead style="color:var(--accent); text-align:left; border-bottom:2px solid rgba(197,160,89,0.25);">
                                <tr>
                                    <th style="padding:10px 5px; font-family:'Cinzel';">Faixa</th>
                                    <th style="padding:10px 5px; font-family:'Cinzel'; text-align:right;">Saque</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this._tables[tier].map((row) => html`
                                    <tr class="tome-hover-row" style="border-bottom:1px solid rgba(255,255,255,0.04);">
                                        <td style="padding:12px 5px; font-weight:800; color:var(--accent);">${row.range[0].toString().padStart(2, '0')}-${row.range[1].toString().padStart(2, '0')}</td>
                                        <td style="padding:12px 5px; text-align:right; font-weight:600; color:var(--text-main);">${row.dice.replace('*', 'x')} <span style="color:var(--accent); font-weight:800;">${row.coin.toUpperCase()}</span></td>
                                    </tr>
                                `)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            ${dist ? html`
                <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(5px); z-index:2000; display:flex; align-items:center; justify-content:center; padding:20px;" onClick=${this.closeDistribute}>
                    <div class="card glass-accent animate-scaleIn" style="max-width:480px; width:100%; padding:30px; border:2px solid var(--accent); border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,0.9);" onClick=${e => e.stopPropagation()}>
                        <div style="text-align:center; margin-bottom:20px;">
                            <i class="fa-solid fa-hand-holding-dollar fa-3x" style="color:var(--accent); margin-bottom:10px;"></i>
                            <h3 style="font-family:'Cinzel'; color:var(--accent); margin:0; font-size:1.8rem;">💰 Distribuir Moedas</h3>
                            <p style="font-size:0.85rem; color:var(--text-dim); margin-top:8px;">
                                Valor a dividir: <b style="color:#fff; font-size:1.1rem;">${res.total} ${res.coin.toUpperCase()}</b>
                            </p>
                        </div>

                        <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:25px; max-height:260px; overflow-y:auto; padding-right:5px;">
                            ${(players || []).map((p) => {
                                const selected = selectedIds.includes(p.id);
                                let displayAmount = 0;
                                if (this.splitMode.value === 'equal') {
                                    displayAmount = selectedIds.length ? Math.floor(res.total / selectedIds.length) : 0;
                                } else {
                                    displayAmount = this.customAmounts.value[p.id] || 0;
                                }

                                return html`
                                    <label style="display:flex; align-items:center; gap:12px; padding:12px 15px; background:${selected ? 'rgba(197,160,89,0.08)' : 'rgba(255,255,255,0.02)'}; border-radius:10px; border:1px solid ${selected ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}; transition:all 0.2s;">
                                        <input type="checkbox" style="width:20px; height:20px; accent-color:var(--accent); cursor:pointer;" 
                                            checked=${selected}
                                            onChange=${() => this.togglePlayerSelection(p.id)} />
                                        <div style="flex:1;">
                                            <div style="font-weight:800; font-size:0.95rem; color:#fff;">${p.name}</div>
                                            <div style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase;">${p.class || 'Aventureiro'}</div>
                                        </div>
                                        ${selected ? html`
                                            <div style="display:flex; align-items:center; gap:5px;">
                                                <input type="number" 
                                                    class="legacy-input" 
                                                    style="width: 80px; text-align: center; font-size: 0.9rem; padding: 5px;" 
                                                    value=${displayAmount}
                                                    onInput=${(e) => this.updateCustomAmount(p.id, e.target.value)}
                                                />
                                                <span style="color:var(--accent); font-weight:900; font-size:0.7rem;">${res.coin.toUpperCase()}</span>
                                            </div>
                                        ` : ''}
                                    </label>
                                `;
                            })}
                        </div>

                        <div style="display:flex; gap:12px;">
                            <button class="btn btn-ghost btn-block" style="border-radius:10px; padding:12px;" onClick=${this.closeDistribute}>Cancelar</button>
                            <button class="btn btn-primary btn-block" style="border-radius:10px; padding:12px; font-weight:800;" onClick=${this.confirmDistribution} disabled=${selectedIds.length === 0}>
                                Confirmar Partilha
                            </button>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
      </div>
    `;
  }
}

