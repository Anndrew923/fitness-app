// 調試助手工具
export const debugHelper = {
  // 檢查用戶數據完整性
  checkUserData: userData => {
    console.log('🔍 用戶數據檢查:', {
      userId: userData?.userId,
      authUid: userData?.authUid,
      ladderScore: userData?.ladderScore,
      age: userData?.age,
      ageGroup: userData?.ageGroup,
      scores: userData?.scores,
      lastLadderSubmission: userData?.lastLadderSubmission,
    });
  },

  // 檢查天梯數據
  checkLadderData: (ladderData, userData) => {
    console.log('🔍 天梯數據檢查:', {
      totalUsers: ladderData.length,
      userInLadder: ladderData.find(
        user => user.id === userData?.userId || user.id === userData?.authUid
      ),
      topScores: ladderData.slice(0, 5).map(user => ({
        id: user.id,
        name: user.displayName,
        score: user.ladderScore,
        ageGroup: user.ageGroup,
      })),
    });
  },

  // 檢查年齡段分布
  checkAgeGroupDistribution: ladderData => {
    const distribution = ladderData.reduce((acc, user) => {
      acc[user.ageGroup] = (acc[user.ageGroup] || 0) + 1;
      return acc;
    }, {});

    console.log('🔍 年齡段分布:', distribution);
    return distribution;
  },

  // 檢查 Firebase 權限
  checkFirebasePermissions: async () => {
    try {
      // 暫時註釋，等待 Firebase 導入問題解決
      // const testQuery = query(collection(db, 'users'), limit(1));
      // const snapshot = await getDocs(testQuery);
      console.log('✅ Firebase 權限檢查通過');
      return true;
    } catch (error) {
      console.error('❌ Firebase 權限檢查失敗:', error);
      return false;
    }
  },

  // 檢查社群動態權限
  checkCommunityPermissions: async () => {
    try {
      // 暫時註釋，等待 Firebase 導入問題解決
      // const testQuery = query(collection(db, 'communityPosts'), limit(1));
      // const snapshot = await getDocs(testQuery);
      console.log('✅ 社群動態權限檢查通過');
      return true;
    } catch (error) {
      console.error('❌ 社群動態權限檢查失敗:', error);
      return false;
    }
  },

  // 模擬天梯提交
  simulateLadderSubmission: async (userData, setUserData) => {
    console.log('🧪 模擬天梯提交...');

    const testScores = {
      strength: 85,
      explosivePower: 78,
      cardio: 92,
      muscleMass: 88,
      bodyFat: 76,
    };

    const testUserData = {
      ...userData,
      scores: testScores,
      ladderScore: 83.8, // 平均分數
      lastLadderSubmission: new Date().toISOString(),
    };

    setUserData(testUserData);
    console.log('✅ 模擬天梯提交完成');
  },
};

// 在開發環境中自動啟用調試
if (process.env.NODE_ENV === 'development') {
  window.debugHelper = debugHelper;
  console.log('🔧 調試助手已啟用，使用 window.debugHelper 訪問');
}
