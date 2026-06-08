import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { HiOutlineKey, HiOutlineLockClosed, HiOutlineCheck } from 'react-icons/hi2';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import CloseButton from '@components/common/CloseButton';
import { authService } from '@services/authService';
import useAuthStore from '@stores/authStore';
import styles from './ChangePasswordModal.module.scss';

/**
 * ChangePasswordModal Component
 * 
 * Modal thay đổi mật khẩu (hoặc thiết lập mật khẩu lần đầu)
 * dùng chung cho cả Sinh viên và Nhà tài trợ
 */
const ChangePasswordModal = ({ isOpen, onClose, user }) => {
  const { updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  // Kiểm tra tài khoản đã có mật khẩu hay chưa
  const hasPassword = user?.hasPassword === true;

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (hasPassword && !formData.oldPassword) {
      newErrors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      };

      if (hasPassword) {
        payload.oldPassword = formData.oldPassword;
      }

      const response = await authService.updatePassword(payload);

      if (response.success) {
        toast.success(response.message || 'Cập nhật mật khẩu thành công!');
        
        // Cập nhật trạng thái hasPassword trong auth store của user
        updateUser({
          ...user,
          hasPassword: true,
        });

        // Reset form
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        onClose();
      } else {
        toast.error(response.message || 'Cập nhật mật khẩu thất bại');
      }
    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật mật khẩu';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Nút đóng */}
        <CloseButton 
          onClick={onClose} 
          variant="light" 
          size="md" 
          position="top-right-inside"
          ariaLabel="Đóng"
        />

        {/* Tiêu đề */}
        <div className={styles.modalHeader}>
          <div className={styles.iconWrapper}>
            <HiOutlineKey className={styles.headerIcon} />
          </div>
          <h2 className={styles.modalTitle}>
            {hasPassword ? 'Đổi Mật Khẩu' : 'Thiết Lập Mật Khẩu'}
          </h2>
          <p className={styles.modalSubtitle}>
            {hasPassword 
              ? 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để thay đổi.' 
              : 'Tài khoản Google của bạn chưa có mật khẩu. Thiết lập ngay để đăng nhập bằng email.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {hasPassword && (
            <div className={styles.formField}>
              <Input
                label="MẬT KHẨU HIỆN TẠI"
                type="password"
                placeholder="Nhập mật khẩu hiện tại..."
                value={formData.oldPassword}
                onChange={handleChange('oldPassword')}
                error={!!errors.oldPassword}
                errorMessage={errors.oldPassword}
                showPasswordToggle
                leftIcon={<HiOutlineLockClosed size={18} />}
                disabled={loading}
              />
            </div>
          )}

          <div className={styles.formField}>
            <Input
              label="MẬT KHẨU MỚI"
              type="password"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
              value={formData.newPassword}
              onChange={handleChange('newPassword')}
              error={!!errors.newPassword}
              errorMessage={errors.newPassword}
              showPasswordToggle
              leftIcon={<HiOutlineLockClosed size={18} />}
              disabled={loading}
            />
          </div>

          <div className={styles.formField}>
            <Input
              label="XÁC NHẬN MẬT KHẨU MỚI"
              type="password"
              placeholder="Xác nhận lại mật khẩu mới..."
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword}
              showPasswordToggle
              leftIcon={<HiOutlineCheck size={18} />}
              disabled={loading}
            />
          </div>

          {/* Action buttons */}
          <div className={styles.formActions}>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onClose}
              disabled={loading}
              className={styles.btnCancel}
            >
              HỦY BỎ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className={styles.btnSubmit}
            >
              {hasPassword ? 'CẬP NHẬT' : 'THIẾT LẬP'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

ChangePasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default ChangePasswordModal;
