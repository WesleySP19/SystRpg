var z=Object.defineProperty;var T=(h,t,i)=>t in h?z(h,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):h[t]=i;var y=(h,t,i)=>T(h,typeof t!="symbol"?t+"":t,i);import{C as E}from"./Boot-CGoZOUiq.js";import{T as _,D as m,a as $}from"./BattleManager-CjydHzBy.js";import{Toast as c}from"./Toast-m0Ci56ke.js";import{M as w}from"./MonsterArt-3kughPIq.js";import{F as I}from"./FXEngine-CD41bvJc.js";import"./main-Bk3T2ZrR.js";import"./jsxRuntime.module-B_1yG4TV.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";const u=class u extends E{constructor(t){super(t),this._economy={action:!0,bonus:!0,reaction:!0,movement:30},this._quickAdd={name:"",init:"",hp:"",type:"Enemy"},this._selectedCond="envenenado",this._focusId=null,this._showTurnAnnounce=!1,this._announceText="",this._broadcast=null,this._dmgInput=""}onMount(){this._broadcast||(this._broadcast=new BroadcastChannel("tome_map")),this._handleSummon=this._handleSummon||this._onMonsterInvoked.bind(this),_.events.on("MONSTER_INVOKED",this._handleSummon);const t=this.$("#im-dmg-val");t&&this._dmgInput&&(t.value=this._dmgInput),this._scrollToActive(),this._showTurnAnnounce&&setTimeout(()=>{this._showTurnAnnounce=!1,this._announceText=""},2e3)}onUnmount(){this._broadcast&&(this._broadcast.close(),this._broadcast=null),this._handleSummon&&_.events.off("MONSTER_INVOKED",this._handleSummon)}_onMonsterInvoked(t){let i=m.roll(20).total;const e={id:t.id||"m-"+Date.now(),name:t.name,initiative:i,hp:{current:t.hp_max,max:t.hp_max},ac:t.ac||10,type:t.type||"Enemy",emoji:t.emoji||"👹",img:t.img||"",conditions:[]};this.store.update(a=>{a.initiativeOrder||(a.initiativeOrder=[]),a.initiativeOrder.push(e),a.combatActive&&a.initiativeOrder.sort((n,o)=>o.initiative-n.initiative)}),c.show(`🧙 Invocação: ${t.name} (Iniciativa: ${i})`,"success"),this.render()}_scrollToActive(){const t=this.$(".im-combatant.im-active");t&&t.scrollIntoView({behavior:"smooth",block:"center"})}_getOrder(){return(this.store.state.initiativeOrder||[]).map(t=>{const i=$.getHP(t);return{...t,_hpCurrent:i.current,_hpMax:i.max}})}_hpColor(t,i){if(i<=0)return"var(--text-dim)";const e=t/i;return e>.5?"var(--success)":e>.2?"#e5c17b":"var(--danger)"}_hpPct(t,i){return i<=0?0:Math.min(100,Math.max(0,Math.round(t/i*100)))}_broadcastState(){var t;try{const i=this.store.state,e=i.initiativeIndex||0,a=(i.initiativeOrder||[])[e];(t=this._broadcast)==null||t.postMessage({type:"COMBAT_UPDATE",state:{combatActive:i.combatActive,combatRound:i.combatRound,initiativeOrder:i.initiativeOrder,initiativeIndex:e}})}catch{}}template(){const{combatActive:t,combatRound:i}=this.store.state,e=this._getOrder(),a=this.store.state.initiativeIndex||0,n=e[a],o=this._focusId&&e.find(r=>r.id===this._focusId)||n,s=!t||e.length===0;return`


            <div class="im-root" style="height:100%; position:relative;">

                ${this._renderHeader(i,e.length)}

                ${s?this._renderEmpty():`
                        ${this._renderSpotlight(n,a)}
                        ${this._renderQueue(e,a)}
                        ${this._renderQuickActions(o)}
                        ${this._renderQuickAdd()}
                    `}

                ${this._showTurnAnnounce?this._renderTurnAnnounce():""}

            </div>
        `}_renderHeader(t,i){const{combatActive:e}=this.store.state;return`
            <div class="im-header">
                <div style="display:flex; align-items:center; gap:12px;">
                    <h2 class="im-title">
                        <i class="fa-solid fa-swords" style="color:var(--danger); font-size:0.9rem;"></i>
                        ORDEM DE BATALHA
                    </h2>
                    ${e?`<span class="im-round-badge">⚔️ RODADA ${t||1}</span>`:'<span class="im-round-badge" style="color:var(--text-dim); border-color:rgba(255,255,255,0.1);">COMBATE INATIVO</span>'}
                </div>

                <div class="im-header-controls">
                    ${e?`
                        <button class="btn btn-ghost" style="font-size:0.6rem; padding:5px 10px;" data-action="rollAllInitiative" title="Rerolar Iniciativa">
                            <i class="fa-solid fa-dice-d20"></i> Rolar Tudo
                        </button>
                        <button class="btn btn-primary" style="font-size:0.7rem; padding:6px 16px; font-family:'Cinzel';" data-action="nextTurn">
                            PRÓXIMO <i class="fa-solid fa-chevron-right"></i>
                        </button>
                        <button class="btn btn-ghost" style="font-size:0.6rem; padding:5px 8px; color:var(--danger); border-color:rgba(239,68,68,0.2);" data-action="endCombat" title="Encerrar Combate">
                            <i class="fa-solid fa-flag-checkered"></i>
                        </button>
                    `:`
                        <button class="btn btn-primary" style="font-size:0.75rem; padding:7px 18px; font-family:'Cinzel'; letter-spacing:1px;" data-action="startCombat">
                            <i class="fa-solid fa-dice-d20"></i> INICIAR COMBATE
                        </button>
                    `}
                </div>
            </div>
        `}_renderSpotlight(t,i){var d;if(!t)return`
            <div class="im-spotlight" style="padding:16px 28px;">
                <p style="color:var(--text-dim); font-size:0.8rem; opacity:0.5;">Nenhum combatente na fila.</p>
            </div>
        `;const e=this._hpPct(t._hpCurrent,t._hpMax),a=this._hpColor(t._hpCurrent,t._hpMax),n=t.type!=="Player",o=t.img||t.portraitData||(n?w.getImage(t):null),s=o&&!o.startsWith("db://")?o:null,r=s?`background-image:url('${s}');`:"";return`
            <div class="im-spotlight" style="background: linear-gradient(to right, rgba(14,16,22,0.7), rgba(8,10,15,0.85)); backdrop-filter: blur(12px); border: 1px solid rgba(197, 160, 89, 0.4); border-radius: 12px; margin-bottom: 24px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6); transition: all 0.3s ease;">
                <!-- Glowing accent strip -->
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: ${n?"var(--danger)":"var(--success)"}; box-shadow: 0 0 15px ${n?"var(--danger)":"var(--success)"};"></div>
                
                <div class="im-spotlight-inner" style="padding: 20px 24px; display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
                    <!-- Avatar -->
                    <div class="im-spotlight-avatar ${n?"enemy":""}" style="${r}; width: 85px; height: 85px; border-radius: 50%; box-shadow: 0 0 25px rgba(0,0,0,0.8); border: 2.5px solid ${n?"var(--danger)":"var(--success)"}; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; font-family: 'Cinzel'; font-weight: 900; color: #fff; background-size: cover; background-position: center; background-color: rgba(0,0,0,0.5);">
                        ${s?"":`<span>${t.name.substring(0,2).toUpperCase()}</span>`}
                    </div>

                    <!-- Info -->
                    <div class="im-spotlight-info" style="flex: 1; min-width: 250px;">
                        <div class="im-spotlight-label" style="font-size: 0.65rem; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
                            ${n?'<i class="fa-solid fa-skull" style="color:var(--danger);"></i> <span style="color:var(--danger);">INIMIGO</span>':'<i class="fa-solid fa-shield-halved" style="color:var(--success);"></i> <span style="color:var(--success);">HERÓI</span>'} 
                            <span style="color: rgba(255,255,255,0.2);">|</span> 
                            TURNO ${i+1}
                        </div>
                        <div class="im-spotlight-name" style="font-size: 1.8rem; font-family: 'Cinzel', serif; font-weight: 900; color: #fff; text-shadow: 0 2px 12px rgba(0,0,0,0.9); margin-bottom: 14px; line-height: 1.1;">
                            ${t.name}
                        </div>
                        
                        <div class="im-spotlight-meta" style="display: flex; gap: 30px; flex-wrap: wrap; align-items: center;">
                            <!-- HP Block -->
                            <div class="im-hp-block" style="min-width: 180px; flex-shrink: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px;">
                                    <div class="im-hp-label" style="font-size: 0.6rem; text-transform: uppercase; font-weight: 800; color: var(--text-dim); letter-spacing: 1px;">Pontos de Vida</div>
                                    <div class="im-hp-values" style="color: ${a}; font-weight: 900; font-size: 1.2rem; text-shadow: 0 0 12px ${a}; line-height: 1;">
                                        ${t._hpCurrent} <span style="opacity: 0.5; font-size: 0.8rem; font-weight: 700;">/ ${t._hpMax}</span>
                                    </div>
                                </div>
                                <div class="im-hp-bar-track" style="width: 100%; height: 8px; background: rgba(0,0,0,0.7); border-radius: 4px; overflow: hidden; box-shadow: inset 0 1px 4px rgba(0,0,0,0.9);">
                                    <div class="im-hp-bar-fill" style="width: ${e}%; height: 100%; background: ${a}; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px ${a};"></div>
                                </div>
                            </div>

                            <!-- Stats & Economy Block -->
                            <div style="display: flex; flex-direction: column; gap: 10px; flex: 1;">
                                <div style="display: flex; gap: 16px; font-size: 0.75rem; color: var(--text-dim); font-weight: 700; background: rgba(255,255,255,0.02); padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); width: fit-content;">
                                    <span style="display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-bolt" style="color: var(--accent);"></i> Inic: <strong style="color: #fff; font-size:0.85rem;">${t.init??0}</strong></span>
                                    <span style="display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-shield" style="color: #cbd5e1;"></i> CA: <strong style="color: #fff; font-size:0.85rem;">${t.ac??10}</strong></span>
                                    ${t.speed?`<span style="display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-shoe-prints" style="color: #60a5fa;"></i> Mov: <strong style="color: #fff; font-size:0.85rem;">${t.speed}ft</strong></span>`:""}
                                </div>

                                <!-- Economia de Ações -->
                                <div class="im-economy" style="display: flex; gap: 8px; flex-wrap: wrap;">
                                    <button class="im-econ-btn" style="background: ${this._economy.value.action?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.02)"}; color: ${this._economy.value.action?"#86efac":"var(--text-dim)"}; border: 1px solid ${this._economy.value.action?"rgba(34,197,94,0.4)":"rgba(255,255,255,0.05)"}; border-radius: 20px; padding: 6px 12px; font-size: 0.65rem; font-weight: 800; cursor: pointer; transition: all 0.2s;" data-action="toggleEconomy" data-type="action" title="Ação Principal (Clique para alternar)">
                                        <i class="fa-solid ${this._economy.value.action?"fa-play":"fa-check"}"></i> ${this._economy.value.action?"AÇÃO":"USADA"}
                                    </button>
                                    <button class="im-econ-btn" style="background: ${this._economy.value.bonus?"rgba(250,204,21,0.15)":"rgba(255,255,255,0.02)"}; color: ${this._economy.value.bonus?"#fde047":"var(--text-dim)"}; border: 1px solid ${this._economy.value.bonus?"rgba(250,204,21,0.4)":"rgba(255,255,255,0.05)"}; border-radius: 20px; padding: 6px 12px; font-size: 0.65rem; font-weight: 800; cursor: pointer; transition: all 0.2s;" data-action="toggleEconomy" data-type="bonus" title="Ação Bônus (Clique para alternar)">
                                        <i class="fa-solid ${this._economy.value.bonus?"fa-sparkles":"fa-check"}"></i> ${this._economy.value.bonus?"BÔNUS":"USADO"}
                                    </button>
                                    <button class="im-econ-btn" style="background: ${this._economy.value.reaction?"rgba(96,165,250,0.15)":"rgba(255,255,255,0.02)"}; color: ${this._economy.value.reaction?"#93c5fd":"var(--text-dim)"}; border: 1px solid ${this._economy.value.reaction?"rgba(96,165,250,0.4)":"rgba(255,255,255,0.05)"}; border-radius: 20px; padding: 6px 12px; font-size: 0.65rem; font-weight: 800; cursor: pointer; transition: all 0.2s;" data-action="toggleEconomy" data-type="reaction" title="Reação (Clique para alternar)">
                                        <i class="fa-solid ${this._economy.value.reaction?"fa-reply":"fa-check"}"></i> ${this._economy.value.reaction?"REAÇÃO":"USADA"}
                                    </button>
                                    <button class="im-econ-btn" style="background: rgba(168,85,247,0.15); color: #d8b4fe; border: 1px solid rgba(168,85,247,0.4); border-radius: 20px; padding: 6px 12px; font-size: 0.65rem; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 10px rgba(168,85,247,0.1);" data-action="toggleMovement" title="Movimento (Clique para subtrair 5ft)">
                                        <i class="fa-solid fa-person-running"></i> ${this._economy.value.movement}ft
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Condições ativas -->
                        ${(d=t.conditions)!=null&&d.length?`
                            <div class="im-cond-list" style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.05);">
                                ${t.conditions.map(l=>{const p=u.CONDITIONS[l]||{emoji:"⚠️",label:l};return`<button class="btn btn-ghost" style="padding: 4px 10px; font-size: 0.7rem; border-radius: 6px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; transition: all 0.2s;" data-action="removeConditionFromActive" data-cond="${l}" title="Clique para remover condição">${p.emoji} ${p.label} <i class="fa-solid fa-times" style="margin-left: 6px; opacity: 0.5; font-size: 0.6rem;"></i></button>`}).join("")}
                            </div>
                        `:""}
                    </div>
                </div>
            </div>
        `}_renderQueue(t,i){return`
            <div class="im-queue-section" style="margin-bottom: 24px;">
                <div class="im-queue-header" style="font-size: 0.65rem; font-weight: 900; letter-spacing: 2px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 12px; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                    <span><i class="fa-solid fa-list-ol" style="margin-right: 6px;"></i> FILA DE INICIATIVA</span>
                    <span style="color: var(--accent);">${t.length} COMBATENTES</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${t.map((e,a)=>this._renderCombatantCard(e,a,i)).join("")}
                </div>
            </div>
        `}_renderCombatantCard(t,i,e){var v;const a=i===e,n=this._focusId.value===t.id&&!a,o=t._hpCurrent<=0,s=t.type!=="Player",r=this._hpPct(t._hpCurrent,t._hpMax),d=this._hpColor(t._hpCurrent,t._hpMax),l=t.img||t.portraitData||(t.type!=="Player"?w.getImage(t):null),p=l&&!l.startsWith("db://")?l:null,g=p?`background-image:url('${p}');`:"",A=a?"linear-gradient(90deg, rgba(197, 160, 89, 0.1), rgba(14, 16, 22, 0.8))":n?"linear-gradient(90deg, rgba(255, 255, 255, 0.05), rgba(14, 16, 22, 0.6))":"rgba(14, 16, 22, 0.6)",b=a?"1px solid rgba(197, 160, 89, 0.6)":n?"1px solid rgba(255, 255, 255, 0.3)":"1px solid rgba(255, 255, 255, 0.03)",k=a?"box-shadow: 0 0 15px rgba(197, 160, 89, 0.2);":"",f=(t.conditions||[]).slice(0,4).map(x=>{const O=u.CONDITIONS[x]||{emoji:"⚠️"};return`<span style="font-size: 0.8rem;" title="${x}">${O.emoji}</span>`}).join("");return`
            <div class="im-combatant" style="background: ${A}; backdrop-filter: blur(8px); border: ${b}; ${k} border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; gap: 20px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); opacity: ${o?.5:1}; position: relative; overflow: hidden; min-height: 60px;"
                 onmouseover="this.style.transform='scale(1.02) translateX(4px)'; this.style.borderColor='rgba(197,160,89,0.8)';"
                 onmouseout="this.style.transform='none'; this.style.borderColor='${b.split("solid ")[1]}';"
                 data-action="selectFocus" data-id="${t.id}"
                 title="${a?"Turno Atual":"Clique para focar ações"}">
                 
                <!-- Indicator line -->
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: ${s?"var(--danger)":"var(--success)"}; opacity: ${a?1:.4};"></div>

                <!-- Posição na ordem -->
                <div style="font-family: 'Cinzel', serif; font-size: 1rem; font-weight: 900; color: ${a?"var(--accent)":"var(--text-dim)"}; width: 24px; text-align: center;">
                    ${i+1}
                </div>

                <!-- Avatar -->
                <div style="${g} width: 40px; height: 40px; border-radius: 50%; background-size: cover; background-position: center; background-color: rgba(0,0,0,0.5); border: 1.5px solid ${s?"rgba(239,68,68,0.5)":"rgba(34,197,94,0.5)"}; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 900; color: #fff; flex-shrink: 0;">
                    ${p?"":`<span>${t.name.substring(0,2).toUpperCase()}</span>`}
                </div>

                <!-- Info -->
                <div style="flex: 1; min-width: 0;">
                    <div style="font-family: 'Outfit'; font-weight: 800; font-size: 0.95rem; color: ${a?"#fff":s?"#fca5a5":"#e2e8f0"}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 8px;">
                        ${o?'<i class="fa-solid fa-skull"></i> ':""}${t.name}
                        ${a?'<span style="font-size: 0.5rem; background: var(--accent); color: #000; padding: 2px 6px; border-radius: 10px; font-weight: 900; letter-spacing: 1px;">VEZ</span>':""}
                    </div>
                    <div style="font-size: 0.65rem; color: var(--text-dim); display: flex; gap: 12px; margin-top: 4px; font-weight: 600;">
                        <span style="display: flex; align-items: center; gap: 4px;"><i class="fa-solid fa-heart" style="color: ${d};"></i> ${t._hpCurrent}/${t._hpMax}</span>
                        <span style="display: flex; align-items: center; gap: 4px;"><i class="fa-solid fa-shield-halved"></i> ${t.ac??10}</span>
                        ${(v=t.concentration)!=null&&v.length?'<span title="Concentração" style="color: #60a5fa;"><i class="fa-solid fa-brain"></i> Conc</span>':""}
                    </div>
                    <!-- HP Bar mini -->
                    <div style="width: 100%; max-width: 200px; height: 3px; background: rgba(0,0,0,0.5); border-radius: 2px; margin-top: 6px; overflow: hidden;">
                        <div style="width: ${r}%; height: 100%; background: ${d}; transition: width 0.3s ease;"></div>
                    </div>
                </div>

                <!-- Direita: Iniciativa + Condições + Controles -->
                <div style="display: flex; align-items: center; gap: 16px;">
                    ${f?`<div style="display: flex; gap: 4px;">${f}</div>`:""}
                    
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                        <div style="font-family: 'Cinzel', serif; font-size: 1.1rem; font-weight: 900; color: var(--accent); text-shadow: 0 0 8px rgba(197,160,89,0.3);">
                            ${t.init??0}
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 4px; opacity: ${a?1:.3}; transition: opacity 0.2s;" class="im-card-controls">
                        <button class="btn btn-ghost" style="padding: 6px; font-size: 0.65rem; border-radius: 6px; background: rgba(255,255,255,0.05);" data-action="moveUp" data-id="${t.id}" onclick="event.stopPropagation()" title="Subir Fila"><i class="fa-solid fa-chevron-up"></i></button>
                        <button class="btn btn-ghost" style="padding: 6px; font-size: 0.65rem; border-radius: 6px; background: rgba(255,255,255,0.05);" data-action="moveDown" data-id="${t.id}" onclick="event.stopPropagation()" title="Descer Fila"><i class="fa-solid fa-chevron-down"></i></button>
                        <button class="btn btn-ghost" style="padding: 6px; font-size: 0.65rem; border-radius: 6px; background: rgba(239,68,68,0.1); color: var(--danger);" data-action="removeCombatant" data-id="${t.id}" onclick="event.stopPropagation()" title="Remover"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </div>
            </div>
        `}_renderQuickActions(t){if(!t)return"";const i=!this._focusId||this._focusId.value===t.id;return`
            <div style="background: linear-gradient(to top, rgba(8,10,15,0.85), rgba(14,16,22,0.7)); backdrop-filter: blur(16px); border-top: 1px solid rgba(197, 160, 89, 0.4); padding: 16px 24px; flex-shrink: 0; box-shadow: 0 -10px 20px rgba(0,0,0,0.5); border-radius: 12px 12px 0 0; position: relative; z-index: 10;">
                
                <div style="font-size: 0.65rem; font-weight: 900; color: var(--accent); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-crosshairs"></i>
                        ${i?"AÇÕES DO COMBATENTE ATIVO":`FOCO MANUL: ${t.name}`}
                    </span>
                    ${i?"":'<button class="btn btn-ghost" style="font-size: 0.6rem; padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.2);" data-action="clearFocus">✕ Limpar foco</button>'}
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end; justify-content: flex-start; margin-bottom: 8px;">
                    <!-- Dano / Cura Group -->
                    <div style="display: flex; gap: 10px; align-items: center; background: rgba(0,0,0,0.5); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
                        <input type="number" id="im-dmg-val" class="form-input"
                               placeholder="Valor" min="0" style="width: 90px; font-size: 0.9rem; padding: 8px 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff;" data-action="dmgInputChange">
                        <button class="btn" style="background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); font-size: 0.75rem; padding: 6px 14px; border-radius: 6px; font-weight: 700; transition: all 0.2s;" data-action="applyDamage">
                            <i class="fa-solid fa-heart-crack" style="margin-right: 4px;"></i> Dano
                        </button>
                        <button class="btn" style="background: rgba(34,197,94,0.15); color: #86efac; border: 1px solid rgba(34,197,94,0.3); font-size: 0.75rem; padding: 6px 14px; border-radius: 6px; font-weight: 700; transition: all 0.2s;" data-action="applyHeal">
                            <i class="fa-solid fa-heart-pulse" style="margin-right: 4px;"></i> Cura
                        </button>
                        <button class="btn btn-ghost" style="font-size: 0.75rem; padding: 6px 10px; border-radius: 6px; background: rgba(255,255,255,0.05);" data-action="rollDice" title="Rolar 1d6">
                            <i class="fa-solid fa-dice"></i>
                        </button>
                    </div>

                    <!-- Condições Group -->
                    <div style="display: flex; gap: 10px; align-items: center; background: rgba(0,0,0,0.5); padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); flex: 1; min-width: 280px;">
                        <select class="form-select" id="im-cond-select" style="font-size: 0.85rem; padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; flex: 1;" data-action="condSelectChange">
                            ${Object.entries(u.CONDITIONS).map(([e,a])=>`<option value="${e}" ${this._selectedCond.value===e?"selected":""}>${a.emoji} ${a.label}</option>`).join("")}
                        </select>
                        <button class="btn" style="background: rgba(168,85,247,0.15); color: #d8b4fe; border: 1px solid rgba(168,85,247,0.3); font-size: 0.75rem; padding: 6px 14px; border-radius: 6px; font-weight: 700;" data-action="applyCondition">
                            <i class="fa-solid fa-plus" style="margin-right: 4px;"></i> Status
                        </button>
                        <button class="btn btn-ghost" style="font-size: 0.75rem; padding: 6px 12px; color: var(--danger); border-radius: 6px; background: rgba(239,68,68,0.05);" data-action="clearConditions" title="Limpar todos os status">
                            <i class="fa-solid fa-broom"></i>
                        </button>
                    </div>
                </div>
            </div>
        `}_renderQuickAdd(){return`
            <div class="im-quick-add">
                <div style="font-size:0.55rem; font-weight:800; color:var(--text-dim); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:6px;">
                    <i class="fa-solid fa-plus" style="margin-right:4px;"></i> ADICIONAR COMBATENTE
                </div>
                <div class="im-quick-add-row">
                    <input type="text"   id="qa-name" class="form-input" style="font-size:0.75rem; padding:6px 10px;" placeholder="Nome..." value="${this._quickAdd.value.name}">
                    <input type="number" id="qa-init" class="form-input" style="font-size:0.75rem; padding:6px 8px;" placeholder="Inic" min="-5" max="30" value="${this._quickAdd.value.init}">
                    <input type="number" id="qa-hp"   class="form-input" style="font-size:0.75rem; padding:6px 8px;" placeholder="HP" min="1" max="999" value="${this._quickAdd.value.hp}">
                    <div style="display:flex; gap:4px;">
                        <button class="btn btn-ghost btn-sm" style="font-size:0.6rem; padding:5px 8px; background:rgba(96,165,250,0.08); border-color:rgba(96,165,250,0.2); color:#93c5fd;" data-action="quickAddPlayer" title="Adicionar como Herói">
                            <i class="fa-solid fa-shield"></i>
                        </button>
                        <button class="btn btn-ghost btn-sm" style="font-size:0.6rem; padding:5px 8px; background:rgba(239,68,68,0.08); border-color:rgba(239,68,68,0.2); color:#fca5a5;" data-action="quickAddEnemy" title="Adicionar como Inimigo">
                            <i class="fa-solid fa-skull"></i>
                        </button>
                        <button class="btn btn-ghost btn-sm" style="font-size:0.6rem; padding:5px 8px;" data-action="quickAddRollInit" title="Rolar iniciativa automática">
                            <i class="fa-solid fa-dice-d20"></i>
                        </button>
                    </div>
                </div>
            </div>
        `}_renderEmpty(){const{players:t,monsters:i}=this.store.state,e=((t==null?void 0:t.length)||0)+((i==null?void 0:i.length)||0)>0;return`
            <div class="im-empty">
                <div class="im-empty-icon">⚔️</div>
                <div class="im-empty-title">Arena Silenciosa</div>
                <p class="im-empty-sub">
                    ${e?'Clique em "Iniciar Combate" para rolar iniciativa automática para toda a party e monstros ativos.':'Adicione heróis e monstros à campanha, depois clique em "Iniciar Combate" para gerar a ordem de iniciativa.'}
                </p>
                ${e?`
                    <button class="btn btn-primary" style="font-family:'Cinzel'; padding:12px 28px; letter-spacing:1px; font-size:0.85rem;" data-action="startCombat">
                        <i class="fa-solid fa-dice-d20"></i> INICIAR COMBATE
                    </button>
                `:`
                    <button class="btn btn-ghost" style="font-size:0.8rem;" data-action="navigateToCombat">
                        Ir para Campanha →
                    </button>
                `}
            </div>
        `}_renderTurnAnnounce(){return`
            <div class="im-turn-announce">
                <div class="im-turn-announce-inner">
                    <i class="fa-solid fa-swords" style="color:var(--accent);"></i>
                    ${this._announceText}
                </div>
            </div>
        `}nextTurn(){const t=this._getOrder();if(!t.length)return;const{combatRound:i}=this.store.state;let e=(this.store.state.initiativeIndex||0)+1,a=i||1,n=!1;e>=t.length&&(e=0,a++,n=!0),this._economy={action:!0,bonus:!0,reaction:!0,movement:30},this._focusId=null;const o=t[e];o&&(this._showTurnAnnounce=!0,this._announceText=n?`⚔️ RODADA ${a} — Vez de ${o.name}`:`Vez de ${o.name}`),this.store.update(s=>{s.initiativeIndex=e,n&&(s.combatRound=a),s.initiativeOrder&&(s.initiativeOrder=s.initiativeOrder.map((r,d)=>({...r,isCurrentTurn:d===e})))}),this._broadcastState(),c.show(`⚔️ Vez de ${o==null?void 0:o.name}${n?` · Rodada ${a}`:""}`,"info")}startCombat(){var n;const t=JSON.parse(JSON.stringify(this.store.state)),{players:i,monsters:e}=t,a=[...(i||[]).map(o=>{var s;return{...o,type:"Player",init:m.quick(20)+Math.floor(((((s=o.stats)==null?void 0:s.dex)||10)-10)/2),conditions:o.conditions||[],isCurrentTurn:!1}}),...(e||[]).map(o=>{var s;return{...o,type:"Monster",init:m.quick(20)+Math.floor(((((s=o.stats)==null?void 0:s.dex)||10)-10)/2),conditions:o.conditions||[],isCurrentTurn:!1}})];if(!a.length){c.show("Adicione heróis ou monstros antes de iniciar o combate.","warning");return}a.sort((o,s)=>(s.init??0)-(o.init??0)),a.length>0&&(a[0].isCurrentTurn=!0),this._economy={action:!0,bonus:!0,reaction:!0,movement:30},this._focusId=null,this._showTurnAnnounce=!0,this._announceText=`⚔️ RODADA 1 — Vez de ${(n=a[0])==null?void 0:n.name}`,this.store.update(o=>{o.initiativeOrder=a,o.initiativeIndex=0,o.combatRound=1,o.combatActive=!0}),this._broadcastState(),c.show("⚔️ Combate iniciado! Iniciativa rolada automaticamente.","success")}rollAllInitiative(){this.store.update(t=>{var i;(i=t.initiativeOrder)!=null&&i.length&&(t.initiativeOrder=t.initiativeOrder.map(e=>{var a;return{...e,init:m.quick(20)+Math.floor(((((a=e.stats)==null?void 0:a.dex)||10)-10)/2)}}).sort((e,a)=>(a.init??0)-(e.init??0)),t.initiativeIndex=0,t.combatRound=1)}),this._economy={action:!0,bonus:!0,reaction:!0,movement:30},c.show("🎲 Iniciativa rerolada!","info")}endCombat(){this.store.update(t=>{t.combatActive=!1,t.initiativeOrder=[],t.initiativeIndex=0,t.combatRound=0}),this._broadcastState(),c.show("🏁 Combate encerrado.","info")}selectFocus(t,i){const e=i.dataset.id;this._focusId=this._focusId.value===e?null:e,this.render()}clearFocus(){this._focusId=null,this.render()}toggleEconomy(t,i){const e=i.dataset.type;e in this._economy&&typeof this._economy[e]=="boolean"&&(this._economy[e]=!this._economy[e],this.render())}toggleMovement(){this._economy.value.movement=Math.max(0,this._economy.value.movement-5),this.render()}moveUp(t,i){const e=i.dataset.id;this.store.update(a=>{const n=a.initiativeOrder||[],o=n.findIndex(s=>s.id===e);o>0&&([n[o-1],n[o]]=[n[o],n[o-1]])})}moveDown(t,i){const e=i.dataset.id;this.store.update(a=>{const n=a.initiativeOrder||[],o=n.findIndex(s=>s.id===e);o<n.length-1&&([n[o],n[o+1]]=[n[o+1],n[o]])})}removeCombatant(t,i){const e=i.dataset.id;this.store.update(a=>{a.initiativeOrder=(a.initiativeOrder||[]).filter(n=>n.id!==e),a.initiativeIndex>=a.initiativeOrder.length&&(a.initiativeIndex=Math.max(0,a.initiativeOrder.length-1))}),this._focusId.value===e&&(this._focusId=null)}_getTarget(){const t=this._getOrder(),i=this.store.state.initiativeIndex||0;return this._focusId&&t.find(e=>e.id===this._focusId)||t[i]}applyDamage(){var n;const t=this._getTarget();if(!t)return;const i=parseInt(((n=this.$("#im-dmg-val"))==null?void 0:n.value)||"0",10);if(isNaN(i)||i<=0){c.show("Insira um valor de dano válido.","warning");return}let e=!1,a="Enemy";this.store.update(o=>{const s=(o.initiativeOrder||[]).find(d=>d.id===t.id);if(!s)return;a=s.type||"Enemy";const r=$.getHP(s).current;if("hp_current"in s)s.hp_current=Math.max(0,(s.hp_current??s.hp_max)-i),s.hp_current===0&&r>0&&(e=!0);else if(s._tempHP!==void 0){const d=Math.min(s._tempHP||0,i);s._tempHP=(s._tempHP||0)-d;const l=i-d;s.combat&&(s.combat.hp_current=Math.max(0,(s.combat.hp_current??0)-l),s.combat.hp_current===0&&r>0&&(e=!0))}else s.combat&&(s.combat.hp_current=Math.max(0,(s.combat.hp_current??s.combat.hp_max??10)-i),s.combat.hp_current===0&&r>0&&(e=!0))}),this._broadcastState(),c.show(`💥 ${i} de dano aplicado a ${t.name}`,"danger"),this.$("#im-dmg-val")&&(this.$("#im-dmg-val").value=""),e&&(a==="Player"||t.type==="Player"?I.trigger("HERO_FALLEN",t.name,t.id):I.trigger("ENTITY_SLAIN",t.name,t.id))}applyHeal(){var e;const t=this._getTarget();if(!t)return;const i=parseInt(((e=this.$("#im-dmg-val"))==null?void 0:e.value)||"0",10);if(isNaN(i)||i<=0){c.show("Insira um valor de cura válido.","warning");return}this.store.update(a=>{const n=(a.initiativeOrder||[]).find(o=>o.id===t.id);n&&("hp_current"in n?n.hp_current=Math.min(n.hp_max??999,(n.hp_current??0)+i):n.combat&&(n.combat.hp_current=Math.min(n.combat.hp_max??999,(n.combat.hp_current??0)+i)))}),this._broadcastState(),c.show(`💚 ${i} HP restaurados para ${t.name}`,"success"),this.$("#im-dmg-val")&&(this.$("#im-dmg-val").value="")}rollDice(){const t=m.roll(6),i=this.$("#im-dmg-val");i&&(i.value=t),c.show(`🎲 1d6 = ${t}`,"info")}dmgInputChange(t,i){this._dmgInput=i.value}condSelectChange(t,i){this._selectedCond=i.value}applyCondition(){var a;const t=this._getTarget();if(!t)return;const i=((a=this.$("#im-cond-select"))==null?void 0:a.value)||this._selectedCond;this.store.update(n=>{const o=(n.initiativeOrder||[]).find(s=>s.id===t.id);o&&(o.conditions||(o.conditions=[]),o.conditions.includes(i)||o.conditions.push(i))});const e=u.CONDITIONS[i]||{emoji:"⚠️",label:i};c.show(`${e.emoji} ${e.label} aplicado a ${t.name}`,"warning")}removeConditionFromActive(t,i){const e=i.dataset.cond,a=this._getOrder(),n=this.store.state.initiativeIndex||0,o=a[n];o&&this.store.update(s=>{const r=(s.initiativeOrder||[]).find(d=>d.id===o.id);r!=null&&r.conditions&&(r.conditions=r.conditions.filter(d=>d!==e))})}clearConditions(){const t=this._getTarget();t&&(this.store.update(i=>{const e=(i.initiativeOrder||[]).find(a=>a.id===t.id);e&&(e.conditions=[])}),c.show(`✅ Condições limpas de ${t.name}`,"success"))}quickAddPlayer(){this._quickAddCombatant("Player")}quickAddEnemy(){this._quickAddCombatant("Monster")}quickAddRollInit(){const t=m.quick(20),i=this.$("#qa-init");i&&(i.value=t),this._quickAdd.value.init=t,c.show(`🎲 Iniciativa rolada: ${t}`,"info")}_quickAddCombatant(t){var o,s,r,d;const i=((s=(o=this.$("#qa-name"))==null?void 0:o.value)==null?void 0:s.trim())||"",e=parseInt(((r=this.$("#qa-init"))==null?void 0:r.value)||"0",10)||m.quick(20),a=parseInt(((d=this.$("#qa-hp"))==null?void 0:d.value)||"10",10)||10;if(!i){c.show("Insira um nome para o combatente.","warning");return}const n={id:`qc-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,name:i,type:t,init:e,ac:10,hp_current:a,hp_max:a,conditions:[],isCurrentTurn:!1};this.store.update(l=>{l.initiativeOrder||(l.initiativeOrder=[]),l.initiativeOrder.push(n),l.initiativeOrder.sort((p,g)=>(g.init??0)-(p.init??0)),l.combatActive||(l.combatActive=!0,l.combatRound=l.combatRound||1,l.initiativeIndex=0)}),this._broadcastState(),this._quickAdd={name:"",init:"",hp:"",type:"Enemy"},this.$("#qa-name")&&(this.$("#qa-name").value=""),this.$("#qa-init")&&(this.$("#qa-init").value=""),this.$("#qa-hp")&&(this.$("#qa-hp").value=""),c.show(`➕ ${i} adicionado como ${t==="Player"?"Herói":"Inimigo"}`,"success")}navigateToCombat(){this.store.update(t=>{t.activeTab="campaign"})}};y(u,"CONDITIONS",{abalado:{emoji:"😰",label:"Abalado"},amedrontado:{emoji:"😨",label:"Amedrontado"},agarrado:{emoji:"🤝",label:"Agarrado"},atordoado:{emoji:"💫",label:"Atordoado"},cego:{emoji:"🙈",label:"Cego"},caído:{emoji:"🤕",label:"Caído"},enfeitiçado:{emoji:"💜",label:"Enfeitiçado"},envenenado:{emoji:"🤢",label:"Envenenado"},exausto:{emoji:"😫",label:"Exausto"},incapacitado:{emoji:"😵",label:"Incapacitado"},invisível:{emoji:"👻",label:"Invisível"},paralisado:{emoji:"🧊",label:"Paralisado"},petrificado:{emoji:"🗿",label:"Petrificado"},preso:{emoji:"🕸️",label:"Preso"},amaldiçoado:{emoji:"🧿",label:"Amaldiçoado"},surdo:{emoji:"🔇",label:"Surdo"}});let C=u;export{C as InitiativeMonitor};
