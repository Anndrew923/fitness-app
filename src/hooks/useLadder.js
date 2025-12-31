import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useUser } from '../UserContext';
import { auth, db } from '../firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { formatScore, getAgeGroup } from '../utils.js';
import { safeGetDocs } from '../utils/firestoreHelper';
import LadderLikeSystem from '../utils/ladderLikeSystem';
import logger from '../utils/logger';
import { useTranslation } from 'react-i18next';
import { recalculateSMMScore } from '../utils/calculateSMMScore';

/**
 * Custom hook for Ladder data management
 * Handles all Firestore interactions, pagination, and state
 * @param {Object} options - Optional filter options
 * @param {string} options.filterGender - Gender filter ('all', 'male', 'female')
 * @param {string} options.filterAge - Age group filter ('all', 'under-20', '20-29', etc.)
 * @param {string} options.filterHeight - Height filter ('all', '<160', '160-170', '170-180', '180-190', '>190')
 * @param {string} options.filterWeight - Weight class filter ('all', 'under-50kg', '50-60kg', etc.)
 * @param {string} options.filterJob - Job category filter ('all', 'engineering', 'medical', etc.)
 * @param {string} options.filterProject - Lift project filter ('total', 'squat', 'bench', 'deadlift', etc.)
 * @returns {string} selectedDivision - Current division selection (managed internally by hook)
 */
export const useLadder = (options = {}) => {
  const {
    filterGender = 'all',
    filterAge = 'all',
    filterHeight = 'all',
    filterWeight = 'all',
    filterJob = 'all',
    filterProject = 'total',
  } = options;
  const { userData } = useUser();
  const { t } = useTranslation();
  const [ladderData, setLadderData] = useState([]);
  const [userRank, setUserRank] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedTab, setSelectedTab] = useState('total');
  const [selectedDivision, setSelectedDivision] = useState('ladderScore');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [displayStartRank, setDisplayStartRank] = useState(1);
  const [likeProcessing, setLikeProcessing] = useState(new Set());
  const [likedUsers, setLikedUsers] = useState(new Set());

  const loadingRef = useRef(false);
  const lastLoadParamsRef = useRef(null);
  const forceReloadRef = useRef(false);
  const hasInitialPageSetRef = useRef(false);
  const hasDataRef = useRef(false);

  const usersPerPage = 50;

  /**
   * Build dynamic query based on filters
   * Future expansion: supports job, region filters
   * Note: We always query by ladderScore for Firestore index compatibility,
   * then sort client-side by selectedDivision
   */
  const buildQuery = useCallback((filters = {}) => {
    // Base query: always orderBy ladderScore (has index)
    // Client-side sorting will handle selectedDivision
    let q = query(collection(db, 'users'), orderBy('ladderScore', 'desc'));

    // Future expansion: if (filters.job) ...
    // Future expansion: if (filters.region) ...

    // Limit for performance (can be adjusted for pagination with cursors)
    q = query(q, limit(200));

    return q;
  }, []);

  /**
   * Load ladder data from Firestore
   */
  const loadLadderData = useCallback(async () => {
    // Prevent duplicate loading
    if (loadingRef.current) {
      logger.debug('🔄 正在載入中，跳過重複請求');
      return;
    }

    // Create load params key for debouncing
    const loadParams = {
      selectedAgeGroup,
      selectedTab,
      selectedDivision,
      filterGender,
      filterAge,
      filterHeight,
      filterWeight,
      filterJob,
      filterProject,
      userLadderScore: userData?.ladderScore || 0,
      userCity: userData?.city || '',
      userDistrict: userData?.district || '',
    };

    // Check if params changed, skip if same (unless force reload)
    if (
      !forceReloadRef.current &&
      lastLoadParamsRef.current &&
      JSON.stringify(lastLoadParamsRef.current) === JSON.stringify(loadParams)
    ) {
      logger.debug('🔄 載入參數未變化，跳過重複載入');
      return;
    }

    forceReloadRef.current = false;
    lastLoadParamsRef.current = loadParams;
    loadingRef.current = true;

    // Silent refresh if data already exists
    if (ladderData.length === 0) {
      setLoading(true);
    } else {
      logger.debug('🔄 執行無感更新 (Silent Refresh)，保留目前列表視圖');
    }

    try {
      logger.debug('🚀 開始載入天梯數據...', loadParams);

      const q = buildQuery({
        ageGroup: selectedAgeGroup,
        tab: selectedTab,
        sortBy: selectedDivision,
      });
      const querySnapshot = await safeGetDocs(q, {
        maxRetries: 3,
        retryDelay: 1000,
        onRetry: (retryCount, maxRetries, delay) => {
          logger.warn(
            `🔄 載入天梯數據重試 (${retryCount}/${maxRetries})，${delay}ms 後重試...`
          );
        },
      });

      let data = [];
      logger.debug(`📥 從 Firebase 獲取到 ${querySnapshot.size} 個文檔`);

      querySnapshot.forEach(doc => {
        const docData = doc.data();
        if (docData.ladderScore > 0) {
          const isAnonymous = docData.isAnonymousInLadder === true;
          const userWithAgeGroup = {
            ...docData,
            ageGroup: docData.age
              ? getAgeGroup(Number(docData.age))
              : docData.ageGroup || '',
          };

          const displayName = isAnonymous
            ? t('community.fallback.anonymousUser')
            : docData.nickname ||
              docData.email?.split('@')[0] ||
              t('community.fallback.unnamedUser');

          const userObject = {
            id: doc.id,
            ...userWithAgeGroup,
            displayName,
            avatarUrl: isAnonymous ? '' : docData.avatarUrl,
            isAnonymous: isAnonymous,
            scores: docData.scores || {
              strength: 0,
              explosivePower: 0,
              cardio: 0,
              muscleMass: 0,
              bodyFat: 0,
            },
            profession: docData.profession || '',
            weeklyTrainingHours: docData.weeklyTrainingHours || 0,
            trainingYears: docData.trainingYears || 0,
            country: docData.country || '',
            region: docData.region || '',
            city: docData.city || '',
            district: docData.district || '',
            ladderLikeCount: docData.ladderLikeCount || 0,
            ladderLikes: docData.ladderLikes || [],
            isVerified: docData.isVerified === true,
          };

          // 🕵️‍♀️ 强制诊断：针对美乐蒂的详细数据输出
          if (
            displayName.includes('美樂蒂') ||
            displayName.includes('Melody') ||
            displayName.includes('美乐蒂')
          ) {
            console.log('🕵️‍♀️ 抓到美樂蒂了！');
            console.log('=== 完整用户数据 ===');
            console.log('User ID:', doc.id);
            console.log('Display Name:', displayName);
            console.log('Type of Score:', typeof userObject.scores?.muscleMass); // 關鍵：看是 number 還是 string
            console.log('Raw Score Value:', userObject.scores?.muscleMass);
            console.log(
              'Raw Score Value (JSON):',
              JSON.stringify(userObject.scores?.muscleMass)
            );
            console.log(
              'Number(Score):',
              Number(userObject.scores?.muscleMass)
            );
            console.log(
              'Math.abs(Number(Score) - 100):',
              Math.abs(Number(userObject.scores?.muscleMass) - 100)
            );
            console.log(
              'Is Suspicious 100?:',
              !isNaN(Number(userObject.scores?.muscleMass)) &&
                Math.abs(Number(userObject.scores?.muscleMass) - 100) < 0.1
            );
            console.log('SMM Data (stats_smm):', userObject.stats_smm);
            console.log(
              'SMM Data (testInputs.muscle.smm):',
              userObject.testInputs?.muscle?.smm
            );
            console.log('Weight Data:', userObject.weight);
            console.log(
              'Has SMM?:',
              userObject.stats_smm > 0 || userObject.testInputs?.muscle?.smm > 0
            );
            console.log('Has Weight?:', userObject.weight > 0);
            console.log(
              'Has Data?:',
              (userObject.stats_smm > 0 ||
                userObject.testInputs?.muscle?.smm > 0) &&
                userObject.weight > 0
            );
            console.log('Full scores object:', userObject.scores);
            console.log('Full user object:', userObject);
            console.log('==================');
          }

          data.push(userObject);
        }
      });

      // 🟢 OPTIMISTIC PATCH: Inject local UserData into raw Firestore data before sorting
      // This ensures the user gets the Correct Rank based on their latest local score
      if (userData && (userData.userId || auth.currentUser?.uid)) {
        const uid = userData.userId || auth.currentUser?.uid;
        const localIndex = data.findIndex(u => u.id === uid);

        if (localIndex !== -1) {
          // Merge local context data (fresh) over Firestore data (stale)
          data[localIndex] = {
            ...data[localIndex],
            ...userData, // Override with fresh local state
            // Explicitly ensure critical sorting fields are synced
            scores: userData.scores,
            testInputs: userData.testInputs,
            ladderScore: userData.ladderScore,
            // Sync flat metrics if they exist in local state
            stats_5k: userData.stats_5k ?? data[localIndex].stats_5k,
            stats_5k_time:
              userData.stats_5k_time ?? data[localIndex].stats_5k_time,
            stats_cooper:
              userData.stats_cooper ?? data[localIndex].stats_cooper,
          };
          logger.debug(
            '🚀 Optimistic Patch: Applied local data to raw ladder list before sorting'
          );
        }
      }

      logger.debug(`📊 過濾後有分數的用戶：${data.length} 名`);

      // Client-side filtering: Age Group
      if (selectedAgeGroup !== 'all') {
        const beforeFilterCount = data.length;
        data = data.filter(user => user.ageGroup === selectedAgeGroup);
        logger.debug(
          `👥 年齡段過濾：${beforeFilterCount} → ${data.length} 名用戶`
        );
      }

      // Client-side filtering: Weekly
      if (selectedTab === 'weekly') {
        const beforeFilterCount = data.length;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        data = data.filter(user => {
          if (!user.lastActive) return false;
          const lastActive = new Date(user.lastActive);
          return lastActive >= oneWeekAgo;
        });
        logger.debug(
          `📅 本周新進榜過濾：${beforeFilterCount} → ${data.length} 名用戶`
        );
      }

      // Client-side filtering: Verified
      if (selectedTab === 'verified') {
        const beforeFilterCount = data.length;
        data = data.filter(user => user.isVerified === true);
        logger.debug(
          `🏅 榮譽認證過濾：${beforeFilterCount} → ${data.length} 名用戶`
        );
      }

      // Client-side filtering: Local District
      if (selectedDivision === 'local_district') {
        const beforeFilterCount = data.length;
        const currentUserCity = userData?.city || '';
        const currentUserDistrict = userData?.district || '';

        if (!currentUserCity || !currentUserDistrict) {
          // User hasn't set location, return empty list
          logger.debug('📍 用戶未設定地區，返回空列表');
          data = [];
        } else {
          data = data.filter(user => {
            const userCity = user.city || '';
            const userDistrict = user.district || '';
            return (
              userCity === currentUserCity &&
              userDistrict === currentUserDistrict
            );
          });
          logger.debug(
            `📍 地區過濾 (${currentUserCity} ${currentUserDistrict})：${beforeFilterCount} → ${data.length} 名用戶`
          );
        }
      }

      // Client-side filtering: Gender
      if (filterGender !== 'all') {
        const beforeFilterCount = data.length;
        data = data.filter(user => user.gender === filterGender);
        logger.debug(
          `👤 性別過濾 (${filterGender})：${beforeFilterCount} → ${data.length} 名用戶`
        );
      }

      // Client-side filtering: Age Group
      if (filterAge !== 'all') {
        const beforeFilterCount = data.length;
        data = data.filter(user => {
          const age = Number(user.age) || 0;
          if (age === 0) return false;

          switch (filterAge) {
            case 'under-20':
              return age < 20;
            case '20-29':
              return age >= 20 && age <= 29;
            case '30-39':
              return age >= 30 && age <= 39;
            case '40-49':
              return age >= 40 && age <= 49;
            case '50-59':
              return age >= 50 && age <= 59;
            case '60-69':
              return age >= 60 && age <= 69;
            case '70+':
              return age >= 70;
            default:
              return true;
          }
        });
        logger.debug(
          `📅 年齡過濾 (${filterAge})：${beforeFilterCount} → ${data.length} 名用戶`
        );
      }

      // Client-side filtering: Height
      if (filterHeight !== 'all') {
        const beforeFilterCount = data.length;
        data = data.filter(user => {
          const height = Number(user.height) || 0;
          if (height === 0) return false;

          switch (filterHeight) {
            case '<160':
              return height < 160;
            case '160-170':
              return height >= 160 && height <= 170;
            case '170-180':
              return height >= 170 && height <= 180;
            case '180-190':
              return height >= 180 && height <= 190;
            case '>190':
              return height > 190;
            default:
              return true;
          }
        });
        logger.debug(
          `📏 身高過濾 (${filterHeight})：${beforeFilterCount} → ${data.length} 名用戶`
        );
      }

      // Client-side filtering: Weight Class
      if (filterWeight !== 'all') {
        const beforeFilterCount = data.length;
        data = data.filter(user => user.filter_weightClass === filterWeight);
        logger.debug(
          `⚖️ 體重過濾 (${filterWeight})：${beforeFilterCount} → ${data.length} 名用戶`
        );
      }

      // Client-side filtering: Job Category
      if (filterJob !== 'all') {
        const beforeFilterCount = data.length;
        data = data.filter(
          user =>
            user.filter_job === filterJob || user.job_category === filterJob
        );
        logger.debug(
          `💼 職業過濾 (${filterJob})：${beforeFilterCount} → ${data.length} 名用戶`
        );
      }

      // ✅ 性能优化：使用 useMemo 包裹排序逻辑（避免重复执行）
      // 注意：由于这是在异步函数内部，我们使用函数提取来减少重复计算
      // 排序逻辑会在数据或筛选条件改变时执行

      // Re-sort based on selected division and project filter
      // For local_district, always sort by ladderScore (descending)
      let sortField =
        selectedDivision === 'local_district'
          ? 'ladderScore'
          : selectedDivision;

      // Override sort field based on division and project filter
      if (selectedDivision === 'stats_sbdTotal' && filterProject !== 'total') {
        if (filterProject === 'total_five') {
          // Special case: Calculate five-item total for sorting
          sortField = 'total_five';
        } else if (filterProject === 'squat') {
          sortField = 'stats_squat';
        } else if (filterProject === 'bench') {
          sortField = 'stats_bench';
        } else if (filterProject === 'deadlift') {
          sortField = 'stats_deadlift';
        } else if (filterProject === 'ohp') {
          sortField = 'stats_ohp';
        } else if (filterProject === 'latPull') {
          sortField = 'stats_latPull';
        }
      } else if (selectedDivision === 'stats_cooper') {
        // 🔥 5KM 視覺重構：按分數排序（降序），不再是時間
        if (filterProject === '5km') {
          sortField = 'stats_5k_score'; // 按分數排序，不是時間
        } else {
          sortField = 'stats_cooper';
        }
      } else if (selectedDivision === 'stats_vertical') {
        if (filterProject === 'broad') {
          sortField = 'stats_broad';
        } else if (filterProject === 'sprint') {
          sortField = 'stats_100m';
        } else {
          sortField = 'stats_vertical';
        }
      } else if (selectedDivision === 'stats_bodyFat') {
        if (filterProject === 'ffmi') {
          sortField = 'stats_ffmi';
        } else {
          sortField = 'stats_bodyFat';
        }
      } else if (selectedDivision === 'stats_ffmi') {
        if (filterProject === 'score') {
          sortField = 'muscleMass_score'; // 使用 scores.muscleMass 排序
        } else if (filterProject === 'weight') {
          sortField = 'stats_smm'; // 使用 stats_smm (kg) 排序
        } else if (filterProject === 'ratio') {
          sortField = 'smm_ratio'; // 使用计算出的 SMM 比率排序
        } else {
          sortField = 'muscleMass_score'; // 默认使用分数
        }
      } else if (selectedDivision === 'armSize') {
        // PAS 臂围：按照 scores.armSize 排序
        sortField = 'armSize';
      }

      // ✅ 性能优化：只在数据或筛选条件改变时执行排序
      // 使用数组副本避免直接修改原数组
      const sortedData = [...data].sort((a, b) => {
        // Special case: Calculate five-item total for sorting
        let aValue, bValue;
        if (sortField === 'total_five') {
          aValue =
            (a.stats_sbdTotal || 0) +
            (a.stats_ohp || 0) +
            (a.stats_latPull || 0);
          bValue =
            (b.stats_sbdTotal || 0) +
            (b.stats_ohp || 0) +
            (b.stats_latPull || 0);
        } else if (sortField === 'armSize') {
          // 🔥 修正：從 record_arm_girth.score 讀取，不再從 scores.armSize
          aValue = a.record_arm_girth?.score || 0;
          bValue = b.record_arm_girth?.score || 0;
        } else if (sortField === 'muscleMass_score') {
          // SMM 分数：从 scores.muscleMass 读取
          // ✅ 修复：强制重算策略 - 当检测到 100 分时，尝试重新计算
          const getValidScore = user => {
            const storedScore = user.scores?.muscleMass;
            // ✅ 终极修复：使用数值转换后的宽松判断，处理字符串类型
            const numStoredScore = Number(storedScore);
            const isSuspicious100 =
              !isNaN(numStoredScore) && Math.abs(numStoredScore - 100) < 0.1;
            const hasSmm =
              user.stats_smm > 0 || user.testInputs?.muscle?.smm > 0;
            const hasWeight = user.weight > 0;
            const hasData = hasSmm && hasWeight;

            // ✅ 性能优化：减少诊断日志的重复输出
            // 只在第一次检测到或数据状态改变时输出
            if (isSuspicious100) {
              const displayName =
                user.displayName ||
                user.nickname ||
                user.email?.split('@')[0] ||
                'Unknown';
              const shouldLog =
                displayName === 'Melody' ||
                displayName === 'Feynman0418' ||
                displayName.includes('Melody') ||
                displayName.includes('Feynman');
              // 只在特定用户且数据状态改变时输出诊断信息（避免重复）
              if (
                shouldLog &&
                (!user._lastDiagnosticLog ||
                  user._lastDiagnosticLog !== `${hasSmm}-${hasWeight}`)
              ) {
                console.log('🔍 Bug User Diagnostic (useLadder):', {
                  displayName,
                  storedScore,
                  storedScoreType: typeof storedScore,
                  numStoredScore,
                  isSuspicious100,
                  stats_smm: user.stats_smm,
                  weight: user.weight,
                  hasSmm,
                  hasWeight,
                  hasData,
                  testInputs_muscle: user.testInputs?.muscle,
                  scores: user.scores,
                });
                // 标记已记录，避免重复输出
                user._lastDiagnosticLog = `${hasSmm}-${hasWeight}`;
              }
            }

            // ✅ Kill Switch: 如果存储分数为 100（无论类型），必须处理（不能 fallback 回 100）
            if (isSuspicious100) {
              // 情况 A: 有数据，尝试重算
              if (hasData) {
                const recalculatedScore = recalculateSMMScore(user);

                if (recalculatedScore !== null && recalculatedScore !== 100) {
                  // 重算成功，使用新分数
                  const displayName =
                    user.displayName ||
                    user.nickname ||
                    user.email?.split('@')[0] ||
                    'Unknown';
                  console.log(
                    `✅ 强制重算成功 (排序): ${displayName} - 从 100 分重算为 ${recalculatedScore} 分`
                  );
                  return recalculatedScore;
                } else if (recalculatedScore === null) {
                  // 重算失败（数据不完整），返回 0（排序时排在最后）
                  const displayName =
                    user.displayName ||
                    user.nickname ||
                    user.email?.split('@')[0] ||
                    'Unknown';
                  console.warn(
                    `⚠️ 强制重算失败 (排序): ${displayName} - 数据不完整，强制归零`
                  );
                  return 0;
                }
                // 重算结果仍为 100，可能是真实 100 分，使用原值
                return storedScore;
              } else {
                // 情况 B: 无数据，强制归零（Kill Switch）- 这是关键修复点
                const displayName =
                  user.displayName ||
                  user.nickname ||
                  user.email?.split('@')[0] ||
                  'Unknown';
                console.warn(
                  `🚫 Kill Switch 触发 (排序): ${displayName} - muscleMass=100 但缺少必要数据，强制归零`
                );
                return 0;
              }
            }

            // 正常情况：直接使用存储值
            if (storedScore !== undefined && storedScore !== null) {
              const numScore = Number(storedScore);
              // 检查是否为有效数字且不为 Infinity/NaN
              if (!isNaN(numScore) && isFinite(numScore) && numScore >= 0) {
                return numScore;
              }
            }
            return 0;
          };

          aValue = getValidScore(a);
          bValue = getValidScore(b);
        } else if (sortField === 'smm_ratio') {
          // SMM 比率：计算 (smm / weight) * 100
          // ✅ 修复：防止除以零导致的 Infinity/NaN
          const getValidRatio = user => {
            const smm = Number(user.stats_smm) || 0;
            const weight = Number(user.weight) || 0;

            // 防御性检查：如果缺少必要数据，返回 0
            if (!smm || !weight || weight <= 0) {
              return 0;
            }

            // 安全计算：确保不会产生 Infinity 或 NaN
            const ratio = (smm / weight) * 100;
            return isFinite(ratio) && !isNaN(ratio) ? ratio : 0;
          };

          aValue = getValidRatio(a);
          bValue = getValidRatio(b);
        } else if (sortField === 'stats_5k_score') {
          // 🔥 5KM 視覺重構：從 record_5km.score 或 stats_5k_score 讀取分數
          const get5KmScore = user => {
            // 優先從 record_5km.score 讀取
            const recordScore = user.record_5km?.score;
            if (recordScore !== undefined && recordScore !== null) {
              return Number(recordScore) || 0;
            }
            // Fallback 到 stats_5k_score
            return Number(user.stats_5k_score) || 0;
          };
          aValue = get5KmScore(a);
          bValue = get5KmScore(b);
        } else {
          aValue = a[sortField];
          bValue = b[sortField];
        }

        // Special cases: Lower is better (ascending) - Time-based metrics
        // 🔥 5KM 不再按時間排序，已改為按分數排序
        if (sortField === 'stats_100m') {
          // Helper function: Check if value is valid (not 0, null, undefined, NaN, or empty string)
          const isValidTime = val => {
            if (val === null || val === undefined || val === '') return false;
            const numVal = Number(val);
            return !isNaN(numVal) && numVal > 0;
          };

          // Treat invalid values as Infinity (will sort to bottom)
          const aNum = isValidTime(aValue) ? Number(aValue) : Infinity;
          const bNum = isValidTime(bValue) ? Number(bValue) : Infinity;

          // Sort ascending (lower is better), Infinity values go to bottom
          return aNum - bNum;
        }

        // Special case: Body Fat (lower is better, but 0% is INVALID - physiologically impossible)
        if (sortField === 'stats_bodyFat') {
          // Helper function: Check if value is valid (must be strictly > 0)
          const isValidBodyFat = val => {
            if (val === null || val === undefined || val === '') return false;
            const numVal = Number(val);
            return !isNaN(numVal) && numVal > 0;
          };

          // Treat invalid values (including 0) as Infinity (will sort to bottom)
          const aNum = isValidBodyFat(aValue) ? Number(aValue) : Infinity;
          const bNum = isValidBodyFat(bValue) ? Number(bValue) : Infinity;

          // Sort ascending (lower is better), Infinity values go to bottom
          return aNum - bNum;
        }

        // Default: Higher is better (descending)
        const aVal = aValue || 0;
        const bVal = bValue || 0;
        return bVal - aVal;
      });

      // 使用排序后的数据
      data = sortedData;

      // Calculate user rank and pagination
      let displayData = [];
      let actualUserRank = 0;
      let startRank = 1;

      setTotalUsers(data.length);

      if (userData && userData.ladderScore > 0) {
        const userRankIndex = data.findIndex(
          user =>
            user.id === userData.userId || user.id === auth.currentUser?.uid
        );
        actualUserRank = userRankIndex >= 0 ? userRankIndex + 1 : 0;

        if (actualUserRank > 0) {
          const calculatedUserPage = Math.ceil(actualUserRank / usersPerPage);
          setUserRank(actualUserRank);

          // Auto-jump to user page on first load
          if (!hasInitialPageSetRef.current && calculatedUserPage > 1) {
            setCurrentPage(calculatedUserPage);
            hasInitialPageSetRef.current = true;
          }

          const startIndex = (currentPage - 1) * usersPerPage;
          const endIndex = startIndex + usersPerPage;

          if (startIndex < data.length) {
            displayData = data.slice(startIndex, endIndex);
            startRank = startIndex + 1;
          } else {
            const lastPageStart = Math.max(0, data.length - usersPerPage);
            displayData = data.slice(lastPageStart);
            startRank = lastPageStart + 1;
            const lastPage = Math.ceil(data.length / usersPerPage) || 1;
            setCurrentPage(lastPage);
          }
        } else {
          displayData = data.slice(0, usersPerPage);
          startRank = 1;
          setUserRank(0);
        }
      } else {
        displayData = data.slice(0, usersPerPage);
        startRank = 1;
        setUserRank(0);
      }

      logger.debug(
        `📊 天梯數據載入完成：顯示 ${displayData.length} 名用戶，用戶排名：第 ${actualUserRank} 名，起始排名：第 ${startRank} 名`
      );

      setDisplayStartRank(startRank);
      setLadderData(displayData);
      hasDataRef.current = displayData.length > 0;
      setError(null);
    } catch (err) {
      logger.error('載入天梯數據失敗:', err);
      setError(err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [
    selectedAgeGroup,
    selectedTab,
    selectedDivision,
    filterGender,
    filterAge,
    filterWeight,
    filterJob,
    filterProject,
    userData,
    currentPage,
    ladderData.length,
    buildQuery,
    t,
  ]);

  /**
   * Refresh data (for pull-to-refresh)
   */
  const refresh = useCallback(() => {
    forceReloadRef.current = true;
    lastLoadParamsRef.current = null;
    loadLadderData();
  }, [loadLadderData]);

  /**
   * Load more data (for pagination)
   */
  const loadMore = useCallback(() => {
    const totalPages = Math.ceil(totalUsers / usersPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalUsers, usersPerPage]);

  /**
   * Toggle like for a user
   */
  const toggleLike = useCallback(
    async userId => {
      if (!auth.currentUser) {
        return;
      }

      if (likeProcessing.has(userId)) {
        return;
      }

      const isLiked = likedUsers.has(userId);

      // Optimistic update
      setLikedUsers(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(userId);
        } else {
          newSet.add(userId);
        }
        return newSet;
      });

      setLadderData(prevData =>
        prevData.map(user =>
          user.id === userId
            ? {
                ...user,
                ladderLikeCount: isLiked
                  ? Math.max((user.ladderLikeCount || 0) - 1, 0)
                  : (user.ladderLikeCount || 0) + 1,
              }
            : user
        )
      );

      setLikeProcessing(prev => new Set(prev).add(userId));

      try {
        const result = isLiked
          ? await LadderLikeSystem.unlikeUser(userId)
          : await LadderLikeSystem.likeUser(userId);

        if (!result.success) {
          // Rollback optimistic update
          setLikedUsers(prev => {
            const newSet = new Set(prev);
            if (isLiked) {
              newSet.add(userId);
            } else {
              newSet.delete(userId);
            }
            return newSet;
          });

          setLadderData(prevData =>
            prevData.map(user =>
              user.id === userId
                ? {
                    ...user,
                    ladderLikeCount: isLiked
                      ? (user.ladderLikeCount || 0) + 1
                      : Math.max((user.ladderLikeCount || 0) - 1, 0),
                  }
                : user
            )
          );
        }
      } catch (err) {
        logger.error('點讚操作失敗:', err);
        // Rollback
        setLikedUsers(prev => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });

        setLadderData(prevData =>
          prevData.map(user =>
            user.id === userId
              ? {
                  ...user,
                  ladderLikeCount: isLiked
                    ? (user.ladderLikeCount || 0) + 1
                    : Math.max((user.ladderLikeCount || 0) - 1, 0),
                }
              : user
          )
        );
      } finally {
        setLikeProcessing(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    },
    [likedUsers, likeProcessing]
  );

  /**
   * Load like status for displayed users
   */
  useEffect(() => {
    if (!auth.currentUser || ladderData.length === 0) return;

    const loadLikeStatus = async () => {
      const likedSet = new Set();
      for (const user of ladderData) {
        if (user.id === auth.currentUser.uid) continue;
        try {
          const isLiked = await LadderLikeSystem.checkIfLiked(user.id);
          if (isLiked) {
            likedSet.add(user.id);
          }
        } catch (err) {
          logger.error(`檢查用戶 ${user.id} 點讚狀態失敗:`, err);
        }
      }
      setLikedUsers(likedSet);
    };

    loadLikeStatus();
  }, [ladderData]);

  /**
   * Initial load and reload on filter changes
   */
  useEffect(() => {
    if (userData) {
      setLadderData([]);
      setLoading(true);
      setCurrentPage(1);
      hasInitialPageSetRef.current = false;
      hasDataRef.current = false;
    }
  }, [
    selectedAgeGroup,
    selectedTab,
    selectedDivision,
    filterGender,
    filterAge,
    filterHeight,
    filterWeight,
    filterJob,
    filterProject,
    userData,
  ]);

  useEffect(() => {
    if (userData) {
      loadLadderData();
    }
  }, [userData, selectedAgeGroup, selectedTab, currentPage, loadLadderData]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalUsers / usersPerPage);
  }, [totalUsers, usersPerPage]);

  // ⚡️ REAL-TIME VISUAL SYNC: Update existing list items immediately when context changes
  // This handles the gap between "Context Update" and "Network Fetch completion"
  useEffect(() => {
    if (!userData || ladderData.length === 0) return;

    setLadderData(prev => {
      const uid = userData.userId || auth.currentUser?.uid;
      const idx = prev.findIndex(u => u.id === uid);
      if (idx === -1) return prev;

      // Create a merged user object using latest context data
      const updatedUser = {
        ...prev[idx],
        ...userData,
        scores: userData.scores,
        ladderScore: userData.ladderScore,
      };

      // Prevent unnecessary renders if data matches
      if (
        JSON.stringify(prev[idx].scores) ===
          JSON.stringify(updatedUser.scores) &&
        prev[idx].ladderScore === updatedUser.ladderScore
      ) {
        return prev;
      }

      const newList = [...prev];
      newList[idx] = updatedUser;
      return newList;
    });
  }, [userData, ladderData.length]); // Dependencies ensure this runs on updates

  return {
    // State
    ladderData,
    userRank,
    loading,
    error,
    selectedAgeGroup,
    selectedTab,
    selectedDivision,
    currentPage,
    totalPages,
    totalUsers,
    displayStartRank,
    likedUsers,
    likeProcessing,

    // Actions
    setSelectedAgeGroup,
    setSelectedTab,
    setSelectedDivision,
    setCurrentPage,
    refresh,
    loadMore,
    toggleLike,
    buildQuery, // Expose for future expansion
  };
};
