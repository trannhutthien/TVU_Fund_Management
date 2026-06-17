import api from './api'
import { API_ENDPOINTS } from '@constants'

export const applicationService = {
  // Lấy tất cả đơn yêu cầu
  getAll: async (params) => {
    const response = await api.get(API_ENDPOINTS.APPLICATIONS, { params })
    return response.data
  },

  // Lấy đơn yêu cầu theo ID
  getById: async (id) => {
    const response = await api.get(API_ENDPOINTS.APPLICATION_BY_ID(id))
    return response.data
  },

  // Lấy đơn yêu cầu của tôi
  getMyApplications: async (params) => {
    const response = await api.get(API_ENDPOINTS.MY_APPLICATIONS, { params })
    return response.data
  },

  // Tạo đơn yêu cầu mới
  create: async (data) => {
    const response = await api.post(API_ENDPOINTS.APPLICATIONS, data)
    return response.data
  },

  // Cập nhật đơn yêu cầu
  update: async (id, data) => {
    const response = await api.put(API_ENDPOINTS.APPLICATION_BY_ID(id), data)
    return response.data
  },

  // Xóa đơn yêu cầu
  delete: async (id) => {
    const response = await api.delete(API_ENDPOINTS.APPLICATION_BY_ID(id))
    return response.data
  },

  // Phê duyệt cấp 1 (GV Chu Nhiem)
  approveLevel1: async (id, data) => {
    const response = await api.post(API_ENDPOINTS.APPROVE_LEVEL_1(id), data)
    return response.data
  },

  // Từ chối cấp 1
  rejectLevel1: async (id, data) => {
    const response = await api.post(API_ENDPOINTS.REJECT_LEVEL_1(id), data)
    return response.data
  },

  // Phê duyệt cấp 2 (Giao Vu/Admin)
  approveLevel2: async (id, data) => {
    const response = await api.post(API_ENDPOINTS.APPROVE_LEVEL_2(id), data)
    return response.data
  },

  // Từ chối cấp 2
  rejectLevel2: async (id, data) => {
    const response = await api.post(API_ENDPOINTS.REJECT_LEVEL_2(id), data)
    return response.data
  },

  // Phê duyệt cấp 3 (Ke Toan)
  approveLevel3: async (id, data) => {
    const response = await api.post(API_ENDPOINTS.APPROVE_LEVEL_3(id), data)
    return response.data
  },

  // Từ chối cấp 3
  rejectLevel3: async (id, data) => {
    const response = await api.post(API_ENDPOINTS.REJECT_LEVEL_3(id), data)
    return response.data
  },

  // Gọi trợ lý AI gợi ý và tối ưu nội dung
  getAiSuggestion: async (data) => {
    const response = await api.post(API_ENDPOINTS.AI_SUGGEST, data, { timeout: 30000 })
    return response.data
  },
}

