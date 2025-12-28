import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  getDistrictsByCity,
  getCityNameEn,
  getDistrictNameEn,
} from '../../../utils/taiwanDistricts';
import CustomDropdown from './CustomDropdown';

// 常數定義
const JOB_OPTIONS = [
  { value: 'engineering' },
  { value: 'medical' },
  { value: 'coach' },
  { value: 'student' },
  { value: 'police_military' },
  { value: 'business' },
  { value: 'freelance' },
  { value: 'service' },
  { value: 'professional_athlete' },
  { value: 'artist_performer' },
  { value: 'other' },
];

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

const TrainingProfileForm = ({ userData, setUserData, onChange, t }) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'zh-TW';
  const isEnglish = currentLanguage === 'en-US';
  const [openDropdown, setOpenDropdown] = useState(null);

  // --- 地點相關 Helper Functions ---
  const getCountryDisplay = value => {
    if (!value) return '';
    const isKey = Object.values(COUNTRY_REVERSE_MAP).includes(value);
    if (isKey) return t(`userInfo.countries.${value}`, value);
    const key = COUNTRY_REVERSE_MAP[value];
    if (key) return t(`userInfo.countries.${key}`, value);
    return value;
  };

  const getCityDisplay = value => {
    if (!value) return '';
    return isEnglish ? getCityNameEn(value) : value;
  };

  const getDistrictDisplay = value => {
    if (!value) return '';
    const translationKey = `userInfo.districts.${value}`;
    const translated = t(translationKey);
    if (translated !== translationKey) return translated;
    return isEnglish ? getDistrictNameEn(value) : value;
  };

  // --- Hooks for Location Logic ---
  const availableDistricts = useMemo(() => {
    const city = userData?.city || userData?.region || '';
    if (city && userData?.country === 'TW') {
      return getDistrictsByCity(city);
    }
    return [];
  }, [userData?.city, userData?.region, userData?.country]);

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
          '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣',
          '屏東縣', '宜蘭縣', '花蓮縣', '台東縣', '澎湖縣', '金門縣', '連江縣',
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

  const districtOptions = useMemo(() => {
    return availableDistricts.map(district => {
      const translationKey = `userInfo.districts.${district}`;
      const translatedLabel = t(translationKey);
      const label =
        translatedLabel !== translationKey
          ? translatedLabel
          : isEnglish
          ? getDistrictNameEn(district)
          : district;
      return { value: district, label };
    });
  }, [availableDistricts, isEnglish, t]);

  const countryOptions = useMemo(
    () =>
      Object.values(COUNTRY_REVERSE_MAP).map(value => ({
        value,
        label: t(`userInfo.countries.${value}`, value),
      })),
    [t]
  );

  // --- Effects ---
  // 自動檢查地區合法性
  useEffect(() => {
    if (
      userData?.country === 'TW' &&
      userData?.district &&
      availableDistricts.length > 0
    ) {
      const isDistrictValid = availableDistricts.includes(userData.district);
      const isRegionMatch = userData.region && availableDistricts.includes(userData.region);

      if (!isDistrictValid && !isRegionMatch) {
        console.warn('Resetting invalid district:', userData.district);
        onChange({ target: { name: 'district', value: '' } });
      }
    }
  }, [userData?.country, userData?.district, userData?.region, availableDistricts, onChange]);

  // --- Handlers ---
  const handleCountryChange = e => {
    const value = e.target.value;
    
    // 1. 先執行標準的 onChange 更新 UI 與觸發可能的副作用
    onChange(e);

    // 2. 使用 setUserData 進行原子級更新 (Atomic Update)
    // 這能確保我們拿到的是最新的 prev 狀態，並一次性清空所有衝突欄位
    setUserData(prev => {
      if (value !== 'TW') {
        // 切換到國外：強制清空台灣專屬欄位
        return {
          ...prev,
          country: value, // 確保國家值同步
          city: '',
          district: ''
        };
      } else {
        // 切換回台灣：強制清空國外專屬欄位
        return {
          ...prev,
          country: value,
          region: ''
        };
      }
    });
  };

  const handleCityChange = e => {
    onChange(e);
  };

  const currentCity = userData?.city || userData?.region || '';

  return (
    <div className="form-section">
      <h3 className="section-title">🏆 {t('userInfo.ladder.title')}</h3>
      
      {/* 天梯隱私 */}
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

      {/* 訓練背景 */}
      <div className="training-info-section">
        <h4 className="training-info-title">
          💪 {t('userInfo.training.title')}
        </h4>
        <p className="training-info-desc">{t('userInfo.training.desc')}</p>

        <div className="form-row">
          {/* 職業 */}
          <div className="form-group">
            <label htmlFor="job_category" className="form-label">
              {t('userInfo.training.profession')}
            </label>
            <select
              id="job_category"
              name="job_category"
              value={
                userData?.job_category && PROFESSION_REVERSE_MAP[userData.job_category]
                  ? PROFESSION_REVERSE_MAP[userData.job_category]
                  : userData?.job_category || ''
              }
              onChange={e => {
                onChange({ target: { name: e.target.name, value: e.target.value } });
              }}
              className="form-input"
            >
              <option value="">
                {t('userInfo.training.selectProfession', '請選擇您的職業分類')}
              </option>
              {JOB_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {t(`userInfo.profession.${option.value}`, option.value)}
                </option>
              ))}
            </select>
            <p className="field-hint" style={{ marginTop: '4px', fontSize: '12px', color: '#718096' }}>
              💡 {t('userInfo.training.professionHint', '選擇職業可參與未來的「職業分組天梯」')}
            </p>
          </div>

          {/* 每週訓練時數 */}
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

        {/* 訓練年資 */}
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

        {/* --- 地區選擇區塊 --- */}
        <div className={`form-group ${openDropdown === 'country' ? 'dropdown-active' : ''}`}>
          <label htmlFor="country" className="form-label">
            {t('userInfo.ranking.country')}{' '}
            <span className="optional-badge">{t('userInfo.ranking.optional')}</span>
          </label>
          <CustomDropdown
            name="country"
            value={
              userData?.country && COUNTRY_REVERSE_MAP[userData.country]
                ? COUNTRY_REVERSE_MAP[userData.country]
                : userData?.country || ''
            }
            options={countryOptions}
            placeholder={t('userInfo.ranking.selectCountry')}
            onChange={e => handleCountryChange({ target: { name: e.target.name, value: e.target.value } })}
            getDisplayText={getCountryDisplay}
            className="form-input"
            onOpenChange={isOpen => setOpenDropdown(isOpen ? 'country' : null)}
          />
          <p className="field-hint">💡 {t('userInfo.ranking.countryHint')}</p>
        </div>

        {/* 台灣地區專用選擇器 */}
        {userData?.country === 'TW' && (
          <div className="form-row">
            <div className={`form-group ${openDropdown === 'city' ? 'dropdown-active' : ''}`}>
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
                onOpenChange={isOpen => setOpenDropdown(isOpen ? 'city' : null)}
              />
            </div>

            {currentCity && availableDistricts.length > 0 && (
              <div className={`form-group ${openDropdown === 'district' ? 'dropdown-active' : ''}`}>
                <label htmlFor="district" className="form-label">
                  {t('userInfo.ranking.region')}{' '}
                  <span className="optional-badge">{t('common.optional')}</span>
                </label>
                <CustomDropdown
                  name="district"
                  value={
                    userData?.district ||
                    (availableDistricts.includes(userData?.region) ? userData?.region : '') ||
                    ''
                  }
                  options={districtOptions}
                  placeholder={t('userInfo.ranking.selectDistrict')}
                  onChange={onChange}
                  getDisplayText={getDistrictDisplay}
                  className="form-input"
                  onOpenChange={isOpen => setOpenDropdown(isOpen ? 'district' : null)}
                />
              </div>
            )}
          </div>
        )}

        {/* 其他國家 Region 輸入框 */}
        {userData?.country && userData?.country !== 'TW' && userData?.country !== 'OTHER' && (
          <div className="form-group">
            <label htmlFor="region" className="form-label">
              {t('userInfo.ranking.region')} <span className="optional-badge">{t('userInfo.ranking.optional')}</span>
            </label>
            <select
              id="region"
              name="region"
              value={userData?.region || ''}
              onChange={onChange}
              className="form-input"
            >
              <option value="">{t('userInfo.ranking.selectRegion')}</option>
              <option value="">{t('userInfo.ranking.regionComingSoon')}</option>
            </select>
          </div>
        )}

        {/* OTHER 國家的手動輸入 */}
        {(!userData?.country || userData?.country === 'OTHER') && (
          <div className="form-group">
            <label htmlFor="region" className="form-label">
              {t('userInfo.ranking.region')} <span className="optional-badge">{t('userInfo.ranking.optional')}</span>
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
          </div>
        )}
      </div>
    </div>
  );
};

TrainingProfileForm.propTypes = {
  userData: PropTypes.object.isRequired,
  setUserData: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default React.memo(TrainingProfileForm);

