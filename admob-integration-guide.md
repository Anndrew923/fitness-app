# AdMob 整合指南

## 1. 申請 AdMob 帳戶

1. 前往 [Google AdMob](https://admob.google.com/)
2. 使用您的 Google 帳戶登入
3. 創建新的應用程式「最強肉體」
4. 獲取廣告單元 ID

## 2. 安裝 AdMob SDK

```bash
npm install react-native-google-mobile-ads
```

## 3. 更新 AndroidManifest.xml

在 `app/src/main/AndroidManifest.xml` 中添加：

```xml
<uses-permission android:name="com.google.android.gms.permission.AD_ID" />
```

## 4. 更新廣告組件

將 `src/components/AdBanner.jsx` 更新為：

```jsx
import React from 'react';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';

const AdBanner = ({ position = 'bottom', showAd = true }) => {
  if (!showAd) return null;

  return (
    <BannerAd
      unitId={TestIds.BANNER} // 測試時使用，正式時替換為您的廣告單元 ID
      size={BannerAdSize.BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
    />
  );
};

export default AdBanner;
```

## 5. 更新 Google Play Console 聲明

1. 前往 Google Play Console
2. 選擇「應用程式內容」
3. 將廣告 ID 聲明改為「是」
4. 添加必要的權限聲明

## 6. 測試流程

1. 在內部測試中驗證廣告顯示
2. 確保廣告不影響應用程式功能
3. 測試不同頁面的廣告表現
4. 確認收益數據正常

## 7. 正式上線

1. 將測試廣告單元 ID 替換為正式 ID
2. 重新構建並上傳 AAB
3. 開始獲得廣告收益

## 注意事項

- 測試期間使用 `TestIds.BANNER`
- 正式上線時使用真實的廣告單元 ID
- 確保符合 Google Play 政策
- 監控廣告表現和用戶體驗
