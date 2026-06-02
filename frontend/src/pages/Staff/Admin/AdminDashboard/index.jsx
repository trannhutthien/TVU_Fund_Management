import { useState, useEffect } from 'react';
import { HiSignal, HiExclamationCircle } from 'react-icons/hi2';
import useAuthStore from '@stores/authStore';
import api from '@services/api';
import AdminAlertSection from './sections/AdminAlertSection';
import AdminFinanceSection from './sections/AdminFinanceSection';
import AdminUserSection from './sections/AdminUserSection';
import AdminOperationSection from './sections/AdminOperationSection';
import AdminChartSection from './sections/AdminChartSection';
import AdminActivitySection from './sections/AdminActivitySection';
import styles from './AdminDashboard.module.scss';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// CÔNG DỤNG: Dashboard tổng quan toàn hệ thống cho Admin
// ROUTE: /admin/dashboard
// ROLE: 1 (Admin)
// ═══════════════════════════════════════════════════════════════════════════════

const AdminDashboard = () => {
  const { user } = useAuthStore();

  // ─── STATE ─────────────────────────────────────────────────────────────────
  const [alertData, setAlertData] = useState(null);
  const [financeData, setFinanceData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [operationData, setOperationData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // ─── FETCH ALL DATA ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);

        // Gọi song song các API có sẵn
        const [
          keToanSummary,
          userStats,
          donationStats,
          fundHealth,
          applicationStats, // Thêm API mới
          cashflowData,
          staffUsers,
          userGrowthRes,
        ] = await Promise.all([
          api.get('/statistics/ketoan/summary'),
          api.get('/users/stats'),
          api.get('/donations/stats'),
          api.get('/statistics/ketoan/fund-health'),
          api.get('/statistics/applications/stats'), // API mới
          api.get('/statistics/ketoan/cashflow', { params: { months: 6 } }),
          api.get('/users', { params: { role_id: '1,2,3', limit: 10 } }), // Lấy staff
          api.get('/users/growth', { params: { months: 6 } }).catch(() => ({ data: { data: [] } })),
        ]);

        // Map data cho alertData
        const keToanData = keToanSummary.data?.data || {};
        const appStats = applicationStats.data?.data || {};
        const pendingDonationsCount = donationStats.data?.data?.canXacNhan || 0;
        
        setAlertData({
          pendingCap2: appStats.dangXuLy || 0, // Đơn đang xử lý (Dang xu ly)
          pendingDonations: pendingDonationsCount,
          abnormalTransactions: 0, // TODO: Cần API riêng
          lowBalanceFunds: (fundHealth.data?.data || []).filter(f => {
            const percent = f.so_du / f.so_tien_toi_da * 100;
            return percent < 20;
          }).length,
        });

        // Map data cho financeData
        const donations = donationStats.data?.data || {};
        setFinanceData({
          tongThuHeThong: keToanData.tongThu || 0,
          tongChiHeThong: keToanData.tongChi || 0,
          tongSoDuTatCaQuy: (keToanData.tongThu || 0) - (keToanData.tongChi || 0),
          tongKhoanTaiTro: donations.tongKhoanTaiTro || 0, // Số khoản tài trợ đã nhận (Da nhan)
          tongGiaiNgan: keToanData.tongGiaiNgan || 0, // Số đơn đã giải ngân (Da giai ngan)
        });

        // Map data cho userData
        const users = userStats.data?.data || {};
        setUserData({
          tongNguoiDung: users.tongNguoiDung || 0,
          sinhVien: users.sinhVien || 0,
          nhaTaiTro: users.nhaTaiTro || 0,
          nhanVien: users.nhanVien || 0, // Backend đã tính tổng role 1,2,3
          newThisMonth: users.newThisMonth || 0,
        });

        // Map data cho operationData
        setOperationData({
          tongDon: appStats.tongDon || 0,
          choDuyet: appStats.choDuyet || 0, // Đơn chờ xử lý (Cho duyet)
          choGiaiNgan: appStats.choGiaiNgan || 0,
          dangXuLy: appStats.dangXuLy || 0,
          daHoanThanh: appStats.daHoanThanh || 0,
          tuChoi: appStats.tuChoi || 0,
          tongQuy: (fundHealth.data?.data || []).length,
          quyHoatDong: (fundHealth.data?.data || []).filter(f => f.trang_thai === 'Dang hoat dong').length,
          funds: fundHealth.data?.data || [],
        });

        // TODO: Fetch chart data và activity data khi có API
        const cashflowArray = cashflowData.data?.data || [];
        const fundHealthArray = fundHealth.data?.data || [];
        const staffArray = staffUsers.data?.data || [];
        
        setChartData({
          cashflow6Months: cashflowArray.map(item => ({
            month: item.thang || item.thangKey,
            thu: item.thu || 0,
            chi: item.chi || 0,
            soDu: (item.thu || 0) - (item.chi || 0),
          })),
          userGrowth6Months: userGrowthRes.data?.data || [],
          fundDistribution: fundHealthArray.map(fund => ({
            name: fund.ten_quy,
            value: fund.so_du || 0,
          })),
        });

        // Mock activity data với format đúng
        setActivityData([
          {
            id: 1,
            type: 'giai_ngan',
            message: '<strong>Trần Thị Kế Toán</strong> đã giải ngân <span class="amount">3.500.000đ</span> cho <strong>Nguyễn Văn A</strong>',
            subText: 'Quỹ Học bổng TVU · Hồ sơ #123',
            time: new Date(Date.now() - 15 * 60000).toISOString(), // 15 phút trước
          },
          {
            id: 2,
            type: 'duyet_don',
            message: '<strong>Lê Văn Cán Bộ</strong> đã duyệt đơn hỗ trợ của <strong>Phạm Thị B</strong>',
            subText: 'Quỹ Khó khăn · Hồ sơ #124',
            time: new Date(Date.now() - 45 * 60000).toISOString(), // 45 phút trước
          },
          {
            id: 3,
            type: 'tai_tro',
            message: '<strong>Vingroup</strong> tài trợ <span class="amount">50.000.000đ</span> cho <strong>Quỹ Học bổng</strong>',
            subText: 'Khoản tài trợ #45',
            time: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 giờ trước
          },
        ]);

        setStaffData(staffArray.map(staff => ({
          id: staff.user_id || staff.id,
          ho_ten: staff.ho_ten,
          role_id: staff.role_id,
          avatar: staff.avatar,
          last_active: staff.updated_at || staff.created_at,
        })));

      } catch (error) {
        console.error('Lỗi fetch dashboard data:', error);
        // Keep mock data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [selectedPeriod]);

  // ─── GET CURRENT DATE ──────────────────────────────────────────────────────
  const getCurrentDate = () => {
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const today = new Date();
    const dayName = days[today.getDay()];
    const dateStr = today.toLocaleDateString('vi-VN');
    return `Hôm nay ${dayName}, ngày ${dateStr}`;
  };

  // ─── CHECK SYSTEM STATUS ───────────────────────────────────────────────────
  const hasAlerts = alertData
    ? alertData.pendingCap2 > 0 ||
      alertData.pendingDonations > 0 ||
      alertData.abnormalTransactions > 0 ||
      alertData.lowBalanceFunds > 0
    : false;

  const totalAlerts = alertData
    ? alertData.pendingCap2 +
      alertData.pendingDonations +
      alertData.abnormalTransactions +
      alertData.lowBalanceFunds
    : 0;

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.greeting}>
            Xin chào, {user?.hoTen || user?.ho_ten || 'Admin'} 👋
          </h1>
          <p className={styles.date}>{getCurrentDate()}</p>
        </div>
        <div className={styles.headerRight}>
          <div
            className={`${styles.systemBadge} ${
              hasAlerts ? styles.systemBadgeWarning : styles.systemBadgeSuccess
            }`}
          >
            {hasAlerts ? (
              <>
                <HiExclamationCircle size={14} />
                <span>Có {totalAlerts} vấn đề cần xử lý</span>
              </>
            ) : (
              <>
                <HiSignal size={14} />
                <span>Hệ thống hoạt động bình thường</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      {isLoading ? (
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      ) : (
        <>
          {alertData && <AdminAlertSection alertData={alertData} />}
          {financeData && <AdminFinanceSection financeData={financeData} />}
          {userData && <AdminUserSection userData={userData} />}
          {operationData && <AdminOperationSection operationData={operationData} />}
          {chartData && (
            <AdminChartSection
              chartData={chartData}
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
            />
          )}
          <AdminActivitySection activityData={activityData} staffData={staffData} />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
