import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useUser } from '../../UserContext';
import { useTranslation } from 'react-i18next';
import HonorUnlockModal from '../../components/shared/modals/HonorUnlockModal';
import BottomNavBar from '../../components/BottomNavBar';
import AdBanner from '../../components/AdBanner';
import { ARM_SIZE_LEVELS } from '../../standards';
import './ArmSize.css';

function ArmSize({ onComplete }) {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [armSize, setArmSize] = useState(
    userData.testInputs?.armSize?.arm || userData.testInputs?.armSize?.armSize || ''
  );
  const [bodyFat, setBodyFat] = useState(
    userData.testInputs?.armSize?.bodyFat || 20
  );
  const [score, setScore] = useState(
    userData.testInputs?.armSize?.score || null
  );
  const [rawScore, setRawScore] = useState(
    userData.testInputs?.armSize?.rawScore || null
  );
  const [isCapped, setIsCapped] = useState(
    userData.testInputs?.armSize?.isCapped || false
  );
  const [submitting, setSubmitting] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockModalData, setUnlockModalData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const timeoutRef = useRef(null);

  // 🔥 核心計算函數（純函數，可在提交時重新調用）
  const calculateArmScore = useCallback((armSizeValue, bodyFatValue, isVerifiedValue = userData.isVerified) => {
    if (!armSizeValue || armSizeValue <= 0) {
      return { displayScore: null, rawScore: null, isCapped: false };
    }

    const benchmark = 50;
    const fatMultiplier = 1 + (20 - bodyFatValue) / 100;
    let calculatedScore = (armSizeValue / benchmark) * fatMultiplier * 100;
    calculatedScore = Math.round(calculatedScore * 100) / 100; // 統一為兩位小數

    const isVerified = isVerifiedValue === true;
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

    return { displayScore, rawScore: calculatedScore, isCapped };
  }, [userData.isVerified]);

  // PAS 计算函数（用於即時預覽）
  const calculatePAS = useCallback(() => {
    const result = calculateArmScore(armSize, bodyFat);
    setScore(result.displayScore);
    setRawScore(result.rawScore);
    setIsCapped(result.isCapped);
  }, [armSize, bodyFat, calculateArmScore]);

  // 当输入变化时自动计算
  useEffect(() => {
    calculatePAS();
  }, [calculatePAS]);

  // 保存到全局状态
  // 修复：确保保存 arm 和 bodyFat 到 testInputs.armSize，以便天梯读取原始数据
  const flushTestInputs = useCallback(() => {
    const updatedTestInputs = {
      ...userData.testInputs,
      armSize: {
        arm: armSize, // 保存原始臂围数据
        armSize: armSize, // 保持向后兼容
        bodyFat: bodyFat,
        score: score,
        rawScore: rawScore,
        isCapped: isCapped,
      },
    };
    setUserData({ ...userData, testInputs: updatedTestInputs });
  }, [armSize, bodyFat, score, rawScore, isCapped, userData, setUserData]);

  useEffect(() => {
    flushTestInputs();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      flushTestInputs();
    };
  }, [armSize, bodyFat, score, rawScore, isCapped, flushTestInputs]);

  // 根据分数获取等级
  const getLevelFromScore = score => {
    if (!score) return t('tests.armSize_rpg.levels.potentialNewcomer');
    const scoreNum = parseFloat(score);
    if (scoreNum >= 100) return t('tests.armSize_rpg.levels.absoluteSupreme');
    if (scoreNum >= 90) return t('tests.armSize_rpg.levels.mythicalPhysique');
    if (scoreNum >= 80) return t('tests.armSize_rpg.levels.veteranWarrior');
    if (scoreNum >= 60) return t('tests.armSize_rpg.levels.regularTrainee');
    return t('tests.armSize_rpg.levels.potentialNewcomer');
  };

  // 获取反馈信息
  const getArmSizeFeedback = score => {
    const scoreNum = parseFloat(score);
    if (scoreNum >= 100)
      return t('tests.armSize_rpg.feedback.absoluteSupreme');
    if (scoreNum >= 90) return t('tests.armSize_rpg.feedback.mythicalPhysique');
    if (scoreNum >= 80) return t('tests.armSize_rpg.feedback.veteranWarrior');
    if (scoreNum >= 60) return t('tests.armSize_rpg.feedback.regularTrainee');
    return t('tests.armSize_rpg.feedback.potentialNewcomer');
  };

  // 处理解锁按钮点击
  const handleUnlockClick = () => {
    const level = getLevelFromScore(score);
    setUnlockModalData({
      exercise: t('tests.armSize'),
      score: score,
      level: level,
      weight: armSize,
    });
    setIsUnlockModalOpen(true);
  };

  // 提交
  const handleSubmit = async () => {
    flushTestInputs();
    
    // 🔥 關鍵修復：確保使用當前最新的輸入值
    const currentArmSize = parseFloat(armSize) || 0;
    const currentBodyFat = parseFloat(bodyFat) || 20;
    
    // ⚠️ 關鍵：在提交前一刻，重新計算分數，確保與預覽一致
    // 不要依賴可能過期的 score state 變數
    const scoreResult = calculateArmScore(currentArmSize, currentBodyFat);
    const finalScore = scoreResult.displayScore;
    const finalRawScore = scoreResult.rawScore;
    const finalIsCapped = scoreResult.isCapped;
    
    if (!finalScore || finalScore <= 0) {
      return alert(t('tests.armSizeErrors.needCalculate'));
    }
    
    if (submitting) return;
    setSubmitting(true);

    console.log(`✅ 提交審查: 輸入(${currentArmSize}cm, ${currentBodyFat}%), 計算分數:${finalScore}`);

    try {
      // --- [Phase 1: State Snapshot & Calculation] ---
      // 🔥 修正：臂圍不參與總分計算，移除分數增量邏輯
      const newArmScore = parseFloat(finalScore);

      // --- [Phase 2: Expansion Interface] ---
      // 🔮 FUTURE HOOK: Rank Up Ceremony / Animation Trigger
      // if (scoreDelta > 0) {
      //    triggerLevelUpEffect();
      //    checkIfRankSurpassed();
      // }

      // --- [Phase 3: Optimistic Context Update] ---
      // 🔥 關鍵修正：臂圍數據寫入 record_arm_girth，絕對不碰 scores
      const optimisticUserData = {
        ...userData,
        // 🔥 1. 更新 record_arm_girth（獨立欄位，不影響雷達圖）
        record_arm_girth: {
          value: currentArmSize,
          bodyFat: currentBodyFat,
          score: finalScore, // 🔥 確保這裡送出的是重新計算的分數，與預覽一致
          date: new Date().toISOString(),
          photoUrl: userData.record_arm_girth?.photoUrl || '',
        },
        // ⚠️ 2. 絕對禁止更新 scores（保持原值，不更新 muscleMass）
        scores: {
          ...userData.scores,
          // 不添加 armSize，不更新 muscleMass
        },
        // 3. 不更新 ladderScore（臂圍不參與總排名）
        ladderScore: userData.ladderScore || 0,
        // 4. Update Input History (For "My Data" view in Ladder)
        testInputs: {
          ...userData.testInputs,
          armSize: {
            ...userData.testInputs?.armSize,
            arm: currentArmSize,       // Raw measurement
            bodyFat: currentBodyFat,   // Context
            score: finalScore,         // 🔥 使用重新計算的分數
            rawScore: finalRawScore,   // 🔥 使用重新計算的原始分數
            isCapped: finalIsCapped,   // 🔥 使用重新計算的 capped 狀態
            lastUpdated: new Date().toISOString()
          }
        },
        // 5. Force Activity Refresh
        lastActive: new Date().toISOString()
      };

      // Apply Update
      setUserData(optimisticUserData);

      // --- [Phase 4: Persistence] ---
      // ... Proceed with Firebase setDoc ...

      const testData = {
        armSize: currentArmSize,
        bodyFat: currentBodyFat,
        score: finalScore,
        rawScore: finalRawScore,
      };

      // 🛑 Disable legacy navigation to show RPG Modal
      // if (onComplete) {
      //   onComplete(testData);
      // }

      // Show Success Modal instead of navigating
      console.log('🚀 Triggering ArmSize Modal via Portal...');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('提交失敗:', error);
      alert(t('tests.armSizeErrors.updateFail'));
    } finally {
      setSubmitting(false);
    }
  };

  // Map ARM_SIZE_LEVELS with translations and colors
  const scoreLevelsWithTranslations = ARM_SIZE_LEVELS.map((level, index) => {
    const colors = ['#FF6B6B', '#FFA726', '#66BB6A', '#42A5F5', '#9C27B0'];
    return {
      ...level,
      label: t(`tests.armSize_rpg.levels.${level.key}`),
      color: colors[index],
    };
  });

  return (
    <div className="arm-size-container">
      <div className="arm-size-header">
        <h1 className="arm-size-title">
          🦾 {t('tests.armSizeTitle')}
        </h1>
        <p className="arm-size-safety-note">
          {t('tests.armSizeSafetyNote')}
        </p>
      </div>

      {/* 输入区域 */}
      <div className="arm-size-input-section">
        <div className="input-card">
          <div className="input-group">
            <label htmlFor="armSize">
              {t('tests.armSizeLabels.armSize')} (cm)
              <span className="input-hint">
                💪 {t('tests.armSizeLabels.measurementHint')}
              </span>
            </label>
            <input
              id="armSize"
              type="number"
              placeholder={t('tests.armSizeLabels.armSizePlaceholder')}
              value={armSize}
              onChange={e => setArmSize(e.target.value)}
              className="input-field"
              step="0.1"
              min="0"
            />
          </div>

          <div className="input-group">
            <label htmlFor="bodyFat">
              {t('tests.armSizeLabels.bodyFat')} (%)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                id="bodyFat"
                type="range"
                min="5"
                max="40"
                step="0.1"
                value={bodyFat}
                onChange={e => {
                  const newValue = parseFloat(e.target.value);
                  if (!isNaN(newValue)) {
                    setBodyFat(newValue);
                  }
                }}
                className="slider-input"
                style={{ flex: 1 }}
              />
              <input
                type="number"
                min="5"
                max="40"
                step="0.1"
                value={bodyFat}
                onChange={e => {
                  const newValue = parseFloat(e.target.value);
                  if (!isNaN(newValue) && newValue >= 5 && newValue <= 40) {
                    setBodyFat(newValue);
                  }
                }}
                className="input-field"
                style={{ width: '80px', textAlign: 'center' }}
              />
              <span style={{ minWidth: '24px', fontSize: '0.9rem', fontWeight: 600, color: '#81d8d0' }}>%</span>
            </div>
            <div className="slider-labels">
              <span>5%</span>
              <span>40%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 结果显示 */}
      {score !== null && (
        <div className="arm-size-results-section">
          <div className="score-display-card">
            <div className="corner-decoration top-left"></div>
            <div className="corner-decoration top-right"></div>
            <div className="corner-decoration bottom-left"></div>
            <div className="corner-decoration bottom-right"></div>

            {/* --- 分數顯示區塊 (鑽石級優化版) --- */}
            <div className="score-hero-section">
              {/* 背景光暈裝飾 */}
              <div className="score-glow-bg" />
              
              {/* 上方小標題 */}
              <div className="score-label-bar">
                <div className="score-label-line" />
                <span className="score-label-text">
                  {t('tests.score')}
                </span>
                <div className="score-label-line" />
              </div>
              
              {/* --- 核心分數 (視覺重頭戲) --- */}
              <div className="score-value-hero">
                {parseFloat(score).toFixed(2)}
                {rawScore && rawScore > 100 && !isCapped && (
                  <span className="verified-badge" title={t('tests.verifiedBadge')}>
                    ✓
                  </span>
                )}
              </div>
              
              {/* 解鎖按鈕 */}
              {isCapped && (
                <button
                  onClick={handleUnlockClick}
                  className="unlock-btn"
                  title={t('actions.unlock_limit')}
                >
                  <span>🔒</span>
                  <span>{t('actions.unlock_limit')}</span>
                </button>
              )}

              {/* 下方激勵語句：戰鬥風格 */}
              <p className="score-comment">
                <span className="score-comment-emoji">🔥</span>
                <span>{getArmSizeFeedback(score)}</span>
                <span className="score-comment-emoji">🔥</span>
              </p>
            </div>

            {/* 等级进度条 */}
            <div className="level-progress-section">
              <h4>{t('tests.armSizeLabels.levelTitle')}</h4>
              <div className="levels-container">
                {scoreLevelsWithTranslations.map((item, index) => (
                  <div key={index} className="level-item">
                    <div className="level-header">
                      <span className="level-name">{item.label}</span>
                      <span className="level-score">{item.score}</span>
                    </div>
                    <div className="level-bar-container">
                      <div
                        className="level-bar"
                        style={{
                          width: `${Math.min((score / item.score) * 100, 100)}%`,
                          background: `linear-gradient(to right, ${item.color}dd, ${item.color})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 提交按钮 */}
      <div className="submit-section">
        <button
          type="button"
          onClick={handleSubmit}
          className="submit-btn"
          disabled={!score || submitting}
        >
          {submitting
            ? t('common.submitting')
            : score
            ? `✅ ${t('tests.gamified.submit_btn')}`
            : t('errors.required')}
        </button>
      </div>

      {/* 廣告區塊 (置中顯示) */}
      {score !== null && (
        <div className="ad-section" style={{ margin: '20px 0', textAlign: 'center' }}>
          <AdBanner position="inline" isFixed={false} showAd={true} />
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

      {/* Spacer for Ad + Navbar scrolling - 确保按钮完全可见且可点击 */}
      <div style={{ height: '160px', width: '100%' }} />

      <BottomNavBar />

      {/* Portal the Modal to Body */}
      {showSuccessModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',backgroundColor:'rgba(0,0,0,0.85)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)'}}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{backgroundColor:'#1a202c',borderRadius:'16px',padding:'32px 24px',width:'90%',maxWidth:'360px',textAlign:'center',boxShadow:'0 0 30px rgba(139, 92, 246, 0.5)',border:'1px solid rgba(139, 92, 246, 0.3)',color:'white'}}>
            <div style={{fontSize:'48px',marginBottom:'16px'}}>💪</div>
            <h3 style={{fontSize:'24px',fontWeight:'900',color:'#a78bfa',marginBottom:'16px',textTransform:'uppercase',letterSpacing:'1px'}}>{t('tests.gamified.questComplete')}</h3>
            <p style={{color:'#e2e8f0',marginBottom:'32px',lineHeight:'1.6',fontSize:'15px'}}>{t('tests.gamified.arm_desc')}</p>
            <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
              <button onClick={() => { setShowSuccessModal(false); navigate('/ladder', { state: { targetTab: 'body', filter: 'armSize', forceRefresh: true } }); }} style={{padding:'14px',borderRadius:'12px',border:'none',background:'linear-gradient(135deg, #8b5cf6, #6d28d9)',color:'white',fontWeight:'800',fontSize:'16px',boxShadow:'0 4px 15px rgba(139, 92, 246, 0.4)',cursor:'pointer',textTransform:'uppercase',letterSpacing:'0.5px'}}>{t('tests.gamified.view_rank')}</button>
              <button onClick={() => setShowSuccessModal(false)} style={{padding:'12px',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#cbd5e0',fontWeight:'600',cursor:'pointer',fontSize:'14px'}}>{t('tests.gamified.stay')}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

ArmSize.propTypes = {
  onComplete: PropTypes.func,
};

export default ArmSize;

