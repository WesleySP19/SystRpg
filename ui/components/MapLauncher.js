import { Component } from '../core/Component.js';

export class MapLauncher extends Component {
    template() {
        return `
            <div class="page" style="max-width: 800px; margin: 0 auto; text-align:center; padding-top:10vh; animation: fadeIn 0.5s ease-out;">
                <div class="card glass-accent" style="padding:60px; border:2px solid var(--accent); display:flex; flex-direction:column; align-items:center;">
                    <i class="fa-solid fa-map-location-dot fa-5x" style="color:var(--accent); margin-bottom:20px;"></i>
                    <h2 style="font-family:'Cinzel'; font-size:2.5rem; color:var(--accent); margin:0;">MESA VIRTUAL DO MESTRE</h2>
                    <p style="color:var(--text-dim); margin-top:10px; margin-bottom:40px; font-size:1.1rem;">
                        O sistema de mapas agora opera em uma janela totalmente independente (Dual-Window) para garantir imersão máxima e não comprometer a visualização das suas fichas.
                    </p>
                    <button class="btn btn-primary" style="font-size:1.5rem; padding:15px 40px; border-radius:10px;" data-action="launchMap">
                        <i class="fa-solid fa-up-right-from-square"></i> Lançar Mesa em Nova Janela
                    </button>
                    <p style="font-size:0.8rem; color:var(--warning); margin-top:20px; opacity:0.7;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Certifique-se de que o navegador permite pop-ups neste site.
                    </p>
                </div>
            </div>
        `;
    }

    launchMap() {
        window.open('./master-map.html', 'TOME_MASTER_MAP', 'width=1600,height=900,menubar=no,toolbar=no,location=no,status=no');
    }
}
