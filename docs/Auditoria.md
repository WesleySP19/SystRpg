# Auditoria Técnica e de Coerência — RPGPsigologos (D&D 5e)

Data: 2026-05-15  
Escopo auditado: `core/`, `data/`, `engine/`, `services/`, `ui/`, `index.html`, `player-view.html`, `server.ps1`, `README.md`.

## 1) Diagnóstico executivo

### Nota geral (estado atual)
- **Arquitetura e coerência**: 5/10
- **Confiabilidade funcional**: 4/10
- **Aderência D&D 5e (regras)**: 4/10
- **Segurança e persistência**: 3/10
- **Manutenibilidade**: 4/10

**Resumo**: o projeto tem boa ambição e muitos módulos úteis para mesa de RPG, mas está com **deriva arquitetural** (versões antigas/novas convivendo), vários pontos de integração quebrados e inconsistências de estado que reduzem a confiabilidade para sessões longas.

---

## 2) Funcionamento atual (como o sistema está operando)

## 2.1 Boot e fluxo principal
- `index.html` registra `AudioService`, `AIService` e `PersistenceService`, carrega estado e monta `Sidebar` + `Dashboard`.
- Renderização via componentes customizados (`ui/core/Component.js`) com `Store` reativo por `Proxy`.
- Navegação da aplicação acontece por `activeTab` no estado global.

## 2.2 Persistência
- Salva estado completo via `POST /api/save` e backup local.
- Carrega preferencialmente de `data/state.json`; fallback para `localStorage` backup.

## 2.3 Mapa tático
- `MapManager` usa `GridEngine`, `TokenEngine`, `FogEngine`, `EffectEngine`, `VisionEngine`.
- Player view recebe updates por `BroadcastChannel`.

## 2.4 Módulos de jogo
- Fichas de personagem (PlayerForm), bestiário/formulário de monstros, combate, loot, quests, diário e referência de regras.

---

## 3) Achados de auditoria (priorizados)

## P0 — Críticos (afetam funcionamento/sessão em tempo real)

1. **Integração IA quebrada no gerador de NPC**
- `NPCHelper` chama `TOME.ai.ask(...)`, mas `AIService` não implementa `ask()`.
- Resultado: geração por IA falha e cai no fallback local.

2. **Combate com métodos duplicados (sobrescrita acidental)**
- `CombatTracker` possui `setTarget` e `toggleConcentration` duplicados.
- A segunda definição sobrescreve a primeira, quebrando parte da lógica (incluindo seleção multi-alvo de monstros).

3. **Navegação de loot pós-combate não funciona**
- `finishBattle()` tenta clicar em seletor inexistente (`[data-page="LootGenerator"]`), sem redirecionamento real.

4. **Visualização de detalhes do monstro inconsistente**
- `showMonsterDetails()` muda aba para bestiário, mas modal interno depende de `_showDetailsId` (não é setado nesse fluxo).

5. **Sincronização de estado com `player-view.html` inconsistente**
- Player view lê `TOME_PRO_STATE`, enquanto persistência escreve `TOME_PRO_STATE_BACKUP` e arquivo JSON.
- Resultado: parte dos dados não sincroniza como esperado via localStorage.

## P1 — Alta prioridade (qualidade/regras/consistência)

1. **Deriva de componentes e roteamento**
- `Dashboard` aponta `dmshield` para `WorldBuilder.js` (classe `DMShield`), enquanto existe `ui/components/DMShield.js` (módulo diferente).
- Também existe `ui/pages/Bestiary.js`, mas o tab `bestiary` carrega `MonsterForm.js`.

2. **Aba inválida no Bestiary page**
- `ui/pages/Bestiary.js` define `activeTab = 'MonsterForm'`, valor não reconhecido pelo roteamento atual.

3. **Schema de player com chave duplicada**
- `data/schemas.js` define `equipment` duas vezes; a primeira é sobrescrita silenciosamente.

4. **Persistência sem validação/normalização**
- Estado é mesclado com `Object.assign` sem migração de versão ou validação de schema.

5. **Risco de path traversal na API de salvamento**
- `server.ps1` recebe `filename` do cliente e grava direto sem sanitização.

6. **`ContentType` potencialmente incorreto no servidor**
- Uso de `-or` para fallback de string em PowerShell pode resultar em valor booleano ao invés de MIME string.

## P2 — Médio prazo (qualidade 5e e arquitetura)

1. **Aderência parcial ao D&D 5e**
- Tabelas de encontro/XP simplificadas e incompletas.
- Regras de condições, concentração e morte não estão totalmente consistentes entre módulos.

2. **Parser de dados limitado**
- `Dice.roll()` só cobre notação simples (`NdM +/- X`) e não suporta keep/drop/adv/disadv por notação.

3. **MapManager não restaura completamente estado salvo**
- Fog/effects são serializados, mas restauração no mount é parcial.

4. **Documentação desalinhada**
- `README.md` descreve stack React/Vite/Node/SQLite, mas repositório atual é app JS modular + servidor PowerShell.

---

## 4) Coerência interna (arquitetura, dados e UX)

## 4.1 Pontos fortes
- Separação por domínios (`core`, `engine`, `services`, `ui`).
- Store reativo simples e funcional.
- UI rica em ferramentas de mestre, incluindo mapa tático e HUD.
- Persistência com fallback local.

## 4.2 Falhas de coerência
- **Dois ou mais caminhos para mesma funcionalidade** (DMShield/WorldBuilder, Bestiary page/MonsterForm).
- **Formato de dados heterogêneo** para combatentes (`init`, `initiative`, `roll`, `hp.current`, `hp_current`).
- **Integrações quebradas** por acoplamento implícito e falta de contratos de dados.

---

## 5) Auditoria D&D 5e (regras e fidelidade)

### Estado atual
- **Condições**: presentes, mas efeitos mecânicos não centralizados em engine única.
- **Iniciativa e economia de ações**: parcialmente implementadas, inconsistentes entre módulos.
- **Morte e concentração**: implementadas de forma fragmentada (tipos divergentes).
- **Encontros e loot**: simplificados, sem cobertura completa DMG/SRD.

### Para elevar nível “mesa confiável 5e”
1. Criar **RulesEngine central** com:
   - vantagem/desvantagem,
   - cálculo de acerto vs CA,
   - save DC,
   - concentração,
   - condições como efeitos aplicáveis.
2. Definir **schema canônico** de combatente (player/monster token).
3. Migrar encounter/loot para tabelas completas SRD/DMG.
4. Criar suíte de testes focada em regras (golden tests).

---

## 6) Plano de melhoria recomendado (prático e incremental)

## Fase 1 — Estabilização (1 a 3 dias)
- Corrigir chamadas IA (`ask`) e alinhar com `AIService`.
- Remover métodos duplicados no `CombatTracker`.
- Corrigir redirecionamento pós-combate para `activeTab = 'loot'`.
- Unificar chave de sync para player view (`TOME_PRO_STATE` vs backup).
- Sanear `server.ps1` (`filename`, content-type fallback).

## Fase 2 — Coerência de domínio (3 a 7 dias)
- Definir tipos canônicos:
  - `Player`,
  - `Monster`,
  - `Combatant`,
  - `Token`.
- Adaptadores únicos de transformação (`toCombatant`, `toToken`).
- Remover módulos órfãos/duplicados ou consolidar (DMShield/WorldBuilder, Bestiary/MonsterForm).

## Fase 3 — Fidelidade D&D 5e (1 a 2 semanas)
- Implementar `RulesEngine` (central e testável).
- Atualizar encounter XP thresholds 1–20 + multiplicadores por tamanho de grupo.
- Unificar condições/efeitos com aplicação mecânica.
- Revisar Quick Reference para estrita aderência SRD 5.1.

## Fase 4 — Qualidade contínua
- Introduzir lint + testes automáticos (unitários rápidos).
- Versionamento de schema de save (`stateVersion`) e migrações.
- Telemetria de erro local (logs estruturados).

---

## 7) Backlog técnico priorizado (resumo)

### P0 (executar primeiro)
- [ ] Corrigir `NPCHelper` para endpoint real de IA.
- [ ] Corrigir sobrescritas em `CombatTracker`.
- [ ] Corrigir navegação pós-batalha.
- [ ] Unificar sincronização de estado com player-view.
- [ ] Sanitizar `filename` no `server.ps1`.

### P1
- [ ] Unificar modelo de combatente e HP.
- [ ] Resolver duplicidade DMShield/WorldBuilder.
- [ ] Ajustar roteamento/tab do bestiário.
- [ ] Corrigir schema duplicado (`equipment`) e normalização de save/load.

### P2
- [ ] RulesEngine completo 5e.
- [ ] Tabelas DMG/SRD completas (encounter/loot).
- [ ] Testes automatizados por regra.

---

## 8) Resultado esperado após correções

- Sessões mais estáveis (menos “quebra” em combate/mapa/IA).
- Melhor previsibilidade para mestre e jogadores.
- Aumento de fidelidade ao D&D 5e.
- Base de código mais limpa para expansão futura (novas ferramentas sem regressão).
