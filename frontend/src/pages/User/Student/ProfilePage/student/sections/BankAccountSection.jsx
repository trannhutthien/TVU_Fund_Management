import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineCreditCard,
  HiOutlineBuildingLibrary,
  HiOutlineUser,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import styles from './BankAccountSection.module.scss';

const BankAccountSection = ({
  bankAccounts = [],
  onAdd,
  onDelete,
  onSetDefault,
  loading = false,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    so_tai_khoan: '',
    ten_ngan_hang: '',
    chu_tai_khoan: '',
    la_mac_dinh: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [setDefaultLoading, setSetDefaultLoading] = useState(null);

  const formatAccountNumber = (number) => {
    if (!number) return '';
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.so_tai_khoan.trim()) errors.so_tai_khoan = 'Bắt buộc';
    if (!form.ten_ngan_hang.trim()) errors.ten_ngan_hang = 'Bắt buộc';
    if (!form.chu_tai_khoan.trim()) errors.chu_tai_khoan = 'Bắt buộc';
    return errors;
  };

  const handleAddAccount = () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onAdd?.(form);
    
    setForm({
      so_tai_khoan: '',
      ten_ngan_hang: '',
      chu_tai_khoan: '',
      la_mac_dinh: false,
    });
    setFormErrors({});
    setShowForm(false);
  };

  const handleCancelAdd = () => {
    setShowForm(false);
    setForm({
      so_tai_khoan: '',
      ten_ngan_hang: '',
      chu_tai_khoan: '',
      la_mac_dinh: false,
    });
    setFormErrors({});
  };

  const handleDeleteAccount = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      onDelete?.(id);
    }
  };

  const handleSetDefault = async (id) => {
    setSetDefaultLoading(id);
    try {
      await onSetDefault?.(id);
    } finally {
      setSetDefaultLoading(null);
    }
  };

  const isFormValid =
    form.so_tai_khoan.trim() &&
    form.ten_ngan_hang.trim() &&
    form.chu_tai_khoan.trim();

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <HiOutlineCreditCard className={styles.headerIcon} />
        <h2 className={styles.headerTitle}>Tài khoản ngân hàng</h2>
      </div>

      {bankAccounts.length === 0 && !showForm && (
        <div className={styles.emptyState}>
          <HiOutlineCreditCard className={styles.emptyIcon} />
          <p className={styles.emptyText}>Chưa có tài khoản ngân hàng nào</p>
          <p className={styles.emptySubtext}>Thêm tài khoản để nhận tiền hỗ trợ</p>
        </div>
      )}

      {bankAccounts.length > 0 && (
        <div className={styles.accountsList}>
          {bankAccounts.map((account) => {
            const isDefault = account.la_mac_dinh === 1;
            const cardClasses = `${styles.accountCard} ${isDefault ? styles.accountCardDefault : ''}`;

            return (
              <div key={account.tai_khoan_id} className={cardClasses}>
                <div className={styles.accountLeft}>
                  <div className={styles.accountIcon}>
                    <HiOutlineBuildingLibrary />
                  </div>

                  <div className={styles.accountInfo}>
                    <div className={isDefault ? styles.labelDefault : styles.label}>
                      {isDefault ? 'SỐ TÀI KHOẢN MẶC ĐỊNH' : 'SỐ TÀI KHOẢN'}
                    </div>

                    <div className={styles.accountNumber}>
                      {formatAccountNumber(account.so_tai_khoan)}
                    </div>

                    <div className={styles.accountDetails}>
                      {account.ten_ngan_hang} · {account.chu_tai_khoan}
                    </div>
                  </div>
                </div>

                <div className={styles.accountRight}>
                  {isDefault ? (
                    <div className={styles.defaultBadge}>Mặc định</div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(account.tai_khoan_id)}
                      loading={setDefaultLoading === account.tai_khoan_id}
                      className={styles.setDefaultBtn}
                    >
                      Đặt mặc định
                    </Button>
                  )}

                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteAccount(account.tai_khoan_id)}
                    aria-label="Xóa tài khoản"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!showForm && (
        <button
          type="button"
          className={styles.addAccountBtn}
          onClick={() => setShowForm(true)}
        >
          <HiOutlinePlus />
          <span>Thêm tài khoản ngân hàng</span>
        </button>
      )}

      {showForm && (
        <div className={styles.addAccountForm}>
          <div className={styles.formLabel}>THÊM TÀI KHOẢN MỚI</div>

          <div className={styles.formFields}>
            <div>
              <Input
                label="Số tài khoản"
                type="text"
                inputMode="numeric"
                placeholder="Nhập số tài khoản..."
                value={form.so_tai_khoan}
                onChange={handleInputChange('so_tai_khoan')}
                leftIcon={<HiOutlineCreditCard size={18} />}
                required
                error={!!formErrors.so_tai_khoan}
              />
              {formErrors.so_tai_khoan && (
                <span className={styles.errorText}>{formErrors.so_tai_khoan}</span>
              )}
            </div>

            <div>
              <Input
                label="Tên ngân hàng"
                type="text"
                placeholder="VD: Vietinbank, BIDV, Agribank..."
                value={form.ten_ngan_hang}
                onChange={handleInputChange('ten_ngan_hang')}
                leftIcon={<HiOutlineBuildingLibrary size={18} />}
                required
                error={!!formErrors.ten_ngan_hang}
              />
              {formErrors.ten_ngan_hang && (
                <span className={styles.errorText}>{formErrors.ten_ngan_hang}</span>
              )}
            </div>

            <div>
              <Input
                label="Chủ tài khoản"
                type="text"
                placeholder="Nhập tên in hoa đúng như trên thẻ"
                value={form.chu_tai_khoan}
                onChange={handleInputChange('chu_tai_khoan')}
                leftIcon={<HiOutlineUser size={18} />}
                required
                error={!!formErrors.chu_tai_khoan}
              />
              {formErrors.chu_tai_khoan && (
                <span className={styles.errorText}>{formErrors.chu_tai_khoan}</span>
              )}
            </div>

            <p className={styles.helperText}>
              <HiOutlineExclamationCircle size={12} />
              <span>Nhập đúng tên để tránh lỗi giải ngân</span>
            </p>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.la_mac_dinh}
                onChange={handleInputChange('la_mac_dinh')}
                className={styles.checkbox}
              />
              <span className={styles.checkboxMark} />
              <span className={styles.checkboxText}>Đặt làm tài khoản mặc định</span>
            </label>
          </div>

          <div className={styles.formActions}>
            <Button variant="ghost" size="md" onClick={handleCancelAdd}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAddAccount}
              disabled={!isFormValid}
              leftIcon={<HiOutlineCheckCircle size={18} />}
            >
              Lưu tài khoản
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

BankAccountSection.propTypes = {
  bankAccounts: PropTypes.array,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  onSetDefault: PropTypes.func,
  loading: PropTypes.bool,
};

export default BankAccountSection;
