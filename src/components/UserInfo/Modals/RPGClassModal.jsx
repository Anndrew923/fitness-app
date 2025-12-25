import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './Modals.css';

const RPGClassModal = ({ isOpen, onClose, classInfo }) => {
  const { t } = useTranslation();

  // 阻止背景滾動
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

  // ✅ Phase 1.7 防禦性修正：即使 classInfo 為空也顯示 Modal（顯示預設內容）
  if (!isOpen) return null;

  // ✅ Phase 1.7 防禦性修正：提供安全的預設值
  const safeClassInfo = classInfo || {
    icon: '❓',
    name: '未知職業',
    description: '尚未覺醒的潛在力量...',
    class: 'UNKNOWN',
  };

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={handleOverlayClick}
    >
      {/* 卡片本體 */}
      <div
        style={{
          position: 'relative',
          width: '85%',
          maxWidth: '500px',
          backgroundColor: '#1E1E1E',
          borderRadius: '20px',
          border: '2px solid #FF5722',
          padding: '25px',
          boxShadow:
            '0 0 30px rgba(255, 87, 34, 0.8), 0 0 60px rgba(255, 87, 34, 0.4)',
          animation: 'rpgModalSlideIn 0.4s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 標題區域 */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '1px solid rgba(255, 87, 34, 0.3)',
          }}
        >
          <div
            style={{
              fontSize: '40px',
              marginBottom: '10px',
              textAlign: 'center',
            }}
          >
            {safeClassInfo.icon || '❓'}
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#FFD700',
              textAlign: 'center',
              textShadow:
                '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
            }}
          >
            {safeClassInfo.class && safeClassInfo.class !== 'UNKNOWN'
              ? t(`userInfo.classDescription.${safeClassInfo.class.toLowerCase()}.title`)
              : t('userInfo.classDescription.unknown.title', '未知職業')}
          </h3>
        </div>

        {/* 描述內容 */}
        <div
          style={{
            fontSize: '16px',
            color: '#E0E0E0',
            lineHeight: '26px',
            textAlign: 'justify',
            marginBottom: '25px',
            minHeight: '80px',
          }}
        >
          {safeClassInfo.class && safeClassInfo.class !== 'UNKNOWN'
            ? t(`userInfo.classDescription.${safeClassInfo.class.toLowerCase()}.desc`)
            : t('userInfo.classDescription.unknown.desc', '尚未覺醒的潛在力量...')}
        </div>

        {/* 確認按鈕 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={onClose}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClose();
              }
            }}
            style={{
              backgroundColor: '#FF5722',
              padding: '12px 30px',
              borderRadius: '25px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #FF8A65',
              boxShadow:
                '0 4px 15px rgba(255, 87, 34, 0.5), 0 0 20px rgba(255, 87, 34, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '120px',
              outline: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.setProperty(
                'background-color',
                '#FF7043',
                'important'
              );
              e.currentTarget.style.setProperty(
                'border-color',
                '#FFAB91',
                'important'
              );
              e.currentTarget.style.setProperty(
                'transform',
                'translateY(-2px)',
                'important'
              );
              e.currentTarget.style.setProperty(
                'box-shadow',
                '0 6px 25px rgba(255, 87, 34, 0.7), 0 0 30px rgba(255, 87, 34, 0.4)',
                'important'
              );
            }}
            onMouseLeave={e => {
              e.currentTarget.style.setProperty(
                'background-color',
                '#FF5722',
                'important'
              );
              e.currentTarget.style.setProperty(
                'border-color',
                '#FF8A65',
                'important'
              );
              e.currentTarget.style.setProperty(
                'transform',
                'translateY(0)',
                'important'
              );
              e.currentTarget.style.setProperty(
                'box-shadow',
                '0 4px 15px rgba(255, 87, 34, 0.5), 0 0 20px rgba(255, 87, 34, 0.3)',
                'important'
              );
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                userSelect: 'none',
              }}
            >
              確 認
            </span>
          </div>
        </div>
      </div>

      {/* 添加動畫樣式 */}
      <style>{`
        @keyframes rpgModalSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
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

RPGClassModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classInfo: PropTypes.shape({
    icon: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
  }),
};

export default RPGClassModal;
