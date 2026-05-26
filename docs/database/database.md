CREATE TABLE vaitro (
    role_id INT(11) NOT NULL AUTO_INCREMENT,
    ten_vai_tro VARCHAR(100) CHARACTER SET utf8 
        COLLATE utf8_general_ci NOT NULL,
    mo_ta VARCHAR(255) CHARACTER SET utf8 
        COLLATE utf8_general_ci DEFAULT NULL,
    trang_thai VARCHAR(50) CHARACTER SET utf8 
        COLLATE utf8_general_ci DEFAULT 'HOAT_DONG',

    PRIMARY KEY (role_id),
    UNIQUE KEY uk_ten_vai_tro (ten_vai_tro)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_general_ci;


CREATE TABLE nguoidung (
    user_id           INT(11)      NOT NULL AUTO_INCREMENT,
    ma_so_dinh_danh   VARCHAR(20)  NOT NULL,
    ho_ten            VARCHAR(150) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
    email             VARCHAR(150) NOT NULL,
    mat_khau          VARCHAR(255) NOT NULL,
    avatar            VARCHAR(500) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,

    so_dien_thoai     VARCHAR(20)  DEFAULT NULL,           -- ✅ Thêm mới
    dia_chi           VARCHAR(255) CHARACTER SET utf8 
                      COLLATE utf8_general_ci DEFAULT NULL, -- ✅ Thêm mới

    role_id           INT(11)      NOT NULL,

    loai_tai_khoan    ENUM('SINH_VIEN','NHA_TAI_TRO')      -- ✅ Thêm mới
                      DEFAULT NULL,
                      -- NULL     → admin, giao_vu, ke_toan
                      -- SINH_VIEN  → sinh viên TVU
                      -- NHA_TAI_TRO → nhà tài trợ

    khoa_phong        VARCHAR(100) CHARACTER SET utf8 
                      COLLATE utf8_general_ci DEFAULT NULL,
                      -- Chỉ SINH_VIEN mới có giá trị

    trang_thai        VARCHAR(50)  CHARACTER SET utf8 
                      COLLATE utf8_general_ci NOT NULL DEFAULT 'HOAT_DONG',
    created_at        DATETIME     DEFAULT CURRENT_TIMESTAMP,

    -- ❌ Đã xóa: so_tai_khoan, ten_ngan_hang, chu_tai_khoan
    --    → Chuyển sang bảng taikhoannganhang

    PRIMARY KEY (user_id),
    UNIQUE KEY uk_ma_so_dinh_danh (ma_so_dinh_danh),
    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_so_dien_thoai (so_dien_thoai),
    KEY idx_role_id (role_id),

    CONSTRAINT fk_nguoidung_vaitro
        FOREIGN KEY (role_id) REFERENCES vaitro(role_id)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_general_ci;


CREATE TABLE taikhoannganhang (
    tai_khoan_id  INT(11)      NOT NULL AUTO_INCREMENT,
    user_id       INT(11)      NOT NULL,
    so_tai_khoan  VARCHAR(50)  NOT NULL,
    ten_ngan_hang VARCHAR(150) CHARACTER SET utf8 
                  COLLATE utf8_general_ci NOT NULL,
    chu_tai_khoan VARCHAR(150) CHARACTER SET utf8 
                  COLLATE utf8_general_ci NOT NULL,

    -- Đánh dấu tài khoản mặc định nhận giải ngân
    la_mac_dinh   TINYINT(1)   NOT NULL DEFAULT 0,

    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (tai_khoan_id),
    KEY idx_user_id (user_id),

    CONSTRAINT fk_tknhang_nguoidung
        FOREIGN KEY (user_id) REFERENCES nguoidung(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_general_ci;




CREATE TABLE quy (
    quy_id INT(11) NOT NULL AUTO_INCREMENT,

    -- Tên quỹ / chương trình hỗ trợ
    ten_quy VARCHAR(150) CHARACTER SET utf8
        COLLATE utf8_general_ci NOT NULL,

    -- Loại quỹ
    loai_quy ENUM(
        'Tu thien',
        'Hoc bong',
        'Y te',
        'Moi truong',
        'Khac'
    ) NOT NULL,

    -- Mô tả chi tiết về quỹ
    mo_ta VARCHAR(255) CHARACTER SET utf8
        COLLATE utf8_general_ci DEFAULT NULL,

    -- Ảnh banner / ảnh đại diện quỹ
    hinh_anh VARCHAR(500) DEFAULT NULL,

    -- Số tiền hỗ trợ tối thiểu cho mỗi suất
    so_tien_toi_thieu DECIMAL(18,2) DEFAULT NULL,

    -- Số tiền hỗ trợ tối đa cho mỗi suất
    so_tien_toi_da DECIMAL(18,2) DEFAULT NULL,

    -- Tổng số lượng suất hỗ trợ
    so_luong_chi_tieu INT(11) DEFAULT NULL,

    -- Hạn cuối nhận hồ sơ đăng ký
    han_nop_don DATE DEFAULT NULL,

    -- Điều kiện ngắn gọn hiển thị ngoài giao diện
    dieu_kien_tom_tat VARCHAR(200) CHARACTER SET utf8
        COLLATE utf8_general_ci DEFAULT NULL,

    -- Số dư hiện tại của quỹ
    so_du DECIMAL(18,2) NOT NULL DEFAULT 0.00,

    -- Ngày tạo quỹ
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Ngày cập nhật gần nhất
    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    -- Trạng thái hoạt động của quỹ
    trang_thai ENUM(
        'Dang hoat dong',
        'Tam dung',
        'Da dong'
    ) NOT NULL DEFAULT 'Dang hoat dong',

    PRIMARY KEY (quy_id),

    -- Validate số tiền tối thiểu không âm
    CONSTRAINT chk_quy_so_tien_toi_thieu
        CHECK (
            so_tien_toi_thieu IS NULL
            OR so_tien_toi_thieu >= 0
        ),

    -- Validate số tiền tối đa không âm
    CONSTRAINT chk_quy_so_tien_toi_da
        CHECK (
            so_tien_toi_da IS NULL
            OR so_tien_toi_da >= 0
        ),

    -- Validate số lượng chỉ tiêu > 0
    CONSTRAINT chk_quy_so_luong_chi_tieu
        CHECK (
            so_luong_chi_tieu IS NULL
            OR so_luong_chi_tieu > 0
        ),

    -- Validate tiền tối đa >= tiền tối thiểu
    CONSTRAINT chk_quy_khoang_tien
        CHECK (
            so_tien_toi_thieu IS NULL
            OR so_tien_toi_da IS NULL
            OR so_tien_toi_da >= so_tien_toi_thieu
        )
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_general_ci;


CREATE TABLE nhataitro (
    nha_tai_tro_id INT(11) NOT NULL AUTO_INCREMENT,

    user_id INT(11) NOT NULL,
    -- Liên kết với bảng nguoidung
    -- Mỗi nhà tài trợ bắt buộc phải có tài khoản đăng nhập

    ten_nha_tai_tro VARCHAR(150) CHARACTER SET utf8
        COLLATE utf8_general_ci NOT NULL,
    -- Tên tổ chức / doanh nghiệp / cá nhân tài trợ

    loai VARCHAR(50) CHARACTER SET utf8
        COLLATE utf8_general_ci NOT NULL DEFAULT 'Ca nhan',
    -- Ca nhan | Doanh nghiep | To chuc phi loi nhuan

    -- =====================================================
    -- THỐNG KÊ TÀI TRỢ
    -- =====================================================

    tong_so_tien_da_tai_tro DECIMAL(18,2)
        NOT NULL DEFAULT 0.00,
    -- Tổng số tiền đã tài trợ thành công

    so_lan_tai_tro INT(11)
        NOT NULL DEFAULT 0,
    -- Tổng số lần tài trợ thành công

    so_quy_da_ho_tro INT(11)
        NOT NULL DEFAULT 0,
    -- Đã hỗ trợ bao nhiêu quỹ khác nhau

    lan_tai_tro_gan_nhat DATETIME DEFAULT NULL,
    -- Ngày tài trợ gần nhất

    -- =====================================================

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (nha_tai_tro_id),

    UNIQUE KEY uk_nhataitro_user_id (user_id),

    KEY idx_loai (loai),

    CONSTRAINT fk_nhataitro_nguoidung
        FOREIGN KEY (user_id)
        REFERENCES nguoidung(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_general_ci;


CREATE TABLE khoantaitro (
    khoan_tai_tro_id INT(11) NOT NULL AUTO_INCREMENT,

    nha_tai_tro_id INT(11) NOT NULL,
    quy_id INT(11) NOT NULL,

    so_tien DECIMAL(18,2) NOT NULL,
    hinh_anh_minh_chung VARCHAR(500) DEFAULT NULL,

    ngay_tai_tro DATETIME DEFAULT CURRENT_TIMESTAMP,

    trang_thai ENUM(
        'Cho duyet',
	'Da duyet',
        'Da nhan',
        'Tu choi'
    ) NOT NULL DEFAULT 'Cho duyet',

    ghi_chu VARCHAR(255) CHARACTER SET utf8 
        COLLATE utf8_general_ci DEFAULT NULL,

    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (khoan_tai_tro_id),

    KEY idx_nha_tai_tro_id (nha_tai_tro_id),
    KEY idx_quy_id (quy_id),

    CONSTRAINT fk_khoantaitro_nhataitro
        FOREIGN KEY (nha_tai_tro_id)
        REFERENCES nhataitro(nha_tai_tro_id)
        ON UPDATE CASCADE,

    CONSTRAINT fk_khoantaitro_quy
        FOREIGN KEY (quy_id)
        REFERENCES quy(quy_id)
        ON UPDATE CASCADE,

    CONSTRAINT chk_khoantaitro_so_tien
        CHECK (so_tien > 0)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_general_ci;



CREATE TABLE yeucauhotro (
    request_id INT(11) NOT NULL AUTO_INCREMENT,

    user_id INT(11) NOT NULL,
    quy_id INT(11) NOT NULL,

    tieu_de VARCHAR(200) CHARACTER SET utf8 
        COLLATE utf8_general_ci NOT NULL,

    mo_ta TEXT DEFAULT NULL,

    so_tien_yeu_cau DECIMAL(18,2) NOT NULL,

    file_dinh_kem VARCHAR(500) DEFAULT NULL,

    trang_thai ENUM(
        'Cho duyet',
        'Dang xu ly',
        'Cho giai ngan',
        'Da giai ngan',
        'Tu choi'
    ) NOT NULL DEFAULT 'Cho duyet',

    ly_do_tu_choi VARCHAR(255) CHARACTER SET utf8 
        COLLATE utf8_general_ci DEFAULT NULL,

    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (request_id),

    KEY idx_user_id (user_id),
    KEY idx_quy_id (quy_id),

    CONSTRAINT fk_yeucauhotro_nguoidung
        FOREIGN KEY (user_id)
        REFERENCES nguoidung(user_id)
        ON UPDATE CASCADE,

    CONSTRAINT fk_yeucauhotro_quy
        FOREIGN KEY (quy_id)
        REFERENCES quy(quy_id)
        ON UPDATE CASCADE,

    CONSTRAINT chk_so_tien_yeu_cau
        CHECK (so_tien_yeu_cau > 0)
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_general_ci;



CREATE TABLE giaodich (
    transaction_id INT(11) NOT NULL AUTO_INCREMENT,

    quy_id INT(11) NOT NULL,
    khoan_tai_tro_id INT(11) DEFAULT NULL,
    request_id INT(11) DEFAULT NULL,
    nguoi_tao_id INT(11) DEFAULT NULL,

    so_tien DECIMAL(18,2) NOT NULL,

    loai ENUM('Thu', 'Chi') NOT NULL,

    trang_thai ENUM(
        'Cho xu ly',
        'Thanh cong',
        'That bai',
        'Hoan tien'
    ) NOT NULL DEFAULT 'Cho xu ly',

    minh_chung_chuyen_khoan VARCHAR(500) DEFAULT NULL,

    ghi_chu VARCHAR(255) CHARACTER SET utf8 
        COLLATE utf8_general_ci DEFAULT NULL,

    ngay_giao_dich DATETIME DEFAULT CURRENT_TIMESTAMP,

    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (transaction_id),

    KEY idx_quy_id (quy_id),
    KEY idx_khoan_tai_tro_id (khoan_tai_tro_id),
    KEY idx_request_id (request_id),
    KEY idx_nguoi_tao_id (nguoi_tao_id),

    CONSTRAINT fk_giaodich_quy
        FOREIGN KEY (quy_id)
        REFERENCES quy(quy_id)
        ON UPDATE CASCADE,

    CONSTRAINT fk_giaodich_khoantaitro
        FOREIGN KEY (khoan_tai_tro_id)
        REFERENCES khoantaitro(khoan_tai_tro_id)
        ON UPDATE CASCADE,

    CONSTRAINT fk_giaodich_yeucauhotro
        FOREIGN KEY (request_id)
        REFERENCES yeucauhotro(request_id)
        ON UPDATE CASCADE,

    CONSTRAINT fk_giaodich_nguoidung
        FOREIGN KEY (nguoi_tao_id)
        REFERENCES nguoidung(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT chk_giaodich_so_tien
        CHECK (so_tien > 0),

    CONSTRAINT chk_nguon_giao_dich
        CHECK (
            khoan_tai_tro_id IS NOT NULL
            OR request_id IS NOT NULL
        )
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_general_ci;



CREATE TABLE pheduyet (
    phe_duyet_id INT(11) NOT NULL AUTO_INCREMENT,

    -- =====================================================
    -- NGUỒN CẦN PHÊ DUYỆT
    -- =====================================================

    request_id INT(11) DEFAULT NULL,
    -- Phê duyệt yêu cầu hỗ trợ sinh viên

    khoan_tai_tro_id INT(11) DEFAULT NULL,
    -- Phê duyệt khoản tài trợ từ nhà tài trợ

    -- =====================================================

    nguoi_duyet_id INT(11) DEFAULT NULL,
    -- Người thực hiện phê duyệt

    cap_do_duyet INT(11) NOT NULL,
    -- Yêu cầu hỗ trợ:
    --   1 = Giáo vụ
    --   2 = Trưởng phòng
    --   3 = Hiệu trưởng / Kế toán
    --
    -- Khoản tài trợ:
    --   1 = Cán bộ quỹ xác nhận
    --   2 = Kế toán / Admin xác nhận tiền vào quỹ

    ket_qua ENUM(
        'Cho duyet',
        'Da duyet',
        'Tu choi',
        'Yeu cau bo sung'
    ) NOT NULL DEFAULT 'Cho duyet',

    ghi_chu VARCHAR(255) CHARACTER SET utf8
        COLLATE utf8_general_ci DEFAULT NULL,

    ly_do_tu_choi VARCHAR(255) CHARACTER SET utf8
        COLLATE utf8_general_ci DEFAULT NULL,

    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,

    ngay_duyet DATETIME DEFAULT NULL,
    -- Thời điểm thực hiện duyệt

    ngay_cap_nhat DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (phe_duyet_id),

    -- =====================================================
    -- INDEX
    -- =====================================================

    KEY idx_request_id (request_id),
    KEY idx_khoan_tai_tro_id (khoan_tai_tro_id),
    KEY idx_nguoi_duyet_id (nguoi_duyet_id),

    -- =====================================================
    -- FOREIGN KEY
    -- =====================================================

    CONSTRAINT fk_pheduyet_yeucauhotro
        FOREIGN KEY (request_id)
        REFERENCES yeucauhotro(request_id)
        ON UPDATE CASCADE,

    CONSTRAINT fk_pheduyet_khoantaitro
        FOREIGN KEY (khoan_tai_tro_id)
        REFERENCES khoantaitro(khoan_tai_tro_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_pheduyet_nguoidung
        FOREIGN KEY (nguoi_duyet_id)
        REFERENCES nguoidung(user_id)
        ON UPDATE CASCADE,

    -- =====================================================
    -- VALIDATION
    -- =====================================================

    CONSTRAINT chk_cap_do_duyet
        CHECK (cap_do_duyet BETWEEN 1 AND 5),

    -- Bắt buộc phải có ít nhất 1 nguồn duyệt
    CONSTRAINT chk_nguon_pheduyet
        CHECK (
            request_id IS NOT NULL
            OR khoan_tai_tro_id IS NOT NULL
        )
)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_general_ci;