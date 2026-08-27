import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from './Toast.js';
import { Modal } from './Modal.js';

/**
 * VAULT EXPLORER v1.1
 * Searchable library for SRD 5e data.
 */
export class VaultExplorer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: '',
            category: 'spells', // 'spells' | 'items'
            results: [],
            loading: false
        };
    }

    async search() {
        this.state.loading = true;
        this.render();

        try {
            const response = await fetch(`./data/srd/${this.state.category}.json`);
            const data = await response.json();
            
            this.state.results = data.filter(item => 
                item.name.toLowerCase().includes(this.state.query.toLowerCase())
            );
        } catch (err) {
            console.error('[Vault] Search failed:', err);
            Toast.show('Erro ao carregar banco de dados.', 'error');
        } finally {
            this.state.loading = false;
            this.render();
        }
    }

    template() {
        return `
            <div class="vault-explorer animate-fade" style="padding:20px; background:var(--bg-glass); border-radius:var(--radius-lg); border:1px solid var(--border-glass);">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
                    <h2 style="font-family:'Cinzel'; color:var(--primary); font-size:1.2rem; margin:0;">🏛️ COFRE DO CONHECIMENTO</h2>
                    <div style="display:flex; gap:10px;">
                        <button class="btn ${this.state.category === 'spells' ? 'btn-primary' : 'btn-ghost'}" data-action="setCat" data-cat="spells">MAGIAS</button>
                        <button class="btn ${this.state.category === 'items' ? 'btn-primary' : 'btn-ghost'}" data-action="setCat" data-cat="items">ITENS</button>
                    </div>
                </div>

                <div style="position:relative; margin-bottom:30px;">
                    <input type="text" 
                           placeholder="Pesquisar no SRD..." 
                           class="legacy-input" 
                           style="width:100%; padding:15px 50px 15px 20px !important; background:rgba(255,255,255,0.05) !important; border-radius:8px !important; color:white !important;"
                           value="${this.state.query}"
                           onkeyup="this.dispatchEvent(new CustomEvent('vaultSearch', {detail: this.value}))">
                    <i class="fa-solid fa-magnifying-glass" style="position:absolute; right:20px; top:50%; transform:translateY(-50%); opacity:0.5;"></i>
                </div>

                <div class="vault-results" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px; max-height:600px; overflow-y:auto; padding-right:10px;">
                    ${this.state.loading ? '<p style="text-align:center; padding:40px;">Consultando pergaminhos...</p>' : ''}
                    ${this.state.results.length === 0 && !this.state.loading ? '<p style="text-align:center; opacity:0.3; padding:40px;">Nenhum registro encontrado.</p>' : ''}
                    ${this.state.results.map(item => this._renderResultCard(item)).join('')}
                </div>
            </div>
        `;
    }

    _renderResultCard(item) {
        return `
            <div class="card" 
                 draggable="true" 
                 data-item='${JSON.stringify(item).replace(/'/g, "&apos;")}'
                 ondragstart="event.dataTransfer.setData('text/plain', this.dataset.item); event.dataTransfer.effectAllowed = 'copy';"
                 style="background:rgba(255,255,255,0.02); border-left:4px solid var(--primary); transition:transform 0.2s; cursor:grab;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                    <strong style="color:var(--primary); font-size:1rem;">${item.name}</strong>
                    <span style="font-size:0.6rem; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; text-transform:uppercase;">
                        ${item.level !== undefined ? `Nível ${item.level}` : item.type}
                    </span>
                </div>
                <p style="font-size:0.75rem; color:var(--text-dim); line-height:1.4; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
                    ${item.description}
                </p>
                <div style="margin-top:15px; display:flex; gap:10px;">
                    <button class="btn btn-ghost" style="flex:1; font-size:0.6rem; padding:5px;" data-action="viewDetails" data-name="${item.name}">DETALHES</button>
                    <button class="btn btn-primary" style="flex:1; font-size:0.6rem; padding:5px;" data-action="addToSheet" data-name="${item.name}">+ FICHA</button>
                </div>
            </div>
        `;
    }

    setCat(e, el) {
        this.state.category = el.dataset.cat;
        this.search();
    }

    viewDetails(e, el) {
        const item = this.state.results.find(i => i.name === el.dataset.name);
        if (item) {
            Modal.alert(item.name, item.description, 'info');
        }
    }

    addToSheet(e, el) {
        const name = el.dataset.name;
        const item = this.state.results.find(i => i.name === name);
        if (!item) return;

        TOME.store.update(s => {
            const player = s.players[s.currentPlayerIdx || 0];
            if (!player) {
                Toast.show('Selecione um herói primeiro!', 'warning');
                return;
            }

            if (this.state.category === 'items') {
                const items = (player.equipment?.items || '').split('\n').filter(x => x.trim());
                items.push(`${item.name} (${item.type})`);
                if (!player.equipment) player.equipment = { items: '' };
                player.equipment.items = items.join('\n');
            } else {
                const notes = (player.spells?.lvl0 || '').split('\n').filter(x => x.trim());
                notes.push(`✨ MAGIA: ${item.name} (Nível ${item.level}) - ${item.description.substring(0, 50)}...`);
                if (!player.spells) player.spells = {};
                player.spells.lvl0 = notes.join('\n');
            }
            Toast.show(`${item.name} adicionado à ficha de ${player.name}!`, 'success');
        });
    }

    onMount() {
        this.listen(this.element, 'vaultSearch', (e) => {
            this.state.query = e.detail;
            clearTimeout(this._searchTimer);
            this._searchTimer = setTimeout(() => this.search(), 300);
        });
        
        if (this.state.results.length === 0) this.search();
    }
}
