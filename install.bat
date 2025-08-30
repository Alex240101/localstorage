@echo off
echo Installing dependencies with increased memory limit...
node --max-old-space-size=4096 %APPDATA%\npm\npm.cmd install --legacy-peer-deps
echo Installation complete!
pause
