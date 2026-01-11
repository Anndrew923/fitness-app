import PropTypes from 'prop-types';
import styles from './MagitekFrame.module.css';

/**
 * MagitekFrame - 魔導外殼容器 (V4.1 Final: 全域魔導架構搬家計畫)
 *
 * 四層物理隔離架構 (Four-Layer Strata)：
 * - Layer 1: #layer-master-bg (z: -100) - 唯一起點，星空背景
 * - Layer 2: #layer-scroll-content (z: 10) - 唯一滑動層，套用 overflow-y: auto; pointer-events: auto;
 * - Layer 3: #layer-terminal-frame (z: 500) - 固定的 9-slice 邊框，必加 pointer-events: none;
 * - Layer 4: #layer-hud-status (z: 1000) - 頂部 HUD 與頭像，必加 pointer-events: none;
 *
 * 目標：
 * - 徹底擊穿 390px 限制
 * - 邊框自動貼邊
 * - 內容獨立滑動
 * - 背景 100% 透視星空
 * - 頭像精準對位 HUD 圓形槽位
 */
function MagitekFrame({ children, className = '', extraChildren, avatarSection }) {
  return (
    <div id="layer-master-root" className={`${styles.container} ${className}`}>
      {/* Layer 1: 唯一起點 - 星空背景層 (z: -100) */}
      <div id="layer-master-bg" className={styles.layerBg}></div>
      
      {/* Layer 2: 唯一滑動層 (z: 10) - 套用 overflow-y: auto; pointer-events: auto; */}
      <div id="layer-scroll-content" className={styles.layerContent}>
        {children}
      </div>
      
      {/* Layer 3: 固定的 9-slice 邊框 (z: 500) - 必加 pointer-events: none; */}
      <div id="layer-terminal-frame"></div>
      
      {/* Layer 4: 頂部 HUD 與頭像 (z: 1000) - 必加 pointer-events: none; */}
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
