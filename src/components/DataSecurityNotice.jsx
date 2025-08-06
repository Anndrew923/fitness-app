import PropTypes from 'prop-types';
import './DataSecurityNotice.css';

function DataSecurityNotice({ onViewPrivacyPolicy }) {
  return (
    <div className="data-security-notice">
      <div className="security-header">
        <div className="security-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
        </div>
        <h3 className="security-title">資料安全承諾</h3>
      </div>

      <ul className="security-list">
        <li>您的個人資料使用 Google Firebase 安全儲存，符合國際安全標準</li>
        <li>所有資料傳輸都經過 HTTPS 加密保護</li>
        <li>我們絕不會將您的資料出售或分享給第三方</li>
        <li>您可以隨時在會員中心查看、修改或刪除您的資料</li>
      </ul>

      <button
        type="button"
        className="privacy-policy-link"
        onClick={onViewPrivacyPolicy}
      >
        查看完整隱私權政策
      </button>
    </div>
  );
}

DataSecurityNotice.propTypes = {
  onViewPrivacyPolicy: PropTypes.func.isRequired,
};

export default DataSecurityNotice;
