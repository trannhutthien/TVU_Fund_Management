import { 
  HiOutlinePencilSquare, 
  HiOutlineShieldCheck, 
  HiOutlineClock 
} from 'react-icons/hi2';
import { FeatureCard } from '@components/common/Card';
import styles from './AISupportSection.module.scss';

const FEATURES_DATA = [
  {
    id: 1,
    icon: HiOutlinePencilSquare,
    title: 'AI Writing',
    description: 'Hỗ trợ sinh viên viết thư ngỏ, trình bày hoàn cảnh một cách thuyết phục và chuyên nghiệp thông qua gợi ý ngôn ngữ tối ưu.',
    iconBgColor: 'primary',
  },
  {
    id: 2,
    icon: HiOutlineShieldCheck,
    title: 'Auto-Check',
    description: 'Hệ thống tự động quét và kiểm tra tính hợp lệ của hồ sơ, thông báo ngay lập tức các thiếu sót cần bổ sung để tăng tỷ lệ duyệt.',
    iconBgColor: 'success',
  },
  {
    id: 3,
    icon: HiOutlineClock,
    title: 'Theo dõi thời gian thực',
    description: 'Theo dõi tiến độ duyệt hồ sơ minh bạch từng bước. Bạn sẽ luôn biết hồ sơ của mình đang ở giai đoạn nào trong quy trình.',
    iconBgColor: 'warning',
  },
];

/**
 * AISupportSection Component
 * 
 * Section giới thiệu các tính năng AI hỗ trợ sinh viên
 * trong quy trình nộp đơn và theo dõi hồ sơ
 */
const AISupportSection = () => {
  return (
    <section className={styles.aiSupportSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.label}>CÔNG NGHỆ TIÊN PHONG</div>
          <h2 className={styles.title}>Hỗ trợ thông minh với công nghệ AI</h2>
        </div>

        {/* Features Grid */}
        <div className={styles.featuresGrid}>
          {FEATURES_DATA.map((feature) => {
            const IconComponent = feature.icon;
            
            return (
              <FeatureCard
                key={feature.id}
                icon={<IconComponent />}
                title={feature.title}
                description={feature.description}
                iconBgColor={feature.iconBgColor}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AISupportSection;
