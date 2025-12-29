import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useUser } from '../../UserContext';
import { useTranslation } from 'react-i18next';
import HonorUnlockModal from '../../components/shared/modals/HonorUnlockModal';
import BottomNavBar from '../../components/BottomNavBar';
import { ARM_SIZE_LEVELS } from '../../standards';
import './ArmSize.css';

function ArmSize({ onComplete }) {
  const { userData, setUserData } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [armSize, setArmSize] = useState(
    userData.testInputs?.armSize?.arm || userData.testInputs?.armSize?.armSize || ''
  );
  const [bodyFat, setBodyFat] = useState(
    userData.testInputs?.armSize?.bodyFat || 20
  );
  const [score, setScore] = useState(
    userData.testInputs?.armSize?.score || null
  );
  const [rawScore, setRawScore] = useState(
    userData.testInputs?.armSize?.rawScore || null
  );
  const [isCapped, setIsCapped] = useState(
    userData.testInputs?.armSize?.isCapped || false
  );
  const [submitting, setSubmitting] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockModalData, setUnlockModalData] = useState(null);

  const timeoutRef = useRef(null);

  // PAS 计算函数
  const calculatePAS = useCallback(() => {
    if (!armSize || armSize <= 0) {
      setScore(null);
      setRawScore(null);
      setIsCapped(false);
      return;
    }

    const benchmark = 50;
    const fatMultiplier = 1 + (20 - bodyFat) / 100;
    let calculatedScore = (armSize / benchmark) * fatMultiplier * 100;
    calculatedScore = Math.min(Math.round(calculatedScore * 100) / 100, 100); // 修复：统一为两位小数

    const isVerified = userData.isVerified === true;
    let displayScore = calculatedScore;
    let capped = false;

    if (calculatedScore > 100) {
      if (isVerified) {
        displayScore = calculatedScore;
      } else {
        displayScore = 100;
        capped = true;
      }
    }

    setScore(displayScore);
    setRawScore(calculatedScore);
    setIsCapped(capped);
  }, [armSize, bodyFat, userData.isVerified]);

  // 当输入变化时自动计算
  useEffect(() => {
    calculatePAS();
  }, [calculatePAS]);

  // 保存到全局状态
  // 修复：确保保存 arm 和 bodyFat 到 testInputs.armSize，以便天梯读取原始数据
  const flushTestInputs = useCallback(() => {
    const updatedTestInputs = {
      ...userData.testInputs,
      armSize: {
        arm: armSize, // 保存原始臂围数据
        armSize: armSize, // 保持向后兼容
        bodyFat: bodyFat,
        score: score,
        rawScore: rawScore,
        isCapped: isCapped,
      },
    };
    setUserData({ ...userData, testInputs: updatedTestInputs });
  }, [armSize, bodyFat, score, rawScore, isCapped, userData, setUserData]);

  useEffect(() => {
    flushTestInputs();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      flushTestInputs();
    };
  }, [armSize, bodyFat, score, rawScore, isCapped, flushTestInputs]);

  // 根据分数获取等级
  const getLevelFromScore = score => {
    if (!score) return t('tests.armSize_rpg.levels.potentialNewcomer');
    const scoreNum = parseFloat(score);
    if (scoreNum >= 100) return t('tests.armSize_rpg.levels.absoluteSupreme');
    if (scoreNum >= 90) return t('tests.armSize_rpg.levels.mythicalPhysique');
    if (scoreNum >= 80) return t('tests.armSize_rpg.levels.veteranWarrior');
    if (scoreNum >= 60) return t('tests.armSize_rpg.levels.regularTrainee');
    return t('tests.armSize_rpg.levels.potentialNewcomer');
  };

  // 获取反馈信息
  const getArmSizeFeedback = score => {
    const scoreNum = parseFloat(score);
    if (scoreNum >= 100)
      return t('tests.armSize_rpg.feedback.absoluteSupreme');
    if (scoreNum >= 90) return t('tests.armSize_rpg.feedback.mythicalPhysique');
    if (scoreNum >= 80) return t('tests.armSize_rpg.feedback.veteranWarrior');
    if (scoreNum >= 60) return t('tests.armSize_rpg.feedback.regularTrainee');
    return t('tests.armSize_rpg.feedback.potentialNewcomer');
  };

  // 处理解锁按钮点击
  const handleUnlockClick = () => {
    const level = getLevelFromScore(score);
    setUnlockModalData({
      exercise: t('tests.armSize'),
      score: score,
      level: level,
      weight: armSize,
    });
    setIsUnlockModalOpen(true);
  };

  // 提交
  const handleSubmit = async () => {
    flushTestInputs();
    if (!score) return alert(t('tests.armSizeErrors.needCalculate'));
    if (submitting) return;
    setSubmitting(true);

    try {
      const updatedScores = {
        ...userData.scores,
        armSize: parseFloat(score),
      };

      setUserData(prev => ({
        ...prev,
        scores: updatedScores,
        ladderScore: prev.ladderScore || 0,
      }));

      const testData = {
        armSize: armSize,
        bodyFat: bodyFat,
        score: score,
        rawScore: rawScore,
      };

      if (onComplete) {
        onComplete(testData);
      }

      navigate('/user-info', { state: { from: '/arm-size' } });
    } catch (error) {
      console.error('提交失敗:', error);
      alert(t('tests.armSizeErrors.updateFail'));
      navigate('/user-info', { state: { from: '/arm-size' } });
    } finally {
      setSubmitting(false);
    }
  };

  // Map ARM_SIZE_LEVELS with translations and colors
  const scoreLevelsWithTranslations = ARM_SIZE_LEVELS.map((level, index) => {
    const colors = ['#FF6B6B', '#FFA726', '#66BB6A', '#42A5F5', '#9C27B0'];
    return {
      ...level,
      label: t(`tests.armSize_rpg.levels.${level.key}`),
      color: colors[index],
    };
  });

  return (
    <div className="arm-size-container">
      <div className="arm-size-header">
        <h1 className="arm-size-title">
          🦾 {t('tests.armSizeTitle')}
        </h1>
        <p className="arm-size-safety-note">
          {t('tests.armSizeSafetyNote')}
        </p>
      </div>

      {/* 输入区域 */}
      <div className="arm-size-input-section">
        <div className="input-card">
          <div className="input-group">
            <label htmlFor="armSize">
              {t('tests.armSizeLabels.armSize')} (cm)
              <span className="input-hint">
                💪 {t('tests.armSizeLabels.measurementHint')}
              </span>
            </label>
            <input
              id="armSize"
              type="number"
              placeholder={t('tests.armSizeLabels.armSizePlaceholder')}
              value={armSize}
              onChange={e => setArmSize(e.target.value)}
              className="input-field"
              step="0.1"
              min="0"
            />
          </div>

          <div className="input-group">
            <label htmlFor="bodyFat">
              {t('tests.armSizeLabels.bodyFat')} (%)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                id="bodyFat"
                type="range"
                min="5"
                max="40"
                step="0.1"
                value={bodyFat}
                onChange={e => {
                  const newValue = parseFloat(e.target.value);
                  if (!isNaN(newValue)) {
                    setBodyFat(newValue);
                  }
                }}
                className="slider-input"
                style={{ flex: 1 }}
              />
              <input
                type="number"
                min="5"
                max="40"
                step="0.1"
                value={bodyFat}
                onChange={e => {
                  const newValue = parseFloat(e.target.value);
                  if (!isNaN(newValue) && newValue >= 5 && newValue <= 40) {
                    setBodyFat(newValue);
                  }
                }}
                className="input-field"
                style={{ width: '80px', textAlign: 'center' }}
              />
              <span style={{ minWidth: '24px', fontSize: '0.9rem', fontWeight: 600, color: '#81d8d0' }}>%</span>
            </div>
            <div className="slider-labels">
              <span>5%</span>
              <span>40%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 结果显示 */}
      {score !== null && (
        <div className="arm-size-results-section">
          <div className="score-display-card">
            <div className="corner-decoration top-left"></div>
            <div className="corner-decoration top-right"></div>
            <div className="corner-decoration bottom-left"></div>
            <div className="corner-decoration bottom-right"></div>

            <h3>📊 {t('tests.score')}</h3>
            <div className="score-display">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <p className="score-value">
                  {parseFloat(score).toFixed(2)}
                  {rawScore && rawScore > 100 && !isCapped && (
                    <span
                      className="verified-badge"
                      title={t('tests.verifiedBadge')}
                    >
                      {' '}
                      ✓
                    </span>
                  )}
                </p>
                {isCapped && (
                  <button
                    onClick={handleUnlockClick}
                    className="unlock-btn"
                    title={t('actions.unlock_limit')}
                  >
                    <span>🔒</span>
                    <span>{t('actions.unlock_limit')}</span>
                  </button>
                )}
              </div>
              <p className="score-comment">{getArmSizeFeedback(score)}</p>
            </div>

            {/* 等级进度条 */}
            <div className="level-progress-section">
              <h4>{t('tests.armSizeLabels.levelTitle')}</h4>
              <div className="levels-container">
                {scoreLevelsWithTranslations.map((item, index) => (
                  <div key={index} className="level-item">
                    <div className="level-header">
                      <span className="level-name">{item.label}</span>
                      <span className="level-score">{item.score}</span>
                    </div>
                    <div className="level-bar-container">
                      <div
                        className="level-bar"
                        style={{
                          width: `${Math.min((score / item.score) * 100, 100)}%`,
                          background: `linear-gradient(to right, ${item.color}dd, ${item.color})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 提交按钮 */}
      <div className="submit-section">
        <button
          type="button"
          onClick={handleSubmit}
          className="submit-btn"
          disabled={!score || submitting}
        >
          {submitting
            ? t('common.submitting')
            : score
            ? `✅ ${t('common.submitAndReturn')}`
            : t('errors.required')}
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

      <BottomNavBar />
    </div>
  );
}

ArmSize.propTypes = {
  onComplete: PropTypes.func,
};

export default ArmSize;

