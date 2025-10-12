@echo off
call fix-terminal.bat

echo ========================================
echo 🚀 自動打包 AAB（無需手動確認）
echo ========================================

echo 📋 清理構建...
call gradlew clean --no-daemon --console=plain --quiet

echo 📋 生成 AAB...
call gradlew bundleRelease --no-daemon --console=plain --quiet

if %ERRORLEVEL% EQU 0 (
    echo ✅ AAB 打包成功！
    echo 📁 文件位置: app\build\outputs\bundle\release\
    dir app\build\outputs\bundle\release\*.aab
) else (
    echo ❌ AAB 打包失敗！
)

echo.
echo 🎉 完成！按任意鍵退出...
pause >nul
