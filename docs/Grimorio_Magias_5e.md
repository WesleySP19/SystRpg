# 📚 Grimório de Magias & Truques — D&D 5e Integrado

## 🎯 O que foi implementado

Um sistema completo de referência de magias para D&D 5e integrado ao RPG Psicólogos, permitindo consulta rápida, filtros dinâmicos e detalhes mecânicos de todas as magias.

### ✨ Componentes Criados

#### 1. **Base de Dados (`data/spells-5e.json`)**
- 40+ magias e truques organizadas por nível (0-5º)
- Estrutura padronizada com:
  - Nome em português e inglês
  - Classes que acessam a magia
  - Tipo (dano, controle, utilidade, cura)
  - Desafio que resolve
  - Execução mecânica
  - Efeito em jogo
  - Escalabilidade por nível do personagem
  - Salvaguardas, alcance, duração, concentração

#### 2. **Componente SpellBook (`ui/components/SpellBook.js`)**
Interface visual rica com:
- **Busca rápida** por nome, nome em inglês, ou desafio que resolve
- **Filtros dinâmicos**:
  - Por classe (Mago, Clérigo, Bardo, etc.)
  - Por tipo (dano, controle, utilidade, cura)
  - Por nível (Truques a 5º nível)
- **Visualização em grade** organizada por nível
- **Painel de detalhes** com todas as informações da magia
- **Escalabilidade visível** mostrando como magias crescem com níveis

#### 3. **Integração ao Dashboard**
- Novo botão "Grimório" na barra de ferramentas rápidas
- Acessível via `activeTab = 'spellbook'`
- Cachado em offline pelo Service Worker

---

## 🚀 Como Usar

### Acessar o Grimório

1. **Via Dashboard Principal**: Clique no botão **"📖 Grimório"** na seção de ferramentas rápidas
2. **Via Menu**: Navegue para a aba "spellbook" programaticamente

### Buscar Magias

**Barra de Busca:**
```
Buscar por:
- Nome em português (ex: "Bola de Fogo")
- Nome em inglês (ex: "Fireball")
- Desafio que resolve (ex: "Dano em área contra grupos")
```

### Filtrar Resultados

**Lado Direito - Painel de Filtros:**

1. **Classe**: Selecione a classe (Mago, Clérigo, Druida, Bardo, Bruxo, etc.)
   - Mostra apenas magias que essa classe pode usar

2. **Tipo**: Filtro por categoria
   - ⚔️ **Dano**: Magias ofensivas
   - 🔗 **Controle**: Crowd control, buffs, debuffs
   - ✨ **Utilidade**: Exploração, comunicação
   - 🏥 **Cura**: Restauração de vida

3. **Nível**: Magias por nível de acesso
   - 🧙 **Truques (0)**: Sem gasto de slot
   - **1º-5º Nível**: Por círculo de magia

**Botão "Limpar Filtros"**: Reseta todos os filtros e busca

### Visualizar Detalhes

1. **Clique em qualquer magia na grade**
2. **Painel detalhado abre com**:
   - 📋 Informações resumidas (Nível, Ação, Alcance, Duração)
   - 🎯 Desafio que resolve
   - ⚙️ Execução mecânica
   - 💥 Efeito em jogo
   - 🔄 Escalabilidade por nível
   - 💀 Tipo de dano (se aplicável)
   - 🛡️ Salvaguardas
   - ⚠️ Requer concentração?

3. **Feche com o botão "✕"** no canto superior direito

---

## 📊 Estrutura de Dados

### Exemplo de Magia (JSON)

```json
{
  "id": "spell3-fireball",
  "name": "Bola de Fogo",
  "englishName": "Fireball",
  "classes": ["Mago", "Feiticeiro"],
  "level": 3,
  "actionType": "action",
  "range": "45m",
  "components": ["V", "S", "M"],
  "concentration": false,
  "duration": "Instantâneo",
  "challenge": "Dano em área contra grupos",
  "execution": "Ação; esfera 6m de raio a 45m",
  "savingThrow": "DEX",
  "baseDamage": "8d6",
  "damageType": "Fogo",
  "scaling": {
    "5": { "value": "9d6" },
    "11": { "value": "10d6" },
    "17": { "value": "11d6" }
  },
  "effect": "8d6 fogo (metade Destreza); sobe +1d6 por nível acima"
}
```

---

## 🔧 Componentes Modificados

### `ui/pages/Dashboard.js`
- ✅ Adicionado `spellbook` ao `moduleMap`
- ✅ Adicionado botão "Grimório" na seção de ferramentas rápidas

### `service-worker.js`
- ✅ Adicionado `SpellBook.js` à lista de cache
- ✅ Adicionado `spells-5e.json` à lista de cache

---

## 🎮 Integração com Combate

Próximas melhorias sugeridas:

1. **Sugestão de Magias por CR**: Ao listar monstros, sugerir magias para enfrentar o desafio
2. **Macros de Magia**: Botões para aplicar efeitos de magias diretamente em combate
3. **Grimório do Personagem**: Filtrar magias por personagem ativo (baseado em classe/nível)
4. **Histórico de Magias Usadas**: Rastrear quais magias foram usadas em combate

---

## 📈 Performance

- **Busca O(n)**: Busca linear simples, ideal para 40-50 magias
- **Filtros acumulativos**: Reduzem o conjunto rapidamente
- **Renderização sob demanda**: Apenas magias filtradas são renderizadas
- **Cache offline**: Funciona sem conexão (200+ ms de carregamento)

---

## 🔮 Próximos Passos (Roadmap)

### ⭐ Versão 1.1
- [ ] Adicionar mais de 100 magias (até 9º nível)
- [ ] Categorias de escolas de magia (Evocação, Abjuração, etc.)
- [ ] Magias por alinhamento/domínio de deidade

### ⭐ Versão 2.0
- [ ] **Grimório Pessoal**: Cada personagem tem suas magias preparadas
- [ ] **Contador de Slots**: Rastrear uso de slots de magia por combate
- [ ] **Sugestões Inteligentes**: IA recomenda magias por situação
- [ ] **Macros Rápidas**: Botão para aplicar efeito em combate (rolar dano, salvar, etc.)

### ⭐ Versão 3.0
- [ ] **Grimório Colaborativo**: Mestres compartilham customizações de magias
- [ ] **Editor Visual**: Criar magias customizadas com interface drag-and-drop
- [ ] **Integrações**: Sincronizar com D&D Beyond, AnomalousPulse, etc.

---

## 📞 Suporte

Para adicionar mais magias ou customizar:

1. Edite `data/spells-5e.json`
2. Adicione entrada seguindo o schema existente
3. O SpellBook renderizará automaticamente

**Exemplo de adição rápida:**

```json
{
  "id": "spell6-true-polymorph",
  "name": "Polimorfismo Verdadeiro",
  "englishName": "True Polymorph",
  "classes": ["Mago"],
  "level": 9,
  "actionType": "action",
  "range": "9m",
  "components": ["V", "S", "M"],
  "concentration": true,
  "duration": "Concentração (até 1 hora)",
  "challenge": "Transformar permanentemente algo",
  "execution": "Ação; alvo à vista",
  "effect": "Alvo se transforma em criatura/objeto diferente"
}
```

---

**Versão**: 1.0  
**Data**: 26 de maio de 2026  
**Sistema**: D&D 5e  
**Integração**: RPG Psicólogos v6.0+
