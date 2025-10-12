@echo off
call fix-terminal.bat

echo ========================================
echo 🚀 自動部署
echo ========================================

echo 📋 構建 Web 應用...
call npm run build --silent

echo 📋 構建 AAB...
call gradlew bundleRelease --no-daemon --console=plain --quiet

echo 📋 部署到 Netlify...
call npm run deploy:force --silent

echo ✅ 部署完成！

echo.
echo 🎉 完成！按任意鍵退出...
pause >nul
