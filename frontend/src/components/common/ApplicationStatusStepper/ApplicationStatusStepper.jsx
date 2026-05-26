import PropTypes from 'prop-types';
import styles from './ApplicationStatusStepper.module.scss';

/**
 * ApplicationStatusStepper Component
 *
 * Thanh hiển thị tiến trình 5 bước của đơn yêu cầu hỗ trợ
 * Dựa trên trạng thái từ database (trang_thai)
 *
 * @param {String} currentStatus - Trạng thái hiện tại từ DB
 *   Các giá trị: 'CHO_DUYET', 'DANG_XU_LY', 'CHO_GIAI_NGAN', 'DA_GIAI_NGAN', 'TU_CHOI'
 * @param {String} className - Custom class
 */

const STATUS_STEPS = [
  { 
    key: 'CHO_DUYET', 
    label: 'Chờ duyệt',
    order: 1 
  },
  { 
    key: 'DANG_XU_LY', 
    label: 'Đang xử lý',
    order: 2 
  },
  { 
    key: 'CHO_GIAI_NGAN', 
    label: 'Chờ giải ngân',
    order: 3 
  },
  { 
    key: 'DA_GIAI_NGAN', 
    label: 'Đã giải ngân',
    order: 4 
  },
  { 
    key: 'TU_CHOI', 
    label: 'Từ chối',
    order: 5,
    isRejected: true 
  },
];

const getStepStatus = (step, currentStatus) => {
  // Nếu bị từ chối
  if (currentStatus === 'TU_CHOI') {
    if (step.key === 'TU_CHOI') return 'rejected';
    return 'inactive';
  }

  // Nếu là bước từ chối nhưng status không phải TU_CHOI
  if (step.key === 'TU_CHOI') {
    return 'inactive';
  }

  // Tìm order của current status
  const currentStep = STATUS_STEPS.find(s => s.key === currentStatus);
  if (!currentStep) return 'pending';

  // So sánh order
  if (step.order < currentStep.order) return 'completed';
  if (step.order === currentStep.order) return 'active';
  return 'pending';
};

const ApplicationStatusStepper = ({ currentStatus, className = '' }) => {
  // Filter out rejected step if not rejected
  const visibleSteps = currentStatus === 'TU_CHOI' 
    ? STATUS_STEPS 
    : STATUS_STEPS.filter(s => !s.isRejected);

  const stepperClasses = [
    styles.applicationStatusStepper,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={stepperClasses}>
      {/* Title */}
      <div className={styles.stepperTitle}>
        Tiến độ hồ sơ hiện tại
      </div>
      
      {/* Steps */}
      <div className={styles.stepsContainer}>
        {visibleSteps.map((step, index) => {
        const status = getStepStatus(step, currentStatus);
        const isFirst = index === 0;
        const isLast = index === visibleSteps.length - 1;

        return (
          <div key={step.key} className={styles.stepItem}>
            {/* Hàng ngang: connector trái + circle + connector phải */}
            <div className={styles.stepRow}>
              <div
                className={[
                  styles.connector,
                  isFirst ? styles.hidden : '',
                  status === 'completed' ? styles.connectorDone : '',
                  status === 'rejected' ? styles.connectorRejected : '',
                ]
                  .join(' ')
                  .trim()}
              />
              <div className={`${styles.stepCircle} ${styles[status]}`}>
                {status === 'completed' ? '✓' : 
                 status === 'rejected' ? '✕' : 
                 index + 1}
              </div>
              <div
                className={[
                  styles.connector,
                  isLast ? styles.hidden : '',
                  status === 'completed' ? styles.connectorDone : '',
                  status === 'rejected' ? styles.connectorRejected : '',
                ]
                  .join(' ')
                  .trim()}
              />
            </div>

            {/* Label */}
            <span className={`${styles.stepLabel} ${styles[status]}`}>
              {step.label}
            </span>
          </div>
        );
      })}
      </div>
    </div>
  );
};

ApplicationStatusStepper.propTypes = {
  currentStatus: PropTypes.oneOf([
    'CHO_DUYET',
    'DANG_XU_LY',
    'CHO_GIAI_NGAN',
    'DA_GIAI_NGAN',
    'TU_CHOI',
  ]).isRequired,
  className: PropTypes.string,
};

export default ApplicationStatusStepper;
