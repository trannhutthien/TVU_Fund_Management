-- ═══════════════════════════════════════════════════════════════
-- SEED: Cập nhật giá trị lanoibat cho 3 bản ghi tin tức
-- Ngày: 13/06/2024
-- Mục đích: Gán đúng giá trị 1/2/3 cho layout Featured mới
-- ═══════════════════════════════════════════════════════════════

USE tvufund;

-- ═══════════════════════════════════════════════════════════════
-- KIỂM TRA DỮ LIỆU HIỆN TẠI
-- ═══════════════════════════════════════════════════════════════

SELECT tintuc_id, tieude, lanoibat, trangthai 
FROM tintuc 
ORDER BY ngaytao DESC 
LIMIT 10;

-- ═══════════════════════════════════════════════════════════════
-- CẬP NHẬT GIÁ TRỊ LANOIBAT
-- ═══════════════════════════════════════════════════════════════

-- Lấy tin tức mới nhất để gán featured lớn (lanoibat = 1)
UPDATE tintuc 
SET lanoibat = 1
WHERE trangthai = 'Da xuat ban'
ORDER BY ngayxuatban DESC, ngaytao DESC
LIMIT 1;

-- Lấy 2 tin tiếp theo để gán featured nhỏ (lanoibat = 2)
UPDATE tintuc 
SET lanoibat = 2
WHERE trangthai = 'Da xuat ban'
  AND lanoibat = 0  -- Chưa được gán featured
ORDER BY ngayxuatban DESC, ngaytao DESC
LIMIT 2;

-- Lấy 5 tin tiếp theo để gán sidebar (lanoibat = 3)
UPDATE tintuc 
SET lanoibat = 3
WHERE trangthai = 'Da xuat ban'
  AND lanoibat = 0  -- Chưa được gán featured
ORDER BY ngayxuatban DESC, ngaytao DESC
LIMIT 5;

-- ═══════════════════════════════════════════════════════════════
-- KIỂM TRA KẾT QUẢ SAU KHI CẬP NHẬT
-- ═══════════════════════════════════════════════════════════════

SELECT 
  lanoibat,
  COUNT(*) AS so_luong,
  GROUP_CONCAT(tieude SEPARATOR ' | ') AS cac_tieu_de
FROM tintuc
WHERE trangthai = 'Da xuat ban'
GROUP BY lanoibat
ORDER BY lanoibat;

-- Kết quả mong đợi:
-- lanoibat | so_luong | cac_tieu_de
-- ---------|----------|-------------
--    0     |    X     | Các tin bình thường...
--    1     |    1     | Tin featured lớn
--    2     |    2     | Tin featured nhỏ 1 | Tin featured nhỏ 2
--    3     |    5     | Sidebar 1 | Sidebar 2 | ...

-- ═══════════════════════════════════════════════════════════════
-- XEM CHI TIẾT CÁC TIN FEATURED
-- ═══════════════════════════════════════════════════════════════

SELECT 
  tintuc_id,
  tieude,
  danhmuc,
  lanoibat AS featured_type,
  CASE 
    WHEN lanoibat = 0 THEN 'Bình thường'
    WHEN lanoibat = 1 THEN 'Featured lớn'
    WHEN lanoibat = 2 THEN 'Featured nhỏ hàng dưới'
    WHEN lanoibat = 3 THEN 'Sidebar'
  END AS featured_label,
  ngayxuatban,
  trangthai
FROM tintuc
WHERE trangthai = 'Da xuat ban'
  AND lanoibat IN (1, 2, 3)
ORDER BY lanoibat ASC, ngayxuatban DESC;
