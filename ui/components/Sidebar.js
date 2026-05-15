import { TOME } from '../../core/Registry.js';
import { Toast } from '../components/Toast.js';
import { Modal } from '../components/Modal.js';
import { Component } from '../core/Component.js';

/**
 * SIDEBAR v6.0
 * Unified navigation and session control center.
 */
export class Sidebar extends Component {
    template() {
        const { activeTab } = this.store.state;

        const items = [
            { id: 'dashboard', label: 'Mesa do Mestre', icon: 'fa-shield-halved' },
            { id: 'dmshield',  label: 'Escudo do Mestre', icon: 'fa-scroll' },
            { id: 'combat',    label: 'Arena de Combate', icon: 'fa-crosshairs' },
            { id: 'map',       label: 'Mapas Táticos',    icon: 'fa-map-location-dot' },
            { id: 'journal',   label: 'Diário de Sessão', icon: 'fa-book-open-reader' },
            { id: 'builder',   label: 'Codex de Heróis',  icon: 'fa-user-pen' },
            { id: 'bestiary',  label: 'Grimório de Monstros', icon: 'fa-dragon' },
            { id: 'loot',      label: 'Cofre de Itens',   icon: 'fa-coins' },
            { id: 'vault',     label: 'Cofre SRD',        icon: 'fa-book-atlas' },
            { id: 'npc',       label: 'Gerador de NPCs',  icon: 'fa-user-secret' },
            { id: 'quests',    label: 'Missões',          icon: 'fa-scroll' },
            { id: 'quickref',  label: 'Referência Rápida', icon: 'fa-book-open' },
            { id: 'campaign',  label: 'Gestão de Campanha', icon: 'fa-users-rectangle' }
        ];

        return `
            <div class="sidebar-brand">
                <div class="brand-top">
                    <h1>DOMÍNIO RPG</h1>
                    <span class="version-tag">ARCHITECT PRO v6.0</span>
                </div>
                
                <div class="brand-actions">
                    <div class="theme-switcher" data-action="toggleTheme" title="Alternar Modo Claro/Escuro">
                        <i class="fa-solid fa-moon icon-dark"></i>
                        <div class="switch-ball"></div>
                        <i class="fa-solid fa-sun icon-light"></i>
                    </div>
                </div>

                <div class="sidebar-search">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input type="text" placeholder="BUSCAR NO TOMO..." data-action="quickSearch">
                </div>
            </div>

            <nav class="sidebar-nav" style="flex:1; overflow-y:auto; padding:20px 0;">
                ${items.map(i => `
                    <button class="nav-btn ${activeTab === i.id ? 'active' : ''}"
                            data-action="navigate" data-tab="${i.id}">
                        <i class="fa-solid ${i.icon}" style="width:20px; text-align:center;"></i>
                        <span>${i.label}</span>
                    </button>
                `).join('')}
            </nav>

            <div class="sidebar-footer" style="padding:20px; border-top:1px solid var(--border-glass); background:rgba(0,0,0,0.2);">
                <!-- AUDIO CONTROLS (COMPACT) -->
                <div style="margin-bottom:20px;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                        <i class="fa-solid fa-volume-high" style="font-size:0.7rem; color:var(--primary);"></i>
                        <input type="range" min="0" max="1" step="0.1" value="0.5" style="flex:1; height:4px; accent-color:var(--primary);" data-action="setChanVol" data-channel="music">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:15px;">
                    <button class="btn btn-ghost" style="font-size:0.6rem; padding:8px;" data-action="playMusic" data-url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3">🎵 ÉPICO</button>
                    <button class="btn btn-ghost" style="font-size:0.6rem; padding:8px;" data-action="stopAllAudio">⏹️ PARAR</button>
                </div>

                <button class="btn btn-primary btn-block" style="width:100%; padding:12px; font-size:0.7rem; background:linear-gradient(135deg, var(--primary), var(--primary-dark));" data-action="finishSession">
                    <i class="fa-solid fa-flag-checkered"></i> ENCERRAR SESSÃO
                </button>

                <div style="margin-top:15px; display:flex; align-items:center; justify-content:center; gap:12px;">
                    <button class="btn btn-ghost" style="font-size:0.6rem; padding:5px 10px;" data-action="togglePartyHUD">
                        <i class="fa-solid ${this.store.state.showPartyHUD ? 'fa-eye' : 'fa-eye-slash'}"></i> VITALS
                    </button>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div style="width:6px; height:6px; background:#22c55e; border-radius:50%; box-shadow:0 0 10px #22c55e;"></div>
                        <span style="font-size:0.6rem; color:var(--text-dim); font-weight:700; letter-spacing:1px;">SYNC</span>
                    </div>
                </div>
            </div>
        `;
    }

    _ambience = null;

    playMusic(e, el) {
        TOME.audio.playChannel('music', el.dataset.url);
        Toast.show('Iniciando música épica...');
    }

    playAmb(e, el) {
        TOME.audio.playChannel('ambience', el.dataset.url);
        Toast.show('Iniciando ambiente...');
    }

    stopAllAudio() {
        TOME.audio.stopAll();
        Toast.show('Áudio encerrado.');
    }

    setChanVol(e, el) {
        TOME.audio.setChannelVolume(el.dataset.channel, el.value);
    }



    async finishSession() {
        const entries = this.store.state.journalEntries || [];
        const today = new Date().toLocaleDateString();
        const todayEntries = entries.filter(e => e.date === today);
        
        if (todayEntries.length === 0) {
            return Toast.show('Sem entradas no diário hoje para finalizar.', 'warning');
        }

        const summary = todayEntries.map(e => e.content).join('\n');
        const report = `📓 RESUMO DA SESSÃO (${today})\n\nEventos Principais:\n${summary}\n\nDeseja exportar o relatório final e encerrar a sessão?`;

        const confirmed = await Modal.confirm('Encerrar Sessão', report, 'confirm');
        if (confirmed) {
            this.exportCampaign();
            Toast.show('Relatório salvo! Sessão concluída.', 'success');
        }
    }

    setEnv(e, el) {
        const env = el.dataset.env;
        TOME.store.update(s => s.currentEnvironment = env);
        Toast.show(`Iluminação dos jogadores alterada para: ${env}`, 'info');
    }
    


    onMount() {
    }

    exportCampaign() {
        const data = JSON.stringify(this.store.state, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tome_pro_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        Toast.show('Campanha exportada com sucesso!');
    }

    importCampaign() {
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
                    Toast.show('Campanha importada!');
                    window.location.reload(); // Refresh to ensure all components sync
                } catch (err) {
                    Toast.show('Erro ao importar arquivo.', 'danger');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    navigate(e, el) {
        const tab = el.dataset.tab;
        if (tab) TOME.store.update(s => s.activeTab = tab);
    }

    toggleTheme() {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('dome-theme', next);
    }

    togglePartyHUD() {
        TOME.store.update(s => s.showPartyHUD = !s.showPartyHUD);
    }
}
