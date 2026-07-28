Option Explicit
Dim objShell, fso, basePath, projectPath
Set objShell = CreateObject("WScript.Shell")
Set fso      = CreateObject("Scripting.FileSystemObject")
basePath    = fso.GetParentFolderName(fso.GetParentFolderName(WScript.ScriptFullName))
projectPath = fso.BuildPath(basePath, "index.html")
' Use the default browser to open the HTML file
objShell.Run """" & projectPath & """", 1, False

