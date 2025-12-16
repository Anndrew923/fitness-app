/**
 * 天梯系統核心配置
 * 定義所有排行榜類型與 Firestore 欄位映射
 */

export const RANKING_CATEGORIES = [
  {
    id: 'general',
    title: '綜合成就',
    metrics: [
      {
        id: 'total',
        label: 'UP 總戰力',
        dbField: 'ladderScore',
        sortOrder: 'desc',
        isPremium: false,
        unit: '分',
      },
    ],
  },
  {
    id: 'strength',
    title: '極限力量',
    metrics: [
      {
        id: 'bench_press',
        label: '臥推',
        dbField: 'testInputs.strength.benchPress.max',
        sortOrder: 'desc',
        isPremium: true,
        unit: 'kg',
      },
      {
        id: 'squat',
        label: '深蹲',
        dbField: 'testInputs.strength.squat.max',
        sortOrder: 'desc',
        isPremium: true,
        unit: 'kg',
      },
      {
        id: 'deadlift',
        label: '硬舉',
        dbField: 'testInputs.strength.deadlift.max',
        sortOrder: 'desc',
        isPremium: true,
        unit: 'kg',
      },
      {
        id: 'lat_pulldown',
        label: '滑輪下拉',
        dbField: 'testInputs.strength.latPulldown.max',
        sortOrder: 'desc',
        isPremium: true,
        unit: 'kg',
      },
      {
        id: 'shoulder_press',
        label: '肩推',
        dbField: 'testInputs.strength.shoulderPress.max',
        sortOrder: 'desc',
        isPremium: true,
        unit: 'kg',
      },
    ],
  },
  {
    id: 'cardio',
    title: '心肺耐力',
    metrics: [
      {
        id: 'distance',
        label: '跑步距離',
        dbField: 'testInputs.cardio.distance',
        sortOrder: 'desc',
        isPremium: false,
        unit: 'm',
      },
    ],
  },
  {
    id: 'explosive',
    title: '爆發力',
    metrics: [
      {
        id: 'vertical_jump',
        label: '垂直跳躍',
        dbField: 'testInputs.explosivePower.verticalJump',
        sortOrder: 'desc',
        isPremium: false,
        unit: 'cm',
      },
    ],
  },
];

/**
 * 根據 metricId 獲取配置
 * @param {string} metricId - 指標 ID (例如: 'total', 'bench_press')
 * @returns {Object|null} 指標配置對象
 */
export const getMetricConfig = metricId => {
  for (const category of RANKING_CATEGORIES) {
    const metric = category.metrics.find(m => m.id === metricId);
    if (metric) {
      return {
        ...metric,
        categoryId: category.id,
        categoryTitle: category.title,
      };
    }
  }
  return null;
};

/**
 * 獲取分類下的所有指標
 * @param {string} categoryId - 分類 ID
 * @returns {Array} 指標數組
 */
export const getCategoryMetrics = categoryId => {
  const category = RANKING_CATEGORIES.find(c => c.id === categoryId);
  return category ? category.metrics : [];
};

/**
 * 獲取預設指標配置（總戰力）
 */
export const getDefaultMetric = () => {
  return getMetricConfig('total') || RANKING_CATEGORIES[0].metrics[0];
};
