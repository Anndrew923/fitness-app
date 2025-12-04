import logger from './logger';

/**
 * ✅ 念能力屬性映射計算器
 * 根據五項評測分數動態計算用戶的「念屬性」
 */

/**
 * 計算標準差
 */
function calculateStandardDeviation(values) {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  return Math.sqrt(variance);
}

/**
 * 計算念能力屬性
 * @param {Object} scores - 評測分數對象
 * @param {number} scores.strength - 力量
 * @param {number} scores.explosivePower - 爆發力
 * @param {number} scores.cardio - 心肺耐力
 * @param {number} scores.muscleMass - 肌肉量
 * @param {number} scores.bodyFat - 體脂肪率（百分比）
 * @param {Object} options - 選項
 * @param {number} options.averageMuscleMass - 全體用戶平均肌肉量（預設 50）
 * @param {number} options.topPercentileThreshold - 前 10% 分數閾值（預設 80）
 * @param {Object} options.subscription - 訂閱狀態 { isVip: boolean }
 * @returns {Object} { type: string, name: string, icon: string, description: string }
 */
export function calculateNenType(scores, options = {}) {
  const {
    strength = 0,
    explosivePower = 0,
    cardio = 0,
    muscleMass = 0,
    bodyFat = 0,
  } = scores;

  const {
    averageMuscleMass = 50,
    topPercentileThreshold = 80,
    subscription = { isVip: false },
  } = options;

  // 獲取所有分數值
  const scoreValues = [strength, explosivePower, cardio, muscleMass];
  const totalScore = scoreValues.reduce((sum, val) => sum + val, 0);

  // 找出最高分數
  const maxScore = Math.max(...scoreValues);
  const maxIndex = scoreValues.indexOf(maxScore);

  // 1. 強化系 (Enhancer)：力量最高
  if (maxIndex === 0 && strength === maxScore) {
    return {
      type: 'enhancer',
      name: '強化系',
      icon: '💪',
      description: '你的力量在五項中表現最突出，屬於強化系念能力者',
    };
  }

  // 2. 放出系 (Emitter)：爆發力最高
  if (maxIndex === 1 && explosivePower === maxScore) {
    return {
      type: 'emitter',
      name: '放出系',
      icon: '⚡',
      description: '你的爆發力在五項中表現最突出，屬於放出系念能力者',
    };
  }

  // 3. 操作系 (Manipulator)：心肺耐力最高
  if (maxIndex === 2 && cardio === maxScore) {
    return {
      type: 'manipulator',
      name: '操作系',
      icon: '🎯',
      description: '你的心肺耐力在五項中表現最突出，屬於操作系念能力者',
    };
  }

  // 4. 具現化系 (Conjurer)：肌肉量最高
  if (maxIndex === 3 && muscleMass === maxScore) {
    return {
      type: 'conjurer',
      name: '具現化系',
      icon: '🔮',
      description: '你的肌肉量在五項中表現最突出，屬於具現化系念能力者',
    };
  }

  // 5. 變化系 (Transmuter)：體脂肪低且肌肉量高
  if (bodyFat < 12 && muscleMass > averageMuscleMass) {
    return {
      type: 'transmuter',
      name: '變化系',
      icon: '🌀',
      description: '你的體脂率低於 12% 且肌肉量高於平均，屬於變化系念能力者',
    };
  }

  // 6. 特質系 (Specialist)：發展均衡且總分高
  const stdDev = calculateStandardDeviation(scoreValues);
  const averageScore = totalScore / scoreValues.length;
  const isBalanced = stdDev < 10; // 標準差小於 10 視為均衡
  const isTopTier = totalScore > topPercentileThreshold * 4; // 總分高於閾值

  // 條件 A：均衡且高分
  if (isBalanced && isTopTier) {
    return {
      type: 'specialist',
      name: '特質系',
      icon: '⭐',
      description: '你的五項能力發展均衡且總分優異，屬於特質系念能力者',
    };
  }

  // 條件 B：VIP 用戶（預留接口）
  if (subscription.isVip) {
    return {
      type: 'specialist',
      name: '特質系',
      icon: '⭐',
      description: '作為 VIP 用戶，你擁有特質系念能力',
    };
  }

  // 預設：根據最高分數返回對應系別
  const typeMap = {
    0: { type: 'enhancer', name: '強化系', icon: '💪' },
    1: { type: 'emitter', name: '放出系', icon: '⚡' },
    2: { type: 'manipulator', name: '操作系', icon: '🎯' },
    3: { type: 'conjurer', name: '具現化系', icon: '🔮' },
  };

  const defaultType = typeMap[maxIndex] || typeMap[0];
  return {
    ...defaultType,
    description: `你的 ${defaultType.name} 能力最為突出`,
  };
}

/**
 * 獲取念能力屬性圖標
 */
export function getNenTypeIcon(type) {
  const iconMap = {
    enhancer: '💪',
    emitter: '⚡',
    manipulator: '🎯',
    conjurer: '🔮',
    transmuter: '🌀',
    specialist: '⭐',
  };
  return iconMap[type] || '❓';
}
