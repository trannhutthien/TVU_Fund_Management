import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineBanknotes,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import { approveLoanContract } from '@services/proposalService';
import { formatCurrency } from '@utils/formatters';
import styles from './ApproveLoanContractModal.module.scss';

const LAI_SUAT_THAM_CHIEU = 2.3;
const TY_LE_CHO_VAY = 70;
const LAI_SUAT_CHI_VAY = Math.round(LAI_SUAT_THAM_CHIEU * TY_LE_CHO_VAY) / 100;

const ApproveLoanContractModal = ({ proposal, onClose, onSuccess }) => {
  const [ghiChu, setGhiChu] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (proposal) {
      setGhiChu('');
      setConfirmed(false);
      setSubmitting(false);
    }
  }, [proposal?.de_xuat_id]);

  if (!proposal) return null;

  const tongSoTien = (proposal.so_luong_suat || 0) * (proposal.so_tien_moi_suat || 0);
  const kyHan = proposal.kyhantrano || 0;

  // Tính thông tin trả nợ (1 kỳ)
  const tongLai = Math.round(tongSoTien * (LAI_SUAT_CHI_VAY / 100) * (kyHan / 12) * 100) / 100;
  const tongTraNo = tongSoTien + tongLai;

  const handleSubmit = async () => {
    if (!confirmed || submitting) return;

    setSubmitting(true);
    try {
      await approveLoanContract(proposal.de_xuat_id, {
        ghiChu: ghiChu.trim() || null,
      });

      toast.success('Duyệt hợp đồng vay thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi duyệt hợp đồng vay:', error);
      const msg = error?.response?.data?.message || 'Không thể duyệt hợp đồng vay';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            <HiOutlineBanknotes className={styles.titleIcon} />
            Duyệt hợp đồng vay
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <HiOutlineXMark />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Thông tin đề xuất */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Thông tin đề xuất</div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Chương trình</span>
                <span className={styles.infoValue}>{proposal.ten_chuong_trinh}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Số tiền vay</span>
                <span className={styles.infoValueHighlight}>{formatCurrency(tongSoTien)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Kỳ hạn</span>
                <span className={styles.infoValue}>{kyHan} tháng</span>
              </div>
            </div>
          </div>

          {/* Thông tin lãi suất */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Thông tin lãi suất</div>
            <div className={styles.interestCalc}>
              <div className={styles.interestRow}>
                <span>Lãi suất tham chiếu:</span>
                <span className={styles.interestValue}>{LAI_SUAT_THAM_CHIEU}%/năm</span>
              </div>
              <div className={styles.interestRow}>
                <span>Tỷ lệ áp dụng:</span>
                <span className={styles.interestValue}>{TY_LE_CHO_VAY}%</span>
              </div>
              <div className={`${styles.interestRow} ${styles.interestTotal}`}>
                <span>Lãi suất thực tế:</span>
                <span className={styles.interestValueHighlight}>{LAI_SUAT_CHI_VAY}%/năm</span>
              </div>
            </div>
          </div>

          {/* Kế hoạch trả nợ */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Kế hoạch trả nợ (1 kỳ)</div>
            <div className={styles.repaymentBox}>
              <div className={styles.repaymentRow}>
                <span>Gốc:</span>
                <span>{formatCurrency(tongSoTien)}</span>
              </div>
              <div className={styles.repaymentRow}>
                <span>Lãi (toàn bộ):</span>
                <span>{formatCurrency(tongLai)}</span>
              </div>
              <div className={`${styles.repaymentRow} ${styles.repaymentTotal}`}>
                <span>Tổng trả:</span>
                <span className={styles.interestValueHighlight}>{formatCurrency(tongTraNo)}</span>
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Ghi chú (tùy chọn)</div>
            <textarea
              className={styles.textarea}
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Nhập ghi chú cho bước duyệt hợp đồng..."
              rows={3}
            />
          </div>

          {/* Confirm checkbox */}
          <label className={styles.confirmLabel}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className={styles.confirmCheckbox}
            />
            <span>Tôi đã kiểm tra thông tin hợp đồng vay và xác nhận duyệt</span>
          </label>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!confirmed || submitting}
            loading={submitting}
          >
            <HiOutlineCheckCircle />
            Duyệt hợp đồng vay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApproveLoanContractModal;
