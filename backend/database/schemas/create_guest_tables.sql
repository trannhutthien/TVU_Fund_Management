-- Script SQL tạo bảng tạm cho khách vãng lai gửi đơn yêu cầu hỗ trợ và đóng góp tài trợ

-- 1. Bảng tạm guest_yeucauhotro (Lưu đơn đề nghị hỗ trợ)
CREATE TABLE IF NOT EXISTS guest_yeucauhotro (
    guest_yeucauhotro_id    INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Thông tin cá nhân khách vãng lai (thay cho nguoidung_id)
    guest_hoten             VARCHAR(100)    NOT NULL,
    guest_email             VARCHAR(100)    NOT NULL,
    guest_sodienthoai       VARCHAR(15)     NULL,
    guest_mssv              VARCHAR(20)     NULL        COMMENT 'Mã số sinh viên',
    guest_khoa              VARCHAR(100)    NULL,
    guest_lop               VARCHAR(50)     NULL,
    
    -- Thông tin tài khoản ngân hàng nhận giải ngân
    guest_sotaikhoan        VARCHAR(50)     NULL,
    guest_nganhang          VARCHAR(100)    NULL,
    guest_chutaikhoan       VARCHAR(100)    NULL,
    
    -- Thông tin đơn đề nghị
    quy_id                  INT             NOT NULL,
    lydo                    TEXT            NOT NULL,
    sotiendenghi            DECIMAL(15, 2)  NOT NULL,
    tailieudinhkem          VARCHAR(255)    NULL,
    
    -- Trường quản lý OTP, Tracking & Trạng thái Staging
    otp_code                VARCHAR(6)      NULL,
    otp_expires_at          DATETIME        NULL,
    tracking_uuid           VARCHAR(36)     NOT NULL,
    trang_thai_staging      VARCHAR(20)     DEFAULT 'CHO_XAC_MINH', -- (CHO_XAC_MINH, DA_CHUYEN, HET_HAN)
    is_email_verified       TINYINT         DEFAULT 0,
    
    -- Tham chiếu ngược sau khi migrate
    yeucauhotro_id_ref      INT             NULL,
    nguoidung_id_ref        INT             NULL,
    
    ngaytao                 TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng tạm guest_khoantaitro (Lưu thông tin tài trợ đóng góp)
CREATE TABLE IF NOT EXISTS guest_khoantaitro (
    guest_khoantaitro_id    INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Thông tin cá nhân/tổ chức nhà tài trợ vãng lai
    guest_hoten             VARCHAR(100)    NOT NULL,
    guest_email             VARCHAR(100)    NOT NULL,
    guest_sodienthoai       VARCHAR(15)     NULL,
    guest_tochuc            VARCHAR(150)    NULL,
    guest_diachi            VARCHAR(255)    NULL,
    
    -- Thông tin khoản tài trợ
    quy_id                  INT             NOT NULL,
    sotien                  DECIMAL(15, 2)  NOT NULL,
    hinhthuc                VARCHAR(50)     DEFAULT 'Chuyen khoan',
    magiaodich              VARCHAR(100)    NULL,
    ngaytaitro              DATETIME        NULL,
    chungtu                 VARCHAR(255)    NULL,
    ghichu                  TEXT            NULL,
    
    -- Trường quản lý OTP, Tracking & Trạng thái Staging
    otp_code                VARCHAR(6)      NULL,
    otp_expires_at          DATETIME        NULL,
    tracking_uuid           VARCHAR(36)     NOT NULL,
    trang_thai_staging      VARCHAR(20)     DEFAULT 'CHO_XAC_MINH', -- (CHO_XAC_MINH, DA_CHUYEN, HET_HAN)
    is_email_verified       TINYINT         DEFAULT 0,
    
    -- Tham chiếu ngược sau khi migrate
    khoantaitro_id_ref      INT             NULL,
    nhataitro_id_ref        INT             NULL,
    
    ngaytao                 TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
