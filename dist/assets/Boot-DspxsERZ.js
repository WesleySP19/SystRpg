const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/PartyStatusHUD-CGai47bx.js","assets/BattleManager-CrdQ-hKX.js","assets/main-V8m65_sL.js","assets/main-DEzkeF59.css","assets/PersistenceService-BnWdIWzY.js","assets/FXEngine-B5qxl4oR.js","assets/ChatBox-CvstqGU0.js","assets/y-websocket-DdQpu-E3.js"])))=>i.map(i=>d[i]);
var q=Object.defineProperty;var G=(n,t,a)=>t in n?q(n,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):n[t]=a;var O=(n,t,a)=>G(n,typeof t!="symbol"?t+"":t,a);import{_ as m}from"./main-V8m65_sL.js";import{j as U,R as H,T as r,k as _,D as W}from"./BattleManager-CrdQ-hKX.js";import{P as N}from"./PersistenceService-BnWdIWzY.js";import{F as J}from"./FXEngine-B5qxl4oR.js";import{io as X}from"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";function z(n){return!n||n.startsWith("/")||n.startsWith(".")||n.startsWith("http://127.0.0.1")||n.startsWith("http://localhost")||typeof window<"u"&&window.location&&n.startsWith(window.location.origin)?!1:n.startsWith("http://")||n.startsWith("https://")}class Y{constructor(){this.ctx=null,this.masterGain=null,this._channels={music:{audio:null,source:null,gain:null,volume:.5},ambience:{audio:null,source:null,gain:null,volume:.5}},this._masterVolume=1}_initAudioContext(){if(!this.ctx)try{const t=window.AudioContext||window.webkitAudioContext;this.ctx=new t,this.masterGain=this.ctx.createGain(),this.masterGain.gain.setValueAtTime(this._masterVolume,this.ctx.currentTime),this.masterGain.connect(this.ctx.destination)}catch(t){console.error("[AudioService] Failed to initialize AudioContext:",t)}}async playSFX(t){this._initAudioContext();try{const a=new Audio(t);if(this.ctx&&!z(t)){a.crossOrigin="anonymous",this.ctx.state==="suspended"&&this.ctx.resume();const o=this.ctx.createGain();o.gain.setValueAtTime(this._masterVolume*.5,this.ctx.currentTime),o.connect(this.ctx.destination);const i=this.ctx.createMediaElementSource(a);i.connect(o),a.play().catch(()=>{}),a.onended=()=>{i.disconnect(),o.disconnect()}}else a.volume=this._masterVolume*.5,await a.play().catch(()=>{})}catch(a){console.warn("[Audio] SFX failed:",t,a)}}playChannel(t,a){if(this._initAudioContext(),!this._channels[t])return;this.stopChannel(t);const e=this._channels[t],o=new Audio(a),i=this.ctx&&!z(a);if(i&&(o.crossOrigin="anonymous"),o.loop=!0,i){this.ctx.state==="suspended"&&this.ctx.resume(),e.gain||(e.gain=this.ctx.createGain(),e.gain.connect(this.masterGain));const s=this.ctx.createMediaElementSource(o);s.connect(e.gain),e.source=s,e.gain.gain.setValueAtTime(e.volume,this.ctx.currentTime)}else o.volume=e.volume*this._masterVolume;o.play().catch(()=>{}),e.audio=o}stopChannel(t){const a=this._channels[t];a&&(a.audio&&(a.audio.pause(),a.audio=null),a.source&&(a.source.disconnect(),a.source=null))}setChannelVolume(t,a){const e=this._channels[t];e&&(e.volume=a,this.ctx&&e.gain&&e.source?e.gain.gain.setValueAtTime(a,this.ctx.currentTime):e.audio&&(e.audio.volume=a*this._masterVolume))}stopAll(){Object.keys(this._channels).forEach(t=>this.stopChannel(t))}setMasterVolume(t){this._masterVolume=t,this.ctx&&this.masterGain?this.masterGain.gain.setValueAtTime(t,this.ctx.currentTime):Object.keys(this._channels).forEach(a=>{const e=this._channels[a];e.audio&&(e.audio.volume=e.volume*t)})}async fadeTo(t,a,e=2e3){try{this._initAudioContext();const o=this._channels[t];if(!o)return;const i=e/1e3;if(!(this.ctx&&!z(a)&&!(o.audio&&z(o.audio.src)))){await this._fallbackFadeTo(t,a,e);return}this.ctx.state==="suspended"&&this.ctx.resume();const l=o.audio,p=o.gain,f=o.source,d=new Audio(a);d.crossOrigin="anonymous",d.loop=!0;const h=this.ctx.createGain();h.connect(this.masterGain);const g=this.ctx.createMediaElementSource(d);g.connect(h);const b=this.ctx.currentTime;l&&p&&(p.gain.setValueAtTime(p.gain.value,b),p.gain.linearRampToValueAtTime(0,b+i)),h.gain.setValueAtTime(0,b),h.gain.linearRampToValueAtTime(o.volume,b+i),d.play().catch(()=>{}),o.audio=d,o.gain=h,o.source=g,setTimeout(()=>{l&&l.pause(),f&&f.disconnect(),p&&p.disconnect()},e+100)}catch(o){console.warn("[AudioService] WebAudio fadeTo failed, using fallback:",o),await this._fallbackFadeTo(t,a,e)}}async _fallbackFadeTo(t,a,e){const o=this._channels[t];if(o.audio){const f=o.audio.volume,d=20,h=e/2/d;for(let g=d;g>=0&&o.audio;g--)o.audio.volume=g/d*f,await new Promise(b=>setTimeout(b,h));o.audio&&o.audio.pause()}const i=new Audio(a);i.loop=!0,i.volume=0,this._channels[t].audio=i,await i.play().catch(()=>{});const s=o.volume*this._masterVolume,l=20,p=e/2/l;for(let f=0;f<=l;f++)i.volume=f/l*s,await new Promise(d=>setTimeout(d,p))}}class Q{constructor(){if(this._baseUrl="http://localhost:3001/api",this._ollamaUrl="http://localhost:11434/api/generate",this._ollamaModel="llama3",this._token="tome_secure_2026",this._timeout=8e3,this._worker=null,this._workerCallbacks=new Map,typeof window<"u"&&window.Worker)try{this._worker=new Worker("/public/workers/aiWorker.js"),this._worker.onmessage=t=>{const{id:a,result:e,status:o,error:i}=t.data;if(this._workerCallbacks.has(a)){const{resolve:s,reject:l}=this._workerCallbacks.get(a);o==="success"?s(e):l(new Error(i)),this._workerCallbacks.delete(a)}}}catch(t){console.warn("[AIService] Não foi possível iniciar AI Worker, operando na main thread.",t)}}_runInWorker(t,a,e={}){return this._worker?new Promise((o,i)=>{const s=Math.random().toString(36).substring(2);this._workerCallbacks.set(s,{resolve:o,reject:i}),this._worker.postMessage({id:s,type:t,query:a,payload:e})}):null}async _fetch(t,a){const e=new AbortController,o=setTimeout(()=>e.abort(),this._timeout);try{const i=await fetch(`${this._baseUrl}${t}`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this._token}`},body:JSON.stringify(a),signal:e.signal});if(clearTimeout(o),!i.ok)throw new Error(`HTTP ${i.status}`);return await i.json()}catch(i){throw clearTimeout(o),i}}async narrate(t){try{return(await this._fetch("/ai/narrate",{logs:t})).narrative}catch{return"A névoa do destino impede a visão clara do momento..."}}async generateRumor(t){try{return(await this._fetch("/ai/rumor",{context:t})).rumor}catch{const a=["Dizem que as luzes na floresta não são fadas, mas sim olhos de algo antigo...","O taverneiro jura que viu o barão conversando com uma sombra no jardim.","Há uma recompensa para quem encontrar o medalhão perdido da sacerdotisa.","Dizem que o poço da vila está secando por causa de uma maldição."];return a[Math.floor(Math.random()*a.length)]}}_localTactics(t){const a=(t.type||"").toLowerCase(),e=parseFloat(t.cr||0);return a.includes("besta")?"Comportamento Animal: Ataca o alvo mais próximo. Se cair abaixo de 25% HP, tenta fugir.":a.includes("humanoide")?"Combate Tático: Flanqueia alvos isolados. Foca em conjuradores. Usa cobertura.":a.includes("morto-vivo")?"Incansável: Ataca sem medo até ser destruído. Ignora táticas defensivas.":a.includes("dragão")||e>10?"Predador de Elite: Usa sopro/área sempre que disponível. Mantém distância voando.":"Instinto de Combate: Ataca quem estiver mais perto. Troca de alvo se receber golpe crítico."}async ask(t,a=""){try{const e=await this._fetch("/ai/ask",{prompt:t,context:a});if(e&&(e.text||e.response))return e.text||e.response}catch{}try{const e=await this._fetchOllama(t,a);if(e)return e}catch{}return await this._localAsk(t)}async _fetchOllama(t,a){const e=new AbortController,o=setTimeout(()=>e.abort(),6e3);try{const i=await fetch(this._ollamaUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:this._ollamaModel,prompt:a?`${a}

Pergunta: ${t}`:t,stream:!1,options:{temperature:.7}}),signal:e.signal});if(clearTimeout(o),!i.ok)return null;const s=await i.json();return s.response?s.response.trim():null}catch{return clearTimeout(o),null}}async oracleSearch(t,a){if(!a||!a.state)return"Nenhum arquivo de campanha carregado no Oráculo.";if(this._worker)try{typeof window<"u"&&window.dispatchEvent(new CustomEvent("tome:ai_processing",{detail:{active:!0}}));const e=await this._runInWorker("ORACLE_SEARCH",t,{state:a.state});typeof window<"u"&&window.dispatchEvent(new CustomEvent("tome:ai_processing",{detail:{active:!1}}));try{const o=await this._fetchOllama(`A partir das notas de RPG abaixo, responda concisamente em bom português de fantasia: "${t}"

Notas:
${e}`);if(o)return`✨ **Resposta do Oráculo:**
${o}

*Fontes Originais:*
${e}`}catch{}return e}catch(e){typeof window<"u"&&window.dispatchEvent(new CustomEvent("tome:ai_processing",{detail:{active:!1}})),console.warn("[AIService] Falha na delegação do Worker:",e)}return"O Oráculo não conseguiu invocar os espíritos auxiliares (Worker) a tempo. Conexão nebulosa..."}async _localAsk(t){if(this._worker)try{typeof window<"u"&&window.dispatchEvent(new CustomEvent("tome:ai_processing",{detail:{active:!0}}));const a=await this._runInWorker("LOCAL_ASK",t);return typeof window<"u"&&window.dispatchEvent(new CustomEvent("tome:ai_processing",{detail:{active:!1}})),a}catch{}return"O destino sussurra, mas a Main Thread está sobrecarregada demais para ouvir claramente."}}class L{constructor(t={}){this.store=t.store||null,this.element=t.element||null,this.props=t.props||{},this._lastHTML="",this._unsubscribe=null,this._eventCleanups=[],this._mounted=!1}mount(){this._mounted||(this._mounted=!0,this.store&&(this._unsubscribe=U(()=>{this.onStoreUpdate(this.store.signal.value)})),this.render())}unmount(){if(this._mounted=!1,this._unsubscribe&&(this._unsubscribe(),this._unsubscribe=null),this._eventCleanups.forEach(t=>t()),this._eventCleanups=[],this.onUnmount(),this.element){try{H(null,this.element)}catch{}this.element.innerHTML=""}}onStoreUpdate(t){this.render()}render(t){if(!(!this.element||!this._mounted)){if(t&&typeof this["render_"+t]=="function"){requestAnimationFrame(()=>{this._mounted&&this["render_"+t]()});return}this._renderPending||(this._renderPending=!0,requestAnimationFrame(()=>{if(this._renderPending=!1,!this._mounted)return;const a=this.template();if(typeof a=="string"){let e=a.trim();if(e=e.replace(/<img(?!.*?loading=)([^>]+)>/g,'<img loading="lazy"$1>'),e===this._lastHTML)return;this._eventCleanups.forEach(o=>o()),this._eventCleanups=[],this.element.innerHTML=e,this._lastHTML=e,this.element&&this.element.children&&Array.from(this.element.children).forEach(o=>{o.__component=this}),this._bindDelegatedEvents(),typeof this.onMount=="function"&&this.onMount()}else a!=null&&(H(a,this.element),this._vdomMounted||(typeof this.onMount=="function"&&this.onMount(),this._vdomMounted=!0))}))}}template(){return""}onMount(){}onUnmount(){}_bindDelegatedEvents(){this.element.querySelectorAll("[data-action]").forEach(t=>{const a=t.dataset.action;typeof this[a]=="function"&&(t.onclick=e=>this[a](e,t))})}listen(t,a,e){t.addEventListener(a,e),this._eventCleanups.push(()=>t.removeEventListener(a,e))}$(t){var a;return((a=this.element)==null?void 0:a.querySelector(t))||null}$$(t){var a;return((a=this.element)==null?void 0:a.querySelectorAll(t))||[]}}class K extends L{template(){const{activeTab:t}=this.store.state;return`
            <style>
                /* ── Sidebar Minimalista v15.0 ("Modern Epic") ── */
                .sidebar {
                    display: flex;
                    flex-direction: column;
                    width: var(--sidebar-w, 265px);
                    height: 100vh;
                    background: #08090d !important;
                    border-right: 1px solid rgba(197, 160, 89, 0.12);
                    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.65);
                    overflow: hidden;
                    flex-shrink: 0;
                    z-index: 100;
                }

                /* Cabeçalho */
                .sm-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 20px 18px 16px;
                    border-bottom: 1px solid rgba(197, 160, 89, 0.1);
                    background: #0a0c12 !important;
                    flex-shrink: 0;
                }
                .sm-header-icon {
                    width: 34px;
                    height: 34px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(15, 17, 26, 0.8) 100%);
                    border: 1px solid rgba(212, 175, 55, 0.35);
                    box-shadow: 0 0 10px rgba(212, 175, 55, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #d4af37;
                    font-size: 0.95rem;
                    flex-shrink: 0;
                }
                .sm-header-text {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    min-width: 0;
                }
                .sm-title {
                    font-family: 'Cinzel', serif;
                    font-size: 0.92rem;
                    font-weight: 800;
                    color: #f1f5f9;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    letter-spacing: 0.05em;
                }
                .sm-badge {
                    font-size: 0.58rem;
                    color: #d4af37;
                    text-transform: uppercase;
                    letter-spacing: 0.12em;
                    font-weight: 700;
                    opacity: 0.9;
                }

                /* Nav */
                .sm-nav {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .sm-nav::-webkit-scrollbar { width: 4px; }
                .sm-nav::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 4px; }

                .sm-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 9px 12px;
                    border-radius: 8px;
                    border: 1px solid transparent;
                    cursor: pointer;
                    background: none;
                    color: #94a3b8;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.81rem;
                    font-weight: 500;
                    text-align: left;
                    width: 100%;
                    transition: color 0.18s, background 0.18s, border-color 0.18s, transform 0.18s;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .sm-item i {
                    font-size: 0.82rem;
                    width: 16px;
                    text-align: center;
                    flex-shrink: 0;
                    opacity: 0.7;
                    transition: opacity 0.18s, color 0.18s, transform 0.18s;
                }
                .sm-item:hover {
                    background: rgba(255, 255, 255, 0.035);
                    color: #f8fafc;
                    border-color: rgba(255, 255, 255, 0.06);
                    transform: translateX(2px);
                }
                .sm-item:hover i { opacity: 1; color: #d4af37; }
                .sm-item.active {
                    background: linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.03) 100%);
                    color: #f3e5ab;
                    border-color: rgba(212, 175, 55, 0.25);
                    font-weight: 600;
                    box-shadow: inset 3px 0 0 #d4af37;
                }
                .sm-item.active i { opacity: 1; color: #d4af37; filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.4)); }

                /* Separador */
                .sm-sep {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(197, 160, 89, 0.15), transparent);
                    margin: 8px 4px;
                }

                /* Footer */
                .sm-footer {
                    padding: 12px 10px;
                    border-top: 1px solid rgba(197, 160, 89, 0.1);
                    background: #0a0c12 !important;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    flex-shrink: 0;
                }
                .sm-footer-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 11px;
                    border-radius: 8px;
                    border: 1px solid transparent;
                    cursor: pointer;
                    background: none;
                    color: #64748b;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.76rem;
                    font-weight: 500;
                    text-align: left;
                    width: 100%;
                    transition: all 0.18s ease;
                }
                .sm-footer-btn i {
                    font-size: 0.75rem;
                    width: 15px;
                    text-align: center;
                    flex-shrink: 0;
                }
                .sm-footer-btn:hover {
                    background: rgba(255, 255, 255, 0.04);
                    color: #cbd5e1;
                }
                .sm-footer-btn.danger {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.06);
                    border-color: rgba(239, 68, 68, 0.15);
                    font-weight: 600;
                }
                .sm-footer-btn.danger:hover {
                    background: rgba(239, 68, 68, 0.12);
                    color: #f87171;
                    box-shadow: 0 0 12px rgba(239, 68, 68, 0.2);
                }
                .sm-footer-btn.gold {
                    color: #d4af37;
                    background: rgba(212, 175, 55, 0.07);
                    border-color: rgba(212, 175, 55, 0.2);
                    font-weight: 600;
                }
                .sm-footer-btn.gold:hover {
                    background: rgba(212, 175, 55, 0.14);
                    color: #f3e5ab;
                    box-shadow: 0 0 12px rgba(212, 175, 55, 0.2);
                }

                /* Status */
                .sm-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 10px 2px;
                }
                .sm-status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #22c55e;
                    box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
                    flex-shrink: 0;
                }
                .sm-status-label {
                    font-size: 0.62rem;
                    color: #475569;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                /* Botões de ação lado a lado */
                .sm-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 5px;
                }
            </style>

            <!-- Cabeçalho -->
            <div class="sm-header">
                <div class="sm-header-icon">
                    <i class="fa-solid fa-dice-d20"></i>
                </div>
                <div class="sm-header-text">
                    <span class="sm-title">Mesa do Mestre</span>
                    <span class="sm-badge">V18.5</span>
                </div>
            </div>

            <!-- Navegação principal -->
            <nav class="sm-nav">
                <button class="sm-item ${t==="campaign"?"active":""}"
                        data-action="navigate" data-tab="campaign">
                    <i class="fa-solid fa-users-viewfinder"></i>
                    <span>Gestão de Campanha</span>
                </button>

                <div class="sm-sep"></div>

                ${[{id:"dmtable",label:"Mesa do Mestre",icon:"fa-table-cells-large"},{id:"dashboard",label:"Painel de Controle",icon:"fa-shield-halved"},{id:"dmshield",label:"Escudo do Mestre",icon:"fa-scroll"},{id:"combat",label:"Combate Tatico",icon:"fa-crosshairs"},{id:"initiative",label:"Monitor de Iniciativa",icon:"fa-swords"},{id:"quest",label:"Gerenciador de Quests",icon:"fa-hat-wizard"},{id:"journal",label:"Diario de Sessao",icon:"fa-book-open-reader"},{id:"npc",label:"Gerador de NPCs",icon:"fa-user-secret"},{id:"herohub",label:"Monitor de Herois",icon:"fa-users"},{id:"tomesinal",label:"Elo Arcano",icon:"fa-satellite-dish"},{id:"cardgenerator",label:"Gerador de Cartas",icon:"fa-address-card"},{id:"bestiary",label:"Bestiario",icon:"fa-dragon"},{id:"loot",label:"Gerador de Loot",icon:"fa-coins"},{id:"settings",label:"Glossario de Regras",icon:"fa-book"}].map(e=>`
                    <button class="sm-item ${t===e.id?"active":""}"
                            data-action="navigate" data-tab="${e.id}">
                        <i class="fa-solid ${e.icon}"></i>
                        <span>${e.label}</span>
                    </button>
                `).join("")}
            </nav>

            <!-- Rodapé com ações -->
            <div class="sm-footer">
                <div class="sm-row">
                    <button class="sm-footer-btn" data-action="exportCampaign">
                        <i class="fa-solid fa-file-export"></i> Exportar
                    </button>
                    <button class="sm-footer-btn" data-action="importCampaign">
                        <i class="fa-solid fa-file-import"></i> Importar
                    </button>
                </div>

                <button class="sm-footer-btn" onclick="window.location.href='/index.html?reset=1'">
                    <i class="fa-solid fa-broom"></i> Limpar Cache
                </button>

                <button class="sm-footer-btn gold" data-action="openTolkienSummon">
                    <i class="fa-solid fa-dragon"></i> Invocação de Tolkien
                </button>

                <button class="sm-footer-btn danger" data-action="finishSession">
                    <i class="fa-solid fa-flag-checkered"></i> Finalizar Sessão
                </button>

                <div class="sm-status">
                    <div class="sm-status-dot"></div>
                    <span class="sm-status-label">Sistema Ativo</span>
                </div>
            </div>
        `}async finishSession(){var P;const t=r.store.state,a=((P=r.persistence)==null?void 0:P.filename)||"state.json";let e=[];try{const c=localStorage.getItem("DM_ACTIVE_TABLE")||"",u=c?`TOME_SESSION_LIST_${c}`:"TOME_SESSION_LIST";e=JSON.parse(localStorage.getItem(u)||"[]")}catch{}const o=e.find(c=>c.file===a),i=o?o.name:"Mesa Padrão";let s=1;t.journalEntries&&t.journalEntries.length>0&&(s=t.journalEntries.length);const l=parseInt(localStorage.getItem("DM_SESSION_START")||Date.now()),p=Date.now()-l,f=Math.floor(p/36e5),d=Math.floor(p%36e5/6e4),h=`${f}h ${d}m`,g=new Date().toLocaleDateString("pt-BR"),b=localStorage.getItem("DM_MASTER_NAME")||"Mestre",C=localStorage.getItem("DM_INTERNAL_ID")||"DGH-MST-8F2A91",E=localStorage.getItem("DM_ACTIVE_TABLE")||"Sem Mesa",S=t.players?t.players.map(c=>c.name):[],T=t.journalEntries?t.journalEntries.map(c=>c.content||c.title||""):[],x=t.sessionLoot?t.sessionLoot.split(`
`).map(c=>c.trim()).filter(Boolean):[],k=t._aiCronicle||t.sessionNotes||"Nenhum resumo narrativo registrado.",M={session_id:`SES-${String(s).padStart(3,"0")}`,mesa:i,mestre:b,inicio:new Date(l).toLocaleString("pt-BR"),fim:new Date().toLocaleString("pt-BR"),jogadores:S,eventos:T,xp_distribuido:t.xpDistributed||0,itens_obtidos:x,resumo:k},R=document.getElementById("close-session-modal");R&&R.remove();const v=document.createElement("div");v.id="close-session-modal",v.style.cssText=`
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.25s ease;
            color: #f1f5f9;
            font-family: 'Outfit', sans-serif;
            box-sizing: border-box;
        `,v.innerHTML=`
            <div class="card glass-accent" style="max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 30px; border-radius: 18px; border: 2px solid rgba(197, 160, 89, 0.35); background: rgba(10,12,16,0.98); box-shadow: 0 20px 50px rgba(0,0,0,0.9); text-align: left; display: flex; flex-direction: column; gap: 20px;">
                
                <div style="border-bottom: 1.5px solid rgba(197, 160, 89, 0.25); padding-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 0.65rem; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; font-family: 'Cinzel';">Fechamento do Grimório</span>
                        <h3 style="margin: 5px 0 0; font-family: 'Cinzel', serif; font-size: 1.5rem; color: #fff; display: flex; align-items: center; gap: 8px;">
                            🏁 Portal de Encerramento da Sessão
                        </h3>
                    </div>
                    <button class="btn btn-ghost close-btn" style="border-radius: 50%; width: 36px; height: 36px; padding: 0; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; overflow-y: auto; max-height: 50vh;">
                    
                    <div style="border: 1px solid rgba(197, 160, 89, 0.2); padding: 15px; border-radius: 10px; background: rgba(0,0,0,0.25); overflow-y: auto;">
                        <h4 style="font-family: 'Cinzel'; font-size: 0.95rem; color: var(--accent); margin: 0 0 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">📖 Relatório Narrativo (Preview)</h4>
                        <div style="font-size: 0.8rem; line-height: 1.6; display: flex; flex-direction: column; gap: 10px;">
                            <div>
                                <strong style="color: #fff; font-family: 'Cinzel';">Título:</strong>
                                <span>${t.sessionTitle||"Aventura de "+g}</span>
                            </div>
                            <div>
                                <strong style="color: #fff; font-family: 'Cinzel';">Mesa:</strong>
                                <span>${i}</span>
                            </div>
                            <div>
                                <strong style="color: #fff; font-family: 'Cinzel';">Duração:</strong>
                                <span>${h} (Encerrado em ${g})</span>
                            </div>
                            <div>
                                <strong style="color: #fff; font-family: 'Cinzel';">Heróis Ativos:</strong>
                                <span style="display: block; font-size: 0.75rem; color: #cbd5e1; margin-top: 2px;">
                                    ${S.length>0?S.join(", "):"Nenhum jogador ativo"}
                                </span>
                            </div>
                            <div>
                                <strong style="color: #fff; font-family: 'Cinzel';">XP Distribuído:</strong>
                                <span style="color: var(--success); font-weight: bold;">+${t.xpDistributed||0} XP</span>
                            </div>
                            <div>
                                <strong style="color: #fff; font-family: 'Cinzel';">Tesouros Obtidos:</strong>
                                <span style="display: block; font-size: 0.75rem; color: #cbd5e1; font-style: italic; margin-top: 2px;">
                                    ${x.length>0?x.join(" • "):"Nenhum item especial."}
                                </span>
                            </div>
                            <div>
                                <strong style="color: #fff; font-family: 'Cinzel';">Crônica do Bardo:</strong>
                                <p style="font-size: 0.75rem; font-style: italic; color: #cbd5e1; margin: 4px 0 0 0; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03); max-height: 120px; overflow-y: auto;">
                                    ${k}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style="border: 1px solid rgba(255,255,255,0.06); padding: 15px; border-radius: 10px; background: rgba(5,5,8,0.6); display: flex; flex-direction: column;">
                        <h4 style="font-family: 'Cinzel'; font-size: 0.95rem; color: var(--accent); margin: 0 0 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">⚙️ JSON Técnico</h4>
                        <textarea readonly style="flex: 1; min-height: 200px; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; background: rgba(0,0,0,0.4); color: #22c55e; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px; resize: none; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);">${JSON.stringify(M,null,2)}</textarea>
                    </div>

                </div>

                <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap;">
                    <button class="btn btn-ghost cancel-btn" style="border-radius: 8px; font-weight: 700; font-family: 'Cinzel'; font-size: 0.75rem;">Voltar ao Jogo</button>
                    
                    <button class="btn btn-premium print-pdf-btn" style="border-radius: 8px; font-weight: 800; font-family: 'Cinzel'; font-size: 0.75rem; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-file-pdf"></i> Imprimir PDF
                    </button>
                    
                    <button class="btn btn-premium download-json-btn" style="border-radius: 8px; font-weight: 800; font-family: 'Cinzel'; font-size: 0.75rem; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-download"></i> Baixar JSON
                    </button>
                    
                    <button class="btn btn-primary finalize-btn" style="background: linear-gradient(135deg, #7f1d1d, #c5a059); border-color: transparent; border-radius: 8px; font-weight: 800; font-family: 'Cinzel'; font-size: 0.75rem; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 15px rgba(153, 27, 27, 0.45);">
                        <i class="fa-solid fa-flag-checkered"></i> Encerrar e Sair
                    </button>
                </div>

            </div>
        `,document.body.appendChild(v);const I=()=>v.remove();v.querySelector(".close-btn").onclick=I,v.querySelector(".cancel-btn").onclick=I,v.onclick=c=>{c.target===v&&I()},v.querySelector(".print-pdf-btn").onclick=()=>{const c=document.createElement("div");c.className="dnd-report-template",c.style.cssText="background: #ffffff; color: #000000; padding: 40px;",c.innerHTML=`
                <div style="text-align:center; border-bottom:3px double #000; padding-bottom:20px; margin-bottom:30px; font-family: 'Cinzel', serif;">
                    <span style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:2px;">Relatório Oficial de Aventura</span>
                    <h1 style="font-size:28px; font-weight:900; margin:10px 0 5px; text-transform:uppercase;">${t.sessionTitle||"Aventura de "+g}</h1>
                    <span style="font-size:11px; color:#555; font-weight:700;">Data: ${g} • Mestre: ${b} (${C}) • Mesa: ${i}</span>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:25px; margin-bottom:30px; font-family: 'Outfit', sans-serif;">
                    <div style="border:1.5px solid #000; padding:15px; border-radius:8px; background:#fafafa;">
                        <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:10px; text-transform:uppercase; font-size:12px;">👥 Heróis Ativos</strong>
                        <ul style="margin:0; padding-left:20px; font-size:11px; line-height:1.6;">
                            ${S.map(u=>`<li><strong>${u}</strong></li>`).join("")||"<li>Nenhum herói ativo.</li>"}
                        </ul>
                    </div>
                    <div style="border:1.5px solid #000; padding:15px; border-radius:8px; background:#fafafa;">
                        <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:10px; text-transform:uppercase; font-size:12px;">⚔️ Status do Encontro</strong>
                        <div style="font-size:11px; line-height:1.8;">
                            <div>XP Distribuído na Sessão: <strong>+${t.xpDistributed||0} XP</strong></div>
                            <div>Duração da Sessão: <strong>${h}</strong></div>
                        </div>
                    </div>
                </div>
                <div style="border:1.5px solid #000; padding:20px; border-radius:8px; background:#fffcf5; margin-bottom:35px; font-family: 'Outfit', sans-serif;">
                    <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:12px; text-transform:uppercase; color:#8b1e0f; font-size:13px;">📖 Crônica Narrativa</strong>
                    <p style="font-size:11px; line-height:1.8; font-style:italic; margin:0; white-space:pre-wrap;">${k}</p>
                </div>
                <div style="border:1.5px solid #000; padding:15px; border-radius:8px; margin-bottom:35px; font-family: 'Outfit', sans-serif;">
                    <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:10px; text-transform:uppercase; font-size:12px;">🎒 Tesouros & Itens Obtidos</strong>
                    <ul style="margin:0; padding-left:20px; font-size:11px; line-height:1.6;">
                        ${x.map(u=>`<li>${u}</li>`).join("")||"<li>Nenhum item especial.</li>"}
                    </ul>
                </div>
                <div style="font-family: 'Outfit', sans-serif;">
                    <strong style="display:block; border-bottom:1.5px solid #000; padding-bottom:6px; margin-bottom:15px; text-transform:uppercase; font-size:12px;">⏳ Linha do Tempo dos Acontecimentos</strong>
                    <div style="display:flex; flex-direction:column; gap:10px; padding-left:10px;">
                        ${(t.journalEntries||[]).map(u=>`
                            <div style="border-left:2px solid #000; padding-left:12px; font-size:10.5px; line-height:1.5;">
                                <div style="font-weight:800; color:#555; font-size:9.5px; text-transform:uppercase;">
                                    ${new Date(u.timestamp||Date.now()).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} - ${u.title||"Evento"}
                                </div>
                                <div style="color:#222; margin-top:2px;">${u.content}</div>
                            </div>
                        `).join("")||'<div style="font-size:11px; color:#555; font-style:italic;">Nenhum evento registrado.</div>'}
                    </div>
                </div>
            `,document.body.appendChild(c),document.body.classList.add("print-report-mode"),window.print(),setTimeout(()=>{document.body.classList.remove("print-report-mode"),c.remove()},500)},v.querySelector(".download-json-btn").onclick=()=>{const c=JSON.stringify(M,null,2),u=new Blob([c],{type:"application/json;charset=utf-8"}),y=URL.createObjectURL(u),D=document.createElement("a");D.href=y,D.download=`sessao_tecnica_${E}_SES${s}.json`,D.click(),URL.revokeObjectURL(y)},v.querySelector(".finalize-btn").onclick=async()=>{if(confirm("ATENÇÃO: Deseja fechar e arquivar permanentemente esta sessão no seu Registro Arcano?"))try{r.store.update(y=>{y.combatRound=0,y.combatActive=!1,y.xpDistributed=0});const c=await N.getTablesDirectory(),u=c.find(y=>y.id===E);u&&(u.sessionNum+=1,await N.saveTablesDirectory(c)),await r.persistence.save(),I(),m(()=>import("./Toast-m0Ci56ke.js"),[]).then(y=>y.Toast.show("Grimório fechado e sincronizado offline!","success")),localStorage.removeItem("DM_SESSION_ID"),localStorage.removeItem("DM_SESSION_START"),localStorage.removeItem("DM_ACTIVE_TABLE"),localStorage.removeItem("DM_PHONE"),localStorage.removeItem("DM_MASTER_NAME"),localStorage.removeItem("DM_MASTER_ID"),localStorage.removeItem("DM_INTERNAL_ID"),localStorage.removeItem("TOME_ACTIVE_SESSION"),setTimeout(()=>{window.location.reload()},1200)}catch(c){alert("Erro ao fechar sessão: "+c.message)}}}onMount(){}exportCampaign(){const t=JSON.stringify(this.store.state,null,2),a=new Blob([t],{type:"application/json"}),e=URL.createObjectURL(a),o=document.createElement("a");o.href=e,o.download=`tome_pro_backup_${new Date().toISOString().slice(0,10)}.json`,o.click(),URL.revokeObjectURL(e),m(()=>import("./Toast-m0Ci56ke.js"),[]).then(i=>i.Toast.show("Campanha exportada com sucesso!")).catch(()=>{})}importCampaign(){const t=document.createElement("input");t.type="file",t.accept=".json",t.onchange=a=>{const e=a.target.files[0],o=new FileReader;o.onload=i=>{try{const s=JSON.parse(i.target.result);r.store.update(l=>Object.assign(l,s)),m(()=>import("./Toast-m0Ci56ke.js"),[]).then(l=>l.Toast.show("Campanha importada!")).catch(()=>{}),window.location.reload()}catch{m(()=>import("./Toast-m0Ci56ke.js"),[]).then(l=>l.Toast.show("Erro ao importar arquivo.","error")).catch(()=>{})}},o.readAsText(e)},t.click()}openTolkienSummon(){const t=document.getElementById("tolkien-summon-modal");t&&t.remove();const a=document.createElement("div");a.id="tolkien-summon-modal",a.style.cssText=`
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.2s ease;
            color: #f1f5f9;
            font-family: 'Outfit', sans-serif;
            box-sizing: border-box;
        `;const e=[{id:"tolk_goblin",name:"Goblin da Névoa",type:"monster",hp_max:7,ac:15,emoji:"👺",desc:"Pequeno humanoide furtivo e astuto que prefere atacar em emboscadas na escuridão.",size:"small",speed:30},{id:"tolk_orc",name:"Orc Guerreiro",type:"monster",hp_max:15,ac:13,emoji:"👹",desc:"Criatura brutal de pele cinzenta e dentes caninos salientes, implacável no combate corporal.",size:"medium",speed:30},{id:"tolk_troll",name:"Troll da Caverna",type:"monster",hp_max:84,ac:15,emoji:"👾",desc:"Gigante monstruoso dotado de regeneração acelerada, capaz de curar ferimentos graves a cada turno.",size:"large",speed:30},{id:"tolk_balrog",name:"Balrog (Flagelo)",type:"monster",hp_max:262,ac:19,emoji:"🔥",desc:"Demônio ancestral de sombra e chama, envolto em aura de calor escaldante e portando chicote de fogo.",size:"huge",speed:40}];a.innerHTML=`
            <div class="card glass" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 25px; border-radius: 16px; border: 1px solid rgba(197, 160, 89, 0.4); background: rgba(10,12,16,0.96); box-shadow: 0 20px 40px rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 18px;">
                <div style="border-bottom: 1px solid rgba(197, 160, 89, 0.2); padding-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 0.6rem; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; font-family: 'Cinzel';">Evocação Arcana</span>
                        <h3 style="margin: 4px 0 0; font-family: 'Cinzel', serif; font-size: 1.3rem; color: #fff; display: flex; align-items: center; gap: 8px;">
                            ⚔️ Portão de Invocação de Tolkien
                        </h3>
                    </div>
                    <button class="btn btn-ghost close-btn" style="border-radius: 50%; width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
                </div>
                
                <p style="font-size: 0.75rem; color: var(--text-dim); margin: 0;">Selecione um lacaio ou criatura colossal da Terra-Média para invocar no mapa tático.</p>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${e.map(i=>`
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 15px; transition: all 0.2s;">
                            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(0,0,0,0.5); border: 2px solid ${i.id==="tolk_balrog"?"var(--danger)":"var(--accent)"}; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; flex-shrink: 0;">
                                ${i.emoji}
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <strong style="color: #fff; font-size: 0.9rem;">${i.name}</strong>
                                    <span style="font-size: 0.7rem; background: rgba(197, 160, 89, 0.15); color: var(--accent); padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">
                                        CA ${i.ac} • HP ${i.hp_max}
                                    </span>
                                </div>
                                <p style="font-size: 0.7rem; color: var(--text-dim); margin: 4px 0 0; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${i.desc}">${i.desc}</p>
                            </div>
                            <button class="btn btn-primary btn-sm summon-btn" data-monster='${JSON.stringify(i)}' style="font-size: 0.7rem; border-radius: 6px; padding: 6px 12px;">Invocar</button>
                        </div>
                    `).join("")}
                </div>
            </div>
        `,document.body.appendChild(a);const o=()=>a.remove();a.querySelector(".close-btn").onclick=o,a.onclick=i=>{i.target===a&&o()},a.querySelectorAll(".summon-btn").forEach(i=>{i.onclick=()=>{const s=JSON.parse(i.dataset.monster);o();let l={id:s.id+"_"+Date.now(),name:s.name,hp_max:s.hp_max,hp:s.hp_max,ac:s.ac,emoji:s.emoji,size:s.size,speed:s.speed,type:"monster"};setTimeout(()=>{window.TOME&&window.TOME.events&&window.TOME.events.emit("MONSTER_INVOKED",l)},100)}})}navigate(t,a){const e=a.dataset.tab;e&&r.store.update(o=>o.activeTab=e)}}function B(){const n=localStorage.getItem("DM_ACTIVE_TABLE")||"";return n?`TOME_MATCH_HISTORY_${n}`:"TOME_MATCH_HISTORY"}function j(){const n=localStorage.getItem("DM_ACTIVE_TABLE")||"";return n?`TOME_SESSION_LIST_${n}`:"TOME_SESSION_LIST"}function V(n,t){try{const a=localStorage.getItem(n);return a?JSON.parse(a):t}catch{return t}}function $(n,t){localStorage.setItem(n,JSON.stringify(t))}function F(n){return n?new Date(n).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—"}class w{static _read(){return V(B(),[])}static _write(t){$(B(),t)}static _getSessionList(){const t=V(j(),[]);return t.some(a=>a.file==="state.json")||(t.unshift({name:"Sessão Padrão",file:"state.json"}),$(j(),t)),t}static syncFromSessionList(){const t=this._getSessionList(),a=this._read(),e=new Map(a.map(i=>[i.file,i])),o=Date.now();t.forEach(i=>{if(!e.has(i.file))e.set(i.file,{id:i.file,file:i.file,name:i.name||i.file,createdAt:o,lastPlayedAt:null,sessionTitle:"",heroCount:0,journalCount:0,combatRounds:0,combatActive:!1});else{const s=e.get(i.file);i.name&&s.name!==i.name&&(s.name=i.name)}}),this._write(Array.from(e.values()))}static register(t,a,e={}){a.endsWith(".json")||(a+=".json");const o=this._read(),i=Date.now(),s=o.find(l=>l.file===a);s?(s.name=t,s.lastPlayedAt=i,Object.assign(s,e)):o.push({id:a,file:a,name:t,createdAt:i,lastPlayedAt:i,sessionTitle:"",heroCount:0,journalCount:0,combatRounds:0,combatActive:!1,...e}),this._write(o),this.syncFromSessionList()}static touchSession(t,a=null){if(!t)return;t.endsWith(".json")||(t+=".json"),this.syncFromSessionList();const e=this._read();let o=e.find(s=>s.file===t);const i=Date.now();if(!o){const l=this._getSessionList().find(p=>p.file===t);o={id:t,file:t,name:(l==null?void 0:l.name)||t,createdAt:i,lastPlayedAt:i,sessionTitle:"",heroCount:0,journalCount:0,combatRounds:0,combatActive:!1},e.push(o)}o.lastPlayedAt=i,a&&this._applyStateSnapshot(o,a),this._write(e)}static _applyStateSnapshot(t,a){t.sessionTitle=a.sessionTitle||t.sessionTitle||"",t.heroCount=(a.players||[]).length,t.journalCount=(a.journalEntries||[]).length,t.combatRounds=a.combatRound||0,t.combatActive=!!a.combatActive}static updateCurrent(t,a){const e=a||localStorage.getItem("TOME_ACTIVE_SESSION")||"state.json";this.touchSession(e,t)}static getAll(){return this.syncFromSessionList(),this._read().slice().sort((t,a)=>(a.lastPlayedAt||a.createdAt||0)-(t.lastPlayedAt||t.createdAt||0))}static getActiveFile(){return localStorage.getItem("TOME_ACTIVE_SESSION")||"state.json"}static remove(t){t.endsWith(".json")||(t+=".json");const a=this._read().filter(o=>o.file!==t);this._write(a);const e=this._getSessionList().filter(o=>o.file!==t);$(j(),e)}static formatCreated(t){return F(t.createdAt)}static formatLastPlayed(t){return t.lastPlayedAt?F(t.lastPlayedAt):"Nunca aberta"}static getSummary(){const t=this.getAll(),a=this.getActiveFile(),e=t.find(o=>o.file===a);return{total:t.length,activeName:(e==null?void 0:e.name)||"Sessão Padrão",activeFile:a}}}class Z{constructor(t,{density:a=60,depthRange:e=[1,3]}={}){this.canvas=t,this.density=a,this.depthRange=e,this.worker=null,this._onResize=()=>this.resize()}start(){if(!this.worker){if(!("OffscreenCanvas"in window)||typeof this.canvas.transferControlToOffscreen!="function"){console.warn("[ParticleEngine] OffscreenCanvas não suportado no seu navegador. Otimização V15.9 ignorada.");return}try{if(this.canvas._transferred)return;const t=this.canvas.transferControlToOffscreen();this.canvas._transferred=!0,this.worker=new Worker("/public/workers/particleWorker.js");const a=this.canvas.parentElement?this.canvas.parentElement.getBoundingClientRect():{width:this.canvas.width||window.innerWidth,height:this.canvas.height||window.innerHeight};t.width=a.width,t.height=a.height,this.worker.postMessage({type:"INIT",canvas:t,density:this.density,depthRange:this.depthRange},[t]),window.addEventListener("resize",this._onResize)}catch(t){console.warn("[ParticleEngine] Falha ao iniciar worker isolado:",t)}}}resize(){if(!this.worker||!this.canvas||!this.canvas.parentElement)return;const t=this.canvas.parentElement.getBoundingClientRect();this.worker.postMessage({type:"RESIZE",width:t.width,height:t.height})}explosion({x:t,y:a,color:e,count:o,speed:i}={}){this.worker&&this.worker.postMessage({type:"EXPLOSION",x:t,y:a,color:e,count:o,speed:i})}stop(){this.worker&&(this.worker.postMessage({type:"STOP"}),setTimeout(()=>{this.worker&&(this.worker.terminate(),this.worker=null)},100)),this._onResize&&window.removeEventListener("resize",this._onResize)}}class tt extends L{constructor(t){super(t),this._particleEngine=null}template(){return _("div",{class:"panel-overlay"},_("link",{rel:"stylesheet",href:"ui/components/main-panel.css"}),_("canvas",{class:"particles-canvas",id:"particleCanvas"}),_("img",{class:"character-hero",src:this._heroImageUrl(),alt:"Hero"}))}_heroImageUrl(){var a,e;return((e=(a=this.store)==null?void 0:a.state)==null?void 0:e.heroImage)||"assets/logo.png"}async onMount(){var a;const t=this.$("#particleCanvas");t&&(this._particleEngine=new Z(t,{density:80,depthRange:[1,4]}),this._particleEngine.start()),(a=r)!=null&&a.events&&(this._slainListener=()=>{if(this._particleEngine&&this.element){const e=this.element.getBoundingClientRect();this._particleEngine.explosion({x:e.width/2,y:e.height/2,color:"239,68,68",count:350,speed:18})}},this._fallenListener=()=>{if(this._particleEngine&&this.element){const e=this.element.getBoundingClientRect();this._particleEngine.explosion({x:e.width/2,y:e.height/2,color:"229,193,123",count:400,speed:25})}},r.events.on("ENTITY_SLAIN",this._slainListener),r.events.on("HERO_FALLEN",this._fallenListener))}onUnmount(){var t;this._particleEngine&&(this._particleEngine.stop(),this._particleEngine=null),(t=r)!=null&&t.events&&(this._slainListener&&r.events.off("ENTITY_SLAIN",this._slainListener),this._fallenListener&&r.events.off("HERO_FALLEN",this._fallenListener))}}class et extends L{constructor(t){super(t),this._activeChild=null,this._lastTab=null,this._showSnapshots=!1,this._showMatchHistory=!1,window.addEventListener("storage",a=>{const e=localStorage.getItem("TOME_ACTIVE_SESSION")||"state.json";if(a.key===`TOME_PRO_STATE_${e}`)try{const o=JSON.parse(a.newValue);r.store.update(i=>{i.players=o.players,i.monsters=o.monsters,i.initiativeOrder=o.initiativeOrder,i.initiativeIndex=o.initiativeIndex,i.combatRound=o.combatRound,i.combatActive=o.combatActive})}catch{}})}template(){return`
            <div id="view-content" style="width:100%; height:100%; overflow-y:auto; scrollbar-width:thin;"></div>
            <div id="hud-target"></div>
            <div id="chat-target"></div>
        `}async onMount(){var e;w.syncFromSessionList(),w.updateCurrent(this.store.state,(e=r.persistence)==null?void 0:e.filename),this._loadView();const{PartyStatusHUD:t}=await m(async()=>{const{PartyStatusHUD:o}=await import("./PartyStatusHUD-CGai47bx.js");return{PartyStatusHUD:o}},__vite__mapDeps([0,1,2,3,4,5]));this._hud=new t({store:this.store,element:this.$("#hud-target")}),this._hud.mount();const{ChatBox:a}=await m(async()=>{const{ChatBox:o}=await import("./ChatBox-CvstqGU0.js");return{ChatBox:o}},__vite__mapDeps([6,1,2,3,7,4,5]));this._chatBox=new a({store:this.store,element:this.$("#chat-target")}),this._chatBox.mount()}render(){const t=this.store.state.activeTab,a=this.$("#view-content");if(!a){super.render();return}t!==this._lastTab?this._loadView():t==="dashboard"&&(a.innerHTML=this._homePage(),this._bindHomeActions(a),new tt({store:this.store,element:a.querySelector("#main-panel")}).mount())}async _loadView(){const t=this.store.state.activeTab;if(t===this._lastTab&&this._activeChild)return;this._lastTab=t;const a=this.$("#view-content");if(a){if(this._activeChild&&(this._activeChild.unmount(),this._activeChild=null),t==="dashboard"){a.innerHTML=this._homePage(),this._bindHomeActions(a);return}a.innerHTML=`
            <div style="height:80vh; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--sheet-label-color); gap:20px;">
                <i class="fa-solid fa-feather-pointed fa-3x fa-bounce"></i>
                <div style="font-family:'Cinzel'; letter-spacing:3px;">Abrindo Grimório...</div>
            </div>
        `;try{const o={campaign:{path:"../components/CampaignManager.js",cls:"CampaignManager"},dmtable:{path:"../components/DMTable.js",cls:"DMTable"},dmshield:{path:"../components/DMShield.js",cls:"DMShield"},worldbuilder:{path:"../components/WorldBuilder.js",cls:"WorldBuilder"},combat:{path:"../components/combat/CombatTrackerV19.js",cls:"CombatTrackerV19"},quest:{path:"../components/QuestManager.js",cls:"QuestManager"},chareditor:{path:"../components/DynamicCharacterBuilder.js",cls:"DynamicCharacterBuilder"},character:{path:"../components/DynamicCharacterBuilder.js",cls:"DynamicCharacterBuilder"},builder:{path:"../components/PlayerForm.js",cls:"PlayerForm"},herohub:{path:"../components/HeroHub.js",cls:"HeroHub"},herosheet:{path:"../components/hero/HeroSheetV19.js",cls:"HeroSheetV19"},cardgenerator:{path:"../components/CardGenerator.js",cls:"CardGenerator"},bestiary:{path:"./Bestiary.js",cls:"Bestiary"},journal:{path:"../components/SessionJournal.js",cls:"SessionJournal"},loot:{path:"../components/LootGenerator.js",cls:"LootGenerator"},spellbook:{path:"../components/SpellBook.js",cls:"SpellBook"},npc:{path:"../components/NPCHelper.js",cls:"NPCHelper"},settings:{path:"../components/QuickReference.js",cls:"QuickReference"},initiative:{path:"../components/InitiativeMonitor.js",cls:"InitiativeMonitor"},tomesinal:{path:"../components/TomeSinalPanel.js",cls:"TomeSinalPanel"}}[t];if(!o){a.innerHTML='<div class="legacy-sheet-container">Módulo não encontrado.</div>';return}a.innerHTML=`
                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--accent); padding: 30px; font-family: 'Cinzel', serif; animation: fadeIn 0.3s ease;">
                    <i class="fa-solid fa-circle-notch fa-spin fa-3x" style="margin-bottom: 20px; opacity: 0.8;"></i>
                    <h3 style="font-size: 1.2rem; margin: 0; color: var(--text-muted);">Invocando ${t.toUpperCase()}...</h3>
                </div>
            `;const i=new Promise((p,f)=>setTimeout(()=>f(new Error("Timeout de 8000ms excedido ao carregar módulo "+t)),8e3)),l=(await Promise.race([import(o.path),i]))[o.cls];a.innerHTML="",this._activeChild=new l({store:this.store,element:a}),this._activeChild.mount()}catch(e){console.error("[Dashboard] Error boundary caught:",e),a.innerHTML=`
                <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--accent); padding: 30px; font-family: 'Cinzel', serif; background: rgba(0,0,0,0.2);">
                    <i class="fa-solid fa-triangle-exclamation fa-3x" style="margin-bottom: 20px; color: var(--danger);"></i>
                    <h3 style="font-size: 1.4rem; margin: 0; color: #fff;">Falha ao Carregar o Módulo</h3>
                    <p style="font-family: 'Outfit', sans-serif; color: var(--text-dim); margin-top: 10px; max-width: 500px; line-height: 1.6;">
                        Ocorreu um erro interno ao tentar processar a interface <strong>${t}</strong>. Isso geralmente ocorre por versões de cache conflitantes.
                    </p>
                    <div style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.5); border-left: 4px solid var(--danger); text-align: left; width: 100%; max-width: 600px; font-family: monospace; font-size: 0.75rem; color: #ff8a8a; overflow-x: auto;">
                        ${e.message||String(e)}
                    </div>
                    <button onclick="window.location.href='/index.html?reset=1'" class="btn btn-premium" style="margin-top: 25px; padding: 12px 24px; font-size: 0.85rem; font-weight: 800; border-radius: 10px; border: 1px solid var(--danger);">
                        <i class="fa-solid fa-broom"></i> Limpar Cache e Reiniciar App
                    </button>
                </div>
            `}}}_homePage(){const t=this.store.state,a=(t.players||[]).length,e=(t.monsters||[]).length,o=(t.savedNPCs||[]).length;(t.quests||[]).length;const i=t.combatActive?"⚔️ EM COMBATE":"📜 EXPLORAÇÃO",s=t.combatActive?"var(--danger)":"var(--success)",l=w.getSummary(),p=localStorage.getItem("DM_MASTER_NAME")||"Mestre";localStorage.getItem("DM_MASTER_ID");const f=localStorage.getItem("DM_INTERNAL_ID")||"DGH-MST-8F2A91",d=localStorage.getItem("DM_ACTIVE_TABLE")||"Sem Mesa";let h=1;t.journalEntries&&t.journalEntries.length>0&&(h=t.journalEntries.length+1);const g=parseInt(localStorage.getItem("DM_SESSION_LAST_ACTIVE")||Date.now()),b=Date.now()-g,C=Math.floor(b/864e5),E=Math.floor(b%864e5/36e5),S=Math.floor(b%36e5/6e4);let T="há pouco tempo";C>0?T=`há ${C} ${C===1?"dia":"dias"}`:E>0?T=`há ${E} ${E===1?"hora":"horas"}`:S>0&&(T=`há ${S} ${S===1?"minuto":"minutos"}`);let x="Os jogadores se preparam para desbravar perigos desconhecidos.";if(t.journalEntries&&t.journalEntries.length>0){const k=t.journalEntries.slice().reverse().find(M=>M.type!=="info"&&M.content);k?x=k.content:x=t.journalEntries[t.journalEntries.length-1].content}else t.sessionNotes&&(x=t.sessionNotes.split(".").filter(Boolean)[0]+".");return x.length>150&&(x=x.substring(0,147)+"..."),`
            <div class="legacy-sheet-container" style="animation: fadeIn 0.6s ease-out;">
                <div id="main-panel"></div>

                <!-- BLOCO SUPERIOR (Mesa do Mestre Status) -->
                <div style="background: rgba(10, 12, 16, 0.7); border: 1px solid rgba(197, 160, 89, 0.25); border-radius: 16px; padding: 20px 30px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); position: relative; overflow: hidden;">
                    <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(to bottom, #c5a059, #991b1b);"></div>
                    <div>
                        <h2 style="font-family:'Cinzel'; font-size:1.4rem; margin:0; letter-spacing: 2px; color: #fff;">[MESA DO MESTRE]</h2>
                        <div style="display: flex; gap: 20px; margin-top: 6px; font-size: 0.8rem; color: var(--text-dim);">
                            <span>Mestre: <strong style="color: var(--accent);">${p}</strong></span>
                            <span>ID: <strong style="color: #fff; font-family: 'JetBrains Mono', monospace;">${f}</strong></span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.25); padding: 6px 14px; border-radius: 20px;">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 10px #22c55e; display: inline-block; animation: statusBlink 1.5s infinite;"></span>
                        <span style="font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; color: #22c55e; text-transform: uppercase;">Sincronizado</span>
                    </div>
                </div>

                <!-- BARRA DE STATUS (5 CARDS NO TOPO) -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    <div class="card glass-accent" style="padding: 15px; border-radius: 12px; text-align: center; border-bottom: 3px solid ${s};">
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Status da Sessão</div>
                        <div style="font-size: 1.1rem; font-weight: 800; color: ${s}; margin-top: 5px; font-family: 'Cinzel'; text-shadow: 0 0 10px ${s};">${i}</div>
                    </div>
                    <div class="card glass-accent" style="padding: 15px; border-radius: 12px; text-align: center; border-bottom: 3px solid var(--accent);">
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Heróis no Grimório</div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: #fff; margin-top: 5px; font-family: 'Cinzel';">${a}</div>
                    </div>
                    <div class="card glass-accent" style="padding: 15px; border-radius: 12px; text-align: center; border-bottom: 3px solid var(--danger);">
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Criaturas</div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: #fff; margin-top: 5px; font-family: 'Cinzel';">${e}</div>
                    </div>
                    <div class="card glass-accent" style="padding: 15px; border-radius: 12px; text-align: center; border-bottom: 3px solid var(--info);">
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">NPCs Salvos</div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: #fff; margin-top: 5px; font-family: 'Cinzel';">${o}</div>
                    </div>
                    <div class="card glass-accent" style="padding: 15px; border-radius: 12px; text-align: center; border-bottom: 3px solid var(--success);">
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">Data da Sessão</div>
                        <div style="font-size: 1rem; font-weight: 800; color: #fff; margin-top: 10px; font-family: 'Cinzel';">${new Date().toLocaleDateString("pt-BR")}</div>
                    </div>
                </div>

                <!-- CENTRO: SISTEMA INTELIGENTE DE CONTINUIDADE -->
                <div style="background: linear-gradient(135deg, rgba(15, 12, 16, 0.85) 0%, rgba(5, 5, 8, 0.95) 100%); border: 1px solid rgba(197, 160, 89, 0.35); border-radius: 20px; padding: 35px; margin-bottom: 35px; box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 0 30px rgba(197,160,89,0.03); position: relative;">
                    <div style="font-family: 'Cinzel'; font-size: 1.1rem; color: var(--accent); margin-bottom: 15px; letter-spacing: 1px; border-bottom: 1px solid rgba(197, 160, 89, 0.15); padding-bottom: 10px;">
                        🔮 Portal de Continuidade Arcana
                    </div>
                    
                    <h3 style="font-family: 'Cinzel'; font-size: 1.8rem; font-weight: 700; margin: 0 0 20px 0; color: #fff;">Bem-vindo de volta, Mestre ${p}.</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr; gap: 20px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.03); padding: 20px; border-radius: 12px; margin-bottom: 25px;">
                        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                            <div>
                                <span style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Última Sessão</span>
                                <span style="font-family: 'Cinzel'; font-size: 1.1rem; font-weight: 800; color: var(--accent);">Sessão #${h}</span>
                            </div>
                            <div>
                                <span style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Mesa</span>
                                <span style="font-size: 1.1rem; font-weight: 700; color: #fff;">${t.sessionTitle||"A Chama de Aelthorion"} (Mesa #${d})</span>
                            </div>
                            <div>
                                <span style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Última Atividade</span>
                                <span style="font-size: 1.1rem; color: #fff; font-weight: 600;">${T}</span>
                            </div>
                        </div>
                        <div style="border-top: 1px dashed rgba(197, 160, 89, 0.2); padding-top: 15px; margin-top: 5px;">
                            <span style="font-size: 0.65rem; color: var(--accent); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Última Jogada (Resumo Narrativo)</span>
                            <p style="font-family: 'Cinzel'; font-style: italic; font-size: 0.95rem; line-height: 1.6; color: #cbd5e1; margin: 0;">"${x}"</p>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <span style="font-size: 0.8rem; color: var(--text-dim); font-weight: 600; letter-spacing: 0.5px;">Deseja continuar?</span>
                        <button class="btn-magic" style="width: 100%; max-width: 320px; font-size: 1rem; padding: 14px 28px; border-radius: 12px;" data-action="quickNav" data-tab="campaign">
                            <i class="fa-solid fa-play"></i> Continuar Sessão
                        </button>
                    </div>
                </div>

                <!-- FERRAMENTAS RÁPIDAS (ATALHOS) -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 15px; margin-bottom: 40px;">
                    <button class="btn btn-premium" style="padding: 16px; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: auto;" data-action="quickNav" data-tab="dmshield">
                        <i class="fa-solid fa-shield-halved fa-xl" style="color: var(--accent);"></i>
                        <span>Escudo</span>
                    </button>
                    <button class="btn btn-premium" style="padding: 16px; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: auto;" data-action="quickNav" data-tab="worldbuilder">
                        <i class="fa-solid fa-earth-americas fa-xl" style="color: var(--accent);"></i>
                        <span>Construtor</span>
                    </button>
                    <button class="btn btn-premium" style="padding: 16px; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: auto;" data-action="quickNav" data-tab="herohub">
                        <i class="fa-solid fa-users fa-xl" style="color: var(--accent);"></i>
                        <span>Heróis</span>
                    </button>
                    <button class="btn btn-premium" style="padding: 16px; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: auto;" data-action="quickNav" data-tab="chareditor">
                        <i class="fa-solid fa-user-pen fa-xl" style="color: var(--accent);"></i>
                        <span>Editor</span>
                    </button>
                    <button class="btn btn-premium" style="padding: 16px; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: auto;" data-action="quickNav" data-tab="lootgen">
                        <i class="fa-solid fa-coins fa-xl" style="color: var(--accent);"></i>
                        <span>Loot</span>
                    </button>
                    <button class="btn btn-premium" style="padding: 16px; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: auto;" data-action="quickNav" data-tab="spellbook">
                        <i class="fa-solid fa-book-open fa-xl" style="color: var(--accent);"></i>
                        <span>Grimório</span>
                    </button>
                    <button class="btn btn-premium" style="padding: 16px; font-size: 0.8rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: auto;" data-action="quickNav" data-tab="vaultexplorer">
                        <i class="fa-solid fa-book-skull fa-xl" style="color: var(--accent);"></i>
                        <span>Bestiário</span>
                    </button>
                </div>

                <!-- SECONDARY WIDGETS -->
                <div style="display:grid; grid-template-columns: 2fr 1fr; gap:30px;">
                    <!-- LEFT COLUMN -->
                    <div style="display:flex; flex-direction:column; gap:30px;">
                        <!-- ORACLE DE SESSÃO -->
                        <div id="oracle-widget" class="card glass-accent" style="padding:25px; border-left:5px solid var(--accent); border-top:1px solid rgba(197,160,89,0.3); border-right:1px solid rgba(197,160,89,0.15); border-bottom:1px solid rgba(197,160,89,0.15); box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                                <div>
                                    <h3 style="font-family:'Cinzel'; font-size:1.1rem; margin:0; color:var(--accent); text-shadow:0 0 8px rgba(197,160,89,0.3);">🔮 Oráculo de Sessão</h3>
                                    <p style="font-size:0.7rem; color:var(--text-dim); margin:4px 0 0 0;">Gere um gancho narrativo para iniciar sua sessão com impacto.</p>
                                </div>
                                <button class="btn btn-primary btn-sm" data-action="generateOracleHook" id="oracle-btn">
                                    <i class="fa-solid fa-wand-sparkles"></i> Inspirar
                                </button>
                            </div>
                            <div id="oracle-result" style="font-family:'Cinzel'; font-size:0.9rem; font-style:italic; line-height:1.7; color:var(--text-main); min-height:40px; padding:15px; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
                                ${t._oracleHook||'<span style="opacity:0.4; color:var(--text-dim);">Clique em "Inspirar" para gerar um gancho narrativo personalizado para sua sessão...</span>'}
                            </div>
                            ${t._oracleHook?`
                            <div style="display:flex; gap:8px; margin-top:12px;">
                                <button class="btn btn-ghost btn-sm" data-action="saveOracleToJournal" style="font-size:0.65rem;">
                                    <i class="fa-solid fa-book"></i> Salvar no Diário
                                </button>
                                <button class="btn btn-ghost btn-sm" data-action="generateOracleHook" style="font-size:0.65rem;">
                                    <i class="fa-solid fa-rotate"></i> Novo Gancho
                                </button>
                            </div>`:""}
                        </div>

                        <!-- HISTÓRICO DE PARTIDAS -->
                        <div class="card glass-accent" style="padding:30px; border-radius:12px;">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:12px;">
                                <h3 style="font-family:'Cinzel'; font-size:1.1rem; margin:0; color:var(--accent);">📜 HISTÓRICO DE PARTIDAS</h3>
                                <span style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.08em;">Acesso restrito</span>
                            </div>
                            <div class="match-history-teaser">
                                <div class="teaser-count">${l.total}</div>
                                <p style="font-size:0.7rem; color:var(--text-dim); margin:8px 0 4px; text-transform:uppercase; letter-spacing:0.1em;">Partidas registradas</p>
                                <p style="font-size:0.8rem; color:var(--text-main); margin:0 0 16px;">
                                    Ativa: <strong style="color:var(--accent);">${l.activeName}</strong>
                                </p>
                                <button class="btn btn-primary btn-block" data-action="openMatchHistory" style="font-family:'Cinzel'; letter-spacing:0.06em;">
                                    <i class="fa-solid fa-clock-rotate-left"></i> Abrir Histórico Completo
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN -->
                    <div style="display:flex; flex-direction:column; gap:30px;">
                        <!-- MINI COMBAT MONITOR -->
                        <div class="card glass-accent" style="padding:25px; border-radius:12px; border-top:4px solid var(--accent); box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                            <h3 style="font-family:'Cinzel'; text-align:center; margin-bottom:15px; color:var(--accent); letter-spacing:1px;">MONITOR DE INICIATIVA</h3>
                            ${t.combatActive?this._renderCombatMiniPreview():_("p",{style:"text-align:center; opacity:0.5; padding:20px; color:var(--text-dim);"},"Nenhum combate ativo.")}
                            <button class="btn btn-primary btn-block" style="margin-top:20px;" data-action="quickNav" data-tab="combat">ACESSAR ARENA</button>
                        </div>
                        
                        <!-- QUICK STATS SUMMARY FOI MOVIDO PARA O TOPO -->
                    </div>
                </div>
            </div>
            
            ${this._showSnapshots?this._renderSnapshotModal():""}
            ${this._showMatchHistory?this._renderMatchHistoryModal():""}
        `}_renderSnapshotModal(){return`
            <div class="modal-overlay animate-fadeIn dashboard-root" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:3000; display:flex; align-items:center; justify-content:center; padding:20px;" onclick="this.closest('.dashboard-root').__component.closeSnapshots()">
                <div class="card glass-accent animate-scaleIn" style="max-width:500px; width:100%; padding:30px; border:1.5px solid var(--accent); background:var(--bg-surface); color:var(--text-main); box-shadow: 0 20px 50px rgba(0,0,0,0.8);" onclick="event.stopPropagation()">
                    <h3 style="font-family:'Cinzel'; color:var(--accent); margin-bottom:15px; text-align:center; border-bottom:1px solid rgba(197,160,89,0.3); padding-bottom:10px; text-shadow:0 0 10px rgba(197,160,89,0.3);">🛡️ Pontos de Restauração</h3>
                    <p style="font-size:0.75rem; text-align:center; opacity:0.7; margin-bottom:20px; color:var(--text-dim);">Recupere estados anteriores da sua campanha em caso de erro.</p>
                    
                    <button class="btn btn-primary btn-block" style="margin-bottom:20px;" data-action="createNewSnapshot">Criar Novo Snapshot Agora</button>

                    <div style="display:flex; flex-direction:column; gap:10px; max-height:300px; overflow-y:auto; padding-right:5px;">
                        ${r.persistence.getSnapshots().map(a=>`
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(0,0,0,0.3); border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
                                <div>
                                    <div style="font-weight:700; font-size:0.85rem; color:#fff;">${a.label}</div>
                                    <div style="font-size:0.6rem; opacity:0.5; color:var(--text-dim);">${a.timestamp}</div>
                                </div>
                                <button class="btn btn-ghost btn-sm" data-action="restoreSnapshot" data-id="${a.id}">Restaurar</button>
                            </div>
                        `).join("")||_("p",{style:"text-align:center; opacity:0.4; font-size:0.7rem; color:var(--text-dim);"},"Nenhum snapshot encontrado.")}
                    </div>

                    <button class="btn btn-ghost btn-block" style="margin-top:20px;" data-action="closeSnapshots">Fechar</button>
                </div>
            </div>
        `}_renderCombatMiniPreview(){return`
            <div style="display:flex; flex-direction:column; gap:10px;">
                ${(this.store.state.initiativeOrder||[]).slice(0,4).map(a=>{var e,o;return`
                    <div style="display:flex; align-items:center; gap:10px; padding:10px; border-bottom:1px solid rgba(255,255,255,0.05);">
                        <div style="font-weight:900; font-family:'Cinzel'; color:var(--danger); text-shadow:0 0 5px rgba(231,76,60,0.5);">${a.initiative||0}</div>
                        <div style="flex:1; font-weight:700; font-size:0.85rem; color:#fff;">${a.name}</div>
                        <div style="font-size:0.7rem; color:var(--text-dim); font-weight:800;">${((e=a.hp)==null?void 0:e.current)??a.hp_current??0}/${((o=a.hp)==null?void 0:o.max)??a.hp_max??0} HP</div>
                    </div>
                `}).join("")}
            </div>
        `}openSnapshotManager(){this._showSnapshots=!0,this.render()}closeSnapshots(){this._showSnapshots=!1,this.render()}openMatchHistory(){var t;w.updateCurrent(this.store.state,(t=r.persistence)==null?void 0:t.filename),this._showMatchHistory=!0,this.render()}closeMatchHistory(){this._showMatchHistory=!1,this.render()}async loadMatchFromHistory(t,a){const e=a.dataset.file;if(!e||!confirm("Carregar esta partida? O estado atual será substituído pelo arquivo salvo."))return;const{Toast:o}=await m(async()=>{const{Toast:i}=await import("./Toast-m0Ci56ke.js");return{Toast:i}},[]);o.show("Carregando partida...","info"),await r.persistence.switchSession(e),w.touchSession(e,this.store.state),this._showMatchHistory=!1,o.show("Partida carregada!","success"),this.render()}removeMatchFromHistory(t,a){t.stopPropagation();const e=a.dataset.file;e&&confirm("Remover esta partida do histórico? (O arquivo JSON não será apagado do disco.)")&&(w.remove(e),m(()=>import("./Toast-m0Ci56ke.js"),[]).then(o=>o.Toast.show("Partida removida do histórico.","success")),this.render())}_renderMatchHistoryModal(){const t=w.getActiveFile(),a=w.getAll();return`
            <motionless class="match-history-overlay animate-fadeIn dashboard-root" data-action="closeMatchHistoryOverlay">
                <motionless class="match-history-panel animate-scaleIn" onclick="event.stopPropagation()">
                    <header class="match-history-header">
                        <h2><i class="fa-solid fa-clock-rotate-left"></i> Histórico de Partidas</h2>
                        <p>Campanhas e sessões criadas no DOMÍNIO RPG — consulta exclusiva desta janela.</p>
                    </header>

                    <motionless class="match-history-list">
                        ${a.length===0?["Nenhuma partida registrada ainda.",_("br",null,_("small",null,"Crie uma nova sessão em Campanha."))]:a.map(e=>{const o=e.file===t,i=e.combatActive?"Em combate":"Exploração";return`
                                <article class="match-history-item ${o?"is-active":""}">
                                    <motionless>
                                        <h4>${e.name}${o?'<span class="match-history-badge-active">Ativa</span>':""}</h4>
                                        <motionless class="match-history-meta">
                                            <div><strong>Criada:</strong> ${w.formatCreated(e)}</motionless>
                                            <div><strong>Último acesso:</strong> ${w.formatLastPlayed(e)}</motionless>
                                            <div><strong>Heróis:</strong> ${e.heroCount} · <strong>Diário:</strong> ${e.journalCount} · <strong>Rodadas:</strong> ${e.combatRounds} · ${i}</motionless>
                                            ${e.sessionTitle?`<div><strong>Título:</strong> ${e.sessionTitle}</motionless>`:""}
                                        </motionless>
                                    </motionless>
                                    <motionless class="match-history-actions">
                                        ${o?'<span style="font-size:0.65rem;color:var(--accent);text-align:center;">Em uso</span>':`<button class="btn btn-primary btn-sm btn-block" data-action="loadMatchFromHistory" data-file="${e.file}">Carregar</button>`}
                                        <button class="btn btn-ghost btn-sm btn-block" data-action="removeMatchFromHistory" data-file="${e.file}" style="color:var(--danger);">Remover</button>
                                    </motionless>
                                </article>
                            `}).join("")}
                    </motionless>

                    <footer class="match-history-footer">
                        <button class="btn btn-ghost" data-action="quickNav" data-tab="campaign">
                            <i class="fa-solid fa-folder-plus"></i> Gerenciar Campanhas
                        </button>
                        <button class="btn btn-primary" data-action="closeMatchHistory">Fechar</button>
                    </footer>
                </motionless>
            </motionless>
        `.replace(/motionless/g,"div")}createNewSnapshot(){const t=prompt("Dê um nome para este Snapshot:","Manual "+new Date().toLocaleTimeString());t&&(r.persistence.createSnapshot(t),this.render())}async generateOracleHook(){const t=this.element.querySelector("#oracle-btn"),a=this.element.querySelector("#oracle-result");if(!(!t||!a)){t.disabled=!0,t.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Consultando...';try{const e=r.store.snapshot(),o=(e.players||[]).map(d=>`${d.name} (Nível ${d.level||1} ${d.class||""})`).join(", "),i=localStorage.getItem("DM_SYSTEM")||"D&D 5e",s=e.sessionTitle||"Campanha",l=e.combatActive?"Em Combate":"Exploração",p=`Gere um gancho narrativo dramático e personalizado para iniciar uma sessão de RPG. 
            Sistema: ${i}. Campanha: ${s}. 
            Status atual: ${l}. 
            Heróis presentes: ${o||"Nenhum herói registrado"}. 
            O gancho deve ser direto, imersivo e criativo. Faça algo único focado nos heróis citados.`,f=await r.ai.ask(p);r.store.update(d=>d._oracleHook=f)}catch{m(()=>import("./Toast-m0Ci56ke.js"),[]).then(o=>o.Toast.show("O Oráculo está em silêncio...","danger"))}finally{t.disabled=!1,t.innerHTML='<i class="fa-solid fa-wand-sparkles"></i> Inspirar'}}}saveOracleToJournal(){const t=this.store.state._oracleHook;t&&(r.store.update(a=>{a.journalEntries||(a.journalEntries=[]),a.journalEntries.push({id:Date.now(),timestamp:Date.now(),date:new Date().toLocaleDateString("pt-BR"),type:"oracle",content:`🔮 GANCHO DO ORÁCULO: ${t}`})}),m(()=>import("./Toast-m0Ci56ke.js"),[]).then(a=>a.Toast.show("Gancho salvo no Diário!","success")))}restoreSnapshot(t){confirm("ATENÇÃO: Isso substituirá todos os dados atuais (Heróis, Mapas, Diário) pelo estado deste backup. Continuar?")&&r.persistence.restoreSnapshot(parseInt(t))&&(m(()=>import("./Toast-m0Ci56ke.js"),[]).then(a=>a.Toast.show("Estado restaurado com sucesso!","success")),this.closeSnapshots())}showCreaturesModal(){const t=this.store.state.monsters||[],a=document.getElementById("manage-dashboard-modal");a&&a.remove();const e=document.createElement("div");e.id="manage-dashboard-modal",e.style.cssText=`
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.25s ease;
        `,e.innerHTML=`
            <div class="card glass-accent" style="max-width:500px; width:90%; padding:30px; border-radius:18px; border:2px solid rgba(197,160,89,0.35); background:rgba(10,12,16,0.95); box-shadow: 0 20px 50px rgba(0,0,0,0.8); text-align:left;">
                <h3 style="font-family:'Cinzel', serif; font-size:1.4rem; color:var(--accent); border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:12px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                    <i class="fa-solid fa-dragon" style="color:var(--danger);"></i> Criaturas da Sessão
                </h3>
                
                <div id="modal-list-container" style="max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:5px; scrollbar-width:thin;">
                    ${t.map(o=>{var i,s;return`
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:10px; transition: all 0.2s;">
                            <div>
                                <strong style="font-family:'Cinzel'; font-size:0.85rem; color:#fff; display:block;">${o.name}</strong>
                                <span style="font-size:0.7rem; color:var(--text-dim); display:flex; align-items:center; gap:6px; margin-top:2px;">
                                    <i class="fa-solid fa-heart" style="color:var(--danger); font-size:0.6rem;"></i> HP: ${((i=o.hp)==null?void 0:i.current)||o.hp_current||0} / ${((s=o.hp)==null?void 0:s.max)||o.hp_max||0}
                                </span>
                            </div>
                            <button class="btn btn-ghost btn-sm delete-btn" data-id="${o.id}" style="color:var(--danger); border-color:rgba(231,76,60,0.25); border-radius:6px; padding:6px 10px;">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    `}).join("")||_("p",{style:"text-align:center; opacity:0.4; font-size:0.8rem; padding:20px; color:var(--text-dim);"},"Nenhuma criatura ativa no campo de batalha.")}
                </div>

                <div style="margin-top:25px; display:flex; justify-content:flex-end;">
                    <button class="btn btn-ghost close-btn" style="border-radius:8px; font-weight:800; padding:8px 20px;">Fechar</button>
                </div>
            </div>
        `,document.body.appendChild(e),e.querySelector(".close-btn").addEventListener("click",()=>e.remove()),e.addEventListener("click",o=>{o.target===e&&e.remove()}),e.querySelectorAll(".delete-btn").forEach(o=>{o.addEventListener("click",()=>{const i=o.dataset.id;this._deleteCreature(i),this.showCreaturesModal()})})}_deleteCreature(t){r.store.update(a=>{a.monsters=(a.monsters||[]).filter(e=>String(e.id)!==String(t)),a.initiativeOrder&&(a.initiativeOrder=a.initiativeOrder.filter(e=>String(e.id)!==String(t)))}),m(()=>import("./Toast-m0Ci56ke.js"),[]).then(a=>a.Toast.show("Criatura deletada com sucesso!","success")),this.render()}showNPCsModal(){const t=this.store.state.savedNPCs||[],a=document.getElementById("manage-dashboard-modal");a&&a.remove();const e=document.createElement("div");e.id="manage-dashboard-modal",e.style.cssText=`
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.25s ease;
        `,e.innerHTML=`
            <div class="card glass-accent" style="max-width:500px; width:90%; padding:30px; border-radius:18px; border:2px solid rgba(197,160,89,0.35); background:rgba(10,12,16,0.95); box-shadow: 0 20px 50px rgba(0,0,0,0.8); text-align:left;">
                <h3 style="font-family:'Cinzel', serif; font-size:1.4rem; color:var(--accent); border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:12px; margin-bottom:20px; display:flex; align-items:center; gap:10px;">
                    <i class="fa-solid fa-user-tie" style="color:var(--accent);"></i> NPCs Salvos
                </h3>
                
                <div id="modal-list-container" style="max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:10px; padding-right:5px; scrollbar-width:thin;">
                    ${t.map(o=>`
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:10px; transition: all 0.2s;">
                            <div>
                                <strong style="font-family:'Cinzel'; font-size:0.85rem; color:#fff; display:block;">${o.name}</strong>
                                <span style="font-size:0.7rem; color:var(--text-dim); display:block; margin-top:2px;">
                                    ${o.role||o.occupation||"Personalidade sem cargo"}
                                </span>
                            </div>
                            <button class="btn btn-ghost btn-sm delete-btn" data-id="${o.id}" style="color:var(--danger); border-color:rgba(231,76,60,0.25); border-radius:6px; padding:6px 10px;">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    `).join("")||_("p",{style:"text-align:center; opacity:0.4; font-size:0.8rem; padding:20px; color:var(--text-dim);"},"Nenhum NPC salvo nesta sessão.")}
                </div>

                <div style="margin-top:25px; display:flex; justify-content:flex-end;">
                    <button class="btn btn-ghost close-btn" style="border-radius:8px; font-weight:800; padding:8px 20px;">Fechar</button>
                </div>
            </div>
        `,document.body.appendChild(e),e.querySelector(".close-btn").addEventListener("click",()=>e.remove()),e.addEventListener("click",o=>{o.target===e&&e.remove()}),e.querySelectorAll(".delete-btn").forEach(o=>{o.addEventListener("click",()=>{const i=o.dataset.id;this._deleteNPC(i),this.showNPCsModal()})})}_deleteNPC(t){r.store.update(a=>{a.savedNPCs=(a.savedNPCs||[]).filter(e=>String(e.id)!==String(t))}),m(()=>import("./Toast-m0Ci56ke.js"),[]).then(a=>a.Toast.show("NPC deletado com sucesso!","success")),this.render()}_bindHomeActions(t){t.__component=this;const a=t.querySelector(".dashboard-root");a&&(a.__component=this),t.querySelectorAll('[data-action="quickNav"]').forEach(e=>{e.onclick=()=>{this._showMatchHistory=!1,r.store.update(o=>o.activeTab=e.dataset.tab)}}),t.querySelectorAll('[data-action="openSnapshotManager"]').forEach(e=>e.onclick=()=>this.openSnapshotManager()),t.querySelectorAll('[data-action="closeSnapshots"]').forEach(e=>e.onclick=()=>this.closeSnapshots()),t.querySelectorAll('[data-action="createNewSnapshot"]').forEach(e=>e.onclick=()=>this.createNewSnapshot()),t.querySelectorAll('[data-action="restoreSnapshot"]').forEach(e=>{e.onclick=()=>this.restoreSnapshot(e.dataset.id)}),t.querySelectorAll('[data-action="generateOracleHook"]').forEach(e=>e.onclick=()=>this.generateOracleHook()),t.querySelectorAll('[data-action="saveOracleToJournal"]').forEach(e=>e.onclick=()=>this.saveOracleToJournal()),t.querySelectorAll('[data-action="openMatchHistory"]').forEach(e=>e.onclick=()=>this.openMatchHistory()),t.querySelectorAll('[data-action="closeMatchHistory"]').forEach(e=>e.onclick=()=>this.closeMatchHistory()),t.querySelectorAll('[data-action="closeMatchHistoryOverlay"]').forEach(e=>e.onclick=o=>{o.target===e&&this.closeMatchHistory()}),t.querySelectorAll('[data-action="loadMatchFromHistory"]').forEach(e=>e.onclick=o=>this.loadMatchFromHistory(o,e)),t.querySelectorAll('[data-action="removeMatchFromHistory"]').forEach(e=>e.onclick=o=>this.removeMatchFromHistory(o,e)),t.querySelectorAll('[data-action="openManageCreaturesModal"]').forEach(e=>e.onclick=()=>this.showCreaturesModal()),t.querySelectorAll('[data-action="openManageNPCsModal"]').forEach(e=>e.onclick=()=>this.showNPCsModal()),t.querySelectorAll('[data-action="createNewTable"]').forEach(e=>e.onclick=()=>this.createNewTable())}async createNewTable(){const t=prompt("Digite o nome da nova mesa de campanha:");if(!t||!t.trim())return;const a=localStorage.getItem("DM_PHONE")||"";try{const e=await N.createTable(a);localStorage.setItem("DM_ACTIVE_TABLE",e.id),localStorage.setItem("TOME_ACTIVE_SESSION",`mesa_${e.id}.json`),await r.persistence.switchSession(`mesa_${e.id}.json`),r.store.update(o=>{o.sessionTitle=t.trim()}),await r.persistence.save(),m(()=>import("./Toast-m0Ci56ke.js"),[]).then(o=>o.Toast.show(`Mesa #${e.id} "${t}" criada com sucesso!`,"success")),this.render()}catch(e){alert("Erro ao criar mesa: "+e.message)}}}class at{constructor(t="RPGMasterDB",a="states"){this.dbName=t,this.storeName=a,this.db=null}async init(){if(this.db)return this.db;const{openDB:t}=await m(async()=>{const{openDB:a}=await import("https://unpkg.com/idb?module");return{openDB:a}},[]);return this.db=await t(this.dbName,2,{upgrade(a){a.objectStoreNames.contains("states")||a.createObjectStore("states"),a.objectStoreNames.contains("media")||a.createObjectStore("media")}}),this.db}async set(t,a){return(await this.init()).put(this.storeName,a,t)}async get(t){return(await this.init()).get(this.storeName,t)}async delete(t){return(await this.init()).delete(this.storeName,t)}async setMedia(t,a){return(await this.init()).put("media",a,t)}async getMedia(t){return(await this.init()).get("media",t)}async clear(){const t=await this.init();return await t.clear("media"),t.clear(this.storeName)}}class A{static _updateStatus(){this.metrics.lastUpdated=Date.now(),this.metrics.fps<20||this.metrics.latency>500?this.metrics.status="DEGRADADO":this.metrics.fps<40||this.metrics.latency>200?this.metrics.status="ATENCAO":this.metrics.status="OTIMO",typeof window<"u"&&window.dispatchEvent(new CustomEvent("tome:telemetry_update",{detail:this.metrics}))}static getExecutionReport(){return{...this.metrics,uptimeSeconds:Math.round(performance.now()/1e3),memoryUsage:performance.memory?Math.round(performance.memory.usedJSHeapSize/1024/1024)+"MB":"N/A"}}static async init(t){if(t)try{await new Promise((a,e)=>{const o=document.createElement("script");o.src="https://browser.sentry-cdn.com/7.100.0/bundle.min.js",o.crossOrigin="anonymous",o.onload=a,o.onerror=e,document.head.appendChild(o)}),window.Sentry&&(window.Sentry.init({dsn:t,tracesSampleRate:.1,replaysSessionSampleRate:.1,replaysOnErrorSampleRate:1}),this.sentryLoaded=!0,console.log("[Telemetry] Sentry SDK inicializado com sucesso."))}catch(a){console.warn("[Telemetry] Falha silenciosa no Sentry (LAN/Offline ativo):",a.message)}}static captureError(t,a={}){this.metrics.errorsCount++,console.error("[Telemetry] Anomalia Capturada:",t,a),this.sentryLoaded&&window.Sentry&&window.Sentry.captureException(t,{extra:a}),this._updateStatus()}static initFpsMonitor(t=null){this.fpsInterval&&clearInterval(this.fpsInterval);let a=0,e=performance.now();const o=()=>{a++,requestAnimationFrame(o)};requestAnimationFrame(o),this.fpsInterval=setInterval(()=>{if(document.hidden){a=0,e=performance.now();return}const i=performance.now(),s=i-e;if(s<100)return;const l=Math.round(a*1e3/s);a=0,e=i,this.metrics.fps=l,this._updateStatus(),t&&t(l),l>0&&l<20&&console.warn(`[Telemetry] Queda temporária de FPS detectada: ${l} FPS.`)},1e4)}static initLatencyMonitor(t,a=null){t&&(this.latencyInterval&&clearInterval(this.latencyInterval),t.on("pong_perf",e=>{const o=Date.now()-e;this.metrics.latency=o,this._updateStatus(),a&&a(o),o>600&&console.warn(`[Telemetry] Latência LAN/Móvel elevada: ${o}ms`)}),this.latencyInterval=setInterval(()=>{t.connected&&t.emit("ping_perf",Date.now())},5e3))}}O(A,"sentryLoaded",!1),O(A,"fpsInterval",null),O(A,"latencyInterval",null),O(A,"metrics",{fps:60,latency:0,status:"OTIMO",errorsCount:0,lastUpdated:Date.now()});async function ot(){localStorage.getItem("DM_SESSION_START")||localStorage.setItem("DM_SESSION_START",Date.now().toString());try{let e=null;try{const o=await fetch("/api/config");o.ok&&(e=(await o.json()).sentryDsn)}catch{console.log("[Boot] Não foi possível obter configuração do servidor, usando fallback local.")}await A.init(e),A.initFpsMonitor()}catch(e){console.warn("[Boot] Falha ao inicializar TelemetryService:",e)}try{const e=new at;await e.init(),r.db=e,window.TOME.db=e,console.log("[Boot] IndexedDB inicializado.")}catch(e){console.error("[Boot] Falha grave no IndexedDB. O app pode nao funcionar corretamente offline.",e)}try{const e=localStorage.getItem("DM_ACTIVE_TABLE");if(e){const o=X("/",{reconnectionDelayMax:1e4,reconnectionAttempts:10,autoConnect:!0,transports:["websocket","polling"]});o.on("connect_error",i=>{console.warn("[Boot] GM Socket erro de conexão:",i.message),o.io&&o.io.engine&&(o.io.engine.id=null)}),window.TOME.socket=o,o.on("connect",()=>{console.log("[Boot] GM Socket conectado ao servidor."),e&&(o.emit("joinRoom",{mesaId:e}),console.log(`[Boot] GM entrou na sala: ${e}`))})}}catch(e){console.warn("[Boot] Falha ao inicializar Socket.io:",e)}r.registerService("audio",new Y),r.registerService("ai",new Q),J.init(),window.TOME.socket&&(window.TOME.socket.on("map_audio",e=>{const o=e.action,i=e.payload||{};o==="PLAY_MUSIC"?r.audio.fadeTo("music",i.url,2e3):o==="PLAY_AMB"?r.audio.fadeTo("ambience",i.url,2e3):o==="STOP_AUDIO"?r.audio.stopAll():o==="SET_CHANNEL_VOL"?r.audio.setChannelVolume(i.channel,i.volume):o==="SET_ENV"&&r.store.update(s=>s.currentEnvironment=i.env)}),window.TOME.socket.on("state_update",async e=>{if(e&&typeof e=="object")try{const o=(await m(async()=>{const{SessionManager:i}=await import("./PersistenceService-BnWdIWzY.js").then(s=>s.S);return{SessionManager:i}},__vite__mapDeps([4,1]))).SessionManager;o._isApplyingNetworkState=!0,r.store.update(i=>Object.assign(i,e)),setTimeout(()=>o._isApplyingNetworkState=!1,500)}catch(o){console.error("[Boot] Erro ao sincronizar state_update",o)}}));const n=new N;r.registerService("persistence",n);try{await n.init(),await n.load(),n.startAutoSave()}catch(e){console.warn("[Boot] persistence skipped:",e)}const t=new K({store:r.store,element:document.getElementById("sidebar-target")}),a=new et({store:r.store,element:document.getElementById("view-target")});t.mount(),a.mount(),r.events.on("DICE_ROLL_REQUESTED",e=>{const o=W.roll(`1d${e}`);m(()=>import("./Toast-m0Ci56ke.js"),[]).then(i=>{i.Toast.show(`d${e}: ${o.total}`,"info")}).catch(()=>alert(`d${e}: ${o.total}`))}),"serviceWorker"in navigator&&navigator.serviceWorker.register("./service-worker.js").then(e=>console.log("[Boot] SW Ativo")).catch(e=>console.warn("[Boot] SW Falhou:",e)),console.log("Mesa do Mestre - online.")}const dt=Object.freeze(Object.defineProperty({__proto__:null,startApp:ot},Symbol.toStringTag,{value:"Module"}));export{dt as B,L as C};
