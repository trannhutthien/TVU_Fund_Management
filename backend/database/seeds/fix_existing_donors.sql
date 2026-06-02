-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX: Tạo donor records cho user NHA_TAI_TRO đã tồn tại
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- MỤC ĐÍCH: Tạo record trong bảng `nhataitro` cho các user có loai_tai_khoan = 'NHA_TAI_TRO'
--           nhưng chưa có record tương ứng trong bảng `nhataitro`
--
-- SỬ DỤNG: Chạy script này SAU KHI đã fix code trong authController.js
--
-- ═══════════════════════════════════════════════════════════════════════════════

-- Bước 1: Kiểm tra số lượng user NHA_TAI_TRO chưa có donor record
SELECT 
    COUNT(*) as so_luong_can_fix,
    'User NHA_TAI_TRO chưa có trong bảng nhataitro' as mo_ta
FROM nguoidung nd
WHERE nd.loai_tai_khoan = 'NHA_TAI_TRO'
AND nd.user_id NOT IN (SELECT user_id FROM nhataitro);

-- Bước 2: Xem chi tiết các user cần fix
SELECT 
    nd.user_id,
    nd.ho_ten,
    nd.email,
    nd.so_dien_thoai,
    nd.loai_tai_khoan,
    nd.created_at
FROM nguoidung nd
WHERE nd.loai_tai_khoan = 'NHA_TAI_TRO'
AND nd.user_id NOT IN (SELECT user_id FROM nhataitro)
ORDER BY nd.created_at DESC;

-- Bước 3: Tạo donor records cho các user chưa có
-- LƯU Ý: Mặc định loai = 'Ca nhan', có thể sửa thủ công sau
INSERT INTO nhataitro (user_id, ten_nha_tai_tro, loai)
SELECT 
    nd.user_id,
    nd.ho_ten as ten_nha_tai_tro,
    'Ca nhan' as loai
FROM nguoidung nd
WHERE nd.loai_tai_khoan = 'NHA_TAI_TRO'
AND nd.user_id NOT IN (SELECT user_id FROM nhataitro);

-- Bước 4: Verify kết quả
SELECT 
    nt.nha_tai_tro_id,
    nt.user_id,
    nt.ten_nha_tai_tro,
    nt.loai,
    nd.email,
    nd.so_dien_thoai,
    nt.created_at
FROM nhataitro nt
INNER JOIN nguoidung nd ON nt.user_id = nd.user_id
WHERE nd.loai_tai_khoan = 'NHA_TAI_TRO'
ORDER BY nt.created_at DESC;

-- ═══════════════════════════════════════════════════════════════════════════════
-- KẾT QUẢ MONG ĐỢI
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- ✅ Tất cả user có loai_tai_khoan = 'NHA_TAI_TRO' đều có record trong `nhataitro`
-- ✅ Các user này có thể quyên góp ngay lập tức
-- ✅ Không còn lỗi 404 "Không tìm thấy thông tin nhà tài trợ"
--
-- ═══════════════════════════════════════════════════════════════════════════════
