

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
