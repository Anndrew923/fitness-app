import React from 'react';
import PropTypes from 'prop-types';
import SocialLogin from '../../components/SocialLogin';
import PrivacyPolicyModal from '../../components/PrivacyPolicyModal';
import MagitekButton from '../../components/Common/MagitekButton/MagitekButton';
import RuneInput from '../../components/Common/RuneInput/RuneInput';
import styles from './LoginPage.module.css';
import { useLoginLogic } from '../../hooks/useLoginLogic';

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
    <div className={styles.loginContainer}>
      <div className={styles.crystalCard}>
        <h1 className={styles.title}>
        {isRegistering ? t('login.register') : t('login.login')}
      </h1>
      {error && <p className={styles.errorMessage}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>
            {t('login.email')}
          </label>
          <RuneInput
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('login.emailPlaceholder')}
            required
            onInvalid={handleEmailInvalid}
            onInput={e => e.currentTarget.setCustomValidity('')}
            disabled={loading}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            {t('login.password')}
          </label>
          <RuneInput
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('login.passwordPlaceholder')}
            required
            minLength={6}
            onInvalid={handlePasswordInvalid}
            onInput={e => e.currentTarget.setCustomValidity('')}
            disabled={loading}
          />
        </div>
        <div className={styles.rememberMeContainer}>
          <label
            htmlFor="rememberMe"
            className={styles.rememberMeLabel}
          >
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              disabled={loading}
              className={styles.rememberMeCheckbox}
            />
            <span>{t('login.rememberMe')}</span>
          </label>
        </div>
        <MagitekButton
          type="submit"
          disabled={loading}
          fullWidth
        >
          {loading
            ? t('common.loading')
            : isRegistering
            ? t('login.register')
            : t('login.login')}
        </MagitekButton>
      </form>
      {/* 神秘入口底盤 - 功能按鈕區域 */}
      <div className={styles.portalPanel}>
        <MagitekButton
          onClick={() => setIsRegistering(!isRegistering)}
          fullWidth
          size="small"
        >
          {isRegistering ? t('login.switchToLogin') : t('login.switchToRegister')}
        </MagitekButton>

        <MagitekButton
          onClick={handleGuestMode}
          disabled={loading}
          fullWidth
          size="small"
        >
          {t('login.guestMode')}
        </MagitekButton>
      </div>

      <div className={styles.privacyNotice}>
        {i18n.language && i18n.language.toLowerCase().startsWith('zh') ? (
          <p>
            若繼續操作，即表示你同意最強肉體
            <a className={styles.privacyLink} href="/terms">
              使用條款
            </a>
            。請參閱我們的
            <a className={styles.privacyLink} href="/privacy-policy">
              隱私權政策
            </a>
            。
          </p>
        ) : (
          <p>
            By continuing, you agree to the Ultimate Physique
            <a className={styles.privacyLink} href="/terms">
              Terms of Service
            </a>
            . Please review our
            <a className={styles.privacyLink} href="/privacy-policy">
              Privacy Policy
            </a>
            .
          </p>
        )}
      </div>

      {/* Google 登入 - 魔導化水晶容器 */}
      <div className={styles.googleLoginContainer}>
        <SocialLogin onLogin={handleSocialLogin} onError={handleSocialError} />
      </div>

      {/* 說明區域 */}
      <div className={styles.instructionsContainer}>
        <h2 className={styles.instructionsTitle}>{t('login.instructions.title')}</h2>
        <ul className={styles.instructionsList}>
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
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;

