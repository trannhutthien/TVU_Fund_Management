import React from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

/**
 * Button Component
 * 
 * Component button tái sử dụng với nhiều variants và sizes
 * Sử dụng design system từ _buttons.scss
 * 
 * @param {string} variant - Loại button: 'primary' | 'secondary' | 'ghost' | 'danger'
 * @param {string} size - Kích thước: 'sm' | 'md' | 'lg'
 * @param {boolean} disabled - Vô hiệu hóa button
 * @param {boolean} loading - Hiển thị loading state
 * @param {React.ReactNode} children - Nội dung button
 * @param {React.ReactNode} leftIcon - Icon bên trái
 * @param {React.ReactNode} rightIcon - Icon bên phải
 * @param {string} className - Custom class thêm vào
 * @param {function} onClick - Hàm xử lý click
 * @param {string} type - Type của button: 'button' | 'submit' | 'reset'
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  type = 'button',
  ...rest
}) => {
  // Tạo class names
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    loading && 'btn-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Xử lý click
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...rest}
    >
      {/* Loading spinner */}
      {loading && (
        <span className="btn-spinner" aria-hidden="true">
          <svg
            className="spinner"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
        </span>
      )}

      {/* Left icon */}
      {!loading && leftIcon && (
        <span className="btn-icon-left" aria-hidden="true">
          {leftIcon}
        </span>
      )}

      {/* Button text */}
      <span className="btn-text">{children}</span>

      {/* Right icon */}
      {!loading && rightIcon && (
        <span className="btn-icon-right" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  children: PropTypes.node.isRequired,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button;
