import { useState, useEffect } from 'react';
import PublicHeader from '@components/layout/PublicHeader/PublicHeader';
import PublicFooter from '@components/layout/PublicFooter/PublicFooter';
import BackgroundImage from '@components/common/BackgroundImage';
import LoginForm from '@components/forms/LoginForm';
import RegisterForm from '@components/forms/RegisterForm';
import { 
  DonorTitleSection, 
  ImpactStatsSection,
  DonorWallSection 
} from '@components/sections/DonorsPage';
import donorService from '@services/donorService';
import styles from './DonorsPage.module.scss';

/**
 * DonorsPage Component
 * 
 * Trang Nhà tài trợ - Vinh danh các nhà hảo tâm và đối tác chiến lược
 */
const DonorsPage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [donorsData, setDonorsData] = useState({ diamond: [], gold: [], silver: [] });
  const [loadingDonors, setLoadingDonors] = useState(true);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  
  const openRegisterModal = () => setIsRegisterModalOpen(true);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  // Fetch donors data at page level
  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setLoadingDonors(true);
        const data = await donorService.getDonorWall();
        setDonorsData({
          diamond: data.diamond || [],
          gold: data.gold || [],
          silver: data.silver || []
        });
      } catch (error) {
        console.error('Error fetching donors for DonorsPage:', error);
      } finally {
        setLoadingDonors(false);
      }
    };
    fetchDonors();
  }, []);

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

  const totalWallDonors = (donorsData.diamond.length + donorsData.gold.length + donorsData.silver.length);

  return (
    <div className={styles.donorsPage}>
      <PublicHeader 
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
      />
      
      <BackgroundImage overlayType="dark">
        <main className={styles.mainContent}>
          <DonorTitleSection />
          <ImpactStatsSection totalDonors={totalWallDonors} />
          <DonorWallSection donorsData={donorsData} loading={loadingDonors} />
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

export default DonorsPage;
