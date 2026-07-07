import api from './api'
import { API_ENDPOINTS } from '@constants'

export const bankAccountService = {
  // Lấy danh sách tài khoản ngân hàng nhà trường (PUBLIC API - không cần auth)
  getSchoolBankAccounts: async () => {
    const response = await api.get(API_ENDPOINTS.BANK_ACCOUNTS_SCHOOL)
    return response.data
  },

  // ─── ADMIN: Quản lý tài khoản nhà trường ──────────────────────
  createSchoolBankAccount: async (data) => {
    const response = await api.post(API_ENDPOINTS.BANK_ACCOUNTS_SCHOOL, data)
    return response.data
  },

  updateSchoolBankAccount: async (id, data) => {
    const response = await api.put(`${API_ENDPOINTS.BANK_ACCOUNTS_SCHOOL}/${id}`, data)
    return response.data
  },

  deleteSchoolBankAccount: async (id) => {
    const response = await api.delete(`${API_ENDPOINTS.BANK_ACCOUNTS_SCHOOL}/${id}`)
    return response.data
  },

  // ─── User bank accounts ───────────────────────────────────────
  getAll: async () => {
    const response = await api.get('/bank-accounts')
    return response.data
  },

  getByUserId: async (userId) => {
    const response = await api.get(`/bank-accounts/user/${userId}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/bank-accounts', data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/bank-accounts/${id}`)
    return response.data
  },

  setDefault: async (id) => {
    const response = await api.put(`/bank-accounts/${id}/set-default`)
    return response.data
  },
}
