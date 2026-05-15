# 🛡️ TOME - RPG Master Toolkit (v2.0)

Sistema profissional de suporte a mestres de D&D 5e, agora refatorado para uma arquitetura moderna Full-Stack.

## 🏗️ Arquitetura
O projeto está dividido em duas partes principais:

- **`/backend`**: Servidor em Node.js (Express) que gerencia a inteligência artificial (Gemini 1.5 Flash), persistência de dados em SQLite e lógica de crônicas.
- **`/frontend`**: Aplicação React Single Page (SPA) utilizando Vite, Zustand para gerenciamento de estado e Tailwind CSS para interface premium.

## 🚀 Como Iniciar

### Pré-requisitos
- Node.js (Versão 18 ou superior)
- NPM ou Yarn

### 1. Backend
```bash
cd backend
npm install
npm start
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧠 Recursos Integrados
- **IA Generativa:** Narração dinâmica e táticas de combate via Google Gemini.
- **Estado Persistente:** O progresso da sessão é salvo automaticamente no LocalStorage/IndexedDB.
- **Interface Premium:** Design focado em imersão com temas dinâmicos e micro-animações.

---
*Forjado para Mestres, por Antigravity.*
