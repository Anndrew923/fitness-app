# 舊排名保存修復

## 🚨 問題描述

用戶反映控制台顯示 `oldRank=0`，而不是用戶的原始排名（如第3名），導致無法正確觸發從第3名到第1名的動畫。

### 具體問題

```
🔍 排名變化檢測：從第 0 名到第 3 名
🎯 檢測到排名提升：從第 0 名到第 3 名
設置顯示排名為舊排名：0
```

## 🔍 問題分析

### 根本原因

1. **排名保存時機錯誤**：在 `loadLadderData` 中，`oldRank = userRank` 這行代碼有問題
2. **初始化邏輯缺陷**：當用戶第一次載入天梯頁面時，`userRank` 是 0
3. **數據更新順序**：用戶數據更新時，排名還沒有重新計算
4. **重複的 useEffect 邏輯**：兩個 useEffect 都在處理 `previousUserData` 初始化，導致衝突
5. **錯誤的保存邏輯**：在第二個分支中保存了 `userRank` 而不是 `oldRank`

### 技術挑戰

- 需要在用戶數據更新前保存舊排名
- 需要正確處理第一次載入的情況
- 需要確保排名變化的準確檢測
- 需要避免 useEffect 之間的衝突

## 🛠️ 修復方案

### 1. **修改初始化邏輯**

#### 修復前

```javascript
if (userData && !previousUserData) {
  setPreviousUserData({
    ...userData,
    currentRank: userRank, // 可能設置為0
  });
}
```

#### 修復後

```javascript
// 只在 userRank > 0 時初始化
if (userData && !previousUserData && userRank > 0) {
  setPreviousUserData({
    ...userData,
    currentRank: userRank,
  });
}
```

### 2. **修復 loadLadderData 中的 oldRank 計算**

#### 修復前

```javascript
// 第一個分支
const oldRank = userRank; // ❌ 問題：userRank可能是0

// 第二個分支
setPreviousUserData(prev => ({
  ...prev,
  currentRank: userRank, // ❌ 問題：保存的是userRank而不是oldRank
}));
```

#### 修復後

```javascript
// 第一個分支
const oldRank = previousUserData?.currentRank || userRank; // ✅ 使用previousUserData

// 第二個分支
setPreviousUserData(prev => ({
  ...prev,
  currentRank: oldRank, // ✅ 保存舊排名
}));
```

### 3. **移除衝突的 useEffect**

#### 修復前

```javascript
// 第一個 useEffect
useEffect(() => {
  // 處理 previousUserData 初始化
}, [userData, userRank]);

// 第二個 useEffect（衝突）
useEffect(() => {
  // 處理 previousUserData 初始化
}, [userRank, previousUserData, userData]); // ❌ 包含 previousUserData 導致無限循環
```

#### 修復後

```javascript
// 只保留第一個 useEffect
useEffect(() => {
  // 處理 previousUserData 初始化
}, [userData, userRank]); // ✅ 移除衝突的 useEffect
```

## 🎯 修復流程

### 階段1：初始化 (用戶首次進入天梯)
1. 用戶進入天梯頁面
2. userRank 被計算為3
3. 檢測到 userRank > 0 且 !previousUserData
4. 保存 currentRank = 3

### 階段2：數據更新
1. 用戶更新分數
2. 觸發重新計算
3. oldRank = 3, newRank = 1
4. 觸發動畫

## 📊 預期效果

### 修復後的日誌

```
🔄 初始化previousUserData：userRank=3
🔍 排名變化檢測：從第 3 名到第 1 名
🎯 檢測到排名提升：從第 3 名到第 1 名
設置顯示排名為舊排名：3
```

## 🔧 測試步驟

1. 清除緩存重新載入
2. 確認初始化日誌顯示正確排名
3. 更新分數並檢查動畫

## 🚀 技術細節

### 關鍵修復點

1. **使用 `previousUserData?.currentRank` 作為 `oldRank`**
2. **只在 `userRank > 0` 時初始化 `previousUserData`**
3. **移除衝突的 useEffect**
4. **正確保存 `oldRank` 而不是 `userRank`**

### 狀態管理流程

```javascript
// 1. 初始化
previousUserData.currentRank = null
userRank = 3
→ 設置 previousUserData.currentRank = 3

// 2. 數據更新
previousUserData.currentRank = 3
userRank = 3 (舊排名)
newRank = 1 (新排名)
→ oldRank = 3, newRank = 1

// 3. 動畫觸發
→ 從第3名到第1名的動畫
→ 保存 oldRank = 3 為下次的基準
```
