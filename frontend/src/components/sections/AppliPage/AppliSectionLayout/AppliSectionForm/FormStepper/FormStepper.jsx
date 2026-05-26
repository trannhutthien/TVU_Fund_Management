import PropTypes from 'prop-types';
import styles from './FormStepper.module.scss';

/**
 * FormStepper Component
 *
 * Thanh hiển thị tiến trình 4 bước trong form tạo hồ sơ TVU Fund Management.
 * - Hiển thị nền vàng khi section hợp lệ (không có lỗi)
 * - Tự động cập nhật trạng thái dựa trên validation
 *
 * @param {Object} validationStatus - Trạng thái validation của từng bước
 *   {
 *     step1: boolean, // Thông tin quỹ hợp lệ
 *     step2: boolean, // Soạn nội dung hợp lệ
 *     step3: boolean, // Tài khoản ngân hàng hợp lệ
 *     step4: boolean  // Minh chứng hợp lệ
 *   }
 */

const STEPS = [
  { step: 1, label: 'Thông tin quỹ' },
  { step: 2, label: 'Soạn nội dung' },
  { step: 3, label: 'Tài khoản ngân hàng' },
  { step: 4, label: 'Minh chứng' },
];

const getStepStatus = (step, validationStatus) => {
  const isValid = validationStatus[`step${step}`];
  
  if (isValid) return 'completed'; // Nền vàng - hợp lệ
  return 'pending'; // Chưa hợp lệ
};

const FormStepper = ({ validationStatus = {} }) => {
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
};

export default FormStepper;
