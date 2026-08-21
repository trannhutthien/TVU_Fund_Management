import { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../formatters';
import styles from './SuccessStep.module.scss';

const SuccessStep = memo(({ donationResult, bankAccounts, onNewDonation }) => {
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (bankAccounts?.length > 0) {
      setCopied(null);
    }
  }, [bankAccounts]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const nhaTaiTro = donationResult?.nhaTaiTro || {};
  const transferContent = [
    nhaTaiTro.ten || '',
    nhaTaiTro.soDienThoai || '',
    nhaTaiTro.email || '',
    `#${donationResult?.khoanTaiTroId || ''}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.stepContent}>
      <div className={styles.successHeader}>
        <div className={styles.successIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3>Đăng ký đóng góp thành công!</h3>
        <p>Cảm ơn bạn đã ủng hộ quỹ. Vui lòng chuyển khoản theo thông tin bên dưới.</p>
      </div>

      {donationResult && (
        <div className={styles.resultInfo}>
          <div className={styles.resultItem}>
            <span>Mã khoản đóng góp:</span>
            <strong>#{donationResult.khoanTaiTroId}</strong>
          </div>
          <div className={styles.resultItem}>
            <span>Quỹ:</span>
            <strong>{donationResult.quy?.tenQuy}</strong>
          </div>
          <div className={styles.resultItem}>
            <span>Số tiền:</span>
            <strong className={styles.amount}>{formatCurrency(donationResult.soTien)}</strong>
          </div>
          <div className={styles.resultItem}>
            <span>Trạng thái:</span>
            <span className={styles.pendingBadge}>Chờ duyệt</span>
          </div>
        </div>
      )}

      {transferContent && (
        <div className={styles.transferContentBox}>
          <h4>Nội dung chuyển khoản</h4>
          <div className={styles.transferRow}>
            <code className={styles.transferCode}>{transferContent}</code>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => handleCopy(transferContent, 'transferContent')}
            >
              {copied === 'transferContent' ? 'Đã copy' : 'Copy'}
            </button>
          </div>
          <p className={styles.transferNote}>
            Vui lòng chuyển khoản đúng nội dung để hệ thống tự động đối soát
          </p>
        </div>
      )}

      {bankAccounts?.length > 0 && (
        <div className={styles.bankSection}>
          <h4>Thông tin chuyển khoản</h4>
          <div className={styles.bankCards}>
              {bankAccounts.map((account) => (
                <div key={account.taiKhoanId} className={styles.bankCard}>
                  <div className={styles.bankHeader}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a5276" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    <strong>{account.tenNganHang}</strong>
                  </div>
                  <div className={styles.bankDetail}>
                    <span>Số tài khoản:</span>
                    <div className={styles.copyRow}>
                      <code>{account.soTaiKhoan}</code>
                      <button
                        type="button"
                        className={styles.copyBtn}
                        onClick={() => handleCopy(account.soTaiKhoan, `account-${account.taiKhoanId}`)}
                      >
                        {copied === `account-${account.taiKhoanId}` ? 'Đã copy' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className={styles.bankDetail}>
                    <span>Chủ tài khoản:</span>
                    <span>{account.chuTaiKhoan}</span>
                  </div>
                  {account.chiNhanh && (
                    <div className={styles.bankDetail}>
                      <span>Chi nhánh:</span>
                      <span>{account.chiNhanh}</span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.newDonationBtn} onClick={onNewDonation}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Đăng ký đóng góp mới
        </button>
      </div>
    </div>
  );
});

SuccessStep.displayName = 'SuccessStep';
SuccessStep.propTypes = {
  donationResult: PropTypes.object,
  bankAccounts: PropTypes.array,
  onNewDonation: PropTypes.func.isRequired,
};

export default SuccessStep;
