# 🛡️ Mesa do Mestre

Plataforma profissional de suporte a mestres de D&D 5e, projetada para alta performance offline e imersão total.

## 🏗️ Arquitetura Real-Time
O sistema utiliza uma arquitetura modular moderna sem necessidade de compiladores complexos:

-   **Frontend:** JavaScript Vanilla (ES6+) com sistema de componentes proprietário e Store reativo via Proxy.
-   **Estilização:** CSS3 Customizado com design system baseado em temas de pergaminho e modo escuro premium.
-   **Backend/Persistência:** Servidor ultra-leve em **PowerShell (v5.1+)** que gerencia a persistência de arquivos JSON e serve a aplicação.
-   **Offline-First:** Suporte total a PWA via Service Worker v3.0, garantindo funcionamento estável mesmo sem conexão.
-   **IA Integrada:** Oráculo de Sessão, descrições de cena e geração de NPCs via IA.

## 🚀 Como Iniciar

O projeto foi forjado para ser simples e rápido de rodar no Windows.

### 1. Iniciar o Servidor
Execute o arquivo de lote na raiz do projeto:
```powershell
./DEBUG_START.bat
```
### 2. Acessar a Plataforma
Abra o seu navegador e acesse:
[http://localhost:8080](http://localhost:8080)

## 🧠 Recursos Principais
-   **Oracle de Sessão:** Gere ganchos narrativos impactantes instantaneamente na página inicial.
-   **Arena de Combate:** Gerenciamento de iniciativa, HP, economia de ações e **Combat Timer** visual configurável.
-   **Legacy Character Sheet:** Ficha D&D 5e completa com cálculos automáticos e importação/exportação JSON/PDF.
-   **Bestiário Arcano:** Biblioteca com centenas de criaturas prontas para combate com visual imersivo.
-   **Mapa Tático:** Engine de grid com Fog of War e Tokens dinâmicos (sincronização em tempo real com Player View).
-   **Persistência Atômica:** Seus dados são salvos em arquivos JSON físicos na pasta `/data`, com sistema de snapshots de segurança.
-   **Armazenamento Híbrido Offline:** Casamento inteligente entre LocalStorage (estados leves) e IndexedDB (mídias pesadas em Base64), garantindo estabilidade e integridade mesmo sem conexão.

---
*Forjado para Mestres, por HawnkCorp.*
