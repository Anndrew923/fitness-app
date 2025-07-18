import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from './UserContext';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { auth } from './firebase';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PropTypes from 'prop-types';
import {
  calculateLadderScore,
  getAgeGroup,
  validateNickname,
  generateNickname,
} from './utils';

import './userinfo.css';

const DEFAULT_SCORES = {
  strength: 0,
  explosivePower: 0,
  cardio: 0,
  muscleMass: 0,
  bodyFat: 0,
};

const GENDER_OPTIONS = ['male', 'female'];

// 新增：圖片壓縮工具
async function compressImage(
  file,
  maxSize = 300 * 1024,
  maxWidth = 192,
  maxHeight = 192
) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target.result;
    };
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        blob => {
          if (blob.size > maxSize) {
            // 再壓縮一次
            canvas.toBlob(
              blob2 => {
                resolve(blob2);
              },
              'image/jpeg',
              0.7
            );
          } else {
            resolve(blob);
          }
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function UserInfo({ testData, onLogout, clearTestData }) {
  const {
    userData,
    setUserData,
    saveUserData,
    saveHistory,
    loadUserData,
    isLoading,
  } = useUser();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const radarSectionRef = useRef(null);
  const testsSectionRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  const radarChartData = useMemo(() => {
    const scores = userData.scores || DEFAULT_SCORES;
    return [
      {
        name: '力量',
        value: scores.strength ? Number(scores.strength).toFixed(1) * 1 : 0,
        icon: '💪',
      },
      {
        name: '爆發力',
        value: scores.explosivePower
          ? Number(scores.explosivePower).toFixed(1) * 1
          : 0,
        icon: '⚡',
      },
      {
        name: '心肺耐力',
        value: scores.cardio ? Number(scores.cardio).toFixed(1) * 1 : 0,
        icon: '❤️',
      },
      {
        name: '骨骼肌肉量',
        value: scores.muscleMass ? Number(scores.muscleMass).toFixed(1) * 1 : 0,
        icon: '🥩',
      },
      {
        name: 'FFMI',
        value: scores.bodyFat ? Number(scores.bodyFat).toFixed(1) * 1 : 0,
        icon: '📊',
      },
    ];
  }, [userData.scores]);

  const isGuest = sessionStorage.getItem('guestMode') === 'true';

  // 自定義軸標籤組件
  const CustomAxisTick = ({ payload, x, y, textAnchor }) => {
    const data = radarChartData.find(item => item.name === payload.value);

    // 計算調整後的位置 - 使用相對偏移而不是固定像素值
    let adjustedX = x;
    let adjustedY = y;

    // 計算從中心到當前點的距離，用於相對偏移
    const distance = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);

    // 力量標籤特殊處理：移到正上方
    if (payload.value === '力量') {
      // 使用相對位置，保持在正上方
      adjustedX = x; // 保持原始x位置
      adjustedY = y - distance * 0.12; // 使用距離的12%作為向上偏移
    } else if (payload.value === '爆發力') {
      // 爆發力標籤特殊處理：減少偏移，讓標籤更靠近雷達圖
      adjustedX = x + Math.cos(angle) * (distance * 0.05); // 減少偏移到5%
      adjustedY = y + Math.sin(angle) * (distance * 0.08);
    } else if (payload.value === 'FFMI') {
      // FFMI標籤特殊處理：調整到與爆發力相同高度
      adjustedX = x + Math.cos(angle) * (distance * 0.15); // 保持向左偏移
      adjustedY = y + Math.sin(angle) * (distance * 0.08); // 調整到與爆發力相同高度
    } else if (payload.value === '心肺耐力' || payload.value === '骨骼肌肉量') {
      // 心肺耐力和骨骼肌肉量：調整到相同高度
      adjustedX = x + Math.cos(angle) * (distance * 0.08); // 減少偏移
      adjustedY = y + Math.sin(angle) * (distance * 0.08); // 調整到與爆發力相同高度
    } else {
      // 其他標籤增加小幅偏移，避免重疊雷達圖
      adjustedX = x + Math.cos(angle) * (distance * 0.1); // 使用距離的10%作為偏移
      adjustedY = y + Math.sin(angle) * (distance * 0.1);
    }

    return (
      <g transform={`translate(${adjustedX},${adjustedY})`}>
        {/* 圖標背景圓圈 - 更精緻的設計 */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* 外圈光暈 */}
        <circle
          cx={0}
          cy={0}
          r={16}
          fill="rgba(129, 216, 208, 0.1)"
          filter="url(#glow)"
        />
        {/* 主圓圈 */}
        <circle
          cx={0}
          cy={0}
          r={14}
          fill="rgba(255, 255, 255, 0.95)"
          stroke="rgba(129, 216, 208, 0.4)"
          strokeWidth={2}
          filter="drop-shadow(0 2px 4px rgba(129, 216, 208, 0.2))"
        />

        {/* 圖標 - 垂直排列上方 */}
        <text
          x={0}
          y={-8}
          textAnchor="middle"
          fill="#4a5568"
          fontSize="16"
          fontWeight="600"
          dominantBaseline="middle"
          filter="drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))"
        >
          {data?.icon}
        </text>
        {/* 標籤文字 - 垂直排列下方 */}
        <text
          x={0}
          y={12}
          textAnchor="middle"
          fill="#2d3748"
          fontSize="13"
          fontWeight="700"
          dominantBaseline="middle"
          filter="drop-shadow(0 1px 3px rgba(255, 255, 255, 0.9))"
        >
          {payload.value}
        </text>
      </g>
    );
  };
  // 監聽認證狀態
  useEffect(() => {
    if (!auth) {
      setError('無法初始化身份驗證，請檢查 Firebase 配置並稍後再試。');
      console.error('auth 未初始化');
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(user => {
      console.log('UserInfo - 認證狀態變更:', user?.email);
      setCurrentUser(user);
      if (!user && !isGuest) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate, isGuest]);

  // 確保資料載入完成
  useEffect(() => {
    const checkDataLoaded = async () => {
      if (currentUser && !dataLoaded && !isLoading) {
        console.log('UserInfo - 檢查資料載入狀態');

        // 如果資料為空，嘗試重新載入
        if (!userData.height && !userData.weight && !userData.age) {
          console.log('UserInfo - 資料為空，嘗試重新載入');
          await loadUserData();
        }

        setDataLoaded(true);
      }
    };

    checkDataLoaded();
  }, [currentUser, dataLoaded, isLoading, userData, loadUserData]);

  // 處理從評測頁面返回時自動滾動到雷達圖
  useEffect(() => {
    // 檢查是否從評測頁面返回
    const fromTestPages = [
      '/strength',
      '/explosive-power',
      '/cardio',
      '/muscle-mass',
      '/body-fat',
    ];
    const previousPath = location.state?.from;

    if (previousPath && fromTestPages.includes(previousPath)) {
      // 延遲執行以確保頁面完全載入
      setTimeout(() => {
        if (radarSectionRef.current) {
          radarSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 300);
    }

    // 新增：根據 state.scrollTo 滾動
    const scrollTo = location.state?.scrollTo;
    if (scrollTo) {
      setTimeout(() => {
        if (scrollTo === 'radar' && radarSectionRef.current) {
          radarSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        } else if (scrollTo === 'tests' && testsSectionRef.current) {
          testsSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 300);
    }
  }, [location]);

  // 處理 testData 更新
  useEffect(() => {
    if (testData && Object.keys(testData).length > 0) {
      console.log('收到測試數據:', testData);

      // 使用 setUserData 更新分數
      setUserData(prev => {
        const updatedScores = {
          ...prev.scores,
          ...(testData.distance !== undefined && {
            cardio: testData.score || 0,
          }),
          ...(testData.squat !== undefined && {
            strength: testData.averageScore || 0,
          }),
          ...(testData.jumpHeight !== undefined && {
            explosivePower: testData.finalScore || 0,
          }),
          ...(testData.smm !== undefined && {
            muscleMass: testData.finalScore || 0,
          }),
          ...(testData.bodyFat !== undefined && {
            bodyFat: testData.ffmiScore || 0,
          }),
        };

        return {
          ...prev,
          scores: updatedScores,
          lastActive: new Date().toISOString(),
        };
      });

      // 清除 testData
      if (clearTestData) {
        setTimeout(clearTestData, 1000);
      }
    }
  }, [testData, setUserData, clearTestData]);

  const validateData = useCallback(() => {
    const { height, weight, age, gender } = userData;
    if (!height || !weight || !age || !gender) {
      setError('請填寫所有欄位');
      return false;
    }
    if (height <= 0 || weight <= 0 || age <= 0) {
      setError('身高、體重和年齡必須大於 0');
      return false;
    }
    if (!GENDER_OPTIONS.includes(gender)) {
      setError('請選擇有效的性別');
      return false;
    }
    return true;
  }, [userData]);

  const saveData = useCallback(
    async e => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      if (!validateData()) {
        setLoading(false);
        return;
      }

      const updatedUserData = {
        ...userData,
        height: Number(userData.height) || 0,
        weight: Number(userData.weight) || 0,
        age: Number(userData.age) || 0,
        gender: userData.gender,
        scores: userData.scores || DEFAULT_SCORES,
        lastActive: new Date().toISOString(),
      };

      try {
        const success = await saveUserData(updatedUserData);
        if (success) {
          alert('資料已儲存成功！');
        } else {
          // 僅登入用戶才顯示錯誤，訪客模式不顯示
          if (!isGuest) {
            setError('儲存失敗，請稍後再試');
          }
        }
      } catch (err) {
        if (!isGuest) {
          setError(`儲存失敗：${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    },
    [userData, validateData, saveUserData, isGuest]
  );

  const averageScore = useMemo(() => {
    const scores = userData?.scores || DEFAULT_SCORES;
    const scoreValues = Object.values(scores).filter(score => score > 0);
    const avg = scoreValues.length
      ? (
          scoreValues.reduce((sum, score) => sum + Number(score), 0) /
          scoreValues.length
        ).toFixed(1)
      : 0;
    return avg;
  }, [userData?.scores]);

  // 計算天梯分數
  const ladderScore = useMemo(() => {
    const scores = userData?.scores || DEFAULT_SCORES;
    return calculateLadderScore(scores);
  }, [userData?.scores]);

  // 計算年齡段
  const ageGroup = useMemo(() => {
    return userData?.age ? getAgeGroup(userData.age) : '';
  }, [userData?.age]);

  // 處理暱稱變更
  const handleNicknameChange = e => {
    const nickname = e.target.value;

    // 允許自由輸入，不進行即時驗證
    setUserData(prev => ({
      ...prev,
      nickname: nickname,
      ageGroup: ageGroup,
      ladderScore: ladderScore,
    }));
  };

  // 生成預設暱稱
  const handleGenerateNickname = () => {
    const email = auth.currentUser?.email;
    const generatedNickname = generateNickname(email);
    setUserData(prev => ({
      ...prev,
      nickname: generatedNickname,
    }));
  };

  const handleSaveResults = useCallback(() => {
    if (!auth.currentUser) {
      setError('請先登入以儲存結果');
      return;
    }
    const record = {
      date: new Date().toLocaleDateString('zh-TW'),
      scores: userData.scores,
      averageScore: averageScore,
    };
    saveHistory(record);
    alert('結果已儲存');
  }, [userData.scores, averageScore, saveHistory]);

  const handleNavigation = useCallback(
    async path => {
      if (
        !userData.height ||
        !userData.weight ||
        !userData.age ||
        !userData.gender
      ) {
        setError('請先填寫並儲存您的身高、體重、年齡和性別！');
        return;
      }

      if (validateData()) {
        // 傳遞當前路徑作為狀態，以便返回時知道從哪裡來
        navigate(path, { state: { from: '/user-info' } });
      } else {
        setError('請確保資料已正確保存後再進行評測！');
      }
    },
    [userData, validateData, navigate]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('savedPassword');

    if (auth.currentUser) {
      auth.signOut().catch(err => console.error('登出失敗:', err));
    }

    onLogout();
    navigate('/login');
  }, [onLogout, navigate]);

  // 處理輸入變更
  const handleInputChange = useCallback(
    e => {
      const { name, value } = e.target;
      let processedValue = value;

      // 處理不同類型的欄位
      if (name === 'gender') {
        // 性別欄位保持字符串
        processedValue = value;
      } else if (['profession'].includes(name)) {
        // 職業欄位保持字符串
        processedValue = value;
      } else if (['weeklyTrainingHours', 'trainingYears'].includes(name)) {
        // 訓練相關數字欄位
        processedValue = value === '' ? '' : Number(value);
      } else {
        // 其他數字欄位
        processedValue = value === '' ? 0 : Number(value);
      }

      setUserData(prev => ({
        ...prev,
        [name]: processedValue,
      }));
    },
    [setUserData]
  );

  // 新增：頭像上傳處理
  const handleAvatarChange = async e => {
    setAvatarError(null);
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('請選擇圖片檔案');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('圖片大小請勿超過 2MB');
      return;
    }
    setAvatarUploading(true);
    try {
      // 壓縮圖片
      const compressed = await compressImage(file, 300 * 1024, 192, 192);
      if (compressed.size > 350 * 1024) {
        setAvatarError('壓縮後圖片仍超過 350KB，請選擇更小的圖片');
        setAvatarUploading(false);
        return;
      }
      // 上傳到 Storage
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('未登入，無法上傳頭像');
      const avatarRef = ref(storage, `avatars/${userId}/avatar.jpg`);
      await uploadBytes(avatarRef, compressed, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(avatarRef);
      // 更新 Firestore
      setUserData(prev => ({ ...prev, avatarUrl: url }));
      await saveUserData({ ...userData, avatarUrl: url });
    } catch (err) {
      setAvatarError('頭像上傳失敗: ' + err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  // 顯示載入中狀態
  if (isLoading && !dataLoaded) {
    return (
      <div className="user-info-container">
        <div className="loading-message">
          <p>正在載入用戶資料...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-info-container">
      {error && <p className="error-message">{error}</p>}

      {/* 頭像區域 - 美化設計 */}
      <div className="avatar-section">
        <div className="avatar-container">
          <img
            src={userData?.avatarUrl || '/logo192.png'}
            alt="頭像"
            className="user-avatar"
          />
        </div>

        <div className="avatar-actions-container">
          <label className="avatar-upload-label">
            {avatarUploading ? '上傳中...' : '更換頭像'}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
              disabled={avatarUploading}
            />
          </label>
        </div>

        {avatarError && <div className="avatar-error">{avatarError}</div>}
      </div>

      {/* 只保留 currentUser 狀態區塊，移除載入提示 */}
      {(currentUser || isGuest) && (
        <>
          <div className="page-header">
            <h1 className="page-title">身體狀態與表現總覽</h1>
            <div className="page-subtitle">完善您的個人資料，開始健身之旅</div>
          </div>

          <div className="form-card">
            <form className="user-form" onSubmit={saveData}>
              <div className="form-section">
                <div className="section-header">
                  <h3 className="section-title">基本資料</h3>
                  {currentUser && (
                    <button
                      type="button"
                      onClick={handleLogout}
                      title="登出"
                      className="logout-btn"
                      onMouseEnter={e => {
                        const tooltip = document.createElement('div');
                        tooltip.innerText = '登出';
                        tooltip.style.position = 'absolute';
                        tooltip.style.bottom = '44px';
                        tooltip.style.left = '50%';
                        tooltip.style.transform = 'translateX(-50%)';
                        tooltip.style.background = 'rgba(60,60,60,0.95)';
                        tooltip.style.color = '#fff';
                        tooltip.style.padding = '6px 14px';
                        tooltip.style.borderRadius = '6px';
                        tooltip.style.fontSize = '13px';
                        tooltip.style.whiteSpace = 'nowrap';
                        tooltip.style.pointerEvents = 'none';
                        tooltip.style.zIndex = '1001';
                        tooltip.className = 'logout-tooltip';
                        e.currentTarget.parentNode.appendChild(tooltip);
                      }}
                      onMouseLeave={e => {
                        const tooltip =
                          e.currentTarget.parentNode.querySelector(
                            '.logout-tooltip'
                          );
                        if (tooltip) tooltip.remove();
                      }}
                    >
                      <span className="logout-icon">⎋</span>
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="nickname" className="form-label">
                    暱稱
                  </label>
                  <div className="nickname-input-group">
                    <input
                      id="nickname"
                      name="nickname"
                      type="text"
                      value={userData?.nickname || ''}
                      onChange={handleNicknameChange}
                      placeholder="請輸入暱稱"
                      className="form-input"
                      maxLength="20"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateNickname}
                      className="generate-nickname-btn"
                    >
                      生成暱稱
                    </button>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="gender" className="form-label">
                      性別
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={userData?.gender || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="">請選擇性別</option>
                      <option value="male">男性</option>
                      <option value="female">女性</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="age" className="form-label">
                      年齡
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      value={userData?.age || ''}
                      onChange={handleInputChange}
                      placeholder="年齡"
                      className="form-input"
                      required
                      min="0"
                      step="1"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="height" className="form-label">
                      身高 (cm)
                    </label>
                    <input
                      id="height"
                      name="height"
                      type="number"
                      value={userData?.height || ''}
                      onChange={handleInputChange}
                      placeholder="身高 (cm)"
                      className="form-input"
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="weight" className="form-label">
                      體重 (kg)
                    </label>
                    <input
                      id="weight"
                      name="weight"
                      type="number"
                      value={userData?.weight || ''}
                      onChange={handleInputChange}
                      placeholder="體重 (kg)"
                      className="form-input"
                      required
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* 天梯隱私設置 */}
              <div className="form-section">
                <h3 className="section-title">🏆 天梯排行榜設置</h3>
                <div className="privacy-options">
                  <label className="privacy-option">
                    <input
                      type="checkbox"
                      checked={userData.isAnonymousInLadder === true}
                      onChange={e =>
                        setUserData(prev => ({
                          ...prev,
                          isAnonymousInLadder: e.target.checked,
                        }))
                      }
                    />
                    <div className="privacy-option-content">
                      <span className="privacy-option-title">
                        匿名參與天梯排名
                      </span>
                      <span className="privacy-option-desc">
                        勾選後將隱藏您的暱稱和頭像，以匿名方式顯示在排行榜中
                      </span>
                    </div>
                  </label>
                </div>

                {/* 訓練背景信息（選填） */}
                <div className="training-info-section">
                  <h4 className="training-info-title">💪 訓練背景（選填）</h4>
                  <p className="training-info-desc">
                    分享您的訓練背景，激勵其他健身愛好者！
                  </p>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="profession" className="form-label">
                        職業
                      </label>
                      <input
                        id="profession"
                        name="profession"
                        type="text"
                        value={userData?.profession || ''}
                        onChange={handleInputChange}
                        placeholder="例如：工程師、學生、教師..."
                        className="form-input"
                        maxLength="100"
                      />
                    </div>

                    <div className="form-group">
                      <label
                        htmlFor="weeklyTrainingHours"
                        className="form-label"
                      >
                        每周訓練時數
                      </label>
                      <input
                        id="weeklyTrainingHours"
                        name="weeklyTrainingHours"
                        type="number"
                        value={userData?.weeklyTrainingHours || ''}
                        onChange={handleInputChange}
                        placeholder="小時"
                        className="form-input"
                        min="0"
                        max="168"
                        step="0.5"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="trainingYears" className="form-label">
                      訓練年資
                    </label>
                    <input
                      id="trainingYears"
                      name="trainingYears"
                      type="number"
                      value={userData?.trainingYears || ''}
                      onChange={handleInputChange}
                      placeholder="年"
                      className="form-input"
                      min="0"
                      max="50"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? '儲存中...' : '儲存資料'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* 雷達圖區域 */}
      <div id="radar-section" className="radar-section" ref={radarSectionRef}>
        <div className="radar-card">
          {/* 裝飾性角落元素 */}
          <div className="corner-decoration top-left"></div>
          <div className="corner-decoration top-right"></div>
          <div className="corner-decoration bottom-left"></div>
          <div className="corner-decoration bottom-right"></div>

          <h2 className="radar-title">表現總覽</h2>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>正在載入數據...</p>
            </div>
          ) : (
            <div className="radar-chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarChartData}>
                  <PolarGrid
                    gridType="polygon"
                    stroke="rgba(129, 216, 208, 0.25)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={<CustomAxisTick />}
                    axisLine={false}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tickCount={5}
                    tick={{
                      fontSize: 12,
                      fill: '#2d3748',
                      fontWeight: 600,
                    }}
                    axisLine={false}
                  />
                  <Radar
                    name="您的表現"
                    dataKey="value"
                    stroke="#81D8D0"
                    fill="url(#tiffanyGradient)"
                    fillOpacity={0.8}
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient
                      id="tiffanyGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#81D8D0" stopOpacity={0.9} />
                      <stop
                        offset="50%"
                        stopColor="#5F9EA0"
                        stopOpacity={0.7}
                      />
                      <stop
                        offset="100%"
                        stopColor="#81D8D0"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 平均分數區域 - 移到雷達圖卡片內 */}
          {averageScore > 0 && !loading && (
            <div className="score-section">
              <p className="average-score">
                平均分數: <span className="score-value">{averageScore}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 評測頁面導航 */}
      <div className="test-buttons-section" ref={testsSectionRef}>
        <h3 className="section-title">開始評測</h3>
        <div className="test-buttons-grid">
          <button
            onClick={() => handleNavigation('/strength')}
            className="test-btn strength-btn"
          >
            <span className="test-icon">💪</span>
            <span className="test-label">力量評測</span>
          </button>
          <button
            onClick={() => handleNavigation('/explosive-power')}
            className="test-btn explosive-btn"
          >
            <span className="test-icon">⚡</span>
            <span className="test-label">爆發力測試</span>
          </button>
          <button
            onClick={() => handleNavigation('/cardio')}
            className="test-btn cardio-btn"
          >
            <span className="test-icon">❤️</span>
            <span className="test-label">心肺耐力測試</span>
          </button>
          <button
            onClick={() => handleNavigation('/muscle-mass')}
            className="test-btn muscle-btn"
          >
            <span className="test-icon">🥩</span>
            <span className="test-label">骨骼肌肉量</span>
          </button>
          <button
            onClick={() => handleNavigation('/body-fat')}
            className="test-btn bodyfat-btn"
          >
            <span className="test-icon">📊</span>
            <span className="test-label">體脂肪率與FFMI</span>
          </button>
        </div>
      </div>
    </div>
  );
}

UserInfo.propTypes = {
  testData: PropTypes.shape({
    distance: PropTypes.number,
    score: PropTypes.number,
    squat: PropTypes.number,
    averageScore: PropTypes.number,
    jumpHeight: PropTypes.number,
    finalScore: PropTypes.number,
    smm: PropTypes.number,
    bodyFat: PropTypes.number,
    ffmiScore: PropTypes.number,
  }),
  onLogout: PropTypes.func.isRequired,
  clearTestData: PropTypes.func.isRequired,
};

export default UserInfo;
