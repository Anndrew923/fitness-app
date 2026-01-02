import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useState,
  useMemo,
} from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import PropTypes from 'prop-types';
import { getAgeGroup, validateAndCleanUserData } from './utils';
import firebaseWriteMonitor from './utils/firebaseMonitor';
import logger from './utils/logger';
import { handleDailyLogin } from './utils/activityTracker';

const UserContext = createContext();

// ✅ Phase 1 新增：職業分類選項
export const JOB_CATEGORIES = {
  engineering: {
    id: 'engineering',
    name: '工程師',
    nameEn: 'Software/Hardware Engineer',
  },
  medical: { id: 'medical', name: '醫療人員', nameEn: 'Doctor/Nurse' },
  coach: { id: 'coach', name: '健身教練', nameEn: 'Personal Trainer' },
  student: { id: 'student', name: '學生', nameEn: 'Student' },
  police_military: {
    id: 'police_military',
    name: '軍警消',
    nameEn: 'Military/Police',
  },
  business: { id: 'business', name: '商業/金融', nameEn: 'Business/Finance' },
  freelance: {
    id: 'freelance',
    name: '自由業/設計',
    nameEn: 'Freelancer/Design',
  },
  other: { id: 'other', name: '其他', nameEn: 'Other' },
};

// ✅ Phase 1 新增：城市選項（台灣主要城市）
export const CITY_OPTIONS = [
  { id: 'taipei', name: '台北' },
  { id: 'newtaipei', name: '新北' },
  { id: 'taoyuan', name: '桃園' },
  { id: 'taichung', name: '台中' },
  { id: 'tainan', name: '台南' },
  { id: 'kaohsiung', name: '高雄' },
  { id: 'other', name: '其他' },
];

const initialState = {
  gender: '',
  height: 0,
  weight: 0,
  age: 0,
  // 新增欄位
  nickname: '',
  avatarUrl: '',
  ageGroup: '', // 年齡段分類
  friends: [], // 好友列表
  friendRequests: [], // 好友邀請
  blockedUsers: [], // 封鎖用戶
  ladderScore: 0, // 天梯總分
  ladderRank: 0, // 天梯排名
  ladderHistory: [], // 天梯歷史
  isGuest: false, // 訪客模式標記
  // 天梯隱私設置
  isAnonymousInLadder: false, // 是否匿名參與天梯（預設不匿名）
  lastActive: new Date().toISOString(),
  // ✅ Daily Login Tracker fields
  lastLoginDate: null, // Last login date (YYYY-MM-DD)
  stats_loginStreak: 0, // Current consecutive login streak
  stats_totalLoginDays: 0, // Total cumulative login days (for Discipline Rank)
  // 排行榜資訊（選填）
  country: '', // 國家（選填）
  region: '', // 行政區/大區（選填）
  // ✅ Phase 1 新增欄位
  city: '', // 城市（下拉選單）
  job_category: '', // 職業分類（下拉選單 ID）
  gym_name: '', // 健身房名稱（選填）
  rpg_class: '', // 系統計算的職業（BERSERKER, ASSASSIN, RANGER, PALADIN, FIGHTER, MAGE, AWAKENED）
  // ✅ Phase 1-5 新增：商業系統預埋
  subscription: {
    status: 'active', // 'active' | 'inactive' | 'expired'
    isEarlyAdopter: false, // 新用戶預設為 false，老用戶在遷移時會設為 true
  },
  // ✅ Phase 1-5 新增：RPG 統計數據
  rpgStats: {
    lastGachaDate: null, // 最後一次抽獎日期 (YYYY-MM-DD)
    totalExp: 0, // 累積經驗值
    level: 1, // 當前等級
  },
  // 🔥【絕對隔離區】這兩個欄位完全獨立，不參與 scores 計算，不影響天梯總排名
  record_5km: {
    bestTime: 0, // 秒數
    date: null,
    pace: 0,
    location: '',
  },
  record_arm_girth: {
    value: 0, // cm
    date: null,
    photoUrl: '',
  },
  // ⚠️【天梯核心區】只有這裡的數據變動，才允許更新雷達圖和總排名
  scores: {
    strength: 0,
    explosivePower: 0,
    cardio: 0, // 嚴格保留給 Cooper Test (12分鐘跑)
    muscleMass: 0, // 嚴格保留給 InBody/FFMI
    bodyFat: 0,
  },
  history: [],
  testInputs: {},
};

export function UserProvider({ children }) {
  const isMountedRef = useRef(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 檢測是否為模擬模式
  const isMockMode = useMemo(() => {
    return auth.app?.options?.apiKey === 'demo-api-key' || !auth.app;
  }, []);

  const userReducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_USER_DATA':
        return { ...state, ...action.payload };
      case 'SET_USER_DATA':
        return action.payload;
      case 'RESET_USER_DATA':
        return initialState;
      default:
        return state;
    }
  };

  const [userData, dispatch] = useReducer(userReducer, initialState);

  // 從 Firebase 載入用戶數據
  const loadUserData = useCallback(async (currentUser, forceReload = false) => {
    if (!currentUser || !isMountedRef.current) {
      setIsLoading(false);
      return false;
    }

    if (process.env.NODE_ENV === 'development') {
      logger.debug(
        '開始載入用戶資料:',
        currentUser.uid,
        forceReload ? '(強制重新載入)' : ''
      );
    }
    setIsLoading(true);

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const firebaseData = userSnap.data();
        if (process.env.NODE_ENV === 'development') {
          logger.debug('從 Firebase 載入的資料:', firebaseData);
        }

        // 確保數據結構完整
        const mergedData = {
          ...initialState,
          ...firebaseData,
          // ✅ 讀取獨立數據 (若 Firebase 沒資料給預設值)
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
          // ✅ 讀取雷達圖數據
          scores: {
            ...initialState.scores,
            ...(firebaseData.scores || {}),
          },
          // 確保數值類型正確
          height: Number(firebaseData.height) || 0,
          weight: Number(firebaseData.weight) || 0,
          age: Number(firebaseData.age) || 0,
          // 確保年齡段被正確計算
          ageGroup: firebaseData.age
            ? getAgeGroup(Number(firebaseData.age))
            : firebaseData.ageGroup || '',
          // 保持原有的天梯分數，不自動重新計算
          ladderScore: firebaseData.ladderScore || 0,
          // 確保天梯排名被正確讀取
          ladderRank: Number(firebaseData.ladderRank) || 0,
          // 確保天梯提交時間被正確讀取
          lastLadderSubmission: firebaseData.lastLadderSubmission || null,
          // 確保最後活動時間被正確讀取
          lastActive: firebaseData.lastActive || null,
          // ✅ Daily Login Tracker: Ensure login stats are read correctly
          lastLoginDate: firebaseData.lastLoginDate || null,
          stats_loginStreak: Number(firebaseData.stats_loginStreak) || 0,
          stats_totalLoginDays: Number(firebaseData.stats_totalLoginDays) || 0,
          // 確保排行榜資訊被正確讀取
          country: firebaseData.country || '',
          region: firebaseData.region || '',
          // ✅ Phase 1 新增：確保新欄位被正確讀取
          city: firebaseData.city || '',
          job_category: firebaseData.job_category || '',
          gym_name: firebaseData.gym_name || '',
          rpg_class: firebaseData.rpg_class || '',
          // ✅ Phase 1-5 新增：確保商業系統欄位被正確讀取
          subscription: firebaseData.subscription || {
            status: 'active',
            isEarlyAdopter: true, // 老用戶自動標記為 Early Adopter
          },
          rpgStats: firebaseData.rpgStats || {
            lastGachaDate: null,
            totalExp: 0,
            level: 1,
          },
        };

        // ✅ Phase 1-5 新增：檢查並補全缺失的欄位（老用戶遷移）
        const needsMigration = !firebaseData.subscription || !firebaseData.rpgStats;
        if (needsMigration) {
          logger.debug('🔄 [Phase 1-5] 檢測到老用戶，開始補全缺失欄位...');
          const migrationData = {};
          
          if (!firebaseData.subscription) {
            migrationData.subscription = {
              status: 'active',
              isEarlyAdopter: true, // 老用戶永久保留 Pro 權限
            };
            logger.debug('✅ [Phase 1-5] 補全 subscription 欄位');
          }
          
          if (!firebaseData.rpgStats) {
            migrationData.rpgStats = {
              lastGachaDate: null,
              totalExp: 0,
              level: 1,
            };
            logger.debug('✅ [Phase 1-5] 補全 rpgStats 欄位');
          }

          // 使用 merge: true 確保不覆蓋現有數據
          try {
            await updateDoc(userRef, {
              ...migrationData,
              updatedAt: new Date().toISOString(),
            });
            logger.debug('✅ [Phase 1-5] 老用戶數據遷移完成');
            
            // 更新本地 mergedData
            Object.assign(mergedData, migrationData);
          } catch (error) {
            logger.error('❌ [Phase 1-5] 數據遷移失敗:', error);
            // 不影響主流程，繼續執行
          }
        }

        if (isMountedRef.current) {
          dispatch({ type: 'SET_USER_DATA', payload: mergedData });
          localStorage.setItem('userData', JSON.stringify(mergedData));
          if (process.env.NODE_ENV === 'development') {
            logger.debug('用戶資料載入成功');
          }

          // ✅ Daily Login Tracker: Check and update login stats
          try {
            const loginUpdates = handleDailyLogin(mergedData);
            if (loginUpdates) {
              logger.debug(
                '📅 [ActivityTracker] Login stats updated:',
                loginUpdates
              );

              // Update Firestore immediately
              const updateData = {
                lastLoginDate: loginUpdates.lastLoginDate,
                stats_loginStreak: loginUpdates.stats_loginStreak,
                stats_totalLoginDays: loginUpdates.stats_totalLoginDays,
                updatedAt: new Date().toISOString(),
              };

              await updateDoc(userRef, updateData);

              // Update local state with new login stats
              const updatedData = {
                ...mergedData,
                ...updateData,
              };
              dispatch({ type: 'SET_USER_DATA', payload: updatedData });
              localStorage.setItem('userData', JSON.stringify(updatedData));

              logger.debug(
                '✅ [ActivityTracker] Login stats saved to Firestore'
              );
            }
          } catch (error) {
            logger.error(
              '❌ [ActivityTracker] Failed to update login stats:',
              error
            );
            // Don't fail the entire load process if login tracking fails
          }
        }
        setIsLoading(false);
        return true;
      } else {
        logger.debug('用戶文檔不存在，創建新的');
        // 如果用戶文檔不存在，創建一個新的
        const newUserData = { ...initialState, userId: currentUser.uid };

        // ✅ Daily Login Tracker: Initialize login stats for new user
        const loginUpdates = handleDailyLogin(newUserData);
        if (loginUpdates) {
          Object.assign(newUserData, loginUpdates);
          logger.debug(
            '📅 [ActivityTracker] Initializing login stats for new user:',
            loginUpdates
          );
        }

        await setDoc(userRef, newUserData);

        if (isMountedRef.current) {
          dispatch({ type: 'SET_USER_DATA', payload: newUserData });
          localStorage.setItem('userData', JSON.stringify(newUserData));
        }
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      logger.error('載入用戶數據失敗:', error);

      // 嘗試從 localStorage 載入
      try {
        const localData = localStorage.getItem('userData');
        if (localData && isMountedRef.current) {
          const parsedData = JSON.parse(localData);
          if (process.env.NODE_ENV === 'development') {
            logger.debug('從本地載入用戶資料:', parsedData);
          }
          dispatch({ type: 'SET_USER_DATA', payload: parsedData });
          setIsLoading(false);
          return true;
        }
      } catch (e) {
        logger.error('解析本地數據失敗:', e);
      }

      setIsLoading(false);
      return false;
    }
  }, []);

  // 保存用戶數據到 Firebase
  const saveUserData = useCallback(
    async data => {
      if (!auth.currentUser || !data) {
        logger.warn('無法保存數據：用戶未登入或數據無效');
        return false;
      }

      // 檢查是否為模擬模式
      if (isMockMode) {
        logger.debug('⏭️ 模擬模式：跳過 Firebase 寫入，僅保存到本地');
        localStorage.setItem('userData', JSON.stringify(data));
        return true;
      }

      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const dataToSave = {
          ...data,
          userId: auth.currentUser.uid,
          updatedAt: new Date().toISOString(),
          // ✅ 保存獨立數據
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
          // 確保數值類型正確
          height: Number(data.height) || 0,
          weight: Number(data.weight) || 0,
          age: Number(data.age) || 0,
          // 確保年齡段被計算和保存
          ageGroup: data.age
            ? getAgeGroup(Number(data.age))
            : data.ageGroup || '',
          // 保持原有的天梯分數，不自動重新計算
          ladderScore: data.ladderScore || 0,
          // 確保天梯排名被保存
          ladderRank: Number(data.ladderRank) || 0,
          // 確保天梯提交時間被保存
          lastLadderSubmission: data.lastLadderSubmission || null,
          // 確保最後活動時間被保存
          lastActive: data.lastActive || null,
          // 確保排行榜資訊被保存（後期排行榜重要資料）
          country: data.country || '',
          region: data.region || '',
          // ✅ Phase 1 新增：確保新欄位被保存
          city: data.city || '',
          // ✅ 修復：確保 district 字段被保存到 Firebase
          district: data.district || '',
          job_category: data.job_category || '',
          gym_name: data.gym_name || '',
          rpg_class: data.rpg_class || '',
          // ✅ Phase 1-5 新增：確保商業系統欄位被保存
          subscription: data.subscription || {
            status: 'active',
            isEarlyAdopter: true,
          },
          rpgStats: data.rpgStats || {
            lastGachaDate: null,
            totalExp: 0,
            level: 1,
          },
        };

        // ✅ Phase 1-5 新增：使用 merge: true 確保不覆蓋現有數據
        await setDoc(userRef, dataToSave, { merge: true });
        localStorage.setItem('userData', JSON.stringify(dataToSave));

        // 記錄寫入操作
        firebaseWriteMonitor.logWrite(
          'setDoc',
          'users',
          auth.currentUser.uid,
          dataToSave
        );

        return true;
      } catch (error) {
        logger.error('保存用戶數據失敗:', error);
        // 至少保存到本地
        localStorage.setItem('userData', JSON.stringify(data));
        return false;
      }
    },
    [isMockMode]
  );

  // 新增：防抖引用
  const setUserDataDebounceRef = useRef(null);
  const saveHistoryDebounceRef = useRef(null);
  const lastWriteTimeRef = useRef(0);
  const writeCountRef = useRef(0);
  const lastWriteCountResetTimeRef = useRef(Date.now());
  // const pendingWritesRef = useRef(new Map()); // 新增：待寫入數據緩存
  const writeQueueRef = useRef([]); // 新增：寫入隊列
  const isProcessingQueueRef = useRef(false); // 新增：隊列處理狀態

  // 新增：函數引用，避免認證監聽器重複執行
  const loadUserDataRef = useRef();
  const clearUserDataRef = useRef();

  // 新增：數據驗證函數
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

  // 新增：智能寫入隊列處理
  const processWriteQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || writeQueueRef.current.length === 0) {
      return;
    }

    // 檢查是否為模擬模式
    if (isMockMode) {
      logger.debug('⏭️ 模擬模式：跳過 Firebase 寫入處理');
      // 清空寫入隊列
      writeQueueRef.current.length = 0;
      return;
    }

    // 檢查認證狀態
    if (!auth.currentUser) {
      logger.debug('⏭️ 跳過寫入：用戶未認證');
      // 清空寫入隊列，避免積累
      writeQueueRef.current.length = 0;
      return;
    }

    isProcessingQueueRef.current = true;

    try {
      const batch = [];
      const processedIds = [];

      // 處理隊列中的寫入操作
      while (writeQueueRef.current.length > 0) {
        const writeOp = writeQueueRef.current.shift();

        // 驗證和清理數據
        const validation = validateUserData(writeOp.data);
        if (!validation.isValid) {
          logger.warn('數據驗證失敗，跳過寫入:', validation.errors);
          continue;
        }

        // 使用清理後的數據
        const cleanedData = validation.cleaned;
        batch.push({
          ...writeOp,
          data: cleanedData,
        });
        processedIds.push(writeOp.id);
      }

      if (batch.length > 0) {
        logger.debug(`🔄 批量處理 ${batch.length} 個寫入操作`);

        // 執行批量寫入
        for (const writeOp of batch) {
          try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userRef, writeOp.data, { merge: true });

            // 記錄寫入操作
            firebaseWriteMonitor.logWrite(
              'setDoc',
              'users',
              auth.currentUser.uid,
              writeOp.data
            );

            logger.debug(`✅ 寫入成功: ${writeOp.type}`);
          } catch (error) {
            logger.error(`❌ 寫入失敗: ${writeOp.type}`, error);
            // 將失敗的操作重新加入隊列
            writeQueueRef.current.unshift(writeOp);
          }
        }

        // 更新本地存儲
        const latestData = batch[batch.length - 1].data;
        localStorage.setItem('userData', JSON.stringify(latestData));
        localStorage.setItem('lastSavedUserData', JSON.stringify(latestData));
      }
    } catch (error) {
      logger.error('批量寫入處理失敗:', error);
    } finally {
      isProcessingQueueRef.current = false;

      // 如果隊列中還有待處理的操作，繼續處理
      if (writeQueueRef.current.length > 0) {
        setTimeout(() => processWriteQueue(), 1000);
      }
    }
  }, [validateUserData, isMockMode]);

  // 新增：添加到寫入隊列
  const addToWriteQueue = useCallback(
    (data, type = 'update') => {
      // 檢查是否為模擬模式
      if (isMockMode) {
        logger.debug('⏭️ 模擬模式：跳過 Firebase 寫入操作');
        return;
      }

      // 檢查認證狀態
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

      // 限制隊列長度，避免內存洩漏
      if (writeQueueRef.current.length > 20) {
        writeQueueRef.current.shift();
      }

      // 觸發隊列處理
      if (!isProcessingQueueRef.current) {
        setTimeout(() => processWriteQueue(), 1000);
      }
    },
    [processWriteQueue, isMockMode]
  );

  // 更新用戶數據
  const setUserData = useCallback(
    update => {
      let newData;

      if (typeof update === 'function') {
        // 函數式更新
        const currentData = userData;
        newData = update(currentData);
      } else {
        // 直接更新
        newData = { ...userData, ...update };
      }

      // 計算年齡段（天梯分數不再自動計算）
      if (newData.age) {
        newData.ageGroup = getAgeGroup(newData.age);
      }

      // 如果資料沒有實質變化則跳過，避免無限循環
      try {
        const prevString = JSON.stringify(userData);
        const nextString = JSON.stringify({ ...userData, ...newData });
        if (prevString === nextString) {
          return;
        }
      } catch (error) {
        logger.warn('序列化比較失敗，繼續更新:', error);
      }

      // 立即更新本地狀態
      dispatch({ type: 'UPDATE_USER_DATA', payload: newData });

      // 優化：只在重要數據變化時才保存到 Firebase
      if (auth.currentUser) {
        const importantFields = [
          'scores',
          'record_5km', // ✅ 新增監聽：5KM 變動時觸發保存
          'record_arm_girth', // ✅ 新增監聽：臂圍變動時觸發保存
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
          // 新增：評測輸入需持久化，避免回頁面遺失
          'testInputs',
          // 新增：排行榜資訊需持久化（後期排行榜重要資料）
          'country',
          'region',
          // ✅ Phase 1 新增：新欄位需持久化
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
          // 檢查是否只是暱稱變化
          const isOnlyNicknameChange =
            JSON.stringify(newData.nickname) !==
              JSON.stringify(userData.nickname) &&
            JSON.stringify({ ...newData, nickname: userData.nickname }) ===
              JSON.stringify({ ...userData, nickname: newData.nickname });

          // 智能寫入頻率控制
          const now = Date.now();
          const timeSinceLastWrite = now - lastWriteTimeRef.current;
          const timeSinceLastReset = now - lastWriteCountResetTimeRef.current;

          // 每小時重置寫入計數
          if (timeSinceLastReset > 3600000) {
            writeCountRef.current = 0;
            lastWriteCountResetTimeRef.current = now;
          }

          // 簡化防抖邏輯：使用固定的防抖時間
          // 國內外測試輸入需要較即時保存，若 testInputs 有變則縮短為 2 秒
          const testInputsChanged =
            JSON.stringify(newData.testInputs) !==
            JSON.stringify(userData.testInputs);

          const debounceTime = isOnlyNicknameChange
            ? 5000
            : testInputsChanged
            ? 2000
            : 20000; // 暱稱5秒，測試輸入2秒，其餘20秒

          // 檢查寫入頻率限制（至少間隔60秒）
          if (timeSinceLastWrite < 60000) {
            // 如果距離上次寫入不到60秒，延長防抖時間
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
            // 清除之前的防抖定時器
            if (setUserDataDebounceRef.current) {
              clearTimeout(setUserDataDebounceRef.current);
            }

            // 使用簡化的防抖時間
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
    [userData, addToWriteQueue]
  );

  // 保存歷史記錄 - 優化版本，包含記錄數量限制和自動清理
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

      // 獲取當前歷史記錄
      const currentHistory = userData.history || [];
      const maxRecords = 50;

      // 檢查記錄數量限制
      if (currentHistory.length >= maxRecords) {
        logger.warn(`歷史記錄已達上限 (${maxRecords})，執行自動清理`);

        // 自動清理：保留最新的 40 條記錄，刪除最舊的 10 條
        const sortedHistory = [...currentHistory].sort((a, b) => {
          const dateA = a.timestamp ? new Date(a.timestamp) : new Date(a.date);
          const dateB = b.timestamp ? new Date(b.timestamp) : new Date(b.date);
          return dateB - dateA; // 降序排列，最新的在前
        });

        const cleanedHistory = sortedHistory.slice(0, maxRecords - 10);
        logger.debug(
          `自動清理完成：刪除 ${
            currentHistory.length - cleanedHistory.length
          } 條舊記錄`
        );

        // 更新本地 state
        dispatch({
          type: 'UPDATE_USER_DATA',
          payload: { history: cleanedHistory },
        });

        // 顯示用戶友好的提示
        if (typeof window !== 'undefined' && window.alert) {
          alert(`歷史記錄已達上限，已自動清理最舊的記錄以騰出空間。`);
        }
      }

      // 立即更新本地 state（添加新記錄）
      const newHistory = [...(userData.history || []), recordWithMetadata];
      dispatch({
        type: 'UPDATE_USER_DATA',
        payload: { history: newHistory },
      });

      // 檢查是否為模擬模式
      if (isMockMode) {
        logger.debug('⏭️ 模擬模式：歷史記錄僅保存到本地');
        return;
      }

      // 優化的歷史記錄保存策略：立即本地保存 + 短延遲 Firebase 保存
      try {
        const updatedData = {
          ...userData,
          history: newHistory,
          updatedAt: new Date().toISOString(),
        };

        // 立即保存到本地存儲（確保數據不丟失）
        localStorage.setItem('userData', JSON.stringify(updatedData));
        localStorage.setItem('lastSavedUserData', JSON.stringify(updatedData));
        logger.debug(
          `歷史記錄已保存到本地存儲 (${newHistory.length}/${maxRecords})`
        );

        // 使用短延遲（2秒）保存到 Firebase，避免過度寫入
        if (auth.currentUser) {
          setTimeout(async () => {
            try {
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
          }, 2000); // 2秒延遲，平衡即時性和寫入頻率
        }
      } catch (error) {
        logger.error('保存歷史記錄失敗:', error);
        // 如果本地保存也失敗，至少嘗試保存到 localStorage
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
    [userData, addToWriteQueue, isMockMode]
  );

  // 清除用戶數據
  const clearUserData = useCallback(() => {
    logger.debug('清除用戶資料');
    localStorage.removeItem('userData');
    dispatch({ type: 'RESET_USER_DATA' });
    setIsLoading(false);
  }, []);

  // 更新函數引用
  loadUserDataRef.current = loadUserData;
  clearUserDataRef.current = clearUserData;

  // 監聽認證狀態變化
  useEffect(() => {
    isMountedRef.current = true;

    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        logger.debug('認證狀態變更 - 用戶已登入:', user.email);
        setIsAuthenticated(true);
        // 清除訪客模式標記
        sessionStorage.removeItem('guestMode');
        await loadUserDataRef.current(user);
      } else {
        logger.debug('認證狀態變更 - 用戶未登入');
        setIsAuthenticated(false);
        clearUserDataRef.current();
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, []); // 使用 ref 避免重複執行

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        saveUserData,
        saveHistory,
        clearUserData,
        loadUserData: (forceReload = false) =>
          loadUserData(auth.currentUser, forceReload),
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
