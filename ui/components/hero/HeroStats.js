import { html } from 'htm/preact';
import { Dice } from '../../../utils/Dice.js';
import { Toast } from '../../components/Toast.js';

export function HeroStats({ hero, onRoll }) {
    if (!hero) return null;

    const stats = hero.stats || { str:10, dex:10, con:10, int:10, wis:10, cha:10 };
    const getMod = (v) => Math.floor(((parseInt(v) || 10) - 10) / 2);
    
    const lvl = parseInt(hero.level) || 1;
    const profBonus = Math.floor((lvl - 1) / 4) + 2;

    const getPassiveScore = (skillKey, statKey) => {
        const hasProf = hero.skills?.some(s => s.toLowerCase() === skillKey.toLowerCase());
        return 10 + getMod(stats[statKey]) + (hasProf ? profBonus : 0);
    };

    const passivePerception = getPassiveScore('perception', 'wis');
    const passiveInvestigation = getPassiveScore('investigation', 'int');
    const passiveInsight = getPassiveScore('insight', 'wis');

    const handleAttributeClick = (attr, val) => {
        if (onRoll) onRoll(`Teste de ${attr.toUpperCase()}`, getMod(val), attr);
    };

    const savesList = [
        { key: 'str', name: 'Força (FOR)', stat: 'str' },
        { key: 'dex', name: 'Destreza (DES)', stat: 'dex' },
        { key: 'con', name: 'Constituição (CON)', stat: 'con' },
        { key: 'int', name: 'Inteligência (INT)', stat: 'int' },
        { key: 'wis', name: 'Sabedoria (SAB)', stat: 'wis' },
        { key: 'cha', name: 'Carisma (CAR)', stat: 'cha' }
    ];

    const skillList = [
        { key: 'athletics', name: 'Atletismo (FOR)', stat: 'str' },
        { key: 'acrobatics', name: 'Acrobacia (DES)', stat: 'dex' },
        { key: 'sleightOfHand', name: 'Prestidigitação (DES)', stat: 'dex' },
        { key: 'stealth', name: 'Furtividade (DES)', stat: 'dex' },
        { key: 'arcana', name: 'Arcanismo (INT)', stat: 'int' },
        { key: 'history', name: 'História (INT)', stat: 'int' },
        { key: 'investigation', name: 'Investigação (INT)', stat: 'int' },
        { key: 'nature', name: 'Natureza (INT)', stat: 'int' },
        { key: 'religion', name: 'Religião (INT)', stat: 'int' },
        { key: 'animalHandling', name: 'Adestrar Animais (SAB)', stat: 'wis' },
        { key: 'insight', name: 'Intuição (SAB)', stat: 'wis' },
        { key: 'medicine', name: 'Medicina (SAB)', stat: 'wis' },
        { key: 'perception', name: 'Percepção (SAB)', stat: 'wis' },
        { key: 'survival', name: 'Sobrevivência (SAB)', stat: 'wis' },
        { key: 'deception', name: 'Enganação (CAR)', stat: 'cha' },
        { key: 'intimidation', name: 'Intimidação (CAR)', stat: 'cha' },
        { key: 'performance', name: 'Atuação (CAR)', stat: 'cha' },
        { key: 'persuasion', name: 'Persuasão (CAR)', stat: 'cha' }
    ];

    return html`
        <div style="display:flex; flex-direction:column; gap:25px;">
            <!-- Attributes Grid -->
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px;">
                ${Object.entries(stats).map(([s, v]) => html`
                    <div class="card glass-accent h-[105px] flex flex-col items-center justify-center relative pt-3 border border-transparent transition-all duration-300 cursor-pointer" 
                         style="background:rgba(0,0,0,0.25);"
                         onClick=${() => handleAttributeClick(s, v)}
                         onMouseOver=${e => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 0 20px rgba(197, 160, 89, 0.45)';
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.background = 'rgba(197, 160, 89, 0.06)';
                         }}
                         onMouseOut=${e => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.background = 'rgba(0,0,0,0.25)';
                         }}
                         title="Clique para rolar teste de ${s.toUpperCase()}">
                        
                        <div style="font-size:0.65rem; font-weight:900; text-transform:uppercase; color:var(--accent); letter-spacing:1px;">${s}</div>
                        <div style="font-size:1.8rem; font-weight:900; margin-top:2px;">${v}</div>
                        
                        <div style="position:absolute; bottom:-12px; background:var(--bg-main); border:2px solid var(--accent); border-radius:50%; width:38px; height:32px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1rem; box-shadow:0 3px 6px rgba(0,0,0,0.5);">
                            ${getMod(v) >= 0 ? '+' : ''}${getMod(v)}
                        </div>
                    </div>
                `)}
            </div>

            <!-- Passives Summary -->
            <div class="card glass-accent py-4 px-3" style="display:flex; flex-direction:column; gap:10px; background:rgba(0,0,0,0.3); border:1px dashed rgba(197,160,89,0.35);">
                <div style="font-size:0.6rem; font-weight:900; color:var(--accent); display:flex; align-items:center; justify-content:center; gap:4px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px; text-transform:uppercase;">
                    <span>Sensorial & Percepção</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem;"><span style="opacity:0.7;">👁️ Percepção Passiva</span><strong style="color:var(--accent);">${passivePerception}</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem;"><span style="opacity:0.7;">🔎 Investigação Pass.</span><strong style="color:var(--info);">${passiveInvestigation}</strong></div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem;"><span style="opacity:0.7;">🧠 Intuição Passiva</span><strong style="color:var(--success);">${passiveInsight}</strong></div>
            </div>

            <!-- Proficiency Card -->
            <div class="card glass-accent p-4" style="display:flex; items-center; justify-content:space-between; background:rgba(197,160,89,0.05); border:1px solid rgba(197,160,89,0.2);">
                <span style="font-weight:900; font-size:0.75rem; letter-spacing:1px; color:var(--accent); font-family:'Cinzel';">BÔNUS DE PROFICIÊNCIA</span>
                <div style="font-size:1.4rem; font-weight:900; background:rgba(0,0,0,0.3); border:1.5px solid var(--accent); width:45px; height:35px; border-radius:8px; display:flex; align-items:center; justify-content:center; box-shadow:inset 0 0 5px rgba(0,0,0,0.5);">
                    +${profBonus}
                </div>
            </div>

            <!-- Saving Throws -->
            <div class="card glass-accent p-5" style="background:rgba(0,0,0,0.25);">
                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:12px; padding-bottom:4px; color:var(--accent); font-family:'Cinzel'; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-shield-halved"></i> SALVAGUARDAS
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:0.75rem;">
                    ${savesList.map(item => {
                        const isProf = Array.isArray(hero.savingThrows) 
                            ? hero.savingThrows.some(s => s.toLowerCase() === item.key.toLowerCase())
                            : !!hero.savingThrows?.[item.key];
                        
                        const mod = getMod(stats[item.stat]);
                        const totalSave = mod + (isProf ? profBonus : 0);
                        return html`
                            <div class="interactive-roll-row flex items-center justify-between py-1.5 px-2.5 rounded-md border" 
                                 style="background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.05); cursor:pointer; transition:all 0.2s;"
                                 onMouseOver=${e => { e.currentTarget.style.background='rgba(197,160,89,0.08)'; e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.transform='scale(1.02)'; }}
                                 onMouseOut=${e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.05)'; e.currentTarget.style.transform='none'; }}
                                 onClick=${() => { if(onRoll) onRoll(`Salvaguarda de ${item.name}`, totalSave); }}>
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <i class="fa-${isProf ? 'solid' : 'regular'} fa-circle text-[0.65rem]" style="color:${isProf ? 'var(--accent)' : 'rgba(255,255,255,0.2)'};"></i>
                                    <span>${item.name}</span>
                                </div>
                                <strong style="color:${isProf ? 'var(--accent)' : '#fff'};">${totalSave >= 0 ? '+' : ''}${totalSave}</strong>
                            </div>
                        `;
                    })}
                </div>
            </div>

            <!-- Skills -->
            <div class="card glass-accent p-5" style="background:rgba(0,0,0,0.25);">
                <div style="font-weight:900; border-bottom:2px solid var(--accent); margin-bottom:12px; padding-bottom:4px; color:var(--accent); font-family:'Cinzel'; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-list-check"></i> PERÍCIAS & TESTES
                </div>
                <div style="display:flex; flex-direction:column; gap:6px; max-height:430px; overflow-y:auto; padding-right:4px; font-size:0.75rem;">
                    ${skillList.map(item => {
                        const isProf = hero.skills?.some(s => s.toLowerCase() === item.key.toLowerCase());
                        const mod = getMod(stats[item.stat]);
                        const totalSkill = mod + (isProf ? profBonus : 0);
                        return html`
                            <div class="interactive-roll-row flex items-center justify-between py-1.5 px-2.5 rounded-md border" 
                                 style="background:${isProf ? 'rgba(197,160,89,0.05)' : 'rgba(255,255,255,0.05)'}; border-color:${isProf ? 'rgba(197,160,89,0.2)' : 'rgba(255,255,255,0.05)'}; cursor:pointer; transition:all 0.2s;"
                                 onMouseOver=${e => { e.currentTarget.style.background='rgba(197,160,89,0.08)'; e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.transform='scale(1.02)'; }}
                                 onMouseOut=${e => { e.currentTarget.style.background=isProf ? 'rgba(197,160,89,0.05)' : 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor=isProf ? 'rgba(197,160,89,0.2)' : 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform='none'; }}
                                 onClick=${() => { if(onRoll) onRoll(`Perícia ${item.name}`, totalSkill); }}>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <i class="fa-${isProf ? 'solid' : 'regular'} fa-circle text-[0.6rem]" style="color:${isProf ? 'var(--accent)' : 'rgba(255,255,255,0.15)'};"></i>
                                    <span style="opacity:${isProf ? '1' : '0.8'};">${item.name}</span>
                                </div>
                                <strong style="font-weight:900; color:${isProf ? 'var(--accent)' : '#fff'};">${totalSkill >= 0 ? '+' : ''}${totalSkill}</strong>
                            </div>
                        `;
                    })}
                </div>
            </div>
        </div>
    `;
}
