import React from 'react';
import PropTypes from 'prop-types';
import BasicInfoForm from './BasicInfoForm';
import TrainingProfileForm from './TrainingProfileForm';
import './UserFormSection.css';

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
  return (
    <>
      {/* ⚡ 4. 擊穿白塊：直接在容器上套用內聯樣式，這是權重最高的做法 */}
      <div
        id="user-form-section"
        className="form-card"
        style={{
          background: 'transparent',
          backgroundColor: 'transparent',
        }}
      >
        <form className="user-form" onSubmit={onSubmit}>
          {/* 1. 基本資料表單 (Basic Info) */}
          <BasicInfoForm
            userData={userData}
            onChange={onChange}
            onNicknameChange={onNicknameChange}
            onGenerateNickname={onGenerateNickname}
            onLogout={onLogout}
            currentUser={currentUser}
            weightReminder={weightReminder}
            t={t}
          />

          {/* 2. 訓練背景與天梯設定表單 (Training & Ladder Profile) */}
          <TrainingProfileForm
            userData={userData}
            setUserData={setUserData}
            onChange={onChange}
            t={t}
          />

          {/* Phase 1 - Future Tasks Placeholder:
            這裡預留給接下來要開發的 Task 2 (BodyCompForm) 與 Task 3 (PerformanceForm)
          */}

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? t('userInfo.saving') : t('userInfo.saveData')}
            </button>
          </div>
        </form>
      </div>

      {/* Keyboard Safety Spacer: 
        確保在移動端，鍵盤彈起時，表單底部有足夠的滾動空間，
        避免提交按鈕被鍵盤或廣告遮擋。
        設置 height: 120px 以確保安全。
      */}
      <div
        className="bottom-spacer safe-area-keyboard"
        style={{
          height: '120px',
          width: '100%',
          clear: 'both',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
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

export default React.memo(UserFormSection);
