import api from './api';

// Cán bộ Quỹ: ghi nhận khoản tài trợ mới
export const createStaffDonation = async (payload) => {
  const response = await api.post('/donations', payload);
  return response.data;
};

// Kế toán: list khoản tài trợ với filter + phân trang
export const getDonations = async (params = {}) => {
  const response = await api.get('/donations', { params });
  return response.data;
};

// Kế toán: 4 thẻ stats
export const getDonationStats = async () => {
  const response = await api.get('/donations/stats');
  return response.data;
};

// Chi tiết 1 khoản + lịch sử phê duyệt
export const getDonationById = async (id) => {
  const response = await api.get(`/donations/${id}`);
  return response.data;
};

// Kế toán/Admin: duyệt khoản tài trợ (kèm ghi chú, minh chứng kế toán)
export const approveDonation = async (id, payload = {}) => {
  const response = await api.put(`/donations/${id}/approve`, payload);
  return response.data;
};

// Kế toán/Admin: từ chối khoản tài trợ
export const rejectDonation = async (id, lyDoTuChoi) => {
  const response = await api.put(`/donations/${id}/reject`, { lyDoTuChoi });
  return response.data;
};

export default {
  createStaffDonation,
  getDonations,
  getDonationStats,
  getDonationById,
  approveDonation,
  rejectDonation,
};
