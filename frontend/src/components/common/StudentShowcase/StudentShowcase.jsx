import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './StudentShowcase.module.scss';

/**
 * StudentShowcase Component
 * 
 * Component hiển thị ảnh sinh viên được hỗ trợ với:
 * - Carousel tự động rotate ảnh
 * - Floating cards với thống kê
 * - Decorative elements
 * 
 * @param {array} images - Danh sách ảnh sinh viên: [{ id, url, alt, studentName }]
 * @param {number} autoRotateInterval - Thời gian tự động chuyển ảnh (ms), default: 5000
 * @param {object} stats - Thống kê hiển thị trên floating cards
 * @param {string} className - Custom class
 */
const StudentShowcase = ({
  images = [],
  autoRotateInterval = 5000,
  stats = {
    successRate: 98,
    activeFunds: 12,
  },
  className = '',
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto rotate images
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 300); // Transition duration
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [images.length, autoRotateInterval]);

  const currentImage = images[currentImageIndex];
  const hasImages = images.length > 0;

  const showcaseClasses = [
    styles.studentShowcase,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={showcaseClasses}>
      <div className={styles.imageContainer}>
        {/* Decorative Elements */}
        <div className={styles.decorCircle1} />
        <div className={styles.decorCircle2} />
        <div className={styles.decorCircle3} />

        {/* Main Image */}
        <div className={styles.mainImage}>
          {hasImages ? (
            <div
              className={`${styles.imageContent} ${
                isTransitioning ? styles.transitioning : ''
              }`}
            >
              <img
                src={currentImage.url}
                alt={currentImage.alt || `Sinh viên ${currentImage.studentName}`}
                className={styles.studentImage}
              />
              
              {/* Image overlay with student info */}
              {currentImage.studentName && (
                <div className={styles.imageOverlay}>
                  <p className={styles.studentName}>{currentImage.studentName}</p>
                  {currentImage.major && (
                    <p className={styles.studentMajor}>{currentImage.major}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Placeholder khi chưa có ảnh
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderIcon}>🎓</span>
              <p className={styles.placeholderText}>
                Hình ảnh sinh viên
                <br />
                hoặc khuôn viên TVU
              </p>
            </div>
          )}

          {/* Image indicators */}
          {images.length > 1 && (
            <div className={styles.imageIndicators}>
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${
                    index === currentImageIndex ? styles.active : ''
                  }`}
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setCurrentImageIndex(index);
                      setIsTransitioning(false);
                    }, 300);
                  }}
                  aria-label={`Xem ảnh ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Card 1 - Success Rate */}
        <div className={`${styles.floatingCard} ${styles.card1}`}>
          <div className={styles.cardIcon}>✨</div>
          <div className={styles.cardContent}>
            <div className={styles.cardTitle}>Thành công</div>
            <div className={styles.cardValue}>{stats.successRate}%</div>
          </div>
        </div>

        {/* Floating Card 2 - Active Funds */}
        <div className={`${styles.floatingCard} ${styles.card2}`}>
          <div className={styles.cardIcon}>💰</div>
          <div className={styles.cardContent}>
            <div className={styles.cardTitle}>Quỹ đang hoạt động</div>
            <div className={styles.cardValue}>{stats.activeFunds}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

StudentShowcase.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      url: PropTypes.string.isRequired,
      alt: PropTypes.string,
      studentName: PropTypes.string,
      major: PropTypes.string,
    })
  ),
  autoRotateInterval: PropTypes.number,
  stats: PropTypes.shape({
    successRate: PropTypes.number,
    activeFunds: PropTypes.number,
  }),
  className: PropTypes.string,
};

export default StudentShowcase;
