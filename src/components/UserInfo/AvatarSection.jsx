import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { compressImage } from '../../utils/imageUtils';
import './AvatarSection.css';

const AvatarSection = ({
  avatarUrl,
  isGuest,
  isUploading,
  onImageSelected,
  onError,
  t,
}) => {
  const [localError, setLocalError] = useState(null);

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    // 重置錯誤狀態
    setLocalError(null);
    if (onError) onError(null);

    // 文件類型驗證
    if (!file.type.startsWith('image/')) {
      const errorMsg = '請選擇圖片檔案';
      setLocalError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    // 文件大小驗證
    if (file.size > 7 * 1024 * 1024) {
      const errorMsg = '圖片大小請勿超過 7MB';
      setLocalError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    try {
      // 壓縮圖片 - 極致品質設定
      const compressed = await compressImage(file, 2000 * 1024, 512, 512);
      
      // 驗證壓縮後大小
      if (compressed.size > 2500 * 1024) {
        const errorMsg = '壓縮後圖片仍超過 2.5MB，請選擇更小的圖片';
        setLocalError(errorMsg);
        if (onError) onError(errorMsg);
        return;
      }

      // 成功：調用父組件的回調
      if (onImageSelected) {
        onImageSelected(compressed);
      }
    } catch (err) {
      const errorMsg = '圖片處理失敗: ' + err.message;
      setLocalError(errorMsg);
      if (onError) onError(errorMsg);
    }

    // 重置 input，允許選擇相同文件
    e.target.value = '';
  };

  const displayError = localError;

  return (
    <div className="avatar-section">
      <div className="avatar-container">
        <img
          src={isGuest ? '/guest-avatar.svg' : avatarUrl || '/default-avatar.svg'}
          alt={t('community.ui.avatarAlt')}
          className="user-avatar"
          loading="lazy"
          onError={e => {
            e.target.src = '/default-avatar.svg';
          }}
        />
      </div>

      <div className="avatar-actions-container">
        {!isGuest && (
          <label className="avatar-upload-label">
            {isUploading
              ? t('userInfo.avatar.uploading')
              : t('userInfo.avatar.change')}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
        {isGuest && (
          <div className="guest-avatar-note">
            <span>訪客模式</span>
          </div>
        )}
      </div>

      {displayError && <div className="avatar-error">{displayError}</div>}
    </div>
  );
};

AvatarSection.propTypes = {
  avatarUrl: PropTypes.string,
  isGuest: PropTypes.bool.isRequired,
  isUploading: PropTypes.bool.isRequired,
  onImageSelected: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default AvatarSection;

