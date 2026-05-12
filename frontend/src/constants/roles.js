// Vai trò người dùng
export const ROLES = {
  STUDENT: 'Student',
  GV_CHU_NHIEM: 'GV Chu Nhiem',
  GIAO_VU: 'Giao Vu',
  ADMIN: 'Admin',
  KE_TOAN: 'Ke Toan',
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
