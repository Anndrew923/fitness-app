import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Contact.css';

function Contact() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isZh = i18n.language && i18n.language.toLowerCase().startsWith('zh');

  const handleBackToHome = () => {
    navigate('/landing');
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Header Section */}
        <div className="contact-header">
          <div className="header-icon">✉️</div>
          <h1 className="contact-title">
            {isZh ? '聯絡我們' : 'Contact Us'}
          </h1>
          <p className="contact-subtitle">
            {isZh
              ? '我們重視每一位用戶的意見和建議'
              : "We value every user's feedback and suggestions"}
          </p>
        </div>

        {/* Main Content */}
        <div className="contact-content">
          {/* Email Info Card */}
          <div className="contact-card-main">
            <div className="card-icon">📧</div>
            <h3 className="card-title">
              {isZh ? '電子郵件' : 'Email'}
            </h3>
            <div className="email-display">
              topaj01@gmail.com
            </div>
            <p className="card-description">
              {isZh
                ? '發送郵件給我們，我們會盡快回覆'
                : 'Send us an email, we will respond as soon as possible'}
            </p>
          </div>

          {/* Feedback Types */}
          <div className="feedback-section">
            <h3 className="feedback-title">
              {isZh ? '我們歡迎的反饋類型' : 'Feedback We Welcome'}
            </h3>
            <div className="feedback-types">
              <span className="type-badge">
                {isZh ? '功能建議' : 'Features'}
              </span>
              <span className="type-badge">
                {isZh ? '問題回報' : 'Issues'}
              </span>
              <span className="type-badge">
                {isZh ? '合作洽詢' : 'Partnership'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="contact-footer">
          <button className="back-button" onClick={handleBackToHome}>
            ← {isZh ? '返回首頁' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Contact;
