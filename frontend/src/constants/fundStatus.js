// Trạng thái quỹ
export const FUND_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  CLOSED: 'Closed',
}

// Màu sắc
export const FUND_STATUS_COLORS = {
  [FUND_STATUS.ACTIVE]: 'success',
  [FUND_STATUS.INACTIVE]: 'warning',
  [FUND_STATUS.CLOSED]: 'default',
}

// Nhãn tiếng Việt
export const FUND_STATUS_LABELS = {
  [FUND_STATUS.ACTIVE]: 'Đang hoạt động',
  [FUND_STATUS.INACTIVE]: 'Tạm ngưng',
  [FUND_STATUS.CLOSED]: 'Đã đóng',
}
