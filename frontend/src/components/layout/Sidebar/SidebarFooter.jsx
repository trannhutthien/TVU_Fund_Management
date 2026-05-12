import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { HiOutlineQuestionMarkCircle, HiArrowRightOnRectangle } from 'react-icons/hi2';
import { useAuth } from '@hooks/useAuth';
import styles from './Sidebar.module.scss';

/**
 * SidebarFooter Component
 * 
 * Phần cố định dưới cùng sidebar
 * Gồm: Hỗ trợ và Đăng xuất
 * 
 * @param {boolean} isCollapsed - Sidebar có đang thu gọn không
 */
const SidebarFooter = ({ isCollapsed }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSupport = () => {
    navigate('/support');
  };

  const handleLogout = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <div className={styles.sidebarFooter}>
      {/* Support Button */}
      <button
        className={styles.footerItem}
        onClick={handleSupport}
        title={isCollapsed ? 'Hỗ trợ' : ''}
      >
        <span className={styles.footerIcon}>
          <HiOutlineQuestionMarkCircle />
        </span>
        {!isCollapsed && (
          <span className={styles.footerLabel}>Hỗ trợ</span>
        )}
      </button>

      {/* Logout Button */}
      <button
        className={`${styles.footerItem} ${styles.footerItemLogout}`}
        onClick={handleLogout}
        title={isCollapsed ? 'Đăng xuất' : ''}
      >
        <span className={styles.footerIcon}>
          <HiArrowRightOnRectangle />
        </span>
        {!isCollapsed && (
          <span className={styles.footerLabel}>Đăng xuất</span>
        )}
      </button>
    </div>
  );
};

SidebarFooter.propTypes = {
  isCollapsed: PropTypes.bool,
};

SidebarFooter.defaultProps = {
  isCollapsed: false,
};

export default SidebarFooter;
