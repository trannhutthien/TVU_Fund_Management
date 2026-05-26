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
import styles from './BankAccountTab.module.scss';

/**
 * BankAccountTab Component
 * 
 * Tab quản lý danh sách tài khoản ngân hàng nhận giải ngân
 * 
 * @param {Array} bankAccounts - Danh sách tài khoản: [{ tai_khoan_id, so_tai_khoan, ten_ngan_hang, chu_tai_khoan, la_mac_dinh }]
 * @param {Function} onAdd - Callback khi thêm tài khoản: (data) => void
 * @param {Function} onDelete - Callback khi xóa tài khoản: (id) => void
 * @param {Function} onSetDefault - Callback khi đặt tài khoản mặc định: (id) => void
 * @param {Boolean} loading - Trạng thái loading
 */
const BankAccountTab = ({
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

  // Format số tài khoản: xxxx xxxx xxxx xxxx
  const formatAccountNumber = (number) => {
    if (!number) return '';
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  // Handle input change
  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    
    // Clear error khi user nhập
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validate = () => {
    const errors = {};
    if (!form.so_tai_khoan.trim()) errors.so_tai_khoan = 'Bắt buộc';
    if (!form.ten_ngan_hang.trim()) errors.ten_ngan_hang = 'Bắt buộc';
    if (!form.chu_tai_khoan.trim()) errors.chu_tai_khoan = 'Bắt buộc';
    return errors;
  };

  // Handle add account
  const handleAddAccount = () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onAdd?.(form);
    
    // Reset form
    setForm({
      so_tai_khoan: '',
      ten_ngan_hang: '',
      chu_tai_khoan: '',
      la_mac_dinh: false,
    });
    setFormErrors({});
    setShowForm(false);
  };

  // Handle cancel add
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

  // Handle delete account
  const handleDeleteAccount = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      onDelete?.(id);
    }
  };

  // Handle set default
  const handleSetDefault = async (id) => {
    setSetDefaultLoading(id);
    try {
      await onSetDefault?.(id);
    } finally {
      setSetDefaultLoading(null);
    }
  };

  // Check if form is valid
  const isFormValid =
    form.so_tai_khoan.trim() &&
    form.ten_ngan_hang.trim() &&
    form.chu_tai_khoan.trim();

  return (
    <div className={styles.bankAccountTab}>
      {/* Section label */}
      <div className={styles.sectionLabel}>TÀI KHOẢN NGÂN HÀNG</div>

      {/* Empty state */}
      {bankAccounts.length === 0 && !showForm && (
        <div className={styles.emptyState}>
          <HiOutlineCreditCard className={styles.emptyIcon} />
          <p className={styles.emptyText}>Chưa có tài khoản ngân hàng nào</p>
          <p className={styles.emptySubtext}>Thêm tài khoản để nhận tiền hỗ trợ</p>
        </div>
      )}

      {/* Bank accounts list */}
      {bankAccounts.length > 0 && (
        <div className={styles.accountsList}>
          {bankAccounts.map((account) => {
            const isDefault = account.la_mac_dinh === 1;
            const cardClasses = `${styles.accountCard} ${isDefault ? styles.accountCardDefault : ''}`;

            return (
              <div key={account.tai_khoan_id} className={cardClasses}>
                {/* Left section */}
                <div className={styles.accountLeft}>
                  {/* Icon */}
                  <div className={styles.accountIcon}>
                    <HiOutlineBuildingLibrary />
                  </div>

                  {/* Info */}
                  <div className={styles.accountInfo}>
                    {/* Label */}
                    <div className={isDefault ? styles.labelDefault : styles.label}>
                      {isDefault ? 'SỐ TÀI KHOẢN MẶC ĐỊNH' : 'SỐ TÀI KHOẢN'}
                    </div>

                    {/* Account number */}
                    <div className={styles.accountNumber}>
                      {formatAccountNumber(account.so_tai_khoan)}
                    </div>

                    {/* Bank name + Owner */}
                    <div className={styles.accountDetails}>
                      {account.ten_ngan_hang} · {account.chu_tai_khoan}
                    </div>
                  </div>
                </div>

                {/* Right section */}
                <div className={styles.accountRight}>
                  {/* Default badge or Set default button */}
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

                  {/* Delete button */}
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

      {/* Add account button (when form is closed) */}
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

      {/* Add account form (when form is open) */}
      {showForm && (
        <div className={styles.addAccountForm}>
          {/* Form label */}
          <div className={styles.formLabel}>THÊM TÀI KHOẢN MỚI</div>

          {/* Form fields */}
          <div className={styles.formFields}>
            {/* Số tài khoản */}
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

            {/* Tên ngân hàng */}
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

            {/* Chủ tài khoản */}
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

            {/* Helper text */}
            <p className={styles.helperText}>
              <HiOutlineExclamationCircle size={12} />
              <span>Nhập đúng tên để tránh lỗi giải ngân</span>
            </p>

            {/* Checkbox - Đặt làm mặc định */}
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

          {/* Form actions */}
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

BankAccountTab.propTypes = {
  bankAccounts: PropTypes.arrayOf(
    PropTypes.shape({
      tai_khoan_id: PropTypes.number.isRequired,
      so_tai_khoan: PropTypes.string.isRequired,
      ten_ngan_hang: PropTypes.string.isRequired,
      chu_tai_khoan: PropTypes.string.isRequired,
      la_mac_dinh: PropTypes.oneOf([0, 1]).isRequired,
    })
  ),
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  onSetDefault: PropTypes.func,
  loading: PropTypes.bool,
};

export default BankAccountTab;
