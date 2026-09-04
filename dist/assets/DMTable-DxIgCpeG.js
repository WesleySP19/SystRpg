const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/EncounterGenerator-04dBQ493.js","assets/Boot-NkMUf4fQ.js","assets/main-B1-MC9BY.js","assets/tailwind-CVCQhc7L.js","assets/tailwind-DnQd0C99.css","assets/main-BThde0JO.css","assets/FXEngine-C9GwQj6_.js","assets/Bestiary-zn3AsJaD.js","assets/Toast-m0Ci56ke.js","assets/MonsterArt-DEMUppHj.js","assets/schemas-BpTWaDfx.js","assets/LootGenerator-BvYxVQ43.js","assets/SpellBook-BCjKLB8U.js","assets/spells-5e-BGObI9bO.js","assets/OracleModal-DBj187A9.js","assets/ReferencePanel-BCm1crUC.js"])))=>i.map(i=>d[i]);
import{_ as Z}from"./main-B1-MC9BY.js";import{u as ce,a as e,m as g}from"./Boot-NkMUf4fQ.js";import{d as A,A as re,h as le,b as Ee,T as U,R as Te}from"./FXEngine-C9GwQj6_.js";import{CombatTrackerV22 as Ce}from"./CombatTrackerV22-DmKxMsjQ.js";import{B as Me}from"./Bestiary-zn3AsJaD.js";import{SessionJournal as Oe}from"./SessionJournal-NOoTrHGL.js";import{T as $e}from"./TacticalMapEnginePixi-CXSO85qD.js";import{M as se}from"./MonsterArt-DEMUppHj.js";import{Toast as K}from"./Toast-m0Ci56ke.js";import{InitiativeMonitor as Ie}from"./InitiativeMonitor-Cb4JqeJ9.js";import"./tailwind-CVCQhc7L.js";import"./schemas-BpTWaDfx.js";import"./imageExport-BGvIrfaA.js";function Ae({unmount:b}){const s=ce(),f=(s==null?void 0:s.initiativeOrder)||[],x=(s==null?void 0:s.mapUrl)||"",E=(s==null?void 0:s.mapFog)||!1,p=(s==null?void 0:s.mapGrid)||!1,a=(s==null?void 0:s.activeTable)||localStorage.getItem("DM_ACTIVE_TABLE")||"default-table",[w,D]=A(x),[u,z]=A(E),[h,V]=A(p),[j,G]=A(!1),[P,X]=A("pan"),[B,H]=A(!1),[r,N]=A(x),o=re(null),I=re(null),R=re([]);le(()=>{I.current=new BroadcastChannel("tome_map");let t=!1;(async()=>{const d=new $e("dm-map-container",{width:window.innerWidth,height:window.innerHeight,isDM:!0});if(await d.init(window.innerWidth,window.innerHeight),t){d.destroy();return}o.current=d,x&&d.setMapUrl(x),p&&d.setGrid(!0,"1.5m"),E&&d.setFog({enabled:!0,paths:R.current}),de()})();const n=d=>{var O,$,L;const{x:_,y:C,scale:M}=d.detail,y={type:"CAMERA_UPDATE",data:{x:_,y:C,scale:M},tableId:a};(O=I.current)==null||O.postMessage(y),(L=($=window.TOME)==null?void 0:$.socket)==null||L.emit("map_sync_event",y)};window.addEventListener("tome:camera_update",n);const l=d=>{var y,O,$;const{points:_,paths:C}=d.detail;C?R.current=C:R.current.push(_);const M={type:"FOG_UPDATE",data:{points:_,paths:R.current},tableId:a};(y=I.current)==null||y.postMessage({type:"FOG_PATH_UPDATE",data:{points:_},tableId:a}),($=(O=window.TOME)==null?void 0:O.socket)==null||$.emit("map_sync_event",M)};window.addEventListener("tome:fog_path",l);const c=d=>{var O,$,L,F;const{id:_,x:C,y:M}=d.detail,y={id:_,x:C,y:M};(O=I.current)==null||O.postMessage({type:"DELTA_UPDATE",deltaType:"TOKEN_MOVE",data:y,tableId:a}),(L=($=window.TOME)==null?void 0:$.socket)==null||L.emit("map_sync_event",{type:"TOKEN_MOVE",data:y,tableId:a}),(F=window.TOME)!=null&&F.socket&&window.TOME.socket.emit("delta_state_update",{patches:[{op:"replace",path:`/tacticalMap/tokens/${_}`,value:{x:C,y:M}}]})};window.addEventListener("tome:token_moved",c);const m=d=>{var y;const{id:_,x:C,y:M}=d.detail;(y=window.TOME)!=null&&y.webrtc&&window.TOME.webrtc.broadcast({type:"TOKEN_DRAG",id:_,x:C,y:M})};window.addEventListener("tome:token_dragging",m);const T=document.getElementById("dm-map-container"),v=d=>{var _,C,M,y;if(d.preventDefault(),P!=="eraser"&&o.current&&o.current.mapContainer){const O=T.getBoundingClientRect(),$=d.clientX-O.left,L=d.clientY-O.top,F=($-o.current.mapContainer.x)/o.current.mapContainer.scale.x,W=(L-o.current.mapContainer.y)/o.current.mapContainer.scale.y;typeof o.current.showPing=="function"&&o.current.showPing(F,W,"#10b981");const Q={type:"PING",position:{x:F,y:W},color:"#10b981",tableId:a};(_=I.current)==null||_.postMessage(Q),(M=(C=window.TOME)==null?void 0:C.socket)==null||M.emit("map_sync_event",Q),(y=window.TOME)!=null&&y.webrtc&&window.TOME.webrtc.broadcast({type:"PING",x:F,y:W,color:"#10b981"})}},k=d=>{d.preventDefault(),d.dataTransfer.dropEffect="copy"},Y=d=>{var C,M,y,O,$,L,F,W,Q;d.preventDefault();const _=d.dataTransfer.getData("application/json");if(_)try{const S=JSON.parse(_),J=o.current;if(J&&J.mapContainer){const pe=T.getBoundingClientRect(),ke=d.clientX-pe.left,_e=d.clientY-pe.top,te=J.mapContainer.scale.x||1,oe=(ke-J.mapContainer.x)/te,ae=(_e-J.mapContainer.y)/te,ne=ie(),be=S.type==="spell"?"#9c27b0":"#ef4444";J.showSpellEffect(oe,ae,be,S.type);const fe={type:"SPELL_EFFECT",x:oe,y:ae,color:be,spellType:S.type,tableId:a};(C=I.current)==null||C.postMessage(fe),(y=(M=window.TOME)==null?void 0:M.socket)==null||y.emit("map_sync_event",fe),S.type==="spell"?((O=window.TOME)!=null&&O.audio&&window.TOME.audio.playSpatialSFX("https://freesound.org/data/previews/404/404764_118613-lq.mp3",oe,ae,ne.x,ne.y,te),($=window.TOME)!=null&&$.events&&window.TOME.events.emit("SYSTEM_NOTIFICATION",{text:`${S.sourceHeroName||"Herói"} invocou ${((L=S.data)==null?void 0:L.name)||"Magia"}!`,type:"info"})):S.type==="attack"&&((F=window.TOME)!=null&&F.audio&&window.TOME.audio.playSpatialSFX("https://freesound.org/data/previews/415/415209_5121236-lq.mp3",oe,ae,ne.x,ne.y,te),(W=window.TOME)!=null&&W.events&&window.TOME.events.emit("SYSTEM_NOTIFICATION",{text:`${S.sourceHeroName||"Herói"} atacou com ${((Q=S.data)==null?void 0:Q.name)||"Ataque"}!`,type:"warning"}))}}catch(S){console.error("[TacticalEye] Erro ao processar drop:",S)}};T&&(T.addEventListener("contextmenu",v),T.addEventListener("dragover",k),T.addEventListener("drop",Y));const q=()=>{o.current&&o.current.resize(window.innerWidth,window.innerHeight)};return window.addEventListener("resize",q),()=>{t=!0,o.current&&o.current.destroy(),I.current&&I.current.close(),window.removeEventListener("tome:camera_update",n),window.removeEventListener("tome:fog_path",l),window.removeEventListener("tome:token_moved",c),window.removeEventListener("tome:token_dragging",m),window.removeEventListener("resize",q),T&&(T.removeEventListener("contextmenu",v),T.removeEventListener("dragover",k),T.removeEventListener("drop",Y))}},[]),le(()=>{de()},[f]);const ie=()=>{const t=o.current;if(!t||!t.mapContainer)return{x:0,y:0};const i=t.mapContainer.x,n=t.mapContainer.y,l=t.mapContainer.scale.x,c=-i/l+window.innerWidth/2/l,m=-n/l+window.innerHeight/2/l;return{x:c,y:m}},de=()=>{if(!o.current)return;const t=f.map((i,n)=>{const l=i.type!=="Player";let c=i.img||i.portraitData||null;l&&!c&&(c=se.getImage(i)),c&&c.startsWith("db://")&&(c=null);const m=o.current.tokens.get(i.id),T=i.size==="Grande"?50:i.size==="Enorme"?75:25,v=m?typeof m.x=="function"?m.x():m.x:null,k=m?typeof m.y=="function"?m.y():m.y:null;return{id:i.id,name:i.name,avatar:c,color:l?"#ef4444":"#3b82f6",size:T,x:v!=null&&!isNaN(v)?v:100+n*60%500,y:k!=null&&!isNaN(k)?k:100+Math.floor(n/8)*60}});o.current.updateTokens(t)},ee=t=>{X(t),o.current&&o.current.setTool(t)},ue=()=>{var i,n,l;const t=r.trim();D(t),(i=window.TOME)!=null&&i.store&&window.TOME.store.update(c=>{c.mapUrl=t}),o.current&&o.current.setMapUrl(t),(l=(n=window.TOME)==null?void 0:n.socket)==null||l.emit("map_sync_event",{type:"MAP_UPDATE",mapUrl:t,tableId:a}),K.show("Mapa atualizado.","info")},me=()=>{var i,n,l;const t=!h;V(t),(i=window.TOME)!=null&&i.store&&window.TOME.store.update(c=>{c.mapGrid=t}),o.current&&o.current.setGrid(t,"1.5m"),(l=(n=window.TOME)==null?void 0:n.socket)==null||l.emit("map_sync_event",{type:"MAP_UPDATE",gridActive:t,gridScale:"1.5m",tableId:a})},ge=()=>{var i,n,l;const t=!u;z(t),(i=window.TOME)!=null&&i.store&&window.TOME.store.update(c=>{c.mapFog=t}),o.current&&(t?o.current.setFog({enabled:!0,paths:R.current}):o.current.setFog({enabled:!1})),(l=(n=window.TOME)==null?void 0:n.socket)==null||l.emit("map_sync_event",{type:"FOG_UPDATE",data:{enabled:t,paths:R.current},tableId:a})},xe=()=>{var i;const t=!B;H(t),o.current&&o.current.setDynamicLightingEnabled(t),t&&!u&&(z(!0),(i=window.TOME)!=null&&i.store&&window.TOME.store.update(n=>{n.mapFog=!0}),o.current&&o.current.setFog({enabled:!0,paths:R.current}))},he=t=>{const i=o.current;if(!i)return;const n=ie(),l=i.tokens.get(t);if(l){l.x=n.x,l.y=n.y;const c=new CustomEvent("tome:token_moved",{detail:{id:t,x:n.x,y:n.y}});window.dispatchEvent(c),K.show("Token movido para o centro da tela.","info")}},ve=()=>{var c,m,T;if(!o.current)return;const i=Array.from(o.current.tokens.values()).map(v=>({id:v.id||"unknown",x:v.x,y:v.y,name:"Token",size:50,color:"#ffffff"})).map(v=>{const k=f.find(Y=>Y.id===v.id);if(k){const Y=k.type!=="Player";let q=k.img||k.portraitData||null;Y&&!q&&(q=se.getImage(k)),q&&!q.startsWith("db://")&&(v.avatar=q),v.name=k.name,v.hp=k.hp,v.maxHp=k.hp_max}return v}),n={type:"MAP_UPDATE",mapUrl:w,fog:{enabled:u,paths:R.current},gridActive:h,gridScale:"1.5m",tokens:i,tableId:a},l={type:"CAMERA_UPDATE",data:{x:o.current.mapContainer.x,y:o.current.mapContainer.y,scale:o.current.mapContainer.scale.x},tableId:a};(c=I.current)==null||c.postMessage(n),(m=I.current)==null||m.postMessage(l),(T=window.TOME)!=null&&T.socket&&(window.TOME.socket.emit("map_sync_event",n),window.TOME.socket.emit("map_sync_event",l)),K.show("📺 Telão e Celulares sincronizados via Rede Local!","success")},we=()=>{var l,c,m;if(!o.current)return;const t=ie(),i={type:"sphere",x:t.x,y:t.y,radius:200,color:"#ef4444"};o.current.setAoeTemplate(i);const n={type:"AOE_TEMPLATE",data:i,tableId:a};(l=I.current)==null||l.postMessage(n),(m=(c=window.TOME)==null?void 0:c.socket)==null||m.emit("map_sync_event",n),K.show("🔥 Modelo de Área de Efeito (20ft) gerado no mapa.","warning")},ye=()=>{b&&b()};return e("div",{class:"fixed inset-0 bg-black/90 z-[10000] overflow-hidden flex animate-fadeIn font-outfit text-slate-200",children:[e("div",{class:"flex flex-col bg-black/80 border-r border-accent/20 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[2px_0_15px_rgba(0,0,0,0.5)] z-20 backdrop-blur-md",style:{width:j?"420px":"0",borderRightWidth:j?"1px":"0"},children:[e("div",{class:"p-4 border-b border-white/5 flex justify-between items-center min-w-[420px]",children:[e("h3",{class:"m-0 font-cinzel text-lg text-accent drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]",children:"Gaveta Tática"}),e("button",{class:"btn btn-ghost p-2 text-slate-400 hover:text-white",onClick:()=>G(!1),children:e("i",{class:"fa-solid fa-times"})})]}),e("div",{class:"flex flex-col flex-1 overflow-hidden min-w-[420px]",children:[e("div",{class:"px-4 py-3 border-b border-white/5 max-h-[150px] overflow-y-auto custom-scrollbar",children:[e("div",{class:"text-[0.65rem] text-slate-400 mb-2 uppercase font-extrabold tracking-widest",children:"Posicionamento (Colocar no Mapa)"}),e("div",{class:"flex flex-col gap-1.5",children:f.length===0?e("div",{class:"text-slate-500 text-xs text-center py-5 font-bold",children:"Fila de iniciativa vazia."}):f.map(t=>{const i=t.type!=="Player";let n=t.img||t.portraitData||null;i&&!n&&(n=se.getImage(t)),n&&n.startsWith("db://")&&(n=null);const l=i?"border-red-500 bg-red-500/20":"border-blue-500 bg-blue-500/20",c=i?"#ef4444":"#3b82f6";return e("div",{class:"flex items-center gap-2.5 p-2 bg-white/5 border border-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group",onClick:()=>he(t.id),children:[e("div",{class:`w-8 h-8 rounded-full border-2 ${l} bg-cover bg-center flex items-center justify-center overflow-hidden shadow-md`,style:n?{backgroundImage:`url('${n}')`}:{},children:!n&&e("span",{class:"text-white text-xs font-bold font-cinzel",style:{color:c},children:t.name.substring(0,1).toUpperCase()})}),e("div",{class:"flex-1 overflow-hidden",children:[e("div",{class:"text-sm text-slate-200 truncate font-bold font-cinzel",children:t.name}),e("div",{class:"text-[0.65rem] text-slate-500 font-extrabold uppercase tracking-wider",children:t.hp!==void 0?`HP: ${t.hp}`:""})]}),e("button",{class:"btn btn-ghost p-1.5 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity",title:"Colocar no Mapa",children:e("i",{class:"fa-solid fa-crosshairs"})})]},t.id)})})]}),e("div",{class:"flex-1 overflow-hidden relative bg-black/20",children:e(Ie,{})})]})]}),e("div",{class:"flex-1 relative",children:[e("div",{class:"absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none",children:[e("div",{class:"flex gap-4 items-start",children:[e("button",{class:"btn btn-primary pointer-events-auto p-3.5 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.5)]",onClick:()=>G(!j),children:e("i",{class:"fa-solid fa-bars"})}),e("div",{class:"bg-black/80 p-3 px-5 rounded-xl border border-accent/30 pointer-events-auto flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md",children:[e("div",{class:"flex items-center gap-3",children:[e("div",{class:"w-8 h-8 bg-emerald-500/10 border border-emerald-500 rounded-lg flex items-center justify-center text-emerald-500 text-lg shadow-[0_0_10px_rgba(16,185,129,0.2)]",children:e("i",{class:"fa-solid fa-map-location-dot"})}),e("h2",{class:"m-0 font-cinzel text-lg text-accent tracking-widest",children:"Olho do Mestre"})]}),e("div",{class:"flex gap-2",children:[e("input",{type:"text",class:"w-[200px] py-1.5 px-3 text-sm bg-black/50 border border-white/20 rounded-lg text-white outline-none focus:border-accent",placeholder:"URL do Mapa...",value:r,onInput:t=>N(t.target.value)}),e("button",{class:"btn btn-ghost py-1.5 px-3 border border-white/20 text-slate-300 hover:text-white",onClick:ue,children:e("i",{class:"fa-solid fa-check"})})]})]})]}),e("div",{class:"flex gap-3 pointer-events-auto",children:[e("button",{class:"btn bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl border-none shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]",onClick:ve,children:[e("i",{class:"fa-solid fa-satellite-dish mr-2"})," Sincronizar Telão"]}),e("button",{class:"btn bg-red-900/80 text-white font-bold px-4 py-2.5 rounded-xl border border-red-500/50 shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:bg-red-800",onClick:ye,children:[e("i",{class:"fa-solid fa-times mr-2"})," Fechar"]})]})]}),e("div",{class:"absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-black/80 p-2 rounded-2xl border border-white/10 pointer-events-auto flex gap-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md",children:[e("button",{class:`tool-btn ${P==="pan"?"active":""}`,onClick:()=>ee("pan"),title:"Mover Câmera / Tokens (V)",children:e("i",{class:"fa-solid fa-hand"})}),e("button",{class:`tool-btn ${P==="eraser"?"active":""}`,onClick:()=>ee("eraser"),title:"Pincel Revelador de Névoa (E)",children:e("i",{class:"fa-solid fa-eraser"})}),e("button",{class:`tool-btn ${P==="ruler"?"active":""}`,onClick:()=>ee("ruler"),title:"Régua de Medição (R)",children:e("i",{class:"fa-solid fa-ruler-combined"})}),e("button",{class:"tool-btn",onClick:we,title:"Modelo de Área de Efeito / Magia (Bola de Fogo 20ft)",children:e("i",{class:"fa-solid fa-burst"})}),e("button",{class:`tool-btn ${P==="wall"?"active":""}`,onClick:()=>ee("wall"),title:"Desenhar Parede Oculta (W)",children:e("i",{class:"fa-solid fa-layer-group"})}),e("div",{class:"w-px bg-white/10 mx-1"}),e("button",{class:`tool-btn ${h?"active-green":""}`,onClick:me,title:"Grade (G)",children:e("i",{class:"fa-solid fa-border-all"})}),e("button",{class:`tool-btn ${u?"active-purple":""}`,onClick:ge,title:"Névoa de Guerra (F)",children:e("i",{class:"fa-solid fa-cloud"})}),e("button",{class:`tool-btn ${B?"active-yellow":""}`,onClick:xe,title:"Iluminação Dinâmica (L)",children:e("i",{class:"fa-solid fa-lightbulb"})}),e("div",{class:"w-px bg-white/10 mx-1"}),e("button",{class:"tool-btn",onClick:()=>{var t;(t=o.current)==null||t.undo(),K.show("Ação desfeita.","info")},title:"Desfazer (Ctrl+Z)",children:e("i",{class:"fa-solid fa-rotate-left"})}),e("button",{class:"tool-btn",onClick:()=>{var t;(t=o.current)==null||t.redo(),K.show("Ação refeita.","info")},title:"Refazer (Ctrl+Y)",children:e("i",{class:"fa-solid fa-rotate-right"})})]}),e("style",{children:`
                    .tool-btn { width: 45px; height: 45px; border-radius: 12px; border: 1px solid transparent; background: transparent; color: #94a3b8; font-size: 1.1rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                    .tool-btn:hover { background: rgba(255,255,255,0.05); color: white; }
                    .tool-btn.active { background: rgba(197,160,89,0.2); border-color: rgba(197,160,89,0.5); color: var(--accent); box-shadow: 0 0 10px rgba(197,160,89,0.2); }
                    .tool-btn.active-green { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.5); color: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.2); }
                    .tool-btn.active-purple { background: rgba(168,85,247,0.2); border-color: rgba(168,85,247,0.5); color: #a855f7; box-shadow: 0 0 10px rgba(168,85,247,0.2); }
                    .tool-btn.active-yellow { background: rgba(234,179,8,0.2); border-color: rgba(234,179,8,0.5); color: #eab308; box-shadow: 0 0 10px rgba(234,179,8,0.2); }
                `}),e("div",{id:"dm-map-container",class:"absolute inset-0"}),!w&&e("div",{class:"absolute inset-0 flex flex-col items-center justify-center text-white/30 pointer-events-none z-[5]",children:[e("i",{class:"fa-solid fa-map text-6xl mb-5 drop-shadow-lg"}),e("h3",{class:"font-cinzel m-0 text-2xl tracking-widest",children:"Nenhum Mapa Carregado"}),e("p",{class:"text-sm max-w-md text-center mt-3 bg-black/40 p-3 rounded-lg border border-white/5",children:["Insira a URL na barra superior e pressione o ",e("i",{class:"fa-solid fa-check text-accent mx-1"}),"."]})]})]})]})}function De({playerId:b,onClose:s}){const f=ce("players"),[x,E]=A("inventory"),p=re(null),a=f==null?void 0:f.find(z=>z.id===b);if(!a)return g`<div>Heroi não encontrado.</div>`;const w=Ee.getHP(a),D=()=>{const z=a.inventory||[];return g`
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:15px; margin-top:15px;">
                ${z.length===0?g`<div style="opacity:0.5; text-align:center; padding:20px; grid-column:1/-1;">Inventário vazio.</div>`:""}
                ${z.map(h=>g`
                    <div class="card glass" style="padding:15px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:12px;">
                        <div style="width:40px; height:40px; border-radius:8px; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; color:var(--accent);">
                            <i class="fa-solid ${h.type==="weapon"?"fa-khanda":h.type==="armor"?"fa-shield":"fa-box"}"></i>
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:bold; font-size:0.9rem; color:#fff;">${h.name}</div>
                            <div style="font-size:0.7rem; color:var(--text-dim);">${h.damage?"Dano: "+h.damage:h.desc||"Item Comum"}</div>
                        </div>
                    </div>
                `)}
            </div>
        `},u=()=>g`
            <div style="display:flex; flex-direction:column; gap:15px; margin-top:15px; max-height:450px; overflow-y:auto; padding-right:10px;" class="custom-scroll">
                ${[0,1,2,3,4,5,6,7,8,9].map(h=>{var P,X;const V=((P=a.spells)==null?void 0:P[`lvl${h}`])||"";if(!V.trim())return"";const j=V.split(`
`).filter(B=>B.trim());if(j.length===0)return"";const G=((X=a.spellSlots)==null?void 0:X[h])||{total:0,used:0};return g`
                        <div class="card glass-accent" style="padding:15px; border-radius:12px; border:1px solid rgba(197,160,89,0.2);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
                                <div style="font-family:'Cinzel'; font-weight:bold; color:var(--accent); font-size:1.1rem;">
                                    ${h===0?"TRUQUES":"NÍVEL "+h}
                                </div>
                                ${h>0?g`
                                    <div style="font-size:0.8rem; color:var(--text-dim);">
                                        Slots: <span style="color:#fff;">${G.total-G.used} / ${G.total}</span>
                                    </div>
                                `:""}
                            </div>
                            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px;">
                                ${j.map(B=>g`
                                    <div style="background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.05); font-size:0.85rem; color:#e2e8f0; display:flex; align-items:center; gap:8px;">
                                        <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent); font-size:0.7rem;"></i> ${B}
                                    </div>
                                `)}
                            </div>
                        </div>
                    `})}
            </div>
        `;return g`
        <div ref=${p} class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px);">
            <div class="card glass-accent animate-scaleIn" style="max-width:800px; width:100%; padding:0; border:2px solid var(--accent); max-height:90vh; overflow:hidden; background:rgba(15,12,16,0.95); position:relative; display:flex; flex-direction:column;">
                
                <!-- Header -->
                <div style="padding:25px; border-bottom:1px solid rgba(197,160,89,0.3); background:linear-gradient(to bottom, rgba(197,160,89,0.1), transparent); display:flex; align-items:center; gap:20px;">
                    <button class="btn btn-ghost" onClick=${s} style="position:absolute; top:20px; right:20px; border-radius:50%; width:36px; height:36px; padding:0;">
                        <i class="fa-solid fa-times"></i>
                    </button>
                    
                    <div style="width:70px; height:70px; border-radius:50%; border:2px solid var(--accent); background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-family:'Cinzel'; color:var(--accent); overflow:hidden;">
                        ${a.img?g`<img src="${a.img}" style="width:100%; height:100%; object-fit:cover;" />`:a.name.substring(0,1)}
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
                    <button class="btn ${x==="inventory"?"btn-primary":"btn-ghost"}" style="flex:1; border-radius:0; padding:15px; font-weight:bold;" onClick=${()=>E("inventory")}>
                        <i class="fa-solid fa-backpack" style="margin-right:8px;"></i> Equipamento
                    </button>
                    <button class="btn ${x==="spells"?"btn-primary":"btn-ghost"}" style="flex:1; border-radius:0; padding:15px; font-weight:bold;" onClick=${()=>E("spells")}>
                        <i class="fa-solid fa-book-journal-whills" style="margin-right:8px;"></i> Grimório / Magias
                    </button>
                </div>

                <!-- Content -->
                <div style="padding:25px; flex:1; overflow-y:auto;">
                    ${x==="inventory"?D():u()}
                </div>
            </div>
        </div>
    `}function Re({unmount:b}){const s=[{name:"Combate & Ação",sounds:[{id:"sword_clash",name:"Golpe de Espada",url:"https://freesound.org/data/previews/415/415209_5121236-lq.mp3",color:"#ef4444"},{id:"bow_shoot",name:"Flecha",url:"https://freesound.org/data/previews/344/344276_5121236-lq.mp3",color:"#f59e0b"},{id:"fireball",name:"Bola de Fogo",url:"https://freesound.org/data/previews/442/442953_4523992-lq.mp3",color:"#f97316"},{id:"magic_blast",name:"Explosão Arcana",url:"https://freesound.org/data/previews/404/404764_118613-lq.mp3",color:"#8b5cf6"},{id:"shield_block",name:"Defesa de Escudo",url:"https://freesound.org/data/previews/399/399303_7614679-lq.mp3",color:"#3b82f6"}]},{name:"Ambiente & Tensão",sounds:[{id:"thunder",name:"Trovão",url:"https://freesound.org/data/previews/102/102723_1739504-lq.mp3",color:"#64748b"},{id:"wolf_howl",name:"Uivo Distante",url:"https://freesound.org/data/previews/148/148705_1385413-lq.mp3",color:"#a3e635"},{id:"door_creak",name:"Porta Rangendo",url:"https://freesound.org/data/previews/119/119864_1896899-lq.mp3",color:"#84cc16"},{id:"heartbeat",name:"Batimentos",url:"https://freesound.org/data/previews/332/332056_5316315-lq.mp3",color:"#dc2626"}]}],f=p=>{U.audio&&(U.audio.playSFX(p),U.socket&&U.socket.emit("fx_animation",{event:"SOUNDBOARD",details:{url:p}}))},x=p=>{U.audio&&U.audio.setMasterVolume(parseFloat(p))};return e("div",{class:"fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center animate-fadeIn",children:e("div",{class:"bg-gradient-to-br from-bgbase to-black border border-accent/40 rounded-xl w-[90%] max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden transform transition-all animate-slideUp",children:[e("div",{class:"px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/40",children:[e("h2",{class:"font-cinzel text-accent text-xl font-bold m-0 flex items-center gap-3",children:[e("i",{class:"fa-solid fa-music"})," SOUNDBOARD TÁTICO"]}),e("button",{class:"btn btn-ghost text-gray-400 p-2",onClick:()=>{b&&b()},children:e("i",{class:"fa-solid fa-times"})})]}),e("div",{class:"p-6 max-h-[70vh] overflow-y-auto",children:s.map(p=>e("div",{class:"mb-8 last:mb-0",children:[e("h3",{class:"text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2",children:p.name}),e("div",{class:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3",children:p.sounds.map(a=>e("button",{class:"btn flex flex-col items-center gap-2 p-3 rounded-lg border border-white/10 bg-white/5 transition-all cursor-pointer hover:scale-105",style:`border-color: ${a.color}40;`,onMouseOver:w=>{w.currentTarget.style.background=a.color+"20",w.currentTarget.style.borderColor=a.color},onMouseOut:w=>{w.currentTarget.style.background="rgba(255,255,255,0.05)",w.currentTarget.style.borderColor=a.color+"40"},onClick:()=>f(a.url),children:[e("i",{class:"fa-solid fa-volume-high text-xl",style:`color: ${a.color};`}),e("span",{class:"text-xs font-bold text-white text-center",children:a.name})]},a.id))})]},p.name))}),e("div",{class:"px-6 py-4 bg-black/60 border-t border-white/5 flex items-center justify-between",children:[e("span",{class:"text-xs font-bold text-gray-400 uppercase tracking-wider",children:[e("i",{class:"fa-solid fa-sliders"})," Volume Master"]}),e("input",{type:"range",min:"0",max:"1",step:"0.05",defaultValue:"1",onInput:p=>x(p.target.value),class:"w-40 accent-accent cursor-pointer"})]})]})})}function Se(b){if(!b||!b.state){alert("Erro: Nenhuma campanha ativa carregada para backup.");return}try{const s=b.state,f={tomeVersion:"3.0.0",exportTimestamp:Date.now(),exportDateFormatted:new Date().toLocaleString("pt-BR"),campaignTitle:s.title||s.nome||"Campanha_Elo_Arcano",state:s},x=JSON.stringify(f,null,2),E=new Blob([x],{type:"application/json;charset=utf-8"}),p=URL.createObjectURL(E),a=document.createElement("a"),w=String(f.campaignTitle).replace(/[^a-zA-Z0-9_-]/g,"_");a.href=p,a.download=`${w}_backup_${new Date().toISOString().slice(0,10)}.tome`,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(p),console.log(`[TomeBackup] Arquivo .tome gerado com sucesso (${(x.length/1024).toFixed(2)} KB).`)}catch(s){console.error("Falha na exportação da campanha:",s),alert("Erro ao gerar arquivo de backup: "+s.message)}}function ze(b,s){if(!b){alert("Store não inicializada.");return}const f=document.createElement("input");f.type="file",f.accept=".tome,.json",f.onchange=x=>{var a;const E=(a=x.target.files)==null?void 0:a[0];if(!E)return;const p=new FileReader;p.onload=w=>{try{const D=JSON.parse(w.target.result),u=D.state||D;confirm(`📦 Deseja restaurar a campanha "${D.campaignTitle||E.name}"? Todos os dados atuais não salvos serão substituídos pelo backup de ${D.exportDateFormatted||"data desconhecida"}.`)&&(typeof b.replaceState=="function"?b.replaceState(u):(b.state=u,typeof b.notify=="function"&&b.notify()),fetch("/api/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({state:u})}).catch(()=>{}),alert("✨ Campanha restaurada com sucesso! O Grimório, Diários, NPCs e Mapas foram atualizados."),typeof s=="function"&&s(u))}catch(D){console.error("Arquivo corrompido ou inválido:",D),alert("O arquivo selecionado não é um backup .tome válido.")}},p.readAsText(E)},f.click()}function We(){const b=ce("players")||[],[s,f]=A(!1),[x,E]=A(!1),[p,a]=A(null),[w,D]=A(null);le(()=>{const r=N=>{var o;return f(((o=N.detail)==null?void 0:o.active)||!1)};return window.addEventListener("tome:ai_processing",r),()=>{window.removeEventListener("tome:ai_processing",r)}},[]);const u=(r,N={})=>{const o=document.createElement("div");document.body.appendChild(o);try{Te(g`<${r} store=${U.store} ...${N} unmount=${()=>o.remove()} />`,o)}catch{const R=new r({store:U.store,element:o,...N});typeof R.mount=="function"&&R.mount(o)}},z=()=>u(Ae),h=()=>Z(()=>import("./EncounterGenerator-04dBQ493.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10])).then(r=>u(r.EncounterGenerator)),V=()=>u(Re),j=()=>{Z(()=>import("./LootGenerator-BvYxVQ43.js"),__vite__mapDeps([11,1,2,3,4,5,6,8])).then(r=>u(r.LootGenerator))},G=()=>{Z(()=>import("./SpellBook-BCjKLB8U.js"),__vite__mapDeps([12,1,2,3,4,5,6,13])).then(r=>u(r.SpellBook))},P=()=>{Z(()=>import("./OracleModal-DBj187A9.js"),__vite__mapDeps([14,1,2,3,4,5,6])).then(r=>{r.OracleModal&&u(r.OracleModal)}).catch(r=>console.warn("OracleModal module missing",r))},X=()=>{Z(()=>import("./ReferencePanel-BCm1crUC.js"),__vite__mapDeps([15,6,1,2,3,4,5,8])).then(r=>{const N=r.ReferencePanel||r.default;N&&u(N)}).catch(r=>console.warn("ReferencePanel module missing",r))},B=r=>a(r),H=r=>{window.TOME&&window.TOME.events&&window.TOME.events.emit("DICE_ROLL_REQUESTED",r)};return g`
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
                    ${s&&g`
                        <div class="ml-3 px-3 py-1 bg-purple-900/30 border border-purple-500/50 rounded-xl text-xs text-purple-300 flex items-center gap-2 animate-pulse">
                            <i class="fa-solid fa-microchip"></i> Oráculo Pensando...
                        </div>
                    `}
                </div>
                <div class="flex gap-2.5 flex-wrap">
                    <button class="btn btn-primary bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] px-3.5" onClick=${z}>
                        <i class="fa-solid fa-map-location-dot"></i> Olho do Mestre
                    </button>
                    <button class="btn btn-ghost border-amber-500/60 text-amber-300 bg-amber-900/20 px-3.5" onClick=${X}>
                        <i class="fa-solid fa-image"></i> Cenas & Telão
                    </button>
                    <button class="btn btn-ghost border-cyan-400 text-cyan-300 bg-cyan-900/10 px-3.5" onClick=${V}>
                        <i class="fa-solid fa-headphones-simple"></i> Som & SFX
                    </button>
                    <button class="btn btn-ghost border-purple-500 text-purple-300 bg-purple-900/20 shadow-[0_0_12px_rgba(168,85,247,0.3)] px-3.5" onClick=${P}>
                        <i class="fa-solid fa-crystal-ball"></i> Oráculo IA
                    </button>
                    <button class="btn btn-ghost border-accent text-accent px-3.5" onClick=${G}>
                        <i class="fa-solid fa-scroll"></i> Grimório
                    </button>
                    <button class="btn btn-ghost border-accent text-accent px-3.5" onClick=${j}>
                        <i class="fa-solid fa-coins"></i> Gerar Tesouro
                    </button>
                    <button class="btn btn-magic px-3.5" onClick=${h}>
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Encontro
                    </button>
                    <button class="btn btn-ghost border-blue-500 text-blue-400 bg-blue-900/20 px-3" onClick=${()=>Se(U.store)} title="Exportar backup completo (.tome)">
                        <i class="fa-solid fa-file-export"></i> Backup
                    </button>
                    <button class="btn btn-ghost border-emerald-500 text-emerald-400 bg-emerald-900/20 px-3" onClick=${()=>ze(U.store,()=>window.location.reload())} title="Restaurar campanha (.tome / .json)">
                        <i class="fa-solid fa-file-import"></i> Restaurar
                    </button>
                    <button class="btn btn-primary px-3.5" onClick=${()=>E(!x)}>
                        <i class="fa-solid fa-dice-d20"></i> Rolar Dados
                    </button>
                </div>
            </header>

            <!-- COLUNA ESQUERDA (Tracker e Notas) -->
            <div class="flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar min-w-0">
                <div class="card glass-accent min-h-[50vh] relative p-0 overflow-hidden shadow-md">
                    <${Ce} />
                </div>
                
                <div class="card glass-accent flex-1 min-h-[30vh] p-4 overflow-hidden shadow-md">
                    <${Oe} />
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
                        ${b.length===0?g`<div class="text-center p-3 text-slate-500 text-[0.8rem]">Nenhum herói ativo.</div>`:g`
                                <div class="flex flex-wrap gap-2 justify-center">
                                    ${b.map(r=>g`
                                        <div class="cursor-pointer flex items-center gap-2.5 bg-black/40 border border-white/5 hover:border-accent/50 rounded-full px-2.5 py-1.5 transition-all hover:bg-white/5 shadow-sm" 
                                             onClick=${()=>B(r.id)} title="Inspecionar ${r.name}">
                                            <div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-cinzel text-accent text-sm border border-accent overflow-hidden shrink-0">
                                                ${r.img?g`<img src="${r.img}" class="w-full h-full object-cover" />`:r.name.substring(0,1)}
                                            </div>
                                            <div class="pr-2 min-w-0">
                                                <div class="text-xs font-bold text-white leading-tight truncate max-w-[100px]">${r.name}</div>
                                                <div class="text-[0.55rem] text-accent uppercase font-cinzel tracking-wider mt-0.5">Nv. ${r.level||1}</div>
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
                        <${Me} />
                    </div>
                </div>
            </div>

            <!-- MODAL DE INSPEÇÃO DE HERÓI -->
            ${p&&g`
                <div class="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-obsidian-900 border border-accent/40 rounded-2xl p-6 shadow-2xl">
                        <button class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl" onClick=${()=>a(null)}>
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <${De} playerId=${p} onClose=${()=>a(null)} />
                    </div>
                </div>
            `}

            <!-- BANDEJA DE DADOS -->
            ${x&&g`
                <div class="fixed bottom-[30px] left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-accent/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[2000] animate-slideUp">
                    <button class="btn btn-ghost" onClick=${()=>H(4)}><i class="fa-solid fa-dice-d4"></i> d4</button>
                    <button class="btn btn-ghost" onClick=${()=>H(6)}><i class="fa-solid fa-dice-d6"></i> d6</button>
                    <button class="btn btn-ghost" onClick=${()=>H(8)}><i class="fa-solid fa-dice-d8"></i> d8</button>
                    <button class="btn btn-ghost" onClick=${()=>H(10)}><i class="fa-solid fa-dice-d10"></i> d10</button>
                    <button class="btn btn-ghost" onClick=${()=>H(12)}><i class="fa-solid fa-dice-d12"></i> d12</button>
                    <button class="btn btn-primary px-6 py-2.5 text-lg font-bold" onClick=${()=>H(20)}><i class="fa-solid fa-dice-d20"></i> d20</button>
                    <button class="btn btn-ghost text-red-500 border-red-500/30 hover:bg-red-500/20 ml-2" onClick=${()=>E(!1)}><i class="fa-solid fa-times"></i></button>
                </div>
            `}
        </div>
    `}export{We as DMTable};
