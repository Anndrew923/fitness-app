@echo off
chcp 65001 >nul
echo 🏢 辦公室環境同步指令
echo.

echo 📋 請在辦公室電腦上執行以下指令：
echo.

echo 1. 開啟命令提示字元或 PowerShell
echo 2. 切換到專案目錄：
echo    cd C:\Users\User\Dropbox\fitness-app
echo.

echo 3. 執行完整同步：
echo    npm run office:complete
echo.

echo 4. 如果遇到問題，執行修復：
echo    npm run office:fix
echo.

echo 5. 檢查環境狀態：
echo    npm run office:sync
echo.

echo 📋 或者直接複製以下指令到辦公室電腦執行：
echo.
echo ========================================
echo npm run office:complete
echo ========================================
echo.

pause
