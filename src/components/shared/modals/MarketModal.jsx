import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { usePayCat } from '../../../hooks/usePayCat';
import logger from '../../../utils/logger';
import './MarketModal.css';

/**
 * Phase 1-6: Market Modal - Cyber Commercial Component
 * Three-column price comparison table with Elite License promotion
 */
const MarketModal = ({
  isOpen,
  onClose,
  userData,
  onPurchaseSuccess,
  requiredSeals = 0,
}) => {
  const { t } = useTranslation();
  const payCat = usePayCat(userData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      if (isOpen) {
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isEarlyAdopter = payCat.isEarlyAdopter();
  const currentBalance = payCat.checkSealBalance();

  // Package definitions
  const packages = [
    {
      id: 'single',
      name: t('market.singleKey', '單枚權限金鑰'),
      seals: 1,
      price: 1.99,
      currency: 'USD',
      features: [t('market.features.singleKey', '1 枚權限金鑰')],
      popular: false,
    },
    {
      id: 'triple',
      name: t('market.tripleKey', '三枚權限金鑰包'),
      seals: 3,
      price: 4.99,
      currency: 'USD',
      features: [
        t('market.features.tripleKey', '3 枚權限金鑰'),
        t('market.features.betterValue', '更超值'),
      ],
      popular: true,
    },
    {
      id: 'elite',
      name: t('market.eliteLicense', '菁英執照 (Elite License)'),
      seals: 5,
      price: 4.99,
      currency: 'USD',
      period: t('market.perMonth', '/月'),
      features: [
        t('market.features.monthlyKeys', '每月 5 枚權限金鑰'),
        t('market.features.godView', '上帝視角（入侵偵測）'),
        t('market.features.rivalTracking', '宿敵追蹤（鎖定目標）'),
      ],
      popular: false,
      maxEfficiency: true,
    },
  ];

  const handlePurchase = async packageId => {
    if (isProcessing) return;

    setIsProcessing(true);
    setSelectedPackage(packageId);

    try {
      // Early Adopter bypass - direct success
      if (isEarlyAdopter) {
        logger.info(
          `✅ [MarketModal] Early Adopter purchase bypass: ${packageId}`
        );
        setTimeout(() => {
          setIsProcessing(false);
          setSelectedPackage(null);
          if (onPurchaseSuccess) {
            onPurchaseSuccess({
              packageId,
              seals: packages.find(p => p.id === packageId)?.seals || 0,
              isEarlyAdopter: true,
            });
          }
          onClose();
        }, 500);
        return;
      }

      // Mock payment processing (Phase 1-6: Shadow Monetization)
      logger.info(`🔄 [MarketModal] Processing purchase: ${packageId}`);
      
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock success
      const purchasedPackage = packages.find(p => p.id === packageId);
      if (onPurchaseSuccess) {
        onPurchaseSuccess({
          packageId,
          seals: purchasedPackage?.seals || 0,
          price: purchasedPackage?.price || 0,
          isEarlyAdopter: false,
        });
      }

      logger.info(`✅ [MarketModal] Purchase successful: ${packageId}`);
      setIsProcessing(false);
      setSelectedPackage(null);
      onClose();
    } catch (error) {
      logger.error(`❌ [MarketModal] Purchase failed:`, error);
      setIsProcessing(false);
      setSelectedPackage(null);
    }
  };

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget && !isProcessing) {
      onClose();
    }
  };

  return createPortal(
    <div className="market-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="market-modal-content"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="market-modal-header">
          <h2 className="market-modal-title">
            {t('market.title', '權限金鑰商店')}
          </h2>
          <button
            className="market-modal-close"
            onClick={onClose}
            disabled={isProcessing}
          >
            ×
          </button>
        </div>

        {/* Early Adopter Badge */}
        {isEarlyAdopter && (
          <div className="market-early-adopter-badge">
            <span className="badge-icon">🔓</span>
            <span className="badge-text">
              {t('market.earlyAdopter', '測試者特權：權限全開')}
            </span>
          </div>
        )}

        {/* Current Balance */}
        <div className="market-balance-info">
          <span className="balance-label">
            {t('market.currentBalance', '當前權限金鑰餘額')}：
          </span>
          <span className="balance-value">{currentBalance}</span>
        </div>

        {/* Required Seals Info */}
        {requiredSeals > 0 && (
          <div className="market-required-info">
            <span className="required-label">
              {t('market.requiredSeals', '所需權限金鑰')}：
            </span>
            <span className="required-value">{requiredSeals}</span>
          </div>
        )}

        {/* Packages Grid */}
        <div className="market-packages-grid">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className={`market-package-card ${
                pkg.popular ? 'popular' : ''
              } ${pkg.maxEfficiency ? 'max-efficiency' : ''} ${
                selectedPackage === pkg.id && isProcessing ? 'processing' : ''
              }`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="package-badge popular-badge">
                  {t('market.popular', '熱門')}
                </div>
              )}

              {/* Max Efficiency Badge */}
              {pkg.maxEfficiency && (
                <div className="package-badge efficiency-badge">
                  {t('market.maxEfficiency', '最高效益')}
                </div>
              )}

              {/* Package Name */}
              <h3 className="package-name">{pkg.name}</h3>

              {/* Price */}
              <div className="package-price">
                <span className="price-amount">${pkg.price}</span>
                {pkg.period && (
                  <span className="price-period">{pkg.period}</span>
                )}
              </div>

              {/* Features */}
              <ul className="package-features">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Purchase Button */}
              <button
                className={`package-button ${
                  pkg.maxEfficiency ? 'button-elite' : ''
                } ${pkg.popular ? 'button-popular' : ''}`}
                onClick={() => handlePurchase(pkg.id)}
                disabled={isProcessing}
              >
                {isProcessing && selectedPackage === pkg.id
                  ? t('market.processing', '處理中...')
                  : isEarlyAdopter
                  ? t('market.activate', '啟動特權')
                  : t('market.purchase', '購買')}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Slogan */}
        <div className="market-footer-slogan">
          <p>{t('landing.cyberSlogan', '解除安全協定，釋放全部潛能。')}</p>
        </div>
      </div>
    </div>,
    document.body
  );
};

MarketModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired,
  onPurchaseSuccess: PropTypes.func,
  requiredSeals: PropTypes.number,
};

export default MarketModal;

