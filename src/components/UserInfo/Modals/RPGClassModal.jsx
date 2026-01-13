import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './Modals.css';
import '../Phase0TempStyles.css';

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
    <div className="rpg-modal-overlay" onClick={handleOverlayClick}>
      {/* 卡片本體 */}
      <div className="rpg-modal-card" onClick={e => e.stopPropagation()}>
        {/* 標題區域 */}
        <div className="rpg-modal-header">
          <div className="rpg-modal-icon-large">
            {safeClassInfo.icon || '❓'}
          </div>
          <h3 className="rpg-modal-title">
            {safeClassInfo.class && safeClassInfo.class !== 'UNKNOWN'
              ? t(`userInfo.classDescription.${safeClassInfo.class.toLowerCase()}.title`)
              : t('userInfo.classDescription.unknown.title', '未知職業')}
          </h3>
        </div>

        {/* 描述內容 */}
        <div className="rpg-modal-description">
          {safeClassInfo.class && safeClassInfo.class !== 'UNKNOWN'
            ? t(`userInfo.classDescription.${safeClassInfo.class.toLowerCase()}.desc`)
            : t('userInfo.classDescription.unknown.desc', '尚未覺醒的潛在力量...')}
        </div>

        {/* 確認按鈕 */}
        <div className="rpg-modal-footer">
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
            className="rpg-modal-button"
          >
            <span className="rpg-modal-button-text">
              {t('common.confirm')}
            </span>
          </div>
        </div>
      </div>
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
