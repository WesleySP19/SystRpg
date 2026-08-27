import { h } from 'preact';
export function RefEnvironment() {
return (
<div className="animate-fadeIn">
<h3 className="font-cinzel text-emerald-500 mb-4 text-[1.8rem] drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
<i className="fa-solid fa-mountain-sun mr-2.5"></i> Ambiente, Cobertura & Movimento
</h3>
<p className="text-[0.9rem] text-slate-400 mb-8 leading-relaxed">
O ambiente tático altera diretamente o acerto das flechas, a eficácia de magias e o deslocamento físico dos personagens. Use isso a seu favor.
</p>
<div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
{}
<div className="glass card-hover tome-hover-badge p-6 rounded-2xl border-t-4 border-t-yellow-500 bg-black/30">
<h4 className="font-cinzel text-yellow-500 mb-4 text-[1.2rem]"><i className="fa-solid fa-sun mr-2.5"></i> Iluminação</h4>
<ul className="text-[0.85rem] leading-[1.8] pl-4 text-slate-400 m-0">
<li><strong className="text-white">Luz Plena:</strong> Condição padrão de visibilidade sem penalidades.</li>
<li className="mt-2"><strong className="text-white">Penumbra:</strong> Luz tênue (tochas, lua). Causa <strong>Desvantagem</strong> em testes de Sabedoria (Percepção) baseados na visão.</li>
<li className="mt-2"><strong className="text-white">Escuridão Total:</strong> Bloqueia a visão comum. Personagens sem Visão no Escuro são considerados <strong className="text-red-500">Cegos</strong>.</li>
</ul>
</div>
{}
<div className="glass card-hover tome-hover-badge p-6 rounded-2xl border-t-4 border-t-emerald-500 bg-black/30">
<h4 className="font-cinzel text-emerald-500 mb-4 text-[1.2rem]"><i className="fa-solid fa-shield-halved mr-2.5"></i> Cobertura (CA)</h4>
<ul className="text-[0.85rem] leading-[1.8] pl-4 text-slate-400 m-0">
<li><strong className="text-white">Meia Cobertura (1/2):</strong> Concede um bônus de <strong className="text-emerald-500">+2 na CA</strong> e em salvaguardas de Destreza (ex: lutar atrás de um tronco).</li>
<li className="mt-2"><strong className="text-white">Três Quartos (3/4):</strong> Concede um bônus massivo de <strong className="text-emerald-500">+5 na CA</strong> e em salvaguardas de Destreza (ex: fresta de muralha).</li>
<li className="mt-2"><strong className="text-white">Total:</strong> O alvo não pode ser atacado diretamente.</li>
</ul>
</div>
{}
<div className="glass card-hover tome-hover-badge p-6 rounded-2xl border-t-4 border-t-sky-500 bg-black/30">
<h4 className="font-cinzel text-sky-500 mb-4 text-[1.2rem]"><i className="fa-solid fa-shoe-prints mr-2.5"></i> Movimentação</h4>
<ul className="text-[0.85rem] leading-[1.8] pl-4 text-slate-400 m-0">
<li><strong className="text-white">Terreno Difícil:</strong> Cada 1,5m de movimento custa 3m (dobro do custo). Lama, gelo, entulho, escadarias longas.</li>
<li className="mt-2"><strong className="text-white">Quedas:</strong> Sofre <strong className="text-red-500">1d6 de dano de Concussão</strong> para cada 3m de queda livre (máx: 20d6) e cai Caído (Prone).</li>
<li className="mt-2"><strong className="text-white">Levantar do Chão:</strong> Levantar-se da condição Caído consome <strong className="text-yellow-500">metade de todo o seu deslocamento</strong> no turno.</li>
</ul>
</div>
</div>
</div>
);
}