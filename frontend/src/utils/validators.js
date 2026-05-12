import * as yup from 'yup'

// Validation messages tiếng Việt
yup.setLocale({
  mixed: {
    required: 'Trường này là bắt buộc',
    notType: 'Giá trị không hợp lệ',
  },
  string: {
    email: 'Email không hợp lệ',
    min: 'Tối thiểu ${min} ký tự',
    max: 'Tối đa ${max} ký tự',
  },
  number: {
    min: 'Giá trị tối thiểu là ${min}',
    max: 'Giá trị tối đa là ${max}',
    positive: 'Giá trị phải lớn hơn 0',
  },
})

// Schema đăng nhập
export const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
})

// Schema đăng ký
export const registerSchema = yup.object({
  HoTen: yup.string().required(),
  Email: yup.string().email().required(),
  MatKhau: yup.string().min(6).required(),
  SoDienThoai: yup.string().matches(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ'),
  DiaChi: yup.string(),
})

// Schema tạo đơn yêu cầu
export const applicationSchema = yup.object({
  LyDo: yup.string().required(),
  SoTienYeuCau: yup.number().positive().required(),
  MaQuy: yup.number().required(),
})

// Schema tạo quỹ
export const fundSchema = yup.object({
  TenQuy: yup.string().required(),
  MoTa: yup.string(),
  SoDuHienTai: yup.number().min(0).required(),
  TrangThai: yup.string().required(),
})

export default yup
