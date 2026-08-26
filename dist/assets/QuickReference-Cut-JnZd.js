import{R as h}from"./ReactiveComponent-DxMwUypL.js";import{m as s}from"./main-Bk3T2ZrR.js";import{s as f}from"./spells-5e-BHNeu1cc.js";import"./Boot-CGoZOUiq.js";import"./BattleManager-CjydHzBy.js";import"./jsxRuntime.module-B_1yG4TV.js";import"./FXEngine-CD41bvJc.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";class M extends h{constructor(e){super(e),this._activeSection="quickref",this._glossarySearch="",this._glossaryFilter="all",this._magicSearch="",this._magicFilterLevel="all",this._magicFilterClass="all",this._activeMagicTab="spells",this._hoverTimer=null,this._activePopupSpell=null,this._popupMode=null,this._popupPosition={x:0,y:0}}template(){let e="";if(this._activePopupSpell){const a=this._activePopupSpell,i=a.level===0,o=a.type==="dano"||a.baseDamage;let t="circle-glow";i?t="cantrip-glow":o&&(t="attack-glow");const r=this._popupMode==="click"?"pinned":"";e=s`
                <div class="magic-popup ${t} ${r}" 
                     style="left: ${this._popupPosition.x}px; top: ${this._popupPosition.y}px; pointer-events: ${this._popupMode==="click"?"auto":"none"};">
                    ${this._getSpellPopupHTML(a)}
                </div>
            `}return s`
            <style>
            .tome-nav-btn:not(.active):hover { background: rgba(255,255,255,0.05) !important; color: #fff !important; }
            .tome-nav-btn:not(.active):hover i { transform: scale(1.1); }
            .ref-card-red { transition: all 0.3s ease; }
            .ref-card-red:hover { background: rgba(239, 68, 68, 0.06) !important; border-color: rgba(239, 68, 68, 0.3) !important; transform: translateY(-2px); }
            .ref-card-blue { transition: all 0.3s ease; }
            .ref-card-blue:hover { background: rgba(59, 130, 246, 0.06) !important; border-color: rgba(59, 130, 246, 0.3) !important; transform: translateY(-2px); }
            .ref-card-gold { transition: all 0.3s ease; }
            .ref-card-gold:hover { background: rgba(197, 160, 89, 0.06) !important; border-color: rgba(197, 160, 89, 0.3) !important; transform: translateX(4px); }
            .ref-card-glow { transition: all 0.3s ease; }
            .ref-card-glow:hover { transform: translateY(-5px); border-color: rgba(197, 160, 89, 0.4) !important; box-shadow: 0 15px 35px rgba(0,0,0,0.5), inset 0 0 20px rgba(197,160,89,0.05); }
            </style>
            <div class="page" style="max-width: 1400px; padding: 20px; animation: fadeIn 0.5s ease-out;">
                <!-- Header Premium -->
                <div class="section-header" style="border-bottom: 2px solid rgba(197,160,89,0.15); padding-bottom:25px; margin-bottom:30px; display: flex; justify-content: space-between; align-items: flex-end; position: relative;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 10% 50%, rgba(197,160,89,0.08), transparent 50%); pointer-events: none;"></div>
                    <div style="position: relative; z-index: 1;">
                        <h2 class="section-title" style="font-family:'Cinzel', serif; color:var(--accent); text-shadow:0 0 20px rgba(197,160,89,0.5); font-size: 2.2rem; margin-bottom: 8px;">
                            <i class="fa-solid fa-book-sparkles" style="margin-right:12px; color:#ffaa00;"></i> Tomo do Mestre V17
                        </h2>
                        <p class="section-subtitle" style="color:var(--text-dim); font-size: 0.95rem; letter-spacing: 0.5px; max-width: 600px;">Toda a sabedoria e mecânicas das eras compiladas em grimórios de acesso imediato.</p>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 280px 1fr; gap:35px; align-items:start;">
                    <!-- NAVIGATION MENU PREMIUM -->
                    <div class="card glass-accent" style="padding:20px 15px; display:flex; flex-direction:column; gap:6px; border-radius:16px; background: rgba(10, 12, 16, 0.65); border: 1px solid rgba(255,255,255,0.05); box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4);">
                        <div style="font-family:'Cinzel', serif; font-size:0.7rem; color:var(--text-dim); letter-spacing:3px; padding-left:15px; margin-bottom:12px; font-weight:800; display:flex; align-items:center; gap:8px;">
                            <div style="height:1px; flex:1; background:linear-gradient(to right, transparent, rgba(197,160,89,0.3));"></div>
                            TOMOS DE SABEDORIA
                            <div style="height:1px; flex:1; background:linear-gradient(to left, transparent, rgba(197,160,89,0.3));"></div>
                        </div>
                        
                        ${this._renderNavButton("quickref","fa-compass","Guia Rápido D&D 5e","255, 170, 0")}
                        ${this._renderNavButton("glossary2024","fa-book-sparkles","Glossário D&D 2024","197, 160, 89")}
                        ${this._renderNavButton("magicglossary","fa-wand-magic-sparkles","Glossário Mágico","168, 85, 247")}
                        ${this._renderNavButton("conditions","fa-skull-crossbones","Condições de Status","239, 68, 68")}
                        ${this._renderNavButton("actions","fa-swords","Ações de Turno","59, 130, 246")}
                        ${this._renderNavButton("environment","fa-mountain-sun","Ambiente & Movimento","34, 197, 94")}
                        ${this._renderNavButton("spellcasting","fa-hat-wizard","Regras de Magia","245, 158, 11")}
                        ${this._renderNavButton("resting","fa-campground","Descansos & Cura","255, 215, 0")}
                        ${this._renderNavButton("dc","fa-bullseye","Dificuldades (CD)","197, 160, 89")}
                        ${this._renderNavButton("abbreviations","fa-language","Dicionário do Mestre","255, 255, 255")}
                    </div>

                    <!-- CONTENT AREA PREMIUM -->
                    <div class="card glass-accent animate-fadeIn" style="min-height:75vh; padding:40px; border-radius:16px; background: rgba(12, 14, 20, 0.9); border: 1px solid rgba(197,160,89,0.15); border-top: 3px solid var(--accent); box-shadow: 0 25px 50px rgba(0,0,0,0.8), inset 0 0 50px rgba(197,160,89,0.05); position: relative; overflow: hidden;">
                        <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(197,160,89,0.08) 0%, transparent 70%); border-radius: 50%; pointer-events: none;"></div>
                        <div style="position: relative; z-index: 1;">
                            ${this._renderActiveContent()}
                        </div>
                    </div>
                </div>
            </div>
            ${e}
        `}_renderNavButton(e,a,i,o){const t=this._activeSection===e,r=t?`rgba(${o}, 0.2)`:"transparent",n=t?`1px solid rgba(${o}, 0.5)`:"1px solid transparent",l=t?"#fff":"var(--text-dim)",d=t?`0 0 20px rgba(${o}, 0.3)`:"none";return s`
            <button class="btn btn-sm tome-nav-btn ${t?"active":""}" 
                    style="justify-content:flex-start; text-align:left; border-radius:10px; padding: 12px 15px; background: ${r}; border: ${n}; color: ${l}; box-shadow: ${d}; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;" 
                    data-action="setSection" data-section="${e}">
                ${t?s`<div style="position:absolute; left:0; top:0; bottom:0; width:3px; background:rgb(${o}); box-shadow:0 0 10px rgb(${o});"></div>`:""}
                <i class="fa-solid ${a}" style="width:24px; text-align:center; margin-right:10px; font-size:1.1rem; color:rgb(${o}); transition:transform 0.3s; filter: ${t?"drop-shadow(0 0 5px rgb("+o+"))":"none"};"></i>
                <span style="font-weight: ${t?"700":"500"}; letter-spacing: 0.5px; font-size: 0.85rem;">${i}</span>
            </button>
        `}_renderActiveContent(){switch(this._activeSection){case"quickref":return this._renderQuickRef();case"glossary2024":return this._renderGlossary2024();case"magicglossary":return this._renderMagicGlossary();case"conditions":return this._renderConditions();case"actions":return this._renderActions();case"environment":return this._renderEnvironment();case"spellcasting":return this._renderSpellcasting();case"resting":return this._renderResting();case"dc":return this._renderDC();case"abbreviations":return this._renderAbbreviations();default:return""}}_renderConditions(){return s`
            <div style="animation: fadeIn 0.4s ease-out;">
                <h3 style="font-family:'Cinzel', serif; color:var(--danger); margin-bottom:15px; font-size:1.8rem; text-shadow:0 0 15px rgba(239,68,68,0.4);">
                    <i class="fa-solid fa-skull-crossbones" style="margin-right:10px;"></i> Condições de Status
                </h3>
                <p style="font-size:0.9rem; color:var(--text-dim); margin-bottom:30px; line-height:1.6;">Efeitos mágicos, armadilhas ou ferimentos de combate que alteram temporariamente as capacidades físicas ou mentais dos heróis e monstros.</p>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px;">
                    <!-- Left: List -->
                    <div style="display:flex; flex-direction:column; gap:15px; max-height:60vh; overflow-y:auto; padding-right:15px; scrollbar-width:thin;">
                        ${[{name:"Caído (Prone)",icon:"fa-person-falling",effect:"Movimento apenas rastejando (dobro do custo). Jogadas de ataque contra a criatura têm Vantagem a 1.5m e Desvantagem para ataques à distância."},{name:"Cego (Blinded)",icon:"fa-eye-slash",effect:"Falha automática em testes que requerem visão. Jogadas de ataque contra o cego têm Vantagem, e os ataques dele têm Desvantagem."},{name:"Envenenado (Poisoned)",icon:"fa-skull-crossbones",effect:"A criatura sente náuseas intensas e tremores. Tem Desvantagem em todas as jogadas de ataque e testes de habilidade."},{name:"Enfeitiçado (Charmed)",icon:"fa-heart",effect:"Não pode atacar o conjurador do feitiço. O conjurador tem Vantagem em testes de interação social com a criatura."},{name:"Agarrado (Grappled)",icon:"fa-hand-back-fist",effect:"Deslocamento da criatura torna-se 0. O agarrador pode arrastá-la consigo pela metade do seu próprio deslocamento."},{name:"Incapacitado",icon:"fa-ban",effect:"A criatura perde o controle motor ou foco mental imediato. Não pode realizar nenhuma ação ou reação sob nenhuma hipótese."},{name:"Invisível",icon:"fa-ghost",effect:"Impossível de ser visto a olho nu (mas faz barulho e deixa pegadas). Ataques contra ela têm Desvantagem; ataques dela têm Vantagem."},{name:"Paralisado",icon:"fa-bolt",effect:"Incapacitada e incapaz de se mover ou falar. Falha em testes de FOR/DES. Qualquer ataque feito a 1.5m é um Golpe Crítico Automático."},{name:"Petrificado",icon:"fa-gem",effect:"Transformada em pedra sólida. Peso multiplicado por 10. Imune a venenos e doenças, e tem Resistência a todo tipo de dano físico."},{name:"Ensurdecido (Deafened)",icon:"fa-ear-slash",effect:"Falha automática em testes de audição. Não ouve comandos e está imune a efeitos mágicos baseados em som."}].map(a=>s`
                            <div class="glass card-hover ref-card-red" style="padding:18px; border-radius:12px; border:1px solid rgba(255,255,255,0.05); border-left:4px solid var(--danger); background:rgba(0,0,0,0.3); position:relative; overflow:hidden;">
                                <div style="display:flex; align-items:center; gap:12px; font-weight:800; color:#fff; font-size:1.1rem; font-family:'Cinzel', serif; margin-bottom:8px;">
                                    <div style="width:32px; height:32px; border-radius:8px; background:rgba(239,68,68,0.15); color:var(--danger); display:flex; align-items:center; justify-content:center;">
                                        <i class="fa-solid ${a.icon}" style="font-size:1rem;"></i>
                                    </div>
                                    ${a.name}
                                </div>
                                <p style="font-size:0.8rem; line-height:1.6; color:var(--text-dim); margin:0;">${a.effect}</p>
                            </div>
                        `)}
                    </div>
                    
                    <!-- Right: Exhaustion rules (highly advanced & expanded) -->
                    <div style="position: sticky; top: 0;">
                        <div class="hp-container glass" style="background:linear-gradient(145deg, rgba(239,68,68,0.05), rgba(0,0,0,0.6)); border:1px solid rgba(239,68,68,0.2); border-radius:16px; padding:30px; display:flex; flex-direction:column; justify-content:flex-start; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                            <span class="hp-label-float" style="background:#08080a; color:var(--danger); border-color:var(--danger); box-shadow:0 0 10px rgba(239,68,68,0.2);">⚠️ REGRAS ESPECIAIS</span>
                            <h4 style="font-family:'Cinzel', serif; color:#fff; margin-bottom:15px; font-size:1.3rem; border-bottom:1px solid rgba(239,68,68,0.2); padding-bottom:12px; text-shadow:0 0 10px rgba(239,68,68,0.3);">Níveis de Exaustão</h4>
                            <p style="font-size:0.85rem; color:var(--text-dim); line-height:1.6; margin-bottom:20px;">Fadiga extrema, frio congelante ou rituais necromânticos causam exaustão acumulativa. Um descanso longo remove 1 nível.</p>
                            
                            <div style="display:flex; flex-direction:column; gap:12px;">
                                <div style="font-size:0.85rem; display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px;"><strong>Nível 1:</strong> <span style="color:var(--danger);">Desvantagem em testes de atributos</span></div>
                                <div style="font-size:0.85rem; display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px;"><strong>Nível 2:</strong> <span style="color:var(--danger);">Deslocamento cortado pela metade</span></div>
                                <div style="font-size:0.85rem; display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px;"><strong>Nível 3:</strong> <span style="color:var(--danger);">Desvantagem em ataques e salvaguardas</span></div>
                                <div style="font-size:0.85rem; display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px;"><strong>Nível 4:</strong> <span style="color:var(--danger);">Máximo de PV reduzido pela metade</span></div>
                                <div style="font-size:0.85rem; display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:6px;"><strong>Nível 5:</strong> <span style="color:var(--danger);">Deslocamento reduzido para 0</span></div>
                                <div style="font-size:0.95rem; display:flex; justify-content:space-between; padding-top:4px; font-weight:900; background:rgba(239,68,68,0.1); padding:8px; border-radius:6px; margin-top:4px;"><strong>Nível 6:</strong> <span style="color:red; text-shadow:0 0 10px red;">Morte Instantânea 💀</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `}_renderActions(){return s`
            <div style="animation: fadeIn 0.4s ease-out;">
                <h3 style="font-family:'Cinzel', serif; color:var(--info); margin-bottom:15px; font-size:1.8rem; text-shadow:0 0 15px rgba(59,130,246,0.4);">
                    <i class="fa-solid fa-swords" style="margin-right:10px;"></i> Ações no Turno de Combate
                </h3>
                <p style="font-size:0.9rem; color:var(--text-dim); margin-bottom:30px; line-height:1.6;">Em um combate de D&D, seu turno tático é composto por <strong>Movimento</strong>, <strong>1 Ação</strong>, <strong>1 Reação</strong> (fora do turno) e <strong>1 Ação Bônus</strong> (se aplicável).</p>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px; max-height:60vh; overflow-y:auto; padding-right:15px; scrollbar-width:thin;">
                    ${[{name:"Atacar (Attack)",cost:"Ação",desc:"Realiza um ataque corpo-a-corpo ou à distância com armas ou magias."},{name:"Conjurar Magia",cost:"Varie",desc:"Conjura uma magia cujo tempo de conjuração seja 1 ação (ou ação bônus se permitido)."},{name:"Correr (Dash)",cost:"Ação",desc:"Ganha deslocamento extra igual ao seu deslocamento máximo na rodada atual."},{name:"Desengajar",cost:"Ação",desc:"Seu movimento não provoca nenhum ataque de oportunidade até o final da rodada."},{name:"Esquivar (Dodge)",cost:"Ação",desc:"Até o início do seu próximo turno, ataques contra você têm Desvantagem e seus testes de Destreza têm Vantagem."},{name:"Ajudar (Help)",cost:"Ação",desc:"Concede Vantagem ao teste de habilidade de um aliado ou na primeira jogada de ataque dele contra um monstro."},{name:"Esconder (Hide)",cost:"Ação",desc:"Faz um teste de Destreza (Furtividade) para sumir do campo de visão de inimigos (requer cobertura)."},{name:"Preparar (Ready)",cost:"Ação",desc:"Escolhe um gatilho. Se o gatilho acontecer antes do seu próximo turno, você usa sua Reação para agir."},{name:"Usar Objeto",cost:"Ação",desc:"Interage com um segundo objeto complexo na mesma rodada (beber poção, abrir baú chaveado, etc)."}].map(a=>s`
                        <div class="card glass-accent ref-card-blue" style="background:rgba(0,0,0,0.4); padding:20px; border:1px solid rgba(59,130,246,0.15); border-left:4px solid var(--info); border-radius:12px; position:relative; overflow:hidden;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                <strong style="color:#fff; font-size:1.1rem; font-family:'Cinzel', serif;">${a.name}</strong>
                                <span class="badge" style="font-size:0.65rem; padding:4px 8px; border-radius:6px; background:rgba(59,130,246,0.2); color:#93c5fd; border:1px solid rgba(59,130,246,0.3); font-weight:800; letter-spacing:0.5px;">${a.cost}</span>
                            </div>
                            <p style="font-size:0.85rem; line-height:1.5; color:var(--text-dim); margin:0;">${a.desc}</p>
                        </div>
                    `)}
                </div>
            </div>
        `}_renderEnvironment(){return s`
            <div style="animation: fadeIn 0.4s ease-out;">
                <h3 style="font-family:'Cinzel', serif; color:var(--success); margin-bottom:15px; font-size:1.8rem; text-shadow:0 0 15px rgba(16,185,129,0.4);">
                    <i class="fa-solid fa-mountain-sun" style="margin-right:10px;"></i> Ambiente, Cobertura & Movimento
                </h3>
                <p style="font-size:0.9rem; color:var(--text-dim); margin-bottom:30px; line-height:1.6;">O ambiente tático altera diretamente o acerto das flechas, a eficácia de magias e o deslocamento físico dos personagens. Use isso a seu favor.</p>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:25px;">
                    <!-- Iluminação -->
                    <div class="glass card-hover tome-hover-badge" style="padding:25px; border-radius:16px; border-top:4px solid var(--warning); background:rgba(0,0,0,0.3);">
                        <h4 style="font-family:'Cinzel', serif; color:var(--warning); margin-bottom:15px; font-size:1.2rem;"><i class="fa-solid fa-sun" style="margin-right:10px;"></i> Iluminação</h4>
                        <ul style="font-size:0.85rem; line-height:1.8; padding-left:15px; color:var(--text-dim); margin:0;">
                            <li><strong style="color:#fff;">Luz Plena:</strong> Condição padrão de visibilidade sem penalidades.</li>
                            <li style="margin-top:8px;"><strong style="color:#fff;">Penumbra:</strong> Luz tênue (tochas, lua). Causa <strong>Desvantagem</strong> em testes de Sabedoria (Percepção) baseados na visão.</li>
                            <li style="margin-top:8px;"><strong style="color:#fff;">Escuridão Total:</strong> Bloqueia a visão comum. Personagens sem Visão no Escuro são considerados <strong style="color:var(--danger);">Cegos</strong>.</li>
                        </ul>
                    </div>

                    <!-- Cobertura -->
                    <div class="glass card-hover tome-hover-badge" style="padding:25px; border-radius:16px; border-top:4px solid var(--success); background:rgba(0,0,0,0.3);">
                        <h4 style="font-family:'Cinzel', serif; color:var(--success); margin-bottom:15px; font-size:1.2rem;"><i class="fa-solid fa-shield-halved" style="margin-right:10px;"></i> Cobertura (CA)</h4>
                        <ul style="font-size:0.85rem; line-height:1.8; padding-left:15px; color:var(--text-dim); margin:0;">
                            <li><strong style="color:#fff;">Meia Cobertura (1/2):</strong> Concede um bônus de <strong style="color:var(--success);">+2 na CA</strong> e em salvaguardas de Destreza (ex: lutar atrás de um tronco).</li>
                            <li style="margin-top:8px;"><strong style="color:#fff;">Três Quartos (3/4):</strong> Concede um bônus massivo de <strong style="color:var(--success);">+5 na CA</strong> e em salvaguardas de Destreza (ex: fresta de muralha).</li>
                            <li style="margin-top:8px;"><strong style="color:#fff;">Total:</strong> O alvo não pode ser atacado diretamente.</li>
                        </ul>
                    </div>

                    <!-- Movimento Especial -->
                    <div class="glass card-hover tome-hover-badge" style="padding:25px; border-radius:16px; border-top:4px solid var(--info); background:rgba(0,0,0,0.3);">
                        <h4 style="font-family:'Cinzel', serif; color:var(--info); margin-bottom:15px; font-size:1.2rem;"><i class="fa-solid fa-shoe-prints" style="margin-right:10px;"></i> Movimentação</h4>
                        <ul style="font-size:0.85rem; line-height:1.8; padding-left:15px; color:var(--text-dim); margin:0;">
                            <li><strong style="color:#fff;">Terreno Difícil:</strong> Cada 1,5m de movimento custa 3m (dobro do custo). Lama, gelo, entulho, escadarias longas.</li>
                            <li style="margin-top:8px;"><strong style="color:#fff;">Quedas:</strong> Sofre <strong style="color:var(--danger);">1d6 de dano de Concussão</strong> para cada 3m de queda livre (máx: 20d6) e cai Caído (Prone).</li>
                            <li style="margin-top:8px;"><strong style="color:#fff;">Levantar do Chão:</strong> Levantar-se da condição Caído consome <strong style="color:var(--warning);">metade de todo o seu deslocamento</strong> no turno.</li>
                        </ul>
                    </div>
                </div>
            </div>
        `}_renderSpellcasting(){return s`
            <div style="animation: fadeIn 0.4s ease-out;">
                <h3 style="font-family:'Cinzel', serif; color:var(--warning); margin-bottom:15px; font-size:1.8rem; text-shadow:0 0 15px rgba(245,158,11,0.4);">
                    <i class="fa-solid fa-hat-wizard" style="margin-right:10px;"></i> Arte e Conjuração da Magia
                </h3>
                <p style="font-size:0.9rem; color:var(--text-dim); margin-bottom:30px; line-height:1.6;">As artes arcanas e divinas seguem regras estritas para canalizar o poder mágico nos planos materiais.</p>
                
                <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:35px;">
                    <div style="display:flex; flex-direction:column; gap:20px;">
                        <div class="glass" style="padding:25px; border-radius:12px; background:rgba(0,0,0,0.3); border-left:5px solid var(--warning);">
                            <strong style="color:#fff; font-family:'Cinzel', serif; font-size:1.2rem; display:block; margin-bottom:12px;"><i class="fa-solid fa-brain" style="color:var(--warning); margin-right:8px;"></i> Concentração</strong>
                            <p style="font-size:0.85rem; line-height:1.6; color:var(--text-dim); margin:0;">Algumas magias requerem foco ativo para persistir. Se você sofrer dano enquanto se concentra, deve fazer uma <strong style="color:#fff;">Salvaguarda de Constituição (CON)</strong>. A CD é <strong style="color:var(--accent);">10 ou metade do dano sofrido</strong> (o que for maior). Falhar significa que a magia se dissipa imediatamente.</p>
                        </div>
                        <div class="glass" style="padding:25px; border-radius:12px; background:rgba(0,0,0,0.3); border-left:5px solid var(--warning);">
                            <strong style="color:#fff; font-family:'Cinzel', serif; font-size:1.2rem; display:block; margin-bottom:12px;"><i class="fa-solid fa-flask" style="color:var(--warning); margin-right:8px;"></i> Componentes de Magia</strong>
                            <ul style="font-size:0.85rem; line-height:1.8; color:var(--text-dim); margin:0; padding-left:15px;">
                                <li><strong style="color:#fff;">V (Verbal):</strong> Entoação de palavras mágicas místicas em voz clara e audível.</li>
                                <li style="margin-top:6px;"><strong style="color:#fff;">S (Somático):</strong> Gestos intrincados (requer pelo menos uma mão livre).</li>
                                <li style="margin-top:6px;"><strong style="color:#fff;">M (Material):</strong> Foco arcano, símbolo sagrado ou ingredientes físicos listados na magia.</li>
                            </ul>
                        </div>
                    </div>

                    <div class="hp-container glass" style="background:linear-gradient(145deg, rgba(245,158,11,0.05), rgba(0,0,0,0.6)); border:1px solid rgba(245,158,11,0.2); border-radius:16px; padding:30px; box-shadow:0 10px 30px rgba(0,0,0,0.5); position:relative;">
                        <div style="position:absolute; top:0; right:0; opacity:0.05; pointer-events:none; font-size:120px;">
                            <i class="fa-solid fa-hat-wizard"></i>
                        </div>
                        <span class="hp-label-float" style="background:#08080a; color:var(--warning); border-color:var(--warning);">CÁLCULOS ARCANOS</span>
                        <h4 style="font-family:'Cinzel', serif; color:#fff; margin-bottom:20px; font-size:1.3rem; border-bottom:1px solid rgba(245,158,11,0.2); padding-bottom:12px;">Modificadores do Conjurador</h4>
                        
                        <div style="display:flex; flex-direction:column; gap:20px; position:relative; z-index:1;">
                            <div>
                                <strong style="color:var(--accent); font-size:0.95rem; display:block; margin-bottom:8px;">Jogada de Ataque de Magia:</strong>
                                <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(245,158,11,0.3); padding:12px; border-radius:8px; font-family:'JetBrains Mono', monospace; font-size:0.8rem; color:#fff; text-align:center; box-shadow:inset 0 2px 10px rgba(0,0,0,0.5);">
                                    D20 + Bônus Proficiência + Mod. Conjurador
                                </div>
                            </div>
                            <div>
                                <strong style="color:var(--accent); font-size:0.95rem; display:block; margin-bottom:8px;">Classe de Dificuldade (CD) da Magia:</strong>
                                <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(245,158,11,0.3); padding:12px; border-radius:8px; font-family:'JetBrains Mono', monospace; font-size:0.8rem; color:#fff; text-align:center; box-shadow:inset 0 2px 10px rgba(0,0,0,0.5);">
                                    8 + Bônus Proficiência + Mod. Conjurador
                                </div>
                            </div>
                            <div style="background:rgba(245,158,11,0.1); padding:15px; border-radius:8px; border:1px solid rgba(245,158,11,0.2); font-size:0.8rem; color:var(--text-dim); line-height:1.5;">
                                <strong style="color:var(--warning);">Atributos por Classe:</strong><br />
                                • <span style="color:#fff;">Inteligência:</span> Magos, Artífices<br />
                                • <span style="color:#fff;">Sabedoria:</span> Clérigos, Druidas, Patrulheiros<br />
                                • <span style="color:#fff;">Carisma:</span> Feiticeiros, Bruxos, Bardos, Paladinos
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `}_renderResting(){return s`
            <div style="animation: fadeIn 0.4s ease-out;">
                <h3 style="font-family:'Cinzel', serif; color:#ffd700; margin-bottom:15px; font-size:1.8rem; text-shadow:0 0 15px rgba(255,215,0,0.4);">
                    <i class="fa-solid fa-campground" style="margin-right:10px;"></i> Descansos, Cura & Sobrevivência
                </h3>
                <p style="font-size:0.9rem; color:var(--text-dim); margin-bottom:30px; line-height:1.6;">As jornadas épicas exigem que os heróis parem para recuperar forças, tratar ferimentos letais e recarregar seu poder arcano.</p>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px;">
                    <!-- Descanso Curto -->
                    <div class="glass" style="padding:30px; border-radius:16px; border-left:5px solid var(--accent); background:rgba(0,0,0,0.4); position:relative; overflow:hidden;">
                        <i class="fa-solid fa-mug-hot" style="position:absolute; bottom:-20px; right:-20px; font-size:100px; color:rgba(197,160,89,0.05); pointer-events:none;"></i>
                        <h4 style="font-family:'Cinzel', serif; color:var(--accent); margin-bottom:15px; font-size:1.3rem;"><i class="fa-solid fa-hourglass-half" style="margin-right:8px;"></i> Descanso Curto (1 Hora)</h4>
                        <p style="font-size:0.85rem; line-height:1.6; color:var(--text-dim); margin-bottom:20px;">Uma pausa que não exige mais do que comer, beber, ler ou cuidar de ferimentos de forma rústica.</p>
                        
                        <div style="background:rgba(197,160,89,0.05); border:1px solid rgba(197,160,89,0.2); padding:20px; border-radius:12px;">
                            <strong style="color:#fff; font-size:1rem; display:block; margin-bottom:10px; font-family:'Cinzel', serif;">Gasto de Dados de Vida (Hit Dice)</strong>
                            <p style="font-size:0.85rem; color:var(--text-dim); line-height:1.5; margin:0;">Um herói pode gastar um ou mais dos seus Dados de Vida no final do descanso. Para cada dado gasto, jogue-o e adicione o <strong>Modificador de Constituição</strong>. O total é recuperado em Pontos de Vida (HP).</p>
                        </div>
                    </div>

                    <!-- Descanso Longo -->
                    <div class="glass" style="padding:30px; border-radius:16px; border-left:5px solid var(--success); background:rgba(0,0,0,0.4); position:relative; overflow:hidden;">
                        <i class="fa-solid fa-bed" style="position:absolute; bottom:-20px; right:-20px; font-size:100px; color:rgba(16,185,129,0.05); pointer-events:none;"></i>
                        <h4 style="font-family:'Cinzel', serif; color:var(--success); margin-bottom:15px; font-size:1.3rem;"><i class="fa-solid fa-moon" style="margin-right:8px;"></i> Descanso Longo (8 Horas)</h4>
                        <p style="font-size:0.85rem; line-height:1.6; color:var(--text-dim); margin-bottom:20px;">Equivale a uma noite de sono segura. O herói não pode ter se envolvido em combate ou esforço por mais de 1 hora no total.</p>
                        
                        <ul style="font-size:0.85rem; line-height:2.0; color:var(--text-dim); padding-left:15px; margin:0;">
                            <li><strong style="color:#fff;">Cura Completa:</strong> Restaura 100% dos Pontos de Vida perdidos.</li>
                            <li><strong style="color:#fff;">Espaços de Magia:</strong> Todos os slots de magia consumidos são recarregados.</li>
                            <li><strong style="color:#fff;">Dados de Vida:</strong> Recupera <strong>metade</strong> do total máximo de Dados de Vida (arredondado para baixo, mínimo 1).</li>
                            <li><strong style="color:#fff;">Fadiga:</strong> Reduz exatamente <strong>1 nível</strong> a exaustão física da criatura.</li>
                        </ul>
                    </div>
                </div>
            </div>
        `}_renderDC(){return s`
            <div style="animation: fadeIn 0.4s ease-out;">
                <h3 style="font-family:'Cinzel', serif; color:var(--accent); margin-bottom:15px; font-size:1.8rem; text-shadow:0 0 15px rgba(197,160,89,0.4);">
                    <i class="fa-solid fa-bullseye" style="margin-right:10px;"></i> Escala de Classes de Dificuldade (CD)
                </h3>
                <p style="font-size:0.9rem; color:var(--text-dim); margin-bottom:30px; line-height:1.6;">A Classe de Dificuldade (DC) determina o quão heróico ou excepcional deve ser o esforço de um personagem para realizar um teste de atributo e ter sucesso na história.</p>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap:20px; max-height:60vh; overflow-y:auto; padding-right:15px; scrollbar-width:thin;">
                    ${[{val:5,level:"Muito Fácil",example:"Arrombar uma porta de madeira velha e podre."},{val:10,level:"Fácil",example:"Ouvir uma conversa abafada atrás de uma porta comum."},{val:15,level:"Médio",example:"Escalar uma parede de pedra molhada com poucos apoios."},{val:20,level:"Difícil",example:"Decifrar um manuscrito antigo em dialeto morto."},{val:25,level:"Muito Difícil",example:"Saltar um desfiladeiro ventoso de 6 metros."},{val:30,level:"Quase Impossível",example:"Rastrear um assassino na lama sob tempestade torrencial."}].map(a=>s`
                        <div class="glass card-hover ref-card-gold" style="display:flex; align-items:center; gap:25px; padding:20px; background:rgba(0,0,0,0.3); border:1px solid rgba(197,160,89,0.1); border-radius:12px; position:relative;">
                            <div style="width:60px; height:60px; border-radius:12px; background:linear-gradient(135deg, rgba(197,160,89,0.2), rgba(255,170,0,0.1)); color:var(--accent); border:1px solid rgba(197,160,89,0.4); display:flex; align-items:center; justify-content:center; font-weight:900; font-family:'Cinzel', serif; font-size:1.5rem; box-shadow:0 0 15px rgba(197,160,89,0.1); flex-shrink:0;">
                                ${a.val}
                            </div>
                            <div style="flex:1;">
                                <div style="font-weight:800; font-size:1.1rem; color:#fff; font-family:'Cinzel', serif; letter-spacing:0.5px; margin-bottom:4px;">${a.level}</div>
                                <div style="font-size:0.85rem; color:var(--text-dim); line-height:1.4;"><em>Ex: ${a.example}</em></div>
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `}_renderAbbreviations(){return s`
            <div style="animation: fadeIn 0.4s ease-out;">
                <h3 style="font-family:'Cinzel', serif; color:#fff; margin-bottom:15px; font-size:1.8rem; text-shadow:0 0 15px rgba(255,255,255,0.3);">
                    <i class="fa-solid fa-language" style="margin-right:10px;"></i> Dicionário de Termos e Siglas
                </h3>
                <p style="font-size:0.9rem; color:var(--text-dim); margin-bottom:30px; line-height:1.6;">Lista de siglas, definições rápidas e convenções mais comuns usadas pelas regras oficiais de D&D 5e e presentes nas fichas.</p>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:20px; max-height:60vh; overflow-y:auto; padding-right:15px; scrollbar-width:thin;">
                    ${[{s:"CA / AC",m:"Classe de Armadura. O valor numérico que um ataque inimigo deve igualar ou superar para desferir um golpe físico com sucesso."},{s:"CD / DC",m:"Classe de Dificuldade. A meta numérica a ser atingida em testes de perícia ou testes de resistência."},{s:"PV / HP",m:"Pontos de Vida. Representação abstrata da vitalidade e da integridade física de uma criatura."},{s:"TR / ST",m:"Teste de Resistência (Saving Throw). Teste reativo feito para evitar ou reduzir os efeitos nocivos de magias ou perigos."},{s:"Vantagem",m:"Role dois dados d20 no teste e utilize o maior resultado obtido para somar seus modificadores."},{s:"Desvantagem",m:"Role dois dados d20 no teste e utilize o menor resultado obtido para somar seus modificadores."},{s:"Surpresa",m:"Inimigos pegos de surpresa não se movem, não executam ações na 1ª rodada e não podem usar reações."},{s:"Ataque de Oportunidade",m:"Uso de uma Reação para desferir um ataque físico em um oponente que sai do seu alcance de combate corpo-a-corpo."},{s:"Ação Bônus",m:"Uma ação extra menor concedida por magias, talentos especiais ou características de classe específicas."},{s:"ND / CR",m:"Nível de Desafio. Métrica indicadora do poder relativo de monstros para equilibrar encontros de combate tático."}].map(a=>s`
                        <div class="glass card-hover ref-card-gold" style="padding:20px; border-radius:12px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); position:relative;">
                            <strong style="color:var(--accent); font-family:'Cinzel', serif; font-size:1.1rem; display:block; margin-bottom:8px; text-shadow:0 0 8px rgba(197,160,89,0.3);">${a.s}</strong>
                            <p style="font-size:0.85rem; color:var(--text-dim); line-height:1.6; margin:0;">${a.m}</p>
                        </div>
                    `)}
                </div>
            </div>
        `}_renderQuickRef(){return s`
            <div style="display:flex; flex-direction:column; gap:15px; height:100%;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(197,160,89,0.3); padding-bottom:12px; margin-bottom:10px;">
                    <h3 style="font-family:'Cinzel'; color:var(--accent); margin:0; font-size:1.5rem;">
                        <i class="fa-solid fa-compass" style="margin-right:10px;"></i> Guia Rápido Interativo D&D 5e (PT-BR)
                    </h3>
                    <a href="https://diogoan.github.io/dnd5e-quickref/" target="_blank" class="btn btn-ghost btn-sm" style="font-size:0.7rem; border:1px solid rgba(197,160,89,0.3); color:var(--accent); text-decoration:none; display:inline-flex; align-items:center; gap:5px;">
                        <i class="fa-solid fa-up-right-from-square"></i> Abrir em Nova Aba
                    </a>
                </div>
                <p style="font-size:0.85rem; color:var(--text-dim); margin:0; line-height:1.5;">
                    Clique nas abas e nos cartões abaixo para ver as descrições mecânicas completas em <strong>Português</strong> de ações, reações, movimentação e condições oficiais de D&D 5e.
                </p>
                <div style="flex:1; border:var(--sheet-border-thick); border-radius:12px; overflow:hidden; background:#ffffff; position:relative; min-height:650px;">
                    <iframe src="https://diogoan.github.io/dnd5e-quickref/" style="width:100%; height:650px; border:none;" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
                </div>
            </div>
        `}get _glossaryDatabase(){return[{id:"Graze",name:"De Raspão (Graze)",englishName:"Graze",category:"masteries",badgeText:"Maestria de Arma",badgeColor:"var(--info)",desc:"Se você errar uma jogada de ataque com esta arma contra uma criatura, você causa dano à criatura igual ao modificador do atributo usado para o ataque. O dano é do mesmo tipo que a arma causa e não pode ser aumentado de nenhuma forma.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Graze"},{id:"Nick",name:"Corte Rápido (Nick)",englishName:"Nick",category:"masteries",badgeText:"Maestria de Arma",badgeColor:"var(--info)",desc:"Quando você faz um ataque com uma arma que tem a propriedade Nick e estiver empunhando duas armas leves, você pode fazer o ataque adicional como parte da ação de atacar principal em vez de gastar uma ação bônus, limitando-se a uma vez por turno.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Nick"},{id:"Cleave",name:"Fender (Cleave)",englishName:"Cleave",category:"masteries",badgeText:"Maestria de Arma",badgeColor:"var(--info)",desc:"Uma vez por turno, ao atingir uma criatura com um ataque usando esta arma, você pode fazer um ataque adicional contra uma segunda criatura adjacente a ela que esteja dentro do seu alcance. Esta jogada de ataque adicional não soma o modificador do seu atributo ao dano (a menos que seja negativo).",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Cleave"},{id:"Topple",name:"Derrubar (Topple)",englishName:"Topple",category:"masteries",badgeText:"Maestria de Arma",badgeColor:"var(--info)",desc:"Ao atingir uma criatura e causar dano com esta arma, você pode forçar o alvo a realizar uma salvaguarda de Constituição (CD = 8 + seu Bônus de Proficiência + o modificador de atributo usado no ataque). Se falhar, a criatura fica sob a condição Caído (Prone).",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Topple"},{id:"Vex",name:"Irritar / Vexar (Vex)",englishName:"Vex",category:"masteries",badgeText:"Maestria de Arma",badgeColor:"var(--info)",desc:"Ao atingir uma criatura e causar dano com esta arma, você ganha Vantagem na sua próxima jogada de ataque contra ela antes do final do seu próximo turno.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Vex"},{id:"Push",name:"Empurrar (Push)",englishName:"Push",category:"masteries",badgeText:"Maestria de Arma",badgeColor:"var(--info)",desc:"Ao atingir uma criatura com esta arma, você pode empurrá-la por até 3 metros (10 pés) em linha reta horizontalmente para longe de você. Esse efeito funciona em criaturas de tamanho Grande ou menor.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Push"},{id:"Sap",name:"Enfraquecer (Sap)",englishName:"Sap",category:"masteries",badgeText:"Maestria de Arma",badgeColor:"var(--info)",desc:"Ao atingir uma criatura com esta arma, ela tem Desvantagem na sua próxima jogada de ataque antes do início do seu próximo turno.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Sap"},{id:"Slow",name:"Desacelerar (Slow)",englishName:"Slow",category:"masteries",badgeText:"Maestria de Arma",badgeColor:"var(--info)",desc:"Ao atingir uma criatura e causar dano com esta arma, você pode reduzir o deslocamento dela em 3 metros (10 pés) até o início do seu próximo turno. Este efeito não se acumula caso seja atingido múltiplas vezes.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Slow"},{id:"StudyAction",name:"Estudar (Study)",englishName:"Study",category:"actions",badgeText:"Ação de Turno",badgeColor:"var(--warning)",desc:"Você faz um teste de Inteligência (Arcanismo, História, Investigação, Natureza ou Religião) para lembrar ou discernir informações sobre monstros, itens arcanos, runas mágicas, fatos históricos importantes ou mistérios naturais.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#StudyAction"},{id:"SearchAction",name:"Buscar (Search)",englishName:"Search",category:"actions",badgeText:"Ação de Turno",badgeColor:"var(--warning)",desc:"Você gasta sua ação para fazer um teste de Sabedoria (Percepção ou Sobrevivência) ou Inteligência (Investigação) para localizar passagens secretas, armadilhas ocultas, rastrear pegadas, encontrar objetos escondidos ou pistas vitais no cenário.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#SearchAction"},{id:"UtilizeAction",name:"Utilizar (Utilize)",englishName:"Utilize",category:"actions",badgeText:"Ação de Turno",badgeColor:"var(--warning)",desc:"Você usa sua ação para interagir de forma complexa com um item não mágico, acionar mecanismos físicos (como alavancas e armadilhas), empregar ferramentas com as quais você é proficiente ou usar itens do seu inventário.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#UtilizeAction"},{id:"UnarmedStrike",name:"Golpe Desarmado (Unarmed Strike)",englishName:"Unarmed Strike",category:"actions",badgeText:"Ação de Turno",badgeColor:"var(--warning)",desc:"Um golpe de corpo-a-corpo livre. Permite escolher entre: causar Dano de Impacto (1 + mod de Força), iniciar um Agarrão (Grapple) forçando o alvo a realizar salvaguarda de Força/Destreza contra a sua CD de Agarrão, ou Empurrar (Shove) para derrubar o alvo ou afastá-lo 1,5m.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#UnarmedStrike"},{id:"InfluenceAction",name:"Influenciar (Influence)",englishName:"Influence",category:"actions",badgeText:"Ação de Turno",badgeColor:"var(--warning)",desc:"Você faz um teste de Carisma (Persuasão, Enganação ou Intimidação) ou Inteligência (Social) para tentar influenciar a atitude de um NPC em relação ao seu grupo, motivando-o a tomar uma atitude amigável, neutra ou hostil.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#InfluenceAction"},{id:"GrappledCondition",name:"Agarrado (Grappled)",englishName:"Grappled",category:"conditions",badgeText:"Condição de Status",badgeColor:"var(--danger)",desc:"O deslocamento da criatura agarrada torna-se 0 e ela não pode se beneficiar de bônus de velocidade. Ela tem Desvantagem nas jogadas de ataque contra qualquer alvo que não seja seu agarrador. O agarrador pode se mover arrastando ou carregando a criatura (pela metade de seu próprio deslocamento).",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#GrappledCondition"},{id:"IncapacitatedCondition",name:"Incapacitado (Incapacitated)",englishName:"Incapacitated",category:"conditions",badgeText:"Condição de Status",badgeColor:"var(--danger)",desc:"Uma criatura incapacitada perde a capacidade de realizar ações, ações bônus ou reações. Se ela estiver se concentrando em uma magia, sua concentração é interrompida imediatamente.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#IncapacitatedCondition"},{id:"BloodiedCondition",name:"Ferido (Bloodied)",englishName:"Bloodied",category:"conditions",badgeText:"Condição de Status",badgeColor:"var(--danger)",desc:'Uma criatura é considerada sob o status "Ferida" (Bloodied) se seus pontos de vida atuais forem iguais ou menores a metade dos seus pontos de vida máximos. Muitas habilidades e monstros interagem diretamente com este limiar.',link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#BloodiedCondition"},{id:"StunnedCondition",name:"Atordoado (Stunned)",englishName:"Stunned",category:"conditions",badgeText:"Condição de Status",badgeColor:"var(--danger)",desc:"Você fica Incapacitado e não consegue se mover. Suas falas tornam-se balbucios. Ataques contra você têm Vantagem, e você falha automaticamente em salvaguardas de Força e Destreza.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#StunnedCondition"},{id:"InvisibleCondition",name:"Invisível (Invisible)",englishName:"Invisible",category:"conditions",badgeText:"Condição de Status",badgeColor:"var(--danger)",desc:"Você é incapaz de ser visto por meios comuns (sem magias como Ver o Invisível). Suas jogadas de ataque têm Vantagem e ataques contra você têm Desvantagem. Seus testes de Destreza (Furtividade) para se esconder não exigem cobertura.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#InvisibleCondition"},{id:"UnconsciousCondition",name:"Inconsciente (Unconscious)",englishName:"Unconscious",category:"conditions",badgeText:"Condição de Status",badgeColor:"var(--danger)",desc:"Você fica Incapacitado, Caído e incapaz de se mover ou falar. Falha automaticamente em salvaguardas de Força e Destreza. Ataques contra você têm Vantagem, e qualquer ataque físico feito por um atacante a 1,5m é um Sucesso Crítico automático.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#UnconsciousCondition"},{id:"ExhaustedCondition",name:"Exausto (Exhausted)",englishName:"Exhausted",category:"conditions",badgeText:"Condição de Status",badgeColor:"var(--danger)",desc:"Substitui a escala antiga de 2014. Cada nível de exaustão (máximo 6) aplica um redutor cumulativo de -2 em todas as suas jogadas de d20 (ataques, testes e salvaguardas) e reduz o deslocamento em 3 metros por nível. Alcançar o nível 6 resulta em Morte Instantânea.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#ExhaustedCondition"},{id:"d20Test",name:"Teste d20 (D20 Test)",englishName:"D20 Test",category:"rules",badgeText:"Regra Geral",badgeColor:"var(--success)",desc:"Um termo guarda-chuva introduzido em D&D 2024 que engloba Jogadas de Ataque, Testes de Habilidade (Perícias) e Salvaguardas. Padroniza a mecânica onde rolar um 20 natural é sempre um Sucesso Crítico (sucesso imediato e benefício) e rolar um 1 natural é sempre uma Falha Crítica (falha imediata).",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#d20Test"},{id:"HeroicInspiration",name:"Inspiração Heroica (Heroic Inspiration)",englishName:"Heroic Inspiration",category:"rules",badgeText:"Regra Geral",badgeColor:"var(--success)",desc:"Substitui o sistema de inspiração antigo. Ao gastar sua Inspiração Heroica, você pode rolar novamente qualquer dado de um Teste d20 que acabou de fazer, devendo usar o novo resultado. Personagens tipicamente ganham inspiração ao rolar um 20 natural em um Teste d20 ou através de talentos específicos.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#HeroicInspiration"},{id:"SneakAttack",name:"Ataque Furtivo (Sneak Attack 2024)",englishName:"Sneak Attack",category:"rules",badgeText:"Regra Geral",badgeColor:"var(--success)",desc:"Regra de Ladino atualizada: O dano extra pode ser aplicado uma vez por turno quando você atinge com um ataque usando uma arma Finesse ou à distância e tem Vantagem, ou tem um aliado ativo a 1,5m do alvo e nenhuma Desvantagem na jogada.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#SneakAttack"},{id:"MagicAction",name:"Ação Mágica (Magic Action)",englishName:"Magic Action",category:"rules",badgeText:"Regra Geral",badgeColor:"var(--success)",desc:"Uma nova ação de combate formalizada que engloba a conjuração de magias (que requeiram 1 ação) ou a ativação de efeitos mágicos complexos provenientes de itens arcanos e características mágicas de classe.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#MagicAction"},{id:"ToolDC",name:"CD de Ferramenta (Tool DC)",englishName:"Tool DC",category:"rules",badgeText:"Regra Geral",badgeColor:"var(--success)",desc:"Se o uso de um item ou a realização de uma tarefa exige o uso de uma ferramenta na qual você é proficiente, a Classe de Dificuldade (CD) para qualquer criatura resistir ao efeito do item ou tarefa passa a ser calculada como: 8 + seu Bônus de Proficiência + modificador do atributo correspondente.",link:"https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#ToolDC"}]}onMount(){if(this._activeSection==="glossary2024"){const e=this.$("#glossary-search-input");e&&(e.focus(),this.listen(e,"input",a=>{this._glossarySearch=a.target.value,this._updateGlossaryList()})),this._updateGlossaryList()}if(this._activeSection==="magicglossary"){const e=this.$("#magic-search-input");e&&(e.focus(),this.listen(e,"input",o=>{this._magicSearch=o.target.value,this._updateMagicGlossaryList()}));const a=this.$("#magic-class-filter");a&&this.listen(a,"change",o=>{this._magicFilterClass=o.target.value,this._updateMagicGlossaryList()}),this.$$(".magic-tab-btn").forEach(o=>{this.listen(o,"click",t=>{this._activeMagicTab=o.dataset.tab,this._magicFilterLevel="all",this.render()})}),this._updateMagicGlossaryList()}this.listen(document,"mousedown",e=>{if(this._popupMode==="click"){const a=this.$(".magic-popup");a&&!a.contains(e.target)&&(e.target.closest(".spell-card")||(this._activePopupSpell=null,this._popupMode=null,this.render()))}})}onUnmount(){this._hoverTimer&&clearTimeout(this._hoverTimer)}setGlossaryFilter(e,a){this._glossaryFilter=a.dataset.category;const i=this.$("#glossary-filter-container");i&&i.querySelectorAll("button").forEach(o=>{o.dataset.category===this._glossaryFilter?(o.classList.remove("btn-ghost"),o.classList.add("btn-primary")):(o.classList.remove("btn-primary"),o.classList.add("btn-ghost"))}),this._updateGlossaryList()}_updateGlossaryList(){const e=this.$("#glossary-terms-list"),a=this.$("#glossary-count");if(!e)return;const i=this._glossarySearch.toLowerCase().trim(),o=this._glossaryDatabase.filter(t=>this._glossaryFilter!=="all"&&t.category!==this._glossaryFilter?!1:i?t.name.toLowerCase().includes(i)||t.englishName.toLowerCase().includes(i)||t.desc.toLowerCase().includes(i):!0);if(a&&(a.innerText=o.length),o.length===0){e.innerHTML=s`
                <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; color: var(--text-dim);">
                    <i class="fa-solid fa-book-open" style="font-size: 2.5rem; color: rgba(197,160,89,0.2); margin-bottom: 15px;"></i>
                    <p style="font-family: 'Cinzel'; font-size: 1rem; color: #fff;">Nenhum termo encontrado</p>
                    <p style="font-size: 0.75rem; margin-top: 5px;">Tente digitar outro termo ou mudar de categoria.</p>
                </div>
            `;return}e.innerHTML=o.map(t=>s`
            <div class="card glass-accent ref-card-glow" style="background: rgba(0,0,0,0.4); padding: 25px; border: 1px solid rgba(197, 160, 89, 0.15); border-top: 4px solid ${t.badgeColor}; border-radius: 16px; display: flex; flex-direction: column; justify-content: space-between; gap: 15px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); min-height: 200px; position:relative; overflow:hidden;">
                <div style="position:absolute; top:0; right:0; width:100px; height:100px; background:radial-gradient(circle at top right, ${t.badgeColor}22, transparent 70%); pointer-events:none;"></div>
                <div style="position:relative; z-index:1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 12px;">
                        <strong style="color: #fff; font-size: 1.15rem; font-family: 'Cinzel', serif; text-shadow: 0 0 10px rgba(255,255,255,0.1);">${t.name}</strong>
                        <span style="font-size: 0.6rem; padding: 4px 10px; border-radius: 8px; font-weight: 800; text-transform: uppercase; background: ${t.badgeColor}15; color: ${t.badgeColor}; border: 1px solid ${t.badgeColor}44; white-space: nowrap; box-shadow: 0 0 10px ${t.badgeColor}22;">
                            ${t.badgeText}
                        </span>
                    </div>
                    <p style="font-size: 0.85rem; line-height: 1.6; color: var(--text-dim); margin: 0;">${t.desc}</p>
                </div>
                <div style="display: flex; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; margin-top: auto; position:relative; z-index:1;">
                    <a href="${t.link}" target="_blank" class="tome-hover-glow" style="font-size: 0.75rem; color: var(--accent); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-weight: 700; opacity: 0.8;">
                        Ver no D&D Beyond [BR-2024] <i class="fa-solid fa-up-right-from-square"></i>
                    </a>
                </div>
            </div>
        `)}_renderGlossary2024(){return s`
            <div style="display:flex; flex-direction:column; gap:20px; height:100%; animation: fadeIn 0.4s ease-out;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid rgba(197,160,89,0.15); padding-bottom:15px; margin-bottom:5px;">
                    <div>
                        <h3 style="font-family:'Cinzel', serif; color:var(--accent); margin:0 0 8px 0; font-size:1.8rem; text-shadow:0 0 15px rgba(197,160,89,0.4);">
                            <i class="fa-solid fa-book-sparkles" style="margin-right:10px;"></i> Glossário de Regras D&D 2024
                        </h3>
                        <p style="font-size:0.9rem; color:var(--text-dim); margin:0; line-height:1.6; max-width:700px;">
                            Mecânicas, ações de combate, maestrias de armas e condições atualizadas na revisão de 2024.
                        </p>
                    </div>
                    <a href="https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary" target="_blank" class="btn btn-ghost btn-sm" style="font-size:0.75rem; border:1px solid rgba(197,160,89,0.3); color:var(--accent); text-decoration:none; display:inline-flex; align-items:center; gap:6px; border-radius:8px; padding:6px 12px; background:rgba(197,160,89,0.05);">
                        <i class="fa-solid fa-up-right-from-square"></i> D&D Beyond Oficial
                    </a>
                </div>

                <!-- Search and Filters -->
                <div class="glass-accent" style="padding: 20px; border-radius: 16px; background: rgba(0,0,0,0.3); border: 1px solid rgba(197,160,89,0.2); box-shadow:0 10px 25px rgba(0,0,0,0.3);">
                    <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                        <!-- Search Input -->
                        <div style="position: relative; flex: 1; min-width: 280px;">
                            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--accent); font-size: 1rem;"></i>
                            <input type="text" id="glossary-search-input" placeholder="Buscar regras e termos (ex: Agarrado, Vantagem...)" 
                                   value="${this._glossarySearch}"
                                   class="tome-input-focus"
                                   style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 10px; border: 1.5px solid rgba(197,160,89,0.3); background: rgba(8, 8, 10, 0.7); color: #fff; font-size: 0.9rem; outline: none; transition: all 0.3s;" />
                        </div>
                        <!-- Category Filters -->
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="glossary-filter-container">
                            ${this._renderGlossaryFilterBtn("all","✨ Tudo",this._glossaryFilter==="all")}
                            ${this._renderGlossaryFilterBtn("actions","⚔️ Ações",this._glossaryFilter==="actions")}
                            ${this._renderGlossaryFilterBtn("conditions","🩸 Condições",this._glossaryFilter==="conditions")}
                            ${this._renderGlossaryFilterBtn("masteries","🛡️ Maestrias",this._glossaryFilter==="masteries")}
                            ${this._renderGlossaryFilterBtn("rules","📜 Regras",this._glossaryFilter==="rules")}
                        </div>
                    </div>
                </div>

                <!-- Match stats -->
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-dim); padding: 0 5px;">
                    <span>Exibindo <strong id="glossary-count" style="color: var(--accent); font-size: 1rem;">0</strong> termos catalogados.</span>
                    <span style="display: inline-flex; align-items: center; gap: 6px; color: var(--success); font-weight: 700; text-shadow: 0 0 10px rgba(16,185,129,0.3);"><i class="fa-solid fa-circle-check"></i> 100% Sincronizado</span>
                </div>

                <!-- Terms grid -->
                <div id="glossary-terms-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 25px; max-height: 50vh; overflow-y: auto; padding-right: 15px; scrollbar-width: thin; margin-top: 5px;">
                    <!-- Rendered dynamically by _updateGlossaryList() -->
                </div>
            </div>
        `}_renderGlossaryFilterBtn(e,a,i){return s`
            <button class="btn btn-sm ${i?"active":""}" 
                    style="border-radius: 8px; padding: 8px 14px; font-size: 0.8rem; font-weight: 700; background: ${i?"rgba(197,160,89,0.2)":"rgba(0,0,0,0.4)"}; border: 1px solid ${i?"var(--accent)":"rgba(255,255,255,0.1)"}; color: ${i?"#fff":"var(--text-dim)"}; transition: all 0.2s;" 
                    data-action="setGlossaryFilter" data-category="${e}">
                ${a}
            </button>
        `}setSection(e,a){this._activeSection=a.dataset.section,this.render()}_buildSpellIndex(){const e=[];return f.cantrips&&f.cantrips.forEach(a=>e.push({...a,level:0})),f.spellsByLevel&&Object.entries(f.spellsByLevel).forEach(([a,i])=>{i.forEach(o=>e.push({...o,level:parseInt(a)}))}),e.sort((a,i)=>a.level!==i.level?a.level-i.level:a.name.localeCompare(i.name))}setMagicLevelFilter(e,a){e&&e.stopPropagation(),this._magicFilterLevel=a.dataset.level,this._updateMagicGlossaryList();const i=this.$("#magic-level-filter-container");i&&i.querySelectorAll("button").forEach(o=>{o.dataset.level===this._magicFilterLevel?(o.classList.remove("btn-ghost"),o.classList.add("btn-primary")):(o.classList.remove("btn-primary"),o.classList.add("btn-ghost"))})}_renderMagicGlossary(){const e=this._buildSpellIndex(),a=[...new Set(e.flatMap(t=>t.classes||[]))].sort(),i=this._activeMagicTab==="cantrips"?"Glossário de Truques":"Glossário de Magias",o=this._activeMagicTab==="cantrips"?"Consulta rápida e completa de truques (nível 0) D&D 5e.":"Consulta de magias arcanas, divinas e naturais de 1º a 5º círculo.";return s`
            <div style="display:flex; flex-direction:column; gap:20px; height:100%; animation: fadeIn 0.4s ease-out;">
                <!-- Header com Abas Premium -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom:2px solid rgba(168,85,247,0.15); padding-bottom:15px; margin-bottom:5px; flex-wrap: wrap; gap: 15px;">
                    <div>
                        <h3 style="font-family:'Cinzel', serif; color:#a855f7; margin:0; font-size:1.8rem; text-shadow:0 0 15px rgba(168,85,247,0.4);">
                            <i class="fa-solid fa-wand-magic-sparkles" style="margin-right:10px;"></i> ${i}
                        </h3>
                        <p style="font-size:0.85rem; color:var(--text-dim); margin:4px 0 0 0; line-height:1.4;">${o}</p>
                    </div>

                    <!-- ABAS DE SELEÇÃO DO GLOSSÁRIO MÁGICO -->
                    <div style="display: flex; gap: 8px; background: rgba(0,0,0,0.35); padding: 4px; border-radius: 10px; border: 1.5px solid rgba(168,85,247,0.25); box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);">
                        <button class="btn magic-tab-btn ${this._activeMagicTab==="cantrips"?"btn-primary":"btn-ghost"}" 
                                data-tab="cantrips" 
                                style="font-family: 'Cinzel'; font-size: 0.75rem; padding: 6px 12px; border: none; border-radius: 6px; display: flex; align-items: center; gap: 6px; color: ${this._activeMagicTab==="cantrips"?"#fff":"var(--text-dim)"}; background: ${this._activeMagicTab==="cantrips"?"#a855f7":"transparent"}; border-color: ${this._activeMagicTab==="cantrips"?"#a855f7":"transparent"};">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> TRUQUES
                        </button>
                        <button class="btn magic-tab-btn ${this._activeMagicTab==="spells"?"btn-primary":"btn-ghost"}" 
                                data-tab="spells" 
                                style="font-family: 'Cinzel'; font-size: 0.75rem; padding: 6px 12px; border: none; border-radius: 6px; display: flex; align-items: center; gap: 6px; color: ${this._activeMagicTab==="spells"?"#fff":"var(--text-dim)"}; background: ${this._activeMagicTab==="spells"?"#a855f7":"transparent"}; border-color: ${this._activeMagicTab==="spells"?"#a855f7":"transparent"};">
                            <i class="fa-solid fa-scroll"></i> MAGIAS
                        </button>
                    </div>
                </div>

                <!-- Search and Filters -->
                <div class="glass-accent" style="padding: 20px; border-radius: 16px; background: rgba(0,0,0,0.3); border: 1px solid rgba(168,85,247,0.2); box-shadow:0 10px 25px rgba(0,0,0,0.3);">
                    <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                        <!-- Search Input -->
                        <div style="position: relative; flex: 1; min-width: 280px;">
                            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #a855f7; font-size: 1rem;"></i>
                            <input type="text" id="magic-search-input" placeholder="Buscar magia ou truque (ex: Bola de Fogo, Rajada...)" 
                                   value="${this._magicSearch}"
                                   class="tome-input-focus"
                                   style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 10px; border: 1.5px solid rgba(168,85,247,0.3); background: rgba(8, 8, 10, 0.7); color: #fff; font-size: 0.9rem; outline: none; transition: all 0.3s;" />
                        </div>
                        
                        <!-- Class Filter -->
                        <div style="min-width: 160px;">
                            <select id="magic-class-filter" class="tome-input-focus" style="width:100%; padding: 14px; border-radius: 10px; border: 1.5px solid rgba(168,85,247,0.3); background: rgba(8, 8, 10, 0.7); color: #fff; font-size: 0.9rem; cursor:pointer; outline:none; transition: all 0.3s;">
                                <option value="all">Todas as Classes</option>
                                ${a.map(t=>s`<option value="${t}" ${this._magicFilterClass===t?"selected":""}>${t}</option>`)}
                            </select>
                        </div>

                        <!-- Level Filters (Apenas na aba de Magias) -->
                        ${this._activeMagicTab==="spells"?s`
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="magic-level-filter-container">
                            ${this._renderMagicFilterBtn("all","✨ Tudo",this._magicFilterLevel==="all")}
                            ${this._renderMagicFilterBtn("1","1º Círculo",this._magicFilterLevel==="1")}
                            ${this._renderMagicFilterBtn("2","2º Círculo",this._magicFilterLevel==="2")}
                            ${this._renderMagicFilterBtn("3","3º Círculo",this._magicFilterLevel==="3")}
                            ${this._renderMagicFilterBtn("4","4º Círculo",this._magicFilterLevel==="4")}
                            ${this._renderMagicFilterBtn("5","5º Círculo",this._magicFilterLevel==="5")}
                        </div>
                        `:""}
                    </div>
                </div>

                <!-- Match stats -->
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-dim); padding: 0 5px;">
                    <span>Exibindo <strong id="magic-count" style="color: #a855f7; font-size: 1rem;">0</strong> ${this._activeMagicTab==="cantrips"?"truques catalogados":"magias no grimório"}.</span>
                    <span style="display: inline-flex; align-items: center; gap: 6px; color: #a855f7; font-weight: 700; text-shadow: 0 0 10px rgba(168,85,247,0.3);"><i class="fa-solid fa-scroll"></i> Pergaminhos Vivos</span>
                </div>

                <!-- Terms grid -->
                <div id="magic-glossary-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; max-height: calc(100vh - 380px); min-height: 400px; overflow-y: auto; padding-right: 15px; scrollbar-width: thin; margin-top: 5px;">
                    <!-- Rendered dynamically by _updateMagicGlossaryList() -->
                </div>
            </div>
        `}_renderMagicFilterBtn(e,a,i){return s`
            <button class="btn btn-sm ${i?"active":""}" 
                    style="border-radius: 8px; padding: 8px 14px; font-size: 0.8rem; font-weight: 700; background: ${i?"rgba(168,85,247,0.2)":"rgba(0,0,0,0.4)"}; border: 1px solid ${i?"#a855f7":"rgba(255,255,255,0.1)"}; color: ${i?"#fff":"var(--text-dim)"}; transition: all 0.2s;" 
                    data-action="setMagicLevelFilter" data-level="${e}">
                ${a}
            </button>
        `}_updateMagicGlossaryList(){const e=this.$("#magic-glossary-list"),a=this.$("#magic-count");if(!e)return;const o=this._buildSpellIndex().filter(t=>{if(this._activeMagicTab==="cantrips"&&t.level!==0||this._activeMagicTab==="spells"&&t.level===0)return!1;const r=this._magicSearch.toLowerCase().trim(),n=!r||t.name.toLowerCase().includes(r)||t.englishName.toLowerCase().includes(r)||t.effect&&t.effect.toLowerCase().includes(r)||t.challenge&&t.challenge.toLowerCase().includes(r),l=this._magicFilterLevel==="all"||t.level.toString()===this._magicFilterLevel,d=this._magicFilterClass==="all"||t.classes&&t.classes.includes(this._magicFilterClass);return n&&l&&d});if(a&&(a.innerText=o.length),o.length===0){e.innerHTML=s`
                <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; color: var(--text-dim);">
                    <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 2.5rem; color: rgba(197,160,89,0.2); margin-bottom: 15px;"></i>
                    <p style="font-family: 'Cinzel'; font-size: 1rem; color: #fff;">Nenhuma magia ou truque encontrado</p>
                    <p style="font-size: 0.75rem; margin-top: 5px;">Tente digitar outro termo ou mudar o filtro.</p>
                </div>
            `;return}e.innerHTML=o.map(t=>this._renderMagicCard(t)),this._bindMagicCardEvents()}_renderPlayersWithSpell(e){var t,r;const a=((r=(t=this.store)==null?void 0:t.state)==null?void 0:r.players)||[],i=(n,l)=>{const d=n.toLowerCase().trim();if(!d)return!1;const p=l.name.toLowerCase().trim(),c=l.englishName?l.englishName.toLowerCase().trim():"";return d===p||c&&d===c||d.includes(p)||c&&d.includes(c)||p.includes(d)||c&&c.includes(d)},o=a.filter(n=>Object.values(n.spells||{}).some(l=>(l||"").split(`
`).some(d=>i(d,e))));return o.length===0?s`
                <div style="font-size: 0.68rem; color: var(--text-dim); padding: 6px 10px; background: rgba(255,255,255,0.01); border-radius: 6px; border: 1px dashed rgba(168, 85, 247, 0.2); text-align: center; width: 100%;">
                    Nenhum jogador possui registrado na ficha.
                </div>
            `:s`
            <div style="display: flex; flex-wrap: wrap; gap: 6px; width: 100%;">
                ${o.map(n=>{const l=n.portraitData?`background-image: url('${n.portraitData}')`:"background-color: var(--accent)",d=n.portraitData?"":s`<span style="font-size: 0.58rem; font-weight: bold; color: #000;">${n.name.substring(0,2).toUpperCase()}</span>`;return s`
                        <div class="player-pill" style="display: flex; align-items: center; gap: 6px; background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); padding: 3px 8px; border-radius: 12px; font-size: 0.72rem; color: #fff;">
                            <div style="width: 14px; height: 14px; border-radius: 50%; ${l}; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.15);">
                                ${d}
                            </div>
                            <span style="font-weight: 500; font-size: 0.68rem;">${n.name}</span>
                        </div>
                    `})}
            </div>
        `}_renderPlayersWithSpellMini(e){var t,r;const a=((r=(t=this.store)==null?void 0:t.state)==null?void 0:r.players)||[],i=(n,l)=>{const d=n.toLowerCase().trim();if(!d)return!1;const p=l.name.toLowerCase().trim(),c=l.englishName?l.englishName.toLowerCase().trim():"";return d===p||c&&d===c||d.includes(p)||c&&d.includes(c)||p.includes(d)||c&&c.includes(d)},o=a.filter(n=>Object.values(n.spells||{}).some(l=>(l||"").split(`
`).some(d=>i(d,e))));return o.length===0?s`<span style="font-size: 0.65rem; color: var(--text-dim); font-style: italic;">Nenhum</span>`:s`
            <div style="display: flex; gap: -4px; flex-wrap: wrap; justify-content: flex-end;">
                ${o.map(n=>{const l=n.portraitData?`background-image: url('${n.portraitData}')`:"background-color: var(--accent)",d=n.portraitData?"":s`<span style="font-size: 0.5rem; font-weight: 800; color: #000;">${n.name.substring(0,2).toUpperCase()}</span>`;return s`
                        <div title="${n.name}" class="player-mini-avatar" style="width: 18px; height: 18px; border-radius: 50%; ${l}; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-left: -4px;">
                            ${d}
                        </div>
                    `})}
            </div>
        `}_renderMagicCard(e){const a=e.level===0,o={dano:"⚔️",controle:"🔗",utilidade:"✨",cura:"🏥"}[e.type]||"📜",t=e.type==="dano"||e.baseDamage;let r="197, 160, 89";return a?r="34, 197, 94":t?r="239, 68, 68":r="168, 85, 247",s`
            <div class="card spell-card tome-hover-card" 
                 style="padding: 18px; border-radius: 14px; border: 1.5px solid rgba(${r}, 0.2); cursor: pointer; background: rgba(10,12,16,0.7); display:flex; flex-direction:column; justify-content:space-between; min-height:190px; position:relative; overflow:hidden;"
                 data-action="toggleMagicPopup"
                 data-spell-id="${e.id}">
                <div style="position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg, transparent, rgba(${r}, 0.5), transparent);"></div>
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
                        <strong style="color: #fff; font-size: 0.98rem; font-family: 'Cinzel', serif; text-shadow:0 0 8px rgba(255,255,255,0.1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75%;">${o} ${e.name}</strong>
                        <span style="font-size: 0.55rem; padding: 3px 6px; border-radius: 6px; font-weight: 800; text-transform: uppercase; background: rgba(${r}, 0.1); color: rgb(${r}); border: 1px solid rgba(${r}, 0.3);">
                            ${a?"Truque":`${e.level}º Círc.`}
                        </span>
                    </div>
                    <p style="font-size: 0.78rem; line-height: 1.45; color: var(--text-dim); margin: 0 0 10px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.85em; opacity: 0.9;">
                        ${e.challenge||e.effect||"Efeito utilitário arcano."}
                    </p>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: auto; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
                    <!-- Conjuradores Vinculados -->
                    <div style="display: flex; justify-content: space-between; align-items: center; height: 20px;">
                        <span style="font-size: 0.65rem; color: var(--text-dim); display: flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-users" style="color: rgba(${r}, 0.8);"></i> Conjuradores:
                        </span>
                        ${this._renderPlayersWithSpellMini(e)}
                    </div>
                    
                    <!-- Footer Info -->
                    <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--text-dim);">
                        <span style="display:flex; align-items:center; gap:5px;"><i class="fa-regular fa-clock" style="color:rgba(${r}, 0.8);"></i> ${e.actionType==="bonusAction"?"Ação Bônus":e.actionType==="reaction"?"Reação":"Ação"}</span>
                        <span style="display:flex; align-items:center; gap:5px;"><i class="fa-solid fa-arrows-left-right" style="color:rgba(${r}, 0.8);"></i> ${e.range||"-"}</span>
                    </div>
                </div>
            </div>
        `}_bindMagicCardEvents(){this.$$(".spell-card").forEach(a=>{const i=a.dataset.spellId,o=this._buildSpellIndex().find(t=>t.id===i);o&&(this.listen(a,"mouseenter",()=>{this._popupMode!=="click"&&(this._hoverTimer=setTimeout(()=>{this._playMagicWhisperSound(),this._activePopupSpell=o,this._popupMode="hover";const t=a.getBoundingClientRect();let r=t.right+12;r+380>window.innerWidth&&(r=t.left-392),r<10&&(r=10);let n=t.top;n+350>window.innerHeight&&(n=window.innerHeight-360),n<10&&(n=10),this._popupPosition={x:r,y:n},this.render()},1e3))}),this.listen(a,"mouseleave",()=>{this._hoverTimer&&(clearTimeout(this._hoverTimer),this._hoverTimer=null),this._popupMode==="hover"&&(this._activePopupSpell=null,this._popupMode=null,this.render())}))})}toggleMagicPopup(e,a){e&&e.stopPropagation();const i=a.dataset.spellId,o=this._buildSpellIndex().find(t=>t.id===i);if(o){if(this._hoverTimer&&(clearTimeout(this._hoverTimer),this._hoverTimer=null),this._playMagicWhisperSound(),this._activePopupSpell&&this._activePopupSpell.id===o.id&&this._popupMode==="click")this._activePopupSpell=null,this._popupMode=null;else{this._activePopupSpell=o,this._popupMode="click";const t=a.getBoundingClientRect();let r=t.right+12;r+380>window.innerWidth&&(r=t.left-392),r<10&&(r=10);let n=t.top;n+350>window.innerHeight&&(n=window.innerHeight-360),n<10&&(n=10),this._popupPosition={x:r,y:n}}this.render()}}closeMagicPopup(e){e&&e.stopPropagation(),this._activePopupSpell=null,this._popupMode=null,this.render()}viewFullSpell(e,a){e&&e.stopPropagation();const i=a.dataset.spellId;this.store.update(o=>{o.activeTab="spellbook"}),setTimeout(()=>{const o=document.querySelector("#view-content");if(o&&o.__component){const t=o.__component._activeChild;if(t&&typeof t.selectSpell=="function"){const r=document.createElement("div");r.dataset.spellId=i,t.selectSpell(null,r)}}},100),this._activePopupSpell=null,this._popupMode=null,this.render()}_playMagicWhisperSound(){try{const e=window.AudioContext||window.webkitAudioContext;if(!e)return;const a=new e,i=a.createOscillator(),o=a.createOscillator();i.type="triangle",i.frequency.setValueAtTime(392,a.currentTime),i.frequency.exponentialRampToValueAtTime(784,a.currentTime+.4),o.type="sine",o.frequency.setValueAtTime(493.88,a.currentTime),o.frequency.exponentialRampToValueAtTime(987.77,a.currentTime+.5);const t=a.createBiquadFilter();t.type="lowpass",t.frequency.setValueAtTime(1e3,a.currentTime),t.frequency.exponentialRampToValueAtTime(300,a.currentTime+.5);const r=a.createGain();r.gain.setValueAtTime(.001,a.currentTime),r.gain.linearRampToValueAtTime(.06,a.currentTime+.08),r.gain.exponentialRampToValueAtTime(.001,a.currentTime+.6),i.connect(t),o.connect(t),t.connect(r),r.connect(a.destination),i.start(a.currentTime),o.start(a.currentTime),i.stop(a.currentTime+.6),o.stop(a.currentTime+.6)}catch(e){console.warn("[Audio] Sussurro mágico falhou:",e)}}_getSpellPopupHTML(e){const a=e.level===0,i=a?"TRUQUE":`${e.level}º CÍRCULO`,o=e.classes&&e.classes[0]?e.classes[0]:"Conjurador";let t="Carisma";["Clérigo","Druida","Ranger"].includes(o)?t="Sabedoria":["Mago","Artífice"].includes(o)&&(t="Inteligência");let r="Ação";e.actionType==="bonusAction"?r="Ação Bônus":e.actionType==="reaction"&&(r="Reação");const n=e.components?e.components.join("/"):"V/S",l=e.concentration?"Sim":"Não",d={dano:"fa-fire-flame-curved",controle:"fa-hands-bound",utilidade:"fa-wand-magic-sparkles",cura:"fa-heart-pulse"},p={dano:"#ef4444",controle:"#3b82f6",utilidade:"#a855f7",cura:"#22c55e"},c=d[e.type]||"fa-scroll",b=p[e.type]||"var(--accent)";let m="";if(e.savingThrow){const v={DEX:"Destreza",WIS:"Sabedoria",CON:"Constituição",INT:"Inteligência",STR:"Força",CHA:"Carisma"}[e.savingThrow]||e.savingThrow;m=s`
                <div style="font-size: 0.72rem; line-height: 1.4; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px; font-family: 'Cinzel', serif;">SALVAGUARDA (Inimigo Rola)</div>
                    <div style="color: var(--text-dim); margin-bottom: 3px;">CD da Magia contra o alvo:</div>
                    <div style="font-family: 'JetBrains Mono', monospace; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; margin: 4px 0; color: #fff; border: 1px solid rgba(255,255,255,0.05); text-align: center; font-weight: bold;">
                        CD = 8 + Bônus Proficiência + Mod. ${t}
                    </div>
                    <div style="font-size: 0.68rem; color: var(--text-dim); margin-top: 4px;">
                        • Oponente rola salvaguarda de <strong>${v}</strong><br />
                        • Sucesso parcial: Metade do dano ou anula o efeito.
                    </div>
                </div>
            `}else e.baseDamage||e.type==="dano"?m=s`
                <div style="font-size: 0.72rem; line-height: 1.4; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px; font-family: 'Cinzel', serif;">ATAQUE MÁGICO (Você Rola)</div>
                    <div style="color: var(--text-dim); margin-bottom: 3px;">Jogada de ataque com d20:</div>
                    <div style="font-family: 'JetBrains Mono', monospace; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; margin: 4px 0; color: #fff; border: 1px solid rgba(255,255,255,0.05); text-align: center; font-weight: bold;">
                        Mod. de Ataque = Bônus Proficiência + Mod. ${t}
                    </div>
                    <div style="font-size: 0.68rem; color: var(--text-dim); margin-top: 4px;">
                        • Role 1d20 + Modificador de Ataque.<br />
                        • O ataque atinge se o total for <strong>&ge; CA</strong> do alvo.
                    </div>
                </div>
            `:m=s`
                <div style="font-size: 0.72rem; line-height: 1.4; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px; font-family: 'Cinzel', serif;">EFEITO AUTOMÁTICO</div>
                    <div style="font-size: 0.68rem; color: var(--text-dim); margin-top: 4px;">
                        • Não requer jogada de ataque ou teste de salvaguarda do oponente.<br />
                        • O efeito ou cura ocorre instantaneamente no alvo ou área selecionada.
                    </div>
                </div>
            `;const x=e.challenge||e.effect||"Efeito mágico sob comando do conjurador.";let g="";e.baseDamage?(g=s`<span style="font-size: 1.1rem; font-weight: 800; color: #fff; font-family: 'Cinzel', serif;">${e.baseDamage}</span> <span style="font-size: 0.8rem; font-weight: 600; color: ${b};">${e.damageType||""}</span>`,e.scaling&&!a?g+=s` <span style="font-size: 0.65rem; color: var(--text-dim); display: block; margin-top: 2px;">(+1d6 por nível de slot acima)</span>`:e.scaling&&a&&(g+=s` <span style="font-size: 0.65rem; color: var(--text-dim); display: block; margin-top: 2px;">(dano aumenta nos níveis 5, 11 e 17)</span>`)):g=s`<span style="font-size: 0.75rem; color: var(--text-main); font-weight: 500;">${e.effect||"Efeito imediato benéfico ou utilitário."}</span>`;let u=x;return u.length>180&&(u=u.substring(0,177)+"..."),s`
            <div style="display: flex; flex-direction: column; gap: 12px; position: relative;">
                <!-- Header Title -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1rem; color: ${b}; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);">
                            <i class="fa-solid ${c}"></i>
                        </span>
                        <div>
                            <h4 style="font-family: 'Cinzel', serif; font-size: 0.95rem; font-weight: 800; color: #fff; margin: 0; text-shadow: 0 0 10px rgba(255,255,255,0.1);">${e.name.toUpperCase()}</h4>
                            <span style="font-size: 0.6rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px;">${e.englishName}</span>
                        </div>
                    </div>
                    <span class="badge" style="background: ${a?"rgba(34, 197, 94, 0.1)":"rgba(59, 130, 246, 0.1)"}; border: 1px solid ${a?"rgba(34, 197, 94, 0.3)":"rgba(59, 130, 246, 0.3)"}; color: ${a?"#86efac":"#93c5fd"}; font-size: 0.6rem; padding: 2px 8px; border-radius: 4px;">
                        ${i}
                    </span>
                </div>

                <!-- Specs Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: rgba(0,0,0,0.15); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.02); font-size: 0.72rem;">
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-regular fa-clock" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Execução: <strong style="color: #fff;">${r}</strong></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-solid fa-arrows-left-right" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Alcance: <strong style="color: #fff;">${e.range||"-"}</strong></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-solid fa-flask" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Componentes: <strong style="color: #fff;">${n}</strong></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-solid fa-brain" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Conc.: <strong style="color: #fff;">${l}</strong></span>
                    </div>
                </div>

                <!-- Description -->
                <div style="background: rgba(255, 255, 255, 0.015); border-left: 2.5px solid ${b}; padding: 8px 12px; border-radius: 0 6px 6px 0; font-size: 0.72rem; line-height: 1.45; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--text-dim); font-size: 0.65rem; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">Como funciona:</div>
                    ${u}
                </div>

                <!-- Test calculation box -->
                <div style="background: rgba(255,255,255,0.02); border: 1.5px solid rgba(197, 160, 89, 0.15); padding: 12px; border-radius: 8px;">
                    ${m}
                </div>

                <!-- CONJURADORES VINCULADOS EM POPUP -->
                <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px; margin-top: 2px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 0.65rem; color: var(--accent); font-weight: 700; margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
                        <i class="fa-solid fa-users"></i> Conjuradores Vinculados
                    </div>
                    ${this._renderPlayersWithSpell(e)}
                </div>

                <!-- Dano / Efeito box -->
                <div style="background: rgba(197, 160, 89, 0.05); border: 1.5px dashed rgba(197, 160, 89, 0.3); padding: 10px 12px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: var(--accent); font-size: 0.95rem; display: inline-flex;">
                            <i class="fa-solid fa-dice-d20"></i>
                        </span>
                        <div style="font-size: 0.65rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Dano / Efeito:</div>
                    </div>
                    <div style="text-align: right;">
                        ${g}
                    </div>
                </div>
            </div>
            
            ${this._popupMode==="click"?s`
                <button class="btn btn-ghost" style="position: absolute; top: 12px; right: 12px; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px; z-index: 10; border: none; background: transparent; color: var(--text-dim); cursor: pointer;" data-action="closeMagicPopup">✕</button>
                <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; border-top: 1.5px solid rgba(255, 255, 255, 0.08); padding-top: 10px;">
                    <button class="btn btn-ghost" style="padding: 5px 12px; font-size: 0.68rem; border-radius: 6px; border: 1px solid rgba(197, 160, 89, 0.35); color: var(--accent); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; background: rgba(197,160,89,0.05);" data-action="viewFullSpell" data-spell-id="${e.id}" data-spell-name="${e.name}">
                        <i class="fa-solid fa-expand" style="font-size: 0.65rem;"></i> Ficha Completa
                    </button>
                </div>
            `:""}
        `}}export{M as QuickReference};
