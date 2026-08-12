import { ReactiveComponent } from '../core/ReactiveComponent.js';
import { html } from 'htm/preact';
import spellsData from '../../data/spells-5e.js';

/**
 * SPELLBOOK v2.0 — "O Grimório"
 * Referência completa de magias e truques D&D 5e com busca e filtros.
 * Otimizado para o Mestre: Abas separadas de Truques e Magias, vinculo de jogadores, reatividade instantânea.
 */
export class SpellBook extends ReactiveComponent {
    constructor(opts) {
        super(opts);
        this._searchQuery = '';
        this._filterClass = 'all';
        this._filterType = 'all';
        this._filterLevel = 'all';
        this._activeSpellTab = 'spells'; // 'spells' ou 'cantrips'
        this._allSpells = this._buildSpellIndex();
        this._filtered = [...this._allSpells];

        // Pre-select spell if selectedSpellId is set in store state
        this._selectedSpell = null;
        const preselectedId = opts.store?.state?.selectedSpellId;
        if (preselectedId) {
            this._selectedSpell = this._allSpells.find(s => s.id === preselectedId);
            // clear it so it doesn't stay selected forever
            opts.store.update(s => s.selectedSpellId = null);
        }

        // Grimório Interativo - Estados de Pop-up
        this._hoverTimer = null;
        this._activePopupSpell = null;
        this._popupMode = null; // 'hover' ou 'click'
        this._popupPosition = { x: 0, y: 0 };
    }

    _buildSpellIndex() {
        const index = [];

        // Adiciona todos os truques (cantrips)
        spellsData.cantrips?.forEach(cantrip => {
            index.push({
                ...cantrip,
                level: 0,
                sortKey: `0_${cantrip.name}`
            });
        });

        // Adiciona todas as magias por nível
        Object.entries(spellsData.spellsByLevel || {}).forEach(([level, spells]) => {
            spells?.forEach(spell => {
                index.push({
                    ...spell,
                    sortKey: `${spell.level}_${spell.name}`
                });
            });
        });

        return index.sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return a.name.localeCompare(b.name);
        });
    }

    onMount() {
        // Vincula ouvintes de mouseover/mouseleave para o gatilho "Pausa/Hover"
        const cards = this.$$('.spell-card');
        cards.forEach(card => {
            const spellId = card.dataset.spellId;
            const spell = this._allSpells.find(s => s.id === spellId);
            if (!spell) return;

            this.listen(card, 'mouseenter', () => {
                if (this._popupMode === 'click') return; // Se fixado por clique, ignora hover

                // Inicia temporizador de pausa (1 segundo)
                this._hoverTimer = setTimeout(() => {
                    this._playMagicWhisperSound();
                    
                    this._activePopupSpell = spell;
                    this._popupMode = 'hover';
                    
                    // Calcula posicionamento dinâmico premium
                    const rect = card.getBoundingClientRect();
                    let x = rect.right + 12;
                    if (x + 380 > window.innerWidth) {
                        x = rect.left - 392;
                    }
                    if (x < 10) x = 10;
                    
                    let y = rect.top;
                    if (y + 350 > window.innerHeight) {
                        y = window.innerHeight - 360;
                    }
                    if (y < 10) y = 10;
                    
                    this._popupPosition = { x, y };
                    this.render();
                }, 1000);
            });

            this.listen(card, 'mouseleave', () => {
                if (this._hoverTimer) {
                    clearTimeout(this._hoverTimer);
                    this._hoverTimer = null;
                }
                if (this._popupMode === 'hover') {
                    this._activePopupSpell = null;
                    this._popupMode = null;
                    this.render();
                }
            });
        });

        // Fecha pop-up ao clicar fora
        this.listen(document, 'mousedown', (e) => {
            if (this._popupMode === 'click') {
                const popupEl = this.$('.magic-popup');
                if (popupEl && !popupEl.contains(e.target)) {
                    // Verifica se o clique foi em outro card para evitar duplo disparo
                    const clickedCard = e.target.closest('.spell-card');
                    if (!clickedCard) {
                        this._activePopupSpell = null;
                        this._popupMode = null;
                        this.render();
                    }
                }
            }
        });

        // --- BIND REATIVIDADE DE INPUTS E FILTROS ---
        const searchInput = this.$('input[data-action="search"]');
        if (searchInput) {
            this.listen(searchInput, 'input', (e) => {
                this._searchQuery = e.target.value;
                this._applyFilters();
                this._updateSpellListUI(); // Atualiza apenas a lista para manter foco
            });
        }

        const classFilter = this.$('select[data-action="filterClass"]');
        if (classFilter) {
            this.listen(classFilter, 'change', (e) => {
                this._filterClass = e.target.value;
                this.render();
            });
        }

        const typeFilter = this.$('select[data-action="filterType"]');
        if (typeFilter) {
            this.listen(typeFilter, 'change', (e) => {
                this._filterType = e.target.value;
                this.render();
            });
        }

        const levelFilter = this.$('select[data-action="filterLevel"]');
        if (levelFilter) {
            this.listen(levelFilter, 'change', (e) => {
                this._filterLevel = e.target.value;
                this.render();
            });
        }

        // Bind abas superiores
        const tabBtns = this.$$('.spell-tab-btn');
        tabBtns.forEach(btn => {
            this.listen(btn, 'click', (e) => {
                this._activeSpellTab = btn.dataset.tab;
                this._selectedSpell = null;
                this._filterLevel = 'all';
                this.render();
            });
        });
    }

    onUnmount() {
        if (this._hoverTimer) {
            clearTimeout(this._hoverTimer);
        }
    }

    _playMagicWhisperSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(392, ctx.currentTime); // Sol
            osc1.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.4); // Sol oitava
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(493.88, ctx.currentTime); // Si
            osc2.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.5);
            
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5);
            
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.08); // Ataque suave
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6); // Fade-out
            
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            
            osc1.start(ctx.currentTime);
            osc2.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.6);
            osc2.stop(ctx.currentTime + 0.6);
        } catch (e) {
            console.warn('[Audio] Sussurro mágico falhou:', e);
        }
    }

    _applyFilters() {
        this._filtered = this._allSpells.filter(spell => {
            // Separação rígida de Truques e Magias
            if (this._activeSpellTab === 'cantrips' && spell.level !== 0) return false;
            if (this._activeSpellTab === 'spells' && spell.level === 0) return false;

            const q = this._searchQuery && this._searchQuery.toLowerCase();
            const matchesSearch = !q ||
                (spell.name && spell.name.toLowerCase().includes(q)) ||
                (spell.englishName && spell.englishName.toLowerCase().includes(q)) ||
                (spell.challenge && spell.challenge.toLowerCase().includes(q)) ||
                (spell.effect && spell.effect.toLowerCase().includes(q));

            const matchesClass =
                this._filterClass === 'all' ||
                (spell.classes && spell.classes.includes(this._filterClass));

            const matchesType =
                this._filterType === 'all' ||
                spell.type === this._filterType;

            const matchesLevel =
                this._filterLevel === 'all' ||
                (spell.level !== undefined && spell.level.toString() === this._filterLevel);

            return matchesSearch && matchesClass && matchesType && matchesLevel;
        });
    }

    _updateSpellListUI() {
        const gridTarget = this.$('#spell-grid-target');
        const countTarget = this.$('#magic-count-target');
        
        if (gridTarget) {
            const activeTabSpells = this._allSpells.filter(spell => {
                return this._activeSpellTab === 'cantrips' ? spell.level === 0 : spell.level > 0;
            });
            const stats = {
                totalSpells: activeTabSpells.length
            };
            gridTarget.innerHTML = this._renderSpellGrid(stats);
            
            // Re-vincular cards que acabaram de ser recriados no DOM
            this.onMount();
        }
        
        if (countTarget) {
            countTarget.textContent = this._filtered.length;
        }
    }

    _renderPlayersWithSpell(spell) {
        const players = this.store?.state?.players || [];
        
        const matchesSpell = (playerSpellStr, spellObj) => {
            const cleanPlayerSpell = playerSpellStr.toLowerCase().trim();
            if (!cleanPlayerSpell) return false;
            
            const cleanName = spellObj.name.toLowerCase().trim();
            const cleanEnglishName = spellObj.englishName ? spellObj.englishName.toLowerCase().trim() : '';
            
            return cleanPlayerSpell === cleanName || 
                   (cleanEnglishName && cleanPlayerSpell === cleanEnglishName) ||
                   cleanPlayerSpell.includes(cleanName) ||
                   (cleanEnglishName && cleanPlayerSpell.includes(cleanEnglishName)) ||
                   cleanName.includes(cleanPlayerSpell) ||
                   (cleanEnglishName && cleanEnglishName.includes(cleanPlayerSpell));
        };

        const matchingPlayers = players.filter(p => {
            return Object.values(p.spells || {}).some(spellListStr => {
                return (spellListStr || '').split('\n').some(s => matchesSpell(s, spell));
            });
        });

        if (matchingPlayers.length === 0) {
            return html`
                <div style="font-size: 0.72rem; color: var(--text-dim); padding: 8px 12px; background: rgba(255,255,255,0.01); border-radius: 6px; border: 1px dashed rgba(197, 160, 89, 0.15); text-align: center;">
                    Nenhum jogador possui registrado na ficha.
                </div>
            `;
        }

        return html`
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${matchingPlayers.map(p => {
                    const avatarStyle = p.portraitData ? `background-image: url('${p.portraitData}')` : 'background-color: var(--accent)';
                    const avatarInner = p.portraitData ? '' : html`<span style="font-size: 0.6rem; font-weight: bold; color: #000;">${p.name.substring(0, 2).toUpperCase()}</span>`;
                    return html`
                        <div class="player-pill" style="display: flex; align-items: center; gap: 6px; background: rgba(197, 160, 89, 0.08); border: 1px solid rgba(197, 160, 89, 0.2); padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; color: #fff;">
                            <div style="width: 16px; height: 16px; border-radius: 50%; ${avatarStyle}; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.1);">
                                ${avatarInner}
                            </div>
                            <span style="font-weight: 500; font-size: 0.72rem;">${p.name}</span>
                        </div>
                    `;
                })}
            </div>
        `;
    }

    close() {
        this.unmount();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    template() {
        this._applyFilters();
        
        const activeTabSpells = this._allSpells.filter(spell => {
            return this._activeSpellTab === 'cantrips' ? spell.level === 0 : spell.level > 0;
        });

        const stats = {
            totalSpells: activeTabSpells.length,
            filteredCount: this._filtered.length,
            classes: [...new Set(activeTabSpells.flatMap(s => s.classes || []))].sort(),
            types: [...new Set(activeTabSpells.map(s => s.type).filter(Boolean))].sort(),
            levels: [...new Set(activeTabSpells.map(s => s.level).filter(t => t !== undefined && t > 0))]
                .sort((a, b) => a - b)
        };

        // Renderização do Pop-up do Grimório Interativo
        let popupHTML = '';
        if (this._activePopupSpell) {
            const spell = this._activePopupSpell;
            const isCantrip = spell.level === 0;
            const isAttack = spell.type === 'dano' || spell.baseDamage;
            
            let glowClass = 'circle-glow';
            if (isCantrip) glowClass = 'cantrip-glow';
            else if (isAttack) glowClass = 'attack-glow';

            const pinnedClass = this._popupMode === 'click' ? 'pinned' : '';
            
            popupHTML = html`
                <div class="magic-popup ${glowClass} ${pinnedClass}" 
                     style="left: ${this._popupPosition.x}px; top: ${this._popupPosition.y}px;">
                    ${this._getSpellPopupHTML(spell)}
                </div>
            `;
        }

        const displayTabTitle = this._activeSpellTab === 'cantrips' ? 'Grimório de Truques' : 'Grimório de Magias';
        const displayTabSubtitle = this._activeSpellTab === 'cantrips' 
            ? 'Lista completa de truques e magias de nível 0.' 
            : 'Filtro e referência de magias dos círculos de 1º a 5º nível.';

        return html`
        <div class="modal-overlay animate-fadeIn spell-book-modal" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px);">
            <div class="card glass-accent animate-scaleIn" style="max-width:1400px; width:95%; height:90vh; padding:30px; border:2px solid var(--accent); overflow-y:auto; background:rgba(15,12,16,0.95); position:relative;">
                <button class="btn btn-ghost" onclick="this.closest('.spell-book-modal').__component.close()" style="position:absolute; top:20px; right:20px; border-radius:50%; width:36px; height:36px; padding:0; z-index:10;"><i class="fa-solid fa-times"></i></button>
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(197,160,89,0.25); padding-bottom: 15px; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
                    <div>
                        <h2 class="section-title" style="font-family:'Cinzel'; color:var(--accent); text-shadow:0 0 10px rgba(197,160,89,0.3); margin: 0; font-size: 1.6rem; font-weight: bold;">
                            <i class="fa-solid fa-book-sparkles" style="margin-right:12px;"></i> ${displayTabTitle}
                        </h2>
                        <p class="section-subtitle" style="color:var(--text-dim); font-size:0.85rem; margin: 4px 0 0 0;">${displayTabSubtitle}</p>
                    </div>

                    
                    <div style="display: flex; gap: 8px; background: rgba(0,0,0,0.35); padding: 4px; border-radius: 10px; border: 1.5px solid rgba(197,160,89,0.25); box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);">
                        <button class="btn spell-tab-btn ${this._activeSpellTab === 'cantrips' ? 'btn-primary' : 'btn-ghost'}" 
                                data-tab="cantrips" 
                                style="font-family: 'Cinzel'; font-size: 0.78rem; padding: 8px 16px; border: none; border-radius: 6px; display: flex; align-items: center; gap: 6px;">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> TRUQUES
                        </button>
                        <button class="btn spell-tab-btn ${this._activeSpellTab === 'spells' ? 'btn-primary' : 'btn-ghost'}" 
                                data-tab="spells" 
                                style="font-family: 'Cinzel'; font-size: 0.78rem; padding: 8px 16px; border: none; border-radius: 6px; display: flex; align-items: center; gap: 6px;">
                            <i class="fa-solid fa-scroll-old"></i> MAGIAS
                        </button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 340px; gap: 30px; align-items: start;">
                    
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        ${this._renderSearchBar()}
                        <div id="spell-grid-target">
                            ${this._selectedSpell ? this._renderSpellDetail() : this._renderSpellGrid(stats)}
                        </div>
                    </div>

                    
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        ${this._renderFilterPanel(stats)}
                    </div>
                </div>
                </div>
            </div>
            ${popupHTML}
        </div>
        `;
    }

    _renderSearchBar() {
        return html`
            <div class="card glass-accent" style="padding: 16px; border-radius: 12px; border: 1px solid rgba(197,160,89,0.2);">
                <div style="display: flex; gap: 12px; align-items: center;">
                    <i class="fa-solid fa-magnifying-glass" style="color: var(--accent); font-size: 1.1rem;"></i>
                    <input type="text" 
                           placeholder="Buscar pelo nome, efeito ou equivalente em inglês..."
                           style="flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(197,160,89,0.15); padding: 10px 14px; border-radius: 8px; color: var(--text-main); font-size: 0.9rem; outline: none;"
                           value="${this._searchQuery}"
                           data-action="search" />
                </div>
            </div>
        `;
    }

    _renderFilterPanel(stats) {
        return html`
            <div class="card glass-accent" style="padding: 18px; border-radius: 12px; border: 1px solid rgba(197,160,89,0.15); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div style="font-family: 'Cinzel'; color: var(--accent); font-size: 0.85rem; letter-spacing: 1px; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px solid rgba(197,160,89,0.15); padding-bottom: 6px;">Filtros</div>

                <div style="display: flex; flex-direction: column; gap: 14px;">
                    
                    <div>
                        <label style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; display: block; margin-bottom: 6px; font-weight: 700;">Classe</label>
                        <select data-action="filterClass" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(197,160,89,0.25); padding: 8px 12px; border-radius: 6px; color: var(--text-main); font-size: 0.82rem; outline: none;">
                            <option value="all" ${this._filterClass === 'all' ? 'selected' : ''}>Todas</option>
                            ${stats.classes.map(cls => html`<option value="${cls}" ${this._filterClass === cls ? 'selected' : ''}>${cls}</option>`)}
                        </select>
                    </div>

                    
                    <div>
                        <label style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; display: block; margin-bottom: 6px; font-weight: 700;">Tipo</label>
                        <select data-action="filterType" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(197,160,89,0.25); padding: 8px 12px; border-radius: 6px; color: var(--text-main); font-size: 0.82rem; outline: none;">
                            <option value="all" ${this._filterType === 'all' ? 'selected' : ''}>Todos</option>
                            ${stats.types.map(t => html`<option value="${t}" ${this._filterType === t ? 'selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`)}
                        </select>
                    </div>

                    
                    ${this._activeSpellTab === 'spells' ? html`
                    <div>
                        <label style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase; display: block; margin-bottom: 6px; font-weight: 700;">Círculo / Nível</label>
                        <select data-action="filterLevel" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(197,160,89,0.25); padding: 8px 12px; border-radius: 6px; color: var(--text-main); font-size: 0.82rem; outline: none;">
                            <option value="all" ${this._filterLevel === 'all' ? 'selected' : ''}>Todos</option>
                            ${stats.levels.map(l => html`<option value="${l}" ${this._filterLevel === l.toString() ? 'selected' : ''}>${l}º Nível</option>`)}
                        </select>
                    </div>
                    ` : ''}

                    <button class="btn btn-ghost btn-block" style="font-size: 0.78rem; padding: 10px; border-radius: 8px; margin-top: 8px; color: var(--accent); border-color: rgba(197,160,89,0.2);" data-action="clearFilters">
                        <i class="fa-solid fa-arrow-rotate-left" style="margin-right: 6px;"></i> Limpar Filtros
                    </button>
                </div>
            </div>

            <div class="card glass-accent" style="padding: 14px; border-radius: 12px; border: 1px solid rgba(197,160,89,0.15); text-align: center;">
                <div style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 4px; font-weight: 700;">Total Filtrado</div>
                <div style="font-size: 1.8rem; font-weight: 900; color: var(--accent); font-family: 'Cinzel';" id="magic-count-target">${stats.filteredCount}</div>
                <div style="font-size: 0.72rem; color: var(--text-dim);">${this._activeSpellTab === 'cantrips' ? 'truques encontrados' : 'magias encontradas'}</div>
            </div>
        `;
    }

    _renderSpellGrid(stats) {
        if (this._filtered.length === 0) {
            return html`
                <div class="card glass-accent empty-state" style="padding: 60px; border-radius: 12px; text-align: center; border: 1px dashed rgba(197,160,89,0.25);">
                    <i class="fa-solid fa-scroll fa-3x" style="color: var(--accent); margin-bottom: 15px; opacity: 0.4;"></i>
                    <h4 style="font-family: 'Cinzel'; margin: 0; color: var(--text-dim);">Nenhum item encontrado</h4>
                    <p style="font-size: 0.85rem; color: var(--text-dim); margin-top: 8px;">Ajuste seus filtros ou query de busca</p>
                </div>
            `;
        }

        const groupedByLevel = this._groupBy(this._filtered, 'level');
        return Object.entries(groupedByLevel)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([level, spells]) => {
                const levelLabel = level === '0' ? '🧙 TRUQUES (Cantrips)' : `✨ Magias de ${level}º Círculo / Nível`;
                return html`
                    <div style="margin-bottom: 25px;">
                        <div style="font-family: 'Cinzel'; font-size: 0.95rem; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; padding-bottom: 8px; border-bottom: 1.5px solid rgba(197,160,89,0.2); margin-bottom: 12px; font-weight: bold;">
                            ${levelLabel}
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                            ${spells.map(spell => this._renderSpellCard(spell))}
                        </div>
                    </div>
                `;
            });
    }

    _renderSpellCard(spell) {
        const typeIcons = {
            'dano': '⚔️',
            'controle': '🔗',
            'utilidade': '✨',
            'cura': '🏥'
        };
        const icon = typeIcons[spell.type] || '📜';

        const isCantrip = spell.level === 0;
        const colorBorder = isCantrip ? 'rgba(34, 197, 94, 0.2)' : 'rgba(197, 160, 89, 0.2)';

        return html`
            <div class="card glass-accent spell-card" 
                 style="padding: 16px; border-radius: 10px; border: 1px solid ${colorBorder}; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); background: rgba(197, 160, 89, 0.015);"
                 onmouseover="this.style.borderColor='var(--accent)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.4)';"
                 onmouseout="this.style.borderColor='${colorBorder}'; this.style.transform='none'; this.style.boxShadow='none';"
                 data-action="toggleSpellPopup"
                 data-spell-id="${spell.id}">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
                    <div style="flex: 1; min-width: 0;">
                        <h4 style="margin: 0; font-size: 0.9rem; font-weight: 800; color: #fff; font-family: 'Cinzel'; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${icon} ${spell.name}</h4>
                        <div style="font-size: 0.68rem; color: var(--text-dim); margin-top: 1px; font-style: italic;">${spell.englishName}</div>
                    </div>
                    ${spell.level ? html`<div style="background: var(--accent); color: #000; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 800; margin-left: 8px;">${spell.level}º</div>` : ''}
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
                    ${(spell.classes || []).slice(0, 2).map(cls => html`<span style="background: rgba(197,160,89,0.12); color: var(--accent); font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: 700;">${cls}</span>`)}
                    ${spell.concentration ? html`<span style="background: rgba(239,68,68,0.1); color: var(--danger); font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; font-weight: 700;">⚠️ Conc.</span>` : ''}
                </div>
                <p style="font-size: 0.78rem; color: var(--text-main); margin: 0; line-height: 1.35; min-height: 2.7em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; opacity: 0.9;">
                    ${spell.challenge || spell.effect || ''}
                </p>
                <div style="margin-top: 10px; font-size: 0.68rem; color: var(--text-dim); display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 6px;">
                    <span><i class="fa-regular fa-clock"></i> ${spell.actionType === 'bonusAction' ? 'Ação Bônus' : (spell.actionType === 'reaction' ? 'Reação' : 'Ação')}</span>
                    <span><i class="fa-solid fa-arrows-left-right"></i> ${spell.range || '-'}</span>
                </div>
            </div>
        `;
    }

    _renderSpellDetail() {
        const spell = this._selectedSpell;
        const damageInfo = spell.baseDamage ? html`<strong>${spell.baseDamage}</strong> ${spell.damageType}` : 'N/A';
        const isCantrip = spell.level === 0;

        return html`
            <div class="card glass-accent" style="padding: 24px; border-radius: 12px; border: 2px solid var(--accent); animation: fadeIn 0.3s ease-out; box-shadow: 0 10px 40px rgba(0,0,0,0.65);">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px; border-bottom: 1.5px solid rgba(197,160,89,0.2); padding-bottom: 10px;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.4rem; font-family: 'Cinzel'; color: #fff;">${spell.name}</h2>
                        <div style="font-size: 0.8rem; color: var(--accent); margin-top: 2px; font-style: italic;">${spell.englishName}</div>
                    </div>
                    <button class="btn btn-ghost" style="padding: 6px 12px; font-size: 0.9rem; border-radius: 6px;" data-action="closeSpellDetail">✕ Voltar</button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 20px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                    <div style="text-align: center;">
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase;">Nível / Círculo</div>
                        <div style="font-size: 1.2rem; font-weight: 900; color: var(--accent); font-family: 'Cinzel'; margin-top: 2px;">${isCantrip ? 'Truque' : `${spell.level}º`}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase;">Tempo de Conjuração</div>
                        <div style="font-size: 0.85rem; font-weight: 800; color: #fff; margin-top: 5px;">${spell.actionType === 'bonusAction' ? 'Ação Bônus' : (spell.actionType === 'reaction' ? 'Reação' : 'Ação')}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase;">Alcance</div>
                        <div style="font-size: 0.85rem; font-weight: 800; color: #fff; margin-top: 5px;">${spell.range || '-'}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase;">Duração</div>
                        <div style="font-size: 0.85rem; font-weight: 800; color: #fff; margin-top: 5px;">${spell.duration || 'Instantânea'}</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <div style="font-family: 'Cinzel'; color: var(--accent); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: bold;">Desafio Resolvido</div>
                        <p style="font-size: 0.82rem; color: var(--text-main); line-height: 1.4; margin: 0; opacity: 0.95;">${spell.challenge || 'N/A'}</p>
                    </div>
                    <div>
                        <div style="font-family: 'Cinzel'; color: var(--accent); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: bold;">Método de Execução</div>
                        <p style="font-size: 0.82rem; color: var(--text-main); line-height: 1.4; margin: 0; opacity: 0.95;">${spell.execution || 'N/A'}</p>
                    </div>
                </div>

                <div style="background: rgba(197,160,89,0.03); padding: 12px; border-radius: 8px; border: 1px solid rgba(197,160,89,0.15); margin-bottom: 20px;">
                    <div style="font-family: 'Cinzel'; color: var(--accent); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: bold;">Efeito Mecânico</div>
                    <p style="font-size: 0.85rem; color: var(--text-main); line-height: 1.45; margin: 0; opacity: 0.95;">${spell.effect || 'N/A'}</p>
                </div>

                ${spell.baseDamage ? html`
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div class="card glass-accent" style="padding: 12px; border-radius: 8px; background: rgba(139, 0, 0, 0.1); border: 1px solid rgba(197, 160, 89, 0.2);">
                            <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 4px;">Dano / Efeito Base</div>
                            <div style="font-size: 1.15rem; font-weight: 900; color: #ff6b6b; font-family: 'Cinzel';">${damageInfo}</div>
                        </div>
                        ${spell.savingThrow ? html`
                            <div class="card glass-accent" style="padding: 12px; border-radius: 8px; background: rgba(100, 150, 200, 0.08); border: 1px solid rgba(197, 160, 89, 0.2);">
                                <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 4px;">Salvaguarda (Oponente)</div>
                                <div style="font-size: 0.95rem; font-weight: 800; color: #6eb3ff;">Rola CD contra: ${spell.savingThrow}</div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                
                <div style="background: rgba(197,160,89,0.02); padding: 15px; border-radius: 10px; border: 1px solid rgba(197,160,89,0.15); margin-bottom: 20px;">
                    <div style="font-family: 'Cinzel'; color: var(--accent); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-users"></i> Conjuradores Vinculados
                    </div>
                    ${this._renderPlayersWithSpell(spell)}
                </div>

                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; gap: 8px; flex-wrap: wrap;">
                    ${(spell.classes || []).map(cls => html`<span style="background: rgba(197,160,89,0.12); color: var(--accent); font-size: 0.7rem; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; font-weight: 700;">${cls}</span>`)}
                    ${spell.components ? html`<span style="background: rgba(100,150,200,0.12); color: #6eb3ff; font-size: 0.7rem; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; font-weight: 700;">Comp: ${spell.components.join(', ')}</span>` : ''}
                    ${spell.concentration ? html`<span style="background: rgba(220,150,50,0.12); color: #ffb347; font-size: 0.7rem; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; font-weight: 700;">⚠️ Concentração</span>` : ''}
                </div>
            </div>
        `;
    }

    _groupBy(array, key) {
        return array.reduce((result, item) => {
            const groupKey = item[key];
            if (!result[groupKey]) result[groupKey] = [];
            result[groupKey].push(item);
            return result;
        }, {});
    }

    search(e, el) {
        this._searchQuery = el.value;
        this._applyFilters();
        this._updateSpellListUI();
    }

    filterClass(e, el) {
        this._filterClass = el.value;
        this.render();
    }

    filterType(e, el) {
        this._filterType = el.value;
        this.render();
    }

    filterLevel(e, el) {
        this._filterLevel = el.value;
        this.render();
    }

    clearFilters() {
        this._searchQuery = '';
        this._filterClass = 'all';
        this._filterType = 'all';
        this._filterLevel = 'all';
        this._selectedSpell = null;
        this.render();
    }

    selectSpell(e, el) {
        const spellId = el.dataset.spellId;
        this._selectedSpell = this._allSpells.find(s => s.id === spellId);
        this.render();
    }

    closeSpellDetail() {
        this._selectedSpell = null;
        this.render();
    }

    toggleSpellPopup(e, el) {
        if (e) e.stopPropagation();
        const spellId = el.dataset.spellId;
        const spell = this._allSpells.find(s => s.id === spellId);
        if (!spell) return;

        if (this._hoverTimer) {
            clearTimeout(this._hoverTimer);
            this._hoverTimer = null;
        }

        // Toca som mágico sintetizado
        this._playMagicWhisperSound();

        // Se já estiver aberto para esta mesma magia em modo clique, fecha
        if (this._activePopupSpell && this._activePopupSpell.id === spell.id && this._popupMode === 'click') {
            this._activePopupSpell = null;
            this._popupMode = null;
        } else {
            this._activePopupSpell = spell;
            this._popupMode = 'click';

            const rect = el.getBoundingClientRect();
            let x = rect.right + 12;
            if (x + 380 > window.innerWidth) {
                x = rect.left - 392;
            }
            if (x < 10) x = 10;
            
            let y = rect.top;
            if (y + 350 > window.innerHeight) {
                y = window.innerHeight - 360;
            }
            if (y < 10) y = 10;

            this._popupPosition = { x, y };
        }
        this.render();
    }

    closeMagicPopup(e) {
        if (e) e.stopPropagation();
        this._activePopupSpell = null;
        this._popupMode = null;
        this.render();
    }

    viewFullSpell(e, el) {
        if (e) e.stopPropagation();
        const spellId = el.dataset.spellId;
        this._selectedSpell = this._allSpells.find(s => s.id === spellId);
        this._activePopupSpell = null;
        this._popupMode = null;
        this.render();
    }

    _getSpellPopupHTML(spell) {
        const isCantrip = spell.level === 0;
        const circleLabel = isCantrip ? 'TRUQUE' : `${spell.level}º CÍRCULO`;
        
        const mainClass = spell.classes && spell.classes[0] ? spell.classes[0] : 'Conjurador';
        let modifierName = 'Carisma';
        if (['Clérigo', 'Druida', 'Ranger'].includes(mainClass)) modifierName = 'Sabedoria';
        else if (['Mago', 'Artífice'].includes(mainClass)) modifierName = 'Inteligência';
        
        let actionLabel = 'Ação';
        if (spell.actionType === 'bonusAction') actionLabel = 'Ação Bônus';
        else if (spell.actionType === 'reaction') actionLabel = 'Reação';
        
        const componentsLabel = spell.components ? spell.components.join('/') : 'V/S';
        const concentrationLabel = spell.concentration ? 'Sim' : 'Não';
        
        // Dynamic icons & colors based on type
        const typeIcons = { 'dano': 'fa-fire-flame-curved', 'controle': 'fa-hands-bound', 'utilidade': 'fa-wand-magic-sparkles', 'cura': 'fa-heart-pulse' };
        const typeColors = { 'dano': '#ef4444', 'controle': '#3b82f6', 'utilidade': '#a855f7', 'cura': '#22c55e' };
        
        const typeIcon = typeIcons[spell.type] || 'fa-scroll';
        const typeColor = typeColors[spell.type] || 'var(--accent)';
        
        let testBoxHTML = '';
        if (spell.savingThrow) {
            const saveMap = { 'DEX': 'Destreza', 'WIS': 'Sabedoria', 'CON': 'Constituição', 'INT': 'Inteligência', 'STR': 'Força', 'CHA': 'Carisma' };
            const saveName = saveMap[spell.savingThrow] || spell.savingThrow;
            testBoxHTML = html`
                <div style="font-size: 0.72rem; line-height: 1.4; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px; font-family: 'Cinzel', serif;">SALVAGUARDA (Inimigo Rola)</div>
                    <div style="color: var(--text-dim); margin-bottom: 3px;">CD da Magia contra o alvo:</div>
                    <div style="font-family: 'JetBrains Mono', monospace; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; margin: 4px 0; color: #fff; border: 1px solid rgba(255,255,255,0.05); text-align: center; font-weight: bold;">
                        CD = 8 + Proficiência + Mod. ${modifierName}
                    </div>
                    <div style="font-size: 0.68rem; color: var(--text-dim); margin-top: 4px;">
                        • Oponente rola salvaguarda de <strong>${saveName}</strong><br />
                        • Sucesso: Metade do dano ou anula o efeito.
                    </div>
                </div>
            `;
        } else if (spell.baseDamage || spell.type === 'dano') {
            testBoxHTML = html`
                <div style="font-size: 0.72rem; line-height: 1.4; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px; font-family: 'Cinzel', serif;">ATAQUE MÁGICO (Você Rola)</div>
                    <div style="color: var(--text-dim); margin-bottom: 3px;">Jogada de ataque com d20:</div>
                    <div style="font-family: 'JetBrains Mono', monospace; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; margin: 4px 0; color: #fff; border: 1px solid rgba(255,255,255,0.05); text-align: center; font-weight: bold;">
                        Mod. de Ataque = Proficiência + Mod. ${modifierName}
                    </div>
                    <div style="font-size: 0.68rem; color: var(--text-dim); margin-top: 4px;">
                        • Role 1d20 + Modificador de Ataque.<br />
                        • O ataque atinge se o total for <strong>&ge; CA</strong> do alvo.
                    </div>
                </div>
            `;
        } else {
            testBoxHTML = html`
                <div style="font-size: 0.72rem; line-height: 1.4; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px; font-family: 'Cinzel', serif;">EFEITO AUTOMÁTICO</div>
                    <div style="font-size: 0.68rem; color: var(--text-dim); margin-top: 4px;">
                        • Não requer jogada de ataque ou teste de salvaguarda.<br />
                        • O efeito ou cura ocorre instantaneamente no alvo.
                    </div>
                </div>
            `;
        }

        const narrative = spell.challenge || spell.effect || 'Efeito mágico sob comando do conjurador.';
        
        let damageOrEffect = null;
        if (spell.baseDamage) {
            let scalingInfo = '';
            if (spell.scaling && !isCantrip) {
                scalingInfo = html` <span style="font-size: 0.65rem; color: var(--text-dim); display: block; margin-top: 2px;">(+1d6 por nível de slot acima)</span>`;
            } else if (spell.scaling && isCantrip) {
                scalingInfo = html` <span style="font-size: 0.65rem; color: var(--text-dim); display: block; margin-top: 2px;">(dano aumenta nos níveis 5, 11 e 17)</span>`;
            }
            damageOrEffect = html`<span>
                <span style="font-size: 1.1rem; font-weight: 800; color: #fff; font-family: 'Cinzel', serif;">${spell.baseDamage}</span> 
                <span style="font-size: 0.8rem; font-weight: 600; color: ${typeColor};">${spell.damageType || ''}</span>
                ${scalingInfo}
            </span>`;
        } else {
            damageOrEffect = html`<span style="font-size: 0.75rem; color: var(--text-main); font-weight: 500;">${spell.effect || 'Efeito imediato.'}</span>`;
        }

        let shortNarrative = narrative;
        if (shortNarrative.length > 180) {
            shortNarrative = shortNarrative.substring(0, 177) + '...';
        }

        return html`
            <div style="display: flex; flex-direction: column; gap: 12px; position: relative;">
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1rem; color: ${typeColor}; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);">
                            <i class="fa-solid ${typeIcon}"></i>
                        </span>
                        <div>
                            <h4 style="font-family: 'Cinzel', serif; font-size: 0.95rem; font-weight: 800; color: #fff; margin: 0; text-shadow: 0 0 10px rgba(255,255,255,0.1);">${spell.name.toUpperCase()}</h4>
                            <span style="font-size: 0.6rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px;">${spell.englishName}</span>
                        </div>
                    </div>
                    <span class="badge" style="background: ${isCantrip ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)'}; border: 1px solid ${isCantrip ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}; color: ${isCantrip ? '#86efac' : '#93c5fd'}; font-size: 0.6rem; padding: 2px 8px; border-radius: 4px;">
                        ${circleLabel}
                    </span>
                </div>

                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: rgba(0,0,0,0.15); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.02); font-size: 0.72rem;">
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-regular fa-clock" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Execução: <strong style="color: #fff;">${actionLabel}</strong></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-solid fa-arrows-left-right" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Alcance: <strong style="color: #fff;">${spell.range || '-'}</strong></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-solid fa-flask" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Componentes: <strong style="color: #fff;">${componentsLabel}</strong></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-solid fa-brain" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Conc.: <strong style="color: #fff;">${concentrationLabel}</strong></span>
                    </div>
                </div>

                
                <div style="background: rgba(255, 255, 255, 0.015); border-left: 2.5px solid ${typeColor}; padding: 8px 12px; border-radius: 0 6px 6px 0; font-size: 0.72rem; line-height: 1.45; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--text-dim); font-size: 0.65rem; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">Como funciona:</div>
                    ${shortNarrative}
                </div>

                
                <div style="background: rgba(255,255,255,0.02); border: 1.5px solid rgba(197, 160, 89, 0.15); padding: 12px; border-radius: 8px;">
                    ${testBoxHTML}
                </div>

                
                <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px; margin-top: 2px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 0.65rem; color: var(--accent); font-weight: 700; margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
                        <i class="fa-solid fa-users"></i> Conjuradores
                    </div>
                    ${this._renderPlayersWithSpell(spell)}
                </div>

                
                <div style="background: rgba(197, 160, 89, 0.05); border: 1.5px dashed rgba(197, 160, 89, 0.3); padding: 8px 10px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 4px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: var(--accent); font-size: 0.95rem; display: inline-flex;">
                            <i class="fa-solid fa-dice-d20"></i>
                        </span>
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Dano / Efeito:</div>
                    </div>
                    <div style="text-align: right;">
                        ${damageOrEffect}
                    </div>
                </div>
            </div>
            
            ${this._popupMode === 'click' ? html`
                <button class="btn btn-ghost" style="position: absolute; top: 12px; right: 12px; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px; z-index: 10; border: none; background: transparent; color: var(--text-dim); cursor: pointer;" data-action="closeMagicPopup">✕</button>
                <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; border-top: 1.5px solid rgba(255, 255, 255, 0.08); padding-top: 10px;">
                    <button class="btn btn-ghost" style="padding: 5px 12px; font-size: 0.68rem; border-radius: 6px; border: 1px solid rgba(197, 160, 89, 0.35); color: var(--accent); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; background: rgba(197,160,89,0.05);" data-action="viewFullSpell" data-spell-id="${spell.id}">
                        <i class="fa-solid fa-expand" style="font-size: 0.65rem;"></i> Ficha Completa
                    </button>
                </div>
            ` : ''}
        `;
    }
}