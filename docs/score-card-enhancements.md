# 計分卡視覺增強

## 📋 修改目標

用戶希望對 UserInfo 頁面雷達圖下方的計分卡進行視覺優化，讓它更簡潔、更有視覺衝擊力。

## 🔧 修改內容

### 1. **移除評測完成度進度條**

**修改前**：

```jsx
{
  /* 完成狀態 */
}
<div className="completion-status">
  <div className="completion-header">
    <span className="completion-label">評測完成度</span>
    <span className="completion-count">
      {completionStatus.completedCount}/5
    </span>
  </div>
  <div className="completion-progress">
    <div
      className="completion-bar"
      style={{ width: `${completionStatus.progress}%` }}
    ></div>
  </div>
  {!completionStatus.isFullyCompleted && (
    <p className="completion-message">完成全部5個評測項目即可參與天梯排名</p>
  )}
</div>;
```

**修改後**：

- ✅ 完全移除評測完成度進度條
- ✅ 用戶可以直接從雷達圖查看哪些項目未完成
- ✅ 簡化界面，減少冗餘信息

### 2. **平均分數顯示優化**

**修改前**：

```jsx
<p className="average-score">
  平均分數: <span className="score-value">{averageScore}</span>
</p>
```

**修改後**：

```jsx
<p className="average-score">
  📊 平均分數: <span className="score-value-large">{averageScore}</span>
</p>
```

**改進效果**：

- ✅ 添加圖表圖標 📊 代表分數
- ✅ 分數字體加大到 28px (桌面) / 24px (移動)
- ✅ 分數顏色改為紅色 (#ff6b35)
- ✅ 添加陰影效果，增加視覺層次

### 3. **天梯分數改為天梯排名**

**修改前**：

```jsx
<p className="ladder-score">
  天梯分數: <span className="score-value">{ladderScore}</span>
</p>
```

**修改後**：

```jsx
<p className="ladder-rank">
  🏆 天梯排名: <span className="rank-value">{userRank || '未上榜'}</span>
</p>
```

**改進效果**：

- ✅ 添加獎盃圖標 🏆 代表排名
- ✅ 從"天梯分數"改為"天梯排名"
- ✅ 顯示實際排名數字或"未上榜"
- ✅ 字體比平均分數略小：24px (桌面) / 20px (移動)
- ✅ 同樣使用紅色主題

### 4. **新增用戶排名獲取邏輯**

**新增功能**：

```jsx
// 獲取用戶排名
const fetchUserRank = useCallback(async () => {
  if (!userData?.userId || !completionStatus.isFullyCompleted) {
    setUserRank(null);
    return;
  }

  try {
    // 獲取前100名用戶
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('ladderScore', '>', 0),
      orderBy('ladderScore', 'desc'),
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    const users = [];

    querySnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.ladderScore > 0) {
        users.push({
          id: doc.id,
          ...userData,
        });
      }
    });

    // 找到用戶的排名
    const userIndex = users.findIndex(user => user.id === userData.userId);
    if (userIndex !== -1) {
      setUserRank(userIndex + 1);
    } else {
      // 如果用戶不在前100名，設置為未上榜
      setUserRank(null);
    }
  } catch (error) {
    console.error('獲取用戶排名失敗:', error);
    setUserRank(null);
  }
}, [userData?.userId, completionStatus.isFullyCompleted]);
```

**功能特點**：

- ✅ 自動獲取用戶在天梯中的排名
- ✅ 只顯示完成全部評測的用戶排名
- ✅ 如果不在前 100 名則顯示"未上榜"
- ✅ 錯誤處理和容錯機制

## 🎨 視覺設計

### 1. **色彩搭配**

- **主色調**：紅色 (#ff6b35) - 熱血、榮耀感
- **輔助色**：深灰色 (#2d3748) - 文字標籤
- **陰影效果**：rgba(255, 107, 53, 0.3) - 增加立體感

### 2. **字體層次**

- **平均分數**：28px (桌面) / 24px (移動) - 最大字體
- **天梯排名**：24px (桌面) / 20px (移動) - 中等字體
- **標籤文字**：18px (桌面) / 16px (移動) - 標準字體

### 3. **圖標設計**

- **📊 平均分數**：圖表圖標，代表數據統計
- **🏆 天梯排名**：獎盃圖標，代表榮耀和成就

## 📱 響應式設計

### 1. **桌面版**：

```css
.score-value-large {
  font-size: 28px;
  font-weight: 700;
  color: #ff6b35;
  text-shadow: 0 2px 4px rgba(255, 107, 53, 0.3);
  margin-left: 8px;
}

.rank-value {
  font-size: 24px;
  font-weight: 700;
  color: #ff6b35;
  text-shadow: 0 2px 4px rgba(255, 107, 53, 0.3);
  margin-left: 8px;
}
```

### 2. **移動版**：

```css
@media (max-width: 768px) {
  .score-value-large {
    font-size: 24px;
  }

  .ladder-rank {
    font-size: 16px;
  }

  .rank-value {
    font-size: 20px;
  }
}
```

## 🎯 改進效果

### 1. **視覺衝擊力**

- **大號紅色字體**：突出重要數據
- **圖標化設計**：更直觀的信息傳達
- **陰影效果**：增加立體感和層次

### 2. **信息簡化**

- **移除冗餘進度條**：用戶可直接從雷達圖查看
- **重點突出**：只顯示最重要的分數和排名
- **邏輯清晰**：平均分數 → 天梯排名的遞進關係

### 3. **用戶體驗**

- **即時排名**：自動獲取並顯示當前排名
- **視覺一致性**：與天梯排行榜的紅色主題保持一致
- **響應式適配**：在不同設備上都有良好顯示

## 🔍 功能保持

### 1. **原有功能**：

- ✅ 平均分數計算正常
- ✅ 天梯分數計算正常
- ✅ 完成狀態檢查正常
- ✅ 所有評測功能正常

### 2. **新增功能**：

- ✅ 用戶排名實時獲取
- ✅ 排名顯示邏輯
- ✅ 錯誤處理機制

## 🚀 性能優化

### 1. **Firebase 查詢優化**：

- 只查詢有分數的用戶
- 限制查詢結果為前 100 名
- 使用索引優化的查詢條件

### 2. **狀態管理**：

- 使用 useCallback 避免不必要的重新渲染
- 依賴項優化，只在必要時更新排名
- 錯誤狀態處理

## 📊 用戶體驗提升

### 1. **信息獲取**：

- 用戶可以快速了解自己的表現水平
- 排名信息激勵用戶繼續努力
- 視覺化的數據展示更易理解

### 2. **激勵機制**：

- 紅色主題營造熱血感
- 獎盃圖標象徵榮耀
- 排名數字提供競爭動力

### 3. **操作簡化**：

- 移除不必要的進度條
- 重點突出核心數據
- 減少認知負擔

## 🔧 維護建議

### 1. **定期檢查**：

- 排名獲取功能是否正常
- 字體大小在不同設備上的顯示效果
- 顏色對比度是否符合可訪問性標準

### 2. **性能監控**：

- Firebase 查詢頻率和成本
- 頁面載入速度
- 用戶交互響應時間

### 3. **用戶反饋**：

- 收集用戶對新設計的意見
- 評估信息傳達效果
- 根據需要調整字體大小或顏色
