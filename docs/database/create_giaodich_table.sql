-- ═══════════════════════════════════════════════════════════════════════════════
-- BẢNG: GiaoDich (Giao dịch tài chính)
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- MỤC ĐÍCH: Ghi nhận tất cả các giao dịch thu/chi của quỹ
-- 
-- LOẠI GIAO DỊCH:
-- - "Thu": Nhận tiền từ nhà tài trợ (khi duyệt khoản tài trợ)
-- - "Chi": Chi tiền cho học bổng, chương trình hỗ trợ
--
-- QUAN HỆ:
-- - quy_id → Quy(quy_id): Giao dịch thuộc quỹ nào
-- - khoan_tai_tro_id → KhoanTaiTro(khoan_tai_tro_id): Nếu là giao dịch THU
-- - nguoi_thuc_hien_id → nguoidung(id): Người thực hiện giao dịch (Admin/Kế toán)
--

CREATE TABLE GiaoDich (
    giao_dich_id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Quỹ liên quan
    quy_id INT NOT NULL,
    
    -- Khoản tài trợ (nếu là giao dịch THU)
    khoan_tai_tro_id INT NULL,
    
    -- Loại giao dịch
    loai_giao_dich ENUM('Thu', 'Chi') NOT NULL,
    
    -- Số tiền giao dịch
    so_tien DECIMAL(18, 2) NOT NULL CHECK (so_tien > 0),
    
    -- Mô tả giao dịch
    mo_ta NVARCHAR(500),
    
    -- Người thực hiện giao dịch (Admin/Kế toán)
    nguoi_thuc_hien_id INT NOT NULL,
    
    -- Thời gian tạo giao dịch
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Khóa ngoại
    FOREIGN KEY (quy_id) 
        REFERENCES Quy(quy_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    FOREIGN KEY (khoan_tai_tro_id) 
        REFERENCES KhoanTaiTro(khoan_tai_tro_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    
    FOREIGN KEY (nguoi_thuc_hien_id) 
        REFERENCES nguoidung(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    
    -- Index để tăng tốc query
    INDEX idx_quy_id (quy_id),
    INDEX idx_loai_giao_dich (loai_giao_dich),
    INDEX idx_ngay_tao (ngay_tao),
    INDEX idx_khoan_tai_tro_id (khoan_tai_tro_id)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- DỮ LIỆU MẪU (Tùy chọn)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Ví dụ: Giao dịch THU từ khoản tài trợ #1
-- INSERT INTO GiaoDich (quy_id, khoan_tai_tro_id, loai_giao_dich, so_tien, mo_ta, nguoi_thuc_hien_id)
-- VALUES (1, 1, 'Thu', 500000, 'Duyệt khoản tài trợ #1', 1);

-- Ví dụ: Giao dịch CHI cho học bổng
-- INSERT INTO GiaoDich (quy_id, loai_giao_dich, so_tien, mo_ta, nguoi_thuc_hien_id)
-- VALUES (1, 'Chi', 300000, 'Chi học bổng cho sinh viên ABC', 1);
