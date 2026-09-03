import { RulesEngine } from '../../core/RulesEngine.js';
import { Dice } from '../../utils/Dice.js';
import { Toast } from './core/Toast.jsx';

const DEFAULT_SKILLS = [
    { id: 'acrobatics', label: 'Acrobacia', stat: 'dex' },
    { id: 'animal_handling', label: 'Adestrar Animais', stat: 'wis' },
    { id: 'arcana', label: 'Arcanismo', stat: 'int' },
    { id: 'athletics', label: 'Atletismo', stat: 'str' },
    { id: 'deception', label: 'Enganação', stat: 'cha' },
    { id: 'history', label: 'História', stat: 'int' },
    { id: 'insight', label: 'Intuição', stat: 'wis' },
    { id: 'intimidation', label: 'Intimidação', stat: 'cha' },
    { id: 'investigation', label: 'Investigação', stat: 'int' },
    { id: 'medicine', label: 'Medicina', stat: 'wis' },
    { id: 'nature', label: 'Natureza', stat: 'int' },
    { id: 'perception', label: 'Percepção', stat: 'wis' },
    { id: 'performance', label: 'Atuação', stat: 'cha' },
    { id: 'persuasion', label: 'Persuasão', stat: 'cha' },
    { id: 'religion', label: 'Religião', stat: 'int' },
    { id: 'sleight_of_hand', label: 'Prestidigitação', stat: 'dex' },
    { id: 'stealth', label: 'Furtividade', stat: 'dex' },
    { id: 'survival', label: 'Sobrevivência', stat: 'wis' }
];

export function renderCoreTab(p, context) {
    const rules = RulesEngine.getActiveRuleset();
    const stats = rules ? rules.stats.map(s => s.id) : ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    const labels = rules ? Object.fromEntries(rules.stats.map(s => [s.id, s.short])) : { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };
    const skillsList = (rules && rules.skills && rules.skills.length) ? rules.skills : DEFAULT_SKILLS;
    
    const derived = rules ? rules.derived : [
        { id: 'ac', label: 'CA', default: 10 },
        { id: 'initiative', label: 'INICIATIVA', default: 0 },
        { id: 'speed', label: 'DESLOC.', default: 30 }
    ];

    const calcMod = (score) => Math.floor(((Number(score) !== undefined && !isNaN(Number(score)) ? Number(score) : 10) - 10) / 2);
    const formatMod = (mod) => (mod >= 0 ? `+${mod}` : `${mod}`);

    const profBonus = Number(p.proficiencyBonus) || (Math.floor(((Number(p.level) || 1) - 1) / 4) + 2);

    const handleRoll = (title, bonus) => {
        try {
            const rollNotation = bonus >= 0 ? `1d20+${bonus}` : `1d20${bonus}`;
            const result = Dice.roll(rollNotation);
            const d20 = result.rolls?.[0] || result.total - bonus;
            let msgType = 'info';
            if (d20 === 20) msgType = 'success';
            if (d20 === 1) msgType = 'danger';

            Toast.show(`🎲 <strong>${title}</strong>: rolou [${d20}] ${bonus >= 0 ? `+ ${bonus}` : `- ${Math.abs(bonus)}`} = <strong>${result.total}</strong>`, msgType);
            
            if (window.TOME?.events) {
                window.TOME.events.emit('DICE_ROLLED', { label: title, roll: d20, bonus, total: result.total });
            }
        } catch (e) {
            console.error('Erro ao rolar dado:', e);
        }
    };

    // Calculate passives
    const wisMod = calcMod(p.stats?.wis);
    const intMod = calcMod(p.stats?.int);
    const passPerception = 10 + wisMod + (p.skills?.includes('perception') ? profBonus : 0);
    const passInvestigation = 10 + intMod + (p.skills?.includes('investigation') ? profBonus : 0);
    const passInsight = 10 + wisMod + (p.skills?.includes('insight') ? profBonus : 0);

    return (
        <div data-tab-content="core" className="tab-content active animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-[100px_250px_1fr_300px] gap-6">
                
                {/* ── COLUNA 1: ATRIBUTOS BÁSICOS ── */}
                <div className="flex flex-col gap-3">
                    {stats.map(s => {
                        const val = p.stats?.[s] !== undefined ? p.stats[s] : 10;
                        const mod = calcMod(val);
                        return (
                            <div key={s} className="attr-box h-[92px] p-2 flex flex-col items-center justify-center relative bg-slate-900/80 border border-tomeGold/40 rounded-xl shadow-md">
                                <label className="attr-label text-[0.65rem] font-black tracking-wider text-tomeGold">{labels[s]}</label>
                                <input 
                                    className="attr-score-input text-2xl font-black text-center text-white bg-transparent border-none w-full focus:outline-none" 
                                    type="number" 
                                    name={`stat_${s}`} 
                                    defaultValue={val}
                                />
                                <div 
                                    className="attr-modifier-bubble -bottom-3 text-xs font-black w-[42px] h-[26px] rounded-full bg-slate-950 border border-tomeGold/60 text-amber-300 flex items-center justify-center shadow-lg" 
                                    id={`mod-${s}`}
                                    title={`Modificador de ${labels[s]}`}
                                >
                                    {formatMod(mod)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── COLUNA 2: PROFICIÊNCIAS, SALVAGUARDAS E PERÍCIAS ── */}
                <div className="flex flex-col gap-5">
                    {/* Inspiração & Bônus de Proficiência */}
                    <div className="skills-list p-4 bg-slate-900/80 border border-tomeGold/30 rounded-xl flex flex-col gap-3 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="border border-tomeGold/40 w-7 h-7 rounded-lg flex items-center justify-center bg-black/40">
                                <input 
                                    type="checkbox" 
                                    name="inspiration" 
                                    defaultChecked={!!p.inspiration} 
                                    className="w-4 h-4 cursor-pointer accent-amber-500" 
                                />
                            </div>
                            <label className="attr-label m-0 text-xs font-bold text-slate-300">INSPIRAÇÃO</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="border border-tomeGold/40 w-12 h-8 rounded-lg flex items-center justify-center bg-black/40">
                                <input 
                                    type="number" 
                                    name="proficiencyBonus" 
                                    defaultValue={profBonus} 
                                    className="w-full border-none text-center font-black text-amber-400 bg-transparent text-sm focus:outline-none" 
                                />
                            </div>
                            <label className="attr-label m-0 text-xs font-bold text-slate-300">BÔNUS DE PROFICIÊNCIA</label>
                        </div>
                    </div>

                    {/* Testes de Resistência */}
                    <div className="skills-list p-4 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md">
                        <label className="sheet-section-title text-xs font-cinzel font-bold text-tomeGold tracking-wider block mb-2 border-b border-tomeGold/20 pb-1">
                            TESTES DE RESISTÊNCIA
                        </label>
                        <div className="flex flex-col gap-1">
                            {stats.map(s => {
                                const val = p.stats?.[s] !== undefined ? p.stats[s] : 10;
                                const mod = calcMod(val);
                                const isChecked = !!p.savingThrows?.[s];
                                const saveBonus = mod + (isChecked ? profBonus : 0);
                                return (
                                    <div key={`save-${s}`} className="skill-row flex items-center gap-2 py-0.5 text-xs hover:bg-white/5 px-1 rounded transition-colors">
                                        <input 
                                            type="checkbox" 
                                            name={`save_${s}`} 
                                            defaultChecked={isChecked} 
                                            className="cursor-pointer accent-amber-500 w-3.5 h-3.5" 
                                        />
                                        <span id={`save-val-${s}`} className="w-[30px] text-center font-bold text-amber-300 border-b border-tomeGold/30">
                                            {formatMod(saveBonus)}
                                        </span>
                                        <span className="flex-1 text-slate-200 font-medium">{labels[s]}</span>
                                        <button 
                                            type="button" 
                                            className="text-slate-400 hover:text-amber-400 p-1 transition-colors" 
                                            onClick={() => handleRoll(`Resistência: ${labels[s]}`, saveBonus)}
                                            title={`Rolar Salvaguarda de ${labels[s]}`}
                                        >
                                            <i className="fa-solid fa-dice-d20"></i>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Perícias */}
                    <div className="skills-list p-4 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md max-h-[480px] overflow-y-auto">
                        <label className="sheet-section-title text-xs font-cinzel font-bold text-tomeGold tracking-wider block mb-2 border-b border-tomeGold/20 pb-1">
                            PERÍCIAS
                        </label>
                        <div className="flex flex-col gap-1">
                            {skillsList.map(sk => {
                                const isChecked = !!p.skills?.includes(sk.id);
                                const statKey = sk.stat || 'dex';
                                const statVal = p.stats?.[statKey] !== undefined ? p.stats[statKey] : 10;
                                const statMod = calcMod(statVal);
                                const skillBonus = statMod + (isChecked ? profBonus : 0);
                                return (
                                    <div key={`skill-${sk.id}`} className="skill-row flex items-center gap-2 py-0.5 text-xs hover:bg-white/5 px-1 rounded transition-colors" id={`row-skill-${sk.id}`}>
                                        <input 
                                            type="checkbox" 
                                            name={`skill_${sk.id}`} 
                                            data-action="onSkillToggle" 
                                            defaultChecked={isChecked} 
                                            className="cursor-pointer accent-amber-500 w-3.5 h-3.5" 
                                        />
                                        <span id={`skill-val-${sk.id}`} className="w-[30px] text-center font-bold text-amber-300 border-b border-tomeGold/30">
                                            {formatMod(skillBonus)}
                                        </span>
                                        <span className="flex-1 text-slate-200 font-medium">
                                            {sk.label} <small className="opacity-50 text-[0.65rem]">({labels[statKey] || statKey.toUpperCase()})</small>
                                        </span>
                                        <button 
                                            type="button" 
                                            className="text-slate-400 hover:text-amber-400 p-1 transition-colors" 
                                            onClick={() => handleRoll(`Perícia: ${sk.label}`, skillBonus)}
                                            title={`Rolar ${sk.label}`}
                                        >
                                            <i className="fa-solid fa-dice-d20"></i>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── COLUNA 3: VITAIS, HP, DADOS DE VIDA E ATAQUES ── */}
                <div className="flex flex-col gap-5">
                    {/* CA, Iniciativa, Deslocamento */}
                    <div className="grid grid-cols-3 gap-3">
                        {derived.map(d => (
                            <div key={d.id} className="combat-box bg-slate-900/80 border border-tomeGold/40 rounded-xl p-3 text-center shadow-md">
                                <label className="combat-label text-[0.65rem] font-black uppercase text-tomeGold tracking-wider block mb-1">{d.label}</label>
                                <input 
                                    type="number" 
                                    name={d.id} 
                                    defaultValue={p[d.id] !== undefined ? p[d.id] : d.default} 
                                    className="w-full text-center text-2xl font-black bg-transparent border-none text-white focus:outline-none" 
                                />
                            </div>
                        ))}
                    </div>

                    {/* Pontos de Vida (HP) */}
                    <div className="hp-container p-4 bg-slate-900/80 border-2 border-red-900/40 rounded-xl relative shadow-md">
                        <span className="hp-label-float absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[0.65rem] font-cinzel font-bold bg-slate-950 border border-red-700/60 text-red-400 rounded-full">
                            PONTOS DE VIDA
                        </span>
                        <div className="flex justify-around items-center pt-2">
                            <div className="text-center">
                                <label className="attr-label text-[0.6rem] font-bold text-slate-400 block mb-1">MÁXIMO</label>
                                <input 
                                    type="number" 
                                    name="hp_max" 
                                    defaultValue={p.hp?.max !== undefined ? p.hp.max : 10} 
                                    className="w-[70px] text-2xl text-center border-none border-b-2 border-red-500/40 bg-transparent text-white font-bold focus:outline-none" 
                                />
                            </div>
                            <div className="text-center">
                                <label className="attr-label text-[0.6rem] font-bold text-slate-400 block mb-1">ATUAL</label>
                                <input 
                                    type="number" 
                                    name="hp_current" 
                                    defaultValue={p.hp?.current !== undefined ? p.hp.current : 10} 
                                    className="w-[90px] text-3xl text-center border-none font-black bg-transparent text-emerald-400 focus:outline-none" 
                                />
                            </div>
                        </div>
                        <div className="mt-3 border-t border-slate-700/40 pt-2 text-center">
                            <label className="attr-label text-[0.6rem] font-bold text-slate-400 block mb-1">PONTOS DE VIDA TEMPORÁRIOS</label>
                            <input 
                                type="number" 
                                name="hp_temp" 
                                defaultValue={p.hp?.temp || 0} 
                                className="w-full text-center border-none text-cyan-300 font-bold bg-transparent text-lg focus:outline-none" 
                            />
                        </div>
                    </div>

                    {/* Dados de Vida e Testes Contra a Morte */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="skills-list p-3 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md">
                            <label className="attr-label text-[0.65rem] font-black uppercase text-tomeGold block mb-1">DADOS DE VIDA</label>
                            <div className="flex gap-2">
                                <input 
                                    name="hit_dice_total" 
                                    defaultValue={p.hitDice?.total || ''} 
                                    placeholder="Total (ex: 1d8)" 
                                    className="w-full text-xs text-center bg-black/30 border border-slate-700/50 rounded p-1.5 text-white focus:border-amber-400 focus:outline-none" 
                                />
                                <input 
                                    name="hit_dice_rem" 
                                    defaultValue={p.hitDice?.remaining || ''} 
                                    placeholder="Restantes" 
                                    className="w-full text-xs text-center bg-black/30 border border-slate-700/50 rounded p-1.5 text-white focus:border-amber-400 focus:outline-none" 
                                />
                            </div>
                        </div>
                        <div className="skills-list p-3 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md">
                            <label className="attr-label text-[0.65rem] font-black uppercase text-tomeGold block mb-1">TESTES CONTRA A MORTE</label>
                            <div className="flex flex-col gap-1.5 items-center justify-center">
                                <div className="flex items-center gap-1.5">
                                    <small className="text-emerald-400 font-black mr-1 text-xs">S</small>
                                    <input type="checkbox" name="death_s1" defaultChecked={!!p.deathSaves?.successes?.[0]} className="cursor-pointer accent-emerald-500 w-4 h-4" />
                                    <input type="checkbox" name="death_s2" defaultChecked={!!p.deathSaves?.successes?.[1]} className="cursor-pointer accent-emerald-500 w-4 h-4" />
                                    <input type="checkbox" name="death_s3" defaultChecked={!!p.deathSaves?.successes?.[2]} className="cursor-pointer accent-emerald-500 w-4 h-4" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <small className="text-red-400 font-black mr-1 text-xs">F</small>
                                    <input type="checkbox" name="death_f1" defaultChecked={!!p.deathSaves?.failures?.[0]} className="cursor-pointer accent-red-500 w-4 h-4" />
                                    <input type="checkbox" name="death_f2" defaultChecked={!!p.deathSaves?.failures?.[1]} className="cursor-pointer accent-red-500 w-4 h-4" />
                                    <input type="checkbox" name="death_f3" defaultChecked={!!p.deathSaves?.failures?.[2]} className="cursor-pointer accent-red-500 w-4 h-4" data-action="onDeathFailureCheck" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ataques & Conjuração */}
                    <div className="skills-list p-4 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md">
                        <label className="sheet-section-title text-xs font-cinzel font-bold text-tomeGold tracking-wider block mb-2 border-b border-tomeGold/20 pb-1">
                            ATAQUES & CONJURAÇÃO
                        </label>
                        <div id="attacks-container" className="flex flex-col gap-1.5">
                            {context._renderAttackRows()}
                        </div>
                        <div className="flex gap-2.5 mt-3">
                            <button 
                                type="button" 
                                className="btn btn-ghost btn-sm flex-1 border border-tomeGold/40 text-tomeGold hover:bg-tomeGold/10 text-xs py-1.5 rounded" 
                                data-action="addAttackRow"
                            >
                                <i className="fa-solid fa-plus mr-1"></i> ADICIONAR ATAQUE
                            </button>
                        </div>
                        <textarea 
                            className="legacy-textarea mt-3 text-xs bg-black/30 border border-slate-700/50 rounded-lg p-2 text-slate-200 focus:border-amber-400 focus:outline-none" 
                            name="attack_notes" 
                            placeholder="Notas de combate, táticas e resistências..." 
                            rows={3} 
                            defaultValue={p.attackNotes || ''}
                        ></textarea>
                    </div>
                </div>

                {/* ── COLUNA 4: SENTIDOS PASSIVOS E OUTRAS PROFICIÊNCIAS ── */}
                <div className="flex flex-col gap-4">
                    {/* Sentidos Passivos */}
                    <div className="skills-list p-4 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md flex flex-col gap-2.5">
                        <div className="flex justify-between items-center border-b border-slate-700/40 pb-2">
                            <span className="text-[0.65rem] font-bold text-slate-400 uppercase">SABEDORIA PASSIVA (PERCEPÇÃO)</span>
                            <span id="pass-perc" className="font-black text-amber-400 text-sm">{passPerception}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-700/40 pb-2">
                            <span className="text-[0.65rem] font-bold text-slate-400 uppercase">INTELIGÊNCIA PASSIVA (INVEST.)</span>
                            <span id="pass-invest" className="font-black text-amber-400 text-sm">{passInvestigation}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                            <span className="text-[0.65rem] font-bold text-slate-400 uppercase">SABEDORIA PASSIVA (INTUIÇÃO)</span>
                            <span id="pass-insight" className="font-black text-amber-400 text-sm">{passInsight}</span>
                        </div>
                    </div>

                    {/* Outras Proficiências & Idiomas */}
                    <div className="skills-list p-4 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md flex-1 flex flex-col">
                        <label className="sheet-section-title text-xs font-cinzel font-bold text-tomeGold tracking-wider block mb-2 border-b border-tomeGold/20 pb-1">
                            OUTRAS PROFICIÊNCIAS & IDIOMAS
                        </label>
                        <textarea 
                            className="legacy-textarea flex-1 min-h-[160px] text-xs bg-black/30 border border-slate-700/50 rounded-lg p-2.5 text-slate-200 focus:border-amber-400 focus:outline-none leading-relaxed" 
                            name="other_profs" 
                            placeholder="Armas, armaduras, ferramentas, veículos e idiomas conhecidos..." 
                            defaultValue={p.otherProfs || ''}
                        ></textarea>
                    </div>
                </div>

            </div>
        </div>
    );
}
