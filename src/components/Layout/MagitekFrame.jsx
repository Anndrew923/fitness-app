import React from 'react';
import PropTypes from 'prop-types';
import styles from './MagitekFrame.module.css';

/**
 * MagitekFrame - 魔導外殼容器 (V16.0: 固定觀測窗物理架構)
 *
 * ⚡ V6.23: 持久化佈局 - HUD 和背景位於路由器之上，不會在路由切換時重新掛載
 *
 * 五層物理隔離架構 (Five-Layer Strata)：
 * - Layer 1: #layer-master-bg (z: -100) - 唯一起點，星空背景
 * - Layer 2: #layer-scroll-content (z: 100) - 唯一滑動層，套用 overflow-y: auto; pointer-events: auto;
 * - Layer 3: #layer-terminal-frame (z: 500) - 固定的 9-slice 邊框，必加 pointer-events: none;
 * - Layer 4: #layer-glass-panel (z: 400) - 固定式魔導水晶托盤，毛玻璃效果，必加 pointer-events: none;
 * - Layer 5: #layer-hud-status (z: 5000) - 頂部 HUD 與頭像，必加 pointer-events: none;
 *
 * V16.0 目標：
 * - 固定式毛玻璃托盤（不隨滾動位移）
 * - 絕對領域保護（與邊框保持恆定距離）
 * - 大頭照組件級校準（不受父容器干擾）
 * - 消除黑色斷層（背景連貫）
 */
function MagitekFrame({ children, className = '', extraChildren, avatarSection }) {
  return (
    <div id="layer-master-root" className={`${styles.container} ${className}`}>
      {/* Layer 1: 唯一起點 - 星空背景層 (z: -100) */}
      <div id="layer-master-bg" className={styles.layerBg}></div>
      
      {/* Layer 2: 唯一滑動層 (z: 100) - 套用 overflow-y: auto; pointer-events: auto; */}
      <div id="layer-scroll-content" className={styles.layerContent}>
        {children}
      </div>
      
      {/* Layer 3: 固定的 9-slice 邊框 (z: 500) - 必加 pointer-events: none; */}
      <div id="layer-terminal-frame"></div>
      
      {/* Layer 4: 固定式魔導水晶托盤 (z: 400) - V16.0 新增 */}
      <div id="layer-glass-panel"></div>
      
      {/* Layer 5: 頂部 HUD 與頭像 (z: 5000) - 必加 pointer-events: none; */}
      <div id="layer-hud-status">
        {/* ⚡ V6.1: 響應式包裝器 - 百分比錨定策略 */}
        <div className={styles.hudWrapper}>
          {/* ⚡ V6.15: DOM 順序修正 - Avatar 先渲染，HUD Mask 後渲染，確保金屬邊框覆蓋在頭像之上 */}
          {avatarSection}
          <div className={styles.topStatusHud}>
            <span className={styles.systemReadyText}>SYSTEM: READY</span>
          </div>
        </div>
      </div>
      
      {/* 額外子元素（如 BottomNavBar）直接作為 container 的子元素 */}
      {extraChildren}
    </div>
  );
}

MagitekFrame.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  extraChildren: PropTypes.node,      // 額外子元素（如 BottomNavBar）
  avatarSection: PropTypes.node,      // 頭像組件
};

// ⚡ V6.23: 使用 React.memo 確保 HUD 和背景層在路由切換時不會重新掛載
// 只有當 props 真正改變時才會重新渲染
export default React.memo(MagitekFrame, (prevProps, nextProps) => {
  // 自定義比較函數：只有當關鍵 props 改變時才重新渲染
  // children 總是會改變（路由內容），但 HUD 和背景層應該保持穩定
  return (
    prevProps.className === nextProps.className &&
    prevProps.extraChildren === nextProps.extraChildren &&
    prevProps.avatarSection === nextProps.avatarSection
  );
});
