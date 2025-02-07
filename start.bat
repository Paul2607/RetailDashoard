@echo off
REM start.bat für Windows

echo Ermittle IP-Adresse...
node scripts/get-ip.js

echo Aktualisiere Zeitstempel...
python src/utils/update_timestamps.py

echo Starte Server...
start /B cmd /c "node src\utils\server.js"

echo Warte kurz bis der Server gestartet ist...
timeout /t 3 /nobreak >nul

echo Starte Frontend...
npm start

REM Wenn npm start beendet wird, beende auch den Server
taskkill /F /IM node.exe /T