import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import * as standards from './standards';
import PropTypes from 'prop-types';
import './Power.css';
import { useTranslation } from 'react-i18next';

function Power({ onComplete }) {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { age, gender } = userData;
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
  });
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isStandardsExpanded, setIsStandardsExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      alert(t('tests.powerErrors.needMeasure'));
      return;
    }

    const finalScore = (
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    ).toFixed(2);

    setResult({
      verticalJumpScore:
        verticalJumpScore !== null ? verticalJumpScore.toFixed(2) : null,
      standingLongJumpScore:
        standingLongJumpScore !== null
          ? standingLongJumpScore.toFixed(2)
          : null,
      sprintScore: sprintScore !== null ? sprintScore.toFixed(2) : null,
      finalScore,
    });
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
      // 準備更新的數據
      const updatedScores = {
        ...userData.scores,
        explosivePower: parseFloat(result.finalScore),
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
        verticalJump: verticalJump || null,
        standingLongJump: standingLongJump || null,
        sprint: sprint || null,
        finalScore: result.finalScore,
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
              </p>
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
    </div>
  );
}

Power.propTypes = {
  onComplete: PropTypes.func,
  clearTestData: PropTypes.func,
};

export default Power;
