import logger from './logger';

/**
 * ✅ RPG 職業系統計算器
 * 根據五項評測分數動態計算用戶的「戰鬥風格 / 職業」
 * 完全使用 RPG 術語，避免任何版權風險
 */

/**
 * 計算標準差
 */
function calculateStandardDeviation(values) {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  return Math.sqrt(variance);
}

/**
 * 計算 FFMI (去脂體重指數)
 * @param {number} weight - 體重 (kg)
 * @param {number} height - 身高 (cm)
 * @param {number} bodyFat - 體脂肪率 (%)
 * @returns {number} FFMI 值
 */
function calculateFFMI(weight, height, bodyFat) {
  if (!weight || !height || bodyFat === undefined) return 0;
  
  const heightM = height / 100; // 轉換為公尺
  const leanBodyMass = weight * (1 - bodyFat / 100); // 去脂體重
  const ffmi = leanBodyMass / (heightM * heightM);
  
  return Number(ffmi.toFixed(2));
}

/**
 * 計算 RPG 職業
 * @param {Object} scores - 評測分數對象
 * @param {number} scores.strength - 力量
 * @param {number} scores.explosivePower - 爆發力
 * @param {number} scores.cardio - 心肺耐力
 * @param {number} scores.muscleMass - 肌肉量
 * @param {number} scores.bodyFat - 體脂肪率（百分比）
 * @param {Object} userData - 用戶基本資料（用於計算 FFMI）
 * @param {number} userData.weight - 體重 (kg)
 * @param {number} userData.height - 身高 (cm)
 * @param {Object} options - 選項
 * @param {number} options.averageMuscleMass - 全體用戶平均肌肉量（預設 50）
 * @returns {Object} { class: string, name: string, icon: string, description: string }
 */
export function getRPGClass(scores, userData = {}, options = {}) {
  const {
    strength = 0,
    explosivePower = 0,
    cardio = 0,
    muscleMass = 0,
    bodyFat = 0,
  } = scores;

  const {
    averageMuscleMass = 50,
  } = options;

  const { weight = 0, height = 0 } = userData;

  // 獲取所有分數值（用於計算標準差和平均分）
  const scoreValues = [strength, explosivePower, cardio, muscleMass, bodyFat].filter(
    score => score > 0
  );

  // 如果沒有任何分數，返回預設值
  if (scoreValues.length === 0) {
    return {
      class: 'UNKNOWN',
      name: '未覺醒',
      icon: '❓',
      description: '完成評測後，你將覺醒屬於自己的戰鬥風格。',
    };
  }

  // 計算 FFMI（用於魔導士判定）
  const ffmi = calculateFFMI(weight, height, bodyFat);

  // 計算標準差和平均分（用於覺醒者判定）
  const stdDev = calculateStandardDeviation(scoreValues);
  const totalScore = scoreValues.reduce((sum, val) => sum + val, 0);
  const averageScore = totalScore / scoreValues.length;

  // 判定條件：標準差極低（< 10）且平均分 > 60
  const isAwakened = stdDev < 10 && averageScore > 60;

  // 優先判定：覺醒者（隱藏職業，最高優先級）
  if (isAwakened) {
    return {
      class: 'AWAKENED',
      name: '覺醒者',
      icon: '🌟',
      description:
        '數值雷達圖呈現完美的圓形。你沒有短板，能夠適應任何戰局。你是被選中的完美個體，詮釋著什麼叫做「毫無死角」的強大。',
    };
  }

  // 判定：武鬥家（體脂低 + 肌肉高）
  // 注意：此判定需在「最高分判定」之前，因為這是特殊條件
  if (bodyFat > 0 && bodyFat < 12 && muscleMass > averageMuscleMass) {
    return {
      class: 'FIGHTER',
      name: '武鬥家',
      icon: '🥊',
      description:
        '極致的體脂控制與精煉的肌肉線條，你的身體是千錘百鍊的藝術品。沒有一絲贅肉，只有為了戰鬥而生的完美兵器。',
    };
  }

  // 計算各項目的 FFMI 分數（用於魔導士判定）
  // 注意：魔導士的判定是「FFMI 最高」，不是單純的 bodyFat 分數
  // 但由於我們只有 bodyFat 分數，這裡用 bodyFat 分數作為代理指標
  // 實際判定：如果 bodyFat 分數是最高分，且 FFMI 計算值也較高，則判定為魔導士
  const allScores = {
    strength,
    explosivePower,
    cardio,
    muscleMass,
    bodyFat,
  };

  // 找出最高分數和對應的項目
  const maxScore = Math.max(strength, explosivePower, cardio, muscleMass, bodyFat);
  const maxScoreKey = Object.keys(allScores).find(
    key => allScores[key] === maxScore
  );

  // 判定：魔導士（FFMI 特化型）
  // 如果 bodyFat 分數最高，且 FFMI 值較高（> 20），則判定為魔導士
  if (maxScoreKey === 'bodyFat' && ffmi > 20) {
    return {
      class: 'MAGE',
      name: '魔導士',
      icon: '🔮',
      description:
        '你擁有違背常理的肉體密度 (FFMI)。這不是單純的鍛鍊，這是天賦與科學的結晶。你的存在本身，就是對人體極限的魔法演繹。',
    };
  }

  // 判定：五大基礎職業（根據最高分項目）
  if (maxScoreKey === 'strength') {
    return {
      class: 'BERSERKER',
      name: '狂戰士',
      icon: '⚔️',
      description:
        '你的肌肉纖維充滿了破壞性的力量。在絕對的力量面前，任何技巧都是多餘的。你是戰場上的攻城錘，以粉碎一切的姿態統治重訓區。',
    };
  }

  if (maxScoreKey === 'explosivePower') {
    return {
      class: 'ASSASSIN',
      name: '刺客',
      icon: '⚡',
      description:
        '天下武功，唯快不破。你擁有驚人的神經徵召能力與爆發力，能在一瞬間輸出巨大的能量。當別人還在熱身，你已經結束了戰鬥。',
    };
  }

  if (maxScoreKey === 'cardio') {
    return {
      class: 'RANGER',
      name: '遊俠',
      icon: '🏹',
      description:
        '你的心肺功能如同永動機般運轉。無論戰鬥持續多久，你都能保持最佳狀態。你是長征的王者，用無盡的體能拖垮對手。',
    };
  }

  if (maxScoreKey === 'muscleMass') {
    return {
      class: 'PALADIN',
      name: '騎士',
      icon: '🛡️',
      description:
        '你如同一座移動的堡壘。厚實的肌肉鎧甲是你最強的防禦，也是榮耀的象徵。你站在那裡，就是隊伍中不可撼動的中流砥柱。',
    };
  }

  // 如果 bodyFat 是最高分但 FFMI 不夠高，則根據次高分判定
  // 或者如果所有分數都相同，預設為狂戰士
  const sortedScores = Object.entries(allScores)
    .filter(([key]) => key !== 'bodyFat' || ffmi <= 20) // 排除不符合魔導士條件的 bodyFat
    .sort(([, a], [, b]) => b - a);

  if (sortedScores.length > 0) {
    const [topKey] = sortedScores[0];

    const classMap = {
      strength: {
        class: 'BERSERKER',
        name: '狂戰士',
        icon: '⚔️',
        description:
          '你的肌肉纖維充滿了破壞性的力量。在絕對的力量面前，任何技巧都是多餘的。你是戰場上的攻城錘，以粉碎一切的姿態統治重訓區。',
      },
      explosivePower: {
        class: 'ASSASSIN',
        name: '刺客',
        icon: '⚡',
        description:
          '天下武功，唯快不破。你擁有驚人的神經徵召能力與爆發力，能在一瞬間輸出巨大的能量。當別人還在熱身，你已經結束了戰鬥。',
      },
      cardio: {
        class: 'RANGER',
        name: '遊俠',
        icon: '🏹',
        description:
          '你的心肺功能如同永動機般運轉。無論戰鬥持續多久，你都能保持最佳狀態。你是長征的王者，用無盡的體能拖垮對手。',
      },
      muscleMass: {
        class: 'PALADIN',
        name: '騎士',
        icon: '🛡️',
        description:
          '你如同一座移動的堡壘。厚實的肌肉鎧甲是你最強的防禦，也是榮耀的象徵。你站在那裡，就是隊伍中不可撼動的中流砥柱。',
      },
    };

    return classMap[topKey] || classMap.strength;
  }

  // 預設返回狂戰士
  return {
    class: 'BERSERKER',
    name: '狂戰士',
    icon: '⚔️',
    description:
      '你的肌肉纖維充滿了破壞性的力量。在絕對的力量面前，任何技巧都是多餘的。你是戰場上的攻城錘，以粉碎一切的姿態統治重訓區。',
  };
}

/**
 * 獲取 RPG 職業圖標
 * @param {string} rpgClass - 職業代碼 (BERSERKER, ASSASSIN, etc.)
 * @returns {string} Emoji 圖標
 */
export function getRPGClassIcon(rpgClass) {
  const iconMap = {
    BERSERKER: '⚔️',
    ASSASSIN: '⚡',
    RANGER: '🏹',
    PALADIN: '🛡️',
    FIGHTER: '🥊',
    MAGE: '🔮',
    AWAKENED: '🌟',
    UNKNOWN: '❓',
  };
  return iconMap[rpgClass] || '❓';
}

/**
 * 獲取 RPG 職業名稱
 * @param {string} rpgClass - 職業代碼
 * @returns {string} 職業名稱
 */
export function getRPGClassName(rpgClass) {
  const nameMap = {
    BERSERKER: '狂戰士',
    ASSASSIN: '刺客',
    RANGER: '遊俠',
    PALADIN: '騎士',
    FIGHTER: '武鬥家',
    MAGE: '魔導士',
    AWAKENED: '覺醒者',
    UNKNOWN: '未覺醒',
  };
  return nameMap[rpgClass] || '未覺醒';
}

