#!/bin/bash
# Mesa do Mestre - Universal Launcher para Linux/macOS
# Requisitos: Node.js (v18+)

# Navegar para o diretório do script
cd "$(dirname "$0")"

echo "============================================================"
echo "  MESA DO MESTRE - MOTOR DE RPG MULTISSISTEMA (Versao 12.3.5)"
echo "============================================================"
echo ""
echo "Despertando os grimórios antigos para a nuvem..."

# Verifica Node.js
if ! command -v node &> /dev/null
then
    echo "[ERRO] Node.js não está instalado!"
    echo "Instale o Node.js para rodar a Mesa do Mestre no Linux/macOS."
    exit 1
fi

echo "Iniciando o portal Node.js localmente..."

# Executa o servidor Node (server.js) e abre o navegador
export PORT=8000
node server.js &
PID=$!

echo "O feitiço foi transferido para o backend (PID: $PID)."
echo "Acesse http://127.0.0.1:8000/ no seu navegador mágico."

# Tenta abrir o navegador (macOS usa 'open', Linux usa 'xdg-open')
sleep 2
if command -v open &> /dev/null
then
    open http://127.0.0.1:8000/
elif command -v xdg-open &> /dev/null
then
    xdg-open http://127.0.0.1:8000/
fi

# Mantém o terminal vivo
wait $PID
