import axios from 'axios'
import { toast } from 'react-toastify'

// Tạo axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Xử lý lỗi chung
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Xử lý lỗi 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
    }

    // Xử lý lỗi 403 - Forbidden
    if (error.response?.status === 403) {
      toast.error('Bạn không có quyền thực hiện thao tác này.')
    }

    // Xử lý lỗi 404 - Not Found
    if (error.response?.status === 404) {
      toast.error('Không tìm thấy dữ liệu.')
    }

    // Xử lý lỗi 500 - Server Error
    if (error.response?.status >= 500) {
      toast.error('Lỗi máy chủ. Vui lòng thử lại sau.')
    }

    // Hiển thị message từ server nếu có
    if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    }

    return Promise.reject(error)
  }
)

export default api
