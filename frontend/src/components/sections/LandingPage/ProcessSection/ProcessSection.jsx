import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUser, HiOutlineDocumentText, HiOutlineBell, HiOutlineChartBar } from 'react-icons/hi2';
import Button from '@components/common/Button';
import StatusBadge from '@components/common/StatusBadge';
import useAuthStore from '@stores/authStore';
import styles from './ProcessSection.module.scss';

// Dữ liệu 4 bước
const STEPS_DATA = [
  {
    step: 1,
    icon: HiOutlineUser,
    title: 'Đăng nhập',
    duration: '~1 phút',
    desc: 'Sử dụng tài khoản Email sinh viên TVU được cấp để bắt đầu hành trình. Hệ thống tự động xác thực danh tính sinh viên.',
    align: 'left'
  },
  {
    step: 2,
    icon: HiOutlineDocumentText,
    title: 'Tạo hồ sơ',
    duration: '~5 phút',
    desc: 'Tải lên các minh chứng cần thiết. Sử dụng AI để hoàn thiện hồ sơ nhanh chóng và chính xác nhất.',
    align: 'right'
  },
  {
    step: 3,
    icon: HiOutlineBell,
    title: 'Nhận phản hồi',
    duration: '3–5 ngày làm việc',
    desc: 'Theo dõi trạng thái xét duyệt và nhận thông báo kết quả. Kinh phí sẽ được chuyển trực tiếp vào thẻ liên kết.',
    align: 'left'
  },
  {
    step: 4,
    icon: HiOutlineChartBar,
    title: 'Theo dõi quá trình',
    duration: 'Cập nhật thời gian thực',
    desc: 'Xem toàn bộ lịch sử hỗ trợ, trạng thái từng đợt giải ngân và số tiền đã nhận trong trang cá nhân của bạn.',
    align: 'right'
  },
];

/**
 * ProcessSection Component
 * 
 * Section hiển thị quy trình 4 bước nhận hỗ trợ
 * Layout zigzag với đường nối dọc giữa các bước
 * 
 * @param {function} onLoginClick - Callback khi cần mở LoginForm (nếu chưa đăng nhập)
 */
const ProcessSection = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  // Handle "Bắt đầu ngay" button click
  const handleStartClick = () => {
    if (isAuthenticated) {
      // Đã đăng nhập → Navigate đến trang tạo đơn
      navigate('/apply');
    } else {
      // Chưa đăng nhập → Mở LoginForm
      if (onLoginClick) {
        onLoginClick();
      }
    }
  };

  // Handle "Xem hướng dẫn chi tiết" link click
  const handleGuidelineClick = (e) => {
    e.preventDefault();
    navigate('/guidelines');
  };

  return (
    <section className={styles.processSection}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.label}>QUY TRÌNH ĐơN GIẢN</div>
          <h2 className={styles.title}>Quy trình 4 bước nhận hỗ trợ</h2>
        </div>

        {/* Steps Timeline */}
        <div className={styles.timeline}>
          {STEPS_DATA.map((stepData) => {
            const Icon = stepData.icon;
            const isOdd = stepData.step % 2 !== 0;
            const colorClass = isOdd ? styles.stepBoxNavy : styles.stepBoxGold;

            return (
              <div key={stepData.step} className={styles.stepRow}>
                {/* Text bên trái (cho bước lẻ) hoặc Spacer (cho bước chẵn) */}
                <div className={`${styles.stepText} ${stepData.align === 'left' ? styles.textLeft : styles.spacer}`}>
                  {stepData.align === 'left' && (
                    <>
                      <h3 className={styles.stepTitle}>{stepData.title}</h3>
                      <StatusBadge 
                        text={stepData.duration}
                        status="pending"
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
                        status="pending"
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
            onClick={handleStartClick}
          >
            Bắt đầu ngay →
          </Button>
          <a 
            href="/guidelines" 
            onClick={handleGuidelineClick}
            className={styles.linkSecondary}
          >
            Xem hướng dẫn chi tiết
          </a>
        </div>
      </div>
    </section>
  );
};

ProcessSection.propTypes = {
  onLoginClick: PropTypes.func,
};

export default ProcessSection;
