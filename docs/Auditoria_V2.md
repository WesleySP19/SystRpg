# 🛡️ Relatório de Auditoria Técnica e Coerência — Versão 2.0 (Mesa do Mestre)

**Data:** 28 de Maio de 2026  
**Escopo Auditado:** Arquitetura de Redundância, Inicialização Dinâmica de Porta, PWA/Offline-First, Sincronização em Tempo Real (Player View), IA e Grimório de Componentes.  
**Auditor:** Antigravity (Google DeepMind Team)

---

## 1. Diagnóstico Executivo

### Avaliação Geral (Comparativo de Evolução)
*   **Arquitetura e Coerência:** 9/10 *(Anterior: 5/10)*
*   **Confiabilidade Funcional:** 8.5/10 *(Anterior: 4/10)*
*   **Aderência D&D 5e (Regras):** 8/10 *(Anterior: 4/10)*
*   **Segurança e Persistência:** 9/10 *(Anterior: 3/10)*
*   **Desempenho e Offline-First:** 7.5/10 *(Anterior: 4/10)*

**Resumo:** O projeto evoluiu significativamente. A implementação do **Sistema Dinâmico de Porta com Fallback (v2.0)** e a correção das quebras críticas de combate e IA trouxeram grande estabilidade e profissionalismo à plataforma. O sistema agora funciona de forma autônoma e resiliente no Windows. 

No entanto, identificamos **um achado estrutural importante** referente ao armazenamento local de imagens offline, detalhado na seção 4.

---

## 2. Visão de Funcionamento do Sistema (Mesa do Mestre v10.0)

O sistema opera sob uma arquitetura modular Vanilla JS moderna no frontend e persistência local atômica em arquivos físicos JSON gerenciada por um servidor de ultra-performance em PowerShell.

```
                  ┌────────────────────────────────────────┐
                  │          MesadoMestre.vbs              │  (Inicializador / Launcher)
                  └──────────────────┬─────────────────────┘
                                     │ (Verifica portas / Limpa órfãos)
                                     ▼
                  ┌────────────────────────────────────────┐
                  │             server.ps1                 │  (Servidor HTTP / PowerShell)
                  └──────────────────┬─────────────────────┘
                                     │ (Serve HTML estático & APIs de Save/Upload)
                                     ▼
        ┌────────────────────────────┴────────────────────────────┐
        ▼                                                         ▼
┌─────────────────────────────────┐                     ┌─────────────────────────────────┐
│     index.html (Mestre)         │                     │     player-view.html (Jogadores)│
├─────────────────────────────────┤                     ├─────────────────────────────────┤
│ • Store Reativo via Proxy       │                     │ • Polling de 500ms (/data/)     │
│ • Sidebar & Dashboard dinâmico  │◄───[Broadcast]─────►│ • Ordem de Iniciativa HUD       │
│ • AudioService & AIService      │   (tome_map & ref)  │ • Visualização de Mapa & Fog    │
│ • Carga Atômica /data/mesa_*.js │                     │ • Sem LocalStorage direto       │
└─────────────────────────────────┘                     └─────────────────────────────────┘
```

### 2.1 Fluxo de Inicialização e Segurança de Portas (v2.0)
1.  **Launcher VBScript (`MesadoMestre.vbs`):** Resolve caminhos dinamicamente, busca portas configuradas em variáveis de ambiente (`PORT` ou `SERVER_PORT`) e testa a disponibilidade na lista de candidatos (`8000`, `8080`, `8001`). Se uma porta estiver travada por processos órfãos anteriores, limpa a porta silenciosamente via PowerShell ou `taskkill` antes de rodar o servidor.
2.  **Health-check Inteligente:** O VBScript faz requisições em background com *back-off* progressivo até obter resposta HTTP 200/304, abrindo o navegador do mestre apenas quando o servidor está 100% pronto.
3.  **PowerShell Backend (`server.ps1`):** Inicia o `HttpListener` na porta autorizada e expõe duas rotas de API robustas:
    *   `/api/save`: Sanitiza o nome do arquivo (`filename`) removendo caracteres inválidos e impedindo ataques de *Path Traversal*. Persiste o estado completo de forma atômica no formato JSON na pasta `/data/`.
    *   `/api/upload`: Recebe imagens customizadas em Base64 (como retratos de heróis e monstros), decodifica e grava fisicamente em `/public/uploads/`, retornando a URL relativa para o frontend.

---

## 3. Status dos Achados Anteriores (Auditoria v1.0)

A grande maioria dos problemas críticos (P0 e P1) detectados na auditoria anterior foram **totalmente resolvidos**:

| Categoria | Achado Original (v1.0) | Status Atual | Detalhes da Resolução |
| :--- | :--- | :--- | :--- |
| **P0** | Integração IA quebrada no NPC Generator | **Resolvido** | `AIService.js` implementa `ask(prompt)` com validação e fallback local estruturado. |
| **P0** | Métodos duplicados no `CombatTracker` | **Resolvido** | Removidos os métodos redundantes `setTarget` e `toggleConcentration`. |
| **P0** | Navegação de loot pós-combate quebrada | **Resolvido** | `finishBattle()` agora altera diretamente o estado do roteador reativo (`activeTab = 'loot'`). |
| **P0** | Inconsistência no monstro Bestiary | **Resolvido** | Modal de detalhes do monstro agora é aberto inline no `CombatTracker` usando estado interno do componente (`_showDetailsId`). |
| **P0** | Sincronização quebrada com `player-view.html` | **Resolvido** | Unificada a sincronização do LocalStorage utilizando a chave da sessão ativa (`TOME_PRO_STATE_` + `activeSession`). |
| **P1** | Risco de Path Traversal no salvamento | **Resolvido** | Nome do arquivo sanitizado no PowerShell com `[System.IO.Path]::GetFileName` e exclusão de caracteres não-alfanuméricos. |
| **P1** | Chave de Schema duplicada (`equipment`) | **Resolvido** | `data/schemas.js` limpo, sem chaves repetidas e com `deepMerge` robusto para importação de dados. |
| **P1** | Deriva de roteamento de abas no Dashboard | **Resolvido** | Mapeamento no `Dashboard.js` corrigido para os arquivos e classes consolidados. |

---

## 4. Novo Achado Crítico: Serviço de Banco de Dados Órfão (IndexedDB)

> [!WARNING]
> **Detecção de Componente Órfão (IndexedDBService):**
> O arquivo [IndexedDBService.js](file:///c:/Users/02751132138/Documents/Nova%20pasta/RPGPsigologos/services/IndexedDBService.js) está totalmente isolado no projeto. Ele não é importado em `index.html` nem no bootstrap da aplicação, impossibilitando a inicialização de `window.TOME.db`.

### Impacto Mecânico no Sistema:
1.  **Contingência do LocalStorage sob Risco:** Em `PersistenceService.js` (linhas 638-667), o método `_restoreMedia` tenta resolver URLs marcadas com `db://` utilizando `window.TOME.db.getMedia(key)`. Como o serviço nunca é inicializado, as mídias offline salvas localmente falham ao carregar.
2.  **Atingimento de Cota de LocalStorage:** Sem o IndexedDB ativo para guardar imagens pesadas em Base64 localmente, o `PersistenceService` é obrigado a salvar imagens direto nas strings de LocalStorage. Se o usuário estiver offline e adicionar muitas imagens customizadas, ultrapassará rapidamente o limite de **5MB** do LocalStorage, disparando a remoção automática de snapshots e perda de históricos locais.

---

## 5. Recomendações de Melhoria e Próximos Passos

### Curto Prazo (Estabilização do Banco Offline)
*   **Importar e registrar o `IndexedDBService` no bootstrap:**
    No arquivo [index.html](file:///c:/Users/02751132138/Documents/Nova%20pasta/RPGPsigologos/index.html), adicionar a importação do serviço e inicializar `TOME.db` durante a rotina de boot:
    ```javascript
    import { IndexedDBService } from './services/IndexedDBService.js';
    // ... no bootstrap:
    const idb = new IndexedDBService();
    await idb.init();
    TOME.db = idb;
    window.TOME.db = idb;
    ```
    Isso ativa imediatamente a persistência resiliente de imagens em cache local offline, liberando o LocalStorage para dados leves.

### Médio Prazo (Otimização de Desempenho LAN)
*   **Substituir Polling no Player View:**
    Atualmente, o `player-view.html` executa uma requisição `fetch` de 500ms para `/data/mesa_*.json`. Em mesas de LAN locais, isso funciona bem, mas gera overhead desnecessário no servidor PowerShell. Recomenda-se aumentar o tempo de polling para 1.5s ou implementar eventos via `BroadcastChannel` integrados quando executados no mesmo dispositivo (ou Server-Sent Events / WebSockets no servidor powershell para multidevice).

### Longo Prazo (Imersão e Segurança)
*   **Suporte a HTTPS:** Adicionar comandos de bind de certificado SSL no PowerShell caso o mestre decida expor o servidor para a internet.
*   **Grimório SRD Completo:** Integrar um JSON com todas as magias do SRD 5.1 diretamente no repositório de dados para evitar consultas de rede externas.
