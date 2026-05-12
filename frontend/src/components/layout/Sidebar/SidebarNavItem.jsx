import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './Sidebar.module.scss';

/**
 * SidebarNavItem Component
 * 
 * Component nhỏ nhất render một dòng menu trong sidebar
 * Tự động nhận active state từ NavLink
 * 
 * @param {React.ReactNode} icon - Icon component
 * @param {string} label - Tên menu
 * @param {string} path - Đường dẫn route
 * @param {number} badge - Số thông báo (optional)
 * @param {boolean} isCollapsed - Sidebar có đang thu gọn không
 */
const SidebarNavItem = ({ icon, label, path, badge, isCollapsed }) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `${styles.navItem} ${isActive ? styles.navItemActive : ''} ${
          isCollapsed ? styles.navItemCollapsed : ''
        }`
      }
      title={isCollapsed ? label : ''}
    >
      <span className={styles.navIcon}>{icon}</span>
      
      {!isCollapsed && (
        <>
          <span className={styles.navLabel}>{label}</span>
          {badge > 0 && (
            <span className={styles.navBadge}>{badge > 99 ? '99+' : badge}</span>
          )}
        </>
      )}
    </NavLink>
  );
};

SidebarNavItem.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  badge: PropTypes.number,
  isCollapsed: PropTypes.bool,
};

SidebarNavItem.defaultProps = {
  badge: 0,
  isCollapsed: false,
};

export default SidebarNavItem;
