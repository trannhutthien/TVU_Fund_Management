import api from './api';

const congNoService = {
  getTongQuan: () => api.get('/cong-no/tong-quan'),
  getDanhSach: (params) => api.get('/cong-no/danh-sach', { params }),
  getChiTiet: (yeucauhotroId) => api.get(`/cong-no/chi-tiet/${yeucauhotroId}`),
  confirmPayment: (lichtranoId, data) => api.put(`/cong-no/xac-nhan/${lichtranoId}`, data),
  rejectPayment: (lichtranoId, data) => api.put(`/cong-no/tu-choi/${lichtranoId}`, data),
  sendReminder: (lichtranoId) => api.post(`/cong-no/nhac-no/${lichtranoId}`),
  getNghiemThuList: (params) => api.get('/cong-no/nghiem-thu', { params }),
};

export default congNoService;
