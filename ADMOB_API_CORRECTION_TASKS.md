# AdMob API 修正任務指令

## 📋 任務概覽

根據 `@capacitor-community/admob` 6.0.0 的官方文檔，修正目前實作中的 API 使用問題，確保橫幅廣告能正常顯示。

---

## 🔴 任務 1：修正 AdBanner.jsx 中的 AdMob API 使用（高優先級）

### 問題描述

目前在 `src/components/AdBanner.jsx` 第 64-104 行的原生平台廣告載入邏輯中，使用了：
- `AdMob.prepareBanner(bannerOptions)`
- `AdMob.showBanner({ adId, adPosition })`

**可能問題：**
1. API 方法名稱可能不正確
2. 參數格式可能不符合官方文檔要求
3. 缺少必要的參數或使用了錯誤的參數

### 執行步驟

#### 步驟 1：查閱官方文檔

1. **查閱 GitHub 官方文檔：**
   - 訪問：https://github.com/capacitor-community/admob
   - 查閱 6.0.0 版本的 README.md 和 API 文檔
   - 確認橫幅廣告（Banner Ad）的正確使用方式

2. **查閱 npm 文檔：**
   - 訪問：https://www.npmjs.com/package/@capacitor-community/admob
   - 查看 API 範例和使用說明

3. **確認正確的 API：**
   - 橫幅廣告是否需要先 `prepare` 再 `show`？
   - 還是直接使用 `showBanner`？
   - 參數格式如何？（`adId`、`adSize`、`position`、`margin` 等）

#### 步驟 2：修正 AdBanner.jsx

**修正位置：** `src/components/AdBanner.jsx` 第 64-104 行

**目前程式碼：**
```javascript
// 準備橫幅廣告
const adId = isDevelopment || isTestMode
  ? 'ca-app-pub-3940256099942544/6300978111' // 測試 ID
  : finalAdUnitId;

const bannerOptions = {
  adId: adId,
  adSize: 'BANNER',
  position: position === 'top' ? 'TOP_CENTER' : 'BOTTOM_CENTER',
  margin: 0,
};

// 載入橫幅廣告
await AdMob.prepareBanner(bannerOptions);
await AdMob.showBanner({
  adId: adId,
  adPosition: bannerOptions.position,
});
```

**修正方向（根據官方文檔）：**

1. **如果官方文檔顯示需要使用 `BannerAd` 類別：**
```javascript
import { BannerAd } from '@capacitor-community/admob';

const bannerAd = new BannerAd({
  adId: adId,
  adSize: BannerAdSize.BANNER,
  position: BannerAdPosition.BOTTOM_CENTER,
  margin: 0,
});

await bannerAd.prepare();
await bannerAd.show();
```

2. **如果官方文檔顯示直接使用 `AdMob.showBanner`：**
```javascript
await AdMob.showBanner({
  adId: adId,
  adSize: BannerAdSize.BANNER,
  position: BannerAdPosition.BOTTOM_CENTER,
  margin: 0,
});
```

3. **如果官方文檔顯示使用不同的方法名稱：**
   - 根據文檔調整方法名稱和參數

**注意事項：**
- ✅ 確保使用正確的 enum 類型（如 `BannerAdSize`、`BannerAdPosition`）
- ✅ 確保參數名稱與官方文檔一致
- ✅ 確保參數類型正確（字串 vs enum）

#### 步驟 3：確認並修正 App.jsx 中的初始化

**修正位置：** `src/App.jsx` 第 176-180 行

**目前程式碼：**
```javascript
await AdMob.initialize({
  requestTrackingAuthorization: true,
  testingDevices: isDevelopment || isTestMode ? [] : undefined,
  initializeForTesting: isDevelopment || isTestMode,
});
```

**修正方向（根據官方文檔）：**

1. **確認初始化參數：**
   - `requestTrackingAuthorization` 是否正確？
   - `testingDevices` 參數格式是否正確？
   - `initializeForTesting` 是否存在？

2. **可能的正確格式：**
```javascript
await AdMob.initialize({
  requestTrackingAuthorization: true,
  // 其他參數根據文檔調整
});
```

#### 步驟 4：測試驗證

1. **修正後執行測試：**
```bash
# 1. 同步 Capacitor
npx cap sync android

# 2. 建置 Debug APK
cd android
gradlew assembleDebug

# 3. 安裝並測試
# - 確認 AdMob 初始化日誌
# - 檢查廣告是否顯示
# - 查看錯誤日誌
```

2. **檢查日誌：**
   - 確認初始化成功
   - 確認廣告載入成功
   - 如果失敗，檢查錯誤訊息並根據官方文檔調整

### 產出要求

1. ✅ **列出查閱的官方文檔來源：**
   - GitHub 連結：_____________
   - npm 連結：_____________
   - 使用的 API 版本：6.0.0

2. ✅ **標註修正的 API 使用方式：**
   - 橫幅廣告 API：`AdMob._______()` 或 `BannerAd._______()`
   - 初始化 API：`AdMob.initialize({ ... })`

3. ✅ **確認修正後的程式碼符合官方文檔範例：**
   - 附上官方文檔範例截圖或連結
   - 對照修正後的程式碼

---

## 🔴 任務 2：修正原生平台合規檢查問題（高優先級）

### 問題描述

目前在 `src/components/AdBanner.jsx` 第 52-59 行的合規檢查邏輯中：
```javascript
const pageContent = document.body?.innerText || '';
const currentPage = window.location?.pathname?.replace('/', '') || 'home';
```

**問題：**
- 在原生平台（Android/iOS），`document.body?.innerText` 可能無法取得實際內容
- 原生平台無法像 Web 那樣取得 DOM 文字內容
- 這可能導致合規檢查失敗或不準確

### 執行步驟

#### 步驟 1：分析平台差異

1. **Web 平台：**
   - ✅ 可以使用 `document.body.innerText` 取得頁面內容
   - ✅ 可以使用 `window.location.pathname` 取得路由

2. **原生平台（Android/iOS）：**
   - ❌ `document.body.innerText` 可能返回空字串或不準確
   - ✅ 可以使用 `window.location.pathname` 取得路由
   - ✅ 可以使用 React Router 的 `useLocation()` hook

#### 步驟 2：修正 AdBanner.jsx

**修正位置：** `src/components/AdBanner.jsx` 第 52-59 行

**修正方案：**

1. **導入 React Router：**
```javascript
import { useLocation } from 'react-router-dom';
```

2. **在組件中使用 useLocation：**
```javascript
const AdBanner = ({ ... }) => {
  const location = useLocation(); // 新增
  const isNativePlatform = Capacitor.isNativePlatform();

  // ... 其他程式碼 ...

  // 修正合規檢查邏輯
  let pageContent = '';
  let currentPage = 'home';

  if (isNativePlatform) {
    // 原生平台：從路由取得頁面識別
    currentPage = location.pathname?.replace('/', '') || 'home';
    // 原生平台無法取得實際內容，使用頁面名稱作為識別
    // 合規檢查將主要基於頁面名稱而非內容
    pageContent = currentPage;
  } else {
    // Web 平台：使用 DOM 內容
    pageContent = document.body?.innerText || '';
    currentPage = location.pathname?.replace('/', '') || 'home';
  }

  if (!preAdDisplayCheck(currentPage, pageContent)) {
    console.log('AdMob 合規檢查失敗，不顯示廣告');
    return;
  }
};
```

#### 步驟 3：調整 adMobCompliance.js（如果需要）

**檢查位置：** `src/utils/adMobCompliance.js`

**確認事項：**
1. `preAdDisplayCheck()` 函數是否能接受頁面名稱作為主要識別？
2. 是否需要調整檢查邏輯，使其更適合原生平台？

**如果需要的話：**
```javascript
export const preAdDisplayCheck = (pageName, pageContent) => {
  // 評測頁面特殊處理
  const testPages = ['strength', 'cardio', 'explosive-power', 'muscle-mass', 'body-fat'];

  if (testPages.includes(pageName)) {
    // 評測頁面直接顯示廣告（基於頁面名稱）
    return true;
  }

  // 原生平台：主要基於頁面名稱進行檢查
  if (!pageContent || pageContent === pageName) {
    // 如果無法取得內容，使用頁面名稱進行檢查
    const allowedPages = ['community', 'history'];
    return allowedPages.includes(pageName);
  }

  // Web 平台：正常內容檢查
  const compliance = AdMobCompliance.checkContentPolicy(pageName, pageContent);
  return compliance.isCompliant;
};
```

#### 步驟 4：測試驗證

1. **測試 Web 平台：**
   - 確認 `document.body.innerText` 正常工作
   - 確認合規檢查正常執行

2. **測試原生平台：**
   - 確認能從 `location.pathname` 取得頁面名稱
   - 確認合規檢查基於頁面名稱正常執行
   - 確認不會因為無法取得內容而失敗

### 產出要求

1. ✅ **說明修正後的邏輯：**
   - Web 平台如何取得頁面資訊：_____________
   - 原生平台如何取得頁面資訊：_____________

2. ✅ **確認合規檢查在原生平台能正常運作：**
   - 測試結果：_____________
   - 是否有任何問題：_____________

---

## 📝 執行順序

1. **先執行任務 1（API 修正）：** 確保廣告功能正常
2. **再執行任務 2（合規檢查修正）：** 確保合規檢查正常運作

---

## ⚠️ 注意事項

### 查閱官方文檔
- ✅ **務必查閱 `@capacitor-community/admob` 6.0.0 的官方文檔**
- ✅ **確認正確的 API 使用方式**
- ✅ **不要根據舊版本或猜測使用 API**

### 保持向後相容
- ✅ **確保 Web 平台的現有邏輯不受影響**
- ✅ **確保原生平台的變更不影響 Web 平台**

### 錯誤處理
- ✅ **確保原生平台錯誤不會影響 App 啟動**
- ✅ **加入適當的錯誤處理和日誌記錄**

### 測試驗證
- ✅ **修正後務必在實際裝置上測試**
- ✅ **確認廣告顯示正常**
- ✅ **確認合規檢查正常執行**

---

## 📚 參考資料

### 官方文檔連結
- **GitHub：** https://github.com/capacitor-community/admob
- **npm：** https://www.npmjs.com/package/@capacitor-community/admob
- **Capacitor 官方：** https://capacitorjs.com/

### 相關檔案
- `src/components/AdBanner.jsx` - 廣告組件
- `src/App.jsx` - App 初始化
- `src/utils/adMobCompliance.js` - 合規檢查模組
- `package.json` - 專案依賴（@capacitor-community/admob 6.0.0）

---

## ✅ 完成檢查清單

### 任務 1：API 修正
- [ ] 查閱官方文檔（GitHub 和 npm）
- [ ] 確認正確的 API 使用方式
- [ ] 修正 `AdBanner.jsx` 中的 API 使用
- [ ] 修正 `App.jsx` 中的初始化參數
- [ ] 測試驗證廣告顯示正常
- [ ] 確認程式碼符合官方文檔範例

### 任務 2：合規檢查修正
- [ ] 分析平台差異
- [ ] 修正 `AdBanner.jsx` 中的合規檢查邏輯
- [ ] 調整 `adMobCompliance.js`（如果需要）
- [ ] 測試驗證 Web 平台
- [ ] 測試驗證原生平台
- [ ] 確認合規檢查正常運作

---

**建立日期：** 2025-01-13
**最後更新：** 2025-01-13
**狀態：** ⚠️ 待執行
