import { useState, useEffect } from 'react';
import PublicHeader from '@components/layout/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter';
import HeroBanner from '@components/sections/LandingPage/HeroBanner';
import NewsSection from '@components/sections/LandingPage/NewsSection';
import FeaturedNewsSection from '@components/sections/LandingPage/FeaturedNewsSection';
import FundProgressSection from '@components/sections/LandingPage/FundProgressSection';
import AISupportSection from '@components/sections/LandingPage/AISupportSection';
import FundBreakdownSection from '@components/sections/LandingPage/FundBreakdownSection';
import CombinedProcessSection from '@components/sections/LandingPage/CombinedProcessSection';
import TestimonialsSection from '@components/sections/LandingPage/TestimonialsSection';
import DonorWallSection from '@components/sections/LandingPage/DonorWallSection';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import newsService from '@services/newsService';
import './LandingPage.scss';

/**
 * LandingPage Component
 * 
 * Trang chủ công khai cho người dùng chưa đăng nhập
 * Hiển thị thông tin về hệ thống quỹ học bổng TVU
 * Có modal đăng nhập và đăng ký với backdrop mờ đục
 */
const LandingPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [landingNews, setLandingNews] = useState(null);
  const [loadingNews, setLoadingNews] = useState(true);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  
  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  // Scroll to top khi component mount & gọi API tin tức
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const fetchLandingNews = async () => {
      try {
        setLoadingNews(true);
        const response = await newsService.getLandingNews();
        if (response.success && response.data) {
          setLandingNews(response.data);
        }
      } catch (error) {
        console.error('Error fetching landing news:', error);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchLandingNews();
  }, []);

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
    <div className="landing-page">
      <PublicHeader 
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
      />
      
      <main>
        <HeroBanner 
          onLoginClick={openLoginModal}
          onRegisterClick={openRegisterModal}
        />
        <NewsSection 
          title="TIN MỚI" 
          subtitle="Cập nhật những hoạt động mới nhất về quỹ hỗ trợ và học bổng tại Trường Đại học Trà Vinh"
          data={landingNews?.moi} 
          loading={loadingNews}
          sidebarPosition="right"
          type="moi"
        />
        <FundProgressSection />
        <FeaturedNewsSection 
          data={landingNews?.noibat} 
          loading={loadingNews}
        />
        <AISupportSection />
        <FundBreakdownSection />
        <CombinedProcessSection onLoginClick={openLoginModal} />
        <TestimonialsSection />
        <DonorWallSection onRegisterClick={openRegisterModal} />
      </main>
      
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

export default LandingPage;
