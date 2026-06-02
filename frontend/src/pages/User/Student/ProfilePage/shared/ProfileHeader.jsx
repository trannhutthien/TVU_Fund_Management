import { useRef } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  HiOutlineCamera,
  HiOutlineIdentification,
  HiOutlineCalendarDays,
  HiOutlinePencilSquare,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2';
import Button from '@components/common/Button';
import Logo from '@components/common/Logo';
import { uploadService } from '@services/uploadService';
import { userService } from '@services/userService';
import useAuthStore from '@stores/authStore';
import styles from './ProfileHeader.module.scss';

const BADGE_MAP = {
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
};

const getBadgeType = (user) => {
  if (!user) return null;
  
  // Vai trò ID 4 = Người dùng → phân biệt theo loại tài khoản
  const userType = user.loai_tai_khoan || user.loaiTaiKhoan || user.loai_nguoi_dung;
  return userType;
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
  const { updateUser } = useAuthStore();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận ảnh định dạng JPG, JPEG hoặc PNG');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB');
      return;
    }

    const toastId = toast.loading('Đang tải ảnh đại diện lên...');

    try {
      // 1. Upload file ảnh lên server
      const uploadResponse = await uploadService.uploadAvatar(file);
      
      if (!uploadResponse.success || !uploadResponse.data?.filePath) {
        throw new Error('Không thể tải file lên máy chủ');
      }

      const filePath = uploadResponse.data.filePath;
      const userId = user?.userId || user?.user_id || user?.id;

      // 2. Gọi API cập nhật đường dẫn avatar của người dùng
      const updateResponse = await userService.update(userId, { avatar: filePath });

      if (updateResponse.success) {
        toast.update(toastId, {
          render: 'Cập nhật ảnh đại diện thành công!',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });

        // Cập nhật auth store để thay đổi hiển thị tức thời
        updateUser({
          ...user,
          avatar: updateResponse.data.avatar,
        });
      } else {
        throw new Error(updateResponse.message || 'Cập nhật avatar thất bại');
      }
    } catch (error) {
      console.error('Lỗi cập nhật avatar:', error);
      toast.update(toastId, {
        render: error.message || 'Lỗi hệ thống khi cập nhật ảnh đại diện',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const badge = BADGE_MAP[getBadgeType(user)];

  return (
    <div className={styles.profileHeader}>
      <div className={styles.card}>
        <div className={styles.decorCircle} />

        <div className={styles.content}>
          <div className={styles.avatarSection}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.hoTen || user.ho_ten} className={styles.avatar} />
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

          <div className={styles.info}>
            <div className={styles.nameRow}>
              <span className={styles.name}>{user?.hoTen || user?.ho_ten || 'Người dùng'}</span>
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
              <span>{user?.maSoDinhDanh || user?.ma_so_dinh_danh || user?.email || ''}</span>
            </div>

            {user?.createdAt && (
              <div className={styles.metaRowLight}>
                <HiOutlineCalendarDays size={13} />
                <span>Thành viên từ {formatMemberSince(user.createdAt)}</span>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            {onEdit && (
              <Button
                variant="secondary"
                size="md"
                onClick={onEdit}
                leftIcon={<HiOutlinePencilSquare size={16} />}
              >
                Chỉnh sửa
              </Button>
            )}
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
