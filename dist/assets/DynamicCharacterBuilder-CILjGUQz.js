const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/BattleManager-0aKgsbKs.js","assets/BattleManager-BaWEY9CD.css"])))=>i.map(i=>d[i]);
import{_ as d}from"./main-9sWSJyi_.js";import{C as m}from"./Boot-zbOxlXxn.js";import{C as l}from"./CRDTManager-CgAUmNs0.js";import"./BattleManager-0aKgsbKs.js";import"./jsxRuntime.module-B31ux8iJ.js";import"./FXEngine-CLpy8O3f.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";import"./y-websocket-DdQpu-E3.js";class w extends m{constructor(i){super(i),this.state=this.store.state,this.systemSchema=null,this.isLoading=!0,this.error=null}async onMount(){await this.fetchSystemSchema(),this._bindEvents()}async fetchSystemSchema(){try{const o=await(await fetch("/api/system/active")).json();o.status==="success"&&o.data?this.systemSchema=o.data.sheetSchema:this.error=o.message||"Sistema não encontrado."}catch{this.error="Erro ao carregar o sistema. Verifique a conexão com o servidor."}this.isLoading=!1,this.render()}template(){if(this.isLoading)return`<div style="text-align:center; padding: 50px; color:var(--accent); font-family: 'Cinzel';">Carregando Motor Multissistema...</div>`;if(this.error)return`<div style="text-align:center; padding: 50px; color:var(--danger);">${this.error}</div>`;const i=this.systemSchema,o=this.state.currentHero||{};return`
            <div class="card glass-accent" style="padding:30px; max-width:800px; margin:auto; color: #fff; border-radius: 12px;">
                <h2 style="font-family:'Cinzel'; color:var(--accent); text-align:center; text-transform: uppercase;">✨ Construtor de Personagem Dinâmico</h2>
                <p style="text-align:center; color:var(--text-dim); margin-bottom: 20px; font-size: 0.8rem;">Sistema Ativo: ${i.version}</p>
                
                <form id="dynamic-char-form">
                    <div style="margin-bottom:25px;">
                        <label style="color: var(--accent); font-weight: 700; margin-bottom: 8px; display: block;">NOME DO HERÓI</label>
                        <input type="text" name="_name" class="form-control" style="background: rgba(0,0,0,0.5); color: #fff; border: 1px solid rgba(197,160,89,0.3); border-radius: 6px; padding: 10px; width: 100%;" value="${o.name||""}" required />
                    </div>

                    <div style="display: flex; gap: 40px; flex-wrap: wrap; margin-bottom: 30px;">
                        <!-- Atributos -->
                        <div style="flex: 1; min-width: 250px;">
                            <h3 style="color:var(--accent); border-bottom: 1px solid rgba(197,160,89,0.3); padding-bottom:8px; font-family: 'Cinzel';">Atributos Base</h3>
                            <div style="display: grid; gap: 12px; margin-top: 15px;">
                                ${Object.entries(i.attributes||{}).map(([s,t])=>{var e;return`
                                    <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
                                        <label class="rollable-attr" data-attr="${s}" style="font-weight: 600; font-size: 0.9rem; cursor: pointer; color: var(--accent); border-bottom: 1px dashed var(--accent);" title="Rolar teste de ${t.label}"><i class="fa-solid fa-dice-d20"></i> ${t.label}</label>
                                        <input type="${t.type}" name="attr_${s}" value="${((e=o.attributes)==null?void 0:e[s])||t.default}" style="width: 70px; text-align:center; background: rgba(0,0,0,0.6); color: #fff; border: 1px solid var(--accent); border-radius: 4px; padding: 4px;" />
                                    </div>
                                `}).join("")}
                            </div>
                        </div>

                        <!-- Recursos -->
                        <div style="flex: 1; min-width: 250px;">
                            <h3 style="color:var(--accent); border-bottom: 1px solid rgba(197,160,89,0.3); padding-bottom:8px; font-family: 'Cinzel';">Recursos (Vitalidade, Magia)</h3>
                            <div style="display: grid; gap: 12px; margin-top: 15px;">
                                ${Object.entries(i.resources||{}).map(([s,t])=>{var e;return`
                                    <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
                                        <label style="text-transform: capitalize; font-weight: 600; font-size: 0.9rem;">${s.replace("_"," ")}</label>
                                        <input type="${t.type}" name="res_${s}" value="${((e=o.resources)==null?void 0:e[s])||t.default}" style="width: 70px; text-align:center; background: rgba(0,0,0,0.6); color: #fff; border: 1px solid var(--danger); border-radius: 4px; padding: 4px;" />
                                    </div>
                                `}).join("")}
                            </div>
                        </div>
                    </div>

                    <div style="background: rgba(197, 160, 89, 0.05); padding: 15px; border-radius: 8px; border: 1px dashed rgba(197,160,89,0.3); text-align: center; margin-bottom: 25px;">
                        <span style="display: block; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 10px;">Atalhos Multissistema</span>
                        <button type="button" id="btn-template-tank" class="btn btn-ghost" style="border: 1px solid var(--accent); color: var(--accent);">Criar: Guerreiro Tank</button>
                    </div>

                    <button type="submit" class="btn btn-primary btn-block" style="padding: 15px; font-size: 1.1rem; font-family: 'Cinzel'; letter-spacing: 2px;">
                        <i class="fa-solid fa-save"></i> SALVAR PERSONAGEM
                    </button>
                </form>
            </div>
        `}_bindEvents(){if(!this.element)return;const i=this.element.querySelector("#dynamic-char-form");i&&(i.onsubmit=s=>{var c;s.preventDefault();const t=new FormData(i),e={id:((c=this.state.currentHero)==null?void 0:c.id)||"hero_"+Date.now().toString(),name:t.get("_name"),attributes:{},resources:{}};for(let[r,a]of t.entries())r.startsWith("attr_")&&(e.attributes[r.replace("attr_","")]=Number(a)),r.startsWith("res_")&&(e.resources[r.replace("res_","")]=Number(a));e.hp={current:e.resources.hp_current||10,max:e.resources.hp_max||10},e.hp_current=e.resources.hp_current||10,e.hp_max=e.resources.hp_max||10,this.store.update(r=>{const a=(r.players||[]).findIndex(n=>n.id===e.id);a>=0?r.players[a]={...r.players[a],...e}:(r.players=r.players||[],r.players.push(e)),r.currentHero=e,r.activeTab="dashboard"}),d(()=>import("./Toast-m0Ci56ke.js"),[]).then(r=>r.Toast.show("Personagem salvo no motor multissistema!","success"))});const o=this.element.querySelector("#btn-template-tank");o&&(o.onclick=()=>{if(!this.systemSchema)return;const t=this.element.querySelector("#dynamic-char-form");t.elements.attr_STR&&(t.elements.attr_STR.value=18),t.elements.attr_CON&&(t.elements.attr_CON.value=16),t.elements.res_hp_max&&(t.elements.res_hp_max.value=30),t.elements.res_hp_current&&(t.elements.res_hp_current.value=30),t.elements.res_ac&&(t.elements.res_ac.value=18),d(()=>import("./Toast-m0Ci56ke.js"),[]).then(e=>e.Toast.show("Template Guerreiro Tank aplicado.","info"))}),this.element.querySelectorAll(".rollable-attr").forEach(s=>{s.onclick=async()=>{const t=s.dataset.attr,e=this.state.currentHero;if(!e){d(()=>import("./Toast-m0Ci56ke.js"),[]).then(a=>a.Toast.show("Salve o personagem primeiro antes de rolar!","warning"));return}const{RulesEngine:c}=await d(async()=>{const{RulesEngine:a}=await import("./BattleManager-0aKgsbKs.js").then(n=>n.e);return{RulesEngine:a}},__vite__mapDeps([0,1])),r=`1d20+${t}`;try{const a=c.resolveFormula(r,e.attributes||{});let n=`[${a.rolls.join(", ")}] + MOD`;a.isCrit&&(n+=" 🎯 CRÍTICO!"),a.isFumble&&(n+=" 💀 FALHA CRÍTICA!");const p={id:Date.now(),sender:e.name||"Herói",message:`/roll ${r}`,isSystem:!1,isRoll:!0,formula:a.formula,total:a.total,details:n};l&&l.chatHistory&&(l.chatHistory.push([p]),l.chatHistory.length>100&&l.chatHistory.delete(0,l.chatHistory.length-100))}catch(a){console.error("Erro ao rolar:",a)}}})}}export{w as DynamicCharacterBuilder};
