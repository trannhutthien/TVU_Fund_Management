import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineXMark,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import { rejectByCanBo } from '@services/proposalService';
import { formatCurrency } from '@utils/formatters';
import styles from './RejectByCanBoModal.module.scss';

const RejectByCanBoModal = ({ proposal, onClose, onSuccess }) => {
  const [lyDoTuChoi, setLyDoTuChoi] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (proposal) {
      setLyDoTuChoi('');
      setGhiChu('');
      setConfirmed(false);
      setSubmitting(false);
    }
  }, [proposal?.de_xuat_id]);

  if (!proposal) return null;

  const tongSoTien = (proposal.so_luong_suat || 0) * (proposal.so_tien_moi_suat || 0);

  const handleSubmit = async () => {
    if (!confirmed || submitting || !lyDoTuChoi.trim()) return;

    setSubmitting(true);
    try {
      await rejectByCanBo(proposal.de_xuat_id, {
        lyDoTuChoi: lyDoTuChoi.trim(),
        ghiChu: ghiChu.trim() || null,
      });

      toast.success(
        `Đã từ chối đề xuất "${proposal.ten_chuong_trinh}". Nhà tài trợ sẽ được thông báo.`
      );
      onSuccess?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Có lỗi xảy ra khi từ chối đề xuất. Vui lòng thử lại.';
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
            <HiOutlineXCircle className={styles.titleIcon} />
            Từ chối đề xuất chương trình
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
              <span className={styles.summaryLabel}>Tổng số tiền</span>
              <span className={styles.summaryAmount}>
                {formatCurrency(tongSoTien)}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Quỹ thành phần</span>
              <span className={styles.summaryValue}>
                {proposal.ten_quy_thanh_phan || '—'}
              </span>
            </div>
          </div>

          {/* Banner cảnh báo */}
          <div className={styles.warning}>
            <HiOutlineExclamationTriangle className={styles.warningIcon} />
            <div className={styles.warningText}>
              Từ chối đề xuất này sẽ chuyển trạng thái thành "Từ chối". Nhà
              tài trợ sẽ nhận được thông báo với lý do từ chối.{' '}
              <strong>Hành động này không thể hoàn tác.</strong>
            </div>
          </div>

          {/* Lý do từ chối (bắt buộc) */}
          <div className={styles.field}>
            <label className={styles.label}>
              Lý do từ chối{' '}
              <span className={styles.required}>*</span>
            </label>
            <textarea
              className={styles.textarea}
              rows={4}
              placeholder="Vui lòng nhập lý do từ chối đề xuất này (ví dụ: nội dung không phù hợp, quỹ không đủ, không đáp ứng yêu cầu...)"
              value={lyDoTuChoi}
              onChange={(e) => setLyDoTuChoi(e.target.value)}
              required
            />
            {lyDoTuChoi.trim() === '' && (
              <div className={styles.error}>Lý do từ chối là bắt buộc</div>
            )}
          </div>

          {/* Ghi chú */}
          <div className={styles.field}>
            <label className={styles.label}>Ghi chú nội bộ (không bắt buộc)</label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Ghi chú nội bộ cho cán bộ..."
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
            />
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
              Tôi xác nhận từ chối đề xuất chương trình "
              <strong>{proposal.ten_chuong_trinh}</strong>" với lý do đã nêu trên.
            </span>
          </label>
        </div>

        <footer className={styles.footer}>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            variant="danger"
            leftIcon={<HiOutlineXCircle />}
            disabled={!confirmed || !lyDoTuChoi.trim()}
            loading={submitting}
            onClick={handleSubmit}
          >
            Từ chối đề xuất
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default RejectByCanBoModal;
