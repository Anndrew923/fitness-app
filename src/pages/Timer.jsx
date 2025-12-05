import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import backgroundTimer from '../utils/backgroundTimer';
import timerNotification from '../utils/timerNotification';
import timerForegroundService from '../utils/timerForegroundService';
import { createNotificationChannels } from '../utils/timerNotificationChannels';
import BottomNavBar from '../components/BottomNavBar';
import './Timer.css';

/**
 * 休息計時器頁面 V2.0 - 深色科技儀表板風格
 * 支援背景計時（原生平台）和標準計時（Web 平台）
 */
function Timer() {
  const { t } = useTranslation();

  // 計時器狀態
  const [initialSeconds, setInitialSeconds] = useState(0); // 初始設定的秒數
  const [remainingSeconds, setRemainingSeconds] = useState(0); // 剩餘秒數
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // 擴充時間選項（秒）
  const quickTimeButtons = [30, 60, 90, 120, 150, 180, 240, 300];

  /**
   * 熱力分級顏色函式
   * @param {number} seconds - 秒數
   * @returns {string} 對應的顏色代碼
   */
  const getColor = useCallback(seconds => {
    if (seconds < 90) {
      return '#00f260'; // 螢光綠
    } else if (seconds >= 90 && seconds <= 150) {
      return '#ffc837'; // 活力黃/橘
    } else {
      return '#ff0055'; // 警示紅
    }
  }, []);

  /**
   * 計算進度百分比
   */
  const progress = useMemo(() => {
    if (initialSeconds <= 0) return 0;
    return ((initialSeconds - remainingSeconds) / initialSeconds) * 100;
  }, [initialSeconds, remainingSeconds]);

  /**
   * 計算環形進度條的 stroke-dasharray 值
   */
  const circumference = useMemo(() => {
    const radius = 90; // SVG 圓的半徑
    return 2 * Math.PI * radius;
  }, []);

  const strokeDashoffset = useMemo(() => {
    return circumference - (progress / 100) * circumference;
  }, [circumference, progress]);

  /**
   * 格式化時間為 MM:SS
   */
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0'),
    };
  };

  const timeDisplay = formatTime(remainingSeconds);

  /**
   * 開始計時
   */
  const handleStart = useCallback(() => {
    if (initialSeconds <= 0) {
      return; // 如果沒有設定時間，不允許開始
    }

    // 如果不是從暫停狀態繼續，先停止並重置 backgroundTimer
    if (!isPaused) {
      backgroundTimer.stop();
      setRemainingSeconds(initialSeconds);
    }

    setIsRunning(true);
    setIsPaused(false);

    // ✅ 新增：启动前台服务（显示持续通知）
    if (Capacitor.isNativePlatform()) {
      timerForegroundService.start(initialSeconds, remaining => {
        setRemainingSeconds(remaining);
      });
    }

    // 使用 backgroundTimer 開始計時
    // 如果是從暫停繼續，backgroundTimer 會從之前的 elapsedTime 繼續
    // 如果是重新開始，backgroundTimer 會從 0 開始（因為我們調用了 stop）
    backgroundTimer.start(elapsedSeconds => {
      const newRemaining = Math.max(0, initialSeconds - elapsedSeconds);
      setRemainingSeconds(newRemaining);

      // ✅ 更新前台服务通知
      if (Capacitor.isNativePlatform()) {
        timerForegroundService.updateRemaining(newRemaining);
      }

      // 如果時間到了，自動停止並觸發通知
      if (newRemaining <= 0) {
        backgroundTimer.stop();
        setIsRunning(false);
        setIsPaused(false);
        setRemainingSeconds(0);

        // ✅ 停止前台服务
        if (Capacitor.isNativePlatform()) {
          timerForegroundService.stop();
        }

        // ✅ 觸發通知
        timerNotification.notifyTimerComplete().catch(error => {
          console.error('❌ 發送通知失敗:', error);
        });
      }
    });
  }, [initialSeconds, isPaused]);

  /**
   * 暫停計時
   */
  const handlePause = useCallback(() => {
    if (!isRunning) return;

    backgroundTimer.pause();
    setIsRunning(false);
    setIsPaused(true);

    // ✅ 新增：暂停时停止前台服务
    if (Capacitor.isNativePlatform()) {
      timerForegroundService.stop();
    }
  }, [isRunning]);

  /**
   * 重置計時
   */
  const handleReset = useCallback(() => {
    backgroundTimer.stop();
    setIsRunning(false);
    setIsPaused(false);
    // 重置為初始設定的時間
    setRemainingSeconds(initialSeconds);

    // ✅ 新增：重置时停止前台服务
    if (Capacitor.isNativePlatform()) {
      timerForegroundService.stop();
    }
  }, [initialSeconds]);

  /**
   * 設定快速時間
   */
  const handleSetQuickTime = useCallback(
    seconds => {
      // 如果正在運行，先停止
      if (isRunning) {
        backgroundTimer.stop();
        setIsRunning(false);
        setIsPaused(false);
      }

      setInitialSeconds(seconds);
      setRemainingSeconds(seconds);
    },
    [isRunning]
  );

  /**
   * 訂閱 backgroundTimer 的時間更新
   * 確保 UI 與後台計時器同步（Web 環境下的備用機制）
   */
  useEffect(() => {
    // 如果計時器正在運行，定期更新 UI
    // 這主要用於 Web 環境，因為 backgroundTimer 的 onTick 回調在 Web 環境下可能不夠準確
    if (isRunning) {
      const interval = setInterval(() => {
        const elapsed = backgroundTimer.getElapsedTime();
        const newRemaining = Math.max(0, initialSeconds - elapsed);
        setRemainingSeconds(newRemaining);

        // 如果時間到了，自動停止並觸發通知
        if (newRemaining <= 0) {
          backgroundTimer.stop();
          setIsRunning(false);
          setIsPaused(false);
          setRemainingSeconds(0);

          // ✅ 停止前台服务
          if (Capacitor.isNativePlatform()) {
            timerForegroundService.stop();
          }

          // ✅ 觸發通知
          timerNotification.notifyTimerComplete().catch(error => {
            console.error('❌ 發送通知失敗:', error);
          });
        } else {
          // ✅ 更新前台服务通知
          if (Capacitor.isNativePlatform()) {
            timerForegroundService.updateRemaining(newRemaining);
          }
        }
      }, 100); // 每 100ms 更新一次，確保 UI 流暢

      return () => clearInterval(interval);
    }
  }, [isRunning, initialSeconds]);

  /**
   * 請求通知權限並創建通知頻道（組件掛載時）
   */
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // 创建通知频道（Android 必需）
        await createNotificationChannels();
        // 请求通知权限
        await timerNotification.requestPermissions();
      } catch (error) {
        console.error('❌ 初始化通知失敗:', error);
      }
    };

    initializeNotifications();
  }, []);

  /**
   * 組件卸載時清理計時器
   */
  useEffect(() => {
    return () => {
      // 注意：不應該在卸載時自動停止計時器，因為用戶可能切換到其他頁面
      // 計時器應該在背景繼續運行（原生平台）
      // 但為了安全起見，我們可以選擇保留或停止
      // 這裡選擇保留，讓計時器在背景繼續運行
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          'radial-gradient(circle at center, #232526 0%, #414345 100%)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        color: '#ffffff',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          paddingBottom: '120px', // ✅ 预留空间：系统导航列(~40px) + 广告位(~60px) + 缓冲(20px)
          maxWidth: '600px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* 標題 */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '30px',
            marginTop: '20px',
          }}
        >
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: '0 0 8px 0',
              textShadow: '0 2px 10px rgba(0, 242, 96, 0.3)',
            }}
          >
            {t('tools.restTimer.title') || '休息計時器'}
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
            }}
          >
            {t('tools.restTimer.desc') || '精準控制組間休息時間，提升訓練效率'}
          </p>
        </div>

        {/* 倒數時間顯示 - 帶環形進度條 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '220px',
              height: '220px',
            }}
          >
            {/* 環形進度條 */}
            <svg
              style={{
                width: '100%',
                height: '100%',
                transform: 'rotate(-90deg)',
              }}
              viewBox="0 0 200 200"
            >
              <defs>
                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#00f260" />
                  <stop offset="50%" stopColor="#ffc837" />
                  <stop offset="100%" stopColor="#ff0055" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* 背景圓 */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
              />
              {/* 進度圓 */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                filter="url(#glow)"
                style={{
                  transition: 'stroke-dashoffset 0.3s ease',
                }}
              />
            </svg>

            {/* 時間數字 */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  lineHeight: '1.2',
                  fontFamily: 'monospace',
                  textShadow: '0 0 20px rgba(0, 242, 96, 0.5)',
                }}
              >
                <span>{timeDisplay.mins}</span>
                <span style={{ margin: '0 4px' }}>:</span>
                <span>{timeDisplay.secs}</span>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: '4px',
                }}
              >
                <span>分</span>
                <span style={{ margin: '0 4px' }}>/</span>
                <span>秒</span>
              </div>
            </div>
          </div>
        </div>

        {/* 常用時間按鈕 - Grid 排版 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '30px',
          }}
        >
          {quickTimeButtons.map(seconds => {
            const isSelected = initialSeconds === seconds;
            const heatColor = getColor(seconds);
            const displayText = `${seconds}s`;

            return (
              <button
                key={seconds}
                onClick={() => handleSetQuickTime(seconds)}
                disabled={isRunning}
                style={{
                  padding: '14px 8px',
                  borderRadius: '12px',
                  border: `2px solid ${heatColor}`,
                  background: isSelected ? heatColor : 'transparent',
                  color: isSelected ? '#ffffff' : heatColor,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isSelected
                    ? `0 0 20px ${heatColor}80, 0 4px 12px ${heatColor}40`
                    : 'none',
                  opacity: isRunning ? 0.5 : 1,
                  textShadow: isSelected
                    ? '0 0 8px rgba(0, 0, 0, 0.3)'
                    : 'none',
                }}
                onMouseEnter={e => {
                  if (!isRunning && !isSelected) {
                    e.currentTarget.style.background = `${heatColor}20`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${heatColor}40`;
                  }
                }}
                onMouseLeave={e => {
                  if (!isRunning && !isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {displayText}
              </button>
            );
          })}
        </div>

        {/* 控制按鈕 */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '20px',
          }}
        >
          {!isRunning && !isPaused && (
            <button
              onClick={handleStart}
              disabled={remainingSeconds <= 0}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                background:
                  remainingSeconds > 0
                    ? 'linear-gradient(135deg, #00f260 0%, #00c9ff 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: remainingSeconds > 0 ? 'pointer' : 'not-allowed',
                boxShadow:
                  remainingSeconds > 0
                    ? '0 4px 20px rgba(0, 242, 96, 0.4)'
                    : 'none',
                transition: 'all 0.3s ease',
                opacity: remainingSeconds > 0 ? 1 : 0.5,
              }}
              onMouseEnter={e => {
                if (remainingSeconds > 0) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 6px 25px rgba(0, 242, 96, 0.5)';
                }
              }}
              onMouseLeave={e => {
                if (remainingSeconds > 0) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 20px rgba(0, 242, 96, 0.4)';
                }
              }}
            >
              開始計時
            </button>
          )}

          {isRunning && (
            <button
              onClick={handlePause}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ffc837 0%, #ff9500 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(255, 200, 55, 0.4)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 6px 25px rgba(255, 200, 55, 0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 20px rgba(255, 200, 55, 0.4)';
              }}
            >
              暫停
            </button>
          )}

          {isPaused && (
            <>
              <button
                onClick={handleStart}
                style={{
                  padding: '16px 32px',
                  borderRadius: '12px',
                  background:
                    'linear-gradient(135deg, #00f260 0%, #00c9ff 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0, 242, 96, 0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 6px 25px rgba(0, 242, 96, 0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 20px rgba(0, 242, 96, 0.4)';
                }}
              >
                繼續
              </button>
              <button
                onClick={handleReset}
                style={{
                  padding: '16px 32px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                重置
              </button>
            </>
          )}

          {!isRunning && !isPaused && remainingSeconds > 0 && (
            <button
              onClick={handleReset}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              重置
            </button>
          )}
        </div>

        {/* 平台提示 */}
        {!backgroundTimer.isSupported() && (
          <div
            style={{
              textAlign: 'center',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              marginTop: '20px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              💡 網頁版提示：請保持視窗開啟以維持計時準確
            </p>
          </div>
        )}
      </div>

      <BottomNavBar />
    </div>
  );
}

export default Timer;
