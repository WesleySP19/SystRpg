# Roadmap de Evolução V22: The Atomic Engine

Este é o plano de execução mestre para escalar a "Mesa Psigologos" em um produto definitivo e de nível comercial. A evolução será dividida em 6 fases cirúrgicas. Avançaremos uma fase por vez para garantir estabilidade contínua ("zero quebras").

---

## FASE 1: Fundação Arquitetural e Modernização da UI
**Objetivo:** Eliminar de vez os bugs silenciosos de HTML, modernizar o re-render do Preact e padronizar as interfaces com JSX nativo.

- **1.1. Refatoração Gradativa JSX (CONCLUÍDO):** Converter os quase 50 componentes da pasta `/ui/components` (começando por `AuthScreen`, `Dashboard`, e `PlayerForm`) para `.jsx`.
- **1.2. Separação de Responsabilidades (CONCLUÍDO):** Extrair lógicas pesadas de dentro dos componentes para `hooks` (`useCombat`, `useSpells`, `useHeroData`).
- **1.3. Otimização Tailwind (EM EXECUÇÃO):** Eliminar estilos inline redundantes, adotando Tailwind nativo para os componentes convertidos.

---

### Detalhamento da FASE 1.3 (Otimização Tailwind)

Agora que os componentes estão em React/JSX, eles ainda estão sobrecarregados com estilos inline literais (ex: `style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(197,160,89,0.2)' }}`). Isso gera um "bloat" no código e dificulta a manutenção de um Design System consistente.

#### Proposta de Execução:
1. **Refatoração do `SpellBook.jsx`:** Limpar completamente os estilos inline e substitui-los por utilitários Tailwind configurados no `tailwind.config.js` (`p-4 rounded-xl border border-tomeGold/20 bg-black/40 text-gray-200`).
2. **Refatoração do Módulo do Jogador (`PlayerForm.jsx` e suas sub-abas):** 
   - Substituir layouts de `grid` estáticos por `grid-cols-4 gap-5`.
   - Limpar atributos `style` substituindo pelas cores configuradas (`text-tomeGold`, `bg-obsidian-800`).
3. **Refatoração do `CombatTrackerV19.jsx`:** Otimizar a listagem de combatentes para usar classes flexbox utilitárias do Tailwind.

> [!TIP]
> **Performance do Build**
> Substituir os estilos inline por Tailwind resultará em uma injeção otimizada de CSS pelo Vite. Isso melhorará a legibilidade do código e deixará os componentes JSX esteticamente padronizados com o restante da aplicação.

## FASE 2: Data Layer e Offline-First (No Backlog)
**Objetivo:** Transicionar a persistência de dados para uma arquitetura "Local-First", garantindo que a aplicação funcione perfeitamente sem internet e sincronize de forma inteligente.
- **2.1. Integração IndexedDB:** Migrar o armazenamento de estado da aplicação (personagens, campanhas, inventário) para um wrapper robusto de IndexedDB (ex: Dexie.js).
- **2.2. Sincronização CRDT (Yjs):** Implementar estruturas de dados CRDT usando Yjs para lidar com edições colaborativas em tempo real, resolvendo conflitos automaticamente quando a conexão retornar.
- **2.3. Sincronização em Segundo Plano:** Implementar Service Workers para garantir atualizações silenciosas e suporte offline completo (PWA).

## FASE 3: Motor Tático Acelerado (No Backlog)
**Objetivo:** Substituir componentes pesados de DOM no grid de batalha por renderização otimizada via Canvas/WebGL.
- **3.1. Konva.js Core:** Reescrever o sistema de "Battlemap" utilizando a biblioteca Konva.js, permitindo renderizar milhares de tokens a 60 FPS.
- **3.2. Efeitos Visuais (WebGL):** Adicionar suporte nativo para névoa de guerra (Fog of War) dinâmica e iluminação em tempo real baseada na linha de visão.
- **3.3. Gestão de Assets:** Sistema inteligente de preload e caching de imagens de mapas e tokens para evitar gargalos de rede e memória.

## FASE 4: Módulos Customizáveis (No Backlog)
**Objetivo:** Permitir que o sistema seja "System Agnostic", acomodando qualquer sistema de RPG através de configuração.
- **4.1. Importador JSON:** Desenvolver um interpretador que lê regras de sistema (fórmulas de dado, atributos, perícias) a partir de um esquema JSON flexível.
- **4.2. Fichas Dinâmicas:** Interface do jogador auto-adaptável que renderiza abas e campos dinamicamente conforme os atributos definidos pelo arquivo de configuração.
- **4.3. Ecossistema de Módulos:** Criação de ferramentas para importar e exportar pacotes de sistemas (Homebrews) desenvolvidos pela comunidade.

## FASE 5: Hub de Comunicação (No Backlog)
**Objetivo:** Centralizar a comunicação de voz, vídeo e dados diretamente na plataforma sem depender de servidores caros.
- **5.1. P2P Data Channels:** Implementar WebRTC nativo para trocar estados de jogo (rolagens de dado, movimento) diretamente entre clientes com baixíssima latência.
- **5.2. Voz e Vídeo Integrados:** Adicionar canais de mídia WebRTC para dispensar o uso de Discord ou ferramentas externas.
- **5.3. Servidor de Sinalização Leve:** Subir um servidor básico (ex: WebSocket/Socket.io) apenas para mediar os "handshakes" iniciais das conexões WebRTC.

## FASE 6: Oráculo Mestre (No Backlog)
**Objetivo:** Embutir Inteligência Artificial como assistente do Mestre, rodando de forma privada e sem custos de nuvem recorrentes.
- **6.1. Modelos Locais (WebLLM):** Integrar suporte para baixar e rodar LLMs pequenos diretamente no navegador do mestre, ou conectá-los via API local (Ollama).
- **6.2. Geração Contextual:** Oráculo capaz de ler as anotações do mestre, gerar NPCs on-the-fly, ideias para encontros e descrever ambientes de forma imersiva.
- **6.3. Transcrição / Resumo de Sessão:** Utilizar modelos de Speech-to-Text em tempo real (Whisper) para registrar a narrativa e resumir o diário da sessão automaticamente.

## FASE 7: Otimização de Performance e Refatoração (Em Planejamento)
**Objetivo:** Refinar a arquitetura construída nas fases anteriores focando em performance, fluidez, menor consumo de memória e modernização da base de código.

- **7.1. Refatoração CSS (Migração para Tailwind):** 
  Remover mais de 2.000 ocorrências de estilos inline (`style="..."`) encontrados nos componentes de UI (como `HeroExporter.js`, `PlayerForm.jsx` etc) e convertê-los para classes utilitárias puras do Tailwind. Isso reduzirá drasticamente o peso do DOM e a carga no motor de CSS do navegador.
- **7.2. Otimização de Renderização WebGL (Konva.js):** 
  Desativar as propriedades `listening` e habilitar `perfectDrawEnabled={false}` nas camadas estáticas do grid tático (como o Background e a Névoa de Guerra). Além disso, cachear vetores complexos (`node.cache()`) para aliviar os ciclos de GPU e garantir os 60 FPS estáveis mesmo com milhares de tokens.
- **7.3. Gerenciamento de Estado de Alta Frequência (Preact Signals):** 
  Atualmente, o `Store.js` re-renderiza árvores inteiras de componentes em atualizações bruscas. Substituiremos propriedades voláteis (como rastreio de mouse, arrastar tokens e barras de vida) para `Signals`, permitindo que o estado atualize diretamente a UI sem sobrecarregar o Virtual DOM.
- **7.4. Pipeline de Assets e Code-Splitting:** 
  Implementar carregamento preguiçoso (`React.lazy` / Imports dinâmicos) para módulos pesados, como o motor 3D de rolagem de dados (`DiceBoxService.js`) e os Workers de Inteligência Artificial. Adicionalmente, converter avatares em cache e banco de dados para WebP, economizando latência de rede e heap memory.

> [!IMPORTANT]
> **Ação Imediata para Aprovação**
> Podemos iniciar a FASE 7 dividindo-a. Qual dos itens acima (7.1, 7.2, 7.3 ou 7.4) você considera mais urgente para otimizarmos agora?
