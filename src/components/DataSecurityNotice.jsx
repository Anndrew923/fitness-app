import PropTypes from 'prop-types';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import './DataSecurityNotice.css';

function DataSecurityNotice({ onViewPrivacyPolicy }) {
  const { t } = useTranslation();
  return (
    <div className="data-security-notice">
      <div className="security-header">
        <div className="security-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
        </div>
        <h3 className="security-title">{t('dataSecurity.title')}</h3>
      </div>

      <ul className="security-list">
        {t('dataSecurity.points', { returnObjects: true }).map((p, idx) => (
          <li key={idx}>{p}</li>
        ))}
      </ul>

      <button
        type="button"
        className="privacy-policy-link"
        onClick={onViewPrivacyPolicy}
      >
        {t('dataSecurity.viewPolicy')}
      </button>
    </div>
  );
}

DataSecurityNotice.propTypes = {
  onViewPrivacyPolicy: PropTypes.func.isRequired,
};

export default memo(DataSecurityNotice);
