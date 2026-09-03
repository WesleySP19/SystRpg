import { h } from 'preact';
import { useState, useRef, useEffect, useMemo } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { html } from 'htm/preact';
import spellsData from '../../data/spells-5e.js';
import { RefActions } from './reference/RefActions.jsx';
import { RefConditions } from './reference/RefConditions.jsx';
import { RefEnvironment } from './reference/RefEnvironment.jsx';
import { RefSpellcasting } from './reference/RefSpellcasting.jsx';
import { RefResting } from './reference/RefResting.jsx';
import { RefDC, RefAbbreviations } from './reference/RefMisc.jsx';

/**
 * QUICK REFERENCE v7.0 — "Dungeon Master's Grimoire"
 * Expansão massiva das regras oficiais de D&D 5e com design glassmorphic premium e interativo.
 */
export function QuickReference(opts) {
    const storeState = useStore();
    const [activeSection, setActiveSection] = useState('quickref');
    const [glossarySearch, setGlossarySearch] = useState('');
    const [glossaryFilter, setGlossaryFilter] = useState('all');
    const [magicSearch, setMagicSearch] = useState('');
    const [magicFilterLevel, setMagicFilterLevel] = useState('all');
    const [magicFilterClass, setMagicFilterClass] = useState('all');
    const [activeMagicTab, setActiveMagicTab] = useState('spells');
    const hoverTimerRef = useRef(null);
    const [activePopupSpell, setActivePopupSpell] = useState(null);
    const [popupMode, setPopupMode] = useState(null);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const [, setTick] = useState(0);
    const forceUpdate = () => setTick(t => t + 1);
    const render = forceUpdate;
    const store = window.TOME?.store || { state: storeState };
    const $ = (sel) => containerRef.current ? containerRef.current.querySelector(sel) : null;
    const $$ = (sel) => containerRef.current ? containerRef.current.querySelectorAll(sel) : [];
    const listen = (el, evt, cb) => {
        if (!el) return;
        el.addEventListener(evt, cb);
        return () => el.removeEventListener(evt, cb);
    };

    function template() {
        return html`
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
                        ${_renderNavButton('quickref', 'fa-compass', 'Guia Rápido D&D 5e', '255, 170, 0')}
                        ${_renderNavButton('glossary2024', 'fa-book-sparkles', 'Glossário D&D 2024', '197, 160, 89')}
                        ${_renderNavButton('magicglossary', 'fa-wand-magic-sparkles', 'Glossário Mágico', '168, 85, 247')}
                        ${_renderNavButton('conditions', 'fa-skull-crossbones', 'Condições de Status', '239, 68, 68')}
                        ${_renderNavButton('actions', 'fa-swords', 'Ações de Turno', '59, 130, 246')}
                        ${_renderNavButton('environment', 'fa-mountain-sun', 'Ambiente & Movimento', '34, 197, 94')}
                        ${_renderNavButton('spellcasting', 'fa-hat-wizard', 'Regras de Magia', '245, 158, 11')}
                        ${_renderNavButton('resting', 'fa-campground', 'Descansos & Cura', '255, 215, 0')}
                        ${_renderNavButton('dc', 'fa-bullseye', 'Dificuldades (CD)', '197, 160, 89')}
                        ${_renderNavButton('abbreviations', 'fa-language', 'Dicionário do Mestre', '255, 255, 255')}
                    </div>

                    <!-- CONTENT AREA PREMIUM -->
                    <div class="card glass-accent min-h-[75vh] p-6 rounded-2xl relative overflow-hidden">
                        ${_renderActiveContent()}
                    </div>
                </div>
            </div>
        `;
    }

    function _renderNavButton(sectionId, iconClass, text, rgbColor) {
        const isActive = activeSection === sectionId;
        const bg = isActive ? `rgba(${rgbColor}, 0.15)` : 'rgba(0, 0, 0, 0.4)';
        const border = isActive ? `1px solid rgba(${rgbColor}, 0.5)` : '1px solid transparent';
        const textColor = isActive ? '#fff' : 'var(--text-dim)';
        const shadow = isActive ? `0 0 20px rgba(${rgbColor}, 0.3)` : 'none';
        
        return html`
            <button class="btn btn-sm tome-nav-btn ${isActive ? 'active' : ''}" 
                    style="justify-content:flex-start; text-align:left; border-radius:10px; padding: 12px 15px; background: ${bg}; border: ${border}; color: ${textColor}; box-shadow: ${shadow}; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;" 
                    data-action="setSection" data-section="${sectionId}">
                ${isActive ? html`<div style="position:absolute; left:0; top:0; bottom:0; width:3px; background:rgb(${rgbColor}); box-shadow:0 0 10px rgb(${rgbColor});"></div>` : ''}
                <i class="fa-solid ${iconClass}" style="width:24px; text-align:center; margin-right:10px; font-size:1.1rem; color:rgb(${rgbColor}); transition:transform 0.3s; filter: ${isActive ? 'drop-shadow(0 0 5px rgb('+rgbColor+'))' : 'none'};"></i>
                <span style="font-weight: ${isActive ? '700' : '500'}; letter-spacing: 0.5px; font-size: 0.85rem;">${text}</span>
            </button>
        `;
    }

    function _renderActiveContent() {
        switch(activeSection) {
            case 'quickref': return _renderQuickRef();
            case 'glossary2024': return _renderGlossary2024();
            case 'magicglossary': return _renderMagicGlossary();
            case 'conditions': return h(RefConditions, null);
            case 'actions': return h(RefActions, null);
            case 'environment': return h(RefEnvironment, null);
            case 'spellcasting': return h(RefSpellcasting, null);
            case 'resting': return h(RefResting, null);
            case 'dc': return h(RefDC, null);
            case 'abbreviations': return h(RefAbbreviations, null);
            default: return '';
        }
    }

    function _renderQuickRef() {
        return html`
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
        `;
    }
    function _getGlossaryDatabase() {
        return [
            // Weapon Masteries (Maestria de Armas)
            {
                id: 'Graze',
                name: 'De Raspão (Graze)',
                englishName: 'Graze',
                category: 'masteries',
                badgeText: 'Maestria de Arma',
                badgeColor: 'var(--info)',
                desc: 'Se você errar uma jogada de ataque com esta arma contra uma criatura, você causa dano à criatura igual ao modificador do atributo usado para o ataque. O dano é do mesmo tipo que a arma causa e não pode ser aumentado de nenhuma forma.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Graze'
            },
            {
                id: 'Nick',
                name: 'Corte Rápido (Nick)',
                englishName: 'Nick',
                category: 'masteries',
                badgeText: 'Maestria de Arma',
                badgeColor: 'var(--info)',
                desc: 'Quando você faz um ataque com uma arma que tem a propriedade Nick e estiver empunhando duas armas leves, você pode fazer o ataque adicional como parte da ação de atacar principal em vez de gastar uma ação bônus, limitando-se a uma vez por turno.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Nick'
            },
            {
                id: 'Cleave',
                name: 'Fender (Cleave)',
                englishName: 'Cleave',
                category: 'masteries',
                badgeText: 'Maestria de Arma',
                badgeColor: 'var(--info)',
                desc: 'Uma vez por turno, ao atingir uma criatura com um ataque usando esta arma, você pode fazer um ataque adicional contra uma segunda criatura adjacente a ela que esteja dentro do seu alcance. Esta jogada de ataque adicional não soma o modificador do seu atributo ao dano (a menos que seja negativo).',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Cleave'
            },
            {
                id: 'Topple',
                name: 'Derrubar (Topple)',
                englishName: 'Topple',
                category: 'masteries',
                badgeText: 'Maestria de Arma',
                badgeColor: 'var(--info)',
                desc: 'Ao atingir uma criatura e causar dano com esta arma, você pode forçar o alvo a realizar uma salvaguarda de Constituição (CD = 8 + seu Bônus de Proficiência + o modificador de atributo usado no ataque). Se falhar, a criatura fica sob a condição Caído (Prone).',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Topple'
            },
            {
                id: 'Vex',
                name: 'Irritar / Vexar (Vex)',
                englishName: 'Vex',
                category: 'masteries',
                badgeText: 'Maestria de Arma',
                badgeColor: 'var(--info)',
                desc: 'Ao atingir uma criatura e causar dano com esta arma, você ganha Vantagem na sua próxima jogada de ataque contra ela antes do final do seu próximo turno.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Vex'
            },
            {
                id: 'Push',
                name: 'Empurrar (Push)',
                englishName: 'Push',
                category: 'masteries',
                badgeText: 'Maestria de Arma',
                badgeColor: 'var(--info)',
                desc: 'Ao atingir uma criatura com esta arma, você pode empurrá-la por até 3 metros (10 pés) em linha reta horizontalmente para longe de você. Esse efeito funciona em criaturas de tamanho Grande ou menor.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Push'
            },
            {
                id: 'Sap',
                name: 'Enfraquecer (Sap)',
                englishName: 'Sap',
                category: 'masteries',
                badgeText: 'Maestria de Arma',
                badgeColor: 'var(--info)',
                desc: 'Ao atingir uma criatura com esta arma, ela tem Desvantagem na sua próxima jogada de ataque antes do início do seu próximo turno.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Sap'
            },
            {
                id: 'Slow',
                name: 'Desacelerar (Slow)',
                englishName: 'Slow',
                category: 'masteries',
                badgeText: 'Maestria de Arma',
                badgeColor: 'var(--info)',
                desc: 'Ao atingir uma criatura e causar dano com esta arma, você pode reduzir o deslocamento dela em 3 metros (10 pés) até o início do seu próximo turno. Este efeito não se acumula caso seja atingido múltiplas vezes.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Slow'
            },

            // Actions (Ações)
            {
                id: 'StudyAction',
                name: 'Estudar (Study)',
                englishName: 'Study',
                category: 'actions',
                badgeText: 'Ação de Turno',
                badgeColor: 'var(--warning)',
                desc: 'Você faz um teste de Inteligência (Arcanismo, História, Investigação, Natureza ou Religião) para lembrar ou discernir informações sobre monstros, itens arcanos, runas mágicas, fatos históricos importantes ou mistérios naturais.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#StudyAction'
            },
            {
                id: 'SearchAction',
                name: 'Buscar (Search)',
                englishName: 'Search',
                category: 'actions',
                badgeText: 'Ação de Turno',
                badgeColor: 'var(--warning)',
                desc: 'Você gasta sua ação para fazer um teste de Sabedoria (Percepção ou Sobrevivência) ou Inteligência (Investigação) para localizar passagens secretas, armadilhas ocultas, rastrear pegadas, encontrar objetos escondidos ou pistas vitais no cenário.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#SearchAction'
            },
            {
                id: 'UtilizeAction',
                name: 'Utilizar (Utilize)',
                englishName: 'Utilize',
                category: 'actions',
                badgeText: 'Ação de Turno',
                badgeColor: 'var(--warning)',
                desc: 'Você usa sua ação para interagir de forma complexa com um item não mágico, acionar mecanismos físicos (como alavancas e armadilhas), empregar ferramentas com as quais você é proficiente ou usar itens do seu inventário.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#UtilizeAction'
            },
            {
                id: 'UnarmedStrike',
                name: 'Golpe Desarmado (Unarmed Strike)',
                englishName: 'Unarmed Strike',
                category: 'actions',
                badgeText: 'Ação de Turno',
                badgeColor: 'var(--warning)',
                desc: 'Um golpe de corpo-a-corpo livre. Permite escolher entre: causar Dano de Impacto (1 + mod de Força), iniciar um Agarrão (Grapple) forçando o alvo a realizar salvaguarda de Força/Destreza contra a sua CD de Agarrão, ou Empurrar (Shove) para derrubar o alvo ou afastá-lo 1,5m.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#UnarmedStrike'
            },
            {
                id: 'InfluenceAction',
                name: 'Influenciar (Influence)',
                englishName: 'Influence',
                category: 'actions',
                badgeText: 'Ação de Turno',
                badgeColor: 'var(--warning)',
                desc: 'Você faz um teste de Carisma (Persuasão, Enganação ou Intimidação) ou Inteligência (Social) para tentar influenciar a atitude de um NPC em relação ao seu grupo, motivando-o a tomar uma atitude amigável, neutra ou hostil.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#InfluenceAction'
            },

            // Conditions (Condições)
            {
                id: 'GrappledCondition',
                name: 'Agarrado (Grappled)',
                englishName: 'Grappled',
                category: 'conditions',
                badgeText: 'Condição de Status',
                badgeColor: 'var(--danger)',
                desc: 'O deslocamento da criatura agarrada torna-se 0 e ela não pode se beneficiar de bônus de velocidade. Ela tem Desvantagem nas jogadas de ataque contra qualquer alvo que não seja seu agarrador. O agarrador pode se mover arrastando ou carregando a criatura (pela metade de seu próprio deslocamento).',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#GrappledCondition'
            },
            {
                id: 'IncapacitatedCondition',
                name: 'Incapacitado (Incapacitated)',
                englishName: 'Incapacitated',
                category: 'conditions',
                badgeText: 'Condição de Status',
                badgeColor: 'var(--danger)',
                desc: 'Uma criatura incapacitada perde a capacidade de realizar ações, ações bônus ou reações. Se ela estiver se concentrando em uma magia, sua concentração é interrompida imediatamente.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#IncapacitatedCondition'
            },
            {
                id: 'BloodiedCondition',
                name: 'Ferido (Bloodied)',
                englishName: 'Bloodied',
                category: 'conditions',
                badgeText: 'Condição de Status',
                badgeColor: 'var(--danger)',
                desc: 'Uma criatura é considerada sob o status "Ferida" (Bloodied) se seus pontos de vida atuais forem iguais ou menores a metade dos seus pontos de vida máximos. Muitas habilidades e monstros interagem diretamente com este limiar.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#BloodiedCondition'
            },
            {
                id: 'StunnedCondition',
                name: 'Atordoado (Stunned)',
                englishName: 'Stunned',
                category: 'conditions',
                badgeText: 'Condição de Status',
                badgeColor: 'var(--danger)',
                desc: 'Você fica Incapacitado e não consegue se mover. Suas falas tornam-se balbucios. Ataques contra você têm Vantagem, e você falha automaticamente em salvaguardas de Força e Destreza.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#StunnedCondition'
            },
            {
                id: 'InvisibleCondition',
                name: 'Invisível (Invisible)',
                englishName: 'Invisible',
                category: 'conditions',
                badgeText: 'Condição de Status',
                badgeColor: 'var(--danger)',
                desc: 'Você é incapaz de ser visto por meios comuns (sem magias como Ver o Invisível). Suas jogadas de ataque têm Vantagem e ataques contra você têm Desvantagem. Seus testes de Destreza (Furtividade) para se esconder não exigem cobertura.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#InvisibleCondition'
            },
            {
                id: 'UnconsciousCondition',
                name: 'Inconsciente (Unconscious)',
                englishName: 'Unconscious',
                category: 'conditions',
                badgeText: 'Condição de Status',
                badgeColor: 'var(--danger)',
                desc: 'Você fica Incapacitado, Caído e incapaz de se mover ou falar. Falha automaticamente em salvaguardas de Força e Destreza. Ataques contra você têm Vantagem, e qualquer ataque físico feito por um atacante a 1,5m é um Sucesso Crítico automático.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#UnconsciousCondition'
            },
            {
                id: 'ExhaustedCondition',
                name: 'Exausto (Exhausted)',
                englishName: 'Exhausted',
                category: 'conditions',
                badgeText: 'Condição de Status',
                badgeColor: 'var(--danger)',
                desc: 'Substitui a escala antiga de 2014. Cada nível de exaustão (máximo 6) aplica um redutor cumulativo de -2 em todas as suas jogadas de d20 (ataques, testes e salvaguardas) e reduz o deslocamento em 3 metros por nível. Alcançar o nível 6 resulta em Morte Instantânea.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#ExhaustedCondition'
            },

            // General Rules (Regras Gerais)
            {
                id: 'd20Test',
                name: 'Teste d20 (D20 Test)',
                englishName: 'D20 Test',
                category: 'rules',
                badgeText: 'Regra Geral',
                badgeColor: 'var(--success)',
                desc: 'Um termo guarda-chuva introduzido em D&D 2024 que engloba Jogadas de Ataque, Testes de Habilidade (Perícias) e Salvaguardas. Padroniza a mecânica onde rolar um 20 natural é sempre um Sucesso Crítico (sucesso imediato e benefício) e rolar um 1 natural é sempre uma Falha Crítica (falha imediata).',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#d20Test'
            },
            {
                id: 'HeroicInspiration',
                name: 'Inspiração Heroica (Heroic Inspiration)',
                englishName: 'Heroic Inspiration',
                category: 'rules',
                badgeText: 'Regra Geral',
                badgeColor: 'var(--success)',
                desc: 'Substitui o sistema de inspiração antigo. Ao gastar sua Inspiração Heroica, você pode rolar novamente qualquer dado de um Teste d20 que acabou de fazer, devendo usar o novo resultado. Personagens tipicamente ganham inspiração ao rolar um 20 natural em um Teste d20 ou através de talentos específicos.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#HeroicInspiration'
            },
            {
                id: 'SneakAttack',
                name: 'Ataque Furtivo (Sneak Attack 2024)',
                englishName: 'Sneak Attack',
                category: 'rules',
                badgeText: 'Regra Geral',
                badgeColor: 'var(--success)',
                desc: 'Regra de Ladino atualizada: O dano extra pode ser aplicado uma vez por turno quando você atinge com um ataque usando uma arma Finesse ou à distância e tem Vantagem, ou tem um aliado ativo a 1,5m do alvo e nenhuma Desvantagem na jogada.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#SneakAttack'
            },
            {
                id: 'MagicAction',
                name: 'Ação Mágica (Magic Action)',
                englishName: 'Magic Action',
                category: 'rules',
                badgeText: 'Regra Geral',
                badgeColor: 'var(--success)',
                desc: 'Uma nova ação de combate formalizada que engloba a conjuração de magias (que requeiram 1 ação) ou a ativação de efeitos mágicos complexos provenientes de itens arcanos e características mágicas de classe.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#MagicAction'
            },
            {
                id: 'ToolDC',
                name: 'CD de Ferramenta (Tool DC)',
                englishName: 'Tool DC',
                category: 'rules',
                badgeText: 'Regra Geral',
                badgeColor: 'var(--success)',
                desc: 'Se o uso de um item ou a realização de uma tarefa exige o uso de uma ferramenta na qual você é proficiente, a Classe de Dificuldade (CD) para qualquer criatura resistir ao efeito do item ou tarefa passa a ser calculada como: 8 + seu Bônus de Proficiência + modificador do atributo correspondente.',
                link: 'https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#ToolDC'
            }
        ];
    }

    function onMount() {
        if (activeSection === 'glossary2024') {
            const searchInput = $('#glossary-search-input');
            if (searchInput) {
                searchInput.focus();
                
                listen(searchInput, 'input', (e) => {
                    setGlossarySearch(e.target.value);
                    _updateGlossaryList();
                });
            }
            _updateGlossaryList();
        }

        if (activeSection === 'magicglossary') {
            const searchInput = $('#magic-search-input');
            if (searchInput) {
                searchInput.focus();
                listen(searchInput, 'input', (e) => {
                    setMagicSearch(e.target.value);
                    _updateMagicGlossaryList();
                });
            }

            const classFilter = $('#magic-class-filter');
            if (classFilter) {
                listen(classFilter, 'change', (e) => {
                    setMagicFilterClass(e.target.value);
                    _updateMagicGlossaryList();
                });
            }

            // Ouvintes para abas do Glossário Mágico
            const magicTabBtns = $$('.magic-tab-btn');
            magicTabBtns.forEach(btn => {
                listen(btn, 'click', (e) => {
                    setActiveMagicTab(btn.dataset.tab);
                    setMagicFilterLevel('all');
                    render();
                });
            });

            _updateMagicGlossaryList();
        }

        // Fechamento de pop-up ao clicar fora (modo clique)
        listen(document, 'mousedown', (e) => {
            if (popupMode === 'click') {
                const popupEl = $('.magic-popup');
                if (popupEl && !popupEl.contains(e.target)) {
                    const clickedCard = e.target.closest('.spell-card');
                    if (!clickedCard) {
                        setActivePopupSpell(null);
                        setPopupMode(null);
                        render();
                    }
                }
            }
        });
    }

    function onUnmount() {
        if (_hoverTimer) {
            clearTimeout(_hoverTimer);
        }
    }

    function handleGlossaryFilter(e, el) {
        setGlossaryFilter(el.dataset.category);
        
        const filterContainer = $('#glossary-filter-container');
        if (filterContainer) {
            filterContainer.querySelectorAll('button').forEach(btn => {
                if (btn.dataset.category === glossaryFilter) {
                    btn.classList.remove('btn-ghost');
                    btn.classList.add('btn-primary');
                } else {
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-ghost');
                }
            });
        }
        
        _updateGlossaryList();
    }

    function _updateGlossaryList() {
        const listEl = $('#glossary-terms-list');
        const countEl = $('#glossary-count');
        if (!listEl) return;

        const query = glossarySearch.toLowerCase().trim();
        const filtered = _getGlossaryDatabase().filter(t => {
            // Category filter
            if (glossaryFilter !== 'all' && t.category !== glossaryFilter) {
                return false;
            }
            // Search text filter
            if (query) {
                return t.name.toLowerCase().includes(query) || 
                       t.englishName.toLowerCase().includes(query) || 
                       t.desc.toLowerCase().includes(query);
            }
            return true;
        });

        // Update count badge
        if (countEl) {
            countEl.innerText = filtered.length;
        }

        if (filtered.length === 0) {
            listEl.innerHTML = html`
                <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; color: var(--text-dim);">
                    <i class="fa-solid fa-book-open" style="font-size: 2.5rem; color: rgba(197,160,89,0.2); margin-bottom: 15px;"></i>
                    <p style="font-family: 'Cinzel'; font-size: 1rem; color: #fff;">Nenhum termo encontrado</p>
                    <p style="font-size: 0.75rem; margin-top: 5px;">Tente digitar outro termo ou mudar de categoria.</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = filtered.map(t => html`
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
        `);
    }

    function _renderGlossary2024() {
        return html`
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
                                   value="${glossarySearch}"
                                   class="tome-input-focus"
                                   style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 10px; border: 1.5px solid rgba(197,160,89,0.3); background: rgba(8, 8, 10, 0.7); color: #fff; font-size: 0.9rem; outline: none; transition: all 0.3s;" />
                        </div>
                        <!-- Category Filters -->
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="glossary-filter-container">
                            ${_renderGlossaryFilterBtn('all', '✨ Tudo', glossaryFilter === 'all')}
                            ${_renderGlossaryFilterBtn('actions', '⚔️ Ações', glossaryFilter === 'actions')}
                            ${_renderGlossaryFilterBtn('conditions', '🩸 Condições', glossaryFilter === 'conditions')}
                            ${_renderGlossaryFilterBtn('masteries', '🛡️ Maestrias', glossaryFilter === 'masteries')}
                            ${_renderGlossaryFilterBtn('rules', '📜 Regras', glossaryFilter === 'rules')}
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
        `;
        return html`
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
                                   value="${glossarySearch}"
                                   class="tome-input-focus"
                                   style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 10px; border: 1.5px solid rgba(197,160,89,0.3); background: rgba(8, 8, 10, 0.7); color: #fff; font-size: 0.9rem; outline: none; transition: all 0.3s;" />
                        </div>
                        <!-- Category Filters -->
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="glossary-filter-container">
                            ${_renderGlossaryFilterBtn('all', '✨ Tudo', glossaryFilter === 'all')}
                            ${_renderGlossaryFilterBtn('actions', '⚔️ Ações', glossaryFilter === 'actions')}
                            ${_renderGlossaryFilterBtn('conditions', '🩸 Condições', glossaryFilter === 'conditions')}
                            ${_renderGlossaryFilterBtn('masteries', '🛡️ Maestrias', glossaryFilter === 'masteries')}
                            ${_renderGlossaryFilterBtn('rules', '📜 Regras', glossaryFilter === 'rules')}
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
        `;
    }

    function _renderGlossaryFilterBtn(category, text, isActive) {
        return html`
            <button class="btn btn-sm ${isActive ? 'active' : ''}" 
                    style="border-radius: 8px; padding: 8px 14px; font-size: 0.8rem; font-weight: 700; background: ${isActive ? 'rgba(197,160,89,0.2)' : 'rgba(0,0,0,0.4)'}; border: 1px solid ${isActive ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}; color: ${isActive ? '#fff' : 'var(--text-dim)'}; transition: all 0.2s;" 
                    data-action="setGlossaryFilter" data-category="${category}">
                ${text}
            </button>
        `;
    }

    function setSection(e, el) {
        setActiveSection(el.dataset.section); 
        render(); 
    }

    function _buildSpellIndex() {
        const index = [];
        if (spellsData.cantrips) {
            spellsData.cantrips.forEach(c => index.push({ ...c, level: 0 }));
        }
        if (spellsData.spellsByLevel) {
            Object.entries(spellsData.spellsByLevel).forEach(([level, spells]) => {
                spells.forEach(s => index.push({ ...s, level: parseInt(level) }));
            });
        }
        return index.sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return a.name.localeCompare(b.name);
        });
    }

    function setMagicLevelFilter(e, el) {
        if (e) e.stopPropagation();
        setMagicFilterLevel(el.dataset.level);
        _updateMagicGlossaryList();

        const filterContainer = $('#magic-level-filter-container');
        if (filterContainer) {
            filterContainer.querySelectorAll('button').forEach(btn => {
                if (btn.dataset.level === magicFilterLevel) {
                    btn.classList.remove('btn-ghost');
                    btn.classList.add('btn-primary');
                } else {
                    btn.classList.remove('btn-primary');
                    btn.classList.add('btn-ghost');
                }
            });
        }
    }

    function _renderMagicGlossary() {
        const allSpells = _buildSpellIndex();
        const classes = [...new Set(allSpells.flatMap(s => s.classes || []))].sort();
        const displayTabTitle = activeMagicTab === 'cantrips' ? 'Glossário de Truques' : 'Glossário de Magias';
        const displayTabSubtitle = activeMagicTab === 'cantrips' 
            ? 'Consulta rápida e completa de truques (nível 0) D&D 5e.' 
            : 'Consulta de magias arcanas, divinas e naturais de 1º a 5º círculo.';

        return html`
            <div style="display:flex; flex-direction:column; gap:20px; height:100%; animation: fadeIn 0.4s ease-out;">
                <!-- Header com Abas Premium -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom:2px solid rgba(168,85,247,0.15); padding-bottom:15px; margin-bottom:5px; flex-wrap: wrap; gap: 15px;">
                    <div>
                        <h3 style="font-family:'Cinzel', serif; color:#a855f7; margin:0; font-size:1.8rem; text-shadow:0 0 15px rgba(168,85,247,0.4);">
                            <i class="fa-solid fa-wand-magic-sparkles" style="margin-right:10px;"></i> ${displayTabTitle}
                        </h3>
                        <p style="font-size:0.85rem; color:var(--text-dim); margin:4px 0 0 0; line-height:1.4;">${displayTabSubtitle}</p>
                    </div>

                    <!-- ABAS DE SELEÇÃO DO GLOSSÁRIO MÁGICO -->
                    <div style="display: flex; gap: 8px; background: rgba(0,0,0,0.35); padding: 4px; border-radius: 10px; border: 1.5px solid rgba(168,85,247,0.25); box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);">
                        <button class="btn magic-tab-btn ${activeMagicTab === 'cantrips' ? 'btn-primary' : 'btn-ghost'}" 
                                data-tab="cantrips" 
                                style="font-family: 'Cinzel'; font-size: 0.75rem; padding: 6px 12px; border: none; border-radius: 6px; display: flex; align-items: center; gap: 6px; color: ${activeMagicTab === 'cantrips' ? '#fff' : 'var(--text-dim)'}; background: ${activeMagicTab === 'cantrips' ? '#a855f7' : 'transparent'}; border-color: ${activeMagicTab === 'cantrips' ? '#a855f7' : 'transparent'};">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> TRUQUES
                        </button>
                        <button class="btn magic-tab-btn ${activeMagicTab === 'spells' ? 'btn-primary' : 'btn-ghost'}" 
                                data-tab="spells" 
                                style="font-family: 'Cinzel'; font-size: 0.75rem; padding: 6px 12px; border: none; border-radius: 6px; display: flex; align-items: center; gap: 6px; color: ${activeMagicTab === 'spells' ? '#fff' : 'var(--text-dim)'}; background: ${activeMagicTab === 'spells' ? '#a855f7' : 'transparent'}; border-color: ${activeMagicTab === 'spells' ? '#a855f7' : 'transparent'};">
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
                                   value="${magicSearch}"
                                   class="tome-input-focus"
                                   style="width: 100%; padding: 14px 14px 14px 45px; border-radius: 10px; border: 1.5px solid rgba(168,85,247,0.3); background: rgba(8, 8, 10, 0.7); color: #fff; font-size: 0.9rem; outline: none; transition: all 0.3s;" />
                        </div>
                        
                        <!-- Class Filter -->
                        <div style="min-width: 160px;">
                            <select id="magic-class-filter" class="tome-input-focus" style="width:100%; padding: 14px; border-radius: 10px; border: 1.5px solid rgba(168,85,247,0.3); background: rgba(8, 8, 10, 0.7); color: #fff; font-size: 0.9rem; cursor:pointer; outline:none; transition: all 0.3s;">
                                <option value="all">Todas as Classes</option>
                                ${classes.map(c => html`<option value="${c}" ${magicFilterClass === c ? 'selected' : ''}>${c}</option>`)}
                            </select>
                        </div>

                        <!-- Level Filters (Apenas na aba de Magias) -->
                        ${activeMagicTab === 'spells' ? html`
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="magic-level-filter-container">
                            ${_renderMagicFilterBtn('all', '✨ Tudo', magicFilterLevel === 'all')}
                            ${_renderMagicFilterBtn('1', '1º Círculo', magicFilterLevel === '1')}
                            ${_renderMagicFilterBtn('2', '2º Círculo', magicFilterLevel === '2')}
                            ${_renderMagicFilterBtn('3', '3º Círculo', magicFilterLevel === '3')}
                            ${_renderMagicFilterBtn('4', '4º Círculo', magicFilterLevel === '4')}
                            ${_renderMagicFilterBtn('5', '5º Círculo', magicFilterLevel === '5')}
                        </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Match stats -->
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-dim); padding: 0 5px;">
                    <span>Exibindo <strong id="magic-count" style="color: #a855f7; font-size: 1rem;">0</strong> ${activeMagicTab === 'cantrips' ? 'truques catalogados' : 'magias no grimório'}.</span>
                    <span style="display: inline-flex; align-items: center; gap: 6px; color: #a855f7; font-weight: 700; text-shadow: 0 0 10px rgba(168,85,247,0.3);"><i class="fa-solid fa-scroll"></i> Pergaminhos Vivos</span>
                </div>

                <!-- Terms grid -->
                <div id="magic-glossary-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; max-height: calc(100vh - 380px); min-height: 400px; overflow-y: auto; padding-right: 15px; scrollbar-width: thin; margin-top: 5px;">
                    <!-- Rendered dynamically by _updateMagicGlossaryList() -->
                </div>
            </div>
        `;
    }

    function _renderMagicFilterBtn(level, text, isActive) {
        return html`
            <button class="btn btn-sm ${isActive ? 'active' : ''}" 
                    style="border-radius: 8px; padding: 8px 14px; font-size: 0.8rem; font-weight: 700; background: ${isActive ? 'rgba(168,85,247,0.2)' : 'rgba(0,0,0,0.4)'}; border: 1px solid ${isActive ? '#a855f7' : 'rgba(255,255,255,0.1)'}; color: ${isActive ? '#fff' : 'var(--text-dim)'}; transition: all 0.2s;" 
                    data-action="setMagicLevelFilter" data-level="${level}">
                ${text}
            </button>
        `;
    }

        function _updateMagicGlossaryList() {
        const listEl = $('#magic-glossary-list');
        const countEl = $('#magic-count');
        if (!listEl) return;

        const allSpells = _buildSpellIndex();
        const filtered = allSpells.filter(s => {
            if (activeMagicTab === 'cantrips' && s.level !== 0) return false;
            if (activeMagicTab === 'spells' && s.level === 0) return false;

            const q = magicSearch.toLowerCase().trim();
            const matchesSearch = !q || 
                s.name.toLowerCase().includes(q) || 
                s.englishName.toLowerCase().includes(q) || 
                (s.effect && s.effect.toLowerCase().includes(q)) ||
                (s.challenge && s.challenge.toLowerCase().includes(q));
                
            const matchesLevel = magicFilterLevel === 'all' || 
                s.level.toString() === magicFilterLevel;
                
            const matchesClass = magicFilterClass === 'all' ||
                (s.classes && s.classes.includes(magicFilterClass));
                
            return matchesSearch && matchesLevel && matchesClass;
        });

        if (countEl) countEl.innerText = filtered.length;

        if (filtered.length === 0) {
            listEl.innerHTML = html`
                <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; color: var(--text-dim);">
                    <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 2.5rem; color: rgba(197,160,89,0.2); margin-bottom: 15px;"></i>
                    <p style="font-family: 'Cinzel'; font-size: 1rem; color: #fff;">Nenhuma magia ou truque encontrado</p>
                    <p style="font-size: 0.75rem; margin-top: 5px;">Tente digitar outro termo ou mudar o filtro.</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = filtered.map(s => _renderMagicCard(s));
        _bindMagicCardEvents();
    }

    function _renderPlayersWithSpell(spell) {
        const players = store?.state?.players || [];
        
        const matchesSpell = (playerSpellStr, spellObj) => {
            const cleanPlayerSpell = playerSpellStr.toLowerCase().trim();
            if (!cleanPlayerSpell) return false;
            
            const cleanName = spellObj.name.toLowerCase().trim();
            const cleanEnglishName = spellObj.englishName ? spellObj.englishName.toLowerCase().trim() : '';
            
            return cleanPlayerSpell === cleanName || 
                   (cleanEnglishName && cleanPlayerSpell === cleanEnglishName) ||
                   cleanPlayerSpell.includes(cleanName) ||
                   (cleanEnglishName && cleanPlayerSpell.includes(cleanEnglishName)) ||
                   cleanName.includes(cleanPlayerSpell) ||
                   (cleanEnglishName && cleanEnglishName.includes(cleanPlayerSpell));
        };

        const matchingPlayers = players.filter(p => {
            return Object.values(p.spells || {}).some(spellListStr => {
                return (spellListStr || '').split('\n').some(s => matchesSpell(s, spell));
            });
        });

        if (matchingPlayers.length === 0) {
            return html`
                <div style="font-size: 0.68rem; color: var(--text-dim); padding: 6px 10px; background: rgba(255,255,255,0.01); border-radius: 6px; border: 1px dashed rgba(168, 85, 247, 0.2); text-align: center; width: 100%;">
                    Nenhum jogador possui registrado na ficha.
                </div>
            `;
        }

        return html`
            <div style="display: flex; flex-wrap: wrap; gap: 6px; width: 100%;">
                ${matchingPlayers.map(p => {
                    const avatarStyle = p.portraitData ? `background-image: url('${p.portraitData}')` : 'background-color: var(--accent)';
                    const avatarInner = p.portraitData ? '' : html`<span style="font-size: 0.58rem; font-weight: bold; color: #000;">${p.name.substring(0, 2).toUpperCase()}</span>`;
                    return html`
                        <div class="player-pill" style="display: flex; align-items: center; gap: 6px; background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); padding: 3px 8px; border-radius: 12px; font-size: 0.72rem; color: #fff;">
                            <div style="width: 14px; height: 14px; border-radius: 50%; ${avatarStyle}; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.15);">
                                ${avatarInner}
                            </div>
                            <span style="font-weight: 500; font-size: 0.68rem;">${p.name}</span>
                        </div>
                    `;
                })}
            </div>
        `;
    }

    function _renderPlayersWithSpellMini(spell) {
        const players = store?.state?.players || [];
        const matchesSpell = (playerSpellStr, spellObj) => {
            const cleanPlayerSpell = playerSpellStr.toLowerCase().trim();
            if (!cleanPlayerSpell) return false;
            
            const cleanName = spellObj.name.toLowerCase().trim();
            const cleanEnglishName = spellObj.englishName ? spellObj.englishName.toLowerCase().trim() : '';
            
            return cleanPlayerSpell === cleanName || 
                   (cleanEnglishName && cleanPlayerSpell === cleanEnglishName) ||
                   cleanPlayerSpell.includes(cleanName) ||
                   (cleanEnglishName && cleanPlayerSpell.includes(cleanEnglishName)) ||
                   cleanName.includes(cleanPlayerSpell) ||
                   (cleanEnglishName && cleanEnglishName.includes(cleanPlayerSpell));
        };

        const matchingPlayers = players.filter(p => {
            return Object.values(p.spells || {}).some(spellListStr => {
                return (spellListStr || '').split('\n').some(s => matchesSpell(s, spell));
            });
        });

        if (matchingPlayers.length === 0) {
            return html`<span style="font-size: 0.65rem; color: var(--text-dim); font-style: italic;">Nenhum</span>`;
        }

        return html`
            <div style="display: flex; gap: -4px; flex-wrap: wrap; justify-content: flex-end;">
                ${matchingPlayers.map(p => {
                    const avatarStyle = p.portraitData ? `background-image: url('${p.portraitData}')` : 'background-color: var(--accent)';
                    const avatarInner = p.portraitData ? '' : html`<span style="font-size: 0.5rem; font-weight: 800; color: #000;">${p.name.substring(0, 2).toUpperCase()}</span>`;
                    return html`
                        <div title="${p.name}" class="player-mini-avatar" style="width: 18px; height: 18px; border-radius: 50%; ${avatarStyle}; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-left: -4px;">
                            ${avatarInner}
                        </div>
                    `;
                })}
            </div>
        `;
    }

    function _renderMagicCard(spell) {
        const isCantrip = spell.level === 0;
        const typeIcons = { 'dano': '⚔️', 'controle': '🔗', 'utilidade': '✨', 'cura': '🏥' };
        const icon = typeIcons[spell.type] || '📜';
        const isAttack = spell.type === 'dano' || spell.baseDamage;
        
        let borderGlowColor = '197, 160, 89';
        if (isCantrip) borderGlowColor = '34, 197, 94';
        else if (isAttack) borderGlowColor = '239, 68, 68';
        else borderGlowColor = '168, 85, 247';

        return html`
            <div class="card spell-card tome-hover-card" 
                 style="padding: 18px; border-radius: 14px; border: 1.5px solid rgba(${borderGlowColor}, 0.2); cursor: pointer; background: rgba(10,12,16,0.7); display:flex; flex-direction:column; justify-content:space-between; min-height:190px; position:relative; overflow:hidden;"
                 data-action="toggleMagicPopup"
                 data-spell-id="${spell.id}">
                <div style="position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg, transparent, rgba(${borderGlowColor}, 0.5), transparent);"></div>
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
                        <strong style="color: #fff; font-size: 0.98rem; font-family: 'Cinzel', serif; text-shadow:0 0 8px rgba(255,255,255,0.1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75%;">${icon} ${spell.name}</strong>
                        <span style="font-size: 0.55rem; padding: 3px 6px; border-radius: 6px; font-weight: 800; text-transform: uppercase; background: rgba(${borderGlowColor}, 0.1); color: rgb(${borderGlowColor}); border: 1px solid rgba(${borderGlowColor}, 0.3);">
                            ${isCantrip ? 'Truque' : `${spell.level}º Círc.`}
                        </span>
                    </div>
                    <p style="font-size: 0.78rem; line-height: 1.45; color: var(--text-dim); margin: 0 0 10px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.85em; opacity: 0.9;">
                        ${spell.challenge || spell.effect || 'Efeito utilitário arcano.'}
                    </p>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: auto; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
                    <!-- Conjuradores Vinculados -->
                    <div style="display: flex; justify-content: space-between; align-items: center; height: 20px;">
                        <span style="font-size: 0.65rem; color: var(--text-dim); display: flex; align-items: center; gap: 4px;">
                            <i class="fa-solid fa-users" style="color: rgba(${borderGlowColor}, 0.8);"></i> Conjuradores:
                        </span>
                        ${_renderPlayersWithSpellMini(spell)}
                    </div>
                    
                    <!-- Footer Info -->
                    <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: var(--text-dim);">
                        <span style="display:flex; align-items:center; gap:5px;"><i class="fa-regular fa-clock" style="color:rgba(${borderGlowColor}, 0.8);"></i> ${spell.actionType === 'bonusAction' ? 'Ação Bônus' : spell.actionType === 'reaction' ? 'Reação' : 'Ação'}</span>
                        <span style="display:flex; align-items:center; gap:5px;"><i class="fa-solid fa-arrows-left-right" style="color:rgba(${borderGlowColor}, 0.8);"></i> ${spell.range || '-'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    function _bindMagicCardEvents() {
        const cards = $$('.spell-card');
        cards.forEach(card => {
            const spellId = card.dataset.spellId;
            const spell = _buildSpellIndex().find(s => s.id === spellId);
            if (!spell) return;

            listen(card, 'mouseenter', () => {
                if (popupMode === 'click') return;

                _hoverTimer = setTimeout(() => {
                    _playMagicWhisperSound();
                    
                    setActivePopupSpell(spell);
                    setPopupMode('hover');
                    
                    const rect = card.getBoundingClientRect();
                    let x = rect.right + 12;
                    if (x + 380 > window.innerWidth) {
                        x = rect.left - 392;
                    }
                    if (x < 10) x = 10;
                    
                    let y = rect.top;
                    if (y + 350 > window.innerHeight) {
                        y = window.innerHeight - 360;
                    }
                    if (y < 10) y = 10;
                    
                    setPopupPosition({ x, y });
                    render();
                }, 1000);
            });

            listen(card, 'mouseleave', () => {
                if (_hoverTimer) {
                    clearTimeout(_hoverTimer);
                    _hoverTimer = null;
                }
                if (popupMode === 'hover') {
                    setActivePopupSpell(null);
                    setPopupMode(null);
                    render();
                }
            });
        });
    }

    function toggleMagicPopup(e, el) {
        if (e) e.stopPropagation();
        const spellId = el.dataset.spellId;
        const spell = _buildSpellIndex().find(s => s.id === spellId);
        if (!spell) return;

        if (_hoverTimer) {
            clearTimeout(_hoverTimer);
            _hoverTimer = null;
        }

        _playMagicWhisperSound();

        if (activePopupSpell && activePopupSpell.id === spell.id && popupMode === 'click') {
            setActivePopupSpell(null);
            setPopupMode(null);
        } else {
            setActivePopupSpell(spell);
            setPopupMode('click');

            const rect = el.getBoundingClientRect();
            let x = rect.right + 12;
            if (x + 380 > window.innerWidth) {
                x = rect.left - 392;
            }
            if (x < 10) x = 10;
            
            let y = rect.top;
            if (y + 350 > window.innerHeight) {
                y = window.innerHeight - 360;
            }
            if (y < 10) y = 10;

            setPopupPosition({ x, y });
        }
        render();
    }

    function closeMagicPopup(e) {
        if (e) e.stopPropagation();
        setActivePopupSpell(null);
        setPopupMode(null);
        render();
    }

    function viewFullSpell(e, el) {
        if (e) e.stopPropagation();
        const spellId = el.dataset.spellId;
        
        // Navega para a aba de grimório e seleciona a magia completa
        store.update(s => {
            s.activeTab = 'spellbook';
        });

        // Encontra o SpellBook montado e força a visualização se possível, ou apenas redireciona
        setTimeout(() => {
            const dashboardRoot = document.querySelector('#view-content');
            if (dashboardRoot && dashboardRoot.__component) {
                const spellBookComp = dashboardRoot.__component._activeChild;
                if (spellBookComp && typeof spellBookComp.selectSpell === 'function') {
                    const mockEl = document.createElement('div');
                    mockEl.dataset.spellId = spellId;
                    spellBookComp.selectSpell(null, mockEl);
                }
            }
        }, 100);

        setActivePopupSpell(null);
        setPopupMode(null);
        render();
    }

    function _playMagicWhisperSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(392, ctx.currentTime); // Sol
            osc1.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.4);
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(493.88, ctx.currentTime); // Si
            osc2.frequency.exponentialRampToValueAtTime(987.77, ctx.currentTime + 0.5);
            
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5);
            
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            
            osc1.start(ctx.currentTime);
            osc2.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.6);
            osc2.stop(ctx.currentTime + 0.6);
        } catch (e) {
            console.warn('[Audio] Sussurro mágico falhou:', e);
        }
    }

    function _getSpellPopupHTML(spell) {
        const isCantrip = spell.level === 0;
        const circleLabel = isCantrip ? 'TRUQUE' : `${spell.level}º CÍRCULO`;
        
        const mainClass = spell.classes && spell.classes[0] ? spell.classes[0] : 'Conjurador';
        let modifierName = 'Carisma';
        if (['Clérigo', 'Druida', 'Ranger'].includes(mainClass)) modifierName = 'Sabedoria';
        else if (['Mago', 'Artífice'].includes(mainClass)) modifierName = 'Inteligência';
        
        let actionLabel = 'Ação';
        if (spell.actionType === 'bonusAction') actionLabel = 'Ação Bônus';
        else if (spell.actionType === 'reaction') actionLabel = 'Reação';
        
        const componentsLabel = spell.components ? spell.components.join('/') : 'V/S';
        const concentrationLabel = spell.concentration ? 'Sim' : 'Não';
        
        const typeIcons = { 'dano': 'fa-fire-flame-curved', 'controle': 'fa-hands-bound', 'utilidade': 'fa-wand-magic-sparkles', 'cura': 'fa-heart-pulse' };
        const typeColors = { 'dano': '#ef4444', 'controle': '#3b82f6', 'utilidade': '#a855f7', 'cura': '#22c55e' };
        
        const typeIcon = typeIcons[spell.type] || 'fa-scroll';
        const typeColor = typeColors[spell.type] || 'var(--accent)';
        
        let testBoxHTML = '';
        if (spell.savingThrow) {
            const saveMap = { 'DEX': 'Destreza', 'WIS': 'Sabedoria', 'CON': 'Constituição', 'INT': 'Inteligência', 'STR': 'Força', 'CHA': 'Carisma' };
            const saveName = saveMap[spell.savingThrow] || spell.savingThrow;
            testBoxHTML = html`
                <div style="font-size: 0.72rem; line-height: 1.4; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px; font-family: 'Cinzel', serif;">SALVAGUARDA (Inimigo Rola)</div>
                    <div style="color: var(--text-dim); margin-bottom: 3px;">CD da Magia contra o alvo:</div>
                    <div style="font-family: 'JetBrains Mono', monospace; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; margin: 4px 0; color: #fff; border: 1px solid rgba(255,255,255,0.05); text-align: center; font-weight: bold;">
                        CD = 8 + Bônus Proficiência + Mod. ${modifierName}
                    </div>
                    <div style="font-size: 0.68rem; color: var(--text-dim); margin-top: 4px;">
                        • Oponente rola salvaguarda de <strong>${saveName}</strong><br />
                        • Sucesso parcial: Metade do dano ou anula o efeito.
                    </div>
                </div>
            `;
        } else if (spell.baseDamage || spell.type === 'dano') {
            testBoxHTML = html`
                <div style="font-size: 0.72rem; line-height: 1.4; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px; font-family: 'Cinzel', serif;">ATAQUE MÁGICO (Você Rola)</div>
                    <div style="color: var(--text-dim); margin-bottom: 3px;">Jogada de ataque com d20:</div>
                    <div style="font-family: 'JetBrains Mono', monospace; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; margin: 4px 0; color: #fff; border: 1px solid rgba(255,255,255,0.05); text-align: center; font-weight: bold;">
                        Mod. de Ataque = Bônus Proficiência + Mod. ${modifierName}
                    </div>
                    <div style="font-size: 0.68rem; color: var(--text-dim); margin-top: 4px;">
                        • Role 1d20 + Modificador de Ataque.<br />
                        • O ataque atinge se o total for <strong>&ge; CA</strong> do alvo.
                    </div>
                </div>
            `;
        } else {
            testBoxHTML = html`
                <div style="font-size: 0.72rem; line-height: 1.4; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px; font-family: 'Cinzel', serif;">EFEITO AUTOMÁTICO</div>
                    <div style="font-size: 0.68rem; color: var(--text-dim); margin-top: 4px;">
                        • Não requer jogada de ataque ou teste de salvaguarda do oponente.<br />
                        • O efeito ou cura ocorre instantaneamente no alvo ou área selecionada.
                    </div>
                </div>
            `;
        }

        const narrative = spell.challenge || spell.effect || 'Efeito mágico sob comando do conjurador.';
        
        let damageOrEffect = '';
        if (spell.baseDamage) {
            damageOrEffect = html`<span style="font-size: 1.1rem; font-weight: 800; color: #fff; font-family: 'Cinzel', serif;">${spell.baseDamage}</span> <span style="font-size: 0.8rem; font-weight: 600; color: ${typeColor};">${spell.damageType || ''}</span>`;
            if (spell.scaling && !isCantrip) {
                damageOrEffect += html` <span style="font-size: 0.65rem; color: var(--text-dim); display: block; margin-top: 2px;">(+1d6 por nível de slot acima)</span>`;
            } else if (spell.scaling && isCantrip) {
                damageOrEffect += html` <span style="font-size: 0.65rem; color: var(--text-dim); display: block; margin-top: 2px;">(dano aumenta nos níveis 5, 11 e 17)</span>`;
            }
        } else {
            damageOrEffect = html`<span style="font-size: 0.75rem; color: var(--text-main); font-weight: 500;">${spell.effect || 'Efeito imediato benéfico ou utilitário.'}</span>`;
        }

        let shortNarrative = narrative;
        if (shortNarrative.length > 180) {
            shortNarrative = shortNarrative.substring(0, 177) + '...';
        }

        return html`
            <div style="display: flex; flex-direction: column; gap: 12px; position: relative;">
                <!-- Header Title -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1rem; color: ${typeColor}; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);">
                            <i class="fa-solid ${typeIcon}"></i>
                        </span>
                        <div>
                            <h4 style="font-family: 'Cinzel', serif; font-size: 0.95rem; font-weight: 800; color: #fff; margin: 0; text-shadow: 0 0 10px rgba(255,255,255,0.1);">${spell.name.toUpperCase()}</h4>
                            <span style="font-size: 0.6rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px;">${spell.englishName}</span>
                        </div>
                    </div>
                    <span class="badge" style="background: ${isCantrip ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)'}; border: 1px solid ${isCantrip ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}; color: ${isCantrip ? '#86efac' : '#93c5fd'}; font-size: 0.6rem; padding: 2px 8px; border-radius: 4px;">
                        ${circleLabel}
                    </span>
                </div>

                <!-- Specs Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: rgba(0,0,0,0.15); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.02); font-size: 0.72rem;">
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-regular fa-clock" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Execução: <strong style="color: #fff;">${actionLabel}</strong></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-solid fa-arrows-left-right" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Alcance: <strong style="color: #fff;">${spell.range || '-'}</strong></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-solid fa-flask" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Componentes: <strong style="color: #fff;">${componentsLabel}</strong></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; color: var(--text-dim);">
                        <i class="fa-solid fa-brain" style="color: var(--accent); width: 12px; text-align: center;"></i>
                        <span>Conc.: <strong style="color: #fff;">${concentrationLabel}</strong></span>
                    </div>
                </div>

                <!-- Description -->
                <div style="background: rgba(255, 255, 255, 0.015); border-left: 2.5px solid ${typeColor}; padding: 8px 12px; border-radius: 0 6px 6px 0; font-size: 0.72rem; line-height: 1.45; color: var(--text-main);">
                    <div style="font-weight: 700; color: var(--text-dim); font-size: 0.65rem; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px;">Como funciona:</div>
                    ${shortNarrative}
                </div>

                <!-- Test calculation box -->
                <div style="background: rgba(255,255,255,0.02); border: 1.5px solid rgba(197, 160, 89, 0.15); padding: 12px; border-radius: 8px;">
                    ${testBoxHTML}
                </div>

                <!-- CONJURADORES VINCULADOS EM POPUP -->
                <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px; margin-top: 2px;">
                    <div style="font-family: 'Cinzel', serif; font-size: 0.65rem; color: var(--accent); font-weight: 700; margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
                        <i class="fa-solid fa-users"></i> Conjuradores Vinculados
                    </div>
                    ${_renderPlayersWithSpell(spell)}
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
                        ${damageOrEffect}
                    </div>
                </div>
            </div>
            
            ${popupMode === 'click' ? html`
                <button class="btn btn-ghost" style="position: absolute; top: 12px; right: 12px; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px; z-index: 10; border: none; background: transparent; color: var(--text-dim); cursor: pointer;" data-action="closeMagicPopup">✕</button>
                <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; border-top: 1.5px solid rgba(255, 255, 255, 0.08); padding-top: 10px;">
                    <button class="btn btn-ghost" style="padding: 5px 12px; font-size: 0.68rem; border-radius: 6px; border: 1px solid rgba(197, 160, 89, 0.35); color: var(--accent); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; background: rgba(197,160,89,0.05);" data-action="viewFullSpell" data-spell-id="${spell.id}" data-spell-name="${spell.name}">
                        <i class="fa-solid fa-expand" style="font-size: 0.65rem;"></i> Ficha Completa
                    </button>
                </div>
            ` : ''}
        `;
    }

    return template();
}
