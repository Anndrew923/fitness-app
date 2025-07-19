# 實時排名顯示修復

## 🚨 問題描述

用戶反映：更新分數後進入天梯頁面，排名已經變成第 1 名，無法看到從第 3 名擠開對手的過程。

### 具體問題

1. **數據同步過快**：用戶數據在後台已經更新
2. **視覺效果缺失**：用戶看不到排名變化過程
3. **擠開效果無效**：無法看到其他用戶被擠開

## 🔍 問題分析

### 根本原因

1. **排名顯示邏輯**：直接使用 `userRank` 顯示當前排名
2. **動畫觸發時機**：動畫觸發時排名已經更新
3. **視覺連貫性**：缺少從舊排名到新排名的過渡

### 技術挑戰

- 需要暫時顯示舊排名
- 動畫期間保持視覺一致性
- 動畫完成後更新為新排名

## 🛠️ 修復方案

### 1. **新增顯示排名狀態**

```javascript
// 新增：顯示用的排名
const [displayUserRank, setDisplayUserRank] = useState(0);
```

### 2. **修改排名顯示邏輯**

```javascript
// 使用displayUserRank來顯示排名，讓用戶看到變化過程
const rankToShow = displayUserRank > 0 ? displayUserRank : userRank;
return rankToShow > 0 ? `第 ${rankToShow} 名` : '未上榜';
```

### 3. **動畫觸發時設置舊排名**

```javascript
// 先顯示舊排名，讓用戶看到變化
setDisplayUserRank(oldRank);
console.log(`👁️ 設置顯示排名為舊排名：${oldRank}`);

// 延遲觸發動畫，讓用戶先看到舊排名
setTimeout(() => {
  setPromotionAnimation({
    isActive: true,
    oldRank: oldRank,
    newRank: newRank,
    direction: 'up',
    progress: 0,
  });
}, 1000); // 延遲1秒讓用戶確認舊排名
```

### 4. **動畫完成後更新排名**

```javascript
// 動畫完成後，更新顯示排名為新排名
setDisplayUserRank(userRank);
console.log(`✅ 動畫完成，更新顯示排名為新排名：${userRank}`);
```

### 5. **修改動畫樣式邏輯**

```javascript
// 在動畫期間，始終顯示在舊排名位置，然後飛到新位置
const initialOffset = (oldRank - currentRank) * 80;
```

## 🎬 新的動畫流程

### 階段 1：檢測排名變化 (0ms)

- 檢測到排名從第 3 名提升到第 1 名
- 設置 `displayUserRank = 3`
- 用戶看到自己位於第 3 名

### 階段 2：顯示舊排名 (0-1000ms)

- 用戶確認自己原本在第 3 名
- 排名顯示為"第 3 名"
- 準備開始動畫

### 階段 3：動畫執行 (1000-3000ms)

- 排名卡從第 3 名位置開始
- 沿弧線飛向第 1 名位置
- 其他用戶被擠開
- 排名數字從"3"變成"1"

### 階段 4：動畫完成 (3000ms+)

- 排名卡降落到第 1 名位置
- 設置 `displayUserRank = 1`
- 用戶看到最終排名"第 1 名"

## 📊 技術實現細節

### 狀態管理

```javascript
// 三個相關狀態
const [userRank, setUserRank] = useState(0);           // 實際排名
const [displayUserRank, setDisplayUserRank] = useState(0); // 顯示排名
const [promotionAnimation, setPromotionAnimation] = useState({...}); // 動畫狀態
```

### 同步邏輯

```javascript
// 如果沒有動畫，同步更新顯示排名
if (!promotionAnimation.isActive) {
  setDisplayUserRank(userRank);
}
```

### 動畫位置計算

```javascript
// 從舊排名位置飛到新排名位置
const oldPosition = (oldRank - 1) * 80;
const newPosition = (newRank - 1) * 80;
const horizontalMove = (newPosition - oldPosition) * flyProgress;
const initialOffset = (oldRank - currentRank) * 80;
```

## 🎯 預期效果

### 用戶體驗

1. **進入天梯頁面**：看到自己位於第 3 名
2. **確認位置**：1 秒內確認排名位置
3. **觀看動畫**：看到排名卡從第 3 名飛到第 1 名
4. **擠開效果**：看到第 1 名和第 2 名被擠開
5. **最終結果**：看到自己成為第 1 名

### 控制台日誌

```
🎯 檢測到排名提升：從第 3 名到第 1 名
👁️ 設置顯示排名為舊排名：3
🎬 設置動畫狀態：oldRank=3, newRank=1
🎬 開始執行動畫：從第 3 名到第 1 名
🎨 動畫進度：粗男教主 - 10%
🎨 動畫進度：粗男教主 - 20%
...
🎨 動畫進度：粗男教主 - 100%
⏱️ 動畫性能：總耗時 2000.00ms
✅ 動畫完成，更新顯示排名為新排名：1
```

## 🔧 測試步驟

### 1. **準備測試環境**

1. 確保用戶當前排名為第 3 名
2. 準備提高評測分數

### 2. **執行測試**

1. 在 UserInfo 頁面提高評測分數
2. 切換到天梯頁面
3. 觀察是否先看到第 3 名
4. 等待 1 秒後觀察動畫
5. 確認擠開效果

### 3. **驗證結果**

- ✅ 進入頁面時顯示第 3 名
- ✅ 1 秒後開始動畫
- ✅ 排名卡從第 3 名飛到第 1 名
- ✅ 其他用戶被擠開
- ✅ 動畫完成後顯示第 1 名

## 🚀 優化建議

### 1. **用戶體驗**

- 添加動畫開始提示
- 可選的動畫跳過功能
- 動畫速度調節

### 2. **性能優化**

- 動畫緩存機制
- 低端設備適配
- 動畫開關選項

### 3. **功能擴展**

- 支持排名下降動畫
- 多種動畫效果
- 音效配合
