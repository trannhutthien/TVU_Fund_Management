import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { HiXMark, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import PropTypes from 'prop-types';
import {
  HiOutlineChartBarSquare,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineClipboardDocumentCheck,
  HiOutlineBuildingLibrary,
  HiOutlineHandRaised,
  HiOutlineCurrencyDollar,
  HiOutlineArrowsRightLeft,
  HiOutlineStar,
  HiOutlineChatBubbleLeftRight,
  HiOutlineMegaphone,
  HiOutlinePencilSquare,
  HiOutlineChartPie,
  HiOutlineBanknotes,
  HiOutlineDocumentText,
  HiOutlineQuestionMarkCircle,
  HiOutlineArrowRightOnRectangle,
  HiOutlineClipboardDocumentList,
  HiOutlineUserGroup,
  HiOutlineLightBulb,
} from 'react-icons/hi2';
import useAuthStore from '@stores/authStore';
import Logo from '@components/common/Logo';
import Button from '@components/common/Button';
import api from '@services/api';
import styles from './StaffSidebar.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ROLE LABELS ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const ROLE_LABELS = {
  1: 'Quản trị viên',
  2: 'Kế toán',
  3: 'Cán bộ Quỹ',
  5: 'Ban Kiểm soát',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── NAV CONFIG ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const NAV_CONFIG = [
  // ─── ADMIN (role_id = 1) ───────────────────────────
  {
    group: null,
    roles: [1],
    items: [
      { label: 'Tổng quan', path: '/admin/dashboard', icon: HiOutlineChartBarSquare, roles: [1] },
    ]
  },
  {
    group: 'QUẢN TRỊ HỆ THỐNG',
    roles: [1],
    items: [
      { label: 'Quản lý người dùng', path: '/admin/users', icon: HiOutlineUsers, roles: [1] },
      { label: 'Hệ thống & Phân quyền', path: '/admin/roles', icon: HiOutlineShieldCheck, roles: [1] },
      { label: 'Nhật ký hệ thống', path: '/admin/nhat-ky', icon: HiOutlineClipboardDocumentList, roles: [1] },
    ]
  },
  {
    group: 'NGHIỆP VỤ',
    roles: [1],
    items: [
      { label: 'Xét duyệt hồ sơ', path: '/admin/xet-duyet', icon: HiOutlineClipboardDocumentCheck, roles: [1], badgeKey: 'pendingCount' },
      { label: 'Lịch sử phê duyệt', path: '/admin/phe-duyet', icon: HiOutlineClipboardDocumentCheck, roles: [1] },
      { label: 'Danh sách Quỹ', path: '/admin/quy', icon: HiOutlineBuildingLibrary, roles: [1] },
      { label: 'Trích lập Ngân sách', path: '/admin/phan-bo', icon: HiOutlineBanknotes, roles: [1] },
      { label: 'Dự toán hàng năm', path: '/admin/du-toan', icon: HiOutlineBanknotes, roles: [1] },
      { label: 'Duyệt đề xuất', path: '/admin/de-xuat', icon: HiOutlineClipboardDocumentList, roles: [1], badgeKey: 'duyetDeXuat' },
      { label: 'Nhà tài trợ', path: '/admin/nha-tai-tro', icon: HiOutlineHandRaised, roles: [1] },
      { label: 'Khoản tài trợ', path: '/admin/khoan-tai-tro', icon: HiOutlineCurrencyDollar, roles: [1], badgeKey: 'khoanTaiTro' },
      { label: 'Lịch sử giao dịch', path: '/admin/giao-dich', icon: HiOutlineArrowsRightLeft, roles: [1] },
      { label: 'Đối soát chứng từ', path: '/admin/chung-tu', icon: HiOutlineDocumentText, roles: [1], badgeKey: 'doiSoatChungTu' },
    ]
  },
  {
    group: 'NỘI DUNG TRANG CHỦ',
    roles: [1],
    items: [
      // { label: 'Sinh viên nổi bật', path: '/admin/sinh-vien-noi-bat', icon: HiOutlineStar, roles: [1] }, // REMOVED: Feature không còn sử dụng
      { label: 'Cảm nhận sinh viên', path: '/admin/danhgia', icon: HiOutlineChatBubbleLeftRight, roles: [1] },
      { label: 'Tin tức & Sự kiện', path: '/admin/tin-tuc', icon: HiOutlineMegaphone, roles: [1] },
      { label: 'Tạo bài viết', path: '/admin/tintuc/tao', icon: HiOutlinePencilSquare, roles: [1] },
    ]
  },
  {
    group: 'BÁO CÁO',
    roles: [1],
    items: [
      { label: 'Thống kê & Báo cáo', path: '/admin/bao-cao', icon: HiOutlineChartPie, roles: [1] },
    ]
  },
  {
    group: 'GIÁM SÁT',
    roles: [1],
    items: [
      { label: 'Nghiệm thu & Công nợ', path: '/giam-sat', icon: HiOutlineClipboardDocumentCheck, roles: [1], badgeKey: 'nghiemThuCongNo' },
    ]
  },

  // ─── KẾ TOÁN (role_id = 2) ─────────────────────────
  {
    group: null,
    roles: [2],
    items: [
      { label: 'Tổng quan', path: '/ke-toan/dashboard', icon: HiOutlineChartBarSquare, roles: [2] },
    ]
  },
  {
    group: 'NGHIỆP VỤ',
    roles: [2],
    items: [
      { label: 'Xét duyệt & giải ngân hồ sơ', path: '/ke-toan/xet-duyet', icon: HiOutlineClipboardDocumentCheck, roles: [2], badgeKey: 'pendingCount' },
      { label: 'Trích lập Ngân sách', path: '/ke-toan/phan-bo', icon: HiOutlineBanknotes, roles: [2] },
      { label: 'Dự toán hàng năm', path: '/ke-toan/du-toan', icon: HiOutlineBanknotes, roles: [2] },
      { label: 'Duyệt đề xuất', path: '/ke-toan/de-xuat', icon: HiOutlineClipboardDocumentList, roles: [2], badgeKey: 'duyetDeXuat' },
      { label: 'Lịch sử giao dịch', path: '/ke-toan/giao-dich', icon: HiOutlineArrowsRightLeft, roles: [2] },
      { label: 'Khoản tài trợ', path: '/ke-toan/khoan-tai-tro', icon: HiOutlineCurrencyDollar, roles: [2], badgeKey: 'khoanTaiTro' },
    ]
  },
  {
    group: 'BÁO CÁO',
    roles: [2],
    items: [
      { label: 'Thống kê thu chi', path: '/ke-toan/bao-cao', icon: HiOutlineChartPie, roles: [2] },
      { label: 'Đối soát chứng từ', path: '/ke-toan/chung-tu', icon: HiOutlineDocumentText, roles: [2] },
    ]
  },
  {
    group: 'GIÁM SÁT',
    roles: [2],
    items: [
      { label: 'Nghiệm thu & Công nợ', path: '/giam-sat', icon: HiOutlineClipboardDocumentCheck, roles: [2], badgeKey: 'nghiemThuCongNo' },
    ]
  },

  // ─── CÁN BỘ QUỸ (role_id = 3) ─────────────────────
  {
    group: null,
    roles: [3],
    items: [
      { label: 'Tổng quan', path: '/can-bo/dashboard', icon: HiOutlineChartBarSquare, roles: [3] },
    ]
  },
  {
    group: 'NGHIỆP VỤ',
    roles: [3],
    items: [
      { label: 'Xét duyệt hồ sơ', path: '/can-bo/xet-duyet', icon: HiOutlineClipboardDocumentCheck, roles: [3], badgeKey: 'pendingCount' },
      { label: 'Danh sách Quỹ', path: '/can-bo/quy', icon: HiOutlineBuildingLibrary, roles: [3] },
      { label: 'Trích lập Ngân sách', path: '/can-bo/phan-bo', icon: HiOutlineBanknotes, roles: [3] },
      { label: 'Dự toán hàng năm', path: '/can-bo/du-toan', icon: HiOutlineBanknotes, roles: [3] },
      { label: 'Duyệt đề xuất', path: '/can-bo/de-xuat', icon: HiOutlineClipboardDocumentList, roles: [3], badgeKey: 'duyetDeXuat' },
      { label: 'Nhà tài trợ', path: '/can-bo/nha-tai-tro', icon: HiOutlineHandRaised, roles: [3] },
    ]
  },
  {
    group: 'QUẢN LÝ',
    roles: [3],
    items: [
      { label: 'Quản lý người dùng', path: '/can-bo/users', icon: HiOutlineUsers, roles: [3] },
    ]
  },
  {
    group: 'NỘI DUNG TRANG CHỦ',
    roles: [3],
    items: [
      // { label: 'Sinh viên nổi bật', path: '/can-bo/sinh-vien-noi-bat', icon: HiOutlineStar, roles: [3] }, // REMOVED: Feature không còn sử dụng
      { label: 'Cảm nhận sinh viên', path: '/can-bo/danhgia', icon: HiOutlineChatBubbleLeftRight, roles: [3] },
      { label: 'Tin tức & Sự kiện', path: '/can-bo/tin-tuc', icon: HiOutlineMegaphone, roles: [3] },
      { label: 'Tạo bài viết', path: '/can-bo/tintuc/tao', icon: HiOutlinePencilSquare, roles: [3] },
    ]
  },
  {
    group: 'BÁO CÁO',
    roles: [3],
    items: [
      { label: 'Thống kê & Báo cáo', path: '/can-bo/bao-cao', icon: HiOutlineChartPie, roles: [3] },
    ]
  },
  {
    group: 'GIÁM SÁT',
    roles: [3],
    items: [
      { label: 'Nghiệm thu & Công nợ', path: '/giam-sat', icon: HiOutlineClipboardDocumentCheck, roles: [3], badgeKey: 'nghiemThuCongNo' },
    ]
  },

  // ─── BAN KIỂM SOÁT (role_id = 5) ─────────────────
  {
    group: null,
    roles: [5],
    items: [
      { label: 'Tổng quan', path: '/kiem-soat/dashboard', icon: HiOutlineChartBarSquare, roles: [5] },
    ]
  },
  {
    group: 'GIÁM SÁT',
    roles: [5],
    items: [
      { label: 'Danh sách Quỹ', path: '/kiem-soat/quy', icon: HiOutlineBuildingLibrary, roles: [5] },
      { label: 'Phê duyệt', path: '/kiem-soat/phe-duyet', icon: HiOutlineClipboardDocumentCheck, roles: [5], badgeKey: 'pendingCount' },
      { label: 'Khoản tài trợ', path: '/kiem-soat/khoan-tai-tro', icon: HiOutlineCurrencyDollar, roles: [5] },
      { label: 'Giao dịch', path: '/kiem-soat/giao-dich', icon: HiOutlineArrowsRightLeft, roles: [5] },
      { label: 'Nghiệm thu & Công nợ', path: '/giam-sat', icon: HiOutlineClipboardDocumentCheck, roles: [5], badgeKey: 'nghiemThuCongNo' },
    ]
  },
  {
    group: 'BÁO CÁO',
    roles: [5],
    items: [
      { label: 'Thống kê & Báo cáo', path: '/kiem-soat/bao-cao', icon: HiOutlineChartPie, roles: [5] },
    ]
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ─── STAFF SIDEBAR COMPONENT ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const StaffSidebar = ({ isOpen = false, onClose, isCollapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [badgeCounts, setBadgeCounts] = useState({
    pendingCount: 0,
    nghiemThuCongNo: 0,
    khoanTaiTro: 0,
    doiSoatChungTu: 0,
    duyetDeXuat: 0,
  });
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({});

  // ─── FETCH USER PROFILE ────────────────────────────────
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/me');
        
        if (response.data.success) {
          const profileData = response.data.user;
          setUserProfile(profileData);
          
          // Cập nhật authStore với dữ liệu mới từ API
          updateUser({
            ho_ten: profileData.hoTen,
            maSoDinhDanh: profileData.maSoDinhDanh,
            avatar: profileData.avatar,
            vaiTro: profileData.vaiTro,
            tenVaiTro: profileData.tenVaiTro,
          });
        }
      } catch (error) {
        console.error('Lỗi fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    // Chỉ fetch nếu user đã đăng nhập
    if (user) {
      fetchUserProfile();
    }
  }, [user?.id, updateUser]);

  useEffect(() => {
    const fetchPerms = async () => {
      try {
        const res = await api.get('/system/settings/permissions');
        if (res.data?.success) {
          setPermissions(res.data.permissions);
        }
      } catch (err) {
        console.error('Error fetching permissions in StaffSidebar:', err);
      }
    };
    if (user && user.vaiTro && user.vaiTro !== 4) {
      fetchPerms();
    }
  }, [user]);

  // ─── FETCH PENDING COUNT (badge) ──────────────────────────────
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await api.get('/statistics/pending-count');
        if (res.data?.success) {
          setBadgeCounts(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching pending count:', err);
      }
    };

    if (user && user.vaiTro && user.vaiTro !== 4) {
      fetchPendingCount();

      const interval = setInterval(fetchPendingCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // ─── LOGIC HIỂN THỊ ────────────────────────────────────
  // Chỉ hiển thị cho staff (vaiTro 1, 2, 3)
  // vaiTro = 4 là người dùng thường → return null
  if (!user || !user.vaiTro || user.vaiTro === 4) {
    return null;
  }

  const checkPageAccess = (path) => {
    if (!permissions || Object.keys(permissions).length === 0) return true;
    
    const segments = path.split('/').filter(Boolean);
    let key = segments[segments.length - 1];
    if (key === 'xet-duyet') key = 'xet_duyet';
    if (key === 'nha-tai-tro') key = 'nha_tai_tro';
    // if (key === 'sinh-vien-noi-bat') key = 'sinh_vien_noi_bat'; // REMOVED: Feature không còn sử dụng
    if (key === 'danhgia') key = 'danhgia';
    if (key === 'tin-tuc') key = 'tin_tuc';
    if (key === 'bao-cao') key = 'bao_cao';
    if (key === 'khoan-tai-tro') key = 'khoan_tai_tro';
    if (key === 'giao-dich') key = 'giao_dich';
    if (key === 'giai-ngan') key = 'giai_ngan';
    if (key === 'chung-tu') key = 'chung_tu';
    if (key === 'phe-duyet') key = 'phe_duyet';
    if (key === 'nhat-ky') key = 'nhat_ky';
    if (key === 'phan-bo') key = 'phan_bo';
    if (key === 'du-toan') key = 'du_toan';
    if (key === 'giam-sat') key = 'giam_sat';
    if (key === 'de-xuat-chuong-trinh') key = 'de_xuat_chuong_trinh';
    if (key === 'de-xuat') key = 'duyet_de_xuat';

    const perm = permissions[key];
    if (!perm) return true;

    let roleKey = 'sinhvien';
    if (user.vaiTro === 1) roleKey = 'admin';
    else if (user.vaiTro === 2) roleKey = 'ketoan';
    else if (user.vaiTro === 3) roleKey = 'canbo';
    else if (user.vaiTro === 4) {
      roleKey = user.loaiTaiKhoan === 'NHA_TAI_TRO' ? 'nhataitro' : 'sinhvien';
    }
    else if (user.vaiTro === 5) roleKey = 'bankiemsoat';

    return !!perm[roleKey];
  };

  // ─── FILTER MENU THEO ROLE & PAGE PERMISSIONS ──────────
  const visibleGroups = NAV_CONFIG
    .filter(group => group.roles.includes(user.vaiTro))
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.roles.includes(user.vaiTro) && checkPageAccess(item.path))
    }))
    .filter(group => group.items.length > 0);

  // ─── HANDLE SIDEBAR CLOSE ─────────────────────────────────
  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleNavItemClick = () => {
    if (window.innerWidth <= 768) {
      handleClose();
    }
  };

  // ─── GET AVATAR INITIAL ─────────────────────────────────
  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // ─── HANDLE LOGOUT ──────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ─── HANDLE SUPPORT ─────────────────────────────────────
  const handleSupport = () => {
    navigate('/guidelines');
  };

  // Dùng userProfile nếu có, fallback về user từ authStore
  const displayUser = userProfile || user;
  const displayName = displayUser.hoTen || displayUser.ho_ten || 'Người dùng';
  const displayRole = displayUser.tenVaiTro || ROLE_LABELS[displayUser.vaiTro] || 'Người dùng';
  const displayAvatar = displayUser.avatar;

  return (
    <aside className={`${styles.staffSidebar} ${isOpen ? styles.open : ''} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Collapse Toggle Button – desktop only (Portal để tránh overflow clip) */}
      {createPortal(
        <button
          className={styles.collapseToggle}
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
          type="button"
          style={{ left: isCollapsed ? '57px' : '245px', top: '110px' }}
        >
          {isCollapsed ? <HiChevronRight size={16} /> : <HiChevronLeft size={16} />}
        </button>,
        document.body
      )}

      {/* Mobile Close Button – chỉ hiện trên mobile */}
      <button
        className={styles.closeMobileBtn}
        onClick={handleClose}
        aria-label="Đóng menu"
      >
        <HiXMark size={22} />
      </button>

      {/* Logo Section */}
      <div className={styles.logoSection}>
        <Logo
          size="sm"
          variant={isCollapsed ? 'icon-only' : 'full'}
          layout="horizontal"
          theme="primary"
          title="TVU Fund"
          subtitle="Quản lý Quỹ"
          showSubtitle={!isCollapsed}
          clickable={true}
          onClick={() => navigate('/')}
        />
      </div>

      {/* Mini Profile */}
      {!isCollapsed && (
      <div className={styles.miniProfile}>
        {loading ? (
          <>
            <div className={`${styles.avatar} ${styles.avatarSkeleton}`} />
            <div className={styles.profileInfo}>
              <div className={styles.skeletonLine} style={{ width: '120px', height: '14px' }} />
              <div className={styles.skeletonLine} style={{ width: '80px', height: '11px', marginTop: '4px' }} />
            </div>
          </>
        ) : (
          <>
            <div className={styles.avatar}>
              {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} />
              ) : (
                <span className={styles.avatarInitial}>
                  {getInitial(displayName)}
                </span>
              )}
            </div>
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{displayName}</p>
              <p className={styles.profileRole}>{displayRole}</p>
            </div>
          </>
        )}
      </div>
      )}

      {/* Navigation Menu */}
      <nav className={styles.navMenu}>
        {visibleGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={styles.navGroup}>
            {/* Group Label */}
            {group.group && !isCollapsed && (
              <div className={styles.groupLabel}>{group.group}</div>
            )}

            {/* Nav Items */}
            {group.items.map((item) => {
              const Icon = item.icon;
              const badgeValue = item.badgeKey ? (badgeCounts[item.badgeKey] || 0) : 0;
              const showBadge = badgeValue > 0;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                  }
                  onClick={handleNavItemClick}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={styles.navIcon} />
                  {!isCollapsed && <span className={styles.navLabel}>{item.label}</span>}
                  {showBadge && (
                    <span className={styles.badge}>{badgeValue}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        {/* Support Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSupport}
          leftIcon={<HiOutlineQuestionMarkCircle size={18} />}
          className={styles.footerButton}
          title={isCollapsed ? 'Hỗ trợ' : undefined}
        >
          {!isCollapsed && 'Hỗ trợ'}
        </Button>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          leftIcon={<HiOutlineArrowRightOnRectangle size={18} />}
          className={styles.logoutButton}
          title={isCollapsed ? 'Đăng xuất' : undefined}
        >
          {!isCollapsed && 'Đăng xuất'}
        </Button>
      </div>
    </aside>
  );
};

StaffSidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  isCollapsed: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
};

export default StaffSidebar;
