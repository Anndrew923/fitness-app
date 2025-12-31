import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';
import './FFMI.css';
import { useTranslation } from 'react-i18next';
import BottomNavBar from './components/BottomNavBar';
import AdBanner from './components/AdBanner';
import HonorUnlockModal from './components/shared/modals/HonorUnlockModal';

function FFMI({ onComplete }) {
  const { userData, setUserData, saveUserData } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isVerified = userData.isVerified === true;
  const [bodyFat, setBodyFat] = useState(
    userData.testInputs?.ffmi?.bodyFat || ''
  );
  const [ffmi, setFfmi] = useState(null);
  const [ffmiScore, setFfmiScore] = useState(null);
  const [ffmiRawScore, setFfmiRawScore] = useState(null); // 🔥 新增：保存真實分數
  const [isCapped, setIsCapped] = useState(false); // 🔥 新增：是否被鎖定
  const [ffmiCategory, setFfmiCategory] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockModalData, setUnlockModalData] = useState(null);

  useEffect(() => {
    if (bodyFat) {
      const updatedTestInputs = {
        ...userData.testInputs,
        ffmi: { ...userData.testInputs?.ffmi, bodyFat },
      };
      setUserData(prev => ({ ...prev, testInputs: updatedTestInputs }));
    }
  }, [bodyFat, setUserData, userData.testInputs]);

  const calculateScores = () => {
    if (
      !userData.gender ||
      !userData.height ||
      !userData.weight ||
      !userData.age
    ) {
      alert(t('tests.ffmiErrors.missingPrerequisites'));
      return;
    }
    if (!bodyFat) {
      alert(t('tests.ffmiErrors.missingBodyFat'));
      return;
    }

    const isMale = userData.gender === 'male' || userData.gender === '男性';
    const heightInMeters = parseFloat(userData.height) / 100;
    const weight = parseFloat(userData.weight);
    const bodyFatValue = parseFloat(bodyFat) / 100;

    const fatFreeMass = weight * (1 - bodyFatValue);
    const rawFfmi = fatFreeMass / (heightInMeters * heightInMeters);
    const adjustedFfmi =
      heightInMeters > 1.8 ? rawFfmi + 6.0 * (heightInMeters - 1.8) : rawFfmi;
    setFfmi(adjustedFfmi.toFixed(2));

    let newFfmiScore;
    if (isMale) {
      const baseFfmi = 18.5;
      const maxFfmi = 25; // ✅ 修改：將男性 100 分標準設為自然極限 25
      if (adjustedFfmi <= 0) newFfmiScore = 0;
      else if (adjustedFfmi <= baseFfmi)
        newFfmiScore = (adjustedFfmi / baseFfmi) * 60;
      else if (adjustedFfmi < maxFfmi)
        newFfmiScore =
          60 + ((adjustedFfmi - baseFfmi) / (maxFfmi - baseFfmi)) * 40;
      else {
        // 🔥 Limit Break
        // 超過 25 後，每多 1 點 FFMI + 5 分
        newFfmiScore = 100 + (adjustedFfmi - maxFfmi) * 5;
      }
    } else {
      const baseFfmi = 15.5;
      const maxFfmi = 21; // ✅ 修改：將女性 100 分標準設為 21 (兼顧挑戰性與多巴胺)
      if (adjustedFfmi <= 0) newFfmiScore = 0;
      else if (adjustedFfmi <= baseFfmi)
        newFfmiScore = (adjustedFfmi / baseFfmi) * 60;
      else if (adjustedFfmi < maxFfmi)
        newFfmiScore =
          60 + ((adjustedFfmi - baseFfmi) / (maxFfmi - baseFfmi)) * 40;
      else {
        // 🔥 Limit Break
        // 超過 21 後，每多 1 點 FFMI + 5 分
        newFfmiScore = 100 + (adjustedFfmi - maxFfmi) * 5;
      }
    }

    // 🔥 保存 rawScore（真實分數）
    setFfmiRawScore(newFfmiScore);

    // 🔥 Civilian Limiter: UI 顯示真實分數，永遠不在 UI 端 cap
    const capped = !isVerified && newFfmiScore > 100;
    setIsCapped(capped);
    setFfmiScore(newFfmiScore.toFixed(2)); // UI 顯示 rawScore

    if (isMale) {
      if (adjustedFfmi < 18)
        setFfmiCategory(t('tests.ffmiInfo.maleTable.r16_17'));
      else if (adjustedFfmi < 20)
        setFfmiCategory(t('tests.ffmiInfo.maleTable.r18_19'));
      else if (adjustedFfmi < 22)
        setFfmiCategory(t('tests.ffmiInfo.maleTable.r20_21'));
      else if (adjustedFfmi < 23)
        setFfmiCategory(t('tests.ffmiInfo.maleTable.r22'));
      else if (adjustedFfmi < 26)
        setFfmiCategory(t('tests.ffmiInfo.maleTable.r23_25'));
      else if (adjustedFfmi < 28)
        setFfmiCategory(t('tests.ffmiInfo.maleTable.r26_27'));
      else setFfmiCategory(t('tests.ffmiInfo.maleTable.r28_30'));
    } else {
      if (adjustedFfmi < 15)
        setFfmiCategory(t('tests.ffmiInfo.femaleTable.r13_14'));
      else if (adjustedFfmi < 17)
        setFfmiCategory(t('tests.ffmiInfo.femaleTable.r15_16'));
      else if (adjustedFfmi < 19)
        setFfmiCategory(t('tests.ffmiInfo.femaleTable.r17_18'));
      else if (adjustedFfmi < 22)
        setFfmiCategory(t('tests.ffmiInfo.femaleTable.r19_21'));
      else setFfmiCategory(t('tests.ffmiInfo.femaleTable.r22plus'));
    }
  };

  const handleUnlockClick = () => {
    const level = ffmiRawScore >= 100 ? 'legend' : 'apex';
    setUnlockModalData({
      exercise: t('tests.ffmiTitle'),
      score: ffmiRawScore,
      level: level,
      weight: null,
    });
    setIsUnlockModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!ffmi || !ffmiScore) {
      alert(t('tests.ffmiErrors.needCalculate'));
      return;
    }

    const isGuest = sessionStorage.getItem('guestMode') === 'true';

    try {
      if (submitting) return;
      setSubmitting(true);

      // 🔥 Civilian Limiter: 提交時，未驗證用戶分數鎖死 100
      const currentRawScore =
        ffmiRawScore !== null ? ffmiRawScore : parseFloat(ffmiScore);
      const scoreToSave =
        !isVerified && currentRawScore > 100 ? 100 : currentRawScore;

      // 準備更新的數據
      const updatedScores = {
        ...userData.scores,
        bodyFat: parseFloat(scoreToSave.toFixed(2)),
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
          await setDoc(
            userRef,
            {
              scores: updatedScores,
              testInputs: {
                ...userData.testInputs,
                ffmi: { bodyFat },
              },
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
        await saveUserData(updatedUserData);
      }

      // 準備測試數據
      const testData = {
        bodyFat: parseFloat(bodyFat),
        ffmi: parseFloat(ffmi),
        ffmiScore: parseFloat(ffmiScore),
      };
      if (onComplete && typeof onComplete === 'function') {
        onComplete(testData);
      }
      navigate('/user-info', { state: { from: '/body-fat' } });
    } catch (error) {
      console.error('提交失敗:', error);
      if (!isGuest) {
        alert(t('tests.ffmiErrors.updateUserFail'));
      }
      navigate('/user-info', { state: { from: '/body-fat' } });
    } finally {
      setSubmitting(false);
    }
  };

  const maleFfmiTable = [
    { range: '16 - 17', description: t('tests.ffmiInfo.maleTable.r16_17') },
    { range: '18 - 19', description: t('tests.ffmiInfo.maleTable.r18_19') },
    { range: '20 - 21', description: t('tests.ffmiInfo.maleTable.r20_21') },
    { range: '22', description: t('tests.ffmiInfo.maleTable.r22') },
    { range: '23 - 25', description: t('tests.ffmiInfo.maleTable.r23_25') },
    { range: '26 - 27', description: t('tests.ffmiInfo.maleTable.r26_27') },
    { range: '28 - 30', description: t('tests.ffmiInfo.maleTable.r28_30') },
  ];

  const femaleFfmiTable = [
    { range: '13 - 14', description: t('tests.ffmiInfo.femaleTable.r13_14') },
    { range: '15 - 16', description: t('tests.ffmiInfo.femaleTable.r15_16') },
    { range: '17 - 18', description: t('tests.ffmiInfo.femaleTable.r17_18') },
    { range: '19 - 21', description: t('tests.ffmiInfo.femaleTable.r19_21') },
    { range: '> 22', description: t('tests.ffmiInfo.femaleTable.r22plus') },
  ];

  const ffmiTable =
    userData.gender === 'male' || userData.gender === '男性'
      ? maleFfmiTable
      : femaleFfmiTable;

  return (
    <div className="ffmi-container">
      <h1 className="ffmi-title">{t('tests.ffmiTitle')}</h1>
      <div className="input-section">
        <label htmlFor="bodyFat" className="input-label">
          {t('tests.ffmiLabels.bodyFatPercent')}
        </label>
        <input
          id="bodyFat"
          name="bodyFat"
          type="number"
          value={bodyFat}
          onChange={e => setBodyFat(e.target.value)}
          placeholder={t('tests.ffmiLabels.bodyFatPercent')}
          className="input-field"
          required
        />
        <button onClick={calculateScores} className="calculate-btn">
          {t('common.calculate')}
        </button>
      </div>
      {ffmi && (
        <div className="result-section">
          <h2 className="result-title">{t('tests.ffmiLabels.resultTitle')}</h2>
          <p className="result-text">
            {t('tests.ffmiLabels.ffmi')}：{ffmi}
          </p>
          <p className="score-text">
            {t('tests.ffmiLabels.ffmiScore')}：{ffmiScore} {t('common.points')}
            {ffmiRawScore && ffmiRawScore > 100 && !isCapped && (
              <span className="verified-badge" title={t('tests.verifiedBadge')}>
                {' '}
                ✓
              </span>
            )}
          </p>
          {/* 🔥 Civilian Limiter: 顯示警告訊息 */}
          {isCapped && (
            <>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: '#f59e0b',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ⚠️{' '}
                {t(
                  'tests.civilianLimiter.warning',
                  '未驗證用戶提交時分數將鎖定為 100'
                )}
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
          <p className="category-text">
            {t('tests.ffmiLabels.ffmiCategory')}：{ffmiCategory}
          </p>
          <p className="result-text note-text"></p>
        </div>
      )}
      <div className="description-section">
        <div className="description-card">
          <div
            className="description-header"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h2 className="description-title">
              {t('tests.ffmiLabels.whatIs')}
            </h2>
            <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>
              {isExpanded ? '▲' : '▼'}
            </span>
          </div>
          {isExpanded && (
            <div className="description-content">
              <p>{t('tests.ffmiInfo.whatIs')}</p>
              <ol className="list-decimal pl-5 mt-2">
                <li>{t('tests.ffmiInfo.caveats.tall')}</li>
                <li>{t('tests.ffmiInfo.caveats.highFat')}</li>
                <li>{t('tests.ffmiInfo.caveats.heavy')}</li>
              </ol>
            </div>
          )}
        </div>
      </div>
      <div className="table-section">
        <div className="table-card">
          <div
            className="table-header"
            onClick={() => setIsTableExpanded(!isTableExpanded)}
          >
            <h2 className="table-title">
              {t('tests.ffmiLabels.tableTitle')} (
              {userData.gender === 'male' || userData.gender === '男性'
                ? t('tests.ffmiLabels.male')
                : t('tests.ffmiLabels.female')}
              )
            </h2>
            <span className={`arrow ${isTableExpanded ? 'expanded' : ''}`}>
              {isTableExpanded ? '▲' : '▼'}
            </span>
          </div>
          {isTableExpanded && (
            <div className="table-content">
              <table className="ffmi-table">
                <thead>
                  <tr>
                    <th>{t('tests.ffmiLabels.columns.range')}</th>
                    <th>{t('tests.ffmiLabels.columns.evaluation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ffmiTable.map((row, index) => (
                    <tr key={index}>
                      <td>{row.range}</td>
                      <td>{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="ffmi-submit-btn"
        disabled={submitting}
      >
        {submitting ? t('common.submitting') : t('common.submitAndReturn')}
      </button>

      {/* 廣告區塊 (置中顯示) */}
      {ffmiScore !== null && (
        <div
          className="ad-section"
          style={{ margin: '20px 0', textAlign: 'center' }}
        >
          <AdBanner position="inline" isFixed={false} showAd={true} />
        </div>
      )}

      {/* Spacer for Ad + Navbar scrolling - 确保按钮完全可见且可点击 */}
      <div style={{ height: '160px', width: '100%' }} />

      <BottomNavBar />

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

FFMI.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default FFMI;
