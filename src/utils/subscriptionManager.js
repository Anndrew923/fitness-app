import { Capacitor } from '@capacitor/core';
import logger from './logger';

/**
 * ✅ 訂閱系統管理器
 * 包含平台檢查，確保網頁版不會報錯
 */
class SubscriptionManager {
  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.isInitialized = false;
    this.Purchases = null;
  }

  /**
   * 檢查是否支援訂閱功能
   */
  isSupported() {
    if (!this.isNative) {
      logger.warn('⚠️ 訂閱功能僅在原生平台（Android/iOS）支援');
      return false;
    }
    return true;
  }

  /**
   * 初始化 RevenueCat
   * @param {string} apiKey - RevenueCat API Key
   */
  async initialize(apiKey) {
    if (!this.isSupported()) {
      logger.warn('網頁版不支援 RevenueCat，返回模擬訂閱狀態');
      return { success: false, isWeb: true };
    }

    try {
      // 動態導入 RevenueCat（避免網頁版報錯）
      const { Purchases } = await import('purchases-capacitor');
      this.Purchases = Purchases;

      await Purchases.configure({ apiKey });
      this.isInitialized = true;
      logger.debug('✅ RevenueCat 初始化成功');
      return { success: true };
    } catch (error) {
      logger.error('RevenueCat 初始化失敗:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 獲取訂閱狀態
   * @param {string} userId - 用戶 ID
   */
  async getSubscriptionStatus(userId) {
    if (!this.isSupported()) {
      // 網頁版：返回預設狀態
      return {
        isVip: false,
        expiryDate: null,
        platform: 'web',
      };
    }

    if (!this.isInitialized || !this.Purchases) {
      logger.warn('RevenueCat 未初始化');
      return { isVip: false, expiryDate: null };
    }

    try {
      const customerInfo = await this.Purchases.getCustomerInfo();
      const isVip = customerInfo.entitlements.active['premium'] !== undefined;
      const expiryDate = isVip
        ? customerInfo.entitlements.active['premium'].expirationDate
        : null;

      return {
        isVip,
        expiryDate: expiryDate ? new Date(expiryDate).getTime() : null,
        platform: 'native',
      };
    } catch (error) {
      logger.error('獲取訂閱狀態失敗:', error);
      return { isVip: false, expiryDate: null, error: error.message };
    }
  }

  /**
   * 購買訂閱
   */
  async purchaseSubscription(productId) {
    if (!this.isSupported()) {
      throw new Error('訂閱功能僅在原生平台支援');
    }

    if (!this.Purchases) {
      throw new Error('RevenueCat 未初始化');
    }

    try {
      const { customerInfo } = await this.Purchases.purchaseProduct({
        productId,
      });
      return {
        success: true,
        customerInfo,
      };
    } catch (error) {
      logger.error('購買訂閱失敗:', error);
      throw error;
    }
  }
}

export default new SubscriptionManager();
