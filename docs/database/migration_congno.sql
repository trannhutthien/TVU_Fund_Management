-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION: Thêm cột cho trang Giám sát Nghiệm thu & Công nợ
-- Ngày: 2026-07-20
-- Yêu cầu: MySQL 5.7+ / MariaDB 10.2+
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. BẢNG lichtrano — Thêm luồng xác nhận thanh toán
-- ─────────────────────────────────────────────────────────────────────────────
-- trangthaixacnhan: Kế toán duyệt việc người nộp đã trả tiền
-- minhchungtrano: File ảnh/PDF người nộp upload khi trả nợ

ALTER TABLE lichtrano
  ADD COLUMN trangthaixacnhan ENUM('Cho xac nhan', 'Da xac nhan', 'Bi tu choi')
    NOT NULL DEFAULT 'Cho xac nhan' AFTER trangthai,
  ADD COLUMN ngayxacnhan DATETIME NULL AFTER trangthaixacnhan,
  ADD COLUMN nguoiduyet_id INT(11) NULL AFTER ngayxacnhan,
  ADD COLUMN minhchungtrano VARCHAR(255) NULL AFTER nguoiduyet_id,
  ADD COLUMN ghichuxacnhan TEXT NULL AFTER minhchungtrano;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. BẢNG dieukhoanthuhoi — Thêm trạng thái thu hồi
-- ─────────────────────────────────────────────────────────────────────────────
-- trangthai: Theo dõi tiến độ thu hồi (1 lần duy nhất)
-- sotiendadathu: Số tiền đã thu thực tế

ALTER TABLE dieukhoanthuhoi
  ADD COLUMN trangthai ENUM('Chua thu', 'Dang thu', 'Da thu het')
    NOT NULL DEFAULT 'Chua thu' AFTER thoihanhoantra_thang,
  ADD COLUMN ngaybatdauthuhoi DATE NULL AFTER trangthai,
  ADD COLUMN sotiendadathu DECIMAL(15,2) NOT NULL DEFAULT 0.00 AFTER ngaybatdauthuhoi;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Cập nhật dữ liệu hiện có — lichtrano đã "Da tra" → "Da xac nhan"
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE lichtrano
SET trangthaixacnhan = 'Da xac nhan'
WHERE trangthai = 'Da tra';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Cập nhật dieukhoanthuhoi đã giải ngân → "Dang thu"
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE dieukhoanthuhoi dkh
INNER JOIN yeucauhotro yc ON dkh.yeucauhotro_id = yc.yeucauhotro_id
SET dkh.trangthai = 'Dang thu',
    dkh.ngaybatdauthuhoi = yc.ngaygiaodich
WHERE yc.trangthai IN ('Da giai ngan', 'Da nghiem thu')
  AND yc.loaihotro = 'Tai tro co thu hoi';
