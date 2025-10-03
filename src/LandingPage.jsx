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
    // 設置 guestMode 標記並導向 user-info
    sessionStorage.setItem('guestMode', 'true');
    navigate('/user-info');
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

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h3 className="section-title">
            {t('landing.features.title', '核心功能特色')}
          </h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💪</div>
              <h4 className="feature-title">
                {t('landing.features.strength.title', '力量評測')}
              </h4>
              <p className="feature-desc">
                {t(
                  'landing.features.strength.desc',
                  '深蹲測試，評估下肢力量與穩定性'
                )}
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h4 className="feature-title">
                {t('landing.features.power.title', '爆發力評測')}
              </h4>
              <p className="feature-desc">
                {t(
                  'landing.features.power.desc',
                  '垂直跳躍、立定跳遠、衝刺測試'
                )}
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">❤️</div>
              <h4 className="feature-title">
                {t('landing.features.cardio.title', '心肺耐力')}
              </h4>
              <p className="feature-desc">
                {t(
                  'landing.features.cardio.desc',
                  '跑步測試，評估心血管健康狀況'
                )}
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🥩</div>
              <h4 className="feature-title">
                {t('landing.features.muscle.title', '肌肉量評估')}
              </h4>
              <p className="feature-desc">
                {t('landing.features.muscle.desc', '骨骼肌肉量計算與分析')}
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4 className="feature-title">
                {t('landing.features.bodyfat.title', '體脂分析')}
              </h4>
              <p className="feature-desc">
                {t(
                  'landing.features.bodyfat.desc',
                  'FFMI 指數計算，科學評估體脂率'
                )}
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h4 className="feature-title">
                {t('landing.features.ladder.title', '天梯排行榜')}
              </h4>
              <p className="feature-desc">
                {t(
                  'landing.features.ladder.desc',
                  '與全球用戶競爭，激勵持續進步'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <h3 className="section-title">
            {t('landing.stats.title', '應用數據')}
          </h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">5</div>
              <div className="stat-label">
                {t('landing.stats.assessments', '大評測項目')}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100</div>
              <div className="stat-label">
                {t('landing.stats.scoring', '分評分系統')}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">
                {t('landing.stats.availability', '全天候服務')}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2</div>
              <div className="stat-label">
                {t('landing.stats.languages', '種語言支援')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section className="users-section">
        <div className="container">
          <h3 className="section-title">
            {t('landing.users.title', '適用人群')}
          </h3>
          <div className="users-grid">
            <div className="user-card">
              <div className="user-icon">💪</div>
              <h4 className="user-title">
                {t('landing.users.fitness.title', '健身愛好者')}
              </h4>
              <p className="user-desc">
                {t('landing.users.fitness.desc', '追蹤訓練效果，設定健身目標')}
              </p>
            </div>
            <div className="user-card">
              <div className="user-icon">🏃</div>
              <h4 className="user-title">
                {t('landing.users.athletes.title', '運動員')}
              </h4>
              <p className="user-desc">
                {t('landing.users.athletes.desc', '評估體能狀態，優化訓練計畫')}
              </p>
            </div>
            <div className="user-card">
              <div className="user-icon">👨‍🏫</div>
              <h4 className="user-title">
                {t('landing.users.coaches.title', '健身教練')}
              </h4>
              <p className="user-desc">
                {t('landing.users.coaches.desc', '教學輔助工具，學員評估')}
              </p>
            </div>
            <div className="user-card">
              <div className="user-icon">🎯</div>
              <h4 className="user-title">
                {t('landing.users.general.title', '一般用戶')}
              </h4>
              <p className="user-desc">
                {t('landing.users.general.desc', '了解身體狀況，開始健身之旅')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h3 className="cta-title">
              {t('landing.cta.title', '準備好開始你的健身評測之旅了嗎？')}
            </h3>
            <p className="cta-subtitle">
              {t('landing.cta.subtitle', '立即註冊或使用訪客模式開始體驗')}
            </p>
            <div className="cta-actions">
              <button
                className="cta-button primary large"
                onClick={handleStartAssessment}
              >
                {t('landing.cta.startButton', '立即開始評測')}
              </button>
              <button
                className="cta-button secondary large"
                onClick={handleGuestMode}
              >
                {t('landing.cta.guestButton', '訪客模式體驗')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="info-section">
        <div className="container">
          <div className="info-content">
            <h3 className="info-title">
              {t('landing.info.title', '了解更多')}
            </h3>
            <p className="info-subtitle">
              {t('landing.info.subtitle', '深入了解我們的評測系統和團隊背景')}
            </p>
            <div className="info-buttons">
              <button
                className="info-button primary"
                onClick={() => navigate('/features')}
              >
                <div className="button-icon">🔬</div>
                <div className="button-content">
                  <div className="button-title">
                    {t('landing.info.features.title', '功能介紹')}
                  </div>
                  <div className="button-desc">
                    {t('landing.info.features.desc', '了解5大評測的科學原理')}
                  </div>
                </div>
              </button>
              <button
                className="info-button secondary"
                onClick={() => navigate('/about')}
              >
                <div className="button-icon">👥</div>
                <div className="button-content">
                  <div className="button-title">
                    {t('landing.info.about.title', '關於我們')}
                  </div>
                  <div className="button-desc">
                    {t('landing.info.about.desc', '認識我們的團隊和理念')}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-links">
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
