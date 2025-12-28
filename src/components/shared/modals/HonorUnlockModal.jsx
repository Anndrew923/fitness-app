import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './HonorUnlockModal.css';

const CERTIFICATION_ROUTE = '/verification';

const HonorUnlockModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

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

  if (!isOpen) return null;

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleNavigate = () => {
    navigate(CERTIFICATION_ROUTE);
    onClose();
  };

  return createPortal(
    <div className="honor-modal-overlay" onClick={handleOverlayClick}>
      <div className="honor-modal-content" onClick={e => e.stopPropagation()}>
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="honor-modal-close-btn"
          aria-label="關閉"
          style={{
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* 頂部圖標區域 - 金光閃閃的獎杯 */}
        <div className="honor-modal-icon-container">
          <div className="honor-modal-icon-ping"></div>
          <svg
            className="honor-modal-icon"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
          </svg>
        </div>

        {/* 標題與文案 */}
        <h3 className="honor-modal-title">
          ⚡️ 突破極限！<br />見證傳奇時刻
        </h3>

        <div className="honor-modal-body">
          <p className="honor-modal-message">
            <span className="honor-modal-congrats">恭喜！</span> 您的表現已超越標準評分系統的上限（100分）。這不僅是數字，更是頂尖實力的證明！
          </p>
          <p className="honor-modal-info">
            為了維護這份榮耀的公信力，我們誠摯邀請您完成「榮譽認證」。<br />
            <span className="honor-modal-highlight">
              解鎖束縛，讓世界看見您真實的巔峰數據！
            </span>
          </p>
        </div>

        {/* 按鈕區域 */}
        <div className="honor-modal-footer">
          <button
            type="button"
            className="honor-modal-primary-btn"
            onClick={handleNavigate}
            style={{
              backgroundImage: 'linear-gradient(to right, #f97316, #dc2626)',
              borderRadius: '9999px',
              color: '#ffffff',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
            🔥 前往解鎖榮耀
            <svg
              className="honor-modal-arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>

          <button
            type="button"
            className="honor-modal-secondary-btn"
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(38, 38, 38, 1)',
              color: '#9ca3af',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            暫時隱藏實力，稍後再說
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

HonorUnlockModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default HonorUnlockModal;

