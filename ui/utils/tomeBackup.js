/**
 * tomeBackup.js
 * Utilitário de Exportação e Restauração de Campanhas em Arquivo (.tome)
 * Garante autonomia 100% offline e portabilidade do sistema para USB / Pendrives.
 */

export function exportCampaignBackup(store) {
    if (!store || !store.state) {
        alert("Erro: Nenhuma campanha ativa carregada para backup.");
        return;
    }

    try {
        const state = store.state;
        const exportData = {
            tomeVersion: "3.0.0",
            exportTimestamp: Date.now(),
            exportDateFormatted: new Date().toLocaleString('pt-BR'),
            campaignTitle: state.title || state.nome || "Campanha_Elo_Arcano",
            state: state
        };

        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        const safeName = String(exportData.campaignTitle).replace(/[^a-zA-Z0-9_-]/g, '_');
        a.href = url;
        a.download = `${safeName}_backup_${new Date().toISOString().slice(0, 10)}.tome`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log(`[TomeBackup] Arquivo .tome gerado com sucesso (${(jsonStr.length / 1024).toFixed(2)} KB).`);
    } catch (err) {
        console.error("Falha na exportação da campanha:", err);
        alert("Erro ao gerar arquivo de backup: " + err.message);
    }
}

export function importCampaignBackup(store, onSuccessCallback) {
    if (!store) {
        alert("Store não inicializada.");
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.tome,.json';
    
    input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            try {
                const content = JSON.parse(readerEvent.target.result);
                const restoredState = content.state || content;
                
                if (confirm(`📦 Deseja restaurar a campanha "${content.campaignTitle || file.name}"? Todos os dados atuais não salvos serão substituídos pelo backup de ${content.exportDateFormatted || 'data desconhecida'}.`)) {
                    // Atualiza o store
                    if (typeof store.replaceState === 'function') {
                        store.replaceState(restoredState);
                    } else {
                        store.state = restoredState;
                        if (typeof store.notify === 'function') store.notify();
                    }

                    // Sincroniza com o servidor local em /api se disponível
                    fetch('/api/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ state: restoredState })
                    }).catch(() => {});

                    alert("✨ Campanha restaurada com sucesso! O Grimório, Diários, NPCs e Mapas foram atualizados.");
                    if (typeof onSuccessCallback === 'function') onSuccessCallback(restoredState);
                }
            } catch (err) {
                console.error("Arquivo corrompido ou inválido:", err);
                alert("O arquivo selecionado não é um backup .tome válido.");
            }
        };
        reader.readAsText(file);
    };

    input.click();
}
