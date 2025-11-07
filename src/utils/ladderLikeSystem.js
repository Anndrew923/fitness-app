import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db, auth } from '../firebase';

/**
 * 天梯用戶點讚系統
 * 功能：點讚/取消點讚天梯用戶，顯示累積點讚數
 */
class LadderLikeSystem {
  /**
   * 點讚用戶
   * @param {string} userId - 被點讚用戶 ID
   * @returns {Promise<Object>} { success: boolean, message: string, likeCount: number }
   */
  static async likeUser(userId) {
    try {
      if (!auth.currentUser) {
        return { success: false, message: '請先登入', likeCount: 0 };
      }

      const currentUserId = auth.currentUser.uid;

      // ✅ 修改：允許點讚自己（移除限制）

      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, message: '用戶不存在', likeCount: 0 };
      }

      const userData = userSnap.data();
      const ladderLikes = userData.ladderLikes || [];

      // 檢查是否已點讚
      if (ladderLikes.includes(currentUserId)) {
        return { success: false, message: '已經點讚過了', likeCount: ladderLikes.length };
      }

      // 添加點讚
      await updateDoc(userRef, {
        ladderLikes: arrayUnion(currentUserId),
        ladderLikeCount: increment(1),
      });

      const newLikeCount = (userData.ladderLikeCount || 0) + 1;

      return {
        success: true,
        message: '點讚成功',
        likeCount: newLikeCount
      };
    } catch (error) {
      console.error('點讚失敗:', error);
      return { success: false, message: '點讚失敗', likeCount: 0 };
    }
  }

  /**
   * 取消點讚
   * @param {string} userId - 被點讚用戶 ID
   * @returns {Promise<Object>} { success: boolean, message: string, likeCount: number }
   */
  static async unlikeUser(userId) {
    try {
      if (!auth.currentUser) {
        return { success: false, message: '請先登入', likeCount: 0 };
      }

      const currentUserId = auth.currentUser.uid;
      // ✅ 修改：允許取消點讚自己（移除限制）
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, message: '用戶不存在', likeCount: 0 };
      }

      const userData = userSnap.data();
      const ladderLikes = userData.ladderLikes || [];

      // 檢查是否已點讚
      if (!ladderLikes.includes(currentUserId)) {
        return { success: false, message: '尚未點讚', likeCount: ladderLikes.length };
      }

      // 移除點讚
      await updateDoc(userRef, {
        ladderLikes: arrayRemove(currentUserId),
        ladderLikeCount: increment(-1),
      });

      const newLikeCount = Math.max((userData.ladderLikeCount || 0) - 1, 0);

      return {
        success: true,
        message: '取消點讚成功',
        likeCount: newLikeCount
      };
    } catch (error) {
      console.error('取消點讚失敗:', error);
      return { success: false, message: '取消點讚失敗', likeCount: 0 };
    }
  }

  /**
   * 檢查是否已點讚
   * @param {string} userId - 被點讚用戶 ID
   * @returns {Promise<boolean>}
   */
  static async checkIfLiked(userId) {
    try {
      if (!auth.currentUser) {
        return false;
      }

      const currentUserId = auth.currentUser.uid;
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return false;
      }

      const userData = userSnap.data();
      const ladderLikes = userData.ladderLikes || [];

      return ladderLikes.includes(currentUserId);
    } catch (error) {
      console.error('檢查點讚狀態失敗:', error);
      return false;
    }
  }

  /**
   * 獲取點讚數量
   * @param {string} userId - 用戶 ID
   * @returns {Promise<number>}
   */
  static async getLikeCount(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return 0;
      }

      const userData = userSnap.data();
      return userData.ladderLikeCount || 0;
    } catch (error) {
      console.error('獲取點讚數量失敗:', error);
      return 0;
    }
  }
}

export default LadderLikeSystem;
