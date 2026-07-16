// Vai trò người dùng (numeric IDs matching backend vaitro table)
export const ROLES = {
  ADMIN: 1,
  KE_TOAN: 2,
  CAN_BO_QUY: 3,
  SINH_VIEN: 4,
  BAN_KIEM_SOAT: 5,
}

// Aliases for backward compatibility
export const ROLE_LABELS = {
  1: 'Quản trị viên',
  2: 'Kế toán',
  3: 'Cán bộ Quỹ',
  4: 'Sinh viên/Nhà tài trợ',
  5: 'Ban Kiểm soát',
}

// Mảng tất cả vai trò
export const ALL_ROLES = Object.values(ROLES)

// Kiểm tra vai trò
export const hasRole = (userRole, allowedRoles) => {
  if (!userRole) return false
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(userRole)
  }
  return userRole === allowedRoles
}
