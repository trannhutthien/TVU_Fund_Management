-- ═══════════════════════════════════════════════════════════════
-- TEST QUERY: Kiểm tra query getPublicFunds
-- ═══════════════════════════════════════════════════════════════

USE tvufund;

-- Kiểm tra cấu trúc bảng quy
DESC quy;

-- Kiểm tra cấu trúc bảng loaiquy
DESC loaiquy;

-- Kiểm tra dữ liệu hiện tại
SELECT id, ten_quy, loaiquy_id, so_tien_muc_tieu, so_du, trang_thai FROM quy;

-- Test query đầy đủ (giống trong code)
SELECT 
  q.id AS quy_id,
  q.ten_quy,
  lq.maloai AS loai_quy,
  q.mo_ta,
  q.hinh_anh,
  q.so_tien_muc_tieu,
  q.so_tien_ho_tro_toi_da AS so_tien_toi_da,
  q.so_luong_ho_tro_toi_da AS so_luong_chi_tieu,
  q.dieu_kien_ho_tro AS dieu_kien_tom_tat,
  q.ngay_bat_dau,
  q.ngay_ket_thuc AS han_nop_don,
  q.so_du,
  (q.so_du - COALESCE(SUM(CASE WHEN yc.trang_thai = 'Cho giai ngan' THEN yc.so_tien_de_nghi ELSE 0 END), 0)) as so_du_thuc_te,
  q.nguoi_tao_id,
  q.ngay_tao,
  q.ngay_cap_nhat,
  q.trang_thai,
  COUNT(CASE WHEN yc.trang_thai IN ('Cho giai ngan', 'Da giai ngan') THEN 1 END) as so_don_da_nop,
  CASE 
    WHEN q.so_luong_ho_tro_toi_da IS NOT NULL AND q.so_luong_ho_tro_toi_da > 0 
    THEN ROUND((COUNT(CASE WHEN yc.trang_thai IN ('Cho giai ngan', 'Da giai ngan') THEN 1 END) / q.so_luong_ho_tro_toi_da) * 100, 0)
    ELSE 0
  END as phan_tram_da_nhan
FROM quy q
LEFT JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
LEFT JOIN yeucauhotro yc ON q.id = yc.quy_id
WHERE q.trang_thai IN ('Dang hoat dong', 'Tam dung')
GROUP BY q.id, lq.maloai, q.ngay_tao
ORDER BY q.ngay_tao DESC;
