@echo off
echo ============================================
echo Google 登入修復完整建置流程
echo ============================================
echo.

echo [步驟 1/4] 創建 .env 檔案...
(
echo # Firebase Configuration
echo VITE_FIREBASE_API_KEY=AIzaSyBepeUQJpu0wPI0Y_G3NadXsf8_UJmwM1M
echo VITE_FIREBASE_AUTH_DOMAIN=fitness-app-69f08.firebaseapp.com
echo VITE_FIREBASE_PROJECT_ID=fitness-app-69f08
echo VITE_FIREBASE_STORAGE_BUCKET=fitness-app-69f08.firebasestorage.app
echo VITE_FIREBASE_MESSAGING_SENDER_ID=5144099869
echo VITE_FIREBASE_APP_ID=1:5144099869:android:1df863a1fa04e89bce1af4
echo.
echo # Google Auth Configuration
echo VITE_GOOGLE_CLIENT_ID=5144099869-6kes2g.apps.googleusercontent.com
echo VITE_GOOGLE_ANDROID_CLIENT_ID=5144099869-n8eqotfij5eg6gv97e9s83l22kgqgm6i.apps.googleusercontent.com
echo.
echo # AdMob Configuration
echo VITE_ADMOB_APP_ID=ca-app-pub-5869708488609837~6490454632
echo VITE_ADMOB_BANNER_ID=ca-app-pub-5869708488609837/1189068634
echo VITE_ADMOB_ENABLED=true
echo VITE_ADMOB_TEST_MODE=false
) > .env
echo ✅ .env 檔案已建立

echo.
echo [步驟 2/4] 建置 Web 版本...
call npm run build
if errorlevel 1 (
    echo ❌ Web 建置失敗
    pause
    exit /b 1
)
echo ✅ Web 建置完成

echo.
echo [步驟 3/4] 同步到 Android...
call npx cap sync android
if errorlevel 1 (
    echo ❌ 同步失敗
    pause
    exit /b 1
)
echo ✅ 同步完成

echo.
echo [步驟 4/4] 建置 Android APK...
cd android
call gradlew assembleRelease
if errorlevel 1 (
    echo ❌ APK 建置失敗
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ APK 建置完成

echo.
echo ============================================
echo 🎉 所有步驟完成！
echo ============================================
echo APK 位置: android\app\build\outputs\apk\release\app-release.apk
echo.
pause
