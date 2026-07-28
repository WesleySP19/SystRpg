@echo off
setlocal enabledelayedexpansion
:: Mesa do Mestre - Launcher Alternativo (BAT)
:: Este script atua como um inicializador direto e limpo para o ambiente da Mesa.

cd /d "%~dp0"

echo ============================================================
echo   MESA DO MESTRE - MOTOR DE RPG MULTISSISTEMA (Versao 12.3.5)
echo ============================================================
echo.
echo [D^&D] [Tormenta20] [Pathfinder] [Vampiro: A Mascara]
echo.
echo Despertando os grimorios antigos e energizando os dados...
echo Preparando a arquitetura do multiverso...
echo.

if exist MesadoMestre.vbs (
    echo Executando o inicializador arcano ^(MesadoMestre.vbs^)...
    start wscript.exe "MesadoMestre.vbs"
    
    echo.
    echo O encantamento foi transferido para o backend ^(em background^).
    echo O portal ^(navegador^) se abrira magicamente quando tudo estiver pronto.
    echo O registro de sua jornada esta sendo gravado em mesado_log.txt.
    echo.
    echo Boa sessao, Mestre!
    timeout /t 5 /nobreak >nul
    exit /b 0
) else (
    echo [FALHA CRITICA] O feitiço MesadoMestre.vbs nao foi encontrado na raiz!
    echo Sua magia ^(arquivos da Mesa^) parece estar incompleta.
    pause
    exit /b 1
)
