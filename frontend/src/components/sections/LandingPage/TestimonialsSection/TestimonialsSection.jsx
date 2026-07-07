import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import {
  TestimonialCard,
  TestimonialModal,
} from '@components/common/Testimonials';
import { useSystemSettings } from '@hooks/useSystemSettings';
import danhGiaService from '@services/danhGiaService';
import styles from './TestimonialsSection.module.scss';

const DISPLAY_SIZE = 3;

const TestimonialsSection = () => {
  const navigate = useNavigate();
  const { settings } = useSystemSettings();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await danhGiaService.getLanding();
      if (response?.success) {
        setTestimonials(response.danhgia || response.testimonials || []);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const hasCarousel = testimonials.length > DISPLAY_SIZE;

  const visibleTestimonials = useMemo(() => {
    if (!hasCarousel) return testimonials;
    return Array.from({ length: DISPLAY_SIZE }, (_, offset) => (
      testimonials[(activeIndex + offset) % testimonials.length]
    ));
  }, [activeIndex, hasCarousel, testimonials]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <span className={styles.decoratorLine} />
            <h2 className={styles.title}>{settings?.testimonials_title || 'SINH VIÊN NÓI GÌ VỀ TVU FUND'}</h2>
          </div>
          <p className={styles.subtitle}>
            {settings?.testimonials_subtitle || 'Những chia sẻ chân thành từ sinh viên đã nhận được sự đồng hành của TVU Fund'}
          </p>
        </div>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard}>
                <div className={styles.skeletonLineWide} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
                <div className={styles.skeletonProfile} />
              </div>
            ))}
          </div>
        ) : testimonials.length > 0 ? (
          <div className={styles.carouselArea}>
            {hasCarousel && (
              <button
                type="button"
                className={`${styles.carouselButton} ${styles.carouselButtonLeft}`}
                onClick={handlePrev}
                aria-label="Xem cảm nhận trước"
              >
                <HiOutlineChevronLeft />
              </button>
            )}

            <div
              className={[
                styles.grid,
                visibleTestimonials.length < 3 && styles.gridCentered,
              ].filter(Boolean).join(' ')}
            >
              {visibleTestimonials.map((item) => (
                <TestimonialCard
                  key={item.id || item.danhGiaId}
                  testimonial={item}
                  onReadMore={setSelectedTestimonial}
                />
              ))}
            </div>

            {hasCarousel && (
              <button
                type="button"
                className={`${styles.carouselButton} ${styles.carouselButtonRight}`}
                onClick={handleNext}
                aria-label="Xem cảm nhận tiếp theo"
              >
                <HiOutlineChevronRight />
              </button>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            Chưa có cảm nhận được duyệt. Hãy là người đầu tiên chia sẻ câu chuyện của bạn.
          </div>
        )}

        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setSubmitOpen(true)}
          >
            Chia sẻ cảm nhận của bạn
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate('/testimonials')}
          >
            Xem tất cả →
          </Button>
        </div>
      </div>

      <TestimonialModal
        open={!!selectedTestimonial}
        mode="detail"
        testimonial={selectedTestimonial}
        onClose={() => setSelectedTestimonial(null)}
      />

      <TestimonialModal
        open={submitOpen}
        mode="submit"
        onClose={() => setSubmitOpen(false)}
        onSuccess={fetchTestimonials}
      />
    </section>
  );
};

export default TestimonialsSection;
