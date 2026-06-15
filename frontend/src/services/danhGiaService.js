import api from './api';

const danhGiaService = {
  getLanding: async () => {
    const response = await api.get('/danhgia/landing');
    return response.data;
  },

  getPublicList: async (params = {}) => {
    const response = await api.get('/danhgia', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/danhgia', data);
    return response.data;
  },

  getManagementList: async (params = {}) => {
    const response = await api.get('/danhgia/quan-ly', { params });
    return response.data;
  },

  updateTrangThai: async (id, data) => {
    const response = await api.patch(`/danhgia/${id}/trangthai`, data);
    return response.data;
  },

  updateNoiBat: async (id, data) => {
    const response = await api.patch(`/danhgia/${id}/noi-bat`, data);
    return response.data;
  },
};

export default danhGiaService;
