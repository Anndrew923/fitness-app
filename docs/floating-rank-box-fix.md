# 浮動排名框修復

## 🚨 問題描述

用戶報告浮動排名框不見了，需要修復第 7 名之後的浮動排名框顯示。

## 🔍 問題分析

### 1. **浮動排名框邏輯檢查**：

- ✅ 浮動排名框函數 `getFloatingRankDisplay()` 存在
- ✅ CSS 樣式 `.floating-rank-display` 和 `.floating-rank-card` 存在
- ✅ 必要的函數導入正確（`formatScore`, `getAgeGroup`）

### 2. **可能的原因**：

- 用戶排名計算邏輯有問題
- 浮動排名框顯示條件不滿足
- 用戶數據載入問題

## 🔧 修復方案

### 1. **增加詳細的調試日誌**

在 `getFloatingRankDisplay()` 函數中添加調試日誌：

```javascript
const getFloatingRankDisplay = () => {
  console.log('🔍 檢查浮動排名框條件:', {
    hasUserData: !!userData,
    hasLadderScore: userData?.ladderScore > 0,
    userRank,
    ladderDataLength: ladderData.length,
  });

  if (!userData || !userData.ladderScore || userData.ladderScore === 0) {
    console.log('❌ 浮動框條件1不滿足：用戶數據或分數問題');
    return null;
  }

  // 檢查用戶是否已經在天梯列表中顯示
  const isUserInList = ladderData.some(user => user.id === userData?.userId);
  console.log('👥 用戶是否在列表中:', isUserInList);

  // 如果用戶已經在列表中顯示，不顯示浮動框
  if (isUserInList) {
    console.log('❌ 浮動框條件2不滿足：用戶已在列表中');
    return null;
  }

  // 如果用戶排名在前7名內，也不顯示浮動框（因為應該在列表中）
  if (userRank > 0 && userRank <= 7) {
    console.log('❌ 浮動框條件3不滿足：用戶排名前7名內');
    return null;
  }

  // 如果用戶排名為0或未上榜，不顯示浮動框
  if (userRank === 0) {
    console.log('❌ 浮動框條件4不滿足：用戶未上榜');
    return null;
  }

  console.log('✅ 浮動框條件滿足，顯示浮動排名框，排名:', userRank);
  // ... 返回浮動排名框組件
};
```

### 2. **修復用戶排名計算邏輯**

當用戶不在前 50 名內時，需要計算實際排名：

```javascript
// 用戶不在當前顯示範圍內，需要計算實際排名
console.log(`📋 用戶不在前50名內，計算實際排名...`);

// 獲取所有用戶數據進行排名計算
try {
  const rankQuery = query(
    collection(db, 'users'),
    orderBy('ladderScore', 'desc')
  );
  const rankSnapshot = await getDocs(rankQuery);
  let rankData = [];

  rankSnapshot.forEach(doc => {
    const userData = doc.data();
    if (userData.ladderScore > 0) {
      // 確保年齡段被正確計算
      const userWithAgeGroup = {
        ...userData,
        ageGroup: userData.age
          ? getAgeGroup(Number(userData.age))
          : userData.ageGroup || '',
      };
      rankData.push(userWithAgeGroup);
    }
  });

  // 客戶端過濾年齡分段
  if (selectedAgeGroup !== 'all') {
    rankData = rankData.filter(user => user.ageGroup === selectedAgeGroup);
  }

  // 客戶端過濾本周新進榜
  if (selectedTab === 'weekly') {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    rankData = rankData.filter(user => {
      if (!user.lastActive) return false;
      const lastActive = new Date(user.lastActive);
      return lastActive >= oneWeekAgo;
    });
  }

  // 重新排序
  rankData.sort((a, b) => b.ladderScore - a.ladderScore);

  // 計算用戶在過濾後數據中的排名
  const userRankIndex = rankData.findIndex(user => user.id === userData.userId);
  const newRank = userRankIndex >= 0 ? userRankIndex + 1 : 0;

  console.log(`🎯 用戶實際排名：第 ${newRank} 名`);
  setUserRank(newRank);
} catch (error) {
  console.error('計算用戶實際排名失敗:', error);
  setUserRank(0);
}
```

## 📊 浮動排名框顯示規則

### 1. **顯示條件**：

- ✅ 用戶有數據且有天梯分數
- ✅ 用戶排名 > 7（第 8 名及之後）
- ✅ 用戶排名 > 0（有排名）

### 2. **不顯示條件**：

- ❌ 用戶沒有數據或沒有天梯分數
- ❌ 用戶排名 ≤ 7（前 7 名）
- ❌ 用戶排名 = 0（未上榜）

## 🎯 調試步驟

### 1. **檢查控制台日誌**：

```
🔍 檢查浮動排名框條件: {hasUserData: true, hasLadderScore: true, userRank: 8, ladderDataLength: 50}
👥 用戶是否在列表中: false
✅ 浮動框條件滿足，顯示浮動排名框，排名: 8
```

### 2. **檢查用戶排名計算**：

```
🎯 用戶排名：第 8 名
📋 用戶不在前50名內，計算實際排名...
🎯 用戶實際排名：第 8 名
```

### 3. **檢查浮動排名框渲染**：

- 浮動排名框應該出現在頁面底部
- 位置：`bottom: 84px`（桌面版）或 `bottom: 74px`（移動版）
- 樣式：白色背景，橙色左邊框，陰影效果

## 🔧 測試建議

### 1. **測試排名第 7 名**：

- 用戶排名第 7 名時，不應顯示浮動框
- 用戶應該在天梯列表中顯示

### 2. **測試排名第 8 名**：

- 用戶排名第 8 名時，應顯示浮動框
- 用戶不應在天梯列表中顯示

### 3. **測試排名第 50 名之後**：

- 用戶排名第 51 名時，應顯示浮動框
- 用戶不應在天梯列表中顯示

### 4. **測試未上榜用戶**：

- 用戶未上榜時，不應顯示浮動框
- 用戶不應在天梯列表中顯示

## 📝 技術細節

### 1. **浮動排名框位置**：

```css
.floating-rank-display {
  position: fixed;
  bottom: 84px; /* 64px導覽列高度 + 20px間距 */
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}
```

### 2. **浮動排名框樣式**：

```css
.floating-rank-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
}
```

### 3. **響應式設計**：

```css
@media (max-width: 768px) {
  .floating-rank-display {
    bottom: 74px;
    padding: 0 16px;
  }
}
```

## 🎯 預期效果

### 1. **正確顯示**：

- 第 8 名及之後的用戶能看到浮動排名框
- 浮動排名框顯示正確的排名、用戶信息和分數
- 浮動排名框位置正確，不遮擋其他內容

### 2. **正確隱藏**：

- 前 7 名用戶不顯示浮動排名框
- 未上榜用戶不顯示浮動排名框

### 3. **用戶體驗**：

- 浮動排名框有懸停效果
- 響應式設計適配不同屏幕
- 動畫效果流暢

## 🔍 故障排除

### 1. **如果浮動排名框仍然不顯示**：

1. 檢查控制台日誌，確認條件是否滿足
2. 檢查用戶排名是否正確計算
3. 檢查 CSS 樣式是否正確載入
4. 檢查是否有其他元素遮擋

### 2. **如果浮動排名框位置不正確**：

1. 檢查導覽列高度是否為 64px
2. 檢查響應式斷點是否正確
3. 檢查 z-index 是否足夠高

### 3. **如果浮動排名框樣式異常**：

1. 檢查 CSS 類名是否正確
2. 檢查樣式是否被其他樣式覆蓋
3. 檢查瀏覽器兼容性
