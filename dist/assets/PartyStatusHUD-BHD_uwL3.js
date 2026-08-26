import{C as u}from"./Boot-CGoZOUiq.js";import{T as f}from"./BattleManager-CjydHzBy.js";import"./main-Bk3T2ZrR.js";import"./jsxRuntime.module-B_1yG4TV.js";import"./FXEngine-CD41bvJc.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";class w extends u{template(){const{players:e}=this.store.state;return!e||e.length===0?"":`
            <div class="party-hud fixed top-[90px] right-[20px] z-[1000] p-[15px] flex flex-col gap-3.5 rounded-[14px] border-[1.5px] border-accent/25 shadow-[0_15px_40px_rgba(0,0,0,0.7),inset_0_0_15px_rgba(197,160,89,0.05)] animate-fadeIn min-w-[190px] max-h-[calc(100vh-140px)] bg-black/80 backdrop-blur-md transition-all duration-300 select-none">
                
                <!-- HEADER (DRAG HANDLE & MINIMIZE CONTROL) -->
                <div class="hud-header font-cinzel text-xs font-extrabold text-accent uppercase tracking-widest border-b-2 border-accent/30 pb-1.5 mb-1 flex items-center justify-between cursor-move drop-shadow-[0_0_5px_rgba(197,160,89,0.25)]">
                    <div class="hud-title-text flex items-center gap-2">
                        <i class="fa-solid fa-shield-heart text-accent"></i> VITAIS DO GRUPO
                    </div>
                    <div class="hud-mini-badges hidden items-center justify-center w-full h-full">
                        <i class="fa-solid fa-shield-heart text-accent text-xl drop-shadow-[0_0_5px_rgba(197,160,89,1)]"></i>
                    </div>
                    <button class="btn-minimize bg-transparent border-none text-accent cursor-pointer px-1.5 py-0.5 text-xs flex items-center justify-center hover:scale-125 transition-transform duration-200">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                </div>

                <!-- MAIN SCROLLABLE CONTENT -->
                <div class="hud-content flex flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto">
                    ${e.map(t=>this._renderPlayerMini(t)).join("")}
                </div>
            </div>
        `}_renderPlayerMini(e){var a,r;const t=((a=e.hp)==null?void 0:a.current)!==void 0?e.hp.current:e.hp_current||0,i=((r=e.hp)==null?void 0:r.max)!==void 0?e.hp.max:e.hp_max||10,n=t/i*100,o=n<30?"#ef4444":n<60?"#f59e0b":"#10b981";return`
            <div class="hud-item hover-scale flex flex-col gap-1.5 p-2.5 rounded-[10px] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors duration-200">
                <div class="flex justify-between items-center gap-2.5">
                    <span class="text-xs font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[115px] cursor-pointer hover:text-accent transition-colors duration-200" 
                          title="Clique para ver ficha de ${e.name}" 
                          data-action="viewSheet" 
                          data-id="${e.id}">${e.name}</span>
                    <span class="text-[0.6rem] text-accent font-bold bg-accent/10 border border-accent/25 rounded px-1.5 py-0.5">CA ${e.ac}</span>
                </div>
                
                <!-- HP PROGRESS BAR -->
                <div class="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div class="h-full transition-all duration-300" style="width:${n}%; background:${o}; box-shadow:0 0 8px ${o};"></div>
                </div>
                
                <div class="flex justify-between items-center flex-wrap gap-1 mt-0.5">
                    <span class="text-[0.6rem] text-slate-400 font-bold flex items-center gap-1">
                        <i class="fa-solid fa-heart" style="color:${o}; font-size:0.55rem;"></i> ${t}/${i}
                    </span>
                    <span class="text-[0.6rem] text-blue-400 font-bold bg-blue-400/10 border border-blue-400/25 rounded px-1.5 py-0.5 flex items-center gap-1">
                        <i class="fa-solid fa-eye text-[0.55rem]"></i> ${this._getPassivePerception(e)}
                    </span>
                </div>
            </div>
        `}viewSheet(e,t){e&&e.preventDefault(),f.store.update(i=>{i.viewingHeroId=t.dataset.id,i.activeTab="herosheet"})}_getPassivePerception(e){var a,r;const t=((a=e.stats)==null?void 0:a.wis)||10,i=Math.floor((t-10)/2),n=(r=e.skills)==null?void 0:r.includes("perception"),o=e.proficiencyBonus||2;return 10+i+(n?o:0)}onMount(){const e=this.$(".party-hud");if(e){this._makeDraggable(e);const t=e.querySelector(".btn-minimize"),i=e.querySelector(".hud-content"),n=e.querySelector(".hud-title-text"),o=e.querySelector(".hud-mini-badges");t&&i&&t.addEventListener("click",a=>{a.stopPropagation();const r=e.classList.toggle("minimized"),l=t.querySelector("i");r?(e.style.minWidth="50px",e.style.width="50px",e.style.height="50px",e.style.borderRadius="50%",e.style.padding="0",e.style.justifyContent="center",e.style.alignItems="center",i.style.display="none",n&&(n.style.display="none"),o&&(o.style.display="flex"),l&&(l.className="fa-solid fa-plus"),e.setAttribute("title","Vitais do Grupo (Clique para Expandir)")):(e.style.minWidth="190px",e.style.width="auto",e.style.height="auto",e.style.borderRadius="14px",e.style.padding="15px",e.style.justifyContent="flex-start",e.style.alignItems="stretch",i.style.display="flex",n&&(n.style.display="flex"),o&&(o.style.display="none"),l&&(l.className="fa-solid fa-minus"),e.removeAttribute("title"))})}}_makeDraggable(e){let t=0,i=0,n=0,o=0;const a=e.querySelector(".hud-header");a?a.onmousedown=r:e.onmousedown=r;function r(s){s=s||window.event,!(s.target.closest("button")||s.target.closest("input"))&&(s.preventDefault(),n=s.clientX,o=s.clientY,document.onmouseup=d,document.onmousemove=l)}function l(s){s=s||window.event,s.preventDefault(),t=n-s.clientX,i=o-s.clientY,n=s.clientX,o=s.clientY;const c=e.offsetTop-i,p=e.offsetLeft-t;e.style.top=Math.max(10,Math.min(window.innerHeight-e.offsetHeight-10,c))+"px",e.style.left=Math.max(10,Math.min(window.innerWidth-e.offsetWidth-10,p))+"px",e.style.right="auto",e.style.bottom="auto"}function d(){document.onmouseup=null,document.onmousemove=null}}}export{w as PartyStatusHUD};
