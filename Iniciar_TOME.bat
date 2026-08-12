@echo off
title TOME V19.2.1 - The Atomic Engine
cls
cd /d "%~dp0"

if exist "%~dp0node-v20.11.1-win-x64\node.exe" (
    set "NODE_EXE=%~dp0node-v20.11.1-win-x64\node.exe"
    set "PATH=%~dp0node-v20.11.1-win-x64;%PATH%"
) else (
    where node >nul 2>nul
    if not errorlevel 1 (
        set "NODE_EXE=node"
    ) else (
        echo [ERRO] Node.js não encontrado!
        pause
        exit /b 1
    )
)

echo [TOME V19.2.1] Iniciando The Atomic Engine com Alta Performance...
echo [TOME V19.2.1] Habilitando Garbage Collection Manual e expandindo memoria para 4GB...
"%NODE_EXE%" --expose-gc --max-old-space-size=4096 "%~dp0scripts\start-cli.js"

if /i "%~1"=="--silent" exit /b 0
pause >nul