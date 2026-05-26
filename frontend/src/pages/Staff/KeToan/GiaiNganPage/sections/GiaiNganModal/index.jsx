import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  HiOutlineXMark,
  HiOutlineBanknotes,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowUpTray,
  HiOutlineDocument,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import styles from './GiaiNganModal.module.scss';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIN_REJECT_LENGTH = 20;

const formatCurrency = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';

const GiaiNganModal = ({
  type,
  request,
  detail,
  bankAccount,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const data = detail || request;
  const soTien = Number(data?.soTienYeuCau || 0);
  const fundBalance = data?.quy?.soDu ?? data?.quy?.so_du ?? 0;
  const remainingAfter = Number(fundBalance) - soTien;

  // ─── State giải ngân ──────────────────────────────────────────────────
  const [ghiChu, setGhiChu] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // ─── State từ chối ────────────────────────────────────────────────────
  const [lyDoTuChoi, setLyDoTuChoi] = useState('');

  // Reset khi đổi đơn
  useEffect(() => {
    setGhiChu('');
    setFile(null);
    setLyDoTuChoi('');
  }, [request?.requestId]);

  const handleFileSelect = (f) => {
    if (!f) return;
    if (f.size > MAX_FILE_SIZE) {
      toast.error('File vượt quá 5MB');
      return;
    }
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(f.type)) {
      toast.error('Chỉ chấp nhận PNG, JPG, PDF');
      return;
    }
    setFile(f);
  };

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitGiaiNgan = () => {
    if (!file) {
      toast.error('Vui lòng tải lên minh chứng chuyển khoản');
      return;
    }
    onSubmit({ ghiChu: ghiChu.trim(), file });
  };

  const handleSubmitTuChoi = () => {
    const text = lyDoTuChoi.trim();
    if (text.length < MIN_REJECT_LENGTH) {
      toast.error(`Lý do từ chối tối thiểu ${MIN_REJECT_LENGTH} ký tự`);
      return;
    }
    onSubmit({ lyDoTuChoi: text });
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MODAL GIẢI NGÂN
  // ═══════════════════════════════════════════════════════════════════════
  if (type === 'giai_ngan') {
    const canSubmit = !!file && !isSubmitting;

    return (
      <div className={styles.overlay} onClick={onClose}>
        <div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
        >
          <header
            className={`${styles.header} ${styles.headerPrimary}`}
          >
            <div className={styles.headerTitle}>
              <HiOutlineBanknotes size={22} />
              <h2>Xác nhận giải ngân</h2>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Đóng"
              disabled={isSubmitting}
            >
              <HiOutlineXMark size={22} />
            </button>
          </header>

          <div className={styles.body}>
            {/* Tóm tắt */}
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Sinh viên</span>
                <span className={styles.summaryValue}>
                  {data?.nguoiNop?.hoTen || '—'}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Quỹ</span>
                <span className={styles.summaryValue}>
                  {data?.quy?.tenQuy || '—'}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Số tiền</span>
                <span className={styles.summaryAmount}>
                  {formatCurrency(soTien)}
                </span>
              </div>
              {bankAccount && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Tài khoản nhận</span>
                  <span className={styles.summaryValue}>
                    {bankAccount.so_tai_khoan ||
                      bankAccount.soTaiKhoan ||
                      '—'}{' '}
                    ({bankAccount.ten_ngan_hang || bankAccount.tenNganHang})
                  </span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>
                  Số dư còn lại sau khi giải ngân
                </span>
                <span
                  className={`${styles.summaryValue} ${
                    remainingAfter >= 0
                      ? styles.summaryValueOk
                      : styles.summaryValueBad
                  }`}
                >
                  {formatCurrency(remainingAfter)}
                </span>
              </div>
            </div>

            {/* Ghi chú */}
            <div className={styles.field}>
              <label className={styles.label}>
                Ghi chú{' '}
                <span className={styles.labelOptional}>(không bắt buộc)</span>
              </label>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="VD: Đã chuyển khoản qua Vietcombank lúc 10:30 ngày..."
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* Upload minh chứng */}
            <div className={styles.field}>
              <label className={styles.label}>
                Minh chứng chuyển khoản{' '}
                <span className={styles.labelRequired}>Bắt buộc</span>
              </label>

              {file ? (
                <div className={styles.filePreview}>
                  <HiOutlineDocument
                    size={22}
                    className={styles.fileIcon}
                  />
                  <div className={styles.fileInfo}>
                    <div className={styles.fileName}>{file.name}</div>
                    <div className={styles.fileSize}>
                      {(file.size / 1024).toFixed(0)} KB
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.removeFileBtn}
                    onClick={handleRemoveFile}
                    disabled={isSubmitting}
                    aria-label="Xóa file"
                  >
                    <HiOutlineXMark size={18} />
                  </button>
                </div>
              ) : (
                <div
                  className={`${styles.dropzone} ${
                    isDragging ? styles.dropzoneDragging : ''
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <HiOutlineArrowUpTray
                    size={28}
                    className={styles.dropzoneIcon}
                  />
                  <div className={styles.dropzoneText}>
                    Click hoặc kéo thả file vào đây
                  </div>
                  <div className={styles.dropzoneSub}>
                    PNG, JPG, PDF — tối đa 5MB
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,application/pdf"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <footer className={styles.footer}>
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              leftIcon={<HiOutlineBanknotes />}
              onClick={handleSubmitGiaiNgan}
              disabled={!canSubmit}
              loading={isSubmitting}
            >
              Xác nhận giải ngân
            </Button>
          </footer>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MODAL TỪ CHỐI
  // ═══════════════════════════════════════════════════════════════════════
  const trimmedLength = lyDoTuChoi.trim().length;
  const canReject = trimmedLength >= MIN_REJECT_LENGTH && !isSubmitting;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <header className={`${styles.header} ${styles.headerDanger}`}>
          <div className={styles.headerTitle}>
            <HiOutlineXCircle size={22} />
            <h2>Từ chối giải ngân</h2>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
            disabled={isSubmitting}
          >
            <HiOutlineXMark size={22} />
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.warningBox}>
            <HiOutlineExclamationTriangle
              size={18}
              className={styles.warningIcon}
            />
            <span>
              Hành động này không thể hoàn tác. Sinh viên sẽ được thông báo
              lý do từ chối.
            </span>
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>
                Lý do từ chối{' '}
                <span className={styles.labelRequired}>Bắt buộc</span>
              </label>
              <span
                className={`${styles.counter} ${
                  trimmedLength < MIN_REJECT_LENGTH
                    ? styles.counterWarning
                    : ''
                }`}
              >
                {trimmedLength}/{MIN_REJECT_LENGTH}
              </span>
            </div>
            <textarea
              className={styles.textarea}
              rows={4}
              placeholder="Nêu rõ lý do từ chối để sinh viên có thể chỉnh sửa và nộp lại..."
              value={lyDoTuChoi}
              onChange={(e) => setLyDoTuChoi(e.target.value)}
              disabled={isSubmitting}
              maxLength={500}
            />
          </div>
        </div>

        <footer className={styles.footer}>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            leftIcon={<HiOutlineXCircle />}
            onClick={handleSubmitTuChoi}
            disabled={!canReject}
            loading={isSubmitting}
            className={styles.btnDanger}
          >
            Xác nhận từ chối
          </Button>
        </footer>
      </div>
    </div>
  );
};

GiaiNganModal.propTypes = {
  type: PropTypes.oneOf(['giai_ngan', 'tu_choi']).isRequired,
  request: PropTypes.object.isRequired,
  detail: PropTypes.object,
  bankAccount: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default GiaiNganModal;
