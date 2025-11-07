import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from '../firebase';

/**
 * 舉報系統工具
 * 用於處理用戶舉報功能
 */
class ReportSystem {
  // 舉報閾值：達到 5 次舉報自動隱藏
  static REPORT_THRESHOLD = 5;

  /**
   * 舉報用戶的暱稱或頭像
   * @param {string} reportedUserId - 被舉報的用戶 ID
   * @param {string} reportType - 舉報類型：'nickname' | 'avatar' | 'both'
   * @param {string} reason - 舉報原因
   * @param {string} description - 詳細描述（可選）
   * @returns {Promise<Object>} { success: boolean, message: string }
   */
  static async reportUser(reportedUserId, reportType, reason, description = '') {
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        return { success: false, message: '請先登入' };
      }

      if (currentUserId === reportedUserId) {
        return { success: false, message: '無法舉報自己' };
      }

      // 檢查是否已經舉報過
      const existingReport = await this.checkExistingReport(
        currentUserId,
        reportedUserId,
        reportType
      );

      if (existingReport) {
        return {
          success: false,
          message: '您已經舉報過此用戶，請等待審查結果',
        };
      }

      // 創建舉報記錄
      const reportData = {
        reporterId: currentUserId,
        reportedUserId: reportedUserId,
        reportType: reportType,
        reason: reason,
        description: description,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 保存到 Firestore
      const reportRef = await addDoc(collection(db, 'reports'), reportData);

      // 更新被舉報用戶的舉報計數
      const shouldHide = await this.updateReportCount(reportedUserId, reportType);

      console.log('✅ 舉報成功:', reportRef.id);

      return {
        success: true,
        message: shouldHide
          ? '舉報已提交，該用戶的內容已自動隱藏'
          : '舉報已提交，我們會盡快審查',
        reportId: reportRef.id,
        shouldHide: shouldHide,
      };
    } catch (error) {
      console.error('❌ 舉報失敗:', error);
      return {
        success: false,
        message: '舉報失敗，請稍後再試',
      };
    }
  }

  /**
   * 檢查是否已經舉報過
   * @param {string} reporterId - 舉報者 ID
   * @param {string} reportedUserId - 被舉報者 ID
   * @param {string} reportType - 舉報類型
   * @returns {Promise<boolean>} 是否已經舉報過
   */
  static async checkExistingReport(reporterId, reportedUserId, reportType) {
    try {
      const reportsRef = collection(db, 'reports');
      const q = query(
        reportsRef,
        where('reporterId', '==', reporterId),
        where('reportedUserId', '==', reportedUserId),
        where('reportType', '==', reportType),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('檢查舉報記錄失敗:', error);
      return false;
    }
  }

  /**
   * 更新被舉報用戶的舉報計數
   * @param {string} userId - 用戶 ID
   * @param {string} reportType - 舉報類型
   * @returns {Promise<boolean>} 是否應該隱藏內容
   */
  static async updateReportCount(userId, reportType) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn('用戶不存在:', userId);
        return false;
      }

      const userData = userSnap.data();
      const reportCount = userData.reportCount || {
        nickname: 0,
        avatar: 0,
        total: 0,
      };

      // 更新舉報計數
      if (reportType === 'nickname' || reportType === 'both') {
        reportCount.nickname = (reportCount.nickname || 0) + 1;
      }
      if (reportType === 'avatar' || reportType === 'both') {
        reportCount.avatar = (reportCount.avatar || 0) + 1;
      }
      reportCount.total = (reportCount.total || 0) + 1;

      // 達到5次舉報自動隱藏
      let shouldHide = false;
      const updates = {
        reportCount: reportCount,
      };

      if (reportCount.nickname >= this.REPORT_THRESHOLD) {
        // 隱藏暱稱
        updates.nicknameHidden = true;
        updates.moderationStatus = 'needs_review';
        updates.moderationTime = new Date().toISOString();
        shouldHide = true;
        console.log('⚠️ 暱稱達到舉報閾值，自動隱藏');
      }

      if (reportCount.avatar >= this.REPORT_THRESHOLD) {
        // 隱藏頭像
        updates.avatarHidden = true;
        updates.moderationStatus = 'needs_review';
        updates.moderationTime = new Date().toISOString();
        shouldHide = true;
        console.log('⚠️ 頭像達到舉報閾值，自動隱藏');
      }

      // 更新用戶資料
      await updateDoc(userRef, updates);

      return shouldHide;
    } catch (error) {
      console.error('更新舉報計數失敗:', error);
      return false;
    }
  }

  /**
   * 管理員手動刪除內容（最終審議權）
   * @param {string} userId - 用戶 ID
   * @param {string} type - 'nickname' | 'avatar' | 'both'
   * @param {string} reason - 刪除原因
   * @returns {Promise<Object>} { success: boolean, message: string }
   */
  static async adminDeleteContent(userId, type, reason = '') {
    try {
      const userRef = doc(db, 'users', userId);
      const updates = {
        moderationStatus: 'rejected',
        moderationTime: new Date().toISOString(),
        moderationReason: reason,
      };

      if (type === 'nickname' || type === 'both') {
        updates.nickname = '';
        updates.nicknameHidden = true;
      }

      if (type === 'avatar' || type === 'both') {
        updates.avatarUrl = '';
        updates.avatarHidden = true;
      }

      await updateDoc(userRef, updates);

      // 記錄管理員操作（可選）
      try {
        await addDoc(collection(db, 'adminActions'), {
          adminId: auth.currentUser?.uid,
          targetUserId: userId,
          action: 'delete_content',
          type: type,
          reason: reason,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.warn('記錄管理員操作失敗:', error);
        // 不影響主要功能，繼續執行
      }

      return { success: true, message: '內容已刪除' };
    } catch (error) {
      console.error('管理員刪除內容失敗:', error);
      return { success: false, message: '刪除失敗' };
    }
  }
}

export default ReportSystem;
