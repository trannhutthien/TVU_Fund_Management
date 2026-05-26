import { createContext, useState, useEffect } from 'react'
import { authService } from '@services'
import useAuthStore from '@stores/authStore'
import { toast } from 'react-toastify'

export const AuthContext = createContext(null)

// Lấy token từ key Zustand `auth-storage` nếu không có ở key `token`
const readTokenFromStorage = () => {
  const direct = localStorage.getItem('token')
  if (direct) return direct
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.state?.token || null
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const storeUser = useAuthStore((s) => s.user)
  const storeLogin = useAuthStore((s) => s.login)
  const storeLogout = useAuthStore((s) => s.logout)

  const [user, setUser] = useState(storeUser || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const initAuth = async () => {
      if (storeUser) {
        if (!cancelled) {
          setUser(storeUser)
          setLoading(false)
        }
        return
      }

      const token = readTokenFromStorage()
      if (token) {
        try {
          const response = await authService.getCurrentUser()
          if (cancelled) return
          const fetchedUser = response?.data || response
          setUser(fetchedUser)
          storeLogin(fetchedUser, token)
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      if (!cancelled) setLoading(false)
    }

    initAuth()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setUser(storeUser || null)
  }, [storeUser])

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      const { token, user: userData } = response.data || response

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      storeLogin(userData, token)
      setUser(userData)

      toast.success('Đăng nhập thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      storeLogout()
      setUser(null)
      toast.info('Đã đăng xuất')
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
