import axios from 'axios';
import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Statistics Service
 *
 * Service để lấy thống kê từ backend
 */
const statisticsService = {
  /**
   * Lấy thống kê tổng quan cho Landing Page (public)
   */
  getPublicStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/statistics/public`);
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
      const response = await axios.get(`${API_URL}/statistics/fund-breakdown`);
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
      const response = await axios.get(`${API_URL}/statistics/impact`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching impact statistics:', error);
      throw error;
    }
  },

  // ─── KẾ TOÁN DASHBOARD ─────────────────────────────────────────────────────

  /**
   * 4 thẻ KPI dashboard Kế toán
   * @returns {{ tongThu, tongChi, choXacNhanThu, choGiaiNgan, thang, nam }}
   */
  getKeToanSummary: async () => {
    const res = await api.get('/statistics/ketoan/summary');
    return res.data.data;
  },

  /**
   * Dòng tiền N tháng gần nhất
   * @param {number} months
   * @returns {Array<{ thang, thangKey, thu, chi }>}
   */
  getKeToanCashflow: async (months = 6) => {
    const res = await api.get('/statistics/ketoan/cashflow', {
      params: { months },
    });
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
   * @param {object} params - type, year, month, quarter, compareMode
   */
  getKeToanReportStats: async (params) => {
    const res = await api.get('/statistics/ketoan/report', { params });
    return res.data.data;
  },

  /**
   * Lấy thống kê nâng cao cho Admin
   */
  getAdminAdvancedStats: async () => {
    const res = await api.get('/statistics/admin/advanced');
    return res.data.data;
  },
};

export default statisticsService;
