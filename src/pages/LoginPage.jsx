import React from 'react';
import PropTypes from 'prop-types';
import SocialLogin from '../components/SocialLogin';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import './LoginPage.css';
import { useLoginLogic } from '../hooks/useLoginLogic';

function Login({ onLogin }) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isRegistering,
    setIsRegistering,
    loading,
    rememberMe,
    setRememberMe,
    showPrivacyPolicy,
    setShowPrivacyPolicy,
    handleEmailInvalid,
    handlePasswordInvalid,
    handleSubmit,
    handleSocialLogin,
    handleSocialError,
    handleGuestMode,
    handlePrivacyAccept,
    t,
    i18n,
  } = useLoginLogic(onLogin);

  return (
    <div className="login-container">
      <h1 className="text-2xl font-bold text-center mb-6">
        {isRegistering ? t('login.register') : t('login.login')}
      </h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('login.email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('login.emailPlaceholder')}
            className="input-field"
            required
            onInvalid={handleEmailInvalid}
            onInput={e => e.currentTarget.setCustomValidity('')}
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('login.password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('login.passwordPlaceholder')}
            className="input-field"
            required
            minLength={6}
            onInvalid={handlePasswordInvalid}
            onInput={e => e.currentTarget.setCustomValidity('')}
            disabled={loading}
          />
        </div>
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '8px',
          }}
        >
          <label
            htmlFor="rememberMe"
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '14px',
              color: '#555',
            }}
          >
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              disabled={loading}
              style={{ margin: 0 }}
            />
            <span style={{ marginLeft: '6px' }}>{t('login.rememberMe')}</span>
          </label>
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading
            ? t('common.loading')
            : isRegistering
            ? t('login.register')
            : t('login.login')}
        </button>
      </form>
      <button
        onClick={() => setIsRegistering(!isRegistering)}
        className="toggle-btn"
      >
        {isRegistering ? t('login.switchToLogin') : t('login.switchToRegister')}
      </button>

      <button
        onClick={handleGuestMode}
        className="guest-btn"
        disabled={loading}
      >
        {t('login.guestMode')}
      </button>

      <div className="privacy-notice">
        {i18n.language && i18n.language.toLowerCase().startsWith('zh') ? (
          <p>
            若繼續操作，即表示你同意最強肉體
            <a className="privacy-link" href="/terms">
              使用條款
            </a>
            。請參閱我們的
            <a className="privacy-link" href="/privacy-policy">
              隱私權政策
            </a>
            。
          </p>
        ) : (
          <p>
            By continuing, you agree to the Ultimate Physique
            <a className="privacy-link" href="/terms">
              Terms of Service
            </a>
            . Please review our
            <a className="privacy-link" href="/privacy-policy">
              Privacy Policy
            </a>
            .
          </p>
        )}
      </div>

      <SocialLogin onLogin={handleSocialLogin} onError={handleSocialError} />

      <div className="instructions-container">
        <h2 className="instructions-title">{t('login.instructions.title')}</h2>
        <ul className="instructions-list">
          <li>
            <strong>{t('login.instructions.items.fair.title')}</strong>：
            {t('login.instructions.items.fair.desc')}
          </li>
          <li>
            <strong>{t('login.instructions.items.analysis.title')}</strong>：
            {t('login.instructions.items.analysis.desc')}
          </li>
          <li>
            <strong>{t('login.instructions.items.tracking.title')}</strong>：
            {t('login.instructions.items.tracking.desc')}
          </li>
        </ul>
      </div>

      <PrivacyPolicyModal
        isOpen={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
        onAccept={handlePrivacyAccept}
      />
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;
