import { h } from 'preact';
import { useStore } from '../../core/hooks.js';
import { TOME } from '../../../core/Registry.js';

export function CampaignWidgets({ monsterCount }) {
    const quests = useStore('quests') || [];
    const journalEntries = useStore('journalEntries') || [];
    const monsters = useStore('monsters') || [];
    const customMonsters = useStore('customMonsters') || [];
    const allMonsters = [...monsters, ...customMonsters];

    const navigate = (tab) => TOME.store.update(s => s.activeTab = tab);

    return (
        <div className="flex flex-col gap-6">
            {/* QUESTS WIDGET */}
            <div className="card glass p-0 rounded-2xl border border-accent/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                <h3 className="font-cinzel text-accent text-[0.85rem] m-0 flex justify-between items-center border-b border-accent/30 bg-gradient-to-r from-accent/20 to-transparent p-4 backdrop-blur-md font-bold tracking-widest drop-shadow-md">
                    <span><i className="fa-solid fa-scroll mr-2"></i> Missões & Objetivos</span>
                    <button className="btn btn-ghost btn-sm text-[0.6rem] py-0.5 px-2 rounded hover:bg-accent/20 text-accent" onClick={() => navigate('quest')}>
                        <i className="fa-solid fa-arrow-up-right-from-square"></i> Abrir
                    </button>
                </h3>
                <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto p-4 bg-black/40 [scrollbar-width:thin]">
                    {quests.length === 0 ? (
                        <div className="text-xs text-slate-500 italic text-center py-4">Nenhuma missão ativa no momento.</div>
                    ) : (
                        quests.slice(0, 5).map(q => (
                            <div key={q.id} className="flex justify-between items-center bg-black/40 border border-white/5 p-2.5 rounded-lg text-xs">
                                <span className="font-semibold text-slate-200">{q.title || q.name || 'Missão'}</span>
                                <span className={`badge text-[0.6rem] px-2 py-0.5 rounded ${q.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                    {q.status === 'completed' ? 'Concluída' : 'Em Andamento'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {/* NARRATIVE / DIARY WIDGET */}
            <div className="card glass p-0 rounded-2xl border border-accent/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                <h3 className="font-cinzel text-accent text-[0.85rem] m-0 flex justify-between items-center border-b border-accent/30 bg-gradient-to-r from-accent/20 to-transparent p-4 backdrop-blur-md font-bold tracking-widest drop-shadow-md">
                    <span><i className="fa-solid fa-book-journal-whills mr-2"></i> Diário Narrativo</span>
                    <button className="btn btn-ghost btn-sm text-[0.6rem] py-0.5 px-2 rounded hover:bg-accent/20 text-accent" onClick={() => navigate('journal')}>
                        <i className="fa-solid fa-feather"></i> Diário
                    </button>
                </h3>
                <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto p-4 bg-black/40 [scrollbar-width:thin]">
                    {journalEntries.length === 0 ? (
                        <div className="text-xs text-slate-500 italic text-center py-4">Nenhuma anotação de sessão registrada.</div>
                    ) : (
                        journalEntries.slice(-4).reverse().map((entry, idx) => (
                            <div key={idx} className="bg-black/40 border-l-2 border-l-accent border border-white/5 p-2 rounded text-xs">
                                <div className="text-[0.65rem] text-accent font-bold uppercase">{entry.title || 'Registro'}</div>
                                <div className="text-slate-300 line-clamp-1 mt-0.5">{entry.content}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* COMBAT & BESTIARY WIDGET */}
            <div className="card glass p-0 rounded-2xl border border-accent/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden">
                <h3 className="font-cinzel text-accent text-[0.85rem] m-0 flex justify-between items-center border-b border-accent/30 bg-gradient-to-r from-accent/20 to-transparent p-4 backdrop-blur-md font-bold tracking-widest drop-shadow-md">
                    <span><i className="fa-solid fa-dragon mr-2"></i> Bestiário Rápido</span>
                    <span className="text-[0.65rem] text-slate-300 font-mono tracking-wider bg-black/50 px-2 py-1 rounded-md border border-accent/20">
                        {allMonsters.length} criatura(s)
                    </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[180px] overflow-y-auto p-4 bg-black/40 [scrollbar-width:thin]">
                    {allMonsters.length === 0 ? (
                        <div className="text-xs text-slate-500 italic text-center py-4 col-span-2">Nenhuma criatura catalogada no momento.</div>
                    ) : (
                        allMonsters.slice(0, 6).map((m, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-black/40 border border-white/5 p-2 rounded-lg text-xs">
                                <span className="text-base">{m.emoji || '🐾'}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="text-slate-200 font-bold truncate">{m.name}</div>
                                    <div className="text-[0.65rem] text-slate-400">CA {m.ac || 10} • PV {m.hp || 10}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
