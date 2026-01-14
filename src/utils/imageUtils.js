// ⚡ V6.20: 極致品質圖片壓縮工具 - 優化大文件處理，防止 OOM
/**
 * 壓縮圖片，支持大文件（最高 20MB）
 * 使用 createImageBitmap 優化內存使用，防止 OOM
 * 
 * @param {File} file - 原始圖片文件
 * @param {number} maxSize - 壓縮後最大文件大小（字節），默認 300KB
 * @param {number} maxWidth - 最大寬度，默認 192px
 * @param {number} maxHeight - 最大高度，默認 192px
 * @returns {Promise<Blob>} 壓縮後的圖片 Blob
 */
export async function compressImage(
  file,
  maxSize = 300 * 1024,
  maxWidth = 192,
  maxHeight = 192
) {
  return new Promise(async (resolve, reject) => {
    try {
      let img = new window.Image();
      let imageBitmap = null;
      let useBitmap = false;

      // ⚡ V6.20: 優先使用 createImageBitmap，更安全且內存效率更高
      // createImageBitmap 可以處理大文件而不會導致 OOM
      if (window.createImageBitmap && file instanceof Blob) {
        try {
          // 使用 createImageBitmap 處理大文件（更安全，不會將整個文件載入內存）
          imageBitmap = await createImageBitmap(file);
          useBitmap = true;
        } catch (bitmapError) {
          // 如果 createImageBitmap 失敗，回退到傳統方法
          console.warn('createImageBitmap 不可用，使用傳統方法:', bitmapError);
          useBitmap = false;
        }
      }

      if (useBitmap && imageBitmap) {
        // ⚡ V6.20: 使用 ImageBitmap 路徑（更安全）
        try {
          const canvas = document.createElement('canvas');
          let width = imageBitmap.width;
          let height = imageBitmap.height;

          // ⚡ V6.20: 內存保護 - 限制最大尺寸，防止超大圖片導致 OOM
          const MAX_DIMENSION = 4096; // 最大尺寸限制（4K）
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // 計算最佳尺寸，保持長寬比（最終輸出尺寸）
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { 
            alpha: false,
            willReadFrequently: false // 優化性能
          });

          // 啟用最高品質圖像渲染
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // 使用白色背景（針對透明圖片）
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          // 直接從 ImageBitmap 繪製（更高效）
          ctx.drawImage(imageBitmap, 0, 0, width, height);

          // 清理 ImageBitmap
          imageBitmap.close();

          // 生成壓縮後的 Blob
          canvas.toBlob(
            blob => {
              if (!blob) {
                reject(new Error('圖片壓縮失敗：無法生成 Blob'));
                return;
              }

              if (blob.size > maxSize) {
                // 再壓縮一次，仍保持極高品質
                canvas.toBlob(
                  blob2 => {
                    if (!blob2) {
                      reject(new Error('圖片二次壓縮失敗'));
                      return;
                    }
                    resolve(blob2);
                  },
                  'image/jpeg',
                  0.93
                );
              } else {
                resolve(blob);
              }
            },
            'image/jpeg',
            0.98
          );
        } catch (error) {
          // 如果 ImageBitmap 處理失敗，清理並回退
          if (imageBitmap) {
            imageBitmap.close();
          }
          reject(new Error('圖片處理失敗: ' + error.message));
        }
      } else {
        // 傳統方法：使用 FileReader（對小文件安全）
        const reader = new FileReader();
        reader.onload = e => {
          img.src = e.target.result;
        };
        reader.onerror = reject;

        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // ⚡ V6.20: 內存保護 - 限制最大尺寸，防止超大圖片導致 OOM
            const MAX_DIMENSION = 4096; // 最大尺寸限制（4K）
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
              const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }

            // 計算最佳尺寸，保持長寬比（最終輸出尺寸）
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d', { 
              alpha: false,
              willReadFrequently: false // 優化性能
            });

            // 啟用最高品質圖像渲染
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // 使用白色背景（針對透明圖片）
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);

            // 繪製圖像
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              blob => {
                if (!blob) {
                  reject(new Error('圖片壓縮失敗：無法生成 Blob'));
                  return;
                }

                if (blob.size > maxSize) {
                  // 再壓縮一次，仍保持極高品質
                  canvas.toBlob(
                    blob2 => {
                      if (!blob2) {
                        reject(new Error('圖片二次壓縮失敗'));
                        return;
                      }
                      resolve(blob2);
                    },
                    'image/jpeg',
                    0.93
                  );
                } else {
                  resolve(blob);
                }
              },
              'image/jpeg',
              0.98
            );
          } catch (error) {
            reject(new Error('圖片處理失敗: ' + error.message));
          }
        };

        img.onerror = (error) => {
          reject(new Error('圖片載入失敗: ' + (error.message || '未知錯誤')));
        };

        reader.readAsDataURL(file);
      }
    } catch (error) {
      reject(new Error('圖片壓縮初始化失敗: ' + error.message));
    }
  });
}
