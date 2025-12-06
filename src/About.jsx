import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './components/LanguageSwitcher';
import './About.css';

function About() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ✅ Phase 1.9.5 修正：移除本地返回鍵處理，已由全局 useAndroidBackButton hook 統一處理
  // 舊的實現已移除，避免與全局 hook 衝突

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

          <div className="founder-profile">
            <div className="founder-card">
              {/* Founder Image - will show placeholder if image doesn't exist */}
              <img
                src="/images/founder.jpg"
                alt={t('about.team.founder.name')}
                className="founder-image"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div
                className="founder-image-placeholder"
                style={{ display: 'none' }}
              >
                <div className="image-icon">👤</div>
                <p className="image-hint">
                  將您的照片放在 public/images/founder.jpg
                </p>
              </div>

              <div className="founder-info">
                <h3 className="founder-name">{t('about.team.founder.name')}</h3>
                <p className="founder-title">{t('about.team.founder.title')}</p>

                <div className="founder-bio">
                  <p>{t('about.team.founder.bio1')}</p>
                  <p>{t('about.team.founder.bio2')}</p>
                  <p>{t('about.team.founder.bio3')}</p>
                </div>

                <div className="founder-experience">
                  <h4>{t('about.team.founder.experienceTitle')}</h4>
                  <ul>
                    {t('about.team.founder.experience', {
                      returnObjects: true,
                    }).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="founder-mission">
                  <h4>{t('about.team.founder.missionTitle')}</h4>
                  <p>{t('about.team.founder.mission')}</p>
                  <ul>
                    {t('about.team.founder.goals', { returnObjects: true }).map(
                      (goal, index) => (
                        <li key={index}>{goal}</li>
                      )
                    )}
                  </ul>
                </div>

                <div className="founder-score">
                  <div className="score-badge">
                    <span className="score-label">
                      {t('about.team.founder.scoreTitle')}
                    </span>
                    <span className="score-value">
                      {t('about.team.founder.score')}
                    </span>
                  </div>
                </div>

                <p className="founder-closing">
                  {t('about.team.founder.closing')}
                </p>
              </div>
            </div>
          </div>

          {/* Advisor Profile */}
          <div className="advisor-profile">
            <div className="advisor-card">
              {/* Advisor Image - will show placeholder if image doesn't exist */}
              <img
                src="/images/advisor.jpg"
                alt={t('about.team.advisor.name')}
                className="advisor-image"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div
                className="advisor-image-placeholder"
                style={{ display: 'none' }}
              >
                <div className="image-icon">👨‍⚕️</div>
                <p className="image-hint">
                  將顧問照片放在 public/images/advisor.jpg
                </p>
              </div>

              <div className="advisor-info">
                <h3 className="advisor-name">{t('about.team.advisor.name')}</h3>
                <p className="advisor-title">{t('about.team.advisor.title')}</p>
                <p className="advisor-subtitle">
                  {t('about.team.advisor.subtitle')}
                </p>

                <div className="advisor-bio">
                  <p>{t('about.team.advisor.bio1')}</p>
                  <p>{t('about.team.advisor.bio2')}</p>
                  <p>{t('about.team.advisor.bio3')}</p>
                </div>

                <div className="advisor-education">
                  <h4>{t('about.team.advisor.educationTitle')}</h4>
                  <ul>
                    {t('about.team.advisor.education', {
                      returnObjects: true,
                    }).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="advisor-experience">
                  <h4>{t('about.team.advisor.experienceTitle')}</h4>
                  <ul>
                    {t('about.team.advisor.experience', {
                      returnObjects: true,
                    }).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="advisor-achievements">
                  <h4>{t('about.team.advisor.achievementsTitle')}</h4>
                  <ul>
                    {t('about.team.advisor.achievements', {
                      returnObjects: true,
                    }).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="advisor-specializations">
                  <h4>{t('about.team.advisor.specializationsTitle')}</h4>
                  <ul>
                    {t('about.team.advisor.specializations', {
                      returnObjects: true,
                    }).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="advisor-therapy">
                  <h4>{t('about.team.advisor.therapy.title')}</h4>
                  <p className="therapy-description">
                    {t('about.team.advisor.therapy.description')}
                  </p>
                  <ul>
                    {t('about.team.advisor.therapy.principles', {
                      returnObjects: true,
                    }).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="advisor-publications">
                  <h4>{t('about.team.advisor.publicationsTitle')}</h4>
                  <p>{t('about.team.advisor.publications')}</p>
                </div>

                <p className="advisor-closing">
                  {t('about.team.advisor.closing')}
                </p>
              </div>
            </div>
          </div>

          {/* Second Advisor Profile */}
          <div className="advisor-profile">
            <div className="advisor-card">
              {/* Advisor Image - will show placeholder if image doesn't exist */}
              <img
                src="/images/advisor2.jpg"
                alt={t('about.team.advisor2.name')}
                className="advisor-image"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div
                className="advisor-image-placeholder"
                style={{ display: 'none' }}
              >
                <div className="image-icon">🏆</div>
                <p className="image-hint">
                  將顧問照片放在 public/images/advisor2.jpg
                </p>
              </div>

              <div className="advisor-info">
                <h3 className="advisor-name">
                  {t('about.team.advisor2.name')}
                </h3>
                <p className="advisor-title">
                  {t('about.team.advisor2.title')}
                </p>
                <p className="advisor-subtitle">
                  {t('about.team.advisor2.subtitle')}
                </p>

                <div className="advisor-bio">
                  <p>{t('about.team.advisor2.bio1')}</p>
                  <p>{t('about.team.advisor2.bio2')}</p>
                  <p>{t('about.team.advisor2.bio3')}</p>
                </div>

                <div className="advisor-team-experience">
                  <h4>{t('about.team.advisor2.teamExperienceTitle')}</h4>
                  <ul>
                    {t('about.team.advisor2.teamExperience', {
                      returnObjects: true,
                    }).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="advisor-competition-results">
                  <h4>{t('about.team.advisor2.competitionResultsTitle')}</h4>
                  <ul>
                    {t('about.team.advisor2.competitionResults', {
                      returnObjects: true,
                    }).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="advisor-achievements">
                  <h4>{t('about.team.advisor2.achievementsTitle')}</h4>
                  <ul>
                    {t('about.team.advisor2.achievements', {
                      returnObjects: true,
                    }).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="advisor-specializations">
                  <h4>{t('about.team.advisor2.specializationsTitle')}</h4>
                  <ul>
                    {t('about.team.advisor2.specializations', {
                      returnObjects: true,
                    }).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <p className="advisor-closing">
                  {t('about.team.advisor2.closing')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="tech-stack-section">
        <div className="container">
          <h2 className="section-title">{t('about.techStack.title')}</h2>
          <p className="section-subtitle">{t('about.techStack.subtitle')}</p>

          <div className="tech-stack-grid">
            <div className="stack-category">
              <div className="category-header">
                <div className="category-icon">🎨</div>
                <h3 className="category-title">
                  {t('about.techStack.frontend.title')}
                </h3>
              </div>
              <div className="tech-list">
                <div className="tech-badge">
                  <span className="badge-icon">⚛️</span>
                  <span className="badge-text">React 18</span>
                </div>
                <div className="tech-badge">
                  <span className="badge-icon">🚀</span>
                  <span className="badge-text">Vite</span>
                </div>
                <div className="tech-badge">
                  <span className="badge-icon">🎨</span>
                  <span className="badge-text">CSS3</span>
                </div>
                <div className="tech-badge">
                  <span className="badge-icon">🌐</span>
                  <span className="badge-text">React Router</span>
                </div>
                <div className="tech-badge">
                  <span className="badge-icon">🗣️</span>
                  <span className="badge-text">i18next</span>
                </div>
                <div className="tech-badge">
                  <span className="badge-icon">📱</span>
                  <span className="badge-text">PWA</span>
                </div>
              </div>
              <p className="category-desc">
                {t('about.techStack.frontend.desc')}
              </p>
            </div>

            <div className="stack-category">
              <div className="category-header">
                <div className="category-icon">🔥</div>
                <h3 className="category-title">
                  {t('about.techStack.backend.title')}
                </h3>
              </div>
              <div className="tech-list">
                <div className="tech-badge">
                  <span className="badge-icon">🔥</span>
                  <span className="badge-text">Firebase</span>
                </div>
                <div className="tech-badge">
                  <span className="badge-icon">🔐</span>
                  <span className="badge-text">Authentication</span>
                </div>
                <div className="tech-badge">
                  <span className="badge-icon">💾</span>
                  <span className="badge-text">Firestore</span>
                </div>
                <div className="tech-badge">
                  <span className="badge-icon">☁️</span>
                  <span className="badge-text">Cloud Hosting</span>
                </div>
                <div className="tech-badge">
                  <span className="badge-icon">⚡</span>
                  <span className="badge-text">Real-time Sync</span>
                </div>
              </div>
              <p className="category-desc">
                {t('about.techStack.backend.desc')}
              </p>
            </div>

            <div className="stack-category">
              <div className="category-header">
                <div className="category-icon">📊</div>
                <h3 className="category-title">
                  {t('about.techStack.data.title')}
                </h3>
              </div>
              <div className="tech-list">
                {t('about.techStack.data.features', {
                  returnObjects: true,
                }).map((feature, index) => {
                  const icons = ['🧮', '📈', '🎯', '🔬', '💡'];
                  return (
                    <div key={index} className="tech-badge">
                      <span className="badge-icon">{icons[index]}</span>
                      <span className="badge-text">{feature}</span>
                    </div>
                  );
                })}
              </div>
              <p className="category-desc">{t('about.techStack.data.desc')}</p>
            </div>

            <div className="stack-category">
              <div className="category-header">
                <div className="category-icon">🛠️</div>
                <h3 className="category-title">
                  {t('about.techStack.devops.title')}
                </h3>
              </div>
              <div className="tech-list">
                <div className="tech-badge">
                  <span className="badge-icon">📦</span>
                  <span className="badge-text">Git</span>
                </div>
                <div className="tech-badge">
                  <span className="badge-icon">🚀</span>
                  <span className="badge-text">CI/CD</span>
                </div>
                <div className="tech-badge">
                  <span className="badge-icon">📊</span>
                  <span className="badge-text">Analytics</span>
                </div>
                <div className="tech-badge">
                  <span className="badge-icon">🔍</span>
                  <span className="badge-text">Performance Monitor</span>
                </div>
                <div className="tech-badge">
                  <span className="badge-icon">🛡️</span>
                  <span className="badge-text">Security</span>
                </div>
              </div>
              <p className="category-desc">
                {t('about.techStack.devops.desc')}
              </p>
            </div>
          </div>

          <div className="tech-highlights">
            <div className="highlight-card">
              <div className="highlight-icon">⚡</div>
              <h4>{t('about.techStack.highlights.performance.title')}</h4>
              <p>{t('about.techStack.highlights.performance.desc')}</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">🔒</div>
              <h4>{t('about.techStack.highlights.security.title')}</h4>
              <p>{t('about.techStack.highlights.security.desc')}</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">📱</div>
              <h4>{t('about.techStack.highlights.responsive.title')}</h4>
              <p>{t('about.techStack.highlights.responsive.desc')}</p>
            </div>
            <div className="highlight-card">
              <div className="highlight-icon">🌍</div>
              <h4>{t('about.techStack.highlights.international.title')}</h4>
              <p>{t('about.techStack.highlights.international.desc')}</p>
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
