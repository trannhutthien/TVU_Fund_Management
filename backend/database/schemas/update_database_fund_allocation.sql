-- ============================================
-- UPDATE DATABASE FOR FUND ALLOCATION
-- TVU Fund Management System
-- Rules: Viết liền không dấu _ cho tên bảng và tên cột, chỉ dùng dấu _ khi phía sau là id
-- ============================================

-- 1. Cập nhật bảng quy: thêm loaidieuhanh và quy_cha_id
ALTER TABLE quy 
ADD COLUMN loaidieuhanh ENUM('Tap trung - Be chung', 'Tap trung - Muc chi') NOT NULL DEFAULT 'Tap trung - Be chung' COMMENT 'Hình thức vận hành quỹ',
ADD COLUMN quy_cha_id INT NULL COMMENT 'ID của Quỹ cha (Bể tiền lớn)',
ADD CONSTRAINT fk_quy_parent FOREIGN KEY (quy_cha_id) REFERENCES quy(quy_id) ON DELETE SET NULL ON UPDATE CASCADE;

-- 2. Tạo bảng phanbongansach để quản lý trích lập ngân sách nội bộ
CREATE TABLE IF NOT EXISTS phanbongansach (
  phanbongansach_id INT AUTO_INCREMENT PRIMARY KEY,
  quy_nguon_id INT NOT NULL COMMENT 'ID của bể tiền lớn (quy_cha)',
  quy_dich_id INT NOT NULL COMMENT 'ID của mục chi (quy_con)',
  sotien DECIMAL(15,2) NOT NULL COMMENT 'Số tiền đề xuất trích lập',
  soquyetdinh VARCHAR(100) NOT NULL COMMENT 'Số quyết định trích lập',
  filequyetdinh VARCHAR(255) NULL COMMENT 'File minh chứng quyết định',
  
  -- Trạng thái phê duyệt
  trangthai ENUM('Cho duyet', 'Da duyet', 'Tu choi', 'Da thu hoi') NOT NULL DEFAULT 'Cho duyet' COMMENT 'Trạng thái đề xuất',
  lydotuchoi TEXT NULL COMMENT 'Lý do nếu bị từ chối duyệt',
  
  -- Nhân sự liên quan
  nguoi_de_xuat_id INT NOT NULL COMMENT 'Cán bộ đề xuất trích tiền',
  nguoi_duyet_id INT NULL COMMENT 'Người phê duyệt đề xuất (Admin)',
  ngaydexuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ngayduyet TIMESTAMP NULL,
  
  ghichu TEXT NULL,
  
  FOREIGN KEY (quy_nguon_id) REFERENCES quy(quy_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (quy_dich_id) REFERENCES quy(quy_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (nguoi_de_xuat_id) REFERENCES nguoidung(nguoidung_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (nguoi_duyet_id) REFERENCES nguoidung(nguoidung_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý trích lập ngân sách nội bộ';
