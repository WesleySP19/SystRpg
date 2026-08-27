export async function simulateOracle(query, store) {
return new Promise(resolve => {
setTimeout(() => {
const s = store ? store.state : {};
const lowerQ = query.toLowerCase();
let ans = "🔮 As linhas do destino estão turvas, aventureiro. Refaça a pergunta com outras palavras.";
if (lowerQ.includes('herói') || lowerQ.includes('jogador') || lowerQ.includes('party')) {
if (s.heroes && s.heroes.length > 0) {
ans = "✨ Sinto a presença vibrante das seguintes almas valentes na sua mesa: " + s.heroes.map(h => h.name || h.nome).join(', ') + ". O destino deles pende por um fio.";
} else {
ans = "🌑 Não vejo nenhum herói nas neblinas desta sessão no momento. Eles ainda não chegaram ou caíram em batalha.";
}
}
else if (lowerQ.includes('npc') || lowerQ.includes('ferreiro') || lowerQ.includes('taverneiro')) {
ans = "👁️ Nos registros esotéricos, vejo um mercador peculiar na cidade que guarda um segredo maldito. Ele é um ferreiro com cicatrizes de fogo dracônico nas mãos. Ele sabe onde fica a tumba.";
}
else if (lowerQ.includes('resumo') || lowerQ.includes('sessão')) {
ans = "📜 As crônicas desta sessão revelam turbulência. Sangue foi derramado no grid, testes de resistência vitais foram forçados e os deuses acompanham cada rolagem de perto.";
}
else if (lowerQ.includes('quest') || lowerQ.includes('missão')) {
ans = "🗡️ A maior provação que aguarda o grupo está ligada ao Culto das Sombras no subterrâneo. O resgate do prisioneiro é urgente.";
}
else if (lowerQ.includes('dragão')) {
ans = "🐉 Táticas Dracônicas: Dragões são predadores aéreos formidáveis. Eles usarão seu Sopro Destrutivo (Recarrega 5-6) sempre que possível, e preferem isolar curandeiros usando Ataques de Asa e Presença Aterradora antes de engajar em combate corporal.";
}
resolve(ans);
}, 1500); // Simulando tempo de inferência neural
});
}