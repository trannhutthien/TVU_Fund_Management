import { 
  HiOutlinePencilSquare, 
  HiOutlineShieldCheck, 
  HiOutlineClock 
} from 'react-icons/hi2';
import { FeatureCard } from '@components/common/Card';
import { useSystemSettings } from '@hooks/useSystemSettings';
import styles from './AISupportSection.module.scss';

const DEFAULT_FEATURES = [
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

const ICON_MAP = {
  HiOutlinePencilSquare,
  HiOutlineShieldCheck,
  HiOutlineClock,
};

/**
 * AISupportSection Component
 * 
 * Section giới thiệu các tính năng AI hỗ trợ sinh viên
 * trong quy trình nộp đơn và theo dõi hồ sơ
 */
const AISupportSection = () => {
  const { settings } = useSystemSettings();

  const featuresData = settings?.ai_features?.length
    ? settings.ai_features.map((f, i) => ({
        ...f,
        id: f.id || i + 1,
        icon: ICON_MAP[f.iconName] || DEFAULT_FEATURES[i]?.icon || HiOutlinePencilSquare,
        iconBgColor: f.iconBgColor || DEFAULT_FEATURES[i]?.iconBgColor || 'primary',
      }))
    : DEFAULT_FEATURES;

  return (
    <section className={styles.aiSupportSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.label}>{settings?.ai_label || 'CÔNG NGHỆ TIÊN PHONG'}</div>
          <h2 className={styles.title}>{settings?.ai_title || 'Hỗ trợ thông minh với công nghệ AI'}</h2>
        </div>

        {/* Features Grid */}
        <div className={styles.featuresGrid}>
          {featuresData.map((feature) => {
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
