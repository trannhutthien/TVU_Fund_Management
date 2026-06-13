import api from './api';
import { API_ENDPOINTS } from '@constants';

export const guestService = {
  // Gửi đơn xin hỗ trợ vãng lai
  submitApplication: async (data) => {
    const response = await api.post(API_ENDPOINTS.GUEST_SUBMIT_APPLICATION, data);
    return response.data;
  },

  // Gửi đóng góp tài trợ vãng lai
  submitDonation: async (data) => {
    const response = await api.post(API_ENDPOINTS.GUEST_SUBMIT_DONATION, data);
    return response.data;
  },

  // Xác thực mã OTP và di chuyển đơn sang hệ thống chính
  verifyOtp: async (data) => {
    const response = await api.post(API_ENDPOINTS.GUEST_VERIFY_OTP, data);
    return response.data;
  },

  // Tra cứu trạng thái đơn vãng lai bằng UUID
  trackStatus: async (uuid) => {
    const response = await api.get(API_ENDPOINTS.GUEST_TRACK(uuid));
    return response.data;
  }
};
