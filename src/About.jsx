import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './components/LanguageSwitcher';
import './About.css';

function About() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/landing');
  };

  const handleContactUs = () => {
    navigate('/contact');
  };

  return (
    <div className="about-page">
      {/* Header */}
      <div className="about-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="app-title">{t('about.header.title')}</h1>
            <p className="app-subtitle">{t('about.header.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">{t('about.hero.title')}</h1>
          <p className="hero-subtitle">{t('about.hero.subtitle')}</p>
          <div className="hero-actions">
            <button className="cta-button primary" onClick={handleBackToHome}>
              {t('about.hero.backButton')}
            </button>
            <button className="cta-button secondary" onClick={handleContactUs}>
              {t('about.hero.contactButton')}
            </button>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="mission-section">
        <div className="container">
          <h2 className="section-title">{t('about.mission.title')}</h2>
          <div className="mission-content">
            <div className="mission-text">
              <p className="mission-description">
                {t('about.mission.description')}
              </p>
              <div className="mission-points">
                <div className="mission-point">
                  <div className="point-icon">🎯</div>
                  <div className="point-content">
                    <h3>{t('about.mission.point1.title')}</h3>
                    <p>{t('about.mission.point1.desc')}</p>
                  </div>
                </div>
                <div className="mission-point">
                  <div className="point-icon">📊</div>
                  <div className="point-content">
                    <h3>{t('about.mission.point2.title')}</h3>
                    <p>{t('about.mission.point2.desc')}</p>
                  </div>
                </div>
                <div className="mission-point">
                  <div className="point-icon">⚡</div>
                  <div className="point-content">
                    <h3>{t('about.mission.point3.title')}</h3>
                    <p>{t('about.mission.point3.desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <div className="container">
          <h2 className="section-title">{t('about.team.title')}</h2>
          <p className="section-subtitle">{t('about.team.subtitle')}</p>
          <div className="team-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">👥</div>
              <h3>{t('about.team.placeholder.title')}</h3>
              <p>{t('about.team.placeholder.desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="features-section">
        <div className="container">
          <h2 className="section-title">{t('about.features.title')}</h2>
          <p className="section-subtitle">{t('about.features.subtitle')}</p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔬</div>
              <h3 className="feature-title">
                {t('about.features.scientific.title')}
              </h3>
              <p className="feature-desc">
                {t('about.features.scientific.desc')}
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3 className="feature-title">
                {t('about.features.data.title')}
              </h3>
              <p className="feature-desc">{t('about.features.data.desc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">
                {t('about.features.personalized.title')}
              </h3>
              <p className="feature-desc">
                {t('about.features.personalized.desc')}
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">
                {t('about.features.userFriendly.title')}
              </h3>
              <p className="feature-desc">
                {t('about.features.userFriendly.desc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="technical-section">
        <div className="container">
          <h2 className="section-title">{t('about.technical.title')}</h2>
          <p className="section-subtitle">{t('about.technical.subtitle')}</p>

          <div className="technical-content">
            <div className="tech-category">
              <h3 className="tech-title">
                {t('about.technical.dataSources.title')}
              </h3>
              <div className="tech-details">
                <div className="tech-item">
                  <h4>
                    {t('about.technical.dataSources.strengthLevel.title')}
                  </h4>
                  <p>{t('about.technical.dataSources.strengthLevel.desc')}</p>
                  <ul>
                    <li>
                      {t('about.technical.dataSources.strengthLevel.point1')}
                    </li>
                    <li>
                      {t('about.technical.dataSources.strengthLevel.point2')}
                    </li>
                    <li>
                      {t('about.technical.dataSources.strengthLevel.point3')}
                    </li>
                  </ul>
                </div>
                <div className="tech-item">
                  <h4>{t('about.technical.dataSources.cooperTest.title')}</h4>
                  <p>{t('about.technical.dataSources.cooperTest.desc')}</p>
                  <ul>
                    <li>
                      {t('about.technical.dataSources.cooperTest.point1')}
                    </li>
                    <li>
                      {t('about.technical.dataSources.cooperTest.point2')}
                    </li>
                    <li>
                      {t('about.technical.dataSources.cooperTest.point3')}
                    </li>
                  </ul>
                </div>
                <div className="tech-item">
                  <h4>{t('about.technical.dataSources.research.title')}</h4>
                  <p>{t('about.technical.dataSources.research.desc')}</p>
                  <ul>
                    <li>{t('about.technical.dataSources.research.point1')}</li>
                    <li>{t('about.technical.dataSources.research.point2')}</li>
                    <li>{t('about.technical.dataSources.research.point3')}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="tech-category">
              <h3 className="tech-title">
                {t('about.technical.algorithms.title')}
              </h3>
              <div className="tech-details">
                <div className="tech-item">
                  <h4>{t('about.technical.algorithms.scoring.title')}</h4>
                  <p>{t('about.technical.algorithms.scoring.desc')}</p>
                </div>
                <div className="tech-item">
                  <h4>{t('about.technical.algorithms.normalization.title')}</h4>
                  <p>{t('about.technical.algorithms.normalization.desc')}</p>
                </div>
                <div className="tech-item">
                  <h4>{t('about.technical.algorithms.ranking.title')}</h4>
                  <p>{t('about.technical.algorithms.ranking.desc')}</p>
                </div>
              </div>
            </div>

            <div className="tech-category">
              <h3 className="tech-title">
                {t('about.technical.assessments.title')}
              </h3>
              <div className="assessment-grid">
                <div className="assessment-item">
                  <div className="assessment-icon">💪</div>
                  <h4>{t('about.technical.assessments.strength.title')}</h4>
                  <p>{t('about.technical.assessments.strength.desc')}</p>
                </div>
                <div className="assessment-item">
                  <div className="assessment-icon">⚡</div>
                  <h4>{t('about.technical.assessments.explosive.title')}</h4>
                  <p>{t('about.technical.assessments.explosive.desc')}</p>
                </div>
                <div className="assessment-item">
                  <div className="assessment-icon">❤️</div>
                  <h4>{t('about.technical.assessments.cardio.title')}</h4>
                  <p>{t('about.technical.assessments.cardio.desc')}</p>
                </div>
                <div className="assessment-item">
                  <div className="assessment-icon">🥩</div>
                  <h4>{t('about.technical.assessments.muscle.title')}</h4>
                  <p>{t('about.technical.assessments.muscle.desc')}</p>
                </div>
                <div className="assessment-item">
                  <div className="assessment-icon">📊</div>
                  <h4>{t('about.technical.assessments.bodyfat.title')}</h4>
                  <p>{t('about.technical.assessments.bodyfat.desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="values-section">
        <div className="container">
          <h2 className="section-title">{t('about.values.title')}</h2>
          <p className="section-subtitle">{t('about.values.subtitle')}</p>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🔬</div>
              <h3 className="value-title">{t('about.values.science.title')}</h3>
              <p className="value-desc">{t('about.values.science.desc')}</p>
            </div>
            <div className="value-card">
              <div className="value-icon">⚖️</div>
              <h3 className="value-title">
                {t('about.values.fairness.title')}
              </h3>
              <p className="value-desc">{t('about.values.fairness.desc')}</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🔍</div>
              <h3 className="value-title">
                {t('about.values.transparency.title')}
              </h3>
              <p className="value-desc">
                {t('about.values.transparency.desc')}
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">👥</div>
              <h3 className="value-title">
                {t('about.values.community.title')}
              </h3>
              <p className="value-desc">{t('about.values.community.desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="contact-section">
        <div className="container">
          <h2 className="section-title">{t('about.contact.title')}</h2>
          <p className="section-subtitle">{t('about.contact.subtitle')}</p>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">📧</div>
                <div className="contact-details">
                  <h4>{t('about.contact.email.title')}</h4>
                  <p>{t('about.contact.email.desc')}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">💬</div>
                <div className="contact-details">
                  <h4>{t('about.contact.feedback.title')}</h4>
                  <p>{t('about.contact.feedback.desc')}</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">🌐</div>
                <div className="contact-details">
                  <h4>{t('about.contact.social.title')}</h4>
                  <p>{t('about.contact.social.desc')}</p>
                </div>
              </div>
            </div>
            <div className="contact-actions">
              <button className="cta-button primary" onClick={handleContactUs}>
                {t('about.contact.contactButton')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="about-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-links">
              <button
                onClick={() => navigate('/landing')}
                className="footer-link"
              >
                {t('about.footer.home')}
              </button>
              <button
                onClick={() => navigate('/features')}
                className="footer-link"
              >
                {t('about.footer.features')}
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="footer-link"
              >
                {t('about.footer.contact')}
              </button>
            </div>
            <div className="footer-copyright">
              <p>{t('about.footer.copyright')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
