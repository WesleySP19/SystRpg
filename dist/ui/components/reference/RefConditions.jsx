import { h } from 'preact';
export function RefConditions() {
const conds = [
{ name: 'Caído (Prone)', icon: 'fa-person-falling', effect: 'Movimento apenas rastejando (dobro do custo). Jogadas de ataque contra a criatura têm Vantagem a 1.5m e Desvantagem para ataques à distância.' },
{ name: 'Cego (Blinded)', icon: 'fa-eye-slash', effect: 'Falha automática em testes que requerem visão. Jogadas de ataque contra o cego têm Vantagem, e os ataques dele têm Desvantagem.' },
{ name: 'Envenenado (Poisoned)', icon: 'fa-skull-crossbones', effect: 'A criatura sente náuseas intensas e tremores. Tem Desvantagem em todas as jogadas de ataque e testes de habilidade.' },
{ name: 'Enfeitiçado (Charmed)', icon: 'fa-heart', effect: 'Não pode atacar o conjurador do feitiço. O conjurador tem Vantagem em testes de interação social com a criatura.' },
{ name: 'Agarrado (Grappled)', icon: 'fa-hand-back-fist', effect: 'Deslocamento da criatura torna-se 0. O agarrador pode arrastá-la consigo pela metade do seu próprio deslocamento.' },
{ name: 'Incapacitado', icon: 'fa-ban', effect: 'A criatura perde o controle motor ou foco mental imediato. Não pode realizar nenhuma ação ou reação sob nenhuma hipótese.' },
{ name: 'Invisível', icon: 'fa-ghost', effect: 'Impossível de ser visto a olho nu (mas faz barulho e deixa pegadas). Ataques contra ela têm Desvantagem; ataques dela têm Vantagem.' },
{ name: 'Paralisado', icon: 'fa-bolt', effect: 'Incapacitada e incapaz de se mover ou falar. Falha em testes de FOR/DES. Qualquer ataque feito a 1.5m é um Golpe Crítico Automático.' },
{ name: 'Petrificado', icon: 'fa-gem', effect: 'Transformada em pedra sólida. Peso multiplicado por 10. Imune a venenos e doenças, e tem Resistência a todo tipo de dano físico.' },
{ name: 'Ensurdecido (Deafened)', icon: 'fa-ear-slash', effect: 'Falha automática em testes de audição. Não ouve comandos e está imune a efeitos mágicos baseados em som.' }
];
return (
<div className="animate-fadeIn">
<h3 className="font-cinzel text-red-500 mb-4 text-[1.8rem] drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">
<i className="fa-solid fa-skull-crossbones mr-2.5"></i> Condições de Status
</h3>
<p className="text-[0.9rem] text-slate-400 mb-8 leading-relaxed">
Efeitos mágicos, armadilhas ou ferimentos de combate que alteram temporariamente as capacidades físicas ou mentais dos heróis e monstros.
</p>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
{}
<div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-4 [scrollbar-width:thin]">
{conds.map((c, i) => (
<div key={i} className="glass card-hover ref-card-red p-4 rounded-xl border border-white/5 border-l-4 border-l-red-500 bg-black/30 relative overflow-hidden">
<div className="flex items-center gap-3 font-extrabold text-white text-[1.1rem] font-cinzel mb-2">
<div className="w-8 h-8 rounded-lg bg-red-500/15 text-red-500 flex items-center justify-center">
<i className={`fa-solid ${c.icon} text-base`}></i>
</div>
{c.name}
</div>
<p className="text-[0.8rem] leading-relaxed text-slate-400 m-0">{c.effect}</p>
</div>
))}
</div>
{}
<div className="sticky top-0">
<div className="hp-container glass bg-gradient-to-br from-red-500/5 to-black/60 border border-red-500/20 rounded-2xl p-8 flex flex-col justify-start shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
<span className="hp-label-float bg-[#08080a] text-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]">⚠️ REGRAS ESPECIAIS</span>
<h4 className="font-cinzel text-white mb-4 text-[1.3rem] border-b border-red-500/20 pb-3 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">Níveis de Exaustão</h4>
<p className="text-[0.85rem] text-slate-400 leading-relaxed mb-5">Fadiga extrema, frio congelante ou rituais necromânticos causam exaustão acumulativa. Um descanso longo remove 1 nível.</p>
<div className="flex flex-col gap-3">
<div className="text-[0.85rem] flex justify-between border-b border-white/5 pb-1.5"><strong>Nível 1:</strong> <span className="text-red-500">Desvantagem em testes de atributos</span></div>
<div className="text-[0.85rem] flex justify-between border-b border-white/5 pb-1.5"><strong>Nível 2:</strong> <span className="text-red-500">Deslocamento cortado pela metade</span></div>
<div className="text-[0.85rem] flex justify-between border-b border-white/5 pb-1.5"><strong>Nível 3:</strong> <span className="text-red-500">Desvantagem em ataques e salvaguardas</span></div>
<div className="text-[0.85rem] flex justify-between border-b border-white/5 pb-1.5"><strong>Nível 4:</strong> <span className="text-red-500">Máximo de PV reduzido pela metade</span></div>
<div className="text-[0.85rem] flex justify-between border-b border-white/5 pb-1.5"><strong>Nível 5:</strong> <span className="text-red-500">Deslocamento reduzido para 0</span></div>
<div className="text-[0.95rem] flex justify-between pt-1 font-black bg-red-500/10 p-2 rounded-md mt-1"><strong>Nível 6:</strong> <span className="text-red-500 drop-shadow-[0_0_10px_red]">Morte Instantânea 💀</span></div>
</div>
</div>
</div>
</div>
</div>
);
}