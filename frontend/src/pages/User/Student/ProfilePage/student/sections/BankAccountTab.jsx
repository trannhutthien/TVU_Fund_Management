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

const formatAccountNumber = (number) => {
  if (!number) return '';
  return number.replace(/(.{4})/g, '$1 ').trim();
};

const BankAccountTab = ({
  bankAccounts = [],
  onAdd,
  onDelete,
  onSetDefault,
  loading = false,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    so_tai_khoan: '',
    ten_ngan_hang: '',
    chu_tai_khoan: '',
    la_mac_dinh: false,
  });
  const [setDefaultLoading, setSetDefaultLoading] = useState(null);

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setNewAccount((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    newAccount.so_tai_khoan.trim() &&
    newAccount.ten_ngan_hang.trim() &&
    newAccount.chu_tai_khoan.trim();

  const handleCancel = () => {
    setShowAddForm(false);
    setNewAccount({
      so_tai_khoan: '',
      ten_ngan_hang: '',
      chu_tai_khoan: '',
      la_mac_dinh: false,
    });
  };

  const handleSave = () => {
    if (!isFormValid) return;
    onAdd?.(newAccount);
    setNewAccount({
      so_tai_khoan: '',
      ten_ngan_hang: '',
      chu_tai_khoan: '',
      la_mac_dinh: false,
    });
    setShowAddForm(false);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      onDelete?.(id);
    }
  };

  const handleSetDefaultClick = async (id) => {
    setSetDefaultLoading(id);
    try {
      await onSetDefault?.(id);
    } finally {
      setSetDefaultLoading(null);
    }
  };

  return (
    <div className={styles.tab}>
      <div className={styles.sectionLabel}>TÀI KHOẢN ĐÃ LƯU</div>

      {bankAccounts.length === 0 ? (
        <div className={styles.empty}>
          <HiOutlineCreditCard className={styles.emptyIcon} />
          <p className={styles.emptyText}>Chưa có tài khoản ngân hàng nào</p>
          <p className={styles.emptySubtext}>Thêm tài khoản để nhận giải ngân</p>
        </div>
      ) : (
        <div className={styles.list}>
          {bankAccounts.map((account) => {
            const isDefault = account.la_mac_dinh === 1;
            return (
              <div
                key={account.tai_khoan_id}
                className={`${styles.card} ${isDefault ? styles.cardDefault : ''}`}
              >
                <div className={styles.cardLeft}>
                  <div className={styles.iconBox}>
                    <HiOutlineBuildingLibrary size={22} />
                  </div>
                  <div className={styles.cardInfo}>
                    <span
                      className={isDefault ? styles.labelDefault : styles.label}
                    >
                      {isDefault ? 'SỐ TÀI KHOẢN MẶC ĐỊNH' : 'SỐ TÀI KHOẢN'}
                    </span>
                    <span className={styles.accountNumber}>
                      {formatAccountNumber(account.so_tai_khoan)}
                    </span>
                    <span className={styles.accountDetails}>
                      {account.ten_ngan_hang} · {account.chu_tai_khoan}
                    </span>
                  </div>
                </div>

                <div className={styles.cardRight}>
                  {isDefault ? (
                    <span className={styles.defaultBadge}>Mặc định</span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefaultClick(account.tai_khoan_id)}
                      loading={setDefaultLoading === account.tai_khoan_id}
                    >
                      Đặt mặc định
                    </Button>
                  )}
                  <button
                    type="button"
                    className={styles.trashBtn}
                    onClick={() => handleDeleteClick(account.tai_khoan_id)}
                    aria-label="Xóa tài khoản"
                  >
                    <HiOutlineTrash size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!showAddForm && (
        <Button
          variant="secondary"
          className={styles.addBtn}
          leftIcon={<HiOutlinePlus size={18} />}
          onClick={() => setShowAddForm(true)}
          disabled={loading}
        >
          Thêm tài khoản ngân hàng
        </Button>
      )}

      {showAddForm && (
        <div className={styles.addForm}>
          <div className={styles.formLabel}>THÊM TÀI KHOẢN MỚI</div>

          <div className={styles.fields}>
            <Input
              label="Số tài khoản"
              type="text"
              inputMode="numeric"
              placeholder="Nhập số tài khoản..."
              value={newAccount.so_tai_khoan}
              onChange={handleInputChange('so_tai_khoan')}
              leftIcon={<HiOutlineCreditCard size={18} />}
              required
            />

            <Input
              label="Tên ngân hàng"
              type="text"
              placeholder="VD: Vietinbank, BIDV, Agribank..."
              value={newAccount.ten_ngan_hang}
              onChange={handleInputChange('ten_ngan_hang')}
              leftIcon={<HiOutlineBuildingLibrary size={18} />}
              required
            />

            <Input
              label="Chủ tài khoản"
              type="text"
              placeholder="Nhập chính xác tên in hoa trên thẻ"
              value={newAccount.chu_tai_khoan}
              onChange={handleInputChange('chu_tai_khoan')}
              leftIcon={<HiOutlineUser size={18} />}
              required
            />

            <p className={styles.helperNote}>
              <HiOutlineExclamationCircle size={12} />
              <span>Nhập đúng tên chủ tài khoản để tránh lỗi giải ngân</span>
            </p>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={newAccount.la_mac_dinh}
                onChange={handleInputChange('la_mac_dinh')}
                className={styles.checkbox}
              />
              <span className={styles.checkboxMark} />
              <span className={styles.checkboxText}>
                Đặt làm tài khoản mặc định
              </span>
            </label>
          </div>

          <div className={styles.formActions}>
            <Button variant="ghost" size="md" onClick={handleCancel}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
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
  bankAccounts: PropTypes.array,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  onSetDefault: PropTypes.func,
  loading: PropTypes.bool,
};

export default BankAccountTab;
