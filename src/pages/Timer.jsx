import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import backgroundTimer from '../utils/backgroundTimer';
import BottomNavBar from '../components/BottomNavBar';
import './Timer.css';

/**
 * 休息計時器頁面
 * 支援背景計時（原生平台）和標準計時（Web 平台）
 */
function Timer() {
  const { t } = useTranslation();

  // 計時器狀態
  const [initialSeconds, setInitialSeconds] = useState(0); // 初始設定的秒數
  const [remainingSeconds, setRemainingSeconds] = useState(0); // 剩餘秒數
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // 常用時間按鈕（秒）
  const quickTimeButtons = [30, 60, 90, 120];

  /**
   * 格式化時間為 MM:SS
   */
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

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

    // 使用 backgroundTimer 開始計時
    // 如果是從暫停繼續，backgroundTimer 會從之前的 elapsedTime 繼續
    // 如果是重新開始，backgroundTimer 會從 0 開始（因為我們調用了 stop）
    backgroundTimer.start(elapsedSeconds => {
      const newRemaining = Math.max(0, initialSeconds - elapsedSeconds);
      setRemainingSeconds(newRemaining);

      // 如果時間到了，自動停止
      if (newRemaining <= 0) {
        backgroundTimer.stop();
        setIsRunning(false);
        setIsPaused(false);
        setRemainingSeconds(0);
        // 可以添加提示音或震動（原生平台）
        if (window.Capacitor?.isNativePlatform()) {
          // 未來可以添加震動或提示音
          console.log('⏰ 計時結束');
        }
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

        // 如果時間到了，自動停止
        if (newRemaining <= 0) {
          backgroundTimer.stop();
          setIsRunning(false);
          setIsPaused(false);
          setRemainingSeconds(0);
        }
      }, 100); // 每 100ms 更新一次，確保 UI 流暢

      return () => clearInterval(interval);
    }
  }, [isRunning, initialSeconds]);

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
    <div className="timer-page">
      <div className="timer-container">
        {/* 標題 */}
        <div className="timer-header">
          <h1 className="timer-title">
            {t('tools.restTimer.title') || '休息計時器'}
          </h1>
          <p className="timer-subtitle">
            {t('tools.restTimer.desc') || '精準控制組間休息時間，提升訓練效率'}
          </p>
        </div>

        {/* 倒數時間顯示 */}
        <div className="timer-display">
          <div className="timer-time">{formatTime(remainingSeconds)}</div>
          {remainingSeconds === 0 && initialSeconds === 0 && (
            <p className="timer-hint">
              {t('timer.selectTime') || '請選擇休息時間'}
            </p>
          )}
        </div>

        {/* 常用時間按鈕 */}
        <div className="timer-quick-buttons">
          {quickTimeButtons.map(seconds => (
            <button
              key={seconds}
              className="timer-quick-btn"
              onClick={() => handleSetQuickTime(seconds)}
              disabled={isRunning}
            >
              {seconds}s
            </button>
          ))}
        </div>

        {/* 控制按鈕 */}
        <div className="timer-controls">
          {!isRunning && !isPaused && (
            <button
              className="timer-control-btn timer-start-btn"
              onClick={handleStart}
              disabled={remainingSeconds <= 0}
            >
              {t('timer.start') || '開始'}
            </button>
          )}

          {isRunning && (
            <button
              className="timer-control-btn timer-pause-btn"
              onClick={handlePause}
            >
              {t('timer.pause') || '暫停'}
            </button>
          )}

          {isPaused && (
            <>
              <button
                className="timer-control-btn timer-resume-btn"
                onClick={handleStart}
              >
                {t('timer.resume') || '繼續'}
              </button>
              <button
                className="timer-control-btn timer-reset-btn"
                onClick={handleReset}
              >
                {t('timer.reset') || '重置'}
              </button>
            </>
          )}

          {!isRunning && !isPaused && remainingSeconds > 0 && (
            <button
              className="timer-control-btn timer-reset-btn"
              onClick={handleReset}
            >
              {t('timer.reset') || '重置'}
            </button>
          )}
        </div>

        {/* 平台提示 */}
        {!backgroundTimer.isSupported() && (
          <div className="timer-platform-hint">
            <p>
              {t('timer.webHint') || '網頁版：切換分頁或鎖屏時計時可能暫停'}
            </p>
          </div>
        )}
      </div>

      <BottomNavBar />
    </div>
  );
}

export default Timer;
