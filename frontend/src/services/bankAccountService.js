import api from './api'

export const bankAccountService = {
  // Lấy danh sách tài khoản ngân hàng
  getAll: async () => {
    const response = await api.get('/bank-accounts')
    return response.data
  },

  // Lấy danh sách tài khoản ngân hàng của một user bất kỳ
  // (Admin/Cán bộ dùng khi xét duyệt hồ sơ sinh viên)
  getByUserId: async (userId) => {
    const response = await api.get(`/bank-accounts/user/${userId}`)
    return response.data
  },

  // Thêm tài khoản ngân hàng mới
  create: async (data) => {
    const response = await api.post('/bank-accounts', data)
    return response.data
  },

  // Xóa tài khoản ngân hàng
  delete: async (id) => {
    const response = await api.delete(`/bank-accounts/${id}`)
    return response.data
  },

  // Đặt tài khoản mặc định
  setDefault: async (id) => {
    const response = await api.put(`/bank-accounts/${id}/set-default`)
    return response.data
  },
}
