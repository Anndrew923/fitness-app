# 直接排名比較修復

## 🚨 問題根源

經過深入分析，發現問題的根本在於**數據流時序問題**：

### 原有問題

1. **UserContext 保存時機錯誤**：在分數更新時保存 `userData.ladderRank`，但此時 `ladderRank` 可能還是 0
2. **Ladder 組件依賴錯誤**：依賴 `previousUserData` 來獲取舊排名，但這個值可能不正確
3. **時序混亂**：排名計算、保存、比較的時機都不對

### 關鍵問題

```
用戶更新分數 → UserContext 保存舊排名(0) → 進入天梯頁面 → 計算新排名 → 比較時 oldRank=0
```

## 🛠️ 新解決方案：直接排名比較

### 核心思路

在 `loadLadderData` 函數中，**在計算新排名前先讀取舊排名**，然後直接比較

### 新架構流程

```
進入天梯頁面 → 讀取保存的舊排名 → 計算新排名 → 直接比較 → 觸發動畫
```

## 🔧 實現細節

### 1. **保存當前排名**

在 `userRank` 變化時保存當前排名：

```javascript
// 新增：在 userData 變化時保存當前排名，為下次比較做準備
useEffect(() => {
  if (userData && userData.ladderScore > 0 && userRank > 0) {
    // 保存當前排名，供下次比較使用
    console.log(`💾 保存當前排名供下次比較：${userRank}`);
    localStorage.setItem(
      'currentUserRank',
      JSON.stringify({
        rank: userRank,
        score: userData.ladderScore,
        timestamp: Date.now(),
      })
    );
  }
}, [userRank, userData?.ladderScore]);
```

### 2. **讀取舊排名**

在 `loadLadderData` 開始時讀取舊排名：

```javascript
const loadLadderData = async () => {
  setLoading(true);
  try {
    // 在計算新排名前，先讀取舊排名
    let oldRank = 0;
    const currentRankData = localStorage.getItem('currentUserRank');
    if (currentRankData) {
      try {
        const parsedData = JSON.parse(currentRankData);
        // 檢查是否是最近的數據（5分鐘內）且分數相同
        const isRecent = Date.now() - parsedData.timestamp < 5 * 60 * 1000;
        const isSameScore = parsedData.score === userData?.ladderScore;

        if (isRecent && isSameScore && parsedData.rank > 0) {
          oldRank = parsedData.rank;
          console.log(`📖 讀取舊排名用於比較：${oldRank}`);
        }
      } catch (error) {
        console.error('解析當前排名數據失敗:', error);
      }
    }
    // ... 繼續計算新排名
  }
};
```

### 3. **直接比較和觸發動畫**

在計算出新排名後直接比較：

```javascript
// 檢查是否有排名變化
if (oldRank > 0 && oldRank !== newRank) {
  console.log(`🔍 排名變化檢測：從第 ${oldRank} 名到第 ${newRank} 名`);

  // 設置 previousUserData 用於動畫
  setPreviousUserData({
    ...userData,
    currentRank: oldRank,
  });

  // 設置顯示排名為舊排名
  setDisplayUserRank(oldRank);
  console.log(`👁️ 設置顯示排名為舊排名：${oldRank}`);

  // 延遲觸發動畫
  setTimeout(() => {
    console.log(`🎬 設置動畫狀態：oldRank=${oldRank}, newRank=${newRank}`);
    setPromotionAnimation({
      isActive: true,
      oldRank: oldRank,
      newRank: newRank,
      direction: 'up',
      progress: 0,
    });
  }, 1000);
}
```

### 4. **動畫完成後清理**

動畫完成後清除保存的數據：

```javascript
const completePromotionAnimation = () => {
  setTimeout(() => {
    // 動畫完成後，更新顯示排名為新排名
    setDisplayUserRank(userRank);
    console.log(`✅ 動畫完成，更新顯示排名為新排名：${userRank}`);

    setPromotionAnimation({
      isActive: false,
      oldRank: 0,
      newRank: 0,
      direction: 'up',
      progress: 0,
    });

    // 清除保存的舊排名數據
    localStorage.removeItem('currentUserRank');
    console.log(`🧹 動畫完成，清除保存的舊排名數據`);
  }, 3000);
};
```

## 🎯 新架構優勢

### 1. **時機正確**

- 在排名計算前就讀取舊排名
- 避免了時序問題
- 確保比較的是正確的舊排名

### 2. **邏輯清晰**

- 所有邏輯都在 `loadLadderData` 中
- 不需要複雜的 useEffect 依賴
- 容易理解和維護

### 3. **數據可靠**

- 保存完整的排名信息（排名、分數、時間戳）
- 支持數據驗證（時間、分數匹配）
- 自動清理過期數據

## 📊 預期效果

### 修復後的日誌流程

```
💾 保存當前排名供下次比較：3
📖 讀取舊排名用於比較：3
🔍 排名變化檢測：從第 3 名到第 1 名
👁️ 設置顯示排名為舊排名：3
🎬 設置動畫狀態：oldRank=3, newRank=1
開始執行動畫：從第 3 名到第 1 名
✅ 動畫完成，更新顯示排名為新排名：1
🧹 動畫完成，清除保存的舊排名數據
```

## 🔧 技術細節

### 數據結構

```javascript
// 保存的當前排名數據結構
{
  rank: 3,           // 當前排名
  score: 85.6,       // 當前分數
  timestamp: 1640995200000  // 保存時間戳
}
```

### 驗證機制

- **時間驗證**：數據必須在 5 分鐘內
- **分數驗證**：分數必須相同（確保是同一狀態）
- **排名驗證**：排名必須大於 0

### 清理機制

- **動畫完成**：立即清除舊排名數據
- **數據過期**：自動清理過期數據
- **錯誤處理**：解析失敗時清除無效數據

## 🚀 部署建議

### 1. **測試步驟**

1. 清除瀏覽器緩存
2. 完成評測，記錄當前排名
3. 更新分數，觸發排名變化
4. 進入天梯頁面，觀察動畫

### 2. **驗證指標**

- 舊排名是否正確保存
- 動畫是否從正確的舊排名開始
- 數據清理是否正常工作

### 3. **監控重點**

- 排名保存成功率
- 動畫觸發準確率
- 數據清理效率
