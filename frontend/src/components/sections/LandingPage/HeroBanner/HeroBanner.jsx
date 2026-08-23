import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineCheckCircle,
  HiOutlineBanknotes,
  HiOutlineHeart,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi2';
import StatCard from '@components/common/Card/StatCard';
import statisticsService from '@services/statisticsService';
import useAuthStore from '@stores/authStore';
import { useSystemSettings } from '@hooks/useSystemSettings';
import { formatCurrencyShort } from '@utils/formatters';
import khuonVienImage from '@assets/images/khuonVienTruong.png';
import banner1 from '@assets/images/banner/DHTVHTGDVN_1781674481108_234934273.jpg';
import banner2 from '@assets/images/banner/HB-2025_1781675740918_210848626.jpg';
import banner3 from '@assets/images/banner/HB-tieuso_1781675430227_969890714.jpg';
import banner4 from '@assets/images/banner/HB4_1781667769658_17740821.jpg';
import banner5 from '@assets/images/banner/HB6_1781667620646_597845464_1783492674677_423877885.jpg';
import styles from './HeroBanner.module.scss';

const apiOrigin = () => {
  const base = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5001/api').trim();
  return base.replace(/\/api\/?$/, '');
};

const resolveImageUrl = (src) => {
  if (!src) return null;
  if (src.startsWith('http') || src.startsWith('blob:')) return src;
  return `${apiOrigin()}/${src}`;
};

const DEFAULT_LANDING_SLIDES = [
  { src: banner1, alt: 'Banner 1' },
  { src: banner2, alt: 'Banner 2' },
  { src: banner3, alt: 'Banner 3' },
  { src: banner4, alt: 'Banner 4' },
  { src: banner5, alt: 'Banner 5' },
];

const FALLBACK_SLIDE = { src: khuonVienImage, alt: 'Khuôn viên Đại học Trà Vinh' };

const HeroBanner = ({
  onLoginClick,
  variant = 'default',
  images = null,
  showStats = true,
  showLoginPrompt = true,
}) => {
  const isCompact = variant === 'compact';
  const [currentSlide, setCurrentSlide] = useState(0);
  const { settings } = useSystemSettings();
  const { isAuthenticated } = useAuthStore();

  const slides = useMemo(() => {
    if (variant === 'compact' && Array.isArray(images) && images.length > 0) {
      return images.map((img) => ({
        src: img.url || img.src,
        alt: img.alt || 'Banner',
      }));
    }
    if (variant === 'default') {
      return DEFAULT_LANDING_SLIDES;
    }
    return [FALLBACK_SLIDE];
  }, [variant, images]);

  const [stats, setStats] = useState({
    supportedRequests: 0,
    totalFundAmount: 0,
    totalDonors: 0,
    totalFunds: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await statisticsService.getPublicStats();
        if (isMounted) {
          setStats({
            supportedRequests: data.supportedRequests,
            totalFundAmount: data.totalFundAmount,
            totalDonors: data.totalDonors,
            totalFunds: data.totalFunds,
          });
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStats();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const bannerClass = isCompact ? styles.heroBannerCompact : styles.heroBanner;

  return (
    <section className={bannerClass}>
      {/* Slideshow Background */}
      <div className={styles.slidesContainer}>
        {slides.map((slide, i) => (
          <img
            key={i}
            src={slide.src}
            alt={slide.alt}
            className={`${styles.slide} ${i === currentSlide ? styles.slideActive : ''}`}
          />
        ))}
        <div className={styles.overlay} />
      </div>

      {/* Arrow Navigation */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.arrowBtn} ${styles.arrowLeft}`}
            onClick={prevSlide}
            aria-label="Ảnh trước"
          >
            <HiChevronLeft size={28} />
          </button>
          <button
            type="button"
            className={`${styles.arrowBtn} ${styles.arrowRight}`}
            onClick={nextSlide}
            aria-label="Ảnh tiếp"
          >
            <HiChevronRight size={28} />
          </button>
        </>
      )}

      {/* Content Area: Dots + Stats */}
      <div className={isCompact ? styles.contentAreaCompact : styles.contentArea}>
        {/* Dot Indicators */}
        {slides.length > 1 && (
          <div className={styles.dotIndicators}>
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.dot} ${i === currentSlide ? styles.dotActive : ''}`}
                onClick={() => goToSlide(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* 3 Stat Cards */}
        {showStats && (
          <div className={isCompact ? styles.statsBarCompact : styles.statsBar}>
            <StatCard
              title={isCompact ? 'Tổng số quỹ' : (settings?.hero_stat_sinhvien || 'Sinh viên được hỗ trợ')}
              value={isCompact ? formatNumber(stats.totalFunds) : formatNumber(stats.supportedRequests)}
              icon={isCompact ? <HiOutlineBanknotes /> : <HiOutlineCheckCircle />}
              iconBgColor="green"
              subtitle={isCompact ? 'Đang hoạt động' : (settings?.hero_stat_sinhvien_sub || 'So với năm trước')}
              loading={loading}
              className={isCompact ? styles.statCardCompact : styles.statCard}
            />
            <StatCard
              title={isCompact ? 'Đơn đã duyệt' : (settings?.hero_stat_giatri || 'Tổng giá trị hỗ trợ')}
              value={isCompact ? formatNumber(stats.supportedRequests) : `${formatCurrencyShort(stats.totalFundAmount)} đ`}
              icon={isCompact ? <HiOutlineCheckCircle /> : <HiOutlineBanknotes />}
              iconBgColor="blue"
              subtitle={isCompact ? 'Giải ngân thành công' : (settings?.hero_stat_giatri_sub || 'Tích lũy từ các quỹ')}
              loading={loading}
              className={isCompact ? styles.statCardCompact : styles.statCard}
            />
            <StatCard
              title={isCompact ? 'Tổng giá trị' : (settings?.hero_stat_nhahaotam || 'Nhà hảo tâm')}
              value={isCompact ? `${formatCurrencyShort(stats.totalFundAmount)} đ` : formatNumber(stats.totalDonors)}
              icon={isCompact ? <HiOutlineHeart /> : <HiOutlineHeart />}
              iconBgColor="red"
              subtitle={isCompact ? 'Tất cả các quỹ' : (settings?.hero_stat_nhahaotam_sub || 'Đối tác đồng hành')}
              loading={loading}
              className={isCompact ? styles.statCardCompact : styles.statCard}
            />
          </div>
        )}

        {/* Login Link for Guest Users */}
        {showLoginPrompt && !isAuthenticated && onLoginClick && (
          <div className={styles.loginPrompt}>
            <button
              type="button"
              className={styles.loginLink}
              onClick={onLoginClick}
              aria-label="Mở form đăng nhập"
            >
              Đã có tài khoản? <span className={styles.loginLinkHighlight}>Đăng nhập ngay</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

HeroBanner.propTypes = {
  onLoginClick: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'compact']),
  images: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string,
    src: PropTypes.string,
    alt: PropTypes.string,
  })),
  showStats: PropTypes.bool,
  showLoginPrompt: PropTypes.bool,
};

export default HeroBanner;
