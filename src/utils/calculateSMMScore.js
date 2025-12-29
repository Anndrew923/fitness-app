/**
 * 重新计算 SMM 分数（用于修复旧数据）
 * 当检测到 storedScore === 100 时，使用原始数据重新计算
 */

import {
  muscleStandardsMaleSMM,
  muscleStandardsFemaleSMM,
  muscleStandardsMaleSMPercent,
  muscleStandardsFemaleSMPercent,
} from '../standards';

/**
 * 获取年龄范围
 */
const getAgeRange = age => {
  if (!age) return null;
  const ageNum = parseInt(age);
  if (ageNum >= 10 && ageNum <= 12) return '10-12';
  if (ageNum >= 13 && ageNum <= 17) return '13-17';
  if (ageNum >= 18 && ageNum <= 30) return '18-30';
  if (ageNum >= 31 && ageNum <= 40) return '31-40';
  if (ageNum >= 41 && ageNum <= 50) return '41-50';
  if (ageNum >= 51 && ageNum <= 60) return '51-60';
  if (ageNum >= 61 && ageNum <= 70) return '61-70';
  if (ageNum >= 71 && ageNum <= 80) return '71-80';
  return null;
};

/**
 * 从标准计算分数
 */
const calculateScoreFromStandard = (value, standard) => {
  if (!standard) return 0;

  let rawScore = 0;

  // Limit Break: 移除 100 分封頂，改採斜率延伸
  if (value >= standard[100]) {
    const valueDiff = standard[100] - standard[90];
    const slope = valueDiff > 0 ? 10 / valueDiff : 0;
    const extraValue = value - standard[100];
    let extendedScore = 100 + extraValue * slope;

    // 軟上限 (Soft Cap): 超過 120 分後，收益減半
    if (extendedScore > 120) {
      extendedScore = 120 + (extendedScore - 120) * 0.5;
    }

    rawScore = parseFloat(extendedScore.toFixed(2));
  } else {
    if (value <= standard[0]) {
      rawScore = 0;
    } else {
      // 找到分數區間
      let lower = 0;
      let upper = 100;
      for (let i = 10; i <= 100; i += 10) {
        if (value < standard[i]) {
          upper = i;
          lower = i - 10;
          break;
        }
      }

      // 線性插值
      const lowerValue = standard[lower];
      const upperValue = standard[upper];
      if (upperValue === lowerValue) {
        rawScore = upper;
      } else {
        rawScore =
          lower +
          ((value - lowerValue) / (upperValue - lowerValue)) * (upper - lower);
        rawScore = parseFloat(rawScore.toFixed(2));
      }
    }
  }

  return rawScore;
};

/**
 * 应用荣誉锁机制
 */
const applyHonorLock = (score, isVerified) => {
  const roundedScore = parseFloat(Number(score).toFixed(2));
  if (roundedScore > 100) {
    if (isVerified) {
      return { displayScore: roundedScore, isCapped: false };
    } else {
      return { displayScore: 100, isCapped: true };
    }
  }
  return { displayScore: roundedScore, isCapped: false };
};

/**
 * 重新计算 SMM 分数
 * @param {Object} user - 用户数据对象
 * @param {number} user.stats_smm - SMM 重量 (kg)
 * @param {number} user.weight - 体重 (kg)
 * @param {number} user.age - 年龄
 * @param {string} user.gender - 性别 ('male' | 'female' | '男性' | '女性')
 * @param {boolean} user.isVerified - 是否已认证
 * @param {Object} user.testInputs - 测试输入数据
 * @param {number} user.testInputs.muscle.smm - SMM 重量 (备用)
 * @returns {number|null} 计算出的分数，如果计算失败返回 null
 */
export const recalculateSMMScore = user => {
  try {
    // 获取 SMM 数据（优先使用 stats_smm，否则使用 testInputs.muscle.smm）
    const smm = Number(user.stats_smm) || Number(user.testInputs?.muscle?.smm) || 0;
    const weight = Number(user.weight) || 0;
    const age = Number(user.age) || 0;
    const gender = user.gender || '';

    // 检查必要数据
    if (!smm || !weight || !age || !gender) {
      return null;
    }

    // 获取年龄范围
    const ageRange = getAgeRange(age);
    if (!ageRange) {
      return null;
    }

    // 计算 SMM 比率
    const smPercent = (smm / weight) * 100;

    // 确定性别
    const genderValue =
      gender === '男性' || gender.toLowerCase() === 'male' ? 'male' : 'female';

    // 获取标准数据
    const smmStandards =
      genderValue === 'male'
        ? muscleStandardsMaleSMM
        : muscleStandardsFemaleSMM;
    const smPercentStandards =
      genderValue === 'male'
        ? muscleStandardsMaleSMPercent
        : muscleStandardsFemaleSMPercent;

    const smmStandard = smmStandards[ageRange];
    const smPercentStandard = smPercentStandards[ageRange];

    if (!smmStandard || !smPercentStandard) {
      return null;
    }

    // 计算原始分数
    const smmRawScore = calculateScoreFromStandard(smm, smmStandard);
    const smPercentScore = calculateScoreFromStandard(
      parseFloat(smPercent),
      smPercentStandard
    );

    // 应用 1.25 倍放大系数（仅对 SMM）
    const smmScoreRaw = parseFloat((smmRawScore * 1.25).toFixed(2));

    // 应用荣誉锁机制
    const isVerified = user.isVerified === true;
    const smmLocked = applyHonorLock(smmScoreRaw, isVerified);
    const smPercentLocked = applyHonorLock(smPercentScore, isVerified);

    // 计算最终分数（平均值）
    const finalScoreRaw = (smmLocked.displayScore + smPercentLocked.displayScore) / 2;
    const finalScoreLocked = applyHonorLock(finalScoreRaw, isVerified);

    return parseFloat(finalScoreLocked.displayScore.toFixed(2));
  } catch (error) {
    console.error('重新计算 SMM 分数失败:', error);
    return null;
  }
};

