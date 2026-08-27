import { h } from 'preact';
export function RefActions() {
const acts = [
{ name: 'Atacar (Attack)', cost: 'Ação', desc: 'Realiza um ataque corpo-a-corpo ou à distância com armas ou magias.' },
{ name: 'Conjurar Magia', cost: 'Varie', desc: 'Conjura uma magia cujo tempo de conjuração seja 1 ação (ou ação bônus se permitido).' },
{ name: 'Correr (Dash)', cost: 'Ação', desc: 'Ganha deslocamento extra igual ao seu deslocamento máximo na rodada atual.' },
{ name: 'Desengajar', cost: 'Ação', desc: 'Seu movimento não provoca nenhum ataque de oportunidade até o final da rodada.' },
{ name: 'Esquivar (Dodge)', cost: 'Ação', desc: 'Até o início do seu próximo turno, ataques contra você têm Desvantagem e seus testes de Destreza têm Vantagem.' },
{ name: 'Ajudar (Help)', cost: 'Ação', desc: 'Concede Vantagem ao teste de habilidade de um aliado ou na primeira jogada de ataque dele contra um monstro.' },
{ name: 'Esconder (Hide)', cost: 'Ação', desc: 'Faz um teste de Destreza (Furtividade) para sumir do campo de visão de inimigos (requer cobertura).' },
{ name: 'Preparar (Ready)', cost: 'Ação', desc: 'Escolhe um gatilho. Se o gatilho acontecer antes do seu próximo turno, você usa sua Reação para agir.' },
{ name: 'Usar Objeto', cost: 'Ação', desc: 'Interage com um segundo objeto complexo na mesma rodada (beber poção, abrir baú chaveado, etc).' }
];
return (
<div className="animate-fadeIn">
<h3 className="font-cinzel text-sky-500 mb-4 text-[1.8rem] drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">
<i className="fa-solid fa-swords mr-2.5"></i> Ações no Turno de Combate
</h3>
<p className="text-[0.9rem] text-slate-400 mb-8 leading-relaxed">
Em um combate de D&D, seu turno tático é composto por <strong>Movimento</strong>, <strong>1 Ação</strong>, <strong>1 Reação</strong> (fora do turno) e <strong>1 Ação Bônus</strong> (se aplicável).
</p>
<div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 max-h-[60vh] overflow-y-auto pr-4 [scrollbar-width:thin]">
{acts.map((a, i) => (
<div key={i} className="card glass-accent ref-card-blue bg-black/40 p-5 border border-sky-500/15 border-l-4 border-l-sky-500 rounded-xl relative overflow-hidden">
<div className="flex justify-between items-center mb-3">
<strong className="text-white text-[1.1rem] font-cinzel font-bold">{a.name}</strong>
<span className="badge text-[0.65rem] px-2 py-1 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 font-extrabold tracking-wider">{a.cost}</span>
</div>
<p className="text-[0.85rem] leading-[1.5] text-slate-400 m-0">{a.desc}</p>
</div>
))}
</div>
</div>
);
}