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
(Detalhes da migração IndexedDB nativo e CRDT/Yjs)

## FASE 3: Motor Tático Acelerado (No Backlog)
(Detalhes do Konva.js e WebGL)

## FASE 4: Módulos Customizáveis (No Backlog)
(Detalhes do importador de JSON e atributos dinâmicos)

## FASE 5: Hub de Comunicação (No Backlog)
(WebRTC Peer-to-Peer Nativo)

## FASE 6: Oráculo Mestre (No Backlog)
(Integração IA Offline Local)
