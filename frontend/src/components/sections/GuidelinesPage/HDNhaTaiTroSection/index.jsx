import {
  HiOutlineHandRaised,
  HiOutlineCurrencyDollar,
  HiOutlineEnvelope,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import styles from './HDNhaTaiTroSection.module.scss';

const STEPS_NTT = [
  {
    step: 1,
    icon: HiOutlineHandRaised,
    title: 'Chọn quỹ muốn đóng góp',
    desc: 'Nhà tài trợ có thể chọn quỹ công khai và bắt đầu tạo khoản quyên góp ngay với tư cách khách vãng lai, không cần đăng nhập trước.',
    time: '~3 phút',
    color: 'var(--color-primary)',
  },
  {
    step: 2,
    icon: HiOutlineCurrencyDollar,
    title: 'Nhập thông tin đóng góp',
    desc: 'Cung cấp họ tên hoặc tổ chức, email, số tiền, hình thức đóng góp và tải minh chứng chuyển khoản nếu đã thực hiện giao dịch.',
    time: '~5 phút',
    color: 'var(--color-gold)',
  },
  {
    step: 3,
    icon: HiOutlineEnvelope,
    title: 'Xác thực email OTP',
    desc: 'Hệ thống gửi mã OTP về email nhà tài trợ. Sau khi xác thực, khoản đóng góp được ghi nhận ở trạng thái chờ xác nhận giao dịch.',
    time: '15 phút hiệu lực',
    color: '#7c3aed',
  },
  {
    step: 4,
    icon: HiOutlineChartBar,
    title: 'Theo dõi đóng góp',
    desc: 'Sau khi xác thực, hệ thống tạo tài khoản theo dõi cho nhà tài trợ. Kế toán và cán bộ quản lý sẽ kiểm tra, xác nhận khoản đóng góp.',
    time: '24-48 giờ',
    color: '#10b981',
  },
];

const QUYEN_LOI = [
  'Tên và logo hiển thị trên Bảng Vàng Nhà tài trợ',
  'Nhận báo cáo sử dụng quỹ định kỳ hàng quý',
  'Giấy xác nhận đóng góp có chữ ký Ban Giám hiệu',
  'Có thể đóng góp nhanh bằng email thật mà không cần tạo tài khoản trước',
  'Tài khoản theo dõi được hệ thống tạo sau khi xác thực OTP thành công',
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

        {/* Steps */}
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
