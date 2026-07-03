import api from './api';

/**
 * Gửi đề xuất trích lập ngân sách mới
 * POST /api/funds/allocate/request
 */
export const requestAllocation = async (payload) => {
  const response = await api.post('/funds/allocate/request', payload);
  return response.data;
};

/**
 * Phê duyệt trích lập ngân sách
 * POST /api/funds/allocate/:id/approve
 */
export const approveAllocation = async (id) => {
  const response = await api.post(`/funds/allocate/${id}/approve`);
  return response.data;
};

/**
 * Từ chối trích lập ngân sách
 * POST /api/funds/allocate/:id/reject
 */
export const rejectAllocation = async (id, lyDoTuChoi) => {
  const response = await api.post(`/funds/allocate/${id}/reject`, { lyDoTuChoi });
  return response.data;
};

/**
 * Thu hồi trích lập ngân sách đã duyệt
 * POST /api/funds/allocate/:id/rollback
 */
export const rollbackAllocation = async (id) => {
  const response = await api.post(`/funds/allocate/${id}/rollback`);
  return response.data;
};

/**
 * Lấy danh sách đề xuất trích lập ngân sách
 * GET /api/funds/allocate
 */
export const getAllocationRequests = async (params) => {
  const response = await api.get('/funds/allocate', { params });
  return response.data;
};

export default {
  requestAllocation,
  approveAllocation,
  rejectAllocation,
  rollbackAllocation,
  getAllocationRequests
};
