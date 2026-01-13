import { useState, useEffect, useRef } from 'react';
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
  const [previewUrl, setPreviewUrl] = useState(null); // ⚡ 本地預覽 URL
  const previewUrlRef = useRef(null); // 用於清理 URL
  const fileInputRef = useRef(null); // ⚡ 用於延遲清空 input
  const previousAvatarUrlRef = useRef(null); // ⚡ 追蹤上一次的 avatarUrl

  // ⚡ 清理預覽 URL，防止內存洩漏
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  // ⚡ 當 avatarUrl 更新時（上傳完成），清理本地預覽
  useEffect(() => {
    // 只有當 avatarUrl 真正改變且有效時，才清理預覽
    if (
      avatarUrl &&
      avatarUrl !== previousAvatarUrlRef.current &&
      previewUrlRef.current
    ) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
      setPreviewUrl(null);
    }
    // 更新追蹤的 avatarUrl
    previousAvatarUrlRef.current = avatarUrl;
  }, [avatarUrl]);

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    // 重置錯誤狀態
    setLocalError(null);
    if (onError) onError(null);

    // ⚡ 立即創建預覽 URL，讓用戶看到圖片
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    const preview = URL.createObjectURL(file);
    previewUrlRef.current = preview;
    setPreviewUrl(preview);

    // 文件類型驗證
    if (!file.type.startsWith('image/')) {
      const errorMsg = '請選擇圖片檔案';
      setLocalError(errorMsg);
      if (onError) onError(errorMsg);
      // 清理預覽
      URL.revokeObjectURL(preview);
      previewUrlRef.current = null;
      setPreviewUrl(null);
      // ⚡ 驗證失敗時立即清空，允許重新選擇
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // 文件大小驗證
    if (file.size > 7 * 1024 * 1024) {
      const errorMsg = '圖片大小請勿超過 7MB';
      setLocalError(errorMsg);
      if (onError) onError(errorMsg);
      // 清理預覽
      URL.revokeObjectURL(preview);
      previewUrlRef.current = null;
      setPreviewUrl(null);
      // ⚡ 驗證失敗時立即清空，允許重新選擇
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        // 清理預覽
        URL.revokeObjectURL(preview);
        previewUrlRef.current = null;
        setPreviewUrl(null);
        // ⚡ 驗證失敗時立即清空，允許重新選擇
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // ⚡ 使用壓縮後的 blob 創建新的預覽 URL
      const compressedPreview = URL.createObjectURL(compressed);
      URL.revokeObjectURL(preview); // 清理原始預覽
      previewUrlRef.current = compressedPreview;
      setPreviewUrl(compressedPreview);

      // 成功：調用父組件的回調
      if (onImageSelected) {
        onImageSelected(compressed);
      }

      // ⚡ 成功處理後，延遲清空 input，允許再次選擇相同文件
      // 使用 setTimeout 確保在文件處理完成後才清空
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 100);
    } catch (err) {
      const errorMsg = '圖片處理失敗: ' + err.message;
      setLocalError(errorMsg);
      if (onError) onError(errorMsg);
      // 清理預覽
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
        setPreviewUrl(null);
      }
      // ⚡ 處理失敗時立即清空，允許重新選擇
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const displayError = localError;

  // ⚡ 優先使用預覽 URL，如果沒有則使用 avatarUrl
  // ⚡ 添加時間戳強制刷新，確保圖片更新
  const imageSrc = isGuest
    ? '/guest-avatar.svg'
    : previewUrl ||
      (avatarUrl ? `${avatarUrl}?t=${Date.now()}` : '/default-avatar.svg');

  return (
    <div className="avatar-section">
      <div className="avatar-container">
        <img
          key={avatarUrl || previewUrl} // ⚡ 使用 key 強制重新渲染
          src={imageSrc}
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
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="avatar-file-input"
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
