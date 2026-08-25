import{R as z}from"./ReactiveComponent-Ddz_ABRu.js";import{m as p}from"./main-DA10KFgB.js";import{T as m}from"./BattleManager-cUmVHNU7.js";import{Toast as u}from"./Toast-m0Ci56ke.js";import"./Boot-CB2yJVwc.js";import"./jsxRuntime.module-D87oBCZy.js";import"./FXEngine-Cu-70LmD.js";import"https://cdn.socket.io/4.7.4/socket.io.esm.min.js";const v={easy:[25,50,75,125,250,300,350,450,550,600,800,1e3,1100,1250,1400,1600,2e3,2100,2400,2800],medium:[50,100,150,250,500,600,750,900,1100,1200,1600,2e3,2200,2500,2800,3200,3900,4200,4900,5700],hard:[75,150,225,375,750,900,1100,1400,1600,1900,2400,3e3,3400,3800,4300,4800,5900,6300,7300,8500],deadly:[100,200,400,500,1100,1400,1700,2100,2400,2800,3600,4500,5100,5700,6400,7200,8800,9500,10900,12700]},_=[{id:"Harpistas",name:"Harpistas (Harpers)",motto:"Quem luta contra a escuridão nunca está sozinho.",desc:"Uma rede dispersa de magos e espiões que defendem a igualdade, preservam o conhecimento histórico e combatem a ascensão de tiranos.",crest:"🌙⚔️",color:"#3498db"},{id:"Aliança dos Lordes",name:"Aliança dos Lordes (Lords' Alliance)",motto:"A união faz a força e a ordem gera a prosperidade.",desc:"Uma coalizão de governantes de grandes cidades do Norte que se unem para afastar ameaças externas e manter a lei e o comércio nas estradas.",crest:"👑🛡️",color:"#c5a059"},{id:"Ordem da Manopla",name:"Ordem da Manopla (Order of the Gauntlet)",motto:"A fé é o nosso escudo, a justiça é a nossa espada.",desc:"Um grupo vigilante de paladinos, clérigos e guerreiros dedicados a purificar o mal antes que ele possa criar raízes, focados em honra e ação rápida.",crest:"✊☀️",color:"#ef4444"},{id:"Enclave Esmeralda",name:"Enclave Esmeralda (Emerald Enclave)",motto:"O equilíbrio na natureza garante a sobrevivência de todos.",desc:"Guardiões selvagens, druidas e patrulheiros dedicados a manter a harmonia entre a civilização e a natureza indomável, combatendo aberrações e flagelos.",crest:"🍃🏹",color:"#2ecc71"},{id:"Zhentarim",name:"Zhentarim (Rede Sombria)",motto:"O poder pertence àqueles com ambição para tomá-lo.",desc:"Uma organização mercantil mercenária e nas sombras, focada em obter monopólios comerciais e influência política. Oferece segurança pelo preço certo.",crest:"🚩🐉",color:"#a855f7"}];function C(g){return g>=50?{title:"Grão-Mestre / Líder (Rank 5)",color:"#a855f7"}:g>=25?{title:"Mentor / Alto Conselheiro (Rank 4)",color:"#fbbf24"}:g>=10?{title:"Aliado Fiel (Rank 3)",color:"#3b82f6"}:g>=3?{title:"Agente / Representante (Rank 2)",color:"#2ecc71"}:{title:"Iniciado / Recruta (Rank 1)",color:"#94a3b8"}}function f(g,e,t="custom"){const o=g.state.sessionNumber||1;g.update(s=>{s.chronicleEntries=[...s.chronicleEntries||[],{id:"chron-"+Date.now()+"-"+Math.floor(Math.random()*100),session:o,timestamp:Date.now(),text:e,type:t}]})}class R extends z{constructor(e){super(e),this._showForm=!1,this._activeTab="active",this._searchQuery="",this._filterType="all",this._showLootModalId=null,this._selectedLootPlayers=[],this._lootGold=0,this._lootItems=""}template(){const e=this.store.state.quests||[],t=this.store.state.factionRenown||{Harpers:0,Alliance:0,Gauntlet:0,Enclave:0,Zhentarim:0},o=e.filter(l=>{var d,b,x,h;if(this._activeTab==="completed"&&!l.completed||this._activeTab==="failed"&&!l.failed||this._activeTab==="active"&&(l.completed||l.failed))return!1;const c=this._searchQuery.toLowerCase().trim();if(c){const y=(d=l.title)==null?void 0:d.toLowerCase().includes(c),w=(b=l.description)==null?void 0:b.toLowerCase().includes(c),$=(x=l.reward)==null?void 0:x.toLowerCase().includes(c),M=(h=l.faction)==null?void 0:h.toLowerCase().includes(c);if(!y&&!w&&!$&&!M)return!1}return!(this._filterType!=="all"&&l.type!==this._filterType)}),s=e.filter(l=>!l.completed&&!l.failed).length,a=e.filter(l=>l.completed).length,n=e.filter(l=>l.failed).length,i=this.store.state.players||[],r=i.length>0?Math.round(i.reduce((l,c)=>l+(parseInt(c.level)||1),0)/i.length):1;return p`
            <div class="page" style="max-width:1100px; margin:0 auto; padding:20px; animation: fadeIn 0.4s ease-out;">
                <style>
                    @keyframes cardFadeIn {
                        from { opacity: 0; transform: translateY(15px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-15px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .quest-tab {
                        padding: 10px 20px;
                        font-family: 'Cinzel', serif;
                        font-weight: 700;
                        font-size: 0.8rem;
                        color: var(--text-dim);
                        background: transparent;
                        border: none;
                        border-bottom: 2px solid transparent;
                        cursor: pointer;
                        transition: all 0.25s;
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .quest-tab:hover {
                        color: #fff;
                    }
                    .quest-tab.active {
                        color: var(--accent);
                        border-bottom-color: var(--accent);
                    }
                    .quest-badge-num {
                        background: rgba(255,255,255,0.06);
                        padding: 2px 6px;
                        border-radius: 10px;
                        font-size: 0.65rem;
                        font-family: 'Outfit', sans-serif;
                    }
                    .chronicle-timeline {
                        position: relative;
                        padding-left: 30px;
                        margin-left: 10px;
                        border-left: 2px solid rgba(197,160,89,0.2);
                    }
                    .chronicle-node {
                        position: relative;
                        margin-bottom: 25px;
                        animation: cardFadeIn 0.3s ease-out;
                    }
                    .chronicle-dot {
                        position: absolute;
                        left: -39px;
                        top: 2px;
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        background: var(--bg-main);
                        border: 3.5px solid var(--accent);
                        box-shadow: 0 0 8px var(--accent);
                    }
                </style>

                <!-- Header -->
                <div class="section-header" style="border-bottom: 1px solid rgba(197,160,89,0.25); padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                    <div>
                        <h2 class="section-title" style="font-family:'Cinzel', serif; color:var(--accent); text-shadow:0 0 10px rgba(197,160,89,0.4);">
                            <i class="fa-solid fa-scroll" style="margin-right:10px;"></i> Crônicas & Missões
                        </h2>
                        <p class="section-subtitle" style="color:var(--text-dim); margin-top:4px;">Acompanhe a história da campanha, divida espólios oficiais de D&D e organize reputação de facções.</p>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <button class="btn btn-ghost" style="border-radius:20px; border:1px solid rgba(197,160,89,0.35); font-weight:700; font-size:0.75rem; display:inline-flex; align-items:center; gap:6px; background:rgba(197,160,89,0.03);" data-action="generateAIRumor">
                            <i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent);"></i> Sugerir Missão (IA)
                        </button>
                        <button class="btn btn-primary" style="border-radius:20px; font-weight:700; font-size:0.75rem; display:inline-flex; align-items:center; gap:6px;" data-action="toggleForm">
                            <i class="fa-solid ${this._showForm?"fa-xmark":"fa-plus"}"></i> 
                            ${this._showForm?"Cancelar":"Criar Missão"}
                        </button>
                    </div>
                </div>

                <!-- Filters Control Bar -->
                <div class="glass" style="padding: 15px; border-radius: 12px; margin-bottom: 25px; display: flex; gap: 15px; align-items: center; justify-content: space-between; flex-wrap: wrap; border: 1px solid rgba(197,160,89,0.15); background: rgba(0,0,0,0.15);">
                    <!-- Tabs -->
                    <div style="display: flex; gap: 5px;">
                        <button class="quest-tab ${this._activeTab==="active"?"active":""}" data-action="setTab" data-tab="active">
                            ⚔️ Ativas <span class="quest-badge-num">${s}</span>
                        </button>
                        <button class="quest-tab ${this._activeTab==="completed"?"active":""}" data-action="setTab" data-tab="completed">
                            🏆 Concluídas <span class="quest-badge-num">${a}</span>
                        </button>
                        <button class="quest-tab ${this._activeTab==="failed"?"active":""}" data-action="setTab" data-tab="failed">
                            💀 Fracassadas <span class="quest-badge-num">${n}</span>
                        </button>
                        <button class="quest-tab ${this._activeTab==="factions"?"active":""}" data-action="setTab" data-tab="factions">
                            🚩 Facções & Renome
                        </button>
                        <button class="quest-tab ${this._activeTab==="chronicles"?"active":""}" data-action="setTab" data-tab="chronicles">
                            📜 Linha do Tempo
                        </button>
                    </div>

                    <!-- Filters and Search -->
                    ${this._activeTab!=="factions"&&this._activeTab!=="chronicles"?p`
                    <div style="display: flex; gap: 10px; align-items: center; flex: 1; max-width: 500px; justify-content: flex-end; width: 100%;">
                        <select data-action="filterType" style="background: rgba(8, 8, 10, 0.8); border: 1.5px solid rgba(197,160,89,0.25); padding: 8px 12px; border-radius: 8px; color: #fff; font-size: 0.75rem; outline: none; cursor: pointer; height: 36px;">
                            <option value="all" ${this._filterType==="all"?"selected":""}>Todos os Tipos</option>
                            <option value="main" ${this._filterType==="main"?"selected":""}>⚜️ Principal</option>
                            <option value="side" ${this._filterType==="side"?"selected":""}>🗺️ Secundária</option>
                            <option value="personal" ${this._filterType==="personal"?"selected":""}>👤 Pessoal</option>
                            <option value="faction" ${this._filterType==="faction"?"selected":""}>🚩 Facção</option>
                        </select>
                        
                        <div style="position: relative; max-width: 250px; width: 100%;">
                            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--accent); font-size: 0.8rem;"></i>
                            <input type="text" placeholder="Buscar missão..." 
                                   value="${this._searchQuery}"
                                   style="width: 100%; padding: 8px 10px 8px 34px; border-radius: 8px; border: 1.5px solid rgba(197,160,89,0.25); background: rgba(8, 8, 10, 0.8); color: #fff; font-size: 0.75rem; outline: none; height: 36px;"
                                   data-action="search" />
                        </div>
                    </div>
                    `:""}
                </div>

                ${this._showForm?this._renderForm(r):""}

                <!-- Main Content Pane based on Tab selection -->
                ${this._activeTab==="factions"?this._renderFactionsTab(t):this._activeTab==="chronicles"?this._renderChroniclesTab():p`
                  <!-- Quests Grid -->
                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                      ${o.length?o.map(l=>this._renderQuestCard(l)).join(""):this._renderEmptyState()}
                  </div>
                `}

                <!-- Loot Distribution Modal -->
                ${this._showLootModalId?this._renderLootModal():""}
            </div>
        `}_renderForm(e){return p`
            <div class="card glass-accent" style="margin-bottom:30px; border-radius: 12px; padding: 25px; animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1.5px solid rgba(197,160,89,0.3); background: rgba(10,12,16,0.85); backdrop-filter: blur(15px);">
                <form id="quest-form" style="display:flex; flex-direction:column; gap:16px;">
                    <!-- Title -->
                    <div class="form-group">
                        <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; letter-spacing:0.5px; color:var(--accent); font-weight:800;">Título da Missão</label>
                        <input type="text" name="title" class="form-input" required placeholder="Ex: O Segredo do Forte Sombrio" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); font-family:'Outfit';" />
                    </div>
                    
                    <!-- Description -->
                    <div class="form-group">
                        <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; letter-spacing:0.5px; color:var(--accent); font-weight:800;">Descrição / Objetivos Principais</label>
                        <textarea name="description" class="form-textarea" rows="3" required placeholder="Que lenda os heróis desvendarão? O que eles precisam alcançar?" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); font-family:'Outfit'; line-height:1.5; border-radius:8px; padding:10px; color:#fff; outline:none;"></textarea>
                    </div>

                    <!-- Type, Difficulty, Level Range -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; letter-spacing:0.5px; color:var(--accent); font-weight:800;">Tipo de Missão</label>
                            <select name="type" class="form-select" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); font-family:'Outfit'; color:#fff; height: 38px;">
                                <option value="main">⚜️ Principal</option>
                                <option value="side">🗺️ Secundária</option>
                                <option value="personal">👤 Pessoal</option>
                                <option value="faction">🚩 Facção</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; letter-spacing:0.5px; color:var(--accent); font-weight:800;">Dificuldade CD</label>
                            <select id="quest-difficulty-select" name="difficulty" class="form-select" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); font-family:'Outfit'; color:#fff; height: 38px;">
                                <option value="easy">Fácil (CD 10)</option>
                                <option value="medium" selected>Média (CD 15)</option>
                                <option value="hard">Difícil (CD 20)</option>
                                <option value="deadly">Mortal (CD 25+)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; letter-spacing:0.5px; color:var(--accent); font-weight:800;">Níveis Recomendados</label>
                            <select name="levelRange" class="form-select" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); font-family:'Outfit'; color:#fff; height: 38px;">
                                <option value="1-4">Tier 1 (Nível 1-4)</option>
                                <option value="5-10">Tier 2 (Nível 5-10)</option>
                                <option value="11-16">Tier 3 (Nível 11-16)</option>
                                <option value="17-20">Tier 4 (Nível 17-20)</option>
                            </select>
                        </div>
                    </div>

                    <!-- Faction and Reward selection -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; letter-spacing:0.5px; color:var(--accent); font-weight:800;">Facção Vinculada</label>
                            <select name="faction" class="form-select" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); font-family:'Outfit'; color:#fff; height: 38px;">
                                <option value="Nenhuma">Nenhuma Facção</option>
                                <option value="Harpistas">Harpistas (Harpers)</option>
                                <option value="Aliança dos Lordes">Aliança dos Lordes (Lords' Alliance)</option>
                                <option value="Ordem da Manopla">Ordem da Manopla (Order of the Gauntlet)</option>
                                <option value="Enclave Esmeralda">Enclave Esmeralda (Emerald Enclave)</option>
                                <option value="Zhentarim">Zhentarim (Rede Sombria)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; letter-spacing:0.5px; color:var(--accent); font-weight:800;">Tipo de Recompensa XP</label>
                            <div style="display:flex; gap:20px; align-items:center; height:38px;">
                                <label style="font-size:0.75rem; color:#fff; cursor:pointer; display:flex; align-items:center; gap:6px;">
                                    <input type="radio" name="xpType" value="xp" checked style="accent-color:var(--accent);" onchange="document.getElementById('xp-value-input-wrapper').style.display='block'" />
                                    Experiência (XP)
                                </label>
                                <label style="font-size:0.75rem; color:#fff; cursor:pointer; display:flex; align-items:center; gap:6px;">
                                    <input type="radio" name="xpType" value="milestone" style="accent-color:var(--accent);" onchange="document.getElementById('xp-value-input-wrapper').style.display='none'" />
                                    Marco Narrativo (Milestone)
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- XP Amount & Rewards text -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group" id="xp-value-input-wrapper">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; letter-spacing:0.5px; color:var(--accent); font-weight:800; margin:0;">XP por Personagem</label>
                                <button type="button" class="btn btn-ghost btn-sm" style="font-size:0.6rem; padding:1px 6px; height:auto;" data-action="calcSuggestedXP" data-avg-level="${e}">
                                    🔮 Sugerir XP (Nv Médio: ${e})
                                </button>
                            </div>
                            <input type="number" id="quest-xp-reward-input" name="xpReward" class="form-input" min="0" placeholder="Ex: 500" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); font-family:'Outfit';" />
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; letter-spacing:0.5px; color:var(--accent); font-weight:800;">Recompensa Física (Ouro / Itens Mágicos)</label>
                            <input type="text" name="reward" class="form-input" placeholder="Ex: 250 GP, Poção de Cura Maior" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); font-family:'Outfit';" />
                        </div>
                    </div>

                    <!-- Initial Milestones/Objectives -->
                    <div class="form-group">
                        <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; letter-spacing:0.5px; color:var(--accent); font-weight:800;">Etapas da Missão (Objetivos do checklist - separados por vírgula)</label>
                        <input type="text" name="initialMilestones" class="form-input" placeholder="Ex: Investigar as ruínas, Encontrar a chave da cripta, Banir o espírito" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); font-family:'Outfit';" />
                    </div>

                    <button type="submit" class="btn btn-primary btn-block" style="padding:12px; font-family:'Cinzel'; font-weight:900; letter-spacing:1.5px; margin-top:8px;">
                        ⚔️ PROCLAMAR MISSÃO
                    </button>
                </form>
            </div>
        `}_renderQuestCard(e){const t={main:"#c5a059",side:"#3498db",personal:"#2ecc71",faction:"#a855f7"},o={main:"⚜️ Principal",side:"🗺️ Secundária",personal:"👤 Pessoal",faction:"🚩 Facção"},s={easy:"#22c55e",medium:"#e5c17b",hard:"#f59e0b",deadly:"#ef4444"},a={easy:"Fácil (CD 10)",medium:"Média (CD 15)",hard:"Difícil (CD 20)",deadly:"Mortal (CD 25+)"};let n="";e.completed?n="border: 1.5px solid rgba(34, 197, 94, 0.4); box-shadow: 0 4px 15px rgba(34, 197, 94, 0.08); opacity: 0.8;":e.failed?n="border: 1.5px solid rgba(239, 68, 68, 0.4); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.08); opacity: 0.8;":n=`border: 1.5px solid rgba(255, 255, 255, 0.04); border-top: 4.5px solid ${t[e.type]||"var(--text-dim)"};`;const i=e.completed||e.failed?"card glass":"card glass-accent",r=e.completed?"text-decoration: line-through; color: var(--text-dim);":e.failed?"text-decoration: line-through; color: var(--danger);":"color: #fff;",l=a[e.difficulty]||"Média",c=s[e.difficulty]||"var(--accent)";return p`
            <div class="${i}" style="padding: 22px; border-radius: 14px; transition: all 0.25s ease; animation: cardFadeIn 0.4s ease-out; ${n} display:flex; flex-direction:column; justify-content:space-between; min-height:380px;">
                <div>
                    <!-- Badge header -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span class="badge" style="background:rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 800; color:${t[e.type]}; border: 1px solid rgba(255,255,255,0.05);">
                            ${o[e.type]||e.type}
                        </span>
                        
                        <!-- Difficulty and level -->
                        <div style="display:flex; gap:6px; align-items:center;">
                            <span style="font-size:0.6rem; padding: 2px 6px; border-radius: 4px; background:rgba(0,0,0,0.25); color:${c}; font-weight:800; border:1px solid rgba(255,255,255,0.03);">
                                ${l}
                            </span>
                            <span style="font-size:0.6rem; padding: 2px 6px; border-radius: 4px; background:rgba(255,255,255,0.03); color:var(--text-dim); font-weight:700; border:1px solid rgba(255,255,255,0.03);">
                                Níveis ${e.levelRange||"1-4"}
                            </span>
                        </div>
                    </div>

                    <!-- Title & description -->
                    <div style="position:relative;">
                        <h3 style="margin:0 0 8px 0; font-family:'Cinzel'; font-size:1.1rem; font-weight:700; line-height:1.3; ${r}">
                            ${e.failed?"💀 ":""}${e.title}
                        </h3>
                        <p style="font-size:0.75rem; color:var(--text-dim); line-height:1.5; margin:0 0 15px 0; min-height: 44px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; text-overflow:ellipsis;">
                            ${e.description}
                        </p>
                    </div>

                    <!-- Faction tie -->
                    ${e.faction&&e.faction!=="Nenhuma"?p`
                        <div style="font-size:0.65rem; color:var(--text-dim); display:flex; align-items:center; gap:5px; margin-bottom:15px; background:rgba(255,255,255,0.02); padding:4px 8px; border-radius:6px; border:1px solid rgba(255,255,255,0.02); width:fit-content;">
                            <i class="fa-solid fa-flag" style="color:${t.faction};"></i> Facção: <strong style="color:#fff;">${e.faction}</strong>
                        </div>
                    `:""}

                    <!-- Milestones checklist -->
                    ${this._renderMilestones(e)}

                    <!-- Milestone Inline Form -->
                    ${!e.completed&&!e.failed?p`
                        <div style="display:flex; gap:6px; margin-bottom:15px;">
                            <input type="text" placeholder="Nova etapa da missão..." 
                                   style="flex:1; background:rgba(8,8,10,0.6); border:1.5px solid rgba(197,160,89,0.2); border-radius:6px; padding:4px 10px; color:#fff; font-size:0.7rem; outline:none;" 
                                   id="new-milestone-${e.id}"
                                   onkeydown="if(event.key==='Enter'){event.preventDefault(); document.getElementById('add-btn-${e.id}').click();}" />
                            <button class="btn btn-ghost" id="add-btn-${e.id}" style="padding:4px 10px; border-radius:6px; font-size:0.7rem; font-weight:800; border-color:rgba(197,160,89,0.3); color:var(--accent);" data-action="addMilestoneInline" data-id="${e.id}">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    `:""}
                </div>

                <!-- Footer rewards & status triggers -->
                <div style="margin-top:auto; display:flex; flex-direction:column; gap:10px;">
                    <!-- Reward summary -->
                    <div style="padding:10px; background:rgba(0,0,0,0.3); border-radius:8px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(255,255,255,0.03); font-size:0.7rem;">
                        <span style="color:#fff; font-weight:600; display:inline-flex; align-items:center; gap:4px; max-width:55%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                            <i class="fa-solid fa-coins" style="color:var(--accent);"></i> ${e.reward||"Sem item"}
                        </span>
                        <span>
                            ${e.xpType==="milestone"?p`<span style="color:#fbbf24; font-weight:800; display:inline-flex; align-items:center; gap:3px;"><i class="fa-solid fa-trophy"></i> Marco</span>`:p`<span style="color:#60a5fa; font-weight:800; display:inline-flex; align-items:center; gap:3px;"><i class="fa-solid fa-star"></i> +${e.xpReward||0} XP</span>`}
                        </span>
                    </div>

                    <!-- Actions Triggers / Distribution Grid -->
                    <div style="display:flex; flex-direction:column; gap:6px;">
                        <!-- XP Distribution (if eligible) -->
                        ${e.completed&&e.xpType!=="milestone"?e.xpDistributed?p`
                                <div style="text-align:center; font-size:0.62rem; color:var(--success); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:3px; background:rgba(34,197,94,0.05); border-radius:4px;">
                                    <i class="fa-solid fa-circle-check"></i> XP da Missão Distribuído
                                </div>
                            `:p`
                                <button class="btn btn-info btn-sm btn-block" style="padding:6px; border-radius:6px; font-size:0.68rem; font-weight:800; display:inline-flex; align-items:center; justify-content:center; gap:6px; background:rgba(96,165,250,0.15); border:1px solid rgba(96,165,250,0.4); color:#93c5fd;" data-action="distributeQuestXP" data-id="${e.id}">
                                    <i class="fa-solid fa-gift"></i> Distribuir XP ao Grupo
                                </button>
                            `:""}

                        <!-- Group Level-Up for Milestone (if eligible) -->
                        ${e.completed&&e.xpType==="milestone"?e.milestoneLeveled?p`
                                <div style="text-align:center; font-size:0.62rem; color:#fbbf24; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:3px; background:rgba(251,191,36,0.05); border-radius:4px;">
                                    <i class="fa-solid fa-circle-check"></i> Level Up do Grupo Concedido
                                </div>
                            `:p`
                                <button class="btn btn-ghost btn-sm btn-block" style="padding:6px; border-radius:6px; font-size:0.68rem; font-weight:800; display:inline-flex; align-items:center; justify-content:center; gap:6px; color:#fbbf24; border-color:rgba(251,191,36,0.35); background:rgba(251,191,36,0.08);" data-action="triggerMilestoneLevelUp" data-id="${e.id}">
                                    <i class="fa-solid fa-angles-up"></i> Conceder Level Up ao Grupo
                                </button>
                            `:""}

                        <!-- Loot / Treasure Distribution (if eligible) -->
                        ${e.completed&&e.reward&&e.reward!=="Nenhuma"?e.rewardDistributed?p`
                                <div style="text-align:center; font-size:0.62rem; color:#34d399; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:3px; background:rgba(52,211,153,0.05); border-radius:4px;">
                                    <i class="fa-solid fa-circle-check"></i> Riquezas Entregues aos Heróis
                                </div>
                            `:p`
                                <button class="btn btn-ghost btn-sm btn-block" style="padding:6px; border-radius:6px; font-size:0.68rem; font-weight:800; display:inline-flex; align-items:center; justify-content:center; gap:6px; color:#34d399; border-color:rgba(52,211,153,0.35); background:rgba(52,211,153,0.08);" data-action="openQuestLootModal" data-id="${e.id}">
                                    <i class="fa-solid fa-hand-holding-dollar"></i> Distribuir Tesouros & Itens
                                </button>
                            `:""}
                    </div>

                    <!-- Actions triggers -->
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-top:5px; border-top:1px solid rgba(255,255,255,0.05); padding-top:10px;">
                        <!-- Delete -->
                        <button class="btn btn-ghost btn-sm" style="padding:6px 10px; border-radius:6px; border:1px solid rgba(239, 68, 68, 0.15); color:var(--danger); background:rgba(239,68,68,0.02);" data-action="deleteQuest" data-id="${e.id}">
                            <i class="fa-solid fa-trash-can"></i> Deletar
                        </button>

                        <div style="display:flex; gap:6px; flex:1; justify-content:flex-end;">
                            <!-- Active/Reactivate -->
                            ${e.completed||e.failed?p`
                                <button class="btn btn-ghost btn-sm" style="padding:6px 12px; font-size:0.68rem; border-radius:6px;" data-action="toggleComplete" data-id="${e.id}" data-type="reactivate">
                                    Reativar Missão
                                </button>
                            `:p`
                                <!-- Fail -->
                                <button class="btn btn-ghost btn-sm" style="padding:6px 12px; font-size:0.68rem; border-radius:6px; border-color:rgba(239, 68, 68, 0.2); color:var(--danger);" data-action="markFailed" data-id="${e.id}">
                                    <i class="fa-solid fa-skull"></i> Falhar
                                </button>
                                <!-- Complete -->
                                <button class="btn btn-sm btn-ghost" style="padding:6px 12px; font-size:0.68rem; border-radius:6px; border-color:rgba(34,197,94,0.3); color:#86efac; background:rgba(34,197,94,0.05);" data-action="toggleComplete" data-id="${e.id}" data-type="complete">
                                    <i class="fa-solid fa-check"></i> Concluir
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `}_renderMilestones(e){const t=e.milestones||[];if(t.length===0)return p`
                <div style="font-size:0.7rem; color:var(--text-dim); margin-bottom:12px; font-style:italic;">
                    Nenhum objetivo específico registrado.
                </div>
            `;const o=t.filter(a=>a.completed).length,s=Math.round(o/t.length*100)||0;return p`
            <div style="margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.65rem; color:var(--text-dim); margin-bottom:5px; font-weight:800; letter-spacing:0.5px; text-transform:uppercase;">
                    <span>Objetivos (${o}/${t.length})</span>
                    <span>${s}%</span>
                </div>
                <div style="width:100%; height:5px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden; margin-bottom:10px;">
                    <div style="width:${s}%; height:100%; background:linear-gradient(90deg, var(--accent), #fbbf24); border-radius:3px; transition:width 0.3s ease;"></div>
                </div>
                <div style="display:flex; flex-direction:column; gap:6px; max-height:100px; overflow-y:auto; padding-right:4px;">
                    ${t.map(a=>p`
                        <label style="display:flex; align-items:flex-start; gap:8px; font-size:0.72rem; color:${a.completed?"var(--text-dim)":"var(--text-main)"}; cursor:pointer; text-decoration:${a.completed?"line-through":"none"}; line-height:1.2;">
                            <input type="checkbox" style="accent-color:var(--accent); cursor:pointer; margin-top:2px;" 
                                    ${a.completed?"checked":""} 
                                    data-action="toggleMilestone" 
                                    data-quest-id="${e.id}" 
                                    data-milestone-id="${a.id}" />
                            <span>${a.text}</span>
                        </label>
                    `)}
                </div>
            </div>
        `}_renderFactionsTab(e){return p`
            <div style="display:grid; grid-template-columns: 1fr; gap:20px; animation: cardFadeIn 0.4s ease-out;">
                <div class="card glass-accent" style="padding:20px; border-radius:12px; background:rgba(197,160,89,0.02); border-left:4px solid var(--accent);">
                    <h3 style="font-family:'Cinzel'; margin:0; color:var(--accent);">🚩 Influência de Facções</h3>
                    <p style="font-size:0.8rem; color:var(--text-dim); margin-top:5px; line-height:1.4;">Completar missões delegadas por grupos aumenta o Renome do grupo com eles, destravando favores e suportes táticos.</p>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap:20px;">
                    ${_.map(t=>{const o=e[t.id]||0,s=C(o);return p`
                            <div class="card glass-accent" style="padding:22px; border-radius:14px; border-top: 4px solid ${t.color}; background:rgba(0,0,0,0.25); display:flex; flex-direction:column; justify-content:space-between; min-height:220px;">
                                <div>
                                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                                        <h4 style="font-family:'Cinzel'; font-size:1.15rem; color:#fff; margin:0; display:flex; align-items:center; gap:8px;">
                                            <span>${t.crest}</span> ${t.name}
                                        </h4>
                                    </div>
                                    <p style="font-size:0.65rem; color:var(--text-dim); font-style:italic; margin:0 0 10px 0;">"${t.motto}"</p>
                                    <p style="font-size:0.75rem; color:#cbd5e1; line-height:1.4; margin:0 0 15px 0;">${t.desc}</p>
                                </div>
                                
                                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.03);">
                                    <div>
                                        <div style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase;">Cargo na Facção</div>
                                        <strong style="font-size:0.75rem; color:${s.color};">${s.title}</strong>
                                    </div>
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <button class="btn btn-ghost" style="padding:2px 8px; font-size:0.75rem; border-radius:4px; border-color:rgba(255,255,255,0.15);" data-action="adjustRenown" data-faction="${t.id}" data-delta="-1">-</button>
                                        <strong style="font-size:1.2rem; font-family:'Cinzel'; color:var(--accent); min-width:25px; text-align:center;">${o}</strong>
                                        <button class="btn btn-ghost" style="padding:2px 8px; font-size:0.75rem; border-radius:4px; border-color:rgba(255,255,255,0.15);" data-action="adjustRenown" data-faction="${t.id}" data-delta="1">+</button>
                                    </div>
                                </div>
                            </div>
                        `})}
                </div>
            </div>
        `}_renderChroniclesTab(){const e=this.store.state.chronicleEntries||[];return p`
            <div style="animation: cardFadeIn 0.4s ease-out; max-width:800px; margin: 0 auto;">
                <div class="card glass-accent" style="padding:22px; border-radius:12px; margin-bottom:30px; background:rgba(10,12,16,0.6);">
                    <h4 style="font-family:'Cinzel'; color:var(--accent); margin:0 0 10px 0;"><i class="fa-solid fa-feather"></i> Escrever Nova Crônica de Feitos</h4>
                    <form id="chronicle-manual-form" style="display:flex; gap:10px;">
                        <input type="text" id="manual-chronicle-text" placeholder="Ex: Dia 18 da Primavera: O grupo explorou as Minas Perdidas de Phandelver e encontrou a Forja das Magias..." required
                               style="flex:1; background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); border-radius:8px; padding:10px 15px; color:#fff; font-size:0.8rem; outline:none; font-family:'Outfit';" />
                        <button type="submit" class="btn btn-primary" style="font-family:'Cinzel'; font-weight:800; font-size:0.75rem; display:inline-flex; align-items:center; gap:6px; border-radius:8px;">
                            ✍️ Registrar Feito
                        </button>
                    </form>
                </div>

                <h3 style="font-family:'Cinzel'; color:var(--accent); text-align:center; margin-bottom:35px; text-shadow:0 0 10px rgba(197,160,89,0.3);">
                    📜 CRÔNICAS DA CAMPANHA
                </h3>

                <div class="chronicle-timeline">
                    ${e.length===0?p`
                        <div style="text-align:center; color:var(--text-dim); padding:40px; font-style:italic; font-size:0.85rem;">
                            Nenhum feito crônico registrado na linha do tempo. Complete missões ou insira um feito acima!
                        </div>
                    `:e.slice().reverse().map(t=>{const o=new Date(t.timestamp).toLocaleString("pt-BR",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});let s="✍️",a="rgba(255,255,255,0.04)",n="var(--text-main)";return t.type==="quest_completed"?(s="🏆",a="rgba(34,197,94,0.08)",n="#86efac"):t.type==="quest_failed"?(s="💀",a="rgba(239,68,68,0.08)",n="#fca5a5"):t.type==="level_up"?(s="✨",a="rgba(251,191,36,0.08)",n="#fde047"):t.type==="loot_divided"?(s="💰",a="rgba(52,211,153,0.08)",n="#6ee7b7"):t.type==="renown_change"&&(s="🚩",a="rgba(168,85,247,0.08)",n="#c084fc"),p`
                            <div class="chronicle-node">
                                <div class="chronicle-dot"></div>
                                <div class="card glass" style="padding:15px 20px; background:${a}; border:1px solid rgba(255,255,255,0.05); border-radius:10px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:0.65rem; color:var(--text-dim); font-weight:800;">
                                        <span>Sessão #${t.session||1} • ${s} ${t.type.toUpperCase().replace("_"," ")}</span>
                                        <span>${o}</span>
                                    </div>
                                    <p style="margin:0; font-size:0.85rem; color:${n}; line-height:1.5; font-family:'Outfit'; font-weight:600;">
                                        ${t.text}
                                    </p>
                                </div>
                            </div>
                        `})}
                </div>
            </div>
        `}_renderEmptyState(){return p`
            <div class="empty-state" style="grid-column:1 / -1; padding:70px; text-align:center; border:1.5px dashed rgba(197,160,89,0.2); border-radius:12px; background:rgba(197,160,89,0.02); animation: cardFadeIn 0.5s ease;">
                <i class="fa-solid fa-feather-pointed" style="font-size:2.5rem; opacity:0.3; color:var(--accent); margin-bottom:15px; display:block;"></i>
                <h3 style="font-family:'Cinzel', serif; color:#fff; font-size:1.15rem; margin:0 0 5px 0;">Crônica Sem Registros</h3>
                <p style="font-size:0.8rem; color:var(--text-dim); max-width:350px; margin:0 auto; line-height:1.4;">Clique em "Criar Missão" ou consulte a inteligência artificial para sugerir rumores e aventuras baseados nos acontecimentos do grupo.</p>
            </div>
        `}_renderLootModal(){var o;const e=(o=this.store.state.quests)==null?void 0:o.find(s=>String(s.id)===String(this._showLootModalId));if(!e)return"";const t=this.store.state.players||[];return p`
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(5px); z-index:2000; display:flex; align-items:center; justify-content:center; padding:20px;" onclick="this.closest('.quest-manager').__component.closeLootModal()">
                <div class="card glass-accent animate-scaleIn" style="max-width:500px; width:100%; padding:30px; border:2px solid var(--accent); border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,0.9); text-align:left; background:rgba(10,12,16,0.95);" onclick="event.stopPropagation()">
                    <div style="text-align:center; margin-bottom:20px; border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:15px;">
                        <i class="fa-solid fa-gift fa-3x" style="color:var(--accent); margin-bottom:10px;"></i>
                        <h3 style="font-family:'Cinzel'; color:var(--accent); margin:0; font-size:1.6rem;">💰 Distribuir Tesouro</h3>
                        <p style="font-size:0.8rem; color:var(--text-dim); margin-top:8px;">
                            Recompensa da Missão: <strong style="color:#fff;">"${e.reward}"</strong>
                        </p>
                    </div>

                    <!-- Input Gold -->
                    <div class="form-group" style="margin-bottom:15px;">
                        <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; color:var(--accent); font-weight:800;">Ouro Total a Dividir (GP / PO)</label>
                        <input type="number" id="loot-gold-input" value="${this._lootGold}" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); border-radius:8px; padding:8px 12px; color:#fff; width:100%; font-size:0.85rem; outline:none;" oninput="this.closest('.quest-manager').__component._lootGold = parseInt(this.value) || 0" />
                    </div>

                    <!-- Input Items -->
                    <div class="form-group" style="margin-bottom:20px;">
                        <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; color:var(--accent); font-weight:800;">Itens Mágicos / Equipamentos a Entregar</label>
                        <input type="text" id="loot-items-input" value="${this._lootItems}" placeholder="Ex: Poção de Cura Maior, Anel de Proteção" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); border-radius:8px; padding:8px 12px; color:#fff; width:100%; font-size:0.85rem; outline:none;" oninput="this.closest('.quest-manager').__component._lootItems = this.value" />
                    </div>

                    <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; color:var(--accent); font-weight:800; display:block; margin-bottom:8px;">Selecione os Heróis Beneficiários</label>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:25px; max-height:180px; overflow-y:auto; padding-right:5px; scrollbar-width:thin;">
                        ${t.map(s=>{const a=this._selectedLootPlayers.includes(s.id);return p`
                                <label style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:${a?"rgba(197,160,89,0.08)":"rgba(255,255,255,0.02)"}; border-radius:10px; cursor:pointer; border:1px solid ${a?"var(--accent)":"rgba(255,255,255,0.06)"}; transition:all 0.2s;">
                                    <input type="checkbox" style="width:18px; height:18px; accent-color:var(--accent); cursor:pointer;" 
                                           ${a?"checked":""}
                                           onchange="this.closest('.quest-manager').__component.toggleLootPlayer('${s.id}')" />
                                    <div style="flex:1;">
                                        <div style="font-weight:800; font-size:0.9rem; color:#fff;">${s.name}</div>
                                        <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase;">${s.class||"Aventureiro"}</div>
                                    </div>
                                </label>
                            `})}
                    </div>

                    <div style="display:flex; gap:12px;">
                        <button class="btn btn-ghost btn-block" style="border-radius:10px; padding:12px;" data-action="closeLootModal">Cancelar</button>
                        <button class="btn btn-primary btn-block" style="border-radius:10px; padding:12px; font-weight:800;" data-action="confirmLootDistribution" ${this._selectedLootPlayers.length===0?"disabled":""}>
                            Confirmar Distribuição
                        </button>
                    </div>
                </div>
            </div>
        `}toggleForm(){this._showForm=!this._showForm,this.render()}setTab(e,t){this._activeTab=t.dataset.tab,this.render()}filterType(e,t){this._filterType=t.value,this.render()}search(e,t){this._searchQuery=t.value,clearTimeout(this._searchTimer),this._searchTimer=setTimeout(()=>this.render(),300)}toggleComplete(e,t){var n;e&&e.stopPropagation();const o=t.dataset.id,s=t.dataset.type;m.store.update(i=>{i.quests=(i.quests||[]).map(r=>{if(String(r.id)===String(o)){const l=s==="reactivate"?!1:!r.completed;if(l&&!r.completed){const c=i.sessionNumber||1,d=`⚔️ MISSÃO CONCLUÍDA: Os heróis completaram a missão "${r.title}"!`;if(i.journalEntries=[...i.journalEntries||[],{id:"log-"+Date.now()+"-"+Math.floor(Math.random()*100),session:c,timestamp:Date.now(),text:d,type:"system"}],r.faction&&r.faction!=="Nenhuma"){const b=r.difficulty==="easy"?1:r.difficulty==="hard"?3:r.difficulty==="deadly"?5:2;i.factionRenown=i.factionRenown||{Harpers:0,Alliance:0,Gauntlet:0,Enclave:0,Zhentarim:0};const h={Harpistas:"Harpers","Aliança dos Lordes":"Alliance","Ordem da Manopla":"Gauntlet","Enclave Esmeralda":"Enclave",Zhentarim:"Zhentarim"}[r.faction]||"Harpers";i.factionRenown[h]=(i.factionRenown[h]||0)+b;const y=`🚩 RENOME DE FACÇÃO: A influência com os ${r.faction} aumentou em +${b} pontos pela conclusão de "${r.title}".`;i.journalEntries.push({id:"log-f-"+Date.now(),session:c,timestamp:Date.now(),text:y,type:"system"})}}return{...r,completed:l,failed:!1,status:l?"completed":"active"}}return r})});const a=(n=this.store.state.quests)==null?void 0:n.find(i=>String(i.id)===String(o));a&&(s!=="reactivate"&&a.completed?f(this.store,`Aventura Concluída: "${a.title}". Os heróis conquistaram as metas e foram agraciados com recompensas.`,"quest_completed"):s==="reactivate"&&f(this.store,`Missão Reaberta: A crônica de "${a.title}" volta a ficar ativa no diário de aventuras.`,"custom")),m.persistence.save().catch(i=>console.warn(i)),this.render()}markFailed(e,t){var s;e&&e.stopPropagation();const o=t.dataset.id;if(confirm("Marcar esta missão como fracassada? O fracasso será arquivado na crônica da campanha.")){m.store.update(n=>{n.quests=(n.quests||[]).map(i=>{if(String(i.id)===String(o)){const r=n.sessionNumber||1,l=`💀 MISSÃO FRACASSADA: Os heróis falharam na missão "${i.title}".`;return n.journalEntries=[...n.journalEntries||[],{id:"log-"+Date.now()+"-"+Math.floor(Math.random()*100),session:r,timestamp:Date.now(),text:l,type:"system"}],{...i,failed:!0,completed:!1,status:"failed"}}return i})});const a=(s=this.store.state.quests)==null?void 0:s.find(n=>String(n.id)===String(o));a&&f(this.store,`Aventura Fracassada: "${a.title}". Um capítulo sombrio se fecha com a derrota ou falha dos heróis nas suas metas.`,"quest_failed"),m.persistence.save().catch(n=>console.warn(n)),this.render()}}deleteQuest(e,t){e&&e.stopPropagation();const o=t.dataset.id;confirm("Deseja excluir esta missão permanentemente? Esta ação não pode ser desfeita.")&&(m.store.update(s=>{s.quests=(s.quests||[]).filter(a=>String(a.id)!==String(o))}),m.persistence.save().catch(s=>console.warn(s)),this.render(),u.show("Missão removida permanentemente."))}toggleMilestone(e,t){const o=t.dataset.questId,s=t.dataset.milestoneId,a=t.checked;m.store.update(n=>{n.quests=(n.quests||[]).map(i=>{if(String(i.id)===String(o)){const r=(i.milestones||[]).map(l=>String(l.id)===String(s)?{...l,completed:a}:l);return{...i,milestones:r}}return i})}),m.persistence.save().catch(n=>console.warn(n)),this.render()}addMilestoneInline(e,t){e&&e.stopPropagation();const o=t.dataset.id,s=this.$(`#new-milestone-${o}`);if(!s||!s.value.trim())return;const a=s.value.trim();m.store.update(n=>{n.quests=(n.quests||[]).map(i=>{if(String(i.id)===String(o)){const r=i.milestones||[];return{...i,milestones:[...r,{id:"m-"+Date.now()+"-"+Math.floor(Math.random()*100),text:a,completed:!1}]}}return i})}),m.persistence.save().catch(n=>console.warn(n)),s.value="",this.render()}distributeQuestXP(e,t){var i;e&&e.stopPropagation();const o=t.dataset.id,s=(i=this.store.state.quests)==null?void 0:i.find(r=>String(r.id)===String(o));if(!s||!s.xpReward||s.xpDistributed)return;const a=parseInt(s.xpReward)||0;if(a<=0)return;const n=this.store.state.players||[];if(n.length===0){u.show("Nenhum herói ativo na campanha para receber XP!","error");return}m.store.update(r=>{r.players=(r.players||[]).map(d=>({...d,xp:(parseInt(d.xp)||0)+a})),r.quests=(r.quests||[]).map(d=>String(d.id)===String(o)?{...d,xpDistributed:!0}:d),r.xpDistributed=(r.xpDistributed||0)+a*n.length;const l=r.sessionNumber||1,c=`🏆 XP DA MISSÃO: Distribuído +${a} XP para todos os heróis pela conclusão de "${s.title}".`;r.journalEntries=[...r.journalEntries||[],{id:"log-"+Date.now()+"-"+Math.floor(Math.random()*100),session:l,timestamp:Date.now(),text:c,type:"system"}]}),m.persistence.save().catch(r=>console.warn(r)),u.show(`+${a} XP distribuído para ${n.length} heróis!`,"success"),this.render()}triggerMilestoneLevelUp(e,t){var n;e&&e.stopPropagation();const o=t.dataset.id,s=(n=this.store.state.quests)==null?void 0:n.find(i=>String(i.id)===String(o));if(!s||s.milestoneLeveled)return;const a=this.store.state.players||[];if(a.length===0){u.show("Nenhum herói ativo na campanha para receber evolução!","error");return}confirm(`Deseja aplicar um LEVEL UP geral para todos os ${a.length} heróis ativos pela conclusão do marco "${s.title}"?`)&&(m.store.update(i=>{i.players=(i.players||[]).map(c=>{const d=(parseInt(c.level)||1)+1;return{...c,level:d}}),i.quests=(i.quests||[]).map(c=>String(c.id)===String(o)?{...c,milestoneLeveled:!0,xpDistributed:!0}:c);const r=i.sessionNumber||1,l=`✨ EVOLUÇÃO POR MARCO: O grupo alcançou o marco "${s.title}" e subiu de nível!`;i.journalEntries=[...i.journalEntries||[],{id:"log-milestone-"+Date.now(),session:r,timestamp:Date.now(),text:l,type:"system"}]}),f(this.store,`Marco Avançado: O grupo subiu de nível! Todos os heróis agora são nível superior graças à conclusão de "${s.title}".`,"level_up"),m.persistence.save().catch(i=>console.warn(i)),u.show("✨ Grupo subiu de nível com sucesso!","success"),this.render())}openQuestLootModal(e,t){var l;e&&e.stopPropagation();const o=t.dataset.id,s=(l=this.store.state.quests)==null?void 0:l.find(c=>String(c.id)===String(o));if(!s)return;let a=0;const n=s.reward||"",i=n.match(/(\d+)\s*(?:gp|GP|po|PO|ouro|Ouro)/);i&&(a=parseInt(i[1])||0);const r=n.replace(/(\d+)\s*(?:gp|GP|po|PO|ouro|Ouro)(?:,?\s*e?\s*)?/,"").trim();this._showLootModalId=o,this._selectedLootPlayers=(this.store.state.players||[]).map(c=>c.id),this._lootGold=a,this._lootItems=r!=="Nenhuma"?r:"",this.render()}closeLootModal(){this._showLootModalId=null,this.render()}toggleLootPlayer(e){this._selectedLootPlayers.includes(e)?this._selectedLootPlayers=this._selectedLootPlayers.filter(t=>t!==e):this._selectedLootPlayers.push(e),this.render()}confirmLootDistribution(){var n;if(!this._showLootModalId||this._selectedLootPlayers.length===0)return;const e=this._showLootModalId,t=parseInt(this._lootGold)||0,o=(this._lootItems||"").trim(),s=t>0?Math.floor(t/this._selectedLootPlayers.length):0;t>0&&t%this._selectedLootPlayers.length,m.store.update(i=>{i.players.forEach(d=>{this._selectedLootPlayers.includes(d.id)&&(d.currency||(d.currency={pp:0,gp:0,ep:0,sp:0,cp:0}),d.currency.gp=(parseInt(d.currency.gp)||0)+s,o&&(d.equipment||(d.equipment={items:[],notes:""}),typeof d.equipment.items=="string"?d.equipment.items=d.equipment.items.trim()?d.equipment.items+`
• `+o:"• "+o:(d.equipment.items=d.equipment.items||[],d.equipment.items.push({id:"item-"+Date.now()+"-"+Math.floor(Math.random()*100),name:o,qty:1,weight:.5}))))}),i.quests=(i.quests||[]).map(d=>String(d.id)===String(e)?{...d,rewardDistributed:!0}:d);const r=i.players.filter(d=>this._selectedLootPlayers.includes(d.id)).map(d=>d.name).join(", "),l=i.sessionNumber||1;let c=`💰 DIVISÃO DE SAQUE: Riquezas da missão foram distribuídas para: ${r}.`;t>0&&(c+=` Cada herói recebeu +${s} PO.`),o&&(c+=` Itens entregues: "${o}".`),i.journalEntries=[...i.journalEntries||[],{id:"log-loot-"+Date.now(),session:l,timestamp:Date.now(),text:c,type:"loot"}]});const a=(n=this.store.state.quests)==null?void 0:n.find(i=>String(i.id)===String(e));if(a){let i=`Tesouros da missão "${a.title}" divididos entre o grupo.`;t>0&&(i+=` +${t} PO partilhados.`),o&&(i+=` Artefatos obtidos: ${o}.`),f(this.store,i,"loot_divided")}m.persistence.save().catch(i=>console.warn(i)),u.show("Riquezas e itens distribuídos com sucesso!","success"),this._showLootModalId=null,this.render()}adjustRenown(e,t){e&&e.stopPropagation();const o=t.dataset.faction,s=parseInt(t.dataset.delta)||0;m.store.update(a=>{a.factionRenown=a.factionRenown||{Harpers:0,Alliance:0,Gauntlet:0,Enclave:0,Zhentarim:0};const i={Harpistas:"Harpers","Aliança dos Lordes":"Alliance","Ordem da Manopla":"Gauntlet","Enclave Esmeralda":"Enclave",Zhentarim:"Zhentarim"}[o]||"Harpers",r=a.factionRenown[i]||0,l=Math.max(0,r+s);a.factionRenown[i]=l;const c=a.sessionNumber||1,d=`🚩 RENOME DE FACÇÃO: Ajustado prestígio com os ${o} (${r} → ${l}).`;a.journalEntries.push({id:"log-ren-man-"+Date.now(),session:c,timestamp:Date.now(),text:d,type:"system"})}),f(this.store,`Reputação Alterada: A influência do grupo com os ${o} foi reajustada para ${this.store.state.factionRenown[o==="Harpistas"?"Harpers":o==="Aliança dos Lordes"?"Alliance":o==="Ordem da Manopla"?"Gauntlet":o==="Enclave Esmeralda"?"Enclave":"Zhentarim"]} pontos.`,"renown_change"),m.persistence.save().catch(a=>console.warn(a)),this.render()}calcSuggestedXP(e,t){e&&e.stopPropagation();const o=this.$("#quest-difficulty-select"),s=o?o.value:"medium",a=parseInt(t.dataset.avgLevel)||1,n=v[s]||v.medium,i=Math.max(0,Math.min(19,a-1)),r=n[i]||100,l=this.$("#quest-xp-reward-input");l&&(l.value=r,u.show(`Sugestão de XP calculada para Nível ${a} (${s}): +${r} XP por herói.`,"info"))}addManualChronicle(e,t){const o=this.$("#manual-chronicle-text");if(!o||!o.value.trim())return;const s=o.value.trim();f(this.store,s,"custom"),m.persistence.save().catch(a=>console.warn(a)),o.value="",this.render(),u.show("Acontecimento adicionado à linha do tempo!")}async generateAIRumor(){u.show("Consultando oráculo narrativo...");const e=(this.store.state.quests||[]).map(o=>o.title).join(", "),t=await m.ai.generateRumor(e);confirm(`🤖 O oráculo narrativo sugere este boato/rumor:

"${t}"

Deseja incorporá-lo como uma missão secundária?`)&&(m.store.update(o=>{o.quests=[...o.quests||[],{id:"q-"+Date.now(),title:"Rumor: "+(t.length>30?t.substring(0,30)+"...":t),description:t,type:"side",difficulty:"medium",levelRange:"1-4",faction:"Nenhuma",xpType:"xp",xpReward:150,reward:"Informações ou favores locais",milestones:[{id:"m-ai-1",text:"Investigar a veracidade do boato com locais",completed:!1},{id:"m-ai-2",text:"Resolver a origem do rumor",completed:!1}],completed:!1,failed:!1,xpDistributed:!1,status:"active"}]}),f(this.store,`Boato Espalhado: Circula o rumor "${t}". A crônica adicionou esta busca à linha de investigações.`,"custom"),m.persistence.save().catch(o=>console.warn(o)),this.render(),u.show("Missão adicionada à crônica!"))}onMount(){this.element.classList.add("quest-manager"),this.element.__component=this;const e=this.$("#quest-form");e&&(e.onsubmit=o=>{o.preventDefault();const s=new FormData(e),a=Object.fromEntries(s.entries());let n=[];a.initialMilestones&&a.initialMilestones.trim()&&(n=a.initialMilestones.split(",").map(r=>r.trim()).filter(r=>r.length>0).map((r,l)=>({id:"m-init-"+Date.now()+"-"+l,text:r,completed:!1})));const i={id:"q-"+Date.now(),title:a.title.trim(),description:a.description.trim(),type:a.type,difficulty:a.difficulty,levelRange:a.levelRange,faction:a.faction,xpType:a.xpType,xpReward:a.xpType==="xp"&&parseInt(a.xpReward)||0,reward:a.reward?a.reward.trim():"Nenhuma",milestones:n,completed:!1,failed:!1,xpDistributed:!1,status:"active"};m.store.update(r=>{r.quests=[...r.quests||[],i];const l=r.sessionNumber||1,c=`📜 NOVA MISSÃO INICIADA: "${i.title}" (${a.type==="main"?"Principal":"Secundária"}).`;r.journalEntries=[...r.journalEntries||[],{id:"log-"+Date.now()+"-"+Math.floor(Math.random()*100),session:l,timestamp:Date.now(),text:c,type:"system"}]}),f(this.store,`Nova Missão Iniciada: Os heróis juraram cumprir os objetivos da busca "${i.title}".`,"custom"),m.persistence.save().catch(r=>console.warn(r)),this._showForm=!1,u.show("Nova missão proclamada com sucesso!"),this.render()});const t=this.$("#chronicle-manual-form");t&&(t.onsubmit=o=>{o.preventDefault(),this.addManualChronicle()})}}export{R as QuestManager};
