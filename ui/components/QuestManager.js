import { Component } from '../core/Component.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';

// D&D 5e DMG Encounter XP thresholds per player character
const XP_THRESHOLDS = {
    easy: [25, 50, 75, 125, 250, 300, 350, 450, 550, 600, 800, 1000, 1100, 1250, 1400, 1600, 2000, 2100, 2400, 2800],
    medium: [50, 100, 150, 250, 500, 600, 750, 900, 1100, 1200, 1600, 2000, 2200, 2500, 2800, 3200, 3900, 4200, 4900, 5700],
    hard: [75, 150, 225, 375, 750, 900, 1100, 1400, 1600, 1900, 2400, 3000, 3400, 3800, 4300, 4800, 5900, 6300, 7300, 8500],
    deadly: [100, 200, 400, 500, 1100, 1400, 1700, 2100, 2400, 2800, 3600, 4500, 5100, 5700, 6400, 7200, 8800, 9500, 10900, 12700]
};

// D&D 5e Factions definition
const FACTIONS = [
    {
        id: 'Harpistas',
        name: 'Harpistas (Harpers)',
        motto: 'Quem luta contra a escuridão nunca está sozinho.',
        desc: 'Uma rede dispersa de magos e espiões que defendem a igualdade, preservam o conhecimento histórico e combatem a ascensão de tiranos.',
        crest: '🌙⚔️',
        color: '#3498db'
    },
    {
        id: 'Aliança dos Lordes',
        name: 'Aliança dos Lordes (Lords\' Alliance)',
        motto: 'A união faz a força e a ordem gera a prosperidade.',
        desc: 'Uma coalizão de governantes de grandes cidades do Norte que se unem para afastar ameaças externas e manter a lei e o comércio nas estradas.',
        crest: '👑🛡️',
        color: '#c5a059'
    },
    {
        id: 'Ordem da Manopla',
        name: 'Ordem da Manopla (Order of the Gauntlet)',
        motto: 'A fé é o nosso escudo, a justiça é a nossa espada.',
        desc: 'Um grupo vigilante de paladinos, clérigos e guerreiros dedicados a purificar o mal antes que ele possa criar raízes, focados em honra e ação rápida.',
        crest: '✊☀️',
        color: '#ef4444'
    },
    {
        id: 'Enclave Esmeralda',
        name: 'Enclave Esmeralda (Emerald Enclave)',
        motto: 'O equilíbrio na natureza garante a sobrevivência de todos.',
        desc: 'Guardiões selvagens, druidas e patrulheiros dedicados a manter a harmonia entre a civilização e a natureza indomável, combatendo aberrações e flagelos.',
        crest: '🍃🏹',
        color: '#2ecc71'
    },
    {
        id: 'Zhentarim',
        name: 'Zhentarim (Rede Sombria)',
        motto: 'O poder pertence àqueles com ambição para tomá-lo.',
        desc: 'Uma organização mercantil mercenária e nas sombras, focada em obter monopólios comerciais e influência política. Oferece segurança pelo preço certo.',
        crest: '🚩🐉',
        color: '#a855f7'
    }
];

// Helper to determine faction rank
function getRenownRank(points) {
    if (points >= 50) return { title: 'Grão-Mestre / Líder (Rank 5)', color: '#a855f7' };
    if (points >= 25) return { title: 'Mentor / Alto Conselheiro (Rank 4)', color: '#fbbf24' };
    if (points >= 10) return { title: 'Aliado Fiel (Rank 3)', color: '#3b82f6' };
    if (points >= 3) return { title: 'Agente / Representante (Rank 2)', color: '#2ecc71' };
    return { title: 'Iniciado / Recruta (Rank 1)', color: '#94a3b8' };
}

// Helper to log chronicle entries
function logChronicleEntry(store, text, type = 'custom') {
    const sessionNum = store.state.sessionNumber || 1;
    store.update(s => {
        s.chronicleEntries = [...(s.chronicleEntries || []), {
            id: 'chron-' + Date.now() + '-' + Math.floor(Math.random() * 100),
            session: sessionNum,
            timestamp: Date.now(),
            text,
            type
        }];
    });
}

/**
 * QUEST MANAGER v3.0 — D&D 5e Chronicles & Quests Engine
 * Handles narration timelines, faction reputation, milestones, and advanced loot splits.
 */
export class QuestManager extends Component {
    constructor(opts) {
        super(opts);
        this._showForm = false;
        this._activeTab = 'active'; // 'active' | 'completed' | 'failed' | 'factions' | 'chronicles'
        this._searchQuery = '';
        this._filterType = 'all';
        
        // Loot Distribution Modal State
        this._showLootModalId = null;
        this._selectedLootPlayers = [];
        this._lootGold = 0;
        this._lootItems = '';
    }

    template() {
        const quests = this.store.state.quests || [];
        const renown = this.store.state.factionRenown || { Harpers: 0, Alliance: 0, Gauntlet: 0, Enclave: 0, Zhentarim: 0 };
        
        // Filter quests based on state
        const filtered = quests.filter(q => {
            // Tab filter
            if (this._activeTab === 'completed' && !q.completed) return false;
            if (this._activeTab === 'failed' && !q.failed) return false;
            if (this._activeTab === 'active' && (q.completed || q.failed)) return false;

            // Search filter
            const query = this._searchQuery.toLowerCase().trim();
            if (query) {
                const matchesTitle = q.title?.toLowerCase().includes(query);
                const matchesDesc = q.description?.toLowerCase().includes(query);
                const matchesReward = q.reward?.toLowerCase().includes(query);
                const matchesFaction = q.faction?.toLowerCase().includes(query);
                if (!matchesTitle && !matchesDesc && !matchesReward && !matchesFaction) return false;
            }

            // Type filter
            if (this._filterType !== 'all' && q.type !== this._filterType) return false;

            return true;
        });

        // Count stats
        const activeCount = quests.filter(q => !q.completed && !q.failed).length;
        const completedCount = quests.filter(q => q.completed).length;
        const failedCount = quests.filter(q => q.failed).length;

        // Calculate average player level for form display
        const players = this.store.state.players || [];
        const avgLevel = players.length > 0 
            ? Math.round(players.reduce((sum, p) => sum + (parseInt(p.level) || 1), 0) / players.length)
            : 1;

        return `
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
                            <i class="fa-solid ${this._showForm ? 'fa-xmark' : 'fa-plus'}"></i> 
                            ${this._showForm ? 'Cancelar' : 'Criar Missão'}
                        </button>
                    </div>
                </div>

                <!-- Filters Control Bar -->
                <div class="glass" style="padding: 15px; border-radius: 12px; margin-bottom: 25px; display: flex; gap: 15px; align-items: center; justify-content: space-between; flex-wrap: wrap; border: 1px solid rgba(197,160,89,0.15); background: rgba(0,0,0,0.15);">
                    <!-- Tabs -->
                    <div style="display: flex; gap: 5px;">
                        <button class="quest-tab ${this._activeTab === 'active' ? 'active' : ''}" data-action="setTab" data-tab="active">
                            ⚔️ Ativas <span class="quest-badge-num">${activeCount}</span>
                        </button>
                        <button class="quest-tab ${this._activeTab === 'completed' ? 'active' : ''}" data-action="setTab" data-tab="completed">
                            🏆 Concluídas <span class="quest-badge-num">${completedCount}</span>
                        </button>
                        <button class="quest-tab ${this._activeTab === 'failed' ? 'active' : ''}" data-action="setTab" data-tab="failed">
                            💀 Fracassadas <span class="quest-badge-num">${failedCount}</span>
                        </button>
                        <button class="quest-tab ${this._activeTab === 'factions' ? 'active' : ''}" data-action="setTab" data-tab="factions">
                            🚩 Facções & Renome
                        </button>
                        <button class="quest-tab ${this._activeTab === 'chronicles' ? 'active' : ''}" data-action="setTab" data-tab="chronicles">
                            📜 Linha do Tempo
                        </button>
                    </div>

                    <!-- Filters and Search -->
                    ${this._activeTab !== 'factions' && this._activeTab !== 'chronicles' ? `
                    <div style="display: flex; gap: 10px; align-items: center; flex: 1; max-width: 500px; justify-content: flex-end; width: 100%;">
                        <select data-action="filterType" style="background: rgba(8, 8, 10, 0.8); border: 1.5px solid rgba(197,160,89,0.25); padding: 8px 12px; border-radius: 8px; color: #fff; font-size: 0.75rem; outline: none; cursor: pointer; height: 36px;">
                            <option value="all" ${this._filterType === 'all' ? 'selected' : ''}>Todos os Tipos</option>
                            <option value="main" ${this._filterType === 'main' ? 'selected' : ''}>⚜️ Principal</option>
                            <option value="side" ${this._filterType === 'side' ? 'selected' : ''}>🗺️ Secundária</option>
                            <option value="personal" ${this._filterType === 'personal' ? 'selected' : ''}>👤 Pessoal</option>
                            <option value="faction" ${this._filterType === 'faction' ? 'selected' : ''}>🚩 Facção</option>
                        </select>
                        
                        <div style="position: relative; max-width: 250px; width: 100%;">
                            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--accent); font-size: 0.8rem;"></i>
                            <input type="text" placeholder="Buscar missão..." 
                                   value="${this._searchQuery}"
                                   style="width: 100%; padding: 8px 10px 8px 34px; border-radius: 8px; border: 1.5px solid rgba(197,160,89,0.25); background: rgba(8, 8, 10, 0.8); color: #fff; font-size: 0.75rem; outline: none; height: 36px;"
                                   data-action="search">
                        </div>
                    </div>
                    ` : ''}
                </div>

                ${this._showForm ? this._renderForm(avgLevel) : ''}

                <!-- Main Content Pane based on Tab selection -->
                ${this._activeTab === 'factions' ? this._renderFactionsTab(renown) : 
                  this._activeTab === 'chronicles' ? this._renderChroniclesTab() : `
                  <!-- Quests Grid -->
                  <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                      ${filtered.length ? filtered.map(q => this._renderQuestCard(q)).join('') : this._renderEmptyState()}
                  </div>
                `}

                <!-- Loot Distribution Modal -->
                ${this._showLootModalId ? this._renderLootModal() : ''}
            </div>
        `;
    }

    _renderForm(avgLevel) {
        return `
            <div class="card glass-accent" style="margin-bottom:30px; border-radius: 12px; padding: 25px; animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1.5px solid rgba(197,160,89,0.3); background: rgba(10,12,16,0.85); backdrop-filter: blur(15px);">
                <form id="quest-form" style="display:flex; flex-direction:column; gap:16px;">
                    <!-- Title -->
                    <div class="form-group">
                        <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; letter-spacing:0.5px; color:var(--accent); font-weight:800;">Título da Missão</label>
                        <input type="text" name="title" class="form-input" required placeholder="Ex: O Segredo do Forte Sombrio" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); font-family:'Outfit';">
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
                                    <input type="radio" name="xpType" value="xp" checked style="accent-color:var(--accent);" onchange="document.getElementById('xp-value-input-wrapper').style.display='block'">
                                    Experiência (XP)
                                </label>
                                <label style="font-size:0.75rem; color:#fff; cursor:pointer; display:flex; align-items:center; gap:6px;">
                                    <input type="radio" name="xpType" value="milestone" style="accent-color:var(--accent);" onchange="document.getElementById('xp-value-input-wrapper').style.display='none'">
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
                                <button type="button" class="btn btn-ghost btn-sm" style="font-size:0.6rem; padding:1px 6px; height:auto;" data-action="calcSuggestedXP" data-avg-level="${avgLevel}">
                                    🔮 Sugerir XP (Nv Médio: ${avgLevel})
                                </button>
                            </div>
                            <input type="number" id="quest-xp-reward-input" name="xpReward" class="form-input" min="0" placeholder="Ex: 500" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); font-family:'Outfit';">
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; letter-spacing:0.5px; color:var(--accent); font-weight:800;">Recompensa Física (Ouro / Itens Mágicos)</label>
                            <input type="text" name="reward" class="form-input" placeholder="Ex: 250 GP, Poção de Cura Maior" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); font-family:'Outfit';">
                        </div>
                    </div>

                    <!-- Initial Milestones/Objectives -->
                    <div class="form-group">
                        <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; letter-spacing:0.5px; color:var(--accent); font-weight:800;">Etapas da Missão (Objetivos do checklist - separados por vírgula)</label>
                        <input type="text" name="initialMilestones" class="form-input" placeholder="Ex: Investigar as ruínas, Encontrar a chave da cripta, Banir o espírito" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); font-family:'Outfit';">
                    </div>

                    <button type="submit" class="btn btn-primary btn-block" style="padding:12px; font-family:'Cinzel'; font-weight:900; letter-spacing:1.5px; margin-top:8px;">
                        ⚔️ PROCLAMAR MISSÃO
                    </button>
                </form>
            </div>
        `;
    }

    _renderQuestCard(q) {
        const colors = { main: '#c5a059', side: '#3498db', personal: '#2ecc71', faction: '#a855f7' };
        const labels = { main: '⚜️ Principal', side: '🗺️ Secundária', personal: '👤 Pessoal', faction: '🚩 Facção' };
        
        const diffColors = { easy: '#22c55e', medium: '#e5c17b', hard: '#f59e0b', deadly: '#ef4444' };
        const diffLabels = { easy: 'Fácil (CD 10)', medium: 'Média (CD 15)', hard: 'Difícil (CD 20)', deadly: 'Mortal (CD 25+)' };

        let borderStyle = '';
        if (q.completed) {
            borderStyle = `border: 1.5px solid rgba(34, 197, 94, 0.4); box-shadow: 0 4px 15px rgba(34, 197, 94, 0.08); opacity: 0.8;`;
        } else if (q.failed) {
            borderStyle = `border: 1.5px solid rgba(239, 68, 68, 0.4); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.08); opacity: 0.8;`;
        } else {
            borderStyle = `border: 1.5px solid rgba(255, 255, 255, 0.04); border-top: 4.5px solid ${colors[q.type] || 'var(--text-dim)'};`;
        }

        const cardClass = (q.completed || q.failed) ? 'card glass' : 'card glass-accent';
        const titleStyle = q.completed ? 'text-decoration: line-through; color: var(--text-dim);' : q.failed ? 'text-decoration: line-through; color: var(--danger);' : 'color: #fff;';

        const difficultyLabel = diffLabels[q.difficulty] || 'Média';
        const difficultyColor = diffColors[q.difficulty] || 'var(--accent)';

        return `
            <div class="${cardClass}" style="padding: 22px; border-radius: 14px; transition: all 0.25s ease; animation: cardFadeIn 0.4s ease-out; ${borderStyle} display:flex; flex-direction:column; justify-content:space-between; min-height:380px;">
                <div>
                    <!-- Badge header -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <span class="badge" style="background:rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 800; color:${colors[q.type]}; border: 1px solid rgba(255,255,255,0.05);">
                            ${labels[q.type] || q.type}
                        </span>
                        
                        <!-- Difficulty and level -->
                        <div style="display:flex; gap:6px; align-items:center;">
                            <span style="font-size:0.6rem; padding: 2px 6px; border-radius: 4px; background:rgba(0,0,0,0.25); color:${difficultyColor}; font-weight:800; border:1px solid rgba(255,255,255,0.03);">
                                ${difficultyLabel}
                            </span>
                            <span style="font-size:0.6rem; padding: 2px 6px; border-radius: 4px; background:rgba(255,255,255,0.03); color:var(--text-dim); font-weight:700; border:1px solid rgba(255,255,255,0.03);">
                                Níveis ${q.levelRange || '1-4'}
                            </span>
                        </div>
                    </div>

                    <!-- Title & description -->
                    <div style="position:relative;">
                        <h3 style="margin:0 0 8px 0; font-family:'Cinzel'; font-size:1.1rem; font-weight:700; line-height:1.3; ${titleStyle}">
                            ${q.failed ? '💀 ' : ''}${q.title}
                        </h3>
                        <p style="font-size:0.75rem; color:var(--text-dim); line-height:1.5; margin:0 0 15px 0; min-height: 44px; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; text-overflow:ellipsis;">
                            ${q.description}
                        </p>
                    </div>

                    <!-- Faction tie -->
                    ${q.faction && q.faction !== 'Nenhuma' ? `
                        <div style="font-size:0.65rem; color:var(--text-dim); display:flex; align-items:center; gap:5px; margin-bottom:15px; background:rgba(255,255,255,0.02); padding:4px 8px; border-radius:6px; border:1px solid rgba(255,255,255,0.02); width:fit-content;">
                            <i class="fa-solid fa-flag" style="color:${colors.faction || '#a855f7'};"></i> Facção: <strong style="color:#fff;">${q.faction}</strong>
                        </div>
                    ` : ''}

                    <!-- Milestones checklist -->
                    ${this._renderMilestones(q)}

                    <!-- Milestone Inline Form -->
                    ${!q.completed && !q.failed ? `
                        <div style="display:flex; gap:6px; margin-bottom:15px;">
                            <input type="text" placeholder="Nova etapa da missão..." 
                                   style="flex:1; background:rgba(8,8,10,0.6); border:1.5px solid rgba(197,160,89,0.2); border-radius:6px; padding:4px 10px; color:#fff; font-size:0.7rem; outline:none;" 
                                   id="new-milestone-${q.id}"
                                   onkeydown="if(event.key==='Enter'){event.preventDefault(); document.getElementById('add-btn-${q.id}').click();}">
                            <button class="btn btn-ghost" id="add-btn-${q.id}" style="padding:4px 10px; border-radius:6px; font-size:0.7rem; font-weight:800; border-color:rgba(197,160,89,0.3); color:var(--accent);" data-action="addMilestoneInline" data-id="${q.id}">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>

                <!-- Footer rewards & status triggers -->
                <div style="margin-top:auto; display:flex; flex-direction:column; gap:10px;">
                    <!-- Reward summary -->
                    <div style="padding:10px; background:rgba(0,0,0,0.3); border-radius:8px; display:flex; justify-content:space-between; align-items:center; border:1px solid rgba(255,255,255,0.03); font-size:0.7rem;">
                        <span style="color:#fff; font-weight:600; display:inline-flex; align-items:center; gap:4px; max-width:55%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                            <i class="fa-solid fa-coins" style="color:var(--accent);"></i> ${q.reward || 'Sem item'}
                        </span>
                        <span>
                            ${q.xpType === 'milestone' 
                                ? `<span style="color:#fbbf24; font-weight:800; display:inline-flex; align-items:center; gap:3px;"><i class="fa-solid fa-trophy"></i> Marco</span>`
                                : `<span style="color:#60a5fa; font-weight:800; display:inline-flex; align-items:center; gap:3px;"><i class="fa-solid fa-star"></i> +${q.xpReward || 0} XP</span>`
                            }
                        </span>
                    </div>

                    <!-- Actions Triggers / Distribution Grid -->
                    <div style="display:flex; flex-direction:column; gap:6px;">
                        <!-- XP Distribution (if eligible) -->
                        ${q.completed && q.xpType !== 'milestone' ? (
                            !q.xpDistributed ? `
                                <button class="btn btn-info btn-sm btn-block" style="padding:6px; border-radius:6px; font-size:0.68rem; font-weight:800; display:inline-flex; align-items:center; justify-content:center; gap:6px; background:rgba(96,165,250,0.15); border:1px solid rgba(96,165,250,0.4); color:#93c5fd;" data-action="distributeQuestXP" data-id="${q.id}">
                                    <i class="fa-solid fa-gift"></i> Distribuir XP ao Grupo
                                </button>
                            ` : `
                                <div style="text-align:center; font-size:0.62rem; color:var(--success); font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:3px; background:rgba(34,197,94,0.05); border-radius:4px;">
                                    <i class="fa-solid fa-circle-check"></i> XP da Missão Distribuído
                                </div>
                            `
                        ) : ''}

                        <!-- Group Level-Up for Milestone (if eligible) -->
                        ${q.completed && q.xpType === 'milestone' ? (
                            !q.milestoneLeveled ? `
                                <button class="btn btn-ghost btn-sm btn-block" style="padding:6px; border-radius:6px; font-size:0.68rem; font-weight:800; display:inline-flex; align-items:center; justify-content:center; gap:6px; color:#fbbf24; border-color:rgba(251,191,36,0.35); background:rgba(251,191,36,0.08);" data-action="triggerMilestoneLevelUp" data-id="${q.id}">
                                    <i class="fa-solid fa-angles-up"></i> Conceder Level Up ao Grupo
                                </button>
                            ` : `
                                <div style="text-align:center; font-size:0.62rem; color:#fbbf24; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:3px; background:rgba(251,191,36,0.05); border-radius:4px;">
                                    <i class="fa-solid fa-circle-check"></i> Level Up do Grupo Concedido
                                </div>
                            `
                        ) : ''}

                        <!-- Loot / Treasure Distribution (if eligible) -->
                        ${q.completed && q.reward && q.reward !== 'Nenhuma' ? (
                            !q.rewardDistributed ? `
                                <button class="btn btn-ghost btn-sm btn-block" style="padding:6px; border-radius:6px; font-size:0.68rem; font-weight:800; display:inline-flex; align-items:center; justify-content:center; gap:6px; color:#34d399; border-color:rgba(52,211,153,0.35); background:rgba(52,211,153,0.08);" data-action="openQuestLootModal" data-id="${q.id}">
                                    <i class="fa-solid fa-hand-holding-dollar"></i> Distribuir Tesouros & Itens
                                </button>
                            ` : `
                                <div style="text-align:center; font-size:0.62rem; color:#34d399; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:3px; background:rgba(52,211,153,0.05); border-radius:4px;">
                                    <i class="fa-solid fa-circle-check"></i> Riquezas Entregues aos Heróis
                                </div>
                            `
                        ) : ''}
                    </div>

                    <!-- Actions triggers -->
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-top:5px; border-top:1px solid rgba(255,255,255,0.05); padding-top:10px;">
                        <!-- Delete -->
                        <button class="btn btn-ghost btn-sm" style="padding:6px 10px; border-radius:6px; border:1px solid rgba(239, 68, 68, 0.15); color:var(--danger); background:rgba(239,68,68,0.02);" data-action="deleteQuest" data-id="${q.id}">
                            <i class="fa-solid fa-trash-can"></i> Deletar
                        </button>

                        <div style="display:flex; gap:6px; flex:1; justify-content:flex-end;">
                            <!-- Active/Reactivate -->
                            ${q.completed || q.failed ? `
                                <button class="btn btn-ghost btn-sm" style="padding:6px 12px; font-size:0.68rem; border-radius:6px;" data-action="toggleComplete" data-id="${q.id}" data-type="reactivate">
                                    Reativar Missão
                                </button>
                            ` : `
                                <!-- Fail -->
                                <button class="btn btn-ghost btn-sm" style="padding:6px 12px; font-size:0.68rem; border-radius:6px; border-color:rgba(239, 68, 68, 0.2); color:var(--danger);" data-action="markFailed" data-id="${q.id}">
                                    <i class="fa-solid fa-skull"></i> Falhar
                                </button>
                                <!-- Complete -->
                                <button class="btn btn-sm btn-ghost" style="padding:6px 12px; font-size:0.68rem; border-radius:6px; border-color:rgba(34,197,94,0.3); color:#86efac; background:rgba(34,197,94,0.05);" data-action="toggleComplete" data-id="${q.id}" data-type="complete">
                                    <i class="fa-solid fa-check"></i> Concluir
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    _renderMilestones(q) {
        const milestones = q.milestones || [];
        if (milestones.length === 0) {
            return `
                <div style="font-size:0.7rem; color:var(--text-dim); margin-bottom:12px; font-style:italic;">
                    Nenhum objetivo específico registrado.
                </div>
            `;
        }

        const completedCount = milestones.filter(m => m.completed).length;
        const percent = Math.round((completedCount / milestones.length) * 100) || 0;

        return `
            <div style="margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.65rem; color:var(--text-dim); margin-bottom:5px; font-weight:800; letter-spacing:0.5px; text-transform:uppercase;">
                    <span>Objetivos (${completedCount}/${milestones.length})</span>
                    <span>${percent}%</span>
                </div>
                <div style="width:100%; height:5px; background:rgba(255,255,255,0.05); border-radius:3px; overflow:hidden; margin-bottom:10px;">
                    <div style="width:${percent}%; height:100%; background:linear-gradient(90deg, var(--accent), #fbbf24); border-radius:3px; transition:width 0.3s ease;"></div>
                </div>
                <div style="display:flex; flex-direction:column; gap:6px; max-height:100px; overflow-y:auto; padding-right:4px;">
                    ${milestones.map(m => `
                        <label style="display:flex; align-items:flex-start; gap:8px; font-size:0.72rem; color:${m.completed ? 'var(--text-dim)' : 'var(--text-main)'}; cursor:pointer; text-decoration:${m.completed ? 'line-through' : 'none'}; line-height:1.2;">
                            <input type="checkbox" style="accent-color:var(--accent); cursor:pointer; margin-top:2px;" 
                                    ${m.completed ? 'checked' : ''} 
                                    data-action="toggleMilestone" 
                                    data-quest-id="${q.id}" 
                                    data-milestone-id="${m.id}">
                            <span>${m.text}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }

    _renderFactionsTab(renown) {
        return `
            <div style="display:grid; grid-template-columns: 1fr; gap:20px; animation: cardFadeIn 0.4s ease-out;">
                <div class="card glass-accent" style="padding:20px; border-radius:12px; background:rgba(197,160,89,0.02); border-left:4px solid var(--accent);">
                    <h3 style="font-family:'Cinzel'; margin:0; color:var(--accent);">🚩 Influência de Facções</h3>
                    <p style="font-size:0.8rem; color:var(--text-dim); margin-top:5px; line-height:1.4;">Completar missões delegadas por grupos aumenta o Renome do grupo com eles, destravando favores e suportes táticos.</p>
                </div>

                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap:20px;">
                    ${FACTIONS.map(f => {
                        const pts = renown[f.id] || 0;
                        const rank = getRenownRank(pts);
                        return `
                            <div class="card glass-accent" style="padding:22px; border-radius:14px; border-top: 4px solid ${f.color}; background:rgba(0,0,0,0.25); display:flex; flex-direction:column; justify-content:space-between; min-height:220px;">
                                <div>
                                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                                        <h4 style="font-family:'Cinzel'; font-size:1.15rem; color:#fff; margin:0; display:flex; align-items:center; gap:8px;">
                                            <span>${f.crest}</span> ${f.name}
                                        </h4>
                                    </div>
                                    <p style="font-size:0.65rem; color:var(--text-dim); font-style:italic; margin:0 0 10px 0;">"${f.motto}"</p>
                                    <p style="font-size:0.75rem; color:#cbd5e1; line-height:1.4; margin:0 0 15px 0;">${f.desc}</p>
                                </div>
                                
                                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:10px 14px; border-radius:8px; border:1px solid rgba(255,255,255,0.03);">
                                    <div>
                                        <div style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase;">Cargo na Facção</div>
                                        <strong style="font-size:0.75rem; color:${rank.color};">${rank.title}</strong>
                                    </div>
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <button class="btn btn-ghost" style="padding:2px 8px; font-size:0.75rem; border-radius:4px; border-color:rgba(255,255,255,0.15);" data-action="adjustRenown" data-faction="${f.id}" data-delta="-1">-</button>
                                        <strong style="font-size:1.2rem; font-family:'Cinzel'; color:var(--accent); min-width:25px; text-align:center;">${pts}</strong>
                                        <button class="btn btn-ghost" style="padding:2px 8px; font-size:0.75rem; border-radius:4px; border-color:rgba(255,255,255,0.15);" data-action="adjustRenown" data-faction="${f.id}" data-delta="1">+</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    _renderChroniclesTab() {
        const chronicles = this.store.state.chronicleEntries || [];
        
        return `
            <div style="animation: cardFadeIn 0.4s ease-out; max-width:800px; margin: 0 auto;">
                <div class="card glass-accent" style="padding:22px; border-radius:12px; margin-bottom:30px; background:rgba(10,12,16,0.6);">
                    <h4 style="font-family:'Cinzel'; color:var(--accent); margin:0 0 10px 0;"><i class="fa-solid fa-feather"></i> Escrever Nova Crônica de Feitos</h4>
                    <form id="chronicle-manual-form" style="display:flex; gap:10px;">
                        <input type="text" id="manual-chronicle-text" placeholder="Ex: Dia 18 da Primavera: O grupo explorou as Minas Perdidas de Phandelver e encontrou a Forja das Magias..." required
                               style="flex:1; background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); border-radius:8px; padding:10px 15px; color:#fff; font-size:0.8rem; outline:none; font-family:'Outfit';">
                        <button type="submit" class="btn btn-primary" style="font-family:'Cinzel'; font-weight:800; font-size:0.75rem; display:inline-flex; align-items:center; gap:6px; border-radius:8px;">
                            ✍️ Registrar Feito
                        </button>
                    </form>
                </div>

                <h3 style="font-family:'Cinzel'; color:var(--accent); text-align:center; margin-bottom:35px; text-shadow:0 0 10px rgba(197,160,89,0.3);">
                    📜 CRÔNICAS DA CAMPANHA
                </h3>

                <div class="chronicle-timeline">
                    ${chronicles.length === 0 ? `
                        <div style="text-align:center; color:var(--text-dim); padding:40px; font-style:italic; font-size:0.85rem;">
                            Nenhum feito crônico registrado na linha do tempo. Complete missões ou insira um feito acima!
                        </div>
                    ` : chronicles.slice().reverse().map(c => {
                        const dateStr = new Date(c.timestamp).toLocaleString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                        let icon = '✍️';
                        let badgeColor = 'rgba(255,255,255,0.04)';
                        let textColor = 'var(--text-main)';

                        if (c.type === 'quest_completed') { icon = '🏆'; badgeColor = 'rgba(34,197,94,0.08)'; textColor = '#86efac'; }
                        else if (c.type === 'quest_failed') { icon = '💀'; badgeColor = 'rgba(239,68,68,0.08)'; textColor = '#fca5a5'; }
                        else if (c.type === 'level_up') { icon = '✨'; badgeColor = 'rgba(251,191,36,0.08)'; textColor = '#fde047'; }
                        else if (c.type === 'loot_divided') { icon = '💰'; badgeColor = 'rgba(52,211,153,0.08)'; textColor = '#6ee7b7'; }
                        else if (c.type === 'renown_change') { icon = '🚩'; badgeColor = 'rgba(168,85,247,0.08)'; textColor = '#c084fc'; }

                        return `
                            <div class="chronicle-node">
                                <div class="chronicle-dot"></div>
                                <div class="card glass" style="padding:15px 20px; background:${badgeColor}; border:1px solid rgba(255,255,255,0.05); border-radius:10px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:0.65rem; color:var(--text-dim); font-weight:800;">
                                        <span>Sessão #${c.session || 1} • ${icon} ${c.type.toUpperCase().replace('_', ' ')}</span>
                                        <span>${dateStr}</span>
                                    </div>
                                    <p style="margin:0; font-size:0.85rem; color:${textColor}; line-height:1.5; font-family:'Outfit'; font-weight:600;">
                                        ${c.text}
                                    </p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    _renderEmptyState() {
        return `
            <div class="empty-state" style="grid-column:1 / -1; padding:70px; text-align:center; border:1.5px dashed rgba(197,160,89,0.2); border-radius:12px; background:rgba(197,160,89,0.02); animation: cardFadeIn 0.5s ease;">
                <i class="fa-solid fa-feather-pointed" style="font-size:2.5rem; opacity:0.3; color:var(--accent); margin-bottom:15px; display:block;"></i>
                <h3 style="font-family:'Cinzel', serif; color:#fff; font-size:1.15rem; margin:0 0 5px 0;">Crônica Sem Registros</h3>
                <p style="font-size:0.8rem; color:var(--text-dim); max-width:350px; margin:0 auto; line-height:1.4;">Clique em "Criar Missão" ou consulte a inteligência artificial para sugerir rumores e aventuras baseados nos acontecimentos do grupo.</p>
            </div>
        `;
    }

    _renderLootModal() {
        const quest = this.store.state.quests?.find(q => String(q.id) === String(this._showLootModalId));
        if (!quest) return '';

        const players = this.store.state.players || [];

        return `
            <div class="modal-overlay animate-fadeIn" style="position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(5px); z-index:2000; display:flex; align-items:center; justify-content:center; padding:20px;" onclick="this.closest('.quest-manager').__component.closeLootModal()">
                <div class="card glass-accent animate-scaleIn" style="max-width:500px; width:100%; padding:30px; border:2px solid var(--accent); border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,0.9); text-align:left; background:rgba(10,12,16,0.95);" onclick="event.stopPropagation()">
                    <div style="text-align:center; margin-bottom:20px; border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:15px;">
                        <i class="fa-solid fa-gift fa-3x" style="color:var(--accent); margin-bottom:10px;"></i>
                        <h3 style="font-family:'Cinzel'; color:var(--accent); margin:0; font-size:1.6rem;">💰 Distribuir Tesouro</h3>
                        <p style="font-size:0.8rem; color:var(--text-dim); margin-top:8px;">
                            Recompensa da Missão: <strong style="color:#fff;">"${quest.reward}"</strong>
                        </p>
                    </div>

                    <!-- Input Gold -->
                    <div class="form-group" style="margin-bottom:15px;">
                        <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; color:var(--accent); font-weight:800;">Ouro Total a Dividir (GP / PO)</label>
                        <input type="number" id="loot-gold-input" value="${this._lootGold}" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); border-radius:8px; padding:8px 12px; color:#fff; width:100%; font-size:0.85rem; outline:none;" oninput="this.closest('.quest-manager').__component._lootGold = parseInt(this.value) || 0">
                    </div>

                    <!-- Input Items -->
                    <div class="form-group" style="margin-bottom:20px;">
                        <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; color:var(--accent); font-weight:800;">Itens Mágicos / Equipamentos a Entregar</label>
                        <input type="text" id="loot-items-input" value="${this._lootItems}" placeholder="Ex: Poção de Cura Maior, Anel de Proteção" style="background:rgba(0,0,0,0.4); border:1.5px solid rgba(197,160,89,0.25); border-radius:8px; padding:8px 12px; color:#fff; width:100%; font-size:0.85rem; outline:none;" oninput="this.closest('.quest-manager').__component._lootItems = this.value">
                    </div>

                    <label class="form-label" style="font-family:'Cinzel'; font-size:0.7rem; color:var(--accent); font-weight:800; display:block; margin-bottom:8px;">Selecione os Heróis Beneficiários</label>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:25px; max-height:180px; overflow-y:auto; padding-right:5px; scrollbar-width:thin;">
                        ${players.map(p => {
                            const selected = this._selectedLootPlayers.includes(p.id);
                            return `
                                <label style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:${selected ? 'rgba(197,160,89,0.08)' : 'rgba(255,255,255,0.02)'}; border-radius:10px; cursor:pointer; border:1px solid ${selected ? 'var(--accent)' : 'rgba(255,255,255,0.06)'}; transition:all 0.2s;">
                                    <input type="checkbox" style="width:18px; height:18px; accent-color:var(--accent); cursor:pointer;" 
                                           ${selected ? 'checked' : ''}
                                           onchange="this.closest('.quest-manager').__component.toggleLootPlayer('${p.id}')">
                                    <div style="flex:1;">
                                        <div style="font-weight:800; font-size:0.9rem; color:#fff;">${p.name}</div>
                                        <div style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase;">${p.class || 'Aventureiro'}</div>
                                    </div>
                                </label>
                            `;
                        }).join('')}
                    </div>

                    <div style="display:flex; gap:12px;">
                        <button class="btn btn-ghost btn-block" style="border-radius:10px; padding:12px;" data-action="closeLootModal">Cancelar</button>
                        <button class="btn btn-primary btn-block" style="border-radius:10px; padding:12px; font-weight:800;" data-action="confirmLootDistribution" ${this._selectedLootPlayers.length === 0 ? 'disabled' : ''}>
                            Confirmar Distribuição
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    toggleForm() { this._showForm = !this._showForm; this.render(); }

    setTab(e, el) {
        this._activeTab = el.dataset.tab;
        this.render();
    }

    filterType(e, el) {
        this._filterType = el.value;
        this.render();
    }

    search(e, el) {
        this._searchQuery = el.value;
        clearTimeout(this._searchTimer);
        this._searchTimer = setTimeout(() => this.render(), 300);
    }

    toggleComplete(e, el) {
        if (e) e.stopPropagation();
        const id = el.dataset.id;
        const type = el.dataset.type; // complete | reactivate

        TOME.store.update(s => {
            s.quests = (s.quests || []).map(q => {
                if (String(q.id) === String(id)) {
                    const completed = type === 'reactivate' ? false : !q.completed;
                    
                    // Add journal & chronicle logs if completed
                    if (completed && !q.completed) {
                        const sessionNum = s.sessionNumber || 1;
                        const logMsg = `⚔️ MISSÃO CONCLUÍDA: Os heróis completaram a missão "${q.title}"!`;
                        s.journalEntries = [...(s.journalEntries || []), {
                            id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                            session: sessionNum,
                            timestamp: Date.now(),
                            text: logMsg,
                            type: 'system'
                        }];

                        // Auto award renown if faction is set
                        if (q.faction && q.faction !== 'Nenhuma') {
                            const ptsAward = q.difficulty === 'easy' ? 1 : q.difficulty === 'hard' ? 3 : q.difficulty === 'deadly' ? 5 : 2;
                            s.factionRenown = s.factionRenown || { Harpers: 0, Alliance: 0, Gauntlet: 0, Enclave: 0, Zhentarim: 0 };
                            
                            const keyMap = { 'Harpistas': 'Harpers', 'Aliança dos Lordes': 'Alliance', 'Ordem da Manopla': 'Gauntlet', 'Enclave Esmeralda': 'Enclave', 'Zhentarim': 'Zhentarim' };
                            const fKey = keyMap[q.faction] || 'Harpers';
                            s.factionRenown[fKey] = (s.factionRenown[fKey] || 0) + ptsAward;

                            const fLog = `🚩 RENOME DE FACÇÃO: A influência com os ${q.faction} aumentou em +${ptsAward} pontos pela conclusão de "${q.title}".`;
                            s.journalEntries.push({
                                id: 'log-f-' + Date.now(),
                                session: sessionNum,
                                timestamp: Date.now(),
                                text: fLog,
                                type: 'system'
                            });
                        }
                    }

                    return { 
                        ...q, 
                        completed,
                        failed: false,
                        status: completed ? 'completed' : 'active'
                    };
                }
                return q;
            });
        });
        
        // Log to Chronicles
        const qObj = this.store.state.quests?.find(q => String(q.id) === String(id));
        if (qObj) {
            if (type !== 'reactivate' && qObj.completed) {
                logChronicleEntry(this.store, `Aventura Concluída: "${qObj.title}". Os heróis conquistaram as metas e foram agraciados com recompensas.`, 'quest_completed');
            } else if (type === 'reactivate') {
                logChronicleEntry(this.store, `Missão Reaberta: A crônica de "${qObj.title}" volta a ficar ativa no diário de aventuras.`, 'custom');
            }
        }

        TOME.persistence.save().catch(err => console.warn(err));
        this.render();
    }

    markFailed(e, el) {
        if (e) e.stopPropagation();
        const id = el.dataset.id;
        if (confirm('Marcar esta missão como fracassada? O fracasso será arquivado na crônica da campanha.')) {
            TOME.store.update(s => {
                s.quests = (s.quests || []).map(q => {
                    if (String(q.id) === String(id)) {
                        const sessionNum = s.sessionNumber || 1;
                        const logMsg = `💀 MISSÃO FRACASSADA: Os heróis falharam na missão "${q.title}".`;
                        s.journalEntries = [...(s.journalEntries || []), {
                            id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                            session: sessionNum,
                            timestamp: Date.now(),
                            text: logMsg,
                            type: 'system'
                        }];

                        return {
                            ...q,
                            failed: true,
                            completed: false,
                            status: 'failed'
                        };
                    }
                    return q;
                });
            });

            const qObj = this.store.state.quests?.find(q => String(q.id) === String(id));
            if (qObj) {
                logChronicleEntry(this.store, `Aventura Fracassada: "${qObj.title}". Um capítulo sombrio se fecha com a derrota ou falha dos heróis nas suas metas.`, 'quest_failed');
            }

            TOME.persistence.save().catch(err => console.warn(err));
            this.render();
        }
    }

    deleteQuest(e, el) {
        if (e) e.stopPropagation();
        const id = el.dataset.id;
        if (confirm('Deseja excluir esta missão permanentemente? Esta ação não pode ser desfeita.')) {
            TOME.store.update(s => {
                s.quests = (s.quests || []).filter(q => String(q.id) !== String(id));
            });
            TOME.persistence.save().catch(err => console.warn(err));
            this.render();
            Toast.show('Missão removida permanentemente.');
        }
    }

    toggleMilestone(e, el) {
        const questId = el.dataset.questId;
        const milestoneId = el.dataset.milestoneId;
        const completed = el.checked;

        TOME.store.update(s => {
            s.quests = (s.quests || []).map(q => {
                if (String(q.id) === String(questId)) {
                    const milestones = (q.milestones || []).map(m => {
                        if (String(m.id) === String(milestoneId)) {
                            return { ...m, completed };
                        }
                        return m;
                    });
                    return { ...q, milestones };
                }
                return q;
            });
        });
        
        TOME.persistence.save().catch(err => console.warn(err));
        this.render();
    }

    addMilestoneInline(e, el) {
        if (e) e.stopPropagation();
        const id = el.dataset.id;
        const input = this.$(`#new-milestone-${id}`);
        if (!input || !input.value.trim()) return;

        const val = input.value.trim();
        TOME.store.update(s => {
            s.quests = (s.quests || []).map(q => {
                if (String(q.id) === String(id)) {
                    const milestones = q.milestones || [];
                    return {
                        ...q,
                        milestones: [...milestones, {
                            id: 'm-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                            text: val,
                            completed: false
                        }]
                    };
                }
                return q;
            });
        });
        
        TOME.persistence.save().catch(err => console.warn(err));
        input.value = '';
        this.render();
    }

    distributeQuestXP(e, el) {
        if (e) e.stopPropagation();
        const id = el.dataset.id;
        const quest = this.store.state.quests?.find(q => String(q.id) === String(id));
        if (!quest || !quest.xpReward || quest.xpDistributed) return;

        const xpVal = parseInt(quest.xpReward) || 0;
        if (xpVal <= 0) return;

        const players = this.store.state.players || [];
        if (players.length === 0) {
            Toast.show('Nenhum herói ativo na campanha para receber XP!', 'error');
            return;
        }

        TOME.store.update(s => {
            s.players = (s.players || []).map(p => ({
                ...p,
                xp: (parseInt(p.xp) || 0) + xpVal
            }));
            s.quests = (s.quests || []).map(q => String(q.id) === String(id) ? { ...q, xpDistributed: true } : q);
            s.xpDistributed = (s.xpDistributed || 0) + (xpVal * players.length);
            
            const sessionNum = s.sessionNumber || 1;
            const logMsg = `🏆 XP DA MISSÃO: Distribuído +${xpVal} XP para todos os heróis pela conclusão de "${quest.title}".`;
            s.journalEntries = [...(s.journalEntries || []), {
                id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                session: sessionNum,
                timestamp: Date.now(),
                text: logMsg,
                type: 'system'
            }];
        });

        TOME.persistence.save().catch(err => console.warn(err));
        Toast.show(`+${xpVal} XP distribuído para ${players.length} heróis!`, 'success');
        this.render();
    }

    triggerMilestoneLevelUp(e, el) {
        if (e) e.stopPropagation();
        const id = el.dataset.id;
        const quest = this.store.state.quests?.find(q => String(q.id) === String(id));
        if (!quest || quest.milestoneLeveled) return;

        const players = this.store.state.players || [];
        if (players.length === 0) {
            Toast.show('Nenhum herói ativo na campanha para receber evolução!', 'error');
            return;
        }

        if (confirm(`Deseja aplicar um LEVEL UP geral para todos os ${players.length} heróis ativos pela conclusão do marco "${quest.title}"?`)) {
            TOME.store.update(s => {
                s.players = (s.players || []).map(p => {
                    const newLvl = (parseInt(p.level) || 1) + 1;
                    return { ...p, level: newLvl };
                });
                s.quests = (s.quests || []).map(q => String(q.id) === String(id) ? { ...q, milestoneLeveled: true, xpDistributed: true } : q);
                
                const sessionNum = s.sessionNumber || 1;
                const logMsg = `✨ EVOLUÇÃO POR MARCO: O grupo alcançou o marco "${quest.title}" e subiu de nível!`;
                s.journalEntries = [...(s.journalEntries || []), {
                    id: 'log-milestone-' + Date.now(),
                    session: sessionNum,
                    timestamp: Date.now(),
                    text: logMsg,
                    type: 'system'
                }];
            });

            logChronicleEntry(this.store, `Marco Avançado: O grupo subiu de nível! Todos os heróis agora são nível superior graças à conclusão de "${quest.title}".`, 'level_up');
            
            TOME.persistence.save().catch(err => console.warn(err));
            Toast.show('✨ Grupo subiu de nível com sucesso!', 'success');
            this.render();
        }
    }

    openQuestLootModal(e, el) {
        if (e) e.stopPropagation();
        const id = el.dataset.id;
        const quest = this.store.state.quests?.find(q => String(q.id) === String(id));
        if (!quest) return;

        // Parse reward text to look for coins
        let goldVal = 0;
        const rewardText = quest.reward || '';
        const matchGold = rewardText.match(/(\d+)\s*(?:gp|GP|po|PO|ouro|Ouro)/);
        if (matchGold) {
            goldVal = parseInt(matchGold[1]) || 0;
        }

        // Filter out gold string for items if possible
        const remainingItems = rewardText.replace(/(\d+)\s*(?:gp|GP|po|PO|ouro|Ouro)(?:,?\s*e?\s*)?/, '').trim();

        this._showLootModalId = id;
        this._selectedLootPlayers = (this.store.state.players || []).map(p => p.id);
        this._lootGold = goldVal;
        this._lootItems = remainingItems !== 'Nenhuma' ? remainingItems : '';
        this.render();
    }

    closeLootModal() {
        this._showLootModalId = null;
        this.render();
    }

    toggleLootPlayer(id) {
        if (this._selectedLootPlayers.includes(id)) {
            this._selectedLootPlayers = this._selectedLootPlayers.filter(x => x !== id);
        } else {
            this._selectedLootPlayers.push(id);
        }
        this.render();
    }

    confirmLootDistribution() {
        if (!this._showLootModalId || this._selectedLootPlayers.length === 0) return;
        const qId = this._showLootModalId;

        const goldVal = parseInt(this._lootGold) || 0;
        const itemsText = (this._lootItems || '').trim();

        const goldPerHero = goldVal > 0 ? Math.floor(goldVal / this._selectedLootPlayers.length) : 0;
        const goldRemainder = goldVal > 0 ? goldVal % this._selectedLootPlayers.length : 0;

        TOME.store.update(s => {
            s.players.forEach(p => {
                if (this._selectedLootPlayers.includes(p.id)) {
                    // Currency update
                    if (!p.currency) p.currency = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
                    p.currency.gp = (parseInt(p.currency.gp) || 0) + goldPerHero;

                    // Items update
                    if (itemsText) {
                        if (!p.equipment) p.equipment = { items: [], notes: '' };
                        if (typeof p.equipment.items === 'string') {
                            p.equipment.items = p.equipment.items.trim() ? p.equipment.items + '\n• ' + itemsText : '• ' + itemsText;
                        } else {
                            p.equipment.items = p.equipment.items || [];
                            p.equipment.items.push({
                                id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                                name: itemsText,
                                qty: 1,
                                weight: 0.5
                            });
                        }
                    }
                }
            });

            // Mark quest reward as distributed
            s.quests = (s.quests || []).map(q => String(q.id) === String(qId) ? { ...q, rewardDistributed: true } : q);

            // Log session journal
            const beneficiaryNames = s.players.filter(p => this._selectedLootPlayers.includes(p.id)).map(p => p.name).join(', ');
            const sessionNum = s.sessionNumber || 1;
            let logMsg = `💰 DIVISÃO DE SAQUE: Riquezas da missão foram distribuídas para: ${beneficiaryNames}.`;
            if (goldVal > 0) logMsg += ` Cada herói recebeu +${goldPerHero} PO.`;
            if (itemsText) logMsg += ` Itens entregues: "${itemsText}".`;

            s.journalEntries = [...(s.journalEntries || []), {
                id: 'log-loot-' + Date.now(),
                session: sessionNum,
                timestamp: Date.now(),
                text: logMsg,
                type: 'loot'
            }];
        });

        const qObj = this.store.state.quests?.find(q => String(q.id) === String(qId));
        if (qObj) {
            let chronMsg = `Tesouros da missão "${qObj.title}" divididos entre o grupo.`;
            if (goldVal > 0) chronMsg += ` +${goldVal} PO partilhados.`;
            if (itemsText) chronMsg += ` Artefatos obtidos: ${itemsText}.`;
            logChronicleEntry(this.store, chronMsg, 'loot_divided');
        }

        TOME.persistence.save().catch(err => console.warn(err));
        Toast.show('Riquezas e itens distribuídos com sucesso!', 'success');
        this._showLootModalId = null;
        this.render();
    }

    adjustRenown(e, el) {
        if (e) e.stopPropagation();
        const faction = el.dataset.faction;
        const delta = parseInt(el.dataset.delta) || 0;

        TOME.store.update(s => {
            s.factionRenown = s.factionRenown || { Harpers: 0, Alliance: 0, Gauntlet: 0, Enclave: 0, Zhentarim: 0 };
            
            const keyMap = { 'Harpistas': 'Harpers', 'Aliança dos Lordes': 'Alliance', 'Ordem da Manopla': 'Gauntlet', 'Enclave Esmeralda': 'Enclave', 'Zhentarim': 'Zhentarim' };
            const fKey = keyMap[faction] || 'Harpers';
            
            const oldVal = s.factionRenown[fKey] || 0;
            const newVal = Math.max(0, oldVal + delta);
            s.factionRenown[fKey] = newVal;

            // Log renown manual update
            const sessionNum = s.sessionNumber || 1;
            const logMsg = `🚩 RENOME DE FACÇÃO: Ajustado prestígio com os ${faction} (${oldVal} → ${newVal}).`;
            s.journalEntries.push({
                id: 'log-ren-man-' + Date.now(),
                session: sessionNum,
                timestamp: Date.now(),
                text: logMsg,
                type: 'system'
            });
        });

        logChronicleEntry(this.store, `Reputação Alterada: A influência do grupo com os ${faction} foi reajustada para ${this.store.state.factionRenown[faction === 'Harpistas' ? 'Harpers' : faction === 'Aliança dos Lordes' ? 'Alliance' : faction === 'Ordem da Manopla' ? 'Gauntlet' : faction === 'Enclave Esmeralda' ? 'Enclave' : 'Zhentarim']} pontos.`, 'renown_change');

        TOME.persistence.save().catch(err => console.warn(err));
        this.render();
    }

    calcSuggestedXP(e, el) {
        if (e) e.stopPropagation();
        const select = this.$('#quest-difficulty-select');
        const diff = select ? select.value : 'medium';
        const level = parseInt(el.dataset.avgLevel) || 1;

        const table = XP_THRESHOLDS[diff] || XP_THRESHOLDS.medium;
        // Index is level - 1
        const index = Math.max(0, Math.min(19, level - 1));
        const val = table[index] || 100;

        const input = this.$('#quest-xp-reward-input');
        if (input) {
            input.value = val;
            Toast.show(`Sugestão de XP calculada para Nível ${level} (${diff}): +${val} XP por herói.`, 'info');
        }
    }

    addManualChronicle(e, el) {
        const input = this.$('#manual-chronicle-text');
        if (!input || !input.value.trim()) return;
        const text = input.value.trim();

        logChronicleEntry(this.store, text, 'custom');
        TOME.persistence.save().catch(err => console.warn(err));
        input.value = '';
        this.render();
        Toast.show('Acontecimento adicionado à linha do tempo!');
    }

    async generateAIRumor() {
        Toast.show('Consultando oráculo narrativo...');
        const context = (this.store.state.quests || []).map(q => q.title).join(', ');
        const rumor = await TOME.ai.generateRumor(context);
        
        if (confirm(`🤖 O oráculo narrativo sugere este boato/rumor:\n\n"${rumor}"\n\nDeseja incorporá-lo como uma missão secundária?`)) {
            TOME.store.update(s => {
                s.quests = [...(s.quests || []), {
                    id: 'q-' + Date.now(),
                    title: 'Rumor: ' + (rumor.length > 30 ? rumor.substring(0, 30) + '...' : rumor),
                    description: rumor,
                    type: 'side',
                    difficulty: 'medium',
                    levelRange: '1-4',
                    faction: 'Nenhuma',
                    xpType: 'xp',
                    xpReward: 150,
                    reward: 'Informações ou favores locais',
                    milestones: [
                        { id: 'm-ai-1', text: 'Investigar a veracidade do boato com locais', completed: false },
                        { id: 'm-ai-2', text: 'Resolver a origem do rumor', completed: false }
                    ],
                    completed: false,
                    failed: false,
                    xpDistributed: false,
                    status: 'active'
                }];
            });
            
            logChronicleEntry(this.store, `Boato Espalhado: Circula o rumor "${rumor}". A crônica adicionou esta busca à linha de investigações.`, 'custom');

            TOME.persistence.save().catch(err => console.warn(err));
            this.render();
            Toast.show('Missão adicionada à crônica!');
        }
    }

    onMount() {
        this.element.classList.add('quest-manager');
        this.element.__component = this;
        // Quest Form Submission
        const form = this.$('#quest-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const fd = new FormData(form);
                const data = Object.fromEntries(fd.entries());
                
                let milestonesList = [];
                if (data.initialMilestones && data.initialMilestones.trim()) {
                    milestonesList = data.initialMilestones.split(',')
                        .map(m => m.trim())
                        .filter(m => m.length > 0)
                        .map((m, index) => ({
                            id: 'm-init-' + Date.now() + '-' + index,
                            text: m,
                            completed: false
                        }));
                }

                const newQuest = {
                    id: 'q-' + Date.now(),
                    title: data.title.trim(),
                    description: data.description.trim(),
                    type: data.type,
                    difficulty: data.difficulty,
                    levelRange: data.levelRange,
                    faction: data.faction,
                    xpType: data.xpType,
                    xpReward: data.xpType === 'xp' ? (parseInt(data.xpReward) || 0) : 0,
                    reward: data.reward ? data.reward.trim() : 'Nenhuma',
                    milestones: milestonesList,
                    completed: false,
                    failed: false,
                    xpDistributed: false,
                    status: 'active'
                };

                TOME.store.update(s => {
                    s.quests = [...(s.quests || []), newQuest];
                    
                    const sessionNum = s.sessionNumber || 1;
                    const logMsg = `📜 NOVA MISSÃO INICIADA: "${newQuest.title}" (${data.type === 'main' ? 'Principal' : 'Secundária'}).`;
                    s.journalEntries = [...(s.journalEntries || []), {
                        id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                        session: sessionNum,
                        timestamp: Date.now(),
                        text: logMsg,
                        type: 'system'
                    }];
                });

                logChronicleEntry(this.store, `Nova Missão Iniciada: Os heróis juraram cumprir os objetivos da busca "${newQuest.title}".`, 'custom');

                TOME.persistence.save().catch(err => console.warn(err));
                this._showForm = false;
                Toast.show('Nova missão proclamada com sucesso!');
                this.render();
            };
        }

        // Chronicle Manual Form
        const chronForm = this.$('#chronicle-manual-form');
        if (chronForm) {
            chronForm.onsubmit = (e) => {
                e.preventDefault();
                this.addManualChronicle();
            };
        }
    }
}
