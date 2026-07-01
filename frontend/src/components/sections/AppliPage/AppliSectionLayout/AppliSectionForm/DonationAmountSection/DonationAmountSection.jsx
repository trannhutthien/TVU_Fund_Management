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
 * - Input số tiền + preview format VND
 * - Validation: tối thiểu 10,000đ, tối đa 1,000,000,000đ
 *
 * (Phần hiển thị STK ngân hàng cứng đã được gỡ bỏ.)
 */
const DonationAmountSection = ({ selectedFund, donationAmount, onAmountChange, nextButton }) => {
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

  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>
        <HiOutlineBanknotes className={styles.titleIcon} />
        <span>Số tiền quyên góp</span>
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
  nextButton: PropTypes.node,
};

export default memo(DonationAmountSection);
