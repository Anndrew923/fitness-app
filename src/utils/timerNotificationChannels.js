import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import logger from './logger';

/**
 * 创建通知频道（Android 必需）
 */
export async function createNotificationChannels() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 计时完成通知频道
    await LocalNotifications.createChannel({
      id: 'timer-complete',
      name: '计时器完成',
      description: '计时器结束时的通知',
      importance: 5, // IMPORTANCE_HIGH
      sound: 'default',
      vibration: true,
    });

    // 前台服务通知频道
    await LocalNotifications.createChannel({
      id: 'timer-foreground',
      name: '计时器运行中',
      description: '显示计时器倒计时的持续通知',
      importance: 4, // IMPORTANCE_HIGH
      sound: null, // 不播放声音
      vibration: false,
    });

    logger.info('✅ 通知频道已创建');
  } catch (error) {
    logger.error('❌ 创建通知频道失败:', error);
  }
}

