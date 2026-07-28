import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { Dice } from '../../utils/Dice.js';

/**
 * LOOT GENERATOR v5.0 — "The Vault"
 * Official DMG Individual Treasure Tables with Combat Integration.
 */
export class LootGenerator extends Component {
  constructor(opts) {
    super(opts);
    this._selectedTier = '0-4';
    this._result = null;
    this._showDistribute = false;
    this._selectedPlayers = [];

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

  template() {
    const { monsters } = this.store.state;
    const suggestedTier = this._getSuggestedTier(monsters);

    return `
            <div class="page" style="max-width: 1200px; padding: 20px; animation: fadeIn 0.4s ease-out;">
                <div class="section-header" style="border-bottom:1px solid rgba(197,160,89,0.3); padding-bottom:20px; margin-bottom:30px;">
                    <div>
                        <h2 class="section-title" style="font-family:'Cinzel'; color:var(--accent); text-shadow:0 0 10px rgba(197,160,89,0.5);">
                            <i class="fa-solid fa-coins" style="margin-right:12px;"></i> Gerador de Tesouros Épico
                        </h2>
                        <p class="section-subtitle" style="color:var(--text-dim);">Tabelas oficiais do Guia do Mestre (DMG) e divisão de riquezas.</p>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 380px; gap:30px; align-items:start;">
                    <div style="display:flex; flex-direction:column; gap:25px;">
                        <div class="card glass-accent" style="padding:30px; background:rgba(197,160,89,0.02); border:1px solid rgba(197,160,89,0.25); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.6);">
                            <div style="display:flex; align-items:center; gap:10px; background:rgba(197,160,89,0.06); padding:10px 15px; border-radius:30px; border:1px solid rgba(197,160,89,0.15); margin-bottom:20px; width:fit-content;">
                                <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent);"></i>
                                <span style="font-size:0.85rem; color:var(--text-main);">Sugestão Baseada na Arena: <strong style="color:var(--accent); font-family:'Cinzel';">ND ${suggestedTier}</strong></span>
                            </div>

                            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin-bottom:25px;">
                                ${Object.keys(this._tables)
                                  .map((tier) => {
                                    const active = this._selectedTier === tier;
                                    return `
                                        <button class="btn ${active ? 'btn-primary' : 'btn-ghost'}" 
                                                style="height:auto; padding:15px; border-radius:12px; flex-direction:column; border:1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.08)'}; transition:all 0.2s;"
                                                data-action="setTier" data-tier="${tier}">
                                            <span style="font-size:0.6rem; opacity:0.6; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">Nível de Desafio</span>
                                            <span style="font-size:1.3rem; font-weight:900; font-family:'Cinzel';">${tier}</span>
                                        </button>
                                    `;
                                  })
                                  .join('')}
                            </div>

                            <button class="btn btn-primary btn-block" style="padding:18px; font-size:1.2rem; font-family:'Cinzel'; font-weight:700; letter-spacing:2px; border-radius:12px; box-shadow:0 0 15px rgba(197,160,89,0.3);" data-action="rollLoot">
                                <i class="fa-solid fa-dice-d20 fa-spin-hover" style="margin-right:12px;"></i> Canalizar Rolagem d100
                            </button>
                        </div>

                        ${
                          this._result
                            ? this._renderResult()
                            : `
                            <div class="card glass-accent empty-state" style="height:220px; border-radius:16px; border:1px dashed rgba(255,255,255,0.08); display:flex; flex-direction:column; justify-content:center; align-items:center; opacity:0.4;">
                                <i class="fa-solid fa-dungeon fa-3x" style="margin-bottom:15px; color:var(--accent);"></i>
                                <h4 style="font-family:'Cinzel'; margin:0;">Câmara de Tesouros Selada</h4>
                                <p style="font-size:0.8rem; margin-top:5px;">Aguardando uma rolagem d100...</p>
                            </div>
                        `
                        }
                    </div>

                    <div class="card glass-accent" style="padding:0; overflow:hidden; border-radius:16px; border:1px solid rgba(197,160,89,0.15);">
                        <div class="card-header" style="background:rgba(197,160,89,0.05); padding:18px 20px; border-bottom:1px solid rgba(197,160,89,0.15); margin:0;">
                            <span class="card-title" style="font-size:0.85rem; font-family:'Cinzel'; color:var(--accent); letter-spacing:1px;">📋 Tabela de Sorteios (ND ${this._selectedTier})</span>
                        </div>
                        <div style="padding:20px;">
                            <table style="width:100%; font-size:0.8rem; border-collapse:collapse;">
                                <thead style="color:var(--accent); text-align:left; border-bottom:2px solid rgba(197,160,89,0.25);">
                                    <tr>
                                        <th style="padding:10px 5px; font-family:'Cinzel';">Faixa d100</th>
                                        <th style="padding:10px 5px; font-family:'Cinzel'; text-align:right;">Saque Esperado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this._tables[this._selectedTier]
                                      .map(
                                        (row) => `
                                        <tr style="border-bottom:1px solid rgba(255,255,255,0.04); transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                                            <td style="padding:12px 5px; font-weight:800; color:var(--accent);">${row.range[0].toString().padStart(2, '0')}-${row.range[1].toString().padStart(2, '0')}</td>
                                            <td style="padding:12px 5px; text-align:right; font-weight:600; color:var(--text-main);">${row.dice.replace('*', 'x')} <span style="color:var(--accent); font-weight:800;">${row.coin.toUpperCase()}</span></td>
                                        </tr>
                                    `,
                                      )
                                      .join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                ${this._showDistribute ? this._renderDistributeModal() : ''}
            </div>
        `;
  }

  _renderResult() {
    return `
            <div class="card glass-accent" style="padding:35px; border:2px solid var(--accent); border-radius:16px; text-align:center; animation: scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow:0 0 25px rgba(197,160,89,0.25);">
                <div style="font-size:0.75rem; color:var(--accent); letter-spacing:2px; font-weight:800; text-transform:uppercase; margin-bottom:15px;">
                    <i class="fa-solid fa-gem"></i> Fortuna Desescoberta (d100: ${this._result.roll}) <i class="fa-solid fa-gem"></i>
                </div>
                <div style="display:flex; justify-content:center; gap:25px; align-items:center; margin-bottom:25px; background:rgba(0,0,0,0.4); padding:20px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                    <i class="fa-solid fa-coins" style="font-size:4rem; color:var(--accent); filter:drop-shadow(0 0 10px rgba(197,160,89,0.6));"></i>
                    <div style="text-align:left;">
                        <div style="font-size:3.5rem; font-weight:900; color:#fff; line-height:1; font-family:'Cinzel'; text-shadow:0 2px 10px #000;">${this._result.total}</div>
                        <div style="font-size:1.2rem; color:var(--accent); font-weight:900; letter-spacing:2px; margin-top:5px;">${this._result.coin.toUpperCase()}</div>
                    </div>
                </div>
                ${
                  this._result.items && this._result.items.length
                    ? `
                <div style="margin-top:10px; font-size:0.9rem; color:var(--text-main);">
                    <strong>Armadinhas Geradas:</strong>
                    <ul style="list-style:none; padding:0; margin-top:5px;">
                        ${this._result.items.map((it) => `<li>⚔️ ${it.name} (${it.damage} ${it.type})</li>`).join('')}
                    </ul>
                </div>`
                    : ''
                }
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                    <button class="btn btn-ghost" style="border-radius:10px; padding:12px;" data-action="copyLoot">
                        <i class="fa-solid fa-copy" style="margin-right:6px;"></i> Copiar Notas
                    </button>
                    <button class="btn btn-primary" style="border-radius:10px; padding:12px; background:var(--success); border-color:var(--success); box-shadow:0 0 10px rgba(46,204,113,0.3);" data-action="openDistribute">
                        <i class="fa-solid fa-hand-holding-dollar" style="margin-right:6px;"></i> Distribuir Saque
                    </button>
                    ${this._result.items && this._result.items.length ? `<button class="btn btn-ghost" style="border-radius:10px; padding:12px;" data-action="distributeItems">Distribuir Itens</button>` : ''}
                    <button class="btn btn-ghost" style="grid-column: span 2; border-color:rgba(255,255,255,0.1); border-radius:10px; padding:10px; font-size:0.85rem;" data-action="clearResult">
                        <i class="fa-solid fa-trash-can" style="margin-right:6px;"></i> Limpar Câmara
                    </button>
                </div>
            </div>
        `;
  }

  _renderDistributeModal() {
    const { players } = this.store.state;
    return `
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(5px); z-index:2000; display:flex; align-items:center; justify-content:center; padding:20px;" onclick="this.closest('.loot-generator').__component.closeDistribute()">
                <div class="card glass-accent animate-scaleIn" style="max-width:480px; width:100%; padding:30px; border:2px solid var(--accent); border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,0.9);" onclick="event.stopPropagation()">
                    <div style="text-align:center; margin-bottom:20px;">
                        <i class="fa-solid fa-hand-holding-dollar fa-3x" style="color:var(--accent); margin-bottom:10px;"></i>
                        <h3 style="font-family:'Cinzel'; color:var(--accent); margin:0; font-size:1.8rem;">💰 Distribuir Moedas</h3>
                        <p style="font-size:0.85rem; color:var(--text-dim); margin-top:8px;">
                            Valor a dividir: <b style="color:#fff; font-size:1.1rem;">${this._result.total} ${this._result.coin.toUpperCase()}</b>
                        </p>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:25px; max-height:260px; overflow-y:auto; padding-right:5px;">
                        ${(players || [])
                          .map((p) => {
                            const selected = this._selectedPlayers.includes(
                              p.id,
                            );
                            return `
                                <label style="display:flex; align-items:center; gap:12px; padding:12px 15px; background:${selected ? 'rgba(197,160,89,0.08)' : 'rgba(255,255,255,0.02)'}; border-radius:10px; cursor:pointer; border:1px solid ${selected ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}; transition:all 0.2s;"
                                       onmouseover="this.style.borderColor='var(--accent)'"
                                       onmouseout="this.style.borderColor='${selected ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}'">
                                    <input type="checkbox" style="width:20px; height:20px; accent-color:var(--accent); cursor:pointer;" 
                                           ${selected ? 'checked' : ''}
                                           onchange="this.closest('.loot-generator').__component.togglePlayerSelection('${p.id}')">
                                    <div style="flex:1;">
                                        <div style="font-weight:800; font-size:0.95rem; color:#fff;">${p.name}</div>
                                        <div style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase;">${p.class || 'Aventureiro'}</div>
                                    </div>
                                </label>
                            `;
                          })
                          .join('')}
                    </div>

                    <div style="display:flex; gap:12px;">
                        <button class="btn btn-ghost btn-block" style="border-radius:10px; padding:12px;" onclick="this.closest('.loot-generator').__component.closeDistribute()">Cancelar</button>
                        <button class="btn btn-primary btn-block" style="border-radius:10px; padding:12px; font-weight:800;" data-action="confirmDistribution" ${this._selectedPlayers.length === 0 ? 'disabled' : ''}>
                            Confirmar Partilha
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  openDistribute() {
    this._selectedPlayers = (this.store.state.players || []).map((p) => p.id);
    this._showDistribute = true;
    this.render();
  }

  closeDistribute() {
    this._showDistribute = false;
    this.render();
  }

  togglePlayerSelection(id) {
    if (this._selectedPlayers.includes(id))
      this._selectedPlayers = this._selectedPlayers.filter((x) => x !== id);
    else this._selectedPlayers.push(id);
    this.render();
  }

  confirmDistribution() {
    if (!this._result || this._selectedPlayers.length === 0) return;

    const rawCoin = this._result.coin;
    const coinKey = rawCoin.split(',')[0].trim().toLowerCase();

    const amountPerHero = Math.floor(
      this._result.total / this._selectedPlayers.length,
    );
    const remainder = this._result.total % this._selectedPlayers.length;

    TOME.store.update((s) => {
      s.players.forEach((p) => {
        if (this._selectedPlayers.includes(p.id)) {
          if (!p.currency) p.currency = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
          const current = parseInt(p.currency[coinKey]) || 0;
          p.currency[coinKey] = current + amountPerHero;
        }
      });
      const names = s.players
        .filter((p) => this._selectedPlayers.includes(p.id))
        .map((p) => p.name)
        .join(', ');
      if (!s.journalEntries) s.journalEntries = [];
      s.journalEntries.push({
        id: Date.now(),
        timestamp: Date.now(),
        type: 'loot',
        title: 'Tesouro Distribuído',
        content: `O saque de ${this._result.total} ${coinKey.toUpperCase()} foi dividido entre: ${names}. Cada herói recebeu ${amountPerHero} ${coinKey.toUpperCase()}.`,
      });
    });

    Toast.show(
      `💰 ${amountPerHero} ${coinKey.toUpperCase()} distribuídos para ${this._selectedPlayers.length} heróis!`,
    );
    if (remainder > 0)
      Toast.show(
        `Sobrou ${remainder} ${coinKey.toUpperCase()} no baú.`,
        'info',
      );

    this._showDistribute = false;
    this._result = null;
    this.render();
  }

  distributeItems() {
    if (
      !this._result ||
      !this._result.items ||
      this._result.items.length === 0 ||
      this._selectedPlayers.length === 0
    )
      return;
    TOME.store.update((s) => {
      s.players.forEach((p) => {
        if (this._selectedPlayers.includes(p.id)) {
          if (!p.inventory) p.inventory = [];
          const cloned = this._result.items.map((it) => ({ ...it }));
          p.inventory.push(...cloned);
        }
      });
      const names = s.players
        .filter((p) => this._selectedPlayers.includes(p.id))
        .map((p) => p.name)
        .join(', ');
      if (!s.journalEntries) s.journalEntries = [];
      s.journalEntries.push({
        id: Date.now(),
        timestamp: Date.now(),
        type: 'loot',
        title: 'Armadinhas Distribuídas',
        content: `Armadinhas (${this._result.items.map((it) => it.name).join(', ')}) foram entregues a: ${names}.`,
      });
    });
    Toast.show(
      `⚔️ Armadinhas distribuídas para ${this._selectedPlayers.length} heróis!`,
    );
    this.render();
  }

  _getSuggestedTier(monsters) {
    if (!monsters?.length) return '0-4';
    const maxCR = Math.max(...monsters.map((m) => parseInt(m.cr) || 0));
    if (maxCR <= 4) return '0-4';
    if (maxCR <= 10) return '5-10';
    if (maxCR <= 16) return '11-16';
    return '17+';
  }

  setTier(e, el) {
    this._selectedTier = el.dataset.tier;
    this.render();
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

  rollLoot() {
    TOME.audio.playSFX(
      'https://assets.mixkit.co/active_storage/sfx/1271/1271-preview.mp3',
    );
    const roll = Dice.roll('1d100').total;
    const table = this._tables[this._selectedTier];
    const match = table.find((r) => roll >= r.range[0] && roll <= r.range[1]);

    if (match) {
      const diceParts = match.dice.split('*');
      let total = Dice.roll(diceParts[0]).total;
      if (diceParts[1]) total *= parseInt(diceParts[1]);

      const items = this._rollArmadinhas(this._selectedTier);
      this._result = {
        roll: roll,
        total: total,
        coin: match.coin,
        items: items,
      };
      this.render();
    }
  }

  copyLoot() {
    if (!this._result) return;
    const text = `💰 Saque: ${this._result.total} ${this._result.coin}`;
    navigator.clipboard.writeText(text);
    Toast.show('Copiado para a área de transferência!');
  }

  clearResult() {
    this._result = null;
    this.render();
  }
}
