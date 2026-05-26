import { useState } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineUser, HiOutlineCreditCard } from 'react-icons/hi2';
import PersonalInfoTab from './PersonalInfoTab';
import BankAccountTab from './BankAccountTab';
import styles from './ProfileTabs.module.scss';

/**
 * ProfileTabs Component
 * 
 * Wrapper quản lý 2 tab cho ProfilePage:
 * - Thông tin cá nhân
 * - Tài khoản ngân hàng (chỉ hiển thị cho SINH_VIEN)
 * 
 * @param {Object} user - Thông tin user từ useAuthStore
 * @param {Function} onSaveInfo - Callback lưu thông tin cá nhân: (data) => void
 * @param {Array} bankAccounts - Danh sách tài khoản ngân hàng
 * @param {Function} onSaveBankAccount - Callback thêm tài khoản: (data) => void
 * @param {Function} onDeleteBankAccount - Callback xóa tài khoản: (id) => void
 * @param {Function} onSetDefaultBank - Callback đặt tài khoản mặc định: (id) => void
 * @param {Boolean} loading - Trạng thái loading
 */
const ProfileTabs = ({
  user,
  onSaveInfo,
  bankAccounts = [],
  onSaveBankAccount,
  onDeleteBankAccount,
  onSetDefaultBank,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState('info');

  const isSinhVien = user?.loaiTaiKhoan === 'SINH_VIEN';

  // Debug log
  console.log('ProfileTabs render:', {
    activeTab,
    isSinhVien,
    userLoaiTaiKhoan: user?.loaiTaiKhoan,
    bankAccountsLength: bankAccounts.length,
  });

  return (
    <div className={styles.profileTabs}>
      {/* Tab bar */}
      <div className={styles.tabBar}>
        {/* Tab Thông tin cá nhân */}
        <button
          type="button"
          className={activeTab === 'info' ? styles.tabActive : styles.tabInactive}
          onClick={() => setActiveTab('info')}
        >
          <HiOutlineUser className={styles.tabIcon} />
          <span>Thông tin cá nhân</span>
        </button>

        {/* Tab Tài khoản ngân hàng - TẠM THỜI hiện cho tất cả để test */}
        <button
          type="button"
          className={activeTab === 'bank' ? styles.tabActive : styles.tabInactive}
          onClick={() => setActiveTab('bank')}
        >
          <HiOutlineCreditCard className={styles.tabIcon} />
          <span>Tài khoản ngân hàng</span>
        </button>
      </div>

      {/* Tab content */}
      <div className={styles.tabContent}>
        {activeTab === 'info' && (
          <div className={styles.tabPane}>
            <PersonalInfoTab user={user} onSave={onSaveInfo} loading={loading} />
          </div>
        )}

        {activeTab === 'bank' && (
          <div className={styles.tabPane}>
            <BankAccountTab
              bankAccounts={bankAccounts}
              onAdd={onSaveBankAccount}
              onDelete={onDeleteBankAccount}
              onSetDefault={onSetDefaultBank}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

ProfileTabs.propTypes = {
  user: PropTypes.object,
  onSaveInfo: PropTypes.func,
  bankAccounts: PropTypes.array,
  onSaveBankAccount: PropTypes.func,
  onDeleteBankAccount: PropTypes.func,
  onSetDefaultBank: PropTypes.func,
  loading: PropTypes.bool,
};

export default ProfileTabs;
