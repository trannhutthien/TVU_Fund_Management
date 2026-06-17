import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import NotificationBell from './NotificationBell';
import UserAvatar from './UserAvatar';
import CloseButton from '@components/common/CloseButton/CloseButton';
import './HeaderActions.scss';

/**
 * HeaderActions Component
 * 
 * Component nhóm các actions trong header khi user đã đăng nhập:
 * - NotificationBell: Thông báo
 * - UserAvatar: Avatar + dropdown menu
 * 
 * @param {object} user - Thông tin user đăng nhập
 * @param {array} notifications - Danh sách thông báo
 * @param {number} unreadCount - Số lượng thông báo chưa đọc
 * @param {function} onNotificationClick - Callback khi click notification
 * @param {function} onMarkAllRead - Callback khi mark all as read
 * @param {function} onViewAllNotifications - Callback khi view all notifications
 * @param {function} onUserAvatarClick - Callback khi click user avatar
 * @param {function} onLogout - Callback khi logout
 * @param {string} size - Kích thước: 'sm' | 'md' | 'lg'
 * @param {boolean} showNotifications - Hiển thị notification bell
 * @param {string} className - Custom class
 */
const HeaderActions = ({
  user,
  notifications = [],
  unreadCount = 0,
  onNotificationClick,
  onMarkAllRead,
  onViewAllNotifications,
  onUserAvatarClick,
  onLogout,
  size = 'md',
  showNotifications = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleUserAvatarClick = () => {
    if (onUserAvatarClick) {
      onUserAvatarClick();
    } else {
      setShowUserMenu(!showUserMenu);
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleProfileNavigation = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  const headerActionsClasses = [
    'header-actions',
    `header-actions-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={headerActionsClasses}>
      {/* Notification Bell */}
      {showNotifications && (
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          onNotificationClick={onNotificationClick}
          onMarkAllRead={onMarkAllRead}
          onViewAll={onViewAllNotifications}
          size={size}
        />
      )}

      {/* User Avatar */}
      <div className="user-avatar-wrapper">
        <UserAvatar
          src={user?.avatar}
          name={user?.name || user?.ho_ten}
          size={size}
          showStatus={user?.isOnline}
          status={user?.status || 'online'}
          onClick={handleUserAvatarClick}
        />

        {/* User Dropdown Menu */}
        {showUserMenu && (
          <div className="user-menu-dropdown">
            {/* Close Button */}
            <CloseButton
              onClick={() => setShowUserMenu(false)}
              variant="light"
              size="sm"
              position="top-right-inside"
            />
            
            <div className="user-menu-header">
              <div className="user-menu-avatar">
                <UserAvatar
                  src={user?.avatar}
                  name={user?.name || user?.ho_ten}
                  size="lg"
                />
              </div>
              <div className="user-menu-info">
                <p className="user-menu-name">{user?.name || user?.ho_ten}</p>
                <p className="user-menu-email">{user?.email}</p>
                {user?.role && (
                  <p className="user-menu-role">{user.role}</p>
                )}
              </div>
            </div>

            <div className="user-menu-divider" />

            <div className="user-menu-items">
              <button className="user-menu-item" onClick={handleProfileNavigation}>
                <span className="user-menu-item-icon">👤</span>
                <span className="user-menu-item-text">Hồ sơ cá nhân</span>
              </button>
              <button className="user-menu-item" onClick={handleProfileNavigation}>
                <span className="user-menu-item-icon">⚙️</span>
                <span className="user-menu-item-text">Cài đặt</span>
              </button>
            </div>

            <div className="user-menu-divider" />

            <div className="user-menu-footer">
              <button className="user-menu-logout" onClick={handleLogout}>
                <span className="user-menu-item-icon">🚪</span>
                <span className="user-menu-item-text">Đăng xuất</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

HeaderActions.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    ho_ten: PropTypes.string,
    email: PropTypes.string,
    avatar: PropTypes.string,
    role: PropTypes.string,
    isOnline: PropTypes.bool,
    status: PropTypes.oneOf(['online', 'offline', 'away', 'busy']),
  }),
  notifications: PropTypes.array,
  unreadCount: PropTypes.number,
  onNotificationClick: PropTypes.func,
  onMarkAllRead: PropTypes.func,
  onViewAllNotifications: PropTypes.func,
  onUserAvatarClick: PropTypes.func,
  onLogout: PropTypes.func,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showNotifications: PropTypes.bool,
  className: PropTypes.string,
};

export default HeaderActions;
