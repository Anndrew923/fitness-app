// 年齡段分類
export const getAgeGroup = age => {
  if (age < 18) return 'teen';
  if (age < 25) return 'young';
  if (age < 35) return 'adult';
  if (age < 50) return 'middle';
  return 'senior';
};

// 計算天梯總分
export const calculateLadderScore = scores => {
  const { strength, explosivePower, cardio, muscleMass, bodyFat } = scores;
  return Math.round(
    (strength + explosivePower + cardio + muscleMass + bodyFat) / 5
  );
};

// 格式化分數顯示
export const formatScore = score => {
  return Math.round(score * 10) / 10;
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
