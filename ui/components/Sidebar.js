import { html } from 'htm/preact';
import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';
import { PersistenceService } from '../../services/PersistenceService.js';

export function Sidebar() {
    const activeTab = useStore('activeTab');
    const journalEntries = useStore('journalEntries');
    const sessionLoot = useStore('sessionLoot');
    const sessionTitle = useStore('sessionTitle');
    const xpDistributed = useStore('xpDistributed');
    const players = useStore('players');

    const items = [
        { id: 'dmtable',       label: 'Mesa do Mestre',        icon: 'fa-table-cells-large' },
        { id: 'dashboard',     label: 'Painel de Controle',    icon: 'fa-shield-halved' },
        { id: 'dmshield',      label: 'Escudo do Mestre',      icon: 'fa-scroll' },
        { id: 'combat',        label: 'Combate Tatico',        icon: 'fa-crosshairs' },
        { id: 'initiative',    label: 'Monitor de Iniciativa', icon: 'fa-swords' },
        { id: 'quest',         label: 'Gerenciador de Quests', icon: 'fa-hat-wizard' },
        { id: 'journal',       label: 'Diario de Sessao',      icon: 'fa-book-open-reader' },
        { id: 'npc',           label: 'Gerador de NPCs',       icon: 'fa-user-secret' },
        { id: 'herohub',       label: 'Monitor de Herois',     icon: 'fa-users' },
        { id: 'tomesinal',     label: 'Elo Arcano',            icon: 'fa-satellite-dish' },
        { id: 'cardgenerator', label: 'Gerador de Cartas',     icon: 'fa-address-card' },
        { id: 'bestiary',      label: 'Bestiario',             icon: 'fa-dragon' },
        { id: 'loot',          label: 'Gerador de Loot',       icon: 'fa-coins' },
        { id: 'settings',      label: 'Glossario de Regras',   icon: 'fa-book' }
    ];

    const navigate = (tab) => {
        TOME.store.update(s => s.activeTab = tab);
    };

    const exportCampaign = () => {
        const data = JSON.stringify(TOME.store.state, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tome_pro_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        import('./Toast.js').then(m => m.Toast.show('Campanha exportada com sucesso!')).catch(() => {});
    };

    const importCampaign = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (re) => {
                try {
                    const state = JSON.parse(re.target.result);
                    TOME.store.update(s => Object.assign(s, state));
                    import('./Toast.js').then(m => m.Toast.show('Campanha importada!')).catch(() => {});
                    window.location.reload();
                } catch (err) {
                    import('./Toast.js').then(m => m.Toast.show('Erro ao importar arquivo.', 'error')).catch(() => {});
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const openTolkienSummon = () => {
        const existing = document.getElementById('tolkien-summon-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'tolkien-summon-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            z-index: 99999; display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.2s ease; color: #f1f5f9; font-family: 'Outfit', sans-serif; box-sizing: border-box;
        `;

        const monsters = [
            { id: 'tolk_goblin', name: 'Goblin da Névoa', type: 'monster', hp_max: 7, ac: 15, emoji: '👺', desc: 'Pequeno humanoide furtivo e astuto que prefere atacar em emboscadas na escuridão.', size: 'small', speed: 30 },
            { id: 'tolk_orc', name: 'Orc Guerreiro', type: 'monster', hp_max: 15, ac: 13, emoji: '👹', desc: 'Criatura brutal de pele cinzenta e dentes caninos salientes, implacável no combate corporal.', size: 'medium', speed: 30 },
            { id: 'tolk_troll', name: 'Troll da Caverna', type: 'monster', hp_max: 84, ac: 15, emoji: '👾', desc: 'Gigante monstruoso dotado de regeneração acelerada, capaz de curar ferimentos graves a cada turno.', size: 'large', speed: 30 },
            { id: 'tolk_balrog', name: 'Balrog (Flagelo)', type: 'monster', hp_max: 262, ac: 19, emoji: '🔥', desc: 'Demônio ancestral de sombra e chama, envolto em aura de calor escaldante e portando chicote de fogo.', size: 'huge', speed: 40 }
        ];

        modal.innerHTML = `
            <div class="card glass" style="max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 25px; border-radius: 16px; border: 1px solid rgba(197, 160, 89, 0.4); background: rgba(10,12,16,0.96); box-shadow: 0 20px 40px rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 18px;">
                <div style="border-bottom: 1px solid rgba(197, 160, 89, 0.2); padding-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 0.6rem; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; font-family: 'Cinzel';">Evocação Arcana</span>
                        <h3 style="margin: 4px 0 0; font-family: 'Cinzel', serif; font-size: 1.3rem; color: #fff; display: flex; align-items: center; gap: 8px;">
                            ⚔️ Portão de Invocação de Tolkien
                        </h3>
                    </div>
                    <button class="btn btn-ghost close-btn" style="border-radius: 50%; width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-xmark"></i></button>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${monsters.map(m => `
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 15px;">
                            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(0,0,0,0.5); border: 2px solid ${m.id === 'tolk_balrog' ? 'var(--danger)' : 'var(--accent)'}; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; flex-shrink: 0;">
                                ${m.emoji}
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <strong style="color: #fff; font-size: 0.9rem;">${m.name}</strong>
                                    <span style="font-size: 0.7rem; background: rgba(197, 160, 89, 0.15); color: var(--accent); padding: 2px 6px; border-radius: 4px; font-weight: bold;">
                                        CA ${m.ac} • HP ${m.hp_max}
                                    </span>
                                </div>
                                <p style="font-size: 0.7rem; color: var(--text-dim); margin: 4px 0 0; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.desc}</p>
                            </div>
                            <button class="btn btn-primary btn-sm summon-btn" data-monster='${JSON.stringify(m)}' style="font-size: 0.7rem; border-radius: 6px; padding: 6px 12px;">Invocar</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => modal.remove();
        modal.querySelector('.close-btn').onclick = closeModal;
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };

        modal.querySelectorAll('.summon-btn').forEach(btn => {
            btn.onclick = () => {
                const m = JSON.parse(btn.dataset.monster);
                closeModal();
                
                let entity = {
                    id: m.id + '_' + Date.now(),
                    name: m.name,
                    hp_max: m.hp_max,
                    hp: m.hp_max,
                    ac: m.ac,
                    emoji: m.emoji,
                    size: m.size,
                    speed: m.speed,
                    type: 'monster'
                };

                setTimeout(() => {
                    if (window.TOME && window.TOME.events) {
                        window.TOME.events.emit('MONSTER_INVOKED', entity);
                    }
                }, 100);
            };
        });
    };

    const finishSession = () => {
        const existing = document.getElementById('close-session-modal');
        if (existing) existing.remove();

        // Fallbacks for data to avoid breaking missing fields
        const stats = TOME.store.state;
        const pList = players ? players.map(p => p.name) : [];
        const eList = journalEntries ? journalEntries.map(e => e.title) : [];
        
        const modal = document.createElement('div');
        modal.id = 'close-session-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
            z-index: 9999; display: flex; align-items: center; justify-content: center;
            animation: fadeIn 0.25s ease; color: #f1f5f9; font-family: 'Outfit', sans-serif; box-sizing: border-box;
        `;

        modal.innerHTML = `
            <div class="card glass-accent" style="max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; padding: 30px; border-radius: 18px; border: 2px solid rgba(197, 160, 89, 0.35); background: rgba(10,12,16,0.98); box-shadow: 0 20px 50px rgba(0,0,0,0.9);">
                <div style="border-bottom: 1.5px solid rgba(197, 160, 89, 0.25); padding-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="font-size: 0.65rem; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; font-family: 'Cinzel';">Fechamento do Grimório</span>
                        <h3 style="margin: 5px 0 0; font-family: 'Cinzel', serif; font-size: 1.5rem; color: #fff; display: flex; align-items: center; gap: 8px;">
                            🏁 Portal de Encerramento da Sessão
                        </h3>
                    </div>
                    <button class="btn btn-ghost close-btn" style="border-radius: 50%; width: 36px; height: 36px;"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div style="margin-top:20px; font-size: 0.8rem; line-height: 1.6;">
                    <p>Mesa: ${sessionTitle || 'Padrão'}</p>
                    <p>XP Distribuido: ${xpDistributed || 0}</p>
                </div>

                <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; margin-top:20px; display: flex; justify-content: flex-end; gap: 12px; flex-wrap: wrap;">
                    <button class="btn btn-ghost cancel-btn" style="border-radius: 8px; font-weight: 700;">Voltar ao Jogo</button>
                    <button class="btn btn-primary finalize-btn" style="background: linear-gradient(135deg, #7f1d1d, #c5a059); border-radius: 8px; font-weight: 800;">
                        <i class="fa-solid fa-flag-checkered"></i> Encerrar e Sair
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => modal.remove();
        modal.querySelector('.close-btn').onclick = closeModal;
        modal.querySelector('.cancel-btn').onclick = closeModal;

        modal.querySelector('.finalize-btn').onclick = async () => {
            if (!confirm('ATENÇÃO: Deseja fechar e arquivar permanentemente esta sessão no seu Registro Arcano?')) return;
            try {
                TOME.store.update(s => {
                    s.combatRound = 0;
                    s.combatActive = false;
                    s.xpDistributed = 0;
                });
                await TOME.persistence.save();
                closeModal();
                
                setTimeout(() => window.location.reload(), 1200);
            } catch (err) {
                alert('Erro ao fechar sessão: ' + err.message);
            }
        };
    };

    return html`
        <aside class="flex flex-col w-[265px] h-screen bg-[#08090d] border-r border-accent/10 shadow-[4px_0_24px_rgba(0,0,0,0.65)] overflow-hidden shrink-0 z-[100]">
            <!-- Cabeçalho -->
            <div class="flex items-center gap-3 px-4 py-5 border-b border-accent/10 bg-[#0a0c12] shrink-0">
                <div class="w-[34px] h-[34px] rounded-lg bg-gradient-to-br from-accent/20 to-black/80 border border-accent/30 shadow-[0_0_10px_rgba(212,175,55,0.15)] flex items-center justify-center text-accent text-[0.95rem] shrink-0">
                    <i class="fa-solid fa-dice-d20"></i>
                </div>
                <div class="flex flex-col gap-0.5 min-w-0">
                    <span class="font-cinzel text-[0.92rem] font-extrabold text-slate-100 whitespace-nowrap overflow-hidden text-ellipsis tracking-wider">
                        Mesa do Mestre
                    </span>
                    <span class="text-[0.58rem] text-accent uppercase tracking-widest font-bold opacity-90">
                        V21.0.0
                    </span>
                </div>
            </div>

            <!-- Navegação principal -->
            <nav class="flex-1 overflow-y-auto px-2.5 py-2.5 flex flex-col gap-0.5 custom-scrollbar">
                <button class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent bg-transparent text-slate-400 font-outfit text-[0.81rem] font-medium text-left w-full transition-all hover:bg-white/5 hover:text-slate-50 hover:border-white/10 hover:translate-x-0.5 ${activeTab === 'campaign' ? 'bg-gradient-to-r from-accent/10 to-accent/5 text-[#f3e5ab] border-accent/20 font-semibold shadow-[inset_3px_0_0_#d4af37]' : ''}"
                        onClick=${() => navigate('campaign')}>
                    <i class="fa-solid fa-users-viewfinder w-4 text-center shrink-0 opacity-70 transition-all ${activeTab === 'campaign' ? 'opacity-100 text-accent drop-shadow-[0_0_4px_rgba(212,175,55,0.4)]' : ''}"></i>
                    <span>Gestão de Campanha</span>
                </button>

                <div class="h-px bg-gradient-to-r from-transparent via-accent/15 to-transparent my-2 mx-1"></div>

                ${items.map(i => html`
                    <button class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent bg-transparent text-slate-400 font-outfit text-[0.81rem] font-medium text-left w-full transition-all hover:bg-white/5 hover:text-slate-50 hover:border-white/10 hover:translate-x-0.5 ${activeTab === i.id ? 'bg-gradient-to-r from-accent/10 to-accent/5 text-[#f3e5ab] border-accent/20 font-semibold shadow-[inset_3px_0_0_#d4af37]' : ''}"
                            onClick=${() => navigate(i.id)}>
                        <i class="fa-solid ${i.icon} w-4 text-center shrink-0 opacity-70 transition-all ${activeTab === i.id ? 'opacity-100 text-accent drop-shadow-[0_0_4px_rgba(212,175,55,0.4)]' : ''}"></i>
                        <span>${i.label}</span>
                    </button>
                `)}
            </nav>

            <!-- Rodapé com ações -->
            <div class="p-3 border-t border-accent/10 bg-[#0a0c12] flex flex-col gap-1.5 shrink-0">
                <div class="grid grid-cols-2 gap-1.5">
                    <button class="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-transparent bg-transparent text-slate-500 font-outfit text-[0.76rem] font-medium text-left w-full transition-all hover:bg-white/5 hover:text-slate-300" 
                            onClick=${exportCampaign}>
                        <i class="fa-solid fa-file-export text-[0.75rem] w-[15px] text-center shrink-0"></i> Exportar
                    </button>
                    <button class="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-transparent bg-transparent text-slate-500 font-outfit text-[0.76rem] font-medium text-left w-full transition-all hover:bg-white/5 hover:text-slate-300" 
                            onClick=${importCampaign}>
                        <i class="fa-solid fa-file-import text-[0.75rem] w-[15px] text-center shrink-0"></i> Importar
                    </button>
                </div>

                <button class="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-transparent bg-transparent text-slate-500 font-outfit text-[0.76rem] font-medium text-left w-full transition-all hover:bg-white/5 hover:text-slate-300" 
                        onClick=${() => window.location.href='/index.html?reset=1'}>
                    <i class="fa-solid fa-broom text-[0.75rem] w-[15px] text-center shrink-0"></i> Limpar Cache
                </button>

                <button class="flex items-center gap-2 px-2.5 py-2 rounded-lg text-accent bg-accent/5 border border-accent/20 font-semibold font-outfit text-[0.76rem] text-left w-full transition-all hover:bg-accent/10 hover:text-[#f3e5ab] hover:shadow-[0_0_12px_rgba(212,175,55,0.2)]" 
                        onClick=${openTolkienSummon}>
                    <i class="fa-solid fa-dragon text-[0.75rem] w-[15px] text-center shrink-0"></i> Invocação de Tolkien
                </button>

                <button class="flex items-center gap-2 px-2.5 py-2 rounded-lg text-red-500 bg-red-500/5 border border-red-500/15 font-semibold font-outfit text-[0.76rem] text-left w-full transition-all hover:bg-red-500/10 hover:text-red-400 hover:shadow-[0_0_12px_rgba(239,68,68,0.2)]" 
                        onClick=${finishSession}>
                    <i class="fa-solid fa-flag-checkered text-[0.75rem] w-[15px] text-center shrink-0"></i> Finalizar Sessão
                </button>

                <div class="flex items-center gap-2 px-2.5 pt-2 pb-0.5">
                    <div class="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] shrink-0"></div>
                    <span class="text-[0.62rem] text-slate-600 font-semibold uppercase tracking-widest">Sistema Ativo</span>
                </div>
            </div>
        </aside>
    `;
}
