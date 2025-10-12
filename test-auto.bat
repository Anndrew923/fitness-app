@echo off
call fix-terminal.bat

echo ========================================
echo 🧪 自動測試
echo ========================================

echo 📋 運行健康檢查...
call npm run health:check --silent

echo 📋 運行自動化測試...
call npm run test:auto --silent

echo 📋 運行性能測試...
call npm run test:performance --silent

echo ✅ 所有測試完成！

echo.
echo 🎉 完成！按任意鍵退出...
pause >nul
