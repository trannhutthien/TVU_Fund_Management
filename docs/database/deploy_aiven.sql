-- =====================================================
-- MIGRATION: Deploy schema mới lên Aiven
-- Ngày: 2026-07-15
-- Mục đích: Cập nhật các bảng mới + sửa đổi schema
-- =====================================================

-- -----------------------------------------------------
-- 1. BẢNG MỚI: danhgia (Đánh giá / phản hồi)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `danhgia` (
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
CREATE TABLE IF NOT EXISTS `chucvuquy` (
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
ALTER TABLE `nguoidung`
  ADD COLUMN `donvicongtac` varchar(200) DEFAULT NULL AFTER `tinhtrangcongtac`;

-- -----------------------------------------------------
-- 4. CỘT MỚI: yeucauhotro.laidetac
-- -----------------------------------------------------
ALTER TABLE `yeucauhotro`
  ADD COLUMN `laidetac` tinyint(1) DEFAULT 0 AFTER `canghiemthu`;

-- -----------------------------------------------------
-- 5. CỘT MỚI: quy.sotienhotrotoida
-- -----------------------------------------------------
ALTER TABLE `quy`
  ADD COLUMN `sotienhotrotoida` decimal(15,2) DEFAULT NULL AFTER `sodu`;

-- -----------------------------------------------------
-- 6. CỘT MỚI: quy.quy_cha_id (parent fund hierarchy)
-- -----------------------------------------------------
ALTER TABLE `quy`
  ADD COLUMN `quy_cha_id` int(11) DEFAULT NULL AFTER `quy_id`,
  ADD KEY `idx_quy_cha` (`quy_cha_id`);

-- -----------------------------------------------------
-- 7. DỮ LIỆU: loaiquy (9 loại quỹ)
-- -----------------------------------------------------
INSERT IGNORE INTO `loaiquy` (`loaiquy_id`, `maloai`, `tenloai`) VALUES
(1, 'PHAT_TRIEN', 'Phát triển'),
(2, 'HOC_BONG', 'Học bổng'),
(3, 'NGHIEN_CUU', 'Nghiên cứu khoa học'),
(4, 'VAY_VON', 'Vay vốn sinh viên'),
(5, 'KHOI_NGHIEP', 'Khởi nghiệp'),
(6, 'HOAT_DONG_PHONG_TRAO', 'Hoạt động phong trào'),
(7, 'XA_HOI', 'Xã hội - Từ thiện'),
(8, 'CO_SO_VAT_CHAT', 'Cơ sở vật chất'),
(9, 'DAO_TAO', 'Đào tạo & Đổi mới');

-- -----------------------------------------------------
-- 8. DỮ LIỆU: Quỹ mẹ
-- -----------------------------------------------------
INSERT IGNORE INTO `quy` (`quy_id`, `tenquy`, `loaiquy_id`, `mota`, `sotienmuctieu`, `sodu`, `trangthai`, `ngaybatdau`, `loaidieuhanh`) VALUES
(1, 'Quỹ phát triển Đại học Trà Vinh', 1, 'Quỹ mẹ phát triển chung của trường Đại học Trà Vinh', 2000000000.00, 2000000000.00, 'Dang hoat dong', '2026-07-15', 'Tap trung - Be chung');

-- -----------------------------------------------------
-- 9. INDEXES thêm (nếu cần)
-- -----------------------------------------------------
-- Thêm indexes cho các bảng thường query
ALTER TABLE `yeucauhotro`
  ADD INDEX IF NOT EXISTS `idx_trangthai` (`trangthai`),
  ADD INDEX IF NOT EXISTS `idx_loaihotro` (`loaihotro`);

ALTER TABLE `khoantaitro`
  ADD INDEX IF NOT EXISTS `idx_trangthai` (`trangthai`);

ALTER TABLE `giaodich`
  ADD INDEX IF NOT EXISTS `idx_ngaygiaodich` (`ngaygiaodich`);

-- -----------------------------------------------------
-- HOÀN TẤT
-- -----------------------------------------------------
SELECT 'Migration hoàn tất!' AS status;
