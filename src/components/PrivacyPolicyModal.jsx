import { useState } from 'react';
import PropTypes from 'prop-types';
import './PrivacyPolicyModal.css';

function PrivacyPolicyModal({ isOpen, onClose, onAccept }) {
  const [currentLanguage, setCurrentLanguage] = useState('zh');

  if (!isOpen) return null;

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  const switchLanguage = lang => {
    setCurrentLanguage(lang);
  };

  return (
    <div className="privacy-modal-overlay" onClick={onClose}>
      <div className="privacy-modal" onClick={e => e.stopPropagation()}>
        <div className="privacy-modal-header">
          <h2>隱私權政策 / Privacy Policy</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="language-switch">
          <button
            className={`lang-btn ${currentLanguage === 'zh' ? 'active' : ''}`}
            onClick={() => switchLanguage('zh')}
          >
            中文
          </button>
          <button
            className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
            onClick={() => switchLanguage('en')}
          >
            English
          </button>
        </div>

        <div className="privacy-modal-content">
          {currentLanguage === 'zh' ? (
            <div className="privacy-content-zh">
              <div className="privacy-highlight">
                <strong>重要提醒：</strong>
                本隱私權政策說明我們如何收集、使用和保護您的個人資訊。使用我們的服務即表示您同意本政策的內容。
              </div>

              <section>
                <h3>我們收集的資訊</h3>
                <ul>
                  <li>
                    <strong>帳戶資訊：</strong>電子郵件地址、暱稱、頭像
                  </li>
                  <li>
                    <strong>個人資料：</strong>性別、年齡、身高、體重
                  </li>
                  <li>
                    <strong>健康數據：</strong>
                    體脂肪率、骨骼肌肉量、運動評測結果
                  </li>
                  <li>
                    <strong>社交資訊：</strong>好友列表、社群互動內容
                  </li>
                </ul>
              </section>

              <section>
                <h3>我們如何使用您的資訊</h3>
                <ul>
                  <li>處理您的健身評測並提供結果</li>
                  <li>管理您的帳戶和個人資料</li>
                  <li>提供天梯排行榜功能</li>
                  <li>支援社交功能和好友系統</li>
                  <li>改善服務和提供個人化建議</li>
                </ul>
              </section>

              <section>
                <h3>資料安全</h3>
                <ul>
                  <li>使用加密技術保護資料傳輸和儲存</li>
                  <li>實施存取控制和身份驗證</li>
                  <li>定期進行安全評估和更新</li>
                  <li>我們不會出售您的個人資訊</li>
                </ul>
              </section>

              <section>
                <h3>您的權利</h3>
                <ul>
                  <li>您可以隨時查看和更新您的個人資料</li>
                  <li>您可以隨時刪除您的帳戶</li>
                  <li>您可以要求我們提供您的資料副本</li>
                  <li>您可以反對我們處理您的個人資料</li>
                </ul>
              </section>

              <section>
                <h3>第三方服務</h3>
                <p>
                  當您使用 Google 登入時，該服務將根據其隱私政策處理您的資料。
                </p>
              </section>

              <div className="privacy-contact">
                <h4>聯絡我們</h4>
                <p>電子郵件：topaj01@gmail.com</p>
                <p>我們將在48小時內回應您的詢問</p>
              </div>
            </div>
          ) : (
            <div className="privacy-content-en">
              <div className="privacy-highlight">
                <strong>Important Notice:</strong> This Privacy Policy explains
                how we collect, use, and protect your personal information. By
                using our services, you agree to the terms of this policy.
              </div>

              <section>
                <h3>Information We Collect</h3>
                <ul>
                  <li>
                    <strong>Account Information:</strong> Email address,
                    nickname, avatar
                  </li>
                  <li>
                    <strong>Personal Data:</strong> Gender, age, height, weight
                  </li>
                  <li>
                    <strong>Health Data:</strong> Body fat percentage, skeletal
                    muscle mass, fitness assessment results
                  </li>
                  <li>
                    <strong>Social Information:</strong> Friends list, community
                    interaction content
                  </li>
                </ul>
              </section>

              <section>
                <h3>How We Use Your Information</h3>
                <ul>
                  <li>Process your fitness assessments and provide results</li>
                  <li>Manage your account and profile</li>
                  <li>Provide ladder ranking functionality</li>
                  <li>Support social features and friend system</li>
                  <li>
                    Improve services and provide personalized recommendations
                  </li>
                </ul>
              </section>

              <section>
                <h3>Data Security</h3>
                <ul>
                  <li>
                    Use encryption technology to protect data transmission and
                    storage
                  </li>
                  <li>Implement access controls and authentication</li>
                  <li>Conduct regular security assessments and updates</li>
                  <li>We do not sell your personal information</li>
                </ul>
              </section>

              <section>
                <h3>Your Rights</h3>
                <ul>
                  <li>
                    You can view and update your personal data at any time
                  </li>
                  <li>You can delete your account at any time</li>
                  <li>You can request a copy of your data</li>
                  <li>
                    You can object to our processing of your personal data
                  </li>
                </ul>
              </section>

              <section>
                <h3>Third-Party Services</h3>
                <p>
                  When you log in using Google, this service will
                  process your data according to its privacy policy.
                </p>
              </section>

              <div className="privacy-contact">
                <h4>Contact Us</h4>
                <p>Email: topaj01@gmail.com</p>
                <p>We will respond to your inquiry within 48 hours</p>
              </div>
            </div>
          )}
        </div>

        <div className="privacy-modal-footer">
          <button className="privacy-btn secondary" onClick={onClose}>
            取消
          </button>
          <button className="privacy-btn primary" onClick={handleAccept}>
            我同意並繼續
          </button>
        </div>
      </div>
    </div>
  );
}

PrivacyPolicyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAccept: PropTypes.func.isRequired,
};

export default PrivacyPolicyModal;
