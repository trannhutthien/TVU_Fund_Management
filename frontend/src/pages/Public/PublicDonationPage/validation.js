export const validateDonorInfo = (fields) => {
  const errors = {};

  if (!fields.hoTen?.trim()) {
    errors.hoTen = 'Vui lòng nhập họ và tên';
  }

  if (!fields.email?.trim()) {
    errors.email = 'Vui lòng nhập email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = 'Email không đúng định dạng';
  }

  if (!fields.soDienThoai?.trim()) {
    errors.soDienThoai = 'Vui lòng nhập số điện thoại';
  } else if (!/^[0-9]{10,11}$/.test(fields.soDienThoai.trim())) {
    errors.soDienThoai = 'Số điện thoại phải gồm 10-11 chữ số';
  }

  if (['To chuc', 'Doanh nghiep', 'Doi tac'].includes(fields.loaiNhaTaiTro)) {
    if (!fields.toChuc?.trim()) {
      errors.toChuc = 'Vui lòng nhập tên tổ chức/doanh nghiệp';
    }
  }

  return errors;
};

export const validateDonationDetails = (fields, destinationType) => {
  const errors = {};

  if (!destinationType) {
    errors.destinationType = 'Vui lòng chọn hình thức tài trợ';
  }

  if (destinationType === 'existingFund') {
    if (!fields.quyId) {
      errors.quyId = 'Vui lòng chọn quỹ';
    }
  }

  if (destinationType === 'proposeProgram') {
    if (!fields.quythanhPhanId) {
      errors.quythanhPhanId = 'Vui lòng chọn quỹ thành phần';
    }
    if (!fields.tenChuongTrinh?.trim()) {
      errors.tenChuongTrinh = 'Vui lòng nhập tên chương trình';
    }
    if (!fields.moTa?.trim()) {
      errors.moTa = 'Vui lòng nhập mô tả chương trình';
    }
    if (!fields.soLuongSuat || fields.soLuongSuat <= 0) {
      errors.soLuongSuat = 'Vui lòng nhập số lượng suất hợp lệ';
    }
    if (!fields.soTienMoiSuat || fields.soTienMoiSuat < 100000) {
      errors.soTienMoiSuat = 'Số tiền mỗi suất tối thiểu là 100,000 VNĐ';
    }
  }

  if (!fields.soTien || fields.soTien <= 0) {
    errors.soTien = 'Vui lòng nhập số tiền hợp lệ';
  } else if (fields.soTien < 10000) {
    errors.soTien = 'Số tiền tối thiểu là 10,000 VNĐ';
  }

  if (!fields.hinhThuc) {
    errors.hinhThuc = 'Vui lòng chọn hình thức đóng góp';
  }

  return errors;
};

export const isStepValid = (step, formData, destinationType) => {
  switch (step) {
    case 1:
      return Object.keys(validateDonorInfo(formData)).length === 0;
    case 2:
      return Object.keys(validateDonationDetails(formData, destinationType)).length === 0;
    case 3:
      return true;
    default:
      return false;
  }
};
