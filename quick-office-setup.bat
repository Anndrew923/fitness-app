@echo off
chcp 65001 >nul
echo 🏢 辦公室環境快速設定開始...
echo.

echo 📋 檢查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安裝，請先安裝 Node.js 20.19.1 LTS
    echo 下載地址: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js 已安裝

echo.
echo 📋 檢查 Java...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java 未安裝，請先安裝 OpenJDK 17.0.16
    echo 下載地址: https://adoptium.net/
    pause
    exit /b 1
)
echo ✅ Java 已安裝

echo.
echo 📋 執行環境同步...
node scripts/sync-environment.js

echo.
echo 📋 執行修復操作...
node scripts/sync-environment.js --fix

echo.
echo 📋 同步 Cursor 配置...
node scripts/cursor-config-sync.js

echo.
echo 🎉 辦公室環境設定完成！
echo.
echo 📋 後續步驟:
echo 1. 編輯 .env 檔案，填入 Firebase 配置
echo 2. 執行 npm run dev 啟動開發服務器
echo 3. 在 Cursor 中打開專案
echo.
pause
