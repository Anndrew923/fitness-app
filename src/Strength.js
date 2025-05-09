import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import * as standards from './standards';
import debounce from 'lodash/debounce';
import './Strength.css'; // 引入外部 CSS 文件

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

function Strength() {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { gender, height, weight, age } = userData;

  const [benchPress, setBenchPress] = useState({
    weight: userData.testInputs?.strength?.benchPress?.weight || '',
    reps: userData.testInputs?.strength?.benchPress?.reps || '',
    max: null,
    score: null,
  });
  const [squat, setSquat] = useState({
    weight: userData.testInputs?.strength?.squat?.weight || '',
    reps: userData.testInputs?.strength?.squat?.reps || '',
    max: null,
    score: null,
  });
  const [deadlift, setDeadlift] = useState({
    weight: userData.testInputs?.strength?.deadlift?.weight || '',
    reps: userData.testInputs?.strength?.deadlift?.reps || '',
    max: null,
    score: null,
  });
  const [latPulldown, setLatPulldown] = useState({
    weight: userData.testInputs?.strength?.latPulldown?.weight || '',
    reps: userData.testInputs?.strength?.latPulldown?.reps || '',
    max: null,
    score: null,
  });
  const [shoulderPress, setShoulderPress] = useState({
    weight: userData.testInputs?.strength?.shoulderPress?.weight || '',
    reps: userData.testInputs?.strength?.shoulderPress?.reps || '',
    max: null,
    score: null,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetUserData = useCallback(
    debounce((newUserData) => {
      setUserData(newUserData);
    }, 1000),
    [setUserData]
  );

  useEffect(() => {
    const updatedTestInputs = {
      ...userData.testInputs,
      strength: {
        benchPress: { weight: benchPress.weight, reps: benchPress.reps },
        squat: { weight: squat.weight, reps: squat.reps },
        deadlift: { weight: deadlift.weight, reps: deadlift.reps },
        latPulldown: { weight: latPulldown.weight, reps: latPulldown.reps },
        shoulderPress: { weight: shoulderPress.weight, reps: shoulderPress.reps },
      },
    };
    const newUserData = { ...userData, testInputs: updatedTestInputs };
    debouncedSetUserData(newUserData);
  }, [benchPress, squat, deadlift, latPulldown, shoulderPress, userData, debouncedSetUserData]);

  const calculateScore = (value, standard) => {
    const { Beginner, Novice, Intermediate, Advanced, Elite } = standard;
    if (value < Beginner) return 0;
    if (value >= Elite) return 100;
    if (value >= Advanced) return 80 + ((100 - 80) * (value - Advanced)) / (Elite - Advanced);
    if (value >= Intermediate) return 60 + ((80 - 60) * (value - Intermediate)) / (Advanced - Intermediate);
    if (value >= Novice) return 40 + ((60 - 40) * (value - Novice)) / (Intermediate - Novice);
    if (value >= Beginner) return 20 + ((40 - 20) * (value - Beginner)) / (Novice - Beginner);
    return 0;
  };

  const standardMap = useMemo(() => ({
    benchPress: {
      bodyweight: gender === 'female' ? standards.bodyweightStandardsFemaleBenchPress : standards.bodyweightStandardsMaleBenchPress,
      age: gender === 'female' ? standards.ageStandardsFemaleBenchPress : standards.ageStandardsMaleBenchPress,
    },
    squat: {
      bodyweight: gender === 'female' ? standards.bodyweightStandardsFemaleSquat : standards.bodyweightStandardsMaleSquat,
      age: gender === 'female' ? standards.ageStandardsFemaleSquat : standards.ageStandardsMaleSquat,
    },
    deadlift: {
      bodyweight: gender === 'female' ? standards.bodyweightStandardsFemaleDeadlift : standards.bodyweightStandardsMaleDeadlift,
      age: gender === 'female' ? standards.ageStandardsFemaleDeadlift : standards.ageStandardsMaleDeadlift,
    },
    latPulldown: {
      bodyweight: gender === 'female' ? standards.bodyweightStandardsFemaleLatPulldown : standards.bodyweightStandardsMaleLatPulldown,
      age: gender === 'female' ? standards.ageStandardsFemaleLatPulldown : standards.ageStandardsMaleLatPulldown,
    },
    shoulderPress: {
      bodyweight: gender === 'female' ? standards.bodyweightStandardsFemaleShoulderPress : standards.bodyweightStandardsMaleShoulderPress,
      age: gender === 'female' ? standards.ageStandardsFemaleShoulderPress : standards.ageStandardsMaleShoulderPress,
    },
  }), [gender]);

  const calculateMaxStrength = useCallback((weight, reps, setState, type) => {
    if (!weight || !reps) return alert('請輸入重量和次數！');
    const weightNum = parseFloat(weight);
    const repsNum = parseFloat(reps);
    const userWeight = parseFloat(userData.weight);
    const userAge = parseFloat(age);
    if (!userWeight || !userAge) return alert('請確保已輸入有效的體重和年齡！');
    if (repsNum > 12) {
      alert('可完成次數不得超過12次，請重新輸入！');
      setState(prev => ({ ...prev, reps: '' }));
      return;
    }

    const valueToCompare = weightNum / (1.0278 - 0.0278 * repsNum);
    const standardsForType = standardMap[type];
    const weightKeys = Object.keys(standardsForType.bodyweight).map(Number);
    const ageKeys = Object.keys(standardsForType.age).map(Number);
    const closestWeight = weightKeys.reduce((prev, curr) => Math.abs(curr - userWeight) < Math.abs(prev - userWeight) ? curr : prev);
    const closestAge = ageKeys.reduce((prev, curr) => Math.abs(curr - userAge) < Math.abs(prev - userAge) ? curr : prev);
    const bodyweightStandard = standardsForType.bodyweight[closestWeight];
    const ageStandard = standardsForType.age[closestAge];
    const scoreByBodyweight = calculateScore(valueToCompare, bodyweightStandard);
    const scoreByAge = calculateScore(valueToCompare, ageStandard);
    const finalScore = ((scoreByBodyweight + scoreByAge) / 2).toFixed(0);

    setState(prev => ({ ...prev, max: valueToCompare.toFixed(1), score: finalScore }));
  }, [standardMap, userData.weight, age]);

  const getAverageScoreComment = (score, gender) => {
    const genderValue = gender === '男性' || gender.toLowerCase() === 'male' ? 'male' : 'female';
    if (score >= 80) return genderValue === 'male' ? '無敵強者！你是力量之王，繼續稱霸！' : '太驚艷了！你是力量女神，超棒的！';
    if (score >= 70) return genderValue === 'male' ? '超猛表現！頂尖水準，衝向巔峰吧！' : '真的很傑出！表現超棒，繼續保持哦！';
    if (score >= 60) return genderValue === 'male' ? '很強！超越業餘極限，再拼一把！' : '表現超棒！超越大多數人，你很厲害！';
    if (score >= 50) return genderValue === 'male' ? '不錯的水準！再加把勁，突破極限！' : '很棒的水準！再努力一點，你會更好！';
    return genderValue === 'male' ? '兄弟，該衝了！全力以赴，突破自己！' : '親愛的，還有進步空間，繼續加油哦！';
  };

  const radarData = useMemo(() => ({
    labels: ['臥推', '深蹲', '硬舉', '滑輪下拉', '站姿肩推'],
    datasets: [{
      label: '力量評測分數',
      data: [benchPress.score || 0, squat.score || 0, deadlift.score || 0, latPulldown.score || 0, shoulderPress.score || 0],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
    }],
  }), [benchPress.score, squat.score, deadlift.score, latPulldown.score, shoulderPress.score]);

  const radarOptions = useMemo(() => ({
    scales: { r: { min: 0, max: 100, ticks: { stepSize: 20 } } },
    plugins: { legend: { position: 'top' } },
  }), []);

  const scores = [benchPress.score, squat.score, deadlift.score, latPulldown.score, shoulderPress.score].filter(score => score !== null);
  const averageScore = scores.length > 0 ? (scores.reduce((a, b) => a + parseFloat(b), 0) / scores.length).toFixed(0) : null;

  const handleSubmit = async () => {
    if (!averageScore) return alert('請至少完成一項評測！');
    try {
      const updatedScores = { ...userData.scores, strength: parseFloat(averageScore) };
      await setUserData({ ...userData, scores: updatedScores });
      navigate('/user-info', { replace: false });
    } catch (error) {
      alert('更新用戶數據或導航失敗，請稍後再試！');
    }
  };

  return (
    <div className="strength-container">
      <h1 className="text-2xl font-bold text-center mb-4">力量評測</h1>
      <p>性別：{gender || '未選擇'}</p>
      <p>身高：{height ? `${height} 公分` : '未輸入'}</p>
      <p>體重：{weight ? `${weight} 公斤` : '未輸入'}</p>
      <p>年齡：{age || '未輸入'}</p>

      <div className="instructions-btn-container">
        <button onClick={() => navigate('/strength-instructions')} className="nav-btn">動作說明</button>
      </div>

      <div className="standards-card">
        <div className="standards-header" onClick={() => setIsExpanded(!isExpanded)}>
          <h2 className="text-lg font-semibold">評測標準說明</h2>
          <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>{isExpanded ? '▲' : '▼'}</span>
        </div>
        {isExpanded && (
          <div className="standards-content">
            <p>我們的評測標準基於 Strength Level 用戶提供的超過 1.34 億次舉重數據，涵蓋男女標準，適用於臥推、深蹲、硬舉、肩推等多項健身動作。</p>
            <p className="mt-2 text-sm text-gray-600">來源：<a href="https://strengthlevel.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://strengthlevel.com/</a></p>
          </div>
        )}
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">臥推</h2>
        <input type="number" placeholder="重量 (kg)" value={benchPress.weight} onChange={e => setBenchPress(prev => ({ ...prev, weight: e.target.value }))} className="input-field" />
        <input type="number" placeholder="次數 (12次以下較準確)" value={benchPress.reps} onChange={e => setBenchPress(prev => ({ ...prev, reps: e.target.value }))} className="input-field" />
        <button onClick={() => calculateMaxStrength(benchPress.weight, benchPress.reps, setBenchPress, 'benchPress')} className="calculate-btn">計算</button>
        {benchPress.max && <p>最大力量 (1RM): {benchPress.max} kg</p>}
        {benchPress.score && <p className="score-display">分數: {benchPress.score}</p>}
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">深蹲</h2>
        <input type="number" placeholder="重量 (kg)" value={squat.weight} onChange={e => setSquat(prev => ({ ...prev, weight: e.target.value }))} className="input-field" />
        <input type="number" placeholder="次數 (12次以下較準確)" value={squat.reps} onChange={e => setSquat(prev => ({ ...prev, reps: e.target.value }))} className="input-field" />
        <button onClick={() => calculateMaxStrength(squat.weight, squat.reps, setSquat, 'squat')} className="calculate-btn">計算</button>
        {squat.max && <p>最大力量 (1RM): {squat.max} kg</p>}
        {squat.score && <p className="score-display">分數: {squat.score}</p>}
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">硬舉</h2>
        <input type="number" placeholder="重量 (kg)" value={deadlift.weight} onChange={e => setDeadlift(prev => ({ ...prev, weight: e.target.value }))} className="input-field" />
        <input type="number" placeholder="次數 (12次以下較準確)" value={deadlift.reps} onChange={e => setDeadlift(prev => ({ ...prev, reps: e.target.value }))} className="input-field" />
        <button onClick={() => calculateMaxStrength(deadlift.weight, deadlift.reps, setDeadlift, 'deadlift')} className="calculate-btn">計算</button>
        {deadlift.max && <p>最大力量 (1RM): {deadlift.max} kg</p>}
        {deadlift.score && <p className="score-display">分數: {deadlift.score}</p>}
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">滑輪下拉</h2>
        <input type="number" placeholder="重量 (kg)" value={latPulldown.weight} onChange={e => setLatPulldown(prev => ({ ...prev, weight: e.target.value }))} className="input-field" />
        <input type="number" placeholder="次數 (12次以下較準確)" value={latPulldown.reps} onChange={e => setLatPulldown(prev => ({ ...prev, reps: e.target.value }))} className="input-field" />
        <button onClick={() => calculateMaxStrength(latPulldown.weight, latPulldown.reps, setLatPulldown, 'latPulldown')} className="calculate-btn">計算</button>
        {latPulldown.max && <p>最大力量: {latPulldown.max} kg</p>}
        {latPulldown.score && <p className="score-display">分數: {latPulldown.score}</p>}
      </div>

      <div className="exercise-section">
        <h2 className="text-lg font-semibold">站姿肩推</h2>
        <input type="number" placeholder="重量 (kg)" value={shoulderPress.weight} onChange={e => setShoulderPress(prev => ({ ...prev, weight: e.target.value }))} className="input-field" />
        <input type="number" placeholder="次數 (12次以下較準確)" value={shoulderPress.reps} onChange={e => setShoulderPress(prev => ({ ...prev, reps: e.target.value }))} className="input-field" />
        <button onClick={() => calculateMaxStrength(shoulderPress.weight, shoulderPress.reps, setShoulderPress, 'shoulderPress')} className="calculate-btn">計算</button>
        {shoulderPress.max && <p>最大力量 (1RM): {shoulderPress.max} kg</p>}
        {shoulderPress.score && <p className="score-display">分數: {shoulderPress.score}</p>}
      </div>

      <div className="radar-chart">
        <Radar data={radarData} options={radarOptions} />
      </div>
      {averageScore && (
        <div className="average-score-section">
          <p className="average-score">平均分數: {averageScore}</p>
          <p className="average-comment">{getAverageScoreComment(averageScore, gender)}</p>
        </div>
      )}

      <div className="button-group">
        <button onClick={handleSubmit} className="submit-btn">提交並返回總覽</button>
      </div>
    </div>
  );
}

export default Strength;