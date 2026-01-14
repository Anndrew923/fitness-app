import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { compressImage } from '../../utils/imageUtils';
import './AvatarSection.css';

/**
 * ⚡ V6.9: 恢复上传功能 - 保持代码简洁
 * 
 * 功能：
 * - 使用高对比度 placeholder 直到真实图片加载
 * - 简洁的文件上传逻辑
 * - 预览 URL 立即更新
 */
const AvatarSection = ({
  avatarUrl,
  isGuest,
  isUploading,
  onImageSelected,
  onError,
  t,
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const previewUrlRef = useRef(null);
  const fileInputRef = useRef(null);

  // ⚡ V6.9: 高对比度 placeholder - 直到真实图片成功加载
  const HIGH_CONTRAST_PLACEHOLDER = 'https://i.pravatar.cc/150?u=placeholder';
  
  // ⚡ V6.9: 获取图片源 - 优先预览，然后真实URL，最后placeholder
  const getImageSrc = () => {
    if (isGuest) return '/guest-avatar.svg';
    if (previewUrl) return previewUrl;
    if (avatarUrl && avatarUrl.trim() !== '') {
      return avatarUrl;
    }
    return HIGH_CONTRAST_PLACEHOLDER;
  };
  const imageSrc = getImageSrc();

  // ⚡ V6.9: 简洁的文件上传处理
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (onError) onError(null);

    // 文件类型验证
    if (!file.type.startsWith('image/')) {
      if (onError) onError('請選擇圖片檔案');
      return;
    }

    // ⚡ V6.20: 文件大小验证 - 放寬至 20MB（壓縮後仍為 512x512，最終儲存成本不變）
    if (file.size > 20 * 1024 * 1024) {
      if (onError) onError('圖片大小請勿超過 20MB');
      return;
    }

    try {
      // 压缩图片
      const compressed = await compressImage(file, 2000 * 1024, 512, 512);

      // 立即创建预览 URL
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      const preview = URL.createObjectURL(compressed);
      previewUrlRef.current = preview;
      setPreviewUrl(preview);

      // 调用父组件回调上传
      if (onImageSelected) {
        onImageSelected(compressed);
      }

      // 清空 input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      if (onError) onError('圖片處理失敗: ' + err.message);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
        setPreviewUrl(null);
      }
    }
  };

  return (
    <div className="avatar-section">
      {/* ⚡ V6.9: 简洁的 img 标签 */}
      <img
        src={imageSrc}
        alt={t('community.ui.avatarAlt')}
        className="user-avatar"
        loading="eager"
        onError={(e) => {
          // 如果真实图片加载失败，fallback 到 placeholder
          if (e.target.src !== HIGH_CONTRAST_PLACEHOLDER && !e.target.src.includes('pravatar')) {
            e.target.src = HIGH_CONTRAST_PLACEHOLDER;
          }
        }}
      />
      
      {/* ⚡ V6.9: 隐藏的文件输入 - 覆盖在 11.5%/45.5% 中心点 */}
      {!isGuest && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="avatar-file-input"
        />
      )}
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
