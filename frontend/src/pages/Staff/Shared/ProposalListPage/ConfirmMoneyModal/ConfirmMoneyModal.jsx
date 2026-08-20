import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineXMark,
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import { confirmMoneyByKeToan } from '@services/proposalService';
import { formatCurrency } from '@utils/formatters';
import styles from './ConfirmMoneyModal.module.scss';

const ConfirmMoneyModal = ({ proposal, onClose, onSuccess }) => {
  const [soTienThucTe, setSoTienThucTe] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (proposal) {
      setSoTienThucTe('');
      setConfirmed(false);
      setSubmitting(false);
    }
  }, [proposal?.de_xuat_id]);

  if (!proposal) return null;

  const soTienDeXuat =
    (proposal.so_luong_suat || 0) * (proposal.so_tien_moi_suat || 0);
  const soTienThucTeNum = soTienThucTe.trim()
    ? parseFloat(soTienThucTe.replace(/,/g, ''))
    : soTienDeXuat;

  const isDifferent =
    soTienThucTe.trim() !== '' &&
    Math.abs(soTienThucTeNum - soTienDeXuat) > 0.01;

  const handleSubmit = async () => {
    if (!confirmed || submitting) return;

    setSubmitting(true);
    try {
      const payload = {};

      // Chỉ gửi số tiền thực tế nếu khác với đề xuất
      if (isDifferent) {
        payload.soTienThucTe = soTienThucTeNum;
      }

      await confirmMoneyByKeToan(proposal.de_xuat_id, payload);

      const finalAmount = isDifferent ? soTienThucTeNum : soTienDeXuat;

      toast.success(
        `Đã xác nhận nhận tiền ${formatCurrency(finalAmount)} và cộng vào quỹ ${
          proposal.ten_quy_thanh_phan
        }.`
      );
      onSuccess?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Có lỗi xảy ra khi xác nhận tiền. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            <HiOutlineBanknotes className={styles.titleIcon} />
            Xác nhận đã nhận tiền
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <HiOutlineXMark />
          </button>
        </header>

        <div className={styles.body}>
          {/* Tóm tắt đề xuất */}
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Tên chương trình</span>
              <span className={styles.summaryValue}>
                {proposal.ten_chuong_trinh}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Quỹ thành phần (cấp 2)</span>
              <span className={styles.summaryValue}>
                {proposal.ten_quy_thanh_phan || '—'}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Số tiền đề xuất</span>
              <span className={styles.summaryAmount}>
                {formatCurrency(soTienDeXuat)}
              </span>
            </div>
          </div>

          {/* Nhập số tiền thực tế (optional) */}
          <div className={styles.field}>
            <label className={styles.label}>
              Số tiền thực tế nhận được{' '}
              <span className={styles.labelHint}>(nếu khác với đề xuất)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              placeholder={`Mặc định: ${formatCurrency(soTienDeXuat)}`}
              value={soTienThucTe}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setSoTienThucTe(value);
              }}
            />
            {isDifferent && (
              <div className={styles.diffNotice}>
                ⚠️ Số tiền thực tế ({formatCurrency(soTienThucTeNum)}) khác với
                đề xuất ({formatCurrency(soTienDeXuat)})
              </div>
            )}
          </div>

          {/* Banner cảnh báo */}
          <div className={styles.warning}>
            <HiOutlineExclamationTriangle className={styles.warningIcon} />
            <div className={styles.warningText}>
              Sau khi xác nhận, hệ thống sẽ tự động CỘNG{' '}
              <strong>
                {formatCurrency(isDifferent ? soTienThucTeNum : soTienDeXuat)}
              </strong>{' '}
              vào quỹ thành phần <strong>{proposal.ten_quy_thanh_phan}</strong>.
              Đề xuất sẽ chuyển sang bước admin tạo hoạt động.{' '}
              <strong>Hành động này không thể hoàn tác.</strong>
            </div>
          </div>

          {/* Checkbox xác nhận */}
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className={styles.checkbox}
            />
            <span className={styles.checkboxLabel}>
              Tôi xác nhận đã nhận được khoản tiền{' '}
              <strong>
                {formatCurrency(isDifferent ? soTienThucTeNum : soTienDeXuat)}
              </strong>{' '}
              từ đề xuất chương trình "<strong>{proposal.ten_chuong_trinh}</strong>
              " và đồng ý cộng số tiền này vào quỹ thành phần{' '}
              <strong>{proposal.ten_quy_thanh_phan}</strong>.
            </span>
          </label>
        </div>

        <footer className={styles.footer}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            variant="primary"
            leftIcon={<HiOutlineBanknotes />}
            disabled={!confirmed}
            loading={submitting}
            onClick={handleSubmit}
          >
            Xác nhận đã nhận tiền
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmMoneyModal;
