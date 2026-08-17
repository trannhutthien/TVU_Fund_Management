-- Migration: Xoa cac cot chet khong su dung
-- Ngay: 2026-08-12
-- Muc dich: Don dep DB - xoa cot thua

-- 1. Xoa 4 cot thua trong nhataitro (khong co trong production Aiven)
--    Code GuestModel.js da duoc cap nhat de khong insert/SELECT nhung cot nay
ALTER TABLE `nhataitro`
  DROP COLUMN `masothue`,
  DROP COLUMN `linhVucHopTac`,
  DROP COLUMN `nguoiLienHe`,
  DROP COLUMN `chucDanh`;

-- 2. Xoa cot laidetac trong yeucauhotro (dead column, luon = 0)
--    Code da duoc cap nhat: canghiemthu da chua logic cua laidetac
ALTER TABLE `yeucauhotro`
  DROP COLUMN `laidetac`;
