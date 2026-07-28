const COND_EMOJIS = {
    'abalado':'😰','amedrontado':'😨','agarrado':'🤝','atordoado':'💫',
    'cego':'🙈','caído':'🤕','enfeitiçado':'💜','envenenado':'🤢',
    'exausto':'😫','incapacitado':'😵','invisível':'👻','paralisado':'🧊',
    'petrificado':'🗿','preso':'🕸️','amaldiçoado':'🧿','surdo':'🔇',
};

export function hpColor(cur, max) {
    if (!max) return '#94a3b8';
    const p = cur / max;
    if (p > 0.5) return '#22c55e';
    if (p > 0.2) return '#e5c17b';
    return '#ef4444';
}

export function hpPct(cur, max) {
    if (!max) return 0;
    return Math.min(100, Math.max(0, Math.round((cur / max) * 100)));
}

export function resolveHP(c) {
    if (c.hp_current !== undefined) return { cur: c.hp_current ?? c.hp_max, max: c.hp_max ?? 0 };
    if (c.combat)  return { cur: c.combat.hp_current ?? c.combat.hp_max, max: c.combat.hp_max ?? 0 };
    return { cur: 0, max: 0 };
}

let lastCombatRound = -1;
let lastTurnIdx = -1;

export function getValidImg(imgSrc) {
    if (!imgSrc || typeof imgSrc !== 'string' || imgSrc.trim() === '') return null;
    if (window.App && window.App.resolvedImageCache && window.App.resolvedImageCache.has(imgSrc)) {
        return window.App.resolvedImageCache.get(imgSrc);
    }
    return imgSrc;
}

export function updateCombatUI(state) {
    const roundLabel = document.getElementById('pv-round-label');
    const spotlight = document.getElementById('pv-spotlight');
    const queue = document.getElementById('pv-queue');
    const spAvatar = document.getElementById('pv-sp-avatar');
    const spName = document.getElementById('pv-sp-name');
    const spMeta = document.getElementById('pv-sp-meta');
    const spHpFill = document.getElementById('pv-sp-hp-fill');
    const announce = document.getElementById('pv-turn-announce');

    if (!state || !state.combatActive || !state.combatInitiative || state.combatInitiative.length === 0) {
        if (roundLabel) roundLabel.innerText = "Combate Inativo";
        if (spotlight) spotlight.style.display = "none";
        if (queue) queue.innerHTML = '<div class="pv-queue-label">Aguardando combate...</div>';
        lastCombatRound = -1;
        lastTurnIdx = -1;
        return;
    }

    const init = state.combatInitiative;
    const turnIdx = state.combatCurrentTurn || 0;
    const current = init[turnIdx];

    if (lastCombatRound === -1 && typeof window._autoShowHud === 'function') {
        window._autoShowHud();
    }

    if (current && (state.combatRound !== lastCombatRound || turnIdx !== lastTurnIdx)) {
        if (lastCombatRound !== -1 && announce) {
            announce.innerHTML = '<div class="pv-announce-title">TURNO DE</div>' +
                '<div class="pv-announce-name">' + current.name + '</div>';
            announce.classList.remove('active');
            void announce.offsetWidth;
            announce.classList.add('active');
            setTimeout(() => {
                announce.classList.remove('active');
            }, 3500);
        }
        lastCombatRound = state.combatRound || 1;
        lastTurnIdx = turnIdx;
    }

    if (roundLabel) roundLabel.innerText = 'Rodada ' + (state.combatRound || 1);

    if (current) {
        if (spotlight) spotlight.style.display = "block";
        const hp = resolveHP(current);
        const pct = hpPct(hp.cur, hp.max);
        const col = hpColor(hp.cur, hp.max);

        if (spAvatar) {
            const validImg = getValidImg(current.img);
            spAvatar.style.backgroundImage = validImg ? "url('" + validImg + "')" : 'none';
            spAvatar.innerText = validImg ? '' : (current.emoji || current.name[0]);
        }
        if (spName) spName.innerText = current.name;
        if (spMeta) {
            var caText = current.ac !== undefined ? 'CA ' + current.ac : '';
            var hpText = hp.max > 0 ? 'HP ' + hp.cur + '/' + hp.max : '';
            spMeta.innerText = [caText, hpText].filter(Boolean).join(' • ');
        }
        if (spHpFill) {
            spHpFill.style.width = pct + "%";
            spHpFill.style.backgroundColor = col;
        }
    } else {
        if (spotlight) spotlight.style.display = "none";
    }

    if (queue) {
        const upcoming = [];
        for (let i = 1; i < init.length; i++) {
            const idx = (turnIdx + i) % init.length;
            const c = init[idx];
            if (c) {
                const hp = resolveHP(c);
                const pct = hpPct(hp.cur, hp.max);
                const col = hpColor(hp.cur, hp.max);
                const emoji = COND_EMOJIS[c.condition] || '';
                
                const validImg = getValidImg(c.img);
                var avatarBg = validImg ? "url('" + validImg + "')" : 'none';
                var avatarInner = validImg ? '' : (c.emoji || c.name[0]);
                upcoming.push(
                    '<div class="pv-queue-row ' + c.type + '">' +
                        '<div class="pv-avatar mini" style="background-image: ' + avatarBg + '">' + avatarInner + '</div>' +
                        '<div class="pv-queue-info">' +
                            '<div class="pv-queue-name">' + c.name + ' ' + emoji + '</div>' +
                            '<div class="pv-queue-hp-bar">' +
                                '<div class="pv-queue-hp-fill" style="width: ' + pct + '%; background-color: ' + col + ';"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                );
            }
        }
        queue.innerHTML = upcoming.join('');
    }
}
