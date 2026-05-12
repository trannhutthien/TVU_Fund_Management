import React from 'react';
import PropTypes from 'prop-types';
import logoImage from '@assets/images/logo.png';
import './Logo.scss';

/**
 * Logo Component
 * 
 * Component logo linh hoạt cho toàn bộ ứng dụng
 * Có thể hiển thị: full (logo + text), icon-only, text-only
 * Hỗ trợ nhiều kích thước, themes, và animations
 * 
 * @param {string} size - Kích thước: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 * @param {string} variant - Kiểu hiển thị: 'full' | 'icon-only' | 'text-only'
 * @param {string} imageVariant - Kiểu hình ảnh: 'circular' | 'rounded' | 'square'
 * @param {string} layout - Bố cục: 'horizontal' | 'vertical'
 * @param {string} theme - Theme màu: 'light' | 'dark' | 'primary'
 * @param {string} title - Tiêu đề (mặc định: "TVU Fund")
 * @param {string} subtitle - Phụ đề (mặc định: "Quản lý Quỹ & Tài chính")
 * @param {boolean} showSubtitle - Hiển thị subtitle
 * @param {string} imageSrc - Đường dẫn ảnh logo custom
 * @param {string} imageAlt - Alt text cho ảnh
 * @param {boolean} animated - Hiệu ứng fade in khi load
 * @param {boolean} pulse - Hiệu ứng pulse (loading state)
 * @param {boolean} spin - Hiệu ứng spin (loading state)
 * @param {boolean} clickable - Có thể click
 * @param {function} onClick - Callback khi click
 * @param {string} href - Link khi click (nếu dùng như link)
 * @param {string} className - Custom class
 */
const Logo = ({
  size = 'md',
  variant = 'full',
  imageVariant = 'circular',
  layout = 'horizontal',
  theme = 'light',
  title = 'TVU Fund',
  subtitle = 'Quản lý Quỹ & Tài chính',
  showSubtitle = true,
  imageSrc,
  imageAlt = 'Logo Trường Đại học Trà Vinh',
  animated = false,
  pulse = false,
  spin = false,
  clickable = false,
  onClick,
  href,
  className = '',
}) => {
  // Class names
  const logoClasses = [
    'logo',
    `logo-${size}`,
    `logo-${variant}`,
    `logo-${layout}`,
    `logo-${theme}`,
    animated && 'logo-animated',
    pulse && 'logo-pulse',
    spin && 'logo-spin',
    (clickable || onClick || href) && 'logo-clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const imageClasses = [
    'logo-image',
    `logo-image-${imageVariant}`,
  ]
    .filter(Boolean)
    .join(' ');

  // Handle click
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  // Render content
  const content = (
    <>
      {/* Logo Image */}
      {variant !== 'text-only' && (
        <img
          src={imageSrc || logoImage}
          alt={imageAlt}
          className={imageClasses}
        />
      )}

      {/* Logo Text */}
      {variant !== 'icon-only' && (
        <div className="logo-text">
          <h1 className="logo-title">{title}</h1>
          {showSubtitle && subtitle && (
            <p className="logo-subtitle">{subtitle}</p>
          )}
        </div>
      )}
    </>
  );

  // Render as link or div
  if (href) {
    return (
      <a href={href} className={logoClasses} onClick={handleClick}>
        {content}
      </a>
    );
  }

  return (
    <div className={logoClasses} onClick={handleClick}>
      {content}
    </div>
  );
};

Logo.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  variant: PropTypes.oneOf(['full', 'icon-only', 'text-only']),
  imageVariant: PropTypes.oneOf(['circular', 'rounded', 'square']),
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
  theme: PropTypes.oneOf(['light', 'dark', 'primary']),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  showSubtitle: PropTypes.bool,
  imageSrc: PropTypes.string,
  imageAlt: PropTypes.string,
  animated: PropTypes.bool,
  pulse: PropTypes.bool,
  spin: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  href: PropTypes.string,
  className: PropTypes.string,
};

export default Logo;
