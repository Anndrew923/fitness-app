import React from 'react';
import PropTypes from 'prop-types';
import styles from './MagitekFrame.module.css';

/**
 * MagitekFrame - 魔導外殼容器
 * 
 * 提供深邃虛空背景與魔力粒子 VFX 層的全螢幕容器
 * 作為所有頁面的父級容器，建立「魔導共鳴」視覺基調
 */
function MagitekFrame({ children, className = '' }) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

MagitekFrame.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default MagitekFrame;

