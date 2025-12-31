import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import * as standards from './standards';
import PropTypes from 'prop-types';
import './Cardio.css';
import { useTranslation } from 'react-i18next';
import BottomNavBar from './components/BottomNavBar';
import AdBanner from './components/AdBanner';
import GeneralModal from './components/UserInfo/Modals/GeneralModal';
import HonorUnlockModal from './components/shared/modals/HonorUnlockModal';

function Cardio({ onComplete }) {
  const { userData, setUserData, saveUserData } = useUser();
  const navigate = useNavigate();
  const { age, gender } = userData;
  const isVerified = userData.isVerified === true;
  const { t } = useTranslation();

  // --- State Management ---
  const [activeTab, setActiveTab] = useState('cooper');
  // Cooper Inputs
  const [distance, setDistance] = useState(userData.testInputs?.cardio?.distance || '');
  // 5KM Inputs
  const [runMinutes, setRunMinutes] = useState('');
  const [runSeconds, setRunSeconds] = useState('');

  const [score, setScore] = useState(null);
  const [rawScore, setRawScore] = useState(null);
  const [isCapped, setIsCapped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockModalData, setUnlockModalData] = useState(null);

  // Reset score on tab switch
  useEffect(() => {
    setScore(null);
    setRawScore(null);
    setIsCapped(false);
  }, [activeTab]);

  // Persistence Effects
  useEffect(() => {
    if (activeTab === 'cooper' && distance) {
      // ✅ 添加条件检查：只在值真正改变时才更新
      const currentDistance = userData.testInputs?.cardio?.distance;
      if (currentDistance !== Number(distance)) {
        setUserData(prev => {
          // ✅ 使用函数式更新，避免依赖 userData
          const updated = { 
            ...prev.testInputs, 
            cardio: { 
              ...prev.testInputs?.cardio, 
              distance: Number(distance) 
            } 
          };
          return { ...prev, testInputs: updated };
        });
      }
    }
  }, [distance, activeTab]); // ✅ 移除 setUserData 依赖

  useEffect(() => {
    if (activeTab === '5km' && (runMinutes || runSeconds)) {
      // ✅ 添加条件检查：只在值真正改变时才更新
      const currentMinutes = userData.testInputs?.run_5km?.minutes;
      const currentSeconds = userData.testInputs?.run_5km?.seconds;
      const newMinutes = Number(runMinutes) || 0;
      const newSeconds = Number(runSeconds) || 0;
      
      if (currentMinutes !== newMinutes || currentSeconds !== newSeconds) {
        setUserData(prev => {
          // ✅ 使用函数式更新，避免依赖 userData
          const updated = { 
            ...prev.testInputs, 
            run_5km: { 
              minutes: newMinutes, 
              seconds: newSeconds 
            } 
          };
          return { ...prev, testInputs: updated };
        });
      }
    }
  }, [runMinutes, runSeconds, activeTab]); // ✅ 移除 setUserData 依赖

  // Load 5KM Data
  useEffect(() => {
    if (userData.testInputs?.run_5km) {
      setRunMinutes(userData.testInputs.run_5km.minutes || '');
      setRunSeconds(userData.testInputs.run_5km.seconds || '');
    }
  }, [userData.testInputs?.run_5km]);

  // --- Logic Helpers ---
  const getAgeRange = age => {
    if (!age) return null;
    const ageNum = parseInt(age);
    if (ageNum >= 13 && ageNum <= 14) return '13-14';
    if (ageNum >= 15 && ageNum <= 16) return '15-16';
    if (ageNum >= 17 && ageNum <= 20) return '17-20';
    if (ageNum >= 20 && ageNum <= 29) return '20-29';
    if (ageNum >= 30 && ageNum <= 39) return '30-39';
    if (ageNum >= 40 && ageNum <= 49) return '40-49';
    if (ageNum >= 50) return '50+';
    return null;
  };

  // Cooper: Limit Break Enabled (Linear Slope)
  const calculateScoreFromStandard = (value, standard) => {
    const min = standard[60];
    const max = standard[100];
    if (value <= 0) return 0;
    // Calculate slope for linear extension beyond 100
    const slope = 40 / (max - min);
    const calculatedScore = 60 + (value - min) * slope;
    return parseFloat(calculatedScore.toFixed(2));
  };

  // 5KM: Benchmark 20min = 100pts
  const calculate5KmScoreLogic = (totalSeconds) => {
    const benchmarkSeconds = 20 * 60; // 1200s
    const baselineSeconds = 45 * 60;  // 2700s

    // God Tier
    if (totalSeconds <= benchmarkSeconds) {
      const bonus = (benchmarkSeconds - totalSeconds) / 10;
      return parseFloat((100 + bonus).toFixed(2));
    }
    // Normal Tier
    if (totalSeconds >= baselineSeconds) return 0;
    const range = baselineSeconds - benchmarkSeconds;
    const diff = totalSeconds - benchmarkSeconds;
    const calculatedScore = 100 - (diff / range) * 100;
    return parseFloat(calculatedScore.toFixed(2));
  };

  const getComment = (score, gender) => {
    const genderValue =
      gender === '男性' || `${gender}`.toLowerCase() === 'male'
        ? 'male'
        : 'female';
    const bucket = Math.min(100, Math.max(0, Math.floor(score / 10) * 10));
    const key = `tests.cardioComments.${genderValue}.r${bucket}`;
    const fallback = t('tests.cardioComments.default');
    const msg = t(key);
    return msg === key ? fallback : msg;
  };

  const getLevelFromScore = (scoreNum) => {
    if (scoreNum >= 100) return 'legend';
    if (scoreNum >= 90) return 'apex';
    if (scoreNum >= 80) return 'elite';
    if (scoreNum >= 60) return 'steel';
    if (scoreNum >= 40) return 'growth';
    return 'potential';
  };

  // Calculation Handler
  // 🔥 Civilian Limiter: UI 顯示真實分數 (rawScore)，永遠不在 UI 端 cap
  const handleCalculate = () => {
    if (!age || !gender) {
      alert(t('tests.cardioErrors.missingPrerequisites'));
      return;
    }

    if (activeTab === 'cooper') {
      if (!distance) { alert(t('tests.cardioErrors.invalidInputs')); return; }
      const ageRange = getAgeRange(age);
      if (!ageRange) { alert(t('tests.cardioErrors.invalidInputs')); return; }
      
      const genderVal = gender === '男性' || gender.toLowerCase() === 'male' ? 'male' : 'female';
      const standardsObj = genderVal === 'male' ? standards.cooperStandardsMale : standards.cooperStandardsFemale;
      const standard = standardsObj[ageRange];

      if (!standard) { alert(t('tests.cardioErrors.standardsNotFound')); return; }
      
      const calculatedScore = calculateScoreFromStandard(parseFloat(distance), standard);
      
      // 🔥 Civilian Limiter: UI 顯示真實分數
      const formattedRawScore = parseFloat(Number(calculatedScore).toFixed(2));
      const capped = !isVerified && calculatedScore > 100;
      
      setRawScore(formattedRawScore);
      setScore(formattedRawScore); // 🔥 UI 顯示 rawScore，不 cap
      setIsCapped(capped);

    } else if (activeTab === '5km') {
      const m = parseInt(runMinutes || 0);
      const s = parseInt(runSeconds || 0);
      if (!runMinutes && !runSeconds) { alert(t('tests.cardioErrors.invalidInputs')); return; }
      const totalSec = (m * 60) + s;
      if (totalSec <= 0) { alert(t('tests.cardioErrors.invalidInputs')); return; }
      
      const calculatedScore = calculate5KmScoreLogic(totalSec);
      
      // 🔥 Civilian Limiter: UI 顯示真實分數
      const formattedRawScore = parseFloat(Number(calculatedScore).toFixed(2));
      const capped = !isVerified && calculatedScore > 100;
      
      setRawScore(formattedRawScore);
      setScore(formattedRawScore); // 🔥 UI 顯示 rawScore，不 cap
      setIsCapped(capped);
    }
  };

  // Handle unlock button click
  const handleUnlockClick = () => {
    const testName = activeTab === 'cooper' 
      ? t('tests.cardioTabs.cooper')
      : t('tests.cardioTabs.run5km');
    const level = getLevelFromScore(rawScore || score);
    setUnlockModalData({
      exercise: testName,
      score: rawScore || score,
      level: level,
      weight: null,
    });
    setIsUnlockModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    // 1. BLOCK ALL DEFAULT EVENTS
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 2. Validate current tab's score
    if (score === null || score === undefined || score === '') {
      alert(t('tests.cardioErrors.needCalculate'));
      return;
    }

    const isGuest = sessionStorage.getItem('guestMode') === 'true';
    setSubmitting(true);

    try {
      // 3. Prepare Data
      // Deep copy to avoid reference issues
      const updatedScores = JSON.parse(JSON.stringify(userData.scores || {}));
      const updatedTestInputs = JSON.parse(JSON.stringify(userData.testInputs || {}));

      // 🔥 Civilian Limiter: 提交時，未驗證用戶分數鎖死 100
      const currentRawScore = rawScore !== null ? rawScore : score;
      const scoreToSave = (!isVerified && currentRawScore > 100) ? 100 : currentRawScore;
      const scoreToSaveFormatted = parseFloat(Number(scoreToSave).toFixed(2));

      if (activeTab === 'cooper') {
        updatedScores.cardio = scoreToSaveFormatted;
        // Ensure distance is saved
        updatedTestInputs.cardio = { 
          ...(updatedTestInputs.cardio || {}), 
          distance: Number(distance) || 0 
        };
      } else {
        // 🔥 5KM Logic - 絕對禁止寫入 scores，只更新 record_5km
        // 計算總秒數和配速
        const totalSec = (parseInt(runMinutes || 0) * 60) + parseInt(runSeconds || 0);
        const paceInSeconds = totalSec > 0 ? Math.round(totalSec / 5) : 0; // 每公里秒數
        
        // 更新 testInputs（僅用於本地顯示）
        updatedTestInputs.run_5km = { 
          minutes: Number(runMinutes) || 0, 
          seconds: Number(runSeconds) || 0 
        };
        
        // ⚠️ 重要：不更新 updatedScores，5KM 數據完全獨立
      }

      // Recalculate Main Ladder Score (Core 5 / 5)
      const s_str = Number(updatedScores.strength) || 0;
      const s_exp = Number(updatedScores.explosive) || Number(updatedScores.power) || 0;
      const s_mus = Number(updatedScores.muscleMass) || 0;
      const s_fat = Number(updatedScores.bodyFat) || 0;
      const s_cardio = Number(updatedScores.cardio) || 0; // Cooper

      // STRICTLY divide by 5
      const currentRawTotal = (s_str + s_exp + s_mus + s_fat + s_cardio) / 5;

      // 1. Prepare Base Data
      let updatedUserData;

      if (activeTab === '5km') {
        // --- [Phase 3: Optimistic Context Update] ---
        // 🔥 關鍵修正：5KM 數據寫入 record_5km，絕對不碰 scores
        const totalSec = (parseInt(runMinutes || 0) * 60) + parseInt(runSeconds || 0);
        const paceInSeconds = totalSec > 0 ? Math.round(totalSec / 5) : 0;
        
        updatedUserData = {
          ...userData,
          // 🔥 1. 更新 record_5km（獨立欄位，不影響雷達圖）
          record_5km: {
            bestTime: totalSec,
            date: new Date().toISOString(),
            pace: paceInSeconds,
            location: userData.record_5km?.location || '',
            score: scoreToSaveFormatted, // 🔥 Civilian Limiter: 寫入鎖死分數
          },
          
          // 2. 保持原有 stats 欄位（用於排序，但不影響總分計算）
          stats_5k: totalSec,
          stats_5k_time: totalSec,
          stats_5k_score: scoreToSaveFormatted, // 🔥 Civilian Limiter
          
          // ⚠️ 3. 絕對禁止更新 scores（保持原值）
          scores: {
            ...userData.scores,
            // 不添加 run_5km，不更新 cardio
          },
          
          // 4. Update testInputs
          testInputs: updatedTestInputs,
          
          // 5. 不更新 ladderScore（5KM 不參與總排名）
          ladderScore: userData.ladderScore || 0,
          
          // 6. Force Activity Refresh
          lastActive: new Date().toISOString()
        };
      } else {
        // Cooper logic - 🔥 修正：只更新 scores.cardio，不更新 ladderScore
        updatedUserData = {
          ...userData,
          scores: updatedScores,
          testInputs: updatedTestInputs,
          // ⚠️ 不更新 ladderScore（天梯只在用戶主動點擊「更新排行榜」時才計算）
          ladderScore: userData.ladderScore || 0,
          
          // 保持原有 stats 欄位
          stats_5k: userData.stats_5k || 0,
          stats_5k_time: userData.stats_5k_time || 0,
          stats_cooper: Number(distance) || 0
        };
      }

      // 2. 🔥 CRITICAL FIX: 準備 Firestore Payload
      let firestoreUpdatePayload;
      
      if (activeTab === '5km') {
        // 🔥 5KM：只更新 record_5km 和 stats，不更新 scores
        const totalSec = (parseInt(runMinutes || 0) * 60) + parseInt(runSeconds || 0);
        const paceInSeconds = totalSec > 0 ? Math.round(totalSec / 5) : 0;
        
        firestoreUpdatePayload = {
          record_5km: {
            bestTime: totalSec,
            date: new Date().toISOString(),
            pace: paceInSeconds,
            location: userData.record_5km?.location || '',
            score: scoreToSaveFormatted, // 🔥 Civilian Limiter: 寫入鎖死分數
          },
          stats_5k: totalSec,
          stats_5k_time: totalSec,
          stats_5k_score: scoreToSaveFormatted, // 🔥 Civilian Limiter
          testInputs: updatedTestInputs,
          // ⚠️ 不更新 scores，不更新 ladderScore
          updatedAt: new Date().toISOString()
        };
      } else {
        // Cooper：🔥 只更新 scores.cardio，不更新 ladderScore
        firestoreUpdatePayload = {
          scores: updatedScores, // 🔥 只更新 scores 物件
          testInputs: updatedTestInputs,
          // ⚠️ 不更新 ladderScore（天梯只在用戶主動點擊「更新排行榜」時才計算）
          stats_cooper: Number(distance) || 0,
          updatedAt: new Date().toISOString()
        };
      }

      // 3. Save Context
      setUserData(updatedUserData);
      
      // 4. Save to Firestore (Merged)
      if (!isGuest) {
        const userId = userData.userId || auth.currentUser?.uid;
        if (userId) {
          const userRef = doc(db, 'users', userId);
          // We use setDoc with merge:true to ensure we write these specific stats fields
          await setDoc(userRef, firestoreUpdatePayload, { merge: true });
        }
        // Also call saveUserData for backward compatibility
        await saveUserData(updatedUserData);
      }

      // 6. Show Modal (DO NOT CALL onComplete HERE)
      // The parent's onComplete likely navigates away, killing the modal.
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Submit Failed:', error);
      if (!isGuest) alert(t('tests.cardioErrors.updateUserFail'));
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to display score with 2 decimal places strict
  const formatScore = (val) => {
    return Number(val).toFixed(2);
  };

  // --- Display Logic (Limit Break) ---
  const isLimitBroken = rawScore !== null && rawScore > 100;
  const displayScoreValue = score !== null ? score : 0;
  const formattedScore = formatScore(displayScoreValue);

  return (
    <div className="cardio-container">
      <h1 className="text-2xl font-bold text-center mb-4">{t('tests.cardioTitle')}</h1>
      <div className="cardio-tabs">
        <button className={`tab-btn ${activeTab === 'cooper' ? 'active' : ''}`} onClick={() => setActiveTab('cooper')}>
          {t('tests.cardioTabs.cooper')}
        </button>
        <button className={`tab-btn ${activeTab === '5km' ? 'active' : ''}`} onClick={() => setActiveTab('5km')}>
          {t('tests.cardioTabs.run5km')}
        </button>
      </div>

      <div className="input-section">
        <p>
          {t('common.ageLabel')}：{age || t('common.notEntered')}
        </p>
        <p>
          {t('common.genderLabel')}：{gender || t('common.notSelected')}
        </p>

        <div className="exercise-section">
          {activeTab === 'cooper' ? (
            <>
              <h2 className="text-lg font-semibold mb-2">
                {t('tests.cardioInfo.cooperTitle')}
              </h2>
              <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
                {t('tests.cardioLabels.distanceMeters')}
              </label>
              <input
                id="distance"
                type="number"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                className="input-field"
                placeholder="2400"
                required
              />
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-2 text-yellow-600">
                {t('tests.cardioTabs.run5km')} ⚡
              </h2>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('tests.cardioLabels.timeMin')}
                  </label>
                  <input
                    type="number"
                    value={runMinutes}
                    onChange={e => setRunMinutes(e.target.value)}
                    className="input-field"
                    placeholder="20"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('tests.cardioLabels.timeSec')}
                  </label>
                  <input
                    type="number"
                    value={runSeconds}
                    onChange={e => setRunSeconds(e.target.value)}
                    className="input-field"
                    placeholder="00"
                  />
                </div>
              </div>
            </>
          )}

          <button onClick={handleCalculate} className="calculate-btn">
            {t('common.calculate')}
          </button>

          {score !== null && (
            <>
              <p className="score-display" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span>
                  {activeTab === 'cooper' 
                    ? `${t('tests.cardioLabels.score')}: ${formattedScore}`
                    : `${t('tests.cardioLabels.run5kmScore')}: ${formattedScore}`
                  }
                </span>
                {/* 🔥 Civilian Limiter: 顯示鎖定警告 */}
                {isCapped && (
                  <span style={{ fontSize: '0.875rem' }}>🔒</span>
                )}
                {!isCapped && isLimitBroken && (
                  <span style={{ marginLeft: '8px', color: '#ef4444', fontWeight: '800', fontStyle: 'italic' }}>
                    🚀 LIMIT BREAK!
                  </span>
                )}
                {isCapped && (
                  <button
                    onClick={handleUnlockClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      width: 'fit-content',
                      background: 'rgba(0, 0, 0, 0.6)',
                      border: '1px solid rgba(234, 179, 8, 0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      color: 'white',
                      fontSize: '0.875rem',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                      e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.8)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                      e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.5)';
                    }}
                    title="點擊解鎖真實實力"
                  >
                    <span style={{ fontSize: '0.875rem' }}>🔒</span>
                    <span>{t('actions.unlock_limit')}</span>
                  </button>
                )}
              </p>
              {/* 🔥 Civilian Limiter: 顯示提示訊息 */}
              {isCapped && (
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: '#f59e0b', 
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ {t('tests.civilianLimiter.warning', '未驗證用戶提交時分數將鎖定為 100')}
                </p>
              )}
              <p className="score-display">
                {activeTab === 'cooper' ? getComment(rawScore || score, gender) : ((rawScore || score) >= 100 ? "🔥🔥🔥 UNGODLY PACE" : "Keep pushing for sub-20!")}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="description-section">
        <div className="description-card">
          <div
            className="description-header"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h2 className="text-lg font-semibold">
              {activeTab === 'cooper' 
                ? t('tests.cardioInfo.sectionTitle') 
                : t('tests.cardioInfo.run5kmTitle')
              }
            </h2>
            <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>
              {isExpanded ? '▲' : '▼'}
            </span>
          </div>
          {isExpanded && (
            <div className="description-content">
              {activeTab === 'cooper' ? (
                <>
                  <p className="font-semibold">{t('tests.cardioInfo.introTitle')}</p>
                  <p>{t('tests.cardioInfo.introText')}</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-yellow-600">ELITE CHALLENGE</p>
                  <p>{t('tests.cardioInfo.run5kmIntro')}</p>
                  <p className="mt-2 font-bold">{t('tests.cardioInfo.run5kmBenchmark')}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="button-group">
        <button
          type="button"
          onClick={handleSubmit}
          className="submit-btn"
          disabled={submitting}
        >
          {submitting ? t('common.submitting') : t('common.submitAndReturn')}
        </button>
      </div>

      {score !== null && (
        <div className="ad-section" style={{ margin: '20px 0', textAlign: 'center' }}>
          <AdBanner position="inline" isFixed={false} showAd={true} />
        </div>
      )}

      <div style={{ height: '160px', width: '100%' }} />
      <BottomNavBar />

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSuccessModal(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)', // Darker background for RPG feel
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)' // Add blur effect
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#1a202c', // Dark RPG card background
              borderRadius: '16px',
              padding: '32px 24px',
              width: '90%',
              maxWidth: '360px',
              textAlign: 'center',
              boxShadow: '0 0 25px rgba(255, 165, 0, 0.3)', // Golden glow
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))' }}>
              {activeTab === '5km' ? '🏆' : '⚔️'}
            </div>
            
            {/* RPG Title */}
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: '900', 
              color: '#fbbf24', // Gold text
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: 'sans-serif' 
            }}>
              {t('cardio.gamified.questComplete', 'QUEST COMPLETED')}
            </h3>
            
            {/* RPG Description */}
            <p style={{ color: '#cbd5e0', marginBottom: '32px', lineHeight: '1.6', fontSize: '15px' }}>
              {activeTab === '5km' 
                ? t('cardio.gamified.5km_desc', 'Your endurance feat has been inscribed in the Hall of Legends!')
                : t('cardio.gamified.cooper_desc', 'Combat data synced. Your tactical potential has increased.')
              }
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 5KM Button -> Ladder */}
              {activeTab === '5km' && (
                <button
                  onClick={() => { 
                      setShowSuccessModal(false); 
                      navigate('/ladder', { 
                        state: { 
                          targetTab: 'cardio', 
                          activeTab: 'cardio',
                          subTab: '5km',
                          filter: '5km',
                          scrollTo: 'top',
                          forceRefresh: true
                        } 
                      }); 
                  }}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)', // Amber Gold
                    color: 'white',
                    fontWeight: '800',
                    fontSize: '16px',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'transform 0.2s'
                  }}
                >
                  {t('cardio.gamified.view_rank', 'CLAIM GLORY')}
                </button>
              )}

              {/* Cooper Button -> User Info */}
              {activeTab === 'cooper' && (
                <button
                  onClick={() => { 
                    setShowSuccessModal(false); 
                    navigate('/user-info');
                  }}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)', // Royal Blue
                    color: 'white',
                    fontWeight: '800',
                    fontSize: '16px',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  {t('common.returnToProfile', 'CHECK STATS')}
                </button>
              )}
              
              {/* Cancel Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent',
                  color: '#a0aec0',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {t('cardio.gamified.stay', 'REST & RECOVER')}
              </button>
            </div>
          </div>
        </div>
      )}

      <HonorUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => {
          setIsUnlockModalOpen(false);
          setUnlockModalData(null);
        }}
        data={unlockModalData}
      />
    </div>
  );
}

Cardio.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default Cardio;
