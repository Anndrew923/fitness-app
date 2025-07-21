# 軸標籤字體大小優化

## 🎯 優化目標

根據用戶反饋，圖表上 X 軸和 Y 軸的字體太小，需要調整到 14px 以提升可讀性。

## 🔧 問題分析

### 1. **原有字體設定問題**

```javascript
// 原有設定 - 響應式字體大小
const fontSize = isMobile ? 12 : 14;
const fontWeight = isMobile ? '500' : '600';
```

**問題**：

- 手機版 X 軸和 Y 軸字體只有 12px，太小難以閱讀
- 桌面版雖然是 14px，但用戶希望確保一致性

### 2. **字體大小不一致**

- X 軸標籤（日期）：使用響應式字體大小
- Y 軸標籤（數值）：使用響應式字體大小
- 圖例文字：使用響應式字體大小

## ✅ 優化方案

### 1. **分離字體設定**

**優化前**：

```javascript
// 統一使用響應式字體大小
const fontSize = isMobile ? 12 : 14;
const fontWeight = isMobile ? '500' : '600';
```

**優化後**：

```javascript
// 固定X軸和Y軸字體大小為14px
const axisFontSize = 14;
const axisFontWeight = '600';

// 圖例字體大小保持響應式
const legendFontSize = isMobile ? 12 : 14;
const legendFontWeight = isMobile ? '500' : '600';
```

### 2. **應用字體設定**

**X 軸標籤**：

```javascript
<text
  fontSize={axisFontSize}
  fontWeight={axisFontWeight}
  fill="#495057"
>
```

**Y 軸標籤**：

```javascript
<text
  fontSize={axisFontSize}
  fontWeight={axisFontWeight}
  fill="#495057"
>
```

**圖例文字**：

```javascript
<text
  fontSize={legendFontSize}
  fontWeight={legendFontWeight}
  fill="#495057"
>
```

## 📊 優化效果對比

### 1. **字體大小變化**

| 元素     | 優化前                    | 優化後                    | 改進          |
| -------- | ------------------------- | ------------------------- | ------------- |
| X 軸標籤 | 12px (手機) / 14px (桌面) | 14px (固定)               | ✅ 手機版提升 |
| Y 軸標籤 | 12px (手機) / 14px (桌面) | 14px (固定)               | ✅ 手機版提升 |
| 圖例文字 | 12px (手機) / 14px (桌面) | 12px (手機) / 14px (桌面) | ✅ 保持響應式 |

### 2. **可讀性提升**

| 改進項目          | 優化前      | 優化後      |
| ----------------- | ----------- | ----------- |
| 手機版 X 軸可讀性 | 較差 (12px) | 良好 (14px) |
| 手機版 Y 軸可讀性 | 較差 (12px) | 良好 (14px) |
| 桌面版一致性      | 良好        | 優秀        |
| 整體視覺效果      | 不一致      | 統一        |

## 🎯 優化效果

### 1. **可讀性大幅提升**

- ✅ X 軸和 Y 軸字體統一為 14px
- ✅ 手機版字體大小提升，更容易閱讀
- ✅ 桌面版保持 14px，確保一致性

### 2. **視覺一致性改善**

- ✅ 軸標籤字體大小統一
- ✅ 圖例字體保持響應式設計
- ✅ 整體界面更加協調

### 3. **用戶體驗優化**

- ✅ 手機版用戶更容易閱讀軸標籤
- ✅ 桌面版用戶獲得一致的視覺體驗
- ✅ 數據更容易理解和分析

## 🔧 技術實現

### 1. **字體設定分離**

```javascript
// 固定軸標籤字體大小
const axisFontSize = 14;
const axisFontWeight = '600';

// 響應式圖例字體大小
const legendFontSize = isMobile ? 12 : 14;
const legendFontWeight = isMobile ? '500' : '600';
```

### 2. **X 軸標籤應用**

```javascript
<text
  key={`label-${index}`}
  x={x}
  y="780"
  textAnchor="middle"
  fontSize={axisFontSize}
  fontWeight={axisFontWeight}
  fill="#495057"
>
```

### 3. **Y 軸標籤應用**

```javascript
<text
  key={`y-label-${i}`}
  x="30"
  y={765 - i * 120}
  textAnchor="end"
  fontSize={axisFontSize}
  fontWeight={axisFontWeight}
  fill="#495057"
>
```

### 4. **圖例文字應用**

```javascript
<text
  x="30"
  y="10"
  fontSize={legendFontSize}
  fontWeight={legendFontWeight}
  fill="#495057"
>
```

## 📱 響應式設計

### 1. **軸標籤 (固定)**

- 桌面版：14px
- 手機版：14px
- 字體粗細：600

### 2. **圖例文字 (響應式)**

- 桌面版：14px
- 手機版：12px
- 字體粗細：600 (桌面) / 500 (手機)

## 🎨 視覺效果

### 1. **軸標籤更清晰**

- 14px 字體大小，更容易閱讀
- 600 字體粗細，視覺更突出
- 統一的視覺效果

### 2. **圖例保持靈活**

- 響應式設計，適應不同螢幕
- 手機版適中的字體大小
- 桌面版清晰的顯示效果

### 3. **整體平衡**

- 軸標籤和圖例的視覺平衡
- 保持專業的圖表外觀
- 提升數據可讀性

## 📝 總結

這次優化成功解決了軸標籤字體太小的問題：

1. **軸標籤字體統一**：X 軸和 Y 軸都使用 14px 字體
2. **可讀性提升**：手機版用戶更容易閱讀軸標籤
3. **視覺一致性**：確保所有軸標籤使用相同的字體規格
4. **保持響應式**：圖例文字仍然保持響應式設計

現在圖表的軸標籤字體大小為 14px，無論是在桌面版還是手機版上都能提供良好的可讀性，同時保持了整體的視覺一致性。
