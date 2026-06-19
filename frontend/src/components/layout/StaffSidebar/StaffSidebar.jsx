import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HiXMark } from 'react-icons/hi2';
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
      { label: 'Nhà tài trợ', path: '/admin/nha-tai-tro', icon: HiOutlineHandRaised, roles: [1] },
      { label: 'Khoản tài trợ', path: '/admin/khoan-tai-tro', icon: HiOutlineCurrencyDollar, roles: [1] },
      { label: 'Lịch sử giao dịch', path: '/admin/giao-dich', icon: HiOutlineArrowsRightLeft, roles: [1] },
      { label: 'Đối soát chứng từ', path: '/admin/chung-tu', icon: HiOutlineDocumentText, roles: [1] },
    ]
  },
  {
    group: 'NỘI DUNG TRANG CHỦ',
    roles: [1],
    items: [
      { label: 'Sinh viên nổi bật', path: '/admin/sinh-vien-noi-bat', icon: HiOutlineStar, roles: [1] },
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
      { label: 'Giải ngân hồ sơ', path: '/ke-toan/giai-ngan', icon: HiOutlineBanknotes, roles: [2], badgeKey: 'pendingCount' },
      { label: 'Lịch sử giao dịch', path: '/ke-toan/giao-dich', icon: HiOutlineArrowsRightLeft, roles: [2] },
      { label: 'Khoản tài trợ', path: '/ke-toan/khoan-tai-tro', icon: HiOutlineCurrencyDollar, roles: [2] },
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
      { label: 'Sinh viên nổi bật', path: '/can-bo/sinh-vien-noi-bat', icon: HiOutlineStar, roles: [3] },
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
];

// ═══════════════════════════════════════════════════════════════════════════════
// ─── STAFF SIDEBAR COMPONENT ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const StaffSidebar = ({ isOpen = false, onClose }) => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [pendingCount] = useState(0); // TODO: Fetch from API
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // ─── LOGIC HIỂN THỊ ────────────────────────────────────
  // Chỉ hiển thị cho staff (vaiTro 1, 2, 3)
  // vaiTro = 4 là người dùng thường → return null
  if (!user || !user.vaiTro || user.vaiTro === 4) {
    return null;
  }

  const [permissions, setPermissions] = useState({});

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
    fetchPerms();
  }, []);

  const checkPageAccess = (path) => {
    if (!permissions || Object.keys(permissions).length === 0) return true;
    
    const segments = path.split('/').filter(Boolean);
    let key = segments[segments.length - 1];
    if (key === 'xet-duyet') key = 'xet_duyet';
    if (key === 'nha-tai-tro') key = 'nha_tai_tro';
    if (key === 'sinh-vien-noi-bat') key = 'sinh_vien_noi_bat';
    if (key === 'danhgia') key = 'danhgia';
    if (key === 'tin-tuc') key = 'tin_tuc';
    if (key === 'bao-cao') key = 'bao_cao';
    if (key === 'khoan-tai-tro') key = 'khoan_tai_tro';
    if (key === 'giao-dich') key = 'giao_dich';
    if (key === 'giai-ngan') key = 'giai_ngan';
    if (key === 'chung-tu') key = 'chung_tu';
    if (key === 'phe-duyet') key = 'phe_duyet';
    if (key === 'nhat-ky') key = 'nhat_ky';

    const perm = permissions[key];
    if (!perm) return true;

    let roleKey = 'sinhvien';
    if (user.vaiTro === 1) roleKey = 'admin';
    else if (user.vaiTro === 2) roleKey = 'ketoan';
    else if (user.vaiTro === 3) roleKey = 'canbo';
    else if (user.vaiTro === 4) {
      roleKey = user.loaiTaiKhoan === 'NHA_TAI_TRO' ? 'nhataitro' : 'sinhvien';
    }

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
    <aside className={`${styles.staffSidebar} ${isOpen ? styles.open : ''}`}>
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
          variant="full"
          layout="horizontal"
          theme="primary"
          title="TVU Fund"
          subtitle="Quản lý Quỹ"
          showSubtitle={true}
          clickable={true}
          onClick={() => navigate('/')}
        />
      </div>

      {/* Mini Profile */}
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

      {/* Navigation Menu */}
      <nav className={styles.navMenu}>
        {visibleGroups.map((group, groupIndex) => (
          <div key={groupIndex} className={styles.navGroup}>
            {/* Group Label */}
            {group.group && (
              <div className={styles.groupLabel}>{group.group}</div>
            )}

            {/* Nav Items */}
            {group.items.map((item) => {
              const Icon = item.icon;
              const showBadge = item.badgeKey && pendingCount > 0;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                  }
                  onClick={handleNavItemClick}
                >
                  <Icon className={styles.navIcon} />
                  <span className={styles.navLabel}>{item.label}</span>
                  {showBadge && (
                    <span className={styles.badge}>{pendingCount}</span>
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
        >
          Hỗ trợ
        </Button>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          leftIcon={<HiOutlineArrowRightOnRectangle size={18} />}
          className={styles.logoutButton}
        >
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
};

StaffSidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default StaffSidebar;
