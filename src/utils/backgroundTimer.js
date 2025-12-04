import { Capacitor } from '@capacitor/core';
import logger from './logger';

/**
 * ✅ 背景計時器工具
 * 支援鎖屏後繼續計時，包含平台檢查避免 Netlify 網頁版報錯
 */
class BackgroundTimer {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.timerId = null;
    this.startTime = null;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.onTick = null;
  }

  /**
   * 檢查是否支援背景運行
   */
  isSupported() {
    if (!this.isNative) {
      logger.warn(
        '⚠️ 背景計時器僅在原生平台（Android/iOS）支援，網頁版將使用標準計時器'
      );
      return false;
    }
    return true;
  }

  /**
   * 啟動計時器
   * @param {Function} onTick - 每秒回調函數，接收 (elapsedSeconds) => void
   */
  start(onTick) {
    if (this.isRunning) {
      logger.warn('計時器已在運行中');
      return;
    }

    this.onTick = onTick;
    this.startTime = Date.now() - this.elapsedTime;
    this.isRunning = true;

    // 啟動計時器循環
    this.timerLoop();
  }

  /**
   * 計時器循環
   */
  timerLoop() {
    if (!this.isRunning) return;

    const now = Date.now();
    this.elapsedTime = Math.floor((now - this.startTime) / 1000);

    if (this.onTick) {
      this.onTick(this.elapsedTime);
    }

    // 繼續下一秒
    this.timerId = setTimeout(() => {
      this.timerLoop();
    }, 1000);
  }

  /**
   * 暫停計時器
   */
  pause() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * 停止計時器
   */
  stop() {
    this.pause();
    this.elapsedTime = 0;
    this.startTime = null;
  }

  /**
   * 獲取當前經過時間（秒）
   */
  getElapsedTime() {
    return this.elapsedTime;
  }
}

export default new BackgroundTimer();
