import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  runTransaction,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from '../firebase';

/**
 * 榮譽認證系統工具
 * 用於處理用戶榮譽認證申請功能
 */
class VerificationSystem {
  /**
   * 生成唯一的申請編號
   * 格式：VER-YYYYMMDD-XXXX（例如：VER-20240101-0001）
   * @returns {Promise<string>} 申請編號
   */
  static async generateApplicationNumber() {
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
      const sequenceRef = doc(db, 'verificationSequences', dateStr);

      // 使用 transaction 確保唯一性
      const applicationNumber = await runTransaction(db, async transaction => {
        const sequenceSnap = await transaction.get(sequenceRef);

        let lastSequence = 0;
        if (sequenceSnap.exists()) {
          lastSequence = sequenceSnap.data().lastSequence || 0;
        }

        // 遞增序號
        const newSequence = lastSequence + 1;

        // 更新序號
        transaction.set(
          sequenceRef,
          {
            lastSequence: newSequence,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        // 生成申請編號
        const sequenceStr = String(newSequence).padStart(4, '0');
        return `VER-${dateStr}-${sequenceStr}`;
      });

      return applicationNumber;
    } catch (error) {
      console.error('生成申請編號失敗:', error);
      // 如果失敗，使用時間戳作為備用方案
      const timestamp = Date.now();
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      return `VER-${dateStr}-${timestamp.toString().slice(-4)}`;
    }
  }

  /**
   * 建立認證申請
   * @param {Object} applicationData - 申請資料
   * @param {string} applicationData.socialAccount - 社群帳號（FB/IG）
   * @param {string} applicationData.socialAccountType - 社群類型：'facebook' | 'instagram'
   * @param {string} applicationData.videoLink - 訓練影片連結
   * @param {string} applicationData.description - 申請說明（可選）
   * @returns {Promise<Object>} { success: boolean, message: string, requestId: string, applicationNumber: string }
   */
  static async createVerificationRequest(applicationData) {
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        return { success: false, message: '請先登入' };
      }

      // 檢查是否已有待審核的申請
      const existingRequest = await this.getPendingRequest(currentUserId);
      if (existingRequest) {
        return {
          success: false,
          message: '您已有待審核的申請，請等待審核結果',
          requestId: existingRequest.id,
        };
      }

      // 檢查用戶是否已經通過認證
      const userRef = doc(db, 'users', currentUserId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.isVerified === true) {
          return {
            success: false,
            message: '您已經通過榮譽認證',
          };
        }
      }

      // 生成申請編號
      const applicationNumber = await this.generateApplicationNumber();

      // 建立申請資料
      const requestData = {
        userId: currentUserId,
        applicationNumber: applicationNumber,
        status: 'pending',
        socialAccount: {
          type: applicationData.socialAccountType || 'facebook',
          account: applicationData.socialAccount || '',
        },
        videoLink: applicationData.videoLink || '',
        description: applicationData.description || '',
        requestedItems: ['ladderScore'], // 申請認證的項目
        targetData: applicationData.targetData || null, // 解鎖申請的目標數據
        paymentStatus: applicationData.paymentStatus || 'pending', // 付款狀態：'waived_beta' | 'pending' | 'paid'
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 保存到 Firestore
      const requestRef = await addDoc(
        collection(db, 'verificationRequests'),
        requestData
      );

      // 更新用戶資料中的申請 ID
      await updateDoc(userRef, {
        verificationRequestId: requestRef.id,
        updatedAt: new Date().toISOString(),
      });

      console.log('✅ 認證申請已建立:', requestRef.id);

      return {
        success: true,
        message: '認證申請已提交，我們會盡快審核',
        requestId: requestRef.id,
        applicationNumber: applicationNumber,
      };
    } catch (error) {
      console.error('❌ 建立認證申請失敗:', error);
      return {
        success: false,
        message: '申請失敗，請稍後再試',
      };
    }
  }

  /**
   * 獲取用戶的待審核申請
   * @param {string} userId - 用戶 ID
   * @returns {Promise<Object|null>} 申請資料或 null
   */
  static async getPendingRequest(userId) {
    try {
      const requestsRef = collection(db, 'verificationRequests');
      const q = query(
        requestsRef,
        where('userId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error('獲取待審核申請失敗:', error);
      return null;
    }
  }

  /**
   * 獲取用戶的認證申請狀態
   * @param {string} userId - 用戶 ID（可選，預設為當前用戶）
   * @returns {Promise<Object>} { status: string, request: Object|null, userData: Object|null }
   */
  static async getVerificationStatus(userId = null) {
    try {
      const currentUserId = userId || auth.currentUser?.uid;
      if (!currentUserId) {
        return {
          status: 'not_logged_in',
          request: null,
          userData: null,
        };
      }

      // 獲取用戶資料
      const userRef = doc(db, 'users', currentUserId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return {
          status: 'not_found',
          request: null,
          userData: null,
        };
      }

      const userData = userSnap.data();

      // 如果已經通過認證
      if (userData.isVerified === true) {
        return {
          status: 'verified',
          request: null,
          userData: {
            isVerified: true,
            verifiedLadderScore: userData.verifiedLadderScore || 0,
            verifiedAt: userData.verifiedAt || null,
            verificationExpiredAt: userData.verificationExpiredAt || null,
          },
        };
      }

      // 獲取最新的申請
      const requestsRef = collection(db, 'verificationRequests');
      const q = query(
        requestsRef,
        where('userId', '==', currentUserId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return {
          status: 'not_applied',
          request: null,
          userData: {
            isVerified: false,
          },
        };
      }

      const requestDoc = snapshot.docs[0];
      const requestData = {
        id: requestDoc.id,
        ...requestDoc.data(),
      };

      return {
        status: requestData.status, // 'pending' | 'approved' | 'rejected'
        request: requestData,
        userData: {
          isVerified: false,
        },
      };
    } catch (error) {
      console.error('獲取認證狀態失敗:', error);
      return {
        status: 'error',
        request: null,
        userData: null,
      };
    }
  }

  /**
   * 獲取用戶的所有認證申請歷史
   * @param {string} userId - 用戶 ID（可選，預設為當前用戶）
   * @returns {Promise<Array>} 申請列表
   */
  static async getVerificationHistory(userId = null) {
    try {
      const currentUserId = userId || auth.currentUser?.uid;
      if (!currentUserId) {
        return [];
      }

      const requestsRef = collection(db, 'verificationRequests');
      const q = query(
        requestsRef,
        where('userId', '==', currentUserId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const requests = [];

      snapshot.forEach(doc => {
        requests.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return requests;
    } catch (error) {
      console.error('獲取認證歷史失敗:', error);
      return [];
    }
  }

  /**
   * 檢查用戶是否可以申請認證
   * @param {string} userId - 用戶 ID（可選，預設為當前用戶）
   * @returns {Promise<Object>} { canApply: boolean, reason: string }
   */
  static async canApplyForVerification(userId = null) {
    try {
      const currentUserId = userId || auth.currentUser?.uid;
      if (!currentUserId) {
        return {
          canApply: false,
          reasonCode: 'NEED_LOGIN',
          reason: '', // 將由組件根據 reasonCode 翻譯
        };
      }

      // 檢查用戶資料
      const userRef = doc(db, 'users', currentUserId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return {
          canApply: false,
          reasonCode: 'USER_NOT_FOUND',
          reason: '', // 將由組件根據 reasonCode 翻譯
        };
      }

      const userData = userSnap.data();

      // 檢查是否已經通過認證
      if (userData.isVerified === true) {
        return {
          canApply: false,
          reasonCode: 'ALREADY_VERIFIED',
          reason: '', // 將由組件根據 reasonCode 翻譯
        };
      }

      // 檢查是否有天梯分數
      if (!userData.ladderScore || userData.ladderScore <= 0) {
        return {
          canApply: false,
          reasonCode: 'NO_LADDER_SCORE',
          reason: '', // 將由組件根據 reasonCode 翻譯
        };
      }

      // 檢查是否有待審核的申請
      const pendingRequest = await this.getPendingRequest(currentUserId);
      if (pendingRequest) {
        return {
          canApply: false,
          reasonCode: 'ALREADY_APPLIED',
          reason: '', // 將由組件根據 reasonCode 翻譯
        };
      }

      // 檢查是否在冷卻期（如果上次被拒絕，需要等待一段時間）
      if (userData.lastVerificationRejectionAt) {
        const rejectionTime = new Date(userData.lastVerificationRejectionAt);
        const now = new Date();
        const daysSinceRejection = Math.floor(
          (now - rejectionTime) / (1000 * 60 * 60 * 24)
        );

        // 如果被拒絕後未滿 7 天，不能再次申請
        if (daysSinceRejection < 7) {
          const remainingDays = 7 - daysSinceRejection;
          return {
            canApply: false,
            reasonCode: 'COOLDOWN',
            reasonData: { days: remainingDays }, // 傳遞剩餘天數
            reason: '', // 將由組件根據 reasonCode 翻譯
          };
        }
      }

      return {
        canApply: true,
        reasonCode: '',
        reason: '',
      };
    } catch (error) {
      console.error('檢查申請資格失敗:', error);
      return {
        canApply: false,
        reasonCode: 'CHECK_FAILED',
        reason: '', // 將由組件根據 reasonCode 翻譯
      };
    }
  }
}

/**
 * Phase 1-6: Compatibility layer for verification status check
 * Prioritizes new verifications Map structure, falls back to legacy isVerified boolean
 * 
 * @param {Object} userData - User data object
 * @param {string} tier - Verification tier: 'limit_break' | 'rank_exam' (optional)
 * @returns {boolean} True if user is verified (either via new Map or legacy boolean)
 */
export function isUserVerified(userData, tier = null) {
  if (!userData) {
    return false;
  }

  // Priority 1: Check new verifications Map structure
  if (userData.verifications && typeof userData.verifications === 'object') {
    // If tier specified, check specific tier
    if (tier) {
      const tierVerification = userData.verifications[tier];
      return tierVerification?.status === 'verified';
    }

    // If no tier specified, check if any tier is verified
    const tiers = Object.keys(userData.verifications);
    for (const t of tiers) {
      if (userData.verifications[t]?.status === 'verified') {
        return true;
      }
    }
  }

  // Priority 2: Fallback to legacy isVerified boolean
  return userData.isVerified === true;
}

export default VerificationSystem;
