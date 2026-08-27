import { h } from 'preact';
export function RefResting() {
return (
<div className="animate-fadeIn">
<h3 className="font-cinzel text-yellow-400 mb-4 text-[1.8rem] drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">
<i className="fa-solid fa-campground mr-2.5"></i> Descansos, Cura & Sobrevivência
</h3>
<p className="text-[0.9rem] text-slate-400 mb-8 leading-relaxed">
As jornadas épicas exigem que os heróis parem para recuperar forças, tratar ferimentos letais e recarregar seu poder arcano.
</p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
{}
<div className="glass p-8 rounded-2xl border-l-4 border-l-tomeGold bg-black/40 relative overflow-hidden">
<i className="fa-solid fa-mug-hot absolute -bottom-5 -right-5 text-[100px] text-tomeGold/5 pointer-events-none"></i>
<h4 className="font-cinzel text-tomeGold mb-4 text-[1.3rem]"><i className="fa-solid fa-hourglass-half mr-2"></i> Descanso Curto (1 Hora)</h4>
<p className="text-[0.85rem] leading-relaxed text-slate-400 mb-5">Uma pausa que não exige mais do que comer, beber, ler ou cuidar de ferimentos de forma rústica.</p>
<div className="bg-tomeGold/5 border border-tomeGold/20 p-5 rounded-xl">
<strong className="text-white text-[1rem] block mb-2.5 font-cinzel">Gasto de Dados de Vida (Hit Dice)</strong>
<p className="text-[0.85rem] text-slate-400 leading-relaxed m-0">Um herói pode gastar um ou mais dos seus Dados de Vida no final do descanso. Para cada dado gasto, jogue-o e adicione o <strong>Modificador de Constituição</strong>. O total é recuperado em Pontos de Vida (HP).</p>
</div>
</div>
{}
<div className="glass p-8 rounded-2xl border-l-4 border-l-emerald-500 bg-black/40 relative overflow-hidden">
<i className="fa-solid fa-bed absolute -bottom-5 -right-5 text-[100px] text-emerald-500/5 pointer-events-none"></i>
<h4 className="font-cinzel text-emerald-500 mb-4 text-[1.3rem]"><i className="fa-solid fa-moon mr-2"></i> Descanso Longo (8 Horas)</h4>
<p className="text-[0.85rem] leading-relaxed text-slate-400 mb-5">Equivale a uma noite de sono segura. O herói não pode ter se envolvido em combate ou esforço por mais de 1 hora no total.</p>
<ul className="text-[0.85rem] leading-[2.0] text-slate-400 pl-4 m-0">
<li><strong className="text-white">Cura Completa:</strong> Restaura 100% dos Pontos de Vida perdidos.</li>
<li><strong className="text-white">Espaços de Magia:</strong> Todos os slots de magia consumidos são recarregados.</li>
<li><strong className="text-white">Dados de Vida:</strong> Recupera <strong>metade</strong> do total máximo de Dados de Vida (arredondado para baixo, mínimo 1).</li>
<li><strong className="text-white">Fadiga:</strong> Reduz exatamente <strong>1 nível</strong> a exaustão física da criatura.</li>
</ul>
</div>
</div>
</div>
);
}