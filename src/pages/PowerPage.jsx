import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import * as standards from '../standards';
import PropTypes from 'prop-types';
import './PowerPage.css';
import { useTranslation } from 'react-i18next';
import BottomNavBar from '../components/BottomNavBar';
import AdBanner from '../components/AdBanner';
import HonorUnlockModal from '../components/shared/modals/HonorUnlockModal';

function Power({ onComplete }) {
  const { userData, setUserData, saveUserData } = useUser();
  const navigate = useNavigate();
  const { age, gender } = userData;
  const isVerified = userData.isVerified === true;
  const { t } = useTranslation();

  const [verticalJump, setVerticalJump] = useState(
    userData.testInputs?.power?.verticalJump || ''
  );
  const [standingLongJump, setStandingLongJump] = useState(
    userData.testInputs?.power?.standingLongJump || ''
  );
  const [sprint, setSprint] = useState(
    userData.testInputs?.power?.sprint || ''
  );
  const [result, setResult] = useState({
    verticalJumpScore: null,
    standingLongJumpScore: null,
    sprintScore: null,
    finalScore: null,
    verticalJumpRawScore: null,
    standingLongJumpRawScore: null,
    sprintRawScore: null,
    finalRawScore: null,
    isCapped: false,
  });
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isStandardsExpanded, setIsStandardsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockModalData, setUnlockModalData] = useState(null);

  useEffect(() => {
    const updatedTestInputs = {
      ...userData.testInputs,
      power: { verticalJump, standingLongJump, sprint },
    };
    setUserData(prev => ({ ...prev, testInputs: updatedTestInputs }));
  }, [
    verticalJump,
    standingLongJump,
    sprint,
    setUserData,
    userData.testInputs,
  ]);

  const getAgeRange = age => {
    if (!age) return null;
    const ageNum = parseInt(age);
    if (ageNum >= 12 && ageNum <= 15) return '12-15';
    if (ageNum >= 16 && ageNum <= 20) return '16-20';
    if (ageNum >= 21 && ageNum <= 30) return '21-30';
    if (ageNum >= 31 && ageNum <= 40) return '31-40';
    if (ageNum >= 41 && ageNum <= 50) return '41-50';
    if (ageNum >= 51 && ageNum <= 60) return '51-60';
    if (ageNum >= 61 && ageNum <= 70) return '61-70';
    if (ageNum >= 71 && ageNum <= 80) return '71-80';
    return null;
  };

  const calculateScoreIncreasing = (value, standard) => {
    if (value < standard[0]) return 0;
    
    // 🔥 Limit Break: 允許突破 100 分
    if (value >= standard[100]) {
      // 計算超出標準的部分，每超出標準上限 1 單位，額外 +2 分
      const excess = value - standard[100];
      const bonus = excess * 2; // 可調整倍數
      return 100 + bonus;
    }
    
    if (value < standard[50])
      return ((value - standard[0]) / (standard[50] - standard[0])) * 50;
    return 50 + ((value - standard[50]) / (standard[100] - standard[50])) * 50;
  };

  const calculateScoreDecreasing = (value, standard) => {
    if (value > standard[0]) return 0;
    
    // 🔥 Limit Break: 允許突破 100 分（數值越小越好）
    if (value <= standard[100]) {
      // 計算超出標準的部分，每比標準下限低 0.1 秒，額外 +2 分
      // 注意：這裡假設標準單位是秒，如果是其他單位需要調整倍數
      const excess = standard[100] - value;
      const bonus = excess * 20; // 可調整倍數（假設標準單位是秒，0.1秒 = 2分）
      return 100 + bonus;
    }
    
    if (value > standard[50])
      return ((standard[0] - value) / (standard[0] - standard[50])) * 50;
    return 50 + ((standard[50] - value) / (standard[50] - standard[100])) * 50;
  };

  const calculatePowerScore = () => {
    if (!age || !gender) {
      alert(t('tests.powerErrors.missingPrerequisites'));
      return;
    }
    if (!verticalJump && !standingLongJump && !sprint) {
      alert(t('tests.powerErrors.noAnyInput'));
      return;
    }

    const ageRange = getAgeRange(age);
    if (!ageRange) {
      alert(t('tests.powerErrors.invalidAge'));
      return;
    }

    const genderValue =
      gender === '男性' || gender.toLowerCase() === 'male' ? 'male' : 'female';
    const verticalJumpStandards =
      genderValue === 'male'
        ? standards.verticalJumpStandardsMale
        : standards.verticalJumpStandardsFemale;
    const standingLongJumpStandards =
      genderValue === 'male'
        ? standards.standingLongJumpStandardsMale
        : standards.standingLongJumpStandardsFemale;
    const sprintStandards =
      genderValue === 'male'
        ? standards.sprintStandardsMale
        : standards.sprintStandardsFemale;

    const verticalJumpStandard = verticalJumpStandards[ageRange];
    const standingLongJumpStandard = standingLongJumpStandards[ageRange];
    const sprintStandard = sprintStandards[ageRange];

    if (!verticalJumpStandard || !standingLongJumpStandard || !sprintStandard) {
      alert(t('tests.powerErrors.standardsNotFound'));
      return;
    }

    const verticalJumpNum = verticalJump ? parseFloat(verticalJump) : null;
    const standingLongJumpNum = standingLongJump
      ? parseFloat(standingLongJump)
      : null;
    const sprintNum = sprint ? parseFloat(sprint) : null;

    const verticalJumpRawScore =
      verticalJumpNum !== null
        ? calculateScoreIncreasing(verticalJumpNum, verticalJumpStandard)
        : null;
    const standingLongJumpRawScore =
      standingLongJumpNum !== null
        ? calculateScoreIncreasing(
            standingLongJumpNum,
            standingLongJumpStandard
          )
        : null;
    const sprintRawScore =
      sprintNum !== null
        ? calculateScoreDecreasing(sprintNum, sprintStandard)
        : null;

    const rawScores = [
      verticalJumpRawScore,
      standingLongJumpRawScore,
      sprintRawScore,
    ].filter(score => score !== null);
    if (rawScores.length === 0) {
      alert(t('tests.powerErrors.needMeasure'));
      return;
    }

    const finalRawScore = rawScores.reduce((sum, score) => sum + score, 0) / rawScores.length;
    
    // 🔥 Civilian Limiter: UI 顯示真實分數，永遠不在 UI 端 cap
    const isCapped = !isVerified && finalRawScore > 100;

    setResult({
      verticalJumpScore: verticalJumpRawScore !== null ? verticalJumpRawScore.toFixed(2) : null,
      standingLongJumpScore: standingLongJumpRawScore !== null ? standingLongJumpRawScore.toFixed(2) : null,
      sprintScore: sprintRawScore !== null ? sprintRawScore.toFixed(2) : null,
      finalScore: finalRawScore.toFixed(2), // 🔥 UI 顯示 rawScore
      verticalJumpRawScore,
      standingLongJumpRawScore,
      sprintRawScore,
      finalRawScore,
      isCapped,
    });
  };

  const handleUnlockClick = () => {
    const level = result.finalRawScore >= 100 ? 'legend' : 'apex';
    setUnlockModalData({
      exercise: t('tests.powerTitle'),
      score: result.finalRawScore,
      level: level,
      weight: null,
    });
    setIsUnlockModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!result.finalScore) {
      alert(t('tests.powerErrors.needCalculate'));
      return;
    }

    const isGuest = sessionStorage.getItem('guestMode') === 'true';

    try {
      if (submitting) return;
      setSubmitting(true);
      
      // 🔥 Civilian Limiter: 提交時，未驗證用戶分數鎖死 100
      const currentRawScore = result.finalRawScore !== null ? result.finalRawScore : parseFloat(result.finalScore);
      const scoreToSave = (!isVerified && currentRawScore > 100) ? 100 : currentRawScore;
      
      // 準備更新的數據
      const updatedScores = {
        ...userData.scores,
        explosivePower: parseFloat(scoreToSave.toFixed(2)),
      };
      const updatedUserData = {
        ...userData,
        scores: updatedScores,
      };

      setUserData({
        ...updatedUserData,
        // 保持原有的天梯分數，不自動更新
        ladderScore: userData.ladderScore || 0,
      });

      // 🔥 Firestore Payload
      if (!isGuest) {
        const userId = userData.userId || auth.currentUser?.uid;
        if (userId) {
          const userRef = doc(db, 'users', userId);
          await setDoc(userRef, {
            scores: updatedScores,
            testInputs: {
              ...userData.testInputs,
              power: { verticalJump, standingLongJump, sprint },
            },
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        await saveUserData(updatedUserData);
      }

      // 準備測試數據
      const testData = {
        verticalJump: verticalJump || null,
        standingLongJump: standingLongJump || null,
        sprint: sprint || null,
        finalScore: scoreToSave.toFixed(2),
      };
      if (onComplete && typeof onComplete === 'function') {
        onComplete(testData);
      }
      navigate('/user-info', { state: { from: '/explosive-power' } });
    } catch (error) {
      console.error('Power.js - 更新 UserContext 或導航失敗:', error);
      if (!isGuest) {
        alert(t('tests.powerErrors.updateUserFail'));
      }
      navigate('/user-info', { state: { from: '/explosive-power' } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="power-container">
      <div className="input-section">
        <h1 className="text-2xl font-bold text-center mb-4">
          {t('tests.powerTitle')}
        </h1>
        <p>
          {t('common.ageLabel')}：{age || t('common.notEntered')}
        </p>
        <p>
          {t('common.genderLabel')}：{gender || t('common.notSelected')}
        </p>

        <div className="exercise-section">
          <h2 className="text-lg font-semibold">
            {t('tests.powerLabels.movementsTitle')}
          </h2>
          <label
            htmlFor="verticalJump"
            className="block text-sm font-medium text-gray-700"
          >
            {t('tests.powerLabels.verticalJump')}
          </label>
          <input
            id="verticalJump"
            name="verticalJump"
            type="number"
            placeholder={t('tests.powerLabels.verticalJump')}
            value={verticalJump}
            onChange={e => setVerticalJump(e.target.value)}
            className="input-field"
          />
          <label
            htmlFor="standingLongJump"
            className="block text-sm font-medium text-gray-700"
          >
            {t('tests.powerLabels.standingLongJump')}
          </label>
          <input
            id="standingLongJump"
            name="standingLongJump"
            type="number"
            placeholder={t('tests.powerLabels.standingLongJump')}
            value={standingLongJump}
            onChange={e => setStandingLongJump(e.target.value)}
            className="input-field"
          />
          <label
            htmlFor="sprint"
            className="block text-sm font-medium text-gray-700"
          >
            {t('tests.powerLabels.sprint')}
          </label>
          <input
            id="sprint"
            name="sprint"
            type="number"
            placeholder={t('tests.powerLabels.sprint')}
            value={sprint}
            onChange={e => setSprint(e.target.value)}
            className="input-field"
          />
          <button onClick={calculatePowerScore} className="calculate-btn">
            {t('common.calculate')}
          </button>
          {result.finalScore && (
            <>
              {result.verticalJumpScore && (
                <p className="score-display">
                  {t('tests.powerLabels.scoreLabels.verticalJump')}:{' '}
                  {result.verticalJumpScore}
                </p>
              )}
              {result.standingLongJumpScore && (
                <p className="score-display">
                  {t('tests.powerLabels.scoreLabels.standingLongJump')}:{' '}
                  {result.standingLongJumpScore}
                </p>
              )}
              {result.sprintScore && (
                <p className="score-display">
                  {t('tests.powerLabels.scoreLabels.sprint')}:{' '}
                  {result.sprintScore}
                </p>
              )}
              <p className="score-display">
                {t('tests.powerLabels.scoreLabels.final')}: {result.finalScore}
                {result.finalRawScore && result.finalRawScore > 100 && !result.isCapped && (
                  <span className="verified-badge" title={t('tests.verifiedBadge')}>
                    {' '}✓
                  </span>
                )}
              </p>
              {/* 🔥 Civilian Limiter: 顯示警告訊息 */}
              {result.isCapped && (
                <>
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
                      marginTop: '8px',
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
                </>
              )}
            </>
          )}
        </div>

        <div className="description-section">
          <div className="description-card">
            <div
              className="description-header"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <h2 className="text-lg font-semibold">
                {t('tests.powerLabels.descriptionTitle')}
              </h2>
              <span
                className={`arrow ${isDescriptionExpanded ? 'expanded' : ''}`}
              >
                {isDescriptionExpanded ? '▲' : '▼'}
              </span>
            </div>
            {isDescriptionExpanded && (
              <div className="description-content">
                <p className="exercise-title">
                  {t('tests.powerLabels.verticalJump')}
                </p>
                <p className="exercise-description">
                  {t('tests.powerInfo.howTo.verticalJump')}
                </p>
                <p className="exercise-title mt-2">
                  {t('tests.powerLabels.standingLongJump')}
                </p>
                <p className="exercise-description">
                  {t('tests.powerInfo.howTo.standingLongJump')}
                </p>
                <p className="exercise-title mt-2">
                  {t('tests.powerLabels.sprint')}
                </p>
                <p className="exercise-description">
                  {t('tests.powerInfo.howTo.sprint')}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {t('tests.powerInfo.howTo.tip')}
                </p>
              </div>
            )}
          </div>

          <div className="standards-card">
            <div
              className="standards-header"
              onClick={() => setIsStandardsExpanded(!isStandardsExpanded)}
            >
              <h2 className="text-lg font-semibold">
                {t('tests.powerLabels.standardsTitle')}
              </h2>
              <span
                className={`arrow ${isStandardsExpanded ? 'expanded' : ''}`}
              >
                {isStandardsExpanded ? '▲' : '▼'}
              </span>
            </div>
            {isStandardsExpanded && (
              <div className="standards-content">
                <p className="font-semibold">
                  {t('tests.powerLabels.sourceLabel')}
                </p>
                <p>{t('tests.powerInfo.standards.source')}</p>
                <p className="font-semibold mt-2">
                  {t('tests.powerLabels.basisLabel')}
                </p>
                <ul className="list-disc pl-5">
                  <li>{t('tests.powerInfo.standards.basedOn.vjump')}</li>
                  <li>{t('tests.powerInfo.standards.basedOn.slj')}</li>
                  <li>{t('tests.powerInfo.standards.basedOn.sprint')}</li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  {t('tests.powerInfo.standards.remark')}
                </p>
              </div>
            )}
          </div>
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

      <HonorUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => {
          setIsUnlockModalOpen(false);
          setUnlockModalData(null);
        }}
        data={unlockModalData}
      />

      {/* 廣告區塊 (置中顯示) */}
      {result.finalScore !== null && (
        <div className="ad-section" style={{ margin: '20px 0', textAlign: 'center' }}>
          <AdBanner position="inline" isFixed={false} showAd={true} />
        </div>
      )}

      {/* Spacer for Ad + Navbar scrolling - 确保按钮完全可见且可点击 */}
      <div style={{ height: '160px', width: '100%' }} />

      <BottomNavBar />
    </div>
  );
}

Power.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default Power;
