import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import logger from '../utils/logger';

/**
 * Hook to handle native viewport adjustments:
 * - Status Bar height detection and management
 * - Keyboard detection and state management
 * - Input field auto-scroll when keyboard appears
 */
export default function useNativeViewport() {
  // ✅ Status Bar 和視口調整的統一事件管理器
  useEffect(() => {
    if (
      !Capacitor.isNativePlatform() ||
      Capacitor.getPlatform() !== 'android'
    ) {
      return;
    }

    // 統一的視口變化處理器
    let viewportChangeTimeout = null;
    let lastKnownStatusBarHeight = 0;
    let lastKnownViewportHeight =
      window.visualViewport?.height || window.innerHeight;
    let lastKnownWindowHeight = window.innerHeight;
    // ✅ 關鍵改進：記錄初始值（應用啟動時的 window.innerHeight）
    let initialWindowHeight = window.innerHeight;
    let initialScreenHeight = window.screen.height;
    let initialStatusBarHeight = 0;
    let isInitialized = false;

    // ✅ 初始化：在應用啟動時記錄初始 Status Bar 高度
    const initializeStatusBarHeight = () => {
      if (isInitialized && initialStatusBarHeight > 0) return;

      // ✅ 優先使用原生注入的值（最準確，不應該被覆蓋）
      const nativeInjected = window.__nativeInsetsInjected;
      const existingTop = getComputedStyle(document.documentElement)
        .getPropertyValue('--safe-area-inset-top')
        .trim();

      if (nativeInjected && existingTop && existingTop !== '0px') {
        const parsedHeight = parseFloat(existingTop.replace('px', '')) || 0;
        if (parsedHeight > 0) {
          initialStatusBarHeight = parsedHeight;
          isInitialized = true;
          lastKnownStatusBarHeight = initialStatusBarHeight;
          logger.debug(
            'Status bar height initialized from native:',
            initialStatusBarHeight,
            'px'
          );
          return; // ✅ 關鍵：原生注入的值最準確，不需要重新計算
        }
      }

      // 只有在原生注入失敗時，才使用 JavaScript 計算
      // 計算初始 Status Bar 高度（應用啟動時，鍵盤肯定未開啟）
      const initialHeightDiff = initialScreenHeight - initialWindowHeight;

      if (initialHeightDiff > 0 && initialHeightDiff <= 80) {
        initialStatusBarHeight = initialHeightDiff;
      } else {
        // 備用方案：檢測 Android 版本
        const userAgent = navigator.userAgent || '';
        const androidVersionMatch = userAgent.match(/Android\s([0-9.]*)/);
        const androidVersion = androidVersionMatch
          ? parseFloat(androidVersionMatch[1])
          : 0;

        if (androidVersion >= 15) {
          initialStatusBarHeight = 48;
        } else {
          initialStatusBarHeight = 24;
        }
      }

      isInitialized = true;
      lastKnownStatusBarHeight = initialStatusBarHeight;

      // ✅ 關鍵：只有在原生注入失敗時，才設置 CSS 變量
      // 如果原生已注入，不應該覆蓋
      if (!nativeInjected) {
        document.documentElement.style.setProperty(
          '--safe-area-inset-top',
          `${initialStatusBarHeight}px`
        );

        const styleId = 'android-status-bar-height-fix';
        let styleElement = document.getElementById(styleId);
        if (!styleElement) {
          styleElement = document.createElement('style');
          styleElement.id = styleId;
          document.head.appendChild(styleElement);
        }

        styleElement.textContent = `
          :root {
            --safe-area-inset-top: ${initialStatusBarHeight}px !important;
          }
        `;
      }

      logger.debug(
        'Status bar height initialized:',
        initialStatusBarHeight,
        'px'
      );
    };

    const handleUnifiedViewportChange = () => {
      // 清除之前的定時器
      if (viewportChangeTimeout) {
        clearTimeout(viewportChangeTimeout);
      }

      // 防抖處理，避免頻繁觸發
      viewportChangeTimeout = setTimeout(() => {
        try {
          // ✅ 關鍵改進：多重檢查鍵盤狀態（在計算 heightDiff 之前）
          const nativeKeyboardVisible =
            getComputedStyle(document.documentElement).getPropertyValue(
              '--is-keyboard-visible'
            ) === '1';
          const nativeKeyboardHeight =
            parseFloat(
              getComputedStyle(document.documentElement)
                .getPropertyValue('--keyboard-height')
                .replace('px', '')
            ) || 0;

          // ✅ 改進：使用視口高度變化來輔助判斷鍵盤狀態（更準確）
          const currentViewportHeight =
            window.visualViewport?.height || window.innerHeight;
          const currentWindowHeight = window.innerHeight;
          const viewportHeightDiff =
            lastKnownViewportHeight - currentViewportHeight;
          const windowHeightDiff = lastKnownWindowHeight - currentWindowHeight;

          // ✅ 關鍵改進：使用初始值比較，更準確判斷鍵盤狀態
          const windowHeightDiffFromInitial =
            initialWindowHeight - currentWindowHeight;

          // 如果視口高度明顯減少（>150px），很可能鍵盤已開啟
          const likelyKeyboardOpen =
            viewportHeightDiff > 150 ||
            windowHeightDiff > 150 ||
            windowHeightDiffFromInitial > 150 ||
            nativeKeyboardHeight > 150 ||
            nativeKeyboardVisible;

          // 如果鍵盤已開啟或可能開啟，完全跳過 Status Bar 檢測
          if (likelyKeyboardOpen) {
            lastKnownViewportHeight = currentViewportHeight;
            lastKnownWindowHeight = currentWindowHeight;
            return; // 鍵盤已開啟，不更新 Status Bar（保持上次的值）
          }

          lastKnownViewportHeight = currentViewportHeight;
          lastKnownWindowHeight = currentWindowHeight;

          // ✅ 關鍵改進：優先檢查原生注入的值（最準確，不應該被覆蓋）
          const nativeInjected = window.__nativeInsetsInjected;
          const existingTop = getComputedStyle(document.documentElement)
            .getPropertyValue('--safe-area-inset-top')
            .trim();

          // ✅ 關鍵：如果原生已注入且值有效，直接使用，不再重新計算
          if (nativeInjected && existingTop && existingTop !== '0px') {
            const parsedHeight = parseFloat(existingTop.replace('px', '')) || 0;
            if (parsedHeight > 0) {
              // 更新初始值（如果還沒初始化）
              if (!isInitialized || initialStatusBarHeight === 0) {
                initialStatusBarHeight = parsedHeight;
                isInitialized = true;
                lastKnownStatusBarHeight = parsedHeight;
                logger.debug(
                  'Status bar height updated from native injection:',
                  parsedHeight,
                  'px'
                );
              }
              return; // ✅ 關鍵：原生注入的值最準確，不應該被覆蓋
            }
          }

          // ✅ 關鍵改進：如果已初始化且初始值有效，直接使用，不再重新計算
          // 這確保不會因為鍵盤影響而重新計算錯誤的值
          if (isInitialized && initialStatusBarHeight > 0) {
            // 只有在值改變時才更新（避免不必要的 DOM 操作）
            if (initialStatusBarHeight !== lastKnownStatusBarHeight) {
              lastKnownStatusBarHeight = initialStatusBarHeight;

              // ✅ 關鍵：只有在原生注入失敗時，才設置 CSS 變量
              // 如果原生已注入，不應該覆蓋
              if (!nativeInjected) {
                document.documentElement.style.setProperty(
                  '--safe-area-inset-top',
                  `${initialStatusBarHeight}px`
                );

                const styleId = 'android-status-bar-height-fix';
                let styleElement = document.getElementById(styleId);
                if (!styleElement) {
                  styleElement = document.createElement('style');
                  styleElement.id = styleId;
                  document.head.appendChild(styleElement);
                }

                styleElement.textContent = `
                  :root {
                    --safe-area-inset-top: ${initialStatusBarHeight}px !important;
                  }
                `;

                logger.debug(
                  'Status bar height updated (unified):',
                  initialStatusBarHeight,
                  'px'
                );
              }
            }
            return; // ✅ 關鍵：已初始化，直接返回，不再重新計算
          }

          // ✅ 只有在未初始化時才計算，且必須確保鍵盤未開啟
          if (!isInitialized) {
            const screenHeight = window.screen.height;
            const windowHeight = window.innerHeight;
            const heightDiff = screenHeight - windowHeight;

            let statusBarHeight = 0;

            if (heightDiff > 0 && heightDiff <= 80) {
              statusBarHeight = heightDiff;
            } else {
              // 備用方案：檢測 Android 版本
              const userAgent = navigator.userAgent || '';
              const androidVersionMatch = userAgent.match(/Android\s([0-9.]*)/);
              const androidVersion = androidVersionMatch
                ? parseFloat(androidVersionMatch[1])
                : 0;

              if (androidVersion >= 15) {
                statusBarHeight = 48;
              } else {
                statusBarHeight = 24;
              }
            }

            // ✅ 改進：驗證檢測結果的合理性（靜默處理，不顯示警告）
            if (statusBarHeight > 0 && statusBarHeight < 20) {
              statusBarHeight = 24;
            }

            // 更新初始值
            if (statusBarHeight > 0) {
              initialStatusBarHeight = statusBarHeight;
              isInitialized = true;
              lastKnownStatusBarHeight = statusBarHeight;

              // ✅ 關鍵：只有在原生注入失敗時，才設置 CSS 變量
              if (!nativeInjected) {
                document.documentElement.style.setProperty(
                  '--safe-area-inset-top',
                  `${statusBarHeight}px`
                );

                const styleId = 'android-status-bar-height-fix';
                let styleElement = document.getElementById(styleId);
                if (!styleElement) {
                  styleElement = document.createElement('style');
                  styleElement.id = styleId;
                  document.head.appendChild(styleElement);
                }

                styleElement.textContent = `
          :root {
            --safe-area-inset-top: ${statusBarHeight}px !important;
          }
        `;

                logger.debug(
                  'Status bar height initialized (unified):',
                  statusBarHeight,
                  'px'
                );
              }
            }
          }
        } catch (error) {
          logger.error('Unified viewport change handler error:', error);
        }
      }, 150);
    };

    // 初始化 Status Bar 高度
    initializeStatusBarHeight();

    // ✅ 關鍵改進：監聽原生注入事件，更新初始值（確保原生值優先）
    const handleNativeInsetsUpdate = event => {
      if (event.detail) {
        const { top } = event.detail;
        if (top > 0) {
          initialStatusBarHeight = top;
          isInitialized = true;
          lastKnownStatusBarHeight = top;
          logger.debug(
            'Status bar height updated from native event:',
            top,
            'px'
          );
        }
        // ✅ 關鍵：不修改 --safe-area-inset-bottom，由原生注入管理
        // bottom 值由原生注入，JavaScript 不應該覆蓋
      }
    };
    window.addEventListener('nativeInsetsUpdated', handleNativeInsetsUpdate);

    // 監聽視口變化（統一處理）
    if (window.visualViewport) {
      window.visualViewport.addEventListener(
        'resize',
        handleUnifiedViewportChange
      );
    }
    window.addEventListener('resize', handleUnifiedViewportChange);

    // ✅ 改進：初始檢查（延遲執行，給原生注入時間）
    setTimeout(handleUnifiedViewportChange, 500);

    return () => {
      if (viewportChangeTimeout) {
        clearTimeout(viewportChangeTimeout);
      }
      window.removeEventListener(
        'nativeInsetsUpdated',
        handleNativeInsetsUpdate
      );
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          'resize',
          handleUnifiedViewportChange
        );
      }
      window.removeEventListener('resize', handleUnifiedViewportChange);
    };
  }, []);

  // ✅ 原生應用鍵盤檢測邏輯 - 優先使用原生檢測，JavaScript 作為備用
  useEffect(() => {
    // 只在原生平台運行
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let keyboardHeight = 0;
    let isKeyboardVisible = false;
    let resizeTimeout = null;
    let lastWindowHeight = window.innerHeight;
    // eslint-disable-next-line no-unused-vars
    let lastViewportHeight =
      window.visualViewport?.height || window.innerHeight;
    let nativeDetectionActive = false;
    let lastNativeKeyboardState = null;

    // ✅ 改進：監聽原生檢測結果，標記原生檢測已激活
    const handleNativeKeyboardToggle = event => {
      if (event.detail) {
        nativeDetectionActive = true;
        isKeyboardVisible = event.detail.isVisible;
        keyboardHeight = event.detail.height || 0;

        // 只有在狀態真正改變時才更新（避免重複更新）
        const stateKey = `${isKeyboardVisible}-${keyboardHeight}`;
        if (stateKey !== lastNativeKeyboardState) {
          lastNativeKeyboardState = stateKey;
          // 原生檢測優先，直接使用原生結果
          updateKeyboardState(isKeyboardVisible, keyboardHeight);
        }
      }
    };
    window.addEventListener('keyboardToggle', handleNativeKeyboardToggle);

    const handleKeyboardDetection = () => {
      // ✅ 改進：如果原生檢測已激活，跳過 JavaScript 檢測（避免衝突）
      // 但保留作為備用機制（如果原生檢測失敗）
      if (nativeDetectionActive && lastNativeKeyboardState !== null) {
        // 原生檢測優先，但保留 JavaScript 檢測作為備用
        // 只在原生檢測明顯失敗時才使用（例如：原生檢測說鍵盤關閉，但視口明顯變小）
        return;
      }

      // 防抖處理，避免頻繁觸發
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(() => {
        try {
          const currentHeight = window.innerHeight;
          const screenHeight = window.screen.height;

          // 方法 1: 使用 visualViewport API（最準確，iOS 和 Android 都支援）
          if (window.visualViewport) {
            const viewport = window.visualViewport;
            const viewportHeight = viewport.height;
            const windowHeight = window.innerHeight;

            // 計算鍵盤高度
            const newKeyboardHeight = Math.max(
              0,
              windowHeight - viewportHeight
            );

            // ✅ 改進：降低閾值到 150px，更早檢測到鍵盤（避免短暫顯示）
            const newIsKeyboardVisible = newKeyboardHeight > 150;

            // ✅ 改進：使用更小的變化閾值（10px），更敏感
            if (
              newIsKeyboardVisible !== isKeyboardVisible ||
              Math.abs(newKeyboardHeight - keyboardHeight) > 10
            ) {
              isKeyboardVisible = newIsKeyboardVisible;
              keyboardHeight = newKeyboardHeight;

              updateKeyboardState(isKeyboardVisible, keyboardHeight);
            }

            lastViewportHeight = viewportHeight;
          } else {
            // 方法 2: 備用方案 - 使用視窗高度變化檢測
            const heightDiff = lastWindowHeight - currentHeight;

            // ✅ 改進：降低閾值到 150px，更快響應
            const newIsKeyboardVisible =
              heightDiff > 150 && currentHeight < screenHeight * 0.75;

            if (newIsKeyboardVisible !== isKeyboardVisible) {
              isKeyboardVisible = newIsKeyboardVisible;
              keyboardHeight = newIsKeyboardVisible ? heightDiff : 0;

              updateKeyboardState(isKeyboardVisible, keyboardHeight);
            }

            lastWindowHeight = currentHeight;
          }
        } catch (error) {
          logger.error('鍵盤檢測錯誤:', error);
        }
      }, 100); // ✅ 改進：減少防抖延遲到 100ms，更快響應
    };

    const updateKeyboardState = (isVisible, height) => {
      // 設置 CSS 變數
      document.documentElement.style.setProperty(
        '--keyboard-height',
        `${height}px`
      );
      document.documentElement.style.setProperty(
        '--is-keyboard-visible',
        isVisible ? '1' : '0'
      );

      // 設置 data 屬性，供 CSS 選擇器使用
      if (isVisible) {
        document.documentElement.setAttribute('data-keyboard-visible', 'true');
      } else {
        document.documentElement.removeAttribute('data-keyboard-visible');
      }

      // 觸發自定義事件（避免重複觸發）
      window.dispatchEvent(
        new CustomEvent('keyboardToggle', {
          detail: {
            isVisible: isVisible,
            height: height,
          },
        })
      );

      logger.debug('鍵盤狀態變化:', {
        isVisible: isVisible,
        height: height,
        platform: Capacitor.getPlatform(),
        source: nativeDetectionActive ? 'native' : 'javascript',
      });
    };

    // ✅ 改進：減少監聽器，避免與 Status Bar 檢測衝突
    // 只在 visualViewport 可用且原生檢測未激活時監聽（原生檢測優先）
    if (window.visualViewport && !nativeDetectionActive) {
      window.visualViewport.addEventListener('resize', handleKeyboardDetection);
    }

    // ✅ 改進：輸入框焦點處理 - 與輸入框滾動合併（不重複監聽 focusin）
    const handleInputFocus = () => {
      // 立即檢查鍵盤狀態（僅在原生檢測未激活時）
      if (!nativeDetectionActive) {
        handleKeyboardDetection();
        setTimeout(handleKeyboardDetection, 150);
      }
    };

    const handleInputBlur = () => {
      setTimeout(() => {
        if (!nativeDetectionActive) {
          handleKeyboardDetection();
        }
      }, 200);
    };

    // 監聽所有輸入元素的焦點事件（僅作為備用）
    document.addEventListener('focusin', handleInputFocus, true);
    document.addEventListener('focusout', handleInputBlur, true);

    // ✅ 改進：初始檢查（僅在原生檢測未激活時）
    setTimeout(() => {
      if (!nativeDetectionActive) {
        handleKeyboardDetection();
      }
    }, 100);

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      window.removeEventListener('keyboardToggle', handleNativeKeyboardToggle);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          'resize',
          handleKeyboardDetection
        );
      }
      document.removeEventListener('focusin', handleInputFocus, true);
      document.removeEventListener('focusout', handleInputBlur, true);
    };
  }, []);

  // ✅ 輸入框獲得焦點時自動滾動到可見區域
  // 確保輸入框在鍵盤彈出時可見，提升用戶體驗
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // 記錄上次滾動時間，避免頻繁滾動
    let lastScrollTime = 0;
    const SCROLL_COOLDOWN = 500; // 500ms 冷卻時間，避免頻繁滾動

    // 記錄正在滾動的輸入框，避免重複滾動
    let scrollingInput = null;

    const handleInputFocus = e => {
      try {
        const input = e.target;

        // 只處理 INPUT 和 TEXTAREA 元素
        if (input.tagName !== 'INPUT' && input.tagName !== 'TEXTAREA') {
          return;
        }

        // 檢查是否為隱藏或禁用的輸入框
        if (input.type === 'hidden' || input.disabled || input.readOnly) {
          return;
        }

        // 檢查冷卻時間，避免頻繁滾動
        const now = Date.now();
        if (
          now - lastScrollTime < SCROLL_COOLDOWN &&
          scrollingInput === input
        ) {
          return;
        }

        // ✅ 改進：等待原生檢測完成（400ms，給原生檢測足夠時間）
        setTimeout(() => {
          try {
            // 重新獲取鍵盤高度（鍵盤可能已經彈出）
            const currentKeyboardHeight =
              parseFloat(
                getComputedStyle(document.documentElement)
                  .getPropertyValue('--keyboard-height')
                  .replace('px', '')
              ) || 0;

            // 檢查輸入框是否已經在可見區域
            const rect = input.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // 計算可見區域（考慮鍵盤）
            const visibleArea =
              viewportHeight - Math.max(currentKeyboardHeight, 0);

            // 如果輸入框已經在可見區域內，不需要滾動
            // 留出一些邊距（20px）確保輸入框完全可見
            if (rect.top >= 20 && rect.bottom <= visibleArea - 20) {
              return;
            }

            // 標記正在滾動的輸入框
            scrollingInput = input;

            // 使用 scrollIntoView 確保輸入框可見
            // block: 'center' 讓輸入框在可見區域中央
            input.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest',
            });

            lastScrollTime = Date.now();

            // 清除滾動標記（延遲清除，避免立即重複）
            setTimeout(() => {
              scrollingInput = null;
            }, 1000);

            logger.debug('輸入框自動滾動:', {
              input: input.tagName,
              type: input.type || 'text',
              keyboardHeight: currentKeyboardHeight,
              position: { top: rect.top, bottom: rect.bottom, visibleArea },
            });
          } catch (error) {
            logger.error('輸入框滾動失敗:', error);
            scrollingInput = null;
          }
        }, 400); // ✅ 改進：增加到 400ms，確保原生檢測完成，確保鍵盤已彈出且原生檢測已完成
      } catch (error) {
        logger.error('輸入框焦點處理錯誤:', error);
      }
    };

    // 使用 capture phase 確保優先捕獲
    document.addEventListener('focusin', handleInputFocus, true);

    return () => {
      document.removeEventListener('focusin', handleInputFocus, true);
      scrollingInput = null;
    };
  }, []);
}
