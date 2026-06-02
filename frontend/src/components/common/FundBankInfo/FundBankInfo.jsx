import PropTypes from 'prop-types';
import { HiOutlineBuildingLibrary, HiOutlineDocumentDuplicate } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import styles from './FundBankInfo.module.scss';

/**
 * FundBankInfo Component
 * Hiển thị thông tin tài khoản ngân hàng của quỹ để donation
 */
const FundBankInfo = ({ bankAccount, fundName, donationAmount, donationId }) => {
  if (!bankAccount) {
    return (
      <div className={styles.noBankInfo}>
        <HiOutlineBuildingLibrary className={styles.icon} />
        <p>Quỹ chưa có thông tin tài khoản ngân hàng</p>
        <p className={styles.subText}>Vui lòng liên hệ quản trị viên</p>
      </div>
    );
  }

  // Tạo nội dung chuyển khoản
  const transferContent = donationId 
    ? `DONATE ${donationId} ${fundName}`
    : `DONATE ${fundName}`;

  // Copy to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`Đã copy ${label}!`);
    }).catch(() => {
      toast.error('Không thể copy');
    });
  };

  return (
    <div className={styles.fundBankInfo}>
      <div className={styles.header}>
        <HiOutlineBuildingLibrary className={styles.headerIcon} />
        <h3>Thông tin chuyển khoản</h3>
      </div>

      <div className={styles.infoGrid}>
        {/* Ngân hàng */}
        <div className={styles.infoRow}>
          <label>Ngân hàng:</label>
          <div className={styles.valueWithCopy}>
            <span className={styles.value}>{bankAccount.nganHang}</span>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => copyToClipboard(bankAccount.nganHang, 'tên ngân hàng')}
              title="Copy"
            >
              <HiOutlineDocumentDuplicate />
            </button>
          </div>
        </div>

        {/* Chi nhánh */}
        {bankAccount.chiNhanh && (
          <div className={styles.infoRow}>
            <label>Chi nhánh:</label>
            <div className={styles.valueWithCopy}>
              <span className={styles.value}>{bankAccount.chiNhanh}</span>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copyToClipboard(bankAccount.chiNhanh, 'chi nhánh')}
                title="Copy"
              >
                <HiOutlineDocumentDuplicate />
              </button>
            </div>
          </div>
        )}

        {/* Số tài khoản */}
        <div className={styles.infoRow}>
          <label>Số tài khoản:</label>
          <div className={styles.valueWithCopy}>
            <span className={`${styles.value} ${styles.highlight}`}>
              {bankAccount.soTaiKhoan}
            </span>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => copyToClipboard(bankAccount.soTaiKhoan, 'số tài khoản')}
              title="Copy"
            >
              <HiOutlineDocumentDuplicate />
            </button>
          </div>
        </div>

        {/* Chủ tài khoản */}
        <div className={styles.infoRow}>
          <label>Chủ tài khoản:</label>
          <div className={styles.valueWithCopy}>
            <span className={styles.value}>{bankAccount.chuTaiKhoan}</span>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => copyToClipboard(bankAccount.chuTaiKhoan, 'chủ tài khoản')}
              title="Copy"
            >
              <HiOutlineDocumentDuplicate />
            </button>
          </div>
        </div>

        {/* Số tiền */}
        {donationAmount && (
          <div className={styles.infoRow}>
            <label>Số tiền:</label>
            <div className={styles.valueWithCopy}>
              <span className={`${styles.value} ${styles.highlight}`}>
                {Number(donationAmount).toLocaleString('vi-VN')}₫
              </span>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copyToClipboard(donationAmount.toString(), 'số tiền')}
                title="Copy"
              >
                <HiOutlineDocumentDuplicate />
              </button>
            </div>
          </div>
        )}

        {/* Nội dung chuyển khoản */}
        <div className={styles.infoRow}>
          <label>Nội dung:</label>
          <div className={styles.valueWithCopy}>
            <span className={`${styles.value} ${styles.highlight}`}>
              {transferContent}
            </span>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => copyToClipboard(transferContent, 'nội dung chuyển khoản')}
              title="Copy"
            >
              <HiOutlineDocumentDuplicate />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.notice}>
        <p>⚠️ Vui lòng chuyển khoản đúng nội dung để hệ thống tự động xác nhận</p>
      </div>
    </div>
  );
};

FundBankInfo.propTypes = {
  bankAccount: PropTypes.shape({
    taiKhoanNganHangId: PropTypes.number,
    soTaiKhoan: PropTypes.string.isRequired,
    nganHang: PropTypes.string.isRequired,
    chiNhanh: PropTypes.string,
    chuTaiKhoan: PropTypes.string.isRequired,
  }),
  fundName: PropTypes.string.isRequired,
  donationAmount: PropTypes.number,
  donationId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default FundBankInfo;
