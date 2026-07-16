import { useState, useEffect } from 'react';
import PublicHeader from '@components/layout/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter';
import BackgroundImage from '@components/common/BackgroundImage';
import HDHeroSection from '@components/sections/GuidelinesPage/HDHeroSection';
import HDTabSection from '@components/sections/GuidelinesPage/HDTabSection';
import HDSinhVienSection from '@components/sections/GuidelinesPage/HDSinhVienSection';
import HDNhaTaiTroSection from '@components/sections/GuidelinesPage/HDNhaTaiTroSection';
import HDQuyDinhSection from '@components/sections/GuidelinesPage/HDQuyDinhSection';
import HDFAQSection from '@components/sections/GuidelinesPage/HDFAQSection';
import HDContactSection from '@components/sections/GuidelinesPage/HDContactSection';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import styles from './GuidelinesPage.module.scss';

/**
 * GuidelinesPage Component
 * 
 * Trang Hướng dẫn & Quy định công khai
 * Không yêu cầu đăng nhập
 * Hướng dẫn cho 3 nhóm: Sinh viên, Nhà tài trợ, Người mới
 */
const GuidelinesPage = () => {
  const [activeTab, setActiveTab] = useState('sinh_vien'); // 'sinh_vien' | 'nha_tai_tro' | 'quy_dinh'
  const [activeFAQ, setActiveFAQ] = useState(null); // index câu hỏi đang mở
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  
  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  // Switch between modals
  const switchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const switchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  // Scroll to top khi component mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Scroll to top khi đổi tab
  useEffect(() => {
    const tabSection = document.getElementById('tab-section');
    if (tabSection) {
      const headerHeight = 64; // PublicHeader height
      const tabSectionTop = tabSection.offsetTop - headerHeight;
      window.scrollTo({ top: tabSectionTop, behavior: 'smooth' });
    }
  }, [activeTab]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isLoginModalOpen) {
          closeLoginModal();
        }
        if (isRegisterModalOpen) {
          closeRegisterModal();
        }
      }
    };

    if (isLoginModalOpen || isRegisterModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isLoginModalOpen, isRegisterModalOpen]);

  return (
    <div className={styles.guidelinesPage}>
      <PublicHeader 
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
      />
      
      <BackgroundImage overlayType="dark">
        <main>
          <HDHeroSection 
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
          />
          
          <div id="tab-section">
            <HDTabSection 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
          
          {activeTab === 'sinh_vien' && <HDSinhVienSection />}
          {activeTab === 'nha_tai_tro' && <HDNhaTaiTroSection />}
          {activeTab === 'quy_dinh' && <HDQuyDinhSection />}
          
          <HDFAQSection 
            activeFAQ={activeFAQ}
            setActiveFAQ={setActiveFAQ}
            searchKeyword={searchKeyword}
          />
          
          <HDContactSection />
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
              onSwitchToRegister={switchToRegister}
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
              onSwitchToLogin={switchToLogin}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidelinesPage;
