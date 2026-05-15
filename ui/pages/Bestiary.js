import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { MonsterData } from '../../data/MonsterData.js';
import { Toast } from '../components/Toast.js';

/**
 * BESTIARY / BESTIÁRIO ARCANO v6.0
 * Complete creature library with sprite cards, level filters (1–20 + BOSS),
 * and detailed stat sheets.
 */
export class Bestiary extends Component {
    constructor(opts) {
        super(opts);
        this._selectedId = null;
        this._selectedLevel = 'Nível 1';
        this._searchQuery = '';
        this._viewMode = 'grid'; // 'grid' | 'detail'
        this._selectedCreature = null;
    }

    template() {
        const levels = Object.keys(MonsterData);
        const allCreatures = MonsterData[this._selectedLevel] || [];
        const filtered = allCreatures.filter(m =>
            m.name.toLowerCase().includes(this._searchQuery.toLowerCase())
        );
        const isBoss = this._selectedLevel === 'BOSS';

        return `
            <div class="page bestiary animate-fadeIn" style="max-width:1400px;">
                <!-- HEADER -->
                <div class="section-header" style="flex-wrap:wrap; gap:15px;">
                    <div>
                        <h2 class="section-title">📚 Bestiário Arcano</h2>
                        <p class="section-subtitle">Biblioteca completa de criaturas e ameaças — Selecione por nível.</p>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="text" class="form-input" placeholder="Buscar criatura..." value="${this._searchQuery}"
                               style="min-width:200px;"
                               oninput="this.closest('.bestiary').__component._doSearch(this.value)">
                        <button class="btn btn-primary" data-action="addCustomMonster">
                            <i class="fa-solid fa-plus"></i> Novo Monstro
                        </button>
                    </div>
                </div>

                <!-- LEVEL FILTER BAR -->
                <div class="level-filter-bar">
                    <div class="level-filter-scroll">
                        ${levels.map(lvl => {
                            const isActive = this._selectedLevel === lvl;
                            const isBossTab = lvl === 'BOSS';
                            return `
                                <button class="level-tab ${isActive ? 'active' : ''} ${isBossTab ? 'boss-tab' : ''}"
                                        data-action="selectLevel" data-level="${lvl}">
                                    ${isBossTab ? '<i class="fa-solid fa-skull-crossbones" style="margin-right:4px;"></i>' : ''}
                                    ${lvl}
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- MAIN CONTENT -->
                ${this._selectedCreature ? this._renderDetailView(this._selectedCreature, isBoss) : this._renderGridView(filtered, isBoss)}
            </div>
        `;
    }

    /* ── Grid View ─────────────────────────────────────────────── */
    _renderGridView(creatures, isBoss) {
        if (creatures.length === 0) {
            return `
                <div class="empty-state" style="min-height:50vh;">
                    <i class="fa-solid fa-dragon"></i>
                    <h3>Nenhuma criatura encontrada</h3>
                    <p>Tente outro nível ou busca.</p>
                </div>
            `;
        }

        return `
            <div class="creature-grid ${isBoss ? 'boss-grid' : ''}">
                ${creatures.map((m, i) => this._renderCreatureCard(m, i, isBoss)).join('')}
            </div>
        `;
    }

    _renderCreatureCard(m, index, isBoss) {
        const hasImage = !!m.img;
        const delay = index * 0.06;

        return `
            <div class="creature-card ${isBoss ? 'boss-card' : ''}"
                 style="animation-delay:${delay}s;"
                 data-action="viewCreature" data-index="${index}">

                <!-- Sprite Area -->
                <div class="creature-sprite ${isBoss ? 'boss-sprite' : ''}">
                    ${hasImage
                        ? `<img src="${m.img}" alt="${m.name}" class="creature-sprite-img" />`
                        : `<span class="creature-emoji">${m.emoji || '🐾'}</span>`
                    }
                    ${isBoss ? '<div class="boss-crown">👑</div>' : ''}
                </div>

                <!-- Info -->
                <div class="creature-card-info">
                    <h4 class="creature-name">${m.name}</h4>
                    <span class="creature-type">${m.type}</span>
                    <div class="creature-stats-mini">
                        <div class="mini-stat">
                            <span class="mini-label">CA</span>
                            <span class="mini-value">${m.ac}</span>
                        </div>
                        <div class="mini-stat">
                            <span class="mini-label">HP</span>
                            <span class="mini-value hp-color">${m.hp}</span>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="creature-card-actions">
                    <button class="creature-action-btn add-btn" data-action="spawnCreature" data-index="${index}" title="Adicionar à Campanha">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /* ── Detail View (Monster Sheet) ────────────────────────── */
    _renderDetailView(m, isBoss) {
        const stats = m.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        const actions = m.actions || [];
        const hasImage = !!m.img;

        const statNames = { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };

        return `
            <div class="creature-detail-view animate-fadeIn">
                <!-- Back Button -->
                <button class="btn btn-ghost" style="margin-bottom:20px;" data-action="backToGrid">
                    <i class="fa-solid fa-arrow-left"></i> Voltar ao Bestiário
                </button>

                <div class="creature-detail-layout">
                    <!-- Left: Image + Stats -->
                    <div class="creature-detail-left">
                        <!-- Header with Image -->
                        <div class="creature-detail-header ${isBoss ? 'boss-detail-header' : ''}">
                            <div class="creature-detail-sprite">
                                ${hasImage
                                    ? `<img src="${m.img}" alt="${m.name}" class="detail-sprite-img" />`
                                    : `<span class="detail-sprite-emoji">${m.emoji || '🐾'}</span>`
                                }
                            </div>
                            <div class="creature-detail-title">
                                <h2 style="font-family:'Cinzel'; font-size:2rem; margin:0;">${m.name}</h2>
                                <div style="display:flex; gap:8px; margin-top:10px;">
                                    <span class="badge badge-danger" style="padding:4px 12px;">${this._selectedLevel}</span>
                                    <span class="badge badge-info" style="padding:4px 12px;">${m.type}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Core Stats -->
                        <div class="creature-core-stats">
                            <div class="core-stat-box">
                                <div class="core-stat-label">Defesa (AC)</div>
                                <div class="core-stat-value">${m.ac}</div>
                            </div>
                            <div class="core-stat-box hp-box">
                                <div class="core-stat-label" style="color:var(--success);">Vigor (HP)</div>
                                <div class="core-stat-value">${m.hp}</div>
                            </div>
                        </div>

                        <!-- Attributes -->
                        <div class="creature-attributes">
                            ${Object.entries(stats).map(([k, v]) => `
                                <div class="creature-attr">
                                    <div class="attr-label">${statNames[k] || k.toUpperCase()}</div>
                                    <div class="attr-value">${v}</div>
                                    <div class="attr-mod">${Math.floor((v-10)/2) >= 0 ? '+' : ''}${Math.floor((v-10)/2)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Right: Actions -->
                    <div class="creature-detail-right">
                        <h3 style="color:var(--accent); font-family:'Cinzel'; border-bottom:2px solid var(--accent); padding-bottom:10px; margin-bottom:20px;">Ações de Combate</h3>
                        <div style="display:flex; flex-direction:column; gap:15px;">
                            ${actions.map(a => `
                                <div class="action-card">
                                    <div class="action-name">${a.name}</div>
                                    <p class="action-desc">
                                        ${a.desc || `Bônus: +${a.bonus || 0} | Dano: ${a.damage || '---'}`}
                                    </p>
                                </div>
                            `).join('')}
                            ${actions.length === 0 ? '<p style="opacity:0.4; font-style:italic;">Nenhuma ação registrada para esta criatura.</p>' : ''}
                        </div>

                        <!-- Spawn Button -->
                        <button class="btn btn-primary btn-block spawn-btn" style="margin-top:30px; padding:15px;" data-action="spawnFromDetail">
                            <i class="fa-solid fa-plus" style="margin-right:8px;"></i>
                            INVOCAR NA CAMPANHA
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /* ── Actions ───────────────────────────────────────────────── */
    selectLevel(e, el) {
        this._selectedLevel = el.dataset.level;
        this._selectedCreature = null;
        this._searchQuery = '';
        this.render();
    }

    viewCreature(e, el) {
        // Don't trigger if clicking a child action button
        if (el.closest('.creature-action-btn')) return;
        const idx = parseInt(el.dataset.index || el.closest('[data-index]')?.dataset.index);
        const creatures = MonsterData[this._selectedLevel] || [];
        if (creatures[idx]) {
            this._selectedCreature = creatures[idx];
            this.render();
        }
    }

    backToGrid() {
        this._selectedCreature = null;
        this.render();
    }

    spawnCreature(e, el) {
        e.stopPropagation();
        const idx = parseInt(el.dataset.index || el.closest('[data-index]')?.dataset.index);
        const creatures = MonsterData[this._selectedLevel] || [];
        const m = creatures[idx];
        if (m) this._addToStore(m);
    }

    spawnFromDetail() {
        if (this._selectedCreature) {
            this._addToStore(this._selectedCreature);
        }
    }

    _addToStore(m) {
        TOME.store.update(s => {
            const newMonster = {
                ...m,
                id: 'm-' + Date.now(),
                cr: this._selectedLevel.replace('Nível ', ''),
                hp_max: m.hp,
                hp: { current: m.hp, max: m.hp },
                originalData: { ...m, cr: this._selectedLevel }
            };
            s.monsters = [...(s.monsters || []), newMonster];
        });
        Toast.show(`${m.name} invocado na campanha!`, 'success');
    }

    addCustomMonster() {
        // Navigate to the MonsterForm page
        TOME.store.update(s => s.activeTab = 'MonsterForm');
    }

    _doSearch(val) {
        this._searchQuery = val;
        this.render();
    }

    search(val) {
        this._searchQuery = val;
        this.render();
    }

    select(id) {
        this._selectedId = id;
        this.render();
    }

    onMount() {
        // Set __component reference for inline event handlers
        const el = this.element?.querySelector('.bestiary');
        if (el) el.__component = this;
    }
}
