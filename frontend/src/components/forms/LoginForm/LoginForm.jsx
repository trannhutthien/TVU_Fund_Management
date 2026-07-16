import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { HiOutlineEnvelope } from 'react-icons/hi2';
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
 * Quên mật khẩu: modal overlay tự quản lý bên trong
 */
const LoginForm = ({ onGoogleLogin, onSuccess, onClose, onSwitchToRegister }) => {
  const { login: loginStore } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    remember: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const response = await authService.login({
        email: formData.identifier,
        matKhau: formData.password,
      });

      if (response.success) {
        loginStore(response.user, response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        toast.success('Đăng nhập thành công!');
        onSuccess?.();
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

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
    const serverBase = apiBase.replace(/\/api$/, '');
    window.location.href = `${serverBase}/api/auth/google`;
  };

  // Forgot password handlers
  const openForgot = () => {
    setShowForgot(true);
    setForgotSent(false);
    setForgotEmail('');
    setForgotError('');
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotSent(false);
    setForgotEmail('');
    setForgotError('');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Vui lòng nhập email');
      return;
    }
    try {
      setForgotLoading(true);
      const response = await authService.forgotPassword(forgotEmail);
      if (response.success) {
        setForgotSent(true);
        toast.success(response.message || 'Mật khẩu mới đã được gửi về email!');
      } else {
        toast.error(response.message || 'Không thể khôi phục mật khẩu');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-form-wrapper">
      <div className="login-form-overlay" />

      <div className="login-form-card">
        {onClose && (
          <CloseButton 
            onClick={onClose} 
            variant="light" 
            size="md" 
            position="top-right-inside"
            ariaLabel="Đóng"
          />
        )}

        <div className="login-form-logo">
          <Logo size="xl" variant="icon-only" animated />
        </div>

        <h1 className="login-form-title">ĐĂNG NHẬP HỆ THỐNG</h1>

        <p className="login-form-subtitle">
          Quản lý Quỹ & Tài chính | Đại học Trà Vinh
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
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

            <button
              type="button"
              className="login-form-link"
              onClick={openForgot}
            >
              Quên mật khẩu?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="login-form-submit"
          >
            ĐĂNG NHẬP
          </Button>

          <div className="login-form-divider">
            <span className="login-form-divider-line" />
            <span className="login-form-divider-text">HOẶC</span>
            <span className="login-form-divider-line" />
          </div>

          <button
            type="button"
            className="login-form-google"
            onClick={handleGoogleLogin}
          >
            <svg className="login-form-google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Đăng nhập bằng Gmail TVU</span>
          </button>
        </form>

        <div className="login-form-footer">
          <span className="login-form-footer-text">Chưa có tài khoản?</span>
          {onSwitchToRegister ? (
            <button
              type="button"
              className="login-form-footer-link"
              onClick={onSwitchToRegister}
            >
              Đăng ký ngay
            </button>
          ) : (
            <a href="/register" className="login-form-footer-link">
              Đăng ký ngay
            </a>
          )}
        </div>
      </div>

      {/* ─── FORGOT PASSWORD MODAL ─────────────────────────────── */}
      {showForgot && (
        <div className="forgot-modal-overlay" onClick={closeForgot}>
          <div className="forgot-modal-card" onClick={(e) => e.stopPropagation()}>
            {forgotSent ? (
              <div className="forgot-success">
                <div className="forgot-success-icon">
                  <HiOutlineEnvelope size={40} />
                </div>
                <h2 className="forgot-success-title">Đã gửi mật khẩu mới!</h2>
                <p className="forgot-success-text">
                  Mật khẩu mới đã được gửi về email <strong>{forgotEmail}</strong>.
                  Vui lòng kiểm tra hộp thư và đăng nhập ngay.
                </p>
                <p className="forgot-success-note">
                  * Sau khi đăng nhập, vui lòng đổi mật khẩu để bảo mật tài khoản.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  className="forgot-success-btn"
                  onClick={closeForgot}
                >
                  QUAY VỀ ĐĂNG NHẬP
                </Button>
              </div>
            ) : (
              <>
                <div className="forgot-modal-header">
                  <h2 className="forgot-modal-title">QUÊN MẬT KHẨU</h2>
                  <p className="forgot-modal-subtitle">
                    Nhập email đăng nhập để nhận mật khẩu mới
                  </p>
                </div>

                <form className="forgot-form" onSubmit={handleForgotSubmit}>
                  <div className="forgot-field">
                    <Input
                      label="EMAIL ĐĂNG NHẬP"
                      type="email"
                      placeholder="Nhập email của bạn..."
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (forgotError) setForgotError('');
                      }}
                      error={!!forgotError}
                      errorMessage={forgotError}
                      leftIcon={
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={forgotLoading}
                    className="forgot-submit"
                  >
                    GỬI MẬT KHẨU MỚI
                  </Button>

                  <div className="forgot-back">
                    <button
                      type="button"
                      className="forgot-back-link"
                      onClick={closeForgot}
                    >
                      ← Quay về đăng nhập
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

LoginForm.propTypes = {
  onGoogleLogin: PropTypes.func,
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
  onSwitchToRegister: PropTypes.func,
};

export default LoginForm;
