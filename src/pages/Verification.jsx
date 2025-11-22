import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { useTranslation } from 'react-i18next';
import VerificationSystem from '../utils/verificationSystem';
import BottomNavBar from '../components/BottomNavBar';
import './Verification.css';

/**
 * 榮譽認證頁面
 * 說明認證內容、申請流程，並提供申請表單
 */
function Verification() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userData } = useUser();
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [canApply, setCanApply] = useState({ canApply: false, reason: '' });

  // 表單狀態
  const [formData, setFormData] = useState({
    socialAccountType: 'facebook',
    socialAccount: '',
    videoLink: '',
    description: '',
  });

  // 訊息狀態
  const [message, setMessage] = useState({ type: '', text: '' });

  // 載入認證狀態
  const loadVerificationStatus = useCallback(async () => {
    try {
      setLoading(true);
      const status = await VerificationSystem.getVerificationStatus();
      setVerificationStatus(status);

      // 檢查是否可以申請
      const canApplyResult = await VerificationSystem.canApplyForVerification();
      // 將 reasonCode 轉換為翻譯文字
      if (canApplyResult.reasonCode) {
        if (canApplyResult.reasonCode === 'COOLDOWN') {
          canApplyResult.reason = t('verification.messages.cooldown', {
            days: canApplyResult.reasonData?.days || 7,
          });
        } else {
          // 將大寫的 reasonCode 轉換為小寫的翻譯鍵值
          const reasonKey = `verification.errors.${canApplyResult.reasonCode.toLowerCase()}`;
          canApplyResult.reason = t(reasonKey) || canApplyResult.reason;
        }
      }
      setCanApply(canApplyResult);
    } catch (error) {
      console.error('載入認證狀態失敗:', error);
      setMessage({
        type: 'error',
        text: t('verification.errors.loadFailed'),
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadVerificationStatus();
  }, [loadVerificationStatus]);

  // 處理表單輸入
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 提交申請
  const handleSubmit = async e => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // 驗證表單
    if (!formData.socialAccount.trim()) {
      setMessage({
        type: 'error',
        text: t('verification.errors.socialAccountRequired'),
      });
      return;
    }

    // 驗證影片連結格式（如果有輸入才驗證）
    if (formData.videoLink.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(formData.videoLink.trim())) {
        setMessage({
          type: 'error',
          text: t('verification.errors.invalidVideoLink'),
        });
        return;
      }
    }

    try {
      setLoading(true);

      const result = await VerificationSystem.createVerificationRequest({
        socialAccountType: formData.socialAccountType,
        socialAccount: formData.socialAccount.trim(),
        videoLink: formData.videoLink.trim(),
        description: formData.description.trim(),
      });

      if (result.success) {
        setMessage({
          type: 'success',
          text: t('verification.errors.submitSuccess', { number: result.applicationNumber }),
        });

        // 重置表單
        setFormData({
          socialAccountType: 'facebook',
          socialAccount: '',
          videoLink: '',
          description: '',
        });

        // 重新載入狀態
        await loadVerificationStatus();
      } else {
        setMessage({
          type: 'error',
          text: result.message || t('verification.errors.submitFailed'),
        });
      }
    } catch (error) {
      console.error('提交申請失敗:', error);
      setMessage({
        type: 'error',
        text: t('verification.errors.submitFailed'),
      });
    } finally {
      setLoading(false);
    }
  };

  // 獲取狀態顯示文字
  const getStatusText = () => {
    if (!verificationStatus) {
      return {
        text: t('verification.status.loading'),
        icon: '⏳',
        className: 'status-loading',
      };
    }

    switch (verificationStatus.status) {
      case 'verified':
        return {
          text: t('verification.status.verified'),
          icon: '🏅',
          className: 'status-verified',
        };
      case 'pending':
        return {
          text: t('verification.status.pending'),
          icon: '⏳',
          className: 'status-pending',
          description: t('verification.status.pendingDescription'),
        };
      case 'approved':
        return {
          text: t('verification.status.approved'),
          icon: '✅',
          className: 'status-approved',
        };
      case 'rejected':
        return {
          text: t('verification.status.rejected'),
          icon: '❌',
          className: 'status-rejected',
        };
      case 'not_applied':
        return {
          text: t('verification.status.notApplied'),
          icon: '✨',
          className: 'status-not-applied',
          description: t('verification.status.notAppliedDescription'),
        };
      default:
        return {
          text: t('verification.status.loading'),
          icon: '⏳',
          className: 'status-loading',
        };
    }
  };

  const statusInfo = getStatusText();

  return (
    <>
      <div className="verification-page">
        <div className="verification-container">
        {/* 頁面標題 */}
        <div className="verification-header">
          <h1 className="verification-title">
            <span className="title-icon">🏅</span>
            {t('verification.title')}
          </h1>
        </div>

        {/* 認證狀態顯示 */}
        {verificationStatus && (
          <div className={`verification-status ${statusInfo.className}`}>
            <span className="status-icon">{statusInfo.icon}</span>
            <span className="status-text">{statusInfo.text}</span>
            {statusInfo.description && (
              <p className="status-description">{statusInfo.description}</p>
            )}
            {verificationStatus.request && (
              <div className="status-details">
                <p>
                  {t('verification.statusDetails.applicationNumber')} {verificationStatus.request.applicationNumber}
                </p>
                <p>
                  {t('verification.statusDetails.applicationTime')} {new Date(
                    verificationStatus.request.createdAt
                  ).toLocaleString()}
                </p>
                {verificationStatus.request.status === 'rejected' &&
                  verificationStatus.request.rejectionReason && (
                    <p className="rejection-reason">
                      {t('verification.statusDetails.rejectionReason')}{' '}
                      {verificationStatus.request.rejectionReason === '__NO_REASON_PROVIDED__'
                        ? t('verification.statusDetails.noReasonProvided')
                        : verificationStatus.request.rejectionReason}
                    </p>
                  )}
              </div>
            )}
            {verificationStatus.userData?.isVerified && (
              <div className="verified-info">
                <p>
                  {t('verification.statusDetails.verifiedScore')} {verificationStatus.userData.verifiedLadderScore}
                </p>
                <p>
                  {t('verification.statusDetails.verifiedTime')} {verificationStatus.userData.verifiedAt
                    ? new Date(
                        verificationStatus.userData.verifiedAt
                      ).toLocaleString()
                    : '-'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 認證說明區塊 */}
        <div className="verification-info-section">
          <div className="info-card">
            <h2 className="info-title">
              <span className="info-icon">📋</span>
              {t('verification.info.whatIs.title')}
            </h2>
            <p className="info-content">
              {t('verification.info.whatIs.content')}
            </p>
          </div>

          <div className="info-card">
            <h2 className="info-title">
              <span className="info-icon">✨</span>
              {t('verification.info.benefits.title')}
            </h2>
            <ul className="info-list">
              <li>{t('verification.info.benefits.item1')}</li>
              <li>{t('verification.info.benefits.item2')}</li>
              <li>{t('verification.info.benefits.item3')}</li>
              <li>{t('verification.info.benefits.item4')}</li>
            </ul>
          </div>

          <div className="info-card">
            <h2 className="info-title">
              <span className="info-icon">📝</span>
              {t('verification.process.title')}
            </h2>
            <ol className="info-list ordered">
              <li>
                <strong>{t('verification.process.step1')}</strong>
                <ul className="info-sublist">
                  <li>{t('verification.process.step1Details.item1')}</li>
                  <li>{t('verification.process.step1Details.item2')}</li>
                </ul>
              </li>
              <li>
                <strong>{t('verification.process.step2')}</strong>
                <div className="video-requirements">
                  <p className="requirements-title">
                    {t('verification.process.step2Details.title')}
                  </p>
                  
                  {/* 力量動作詳細說明 */}
                  <div className="strength-exercises-detail">
                    <p className="strength-title">
                      {t('verification.process.step2Details.strength.title')}
                    </p>
                    
                    {/* 平板臥推 */}
                    <div className="exercise-detail-card">
                      <h4 className="exercise-name">
                        {t('verification.process.step2Details.strength.exercises.benchPress.name')}
                      </h4>
                      <ul className="exercise-requirements">
                        {t('verification.process.step2Details.strength.exercises.benchPress.requirements', { returnObjects: true }).map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 深蹲 */}
                    <div className="exercise-detail-card">
                      <h4 className="exercise-name">
                        {t('verification.process.step2Details.strength.exercises.squat.name')}
                      </h4>
                      <ul className="exercise-requirements">
                        {t('verification.process.step2Details.strength.exercises.squat.requirements', { returnObjects: true }).map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 硬舉 */}
                    <div className="exercise-detail-card">
                      <h4 className="exercise-name">
                        {t('verification.process.step2Details.strength.exercises.deadlift.name')}
                      </h4>
                      <ul className="exercise-requirements">
                        {t('verification.process.step2Details.strength.exercises.deadlift.requirements', { returnObjects: true }).map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 滑輪下拉 */}
                    <div className="exercise-detail-card">
                      <h4 className="exercise-name">
                        {t('verification.process.step2Details.strength.exercises.latPulldown.name')}
                      </h4>
                      <ul className="exercise-requirements">
                        {t('verification.process.step2Details.strength.exercises.latPulldown.requirements', { returnObjects: true }).map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 站姿肩推 */}
                    <div className="exercise-detail-card">
                      <h4 className="exercise-name">
                        {t('verification.process.step2Details.strength.exercises.shoulderPress.name')}
                      </h4>
                      <ul className="exercise-requirements">
                        {t('verification.process.step2Details.strength.exercises.shoulderPress.requirements', { returnObjects: true }).map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    <p className="requirements-note">
                      {t('verification.process.step2Details.strength.generalNote')}
                    </p>
                  </div>

                  {/* 爆發力測試 */}
                  <div className="test-category">
                    <p className="test-title">
                      <strong>{t('verification.process.step2Details.power.title')}</strong>
                    </p>
                    <ul className="info-sublist">
                      <li>{t('verification.process.step2Details.power.items')}</li>
                      <li>{t('verification.process.step2Details.power.requirement')}</li>
                    </ul>
                  </div>

                  {/* 心肺耐力 */}
                  <div className="test-category">
                    <p className="test-title">
                      <strong>{t('verification.process.step2Details.cardio.title')}</strong>
                    </p>
                    <ul className="info-sublist">
                      <li>{t('verification.process.step2Details.cardio.items')}</li>
                      <li>{t('verification.process.step2Details.cardio.requirement')}</li>
                    </ul>
                  </div>

                  {/* 身體組成 */}
                  <div className="test-category">
                    <p className="test-title">
                      <strong>{t('verification.process.step2Details.bodyComposition.title')}</strong>
                    </p>
                    <ul className="info-sublist">
                      <li>{t('verification.process.step2Details.bodyComposition.requirement')}</li>
                      <li>{t('verification.process.step2Details.bodyComposition.note')}</li>
                    </ul>
                  </div>
                </div>
              </li>
              <li>
                <strong>{t('verification.process.step3')}</strong>
                <p className="step-note">{t('verification.process.step3Note')}</p>
                
                {/* ✅ 新增：Facebook 社團連結區塊 */}
                <div className="facebook-group-section">
                  <h4 className="facebook-group-title">
                    {t('verification.process.step3FacebookGroup.title')}
                  </h4>
                  <p className="facebook-group-description">
                    {t('verification.process.step3FacebookGroup.description')}
                  </p>
                  {/* 如果社團已創立，顯示連結；否則顯示即將開放訊息 */}
                  {t('verification.process.step3FacebookGroup.link') !== 'https://www.facebook.com/groups/your-group-name' ? (
                    <a
                      href={t('verification.process.step3FacebookGroup.link')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="facebook-group-link"
                    >
                      {t('verification.process.step3FacebookGroup.linkText')} →
                    </a>
                  ) : (
                    <p className="facebook-group-coming-soon">
                      {t('verification.process.step3FacebookGroup.comingSoon')}
                    </p>
                  )}
                </div>
              </li>
              <li>{t('verification.process.step4')}</li>
              <li>{t('verification.process.step5')}</li>
              <li>{t('verification.process.step6')}</li>
            </ol>
          </div>
        </div>

        {/* 申請表單 */}
        {verificationStatus?.status !== 'verified' &&
          verificationStatus?.status !== 'pending' && (
            <div className="verification-form-section">
              <h2 className="form-title">{t('verification.form.title')}</h2>

              {!canApply.canApply && canApply.reason && (
                <div className="form-warning">
                  <span className="warning-icon">⚠️</span>
                  <span className="warning-text">{canApply.reason}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="verification-form">
                <div className="form-group">
                  <label htmlFor="socialAccountType" className="form-label">
                    {t('verification.form.socialPlatformLabel')} <span className="required">*</span>
                  </label>
                  <select
                    id="socialAccountType"
                    name="socialAccountType"
                    value={formData.socialAccountType}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="socialAccount" className="form-label">
                    {t('verification.form.socialAccountLabel')} <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="socialAccount"
                    name="socialAccount"
                    value={formData.socialAccount}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={t('verification.form.placeholder.socialAccount')}
                    required
                    disabled={!canApply.canApply || loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="videoLink" className="form-label">
                    {t('verification.form.videoLink')}
                  </label>
                  <input
                    type="url"
                    id="videoLink"
                    name="videoLink"
                    value={formData.videoLink}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={t('verification.form.placeholder.videoLink')}
                    disabled={!canApply.canApply || loading}
                  />
                  <small className="form-hint">
                    {t('verification.form.hint.videoLink')}
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    {t('verification.form.descriptionLabel')}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder={t('verification.form.placeholder.description')}
                    rows="4"
                    disabled={!canApply.canApply || loading}
                  />
                </div>

                {message.text && (
                  <div className={`form-message message-${message.type}`}>
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="form-submit-btn"
                  disabled={!canApply.canApply || loading}
                >
                  {loading ? t('verification.form.submittingButton') : t('verification.form.submitButton')}
                </button>
              </form>
            </div>
          )}

        {/* 申請歷史 */}
        {verificationStatus?.status === 'rejected' && (
          <div className="verification-history-section">
            <h2 className="history-title">{t('verification.history.title')}</h2>
            <p className="history-hint">
              {t('verification.history.hint')}
            </p>
          </div>
        )}
      </div>
    </div>
    <BottomNavBar />
    </>
  );
}

export default Verification;

