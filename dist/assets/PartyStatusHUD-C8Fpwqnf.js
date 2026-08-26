import{C as f}from"./Boot-H8Erwwti.js";import{T as u}from"./BattleManager-Q-hDRRLg.js";import"./main-BTQ5YZrv.js";import"./jsxRuntime.module-C8ftNBXQ.js";import"./FXEngine-CQjS4-0J.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";class w extends f{template(){const{players:e}=this.store.state;return!e||e.length===0?"":`
            <div class="party-hud glass" style="position:fixed; top:90px; right:20px; z-index:1000; padding:15px; display:flex; flex-direction:column; gap:14px; border-radius:14px; border:1.5px solid rgba(197, 160, 89, 0.25); box-shadow: 0 15px 40px rgba(0,0,0,0.7), inset 0 0 15px rgba(197,160,89,0.05); animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); min-width:190px; max-height:calc(100vh - 140px); background:rgba(10,12,16,0.85); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); user-select:none;">
                
                <!-- HEADER (DRAG HANDLE & MINIMIZE CONTROL) -->
                <div class="hud-header" style="font-family:'Cinzel', serif; font-size:0.75rem; font-weight:800; color:var(--accent,#d4af37); text-transform:uppercase; letter-spacing:1.5px; border-bottom:2px solid rgba(197,160,89,0.3); padding-bottom:6px; margin-bottom:5px; display:flex; align-items:center; justify-content:space-between; cursor:move; text-shadow:0 0 5px rgba(197,160,89,0.25);">
                    <div class="hud-title-text" style="display:flex; align-items:center; gap:8px;">
                        <i class="fa-solid fa-shield-heart" style="color:var(--accent);"></i> VITAIS DO GRUPO
                    </div>
                    <div class="hud-mini-badges" style="display:none; align-items:center; justify-content:center; width:100%; height:100%;">
                        <i class="fa-solid fa-shield-heart" style="color:var(--accent); font-size:1.2rem; filter: drop-shadow(0 0 5px var(--accent));"></i>
                    </div>
                    <button class="btn-minimize" style="background:none; border:none; color:var(--accent); cursor:pointer; padding:2px 6px; font-size:0.75rem; display:flex; align-items:center; justify-content:center; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                </div>

                <!-- MAIN SCROLLABLE CONTENT -->
                <div class="hud-content" style="display:flex; flex-direction:column; gap:12px; max-height:calc(100vh - 220px); overflow-y:auto; scrollbar-width:thin;">
                    ${e.map(t=>this._renderPlayerMini(t)).join("")}
                </div>
            </div>
        `}_renderPlayerMini(e){var a,r;const t=((a=e.hp)==null?void 0:a.current)!==void 0?e.hp.current:e.hp_current||0,s=((r=e.hp)==null?void 0:r.max)!==void 0?e.hp.max:e.hp_max||10,o=t/s*100,n=o<30?"#ef4444":o<60?"#f59e0b":"#10b981";return`
            <div class="hud-item hover-scale" style="display:flex; flex-direction:column; gap:6px; padding:10px; border-radius:10px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.03); transition:all 0.2s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                    <span style="font-size:0.75rem; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:115px; cursor:pointer; transition:color 0.2s;" 
                          title="Clique para ver ficha de ${e.name}" 
                          onmouseover="this.style.color='var(--accent)'" 
                          onmouseout="this.style.color='#fff'"
                          data-action="viewSheet" 
                          data-id="${e.id}">${e.name}</span>
                    <span style="font-size:0.6rem; color:var(--accent,#d4af37); font-weight:800; background:rgba(197, 160, 89, 0.1); border:1px solid rgba(197, 160, 89, 0.25); border-radius:4px; padding:2px 5px;">CA ${e.ac}</span>
                </div>
                
                <!-- HP PROGRESS BAR -->
                <div class="hp-bar" style="height:6px; background:rgba(0,0,0,0.4); border-radius:3px; overflow:hidden; border:1px solid rgba(255,255,255,0.03);">
                    <div class="hp-bar-fill" style="width:${o}%; height:100%; background:${n}; box-shadow:0 0 8px ${n}; transition:width 0.3s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                    <span style="font-size:0.6rem; color:var(--text-dim,#94a3b8); font-weight:600; display:flex; align-items:center; gap:4px;">
                        <i class="fa-solid fa-heart" style="color:${n}; font-size:0.55rem;"></i> ${t}/${s}
                    </span>
                    <span style="font-size:0.6rem; color:var(--info,#60a5fa); font-weight:800; background:rgba(96,165,250,0.1); border:1px solid rgba(96,165,250,0.25); border-radius:4px; padding:2px 5px; display:flex; align-items:center; gap:4px;">
                        <i class="fa-solid fa-eye" style="font-size:0.55rem;"></i> ${this._getPassivePerception(e)}
                    </span>
                </div>
            </div>
        `}viewSheet(e,t){e&&e.preventDefault(),u.store.update(s=>{s.viewingHeroId=t.dataset.id,s.activeTab="herosheet"})}_getPassivePerception(e){var a,r;const t=((a=e.stats)==null?void 0:a.wis)||10,s=Math.floor((t-10)/2),o=(r=e.skills)==null?void 0:r.includes("perception"),n=e.proficiencyBonus||2;return 10+s+(o?n:0)}onMount(){const e=this.$(".party-hud");if(e){this._makeDraggable(e);const t=e.querySelector(".btn-minimize"),s=e.querySelector(".hud-content"),o=e.querySelector(".hud-title-text"),n=e.querySelector(".hud-mini-badges");t&&s&&t.addEventListener("click",a=>{a.stopPropagation();const r=e.classList.toggle("minimized"),l=t.querySelector("i");r?(e.style.minWidth="50px",e.style.width="50px",e.style.height="50px",e.style.borderRadius="50%",e.style.padding="0",e.style.justifyContent="center",e.style.alignItems="center",s.style.display="none",o&&(o.style.display="none"),n&&(n.style.display="flex"),l&&(l.className="fa-solid fa-plus"),e.setAttribute("title","Vitais do Grupo (Clique para Expandir)")):(e.style.minWidth="190px",e.style.width="auto",e.style.height="auto",e.style.borderRadius="14px",e.style.padding="15px",e.style.justifyContent="flex-start",e.style.alignItems="stretch",s.style.display="flex",o&&(o.style.display="flex"),n&&(n.style.display="none"),l&&(l.className="fa-solid fa-minus"),e.removeAttribute("title"))})}}_makeDraggable(e){let t=0,s=0,o=0,n=0;const a=e.querySelector(".hud-header");a?a.onmousedown=r:e.onmousedown=r;function r(i){i=i||window.event,!(i.target.closest("button")||i.target.closest("input"))&&(i.preventDefault(),o=i.clientX,n=i.clientY,document.onmouseup=d,document.onmousemove=l)}function l(i){i=i||window.event,i.preventDefault(),t=o-i.clientX,s=n-i.clientY,o=i.clientX,n=i.clientY;const c=e.offsetTop-s,p=e.offsetLeft-t;e.style.top=Math.max(10,Math.min(window.innerHeight-e.offsetHeight-10,c))+"px",e.style.left=Math.max(10,Math.min(window.innerWidth-e.offsetWidth-10,p))+"px",e.style.right="auto",e.style.bottom="auto"}function d(){document.onmouseup=null,document.onmousemove=null}}}export{w as PartyStatusHUD};
