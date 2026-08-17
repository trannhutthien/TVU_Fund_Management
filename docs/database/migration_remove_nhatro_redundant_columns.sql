-- Migration: Xoa 5 cot trung lap trong nhataitro
-- Ngay: 2026-08-13
-- Muc dich: Don dep DB - xoa cot email, sodienthoai, diachi, mota, logo trong nhataitro
--           Thong tin lay tu bang nguoidung thong qua JOIN (nguoidung_id)
-- Luu y: Chay SAU khi da cap nhat toan bo code backend

-- Kiem tra truoc khi xoa (optional - de verify)
-- SELECT nhataitro_id, email, sodienthoai, diachi, mota, logo FROM nhataitro WHERE email IS NOT NULL OR sodienthoai IS NOT NULL OR diachi IS NOT NULL OR mota IS NOT NULL OR logo IS NOT NULL;

ALTER TABLE `nhataitro`
  DROP COLUMN `email`,
  DROP COLUMN `sodienthoai`,
  DROP COLUMN `diachi`,
  DROP COLUMN `mota`,
  DROP COLUMN `logo`;
