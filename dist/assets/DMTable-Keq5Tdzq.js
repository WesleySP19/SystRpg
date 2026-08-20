const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/EncounterGenerator-I7vut9as.js","assets/ReactiveComponent-Ddz_ABRu.js","assets/Boot-CB2yJVwc.js","assets/main-DA10KFgB.js","assets/BattleManager-cUmVHNU7.js","assets/BattleManager-bUeG3LKm.css","assets/main-CTigoW3U.css","assets/jsxRuntime.module-D87oBCZy.js","assets/FXEngine-Cu-70LmD.js","assets/Bestiary-CZhlyJVl.js","assets/Toast-m0Ci56ke.js","assets/MonsterArt-3kughPIq.js","assets/LootGenerator-BuDx3F9c.js","assets/SpellBook-dqwOx0b1.js","assets/spells-5e-BHNeu1cc.js","assets/OracleModal-UkRQ-X_g.js"])))=>i.map(i=>d[i]);
var P=Object.defineProperty;var D=(c,a,e)=>a in c?P(c,a,{enumerable:!0,configurable:!0,writable:!0,value:e}):c[a]=e;var y=(c,a,e)=>D(c,typeof a!="symbol"?a+"":a,e);import{m as p,_ as v}from"./main-DA10KFgB.js";import{a as A,T as m,d as k,A as u,h as I,R as L}from"./BattleManager-cUmVHNU7.js";import{C as T,u as R}from"./Boot-CB2yJVwc.js";import{T as U,C as N}from"./CombatTrackerV22-Bgt4M_lo.js";import{B as H}from"./Bestiary-CZhlyJVl.js";import{SessionJournal as j}from"./SessionJournal-CGT7sW4R.js";import{M as w}from"./MonsterArt-3kughPIq.js";import{Toast as E}from"./Toast-m0Ci56ke.js";import{InitiativeMonitor as F}from"./InitiativeMonitor-7ayKirum.js";import{R as G}from"./ReactiveComponent-Ddz_ABRu.js";import"./jsxRuntime.module-D87oBCZy.js";import"./FXEngine-Cu-70LmD.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";import"./Modal-CH0DmhjX.js";import"./imageExport-Ck9NIU6v.js";class B extends T{constructor(a){super(a),this.mapEngine=null,this.mapUrl=this.store.state.mapUrl||"",this.fog=this.store.state.mapFog||!1,this.grid=this.store.state.mapGrid||!1,this.broadcast=new BroadcastChannel("tome_map"),this.fogPaths=[],this.sidebarOpen=!1,this.activeTool="pan",this.dynamicLighting=!1}template(){return`
            <div class="tactical-eye-modal animate-fadeIn" style="position: fixed; inset: 0; background: #080a0d; z-index: 10000; overflow: hidden; display: flex;">
                
                <!-- Drawer Lateral (Sidebar) -->
                <div style="width: ${this.sidebarOpen?"420px":"0"}; background: rgba(15,20,28,0.95); border-right: ${this.sidebarOpen?"1px solid rgba(197, 160, 89, 0.4)":"none"}; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; overflow: hidden; box-shadow: 2px 0 15px rgba(0,0,0,0.5); z-index: 20;">
                    <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; min-width: 420px;">
                        <h3 style="margin: 0; font-family: 'Cinzel', serif; font-size: 1.1rem; color: var(--accent);">Gaveta Tática</h3>
                        <button class="btn btn-ghost" data-action="toggleSidebar" style="padding: 4px; color: #94a3b8;"><i class="fa-solid fa-times"></i></button>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; flex: 1; overflow: hidden; min-width: 420px;">
                        <div style="padding: 10px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); max-height: 150px; overflow-y: auto;" class="custom-scroll">
                            <div style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 5px; text-transform: uppercase; font-weight: bold;">Posicionamento (Colocar no Mapa)</div>
                            <div id="drawer-tokens" style="display: flex; flex-direction: column; gap: 4px;">
                                ${this._renderDrawerTokens()}
                            </div>
                        </div>

                        <div id="tactical-initiative-container" style="flex: 1; overflow: hidden; position: relative; background: rgba(0,0,0,0.2);">
                            <!-- Initiative Monitor mounts here -->
                        </div>
                    </div>
                </div>

                <!-- Main Area -->
                <div style="flex: 1; position: relative;">
                    <!-- Floating Top Toolbar -->
                    <div style="position: absolute; top: 15px; left: 15px; right: 15px; z-index: 10; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none;">
                        
                        <!-- Left Group: Title & Map Settings -->
                        <div style="display: flex; gap: 15px; align-items: flex-start;">
                            <button class="btn btn-primary" data-action="toggleSidebar" style="pointer-events: auto; padding: 12px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                                <i class="fa-solid fa-bars"></i>
                            </button>

                            <div style="background: rgba(15,20,28,0.9); padding: 10px 20px; border-radius: 12px; border: 1px solid rgba(197, 160, 89, 0.3); pointer-events: auto; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); backdrop-filter: blur(10px);">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div style="width: 32px; height: 32px; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #10b981;">
                                        <i class="fa-solid fa-map-location-dot"></i>
                                    </div>
                                    <h2 style="margin: 0; font-family: 'Cinzel', serif; font-size: 1.1rem; color: var(--accent);">Olho do Mestre</h2>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <input type="text" id="map-url-input" class="form-input" style="width: 200px; padding: 6px 10px; font-size: 0.8rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: white;" placeholder="URL do Mapa..." value="${this.mapUrl}">
                                    <button class="btn btn-ghost" data-action="applyMapUrl" style="padding: 6px 10px; border: 1px solid rgba(255,255,255,0.2);"><i class="fa-solid fa-check"></i></button>
                                </div>
                            </div>
                        </div>

                        <!-- Right Group: Actions & Sync -->
                        <div style="display: flex; gap: 10px; pointer-events: auto;">
                            <button class="btn btn-secondary" data-action="syncToSpectator" style="padding: 10px 20px; background: linear-gradient(135deg, #10b981, #047857); color: white; border-radius: 12px; border: none; font-weight: bold; box-shadow: 0 4px 15px rgba(16,185,129,0.4);">
                                <i class="fa-solid fa-satellite-dish" style="margin-right: 5px;"></i> Sincronizar Telão
                            </button>
                            <button class="btn btn-danger" data-action="closeModal" style="padding: 10px 15px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
                                <i class="fa-solid fa-times"></i> Fechar
                            </button>
                        </div>
                    </div>

                    <!-- Floating Tool Palette (Bottom Center) -->
                    <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 10; background: rgba(15,20,28,0.9); padding: 8px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); pointer-events: auto; display: flex; gap: 5px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); backdrop-filter: blur(10px);">
                        <button class="tool-btn ${this.activeTool==="pan"?"active":""}" data-action="setToolPan" title="Mover Câmera / Tokens (V)">
                            <i class="fa-solid fa-hand"></i>
                        </button>
                        <button class="tool-btn ${this.activeTool==="eraser"?"active":""}" data-action="setToolEraser" title="Pincel Revelador de Névoa (E)">
                            <i class="fa-solid fa-eraser"></i>
                        </button>
                        <button class="tool-btn ${this.activeTool==="wall"?"active":""}" data-action="setToolWall" title="Desenhar Parede Oculta (W)">
                            <i class="fa-solid fa-layer-group"></i>
                        </button>
                        <div style="width: 1px; background: rgba(255,255,255,0.1); margin: 0 5px;"></div>
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
                        .tool-btn.active { background: rgba(197,160,89,0.2); border-color: rgba(197,160,89,0.5); color: var(--accent); }
                        .tool-btn.active-green { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.5); color: #10b981; }
                        .tool-btn.active-purple { background: rgba(168,85,247,0.2); border-color: rgba(168,85,247,0.5); color: #a855f7; }
                        .tool-btn.active-yellow { background: rgba(234,179,8,0.2); border-color: rgba(234,179,8,0.5); color: #eab308; }
                    </style>

                    <!-- Map Container -->
                    <div id="dm-map-container" style="position: absolute; inset: 0;"></div>
                    
                    ${this.mapUrl?"":`
                        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(255,255,255,0.3); pointer-events: none; z-index: 5;">
                            <i class="fa-solid fa-map" style="font-size: 4rem; margin-bottom: 20px;"></i>
                            <h3 style="font-family: 'Cinzel', serif; margin: 0; font-size: 1.5rem;">Nenhum Mapa Carregado</h3>
                            <p style="font-size: 0.9rem; max-width: 400px; text-align: center; margin-top: 10px;">Insira a URL na barra superior e pressione o <i class="fa-solid fa-check"></i>.</p>
                        </div>
                    `}
                </div>
            </div>
        `}_renderDrawerTokens(){const a=this.store.state.initiativeOrder||[];return a.length===0?'<div style="color: #64748b; font-size: 0.8rem; text-align: center; padding: 20px 0;">Fila de iniciativa vazia.</div>':a.map(e=>{const t=e.type!=="Player";let i=e.img||e.portraitData||null;t&&!i&&(i=w.getImage(e)),i&&i.startsWith("db://")&&(i=null);const o=t?"#ef4444":"#3b82f6";return`
                <div class="drawer-token-item" style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; cursor: pointer; transition: background 0.2s;" data-action="placeToken" data-id="${e.id}">
                    <div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${o}; background-color: ${o}; background-image: url('${i||""}'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
                        ${i?"":`<span style="color: white; font-size: 0.8rem; font-weight: bold;">${e.name.substring(0,1).toUpperCase()}</span>`}
                    </div>
                    <div style="flex: 1; overflow: hidden;">
                        <div style="font-size: 0.85rem; color: #e2e8f0; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${e.name}</div>
                        <div style="font-size: 0.7rem; color: #64748b;">${e.hp!==void 0?`HP: ${e.hp}`:""}</div>
                    </div>
                    <button class="btn btn-ghost" style="padding: 4px; font-size: 0.8rem;" title="Colocar no Mapa"><i class="fa-solid fa-crosshairs"></i></button>
                </div>
            `}).join("")}onMount(){this.mapEngine=new U("dm-map-container",{width:window.innerWidth,height:window.innerHeight,isDM:!0}),this.mapUrl&&this.mapEngine.setMapUrl(this.mapUrl),this.grid&&this.mapEngine.setGrid(!0,"1.5m"),this.fog&&this.mapEngine.setFog({enabled:!0,paths:this.fogPaths});const a=this.$("#tactical-initiative-container");a&&(a.innerHTML="",this._initiativeMonitor=new F({store:this.store}),this._initiativeMonitor.mount(a),this._initiativeMonitor.element.parentNode.__component=this._initiativeMonitor),this._cameraUpdateHandler=t=>{const{x:i,y:o,scale:s}=t.detail;this.broadcast.postMessage({type:"CAMERA_UPDATE",data:{x:i,y:o,scale:s}})},window.addEventListener("tome:camera_update",this._cameraUpdateHandler),this._fogPathHandler=t=>{const{points:i}=t.detail;this.fogPaths.push(i),this.broadcast.postMessage({type:"FOG_PATH_UPDATE",data:{points:i}})},window.addEventListener("tome:fog_path",this._fogPathHandler),this._tokenMoveHandler=t=>{const{id:i,x:o,y:s}=t.detail;this.broadcast.postMessage({type:"DELTA_UPDATE",deltaType:"TOKEN_MOVE",data:{id:i,x:o,y:s}})},window.addEventListener("tome:token_moved",this._tokenMoveHandler);const e=this.$("#dm-map-container");e&&(e.addEventListener("contextmenu",t=>{if(t.preventDefault(),this.activeTool==="eraser")return;const i=this.mapEngine.stage,o=i.getPointerPosition();if(o){const s=i.getAbsoluteTransform().copy();s.invert();const r=s.point(o);this.mapEngine.showPing(r.x,r.y,"#10b981"),this.broadcast.postMessage({type:"PING",position:{x:r.x,y:r.y},color:"#10b981"})}}),e.addEventListener("dragover",t=>{t.preventDefault(),t.dataTransfer.dropEffect="copy"}),e.addEventListener("drop",t=>{t.preventDefault();const i=t.dataTransfer.getData("application/json");if(i)try{const o=JSON.parse(i),s=this.mapEngine.stage;s.setPointersPositions(t);const r=s.getPointerPosition();if(r){const d=s.getAbsoluteTransform().copy();d.invert();const l=d.point(r);if(o.type==="spell"){this.mapEngine.showSpellEffect(l.x,l.y,"#9c27b0","spell");const g=this._getStageCenter(d);window.TOME&&window.TOME.audio&&window.TOME.audio.playSpatialSFX("https://freesound.org/data/previews/404/404764_118613-lq.mp3",l.x,l.y,g.x,g.y,this.mapEngine.stage.scaleX()),window.TOME&&window.TOME.events&&window.TOME.events.emit("SYSTEM_NOTIFICATION",{text:`${o.sourceHeroName} invocou ${o.data.name}!`,type:"info"})}else if(o.type==="attack"){this.mapEngine.showSpellEffect(l.x,l.y,"#ef4444","attack");const g=this._getStageCenter(d);window.TOME&&window.TOME.audio&&window.TOME.audio.playSpatialSFX("https://freesound.org/data/previews/415/415209_5121236-lq.mp3",l.x,l.y,g.x,g.y,this.mapEngine.stage.scaleX()),window.TOME&&window.TOME.events&&window.TOME.events.emit("SYSTEM_NOTIFICATION",{text:`${o.sourceHeroName} atacou com ${o.data.name}!`,type:"warning"})}}}catch(o){console.error("[TacticalEye] Erro ao processar drop:",o)}})),this._resizeHandler=()=>{if(this.mapEngine){const t=window.innerWidth;this.mapEngine.resize(t,window.innerHeight)}},window.addEventListener("resize",this._resizeHandler),this._loadTokensFromStore()}_getStageCenter(a){const e=this.mapEngine.stage.x(),t=this.mapEngine.stage.y(),i=this.mapEngine.stage.scaleX(),o=-e/i+window.innerWidth/2/i,s=-t/i+window.innerHeight/2/i;return{x:o,y:s}}onUnmount(){this.broadcast&&(this.broadcast.close(),this.broadcast=null),this._cameraUpdateHandler&&window.removeEventListener("tome:camera_update",this._cameraUpdateHandler),this._fogPathHandler&&window.removeEventListener("tome:fog_path",this._fogPathHandler),this._tokenMoveHandler&&window.removeEventListener("tome:token_moved",this._tokenMoveHandler),this._resizeHandler&&window.removeEventListener("resize",this._resizeHandler)}onStoreUpdate(){const a=this.$("#drawer-tokens");a&&(a.innerHTML=this._renderDrawerTokens()),this._loadTokensFromStore()}_loadTokensFromStore(){const e=(this.store.state.initiativeOrder||[]).map((t,i)=>{var l;const o=t.type!=="Player";let s=t.img||t.portraitData||null;o&&!s&&(s=w.getImage(t)),s&&s.startsWith("db://")&&(s=null);const r=(l=this.mapEngine)==null?void 0:l.tokens.get(t.id),d=t.size==="Grande"?50:t.size==="Enorme"?75:25;return{id:t.id,name:t.name,avatar:s,color:o?"#ef4444":"#3b82f6",size:d,x:r?r.x():100+i*60%500,y:r?r.y():100+Math.floor(i/8)*60}});this.mapEngine&&this.mapEngine.updateTokens(e)}toggleSidebar(){this.sidebarOpen=!this.sidebarOpen,this.render()}setToolPan(){this.activeTool="pan",this.mapEngine.setTool("pan"),this.render("Palette")}setToolEraser(){this.activeTool="eraser",this.mapEngine.setTool("eraser"),this.render("Palette")}setToolWall(){this.activeTool="wall",this.mapEngine.setTool("wall"),this.render("Palette")}render_Palette(){this.render()}applyMapUrl(){const a=this.$("#map-url-input").value.trim();this.mapUrl=a,this.store.update(e=>{e.mapUrl=a}),this.mapEngine.setMapUrl(a),E.show("Mapa atualizado.","info"),this.render()}toggleGrid(){this.grid=!this.grid,this.store.update(a=>{a.mapGrid=this.grid}),this.mapEngine.setGrid(this.grid,"1.5m"),this.render()}toggleFog(){this.fog=!this.fog,this.store.update(a=>{a.mapFog=this.fog}),this.fog?this.mapEngine.setFog({enabled:!0,paths:this.fogPaths}):this.mapEngine.setFog({enabled:!1}),this.render()}toggleDynamicLighting(){this.dynamicLighting=!this.dynamicLighting,this.mapEngine.setDynamicLightingEnabled(this.dynamicLighting),this.dynamicLighting&&!this.fog&&(this.fog=!0,this.store.update(a=>{a.mapFog=!0}),this.mapEngine.setFog({enabled:!0,paths:this.fogPaths})),this.render("Palette")}placeToken(a,e){const t=e.dataset.id,o=this.mapEngine.stage.getAbsoluteTransform().copy();o.invert();const s=o.point({x:window.innerWidth/2,y:window.innerHeight/2}),r=this.mapEngine.tokens.get(t);if(r){r.to({x:s.x,y:s.y,duration:.5,easing:Konva.Easings.ElasticEaseOut});const d=new CustomEvent("tome:token_moved",{detail:{id:t,x:s.x,y:s.y}});window.dispatchEvent(d),E.show("Token movido para o centro da tela.","info")}}syncToSpectator(){if(!this.mapEngine)return;const a=Array.from(this.mapEngine.tokens.values()).map(i=>{const o=i.findOne("Text"),s=i.findOne("Circle");return{id:i.id(),x:i.x(),y:i.y(),name:o?o.text():"Token",size:s?s.radius()*2:50,color:s?s.fill():"#ffffff"}}),e=this.store.state.initiativeOrder||[],t=a.map(i=>{const o=e.find(s=>s.id===i.id);if(o){const s=o.type!=="Player";let r=o.img||o.portraitData||null;s&&!r&&(r=w.getImage(o)),r&&!r.startsWith("db://")&&(i.avatar=r)}return i});this.broadcast.postMessage({type:"MAP_UPDATE",mapUrl:this.mapUrl,fog:{enabled:this.fog,paths:this.fogPaths},gridActive:this.grid,gridScale:"1.5m",tokens:t}),this.broadcast.postMessage({type:"CAMERA_UPDATE",data:{x:this.mapEngine.stage.x(),y:this.mapEngine.stage.y(),scale:this.mapEngine.stage.scaleX()}}),E.show("Sincronização cinematográfica ativada!","success")}closeModal(){this.unmount(),this.element.remove()}}class q extends G{constructor(e){super(e);y(this,"close",()=>{this.element&&this.element.parentNode&&this.element.parentNode.parentNode&&this.element.parentNode.parentNode.removeChild(this.element.parentNode),this.unmount()});y(this,"setTab",e=>{this._activeTab=e,this.render()});this.playerId=e.playerId,this.player=null,this._activeTab="inventory"}_renderInventory(){const e=this.player.inventory||[];return p`
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
                ${[0,1,2,3,4,5,6,7,8,9].map(i=>{var d,l;const o=((d=e.spells)==null?void 0:d[`lvl${i}`])||"";if(!o.trim())return"";const s=o.split(`
`).filter(g=>g.trim());if(s.length===0)return"";const r=((l=e.spellSlots)==null?void 0:l[i])||{total:0,used:0};return p`
                        <div class="card glass-accent" style="padding:15px; border-radius:12px; border:1px solid rgba(197,160,89,0.2);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
                                <div style="font-family:'Cinzel'; font-weight:bold; color:var(--accent); font-size:1.1rem;">
                                    ${i===0?"TRUQUES":`NÍVEL ${i}`}
                                </div>
                                ${i>0?p`
                                    <div style="font-size:0.8rem; color:var(--text-dim);">
                                        Slots: <span style="color:#fff;">${r.total-r.used} / ${r.total}</span>
                                    </div>
                                `:""}
                            </div>
                            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px;">
                                ${s.map(g=>p`
                                    <div style="background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.05); font-size:0.85rem; color:#e2e8f0; display:flex; align-items:center; gap:8px;">
                                        <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent); font-size:0.7rem;"></i> ${g}
                                    </div>
                                `)}
                            </div>
                        </div>
                    `})}
            </div>
        `}template(){if(this.player=this.store.state.players.find(t=>t.id===this.playerId),!this.player)return p`<div>Heroi não encontrado.</div>`;const e=A.getHP(this.player);return p`
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
        `}}class V extends T{constructor(a){super(a),this.categories=[{name:"Combate & Ação",sounds:[{id:"sword_clash",name:"Golpe de Espada",url:"https://freesound.org/data/previews/415/415209_5121236-lq.mp3",color:"#ef4444"},{id:"bow_shoot",name:"Flecha",url:"https://freesound.org/data/previews/344/344276_5121236-lq.mp3",color:"#f59e0b"},{id:"fireball",name:"Bola de Fogo",url:"https://freesound.org/data/previews/442/442953_4523992-lq.mp3",color:"#f97316"},{id:"magic_blast",name:"Explosão Arcana",url:"https://freesound.org/data/previews/404/404764_118613-lq.mp3",color:"#8b5cf6"},{id:"shield_block",name:"Defesa de Escudo",url:"https://freesound.org/data/previews/399/399303_7614679-lq.mp3",color:"#3b82f6"}]},{name:"Ambiente & Tensão",sounds:[{id:"thunder",name:"Trovão",url:"https://freesound.org/data/previews/102/102723_1739504-lq.mp3",color:"#64748b"},{id:"wolf_howl",name:"Uivo Distante",url:"https://freesound.org/data/previews/148/148705_1385413-lq.mp3",color:"#a3e635"},{id:"door_creak",name:"Porta Rangendo",url:"https://freesound.org/data/previews/119/119864_1896899-lq.mp3",color:"#84cc16"},{id:"heartbeat",name:"Batimentos",url:"https://freesound.org/data/previews/332/332056_5316315-lq.mp3",color:"#dc2626"}]}]}playSound(a){m.audio&&(m.audio.playSFX(a),m.socket&&m.socket.emit("fx_animation",{event:"SOUNDBOARD",details:{url:a}}))}closeModal(){this.element&&this.element.parentNode&&this.element.parentNode.removeChild(this.element),this.unmount()}setMasterVolume(a){m.audio&&m.audio.setMasterVolume(parseFloat(a))}template(){return p`
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
        `}}function X(c){if(!c||!c.state){alert("Erro: Nenhuma campanha ativa carregada para backup.");return}try{const a=c.state,e={tomeVersion:"3.0.0",exportTimestamp:Date.now(),exportDateFormatted:new Date().toLocaleString("pt-BR"),campaignTitle:a.title||a.nome||"Campanha_Elo_Arcano",state:a},t=JSON.stringify(e,null,2),i=new Blob([t],{type:"application/json;charset=utf-8"}),o=URL.createObjectURL(i),s=document.createElement("a"),r=String(e.campaignTitle).replace(/[^a-zA-Z0-9_-]/g,"_");s.href=o,s.download=`${r}_backup_${new Date().toISOString().slice(0,10)}.tome`,document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(o),console.log(`[TomeBackup] Arquivo .tome gerado com sucesso (${(t.length/1024).toFixed(2)} KB).`)}catch(a){console.error("Falha na exportação da campanha:",a),alert("Erro ao gerar arquivo de backup: "+a.message)}}function W(c,a){if(!c){alert("Store não inicializada.");return}const e=document.createElement("input");e.type="file",e.accept=".tome,.json",e.onchange=t=>{var s;const i=(s=t.target.files)==null?void 0:s[0];if(!i)return;const o=new FileReader;o.onload=r=>{try{const d=JSON.parse(r.target.result),l=d.state||d;confirm(`📦 Deseja restaurar a campanha "${d.campaignTitle||i.name}"? Todos os dados atuais não salvos serão substituídos pelo backup de ${d.exportDateFormatted||"data desconhecida"}.`)&&(typeof c.replaceState=="function"?c.replaceState(l):(c.state=l,typeof c.notify=="function"&&c.notify()),fetch("/api/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({state:l})}).catch(()=>{}),alert("✨ Campanha restaurada com sucesso! O Grimório, Diários, NPCs e Mapas foram atualizados."),typeof a=="function"&&a(l))}catch(d){console.error("Arquivo corrompido ou inválido:",d),alert("O arquivo selecionado não é um backup .tome válido.")}},o.readAsText(i)},e.click()}function me(){const c=R("players")||[],[a,e]=k(!1),[t,i]=k(!1),o=u(null),s=u(null),r=u(null),d=u(null),l=u(null),g=u(null);I(()=>{const n=x=>{var h;return e(((h=x.detail)==null?void 0:h.active)||!1)};return window.addEventListener("tome:ai_processing",n),o.current&&(d.current=new N({store:m.store,root:o.current,element:o.current}),d.current.mount()),s.current&&(l.current=new H({store:m.store,element:s.current}),l.current.mount()),r.current&&(g.current=new j({store:m.store,element:r.current}),g.current.mount()),()=>{window.removeEventListener("tome:ai_processing",n),d.current&&d.current.unmount(),l.current&&l.current.unmount(),g.current&&g.current.unmount()}},[]);const b=(n,x={})=>{const h=document.createElement("div");document.body.appendChild(h);try{L(p`<${n} store=${m.store} ...${x} />`,h)}catch{new n({store:m.store,element:h,...x}).mount()}},_=()=>b(B),$=()=>v(()=>import("./EncounterGenerator-I7vut9as.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11])).then(n=>b(n.EncounterGenerator)),M=()=>b(V),S=()=>{v(()=>import("./LootGenerator-BuDx3F9c.js"),__vite__mapDeps([12,1,2,3,4,5,6,7,8,10])).then(n=>b(n.LootGenerator))},C=()=>{v(()=>import("./SpellBook-dqwOx0b1.js"),__vite__mapDeps([13,7,4,5,3,6,14])).then(n=>b(n.SpellBook))},O=()=>{v(()=>import("./OracleModal-UkRQ-X_g.js"),__vite__mapDeps([15,3,4,5,6])).then(n=>{n.OracleModal&&b(n.OracleModal)}).catch(n=>console.warn("OracleModal module missing",n))},z=n=>b(q,{playerId:n}),f=n=>{window.TOME&&window.TOME.events&&window.TOME.events.emit("DICE_ROLL_REQUESTED",n)};return p`
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
                    <button class="btn btn-primary bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] px-4" onClick=${_}>
                        <i class="fa-solid fa-map-location-dot"></i> Olho do Mestre
                    </button>
                    <button class="btn btn-ghost border-cyan-400 text-cyan-300 bg-cyan-900/10 px-4" onClick=${M}>
                        <i class="fa-solid fa-headphones-simple"></i> Som & SFX
                    </button>
                    <button class="btn btn-ghost border-purple-500 text-purple-300 bg-purple-900/20 shadow-[0_0_12px_rgba(168,85,247,0.3)] px-4" onClick=${O}>
                        <i class="fa-solid fa-crystal-ball"></i> Oráculo IA
                    </button>
                    <button class="btn btn-ghost border-accent text-accent px-4" onClick=${C}>
                        <i class="fa-solid fa-scroll"></i> Grimório
                    </button>
                    <button class="btn btn-ghost border-accent text-accent px-4" onClick=${S}>
                        <i class="fa-solid fa-coins"></i> Gerar Tesouro
                    </button>
                    <button class="btn btn-magic px-4" onClick=${$}>
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Encontro
                    </button>
                    <button class="btn btn-ghost border-blue-500 text-blue-400 bg-blue-900/20 px-4" onClick=${()=>X(m.store)} title="Exportar backup completo (.tome)">
                        <i class="fa-solid fa-file-export"></i> Backup
                    </button>
                    <button class="btn btn-ghost border-emerald-500 text-emerald-400 bg-emerald-900/20 px-4" onClick=${()=>W(m.store,()=>window.location.reload())} title="Restaurar campanha (.tome / .json)">
                        <i class="fa-solid fa-file-import"></i> Restaurar
                    </button>
                    <button class="btn btn-primary px-4" onClick=${()=>i(!t)}>
                        <i class="fa-solid fa-dice-d20"></i> Rolar Dados
                    </button>
                </div>
            </header>

            <!-- COLUNA ESQUERDA (Tracker e Notas) -->
            <div class="flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar min-w-0">
                <div ref=${o} class="card glass-accent min-h-[50vh] relative p-0 overflow-hidden shadow-md">
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
                                             onClick=${()=>z(n.id)} title="Inspecionar ${n.name}">
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
                    <div ref=${s} class="flex-1 overflow-y-auto p-0 bg-black/40 custom-scrollbar relative">
                        <!-- Bestiary será montado aqui -->
                    </div>
                </div>
            </div>

            <!-- BANDEJA DE DADOS -->
            ${t&&p`
                <div class="fixed bottom-[30px] left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-accent/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[2000] animate-slideUp">
                    <button class="btn btn-ghost" onClick=${()=>f(4)}><i class="fa-solid fa-dice-d4"></i> d4</button>
                    <button class="btn btn-ghost" onClick=${()=>f(6)}><i class="fa-solid fa-dice-d6"></i> d6</button>
                    <button class="btn btn-ghost" onClick=${()=>f(8)}><i class="fa-solid fa-dice-d8"></i> d8</button>
                    <button class="btn btn-ghost" onClick=${()=>f(10)}><i class="fa-solid fa-dice-d10"></i> d10</button>
                    <button class="btn btn-ghost" onClick=${()=>f(12)}><i class="fa-solid fa-dice-d12"></i> d12</button>
                    <button class="btn btn-primary px-6 py-2.5 text-lg font-bold" onClick=${()=>f(20)}><i class="fa-solid fa-dice-d20"></i> d20</button>
                    <button class="btn btn-ghost text-red-500 border-red-500/30 hover:bg-red-500/20 ml-2" onClick=${()=>i(!1)}><i class="fa-solid fa-times"></i></button>
                </div>
            `}
        </div>
    `}export{me as DMTable};
