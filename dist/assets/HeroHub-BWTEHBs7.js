import{C as s}from"./Boot-CB2yJVwc.js";import{T as a}from"./BattleManager-cUmVHNU7.js";import{Toast as o}from"./Toast-m0Ci56ke.js";import"./main-DA10KFgB.js";import"./jsxRuntime.module-D87oBCZy.js";import"./FXEngine-Cu-70LmD.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";class f extends s{template(){const{players:t}=this.store.state;return`
            <div class="page" style="max-width: 1400px;">
                <div class="section-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h2 class="section-title"><i class="fa-solid fa-users" style="color:var(--accent); margin-right:12px;"></i> Monitor de Heróis</h2>
                        <p class="section-subtitle">Galeria de Lendas e Gerenciamento de Personagens</p>
                    </div>
                    <button class="btn btn-primary" data-action="newHero"><i class="fa-solid fa-plus"></i> Forjar Novo Herói</button>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:25px; margin-top:30px;">
                    ${t&&t.length>0?t.map(i=>this._renderHeroCard(i)).join(""):`
                        <div class="card empty-state" style="grid-column: 1 / -1; height:40vh;">
                            <i class="fa-solid fa-ghost fa-3x" style="opacity:0.2; margin-bottom:20px;"></i>
                            <p>Nenhuma lenda registrada. O salão dos heróis está vazio.</p>
                            <button class="btn btn-ghost mt-3" data-action="newHero">Criar o Primeiro Herói</button>
                        </div>
                    `}
                </div>
            </div>
        `}_renderHeroCard(t){var i,e;return`
            <div class="card glass-accent" style="display:flex; flex-direction:column; padding:0; overflow:hidden;">
                <!-- Header / Portrait area -->
                <div style="height:120px; background:linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%), url('${t.portraitData||"assets/parchment.png"}') center/cover; position:relative;">
                    <div style="position:absolute; bottom:15px; left:20px;">
                        <h3 style="margin:0; font-family:'Cinzel'; font-size:1.4rem; color:#fff; text-shadow:0 2px 5px #000;">${t.name}</h3>
                        <div style="font-size:0.75rem; color:var(--accent); font-weight:800; text-transform:uppercase;">${t.race} ${t.class} • NV ${t.level||1}</div>
                    </div>
                </div>
                
                <!-- Quick Stats -->
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); padding:15px; border-bottom:1px solid rgba(255,255,255,0.05); text-align:center;">
                    <div><div style="font-size:0.6rem; color:var(--text-dim);">HP ATUAL</div><div style="font-weight:900; color:var(--info);">${(i=t.hp)==null?void 0:i.current}/${(e=t.hp)==null?void 0:e.max}</div></div>
                    <div style="border-left:1px solid rgba(255,255,255,0.05); border-right:1px solid rgba(255,255,255,0.05);"><div style="font-size:0.6rem; color:var(--text-dim);">CA</div><div style="font-weight:900;">${t.ac||10}</div></div>
                    <div><div style="font-size:0.6rem; color:var(--text-dim);">INICIATIVA</div><div style="font-weight:900;">${t.initiative>=0?"+":""}${t.initiative||0}</div></div>
                </div>

                <!-- Actions -->
                <div style="display:flex; padding:15px; gap:10px;">
                    <button class="btn btn-primary" style="flex:1; font-size:0.75rem; padding:8px;" data-action="viewSheet" data-id="${t.id}"><i class="fa-solid fa-scroll"></i> Ficha 5e</button>
                    <button class="btn btn-ghost" style="font-size:0.75rem; padding:8px;" data-action="editHero" data-id="${t.id}" title="Editar (Forja)"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-danger" style="font-size:0.75rem; padding:8px;" data-action="deleteHero" data-id="${t.id}" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `}newHero(){a.store.update(t=>t.activeTab="builder")}editHero(t,i){a.store.update(e=>{e.editingHeroId=i.dataset.id,e.activeTab="builder"})}viewSheet(t,i){a.store.update(e=>{e.viewingHeroId=i.dataset.id,e.activeTab="herosheet"})}deleteHero(t,i){confirm("Tem certeza que deseja apagar esta lenda dos registros?")&&(a.store.update(e=>{e.players=e.players.filter(r=>r.id!==i.dataset.id)}),o.show("Herói apagado dos registros.","warning"))}}export{f as HeroHub};
