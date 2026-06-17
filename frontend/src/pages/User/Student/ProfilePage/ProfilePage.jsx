import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import BackgroundImage from '@components/common/BackgroundImage';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import useAuthStore from '@stores/authStore';
import { authService } from '@services/authService';
import StudentProfile from './student/StudentProfile';
import DonorProfile from './donor/DonorProfile';
import styles from './ProfilePage.module.scss';

/**
 * ProfilePage Component - Router
 *
 * Điều hướng giữa 2 loại profile:
 * - SINH_VIEN → StudentProfile
 * - NHA_TAI_TRO → DonorProfile
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, token, logout: logoutStore, updateUser } = useAuthStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user profile khi component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        const userResponse = await authService.getCurrentUser();
        if (userResponse.success && userResponse.user) {
          updateUser(userResponse.user);
        }
      } catch (error) {
        console.error('Fetch data error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, updateUser]);

  const handleLogout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      logoutStore();
      toast.success('Đăng xuất thành công!');
      navigate('/');
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isLoginModalOpen) closeLoginModal();
        if (isRegisterModalOpen) closeRegisterModal();
      }
    };

    if (isLoginModalOpen || isRegisterModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isLoginModalOpen, isRegisterModalOpen]);

  // Xác định loại người dùng
  // Hỗ trợ cả snake_case (loai_tai_khoan) và camelCase (loaiTaiKhoan)
  const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loai_nguoi_dung;
  const isDonor = userType === 'NHA_TAI_TRO';

  return (
    <div className={styles.profilePage}>
      <PublicHeader
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
      />

      <BackgroundImage overlayType="dark">
        <main className={styles.mainContent}>
          <div className={styles.container}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Đang tải thông tin...</p>
              </div>
            ) : isDonor ? (
              <DonorProfile user={user} onLogout={handleLogout} />
            ) : (
              <StudentProfile user={user} onLogout={handleLogout} />
            )}
          </div>
        </main>
      </BackgroundImage>

      <PublicFooter />

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="login-modal-overlay" onClick={closeLoginModal}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <LoginForm
              onSuccess={closeLoginModal}
              onClose={closeLoginModal}
            />
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterModalOpen && (
        <div className="register-modal-overlay" onClick={closeRegisterModal}>
          <div className="register-modal-content" onClick={(e) => e.stopPropagation()}>
            <RegisterForm
              onSuccess={closeRegisterModal}
              onClose={closeRegisterModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
