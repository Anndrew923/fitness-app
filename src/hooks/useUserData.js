import { useCallback, useRef } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { getAgeGroup, validateAndCleanUserData } from '../utils';
import firebaseWriteMonitor from '../utils/firebaseMonitor';
import logger from '../utils/logger';
import { handleDailyLogin } from '../utils/activityTracker';
import { useSubscriptionLogic } from './useSubscriptionLogic';
import { useRPGManager } from './useRPGManager';

/**
 * Hook for managing user data loading, saving, and validation
 * Handles Firebase operations, data validation, and write queue management
 */
export function useUserData(initialState, isMockMode) {
  const subscriptionLogic = useSubscriptionLogic();
  const rpgManager = useRPGManager();

  // Write queue management refs
  const writeQueueRef = useRef([]);
  const isProcessingQueueRef = useRef(false);

  /**
   * Load user data from Firebase
   */
  const loadUserData = useCallback(
    async (currentUser, forceReload = false) => {
      if (!currentUser) {
        return false;
      }

      if (process.env.NODE_ENV === 'development') {
        logger.debug(
          '開始載入用戶資料:',
          currentUser.uid,
          forceReload ? '(強制重新載入)' : ''
        );
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const firebaseData = userSnap.data();
          if (process.env.NODE_ENV === 'development') {
            logger.debug('從 Firebase 載入的資料:', firebaseData);
          }

          // Ensure data structure is complete
          const mergedData = {
            ...initialState,
            ...firebaseData,
            // Read isolated data (with defaults if Firebase has no data)
            record_5km: firebaseData.record_5km || {
              bestTime: 0,
              date: null,
              pace: 0,
              location: '',
            },
            record_arm_girth: firebaseData.record_arm_girth || {
              value: 0,
              date: null,
              photoUrl: '',
            },
            // Read radar chart data
            scores: {
              ...initialState.scores,
              ...(firebaseData.scores || {}),
            },
            // Ensure numeric types are correct
            height: Number(firebaseData.height) || 0,
            weight: Number(firebaseData.weight) || 0,
            age: Number(firebaseData.age) || 0,
            // Ensure age group is calculated correctly
            ageGroup: firebaseData.age
              ? getAgeGroup(Number(firebaseData.age))
              : firebaseData.ageGroup || '',
            // Preserve existing ladder score, don't auto-recalculate
            ladderScore: firebaseData.ladderScore || 0,
            // Ensure ladder rank is read correctly
            ladderRank: Number(firebaseData.ladderRank) || 0,
            // Ensure ladder submission time is read correctly
            lastLadderSubmission: firebaseData.lastLadderSubmission || null,
            // Ensure last active time is read correctly
            lastActive: firebaseData.lastActive || null,
            // Daily Login Tracker: Ensure login stats are read correctly
            lastLoginDate: firebaseData.lastLoginDate || null,
            stats_loginStreak: Number(firebaseData.stats_loginStreak) || 0,
            stats_totalLoginDays:
              Number(firebaseData.stats_totalLoginDays) || 0,
            // Ensure leaderboard info is read correctly
            country: firebaseData.country || '',
            region: firebaseData.region || '',
            // Phase 1: Ensure new fields are read correctly
            city: firebaseData.city || '',
            job_category: firebaseData.job_category || '',
            gym_name: firebaseData.gym_name || '',
            rpg_class: firebaseData.rpg_class || '',
            // Phase 1-5: Ensure subscription field is read correctly
            subscription: subscriptionLogic.migrateSubscription(firebaseData),
            rpgStats: rpgManager.migrateRpgStats(firebaseData),
            // Phase 1-6: Honor Seals Economy Schema
            honorSeals: Number(firebaseData.honorSeals) || 0,
            monthlySeals: Number(firebaseData.monthlySeals) || 0,
            verifications: firebaseData.verifications || {},
            // Phase 1-6: Decoration Interfaces (V3.4)
            equippedFrameId: String(firebaseData.equippedFrameId || ''),
            equippedBannerId: String(firebaseData.equippedBannerId || ''),
            unlockedCosmetics: Array.isArray(firebaseData.unlockedCosmetics) 
              ? firebaseData.unlockedCosmetics 
              : [],
          };

          // Phase 1-5: Check and complete missing fields (old user migration)
          const needsMigration =
            !firebaseData.subscription || !firebaseData.rpgStats;
          if (needsMigration) {
            logger.info('🔄 [Phase 1-5] 檢測到老用戶，開始補全缺失欄位...');
            const migrationData = {};

            if (!firebaseData.subscription) {
              migrationData.subscription =
                subscriptionLogic.migrateSubscription(firebaseData);
            } else if (firebaseData.subscription.isEarlyAdopter === true) {
              // Priority A: Existing Early Adopter - preserve
              logger.info(
                '✅ [Phase 1-5] 檢測到既存 Early Adopter 權限，保持為 true (絕對不覆蓋)'
              );
              mergedData.subscription = {
                status: firebaseData.subscription.status || 'active',
                isEarlyAdopter: true, // Absolute protection
              };
            }

            if (!firebaseData.rpgStats) {
              migrationData.rpgStats = rpgManager.migrateRpgStats(firebaseData);
            }

            // Use merge: true to ensure no overwrite of existing data
            if (Object.keys(migrationData).length > 0) {
              try {
                await updateDoc(userRef, {
                  ...migrationData,
                  updatedAt: new Date().toISOString(),
                });
                logger.info('✅ [Phase 1-5] 老用戶數據遷移完成');

                // Update local mergedData
                Object.assign(mergedData, migrationData);
              } catch (error) {
                logger.error('❌ [Phase 1-5] 數據遷移失敗:', error);
                // Don't affect main flow, continue execution
              }
            }
          } else if (firebaseData.subscription?.isEarlyAdopter === true) {
            // Priority A: Existing Early Adopter - ensure structure is correct and preserve
            logger.info(
              '✅ [Phase 1-5] 檢測到既存 Early Adopter 權限，保持為 true (絕對不覆蓋)'
            );
            mergedData.subscription = {
              status: firebaseData.subscription.status || 'active',
              isEarlyAdopter: true, // Absolute protection
            };
          }

          return {
            success: true,
            data: mergedData,
            userRef,
          };
        } else {
          logger.debug('用戶文檔不存在，創建新的');
          // If user document doesn't exist, create a new one
          const newUserData = {
            ...initialState,
            userId: currentUser.uid,
            subscription: subscriptionLogic.initializeSubscription(),
            rpgStats: rpgManager.initializeRpgStats(),
            // Phase 1-6: Honor Seals Economy Schema
            honorSeals: 0,
            monthlySeals: 0,
            verifications: {},
            // Phase 1-6: Decoration Interfaces (V3.4)
            equippedFrameId: '',
            equippedBannerId: '',
            unlockedCosmetics: [],
          };

          // Daily Login Tracker: Initialize login stats for new user
          const loginUpdates = handleDailyLogin(newUserData);
          if (loginUpdates) {
            Object.assign(newUserData, loginUpdates);
            logger.debug(
              '📅 [ActivityTracker] Initializing login stats for new user:',
              loginUpdates
            );
          }

          const newUserRef = doc(db, 'users', currentUser.uid);
          await setDoc(newUserRef, newUserData);

          return {
            success: true,
            data: newUserData,
            userRef: newUserRef,
          };
        }
      } catch (error) {
        logger.error('載入用戶數據失敗:', error);

        // Try to load from localStorage
        try {
          const localData = localStorage.getItem('userData');
          if (localData) {
            const parsedData = JSON.parse(localData);
            if (process.env.NODE_ENV === 'development') {
              logger.debug('從本地載入用戶資料:', parsedData);
            }
            return {
              success: true,
              data: parsedData,
              userRef: null,
            };
          }
        } catch (e) {
          logger.error('解析本地數據失敗:', e);
        }

        return {
          success: false,
          data: null,
          userRef: null,
        };
      }
    },
    [initialState, subscriptionLogic, rpgManager]
  );

  /**
   * Save user data to Firebase
   */
  const saveUserData = useCallback(
    async data => {
      if (!auth.currentUser || !data) {
        logger.warn('無法保存數據：用戶未登入或數據無效');
        return false;
      }

      // Check if in mock mode
      if (isMockMode) {
        logger.debug('⏭️ 模擬模式：跳過 Firebase 寫入，僅保存到本地');
        localStorage.setItem('userData', JSON.stringify(data));
        return true;
      }

      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);

        // Emergency fix: Read existing data before write to protect isEarlyAdopter and isVerified
        let existingSubscription = null;
        let existingIsVerified = null;
        let existingVerificationFields = null;
        try {
          const existingDoc = await getDoc(userRef);
          if (existingDoc.exists()) {
            const existingData = existingDoc.data();
            existingSubscription = existingData.subscription;
            existingIsVerified = existingData.isVerified;
            // Protect all verification-related fields
            existingVerificationFields = {
              isVerified: existingData.isVerified,
              verifiedLadderScore: existingData.verifiedLadderScore,
              verificationStatus: existingData.verificationStatus,
              verifiedAt: existingData.verifiedAt,
              verificationExpiredAt: existingData.verificationExpiredAt,
              verificationRequestId: existingData.verificationRequestId,
            };

            // Safety check 1: Validate Early Adopter protection
            subscriptionLogic.validateEarlyAdopterProtection(
              existingSubscription,
              data
            );

            // Safety check 2: Validate verification protection
            subscriptionLogic.validateVerificationProtection(
              existingIsVerified,
              data.isVerified
            );
          }
        } catch (readError) {
          logger.warn(
            '⚠️ [Phase 1-5] 讀取現有數據失敗，繼續執行（可能是新用戶）:',
            readError
          );
        }

        const dataToSave = {
          ...data,
          userId: auth.currentUser.uid,
          updatedAt: new Date().toISOString(),
          // Save isolated data
          record_5km: data.record_5km || {
            bestTime: 0,
            date: null,
            pace: 0,
            location: '',
          },
          record_arm_girth: data.record_arm_girth || {
            value: 0,
            date: null,
            photoUrl: '',
          },
          // Ensure numeric types are correct
          height: Number(data.height) || 0,
          weight: Number(data.weight) || 0,
          age: Number(data.age) || 0,
          // Ensure age group is calculated and saved
          ageGroup: data.age
            ? getAgeGroup(Number(data.age))
            : data.ageGroup || '',
          // Preserve existing ladder score, don't auto-recalculate
          ladderScore: data.ladderScore || 0,
          // Ensure ladder rank is saved
          ladderRank: Number(data.ladderRank) || 0,
          // Ensure ladder submission time is saved
          lastLadderSubmission: data.lastLadderSubmission || null,
          // Ensure last active time is saved
          lastActive: data.lastActive || null,
          // Ensure leaderboard info is saved
          country: data.country || '',
          region: data.region || '',
          // Phase 1: Ensure new fields are saved
          city: data.city || '',
          district: data.district || '',
          job_category: data.job_category || '',
          gym_name: data.gym_name || '',
          rpg_class: data.rpg_class || '',
          // Phase 1-5: Ensure subscription field is saved with protection
          subscription: subscriptionLogic.protectEarlyAdopterStatus(
            existingSubscription,
            data.subscription
          ),
          rpgStats: data.rpgStats || rpgManager.initializeRpgStats(),
          // Phase 1-6: Honor Seals Economy Schema
          honorSeals: Number(data.honorSeals) || 0,
          monthlySeals: Number(data.monthlySeals) || 0,
          verifications: data.verifications || {},
          // Phase 1-6: Decoration Interfaces (V3.4)
          equippedFrameId: String(data.equippedFrameId || ''),
          equippedBannerId: String(data.equippedBannerId || ''),
          unlockedCosmetics: Array.isArray(data.unlockedCosmetics) 
            ? data.unlockedCosmetics 
            : [],
          // Emergency fix: Protect verification fields
          ...subscriptionLogic.protectVerificationFields(
            existingVerificationFields,
            data
          ),
        };

        // Phase 1-5: Use merge: true to ensure no overwrite of existing data
        await setDoc(userRef, dataToSave, { merge: true });
        localStorage.setItem('userData', JSON.stringify(dataToSave));

        // Log write operation
        firebaseWriteMonitor.logWrite(
          'setDoc',
          'users',
          auth.currentUser.uid,
          dataToSave
        );

        return true;
      } catch (error) {
        logger.error('保存用戶數據失敗:', error);
        // At least save to local
        localStorage.setItem('userData', JSON.stringify(data));
        return false;
      }
    },
    [isMockMode, subscriptionLogic, rpgManager]
  );

  /**
   * Validate user data
   */
  const validateUserData = useCallback(data => {
    const { cleaned, errors, isValid } = validateAndCleanUserData(data);

    if (!isValid) {
      logger.warn('數據驗證失敗:', errors);
    }

    return {
      isValid,
      errors,
      cleaned,
    };
  }, []);

  /**
   * Process write queue intelligently
   */
  const processWriteQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || writeQueueRef.current.length === 0) {
      return;
    }

    // Check if in mock mode
    if (isMockMode) {
      logger.debug('⏭️ 模擬模式：跳過 Firebase 寫入處理');
      writeQueueRef.current.length = 0;
      return;
    }

    // Check authentication status
    if (!auth.currentUser) {
      logger.debug('⏭️ 跳過寫入：用戶未認證');
      writeQueueRef.current.length = 0;
      return;
    }

    isProcessingQueueRef.current = true;

    try {
      const batch = [];
      const processedIds = [];

      // Process write operations in queue
      while (writeQueueRef.current.length > 0) {
        const writeOp = writeQueueRef.current.shift();

        // Validate and clean data
        const validation = validateUserData(writeOp.data);
        if (!validation.isValid) {
          logger.warn('數據驗證失敗，跳過寫入:', validation.errors);
          continue;
        }

        // Use cleaned data
        const cleanedData = validation.cleaned;
        batch.push({
          ...writeOp,
          data: cleanedData,
        });
        processedIds.push(writeOp.id);
      }

      if (batch.length > 0) {
        logger.debug(`🔄 批量處理 ${batch.length} 個寫入操作`);

        // Execute batch writes
        for (const writeOp of batch) {
          try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userRef, writeOp.data, { merge: true });

            // Log write operation
            firebaseWriteMonitor.logWrite(
              'setDoc',
              'users',
              auth.currentUser.uid,
              writeOp.data
            );

            logger.debug(`✅ 寫入成功: ${writeOp.type}`);
          } catch (error) {
            logger.error(`❌ 寫入失敗: ${writeOp.type}`, error);
            // Re-add failed operation to queue
            writeQueueRef.current.unshift(writeOp);
          }
        }

        // Update local storage
        const latestData = batch[batch.length - 1].data;
        localStorage.setItem('userData', JSON.stringify(latestData));
        localStorage.setItem('lastSavedUserData', JSON.stringify(latestData));
      }
    } catch (error) {
      logger.error('批量寫入處理失敗:', error);
    } finally {
      isProcessingQueueRef.current = false;

      // If there are still pending operations, continue processing
      if (writeQueueRef.current.length > 0) {
        setTimeout(() => processWriteQueue(), 1000);
      }
    }
  }, [validateUserData, isMockMode]);

  /**
   * Add to write queue
   */
  const addToWriteQueue = useCallback(
    (data, type = 'update') => {
      // Check if in mock mode
      if (isMockMode) {
        logger.debug('⏭️ 模擬模式：跳過 Firebase 寫入操作');
        return;
      }

      // Check authentication status
      if (!auth.currentUser) {
        logger.debug('⏭️ 跳過添加到寫入隊列：用戶未認證');
        return;
      }

      const writeOp = {
        id: Date.now().toString(),
        type,
        data,
        timestamp: Date.now(),
      };

      writeQueueRef.current.push(writeOp);

      // Limit queue length to avoid memory leaks
      if (writeQueueRef.current.length > 20) {
        writeQueueRef.current.shift();
      }

      // Trigger queue processing
      if (!isProcessingQueueRef.current) {
        setTimeout(() => processWriteQueue(), 1000);
      }
    },
    [processWriteQueue, isMockMode]
  );

  return {
    loadUserData,
    saveUserData,
    validateUserData,
    processWriteQueue,
    addToWriteQueue,
  };
}
