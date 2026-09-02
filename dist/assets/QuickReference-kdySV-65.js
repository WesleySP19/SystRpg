import{d as r,A as x}from"./FXEngine-BKbXWGrS.js";import{u as F,m as a}from"./Boot-DN86Mwoy.js";import{s as g}from"./spells-5e-BHNeu1cc.js";import"./main-BRSZG_k_.js";import"./tailwind-DzD115ic.js";function te(O){var u;F();const[f,G]=r("quickref"),[b,V]=r(""),[p,B]=r("all"),[v,L]=r(""),[d,N]=r("all"),[y,_]=r("all"),[i,U]=r("spells");x(null);const[H,Q]=r(null),[J,Y]=r(null),[K,W]=r({x:0,y:0});x(null);const[,X]=r(0);(u=window.TOME)!=null&&u.store;function h(){return a`
            <div class="page p-5 max-w-7xl mx-auto animate-fadeIn">
                <!-- Header Premium -->
                <div class="border-b-2 border-accent/20 pb-5 mb-6 flex justify-between items-end relative">
                    <div>
                        <h2 class="font-cinzel text-accent text-3xl mb-2 flex items-center gap-3">
                            <i class="fa-solid fa-book-sparkles text-amber-500"></i> Tomo de Regras D&D 5e
                        </h2>
                        <p class="text-slate-400 text-sm">Compilação de regras de referência rápida, ações, condições e glossário do mestre.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
                    <!-- NAVIGATION MENU PREMIUM -->
                    <div class="card glass-accent p-4 flex flex-col gap-2 rounded-2xl">
                        <div class="font-cinzel text-xs text-slate-400 tracking-widest font-bold px-2 py-1">
                            TOMOS DE SABEDORIA
                        </div>
                        ${n("quickref","fa-compass","Guia Rápido D&D 5e","255, 170, 0")}
                        ${n("glossary2024","fa-book-sparkles","Glossário D&D 2024","197, 160, 89")}
                        ${n("magicglossary","fa-wand-magic-sparkles","Glossário Mágico","168, 85, 247")}
                        ${n("conditions","fa-skull-crossbones","Condições de Status","239, 68, 68")}
                        ${n("actions","fa-swords","Ações de Turno","59, 130, 246")}
                        ${n("environment","fa-mountain-sun","Ambiente & Movimento","34, 197, 94")}
                        ${n("spellcasting","fa-hat-wizard","Regras de Magia","245, 158, 11")}
                        ${n("resting","fa-campground","Descansos & Cura","255, 215, 0")}
                        ${n("dc","fa-bullseye","Dificuldades (CD)","197, 160, 89")}
                        ${n("abbreviations","fa-language","Dicionário do Mestre","255, 255, 255")}
                    </div>

                    <!-- CONTENT AREA PREMIUM -->
                    <div class="card glass-accent min-h-[75vh] p-6 rounded-2xl relative overflow-hidden">
                        ${z()}
                    </div>
                </div>
            </div>
        `}function n(s,e,o,l){const t=f===s,j=t?`rgba(${l}, 0.15)`:"rgba(0, 0, 0, 0.4)",T=t?`1px solid rgba(${l}, 0.5)`:"1px solid transparent",P=t?"#fff":"var(--text-dim)",I=t?`0 0 20px rgba(${l}, 0.3)`:"none";return a`
            <button class="btn btn-sm tome-nav-btn ${t?"active":""}" 
                    style="justify-content:flex-start; text-align:left; border-radius:10px; padding: 12px 15px; background: ${j}; border: ${T}; color: ${P}; box-shadow: ${I}; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;" 
                    data-action="setSection" data-section="${s}">
                ${t?a`<div style="position:absolute; left:0; top:0; bottom:0; width:3px; background:rgb(${l}); box-shadow:0 0 10px rgb(${l});"></div>`:""}
                <i class="fa-solid ${e}" style="width:24px; text-align:center; margin-right:10px; font-size:1.1rem; color:rgb(${l}); transition:transform 0.3s; filter: ${t?"drop-shadow(0 0 5px rgb("+l+"))":"none"};"></i>
                <span style="font-weight: ${t?"700":"500"}; letter-spacing: 0.5px; font-size: 0.85rem;">${o}</span>
            </button>
        `}function z(){switch(f){case"quickref":return S();case"glossary2024":return q();case"magicglossary":return R();case"conditions":return w();case"actions":return C();case"environment":return $();case"spellcasting":return D();case"resting":return k();case"dc":return A();case"abbreviations":return M();default:return""}}function w(){return a`
            <div style="animation: fadeIn 0.4s ease-out;">
                <h3 style="font-family:'Cinzel', serif; color:var(--danger); margin-bottom:15px; font-size:1.8rem; text-shadow:0 0 15px rgba(239,68,68,0.4);">
                    <i class="fa-solid fa-skull-crossbones" style="margin-right:10px;"></i> Condições de Status
                </h3>
                <p style="font-size:0.9rem; color:var(--text-dim); margin-bottom:30px; line-height:1.6;">Efeitos mágicos, armadilhas ou ferimentos de combate que alteram temporariamente as capacidades físicas ou mentais dos heróis e monstros.</p>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px;">
                    <!-- Left: List -->
                    <div style="display:flex; flex-direction:column; gap:15px; max-height:60vh; overflow-y:auto; padding-right:15px; scrollbar-width:thin;">
                        ${[{name:"Caído (Prone)",icon:"fa-person-falling",effect:"Movimento apenas rastejando (dobro do custo). Jogadas de ataque contra a criatura têm Vantagem a 1.5m e Desvantagem para ataques à distância."},{name:"Cego (Blinded)",icon:"fa-eye-slash",effect:"Falha automática em testes que requerem visão. Jogadas de ataque contra o cego têm Vantagem, e os ataques dele têm Desvantagem."},{name:"Envenenado (Poisoned)",icon:"fa-skull-crossbones",effect:"A criatura sente náuseas intensas e tremores. Tem Desvantagem em todas as jogadas de ataque e testes de habilidade."},{name:"Enfeitiçado (Charmed)",icon:"fa-heart",effect:"Não pode atacar o conjurador do feitiço. O conjurador tem Vantagem em testes de interação social com a criatura."},{name:"Agarrado (Grappled)",icon:"fa-hand-back-fist",effect:"Deslocamento da criatura torna-se 0. O agarrador pode arrastá-la consigo pela metade do seu próprio deslocamento."},{name:"Incapacitado",icon:"fa-ban",effect:"A criatura perde o controle motor ou foco mental imediato. Não pode realizar nenhuma ação ou reação sob nenhuma hipótese."},{name:"Invisível",icon:"fa-ghost",effect:"Impossível de ser visto a olho nu (mas faz barulho e deixa pegadas). Ataques contra ela têm Desvantagem; ataques dela têm Vantagem."},{name:"Paralisado",icon:"fa-bolt",effect:"Incapacitada e incapaz de se mover ou falar. Falha em testes de FOR/DES. Qualquer ataque feito a 1.5m é um Golpe Crítico Automático."},{name:"Petrificado",icon:"fa-gem",effect:"Transformada em pedra sólida. Peso multiplicado por 10. Imune a venenos e doenças, e tem Resistência a todo tipo de dano físico."},{name:"Ensurdecido (Deafened)",icon:"fa-ear-slash",effect:"Falha automática em testes de audição. Não ouve comandos e está imune a efeitos mágicos baseados em som."}].map(e=>a`
                            <div class="glass card-hover ref-card-red" style="padding:18px; border-radius:12px; border:1px solid rgba(255,255,255,0.05); border-left:4px solid var(--danger); background:rgba(0,0,0,0.3); position:relative; overflow:hidden;">
                                <div style="display:flex; align-items:center; gap:12px; font-weight:800; color:#fff; font-size:1.1rem; font-family:'Cinzel', serif; margin-bottom:8px;">
                                    <div style="width:32px; height:32px; border-radius:8px; background:rgba(239,68,68,0.15); color:var(--danger); display:flex; align-items:center; justify-content:center;">
                                        <i class="fa-solid ${e.icon}" style="font-size:1rem;"></i>
                                    </div>
                                    ${e.name}
                                </div>
                                <p style="font-size:0.8rem; line-height:1.6; color:var(--text-dim); margin:0;">${e.effect}</p>
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
        `}function C(){return a`
            <div style="animation: fadeIn 0.4s ease-out;">
                <h3 style="font-family:'Cinzel', serif; color:var(--info); margin-bottom:15px; font-size:1.8rem; text-shadow:0 0 15px rgba(59,130,246,0.4);">
                    <i class="fa-solid fa-swords" style="margin-right:10px;"></i> Ações no Turno de Combate
                </h3>
                <p style="font-size:0.9rem; color:var(--text-dim); margin-bottom:30px; line-height:1.6;">Em um combate de D&D, seu turno tático é composto por <strong>Movimento</strong>, <strong>1 Ação</strong>, <strong>1 Reação</strong> (fora do turno) e <strong>1 Ação Bônus</strong> (se aplicável).</p>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px; max-height:60vh; overflow-y:auto; padding-right:15px; scrollbar-width:thin;">
                    ${[{name:"Atacar (Attack)",cost:"Ação",desc:"Realiza um ataque corpo-a-corpo ou à distância com armas ou magias."},{name:"Conjurar Magia",cost:"Varie",desc:"Conjura uma magia cujo tempo de conjuração seja 1 ação (ou ação bônus se permitido)."},{name:"Correr (Dash)",cost:"Ação",desc:"Ganha deslocamento extra igual ao seu deslocamento máximo na rodada atual."},{name:"Desengajar",cost:"Ação",desc:"Seu movimento não provoca nenhum ataque de oportunidade até o final da rodada."},{name:"Esquivar (Dodge)",cost:"Ação",desc:"Até o início do seu próximo turno, ataques contra você têm Desvantagem e seus testes de Destreza têm Vantagem."},{name:"Ajudar (Help)",cost:"Ação",desc:"Concede Vantagem ao teste de habilidade de um aliado ou na primeira jogada de ataque dele contra um monstro."},{name:"Esconder (Hide)",cost:"Ação",desc:"Faz um teste de Destreza (Furtividade) para sumir do campo de visão de inimigos (requer cobertura)."},{name:"Preparar (Ready)",cost:"Ação",desc:"Escolhe um gatilho. Se o gatilho acontecer antes do seu próximo turno, você usa sua Reação para agir."},{name:"Usar Objeto",cost:"Ação",desc:"Interage com um segundo objeto complexo na mesma rodada (beber poção, abrir baú chaveado, etc)."}].map(e=>a`
                        <div class="card glass-accent ref-card-blue" style="background:rgba(0,0,0,0.4); padding:20px; border:1px solid rgba(59,130,246,0.15); border-left:4px solid var(--info); border-radius:12px; position:relative; overflow:hidden;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                <strong style="color:#fff; font-size:1.1rem; font-family:'Cinzel', serif;">${e.name}</strong>
                                <span class="badge" style="font-size:0.65rem; padding:4px 8px; border-radius:6px; background:rgba(59,130,246,0.2); color:#93c5fd; border:1px solid rgba(59,130,246,0.3); font-weight:800; letter-spacing:0.5px;">${e.cost}</span>
                            </div>
                            <p style="font-size:0.85rem; line-height:1.5; color:var(--text-dim); margin:0;">${e.desc}</p>
                        </div>
                    `)}
                </div>
            </div>
        `}function $(){return a`
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
        `}function D(){return a`
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
        `}function k(){return a`
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
        `}function A(){return a`
            <div style="animation: fadeIn 0.4s ease-out;">
                <h3 style="font-family:'Cinzel', serif; color:var(--accent); margin-bottom:15px; font-size:1.8rem; text-shadow:0 0 15px rgba(197,160,89,0.4);">
                    <i class="fa-solid fa-bullseye" style="margin-right:10px;"></i> Escala de Classes de Dificuldade (CD)
                </h3>
                <p style="font-size:0.9rem; color:var(--text-dim); margin-bottom:30px; line-height:1.6;">A Classe de Dificuldade (DC) determina o quão heróico ou excepcional deve ser o esforço de um personagem para realizar um teste de atributo e ter sucesso na história.</p>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap:20px; max-height:60vh; overflow-y:auto; padding-right:15px; scrollbar-width:thin;">
                    ${[{val:5,level:"Muito Fácil",example:"Arrombar uma porta de madeira velha e podre."},{val:10,level:"Fácil",example:"Ouvir uma conversa abafada atrás de uma porta comum."},{val:15,level:"Médio",example:"Escalar uma parede de pedra molhada com poucos apoios."},{val:20,level:"Difícil",example:"Decifrar um manuscrito antigo em dialeto morto."},{val:25,level:"Muito Difícil",example:"Saltar um desfiladeiro ventoso de 6 metros."},{val:30,level:"Quase Impossível",example:"Rastrear um assassino na lama sob tempestade torrencial."}].map(e=>a`
                        <div class="glass card-hover ref-card-gold" style="display:flex; align-items:center; gap:25px; padding:20px; background:rgba(0,0,0,0.3); border:1px solid rgba(197,160,89,0.1); border-radius:12px; position:relative;">
                            <div style="width:60px; height:60px; border-radius:12px; background:linear-gradient(135deg, rgba(197,160,89,0.2), rgba(255,170,0,0.1)); color:var(--accent); border:1px solid rgba(197,160,89,0.4); display:flex; align-items:center; justify-content:center; font-weight:900; font-family:'Cinzel', serif; font-size:1.5rem; box-shadow:0 0 15px rgba(197,160,89,0.1); flex-shrink:0;">
                                ${e.val}
                            </div>
                            <div style="flex:1;">
                                <div style="font-weight:800; font-size:1.1rem; color:#fff; font-family:'Cinzel', serif; letter-spacing:0.5px; margin-bottom:4px;">${e.level}</div>
                                <div style="font-size:0.85rem; color:var(--text-dim); line-height:1.4;"><em>Ex: ${e.example}</em></div>
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `}function M(){return a`
            <div style="animation: fadeIn 0.4s ease-out;">
                <h3 style="font-family:'Cinzel', serif; color:#fff; margin-bottom:15px; font-size:1.8rem; text-shadow:0 0 15px rgba(255,255,255,0.3);">
                    <i class="fa-solid fa-language" style="margin-right:10px;"></i> Dicionário de Termos e Siglas
                </h3>
                <p style="font-size:0.9rem; color:var(--text-dim); margin-bottom:30px; line-height:1.6;">Lista de siglas, definições rápidas e convenções mais comuns usadas pelas regras oficiais de D&D 5e e presentes nas fichas.</p>
                
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:20px; max-height:60vh; overflow-y:auto; padding-right:15px; scrollbar-width:thin;">
                    ${[{s:"CA / AC",m:"Classe de Armadura. O valor numérico que um ataque inimigo deve igualar ou superar para desferir um golpe físico com sucesso."},{s:"CD / DC",m:"Classe de Dificuldade. A meta numérica a ser atingida em testes de perícia ou testes de resistência."},{s:"PV / HP",m:"Pontos de Vida. Representação abstrata da vitalidade e da integridade física de uma criatura."},{s:"TR / ST",m:"Teste de Resistência (Saving Throw). Teste reativo feito para evitar ou reduzir os efeitos nocivos de magias ou perigos."},{s:"Vantagem",m:"Role dois dados d20 no teste e utilize o maior resultado obtido para somar seus modificadores."},{s:"Desvantagem",m:"Role dois dados d20 no teste e utilize o menor resultado obtido para somar seus modificadores."},{s:"Surpresa",m:"Inimigos pegos de surpresa não se movem, não executam ações na 1ª rodada e não podem usar reações."},{s:"Ataque de Oportunidade",m:"Uso de uma Reação para desferir um ataque físico em um oponente que sai do seu alcance de combate corpo-a-corpo."},{s:"Ação Bônus",m:"Uma ação extra menor concedida por magias, talentos especiais ou características de classe específicas."},{s:"ND / CR",m:"Nível de Desafio. Métrica indicadora do poder relativo de monstros para equilibrar encontros de combate tático."}].map(e=>a`
                        <div class="glass card-hover ref-card-gold" style="padding:20px; border-radius:12px; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); position:relative;">
                            <strong style="color:var(--accent); font-family:'Cinzel', serif; font-size:1.1rem; display:block; margin-bottom:8px; text-shadow:0 0 8px rgba(197,160,89,0.3);">${e.s}</strong>
                            <p style="font-size:0.85rem; color:var(--text-dim); line-height:1.6; margin:0;">${e.m}</p>
                        </div>
                    `)}
                </div>
            </div>
        `}function S(){return a`
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
        `}function q(){return a`
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
                                   value="${b}"
                                   class="tome-input-focus"
                                   style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 10px; border: 1.5px solid rgba(197,160,89,0.3); background: rgba(8, 8, 10, 0.7); color: #fff; font-size: 0.9rem; outline: none; transition: all 0.3s;" />
                        </div>
                        <!-- Category Filters -->
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="glossary-filter-container">
                            ${m("all","✨ Tudo",p==="all")}
                            ${m("actions","⚔️ Ações",p==="actions")}
                            ${m("conditions","🩸 Condições",p==="conditions")}
                            ${m("masteries","🛡️ Maestrias",p==="masteries")}
                            ${m("rules","📜 Regras",p==="rules")}
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
        `}function m(s,e,o){return a`
            <button class="btn btn-sm ${o?"active":""}" 
                    style="border-radius: 8px; padding: 8px 14px; font-size: 0.8rem; font-weight: 700; background: ${o?"rgba(197,160,89,0.2)":"rgba(0,0,0,0.4)"}; border: 1px solid ${o?"var(--accent)":"rgba(255,255,255,0.1)"}; color: ${o?"#fff":"var(--text-dim)"}; transition: all 0.2s;" 
                    data-action="setGlossaryFilter" data-category="${s}">
                ${e}
            </button>
        `}function E(){const s=[];return g.cantrips&&g.cantrips.forEach(e=>s.push({...e,level:0})),g.spellsByLevel&&Object.entries(g.spellsByLevel).forEach(([e,o])=>{o.forEach(l=>s.push({...l,level:parseInt(e)}))}),s.sort((e,o)=>e.level!==o.level?e.level-o.level:e.name.localeCompare(o.name))}function R(){const s=E(),e=[...new Set(s.flatMap(t=>t.classes||[]))].sort();return a`
            <div style="display:flex; flex-direction:column; gap:20px; height:100%; animation: fadeIn 0.4s ease-out;">
                <!-- Header com Abas Premium -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom:2px solid rgba(168,85,247,0.15); padding-bottom:15px; margin-bottom:5px; flex-wrap: wrap; gap: 15px;">
                    <div>
                        <h3 style="font-family:'Cinzel', serif; color:#a855f7; margin:0; font-size:1.8rem; text-shadow:0 0 15px rgba(168,85,247,0.4);">
                            <i class="fa-solid fa-wand-magic-sparkles" style="margin-right:10px;"></i> ${i==="cantrips"?"Glossário de Truques":"Glossário de Magias"}
                        </h3>
                        <p style="font-size:0.85rem; color:var(--text-dim); margin:4px 0 0 0; line-height:1.4;">${i==="cantrips"?"Consulta rápida e completa de truques (nível 0) D&D 5e.":"Consulta de magias arcanas, divinas e naturais de 1º a 5º círculo."}</p>
                    </div>

                    <!-- ABAS DE SELEÇÃO DO GLOSSÁRIO MÁGICO -->
                    <div style="display: flex; gap: 8px; background: rgba(0,0,0,0.35); padding: 4px; border-radius: 10px; border: 1.5px solid rgba(168,85,247,0.25); box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);">
                        <button class="btn magic-tab-btn ${i==="cantrips"?"btn-primary":"btn-ghost"}" 
                                data-tab="cantrips" 
                                style="font-family: 'Cinzel'; font-size: 0.75rem; padding: 6px 12px; border: none; border-radius: 6px; display: flex; align-items: center; gap: 6px; color: ${i==="cantrips"?"#fff":"var(--text-dim)"}; background: ${i==="cantrips"?"#a855f7":"transparent"}; border-color: ${i==="cantrips"?"#a855f7":"transparent"};">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> TRUQUES
                        </button>
                        <button class="btn magic-tab-btn ${i==="spells"?"btn-primary":"btn-ghost"}" 
                                data-tab="spells" 
                                style="font-family: 'Cinzel'; font-size: 0.75rem; padding: 6px 12px; border: none; border-radius: 6px; display: flex; align-items: center; gap: 6px; color: ${i==="spells"?"#fff":"var(--text-dim)"}; background: ${i==="spells"?"#a855f7":"transparent"}; border-color: ${i==="spells"?"#a855f7":"transparent"};">
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
                                   value="${v}"
                                   class="tome-input-focus"
                                   style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 10px; border: 1.5px solid rgba(168,85,247,0.3); background: rgba(8, 8, 10, 0.7); color: #fff; font-size: 0.9rem; outline: none; transition: all 0.3s;" />
                        </div>
                        
                        <!-- Class Filter -->
                        <div style="min-width: 160px;">
                            <select id="magic-class-filter" class="tome-input-focus" style="width:100%; padding: 14px; border-radius: 10px; border: 1.5px solid rgba(168,85,247,0.3); background: rgba(8, 8, 10, 0.7); color: #fff; font-size: 0.9rem; cursor:pointer; outline:none; transition: all 0.3s;">
                                <option value="all">Todas as Classes</option>
                                ${e.map(t=>a`<option value="${t}" ${y===t?"selected":""}>${t}</option>`)}
                            </select>
                        </div>

                        <!-- Level Filters (Apenas na aba de Magias) -->
                        ${i==="spells"?a`
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="magic-level-filter-container">
                            ${c("all","✨ Tudo",d==="all")}
                            ${c("1","1º Círculo",d==="1")}
                            ${c("2","2º Círculo",d==="2")}
                            ${c("3","3º Círculo",d==="3")}
                            ${c("4","4º Círculo",d==="4")}
                            ${c("5","5º Círculo",d==="5")}
                        </div>
                        `:""}
                    </div>
                </div>

                <!-- Match stats -->
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-dim); padding: 0 5px;">
                    <span>Exibindo <strong id="magic-count" style="color: #a855f7; font-size: 1rem;">0</strong> ${i==="cantrips"?"truques catalogados":"magias no grimório"}.</span>
                    <span style="display: inline-flex; align-items: center; gap: 6px; color: #a855f7; font-weight: 700; text-shadow: 0 0 10px rgba(168,85,247,0.3);"><i class="fa-solid fa-scroll"></i> Pergaminhos Vivos</span>
                </div>

                <!-- Terms grid -->
                <div id="magic-glossary-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; max-height: calc(100vh - 380px); min-height: 400px; overflow-y: auto; padding-right: 15px; scrollbar-width: thin; margin-top: 5px;">
                    <!-- Rendered dynamically by _updateMagicGlossaryList() -->
                </div>
            </div>
        `}function c(s,e,o){return a`
            <button class="btn btn-sm ${o?"active":""}" 
                    style="border-radius: 8px; padding: 8px 14px; font-size: 0.8rem; font-weight: 700; background: ${o?"rgba(168,85,247,0.2)":"rgba(0,0,0,0.4)"}; border: 1px solid ${o?"#a855f7":"rgba(255,255,255,0.1)"}; color: ${o?"#fff":"var(--text-dim)"}; transition: all 0.2s;" 
                    data-action="setMagicLevelFilter" data-level="${s}">
                ${e}
            </button>
        `}return h()}export{te as QuickReference};
