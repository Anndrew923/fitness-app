# 浮動排名顯示框功能

## 🎯 功能概述

新增浮動排名顯示框，使用和排行榜一樣的卡片樣式，在螢幕底部顯示用戶的當前排名，同時保持天梯從第 1 名開始的傳統顯示方式。

## 🎨 設計理念

### 1. **用戶體驗優化**

- 用戶可以清楚看到自己的排名，無需滾動查找
- 天梯保持從第 1 名開始顯示，符合用戶習慣
- 浮動框提供即時的排名反饋
- **底部固定位置**：視覺效果更一致，不會干擾天梯內容閱讀
- **卡片樣式一致**：使用和排行榜一樣的設計，視覺統一

### 2. **視覺設計**

- 與排行榜項目相同的卡片樣式
- 左側橙色邊框突出顯示
- 響應式設計適配不同設備
- **底部懸浮**：類似手機應用的底部導航欄，用戶習慣且易於觸達

## 🔧 技術實現

### 1. **組件結構**

```javascript
const getFloatingRankDisplay = () => {
  if (!userData || !userData.ladderScore || userData.ladderScore === 0) {
    return null;
  }

  const currentRank = userRank > 0 ? userRank : '未上榜';
  const rankBadge =
    typeof currentRank === 'number' ? getRankBadge(currentRank) : '';

  return (
    <div
      className="floating-rank-display"
      data-rank={typeof currentRank === 'number' ? currentRank : 'none'}
    >
      <div className="floating-rank-card">
        <div className="ladder__rank">
          <span className="ladder__rank-number">
            {typeof currentRank === 'number' ? currentRank : '-'}
          </span>
          <span className="ladder__rank-badge">{rankBadge}</span>
        </div>

        <div className="ladder__user">
          <div className="ladder__avatar">
            {userData.avatarUrl ? (
              <img src={userData.avatarUrl} alt="頭像" />
            ) : (
              <div className="ladder__avatar-placeholder">
                {userData.nickname
                  ? userData.nickname.charAt(0).toUpperCase()
                  : 'U'}
              </div>
            )}
          </div>

          <div className="ladder__user-info">
            <div className="ladder__user-name current-user-flame">
              {userData.nickname ||
                userData.email?.split('@')[0] ||
                '未命名用戶'}
            </div>
            <div className="ladder__user-details">
              {getAgeGroupLabel(userData.ageGroup)} •{' '}
              {userData.gender === 'male' ? '男' : '女'}
              <br />
              <span className="last-update">我的排名</span>
            </div>
          </div>
        </div>

        <div className="ladder__score">
          <span className="ladder__score-value">
            {formatScore(userData.ladderScore)}
          </span>
          <span className="ladder__score-label">分</span>
        </div>
      </div>
    </div>
  );
};
```

### 2. **CSS 樣式**

```css
.floating-rank-display {
  position: fixed;
  bottom: 80px; /* 調整位置避免被廣告擋住 */
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  justify-content: center;
}

.floating-rank-card {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 300px;
  max-width: 400px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.floating-rank-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  border-radius: 2px;
}
```

## 📊 功能特點

### 1. **智能顯示**

- 只有完成全部 5 個評測項目的用戶才顯示
- 未上榜用戶顯示"未上榜"
- 上榜用戶顯示具體排名和分數

### 2. **特殊樣式**

- 第 1 名：金色漸層背景
- 第 2 名：銀色漸層背景
- 第 3 名：銅色漸層背景
- 其他排名：標準橙色漸層背景

### 3. **動畫效果**

- 背景旋轉動畫
- 獎盃圖標浮動動畫
- 懸停時上浮效果
- 響應式設計

## 🎯 使用場景

### 1. **高排名用戶（前 10 名）**

- 浮動框顯示具體排名
- 天梯顯示前 50 名
- 用戶可以看到自己的位置和競爭對手

### 2. **中等排名用戶（11-50 名）**

- 浮動框顯示排名
- 天梯顯示前 50 名
- 用戶可以比較與頂部選手的差距

### 3. **低排名用戶（50 名以後）**

- 浮動框顯示排名
- 天梯顯示前 50 名
- 用戶可以看到目標和努力方向

### 4. **未上榜用戶**

- 浮動框顯示"未上榜"
- 天梯顯示前 50 名
- 激勵用戶完成評測參與排名

## 🔍 顯示邏輯

### 1. **顯示條件**

```javascript
// 只有完成全部評測且有分數的用戶才顯示
if (!userData || !userData.ladderScore || userData.ladderScore === 0) {
  return null;
}
```

### 2. **排名計算**

```javascript
// 使用 userRank 作為當前排名
const currentRank = userRank > 0 ? userRank : '未上榜';
```

### 3. **徽章顯示**

```javascript
// 根據排名顯示不同徽章
const rankBadge =
  typeof currentRank === 'number' ? getRankBadge(currentRank) : '';
```

## 📱 響應式設計

### 1. **桌面版**

- 位置：fixed bottom: 80px, left: 50%, transform: translateX(-50%)
- 卡片尺寸：min-width: 300px, max-width: 400px
- 間距：gap: 16px, padding: 16px 20px

### 2. **移動版**

- 位置：fixed bottom: 70px, left: 50%, transform: translateX(-50%)
- 卡片尺寸：min-width: 280px, max-width: 350px
- 間距：gap: 12px, padding: 12px 16px

## 🎨 視覺效果

### 1. **卡片樣式**

- 白色背景，圓角設計
- 左側橙色漸層邊框
- 與排行榜項目相同的佈局

### 2. **懸停效果**

```css
.floating-rank-display:hover .floating-rank-card {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
```

## 🚀 優勢分析

### 1. **用戶體驗**

- 即時排名反饋
- 無需滾動查找
- 保持天梯傳統顯示方式

### 2. **視覺設計**

- 醒目的設計風格
- 豐富的動畫效果
- 響應式適配

### 3. **功能完整**

- 智能顯示邏輯
- 特殊排名樣式
- 完整信息展示

## 📝 測試建議

### 1. **顯示測試**

1. 完成全部評測，檢查浮動框是否顯示
2. 未完成評測，檢查浮動框是否隱藏
3. 不同排名用戶，檢查樣式是否正確

### 2. **響應式測試**

1. 桌面版顯示效果
2. 移動版顯示效果
3. 不同屏幕尺寸適配

### 3. **動畫測試**

1. 背景旋轉動畫
2. 獎盃浮動動畫
3. 懸停上浮效果

## 🎯 預期效果

### 1. **用戶體驗提升**

- 清楚看到自己的排名
- 保持天梯的傳統顯示方式
- 增強用戶參與感

### 2. **視覺效果**

- 醒目的浮動排名顯示
- 豐富的動畫效果
- 專業的設計風格

### 3. **功能完整性**

- 智能顯示邏輯
- 響應式設計
- 特殊排名樣式

## 🔧 技術細節

### 1. **定位策略**

```css
position: fixed;
bottom: 20px;
left: 50%;
transform: translateX(-50%);
z-index: 100;
```

### 2. **漸層背景**

```css
background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffd700 100%);
```

### 3. **特殊排名樣式**

```css
.floating-rank-display[data-rank='1'] .floating-rank-content {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #fff8b8 100%);
}
```

## 🚀 未來擴展

### 1. **排名變化動畫**

- 排名提升時的動畫效果
- 排名下降時的視覺反饋
- 實時排名更新

### 2. **更多信息顯示**

- 與前一名差距
- 排名趨勢圖表
- 歷史排名記錄

### 3. **互動功能**

- 點擊查看詳細信息
- 分享排名功能
- 排名挑戰功能
