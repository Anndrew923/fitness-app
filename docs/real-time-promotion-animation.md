# 實時晉升動畫實現

## 🎯 問題描述

用戶反映：更新分數後進入天梯頁面時，排名已經變成第 1 名，無法看到從第 3 名到第 1 名的變化過程。

## 🔍 問題分析

### 原有問題

1. **數據同步問題**：用戶數據在後台已經更新
2. **動畫觸發時機**：動畫在數據載入時就觸發
3. **視覺效果缺失**：用戶看不到排名變化過程

### 解決方案

1. **延遲動畫觸發**：讓用戶先看到舊排名
2. **實時排名顯示**：動畫期間顯示正確的排名
3. **視覺路徑**：從舊位置飛到新位置

## 🛠️ 技術實現

### 1. **動畫觸發邏輯**

```javascript
// 檢查是否有排名變化
if (oldRank > 0 && newRank > 0 && oldRank !== newRank && newRank < oldRank) {
  // 有排名提升，延遲觸發動畫
  setTimeout(() => {
    setPromotionAnimation({
      isActive: true,
      oldRank: oldRank,
      newRank: newRank,
      direction: 'up',
      progress: 0,
    });
  }, 500); // 延遲500ms讓用戶看到舊排名
}
```

### 2. **排名顯示邏輯**

```javascript
// 動畫期間顯示正確的排名
{
  promotionAnimation.isActive &&
  user.id === userData?.userId &&
  promotionAnimation.progress > 0.3
    ? promotionAnimation.newRank // 動畫後期顯示新排名
    : promotionAnimation.isActive && user.id === userData?.userId
    ? promotionAnimation.oldRank // 動畫期間顯示舊排名
    : index + 1;
} // 正常顯示當前排名
```

### 3. **位置計算邏輯**

```javascript
// 在動畫開始時，顯示在舊排名位置
const initialOffset = progress < 0.1 ? (oldRank - currentRank) * 80 : 0;

// 計算飛行路徑
const horizontalMove = (newPosition - oldPosition) * flyProgress;

// 最終變換
transform: `translateY(-${floatHeight + flyDistance}px) translateX(${
  horizontalMove + initialOffset
}px) scale(${scale})`;
```

## 🎬 動畫流程

### 階段 1：初始顯示 (0-500ms)

- 用戶進入天梯頁面
- 看到自己位於第 3 名位置
- 排名數字顯示"3"

### 階段 2：動畫準備 (500ms)

- 檢測到排名變化
- 延遲 500ms 讓用戶確認位置
- 準備開始動畫

### 階段 3：動畫執行 (500ms-3s)

- 排名卡從第 3 名位置浮起
- 沿弧線飛向第 1 名位置
- 排名數字從"3"變成"1"
- 其他用戶被擠開

### 階段 4：動畫完成 (3s+)

- 排名卡降落到第 1 名位置
- 粒子爆炸效果
- 動畫狀態重置

## 📊 用戶體驗

### 1. **視覺確認**

- 用戶能清楚看到自己原本在第 3 名
- 確認排名變化確實發生
- 增強成就感

### 2. **動畫效果**

- 從舊位置到新位置的完整路徑
- 排名數字的動態變化
- 擠開效果的視覺衝擊

### 3. **時間控制**

- 500ms 延遲讓用戶準備
- 2.5 秒動畫時間適中
- 總體體驗流暢

## 🔧 調試功能

### 1. **開發環境**

- 詳細的控制台日誌
- 動畫狀態監控
- 性能計時

### 2. **測試按鈕**

- 手動觸發動畫
- 模擬排名變化
- 驗證動畫效果

## 🎯 預期效果

### 用戶操作流程

1. **更新分數**：在 UserInfo 頁面修改評測分數
2. **進入天梯**：切換到天梯頁面
3. **看到舊排名**：確認自己原本在第 3 名
4. **觀看動畫**：看到排名卡從第 3 名飛到第 1 名
5. **享受成就感**：體驗完整的晉升過程

### 視覺效果

- 排名卡從第 3 名位置浮起
- 沿優美弧線飛向第 1 名位置
- 排名數字 3D 翻轉從"3"變成"1"
- 第 1 名和第 2 名被往下擠
- 最終降落到第 1 名位置

## 🚀 優化建議

### 1. **用戶反饋**

- 添加音效配合
- 震動反饋（移動端）
- 社交分享功能

### 2. **性能優化**

- 動畫緩存機制
- 低端設備適配
- 動畫開關選項

### 3. **功能擴展**

- 支持多種排名變化
- 自定義動畫效果
- 成就系統整合
