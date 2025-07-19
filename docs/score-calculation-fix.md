# 分數計算邏輯修復

## 🐛 問題描述

用戶發現首頁和天梯頁面的分數計算不一致：

- **首頁顯示**：91.0 分
- **天梯顯示**：72.8 分

當用戶將某個評測項目分數調為 0 時，兩個頁面顯示的分數差異很大。

## 🔍 問題分析

### 原始計算邏輯差異

#### 1. 首頁平均分數計算（UserInfo.jsx）

```javascript
const averageScore = useMemo(() => {
  const scores = userData?.scores || DEFAULT_SCORES;
  const scoreValues = Object.values(scores).filter(score => score > 0); // 只計算大於0的分數
  const avg = scoreValues.length
    ? (
        scoreValues.reduce((sum, score) => sum + Number(score), 0) /
        scoreValues.length
      ).toFixed(1)
    : 0;
  return avg;
}, [userData?.scores]);
```

#### 2. 天梯分數計算（utils.js）

```javascript
export const calculateLadderScore = scores => {
  const { strength, explosivePower, cardio, muscleMass, bodyFat } = scores;
  const total = strength + explosivePower + cardio + muscleMass + bodyFat; // 包含0分
  return Math.round((total / 5) * 10) / 10;
};
```

### 差異說明

- **首頁**：只計算大於 0 的分數的平均值（排除 0 分項目）
- **天梯**：計算所有 5 個項目的平均值（包含 0 分項目）

## ✅ 修復方案

### 統一計算邏輯

修改 `utils.js` 中的 `calculateLadderScore` 函數，讓它與首頁計算邏輯保持一致：

```javascript
export const calculateLadderScore = scores => {
  const { strength, explosivePower, cardio, muscleMass, bodyFat } = scores;
  const scoreValues = [
    strength,
    explosivePower,
    cardio,
    muscleMass,
    bodyFat,
  ].filter(score => score > 0);

  // 如果沒有有效分數，返回0
  if (scoreValues.length === 0) {
    return 0;
  }

  // 只計算大於0的分數的平均值，與首頁保持一致
  const total = scoreValues.reduce((sum, score) => sum + Number(score), 0);
  return Math.round((total / scoreValues.length) * 10) / 10;
};
```

### 更新說明文字

修改天梯頁面的說明文字，讓它更準確：

```javascript
// 修改前
<p>天梯分數 = (力量 + 爆發力 + 心肺 + 肌肉量 + 體脂) ÷ 5</p>

// 修改後
<p>天梯分數 = 已完成項目分數的平均值（排除0分項目）</p>
```

## 🧪 測試驗證

### 測試案例

1. **所有分數都有值**：85, 90, 88, 92, 87 → 平均分數：88.4
2. **有一個 0 分**：85, 0, 88, 92, 87 → 平均分數：88.0（只計算 4 個項目）
3. **多個 0 分**：85, 0, 0, 92, 87 → 平均分數：88.0（只計算 3 個項目）
4. **全部 0 分**：0, 0, 0, 0, 0 → 平均分數：0

### 測試按鈕

在開發環境中，天梯頁面會顯示兩個測試按鈕：

- 🎬 測試晉升動畫
- 🧮 測試分數計算

點擊「🧮 測試分數計算」按鈕可以在瀏覽器控制台查看詳細的測試結果。

## 📊 計算邏輯說明

### 新的統一邏輯

1. **過濾有效分數**：只計算大於 0 的分數
2. **計算平均值**：有效分數總和 ÷ 有效分數數量
3. **保留一位小數**：使用 `Math.round((total / count) * 10) / 10`

### 優勢

- **一致性**：首頁和天梯使用相同的計算邏輯
- **公平性**：未完成的評測項目不會拉低總分
- **激勵性**：鼓勵用戶完成更多評測項目
- **直觀性**：分數反映實際完成的項目水平

## 🔄 影響範圍

### 受影響的功能

1. **天梯排名**：所有用戶的排名可能發生變化
2. **晉升動畫**：基於新的分數計算觸發
3. **歷史記錄**：新記錄使用新的計算邏輯
4. **數據統計**：整體分數分布會改變

### 數據遷移

- **現有用戶**：分數會自動重新計算
- **歷史數據**：保持原有記錄，新記錄使用新邏輯
- **排名調整**：系統會自動重新排序

## 📝 注意事項

1. **生產環境**：移除測試按鈕
2. **用戶通知**：可能需要通知用戶分數計算邏輯的變化
3. **數據備份**：建議在部署前備份用戶數據
4. **監控**：部署後監控分數計算是否正常

## 🎯 預期效果

修復後，首頁和天梯頁面會顯示相同的分數，解決了用戶困惑的問題。同時，新的計算邏輯更加公平和直觀，能夠更好地反映用戶的實際健身水平。
