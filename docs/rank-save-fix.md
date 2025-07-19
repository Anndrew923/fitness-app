# 排名保存修復

## 🚨 發現的問題

通過深入分析日誌，發現了排名保存失敗的根本原因：

### 1. **Key 不一致問題**

- UserContext 保存到 `previousUserRank`
- Ladder 組件讀取 `currentUserRank`
- 導致數據無法正確讀取

### 2. **驗證邏輯錯誤**

```javascript
// 錯誤的驗證邏輯
const isSameScore = parsedData.score === userData?.ladderScore;
```

當用戶更新分數後，新分數和舊分數必然不同，導致數據被清除。

### 3. **時序問題**

- UserContext 在分數更新時保存 `userData.ladderRank || 0`
- 但此時 `ladderRank` 可能還是 0
- 導致保存的舊排名總是 0

## 🔧 修復方案

### 1. **統一使用 currentUserRank**

移除 UserContext 中的舊排名保存邏輯，統一由 Ladder 組件處理：

```javascript
// UserContext.jsx - 移除舊邏輯
// 計算天梯分數和年齡段
if (newData.scores) {
  const oldLadderScore = userData.ladderScore || 0;
  newData.ladderScore = calculateLadderScore(newData.scores);

  // 移除舊排名保存邏輯，由 Ladder 組件直接處理
  // 這樣可以避免時序問題和數據不一致

  if (newData.age) {
    newData.ageGroup = getAgeGroup(newData.age);
  }
}
```

### 2. **修復驗證邏輯**

移除分數相同的要求，只檢查時間有效性：

```javascript
// Ladder.jsx - 修復驗證邏輯
const currentRankData = localStorage.getItem('currentUserRank');
if (currentRankData) {
  try {
    const parsedData = JSON.parse(currentRankData);
    // 檢查是否是最近的數據（5分鐘內）
    const isRecent = Date.now() - parsedData.timestamp < 5 * 60 * 1000;

    if (isRecent && parsedData.rank > 0) {
      oldRank = parsedData.rank;
      console.log(
        `📖 讀取舊排名用於比較：${oldRank} (分數：${parsedData.score} → ${userData?.ladderScore})`
      );
    } else {
      console.log(
        `⏰ 保存的排名已過期或無效，清除舊數據 (時間差：${
          Date.now() - parsedData.timestamp
        }ms, 排名：${parsedData.rank})`
      );
      localStorage.removeItem('currentUserRank');
    }
  } catch (error) {
    console.error('解析當前排名數據失敗:', error);
    localStorage.removeItem('currentUserRank');
  }
}
```

### 3. **簡化架構**

移除不必要的 useEffect，統一在 `loadLadderData` 中處理：

```javascript
// 移除舊的讀取邏輯，統一使用 currentUserRank
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

## 📊 修復後的數據流

### 正確的流程

```
用戶完成評測 → 進入天梯頁面 → 讀取保存的舊排名 → 計算新排名 → 比較並觸發動畫
```

### 預期的日誌

```
💾 保存當前排名供下次比較：3
📖 讀取舊排名用於比較：3 (分數：81.6 → 92.7)
🔍 排名變化檢測：從第 3 名到第 1 名
👁️ 設置顯示排名為舊排名：3
🎬 設置動畫狀態：oldRank=3, newRank=1
開始執行動畫：從第 3 名到第 1 名
```

## 🎯 關鍵改進

### 1. **時機正確**

- 在排名計算前讀取舊排名
- 避免時序問題

### 2. **邏輯簡化**

- 統一使用 `currentUserRank`
- 移除複雜的驗證條件

### 3. **數據可靠**

- 只檢查時間有效性
- 不要求分數相同

### 4. **架構清晰**

- 所有邏輯都在 Ladder 組件中
- 避免跨組件數據依賴

## 🚀 測試建議

### 1. **清除緩存**

```javascript
localStorage.removeItem('previousUserRank');
localStorage.removeItem('currentUserRank');
```

### 2. **測試步驟**

1. 完成評測，記錄當前排名
2. 更新分數，觸發排名變化
3. 進入天梯頁面，觀察動畫

### 3. **驗證指標**

- 舊排名是否正確保存和讀取
- 動畫是否從正確的舊排名開始
- 數據清理是否正常工作

## 🔍 監控重點

### 1. **保存成功率**

- `💾 保存當前排名供下次比較：X`
- 確保每次都有保存

### 2. **讀取成功率**

- `📖 讀取舊排名用於比較：X`
- 確保能正確讀取

### 3. **動畫觸發率**

- `🔍 排名變化檢測：從第 X 名到第 Y 名`
- 確保動畫正確觸發

## 📝 技術細節

### 數據結構

```javascript
{
  rank: 3,           // 當前排名
  score: 85.6,       // 當前分數
  timestamp: 1640995200000  // 保存時間戳
}
```

### 驗證機制

- **時間驗證**：數據必須在 5 分鐘內
- **排名驗證**：排名必須大於 0
- **移除分數驗證**：不再要求分數相同

### 清理機制

- **動畫完成**：立即清除舊排名數據
- **數據過期**：自動清理過期數據
- **錯誤處理**：解析失敗時清除無效數據
