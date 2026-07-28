import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';

export class HeroHub extends Component {
    template() {
        const { players } = this.store.state;

        return `
            <div class="page" style="max-width: 1400px;">
                <div class="section-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h2 class="section-title"><i class="fa-solid fa-users" style="color:var(--accent); margin-right:12px;"></i> Monitor de Heróis</h2>
                        <p class="section-subtitle">Galeria de Lendas e Gerenciamento de Personagens</p>
                    </div>
                    <button class="btn btn-primary" data-action="newHero"><i class="fa-solid fa-plus"></i> Forjar Novo Herói</button>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:25px; margin-top:30px;">
                    ${players && players.length > 0 ? players.map(p => this._renderHeroCard(p)).join('') : `
                        <div class="card empty-state" style="grid-column: 1 / -1; height:40vh;">
                            <i class="fa-solid fa-ghost fa-3x" style="opacity:0.2; margin-bottom:20px;"></i>
                            <p>Nenhuma lenda registrada. O salão dos heróis está vazio.</p>
                            <button class="btn btn-ghost mt-3" data-action="newHero">Criar o Primeiro Herói</button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    _renderHeroCard(p) {
        return `
            <div class="card glass-accent" style="display:flex; flex-direction:column; padding:0; overflow:hidden;">
                <!-- Header / Portrait area -->
                <div style="height:120px; background:linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%), url('${p.portraitData || 'assets/parchment.png'}') center/cover; position:relative;">
                    <div style="position:absolute; bottom:15px; left:20px;">
                        <h3 style="margin:0; font-family:'Cinzel'; font-size:1.4rem; color:#fff; text-shadow:0 2px 5px #000;">${p.name}</h3>
                        <div style="font-size:0.75rem; color:var(--accent); font-weight:800; text-transform:uppercase;">${p.race} ${p.class} • NV ${p.level || 1}</div>
                    </div>
                </div>
                
                <!-- Quick Stats -->
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); padding:15px; border-bottom:1px solid rgba(255,255,255,0.05); text-align:center;">
                    <div><div style="font-size:0.6rem; color:var(--text-dim);">HP ATUAL</div><div style="font-weight:900; color:var(--info);">${p.hp?.current}/${p.hp?.max}</div></div>
                    <div style="border-left:1px solid rgba(255,255,255,0.05); border-right:1px solid rgba(255,255,255,0.05);"><div style="font-size:0.6rem; color:var(--text-dim);">CA</div><div style="font-weight:900;">${p.ac || 10}</div></div>
                    <div><div style="font-size:0.6rem; color:var(--text-dim);">INICIATIVA</div><div style="font-weight:900;">${(p.initiative >= 0 ? '+' : '')}${p.initiative || 0}</div></div>
                </div>

                <!-- Actions -->
                <div style="display:flex; padding:15px; gap:10px;">
                    <button class="btn btn-primary" style="flex:1; font-size:0.75rem; padding:8px;" data-action="viewSheet" data-id="${p.id}"><i class="fa-solid fa-scroll"></i> Ficha 5e</button>
                    <button class="btn btn-ghost" style="font-size:0.75rem; padding:8px;" data-action="editHero" data-id="${p.id}" title="Editar (Forja)"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-danger" style="font-size:0.75rem; padding:8px;" data-action="deleteHero" data-id="${p.id}" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    }

    newHero() {
        TOME.store.update(s => s.activeTab = 'builder');
    }

    editHero(e, el) {
        // PlayerForm will read this _editingId if passed, but since it's a global state we can just use the store
        // Wait, PlayerForm has its own _editingId. We should probably use a global "editingHeroId"
        TOME.store.update(s => {
            s.editingHeroId = el.dataset.id;
            s.activeTab = 'builder';
        });
    }

    viewSheet(e, el) {
        TOME.store.update(s => {
            s.viewingHeroId = el.dataset.id;
            s.activeTab = 'herosheet';
        });
    }

    deleteHero(e, el) {
        if (confirm('Tem certeza que deseja apagar esta lenda dos registros?')) {
            TOME.store.update(s => {
                s.players = s.players.filter(p => p.id !== el.dataset.id);
            });
            Toast.show('Herói apagado dos registros.', 'warning');
        }
    }
}
