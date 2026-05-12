// Trạng thái đơn yêu cầu hỗ trợ
export const APPLICATION_STATUS = {
  PENDING: 'Pending',
  APPROVED_LEVEL_1: 'Approved Level 1',
  REJECTED_LEVEL_1: 'Rejected Level 1',
  APPROVED_LEVEL_2: 'Approved Level 2',
  REJECTED_LEVEL_2: 'Rejected Level 2',
  APPROVED_LEVEL_3: 'Approved Level 3',
  REJECTED_LEVEL_3: 'Rejected Level 3',
  COMPLETED: 'Completed',
}

// Màu sắc cho từng trạng thái (dùng cho Ant Design Tag)
export const STATUS_COLORS = {
  [APPLICATION_STATUS.PENDING]: 'default',
  [APPLICATION_STATUS.APPROVED_LEVEL_1]: 'processing',
  [APPLICATION_STATUS.REJECTED_LEVEL_1]: 'error',
  [APPLICATION_STATUS.APPROVED_LEVEL_2]: 'processing',
  [APPLICATION_STATUS.REJECTED_LEVEL_2]: 'error',
  [APPLICATION_STATUS.APPROVED_LEVEL_3]: 'processing',
  [APPLICATION_STATUS.REJECTED_LEVEL_3]: 'error',
  [APPLICATION_STATUS.COMPLETED]: 'success',
}

// Nhãn tiếng Việt
export const STATUS_LABELS = {
  [APPLICATION_STATUS.PENDING]: 'Chờ duyệt',
  [APPLICATION_STATUS.APPROVED_LEVEL_1]: 'Đã duyệt cấp 1',
  [APPLICATION_STATUS.REJECTED_LEVEL_1]: 'Từ chối cấp 1',
  [APPLICATION_STATUS.APPROVED_LEVEL_2]: 'Đã duyệt cấp 2',
  [APPLICATION_STATUS.REJECTED_LEVEL_2]: 'Từ chối cấp 2',
  [APPLICATION_STATUS.APPROVED_LEVEL_3]: 'Đã duyệt cấp 3',
  [APPLICATION_STATUS.REJECTED_LEVEL_3]: 'Từ chối cấp 3',
  [APPLICATION_STATUS.COMPLETED]: 'Hoàn thành',
}
