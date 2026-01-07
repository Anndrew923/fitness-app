import React from 'react';
import PropTypes from 'prop-types';
import styles from './RuneInput.module.css';

/**
 * RuneInput - 符文輸入框
 * 
 * 充滿魔力的輸入區域，Focus 時符文被點亮
 * 移除工業風，展現魔導共鳴風格
 */
function RuneInput({
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  minLength,
  onInvalid,
  onInput,
  className = '',
  fullWidth = true,
  ...props
}) {
  const fullWidthClass = fullWidth ? styles.fullWidth : '';
  
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      minLength={minLength}
      onInvalid={onInvalid}
      onInput={onInput}
      className={`${styles.input} ${fullWidthClass} ${className}`}
      {...props}
    />
  );
}

RuneInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  minLength: PropTypes.number,
  onInvalid: PropTypes.func,
  onInput: PropTypes.func,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
};

export default RuneInput;

