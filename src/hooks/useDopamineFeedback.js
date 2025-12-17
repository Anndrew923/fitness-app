import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import logger from '../utils/logger';

/**
 * Custom hook for dopamine feedback (haptics)
 * Encapsulates haptics logic with Web fallback
 */
export const useDopamineFeedback = () => {
  const isNative = Capacitor.isNativePlatform();

  /**
   * Trigger impact feedback
   * @param {ImpactStyle} style - 'Light' | 'Medium' | 'Heavy'
   */
  const triggerImpact = useCallback(
    async (style = ImpactStyle.Medium) => {
      if (isNative) {
        try {
          await Haptics.impact({ style });
        } catch (error) {
          logger.warn('觸覺反饋失敗:', error);
        }
      } else {
        // Web fallback: visual feedback or silent
        logger.debug('Web 平台：觸覺反饋已跳過');
      }
    },
    [isNative]
  );

  /**
   * Trigger notification feedback
   * @param {NotificationType} type - 'Success' | 'Warning' | 'Error'
   */
  const triggerNotification = useCallback(
    async (type = NotificationType.Success) => {
      if (isNative) {
        try {
          await Haptics.notification({ type });
        } catch (error) {
          logger.warn('通知反饋失敗:', error);
        }
      } else {
        logger.debug('Web 平台：通知反饋已跳過');
      }
    },
    [isNative]
  );

  /**
   * Trigger vibration (for pull-to-refresh)
   */
  const triggerVibrate = useCallback(
    async (duration = 100) => {
      if (isNative) {
        try {
          await Haptics.vibrate({ duration });
        } catch (error) {
          logger.warn('震動失敗:', error);
        }
      }
    },
    [isNative]
  );

  /**
   * Trigger ranking up feedback (combination)
   */
  const triggerRankUp = useCallback(async () => {
    await triggerImpact(ImpactStyle.Heavy);
    await new Promise(resolve => setTimeout(resolve, 100));
    await triggerNotification(NotificationType.Success);
  }, [triggerImpact, triggerNotification]);

  return {
    triggerImpact,
    triggerNotification,
    triggerVibrate,
    triggerRankUp,
  };
};
