import React from 'react';
import PropTypes from 'prop-types';
import SidebarNavItem from './SidebarNavItem';
import styles from './Sidebar.module.scss';

/**
 * SidebarNavGroup Component
 * 
 * Render một nhóm menu có tiêu đề phân loại
 * Khi collapsed, tiêu đề ẩn và thay bằng divider
 * 
 * @param {string} title - Tiêu đề nhóm
 * @param {Array} items - Mảng các menu item
 * @param {boolean} isCollapsed - Sidebar có đang thu gọn không
 */
const SidebarNavGroup = ({ title, items, isCollapsed }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={styles.navGroup}>
      {isCollapsed ? (
        <div className={styles.navGroupDivider} />
      ) : (
        <h3 className={styles.navGroupTitle}>{title}</h3>
      )}
      
      <div className={styles.navGroupItems}>
        {items.map((item, index) => (
          <SidebarNavItem
            key={index}
            icon={item.icon}
            label={item.label}
            path={item.path}
            badge={item.badge}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  );
};

SidebarNavGroup.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      badge: PropTypes.number,
      roles: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
  isCollapsed: PropTypes.bool,
};

SidebarNavGroup.defaultProps = {
  isCollapsed: false,
};

export default SidebarNavGroup;
