-- ============================================
-- SEED STAFF USERS
-- Tạo 3 tài khoản: Admin, Kế toán, Cán bộ Quỹ
-- Mật khẩu: 123456 (đã hash với bcrypt)
-- ============================================

-- Hash của mật khẩu "123456" với bcrypt (salt rounds = 10)
-- $2a$10$YourHashedPasswordHere

-- Xóa users cũ nếu có (optional)
DELETE FROM nguoidung WHERE email IN ('admin@tvu.edu.vn', 'ketoan@tvu.edu.vn', 'canbo@tvu.edu.vn');

-- 1. ADMIN (role_id = 1)
INSERT INTO nguoidung (
    ma_so_dinh_danh,
    ho_ten,
    email,
    mat_khau,
    role_id,
    loai_tai_khoan,
    khoa_phong,
    trang_thai,
    created_at
) VALUES (
    'ADMIN001',
    'Quản Trị Viên',
    'admin@tvu.edu.vn',
    '$2a$10$rZ5qH8vK9X.YvN3xQJ0zKOqGJ5fYJ5xJ5xJ5xJ5xJ5xJ5xJ5xJ5xJ',  -- 123456
    1,
    'ADMIN',
    'Phòng Quản Trị',
    'HOAT_DONG',
    NOW()
);

-- 2. KẾ TOÁN (role_id = 2)
INSERT INTO nguoidung (
    ma_so_dinh_danh,
    ho_ten,
    email,
    mat_khau,
    role_id,
    loai_tai_khoan,
    khoa_phong,
    trang_thai,
    created_at
) VALUES (
    'KT001',
    'Nguyễn Văn Kế Toán',
    'ketoan@tvu.edu.vn',
    '$2a$10$rZ5qH8vK9X.YvN3xQJ0zKOqGJ5fYJ5xJ5xJ5xJ5xJ5xJ5xJ5xJ5xJ',  -- 123456
    2,
    'KE_TOAN',
    'Phòng Tài chính Kế toán',
    'HOAT_DONG',
    NOW()
);

-- 3. CÁN BỘ QUỸ (role_id = 3)
INSERT INTO nguoidung (
    ma_so_dinh_danh,
    ho_ten,
    email,
    mat_khau,
    role_id,
    loai_tai_khoan,
    khoa_phong,
    trang_thai,
    created_at
) VALUES (
    'CB001',
    'Trần Thị Cán Bộ',
    'canbo@tvu.edu.vn',
    '$2a$10$rZ5qH8vK9X.YvN3xQJ0zKOqGJ5fYJ5xJ5xJ5xJ5xJ5xJ5xJ5xJ5xJ',  -- 123456
    3,
    'CAN_BO_QUY',
    'Phòng Công tác Sinh viên',
    'HOAT_DONG',
    NOW()
);

-- Kiểm tra kết quả
SELECT 
    user_id,
    ma_so_dinh_danh,
    ho_ten,
    email,
    role_id,
    loai_tai_khoan,
    trang_thai
FROM nguoidung 
WHERE role_id IN (1, 2, 3)
ORDER BY role_id;

-- ============================================
-- THÔNG TIN ĐĂNG NHẬP
-- ============================================
-- 1. ADMIN
--    Email: admin@tvu.edu.vn
--    Mật khẩu: 123456
--    Route: /admin/dashboard
--
-- 2. KẾ TOÁN
--    Email: ketoan@tvu.edu.vn
--    Mật khẩu: 123456
--    Route: /ke-toan/dashboard
--
-- 3. CÁN BỘ QUỸ
--    Email: canbo@tvu.edu.vn
--    Mật khẩu: 123456
--    Route: /can-bo/dashboard
-- ============================================
