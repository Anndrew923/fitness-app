/**
 * 力量評測 2.0 - 評分邏輯
 * Strength Assessment 2.0 - Scoring Logic
 */

import {
  calculateOneRepMax,
  calculateDOTS,
  getMcCullochCoefficient
} from './calculations';

/**
 * 菁英錨點常數 (Elite Anchors)
 * 各動作對應的 "100分 DOTS 門檻"
 * 
 * ⚠️ 調整說明：原基準值過於嚴格（對應世界級精英水平），
 * 已調整為 Advanced 級別（約 80-85 分水平），使中等水平用戶能獲得 60-70 分，
 * 更符合激勵用戶的產品目標。
 */
export const ANCHOR_DOTS = {
  'Deadlift': 150,    // 原 190，調整為 0.79 倍
  'Squat': 140,       // 原 175，調整為 0.80 倍
  'Bench Press': 90,  // 原 115，調整為 0.78 倍
  'Lat Pulldown': 88, // 原 110，調整為 0.80 倍
  'Overhead Press': 60, // 原 75，調整為 0.80 倍
  'Pull-ups': 88      // 原 110，調整為 0.80 倍
} as const;

export type ExerciseType = keyof typeof ANCHOR_DOTS;

/**
 * 計算力量評分
 * @param exerciseType - 動作類型
 * @param weight - 負重/插銷重 (kg)
 * @param reps - 完成次數
 * @param bodyWeight - 體重 (kg)
 * @param gender - 性別 ('male' | 'female')
 * @param age - 年齡
 * @returns 最終評分 (浮點數，無上限)
 */
export function calculateStrengthScore(
  exerciseType: string,
  weight: number,
  reps: number,
  bodyWeight: number,
  gender: 'male' | 'female',
  age: number
): number | null {
  // 檢查動作類型是否有效
  if (!(exerciseType in ANCHOR_DOTS)) {
    return null;
  }

  const anchorDOTS = ANCHOR_DOTS[exerciseType as ExerciseType];

  // 1. 決定計算用重量 (LiftWeight)
  let liftWeight: number;
  if (exerciseType === 'Pull-ups') {
    // 引體向上：體重 + 負重
    liftWeight = bodyWeight + weight;
  } else {
    // 其他動作：僅計算槓鈴/插銷重量
    liftWeight = weight;
  }

  // 2. 計算 1RM
  const oneRepMax = calculateOneRepMax(liftWeight, reps);

  // 3. 計算 Raw DOTS
  const rawDOTS = calculateDOTS(bodyWeight, oneRepMax, gender);

  // 4. 取得年齡修正係數
  const ageCorrection = getMcCullochCoefficient(age);

  // 5. 計算最終分數
  // CorrectedDOTS = RawDOTS * AgeCorrection
  const correctedDOTS = rawDOTS * ageCorrection;

  // FinalScore = (CorrectedDOTS / AnchorDOTS) * 100
  const finalScore = (correctedDOTS / anchorDOTS) * 100;

  return finalScore;
}

