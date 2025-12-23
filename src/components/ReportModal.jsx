import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ReportSystem from '../utils/reportSystem';
import './ReportModal.css';

function ReportModal({ isOpen, onClose, reportedUser }) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [reportType, setReportType] = useState('both'); // 舉報類型狀態
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'

  const reportReasons = [
    { value: 'inappropriate', label: t('report.reasons.inappropriate') },
    { value: 'offensive', label: t('report.reasons.offensive') },
    { value: 'spam', label: t('report.reasons.spam') },
    { value: 'other', label: t('report.reasons.other') },
  ];

  const handleSubmit = async e => {
    e.preventDefault();
    if (!reason) {
      setMessage(t('report.selectReason'));
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const result = await ReportSystem.reportUser(
        reportedUser.id,
        reportType,
        reason,
        description
      );

      if (result.success) {
        setMessage(result.message);
        setMessageType('success');
        // 2秒後自動關閉
        setTimeout(() => {
          onClose();
          // 重置表單
          setReason('');
          setDescription('');
          setReportType('both'); // 重置為預設值
          setMessage('');
          setMessageType('');
        }, 2000);
      } else {
        setMessage(result.message);
        setMessageType('error');
      }
    } catch (error) {
      console.error('舉報失敗:', error);
      setMessage(t('report.error'));
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // 重置表單
    setReason('');
    setDescription('');
    setReportType('both'); // 重置為預設值
    setMessage('');
    setMessageType('');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="report-modal-overlay" onClick={handleClose}>
      <div className="report-modal" onClick={e => e.stopPropagation()}>
        <div className="report-modal-header">
          <h3>{t('report.title')}</h3>
          <button className="report-modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="report-modal-content">
          <form onSubmit={handleSubmit}>
            {/* 舉報類型選擇 */}
            <div className="report-form-group">
              <label htmlFor="report-type">
                {t('report.reportType.label')} <span className="required">*</span>
              </label>
              <select
                id="report-type"
                value={reportType}
                onChange={e => setReportType(e.target.value)}
                required
                disabled={submitting}
              >
                <option value="nickname">{t('report.reportType.nickname')}</option>
                <option value="avatar">{t('report.reportType.avatar')}</option>
                <option value="both">{t('report.reportType.both')}</option>
              </select>
            </div>

            <div className="report-form-group">
              <label htmlFor="report-reason">
                {t('report.reason')} <span className="required">*</span>
              </label>
              <select
                id="report-reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                disabled={submitting}
              >
                <option value="">{t('report.selectReason')}</option>
                {reportReasons.map(r => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="report-form-group">
              <label htmlFor="report-description">
                {t('report.description')}
              </label>
              <textarea
                id="report-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t('report.descriptionPlaceholder')}
                rows={4}
                maxLength={200}
                disabled={submitting}
              />
              <div className="report-char-count">
                {description.length}/200
              </div>
            </div>

            {message && (
              <div
                className={`report-message ${
                  messageType === 'success' ? 'success' : 'error'
                }`}
              >
                {message}
              </div>
            )}

            <div className="report-modal-actions">
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="report-btn report-btn-cancel"
              >
                {t('report.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting || !reason}
                className="report-btn report-btn-submit"
              >
                {submitting ? t('report.submitting') : t('report.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

ReportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reportedUser: PropTypes.object.isRequired,
};

export default ReportModal;
