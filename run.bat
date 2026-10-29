@echo off
title Novyra Roleplay - Welcome Bot
color 0b
echo ========================================================
echo         NOVYRA ROLEPLAY - FIVE M DISCORD BOT
echo ========================================================
echo.

IF NOT EXIST "node_modules" (
    echo [INFO] Installing required dependencies...
    npm install
)

echo [INFO] Starting Novyra Welcome Bot...
node index.js
pause
