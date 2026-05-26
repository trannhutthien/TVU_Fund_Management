import axios from 'axios'
import { toast } from 'react-toastify'
import useAuthStore from '@stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage')
    let token = null
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage)
        token = parsed?.state?.token
      } catch (e) {
        token = null
      }
    }
    if (!token) {
      token = localStorage.getItem('token')
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

const forceLogout = () => {
  const store = useAuthStore.getState()
  if (store.isAuthenticated) {
    store.logout()
    toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
    window.location.href = '/'
  }
}

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const authStorage = localStorage.getItem('auth-storage')
      let refreshToken = null
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage)
          refreshToken = localStorage.getItem('refreshToken')
        } catch (e) {
          refreshToken = null
        }
      }

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/refresh-token`,
            { refreshToken }
          )

          if (response.data?.success) {
            const { accessToken, refreshToken: newRefreshToken } = response.data
            useAuthStore.getState().login(useAuthStore.getState().user, accessToken)
            localStorage.setItem('refreshToken', newRefreshToken)
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return api(originalRequest)
          } else {
            forceLogout()
          }
        } catch (refreshError) {
          forceLogout()
        }
      } else {
        forceLogout()
      }
    }

    if (error.response?.status === 403) {
      toast.error('Bạn không có quyền thực hiện thao tác này.')
    }

    if (error.response?.status === 404) {
      toast.error('Không tìm thấy dữ liệu.')
    }

    if (error.response?.status >= 500) {
      toast.error('Lỗi máy chủ. Vui lòng thử lại sau.')
    }

    if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    }

    return Promise.reject(error)
  }
)

export default api
