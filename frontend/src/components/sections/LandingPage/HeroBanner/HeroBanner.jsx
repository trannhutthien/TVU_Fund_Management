import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { 
  HiOutlineCheckCircle, 
  HiOutlineBanknotes, 
  HiOutlineHeart 
} from 'react-icons/hi2';
import Button from '@components/common/Button';
import StatCard from '@components/common/Card/StatCard';
import StudentShowcase from '@components/common/StudentShowcase';
import statisticsService from '@services/statisticsService';
import useAuthStore from '@stores/authStore';
import khuonVienImage from '@assets/images/khuonVienTruong.png';
import styles from './HeroBanner.module.scss';

/**
 * HeroBanner Component
 * 
 * Banner chính ở đầu trang Landing Page
 * Hiển thị thông điệp chính, CTA buttons, và hình ảnh minh họa
 * 
 * @param {function} onLoginClick - Callback khi click nút "Đăng nhập ngay"
 * @param {function} onRegisterClick - Callback khi click nút "Đăng ký ngay"
 */
const HeroBanner = ({ onLoginClick, onRegisterClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState({
    supportedRequests: 0,
    totalFundAmount: 0,
    totalDonors: 0,
  });
  const [loading, setLoading] = useState(true);

  // Mock data cho student showcase - Sau này sẽ fetch từ API
  const studentImages = [
    // Tạm thời để empty array, sau này sẽ fetch từ API
    // {
    //   id: 1,
    //   url: '/path/to/student1.jpg',
    //   alt: 'Sinh viên được hỗ trợ',
    //   studentName: 'Nguyễn Văn A',
    //   major: 'Công nghệ thông tin'
    // },
  ];

  const showcaseStats = {
    successRate: 98,
    activeFunds: 12,
  };

  // Fetch statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await statisticsService.getPublicStats();
        setStats({
          supportedRequests: data.supportedRequests,
          totalFundAmount: data.totalFundAmount,
          totalDonors: data.totalDonors,
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Fallback to default values
        setStats({
          supportedRequests: 0,
          totalFundAmount: 0,
          totalDonors: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Format number with thousand separators
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Format currency (VNĐ)
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0';
    
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} triệu`;
    }
    return formatNumber(amount);
  };

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
            {!isAuthenticated && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleLoginClick}
              >
                Đăng nhập ngay
              </Button>
            )}
            <Button
              variant="primary"
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

          {/* Stats - 3 StatCard */}
          <div className={styles.stats}>
            <StatCard
              title="Sinh viên được hỗ trợ"
              value={formatNumber(stats.supportedRequests)}
              icon={<HiOutlineCheckCircle />}
              iconBgColor="green"
              loading={loading}
              className={styles.statCard}
            />
            <StatCard
              title="Tổng giá trị hỗ trợ"
              value={`${formatCurrency(stats.totalFundAmount)} đ`}
              icon={<HiOutlineBanknotes />}
              iconBgColor="blue"
              loading={loading}
              className={styles.statCard}
            />
            <StatCard
              title="Nhà hảo tâm"
              value={formatNumber(stats.totalDonors)}
              icon={<HiOutlineHeart />}
              iconBgColor="red"
              loading={loading}
              className={styles.statCard}
            />
          </div>
        </div>

        {/* Right Image - Student Showcase */}
        <StudentShowcase
          images={studentImages}
          stats={showcaseStats}
          autoRotateInterval={5000}
        />
      </div>

      {/* Background Decorations */}
      <div className={styles.bgDecor1} />
      <div className={styles.bgDecor2} />
    </section>
  );
};

HeroBanner.propTypes = {
  onLoginClick: PropTypes.func,
  onRegisterClick: PropTypes.func,
};

export default HeroBanner;
