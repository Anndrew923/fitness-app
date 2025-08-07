// 年齡段分類 - 每十歲一個區間
export const getAgeGroup = age => {
  // 處理無效年齡
  if (age === null || age === undefined || age < 0 || age > 150) {
    return 'unknown';
  }

  if (age <= 20) return 'under20';
  if (age <= 30) return '21to30';
  if (age <= 40) return '31to40';
  if (age <= 50) return '41to50';
  if (age <= 60) return '51to60';
  if (age <= 70) return '61to70';
  return 'over70';
};

// 計算天梯總分
export const calculateLadderScore = scores => {
  const { strength, explosivePower, cardio, muscleMass, bodyFat } = scores;
  const scoreValues = [strength, explosivePower, cardio, muscleMass, bodyFat];

  // 檢查是否完成全部5個評測項目
  const completedCount = scoreValues.filter(score => score > 0).length;

  // 如果沒有完成全部5個項目，返回0（無法參與天梯排名）
  if (completedCount < 5) {
    return 0;
  }

  // 完成全部5個項目後，計算平均分數
  const total = scoreValues.reduce((sum, score) => sum + Number(score), 0);
  return Math.round((total / 5) * 100) / 100; // 保留兩位小數
};

// 格式化分數顯示
export const formatScore = score => {
  if (!score && score !== 0) return '0.00';
  return Number(score).toFixed(2);
};

// 生成用戶暱稱（如果未設定）
export const generateNickname = email => {
  if (!email) return '健身愛好者';
  const username = email.split('@')[0];
  return username.charAt(0).toUpperCase() + username.slice(1);
};

// 驗證暱稱格式
export const validateNickname = nickname => {
  if (!nickname || nickname.trim().length < 2) {
    return { valid: false, message: '暱稱至少需要2個字符' };
  }
  if (nickname.length > 20) {
    return { valid: false, message: '暱稱不能超過20個字符' };
  }
  if (!/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(nickname)) {
    return {
      valid: false,
      message: '暱稱只能包含字母、數字、中文、下劃線和連字符',
    };
  }
  return { valid: true, message: '' };
};

// 檢查是否為訪客模式
export const isGuestMode = () => {
  return (
    !localStorage.getItem('userData') && !sessionStorage.getItem('guestData')
  );
};

// 獲取本地儲存的訪客資料
export const getGuestData = () => {
  const guestData = sessionStorage.getItem('guestData');
  return guestData ? JSON.parse(guestData) : null;
};

// 保存訪客資料到本地
export const saveGuestData = data => {
  sessionStorage.setItem('guestData', JSON.stringify(data));
};

// 清除訪客資料
export const clearGuestData = () => {
  sessionStorage.removeItem('guestData');
};

// 新增：數據驗證和清理函數
export const validateAndCleanUserData = data => {
  const cleaned = { ...data };
  const errors = [];

  // 驗證和清理基本數據
  if (cleaned.height !== undefined) {
    const height = Number(cleaned.height);
    if (isNaN(height) || height < 50 || height > 300) {
      errors.push('身高數據無效');
      cleaned.height = 0;
    } else {
      cleaned.height = height;
    }
  }

  if (cleaned.weight !== undefined) {
    const weight = Number(cleaned.weight);
    if (isNaN(weight) || weight < 20 || weight > 500) {
      errors.push('體重數據無效');
      cleaned.weight = 0;
    } else {
      cleaned.weight = weight;
    }
  }

  if (cleaned.age !== undefined) {
    const age = Number(cleaned.age);
    if (isNaN(age) || age < 0 || age > 150) {
      errors.push('年齡數據無效');
      cleaned.age = 0;
    } else {
      cleaned.age = age;
    }
  }

  // 驗證和清理分數數據
  if (cleaned.scores) {
    const validScores = {};
    Object.entries(cleaned.scores).forEach(([key, value]) => {
      const score = Number(value);
      if (!isNaN(score) && score >= 0 && score <= 100) {
        validScores[key] = score;
      } else if (value !== undefined) {
        errors.push(`${key} 分數無效`);
        validScores[key] = 0;
      }
    });
    cleaned.scores = validScores;
  }

  // 驗證和清理字符串數據
  if (cleaned.nickname !== undefined) {
    const nickname = String(cleaned.nickname).trim();
    if (nickname.length > 20) {
      errors.push('暱稱過長');
      cleaned.nickname = nickname.substring(0, 20);
    } else {
      cleaned.nickname = nickname;
    }
  }

  if (cleaned.profession !== undefined) {
    const profession = String(cleaned.profession).trim();
    if (profession.length > 100) {
      errors.push('職業描述過長');
      cleaned.profession = profession.substring(0, 100);
    } else {
      cleaned.profession = profession;
    }
  }

  // 驗證和清理訓練相關數據
  if (cleaned.weeklyTrainingHours !== undefined) {
    const hours = Number(cleaned.weeklyTrainingHours);
    if (isNaN(hours) || hours < 0 || hours > 168) {
      errors.push('每周訓練時數無效');
      cleaned.weeklyTrainingHours = 0;
    } else {
      cleaned.weeklyTrainingHours = hours;
    }
  }

  if (cleaned.trainingYears !== undefined) {
    const years = Number(cleaned.trainingYears);
    if (isNaN(years) || years < 0 || years > 50) {
      errors.push('訓練年資無效');
      cleaned.trainingYears = 0;
    } else {
      cleaned.trainingYears = years;
    }
  }

  // 驗證布爾值數據
  if (cleaned.isAnonymousInLadder !== undefined) {
    cleaned.isAnonymousInLadder = Boolean(cleaned.isAnonymousInLadder);
  }

  // 驗證和清理天梯相關數據
  if (cleaned.ladderScore !== undefined) {
    const score = Number(cleaned.ladderScore);
    if (isNaN(score) || score < 0) {
      errors.push('天梯分數無效');
      cleaned.ladderScore = 0;
    } else {
      cleaned.ladderScore = score;
    }
  }

  if (cleaned.ladderRank !== undefined) {
    const rank = Number(cleaned.ladderRank);
    if (isNaN(rank) || rank < 0) {
      errors.push('天梯排名無效');
      cleaned.ladderRank = 0;
    } else {
      cleaned.ladderRank = rank;
    }
  }

  return {
    cleaned,
    errors,
    isValid: errors.length === 0,
  };
};

// 新增：防抖函數
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// 新增：節流函數
export const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// 新增：安全的 JSON 解析
export const safeJsonParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('JSON 解析失敗:', error);
    return defaultValue;
  }
};

// 新增：數據深拷貝
export const deepClone = obj => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};
