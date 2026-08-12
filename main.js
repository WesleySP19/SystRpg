import { TOME } from './core/Registry.js';
import { AudioService } from './services/AudioService.js';
import { AIService } from './services/AIService.js';
import { PersistenceService } from './core/PersistenceService.js';
import { Sidebar } from './ui/components/Sidebar.js';
import { Dashboard } from './ui/pages/Dashboard.js';
import { Dice } from './utils/Dice.js';
import { AuthScreen } from './ui/components/AuthScreen.js';
import { IndexedDBService } from './services/IndexedDBService.js';
import { TelemetryService } from './services/TelemetryService.js';
import { FXEngine } from './services/FXEngine.js';

import './assets/tailwind.css';
import './assets/tome-master.css';

(async () => {
    if (window.location.search.includes('reset=1')) {
        localStorage.removeItem('DM_JWT_TOKEN');
        localStorage.removeItem('DM_ACTIVE_TABLE');
        window.location.search = '';
        return;
    }

    // Carrega a lógica de inicialização de forma modular
    const { startApp } = await import('./ui/Boot.js');

    const token = localStorage.getItem('DM_JWT_TOKEN');
    if (!token) {
        const { AuthScreen } = await import('./ui/components/AuthScreen.js');
        const auth = new AuthScreen({ 
            element: document.getElementById('view-target'),
            onLogin: () => startApp()
        });
        auth.mount();
        return; // Bloqueia o carregamento até logar e escolher mesa
    }

    startApp().catch(error => {
        console.error('[Boot] Falhou:', error);
        document.getElementById('view-target').innerHTML = `
            <div style="padding:3rem; color:#f43f5e; text-align:center; font-family:system-ui;">
                <h2>Erro de Inicializacao</h2>
                <p style="color:#7a7a8e;">${error && error.message ? error.message : error}</p>
                <p style="margin-top:20px;">
                <a href="/index.html?reset=1" style="color:#fbbf24; text-decoration:underline;">
                    Limpar cache e tentar novamente
                </a>
                </p>
            </div>
        `;
    });
})();
