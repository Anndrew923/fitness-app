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

function Muscle({ onComplete }) {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { weight, age, gender } = userData;

  const [smm, setSmm] = useState(userData.testInputs?.muscle?.smm || '');
  const [result, setResult] = useState({
    smmScore: null,
    smPercent: null,
    smPercentScore: null,
    finalScore: null,
  });

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
      alert('請確保已在用戶信息中輸入體重、年齡和性別，並在此輸入骨骼肌肉量！');
      return;
    }
    const weightNum = parseFloat(weight);
    const smmNum = parseFloat(smm);
    const ageRange = getAgeRange(age);
    if (!weightNum || !smmNum || !ageRange) {
      alert('請輸入有效的體重、骨骼肌肉量和年齡！');
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
      alert('無法找到對應的評測標準，請檢查年齡和性別！');
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
      alert('請先計算骨骼肌肉量分數！');
      return;
    }

    const isGuest = sessionStorage.getItem('guestMode') === 'true';

    try {
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
      setTimeout(() => {
        navigate('/user-info', { state: { from: '/muscle-mass' } });
      }, 100);
    } catch (error) {
      console.error('提交失敗:', error);
      if (!isGuest) {
        alert('更新用戶數據失敗，請稍後再試！');
      }
      setTimeout(() => {
        navigate('/user-info', { state: { from: '/muscle-mass' } });
      }, 100);
    }
  };

  // 準備圖表數據
  const barData1 = [
    { name: '骨骼肌肉量 (SMM)', value: result.smmScore || 0 },
    { name: '肌肉量百分比 (SM%)', value: result.smPercentScore || 0 },
  ];

  const barData2 = [{ name: '最終分數', value: result.finalScore || 0 }];

  return (
    <div className="muscle-container">
      <h1 className="text-2xl font-bold text-center mb-4">骨骼肌肉量評測</h1>
      <p>體重：{weight ? `${weight} 公斤` : '未輸入'}</p>
      <p>年齡：{age || '未輸入'}</p>
      <p>性別：{gender || '未選擇'}</p>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">骨骼肌肉量 (SMM)</h2>
        <label
          htmlFor="smm"
          className="block text-sm font-medium text-gray-700"
        >
          骨骼肌肉量 (kg)
        </label>
        <input
          id="smm"
          name="smm"
          type="number"
          placeholder="骨骼肌肉量 (kg)"
          value={smm}
          onChange={e => setSmm(e.target.value)}
          className="input-field"
        />
        <button onClick={calculateMuscleScore} className="calculate-btn">
          計算
        </button>

        {result.smmScore !== null && (
          <>
            <p className="score-text">
              骨骼肌肉量 (SMM) 分數: {result.smmScore}
            </p>
            <p className="score-text">
              骨骼肌肉量百分比 (SM%): {result.smPercent}%
            </p>
            <p className="score-text">
              骨骼肌肉量百分比 (SM%) 分數: {result.smPercentScore}
            </p>
            <p className="score-text final-score">
              最終分數: {result.finalScore}
            </p>
          </>
        )}
      </div>

      {result.finalScore && (
        <div className="chart-section">
          <h2 className="text-lg font-semibold mb-4">數值比較</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData1} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4bc0c0" name="分數" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h2 className="text-lg font-semibold mt-6 mb-4">最終分數</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData2} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#36a2eb" name="分數" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="button-group">
        <button onClick={handleSubmit} className="submit-btn">
          提交並返回總覽
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
