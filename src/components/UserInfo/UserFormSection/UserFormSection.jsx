import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  getDistrictsByCity,
  getDistrictsByCityBilingual,
  getAllCitiesBilingual,
  getCityNameEn,
  getGroupNameEn,
  getDistrictNameEn,
} from '../../../utils/taiwanDistricts';
import CustomDropdown from './CustomDropdown';
import './UserFormSection.css';

// 職業選項常數
const JOB_OPTIONS = [
  { value: 'engineering', label: '工程師 (軟體/硬體)' },
  { value: 'medical', label: '醫療人員 (醫護/藥師)' },
  { value: 'coach', label: '健身教練' },
  { value: 'student', label: '學生' },
  { value: 'police_military', label: '軍警消人員' },
  { value: 'business', label: '商業/金融/法務' },
  { value: 'freelance', label: '自由業/設計/藝術' },
  { value: 'service', label: '服務業' },
  { value: 'other', label: '其他' },
];

const UserFormSection = ({
  userData,
  loading,
  weightReminder,
  currentUser,
  onSubmit,
  onChange,
  onNicknameChange,
  onGenerateNickname,
  onLogout,
  setUserData,
  t,
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'zh-TW';
  const isEnglish = currentLanguage === 'en-US';

  // Get available districts based on selected city
  const availableDistricts = useMemo(() => {
    const city = userData?.city || userData?.region || '';
    if (city && userData?.country === 'TW') {
      return getDistrictsByCity(city);
    }
    return [];
  }, [userData?.city, userData?.region, userData?.country]);

  // Prepare city options for CustomDropdown (with optgroups) - bilingual
  const cityOptions = useMemo(() => {
    const groups = [
      {
        group: '直轄市',
        groupEn: 'Special Municipality',
        cities: ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市'],
      },
      {
        group: '省轄市',
        groupEn: 'Provincial City',
        cities: ['基隆市', '新竹市', '嘉義市'],
      },
      {
        group: '縣',
        groupEn: 'County',
        cities: [
          '新竹縣',
          '苗栗縣',
          '彰化縣',
          '南投縣',
          '雲林縣',
          '嘉義縣',
          '屏東縣',
          '宜蘭縣',
          '花蓮縣',
          '台東縣',
          '澎湖縣',
          '金門縣',
          '連江縣',
        ],
      },
    ];

    return groups.map(({ group, groupEn, cities }) => ({
      group: isEnglish ? groupEn : group,
      options: cities.map(city => ({
        value: city,
        label: isEnglish ? getCityNameEn(city) : city,
      })),
    }));
  }, [isEnglish]);

  // Prepare district options for CustomDropdown (simple array) - bilingual
  const districtOptions = useMemo(() => {
    return availableDistricts.map(district => ({
      value: district,
      label: isEnglish ? getDistrictNameEn(district) : district,
    }));
  }, [availableDistricts, isEnglish]);

  // Handle city change with cascading logic
  const handleCityChange = e => {
    const newCity = e.target.value;

    // Create a synthetic event for city
    const cityEvent = {
      target: {
        name: 'city',
        value: newCity,
      },
    };

    // Update city
    onChange(cityEvent);

    // Reset district when city changes
    if (newCity !== (userData?.city || userData?.region || '')) {
      const districtEvent = {
        target: {
          name: 'district',
          value: '',
        },
      };
      onChange(districtEvent);
    }
  };

  // Get current city value (support both city and region for backward compatibility)
  const currentCity = userData?.city || userData?.region || '';

  // 跟踪哪个下拉菜单打开（用于z-index管理）
  const [openDropdown, setOpenDropdown] = useState(null);

  // 准备国家选项
  const countryOptions = useMemo(
    () => [
      { value: 'TW', label: '台灣' },
      { value: 'CN', label: '中國' },
      { value: 'US', label: '美國' },
      { value: 'JP', label: '日本' },
      { value: 'KR', label: '韓國' },
      { value: 'SG', label: '新加坡' },
      { value: 'MY', label: '馬來西亞' },
      { value: 'HK', label: '香港' },
      { value: 'MO', label: '澳門' },
      { value: 'TH', label: '泰國' },
      { value: 'VN', label: '越南' },
      { value: 'PH', label: '菲律賓' },
      { value: 'ID', label: '印尼' },
      { value: 'AU', label: '澳洲' },
      { value: 'NZ', label: '紐西蘭' },
      { value: 'CA', label: '加拿大' },
      { value: 'GB', label: '英國' },
      { value: 'DE', label: '德國' },
      { value: 'FR', label: '法國' },
      { value: 'OTHER', label: '其他' },
    ],
    []
  );

  // 处理国家变更（保持级联逻辑）
  const handleCountryChange = e => {
    onChange(e);
    // Reset city and district when country changes
    if (e.target.value !== 'TW') {
      const cityEvent = {
        target: { name: 'city', value: '' },
      };
      const districtEvent = {
        target: { name: 'district', value: '' },
      };
      onChange(cityEvent);
      onChange(districtEvent);
    }
  };

  return (
    <>
      <div id="user-form-section" className="form-card">
        <form className="user-form" onSubmit={onSubmit}>
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
                    tooltip.style.position = 'absolute';
                    tooltip.style.bottom = '44px';
                    tooltip.style.left = '50%';
                    tooltip.style.transform = 'translateX(-50%)';
                    tooltip.style.background = 'rgba(60,60,60,0.95)';
                    tooltip.style.color = '#fff';
                    tooltip.style.padding = '6px 14px';
                    tooltip.style.borderRadius = '6px';
                    tooltip.style.fontSize = '13px';
                    tooltip.style.whiteSpace = 'nowrap';
                    tooltip.style.pointerEvents = 'none';
                    tooltip.style.zIndex = '1001';
                    tooltip.className = 'logout-tooltip';
                    e.currentTarget.parentNode.appendChild(tooltip);
                  }}
                  onMouseLeave={e => {
                    const tooltip =
                      e.currentTarget.parentNode.querySelector(
                        '.logout-tooltip'
                      );
                    if (tooltip) tooltip.remove();
                  }}
                >
                  <span className="user-info__logout-icon">⎋</span>
                </button>
              )}
            </div>

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
                      <span className="reminder-text">
                        {weightReminder.message}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 天梯隱私設置 */}
          <div className="form-section">
            <h3 className="section-title">🏆 {t('userInfo.ladder.title')}</h3>
            <div className="privacy-options">
              <label className="privacy-option">
                <input
                  type="checkbox"
                  checked={userData.isAnonymousInLadder === true}
                  onChange={e =>
                    setUserData(prev => ({
                      ...prev,
                      isAnonymousInLadder: e.target.checked,
                    }))
                  }
                />
                <div className="privacy-option-content">
                  <span className="privacy-option-title">
                    {t('userInfo.ladder.anonymousTitle')}
                  </span>
                  <span className="privacy-option-desc">
                    {t('userInfo.ladder.anonymousDesc')}
                  </span>
                </div>
              </label>
            </div>

            {/* 訓練背景信息（選填） */}
            <div className="training-info-section">
              <h4 className="training-info-title">
                💪 {t('userInfo.training.title')}
              </h4>
              <p className="training-info-desc">
                {t('userInfo.training.desc')}
              </p>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="job_category" className="form-label">
                    {t('userInfo.training.profession')}
                  </label>
                  <select
                    id="job_category"
                    name="job_category"
                    value={userData?.job_category || ''}
                    onChange={onChange}
                    className="form-input"
                  >
                    <option value="">請選擇您的職業分類</option>
                    {JOB_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p
                    className="field-hint"
                    style={{
                      marginTop: '4px',
                      fontSize: '12px',
                      color: '#718096',
                    }}
                  >
                    💡 選擇職業可參與未來的「職業分組天梯」
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="weeklyTrainingHours" className="form-label">
                    {t('userInfo.training.weeklyHours')}
                  </label>
                  <input
                    id="weeklyTrainingHours"
                    name="weeklyTrainingHours"
                    type="number"
                    value={userData?.weeklyTrainingHours || ''}
                    onChange={onChange}
                    placeholder={t('userInfo.placeholders.hours')}
                    className="form-input"
                    min="0"
                    max="168"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="trainingYears" className="form-label">
                  {t('userInfo.training.years')}
                </label>
                <input
                  id="trainingYears"
                  name="trainingYears"
                  type="number"
                  value={userData?.trainingYears || ''}
                  onChange={onChange}
                  placeholder={t('userInfo.placeholders.years')}
                  className="form-input"
                  min="0"
                  max="50"
                  step="0.5"
                />
              </div>

              {/* 排行榜資訊（選填） */}
              <div
                className={`form-group ${
                  openDropdown === 'country' ? 'dropdown-active' : ''
                }`}
              >
                <label htmlFor="country" className="form-label">
                  {t('userInfo.ranking.country')}{' '}
                  <span className="optional-badge">選填</span>
                </label>
                <CustomDropdown
                  name="country"
                  value={userData?.country || ''}
                  options={countryOptions}
                  placeholder={t('userInfo.ranking.selectCountry')}
                  onChange={handleCountryChange}
                  className="form-input"
                  onOpenChange={isOpen =>
                    setOpenDropdown(isOpen ? 'country' : null)
                  }
                />
                <p className="field-hint">
                  💡 {t('userInfo.ranking.countryHint')}
                </p>
              </div>

              {/* Location Selectors Row (for Taiwan: City + District) */}
              {userData?.country === 'TW' && (
                <div className="form-row">
                  {/* City Selector (for Taiwan) */}
                  <div
                    className={`form-group ${
                      openDropdown === 'city' ? 'dropdown-active' : ''
                    }`}
                  >
                    <label htmlFor="city" className="form-label">
                      {t('userInfo.ranking.city')}{' '}
                      <span className="optional-badge">{t('common.optional')}</span>
                    </label>
                    <CustomDropdown
                      name="city"
                      value={currentCity}
                      options={cityOptions}
                      placeholder={t('userInfo.ranking.selectCity')}
                      onChange={handleCityChange}
                      className="form-input"
                      onOpenChange={isOpen =>
                        setOpenDropdown(isOpen ? 'city' : null)
                      }
                    />
                    <p className="field-hint">
                      💡 {t('userInfo.ranking.cityHint')}
                    </p>
                  </div>

                  {/* District Selector (for Taiwan, cascading from City) */}
                  {currentCity && availableDistricts.length > 0 && (
                    <div
                      className={`form-group ${
                        openDropdown === 'district' ? 'dropdown-active' : ''
                      }`}
                    >
                      <label htmlFor="district" className="form-label">
                        {t('userInfo.ranking.region')}{' '}
                        <span className="optional-badge">{t('common.optional')}</span>
                      </label>
                      <CustomDropdown
                        name="district"
                        value={userData?.district || ''}
                        options={districtOptions}
                        placeholder={t('form.selectDistrict')}
                        onChange={onChange}
                        className="form-input"
                        onOpenChange={isOpen =>
                          setOpenDropdown(isOpen ? 'district' : null)
                        }
                      />
                      <p className="field-hint">
                        💡 {t('ladder.zones.district')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Region Selector (for non-Taiwan countries) */}
              {userData?.country &&
                userData?.country !== '' &&
                userData?.country !== 'TW' &&
                userData?.country !== 'OTHER' && (
                  <div className="form-group">
                    <label htmlFor="region" className="form-label">
                      {t('userInfo.ranking.region')}{' '}
                      <span className="optional-badge">選填</span>
                    </label>
                    <select
                      id="region"
                      name="region"
                      value={userData?.region || ''}
                      onChange={onChange}
                      className="form-input"
                    >
                      <option value="">
                        {t('userInfo.ranking.selectRegion')}
                      </option>
                      {/* 未來可根據選擇的國家動態載入城市列表 */}
                      <option value="">
                        {t('userInfo.ranking.regionComingSoon')}
                      </option>
                    </select>
                    <p className="field-hint">
                      💡 {t('userInfo.ranking.regionHint')}
                    </p>
                  </div>
                )}

              {/* Text Input for OTHER country or no country selected */}
              {(!userData?.country ||
                userData?.country === '' ||
                userData?.country === 'OTHER') && (
                <div className="form-group">
                  <label htmlFor="region" className="form-label">
                    {t('userInfo.ranking.region')}{' '}
                    <span className="optional-badge">選填</span>
                  </label>
                  <input
                    id="region"
                    name="region"
                    type="text"
                    value={userData?.region || ''}
                    onChange={onChange}
                    placeholder={
                      userData?.country === 'OTHER'
                        ? t('userInfo.ranking.regionPlaceholderOther')
                        : t('userInfo.ranking.selectCountryFirst')
                    }
                    className="form-input"
                    maxLength="50"
                    disabled={!userData?.country || userData?.country === ''}
                  />
                  <p className="field-hint">
                    💡 {t('userInfo.ranking.regionHint')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? t('userInfo.saving') : t('userInfo.saveData')}
            </button>
          </div>
        </form>
      </div>

      {/* ✅ 修復：物理spacer元素，強制頁面延長60px，為下拉菜單提供綠色背景空間 */}
      <div
        className="bottom-spacer"
        style={{ height: '60px', width: '100%', clear: 'both' }}
      />
    </>
  );
};

UserFormSection.propTypes = {
  userData: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  weightReminder: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
  currentUser: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onNicknameChange: PropTypes.func.isRequired,
  onGenerateNickname: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  setUserData: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default UserFormSection;
