import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineMapPin,
  HiOutlineAcademicCap,
  HiOutlineInformationCircle,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import styles from './PersonalInfoTab.module.scss';

/**
 * PersonalInfoTab Component
 * 
 * Tab hiển thị và chỉnh sửa thông tin cá nhân
 * 
 * @param {Object} user - Thông tin user từ store
 * @param {Function} onSave - Callback khi lưu thông tin: (data) => void
 * @param {Boolean} loading - Trạng thái loading
 */
const PersonalInfoTab = ({ user, onSave, loading = false }) => {
  // State cho đổi mật khẩu
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const [showPass, setShowPass] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });

  const [passStrength, setPassStrength] = useState(0);
  const [passError, setPassError] = useState('');

  const isSinhVien = user?.loaiTaiKhoan === 'SINH_VIEN';

  // Tính độ mạnh mật khẩu
  const calcStrength = (pass) => {
    let s = 0;
    if (pass.length >= 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  };

  // Handle password change
  const handlePasswordChange = (field) => (e) => {
    const value = e.target.value;
    setPasswords((prev) => ({ ...prev, [field]: value }));

    if (field === 'newPass') {
      setPassStrength(calcStrength(value));
    }

    if (field === 'confirm' || field === 'newPass') {
      setPassError('');
    }
  };

  // Handle confirm password blur
  const handleConfirmBlur = () => {
    if (passwords.confirm && passwords.confirm !== passwords.newPass) {
      setPassError('Mật khẩu xác nhận không khớp');
    } else if (passwords.confirm && passwords.confirm === passwords.newPass) {
      setPassError('');
    }
  };

  // Handle save password
  const handleSavePassword = () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) return;
    if (passError) return;
    if (passStrength < 2) return;

    onSave?.({
      currentPassword: passwords.current,
      newPassword: passwords.newPass,
    });
  };

  // Check if save button should be disabled
  const isSaveDisabled =
    !passwords.current ||
    !passwords.newPass ||
    !passwords.confirm ||
    passError !== '' ||
    passStrength < 2;

  // Password strength config
  const strengthConfig = [
    { label: 'Yếu', color: '#ef4444' },
    { label: 'Trung bình', color: '#f59e0b' },
    { label: 'Mạnh', color: 'var(--color-gold)' },
    { label: 'Rất mạnh', color: '#10b981' },
  ];

  return (
    <div className={styles.personalInfoTab}>
      {/* Khối A - Thông tin cá nhân (READONLY) */}
      <div className={styles.sectionLabel}>THÔNG TIN CÁ NHÂN</div>

      <div className={styles.formGrid}>
        {/* Họ và tên */}
        <Input
          label="Họ và tên"
          type="text"
          value={user?.hoTen || ''}
          leftIcon={<HiOutlineUser size={18} />}
          disabled
          className={styles.readonlyInput}
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          value={user?.email || ''}
          leftIcon={<HiOutlineEnvelope size={18} />}
          disabled
          className={styles.readonlyInput}
        />

        {/* Số điện thoại */}
        <Input
          label="Số điện thoại"
          type="tel"
          value={user?.soDienThoai || '—'}
          leftIcon={<HiOutlinePhone size={18} />}
          disabled
          className={styles.readonlyInput}
        />

        {/* MSSV - Chỉ hiện với SINH_VIEN */}
        {isSinhVien && (
          <Input
            label="MSSV"
            type="text"
            value={user?.maSoDinhDanh || ''}
            leftIcon={<HiOutlineIdentification size={18} />}
            disabled
            className={styles.readonlyInput}
          />
        )}

        {/* Địa chỉ liên hệ - Full width */}
        <div className={styles.fullWidth}>
          <Input
            label="Địa chỉ liên hệ"
            type="text"
            value={user?.diaChi || '—'}
            leftIcon={<HiOutlineMapPin size={18} />}
            disabled
            className={styles.readonlyInput}
          />
        </div>

        {/* Khoa/Đơn vị - Full width, chỉ hiện với SINH_VIEN */}
        {isSinhVien && (
          <div className={styles.fullWidth}>
            <Input
              label="Khoa/Đơn vị"
              type="text"
              value={user?.khoaPhong || '—'}
              leftIcon={<HiOutlineAcademicCap size={18} />}
              disabled
              className={styles.readonlyInput}
            />
          </div>
        )}
      </div>

      {/* Ghi chú */}
      <div className={styles.note}>
        <HiOutlineInformationCircle className={styles.noteIcon} />
        <span>Để cập nhật thông tin cá nhân, vui lòng liên hệ phòng Giáo vụ.</span>
      </div>

      {/* Divider */}
      <div className={styles.divider}>
        <span className={styles.dividerLabel}>ĐỔI MẬT KHẨU</span>
      </div>

      {/* Khối B - Đổi mật khẩu (EDITABLE) */}
      <div className={styles.passwordSection}>
        {/* Mật khẩu hiện tại */}
        <Input
          label="Mật khẩu hiện tại"
          type={showPass.current ? 'text' : 'password'}
          value={passwords.current}
          onChange={handlePasswordChange('current')}
          leftIcon={<HiOutlineLockClosed size={18} />}
          rightIcon={
            <button
              type="button"
              onClick={() =>
                setShowPass((prev) => ({ ...prev, current: !prev.current }))
              }
              className={styles.toggleBtn}
            >
              {showPass.current ? (
                <HiOutlineEyeSlash size={18} />
              ) : (
                <HiOutlineEye size={18} />
              )}
            </button>
          }
          placeholder="••••••••"
        />

        {/* Mật khẩu mới */}
        <Input
          label="Mật khẩu mới"
          type={showPass.newPass ? 'text' : 'password'}
          value={passwords.newPass}
          onChange={handlePasswordChange('newPass')}
          leftIcon={<HiOutlineLockClosed size={18} />}
          rightIcon={
            <button
              type="button"
              onClick={() =>
                setShowPass((prev) => ({ ...prev, newPass: !prev.newPass }))
              }
              className={styles.toggleBtn}
            >
              {showPass.newPass ? (
                <HiOutlineEyeSlash size={18} />
              ) : (
                <HiOutlineEye size={18} />
              )}
            </button>
          }
          placeholder="••••••••"
        />

        {/* Thanh độ mạnh mật khẩu */}
        {passwords.newPass && (
          <div className={styles.strengthMeter}>
            <div className={styles.strengthBars}>
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={styles.strengthBar}
                  style={{
                    backgroundColor:
                      index < passStrength
                        ? strengthConfig[passStrength - 1]?.color
                        : '#e2e8f0',
                  }}
                />
              ))}
            </div>
            {passStrength > 0 && (
              <span
                className={styles.strengthLabel}
                style={{ color: strengthConfig[passStrength - 1]?.color }}
              >
                {strengthConfig[passStrength - 1]?.label}
              </span>
            )}
          </div>
        )}

        {/* Xác nhận mật khẩu mới */}
        <Input
          label="Xác nhận mật khẩu mới"
          type={showPass.confirm ? 'text' : 'password'}
          value={passwords.confirm}
          onChange={handlePasswordChange('confirm')}
          onBlur={handleConfirmBlur}
          leftIcon={<HiOutlineLockClosed size={18} />}
          rightIcon={
            passwords.confirm && !passError && passwords.confirm === passwords.newPass ? (
              <HiOutlineCheckCircle size={18} style={{ color: '#10b981' }} />
            ) : (
              <button
                type="button"
                onClick={() =>
                  setShowPass((prev) => ({ ...prev, confirm: !prev.confirm }))
                }
                className={styles.toggleBtn}
              >
                {showPass.confirm ? (
                  <HiOutlineEyeSlash size={18} />
                ) : (
                  <HiOutlineEye size={18} />
                )}
              </button>
            )
          }
          placeholder="••••••••"
          error={!!passError}
          errorMessage={passError}
        />

        {/* Nút Lưu thay đổi */}
        <div className={styles.saveButtonWrapper}>
          <Button
            variant="primary"
            size="md"
            onClick={handleSavePassword}
            disabled={isSaveDisabled}
            loading={loading}
            leftIcon={<HiOutlineCheckCircle size={18} />}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
};

PersonalInfoTab.propTypes = {
  user: PropTypes.object,
  onSave: PropTypes.func,
  loading: PropTypes.bool,
};

export default PersonalInfoTab;
