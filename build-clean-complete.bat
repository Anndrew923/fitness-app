@echo off
echo ============================================
echo 完整清除快取並建置最新版本
echo ============================================
echo.

:: 停止運行中的進程
echo [步驟 1/8] 停止運行中的進程...
powershell -Command "Get-Process -Name node,java,gradle -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue" 2>nul
timeout /t 2 /nobreak >nul
echo ✅ 進程已停止

:: 清除 Vite 快取
echo.
echo [步驟 2/8] 清除 Vite 快取...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✅ Vite 快取已清除
) else (
    echo ℹ️  Vite 快取不存在
)

:: 清除 dist 目錄
echo.
echo [步驟 3/8] 清除 dist 目錄...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ dist 目錄已清除
) else (
    echo ℹ️  dist 目錄不存在
)

:: 清除 Android build 目錄
echo.
echo [步驟 4/8] 清除 Android build 目錄...
if exist "android\app\build" (
    rmdir /s /q "android\app\build"
    echo ✅ Android build 目錄已清除
) else (
    echo ℹ️  Android build 目錄不存在
)

:: 清除 Android assets
echo.
echo [步驟 5/8] 清除 Android assets...
if exist "android\app\src\main\assets" (
    rmdir /s /q "android\app\src\main\assets"
    echo ✅ Android assets 已清除
) else (
    echo ℹ️  Android assets 不存在
)

:: 清除 Gradle 快取
echo.
echo [步驟 6/8] 清除 Gradle 快取...
cd android
if exist ".gradle" (
    rmdir /s /q ".gradle"
    echo ✅ Gradle 快取已清除
) else (
    echo ℹ️  Gradle 快取不存在
)
call gradlew clean --no-daemon
if errorlevel 1 (
    echo ⚠️  Gradle clean 警告，繼續執行...
)
cd ..
echo ✅ Gradle clean 完成

:: 建置 Web 版本
echo.
echo [步驟 7/8] 建置 Web 版本...
call npm run build
if errorlevel 1 (
    echo ❌ Web 建置失敗
    pause
    exit /b 1
)
echo ✅ Web 建置完成

:: 同步到 Android
echo.
echo 同步到 Android...
call npx cap sync android
if errorlevel 1 (
    echo ❌ 同步失敗
    pause
    exit /b 1
)
echo ✅ 同步完成

:: 建置 APK 和 AAB
echo.
echo [步驟 8/8] 建置 APK 和 AAB...
cd android

:: 建置 APK
echo 建置 APK...
call gradlew assembleRelease --no-daemon
if errorlevel 1 (
    echo ❌ APK 建置失敗
    cd ..
    pause
    exit /b 1
)
echo ✅ APK 建置完成

:: 建置 AAB
echo 建置 AAB...
call gradlew bundleRelease --no-daemon
if errorlevel 1 (
    echo ❌ AAB 建置失敗
    cd ..
    pause
    exit /b 1
)
echo ✅ AAB 建置完成

cd ..

:: 顯示結果
echo.
echo ============================================
echo 🎉 所有步驟完成！
echo ============================================
echo.
echo 📦 建置產物位置：
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    for %%A in ("android\app\build\outputs\apk\release\app-release.apk") do (
        echo    APK: android\app\build\outputs\apk\release\app-release.apk (%%~zA bytes)
    )
) else (
    echo    APK: ❌ 未找到
)
if exist "android\app\build\outputs\bundle\release\app-release.aab" (
    for %%A in ("android\app\build\outputs\bundle\release\app-release.aab") do (
        echo    AAB: android\app\build\outputs\bundle\release\app-release.aab (%%~zA bytes)
    )
) else (
    echo    AAB: ❌ 未找到
)
echo.
pause
