import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineUser, 
  HiOutlineDocumentText, 
  HiOutlineBell, 
  HiOutlineChartBar,
  HiOutlineHandRaised, 
  HiOutlineBuildingLibrary, 
  HiOutlineCurrencyDollar, 
  HiOutlineChartPie 
} from 'react-icons/hi2';
import Button from '@components/common/Button';
import StatusBadge from '@components/common/StatusBadge';
import useAuthStore from '@stores/authStore';
import styles from './CombinedProcessSection.module.scss';

// Quy trình sinh viên (bên trái)
const STUDENT_STEPS = [
  {
    step: 1,
    icon: HiOutlineUser,
    title: 'Đăng nhập',
    duration: '~1 phút',
    desc: 'Sử dụng tài khoản Email sinh viên TVU để bắt đầu hành trình.',
  },
  {
    step: 2,
    icon: HiOutlineDocumentText,
    title: 'Tạo hồ sơ',
    duration: '~5 phút',
    desc: 'Tải lên minh chứng và sử dụng AI để hoàn thiện hồ sơ.',
  },
  {
    step: 3,
    icon: HiOutlineBell,
    title: 'Nhận phản hồi',
    duration: '3–5 ngày',
    desc: 'Theo dõi trạng thái xét duyệt và nhận kết quả.',
  },
  {
    step: 4,
    icon: HiOutlineChartBar,
    title: 'Theo dõi',
    duration: 'Thời gian thực',
    desc: 'Xem lịch sử hỗ trợ và số tiền đã nhận.',
  },
];

// Quy trình nhà tài trợ (bên phải)
const DONOR_STEPS = [
  {
    step: 1,
    icon: HiOutlineHandRaised,
    title: 'Đăng ký tài trợ',
    duration: '~3 phút',
    desc: 'Đăng ký thông tin và lựa chọn quỹ muốn đóng góp.',
  },
  {
    step: 2,
    icon: HiOutlineBuildingLibrary,
    title: 'Chọn quỹ',
    duration: '~2 phút',
    desc: 'Học bổng, Hỗ trợ khẩn cấp, Nghiên cứu khoa học.',
  },
  {
    step: 3,
    icon: HiOutlineCurrencyDollar,
    title: 'Chuyển khoản',
    duration: '1–2 ngày',
    desc: 'Hệ thống tự động xác nhận khi nhận được tiền.',
  },
  {
    step: 4,
    icon: HiOutlineChartPie,
    title: 'Báo cáo',
    duration: 'Định kỳ',
    desc: 'Nhận báo cáo minh bạch về việc sử dụng kinh phí.',
  },
];

/**
 * CombinedProcessSection Component
 * 
 * Hiển thị 2 quy trình cạnh nhau:
 * - Bên trái: Quy trình sinh viên (Navy)
 * - Bên phải: Quy trình nhà tài trợ (Gold)
 */
const CombinedProcessSection = ({ onLoginClick, onContactClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  // Handle "Bắt đầu ngay" (Sinh viên)
  const handleStudentClick = () => {
    navigate('/apply?role=student');
  };

  // Handle "Trở thành nhà tài trợ" (Nhà tài trợ)
  const handleDonorClick = () => {
    navigate('/apply?role=donor');
  };

  return (
    <section className={styles.combinedProcessSection}>
      <div className={styles.container}>
        {/* Main Header */}
        <div className={styles.mainHeader}>
          <div className={styles.label}>QUY TRÌNH ĐƠN GIẢN</div>
          <h2 className={styles.mainTitle}>Hai hành trình, một sứ mệnh chung</h2>
          <p className={styles.subtitle}>
            Dù bạn là sinh viên cần hỗ trợ hay nhà tài trợ muốn đóng góp, chúng tôi đều có quy trình rõ ràng và minh bạch
          </p>
        </div>

        {/* Two Columns */}
        <div className={styles.twoColumns}>
          {/* Left Column - Student Process */}
          <div className={styles.column}>
            <div className={styles.columnHeader}>
              <h3 className={styles.columnTitle}>
                <span className={styles.iconWrapper}>👨‍🎓</span>
                Dành cho Sinh viên
              </h3>
              <p className={styles.columnDesc}>Quy trình nhận hỗ trợ 4 bước</p>
            </div>

            <div className={styles.timeline}>
              {STUDENT_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === STUDENT_STEPS.length - 1;

                return (
                  <div key={step.step} className={styles.stepItem}>
                    <div className={styles.stepLeft}>
                      <div className={`${styles.stepBox} ${styles.stepBoxNavy}`}>
                        <Icon className={styles.stepIcon} />
                        <span className={styles.stepNumberBadge}>{step.step}</span>
                      </div>
                      {!isLast && <div className={styles.connector} />}
                    </div>
                    <div className={styles.stepContent}>
                      <div className={styles.stepHeader}>
                        <h4 className={styles.stepTitle}>{step.title}</h4>
                        <StatusBadge 
                          text={step.duration}
                          status="pending"
                          className={styles.durationBadge}
                        />
                      </div>
                      <p className={styles.stepDesc}>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.columnCta}>
              <Button 
                variant="primary" 
                size="md"
                onClick={handleStudentClick}
                className={styles.ctaButton}
              >
                Bắt đầu ngay →
              </Button>
              <a 
                href="/guidelines" 
                onClick={(e) => { e.preventDefault(); navigate('/guidelines'); }}
                className={styles.linkSecondary}
              >
                Xem hướng dẫn chi tiết
              </a>
            </div>
          </div>

          {/* Right Column - Donor Process */}
          <div className={styles.column}>
            <div className={styles.columnHeader}>
              <h3 className={styles.columnTitle}>
                <span className={styles.iconWrapper}>🤝</span>
                Dành cho Nhà tài trợ
              </h3>
              <p className={styles.columnDesc}>Quy trình tài trợ 4 bước</p>
            </div>

            <div className={styles.timeline}>
              {DONOR_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === DONOR_STEPS.length - 1;

                return (
                  <div key={step.step} className={styles.stepItem}>
                    <div className={styles.stepLeft}>
                      <div className={`${styles.stepBox} ${styles.stepBoxGold}`}>
                        <Icon className={styles.stepIcon} />
                        <span className={styles.stepNumberBadge}>{step.step}</span>
                      </div>
                      {!isLast && <div className={`${styles.connector} ${styles.connectorGold}`} />}
                    </div>
                    <div className={styles.stepContent}>
                      <div className={styles.stepHeader}>
                        <h4 className={styles.stepTitle}>{step.title}</h4>
                        <StatusBadge 
                          label={step.duration}
                          variant="success"
                          showIcon={false}
                          className={styles.durationBadgeGold}
                        />
                      </div>
                      <p className={styles.stepDesc}>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.columnCta}>
              <Button 
                variant="secondary" 
                size="md"
                onClick={handleDonorClick}
                className={styles.ctaButton}
              >
                Trở thành nhà tài trợ →
              </Button>
              <a 
                href="/funds" 
                onClick={(e) => { e.preventDefault(); navigate('/funds'); }}
                className={styles.linkSecondary}
              >
                Xem danh sách quỹ
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

CombinedProcessSection.propTypes = {
  onLoginClick: PropTypes.func,
  onContactClick: PropTypes.func,
};

export default CombinedProcessSection;
