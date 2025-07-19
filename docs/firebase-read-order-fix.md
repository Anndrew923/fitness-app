# Firebase 讀取順序修復

## 🚨 問題描述

用戶反映即使修復了 `oldRank` 保存邏輯，問題仍然存在。控制台仍然顯示：

```
🔍 排名變化檢測：從第 0 名到第 1 名
🎯 檢測到排名提升：從第 0 名到第 1 名
設置顯示排名為舊排名：0
```

## 🔍 根本原因分析

### Firebase 數據讀取順序問題

問題出在 Firebase 數據讀取和狀態更新的時序上：

1. **UserContext 載入用戶數據** → 更新 `userData`
2. **Ladder 組件初始化** → `userRank = 0`（因為還沒有載入天梯數據）
3. **useEffect 觸發** → 檢查 `userRank > 0`，但此時 `userRank` 還是 0
4. **loadLadderData 執行** → 計算出正確的排名，但 `previousUserData` 已經被設置為 0

### 關鍵問題

- `useEffect` 依賴 `userRank`，但 `userRank` 的更新是在 `loadLadderData` 中進行的
- 這造成了時序問題：排名計算完成前，`previousUserData` 就已經被初始化為 0

## 🛠️ 修復方案

### 1. **新增預保存機制**

在 `userData` 變化時就預先保存用戶數據，避免等待排名計算：

```javascript
// 新增：在 userData 變化時保存舊排名，避免 Firebase 讀取順序問題
useEffect(() => {
  if (userData && userData.ladderScore > 0 && !previousUserData) {
    // 如果這是第一次載入且有分數，先保存用戶數據，等待排名計算
    console.log(
      `📊 預保存用戶數據，等待排名計算：ladderScore=${userData.ladderScore}`
    );
    setPreviousUserData({
      ...userData,
      currentRank: null, // 先設為 null，等待 loadLadderData 計算
    });
  }
}, [userData?.ladderScore]); // 只監聽 ladderScore 變化
```

### 2. **修改排名計算邏輯**

在 `loadLadderData` 中處理首次排名計算：

```javascript
// 如果是第一次計算排名，保存當前排名
if (previousUserData && previousUserData.currentRank === null) {
  console.log(`🎯 首次計算排名：${newRank}`);
  setPreviousUserData(prev => ({
    ...prev,
    currentRank: newRank,
  }));
}

// 保存舊排名到用戶數據中，用於動畫檢測
if (userData && oldRank !== newRank && oldRank !== null) {
  console.log(`🔍 排名變化檢測：從第 ${oldRank} 名到第 ${newRank} 名`);
  // ... 動畫邏輯
}
```

### 3. **修改動畫觸發條件**

只在 `currentRank` 不為 `null` 時才檢查排名變化：

```javascript
} else if (userData && previousUserData && previousUserData.currentRank !== null) {
  // 檢查是否有排名變化（只有在 currentRank 不為 null 時才檢查）
  const oldRank = previousUserData.currentRank || 0;
  const newRank = userRank || 0;
  // ... 動畫邏輯
}
```

## 🎯 修復流程

### 階段 1：用戶數據載入

1. UserContext 從 Firebase 載入用戶數據
2. `userData.ladderScore` 變化觸發預保存
3. 設置 `previousUserData.currentRank = null`

### 階段 2：排名計算

1. `loadLadderData` 執行，計算出正確排名
2. 檢測到 `currentRank === null`，設置為計算出的排名
3. 不會觸發動畫（因為是首次計算）

### 階段 3：數據更新

1. 用戶更新分數，觸發重新計算
2. `oldRank` 是正確的舊排名
3. 觸發從舊排名到新排名的動畫

## 📊 預期效果

### 修復後的日誌

```
📊 預保存用戶數據，等待排名計算：ladderScore=85.2
🎯 首次計算排名：3
🔍 排名變化檢測：從第 3 名到第 1 名
🎯 檢測到排名提升：從第 3 名到第 1 名
設置顯示排名為舊排名：3
```

## 🔧 技術細節

### 關鍵修復點

1. **預保存機制**：在排名計算前就保存用戶數據
2. **null 標記**：使用 `null` 標記首次計算狀態
3. **條件檢查**：只在非首次計算時觸發動畫
4. **時序控制**：避免 Firebase 讀取順序導致的問題

### 狀態管理流程

```javascript
// 1. 用戶數據載入
userData.ladderScore = 85.2
→ 設置 previousUserData.currentRank = null

// 2. 排名計算
loadLadderData() 計算出排名 = 3
→ 設置 previousUserData.currentRank = 3

// 3. 數據更新
用戶更新分數，新排名 = 1
→ oldRank = 3, newRank = 1
→ 觸發動畫
```

## 🚀 優勢

1. **解決時序問題**：避免 Firebase 讀取順序導致的初始化問題
2. **避免誤觸發**：首次載入不會觸發動畫
3. **正確保存**：確保舊排名被正確保存
4. **穩定可靠**：不依賴於特定的執行順序
