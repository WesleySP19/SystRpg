@echo off
REM Script de inicialização do servidor RPG com suporte a porta dinâmica
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
echo Iniciando Servidor RPG na Porta: %SERVER_PORT%
echo ================================================================================
echo.

REM Obtém o diretório do projeto (pasta raiz)
cd /d "%~dp0.."

REM Inicia PowerShell com o script server.ps1, passando a porta
powershell -NoProfile -ExecutionPolicy Bypass -File server.ps1 -Port %SERVER_PORT%

endlocal
