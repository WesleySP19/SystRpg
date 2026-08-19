const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/EncounterGenerator-CQoCvZVc.js","assets/ReactiveComponent-I2rnF6vN.js","assets/Boot-B2dG6x9f.js","assets/main-Dh89y2UZ.js","assets/BattleManager-2t4w_Qpj.js","assets/BattleManager-B0u_lTOW.css","assets/main-CTigoW3U.css","assets/jsxRuntime.module-BN06QUIv.js","assets/FXEngine-BD9eU4lT.js","assets/Bestiary-BCrui9b3.js","assets/Toast-m0Ci56ke.js","assets/MonsterArt-3kughPIq.js","assets/LootGenerator-B0JluE4a.js","assets/SpellBook-B-d5lEOF.js","assets/spells-5e-BHNeu1cc.js","assets/OracleModal-BPXc-V2q.js"])))=>i.map(i=>d[i]);
var P=Object.defineProperty;var D=(h,t,e)=>t in h?P(h,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):h[t]=e;var M=(h,t,e)=>D(h,typeof t!="symbol"?t+"":t,e);import{m as f,_ as T}from"./main-Dh89y2UZ.js";import{a as z,T as u,d as S,A as k,h as I,R}from"./BattleManager-2t4w_Qpj.js";import{C as O,u as A}from"./Boot-B2dG6x9f.js";import{CombatTrackerV19 as F}from"./CombatTrackerV19-nzD_TDC3.js";import{B as U}from"./Bestiary-BCrui9b3.js";import{SessionJournal as N}from"./SessionJournal-_h1Wr6RX.js";import{M as $}from"./MonsterArt-3kughPIq.js";import{Toast as C}from"./Toast-m0Ci56ke.js";import{InitiativeMonitor as H}from"./InitiativeMonitor-DvoQ4m6Y.js";import{R as G}from"./ReactiveComponent-I2rnF6vN.js";import"./jsxRuntime.module-BN06QUIv.js";import"./FXEngine-BD9eU4lT.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";import"./Modal-B7xxPl0j.js";import"./imageExport-Ck9NIU6v.js";class K{static computePolygon(t,e,i){const a=[{p1:{x:t.x-e,y:t.y-e},p2:{x:t.x+e,y:t.y-e}},{p1:{x:t.x+e,y:t.y-e},p2:{x:t.x+e,y:t.y+e}},{p1:{x:t.x+e,y:t.y+e},p2:{x:t.x-e,y:t.y+e}},{p1:{x:t.x-e,y:t.y+e},p2:{x:t.x-e,y:t.y-e}}],s=[...i,...a],o=[];for(let c of s)o.push(c.p1,c.p2);const n=[],r=new Set;for(let c of o){const g=`${Math.round(c.x)},${Math.round(c.y)}`;r.has(g)||(r.add(g),n.push(c))}const l=[];for(let c of n){const g=Math.atan2(c.y-t.y,c.x-t.x);l.push(g-1e-5,g,g+1e-5)}const p=[];for(let c of l){const g=Math.cos(c),y=Math.sin(c),v={p1:t,p2:{x:t.x+g*e*1.5,y:t.y+y*e*1.5}};let b=null,w=1/0;for(let L of s){const x=this.getIntersection(v,L);x&&x.param<w&&(w=x.param,b=x)}b&&(b.angle=c,p.push(b))}p.sort((c,g)=>c.angle-g.angle);const m=[];for(let c of p)if(Math.hypot(c.x-t.x,c.y-t.y)>e){const y=t.x+Math.cos(c.angle)*e,v=t.y+Math.sin(c.angle)*e;m.push(y,v)}else m.push(c.x,c.y);return m}static getIntersection(t,e){const i=t.p1.x,a=t.p1.y,s=t.p2.x-t.p1.x,o=t.p2.y-t.p1.y,n=e.p1.x,r=e.p1.y,l=e.p2.x-e.p1.x,p=e.p2.y-e.p1.y;if(Math.sqrt(s*s+o*o)===0||Math.sqrt(l*l+p*p)===0)return null;const g=s*p-o*l;if(g===0)return null;const y=(n-i)*p-(r-a)*l,v=(n-i)*o-(r-a)*s,b=y/g,w=v/g;return b>0&&w>=0&&w<=1?{x:i+s*b,y:a+o*b,param:b}:null}}class j{constructor(t,e={}){this.containerId=t,this.container=document.getElementById(t),this.isDM=e.isDM||!1,this.tokens=new Map,this.isGridActive=!1,this.activeTool="pan",this.stage=new Konva.Stage({container:t,width:e.width||window.innerWidth,height:e.height||window.innerHeight,draggable:this.isDM}),this.bgLayer=new Konva.Layer,this.gridLayer=new Konva.Layer,this.wallLayer=new Konva.Layer,this.fogLayer=new Konva.Layer,this.tokenLayer=new Konva.Layer,this.uiLayer=new Konva.Layer,this.stage.add(this.bgLayer),this.stage.add(this.gridLayer),this.stage.add(this.wallLayer),this.stage.add(this.fogLayer),this.stage.add(this.tokenLayer),this.stage.add(this.uiLayer),this.walls=[],this.isDynamicLightingEnabled=!1,this.mapImage=new Konva.Image({x:0,y:0}),this.bgLayer.add(this.mapImage),this.isVisible=!0,this._setupLazyRendering(),this._setupInteractions()}_setupInteractions(){this.stage.on("wheel",t=>{t.evt.preventDefault();const e=1.1,i=this.stage,a=i.scaleX(),s=i.getPointerPosition(),o={x:(s.x-i.x())/a,y:(s.y-i.y())/a},r=(t.evt.deltaY>0?-1:1)>0?a*e:a/e;if(r<.1||r>10)return;i.scale({x:r,y:r});const l={x:s.x-o.x*r,y:s.y-o.y*r};i.position(l),this.isDM&&this._dispatchCameraUpdate()}),this.stage.on("dragend",t=>{t.target===this.stage&&this.isDM&&this._dispatchCameraUpdate()}),this.isDrawingFog=!1,this.isDrawingWall=!1,this.stage.on("mousedown touchstart",t=>{if(t.evt.button===2||!this.isDM)return;const e=this.stage.getPointerPosition(),i=this.stage.getAbsoluteTransform().copy();i.invert();const a=i.point(e);this.activeTool==="eraser"?(this.isDrawingFog=!0,this.currentFogLine=new Konva.Line({stroke:"black",strokeWidth:60,globalCompositeOperation:"destination-out",lineCap:"round",lineJoin:"round",points:[a.x,a.y,a.x,a.y]}),this.fogLayer.add(this.currentFogLine)):this.activeTool==="wall"&&(this.isDrawingWall=!0,this.wallStartPos=a,this.currentWallLine=new Konva.Line({stroke:"#0ea5e9",strokeWidth:4,lineCap:"round",points:[a.x,a.y,a.x,a.y],opacity:.8}),this.wallLayer.add(this.currentWallLine))}),this.stage.on("mousemove touchmove",t=>{if(!this.isDM)return;const e=this.stage.getPointerPosition(),i=this.stage.getAbsoluteTransform().copy();i.invert();const a=i.point(e);if(this.isDrawingFog&&this.activeTool==="eraser"){const s=this.currentFogLine.points().concat([a.x,a.y]);this.currentFogLine.points(s)}else this.isDrawingWall&&this.activeTool==="wall"&&(this.currentWallLine.points([this.wallStartPos.x,this.wallStartPos.y,a.x,a.y]),this.isVisible&&this.wallLayer.draw())}),this.stage.on("mouseup touchend",()=>{if(this.isDrawingFog)this.isDrawingFog=!1,this.isDM&&this.currentFogLine&&this._dispatchFogPath(this.currentFogLine.points());else if(this.isDrawingWall&&(this.isDrawingWall=!1,this.isDM&&this.currentWallLine)){const t=this.currentWallLine.points(),e={p1:{x:t[0],y:t[1]},p2:{x:t[2],y:t[3]}};this.walls.push(e),this._dispatchWall(e),this.isDynamicLightingEnabled&&this.renderDynamicLighting()}})}setTool(t){this.activeTool=t,t==="eraser"||t==="wall"?(this.stage.draggable(!1),this.container.style.cursor="crosshair"):(this.stage.draggable(this.isDM),this.container.style.cursor="grab")}_dispatchCameraUpdate(){const t=new CustomEvent("tome:camera_update",{detail:{x:this.stage.x(),y:this.stage.y(),scale:this.stage.scaleX()}});window.dispatchEvent(t)}_dispatchFogPath(t){const e=new CustomEvent("tome:fog_path",{detail:{points:t}});window.dispatchEvent(e)}_dispatchWall(t){const e=new CustomEvent("tome:wall_drawn",{detail:{wall:t}});window.dispatchEvent(e)}setDynamicLightingEnabled(t){this.isDynamicLightingEnabled=t,t?this.renderDynamicLighting():(this.fogLayer.destroyChildren(),this.setFog({enabled:!0,paths:[]}))}renderDynamicLighting(){if(!this.isDynamicLightingEnabled)return;this.fogLayer.getChildren().toArray().forEach(e=>{e.attrs.id!=="global-darkness"&&e.destroy()});for(const e of this.tokens.values()){const i={x:e.x(),y:e.y()},a=800,s=K.computePolygon(i,a,this.walls),o=new Konva.Line({points:s,fillRadialGradientStartPoint:{x:i.x,y:i.y},fillRadialGradientStartRadius:0,fillRadialGradientEndPoint:{x:i.x,y:i.y},fillRadialGradientEndRadius:a,fillRadialGradientColorStops:[0,"rgba(255,255,255,1)",.8,"rgba(255,255,255,0.8)",1,"rgba(255,255,255,0)"],closed:!0,globalCompositeOperation:"destination-out",listening:!1});this.fogLayer.add(o)}this.isVisible&&this.fogLayer.draw()}setCamera(t,e,i){this.stage.to({x:t,y:e,scaleX:i,scaleY:i,duration:.5,easing:Konva.Easings.EaseOut})}addFogPath(t){const e=new Konva.Line({stroke:"black",strokeWidth:60,globalCompositeOperation:"destination-out",lineCap:"round",lineJoin:"round",points:t});this.fogLayer.add(e),this.isVisible&&this.fogLayer.draw()}_setupLazyRendering(){this.container&&(this.observer=new IntersectionObserver(t=>{t.forEach(e=>{e.isIntersecting?(this.isVisible=!0,this.stage.listening(!0),this.stage.batchDraw()):(this.isVisible=!1,this.stage.listening(!1))})},{threshold:.05}),this.observer.observe(this.container))}setMapUrl(t){if(!t){this.mapImage.image(null),this.isVisible&&this.bgLayer.draw();return}const e=new Image;e.onload=()=>{this.mapImage.image(e),this.mapImage.width(e.width),this.mapImage.height(e.height),this.isVisible&&this.bgLayer.draw()},e.src=t}setFog(t){if(this.fogLayer.destroyChildren(),t&&t.enabled){const e=new Konva.Rect({x:-5e3,y:-5e3,width:1e4,height:1e4,fill:"black",opacity:.95,id:"global-darkness"});this.fogLayer.add(e),this.isDynamicLightingEnabled?this.renderDynamicLighting():t.paths&&Array.isArray(t.paths)&&t.paths.forEach(i=>this.addFogPath(i))}this.isVisible&&this.fogLayer.draw()}setGrid(t,e){if(this.isGridActive=t,this.gridLayer.destroyChildren(),t){for(let o=0;o<5e3/50;o++)this.gridLayer.add(new Konva.Line({points:[Math.round(o*50)+.5,0,Math.round(o*50)+.5,5e3],stroke:"rgba(255, 255, 255, 0.2)",strokeWidth:1}));for(let o=0;o<5e3/50;o++)this.gridLayer.add(new Konva.Line({points:[0,Math.round(o*50)+.5,5e3,Math.round(o*50)+.5],stroke:"rgba(255, 255, 255, 0.2)",strokeWidth:1}))}this.isVisible&&this.gridLayer.draw()}updateTokens(t){const e=new Set(t.map(i=>i.id));for(const[i,a]of this.tokens.entries())e.has(i)||a.to({scaleX:0,scaleY:0,opacity:0,duration:.3,onFinish:()=>{a.destroy(),this.tokens.delete(i)}});t.forEach(i=>{let a=this.tokens.get(i.id);a?this._updateToken(a,i):(a=this._createToken(i),this.tokens.set(i.id,a),this.tokenLayer.add(a),a.scale({x:0,y:0}),a.opacity(0),a.to({scaleX:1,scaleY:1,opacity:1,duration:.4,easing:Konva.Easings.ElasticEaseOut}))}),this.isVisible&&this.tokenLayer.draw()}_createToken(t){const e=new Konva.Group({id:t.id,x:t.x||0,y:t.y||0,draggable:this.isDM}),i=new Konva.Circle({radius:t.size||25,fill:t.color||"blue",stroke:"white",strokeWidth:2,shadowColor:"black",shadowBlur:10,shadowOffset:{x:2,y:5},shadowOpacity:.5}),a=new Konva.Text({text:t.name?t.name.substring(0,1).toUpperCase():"",fontSize:t.size||25,fontFamily:"Cinzel",fill:"white",x:-(t.size||25)/2,y:-(t.size||25)/2,width:(t.size||25)*2,align:"center",verticalAlign:"middle",shadowColor:"black",shadowBlur:5});if(e.add(i),e.add(a),t.avatar){const s=new Image;s.onload=()=>{i.fillPatternImage(s),i.fillPatternOffset({x:s.width/2,y:s.height/2}),i.fillPatternScale({x:(t.size||25)*2/s.width,y:(t.size||25)*2/s.height}),a.hide(),this.isVisible&&this.tokenLayer.draw()},s.src=t.avatar}return this.isDM&&(e.on("dragstart",()=>{e.moveToTop()}),e.on("dragmove",()=>{this.isDynamicLightingEnabled&&this.renderDynamicLighting()}),e.on("dragend",s=>{let o=s.target.x(),n=s.target.y();this.isGridActive&&(o=Math.round(o/50)*50,n=Math.round(n/50)*50,s.target.to({x:o,y:n,duration:.2,easing:Konva.Easings.EaseOut}),this.isDynamicLightingEnabled&&setTimeout(()=>this.renderDynamicLighting(),210));const r=new CustomEvent("tome:token_moved",{detail:{id:t.id,x:o,y:n}});window.dispatchEvent(r)})),e}_updateToken(t,e){(Math.abs(t.x()-e.x)>2||Math.abs(t.y()-e.y)>2)&&t.to({x:e.x,y:e.y,duration:.4,easing:Konva.Easings.EaseInOut})}resize(t,e){this.stage.width(t),this.stage.height(e),this.isVisible&&this.stage.draw()}showPing(t,e,i="red"){if(!this.isVisible)return;const a=new Konva.Ring({innerRadius:5,outerRadius:10,x:t,y:e,fill:i,opacity:.8,shadowColor:i,shadowBlur:20}),s=new Konva.Circle({radius:8,x:t,y:e,fill:i,opacity:1});this.uiLayer.add(a),this.uiLayer.add(s),a.to({outerRadius:80,innerRadius:70,opacity:0,duration:1.2,easing:Konva.Easings.EaseOut,onFinish:()=>a.destroy()}),s.to({opacity:0,duration:1.5,easing:Konva.Easings.EaseOut,onFinish:()=>s.destroy()})}showSpellEffect(t,e,i,a="spell"){const s=a==="spell"?12:6,o=new Konva.Group({x:t,y:e}),n=new Konva.Circle({radius:5,fill:i,opacity:.9,shadowColor:i,shadowBlur:15});o.add(n),n.to({radius:a==="spell"?60:40,opacity:0,duration:.8,easing:Konva.Easings.EaseOut,onFinish:()=>n.destroy()});for(let r=0;r<s;r++){const l=Math.PI*2/s*r,p=a==="spell"?70:45,m=Math.cos(l)*p,c=Math.sin(l)*p,g=new Konva.Circle({x:0,y:0,radius:a==="spell"?4:2,fill:i,opacity:1,shadowColor:i,shadowBlur:10});o.add(g),g.to({x:m+(Math.random()*20-10),y:c+(Math.random()*20-10),opacity:0,radius:0,duration:.6+Math.random()*.4,easing:Konva.Easings.EaseOut,onFinish:()=>g.destroy()})}this.uiLayer.add(o),setTimeout(()=>{o.destroy()},1200)}}class W extends O{constructor(t){super(t),this.mapEngine=null,this.mapUrl=this.store.state.mapUrl||"",this.fog=this.store.state.mapFog||!1,this.grid=this.store.state.mapGrid||!1,this.broadcast=new BroadcastChannel("tome_map"),this.fogPaths=[],this.sidebarOpen=!1,this.activeTool="pan",this.dynamicLighting=!1}template(){return`
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
        `}_renderDrawerTokens(){const t=this.store.state.initiativeOrder||[];return t.length===0?'<div style="color: #64748b; font-size: 0.8rem; text-align: center; padding: 20px 0;">Fila de iniciativa vazia.</div>':t.map(e=>{const i=e.type!=="Player";let a=e.img||e.portraitData||null;i&&!a&&(a=$.getImage(e)),a&&a.startsWith("db://")&&(a=null);const s=i?"#ef4444":"#3b82f6";return`
                <div class="drawer-token-item" style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; cursor: pointer; transition: background 0.2s;" data-action="placeToken" data-id="${e.id}">
                    <div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${s}; background-color: ${s}; background-image: url('${a||""}'); background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
                        ${a?"":`<span style="color: white; font-size: 0.8rem; font-weight: bold;">${e.name.substring(0,1).toUpperCase()}</span>`}
                    </div>
                    <div style="flex: 1; overflow: hidden;">
                        <div style="font-size: 0.85rem; color: #e2e8f0; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${e.name}</div>
                        <div style="font-size: 0.7rem; color: #64748b;">${e.hp!==void 0?`HP: ${e.hp}`:""}</div>
                    </div>
                    <button class="btn btn-ghost" style="padding: 4px; font-size: 0.8rem;" title="Colocar no Mapa"><i class="fa-solid fa-crosshairs"></i></button>
                </div>
            `}).join("")}onMount(){this.mapEngine=new j("dm-map-container",{width:window.innerWidth,height:window.innerHeight,isDM:!0}),this.mapUrl&&this.mapEngine.setMapUrl(this.mapUrl),this.grid&&this.mapEngine.setGrid(!0,"1.5m"),this.fog&&this.mapEngine.setFog({enabled:!0,paths:this.fogPaths});const t=this.$("#tactical-initiative-container");t&&(t.innerHTML="",this._initiativeMonitor=new H({store:this.store}),this._initiativeMonitor.mount(t),this._initiativeMonitor.element.parentNode.__component=this._initiativeMonitor),this._cameraUpdateHandler=i=>{const{x:a,y:s,scale:o}=i.detail;this.broadcast.postMessage({type:"CAMERA_UPDATE",data:{x:a,y:s,scale:o}})},window.addEventListener("tome:camera_update",this._cameraUpdateHandler),this._fogPathHandler=i=>{const{points:a}=i.detail;this.fogPaths.push(a),this.broadcast.postMessage({type:"FOG_PATH_UPDATE",data:{points:a}})},window.addEventListener("tome:fog_path",this._fogPathHandler),this._tokenMoveHandler=i=>{const{id:a,x:s,y:o}=i.detail;this.broadcast.postMessage({type:"DELTA_UPDATE",deltaType:"TOKEN_MOVE",data:{id:a,x:s,y:o}})},window.addEventListener("tome:token_moved",this._tokenMoveHandler);const e=this.$("#dm-map-container");e&&(e.addEventListener("contextmenu",i=>{if(i.preventDefault(),this.activeTool==="eraser")return;const a=this.mapEngine.stage,s=a.getPointerPosition();if(s){const o=a.getAbsoluteTransform().copy();o.invert();const n=o.point(s);this.mapEngine.showPing(n.x,n.y,"#10b981"),this.broadcast.postMessage({type:"PING",position:{x:n.x,y:n.y},color:"#10b981"})}}),e.addEventListener("dragover",i=>{i.preventDefault(),i.dataTransfer.dropEffect="copy"}),e.addEventListener("drop",i=>{i.preventDefault();const a=i.dataTransfer.getData("application/json");if(a)try{const s=JSON.parse(a),o=this.mapEngine.stage;o.setPointersPositions(i);const n=o.getPointerPosition();if(n){const r=o.getAbsoluteTransform().copy();r.invert();const l=r.point(n);if(s.type==="spell"){this.mapEngine.showSpellEffect(l.x,l.y,"#9c27b0","spell");const p=this._getStageCenter(r);window.TOME&&window.TOME.audio&&window.TOME.audio.playSpatialSFX("https://freesound.org/data/previews/404/404764_118613-lq.mp3",l.x,l.y,p.x,p.y,this.mapEngine.stage.scaleX()),window.TOME&&window.TOME.events&&window.TOME.events.emit("SYSTEM_NOTIFICATION",{text:`${s.sourceHeroName} invocou ${s.data.name}!`,type:"info"})}else if(s.type==="attack"){this.mapEngine.showSpellEffect(l.x,l.y,"#ef4444","attack");const p=this._getStageCenter(r);window.TOME&&window.TOME.audio&&window.TOME.audio.playSpatialSFX("https://freesound.org/data/previews/415/415209_5121236-lq.mp3",l.x,l.y,p.x,p.y,this.mapEngine.stage.scaleX()),window.TOME&&window.TOME.events&&window.TOME.events.emit("SYSTEM_NOTIFICATION",{text:`${s.sourceHeroName} atacou com ${s.data.name}!`,type:"warning"})}}}catch(s){console.error("[TacticalEye] Erro ao processar drop:",s)}})),this._resizeHandler=()=>{if(this.mapEngine){const i=window.innerWidth;this.mapEngine.resize(i,window.innerHeight)}},window.addEventListener("resize",this._resizeHandler),this._loadTokensFromStore()}_getStageCenter(t){const e=this.mapEngine.stage.x(),i=this.mapEngine.stage.y(),a=this.mapEngine.stage.scaleX(),s=-e/a+window.innerWidth/2/a,o=-i/a+window.innerHeight/2/a;return{x:s,y:o}}onUnmount(){this.broadcast&&(this.broadcast.close(),this.broadcast=null),this._cameraUpdateHandler&&window.removeEventListener("tome:camera_update",this._cameraUpdateHandler),this._fogPathHandler&&window.removeEventListener("tome:fog_path",this._fogPathHandler),this._tokenMoveHandler&&window.removeEventListener("tome:token_moved",this._tokenMoveHandler),this._resizeHandler&&window.removeEventListener("resize",this._resizeHandler)}onStoreUpdate(){const t=this.$("#drawer-tokens");t&&(t.innerHTML=this._renderDrawerTokens()),this._loadTokensFromStore()}_loadTokensFromStore(){const e=(this.store.state.initiativeOrder||[]).map((i,a)=>{var l;const s=i.type!=="Player";let o=i.img||i.portraitData||null;s&&!o&&(o=$.getImage(i)),o&&o.startsWith("db://")&&(o=null);const n=(l=this.mapEngine)==null?void 0:l.tokens.get(i.id),r=i.size==="Grande"?50:i.size==="Enorme"?75:25;return{id:i.id,name:i.name,avatar:o,color:s?"#ef4444":"#3b82f6",size:r,x:n?n.x():100+a*60%500,y:n?n.y():100+Math.floor(a/8)*60}});this.mapEngine&&this.mapEngine.updateTokens(e)}toggleSidebar(){this.sidebarOpen=!this.sidebarOpen,this.render()}setToolPan(){this.activeTool="pan",this.mapEngine.setTool("pan"),this.render("Palette")}setToolEraser(){this.activeTool="eraser",this.mapEngine.setTool("eraser"),this.render("Palette")}setToolWall(){this.activeTool="wall",this.mapEngine.setTool("wall"),this.render("Palette")}render_Palette(){this.render()}applyMapUrl(){const t=this.$("#map-url-input").value.trim();this.mapUrl=t,this.store.update(e=>{e.mapUrl=t}),this.mapEngine.setMapUrl(t),C.show("Mapa atualizado.","info"),this.render()}toggleGrid(){this.grid=!this.grid,this.store.update(t=>{t.mapGrid=this.grid}),this.mapEngine.setGrid(this.grid,"1.5m"),this.render()}toggleFog(){this.fog=!this.fog,this.store.update(t=>{t.mapFog=this.fog}),this.fog?this.mapEngine.setFog({enabled:!0,paths:this.fogPaths}):this.mapEngine.setFog({enabled:!1}),this.render()}toggleDynamicLighting(){this.dynamicLighting=!this.dynamicLighting,this.mapEngine.setDynamicLightingEnabled(this.dynamicLighting),this.dynamicLighting&&!this.fog&&(this.fog=!0,this.store.update(t=>{t.mapFog=!0}),this.mapEngine.setFog({enabled:!0,paths:this.fogPaths})),this.render("Palette")}placeToken(t,e){const i=e.dataset.id,s=this.mapEngine.stage.getAbsoluteTransform().copy();s.invert();const o=s.point({x:window.innerWidth/2,y:window.innerHeight/2}),n=this.mapEngine.tokens.get(i);if(n){n.to({x:o.x,y:o.y,duration:.5,easing:Konva.Easings.ElasticEaseOut});const r=new CustomEvent("tome:token_moved",{detail:{id:i,x:o.x,y:o.y}});window.dispatchEvent(r),C.show("Token movido para o centro da tela.","info")}}syncToSpectator(){if(!this.mapEngine)return;const t=Array.from(this.mapEngine.tokens.values()).map(a=>{const s=a.findOne("Text"),o=a.findOne("Circle");return{id:a.id(),x:a.x(),y:a.y(),name:s?s.text():"Token",size:o?o.radius()*2:50,color:o?o.fill():"#ffffff"}}),e=this.store.state.initiativeOrder||[],i=t.map(a=>{const s=e.find(o=>o.id===a.id);if(s){const o=s.type!=="Player";let n=s.img||s.portraitData||null;o&&!n&&(n=$.getImage(s)),n&&!n.startsWith("db://")&&(a.avatar=n)}return a});this.broadcast.postMessage({type:"MAP_UPDATE",mapUrl:this.mapUrl,fog:{enabled:this.fog,paths:this.fogPaths},gridActive:this.grid,gridScale:"1.5m",tokens:i}),this.broadcast.postMessage({type:"CAMERA_UPDATE",data:{x:this.mapEngine.stage.x(),y:this.mapEngine.stage.y(),scale:this.mapEngine.stage.scaleX()}}),C.show("Sincronização cinematográfica ativada!","success")}closeModal(){this.unmount(),this.element.remove()}}class V extends G{constructor(e){super(e);M(this,"close",()=>{this.element&&this.element.parentNode&&this.element.parentNode.parentNode&&this.element.parentNode.parentNode.removeChild(this.element.parentNode),this.unmount()});M(this,"setTab",e=>{this._activeTab=e,this.render()});this.playerId=e.playerId,this.player=null,this._activeTab="inventory"}_renderInventory(){const e=this.player.inventory||[];return f`
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:15px; margin-top:15px;">
                ${e.length===0?f`<div style="opacity:0.5; text-align:center; padding:20px; grid-column:1/-1;">Inventário vazio.</div>`:""}
                ${e.map(i=>f`
                    <div class="card glass" style="padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:12px;">
                        <div style="width:40px; height:40px; border-radius:8px; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; color:var(--accent);">
                            <i class="fa-solid ${i.type==="weapon"?"fa-khanda":i.type==="armor"?"fa-shield":"fa-box"}"></i>
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:bold; font-size:0.9rem; color:#fff;">${i.name}</div>
                            <div style="font-size:0.7rem; color:var(--text-dim);">${i.damage?`Dano: ${i.damage}`:i.desc||"Item Comum"}</div>
                        </div>
                    </div>
                `)}
            </div>
        `}_renderSpells(){const e=this.player;return f`
            <div style="display:flex; flex-direction:column; gap:15px; margin-top:15px; max-height:450px; overflow-y:auto; padding-right:10px;" class="custom-scroll">
                ${[0,1,2,3,4,5,6,7,8,9].map(a=>{var r,l;const s=((r=e.spells)==null?void 0:r[`lvl${a}`])||"";if(!s.trim())return"";const o=s.split(`
`).filter(p=>p.trim());if(o.length===0)return"";const n=((l=e.spellSlots)==null?void 0:l[a])||{total:0,used:0};return f`
                        <div class="card glass-accent" style="padding:15px; border-radius:12px; border:1px solid rgba(197,160,89,0.2);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
                                <div style="font-family:'Cinzel'; font-weight:bold; color:var(--accent); font-size:1.1rem;">
                                    ${a===0?"TRUQUES":`NÍVEL ${a}`}
                                </div>
                                ${a>0?f`
                                    <div style="font-size:0.8rem; color:var(--text-dim);">
                                        Slots: <span style="color:#fff;">${n.total-n.used} / ${n.total}</span>
                                    </div>
                                `:""}
                            </div>
                            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px;">
                                ${o.map(p=>f`
                                    <div style="background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.05); font-size:0.85rem; color:#e2e8f0; display:flex; align-items:center; gap:8px;">
                                        <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent); font-size:0.7rem;"></i> ${p}
                                    </div>
                                `)}
                            </div>
                        </div>
                    `})}
            </div>
        `}template(){if(this.player=this.store.state.players.find(i=>i.id===this.playerId),!this.player)return f`<div>Heroi não encontrado.</div>`;const e=z.getHP(this.player);return f`
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px);">
                <div class="card glass-accent animate-scaleIn" style="max-width:800px; width:100%; padding:0; border:2px solid var(--accent); max-height:90vh; overflow:hidden; background:rgba(15,12,16,0.95); position:relative; display:flex; flex-direction:column;">
                    
                    <!-- Header -->
                    <div style="padding:25px; border-bottom:1px solid rgba(197,160,89,0.3); background:linear-gradient(to bottom, rgba(197,160,89,0.1), transparent); display:flex; align-items:center; gap:20px;">
                        <button class="btn btn-ghost" onClick=${this.close} style="position:absolute; top:20px; right:20px; border-radius:50%; width:36px; height:36px; padding:0;">
                            <i class="fa-solid fa-times"></i>
                        </button>
                        
                        <div style="width:70px; height:70px; border-radius:50%; border:2px solid var(--accent); background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-family:'Cinzel'; color:var(--accent); overflow:hidden;">
                            ${this.player.img?f`<img src="${this.player.img}" style="width:100%; height:100%; object-fit:cover;" />`:this.player.name.substring(0,1)}
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
        `}}class B extends O{constructor(t){super(t),this.categories=[{name:"Combate & Ação",sounds:[{id:"sword_clash",name:"Golpe de Espada",url:"https://freesound.org/data/previews/415/415209_5121236-lq.mp3",color:"#ef4444"},{id:"bow_shoot",name:"Flecha",url:"https://freesound.org/data/previews/344/344276_5121236-lq.mp3",color:"#f59e0b"},{id:"fireball",name:"Bola de Fogo",url:"https://freesound.org/data/previews/442/442953_4523992-lq.mp3",color:"#f97316"},{id:"magic_blast",name:"Explosão Arcana",url:"https://freesound.org/data/previews/404/404764_118613-lq.mp3",color:"#8b5cf6"},{id:"shield_block",name:"Defesa de Escudo",url:"https://freesound.org/data/previews/399/399303_7614679-lq.mp3",color:"#3b82f6"}]},{name:"Ambiente & Tensão",sounds:[{id:"thunder",name:"Trovão",url:"https://freesound.org/data/previews/102/102723_1739504-lq.mp3",color:"#64748b"},{id:"wolf_howl",name:"Uivo Distante",url:"https://freesound.org/data/previews/148/148705_1385413-lq.mp3",color:"#a3e635"},{id:"door_creak",name:"Porta Rangendo",url:"https://freesound.org/data/previews/119/119864_1896899-lq.mp3",color:"#84cc16"},{id:"heartbeat",name:"Batimentos",url:"https://freesound.org/data/previews/332/332056_5316315-lq.mp3",color:"#dc2626"}]}]}playSound(t){u.audio&&(u.audio.playSFX(t),u.socket&&u.socket.emit("fx_animation",{event:"SOUNDBOARD",details:{url:t}}))}closeModal(){this.element&&this.element.parentNode&&this.element.parentNode.removeChild(this.element),this.unmount()}setMasterVolume(t){u.audio&&u.audio.setMasterVolume(parseFloat(t))}template(){return f`
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
                        ${this.categories.map(t=>f`
                            <div class="mb-8 last:mb-0">
                                <h3 class="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                                    ${t.name}
                                </h3>
                                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    ${t.sounds.map(e=>f`
                                        <button class="btn flex flex-col items-center gap-2 p-3 rounded-lg border border-white/10 bg-white/5 transition-all cursor-pointer hover:scale-105"
                                                style="border-color: ${e.color}40;"
                                                onMouseOver=${i=>{i.currentTarget.style.background=e.color+"20",i.currentTarget.style.borderColor=e.color}}
                                                onMouseOut=${i=>{i.currentTarget.style.background="rgba(255,255,255,0.05)",i.currentTarget.style.borderColor=e.color+"40"}}
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
                               onInput=${t=>this.setMasterVolume(t.target.value)}
                               class="w-40 accent-accent cursor-pointer" />
                    </div>

                </div>
            </div>
        `}}function q(h){if(!h||!h.state){alert("Erro: Nenhuma campanha ativa carregada para backup.");return}try{const t=h.state,e={tomeVersion:"3.0.0",exportTimestamp:Date.now(),exportDateFormatted:new Date().toLocaleString("pt-BR"),campaignTitle:t.title||t.nome||"Campanha_Elo_Arcano",state:t},i=JSON.stringify(e,null,2),a=new Blob([i],{type:"application/json;charset=utf-8"}),s=URL.createObjectURL(a),o=document.createElement("a"),n=String(e.campaignTitle).replace(/[^a-zA-Z0-9_-]/g,"_");o.href=s,o.download=`${n}_backup_${new Date().toISOString().slice(0,10)}.tome`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(s),console.log(`[TomeBackup] Arquivo .tome gerado com sucesso (${(i.length/1024).toFixed(2)} KB).`)}catch(t){console.error("Falha na exportação da campanha:",t),alert("Erro ao gerar arquivo de backup: "+t.message)}}function X(h,t){if(!h){alert("Store não inicializada.");return}const e=document.createElement("input");e.type="file",e.accept=".tome,.json",e.onchange=i=>{var o;const a=(o=i.target.files)==null?void 0:o[0];if(!a)return;const s=new FileReader;s.onload=n=>{try{const r=JSON.parse(n.target.result),l=r.state||r;confirm(`📦 Deseja restaurar a campanha "${r.campaignTitle||a.name}"? Todos os dados atuais não salvos serão substituídos pelo backup de ${r.exportDateFormatted||"data desconhecida"}.`)&&(typeof h.replaceState=="function"?h.replaceState(l):(h.state=l,typeof h.notify=="function"&&h.notify()),fetch("/api/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({state:l})}).catch(()=>{}),alert("✨ Campanha restaurada com sucesso! O Grimório, Diários, NPCs e Mapas foram atualizados."),typeof t=="function"&&t(l))}catch(r){console.error("Arquivo corrompido ou inválido:",r),alert("O arquivo selecionado não é um backup .tome válido.")}},s.readAsText(a)},e.click()}function ft(){const h=A("players")||[],[t,e]=S(!1),[i,a]=S(!1),s=k(null),o=k(null),n=k(null),r=k(null),l=k(null),p=k(null);I(()=>{const d=_=>{var E;return e(((E=_.detail)==null?void 0:E.active)||!1)};return window.addEventListener("tome:ai_processing",d),s.current&&(r.current=new F({store:u.store,root:s.current,element:s.current}),r.current.mount()),o.current&&(l.current=new U({store:u.store,element:o.current}),l.current.mount()),n.current&&(p.current=new N({store:u.store,element:n.current}),p.current.mount()),()=>{window.removeEventListener("tome:ai_processing",d),r.current&&r.current.unmount(),l.current&&l.current.unmount(),p.current&&p.current.unmount()}},[]);const m=(d,_={})=>{const E=document.createElement("div");document.body.appendChild(E);try{R(f`<${d} store=${u.store} ...${_} />`,E)}catch{new d({store:u.store,element:E,..._}).mount()}},c=()=>m(W),g=()=>T(()=>import("./EncounterGenerator-CQoCvZVc.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11])).then(d=>m(d.EncounterGenerator)),y=()=>m(B),v=()=>{T(()=>import("./LootGenerator-B0JluE4a.js"),__vite__mapDeps([12,1,2,3,4,5,6,7,8,10])).then(d=>m(d.LootGenerator))},b=()=>{T(()=>import("./SpellBook-B-d5lEOF.js"),__vite__mapDeps([13,7,4,5,14])).then(d=>m(d.SpellBook))},w=()=>{T(()=>import("./OracleModal-BPXc-V2q.js"),__vite__mapDeps([15,3,4,5,6])).then(d=>{d.OracleModal&&m(d.OracleModal)}).catch(d=>console.warn("OracleModal module missing",d))},L=d=>m(V,{playerId:d}),x=d=>{window.TOME&&window.TOME.events&&window.TOME.events.emit("DICE_ROLL_REQUESTED",d)};return f`
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
                    ${t&&f`
                        <div class="ml-3 px-3 py-1 bg-purple-900/30 border border-purple-500/50 rounded-xl text-xs text-purple-300 flex items-center gap-2 animate-pulse">
                            <i class="fa-solid fa-microchip"></i> Oráculo Pensando...
                        </div>
                    `}
                </div>
                <div class="flex gap-3">
                    <button class="btn btn-primary bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] px-4" onClick=${c}>
                        <i class="fa-solid fa-map-location-dot"></i> Olho do Mestre
                    </button>
                    <button class="btn btn-ghost border-cyan-400 text-cyan-300 bg-cyan-900/10 px-4" onClick=${y}>
                        <i class="fa-solid fa-headphones-simple"></i> Som & SFX
                    </button>
                    <button class="btn btn-ghost border-purple-500 text-purple-300 bg-purple-900/20 shadow-[0_0_12px_rgba(168,85,247,0.3)] px-4" onClick=${w}>
                        <i class="fa-solid fa-crystal-ball"></i> Oráculo IA
                    </button>
                    <button class="btn btn-ghost border-accent text-accent px-4" onClick=${b}>
                        <i class="fa-solid fa-scroll"></i> Grimório
                    </button>
                    <button class="btn btn-ghost border-accent text-accent px-4" onClick=${v}>
                        <i class="fa-solid fa-coins"></i> Gerar Tesouro
                    </button>
                    <button class="btn btn-magic px-4" onClick=${g}>
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Encontro
                    </button>
                    <button class="btn btn-ghost border-blue-500 text-blue-400 bg-blue-900/20 px-4" onClick=${()=>q(u.store)} title="Exportar backup completo (.tome)">
                        <i class="fa-solid fa-file-export"></i> Backup
                    </button>
                    <button class="btn btn-ghost border-emerald-500 text-emerald-400 bg-emerald-900/20 px-4" onClick=${()=>X(u.store,()=>window.location.reload())} title="Restaurar campanha (.tome / .json)">
                        <i class="fa-solid fa-file-import"></i> Restaurar
                    </button>
                    <button class="btn btn-primary px-4" onClick=${()=>a(!i)}>
                        <i class="fa-solid fa-dice-d20"></i> Rolar Dados
                    </button>
                </div>
            </header>

            <!-- COLUNA ESQUERDA (Tracker e Notas) -->
            <div class="flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar min-w-0">
                <div ref=${s} class="card glass-accent min-h-[50vh] relative p-0 overflow-hidden shadow-md">
                    <!-- Combat Tracker será montado aqui -->
                </div>
                
                <div ref=${n} class="card glass-accent flex-1 min-h-[30vh] p-0 overflow-hidden shadow-md">
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
                        ${h.length===0?f`<div class="text-center p-3 text-slate-500 text-[0.8rem]">Nenhum herói ativo.</div>`:f`
                                <div class="flex flex-wrap gap-2 justify-center">
                                    ${h.map(d=>f`
                                        <div class="cursor-pointer flex items-center gap-2.5 bg-black/40 border border-white/5 hover:border-accent/50 rounded-full px-2.5 py-1.5 transition-all hover:bg-white/5 shadow-sm" 
                                             onClick=${()=>L(d.id)} title="Inspecionar ${d.name}">
                                            <div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-cinzel text-accent text-sm border border-accent overflow-hidden shrink-0">
                                                ${d.img?f`<img src="${d.img}" class="w-full h-full object-cover" />`:d.name.substring(0,1)}
                                            </div>
                                            <div class="pr-2 min-w-0">
                                                <div class="text-xs font-bold text-white leading-tight truncate max-w-[100px]">${d.name}</div>
                                                <div class="text-[0.55rem] text-accent uppercase font-cinzel tracking-wider mt-0.5">Nv. ${d.level||1}</div>
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
                    <div ref=${o} class="flex-1 overflow-y-auto p-0 bg-black/40 custom-scrollbar relative">
                        <!-- Bestiary será montado aqui -->
                    </div>
                </div>
            </div>

            <!-- BANDEJA DE DADOS -->
            ${i&&f`
                <div class="fixed bottom-[30px] left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-accent/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[2000] animate-slideUp">
                    <button class="btn btn-ghost" onClick=${()=>x(4)}><i class="fa-solid fa-dice-d4"></i> d4</button>
                    <button class="btn btn-ghost" onClick=${()=>x(6)}><i class="fa-solid fa-dice-d6"></i> d6</button>
                    <button class="btn btn-ghost" onClick=${()=>x(8)}><i class="fa-solid fa-dice-d8"></i> d8</button>
                    <button class="btn btn-ghost" onClick=${()=>x(10)}><i class="fa-solid fa-dice-d10"></i> d10</button>
                    <button class="btn btn-ghost" onClick=${()=>x(12)}><i class="fa-solid fa-dice-d12"></i> d12</button>
                    <button class="btn btn-primary px-6 py-2.5 text-lg font-bold" onClick=${()=>x(20)}><i class="fa-solid fa-dice-d20"></i> d20</button>
                    <button class="btn btn-ghost text-red-500 border-red-500/30 hover:bg-red-500/20 ml-2" onClick=${()=>a(!1)}><i class="fa-solid fa-times"></i></button>
                </div>
            `}
        </div>
    `}export{ft as DMTable};
