import { useState, useRef } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/core/Toast.jsx';
import { MonsterData } from '../../data/MonsterData.js';

/**
 * BESTIARY & MONSTER FORM v7.0 — "Functional Grimoire" Edition
 * Redesigned to Preact Hooks and JSX.
 */
export function MonsterForm() {
    const storeState = useStore();
    const [view, setView] = useState('library');
    const [selectedCR, setSelectedCR] = useState('Nível 1');
    const [showImporter, setShowImporter] = useState(false);
    
    const importTextRef = useRef(null);

    const parseActionsFromNotes = (notes) => {
        const actions = [];
        const lines = notes.split('\n');
        lines.forEach(l => {
            const m = l.match(/^(.*?):\s*([+-]\d+)\s*to hit.*?\((.*?)\)/i);
            if (m) actions.push({ name: m[1].trim(), bonus: parseInt(m[2]) || 0, damage: m[3] });
        });
        return actions.length ? actions : [{ name: 'Ataque Genérico', bonus: 0, damage: '1d6' }];
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const notes = fd.get('notes') || '';
        const rules = window.TOME?.RulesEngine?.getActiveRuleset() || null;
        const dynamicStats = {};
        
        if (rules) {
            rules.stats.forEach(st => dynamicStats[st.id] = parseInt(fd.get(`stat_${st.id}`)) || 10);
        } else {
            ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(st => dynamicStats[st] = parseInt(fd.get(`stat_${st}`)) || 10);
        }

        const monster = {
            id: 'm-' + Date.now(),
            name: fd.get('name') || 'Nova Ameaça',
            type: 'Monster',
            cr: fd.get('cr') || '1',
            ac: parseInt(fd.get('ac')) || 10,
            hp: { current: parseInt(fd.get('hp_max')) || 10, max: parseInt(fd.get('hp_max')) || 10 },
            stats: dynamicStats,
            notes: notes,
            actions: parseActionsFromNotes(notes)
        };

        TOME.store.update(s => {
            s.monsters = [...(s.monsters || []), monster];
        });
        Toast.show(`✅ ${monster.name} registrado no Bestiário!`, 'success');
        setView('library');
    };

    const addToCampaign = (name, cr) => {
        const monster = MonsterData[cr].find(m => m.name === name);
        if (monster) {
            TOME.store.update(s => {
                const newMonster = {
                    ...monster,
                    id: 'm-' + Date.now(),
                    type: 'Monster',
                    cr: cr.replace('Nível ', ''),
                    hp: { current: monster.hp, max: monster.hp },
                    stats: monster.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 }
                };
                s.monsters = [...(s.monsters || []), newMonster];
            });
            Toast.show(`${name} adicionado à arena!`, 'success');
        }
    };

    const processMonsterImport = () => {
        const text = importTextRef.current?.value;
        if (!text) return;

        Toast.show('🔮 Decifrando grimório arcano...');

        const getInt = (reg) => { const m = text.match(reg); return m ? parseInt(m[1]) : null; };

        const name = text.split('\n')[0].trim();
        const type = text.match(/(?:Size|Tamanho)\s+\w+,\s+([^,]+)/i)?.[1] || 'Criatura';
        const ac = getInt(/(?:Armor Class|CA|AC)\s*(\d+)/i) || 10;
        const hp = getInt(/(?:Hit Points|HP|PV)\s*(\d+)/i) || 20;
        const cr = text.match(/(?:Challenge|CR|ND)\s*([\d\/]+)/i)?.[1] || '1';

        const stats = {
            str: getInt(/(?:STR|FOR)\s*(\d+)/i) || 10,
            dex: getInt(/(?:DEX|DES)\s*(\d+)/i) || 10,
            con: getInt(/(?:CON)\s*(\d+)/i) || 10,
            int: getInt(/(?:INT)\s*(\d+)/i) || 10,
            wis: getInt(/(?:WIS|SAB)\s*(\d+)/i) || 10,
            cha: getInt(/(?:CHA|CAR)\s*(\d+)/i) || 10
        };

        const actionMatch = text.match(/(?:Actions|Ações)[\s\S]+/i);
        const notes = actionMatch ? actionMatch[0] : text;

        TOME.store.update(s => {
            s.monsters = [...(s.monsters || []), {
                id: 'm-' + Date.now(),
                name: name,
                type: 'Monster',
                cr: cr,
                ac: ac,
                hp: { current: hp, max: hp },
                stats: stats,
                notes: notes,
                actions: parseActionsFromNotes(notes)
            }];
        });

        Toast.show(`✅ ${name} foi adicionado ao seu bestiário!`, 'success');
        setShowImporter(false);
        setView('library');
    };

    const renderLibrary = () => {
        const crGroups = Object.keys(MonsterData);
        const list = MonsterData[selectedCR] || [];

        return (
            <div class="flex flex-col gap-6">
                <div class="flex gap-3 overflow-x-auto pb-4 border-b border-accent/20 scrollbar-thin scrollbar-thumb-accent/30">
                    {crGroups.map(cr => (
                        <button 
                            key={cr}
                            class={`whitespace-nowrap px-4 py-2 rounded-lg font-cinzel text-xs tracking-widest uppercase font-bold border transition-all ${selectedCR === cr ? 'bg-accent/20 border-accent text-accent shadow-[0_0_10px_rgba(197,160,89,0.3)]' : 'bg-transparent border-white/10 text-slate-400 hover:border-accent/50 hover:text-slate-200'} ${cr === 'BOSS' ? '!border-red-500/50 !text-red-400 hover:!bg-red-900/30' : ''}`}
                            onClick={() => setSelectedCR(cr)}
                        >
                            {cr}
                        </button>
                    ))}
                </div>

                <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accent/30">
                    {list.map((m, idx) => (
                        <div key={m.name + idx} class="card glass-accent flex flex-col p-0 overflow-hidden border border-white/5 hover:border-accent/50 hover:-translate-y-1 transition-all hover:shadow-[0_10px_20px_rgba(0,0,0,0.8),_0_0_15px_rgba(197,160,89,0.2)]">
                            <div class="h-[120px] bg-black/60 flex items-center justify-center text-6xl border-b border-accent/20 relative">
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <span class="relative z-10 drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">{m.emoji || '🐾'}</span>
                            </div>
                            <div class="p-5 flex flex-col flex-1 bg-black/40">
                                <h4 class="font-cinzel text-lg text-white m-0 truncate" title={m.name}>{m.name}</h4>
                                <div class="text-[0.65rem] text-accent uppercase font-extrabold tracking-widest mt-1 mb-3">
                                    {m.type} • CA {m.ac} • HP {m.hp}
                                </div>
                                <p class="text-xs text-slate-400 m-0 leading-relaxed line-clamp-3 flex-1">{m.notes || 'Nenhuma descrição adicional disponível no bestiário.'}</p>
                                
                                <button class="btn btn-primary btn-sm w-full mt-4 font-bold rounded-lg shadow-[0_0_10px_rgba(197,160,89,0.2)]" 
                                        onClick={() => addToCampaign(m.name, selectedCR)}>
                                    <i class="fa-solid fa-plus"></i> ADICIONAR À ARENA
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderCreator = () => {
        const rules = window.TOME?.RulesEngine?.getActiveRuleset() || null;
        const stats = rules ? rules.stats : [
            { id: 'str', label: 'FOR' },
            { id: 'dex', label: 'DES' },
            { id: 'con', label: 'CON' },
            { id: 'int', label: 'INT' },
            { id: 'wis', label: 'SAB' },
            { id: 'cha', label: 'CAR' }
        ];

        return (
            <div class="card glass-accent max-w-3xl mx-auto p-8 border border-accent/30 rounded-2xl bg-black/60 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
                <div class="absolute -right-20 -top-20 w-64 h-64 bg-red-900/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <form id="monster-form" class="flex flex-col gap-6 relative z-10" onSubmit={handleFormSubmit}>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="md:col-span-2">
                            <label class="text-[0.65rem] text-accent font-extrabold uppercase tracking-widest mb-1.5 block">NOME DA CRIATURA</label>
                            <input class="w-full bg-black/60 text-white border border-accent/30 rounded-lg p-3 text-lg outline-none focus:border-accent transition-colors" type="text" name="name" required placeholder="Ex: Dragão de Ossos" />
                        </div>
                        <div>
                            <label class="text-[0.65rem] text-accent font-extrabold uppercase tracking-widest mb-1.5 block">NÍVEL / CR</label>
                            <input class="w-full bg-black/60 text-white border border-accent/30 rounded-lg p-3 text-lg outline-none focus:border-accent transition-colors" type="text" name="cr" placeholder="Nível 5" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label class="text-[0.65rem] text-slate-400 font-extrabold uppercase tracking-widest mb-1.5 block">TIPO</label>
                            <input class="w-full bg-black/60 text-white border border-white/10 rounded-lg p-2.5 outline-none focus:border-accent transition-colors" type="text" name="type" placeholder="Morto-Vivo" />
                        </div>
                        <div>
                            <label class="text-[0.65rem] text-slate-400 font-extrabold uppercase tracking-widest mb-1.5 block">CLASSE DE ARMADURA</label>
                            <input class="w-full bg-black/60 text-white border border-white/10 rounded-lg p-2.5 outline-none focus:border-accent transition-colors" type="number" name="ac" value="10" />
                        </div>
                        <div>
                            <label class="text-[0.65rem] text-red-400 font-extrabold uppercase tracking-widest mb-1.5 block">PONTOS DE VIDA</label>
                            <input class="w-full bg-black/60 text-white border border-red-500/30 rounded-lg p-2.5 outline-none focus:border-red-500 transition-colors" type="number" name="hp_max" value="30" />
                        </div>
                    </div>

                    <div class="bg-white/5 border border-white/10 rounded-xl p-4">
                        <label class="text-[0.65rem] text-accent font-extrabold uppercase tracking-widest mb-3 block text-center border-b border-accent/20 pb-2">ATRIBUTOS BASE</label>
                        <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {stats.map(st => (
                                <div key={st.id} class="flex flex-col items-center">
                                    <label class="text-xs font-bold text-slate-300 mb-1">{st.short || st.label}</label>
                                    <input class="w-14 text-center bg-black/60 text-white border border-accent/40 rounded p-1 outline-none focus:border-accent" type="number" name={`stat_${st.id}`} value="10" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label class="text-[0.65rem] text-accent font-extrabold uppercase tracking-widest mb-1.5 block">HABILIDADES E ATAQUES</label>
                        <textarea class="w-full bg-black/60 text-slate-300 border border-accent/20 rounded-xl p-4 min-h-[120px] outline-none focus:border-accent scrollbar-thin scrollbar-thumb-accent/30" name="notes" placeholder="Descreva os ataques e habilidades especiais..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary p-4 font-cinzel text-lg tracking-[2px] shadow-[0_0_20px_rgba(197,160,89,0.3)] mt-2">
                        <i class="fa-solid fa-dragon mr-2"></i> REGISTRAR AMEAÇA NO BESTIÁRIO
                    </button>
                </form>
            </div>
        );
    };

    return (
        <div class="page max-w-[1400px] mx-auto animate-fadeIn">
            <div class="flex justify-between items-center bg-black/30 border border-white/5 rounded-2xl p-6 mb-8 shadow-xl">
                <div>
                    <h2 class="font-cinzel text-[1.8rem] text-white m-0 tracking-wider flex items-center gap-3">
                        <i class="fa-solid fa-book-skull text-accent drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]"></i> Bestiário Arcano
                    </h2>
                    <p class="font-outfit text-[0.9rem] text-slate-400 mt-1 m-0">Compêndio oficial de criaturas e ameaças</p>
                </div>
                <div class="flex gap-3 bg-black/40 p-1.5 rounded-xl border border-white/5">
                    <button class={`btn ${view === 'library' ? 'btn-primary shadow-[0_0_15px_rgba(197,160,89,0.3)]' : 'btn-ghost'} px-4 py-2 rounded-lg font-bold text-sm transition-all`} onClick={() => setView('library')}>BIBLIOTECA</button>
                    <button class={`btn ${view === 'creator' ? 'btn-primary shadow-[0_0_15px_rgba(197,160,89,0.3)]' : 'btn-ghost'} px-4 py-2 rounded-lg font-bold text-sm transition-all`} onClick={() => setView('creator')}>CRIAR AMEAÇA</button>
                    <button class="btn bg-blue-900/40 text-blue-300 border border-blue-500/30 hover:bg-blue-800/60 hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-all" onClick={() => setShowImporter(true)}>
                        <i class="fa-solid fa-file-import mr-1"></i> IMPORTAR PRO
                    </button>
                </div>
            </div>

            {view === 'library' ? renderLibrary() : renderCreator()}
            
            {showImporter && (
                <div class="fixed inset-0 bg-black/85 z-[99999] flex items-center justify-center backdrop-blur-md p-4">
                    <div class="card glass-accent w-full max-w-3xl p-8 border border-accent/30 rounded-2xl bg-black/95 shadow-[0_0_40px_rgba(197,160,89,0.15)] relative">
                        <div class="absolute -left-10 -top-10 w-40 h-40 bg-accent/20 rounded-full blur-[80px] pointer-events-none"></div>
                        
                        <h3 class="font-cinzel text-accent text-xl flex items-center gap-2 mb-2 relative z-10"><i class="fa-solid fa-crystal-ball"></i> Importador Arcano de Monstros</h3>
                        <p class="text-xs text-slate-400 mb-6 uppercase tracking-widest relative z-10">Cole o bloco de texto do monstro (SRD, PDF ou Web) abaixo.</p>
                        
                        <textarea ref={importTextRef} class="w-full h-[350px] mb-6 bg-black/60 text-slate-300 border border-accent/20 rounded-xl p-4 font-mono text-sm outline-none focus:border-accent focus:shadow-[inset_0_0_15px_rgba(197,160,89,0.1)] relative z-10 scrollbar-thin scrollbar-thumb-accent/30" placeholder="Ex: Owlbear / Large monstrosity, unaligned / Armor Class 13 / Hit Points 59..."></textarea>
                        
                        <div class="flex gap-4 relative z-10">
                            <button class="btn btn-ghost flex-1 py-3 text-sm font-bold rounded-xl" onClick={() => setShowImporter(false)}>Cancelar</button>
                            <button class="btn btn-primary flex-1 py-3 text-sm font-bold font-cinzel tracking-wider rounded-xl shadow-[0_0_15px_rgba(197,160,89,0.3)]" onClick={processMonsterImport}>
                                Processar & Criar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
