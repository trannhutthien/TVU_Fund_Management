import api from './api'

const thongBaoService = {
  getUnreadCount: () => api.get('/thong-bao/unread-count'),
  
  getNotifications: () => api.get('/thong-bao'),
  
  markAsRead: (id) => api.put(`/thong-bao/${id}/doc`),
  
  markAllAsRead: () => api.put('/thong-bao/doc-tat-ca'),
}

export default thongBaoService
