import React from 'react';
import PropTypes from 'prop-types';
import styles from './MagitekButton.module.css';

/**
 * MagitekButton - 魔導能量按鈕
 * 
 * 水晶碎片視覺，魔導金橘色能量
 * 替換舊的青綠色按鈕，展現魔導共鳴風格
 */
function MagitekButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  fullWidth = false,
  size = 'medium',
  className = '',
  ...props
}) {
  const sizeClass = size === 'small' ? styles.small : size === 'large' ? styles.large : '';
  const fullWidthClass = fullWidth ? styles.fullWidth : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${sizeClass} ${fullWidthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

MagitekButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
};

export default MagitekButton;

