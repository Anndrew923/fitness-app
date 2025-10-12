@echo off
call fix-terminal.bat

echo ========================================
echo 🌐 自動構建 Web 應用
echo ========================================

echo 📋 安裝依賴...
call npm install --silent --no-audit --no-fund

echo 📋 構建應用...
call npm run build --silent

if %ERRORLEVEL% EQU 0 (
    echo ✅ Web 構建成功！
    echo 📁 文件位置: dist\
) else (
    echo ❌ Web 構建失敗！
)

echo.
echo 🎉 完成！按任意鍵退出...
pause >nul
