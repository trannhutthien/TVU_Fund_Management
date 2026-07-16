import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

// ── TIỀN TỆ ──────────────────────────────────────────────────────────────────

/**
 * Format số tiền: 1500000 → "1.500.000 đ"
 * @param {number|string|null} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  const n = Number(amount)
  if (!amount && amount !== 0 || isNaN(n)) return '0đ'
  return n.toLocaleString('vi-VN') + 'đ'
}

/**
 * Format số tiền rút gọn: 2000000000 → "2 tỷ", 280000000 → "280 triệu"
 * @param {number|string|null} amount
 * @returns {string}
 */
export const formatCurrencyShort = (amount) => {
  const n = Number(amount)
  if (!amount && amount !== 0 || isNaN(n)) return '0đ'
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} tỷ`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} triệu`
  return n.toLocaleString('vi-VN') + 'đ'
}

/**
 * Format số tiền Intl (chuẩn quốc tế): 1500000 → "1.500.000 ₫"
 * @param {number|string|null} amount
 * @returns {string}
 */
export const formatCurrencyIntl = (amount) => {
  if (!amount && amount !== 0) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

/**
 * Format số tiền không suffix: 1500000 → "1.500.000"
 * Dùng cho hiển thị trong input preview, error message, etc.
 * @param {number|string|null} amount
 * @returns {string}
 */
export const formatCurrencyPlain = (amount) => {
  const n = Number(amount)
  if (!amount && amount !== 0 || isNaN(n)) return '0'
  return n.toLocaleString('vi-VN')
}

// ── SỐ ───────────────────────────────────────────────────────────────────────

/**
 * Format số: 1234567 → "1.234.567"
 * @param {number|string|null} num
 * @returns {string}
 */
export const formatNumber = (num) => {
  const n = Number(num)
  if (!num && num !== 0 || isNaN(n)) return '0'
  return n.toLocaleString('vi-VN')
}

// ── NGÀY THÁNG ───────────────────────────────────────────────────────────────

/**
 * Format ngày tháng: "2024-12-15" → "15/12/2024"
 * @param {string|Date|null} date
 * @param {string} formatStr - date-fns format string
 * @returns {string}
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: vi })
  } catch {
    return ''
  }
}

/**
 * Format ngày giờ: "2024-12-15T10:30:00" → "15/12/2024 10:30"
 * @param {string|Date|null} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

/**
 * Tính số ngày còn lại đến một ngày: trả về số nguyên (âm = đã qua)
 * @param {string|Date|null} value - ngày đích
 * @returns {number|null}
 */
export const daysUntil = (value) => {
  if (!value) return null
  const d = new Date(value)
  if (isNaN(d.getTime())) return null
  const diff = d.getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ── CHUỖI ────────────────────────────────────────────────────────────────────

/**
 * Lấy ký tự đầu của tên: "Nguyễn Văn A" → "N"
 * @param {string|null} name
 * @returns {string}
 */
export const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?')

/**
 * Format số điện thoại: "0123456789" → "0123 456 789"
 * @param {string|null} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
}

/**
 * Rút gọn text: "abc..." @param {string|null} text @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// ── TRẠNG THÁI ───────────────────────────────────────────────────────────────

/**
 * Map trạng thái quỹ → badge type cho StatusBadge
 * @param {string} trangThai
 * @returns {string} 'approved' | 'processing' | 'cancelled' | 'pending'
 */
export const mapFundStatusToBadge = (trangThai) => {
  if (trangThai === 'Dang hoat dong') return 'approved'
  if (trangThai === 'Tam dung') return 'processing'
  if (trangThai === 'Da dong') return 'cancelled'
  return 'pending'
}

/**
 * Map trạng thái đơn → badge type
 * @param {string} trangThai
 * @returns {string}
 */
export const mapApplicationStatusToBadge = (trangThai) => {
  if (!trangThai) return 'pending'
  if (trangThai.includes('Da duyet') || trangThai === 'Da giai ngan' || trangThai === 'Da nghiem thu') return 'approved'
  if (trangThai.includes('Tu choi')) return 'rejected'
  if (trangThai.includes('Nghiem thu khong dat')) return 'rejected'
  return 'processing'
}

/**
 * Map trạng thái phê duyệt → badge type
 * @param {string} trangThai
 * @returns {string}
 */
export const mapApprovalStatusToBadge = (trangThai) => {
  if (trangThai === 'Da duyet') return 'approved'
  if (trangThai === 'Tu choi') return 'rejected'
  return 'pending'
}
