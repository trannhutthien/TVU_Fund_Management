import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import Logo from '@components/common/Logo/Logo';
import { authService } from '@services/authService';
import './RegisterPage.scss';

/**
 * RegisterPage Component
 * 
 * Trang đăng ký tài khoản mới (Sinh viên hoặc Nhà tài trợ)
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState('sinhvien'); // 'sinhvien' | 'nhataitro'
  
  const [formData, setFormData] = useState({
    // Sinh viên
    hoTen: '',
    mssv: '',
    lopKhoa: '',
    // Nhà tài trợ
    tenToChuc: '',
    loaiNhaTaiTro: 'Ca nhan',
    // Chung
    email: '',
    soDienThoai: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (accountType === 'sinhvien') {
      if (!formData.hoTen.trim()) newErrors.hoTen = 'Vui lòng nhập họ tên';
      if (!formData.mssv.trim()) newErrors.mssv = 'Vui lòng nhập MSSV';
      if (!formData.lopKhoa.trim()) newErrors.lopKhoa = 'Vui lòng nhập lớp/khoa';
    } else {
      if (!formData.tenToChuc.trim()) newErrors.tenToChuc = 'Vui lòng nhập tên tổ chức';
      if (!formData.soDienThoai.trim()) newErrors.soDienThoai = 'Vui lòng nhập số điện thoại';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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
        loaiTaiKhoan: accountType,
        email: formData.email.trim(),
        password: formData.password,
      };

      if (accountType === 'sinhvien') {
        payload.hoTen = formData.hoTen.trim();
        payload.mssv = formData.mssv.trim();
        payload.lopKhoa = formData.lopKhoa.trim();
      } else {
        payload.tenToChuc = formData.tenToChuc.trim();
        payload.soDienThoai = formData.soDienThoai.trim();
        payload.loaiNhaTaiTro = formData.loaiNhaTaiTro;
      }

      const response = await authService.register(payload);

      if (response.success) {
        toast.success('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        toast.error(response.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Logo */}
        <div className="register-logo">
          <Logo size="xl" variant="icon-only" animated />
        </div>

        {/* Title */}
        <h1 className="register-title">ĐĂNG KÝ TÀI KHOẢN</h1>
        <p className="register-subtitle">
          Quản lý Quỹ & Tài chính | Đại học Trà Vinh
        </p>

        {/* Account Type Tabs */}
        <div className="register-tabs">
          <button
            type="button"
            className={`register-tab ${accountType === 'sinhvien' ? 'active' : ''}`}
            onClick={() => setAccountType('sinhvien')}
          >
            Sinh viên
          </button>
          <button
            type="button"
            className={`register-tab ${accountType === 'nhataitro' ? 'active' : ''}`}
            onClick={() => setAccountType('nhataitro')}
          >
            Nhà tài trợ
          </button>
        </div>

        {/* Form */}
        <form className="register-form" onSubmit={handleSubmit}>
          {accountType === 'sinhvien' ? (
            <>
              <Input
                label="HỌ VÀ TÊN"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.hoTen}
                onChange={handleChange('hoTen')}
                error={!!errors.hoTen}
                errorMessage={errors.hoTen}
              />
              <Input
                label="MÃ SỐ SINH VIÊN"
                type="text"
                placeholder="2021000000"
                value={formData.mssv}
                onChange={handleChange('mssv')}
                error={!!errors.mssv}
                errorMessage={errors.mssv}
              />
              <Input
                label="LỚP/KHOA"
                type="text"
                placeholder="CNTT K45"
                value={formData.lopKhoa}
                onChange={handleChange('lopKhoa')}
                error={!!errors.lopKhoa}
                errorMessage={errors.lopKhoa}
              />
            </>
          ) : (
            <>
              <Input
                label="TÊN TỔ CHỨC/CÁ NHÂN"
                type="text"
                placeholder="Công ty ABC"
                value={formData.tenToChuc}
                onChange={handleChange('tenToChuc')}
                error={!!errors.tenToChuc}
                errorMessage={errors.tenToChuc}
              />
              <div className="register-field">
                <label className="register-label">LOẠI NHÀ TÀI TRỢ</label>
                <select
                  className="register-select"
                  value={formData.loaiNhaTaiTro}
                  onChange={handleChange('loaiNhaTaiTro')}
                >
                  <option value="Ca nhan">Cá nhân</option>
                  <option value="To chuc">Tổ chức</option>
                  <option value="Doanh nghiep">Doanh nghiệp</option>
                  <option value="Doi tac">Đối tác</option>
                </select>
              </div>
              <Input
                label="SỐ ĐIỆN THOẠI"
                type="tel"
                placeholder="0901234567"
                value={formData.soDienThoai}
                onChange={handleChange('soDienThoai')}
                error={!!errors.soDienThoai}
                errorMessage={errors.soDienThoai}
              />
            </>
          )}

          <Input
            label="EMAIL"
            type="email"
            placeholder="example@tvu.edu.vn"
            value={formData.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            errorMessage={errors.email}
          />

          <Input
            label="MẬT KHẨU"
            type="password"
            placeholder="Tối thiểu 8 ký tự"
            value={formData.password}
            onChange={handleChange('password')}
            error={!!errors.password}
            errorMessage={errors.password}
            showPasswordToggle
          />

          <Input
            label="XÁC NHẬN MẬT KHẨU"
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword}
            showPasswordToggle
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="register-submit"
          >
            ĐĂNG KÝ
          </Button>
        </form>

        {/* Footer */}
        <div className="register-footer">
          <span className="register-footer-text">Đã có tài khoản?</span>
          <a href="/login" className="register-footer-link">
            Đăng nhập ngay
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
