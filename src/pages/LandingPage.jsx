import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../LandingPage.css';

function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();

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
          {/* ✅ 主標題更新：真身覺醒 */}
          <h2 className="hero-title">
            真身覺醒
          </h2>
          {/* ✅ 副標題更新：五維評測．顯現你的潛在系別 */}
          <p className="hero-subtitle">
            五維評測．顯現你的潛在系別
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
        {/* 已移除首頁示意圖與標語，保持版面乾淨 */}
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

