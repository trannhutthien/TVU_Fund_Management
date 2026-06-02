import {
  HiOutlineBuildingOffice,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import styles from './HDNhaTaiTroSection.module.scss';

const STEPS_NTT = [
  {
    step: 1,
    icon: HiOutlineBuildingOffice,
    title: 'Đăng ký tài khoản',
    desc: 'Đăng ký tài khoản Nhà tài trợ với thông tin tổ chức/cá nhân. Admin sẽ xác minh thông tin trước khi kích hoạt.',
    time: '~5 phút',
    color: 'var(--color-primary)',
  },
  {
    step: 2,
    icon: HiOutlineCurrencyDollar,
    title: 'Tạo khoản tài trợ',
    desc: 'Chọn quỹ muốn hỗ trợ, nhập số tiền cam kết, tải ảnh minh chứng chuyển khoản. Cán bộ sẽ xác nhận trong 24h.',
    time: '~5 phút',
    color: 'var(--color-gold)',
  },
  {
    step: 3,
    icon: HiOutlineChartBar,
    title: 'Theo dõi tác động',
    desc: 'Xem báo cáo sử dụng quỹ, danh sách sinh viên được hỗ trợ từ đóng góp của bạn. Xuất báo cáo tác động theo yêu cầu.',
    time: 'Realtime',
    color: '#10b981',
  },
];

const QUYEN_LOI = [
  'Tên và logo hiển thị trên Bảng Vàng Nhà tài trợ',
  'Nhận báo cáo sử dụng quỹ định kỳ hàng quý',
  'Giấy xác nhận đóng góp có chữ ký Ban Giám hiệu',
  'Được vinh danh tại các sự kiện của Nhà trường',
  'Tiếp cận nguồn nhân lực chất lượng cao từ TVU',
  'Hỗ trợ tư vấn chương trình hợp tác đào tạo',
];

const HDNhaTaiTroSection = () => {
  return (
    <section className={styles.hdNhaTaiTroSection}>
      <div className={styles.container}>
        {/* Section Title */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionLine} />
          <h2 className={styles.sectionTitle}>Hướng dẫn dành cho Nhà tài trợ</h2>
          <div className={styles.sectionLine} />
        </div>

        {/* 3 Steps */}
        <div className={styles.stepsGrid}>
          {STEPS_NTT.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className={styles.stepCard}>
                <div 
                  className={styles.stepNumber}
                  style={{ 
                    background: `${step.color}20`,
                    color: step.color 
                  }}
                >
                  {step.step}
                </div>
                <Icon 
                  className={styles.stepIcon}
                  style={{ color: step.color }}
                />
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
                <div className={styles.stepTime}>
                  <HiOutlineClock size={12} />
                  <span>{step.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quyền lợi nhà tài trợ */}
        <div className={styles.benefitsCard}>
          <div className={styles.benefitsHeader}>
            <span className={styles.benefitsEmoji}>🎖️</span>
            <h3 className={styles.benefitsTitle}>Quyền lợi khi tham gia</h3>
          </div>
          
          <div className={styles.benefitsGrid}>
            {QUYEN_LOI.map((item, index) => (
              <div key={index} className={styles.benefitItem}>
                <HiOutlineCheckCircle className={styles.benefitIcon} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HDNhaTaiTroSection;
