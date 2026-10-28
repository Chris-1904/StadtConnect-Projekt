@echo off
cd /d "%~dp0"
echo StadtConnect Mannheim – lokaler Webserver
where py >nul 2>nul
if %errorlevel%==0 (start "" "http://localhost:8000" & py -3 -m http.server 8000 & goto end)
where python >nul 2>nul
if %errorlevel%==0 (start "" "http://localhost:8000" & python -m http.server 8000 & goto end)
echo Python 3 ist nicht installiert oder nicht im PATH.
echo Bitte Python 3 installieren oder im Ordner ausfuehren: python -m http.server 8000
pause
:end
