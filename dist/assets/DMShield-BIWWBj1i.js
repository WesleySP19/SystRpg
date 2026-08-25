import{R as z}from"./ReactiveComponent-Ddz_ABRu.js";import{m as d}from"./main-DA10KFgB.js";import{T as p,D as P}from"./BattleManager-cUmVHNU7.js";import{Toast as c}from"./Toast-m0Ci56ke.js";import"./Boot-CB2yJVwc.js";import"./jsxRuntime.module-D87oBCZy.js";import"./FXEngine-Cu-70LmD.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";function T(m){if(m._selectedTable==="dc")return d`
            <table class="shield-table">
                <thead>
                    <tr style="text-align:left;">
                        <th>Grau de Dificuldade</th>
                        <th style="text-align:right;">Classe de Dificuldade (CD)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Muito Fácil</td><td style="text-align:right; font-weight:800; color:var(--accent);">05</td></tr>
                    <tr><td>Fácil</td><td style="text-align:right; font-weight:800; color:var(--accent);">10</td></tr>
                    <tr><td>Médio</td><td style="text-align:right; font-weight:800; color:var(--accent);">15</td></tr>
                    <tr><td>Difícil</td><td style="text-align:right; font-weight:800; color:var(--accent);">20</td></tr>
                    <tr><td>Muito Difícil</td><td style="text-align:right; font-weight:800; color:var(--accent);">25</td></tr>
                    <tr><td>Quase Impossível</td><td style="text-align:right; font-weight:800; color:var(--accent);">30</td></tr>
                </tbody>
            </table>
        `;if(m._selectedTable==="travel")return d`
            <table class="shield-table">
                <thead>
                    <tr style="text-align:left;">
                        <th style="color:var(--info);">Ritmo de Marcha</th>
                        <th>Distância/Dia</th>
                        <th style="text-align:right;">Efeito em Jogo</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style="font-weight:800; color:var(--info);">Rápido</td><td>45 km (30 milhas)</td><td style="text-align:right; color:var(--danger);">-5 Percepção Passiva</td></tr>
                    <tr><td style="font-weight:800; color:var(--info);">Normal</td><td>36 km (24 milhas)</td><td style="text-align:right; color:var(--text-dim);">Nenhum</td></tr>
                    <tr><td style="font-weight:800; color:var(--info);">Lento</td><td>27 km (18 milhas)</td><td style="text-align:right; color:var(--success);">Permite Furtividade</td></tr>
                </tbody>
            </table>
        `;if(m._selectedTable==="light")return d`
            <table class="shield-table">
                <thead>
                    <tr style="text-align:left;">
                        <th style="color:var(--warning);">Fonte de Ignição</th>
                        <th>Luminosidade Plena</th>
                        <th style="text-align:right;">Luz Ofuscada</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td style="font-weight:800; color:var(--warning);">Tocha</td><td>Raio de 6m (20ft)</td><td style="text-align:right; color:var(--text-dim);">Mais 6m adicionais</td></tr>
                    <tr><td style="font-weight:800; color:var(--warning);">Lanterna Furta-Fogo</td><td>Cone de 18m (60ft)</td><td style="text-align:right; color:var(--text-dim);">Cone de +18m</td></tr>
                    <tr><td style="font-weight:800; color:var(--warning);">Vela</td><td>Raio de 1,5m (5ft)</td><td style="text-align:right; color:var(--text-dim);">Mais 1,5m adicionais</td></tr>
                </tbody>
            </table>
        `;if(m._selectedTable==="armor")return d`
            <table class="shield-table" style="font-size:0.75rem;">
                <thead>
                    <tr style="text-align:left;">
                        <th>Armadura</th>
                        <th>Classe de Armadura (CA)</th>
                        <th style="text-align:right;">Furtividade</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Leves -->
                    <tr style="background:rgba(255,255,255,0.02);"><td colspan="3" style="padding:5px; font-weight:800; color:#fff; text-align:center; font-family:'Cinzel';">Armaduras Leves</td></tr>
                    <tr><td>Acolchoada</td><td>11 + mod. Des</td><td style="text-align:right; color:var(--danger);">Desvantagem</td></tr>
                    <tr><td>Couro</td><td>11 + mod. Des</td><td style="text-align:right;">—</td></tr>
                    <tr><td>Couro Batido</td><td>12 + mod. Des</td><td style="text-align:right;">—</td></tr>
                    <!-- Médias -->
                    <tr style="background:rgba(255,255,255,0.02);"><td colspan="3" style="padding:5px; font-weight:800; color:#fff; text-align:center; font-family:'Cinzel';">Armaduras Médias</td></tr>
                    <tr><td>Camisão de Malha</td><td>13 + mod. Des (máx +2)</td><td style="text-align:right;">—</td></tr>
                    <tr><td>Peitoral</td><td>14 + mod. Des (máx +2)</td><td style="text-align:right;">—</td></tr>
                    <tr><td>Meia Armadura</td><td>15 + mod. Des (máx +2)</td><td style="text-align:right; color:var(--danger);">Desvantagem</td></tr>
                    <!-- Pesadas -->
                    <tr style="background:rgba(255,255,255,0.02);"><td colspan="3" style="padding:5px; font-weight:800; color:#fff; text-align:center; font-family:'Cinzel';">Armaduras Pesadas</td></tr>
                    <tr><td>Cota de Malha</td><td>16 (Req: For 13)</td><td style="text-align:right; color:var(--danger);">Desvantagem</td></tr>
                    <tr><td>Placas</td><td>18 (Req: For 15)</td><td style="text-align:right; color:var(--danger);">Desvantagem</td></tr>
                    <!-- Escudo -->
                    <tr style="background:rgba(255,255,255,0.02);"><td colspan="3" style="padding:5px; font-weight:800; color:#fff; text-align:center; font-family:'Cinzel';">Escudos</td></tr>
                    <tr><td>Escudo comum</td><td>+2 de Bônus na CA</td><td style="text-align:right;">—</td></tr>
                </tbody>
            </table>
        `;if(m._selectedTable==="prof")return d`
            <div style="display:flex; gap:15px;">
                <table class="shield-table" style="flex:1;">
                    <thead>
                        <tr style="text-align:center;">
                            <th style="color:var(--success); text-align:center;">Níveis (1 a 10)</th>
                            <th style="color:var(--success); text-align:center;">Bônus</th>
                        </tr>
                    </thead>
                    <tbody style="text-align:center;">
                        <tr>
                            <td>Nível 1 a 4</td>
                            <td style="font-weight:800; color:var(--success);">+2</td>
                        </tr>
                        <tr>
                            <td>Nível 5 a 8</td>
                            <td style="font-weight:800; color:var(--success);">+3</td>
                        </tr>
                        <tr>
                            <td>Nível 9 a 10</td>
                            <td style="font-weight:800; color:var(--success);">+4</td>
                        </tr>
                    </tbody>
                </table>
                <table class="shield-table" style="flex:1;">
                    <thead>
                        <tr style="text-align:center;">
                            <th style="color:var(--success); text-align:center;">Níveis (11 a 20)</th>
                            <th style="color:var(--success); text-align:center;">Bônus</th>
                        </tr>
                    </thead>
                    <tbody style="text-align:center;">
                        <tr>
                            <td>Nível 11 a 12</td>
                            <td style="font-weight:800; color:var(--success);">+4</td>
                        </tr>
                        <tr>
                            <td>Nível 13 a 16</td>
                            <td style="font-weight:800; color:var(--success);">+5</td>
                        </tr>
                        <tr>
                            <td>Nível 17 a 20</td>
                            <td style="font-weight:800; color:var(--success);">+6</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;if(m._selectedTable==="conditions")return d`
            <div class="custom-scroll" style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
                <table class="shield-table" style="font-size:0.75rem;">
                    <thead>
                        <tr style="text-align:left;">
                            <th style="color:var(--danger); width:35%;">Condição</th>
                            <th style="color:var(--danger);">Efeitos Principais</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Agarramento</td>
                            <td style="color:var(--text-dim);">Deslocamento torna-se 0 e não se beneficia de bônus no deslocamento. Termina se o agarrador for incapacitado.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Amedrontado</td>
                            <td style="color:var(--text-dim);">Desvantagem em ataques e testes se puder ver a fonte do medo. Não pode se aproximar voluntariamente da fonte.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Atordoado</td>
                            <td style="color:var(--text-dim);">Incapacitado, não pode se mover, falha automática em For/Des. Ataques contra têm Vantagem.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Caído</td>
                            <td style="color:var(--text-dim);">Apenas rasteja. Desvantagem nos próprios ataques. Ataques corpo-a-corpo contra têm Vantagem. Distância têm Desvantagem.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Cego</td>
                            <td style="color:var(--text-dim);">Falha automática em testes de visão. Ataques do alvo têm Desvantagem; ataques contra o alvo têm Vantagem.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Enfeitiçado</td>
                            <td style="color:var(--text-dim);">Não pode atacar o charmoso. Charmoso tem Vantagem em interações sociais com o alvo.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Envenenado</td>
                            <td style="color:var(--text-dim);">Desvantagem em jogadas de ataque e testes de habilidade.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Impedido</td>
                            <td style="color:var(--text-dim);">Deslocamento 0. Ataques do alvo têm Desvantagem; contra têm Vantagem. Desvantagem em testes de Des.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Invisível</td>
                            <td style="color:var(--text-dim);">Inalvejável para coisas que requerem visão. Ataques têm Vantagem; ataques contra têm Desvantagem.</td>
                        </tr>
                        <tr>
                            <td style="font-weight:800; color:var(--danger); vertical-align:top;">Paralisado</td>
                            <td style="color:var(--text-dim);">Incapacitado e não se move. Falha auto For/Des. Ataques contra têm Vantagem. Acertos corpo-a-corpo são críticos automáticos.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `}function D(m){const{players:t,monsters:e}=m.store.state;if(!(t!=null&&t.length)||!(e!=null&&e.length))return d`
            <div style="padding:25px; text-align:center; color:var(--text-dim); display:flex; flex-direction:column; align-items:center; gap:8px;">
                <i class="fa-solid fa-feather-pointed fa-2x" style="opacity:0.2;"></i>
                <span>Adicione aventureiros e monstros para computar a taxa de perigo.</span>
            </div>
        `;const r={1:[25,50,75,100],2:[50,100,150,200],3:[75,150,225,400],4:[125,250,375,500],5:[250,500,750,1100],6:[300,600,900,1400],7:[350,750,1100,1700],8:[450,900,1400,2100],9:[550,1100,1600,2400],10:[600,1200,1900,2800],11:[800,1600,2400,3600],12:[1e3,2e3,3e3,4500],13:[1100,2200,3400,5100],14:[1250,2500,3800,5700],15:[1400,2800,4300,6400],16:[1600,3200,4800,7200],17:[2e3,3900,5900,8800],18:[2100,4200,6300,9500],19:[2400,4900,7300,10900],20:[2800,5700,8500,12700]};let i=0,o=0,a=0,s=0;t.forEach(w=>{const C=Math.min(20,Math.max(1,parseInt(w.level)||1)),y=r[C]||r[1];i+=y[0],o+=y[1],a+=y[2],s+=y[3]});const n={0:10,"1/8":25,"1/4":50,"1/2":100,1:200,2:450,3:700,4:1100,5:1800,6:2300,7:2900,8:3900,9:5e3,10:5900,11:7200,12:8400,13:1e4,14:11500,15:13e3,16:15e3,17:18e3,18:2e4,19:22e3,20:25e3,21:33e3,22:41e3,23:5e4,24:62e3,25:75e3,26:9e4,27:105e3,28:12e4,29:135e3,30:155e3};let l=e.reduce((w,C)=>w+(n[String(C.cr).trim()]||100),0);const f=e.length,v=f===1?1:f===2?1.5:f<7?2:f<11?2.5:3,g=l*v;let h="Trivial",b="var(--text-dim)",u="glow-trivial",x="linear-gradient(to right, rgba(255,255,255,0.02), rgba(255,255,255,0.08))";return g>=s?(h="MORTAL 💀",b="var(--danger)",u="glow-mortal",x="linear-gradient(to right, rgba(231,76,60,0.1), rgba(231,76,60,0.25))"):g>=a?(h="Difícil ⚠️",b="var(--warning)",u="glow-dificil",x="linear-gradient(to right, rgba(241,196,15,0.08), rgba(241,196,15,0.2))"):g>=o?(h="Médio ⚔️",b="var(--info)",u="glow-medio",x="linear-gradient(to right, rgba(52,152,219,0.08), rgba(52,152,219,0.2))"):g>=i&&(h="Fácil 🛡️",b="var(--success)",u="glow-facil",x="linear-gradient(to right, rgba(46,204,113,0.08), rgba(46,204,113,0.2))"),d`
        <div class="letalidade-banner ${u}" style="background:${x}; padding:20px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid ${b}; transition: all 0.3s ease;">
            <div>
                <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">Letalidade Avaliada</div>
                <div style="font-size:1.6rem; font-weight:900; color:${b}; font-family:'Cinzel'; text-shadow:0 0 10px rgba(0,0,0,0.5);">${h}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">XP do Desafio</div>
                <div style="font-size:1.4rem; font-weight:800; color:#fff; font-family:'Cinzel';">${g} <span style="font-size:0.75rem; color:var(--accent);">XP</span></div>
            </div>
        </div>
    `}class O extends z{constructor(t={}){t.storePath="combat",super(t),this._selectedTable="dc"}template(){const{resources:t,players:e,monsters:r,initiativeOrder:i}=this.store.state;return d`
            <div class="page" style="max-width: 1300px; padding: 20px; animation: fadeIn 0.4s ease-out;">
                <div class="border-b border-[rgba(197,160,89,0.3)] pb-5 mb-8">
                    <div>
                        <h2 class="font-serif text-accent text-3xl font-bold shadow-[0_0_10px_rgba(197,160,89,0.5)]">
                            <i class="fa-solid fa-shield-halved mr-3"></i> Escudo do Mestre Lendário
                        </h2>
                        <p class="text-gray-400 mt-2">Referências rápidas do Livro do Jogador (PHB) e analistas táticos em tempo real.</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
                    <!-- LEFT COLUMN: TABLES & TOOLS -->
                    <div class="flex flex-col gap-6">
                        
                        <!-- CORE TABLES TABS -->
                        <div class="card glass-accent">
                            <div class="custom-scroll flex gap-2 mb-5 border-b border-[rgba(255,255,255,0.06)] pb-3 overflow-x-auto">
                                <button class="btn btn-sm ${this._selectedTable==="dc"?"btn-primary":"btn-ghost"} rounded-full px-4 py-1.5 whitespace-nowrap" data-action="setTable" data-tab="dc">
                                    <i class="fa-solid fa-chart-line mr-2"></i> Graus de CD
                                </button>
                                <button class="btn btn-sm ${this._selectedTable==="travel"?"btn-primary":"btn-ghost"} rounded-full px-4 py-1.5 whitespace-nowrap" data-action="setTable" data-tab="travel">
                                    <i class="fa-solid fa-boot mr-2"></i> Ritmo de Viagem
                                </button>
                                <button class="btn btn-sm ${this._selectedTable==="light"?"btn-primary":"btn-ghost"} rounded-full px-4 py-1.5 whitespace-nowrap" data-action="setTable" data-tab="light">
                                    <i class="fa-solid fa-sun mr-2"></i> Luz
                                </button>
                                <button class="btn btn-sm ${this._selectedTable==="armor"?"btn-primary":"btn-ghost"} rounded-full px-4 py-1.5 whitespace-nowrap" data-action="setTable" data-tab="armor">
                                    <i class="fa-solid fa-shield mr-2"></i> Armaduras
                                </button>
                                <button class="btn btn-sm ${this._selectedTable==="prof"?"btn-primary":"btn-ghost"} rounded-full px-4 py-1.5 whitespace-nowrap" data-action="setTable" data-tab="prof">
                                    <i class="fa-solid fa-star mr-2"></i> Proficiência
                                </button>
                                <button class="btn btn-sm ${this._selectedTable==="conditions"?"btn-primary":"btn-ghost"} rounded-full px-4 py-1.5 whitespace-nowrap" data-action="setTable" data-tab="conditions">
                                    <i class="fa-solid fa-skull-crossbones mr-2"></i> Condições
                                </button>
                            </div>
                            <div id="table-content" class="bg-[rgba(0,0,0,0.3)] p-4 rounded-xl border border-[rgba(255,255,255,0.04)]">
                                ${T(this)}
                            </div>
                        </div>

                        <!-- ENCOUNTER CALCULATOR -->
                        <div class="card glass-accent border-t-4 border-accent">
                            <div class="font-serif text-accent text-xl font-bold mb-4">
                                <i class="fa-solid fa-calculator mr-2"></i> Analisador de Margem de Encontro
                            </div>
                            <div id="encounter-difficulty" class="bg-[rgba(0,0,0,0.4)] rounded-xl border border-[rgba(255,255,255,0.05)] overflow-hidden">
                                ${D(this)}
                            </div>
                            <div style="font-size:0.7rem; color:var(--text-dim); margin-top:10px; opacity:0.7;">
                                <i class="fa-solid fa-info-circle"></i> Cálculos oficiais baseados nos limiares de XP por Nível (DMG cap. 3).
                            </div>
                        </div>

                        <!-- XP & SUMMONED MONSTERS PANEL -->
                        <div class="card glass-accent border-t-4 border-accent flex flex-col gap-5">
                            <div style="font-family:'Cinzel'; color:var(--accent); font-size:1.1rem; font-weight:700; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                                <span><i class="fa-solid fa-award" style="margin-right:8px;"></i> Painel de Ordem e Recompensas</span>
                                <span style="font-size:0.7rem; color:var(--text-dim); font-family:'Roboto'; font-weight:normal;">XP & Efeitos</span>
                            </div>

                            <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:25px;">
                                <!-- Left Section: XP Distributor -->
                                <div style="border-right:1px solid rgba(255,255,255,0.06); padding-right:20px;">
                                    <div style="font-weight:700; font-size:0.85rem; color:var(--accent); text-transform:uppercase; margin-bottom:12px; font-family:'Cinzel';">💰 Distribuidor de XP</div>
                                    
                                    <div style="display:flex; flex-direction:column; gap:12px;">
                                        <div>
                                            <small style="color:var(--text-dim); display:block; margin-bottom:5px;">Montante Total de XP:</small>
                                            <div style="display:flex; gap:8px;">
                                                <input type="number" id="dm-xp-input" value="0" min="0" class="legacy-input" style="flex:1; text-align:center; font-weight:800; font-size:1.1rem; background:rgba(0,0,0,0.5); border:1px solid rgba(197, 160, 89, 0.3);" />
                                                <button class="btn btn-ghost" style="padding:6px 12px; font-size:0.75rem; border:1px solid rgba(197, 160, 89, 0.4);" data-action="autoCalcMonsterXP" title="Auto-Somar XP dos monstros invocados">
                                                    ⚡ AUTO-SOMAR
                                                </button>
                                            </div>
                                        </div>

                                        <button class="btn btn-primary btn-block" style="padding:10px; font-family:'Cinzel'; margin-top:5px;" data-action="distributeXP">
                                            ✨ DISTRIBUIR ENTRE JOGADORES
                                        </button>
                                        
                                        <div style="font-size:0.65rem; color:var(--text-dim); line-height:1.4;">
                                            * Divide o montante de XP igualmente entre todos os <strong>${(e==null?void 0:e.length)||0}</strong> jogadores ativos. O XP é injetado diretamente em suas fichas.
                                        </div>
                                    </div>
                                </div>

                                <!-- Right Section: Summoned Monsters Banish/Clean-up -->
                                <div>
                                    <div style="font-weight:700; font-size:0.85rem; color:var(--danger); text-transform:uppercase; margin-bottom:12px; font-family:'Cinzel';">🗑️ Ameaças Ativas</div>
                                    
                                    <div class="custom-scroll" style="display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; padding-right:5px;">
                                        ${(r||[]).map((o,a)=>{var s,n;return d`
                                            <div class="glass" style="padding:8px 12px; display:flex; justify-content:space-between; align-items:center; border-radius:10px; border:1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.25);">
                                                <div style="min-width:0; flex:1; padding-right:10px;">
                                                    <div style="font-weight:800; font-size:0.8rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                                                        ${o.emoji||"🐾"} ${o.name}
                                                    </div>
                                                    <div style="font-size:0.65rem; opacity:0.6; margin-top:2px;">
                                                        ND ${o.cr||"1"} | HP: ${((s=o.hp)==null?void 0:s.current)||0}/${((n=o.hp)==null?void 0:n.max)||0}
                                                    </div>
                                                </div>
                                                <button class="btn btn-danger btn-sm" style="padding:5px 8px; font-size:0.65rem; border-radius:6px; flex-shrink:0; background:rgba(239, 68, 68, 0.2); border-color:rgba(239, 68, 68, 0.4);" 
                                                        data-action="banishSummonedMonster" data-id="${o.id}" data-name="${o.name}" title="Eliminar monstro do mapa e combate">
                                                    <i class="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                        `})}

                                        ${r!=null&&r.length?"":d`
                                            <div style="text-align:center; padding:30px 10px; opacity:0.3; font-size:0.75rem; border:1px dashed rgba(255,255,255,0.05); border-radius:10px;">
                                                Nenhum monstro invocado atualmente.
                                            </div>
                                        `}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- RECENT EVENTS / LOG -->
                        <div class="card glass-accent">
                            <div style="font-family:'Cinzel'; color:var(--accent); font-size:1.1rem; font-weight:700; margin-bottom:15px;">
                                <i class="fa-solid fa-scroll" style="margin-right:8px;"></i> Relatório de Crônicas Rápidas
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:15px;">
                                <div style="background:rgba(197,160,89,0.05); border:1px solid rgba(197,160,89,0.15); padding:12px; border-radius:10px; text-align:center;">
                                    <div style="font-size:0.65rem; color:var(--accent); text-transform:uppercase; letter-spacing:1px;">Combatentes em Fila</div>
                                    <div style="font-size:1.8rem; font-weight:900; color:#fff; font-family:'Cinzel'; margin-top:5px;">${(i==null?void 0:i.length)||0}</div>
                                </div>
                                <div style="background:rgba(52,152,219,0.05); border:1px solid rgba(52,152,219,0.15); padding:12px; border-radius:10px; text-align:center;">
                                    <div style="font-size:0.65rem; color:var(--info); text-transform:uppercase; letter-spacing:1px;">Heróis na Campanha</div>
                                    <div style="font-size:1.8rem; font-weight:900; color:#fff; font-family:'Cinzel'; margin-top:5px;">${(e==null?void 0:e.length)||0}</div>
                                </div>
                            </div>
                            <button class="btn btn-ghost btn-block" style="border-radius:10px; padding:12px;" data-action="generateFinalReport">
                                <i class="fa-solid fa-file-invoice" style="margin-right:8px;"></i> Compilar Resumo da Sessão
                            </button>
                        </div>
                    </div>

                    <!-- RIGHT COLUMN: INITIATIVE & QUICK ACTIONS -->
                    <div style="display:flex; flex-direction:column; gap:25px;">
                        
                        <!-- INITIATIVE TRACKER -->
                        <div class="card glass-accent border-t-4 border-accent">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
                                <div style="font-family:'Cinzel'; color:var(--accent); font-size:1.1rem; font-weight:700;">
                                    <i class="fa-solid fa-bolt" style="margin-right:6px;"></i> Fila de Iniciativa
                                </div>
                                <button class="btn btn-primary btn-sm" style="border-radius:15px; padding:4px 12px; font-size:0.75rem;" data-action="rollInitiative">
                                    <i class="fa-solid fa-play"></i> Iniciar
                                </button>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                ${this._renderInitiative()}
                            </div>
                        </div>

                        <!-- PARTY RESOURCES -->
                        <div class="card glass-accent">
                            <div style="font-family:'Cinzel'; color:var(--accent); font-size:1.1rem; font-weight:700; margin-bottom:15px;">
                                <i class="fa-solid fa-suitcase" style="margin-right:8px;"></i> Consumíveis do Grupo
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:12px; border-radius:12px;">
                                    <div style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; text-align:center;">🧪 Poções de Cura</div>
                                    <div class="counter" style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border-radius:8px; overflow:hidden;">
                                        <button style="border:none; background:none; color:var(--danger); width:30px; height:35px; font-size:1.2rem; cursor:pointer;" data-action="decPotion">-</button>
                                        <span style="font-weight:900; font-size:1.1rem; color:#fff;">${(t==null?void 0:t.potions)||0}</span>
                                        <button style="border:none; background:none; color:var(--success); width:30px; height:35px; font-size:1.2rem; cursor:pointer;" data-action="incPotion">+</button>
                                    </div>
                                </div>
                                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); padding:12px; border-radius:12px;">
                                    <div style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; text-align:center;">📜 Pergaminhos</div>
                                    <div class="counter" style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border-radius:8px; overflow:hidden;">
                                        <button style="border:none; background:none; color:var(--danger); width:30px; height:35px; font-size:1.2rem; cursor:pointer;" data-action="decScroll">-</button>
                                        <span style="font-weight:900; font-size:1.1rem; color:#fff;">${(t==null?void 0:t.scrolls)||0}</span>
                                        <button style="border:none; background:none; color:var(--success); width:30px; height:35px; font-size:1.2rem; cursor:pointer;" data-action="incScroll">+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- CONCENTRATION -->
                        <div class="card glass-accent">
                            <div style="font-family:'Cinzel'; color:var(--accent); font-size:1.1rem; font-weight:700; margin-bottom:15px;">
                                <i class="fa-solid fa-brain" style="margin-right:8px;"></i> Foco & Concentração
                            </div>
                            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:15px;">
                                ${this._renderConcentration()}
                            </div>
                            <button class="btn btn-ghost btn-sm btn-block" style="border-radius:8px; padding:8px;" data-action="addConcentration">
                                <i class="fa-solid fa-plus" style="margin-right:6px;"></i> Registrar Concentrador
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `}setTable(t,e){this._selectedTable=e.dataset.tab,this.render()}_renderInitiative(){const{initiativeOrder:t}=this.store.state;return t!=null&&t.length?t.map((e,r)=>{const i=r===0,o=e.type==="Player";return d`
                <div class="init-row" style="
                    display:flex; justify-content:space-between; align-items:center;
                    padding:10px 15px; border-radius:10px;
                    background:${i?"rgba(197,160,89,0.08)":"rgba(255,255,255,0.02)"};
                    border:1px solid ${i?"var(--accent)":"rgba(255,255,255,0.05)"};
                    box-shadow:${i?"0 0 10px rgba(197,160,89,0.15)":"none"};
                    transition:all 0.2s;
                ">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <input type="number" value="${e.roll}" data-action="updateManualRoll" data-index="${r}" 
                               style="width:32px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:6px; color:var(--accent); font-weight:900; text-align:center; font-size:0.85rem; padding:3px 0;" />
                        <div>
                            <div style="font-weight:800; font-size:0.85rem; color:${o?"var(--info)":"var(--danger)"};">${e.name}</div>
                            <div style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.5px;">${e.type}</div>
                        </div>
                    </div>
                    <div style="background:rgba(0,0,0,0.3); padding:4px 8px; border-radius:6px; font-size:0.7rem; border:1px solid rgba(255,255,255,0.04); font-weight:700;">
                        HP <span style="color:${e.hp_current<=e.hp_max*.3?"var(--danger)":"var(--success)"};">${e.hp_current}</span>/${e.hp_max}
                    </div>
                </div>
            `}):d`
            <div style="padding:25px; text-align:center; color:var(--text-dim); display:flex; flex-direction:column; align-items:center; gap:8px; border:1px dashed rgba(255,255,255,0.08); border-radius:12px;">
                <i class="fa-solid fa-hourglass-empty" style="opacity:0.2; font-size:1.5rem;"></i>
                <span style="font-size:0.75rem;">A fila de iniciativa está vazia.</span>
            </div>
        `}updateManualRoll(t,e){const r=parseInt(e.dataset.index),i=parseInt(e.value)||0;p.store.update(o=>{o.initiativeOrder&&o.initiativeOrder[r]&&(o.initiativeOrder[r].roll=i,o.initiativeOrder.sort((a,s)=>s.roll-a.roll))}),c.show("Ordem de combate sincronizada!")}rollInitiative(){const{players:t,monsters:e}=this.store.state,r=a=>Math.floor(((a||10)-10)/2);if(!(t!=null&&t.length)&&!(e!=null&&e.length)){c.show("Adicione heróis ou monstros.","info");return}const i=(e||[]).map(a=>{var s,n,l;return{id:a.id,name:a.name,type:"Criatura",hp_current:((s=a.hp)==null?void 0:s.current)||10,hp_max:((n=a.hp)==null?void 0:n.max)||10,roll:P.roll("1d20").total+r((l=a.stats)==null?void 0:l.dex),originalData:a}}),o=(t||[]).map(a=>{var s,n;return{id:a.id||`p-${Date.now()}-${Math.random()}`,name:a.name,type:"Player",hp_current:((s=a.hp)==null?void 0:s.current)||10,hp_max:((n=a.hp)==null?void 0:n.max)||10,roll:0}});p.store.update(a=>{a.initiativeOrder=[...i,...o].sort((s,n)=>n.roll-s.roll),a.combatActive=!0,a.combatRound=1}),c.show("Novo combate iniciado!")}autoCalcMonsterXP(){const{monsters:t}=this.store.state,e={0:10,"1/8":25,"1/4":50,"1/2":100,1:200,2:450,3:700,4:1100,5:1800,6:2300,7:2900,8:3900,9:5e3,10:5900,11:7200,12:8400,13:1e4,14:11500,15:13e3,16:15e3,17:18e3,18:2e4,19:22e3,20:25e3,21:33e3,22:41e3,23:5e4,24:62e3,25:75e3,26:9e4,27:105e3,28:12e4,29:135e3,30:155e3,BOSS:5e4};let r=0;(t||[]).forEach(o=>{let a=String(o.cr||"1").trim();a=a.replace("Nível ","");const s=e[a]||200;r+=s});const i=this.$("#dm-xp-input");i?(i.value=r,c.show(`XP somado de monstros invocados: +${r} XP!`,"info")):c.show(`Soma de XP calculada: ${r} XP`,"info")}distributeXP(){const t=this.$("#dm-xp-input"),e=parseInt(t?t.value:0)||0,{players:r}=this.store.state;if(e<=0){c.show("Por favor, defina um montante positivo de XP para distribuir.","warning");return}if(!r||r.length===0){c.show("Nenhum jogador cadastrado na campanha para receber XP!","warning");return}const i=Math.floor(e/r.length);if(i<=0){c.show("O XP total é muito baixo para dividir entre os jogadores.","warning");return}const o=[0,0,300,900,2700,6500,14e3,23e3,34e3,48e3,64e3];p.store.update(a=>{a.players=(a.players||[]).map(s=>{const l=(parseInt(s.xp)||0)+i;let f=parseInt(s.level)||1,v=f;for(let g=2;g<o.length;g++)l>=o[g]&&(v=g);return v>f&&setTimeout(()=>{c.show(`🎉 ${s.name} SUBIU DE NÍVEL! Agora é Nível ${v}!`,"success")},100),{...s,xp:l,level:v}})}),c.show(`Experiência distribuída! +${i} XP para cada um dos ${r.length} heróis!`,"success"),t&&(t.value=0),this.render()}_xpBasedOnMasterLevel(t,e){const r={0:10,"1/8":25,"1/4":50,"1/2":100,1:200,2:450,3:700,4:1100,5:1800,6:2300,7:2900,8:3900,9:5e3,10:5900,11:7200,12:8400,13:1e4,14:11500,15:13e3,16:15e3,17:18e3,18:2e4,19:22e3,20:25e3,21:33e3,BOSS:5e4},i=String(e.cr||"1").trim().replace("Nível ",""),o=r[i]||200,a={1:[25,50,75,100],2:[50,100,150,200],3:[75,150,225,400],4:[125,250,375,500],5:[250,500,750,1100],6:[300,600,900,1400],7:[350,750,1100,1700],8:[450,900,1400,2100],9:[550,1100,1600,2400],10:[600,1200,1900,2800]},s=Math.min(10,t||1),n=a[s]||a[1];let l=1;return o>n[3]?l=2.5:o>n[2]?l=2:o>n[1]?l=1.5:l=1,Math.round(o*l)}banishSummonedMonster(t,e){const r=e.dataset.id,i=e.dataset.name;r&&confirm(`Deseja mesmo banir e apagar permanentemente "${i}" da campanha? Isso removerá o monstro de todas as listas e do combate atual.`)&&(p.store.update(o=>{o.monsters=(o.monsters||[]).filter(a=>a.id!==r),o.initiativeOrder=(o.initiativeOrder||[]).filter(a=>a.id!==r&&a.name!==i)}),c.show(`${i} foi banido e limpo com sucesso!`,"success"),this.render())}_renderConcentration(){const{concentration:t}=this.store.state;return t!=null&&t.length?t.map((e,r)=>d`
            <div class="tome-hover-row" style="
                background:rgba(255,255,255,0.02);
                border:1px solid rgba(255,255,255,0.06);
                border-radius:10px;
                padding:10px 15px;
                display:flex; justify-content:space-between; align-items:center;
                box-shadow:inset 0 0 10px rgba(0,0,0,0.2);
            ">
                <div>
                    <strong style="color:var(--accent); font-size:0.85rem;">${e.name}</strong>
                    <div style="font-size:0.65rem; color:var(--text-dim); margin-top:2px;">✨ Magia: <span style="color:#fff; font-weight:700;">${e.spell}</span></div>
                </div>
                <button class="btn btn-danger" style="padding:6px 10px; font-size:0.7rem; border-radius:6px; background:rgba(231,76,60,0.15); border-color:rgba(231,76,60,0.3);" data-action="removeConcentration" data-index="${r}">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `):d`
            <div style="font-size:0.7rem; color:var(--text-dim); text-align:center; padding:15px; border:1px dashed rgba(255,255,255,0.06); border-radius:10px;">
                Nenhum herói concentrando magias.
            </div>
        `}addConcentration(){const t=prompt("Nome do herói:"),e=prompt("Nome da magia:");t&&e&&p.store.update(r=>r.concentration=[...r.concentration||[],{name:t,spell:e}])}removeConcentration(t,e){const r=parseInt(e.dataset.index);p.store.update(i=>i.concentration=i.concentration.filter((o,a)=>a!==r))}generateFinalReport(){const{players:t,combatRound:e}=this.store.state,i=`
            RELATÓRIO DE SESSÃO TOME PRO
            Data: ${new Date().toLocaleString()}
            Rodadas de Combate: ${e}
            Heróis: ${t.map(o=>o.name).join(", ")}
            --------------------------
            Aventura concluída com sucesso!
        `;alert(i),c.show("Relatório gerado!")}incPotion(){p.store.update(t=>t.resources.potions++)}decPotion(){p.store.update(t=>{t.resources.potions>0&&t.resources.potions--})}incScroll(){p.store.update(t=>t.resources.scrolls++)}decScroll(){p.store.update(t=>{t.resources.scrolls>0&&t.resources.scrolls--})}}export{O as DMShield};
