import React, { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import './Input.scss';

/**
 * Input Component
 * 
 * Input field với label floating, icon, validation states
 * Có animation đẹp, focus effect, error/success states
 * 
 * @param {string} label - Label của input (sẽ float lên khi focus)
 * @param {string} type - Loại input: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Giá trị input (controlled)
 * @param {function} onChange - Hàm xử lý thay đổi
 * @param {function} onBlur - Hàm xử lý blur
 * @param {function} onFocus - Hàm xử lý focus
 * @param {boolean} error - Có lỗi hay không
 * @param {string} errorMessage - Thông báo lỗi
 * @param {boolean} success - Thành công hay không
 * @param {string} successMessage - Thông báo thành công
 * @param {string} helperText - Text hướng dẫn
 * @param {boolean} disabled - Vô hiệu hóa input
 * @param {boolean} required - Bắt buộc nhập
 * @param {React.ReactNode} leftIcon - Icon bên trái
 * @param {React.ReactNode} rightIcon - Icon bên phải
 * @param {boolean} showPasswordToggle - Hiện nút toggle password (chỉ với type="password")
 * @param {number} maxLength - Độ dài tối đa
 * @param {boolean} showCounter - Hiện counter (với maxLength)
 * @param {string} size - Kích thước: 'sm' | 'md' | 'lg'
 * @param {string} className - Custom class
 */
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error = false,
  errorMessage,
  success = false,
  successMessage,
  helperText,
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  maxLength,
  showCounter = false,
  size = 'md',
  className = '',
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Xác định type hiển thị (cho password toggle)
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Xác định trạng thái
  const hasValue = value && value.toString().length > 0;
  const isFloating = isFocused || hasValue;

  // Class names
  const containerClasses = [
    'input-container',
    `input-${size}`,
    isFocused && 'input-focused',
    error && 'input-error',
    success && 'input-success',
    disabled && 'input-disabled',
    leftIcon && 'input-has-left-icon',
    (rightIcon || showPasswordToggle) && 'input-has-right-icon',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const labelClasses = [
    'input-label',
    isFloating && 'input-label-floating',
    required && 'input-label-required',
  ]
    .filter(Boolean)
    .join(' ');

  // Handlers
  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Character count
  const currentLength = value ? value.toString().length : 0;

  return (
    <div className={containerClasses}>
      {/* Input wrapper */}
      <div className="input-wrapper">
        {/* Left icon */}
        {leftIcon && (
          <span className="input-icon input-icon-left">
            {leftIcon}
          </span>
        )}

        {/* Input field */}
        <input
          ref={ref}
          type={inputType}
          className="input-field"
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={isFloating ? placeholder : ''}
          maxLength={maxLength}
          {...rest}
        />

        {/* Label (floating) */}
        {label && (
          <label className={labelClasses}>
            {label}
            {required && <span className="input-required-mark">*</span>}
          </label>
        )}

        {/* Right icon / Password toggle */}
        {(rightIcon || (type === 'password' && showPasswordToggle)) && (
          <span className="input-icon input-icon-right">
            {type === 'password' && showPasswordToggle ? (
              <button
                type="button"
                className="input-password-toggle"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
              >
                {showPassword ? (
                  // Eye slash icon (hide)
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  // Eye icon (show)
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            ) : (
              rightIcon
            )}
          </span>
        )}

        {/* Success icon */}
        {success && !error && (
          <span className="input-status-icon input-status-success">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </span>
        )}

        {/* Error icon */}
        {error && (
          <span className="input-status-icon input-status-error">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </span>
        )}

        {/* Focus border animation */}
        <span className="input-border" />
      </div>

      {/* Bottom section: messages & counter */}
      <div className="input-bottom">
        {/* Messages */}
        <div className="input-messages">
          {/* Error message */}
          {error && errorMessage && (
            <span className="input-message input-message-error">
              {errorMessage}
            </span>
          )}

          {/* Success message */}
          {success && !error && successMessage && (
            <span className="input-message input-message-success">
              {successMessage}
            </span>
          )}

          {/* Helper text */}
          {!error && !success && helperText && (
            <span className="input-message input-message-helper">
              {helperText}
            </span>
          )}
        </div>

        {/* Character counter */}
        {showCounter && maxLength && (
          <span className="input-counter">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url']),
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  error: PropTypes.bool,
  errorMessage: PropTypes.string,
  success: PropTypes.bool,
  successMessage: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  showPasswordToggle: PropTypes.bool,
  maxLength: PropTypes.number,
  showCounter: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Input;
