Option Explicit

Dim WshShell, FSO, ScriptDir, BatPath

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

ScriptDir = FSO.GetParentFolderName(WScript.ScriptFullName)
BatPath = ScriptDir & "\Iniciar_TOME.bat"

If Not FSO.FileExists(BatPath) Then
    MsgBox "ERRO: Iniciar_TOME.bat nao encontrado em: " & ScriptDir, vbCritical, "Mesa Psigologos V23.0.0"
    WScript.Quit 1
End If

WshShell.Popup "Mesa Psigologos V23.0.0 (Obsidian Glassmorphism) iniciando..." & vbCrLf & vbCrLf & "O servidor esta sendo otimizado para alto desempenho (GC ativo & 4GB de RAM)." & vbCrLf & "Acesso em: http://localhost:4000/", 4, "Mesa Psigologos V23.0.0 - Premium VTT", 64

WshShell.Run "cmd.exe /c """ & BatPath & """ --silent", 0, False

Set WshShell = Nothing
Set FSO = Nothing