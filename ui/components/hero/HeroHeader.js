import { html } from 'htm/preact';

export function HeroHeader({ hero }) {
    if (!hero) return null;

    const lvl = parseInt(hero.level) || 1;
    const currentXP = hero.xp || 0;
    // XP Scaling
    let nextXP = 300;
    if (lvl === 1) nextXP = 300;
    else if (lvl === 2) nextXP = 900;
    else if (lvl === 3) nextXP = 2700;
    else if (lvl === 4) nextXP = 6500;
    else if (lvl >= 5) nextXP = lvl * 2000;
    
    let progress = Math.min((currentXP / nextXP) * 100, 100);

    return html`
        <div style="display:flex; align-items:center; gap:30px;">
            <div class="token-avatar" style="width:120px; height:120px; border:3px solid var(--accent); font-family:'Cinzel'; font-size:2.8rem; box-shadow:0 0 25px rgba(197,160,89,0.3); background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center;">
                ${hero.name.substring(0,2)}
            </div>
            
            <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;">
                    <div>
                        <h1 style="margin:0; font-family:'Cinzel'; font-size:2.2rem; color:var(--accent); text-shadow:0 0 15px rgba(197,160,89,0.4); line-height:1.1;">
                            ${hero.name}
                        </h1>
                        <div style="font-size:0.9rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:2px; margin-top:5px; font-weight:600;">
                            ${hero.race || 'Humano'} <span style="color:var(--accent); margin:0 5px;">•</span> ${hero.class || 'Aventureiro'}
                        </div>
                    </div>
                </div>

                <!-- XP Bar -->
                <div class="glass" style="padding:15px 20px; border-radius:12px; border:1px solid rgba(197,160,89,0.15);">
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">
                        <span style="color:var(--accent);">Nível ${lvl}</span>
                        <span style="color:var(--text-main);">${currentXP} / ${nextXP} XP</span>
                    </div>
                    <div style="width:100%; height:8px; background:rgba(0,0,0,0.5); border-radius:4px; overflow:hidden; box-shadow:inset 0 1px 3px rgba(0,0,0,0.8);">
                        <div style="height:100%; width:${progress}%; background:linear-gradient(90deg, #c5a059, #e0c88c); box-shadow:0 0 10px rgba(197,160,89,0.8); transition:width 0.5s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
