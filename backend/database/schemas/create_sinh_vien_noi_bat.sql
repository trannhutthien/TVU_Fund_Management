-- ============================================
-- BẢNG SINH VIÊN NỔI BẬT
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

-- Thêm dữ liệu mẫu
INSERT INTO sinh_vien_noi_bat (ho_ten, khoa_phong, nam_hoc, thanh_tich, thu_tu, trang_thai) VALUES
('Nguyễn Văn An', 'Công nghệ Thông tin', '2023-2024', 'Sinh viên xuất sắc, GPA 3.8/4.0. Đạt giải Nhất cuộc thi Lập trình cấp Quốc gia.', 1, 'Hien thi'),
('Trần Thị Bình', 'Kinh tế', '2023-2024', 'Thủ khoa khóa 2020. Tham gia nhiều hoạt động tình nguyện và đạt học bổng toàn phần.', 2, 'Hien thi'),
('Lê Minh Châu', 'Kỹ thuật', '2022-2023', 'Đạt giải Ba Olympic Toán học sinh viên toàn quốc. Nghiên cứu khoa học xuất sắc.', 3, 'Hien thi'),
('Phạm Thị Dung', 'Ngoại ngữ', '2023-2024', 'IELTS 8.0. Tham gia chương trình trao đổi sinh viên quốc tế tại Úc.', 4, 'Hien thi');
