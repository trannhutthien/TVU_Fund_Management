import PropTypes from 'prop-types';
import { HiXMark } from 'react-icons/hi2';
import './CloseButton.scss';

/**
 * CloseButton Component
 * 
 * Nút đóng/thoát tái sử dụng được
 * Dùng icon X từ react-icons
 * 
 * @param {function} onClick - Hàm xử lý khi click (required)
 * @param {string} variant - Kiểu nút: 'default' | 'dark' | 'light' | 'floating'
 * @param {string} size - Kích thước: 'sm' | 'md' | 'lg'
 * @param {string} position - Vị trí: 'top-right' | 'top-right-inside' | 'top-left' | 'static'
 * @param {string} className - Custom class (optional)
 * @param {string} ariaLabel - Accessibility label (optional)
 */
const CloseButton = ({
  onClick,
  variant = 'default',
  size = 'md',
  position = 'static',
  className = '',
  ariaLabel = 'Đóng'
}) => {
  const buttonClasses = [
    'close-button',
    `close-button-${variant}`,
    `close-button-${size}`,
    `close-button-${position}`,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <HiXMark className="close-button-icon" />
    </button>
  );
};

CloseButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'dark', 'light', 'floating']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  position: PropTypes.oneOf(['top-right', 'top-right-inside', 'top-left', 'static']),
  className: PropTypes.string,
  ariaLabel: PropTypes.string
};

export default CloseButton;
