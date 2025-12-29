import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase';

/**
 * 管理員系統工具
 * 用於處理管理員審核功能（檢舉和認證）
 */
class AdminSystem {
  /**
   * 檢查用戶是否為管理員
   * @param {string} userId - 用戶 ID（可選，預設為當前用戶）
   * @returns {Promise<boolean>} 是否為管理員
   */
  static async checkAdminStatus(userId = null) {
    try {
      const currentUserId = userId || auth.currentUser?.uid;
      if (!currentUserId) {
        return false;
      }

      const userRef = doc(db, 'users', currentUserId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return false;
      }

      const userData = userSnap.data();
      return userData.isAdmin === true;
    } catch (error) {
      console.error('檢查管理員狀態失敗:', error);
      return false;
    }
  }

  /**
   * 記錄管理員操作
   * @param {Object} actionData - 操作資料
   * @param {string} actionData.action - 操作類型
   * @param {string} actionData.targetUserId - 目標用戶 ID
   * @param {string} actionData.details - 操作詳情（可選）
   * @returns {Promise<boolean>} 是否成功
   */
  static async logAdminAction(actionData) {
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        console.warn('無法記錄管理員操作：未登入');
        return false;
      }

      // 驗證是否為管理員
      const isAdmin = await this.checkAdminStatus(currentUserId);
      if (!isAdmin) {
        console.warn('無法記錄管理員操作：非管理員');
        return false;
      }

      const actionLog = {
        adminId: currentUserId,
        action: actionData.action,
        targetUserId: actionData.targetUserId || null,
        details: actionData.details || {},
        timestamp: new Date().toISOString(),
      };

      await addDoc(collection(db, 'adminActions'), actionLog);
      console.log('✅ 管理員操作已記錄:', actionLog);
      return true;
    } catch (error) {
      console.error('記錄管理員操作失敗:', error);
      return false;
    }
  }

  // ==================== 認證審核相關 ====================

  /**
   * 獲取待審核的認證申請列表
   * @param {number} limitCount - 限制數量（預設 50）
   * @returns {Promise<Array>} 申請列表
   */
  static async getPendingVerificationRequests(limitCount = 50) {
    try {
      const requestsRef = collection(db, 'verificationRequests');
      const q = query(
        requestsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const requests = [];

      // 獲取每個申請的用戶資料
      for (const docSnap of snapshot.docs) {
        const requestData = {
          id: docSnap.id,
          ...docSnap.data(),
        };

        // 獲取用戶資料
        try {
          const userRef = doc(db, 'users', requestData.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            requestData.userData = {
              id: userSnap.id,
              ...userSnap.data(),
            };
          }
        } catch (error) {
          console.warn('獲取用戶資料失敗:', error);
        }

        requests.push(requestData);
      }

      return requests;
    } catch (error) {
      console.error('獲取待審核認證申請失敗:', error);
      return [];
    }
  }

  /**
   * 獲取所有認證申請（包含所有狀態）
   * @param {number} limitCount - 限制數量（預設 100）
   * @returns {Promise<Array>} 申請列表
   */
  static async getAllVerificationRequests(limitCount = 100) {
    try {
      const requestsRef = collection(db, 'verificationRequests');
      const q = query(
        requestsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const requests = [];

      for (const docSnap of snapshot.docs) {
        const requestData = {
          id: docSnap.id,
          ...docSnap.data(),
        };

        // 獲取用戶資料
        try {
          const userRef = doc(db, 'users', requestData.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            requestData.userData = {
              id: userSnap.id,
              ...userSnap.data(),
            };
          }
        } catch (error) {
          console.warn('獲取用戶資料失敗:', error);
        }

        requests.push(requestData);
      }

      return requests;
    } catch (error) {
      console.error('獲取所有認證申請失敗:', error);
      return [];
    }
  }

  /**
   * 將 exercise 名稱映射到 scores key（處理 snake_case 到 camelCase）
   * @param {string} exercise - Exercise 名稱（可能是中文、英文或 key）
   * @returns {string|null} scores key（camelCase），如果無法映射則返回 null
   */
  static mapExerciseToScoreKey(exercise) {
    if (!exercise || typeof exercise !== 'string') {
      return null;
    }

    const trimmedExercise = exercise.trim();
    if (!trimmedExercise) {
      return null;
    }

    // 如果已經是 camelCase key，直接返回
    const camelCaseKeys = [
      'armSize',
      'benchPress',
      'squat',
      'deadlift',
      'latPulldown',
      'shoulderPress',
      'strength',
      'explosivePower',
      'cardio',
      'muscleMass',
      'bodyFat',
    ];

    if (camelCaseKeys.includes(trimmedExercise)) {
      return trimmedExercise;
    }

    // 處理 snake_case 轉 camelCase
    if (trimmedExercise.includes('_')) {
      const converted = trimmedExercise
        .split('_')
        .map((word, index) => {
          if (index === 0) {
            return word;
          }
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join('');
      
      // 驗證轉換後的 key 是否有效
      if (camelCaseKeys.includes(converted)) {
        return converted;
      }
    }

    // 常見映射表（中文名稱或英文名稱到 key）
    const exerciseMap = {
      // 中文映射
      臂圍: 'armSize',
      臥推: 'benchPress',
      深蹲: 'squat',
      硬舉: 'deadlift',
      划船: 'latPulldown',
      肩推: 'shoulderPress',
      // 英文映射（大小寫不敏感）
      'arm size': 'armSize',
      'arm_size': 'armSize',
      'armsize': 'armSize',
      'bench press': 'benchPress',
      'bench_press': 'benchPress',
      'benchpress': 'benchPress',
    };

    // 先嘗試原始值
    if (exerciseMap[trimmedExercise]) {
      return exerciseMap[trimmedExercise];
    }

    // 再嘗試小寫版本
    const normalizedExercise = trimmedExercise.toLowerCase();
    if (exerciseMap[normalizedExercise]) {
      return exerciseMap[normalizedExercise];
    }

    // 如果無法映射，返回 null（讓調用者決定如何處理）
    console.warn(`⚠️ 無法映射 exercise 名稱到 scores key: "${exercise}"`);
    return null;
  }

  /**
   * 審核認證申請（通過）
   * @param {string} requestId - 申請 ID
   * @param {string} notes - 審核備註（可選）
   * @returns {Promise<Object>} { success: boolean, message: string }
   */
  static async approveVerificationRequest(requestId, notes = '') {
    try {
      // 驗證管理員權限
      const isAdmin = await this.checkAdminStatus();
      if (!isAdmin) {
        return {
          success: false,
          message: '無權限執行此操作',
        };
      }

      // 獲取申請資料
      const requestRef = doc(db, 'verificationRequests', requestId);
      const requestSnap = await getDoc(requestRef);

      if (!requestSnap.exists()) {
        return {
          success: false,
          message: '申請不存在',
        };
      }

      const requestData = requestSnap.data();

      if (requestData.status !== 'pending') {
        return {
          success: false,
          message: '此申請已經審核過',
        };
      }

      // 獲取用戶資料
      const userRef = doc(db, 'users', requestData.userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return {
          success: false,
          message: '用戶不存在',
        };
      }

      const userData = userSnap.data();
      const currentLadderScore = userData.ladderScore || 0;

      // 更新申請狀態
      await updateDoc(requestRef, {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: auth.currentUser.uid,
        notes: notes || '',
        updatedAt: new Date().toISOString(),
      });

      // ✅ 自動更新分數：從 targetData 讀取並更新 scores
      let scoreUpdated = false;
      let updatedExerciseKey = null;
      let updatedScore = null;

      if (requestData.targetData && requestData.targetData.exercise && requestData.targetData.score !== undefined) {
        try {
          const exerciseKey = this.mapExerciseToScoreKey(requestData.targetData.exercise);
          const targetScore = Number(requestData.targetData.score);

          if (exerciseKey && !isNaN(targetScore) && targetScore > 0) {
            // 確保 scores 對象存在
            const currentScores = userData.scores || {};
            
            // 更新 scores
            const updatedScores = {
              ...currentScores,
              [exerciseKey]: targetScore,
            };

            // 原子更新：同時更新認證狀態和分數
            const now = new Date();
            const expiredAt = new Date(now);
            expiredAt.setFullYear(expiredAt.getFullYear() + 1);

            await updateDoc(userRef, {
              isVerified: true,
              verifiedLadderScore: currentLadderScore,
              verificationStatus: 'approved',
              verifiedAt: now.toISOString(),
              verificationExpiredAt: expiredAt.toISOString(),
              verificationRequestId: requestId,
              scores: updatedScores,
              updatedAt: now.toISOString(),
            });

            scoreUpdated = true;
            updatedExerciseKey = exerciseKey;
            updatedScore = targetScore;

            console.log(`✅ 分數已自動更新: scores.${exerciseKey} = ${targetScore}`);
          } else {
            console.warn('⚠️ targetData 格式無效，跳過分數更新:', requestData.targetData);
          }
        } catch (scoreError) {
          console.error('❌ 更新分數失敗:', scoreError);
          // 繼續執行，不影響認證流程
        }
      }

      // 如果沒有 targetData 或更新失敗，只更新認證狀態
      if (!scoreUpdated) {
        const now = new Date();
        const expiredAt = new Date(now);
        expiredAt.setFullYear(expiredAt.getFullYear() + 1);

        await updateDoc(userRef, {
          isVerified: true,
          verifiedLadderScore: currentLadderScore,
          verificationStatus: 'approved',
          verifiedAt: now.toISOString(),
          verificationExpiredAt: expiredAt.toISOString(),
          verificationRequestId: requestId,
          updatedAt: now.toISOString(),
        });
      }

      // ✅ 發送通知：認證通過通知
      try {
        const notificationsRef = collection(db, 'users', requestData.userId, 'notifications');
        
        // 構建通知訊息
        let notificationTitle = '認證通過！🎉';
        let notificationMessage = '恭喜！您的認證申請已通過，天梯排名已更新！';

        if (scoreUpdated && requestData.targetData) {
          const exerciseName = requestData.targetData.exercise || '成績';
          const score = requestData.targetData.score || updatedScore;
          notificationMessage = `恭喜！您的 ${exerciseName} 成績 ${score} 分已通過認證，天梯排名已更新！`;
        }

        await addDoc(notificationsRef, {
          type: 'verification_approved',
          title: notificationTitle,
          message: notificationMessage,
          read: false,
          createdAt: serverTimestamp(),
          targetPath: '/rankings',
          requestId: requestId,
        });

        console.log('✅ 通知已發送:', requestData.userId);
      } catch (notificationError) {
        console.error('❌ 發送通知失敗:', notificationError);
        // 繼續執行，不影響認證流程
      }

      // 記錄管理員操作
      await this.logAdminAction({
        action: 'approve_verification',
        targetUserId: requestData.userId,
        details: {
          requestId: requestId,
          ladderScore: currentLadderScore,
          notes: notes,
          scoreUpdated: scoreUpdated,
          updatedExercise: updatedExerciseKey,
          updatedScore: updatedScore,
        },
      });

      console.log('✅ 認證申請已通過:', requestId);

      return {
        success: true,
        message: '認證申請已通過',
      };
    } catch (error) {
      console.error('❌ 審核認證申請失敗:', error);
      return {
        success: false,
        message: '審核失敗，請稍後再試',
      };
    }
  }

  /**
   * 審核認證申請（拒絕）
   * @param {string} requestId - 申請 ID
   * @param {string} rejectionReason - 拒絕原因
   * @returns {Promise<Object>} { success: boolean, message: string }
   */
  static async rejectVerificationRequest(requestId, rejectionReason = '') {
    try {
      // 驗證管理員權限
      const isAdmin = await this.checkAdminStatus();
      if (!isAdmin) {
        return {
          success: false,
          message: '無權限執行此操作',
        };
      }

      // 獲取申請資料
      const requestRef = doc(db, 'verificationRequests', requestId);
      const requestSnap = await getDoc(requestRef);

      if (!requestSnap.exists()) {
        return {
          success: false,
          message: '申請不存在',
        };
      }

      const requestData = requestSnap.data();

      if (requestData.status !== 'pending') {
        return {
          success: false,
          message: '此申請已經審核過',
        };
      }

      // 更新申請狀態
      await updateDoc(requestRef, {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: auth.currentUser.uid,
        rejectionReason: rejectionReason || '__NO_REASON_PROVIDED__',
        updatedAt: new Date().toISOString(),
      });

      // 更新用戶資料（記錄拒絕時間，用於冷卻期）
      const userRef = doc(db, 'users', requestData.userId);
      await updateDoc(userRef, {
        lastVerificationRejectionAt: new Date().toISOString(),
        verificationStatus: 'rejected',
        updatedAt: new Date().toISOString(),
      });

      // 記錄管理員操作
      await this.logAdminAction({
        action: 'reject_verification',
        targetUserId: requestData.userId,
        details: {
          requestId: requestId,
          rejectionReason: rejectionReason,
        },
      });

      console.log('✅ 認證申請已拒絕:', requestId);

      return {
        success: true,
        message: '認證申請已拒絕',
      };
    } catch (error) {
      console.error('❌ 拒絕認證申請失敗:', error);
      return {
        success: false,
        message: '操作失敗，請稍後再試',
      };
    }
  }

  // ==================== 檢舉審核相關 ====================

  /**
   * 獲取待審核的檢舉列表
   * @param {number} limitCount - 限制數量（預設 50）
   * @returns {Promise<Array>} 檢舉列表
   */
  static async getPendingReports(limitCount = 50) {
    try {
      const reportsRef = collection(db, 'reports');
      const q = query(
        reportsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const reports = [];

      // 獲取每個檢舉的用戶資料
      for (const docSnap of snapshot.docs) {
        const reportData = {
          id: docSnap.id,
          ...docSnap.data(),
        };

        // 獲取被檢舉用戶資料
        try {
          const reportedUserRef = doc(db, 'users', reportData.reportedUserId);
          const reportedUserSnap = await getDoc(reportedUserRef);
          if (reportedUserSnap.exists()) {
            reportData.reportedUserData = {
              id: reportedUserSnap.id,
              ...reportedUserSnap.data(),
            };
          }
        } catch (error) {
          console.warn('獲取被檢舉用戶資料失敗:', error);
        }

        // 獲取檢舉者資料
        try {
          const reporterRef = doc(db, 'users', reportData.reporterId);
          const reporterSnap = await getDoc(reporterRef);
          if (reporterSnap.exists()) {
            reportData.reporterData = {
              id: reporterSnap.id,
              ...reporterSnap.data(),
            };
          }
        } catch (error) {
          console.warn('獲取檢舉者資料失敗:', error);
        }

        reports.push(reportData);
      }

      return reports;
    } catch (error) {
      console.error('獲取待審核檢舉失敗:', error);
      return [];
    }
  }

  /**
   * 獲取所有檢舉（包含所有狀態）
   * @param {number} limitCount - 限制數量（預設 100）
   * @returns {Promise<Array>} 檢舉列表
   */
  static async getAllReports(limitCount = 100) {
    try {
      const reportsRef = collection(db, 'reports');
      const q = query(
        reportsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const reports = [];

      for (const docSnap of snapshot.docs) {
        const reportData = {
          id: docSnap.id,
          ...docSnap.data(),
        };

        // 獲取被檢舉用戶資料
        try {
          const reportedUserRef = doc(db, 'users', reportData.reportedUserId);
          const reportedUserSnap = await getDoc(reportedUserRef);
          if (reportedUserSnap.exists()) {
            reportData.reportedUserData = {
              id: reportedUserSnap.id,
              ...reportedUserSnap.data(),
            };
          }
        } catch (error) {
          console.warn('獲取被檢舉用戶資料失敗:', error);
        }

        reports.push(reportData);
      }

      return reports;
    } catch (error) {
      console.error('獲取所有檢舉失敗:', error);
      return [];
    }
  }

  /**
   * 審核檢舉（通過）
   * @param {string} reportId - 檢舉 ID
   * @param {string} notes - 審核備註（可選）
   * @returns {Promise<Object>} { success: boolean, message: string }
   */
  static async approveReport(reportId, notes = '') {
    try {
      // 驗證管理員權限
      const isAdmin = await this.checkAdminStatus();
      if (!isAdmin) {
        return {
          success: false,
          message: '無權限執行此操作',
        };
      }

      // 獲取檢舉資料
      const reportRef = doc(db, 'reports', reportId);
      const reportSnap = await getDoc(reportRef);

      if (!reportSnap.exists()) {
        return {
          success: false,
          message: '檢舉不存在',
        };
      }

      const reportData = reportSnap.data();

      if (reportData.status !== 'pending') {
        return {
          success: false,
          message: '此檢舉已經審核過',
        };
      }

      // 更新檢舉狀態
      await updateDoc(reportRef, {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: auth.currentUser.uid,
        notes: notes || '',
        updatedAt: new Date().toISOString(),
      });

      // 記錄管理員操作
      await this.logAdminAction({
        action: 'approve_report',
        targetUserId: reportData.reportedUserId,
        details: {
          reportId: reportId,
          reportType: reportData.reportType,
          notes: notes,
        },
      });

      console.log('✅ 檢舉已通過:', reportId);

      return {
        success: true,
        message: '檢舉已通過',
      };
    } catch (error) {
      console.error('❌ 審核檢舉失敗:', error);
      return {
        success: false,
        message: '審核失敗，請稍後再試',
      };
    }
  }

  /**
   * 審核檢舉（拒絕）
   * @param {string} reportId - 檢舉 ID
   * @param {string} notes - 審核備註（可選）
   * @returns {Promise<Object>} { success: boolean, message: string }
   */
  static async rejectReport(reportId, notes = '') {
    try {
      // 驗證管理員權限
      const isAdmin = await this.checkAdminStatus();
      if (!isAdmin) {
        return {
          success: false,
          message: '無權限執行此操作',
        };
      }

      // 獲取檢舉資料
      const reportRef = doc(db, 'reports', reportId);
      const reportSnap = await getDoc(reportRef);

      if (!reportSnap.exists()) {
        return {
          success: false,
          message: '檢舉不存在',
        };
      }

      const reportData = reportSnap.data();

      if (reportData.status !== 'pending') {
        return {
          success: false,
          message: '此檢舉已經審核過',
        };
      }

      // 更新檢舉狀態
      await updateDoc(reportRef, {
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        reviewedBy: auth.currentUser.uid,
        notes: notes || '',
        updatedAt: new Date().toISOString(),
      });

      // 記錄管理員操作
      await this.logAdminAction({
        action: 'reject_report',
        targetUserId: reportData.reportedUserId,
        details: {
          reportId: reportId,
          reportType: reportData.reportType,
          notes: notes,
        },
      });

      console.log('✅ 檢舉已拒絕:', reportId);

      return {
        success: true,
        message: '檢舉已拒絕',
      };
    } catch (error) {
      console.error('❌ 拒絕檢舉失敗:', error);
      return {
        success: false,
        message: '操作失敗，請稍後再試',
      };
    }
  }

  /**
   * 獲取管理員操作記錄
   * @param {number} limitCount - 限制數量（預設 100）
   * @returns {Promise<Array>} 操作記錄列表
   */
  static async getAdminActions(limitCount = 100) {
    try {
      const actionsRef = collection(db, 'adminActions');
      const q = query(
        actionsRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const actions = [];

      snapshot.forEach(doc => {
        actions.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return actions;
    } catch (error) {
      console.error('獲取管理員操作記錄失敗:', error);
      return [];
    }
  }
}

export default AdminSystem;

