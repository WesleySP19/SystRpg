@echo off
setlocal
title 🏰 DOMINIO RPG | CONSOLE DE SERVIDOR
color 0B

:: --- CONFIGURAÇÃO DA PORTA ---
set PORT=8080
:: -----------------------------

echo ==========================================
echo    🛡️  INICIANDO AMBIENTE DOMINIO RPG
echo ==========================================
echo.

:: 1. Limpeza
echo [1/3] Finalizando instancias anteriores...
powershell -Command "Get-Process powershell | Where-Object { $_.CommandLine -like '*server.ps1*' } | Stop-Process -Force" 2>nul

:: 2. Servidor
echo [2/3] Levantando Servidor Premium na porta %PORT%...
echo      (Mantenha esta janela aberta para ver os LOGS em tempo real)
echo.

:: Iniciar o powershell na mesma janela para vermos os logs diretamente
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port %PORT%

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Ocorreu um erro ao iniciar o servidor.
    pause
)

echo.
echo ==========================================
echo    SERVIDOR ENCERRADO.
echo ==========================================
pause
