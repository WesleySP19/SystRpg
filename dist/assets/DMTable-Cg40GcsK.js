const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/EncounterGenerator-CiIZgGOz.js","assets/ReactiveComponent-DxMwUypL.js","assets/Boot-CGoZOUiq.js","assets/main-Bk3T2ZrR.js","assets/BattleManager-CjydHzBy.js","assets/BattleManager-fWgb5hCU.css","assets/main-CN4ln_Wq.css","assets/jsxRuntime.module-B_1yG4TV.js","assets/FXEngine-CD41bvJc.js","assets/Bestiary-I8BB8qSs.js","assets/Toast-m0Ci56ke.js","assets/MonsterArt-3kughPIq.js","assets/LootGenerator-BK5dvIRX.js","assets/SpellBook-CcQRoV7J.js","assets/spells-5e-BHNeu1cc.js","assets/OracleModal-CNRzdtDb.js"])))=>i.map(i=>d[i]);
var z=Object.defineProperty;var I=(c,a,e)=>a in c?z(c,a,{enumerable:!0,configurable:!0,writable:!0,value:e}):c[a]=e;var w=(c,a,e)=>I(c,typeof a!="symbol"?a+"":a,e);import{m as p,_ as x}from"./main-Bk3T2ZrR.js";import{R as E,k as A,a as R,T as m,d as k,A as u,h as L}from"./BattleManager-CjydHzBy.js";import{C as T,u as U}from"./Boot-CGoZOUiq.js";import{T as N,C as H}from"./CombatTrackerV22-DdC5JFcV.js";import{B as j}from"./Bestiary-I8BB8qSs.js";import{SessionJournal as F}from"./SessionJournal-Zz4C39N0.js";import{M as y}from"./MonsterArt-3kughPIq.js";import{Toast as _}from"./Toast-m0Ci56ke.js";import{InitiativeMonitor as G}from"./InitiativeMonitor-B-QtaLUp.js";import{R as B}from"./ReactiveComponent-DxMwUypL.js";import"./jsxRuntime.module-B_1yG4TV.js";import"./FXEngine-CD41bvJc.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";import"./imageExport-Ck9NIU6v.js";class q extends T{constructor(a){super(a),this.mapEngine=null,this.mapUrl=this.store.state.mapUrl||"",this.fog=this.store.state.mapFog||!1,this.grid=this.store.state.mapGrid||!1,this.broadcast=new BroadcastChannel("tome_map"),this.fogPaths=[],this.sidebarOpen=!1,this.activeTool="pan",this.dynamicLighting=!1}template(){return`
            <div class="fixed inset-0 bg-black/90 z-[10000] overflow-hidden flex animate-fadeIn font-outfit text-slate-200">
                
                <!-- Drawer Lateral (Sidebar) -->
                <div class="flex flex-col bg-black/80 border-r border-accent/20 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[2px_0_15px_rgba(0,0,0,0.5)] z-20 backdrop-blur-md"
                     style="width: ${this.sidebarOpen?"420px":"0"}; border-right-width: ${this.sidebarOpen?"1px":"0"};">
                    
                    <!-- Header da Gaveta -->
                    <div class="p-4 border-b border-white/5 flex justify-between items-center min-w-[420px]">
                        <h3 class="m-0 font-cinzel text-lg text-accent drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]">Gaveta Tática</h3>
                        <button class="btn btn-ghost p-2 text-slate-400 hover:text-white" data-action="toggleSidebar">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="flex flex-col flex-1 overflow-hidden min-w-[420px]">
                        <!-- Posicionamento Rápido -->
                        <div class="px-4 py-3 border-b border-white/5 max-h-[150px] overflow-y-auto custom-scrollbar">
                            <div class="text-[0.65rem] text-slate-400 mb-2 uppercase font-extrabold tracking-widest">Posicionamento (Colocar no Mapa)</div>
                            <div id="drawer-tokens" class="flex flex-col gap-1.5">
                                ${this._renderDrawerTokens()}
                            </div>
                        </div>

                        <!-- Iniciativa Monitor -->
                        <div id="tactical-initiative-container" class="flex-1 overflow-hidden relative bg-black/20">
                            <!-- Initiative Monitor mounts here -->
                        </div>
                    </div>
                </div>

                <!-- Main Area -->
                <div class="flex-1 relative">
                    <!-- Floating Top Toolbar -->
                    <div class="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                        
                        <!-- Left Group: Title & Map Settings -->
                        <div class="flex gap-4 items-start">
                            <button class="btn btn-primary pointer-events-auto p-3.5 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.5)]" data-action="toggleSidebar">
                                <i class="fa-solid fa-bars"></i>
                            </button>

                            <div class="bg-black/80 p-3 px-5 rounded-xl border border-accent/30 pointer-events-auto flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-emerald-500/10 border border-emerald-500 rounded-lg flex items-center justify-center text-emerald-500 text-lg shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                        <i class="fa-solid fa-map-location-dot"></i>
                                    </div>
                                    <h2 class="m-0 font-cinzel text-lg text-accent tracking-widest">Olho do Mestre</h2>
                                </div>
                                <div class="flex gap-2">
                                    <input type="text" id="map-url-input" class="w-[200px] py-1.5 px-3 text-sm bg-black/50 border border-white/20 rounded-lg text-white outline-none focus:border-accent" placeholder="URL do Mapa..." value="${this.mapUrl}">
                                    <button class="btn btn-ghost py-1.5 px-3 border border-white/20 text-slate-300 hover:text-white" data-action="applyMapUrl">
                                        <i class="fa-solid fa-check"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Right Group: Actions & Sync -->
                        <div class="flex gap-3 pointer-events-auto">
                            <button class="btn bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl border-none shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]" data-action="syncToSpectator">
                                <i class="fa-solid fa-satellite-dish mr-2"></i> Sincronizar Telão
                            </button>
                            <button class="btn bg-red-900/80 text-white font-bold px-4 py-2.5 rounded-xl border border-red-500/50 shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:bg-red-800" data-action="closeModal">
                                <i class="fa-solid fa-times mr-2"></i> Fechar
                            </button>
                        </div>
                    </div>

                    <!-- Floating Tool Palette (Bottom Center) -->
                    <div class="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-black/80 p-2 rounded-2xl border border-white/10 pointer-events-auto flex gap-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md">
                        <button class="tool-btn ${this.activeTool==="pan"?"active":""}" data-action="setToolPan" title="Mover Câmera / Tokens (V)">
                            <i class="fa-solid fa-hand"></i>
                        </button>
                        <button class="tool-btn ${this.activeTool==="eraser"?"active":""}" data-action="setToolEraser" title="Pincel Revelador de Névoa (E)">
                            <i class="fa-solid fa-eraser"></i>
                        </button>
                        <button class="tool-btn ${this.activeTool==="wall"?"active":""}" data-action="setToolWall" title="Desenhar Parede Oculta (W)">
                            <i class="fa-solid fa-layer-group"></i>
                        </button>
                        <div class="w-px bg-white/10 mx-1"></div>
                        <button class="tool-btn ${this.grid?"active-green":""}" data-action="toggleGrid" title="Grade (G)">
                            <i class="fa-solid fa-border-all"></i>
                        </button>
                        <button class="tool-btn ${this.fog?"active-purple":""}" data-action="toggleFog" title="Névoa de Guerra (F)">
                            <i class="fa-solid fa-cloud"></i>
                        </button>
                        <button class="tool-btn ${this.dynamicLighting?"active-yellow":""}" data-action="toggleDynamicLighting" title="Iluminação Dinâmica (L)">
                            <i class="fa-solid fa-lightbulb"></i>
                        </button>
                    </div>

                    <!-- Estilos para Tool Palette -->
                    <style>
                        .tool-btn {
                            width: 45px; height: 45px; border-radius: 12px; border: 1px solid transparent; background: transparent; color: #94a3b8; font-size: 1.1rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
                        }
                        .tool-btn:hover { background: rgba(255,255,255,0.05); color: white; }
                        .tool-btn.active { background: rgba(197,160,89,0.2); border-color: rgba(197,160,89,0.5); color: var(--accent); box-shadow: 0 0 10px rgba(197,160,89,0.2); }
                        .tool-btn.active-green { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.5); color: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.2); }
                        .tool-btn.active-purple { background: rgba(168,85,247,0.2); border-color: rgba(168,85,247,0.5); color: #a855f7; box-shadow: 0 0 10px rgba(168,85,247,0.2); }
                        .tool-btn.active-yellow { background: rgba(234,179,8,0.2); border-color: rgba(234,179,8,0.5); color: #eab308; box-shadow: 0 0 10px rgba(234,179,8,0.2); }
                    </style>

                    <!-- Map Container -->
                    <div id="dm-map-container" class="absolute inset-0"></div>
                    
                    ${this.mapUrl?"":`
                        <div class="absolute inset-0 flex flex-col items-center justify-center text-white/30 pointer-events-none z-[5]">
                            <i class="fa-solid fa-map text-6xl mb-5 drop-shadow-lg"></i>
                            <h3 class="font-cinzel m-0 text-2xl tracking-widest">Nenhum Mapa Carregado</h3>
                            <p class="text-sm max-w-md text-center mt-3 bg-black/40 p-3 rounded-lg border border-white/5">Insira a URL na barra superior e pressione o <i class="fa-solid fa-check text-accent mx-1"></i>.</p>
                        </div>
                    `}
                </div>
            </div>
        `}_renderDrawerTokens(){const a=this.store.state.initiativeOrder||[];return a.length===0?'<div class="text-slate-500 text-xs text-center py-5 font-bold">Fila de iniciativa vazia.</div>':a.map(e=>{const t=e.type!=="Player";let o=e.img||e.portraitData||null;t&&!o&&(o=y.getImage(e)),o&&o.startsWith("db://")&&(o=null);const s=t?"border-red-500 bg-red-500/20":"border-blue-500 bg-blue-500/20",i=t?"#ef4444":"#3b82f6";return`
                <div class="flex items-center gap-2.5 p-2 bg-white/5 border border-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group" data-action="placeToken" data-id="${e.id}">
                    <div class="w-8 h-8 rounded-full border-2 ${s} bg-cover bg-center flex items-center justify-center overflow-hidden shadow-md" style="${o?`background-image: url('${o}');`:""}">
                        ${o?"":`<span class="text-white text-xs font-bold font-cinzel" style="color: ${i}">${e.name.substring(0,1).toUpperCase()}</span>`}
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <div class="text-sm text-slate-200 truncate font-bold font-cinzel">${e.name}</div>
                        <div class="text-[0.65rem] text-slate-500 font-extrabold uppercase tracking-wider">${e.hp!==void 0?`HP: ${e.hp}`:""}</div>
                    </div>
                    <button class="btn btn-ghost p-1.5 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Colocar no Mapa"><i class="fa-solid fa-crosshairs"></i></button>
                </div>
            `}).join("")}onMount(){this.mapEngine=new N("dm-map-container",{width:window.innerWidth,height:window.innerHeight,isDM:!0}),this.mapUrl&&this.mapEngine.setMapUrl(this.mapUrl),this.grid&&this.mapEngine.setGrid(!0,"1.5m"),this.fog&&this.mapEngine.setFog({enabled:!0,paths:this.fogPaths});const a=this.$("#tactical-initiative-container");a&&(a.innerHTML="",this._initiativeMonitor={unmount:()=>E(null,a)},E(A(G,{store:this.store}),a)),this._cameraUpdateHandler=t=>{const{x:o,y:s,scale:i}=t.detail;this.broadcast.postMessage({type:"CAMERA_UPDATE",data:{x:o,y:s,scale:i}})},window.addEventListener("tome:camera_update",this._cameraUpdateHandler),this._fogPathHandler=t=>{const{points:o}=t.detail;this.fogPaths.push(o),this.broadcast.postMessage({type:"FOG_PATH_UPDATE",data:{points:o}})},window.addEventListener("tome:fog_path",this._fogPathHandler),this._tokenMoveHandler=t=>{const{id:o,x:s,y:i}=t.detail;this.broadcast.postMessage({type:"DELTA_UPDATE",deltaType:"TOKEN_MOVE",data:{id:o,x:s,y:i}})},window.addEventListener("tome:token_moved",this._tokenMoveHandler);const e=this.$("#dm-map-container");e&&(e.addEventListener("contextmenu",t=>{if(t.preventDefault(),this.activeTool==="eraser")return;const o=this.mapEngine.stage,s=o.getPointerPosition();if(s){const i=o.getAbsoluteTransform().copy();i.invert();const r=i.point(s);this.mapEngine.showPing(r.x,r.y,"#10b981"),this.broadcast.postMessage({type:"PING",position:{x:r.x,y:r.y},color:"#10b981"})}}),e.addEventListener("dragover",t=>{t.preventDefault(),t.dataTransfer.dropEffect="copy"}),e.addEventListener("drop",t=>{t.preventDefault();const o=t.dataTransfer.getData("application/json");if(o)try{const s=JSON.parse(o),i=this.mapEngine.stage;i.setPointersPositions(t);const r=i.getPointerPosition();if(r){const d=i.getAbsoluteTransform().copy();d.invert();const l=d.point(r);if(s.type==="spell"){this.mapEngine.showSpellEffect(l.x,l.y,"#9c27b0","spell");const b=this._getStageCenter(d);window.TOME&&window.TOME.audio&&window.TOME.audio.playSpatialSFX("https://freesound.org/data/previews/404/404764_118613-lq.mp3",l.x,l.y,b.x,b.y,this.mapEngine.stage.scaleX()),window.TOME&&window.TOME.events&&window.TOME.events.emit("SYSTEM_NOTIFICATION",{text:`${s.sourceHeroName} invocou ${s.data.name}!`,type:"info"})}else if(s.type==="attack"){this.mapEngine.showSpellEffect(l.x,l.y,"#ef4444","attack");const b=this._getStageCenter(d);window.TOME&&window.TOME.audio&&window.TOME.audio.playSpatialSFX("https://freesound.org/data/previews/415/415209_5121236-lq.mp3",l.x,l.y,b.x,b.y,this.mapEngine.stage.scaleX()),window.TOME&&window.TOME.events&&window.TOME.events.emit("SYSTEM_NOTIFICATION",{text:`${s.sourceHeroName} atacou com ${s.data.name}!`,type:"warning"})}}}catch(s){console.error("[TacticalEye] Erro ao processar drop:",s)}})),this._resizeHandler=()=>{if(this.mapEngine){const t=window.innerWidth;this.mapEngine.resize(t,window.innerHeight)}},window.addEventListener("resize",this._resizeHandler),this._loadTokensFromStore()}_getStageCenter(a){const e=this.mapEngine.stage.x(),t=this.mapEngine.stage.y(),o=this.mapEngine.stage.scaleX(),s=-e/o+window.innerWidth/2/o,i=-t/o+window.innerHeight/2/o;return{x:s,y:i}}onUnmount(){this.broadcast&&(this.broadcast.close(),this.broadcast=null),this._cameraUpdateHandler&&window.removeEventListener("tome:camera_update",this._cameraUpdateHandler),this._fogPathHandler&&window.removeEventListener("tome:fog_path",this._fogPathHandler),this._tokenMoveHandler&&window.removeEventListener("tome:token_moved",this._tokenMoveHandler),this._resizeHandler&&window.removeEventListener("resize",this._resizeHandler)}onStoreUpdate(){const a=this.$("#drawer-tokens");a&&(a.innerHTML=this._renderDrawerTokens()),this._loadTokensFromStore()}_loadTokensFromStore(){const e=(this.store.state.initiativeOrder||[]).map((t,o)=>{var l;const s=t.type!=="Player";let i=t.img||t.portraitData||null;s&&!i&&(i=y.getImage(t)),i&&i.startsWith("db://")&&(i=null);const r=(l=this.mapEngine)==null?void 0:l.tokens.get(t.id),d=t.size==="Grande"?50:t.size==="Enorme"?75:25;return{id:t.id,name:t.name,avatar:i,color:s?"#ef4444":"#3b82f6",size:d,x:r?r.x():100+o*60%500,y:r?r.y():100+Math.floor(o/8)*60}});this.mapEngine&&this.mapEngine.updateTokens(e)}toggleSidebar(){this.sidebarOpen=!this.sidebarOpen,this.render()}setToolPan(){this.activeTool="pan",this.mapEngine.setTool("pan"),this.render("Palette")}setToolEraser(){this.activeTool="eraser",this.mapEngine.setTool("eraser"),this.render("Palette")}setToolWall(){this.activeTool="wall",this.mapEngine.setTool("wall"),this.render("Palette")}render_Palette(){this.render()}applyMapUrl(){const a=this.$("#map-url-input").value.trim();this.mapUrl=a,this.store.update(e=>{e.mapUrl=a}),this.mapEngine.setMapUrl(a),_.show("Mapa atualizado.","info"),this.render()}toggleGrid(){this.grid=!this.grid,this.store.update(a=>{a.mapGrid=this.grid}),this.mapEngine.setGrid(this.grid,"1.5m"),this.render()}toggleFog(){this.fog=!this.fog,this.store.update(a=>{a.mapFog=this.fog}),this.fog?this.mapEngine.setFog({enabled:!0,paths:this.fogPaths}):this.mapEngine.setFog({enabled:!1}),this.render()}toggleDynamicLighting(){this.dynamicLighting=!this.dynamicLighting,this.mapEngine.setDynamicLightingEnabled(this.dynamicLighting),this.dynamicLighting&&!this.fog&&(this.fog=!0,this.store.update(a=>{a.mapFog=!0}),this.mapEngine.setFog({enabled:!0,paths:this.fogPaths})),this.render("Palette")}placeToken(a,e){const t=e.dataset.id,s=this.mapEngine.stage.getAbsoluteTransform().copy();s.invert();const i=s.point({x:window.innerWidth/2,y:window.innerHeight/2}),r=this.mapEngine.tokens.get(t);if(r){r.to({x:i.x,y:i.y,duration:.5,easing:Konva.Easings.ElasticEaseOut});const d=new CustomEvent("tome:token_moved",{detail:{id:t,x:i.x,y:i.y}});window.dispatchEvent(d),_.show("Token movido para o centro da tela.","info")}}syncToSpectator(){if(!this.mapEngine)return;const a=Array.from(this.mapEngine.tokens.values()).map(o=>{const s=o.findOne("Text"),i=o.findOne("Circle");return{id:o.id(),x:o.x(),y:o.y(),name:s?s.text():"Token",size:i?i.radius()*2:50,color:i?i.fill():"#ffffff"}}),e=this.store.state.initiativeOrder||[],t=a.map(o=>{const s=e.find(i=>i.id===o.id);if(s){const i=s.type!=="Player";let r=s.img||s.portraitData||null;i&&!r&&(r=y.getImage(s)),r&&!r.startsWith("db://")&&(o.avatar=r)}return o});this.broadcast.postMessage({type:"MAP_UPDATE",mapUrl:this.mapUrl,fog:{enabled:this.fog,paths:this.fogPaths},gridActive:this.grid,gridScale:"1.5m",tokens:t}),this.broadcast.postMessage({type:"CAMERA_UPDATE",data:{x:this.mapEngine.stage.x(),y:this.mapEngine.stage.y(),scale:this.mapEngine.stage.scaleX()}}),_.show("Sincronização cinematográfica ativada!","success")}closeModal(){this.unmount(),this.element.remove()}}class V extends B{constructor(e){super(e);w(this,"close",()=>{this.element&&this.element.parentNode&&this.element.parentNode.parentNode&&this.element.parentNode.parentNode.removeChild(this.element.parentNode),this.unmount()});w(this,"setTab",e=>{this._activeTab=e,this.render()});this.playerId=e.playerId,this.player=null,this._activeTab="inventory"}_renderInventory(){const e=this.player.inventory||[];return p`
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:15px; margin-top:15px;">
                ${e.length===0?p`<div style="opacity:0.5; text-align:center; padding:20px; grid-column:1/-1;">Inventário vazio.</div>`:""}
                ${e.map(t=>p`
                    <div class="card glass" style="padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:12px;">
                        <div style="width:40px; height:40px; border-radius:8px; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; color:var(--accent);">
                            <i class="fa-solid ${t.type==="weapon"?"fa-khanda":t.type==="armor"?"fa-shield":"fa-box"}"></i>
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:bold; font-size:0.9rem; color:#fff;">${t.name}</div>
                            <div style="font-size:0.7rem; color:var(--text-dim);">${t.damage?`Dano: ${t.damage}`:t.desc||"Item Comum"}</div>
                        </div>
                    </div>
                `)}
            </div>
        `}_renderSpells(){const e=this.player;return p`
            <div style="display:flex; flex-direction:column; gap:15px; margin-top:15px; max-height:450px; overflow-y:auto; padding-right:10px;" class="custom-scroll">
                ${[0,1,2,3,4,5,6,7,8,9].map(o=>{var d,l;const s=((d=e.spells)==null?void 0:d[`lvl${o}`])||"";if(!s.trim())return"";const i=s.split(`
`).filter(b=>b.trim());if(i.length===0)return"";const r=((l=e.spellSlots)==null?void 0:l[o])||{total:0,used:0};return p`
                        <div class="card glass-accent" style="padding:15px; border-radius:12px; border:1px solid rgba(197,160,89,0.2);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
                                <div style="font-family:'Cinzel'; font-weight:bold; color:var(--accent); font-size:1.1rem;">
                                    ${o===0?"TRUQUES":`NÍVEL ${o}`}
                                </div>
                                ${o>0?p`
                                    <div style="font-size:0.8rem; color:var(--text-dim);">
                                        Slots: <span style="color:#fff;">${r.total-r.used} / ${r.total}</span>
                                    </div>
                                `:""}
                            </div>
                            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px;">
                                ${i.map(b=>p`
                                    <div style="background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.05); font-size:0.85rem; color:#e2e8f0; display:flex; align-items:center; gap:8px;">
                                        <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent); font-size:0.7rem;"></i> ${b}
                                    </div>
                                `)}
                            </div>
                        </div>
                    `})}
            </div>
        `}template(){if(this.player=this.store.state.players.find(t=>t.id===this.playerId),!this.player)return p`<div>Heroi não encontrado.</div>`;const e=R.getHP(this.player);return p`
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px);">
                <div class="card glass-accent animate-scaleIn" style="max-width:800px; width:100%; padding:0; border:2px solid var(--accent); max-height:90vh; overflow:hidden; background:rgba(15,12,16,0.95); position:relative; display:flex; flex-direction:column;">
                    
                    <!-- Header -->
                    <div style="padding:25px; border-bottom:1px solid rgba(197,160,89,0.3); background:linear-gradient(to bottom, rgba(197,160,89,0.1), transparent); display:flex; align-items:center; gap:20px;">
                        <button class="btn btn-ghost" onClick=${this.close} style="position:absolute; top:20px; right:20px; border-radius:50%; width:36px; height:36px; padding:0;">
                            <i class="fa-solid fa-times"></i>
                        </button>
                        
                        <div style="width:70px; height:70px; border-radius:50%; border:2px solid var(--accent); background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-family:'Cinzel'; color:var(--accent); overflow:hidden;">
                            ${this.player.img?p`<img src="${this.player.img}" style="width:100%; height:100%; object-fit:cover;" />`:this.player.name.substring(0,1)}
                        </div>
                        
                        <div style="flex:1;">
                            <h2 style="margin:0; font-family:'Cinzel'; color:var(--accent); font-size:1.8rem; text-shadow:0 0 10px rgba(197,160,89,0.5);">${this.player.name}</h2>
                            <div style="font-size:0.9rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">
                                ${this.player.race} ${this.player.class} • Nível ${this.player.level||1}
                            </div>
                        </div>
                        
                        <div style="text-align:right; padding-right:40px;">
                            <div style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">Pontos de Vida</div>
                            <div style="font-size:1.5rem; font-weight:bold; font-family:'Cinzel'; color:${e.current>0?"#10b981":"#ef4444"};">
                                ${e.current} <span style="font-size:1rem; color:var(--text-dim);">/ ${e.max}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tabs -->
                    <div style="display:flex; border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.4);">
                        <button class="btn ${this._activeTab==="inventory"?"btn-primary":"btn-ghost"}" style="flex:1; border-radius:0; padding:15px; font-weight:bold;" onClick=${()=>this.setTab("inventory")}>
                            <i class="fa-solid fa-backpack" style="margin-right:8px;"></i> Equipamento
                        </button>
                        <button class="btn ${this._activeTab==="spells"?"btn-primary":"btn-ghost"}" style="flex:1; border-radius:0; padding:15px; font-weight:bold;" onClick=${()=>this.setTab("spells")}>
                            <i class="fa-solid fa-book-journal-whills" style="margin-right:8px;"></i> Grimório / Magias
                        </button>
                    </div>

                    <!-- Content -->
                    <div style="padding:25px; flex:1; overflow-y:auto;">
                        ${this._activeTab==="inventory"?this._renderInventory():this._renderSpells()}
                    </div>
                </div>
            </div>
        `}}class W extends T{constructor(a){super(a),this.categories=[{name:"Combate & Ação",sounds:[{id:"sword_clash",name:"Golpe de Espada",url:"https://freesound.org/data/previews/415/415209_5121236-lq.mp3",color:"#ef4444"},{id:"bow_shoot",name:"Flecha",url:"https://freesound.org/data/previews/344/344276_5121236-lq.mp3",color:"#f59e0b"},{id:"fireball",name:"Bola de Fogo",url:"https://freesound.org/data/previews/442/442953_4523992-lq.mp3",color:"#f97316"},{id:"magic_blast",name:"Explosão Arcana",url:"https://freesound.org/data/previews/404/404764_118613-lq.mp3",color:"#8b5cf6"},{id:"shield_block",name:"Defesa de Escudo",url:"https://freesound.org/data/previews/399/399303_7614679-lq.mp3",color:"#3b82f6"}]},{name:"Ambiente & Tensão",sounds:[{id:"thunder",name:"Trovão",url:"https://freesound.org/data/previews/102/102723_1739504-lq.mp3",color:"#64748b"},{id:"wolf_howl",name:"Uivo Distante",url:"https://freesound.org/data/previews/148/148705_1385413-lq.mp3",color:"#a3e635"},{id:"door_creak",name:"Porta Rangendo",url:"https://freesound.org/data/previews/119/119864_1896899-lq.mp3",color:"#84cc16"},{id:"heartbeat",name:"Batimentos",url:"https://freesound.org/data/previews/332/332056_5316315-lq.mp3",color:"#dc2626"}]}]}playSound(a){m.audio&&(m.audio.playSFX(a),m.socket&&m.socket.emit("fx_animation",{event:"SOUNDBOARD",details:{url:a}}))}closeModal(){this.element&&this.element.parentNode&&this.element.parentNode.removeChild(this.element),this.unmount()}setMasterVolume(a){m.audio&&m.audio.setMasterVolume(parseFloat(a))}template(){return p`
            <div class="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center animate-fadeIn">
                
                <div class="bg-gradient-to-br from-bgbase to-black border border-accent/40 rounded-xl w-[90%] max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden transform transition-all animate-slideUp">
                    
                    <div class="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                        <h2 class="font-cinzel text-accent text-xl font-bold m-0 flex items-center gap-3">
                            <i class="fa-solid fa-music"></i> SOUNDBOARD TÁTICO
                        </h2>
                        <button class="btn btn-ghost text-gray-400 p-2" onClick=${()=>this.closeModal()}>
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>

                    <div class="p-6 max-h-[70vh] overflow-y-auto">
                        ${this.categories.map(a=>p`
                            <div class="mb-8 last:mb-0">
                                <h3 class="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                                    ${a.name}
                                </h3>
                                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    ${a.sounds.map(e=>p`
                                        <button class="btn flex flex-col items-center gap-2 p-3 rounded-lg border border-white/10 bg-white/5 transition-all cursor-pointer hover:scale-105"
                                                style="border-color: ${e.color}40;"
                                                onMouseOver=${t=>{t.currentTarget.style.background=e.color+"20",t.currentTarget.style.borderColor=e.color}}
                                                onMouseOut=${t=>{t.currentTarget.style.background="rgba(255,255,255,0.05)",t.currentTarget.style.borderColor=e.color+"40"}}
                                                onClick=${()=>this.playSound(e.url)}>
                                            <i class="fa-solid fa-volume-high text-xl" style="color: ${e.color};"></i>
                                            <span class="text-xs font-bold text-white text-center">${e.name}</span>
                                        </button>
                                    `)}
                                </div>
                            </div>
                        `)}
                    </div>

                    <!-- Volume Master -->
                    <div class="px-6 py-4 bg-black/60 border-t border-white/5 flex items-center justify-between">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider"><i class="fa-solid fa-sliders"></i> Volume Master</span>
                        <input type="range" min="0" max="1" step="0.05" value="1" 
                               onInput=${a=>this.setMasterVolume(a.target.value)}
                               class="w-40 accent-accent cursor-pointer" />
                    </div>

                </div>
            </div>
        `}}function X(c){if(!c||!c.state){alert("Erro: Nenhuma campanha ativa carregada para backup.");return}try{const a=c.state,e={tomeVersion:"3.0.0",exportTimestamp:Date.now(),exportDateFormatted:new Date().toLocaleString("pt-BR"),campaignTitle:a.title||a.nome||"Campanha_Elo_Arcano",state:a},t=JSON.stringify(e,null,2),o=new Blob([t],{type:"application/json;charset=utf-8"}),s=URL.createObjectURL(o),i=document.createElement("a"),r=String(e.campaignTitle).replace(/[^a-zA-Z0-9_-]/g,"_");i.href=s,i.download=`${r}_backup_${new Date().toISOString().slice(0,10)}.tome`,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(s),console.log(`[TomeBackup] Arquivo .tome gerado com sucesso (${(t.length/1024).toFixed(2)} KB).`)}catch(a){console.error("Falha na exportação da campanha:",a),alert("Erro ao gerar arquivo de backup: "+a.message)}}function J(c,a){if(!c){alert("Store não inicializada.");return}const e=document.createElement("input");e.type="file",e.accept=".tome,.json",e.onchange=t=>{var i;const o=(i=t.target.files)==null?void 0:i[0];if(!o)return;const s=new FileReader;s.onload=r=>{try{const d=JSON.parse(r.target.result),l=d.state||d;confirm(`📦 Deseja restaurar a campanha "${d.campaignTitle||o.name}"? Todos os dados atuais não salvos serão substituídos pelo backup de ${d.exportDateFormatted||"data desconhecida"}.`)&&(typeof c.replaceState=="function"?c.replaceState(l):(c.state=l,typeof c.notify=="function"&&c.notify()),fetch("/api/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({state:l})}).catch(()=>{}),alert("✨ Campanha restaurada com sucesso! O Grimório, Diários, NPCs e Mapas foram atualizados."),typeof a=="function"&&a(l))}catch(d){console.error("Arquivo corrompido ou inválido:",d),alert("O arquivo selecionado não é um backup .tome válido.")}},s.readAsText(o)},e.click()}function me(){const c=U("players")||[],[a,e]=k(!1),[t,o]=k(!1),s=u(null),i=u(null),r=u(null),d=u(null),l=u(null),b=u(null);L(()=>{const n=v=>{var f;return e(((f=v.detail)==null?void 0:f.active)||!1)};return window.addEventListener("tome:ai_processing",n),s.current&&(d.current=new H({store:m.store,root:s.current,element:s.current}),d.current.mount()),i.current&&(l.current=new j({store:m.store,element:i.current}),l.current.mount()),r.current&&(b.current=new F({store:m.store,element:r.current}),b.current.mount()),()=>{window.removeEventListener("tome:ai_processing",n),d.current&&d.current.unmount(),l.current&&l.current.unmount(),b.current&&b.current.unmount()}},[]);const g=(n,v={})=>{const f=document.createElement("div");document.body.appendChild(f);try{E(p`<${n} store=${m.store} ...${v} />`,f)}catch{new n({store:m.store,element:f,...v}).mount()}},$=()=>g(q),M=()=>x(()=>import("./EncounterGenerator-CiIZgGOz.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11])).then(n=>g(n.EncounterGenerator)),S=()=>g(W),O=()=>{x(()=>import("./LootGenerator-BK5dvIRX.js"),__vite__mapDeps([12,1,2,3,4,5,6,7,8,10])).then(n=>g(n.LootGenerator))},C=()=>{x(()=>import("./SpellBook-CcQRoV7J.js"),__vite__mapDeps([13,7,4,5,3,6,14])).then(n=>g(n.SpellBook))},P=()=>{x(()=>import("./OracleModal-CNRzdtDb.js"),__vite__mapDeps([15,3,4,5,6])).then(n=>{n.OracleModal&&g(n.OracleModal)}).catch(n=>console.warn("OracleModal module missing",n))},D=n=>g(V,{playerId:n}),h=n=>{window.TOME&&window.TOME.events&&window.TOME.events.emit("DICE_ROLL_REQUESTED",n)};return p`
        <div class="animate-fadeIn grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-5 p-5 h-screen max-h-screen overflow-hidden bg-bgbase">
            <!-- HEADER (Controle Rápido) -->
            <header class="col-span-full card glass-accent flex justify-between items-center py-4 px-6 shadow-md">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-xl text-black shadow-[0_0_15px_var(--accent)]">
                        <i class="fa-solid fa-crown"></i>
                    </div>
                    <div>
                        <h2 class="m-0 font-cinzel text-2xl text-accent font-extrabold tracking-wide">Mesa de Controle do Mestre</h2>
                        <span class="text-xs text-slate-400 uppercase tracking-widest font-bold">Gestão de Campanha & Combate Tático</span>
                    </div>
                    ${a&&p`
                        <div class="ml-3 px-3 py-1 bg-purple-900/30 border border-purple-500/50 rounded-xl text-xs text-purple-300 flex items-center gap-2 animate-pulse">
                            <i class="fa-solid fa-microchip"></i> Oráculo Pensando...
                        </div>
                    `}
                </div>
                <div class="flex gap-3">
                    <button class="btn btn-primary bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] px-4" onClick=${$}>
                        <i class="fa-solid fa-map-location-dot"></i> Olho do Mestre
                    </button>
                    <button class="btn btn-ghost border-cyan-400 text-cyan-300 bg-cyan-900/10 px-4" onClick=${S}>
                        <i class="fa-solid fa-headphones-simple"></i> Som & SFX
                    </button>
                    <button class="btn btn-ghost border-purple-500 text-purple-300 bg-purple-900/20 shadow-[0_0_12px_rgba(168,85,247,0.3)] px-4" onClick=${P}>
                        <i class="fa-solid fa-crystal-ball"></i> Oráculo IA
                    </button>
                    <button class="btn btn-ghost border-accent text-accent px-4" onClick=${C}>
                        <i class="fa-solid fa-scroll"></i> Grimório
                    </button>
                    <button class="btn btn-ghost border-accent text-accent px-4" onClick=${O}>
                        <i class="fa-solid fa-coins"></i> Gerar Tesouro
                    </button>
                    <button class="btn btn-magic px-4" onClick=${M}>
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Encontro
                    </button>
                    <button class="btn btn-ghost border-blue-500 text-blue-400 bg-blue-900/20 px-4" onClick=${()=>X(m.store)} title="Exportar backup completo (.tome)">
                        <i class="fa-solid fa-file-export"></i> Backup
                    </button>
                    <button class="btn btn-ghost border-emerald-500 text-emerald-400 bg-emerald-900/20 px-4" onClick=${()=>J(m.store,()=>window.location.reload())} title="Restaurar campanha (.tome / .json)">
                        <i class="fa-solid fa-file-import"></i> Restaurar
                    </button>
                    <button class="btn btn-primary px-4" onClick=${()=>o(!t)}>
                        <i class="fa-solid fa-dice-d20"></i> Rolar Dados
                    </button>
                </div>
            </header>

            <!-- COLUNA ESQUERDA (Tracker e Notas) -->
            <div class="flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar min-w-0">
                <div ref=${s} class="card glass-accent min-h-[50vh] relative p-0 overflow-hidden shadow-md">
                    <!-- Combat Tracker será montado aqui -->
                </div>
                
                <div ref=${r} class="card glass-accent flex-1 min-h-[30vh] p-0 overflow-hidden shadow-md">
                    <!-- Session Journal será montado aqui -->
                </div>
            </div>

            <!-- COLUNA DIREITA (Heróis & Bestiário) -->
            <div class="flex flex-col gap-5 overflow-y-auto pr-1 custom-scrollbar min-w-0">
                <!-- ROSTER DOS HERÓIS -->
                <div class="card glass-accent flex-none flex flex-col p-0 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-accent/20">
                    <div class="bg-gradient-to-r from-accent/10 to-transparent py-2.5 px-4 text-accent font-cinzel font-bold text-xs text-center border-b border-accent/20 tracking-[0.15em]">
                        <i class="fa-solid fa-users mr-1.5"></i> HERÓIS ATIVOS (CLIQUE PARA INSPECIONAR)
                    </div>
                    <div class="p-3 bg-black/20">
                        ${c.length===0?p`<div class="text-center p-3 text-slate-500 text-[0.8rem]">Nenhum herói ativo.</div>`:p`
                                <div class="flex flex-wrap gap-2 justify-center">
                                    ${c.map(n=>p`
                                        <div class="cursor-pointer flex items-center gap-2.5 bg-black/40 border border-white/5 hover:border-accent/50 rounded-full px-2.5 py-1.5 transition-all hover:bg-white/5 shadow-sm" 
                                             onClick=${()=>D(n.id)} title="Inspecionar ${n.name}">
                                            <div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-cinzel text-accent text-sm border border-accent overflow-hidden shrink-0">
                                                ${n.img?p`<img src="${n.img}" class="w-full h-full object-cover" />`:n.name.substring(0,1)}
                                            </div>
                                            <div class="pr-2 min-w-0">
                                                <div class="text-xs font-bold text-white leading-tight truncate max-w-[100px]">${n.name}</div>
                                                <div class="text-[0.55rem] text-accent uppercase font-cinzel tracking-wider mt-0.5">Nv. ${n.level||1}</div>
                                            </div>
                                        </div>
                                    `)}
                                </div>
                            `}
                    </div>
                </div>

                <!-- BESTIÁRIO RÁPIDO -->
                <div class="card glass-accent flex-1 flex flex-col p-0 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-accent/20">
                    <div class="bg-gradient-to-r from-accent/15 to-transparent py-3 px-4 text-accent font-cinzel font-bold text-center border-b border-accent/25 tracking-[0.15em]">
                        <i class="fa-solid fa-dragon mr-2"></i> ACESSO RÁPIDO: BESTIÁRIO
                    </div>
                    <div ref=${i} class="flex-1 overflow-y-auto p-0 bg-black/40 custom-scrollbar relative">
                        <!-- Bestiary será montado aqui -->
                    </div>
                </div>
            </div>

            <!-- BANDEJA DE DADOS -->
            ${t&&p`
                <div class="fixed bottom-[30px] left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-accent/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[2000] animate-slideUp">
                    <button class="btn btn-ghost" onClick=${()=>h(4)}><i class="fa-solid fa-dice-d4"></i> d4</button>
                    <button class="btn btn-ghost" onClick=${()=>h(6)}><i class="fa-solid fa-dice-d6"></i> d6</button>
                    <button class="btn btn-ghost" onClick=${()=>h(8)}><i class="fa-solid fa-dice-d8"></i> d8</button>
                    <button class="btn btn-ghost" onClick=${()=>h(10)}><i class="fa-solid fa-dice-d10"></i> d10</button>
                    <button class="btn btn-ghost" onClick=${()=>h(12)}><i class="fa-solid fa-dice-d12"></i> d12</button>
                    <button class="btn btn-primary px-6 py-2.5 text-lg font-bold" onClick=${()=>h(20)}><i class="fa-solid fa-dice-d20"></i> d20</button>
                    <button class="btn btn-ghost text-red-500 border-red-500/30 hover:bg-red-500/20 ml-2" onClick=${()=>o(!1)}><i class="fa-solid fa-times"></i></button>
                </div>
            `}
        </div>
    `}export{me as DMTable};
