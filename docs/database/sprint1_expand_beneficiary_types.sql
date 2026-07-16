-- ═══════════════════════════════════════════════════════════════════════════════
-- SPRINT 1: Mở rộng đối tượng nhận tài trợ
-- Ngày: 2026-07-13
-- Mục đích: Thêm loaitaikhoan 'Can bo', 'Nha khoa hoc'; thêm tinhtrangcongtac;
--           thêm danhnghia/tendaidien trên yeucauhotro
-- ═══════════════════════════════════════════════════════════════════════════════

START TRANSACTION;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Mở rộng ENUM loaitaikhoan trên nguoidung
--    Hiện tại: ENUM('Sinh vien','Nha tai tro')
--    Mới:      ENUM('Sinh vien','Nha tai tro','Can bo','Nha khoa hoc')
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE nguoidung
MODIFY COLUMN loaitaikhoan ENUM('Sinh vien','Nha tai tro','Can bo','Nha khoa hoc') NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Thêm cột tinhtrangcongtac trên nguoidung
--    Chỉ có ý nghĩa khi loaitaikhoan = 'Can bo'
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE nguoidung
ADD COLUMN tinhtrangcongtac ENUM('Dang cong tac','Da nghi huu') NULL
AFTER loaitaikhoan;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Thêm danhnghia + tendaidien trên yeucauhotro
--    danhnghia: Cá nhân (default) / Tập thể / Đơn vị
--    tendaidien: Tên tập thể/đơn vị nếu danhnghia != Ca nhan
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE yeucauhotro
ADD COLUMN danhnghia ENUM('Ca nhan','Tap the','Don vi') NOT NULL DEFAULT 'Ca nhan'
AFTER quy_id;

ALTER TABLE yeucauhotro
ADD COLUMN tendaidien VARCHAR(200) NULL
COMMENT 'Ten tap the/don vi neu danhnghia != Ca nhan'
AFTER danhnghia;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Verify
-- ─────────────────────────────────────────────────────────────────────────────
SELECT loaitaikhoan, tinhtrangcongtac, COUNT(*) AS so_luong
FROM nguoidung
GROUP BY loaitaikhoan, tinhtrangcongtac;

SELECT 'DONE - Sprint 1 migration completed' AS result;

COMMIT;
