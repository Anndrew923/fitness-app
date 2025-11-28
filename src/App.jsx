import React, { useState, Component, useEffect, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { UserProvider, useUser } from './UserContext';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import PropTypes from 'prop-types';
import ScrollToTop from './ScrollToTop';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import logger from './utils/logger';
const WelcomeSplash = React.lazy(() => import('./WelcomeSplash'));
const LandingPage = React.lazy(() => import('./LandingPage'));
const Welcome = React.lazy(() => import('./Welcome'));
const UserInfo = React.lazy(() => import('./UserInfo'));
const Strength = React.lazy(() => import('./Strength'));
const Cardio = React.lazy(() => import('./Cardio'));
const Power = React.lazy(() => import('./Power'));
const Muscle = React.lazy(() => import('./Muscle'));
const FFMI = React.lazy(() => import('./FFMI'));

const Login = React.lazy(() => import('./Login'));
const History = React.lazy(() => import('./History'));
const PrivacyPolicy = React.lazy(() => import('./PrivacyPolicy'));
const Terms = React.lazy(() => import('./Terms'));
const About = React.lazy(() => import('./About'));
const Features = React.lazy(() => import('./Features'));
const Disclaimer = React.lazy(() => import('./Disclaimer'));
const Contact = React.lazy(() => import('./Contact'));
import BottomNavBar from './components/BottomNavBar';
const Ladder = React.lazy(() => import('./components/Ladder'));
const Settings = React.lazy(() => import('./components/Settings'));
const TrainingTools = React.lazy(() => import('./components/TrainingTools'));
const Community = React.lazy(() => import('./components/Community'));
const FriendFeed = React.lazy(() => import('./components/FriendFeed'));
const Verification = React.lazy(() => import('./pages/Verification'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
import GlobalAdBanner from './components/GlobalAdBanner';
import LoadingSpinner from './components/LoadingSpinner';
import performanceMonitor from './utils/performanceMonitor';
import './App.css';
import { useTranslation, withTranslation } from 'react-i18next';

class RawErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary 捕獲錯誤:', error, errorInfo);

    // 記錄錯誤到性能監控
    if (performanceMonitor) {
      performanceMonitor.logError(error, 'ErrorBoundary');
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>
            🚨 {t('errorBoundary.title')}
          </h2>
          <p style={{ marginBottom: '20px', color: '#6c757d' }}>
            {t('errorBoundary.description')}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {t('errorBoundary.reload')}
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary>{t('errorBoundary.detailsDev')}</summary>
              <pre
                style={{
                  backgroundColor: '#f8f9fa',
                  padding: '10px',
                  borderRadius: '5px',
                  overflow: 'auto',
                  maxWidth: '100%',
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

RawErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  t: PropTypes.func.isRequired,
};

const ErrorBoundary = withTranslation()(RawErrorBoundary);

// 創建一個內部組件來使用 useNavigate
function AppContent() {
  const { t } = useTranslation();
  const [testData, setTestData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const showNavBar = [
    '/user-info',
    '/history',
    '/ladder',
    '/community',
    '/friend-feed',
    '/strength',
    '/explosive-power',
    '/cardio',
    '/muscle-mass',
    '/body-fat',
    '/settings',
    '/training-tools',
  ].some(path => location.pathname.startsWith(path));

  // 檢查是否需要為固定廣告預留空間
  const showFixedAd = [
    '/user-info',
    '/ladder',
    '/community',
    '/friend-feed',
    '/history',
    '/strength',
    '/cardio',
    '/explosive-power',
    '/muscle-mass',
    '/body-fat',
    '/settings',
    '/training-tools',
  ].some(path => location.pathname.startsWith(path));

  // AdMob 初始化（僅在 Android/iOS 平台）
  useEffect(() => {
    const initializeAdMob = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const { AdMob } = await import('@capacitor-community/admob');
          const isDevelopment = import.meta.env.MODE === 'development';
          const isTestMode = import.meta.env.VITE_ADMOB_TEST_MODE === 'true';

          await AdMob.initialize({
            requestTrackingAuthorization: true,
            // 注意：testingDevices 應為測試設備 ID 陣列，空陣列表示所有設備為測試設備
            // initializeForTesting 參數在 6.0.0 版本中可能不存在，已移除
          });

          logger.debug('✅ AdMob 初始化成功');
        } catch (error) {
          logger.error('❌ AdMob 初始化失敗:', error);
          // 不影響 App 啟動，只記錄錯誤
        }
      }
    };

    initializeAdMob();
  }, []);

  // 性能監控：監控頁面載入時間
  useEffect(() => {
    const pageName = location.pathname || '/';

    // 開始監控頁面載入
    performanceMonitor.startPageLoad(pageName);

    // 使用 setTimeout 來模擬頁面載入完成
    const timer = setTimeout(() => {
      performanceMonitor.measurePageLoad(pageName);
    }, 100); // 給組件一點時間來渲染

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // ✅ 改進：統一的事件管理器，避免 Status Bar 和鍵盤檢測衝突
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    // 統一的視口變化處理器
    let viewportChangeTimeout = null;
    let lastKnownStatusBarHeight = 0;
    let lastKnownViewportHeight = window.visualViewport?.height || window.innerHeight;
    let lastKnownWindowHeight = window.innerHeight;
    // ✅ 關鍵改進：記錄初始值（應用啟動時的 window.innerHeight）
    let initialWindowHeight = window.innerHeight;
    let initialScreenHeight = window.screen.height;
    let initialStatusBarHeight = 0;
    let isInitialized = false;
    
    // ✅ 初始化：在應用啟動時記錄初始 Status Bar 高度
    const initializeStatusBarHeight = () => {
      if (isInitialized) return;
      
      // 優先使用原生注入的值
      const nativeInjected = window.__nativeInsetsInjected;
      const existingTop = getComputedStyle(document.documentElement)
        .getPropertyValue('--safe-area-inset-top')
        .trim();
      
      if (nativeInjected && existingTop && existingTop !== '0px') {
        initialStatusBarHeight = parseFloat(existingTop.replace('px', '')) || 0;
        isInitialized = true;
        lastKnownStatusBarHeight = initialStatusBarHeight;
        return;
      }
      
      // 計算初始 Status Bar 高度（應用啟動時，鍵盤肯定未開啟）
      const initialHeightDiff = initialScreenHeight - initialWindowHeight;
      
      if (initialHeightDiff > 0 && initialHeightDiff <= 80) {
        initialStatusBarHeight = initialHeightDiff;
      } else {
        // 備用方案：檢測 Android 版本
        const userAgent = navigator.userAgent || '';
        const androidVersionMatch = userAgent.match(/Android\s([0-9\.]*)/);
        const androidVersion = androidVersionMatch ? parseFloat(androidVersionMatch[1]) : 0;
        
        if (androidVersion >= 15) {
          initialStatusBarHeight = 48;
        } else {
          initialStatusBarHeight = 24;
        }
      }
      
      isInitialized = true;
      lastKnownStatusBarHeight = initialStatusBarHeight;
      
      // 設置初始值
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
      
      logger.debug('Status bar height initialized:', initialStatusBarHeight, 'px');
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
          const nativeKeyboardVisible = getComputedStyle(document.documentElement)
            .getPropertyValue('--is-keyboard-visible') === '1';
          const nativeKeyboardHeight = parseFloat(
            getComputedStyle(document.documentElement)
              .getPropertyValue('--keyboard-height')
              .replace('px', '')
          ) || 0;
          
          // ✅ 改進：使用視口高度變化來輔助判斷鍵盤狀態（更準確）
          const currentViewportHeight = window.visualViewport?.height || window.innerHeight;
          const currentWindowHeight = window.innerHeight;
          const viewportHeightDiff = lastKnownViewportHeight - currentViewportHeight;
          const windowHeightDiff = lastKnownWindowHeight - currentWindowHeight;
          
          // ✅ 關鍵改進：使用初始值比較，更準確判斷鍵盤狀態
          const windowHeightDiffFromInitial = initialWindowHeight - currentWindowHeight;
          
          // 如果視口高度明顯減少（>150px），很可能鍵盤已開啟
          const likelyKeyboardOpen = viewportHeightDiff > 150 || 
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
          
          // 只有在鍵盤未開啟時，才更新 Status Bar
          // ✅ 優先檢查：是否已從原生注入（最準確的方法）
          const nativeInjected = window.__nativeInsetsInjected;
          const existingTop = getComputedStyle(document.documentElement)
            .getPropertyValue('--safe-area-inset-top')
            .trim();
          
          // 如果原生已注入且值有效，優先使用原生值
          if (nativeInjected && existingTop && existingTop !== '0px') {
            const parsedHeight = parseFloat(existingTop.replace('px', '')) || 0;
            if (parsedHeight > 0 && parsedHeight !== lastKnownStatusBarHeight) {
              lastKnownStatusBarHeight = parsedHeight;
              initialStatusBarHeight = parsedHeight;
              isInitialized = true;
            }
            return; // 不覆蓋原生注入的準確值
          }
          
          // ✅ 關鍵改進：使用初始值計算，而不是當前值（避免鍵盤影響）
          // 只有在鍵盤未開啟時，才使用當前值計算
          let statusBarHeight = initialStatusBarHeight || 0;
          
          // 如果還沒初始化，使用當前值計算（但必須確保鍵盤未開啟）
          if (!isInitialized || statusBarHeight === 0) {
            const screenHeight = window.screen.height;
            const windowHeight = window.innerHeight;
            const heightDiff = screenHeight - windowHeight;

            if (heightDiff > 0 && heightDiff <= 80) {
              statusBarHeight = heightDiff;
            } else {
              // 備用方案：檢測 Android 版本
              const userAgent = navigator.userAgent || '';
              const androidVersionMatch = userAgent.match(/Android\s([0-9\.]*)/);
              const androidVersion = androidVersionMatch ? parseFloat(androidVersionMatch[1]) : 0;
              
              if (androidVersion >= 15) {
                statusBarHeight = 48;
              } else {
                statusBarHeight = 24;
              }
            }
            
            // 更新初始值
            if (!isInitialized) {
              initialStatusBarHeight = statusBarHeight;
              isInitialized = true;
            }
          }

          // ✅ 改進：驗證檢測結果的合理性（靜默處理，不顯示警告）
          if (statusBarHeight > 0 && statusBarHeight < 20) {
            statusBarHeight = 24;
            if (!isInitialized) {
              initialStatusBarHeight = 24;
              isInitialized = true;
            }
          }

          // 只有在值改變時才更新（避免不必要的 DOM 操作）
          if (statusBarHeight > 0 && statusBarHeight !== lastKnownStatusBarHeight) {
            lastKnownStatusBarHeight = statusBarHeight;
            
            // 設置 CSS 變量
            document.documentElement.style.setProperty(
              '--safe-area-inset-top',
              `${statusBarHeight}px`
            );

            // 更新 :root 中的 CSS 變量定義
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
            
            logger.debug('Status bar height updated (unified):', statusBarHeight, 'px');
          }
        } catch (error) {
          logger.error('Unified viewport change handler error:', error);
        }
      }, 150);
    };
    
    // 初始化 Status Bar 高度
    initializeStatusBarHeight();
    
    // 監聽視口變化（統一處理）
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleUnifiedViewportChange);
    }
    window.addEventListener('resize', handleUnifiedViewportChange);
    
    // 初始檢查
    setTimeout(handleUnifiedViewportChange, 300);
    
    return () => {
      if (viewportChangeTimeout) {
        clearTimeout(viewportChangeTimeout);
      }
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleUnifiedViewportChange);
      }
      window.removeEventListener('resize', handleUnifiedViewportChange);
    };
  }, []);

  // ✅ 已移除：第二個 Status Bar 檢測 useEffect
  // 所有 Status Bar 檢測邏輯已統一由上面的統一事件管理器處理，避免重複檢測和衝突

  // ✅ 改進：原生應用鍵盤檢測邏輯 - 優先使用原生檢測，JavaScript 作為備用
  useEffect(() => {
    // 只在原生平台運行
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let keyboardHeight = 0;
    let isKeyboardVisible = false;
    let resizeTimeout = null;
    let lastWindowHeight = window.innerHeight;
    let lastViewportHeight = window.visualViewport?.height || window.innerHeight;
    let nativeDetectionActive = false;
    let lastNativeKeyboardState = null;

    // ✅ 改進：監聽原生檢測結果，標記原生檢測已激活
    const handleNativeKeyboardToggle = (event) => {
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
            const newKeyboardHeight = Math.max(0, windowHeight - viewportHeight);
            
            // ✅ 改進：降低閾值到 150px，更早檢測到鍵盤（避免短暫顯示）
            const newIsKeyboardVisible = newKeyboardHeight > 150;
            
            // ✅ 改進：使用更小的變化閾值（10px），更敏感
            if (newIsKeyboardVisible !== isKeyboardVisible || Math.abs(newKeyboardHeight - keyboardHeight) > 10) {
              isKeyboardVisible = newIsKeyboardVisible;
              keyboardHeight = newKeyboardHeight;
              
              updateKeyboardState(isKeyboardVisible, keyboardHeight);
            }
            
            lastViewportHeight = viewportHeight;
          } else {
            // 方法 2: 備用方案 - 使用視窗高度變化檢測
            const heightDiff = lastWindowHeight - currentHeight;
            
            // ✅ 改進：降低閾值到 150px，更快響應
            const newIsKeyboardVisible = heightDiff > 150 && currentHeight < screenHeight * 0.75;
            
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
      window.dispatchEvent(new CustomEvent('keyboardToggle', {
        detail: { 
          isVisible: isVisible, 
          height: height 
        }
      }));
      
      logger.debug('鍵盤狀態變化:', { 
        isVisible: isVisible, 
        height: height,
        platform: Capacitor.getPlatform(),
        source: nativeDetectionActive ? 'native' : 'javascript'
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
        window.visualViewport.removeEventListener('resize', handleKeyboardDetection);
      }
      document.removeEventListener('focusin', handleInputFocus, true);
      document.removeEventListener('focusout', handleInputBlur, true);
    };
  }, []);

  // ✅ 新增：輸入框獲得焦點時自動滾動到可見區域（方案 4）
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

    const handleInputFocus = (e) => {
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
        if (now - lastScrollTime < SCROLL_COOLDOWN && scrollingInput === input) {
          return;
        }
        
        // 獲取鍵盤高度
        const keyboardHeight = parseFloat(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--keyboard-height')
            .replace('px', '')
        ) || 0;
        
        // ✅ 改進：等待原生檢測完成（400ms，給原生檢測足夠時間）
        setTimeout(() => {
          try {
            // 重新獲取鍵盤高度（鍵盤可能已經彈出）
            const currentKeyboardHeight = parseFloat(
              getComputedStyle(document.documentElement)
                .getPropertyValue('--keyboard-height')
                .replace('px', '')
            ) || 0;
            
            // 檢查輸入框是否已經在可見區域
            const rect = input.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // 計算可見區域（考慮鍵盤）
            const visibleArea = viewportHeight - Math.max(currentKeyboardHeight, 0);
            
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
              inline: 'nearest'
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
              position: { top: rect.top, bottom: rect.bottom, visibleArea }
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

  // ✅ 預載入常用頁面（在空閒時間）
  useEffect(() => {
    const preloadPages = () => {
      // 檢查是否支援 requestIdleCallback
      if ('requestIdleCallback' in window) {
        requestIdleCallback(
          () => {
            // 預載入最常用的頁面
            Promise.all([
              import('./UserInfo'),
              import('./components/Ladder'),
              import('./components/Community'),
            ]).catch(error => {
              logger.debug('預載入頁面失敗:', error);
            });
          },
          { timeout: 2000 } // 最多等待 2 秒
        );
      } else {
        // 降級方案：使用 setTimeout
        setTimeout(() => {
          Promise.all([
            import('./UserInfo'),
            import('./components/Ladder'),
            import('./components/Community'),
          ]).catch(error => {
            logger.debug('預載入頁面失敗:', error);
          });
        }, 3000); // 3 秒後預載入
      }
    };

    // 只在用戶已登入時預載入
    if (auth.currentUser) {
      preloadPages();
    }
  }, []);

  // 處理 Android 返回按鈕
  useEffect(() => {
    const handleBackButton = () => {
      const currentPath = location.pathname;

      // 定義需要特殊處理的頁面（沒有底部導覽列的頁面）
      const pagesWithoutNavBar = [
        '/features',
        '/about',
        '/privacy-policy',
        '/terms',
        '/contact',
        '/disclaimer',
      ];

      if (pagesWithoutNavBar.includes(currentPath)) {
        // 這些頁面沒有導覽列，返回按鈕應該回到首頁
        logger.debug('🔙 返回按鈕：從', currentPath, '回到首頁');
        navigate('/landing');
        return true; // 阻止默認行為
      }

      // 其他頁面使用默認行為
      return false;
    };

    // 監聽返回按鈕事件
    CapacitorApp.addListener('backButton', handleBackButton);

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [location.pathname, navigate]);

  // 2025-08: V1 不再自動彈出隱私權政策彈窗（保留設定頁/專頁入口）

  const handleLogin = async (email, password) => {
    try {
      logger.debug('App.jsx: handleLogin 被調用', {
        email,
        password: password ? '***' : 'undefined',
      });

      // 檢查密碼是否提供
      if (!password || password.trim() === '') {
        throw new Error('密碼不能為空');
      }

      logger.debug('App.jsx: 開始 Firebase 認證');
      await signInWithEmailAndPassword(auth, email, password);

      logger.debug('App.jsx: Firebase 認證成功');

      // 登入成功後清除 guestMode 標記
      sessionStorage.removeItem('guestMode');
      setTestData(null);

      if (process.env.NODE_ENV === 'development') {
        logger.debug('登入成功, auth.currentUser:', auth.currentUser);
      }

      logger.debug('App.jsx: handleLogin 完成');
    } catch (error) {
      logger.error('App.jsx: 登入失敗:', error);
      // 不要拋出新的錯誤，讓調用者處理原始錯誤
      throw error;
    }
  };

  const handleLogout = () => {
    if (auth.currentUser) {
      signOut(auth)
        .then(() => {
          setTestData(null);
          if (process.env.NODE_ENV === 'development') {
            logger.debug('登出成功');
          }
        })
        .catch(error => {
          logger.error('登出失敗:', error);
        });
    }
  };

  const handleTestComplete = data => {
    setTestData(data);
    if (process.env.NODE_ENV === 'development') {
      logger.debug('測驗完成, testData:', data);
    }
  };

  const clearTestData = () => {
    setTestData(null);
    if (process.env.NODE_ENV === 'development') {
      logger.debug('測驗數據已清除');
    }
  };

  const handleGuestMode = () => {
    // 設置 guestMode 標記並導向 user-info
    sessionStorage.setItem('guestMode', 'true');
    window.location.href = '/user-info';
  };

  const ProtectedRoute = ({ element }) => {
    const { userData } = useUser();
    const currentPath = window.location.pathname;
    const isGuest =
      sessionStorage.getItem('guestMode') === 'true' && !auth.currentUser;

    // 先檢查訪客模式，如果符合，直接允許進入
    const guestAllowedPaths = [
      '/user-info',
      '/strength',
      '/cardio',
      '/explosive-power',
      '/muscle-mass',
      '/body-fat',
      '/settings', // 允許訪客進入設定頁面
    ];
    if (
      isGuest &&
      guestAllowedPaths.some(path => currentPath.startsWith(path))
    ) {
      return element;
    }

    // 再檢查登入狀態
    if (!auth.currentUser) {
      return <Navigate to="/login" />;
    }

    if (currentPath !== '/user-info' && currentPath !== '/login') {
      const isHeightValid =
        typeof userData?.height === 'number' && userData.height > 0;
      const isWeightValid =
        typeof userData?.weight === 'number' && userData.weight > 0;
      const isAgeValid = typeof userData?.age === 'number' && userData.age > 0;
      const isGenderValid =
        userData?.gender === 'male' || userData?.gender === 'female';

      if (!isHeightValid || !isWeightValid || !isAgeValid || !isGenderValid) {
        return <Navigate to="/user-info" />;
      }
    }

    return element;
  };

  ProtectedRoute.propTypes = {
    element: PropTypes.element.isRequired,
  };

  return (
    <div className={`app-container ${showFixedAd ? 'page-with-fixed-ad' : ''}`}>
      <ScrollToTop />
      <ErrorBoundary>
        {/* ✅ 優化：使用統一的載入組件 */}
        <Suspense
          fallback={
            <LoadingSpinner message={t('common.loading')} fullScreen={true} />
          }
        >
          <div className="main-content">
            <Routes>
              <Route path="/" element={<WelcomeSplash />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route
                path="/welcome"
                element={
                  auth.currentUser ? (
                    <Navigate to="/user-info" />
                  ) : (
                    <Welcome
                      onLogin={handleLogin}
                      onGuestMode={handleGuestMode}
                    />
                  )
                }
              />
              <Route
                path="/user-info"
                element={
                  <ProtectedRoute
                    element={
                      <UserInfo
                        testData={testData}
                        onLogout={handleLogout}
                        clearTestData={clearTestData}
                      />
                    }
                  />
                }
              />
              <Route
                path="/strength"
                element={
                  <ProtectedRoute
                    element={
                      <Strength
                        onComplete={handleTestComplete}
                        clearTestData={clearTestData}
                      />
                    }
                  />
                }
              />
              <Route
                path="/cardio"
                element={
                  <ProtectedRoute
                    element={
                      <Cardio
                        onComplete={handleTestComplete}
                        clearTestData={clearTestData}
                      />
                    }
                  />
                }
              />
              <Route
                path="/explosive-power"
                element={
                  <ProtectedRoute
                    element={
                      <Power
                        onComplete={handleTestComplete}
                        clearTestData={clearTestData}
                      />
                    }
                  />
                }
              />
              <Route
                path="/muscle-mass"
                element={
                  <ProtectedRoute
                    element={
                      <Muscle
                        onComplete={handleTestComplete}
                        clearTestData={clearTestData}
                      />
                    }
                  />
                }
              />
              <Route
                path="/body-fat"
                element={
                  <ProtectedRoute
                    element={
                      <FFMI
                        onComplete={handleTestComplete}
                        clearTestData={clearTestData}
                      />
                    }
                  />
                }
              />

              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route
                path="/history"
                element={<ProtectedRoute element={<History />} />}
              />
              <Route
                path="/ladder"
                element={<ProtectedRoute element={<Ladder />} />}
              />
              <Route
                path="/settings"
                element={<ProtectedRoute element={<Settings />} />}
              />
              <Route
                path="/community"
                element={<ProtectedRoute element={<Community />} />}
              />
              <Route
                path="/friend-feed/:userId"
                element={<ProtectedRoute element={<FriendFeed />} />}
              />

              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/contact" element={<Contact />} />
              <Route
                path="/verification"
                element={<ProtectedRoute element={<Verification />} />}
              />
              <Route
                path="/training-tools"
                element={<ProtectedRoute element={<TrainingTools />} />}
              />
              <Route
                path="/admin"
                element={<ProtectedRoute element={<AdminPanel />} />}
              />
              <Route path="*" element={<div>{t('common.notFound')}</div>} />
            </Routes>
          </div>
        </Suspense>
      </ErrorBoundary>

      {/* 在天梯頁面隱藏廣告，保持頁面乾淨 */}
      {location.pathname !== '/ladder' && <GlobalAdBanner />}
      {showNavBar && <BottomNavBar />}
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
