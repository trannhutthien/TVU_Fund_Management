import api from './api';

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC APIS (Không cần token)
// ═══════════════════════════════════════════════════════════════════════════════

// Lấy danh sách public phân tier diamond/gold/silver
export const getDonorWall = async () => {
  try {
    const response = await api.get('/donors/wall');
    if (!response || !response.data || !response.data.data) {
      return { diamond: [], gold: [], silver: [], total: 0 };
    }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching donor wall:', error);
    return { diamond: [], gold: [], silver: [], total: 0 };
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DONOR USER APIS (Nhà tài trợ xem profile của mình - CẦN TOKEN)
// ═══════════════════════════════════════════════════════════════════════════════

// Lấy thống kê tổng quan của nhà tài trợ hiện tại
export const getMyDonorStats = async () => {
  const response = await api.get('/donors/my-stats');
  return response.data;
};

// Lấy danh sách các khoản quyên góp của nhà tài trợ hiện tại
export const getMyDonations = async (params = {}) => {
  const response = await api.get('/donors/my-donations', { params });
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════════════════
// STAFF APIS (Cán bộ Quỹ/Admin - CẦN TOKEN)
// ═══════════════════════════════════════════════════════════════════════════════

// Cán bộ Quỹ: danh sách nhà tài trợ + filter + sort + phân trang
export const getStaffDonors = async (params = {}) => {
  const response = await api.get('/donors', { params });
  return response.data;
};

// Cán bộ Quỹ: 4 thẻ thống kê
export const getDonorStats = async () => {
  const response = await api.get('/donors/stats');
  return response.data;
};

// Cán bộ Quỹ: chi tiết + lịch sử khoản tài trợ
export const getDonorDetail = async (id) => {
  const response = await api.get(`/donors/${id}`);
  return response.data;
};

export default {
  // Public
  getDonorWall,
  // Donor user
  getMyDonorStats,
  getMyDonations,
  // Staff
  getStaffDonors,
  getDonorStats,
  getDonorDetail,
};
