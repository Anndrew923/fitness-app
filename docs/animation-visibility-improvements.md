# 天梯動畫可見性改進與顯示範圍優化

## 🎯 問題分析

用戶反映的兩個關鍵問題：

1. **動畫效果不明顯**：用戶進入時已經在新排名位置，看不到從舊排名飛昇的效果
2. **顯示範圍不適合**：總是顯示前 50 名，而不是以用戶排名為中心的範圍

## 🔧 修復方案

### 1. **修復動畫觸發時機**

#### 問題根源

用戶進入天梯頁面時，`displayUserRank` 已經被設置為新排名，所以看不到從舊排名開始的動畫。

#### 修復方案

```javascript
// 重要：設置顯示排名為舊排名，讓用戶看到從舊排名開始的動畫
setDisplayUserRank(oldRank);
console.log(`👁️ 設置顯示排名為舊排名：${oldRank}，準備動畫`);

// 延遲觸發動畫，讓用戶先看到舊排名位置
setTimeout(() => {
  console.log(`🎬 開始動畫：從第 ${oldRank} 名飛昇到第 ${newRank} 名`);
  setPromotionAnimation({
    isActive: true,
    oldRank: oldRank,
    newRank: newRank,
    direction: 'up',
    progress: 0,
  });
}, 1500); // 增加延遲時間，讓用戶清楚看到起始位置
```

### 2. **優化顯示範圍**

#### 原來的邏輯

```javascript
const limitCount = showUserContext && userRank > 50 ? userRank + 15 : 50;
```

#### 新的邏輯

```javascript
// 計算查詢限制：以用戶排名為中心顯示
let limitCount = 50; // 默認顯示50名
if (userData && userData.ladderRank > 0) {
  // 如果用戶有排名，以用戶排名為中心顯示前後各25名
  const userRank = userData.ladderRank;
  limitCount = Math.max(50, userRank + 25);
  console.log(
    `🎯 以用戶排名為中心顯示：用戶排名=${userRank}, 查詢限制=${limitCount}`
  );
}
```

## 🎨 動畫效果增強

### 1. **增強飛昇效果**

#### 原來的參數

```javascript
const floatHeight = 35; // 初始浮起高度
const flyHeight = 150; // 飛行高度
const scale = 1 + progress * 0.2; // 放大效果
const glowIntensity = progress * 0.5; // 發光強度
```

#### 增強後的參數

```javascript
const floatHeight = 50; // 增加初始浮起高度
const flyHeight = 200; // 增加飛行高度
const scale = 1 + progress * 0.3; // 增加放大效果
const glowIntensity = progress * 0.8; // 增加發光強度

// 添加脈衝效果
const pulseScale = 1 + Math.sin(progress * Math.PI * 4) * 0.05;
```

### 2. **增強擠開效果**

#### 原來的效果

```javascript
const moveDistance = 80 * progress; // 移動距離
const fadeIntensity = progress * 0.3;
```

#### 增強後的效果

```javascript
const moveDistance = 100 * progress; // 增加移動距離
const fadeIntensity = progress * 0.4;
const shakeIntensity = progress * 0.1; // 添加震動效果

return {
  transform: `translateY(${moveDistance}px) translateX(${
    Math.sin(progress * Math.PI * 8) * shakeIntensity
  }px)`,
  opacity: 1 - fadeIntensity * 0.6, // 增加透明度變化
  filter: `brightness(${0.8 + (1 - progress) * 0.2})`,
};
```

### 3. **新增 CSS 動畫效果**

#### 脈衝動畫

```css
@keyframes promotionPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
```

#### 震動動畫

```css
@keyframes promotionShake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}
```

#### 軌跡效果

```css
.promotion-trail {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.8) 0%,
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 999;
  animation: trailFade 1s ease-out forwards;
}
```

## 📊 預期效果

### 修復前

```
用戶進入天梯頁面
→ 直接看到第1名位置
→ 動畫效果不明顯
→ 顯示前50名，用戶在第15名看不到自己
```

### 修復後

```
用戶進入天梯頁面
→ 先看到第3名位置（舊排名）
→ 1.5秒後開始動畫
→ 清楚看到從第3名飛昇到第1名
→ 顯示以用戶排名為中心的範圍（第15名用戶看到第1-40名）
```

## 🎯 使用場景優化

### 1. **高排名用戶（前 10 名）**

- 顯示範圍：前 50 名
- 動畫效果：明顯的飛昇和擠開效果
- 用戶體驗：清楚看到排名變化

### 2. **中等排名用戶（11-50 名）**

- 顯示範圍：以用戶排名為中心，前後各 25 名
- 動畫效果：適中的飛昇效果
- 用戶體驗：看到自己的排名和周圍競爭者

### 3. **低排名用戶（50 名以後）**

- 顯示範圍：以用戶排名為中心，前後各 25 名
- 動畫效果：從未上榜到上榜的特殊效果
- 用戶體驗：激勵性的上榜動畫

## 🔍 動畫流程

### 1. **進入頁面**

```
🔥 從 Firebase 讀取舊排名：3
🎯 以用戶排名為中心顯示：用戶排名=3, 查詢限制=28
👁️ 設置顯示排名為舊排名：3，準備動畫
```

### 2. **動畫準備**

```
用戶看到自己在第3名位置
等待1.5秒，讓用戶清楚看到起始位置
```

### 3. **動畫執行**

```
🎬 開始動畫：從第 3 名飛昇到第 1 名
🎨 動畫進度：用戶名稱 - 50%
🎨 動畫進度：用戶名稱 - 100%
```

### 4. **動畫完成**

```
✅ 動畫完成，更新顯示排名為新排名：1
🧹 動畫完成，清除 localStorage 中的舊排名數據（保留 Firebase ladderRank）
```

## 🚀 性能優化

### 1. **動畫性能**

- 使用 `willChange` 屬性優化渲染
- 使用 `transform` 而不是改變位置屬性
- 使用 `requestAnimationFrame` 優化動畫幀率

### 2. **顯示範圍優化**

- 動態計算查詢限制，避免過度查詢
- 客戶端過濾減少服務器負載
- 智能緩存減少重複請求

### 3. **用戶體驗優化**

- 延遲動畫觸發，讓用戶先看到起始位置
- 增強視覺效果，讓動畫更明顯
- 添加震動和脈衝效果，增加互動感

## 📝 測試建議

### 1. **動畫可見性測試**

1. 完成評測，記錄當前排名
2. 進入天梯頁面
3. 觀察是否先看到舊排名位置
4. 等待 1.5 秒後觀察動畫效果

### 2. **顯示範圍測試**

1. 不同排名的用戶進入天梯
2. 檢查顯示範圍是否以用戶排名為中心
3. 驗證查詢限制是否合理

### 3. **動畫效果測試**

1. 觀察飛昇效果是否明顯
2. 檢查擠開效果是否自然
3. 驗證視覺效果是否增強

## 🎯 預期改進

### 1. **動畫可見性**

- 用戶清楚看到從舊排名開始的動畫
- 飛昇效果更加明顯和戲劇化
- 擠開效果更加自然和流暢

### 2. **顯示範圍**

- 用戶總能看到自己的排名
- 顯示範圍以用戶為中心
- 提供更好的競爭視角

### 3. **用戶體驗**

- 更強的成就感
- 更清晰的排名變化感知
- 更好的視覺反饋

## 🔧 技術細節

### 動畫觸發時機

```javascript
// 確保用戶先看到舊排名位置
setDisplayUserRank(oldRank);

// 延遲觸發動畫
setTimeout(() => {
  setPromotionAnimation({
    isActive: true,
    oldRank: oldRank,
    newRank: newRank,
    direction: 'up',
    progress: 0,
  });
}, 1500);
```

### 顯示範圍計算

```javascript
// 以用戶排名為中心的顯示範圍
const userRank = userData.ladderRank;
const limitCount = Math.max(50, userRank + 25);

// 查詢足夠的數據以支持過濾
const queryLimit = limitCount * 2;
```

### 動畫效果增強

```javascript
// 增強視覺效果
const enhancedStyle = {
  transform: `translateY(-${floatHeight + flyDistance}px) translateX(${
    horizontalMove + initialOffset
  }px) scale(${scale * pulseScale})`,
  boxShadow: `0 ${30 * progress}px ${60 * progress}px rgba(255, 107, 53, ${
    0.8 + glowIntensity
  })`,
  filter: `brightness(${1 + progress * 0.4}) contrast(${1 + progress * 0.2})`,
  animation:
    progress > 0.5
      ? 'promotionGlow 0.5s ease-in-out infinite alternate'
      : 'none',
};
```
