import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

function GuestModal({ open, onClose, onRegister }) {
  const { t } = useTranslation();

  if (!open) return null;
  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.35)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '32px 24px',
          minWidth: '320px',
          maxWidth: '90vw',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <h2 style={{ marginBottom: '16px', color: '#667eea' }}>
          {t('guestMode.modal.title')}
        </h2>
        <p style={{ marginBottom: '24px', color: '#444' }}>
          {t('guestMode.modal.message')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button
            onClick={onRegister}
            style={{
              padding: '10px 24px',
              background: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(102,126,234,0.08)',
            }}
          >
            {t('guestMode.modal.registerButton')}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              background: '#eee',
              color: '#333',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {t('guestMode.modal.cancelButton')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

GuestModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
};

export default GuestModal;
