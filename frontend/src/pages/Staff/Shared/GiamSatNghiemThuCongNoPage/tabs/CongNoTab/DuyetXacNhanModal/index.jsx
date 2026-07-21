import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineDocumentArrowUp,
} from 'react-icons/hi2';
import { formatCurrency } from '@utils/formatters';
import congNoService from '@services/congNoService';
import Button from '@components/common/Button/Button';
import styles from './index.module.scss';

const DuyetXacNhanModal = ({ data, onConfirm, onClose }) => {
  const soPhaiTra = Number(data.sotiengocphaitra) + Number(data.sotienlaiphaitra);
  const [soTienThucNhan, setSoTienThucNhan] = useState(soPhaiTra);
  const [ghiChu, setGhiChu] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [lyDoTuChoi, setLyDoTuChoi] = useState('');

  const handleConfirm = async () => {
    if (soTienThucNhan <= 0) {
      toast.error('So tien thuc nhan phai lon hon 0');
      return;
    }
    if (soTienThucNhan < soPhaiTra) {
      if (!window.confirm(`So tien nhan duoc (${formatCurrency(soTienThucNhan)}) thap hon so phai tra (${formatCurrency(soPhaiTra)}). Xac nhan tra mot phan?`)) {
        return;
      }
    }
    setSubmitting(true);
    try {
      await congNoService.confirmPayment(data.lichtrano_id, {
        soTienThucNhan,
        ghiChu: ghiChu.trim() || null,
      });
      toast.success('Xac nhan thu thanh cong');
      onConfirm();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Loi xac nhan');
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
      await congNoService.rejectPayment(data.lichtrano_id, {
        lyDoTuChoi: lyDoTuChoi.trim(),
      });
      toast.success('Da tu choi minh chung');
      onConfirm();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Loi tu choi');
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
            <h3 className={styles.title}>Xac nhan thu no</h3>
            <span className={styles.subtitle}>
              {data.nguoi_nhan_ten} — Ky {data.kythu}/{data.kyhandothang}
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
              <span className={styles.infoLabel}>Hop dong vay von</span>
              <span className={styles.infoValue}>{data.tenquy}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Ngay den han</span>
              <span className={styles.infoValue}>
                {new Date(data.ngaydenhan).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Goc phai tra</span>
              <span className={styles.infoValue}>{formatCurrency(data.sotiengocphaitra)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Lai phai tra</span>
              <span className={styles.infoValue}>{formatCurrency(data.sotienlaiphaitra)}</span>
            </div>
          </div>

          {/* Highlight */}
          <div className={styles.highlightBox}>
            <span className={styles.highlightLabel}>Tong phai tra</span>
            <span className={styles.highlightValue}>{formatCurrency(soPhaiTra)}</span>
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

          {!showReject ? (
            <>
              {/* So tien thuc nhan */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>So tien thuc nhan (VND)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  value={soTienThucNhan.toLocaleString('vi-VN')}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\./g, '').replace(/,/g, '');
                    setSoTienThucNhan(parseInt(raw) || 0);
                  }}
                />
                {soTienThucNhan < soPhaiTra && (
                  <span className={styles.warnText}>
                    Thap hon so phai tra — se danh dau la "Tra mot phan"
                  </span>
                )}
              </div>

              {/* Ghi chu */}
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
                Tu choi minh chung
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={submitting || soTienThucNhan <= 0}
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

DuyetXacNhanModal.propTypes = {
  data: PropTypes.shape({
    lichtrano_id: PropTypes.number,
    kythu: PropTypes.number,
    kyhandothang: PropTypes.number,
    ngaydenhan: PropTypes.string,
    sotiengocphaitra: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    sotienlaiphaitra: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    minhchungtrano: PropTypes.string,
    nguoi_nhan_ten: PropTypes.string,
    tenquy: PropTypes.string,
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default DuyetXacNhanModal;
