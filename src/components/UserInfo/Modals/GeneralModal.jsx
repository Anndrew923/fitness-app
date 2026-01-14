import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import logger from '../../../utils/logger';
import './Modals.css';

const GeneralModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onAction = null,
  actionText = null,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg
            className="magitek-icon magitek-icon-success"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="14" stroke="#00ff9d" strokeWidth="2" />
            <path
              d="M10 16 L14 20 L22 12"
              stroke="#00ff9d"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className="magitek-icon magitek-icon-error"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="14" stroke="#ff4757" strokeWidth="2" />
            <path
              d="M12 12 L20 20 M20 12 L12 20"
              stroke="#ff4757"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className="magitek-icon magitek-icon-warning"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 8 L24 24 L8 24 Z"
              stroke="#ffa502"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="16" cy="18" r="1.5" fill="#ffa502" />
            <path d="M16 12 L16 15" stroke="#ffa502" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg
            className="magitek-icon magitek-icon-info"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="14" stroke="#4dabf7" strokeWidth="2" />
            <circle cx="16" cy="12" r="1.5" fill="#4dabf7" />
            <path d="M16 16 L16 22" stroke="#4dabf7" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'warning':
        return 'modal-btn modal-btn-warning';
      case 'success':
        return 'modal-btn modal-btn-success';
      case 'error':
        return 'modal-btn modal-btn-error';
      default:
        return 'modal-btn modal-btn-info';
    }
  };

  const handleClose = () => {
    logger.debug('Modal close button clicked');
    onClose();
  };

  const handleOverlayClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      logger.debug('Modal overlay clicked');
      onClose();
    }
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className={`modal-content magitek-modal magitek-modal-${type}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-icon-wrapper">{getIcon()}</div>
          <h3 className="modal-title">{title}</h3>
        </div>
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        <div className="modal-footer">
          {onAction && actionText ? (
            <div className="modal-footer-actions">
              <button
                className={getButtonClass()}
                onClick={handleAction}
              >
                {actionText || t('common.confirm')}
              </button>
              <button
                className="modal-btn modal-btn-secondary"
                onClick={handleClose}
              >
                {t('common.cancel')}
              </button>
            </div>
          ) : (
            <button
              className={getButtonClass()}
              onClick={handleClose}
            >
              {t('common.confirm')}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

GeneralModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'warning', 'success', 'error']),
  onAction: PropTypes.func,
  actionText: PropTypes.string,
};

export default GeneralModal;
