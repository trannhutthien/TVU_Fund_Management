import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import BackgroundImage from '@components/common/BackgroundImage';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import ProfileHeader from '@components/sections/ProfilePage/ProfileHeader';
import ProfileTabs from '@components/sections/ProfilePage/ProfileTabs';
import ProfileOverview from '@components/sections/ProfilePage/ProfileOverview';
import HistorySection from '@components/sections/ProfilePage/HistorySection';
import useAuthStore from '@stores/authStore';
import { authService } from '@services/authService';
import { bankAccountService } from '@services/bankAccountService';
import styles from './ProfilePage.module.scss';

/**
 * ProfilePage Component
 *
 * Trang thông tin cá nhân của người dùng:
 * - Thông tin cá nhân
 * - Lịch sử giao dịch
 * - Lịch sử hỗ trợ
 * - Lịch sử yêu cầu
 *
 * Chỉ hiển thị khi đã đăng nhập
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, token, logout: logoutStore, updateUser } = useAuthStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Bank accounts state
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false);

  // Profile overview state (mock data - sẽ thay bằng API sau)
  const [profileOverview, setProfileOverview] = useState({
    soHoSoDaNop: 3,
    soTaiKhoanNH: 2,
    diemTinNhiem: 'A+',
  });

  // Fetch user profile và bank accounts khi component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const userResponse = await authService.getCurrentUser();
        if (userResponse.success && userResponse.user) {
          updateUser(userResponse.user);
        }

        // Fetch bank accounts
        await fetchBankAccounts();
      } catch (error) {
        console.error('Fetch data error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, updateUser]);

  // Fetch bank accounts
  const fetchBankAccounts = async () => {
    try {
      setBankAccountsLoading(true);
      const response = await bankAccountService.getAll();
      
      if (response.success) {
        // Transform camelCase to snake_case for component compatibility
        const accounts = response.data.map(acc => ({
          tai_khoan_id: acc.taiKhoanId,
          so_tai_khoan: acc.soTaiKhoan,
          ten_ngan_hang: acc.tenNganHang,
          chu_tai_khoan: acc.chuTaiKhoan,
          la_mac_dinh: acc.laMacDinh,
        }));
        setBankAccounts(accounts);
      }
    } catch (error) {
      console.error('Fetch bank accounts error:', error);
      toast.error('Không thể tải danh sách tài khoản ngân hàng');
    } finally {
      setBankAccountsLoading(false);
    }
  };

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

  const handleEdit = () => {
    // TODO: scroll xuống tab thông tin cá nhân
  };

  // Personal info handlers
  const handleSavePersonalInfo = (infoData) => {
    // TODO: Gọi API cập nhật thông tin cá nhân
    console.log('Save personal info:', infoData);
    toast.success('Cập nhật thông tin thành công!');
  };

  // Bank account handlers
  const handleAddBankAccount = async (accountData) => {
    try {
      setBankAccountsLoading(true);
      
      // Transform snake_case to camelCase for API
      const data = {
        soTaiKhoan: accountData.so_tai_khoan,
        tenNganHang: accountData.ten_ngan_hang,
        chuTaiKhoan: accountData.chu_tai_khoan,
        laMacDinh: accountData.la_mac_dinh,
      };

      const response = await bankAccountService.create(data);

      if (response.success) {
        toast.success('Thêm tài khoản thành công!');
        // Refresh danh sách
        await fetchBankAccounts();
      } else {
        toast.error(response.message || 'Thêm tài khoản thất bại');
      }
    } catch (error) {
      console.error('Add bank account error:', error);
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi thêm tài khoản';
      toast.error(errorMessage);
    } finally {
      setBankAccountsLoading(false);
    }
  };

  const handleDeleteBankAccount = async (id) => {
    try {
      setBankAccountsLoading(true);
      
      const response = await bankAccountService.delete(id);

      if (response.success) {
        toast.success('Xóa tài khoản thành công!');
        // Refresh danh sách
        await fetchBankAccounts();
      } else {
        toast.error(response.message || 'Xóa tài khoản thất bại');
      }
    } catch (error) {
      console.error('Delete bank account error:', error);
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi xóa tài khoản';
      toast.error(errorMessage);
    } finally {
      setBankAccountsLoading(false);
    }
  };

  const handleSetDefaultBankAccount = async (id) => {
    try {
      const response = await bankAccountService.setDefault(id);

      if (response.success) {
        toast.success('Đã đặt làm tài khoản mặc định!');
        // Refresh danh sách
        await fetchBankAccounts();
      } else {
        toast.error(response.message || 'Đặt mặc định thất bại');
      }
    } catch (error) {
      console.error('Set default bank account error:', error);
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi';
      toast.error(errorMessage);
    }
  };

  // Check if user is SINH_VIEN
  const isSinhVien = user?.vaiTro === 4 && user?.loaiTaiKhoan === 'SINH_VIEN';
  
  // Debug: Log user data để kiểm tra (xóa sau khi debug xong)
  useEffect(() => {
    if (user) {
      console.log('User data:', user);
      console.log('vaiTro:', user.vaiTro);
      console.log('loaiTaiKhoan:', user.loaiTaiKhoan);
      console.log('isSinhVien:', isSinhVien);
    }
  }, [user, isSinhVien]);

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
            ) : (
              <>
                {/* Profile Header - Full width */}
                <ProfileHeader
                  user={user}
                  onEdit={handleEdit}
                  onLogout={handleLogout}
                />

                {/* Profile Tabs - Thông tin cá nhân & Tài khoản ngân hàng */}
                <div className={styles.tabSection}>
                  <ProfileTabs
                    user={user}
                    onSaveInfo={handleSavePersonalInfo}
                    bankAccounts={bankAccounts}
                    onSaveBankAccount={handleAddBankAccount}
                    onDeleteBankAccount={handleDeleteBankAccount}
                    onSetDefaultBank={handleSetDefaultBankAccount}
                    loading={bankAccountsLoading}
                  />
                </div>

                {/* Profile Overview - Nằm dưới ProfileTabs */}
                <div className={styles.overviewSection}>
                  <ProfileOverview
                    soHoSoDaNop={profileOverview.soHoSoDaNop}
                    soTaiKhoanNH={profileOverview.soTaiKhoanNH}
                    diemTinNhiem={profileOverview.diemTinNhiem}
                    loading={false}
                  />
                </div>

                {/* History Section - Lịch sử yêu cầu hỗ trợ */}
                <HistorySection loading={loading} />
              </>
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
