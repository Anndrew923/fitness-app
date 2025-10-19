import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { auth } from './firebase';
import LanguageSwitcher from './components/LanguageSwitcher';
import './LandingPage.css';

function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleGuestMode = () => {
    // 設置 guestMode 標記並導向 user-info 的表單區塊
    sessionStorage.setItem('guestMode', 'true');
    navigate('/user-info', { state: { scrollTo: 'form' } });
  };

  const handleStartAssessment = () => {
    if (isAuthenticated) {
      navigate('/user-info');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="app-title">Ultimate Physique</h1>
            <span className="app-subtitle">最強肉體</span>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">
            {t('landing.hero.title', '科學化健身評測，追蹤你的進步')}
          </h2>
          <p className="hero-subtitle">
            {t(
              'landing.hero.subtitle',
              '透過 5 大評測項目，全面了解你的身體素質，與全球用戶一起挑戰天梯排行榜'
            )}
          </p>
          <div className="hero-actions">
            <button
              className="cta-button primary"
              onClick={handleStartAssessment}
            >
              {t('landing.hero.startButton', '立即開始評測')}
            </button>
            <button className="cta-button secondary" onClick={handleGuestMode}>
              {t('landing.hero.guestButton', '訪客模式體驗')}
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="radar-preview">
            <div className="radar-chart-mockup">
              {/* 雷達圖網格 */}
              <div className="radar-grid">
                <div className="grid-circle circle-1"></div>
                <div className="grid-circle circle-2"></div>
                <div className="grid-circle circle-3"></div>
                <div className="grid-circle circle-4"></div>
                <div className="grid-circle circle-5"></div>
              </div>

              {/* 軸線 */}
              <div className="radar-axis axis-1"></div>
              <div className="radar-axis axis-2"></div>
              <div className="radar-axis axis-3"></div>
              <div className="radar-axis axis-4"></div>
              <div className="radar-axis axis-5"></div>

              {/* 數據區域 */}
              <div className="radar-data-area">
                <div className="data-point point-1"></div>
                <div className="data-point point-2"></div>
                <div className="data-point point-3"></div>
                <div className="data-point point-4"></div>
                <div className="data-point point-5"></div>
              </div>

              {/* 中心點 */}
              <div className="radar-center"></div>
            </div>
            <div className="radar-slogan">
              {t('landing.hero.slogan', '打造五邊形全能戰士')}
            </div>
          </div>
        </div>
      </section>

      {/* Footer - 整合詳細資訊 */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-links">
              <a href="/features" className="footer-link">
                {t('landing.footer.features', '功能介紹')}
              </a>
              <a href="/about" className="footer-link">
                {t('landing.footer.about', '關於我們')}
              </a>
              <a href="/privacy-policy" className="footer-link">
                {t('landing.footer.privacy', '隱私政策')}
              </a>
              <a href="/terms" className="footer-link">
                {t('landing.footer.terms', '使用條款')}
              </a>
              <a href="/contact" className="footer-link">
                {t('landing.footer.contact', '聯絡我們')}
              </a>
            </div>
            <div className="footer-copyright">
              <p>© 2025 Ultimate Physique. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default React.memo(LandingPage);
