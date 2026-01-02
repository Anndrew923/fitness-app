import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import './FeaturesPage.css';

function Features() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // ✅ Phase 1.9.5 修正：移除本地返回鍵處理，已由全局 useAndroidBackButton hook 統一處理
  // 舊的實現已移除，避免與全局 hook 衝突

  const handleBackToLanding = () => {
    navigate('/landing');
  };

  const handleStartAssessment = () => {
    navigate('/login');
  };

  return (
    <div className="features-page">
      {/* Header */}
      <header className="features-header">
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
            {t('features.hero.title', '科學化健身評測系統')}
          </h2>
          <p className="hero-subtitle">
            {t(
              'features.hero.subtitle',
              '透過 5 大評測項目，全面了解你的身體素質，打造五邊形全能戰士'
            )}
          </p>
          <div className="hero-actions">
            <button
              className="cta-button primary"
              onClick={handleStartAssessment}
            >
              {t('features.hero.startButton', '立即開始評測')}
            </button>
            <button
              className="cta-button secondary"
              onClick={handleBackToLanding}
            >
              {t('features.hero.backButton', '返回首頁')}
            </button>
          </div>
        </div>
      </section>

      {/* Assessment Overview */}
      <section className="overview-section">
        <div className="container">
          <h3 className="section-title">
            {t('features.overview.title', '5大評測項目')}
          </h3>
          <p className="section-subtitle">
            {t(
              'features.overview.subtitle',
              '基於科學研究與大數據分析，提供準確的身體素質評估'
            )}
          </p>
        </div>
      </section>

      {/* Assessment Details */}
      <section className="assessments-section">
        <div className="container">
          {/* Strength Assessment */}
          <div className="assessment-card">
            <div className="assessment-header">
              <div className="assessment-icon">💪</div>
              <h4 className="assessment-title">
                {t('features.strength.title', '力量評測')}
              </h4>
            </div>
            <div className="assessment-content">
              <p className="assessment-description">
                {t(
                  'features.strength.description',
                  '評估全身力量水平，包括上肢、下肢和核心力量'
                )}
              </p>
              <div className="assessment-details">
                <h5 className="details-title">
                  {t('features.strength.exercises', '評測動作')}
                </h5>
                <ul className="exercises-list">
                  <li>{t('features.strength.benchPress', '平板臥推')}</li>
                  <li>{t('features.strength.squat', '深蹲')}</li>
                  <li>{t('features.strength.deadlift', '硬舉')}</li>
                  <li>{t('features.strength.latPulldown', '滑輪下拉')}</li>
                  <li>{t('features.strength.shoulderPress', '站姿肩推')}</li>
                </ul>
                <div className="assessment-standards">
                  <strong>
                    {t('features.strength.standards', '評分標準')}:
                  </strong>
                  <span>
                    {t(
                      'features.strength.standardsDesc',
                      '基於 Strength Level 數據庫，男女分組評分'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Power Assessment */}
          <div className="assessment-card">
            <div className="assessment-header">
              <div className="assessment-icon">⚡</div>
              <h4 className="assessment-title">
                {t('features.power.title', '爆發力測試')}
              </h4>
            </div>
            <div className="assessment-content">
              <p className="assessment-description">
                {t(
                  'features.power.description',
                  '測試瞬間爆發力，評估快速力量輸出能力'
                )}
              </p>
              <div className="assessment-details">
                <h5 className="details-title">
                  {t('features.power.tests', '測試項目')}
                </h5>
                <ul className="tests-list">
                  <li>{t('features.power.verticalJump', '垂直跳躍')}</li>
                  <li>{t('features.power.standingLongJump', '立定跳遠')}</li>
                  <li>{t('features.power.sprint', '衝刺測試')}</li>
                </ul>
                <div className="assessment-standards">
                  <strong>{t('features.power.standards', '評分標準')}:</strong>
                  <span>
                    {t(
                      'features.power.standardsDesc',
                      '基於年齡性別分組標準，多項目綜合評分'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cardio Assessment */}
          <div className="assessment-card">
            <div className="assessment-header">
              <div className="assessment-icon">❤️</div>
              <h4 className="assessment-title">
                {t('features.cardio.title', '心肺耐力')}
              </h4>
            </div>
            <div className="assessment-content">
              <p className="assessment-description">
                {t(
                  'features.cardio.description',
                  '評估心血管健康狀況，測試有氧運動能力'
                )}
              </p>
              <div className="assessment-details">
                <h5 className="details-title">
                  {t('features.cardio.test', '測試方法')}
                </h5>
                <p className="test-method">
                  {t(
                    'features.cardio.cooperTest',
                    '12分鐘跑步測試 - 測量最大跑步距離'
                  )}
                </p>
                <div className="assessment-standards">
                  <strong>{t('features.cardio.standards', '評分標準')}:</strong>
                  <span>
                    {t(
                      'features.cardio.standardsDesc',
                      '基於 Cooper 測試標準，年齡性別對照評分'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Muscle Assessment */}
          <div className="assessment-card">
            <div className="assessment-header">
              <div className="assessment-icon">🥩</div>
              <h4 className="assessment-title">
                {t('features.muscle.title', '肌肉量評估')}
              </h4>
            </div>
            <div className="assessment-content">
              <p className="assessment-description">
                {t(
                  'features.muscle.description',
                  '分析身體組成，評估骨骼肌肉量水平'
                )}
              </p>
              <div className="assessment-details">
                <h5 className="details-title">
                  {t('features.muscle.method', '評估方法')}
                </h5>
                <p className="test-method">
                  {t(
                    'features.muscle.smmCalculation',
                    '骨骼肌肉量 (SMM) 計算與分析'
                  )}
                </p>
                <div className="assessment-standards">
                  <strong>{t('features.muscle.standards', '評分標準')}:</strong>
                  <span>
                    {t(
                      'features.muscle.standardsDesc',
                      '基於年齡性別標準，肌肉量百分比評分'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Body Fat Assessment */}
          <div className="assessment-card">
            <div className="assessment-header">
              <div className="assessment-icon">📊</div>
              <h4 className="assessment-title">
                {t('features.bodyfat.title', '體脂分析')}
              </h4>
            </div>
            <div className="assessment-content">
              <p className="assessment-description">
                {t(
                  'features.bodyfat.description',
                  '科學評估體脂率，計算去脂體重指數 (FFMI)'
                )}
              </p>
              <div className="assessment-details">
                <h5 className="details-title">
                  {t('features.bodyfat.method', '評估方法')}
                </h5>
                <p className="test-method">
                  {t(
                    'features.bodyfat.ffmiCalculation',
                    'FFMI 指數計算，身高體重調整公式'
                  )}
                </p>
                <div className="assessment-standards">
                  <strong>
                    {t('features.bodyfat.standards', '評分標準')}:
                  </strong>
                  <span>
                    {t(
                      'features.bodyfat.standardsDesc',
                      '基於科學研究標準，男女分組評分'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Basis */}
      <section className="science-section">
        <div className="container">
          <h3 className="section-title">
            {t('features.science.title', '科學依據')}
          </h3>
          <div className="science-content">
            <div className="science-item">
              <h4 className="science-item-title">
                {t('features.science.dataSource', '數據來源')}
              </h4>
              <p className="science-item-desc">
                {t(
                  'features.science.dataSourceDesc',
                  '基於 Strength Level 超過 1.34 億次舉重數據，Cooper 測試標準，以及運動生理學研究'
                )}
              </p>
            </div>
            <div className="science-item">
              <h4 className="science-item-title">
                {t('features.science.algorithm', '評分算法')}
              </h4>
              <p className="science-item-desc">
                {t(
                  'features.science.algorithmDesc',
                  '採用線性插值算法，結合年齡性別分組，確保評分準確性和公平性'
                )}
              </p>
            </div>
            <div className="science-item">
              <h4 className="science-item-title">
                {t('features.science.standards', '評分標準')}
              </h4>
              <p className="science-item-desc">
                {t(
                  'features.science.standardsDesc',
                  '100分制評分系統，分為5個等級：初階、入門、中等、高階、精英'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="usage-section">
        <div className="container">
          <h3 className="section-title">
            {t('features.usage.title', '使用流程')}
          </h3>
          <div className="usage-steps">
            <div className="usage-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4 className="step-title">
                  {t('features.usage.step1.title', '註冊登入')}
                </h4>
                <p className="step-desc">
                  {t(
                    'features.usage.step1.desc',
                    '創建帳號或使用訪客模式開始體驗'
                  )}
                </p>
              </div>
            </div>
            <div className="usage-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4 className="step-title">
                  {t('features.usage.step2.title', '填寫資料')}
                </h4>
                <p className="step-desc">
                  {t(
                    'features.usage.step2.desc',
                    '輸入基本身體資料：身高、體重、年齡、性別'
                  )}
                </p>
              </div>
            </div>
            <div className="usage-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4 className="step-title">
                  {t('features.usage.step3.title', '進行評測')}
                </h4>
                <p className="step-desc">
                  {t(
                    'features.usage.step3.desc',
                    '依序完成5大評測項目，獲得個人化評分'
                  )}
                </p>
              </div>
            </div>
            <div className="usage-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4 className="step-title">
                  {t('features.usage.step4.title', '查看結果')}
                </h4>
                <p className="step-desc">
                  {t(
                    'features.usage.step4.desc',
                    '查看雷達圖分析，參與天梯排名，追蹤進步'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h3 className="section-title">
            {t('features.faq.title', '常見問題')}
          </h3>
          <div className="faq-list">
            <div className="faq-item">
              <h4 className="faq-question">
                {t('features.faq.q1.question', '評測結果準確嗎？')}
              </h4>
              <p className="faq-answer">
                {t(
                  'features.faq.q1.answer',
                  '我們的評測系統基於科學研究和大數據分析，提供相對準確的身體素質評估。建議定期重測以追蹤進步。'
                )}
              </p>
            </div>
            <div className="faq-item">
              <h4 className="faq-question">
                {t('features.faq.q2.question', '需要專業設備嗎？')}
              </h4>
              <p className="faq-answer">
                {t(
                  'features.faq.q2.answer',
                  '大部分評測項目可以在健身房或家中完成，建議在安全環境下進行，必要時尋求專業指導。'
                )}
              </p>
            </div>
            <div className="faq-item">
              <h4 className="faq-question">
                {t('features.faq.q3.question', '多久重測一次？')}
              </h4>
              <p className="faq-answer">
                {t(
                  'features.faq.q3.answer',
                  '建議每4-6週重測一次，以追蹤訓練效果和身體變化。'
                )}
              </p>
            </div>
            <div className="faq-item">
              <h4 className="faq-question">
                {t('features.faq.q4.question', '評測安全嗎？')}
              </h4>
              <p className="faq-answer">
                {t(
                  'features.faq.q4.answer',
                  '請根據自身能力選擇合適重量，建議有保護者協助，如有身體不適請立即停止。'
                )}
              </p>
            </div>
            <div className="faq-item">
              <h4 className="faq-question">
                {t('features.faq.q5.question', '如何提升評測分數？')}
              </h4>
              <p className="faq-answer">
                {t(
                  'features.faq.q5.answer',
                  '建議制定全面的訓練計畫，包括力量訓練、有氧運動、營養管理，並保持規律的運動習慣。'
                )}
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
              {t('features.cta.title', '準備好開始你的健身評測之旅了嗎？')}
            </h3>
            <p className="cta-subtitle">
              {t('features.cta.subtitle', '立即註冊或使用訪客模式開始體驗')}
            </p>
            <div className="cta-actions">
              <button
                className="cta-button primary large"
                onClick={handleStartAssessment}
              >
                {t('features.cta.startButton', '立即開始評測')}
              </button>
              <button
                className="cta-button secondary large"
                onClick={handleBackToLanding}
              >
                {t('features.cta.backButton', '返回首頁')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="features-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-links">
              <a href="/about" className="footer-link">
                {t('features.footer.about', '關於我們')}
              </a>
              <a href="/privacy-policy" className="footer-link">
                {t('features.footer.privacy', '隱私政策')}
              </a>
              <a href="/terms" className="footer-link">
                {t('features.footer.terms', '使用條款')}
              </a>
              <a href="/contact" className="footer-link">
                {t('features.footer.contact', '聯絡我們')}
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

export default React.memo(Features);
