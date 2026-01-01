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
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
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
        className="modal-content"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-icon">{getIcon()}</span>
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
