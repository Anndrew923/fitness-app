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
   * Phase 1-6: 獲取訂閱狀態（支援新的 subscription 欄位結構）
   * 優先讀取 userData.subscription，若無則從 RevenueCat 獲取
   * 
   * @param {string} userId - 用戶 ID
   * @param {Object} userData - 用戶數據（可選，用於讀取 subscription 欄位）
   * @returns {Object} { isVip, expiryDate, platform, isEarlyAdopter, status }
   */
  async getSubscriptionStatus(userId, userData = null) {
    // Phase 1-6: 優先讀取 userData.subscription 欄位
    if (userData?.subscription && typeof userData.subscription === 'object') {
      const sub = userData.subscription;
      const isPro = sub.status === 'pro' || sub.isEarlyAdopter === true;
      logger.debug('[SubscriptionManager] 從 userData.subscription 讀取訂閱狀態', {
        status: sub.status,
        isEarlyAdopter: sub.isEarlyAdopter,
        isPro,
      });
      return {
        isVip: isPro,
        isPro: isPro,
        expiryDate: sub.expiryDate || null,
        platform: 'local',
        isEarlyAdopter: sub.isEarlyAdopter === true,
        status: sub.status || 'inactive',
      };
    }

    if (!this.isSupported()) {
      // 網頁版：返回預設狀態
      return {
        isVip: false,
        isPro: false,
        expiryDate: null,
        platform: 'web',
        isEarlyAdopter: false,
        status: 'inactive',
      };
    }

    if (!this.isInitialized || !this.Purchases) {
      logger.warn('RevenueCat 未初始化');
      return { 
        isVip: false, 
        isPro: false,
        expiryDate: null,
        isEarlyAdopter: false,
        status: 'inactive',
      };
    }

    try {
      const customerInfo = await this.Purchases.getCustomerInfo();
      const isVip = customerInfo.entitlements.active['premium'] !== undefined;
      const expiryDate = isVip
        ? customerInfo.entitlements.active['premium'].expirationDate
        : null;

      return {
        isVip,
        isPro: isVip,
        expiryDate: expiryDate ? new Date(expiryDate).getTime() : null,
        platform: 'native',
        isEarlyAdopter: false, // RevenueCat 不提供 Early Adopter 狀態
        status: isVip ? 'pro' : 'inactive',
      };
    } catch (error) {
      logger.error('獲取訂閱狀態失敗:', error);
      return { 
        isVip: false, 
        isPro: false,
        expiryDate: null, 
        error: error.message,
        isEarlyAdopter: false,
        status: 'inactive',
      };
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
