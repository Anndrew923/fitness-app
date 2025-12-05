import { Capacitor } from '@capacitor/core';
import logger from './logger';

/**
 * ✅ 計時器通知工具
 * 支援原生平台本地通知，Web 平台降級處理
 */
class TimerNotification {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.LocalNotifications = null;
    this.permissionGranted = false;
  }

  /**
   * 初始化通知系統
   */
  async initialize() {
    if (!this.isNative) {
      logger.info('📱 網頁版：通知功能將使用瀏覽器提示');
      return true;
    }

    try {
      // 動態導入，避免 Web 環境報錯
      const { LocalNotifications } = await import(
        '@capacitor/local-notifications'
      );
      this.LocalNotifications = LocalNotifications;
      logger.info('✅ 本地通知插件已載入');
      return true;
    } catch (error) {
      logger.error('❌ 載入通知插件失敗:', error);
      return false;
    }
  }

  /**
   * 請求通知權限
   */
  async requestPermissions() {
    if (!this.isNative) {
      // Web 版本：嘗試請求瀏覽器通知權限
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          this.permissionGranted = permission === 'granted';
          if (this.permissionGranted) {
            logger.info('✅ 瀏覽器通知權限已授予');
          } else {
            logger.warn('⚠️ 瀏覽器通知權限被拒絕');
          }
          return this.permissionGranted;
        } catch (error) {
          logger.error('❌ 請求瀏覽器通知權限失敗:', error);
          return false;
        }
      }
      return false;
    }

    if (!this.LocalNotifications) {
      await this.initialize();
    }

    if (!this.LocalNotifications) {
      return false;
    }

    try {
      const result = await this.LocalNotifications.requestPermissions();
      this.permissionGranted = result.display === 'granted';
      
      if (this.permissionGranted) {
        logger.info('✅ 本地通知權限已授予');
      } else {
        logger.warn('⚠️ 本地通知權限被拒絕');
      }
      
      return this.permissionGranted;
    } catch (error) {
      logger.error('❌ 請求本地通知權限失敗:', error);
      return false;
    }
  }

  /**
   * 發送計時器完成通知（原生平台）
   */
  async sendNativeNotification() {
    if (!this.isNative || !this.LocalNotifications) {
      return false;
    }

    if (!this.permissionGranted) {
      const granted = await this.requestPermissions();
      if (!granted) {
        logger.warn('⚠️ 通知權限未授予，無法發送通知');
        return false;
      }
    }

    try {
      await this.LocalNotifications.schedule({
        notifications: [
          {
            title: '休息結束！',
            body: '該開始下一組訓練囉 💪',
            id: Date.now(),
            sound: 'default', // 使用系統預設提示音
            vibrate: true, // 觸發震動
            priority: 'high',
            smallIcon: 'ic_notification', // Android 小圖標（可選）
            largeIcon: 'ic_launcher', // Android 大圖標（可選）
            channelId: 'timer-complete', // Android 通知頻道
          },
        ],
      });

      logger.info('✅ 本地通知已發送');
      return true;
    } catch (error) {
      logger.error('❌ 發送本地通知失敗:', error);
      return false;
    }
  }

  /**
   * 播放 Web 版提示音
   */
  playWebSound() {
    try {
      // 創建一個簡單的提示音（使用 Web Audio API）
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 設置音調（800Hz，類似提示音）
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      // 設置音量（漸入漸出）
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      // 播放 0.5 秒
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      logger.info('🔔 Web 版提示音已播放');
      return true;
    } catch (error) {
      logger.error('❌ 播放 Web 提示音失敗:', error);
      return false;
    }
  }

  /**
   * 顯示 Web 版瀏覽器通知
   */
  async showWebNotification() {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'default') {
      await this.requestPermissions();
    }

    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification('休息結束！', {
          body: '該開始下一組訓練囉 💪',
          icon: '/icon-192x192.png', // 可選：應用圖標
          badge: '/icon-192x192.png',
          tag: 'timer-complete',
          requireInteraction: false,
        });

        // 點擊通知時聚焦視窗
        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // 自動關閉（5 秒後）
        setTimeout(() => {
          notification.close();
        }, 5000);

        logger.info('✅ 瀏覽器通知已顯示');
        return true;
      } catch (error) {
        logger.error('❌ 顯示瀏覽器通知失敗:', error);
        return false;
      }
    }

    return false;
  }

  /**
   * 觸發計時器完成提醒（統一入口）
   */
  async notifyTimerComplete() {
    if (this.isNative) {
      // 原生平台：使用本地通知（含震動和系統音效）
      return await this.sendNativeNotification();
    } else {
      // Web 平台：降級處理
      const results = {
        sound: this.playWebSound(),
        notification: await this.showWebNotification(),
      };

      // 如果瀏覽器通知失敗，使用 alert 作為最後備選
      if (!results.notification) {
        setTimeout(() => {
          alert('⏰ 休息結束！\n該開始下一組訓練囉 💪');
        }, 100); // 延遲一點，讓音效先播放
      }

      return results.sound || results.notification;
    }
  }
}

export default new TimerNotification();

