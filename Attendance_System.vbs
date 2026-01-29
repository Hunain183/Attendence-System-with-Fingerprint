' ============================================================
'    Attendance System - Silent App Launcher
'    Double-click to run the application silently
' ============================================================

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the directory of this script
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Change to script directory
WshShell.CurrentDirectory = scriptDir

' Check if dependencies are installed
If Not fso.FolderExists(scriptDir & "\frontend\node_modules") Then
    MsgBox "Dependencies not installed." & vbCrLf & vbCrLf & "Please run INSTALL_AND_RUN.bat first to install dependencies.", vbExclamation, "Attendance System"
    WScript.Quit
End If

' Show starting message
MsgBox "Starting Attendance System..." & vbCrLf & vbCrLf & "The application will open in your browser shortly." & vbCrLf & vbCrLf & "Login: admin / admin123", vbInformation, "Attendance System"

' Start backend (hidden)
WshShell.CurrentDirectory = scriptDir & "\backend"
WshShell.Run "cmd /c python -m uvicorn main:app --host 127.0.0.1 --port 8000", 0, False

' Wait for backend to start
WScript.Sleep 5000

' Start frontend (hidden)
WshShell.CurrentDirectory = scriptDir & "\frontend"
WshShell.Run "cmd /c npx vite --host", 0, False

' Wait for frontend to start
WScript.Sleep 5000

' Open browser
WshShell.Run "http://localhost:3000", 1, False

' Done - script exits, servers keep running
