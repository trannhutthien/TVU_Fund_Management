import React from 'react';
import PropTypes from 'prop-types';
import './StatusBadge.scss';

/**
 * StatusBadge Component
 * 
 * Badge hiển thị trạng thái với màu sắc và icon
 * Có animation, hover effect, pulse effect
 * 
 * @param {string} status - Trạng thái: 'pending' | 'processing' | 'approved' | 'rejected' | 'completed' | 'cancelled'
 * @param {string} variant - Variant: 'success' | 'warning' | 'danger' | 'info' | 'default'
 * @param {string} label - Text hiển thị (nếu không dùng status)
 * @param {React.ReactNode} icon - Icon custom
 * @param {boolean} showIcon - Hiện icon mặc định
 * @param {boolean} pulse - Hiệu ứng pulse (cho pending)
 * @param {boolean} glow - Hiệu ứng glow
 * @param {boolean} outlined - Variant outlined (border, không fill)
 * @param {string} size - Kích thước: 'sm' | 'md' | 'lg'
 * @param {function} onClick - Callback khi click (badge sẽ clickable)
 * @param {string} className - Custom class
 */
const StatusBadge = ({
  status,
  variant,
  label,
  icon,
  showIcon = true,
  pulse = false,
  glow = false,
  outlined = false,
  size = 'md',
  onClick,
  className = '',
}) => {
  // Status config
  const statusConfig = {
    pending: {
      label: 'Chờ duyệt',
      variant: 'warning',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
      pulse: true,
    },
    processing: {
      label: 'Đang xử lý',
      variant: 'info',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
    },
    approved: {
      label: 'Đã duyệt',
      variant: 'success',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      glow: true,
    },
    rejected: {
      label: 'Từ chối',
      variant: 'danger',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    },
    completed: {
      label: 'Hoàn thành',
      variant: 'success',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    cancelled: {
      label: 'Đã hủy',
      variant: 'default',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
        </svg>
      ),
    },
  };

  // Determine config
  const config = status ? statusConfig[status] : null;
  const finalVariant = variant || config?.variant || 'default';
  const finalLabel = label || config?.label || status;
  const finalIcon = icon || (showIcon && config?.icon);
  const finalPulse = pulse || config?.pulse || false;
  const finalGlow = glow || config?.glow || false;

  // Class names
  const badgeClasses = [
    'status-badge',
    `status-badge-${finalVariant}`,
    `status-badge-${size}`,
    outlined && 'status-badge-outlined',
    finalPulse && 'status-badge-pulse',
    finalGlow && 'status-badge-glow',
    onClick && 'status-badge-clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={badgeClasses} onClick={onClick}>
      {finalIcon && <span className="status-badge-icon">{finalIcon}</span>}
      <span className="status-badge-label">{finalLabel}</span>
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['pending', 'processing', 'approved', 'rejected', 'completed', 'cancelled']),
  variant: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'default']),
  label: PropTypes.string,
  icon: PropTypes.node,
  showIcon: PropTypes.bool,
  pulse: PropTypes.bool,
  glow: PropTypes.bool,
  outlined: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default StatusBadge;
