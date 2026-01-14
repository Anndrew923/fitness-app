import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { compressImage } from '../../utils/imageUtils';
import './AvatarSection.css';

/**
 * ⚡ V6.23: Pure Data Logic - 移除测试人脸，使用本地 placeholder
 * 
 * 功能：
 * - 使用本地 /default-avatar.svg 作为 placeholder（不再使用外部测试图片）
 * - 条件渲染：只有在有有效 URL 时才渲染 img 的 src
 * - Loading 状态：在 avatarUrl 加载时显示加载状态或保持空状态（但保持尺寸）
 * - 纯数据逻辑：初始状态为透明或本地 placeholder
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
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const previewUrlRef = useRef(null);
  const fileInputRef = useRef(null);

  // ⚡ V6.23: 监听 avatarUrl 变化，重置 loading 状态
  useEffect(() => {
    if (avatarUrl && avatarUrl.trim() !== '') {
      setIsLoading(true);
      setImageError(false);
    }
  }, [avatarUrl]);

  // ⚡ V6.23: 获取图片源 - 纯数据逻辑，不使用外部测试图片
  const getImageSrc = () => {
    // Guest 模式：使用 guest-avatar.svg
    if (isGuest) return '/guest-avatar.svg';
    
    // 优先预览 URL（用户刚上传的图片）
    if (previewUrl) return previewUrl;
    
    // 真实头像 URL（从 Firebase 获取）
    if (avatarUrl && avatarUrl.trim() !== '' && avatarUrl !== 'null' && avatarUrl !== 'undefined') {
      return avatarUrl;
    }
    
    // 默认：使用本地 placeholder（不再使用 pravatar.cc）
    return '/default-avatar.svg';
  };
  
  const imageSrc = getImageSrc();
  
  // ⚡ V6.23: 判断是否应该渲染图片
  const shouldRenderImage = () => {
    if (isGuest) return true; // Guest 模式总是显示
    if (previewUrl) return true; // 有预览 URL 时显示
    if (avatarUrl && avatarUrl.trim() !== '' && avatarUrl !== 'null' && avatarUrl !== 'undefined') {
      return true; // 有有效头像 URL 时显示
    }
    // 即使没有头像，也显示默认 placeholder
    return true;
  };

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

  // ⚡ V6.23: 图片加载成功处理
  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  // ⚡ V6.23: 图片加载失败处理 - 只使用本地 placeholder
  const handleImageError = (e) => {
    setIsLoading(false);
    setImageError(true);
    
    // 如果当前不是默认 placeholder，切换到默认 placeholder
    const currentSrc = e.target.src;
    if (!currentSrc.includes('/default-avatar.svg') && !currentSrc.includes('/guest-avatar.svg')) {
      e.target.src = '/default-avatar.svg';
      e.target.onerror = null; // 防止无限循环
    }
  };

  return (
    <div className="avatar-section">
      {/* ⚡ V6.23: 条件渲染 - 只有在有有效源时才渲染 img */}
      {shouldRenderImage() && (
        <>
          {/* Loading 状态指示器 */}
          {isLoading && !previewUrl && avatarUrl && (
            <div className="avatar-loading-spinner" />
          )}
          
          {/* 图片标签 - 只有在有有效源时才设置 src */}
          <img
            src={imageSrc}
            alt={t('community.ui.avatarAlt')}
            className={`user-avatar ${isLoading ? 'avatar-loading' : ''} ${imageError ? 'avatar-error' : ''}`}
            loading="eager"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              opacity: isLoading ? 0.5 : 1,
              transition: 'opacity 0.3s ease',
            }}
          />
        </>
      )}
      
      {/* ⚡ V6.23: 如果没有图片源，显示透明占位符（保持尺寸） */}
      {!shouldRenderImage() && (
        <div 
          className="avatar-placeholder-empty"
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'transparent',
          }}
        />
      )}
      
      {/* ⚡ V6.9: 隐藏的文件输入 - 覆盖在头像中心点 */}
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
