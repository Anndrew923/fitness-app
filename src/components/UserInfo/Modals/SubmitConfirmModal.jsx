import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './Modals.css';

const SubmitConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  remainingCount,
}) => {
  const { t } = useTranslation();

  // ✅ 新增：阻止背景滾動
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';

      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="submit-confirm-overlay" onClick={handleOverlayClick}>
      <div
        className="submit-confirm-content"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-icon">🏆</span>
          <h3 className="modal-title">{t('userInfo.submitConfirm.title')}</h3>
        </div>
        <div className="modal-body">
          <div className="submit-confirm-message">
            <p className="confirm-text">
              {t('userInfo.submitConfirm.descPrefix')}{' '}
              <span className="remaining-count">{remainingCount}</span>{' '}
              {t('userInfo.submitConfirm.descSuffix')}
            </p>

            {/* 新增：限制資訊顯示 */}
            <div className="limit-info">
              <div className="limit-item">
                <span className="limit-icon">🔄</span>
                <span className="limit-text">
                  {t('userInfo.limits.remainingUpdates', {
                    count: remainingCount,
                  })}
                </span>
              </div>
              <div className="limit-item">
                <span className="limit-icon">⏰</span>
                <span className="limit-text">
                  {t('userInfo.limits.nextResetTime')}
                </span>
              </div>
            </div>

            <div className="confirm-details">
              <div className="detail-item">
                <span className="detail-icon">📊</span>
                <span className="detail-text">
                  {t('userInfo.submitConfirm.ensureAccuracy')}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">⏰</span>
                <span className="detail-text">
                  {t('userInfo.submitConfirm.resetDaily')}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🎯</span>
                <span className="detail-text">
                  {t('userInfo.submitConfirm.improveValue')}
                </span>
              </div>
            </div>

            {/* ✅ 新增：內容規範提醒 */}
            <div className="moderation-notice">
              <div className="moderation-notice-header">
                <span className="moderation-icon">⚠️</span>
                <strong>{t('moderationNotice.title')}</strong>
              </div>
              <div className="moderation-notice-content">
                <p>{t('moderationNotice.description')}</p>
                <p>{t('moderationNotice.ensure')}</p>
                <ul>
                  <li>{t('moderationNotice.avoid.inappropriate')}</li>
                  <li>{t('moderationNotice.avoid.sensitive')}</li>
                  <li>{t('moderationNotice.avoid.uncomfortable')}</li>
                </ul>
                <p className="moderation-warning">
                  <strong>{t('moderationNotice.warning')}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer submit-confirm-footer">
          <button className="modal-btn modal-btn-secondary" onClick={onCancel}>
            {t('userInfo.submitConfirm.cancel')}
          </button>
          <button className="modal-btn modal-btn-success" onClick={onConfirm}>
            {t('userInfo.submitConfirm.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

SubmitConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  remainingCount: PropTypes.number.isRequired,
};

export default SubmitConfirmModal;
