import { useStore } from '../core/hooks.js';
import { Toast } from '../components/core/Toast.jsx';

export function HeroHub() {
    const storeState = useStore();
    const players = storeState?.players || [];

    const newHero = () => {
        if (window.TOME?.store) {
            window.TOME.store.update(s => s.activeTab = 'builder');
        }
    };

    const editHero = (id) => {
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                s.editingHeroId = id;
                s.activeTab = 'builder';
            });
        }
    };

    const viewSheet = (id) => {
        if (window.TOME?.store) {
            window.TOME.store.update(s => {
                s.viewingHeroId = id;
                s.activeTab = 'herosheet';
            });
        }
    };

    const deleteHero = (id) => {
        if (confirm('Tem certeza que deseja apagar esta lenda dos registros?')) {
            if (window.TOME?.store) {
                window.TOME.store.update(s => {
                    s.players = s.players.filter(p => p.id !== id);
                });
            }
            Toast.show('Herói apagado dos registros.', 'warning');
        }
    };

    return (
        <div class="page max-w-[1400px] animate-fadeIn">
            <div class="flex justify-between items-center bg-black/30 border border-white/5 rounded-2xl p-6 mb-8 shadow-xl">
                <div>
                    <h2 class="font-cinzel text-[1.8rem] text-white m-0 tracking-wider flex items-center gap-3">
                        <i class="fa-solid fa-users text-accent drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]"></i> Monitor de Heróis
                    </h2>
                    <p class="font-outfit text-[0.9rem] text-slate-400 mt-1 m-0">Galeria de Lendas e Gerenciamento de Personagens</p>
                </div>
                <button class="btn btn-magic shadow-[0_0_20px_rgba(197,160,89,0.2)]" onClick={newHero}>
                    <i class="fa-solid fa-plus"></i> Forjar Novo Herói
                </button>
            </div>

            <div class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
                {players && players.length > 0 ? players.map(p => (
                    <div key={p.id} class="card glass-accent flex flex-col p-0 overflow-hidden transform hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.9),_0_0_20px_rgba(197,160,89,0.15)] group">
                        {/* Header / Portrait area */}
                        <div class="h-[140px] relative bg-cover bg-center border-b border-accent/20" style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(10,12,16,0.95) 100%), url('${p.portraitData || 'assets/parchment.png'}')` }}>
                            <div class="absolute bottom-3 left-4 right-4">
                                <h3 class="m-0 font-cinzel text-[1.5rem] text-white drop-shadow-[0_2px_5px_rgba(0,0,0,1)]">{p.name}</h3>
                                <div class="text-[0.75rem] text-accent font-extrabold uppercase tracking-wider">{p.race} {p.class} • NV {p.level || 1}</div>
                            </div>
                        </div>
                        
                        {/* Quick Stats */}
                        <div class="grid grid-cols-3 p-4 border-b border-white/5 text-center bg-black/20">
                            <div class="flex flex-col">
                                <span class="text-[0.6rem] text-slate-400 font-bold uppercase tracking-wider">HP Atual</span>
                                <span class="font-extrabold text-[1.1rem] text-green-500">{p.hp?.current}/{p.hp?.max}</span>
                            </div>
                            <div class="flex flex-col border-x border-white/5">
                                <span class="text-[0.6rem] text-slate-400 font-bold uppercase tracking-wider">CA</span>
                                <span class="font-extrabold text-[1.1rem] text-white">{p.ac || 10}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[0.6rem] text-slate-400 font-bold uppercase tracking-wider">Iniciativa</span>
                                <span class="font-extrabold text-[1.1rem] text-blue-400">{(p.initiative >= 0 ? '+' : '')}{p.initiative || 0}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div class="flex p-4 gap-3 bg-black/40">
                            <button class="btn btn-primary flex-1 text-[0.75rem] px-2 py-2 rounded-lg" onClick={() => viewSheet(p.id)}>
                                <i class="fa-solid fa-scroll"></i> Ficha 5e
                            </button>
                            <button class="btn btn-ghost text-[0.75rem] w-10 h-10 rounded-lg p-0 flex items-center justify-center opacity-70 hover:opacity-100" onClick={() => editHero(p.id)} title="Editar (Forja)">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="btn btn-danger text-[0.75rem] w-10 h-10 rounded-lg p-0 flex items-center justify-center opacity-70 hover:opacity-100 border-red-500/20" onClick={() => deleteHero(p.id)} title="Excluir">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div class="col-span-full h-[40vh] flex flex-col items-center justify-center text-center bg-white/5 border border-white/10 rounded-2xl p-10">
                        <i class="fa-solid fa-ghost fa-3x opacity-20 mb-5 text-slate-500"></i>
                        <p class="font-cinzel text-lg text-slate-400">Nenhuma lenda registrada. O salão dos heróis está vazio.</p>
                        <button class="btn btn-ghost mt-4 font-bold border-white/20" onClick={newHero}>Criar o Primeiro Herói</button>
                    </div>
                )}
            </div>
        </div>
    );
}
