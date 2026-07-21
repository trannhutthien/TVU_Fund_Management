import api from './api';

const lichTraNoService = {
  getMyRepayments: () => api.get('/lich-tra-no/cua-toi'),

  submitProof: (lichtranoId, data) =>
    api.post(`/lich-tra-no/${lichtranoId}/nop-minh-chung`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  revokeProof: (lichtranoId) =>
    api.delete(`/lich-tra-no/${lichtranoId}/huy-minh-chung`),
};

export default lichTraNoService;
