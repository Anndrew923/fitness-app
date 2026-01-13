import React from 'react';
import PropTypes from 'prop-types';

const BasicInfoForm = ({
  userData,
  onChange,
  onNicknameChange,
  onGenerateNickname,
  onLogout,
  currentUser,
  weightReminder,
  t,
}) => {
  return (
    <div className="form-section">
      <div className="section-header">
        <h3 className="section-title">{t('userInfo.basicInfo')}</h3>
        {currentUser && (
          <button
            type="button"
            onClick={onLogout}
            title="登出"
            className="user-info__logout-btn"
            onMouseEnter={e => {
              const tooltip = document.createElement('div');
              tooltip.innerText = '登出';
              // ⚡ Phase 0: The Grand Purge - 移除内联样式，改用 className
              tooltip.className = 'logout-tooltip-styled';
              tooltip.className = 'logout-tooltip';
              e.currentTarget.parentNode.appendChild(tooltip);
            }}
            onMouseLeave={e => {
              const tooltip =
                e.currentTarget.parentNode.querySelector('.logout-tooltip');
              if (tooltip) tooltip.remove();
            }}
          >
            <span className="user-info__logout-icon">⎋</span>
          </button>
        )}
      </div>

      {/* 暱稱 */}
      <div className="form-group">
        <label htmlFor="nickname" className="form-label">
          {t('userInfo.nickname')}
        </label>
        <div className="nickname-input-group">
          <input
            id="nickname"
            name="nickname"
            type="text"
            value={userData?.nickname || ''}
            onChange={onNicknameChange}
            placeholder={t('userInfo.nicknamePlaceholder')}
            className="form-input"
            maxLength="16"
          />
          <button
            type="button"
            onClick={onGenerateNickname}
            className="generate-nickname-btn"
          >
            {t('userInfo.generateNickname')}
          </button>
        </div>
      </div>

      <div className="form-row">
        {/* 性別 */}
        <div className="form-group">
          <label htmlFor="gender" className="form-label">
            {t('userInfo.gender')}
          </label>
          <select
            id="gender"
            name="gender"
            value={userData?.gender || ''}
            onChange={onChange}
            className="form-input"
            required
            onInvalid={e =>
              e.currentTarget.setCustomValidity(t('errors.required'))
            }
            onInput={e => e.currentTarget.setCustomValidity('')}
          >
            <option value="">{t('userInfo.selectGender')}</option>
            <option value="male">{t('userInfo.male')}</option>
            <option value="female">{t('userInfo.female')}</option>
          </select>
        </div>

        {/* 年齡 */}
        <div className="form-group">
          <label htmlFor="age" className="form-label">
            {t('userInfo.age')}
          </label>
          <input
            id="age"
            name="age"
            type="number"
            value={userData?.age || ''}
            onChange={onChange}
            placeholder={t('userInfo.age')}
            className="form-input"
            required
            onInvalid={e =>
              e.currentTarget.setCustomValidity(t('errors.required'))
            }
            onInput={e => e.currentTarget.setCustomValidity('')}
            min="0"
            step="1"
          />
        </div>
      </div>

      <div className="form-row">
        {/* 身高 */}
        <div className="form-group">
          <label htmlFor="height" className="form-label">
            {t('userInfo.height')}
          </label>
          <input
            id="height"
            name="height"
            type="number"
            value={userData?.height || ''}
            onChange={onChange}
            placeholder={t('userInfo.height')}
            className="form-input"
            required
            onInvalid={e =>
              e.currentTarget.setCustomValidity(t('errors.required'))
            }
            onInput={e => e.currentTarget.setCustomValidity('')}
            min="0"
            step="0.1"
          />
        </div>

        {/* 體重 */}
        <div className="form-group">
          <label htmlFor="weight" className="form-label">
            {t('userInfo.weight')}
          </label>
          <div className="input-with-reminder">
            <input
              id="weight"
              name="weight"
              type="number"
              value={userData?.weight || ''}
              onChange={onChange}
              placeholder={t('userInfo.weight')}
              className="form-input"
              required
              onInvalid={e =>
                e.currentTarget.setCustomValidity(t('errors.required'))
              }
              onInput={e => e.currentTarget.setCustomValidity('')}
              min="0"
              step="0.1"
            />
            {weightReminder.show && (
              <div className="weight-reminder-bubble">
                <span className="reminder-icon">💡</span>
                <span className="reminder-text">{weightReminder.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

BasicInfoForm.propTypes = {
  userData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onNicknameChange: PropTypes.func.isRequired,
  onGenerateNickname: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  weightReminder: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default React.memo(BasicInfoForm);

