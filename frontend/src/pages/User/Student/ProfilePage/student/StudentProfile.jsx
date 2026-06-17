import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import ProfileHeader from '../shared/ProfileHeader';
import PersonalInfoSection from './sections/PersonalInfoSection';
import BankAccountSection from './sections/BankAccountSection';
import ApplicationHistorySection from './sections/ApplicationHistorySection';
import StudentOverviewSection from './sections/StudentOverviewSection';
import { bankAccountService } from '@services/bankAccountService';
import { applicationService } from '@services/applicationService';
import styles from './StudentProfile.module.scss';

/**
 * StudentProfile Component
 * 
 * Profile dành cho Sinh viên (SINH_VIEN)
 * Bao gồm:
 * - ProfileHeader (shared)
 * - PersonalInfoSection
 * - BankAccountSection
 * - StudentOverviewSection
 * - ApplicationHistorySection
 */
const StudentProfile = ({ user, onLogout }) => {
  const personalInfoRef = useRef(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false);
  const [profileOverview, setProfileOverview] = useState({
    soHoSoDaNop: 0,
    soTaiKhoanNH: 0,
    diemTinNhiem: null,
  });

  const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loai_nguoi_dung;
  const isSinhVien = userType === 'SINH_VIEN';

  useEffect(() => {
    if (isSinhVien) {
      fetchBankAccounts();
      fetchApplicationOverview();
    }
  }, [isSinhVien]);

  const fetchBankAccounts = async () => {
    try {
      setBankAccountsLoading(true);
      const response = await bankAccountService.getAll();
      
      if (response.success) {
        const accounts = response.data.map(acc => ({
          tai_khoan_id: acc.taiKhoanId,
          so_tai_khoan: acc.soTaiKhoan,
          ten_ngan_hang: acc.tenNganHang,
          chu_tai_khoan: acc.chuTaiKhoan,
          la_mac_dinh: acc.laMacDinh,
        }));
        setBankAccounts(accounts);
        
        setProfileOverview(prev => ({
          ...prev,
          soTaiKhoanNH: accounts.length,
        }));
      }
    } catch (error) {
      console.error('Fetch bank accounts error:', error);
      toast.error('Không thể tải danh sách tài khoản ngân hàng');
    } finally {
      setBankAccountsLoading(false);
    }
  };

  const fetchApplicationOverview = async () => {
    try {
      const response = await applicationService.getMyApplications({ page: 1, limit: 1 });

      if (response.success) {
        const applications = Array.isArray(response.data) ? response.data : [];
        const total = Number(response.total ?? response.pagination?.total ?? applications.length);

        setProfileOverview(prev => ({
          ...prev,
          soHoSoDaNop: Number.isFinite(total) ? total : applications.length,
        }));
      }
    } catch (error) {
      console.error('Fetch application overview error:', error);
    }
  };

  const handleEdit = () => {
    personalInfoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddBankAccount = async (accountData) => {
    try {
      setBankAccountsLoading(true);
      
      const data = {
        soTaiKhoan: accountData.so_tai_khoan,
        tenNganHang: accountData.ten_ngan_hang,
        chuTaiKhoan: accountData.chu_tai_khoan,
        laMacDinh: accountData.la_mac_dinh,
      };

      const response = await bankAccountService.create(data);

      if (response.success) {
        toast.success('Thêm tài khoản thành công!');
        await fetchBankAccounts();
      } else {
        toast.error(response.message || 'Thêm tài khoản thất bại');
      }
    } catch (error) {
      console.error('Add bank account error:', error);
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi thêm tài khoản';
      toast.error(errorMessage);
    } finally {
      setBankAccountsLoading(false);
    }
  };

  const handleDeleteBankAccount = async (id) => {
    try {
      setBankAccountsLoading(true);
      
      const response = await bankAccountService.delete(id);

      if (response.success) {
        toast.success('Xóa tài khoản thành công!');
        await fetchBankAccounts();
      } else {
        toast.error(response.message || 'Xóa tài khoản thất bại');
      }
    } catch (error) {
      console.error('Delete bank account error:', error);
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi xóa tài khoản';
      toast.error(errorMessage);
    } finally {
      setBankAccountsLoading(false);
    }
  };

  const handleSetDefaultBankAccount = async (id) => {
    try {
      const response = await bankAccountService.setDefault(id);

      if (response.success) {
        toast.success('Đã đặt làm tài khoản mặc định!');
        await fetchBankAccounts();
      } else {
        toast.error(response.message || 'Đặt mặc định thất bại');
      }
    } catch (error) {
      console.error('Set default bank account error:', error);
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi';
      toast.error(errorMessage);
    }
  };

  return (
    <div className={styles.studentProfile}>
      <ProfileHeader
        user={user}
        onEdit={handleEdit}
        onLogout={onLogout}
      />

      <div className={styles.sectionsContainer}>
        <div ref={personalInfoRef}>
          <PersonalInfoSection
            user={user}
          />
        </div>

        {isSinhVien && (
          <>
            <BankAccountSection
              bankAccounts={bankAccounts}
              onAdd={handleAddBankAccount}
              onDelete={handleDeleteBankAccount}
              onSetDefault={handleSetDefaultBankAccount}
              loading={bankAccountsLoading}
            />

            <StudentOverviewSection
              soHoSoDaNop={profileOverview.soHoSoDaNop}
              soTaiKhoanNH={profileOverview.soTaiKhoanNH}
              diemTinNhiem={profileOverview.diemTinNhiem}
            />

            <ApplicationHistorySection />
          </>
        )}
      </div>
    </div>
  );
};

StudentProfile.propTypes = {
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
};

export default StudentProfile;
