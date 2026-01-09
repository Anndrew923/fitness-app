import PropTypes from 'prop-types';
import styles from './MagitekFrame.module.css';

/**
 * MagitekFrame - 魔導外殼容器 (V4.1: 物理層級清場)
 *
 * 物理四層容器結構（絕對 ID 導向）：
 * - #layer-master-root: 根容器
 * - #layer-master-bg: 唯一星空背景層 (z: -100)
 * - #layer-terminal-frame: 藍色發光 9-slice 邊框 (z: 500)
 * - #layer-scroll-content: 唯一捲動層 (z: 10)
 * - #layer-hud-status: 頂部狀態列與頭像 (z: 1000)
 *
 * 全域透視：支援額外的子元素（如 BottomNavBar）直接作為 container 的子元素
 */
function MagitekFrame({ children, className = '', extraChildren, avatarSection }) {
  return (
    <div id="layer-master-root" className={`${styles.container} ${className}`}>
      {/* Layer 1: 唯一星空背景層 (z: -100) */}
      <div id="layer-master-bg" className={styles.layerBg}></div>
      
      {/* Layer 2: 藍色發光 9-slice 邊框 (z: 500) */}
      <div id="layer-terminal-frame"></div>
      
      {/* Layer 3: 唯一捲動層 (z: 10) */}
      <div id="layer-scroll-content" className={styles.layerContent}>
        {children}
      </div>
      
      {/* Layer 4: 頂部狀態列與頭像 (z: 1000) */}
      <div id="layer-hud-status">
        {avatarSection}
        <div className={styles.topStatusHud}></div>
      </div>
      
      {/* 全域透視：額外子元素（如 BottomNavBar）直接作為 container 的子元素，確保 position: fixed 正常工作 */}
      {extraChildren}
    </div>
  );
}

MagitekFrame.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  extraChildren: PropTypes.node, // 全域透視：額外子元素（如 BottomNavBar）
  avatarSection: PropTypes.node, // ⚡ 2. 大頭照「越獄」行動：頭像組件
};

export default MagitekFrame;
