import api from './api';

/**
 * Lấy danh sách quỹ công khai (không cần authentication)
 * GET /api/funds/public
 * Hỗ trợ các tham số: maloai, page, limit, capDo, trangThai, search, sapXep
 */
export const getPublicFunds = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.maloai) params.append('maloai', filters.maloai);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.capDo) params.append('capDo', filters.capDo);
    if (filters.trangThai) params.append('trangThai', filters.trangThai);
    if (filters.search) params.append('search', filters.search);
    if (filters.sapXep) params.append('sapXep', filters.sapXep);
    
    const queryString = params.toString();
    const url = queryString ? `/funds/public?${queryString}` : '/funds/public';
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching public funds:', error);
    throw error;
  }
};

/**
 * Lấy danh sách quỹ (cần authentication)
 * GET /api/funds
 * Hỗ trợ filter theo cap (cấp độ quỹ: 1, 2, 3)
 */
export const getFunds = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.cap) params.append('cap', filters.cap);
    if (filters.maloai) params.append('maloai', filters.maloai);
    if (filters.trangThai) params.append('trangThai', filters.trangThai);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = queryString ? `/funds?${queryString}` : '/funds';
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching funds:', error);
    throw error;
  }
};

/**
 * Lấy số lượng quỹ theo từng loại (count by group)
 * GET /api/funds/count-by-group
 */
export const getFundCountByGroup = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.capDo) params.append('capDo', filters.capDo);
    if (filters.trangThai) params.append('trangThai', filters.trangThai);
    
    const queryString = params.toString();
    const url = queryString ? `/funds/count-by-group?${queryString}` : '/funds/count-by-group';
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching fund count by group:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết một quỹ theo ID (PUBLIC - không cần authentication)
 * GET /api/quy/:id
 */
export const getFundById = async (fundId) => {
  try {
    const response = await api.get(`/quy/${fundId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching fund detail:', error);
    throw error;
  }
};

/**
 * Tạo quỹ mới
 * POST /api/funds (cần token + role admin/giáo vụ)
 */
export const createFund = async (payload) => {
  const response = await api.post('/funds', payload);
  return response.data;
};

/**
 * Cập nhật thông tin quỹ
 * PUT /api/funds/:id (cần token + role admin/giáo vụ)
 */
export const updateFund = async (fundId, payload) => {
  const response = await api.put(`/funds/${fundId}`, payload);
  return response.data;
};

/**
 * Cập nhật trạng thái quỹ
 * PUT /api/funds/:id/status (cần token + role admin/giáo vụ)
 */
export const updateFundStatus = async (fundId, trangThai) => {
  const response = await api.put(`/funds/${fundId}/status`, { trangThai });
  return response.data;
};

/**
 * Lấy danh sách loại quỹ
 * GET /api/loai-quy
 */
export const getAllLoaiQuy = async () => {
  const response = await api.get('/loai-quy');
  return response.data;
};

/**
 * Tạo loại quỹ mới
 * POST /api/loai-quy
 */
export const createLoaiQuy = async (maLoai, tenLoai) => {
  const response = await api.post('/loai-quy', { maLoai, tenLoai });
  return response.data;
};

/**
 * Lấy danh sách đợt giải ngân của một quỹ (PUBLIC - không cần auth)
 * GET /api/disbursement-rounds/public/fund/:quyId
 */
export const getPublicDisbursementRounds = async (quyId) => {
  const response = await api.get(`/disbursement-rounds/public/fund/${quyId}`);
  return response.data;
};

/**
 * Lấy danh sách đợt giải ngân của một quỹ (PROTECTED)
 * GET /api/disbursement-rounds/fund/:quyId
 */
export const getDisbursementRounds = async (quyId) => {
  const response = await api.get(`/disbursement-rounds/fund/${quyId}`);
  return response.data;
};

/**
 * Hoàn tất đợt giải ngân
 * PUT /api/disbursement-rounds/:dotId/complete
 */
export const completeDisbursementRound = async (dotId) => {
  const response = await api.put(`/disbursement-rounds/${dotId}/complete`);
  return response.data;
};

export default {
  getPublicFunds,
  getFunds,
  getFundCountByGroup,
  getPublicDisbursementRounds,
  getFundById,
  createFund,
  updateFund,
  updateFundStatus,
  getAllLoaiQuy,
  createLoaiQuy,
  getDisbursementRounds,
  completeDisbursementRound,
};
