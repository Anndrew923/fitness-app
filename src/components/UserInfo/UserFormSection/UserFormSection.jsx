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

// 職業選項常數 (values only, labels will be translated)
const JOB_OPTIONS = [
  { value: 'engineering' },
  { value: 'medical' },
  { value: 'coach' },
  { value: 'student' },
  { value: 'police_military' },
  { value: 'business' },
  { value: 'freelance' },
  { value: 'service' },
  { value: 'other' },
];

// 反向映射：中文值 -> 翻译 key（用于处理数据库中存储的中文值）
const PROFESSION_REVERSE_MAP = {
  '工程師 (軟體/硬體)': 'engineering',
  工程師: 'engineering',
  '醫療人員 (醫護/藥師)': 'medical',
  醫療人員: 'medical',
  健身教練: 'coach',
  學生: 'student',
  軍警消人員: 'police_military',
  軍警消: 'police_military',
  '商業/金融/法務': 'business',
  '商業/金融': 'business',
  '自由業/設計/藝術': 'freelance',
  '自由業/設計': 'freelance',
  服務業: 'service',
  其他: 'other',
};

const COUNTRY_REVERSE_MAP = {
  台灣: 'TW',
  中國: 'CN',
  美國: 'US',
  日本: 'JP',
  韓國: 'KR',
  新加坡: 'SG',
  馬來西亞: 'MY',
  香港: 'HK',
  澳門: 'MO',
  泰國: 'TH',
  越南: 'VN',
  菲律賓: 'PH',
  印尼: 'ID',
  澳洲: 'AU',
  紐西蘭: 'NZ',
  加拿大: 'CA',
  英國: 'GB',
  德國: 'DE',
  法國: 'FR',
  其他: 'OTHER',
};

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

  // Helper: 获取职业显示文本（处理存储的中文值或 key）
  const getProfessionDisplay = (value) => {
    if (!value) return '';
    // 如果已经是 key，直接翻译
    if (JOB_OPTIONS.some(opt => opt.value === value)) {
      return t(`userInfo.profession.${value}`, value);
    }
    // 如果是中文值，先映射到 key 再翻译
    const key = PROFESSION_REVERSE_MAP[value];
    if (key) {
      return t(`userInfo.profession.${key}`, value);
    }
    // 如果都不匹配，返回原值
    return value;
  };

  // Helper: 获取国家显示文本（处理存储的中文值或 key）
  const getCountryDisplay = (value) => {
    if (!value) return '';
    // 如果已经是 key（在 COUNTRY_REVERSE_MAP 的值中），直接翻译
    const isKey = Object.values(COUNTRY_REVERSE_MAP).includes(value);
    if (isKey) {
      return t(`userInfo.countries.${value}`, value);
    }
    // 如果是中文值，先映射到 key 再翻译
    const key = COUNTRY_REVERSE_MAP[value];
    if (key) {
      return t(`userInfo.countries.${key}`, value);
    }
    // 如果都不匹配，返回原值
    return value;
  };

  // Helper: 获取城市显示文本（处理存储的中文值）
  const getCityDisplay = (value) => {
    if (!value) return '';
    // 使用 getCityNameEn 进行翻译，或返回原值
    return isEnglish ? getCityNameEn(value) : value;
  };

  // Helper: 获取地区显示文本（处理存储的中文值）
  const getDistrictDisplay = (value) => {
    if (!value) return '';
    // 尝试直接翻译（如果 key 存在）
    const translationKey = `userInfo.districts.${value}`;
    const translated = t(translationKey);
    // 如果翻译存在（不等于 key），使用翻译
    if (translated !== translationKey) {
      return translated;
    }
    // 否则使用 getDistrictNameEn 或原值
    return isEnglish ? getDistrictNameEn(value) : value;
  };

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

  // Prepare district options for CustomDropdown (simple array) - bilingual with i18n
  const districtOptions = useMemo(() => {
    return availableDistricts.map(district => {
      // Try to get translation, if key doesn't exist, t() returns the key itself
      const translationKey = `userInfo.districts.${district}`;
      const translatedLabel = t(translationKey);
      // If translation exists (not equal to the key), use it; otherwise fallback
      const label =
        translatedLabel !== translationKey
          ? translatedLabel
          : isEnglish
          ? getDistrictNameEn(district)
          : district;
      return {
        value: district,
        label,
      };
    });
  }, [availableDistricts, isEnglish, t]);

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

  // 准备国家选项 (使用 i18n)
  const countryOptions = useMemo(
    () => [
      { value: 'TW' },
      { value: 'CN' },
      { value: 'US' },
      { value: 'JP' },
      { value: 'KR' },
      { value: 'SG' },
      { value: 'MY' },
      { value: 'HK' },
      { value: 'MO' },
      { value: 'TH' },
      { value: 'VN' },
      { value: 'PH' },
      { value: 'ID' },
      { value: 'AU' },
      { value: 'NZ' },
      { value: 'CA' },
      { value: 'GB' },
      { value: 'DE' },
      { value: 'FR' },
      { value: 'OTHER' },
    ].map(option => ({
      ...option,
      label: t(`userInfo.countries.${option.value}`, option.value),
    })),
    [t]
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
                    value={
                      // 如果存储的是中文，映射到 key；否则使用原值（可能是 key 或空）
                      userData?.job_category && PROFESSION_REVERSE_MAP[userData.job_category]
                        ? PROFESSION_REVERSE_MAP[userData.job_category]
                        : userData?.job_category || ''
                    }
                    onChange={e => {
                      // 确保保存的是 key，不是中文
                      const syntheticEvent = {
                        target: {
                          name: e.target.name,
                          value: e.target.value, // 已经是 key
                        },
                      };
                      onChange(syntheticEvent);
                    }}
                    className="form-input"
                  >
                    <option value="">{t('userInfo.training.selectProfession', '請選擇您的職業分類')}</option>
                    {JOB_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {t(`userInfo.profession.${option.value}`, option.value)}
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
                    💡 {t('userInfo.training.professionHint', '選擇職業可參與未來的「職業分組天梯」')}
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
                  <span className="optional-badge">{t('userInfo.ranking.optional')}</span>
                </label>
                <CustomDropdown
                  name="country"
                  value={
                    // 如果存储的是中文，映射到 key；否则使用原值
                    userData?.country && COUNTRY_REVERSE_MAP[userData.country]
                      ? COUNTRY_REVERSE_MAP[userData.country]
                      : userData?.country || ''
                  }
                  options={countryOptions}
                  placeholder={t('userInfo.ranking.selectCountry')}
                  onChange={e => {
                    // 确保保存的是 key
                    const syntheticEvent = {
                      target: {
                        name: e.target.name,
                        value: e.target.value, // 已经是 key
                      },
                    };
                    handleCountryChange(syntheticEvent);
                  }}
                  getDisplayText={getCountryDisplay}
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
                      getDisplayText={getCityDisplay}
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
                        placeholder={t('userInfo.ranking.selectDistrict')}
                        onChange={onChange}
                        getDisplayText={getDistrictDisplay}
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
                      <span className="optional-badge">{t('userInfo.ranking.optional')}</span>
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
                    <span className="optional-badge">{t('userInfo.ranking.optional')}</span>
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
