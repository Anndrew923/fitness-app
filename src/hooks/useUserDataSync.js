import { useCallback, useRef } from 'react';
import { auth } from '../firebase';
import { getAgeGroup } from '../utils';
import logger from '../utils/logger';

/**
 * Hook for managing user data synchronization with debouncing
 * Handles setUserData logic with intelligent debouncing and write queue management
 */
export function useUserDataSync(userData, dispatch, addToWriteQueue) {
  // Debounce refs
  const setUserDataDebounceRef = useRef(null);
  const lastWriteTimeRef = useRef(0);
  const writeCountRef = useRef(0);
  const lastWriteCountResetTimeRef = useRef(Date.now());

  /**
   * Update user data with intelligent debouncing
   */
  const setUserData = useCallback(
    update => {
      let newData;

      if (typeof update === 'function') {
        const currentData = userData;
        newData = update(currentData);
      } else {
        newData = { ...userData, ...update };
      }

      // Calculate age group
      if (newData.age) {
        newData.ageGroup = getAgeGroup(newData.age);
      }

      // Skip if no real changes
      try {
        const prevString = JSON.stringify(userData);
        const nextString = JSON.stringify({ ...userData, ...newData });
        if (prevString === nextString) {
          return;
        }
      } catch (error) {
        logger.warn('序列化比較失敗，繼續更新:', error);
      }

      // Immediately update local state
      dispatch({ type: 'UPDATE_USER_DATA', payload: newData });

      // Optimize: Only save to Firebase when important data changes
      if (auth.currentUser) {
        const importantFields = [
          'scores',
          'record_5km',
          'record_arm_girth',
          'height',
          'weight',
          'age',
          'gender',
          'nickname',
          'avatarUrl',
          'ladderRank',
          'history',
          'isAnonymousInLadder',
          'profession',
          'weeklyTrainingHours',
          'trainingYears',
          'testInputs',
          'country',
          'region',
          'city',
          'job_category',
          'gym_name',
          'rpg_class',
        ];

        const hasImportantChanges = importantFields.some(field => {
          try {
            return (
              JSON.stringify(newData[field]) !== JSON.stringify(userData[field])
            );
          } catch (error) {
            logger.warn('比較欄位失敗，視為有變化:', error);
            return true;
          }
        });

        if (hasImportantChanges) {
          const isOnlyNicknameChange =
            JSON.stringify(newData.nickname) !==
              JSON.stringify(userData.nickname) &&
            JSON.stringify({ ...newData, nickname: userData.nickname }) ===
              JSON.stringify({ ...userData, nickname: newData.nickname });

          const now = Date.now();
          const timeSinceLastWrite = now - lastWriteTimeRef.current;
          const timeSinceLastReset = now - lastWriteCountResetTimeRef.current;

          if (timeSinceLastReset > 3600000) {
            writeCountRef.current = 0;
            lastWriteCountResetTimeRef.current = now;
          }

          const testInputsChanged =
            JSON.stringify(newData.testInputs) !==
            JSON.stringify(userData.testInputs);

          const debounceTime = isOnlyNicknameChange
            ? 5000
            : testInputsChanged
            ? 2000
            : 20000;

          if (timeSinceLastWrite < 60000) {
            if (setUserDataDebounceRef.current) {
              clearTimeout(setUserDataDebounceRef.current);
            }

            setUserDataDebounceRef.current = setTimeout(() => {
              logger.debug(`🔄 防抖後保存用戶數據（60秒頻率限制）`);
              lastWriteTimeRef.current = Date.now();
              writeCountRef.current++;
              addToWriteQueue(newData, 'userData');
              setUserDataDebounceRef.current = null;
            }, 60000 - timeSinceLastWrite);
          } else {
            if (setUserDataDebounceRef.current) {
              clearTimeout(setUserDataDebounceRef.current);
            }

            setUserDataDebounceRef.current = setTimeout(() => {
              logger.debug(
                `🔄 防抖後保存用戶數據（${debounceTime / 1000}秒防抖，第${
                  writeCountRef.current + 1
                }次寫入）`
              );
              lastWriteTimeRef.current = Date.now();
              writeCountRef.current++;
              addToWriteQueue(newData, 'userData');
              setUserDataDebounceRef.current = null;
            }, debounceTime);
          }
        }
      }
    },
    [userData, dispatch, addToWriteQueue]
  );

  return {
    setUserData,
  };
}

