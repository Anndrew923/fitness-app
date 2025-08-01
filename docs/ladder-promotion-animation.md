# 天梯晉升動畫系統

## 🎯 功能概述

天梯晉升動畫系統為用戶提供視覺化的排名提升反饋，增強用戶的成就感和參與感。當用戶完成評測並獲得更高的天梯分數時，系統會自動觸發晉升動畫效果。

## ✨ 動畫效果

### 1. 晉升提示訊息

- **位置**：頁面頂部居中
- **樣式**：漸變背景，火箭圖標
- **動畫**：從上方滑入，火箭彈跳效果
- **內容**：顯示排名提升位數

### 2. 用戶項目浮起效果

- **浮起高度**：20px
- **放大效果**：1.1 倍
- **陰影效果**：動態陰影增強立體感
- **光暈效果**：漸變光暈環繞

### 3. 其他用戶擠開動畫

- **向上擠開**：排名在用戶新排名範圍內的項目向上移動
- **向下擠開**：排名在用戶舊排名範圍內的項目向下移動
- **透明度**：移動過程中透明度降低到 0.8

### 4. 粒子爆炸效果

- **粒子數量**：12 個
- **隨機方向**：360 度隨機散開
- **隨機大小**：3-7px
- **隨機顏色**：橙色系漸變
- **動畫時長**：1.8 秒

## 🔧 技術實現

### 核心組件

- `Ladder.jsx` - 主要邏輯組件
- `Ladder.css` - 動畫樣式

### 狀態管理

```javascript
const [promotionAnimation, setPromotionAnimation] = useState({
  isActive: false, // 動畫是否激活
  oldRank: 0, // 舊排名
  newRank: 0, // 新排名
  direction: 'up', // 動畫方向
  progress: 0, // 動畫進度 (0-1)
});
```

### 觸發機制

1. **分數變化檢測**：監聽 `userData.ladderScore` 變化
2. **排名計算**：重新載入天梯數據計算新排名
3. **動畫觸發**：比較新舊排名，觸發相應動畫

### 性能優化

- **GPU 加速**：使用 `transform` 和 `opacity` 屬性
- **will-change**：提示瀏覽器優化
- **動畫降級**：支持 `prefers-reduced-motion`
- **高刷新率優化**：使用 `translateZ(0)` 強制硬體加速

## 📱 手機端優化

### 響應式設計

- **粒子數量**：手機端減少粒子數量
- **動畫時長**：適當縮短動畫時間
- **觸摸優化**：確保動畫不影響觸摸操作

### 性能考慮

- **電池優化**：減少不必要的動畫
- **記憶體管理**：及時清理粒子元素
- **流暢度**：確保 60fps 動畫效果

## 🎮 使用方法

### 自動觸發

當用戶完成評測並返回天梯頁面時，系統會自動檢測分數變化並觸發動畫。

### 手動測試（開發模式）

在開發環境中，可以使用測試按鈕手動觸發晉升動畫：

```javascript
// 測試按鈕只在開發環境顯示
{
  process.env.NODE_ENV === 'development' && (
    <button onClick={testPromotionAnimation}>🎬 測試晉升動畫</button>
  );
}
```

## 🎨 自定義配置

### 動畫參數調整

```css
/* 浮起高度 */
--float-height: 20px;

/* 放大倍數 */
--scale-factor: 1.1;

/* 粒子數量 */
--particle-count: 12;

/* 動畫時長 */
--animation-duration: 0.6s;
```

### 顏色主題

```css
/* 晉升主題色 */
--promotion-primary: #ff6b35;
--promotion-secondary: #f7931e;
--promotion-accent: #ffd700;
```

## 🚀 未來擴展

### 可能的增強功能

1. **音效支持**：添加晉升音效
2. **更多粒子效果**：不同類型的粒子動畫
3. **成就系統**：與成就系統整合
4. **社交分享**：晉升時自動生成分享內容
5. **動畫預設**：多種動畫風格選擇

### 性能監控

- 動畫幀率監控
- 記憶體使用量追蹤
- 用戶互動數據收集

## 📋 注意事項

### 生產環境

- 移除測試按鈕
- 確保動畫不會影響核心功能
- 監控動畫對性能的影響

### 無障礙性

- 支持 `prefers-reduced-motion`
- 提供動畫開關選項
- 確保動畫不會干擾螢幕閱讀器

### 瀏覽器兼容性

- 測試主流瀏覽器支持
- 提供降級方案
- 確保移動端瀏覽器兼容性

## 🔍 故障排除

### 常見問題

1. **動畫不觸發**：檢查分數變化檢測邏輯
2. **粒子不顯示**：檢查 z-index 和定位
3. **性能問題**：減少粒子數量或動畫複雜度
4. **手機端卡頓**：優化動畫參數

### 調試工具

- 瀏覽器開發者工具
- 動畫性能面板
- 記憶體使用監控
