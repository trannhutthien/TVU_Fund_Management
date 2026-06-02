-- ============================================
-- COMPLETE DATABASE SCHEMA
-- TVU Fund Management System
-- Database: tvu_fund_management
-- ============================================

-- ============================================
-- 1. BẢNG VAI TRÒ (vaitro)
-- Quản lý các vai trò trong hệ thống
-- ============================================
CREATE TABLE IF NOT EXISTS vaitro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ten_vai_tro VARCHAR(50) NOT NULL COMMENT 'Tên vai trò',
  mo_ta TEXT NULL COMMENT 'Mô tả vai trò',
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_ten_vai_tro (ten_vai_tro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Vai trò người dùng';

-- Dữ liệu mẫu vai trò
INSERT INTO vaitro (id, ten_vai_tro, mo_ta) VALUES
(1, 'Admin', 'Quản trị viên hệ thống'),
(2, 'Kế toán', 'Nhân viên kế toán'),
(3, 'Cán bộ Quỹ', 'Cán bộ quản lý quỹ'),
(4, 'Người dùng', 'Sinh viên/Người dùng thường')
ON DUPLICATE KEY UPDATE 
  ten_vai_tro = VALUES(ten_vai_tro),
  mo_ta = VALUES(mo_ta);

-- ============================================
-- 2. BẢNG NGƯỜI DÙNG (nguoidung)
-- Lưu thông tin tất cả người dùng trong hệ thống
-- ============================================
CREATE TABLE IF NOT EXISTS nguoidung (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Thông tin đăng nhập
  email VARCHAR(100) NOT NULL COMMENT 'Email đăng nhập',
  mat_khau VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã hash',
  
  -- Thông tin cá nhân
  ho_ten VARCHAR(100) NOT NULL COMMENT 'Họ và tên',
  ma_so_dinh_danh VARCHAR(20) NULL COMMENT 'MSSV hoặc MSCB',
  ngay_sinh DATE NULL COMMENT 'Ngày sinh',
  gioi_tinh ENUM('Nam', 'Nu', 'Khac') NULL COMMENT 'Giới tính',
  so_dien_thoai VARCHAR(15) NULL COMMENT 'Số điện thoại',
  dia_chi TEXT NULL COMMENT 'Địa chỉ',
  
  -- Thông tin học tập (cho sinh viên)
  khoa_phong VARCHAR(100) NULL COMMENT 'Khoa/Phòng ban',
  nganh_hoc VARCHAR(100) NULL COMMENT 'Ngành học',
  lop VARCHAR(50) NULL COMMENT 'Lớp',
  khoa_hoc VARCHAR(20) NULL COMMENT 'Khóa học (VD: 2020-2024)',
  
  -- Liên kết tài khoản ngân hàng
  taikhoannganhang_id INT NULL COMMENT 'ID tài khoản ngân hàng liên kết (FK)',
  
  -- Avatar
  avatar VARCHAR(255) NULL COMMENT 'Đường dẫn ảnh đại diện',
  
  -- Vai trò
  role_id INT NOT NULL DEFAULT 4 COMMENT 'ID vai trò (FK)',
  
  -- Trạng thái
  trang_thai ENUM('Hoat dong', 'Khoa', 'Cho duyet') DEFAULT 'Hoat dong' COMMENT 'Trạng thái tài khoản',
  
  -- Timestamps
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_email (email),
  INDEX idx_ma_so_dinh_danh (ma_so_dinh_danh),
  INDEX idx_role_id (role_id),
  INDEX idx_trang_thai (trang_thai),
  
  FOREIGN KEY (role_id) REFERENCES vaitro(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Người dùng hệ thống';

-- ============================================
-- 3. BẢNG NHÀ TÀI TRỢ (nhataitro)
-- Lưu thông tin các nhà tài trợ
-- ============================================
CREATE TABLE IF NOT EXISTS nhataitro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Thông tin cơ bản
  ten_nha_tai_tro VARCHAR(200) NOT NULL COMMENT 'Tên nhà tài trợ',
  loai_nha_tai_tro ENUM('Ca nhan', 'To chuc', 'Doanh nghiep') NOT NULL COMMENT 'Loại nhà tài trợ',
  
  -- Thông tin liên hệ
  email VARCHAR(100) NULL COMMENT 'Email liên hệ',
  so_dien_thoai VARCHAR(15) NULL COMMENT 'Số điện thoại',
  dia_chi TEXT NULL COMMENT 'Địa chỉ',
  website VARCHAR(255) NULL COMMENT 'Website',
  
  -- Thông tin bổ sung
  mo_ta TEXT NULL COMMENT 'Mô tả về nhà tài trợ',
  logo VARCHAR(255) NULL COMMENT 'Logo/Avatar nhà tài trợ',
  
  -- Liên kết với người dùng (nếu là cá nhân đã đăng ký)
  nguoi_dung_id INT NULL COMMENT 'ID người dùng (nếu có)',
  
  -- Trạng thái
  trang_thai ENUM('Hoat dong', 'Ngung hoat dong') DEFAULT 'Hoat dong' COMMENT 'Trạng thái',
  
  -- Timestamps
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_loai_nha_tai_tro (loai_nha_tai_tro),
  INDEX idx_trang_thai (trang_thai),
  INDEX idx_nguoi_dung_id (nguoi_dung_id),
  
  FOREIGN KEY (nguoi_dung_id) REFERENCES nguoidung(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhà tài trợ';

-- ============================================
-- 4. BẢNG QUỸ (quy)
-- Quản lý các quỹ hỗ trợ
-- ============================================
CREATE TABLE IF NOT EXISTS quy (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Thông tin quỹ
  ten_quy VARCHAR(200) NOT NULL COMMENT 'Tên quỹ',
  mo_ta TEXT NULL COMMENT 'Mô tả quỹ',
  hinh_anh VARCHAR(255) NULL COMMENT 'Hình ảnh đại diện quỹ',
  
  -- Thông tin tài chính
  so_tien_muc_tieu DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Số tiền mục tiêu',
  so_du DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Số dư hiện tại',
  
  -- Thông tin hỗ trợ
  so_tien_ho_tro_toi_da DECIMAL(15,2) NULL COMMENT 'Số tiền hỗ trợ tối đa/sinh viên',
  so_luong_ho_tro_toi_da INT NULL COMMENT 'Số lượng sinh viên được hỗ trợ tối đa',
  
  -- Điều kiện
  dieu_kien_ho_tro TEXT NULL COMMENT 'Điều kiện để được hỗ trợ',
  
  -- Thời gian
  ngay_bat_dau DATE NULL COMMENT 'Ngày bắt đầu nhận đơn',
  ngay_ket_thuc DATE NULL COMMENT 'Ngày kết thúc nhận đơn',
  
  -- Trạng thái
  trang_thai ENUM('Dang hoat dong', 'Tam dung', 'Da dong') DEFAULT 'Dang hoat dong' COMMENT 'Trạng thái quỹ',
  
  -- Người tạo
  nguoi_tao_id INT NULL COMMENT 'ID người tạo quỹ',
  
  -- Timestamps
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_trang_thai (trang_thai),
  INDEX idx_nguoi_tao_id (nguoi_tao_id),
  INDEX idx_ngay_bat_dau (ngay_bat_dau),
  INDEX idx_ngay_ket_thuc (ngay_ket_thuc),
  
  FOREIGN KEY (nguoi_tao_id) REFERENCES nguoidung(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quỹ hỗ trợ';

-- ============================================
-- 5. BẢNG YÊU CẦU HỖ TRỢ (yeucauhotro)
-- Lưu các đơn xin hỗ trợ của sinh viên
-- ============================================
CREATE TABLE IF NOT EXISTS yeucauhotro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Thông tin sinh viên
  nguoi_dung_id INT NOT NULL COMMENT 'ID sinh viên nộp đơn',
  
  -- Thông tin quỹ
  quy_id INT NOT NULL COMMENT 'ID quỹ xin hỗ trợ',
  
  -- Thông tin đơn
  ly_do TEXT NOT NULL COMMENT 'Lý do xin hỗ trợ',
  so_tien_de_nghi DECIMAL(15,2) NOT NULL COMMENT 'Số tiền đề nghị',
  
  -- Tài liệu đính kèm
  tai_lieu_dinh_kem TEXT NULL COMMENT 'Danh sách file đính kèm (JSON)',
  
  -- Trạng thái
  trang_thai ENUM(
    'Cho duyet cap 1',
    'Da duyet cap 1', 
    'Tu choi cap 1',
    'Cho duyet cap 2',
    'Da duyet cap 2',
    'Tu choi cap 2',
    'Cho duyet cap 3',
    'Da duyet cap 3',
    'Tu choi cap 3',
    'Cho giai ngan',
    'Da giai ngan',
    'Tu choi'
  ) DEFAULT 'Cho duyet cap 1' COMMENT 'Trạng thái đơn',
  
  -- Ghi chú
  ghi_chu TEXT NULL COMMENT 'Ghi chú từ cán bộ',
  
  -- Timestamps
  ngay_nop TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày nộp đơn',
  ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_nguoi_dung_id (nguoi_dung_id),
  INDEX idx_quy_id (quy_id),
  INDEX idx_trang_thai (trang_thai),
  INDEX idx_ngay_nop (ngay_nop),
  
  FOREIGN KEY (nguoi_dung_id) REFERENCES nguoidung(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (quy_id) REFERENCES quy(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Yêu cầu hỗ trợ';

-- ============================================
-- 6. BẢNG PHÊ DUYỆT (pheduyet)
-- Lưu lịch sử phê duyệt 3 cấp
-- ============================================
CREATE TABLE IF NOT EXISTS pheduyet (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Thông tin đơn
  yeu_cau_id INT NOT NULL COMMENT 'ID yêu cầu hỗ trợ',
  
  -- Thông tin phê duyệt
  cap_duyet TINYINT NOT NULL COMMENT 'Cấp duyệt (1, 2, 3)',
  nguoi_duyet_id INT NOT NULL COMMENT 'ID người phê duyệt',
  
  -- Kết quả
  ket_qua ENUM('Duyet', 'Tu choi') NOT NULL COMMENT 'Kết quả phê duyệt',
  ly_do TEXT NULL COMMENT 'Lý do (nếu từ chối)',
  ghi_chu TEXT NULL COMMENT 'Ghi chú',
  
  -- Timestamps
  ngay_duyet TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày phê duyệt',
  
  INDEX idx_yeu_cau_id (yeu_cau_id),
  INDEX idx_nguoi_duyet_id (nguoi_duyet_id),
  INDEX idx_cap_duyet (cap_duyet),
  INDEX idx_ket_qua (ket_qua),
  
  FOREIGN KEY (yeu_cau_id) REFERENCES yeucauhotro(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (nguoi_duyet_id) REFERENCES nguoidung(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Phê duyệt đơn';

-- ============================================
-- 7. BẢNG KHOẢN TÀI TRỢ (khoantaitro)
-- Lưu các khoản tài trợ từ nhà tài trợ
-- ============================================
CREATE TABLE IF NOT EXISTS khoantaitro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Thông tin nhà tài trợ
  nha_tai_tro_id INT NOT NULL COMMENT 'ID nhà tài trợ',
  
  -- Thông tin quỹ
  quy_id INT NOT NULL COMMENT 'ID quỹ nhận tài trợ',
  
  -- Thông tin khoản tài trợ
  so_tien DECIMAL(15,2) NOT NULL COMMENT 'Số tiền tài trợ',
  hinh_thuc ENUM('Tien mat', 'Chuyen khoan', 'Khac') NOT NULL COMMENT 'Hình thức tài trợ',
  
  -- Thông tin giao dịch
  ma_giao_dich VARCHAR(100) NULL COMMENT 'Mã giao dịch',
  ngay_tai_tro DATE NOT NULL COMMENT 'Ngày tài trợ',
  
  -- Chứng từ
  chung_tu VARCHAR(255) NULL COMMENT 'File chứng từ',
  
  -- Trạng thái
  trang_thai ENUM('Cho xac nhan', 'Da nhan', 'Tu choi') DEFAULT 'Cho xac nhan' COMMENT 'Trạng thái',
  
  -- Ghi chú
  ghi_chu TEXT NULL COMMENT 'Ghi chú',
  
  -- Người xác nhận
  nguoi_xac_nhan_id INT NULL COMMENT 'ID người xác nhận',
  ngay_xac_nhan TIMESTAMP NULL COMMENT 'Ngày xác nhận',
  
  -- Timestamps
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_nha_tai_tro_id (nha_tai_tro_id),
  INDEX idx_quy_id (quy_id),
  INDEX idx_trang_thai (trang_thai),
  INDEX idx_ngay_tai_tro (ngay_tai_tro),
  
  FOREIGN KEY (nha_tai_tro_id) REFERENCES nhataitro(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (quy_id) REFERENCES quy(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (nguoi_xac_nhan_id) REFERENCES nguoidung(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Khoản tài trợ';

-- ============================================
-- 8. BẢNG GIAO DỊCH (giaodich)
-- Lưu lịch sử giao dịch giải ngân
-- ============================================
CREATE TABLE IF NOT EXISTS giaodich (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Thông tin đơn
  yeu_cau_id INT NOT NULL COMMENT 'ID yêu cầu hỗ trợ',
  
  -- Thông tin quỹ
  quy_id INT NOT NULL COMMENT 'ID quỹ',
  
  -- Thông tin sinh viên
  nguoi_nhan_id INT NOT NULL COMMENT 'ID sinh viên nhận tiền',
  
  -- Thông tin giao dịch
  so_tien DECIMAL(15,2) NOT NULL COMMENT 'Số tiền giải ngân',
  hinh_thuc ENUM('Tien mat', 'Chuyen khoan') NOT NULL COMMENT 'Hình thức giải ngân',
  ma_giao_dich VARCHAR(100) NULL COMMENT 'Mã giao dịch',
  
  -- Chứng từ
  chung_tu VARCHAR(255) NULL COMMENT 'File chứng từ',
  
  -- Trạng thái
  trang_thai ENUM('Thanh cong', 'That bai', 'Dang xu ly') DEFAULT 'Dang xu ly' COMMENT 'Trạng thái',
  
  -- Ghi chú
  ghi_chu TEXT NULL COMMENT 'Ghi chú',
  
  -- Người thực hiện
  nguoi_thuc_hien_id INT NOT NULL COMMENT 'ID kế toán thực hiện',
  
  -- Timestamps
  ngay_giao_dich TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày giao dịch',
  ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_yeu_cau_id (yeu_cau_id),
  INDEX idx_quy_id (quy_id),
  INDEX idx_nguoi_nhan_id (nguoi_nhan_id),
  INDEX idx_nguoi_thuc_hien_id (nguoi_thuc_hien_id),
  INDEX idx_trang_thai (trang_thai),
  INDEX idx_ngay_giao_dich (ngay_giao_dich),
  
  FOREIGN KEY (yeu_cau_id) REFERENCES yeucauhotro(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (quy_id) REFERENCES quy(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (nguoi_nhan_id) REFERENCES nguoidung(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (nguoi_thuc_hien_id) REFERENCES nguoidung(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Giao dịch giải ngân';

-- ============================================
-- 9. BẢNG TÀI KHOẢN NGÂN HÀNG (taikhoannganhang)
-- Lưu thông tin tài khoản ngân hàng của quỹ
-- ============================================
CREATE TABLE IF NOT EXISTS taikhoannganhang (
  taikhoannganhang_id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Thông tin quỹ
  quy_id INT NULL COMMENT 'ID quỹ (NULL nếu là tài khoản của người dùng)',
  
  -- Thông tin tài khoản
  sotaikhoan VARCHAR(50) NOT NULL COMMENT 'Số tài khoản',
  nganhang VARCHAR(100) NOT NULL COMMENT 'Tên ngân hàng',
  chinhanh VARCHAR(100) NULL COMMENT 'Chi nhánh',
  chutaikhoan VARCHAR(100) NOT NULL COMMENT 'Chủ tài khoản',
  
  -- Trạng thái
  trangthai ENUM('Hoat dong', 'Khoa') DEFAULT 'Hoat dong' COMMENT 'Trạng thái',
  
  -- Timestamps
  ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_quy_id (quy_id),
  INDEX idx_trangthai (trangthai),
  
  FOREIGN KEY (quy_id) REFERENCES quy(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tài khoản ngân hàng';

-- ============================================
-- 10. BẢNG SINH VIÊN NỔI BẬT (sinh_vien_noi_bat) - MỚI
-- Lưu thông tin sinh viên xuất sắc để hiển thị trên Landing Page
-- ============================================
CREATE TABLE IF NOT EXISTS sinh_vien_noi_bat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Thông tin sinh viên
  ho_ten VARCHAR(100) NOT NULL COMMENT 'Họ và tên sinh viên',
  khoa_phong VARCHAR(100) NULL COMMENT 'Khoa/Ngành học',
  nam_hoc VARCHAR(20) NULL COMMENT 'Năm học (VD: 2023-2024)',
  
  -- Hình ảnh
  hinh_anh VARCHAR(255) NULL COMMENT 'Đường dẫn ảnh sinh viên',
  
  -- Thông tin thành tích
  thanh_tich TEXT NULL COMMENT 'Mô tả thành tích nổi bật',
  
  -- Thứ tự hiển thị
  thu_tu INT DEFAULT 0 COMMENT 'Thứ tự hiển thị (số nhỏ hiển thị trước)',
  
  -- Trạng thái
  trang_thai ENUM('Hien thi', 'An') DEFAULT 'Hien thi' COMMENT 'Trạng thái hiển thị',
  
  -- Timestamps
  ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_trang_thai (trang_thai),
  INDEX idx_thu_tu (thu_tu)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sinh viên nổi bật hiển thị trên Landing Page';

-- Thêm dữ liệu mẫu sinh viên nổi bật
INSERT INTO sinh_vien_noi_bat (ho_ten, khoa_phong, nam_hoc, thanh_tich, thu_tu, trang_thai) VALUES
('Nguyễn Văn An', 'Công nghệ Thông tin', '2023-2024', 'Sinh viên xuất sắc, GPA 3.8/4.0. Đạt giải Nhất cuộc thi Lập trình cấp Quốc gia.', 1, 'Hien thi'),
('Trần Thị Bình', 'Kinh tế', '2023-2024', 'Thủ khoa khóa 2020. Tham gia nhiều hoạt động tình nguyện và đạt học bổng toàn phần.', 2, 'Hien thi'),
('Lê Minh Châu', 'Kỹ thuật', '2022-2023', 'Đạt giải Ba Olympic Toán học sinh viên toàn quốc. Nghiên cứu khoa học xuất sắc.', 3, 'Hien thi'),
('Phạm Thị Dung', 'Ngoại ngữ', '2023-2024', 'IELTS 8.0. Tham gia chương trình trao đổi sinh viên quốc tế tại Úc.', 4, 'Hien thi')
ON DUPLICATE KEY UPDATE 
  ho_ten = VALUES(ho_ten),
  khoa_phong = VALUES(khoa_phong),
  nam_hoc = VALUES(nam_hoc),
  thanh_tich = VALUES(thanh_tich),
  thu_tu = VALUES(thu_tu),
  trang_thai = VALUES(trang_thai);

-- ============================================
-- 12. BẢNG NHẬT KÝ HỆ THỐNG (nhat_ky_he_thong)
-- Quản lý nhật ký hoạt động của hệ thống
-- ============================================
CREATE TABLE IF NOT EXISTS nhat_ky_he_thong (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  nguoi_dung_id INT NULL COMMENT 'FK nguoidung',
  hanh_dong VARCHAR(100) NOT NULL COMMENT 'Hành động thực hiện',
  loai_doi_tuong VARCHAR(50) NULL COMMENT 'Loại thực thể bị tác động',
  doi_tuong_id INT NULL COMMENT 'ID của thực thể bị tác động',
  mo_ta TEXT NULL COMMENT 'Mô tả chi tiết hoạt động',
  du_lieu_cu JSON NULL COMMENT 'Dữ liệu trước khi đổi',
  du_lieu_moi JSON NULL COMMENT 'Dữ liệu sau khi đổi',
  ip_address VARCHAR(45) NULL COMMENT 'IP máy thực hiện',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_nguoi_dung_id (nguoi_dung_id),
  INDEX idx_hanh_dong (hanh_dong),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (nguoi_dung_id) REFERENCES nguoidung(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nhật ký hoạt động hệ thống';

-- Thêm khóa ngoại cho nguoidung liên kết với taikhoannganhang
ALTER TABLE nguoidung ADD CONSTRAINT fk_nguoidung_taikhoannganhang 
FOREIGN KEY (taikhoannganhang_id) REFERENCES taikhoannganhang(taikhoannganhang_id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- SUMMARY
-- ============================================
-- BẢNG MỚI TẠO:
-- 1. sinh_vien_noi_bat - Quản lý sinh viên nổi bật hiển thị trên Landing Page
-- 2. nhat_ky_he_thong - Quản lý nhật ký hoạt động của hệ thống
--
-- BẢNG CẬP NHẬT:
-- Không có bảng nào được cập nhật cấu trúc trong lần này
-- Chỉ có logic nghiệp vụ được cập nhật:
-- - Bảng quy: Thêm trạng thái 'Tam dung' và 'Da dong' (đã có sẵn trong ENUM)
-- - Bảng yeucauhotro: Logic tính toán số dư thực tế (không thay đổi cấu trúc)
-- ============================================
