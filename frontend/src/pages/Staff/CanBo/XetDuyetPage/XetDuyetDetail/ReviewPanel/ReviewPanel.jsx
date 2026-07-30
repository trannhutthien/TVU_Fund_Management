import PropTypes from 'prop-types';
import {
  HiOutlineXCircle,
  HiOutlineCheckCircle,
  HiOutlineCurrencyDollar,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import { formatCurrency } from '@utils/formatters';
import ReviewChecklist from '../ReviewChecklist/ReviewChecklist';
import styles from './ReviewPanel.module.scss';

const MAX_NOTE = 500;

const ReviewPanel = ({
  soTienYeuCau,
  ghiChu,
  onGhiChuChange,
  ghiChuError,
  submitting,
  disabled,
  onApprove,
  onReject,
  khongDuSoDu = false,
}) => {
  const hasGhiChu = ghiChu.trim().length > 0;
  const approveDisabled = disabled || khongDuSoDu || !hasGhiChu;
  const rejectDisabled = disabled || !hasGhiChu;

  const handleAppendNote = (text) => {
    if (disabled) return;
    const current = ghiChu.trim();
    const separator = current && !current.endsWith('.') && !current.endsWith('\n') ? '. ' : '\n';
    const newNote = current ? current + separator + text : text;
    if (newNote.length <= MAX_NOTE) {
      onGhiChuChange?.(newNote);
    }
  };

  const handleRemoveNote = (text) => {
    if (disabled) return;
    let updated = ghiChu;
    if (updated.includes('. ' + text)) {
      updated = updated.replace('. ' + text, '');
    } else if (updated.includes('\n' + text)) {
      updated = updated.replace('\n' + text, '');
    } else if (updated.startsWith(text + '. ')) {
      updated = updated.slice(text.length + 2);
    } else if (updated.startsWith(text + '\n')) {
      updated = updated.slice(text.length + 1);
    } else if (updated === text) {
      updated = '';
    }
    onGhiChuChange?.(updated.trim());
  };

  return (
    <section className={styles.panel}>
      {/* Số tiền đang xét duyệt */}
      <div className={styles.amountSection}>
        <HiOutlineCurrencyDollar size={20} className={styles.amountIcon} />
        <div className={styles.amountInfo}>
          <span className={styles.amountLabel}>Số tiền xét duyệt</span>
          <span className={styles.amountValue}>{formatCurrency(soTienYeuCau)}</span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Checklist nhanh */}
      <ReviewChecklist onAppendNote={handleAppendNote} onRemoveNote={handleRemoveNote} disabled={disabled} />

      <div className={styles.divider} />

      {/* Ghi chú */}
      <div className={styles.noteBlock}>
        <div className={styles.noteHeader}>
          <span className={styles.noteLabel}>Ghi chú xét duyệt</span>
          <span className={styles.required}>Bắt buộc</span>
        </div>

        <textarea
          className={`${styles.textarea} ${ghiChuError ? styles.textareaError : ''}`}
          rows={3}
          value={ghiChu}
          onChange={(e) => onGhiChuChange?.(e.target.value)}
          placeholder="Nhập nhận xét, ghi chú về hồ sơ này..."
          maxLength={MAX_NOTE}
          disabled={disabled}
        />

        <div className={styles.noteFoot}>
          <span className={styles.errorText}>
            {ghiChuError || '\u00A0'}
          </span>
          <span className={styles.counter}>
            {ghiChu.length}/{MAX_NOTE}
          </span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Hành động */}
      <div className={styles.actions}>
        <Button
          variant="ghost"
          className={`${styles.btnReject} ${rejectDisabled ? styles.btnDisabled : ''}`}
          leftIcon={<HiOutlineXCircle />}
          disabled={rejectDisabled || submitting}
          loading={submitting}
          onClick={onReject}
        >
          Từ chối
        </Button>

        <Button
          variant="primary"
          className={`${styles.btnApprove} ${approveDisabled ? styles.btnDisabled : ''}`}
          leftIcon={<HiOutlineCheckCircle />}
          disabled={approveDisabled || submitting}
          loading={submitting}
          onClick={onApprove}
          title={
            khongDuSoDu
              ? 'Không đủ số dư quỹ để duyệt'
              : approveDisabled
                ? 'Cần nhập ghi chú để thực hiện thao tác'
                : undefined
          }
        >
          Duyệt
        </Button>
      </div>

      {khongDuSoDu && !disabled && (
        <div className={styles.blockedHint}>
          Không đủ số dư khả dụng để duyệt đơn này
        </div>
      )}

      {!khongDuSoDu && approveDisabled && !disabled && (
        <div className={styles.hint}>
          Cần nhập ghi chú để thực hiện thao tác
        </div>
      )}
    </section>
  );
};

ReviewPanel.propTypes = {
  soTienYeuCau: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  ghiChu: PropTypes.string.isRequired,
  onGhiChuChange: PropTypes.func.isRequired,
  ghiChuError: PropTypes.string,
  submitting: PropTypes.bool,
  disabled: PropTypes.bool,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  khongDuSoDu: PropTypes.bool,
};

export default ReviewPanel;
