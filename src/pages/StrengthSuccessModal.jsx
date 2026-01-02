import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

function StrengthSuccessModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#1a202c',
          borderRadius: '16px',
          padding: '32px 24px',
          width: '90%',
          maxWidth: '360px',
          textAlign: 'center',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'white',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚔️</div>
        <h3
          style={{
            fontSize: '24px',
            fontWeight: '900',
            color: '#f87171',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {t('tests.gamified.questComplete')}
        </h3>
        <p
          style={{
            color: '#e2e8f0',
            marginBottom: '32px',
            lineHeight: '1.6',
            fontSize: '15px',
          }}
        >
          {t('tests.gamified.strength_desc')}
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <button
            onClick={() => {
              onClose();
              navigate('/user-info');
            }}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              color: 'white',
              fontWeight: '800',
              fontSize: '16px',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {t('tests.gamified.check_stats')}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: '#cbd5e0',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {t('tests.gamified.stay')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

StrengthSuccessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default StrengthSuccessModal;

