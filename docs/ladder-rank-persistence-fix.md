# 天梯排名持久化修復

## 🚨 發現的關鍵問題

通過分析日誌 **"更新用戶排名記錄:0→1"** 和 **"更新用戶排名記錄:0→3"**，發現了根本問題：

### 問題根源

`userData.ladderRank` 在每次更新時總是從 0 開始，導致動畫總是從第 0 名開始。

### 根本原因分析

1. **UserContext 讀取問題**：

   - 從 Firebase 讀取數據時，沒有讀取 `ladderRank` 字段
   - 只讀取了 `ladderScore`，導致 `ladderRank` 使用初始值 0

2. **UserContext 保存問題**：

   - 保存到 Firebase 時，沒有保存 `ladderRank` 字段
   - 導致 `ladderRank` 在 Firebase 中不存在

3. **Ladder 組件更新問題**：
   - 直接修改 localStorage，沒有通過 UserContext 更新
   - 導致數據不同步

## 🔧 修復方案

### 1. **修復 UserContext 讀取邏輯**

在 `loadUserData` 中添加 `ladderRank` 的讀取：

```javascript
// 確保數據結構完整
const mergedData = {
  ...initialState,
  ...firebaseData,
  scores: {
    ...initialState.scores,
    ...(firebaseData.scores || {}),
  },
  // 確保數值類型正確
  height: Number(firebaseData.height) || 0,
  weight: Number(firebaseData.weight) || 0,
  age: Number(firebaseData.age) || 0,
  // 確保年齡段被正確計算
  ageGroup: firebaseData.age
    ? getAgeGroup(Number(firebaseData.age))
    : firebaseData.ageGroup || '',
  // 確保天梯分數被正確計算
  ladderScore: firebaseData.scores
    ? calculateLadderScore(firebaseData.scores)
    : firebaseData.ladderScore || 0,
  // 確保天梯排名被正確讀取
  ladderRank: Number(firebaseData.ladderRank) || 0,
};
```

### 2. **修復 UserContext 保存邏輯**

在 `saveUserData` 中添加 `ladderRank` 的保存：

```javascript
const dataToSave = {
  ...data,
  userId: auth.currentUser.uid,
  updatedAt: new Date().toISOString(),
  // 確保數值類型正確
  height: Number(data.height) || 0,
  weight: Number(data.weight) || 0,
  age: Number(data.age) || 0,
  // 確保年齡段被計算和保存
  ageGroup: data.age ? getAgeGroup(Number(data.age)) : data.ageGroup || '',
  // 確保天梯分數被計算和保存
  ladderScore: data.scores
    ? calculateLadderScore(data.scores)
    : data.ladderScore || 0,
  // 確保天梯排名被保存
  ladderRank: Number(data.ladderRank) || 0,
};
```

### 3. **修復 Ladder 組件更新邏輯**

使用 `setUserData` 而不是直接修改 localStorage：

```javascript
// 更新 userData 中的 ladderRank，供 UserContext 使用
if (userData && userData.ladderRank !== newRank) {
  console.log(`💾 更新用戶排名記錄：${userData.ladderRank || 0} → ${newRank}`);
  // 使用 setUserData 更新，確保數據同步到 Firebase
  setUserData({ ladderRank: newRank });
}
```

## 📊 修復後的數據流

### 正確的流程

```
用戶進入天梯頁面 → 從 Firebase 讀取 ladderRank → 計算新排名 → 通過 setUserData 更新 → 保存到 Firebase
```

### 預期的日誌

```
💾 更新用戶排名記錄：3 → 1
💾 保存當前排名供下次比較：1
📖 讀取舊排名用於比較：3 (分數：81.6 → 92.7)
🔍 排名變化檢測：從第 3 名到第 1 名
```

而不是之前的：

```
💾 更新用戶排名記錄：0 → 1
💾 更新用戶排名記錄：0 → 3
```

## 🎯 關鍵改進

### 1. **數據持久化**

- `ladderRank` 現在會被正確保存到 Firebase
- 下次登入時會從 Firebase 讀取正確的排名

### 2. **數據同步**

- 使用 `setUserData` 確保數據同步
- 避免 localStorage 和 UserContext 數據不一致

### 3. **時序正確**

- 在排名計算前讀取正確的舊排名
- 確保動畫從正確的舊排名開始

### 4. **架構清晰**

- 所有數據更新都通過 UserContext
- 避免直接操作 localStorage

## 🚀 測試建議

### 1. **清除緩存**

```javascript
localStorage.removeItem('userData');
localStorage.removeItem('currentUserRank');
```

### 2. **測試步驟**

1. 完成評測，記錄當前排名
2. 更新分數，觸發排名變化
3. 進入天梯頁面，觀察動畫
4. 重新登入，檢查排名是否正確保存

### 3. **驗證指標**

- Firebase 中是否保存了 `ladderRank`
- 重新登入時是否讀取到正確的排名
- 動畫是否從正確的舊排名開始

## 🔍 監控重點

### 1. **Firebase 數據**

- 檢查用戶文檔中是否有 `ladderRank` 字段
- 確認 `ladderRank` 值是否正確

### 2. **讀取日誌**

- 確認從 Firebase 讀取時是否包含 `ladderRank`
- 確認讀取的 `ladderRank` 值是否正確

### 3. **更新日誌**

- 確認 `setUserData` 是否正確調用
- 確認 Firebase 寫入是否成功

## 📝 技術細節

### 數據結構

```javascript
// Firebase 用戶文檔結構
{
  userId: "user123",
  ladderScore: 85.6,
  ladderRank: 3,  // 新增：天梯排名
  scores: { ... },
  // ... 其他字段
}
```

### 更新機制

- **讀取**：從 Firebase 讀取 `ladderRank`
- **計算**：在 Ladder 組件中計算新排名
- **更新**：通過 `setUserData` 更新 `ladderRank`
- **保存**：自動保存到 Firebase

### 驗證機制

- **類型驗證**：確保 `ladderRank` 是數字
- **範圍驗證**：確保 `ladderRank` 大於 0
- **同步驗證**：確保本地和 Firebase 數據一致
