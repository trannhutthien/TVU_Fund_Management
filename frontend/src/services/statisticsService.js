import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Statistics Service
 * 
 * Service để lấy thống kê từ backend
 */
const statisticsService = {
  /**
   * Lấy thống kê tổng quan cho Landing Page
   * 
   * @returns {Promise} Object chứa:
   *   - supportedRequests: Số yêu cầu đã giải ngân
   *   - totalFundAmount: Tổng số tiền tất cả các quỹ
   *   - totalDonors: Tổng số nhà hỗ trợ
   *   - totalFunds: Tổng số quỹ hiện tại
   */
  getPublicStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/statistics/public`);
      return response.data.data; // Lấy data bên trong
    } catch (error) {
      console.error('Error fetching public statistics:', error);
      throw error;
    }
  },

  /**
   * Lấy số yêu cầu đã hỗ trợ (trạng thái "Đã giải ngân")
   * 
   * Query: SELECT COUNT(*) FROM yeucauhotro WHERE TrangThai = 'Đã giải ngân'
   */
  getSupportedRequestsCount: async () => {
    try {
      const response = await axios.get(`${API_URL}/statistics/supported-requests`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supported requests count:', error);
      throw error;
    }
  },

  /**
   * Lấy tổng số tiền tất cả các quỹ
   * 
   * Query: SELECT SUM(SoTienHienTai) FROM quy
   */
  getTotalFundAmount: async () => {
    try {
      const response = await axios.get(`${API_URL}/statistics/total-fund-amount`);
      return response.data;
    } catch (error) {
      console.error('Error fetching total fund amount:', error);
      throw error;
    }
  },

  /**
   * Lấy tổng số nhà hỗ trợ
   * 
   * Query: SELECT COUNT(DISTINCT MaNhaTaiTro) FROM nhataitro
   */
  getTotalDonorsCount: async () => {
    try {
      const response = await axios.get(`${API_URL}/statistics/total-donors`);
      return response.data;
    } catch (error) {
      console.error('Error fetching total donors count:', error);
      throw error;
    }
  },

  /**
   * Lấy tổng số quỹ hiện tại
   * 
   * Query: SELECT COUNT(*) FROM quy WHERE TrangThai = 'Đang hoạt động'
   */
  getTotalFundsCount: async () => {
    try {
      const response = await axios.get(`${API_URL}/statistics/total-funds`);
      return response.data;
    } catch (error) {
      console.error('Error fetching total funds count:', error);
      throw error;
    }
  },
};

export default statisticsService;
