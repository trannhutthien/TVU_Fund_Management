import api from './api'
import { API_ENDPOINTS } from '@constants'

export const authService = {
  // Đăng nhập
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, credentials)
    return response.data
  },

  // Đăng ký
  register: async (userData) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, userData)
    return response.data
  },

  // Đăng xuất
  logout: async () => {
    const response = await api.post(API_ENDPOINTS.LOGOUT)
    return response.data
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    const response = await api.get(API_ENDPOINTS.ME)
    return response.data
  },

  // Cập nhật mật khẩu
  updatePassword: async (passwordData) => {
    const response = await api.put(API_ENDPOINTS.UPDATE_PASSWORD, passwordData)
    return response.data
  },

  // Quên mật khẩu - gửi mật khẩu mới qua email
  forgotPassword: async (email) => {
    const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email })
    return response.data
  },
}
