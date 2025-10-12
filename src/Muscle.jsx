import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import * as standards from './standards';
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
import './Muscle.css';
import { useTranslation } from 'react-i18next';

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
  });
  const [submitting, setSubmitting] = useState(false);

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
    // 讓分數平滑，線性插值，允許小數點一位
    if (value >= standard[100]) return 100;
    if (value <= standard[0]) return 0;
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
    if (upperValue === lowerValue) return upper;
    const score =
      lower +
      ((value - lowerValue) / (upperValue - lowerValue)) * (upper - lower);
    return Math.round(score * 100) / 100;
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
    const smmScore = calculateScoreFromStandard(smmNum, smmStandard, 'SMM');
    const smPercentScore = calculateScoreFromStandard(
      parseFloat(smPercent),
      smPercentStandard,
      'SM%'
    );
    const finalScore = ((smmScore + smPercentScore) / 2).toFixed(2);
    setResult({ smmScore, smPercent, smPercentScore, finalScore });
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
      // 準備更新的數據
      const updatedScores = {
        ...userData.scores,
        muscleMass: parseFloat(result.finalScore),
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
          <p className="result-text">
            {t('tests.muscleLabels.smmShort')}: {result.smmScore}
          </p>
          <p className="result-text">
            {t('tests.muscleLabels.smPercentShort')}: {result.smPercent}%
          </p>
          <p className="result-text">
            {t('tests.muscleLabels.smPercentScore')}: {result.smPercentScore}
          </p>
          <p className="score-text final-score">
            {t('tests.muscleLabels.finalScore')}: {result.finalScore}
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
                  domain={[0, 100]}
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
                  domain={[0, 100]}
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
    </div>
  );
}

Muscle.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default Muscle;
