import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import * as standards from './standards';
import PropTypes from 'prop-types';
import './Power.css';

function Power({ onComplete, clearTestData }) {
  const { userData, setUserData, saveUserData } = useUser();
  const navigate = useNavigate();
  const { age, gender } = userData;

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
  });
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isStandardsExpanded, setIsStandardsExpanded] = useState(false);

  useEffect(() => {
    const updatedTestInputs = {
      ...userData.testInputs,
      power: { verticalJump, standingLongJump, sprint },
    };
    setUserData(prev => ({ ...prev, testInputs: updatedTestInputs }));
  }, [verticalJump, standingLongJump, sprint]);

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
    if (value >= standard[100]) return 100;
    if (value < standard[50])
      return ((value - standard[0]) / (standard[50] - standard[0])) * 50;
    return 50 + ((value - standard[50]) / (standard[100] - standard[50])) * 50;
  };

  const calculateScoreDecreasing = (value, standard) => {
    if (value > standard[0]) return 0;
    if (value <= standard[100]) return 100;
    if (value > standard[50])
      return ((standard[0] - value) / (standard[0] - standard[50])) * 50;
    return 50 + ((standard[50] - value) / (standard[50] - standard[100])) * 50;
  };

  const calculatePowerScore = () => {
    if (!age || !gender) {
      alert('請確保已在用戶信息中輸入年齡和性別！');
      return;
    }
    if (!verticalJump && !standingLongJump && !sprint) {
      alert('請至少輸入一項動作數據！');
      return;
    }

    const ageRange = getAgeRange(age);
    if (!ageRange) {
      alert('請輸入有效的年齡！');
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
      alert('無法找到對應的評測標準，請檢查年齡和性別！');
      return;
    }

    const verticalJumpNum = verticalJump ? parseFloat(verticalJump) : null;
    const standingLongJumpNum = standingLongJump
      ? parseFloat(standingLongJump)
      : null;
    const sprintNum = sprint ? parseFloat(sprint) : null;

    const verticalJumpScore =
      verticalJumpNum !== null
        ? calculateScoreIncreasing(verticalJumpNum, verticalJumpStandard)
        : null;
    const standingLongJumpScore =
      standingLongJumpNum !== null
        ? calculateScoreIncreasing(
            standingLongJumpNum,
            standingLongJumpStandard
          )
        : null;
    const sprintScore =
      sprintNum !== null
        ? calculateScoreDecreasing(sprintNum, sprintStandard)
        : null;

    const scores = [
      verticalJumpScore,
      standingLongJumpScore,
      sprintScore,
    ].filter(score => score !== null);
    if (scores.length === 0) {
      alert('請至少完成一項動作的測量！');
      return;
    }

    const finalScore = (
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    ).toFixed(1);

    setResult({
      verticalJumpScore:
        verticalJumpScore !== null ? verticalJumpScore.toFixed(1) : null,
      standingLongJumpScore:
        standingLongJumpScore !== null
          ? standingLongJumpScore.toFixed(1)
          : null,
      sprintScore: sprintScore !== null ? sprintScore.toFixed(1) : null,
      finalScore,
    });
  };

  const handleSubmit = async () => {
    if (!result.finalScore) {
      alert('請先計算爆發力分數！');
      return;
    }

    const isGuest = sessionStorage.getItem('guestMode') === 'true';

    try {
      // 準備更新的數據
      const updatedScores = {
        ...userData.scores,
        explosivePower: parseFloat(result.finalScore),
      };
      const updatedUserData = {
        ...userData,
        scores: updatedScores,
      };

      setUserData(updatedUserData);

      if (!isGuest) {
        const success = await saveUserData(updatedUserData);
        if (!success) throw new Error('保存數據失敗');
      }

      // 準備測試數據
      const testData = {
        verticalJump: verticalJump || null,
        standingLongJump: standingLongJump || null,
        sprint: sprint || null,
        finalScore: result.finalScore,
      };
      if (onComplete && typeof onComplete === 'function') {
        onComplete(testData);
      }
      setTimeout(() => {
        navigate('/user-info', { state: { from: '/explosive-power' } });
      }, 100);
    } catch (error) {
      console.error('Power.js - 更新 UserContext 或導航失敗:', error);
      if (!isGuest) {
        alert('更新用戶數據失敗，請稍後再試！');
      }
      setTimeout(() => {
        navigate('/user-info', { state: { from: '/explosive-power' } });
      }, 100);
    }
  };

  return (
    <div className="power-container">
      <div className="input-section">
        <h1 className="text-2xl font-bold text-center mb-4">爆發力測試</h1>
        <p>年齡：{age || '未輸入'}</p>
        <p>性別：{gender || '未選擇'}</p>

        <div className="exercise-section">
          <h2 className="text-lg font-semibold">爆發力動作</h2>
          <label
            htmlFor="verticalJump"
            className="block text-sm font-medium text-gray-700"
          >
            垂直彈跳 (公分)
          </label>
          <input
            id="verticalJump"
            name="verticalJump"
            type="number"
            placeholder="垂直彈跳 (公分)"
            value={verticalJump}
            onChange={e => setVerticalJump(e.target.value)}
            className="input-field"
          />
          <label
            htmlFor="standingLongJump"
            className="block text-sm font-medium text-gray-700"
          >
            立定跳遠 (公分)
          </label>
          <input
            id="standingLongJump"
            name="standingLongJump"
            type="number"
            placeholder="立定跳遠 (公分)"
            value={standingLongJump}
            onChange={e => setStandingLongJump(e.target.value)}
            className="input-field"
          />
          <label
            htmlFor="sprint"
            className="block text-sm font-medium text-gray-700"
          >
            100公尺衝刺跑 (秒)
          </label>
          <input
            id="sprint"
            name="sprint"
            type="number"
            placeholder="100公尺衝刺跑 (秒)"
            value={sprint}
            onChange={e => setSprint(e.target.value)}
            className="input-field"
          />
          <button onClick={calculatePowerScore} className="calculate-btn">
            計算
          </button>
          {result.finalScore && (
            <>
              {result.verticalJumpScore && (
                <p className="score-display">
                  垂直彈跳分數: {result.verticalJumpScore}
                </p>
              )}
              {result.standingLongJumpScore && (
                <p className="score-display">
                  立定跳遠分數: {result.standingLongJumpScore}
                </p>
              )}
              {result.sprintScore && (
                <p className="score-display">
                  100公尺衝刺跑分數: {result.sprintScore}
                </p>
              )}
              <p className="score-display">最終分數: {result.finalScore}</p>
            </>
          )}
        </div>

        <div className="description-section">
          <div className="description-card">
            <div
              className="description-header"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              <h2 className="text-lg font-semibold">動作說明</h2>
              <span
                className={`arrow ${isDescriptionExpanded ? 'expanded' : ''}`}
              >
                {isDescriptionExpanded ? '▲' : '▼'}
              </span>
            </div>
            {isDescriptionExpanded && (
              <div className="description-content">
                <p className="exercise-title">垂直彈跳</p>
                <p className="exercise-description">
                  測量垂直跳躍高度，反映下肢爆發力。站立時伸手觸及最高點，然後全力跳起觸及最高點，兩者高度差即為垂直彈跳高度（單位：公分）。
                </p>
                <p className="exercise-title mt-2">立定跳遠</p>
                <p className="exercise-description">
                  測量站立跳躍距離，反映下肢力量和協調性。雙腳站立於起跳線，無助跑直接跳出，測量起跳線(腳尖)到著地點(腳跟)最近處的距離（單位：公分）。
                </p>
                <p className="exercise-title mt-2">100公尺衝刺跑</p>
                <p className="exercise-description">
                  測量短距離衝刺速度，反映全身爆發力和速度。從靜止起跑，盡全力衝刺100公尺，記錄完成時間（單位：秒）。
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  建議：測量前充分熱身，避免受傷。使用專業設備或在標準場地進行測量以確保準確性。
                </p>
              </div>
            )}
          </div>

          <div className="standards-card">
            <div
              className="standards-header"
              onClick={() => setIsStandardsExpanded(!isStandardsExpanded)}
            >
              <h2 className="text-lg font-semibold">檢測標準說明</h2>
              <span
                className={`arrow ${isStandardsExpanded ? 'expanded' : ''}`}
              >
                {isStandardsExpanded ? '▲' : '▼'}
              </span>
            </div>
            {isStandardsExpanded && (
              <div className="standards-content">
                <p className="font-semibold">來源：</p>
                <p>
                  參考教育部體育署體適能網站、美國運動醫學會（ACSM）、世界田徑協會及全國中等學校運動會田徑標準。
                </p>
                <p className="font-semibold mt-2">依據：</p>
                <ul className="list-disc pl-5">
                  <li>原地垂直彈跳：ACSM標準與青少年數據。</li>
                  <li>立定跳遠：教育部常模與ACSM衰退研究。</li>
                  <li>100公尺衝刺跑：世界田徑與全國運動會標準。</li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  本測驗包含推測值：12-80歲全齡數據不全，依ACSM每10年下降10-15%、性別差異70-90%推估。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="button-group">
        <button onClick={handleSubmit} className="submit-btn">
          提交並返回總覽
        </button>
      </div>
    </div>
  );
}

Power.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default Power;
