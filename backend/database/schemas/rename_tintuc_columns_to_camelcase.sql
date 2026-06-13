-- ═══════════════════════════════════════════════════════════════
-- MIGRATION: Đổi tên cột trong bảng tintuc sang camelCase
-- Ngày: 13/06/2024
-- Mục đích: Chuẩn hóa tên cột - Giữ gạch dưới cho khóa chính/ngoại
--           Bỏ gạch dưới cho các cột dữ liệu thông thường
-- ═══════════════════════════════════════════════════════════════

USE tvufund;

-- ═══════════════════════════════════════════════════════════════
-- BƯỚC 1: Đổi tên các cột (RENAME COLUMN)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE tintuc
  -- Cột khóa chính: GIỮ NGUYÊN (tintuc_id)
  -- Cột khóa ngoại: GIỮ NGUYÊN (nguoitao_id, nguoisua_id)
  
  -- Đổi các cột dữ liệu thông thường
  RENAME COLUMN mota_ngan TO motangan,
  RENAME COLUMN danh_muc TO danhmuc,
  RENAME COLUMN la_noi_bat TO lanoibat,
  RENAME COLUMN ngay_xuat_ban TO ngayxuatban,
  RENAME COLUMN trangthai TO trangthai;  -- Đã không có gạch dưới rồi

-- ═══════════════════════════════════════════════════════════════
-- BƯỚC 2: Cập nhật COMMENT cho cột lanoibat
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE tintuc
  MODIFY COLUMN lanoibat TINYINT(1) DEFAULT 0 
  COMMENT '0=Bình thường, 1=Featured lớn, 2=Featured nhỏ hàng dưới, 3=Sidebar';

-- ═══════════════════════════════════════════════════════════════
-- BƯỚC 3: Xem lại cấu trúc bảng sau khi đổi tên
-- ═══════════════════════════════════════════════════════════════

DESC tintuc;

-- ═══════════════════════════════════════════════════════════════
-- KẾT QUẢ MONG ĐỢI:
-- ═══════════════════════════════════════════════════════════════
-- tintuc_id        INT (PK) - Giữ gạch dưới
-- tieude           VARCHAR
-- motangan         VARCHAR (đổi từ mota_ngan)
-- noidung          TEXT
-- avatar           VARCHAR
-- danhmuc          VARCHAR (đổi từ danh_muc)
-- lanoibat         TINYINT (đổi từ la_noi_bat) - Với comment mới
-- trangthai        VARCHAR
-- ngayxuatban      DATETIME (đổi từ ngay_xuat_ban)
-- nguoitao_id      INT (FK) - Giữ gạch dưới
-- nguoisua_id      INT (FK) - Giữ gạch dưới
-- ngaytao          TIMESTAMP
-- ngaycapnhat      TIMESTAMP
-- ═══════════════════════════════════════════════════════════════
