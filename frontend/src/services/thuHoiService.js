import api from './api';

const thuHoiService = {
  submitProof: (id, data) =>
    api.post(`/thu-hoi/${id}/nop-tien`, data),

  getRecoveryList: (params) =>
    api.get('/thu-hoi/danh-sach', { params }),

  getRecoveryDetail: (id) =>
    api.get(`/thu-hoi/${id}`),

  getRecoveryDetailByYeuCauHoTro: (yeucauhotroId) =>
    api.get(`/thu-hoi/by-yeucau/${yeucauhotroId}`),

  getPaymentHistory: (id) =>
    api.get(`/thu-hoi/${id}/lich-su`),

  confirmPayment: (lanNopId, data) =>
    api.put(`/thu-hoi/${lanNopId}/xac-nhan`, data),

  rejectPayment: (lanNopId, data) =>
    api.put(`/thu-hoi/${lanNopId}/tu-choi`, data),

  cancelPayment: (lanNopId) =>
    api.delete(`/thu-hoi/${lanNopId}/huy`),
};

export default thuHoiService;
