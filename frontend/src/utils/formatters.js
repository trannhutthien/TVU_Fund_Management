import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

// Format số tiền
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

// Format ngày tháng
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: vi })
  } catch (error) {
    return ''
  }
}

// Format ngày giờ
export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

// Format số điện thoại
export const formatPhone = (phone) => {
  if (!phone) return ''
  // Format: 0123 456 789
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
}

// Rút gọn text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
