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

  return (
    <div className={styles.guidelinesPage}>
      <PublicHeader />
      
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
    </div>
  );
};

export default GuidelinesPage;
