-- =====================================================
-- MIGRATION: Deploy schema mới lên Aiven
-- Ngày: 2026-07-15
-- Mục đích: Cập nhật các bảng mới + sửa đổi schema
-- =====================================================

-- -----------------------------------------------------
-- 0. DROP bảng cũ nếu cần recreate
-- -----------------------------------------------------
DROP TABLE IF EXISTS `danhgia`;
DROP TABLE IF EXISTS `chucvuquy`;

-- -----------------------------------------------------
-- 1. BẢNG MỚI: danhgia (Đánh giá / phản hồi)
-- -----------------------------------------------------
CREATE TABLE `danhgia` (
  `danhgia_id` int(11) NOT NULL AUTO_INCREMENT,
  `nguoidung_id` int(11) NOT NULL,
  `noidung` text NOT NULL,
  `trangthai` varchar(30) DEFAULT 'Cho duyet',
  `lydotuchoi` text DEFAULT NULL,
  `nguoiduyet_id` int(11) DEFAULT NULL,
  `ngayduyet` datetime DEFAULT NULL,
  `noibat` tinyint(1) DEFAULT 0,
  `thutu` int(11) DEFAULT 0,
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`danhgia_id`),
  KEY `idx_nguoidung` (`nguoidung_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 2. BẢNG MỚI: chucvuquy (Chức vụ tổ chức trong Quỹ)
-- -----------------------------------------------------
CREATE TABLE `chucvuquy` (
  `chucvu_id` int(11) NOT NULL AUTO_INCREMENT,
  `nguoidung_id` int(11) DEFAULT NULL,
  `tenchucvu` varchar(100) NOT NULL,
  `mota` text DEFAULT NULL,
  `trangthai` enum('Dang nhiem vu','Het nhiem ky') DEFAULT 'Dang nhiem vu',
  `ngaybatdau` date DEFAULT NULL,
  `ngayketthuc` date DEFAULT NULL,
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`chucvu_id`),
  KEY `idx_nguoidung` (`nguoidung_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 3. CỘT MỚI: nguoidung.donvicongtac
-- -----------------------------------------------------
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'defaultdb' AND TABLE_NAME = 'nguoidung' AND COLUMN_NAME = 'donvicongtac');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `nguoidung` ADD COLUMN `donvicongtac` varchar(200) DEFAULT NULL AFTER `tinhtrangcongtac`', 'SELECT "donvicongtac already exists" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- -----------------------------------------------------
-- 4. CỘT MỚI: yeucauhotro.laidetac
-- -----------------------------------------------------
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'defaultdb' AND TABLE_NAME = 'yeucauhotro' AND COLUMN_NAME = 'laidetac');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `yeucauhotro` ADD COLUMN `laidetac` tinyint(1) DEFAULT 0 AFTER `canghiemthu`', 'SELECT "laidetac already exists" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- -----------------------------------------------------
-- 5. CỘT MỚI: quy.sotienhotrotoida
-- -----------------------------------------------------
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'defaultdb' AND TABLE_NAME = 'quy' AND COLUMN_NAME = 'sotienhotrotoida');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `quy` ADD COLUMN `sotienhotrotoida` decimal(15,2) DEFAULT NULL AFTER `sodu`', 'SELECT "sotienhotrotoida already exists" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- -----------------------------------------------------
-- 6. CỘT MỚI: quy.quy_cha_id (parent fund hierarchy)
-- -----------------------------------------------------
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'defaultdb' AND TABLE_NAME = 'quy' AND COLUMN_NAME = 'quy_cha_id');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `quy` ADD COLUMN `quy_cha_id` int(11) DEFAULT NULL AFTER `quy_id`', 'SELECT "quy_cha_id already exists" AS status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- -----------------------------------------------------
-- 7. DỮ LIỆU: loaiquy (9 loại quỹ)
-- -----------------------------------------------------
INSERT IGNORE INTO `loaiquy` (`loaiquy_id`, `maloai`, `tenloai`) VALUES
(1, 'PHAT_TRIEN', 'Phat trien'),
(2, 'HOC_BONG', 'Hoc bong'),
(3, 'NGHIEN_CUU', 'Nghien cuu khoa hoc'),
(4, 'VAY_VON', 'Vay von sinh vien'),
(5, 'KHOI_NGHIEP', 'Khoi nghiep'),
(6, 'HOAT_DONG_PHONG_TRAO', 'Hoat dong phong trao'),
(7, 'XA_HOI', 'Xa hoi - Tu thien'),
(8, 'CO_SO_VAT_CHAT', 'Co so vat chat'),
(9, 'DAO_TAO', 'Dao tao & Doi moi');

-- -----------------------------------------------------
-- 8. DỮ LIỆU: Quỹ mẹ (insert nếu chưa có quy_id=1)
-- -----------------------------------------------------
INSERT IGNORE INTO `quy` (`quy_id`, `tenquy`, `loaiquy_id`, `mota`, `sotienmuctieu`, `sodu`, `trangthai`, `ngaybatdau`, `loaidieuhanh`) VALUES
(1, 'Quy phat trien Dai hoc Tra Vinh', 1, 'Quy me phat trien chung cua truong Dai hoc Tra Vinh', 2000000000.00, 2000000000.00, 'Dang hoat dong', '2026-07-15', 'Tap trung - Be chung');

-- -----------------------------------------------------
-- HOÀN TẤT
-- -----------------------------------------------------
SELECT 'Migration hoan tat!' AS status;
