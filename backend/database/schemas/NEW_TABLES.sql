-- ============================================
-- CÁC BẢNG MỚI TẠO
-- TVU Fund Management System
-- ============================================

-- ============================================
-- BẢNG SINH VIÊN NỔI BẬT (sinh_vien_noi_bat)
-- Tạo mới: 28/05/2026
-- Mục đích: Quản lý sinh viên xuất sắc hiển thị trên Landing Page
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

-- ============================================
-- DỮ LIỆU MẪU
-- ============================================

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
-- HƯỚNG DẪN SỬ DỤNG
-- ============================================

-- 1. Lấy danh sách sinh viên hiển thị công khai (cho Landing Page):
-- SELECT * FROM sinh_vien_noi_bat 
-- WHERE trang_thai = 'Hien thi' 
-- ORDER BY thu_tu ASC;

-- 2. Lấy tất cả sinh viên (cho Admin):
-- SELECT * FROM sinh_vien_noi_bat 
-- ORDER BY thu_tu ASC;

-- 3. Thêm sinh viên mới:
-- INSERT INTO sinh_vien_noi_bat (ho_ten, khoa_phong, nam_hoc, hinh_anh, thanh_tich, thu_tu, trang_thai)
-- VALUES ('Họ tên', 'Khoa', '2024-2025', 'path/to/image.jpg', 'Thành tích...', 5, 'Hien thi');

-- 4. Cập nhật thông tin sinh viên:
-- UPDATE sinh_vien_noi_bat 
-- SET ho_ten = 'Tên mới', khoa_phong = 'Khoa mới', thanh_tich = 'Thành tích mới'
-- WHERE id = 1;

-- 5. Ẩn/Hiện sinh viên:
-- UPDATE sinh_vien_noi_bat SET trang_thai = 'An' WHERE id = 1;
-- UPDATE sinh_vien_noi_bat SET trang_thai = 'Hien thi' WHERE id = 1;

-- 6. Xóa sinh viên:
-- DELETE FROM sinh_vien_noi_bat WHERE id = 1;

-- 7. Thay đổi thứ tự hiển thị:
-- UPDATE sinh_vien_noi_bat SET thu_tu = 1 WHERE id = 5;
