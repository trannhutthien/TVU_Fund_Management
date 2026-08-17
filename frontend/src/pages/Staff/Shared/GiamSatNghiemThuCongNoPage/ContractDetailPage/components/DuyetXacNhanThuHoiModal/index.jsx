import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineDocumentArrowUp,
} from 'react-icons/hi2';
import { formatCurrency } from '@utils/formatters';
import Button from '@components/common/Button/Button';
import styles from './index.module.scss';

const DuyetXacNhanThuHoiModal = ({ data, onConfirm, onReject, onClose }) => {
  const [ghiChu, setGhiChu] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [lyDoTuChoi, setLyDoTuChoi] = useState('');

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(data.lan_nop_id, { ghiChu: ghiChu.trim() || null });
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!lyDoTuChoi.trim() || lyDoTuChoi.trim().length < 10) {
      toast.error('Ly do tu choi phai it nhat 10 ky tu');
      return;
    }
    setSubmitting(true);
    try {
      await onReject(data.lan_nop_id, { lyDoTuChoi: lyDoTuChoi.trim() });
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h3 className={styles.title}>Xac nhan tien thu hoi</h3>
            <span className={styles.subtitle}>
              Lan nop #{data.lan_nop_id}
            </span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <HiOutlineXMark size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Info grid */}
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>So tien nop</span>
              <span className={styles.infoValue}>{formatCurrency(data.sotien)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Ngay nop</span>
              <span className={styles.infoValue}>
                {data.ngaytao ? new Date(data.ngaytao).toLocaleDateString('vi-VN') : '--'}
              </span>
            </div>
          </div>

          {/* File minh chung */}
          {data.minhchungtrano && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Minh chung da nop</label>
              <a
                href={data.minhchungtrano}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.fileLink}
              >
                <HiOutlineDocumentArrowUp size={14} />
                <span>Xem minh chung</span>
              </a>
            </div>
          )}

          {data.ghichu && (
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Ghi chu nguoi nop</label>
              <span className={styles.ghiChuText}>{data.ghichu}</span>
            </div>
          )}

          {!showReject ? (
            <>
              {/* Ghi chu xac nhan */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Ghi chu xac nhan</label>
                <textarea
                  className={styles.textarea}
                  rows={2}
                  maxLength={500}
                  placeholder="Ghi chu (khong bat buoc)..."
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                />
              </div>
            </>
          ) : (
            /* Reject form */
            <div className={styles.rejectForm}>
              <div className={styles.rejectHeader}>
                <HiOutlineExclamationTriangle size={16} className={styles.rejectIcon} />
                <span className={styles.rejectTitle}>Ly do tu choi</span>
              </div>
              <textarea
                className={styles.textarea}
                rows={3}
                maxLength={500}
                placeholder="Nhap ly do tu choi (toi thieu 10 ky tu)..."
                value={lyDoTuChoi}
                onChange={(e) => setLyDoTuChoi(e.target.value)}
              />
              <span className={styles.charCount}>{lyDoTuChoi.length}/500</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {!showReject ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setShowReject(true)}
                disabled={submitting}
              >
                Tu choi
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={submitting}
                loading={submitting}
              >
                <HiOutlineCheckCircle size={15} />
                Xac nhan da thu
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => { setShowReject(false); setLyDoTuChoi(''); }}
                disabled={submitting}
              >
                Huy
              </Button>
              <Button
                variant="primary"
                onClick={handleReject}
                disabled={submitting || lyDoTuChoi.trim().length < 10}
                loading={submitting}
                className={styles.rejectSubmitBtn}
              >
                Xac nhan tu choi
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuyetXacNhanThuHoiModal;
