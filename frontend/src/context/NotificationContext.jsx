import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import thongBaoService from '@services/thongBaoService'
import useAuthStore from '@stores/authStore'

const NotificationContext = createContext(null)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}

const transformNotification = (item) => ({
  id: item.thong_bao_id,
  isRead: item.daDoc === 1,
  type: item.loaithongbao,
  title: item.tieude,
  message: item.noidung,
  timestamp: item.ngaytao,
  link: item.duongdan,
})

export const NotificationProvider = ({ children }) => {
  const user = useAuthStore((s) => s.user)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return
    try {
      const res = await thongBaoService.getUnreadCount()
      setUnreadCount(res.data?.data?.unreadCount || 0)
    } catch (err) {
      console.error('Loi lay so thong bao chua doc:', err)
    }
  }, [user])

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await thongBaoService.getNotifications()
      const raw = res.data?.data?.notifications || []
      setNotifications(raw.map(transformNotification))
    } catch (err) {
      console.error('Loi lay thong bao:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const markAsRead = useCallback(async (id) => {
    try {
      await thongBaoService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Loi danh dau da doc:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await thongBaoService.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Loi danh dau tat ca da doc:', err)
    }
  }, [])

  const deleteNotification = useCallback(async (id) => {
    try {
      await thongBaoService.deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      fetchUnreadCount()
    } catch (err) {
      console.error('Loi xoa thong bao:', err)
    }
  }, [fetchUnreadCount])

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      fetchNotifications()
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user, fetchUnreadCount, fetchNotifications])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
