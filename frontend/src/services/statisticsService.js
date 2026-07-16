import api from './api';

/**
 * Statistics Service
 *
 * Service để lấy thống kê từ backend
 */
const statisticsService = {
  /**
   * Lấy danh sách các năm có dữ liệu (dùng cho YearFilter)
   * @returns {Promise<string[]>} ["2024","2025","2026"]
   */
  getAvailableYears: async () => {
    const res = await api.get('/statistics/available-years');
    return res.data;
  },

  /**
   * Lấy thống kê tổng quan cho Landing Page (public)
   */
  getPublicStats: async () => {
    try {
      const response = await api.get('/statistics/public');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching public statistics:', error);
      throw error;
    }
  },

  /**
   * Lấy phân bổ ngân sách theo LOẠI QUỸ (public)
   */
  getFundBreakdown: async () => {
    try {
      const response = await api.get('/statistics/fund-breakdown');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching fund breakdown:', error);
      throw error;
    }
  },

  /**
   * Lấy thống kê tác động cho DonorsPage (public)
   */
  getImpactStats: async () => {
    try {
      const response = await api.get('/statistics/impact');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching impact statistics:', error);
      throw error;
    }
  },

  // ─── KẾ TOÁN DASHBOARD ─────────────────────────────────────────────────────

  /**
   * 4 thẻ KPI dashboard Kế toán
   * @param {number|null} nam - Năm tài chính (null = tất cả)
   * @returns {{ tongThu, tongChi, choXacNhanThu, choGiaiNgan, thang, nam }}
   */
  getKeToanSummary: async (nam = null) => {
    const params = {};
    if (nam) params.nam = nam;
    const res = await api.get('/statistics/ketoan/summary', { params });
    return res.data.data;
  },

  /**
   * Dòng tiền N tháng gần nhất hoặc 12 tháng của 1 năm
   * @param {number} months
   * @param {number|null} nam - Năm tài chính (null = N tháng gần nhất)
   * @returns {Array<{ thang, thangKey, thu, chi }>}
   */
  getKeToanCashflow: async (months = 6, nam = null) => {
    const params = { months };
    if (nam) params.nam = nam;
    const res = await api.get('/statistics/ketoan/cashflow', { params });
    return res.data.data;
  },

  /**
   * Phân bổ trạng thái giao dịch cho Donut chart
   * @returns {Array<{ key, name, value, color }>}
   */
  getKeToanTransactionStatus: async () => {
    const res = await api.get('/statistics/ketoan/transaction-status');
    return res.data.data;
  },

  /**
   * N giao dịch gần nhất
   * @returns {Array}
   */
  getKeToanRecentTransactions: async (limit = 10) => {
    const res = await api.get('/statistics/ketoan/recent-transactions', {
      params: { limit },
    });
    return res.data.data;
  },

  /**
   * Sức khỏe các quỹ đang hoạt động
   */
  getKeToanFundHealth: async () => {
    const res = await api.get('/statistics/ketoan/fund-health');
    return res.data.data;
  },

  /**
   * Khoản tài trợ chờ xác nhận
   */
  getKeToanPendingDonations: async (limit = 5) => {
    const res = await api.get('/statistics/ketoan/pending-donations', {
      params: { limit },
    });
    return res.data.data;
  },

  /**
   * Lấy báo cáo thống kê thu chi kế toán theo kỳ
   * @param {object} params - type, year, month, quarter, compareMode, nam
   */
  getKeToanReportStats: async (params) => {
    const res = await api.get('/statistics/ketoan/report', { params, timeout: 30000 });
    return res.data.data;
  },

  /**
   * Lấy thống kê nâng cao cho Admin
   * @param {number|null} nam - Năm tài chính (null = tất cả)
   */
  getAdminAdvancedStats: async (nam = null) => {
    const params = {};
    if (nam) params.nam = nam;
    const res = await api.get('/statistics/admin/advanced', { params });
    return res.data.data;
  },

  /**
   * Thống kê đơn hàng theo trạng thái
   * @param {number|null} nam - Năm tài chính (null = tất cả)
   */
  getApplicationStats: async (nam = null) => {
    const params = {};
    if (nam) params.nam = nam;
    const res = await api.get('/statistics/applications/stats', { params });
    return res.data.data;
  },
};

export default statisticsService;
