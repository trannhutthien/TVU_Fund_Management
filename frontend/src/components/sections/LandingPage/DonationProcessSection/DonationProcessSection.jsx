import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineHandRaised, 
  HiOutlineBuildingLibrary, 
  HiOutlineCurrencyDollar, 
  HiOutlineChartPie 
} from 'react-icons/hi2';
import Button from '@components/common/Button';
import StatusBadge from '@components/common/StatusBadge';
import useAuthStore from '@stores/authStore';
import styles from './DonationProcessSection.module.scss';

// Dữ liệu 4 bước quy trình tài trợ
const DONATION_STEPS = [
  {
    step: 1,
    icon: HiOutlineHandRaised,
    title: 'Đăng ký tài trợ',
    duration: '~3 phút',
    desc: 'Nhà tài trợ đăng ký thông tin và lựa chọn quỹ muốn đóng góp. Hệ thống hỗ trợ nhiều hình thức tài trợ linh hoạt.',
    align: 'left'
  },
  {
    step: 2,
    icon: HiOutlineBuildingLibrary,
    title: 'Chọn quỹ hỗ trợ',
    duration: '~2 phút',
    desc: 'Lựa chọn quỹ phù hợp với mục đích tài trợ: Học bổng, Hỗ trợ khẩn cấp, Nghiên cứu khoa học, hoặc các quỹ chuyên biệt khác.',
    align: 'right'
  },
  {
    step: 3,
    icon: HiOutlineCurrencyDollar,
    title: 'Chuyển khoản',
    duration: '1–2 ngày làm việc',
    desc: 'Thực hiện chuyển khoản theo thông tin được cung cấp. Hệ thống tự động xác nhận và cập nhật trạng thái khi nhận được tiền.',
    align: 'left'
  },
  {
    step: 4,
    icon: HiOutlineChartPie,
    title: 'Theo dõi & Báo cáo',
    duration: 'Cập nhật định kỳ',
    desc: 'Nhận báo cáo minh bạch về việc sử dụng kinh phí. Xem danh sách sinh viên được hỗ trợ và tác động thực tế của khoản tài trợ.',
    align: 'right'
  },
];

/**
 * DonationProcessSection Component
 * 
 * Section hiển thị quy trình 4 bước tài trợ cho nhà tài trợ
 * Layout zigzag với đường nối dọc giữa các bước
 * 
 * @param {function} onContactClick - Callback khi cần liên hệ (mở form hoặc navigate)
 */
const DonationProcessSection = ({ onContactClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  // Handle "Trở thành nhà tài trợ" button click
  const handleBecomeDonerClick = () => {
    // Có thể navigate đến trang đăng ký nhà tài trợ hoặc mở form liên hệ
    if (onContactClick) {
      onContactClick();
    } else {
      // Fallback: scroll to footer hoặc mở modal liên hệ
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  // Handle "Xem danh sách quỹ" link click
  const handleViewFundsClick = (e) => {
    e.preventDefault();
    navigate('/funds');
  };

  return (
    <section className={styles.donationProcessSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.label}>QUY TRÌNH TÀI TRỢ</div>
          <h2 className={styles.title}>Quy trình 4 bước trở thành nhà tài trợ</h2>
          <p className={styles.subtitle}>
            Đồng hành cùng sinh viên TVU vượt qua khó khăn, hiện thực hóa ước mơ
          </p>
        </div>

        {/* Steps Timeline */}
        <div className={styles.timeline}>
          {DONATION_STEPS.map((stepData) => {
            const Icon = stepData.icon;
            const isOdd = stepData.step % 2 !== 0;
            const colorClass = isOdd ? styles.stepBoxGold : styles.stepBoxNavy;

            return (
              <div key={stepData.step} className={styles.stepRow}>
                {/* Text bên trái (cho bước lẻ) hoặc Spacer (cho bước chẵn) */}
                <div className={`${styles.stepText} ${stepData.align === 'left' ? styles.textLeft : styles.spacer}`}>
                  {stepData.align === 'left' && (
                    <>
                      <h3 className={styles.stepTitle}>{stepData.title}</h3>
                      <StatusBadge 
                        text={stepData.duration}
                        status="success"
                        className={styles.durationBadge}
                      />
                      <p className={styles.stepDesc}>{stepData.desc}</p>
                    </>
                  )}
                </div>

                {/* Ô số ở giữa */}
                <div className={`${styles.stepBox} ${colorClass}`}>
                  <Icon className={styles.stepIcon} />
                  <span className={styles.stepNumber}>{stepData.step}</span>
                </div>

                {/* Text bên phải (cho bước chẵn) hoặc Spacer (cho bước lẻ) */}
                <div className={`${styles.stepText} ${stepData.align === 'right' ? styles.textRight : styles.spacer}`}>
                  {stepData.align === 'right' && (
                    <>
                      <h3 className={styles.stepTitle}>{stepData.title}</h3>
                      <StatusBadge 
                        text={stepData.duration}
                        status="success"
                        className={styles.durationBadge}
                      />
                      <p className={styles.stepDesc}>{stepData.desc}</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div className={styles.ctaButtons}>
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleBecomeDonerClick}
          >
            Trở thành nhà tài trợ →
          </Button>
          <a 
            href="/funds" 
            onClick={handleViewFundsClick}
            className={styles.linkSecondary}
          >
            Xem danh sách quỹ
          </a>
        </div>
      </div>
    </section>
  );
};

DonationProcessSection.propTypes = {
  onContactClick: PropTypes.func,
};

export default DonationProcessSection;
