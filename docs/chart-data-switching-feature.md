# 圖表數據切換功能實現

## 🎯 功能目標

實現圖表數據切換功能，讓用戶可以選擇顯示單一數據類型的折線圖，避免多條線互相干擾，提供更清晰的數據分析體驗。

## 🔧 實現方案

### 1. **狀態管理**

**新增狀態**：

```javascript
const [selectedChartData, setSelectedChartData] = useState('total'); // 預設顯示總分
```

**狀態說明**：

- `selectedChartData`：當前選中的數據類型
- 預設值為 'total'，顯示總分數據
- 支持切換到其他數據類型

### 2. **數據集擴展**

**原有數據集**：

```javascript
datasets: [
  { label: '總分', data: totalScores, color: '#28a745' },
  { label: '力量', data: strengthScores, color: '#007bff' },
  { label: '爆發力', data: explosiveScores, color: '#ffc107' },
];
```

**擴展後數據集**：

```javascript
datasets: [
  { label: '總分', data: totalScores, color: '#28a745', key: 'total' },
  { label: '力量', data: strengthScores, color: '#007bff', key: 'strength' },
  {
    label: '爆發力',
    data: explosiveScores,
    color: '#ffc107',
    key: 'explosive',
  },
  { label: '心肺', data: cardioScores, color: '#dc3545', key: 'cardio' },
  { label: '肌肉量', data: muscleMassScores, color: '#6f42c1', key: 'muscle' },
  { label: 'FFMI', data: bodyFatScores, color: '#fd7e14', key: 'ffmi' },
];
```

**新增數據類型**：

- **心肺**：紅色 (#dc3545)
- **肌肉量**：紫色 (#6f42c1)
- **FFMI**：橙色 (#fd7e14)

### 3. **UI 界面設計**

**圖表標題區域**：

```javascript
<div className="chart-header">
  <h3>📈 數據趨勢圖</h3>
  <div className="chart-selector">
    <select
      value={selectedChartData}
      onChange={e => setSelectedChartData(e.target.value)}
      className="chart-select"
    >
      {chartData.datasets.map(dataset => (
        <option key={dataset.key} value={dataset.key}>
          {dataset.label}
        </option>
      ))}
    </select>
  </div>
</div>
```

**選單功能**：

- 下拉選單顯示所有可用的數據類型
- 即時切換顯示的數據
- 保持選中狀態

### 4. **圖表渲染優化**

**單一數據集顯示**：

```javascript
// 獲取當前選中的數據集
const selectedDataset = chartData.datasets.find(
  dataset => dataset.key === selectedChartData
);

// 只渲染選中的數據集
{
  selectedDataset && (
    <g key={selectedDataset.label}>
      <polyline
        points={selectedDataset.data
          .map((value, index) => {
            const x = 50 + (index * 700) / (chartData.labels.length - 1);
            const y = 720 - (value * 480) / 100;
            return `${x},${y}`;
          })
          .join(' ')}
        fill="none"
        stroke={selectedDataset.color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 數據點 */}
      {selectedDataset.data.map((value, index) => (
        <circle
          key={`point-${index}`}
          cx={x}
          cy={y}
          r="5"
          fill={selectedDataset.color}
          stroke="white"
          strokeWidth="2"
        />
      ))}
    </g>
  );
}
```

**視覺優化**：

- 線條寬度從 3 增加到 4，更突出
- 數據點半徑從 4 增加到 5，更明顯
- 數據點添加白色邊框，提升對比度

### 5. **圖例簡化**

**原有圖例**：

```javascript
// 顯示所有數據集的圖例
{
  chartData.datasets.map((dataset, index) => (
    <g transform={`translate(50, ${20 + index * 25})`}>
      <line x1="0" y1="6" x2="25" y2="6" stroke={dataset.color} />
      <text x="30" y="10">
        {dataset.label}
      </text>
    </g>
  ));
}
```

**簡化後**：

```javascript
// 只顯示當前選中數據集的標題
{
  selectedDataset && (
    <text
      x="400"
      y="30"
      textAnchor="middle"
      fontSize={legendFontSize}
      fontWeight={legendFontWeight}
      fill={selectedDataset.color}
    >
      {selectedDataset.label}
    </text>
  );
}
```

## 📊 功能特點

### 1. **數據類型完整**

- **總分**：綜合評測分數
- **力量**：力量評測分數
- **爆發力**：爆發力評測分數
- **心肺**：心肺耐力評測分數
- **肌肉量**：骨骼肌肉量評測分數
- **FFMI**：體脂肪率與 FFMI 評測分數

### 2. **視覺效果優化**

- 單一數據線，避免干擾
- 更粗的線條和更大的數據點
- 數據點添加白色邊框
- 顏色對應各評測類型

### 3. **用戶體驗提升**

- 簡單的下拉選單操作
- 即時切換，無需重新載入
- 保持選中狀態
- 響應式設計

## 🎨 樣式設計

### 1. **選單樣式**

```css
.chart-select {
  padding: 0.5rem 1rem;
  border: 2px solid #81d8d0;
  border-radius: 6px;
  background: white;
  color: #495057;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}
```

### 2. **響應式設計**

```css
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .chart-select {
    min-width: 140px;
    font-size: 13px;
  }
}
```

## 🔧 技術實現

### 1. **狀態管理**

```javascript
const [selectedChartData, setSelectedChartData] = useState('total');
```

### 2. **數據過濾**

```javascript
const selectedDataset = chartData.datasets.find(
  dataset => dataset.key === selectedChartData
);
```

### 3. **事件處理**

```javascript
onChange={(e) => setSelectedChartData(e.target.value)}
```

### 4. **條件渲染**

```javascript
{selectedDataset && (
  // 渲染選中的數據集
)}
```

## 📱 響應式支持

### 1. **桌面版**

- 標題和選單水平排列
- 選單寬度 120px
- 字體大小 14px

### 2. **手機版**

- 標題和選單垂直排列
- 選單寬度 140px
- 字體大小 13px
- 居中對齊

## 🎯 功能優勢

### 1. **數據清晰度**

- 單一數據線，避免視覺干擾
- 更容易觀察數據變化趨勢
- 專注於特定指標的分析

### 2. **操作簡便**

- 一鍵切換數據類型
- 即時響應，無延遲
- 直觀的下拉選單

### 3. **視覺效果**

- 更粗的線條，更突出
- 更大的數據點，更明顯
- 顏色對應，易於識別

### 4. **功能完整性**

- 涵蓋所有評測指標
- 保持原有功能不變
- 響應式設計支持

## 📝 總結

這次實現的圖表數據切換功能成功解決了多條數據線互相干擾的問題：

1. **功能完整**：支持 6 種數據類型的切換
2. **操作簡便**：下拉選單一鍵切換
3. **視覺優化**：單一數據線更清晰
4. **響應式設計**：適配桌面版和手機版
5. **保持兼容**：所有原有功能正常運作

現在用戶可以專注於單一數據類型的變化趨勢，獲得更好的數據分析體驗。
