import PropTypes from 'prop-types';
import styles from './MagitekFrame.module.css';

/**
 * MagitekFrame - 魔導外殼容器
 *
 * 提供深邃虛空背景與魔力粒子 VFX 層的全螢幕容器
 * 作為所有頁面的父級容器，建立「魔導共鳴」視覺基調
 *
 * 全域透視：支援額外的子元素（如 BottomNavBar）直接作為 container 的子元素
 */
function MagitekFrame({ children, className = '', extraChildren }) {
  return (
    <div className={`${styles.container} ${className}`}>
      {/* ⚡ 紋理化效能超頻：星域圖層 - 以貼圖取代數學運算 */}
      <div className={styles.starLayer}></div>
      <div className={styles.content}>{children}</div>
      {/* 全域透視：額外子元素（如 BottomNavBar）直接作為 container 的子元素，確保 position: fixed 正常工作 */}
      {extraChildren}
    </div>
  );
}

MagitekFrame.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  extraChildren: PropTypes.node, // 全域透視：額外子元素（如 BottomNavBar）
};

export default MagitekFrame;
