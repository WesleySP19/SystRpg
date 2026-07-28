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
            <div class="hud-item hover-scale" style="display:flex; flex-direction:column; gap:6px; padding:10px; border-radius:10px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.03); transition:all 0.2s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                    <span style="font-size:0.75rem; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:115px; cursor:pointer; transition:color 0.2s;" 
                          title="Clique para ver ficha de ${p.name}" 
                          onmouseover="this.style.color='var(--accent)'" 
                          onmouseout="this.style.color='#fff'"
                          data-action="viewSheet" 
                          data-id="${p.id}">${p.name}</span>
                    <span style="font-size:0.6rem; color:var(--accent,#d4af37); font-weight:800; background:rgba(197, 160, 89, 0.1); border:1px solid rgba(197, 160, 89, 0.25); border-radius:4px; padding:2px 5px;">CA ${p.ac}</span>
                </div>
                
                <!-- HP PROGRESS BAR -->
                <div class="hp-bar" style="height:6px; background:rgba(0,0,0,0.4); border-radius:3px; overflow:hidden; border:1px solid rgba(255,255,255,0.03);">
                    <div class="hp-bar-fill" style="width:${hpPct}%; height:100%; background:${hpColor}; box-shadow:0 0 8px ${hpColor}; transition:width 0.3s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                    <span style="font-size:0.6rem; color:var(--text-dim,#94a3b8); font-weight:600; display:flex; align-items:center; gap:4px;">
                        <i class="fa-solid fa-heart" style="color:${hpColor}; font-size:0.55rem;"></i> ${current}/${max}
                    </span>
                    <span style="font-size:0.6rem; color:var(--info,#60a5fa); font-weight:800; background:rgba(96,165,250,0.1); border:1px solid rgba(96,165,250,0.25); border-radius:4px; padding:2px 5px; display:flex; align-items:center; gap:4px;">
                        <i class="fa-solid fa-eye" style="font-size:0.55rem;"></i> ${this._getPassivePerception(p)}
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
