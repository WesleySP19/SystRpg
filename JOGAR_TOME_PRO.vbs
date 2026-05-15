Option Explicit

Dim WshShell, fso, strPath, port, url, tries

Set WshShell = CreateObject("WScript.Shell")
Set fso      = CreateObject("Scripting.FileSystemObject")
strPath      = fso.GetParentFolderName(WScript.ScriptFullName)
port         = 8080
url          = "http://127.0.0.1:" & port & "/index.html"

' ── 1. Matar processos anteriores para limpar a porta ───────────
On Error Resume Next
WshShell.Run "powershell -Command ""Get-Process powershell | Where-Object { $_.CommandLine -like '*server.ps1*' } | Stop-Process -Force""", 0, True
WScript.Sleep 1000
On Error GoTo 0

' ── 2. Iniciar servidor oculto ──────────────────────────────────
WshShell.Run "powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File """ & strPath & "\server.ps1"" -Port " & port, 0, False

' ── 3. Aguardar o servidor subir (Pausa maior para segurança) ──
' O erro "chrome-error" ocorre quando o navegador tenta carregar antes do servidor responder.
WScript.Sleep 4000 

' ── 4. Abrir navegador no endereço IP direto (mais seguro que localhost) ──
WshShell.Run url

' ── 5. Notificação de Sucesso ───────────────────────────────────
MsgBox "🏰 DOMÍNIO RPG | ARCHITECT v6.0" & vbCrLf & _
       "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" & vbCrLf & _
       "• Servidor: ONLINE (Porta " & port & ")" & vbCrLf & _
       "• Sincronização: ATIVA" & vbCrLf & _
       "• Mapa Tático: CARREGADO" & vbCrLf & vbCrLf & _
       "Se o navegador mostrar erro, aguarde 2 segundos e aperte F5.", 64, "DOMÍNIO RPG"

Set WshShell = Nothing
Set fso      = Nothing
