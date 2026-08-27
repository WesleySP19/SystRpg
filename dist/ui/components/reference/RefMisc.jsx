import { h } from 'preact';
export function RefDC() {
const dcs = [
{ val: 5, level: 'Muito Fácil', example: 'Arrombar uma porta de madeira velha e podre.' },
{ val: 10, level: 'Fácil', example: 'Ouvir uma conversa abafada atrás de uma porta comum.' },
{ val: 15, level: 'Médio', example: 'Escalar uma parede de pedra molhada com poucos apoios.' },
{ val: 20, level: 'Difícil', example: 'Decifrar um manuscrito antigo em dialeto morto.' },
{ val: 25, level: 'Muito Difícil', example: 'Saltar um desfiladeiro ventoso de 6 metros.' },
{ val: 30, level: 'Quase Impossível', example: 'Rastrear um assassino na lama sob tempestade torrencial.' }
];
return (
<div className="animate-fadeIn">
<h3 className="font-cinzel text-tomeGold mb-4 text-[1.8rem] drop-shadow-[0_0_15px_rgba(197,160,89,0.4)]">
<i className="fa-solid fa-bullseye mr-2.5"></i> Escala de Classes de Dificuldade (CD)
</h3>
<p className="text-[0.9rem] text-slate-400 mb-8 leading-relaxed">
A Classe de Dificuldade (DC) determina o quão heróico ou excepcional deve ser o esforço de um personagem para realizar um teste de atributo e ter sucesso na história.
</p>
<div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-5 max-h-[60vh] overflow-y-auto pr-4 [scrollbar-width:thin]">
{dcs.map((d, i) => (
<div key={i} className="glass card-hover ref-card-gold flex items-center gap-6 p-5 bg-black/30 border border-tomeGold/10 rounded-xl relative">
<div className="w-[60px] h-[60px] rounded-xl bg-gradient-to-br from-tomeGold/20 to-amber-500/10 text-tomeGold border border-tomeGold/40 flex items-center justify-center font-black font-cinzel text-2xl shadow-[0_0_15px_rgba(197,160,89,0.1)] shrink-0">
{d.val}
</div>
<div className="flex-1">
<div className="font-extrabold text-[1.1rem] text-white font-cinzel tracking-wide mb-1">{d.level}</div>
<div className="text-[0.85rem] text-slate-400 leading-relaxed"><em>Ex: {d.example}</em></div>
</div>
</div>
))}
</div>
</div>
);
}
export function RefAbbreviations() {
const terms = [
{ s: 'CA / AC', m: 'Classe de Armadura. O valor numérico que um ataque inimigo deve igualar ou superar para desferir um golpe físico com sucesso.' },
{ s: 'CD / DC', m: 'Classe de Dificuldade. A meta numérica a ser atingida em testes de perícia ou testes de resistência.' },
{ s: 'PV / HP', m: 'Pontos de Vida. Representação abstrata da vitalidade e da integridade física de uma criatura.' },
{ s: 'TR / ST', m: 'Teste de Resistência (Saving Throw). Teste reativo feito para evitar ou reduzir os efeitos nocivos de magias ou perigos.' },
{ s: 'Vantagem', m: 'Role dois dados d20 no teste e utilize o maior resultado obtido para somar seus modificadores.' },
{ s: 'Desvantagem', m: 'Role dois dados d20 no teste e utilize o menor resultado obtido para somar seus modificadores.' },
{ s: 'Surpresa', m: 'Inimigos pegos de surpresa não se movem, não executam ações na 1ª rodada e não podem usar reações.' },
{ s: 'Ataque de Oportunidade', m: 'Uso de uma Reação para desferir um ataque físico em um oponente que sai do seu alcance de combate corpo-a-corpo.' },
{ s: 'Ação Bônus', m: 'Uma ação extra menor concedida por magias, talentos especiais ou características de classe específicas.' },
{ s: 'ND / CR', m: 'Nível de Desafio. Métrica indicadora do poder relativo de monstros para equilibrar encontros de combate tático.' }
];
return (
<div className="animate-fadeIn">
<h3 className="font-cinzel text-white mb-4 text-[1.8rem] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
<i className="fa-solid fa-language mr-2.5"></i> Dicionário de Termos e Siglas
</h3>
<p className="text-[0.9rem] text-slate-400 mb-8 leading-relaxed">
Lista de siglas, definições rápidas e convenções mais comuns usadas pelas regras oficiais de D&D 5e e presentes nas fichas.
</p>
<div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 max-h-[60vh] overflow-y-auto pr-4 [scrollbar-width:thin]">
{terms.map((t, i) => (
<div key={i} className="glass card-hover ref-card-gold p-5 rounded-xl bg-black/30 border border-white/5 relative">
<strong className="text-tomeGold font-cinzel text-[1.1rem] block mb-2 drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]">{t.s}</strong>
<p className="text-[0.85rem] text-slate-400 leading-relaxed m-0">{t.m}</p>
</div>
))}
</div>
</div>
);
}
export function RefQuickRef() {
return (
<div className="flex flex-col gap-4 h-full">
<div className="flex justify-between items-center border-b border-tomeGold/30 pb-3 mb-2.5">
<h3 className="font-cinzel text-tomeGold m-0 text-2xl">
<i className="fa-solid fa-compass mr-2.5"></i> Guia Rápido Interativo D&D 5e (PT-BR)
</h3>
<a href="https://diogoan.github.io/dnd5e-quickref/" target="_blank" className="btn btn-ghost btn-sm text-[0.7rem] border border-tomeGold/30 text-tomeGold no-underline inline-flex items-center gap-1.5">
<i className="fa-solid fa-up-right-from-square"></i> Abrir em Nova Aba
</a>
</div>
<p className="text-[0.85rem] text-slate-400 m-0 leading-relaxed">
Clique nas abas e nos cartões abaixo para ver as descrições mecânicas completas em <strong>Português</strong> de ações, reações, movimentação e condições oficiais de D&D 5e.
</p>
<div className="flex-1 border border-white/10 rounded-xl overflow-hidden bg-white relative min-h-[650px]">
<iframe src="https://diogoan.github.io/dnd5e-quickref/" className="w-full h-[650px] border-none" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
</div>
</div>
);
}