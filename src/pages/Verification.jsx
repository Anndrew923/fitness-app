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
      setCanApply(canApplyResult);
    } catch (error) {
      console.error('載入認證狀態失敗:', error);
      setMessage({
        type: 'error',
        text: '載入認證狀態失敗，請稍後再試',
      });
    } finally {
      setLoading(false);
    }
  }, []);

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
        text: '請輸入社群帳號',
      });
      return;
    }

    if (!formData.videoLink.trim()) {
      setMessage({
        type: 'error',
        text: '請輸入訓練影片連結',
      });
      return;
    }

    // 驗證影片連結格式（簡單驗證）
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(formData.videoLink.trim())) {
      setMessage({
        type: 'error',
        text: '請輸入有效的影片連結（需以 http:// 或 https:// 開頭）',
      });
      return;
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
          text: `申請已提交！申請編號：${result.applicationNumber}`,
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
          text: result.message || '申請失敗，請稍後再試',
        });
      }
    } catch (error) {
      console.error('提交申請失敗:', error);
      setMessage({
        type: 'error',
        text: '申請失敗，請稍後再試',
      });
    } finally {
      setLoading(false);
    }
  };

  // 獲取狀態顯示文字
  const getStatusText = () => {
    if (!verificationStatus) {
      return '';
    }

    switch (verificationStatus.status) {
      case 'verified':
        return {
          text: '您已通過榮譽認證',
          icon: '🏅',
          className: 'status-verified',
        };
      case 'pending':
        return {
          text: '您的申請正在審核中',
          icon: '⏳',
          className: 'status-pending',
        };
      case 'approved':
        return {
          text: '您的申請已通過',
          icon: '✅',
          className: 'status-approved',
        };
      case 'rejected':
        return {
          text: '您的申請已被拒絕',
          icon: '❌',
          className: 'status-rejected',
        };
      case 'not_applied':
        return {
          text: '尚未申請認證',
          icon: '📝',
          className: 'status-not-applied',
        };
      default:
        return {
          text: '載入中...',
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
            {t('verification.title') || '榮譽認證'}
          </h1>
        </div>

        {/* 認證狀態顯示 */}
        {verificationStatus && (
          <div className={`verification-status ${statusInfo.className}`}>
            <span className="status-icon">{statusInfo.icon}</span>
            <span className="status-text">{statusInfo.text}</span>
            {verificationStatus.request && (
              <div className="status-details">
                <p>
                  申請編號：{verificationStatus.request.applicationNumber}
                </p>
                <p>
                  申請時間：
                  {new Date(
                    verificationStatus.request.createdAt
                  ).toLocaleString('zh-TW')}
                </p>
                {verificationStatus.request.status === 'rejected' &&
                  verificationStatus.request.rejectionReason && (
                    <p className="rejection-reason">
                      拒絕原因：{verificationStatus.request.rejectionReason}
                    </p>
                  )}
              </div>
            )}
            {verificationStatus.userData?.isVerified && (
              <div className="verified-info">
                <p>
                  認證分數：{verificationStatus.userData.verifiedLadderScore}
                </p>
                <p>
                  認證時間：
                  {verificationStatus.userData.verifiedAt
                    ? new Date(
                        verificationStatus.userData.verifiedAt
                      ).toLocaleString('zh-TW')
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
              什麼是榮譽認證？
            </h2>
            <p className="info-content">
              榮譽認證是官方對您訓練成果的認可。通過認證後，您的天梯分數旁邊會顯示認證徽章，讓其他用戶知道您的分數已獲得官方認證。
            </p>
          </div>

          <div className="info-card">
            <h2 className="info-title">
              <span className="info-icon">✨</span>
              認證的好處
            </h2>
            <ul className="info-list">
              <li>天梯分數旁邊顯示認證徽章 🏅</li>
              <li>天梯名片顯示「榮譽認證」標記</li>
              <li>提升您的訓練成果可信度</li>
              <li>讓其他用戶更容易信任您的分數</li>
            </ul>
          </div>

          <div className="info-card">
            <h2 className="info-title">
              <span className="info-icon">📝</span>
              申請流程
            </h2>
            <ol className="info-list ordered">
              <li>完成所有評測項目並提交天梯分數</li>
              <li>透過 FB、IG 等社群將訓練影片傳給管理員</li>
              <li>填寫申請表單（社群帳號、影片連結）</li>
              <li>等待管理員審核（通常 1-3 個工作天）</li>
              <li>審核通過後，您的分數將顯示認證徽章</li>
            </ol>
          </div>
        </div>

        {/* 申請表單 */}
        {verificationStatus?.status !== 'verified' &&
          verificationStatus?.status !== 'pending' && (
            <div className="verification-form-section">
              <h2 className="form-title">申請榮譽認證</h2>

              {!canApply.canApply && canApply.reason && (
                <div className="form-warning">
                  <span className="warning-icon">⚠️</span>
                  <span className="warning-text">{canApply.reason}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="verification-form">
                <div className="form-group">
                  <label htmlFor="socialAccountType" className="form-label">
                    社群平台 <span className="required">*</span>
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
                    社群帳號 <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="socialAccount"
                    name="socialAccount"
                    value={formData.socialAccount}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="請輸入您的 FB 或 IG 帳號"
                    required
                    disabled={!canApply.canApply || loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="videoLink" className="form-label">
                    訓練影片連結 <span className="required">*</span>
                  </label>
                  <input
                    type="url"
                    id="videoLink"
                    name="videoLink"
                    value={formData.videoLink}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://..."
                    required
                    disabled={!canApply.canApply || loading}
                  />
                  <small className="form-hint">
                    請提供您在社群平台上傳的訓練影片連結
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    申請說明（選填）
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="可以補充說明您的訓練內容或特殊情況"
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
                  {loading ? '提交中...' : '提交申請'}
                </button>
              </form>
            </div>
          )}

        {/* 申請歷史 */}
        {verificationStatus?.status === 'rejected' && (
          <div className="verification-history-section">
            <h2 className="history-title">申請歷史</h2>
            <p className="history-hint">
              如果您的申請被拒絕，請等待 7 天後再重新申請。
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

