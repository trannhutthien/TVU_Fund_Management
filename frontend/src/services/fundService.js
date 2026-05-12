import api from './api'
import { API_ENDPOINTS } from '@constants'

export const fundService = {
  // Lấy tất cả quỹ
  getAll: async (params) => {
    const response = await api.get(API_ENDPOINTS.FUNDS, { params })
    return response.data
  },

  // Lấy quỹ theo ID
  getById: async (id) => {
    const response = await api.get(API_ENDPOINTS.FUND_BY_ID(id))
    return response.data
  },

  // Tạo quỹ mới
  create: async (data) => {
    const response = await api.post(API_ENDPOINTS.FUNDS, data)
    return response.data
  },

  // Cập nhật quỹ
  update: async (id, data) => {
    const response = await api.put(API_ENDPOINTS.FUND_BY_ID(id), data)
    return response.data
  },

  // Xóa quỹ
  delete: async (id) => {
    const response = await api.delete(API_ENDPOINTS.FUND_BY_ID(id))
    return response.data
  },
}
