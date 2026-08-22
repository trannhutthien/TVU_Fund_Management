export const DONATION_STEPS = [
  { id: 1, label: 'Thông tin', key: 'donorInfo' },
  { id: 2, label: 'Chi tiết', key: 'donationDetails' },
  { id: 3, label: 'Xác nhận', key: 'review' },
];

export const DESTINATION_TYPES = {
  EXISTING_FUND: 'existingFund',
  PROPOSE_PROGRAM: 'proposeProgram',
};

export const PAYMENT_METHODS = {
  TRUC_TUYEN: 'Truc tuyen',
  CHUYEN_KHOAN: 'Chuyen khoan',
  TIEN_MAT: 'Tien mat',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.TRUC_TUYEN]: 'Trực tuyến',
  [PAYMENT_METHODS.TIEN_MAT]: 'Bằng tiền mặt',
};

export const LOAI_HO_TRO = [
  { value: 'Tai tro khong hoan lai', label: 'Tài trợ không thu hồi' },
  { value: 'Tai tro co thu hoi', label: 'Tài trợ thu hồi một phần' },
  { value: 'Cho vay', label: 'Tài trợ thu hồi toàn phần' },
];

export const DONATION_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000, 5000000];

export const FILE_CONFIG = {
  maxCount: 3,
  maxSizeMB: 5,
  acceptTypes: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  acceptLabel: 'PDF, JPG, PNG, DOC, DOCX (tối đa 5MB/file)',
};

export const LOAI_NHA_TAI_TRO = [
  { value: 'Ca nhan', label: 'Cá nhân' },
  { value: 'To chuc', label: 'Tổ chức' },
  { value: 'Doanh nghiep', label: 'Doanh nghiệp' },
  { value: 'Doi tac', label: 'Đối tác' },
];

export const QUICK_AMOUNTS = [
  { value: 100000, label: '100K' },
  { value: 200000, label: '200K' },
  { value: 500000, label: '500K' },
  { value: 1000000, label: '1M' },
  { value: 2000000, label: '2M' },
  { value: 5000000, label: '5M' },
];
