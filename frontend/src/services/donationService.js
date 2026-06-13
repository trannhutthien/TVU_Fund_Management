import api from './api';

/**
 * Donation Service
 * Xử lý các API liên quan đến donation/tài trợ
 */

/**
 * Tạo donation công khai (không cần đăng nhập)
 * @param {Object} donationData - Thông tin donation
 * @returns {Promise} Response từ server
 */
export const createPublicDonation = async (donationData) => {
  try {
    const response = await api.post('/donations/public', donationData);
    return response.data;
  } catch (error) {
    console.error('Error creating public donation:', error);
    throw error.response?.data || { message: 'Lỗi khi tạo donation' };
  }
};

/**
 * Tạo donation cho user đã đăng nhập
 * @param {Object} donationData - Thông tin donation
 * @returns {Promise} Response từ server
 */
export const createAuthenticatedDonation = async (donationData) => {
  try {
    const response = await api.post('/donations/authenticated', donationData);
    return response.data;
  } catch (error) {
    console.error('Error creating authenticated donation:', error);
    throw error.response?.data || { message: 'Lỗi khi tạo donation' };
  }
};

/**
 * Tạo donation bởi Cán bộ (thay mặt nhà tài trợ)
 * @param {Object} donationData - Thông tin donation
 * @param {number} donationData.nha_tai_tro_id - ID nhà tài trợ
 * @param {number} donationData.quy_id - ID quỹ
 * @param {number} donationData.so_tien - Số tiền
 * @param {string} [donationData.ghi_chu] - Ghi chú
 * @param {string} [donationData.hinh_anh_minh_chung] - URL minh chứng
 * @returns {Promise} Response từ server
 */
export const createStaffDonation = async (donationData) => {
  try {
    const response = await api.post('/donations', donationData);
    return response.data;
  } catch (error) {
    console.error('Error creating staff donation:', error);
    throw error.response?.data || { message: 'Lỗi khi tạo donation (cán bộ)' };
  }
};

/**
 * Lấy thông tin tài khoản ngân hàng của quỹ
 * @param {number} fundId - ID quỹ
 * @returns {Promise} Thông tin tài khoản ngân hàng
 */
export const getFundBankAccounts = async (fundId) => {
  try {
    const response = await api.get(`/funds/${fundId}/bank-accounts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching fund bank accounts:', error);
    throw error.response?.data || { message: 'Lỗi khi lấy thông tin tài khoản ngân hàng' };
  }
};

/**
 * Duyệt khoản tài trợ (Kế toán/Admin)
 * @param {number} donationId - ID khoản tài trợ
 * @param {Object} data - Dữ liệu duyệt (ghi_chu, minh_chung_ke_toan)
 * @returns {Promise} Response từ server
 */
export const approveDonation = async (donationId, data = {}) => {
  try {
    const response = await api.put(`/donations/${donationId}/approve`, data);
    return response.data;
  } catch (error) {
    console.error('Error approving donation:', error);
    throw error.response?.data || { message: 'Lỗi khi duyệt khoản tài trợ' };
  }
};

/**
 * Xác nhận khoản tài trợ (Admin only)
 * @param {number} donationId - ID khoản tài trợ
 * @param {Object} data - Dữ liệu xác nhận (ghi_chu)
 * @returns {Promise} Response từ server
 */
export const confirmDonation = async (donationId, data = {}) => {
  try {
    const response = await api.put(`/donations/${donationId}/confirm`, data);
    return response.data;
  } catch (error) {
    console.error('Error confirming donation:', error);
    throw error.response?.data || { message: 'Lỗi khi xác nhận khoản tài trợ' };
  }
};

/**
 * Từ chối khoản tài trợ (Kế toán/Admin)
 * @param {number} donationId - ID khoản tài trợ
 * @param {Object} data - Dữ liệu từ chối (lyDoTuChoi)
 * @returns {Promise} Response từ server
 */
export const rejectDonation = async (donationId, data) => {
  try {
    const response = await api.put(`/donations/${donationId}/reject`, data);
    return response.data;
  } catch (error) {
    console.error('Error rejecting donation:', error);
    throw error.response?.data || { message: 'Lỗi khi từ chối khoản tài trợ' };
  }
};

/**
 * Lấy danh sách khoản tài trợ (có filter)
 * @param {Object} filters - Các filter
 * @returns {Promise} Danh sách khoản tài trợ
 */
export const listDonations = async (filters = {}) => {
  try {
    const response = await api.get('/donations', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error listing donations:', error);
    throw error.response?.data || { message: 'Lỗi khi lấy danh sách khoản tài trợ' };
  }
};

/**
 * Lấy danh sách khoản tài trợ (alias cho listDonations)
 * @param {Object} filters - Các filter
 * @returns {Promise} Danh sách khoản tài trợ
 */
export const getDonations = listDonations;

/**
 * Lấy thống kê donation (cho Kế toán)
 * @returns {Promise} Thống kê
 */
export const getDonationStats = async () => {
  try {
    const response = await api.get('/donations/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    throw error.response?.data || { message: 'Lỗi khi lấy thống kê' };
  }
};

/**
 * Lấy chi tiết khoản tài trợ
 * @param {number} donationId - ID khoản tài trợ
 * @returns {Promise} Chi tiết khoản tài trợ
 */
export const getDonationDetail = async (donationId) => {
  try {
    const response = await api.get(`/donations/${donationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching donation detail:', error);
    throw error.response?.data || { message: 'Lỗi khi lấy chi tiết khoản tài trợ' };
  }
};

/**
 * Lấy chi tiết khoản tài trợ theo ID (alias cho getDonationDetail)
 * @param {number} donationId - ID khoản tài trợ
 * @returns {Promise} Chi tiết khoản tài trợ
 */
export const getDonationById = getDonationDetail;

/**
 * Lấy danh sách quyên góp của nhà tài trợ hiện tại (đã đăng nhập)
 * @returns {Promise} Danh sách quyên góp
 */
export const getMyDonations = async () => {
  try {
    const response = await api.get('/donations/my-donations');
    return response.data;
  } catch (error) {
    console.error('Error fetching my donations:', error);
    throw error.response?.data || { message: 'Lỗi khi lấy lịch sử quyên góp của tôi' };
  }
};

