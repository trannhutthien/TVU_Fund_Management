import api from './api';

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TRANSACTION SERVICE ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Lấy danh sách giao dịch với filters và pagination
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Response data
 */
const getAllTransactions = async (params = {}) => {
  try {
    const response = await api.get('/transactions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết một giao dịch
 * @param {number} id - Transaction ID
 * @returns {Promise<Object>} Transaction detail
 */
const getTransactionById = async (id) => {
  try {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction detail:', error);
    throw error;
  }
};

/**
 * Lấy tổng hợp thống kê giao dịch
 * @param {Object} params - Filter parameters
 * @returns {Promise<Object>} Summary data
 */
const getTransactionsSummary = async (params = {}) => {
  try {
    const response = await api.get('/transactions/summary', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions summary:', error);
    throw error;
  }
};

/**
 * Xuất Excel danh sách giao dịch
 * @param {Object} params - Filter parameters
 * @returns {Promise<Blob>} Excel file blob
 */
const exportTransactions = async (params = {}) => {
  try {
    const response = await api.get('/transactions/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting transactions:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái đối soát của giao dịch
 * @param {number} id - Transaction ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Response data
 */
const updateDoiSoatStatus = async (id, data) => {
  try {
    const response = await api.patch(`/transactions/${id}/doi-soat`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating doi soat status:', error);
    throw error;
  }
};

/**
 * Import sao kê ngân hàng
 * @param {File} file - Excel file
 * @returns {Promise<Object>} Import result
 */
const importSaoKe = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/transactions/import-sao-ke', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing sao ke:', error);
    throw error;
  }
};

const transactionService = {
  getAllTransactions,
  getTransactionById,
  getTransactionsSummary,
  exportTransactions,
  updateDoiSoatStatus,
  importSaoKe,
};

export default transactionService;
