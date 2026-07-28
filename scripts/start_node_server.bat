@echo off
REM Script de inicialização do servidor Node.js/Express para o RPG Psicólogos
REM Lê SERVER_PORT da variável de ambiente ou usa fallback

setlocal enabledelayedexpansion

if "%PORT%" NEQ "" (
    set SERVER_PORT=%PORT%
)
if "%SERVER_PORT%"=="" (
    set SERVER_PORT=8000
)

echo.
echo ================================================================================
echo Iniciando Servidor RPG em Node.js na Porta: %SERVER_PORT%
echo ================================================================================
echo.

REM Obtém o diretório do projeto (pasta raiz)
cd /d "%~dp0.."

REM Se node_modules não existir, executa npm install
if not exist node_modules (
    echo [Launcher] Primeira inicializacao: Instalando dependencias com npm...
    cmd /c npm install
)

REM Define a porta de ambiente e inicia o servidor Node
set PORT=%SERVER_PORT%
node server.js

endlocal
