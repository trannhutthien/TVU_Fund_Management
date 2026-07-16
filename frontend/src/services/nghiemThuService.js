import api from './api'

const nghiemThuService = {
  createInspection: async (yeucauhotroId, loaiKiemTra) => {
    const response = await api.post('/nghiem-thu', { yeucauhotroId, loaiKiemTra })
    return response.data
  },

  updateResult: async (id, { ketqua, nhanXet, soQuyetDinh, fileBienBan }) => {
    const response = await api.put(`/nghiem-thu/${id}`, {
      ketqua, nhanXet, soQuyetDinh, fileBienBan
    })
    return response.data
  },

  getInspectionHistory: async (yeucauhotroId) => {
    const response = await api.get(`/nghiem-thu/application/${yeucauhotroId}`)
    return response.data
  },
}

export default nghiemThuService
