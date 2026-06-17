import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  HiOutlineSquares2X2, 
  HiOutlineBanknotes, 
  HiOutlineDocumentCheck,
  HiOutlineArrowsRightLeft,
  HiOutlineHeart,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi2';
import { useAuth } from '@hooks/useAuth';
import SidebarNavGroup from './SidebarNavGroup';
import SidebarFooter from './SidebarFooter';
import styles from './Sidebar.module.scss';

/**
 * NAV_CONFIG - Cấu hình toàn bộ menu theo RBAC
 * 
 * Mỗi nhóm có:
 * - title: Tiêu đề nhóm
 * - roles: Mảng roles được phép xem nhóm này
 * - items: Mảng các menu item
 * 
 * Mỗi item có:
 * - label: Tên hiển thị
 * - path: Đường dẫn route
 * - icon: React icon component
 * - roles: Mảng roles được phép xem item này
 * - badge: Số thông báo (optional, có thể là số hoặc key để lấy từ state)
 */
const NAV_CONFIG = [
  {
    title: 'ĐIỀU HÀNH & NGHIỆP VỤ',
    roles: ['admin', 'giaovu'],
    items: [
      {
        label: 'Bảng điều khiển',
        path: '/dashboard',
        icon: <HiOutlineSquares2X2 />,
        roles: ['admin', 'giaovu'],
      },
      {
        label: 'Quản lý Nguồn quỹ',
        path: '/funds',
        icon: <HiOutlineBanknotes />,
        roles: ['admin'],
      },
      {
        label: 'Xét duyệt hồ sơ',
        path: '/applications',
        icon: <HiOutlineDocumentCheck />,
        roles: ['admin', 'giaovu'],
        badge: 26, // Có thể thay bằng dynamic value từ API
      },
    ],
  },
  {
    title: 'TÀI CHÍNH & ĐỐI TÁC',
    roles: ['admin', 'ketoan'],
    items: [
      {
        label: 'Lịch sử giao dịch',
        path: '/transactions',
        icon: <HiOutlineArrowsRightLeft />,
        roles: ['admin', 'ketoan'],
      },
      {
        label: 'Đối tác & Nhà tài trợ',
        path: '/donors',
        icon: <HiOutlineHeart />,
        roles: ['admin', 'ketoan'],
      },
    ],
  },
  {
    title: 'QUẢN TRỊ CẤP CAO',
    roles: ['admin'],
    items: [
      {
        label: 'Quản lý người dùng',
        path: '/users',
        icon: <HiOutlineUsers />,
        roles: ['admin'],
      },
      {
        label: 'Hệ thống & Phân quyền',
        path: '/settings',
        icon: <HiOutlineCog6Tooth />,
        roles: ['admin'],
      },
    ],
  },
];

/**
 * Sidebar Component
 * 
 * Sidebar chính với RBAC, tự động filter menu theo role
 * Có thể toggle collapsed/expanded
 * State collapsed được lưu vào localStorage
 * 
 * @param {boolean} isMobileOpen - Sidebar có đang mở trên mobile không
 * @param {function} onMobileClose - Callback đóng sidebar trên mobile
 */
const Sidebar = ({ isMobileOpen, onMobileClose }) => {
  const { user } = useAuth();
  
  // Load collapsed state từ localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Save collapsed state vào localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Toggle collapsed
  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Get user role (fallback to 'admin' for demo if no user)
  // Backend trả về VaiTro, không phải role
  const userRole = user?.VaiTro || user?.role || 'admin';

  // Filter menu theo role của user
  const visibleGroups = NAV_CONFIG
    .filter(group => group.roles.includes(userRole))
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.roles.includes(userRole)),
    }))
    .filter(group => group.items.length > 0); // Chỉ hiện nhóm có ít nhất 1 item

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className={styles.backdrop} 
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''} ${
          isMobileOpen ? styles.sidebarMobileOpen : ''
        }`}
      >
        {/* Toggle Button */}
        <button
          className={styles.toggleButton}
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {isCollapsed ? <HiChevronRight /> : <HiChevronLeft />}
        </button>

        {/* Scrollable Content */}
        <div className={styles.sidebarContent}>
          {/* Navigation Groups */}
          <nav className={styles.sidebarNav}>
            {visibleGroups.length > 0 ? (
              visibleGroups.map((group, index) => (
                <SidebarNavGroup
                  key={index}
                  title={group.title}
                  items={group.items}
                  isCollapsed={isCollapsed}
                />
              ))
            ) : (
              <div style={{ padding: '20px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontSize: '14px' }}>
                Không có menu nào
              </div>
            )}
          </nav>
        </div>

        {/* Footer (Fixed at bottom) */}
        <SidebarFooter isCollapsed={isCollapsed} />
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  isMobileOpen: PropTypes.bool,
  onMobileClose: PropTypes.func,
};

Sidebar.defaultProps = {
  isMobileOpen: false,
  onMobileClose: () => {},
};

export default Sidebar;
