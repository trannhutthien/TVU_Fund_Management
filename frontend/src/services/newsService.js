import axios from 'axios';
import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * News Service
 * Service để quản lý tin tức & sự kiện
 */
const newsService = {
  /**
   * Lấy tin tức tổng hợp cho Landing Page phân theo nhóm nổi bật
   * GET /api/news/landing
   */
  getLandingNews: async () => {
    try {
      const response = await axios.get(`${API_URL}/news/landing`);
      return response.data;
    } catch (error) {
      console.error('Error fetching landing news:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tin tức công khai hiển thị trên Landing Page (không cần đăng nhập)
   * GET /api/news/public
   */
  getPublicNews: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/news/public`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching public news:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết một bài tin tức (công khai để người dùng đọc chi tiết)
   * GET /api/news/:id
   */
  getNewsById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/news/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching news detail ${id}:`, error);
      throw error;
    }
  },

  /**
   * Lấy tất cả tin tức (cần token và vai trò Cán bộ/Admin)
   * GET /api/news
   */
  getAllNews: async () => {
    try {
      const response = await api.get('/news');
      return response.data;
    } catch (error) {
      console.error('Error fetching all news:', error);
      throw error;
    }
  },

  /**
   * Tạo mới tin tức (cần token và vai trò Cán bộ/Admin)
   * POST /api/news
   */
  createNews: async (data) => {
    try {
      const response = await api.post('/news', data);
      return response.data;
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  },

  /**
   * Cập nhật tin tức (cần token và vai trò Cán bộ/Admin)
   * PUT /api/news/:id
   */
  updateNews: async (id, data) => {
    try {
      const response = await api.put(`/news/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating news ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa tin tức (cần token và vai trò Cán bộ/Admin)
   * DELETE /api/news/:id
   */
  deleteNews: async (id) => {
    try {
      const response = await api.delete(`/news/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting news ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cập nhật nhanh trạng thái hiển thị của tin tức (cần token và vai trò Cán bộ/Admin)
   * PUT /api/news/:id/status
   */
  updateNewsStatus: async (id, status) => {
    try {
      const response = await api.put(`/news/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating news status ${id}:`, error);
      throw error;
    }
  },
};

export default newsService;
