@echo off
title Stacks Habit Tracker
cd /d "%~dp0"
echo Starting Stacks... your browser will open in a few seconds.
echo Keep this window open while using the app. Close it to stop Stacks.
start /b cmd /c "timeout /t 4 >nul & start http://localhost:5000"
npm run dev
pause
