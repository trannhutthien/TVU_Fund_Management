import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '@components/common/Button';
import khuonVienImage from '@assets/images/khuonVienTruong.png';
import styles from './HeroBanner.module.scss';

/**
 * HeroBanner Component
 * 
 * Banner chính ở đầu trang Landing Page
 * Hiển thị thông điệp chính, CTA buttons, và hình ảnh minh họa
 * 
 * @param {function} onLoginClick - Callback khi click nút "Đăng nhập ngay"
 */
const HeroBanner = ({ onLoginClick }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate('/login');
    }
  };

  return (
    <section className={styles.heroBanner}>
      {/* Background Image */}
      <div className={styles.backgroundImage}>
        <img src={khuonVienImage} alt="Khuôn viên Đại học Trà Vinh" />
        <div className={styles.overlay} />
      </div>

      <div className={styles.container}>
        {/* Left Content */}
        <div className={styles.content}>
          {/* Badge */}
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>🎓</span>
            <span className={styles.badgeText}>Hỗ trợ sinh viên TVU</span>
          </div>

          {/* Main Heading */}
          <h1 className={styles.heading}>
            Nền tảng quản lý
            <span className={styles.highlight}> Quỹ học bổng</span>
            <br />
            Đại học Trà Vinh
          </h1>

          {/* Description */}
          <p className={styles.description}>
            Hệ thống quản lý quỹ học bổng hiện đại, minh bạch và hiệu quả. 
            Kết nối sinh viên với các cơ hội hỗ trợ tài chính, 
            giúp các em yên tâm theo đuổi ước mơ học tập.
          </p>

          {/* CTA Buttons */}
          <div className={styles.actions}>
            <Button
              variant="primary"
              size="lg"
              onClick={handleLoginClick}
            >
              Đăng nhập ngay
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                document.getElementById('about')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }}
            >
              Tìm hiểu thêm
            </Button>
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>1,200+</div>
              <div className={styles.statLabel}>Sinh viên được hỗ trợ</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <div className={styles.statValue}>15 tỷ+</div>
              <div className={styles.statLabel}>Tổng giá trị hỗ trợ</div>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <div className={styles.statValue}>50+</div>
              <div className={styles.statLabel}>Nhà hảo tâm</div>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className={styles.imageWrapper}>
          <div className={styles.imageContainer}>
            {/* Decorative Elements */}
            <div className={styles.decorCircle1} />
            <div className={styles.decorCircle2} />
            <div className={styles.decorCircle3} />

            {/* Main Image Placeholder */}
            <div className={styles.mainImage}>
              <div className={styles.imagePlaceholder}>
                <span className={styles.placeholderIcon}>🎓</span>
                <p className={styles.placeholderText}>
                  Hình ảnh sinh viên<br />
                  hoặc khuôn viên TVU
                </p>
              </div>
            </div>

            {/* Floating Card 1 - Success Story */}
            <div className={`${styles.floatingCard} ${styles.card1}`}>
              <div className={styles.cardIcon}>✨</div>
              <div className={styles.cardContent}>
                <div className={styles.cardTitle}>Thành công</div>
                <div className={styles.cardValue}>98%</div>
              </div>
            </div>

            {/* Floating Card 2 - Active Funds */}
            <div className={`${styles.floatingCard} ${styles.card2}`}>
              <div className={styles.cardIcon}>💰</div>
              <div className={styles.cardContent}>
                <div className={styles.cardTitle}>Quỹ đang hoạt động</div>
                <div className={styles.cardValue}>12</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className={styles.bgDecor1} />
      <div className={styles.bgDecor2} />
    </section>
  );
};

HeroBanner.propTypes = {
  onLoginClick: PropTypes.func,
};

export default HeroBanner;
