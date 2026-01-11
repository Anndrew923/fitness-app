import PropTypes from 'prop-types';
import styles from './MagitekFrame.module.css';

/**
 * MagitekFrame - 魔導外殼容器 (V16.0: 固定觀測窗物理架構)
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
        {/* 頭像移入此層，精準對位 HUD 圓形槽位 */}
        {avatarSection}
        <div className={styles.topStatusHud}></div>
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

export default MagitekFrame;
