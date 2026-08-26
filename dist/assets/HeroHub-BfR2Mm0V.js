import{C as s}from"./Boot-DMC3Yg8D.js";import{T as r}from"./BattleManager-CjydHzBy.js";import{Toast as o}from"./Toast-m0Ci56ke.js";import"./main-BrOk6ySq.js";import"./jsxRuntime.module-OTOYocg5.js";import"./FXEngine-CD41bvJc.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";class m extends s{template(){const{players:e}=this.store.state;return`
            <div class="page max-w-[1400px] animate-fadeIn">
                <div class="flex justify-between items-center bg-black/30 border border-white/5 rounded-2xl p-6 mb-8 shadow-xl">
                    <div>
                        <h2 class="font-cinzel text-[1.8rem] text-white m-0 tracking-wider flex items-center gap-3">
                            <i class="fa-solid fa-users text-accent drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]"></i> Monitor de Heróis
                        </h2>
                        <p class="font-outfit text-[0.9rem] text-slate-400 mt-1 m-0">Galeria de Lendas e Gerenciamento de Personagens</p>
                    </div>
                    <button class="btn btn-magic shadow-[0_0_20px_rgba(197,160,89,0.2)]" data-action="newHero">
                        <i class="fa-solid fa-plus"></i> Forjar Novo Herói
                    </button>
                </div>

                <div class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
                    ${e&&e.length>0?e.map(a=>this._renderHeroCard(a)).join(""):`
                        <div class="col-span-full h-[40vh] flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-2xl p-10">
                            <i class="fa-solid fa-ghost fa-3x opacity-20 mb-5 text-slate-500"></i>
                            <p class="font-cinzel text-lg text-slate-400">Nenhuma lenda registrada. O salão dos heróis está vazio.</p>
                            <button class="btn btn-ghost mt-4 font-bold border-white/20" data-action="newHero">Criar o Primeiro Herói</button>
                        </div>
                    `}
                </div>
            </div>
        `}_renderHeroCard(e){var a,t;return`
            <div class="card glass-accent flex flex-col p-0 overflow-hidden transform hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.9),_0_0_20px_rgba(197,160,89,0.15)] group">
                <!-- Header / Portrait area -->
                <div class="h-[140px] relative bg-cover bg-center border-b border-accent/20" style="background-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(10,12,16,0.95) 100%), url('${e.portraitData||"assets/parchment.png"}');">
                    <div class="absolute bottom-3 left-4 right-4">
                        <h3 class="m-0 font-cinzel text-[1.5rem] text-white drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">${e.name}</h3>
                        <div class="text-[0.75rem] text-accent font-extrabold uppercase tracking-wider">${e.race} ${e.class} • NV ${e.level||1}</div>
                    </div>
                </div>
                
                <!-- Quick Stats -->
                <div class="grid grid-cols-3 p-4 border-b border-white/5 text-center bg-black/20">
                    <div class="flex flex-col">
                        <span class="text-[0.6rem] text-slate-400 font-bold uppercase tracking-wider">HP Atual</span>
                        <span class="font-extrabold text-[1.1rem] text-green-500">${(a=e.hp)==null?void 0:a.current}/${(t=e.hp)==null?void 0:t.max}</span>
                    </div>
                    <div class="flex flex-col border-x border-white/5">
                        <span class="text-[0.6rem] text-slate-400 font-bold uppercase tracking-wider">CA</span>
                        <span class="font-extrabold text-[1.1rem] text-white">${e.ac||10}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[0.6rem] text-slate-400 font-bold uppercase tracking-wider">Iniciativa</span>
                        <span class="font-extrabold text-[1.1rem] text-blue-400">${e.initiative>=0?"+":""}${e.initiative||0}</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex p-4 gap-3 bg-black/40">
                    <button class="btn btn-primary flex-1 text-[0.75rem] px-2 py-2 rounded-lg" data-action="viewSheet" data-id="${e.id}">
                        <i class="fa-solid fa-scroll"></i> Ficha 5e
                    </button>
                    <button class="btn btn-ghost text-[0.75rem] w-10 h-10 rounded-lg p-0 flex items-center justify-center opacity-70 hover:opacity-100" data-action="editHero" data-id="${e.id}" title="Editar (Forja)">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-danger text-[0.75rem] w-10 h-10 rounded-lg p-0 flex items-center justify-center opacity-70 hover:opacity-100 border-red-500/20" data-action="deleteHero" data-id="${e.id}" title="Excluir">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `}newHero(){r.store.update(e=>e.activeTab="builder")}editHero(e,a){r.store.update(t=>{t.editingHeroId=a.dataset.id,t.activeTab="builder"})}viewSheet(e,a){r.store.update(t=>{t.viewingHeroId=a.dataset.id,t.activeTab="herosheet"})}deleteHero(e,a){confirm("Tem certeza que deseja apagar esta lenda dos registros?")&&(r.store.update(t=>{t.players=t.players.filter(i=>i.id!==a.dataset.id)}),o.show("Herói apagado dos registros.","warning"))}}export{m as HeroHub};
