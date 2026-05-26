import api from './api'
import { API_ENDPOINTS } from '@constants'

export const userService = {
  // Danh sách + filter + pagination
  getAll: async (params) => {
    const response = await api.get(API_ENDPOINTS.USERS, { params })
    return response.data
  },

  // 4 thẻ stats
  getStats: async () => {
    const response = await api.get(`${API_ENDPOINTS.USERS}/stats`)
    return response.data
  },

  // Chi tiết theo ID
  getById: async (id) => {
    const response = await api.get(API_ENDPOINTS.USER_BY_ID(id))
    return response.data
  },

  // Tạo người dùng mới
  create: async (data) => {
    const response = await api.post(API_ENDPOINTS.USERS, data)
    return response.data
  },

  // Cập nhật thông tin (PATCH — chỉ role_id = 4)
  update: async (id, data) => {
    const response = await api.patch(API_ENDPOINTS.USER_BY_ID(id), data)
    return response.data
  },

  // Khóa / mở khóa
  updateStatus: async (id, trangThai) => {
    const response = await api.put(`${API_ENDPOINTS.USER_BY_ID(id)}/status`, { trangThai })
    return response.data
  },

  // (giữ lại cho tương thích — hiện tại backend không hỗ trợ DELETE)
  delete: async (id) => {
    const response = await api.delete(API_ENDPOINTS.USER_BY_ID(id))
    return response.data
  },
}

export default userService
