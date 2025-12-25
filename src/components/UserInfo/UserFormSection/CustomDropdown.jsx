import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './CustomDropdown.css';

const CustomDropdown = ({
  name,
  value,
  options,
  placeholder,
  onChange,
  className = '',
  disabled = false,
  onOpenChange,
  getDisplayText: customGetDisplayText, // 可选的显示文本函数
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 通知父组件打开/关闭状态
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  // 處理點擊外部關閉
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // 處理選項選擇
  const handleSelect = selectedValue => {
    // 創建合成事件以匹配原生 select 的行為
    const syntheticEvent = {
      target: {
        name: name,
        value: selectedValue,
      },
    };
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  // 獲取顯示文本
  const getDisplayText = () => {
    if (!value) return placeholder || '請選擇';

    // 如果提供了自定义显示函数，使用它
    if (customGetDisplayText) {
      return customGetDisplayText(value);
    }

    // 處理簡單選項（字符串數組）
    if (Array.isArray(options) && options.length > 0) {
      if (typeof options[0] === 'string') {
        return value;
      }
      // 處理對象數組 {value, label}
      const option = options.find(opt => opt.value === value);
      return option ? option.label : value;
    }

    // 處理 optgroup 結構
    if (Array.isArray(options) && options.length > 0 && options[0].group) {
      for (const group of options) {
        const option = group.options.find(opt => opt.value === value);
        if (option) return option.label;
      }
    }

    return value;
  };

  // 渲染選項
  const renderOptions = () => {
    if (!Array.isArray(options) || options.length === 0) {
      return (
        <li className="custom-dropdown-option custom-dropdown-option--empty">
          無可用選項
        </li>
      );
    }

    // 簡單字符串數組
    if (typeof options[0] === 'string') {
      return options.map((option, index) => (
        <li
          key={index}
          className={`custom-dropdown-option ${
            value === option ? 'custom-dropdown-option--selected' : ''
          }`}
          onClick={() => handleSelect(option)}
        >
          {option}
        </li>
      ));
    }

    // 對象數組 {value, label}
    if (options[0].value !== undefined) {
      return options.map((option, index) => (
        <li
          key={option.value || index}
          className={`custom-dropdown-option ${
            value === option.value ? 'custom-dropdown-option--selected' : ''
          }`}
          onClick={() => handleSelect(option.value)}
        >
          {option.label}
        </li>
      ));
    }

    // Optgroup 結構 {group: string, options: Array}
    if (options[0].group) {
      return options.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          {group.group && (
            <li className="custom-dropdown-optgroup-label">{group.group}</li>
          )}
          {group.options.map((option, optionIndex) => (
            <li
              key={option.value || `${groupIndex}-${optionIndex}`}
              className={`custom-dropdown-option ${
                value === option.value ? 'custom-dropdown-option--selected' : ''
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </li>
          ))}
        </React.Fragment>
      ));
    }

    return null;
  };

  return (
    <div
      ref={dropdownRef}
      className={`custom-dropdown ${className} ${
        isOpen ? 'custom-dropdown--open' : ''
      } ${disabled ? 'custom-dropdown--disabled' : ''}`}
    >
      <div
        className="custom-dropdown-trigger form-input"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        <span className="custom-dropdown-value">{getDisplayText()}</span>
        <span className="custom-dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <ul className="custom-dropdown-list" role="listbox">
          {placeholder && !value && (
            <li
              className="custom-dropdown-option custom-dropdown-option--placeholder"
              onClick={() => handleSelect('')}
            >
              {placeholder}
            </li>
          )}
          {renderOptions()}
        </ul>
      )}
    </div>
  );
};

CustomDropdown.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  options: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      })
    ),
    PropTypes.arrayOf(
      PropTypes.shape({
        group: PropTypes.string,
        options: PropTypes.arrayOf(
          PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
          })
        ),
      })
    ),
  ]).isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onOpenChange: PropTypes.func,
  getDisplayText: PropTypes.func, // 可选的显示文本函数
};

export default CustomDropdown;
