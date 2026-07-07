import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { HiOutlineEnvelope } from 'react-icons/hi2';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import { authService } from '@services/authService';
import './ForgotPasswordPage.module.scss';

/**
 * ForgotPasswordModal
 * Modal quên mật khẩu - hiển thị đè lên LoginForm
 */
const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setSent(false);
    setEmail('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.forgotPassword(email);

      if (response.success) {
        setSent(true);
        toast.success(response.message || 'Mật khẩu mới đã được gửi về email!');
      } else {
        toast.error(response.message || 'Không thể khôi phục mật khẩu');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-modal-overlay" onClick={handleClose}>
      <div className="forgot-modal-card" onClick={(e) => e.stopPropagation()}>
        {sent ? (
          /* Success state */
          <div className="forgot-success">
            <div className="forgot-success-icon">
              <HiOutlineEnvelope size={40} />
            </div>
            <h2 className="forgot-success-title">Đã gửi mật khẩu mới!</h2>
            <p className="forgot-success-text">
              Mật khẩu mới đã được gửi về email <strong>{email}</strong>.
              Vui lòng kiểm tra hộp thư và đăng nhập ngay.
            </p>
            <p className="forgot-success-note">
              * Sau khi đăng nhập, vui lòng đổi mật khẩu để bảo mật tài khoản.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="forgot-success-btn"
              onClick={handleClose}
            >
              QUAY VỀ ĐĂNG NHẬP
            </Button>
          </div>
        ) : (
          /* Form state */
          <>
            <div className="forgot-modal-header">
              <h2 className="forgot-modal-title">QUÊN MẬT KHẨU</h2>
              <p className="forgot-modal-subtitle">
                Nhập email đăng nhập để nhận mật khẩu mới
              </p>
            </div>

            <form className="forgot-form" onSubmit={handleSubmit}>
              <div className="forgot-field">
                <Input
                  label="EMAIL ĐĂNG NHẬP"
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  error={!!error}
                  errorMessage={error}
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
                loading={loading}
                className="forgot-submit"
              >
                GỬI MẬT KHẨU MỚI
              </Button>

              <div className="forgot-back">
                <button
                  type="button"
                  className="forgot-back-link"
                  onClick={handleClose}
                >
                  ← Quay về đăng nhập
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

ForgotPasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ForgotPasswordModal;
