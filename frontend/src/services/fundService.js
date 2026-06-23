import axios from 'axios';
import api from './api';

const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Lấy danh sách quỹ công khai (không cần authentication)
 * GET /api/funds/public
 */
export const getPublicFunds = async () => {
  try {
    const response = await axios.get(`${API_URL}/funds/public`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public funds:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết một quỹ theo ID (PUBLIC - không cần authentication)
 * GET /api/quy/:id
 */
export const getFundById = async (fundId) => {
  try {
    const response = await axios.get(`${API_URL}/quy/${fundId}`);
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
  const response = await axios.get(`${API_URL}/loai-quy`);
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

export default {
  getPublicFunds,
  getFundById,
  createFund,
  updateFund,
  updateFundStatus,
  getAllLoaiQuy,
  createLoaiQuy,
};
