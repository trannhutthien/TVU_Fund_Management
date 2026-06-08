import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineMapPin,
  HiOutlineAcademicCap,
  HiOutlineInformationCircle,
  HiOutlinePencilSquare,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineKey,
} from 'react-icons/hi2';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import useAuthStore from '@stores/authStore';
import { userService } from '@services/userService';
import ChangePasswordModal from '../../shared/ChangePasswordModal';
import styles from './PersonalInfoSection.module.scss';

/**
 * PersonalInfoSection - Thông tin cá nhân có hỗ trợ chỉnh sửa
 */
const PersonalInfoSection = ({ user, onSave }) => {
  const { updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    diaChi: '',
    khoaPhong: '',
  });

  const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loai_nguoi_dung;
  const isSinhVien = userType === 'SINH_VIEN';

  // Đồng bộ thông tin từ user prop
  useEffect(() => {
    if (user) {
      setFormData({
        hoTen: user.hoTen || user.ho_ten || '',
        email: user.email || '',
        soDienThoai: user.soDienThoai || user.so_dien_thoai || '',
        diaChi: user.diaChi || user.dia_chi || '',
        khoaPhong: user.khoaPhong || user.khoa_phong || '',
      });
    }
  }, [user, isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveClick = async () => {
    if (!formData.hoTen.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email không được để trống');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Email không đúng định dạng');
      return;
    }

    setLoading(false);

    try {
      setLoading(true);
      const userId = user?.userId || user?.user_id || user?.id;

      const payload = {
        ho_ten: formData.hoTen.trim(),
        email: formData.email.trim(),
        so_dien_thoai: formData.soDienThoai.trim() || null,
        dia_chi: formData.diaChi.trim() || null,
        khoa_phong: isSinhVien ? formData.khoaPhong.trim() || null : null,
      };

      const response = await userService.update(userId, payload);

      if (response.success) {
        toast.success('Cập nhật thông tin thành công!');
        
        // Map dữ liệu từ backend trả về để cập nhật store (camelCase)
        const updatedUser = {
          ...user,
          hoTen: response.data.ho_ten,
          email: response.data.email,
          soDienThoai: response.data.so_dien_thoai,
          diaChi: response.data.dia_chi,
          khoaPhong: response.data.khoa_phong,
          avatar: response.data.avatar,
        };
        
        updateUser(updatedUser);
        
        if (onSave) {
          onSave(updatedUser);
        }
        
        setIsEditing(false);
      } else {
        toast.error(response.message || 'Cập nhật thông tin thất bại');
      }
    } catch (error) {
      console.error('Cập nhật thông tin lỗi:', error);
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader} style={{ justifyContent: 'space-between', borderBottom: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <HiOutlineUser className={styles.headerIcon} />
          <h2 className={styles.headerTitle}>Thông tin cá nhân</h2>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {!isEditing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsChangePasswordModalOpen(true)}
              leftIcon={<HiOutlineKey size={16} />}
            >
              {user?.hasPassword ? 'Đổi mật khẩu' : 'Thiết lập mật khẩu'}
            </Button>
          )}
          {!isEditing ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleEditClick}
              leftIcon={<HiOutlinePencilSquare size={16} />}
            >
              Chỉnh sửa
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelClick}
                disabled={loading}
                leftIcon={<HiOutlineXMark size={16} />}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveClick}
                loading={loading}
                leftIcon={<HiOutlineCheck size={16} />}
              >
                Lưu
              </Button>
            </>
          )}
        </div>
      </div>

      <div className={styles.formGrid}>
        <Input
          label="Họ và tên"
          type="text"
          value={isEditing ? formData.hoTen : (user?.hoTen || user?.ho_ten || '')}
          onChange={(e) => handleInputChange('hoTen', e.target.value)}
          leftIcon={<HiOutlineUser size={18} />}
          disabled={!isEditing || loading}
        />

        <Input
          label="Email"
          type="email"
          value={isEditing ? formData.email : (user?.email || '')}
          onChange={(e) => handleInputChange('email', e.target.value)}
          leftIcon={<HiOutlineEnvelope size={18} />}
          disabled={!isEditing || loading}
        />

        <Input
          label="Số điện thoại"
          type="tel"
          value={isEditing ? formData.soDienThoai : (user?.soDienThoai || user?.so_dien_thoai || '—')}
          onChange={(e) => handleInputChange('soDienThoai', e.target.value)}
          leftIcon={<HiOutlinePhone size={18} />}
          disabled={!isEditing || loading}
        />

        {isSinhVien && (
          <Input
            label="MSSV"
            type="text"
            value={user?.maSoDinhDanh || user?.ma_so_dinh_danh || ''}
            leftIcon={<HiOutlineIdentification size={18} />}
            disabled
          />
        )}

        <div className={styles.fullWidth}>
          <Input
            label="Địa chỉ liên hệ"
            type="text"
            value={isEditing ? formData.diaChi : (user?.diaChi || user?.dia_chi || '—')}
            onChange={(e) => handleInputChange('diaChi', e.target.value)}
            leftIcon={<HiOutlineMapPin size={18} />}
            disabled={!isEditing || loading}
          />
        </div>

        {isSinhVien && (
          <div className={styles.fullWidth}>
            <Input
              label="Khoa/Đơn vị"
              type="text"
              value={isEditing ? formData.khoaPhong : (user?.khoaPhong || user?.khoa_phong || '—')}
              onChange={(e) => handleInputChange('khoaPhong', e.target.value)}
              leftIcon={<HiOutlineAcademicCap size={18} />}
              disabled={!isEditing || loading}
            />
          </div>
        )}
      </div>

      {!isEditing && (
        <div className={styles.note}>
          <HiOutlineInformationCircle className={styles.noteIcon} />
          <span>Thông tin được bảo mật và dùng cho việc xét duyệt hỗ trợ/quyên góp. Nhấn nút "Chỉnh sửa" để thay đổi thông tin.</span>
        </div>
      )}

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        user={user}
      />
    </div>
  );
};

PersonalInfoSection.propTypes = {
  user: PropTypes.object,
  onSave: PropTypes.func,
};

export default PersonalInfoSection;
