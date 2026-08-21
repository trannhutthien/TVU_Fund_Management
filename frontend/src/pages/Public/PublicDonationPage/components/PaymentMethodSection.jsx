import { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../constants';
import { toFundBankAccount } from '@services/systemSettingsService';
import styles from './PaymentMethodSection.module.scss';

const PaymentMethodSection = ({
  hinhThuc,
  onHinhThucChange,
  publicSettings,
}) => {
  const [copiedField, setCopiedField] = useState(null);

  const defaultSponsorBank = toFundBankAccount(publicSettings?.tai_khoan_nhan_tai_tro);
  const hasDefaultSponsorBank = !!(
    defaultSponsorBank.nganHang &&
    defaultSponsorBank.soTaiKhoan &&
    defaultSponsorBank.chuTaiKhoan
  );
  const contactEmail = publicSettings?.email_ho_tro || publicSettings?.email_lien_he;

  const handleCopy = useCallback((text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }, []);

  const isOnline = hinhThuc === PAYMENT_METHODS.TRUC_TUYEN;
  const isBankTransfer = hinhThuc === PAYMENT_METHODS.CHUYEN_KHOAN;
  const isCash = hinhThuc === PAYMENT_METHODS.TIEN_MAT;

  const paymentIcons = {
    [PAYMENT_METHODS.TRUC_TUYEN]: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    [PAYMENT_METHODS.CHUYEN_KHOAN]: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9v.01" /><path d="M9 12v.01" /><path d="M9 15v.01" />
      </svg>
    ),
    [PAYMENT_METHODS.TIEN_MAT]: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a5276" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
        <h3>Phương thức đóng góp</h3>
      </div>

      <div className={styles.paymentOptions}>
        {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`${styles.paymentOption} ${hinhThuc === value ? styles.selected : ''}`}
            onClick={() => onHinhThucChange(value)}
          >
            <span className={styles.paymentIcon}>{paymentIcons[value]}</span>
            <span className={styles.paymentLabel}>{label}</span>
          </button>
        ))}
      </div>

      {/* CHI TIẾT: TRỰC TUYẾN */}
      {isOnline && (
        <div className={styles.detailsPanel}>
          <div className={styles.alertInfo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p>Thanh toán trực tuyến qua ATM nội địa, Thẻ quốc tế (Visa/Master) hoặc quét mã QR. Số tiền sẽ được xử lý tự động.</p>
          </div>
        </div>
      )}

      {/* CHI TIẾT: QUA NGÂN HÀNG */}
      {isBankTransfer && (
        <div className={styles.detailsPanel}>
          <div className={styles.alertInfo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p><strong>Hướng dẫn:</strong> Chuyển khoản theo thông tin bên dưới. Sau khi nhận tiền, cán bộ quản lý sẽ xác nhận trên hệ thống.</p>
          </div>

          {hasDefaultSponsorBank ? (
            <div className={styles.bankCard}>
              <div className={styles.bankHeader}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                  <path d="M9 9v.01" /><path d="M9 12v.01" /><path d="M9 15v.01" />
                </svg>
                <span>{defaultSponsorBank.nganHang}</span>
              </div>
              <div className={styles.bankBody}>
                <div className={styles.bankRow}>
                  <span className={styles.bankLabel}>Chủ tài khoản:</span>
                  <span className={styles.bankValue}>{defaultSponsorBank.chuTaiKhoan}</span>
                </div>
                <div className={styles.bankRow}>
                  <span className={styles.bankLabel}>Số tài khoản:</span>
                  <span className={styles.bankValue}>
                    {defaultSponsorBank.soTaiKhoan}
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => handleCopy(defaultSponsorBank.soTaiKhoan, 'soTK')}
                    >
                      {copiedField === 'soTK' ? 'Đã copy!' : 'Sao chép'}
                    </button>
                  </span>
                </div>
                {defaultSponsorBank.chiNhanh && (
                  <div className={styles.bankRow}>
                    <span className={styles.bankLabel}>Chi nhánh:</span>
                    <span className={styles.bankValue}>{defaultSponsorBank.chiNhanh}</span>
                  </div>
                )}
                <div className={styles.bankRow}>
                  <span className={styles.bankLabel}>Nội dung CK:</span>
                  <span className={styles.bankValue}>(tên nhà tài trợ) (số điện thoại) (email) (mã giao dịch) (quỹ muốn tài trợ)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.alertWarning}>
              <p>Quỹ chưa cấu hình tài khoản nhận chuyển khoản. Vui lòng liên hệ quản trị viên.</p>
            </div>
          )}
        </div>
      )}

      {/* CHI TIẾT: BẰNG TIỀN MẶT */}
      {isCash && (
        <div className={styles.detailsPanel}>
          <div className={styles.alertInfo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p><strong>Quyên góp trực tiếp:</strong> Cán bộ quản lý quỹ sẽ tiếp nhận và lập biên lai thu tiền.</p>
          </div>

          <div className={styles.cashInfo}>
            <h4>Địa điểm tiếp nhận</h4>
            <ul className={styles.cashList}>
              <li>
                <span className={styles.cashDot} />
                <div><strong>Địa chỉ:</strong> {publicSettings?.dia_chi_lien_he || '126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh'}</div>
              </li>
              <li>
                <span className={styles.cashDot} />
                <div><strong>Thời gian:</strong> {publicSettings?.gio_lam_viec || 'Thứ 2 - Thứ 6: 7:30 - 17:00'}</div>
              </li>
              <li>
                <span className={styles.cashDot} />
                <div><strong>Hotline:</strong> {publicSettings?.so_dien_thoai || '0294.3855246'}</div>
              </li>
              <li>
                <span className={styles.cashDot} />
                <div><strong>Email:</strong> {contactEmail || 'TVU@tvu.edu.vn'}</div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

PaymentMethodSection.displayName = 'PaymentMethodSection';
PaymentMethodSection.propTypes = {
  hinhThuc: PropTypes.string,
  onHinhThucChange: PropTypes.func.isRequired,
  publicSettings: PropTypes.object,
};

export default PaymentMethodSection;
