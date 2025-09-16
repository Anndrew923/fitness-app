# 從 Google Play Console 獲取 SHA256 指紋

## 步驟：

1. **登入 Google Play Console**

   - 前往 https://play.google.com/console
   - 選擇您的應用程式

2. **進入應用程式簽名**

   - 左側選單 → 發布 → 應用程式簽名
   - 或直接前往：https://play.google.com/console/u/0/developers/console/app/您的應用程式ID/app-signing

3. **複製 SHA-256 指紋**

   - 在「應用程式簽名金鑰憑證」區塊
   - 複製「SHA-256 憑證指紋」

4. **更新 assetlinks.json**
   - 將指紋貼到 `public/.well-known/assetlinks.json`
   - 格式：`"14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:7C:99:8A:83:88:6C:B8:22:4E:39:8B:50:05:03:61:78:16:13"`

## 優點：

- ✅ 不需要輸入密碼
- ✅ 100% 準確
- ✅ 官方推薦方法
- ✅ 適用於所有環境
