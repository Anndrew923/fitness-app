import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
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
      const updated = { ...userData.testInputs, cardio: { ...userData.testInputs?.cardio, distance } };
      setUserData(prev => ({ ...prev, testInputs: updated }));
    }
  }, [distance, activeTab, setUserData, userData.testInputs]);

  useEffect(() => {
    if (activeTab === '5km' && (runMinutes || runSeconds)) {
      const updated = { ...userData.testInputs, run_5km: { minutes: runMinutes, seconds: runSeconds } };
      setUserData(prev => ({ ...prev, testInputs: updated }));
    }
  }, [runMinutes, runSeconds, activeTab, setUserData, userData.testInputs]);

  // Load 5KM Data
  useEffect(() => {
    if (userData.testInputs?.run_5km) {
      setRunMinutes(userData.testInputs.run_5km.minutes || '');
      setRunSeconds(userData.testInputs.run_5km.seconds || '');
    }
  }, [userData.testInputs?.run_5km]);

  // Recalculate score display when verification status changes
  useEffect(() => {
    if (rawScore !== null && rawScore > 100) {
      const verified = userData.isVerified === true;
      let displayScore = rawScore;
      let capped = false;

      if (rawScore > 100) {
        if (verified) {
          displayScore = rawScore;
        } else {
          displayScore = 100;
          capped = true;
        }
      }

      const formattedDisplayScore = parseFloat(Number(displayScore).toFixed(2));
      setScore(formattedDisplayScore);
      setIsCapped(capped);
    }
  }, [userData.isVerified, rawScore]);

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
      
      // Limit Break Logic
      let displayScore = calculatedScore;
      let capped = false;

      if (calculatedScore > 100) {
        if (isVerified) {
          displayScore = calculatedScore;
        } else {
          displayScore = 100;
          capped = true;
        }
      }

      const formattedRawScore = parseFloat(Number(calculatedScore).toFixed(2));
      const formattedDisplayScore = parseFloat(Number(displayScore).toFixed(2));
      
      setRawScore(formattedRawScore);
      setScore(formattedDisplayScore);
      setIsCapped(capped);

    } else if (activeTab === '5km') {
      const m = parseInt(runMinutes || 0);
      const s = parseInt(runSeconds || 0);
      if (!runMinutes && !runSeconds) { alert(t('tests.cardioErrors.invalidInputs')); return; }
      const totalSec = (m * 60) + s;
      if (totalSec <= 0) { alert(t('tests.cardioErrors.invalidInputs')); return; }
      
      const calculatedScore = calculate5KmScoreLogic(totalSec);
      
      // Limit Break Logic
      let displayScore = calculatedScore;
      let capped = false;

      if (calculatedScore > 100) {
        if (isVerified) {
          displayScore = calculatedScore;
        } else {
          displayScore = 100;
          capped = true;
        }
      }

      const formattedRawScore = parseFloat(Number(calculatedScore).toFixed(2));
      const formattedDisplayScore = parseFloat(Number(displayScore).toFixed(2));
      
      setRawScore(formattedRawScore);
      setScore(formattedDisplayScore);
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

      // Strict Formatting: Ensure Number
      let scoreValue = rawScore !== null ? rawScore : score;
      if (isNaN(scoreValue)) scoreValue = 0;
      
      const scoreToSaveFormatted = parseFloat(Number(scoreValue).toFixed(2));

      if (activeTab === 'cooper') {
        updatedScores.cardio = scoreToSaveFormatted;
        // Ensure distance is saved
        updatedTestInputs.cardio = { 
          ...(updatedTestInputs.cardio || {}), 
          distance: Number(distance) || 0 
        };
      } else {
        // 5KM Logic
        updatedScores.run_5km = scoreToSaveFormatted;
        updatedTestInputs.run_5km = { 
          minutes: Number(runMinutes) || 0, 
          seconds: Number(runSeconds) || 0 
        };
        
        // Compatibility: Calculate total seconds for ladder
        const totalSec = (parseInt(runMinutes || 0) * 60) + parseInt(runSeconds || 0);
        updatedTestInputs.cardio = {
          ...(updatedTestInputs.cardio || {}),
          time5k: totalSec,
        };
      }

      // Recalculate Main Ladder Score (Core 5 / 5)
      const s_str = Number(updatedScores.strength) || 0;
      const s_exp = Number(updatedScores.explosive) || Number(updatedScores.power) || 0;
      const s_mus = Number(updatedScores.muscleMass) || 0;
      const s_fat = Number(updatedScores.bodyFat) || 0;
      const s_cardio = Number(updatedScores.cardio) || 0; // Cooper

      // STRICTLY divide by 5
      const currentRawTotal = (s_str + s_exp + s_mus + s_fat + s_cardio) / 5;

      const updatedUserData = {
        ...userData,
        scores: updatedScores,
        testInputs: updatedTestInputs,
        ladderScore: parseFloat(currentRawTotal.toFixed(2)) // Save correct average
      };

      // 4. Save to Context
      setUserData(updatedUserData);
      
      // 5. Save to Backend (if not guest)
      if (!isGuest) {
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
            if (e.target === e.currentTarget) {
              setShowSuccessModal(false);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '340px',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>
              {activeTab === '5km' ? '🏆' : '✅'}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2d3748', marginBottom: '12px' }}>
              {t('tests.testComplete', '測驗完成')}
            </h3>
            
            {/* Dynamic Message */}
            <p style={{ color: '#4a5568', marginBottom: '24px', lineHeight: '1.5' }}>
              {activeTab === '5km' 
                ? t('cardio.success.5kmUploaded', '您的 5KM 成績已上傳至菁英榜！')
                : t('cardio.success.cooperSaved', '您的成績已更新至雷達圖！')
              }
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 5KM Button -> Ladder */}
              {activeTab === '5km' && (
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/ladder', { state: { targetTab: 'cardio', targetSubTab: '5km' } });
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    boxShadow: '0 4px 6px rgba(217, 119, 6, 0.3)',
                    cursor: 'pointer',
                  }}
                >
                  {t('cardio.success.viewRankings', '前往查看排名')}
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
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#5f9ea0',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  {t('common.returnToProfile', '返回個人主頁')}
                </button>
              )}
              
              {/* Cancel/Stay Button */}
              <button
                onClick={() => setShowSuccessModal(false)}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#718096',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {t('common.stayHere', '留在本頁')}
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
