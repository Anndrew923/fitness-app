import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import logger from './logger';

/**
 * ✅ 计时器前台服务
 * 在用户切换App时，通过持续通知显示倒计时
 */
class TimerForegroundService {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.notificationId = 'timer-foreground-service';
    this.updateInterval = null;
    this.currentRemaining = 0;
    this.initialSeconds = 0;
  }

  /**
   * 启动前台服务（显示持续通知）
   */
  async start(initialSeconds, onTick) {
    if (!this.isNative) {
      return false;
    }

    this.initialSeconds = initialSeconds;
    this.currentRemaining = initialSeconds;

    // 立即显示通知
    await this.updateNotification();

    // 每秒更新通知
    this.updateInterval = setInterval(async () => {
      if (this.currentRemaining > 0) {
        this.currentRemaining--;
        await this.updateNotification();
        
        if (onTick) {
          onTick(this.currentRemaining);
        }
      } else {
        // 时间到，停止服务
        await this.stop();
      }
    }, 1000);

    logger.info('✅ 前台服务已启动');
    return true;
  }

  /**
   * 更新通知内容
   */
  async updateNotification() {
    if (!this.isNative) return;

    const mins = Math.floor(this.currentRemaining / 60);
    const secs = this.currentRemaining % 60;
    const timeText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: this.notificationId,
            title: '休息計時中',
            body: `剩餘時間: ${timeText}`,
            ongoing: true, // ✅ 关键：设置为持续通知
            sticky: true, // 不可滑动清除
            priority: 'high',
            channelId: 'timer-foreground',
            smallIcon: 'ic_notification',
            largeIcon: 'ic_launcher',
          },
        ],
      });
    } catch (error) {
      logger.error('❌ 更新通知失败:', error);
    }
  }

  /**
   * 更新剩余时间（从外部调用）
   */
  updateRemaining(remaining) {
    this.currentRemaining = remaining;
  }

  /**
   * 停止前台服务
   */
  async stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.isNative) {
      try {
        await LocalNotifications.cancel({
          notifications: [{ id: this.notificationId }],
        });
      } catch (error) {
        logger.error('❌ 取消通知失败:', error);
      }
    }

    logger.info('✅ 前台服务已停止');
  }
}

export default new TimerForegroundService();

