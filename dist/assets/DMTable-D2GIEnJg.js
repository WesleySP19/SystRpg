const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/EncounterGenerator-BTnAZ4Uc.js","assets/Boot-iPu23rrC.js","assets/main-C1Nkaf1s.js","assets/tailwind-577Mf46G.js","assets/tailwind-BkL95tmz.css","assets/main-CN4ln_Wq.css","assets/FXEngine-BKbXWGrS.js","assets/Bestiary-kluqoigZ.js","assets/Toast-m0Ci56ke.js","assets/MonsterArt-3kughPIq.js","assets/LootGenerator-C2EIP8PX.js","assets/SpellBook-B_RY-xwG.js","assets/spells-5e-BGObI9bO.js","assets/OracleModal-BDsnnTip.js"])))=>i.map(i=>d[i]);
import{_ as q}from"./main-C1Nkaf1s.js";import{u as K,a as e,m}from"./Boot-iPu23rrC.js";import{d as M,A as V,h as Q,b as be,T as z,R as fe}from"./FXEngine-BKbXWGrS.js";import{T as me,C as ue}from"./CombatTrackerV22-hPI63IxP.js";import{B as ge}from"./Bestiary-kluqoigZ.js";import{SessionJournal as xe}from"./SessionJournal-CDn6XPbj.js";import{M as Y}from"./MonsterArt-3kughPIq.js";import{Toast as J}from"./Toast-m0Ci56ke.js";import{InitiativeMonitor as he}from"./InitiativeMonitor-BrMOUl36.js";import"./tailwind-577Mf46G.js";import"./imageExport-Ck9NIU6v.js";function ve({unmount:p}){const s=K(),b=(s==null?void 0:s.initiativeOrder)||[],u=(s==null?void 0:s.mapUrl)||"",y=(s==null?void 0:s.mapFog)||!1,l=(s==null?void 0:s.mapGrid)||!1,[o,g]=M(u),[_,x]=M(y),[D,h]=M(l),[R,U]=M(!1),[S,j]=M("pan"),[N,C]=M(!1),[i,G]=M(u),a=V(null),I=V(null),L=V([]);Q(()=>{I.current=new BroadcastChannel("tome_map");let t=!1;(async()=>{const c=new me("dm-map-container",{width:window.innerWidth,height:window.innerHeight,isDM:!0});if(await c.init(window.innerWidth,window.innerHeight),t){c.destroy();return}a.current=c,u&&c.setMapUrl(u),l&&c.setGrid(!0,"1.5m"),y&&c.setFog({enabled:!0,paths:L.current}),ee()})();const r=c=>{var T;const{x:k,y:E,scale:$}=c.detail;(T=I.current)==null||T.postMessage({type:"CAMERA_UPDATE",data:{x:k,y:E,scale:$}})};window.addEventListener("tome:camera_update",r);const f=c=>{var E;const{points:k}=c.detail;L.current.push(k),(E=I.current)==null||E.postMessage({type:"FOG_PATH_UPDATE",data:{points:k}})};window.addEventListener("tome:fog_path",f);const d=c=>{var T,F;const{id:k,x:E,y:$}=c.detail;(T=I.current)==null||T.postMessage({type:"DELTA_UPDATE",deltaType:"TOKEN_MOVE",data:{id:k,x:E,y:$}}),(F=window.TOME)!=null&&F.socket&&window.TOME.socket.emit("delta_state_update",{patches:[{op:"replace",path:`/tacticalMap/tokens/${k}`,value:{x:E,y:$}}]})};window.addEventListener("tome:token_moved",d);const v=c=>{var T;const{id:k,x:E,y:$}=c.detail;(T=window.TOME)!=null&&T.webrtc&&window.TOME.webrtc.broadcast({type:"TOKEN_DRAG",id:k,x:E,y:$})};window.addEventListener("tome:token_dragging",v);const w=document.getElementById("dm-map-container"),A=c=>{var k,E;if(c.preventDefault(),S!=="eraser"&&mapEngine&&mapEngine.mapContainer){const $=w.getBoundingClientRect(),T=c.clientX-$.left,F=c.clientY-$.top,O=(T-mapEngine.mapContainer.x)/mapEngine.mapContainer.scale.x,B=(F-mapEngine.mapContainer.y)/mapEngine.mapContainer.scale.y;typeof mapEngine.showPing=="function"&&mapEngine.showPing(O,B,"#10b981"),(k=I.current)==null||k.postMessage({type:"PING",position:{x:O,y:B},color:"#10b981"}),(E=window.TOME)!=null&&E.webrtc&&window.TOME.webrtc.broadcast({type:"PING",x:O,y:B,color:"#10b981"})}},te=c=>{c.preventDefault(),c.dataTransfer.dropEffect="copy"},oe=c=>{var E,$,T,F;c.preventDefault();const k=c.dataTransfer.getData("application/json");if(k)try{const O=JSON.parse(k),B=mapEngine.app.stage,ne={x:0,y:0};if(ne){const W=B.getAbsoluteTransform().copy();W.invert();const P=W.point(ne),H=Z(W);O.type==="spell"?(mapEngine.showSpellEffect(P.x,P.y,"#9c27b0","spell"),(E=window.TOME)!=null&&E.audio&&window.TOME.audio.playSpatialSFX("https://freesound.org/data/previews/404/404764_118613-lq.mp3",P.x,P.y,H.x,H.y,mapEngine.stage.scaleX()),($=window.TOME)!=null&&$.events&&window.TOME.events.emit("SYSTEM_NOTIFICATION",{text:`${O.sourceHeroName} invocou ${O.data.name}!`,type:"info"})):O.type==="attack"&&(mapEngine.showSpellEffect(P.x,P.y,"#ef4444","attack"),(T=window.TOME)!=null&&T.audio&&window.TOME.audio.playSpatialSFX("https://freesound.org/data/previews/415/415209_5121236-lq.mp3",P.x,P.y,H.x,H.y,mapEngine.stage.scaleX()),(F=window.TOME)!=null&&F.events&&window.TOME.events.emit("SYSTEM_NOTIFICATION",{text:`${O.sourceHeroName} atacou com ${O.data.name}!`,type:"warning"}))}}catch(O){console.error("[TacticalEye] Erro ao processar drop:",O)}};w&&(w.addEventListener("contextmenu",A),w.addEventListener("dragover",te),w.addEventListener("drop",oe));const ae=()=>{a.current&&a.current.resize(window.innerWidth,window.innerHeight)};return window.addEventListener("resize",ae),()=>{t=!0,a.current&&a.current.destroy(),I.current&&I.current.close(),window.removeEventListener("tome:camera_update",r),window.removeEventListener("tome:fog_path",f),window.removeEventListener("tome:token_moved",d),window.removeEventListener("tome:token_dragging",v),window.removeEventListener("resize",ae),w&&(w.removeEventListener("contextmenu",A),w.removeEventListener("dragover",te),w.removeEventListener("drop",oe))}},[]),Q(()=>{ee()},[b]);const Z=()=>{const t=a.current;if(!t||!t.mapContainer)return{x:0,y:0};const n=t.mapContainer.x,r=t.mapContainer.y,f=t.mapContainer.scale.x,d=-n/f+window.innerWidth/2/f,v=-r/f+window.innerHeight/2/f;return{x:d,y:v}},ee=()=>{if(!a.current)return;const t=b.map((n,r)=>{const f=n.type!=="Player";let d=n.img||n.portraitData||null;f&&!d&&(d=Y.getImage(n)),d&&d.startsWith("db://")&&(d=null);const v=a.current.tokens.get(n.id),w=n.size==="Grande"?50:n.size==="Enorme"?75:25;return{id:n.id,name:n.name,avatar:d,color:f?"#ef4444":"#3b82f6",size:w,x:v?v.x():100+r*60%500,y:v?v.y():100+Math.floor(r/8)*60}});a.current.updateTokens(t)},X=t=>{j(t),a.current&&a.current.setTool(t)},re=()=>{var n;const t=i.trim();g(t),(n=window.TOME)!=null&&n.store&&window.TOME.store.update(r=>{r.mapUrl=t}),a.current&&a.current.setMapUrl(t),J.show("Mapa atualizado.","info")},ie=()=>{var n;const t=!D;h(t),(n=window.TOME)!=null&&n.store&&window.TOME.store.update(r=>{r.mapGrid=t}),a.current&&a.current.setGrid(t,"1.5m")},se=()=>{var n;const t=!_;x(t),(n=window.TOME)!=null&&n.store&&window.TOME.store.update(r=>{r.mapFog=t}),a.current&&(t?a.current.setFog({enabled:!0,paths:L.current}):a.current.setFog({enabled:!1}))},le=()=>{var n;const t=!N;C(t),a.current&&a.current.setDynamicLightingEnabled(t),t&&!_&&(x(!0),(n=window.TOME)!=null&&n.store&&window.TOME.store.update(r=>{r.mapFog=!0}),a.current&&a.current.setFog({enabled:!0,paths:L.current}))},ce=t=>{const n=a.current;if(!n)return;const r=Z(),f=n.tokens.get(t);if(f){f.x=r.x,f.y=r.y;const d=new CustomEvent("tome:token_moved",{detail:{id:t,x:r.x,y:r.y}});window.dispatchEvent(d),J.show("Token movido para o centro da tela.","info")}},de=()=>{var r,f;if(!a.current)return;const n=Array.from(a.current.tokens.values()).map(d=>({id:d.id||"unknown",x:d.x,y:d.y,name:"Token",size:50,color:"#ffffff"})).map(d=>{const v=b.find(w=>w.id===d.id);if(v){const w=v.type!=="Player";let A=v.img||v.portraitData||null;w&&!A&&(A=Y.getImage(v)),A&&!A.startsWith("db://")&&(d.avatar=A)}return d});(r=I.current)==null||r.postMessage({type:"MAP_UPDATE",mapUrl:o,fog:{enabled:_,paths:L.current},gridActive:D,gridScale:"1.5m",tokens:n}),(f=I.current)==null||f.postMessage({type:"CAMERA_UPDATE",data:{x:a.current.mapContainer.x,y:a.current.mapContainer.y,scale:a.current.mapContainer.scale.x}}),J.show("Sincronização cinematográfica ativada!","success")},pe=()=>{p&&p()};return e("div",{class:"fixed inset-0 bg-black/90 z-[10000] overflow-hidden flex animate-fadeIn font-outfit text-slate-200",children:[e("div",{class:"flex flex-col bg-black/80 border-r border-accent/20 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[2px_0_15px_rgba(0,0,0,0.5)] z-20 backdrop-blur-md",style:{width:R?"420px":"0",borderRightWidth:R?"1px":"0"},children:[e("div",{class:"p-4 border-b border-white/5 flex justify-between items-center min-w-[420px]",children:[e("h3",{class:"m-0 font-cinzel text-lg text-accent drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]",children:"Gaveta Tática"}),e("button",{class:"btn btn-ghost p-2 text-slate-400 hover:text-white",onClick:()=>U(!1),children:e("i",{class:"fa-solid fa-times"})})]}),e("div",{class:"flex flex-col flex-1 overflow-hidden min-w-[420px]",children:[e("div",{class:"px-4 py-3 border-b border-white/5 max-h-[150px] overflow-y-auto custom-scrollbar",children:[e("div",{class:"text-[0.65rem] text-slate-400 mb-2 uppercase font-extrabold tracking-widest",children:"Posicionamento (Colocar no Mapa)"}),e("div",{class:"flex flex-col gap-1.5",children:b.length===0?e("div",{class:"text-slate-500 text-xs text-center py-5 font-bold",children:"Fila de iniciativa vazia."}):b.map(t=>{const n=t.type!=="Player";let r=t.img||t.portraitData||null;n&&!r&&(r=Y.getImage(t)),r&&r.startsWith("db://")&&(r=null);const f=n?"border-red-500 bg-red-500/20":"border-blue-500 bg-blue-500/20",d=n?"#ef4444":"#3b82f6";return e("div",{class:"flex items-center gap-2.5 p-2 bg-white/5 border border-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors group",onClick:()=>ce(t.id),children:[e("div",{class:`w-8 h-8 rounded-full border-2 ${f} bg-cover bg-center flex items-center justify-center overflow-hidden shadow-md`,style:r?{backgroundImage:`url('${r}')`}:{},children:!r&&e("span",{class:"text-white text-xs font-bold font-cinzel",style:{color:d},children:t.name.substring(0,1).toUpperCase()})}),e("div",{class:"flex-1 overflow-hidden",children:[e("div",{class:"text-sm text-slate-200 truncate font-bold font-cinzel",children:t.name}),e("div",{class:"text-[0.65rem] text-slate-500 font-extrabold uppercase tracking-wider",children:t.hp!==void 0?`HP: ${t.hp}`:""})]}),e("button",{class:"btn btn-ghost p-1.5 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity",title:"Colocar no Mapa",children:e("i",{class:"fa-solid fa-crosshairs"})})]},t.id)})})]}),e("div",{class:"flex-1 overflow-hidden relative bg-black/20",children:e(he,{})})]})]}),e("div",{class:"flex-1 relative",children:[e("div",{class:"absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none",children:[e("div",{class:"flex gap-4 items-start",children:[e("button",{class:"btn btn-primary pointer-events-auto p-3.5 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.5)]",onClick:()=>U(!R),children:e("i",{class:"fa-solid fa-bars"})}),e("div",{class:"bg-black/80 p-3 px-5 rounded-xl border border-accent/30 pointer-events-auto flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-md",children:[e("div",{class:"flex items-center gap-3",children:[e("div",{class:"w-8 h-8 bg-emerald-500/10 border border-emerald-500 rounded-lg flex items-center justify-center text-emerald-500 text-lg shadow-[0_0_10px_rgba(16,185,129,0.2)]",children:e("i",{class:"fa-solid fa-map-location-dot"})}),e("h2",{class:"m-0 font-cinzel text-lg text-accent tracking-widest",children:"Olho do Mestre"})]}),e("div",{class:"flex gap-2",children:[e("input",{type:"text",class:"w-[200px] py-1.5 px-3 text-sm bg-black/50 border border-white/20 rounded-lg text-white outline-none focus:border-accent",placeholder:"URL do Mapa...",value:i,onInput:t=>G(t.target.value)}),e("button",{class:"btn btn-ghost py-1.5 px-3 border border-white/20 text-slate-300 hover:text-white",onClick:re,children:e("i",{class:"fa-solid fa-check"})})]})]})]}),e("div",{class:"flex gap-3 pointer-events-auto",children:[e("button",{class:"btn bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl border-none shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]",onClick:de,children:[e("i",{class:"fa-solid fa-satellite-dish mr-2"})," Sincronizar Telão"]}),e("button",{class:"btn bg-red-900/80 text-white font-bold px-4 py-2.5 rounded-xl border border-red-500/50 shadow-[0_4px_15px_rgba(0,0,0,0.4)] hover:bg-red-800",onClick:pe,children:[e("i",{class:"fa-solid fa-times mr-2"})," Fechar"]})]})]}),e("div",{class:"absolute bottom-5 left-1/2 -translate-x-1/2 z-10 bg-black/80 p-2 rounded-2xl border border-white/10 pointer-events-auto flex gap-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md",children:[e("button",{class:`tool-btn ${S==="pan"?"active":""}`,onClick:()=>X("pan"),title:"Mover Câmera / Tokens (V)",children:e("i",{class:"fa-solid fa-hand"})}),e("button",{class:`tool-btn ${S==="eraser"?"active":""}`,onClick:()=>X("eraser"),title:"Pincel Revelador de Névoa (E)",children:e("i",{class:"fa-solid fa-eraser"})}),e("button",{class:`tool-btn ${S==="wall"?"active":""}`,onClick:()=>X("wall"),title:"Desenhar Parede Oculta (W)",children:e("i",{class:"fa-solid fa-layer-group"})}),e("div",{class:"w-px bg-white/10 mx-1"}),e("button",{class:`tool-btn ${D?"active-green":""}`,onClick:ie,title:"Grade (G)",children:e("i",{class:"fa-solid fa-border-all"})}),e("button",{class:`tool-btn ${_?"active-purple":""}`,onClick:se,title:"Névoa de Guerra (F)",children:e("i",{class:"fa-solid fa-cloud"})}),e("button",{class:`tool-btn ${N?"active-yellow":""}`,onClick:le,title:"Iluminação Dinâmica (L)",children:e("i",{class:"fa-solid fa-lightbulb"})})]}),e("style",{children:`
                    .tool-btn { width: 45px; height: 45px; border-radius: 12px; border: 1px solid transparent; background: transparent; color: #94a3b8; font-size: 1.1rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                    .tool-btn:hover { background: rgba(255,255,255,0.05); color: white; }
                    .tool-btn.active { background: rgba(197,160,89,0.2); border-color: rgba(197,160,89,0.5); color: var(--accent); box-shadow: 0 0 10px rgba(197,160,89,0.2); }
                    .tool-btn.active-green { background: rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.5); color: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.2); }
                    .tool-btn.active-purple { background: rgba(168,85,247,0.2); border-color: rgba(168,85,247,0.5); color: #a855f7; box-shadow: 0 0 10px rgba(168,85,247,0.2); }
                    .tool-btn.active-yellow { background: rgba(234,179,8,0.2); border-color: rgba(234,179,8,0.5); color: #eab308; box-shadow: 0 0 10px rgba(234,179,8,0.2); }
                `}),e("div",{id:"dm-map-container",class:"absolute inset-0"}),!o&&e("div",{class:"absolute inset-0 flex flex-col items-center justify-center text-white/30 pointer-events-none z-[5]",children:[e("i",{class:"fa-solid fa-map text-6xl mb-5 drop-shadow-lg"}),e("h3",{class:"font-cinzel m-0 text-2xl tracking-widest",children:"Nenhum Mapa Carregado"}),e("p",{class:"text-sm max-w-md text-center mt-3 bg-black/40 p-3 rounded-lg border border-white/5",children:["Insira a URL na barra superior e pressione o ",e("i",{class:"fa-solid fa-check text-accent mx-1"}),"."]})]})]})]})}function we({playerId:p,onClose:s}){const b=K("players"),[u,y]=M("inventory"),l=V(null),o=b==null?void 0:b.find(D=>D.id===p);if(!o)return m`<div>Heroi não encontrado.</div>`;const g=be.getHP(o),_=()=>{const D=o.inventory||[];return m`
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:15px; margin-top:15px;">
                ${D.length===0?m`<div style="opacity:0.5; text-align:center; padding:20px; grid-column:1/-1;">Inventário vazio.</div>`:""}
                ${D.map(h=>m`
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
        `},x=()=>m`
            <div style="display:flex; flex-direction:column; gap:15px; margin-top:15px; max-height:450px; overflow-y:auto; padding-right:10px;" class="custom-scroll">
                ${[0,1,2,3,4,5,6,7,8,9].map(h=>{var j,N;const R=((j=o.spells)==null?void 0:j[`lvl${h}`])||"";if(!R.trim())return"";const U=R.split(`
`).filter(C=>C.trim());if(U.length===0)return"";const S=((N=o.spellSlots)==null?void 0:N[h])||{total:0,used:0};return m`
                        <div class="card glass-accent" style="padding:15px; border-radius:12px; border:1px solid rgba(197,160,89,0.2);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
                                <div style="font-family:'Cinzel'; font-weight:bold; color:var(--accent); font-size:1.1rem;">
                                    ${h===0?"TRUQUES":"NÍVEL "+h}
                                </div>
                                ${h>0?m`
                                    <div style="font-size:0.8rem; color:var(--text-dim);">
                                        Slots: <span style="color:#fff;">${S.total-S.used} / ${S.total}</span>
                                    </div>
                                `:""}
                            </div>
                            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px;">
                                ${U.map(C=>m`
                                    <div style="background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.05); font-size:0.85rem; color:#e2e8f0; display:flex; align-items:center; gap:8px;">
                                        <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent); font-size:0.7rem;"></i> ${C}
                                    </div>
                                `)}
                            </div>
                        </div>
                    `})}
            </div>
        `;return m`
        <div ref=${l} class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px);">
            <div class="card glass-accent animate-scaleIn" style="max-width:800px; width:100%; padding:0; border:2px solid var(--accent); max-height:90vh; overflow:hidden; background:rgba(15,12,16,0.95); position:relative; display:flex; flex-direction:column;">
                
                <!-- Header -->
                <div style="padding:25px; border-bottom:1px solid rgba(197,160,89,0.3); background:linear-gradient(to bottom, rgba(197,160,89,0.1), transparent); display:flex; align-items:center; gap:20px;">
                    <button class="btn btn-ghost" onClick=${s} style="position:absolute; top:20px; right:20px; border-radius:50%; width:36px; height:36px; padding:0;">
                        <i class="fa-solid fa-times"></i>
                    </button>
                    
                    <div style="width:70px; height:70px; border-radius:50%; border:2px solid var(--accent); background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-family:'Cinzel'; color:var(--accent); overflow:hidden;">
                        ${o.img?m`<img src="${o.img}" style="width:100%; height:100%; object-fit:cover;" />`:o.name.substring(0,1)}
                    </div>
                    
                    <div style="flex:1;">
                        <h2 style="margin:0; font-family:'Cinzel'; color:var(--accent); font-size:1.8rem; text-shadow:0 0 10px rgba(197,160,89,0.5);">${o.name}</h2>
                        <div style="font-size:0.9rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">
                            ${o.race} ${o.class} • Nível ${o.level||1}
                        </div>
                    </div>
                    
                    <div style="text-align:right; padding-right:40px;">
                        <div style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">Pontos de Vida</div>
                        <div style="font-size:1.5rem; font-weight:bold; font-family:'Cinzel'; color:${g.current>0?"#10b981":"#ef4444"};">
                            ${g.current} <span style="font-size:1rem; color:var(--text-dim);">/ ${g.max}</span>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <div style="display:flex; border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.4);">
                    <button class="btn ${u==="inventory"?"btn-primary":"btn-ghost"}" style="flex:1; border-radius:0; padding:15px; font-weight:bold;" onClick=${()=>y("inventory")}>
                        <i class="fa-solid fa-backpack" style="margin-right:8px;"></i> Equipamento
                    </button>
                    <button class="btn ${u==="spells"?"btn-primary":"btn-ghost"}" style="flex:1; border-radius:0; padding:15px; font-weight:bold;" onClick=${()=>y("spells")}>
                        <i class="fa-solid fa-book-journal-whills" style="margin-right:8px;"></i> Grimório / Magias
                    </button>
                </div>

                <!-- Content -->
                <div style="padding:25px; flex:1; overflow-y:auto;">
                    ${u==="inventory"?_():x()}
                </div>
            </div>
        </div>
    `}function ye({unmount:p}){const s=[{name:"Combate & Ação",sounds:[{id:"sword_clash",name:"Golpe de Espada",url:"https://freesound.org/data/previews/415/415209_5121236-lq.mp3",color:"#ef4444"},{id:"bow_shoot",name:"Flecha",url:"https://freesound.org/data/previews/344/344276_5121236-lq.mp3",color:"#f59e0b"},{id:"fireball",name:"Bola de Fogo",url:"https://freesound.org/data/previews/442/442953_4523992-lq.mp3",color:"#f97316"},{id:"magic_blast",name:"Explosão Arcana",url:"https://freesound.org/data/previews/404/404764_118613-lq.mp3",color:"#8b5cf6"},{id:"shield_block",name:"Defesa de Escudo",url:"https://freesound.org/data/previews/399/399303_7614679-lq.mp3",color:"#3b82f6"}]},{name:"Ambiente & Tensão",sounds:[{id:"thunder",name:"Trovão",url:"https://freesound.org/data/previews/102/102723_1739504-lq.mp3",color:"#64748b"},{id:"wolf_howl",name:"Uivo Distante",url:"https://freesound.org/data/previews/148/148705_1385413-lq.mp3",color:"#a3e635"},{id:"door_creak",name:"Porta Rangendo",url:"https://freesound.org/data/previews/119/119864_1896899-lq.mp3",color:"#84cc16"},{id:"heartbeat",name:"Batimentos",url:"https://freesound.org/data/previews/332/332056_5316315-lq.mp3",color:"#dc2626"}]}],b=l=>{z.audio&&(z.audio.playSFX(l),z.socket&&z.socket.emit("fx_animation",{event:"SOUNDBOARD",details:{url:l}}))},u=l=>{z.audio&&z.audio.setMasterVolume(parseFloat(l))};return e("div",{class:"fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center animate-fadeIn",children:e("div",{class:"bg-gradient-to-br from-bgbase to-black border border-accent/40 rounded-xl w-[90%] max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden transform transition-all animate-slideUp",children:[e("div",{class:"px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/40",children:[e("h2",{class:"font-cinzel text-accent text-xl font-bold m-0 flex items-center gap-3",children:[e("i",{class:"fa-solid fa-music"})," SOUNDBOARD TÁTICO"]}),e("button",{class:"btn btn-ghost text-gray-400 p-2",onClick:()=>{p&&p()},children:e("i",{class:"fa-solid fa-times"})})]}),e("div",{class:"p-6 max-h-[70vh] overflow-y-auto",children:s.map(l=>e("div",{class:"mb-8 last:mb-0",children:[e("h3",{class:"text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2",children:l.name}),e("div",{class:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3",children:l.sounds.map(o=>e("button",{class:"btn flex flex-col items-center gap-2 p-3 rounded-lg border border-white/10 bg-white/5 transition-all cursor-pointer hover:scale-105",style:`border-color: ${o.color}40;`,onMouseOver:g=>{g.currentTarget.style.background=o.color+"20",g.currentTarget.style.borderColor=o.color},onMouseOut:g=>{g.currentTarget.style.background="rgba(255,255,255,0.05)",g.currentTarget.style.borderColor=o.color+"40"},onClick:()=>b(o.url),children:[e("i",{class:"fa-solid fa-volume-high text-xl",style:`color: ${o.color};`}),e("span",{class:"text-xs font-bold text-white text-center",children:o.name})]},o.id))})]},l.name))}),e("div",{class:"px-6 py-4 bg-black/60 border-t border-white/5 flex items-center justify-between",children:[e("span",{class:"text-xs font-bold text-gray-400 uppercase tracking-wider",children:[e("i",{class:"fa-solid fa-sliders"})," Volume Master"]}),e("input",{type:"range",min:"0",max:"1",step:"0.05",defaultValue:"1",onInput:l=>u(l.target.value),class:"w-40 accent-accent cursor-pointer"})]})]})})}function ke(p){if(!p||!p.state){alert("Erro: Nenhuma campanha ativa carregada para backup.");return}try{const s=p.state,b={tomeVersion:"3.0.0",exportTimestamp:Date.now(),exportDateFormatted:new Date().toLocaleString("pt-BR"),campaignTitle:s.title||s.nome||"Campanha_Elo_Arcano",state:s},u=JSON.stringify(b,null,2),y=new Blob([u],{type:"application/json;charset=utf-8"}),l=URL.createObjectURL(y),o=document.createElement("a"),g=String(b.campaignTitle).replace(/[^a-zA-Z0-9_-]/g,"_");o.href=l,o.download=`${g}_backup_${new Date().toISOString().slice(0,10)}.tome`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(l),console.log(`[TomeBackup] Arquivo .tome gerado com sucesso (${(u.length/1024).toFixed(2)} KB).`)}catch(s){console.error("Falha na exportação da campanha:",s),alert("Erro ao gerar arquivo de backup: "+s.message)}}function Ee(p,s){if(!p){alert("Store não inicializada.");return}const b=document.createElement("input");b.type="file",b.accept=".tome,.json",b.onchange=u=>{var o;const y=(o=u.target.files)==null?void 0:o[0];if(!y)return;const l=new FileReader;l.onload=g=>{try{const _=JSON.parse(g.target.result),x=_.state||_;confirm(`📦 Deseja restaurar a campanha "${_.campaignTitle||y.name}"? Todos os dados atuais não salvos serão substituídos pelo backup de ${_.exportDateFormatted||"data desconhecida"}.`)&&(typeof p.replaceState=="function"?p.replaceState(x):(p.state=x,typeof p.notify=="function"&&p.notify()),fetch("/api/sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({state:x})}).catch(()=>{}),alert("✨ Campanha restaurada com sucesso! O Grimório, Diários, NPCs e Mapas foram atualizados."),typeof s=="function"&&s(x))}catch(_){console.error("Arquivo corrompido ou inválido:",_),alert("O arquivo selecionado não é um backup .tome válido.")}},l.readAsText(y)},b.click()}function Re(){const p=K("players")||[],[s,b]=M(!1),[u,y]=M(!1),[l,o]=M(null),[g,_]=M(null);Q(()=>{const i=G=>{var a;return b(((a=G.detail)==null?void 0:a.active)||!1)};return window.addEventListener("tome:ai_processing",i),()=>{window.removeEventListener("tome:ai_processing",i)}},[]);const x=(i,G={})=>{const a=document.createElement("div");document.body.appendChild(a);try{fe(m`<${i} store=${z.store} ...${G} unmount=${()=>a.remove()} />`,a)}catch{const L=new i({store:z.store,element:a,...G});typeof L.mount=="function"&&L.mount(a)}},D=()=>x(ve),h=()=>q(()=>import("./EncounterGenerator-BTnAZ4Uc.js"),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9])).then(i=>x(i.EncounterGenerator)),R=()=>x(ye),U=()=>{q(()=>import("./LootGenerator-C2EIP8PX.js"),__vite__mapDeps([10,1,2,3,4,5,6,8])).then(i=>x(i.LootGenerator))},S=()=>{q(()=>import("./SpellBook-B_RY-xwG.js"),__vite__mapDeps([11,1,2,3,4,5,6,12])).then(i=>x(i.SpellBook))},j=()=>{q(()=>import("./OracleModal-BDsnnTip.js"),__vite__mapDeps([13,1,2,3,4,5,6])).then(i=>{i.OracleModal&&x(i.OracleModal)}).catch(i=>console.warn("OracleModal module missing",i))},N=i=>o(i),C=i=>{window.TOME&&window.TOME.events&&window.TOME.events.emit("DICE_ROLL_REQUESTED",i)};return m`
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
                    <button class="btn btn-primary bg-emerald-600 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] px-3.5" onClick=${D}>
                        <i class="fa-solid fa-map-location-dot"></i> Olho do Mestre
                    </button>
                    <button class="btn btn-ghost border-cyan-400 text-cyan-300 bg-cyan-900/10 px-3.5" onClick=${R}>
                        <i class="fa-solid fa-headphones-simple"></i> Som & SFX
                    </button>
                    <button class="btn btn-ghost border-purple-500 text-purple-300 bg-purple-900/20 shadow-[0_0_12px_rgba(168,85,247,0.3)] px-3.5" onClick=${j}>
                        <i class="fa-solid fa-crystal-ball"></i> Oráculo IA
                    </button>
                    <button class="btn btn-ghost border-accent text-accent px-3.5" onClick=${S}>
                        <i class="fa-solid fa-scroll"></i> Grimório
                    </button>
                    <button class="btn btn-ghost border-accent text-accent px-3.5" onClick=${U}>
                        <i class="fa-solid fa-coins"></i> Gerar Tesouro
                    </button>
                    <button class="btn btn-magic px-3.5" onClick=${h}>
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Encontro
                    </button>
                    <button class="btn btn-ghost border-blue-500 text-blue-400 bg-blue-900/20 px-3" onClick=${()=>ke(z.store)} title="Exportar backup completo (.tome)">
                        <i class="fa-solid fa-file-export"></i> Backup
                    </button>
                    <button class="btn btn-ghost border-emerald-500 text-emerald-400 bg-emerald-900/20 px-3" onClick=${()=>Ee(z.store,()=>window.location.reload())} title="Restaurar campanha (.tome / .json)">
                        <i class="fa-solid fa-file-import"></i> Restaurar
                    </button>
                    <button class="btn btn-primary px-3.5" onClick=${()=>y(!u)}>
                        <i class="fa-solid fa-dice-d20"></i> Rolar Dados
                    </button>
                </div>
            </header>

            <!-- COLUNA ESQUERDA (Tracker e Notas) -->
            <div class="flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar min-w-0">
                <div class="card glass-accent min-h-[50vh] relative p-0 overflow-hidden shadow-md">
                    <${ue} />
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
                        ${p.length===0?m`<div class="text-center p-3 text-slate-500 text-[0.8rem]">Nenhum herói ativo.</div>`:m`
                                <div class="flex flex-wrap gap-2 justify-center">
                                    ${p.map(i=>m`
                                        <div class="cursor-pointer flex items-center gap-2.5 bg-black/40 border border-white/5 hover:border-accent/50 rounded-full px-2.5 py-1.5 transition-all hover:bg-white/5 shadow-sm" 
                                             onClick=${()=>N(i.id)} title="Inspecionar ${i.name}">
                                            <div class="w-8 h-8 rounded-full bg-black flex items-center justify-center font-cinzel text-accent text-sm border border-accent overflow-hidden shrink-0">
                                                ${i.img?m`<img src="${i.img}" class="w-full h-full object-cover" />`:i.name.substring(0,1)}
                                            </div>
                                            <div class="pr-2 min-w-0">
                                                <div class="text-xs font-bold text-white leading-tight truncate max-w-[100px]">${i.name}</div>
                                                <div class="text-[0.55rem] text-accent uppercase font-cinzel tracking-wider mt-0.5">Nv. ${i.level||1}</div>
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
            ${l&&m`
                <div class="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div class="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-obsidian-900 border border-accent/40 rounded-2xl p-6 shadow-2xl">
                        <button class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl" onClick=${()=>o(null)}>
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <${we} playerId=${l} onClose=${()=>o(null)} />
                    </div>
                </div>
            `}

            <!-- BANDEJA DE DADOS -->
            ${u&&m`
                <div class="fixed bottom-[30px] left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-accent/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-[2000] animate-slideUp">
                    <button class="btn btn-ghost" onClick=${()=>C(4)}><i class="fa-solid fa-dice-d4"></i> d4</button>
                    <button class="btn btn-ghost" onClick=${()=>C(6)}><i class="fa-solid fa-dice-d6"></i> d6</button>
                    <button class="btn btn-ghost" onClick=${()=>C(8)}><i class="fa-solid fa-dice-d8"></i> d8</button>
                    <button class="btn btn-ghost" onClick=${()=>C(10)}><i class="fa-solid fa-dice-d10"></i> d10</button>
                    <button class="btn btn-ghost" onClick=${()=>C(12)}><i class="fa-solid fa-dice-d12"></i> d12</button>
                    <button class="btn btn-primary px-6 py-2.5 text-lg font-bold" onClick=${()=>C(20)}><i class="fa-solid fa-dice-d20"></i> d20</button>
                    <button class="btn btn-ghost text-red-500 border-red-500/30 hover:bg-red-500/20 ml-2" onClick=${()=>y(!1)}><i class="fa-solid fa-times"></i></button>
                </div>
            `}
        </div>
    `}export{Re as DMTable};
