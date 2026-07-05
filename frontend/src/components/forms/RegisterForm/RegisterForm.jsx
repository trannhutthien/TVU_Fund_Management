import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { 
  HiOutlineUser, 
  HiOutlineIdentification, 
  HiOutlineAcademicCap,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineBuildingOffice,
  HiOutlinePhone,
  HiOutlineChevronDown
} from 'react-icons/hi2';
import Logo from '@components/common/Logo';
import Button from '@components/common/Button';
import CloseButton from '@components/common/CloseButton';
import { authService } from '@services/authService';
import useAuthStore from '@stores/authStore';
import './RegisterForm.scss';

/**
 * RegisterForm Component
 * 
 * Form đăng ký tài khoản mới
 * Hỗ trợ 2 loại: Sinh viên và Nhà tài trợ
 */
const RegisterForm = ({ onSuccess, onClose }) => {
  const navigate = useNavigate();
  const { login: loginStore } = useAuthStore();
  
  // Tab state: 'sinhvien' | 'nhataitro'
  const [activeTab, setActiveTab] = useState('sinhvien');
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  // Form state cho Sinh viên
  const [studentForm, setStudentForm] = useState({
    hoTen: '',
    mssv: '',
    lopKhoa: '',
    email: '',
    password: ''
  });
  
  // Form state cho Nhà tài trợ
  const [sponsorForm, setSponsorForm] = useState({
    tenToChuc: '',
    loaiNhaTaiTro: 'Ca nhan',
    email: '',
    soDienThoai: '',
    password: ''
  });
  
  // Error state
  const [errors, setErrors] = useState({});
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setShowPassword(false);
  };

  // Handle input change - Sinh viên
  const handleStudentChange = (field) => (e) => {
    setStudentForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle input change - Nhà tài trợ
  const handleSponsorChange = (field) => (e) => {
    setSponsorForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate email TVU (không bắt buộc - chỉ warning)
  const validateTVUEmail = (email) => {
    const tvuPattern = /@(st\.)?tvu\.edu\.vn$/;
    return tvuPattern.test(email);
  };

  // Validate Sinh viên form
  const validateStudentForm = () => {
    const newErrors = {};

    if (!studentForm.hoTen.trim()) {
      newErrors.hoTen = 'Vui lòng nhập họ và tên';
    }

    if (!studentForm.mssv.trim()) {
      newErrors.mssv = 'Vui lòng nhập MSSV';
    }

    if (!studentForm.lopKhoa.trim()) {
      newErrors.lopKhoa = 'Vui lòng nhập lớp/khoa';
    }

    if (!studentForm.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentForm.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!studentForm.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (studentForm.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Nhà tài trợ form
  const validateSponsorForm = () => {
    const newErrors = {};

    if (!sponsorForm.tenToChuc.trim()) {
      newErrors.tenToChuc = 'Vui lòng nhập tên tổ chức/cá nhân';
    }

    if (!sponsorForm.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sponsorForm.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!sponsorForm.soDienThoai.trim()) {
      newErrors.soDienThoai = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(sponsorForm.soDienThoai)) {
      newErrors.soDienThoai = 'Số điện thoại không hợp lệ';
    }

    if (!sponsorForm.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (sponsorForm.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    // Validate based on active tab
    const isValid = activeTab === 'sinhvien' 
      ? validateStudentForm() 
      : validateSponsorForm();

    if (!isValid) return;

    try {
      setLoading(true);

      // Prepare data theo format API
      const data = activeTab === 'sinhvien' 
        ? {
            hoTen: studentForm.hoTen,
            mssv: studentForm.mssv,
            lopKhoa: studentForm.lopKhoa,
            email: studentForm.email,
            password: studentForm.password,
            loaiTaiKhoan: 'sinhvien'
          }
        : {
            tenToChuc: sponsorForm.tenToChuc,
            loaiNhaTaiTro: sponsorForm.loaiNhaTaiTro,
            email: sponsorForm.email,
            soDienThoai: sponsorForm.soDienThoai,
            password: sponsorForm.password,
            loaiTaiKhoan: 'nhataitro'
          };

      // Gọi API register
      const response = await authService.register(data);

      if (response.success) {
        // Lưu token và user vào store
        loginStore(response.user, response.accessToken, response.refreshToken);
        
        // Hiển thị thông báo thành công
        toast.success('Đăng ký tài khoản thành công!');
        
        // Đóng modal và chuyển hướng
        onSuccess?.();
        
        // Chuyển đến trang profile sau 500ms
        setTimeout(() => {
          navigate('/profile');
        }, 500);
      } else {
        toast.error(response.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi đăng ký';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form-wrapper">
      {/* Background overlay */}
      <div className="register-form-overlay" />

      {/* Register card */}
      <div className="register-form-card">
        {/* Close Button */}
        {onClose && (
          <CloseButton 
            onClick={onClose} 
            variant="light" 
            size="sm" 
            position="top-right-inside"
            ariaLabel="Đóng"
          />
        )}

        {/* Logo */}
        <div className="register-form-logo">
          <Logo 
            size="xl" 
            variant="icon-only" 
            animated 
          />
        </div>

        {/* Title */}
        <h1 className="register-form-title">TẠO TÀI KHOẢN MỚI</h1>

        {/* Subtitle */}
        <p className="register-form-subtitle">
          Tham gia hệ thống quản lý tài chính TVU
        </p>

        {/* Tabs */}
        <div className="register-form-tabs">
          <button
            type="button"
            className={`register-form-tab ${activeTab === 'sinhvien' ? 'register-form-tab-active' : ''}`}
            onClick={() => handleTabChange('sinhvien')}
          >
            Sinh viên
          </button>
          <button
            type="button"
            className={`register-form-tab ${activeTab === 'nhataitro' ? 'register-form-tab-active' : ''}`}
            onClick={() => handleTabChange('nhataitro')}
          >
            Nhà tài trợ
          </button>
        </div>

        {/* Form Sinh viên */}
        {activeTab === 'sinhvien' && (
          <div className="register-form">
            {/* Họ và tên */}
            <div className="register-form-field">
              <label className="register-form-label">HỌ VÀ TÊN</label>
              <div className={`register-form-input-wrapper ${errors.hoTen ? 'register-form-input-error' : ''}`}>
                <HiOutlineUser className="register-form-icon-left" />
                <input
                  type="text"
                  className="register-form-input"
                  placeholder="Nhập đầy đủ họ và tên..."
                  value={studentForm.hoTen}
                  onChange={handleStudentChange('hoTen')}
                />
              </div>
              {errors.hoTen && <span className="register-form-error-text">{errors.hoTen}</span>}
            </div>

            {/* MSSV + Lớp/Khoa */}
            <div className="register-form-field-row">
              <div className="register-form-field">
                <label className="register-form-label">MSSV</label>
                <div className={`register-form-input-wrapper ${errors.mssv ? 'register-form-input-error' : ''}`}>
                  <HiOutlineIdentification className="register-form-icon-left" />
                  <input
                    type="text"
                    className="register-form-input"
                    placeholder="110121..."
                    value={studentForm.mssv}
                    onChange={handleStudentChange('mssv')}
                  />
                </div>
                {errors.mssv && <span className="register-form-error-text">{errors.mssv}</span>}
              </div>

              <div className="register-form-field">
                <label className="register-form-label">LỚP/KHOA</label>
                <div className={`register-form-input-wrapper ${errors.lopKhoa ? 'register-form-input-error' : ''}`}>
                  <HiOutlineAcademicCap className="register-form-icon-left" />
                  <input
                    type="text"
                    className="register-form-input"
                    placeholder="DA21TTB..."
                    value={studentForm.lopKhoa}
                    onChange={handleStudentChange('lopKhoa')}
                  />
                </div>
                {errors.lopKhoa && <span className="register-form-error-text">{errors.lopKhoa}</span>}
              </div>
            </div>

            {/* Email */}
            <div className="register-form-field">
              <label className="register-form-label">EMAIL</label>
              <div className={`register-form-input-wrapper ${errors.email ? 'register-form-input-error' : ''}`}>
                <HiOutlineEnvelope className="register-form-icon-left" />
                <input
                  type="email"
                  className="register-form-input"
                  placeholder="Email cá nhân hoặc email TVU..."
                  value={studentForm.email}
                  onChange={handleStudentChange('email')}
                />
              </div>
              {errors.email && <span className="register-form-error-text">{errors.email}</span>}
              {!errors.email && studentForm.email && !validateTVUEmail(studentForm.email) && (
                <span className="register-form-hint-text">💡 Khuyến nghị dùng email TVU để xác thực nhanh hơn</span>
              )}
            </div>

            {/* Mật khẩu */}
            <div className="register-form-field">
              <label className="register-form-label">MẬT KHẨU</label>
              <div className={`register-form-input-wrapper ${errors.password ? 'register-form-input-error' : ''}`}>
                <HiOutlineLockClosed className="register-form-icon-left" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="register-form-input register-form-input-password"
                  placeholder="Tối thiểu 8 ký tự..."
                  value={studentForm.password}
                  onChange={handleStudentChange('password')}
                />
                <button
                  type="button"
                  className="register-form-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="register-form-error-text">{errors.password}</span>}
            </div>
          </div>
        )}

        {/* Form Nhà tài trợ */}
        {activeTab === 'nhataitro' && (
          <div className="register-form">
            {/* Tên tổ chức/cá nhân */}
            <div className="register-form-field">
              <label className="register-form-label">TÊN TỔ CHỨC / CÁ NHÂN</label>
              <div className={`register-form-input-wrapper ${errors.tenToChuc ? 'register-form-input-error' : ''}`}>
                <HiOutlineBuildingOffice className="register-form-icon-left" />
                <input
                  type="text"
                  className="register-form-input"
                  placeholder="Tên tổ chức hoặc cá nhân..."
                  value={sponsorForm.tenToChuc}
                  onChange={handleSponsorChange('tenToChuc')}
                />
              </div>
              {errors.tenToChuc && <span className="register-form-error-text">{errors.tenToChuc}</span>}
            </div>

            {/* Loại nhà tài trợ */}
            <div className="register-form-field">
              <label className="register-form-label">LOẠI NHÀ TÀI TRỢ</label>
              <div className="register-form-input-wrapper register-form-select-wrapper">
                <select
                  className="register-form-select"
                  value={sponsorForm.loaiNhaTaiTro}
                  onChange={handleSponsorChange('loaiNhaTaiTro')}
                >
                  <option value="Ca nhan">Cá nhân</option>
                  <option value="To chuc">Tổ chức</option>
                  <option value="Doanh nghiep">Doanh nghiệp</option>
                  <option value="Doi tac">Đối tác</option>
                </select>
                <HiOutlineChevronDown className="register-form-select-icon" />
              </div>
            </div>

            {/* Email liên hệ */}
            <div className="register-form-field">
              <label className="register-form-label">EMAIL LIÊN HỆ</label>
              <div className={`register-form-input-wrapper ${errors.email ? 'register-form-input-error' : ''}`}>
                <HiOutlineEnvelope className="register-form-icon-left" />
                <input
                  type="email"
                  className="register-form-input"
                  placeholder="Email liên hệ chính thức..."
                  value={sponsorForm.email}
                  onChange={handleSponsorChange('email')}
                />
              </div>
              {errors.email && <span className="register-form-error-text">{errors.email}</span>}
            </div>

            {/* Số điện thoại */}
            <div className="register-form-field">
              <label className="register-form-label">SỐ ĐIỆN THOẠI</label>
              <div className={`register-form-input-wrapper ${errors.soDienThoai ? 'register-form-input-error' : ''}`}>
                <HiOutlinePhone className="register-form-icon-left" />
                <input
                  type="tel"
                  className="register-form-input"
                  placeholder="Số điện thoại liên hệ..."
                  value={sponsorForm.soDienThoai}
                  onChange={handleSponsorChange('soDienThoai')}
                />
              </div>
              {errors.soDienThoai && <span className="register-form-error-text">{errors.soDienThoai}</span>}
            </div>

            {/* Mật khẩu */}
            <div className="register-form-field">
              <label className="register-form-label">MẬT KHẨU</label>
              <div className={`register-form-input-wrapper ${errors.password ? 'register-form-input-error' : ''}`}>
                <HiOutlineLockClosed className="register-form-icon-left" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="register-form-input register-form-input-password"
                  placeholder="Tối thiểu 8 ký tự..."
                  value={sponsorForm.password}
                  onChange={handleSponsorChange('password')}
                />
                <button
                  type="button"
                  className="register-form-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="register-form-error-text">{errors.password}</span>}
            </div>
          </div>
        )}

        {/* Submit button */}
        <Button
          variant="primary"
          size="lg"
          loading={loading}
          onClick={handleSubmit}
          className="register-form-submit"
        >
          ĐĂNG KÝ NGAY
        </Button>
      </div>
    </div>
  );
};

RegisterForm.propTypes = {
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
};

export default RegisterForm;
