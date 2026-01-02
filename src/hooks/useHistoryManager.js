import { useCallback } from 'react';
import { auth } from '../firebase';
import logger from '../utils/logger';

/**
 * Hook for managing user history records
 * Handles history saving, cleanup, and Firebase sync
 */
export function useHistoryManager(userData, dispatch, isMockMode) {
  /**
   * Save history record
   */
  const saveHistory = useCallback(
    async record => {
      if (!auth.currentUser) {
        logger.warn('無法保存歷史記錄：用戶未登入');
        return;
      }

      const recordWithMetadata = {
        ...record,
        userId: auth.currentUser.uid,
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
      };

      const currentHistory = userData.history || [];
      const maxRecords = 50;

      if (currentHistory.length >= maxRecords) {
        logger.warn(`歷史記錄已達上限 (${maxRecords})，執行自動清理`);

        const sortedHistory = [...currentHistory].sort((a, b) => {
          const dateA = a.timestamp ? new Date(a.timestamp) : new Date(a.date);
          const dateB = b.timestamp ? new Date(b.timestamp) : new Date(b.date);
          return dateB - dateA;
        });

        const cleanedHistory = sortedHistory.slice(0, maxRecords - 10);
        logger.debug(
          `自動清理完成：刪除 ${
            currentHistory.length - cleanedHistory.length
          } 條舊記錄`
        );

        dispatch({
          type: 'UPDATE_USER_DATA',
          payload: { history: cleanedHistory },
        });

        if (typeof window !== 'undefined' && window.alert) {
          alert(`歷史記錄已達上限，已自動清理最舊的記錄以騰出空間。`);
        }
      }

      const newHistory = [...(userData.history || []), recordWithMetadata];
      dispatch({
        type: 'UPDATE_USER_DATA',
        payload: { history: newHistory },
      });

      if (isMockMode) {
        logger.debug('⏭️ 模擬模式：歷史記錄僅保存到本地');
        return;
      }

      try {
        const updatedData = {
          ...userData,
          history: newHistory,
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem('userData', JSON.stringify(updatedData));
        localStorage.setItem('lastSavedUserData', JSON.stringify(updatedData));
        logger.debug(
          `歷史記錄已保存到本地存儲 (${newHistory.length}/${maxRecords})`
        );

        if (auth.currentUser) {
          setTimeout(async () => {
            try {
              const { doc, setDoc } = await import('firebase/firestore');
              const { db } = await import('../firebase');
              const userRef = doc(db, 'users', auth.currentUser.uid);
              await setDoc(
                userRef,
                {
                  history: newHistory,
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              );
              logger.debug(
                `歷史記錄已保存到 Firebase (${newHistory.length}/${maxRecords})`
              );
            } catch (firebaseError) {
              logger.error('Firebase 保存失敗，但本地已備份:', firebaseError);
            }
          }, 2000);
        }
      } catch (error) {
        logger.error('保存歷史記錄失敗:', error);
        try {
          localStorage.setItem(
            'userData',
            JSON.stringify({
              ...userData,
              history: newHistory,
              updatedAt: new Date().toISOString(),
            })
          );
        } catch (localError) {
          logger.error('本地存儲也失敗:', localError);
        }
      }
    },
    [userData, dispatch, isMockMode]
  );

  return {
    saveHistory,
  };
}

