/**
 * Thông tin tài khoản ngân hàng nhà trường
 * Dùng để hiển thị cho Nhà tài trợ khi quyên góp
 * 
 * NOTE: Đây là hardcoded data cho MVP
 * Sau này có thể migrate sang database để Admin quản lý
 */

export const SCHOOL_BANK_INFO = {
  soTaiKhoan: '1234567890',
  tenNganHang: 'Vietcombank - Chi nhánh Trà Vinh',
  chuTaiKhoan: 'TRƯỜNG ĐẠI HỌC TRÀ VINH',
  // QR Code có thể thêm sau
  qrCodeUrl: null,
};

/**
 * Generate nội dung chuyển khoản động
 * Format: [TÊN QUỸ] - [TÊN NHÀ TÀI TRỢ]
 * 
 * @param {string} tenQuy - Tên quỹ được chọn
 * @param {string} tenNhaTaiTro - Tên nhà tài trợ
 * @returns {string} Nội dung chuyển khoản
 */
export const generateTransferContent = (tenQuy, tenNhaTaiTro) => {
  if (!tenQuy || !tenNhaTaiTro) return '';
  
  // Chuẩn hóa: Uppercase, bỏ dấu (optional - có thể thêm sau)
  const quyName = tenQuy.toUpperCase();
  const donorName = tenNhaTaiTro.toUpperCase();
  
  return `${quyName} - ${donorName}`;
};
