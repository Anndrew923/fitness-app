@echo off
echo ============================================
echo 快速建置 Release APK
echo ============================================
echo.
echo ⚠️  注意：此腳本不清理緩存，如需完整清理請使用 build-clean-complete.bat
echo.

:: 設置 JAVA_HOME（如果未設置）
echo [步驟 1/4] 設置 JAVA_HOME...
if "%JAVA_HOME%"=="" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    echo ✅ JAVA_HOME 已設置: %JAVA_HOME%
) else (
    echo ℹ️  JAVA_HOME 已存在: %JAVA_HOME%
)

:: 建置 Web 版本
echo.
echo [步驟 2/4] 建置 React 代碼...
call npm run build
if errorlevel 1 (
    echo ❌ Web 建置失敗
    pause
    exit /b 1
)
echo ✅ Web 建置完成

:: 同步到 Android（關鍵步驟！）
echo.
echo [步驟 3/4] 同步到 Android（關鍵步驟）...
call npx cap sync android
if errorlevel 1 (
    echo ❌ 同步失敗
    pause
    exit /b 1
)
echo ✅ 同步完成

:: 建置 APK
echo.
echo [步驟 4/4] 建置 Release APK...
cd android
call gradlew clean --no-daemon
if errorlevel 1 (
    echo ⚠️  Gradle clean 警告，繼續執行...
)
call gradlew assembleRelease --no-daemon
if errorlevel 1 (
    echo ❌ APK 建置失敗
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ APK 建置完成

:: 顯示結果
echo.
echo ============================================
echo 🎉 建置完成！
echo ============================================
echo.
echo 📦 APK 位置：
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    for %%A in ("android\app\build\outputs\apk\release\app-release.apk") do (
        echo    android\app\build\outputs\apk\release\app-release.apk
        echo    檔案大小: %%~zA bytes
    )
) else (
    echo    APK: ❌ 未找到
)
echo.
echo 💡 提示：如需完整清理建置，請使用 build-clean-complete.bat
echo.
pause

