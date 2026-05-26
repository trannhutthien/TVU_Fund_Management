import { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineCamera,
  HiOutlineIdentification,
  HiOutlineCalendarDays,
  HiOutlinePencilSquare,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';
import Button from '@components/common/Button';
import Logo from '@components/common/Logo';
import styles from './ProfileHeader.module.scss';

const BADGE_MAP = {
  // Vai trò ID 4 - Người dùng (phân biệt theo loại tài khoản)
  SINH_VIEN: {
    label: 'SINH VIÊN',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
    color: '#3b82f6',
  },
  NHA_TAI_TRO: {
    label: 'NHÀ TÀI TRỢ',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    color: '#10b981',
  },
  // Vai trò khác (Admin, Giáo vụ, Kế toán)
  ADMIN: {
    label: 'QUẢN TRỊ VIÊN',
    bg: 'rgba(240, 165, 0, 0.15)',
    border: 'rgba(240, 165, 0, 0.4)',
    color: 'var(--color-gold, #f0a500)',
  },
  GIAO_VU: {
    label: 'GIÁO VỤ',
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.4)',
    color: '#8b5cf6',
  },
  KE_TOAN: {
    label: 'KẾ TOÁN',
    bg: 'rgba(236, 72, 153, 0.15)',
    border: 'rgba(236, 72, 153, 0.4)',
    color: '#ec4899',
  },
};

// Helper: Xác định badge type dựa trên vai trò và loại tài khoản
const getBadgeType = (user) => {
  if (!user) return null;
  
  // Vai trò ID 4 = Người dùng → phân biệt theo loại tài khoản
  if (user.vaiTro === 4) {
    return user.loaiTaiKhoan; // 'SINH_VIEN' hoặc 'NHA_TAI_TRO'
  }
  
  // Các vai trò khác → dựa vào tên vai trò
  const tenVaiTro = user.tenVaiTro?.toUpperCase();
  if (tenVaiTro?.includes('ADMIN') || tenVaiTro?.includes('QUẢN TRỊ')) {
    return 'ADMIN';
  }
  if (tenVaiTro?.includes('GIÁO VỤ')) {
    return 'GIAO_VU';
  }
  if (tenVaiTro?.includes('KẾ TOÁN')) {
    return 'KE_TOAN';
  }
  
  return null;
};

const formatMemberSince = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });
};

const ProfileHeader = ({ user, onEdit, onLogout }) => {
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: upload avatar API
  };

  const badge = BADGE_MAP[getBadgeType(user)];

  return (
    <div className={styles.profileHeader}>
      <div className={styles.card}>
        <div className={styles.decorCircle} />

        <div className={styles.content}>
          {/* Avatar Section - Dùng Logo component cho fallback */}
          <div className={styles.avatarSection}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.hoTen} className={styles.avatar} />
            ) : (
              <div className={styles.avatarFallback}>
                <Logo size="lg" variant="icon-only" theme="light" />
              </div>
            )}
            <button
              type="button"
              className={styles.cameraBtn}
              onClick={handleAvatarClick}
              aria-label="Thay đổi ảnh đại diện"
            >
              <HiOutlineCamera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.hiddenInput}
            />
          </div>

          {/* Info Section */}
          <div className={styles.info}>
            <div className={styles.nameRow}>
              <span className={styles.name}>{user?.hoTen || 'Người dùng'}</span>
              {badge && (
                <span
                  className={styles.badge}
                  style={{
                    background: badge.bg,
                    borderColor: badge.border,
                    color: badge.color,
                  }}
                >
                  {badge.label}
                </span>
              )}
            </div>

            <div className={styles.metaRow}>
              <HiOutlineIdentification size={14} />
              <span>{user?.maSoDinhDanh || user?.email || ''}</span>
            </div>

            {user?.createdAt && (
              <div className={styles.metaRowLight}>
                <HiOutlineCalendarDays size={13} />
                <span>Thành viên từ {formatMemberSince(user.createdAt)}</span>
              </div>
            )}
          </div>

          {/* Actions Section - Dùng Button component */}
          <div className={styles.actions}>
            <Button
              variant="secondary"
              size="md"
              onClick={onEdit}
              leftIcon={<HiOutlinePencilSquare size={16} />}
            >
              Chỉnh sửa
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={onLogout}
              leftIcon={<HiOutlineArrowRightOnRectangle size={16} />}
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

ProfileHeader.propTypes = {
  user: PropTypes.object,
  onEdit: PropTypes.func,
  onLogout: PropTypes.func,
};

export default ProfileHeader;
