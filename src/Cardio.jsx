import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import * as standards from './standards';
import PropTypes from 'prop-types';
import './Cardio.css';
import { useTranslation } from 'react-i18next';

function Cardio({ onComplete }) {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { age, gender } = userData;
  const { t } = useTranslation();

  const [distance, setDistance] = useState(
    userData.testInputs?.cardio?.distance || ''
  );
  const [score, setScore] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (distance) {
      const updatedTestInputs = {
        ...userData.testInputs,
        cardio: { ...userData.testInputs?.cardio, distance },
      };
      setUserData(prev => ({ ...prev, testInputs: updatedTestInputs }));
    }
  }, [distance, setUserData, userData.testInputs]);

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

  const calculateScoreFromStandard = (value, standard) => {
    // 取得標準的最小與最大值
    const min = standard[60]; // 60分對應的距離
    const max = standard[100]; // 100分對應的距離
    if (value <= 0) return 0;
    if (value <= min) return Math.round((value / min) * 60 * 100) / 100; // 0~60分線性
    if (value >= max) return 100;
    // 60~100分之間線性插值
    return Math.round((60 + ((value - min) / (max - min)) * 40) * 100) / 100;
  };

  const getComment = (score, gender) => {
    const genderValue =
      gender === '男性' || gender.toLowerCase() === 'male' ? 'male' : 'female';
    const scoreRange = Math.floor(score / 10) * 10;

    const comments = {
      male: {
        0: '兄弟，該動起來了！全力衝刺吧！',
        10: '還不夠熱血！再加把勁，衝上去！',
        20: '起步了！再加速，展現你的實力！',
        30: '進步中！再拼一點，突破極限吧！',
        40: '不錯！再猛一點，超越自己！',
        50: '很棒了！再衝刺，成為王者吧！',
        60: '強者氣勢！再加速，稱霸全場！',
        70: '超強！熱血沸騰，繼續衝刺！',
        80: '頂尖表現！再拼，成為傳說！',
        90: '無敵了！你是真正的王者，保持！',
        100: '無敵了！你是真正的王者，保持！',
      },
      female: {
        0: '親愛的，別氣餒，慢慢進步哦！',
        10: '再努力一點，你會更好的，加油！',
        20: '小進步了！繼續加油，你很棒！',
        30: '進步了呢！再努力一點，會更好哦！',
        40: '很棒了！再加把勁，你會更棒的！',
        50: '表現很好！再努力一點，超棒的！',
        60: '好厲害！繼續保持，你很棒哦！',
        70: '真的很棒！保持下去，你最棒了！',
        80: '太厲害了！繼續努力，你超棒的！',
        90: '完美表現！超棒的你，繼續保持！',
        100: '完美表現！超棒的你，繼續保持！',
      },
    };

    return comments[genderValue][scoreRange] || '加油！';
  };

  const calculateCardioScore = () => {
    if (!distance || !age || !gender) {
      alert(t('tests.cardioErrors.missingPrerequisites'));
      return;
    }

    const distanceNum = parseFloat(distance);
    const ageRange = getAgeRange(age);

    if (!distanceNum || !ageRange) {
      alert(t('tests.cardioErrors.invalidInputs'));
      return;
    }

    const genderValue =
      gender === '男性' || gender.toLowerCase() === 'male' ? 'male' : 'female';
    const cooperStandards =
      genderValue === 'male'
        ? standards.cooperStandardsMale
        : standards.cooperStandardsFemale;

    const standard = cooperStandards[ageRange];

    if (!standard) {
      alert(t('tests.cardioErrors.standardsNotFound'));
      return;
    }

    const score = calculateScoreFromStandard(distanceNum, standard);
    setScore(score);
    console.log(
      'Cardio.js - 計算心肺耐力分數:',
      score,
      '距離:',
      distanceNum,
      '年齡段:',
      ageRange
    );
  };

  const handleSubmit = async () => {
    if (!score) {
      alert(t('tests.cardioErrors.needCalculate'));
      return;
    }

    const isGuest = sessionStorage.getItem('guestMode') === 'true';

    try {
      if (submitting) return;
      setSubmitting(true);
      // 準備更新的數據
      const updatedScores = {
        ...userData.scores,
        cardio: parseFloat(score),
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
        distance: parseFloat(distance),
        score: parseFloat(score),
      };
      if (onComplete && typeof onComplete === 'function') {
        onComplete(testData);
      }
      navigate('/user-info', { state: { from: '/cardio' } });
    } catch (error) {
      console.error('提交失敗:', error);
      if (!isGuest) {
        alert(t('tests.cardioErrors.updateUserFail'));
      }
      navigate('/user-info', { state: { from: '/cardio' } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cardio-container">
      <div className="input-section">
        <h1 className="text-2xl font-bold text-center mb-4">
          {t('tests.cardioTitle')}
        </h1>
        <p>
          {t('common.ageLabel')}：{age || t('common.notEntered')}
        </p>
        <p>
          {t('common.genderLabel')}：{gender || t('common.notSelected')}
        </p>

        <div className="exercise-section">
          <h2 className="text-lg font-semibold">
            {t('tests.cardioInfo.cooperTitle')}
          </h2>
          <label
            htmlFor="distance"
            className="block text-sm font-medium text-gray-700"
          >
            {t('tests.cardioLabels.distanceMeters')}
          </label>
          <input
            id="distance"
            name="distance"
            type="number"
            placeholder={t('tests.cardioLabels.distanceMeters')}
            value={distance}
            onChange={e => setDistance(e.target.value)}
            className="input-field"
            required
          />
          <button onClick={calculateCardioScore} className="calculate-btn">
            {t('common.calculate')}
          </button>
          {score !== null && (
            <>
              <p className="score-display">
                {t('tests.cardioLabels.score')}: {score}
              </p>
              <p className="score-display">{getComment(score, gender)}</p>
            </>
          )}
        </div>

        <div className="description-section">
          <div className="description-card">
            <div
              className="description-header"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <h2 className="text-lg font-semibold">
                {t('tests.cardioInfo.sectionTitle')}
              </h2>
              <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded ? '▲' : '▼'}
              </span>
            </div>
            {isExpanded && (
              <div className="description-content">
                <p className="font-semibold">
                  {t('tests.cardioInfo.introTitle')}
                </p>
                <p>{t('tests.cardioInfo.introText')}</p>
                <p className="font-semibold mt-2">
                  {t('tests.cardioInfo.measureLabel')}
                </p>
                <ul className="list-disc pl-5">
                  <li>{t('tests.cardioInfo.items.place')}</li>
                  <li>{t('tests.cardioInfo.items.record')}</li>
                  <li>{t('tests.cardioInfo.items.warmup')}</li>
                </ul>
                <p className="mt-2 text-sm text-gray-600">
                  {t('tests.cardioInfo.sourceNote')}
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
    </div>
  );
}

Cardio.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default Cardio;
