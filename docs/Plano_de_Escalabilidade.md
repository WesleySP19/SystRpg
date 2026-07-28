# 📈 Plano Estratégico de Escalabilidade — Mesa do Mestre v10.0

Este documento descreve o plano detalhado de escalabilidade para transformar a **Mesa do Mestre** de uma ferramenta local (rodando em PowerShell/Windows) em uma aplicação distribuída de alta concorrência na nuvem, dividida por fases, temas e tarefas detalhadas.

---

## 🗺️ Visão Geral das Fases de Evolução

```
Fase 1: Estabilização Local ──► Fase 2: Modernização & Bundling ──► Fase 3: Cloud & Multi-User ──► Fase 4: Observabilidade & CI/CD
  (Resiliência local/IDB)          (Migrar PowerShell/Vite)          (PostgreSQL/WebSockets)          (Sentry/Métricas/Telemetria)
```

---

## 🚀 Cronograma de Escalabilidade por Fases

---

### 🛡️ FASE 1: Estabilização Local e Desacoplamento de Armazenamento
**Foco:** Otimizar o uso de hardware local do Mestre e resolver gargalos de limites físicos do navegador.

#### Tema 1.1: Gestão de Cache e Banco Local (IndexedDB)
*   **Task 1.1.1 — Migração de Ativos Pesados:** Refatorar todos os fluxos de criação de monstros customizados e upload de mapas para usar obrigatoriamente referências IndexedDB (`db://`), liberando o LocalStorage exclusivamente para chaves de navegação leves.
*   **Task 1.1.2 — Purga Automática de Sessões Inativas:** Adicionar uma rotina no bootstrap que detecta e remove snapshots locais ou dados de sessões não acessados há mais de 30 dias para evitar o esgotamento do disco rígido do dispositivo host.

#### Tema 1.2: Acoplamento e Frequência de Rede Local (LAN)
*   **Task 1.2.1 — Polling Inteligente e Adaptativo:** Substituir o intervalo fixo de 1.5s no `player-view.html` por um ciclo dinâmico:
    *   **Aba em background:** Polling reduzido para 5000ms.
    *   **Modo de Exploração (Ambiente):** Polling em 3000ms.
    *   **Modo de Combate Ativo:** Polling elevado para 1000ms.
*   **Task 1.2.2 — Desduplicação de Requisições AJAX:** Caso o Mestre abra múltiplas abas da visão de jogador na mesma máquina, redirecionar a leitura para o `BroadcastChannel` compartilhado em vez de concorrer por requisições de rede ao backend local.

---

### ⚡ FASE 2: Transição de Bundling e Servidor Multiplataforma
**Foco:** Preparar o projeto para deploy em qualquer sistema operacional (Linux, macOS, Windows) e minificar o código.

#### Tema 2.1: Empacotamento Moderno (Frontend Build Tooling)
*   **Task 2.1.1 — Migração para Vite (SPA):** Configurar o Vite como bundler do projeto frontend. Permitir o uso de importações ES6 minificadas, treeshaking de funções não utilizadas do `RulesEngine.js` e suporte futuro a frameworks como React ou Vue se a complexidade exigir.
*   **Task 2.1.2 — Compressão Avançada de Mídias (Pipeline de Assets):** Adicionar rotina de compressão automática para imagens enviadas via `/api/upload` no servidor, convertendo imagens brutas em formato altamente comprimido **WebP** responsivo.

#### Tema 2.2: Backend Multiplataforma (Docker & Node/Python)
*   **Task 2.2.1 — Migração do PowerShell para Node.js (Express):** Substituir o backend `server.ps1` por um servidor leve em **Node.js (Express)** ou **Python (FastAPI)**. Isso remove a dependência exclusiva do Windows PowerShell (v5.1+) e permite rodar o servidor em máquinas Linux e macOS nativamente.
*   **Task 2.2.2 — Conteinerização (Docker):** Criar um `Dockerfile` e um `docker-compose.yml` para empacotar a aplicação completa. Garante que qualquer usuário ou servidor de nuvem possa rodar o Mesa do Mestre instantaneamente com `docker compose up`.

---

### ☁️ FASE 3: Cloud, Autenticação Real e Sincronização Massiva
**Foco:** Tornar a plataforma global, permitindo múltiplos mestres independentes com persistência centralizada.

#### Tema 3.1: Persistência Robusta e Concorrente (Banco de Dados)
*   **Task 3.1.1 — Migração de Arquivos JSON para PostgreSQL/MongoDB:** Substituir a pasta física `/data` por um banco de dados estruturado concorrente. O **PostgreSQL** é recomendado para gerenciar perfis, fichas e histórico, enquanto o **MongoDB** pode guardar os esquemas dinâmicos das campanhas e diários.
*   **Task 3.1.2 — Autenticação e Segurança de Sessão (JWT):** Substituir a tela de login estática/SMS simulado em [AuthScreen.js](file:///c:/Users/02751132138/Documents/Nova%20pasta/RPGPsigologos/ui/components/AuthScreen.js) por um fluxo de autenticação robusto usando JWT (JSON Web Tokens) criptografados.

#### Tema 3.2: Sincronização em Tempo Real na Nuvem (WebSockets)
*   **Task 3.2.1 — Migração para WebSockets (Socket.io):** Substituir o polling de arquivos físicos JSON por conexões WebSocket bidirecionais ativas. Quando o mestre mover um token ou alterar o Fog of War no mapa tático, a mudança é propagada instantaneamente para todos os jogadores conectados na nuvem em milissegundos.
*   **Task 3.2.2 — Suporte Multi-Dispositivo (Responsividade Total):** Refatorar o `player-view.html` para ser 100% responsivo, otimizado para celulares e tablets (permite que os jogadores acompanhem a iniciativa e mapa em suas próprias telas físicas de jogo local ou remoto).

---

### 📊 FASE 4: Observabilidade, Qualidade e CI/CD
**Foco:** Garantir alta disponibilidade, detecção precoce de erros e processos automatizados de entrega.

#### Tema 4.1: Qualidade Contínua (CI/CD Pipelines)
*   **Task 4.1.1 — Integração de Testes Automatizados:** Implementar suíte de testes de integração com Jest para regras de D&D 5e e rolagens críticas do `Dice.js`.
*   **Task 4.1.2 — CI/CD com GitHub Actions:** Configurar pipeline de deploy contínuo que roda linters de Javascript e CSS, executa testes e gera a imagem de Docker automaticamente a cada alteração aprovada no branch principal.

#### Tema 4.2: Monitoramento de Erros e Performance (Telemetria)
*   **Task 4.2.1 — Integração com Sentry:** Configurar o Sentry no frontend e backend para capturar erros em tempo real e notificar os desenvolvedores antes que afetem sessões de RPG ativas.
*   **Task 4.2.2 — Métricas de Performance do Usuário (Web Vitals):** Capturar métricas de FPS de renderização do mapa e tempos de sincronização de rede local para evitar gargalos em dispositivos antigos.

---

### 📂 Como Gerenciar este Plano
1.  **Ordem Técnica Recomendada:** Siga a numeração das Fases (1 a 4) para evitar retrabalho arquitetural.
2.  **Transição Sem Paradas:** As modificações da Fase 1 e 2 garantem que a versão LAN offline continue funcionando perfeitamente enquanto a fundação da Fase 3 e 4 é implementada para a nuvem.
