# 天梯提交機制修復

## 🚨 問題描述

用戶報告天梯頁面會自動連動更新，不需要點擊"提交到天梯"按鈕。經過分析發現以下問題：

### 1. **自動計算天梯分數**

- UserContext 中的 `setUserData` 函數會自動計算 `ladderScore`
- 每次更新 `scores` 時都會觸發天梯分數重新計算
- 導致天梯頁面自動更新，無需手動提交

### 2. **提交按鈕功能缺失**

- 雖然有提交按鈕和確認對話框
- 但天梯分數已經自動更新，按鈕失去意義
- 用戶體驗混亂

## 🔧 修復方案

### 1. **移除自動天梯分數計算**

**修復前**：

```javascript
// UserContext.jsx
// 計算天梯分數和年齡段
if (newData.scores) {
  const oldLadderScore = userData.ladderScore || 0;
  newData.ladderScore = calculateLadderScore(newData.scores); // 自動計算

  if (newData.age) {
    newData.ageGroup = getAgeGroup(newData.age);
  }
}
```

**修復後**：

```javascript
// UserContext.jsx
// 計算年齡段（天梯分數不再自動計算）
if (newData.age) {
  newData.ageGroup = getAgeGroup(newData.age);
}
```

### 2. **明確提交機制**

**修復前**：

```javascript
// UserInfo.jsx
// 計算天梯分數
const ladderScore = useMemo(() => {
  const scores = userData?.scores || DEFAULT_SCORES;
  return calculateLadderScore(scores);
}, [userData?.scores]);
```

**修復後**：

```javascript
// UserInfo.jsx
// 計算當前天梯分數（用於顯示，不影響已提交的分數）
const currentLadderScore = useMemo(() => {
  const scores = userData?.scores || DEFAULT_SCORES;
  return calculateLadderScore(scores);
}, [userData?.scores]);

// 獲取已提交的天梯分數
const submittedLadderScore = userData?.ladderScore || 0;
```

### 3. **提交確認邏輯**

```javascript
// UserInfo.jsx
const confirmSubmitToLadder = useCallback(async () => {
  // 關閉確認對話框
  setSubmitConfirmModal({ isOpen: false, remainingCount: 0 });

  try {
    setLoading(true);

    // 計算天梯分數
    const scores = userData.scores || {};
    const ladderScore = calculateLadderScore(scores);

    // 更新用戶數據，明確設置天梯分數和提交時間
    setUserData({
      ...userData,
      ladderScore: ladderScore,
      lastLadderSubmission: new Date().toISOString(),
    });

    // 顯示成功訊息
    setModalState({
      isOpen: true,
      title: '提交成功',
      message: `您的分數 ${ladderScore} 已成功提交到天梯！`,
      type: 'success',
      onAction: () => navigate('/ladder'),
      actionText: '立即查看天梯',
    });
  } catch (error) {
    console.error('提交到天梯失敗:', error);
    setModalState({
      isOpen: true,
      title: '提交失敗',
      message: '提交到天梯時發生錯誤，請稍後再試',
      type: 'error',
    });
  } finally {
    setLoading(false);
  }
}, [userData, setUserData, loading, navigate]);
```

## 📊 修復效果

### 功能改進

- **明確提交機制**：只有點擊"提交到天梯"按鈕才會更新天梯分數
- **分數區分**：區分當前計算分數和已提交分數
- **用戶體驗**：提供清晰的提交流程和反饋

### 界面優化

- **分數顯示**：顯示已提交分數和當前計算分數
- **按鈕文字**：根據狀態顯示"提交到天梯"或"更新天梯分數"
- **視覺提示**：當有新的分數需要提交時提供提示

### 數據管理

- **分離邏輯**：評測分數和天梯分數分離管理
- **提交記錄**：記錄最後提交時間
- **狀態追蹤**：追蹤提交狀態和次數

## 🎯 技術細節

### 1. **分數計算邏輯**

```javascript
// 當前計算分數（用於顯示）
const currentLadderScore = calculateLadderScore(scores);

// 已提交分數（用於排名）
const submittedLadderScore = userData?.ladderScore || 0;
```

### 2. **提交狀態檢查**

```javascript
// 檢查是否有新的分數需要提交
const needsSubmission =
  currentLadderScore > 0 && currentLadderScore !== submittedLadderScore;
```

### 3. **排名計算**

```javascript
// 基於已提交的分數計算排名
const fetchUserRank = useCallback(async () => {
  if (!userData?.userId || !submittedLadderScore || submittedLadderScore <= 0) {
    setUserRank(null);
    return;
  }
  // ... 排名計算邏輯
}, [userData?.userId, submittedLadderScore]);
```

## 🔍 用戶體驗

### 1. **評測完成後**

- 顯示當前計算的天梯分數
- 提示用戶需要提交才能參與排名
- 提供"提交到天梯"按鈕

### 2. **提交後**

- 顯示已提交的分數
- 更新天梯排名
- 提供查看天梯的選項

### 3. **分數更新**

- 當評測分數改變時，顯示新的計算分數
- 提示用戶需要重新提交
- 按鈕文字變為"更新天梯分數"

## 📝 最佳實踐

### 1. **數據分離**

- 評測分數和天梯分數分開管理
- 避免自動更新造成的混亂
- 提供明確的提交流程

### 2. **用戶反饋**

- 即時顯示當前計算分數
- 明確區分已提交和未提交的分數
- 提供清晰的提交狀態提示

### 3. **錯誤處理**

- 提交失敗時提供錯誤信息
- 保持數據一致性
- 提供重試機制

## 🚀 未來優化方向

### 1. **提交限制**

- 實現每日提交次數限制
- 添加提交冷卻時間
- 提供提交歷史記錄

### 2. **數據驗證**

- 添加分數合理性檢查
- 防止異常數據提交
- 提供數據修正機制

### 3. **用戶體驗**

- 添加提交動畫效果
- 提供提交進度指示
- 優化錯誤提示信息
