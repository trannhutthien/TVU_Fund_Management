import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import Logo from '@components/common/Logo/Logo';
import CloseButton from '@components/common/CloseButton';
import { authService } from '@services/authService';
import useAuthStore from '@stores/authStore';
import './LoginForm.scss';

/**
 * LoginForm Component
 * 
 * Form đăng nhập với email/MSSV và password
 * Có logo, checkbox ghi nhớ, link quên mật khẩu, đăng nhập Google
 */
const LoginForm = ({ onGoogleLogin, onSuccess, onClose }) => {
  const { login: loginStore } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '', // Email hoặc MSSV
    password: '',
    remember: false,
  });

  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error khi user nhập
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Vui lòng nhập MSSV hoặc Email';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      
      // Gọi API login
      const response = await authService.login({
        email: formData.identifier,
        matKhau: formData.password,
      });

      if (response.success) {
        // Lưu token và user vào store
        loginStore(response.user, response.accessToken);
        
        // Lưu refresh token vào localStorage
        localStorage.setItem('refreshToken', response.refreshToken);
        
        // Hiển thị thông báo thành công
        toast.success('Đăng nhập thành công!');
        
        // Đóng modal
        onSuccess?.();
        
        // Redirect về LandingPage
        window.location.href = '/';
      } else {
        toast.error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = () => {
    onGoogleLogin?.();
  };

  return (
    <div className="login-form-wrapper">
      {/* Background overlay */}
      <div className="login-form-overlay" />

      {/* Login card */}
      <div className="login-form-card">
        {/* Close Button */}
        {onClose && (
          <CloseButton 
            onClick={onClose} 
            variant="light" 
            size="md" 
            position="top-right-inside"
            ariaLabel="Đóng"
          />
        )}

        {/* Logo */}
        <div className="login-form-logo">
          <Logo 
            size="xl" 
            variant="icon-only" 
            animated 
          />
        </div>

        {/* Title */}
        <h1 className="login-form-title">ĐĂNG NHẬP HỆ THỐNG</h1>

        {/* Subtitle */}
        <p className="login-form-subtitle">
          Quản lý Quỹ & Tài chính | Đại học Trà Vinh
        </p>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Email/MSSV Input */}
          <div className="login-form-field">
            <Input
              label="EMAIL HOẶC MÃ SỐ"
              type="text"
              placeholder="Nhập MSSV hoặc Email..."
              value={formData.identifier}
              onChange={handleChange('identifier')}
              error={!!errors.identifier}
              errorMessage={errors.identifier}
              leftIcon={
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
            />
          </div>

          {/* Password Input */}
          <div className="login-form-field">
            <Input
              label="MẬT KHẨU"
              type="password"
              placeholder="Nhập mật khẩu..."
              value={formData.password}
              onChange={handleChange('password')}
              error={!!errors.password}
              errorMessage={errors.password}
              showPasswordToggle
              leftIcon={
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              }
            />
          </div>

          {/* Remember & Forgot password */}
          <div className="login-form-options">
            <label className="login-form-checkbox">
              <input
                type="checkbox"
                checked={formData.remember}
                onChange={handleChange('remember')}
              />
              <span className="login-form-checkbox-mark" />
              <span className="login-form-checkbox-label">Ghi nhớ</span>
            </label>

            <a href="/forgot-password" className="login-form-link">
              Quên mật khẩu?
            </a>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="login-form-submit"
          >
            ĐĂNG NHẬP
          </Button>

          {/* Divider */}
          <div className="login-form-divider">
            <span className="login-form-divider-line" />
            <span className="login-form-divider-text">HOẶC</span>
            <span className="login-form-divider-line" />
          </div>

          {/* Google login button */}
          <button
            type="button"
            className="login-form-google"
            onClick={handleGoogleLogin}
          >
            <svg className="login-form-google-icon" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Đăng nhập bằng Gmail TVU</span>
          </button>
        </form>

        {/* Footer */}
        <div className="login-form-footer">
          <span className="login-form-footer-text">Chưa có tài khoản?</span>
          <a href="/register" className="login-form-footer-link">
            Đăng ký ngay
          </a>
        </div>
      </div>
    </div>
  );
};

LoginForm.propTypes = {
  onGoogleLogin: PropTypes.func,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
};

export default LoginForm;
