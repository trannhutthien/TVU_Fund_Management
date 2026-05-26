import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCreditCard,
  HiOutlinePlus,
  HiOutlinePhone,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Input from '@components/common/Input/Input';
import styles from './BankInfoSection.module.scss';

const formatAccountNumber = (num) => {
  if (!num) return '';
  return String(num).replace(/(.{4})/g, '$1 ').trim();
};

const PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;

const BankInfoSection = ({
  bankAccounts = [],
  defaultPhone = null,
  onChange,
  values,
  loading = false,
}) => {
  const navigate = useNavigate();
  const [phoneTouched, setPhoneTouched] = useState(false);

  const selectedBankId = values?.selectedBankId ?? null;
  const soDienThoai = values?.soDienThoai ?? defaultPhone ?? '';

  const phoneValid = PHONE_REGEX.test(soDienThoai);
  const phoneInvalid = phoneTouched && soDienThoai.length > 0 && !phoneValid;
  const phoneEmpty = phoneTouched && soDienThoai.length === 0;

  const handleSelectBank = (id) => {
    onChange?.({ selectedBankId: id, soDienThoai });
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    onChange?.({ selectedBankId, soDienThoai: val });
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.sectionTitle}>
          <HiOutlineCreditCard className={styles.titleIcon} />
          <span>Phần 3: Thông tin nhận giải ngân</span>
        </div>
        <div className={styles.skeletonCard} />
        <div className={styles.skeletonCard} />
      </div>
    );
  }

  if (bankAccounts.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.sectionTitle}>
          <HiOutlineCreditCard className={styles.titleIcon} />
          <span>Phần 3: Thông tin nhận giải ngân</span>
        </div>

        <div className={styles.warningBanner}>
          <HiOutlineExclamationTriangle className={styles.warningIcon} />
          <div>
            <p className={styles.warningTitle}>
              Bạn chưa có tài khoản ngân hàng nào.
            </p>
            <p className={styles.warningDesc}>
              Vui lòng thêm tài khoản trong trang cá nhân trước khi nộp đơn.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          className={styles.goProfileBtn}
          onClick={() => navigate('/profile')}
        >
          Đi đến trang cá nhân →
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>
        <HiOutlineCreditCard className={styles.titleIcon} />
        <span>Phần 3: Thông tin nhận giải ngân</span>
      </div>

      <div className={styles.fieldLabel}>Chọn tài khoản nhận giải ngân</div>

      <div className={styles.accountList}>
        {bankAccounts.map((acc) => {
          const isSelected = selectedBankId === acc.tai_khoan_id;
          const isDefault = acc.la_mac_dinh === 1;

          return (
            <label key={acc.tai_khoan_id} className={styles.accountCard}>
              <input
                type="radio"
                name="bankAccount"
                value={acc.tai_khoan_id}
                checked={isSelected}
                onChange={() => handleSelectBank(acc.tai_khoan_id)}
                className={styles.radioInput}
              />
              <div
                className={`${styles.cardInner} ${isSelected ? styles.selected : ''}`}
              >
                <div className={styles.cardLeft}>
                  <div className={styles.bankIconBox}>
                    <HiOutlineCreditCard className={styles.bankIcon} />
                  </div>
                  <div className={styles.cardText}>
                    <div className={styles.accountLabel}>
                      {isDefault ? 'SỐ TÀI KHOẢN MẶC ĐỊNH' : 'SỐ TÀI KHOẢN'}
                    </div>
                    <div className={styles.accountNumber}>
                      {formatAccountNumber(acc.so_tai_khoan)}
                    </div>
                    <div className={styles.accountMeta}>
                      {acc.chu_tai_khoan} · {acc.ten_ngan_hang}
                    </div>
                  </div>
                </div>
                <div className={styles.cardRight}>
                  {isDefault && (
                    <span className={styles.defaultBadge}>Mặc định</span>
                  )}
                  <div className={styles.radioIndicator}>
                    {isSelected && <div className={styles.radioDot} />}
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <Button
        variant="ghost"
        className={styles.addAccountBtn}
        onClick={() => navigate('/profile?tab=bank-accounts')}
      >
        <HiOutlinePlus />
        Thêm tài khoản ngân hàng mới
      </Button>

      <div className={styles.divider} />

      <div className={styles.fieldLabel}>Số điện thoại liên lạc</div>
      <Input
        type="tel"
        placeholder="Nhập số điện thoại để cán bộ liên hệ khi cần..."
        value={soDienThoai}
        onChange={handlePhoneChange}
        onBlur={handlePhoneBlur}
        maxLength={11}
        error={phoneInvalid || phoneEmpty}
        errorMessage={
          phoneEmpty
            ? 'Vui lòng nhập số điện thoại'
            : phoneInvalid
              ? 'Số điện thoại không hợp lệ'
              : ''
        }
        success={phoneTouched && phoneValid}
        leftIcon={<HiOutlinePhone style={{ color: '#94a3b8' }} />}
        rightIcon={
          phoneTouched && phoneValid ? (
            <HiOutlineCheckCircle style={{ color: '#10b981' }} />
          ) : null
        }
      />

      <div className={styles.note}>
        <HiOutlineInformationCircle className={styles.noteIcon} />
        <span>
          Số điện thoại chỉ dùng để cán bộ liên hệ xác minh hồ sơ, không dùng cho
          mục đích khác.
        </span>
      </div>
    </div>
  );
};

BankInfoSection.propTypes = {
  bankAccounts: PropTypes.array,
  defaultPhone: PropTypes.string,
  onChange: PropTypes.func,
  values: PropTypes.shape({
    selectedBankId: PropTypes.number,
    soDienThoai: PropTypes.string,
  }),
  loading: PropTypes.bool,
};

export default BankInfoSection;
