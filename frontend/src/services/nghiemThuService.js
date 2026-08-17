import api from './api'

const nghiemThuService = {
  createInspection: async (yeucauhotroId, loaiKiemTra, { soQuyetDinh, fileBienBan, nhanXet } = {}) => {
    const response = await api.post('/nghiem-thu', {
      yeucauhotroId, loaiKiemTra, soQuyetDinh, fileBienBan, nhanXet
    })
    return response.data
  },

  updateResult: async (id, { ketqua, nhanXet, soQuyetDinh, fileBienBan, ngayNghiemThu }) => {
    const response = await api.put(`/nghiem-thu/${id}`, {
      ketqua, nhanXet, soQuyetDinh, fileBienBan, ngayNghiemThu
    })
    return response.data
  },

  updateInspection: async (id, { nhanXet, soQuyetDinh, fileBienBan }) => {
    const response = await api.put(`/nghiem-thu/${id}/edit`, {
      nhanXet, soQuyetDinh, fileBienBan
    })
    return response.data
  },

  deleteInspection: async (id) => {
    const response = await api.delete(`/nghiem-thu/${id}`)
    return response.data
  },

  getInspectionHistory: async (yeucauhotroId) => {
    const response = await api.get(`/nghiem-thu/application/${yeucauhotroId}`)
    return response.data
  },

  getDetail: async (yeucauhotroId) => {
    const response = await api.get(`/nghiem-thu/application/${yeucauhotroId}/detail`)
    return response.data
  },
}

export default nghiemThuService
