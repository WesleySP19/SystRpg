const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/EncounterGenerator-CvG4l8_S.js","assets/Boot-DIzQQwmj.js","assets/main-D6TPueO4.js","assets/tailwind-DeWATx8B.js","assets/tailwind-D1Un5CwA.css","assets/main-BThde0JO.css","assets/FXEngine-Ck0EvS0v.js","assets/Bestiary-BOrd62by.js","assets/Toast-m0Ci56ke.js","assets/MonsterArt-DEMUppHj.js","assets/schemas-BpTWaDfx.js","assets/LootGenerator-DqmB8M2t.js","assets/SpellBook-DPc_vw_U.js","assets/spells-5e-BGObI9bO.js","assets/OracleModal-BXGFp_w2.js","assets/ReferencePanel-RW4TxNji.js"])))=>i.map(i=>d[i]);
import{_ as K}from"./main-D6TPueO4.js";import{u as ae,a as e,m}from"./Boot-DIzQQwmj.js";import{d as A,A as ee,h as oe,b as fe,T as P,R as ue}from"./FXEngine-Ck0EvS0v.js";import{CombatTrackerV22 as me}from"./CombatTrackerV22-rnHVQ0qM.js";import{B as ge}from"./Bestiary-BOrd62by.js";import{SessionJournal as xe}from"./SessionJournal-CQeqp5Ay.js";import{T as he}from"./TacticalMapEnginePixi-CXSO85qD.js";import{M as te}from"./MonsterArt-DEMUppHj.js";import{Toast as J}from"./Toast-m0Ci56ke.js";import{InitiativeMonitor as ve}from"./InitiativeMonitor-DQ7zOfoI.js";import"./tailwind-DeWATx8B.js";import"./schemas-BpTWaDfx.js";import"./imageExport-BGvIrfaA.js";function we({unmount:b}){const s=ae(),f=(s==null?void 0:s.initiativeOrder)||[],g=(s==null?void 0:s.mapUrl)||"",E=(s==null?void 0:s.mapFog)||!1,c=(s==null?void 0:s.mapGrid)||!1,[a,w]=A(g),[T,h]=A(E),[I,y]=A(c),[j,B]=A(!1),[S,X]=A("pan"),[H,q]=A(!1),[L,n]=A(g),o=ee(null),x=ee(null),U=ee([]);oe(()=>{x.current=new BroadcastChannel("tome_map");let t=!1;(async()=>{const p=new he("dm-map-container",{width:window.innerWidth,height:window.innerHeight,isDM:!0});if(await p.init(window.innerWidth,window.innerHeight),t){p.destroy();return}o.current=p,g&&p.setMapUrl(g),c&&p.setGrid(!0,"1.5m"),E&&p.setFog({enabled:!0,paths:U.current}),ne()})();const r=p=>{var O,u,F;const{x:k,y:_,scale:M}=p.detail,v={type:"CAMERA_UPDATE",data:{x:k,y:_,scale:M}};(O=x.current)==null||O.postMessage(v),(F=(u=window.TOME)==null?void 0:u.socket)==null||F.emit("map_sync_event",v)};window.addEventListener("tome:camera_update",r);const l=p=>{var v,O,u;const{points:k,paths:_}=p.detail;_?U.current=_:U.current.push(k);const M={type:"FOG_UPDATE",data:{points:k,paths:U.current}};(v=x.current)==null||v.postMessage({type:"FOG_PATH_UPDATE",data:{points:k}}),(u=(O=window.TOME)==null?void 0:O.socket)==null||u.emit("map_sync_event",M)};window.addEventListener("tome:fog_path",l);const d=p=>{var O,u,F,N;const{id:k,x:_,y:M}=p.detail,v={id:k,x:_,y:M};(O=x.current)==null||O.postMessage({type:"DELTA_UPDATE",deltaType:"TOKEN_MOVE",data:v}),(F=(u=window.TOME)==null?void 0:u.socket)==null||F.emit("map_sync_event",{type:"TOKEN_MOVE",data:v}),(N=window.TOME)!=null&&N.socket&&window.TOME.socket.emit("delta_state_update",{patches:[{op:"replace",path:`/tacticalMap/tokens/${k}`,value:{x:_,y:M}}]})};window.addEventListener("tome:token_moved",d);const D=p=>{var v;const{id:k,x:_,y:M}=p.detail;(v=window.TOME)!=null&&v.webrtc&&window.TOME.webrtc.broadcast({type:"TOKEN_DRAG",id:k,x:_,y:M})};window.addEventListener("tome:token_dragging",D);const C=document.getElementById("dm-map-container"),$=p=>{var k,_,M,v;if(p.preventDefault(),S!=="eraser"&&o.current&&o.current.mapContainer){const O=C.getBoundingClientRect(),u=p.clientX-O.left,F=p.clientY-O.top,N=(u-o.current.mapContainer.x)/o.current.mapContainer.scale.x,V=(F-o.current.mapContainer.y)/o.current.mapContainer.scale.y;typeof o.current.showPing=="function"&&o.current.showPing(N,V,"#10b981");const z={type:"PING",position:{x:N,y:V},color:"#10b981"};(k=x.current)==null||k.postMessage(z),(M=(_=window.TOME)==null?void 0:_.socket)==null||M.emit("map_sync_event",z),(v=window.TOME)!=null&&v.webrtc&&window.TOME.webrtc.broadcast({type:"PING",x:N,y:V,color:"#10b981"})}},R=p=>{p.preventDefault(),p.dataTransfer.dropEffect="copy"},Y=p=>{var _,M,v,O;p.preventDefault();const k=p.dataTransfer.getData("application/json");if(k)try{const u=JSON.parse(k),F=mapEngine.app.stage,N={x:0,y:0};if(N){const V=F.getAbsoluteTransform().copy();V.invert();const z=V.point(N),Z=W(V);u.type==="spell"?(mapEngine.showSpellEffect(z.x,z.y,"#9c27b0","spell"),(_=window.TOME)!=null&&_.audio&&window.TOME.audio.playSpatialSFX("https://freesound.org/data/previews/404/404764_118613-lq.mp3",z.x,z.y,Z.x,Z.y,mapEngine.stage.scaleX()),(M=window.TOME)!=null&&M.events&&window.TOME.events.emit("SYSTEM_NOTIFICATION",{text:`${u.sourceHeroName} invocou ${u.data.name}!`,type:"info"})):u.type==="attack"&&(mapEngine.showSpellEffect(z.x,z.y,"#ef4444","attack"),(v=window.TOME)!=null&&v.audio&&window.TOME.audio.playSpatialSFX("https://freesound.org/data/previews/415/415209_5121236-lq.mp3",z.x,z.y,Z.x,Z.y,mapEngine.stage.scaleX()),(O=window.TOME)!=null&&O.events&&window.TOME.events.emit("SYSTEM_NOTIFICATION",{text:`${u.sourceHeroName} atacou com ${u.data.name}!`,type:"warning"}))}}catch(u){console.error("[TacticalEye] Erro ao processar drop:",u)}};C&&(C.addEventListener("contextmenu",$),C.addEventListener("dragover",R),C.addEventListener("drop",Y));const G=()=>{o.current&&o.current.resize(window.innerWidth,window.innerHeight)};return window.addEventListener("resize",G),()=>{t=!0,o.current&&o.current.destroy(),x.current&&x.current.close(),window.removeEventListener("tome:camera_update",r),window.removeEventListener("tome:fog_path",l),window.removeEventListener("tome:token_moved",d),window.removeEventListener("tome:token_dragging",D),window.removeEventListener("resize",G),C&&(C.removeEventListener("contextmenu",$),C.removeEventListener("dragover",R),C.removeEventListener("drop",Y))}},[]),oe(()=>{ne()},[f]);const W=()=>{const t=o.current;if(!t||!t.mapContainer)return{x:0,y:0};const i=t.mapContainer.x,r=t.mapContainer.y,l=t.mapContainer.scale.x,d=-i/l+window.innerWidth/2/l,D=-r/l+window.innerHeight/2/l;return{x:d,y:D}},ne=()=>{if(!o.current)return;const t=f.map((i,r)=>{const l=i.type!=="Player";let d=i.img||i.portraitData||null;l&&!d&&(d=te.getImage(i)),d&&d.startsWith("db://")&&(d=null);const D=o.current.tokens.get(i.id),C=i.size==="Grande"?50:i.size==="Enorme"?75:25;return{id:i.id,name:i.name,avatar:d,color:l?"#ef4444":"#3b82f6",size:C,x:D?D.x():100+r*60%500,y:D?D.y():100+Math.floor(r/8)*60}});o.current.updateTokens(t)},Q=t=>{X(t),o.current&&o.current.setTool(t)},re=()=>{var i,r,l;const t=L.trim();w(t),(i=window.TOME)!=null&&i.store&&window.TOME.store.update(d=>{d.mapUrl=t}),o.current&&o.current.setMapUrl(t),(l=(r=window.TOME)==null?void 0:r.socket)==null||l.emit("map_sync_event",{type:"MAP_UPDATE",mapUrl:t}),J.show("Mapa atualizado.","info")},ie=()=>{var i,r,l;const t=!I;y(t),(i=window.TOME)!=null&&i.store&&window.TOME.store.update(d=>{d.mapGrid=t}),o.current&&o.current.setGrid(t,"1.5m"),(l=(r=window.TOME)==null?void 0:r.socket)==null||l.emit("map_sync_event",{type:"MAP_UPDATE",gridActive:t,gridScale:"1.5m"})},se=()=>{var i,r,l;const t=!T;h(t),(i=window.TOME)!=null&&i.store&&window.TOME.store.update(d=>{d.mapFog=t}),o.current&&(t?o.current.setFog({enabled:!0,paths:U.current}):o.current.setFog({enabled:!1})),(l=(r=window.TOME)==null?void 0:r.socket)==null||l.emit("map_sync_event",{type:"FOG_UPDATE",data:{enabled:t,paths:U.current}})},le=()=>{var i;const t=!H;q(t),o.current&&o.current.setDynamicLightingEnabled(t),t&&!T&&(h(!0),(i=window.TOME)!=null&&i.store&&window.TOME.store.update(r=>{r.mapFog=!0}),o.current&&o.current.setFog({enabled:!0,paths:U.current}))},ce=t=>{const i=o.current;if(!i)return;const r=W(),l=i.tokens.get(t);if(l){l.x=r.x,l.y=r.y;const d=new CustomEvent("tome:token_moved",{detail:{id:t,x:r.x,y:r.y}});window.dispatchEvent(d),J.show("Token movido para o centro da tela.","info")}},de=()=>{var d,D,C;if(!o.current)return;const i=Array.from(o.current.tokens.values()).map($=>({id:$.id||"unknown",x:$.x,y:$.y,name:"Token",size:50,color:"#ffffff"})).map($=>{const R=f.find(Y=>Y.id===$.id);if(R){const Y=R.type!=="Player";let G=R.img||R.portraitData||null;Y&&!G&&(G=te.getImage(R)),G&&!G.startsWith("db://")&&($.avatar=G),$.name=R.name,$.hp=R.hp,$.maxHp=R.hp_max}return $}),r={type:"MAP_UPDATE",mapUrl:a,fog:{enabled:T,paths:U.current},gridActive:I,gridScale:"1.5m",tokens:i},l={type:"CAMERA_UPDATE",data:{x:o.current.mapContainer.x,y:o.current.mapContainer.y,scale:o.current.mapContainer.scale.x}};(d=x.current)==null||d.postMessage(r),(D=x.current)==null||D.postMessage(l),(C=window.TOME)!=null&&C.socket&&(window.TOME.socket.emit("map_sync_event",r),window.TOME.socket.emit("map_sync_event",l)),J.show("📺 Telão e Celulares sincronizados via Rede Local!","success")},pe=()=>{if(!o.current)return;const t=W();o.current.setAoeTemplate({type:"sphere",x:t.x,y:t.y,radius:200,color:"#ef4444"}),J.show("🔥 Modelo de Área de Efeito (20ft) gerado no mapa.","warning")},be=()=>{b&&b()};return e("div",{class:"fixed inset-0 bg-black/90 z-[10000] overflow-hidden flex animate-fadeIn font-outfit text-slate-200",children:[e("div",{class:"flex flex-col bg-black/80 border-r border-accent/20 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[2px_0_15px_rgba(0,0,0,0.5)] z-20 backdrop-blur-md",style:{width:j?"420px":"0",borderRightWidth:j?"1px":"0"},children:[e("div",{class:"p-4 border-b border-white/5 flex justify-between items-center min-w-[420px]",children:[e("h3",{class:"m-0 font-cinzel text-lg text-accent drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]",children:"Gaveta Tática"}),e("button",{class:"btn btn-ghost p-2 text-slate-400 hover:text-white",onClick:()=>B(!1),children:e("i",{class:"fa-solid fa-times"})})]}),e("div",{class:"flex flex-col flex-1 overflow-hidden min-w-[420px]",children:[e("div",{class:"px-4 py-3 border-b border-white/5 max-h-[150px] overflow-y-auto custom-scrollbar",children:[e("div",{class:"text-[0.65rem] text-slate-400 mb-2 uppercase font-extrabold tracking-widest",children:"Posicionamento (Colocar no Mapa)"}),e("div",{class:"flex flex-col gap-1.5",children:f.length===0?e("div",{class:"text-slate-500 text-xs text-center py-5 font-bold",children:"Fila de iniciativa vazia."}):f.map(t=>{const i=t.type!=="Player";let r=t.img||t.portraitData||null;i&&!r&&(r=te.getImage(t)),r&&r.startsWith("db://")&&(r=null);const l=i?"border-red-500 bg-red-500/20":"border-blue-500 bg-blue-500/20",d=i?"#ef4444":"#3b82f6";return e("div",{class:"flex items-center gap-2.5 p-2 bg-white/5 border border-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group",onClick:()=>ce(t.id),children:[e("div",{class:`w-8 h-8 rounded-full border-2 ${l} bg-cover bg-center flex items-center justify-center overflow-hidden shadow-md`,style:r?{backgroundImage:`url('${r}')`}:{},children:!r&&e("span",{class:"text-white text-xs font-bold font-cinzel",style:{color:d},children:t.name.substring(0,1).toUpperCase()})}),e("div",{class:"flex-1 overflow-hidden",children:[e("div",{class:"text-sm text-slate-200 truncate font-bold font-cinzel",children:t.name}),e("div",{class:"text-[0.65rem] text-slate-500 font-extrabold uppercase tracking-wider",children:t.hp!==void 0?`HP: ${t.hp}`:""})]}),e("button",{class:"btn btn-ghost p-1.5 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity",title:"Colocar no Mapa",children:e("i",{class:"fa-solid fa-crosshairs"})})]},t.id)})})]}),e("div",{class:"flex-1 overflow-hidden relative bg-black/20",children:e(ve,{})})]})]}),e("div",{class:"flex-1 relative",children:[e("div",{class:"absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none",children:[e("div",{class:"flex gap-4 items-start",children:[e("button",{class:"btn btn-primary pointer-events-auto p-3.5 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.5)]",onClick:()=>B(!j),children:e("i",{class:"fa-solid fa-bars"})}),e("div",{class:"bg-black/80 p-3 px-5 rounded-xl border border-accent/30 pointer-events-auto flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md",children:[e("div",{class:"flex items-center gap-3",children:[e("div",{class:"w-8 h-8 bg-emerald-500/10 border border-emerald-500 rounded-lg flex items-center justify-center text-emerald-500 text-lg shadow-[0_0_10px_rgba(16,185,129,0.2)]",children:e("i",{class:"fa-solid fa-map-location-dot"})}),e("h2",{class:"m-0 font-cinzel text-lg text-accent tracking-widest",children:"Olho do Mestre"})]}),e("div",{class:"flex gap-2",children:[e("input",{type:"text",class:"w-[200px] py-1.5 px-3 text-sm bg-black/50 border border-white/20 rounded-lg text-white outline-none focus:border-accent",placeholder:"URL do Mapa...",value:L,onInput:t=>n(t.target.value)}),e("button",{class:"btn btn-ghost py-1.5 px-3 border border-white/20 text-slate-300 hover:text-white",onClick:re,children:e("i",{class:"fa-solid fa-check"})})]})]})]}),e("div",{class:"flex gap-3 pointer-events-auto",children:[e("button",{class:"btn bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl border-none shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]",onClick:de,children:[e("i",{class:"fa-solid fa-satellite-dish mr-2"})," Sincronizar Telão"]}),e("button",{class:"btn bg-red-900/80 text-white font-bold px-4 py-2.5 rounded-xl border border-red-500/50 shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:bg-red-800",onClick:be,children:[e("i",{class:"fa-solid fa-times mr-2"})," Fechar"]})]})]}),e("div",{class:"absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-black/80 p-2 rounded-2xl border border-white/10 pointer-events-auto flex gap-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md",children:[e("button",{class:`tool-btn ${S==="pan"?"active":""}`,onClick:()=>Q("pan"),title:"Mover Câmera / Tokens (V)",children:e("i",{class:"fa-solid fa-hand"})}),e("button",{class:`tool-btn ${S==="eraser"?"active":""}`,onClick:()=>Q("eraser"),title:"Pincel Revelador de Névoa (E)",children:e("i",{class:"fa-solid fa-eraser"})}),e("button",{class:`tool-btn ${S==="ruler"?"active":""}`,onClick:()=>Q("ruler"),title:"Régua de Medição (R)",children:e("i",{class:"fa-solid fa-ruler-combined"})}),e("button",{class:"tool-btn",onClick:pe,title:"Modelo de Área de Efeito / Magia (Bola de Fogo 20ft)",children:e("i",{class:"fa-solid fa-burst"})}),e("button",{class:`tool-btn ${S==="wall"?"active":""}`,onClick:()=>Q("wall"),title:"Desenhar Parede Oculta (W)",children:e("i",{class:"fa-solid fa-layer-group"})}),e("div",{class:"w-px bg-white/10 mx-1"}),e("button",{class:`tool-btn ${I?"active-green":""}`,onClick:ie,title:"Grade (G)",children:e("i",{class:"fa-solid fa-border-all"})}),e("button",{class:`tool-btn ${T?"active-purple":""}`,onClick:se,title:"Névoa de Guerra (F)",children:e("i",{class:"fa-solid fa-cloud"})}),e("button",{class:`tool-btn ${H?"active-yellow":""}`,onClick:le,title:"Iluminação Dinâmica (L)",children:e("i",{class:"fa-solid fa-lightbulb"})}),e("div",{class:"w-px bg-white/10 mx-1"}),e("button",{class:"tool-btn",onClick:()=>{var t;(t=o.current)==null||t.undo(),J.show("Ação desfeita.","info")},title:"Desfazer (Ctrl+Z)",children:e("i",{class:"fa-solid fa-rotate-left"})}),e("button",{class:"tool-btn",onClick:()=>{var t;(t=o.current)==null||t.redo(),J.show("Ação refeita.","info")},title:"Refazer (Ctrl+Y)",children:e("i",{class:"fa-solid fa-rotate-right"})})]}),e("style",{children:`
                    .tool-btn { width: 45px; height: 45px; border-radius: 12px; border: 1px solid transparent; background: transparent; color: #94a3b8; font-size: 1.1rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                    .tool-btn:hover { background: rgba(255,255,255,0.05); color: white; }
                    .tool-btn.active { background: rgba(197,160,89,0.2); border-color: rgba(197,160,89,0.5); color: var(--accent); box-shadow: 0 0 10px rgba(197,160,89,0.2); }
                    .tool-btn.active-green { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.5); color: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.2); }
                    .tool-btn.active-purple { background: rgba(168,85,247,0.2); border-color: rgba(168,85,247,0.5); color: #a855f7; box-shadow: 0 0 10px rgba(168,85,247,0.2); }
                    .tool-btn.active-yellow { background: rgba(234,179,8,0.2); border-color: rgba(234,179,8,0.5); color: #eab308; box-shadow: 0 0 10px rgba(234,179,8,0.2); }
                `}),e("div",{id:"dm-map-container",class:"absolute inset-0"}),!a&&e("div",{class:"absolute inset-0 flex flex-col items-center justify-center text-white/30 pointer-events-none z-[5]",children:[e("i",{class:"fa-solid fa-map text-6xl mb-5 drop-shadow-lg"}),e("h3",{class:"font-cinzel m-0 text-2xl tracking-widest",children:"Nenhum Mapa Carregado"}),e("p",{class:"text-sm max-w-md text-center mt-3 bg-black/40 p-3 rounded-lg border border-white/5",children:["Insira a URL na barra superior e pressione o ",e("i",{class:"fa-solid fa-check text-accent mx-1"}),"."]})]})]})]})}function ye({playerId:b,onClose:s}){const f=ae("players"),[g,E]=A("inventory"),c=ee(null),a=f==null?void 0:f.find(I=>I.id===b);if(!a)return m`<div>Heroi não encontrado.</div>`;const w=fe.getHP(a),T=()=>{const I=a.inventory||[];return m`
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:15px; margin-top:15px;">
                ${I.length===0?m`<div style="opacity:0.5; text-align:center; padding:20px; grid-column:1/-1;">Inventário vazio.</div>`:""}
                ${I.map(y=>m`
                    <div class="card glass" style="padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:12px;">
                        <div style="width:40px; height:40px; border-radius:8px; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; color:var(--accent);">
                            <i class="fa-solid ${y.type==="weapon"?"fa-khanda":y.type==="armor"?"fa-shield":"fa-box"}"></i>
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:bold; font-size:0.9rem; color:#fff;">${y.name}</div>
                            <div style="font-size:0.7rem; color:var(--text-dim);">${y.damage?"Dano: "+y.damage:y.desc||"Item Comum"}</div>
                        </div>
                    </div>
                `)}
            </div>
        `},h=()=>m`
            <div style="display:flex; flex-direction:column; gap:15px; margin-top:15px; max-height:450px; overflow-y:auto; padding-right:10px;" class="custom-scroll">
                ${[0,1,2,3,4,5,6,7,8,9].map(y=>{var X,H;const j=((X=a.spells)==null?void 0:X[`lvl${y}`])||"";if(!j.trim())return"";const B=j.split(`
`).filter(q=>q.trim());if(B.length===0)return"";const S=((H=a.spellSlots)==null?void 0:H[y])||{total:0,used:0};return m`
                        <div class="card glass-accent" style="padding:15px; border-radius:12px; border:1px solid rgba(197,160,89,0.2);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
                                <div style="font-family:'Cinzel'; font-weight:bold; color:var(--accent); font-size:1.1rem;">
                                    ${y===0?"TRUQUES":"NÍVEL "+y}
                                </div>
                                ${y>0?m`
                                    <div style="font-size:0.8rem; color:var(--text-dim);">
                                        Slots: <span style="color:#fff;">${S.total-S.used} / ${S.total}</span>
                                    </div>
                                `:""}
                            </div>
                            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px;">
                                ${B.map(q=>m`
                                    <div style="background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.05); font-size:0.85rem; color:#e2e8f0; display:flex; align-items:center; gap:8px;">
                                        <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent); font-size:0.7rem;"></i> ${q}
                                    </div>
                                `)}
                            </div>
                        </div>
                    `})}
            </div>
        `;return m`
        <div ref=${c} class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px);">
            <div class="card glass-accent animate-scaleIn" style="max-width:800px; width:100%; padding:0; border:2px solid var(--accent); max-height:90vh; overflow:hidden; background:rgba(15,12,16,0.95); position:relative; display:flex; flex-direction:column;">
                
                <!-- Header -->
                <div style="padding:25px; border-bottom:1px solid rgba(197,160,89,0.3); background:linear-gradient(to bottom, rgba(197,160,89,0.1), transparent); display:flex; align-items:center; gap:20px;">
                    <button class="btn btn-ghost" onClick=${s} style="position:absolute; top:20px; right:20px; border-radius:50%; width:36px; height:36px; padding:0;">
                        <i class="fa-solid fa-times"></i>
                    </button>
                    
                    <div style="width:70px; height:70px; border-radius:50%; border:2px solid var(--accent); background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-family:'Cinzel'; color:var(--accent); overflow:hidden;">
                        ${a.img?m`<img src="${a.img}" style="width:100%; height:100%; object-fit:cover;" />`:a.name.substring(0,1)}
                    </div>
                    
                    <div style="flex:1;">
                        <h2 style="margin:0; font-family:'Cinzel'; color:var(--accent); font-size:1.8rem; text-shadow:0 0 10px rgba(197,160,89,0.5);">${a.name}</h2>
                        <div style="font-size:0.9rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">
                            ${a.race} ${a.class} • Nível ${a.level||1}
                        </div>
                    </div>
                    
                    <div style="text-align:right; padding-right:40px;">
                        <div style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">Pontos de Vida</div>
                        <div style="font-size:1.5rem; font-weight:bold; font-family:'Cinzel'; color:${w.current>0?"#10b981":"#ef4444"};">
                            ${w.current} <span style="font-size:1rem; color:var(--text-dim);">/ ${w.max}</span>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <div style="display:flex; border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.4);">
                    <button class="btn ${g==="inventory"?"btn-primary":"btn-ghost"}" style="flex:1; border-radius:0; padding:15px; font-weight:bold;" onClick=${()=>E("inventory")}>
                        <i class="fa-solid fa-backpack" style="margin-right:8px;"></i> Equipamento
                    </button>
                    <button class="btn ${g==="spells"?"btn-primary":"btn-ghost"}" style="flex:1; border-radius:0; padding:15px; font-weight:bold;" onClick=${()=>E("spells")}>
                        <i class="fa-solid fa-book-journal-whills" style="margin-right:8px;"></i> Grimório / Magias
                    </button>
                </div>

                <!-- Content -->
                <div style="padding:25px; flex:1; overflow-y:auto;">
                    ${g==="inventory"?T():h()}
                </div>
            </div>
        </div>
    `}function ke({unmount:b}){const s=[{name:"Combate & Ação",sounds:[{id:"sword_clash",name:"Golpe de Espada",url:"https://freesound.org/data/previews/415/415209_5121236-lq.mp3",color:"#ef4444"},{id:"bow_shoot",name:"Flecha",url:"https://freesound.org/data/previews/344/344276_5121236-lq.mp3",color:"#f59e0b"},{id:"fireball",name:"Bola de Fogo",url:"https://freesound.org/data/previews/442/442953_4523992-lq.mp3",color:"#f97316"},{id:"magic_blast",name:"Explosão Arcana",url:"https://freesound.org/data/previews/404/404764_118613-lq.mp3",color:"#8b5cf6"},{id:"shield_block",name:"Defesa de Escudo",url:"https://freesound.org/data/previews/399/399303_7614679-lq.mp3",color:"#3b82f6"}]},{name:"Ambiente & Tensão",sounds:[{id:"thunder",name:"Trovão",url:"https://freesound.org/data/previews/102/102723_1739504-lq.mp3",color:"#64748b"},{id:"wolf_howl",name:"Uivo Distante",url:"https://freesound.org/data/previews/148/148705_1385413-lq.mp3",color:"#a3e635"},{id:"door_creak",name:"Porta Rangendo",url:"https://freesound.org/data/previews/119/119864_1896899-lq.mp3",color:"#84cc16"},{id:"heartbeat",name:"Batimentos",url:"https://freesound.org/data/previews/332/332056_5316315-lq.mp3",color:"#dc2626"}]}],f=c=>{P.audio&&(P.audio.playSFX(c),P.socket&&P.socket.emit("fx_animation",{event:"SOUNDBOARD",details:{url:c}}))},g=c=>{P.audio&&P.audio.setMasterVolume(parseFloat(c))};return e("div",{class:"fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center animate-fadeIn",children:e("div",{class:"bg-gradient-to-br from-bgbase to-black border border-accent/40 rounded-xl w-[90%] max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden transform transition-all animate-slideUp",children:[e("div",{class:"px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/40",children:[e("h2",{class:"font-cinzel text-accent text-xl font-bold m-0 flex items-center gap-3",children:[e("i",{class:"fa-solid fa-music"})," SOUNDBOARD TÁTICO"]}),e("button",{class:"btn btn-ghost text-gray-400 p-2",onClick:()=>{b&&b()},children:e("i",{class:"fa-solid fa-times"})})]}),e("div",{class:"p-6 max-h-[70vh] overflow-y-auto",children:s.map(c=>e("div",{class:"mb-8 last:mb-0",children:[e("h3",{class:"text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2",children:c.name}),e("div",{class:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3",children:c.sounds.map(a=>e("button",{class:"btn flex flex-col items-center gap-2 p-3 rounded-lg border border-white/10 bg-white/5 transition-all cursor-pointer hover:scale-105",style:`border-color: ${a.color}40;`,onMouseOver:w=>{w.currentTarget.style.background=a.color+"20",w.currentTarget.style.borderColor=a.color},onMouseOut:w=>{w.currentTarget.style.background="rgba(255,255,255,0.05)",w.currentTarget.style.borderColor=a.color+"40"},onClick:()=>f(a.url),children:[e("i",{class:"fa-solid fa-volume-high text-xl",style:`color: ${a.color};`}),e("span",{class:"text-xs font-bold text-white text-center",children:a.name})]},a.id))})]},c.name))}),e("div",{class:"px-6 py-4 bg-black/60 border-t border-white/5 flex items-center justify-between",children:[e("span",{class:"text-xs font-bold text-gray-400 uppercase tracking-wider",children:[e("i",{class:"fa-solid fa-sliders"})," Volume Master"]}),e("input",{type:"range",min:"0",max:"1",step:"0.05",defaultValue:"1",onInput:c=>g(c.target.value),class:"w-40 accent-accent cursor-pointer"})]})]})})}function Ee(b){if(!b||!b.state){alert("Erro: Nenhuma campanha ativa carregada para backup.");return}try{const s=b.state,f={tomeVersion:"3.0.0",exportTimestamp:Date.now(),exportDateFormatted:new Date().toLocaleString("pt-BR"),campaignTitle:s.title||s.nome||"Campanha_Elo_Arcano",state:s},g=JSON.stringify(f,null,2),E=new Blob([g],{type:"application/json;charset=utf-8"}),c=URL.createObjectURL(E),a=document.createElement("a"),w=String(f.campaignTitle).replace(/[^a-zA-Z0-9_-]/g,"_");a.href=c,a.download=`${w}_backup_${new Date().toISOString().slice(0,10)}.tome`,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(c),console.log(`[TomeBackup] Arquivo .tome gerado com sucesso (${(g.length/1024).toFixed(2)} KB).`)}catch(s){console.error("Falha na exportação da campanha:",s),alert("Erro ao gerar arquivo de backup: "+s.message)}}function _e(b,s){if(!b){alert("Store não inicializada.");return}const f=document.createElement("input");f.type="file",f.accept=".tome,.json",f.onchange=g=>{var a;const E=(a=g.target.files)==null?void 0:a[0];if(!E)return;const c=new FileReader;c.onload=w=>{try{const T=JSON.parse(w.target.result),h=T.state||T;confirm(`📦 Deseja restaurar a campanha "${T.campaignTitle||E.name}"? Todos os dados atuais não salvos serão substituídos pelo backup de ${T.exportDateFormatted||"data desconhecida"}.`)&&(typeof b.replaceState=="function"?b.replaceState(h):(b.state=h,typeof b.notify=="function"&&b.notify()),fetch("/api/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({state:h})}).catch(()=>{}),alert("✨ Campanha restaurada com sucesso! O Grimório, Diários, NPCs e Mapas foram atualizados."),typeof s=="function"&&s(h))}catch(T){console.error("Arquivo corrompido ou inválido:",T),alert("O arquivo selecionado não é um backup .tome válido.")}},c.readAsText(E)},f.click()}function Ue(){const b=ae("players")||[],[s,f]=A(!1),[g,E]=A(!1),[c,a]=A(null),[w,T]=A(null);oe(()=>{const n=o=>{var x;return f(((x=o.detail)==null?void 0:x.active)||!1)};return window.addEventListener("tome:ai_processing",n),()=>{window.removeEventListener("tome:ai_processing",n)}},[]);const h=(n,o={})=>{const x=document.createElement("div");document.body.appendChild(x);try{ue(m`<${n} store=${P.store} ...${o} unmount=${()=>x.remove()} />`,x)}catch{const W=new n({store:P.store,element:x,...o});typeof W.mount=="function"&&W.mount(x)}},I=()=>h(we),y=()=>K(()=>import("./EncounterGenerator-CvG4l8_S.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10])).then(n=>h(n.EncounterGenerator)),j=()=>h(ke),B=()=>{K(()=>import("./LootGenerator-DqmB8M2t.js"),__vite__mapDeps([11,1,2,3,4,5,6,8])).then(n=>h(n.LootGenerator))},S=()=>{K(()=>import("./SpellBook-DPc_vw_U.js"),__vite__mapDeps([12,1,2,3,4,5,6,13])).then(n=>h(n.SpellBook))},X=()=>{K(()=>import("./OracleModal-BXGFp_w2.js"),__vite__mapDeps([14,1,2,3,4,5,6])).then(n=>{n.OracleModal&&h(n.OracleModal)}).catch(n=>console.warn("OracleModal module missing",n))},H=()=>{K(()=>import("./ReferencePanel-RW4TxNji.js"),__vite__mapDeps([15,6,1,2,3,4,5,8])).then(n=>{const o=n.ReferencePanel||n.default;o&&h(o)}).catch(n=>console.warn("ReferencePanel module missing",n))},q=n=>a(n),L=n=>{window.TOME&&window.TOME.events&&window.TOME.events.emit("DICE_ROLL_REQUESTED",n)};return m`
        <div class="animate-fadeIn grid grid-cols-1 lg:grid-cols-[2fr_1.2fr] gap-5 p-5 h-screen max-h-screen overflow-hidden bg-bgbase">
            <!-- HEADER (Controle Rápido) -->
            <header class="col-span-full card glass-accent flex justify-between items-center py-4 px-6 shadow-md flex-wrap gap-3">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-xl text-black shadow-[0_0_15px_var(--accent)]">
                        <i class="fa-solid fa-crown"></i>
                    </div>
                    <div>
                        <h2 class="m-0 font-cinzel text-2xl text-accent font-extrabold tracking-wide">Mesa de Controle do Mestre</h2>
                        <span class="text-xs text-slate-400 uppercase tracking-widest font-bold">Gestão de Campanha & Combate Tático</span>
                    </div>
                    ${s&&m`
                        <div class="ml-3 px-3 py-1 bg-purple-900/30 border border-purple-500/50 rounded-xl text-xs text-purple-300 flex items-center gap-2 animate-pulse">
                            <i class="fa-solid fa-microchip"></i> Oráculo Pensando...
                        </div>
                    `}
                </div>
                <div class="flex gap-2.5 flex-wrap">
                    <button class="btn btn-primary bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] px-3.5" onClick=${I}>
                        <i class="fa-solid fa-map-location-dot"></i> Olho do Mestre
                    </button>
                    <button class="btn btn-ghost border-amber-500/60 text-amber-300 bg-amber-900/20 px-3.5" onClick=${H}>
                        <i class="fa-solid fa-image"></i> Cenas & Telão
                    </button>
                    <button class="btn btn-ghost border-cyan-400 text-cyan-300 bg-cyan-900/10 px-3.5" onClick=${j}>
                        <i class="fa-solid fa-headphones-simple"></i> Som & SFX
                    </button>
                    <button class="btn btn-ghost border-purple-500 text-purple-300 bg-purple-900/20 shadow-[0_0_12px_rgba(168,85,247,0.3)] px-3.5" onClick=${X}>
                        <i class="fa-solid fa-crystal-ball"></i> Oráculo IA
                    </button>
                    <button class="btn btn-ghost border-accent text-accent px-3.5" onClick=${S}>
                        <i class="fa-solid fa-scroll"></i> Grimório
                    </button>
                    <button class="btn btn-ghost border-accent text-accent px-3.5" onClick=${B}>
                        <i class="fa-solid fa-coins"></i> Gerar Tesouro
                    </button>
                    <button class="btn btn-magic px-3.5" onClick=${y}>
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Encontro
                    </button>
                    <button class="btn btn-ghost border-blue-500 text-blue-400 bg-blue-900/20 px-3" onClick=${()=>Ee(P.store)} title="Exportar backup completo (.tome)">
                        <i class="fa-solid fa-file-export"></i> Backup
                    </button>
                    <button class="btn btn-ghost border-emerald-500 text-emerald-400 bg-emerald-900/20 px-3" onClick=${()=>_e(P.store,()=>window.location.reload())} title="Restaurar campanha (.tome / .json)">
                        <i class="fa-solid fa-file-import"></i> Restaurar
                    </button>
                    <button class="btn btn-primary px-3.5" onClick=${()=>E(!g)}>
                        <i class="fa-solid fa-dice-d20"></i> Rolar Dados
                    </button>
                </div>
            </header>

            <!-- COLUNA ESQUERDA (Tracker e Notas) -->
            <div class="flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar min-w-0">
                <div class="card glass-accent min-h-[50vh] relative p-0 overflow-hidden shadow-md">
                    <${me} />
                </div>
                
                <div class="card glass-accent flex-1 min-h-[30vh] p-4 overflow-hidden shadow-md">
                    <${xe} />
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
                        ${b.length===0?m`<div class="text-center p-3 text-slate-500 text-[0.8rem]">Nenhum herói ativo.</div>`:m`
                                <div class="flex flex-wrap gap-2 justify-center">
                                    ${b.map(n=>m`
                                        <div class="cursor-pointer flex items-center gap-2.5 bg-black/40 border border-white/5 hover:border-accent/50 rounded-full px-2.5 py-1.5 transition-all hover:bg-white/5 shadow-sm" 
                                             onClick=${()=>q(n.id)} title="Inspecionar ${n.name}">
                                            <div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-cinzel text-accent text-sm border border-accent overflow-hidden shrink-0">
                                                ${n.img?m`<img src="${n.img}" class="w-full h-full object-cover" />`:n.name.substring(0,1)}
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
                <div class="card glass-accent flex-1 flex flex-col p-0 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-accent/20 min-h-[400px]">
                    <div class="bg-gradient-to-r from-accent/15 to-transparent py-3 px-4 text-accent font-cinzel font-bold text-center border-b border-accent/25 tracking-[0.15em]">
                        <i class="fa-solid fa-dragon mr-2"></i> ACESSO RÁPIDO: BESTIÁRIO
                    </div>
                    <div class="flex-1 overflow-y-auto p-2 bg-black/40 custom-scrollbar relative">
                        <${ge} />
                    </div>
                </div>
            </div>

            <!-- MODAL DE INSPEÇÃO DE HERÓI -->
            ${c&&m`
                <div class="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-obsidian-900 border border-accent/40 rounded-2xl p-6 shadow-2xl">
                        <button class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl" onClick=${()=>a(null)}>
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <${ye} playerId=${c} onClose=${()=>a(null)} />
                    </div>
                </div>
            `}

            <!-- BANDEJA DE DADOS -->
            ${g&&m`
                <div class="fixed bottom-[30px] left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-accent/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[2000] animate-slideUp">
                    <button class="btn btn-ghost" onClick=${()=>L(4)}><i class="fa-solid fa-dice-d4"></i> d4</button>
                    <button class="btn btn-ghost" onClick=${()=>L(6)}><i class="fa-solid fa-dice-d6"></i> d6</button>
                    <button class="btn btn-ghost" onClick=${()=>L(8)}><i class="fa-solid fa-dice-d8"></i> d8</button>
                    <button class="btn btn-ghost" onClick=${()=>L(10)}><i class="fa-solid fa-dice-d10"></i> d10</button>
                    <button class="btn btn-ghost" onClick=${()=>L(12)}><i class="fa-solid fa-dice-d12"></i> d12</button>
                    <button class="btn btn-primary px-6 py-2.5 text-lg font-bold" onClick=${()=>L(20)}><i class="fa-solid fa-dice-d20"></i> d20</button>
                    <button class="btn btn-ghost text-red-500 border-red-500/30 hover:bg-red-500/20 ml-2" onClick=${()=>E(!1)}><i class="fa-solid fa-times"></i></button>
                </div>
            `}
        </div>
    `}export{Ue as DMTable};
