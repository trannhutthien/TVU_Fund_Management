import PropTypes from 'prop-types';
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineXCircle,
  HiOutlineArrowRightCircle,
  HiCheck,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import styles from './ReviewPanel.module.scss';

const CHECKLIST_ITEMS = [
  { key: 'dung_doi_tuong', label: 'Đúng đối tượng thụ hưởng của quỹ' },
  { key: 'giay_to_day_du', label: 'Giấy tờ đầy đủ và hợp lệ' },
  { key: 'so_tien_hop_ly', label: 'Số tiền yêu cầu trong mức cho phép' },
  { key: 'khong_trung_don', label: 'Không trùng với đơn đang xử lý khác' },
];

const MAX_NOTE = 500;

const ReviewPanel = ({
  checklist,
  onToggleChecklist,
  ghiChu,
  onGhiChuChange,
  ghiChuError,
  submitting,
  disabled,
  tickedCount,
  onApprove,
  onReject,
}) => {
  const progressPercent = (tickedCount / CHECKLIST_ITEMS.length) * 100;
  const hasGhiChu = ghiChu.trim().length > 0;
  const approveDisabled = disabled || tickedCount < 3 || !hasGhiChu;
  const rejectDisabled = disabled || !hasGhiChu;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <HiOutlineClipboardDocumentCheck className={styles.headerIcon} />
        <h2 className={styles.panelTitle}>Xét duyệt</h2>
      </div>

      <div className={styles.body}>
        <div className={styles.checklist}>
          {CHECKLIST_ITEMS.map((item) => {
            const checked = !!checklist[item.key];
            return (
              <button
                key={item.key}
                type="button"
                className={`${styles.checkItem} ${checked ? styles.checkItemActive : ''}`}
                onClick={() => onToggleChecklist?.(item.key)}
                disabled={disabled}
              >
                <span
                  className={`${styles.checkbox} ${checked ? styles.checkboxOn : ''}`}
                  aria-hidden="true"
                >
                  {checked && <HiCheck className={styles.checkIcon} />}
                </span>
                <span className={styles.checkLabel}>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.progressRow}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className={styles.progressText}>
            {tickedCount}/{CHECKLIST_ITEMS.length} mục đã xác nhận
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.noteBlock}>
          <div className={styles.noteHeader}>
            <span className={styles.noteLabel}>Ghi chú xét duyệt</span>
            <span className={styles.required}>Bắt buộc</span>
          </div>

          <textarea
            className={`${styles.textarea} ${ghiChuError ? styles.textareaError : ''}`}
            rows={4}
            value={ghiChu}
            onChange={(e) => onGhiChuChange?.(e.target.value)}
            placeholder="Nhập nhận xét, ghi chú về hồ sơ này..."
            maxLength={MAX_NOTE}
            disabled={disabled}
          />

          <div className={styles.noteFoot}>
            <span className={styles.errorText}>
              {ghiChuError || ' '}
            </span>
            <span className={styles.counter}>
              {ghiChu.length}/{MAX_NOTE}
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.actions}>
          <Button
            variant="ghost"
            className={`${styles.btnReject} ${rejectDisabled ? styles.btnRejectDisabled : ''}`}
            leftIcon={<HiOutlineXCircle />}
            disabled={rejectDisabled || submitting}
            loading={submitting}
            onClick={onReject}
          >
            Từ chối
          </Button>

          <Button
            variant="primary"
            leftIcon={<HiOutlineArrowRightCircle />}
            disabled={approveDisabled || submitting}
            loading={submitting}
            onClick={onApprove}
            title={
              approveDisabled
                ? 'Cần tick ít nhất 3/4 mục và có ghi chú'
                : undefined
            }
          >
            Chuyển duyệt →
          </Button>
        </div>

        {approveDisabled && !disabled && (
          <div className={styles.hint}>
            Cần ghi chú và tick ít nhất 3/4 mục để chuyển duyệt
          </div>
        )}
      </div>
    </section>
  );
};

ReviewPanel.propTypes = {
  checklist: PropTypes.shape({
    dung_doi_tuong: PropTypes.bool,
    giay_to_day_du: PropTypes.bool,
    so_tien_hop_ly: PropTypes.bool,
    khong_trung_don: PropTypes.bool,
  }).isRequired,
  onToggleChecklist: PropTypes.func.isRequired,
  ghiChu: PropTypes.string.isRequired,
  onGhiChuChange: PropTypes.func.isRequired,
  ghiChuError: PropTypes.string,
  submitting: PropTypes.bool,
  disabled: PropTypes.bool,
  tickedCount: PropTypes.number.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

export default ReviewPanel;
