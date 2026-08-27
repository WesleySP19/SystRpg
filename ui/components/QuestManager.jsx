import { h, Fragment } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/core/Toast.jsx';

// D&D 5e DMG Encounter XP thresholds per player character
const XP_THRESHOLDS = {
    easy: [25, 50, 75, 125, 250, 300, 350, 450, 550, 600, 800, 1000, 1100, 1250, 1400, 1600, 2000, 2100, 2400, 2800],
    medium: [50, 100, 150, 250, 500, 600, 750, 900, 1100, 1200, 1600, 2000, 2200, 2500, 2800, 3200, 3900, 4200, 4900, 5700],
    hard: [75, 150, 225, 375, 750, 900, 1100, 1400, 1600, 1900, 2400, 3000, 3400, 3800, 4300, 4800, 5900, 6300, 7300, 8500],
    deadly: [100, 200, 400, 500, 1100, 1400, 1700, 2100, 2400, 2800, 3600, 4500, 5100, 5700, 6400, 7200, 8800, 9500, 10900, 12700]
};

// D&D 5e Factions definition
const FACTIONS = [
    { id: 'Harpistas', name: 'Harpistas (Harpers)', motto: 'Quem luta contra a escuridão nunca está sozinho.', desc: 'Uma rede dispersa de magos e espiões que defendem a igualdade, preservam o conhecimento histórico e combatem a ascensão de tiranos.', crest: '🌙⚔️', color: 'text-blue-500', border: 'border-blue-500' },
    { id: 'Aliança dos Lordes', name: 'Aliança dos Lordes (Lords\' Alliance)', motto: 'A união faz a força e a ordem gera a prosperidade.', desc: 'Uma coalizão de governantes de grandes cidades do Norte que se unem para afastar ameaças externas e manter a lei e o comércio nas estradas.', crest: '👑🛡️', color: 'text-tomeGold', border: 'border-tomeGold' },
    { id: 'Ordem da Manopla', name: 'Ordem da Manopla (Order of the Gauntlet)', motto: 'A fé é o nosso escudo, a justiça é a nossa espada.', desc: 'Um grupo vigilante de paladinos, clérigos e guerreiros dedicados a purificar o mal antes que ele possa criar raízes, focados em honra e ação rápida.', crest: '✊☀️', color: 'text-red-500', border: 'border-red-500' },
    { id: 'Enclave Esmeralda', name: 'Enclave Esmeralda (Emerald Enclave)', motto: 'O equilíbrio na natureza garante a sobrevivência de todos.', desc: 'Guardiões selvagens, druidas e patrulheiros dedicados a manter a harmonia entre a civilização e a natureza indomável, combatendo aberrações e flagelos.', crest: '🍃🏹', color: 'text-green-500', border: 'border-green-500' },
    { id: 'Zhentarim', name: 'Zhentarim (Rede Sombria)', motto: 'O poder pertence àqueles com ambição para tomá-lo.', desc: 'Uma organização mercantil mercenária e nas sombras, focada em obter monopólios comerciais e influência política. Oferece segurança pelo preço certo.', crest: '🚩🐉', color: 'text-purple-500', border: 'border-purple-500' }
];

function getRenownRank(points) {
    if (points >= 50) return { title: 'Grão-Mestre / Líder (Rank 5)', color: 'text-purple-500' };
    if (points >= 25) return { title: 'Mentor / Alto Conselheiro (Rank 4)', color: 'text-yellow-500' };
    if (points >= 10) return { title: 'Aliado Fiel (Rank 3)', color: 'text-blue-500' };
    if (points >= 3) return { title: 'Agente / Representante (Rank 2)', color: 'text-green-500' };
    return { title: 'Iniciado / Recruta (Rank 1)', color: 'text-gray-400' };
}

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

// ======================= SUBCOMPONENTS =======================

function QuestForm({ onSubmit, onCancel, avgLevel }) {
    const [xpType, setXpType] = useState('xp');
    const [difficulty, setDifficulty] = useState('medium');
    
    const handleSuggestXP = () => {
        const table = XP_THRESHOLDS[difficulty] || XP_THRESHOLDS.medium;
        const index = Math.max(0, Math.min(19, avgLevel - 1));
        const val = table[index] || 100;
        document.getElementById('quest-xp-reward-input').value = val;
        Toast.show(`Sugestão de XP calculada para Nível ${avgLevel} (${difficulty}): +${val} XP por herói.`, 'info');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        onSubmit(data);
    };

    return (
        <div className="card glass-accent mb-8 rounded-xl p-6 animate-slideDown shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-1.5 border-tomeGold/30 bg-black/85 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label className="font-cinzel text-[0.7rem] tracking-wider text-tomeGold font-black">Título da Missão</label>
                    <input type="text" name="title" required placeholder="Ex: O Segredo do Forte Sombrio" className="bg-black/40 border-1.5 border-tomeGold/25 font-outfit rounded-md p-2 text-white outline-none focus:border-tomeGold" />
                </div>
                
                <div className="flex flex-col gap-1">
                    <label className="font-cinzel text-[0.7rem] tracking-wider text-tomeGold font-black">Descrição / Objetivos Principais</label>
                    <textarea name="description" rows="3" required placeholder="Que lenda os heróis desvendarão? O que eles precisam alcançar?" className="bg-black/40 border-1.5 border-tomeGold/25 font-outfit rounded-md p-2.5 text-white outline-none focus:border-tomeGold leading-relaxed"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="font-cinzel text-[0.7rem] tracking-wider text-tomeGold font-black">Tipo de Missão</label>
                        <select name="type" className="bg-black/40 border-1.5 border-tomeGold/25 font-outfit text-white h-[38px] rounded-md px-2 outline-none">
                            <option value="main">⚜️ Principal</option>
                            <option value="side">🗺️ Secundária</option>
                            <option value="personal">👤 Pessoal</option>
                            <option value="faction">🚩 Facção</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-cinzel text-[0.7rem] tracking-wider text-tomeGold font-black">Dificuldade CD</label>
                        <select name="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)} className="bg-black/40 border-1.5 border-tomeGold/25 font-outfit text-white h-[38px] rounded-md px-2 outline-none">
                            <option value="easy">Fácil (CD 10)</option>
                            <option value="medium">Média (CD 15)</option>
                            <option value="hard">Difícil (CD 20)</option>
                            <option value="deadly">Mortal (CD 25+)</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-cinzel text-[0.7rem] tracking-wider text-tomeGold font-black">Níveis Recomendados</label>
                        <select name="levelRange" className="bg-black/40 border-1.5 border-tomeGold/25 font-outfit text-white h-[38px] rounded-md px-2 outline-none">
                            <option value="1-4">Tier 1 (Nível 1-4)</option>
                            <option value="5-10">Tier 2 (Nível 5-10)</option>
                            <option value="11-16">Tier 3 (Nível 11-16)</option>
                            <option value="17-20">Tier 4 (Nível 17-20)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="font-cinzel text-[0.7rem] tracking-wider text-tomeGold font-black">Facção Vinculada</label>
                        <select name="faction" className="bg-black/40 border-1.5 border-tomeGold/25 font-outfit text-white h-[38px] rounded-md px-2 outline-none">
                            <option value="Nenhuma">Nenhuma Facção</option>
                            <option value="Harpistas">Harpistas (Harpers)</option>
                            <option value="Aliança dos Lordes">Aliança dos Lordes (Lords' Alliance)</option>
                            <option value="Ordem da Manopla">Ordem da Manopla (Order of the Gauntlet)</option>
                            <option value="Enclave Esmeralda">Enclave Esmeralda (Emerald Enclave)</option>
                            <option value="Zhentarim">Zhentarim (Rede Sombria)</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-cinzel text-[0.7rem] tracking-wider text-tomeGold font-black">Tipo de Recompensa XP</label>
                        <div className="flex gap-5 items-center h-[38px]">
                            <label className="text-xs text-white cursor-pointer flex items-center gap-1.5">
                                <input type="radio" name="xpType" value="xp" checked={xpType === 'xp'} onChange={() => setXpType('xp')} className="accent-tomeGold" />
                                Experiência (XP)
                            </label>
                            <label className="text-xs text-white cursor-pointer flex items-center gap-1.5">
                                <input type="radio" name="xpType" value="milestone" checked={xpType === 'milestone'} onChange={() => setXpType('milestone')} className="accent-tomeGold" />
                                Marco Narrativo (Milestone)
                            </label>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`flex flex-col gap-1 ${xpType !== 'xp' ? 'hidden' : ''}`}>
                        <div className="flex justify-between items-center mb-1">
                            <label className="font-cinzel text-[0.7rem] tracking-wider text-tomeGold font-black m-0">XP por Personagem</label>
                            <button type="button" className="btn btn-ghost btn-sm text-[0.6rem] px-1.5 py-0.5 h-auto text-tomeGold hover:bg-tomeGold/10 rounded" onClick={handleSuggestXP}>
                                🔮 Sugerir XP (Nv Médio: {avgLevel})
                            </button>
                        </div>
                        <input type="number" id="quest-xp-reward-input" name="xpReward" min="0" placeholder="Ex: 500" className="bg-black/40 border-1.5 border-tomeGold/25 font-outfit rounded-md p-2 text-white outline-none focus:border-tomeGold h-[38px]" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-cinzel text-[0.7rem] tracking-wider text-tomeGold font-black">Recompensa Física (Ouro / Itens Mágicos)</label>
                        <input type="text" name="reward" placeholder="Ex: 250 GP, Poção de Cura Maior" className="bg-black/40 border-1.5 border-tomeGold/25 font-outfit rounded-md p-2 text-white outline-none focus:border-tomeGold h-[38px]" />
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="font-cinzel text-[0.7rem] tracking-wider text-tomeGold font-black">Etapas da Missão (Objetivos do checklist - separados por vírgula)</label>
                    <input type="text" name="initialMilestones" placeholder="Ex: Investigar as ruínas, Encontrar a chave da cripta, Banir o espírito" className="bg-black/40 border-1.5 border-tomeGold/25 font-outfit rounded-md p-2 text-white outline-none focus:border-tomeGold h-[38px]" />
                </div>

                <div className="flex gap-2 mt-2">
                    <button type="button" onClick={onCancel} className="btn btn-ghost w-1/3 p-3 font-cinzel font-black tracking-widest bg-white/5 hover:bg-white/10 rounded-md">
                        CANCELAR
                    </button>
                    <button type="submit" className="btn btn-primary w-2/3 p-3 font-cinzel font-black tracking-widest bg-tomeGold text-black hover:bg-yellow-500 rounded-md">
                        ⚔️ PROCLAMAR MISSÃO
                    </button>
                </div>
            </form>
        </div>
    );
}

function QuestCard({ q, onToggleMilestone, onAddMilestone, onDelete, onToggleComplete, onMarkFailed, onDistributeXP, onTriggerLevelUp, onOpenLootModal }) {
    const colors = { main: 'text-tomeGold', side: 'text-blue-500', personal: 'text-green-500', faction: 'text-purple-500' };
    const borderColors = { main: 'border-tomeGold', side: 'border-blue-500', personal: 'border-green-500', faction: 'border-purple-500' };
    const labels = { main: '⚜️ Principal', side: '🗺️ Secundária', personal: '👤 Pessoal', faction: '🚩 Facção' };
    
    const diffColors = { easy: 'text-green-500', medium: 'text-yellow-500', hard: 'text-orange-500', deadly: 'text-red-500' };
    const diffLabels = { easy: 'Fácil (CD 10)', medium: 'Média (CD 15)', hard: 'Difícil (CD 20)', deadly: 'Mortal (CD 25+)' };

    let borderStyle = '';
    if (q.completed) {
        borderStyle = 'border-1.5 border-green-500/40 shadow-[0_4px_15px_rgba(34,197,94,0.08)] opacity-80';
    } else if (q.failed) {
        borderStyle = 'border-1.5 border-red-500/40 shadow-[0_4px_15px_rgba(239,68,68,0.08)] opacity-80';
    } else {
        borderStyle = `border-1.5 border-white/5 border-t-[4.5px] ${borderColors[q.type] || 'border-gray-500'}`;
    }

    const cardClass = (q.completed || q.failed) ? 'card glass' : 'card glass-accent';
    const titleStyle = q.completed ? 'line-through text-gray-500' : q.failed ? 'line-through text-red-500' : 'text-white';
    
    const difficultyLabel = diffLabels[q.difficulty] || 'Média';
    const difficultyColor = diffColors[q.difficulty] || 'text-tomeGold';

    const milestones = q.milestones || [];
    const completedCount = milestones.filter(m => m.completed).length;
    const percent = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    const [newMilestone, setNewMilestone] = useState('');

    const handleAddMilestone = () => {
        if (newMilestone.trim()) {
            onAddMilestone(q.id, newMilestone.trim());
            setNewMilestone('');
        }
    };

    return (
        <div className={`${cardClass} p-5 rounded-xl transition-all duration-300 animate-cardFadeIn flex flex-col justify-between min-h-[380px] ${borderStyle}`}>
            <div>
                {/* Badge header */}
                <div className="flex justify-between items-center mb-3">
                    <span className={`bg-black/30 px-2.5 py-1 rounded-full text-[0.65rem] font-black border border-white/5 ${colors[q.type]}`}>
                        {labels[q.type] || q.type}
                    </span>
                    
                    {/* Difficulty and level */}
                    <div className="flex gap-1.5 items-center">
                        <span className={`text-[0.6rem] px-1.5 py-0.5 rounded bg-black/25 font-black border border-white/5 ${difficultyColor}`}>
                            {difficultyLabel}
                        </span>
                        <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-bold border border-white/5">
                            Níveis {q.levelRange || '1-4'}
                        </span>
                    </div>
                </div>

                {/* Title & description */}
                <div className="relative">
                    <h3 className={`m-0 mb-2 font-cinzel text-[1.1rem] font-bold leading-tight ${titleStyle}`}>
                        {q.failed ? '💀 ' : ''}{q.title}
                    </h3>
                    <p className="text-[0.75rem] text-gray-400 leading-relaxed m-0 mb-4 min-h-[44px] line-clamp-3">
                        {q.description}
                    </p>
                </div>

                {/* Faction tie */}
                {q.faction && q.faction !== 'Nenhuma' && (
                    <div className="text-[0.65rem] text-gray-400 flex items-center gap-1.5 mb-4 bg-white/5 px-2 py-1 rounded-md border border-white/5 w-fit">
                        <i className={`fa-solid fa-flag ${colors.faction || 'text-purple-500'}`}></i> Facção: <strong className="text-white">{q.faction}</strong>
                    </div>
                )}

                {/* Milestones checklist */}
                <div className="mb-4">
                    {milestones.length === 0 ? (
                        <div className="text-[0.7rem] text-gray-500 mb-3 italic">Nenhum objetivo específico registrado.</div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center text-[0.65rem] text-gray-400 mb-1 font-black tracking-wider uppercase">
                                <span>Objetivos ({completedCount}/{milestones.length})</span>
                                <span>{percent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2.5">
                                <div className="h-full bg-gradient-to-r from-tomeGold to-yellow-400 rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                            </div>
                            <div className="flex flex-col gap-1.5 max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
                                {milestones.map(m => (
                                    <label key={m.id} className={`flex items-start gap-2 text-[0.72rem] cursor-pointer leading-tight ${m.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                        <input type="checkbox" className="accent-tomeGold cursor-pointer mt-0.5" checked={m.completed} onChange={(e) => onToggleMilestone(q.id, m.id, e.target.checked)} />
                                        <span>{m.text}</span>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Milestone Inline Form */}
                {!q.completed && !q.failed && (
                    <div className="flex gap-1.5 mb-4">
                        <input type="text" placeholder="Nova etapa da missão..." 
                               className="flex-1 bg-black/60 border-1.5 border-tomeGold/20 rounded-md px-2.5 py-1 text-white text-[0.7rem] outline-none"
                               value={newMilestone}
                               onChange={e => setNewMilestone(e.target.value)}
                               onKeyDown={e => { if (e.key === 'Enter') handleAddMilestone(); }} />
                        <button className="btn btn-ghost px-2.5 py-1 rounded-md text-[0.7rem] font-black border-tomeGold/30 text-tomeGold hover:bg-tomeGold/10" onClick={handleAddMilestone}>
                            <i className="fa-solid fa-plus"></i>
                        </button>
                    </div>
                )}
            </div>

            {/* Footer rewards & status triggers */}
            <div className="mt-auto flex flex-col gap-2.5">
                {/* Reward summary */}
                <div className="p-2.5 bg-black/30 rounded-lg flex justify-between items-center border border-white/5 text-[0.7rem]">
                    <span className="text-white font-semibold inline-flex items-center gap-1 max-w-[55%] truncate">
                        <i className="fa-solid fa-coins text-tomeGold"></i> {q.reward || 'Sem item'}
                    </span>
                    <span>
                        {q.xpType === 'milestone' 
                            ? <span className="text-yellow-400 font-black inline-flex items-center gap-1"><i className="fa-solid fa-trophy"></i> Marco</span>
                            : <span className="text-blue-400 font-black inline-flex items-center gap-1"><i className="fa-solid fa-star"></i> +{q.xpReward || 0} XP</span>
                        }
                    </span>
                </div>

                {/* Actions Triggers / Distribution Grid */}
                <div className="flex flex-col gap-1.5">
                    {q.completed && q.xpType !== 'milestone' && (
                        !q.xpDistributed ? (
                            <button className="btn btn-sm w-full py-1.5 rounded-md text-[0.68rem] font-black inline-flex items-center justify-center gap-1.5 bg-blue-500/15 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30 transition-colors" onClick={() => onDistributeXP(q.id)}>
                                <i className="fa-solid fa-gift"></i> Distribuir XP ao Grupo
                            </button>
                        ) : (
                            <div className="text-center text-[0.62rem] text-green-500 font-bold uppercase tracking-wider py-1 bg-green-500/5 rounded-md">
                                <i className="fa-solid fa-circle-check"></i> XP da Missão Distribuído
                            </div>
                        )
                    )}

                    {q.completed && q.xpType === 'milestone' && (
                        !q.milestoneLeveled ? (
                            <button className="btn btn-ghost btn-sm w-full py-1.5 rounded-md text-[0.68rem] font-black inline-flex items-center justify-center gap-1.5 text-yellow-400 border-yellow-400/35 bg-yellow-400/10 hover:bg-yellow-400/20 transition-colors" onClick={() => onTriggerLevelUp(q.id)}>
                                <i className="fa-solid fa-angles-up"></i> Conceder Level Up ao Grupo
                            </button>
                        ) : (
                            <div className="text-center text-[0.62rem] text-yellow-400 font-bold uppercase tracking-wider py-1 bg-yellow-400/5 rounded-md">
                                <i className="fa-solid fa-circle-check"></i> Level Up do Grupo Concedido
                            </div>
                        )
                    )}

                    {q.completed && q.reward && q.reward !== 'Nenhuma' && (
                        !q.rewardDistributed ? (
                            <button className="btn btn-ghost btn-sm w-full py-1.5 rounded-md text-[0.68rem] font-black inline-flex items-center justify-center gap-1.5 text-green-400 border-green-400/35 bg-green-400/10 hover:bg-green-400/20 transition-colors" onClick={() => onOpenLootModal(q.id)}>
                                <i className="fa-solid fa-hand-holding-dollar"></i> Distribuir Tesouros & Itens
                            </button>
                        ) : (
                            <div className="text-center text-[0.62rem] text-green-400 font-bold uppercase tracking-wider py-1 bg-green-400/5 rounded-md">
                                <i className="fa-solid fa-circle-check"></i> Riquezas Entregues aos Heróis
                            </div>
                        )
                    )}
                </div>

                {/* Actions triggers */}
                <div className="flex justify-between items-center gap-1.5 mt-1 border-t border-white/5 pt-2.5">
                    <button className="btn btn-ghost btn-sm px-2.5 py-1.5 rounded-md border border-red-500/15 text-red-500 bg-red-500/5 hover:bg-red-500/20" onClick={() => onDelete(q.id)}>
                        <i className="fa-solid fa-trash-can"></i> Deletar
                    </button>

                    <div className="flex gap-1.5 flex-1 justify-end">
                        {q.completed || q.failed ? (
                            <button className="btn btn-ghost btn-sm px-3 py-1.5 text-[0.68rem] rounded-md border-white/10 hover:bg-white/10" onClick={() => onToggleComplete(q.id, 'reactivate')}>
                                Reativar Missão
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-ghost btn-sm px-3 py-1.5 text-[0.68rem] rounded-md border-red-500/20 text-red-500 hover:bg-red-500/10" onClick={() => onMarkFailed(q.id)}>
                                    <i className="fa-solid fa-skull"></i> Falhar
                                </button>
                                <button className="btn btn-sm btn-ghost px-3 py-1.5 text-[0.68rem] rounded-md border-green-500/30 text-green-300 bg-green-500/5 hover:bg-green-500/20" onClick={() => onToggleComplete(q.id, 'complete')}>
                                    <i className="fa-solid fa-check"></i> Concluir
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LootModal({ quest, players, onClose, onConfirm }) {
    const [gold, setGold] = useState(0);
    const [items, setItems] = useState('');
    const [selectedPlayers, setSelectedPlayers] = useState(players.map(p => p.id));

    useEffect(() => {
        const rewardText = quest?.reward || '';
        const matchGold = rewardText.match(/(\d+)\s*(?:gp|GP|po|PO|ouro|Ouro)/);
        if (matchGold) setGold(parseInt(matchGold[1]) || 0);
        const remainingItems = rewardText.replace(/(\d+)\s*(?:gp|GP|po|PO|ouro|Ouro)(?:,?\s*e?\s*)?/, '').trim();
        setItems(remainingItems !== 'Nenhuma' ? remainingItems : '');
    }, [quest]);

    const togglePlayer = (id) => {
        if (selectedPlayers.includes(id)) setSelectedPlayers(selectedPlayers.filter(x => x !== id));
        else setSelectedPlayers([...selectedPlayers, id]);
    };

    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[2000] flex items-center justify-center p-5 animate-fadeIn" onClick={onClose}>
            <div className="card glass-accent max-w-[500px] w-full p-8 border-2 border-tomeGold rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-left bg-[#0a0c10]/95 animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-5 border-b border-tomeGold/20 pb-4">
                    <i className="fa-solid fa-gift fa-3x text-tomeGold mb-2.5"></i>
                    <h3 className="font-cinzel text-tomeGold m-0 text-[1.6rem] font-black">💰 Distribuir Tesouro</h3>
                    <p className="text-[0.8rem] text-gray-400 mt-2">
                        Recompensa da Missão: <strong className="text-white">"{quest.reward}"</strong>
                    </p>
                </div>

                <div className="flex flex-col gap-1 mb-4">
                    <label className="font-cinzel text-[0.7rem] text-tomeGold font-black tracking-wider">Ouro Total a Dividir (GP / PO)</label>
                    <input type="number" value={gold} onChange={e => setGold(parseInt(e.target.value) || 0)} className="bg-black/40 border-1.5 border-tomeGold/25 rounded-lg px-3 py-2 text-white w-full text-[0.85rem] outline-none focus:border-tomeGold" />
                </div>

                <div className="flex flex-col gap-1 mb-5">
                    <label className="font-cinzel text-[0.7rem] text-tomeGold font-black tracking-wider">Itens Mágicos / Equipamentos a Entregar</label>
                    <input type="text" value={items} onChange={e => setItems(e.target.value)} placeholder="Ex: Poção de Cura Maior, Anel de Proteção" className="bg-black/40 border-1.5 border-tomeGold/25 rounded-lg px-3 py-2 text-white w-full text-[0.85rem] outline-none focus:border-tomeGold" />
                </div>

                <label className="font-cinzel text-[0.7rem] text-tomeGold font-black tracking-wider block mb-2">Selecione os Heróis Beneficiários</label>
                <div className="flex flex-col gap-2 mb-6 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                    {players.map(p => {
                        const selected = selectedPlayers.includes(p.id);
                        return (
                            <label key={p.id} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer border transition-all duration-200 ${selected ? 'bg-tomeGold/10 border-tomeGold' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                <input type="checkbox" className="w-[18px] h-[18px] accent-tomeGold cursor-pointer" checked={selected} onChange={() => togglePlayer(p.id)} />
                                <div className="flex-1">
                                    <div className="font-black text-[0.9rem] text-white">{p.name}</div>
                                    <div className="text-[0.65rem] text-gray-500 uppercase tracking-wider">{p.class || 'Aventureiro'}</div>
                                </div>
                            </label>
                        );
                    })}
                </div>

                <div className="flex gap-3">
                    <button className="btn btn-ghost w-1/2 rounded-xl py-3 border-white/10 text-white bg-white/5 hover:bg-white/10 font-bold" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary w-1/2 rounded-xl py-3 font-black bg-tomeGold text-black hover:bg-yellow-500" disabled={selectedPlayers.length === 0} onClick={() => onConfirm(quest.id, gold, items, selectedPlayers)}>
                        Confirmar Distribuição
                    </button>
                </div>
            </div>
        </div>
    );
}

// ======================= MAIN EXPORT =======================

export function QuestManager({ store }) {
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed' | 'failed' | 'factions' | 'chronicles'
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showLootModalId, setShowLootModalId] = useState(null);

    const state = store.state;
    const quests = state.quests || [];
    const players = state.players || [];
    const renown = state.factionRenown || { Harpers: 0, Alliance: 0, Gauntlet: 0, Enclave: 0, Zhentarim: 0 };
    const chronicles = state.chronicleEntries || [];

    const avgLevel = players.length > 0 
        ? Math.round(players.reduce((sum, p) => sum + (parseInt(p.level) || 1), 0) / players.length)
        : 1;

    // Filter quests
    const filtered = quests.filter(q => {
        if (activeTab === 'completed' && !q.completed) return false;
        if (activeTab === 'failed' && !q.failed) return false;
        if (activeTab === 'active' && (q.completed || q.failed)) return false;

        const query = searchQuery.toLowerCase().trim();
        if (query) {
            const matchesTitle = q.title?.toLowerCase().includes(query);
            const matchesDesc = q.description?.toLowerCase().includes(query);
            const matchesReward = q.reward?.toLowerCase().includes(query);
            const matchesFaction = q.faction?.toLowerCase().includes(query);
            if (!matchesTitle && !matchesDesc && !matchesReward && !matchesFaction) return false;
        }

        if (filterType !== 'all' && q.type !== filterType) return false;
        return true;
    });

    const activeCount = quests.filter(q => !q.completed && !q.failed).length;
    const completedCount = quests.filter(q => q.completed).length;
    const failedCount = quests.filter(q => q.failed).length;

    // --- Actions ---

    const handleCreateQuest = (data) => {
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

        store.update(s => {
            s.quests = [...(s.quests || []), newQuest];
            const sessionNum = s.sessionNumber || 1;
            const logMsg = `📜 NOVA MISSÃO INICIADA: "${newQuest.title}" (${data.type === 'main' ? 'Principal' : 'Secundária'}).`;
            s.journalEntries = [...(s.journalEntries || []), {
                id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                session: sessionNum, timestamp: Date.now(), text: logMsg, type: 'system'
            }];
        });

        logChronicleEntry(store, `Nova Missão Iniciada: Os heróis juraram cumprir os objetivos da busca "${newQuest.title}".`, 'custom');
        TOME.persistence.save().catch(console.warn);
        setShowForm(false);
        Toast.show('Nova missão proclamada com sucesso!');
    };

    const handleToggleMilestone = (qId, mId, completed) => {
        store.update(s => {
            s.quests = (s.quests || []).map(q => {
                if (q.id === qId) {
                    const milestones = (q.milestones || []).map(m => m.id === mId ? { ...m, completed } : m);
                    return { ...q, milestones };
                }
                return q;
            });
        });
        TOME.persistence.save().catch(console.warn);
    };

    const handleAddMilestone = (qId, text) => {
        store.update(s => {
            s.quests = (s.quests || []).map(q => {
                if (q.id === qId) {
                    return { ...q, milestones: [...(q.milestones || []), { id: 'm-' + Date.now() + '-' + Math.floor(Math.random() * 100), text, completed: false }] };
                }
                return q;
            });
        });
        TOME.persistence.save().catch(console.warn);
    };

    const handleDeleteQuest = (id) => {
        if (confirm('Deseja excluir esta missão permanentemente? Esta ação não pode ser desfeita.')) {
            store.update(s => { s.quests = (s.quests || []).filter(q => q.id !== id); });
            TOME.persistence.save().catch(console.warn);
            Toast.show('Missão removida permanentemente.');
        }
    };

    const handleToggleComplete = (id, type) => {
        store.update(s => {
            s.quests = (s.quests || []).map(q => {
                if (q.id === id) {
                    const completed = type === 'reactivate' ? false : !q.completed;
                    
                    if (completed && !q.completed) {
                        const sessionNum = s.sessionNumber || 1;
                        const logMsg = `⚔️ MISSÃO CONCLUÍDA: Os heróis completaram a missão "${q.title}"!`;
                        s.journalEntries = [...(s.journalEntries || []), {
                            id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                            session: sessionNum, timestamp: Date.now(), text: logMsg, type: 'system'
                        }];

                        if (q.faction && q.faction !== 'Nenhuma') {
                            const ptsAward = q.difficulty === 'easy' ? 1 : q.difficulty === 'hard' ? 3 : q.difficulty === 'deadly' ? 5 : 2;
                            if (!s.factionRenown) s.factionRenown = { Harpers: 0, Alliance: 0, Gauntlet: 0, Enclave: 0, Zhentarim: 0 };
                            
                            const keyMap = { 'Harpistas': 'Harpers', 'Aliança dos Lordes': 'Alliance', 'Ordem da Manopla': 'Gauntlet', 'Enclave Esmeralda': 'Enclave', 'Zhentarim': 'Zhentarim' };
                            const fKey = keyMap[q.faction] || 'Harpers';
                            s.factionRenown[fKey] = (s.factionRenown[fKey] || 0) + ptsAward;

                            const fLog = `🚩 RENOME DE FACÇÃO: A influência com os ${q.faction} aumentou em +${ptsAward} pontos pela conclusão de "${q.title}".`;
                            s.journalEntries.push({
                                id: 'log-f-' + Date.now(), session: sessionNum, timestamp: Date.now(), text: fLog, type: 'system'
                            });
                        }
                    }
                    return { ...q, completed, failed: false, status: completed ? 'completed' : 'active' };
                }
                return q;
            });
        });
        
        const qObj = store.state.quests?.find(q => q.id === id);
        if (qObj) {
            if (type !== 'reactivate' && qObj.completed) logChronicleEntry(store, `Aventura Concluída: "${qObj.title}". Os heróis conquistaram as metas e foram agraciados com recompensas.`, 'quest_completed');
            else if (type === 'reactivate') logChronicleEntry(store, `Missão Reaberta: A crônica de "${qObj.title}" volta a ficar ativa no diário de aventuras.`, 'custom');
        }
        TOME.persistence.save().catch(console.warn);
    };

    const handleMarkFailed = (id) => {
        if (confirm('Marcar esta missão como fracassada? O fracasso será arquivado na crônica da campanha.')) {
            store.update(s => {
                s.quests = (s.quests || []).map(q => {
                    if (q.id === id) {
                        const sessionNum = s.sessionNumber || 1;
                        const logMsg = `💀 MISSÃO FRACASSADA: Os heróis falharam na missão "${q.title}".`;
                        s.journalEntries = [...(s.journalEntries || []), {
                            id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                            session: sessionNum, timestamp: Date.now(), text: logMsg, type: 'system'
                        }];
                        return { ...q, failed: true, completed: false, status: 'failed' };
                    }
                    return q;
                });
            });
            const qObj = store.state.quests?.find(q => q.id === id);
            if (qObj) logChronicleEntry(store, `Aventura Fracassada: "${qObj.title}". Um capítulo sombrio se fecha com a derrota ou falha dos heróis nas suas metas.`, 'quest_failed');
            TOME.persistence.save().catch(console.warn);
        }
    };

    const handleDistributeXP = (id) => {
        const quest = store.state.quests?.find(q => q.id === id);
        if (!quest || !quest.xpReward || quest.xpDistributed) return;
        const xpVal = parseInt(quest.xpReward) || 0;
        if (xpVal <= 0) return;
        if (players.length === 0) { Toast.show('Nenhum herói ativo na campanha para receber XP!', 'error'); return; }

        store.update(s => {
            s.players = (s.players || []).map(p => ({ ...p, xp: (parseInt(p.xp) || 0) + xpVal }));
            s.quests = (s.quests || []).map(q => q.id === id ? { ...q, xpDistributed: true } : q);
            s.xpDistributed = (s.xpDistributed || 0) + (xpVal * players.length);
            
            const sessionNum = s.sessionNumber || 1;
            const logMsg = `🏆 XP DA MISSÃO: Distribuído +${xpVal} XP para todos os heróis pela conclusão de "${quest.title}".`;
            s.journalEntries = [...(s.journalEntries || []), {
                id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                session: sessionNum, timestamp: Date.now(), text: logMsg, type: 'system'
            }];
        });
        TOME.persistence.save().catch(console.warn);
        Toast.show(`+${xpVal} XP distribuído para ${players.length} heróis!`, 'success');
    };

    const handleTriggerLevelUp = (id) => {
        const quest = store.state.quests?.find(q => q.id === id);
        if (!quest || quest.milestoneLeveled) return;
        if (players.length === 0) { Toast.show('Nenhum herói ativo na campanha para receber evolução!', 'error'); return; }

        if (confirm(`Deseja aplicar um LEVEL UP geral para todos os ${players.length} heróis ativos pela conclusão do marco "${quest.title}"?`)) {
            store.update(s => {
                s.players = (s.players || []).map(p => ({ ...p, level: (parseInt(p.level) || 1) + 1 }));
                s.quests = (s.quests || []).map(q => q.id === id ? { ...q, milestoneLeveled: true, xpDistributed: true } : q);
                
                const sessionNum = s.sessionNumber || 1;
                const logMsg = `✨ EVOLUÇÃO POR MARCO: O grupo alcançou o marco "${quest.title}" e subiu de nível!`;
                s.journalEntries = [...(s.journalEntries || []), {
                    id: 'log-milestone-' + Date.now(),
                    session: sessionNum, timestamp: Date.now(), text: logMsg, type: 'system'
                }];
            });
            logChronicleEntry(store, `Marco Avançado: O grupo subiu de nível! Todos os heróis agora são nível superior graças à conclusão de "${quest.title}".`, 'level_up');
            TOME.persistence.save().catch(console.warn);
            Toast.show('✨ Grupo subiu de nível com sucesso!', 'success');
        }
    };

    const handleConfirmLoot = (qId, goldVal, itemsText, selectedPlayerIds) => {
        const goldPerHero = goldVal > 0 ? Math.floor(goldVal / selectedPlayerIds.length) : 0;
        store.update(s => {
            s.players.forEach(p => {
                if (selectedPlayerIds.includes(p.id)) {
                    if (!p.currency) p.currency = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
                    p.currency.gp = (parseInt(p.currency.gp) || 0) + goldPerHero;
                    if (itemsText) {
                        if (!p.equipment) p.equipment = { items: [], notes: '' };
                        if (typeof p.equipment.items === 'string') {
                            p.equipment.items = p.equipment.items.trim() ? p.equipment.items + '\n• ' + itemsText : '• ' + itemsText;
                        } else {
                            p.equipment.items = p.equipment.items || [];
                            p.equipment.items.push({ id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 100), name: itemsText, qty: 1, weight: 0.5 });
                        }
                    }
                }
            });
            s.quests = (s.quests || []).map(q => q.id === qId ? { ...q, rewardDistributed: true } : q);
            const beneficiaryNames = s.players.filter(p => selectedPlayerIds.includes(p.id)).map(p => p.name).join(', ');
            let logMsg = `💰 DIVISÃO DE SAQUE: Riquezas da missão foram distribuídas para: ${beneficiaryNames}.`;
            if (goldVal > 0) logMsg += ` Cada herói recebeu +${goldPerHero} PO.`;
            if (itemsText) logMsg += ` Itens entregues: "${itemsText}".`;
            s.journalEntries = [...(s.journalEntries || []), {
                id: 'log-loot-' + Date.now(), session: s.sessionNumber || 1, timestamp: Date.now(), text: logMsg, type: 'loot'
            }];
        });
        const qObj = store.state.quests?.find(q => q.id === qId);
        if (qObj) {
            let chronMsg = `Tesouros da missão "${qObj.title}" divididos entre o grupo.`;
            if (goldVal > 0) chronMsg += ` +${goldVal} PO partilhados.`;
            if (itemsText) chronMsg += ` Artefatos obtidos: ${itemsText}.`;
            logChronicleEntry(store, chronMsg, 'loot_divided');
        }
        TOME.persistence.save().catch(console.warn);
        Toast.show('Riquezas e itens distribuídos com sucesso!', 'success');
        setShowLootModalId(null);
    };

    const handleAdjustRenown = (faction, delta) => {
        store.update(s => {
            if (!s.factionRenown) s.factionRenown = { Harpers: 0, Alliance: 0, Gauntlet: 0, Enclave: 0, Zhentarim: 0 };
            const keyMap = { 'Harpistas': 'Harpers', 'Aliança dos Lordes': 'Alliance', 'Ordem da Manopla': 'Gauntlet', 'Enclave Esmeralda': 'Enclave', 'Zhentarim': 'Zhentarim' };
            const fKey = keyMap[faction] || 'Harpers';
            const oldVal = s.factionRenown[fKey] || 0;
            const newVal = Math.max(0, oldVal + delta);
            s.factionRenown[fKey] = newVal;
            
            s.journalEntries.push({
                id: 'log-ren-man-' + Date.now(), session: s.sessionNumber || 1, timestamp: Date.now(),
                text: `🚩 RENOME DE FACÇÃO: Ajustado prestígio com os ${faction} (${oldVal} → ${newVal}).`, type: 'system'
            });
        });
        const keyMap = { 'Harpistas': 'Harpers', 'Aliança dos Lordes': 'Alliance', 'Ordem da Manopla': 'Gauntlet', 'Enclave Esmeralda': 'Enclave', 'Zhentarim': 'Zhentarim' };
        logChronicleEntry(store, `Reputação Alterada: A influência do grupo com os ${faction} foi reajustada para ${store.state.factionRenown[keyMap[faction] || 'Harpers']} pontos.`, 'renown_change');
        TOME.persistence.save().catch(console.warn);
    };

    const handleAddManualChronicle = (e) => {
        e.preventDefault();
        const text = e.target.text.value.trim();
        if (text) {
            logChronicleEntry(store, text, 'custom');
            TOME.persistence.save().catch(console.warn);
            e.target.reset();
            Toast.show('Acontecimento adicionado à linha do tempo!');
        }
    };

    const handleGenerateAIRumor = async () => {
        Toast.show('Consultando oráculo narrativo...');
        const context = quests.map(q => q.title).join(', ');
        const rumor = await TOME.ai.generateRumor(context);
        
        if (confirm(`🤖 O oráculo narrativo sugere este boato/rumor:\n\n"${rumor}"\n\nDeseja incorporá-lo como uma missão secundária?`)) {
            store.update(s => {
                s.quests = [...(s.quests || []), {
                    id: 'q-' + Date.now(),
                    title: 'Rumor: ' + (rumor.length > 30 ? rumor.substring(0, 30) + '...' : rumor),
                    description: rumor, type: 'side', difficulty: 'medium', levelRange: '1-4', faction: 'Nenhuma',
                    xpType: 'xp', xpReward: 150, reward: 'Informações ou favores locais',
                    milestones: [
                        { id: 'm-ai-1', text: 'Investigar a veracidade do boato com locais', completed: false },
                        { id: 'm-ai-2', text: 'Resolver a origem do rumor', completed: false }
                    ],
                    completed: false, failed: false, xpDistributed: false, status: 'active'
                }];
            });
            logChronicleEntry(store, `Boato Espalhado: Circula o rumor "${rumor}". A crônica adicionou esta busca à linha de investigações.`, 'custom');
            TOME.persistence.save().catch(console.warn);
            Toast.show('Missão adicionada à crônica!');
        }
    };

    // --- Sub-renders ---

    const renderFactionsTab = () => (
        <div className="grid grid-cols-1 gap-5 animate-cardFadeIn">
            <div className="card glass-accent p-5 rounded-xl bg-tomeGold/5 border-l-4 border-tomeGold">
                <h3 className="font-cinzel m-0 text-tomeGold font-black">🚩 Influência de Facções</h3>
                <p className="text-[0.8rem] text-gray-400 mt-1.5 leading-relaxed">Completar missões delegadas por grupos aumenta o Renome do grupo com eles, destravando favores e suportes táticos.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {FACTIONS.map(f => {
                    const keyMap = { 'Harpistas': 'Harpers', 'Aliança dos Lordes': 'Alliance', 'Ordem da Manopla': 'Gauntlet', 'Enclave Esmeralda': 'Enclave', 'Zhentarim': 'Zhentarim' };
                    const pts = renown[keyMap[f.id] || 'Harpers'] || 0;
                    const rank = getRenownRank(pts);
                    return (
                        <div key={f.id} className={`card glass-accent p-5 rounded-xl border-t-[4px] bg-black/25 flex flex-col justify-between min-h-[220px] ${f.border}`}>
                            <div>
                                <h4 className="font-cinzel text-[1.15rem] text-white m-0 mb-2 flex items-center gap-2">
                                    <span>{f.crest}</span> {f.name}
                                </h4>
                                <p className="text-[0.65rem] text-gray-500 italic m-0 mb-2.5">"{f.motto}"</p>
                                <p className="text-[0.75rem] text-gray-300 leading-relaxed m-0 mb-4">{f.desc}</p>
                            </div>
                            <div className="flex justify-between items-center bg-black/30 px-3.5 py-2.5 rounded-lg border border-white/5">
                                <div>
                                    <div className="text-[0.6rem] text-gray-500 uppercase tracking-wider font-bold">Cargo na Facção</div>
                                    <strong className={`text-[0.75rem] ${rank.color}`}>{rank.title}</strong>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <button className="btn btn-ghost px-2 py-0.5 text-[0.75rem] rounded-md border-white/15 bg-white/5 hover:bg-white/10" onClick={() => handleAdjustRenown(f.id, -1)}>-</button>
                                    <strong className="text-[1.2rem] font-cinzel text-tomeGold min-w-[25px] text-center font-black">{pts}</strong>
                                    <button className="btn btn-ghost px-2 py-0.5 text-[0.75rem] rounded-md border-white/15 bg-white/5 hover:bg-white/10" onClick={() => handleAdjustRenown(f.id, 1)}>+</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderChroniclesTab = () => (
        <div className="animate-cardFadeIn max-w-[800px] mx-auto">
            <div className="card glass-accent p-5 rounded-xl mb-7 bg-black/60 border border-white/10">
                <h4 className="font-cinzel text-tomeGold m-0 mb-3 font-bold"><i className="fa-solid fa-feather mr-2"></i> Escrever Nova Crônica de Feitos</h4>
                <form onSubmit={handleAddManualChronicle} className="flex gap-2.5">
                    <input type="text" name="text" placeholder="Ex: Dia 18 da Primavera: O grupo explorou as Minas Perdidas de Phandelver..." required className="flex-1 bg-black/40 border-1.5 border-tomeGold/25 rounded-lg px-4 py-2.5 text-white text-[0.8rem] outline-none font-outfit focus:border-tomeGold" />
                    <button type="submit" className="btn btn-primary font-cinzel font-black text-[0.75rem] inline-flex items-center gap-1.5 rounded-lg bg-tomeGold text-black px-4 hover:bg-yellow-500">
                        ✍️ Registrar Feito
                    </button>
                </form>
            </div>
            <h3 className="font-cinzel text-tomeGold text-center mb-8 drop-shadow-[0_0_10px_rgba(197,160,89,0.3)] font-black text-xl">
                📜 CRÔNICAS DA CAMPANHA
            </h3>
            <div className="relative pl-7 ml-2.5 border-l-2 border-tomeGold/20">
                {chronicles.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 italic text-[0.85rem]">
                        Nenhum feito crônico registrado na linha do tempo. Complete missões ou insira um feito acima!
                    </div>
                ) : chronicles.slice().reverse().map(c => {
                    const dateStr = new Date(c.timestamp).toLocaleString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                    let icon = '✍️', badgeColor = 'bg-white/5 border-white/5', textColor = 'text-white';
                    if (c.type === 'quest_completed') { icon = '🏆'; badgeColor = 'bg-green-500/10 border-green-500/20'; textColor = 'text-green-300'; }
                    else if (c.type === 'quest_failed') { icon = '💀'; badgeColor = 'bg-red-500/10 border-red-500/20'; textColor = 'text-red-300'; }
                    else if (c.type === 'level_up') { icon = '✨'; badgeColor = 'bg-yellow-400/10 border-yellow-400/20'; textColor = 'text-yellow-300'; }
                    else if (c.type === 'loot_divided') { icon = '💰'; badgeColor = 'bg-emerald-500/10 border-emerald-500/20'; textColor = 'text-emerald-300'; }
                    else if (c.type === 'renown_change') { icon = '🚩'; badgeColor = 'bg-purple-500/10 border-purple-500/20'; textColor = 'text-purple-300'; }

                    return (
                        <div key={c.id} className="relative mb-6 animate-cardFadeIn">
                            <div className="absolute -left-[39px] top-[2px] w-4 h-4 rounded-full bg-main border-[3.5px] border-tomeGold shadow-[0_0_8px_rgba(197,160,89,1)]"></div>
                            <div className={`card glass p-4 rounded-xl border ${badgeColor}`}>
                                <div className="flex justify-between items-center mb-1.5 text-[0.65rem] text-gray-400 font-black uppercase tracking-wider">
                                    <span>Sessão #{c.session || 1} • {icon} {c.type.toUpperCase().replace('_', ' ')}</span>
                                    <span>{dateStr}</span>
                                </div>
                                <p className={`m-0 text-[0.85rem] leading-relaxed font-outfit font-semibold ${textColor}`}>
                                    {c.text}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-[1100px] mx-auto p-5 animate-fadeIn">
            <div className="border-b border-tomeGold/25 pb-5 mb-6 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="font-cinzel text-tomeGold text-3xl font-black drop-shadow-[0_0_10px_rgba(197,160,89,0.4)] m-0">
                        <i className="fa-solid fa-scroll mr-2"></i> Crônicas & Missões
                    </h2>
                    <p className="text-gray-400 mt-1 m-0 text-sm">Acompanhe a história da campanha, divida espólios oficiais de D&D e organize reputação de facções.</p>
                </div>
                <div className="flex gap-2.5 items-center">
                    <button className="btn btn-ghost rounded-full border border-tomeGold/35 font-bold text-[0.75rem] inline-flex items-center gap-1.5 bg-tomeGold/5 hover:bg-tomeGold/15 px-4 py-2 text-tomeGold transition-colors" onClick={handleGenerateAIRumor}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i> Sugerir Missão (IA)
                    </button>
                    <button className="btn btn-primary rounded-full font-bold text-[0.75rem] inline-flex items-center gap-1.5 px-4 py-2 bg-tomeGold text-black hover:bg-yellow-500 transition-colors" onClick={() => setShowForm(!showForm)}>
                        <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'}`}></i> 
                        {showForm ? 'Cancelar' : 'Criar Missão'}
                    </button>
                </div>
            </div>

            <div className="glass p-4 rounded-xl mb-6 flex gap-4 items-center justify-between flex-wrap border border-tomeGold/15 bg-black/15">
                <div className="flex gap-1.5 flex-wrap">
                    {[
                        { id: 'active', label: '⚔️ Ativas', count: activeCount },
                        { id: 'completed', label: '🏆 Concluídas', count: completedCount },
                        { id: 'failed', label: '💀 Fracassadas', count: failedCount },
                        { id: 'factions', label: '🚩 Facções & Renome' },
                        { id: 'chronicles', label: '📜 Linha do Tempo' }
                    ].map(tab => (
                        <button key={tab.id} className={`px-4 py-2 font-cinzel font-bold text-[0.8rem] rounded-md transition-all duration-200 border-b-2 inline-flex items-center gap-2 ${activeTab === tab.id ? 'text-tomeGold border-tomeGold bg-white/5' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}`} onClick={() => setActiveTab(tab.id)}>
                            {tab.label}
                            {tab.count !== undefined && <span className="bg-white/10 px-1.5 py-0.5 rounded-lg text-[0.65rem] font-outfit">{tab.count}</span>}
                        </button>
                    ))}
                </div>

                {activeTab !== 'factions' && activeTab !== 'chronicles' && (
                    <div className="flex gap-2.5 items-center flex-1 max-w-[500px] justify-end w-full">
                        <select className="bg-black/80 border-1.5 border-tomeGold/25 px-3 py-1.5 rounded-lg text-white text-[0.75rem] outline-none cursor-pointer h-[36px]" value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="all">Todos os Tipos</option>
                            <option value="main">⚜️ Principal</option>
                            <option value="side">🗺️ Secundária</option>
                            <option value="personal">👤 Pessoal</option>
                            <option value="faction">🚩 Facção</option>
                        </select>
                        <div className="relative max-w-[250px] w-full">
                            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-tomeGold text-[0.8rem]"></i>
                            <input type="text" placeholder="Buscar missão..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1.5 rounded-lg border-1.5 border-tomeGold/25 bg-black/80 text-white text-[0.75rem] outline-none h-[36px] focus:border-tomeGold transition-colors" />
                        </div>
                    </div>
                )}
            </div>

            {showForm && <QuestForm onSubmit={handleCreateQuest} onCancel={() => setShowForm(false)} avgLevel={avgLevel} />}

            {activeTab === 'factions' ? renderFactionsTab() : 
             activeTab === 'chronicles' ? renderChroniclesTab() : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                     {filtered.length ? filtered.map(q => (
                         <QuestCard 
                             key={q.id} q={q} 
                             onToggleMilestone={handleToggleMilestone} onAddMilestone={handleAddMilestone} 
                             onDelete={handleDeleteQuest} onToggleComplete={handleToggleComplete} 
                             onMarkFailed={handleMarkFailed} onDistributeXP={handleDistributeXP} 
                             onTriggerLevelUp={handleTriggerLevelUp} onOpenLootModal={setShowLootModalId} 
                         />
                     )) : (
                         <div className="col-span-full p-16 text-center border-1.5 border-dashed border-tomeGold/20 rounded-xl bg-tomeGold/5 animate-cardFadeIn">
                             <i className="fa-solid fa-feather-pointed text-[2.5rem] opacity-30 text-tomeGold mb-4 block"></i>
                             <h3 className="font-cinzel text-white text-[1.15rem] m-0 mb-1.5 font-black">Crônica Sem Registros</h3>
                             <p className="text-[0.8rem] text-gray-400 max-w-[350px] mx-auto leading-relaxed">Clique em "Criar Missão" ou consulte a inteligência artificial para sugerir rumores e aventuras baseados nos acontecimentos do grupo.</p>
                         </div>
                     )}
                 </div>
             )}

            {showLootModalId && (
                <LootModal 
                    quest={quests.find(q => q.id === showLootModalId)} 
                    players={players} 
                    onClose={() => setShowLootModalId(null)} 
                    onConfirm={handleConfirmLoot} 
                />
            )}
        </div>
    );
}
