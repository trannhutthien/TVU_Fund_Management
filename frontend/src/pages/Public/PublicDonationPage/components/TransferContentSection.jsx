import { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from './TransferContentSection.module.scss';

const TransferContentSection = ({
  hoTen = '',
  soDienThoai = '',
  email = '',
  bankAccount,
  chungTuFile,
  onChungTuChange,
}) => {
  const [copied, setCopied] = useState(false);

  const transferContent = [
    hoTen.trim(),
    soDienThoai.trim(),
    email.trim(),
    '(ma giao dich)',
  ].filter(Boolean).join(' ');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(transferContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [transferContent]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File vượt quá 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Chỉ chấp nhận file ảnh (JPG, PNG)');
      return;
    }
    onChungTuChange?.(file);
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a5276" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <h4>Nội dung chuyển khoản</h4>
      </div>

      {bankAccount && (
        <div className={styles.bankInfo}>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>Ngân hàng:</span>
            <span className={styles.bankValue}>{bankAccount.tenNganHang}</span>
          </div>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>Số tài khoản:</span>
            <span className={`${styles.bankValue} ${styles.highlight}`}>{bankAccount.soTaiKhoan}</span>
          </div>
          <div className={styles.bankRow}>
            <span className={styles.bankLabel}>Chủ tài khoản:</span>
            <span className={styles.bankValue}>{bankAccount.chuTaiKhoan}</span>
          </div>
        </div>
      )}

      <div className={styles.transferContentBox}>
        <div className={styles.transferLabel}>Nội dung CK gợi ý:</div>
        <div className={styles.transferRow}>
          <code className={styles.transferCode}>{transferContent}</code>
          <button type="button" className={styles.copyBtn} onClick={handleCopy}>
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Đã copy
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      <div className={styles.warning}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p>Vui lòng chuyển khoản đúng nội dung để hệ thống tự động đối soát. Nhập mã giao dịch từ ngân hàng thay cho <strong>(ma giao dich)</strong>.</p>
      </div>

      <div className={styles.uploadSection}>
        <label className={styles.uploadLabel}>Ảnh minh chứng chuyển khoản (tùy chọn)</label>
        <p className={styles.uploadHint}>Chụp lại màn hình xác nhận chuyển khoản từ ngân hàng</p>
        <div className={styles.uploadArea}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.fileInput}
            id="chungTuInput"
          />
          {chungTuFile ? (
            <div className={styles.filePreview}>
              <img src={URL.createObjectURL(chungTuFile)} alt="Minh chứng" className={styles.previewImg} />
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{chungTuFile.name}</span>
                <span className={styles.fileSize}>{(chungTuFile.size / 1024).toFixed(1)} KB</span>
              </div>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => onChungTuChange?.(null)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <label htmlFor="chungTuInput" className={styles.uploadPlaceholder}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>Nhấn để chọn ảnh</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

TransferContentSection.displayName = 'TransferContentSection';
TransferContentSection.propTypes = {
  hoTen: PropTypes.string,
  soDienThoai: PropTypes.string,
  email: PropTypes.string,
  bankAccount: PropTypes.shape({
    tenNganHang: PropTypes.string,
    soTaiKhoan: PropTypes.string,
    chuTaiKhoan: PropTypes.string,
  }),
  chungTuFile: PropTypes.object,
  onChungTuChange: PropTypes.func,
};

export default TransferContentSection;
