import api from './api'
import { API_ENDPOINTS } from '@constants'

export const userService = {
  // Lấy tất cả người dùng
  getAll: async (params) => {
    const response = await api.get(API_ENDPOINTS.USERS, { params })
    return response.data
  },

  // Lấy người dùng theo ID
  getById: async (id) => {
    const response = await api.get(API_ENDPOINTS.USER_BY_ID(id))
    return response.data
  },

  // Tạo người dùng mới
  create: async (data) => {
    const response = await api.post(API_ENDPOINTS.USERS, data)
    return response.data
  },

  // Cập nhật người dùng
  update: async (id, data) => {
    const response = await api.put(API_ENDPOINTS.USER_BY_ID(id), data)
    return response.data
  },

  // Xóa người dùng
  delete: async (id) => {
    const response = await api.delete(API_ENDPOINTS.USER_BY_ID(id))
    return response.data
  },
}
