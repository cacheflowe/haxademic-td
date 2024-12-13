@REM Start TouchDesigner app
start "" /min td-start.cmd ^& exit

@REM Start Vite dev server and WebSocket server
start "" /min web-server-start.cmd ^& exit

exit