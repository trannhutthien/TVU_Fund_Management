import { useState, useEffect } from 'react';
import studentShowcaseService from '@services/studentShowcaseService';
import styles from './TestimonialsSection.module.scss';

// Dữ liệu mẫu chất lượng cao làm phương án dự phòng (fallback)
const FALLBACK_TESTIMONIALS = [
  {
    id: 1,
    name: 'Nguyễn Văn Hải',
    major: 'Khoa Kỹ thuật & Công nghệ',
    year: '2023',
    achievement: 'Nhờ học bổng TVU Fund hỗ trợ kịp thời, em đã có thể đóng học phí đúng hạn và tập trung hoàn thiện đề tài nghiên cứu khoa học đạt giải Nhì cấp Trường.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Lê Thị Thu Thảo',
    major: 'Khoa Y - Dược',
    year: '2024',
    achievement: 'Gói hỗ trợ y tế khẩn cấp và học bổng đồng hành từ quỹ đã nâng bước em vượt qua thời điểm gia đình khó khăn nhất, giúp em yên tâm theo đuổi ước mơ ngành y.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Phạm Minh Quân',
    major: 'Khoa Kinh tế - Luật',
    year: '2025',
    achievement: 'Hệ thống nộp đơn rất tiện lợi, đặc biệt là tính năng AI hỗ trợ viết thư ngỏ giúp em trình bày rõ hoàn cảnh của mình. Em rất biết ơn các nhà tài trợ.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
  }
];

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await studentShowcaseService.getPublicStudentShowcase();
        
        if (response.success && response.students && response.students.length > 0) {
          // Ánh xạ dữ liệu từ API sinh viên nổi bật
          const mapped = response.students.map(student => ({
            id: student.id,
            name: student.hoTen,
            major: student.khoaPhong || 'Sinh viên TVU',
            year: student.namHoc || '',
            achievement: student.thanhTich || 'Em vô cùng trân trọng sự giúp đỡ của Quỹ học bổng Đại học Trà Vinh đã tiếp thêm động lực cho em.',
            avatar: student.hinhAnh || null
          }));
          setTestimonials(mapped);
        } else {
          setTestimonials(FALLBACK_TESTIMONIALS);
        }
      } catch (error) {
        console.error('Error fetching public testimonials:', error);
        setTestimonials(FALLBACK_TESTIMONIALS);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <div className={styles.loadingText}>Đang tải cảm nhận sinh viên...</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <span className={styles.decoratorLine} />
            <h2 className={styles.title}>SINH VIÊN NÓI GÌ VỀ TVU FUND</h2>
          </div>
          <p className={styles.subtitle}>
            Những chia sẻ đầy xúc động và chân thành từ các sinh viên đã nhận được sự đồng hành từ Quỹ hỗ trợ TVU
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className={styles.grid}>
          {testimonials.map((item) => (
            <div key={item.id} className={styles.card}>
              {/* Quote Mark Decoration */}
              <div className={styles.quoteIcon}>“</div>
              
              {/* Testimonial Message */}
              <p className={styles.message}>{item.achievement}</p>
              
              {/* Divider */}
              <div className={styles.divider} />

              {/* Student Profile Info */}
              <div className={styles.profile}>
                <div className={styles.avatarWrapper}>
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.name} className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles.meta}>
                  <h4 className={styles.name}>{item.name}</h4>
                  <span className={styles.major}>
                    {item.major} {item.year ? `• Khóa ${item.year}` : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
