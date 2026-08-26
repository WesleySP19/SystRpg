const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/BattleManager-CjydHzBy.js","assets/BattleManager-fWgb5hCU.css"])))=>i.map(i=>d[i]);
import{_ as d}from"./main-Bk3T2ZrR.js";import{C as u}from"./Boot-CGoZOUiq.js";import{C as l}from"./CRDTManager-CgAUmNs0.js";import"./BattleManager-CjydHzBy.js";import"./jsxRuntime.module-B_1yG4TV.js";import"./FXEngine-CD41bvJc.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";import"./y-websocket-DdQpu-E3.js";class w extends u{constructor(o){super(o),this.state=this.store.state,this.systemSchema=null,this.isLoading=!0,this.error=null}async onMount(){await this.fetchSystemSchema(),this._bindEvents()}async fetchSystemSchema(){try{const i=await(await fetch("/api/system/active")).json();i.status==="success"&&i.data?this.systemSchema=i.data.sheetSchema:this.error=i.message||"Sistema não encontrado."}catch{this.error="Erro ao carregar o sistema. Verifique a conexão com o servidor."}this.isLoading=!1,this.render()}template(){if(this.isLoading)return`<div style="text-align:center; padding: 50px; color:var(--accent); font-family: 'Cinzel';">Carregando Motor Multissistema...</div>`;if(this.error)return`<div style="text-align:center; padding: 50px; color:var(--danger);">${this.error}</div>`;const o=this.systemSchema,i=this.state.currentHero||{};return`
            <div class="card glass-accent p-8 max-w-[800px] mx-auto text-white rounded-2xl relative overflow-hidden">
                <div class="absolute -right-20 -top-20 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
                <h2 class="font-cinzel text-accent text-center uppercase m-0 text-2xl flex items-center justify-center gap-3 drop-shadow-[0_0_8px_rgba(197,160,89,0.4)]">
                    <i class="fa-solid fa-hat-wizard"></i> Construtor de Personagem
                </h2>
                <p class="text-center text-slate-400 mb-6 text-sm mt-2 uppercase tracking-widest">Sistema Ativo: ${o.version}</p>
                
                <form id="dynamic-char-form" class="relative z-10">
                    <div class="mb-8">
                        <label class="text-accent font-bold mb-2 block text-sm tracking-widest uppercase">NOME DA LENDA</label>
                        <input type="text" name="_name" class="legacy-input bg-black/50 text-white border border-accent/30 rounded-lg p-3 w-full text-lg outline-none focus:border-accent shadow-inner transition-colors" value="${i.name||""}" placeholder="Ex: Gandalf, O Cinzento..." required />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <!-- Atributos -->
                        <div class="flex flex-col">
                            <h3 class="text-accent border-b border-accent/30 pb-2 font-cinzel text-lg flex items-center gap-2"><i class="fa-solid fa-dna"></i> Atributos Base</h3>
                            <div class="grid gap-3 mt-4">
                                ${Object.entries(o.attributes||{}).map(([a,t])=>{var e;return`
                                    <div class="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                        <label class="rollable-attr font-bold text-sm cursor-pointer text-accent border-b border-dashed border-accent hover:text-white" data-attr="${a}" title="Rolar teste de ${t.label}"><i class="fa-solid fa-dice-d20"></i> ${t.label}</label>
                                        <input type="${t.type}" name="attr_${a}" value="${((e=i.attributes)==null?void 0:e[a])||t.default}" class="w-16 text-center bg-black/60 text-white border border-accent/50 rounded-md p-1 outline-none focus:border-accent" />
                                    </div>
                                `}).join("")}
                            </div>
                        </div>

                        <!-- Recursos -->
                        <div class="flex flex-col">
                            <h3 class="text-accent border-b border-accent/30 pb-2 font-cinzel text-lg flex items-center gap-2"><i class="fa-solid fa-heart-pulse"></i> Recursos Vitais</h3>
                            <div class="grid gap-3 mt-4">
                                ${Object.entries(o.resources||{}).map(([a,t])=>{var e;return`
                                    <div class="flex justify-between items-center bg-white/5 p-2.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                        <label class="capitalize font-bold text-sm text-slate-200">${a.replace("_"," ")}</label>
                                        <input type="${t.type}" name="res_${a}" value="${((e=i.resources)==null?void 0:e[a])||t.default}" class="w-16 text-center bg-black/60 text-white border border-red-500/50 rounded-md p-1 outline-none focus:border-red-500" />
                                    </div>
                                `}).join("")}
                            </div>
                        </div>
                    </div>

                    <div class="bg-accent/5 p-4 rounded-xl border border-dashed border-accent/30 text-center mb-8">
                        <span class="block text-sm text-slate-400 mb-3 font-bold uppercase tracking-widest">Atalhos Multissistema</span>
                        <button type="button" id="btn-template-tank" class="btn btn-ghost border border-accent text-accent hover:bg-accent hover:text-black font-bold py-1.5 px-4 text-sm rounded-lg transition-colors">Criar: Guerreiro Tank</button>
                    </div>

                    <button type="submit" class="btn btn-primary w-full p-4 text-lg font-cinzel tracking-[2px] shadow-[0_0_15px_rgba(197,160,89,0.4)]">
                        <i class="fa-solid fa-save mr-2"></i> SALVAR PERSONAGEM NO LIVRO
                    </button>
                </form>
            </div>
        `}_bindEvents(){if(!this.element)return;const o=this.element.querySelector("#dynamic-char-form");o&&(o.onsubmit=a=>{var c;a.preventDefault();const t=new FormData(o),e={id:((c=this.state.currentHero)==null?void 0:c.id)||"hero_"+Date.now().toString(),name:t.get("_name"),attributes:{},resources:{}};for(let[r,s]of t.entries())r.startsWith("attr_")&&(e.attributes[r.replace("attr_","")]=Number(s)),r.startsWith("res_")&&(e.resources[r.replace("res_","")]=Number(s));e.hp={current:e.resources.hp_current||10,max:e.resources.hp_max||10},e.hp_current=e.resources.hp_current||10,e.hp_max=e.resources.hp_max||10,this.store.update(r=>{const s=(r.players||[]).findIndex(n=>n.id===e.id);s>=0?r.players[s]={...r.players[s],...e}:(r.players=r.players||[],r.players.push(e)),r.currentHero=e,r.activeTab="dashboard"}),d(()=>import("./Toast-m0Ci56ke.js"),[]).then(r=>r.Toast.show("Personagem salvo no motor multissistema!","success"))});const i=this.element.querySelector("#btn-template-tank");i&&(i.onclick=()=>{if(!this.systemSchema)return;const t=this.element.querySelector("#dynamic-char-form");t.elements.attr_STR&&(t.elements.attr_STR.value=18),t.elements.attr_CON&&(t.elements.attr_CON.value=16),t.elements.res_hp_max&&(t.elements.res_hp_max.value=30),t.elements.res_hp_current&&(t.elements.res_hp_current.value=30),t.elements.res_ac&&(t.elements.res_ac.value=18),d(()=>import("./Toast-m0Ci56ke.js"),[]).then(e=>e.Toast.show("Template Guerreiro Tank aplicado.","info"))}),this.element.querySelectorAll(".rollable-attr").forEach(a=>{a.onclick=async()=>{const t=a.dataset.attr,e=this.state.currentHero;if(!e){d(()=>import("./Toast-m0Ci56ke.js"),[]).then(s=>s.Toast.show("Salve o personagem primeiro antes de rolar!","warning"));return}const{RulesEngine:c}=await d(async()=>{const{RulesEngine:s}=await import("./BattleManager-CjydHzBy.js").then(n=>n.e);return{RulesEngine:s}},__vite__mapDeps([0,1])),r=`1d20+${t}`;try{const s=c.resolveFormula(r,e.attributes||{});let n=`[${s.rolls.join(", ")}] + MOD`;s.isCrit&&(n+=" 🎯 CRÍTICO!"),s.isFumble&&(n+=" 💀 FALHA CRÍTICA!");const m={id:Date.now(),sender:e.name||"Herói",message:`/roll ${r}`,isSystem:!1,isRoll:!0,formula:s.formula,total:s.total,details:n};l&&l.chatHistory&&(l.chatHistory.push([m]),l.chatHistory.length>100&&l.chatHistory.delete(0,l.chatHistory.length-100))}catch(s){console.error("Erro ao rolar:",s)}}})}}export{w as DynamicCharacterBuilder};
