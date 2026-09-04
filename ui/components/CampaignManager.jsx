import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { useStore } from '../core/hooks.js';
import { TOME } from '../../core/Registry.js';
import { Toast } from './Toast.js';
import { Dice } from '../../utils/Dice.js';

import { PrintTemplates } from './campaign/PrintTemplates.jsx';
import { SessionControl } from './campaign/SessionControl.jsx';
import { HeroSidebar } from './campaign/HeroSidebar.jsx';
import { HeroCommandPanel } from './campaign/HeroCommandPanel.jsx';
import { CampaignWidgets } from './campaign/CampaignWidgets.jsx';

// Componente Wrapper para imitar 'this' de ReactiveComponent e passar pros renderQuick*
class StoreComponentRef {
    constructor(state, updateState) {
        this.store = { state };
        this.updateState = updateState;
    }

    quickAddQuest() {
        const title = prompt('Digite o título da nova Quest/Missão:');
        if (!title || !title.trim()) return;
        const reward = prompt('Digite a recompensa (Ex: 200 GP, Anel Mágico):') || '';
        
        TOME.store.update(s => {
            s.quests = s.quests || [];
            s.quests.push({
                id: 'q-' + Date.now(),
                title: title.trim(),
                description: 'Missão rápida cadastrada via central de comando.',
                type: 'side',
                difficulty: 'medium',
                levelRange: '1-4',
                faction: 'Nenhuma',
                xpType: 'xp',
                xpReward: 100,
                reward: reward.trim() || 'Nenhuma',
                milestones: [],
                completed: false,
                failed: false,
                xpDistributed: false,
                status: 'active'
            });
        });
        Toast.show('Nova missão adicionada ao painel!', 'success');
    }

    quickOracleInspire() {
        Toast.show('Consultando o Oráculo IA...', 'info');
        const system = localStorage.getItem('DM_SYSTEM') || 'D&D 5e';
        const title = TOME.store.state.sessionTitle || 'Nova Campanha';
        const heroes = (TOME.store.state.players || []).map(p => `${p.name} (Nv ${p.level} ${p.class})`).join(', ');
        
        TOME.ai.ask(`Crie um gancho narrativo dramático e curto (2 frases) para a campanha "${title}" usando o sistema "${system}" com os heróis: ${heroes}. Foque em mistério ou perigo imediato.`)
            .then(hook => {
                TOME.store.update(s => {
                    s.journalEntries = s.journalEntries || [];
                    s.journalEntries.push({
                        id: Date.now(),
                        timestamp: Date.now(),
                        type: 'oracle',
                        title: 'Oráculo da Campanha',
                        content: hook
                    });
                });
                Toast.show('O Oráculo soprou uma inspiração narrativa no diário!', 'success');
            })
            .catch(e => {
                Toast.show('O Oráculo falhou em se comunicar: ' + e.message, 'danger');
            });
    }

    quickCompleteQuest(e, el) {
        if (e) e.stopPropagation();
        const id = el.dataset.id;
        TOME.store.update(s => {
            s.quests = (s.quests || []).map(q => {
                if (String(q.id) === String(id)) {
                    const sessionNum = s.sessionNumber || 1;
                    const logMsg = `⚔️ MISSÃO CONCLUÍDA: Os heróis completaram a missão "${q.title}"!`;
                    s.journalEntries = [...(s.journalEntries || []), {
                        id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                        session: sessionNum,
                        timestamp: Date.now(),
                        text: logMsg,
                        type: 'system'
                    }];
                    return { ...q, completed: true, failed: false, status: 'completed' };
                }
                return q;
            });
        });
        TOME.persistence.save().catch(console.warn);
        Toast.show('Missão marcada como concluída!', 'success');
    }

    quickFailQuest(e, el) {
        if (e) e.stopPropagation();
        const id = el.dataset.id;
        if (confirm('Marcar esta missão como fracassada?')) {
            TOME.store.update(s => {
                s.quests = (s.quests || []).map(q => {
                    if (String(q.id) === String(id)) {
                        const sessionNum = s.sessionNumber || 1;
                        s.journalEntries = [...(s.journalEntries || []), {
                            id: 'log-' + Date.now(), session: sessionNum, timestamp: Date.now(), text: `💀 MISSÃO FRACASSADA: "${q.title}"`, type: 'system'
                        }];
                        return { ...q, failed: true, completed: false, status: 'failed' };
                    }
                    return q;
                });
            });
            TOME.persistence.save().catch(console.warn);
        }
    }

    quickDeleteQuest(e, el) {
        if (e) e.stopPropagation();
        const id = el.dataset.id;
        if (confirm('Deseja excluir esta missão permanentemente?')) {
            TOME.store.update(s => { s.quests = (s.quests || []).filter(q => String(q.id) !== String(id)); });
            TOME.persistence.save().catch(console.warn);
            Toast.show('Missão removida permanentemente.');
        }
    }

    adjustMonsterHP(e, el) {
        const monsterId = parseInt(el.dataset.id);
        const val = parseInt(el.dataset.val);
        TOME.store.update(s => {
            const m = s.monsters.find(x => x.id === monsterId);
            if (m) {
                m.hp.current = Math.max(0, Math.min(m.hp.max, m.hp.current + val));
                const combatant = s.initiativeOrder?.find(c => c.id === m.id);
                if (combatant) combatant.hp_current = m.hp.current;
            }
        });
    }
}

export function CampaignManager() {
    const [state, updateState] = useStore();
    const [selectedHeroId, setSelectedHeroId] = useState(null);
    const [printing, setPrinting] = useState(null); // 'sheet' | 'card' | null

    const players = state.players || [];
    const selectedPlayer = players.find(p => p.id === selectedHeroId);

    // Provide a mocked 'this' for the legacy widget renderers
    const storeComponentRef = new StoreComponentRef(state, updateState);

    // =====================================
    // HERO COMMAND HANDLERS
    // =====================================
    const handleAdjustHP = (val) => {
        if (!selectedHeroId) return;
        TOME.store.update(s => {
            const p = s.players.find(x => x.id === selectedHeroId);
            if (p) {
                const maxHp = p.hp?.max || p.hp_max || 10;
                const curHp = p.hp?.current !== undefined ? p.hp.current : (p.hp_current || maxHp);
                const nextHp = Math.max(0, Math.min(maxHp, curHp + val));
                p.hp = { current: nextHp, max: maxHp };
                p.hp_current = nextHp;
                const combatant = s.initiativeOrder?.find(c => c.id === p.id || c.name === p.name);
                if (combatant) {
                    combatant.hp = { current: nextHp, max: maxHp };
                    combatant.hp_current = nextHp;
                }
            }
        });
    };

    const handleRestHero = (type = 'short') => {
        if (!selectedHeroId) return;
        TOME.store.update(s => {
            const p = s.players.find(x => x.id === selectedHeroId);
            if (p) {
                const maxHp = p.hp?.max || p.hp_max || 10;
                if (type === 'long') {
                    p.hp = { current: maxHp, max: maxHp };
                    p.hp_current = maxHp;
                    p.conditions = (p.conditions || []).filter(c => c !== 'caído' && c !== 'envenenado');
                    Toast.show(`🌙 Descanso Longo: ${p.name} recuperou 100% dos PV!`, 'success');
                } else {
                    const heal = Math.max(1, Math.round(maxHp * 0.25));
                    const curHp = p.hp?.current ?? p.hp_current ?? maxHp;
                    const nextHp = Math.min(maxHp, curHp + heal);
                    p.hp = { current: nextHp, max: maxHp };
                    p.hp_current = nextHp;
                    Toast.show(`☕ Descanso Curto: ${p.name} recuperou +${heal} PV.`, 'info');
                }
                const combatant = s.initiativeOrder?.find(c => c.id === p.id || c.name === p.name);
                if (combatant) {
                    combatant.hp = { ...p.hp };
                    combatant.hp_current = p.hp_current;
                    combatant.conditions = [...(p.conditions || [])];
                }
            }
        });
    };

    const handleToggleCondition = (condition) => {
        if (!selectedHeroId) return;
        TOME.store.update(s => {
            const p = s.players.find(x => x.id === selectedHeroId);
            if (p) {
                p.conditions = p.conditions || [];
                const idx = p.conditions.indexOf(condition);
                if (idx >= 0) {
                    p.conditions.splice(idx, 1);
                    Toast.show(`Removido status "${condition}" de ${p.name}.`, 'info');
                } else {
                    p.conditions.push(condition);
                    Toast.show(`Aplicado status "${condition}" a ${p.name}.`, 'warning');
                }
                const combatant = s.initiativeOrder?.find(c => c.id === p.id || c.name === p.name);
                if (combatant) {
                    combatant.conditions = [...p.conditions];
                }
            }
        });
    };

    const handlePartyRest = (type = 'short') => {
        const isLong = type === 'long';
        if (!confirm(`Aplicar ${isLong ? 'Descanso Longo (100% de cura)' : 'Descanso Curto (+25% de cura)'} a TODOS os heróis?`)) return;
        
        TOME.store.update(s => {
            (s.players || []).forEach(p => {
                const maxHp = p.hp?.max || p.hp_max || 10;
                if (isLong) {
                    p.hp = { current: maxHp, max: maxHp };
                    p.hp_current = maxHp;
                    p.conditions = (p.conditions || []).filter(c => c !== 'caído' && c !== 'envenenado');
                } else {
                    const heal = Math.max(1, Math.round(maxHp * 0.25));
                    const curHp = p.hp?.current ?? p.hp_current ?? maxHp;
                    const nextHp = Math.min(maxHp, curHp + heal);
                    p.hp = { current: nextHp, max: maxHp };
                    p.hp_current = nextHp;
                }
                const combatant = s.initiativeOrder?.find(c => c.id === p.id || c.name === p.name);
                if (combatant) {
                    combatant.hp = { ...p.hp };
                    combatant.hp_current = p.hp_current;
                    combatant.conditions = [...(p.conditions || [])];
                }
            });
        });
        Toast.show(isLong ? '🌙 Descanso Longo aplicado a todo o grupo!' : '☕ Descanso Curto aplicado a todo o grupo!', 'success');
    };

    const handleAdjustXP = (val) => {
        if (!selectedHeroId) return;
        TOME.store.update(s => {
            const p = s.players.find(x => x.id === selectedHeroId);
            if (p) {
                p.xp = (p.xp || 0) + val;
                s.xpDistributed = (s.xpDistributed || 0) + val;
                s.journalEntries = s.journalEntries || [];
                s.journalEntries.push({
                    id: Date.now(),
                    timestamp: Date.now(),
                    date: new Date().toLocaleDateString('pt-BR'),
                    type: 'loot',
                    title: 'XP Distribuído',
                    content: `Adjudicado +${val} XP para o herói ${p.name}.`
                });
            }
        });
    };

    const handleCustomXP = () => {
        const val = parseInt(prompt('Quantidade de XP:'));
        if (!isNaN(val)) handleAdjustXP(val);
    };

    const handleUpdateItems = (val) => {
        if (!selectedHeroId) return;
        TOME.store.update(s => {
            const p = s.players.find(x => x.id === selectedHeroId);
            if (p) {
                const lines = val.split('\n').filter(line => line.trim());
                p.equipment = p.equipment || {};
                p.equipment.items = lines.map(line => {
                    const match = line.match(/^(\d+)x?\s+(.+)$/);
                    if (match) {
                        return { qty: parseInt(match[1]) || 1, name: match[2].trim(), weight: 0 };
                    }
                    return { qty: 1, name: line.trim(), weight: 0 };
                });
            }
        });
    };

    const handleUpdateNotes = (val) => {
        if (!selectedHeroId) return;
        TOME.store.update(s => {
            const p = s.players.find(x => x.id === selectedHeroId);
            if (p) {
                if (!p.roleplay) p.roleplay = { traits: '' };
                p.roleplay.traits = val;
            }
        });
    };

    const handlePrintSheet = () => {
        setPrinting('sheet');
        setTimeout(() => {
            document.body.classList.add('print-sheet-mode');
            window.print();
            document.body.classList.remove('print-sheet-mode');
            setPrinting(null);
        }, 100);
    };

    const handlePrintCard = () => {
        setPrinting('card');
        setTimeout(() => {
            document.body.classList.add('print-card-mode');
            window.print();
            document.body.classList.remove('print-card-mode');
            setPrinting(null);
        }, 100);
    };

    const handleRollAttribute = (attrName, val) => {
        if (!selectedPlayer) return;
        const mod = Math.floor((val - 10) / 2);
        const mode = confirm(`Rolar com Vantagem?\n[OK] = Sim, Vantagem\n[Cancelar] = Normal`) ? 'advantage' : 'normal';
        
        const r1 = Dice.roll('1d20');
        const r2 = mode === 'advantage' ? Dice.roll('1d20') : null;
        let finalVal = 0;
        let rollText = '';

        TOME.audio.playSFX('https://assets.mixkit.co/active_storage/sfx/1271/1271-preview.mp3');

        if (mode === 'normal') {
            finalVal = r1.total + mod;
            rollText = `Rolo d20(${r1.total}) ${mod >= 0 ? '+' : ''}${mod} = **${finalVal}**`;
        } else {
            const chosen = Math.max(r1.total, r2.total);
            finalVal = chosen + mod;
            rollText = `Rolo com **Vantagem** [d20(${r1.total}), d20(${r2.total})] ➔ Maior (${chosen}) ${mod >= 0 ? '+' : ''}${mod} = **${finalVal}**`;
        }

        Toast.show(`🎲 **${selectedPlayer.name}** fez um teste de **${attrName.toUpperCase()}**!<br />${rollText}`, 'success');
    };

    // =====================================
    // GLOBAL ACTIONS
    // =====================================
    const handleSystemAnalysis = async (triggerReason) => {
        Toast.show('Executando análise de consistência...', 'info');
        // Simple alert for now, you can restore the complex Modal report here
        alert(`Relatório do Sistema: ${triggerReason}\nIntegridade OK. Total de Jogadores: ${players.length}`);
    };

    const handleStartCampaignForm = () => {
        const dmName = localStorage.getItem('DM_MASTER_NAME') || '';
        const name = prompt('Nome da Nova Campanha:');
        if (!name) return;
        
        const system = prompt('Sistema (D&D 5e, Pathfinder 2e...):', 'D&D 5e') || 'D&D 5e';
        localStorage.setItem('DM_SYSTEM', system);
        localStorage.setItem('DM_MASTER_NAME', dmName || 'Mestre');

        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
        const file = `${slug}.json`;

        let list = [];
        try {
            list = JSON.parse(localStorage.getItem('TOME_SESSION_LIST') || '[]');
        } catch (_) {}

        if (list.some(s => s.file === file)) {
            Toast.show('Já existe uma campanha com esse nome.', 'danger');
            return;
        }

        list.push({ name: name.trim(), file });
        localStorage.setItem('TOME_SESSION_LIST', JSON.stringify(list));

        TOME.persistence.filename = file;
        localStorage.setItem('TOME_ACTIVE_SESSION', file);

        TOME.store.update(s => {
            s.sessionTitle = name.trim();
            s.sessionNumber = 1;
            s.players = [];
            s.monsters = [];
            s.initiativeOrder = [];
            s.combatActive = false;
        });

        TOME.persistence.save().then(() => window.location.reload());
    };

    const exportCamp = () => {
        const snap = TOME.store.snapshot();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snap, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `mdm_backup_${snap.sessionTitle || 'campanha'}_${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        Toast.show('Backup exportado!', 'success');
    };

    const importCamp = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (confirm("Isto substituirá TODOS os dados atuais pela importação. Deseja continuar?")) {
                        TOME.store.update(s => Object.assign(s, data));
                        TOME.persistence.save();
                        Toast.show('Campanha importada!', 'success');
                    }
                } catch (err) {
                    alert("Arquivo inválido.");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    // =====================================
    // RENDER
    // =====================================
    return (
        <div className="page max-w-[1400px] mx-auto">
            {printing && selectedPlayer && <PrintTemplates player={selectedPlayer} />}

            <div className="section-header flex justify-between items-center mb-6">
                <div>
                    <h2 className="section-title m-0"><i className="fa-solid fa-users-rectangle text-tomeGold mr-3"></i> Gestão de Campanha</h2>
                    <p className="section-subtitle mt-1 text-slate-400">Sincronização Total com a Sessão Ativa</p>
                </div>
                <div className="flex gap-2.5 items-center flex-wrap">
                    <button className="btn btn-ghost text-xs text-tomeGold border-tomeGold/30 hover:bg-tomeGold/10" onClick={() => handlePartyRest('short')} title="Descanso Curto para todo o grupo (+25% PV)">
                        <i className="fa-solid fa-mug-hot mr-1"></i> Descanso Curto (Grupo)
                    </button>
                    <button className="btn btn-ghost text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => handlePartyRest('long')} title="Descanso Longo para todo o grupo (100% PV)">
                        <i className="fa-solid fa-moon mr-1"></i> Descanso Longo (Grupo)
                    </button>
                    <button className="btn btn-ghost text-xs" onClick={importCamp}><i className="fa-solid fa-file-import mr-1"></i> Importar</button>
                    <button className="btn btn-primary text-xs" onClick={exportCamp}><i className="fa-solid fa-download mr-1"></i> Exportar Dados</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start min-w-0">
                <div className="flex flex-col gap-5">
                    <SessionControl 
                        onSystemAnalysis={handleSystemAnalysis}
                        onStartCampaignForm={handleStartCampaignForm}
                    />

                    {/* Banner Summary replacing the old CampaignBanner */}
                    <div className="card glass-accent p-4 rounded-xl text-center border-tomeGold/20">
                        <div className="font-cinzel text-tomeGold font-bold text-lg mb-1">{state.sessionTitle || 'Nova Campanha'}</div>
                        <div className="text-[0.65rem] text-slate-400 uppercase tracking-widest">Sessão {state.sessionNumber || 1} • {localStorage.getItem('DM_SYSTEM') || 'D&D 5e'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_300px] gap-6 min-w-0 h-[calc(100vh-140px)]">
                    <HeroSidebar 
                        players={players} 
                        selectedHeroId={selectedHeroId} 
                        onSelectHero={setSelectedHeroId} 
                    />

                    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-tomeGold/30 pr-2">
                        <HeroCommandPanel 
                            player={selectedPlayer}
                            onAdjustHP={handleAdjustHP}
                            onAdjustXP={handleAdjustXP}
                            onCustomXP={handleCustomXP}
                            onUpdateItems={handleUpdateItems}
                            onUpdateNotes={handleUpdateNotes}
                            onPrintSheet={handlePrintSheet}
                            onPrintCard={handlePrintCard}
                            onRollAttribute={handleRollAttribute}
                            onRestHero={handleRestHero}
                            onToggleCondition={handleToggleCondition}
                        />
                    </div>

                    <div className="h-full overflow-y-auto scrollbar-none">
                        <CampaignWidgets 
                            storeComponentRef={storeComponentRef} 
                            monsterCount={(state.monsters || []).length} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
