@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ============================================
echo 完整清理快取並生成 Release APK
echo ============================================
echo.

:: 設置 JAVA_HOME（如果未設置）
echo [步驟 0/10] 設置 JAVA_HOME...
if "%JAVA_HOME%"=="" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    echo ✅ JAVA_HOME 已設置: %JAVA_HOME%
) else (
    echo ℹ️  JAVA_HOME 已存在: %JAVA_HOME%
)

:: 停止運行中的進程
echo.
echo [步驟 1/10] 停止運行中的進程...
powershell -Command "Get-Process -Name node,java,gradle -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue" 2>nul
timeout /t 2 /nobreak >nul
echo ✅ 進程已停止

:: 清除 npm 快取
echo.
echo [步驟 2/10] 清除 npm 快取...
call npm cache clean --force
if errorlevel 1 (
    echo ⚠️  npm 快取清理警告，繼續執行...
) else (
    echo ✅ npm 快取已清除
)

:: 清除 Vite 快取
echo.
echo [步驟 3/10] 清除 Vite 快取...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo ✅ Vite 快取已清除
) else (
    echo ℹ️  Vite 快取不存在
)

:: 清除 dist 目錄
echo.
echo [步驟 4/10] 清除 dist 目錄...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✅ dist 目錄已清除
) else (
    echo ℹ️  dist 目錄不存在
)

:: 清除 Android build 目錄
echo.
echo [步驟 5/10] 清除 Android build 目錄...
if exist "android\app\build" (
    rmdir /s /q "android\app\build"
    echo ✅ Android build 目錄已清除
) else (
    echo ℹ️  Android build 目錄不存在
)

:: 清除 Android assets
echo.
echo [步驟 6/10] 清除 Android assets...
if exist "android\app\src\main\assets" (
    rmdir /s /q "android\app\src\main\assets"
    echo ✅ Android assets 已清除
) else (
    echo ℹ️  Android assets 不存在
)

:: 清除 Android .gradle 目錄
echo.
echo [步驟 7/10] 清除 Android .gradle 目錄...
cd android
if exist ".gradle" (
    rmdir /s /q ".gradle"
    echo ✅ Android .gradle 目錄已清除
) else (
    echo ℹ️  Android .gradle 目錄不存在
)
cd ..

:: 清除 Gradle 全局快取（用戶目錄）
echo.
echo [步驟 8/10] 清除 Gradle 全局快取...
set "GRADLE_USER_HOME=%USERPROFILE%\.gradle"
if exist "%GRADLE_USER_HOME%\caches" (
    echo 正在清除 Gradle 全局快取（這可能需要一些時間）...
    powershell -Command "Remove-Item -Path '%GRADLE_USER_HOME%\caches' -Recurse -Force -ErrorAction SilentlyContinue"
    echo ✅ Gradle 全局快取已清除
) else (
    echo ℹ️  Gradle 全局快取不存在
)

:: 執行 Gradle clean
echo.
echo [步驟 9/10] 執行 Gradle clean...
cd android
call gradlew clean --no-daemon --console=plain
if errorlevel 1 (
    echo ⚠️  Gradle clean 警告，繼續執行...
) else (
    echo ✅ Gradle clean 完成
)
cd ..

:: 建置 Web 版本
echo.
echo [步驟 10/10] 建置 Web 版本...
call npm run build
if errorlevel 1 (
    echo ❌ Web 建置失敗
    pause
    exit /b 1
)
echo ✅ Web 建置完成

:: 同步到 Android（關鍵步驟！）
echo.
echo [同步步驟] 同步到 Android（關鍵步驟）...
call npx cap sync android
if errorlevel 1 (
    echo ❌ 同步失敗
    pause
    exit /b 1
)
echo ✅ 同步完成

:: 建置 Release APK
echo.
echo [建置步驟] 建置 Release APK...
cd android
call gradlew assembleRelease --no-daemon --console=plain
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
        set /a "sizeMB=%%~zA / 1048576"
        set /a "sizeKB=%%~zA / 1024"
        echo    android\app\build\outputs\apk\release\app-release.apk
        echo    檔案大小: !sizeMB! MB ^(!sizeKB! KB / %%~zA bytes^)
    )
    echo.
    echo ✅ Release APK 已成功生成！
) else (
    echo    ❌ APK 未找到
    echo.
    echo ⚠️  請檢查建置日誌以找出問題
)
echo.
pause

