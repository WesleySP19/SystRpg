import{R as r}from"./ReactiveComponent-et3s7fk-.js";import{m as n}from"./main-BrOk6ySq.js";import{T as a}from"./BattleManager-CjydHzBy.js";import{Toast as t}from"./Toast-m0Ci56ke.js";import"./Boot-DMC3Yg8D.js";import"./jsxRuntime.module-OTOYocg5.js";import"./FXEngine-CD41bvJc.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";class f extends r{constructor(e){super(e),this._lastDescription="",this._tone="mysterious"}template(){return n`
            <div class="page" style="max-width:900px; margin:0 auto;">
                <div class="section-header">
                    <div>
                        <h2 class="section-title">🏛️ Construtor de Mundos</h2>
                        <p class="section-subtitle">Use a IA para descrever cenas e locais instantaneamente.</p>
                    </div>
                </div>

                <div class="grid grid-2" style="gap:20px;">
                    <!-- Controls -->
                    <div class="card glass-accent" style="padding:20px;">
                        <h3 style="font-size:1rem; margin-bottom:15px;">Gerar Descrição de Cena</h3>
                        <div class="form-group">
                            <label class="form-label">O que os heróis veem?</label>
                            <input type="text" id="scene-input" class="form-input" placeholder="Ex: Uma cripta antiga, uma taverna cheia..." />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tom da Narração</label>
                            <select id="tone-select" class="form-select">
                                <option value="mysterious">Misterioso & Sombrio</option>
                                <option value="epic">Épico & Majestoso</option>
                                <option value="horror">Horror & Agonizante</option>
                                <option value="peaceful">Calmo & Sereno</option>
                            </select>
                        </div>
                        <button class="btn btn-primary btn-block" data-action="generateScene" style="margin-top:10px;">
                            <i class="fa-solid fa-wand-sparkles"></i> DESCREVER CENA
                        </button>
                    </div>

                    <!-- Result -->
                    <div class="card" style="padding:20px; display:flex; flex-direction:column; min-height:300px;">
                        <h3 style="font-size:0.8rem; color:var(--accent); text-transform:uppercase; margin-bottom:10px;">Box Text (Narração)</h3>
                        <div id="description-result" style="flex:1; font-family: 'Crimson Text', serif; font-size:1.1rem; line-height:1.6; font-style:italic; color:var(--text-dim); overflow-y:auto; padding:15px; background:rgba(0,0,0,0.2); border-radius:8px;">
                            ${this._lastDescription||"Aguardando inspiração..."}
                        </div>
                        <button class="btn btn-ghost btn-sm" style="margin-top:10px;" data-action="copyToJournal" ${this._lastDescription?"":"disabled"}>
                            <i class="fa-solid fa-book"></i> Copiar para o Diário
                        </button>
                    </div>
                </div>
            </div>
        `}async generateScene(){const e=this.$("#scene-input").value,i=this.$("#tone-select").value;if(!e)return t.show("Descreva brevemente o local.","warning");t.show("Tecendo a narrativa...");try{const o=`Descreva em um parágrafo imersivo para um mestre de RPG ler para os jogadores: ${e}. O tom deve ser ${i}.`,s=await a.ai.narrate(o);this._lastDescription=s,this.render()}catch{t.show("O oráculo está em silêncio...","danger")}}copyToJournal(){a.store.update(e=>{e.journalEntries=[...e.journalEntries||[],{id:Date.now(),date:new Date().toLocaleDateString(),content:`📖 DESCRIÇÃO: ${this._lastDescription}`}]}),t.show("Cena salva no Diário!")}}export{f as DMShield};
