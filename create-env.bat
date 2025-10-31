@echo off
echo 正在創建 .env 檔案...

echo # Firebase Configuration > .env
echo VITE_FIREBASE_API_KEY=AIzaSyBepeUQJpu0wPI0Y_G3NadXsf8_UJmwM1M >> .env
echo VITE_FIREBASE_AUTH_DOMAIN=fitness-app-69f08.firebaseapp.com >> .env
echo VITE_FIREBASE_PROJECT_ID=fitness-app-69f08 >> .env
echo VITE_FIREBASE_STORAGE_BUCKET=fitness-app-69f08.firebasestorage.app >> .env
echo VITE_FIREBASE_MESSAGING_SENDER_ID=5144099869 >> .env
echo VITE_FIREBASE_APP_ID=1:5144099869:android:1df863a1fa04e89bce1af4 >> .env
echo. >> .env
echo # Google Auth Configuration >> .env
echo VITE_GOOGLE_CLIENT_ID=5144099869-6kes2g.apps.googleusercontent.com >> .env
echo VITE_GOOGLE_ANDROID_CLIENT_ID=5144099869-n8eqotfij5eg6gv97e9s83l22kgqgm6i.apps.googleusercontent.com >> .env
echo. >> .env
echo # AdMob Configuration >> .env
echo VITE_ADMOB_APP_ID=ca-app-pub-5869708488609837~6490454632 >> .env
echo VITE_ADMOB_BANNER_ID=ca-app-pub-5869708488609837/1189068634 >> .env
echo VITE_ADMOB_ENABLED=true >> .env
echo VITE_ADMOB_TEST_MODE=false >> .env

echo 完成！.env 檔案已建立。
pause
