import { memo } from 'react';
import PropTypes from 'prop-types';
import styles from './FormStepper.module.scss';

/**
 * FormStepper Component
 *
 * Thanh hiển thị tiến trình trong form TVU Fund Management.
 * - Sinh viên: 4 bước (Quỹ → Nội dung → Ngân hàng → Minh chứng)
 * - Nhà tài trợ: 2 bước (Quỹ → Minh chứng)
 * - Hiển thị nền vàng khi section hợp lệ
 *
 * @param {Object} validationStatus - Trạng thái validation của từng bước
 * @param {boolean} isDonor - True nếu là nhà tài trợ
 */

const STEPS_STUDENT = [
  { step: 1, label: 'Thông tin quỹ' },
  { step: 2, label: 'Soạn nội dung' },
  { step: 3, label: 'Tài khoản ngân hàng' },
  { step: 4, label: 'Minh chứng' },
];

const STEPS_DONOR = [
  { step: 1, label: 'Chọn quỹ' },
  { step: 2, label: 'Minh chứng chuyển khoản' },
];

const getStepStatus = (step, validationStatus) => {
  const isValid = validationStatus[`step${step}`];
  
  if (isValid) return 'completed'; // Nền vàng - hợp lệ
  return 'pending'; // Chưa hợp lệ
};

const FormStepper = ({ validationStatus = {}, isDonor = false }) => {
  const STEPS = isDonor ? STEPS_DONOR : STEPS_STUDENT;
  return (
    <div className={styles.formStepper}>
      {STEPS.map((item, index) => {
        const status = getStepStatus(item.step, validationStatus);
        const isFirst = index === 0;
        const isLast = index === STEPS.length - 1;

        return (
          <div key={item.step} className={styles.stepItem}>
            {/* Hàng ngang: connector trái + circle + connector phải */}
            <div className={styles.stepRow}>
              <div
                className={[
                  styles.connector,
                  isFirst ? styles.hidden : '',
                  status === 'completed' ? styles.connectorDone : '',
                ]
                  .join(' ')
                  .trim()}
              />
              <div className={`${styles.stepCircle} ${styles[status]}`}>
                {status === 'completed' ? '✓' : item.step}
              </div>
              <div
                className={[
                  styles.connector,
                  isLast ? styles.hidden : '',
                  status === 'completed' ? styles.connectorDone : '',
                ]
                  .join(' ')
                  .trim()}
              />
            </div>

            {/* Label */}
            <span className={`${styles.stepLabel} ${styles[status]}`}>
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

FormStepper.propTypes = {
  validationStatus: PropTypes.shape({
    step1: PropTypes.bool,
    step2: PropTypes.bool,
    step3: PropTypes.bool,
    step4: PropTypes.bool,
  }),
  isDonor: PropTypes.bool,
};

export default memo(FormStepper);
