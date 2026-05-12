import React from 'react';
import PropTypes from 'prop-types';
import './StatCard.scss';

/**
 * StatCard Component
 * 
 * Card hiển thị thống kê với icon, title, và số liệu
 * Có hover effect, shadow, animation đẹp
 * 
 * @param {string} title - Tiêu đề nhỏ (VD: "Tổng Quỹ", "Sinh Viên")
 * @param {string|number} value - Số liệu hiển thị (VD: "1,234,567 đ", "150")
 * @param {React.ReactNode} icon - Icon component
 * @param {string} iconBgColor - Màu nền icon: 'blue' | 'purple' | 'yellow' | 'teal' | 'green' | 'red'
 * @param {string} trend - Xu hướng: 'up' | 'down' | 'neutral'
 * @param {string} trendValue - Giá trị xu hướng (VD: "+12.5%", "-3.2%")
 * @param {string} subtitle - Mô tả phụ (VD: "So với tháng trước")
 * @param {function} onClick - Hàm xử lý click
 * @param {string} className - Custom class
 * @param {boolean} loading - Loading state
 */
const StatCard = ({
  title,
  value,
  icon,
  iconBgColor = 'blue',
  trend,
  trendValue,
  subtitle,
  onClick,
  className = '',
  loading = false,
}) => {
  const cardClasses = [
    'stat-card',
    onClick && 'stat-card-clickable',
    loading && 'stat-card-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconClasses = `stat-card-icon stat-card-icon-${iconBgColor}`;

  const trendClasses = [
    'stat-card-trend',
    trend && `stat-card-trend-${trend}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Loading overlay */}
      {loading && (
        <div className="stat-card-loading-overlay">
          <div className="stat-card-spinner" />
        </div>
      )}

      {/* Icon */}
      <div className={iconClasses}>
        {icon}
      </div>

      {/* Content */}
      <div className="stat-card-content">
        {/* Title */}
        <div className="stat-card-title">{title}</div>

        {/* Value */}
        <div className="stat-card-value">{value}</div>

        {/* Trend & Subtitle */}
        {(trendValue || subtitle) && (
          <div className="stat-card-footer">
            {trendValue && (
              <span className={trendClasses}>
                {trend === 'up' && (
                  <svg className="stat-card-trend-icon" viewBox="0 0 12 12" fill="none">
                    <path d="M2 9L6 5L10 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {trend === 'down' && (
                  <svg className="stat-card-trend-icon" viewBox="0 0 12 12" fill="none">
                    <path d="M2 3L6 7L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {trendValue}
              </span>
            )}
            {subtitle && (
              <span className="stat-card-subtitle">{subtitle}</span>
            )}
          </div>
        )}
      </div>

      {/* Hover indicator */}
      {onClick && (
        <div className="stat-card-hover-indicator">
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M7 10L10 13L13 10M7 7L10 10L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  iconBgColor: PropTypes.oneOf(['blue', 'purple', 'yellow', 'teal', 'green', 'red']),
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  trendValue: PropTypes.string,
  subtitle: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
  loading: PropTypes.bool,
};

export default StatCard;
