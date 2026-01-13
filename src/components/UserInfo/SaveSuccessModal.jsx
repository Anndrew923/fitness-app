import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './Phase0TempStyles.css';

const SaveSuccessModal = ({ isOpen, onClose, onNavigate }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className="save-success-overlay" onClick={handleOverlayClick}>
      <div className="save-success-content" onClick={e => e.stopPropagation()}>
        {/* Icon & Title */}
        <div className="save-success-header">
          <div className="save-success-icon">💾</div>
          <h3 className="save-success-title">{t('saveSuccessModal.title')}</h3>
        </div>

        {/* Description */}
        <div className="save-success-body">
          <p className="save-success-quote">{t('saveSuccessModal.quote')}</p>
          <p className="save-success-text">
            {t('saveSuccessModal.message')}
          </p>
        </div>

        {/* Actions */}
        <div className="save-success-footer">
          <button
            onClick={onClose}
            className="save-success-button save-success-button-secondary"
          >
            {t('saveSuccessModal.stayHere')}
          </button>
          <button
            onClick={onNavigate}
            className="save-success-button save-success-button-primary"
          >
            {t('saveSuccessModal.goToHistory')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

SaveSuccessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default SaveSuccessModal;
