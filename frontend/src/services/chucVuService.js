import api from './api';

const chucVuService = {
  getPublicChucVu: async () => {
    try {
      const response = await api.get('/chuc-vu/public');
      return response.data;
    } catch (error) {
      console.error('Error fetching public chuc vu:', error);
      throw error;
    }
  },

  getAllChucVu: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.nhom) params.append('nhom', filters.nhom);
      if (filters.trangthai) params.append('trangthai', filters.trangthai);
      const queryString = params.toString();
      const response = await api.get(`/chuc-vu${queryString ? '?' + queryString : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all chuc vu:', error);
      throw error;
    }
  },

  getChucVuById: async (id) => {
    try {
      const response = await api.get(`/chuc-vu/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chuc vu by id:', error);
      throw error;
    }
  },

  createChucVu: async (data) => {
    try {
      const response = await api.post('/chuc-vu', data);
      return response.data;
    } catch (error) {
      console.error('Error creating chuc vu:', error);
      throw error;
    }
  },

  updateChucVu: async (id, data) => {
    try {
      const response = await api.put(`/chuc-vu/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating chuc vu:', error);
      throw error;
    }
  },

  deleteChucVu: async (id) => {
    try {
      const response = await api.delete(`/chuc-vu/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting chuc vu:', error);
      throw error;
    }
  },

  updateThuTu: async (list) => {
    try {
      const response = await api.put('/chuc-vu/reorder', { list });
      return response.data;
    } catch (error) {
      console.error('Error updating thu tu:', error);
      throw error;
    }
  }
};

export default chucVuService;
