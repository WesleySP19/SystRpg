import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';

/**
 * PARTY STATUS HUD v2.0
 * Fully draggable and collapsible party vitals monitor.
 */
export class PartyStatusHUD extends Component {
    template() {
        const { players } = this.store.state;
        if (!players || players.length === 0) return '';

        return `
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
                    ${players.map(p => this._renderPlayerMini(p)).join('')}
                </div>
            </div>
        `;
    }

    _renderPlayerMini(p) {
        const current = p.hp?.current !== undefined ? p.hp.current : (p.hp_current || 0);
        const max = p.hp?.max !== undefined ? p.hp.max : (p.hp_max || 10);
        const hpPct = (current / max) * 100;
        const hpColor = hpPct < 30 ? '#ef4444' : hpPct < 60 ? '#f59e0b' : '#10b981';

        return `
            <div class="hud-item hover-scale flex flex-col gap-1.5 p-2.5 rounded-[10px] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors duration-200">
                <div class="flex justify-between items-center gap-2.5">
                    <span class="text-xs font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[115px] cursor-pointer hover:text-accent transition-colors duration-200" 
                          title="Clique para ver ficha de ${p.name}" 
                          data-action="viewSheet" 
                          data-id="${p.id}">${p.name}</span>
                    <span class="text-[0.6rem] text-accent font-bold bg-accent/10 border border-accent/25 rounded px-1.5 py-0.5">CA ${p.ac}</span>
                </div>
                
                <!-- HP PROGRESS BAR -->
                <div class="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div class="h-full transition-all duration-300" style="width:${hpPct}%; background:${hpColor}; box-shadow:0 0 8px ${hpColor};"></div>
                </div>
                
                <div class="flex justify-between items-center flex-wrap gap-1 mt-0.5">
                    <span class="text-[0.6rem] text-slate-400 font-bold flex items-center gap-1">
                        <i class="fa-solid fa-heart" style="color:${hpColor}; font-size:0.55rem;"></i> ${current}/${max}
                    </span>
                    <span class="text-[0.6rem] text-blue-400 font-bold bg-blue-400/10 border border-blue-400/25 rounded px-1.5 py-0.5 flex items-center gap-1">
                        <i class="fa-solid fa-eye text-[0.55rem]"></i> ${this._getPassivePerception(p)}
                    </span>
                </div>
            </div>
        `;
    }

    viewSheet(e, el) {
        if (e) e.preventDefault();
        TOME.store.update(s => {
            s.viewingHeroId = el.dataset.id;
            s.activeTab = 'herosheet';
        });
    }

    _getPassivePerception(p) {
        const wis = p.stats?.wis || 10;
        const mod = Math.floor((wis - 10) / 2);
        const isProf = p.skills?.includes('perception');
        const prof = p.proficiencyBonus || 2;
        return 10 + mod + (isProf ? prof : 0);
    }

    onMount() {
        const hud = this.$('.party-hud');
        if (hud) {
            this._makeDraggable(hud);
            
            const btn = hud.querySelector('.btn-minimize');
            const content = hud.querySelector('.hud-content');
            const titleText = hud.querySelector('.hud-title-text');
            const miniBadges = hud.querySelector('.hud-mini-badges');
            
            if (btn && content) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isMin = hud.classList.toggle('minimized');
                    const icon = btn.querySelector('i');
                    
                    if (isMin) {
                        hud.style.minWidth = '50px';
                        hud.style.width = '50px';
                        hud.style.height = '50px';
                        hud.style.borderRadius = '50%';
                        hud.style.padding = '0';
                        hud.style.justifyContent = 'center';
                        hud.style.alignItems = 'center';
                        content.style.display = 'none';
                        if (titleText) titleText.style.display = 'none';
                        if (miniBadges) miniBadges.style.display = 'flex';
                        if (icon) icon.className = 'fa-solid fa-plus';
                        hud.setAttribute('title', 'Vitais do Grupo (Clique para Expandir)');
                    } else {
                        hud.style.minWidth = '190px';
                        hud.style.width = 'auto';
                        hud.style.height = 'auto';
                        hud.style.borderRadius = '14px';
                        hud.style.padding = '15px';
                        hud.style.justifyContent = 'flex-start';
                        hud.style.alignItems = 'stretch';
                        content.style.display = 'flex';
                        if (titleText) titleText.style.display = 'flex';
                        if (miniBadges) miniBadges.style.display = 'none';
                        if (icon) icon.className = 'fa-solid fa-minus';
                        hud.removeAttribute('title');
                    }
                });
            }
        }
    }

    _makeDraggable(el) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = el.querySelector('.hud-header');
        
        if (header) {
            header.onmousedown = dragMouseDown;
        } else {
            el.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            if (e.target.closest('button') || e.target.closest('input')) return;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            const newTop = el.offsetTop - pos2;
            const newLeft = el.offsetLeft - pos1;
            
            el.style.top = Math.max(10, Math.min(window.innerHeight - el.offsetHeight - 10, newTop)) + "px";
            el.style.left = Math.max(10, Math.min(window.innerWidth - el.offsetWidth - 10, newLeft)) + "px";
            el.style.right = 'auto';
            el.style.bottom = 'auto';
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}
