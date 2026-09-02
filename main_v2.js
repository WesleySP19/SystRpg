(async () => {
    if (window.location.search.includes('reset=1')) {
        localStorage.removeItem('DM_JWT_TOKEN');
        localStorage.removeItem('DM_ACTIVE_TABLE');
        window.location.search = '';
        return;
    }

    try {
        const { startApp } = await import('./ui/Boot.js');
        await startApp();
    } catch (error) {
        console.error('[Boot] Falhou:', error);
        const root = document.getElementById('app-root') || document.body;
        root.innerHTML = `
            <div style="padding:3rem; color:#f43f5e; text-align:center; font-family:system-ui; background:#050508; min-height:100vh;">
                <h2>Erro de Inicialização</h2>
                <p style="color:#7a7a8e;">${error && error.message ? error.message : error}</p>
                <p style="margin-top:20px;">
                    <a href="/index.html?reset=1" style="color:#fbbf24; text-decoration:underline;">
                        Limpar cache e tentar novamente
                    </a>
                </p>
            </div>
        `;
    }
})();
