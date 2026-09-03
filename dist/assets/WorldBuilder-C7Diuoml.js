import{d as c,A as b,T as p}from"./FXEngine-BKbXWGrS.js";import{u as y,m as h}from"./Boot-DAySS35W.js";import{Toast as s}from"./Toast-m0Ci56ke.js";import"./main-D1rT7FkT.js";import"./tailwind-CmMg74VE.js";function R(x){y();const[a,d]=c(""),[w,C]=c("mysterious"),r=b(null),u=e=>{const t=e.target.closest("[data-action]");if(t){const o=t.dataset.action;o==="generateScene"&&m(),o==="copyToJournal"&&v()}},m=async()=>{var n,i;const e=(n=r.current)==null?void 0:n.querySelector("#scene-input"),t=(i=r.current)==null?void 0:i.querySelector("#tone-select"),o=e?e.value:"",f=t?t.value:"mysterious";if(!o)return s.show("Descreva brevemente o local.","warning");s.show("Tecendo a narrativa...");try{const l=`Descreva em um parágrafo imersivo para um mestre de RPG ler para os jogadores: ${o}. O tom deve ser ${f}.`,g=await p.ai.narrate(l);d(g)}catch{s.show("O oráculo está em silêncio...","danger")}},v=()=>{a&&(p.store.update(e=>{e.journalEntries=[...e.journalEntries||[],{id:Date.now(),timestamp:Date.now(),date:new Date().toLocaleDateString("pt-BR"),type:"info",title:"Descrição de Cena",content:a}]}),s.show("Cena salva na linha do tempo!"))};return h`
        <div class="page" ref=${r} onClick=${u} style="max-width:900px; margin:0 auto;">
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
                        ${a||"Aguardando inspiração..."}
                    </div>
                    <button class="btn btn-ghost btn-sm" style="margin-top:10px;" data-action="copyToJournal" ${a?"":"disabled"}>
                        <i class="fa-solid fa-book"></i> Copiar para o Diário
                    </button>
                </div>
            </div>
        </div>
    `}export{R as WorldBuilder};
