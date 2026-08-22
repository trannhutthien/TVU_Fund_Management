/**
 * Proposal Service - Đề xuất chương trình
 * API cho luồng duyệt 3 cấp: Cán bộ → Kế toán → Admin
 */

import api from './api';

/**
 * Lấy danh sách đề xuất chương trình
 * @param {Object} params - Query parameters
 * @param {number} params.quy_thanh_phan_id - ID quỹ thành phần (cấp 2)
 * @param {string} params.trang_thai - Trạng thái đề xuất
 * @param {string} params.keyword - Từ khóa tìm kiếm
 * @param {number} params.page - Trang hiện tại
 * @param {number} params.page_size - Số lượng mỗi trang
 * @returns {Promise<Object>} { success, data, pagination }
 */
export const getProposals = async (params) => {
  const res = await api.get('/donations/propose-program', { params });
  return res.data;
};

/**
 * Lấy chi tiết đề xuất chương trình theo ID
 * @param {number} id - ID đề xuất
 * @returns {Promise<Object>} { success, data }
 */
export const getProposalById = async (id) => {
  const res = await api.get(`/donations/propose-program/${id}`);
  return res.data;
};

/**
 * Lấy trạng thái timeline của đề xuất
 * @param {number} id - ID đề xuất
 * @returns {Promise<Object>} { success, data: { proposalId, currentStatus, timeline, proposal } }
 */
export const getProposalStatus = async (id) => {
  const res = await api.get(`/donations/propose-program/${id}/status`);
  return res.data;
};

/**
 * BƯỚC 1: Cán bộ duyệt đề xuất
 * @param {number} id - ID đề xuất
 * @param {Object} data
 * @param {string} data.ghiChu - Ghi chú (optional)
 * @param {number} data.quyThanhPhanId - ID quỹ thành phần mới (optional, sửa nếu nhà tài trợ chọn sai)
 * @returns {Promise<Object>} { success, message, data }
 */
export const approveByCanBo = async (id, data) => {
  const res = await api.post(
    `/donations/propose-program/${id}/approve-by-canbo`,
    data
  );
  return res.data;
};

/**
 * BƯỚC 1: Cán bộ từ chối đề xuất
 * @param {number} id - ID đề xuất
 * @param {Object} data
 * @param {string} data.lyDoTuChoi - Lý do từ chối (required)
 * @param {string} data.ghiChu - Ghi chú thêm (optional)
 * @returns {Promise<Object>} { success, message }
 */
export const rejectByCanBo = async (id, data) => {
  const res = await api.post(
    `/donations/propose-program/${id}/reject-by-canbo`,
    data
  );
  return res.data;
};

/**
 * BƯỚC 2: Kế toán xác nhận đã nhận tiền
 * @param {number} id - ID đề xuất
 * @param {Object} data
 * @param {number} data.soTienThucTe - Số tiền thực tế nhận được (optional, nếu khác với đề xuất)
 * @returns {Promise<Object>} { success, message, data }
 */
export const confirmMoneyByKeToan = async (id, data) => {
  const res = await api.post(
    `/donations/propose-program/${id}/confirm-money`,
    data
  );
  return res.data;
};

/**
 * BƯỚC 2b: Admin duyệt hợp đồng vay (CHỈ CHO "CHO VAY")
 * @param {number} id - ID đề xuất
 * @param {Object} data
 * @param {string} data.ghiChu - Ghi chú (optional)
 * @returns {Promise<Object>} { success, message, data }
 */
export const approveLoanContract = async (id, data) => {
  const res = await api.post(
    `/donations/propose-program/${id}/approve-loan-contract`,
    data
  );
  return res.data;
};

/**
 * BƯỚC 3: Admin tạo hoạt động/chương trình (quỹ cấp 3)
 * @param {number} id - ID đề xuất
 * @param {Object} data
 * @param {string} data.ghiChu - Ghi chú (optional)
 * @returns {Promise<Object>} { success, message, data }
 */
export const createActivityByAdmin = async (id, data) => {
  const res = await api.post(
    `/donations/propose-program/${id}/create-activity`,
    data
  );
  return res.data;
};

/**
 * Lấy thống kê đề xuất chương trình
 * @returns {Promise<Object>} { success, data: { choDuyet, daDuyet, tuChoi } }
 */
export const getProposalStats = async () => {
  const res = await api.get('/donations/propose-program/stats');
  return res.data;
};

/**
 * Tạo đề xuất chương trình mới (authenticated user)
 * @param {Object} data - Dữ liệu đề xuất
 * @returns {Promise<Object>} { success, data }
 */
export const createProposal = async (data) => {
  const res = await api.post('/donations/propose-program', data);
  return res.data;
};

/**
 * Tạo đề xuất chương trình mới (public - không cần đăng nhập)
 * @param {Object} data - Dữ liệu đề xuất
 * @returns {Promise<Object>} { success, data }
 */
export const createPublicProposal = async (data) => {
  const res = await api.post('/donations/public/propose-program', data);
  return res.data;
};

export default {
  getProposals,
  getProposalById,
  getProposalStatus,
  approveByCanBo,
  rejectByCanBo,
  confirmMoneyByKeToan,
  approveLoanContract,
  createActivityByAdmin,
  getProposalStats,
  createProposal,
  createPublicProposal,
};
