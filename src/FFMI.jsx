import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import PropTypes from 'prop-types';
import './FFMI.css';
import { useTranslation } from 'react-i18next';

function FFMI({ onComplete }) {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [bodyFat, setBodyFat] = useState(
    userData.testInputs?.ffmi?.bodyFat || ''
  );
  const [ffmi, setFfmi] = useState(null);
  const [ffmiScore, setFfmiScore] = useState(null);
  const [ffmiCategory, setFfmiCategory] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false); // 新增：控制對照表展開狀態
  const [submitting, setSubmitting] = useState(false);

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
      const maxFfmi = 28;
      if (adjustedFfmi <= 0) newFfmiScore = 0;
      else if (adjustedFfmi <= baseFfmi)
        newFfmiScore = (adjustedFfmi / baseFfmi) * 60;
      else if (adjustedFfmi < maxFfmi)
        newFfmiScore =
          60 + ((adjustedFfmi - baseFfmi) / (maxFfmi - baseFfmi)) * 40;
      else newFfmiScore = 100;
    } else {
      const baseFfmi = 15.5;
      const maxFfmi = 22;
      if (adjustedFfmi <= 0) newFfmiScore = 0;
      else if (adjustedFfmi <= baseFfmi)
        newFfmiScore = (adjustedFfmi / baseFfmi) * 60;
      else if (adjustedFfmi < maxFfmi)
        newFfmiScore =
          60 + ((adjustedFfmi - baseFfmi) / (maxFfmi - baseFfmi)) * 40;
      else newFfmiScore = 100;
    }
    setFfmiScore(newFfmiScore.toFixed(2));

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

  const handleSubmit = async () => {
    if (!ffmi || !ffmiScore) {
      alert(t('tests.ffmiErrors.needCalculate'));
      return;
    }

    const isGuest = sessionStorage.getItem('guestMode') === 'true';

    try {
      if (submitting) return;
      setSubmitting(true);
      // 準備更新的數據
      const updatedScores = {
        ...userData.scores,
        bodyFat: parseFloat(ffmiScore),
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

      // 移除重複的 saveUserData 調用，讓 UserContext 的防抖機制處理
      // if (!isGuest) {
      //   const success = await saveUserData(updatedUserData);
      //   if (!success) throw new Error('保存數據失敗');
      // }

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
          </p>
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
    </div>
  );
}

FFMI.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default FFMI;
