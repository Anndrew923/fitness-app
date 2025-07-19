# 實裝晉升動畫功能

## 🎯 功能概述

現在天梯頁面已經實裝了真正的晉升動畫功能！當用戶的排名提升時，系統會自動檢測到排名變化並觸發華麗的動畫效果，包括用戶浮起、其他用戶被擠開、粒子爆炸效果等。

## ✨ 動畫效果詳解

### 1. **排名檢測機制**

- 系統會持續監控用戶的排名變化
- 當檢測到排名提升時（數字變小），自動觸發動畫
- 支持從任何排名提升到更高排名的動畫

### 2. **晉升用戶動畫**

- **浮起效果**：用戶項目會向上浮起 30px
- **放大效果**：用戶項目會放大 1.15 倍
- **發光效果**：添加橙色陰影和亮度提升
- **排名數字發光**：排名數字會有脈衝發光效果

### 3. **擠開效果**

- **被擠開的用戶**：排名在晉升範圍內的用戶會向上移動 50px
- **透明度變化**：被擠開的用戶會變暗，突出晉升用戶
- **平滑過渡**：所有動畫都使用緩動函數，確保流暢

### 4. **粒子爆炸效果**

- **12 個粒子**：從晉升用戶位置向四周爆炸
- **隨機顏色**：橙色、金色、紅色等暖色調
- **隨機大小**：3-7px 的粒子大小
- **隨機方向**：360 度全方位爆炸

### 5. **晉升提示訊息**

- **中央彈出**：在屏幕中央顯示晉升訊息
- **火箭圖標**：帶有彈跳動畫的火箭 emoji
- **提升位數**：顯示具體提升了多少位

## 🔧 技術實現

### 排名變化檢測

```javascript
// 檢測排名變化
useEffect(() => {
  if (previousUserData && userData && userData.ladderScore > 0) {
    const oldRank = previousUserData.currentRank || 0;
    const newRank = userRank || 0;

    // 檢查排名是否有提升（數字變小）
    if (newRank > 0 && oldRank > 0 && newRank < oldRank) {
      console.log(`排名提升：從第 ${oldRank} 名提升到第 ${newRank} 名`);

      // 觸發晉升動畫
      setPromotionAnimation({
        isActive: true,
        oldRank: oldRank,
        newRank: newRank,
        direction: 'up',
        progress: 0,
      });

      // 開始動畫進度
      let progress = 0;
      const animationInterval = setInterval(() => {
        progress += 0.05;
        if (progress >= 1) {
          progress = 1;
          clearInterval(animationInterval);

          // 觸發粒子效果
          setTimeout(() => {
            createParticleEffect(userItemRef.current);
          }, 200);

          // 完成動畫
          completePromotionAnimation();
        }

        setPromotionAnimation(prev => ({
          ...prev,
          progress: progress,
        }));
      }, 30); // 30ms 每幀，總共約1.5秒
    }
  }
}, [userRank, previousUserData]);
```

### 動畫樣式計算

```javascript
const getAnimationStyle = (user, index) => {
  if (!promotionAnimation.isActive) {
    return {};
  }

  const isCurrentUser = user.id === userData?.userId;
  const oldRank = promotionAnimation.oldRank;
  const newRank = promotionAnimation.newRank;
  const progress = promotionAnimation.progress;
  const currentRank = index + 1;

  if (isCurrentUser) {
    // 當前用戶的晉升動畫
    const floatHeight = 30; // 浮起高度
    const scale = 1 + progress * 0.15; // 放大效果

    return {
      transform: `translateY(-${floatHeight * progress}px) scale(${scale})`,
      zIndex: 1000,
      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: `0 ${12 * progress}px ${
        24 * progress
      }px rgba(255, 107, 53, 0.4)`,
      position: 'relative',
      filter: `brightness(${1 + progress * 0.2})`,
    };
  } else {
    // 其他用戶的擠開動畫
    if (oldRank > newRank) {
      // 晉升情況
      if (currentRank >= newRank && currentRank < oldRank) {
        // 被擠開向上移動的用戶
        const moveDistance = 50 * progress;
        return {
          transform: `translateY(-${moveDistance}px)`,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: 0.7 + (1 - progress) * 0.3,
          filter: 'brightness(0.9)',
        };
      }
    }
  }

  return {};
};
```

### 粒子效果創建

```javascript
const createParticleEffect = element => {
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const particles = [];
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // 創建12個粒子
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    particle.className = 'promotion-particle';

    // 隨機角度和距離
    const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5) * 0.5;
    const distance = 60 + Math.random() * 40;
    const particleX = Math.cos(angle) * distance;
    const particleY = Math.sin(angle) * distance;

    // 隨機大小和顏色
    const size = 3 + Math.random() * 4;
    const colors = ['#ff6b35', '#f7931e', '#ffd700', '#ff8c42'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.cssText = `
      position: fixed;
      left: ${centerX}px;
      top: ${centerY}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      box-shadow: 0 0 ${size * 2}px ${color};
      --particle-x: ${particleX}px;
      --particle-y: ${particleY}px;
      animation: particleExplosion 1.8s ease-out forwards;
      animation-delay: ${i * 0.05}s;
    `;

    document.body.appendChild(particle);
    particles.push(particle);
  }

  // 清理粒子
  setTimeout(() => {
    particles.forEach(particle => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
  }, 2500);
};
```

## 🎮 使用方式

### 真實排名提升

1. **完成評測**：用戶完成新的評測項目
2. **分數提升**：天梯分數有所提升
3. **排名變化**：系統檢測到排名提升
4. **自動觸發**：動畫自動開始播放

### 觸發條件

晉升動畫會在以下情況自動觸發：

- 用戶完成新的評測項目
- 天梯分數有所提升
- 系統檢測到排名變化
- 動畫自動開始播放，無需手動觸發

## 📊 動畫時間軸

| 時間        | 效果                     | 持續時間 |
| ----------- | ------------------------ | -------- |
| 0ms         | 開始晉升動畫             | -        |
| 0-1500ms    | 用戶浮起、放大、擠開效果 | 1.5 秒   |
| 1700ms      | 粒子爆炸開始             | -        |
| 1700-3500ms | 粒子爆炸動畫             | 1.8 秒   |
| 3000ms      | 晉升訊息消失             | -        |
| 3500ms      | 動畫完全結束             | -        |

## 🎨 視覺效果

### 顏色方案

- **主色調**：橙色 (#ff6b35)
- **輔助色**：金色 (#ffd700)
- **粒子顏色**：橙色、金色、紅色等暖色調
- **發光效果**：橙色陰影和亮度提升

### 動畫曲線

- **緩動函數**：cubic-bezier(0.4, 0, 0.2, 1)
- **平滑過渡**：確保所有動畫都流暢自然
- **性能優化**：使用 will-change 屬性提升性能

## 🔧 性能優化

### GPU 加速

- 使用 `transform` 而非 `top/left` 進行動畫
- 使用 `will-change` 屬性提示瀏覽器
- 避免重排重繪，提升動畫性能

### 內存管理

- 粒子效果自動清理
- 動畫完成後重置狀態
- 防止重複觸發動畫

### 可訪問性

- 支持 `prefers-reduced-motion` 媒體查詢
- 動畫可以通過系統設置禁用
- 保持核心功能不受動畫影響

## 🎯 未來擴展

### 可能的增強功能

1. **音效**：添加晉升音效
2. **震動反饋**：移動設備震動反饋
3. **更多動畫**：不同排名提升的不同動畫
4. **成就系統**：晉升到特定排名獲得成就
5. **社交分享**：晉升後可以分享到社交媒體

### 數據分析

- 追蹤動畫觸發頻率
- 分析用戶晉升模式
- 優化動畫觸發時機

## 📝 注意事項

### 瀏覽器兼容性

- 支持所有現代瀏覽器
- 在舊版瀏覽器中優雅降級
- 動畫效果在低端設備上自動簡化

### 用戶體驗

- 動畫不會影響正常使用
- 可以通過系統設置禁用
- 動畫時長適中，不會過於干擾

### 開發調試

- 控制台會輸出排名變化日誌
- 動畫狀態可以通過 React DevTools 查看
- 排名變化會自動觸發動畫，無需手動測試
