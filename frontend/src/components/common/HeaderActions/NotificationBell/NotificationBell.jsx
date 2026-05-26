import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { HiBell, HiCheckCircle, HiXCircle } from 'react-icons/hi2';
import CloseButton from '@components/common/CloseButton/CloseButton';
import './NotificationBell.scss';

/**
 * NotificationBell Component
 * 
 * Component hiển thị icon chuông thông báo với badge số lượng
 * Click để mở dropdown danh sách thông báo
 * 
 * @param {array} notifications - Danh sách thông báo
 * @param {number} unreadCount - Số lượng thông báo chưa đọc
 * @param {function} onNotificationClick - Callback khi click vào 1 thông báo
 * @param {function} onMarkAllRead - Callback khi click "Đánh dấu tất cả đã đọc"
 * @param {function} onViewAll - Callback khi click "Xem tất cả"
 * @param {string} size - Kích thước: 'sm' | 'md' | 'lg'
 * @param {string} className - Custom class
 */
const NotificationBell = ({
  notifications = [],
  unreadCount = 0,
  onNotificationClick,
  onMarkAllRead,
  onViewAll,
  size = 'md',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Đóng dropdown khi nhấn ESC
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    if (onMarkAllRead) {
      onMarkAllRead();
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    }
    setIsOpen(false);
  };

  // Format thời gian
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000); // seconds

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    
    return time.toLocaleDateString('vi-VN');
  };

  // Icon theo loại thông báo
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <HiCheckCircle className="notification-icon notification-icon-success" />;
      case 'error':
        return <HiXCircle className="notification-icon notification-icon-error" />;
      default:
        return <HiBell className="notification-icon notification-icon-info" />;
    }
  };

  const bellClasses = [
    'notification-bell',
    `notification-bell-${size}`,
    isOpen && 'notification-bell-active',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="notification-bell-wrapper">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        className={bellClasses}
        onClick={toggleDropdown}
        aria-label="Thông báo"
        aria-expanded={isOpen}
      >
        <HiBell className="bell-icon" />
        
        {/* Badge số lượng */}
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div ref={dropdownRef} className="notification-dropdown">
          {/* Close Button */}
          <CloseButton
            onClick={() => setIsOpen(false)}
            variant="light"
            size="sm"
            position="top-right-inside"
          />
          
          {/* Header */}
          <div className="notification-header">
            <h3 className="notification-title">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={handleMarkAllRead}
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* List */}
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <HiBell className="empty-icon" />
                <p className="empty-text">Không có thông báo mới</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    !notification.isRead ? 'notification-item-unread' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon */}
                  <div className="notification-item-icon">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="notification-item-content">
                    <p className="notification-item-title">
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="notification-item-message">
                        {notification.message}
                      </p>
                    )}
                    <span className="notification-item-time">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>

                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <span className="unread-indicator" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="notification-footer">
              <button
                className="view-all-btn"
                onClick={handleViewAll}
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

NotificationBell.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string,
      type: PropTypes.oneOf(['info', 'success', 'error']),
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
      isRead: PropTypes.bool,
    })
  ),
  unreadCount: PropTypes.number,
  onNotificationClick: PropTypes.func,
  onMarkAllRead: PropTypes.func,
  onViewAll: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default NotificationBell;
