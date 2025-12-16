@echo off
chcp 65001 >nul
echo ============================================
echo 生成 1.22 版 APK（完整清理模式）
echo ============================================
echo.

:: 驗證版本號
echo [驗證] 檢查版本號...
findstr /C:"versionName \"1.22\"" android\app\build.gradle >nul
if errorlevel 1 (
    echo ❌ 錯誤：版本號不是 1.22
    echo 請確認 android\app\build.gradle 中的 versionName 為 "1.22"
    pause
    exit /b 1
)
echo ✅ 版本號確認：1.22

:: 設置 JAVA_HOME（如果未設置）
echo.
echo [步驟 0/8] 設置 JAVA_HOME...
if "%JAVA_HOME%"=="" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    echo ✅ JAVA_HOME 已設置: %JAVA_HOME%
) else (
    echo ℹ️  JAVA_HOME 已存在: %JAVA_HOME%
)

:: 停止運行中的進程
echo.
echo [步驟 1/8] 停止運行中的進程...
powershell -Command "Get-Process -Name node,java,gradle -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue" 2>nul
timeout /t 2 /nobreak >nul
echo ✅ 進程已停止

:: 清除 Vite 快取
echo.
echo [步驟 2/8] 清除 Vite 快取...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite" 2>nul
    echo ✅ Vite 快取已清除
) else (
    echo ℹ️  Vite 快取不存在
)

:: 清除 dist 目錄
echo.
echo [步驟 3/8] 清除 dist 目錄...
if exist "dist" (
    rmdir /s /q "dist" 2>nul
    echo ✅ dist 目錄已清除
) else (
    echo ℹ️  dist 目錄不存在
)

:: 清除 Android build 目錄
echo.
echo [步驟 4/8] 清除 Android build 目錄...
if exist "android\app\build" (
    rmdir /s /q "android\app\build" 2>nul
    echo ✅ Android build 目錄已清除
) else (
    echo ℹ️  Android build 目錄不存在
)

:: 清除 Android assets
echo.
echo [步驟 5/8] 清除 Android assets...
if exist "android\app\src\main\assets" (
    rmdir /s /q "android\app\src\main\assets" 2>nul
    echo ✅ Android assets 已清除
) else (
    echo ℹ️  Android assets 不存在
)

:: 清除 Gradle 快取
echo.
echo [步驟 6/8] 清除 Gradle 快取...
cd android
if exist ".gradle" (
    rmdir /s /q ".gradle" 2>nul
    echo ✅ Gradle 快取已清除
) else (
    echo ℹ️  Gradle 快取不存在
)
call gradlew clean --no-daemon --console=plain
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

:: 同步到 Android（關鍵步驟）
echo.
echo [步驟 8/8] 同步所有資料到 Android（關鍵步驟）...
call npx cap sync android
if errorlevel 1 (
    echo ❌ 同步失敗
    pause
    exit /b 1
)
echo ✅ 同步完成

:: 建置 APK（僅 APK，不建置 AAB）
echo.
echo ============================================
echo 建置 Release APK（版本 1.22）...
echo ============================================
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
        echo    路徑: android\app\build\outputs\apk\release\app-release.apk
        echo    大小: %%~zA bytes (%%~zA / 1048576 MB)
        echo    版本: 1.22
    )
) else (
    echo    ❌ APK 未找到
)
echo.
echo ✅ 所有快取已清除
echo ✅ 所有資料已同步
echo ✅ APK 已生成（版本 1.22）
echo.
pause

