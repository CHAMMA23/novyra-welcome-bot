@echo off
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%"
echo ========================================================
echo   Pushing Novyra-Welcome-Bot to GitHub...
echo ========================================================
git push -u origin main
echo.
pause
