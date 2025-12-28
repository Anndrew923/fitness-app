/**
 * 力量評測 2.0 - 核心數學運算庫
 * Core Math Utils for Strength Assessment 2.0
 */

/**
 * 1. 1RM 計算 (Brzycki Formula)
 * @param weight - 訓練重量 (kg)
 * @param reps - 完成次數
 * @returns 預估 1RM (kg)
 */
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) {
    return weight;
  }
  
  if (reps <= 0 || weight <= 0) {
    throw new Error('Weight and reps must be positive numbers');
  }
  
  return weight * (36 / (37 - reps));
}

/**
 * 2. McCulloch 年齡修正係數 (Age Correction)
 * @param age - 年齡
 * @returns 修正係數
 */
export function getMcCullochCoefficient(age: number): number {
  if (age < 14) {
    // 使用 14 歲標準
    return 1.23;
  }
  
  if (age >= 14 && age <= 23) {
    // 成長期補償：線性遞減從 1.23 到 1.0
    const progress = (age - 14) / (23 - 14);
    return 1.23 - (progress * 0.23);
  }
  
  if (age >= 24 && age <= 40) {
    // 巔峰期：係數 = 1.0
    return 1.0;
  }
  
  // 40+ 歲：老化補償
  if (age >= 41 && age <= 44) {
    return 1.045;
  }
  if (age >= 45 && age <= 49) {
    return 1.11;
  }
  if (age >= 50 && age <= 54) {
    return 1.15;
  }
  if (age >= 55 && age <= 59) {
    return 1.20;
  }
  if (age >= 60 && age <= 64) {
    return 1.25;
  }
  if (age >= 65 && age <= 69) {
    return 1.30;
  }
  if (age >= 70 && age <= 74) {
    return 1.35;
  }
  if (age >= 75 && age <= 79) {
    return 1.40;
  }
  // 80+ 歲
  return 1.45;
}

/**
 * 3. DOTS 係數計算 (IPF 標準)
 * @param bodyWeight - 體重 (kg)
 * @param liftedWeight - 舉起重量 (kg)
 * @param gender - 性別 ('male' | 'female')
 * @returns DOTS 分數
 */
export function calculateDOTS(
  bodyWeight: number,
  liftedWeight: number,
  gender: 'male' | 'female'
): number {
  if (bodyWeight <= 0 || liftedWeight <= 0) {
    throw new Error('Body weight and lifted weight must be positive numbers');
  }
  
  // IPF DOTS 係數表
  const coefficients = {
    male: {
      A: -0.000001093,
      B: 0.0007391293,
      C: -0.191875104,
      D: 24.0900756,
      E: -307.75076
    },
    female: {
      A: -0.0000010706,
      B: 0.0005158568,
      C: -0.1126655495,
      D: 13.6175032,
      E: -57.96288
    }
  };
  
  const coeff = coefficients[gender];
  const bw = bodyWeight;
  
  // 公式：DOTS = (liftedWeight * 500) / (A*bw^4 + B*bw^3 + C*bw^2 + D*bw + E)
  const denominator = 
    coeff.A * Math.pow(bw, 4) +
    coeff.B * Math.pow(bw, 3) +
    coeff.C * Math.pow(bw, 2) +
    coeff.D * bw +
    coeff.E;
  
  if (denominator === 0) {
    throw new Error('DOTS denominator is zero, invalid body weight');
  }
  
  return (liftedWeight * 500) / denominator;
}

