import PropTypes from 'prop-types';
import { HiUser } from 'react-icons/hi2';
import './UserAvatar.scss';

/**
 * UserAvatar Component
 * 
 * Component hiển thị avatar của user khi đăng nhập
 * Hỗ trợ: ảnh avatar, chữ cái đầu, icon default
 * 
 * @param {string} src - URL ảnh avatar
 * @param {string} name - Tên user (để lấy chữ cái đầu)
 * @param {string} size - Kích thước: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} status - Trạng thái online: 'online' | 'offline' | 'away' | 'busy'
 * @param {boolean} showStatus - Hiển thị status indicator
 * @param {string} shape - Hình dạng: 'circle' | 'rounded' | 'square'
 * @param {function} onClick - Callback khi click
 * @param {string} className - Custom class
 */
const UserAvatar = ({
  src,
  name,
  size = 'md',
  status,
  showStatus = false,
  shape = 'circle',
  onClick,
  className = '',
}) => {
  // Lấy chữ cái đầu từ tên
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    // Lấy chữ cái đầu của tên đầu và tên cuối
    const firstInitial = names[0].charAt(0).toUpperCase();
    const lastInitial = names[names.length - 1].charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  // Class names
  const avatarClasses = [
    'user-avatar',
    `user-avatar-${size}`,
    `user-avatar-${shape}`,
    onClick && 'user-avatar-clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const statusClasses = [
    'user-avatar-status',
    status && `user-avatar-status-${status}`,
  ]
    .filter(Boolean)
    .join(' ');

  // Render avatar content
  const renderContent = () => {
    // Nếu có ảnh avatar
    if (src) {
      return (
        <img 
          src={src} 
          alt={name || 'User'} 
          className="user-avatar-image"
          onError={(e) => {
            // Fallback nếu ảnh load fail
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }

    // Nếu có tên, hiển thị chữ cái đầu
    if (name) {
      return (
        <span className="user-avatar-initials">
          {getInitials(name)}
        </span>
      );
    }

    // Default: hiển thị icon user
    return (
      <HiUser className="user-avatar-icon" />
    );
  };

  return (
    <div 
      className={avatarClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {renderContent()}
      
      {/* Fallback cho ảnh load fail */}
      {src && (
        <span className="user-avatar-initials" style={{ display: 'none' }}>
          {name ? getInitials(name) : <HiUser className="user-avatar-icon" />}
        </span>
      )}

      {/* Status indicator */}
      {showStatus && status && (
        <span className={statusClasses} aria-label={status} />
      )}
    </div>
  );
};

UserAvatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  status: PropTypes.oneOf(['online', 'offline', 'away', 'busy']),
  showStatus: PropTypes.bool,
  shape: PropTypes.oneOf(['circle', 'rounded', 'square']),
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default UserAvatar;
