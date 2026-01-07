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
      {/* 結構性手術：頂部區塊 - 標題與登入表單 */}
      <div className={styles.crystalCard}>
        <h1 className={`magitek-header ${styles.title}`}>
          {t('login.loginTitle')}
        </h1>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>{t('login.email')}</label>
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
            <label className={styles.label}>{t('login.password')}</label>
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
            <label htmlFor="rememberMe" className={styles.rememberMeLabel}>
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
          <MagitekButton type="submit" disabled={loading} fullWidth>
            {loading
              ? t('common.loading')
              : isRegistering
              ? t('login.registerLink')
              : t('login.loginBtn')}
          </MagitekButton>
        </form>
        {/* 神秘入口底盤 - 功能按鈕區域 */}
        <div className={styles.portalPanel}>
          <MagitekButton
            onClick={() => setIsRegistering(!isRegistering)}
            fullWidth
            size="small"
          >
            {isRegistering
              ? t('login.switchToLogin')
              : t('login.switchToRegister')}
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
      </div>

      {/* 結構性手術：中間區塊 - Google 登入 */}
      <div className={styles.googleLoginContainer}>
        <SocialLogin onLogin={handleSocialLogin} onError={handleSocialError} />
      </div>

      {/* 結構性手術：底部區塊 - 使用說明 */}
      <div className={styles.instructionsContainer}>
        <h2 className={`magitek-header ${styles.instructionsTitle}`}>
          {t('login.instructionTitle')}
        </h2>
        <ul className={styles.instructionsList}>
          <li>
            <strong>{t('login.features.appraisal.title')}</strong>：
            <span className={styles.featureDesc}>
              {t('login.features.appraisal.desc')}
            </span>
          </li>
          <li>
            <strong>{t('login.features.aura.title')}</strong>：
            <span className={styles.featureDesc}>
              {t('login.features.aura.desc')}
            </span>
          </li>
          <li>
            <strong>{t('login.features.trajectory.title')}</strong>：
            <span className={styles.featureDesc}>
              {t('login.features.trajectory.desc')}
            </span>
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
