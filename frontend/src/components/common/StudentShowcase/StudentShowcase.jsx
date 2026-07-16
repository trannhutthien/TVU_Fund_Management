import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import studentShowcaseService from '@services/studentShowcaseService';
import { formatCurrency } from '@utils/formatters';
import styles from './StudentShowcase.module.scss';

/**
 * StudentShowcase Component
 * 
 * Component hiển thị ảnh sinh viên được hỗ trợ với:
 * - Carousel tự động rotate ảnh
 * - Floating cards với thống kê
 * - Decorative elements
 * - Fetch data từ API
 * 
 * @param {number} autoRotateInterval - Thời gian tự động chuyển ảnh (ms), default: 5000
 * @param {object} stats - Thống kê hiển thị trên floating cards
 * @param {string} className - Custom class
 */
const StudentShowcase = ({
  autoRotateInterval = 5000,
  stats = {
    totalStudents: 0,
    totalAmount: 0,
  },
  className = '',
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch sinh viên nổi bật từ API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await studentShowcaseService.getPublicStudentShowcase();
        
        if (response.success && response.students) {
          // Map data từ API sang format component
          const mappedStudents = response.students.map(student => ({
            id: student.id,
            url: student.hinhAnh || '/placeholder-student.jpg',
            alt: `Sinh viên ${student.hoTen}`,
            studentName: student.hoTen,
            major: student.khoaPhong,
            achievement: student.thanhTich,
            year: student.namHoc,
            soLanHoTro: student.soLanHoTro || 1,
            tongTienHoTro: student.tongTienHoTro || 0
          }));
          setStudents(mappedStudents);
        }
      } catch (error) {
        console.error('Error fetching student showcase:', error);
        // Fallback to empty array on error
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Auto rotate images
  useEffect(() => {
    if (students.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % students.length);
        setIsTransitioning(false);
      }, 300); // Transition duration
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [students.length, autoRotateInterval]);

  const currentStudent = students[currentImageIndex];
  const hasStudents = students.length > 0;

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
          {loading ? (
            // Loading state
            <div className={styles.imagePlaceholder}>
              <span className={styles.placeholderIcon}>⏳</span>
              <p className={styles.placeholderText}>Đang tải...</p>
            </div>
          ) : hasStudents ? (
            <div
              className={`${styles.imageContent} ${
                isTransitioning ? styles.transitioning : ''
              }`}
            >
              <img
                src={currentStudent.url}
                alt={currentStudent.alt}
                className={styles.studentImage}
                onError={(e) => {
                  e.target.src = '/placeholder-student.jpg';
                }}
              />
              
              {/* Image overlay with student info */}
              <div className={styles.imageOverlay}>
                <div className={styles.infoBadge}>Sinh viên nổi bật</div>
                <p className={styles.studentName}>{currentStudent.studentName}</p>
                <div className={styles.metaRow}>
                  {currentStudent.major && (
                    <span className={styles.studentMajor}>{currentStudent.major}</span>
                  )}
                  {currentStudent.year && (
                    <span className={styles.studentYear}>• Niên khóa {currentStudent.year}</span>
                  )}
                </div>
                {currentStudent.achievement && (
                  <div className={styles.achievementContainer}>
                    <span className={styles.achievementIcon}>🏆</span>
                    <p className={styles.studentAchievement}>{currentStudent.achievement}</p>
                  </div>
                )}
              </div>
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
          {students.length > 1 && (
            <div className={styles.imageIndicators}>
              {students.map((_, index) => (
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

        {/* Floating Card 1 - Supports Count */}
        {hasStudents && currentStudent && (
          <div className={`${styles.floatingCard} ${styles.card1}`}>
            <div className={styles.cardIcon}>✨</div>
            <div className={styles.cardContent}>
              <div className={styles.cardTitle}>Hỗ trợ nhận</div>
              <div className={styles.cardValue}>
                {currentStudent.soLanHoTro || 1} lần
              </div>
            </div>
          </div>
        )}

        {/* Floating Card 2 - Support Amount */}
        {hasStudents && currentStudent && (
          <div className={`${styles.floatingCard} ${styles.card2}`}>
            <div className={styles.cardIcon}>💰</div>
            <div className={styles.cardContent}>
              <div className={styles.cardTitle}>Tổng tiền nhận</div>
              <div className={styles.cardValue}>
                {formatCurrency(currentStudent.tongTienHoTro)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

StudentShowcase.propTypes = {
  autoRotateInterval: PropTypes.number,
  stats: PropTypes.shape({
    totalStudents: PropTypes.number,
    totalAmount: PropTypes.number,
  }),
  className: PropTypes.string,
};

export default StudentShowcase;
