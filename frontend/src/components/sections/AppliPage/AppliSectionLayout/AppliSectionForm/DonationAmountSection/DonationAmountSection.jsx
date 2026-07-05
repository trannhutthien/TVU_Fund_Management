import { memo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineBanknotes,
  HiOutlineBuildingLibrary,
} from 'react-icons/hi2';
import styles from './DonationAmountSection.module.scss';

/**
 * DonationAmountSection Component
 *
 * Section nhập số tiền quyên góp cho Nhà tài trợ (vai trò 4)
 * - Hiển thị quỹ đã chọn
 * - Hiển thị danh sách tài khoản ngân hàng nhà trường để chọn
 * - Input số tiền + preview format VND
 * - Validation: tối thiểu 10,000đ, tối đa 1,000,000,000đ
 * - Hiển thị nội dung chuyển khoản gợi ý ngay khi chọn tài khoản
 */
const DonationAmountSection = ({ 
  selectedFund, 
  donationAmount, 
  onAmountChange, 
  schoolBankAccounts,
  selectedBankAccountId,
  onBankAccountSelect,
  nextButton 
}) => {
  const [amountError, setAmountError] = useState('');

  const handleAmountChange = (e) => {
    const value = e.target.value;

    if (value && !/^\d+$/.test(value)) {
      return;
    }

    onAmountChange(value);

    if (!value) {
      setAmountError('Vui lòng nhập số tiền quyên góp');
      return;
    }

    const amount = parseFloat(value);

    if (amount < 10000) {
      setAmountError('Số tiền tối thiểu là 10,000đ');
      return;
    }

    if (amount > 1000000000) {
      setAmountError('Số tiền tối đa là 1,000,000,000đ');
      return;
    }

    setAmountError('');
  };

  const formatVND = (amount) => {
    if (!amount) return '';
    return parseFloat(amount).toLocaleString('vi-VN') + 'đ';
  };

  const selectedAccount = schoolBankAccounts?.find(
    acc => acc.taiKhoanId === selectedBankAccountId
  );

  // Nội dung chuyển khoản: Text cố định
  const transferContent = '(tên nhà tài trợ) (số điện thoại) (email) (mã giao dịch chuyển khoản)';

  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>
        <HiOutlineBanknotes className={styles.titleIcon} />
        <span>Thông tin quyên góp</span>
      </div>

      {selectedFund && (
        <div className={styles.fundInfo}>
          <div className={styles.fundLabel}>Quỹ nhận quyên góp:</div>
          <div className={styles.fundName}>
            <HiOutlineBuildingLibrary className={styles.fundIcon} />
            {selectedFund.tenQuy}
          </div>
        </div>
      )}

      {/* Danh sách tài khoản nhà trường */}
      {schoolBankAccounts && schoolBankAccounts.length > 0 && (
        <div className={styles.bankAccountSelection}>
          <div className={styles.fieldLabel}>
            <HiOutlineBuildingLibrary className={styles.fieldIcon} />
            Chọn tài khoản nhận chuyển khoản
            {schoolBankAccounts.length > 1 && (
              <span className={styles.accountCount}>
                ({schoolBankAccounts.length} tài khoản)
              </span>
            )}
          </div>
          <div className={styles.bankAccountList}>
            {schoolBankAccounts.map((account) => (
              <div
                key={account.taiKhoanId}
                className={`${styles.bankAccountCard} ${
                  selectedBankAccountId === account.taiKhoanId ? styles.selected : ''
                }`}
                onClick={() => onBankAccountSelect && onBankAccountSelect(account.taiKhoanId)}
              >
                <div className={styles.bankInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Ngân hàng:</span>
                    <span className={styles.bankName}>{account.tenNganHang}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Số tài khoản:</span>
                    <span className={styles.accountNumber}>{account.soTaiKhoan}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Chủ tài khoản:</span>
                    <span className={styles.accountHolder}>{account.chuTaiKhoan}</span>
                  </div>
                  {account.chiNhanh && (
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Chi nhánh:</span>
                      <span className={styles.branch}>{account.chiNhanh}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel}>
          <HiOutlineBanknotes className={styles.fieldIcon} />
          Nhập số tiền (VNĐ)
        </div>
        <div className={styles.amountInputWrapper}>
          <input
            type="text"
            value={donationAmount}
            onChange={handleAmountChange}
            placeholder="VD: 1000000"
            className={`${styles.amountInput} ${amountError ? styles.inputError : ''}`}
          />
          {donationAmount && !amountError && (
            <div className={styles.amountPreview}>
              {formatVND(donationAmount)}
            </div>
          )}
        </div>
        {amountError ? (
          <div className={styles.errorMessage}>{amountError}</div>
        ) : donationAmount ? (
          <div className={styles.successMessage}>✓ Số tiền hợp lệ</div>
        ) : null}
      </div>

      {/* Hiển thị nội dung chuyển khoản gợi ý - hiện ngay khi chọn tài khoản */}
      {selectedAccount && transferContent && (
        <div className={styles.transferContentBox}>
          <div className={styles.transferContentLabel}>Nội dung chuyển khoản gợi ý:</div>
          <div className={styles.transferContent}>{transferContent}</div>
          <div className={styles.transferNote}>
            * Vui lòng chuyển khoản đúng nội dung để hệ thống tự động đối soát
          </div>
        </div>
      )}

      {nextButton}
    </div>
  );
};

DonationAmountSection.propTypes = {
  selectedFund: PropTypes.shape({
    quyId: PropTypes.number,
    tenQuy: PropTypes.string,
  }),
  donationAmount: PropTypes.string,
  onAmountChange: PropTypes.func.isRequired,
  schoolBankAccounts: PropTypes.arrayOf(
    PropTypes.shape({
      taiKhoanId: PropTypes.number,
      soTaiKhoan: PropTypes.string,
      tenNganHang: PropTypes.string,
      chiNhanh: PropTypes.string,
      chuTaiKhoan: PropTypes.string,
    })
  ),
  selectedBankAccountId: PropTypes.number,
  onBankAccountSelect: PropTypes.func,
  nextButton: PropTypes.node,
};

export default memo(DonationAmountSection);
