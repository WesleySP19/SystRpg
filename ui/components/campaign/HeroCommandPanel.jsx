import { h } from 'preact';

export function HeroCommandPanel({ 
    player, 
    onAdjustHP, 
    onAdjustXP, 
    onCustomXP, 
    onPrintSheet, 
    onPrintCard, 
    onRollAttribute, 
    onUpdateItems, 
    onUpdateNotes 
}) {
    if (!player) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 opacity-50">
                <i className="fa-solid fa-ghost text-6xl"></i>
                <div className="font-cinzel text-xl font-bold tracking-widest uppercase">Nenhum Herói Selecionado</div>
                <div className="text-xs uppercase tracking-widest font-bold">Selecione um membro do grupo na lateral</div>
            </div>
        );
    }

    const hpPct = player.hp?.max ? (player.hp.current / player.hp.max) * 100 : 0;
    
    // D&D 5e XP levels threshold mapping
    const levelsXP = [0, 0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
    const lvl = parseInt(player.level) || 1;
    const currentXP = parseInt(player.xp) || 0;
    const nextXP = levelsXP[lvl + 1] || levelsXP[20] || 300;
    const prevXP = levelsXP[lvl] || 0;
    const xpDiff = nextXP - prevXP;
    const progress = xpDiff > 0 ? Math.min(100, Math.max(0, ((currentXP - prevXP) / xpDiff) * 100)) : 100;

    let itemsVal = '';
    if (player.equipment?.items) {
        if (Array.isArray(player.equipment.items)) {
            itemsVal = player.equipment.items.map(i => `${i.qty}x ${i.name}`).join('\n');
        } else {
            itemsVal = String(player.equipment.items);
        }
    }

    const attrNames = { str: 'Força', dex: 'Destreza', con: 'Constituição', int: 'Inteligência', wis: 'Sabedoria', cha: 'Carisma' };
    const stats = player.stats || {str:10,dex:10,con:10,int:10,wis:10,cha:10};

    const handleInputShowStatus = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.style.opacity = '1';
            setTimeout(() => {
                if (el) el.style.opacity = '0';
            }, 1000);
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in font-sans pb-10">
            {/* TOP CARD HEADER WITH XP PROGRESS TRACKER */}
            <div className="card glass-accent p-8">
                <div className="flex gap-6 items-center flex-wrap">
                    <div className="w-[90px] h-[90px] rounded-full border-[3px] border-tomeGold font-cinzel text-3xl shadow-[0_0_15px_rgba(197,160,89,0.3)] bg-black/80 flex items-center justify-center text-tomeGold font-bold shrink-0"
                         style={player.img ? { background: `url(${player.img}) center/cover` } : {}}>
                        {player.img ? '' : player.name.substring(0,2)}
                    </div>
                    <div className="flex-1 min-w-[250px]">
                        <h1 className="m-0 text-4xl font-cinzel text-tomeGold drop-shadow-md tracking-wide">{player.name}</h1>
                        <p className="text-slate-300 text-[0.95rem] mt-1.5 font-semibold uppercase tracking-wide">
                            <i className="fa-solid fa-wand-magic-sparkles text-tomeGold mr-1.5"></i> 
                            {player.race} {player.class} • Nível {lvl}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-[0.65rem] text-tomeGold font-extrabold tracking-[1.5px] uppercase">Experiência Acumulada</div>
                        <div className="text-3xl font-black text-white font-cinzel drop-shadow-sm">{currentXP} <span className="text-base text-tomeGold">XP</span></div>
                    </div>
                </div>

                {/* PROGRESS BAR */}
                <div className="mt-6 bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
                    <div className="flex justify-between text-xs text-slate-300 mb-2 font-bold">
                        <span className="text-tomeGold">Nível {lvl}</span>
                        <span className="text-white">{currentXP} / {nextXP} XP ({Math.round(progress)}%)</span>
                        <span className="opacity-60">Nível {lvl + 1}</span>
                    </div>
                    <div className="h-2.5 bg-black/80 rounded border border-tomeGold/25 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-tomeGold to-yellow-400 shadow-[0_0_10px_rgba(197,160,89,0.5)] transition-all duration-500 ease-out" 
                             style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS SECTION */}
            <div className="grid grid-cols-3 gap-6">
                {/* HP CARD */}
                <div className="card glass rounded-2xl p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-slate-400 font-extrabold uppercase"><i className="fa-solid fa-heart text-dndRedBright mr-1.5"></i> Vida do Herói</span>
                        <span className="text-sm font-extrabold text-white">{player.hp?.current} / {player.hp?.max} HP</span>
                    </div>
                    <div className="h-2.5 mb-5 bg-black/40 rounded border border-white/5 overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${hpPct < 30 ? 'bg-dndRedBright' : 'bg-green-500'}`} 
                             style={{ width: `${Math.max(0, Math.min(100, hpPct))}%` }}></div>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                        <button className="btn btn-danger btn-sm rounded-md font-bold" onClick={() => onAdjustHP(-5)}>-5</button>
                        <button className="btn btn-ghost btn-sm rounded-md text-dndRedBright border-dndRedBright/15 font-bold hover:bg-dndRedBright hover:text-white" onClick={() => onAdjustHP(-1)}>-1</button>
                        <button className="btn btn-ghost btn-sm rounded-md text-green-500 border-green-500/15 font-bold hover:bg-green-500 hover:text-white" onClick={() => onAdjustHP(1)}>+1</button>
                        <button className="btn btn-primary btn-sm bg-green-500 border-green-500 font-bold rounded-md" onClick={() => onAdjustHP(5)}>+5</button>
                    </div>
                </div>

                {/* XP MANAGEMENT CARD */}
                <div className="card glass rounded-2xl p-5 flex flex-col justify-between">
                    <span className="text-xs font-extrabold text-blue-500 uppercase"><i className="fa-solid fa-star mr-1.5"></i> Canalizar Experiência</span>
                    <div className="grid grid-cols-2 gap-2 my-4">
                        <button className="btn btn-ghost btn-sm rounded-md font-bold font-cinzel hover:bg-blue-500/20 hover:text-blue-400 border border-transparent hover:border-blue-500/30" onClick={() => onAdjustXP(100)}>+100 XP</button>
                        <button className="btn btn-ghost btn-sm rounded-md font-bold font-cinzel hover:bg-blue-500/20 hover:text-blue-400 border border-transparent hover:border-blue-500/30" onClick={() => onAdjustXP(500)}>+500 XP</button>
                    </div>
                    <button className="btn btn-info btn-sm w-full rounded-lg font-extrabold py-2.5 text-sm" onClick={onCustomXP}>
                        <i className="fa-solid fa-circle-plus mr-1.5"></i> Adicionar XP Customizado
                    </button>
                </div>

                {/* PDF TOOLS CARD */}
                <div className="card glass rounded-2xl p-5 flex flex-col justify-between gap-2.5">
                    <span className="text-xs font-extrabold text-tomeGold uppercase"><i className="fa-solid fa-print mr-1.5"></i> Ferramentas Físicas</span>
                    <button className="btn btn-primary btn-sm w-full rounded-lg font-extrabold py-2.5 text-sm bg-tomeGold border-tomeGold shadow-[0_0_10px_rgba(197,160,89,0.25)] text-black" onClick={onPrintSheet}>
                        <i className="fa-solid fa-file-pdf mr-1.5"></i> Imprimir Ficha Oficial 5e
                    </button>
                    <button className="btn btn-ghost btn-sm w-full rounded-lg font-extrabold py-2.5 text-sm border-white/10 hover:bg-white/5" onClick={onPrintCard}>
                        <i className="fa-solid fa-id-card mr-1.5"></i> Imprimir Card Rápido
                    </button>
                </div>
            </div>

            {/* INTERACTIVE ATTRIBUTE GRID WITH CLICK-TO-ROLL */}
            <div className="card glass p-6 rounded-2xl border-transparent">
                <div className="text-sm text-tomeGold font-extrabold uppercase mb-4 font-cinzel tracking-wide">
                    <i className="fa-solid fa-dice-d20 mr-1.5"></i> Atributos do Personagem (Clique para Rolar d20)
                </div>
                <div className="grid grid-cols-6 gap-4">
                    {Object.entries(stats).map(([s, v]) => {
                        const mod = Math.floor((v - 10) / 2);
                        return (
                            <div key={s} 
                                 className="glass hover:scale-105 hover:border-tomeGold hover:shadow-[0_0_20px_rgba(197,160,89,0.3)] text-center p-4 rounded-xl border border-transparent cursor-pointer transition-all duration-300 ease-out group"
                                 onClick={() => onRollAttribute(s, v)}>
                                <div className="text-[0.7rem] text-tomeGold font-black tracking-wide uppercase mb-1.5 font-cinzel">{attrNames[s] || s}</div>
                                <div className="text-3xl font-black text-white leading-none font-cinzel">{v}</div>
                                <div className={`text-xs ${mod >= 0 ? 'text-green-500' : 'text-dndRedBright'} font-extrabold mt-2 bg-black/30 py-1 px-2 rounded-full inline-block`}>
                                    MOD {mod >= 0 ? '+' : ''}{mod}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* INVENTORY & NARRATIVE PARCHMENT TEXTAREAS */}
            <div className="grid grid-cols-2 gap-6">
                {/* ITEMS INVENTORY */}
                <div className="card glass rounded-2xl p-6 flex flex-col gap-3 border-transparent">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-tomeGold font-extrabold uppercase font-cinzel tracking-wide"><i className="fa-solid fa-backpack mr-1.5"></i> 🎒 Inventário de Itens</span>
                        <span id="items-save-status" className="text-[0.65rem] text-green-500 font-extrabold opacity-0 transition-opacity duration-300"><i className="fa-solid fa-circle-check mr-1"></i> Auto-salvo</span>
                    </div>
                    <p className="text-[0.65rem] text-slate-400 m-0">Digite os itens um por linha. Ex: <b className="text-tomeGold">2x Poção de Cura</b> ou <b className="text-tomeGold">Escudo de Aço</b>.</p>
                    <textarea 
                        className="form-textarea w-full font-mono text-sm leading-relaxed p-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-tomeGold/50 transition-colors" 
                        rows="6" 
                        placeholder="Digite um item por linha..." 
                        value={itemsVal}
                        onInput={(e) => {
                            onUpdateItems(e.target.value);
                            handleInputShowStatus('items-save-status');
                        }}
                    ></textarea>
                </div>

                {/* NARRATIVE NOTES */}
                <div className="card glass bg-black/50 rounded-2xl border border-white/5 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.5)] flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-tomeGold font-extrabold uppercase font-cinzel tracking-wide"><i className="fa-solid fa-pen-nib mr-1.5"></i> 📝 Características & Diário</span>
                        <span id="notes-save-status" className="text-[0.65rem] text-green-500 font-extrabold opacity-0 transition-opacity duration-300"><i className="fa-solid fa-circle-check mr-1"></i> Auto-salvo</span>
                    </div>
                    <p className="text-[0.65rem] text-slate-400 m-0">Registre traços de personalidade, antecedente, e notas de interpretação do herói.</p>
                    <textarea 
                        className="form-textarea w-full font-sans text-sm leading-relaxed p-4 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-tomeGold/50 transition-colors" 
                        rows="6" 
                        placeholder="Escreva traços ou anotações..." 
                        value={player.roleplay?.traits || ''}
                        onInput={(e) => {
                            onUpdateNotes(e.target.value);
                            handleInputShowStatus('notes-save-status');
                        }}
                    ></textarea>
                </div>
            </div>
        </div>
    );
}
