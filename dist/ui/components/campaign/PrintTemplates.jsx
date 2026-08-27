import { h } from 'preact';
export function PrintTemplates({ player }) {
if (!player) return null;
const stats = player.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 };
const getMod = (v) => Math.floor((v - 10) / 2);
const formatItems = (equipment) => {
if (!equipment?.items) return '';
if (Array.isArray(equipment.items)) {
return equipment.items.map(i => `${i.qty}x ${i.name}`).join('\n');
}
return String(equipment.items);
};
return (
<>
{}
<div className="dnd-print-template">
<div className="dnd-header">
<div style={{flex: 1}}>
<h1 style={{margin: 0, fontSize: '24px'}}>{player.name}</h1>
<span style={{fontSize: '10px', textTransform: 'uppercase'}}>Nome do Personagem</span>
</div>
<div style={{flex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '10px'}}>
<div><strong>Classe/Nível:</strong> {player.class} {player.level}</div>
<div><strong>Raça:</strong> {player.race}</div>
<div><strong>XP:</strong> {player.xp || 0}</div>
</div>
</div>
<div className="dnd-main-stats">
<div className="dnd-box"><div className="val">{10 + getMod(stats.dex)}</div><div className="label">CA</div></div>
<div className="dnd-box"><div className="val">{getMod(stats.dex) >= 0 ? '+' : ''}{getMod(stats.dex)}</div><div className="label">Iniciativa</div></div>
<div className="dnd-box"><div className="val">{player.speed || 30}ft</div><div className="label">Deslocamento</div></div>
<div className="dnd-box" style={{flex: 2}}><div className="val">{player.hp?.current} / {player.hp?.max}</div><div className="label">Pontos de Vida Atuais</div></div>
</div>
<div className="dnd-grid">
<div className="dnd-stats-column">
{Object.entries(stats).map(([s, v]) => (
<div key={s} className="stat-box">
<div className="stat-label">{s}</div>
<div className="stat-mod">{getMod(v) >= 0 ? '+' : ''}{getMod(v)}</div>
<div className="stat-val">{v}</div>
</div>
))}
</div>
<div className="skill-list card" style={{padding: '15px', border: '2px solid #000'}}>
<div style={{fontWeight: 800, borderBottom: '1px solid #000', marginBottom: '10px'}}>PERÍCIAS & TESTES</div>
<div className="skill-item">○ Acrobacia (Des)</div>
<div className="skill-item">○ Adestrar Animais (Sab)</div>
<div className="skill-item">○ Arcanismo (Int)</div>
<div className="skill-item">○ Atletismo (For)</div>
<div className="skill-item">○ Atuação (Car)</div>
<div className="skill-item">○ Enganação (Car)</div>
<div className="skill-item">○ Furtividade (Des)</div>
<div className="skill-item">○ História (Int)</div>
<div className="skill-item">○ Intimidação (Car)</div>
<div className="skill-item">○ Intuição (Sab)</div>
<div className="skill-item">○ Investigação (Int)</div>
<div className="skill-item">○ Medicina (Sab)</div>
<div className="skill-item">○ Natureza (Int)</div>
<div className="skill-item">○ Percepção (Sab)</div>
<div className="skill-item">○ Persuasão (Car)</div>
<div className="skill-item">○ Prestidigitação (Des)</div>
<div className="skill-item">○ Religião (Int)</div>
<div className="skill-item">○ Sobrevivência (Sab)</div>
</div>
<div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
<div className="card" style={{border: '2px solid #000', padding: '10px', flex: 1}}>
<div className="stat-label">Equipamento & Itens</div>
<div style={{fontSize: '9px', marginTop: '5px', whiteSpace: 'pre-wrap'}}>
{formatItems(player.equipment)}
</div>
</div>
<div className="card" style={{border: '2px solid #000', padding: '10px', flex: 1}}>
<div className="stat-label">Características & Traços</div>
<div style={{fontSize: '9px', marginTop: '5px', whiteSpace: 'pre-wrap'}}>{player.roleplay?.traits || ''}</div>
</div>
</div>
</div>
<div style={{marginTop: '20px', fontSize: '8px', textAlign: 'center', opacity: 0.5}}>
Gerado pela Mesa do Mestre — Ficha Oficial de Referência 5e
</div>
</div>
{}
<div className="dnd-print-card">
<div className="dnd-header" style={{borderBottom: '2px solid #000', paddingBottom: '5px', marginBottom: '10px'}}>
<h2 style={{margin: 0, fontSize: '16px'}}>{player.name}</h2>
<span style={{fontSize: '9px'}}>{player.class} {player.level} • {player.race}</span>
</div>
<div style={{display: 'flex', gap: '10px'}}>
<div style={{flex: 1}}>
<div style={{fontSize: '10px', fontWeight: 'bold'}}>Combate</div>
<div style={{fontSize: '12px'}}>CA: <strong>{10 + getMod(stats.dex)}</strong></div>
<div style={{fontSize: '12px'}}>Inic: <strong>{getMod(stats.dex) >= 0 ? '+' : ''}{getMod(stats.dex)}</strong></div>
<div style={{fontSize: '12px'}}>HP: <strong>{player.hp?.current}/{player.hp?.max}</strong></div>
</div>
<div style={{flex: 1, borderLeft: '1px solid #ccc', paddingLeft: '10px'}}>
<div style={{fontSize: '10px', fontWeight: 'bold'}}>Atributos Base</div>
{Object.entries(stats).map(([s, v]) => (
<div key={s} style={{display: 'flex', justifyContent: 'space-between', fontSize: '9px'}}>
<span style={{textTransform: 'uppercase'}}>{s}</span>
<span>{v} ({getMod(v) >= 0 ? '+' : ''}{getMod(v)})</span>
</div>
))}
</div>
</div>
</div>
</>
);
}