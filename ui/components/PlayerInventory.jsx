export function renderBioInventoryTab(p, context) {
    const currency = p.currency || {};

    return (
        <div data-tab-content="bio" className="tab-content active animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-[340px_1fr_1fr] gap-6">
                
                {/* ── COLUNA 1: ROLEPLAY & MOEDAS ── */}
                <div className="flex flex-col gap-4">
                    {/* Traços, Ideais, Vínculos, Defeitos */}
                    <div className="skills-list p-4 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md">
                        <label className="sheet-section-title text-xs font-cinzel font-bold text-tomeGold tracking-wider block mb-1">TRAÇOS DE PERSONALIDADE</label>
                        <textarea className="legacy-textarea w-full text-xs bg-black/30 border border-slate-700/50 rounded-lg p-2 text-slate-200 focus:border-amber-400 focus:outline-none" name="traits" rows={3} defaultValue={p.roleplay?.traits || ''} placeholder="Seus hábitos, modos e maneirismos..."></textarea>
                    </div>

                    <div className="skills-list p-4 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md">
                        <label className="sheet-section-title text-xs font-cinzel font-bold text-tomeGold tracking-wider block mb-1">IDEAIS</label>
                        <textarea className="legacy-textarea w-full text-xs bg-black/30 border border-slate-700/50 rounded-lg p-2 text-slate-200 focus:border-amber-400 focus:outline-none" name="ideals" rows={2} defaultValue={p.roleplay?.ideals || ''} placeholder="O que move seu coração e princípios..."></textarea>
                    </div>

                    <div className="skills-list p-4 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md">
                        <label className="sheet-section-title text-xs font-cinzel font-bold text-tomeGold tracking-wider block mb-1">VÍNCULOS</label>
                        <textarea className="legacy-textarea w-full text-xs bg-black/30 border border-slate-700/50 rounded-lg p-2 text-slate-200 focus:border-amber-400 focus:outline-none" name="bonds" rows={2} defaultValue={p.roleplay?.bonds || ''} placeholder="Pessoas, locais ou heranças que você protege..."></textarea>
                    </div>

                    <div className="skills-list p-4 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md">
                        <label className="sheet-section-title text-xs font-cinzel font-bold text-tomeGold tracking-wider block mb-1">FRAQUEZAS & DEFEITOS</label>
                        <textarea className="legacy-textarea w-full text-xs bg-black/30 border border-slate-700/50 rounded-lg p-2 text-slate-200 focus:border-amber-400 focus:outline-none" name="flaws" rows={2} defaultValue={p.roleplay?.flaws || ''} placeholder="Vícios, medos ou fraquezas fatais..."></textarea>
                    </div>

                    {/* Moedas & Tesouro */}
                    <div className="skills-list p-4 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md flex flex-col gap-2">
                        <label className="sheet-section-title text-xs font-cinzel font-bold text-tomeGold tracking-wider block mb-1 border-b border-tomeGold/20 pb-1">
                            BOLSA DE MOEDAS
                        </label>
                        
                        <div className="grid grid-cols-[46px_1fr] gap-2 items-center">
                            <span className="font-black text-xs text-center py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm" title="Platina (1 PL = 10 PO)">PL</span>
                            <input name="coin_pp" type="number" className="legacy-input text-right font-bold text-sm bg-black/30 border border-slate-700/50 rounded p-1.5 text-white focus:border-cyan-400 focus:outline-none" defaultValue={currency.pp !== undefined ? currency.pp : 0} />
                        </div>

                        <div className="grid grid-cols-[46px_1fr] gap-2 items-center">
                            <span className="font-black text-xs text-center py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-sm" title="Peças de Ouro">PO</span>
                            <input name="coin_gp" type="number" className="legacy-input text-right font-bold text-sm bg-black/30 border border-slate-700/50 rounded p-1.5 text-white focus:border-amber-400 focus:outline-none" defaultValue={currency.gp !== undefined ? currency.gp : 0} />
                        </div>

                        <div className="grid grid-cols-[46px_1fr] gap-2 items-center">
                            <span className="font-black text-xs text-center py-1 rounded bg-slate-800/80 text-slate-300 border border-slate-500/40 shadow-sm" title="Electrum (1 PE = 0.5 PO)">PE</span>
                            <input name="coin_ep" type="number" className="legacy-input text-right font-bold text-sm bg-black/30 border border-slate-700/50 rounded p-1.5 text-white focus:border-slate-400 focus:outline-none" defaultValue={currency.ep !== undefined ? currency.ep : 0} />
                        </div>

                        <div className="grid grid-cols-[46px_1fr] gap-2 items-center">
                            <span className="font-black text-xs text-center py-1 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-500/40 shadow-sm" title="Peças de Prata">PP</span>
                            <input name="coin_sp" type="number" className="legacy-input text-right font-bold text-sm bg-black/30 border border-slate-700/50 rounded p-1.5 text-white focus:border-zinc-400 focus:outline-none" defaultValue={currency.sp !== undefined ? currency.sp : 0} />
                        </div>

                        <div className="grid grid-cols-[46px_1fr] gap-2 items-center">
                            <span className="font-black text-xs text-center py-1 rounded bg-orange-950/80 text-orange-300 border border-orange-500/40 shadow-sm" title="Peças de Cobre">PC</span>
                            <input name="coin_cp" type="number" className="legacy-input text-right font-bold text-sm bg-black/30 border border-slate-700/50 rounded p-1.5 text-white focus:border-orange-400 focus:outline-none" defaultValue={currency.cp !== undefined ? currency.cp : 0} />
                        </div>
                    </div>
                </div>

                {/* ── COLUNA 2: EQUIPAMENTO & INVENTÁRIO ── */}
                <div className="skills-list p-4 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-tomeGold/20 pb-1.5">
                        <label className="sheet-section-title text-xs font-cinzel font-bold text-tomeGold tracking-wider m-0">
                            EQUIPAMENTO & POSSES
                        </label>
                        <span className="text-[0.65rem] text-slate-400 uppercase">
                            Nome · Qtd · Peso
                        </span>
                    </div>

                    <div id="inventory-container" className="flex flex-col gap-1.5 min-h-[220px]">
                        {context._renderInventoryRows()}
                    </div>

                    <button 
                        type="button" 
                        className="btn btn-ghost btn-sm border border-tomeGold/40 text-tomeGold hover:bg-tomeGold/10 py-1.5 text-xs rounded transition-colors w-full" 
                        data-action="addInventoryRow"
                    >
                        <i className="fa-solid fa-plus mr-1"></i> ADICIONAR ITEM AO INVENTÁRIO
                    </button>

                    <div className="mt-2">
                        <label className="text-[0.65rem] font-bold text-slate-400 uppercase block mb-1">NOTAS DE CARGA & OUTRAS POSSES</label>
                        <textarea 
                            className="legacy-textarea w-full h-[140px] text-xs bg-black/30 border border-slate-700/50 rounded-lg p-2.5 text-slate-200 focus:border-amber-400 focus:outline-none" 
                            name="items_notes" 
                            placeholder="Mochila, saco de dormir, tochas, rações de viagem..." 
                            defaultValue={p.equipment?.notes || ''}
                        ></textarea>
                    </div>
                </div>

                {/* ── COLUNA 3: BIOGRAFIA & ALIADOS ── */}
                <div className="flex flex-col gap-4">
                    <div className="skills-list p-4 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md flex flex-col flex-1">
                        <label className="sheet-section-title text-xs font-cinzel font-bold text-tomeGold tracking-wider block mb-1 border-b border-tomeGold/20 pb-1">
                            HISTÓRIA DO PERSONAGEM (BIOGRAFIA)
                        </label>
                        <textarea 
                            className="legacy-textarea flex-1 min-h-[260px] text-xs bg-black/30 border border-slate-700/50 rounded-lg p-2.5 text-slate-200 focus:border-amber-400 focus:outline-none leading-relaxed" 
                            name="bio" 
                            placeholder="A jornada de vida do seu herói, suas origens, feitos e lendas..." 
                            defaultValue={p.bio || ''}
                        ></textarea>
                    </div>

                    <div className="skills-list p-4 bg-slate-900/80 border border-tomeGold/30 rounded-xl shadow-md flex flex-col">
                        <label className="sheet-section-title text-xs font-cinzel font-bold text-tomeGold tracking-wider block mb-1 border-b border-tomeGold/20 pb-1">
                            ALIADOS & ORGANIZAÇÕES
                        </label>
                        <textarea 
                            className="legacy-textarea h-[140px] text-xs bg-black/30 border border-slate-700/50 rounded-lg p-2.5 text-slate-200 focus:border-amber-400 focus:outline-none leading-relaxed" 
                            name="allies" 
                            placeholder="Guildas, patronos, facções ou companheiros de armas..." 
                            defaultValue={p.allies || ''}
                        ></textarea>
                    </div>
                </div>

            </div>
        </div>
    );
}
