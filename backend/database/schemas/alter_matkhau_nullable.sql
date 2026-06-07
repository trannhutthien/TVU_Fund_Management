-- Script cho phép matkhau NULL để hỗ trợ đăng nhập Google OAuth
-- Chạy script này trong MySQL trước khi test Google login

-- Cho phép cột matkhau chấp nhận giá trị NULL
-- (User đăng nhập qua Google sẽ không có mật khẩu)
ALTER TABLE nguoidung MODIFY COLUMN matkhau VARCHAR(255) NULL COMMENT 'Mật khẩu đã hash (NULL nếu đăng nhập qua Google)';

-- Kiểm tra kết quả
DESCRIBE nguoidung;
