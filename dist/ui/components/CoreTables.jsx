import { h } from 'preact';
export function CoreTables({ selectedTable }) {
if (selectedTable === 'dc') {
return (
<table className="w-full text-left text-sm border-collapse">
<thead>
<tr className="border-b border-white/10 text-gray-400">
<th className="py-2">Grau de Dificuldade</th>
<th className="py-2 text-right">Classe de Dificuldade (CD)</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5">
<tr><td className="py-2">Muito Fácil</td><td className="py-2 text-right font-black text-tomeGold">05</td></tr>
<tr><td className="py-2">Fácil</td><td className="py-2 text-right font-black text-tomeGold">10</td></tr>
<tr><td className="py-2">Médio</td><td className="py-2 text-right font-black text-tomeGold">15</td></tr>
<tr><td className="py-2">Difícil</td><td className="py-2 text-right font-black text-tomeGold">20</td></tr>
<tr><td className="py-2">Muito Difícil</td><td className="py-2 text-right font-black text-tomeGold">25</td></tr>
<tr><td className="py-2">Quase Impossível</td><td className="py-2 text-right font-black text-tomeGold">30</td></tr>
</tbody>
</table>
);
}
if (selectedTable === 'travel') {
return (
<table className="w-full text-left text-sm border-collapse">
<thead>
<tr className="border-b border-white/10 text-gray-400">
<th className="py-2 text-blue-400">Ritmo de Marcha</th>
<th className="py-2">Distância/Dia</th>
<th className="py-2 text-right">Efeito em Jogo</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5">
<tr><td className="py-2 font-black text-blue-400">Rápido</td><td className="py-2">45 km (30 milhas)</td><td className="py-2 text-right text-red-400">-5 Percepção Passiva</td></tr>
<tr><td className="py-2 font-black text-blue-400">Normal</td><td className="py-2">36 km (24 milhas)</td><td className="py-2 text-right text-gray-500">Nenhum</td></tr>
<tr><td className="py-2 font-black text-blue-400">Lento</td><td className="py-2">27 km (18 milhas)</td><td className="py-2 text-right text-green-400">Permite Furtividade</td></tr>
</tbody>
</table>
);
}
if (selectedTable === 'light') {
return (
<table className="w-full text-left text-sm border-collapse">
<thead>
<tr className="border-b border-white/10 text-gray-400">
<th className="py-2 text-yellow-500">Fonte de Ignição</th>
<th className="py-2">Luminosidade Plena</th>
<th className="py-2 text-right">Luz Ofuscada</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5">
<tr><td className="py-2 font-black text-yellow-500">Tocha</td><td className="py-2">Raio de 6m (20ft)</td><td className="py-2 text-right text-gray-500">Mais 6m adicionais</td></tr>
<tr><td className="py-2 font-black text-yellow-500">Lanterna Furta-Fogo</td><td className="py-2">Cone de 18m (60ft)</td><td className="py-2 text-right text-gray-500">Cone de +18m</td></tr>
<tr><td className="py-2 font-black text-yellow-500">Vela</td><td className="py-2">Raio de 1,5m (5ft)</td><td className="py-2 text-right text-gray-500">Mais 1,5m adicionais</td></tr>
</tbody>
</table>
);
}
if (selectedTable === 'armor') {
return (
<table className="w-full text-left text-xs border-collapse">
<thead>
<tr className="border-b border-white/10 text-gray-400">
<th className="py-2">Armadura</th>
<th className="py-2">Classe de Armadura (CA)</th>
<th className="py-2 text-right">Furtividade</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5">
{}
<tr className="bg-white/5"><td colSpan="3" className="py-1 font-black text-white text-center font-cinzel">Armaduras Leves</td></tr>
<tr><td className="py-1">Acolchoada</td><td className="py-1">11 + mod. Des</td><td className="py-1 text-right text-red-400">Desvantagem</td></tr>
<tr><td className="py-1">Couro</td><td className="py-1">11 + mod. Des</td><td className="py-1 text-right">—</td></tr>
<tr><td className="py-1">Couro Batido</td><td className="py-1">12 + mod. Des</td><td className="py-1 text-right">—</td></tr>
{}
<tr className="bg-white/5"><td colSpan="3" className="py-1 font-black text-white text-center font-cinzel">Armaduras Médias</td></tr>
<tr><td className="py-1">Camisão de Malha</td><td className="py-1">13 + mod. Des (máx +2)</td><td className="py-1 text-right">—</td></tr>
<tr><td className="py-1">Peitoral</td><td className="py-1">14 + mod. Des (máx +2)</td><td className="py-1 text-right">—</td></tr>
<tr><td className="py-1">Meia Armadura</td><td className="py-1">15 + mod. Des (máx +2)</td><td className="py-1 text-right text-red-400">Desvantagem</td></tr>
{}
<tr className="bg-white/5"><td colSpan="3" className="py-1 font-black text-white text-center font-cinzel">Armaduras Pesadas</td></tr>
<tr><td className="py-1">Cota de Malha</td><td className="py-1">16 (Req: For 13)</td><td className="py-1 text-right text-red-400">Desvantagem</td></tr>
<tr><td className="py-1">Placas</td><td className="py-1">18 (Req: For 15)</td><td className="py-1 text-right text-red-400">Desvantagem</td></tr>
{}
<tr className="bg-white/5"><td colSpan="3" className="py-1 font-black text-white text-center font-cinzel">Escudos</td></tr>
<tr><td className="py-1">Escudo comum</td><td className="py-1">+2 de Bônus na CA</td><td className="py-1 text-right">—</td></tr>
</tbody>
</table>
);
}
if (selectedTable === 'prof') {
return (
<div className="flex gap-4">
<table className="flex-1 text-center text-sm border-collapse">
<thead>
<tr className="border-b border-white/10">
<th className="py-2 text-green-400">Níveis (1 a 10)</th>
<th className="py-2 text-green-400">Bônus</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5">
<tr><td className="py-2">Nível 1 a 4</td><td className="py-2 font-black text-green-400">+2</td></tr>
<tr><td className="py-2">Nível 5 a 8</td><td className="py-2 font-black text-green-400">+3</td></tr>
<tr><td className="py-2">Nível 9 a 10</td><td className="py-2 font-black text-green-400">+4</td></tr>
</tbody>
</table>
<table className="flex-1 text-center text-sm border-collapse">
<thead>
<tr className="border-b border-white/10">
<th className="py-2 text-green-400">Níveis (11 a 20)</th>
<th className="py-2 text-green-400">Bônus</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5">
<tr><td className="py-2">Nível 11 a 12</td><td className="py-2 font-black text-green-400">+4</td></tr>
<tr><td className="py-2">Nível 13 a 16</td><td className="py-2 font-black text-green-400">+5</td></tr>
<tr><td className="py-2">Nível 17 a 20</td><td className="py-2 font-black text-green-400">+6</td></tr>
</tbody>
</table>
</div>
);
}
if (selectedTable === 'conditions') {
return (
<div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
<table className="w-full text-left text-xs border-collapse">
<thead>
<tr className="border-b border-white/10">
<th className="py-2 text-red-400 w-[35%]">Condição</th>
<th className="py-2 text-red-400">Efeitos Principais</th>
</tr>
</thead>
<tbody className="divide-y divide-white/5">
<tr>
<td className="py-2 font-black text-red-400 align-top">Agarramento</td>
<td className="py-2 text-gray-400">Deslocamento torna-se 0 e não se beneficia de bônus no deslocamento. Termina se o agarrador for incapacitado.</td>
</tr>
<tr>
<td className="py-2 font-black text-red-400 align-top">Amedrontado</td>
<td className="py-2 text-gray-400">Desvantagem em ataques e testes se puder ver a fonte do medo. Não pode se aproximar voluntariamente da fonte.</td>
</tr>
<tr>
<td className="py-2 font-black text-red-400 align-top">Atordoado</td>
<td className="py-2 text-gray-400">Incapacitado, não pode se mover, falha automática em For/Des. Ataques contra têm Vantagem.</td>
</tr>
<tr>
<td className="py-2 font-black text-red-400 align-top">Caído</td>
<td className="py-2 text-gray-400">Apenas rasteja. Desvantagem nos próprios ataques. Ataques corpo-a-corpo contra têm Vantagem. Distância têm Desvantagem.</td>
</tr>
<tr>
<td className="py-2 font-black text-red-400 align-top">Cego</td>
<td className="py-2 text-gray-400">Falha automática em testes de visão. Ataques do alvo têm Desvantagem; ataques contra o alvo têm Vantagem.</td>
</tr>
<tr>
<td className="py-2 font-black text-red-400 align-top">Enfeitiçado</td>
<td className="py-2 text-gray-400">Não pode atacar o charmoso. Charmoso tem Vantagem em interações sociais com o alvo.</td>
</tr>
<tr>
<td className="py-2 font-black text-red-400 align-top">Envenenado</td>
<td className="py-2 text-gray-400">Desvantagem em jogadas de ataque e testes de habilidade.</td>
</tr>
<tr>
<td className="py-2 font-black text-red-400 align-top">Impedido</td>
<td className="py-2 text-gray-400">Deslocamento 0. Ataques do alvo têm Desvantagem; contra têm Vantagem. Desvantagem em testes de Des.</td>
</tr>
<tr>
<td className="py-2 font-black text-red-400 align-top">Invisível</td>
<td className="py-2 text-gray-400">Inalvejável para coisas que requerem visão. Ataques têm Vantagem; ataques contra têm Desvantagem.</td>
</tr>
<tr>
<td className="py-2 font-black text-red-400 align-top">Paralisado</td>
<td className="py-2 text-gray-400">Incapacitado e não se move. Falha auto For/Des. Ataques contra têm Vantagem. Acertos corpo-a-corpo são críticos automáticos.</td>
</tr>
</tbody>
</table>
</div>
);
}
return null;
}