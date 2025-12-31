import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const SaveSuccessModal = ({ isOpen, onClose, onNavigate }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className="save-success-overlay" style={styles.overlay} onClick={handleOverlayClick}>
      <div className="save-success-content" style={styles.container} onClick={e => e.stopPropagation()}>
        {/* Icon & Title */}
        <div style={styles.header}>
          <div style={styles.icon}>💾</div>
          <h3 style={styles.title}>{t('saveSuccessModal.title')}</h3>
        </div>

        {/* Description */}
        <div style={styles.content}>
          <p style={styles.quote}>{t('saveSuccessModal.quote')}</p>
          <p style={styles.text}>
            {t('saveSuccessModal.message')}
          </p>
        </div>

        {/* Actions */}
        <div style={styles.footer}>
          <button
            onClick={onClose}
            style={{ ...styles.button, ...styles.secondaryButton }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#4a5568';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {t('saveSuccessModal.stayHere')}
          </button>
          <button
            onClick={onNavigate}
            style={{ ...styles.button, ...styles.primaryButton }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#38a169';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#48BB78';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {t('saveSuccessModal.goToHistory')}
          </button>
        </div>
      </div>

      {/* 動畫樣式 */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

// Styles - 內聯樣式以確保獨立性，不依賴外部 CSS
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10002,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  container: {
    width: '90%',
    maxWidth: '340px',
    backgroundColor: '#1E1E1E',
    borderRadius: '16px',
    border: '2px solid #48BB78',
    padding: '24px 20px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'relative',
    margin: 0,
  },
  header: {
    textAlign: 'center',
    marginBottom: '15px',
    borderBottom: '1px solid rgba(72, 187, 120, 0.3)',
    paddingBottom: '15px',
  },
  icon: {
    fontSize: '40px',
    marginBottom: '10px',
  },
  title: {
    margin: 0,
    color: '#48BB78', // 成功綠
    fontSize: '22px',
    fontWeight: 'bold',
    textShadow: '0 0 10px rgba(72, 187, 120, 0.3)',
  },
  content: {
    marginBottom: '25px',
    textAlign: 'center',
  },
  quote: {
    color: '#E0E0E0',
    fontStyle: 'italic',
    marginBottom: '12px',
    fontSize: '15px',
    opacity: 0.9,
  },
  text: {
    color: '#A0AEC0',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
  },
  footer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  primaryButton: {
    backgroundColor: '#48BB78',
    color: 'white',
    boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    border: '1px solid #718096',
    color: '#CBD5E0',
  },
};

SaveSuccessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default SaveSuccessModal;
