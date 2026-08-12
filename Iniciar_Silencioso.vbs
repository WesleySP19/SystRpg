Option Explicit

Dim WshShell, FSO, ScriptDir, BatPath

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

ScriptDir = FSO.GetParentFolderName(WScript.ScriptFullName)
BatPath = ScriptDir & "\Iniciar_TOME.bat"

If Not FSO.FileExists(BatPath) Then
    MsgBox "ERRO: Iniciar_TOME.bat nao encontrado em: " & ScriptDir, vbCritical, "TOME V19"
    WScript.Quit 1
End If

WshShell.Popup "TOME V19 iniciando..." & vbCrLf & vbCrLf & "O navegador abrira em instantes." & vbCrLf & "Acesso em: http://localhost:3000/", 4, "TOME V19 - Premium VTT", 64

WshShell.Run "cmd.exe /c """ & BatPath & """ --silent", 0, False

Set WshShell = Nothing
Set FSO = Nothing