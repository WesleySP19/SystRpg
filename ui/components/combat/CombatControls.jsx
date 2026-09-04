import { useCombat } from '../../hooks/useCombat.js';

export function CombatControls() {
    const { 
        combatants, 
        currentCombatant,
        nextTurn, 
        clearCombat, 
        addMonster, 
        insertHeroes, 
        rollInitiatives,
        toggleAction
    } = useCombat();

    return (
        <div className="flex flex-col gap-5">
            {/* Turn Control */}
            <div className="card glass-accent p-6 rounded-2xl border-t-[3px] border-tomeGold bg-black/40 text-center">
                <div className="text-xs text-gray-400 uppercase font-black tracking-widest mb-4">Controle de Turno</div>
                
                <button className="btn btn-primary btn-block p-4 text-lg font-cinzel font-extrabold rounded-xl shadow-[0_0_20px_rgba(197,160,89,0.2)]" 
                        onClick={nextTurn}
                        disabled={!combatants || combatants.length === 0}>
                    Próximo Turno <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
            </div>

            {/* Action Economy HUD (Foundry v12 / D&D 2024 Mechanics) */}
            {currentCombatant && (
                <div className="card glass-accent p-4 rounded-2xl bg-black/40 border border-tomeGold/30 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[0.65rem] text-tomeGold uppercase font-black tracking-widest">
                            Economia de Ações
                        </span>
                        <span className="text-xs font-cinzel font-bold text-white truncate max-w-[140px]" title={currentCombatant.name}>
                            {currentCombatant.name}
                        </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                        {/* Ação */}
                        <button 
                            type="button"
                            onClick={() => toggleAction(currentCombatant.id, 'action')}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${
                                currentCombatant.actions?.action !== false 
                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                                    : 'bg-black/30 border-white/10 text-slate-500 opacity-40 line-through'
                            }`}
                            title="Ação Padrão (Atacar, Magia, Disparada...)">
                            <i className="fa-solid fa-hand-fist text-sm mb-1"></i>
                            <span className="text-[0.65rem]">Ação</span>
                        </button>

                        {/* Ação Bônus */}
                        <button 
                            type="button"
                            onClick={() => toggleAction(currentCombatant.id, 'bonus')}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${
                                currentCombatant.actions?.bonus !== false 
                                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                                    : 'bg-black/30 border-white/10 text-slate-500 opacity-40 line-through'
                            }`}
                            title="Ação Bônus (Magias rápidas, Habilidades...)">
                            <i className="fa-solid fa-bolt text-sm mb-1"></i>
                            <span className="text-[0.65rem]">Bônus</span>
                        </button>

                        {/* Reação */}
                        <button 
                            type="button"
                            onClick={() => toggleAction(currentCombatant.id, 'reaction')}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${
                                currentCombatant.actions?.reaction !== false 
                                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                                    : 'bg-black/30 border-white/10 text-slate-500 opacity-40 line-through'
                            }`}
                            title="Reação (Ataque de Oportunidade, Escudo...)">
                            <i className="fa-solid fa-shield-halved text-sm mb-1"></i>
                            <span className="text-[0.65rem]">Reação</span>
                        </button>

                        {/* Movimento */}
                        <button 
                            type="button"
                            onClick={() => toggleAction(currentCombatant.id, 'movement')}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all ${
                                (currentCombatant.actions?.movement ?? 30) > 0 
                                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                                    : 'bg-black/30 border-white/10 text-slate-500 opacity-40 line-through'
                            }`}
                            title="Movimento (Deslocamento no mapa)">
                            <i className="fa-solid fa-shoe-prints text-sm mb-1"></i>
                            <span className="text-[0.65rem]">{(currentCombatant.actions?.movement ?? 30) > 0 ? `${currentCombatant.actions?.movement ?? 30}ft` : '0ft'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="card glass-accent p-5 rounded-2xl bg-black/20 border border-white/5 flex flex-col gap-2.5">
                <button onClick={addMonster} className="btn btn-ghost btn-block rounded-lg border border-white/10 flex justify-between items-center">
                    <span><i className="fa-solid fa-plus text-green-500 mr-2"></i> Adicionar Monstro</span>
                </button>
                <button onClick={insertHeroes} className="btn btn-ghost btn-block rounded-lg border border-white/10 flex justify-between items-center">
                    <span><i className="fa-solid fa-user-plus text-blue-500 mr-2"></i> Inserir Heróis</span>
                </button>
                <button onClick={rollInitiatives} className="btn btn-ghost btn-block rounded-lg border border-white/10 flex justify-between items-center">
                    <span><i className="fa-solid fa-dice-d20 text-tomeGold mr-2"></i> Rolar Iniciativas</span>
                </button>
            </div>

            {/* Danger Zone */}
            <div className="card glass-accent p-5 rounded-2xl bg-dndRed-bright/5 border border-dndRed-bright/20 flex flex-col gap-2.5">
                <div className="text-[0.65rem] text-dndRed-bright uppercase font-black tracking-wider mb-1.5 text-center">Zona de Perigo</div>
                <button className="btn btn-ghost btn-block rounded-lg border border-dndRed-bright/30 text-dndRed-bright" onClick={clearCombat}>
                    <i className="fa-solid fa-skull mr-2"></i> Encerrar Combate
                </button>
            </div>
        </div>
    );
}
