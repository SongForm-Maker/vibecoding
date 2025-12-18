@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ==========================================
echo   자동 커밋 감시 모드 시작
echo ==========================================
echo.
echo 파일 변경사항을 감지하여 자동으로 커밋합니다.
echo 종료하려면 Ctrl+C를 누르세요.
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0auto-commit.ps1" -Watch
pause











