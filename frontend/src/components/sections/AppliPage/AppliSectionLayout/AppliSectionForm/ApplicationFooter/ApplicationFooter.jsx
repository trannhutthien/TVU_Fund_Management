import { useState } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineArchiveBox, HiOutlinePaperAirplane, HiOutlineArrowPath } from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import styles from './ApplicationFooter.module.scss';

const ApplicationFooter = ({ 
  onSaveDraft, 
  onSubmit, 
  onReset, 
  isSubmitting, 
  isSaving, 
  isFormValid,
  isDonor = false 
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    setIsChecked(false);
    setShowResetConfirm(false);
    onReset?.();
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  return (
    <div className={styles.footer}>
      {/* Confirmation Dialog */}
      {showResetConfirm && (
        <div className={styles.confirmOverlay} onClick={handleCancelReset}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIcon}>⚠️</div>
            <h3 className={styles.confirmTitle}>Xác nhận làm mới</h3>
            <p className={styles.confirmMessage}>
              Bạn có chắc chắn muốn xóa toàn bộ nội dung đã nhập? 
              Hành động này không thể hoàn tác.
            </p>
            <div className={styles.confirmActions}>
              <Button
                variant="secondary"
                onClick={handleCancelReset}
                className={styles.cancelBtn}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmReset}
                className={styles.confirmBtn}
              >
                Xóa tất cả
              </Button>
            </div>
          </div>
        </div>
      )}

      <label className={styles.commitment}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
          className={styles.checkbox}
        />
        <span className={isChecked ? styles.checkmark : styles.checkmarkEmpty} />
        <span className={styles.commitmentText}>
          {isDonor
            ? 'Tôi cam đoan thông tin quyên góp là chính xác và đã thực hiện chuyển khoản'
            : 'Tôi cam đoan những thông tin trên là đúng sự thật và chịu trách nhiệm trước nhà trường'}
        </span>
      </label>

      <div className={styles.actions}>
        <Button
          variant="ghost"
          onClick={handleResetClick}
          leftIcon={<HiOutlineArrowPath />}
          className={styles.resetBtn}
          title="Làm mới toàn bộ form"
        >
          Làm mới
        </Button>
        <Button
          variant="secondary"
          onClick={onSaveDraft}
          loading={isSaving}
          leftIcon={!isSaving ? <HiOutlineArchiveBox /> : null}
          className={styles.draftBtn}
        >
          {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
        </Button>
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={!isChecked || !isFormValid}
          loading={isSubmitting}
          leftIcon={!isSubmitting ? <HiOutlinePaperAirplane /> : null}
          className={styles.submitBtn}
        >
          {isSubmitting 
            ? 'Đang gửi...' 
            : isDonor 
              ? 'Gửi thông tin quyên góp' 
              : 'Gửi hồ sơ ngay'}
        </Button>
      </div>
    </div>
  );
};

ApplicationFooter.propTypes = {
  onSaveDraft: PropTypes.func,
  onSubmit: PropTypes.func,
  onReset: PropTypes.func,
  isSubmitting: PropTypes.bool,
  isSaving: PropTypes.bool,
  isFormValid: PropTypes.bool,
  isDonor: PropTypes.bool,
};

export default ApplicationFooter;
