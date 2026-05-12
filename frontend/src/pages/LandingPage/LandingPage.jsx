import { useState, useEffect } from 'react';
import { HiXMark } from 'react-icons/hi2';
import PublicHeader from '@components/layout/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter';
import HeroBanner from '@components/sections/HeroBanner';
import StatsSection from '@components/sections/StatsSection';
import LoginForm from '@components/forms/LoginForm';
import './LandingPage.scss';

/**
 * LandingPage Component
 * 
 * Trang chủ công khai cho người dùng chưa đăng nhập
 * Hiển thị thông tin về hệ thống quỹ học bổng TVU
 * Có modal đăng nhập với backdrop mờ đục
 */
const LandingPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isLoginModalOpen) {
        closeLoginModal();
      }
    };

    if (isLoginModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isLoginModalOpen]);

  return (
    <div className="landing-page">
      <PublicHeader onLoginClick={openLoginModal} />
      
      <main>
        <HeroBanner onLoginClick={openLoginModal} />
        <StatsSection />
        
        {/* Các section khác sẽ được thêm sau */}
        {/* <FeaturesSection /> */}
        {/* <FundProgressSection /> */}
        {/* <ProcessSection /> */}
        {/* <TestimonialsSection /> */}
        {/* <FAQSection /> */}
      </main>
      
      <PublicFooter />

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="login-modal-overlay" onClick={closeLoginModal}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              className="login-modal-close"
              onClick={closeLoginModal}
              aria-label="Đóng"
              title="Đóng (ESC)"
            >
              <HiXMark />
            </button>

            {/* Login Form */}
            <LoginForm onSuccess={closeLoginModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
