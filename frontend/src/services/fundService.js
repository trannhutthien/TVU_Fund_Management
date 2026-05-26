import axios from 'axios';
import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
 * Lấy chi tiết một quỹ theo ID
 * GET /api/funds/:id
 */
export const getFundById = async (fundId) => {
  try {
    const response = await axios.get(`${API_URL}/funds/${fundId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching fund ${fundId}:`, error);
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

export default {
  getPublicFunds,
  getFundById,
  createFund,
};
