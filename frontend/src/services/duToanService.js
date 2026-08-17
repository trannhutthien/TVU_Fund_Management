import api from './api';

const duToanService = {
  getAll: async () => {
    const response = await api.get('/du-toan');
    return response.data;
  },

  getByYear: async (namtaichinh) => {
    const response = await api.get(`/du-toan/${namtaichinh}`);
    return response.data;
  },

  propose: async (payload) => {
    const response = await api.post('/du-toan', payload);
    return response.data;
  },

  approveLevel: async (id, capduyet, ketqua, lydotuchoi) => {
    const response = await api.put(`/du-toan/${id}/approve`, {
      capduyet,
      ketqua,
      lydotuchoi
    });
    return response.data;
  },

  getPreviousYearStats: async (nam) => {
    const response = await api.get(`/du-toan/thong-ke-nam-truoc/${nam}`);
    return response.data;
  },

  getChiTiet: async (id) => {
    const response = await api.get(`/du-toan/chi-tiet/${id}`);
    return response.data;
  }
};

export default duToanService;
