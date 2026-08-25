import { h, Fragment } from 'preact';
import { useState, useRef } from 'preact/hooks';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { Dice } from '../../utils/Dice.js';
import { CoreTables } from './CoreTables.jsx';
import { EncounterCalculator } from './EncounterCalculator.jsx';

export function DMShield({ store }) {
    const { resources, players, monsters, initiativeOrder, concentration } = store.state;
    const [selectedTable, setSelectedTable] = useState('dc');
    const [xpInput, setXpInput] = useState('0');

    // Initiative Row Render
    const renderInitiative = () => {
        if (!initiativeOrder?.length) {
            return (
                <div className="p-6 text-center text-gray-500 flex flex-col items-center gap-2 border border-dashed border-white/10 rounded-xl">
                    <i className="fa-solid fa-hourglass-empty opacity-20 text-2xl"></i>
                    <span className="text-xs">A fila de iniciativa está vazia.</span>
                </div>
            );
        }
        return initiativeOrder.map((c, i) => {
            const active = i === 0;
            const isPlayer = c.type === 'Player';
            return (
                <div key={c.id || i} className={`flex justify-between items-center px-4 py-2.5 rounded-xl transition-all duration-200 border ${active ? 'bg-tomeGold/10 border-tomeGold shadow-[0_0_10px_rgba(197,160,89,0.15)]' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-3">
                        <input 
                            type="number" 
                            value={c.roll} 
                            onChange={(e) => updateManualRoll(i, parseInt(e.target.value) || 0)} 
                            className="w-8 bg-black/40 border border-white/10 rounded-md text-tomeGold font-black text-center text-sm py-1 outline-none focus:border-tomeGold/50"
                        />
                        <div>
                            <div className={`font-black text-sm ${isPlayer ? 'text-blue-400' : 'text-red-400'}`}>{c.name}</div>
                            <div className="text-[0.6rem] text-gray-500 uppercase tracking-widest">{c.type}</div>
                        </div>
                    </div>
                    <div className="bg-black/30 px-2 py-1 rounded-md text-xs border border-white/5 font-bold">
                        HP <span className={c.hp_current <= c.hp_max * 0.3 ? 'text-red-500' : 'text-green-500'}>{c.hp_current}</span>/{c.hp_max}
                    </div>
                </div>
            );
        });
    };

    const updateManualRoll = (idx, val) => {
        store.update(s => {
            if (s.initiativeOrder && s.initiativeOrder[idx]) {
                s.initiativeOrder[idx].roll = val;
                s.initiativeOrder.sort((a, b) => b.roll - a.roll);
            }
        });
        Toast.show('Ordem de combate sincronizada!');
    };

    const rollInitiative = () => {
        const calcMod = (stat) => Math.floor(((stat || 10) - 10) / 2);
        if (!players?.length && !monsters?.length) { 
            Toast.show('Adicione heróis ou monstros.', 'info'); 
            return; 
        }

        const monsterList = (monsters || []).map(m => ({
            id: m.id,
            name: m.name, type: 'Criatura', hp_current: m.hp?.current || 10, hp_max: m.hp?.max || 10,
            roll: Dice.roll('1d20').total + calcMod(m.stats?.dex), originalData: m
        }));

        const playerList = (players || []).map(p => ({
            id: p.id || `p-${Date.now()}-${Math.random()}`,
            name: p.name, type: 'Player', hp_current: p.hp?.current || 10, hp_max: p.hp?.max || 10, roll: 0
        }));

        store.update(s => {
            s.initiativeOrder = [...monsterList, ...playerList].sort((a, b) => b.roll - a.roll);
            s.combatActive = true;
            s.combatRound = 1;
        });
        Toast.show('Novo combate iniciado!');
    };

    const autoCalcMonsterXP = () => {
        const crXP = {
            "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
            "1": 200, "2": 450, "3": 700, "4": 1100,
            "5": 1800, "6": 2300, "7": 2900, "8": 3900,
            "9": 5000, "10": 5900, "11": 7200, "12": 8400,
            "13": 10000, "14": 11500, "15": 13000, "16": 15000,
            "17": 18000, "18": 20000, "19": 22000, "20": 25000,
            "21": 33000, "22": 41000, "23": 50000, "24": 62000,
            "25": 75000, "26": 90000, "27": 105000, "28": 120000,
            "29": 135000, "30": 155000,
            "BOSS": 50000
        };
        
        let total = 0;
        (monsters || []).forEach(m => {
            let crStr = String(m.cr || '1').trim();
            crStr = crStr.replace('Nível ', '');
            total += (crXP[crStr] || 200);
        });

        setXpInput(total.toString());
        Toast.show(`XP somado de monstros invocados: +${total} XP!`, 'info');
    };

    const distributeXP = () => {
        const xpVal = parseInt(xpInput) || 0;
        if (xpVal <= 0) {
            Toast.show('Por favor, defina um montante positivo de XP para distribuir.', 'warning');
            return;
        }

        if (!players || players.length === 0) {
            Toast.show('Nenhum jogador cadastrado na campanha para receber XP!', 'warning');
            return;
        }

        const share = Math.floor(xpVal / players.length);
        if (share <= 0) {
            Toast.show('O XP total é muito baixo para dividir entre os jogadores.', 'warning');
            return;
        }

        const levelsXP = [0, 0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000];

        store.update(s => {
            s.players = (s.players || []).map(p => {
                const oldXP = parseInt(p.xp) || 0;
                const newXP = oldXP + share;
                
                let currentLevel = parseInt(p.level) || 1;
                let newLevel = currentLevel;
                
                for (let lvl = 2; lvl < levelsXP.length; lvl++) {
                    if (newXP >= levelsXP[lvl]) {
                        newLevel = lvl;
                    }
                }
                
                if (newLevel > currentLevel) {
                    setTimeout(() => {
                        Toast.show(`🎉 ${p.name} SUBIU DE NÍVEL! Agora é Nível ${newLevel}!`, 'success');
                    }, 100);
                }
                
                return { ...p, xp: newXP, level: newLevel };
            });
        });

        Toast.show(`Experiência distribuída! +${share} XP para cada um dos ${players.length} heróis!`, 'success');
        setXpInput('0');
    };

    const banishSummonedMonster = (id, name) => {
        if (!id) return;
        if (confirm(`Deseja mesmo banir e apagar permanentemente "${name}" da campanha? Isso removerá o monstro de todas as listas e do combate atual.`)) {
            store.update(s => {
                s.monsters = (s.monsters || []).filter(m => m.id !== id);
                s.initiativeOrder = (s.initiativeOrder || []).filter(c => c.id !== id && c.name !== name);
            });
            Toast.show(`${name} foi banido e limpo com sucesso!`, 'success');
        }
    };

    const renderConcentration = () => {
        if (!concentration?.length) {
            return (
                <div className="text-xs text-gray-500 text-center p-4 border border-dashed border-white/10 rounded-xl">
                    Nenhum herói concentrando magias.
                </div>
            );
        }
        return concentration.map((c, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 flex justify-between items-center shadow-inner hover:bg-white/10 transition-colors">
                <div>
                    <strong className="text-tomeGold text-sm">{c.name}</strong>
                    <div className="text-[0.65rem] text-gray-500 mt-0.5">✨ Magia: <span className="text-white font-bold">{c.spell}</span></div>
                </div>
                <button className="bg-red-500/15 border border-red-500/30 text-red-500 hover:bg-red-500/30 px-2.5 py-1.5 rounded-md text-xs transition-colors" onClick={() => removeConcentration(i)}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
        ));
    };

    const addConcentration = () => {
        const name = prompt('Nome do herói:');
        const spell = prompt('Nome da magia:');
        if (name && spell) {
            store.update(s => s.concentration = [...(s.concentration || []), { name, spell }]);
        }
    };

    const removeConcentration = (idx) => {
        store.update(s => s.concentration = s.concentration.filter((_, i) => i !== idx));
    };

    const generateFinalReport = () => {
        const time = new Date().toLocaleString();
        const report = `
            RELATÓRIO DE SESSÃO TOME PRO
            Data: ${time}
            Rodadas de Combate: ${store.state.combatRound || 0}
            Heróis: ${(players || []).map(p => p.name).join(', ')}
            --------------------------
            Aventura concluída com sucesso!
        `;
        alert(report);
        Toast.show('Relatório gerado!');
    };

    const incPotion = () => store.update(s => s.resources.potions++);
    const decPotion = () => store.update(s => { if (s.resources.potions > 0) s.resources.potions--; });
    const incScroll = () => store.update(s => s.resources.scrolls++);
    const decScroll = () => store.update(s => { if (s.resources.scrolls > 0) s.resources.scrolls--; });

    return (
        <div className="w-full max-w-[1300px] mx-auto p-5 animate-fadeIn">
            {/* HEADER */}
            <div className="border-b border-tomeGold/30 pb-5 mb-8">
                <div>
                    <h2 className="font-cinzel text-tomeGold text-3xl font-bold drop-shadow-[0_0_10px_rgba(197,160,89,0.5)] m-0">
                        <i className="fa-solid fa-shield-halved mr-3"></i> Escudo do Mestre Lendário
                    </h2>
                    <p className="text-gray-400 mt-2 m-0">Referências rápidas do Livro do Jogador (PHB) e analistas táticos em tempo real.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
                {/* LEFT COLUMN: TABLES & TOOLS */}
                <div className="flex flex-col gap-6">
                    
                    {/* CORE TABLES TABS */}
                    <div className="card glass-accent">
                        <div className="custom-scrollbar flex gap-2 mb-5 border-b border-white/5 pb-3 overflow-x-auto">
                            {[
                                { id: 'dc', icon: 'fa-chart-line', label: 'Graus de CD' },
                                { id: 'travel', icon: 'fa-boot', label: 'Ritmo de Viagem' },
                                { id: 'light', icon: 'fa-sun', label: 'Luz' },
                                { id: 'armor', icon: 'fa-shield', label: 'Armaduras' },
                                { id: 'prof', icon: 'fa-star', label: 'Proficiência' },
                                { id: 'conditions', icon: 'fa-skull-crossbones', label: 'Condições' }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    className={`btn btn-sm rounded-full px-4 py-1.5 whitespace-nowrap ${selectedTable === tab.id ? 'btn-primary bg-tomeGold text-black' : 'btn-ghost text-gray-300'}`}
                                    onClick={() => setSelectedTable(tab.id)}
                                >
                                    <i className={`fa-solid ${tab.icon} mr-2`}></i> {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                            <CoreTables selectedTable={selectedTable} />
                        </div>
                    </div>

                    {/* ENCOUNTER CALCULATOR */}
                    <div className="card glass-accent border-t-4 border-tomeGold">
                        <div className="font-cinzel text-tomeGold text-xl font-bold mb-4">
                            <i className="fa-solid fa-calculator mr-2"></i> Analisador de Margem de Encontro
                        </div>
                        <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                            <EncounterCalculator players={players} monsters={monsters} />
                        </div>
                        <div className="text-[0.7rem] text-gray-500 mt-2.5 opacity-70">
                            <i className="fa-solid fa-info-circle mr-1"></i> Cálculos oficiais baseados nos limiares de XP por Nível (DMG cap. 3).
                        </div>
                    </div>

                    {/* XP & SUMMONED MONSTERS PANEL */}
                    <div className="card glass-accent border-t-4 border-tomeGold flex flex-col gap-5">
                        <div className="font-cinzel text-tomeGold text-lg font-bold border-b border-white/5 pb-2.5 flex justify-between items-center">
                            <span><i className="fa-solid fa-award mr-2"></i> Painel de Ordem e Recompensas</span>
                            <span className="text-xs text-gray-500 font-sans font-normal">XP & Efeitos</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6">
                            {/* Left Section: XP Distributor */}
                            <div className="md:border-r border-white/5 md:pr-5">
                                <div className="font-bold text-sm text-tomeGold uppercase mb-3 font-cinzel">💰 Distribuidor de XP</div>
                                
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <small className="text-gray-500 block mb-1">Montante Total de XP:</small>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number" 
                                                value={xpInput}
                                                onChange={e => setXpInput(e.target.value)}
                                                min="0" 
                                                className="flex-1 text-center font-black text-lg bg-black/50 border border-tomeGold/30 rounded-md outline-none text-white focus:border-tomeGold" 
                                            />
                                            <button className="btn btn-ghost px-3 py-1.5 text-xs border border-tomeGold/40 text-tomeGold hover:bg-tomeGold/10" onClick={autoCalcMonsterXP} title="Auto-Somar XP dos monstros invocados">
                                                ⚡ AUTO-SOMAR
                                            </button>
                                        </div>
                                    </div>

                                    <button className="btn btn-primary w-full p-2.5 font-cinzel mt-1 bg-blue-600 hover:bg-blue-500 text-white border-none" onClick={distributeXP}>
                                        ✨ DISTRIBUIR ENTRE JOGADORES
                                    </button>
                                    
                                    <div className="text-[0.65rem] text-gray-500 leading-relaxed">
                                        * Divide o montante de XP igualmente entre todos os <strong>{players?.length || 0}</strong> jogadores ativos. O XP é injetado diretamente em suas fichas.
                                    </div>
                                </div>
                            </div>

                            {/* Right Section: Summoned Monsters Banish/Clean-up */}
                            <div>
                                <div className="font-bold text-sm text-red-500 uppercase mb-3 font-cinzel">🗑️ Ameaças Ativas</div>
                                
                                <div className="custom-scrollbar flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                                    {(monsters || []).map((m, idx) => (
                                        <div key={m.id || idx} className="px-3 py-2 flex justify-between items-center rounded-xl border border-white/5 bg-black/25">
                                            <div className="min-w-0 flex-1 pr-2">
                                                <div className="font-black text-xs truncate text-white">
                                                    {m.emoji || '🐾'} {m.name}
                                                </div>
                                                <div className="text-[0.65rem] opacity-60 mt-0.5 text-gray-300">
                                                    ND {m.cr || '1'} | HP: {m.hp?.current || 0}/{m.hp?.max || 0}
                                                </div>
                                            </div>
                                            <button className="bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/40 p-1.5 rounded-md text-xs transition-colors shrink-0" onClick={() => banishSummonedMonster(m.id, m.name)} title="Eliminar monstro do mapa e combate">
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                    ))}

                                    {!(monsters?.length) && (
                                        <div className="text-center p-6 opacity-30 text-xs border border-dashed border-white/10 rounded-xl">
                                            Nenhum monstro invocado atualmente.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RECENT EVENTS / LOG */}
                    <div className="card glass-accent">
                        <div className="font-cinzel text-tomeGold text-lg font-bold mb-4">
                            <i className="fa-solid fa-scroll mr-2"></i> Relatório de Crônicas Rápidas
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-tomeGold/5 border border-tomeGold/15 p-3 rounded-xl text-center">
                                <div className="text-[0.65rem] text-tomeGold uppercase tracking-widest">Combatentes em Fila</div>
                                <div className="text-3xl font-black text-white font-cinzel mt-1">{initiativeOrder?.length || 0}</div>
                            </div>
                            <div className="bg-blue-500/5 border border-blue-500/15 p-3 rounded-xl text-center">
                                <div className="text-[0.65rem] text-blue-400 uppercase tracking-widest">Heróis na Campanha</div>
                                <div className="text-3xl font-black text-white font-cinzel mt-1">{players?.length || 0}</div>
                            </div>
                        </div>
                        <button className="btn btn-ghost w-full rounded-xl p-3 bg-white/5 hover:bg-white/10 border border-white/10" onClick={generateFinalReport}>
                            <i className="fa-solid fa-file-invoice mr-2"></i> Compilar Resumo da Sessão
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: INITIATIVE & QUICK ACTIONS */}
                <div className="flex flex-col gap-6">
                    
                    {/* INITIATIVE TRACKER */}
                    <div className="card glass-accent border-t-4 border-tomeGold">
                        <div className="flex justify-between items-center mb-4">
                            <div className="font-cinzel text-tomeGold text-lg font-bold">
                                <i className="fa-solid fa-bolt mr-2"></i> Fila de Iniciativa
                            </div>
                            <button className="btn btn-primary btn-sm rounded-full px-3 py-1 text-xs" onClick={rollInitiative}>
                                <i className="fa-solid fa-play"></i> Iniciar
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {renderInitiative()}
                        </div>
                    </div>

                    {/* PARTY RESOURCES */}
                    <div className="card glass-accent">
                        <div className="font-cinzel text-tomeGold text-lg font-bold mb-4">
                            <i className="fa-solid fa-suitcase mr-2"></i> Consumíveis do Grupo
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                                <div className="text-xs text-gray-400 uppercase tracking-widest mb-2 text-center">🧪 Poções de Cura</div>
                                <div className="flex justify-between items-center bg-black/30 rounded-lg overflow-hidden">
                                    <button className="text-red-500 w-8 h-9 text-lg hover:bg-white/5 transition-colors" onClick={decPotion}>-</button>
                                    <span className="font-black text-lg text-white">{resources?.potions || 0}</span>
                                    <button className="text-green-500 w-8 h-9 text-lg hover:bg-white/5 transition-colors" onClick={incPotion}>+</button>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                                <div className="text-xs text-gray-400 uppercase tracking-widest mb-2 text-center">📜 Pergaminhos</div>
                                <div className="flex justify-between items-center bg-black/30 rounded-lg overflow-hidden">
                                    <button className="text-red-500 w-8 h-9 text-lg hover:bg-white/5 transition-colors" onClick={decScroll}>-</button>
                                    <span className="font-black text-lg text-white">{resources?.scrolls || 0}</span>
                                    <button className="text-green-500 w-8 h-9 text-lg hover:bg-white/5 transition-colors" onClick={incScroll}>+</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CONCENTRATION */}
                    <div className="card glass-accent">
                        <div className="font-cinzel text-tomeGold text-lg font-bold mb-4">
                            <i className="fa-solid fa-brain mr-2"></i> Foco & Concentração
                        </div>
                        <div className="flex flex-col gap-2 mb-4">
                            {renderConcentration()}
                        </div>
                        <button className="btn btn-ghost btn-sm w-full rounded-lg p-2 bg-white/5 hover:bg-white/10 border border-white/10" onClick={addConcentration}>
                            <i className="fa-solid fa-plus mr-2"></i> Registrar Concentrador
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
