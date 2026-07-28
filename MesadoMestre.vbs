' =============================================================================
' MesadoMestre.vbs  -  Launcher robusto do RPG Psicologos
' =============================================================================
' Responsabilidades:
'   1. Resolver caminhos dinamicamente (sem hardcode)
'   2. Limpar processos orfaos de sessoes anteriores de forma robusta
'   3. Verificar dependencias (PowerShell)
'   4. Iniciar servidor HTTP em background herdando portas corretamente
'   5. Health-check com back-off progressivo
'   6. Abrir UI no navegador padrao
'   7. Logging estruturado com rotacao automatica
' =============================================================================
Option Explicit

' -- Constantes
Const APP_NAME         = "Mesa do Mestre Multissistema"
Const HEALTH_MAX_TRIES = 20          ' tentativas de health-check
Const HEALTH_BASE_MS   = 300         ' intervalo base entre tentativas (ms)
Const HEALTH_MAX_MS    = 2000        ' teto do back-off (ms)
Const LOG_MAX_BYTES    = 524288      ' 512 KB - tamanho maximo do log
Const LOG_ROTATE_KEEP  = 1           ' quantos backups de log manter
Const CLEANUP_WAIT_MS  = 800         ' espera apos matar processos

' ' -- Objetos globais
Dim objShell, fso
Set objShell = CreateObject("WScript.Shell")
Set fso      = CreateObject("Scripting.FileSystemObject")

' -- Cache para disponibilidade do PowerShell
Dim g_PowerShellAvailable
g_PowerShellAvailable = Null

' -- Porta dinamica com fallback
Dim SERVER_PORT
SERVER_PORT = GetDefaultPort()

' -- Caminhos resolvidos dinamicamente
Dim basePath, batPath, uiUrl, logPath, logBackupPath, serverLogPath
basePath      = fso.GetParentFolderName(WScript.ScriptFullName)
batPath       = fso.BuildPath(basePath, "scripts\start_server.bat")
logPath       = fso.BuildPath(basePath, "mesado_log.txt")
logBackupPath = fso.BuildPath(basePath, "mesado_log.old.txt")
serverLogPath = fso.BuildPath(basePath, "server_log.txt")
uiUrl         = "http://127.0.0.1:" & SERVER_PORT & "/index.html"

' =============================================================================
' LOGGING - append com timestamp ISO-8601-like + rotacao
' =============================================================================
Sub RotateLogIfNeeded()
    On Error Resume Next
    If fso.FileExists(logPath) Then
        Dim f : Set f = fso.GetFile(logPath)
        If f.Size > LOG_MAX_BYTES Then
            ' Remove backup antigo, renomeia atual como backup
            If fso.FileExists(logBackupPath) Then fso.DeleteFile logBackupPath, True
            fso.MoveFile logPath, logBackupPath
        End If
        Set f = Nothing
    End If
    If fso.FileExists(serverLogPath) Then
        Dim sf : Set sf = fso.GetFile(serverLogPath)
        If sf.Size > LOG_MAX_BYTES Then
            Dim sBackup : sBackup = serverLogPath & ".old.txt"
            If fso.FileExists(sBackup) Then fso.DeleteFile sBackup, True
            fso.MoveFile serverLogPath, sBackup
        End If
        Set sf = Nothing
    End If
    On Error GoTo 0
End Sub

Function GetTimestamp()
    Dim d, t, y, m, dd, hh, nn, ss
    d = Date
    t = Time
    y = Year(d)
    m = Right("0" & Month(d), 2)
    dd = Right("0" & Day(d), 2)
    hh = Right("0" & Hour(t), 2)
    nn = Right("0" & Minute(t), 2)
    ss = Right("0" & Second(t), 2)
    GetTimestamp = y & "-" & m & "-" & dd & " " & hh & ":" & nn & ":" & ss
End Function

Sub WriteLog(level, message)
    On Error Resume Next
    Dim ts
    Set ts = fso.OpenTextFile(logPath, 8, True) ' 8 = ForAppending
    ts.WriteLine GetTimestamp() & " [" & level & "] " & message
    ts.Close
    Set ts = Nothing
    On Error GoTo 0
End Sub

' =============================================================================
' FUNCOES AUXILIARES
' =============================================================================

' Verifica se o PowerShell esta disponivel no PATH (resultado em cache)
Function IsPowerShellAvailable()
    If IsNull(g_PowerShellAvailable) Then
        Dim exitCode
        On Error Resume Next
        exitCode = objShell.Run("cmd /c powershell -Command ""exit 0"" >nul 2>&1", 0, True)
        If Err.Number <> 0 Then
            g_PowerShellAvailable = False
            Err.Clear
        Else
            g_PowerShellAvailable = (exitCode = 0)
        End If
        On Error GoTo 0
    End If
    IsPowerShellAvailable = g_PowerShellAvailable
End Function

' Verifica se o Node.js esta disponivel no PATH
Function IsNodeAvailable()
    Dim exitCode
    On Error Resume Next
    exitCode = objShell.Run("cmd /c node -v >nul 2>&1", 0, True)
    If Err.Number <> 0 Then
        IsNodeAvailable = False
        Err.Clear
    Else
        IsNodeAvailable = (exitCode = 0)
    End If
    On Error GoTo 0
End Function

' Mata processos que estejam servindo na porta configurada de forma robusta
Sub CleanupOrphanProcesses(portNumber)
    On Error Resume Next
    Dim cmd
    
    ' 1. Se PowerShell estiver disponivel, mata processos na porta e instancias orfas do server.ps1 / server.js / vite
    If IsPowerShellAvailable() Then
        WriteLog "INFO", "Limpando processos na porta " & portNumber & "..."
        cmd = "powershell -NoProfile -ExecutionPolicy Bypass -Command ""Get-NetTCPConnection -LocalPort " & portNumber & " -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; Get-CimInstance Win32_Process -Filter 'Name = ''powershell.exe'' and CommandLine like ''%server.ps1%''' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty ProcessId -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; Get-CimInstance Win32_Process -Filter 'Name = ''node.exe'' and (CommandLine like ''%server.js%'' or CommandLine like ''%vite%'')' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty ProcessId -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"""
        objShell.Run cmd, 0, True
    End If
    
    ' 2. Fallback / redundancia via netstat + taskkill para garantir
    cmd = "cmd /c ""for /f ""tokens=5"" %a in ('netstat -aon ^| findstr /R :" & portNumber & "[^0-9] ^| findstr LISTENING') do taskkill /F /PID %a >nul 2>&1"""
    objShell.Run cmd, 0, True
    
    WScript.Sleep CLEANUP_WAIT_MS
    On Error GoTo 0
End Sub

' Le a porta padrao configurada na variavel de ambiente (PORT ou SERVER_PORT) ou aplica o padrao 8000
Function GetDefaultPort()
    Dim envPort
    
    ' Tenta ler a variavel de ambiente PORT ou SERVER_PORT
    On Error Resume Next
    envPort = objShell.Environment("PROCESS")("PORT")
    If envPort = "" Then
        envPort = objShell.Environment("PROCESS")("SERVER_PORT")
    End If
    If Err.Number <> 0 Then envPort = ""
    Err.Clear
    On Error GoTo 0
    
    ' Se a porta lida esta definida e eh valida
    If envPort <> "" And IsValidPort(envPort) Then
        GetDefaultPort = CLng(envPort)
    Else
        GetDefaultPort = 8000
    End If
End Function

' Verifica se uma string representa uma porta valida (1-65535)
Function IsValidPort(str)
    IsValidPort = False
    On Error Resume Next
    If IsNumeric(str) Then
        Dim p : p = CLng(str)
        If p > 0 And p <= 65535 Then
            IsValidPort = True
        End If
    End If
    On Error GoTo 0
End Function

' Verifica se a porta ja esta em uso por outro processo (usando netstat -an otimizado sem process ID)
Function IsPortInUseByPID(portNumber)
    Dim exitCode
    On Error Resume Next
    exitCode = objShell.Run("cmd /c netstat -an | findstr /R :" & portNumber & "[^0-9] | findstr LISTENING >nul 2>&1", 0, True)
    If Err.Number <> 0 Then
        IsPortInUseByPID = False
        Err.Clear
    Else
        IsPortInUseByPID = (exitCode = 0)
    End If
    On Error GoTo 0
End Function

' Verifica se o servidor ja responde saudável na porta (evita reiniciar servidor ativo)
Function CheckServerHealthy(portNumber)
    Dim http, ready, testUrl
    ready = False
    testUrl = "http://127.0.0.1:" & portNumber & "/index.html"
    On Error Resume Next
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    http.SetTimeouts 800, 800, 800, 800  ' connect, send, receive, resolve (ms) - rapido
    http.Open "GET", testUrl, False
    http.Send
    If Err.Number = 0 And (http.Status = 200 Or http.Status = 304) Then
        ready = True
    End If
    Set http = Nothing
    On Error GoTo 0
    CheckServerHealthy = ready
End Function

' Health-check HTTP com back-off exponencial (capped)
Function WaitForServer()
    Dim http, i, delayMs, ready
    ready = False
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    http.SetTimeouts 2000, 2000, 2000, 2000  ' connect, send, receive, resolve (ms)

    delayMs = HEALTH_BASE_MS
    For i = 1 To HEALTH_MAX_TRIES
        WScript.Sleep delayMs

        On Error Resume Next
        Err.Clear
        http.Open "GET", uiUrl, False
        http.Send
        If Err.Number = 0 And (http.Status = 200 Or http.Status = 304) Then
            ready = True
        End If
        On Error GoTo 0

        If ready Then
            WriteLog "INFO", "Health-check OK na tentativa " & i & "/" & HEALTH_MAX_TRIES & " (" & delayMs & "ms)"
            Exit For
        End If

        ' Back-off: dobra o intervalo ate o teto
        If delayMs < HEALTH_MAX_MS Then
            delayMs = delayMs * 2
            If delayMs > HEALTH_MAX_MS Then delayMs = HEALTH_MAX_MS
        End If
    Next

    Set http = Nothing
    WaitForServer = ready
End Function

' Exibe popup estilizado com auto-close
Sub ShowNotification(msg, iconType, autoCloseSec)
    objShell.Popup msg, autoCloseSec, APP_NAME, iconType
End Sub

' =============================================================================
' FLUXO PRINCIPAL
' =============================================================================
Sub Main()

    Dim startTime, elapsedSec, portCandidates, i, portOk, tryPort
    startTime = Timer
    RotateLogIfNeeded
    WriteLog "INFO", String(60, "=")
    WriteLog "INFO", "Iniciando " & APP_NAME & " v12.3.5 (Julho 2026)"
    WriteLog "INFO", "Base path: " & basePath

    ' -- 1. Determinar Stack de Execucao (Node.js vs PowerShell)
    Dim useNode, nodeBatPath
    useNode = IsNodeAvailable()
    nodeBatPath = fso.BuildPath(basePath, "scripts\start_node_server.bat")

    If useNode And fso.FileExists(nodeBatPath) Then
        WriteLog "INFO", "Node.js detectado. Usando backend Express moderno."
        batPath = nodeBatPath
    Else
        WriteLog "INFO", "Node.js nao disponivel ou start_node_server.bat ausente. Caindo para backend PowerShell resiliente."
        batPath = fso.BuildPath(basePath, "scripts\start_server.bat")
        
        ' Se estamos caindo para PowerShell, precisamos verificar se ele esta disponivel
        If Not IsPowerShellAvailable() Then
            WriteLog "ERRO", "Nem Node.js nem PowerShell foram localizados no sistema."
            ShowNotification _
                "[Erro] Nenhuma stack de execucao disponivel!" & vbCrLf & vbCrLf & _
                "Instale o Node.js ou ative o Windows PowerShell para rodar a Mesa do Mestre.", 16, 0
            WScript.Quit 2
        End If
        WriteLog "INFO", "PowerShell disponivel no sistema."
    End If

    ' -- 2. Verificar batch script definitivo
    If Not fso.FileExists(batPath) Then
        WriteLog "ERRO", "Script de inicializacao nao encontrado: " & batPath
        ShowNotification "[Erro] Script de inicializacao nao encontrado: " & vbCrLf & batPath, 16, 0
        WScript.Quit 1
    End If
    WriteLog "INFO", "Batch script localizado: " & batPath

    ' -- 2.5 Verificar se o servidor ja esta rodando saudavel em qualquer porta candidata (evita reiniciar mesa ativa)
    Dim portCandidatesToCheck, activePortFound
    portCandidatesToCheck = Array(8000, 8080, 8001)
    activePortFound = 0
    For i = LBound(portCandidatesToCheck) To UBound(portCandidatesToCheck)
        tryPort = portCandidatesToCheck(i)
        If IsPortInUseByPID(tryPort) Then
            WriteLog "INFO", "Porta candidata " & tryPort & " em uso. Verificando integridade do servidor..."
            If CheckServerHealthy(tryPort) Then
                SERVER_PORT = tryPort
                uiUrl = "http://127.0.0.1:" & SERVER_PORT & "/index.html"
                activePortFound = tryPort
                Exit For
            End If
        End If
    Next

    If activePortFound > 0 Then
        elapsedSec = Round(Timer - startTime, 1)
        WriteLog "INFO", "Servidor ativo e saudavel detectado na porta " & activePortFound & ". Redirecionando navegador..."
        objShell.Run uiUrl, 1, False
        ShowNotification _
            "[" & APP_NAME & "]" & vbCrLf & _
            "================================" & vbCrLf & _
            "Portal Arcano: ATIVO (127.0.0.1:" & activePortFound & ")" & vbCrLf & _
            "Sistemas: D&D, T20, Pathfinder, Vampiro" & vbCrLf & _
            "================================" & vbCrLf & _
            "Os grimorios foram abertos com sucesso." & vbCrLf & _
            "Boa sessao, Mestre das Multidimensoes!", 64, 5
        WScript.Quit 0
    End If

    ' -- 3. Tentar portas em cascata com liberacao/cleanup automatico
    portCandidates = Array(8000, 8080, 8001)
    portOk = False
    For i = LBound(portCandidates) To UBound(portCandidates)
        tryPort = portCandidates(i)
        If IsPortInUseByPID(tryPort) Then
            WriteLog "WARN", "Porta " & tryPort & " em uso - limpando processos anteriores..."
            CleanupOrphanProcesses tryPort
        End If
        
        If Not IsPortInUseByPID(tryPort) Then
            SERVER_PORT = tryPort
            portOk = True
            WriteLog "INFO", "Porta " & tryPort & " liberada/livre com sucesso."
            Exit For
        Else
            WriteLog "ERRO", "Porta " & tryPort & " permanece ocupada apos cleanup."
        End If
    Next

    If Not portOk Then
        WriteLog "WARN", "Portas principais ocupadas. Escaneando portas livres entre 8002 e 8100..."
        For tryPort = 8002 To 8100
            If tryPort <> 8080 Then
                If Not IsPortInUseByPID(tryPort) Then
                    SERVER_PORT = tryPort
                    portOk = True
                    WriteLog "INFO", "Porta livre encontrada via escaneamento: " & tryPort
                    Exit For
                End If
            End If
        Next
    End If

    If Not portOk Then
        WriteLog "ERRO", "Nenhuma porta disponivel (8000-8100)."
        ShowNotification _
            "[Aviso] Nenhuma porta disponivel (8000-8100)." & vbCrLf & _
            "Feche outros programas ou defina a variavel de ambiente PORT.", 16, 0
        WScript.Quit 3
    End If

    WriteLog "INFO", "Usando porta definitiva: " & SERVER_PORT

    ' -- 4. Iniciar servidor (oculto) com redirecionamento de logs de inicializacao para o log do servidor
    WriteLog "INFO", "Lancando servidor na porta " & SERVER_PORT & "..."
    
    ' Grava na tabela de ambiente do processo atual
    objShell.Environment("PROCESS")("SERVER_PORT") = SERVER_PORT
    objShell.Environment("PROCESS")("PORT") = SERVER_PORT
    
    Dim dashboardUrl, playerViewUrl
    dashboardUrl = "http://127.0.0.1:" & SERVER_PORT & "/index.html"
    playerViewUrl = "http://127.0.0.1:" & SERVER_PORT & "/player-view.html"
    
    uiUrl = dashboardUrl
    objShell.Run "cmd /c """"" & batPath & """ >> """ & serverLogPath & """ 2>&1""", 0, False

    ' -- 5. Health-check com back-off
    WriteLog "INFO", "Aguardando health-check do servidor..."
    If WaitForServer() Then
        elapsedSec = Round(Timer - startTime, 1)
        WriteLog "INFO", "Servidor pronto em " & elapsedSec & "s"

        ' -- 6. Escolha e Abertura das Telas
        Dim choice
        choice = objShell.Popup("MESA DO MESTRE MULTISSISTEMA - Inicializado!" & vbCrLf & vbCrLf & _
                                "Qual portal magico deseja abrir?" & vbCrLf & _
                                "[Sim]   - Escudo do Mestre (Dashboard)" & vbCrLf & _
                                "[Não]   - Visao dos Jogadores (Player View)" & vbCrLf & _
                                "[Cancelar] - Ambas as Telas", 10, APP_NAME & " - Escolha a Interface", 3 + 32)
        
        Dim selectedInterface
        If choice = 7 Then ' Não
            objShell.Run playerViewUrl, 1, False
            WriteLog "INFO", "Abrindo interface: Player View (" & playerViewUrl & ")"
            selectedInterface = "Player View"
        ElseIf choice = 2 Then ' Cancelar
            objShell.Run dashboardUrl, 1, False
            WScript.Sleep 500
            objShell.Run playerViewUrl, 1, False
            WriteLog "INFO", "Abrindo ambas as interfaces: Dashboard e Player View"
            selectedInterface = "Ambas (Dashboard + Player View)"
        Else ' Sim (6) ou Timeout (-1)
            objShell.Run dashboardUrl, 1, False
            WriteLog "INFO", "Abrindo interface: Dashboard (" & dashboardUrl & ")"
            selectedInterface = "Dashboard"
        End If

        ShowNotification _
            "[" & APP_NAME & "]" & vbCrLf & _
            "================================" & vbCrLf & _
            "Portal Arcano: ATIVO (127.0.0.1:" & SERVER_PORT & ")" & vbCrLf & _
            "Sistemas: D&D, T20, Pathfinder, Vampiro" & vbCrLf & _
            "Canal Escolhido: " & selectedInterface & vbCrLf & _
            "================================" & vbCrLf & _
            "Os grimorios foram despertados." & vbCrLf & _
            "Boa sessao, Mestre!", 64, 5
    Else
        WriteLog "ERRO", "Servidor nao respondeu apos " & HEALTH_MAX_TRIES & " tentativas."
        ShowNotification _
            "[Erro] O servidor nao respondeu a tempo." & vbCrLf & vbCrLf & _
            "Verifique o log em:" & vbCrLf & logPath, 16, 0

        ' Tenta matar o processo do servidor que ficou preso
        CleanupOrphanProcesses SERVER_PORT
        WriteLog "WARN", "Processos do servidor encerrados apos falha de health-check."
        WScript.Quit 4
    End If

    WriteLog "INFO", "Fluxo concluido com sucesso."
    WriteLog "INFO", String(60, "=")
End Sub

' -- Execucao
Main

' -- Limpeza de objetos
Set objShell = Nothing
Set fso      = Nothing
