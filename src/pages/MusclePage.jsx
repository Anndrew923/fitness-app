import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import * as standards from '../standards';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import PropTypes from 'prop-types';
import './MusclePage.css';
import { useTranslation } from 'react-i18next';
import HonorUnlockModal from '../components/shared/modals/HonorUnlockModal';
import BottomNavBar from '../components/BottomNavBar';
import AdBanner from '../components/AdBanner';

function Muscle({ onComplete }) {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { weight, age, gender } = userData;
  const { t } = useTranslation();

  const [smm, setSmm] = useState(userData.testInputs?.muscle?.smm || '');
  const [result, setResult] = useState({
    smmScore: null,
    smPercent: null,
    smPercentScore: null,
    finalScore: null,
    smmRawScore: null,
    smPercentRawScore: null,
    finalRawScore: null,
    isSmmCapped: false,
    isSmPercentCapped: false,
    isFinalScoreCapped: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  useEffect(() => {
    if (smm) {
      const updatedTestInputs = {
        ...userData.testInputs,
        muscle: { ...userData.testInputs?.muscle, smm },
      };
      setUserData(prev => ({ ...prev, testInputs: updatedTestInputs }));
    }
  }, [smm, setUserData, userData.testInputs]);

  const getAgeRange = age => {
    if (!age) return null;
    const ageNum = parseInt(age);
    if (ageNum >= 10 && ageNum <= 12) return '10-12';
    if (ageNum >= 13 && ageNum <= 17) return '13-17';
    if (ageNum >= 18 && ageNum <= 30) return '18-30';
    if (ageNum >= 31 && ageNum <= 40) return '31-40';
    if (ageNum >= 41 && ageNum <= 50) return '41-50';
    if (ageNum >= 51 && ageNum <= 60) return '51-60';
    if (ageNum >= 61 && ageNum <= 70) return '61-70';
    if (ageNum >= 71 && ageNum <= 80) return '71-80';
    return null;
  };

  const calculateScoreFromStandard = (value, standard) => {
    // 🛡️ 安全檢查：防止 standard 為 undefined 導致崩潰
    if (!standard) return 0;

    // 📊 計算原始分數 (RawScore: 0-100+)
    let rawScore = 0;

    // 🔥 Limit Break: 移除 100 分封頂，改採斜率延伸
    if (value >= standard[100]) {
      // 1. 計算最後一個區間 (PR90 到 PR100) 的斜率
      // 斜率 = 分數差(10) / 數值差
      // 注意：需防止分母為 0 (雖然標準數據中 PR100 通常 > PR90)
      const valueDiff = standard[100] - standard[90];
      const slope = valueDiff > 0 ? 10 / valueDiff : 0;
      
      // 2. 計算超出的數值
      const extraValue = value - standard[100];
      
      // 3. 基礎線性延伸分數
      let extendedScore = 100 + extraValue * slope;

      // 4. 軟上限 (Soft Cap): 超過 120 分後，收益減半，防止數值無限膨脹
      if (extendedScore > 120) {
        extendedScore = 120 + (extendedScore - 120) * 0.5;
      }

      rawScore = parseFloat(extendedScore.toFixed(2));
    } else {
      // --- 以下保持原有的中間區間計算邏輯 ---
      if (value <= standard[0]) {
        rawScore = 0;
      } else {
        // 找到分數區間
        let lower = 0;
        let upper = 100;
        for (let i = 10; i <= 100; i += 10) {
          if (value < standard[i]) {
            upper = i;
            lower = i - 10;
            break;
          }
        }
        
        // 線性插值
        const lowerValue = standard[lower];
        const upperValue = standard[upper];
        if (upperValue === lowerValue) {
          rawScore = upper;
        } else {
          rawScore =
            lower +
            ((value - lowerValue) / (upperValue - lowerValue)) * (upper - lower);
          rawScore = Math.round(rawScore * 100) / 100;
        }
      }
    }

    // 返回原始分數 (Raw Score)，不應用任何係數
    return rawScore;
  };

  // 🔥 Civilian Limiter: UI 顯示真實分數，永遠不在 UI 端 cap
  const applyHonorLock = (score, isVerified) => {
    // ✅ 確保分數保留兩位小數
    const roundedScore = parseFloat(Number(score).toFixed(2));
    const isCapped = !isVerified && roundedScore > 100;
    // 🔥 UI 永遠顯示 rawScore
    return { displayScore: roundedScore, isCapped: isCapped };
  };

  const calculateMuscleScore = () => {
    if (!weight || !smm || !age || !gender) {
      alert(t('tests.muscleErrors.missingPrerequisites'));
      return;
    }
    const weightNum = parseFloat(weight);
    const smmNum = parseFloat(smm);
    const ageRange = getAgeRange(age);
    if (!weightNum || !smmNum || !ageRange) {
      alert(t('tests.muscleErrors.invalidInputs'));
      return;
    }
    const smPercent = ((smmNum / weightNum) * 100).toFixed(2);
    const genderValue =
      gender === '男性' || gender.toLowerCase() === 'male' ? 'male' : 'female';
    const smmStandards =
      genderValue === 'male'
        ? standards.muscleStandardsMaleSMM
        : standards.muscleStandardsFemaleSMM;
    const smPercentStandards =
      genderValue === 'male'
        ? standards.muscleStandardsMaleSMPercent
        : standards.muscleStandardsFemaleSMPercent;
    const smmStandard = smmStandards[ageRange];
    const smPercentStandard = smPercentStandards[ageRange];
    if (!smmStandard || !smPercentStandard) {
      alert(t('tests.muscleErrors.standardsNotFound'));
      return;
    }
    // 計算原始分數
    const smmRawScore = calculateScoreFromStandard(smmNum, smmStandard, 'SMM');
    const smPercentScore = calculateScoreFromStandard(
      parseFloat(smPercent),
      smPercentStandard,
      'SM%'
    );
    
    // 🚀 僅對 SMM (骨骼肌重量) 應用 1.25 倍放大係數
    // SM% (骨骼肌率) 保持原始分數，不應用係數
    // ✅ 修改：保留兩位小數，提高鑑別度
    const smmScoreRaw = parseFloat((smmRawScore * 1.25).toFixed(2));
    
    // 🔒 應用榮譽鎖機制
    const isVerified = userData.isVerified === true;
    const smmLocked = applyHonorLock(smmScoreRaw, isVerified);
    const smPercentLocked = applyHonorLock(smPercentScore, isVerified);
    
    // 🔥 Civilian Limiter: 計算最終分數（基於 rawScore）
    const finalScoreRaw = (smmScoreRaw + smPercentScore) / 2;
    const finalScoreLocked = applyHonorLock(finalScoreRaw, isVerified);
    
    setResult({
      smmScore: parseFloat(smmLocked.displayScore.toFixed(2)), // 🔥 UI 顯示 rawScore
      smPercent,
      smPercentScore: smPercentLocked.displayScore, // 🔥 UI 顯示 rawScore
      finalScore: finalScoreLocked.displayScore.toFixed(2), // 🔥 UI 顯示 rawScore
      smmRawScore: smmScoreRaw, // 保存 rawScore
      smPercentRawScore: smPercentScore, // 保存 rawScore
      finalRawScore: finalScoreRaw, // 保存 rawScore
      isSmmCapped: smmLocked.isCapped,
      isSmPercentCapped: smPercentLocked.isCapped,
      isFinalScoreCapped: finalScoreLocked.isCapped,
    });
  };

  const handleSubmit = async () => {
    if (!result.finalScore) {
      alert(t('tests.muscleErrors.needCalculate'));
      return;
    }

    const isGuest = sessionStorage.getItem('guestMode') === 'true';

    try {
      if (submitting) return;
      setSubmitting(true);
      
      // 🔥 Civilian Limiter: 使用保存的 rawScore，提交時鎖死
      const currentFinalRawScore = result.finalRawScore !== null ? result.finalRawScore : parseFloat(result.finalScore);
      const isVerified = userData.isVerified === true;
      // 🔥 提交時，未驗證用戶分數鎖死 100
      const scoreToSave = (!isVerified && currentFinalRawScore > 100) ? 100 : currentFinalRawScore;
      
      // 準備更新的數據
      const updatedScores = {
        ...userData.scores,
        muscleMass: parseFloat(scoreToSave.toFixed(2)),
      };
      const updatedUserData = {
        ...userData,
        scores: updatedScores,
      };

      // 儲存評測時的體重快照
      const updatedTestInputs = {
        ...userData.testInputs,
        muscle: {
          ...userData.testInputs?.muscle,
          smm: parseFloat(smm),
          weight: parseFloat(weight), // 儲存評測時的體重快照
        },
      };

      setUserData({
        ...updatedUserData,
        testInputs: updatedTestInputs,
        // 保持原有的天梯分數，不自動更新
        ladderScore: userData.ladderScore || 0,
      });

      // 移除重複的 saveUserData 調用，讓 UserContext 的防抖機制處理
      // if (!isGuest) {
      //   const success = await saveUserData(updatedUserData);
      //   if (!success) throw new Error('保存數據失敗');
      // }

      // 準備測試數據
      const testData = {
        smm: parseFloat(smm),
        smPercent: parseFloat(result.smPercent),
        finalScore: parseFloat(result.finalScore),
      };
      if (onComplete && typeof onComplete === 'function') {
        onComplete(testData);
      }
      navigate('/user-info', { state: { from: '/muscle-mass' } });
    } catch (error) {
      console.error('提交失敗:', error);
      if (!isGuest) {
        alert(t('tests.muscleErrors.updateUserFail'));
      }
      navigate('/user-info', { state: { from: '/muscle-mass' } });
    } finally {
      setSubmitting(false);
    }
  };

  // 準備圖表數據
  const barData1 = [
    { name: t('tests.muscleLabels.smmShort'), value: result.smmScore || 0 },
    {
      name: t('tests.muscleLabels.smPercentShort'),
      value: result.smPercentScore || 0,
    },
  ];

  const barData2 = [
    { name: t('tests.muscleLabels.finalScore'), value: result.finalScore || 0 },
  ];

  return (
    <div className="muscle-container">
      <h1>{t('tests.muscleTitle')}</h1>

      <div className="input-section">
        <p className="result-text">
          {t('common.weightLabel')}：
          {weight ? `${weight} kg` : t('common.notEntered')}
        </p>
        <p className="result-text">
          {t('common.ageLabel')}：{age || t('common.notEntered')}
        </p>
        <p className="result-text">
          {t('common.genderLabel')}：{gender || t('common.notSelected')}
        </p>

        <label htmlFor="smm" className="input-label">
          {t('tests.muscleLabels.smmKg')}
        </label>
        <input
          id="smm"
          name="smm"
          type="number"
          placeholder={t('tests.muscleLabels.smmKg')}
          value={smm}
          onChange={e => setSmm(e.target.value)}
          className="input-field"
        />
        <button onClick={calculateMuscleScore} className="calculate-btn">
          {t('common.calculate')}
        </button>
      </div>

      {result.smmScore !== null && (
        <div className="result-section">
          <h2 className="result-title">
            {t('tests.muscleLabels.sectionTitle')}
          </h2>

          {/* 新增：簡潔的雙重指標說明 */}
          <div className="concise-explanation">
            <h3>{t('tests.muscleLabels.muscleExplanation.title')}</h3>

            <div className="dual-metrics">
              <div className="metric">
                <h4>
                  📏 {t('tests.muscleLabels.muscleExplanation.weightTitle')}
                </h4>
                <p>{t('tests.muscleLabels.muscleExplanation.weightDesc')}</p>
              </div>
              <div className="metric">
                <h4>
                  📊 {t('tests.muscleLabels.muscleExplanation.percentTitle')}
                </h4>
                <p>{t('tests.muscleLabels.muscleExplanation.percentDesc')}</p>
              </div>
            </div>

            <div className="why-both">
              <h4>{t('tests.muscleLabels.muscleExplanation.whyBoth')}</h4>
              <div className="examples">
                <p>
                  <strong>
                    {t('tests.muscleLabels.muscleExplanation.example1')}
                  </strong>
                </p>
                <p>
                  <strong>
                    {t('tests.muscleLabels.muscleExplanation.example2')}
                  </strong>
                </p>
              </div>
              <div className="solution">
                <p>
                  <strong>
                    {t('tests.muscleLabels.muscleExplanation.solution')}
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* 新增：評分標準參考 */}
          <div className="scoring-reference">
            <h3>{t('tests.muscleLabels.scoringReference.title')}</h3>

            <div className="reference-levels">
              <div className="level average">
                <div className="level-icon">👤</div>
                <div className="level-content">
                  <h4>
                    {t('tests.muscleLabels.scoringReference.average.title')}
                  </h4>
                  <p className="score-range">
                    {t('tests.muscleLabels.scoringReference.average.range')}
                  </p>
                  <p className="description">
                    {t('tests.muscleLabels.scoringReference.average.desc')}
                  </p>
                </div>
              </div>

              <div className="level above-average">
                <div className="level-icon">💪</div>
                <div className="level-content">
                  <h4>
                    {t(
                      'tests.muscleLabels.scoringReference.aboveAverage.title'
                    )}
                  </h4>
                  <p className="score-range">
                    {t(
                      'tests.muscleLabels.scoringReference.aboveAverage.range'
                    )}
                  </p>
                  <p className="description">
                    {t('tests.muscleLabels.scoringReference.aboveAverage.desc')}
                  </p>
                </div>
              </div>

              <div className="level intermediate">
                <div className="level-icon">🏃</div>
                <div className="level-content">
                  <h4>
                    {t(
                      'tests.muscleLabels.scoringReference.intermediate.title'
                    )}
                  </h4>
                  <p className="score-range">
                    {t(
                      'tests.muscleLabels.scoringReference.intermediate.range'
                    )}
                  </p>
                  <p className="description">
                    {t('tests.muscleLabels.scoringReference.intermediate.desc')}
                  </p>
                </div>
              </div>

              <div className="level excellent">
                <div className="level-icon">⭐</div>
                <div className="level-content">
                  <h4>
                    {t('tests.muscleLabels.scoringReference.excellent.title')}
                  </h4>
                  <p className="score-range">
                    {t('tests.muscleLabels.scoringReference.excellent.range')}
                  </p>
                  <p className="description">
                    {t('tests.muscleLabels.scoringReference.excellent.desc')}
                  </p>
                </div>
              </div>

              <div className="level elite">
                <div className="level-icon">🏆</div>
                <div className="level-content">
                  <h4>
                    {t('tests.muscleLabels.scoringReference.elite.title')}
                  </h4>
                  <p className="score-range">
                    {t('tests.muscleLabels.scoringReference.elite.range')}
                  </p>
                  <p className="description">
                    {t('tests.muscleLabels.scoringReference.elite.desc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="your-score">
              <p>
                <strong>
                  {t('tests.muscleLabels.scoringReference.yourScore')}:{' '}
                  {result.finalScore}分
                  {result.finalRawScore && result.finalRawScore > 100 && !result.isFinalScoreCapped && (
                    <span className="verified-badge" title={t('tests.verifiedBadge')}>
                      {' '}✓
                    </span>
                  )}
                </strong>
              </p>
              {/* 🔥 Civilian Limiter: 顯示警告訊息 */}
              {result.isFinalScoreCapped && (
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
                    type="button"
                    className="honor-lock-btn"
                    onClick={() => setIsUnlockModalOpen(true)}
                    title="點擊解鎖真實實力"
                  >
                    <span>🔒</span>
                    <span className="flex-shrink-0 whitespace-normal">{t('actions.unlock_limit')}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="result-text">
            {t('tests.muscleLabels.smmShort')}: {result.smmScore}
            {result.smmRawScore && result.smmRawScore > 100 && !result.isSmmCapped && (
              <span className="verified-badge" title={t('tests.verifiedBadge')}>
                {' '}✓
              </span>
            )}
            {result.isSmmCapped && (
              <>
                <span style={{ fontSize: '0.8rem', color: '#f59e0b', marginLeft: '8px' }}>
                  ⚠️ {t('tests.civilianLimiter.warning', '未驗證用戶提交時分數將鎖定為 100')}
                </span>
                <button
                  type="button"
                  className="honor-lock-btn"
                  onClick={() => setIsUnlockModalOpen(true)}
                  title="點擊解鎖真實實力"
                >
                  <span>🔒</span>
                  <span className="flex-shrink-0 whitespace-normal">{t('actions.unlock_limit')}</span>
                </button>
              </>
            )}
          </p>
          <p className="result-text">
            {t('tests.muscleLabels.smPercentShort')}: {result.smPercent}%
          </p>
          <p className="result-text">
            {t('tests.muscleLabels.smPercentScore')}: {result.smPercentScore}
            {result.smPercentRawScore && result.smPercentRawScore > 100 && !result.isSmPercentCapped && (
              <span className="verified-badge" title={t('tests.verifiedBadge')}>
                {' '}✓
              </span>
            )}
            {result.isSmPercentCapped && (
              <>
                <span style={{ fontSize: '0.8rem', color: '#f59e0b', marginLeft: '8px' }}>
                  ⚠️ {t('tests.civilianLimiter.warning', '未驗證用戶提交時分數將鎖定為 100')}
                </span>
                <button
                  type="button"
                  className="honor-lock-btn"
                  onClick={() => setIsUnlockModalOpen(true)}
                  title="點擊解鎖真實實力"
                >
                  <span>🔒</span>
                  <span className="flex-shrink-0 whitespace-normal">{t('actions.unlock_limit')}</span>
                </button>
              </>
            )}
          </p>
          <p className="score-text final-score">
            {t('tests.muscleLabels.finalScore')}: {result.finalScore}
            {result.finalRawScore && result.finalRawScore > 100 && !result.isFinalScoreCapped && (
              <span className="verified-badge" title={t('tests.verifiedBadge')}>
                {' '}✓
              </span>
            )}
            {result.isFinalScoreCapped && (
              <>
                <span style={{ fontSize: '0.8rem', color: '#f59e0b', marginLeft: '8px' }}>
                  ⚠️ {t('tests.civilianLimiter.warning', '未驗證用戶提交時分數將鎖定為 100')}
                </span>
                <button
                  type="button"
                  className="honor-lock-btn"
                  onClick={() => setIsUnlockModalOpen(true)}
                  title="點擊解鎖真實實力"
                >
                  <span>🔒</span>
                  <span className="flex-shrink-0 whitespace-normal">{t('actions.unlock_limit')}</span>
                </button>
              </>
            )}
          </p>
        </div>
      )}

      {result.finalScore && (
        <div className="chart-section">
          <h2 className="result-title">
            {t('tests.muscleLabels.numbersComparison')}
          </h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData1} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  label={{
                    value: t('tests.muscleLabels.chartName'),
                    position: 'insideBottom',
                    offset: -5,
                  }}
                />
                <YAxis
                  domain={[0, 'dataMax']}
                  label={{
                    value: t('tests.muscleLabels.chartScore'),
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="value"
                  fill="#4bc0c0"
                  name={t('tests.muscleLabels.chartScore')}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-4">
            {t('tests.muscleLabels.finalScore')}
          </h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData2} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  label={{
                    value: t('tests.muscleLabels.chartName'),
                    position: 'insideBottom',
                    offset: -5,
                  }}
                />
                <YAxis
                  domain={[0, 'dataMax']}
                  label={{
                    value: t('tests.muscleLabels.chartScore'),
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#36a2eb"
                  name={t('tests.muscleLabels.chartScore')}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
        onClose={() => setIsUnlockModalOpen(false)}
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

Muscle.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default Muscle;
