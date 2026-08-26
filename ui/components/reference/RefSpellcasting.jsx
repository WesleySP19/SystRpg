import { h } from 'preact';

export function RefSpellcasting() {
    return (
        <div className="animate-fadeIn">
            <h3 className="font-cinzel text-yellow-500 mb-4 text-[1.8rem] drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <i className="fa-solid fa-hat-wizard mr-2.5"></i> Arte e Conjuração da Magia
            </h3>
            <p className="text-[0.9rem] text-slate-400 mb-8 leading-relaxed">
                As artes arcanas e divinas seguem regras estritas para canalizar o poder mágico nos planos materiais.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-9">
                <div className="flex flex-col gap-5">
                    <div className="glass p-6 rounded-xl bg-black/30 border-l-4 border-l-yellow-500">
                        <strong className="text-white font-cinzel text-[1.2rem] block mb-3"><i className="fa-solid fa-brain text-yellow-500 mr-2"></i> Concentração</strong>
                        <p className="text-[0.85rem] leading-relaxed text-slate-400 m-0">Algumas magias requerem foco ativo para persistir. Se você sofrer dano enquanto se concentra, deve fazer uma <strong className="text-white">Salvaguarda de Constituição (CON)</strong>. A CD é <strong className="text-tomeGold">10 ou metade do dano sofrido</strong> (o que for maior). Falhar significa que a magia se dissipa imediatamente.</p>
                    </div>
                    <div className="glass p-6 rounded-xl bg-black/30 border-l-4 border-l-yellow-500">
                        <strong className="text-white font-cinzel text-[1.2rem] block mb-3"><i className="fa-solid fa-flask text-yellow-500 mr-2"></i> Componentes de Magia</strong>
                        <ul className="text-[0.85rem] leading-[1.8] text-slate-400 m-0 pl-4">
                            <li><strong className="text-white">V (Verbal):</strong> Entoação de palavras mágicas místicas em voz clara e audível.</li>
                            <li className="mt-1.5"><strong className="text-white">S (Somático):</strong> Gestos intrincados (requer pelo menos uma mão livre).</li>
                            <li className="mt-1.5"><strong className="text-white">M (Material):</strong> Foco arcano, símbolo sagrado ou ingredientes físicos listados na magia.</li>
                        </ul>
                    </div>
                </div>

                <div className="hp-container glass bg-gradient-to-br from-yellow-500/5 to-black/60 border border-yellow-500/20 rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative">
                    <div className="absolute top-0 right-0 opacity-5 pointer-events-none text-[120px]">
                        <i className="fa-solid fa-hat-wizard"></i>
                    </div>
                    <span className="hp-label-float bg-[#08080a] text-yellow-500 border-yellow-500">CÁLCULOS ARCANOS</span>
                    <h4 className="font-cinzel text-white mb-5 text-[1.3rem] border-b border-yellow-500/20 pb-3">Modificadores do Conjurador</h4>
                    
                    <div className="flex flex-col gap-5 relative z-10">
                        <div>
                            <strong className="text-tomeGold text-[0.95rem] block mb-2">Jogada de Ataque de Magia:</strong>
                            <div className="bg-black/40 border border-yellow-500/30 p-3 rounded-lg font-mono text-[0.8rem] text-white text-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                                D20 + Bônus Proficiência + Mod. Conjurador
                            </div>
                        </div>
                        <div>
                            <strong className="text-tomeGold text-[0.95rem] block mb-2">Classe de Dificuldade (CD) da Magia:</strong>
                            <div className="bg-black/40 border border-yellow-500/30 p-3 rounded-lg font-mono text-[0.8rem] text-white text-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                                8 + Bônus Proficiência + Mod. Conjurador
                            </div>
                        </div>
                        <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20 text-[0.8rem] text-slate-400 leading-relaxed">
                            <strong className="text-yellow-500">Atributos por Classe:</strong><br />
                            • <span className="text-white">Inteligência:</span> Magos, Artífices<br />
                            • <span className="text-white">Sabedoria:</span> Clérigos, Druidas, Patrulheiros<br />
                            • <span className="text-white">Carisma:</span> Feiticeiros, Bruxos, Bardos, Paladinos
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
