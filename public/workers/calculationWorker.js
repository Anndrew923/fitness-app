// Web Worker for handling compute-intensive tasks
self.onmessage = function (e) {
  const { type, data, id } = e.data;

  try {
    let result;

    switch (type) {
      case 'CALCULATE_LADDER_SCORE':
        result = calculateLadderScore(data);
        break;

      case 'CALCULATE_RADAR_DATA':
        result = calculateRadarData(data);
        break;

      case 'PROCESS_USER_STATS':
        result = processUserStats(data);
        break;

      case 'OPTIMIZE_IMAGE_DATA':
        result = optimizeImageData(data);
        break;

      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    self.postMessage({
      id,
      success: true,
      result,
    });
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message,
    });
  }
};

// 計算天梯分數
function calculateLadderScore(data) {
  const { strength, cardio, power, muscle, ffmi } = data;

  // 複雜的計算邏輯
  const weights = {
    strength: 0.25,
    cardio: 0.25,
    power: 0.2,
    muscle: 0.2,
    ffmi: 0.1,
  };

  const weightedScore =
    strength * weights.strength +
    cardio * weights.cardio +
    power * weights.power +
    muscle * weights.muscle +
    ffmi * weights.ffmi;

  // 添加年齡調整係數
  const ageAdjustment = data.age
    ? Math.max(0.8, 1 - (data.age - 20) * 0.01)
    : 1;

  return Math.round(weightedScore * ageAdjustment * 100);
}

// 計算雷達圖數據
function calculateRadarData(data) {
  const { scores, maxScores } = data;

  return scores.map((score, index) => ({
    value: (score / maxScores[index]) * 100,
    label: ['力量', '心肺', '爆發力', '肌肉量', '體脂率'][index],
  }));
}

// 處理用戶統計數據
function processUserStats(data) {
  const { assessments, timeRange } = data;

  // 按時間範圍過濾
  const filtered = assessments.filter(assessment => {
    const assessmentDate = new Date(assessment.timestamp);
    const now = new Date();
    const daysDiff = (now - assessmentDate) / (1000 * 60 * 60 * 24);

    switch (timeRange) {
      case 'week':
        return daysDiff <= 7;
      case 'month':
        return daysDiff <= 30;
      case 'year':
        return daysDiff <= 365;
      default:
        return true;
    }
  });

  // 計算統計數據
  const stats = {
    total: filtered.length,
    average: {},
    trends: {},
    improvements: {},
  };

  // 計算各項目的平均值
  const categories = ['strength', 'cardio', 'power', 'muscle', 'ffmi'];
  categories.forEach(category => {
    const values = filtered.map(a => a[category]).filter(v => v != null);
    if (values.length > 0) {
      stats.average[category] =
        values.reduce((a, b) => a + b, 0) / values.length;
    }
  });

  return stats;
}

// 優化圖片數據
function optimizeImageData(data) {
  const { imageData, maxWidth, maxHeight, quality } = data;

  // 創建離屏 Canvas
  const canvas = new OffscreenCanvas(maxWidth, maxHeight);
  const ctx = canvas.getContext('2d');

  // 計算縮放比例
  const scale = Math.min(
    maxWidth / imageData.width,
    maxHeight / imageData.height
  );
  const newWidth = imageData.width * scale;
  const newHeight = imageData.height * scale;

  // 繪製縮放後的圖片
  ctx.drawImage(imageData, 0, 0, newWidth, newHeight);

  // 轉換為 Blob
  return canvas.convertToBlob({
    type: 'image/jpeg',
    quality: quality || 0.8,
  });
}
