import PropTypes from 'prop-types';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import Button from '@components/common/Button';
import styles from './HDHeroSection.module.scss';

const HDHeroSection = ({ searchKeyword, setSearchKeyword }) => {
  const handleSearch = () => {
    // Scroll to FAQ section
    const faqSection = document.getElementById('faq-section');
    if (faqSection) {
      const headerHeight = 64;
      const tabHeight = 60;
      const offset = headerHeight + tabHeight;
      const faqTop = faqSection.offsetTop - offset;
      window.scrollTo({ top: faqTop, behavior: 'smooth' });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className={styles.hdHeroSection}>
      <div className={styles.container}>
        <div className={styles.label}>TRUNG TÂM HỖ TRỢ</div>
        <h1 className={styles.title}>Hướng dẫn & Quy định</h1>
        <p className={styles.description}>
          Tìm hiểu cách sử dụng hệ thống TVU Fund Management — từ đăng ký đến nhận hỗ trợ một cách dễ dàng.
        </p>
        
        <div className={styles.searchBox}>
          <HiOutlineMagnifyingGlass className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm hướng dẫn..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            className={styles.searchInput}
          />
          <Button 
            variant="primary" 
            size="sm"
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
        </div>
      </div>
    </section>
  );
};

HDHeroSection.propTypes = {
  searchKeyword: PropTypes.string.isRequired,
  setSearchKeyword: PropTypes.func.isRequired,
};

export default HDHeroSection;
