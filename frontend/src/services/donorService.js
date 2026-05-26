import api from './api';

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
  getDonorWall,
  getStaffDonors,
  getDonorStats,
  getDonorDetail,
};
