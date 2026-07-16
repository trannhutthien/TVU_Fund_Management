import api from './api';

/**
 * Student Showcase Service
 * Service để quản lý sinh viên nổi bật
 */
const studentShowcaseService = {
  /**
   * Lấy danh sách sinh viên nổi bật công khai (không cần authentication)
   * GET /api/student-showcase/public
   */
  getPublicStudentShowcase: async () => {
    try {
      const response = await api.get('/student-showcase/public');
      return response.data;
    } catch (error) {
      console.error('Error fetching public student showcase:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả sinh viên nổi bật (cần authentication - admin/cán bộ)
   * GET /api/student-showcase
   */
  getAllStudentShowcase: async () => {
    try {
      const response = await api.get('/student-showcase');
      return response.data;
    } catch (error) {
      console.error('Error fetching all student showcase:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết một sinh viên nổi bật
   * GET /api/student-showcase/:id
   */
  getStudentShowcaseById: async (id) => {
    try {
      const response = await api.get(`/student-showcase/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching student showcase ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo mới sinh viên nổi bật
   * POST /api/student-showcase
   */
  createStudentShowcase: async (data) => {
    try {
      const response = await api.post('/student-showcase', data);
      return response.data;
    } catch (error) {
      console.error('Error creating student showcase:', error);
      throw error;
    }
  },

  /**
   * Cập nhật sinh viên nổi bật
   * PUT /api/student-showcase/:id
   */
  updateStudentShowcase: async (id, data) => {
    try {
      const response = await api.put(`/student-showcase/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating student showcase ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa sinh viên nổi bật
   * DELETE /api/student-showcase/:id
   */
  deleteStudentShowcase: async (id) => {
    try {
      const response = await api.delete(`/student-showcase/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting student showcase ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái hiển thị
   * PUT /api/student-showcase/:id/status
   */
  updateStudentShowcaseStatus: async (id, trangThai) => {
    try {
      const response = await api.put(`/student-showcase/${id}/status`, { trangThai });
      return response.data;
    } catch (error) {
      console.error(`Error updating student showcase status ${id}:`, error);
      throw error;
    }
  },
};

export default studentShowcaseService;
