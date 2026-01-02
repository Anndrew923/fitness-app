import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CardioSuccessModal({ 
  isOpen, 
  onClose, 
  activeTab, 
  navigate 
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(5px)'
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1a202c',
          borderRadius: '16px',
          padding: '32px 24px',
          width: '90%',
          maxWidth: '360px',
          textAlign: 'center',
          boxShadow: '0 0 25px rgba(255, 165, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))' }}>
          {activeTab === '5km' ? '🏆' : '⚔️'}
        </div>
        
        <h3 style={{ 
          fontSize: '24px', 
          fontWeight: '900', 
          color: '#fbbf24',
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontFamily: 'sans-serif' 
        }}>
          {t('tests.gamified.questComplete', 'QUEST COMPLETED')}
        </h3>
        
        <p style={{ color: '#cbd5e0', marginBottom: '32px', lineHeight: '1.6', fontSize: '15px' }}>
          {activeTab === '5km' 
            ? t('tests.gamified.5km_desc', 'Your endurance feat has been inscribed in the Hall of Legends!')
            : t('tests.gamified.cooper_desc', 'Combat data synced. Your tactical potential has increased.')
          }
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeTab === '5km' && (
            <button
              onClick={() => { 
                onClose(); 
                navigate('/ladder', { 
                  state: { 
                    targetTab: 'cardio', 
                    activeTab: 'cardio',
                    subTab: '5km',
                    filter: '5km',
                    scrollTo: 'top',
                    forceRefresh: true
                  } 
                }); 
              }}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white',
                fontWeight: '800',
                fontSize: '16px',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'transform 0.2s'
              }}
            >
              {t('tests.gamified.view_rank', 'CLAIM GLORY')}
            </button>
          )}

          {activeTab === 'cooper' && (
            <button
              onClick={() => { 
                onClose(); 
                navigate('/user-info');
              }}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: 'white',
                fontWeight: '800',
                fontSize: '16px',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {t('tests.gamified.check_stats', 'CHECK STATS')}
            </button>
          )}
          
          <button
            onClick={onClose}
            style={{
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent',
              color: '#a0aec0',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {t('tests.gamified.stay', 'REST & RECOVER')}
          </button>
        </div>
      </div>
    </div>
  );
}

