
🚀 Netlify 部署指令

方法一：使用 Netlify CLI
1. 安裝 Netlify CLI: npm install -g netlify-cli
2. 登入: netlify login
3. 部署: netlify deploy --prod --dir=dist

方法二：使用 Netlify 網站
1. 前往 https://app.netlify.com/
2. 點擊 "New site from Git"
3. 連接您的 Git 倉庫
4. 設置構建命令: npm run build
5. 設置發布目錄: dist
6. 添加環境變數 (見 netlify-env-template.txt)
7. 點擊 "Deploy site"

方法三：拖拽部署
1. 前往 https://app.netlify.com/
2. 將 dist 文件夾拖拽到部署區域
3. 在 Site settings 中設置環境變數

🔧 環境變數設置
在 Netlify 控制台的 Site settings > Environment variables 中添加：
# Netlify 環境變數設置
# 在 Netlify 控制台的 Site settings > Environment variables 中設置

VITE_ADMOB_APP_ID=ca-app-pub-5869708488609837~6490454632
VITE_ADMOB_BANNER_ID=ca-app-pub-5869708488609837/1189068634
VITE_ADMOB_ENABLED=true
VITE_ADMOB_TEST_MODE=false

# Firebase 配置 (如果使用)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_firebase_app_id


📊 部署後檢查
1. 訪問部署的網站
2. 打開開發者工具
3. 檢查控制台中的 AdMob 配置狀態
4. 測試不同頁面的廣告顯示
5. 在 AdMob 控制台監控收益

🔗 相關鏈接
- Netlify 控制台: https://app.netlify.com/
- AdMob 控制台: https://admob.google.com/
- 部署狀態: 檢查 Netlify 控制台的 Deploys 頁面
