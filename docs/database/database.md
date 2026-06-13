CREATE DATABASE tvu_fund_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE tvu_fund_management;

CREATE TABLE `vaitro` (
  `vaitro_id` int(11) NOT NULL AUTO_INCREMENT,
  `tenvaitro` varchar(50) NOT NULL,
  `mota` text DEFAULT NULL,
  `trangthai` enum('Hoat dong','Tam dung') DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`vaitro_id`),
  UNIQUE KEY `uk_tenvaitro` (`tenvaitro`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `nguoidung` (
  `nguoidung_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `matkhau` varchar(255) NOT NULL,
  `hoten` varchar(100) NOT NULL,
  `masodinhdanh` varchar(20) DEFAULT NULL,
  `ngaysinh` date DEFAULT NULL,
  `gioitinh` enum('Nam','Nu','Khac') DEFAULT NULL,
  `sodienthoai` varchar(15) DEFAULT NULL,
  `diachi` text DEFAULT NULL,
  `donvihoc_id` int(11) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `vaitro_id` int(11) NOT NULL,
  `loaitaikhoan` enum('Sinh vien','Nha tai tro') NOT NULL DEFAULT 'Sinh vien',
  `trangthai` enum('Hoat dong','Khoa','Cho duyet') DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`nguoidung_id`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `vaitro_id` (`vaitro_id`),
  KEY `fk_nguoidung_donvihoc` (`donvihoc_id`),
  CONSTRAINT `fk_nguoidung_donvihoc` FOREIGN KEY (`donvihoc_id`) REFERENCES `donvihoc` (`donvihoc_id`) ON UPDATE CASCADE,
  CONSTRAINT `nguoidung_ibfk_1` FOREIGN KEY (`vaitro_id`) REFERENCES `vaitro` (`vaitro_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE loaiquy (
loaiquy_id INT AUTO_INCREMENT PRIMARY KEY,
maloai VARCHAR(50) NOT NULL,
tenloai VARCHAR(100) NOT NULL,
ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

UNIQUE KEY uk_maloai (maloai)

);

CREATE TABLE nhataitro (
nhataitro_id INT AUTO_INCREMENT PRIMARY KEY,

tennhataitro VARCHAR(200) NOT NULL,

loainhataitro ENUM(
    'Ca nhan',
    'To chuc',
    'Doanh nghiep'
) NOT NULL,

email VARCHAR(100),
sodienthoai VARCHAR(15),
diachi TEXT,
website VARCHAR(255),

mota TEXT,
logo VARCHAR(255),

nguoidung_id INT,

trangthai ENUM(
    'Hoat dong',
    'Ngung hoat dong'
) DEFAULT 'Hoat dong',

ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

FOREIGN KEY (nguoidung_id)
    REFERENCES nguoidung(nguoidung_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE

);

CREATE TABLE quy (
quy_id INT AUTO_INCREMENT PRIMARY KEY,

tenquy VARCHAR(200) NOT NULL,

loaiquy_id INT NOT NULL,

mota TEXT,
hinhanh VARCHAR(255),

sotienmuctieu DECIMAL(15,2) DEFAULT 0,
sodu DECIMAL(15,2) DEFAULT 0,

sotienhotrotoida DECIMAL(15,2),
soluonghotrotoida INT,

dieukienhotro TEXT,

ngaybatdau DATE,
ngayketthuc DATE,

trangthai ENUM(
    'Dang hoat dong',
    'Tam dung',
    'Da dong'
) DEFAULT 'Dang hoat dong',

nguoitao_id INT,

ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

FOREIGN KEY (loaiquy_id)
    REFERENCES loaiquy(loaiquy_id)
    ON UPDATE CASCADE,

FOREIGN KEY (nguoitao_id)
    REFERENCES nguoidung(nguoidung_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE

);

CREATE TABLE yeucauhotro (
    yeucauhotro_id INT AUTO_INCREMENT PRIMARY KEY,

    nguoidung_id INT NOT NULL,
    quy_id INT NOT NULL,

    lydo TEXT NOT NULL,
    sotiendenghi DECIMAL(15,2) NOT NULL,

    tailieudinhkem TEXT,

    trangthai ENUM(
        'Cho duyet cap 1',
        'Da duyet cap 1',
        'Tu choi cap 1',
        'Cho duyet cap 2',
        'Da duyet cap 2',
        'Tu choi cap 2',
        'Cho duyet cap 3',
        'Da duyet cap 3',
        'Tu choi cap 3',
        'Cho giai ngan',
        'Da giai ngan',
        'Tu choi'
    ) DEFAULT 'Cho duyet cap 1',

    ghichu TEXT,

    ngaynop TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_nguoidung (nguoidung_id),
    INDEX idx_quy (quy_id),
    INDEX idx_trangthai (trangthai),

    FOREIGN KEY (nguoidung_id)
        REFERENCES nguoidung(nguoidung_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (quy_id)
        REFERENCES quy(quy_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE pheduyet (
    pheduyet_id INT AUTO_INCREMENT PRIMARY KEY,

    yeucauhotro_id INT NOT NULL,
    capduyet TINYINT NOT NULL,

    nguoiduyet_id INT NOT NULL,

    ketqua ENUM(
        'Duyet',
        'Tu choi'
    ) NOT NULL,

    lydo TEXT,
    ghichu TEXT,

    ngayduyet TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_yeucauhotro (yeucauhotro_id),
    INDEX idx_nguoiduyet (nguoiduyet_id),

    FOREIGN KEY (yeucauhotro_id)
        REFERENCES yeucauhotro(yeucauhotro_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (nguoiduyet_id)
        REFERENCES nguoidung(nguoidung_id)
        ON UPDATE CASCADE
);

CREATE TABLE khoantaitro (
    khoantaitro_id INT AUTO_INCREMENT PRIMARY KEY,

    nhataitro_id INT NOT NULL,
    quy_id INT NOT NULL,

    sotien DECIMAL(15,2) NOT NULL,

    hinhthuc ENUM(
        'Tien mat',
        'Chuyen khoan',
        'Khac'
    ) NOT NULL,

    magiaodich VARCHAR(100),

    ngaytaitro DATE NOT NULL,

    chungtu VARCHAR(255),

    trangthai ENUM(
        'Cho duyet',
        'Da duyet',
        'Da nhan',
        'Tu choi'
    ) DEFAULT 'Cho duyet',

    ghichu TEXT,

    nguoixacnhan_id INT,
    ngayxacnhan TIMESTAMP NULL,

    ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_nhataitro (nhataitro_id),
    INDEX idx_quy (quy_id),

    FOREIGN KEY (nhataitro_id)
        REFERENCES nhataitro(nhataitro_id)
        ON UPDATE CASCADE,

    FOREIGN KEY (quy_id)
        REFERENCES quy(quy_id)
        ON UPDATE CASCADE,

    FOREIGN KEY (nguoixacnhan_id)
        REFERENCES nguoidung(nguoidung_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE giaodich (
    giaodich_id INT AUTO_INCREMENT PRIMARY KEY,

    yeucauhotro_id INT NULL COMMENT 'ID yêu cầu hỗ trợ (NULL cho giao dịch THU từ tài trợ)',
    quy_id INT NOT NULL,

    nguoinhan_id INT NULL COMMENT 'ID sinh viên nhận tiền (NULL cho giao dịch THU)',

    sotien DECIMAL(15,2) NOT NULL,

    hinhthuc ENUM(
        'Tien mat',
        'Chuyen khoan'
    ) NOT NULL,

    magiaodich VARCHAR(100),

    chungtu VARCHAR(255),

    trangthai ENUM(
        'Thanh cong',
        'That bai',
        'Dang xu ly'
    ) DEFAULT 'Dang xu ly',

    ghichu TEXT,

    nguoithuchien_id INT NOT NULL,

    ngaygiaodich TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_yeucauhotro (yeucauhotro_id),
    INDEX idx_quy (quy_id),
    INDEX idx_nguoinhan (nguoinhan_id),

    FOREIGN KEY (yeucauhotro_id)
        REFERENCES yeucauhotro(yeucauhotro_id)
        ON UPDATE CASCADE,

    FOREIGN KEY (quy_id)
        REFERENCES quy(quy_id)
        ON UPDATE CASCADE,

    FOREIGN KEY (nguoinhan_id)
        REFERENCES nguoidung(nguoidung_id)
        ON UPDATE CASCADE,

    FOREIGN KEY (nguoithuchien_id)
        REFERENCES nguoidung(nguoidung_id)
        ON UPDATE CASCADE
);

CREATE TABLE taikhoannganhang (
    taikhoannganhang_id INT AUTO_INCREMENT PRIMARY KEY,

    quy_id INT NOT NULL,

    sotaikhoan VARCHAR(50) NOT NULL,
    nganhang VARCHAR(100) NOT NULL,
    chinhanh VARCHAR(100),

    chutaikhoan VARCHAR(100) NOT NULL,

    trangthai ENUM(
        'Hoat dong',
        'Khoa'
    ) DEFAULT 'Hoat dong',

    ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_quy (quy_id),

    FOREIGN KEY (quy_id)
        REFERENCES quy(quy_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE sinhviennoibat (
    sinhviennoibat_id INT AUTO_INCREMENT PRIMARY KEY,

    nguoidung_id INT,

    hoten VARCHAR(100) NOT NULL,

    khoaphong VARCHAR(100),
    namhoc VARCHAR(20),

    hinhanh VARCHAR(255),

    thanhtich TEXT,

    thutu INT DEFAULT 0,

    trangthai ENUM(
        'Hien thi',
        'An'
    ) DEFAULT 'Hien thi',

    ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngaycapnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_thutu (thutu),

    FOREIGN KEY (nguoidung_id)
        REFERENCES nguoidung(nguoidung_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE nhatkyhethong (
    nhatkyhethong_id INT AUTO_INCREMENT PRIMARY KEY,

    nguoidung_id INT,

    hanhdong VARCHAR(100) NOT NULL,

    loaidoituong VARCHAR(50),
    doituong_id INT,

    mota TEXT,

    dulieucu JSON,
    dulieumoi JSON,

    ipaddress VARCHAR(45),

    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_nguoidung (nguoidung_id),
    INDEX idx_hanhdong (hanhdong),

    FOREIGN KEY (nguoidung_id)
        REFERENCES nguoidung(nguoidung_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE `donvihoc` (
  `donvihoc_id` int(11) NOT NULL AUTO_INCREMENT,
  `madonvi` varchar(20) NOT NULL,
  `tenkhoa` varchar(200) NOT NULL,
  `tennganh` varchar(200) DEFAULT NULL,
  `lop` varchar(100) DEFAULT NULL,
  `khoahoc` varchar(50) DEFAULT NULL,
  `mota` text DEFAULT NULL,
  `trangthai` enum('Hoat dong','Ngung hoat dong') DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`donvihoc_id`),
  UNIQUE KEY `uk_madonvi` (`madonvi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci






-- ============================================================
-- BẢNG TẠM CHO KHÁCH VÃNG LAI
-- Mục đích: Hứng dữ liệu trước khi xác minh OTP.
-- Sau khi OTP xác minh thành công, hệ thống tự động:
--   1. Tạo tài khoản nguoidung mới
--   2. Migrate dữ liệu sang bảng chính (yeucauhotro / khoantaitro)
--   3. Đánh dấu trang_thai_staging = 'DA_CHUYEN'
-- KHÔNG có khóa ngoại nào liên kết bảng chính → tránh FK constraint lỗi
-- ============================================================


-- ------------------------------------------------------------
-- 1. Bảng tạm: Đơn xin hỗ trợ của Sinh viên vãng lai
--    Map từ: yeucauhotro (bỏ nguoidung_id, thêm thông tin cá nhân guest)
-- ------------------------------------------------------------
CREATE TABLE guest_yeucauhotro (
    guest_yeucauhotro_id    INT AUTO_INCREMENT PRIMARY KEY,

    -- Thông tin cá nhân (thay thế cho nguoidung_id)
    guest_hoten             VARCHAR(100)    NOT NULL,
    guest_email             VARCHAR(100)    NOT NULL,
    guest_sodienthoai       VARCHAR(15)     NULL,
    guest_mssv              VARCHAR(20)     NULL        COMMENT 'Mã số sinh viên',
    guest_khoa              VARCHAR(100)    NULL,
    guest_lop               VARCHAR(50)     NULL,

    -- Thông tin tài khoản ngân hàng nhận tiền hỗ trợ
    guest_sotaikhoan        VARCHAR(50)     NULL,
    guest_nganhang          VARCHAR(100)    NULL,
    guest_chutaikhoan       VARCHAR(100)    NULL,

    -- Thông tin đơn (map 1-1 với yeucauhotro, không đặt FK)
    quy_id                  INT             NOT NULL    COMMENT 'Tham chiếu quy(quy_id), không đặt FK',
    lydo                    TEXT            NOT NULL,
    sotiendenghi            DECIMAL(15,2)   NOT NULL,
    tailieudinhkem          TEXT            NULL,

    -- Trạng thái bảng tạm (khác với trangthai của đơn chính)
    trang_thai_staging      ENUM(
                                'CHO_XAC_MINH',  -- Mới tạo, chờ khách nhập OTP
                                'DA_CHUYEN',     -- Đã migrate sang yeucauhotro
                                'HET_HAN'        -- OTP hết hạn, chưa xác minh (cron job đánh dấu)
                            ) DEFAULT 'CHO_XAC_MINH',

    -- Cột sau migrate: lưu lại ID bản ghi đã tạo ở bảng chính để tra cứu
    yeucauhotro_id_ref      INT             NULL        COMMENT 'ID trong yeucauhotro sau khi migrate',
    nguoidung_id_ref        INT             NULL        COMMENT 'ID trong nguoidung sau khi tạo tài khoản tự động',

    -- Bảo mật & Tracking
    otp_code                VARCHAR(6)      NULL,
    otp_expires_at          DATETIME        NULL,
    is_email_verified       TINYINT(1)      DEFAULT 0,
    tracking_uuid           VARCHAR(64)     NOT NULL    UNIQUE,

    -- Timestamps
    ngaytao                 TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    ngaycapnhat             TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Index tìm kiếm thường dùng
    INDEX idx_guest_email       (guest_email),
    INDEX idx_tracking_uuid     (tracking_uuid),
    INDEX idx_staging_status    (trang_thai_staging),
    INDEX idx_otp_expires       (otp_expires_at)   COMMENT 'Dùng cho cron job dọn dẹp bản ghi hết hạn'
);


-- ------------------------------------------------------------
-- 2. Bảng tạm: Khoản tài trợ của Nhà tài trợ vãng lai
--    Map từ: khoantaitro (bỏ nhataitro_id, thêm thông tin cá nhân guest)
--    Lưu ý: nhataitro cũng cần được tạo tự động sau khi xác minh OTP
-- ------------------------------------------------------------
CREATE TABLE guest_khoantaitro (
    guest_khoantaitro_id    INT AUTO_INCREMENT PRIMARY KEY,

    -- Thông tin cá nhân nhà tài trợ (thay thế cho nhataitro_id)
    guest_hoten             VARCHAR(100)    NOT NULL,
    guest_email             VARCHAR(100)    NOT NULL,
    guest_sodienthoai       VARCHAR(15)     NULL,
    guest_tochuc            VARCHAR(200)    NULL        COMMENT 'Tên tổ chức / doanh nghiệp nếu có',
    guest_diachi            VARCHAR(255)    NULL,

    -- Thông tin khoản tài trợ (map 1-1 với khoantaitro, không đặt FK)
    quy_id                  INT             NOT NULL    COMMENT 'Tham chiếu quy(quy_id), không đặt FK',
    sotien                  DECIMAL(15,2)   NOT NULL,
    hinhthuc                ENUM(
                                'Tien mat',
                                'Chuyen khoan',
                                'Khac'
                            ) NOT NULL,
    magiaodich              VARCHAR(100)    NULL,
    ngaytaitro              DATE            NOT NULL,
    chungtu                 VARCHAR(255)    NULL,
    ghichu                  TEXT            NULL,

    -- Trạng thái bảng tạm
    trang_thai_staging      ENUM(
                                'CHO_XAC_MINH',
                                'DA_CHUYEN',
                                'HET_HAN'
                            ) DEFAULT 'CHO_XAC_MINH',

    -- Cột sau migrate
    khoantaitro_id_ref      INT             NULL        COMMENT 'ID trong khoantaitro sau khi migrate',
    nhataitro_id_ref        INT             NULL        COMMENT 'ID trong nhataitro sau khi tạo tự động',

    -- Bảo mật & Tracking
    otp_code                VARCHAR(6)      NULL,
    otp_expires_at          DATETIME        NULL,
    is_email_verified       TINYINT(1)      DEFAULT 0,
    tracking_uuid           VARCHAR(64)     NOT NULL    UNIQUE,

    -- Timestamps
    ngaytao                 TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    ngaycapnhat             TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_guest_email       (guest_email),
    INDEX idx_tracking_uuid     (tracking_uuid),
    INDEX idx_staging_status    (trang_thai_staging),
    INDEX idx_otp_expires       (otp_expires_at)
);


-- ------------------------------------------------------------
-- Ghi chú triển khai
-- ------------------------------------------------------------
-- Cron job dọn dẹp (chạy mỗi đêm):
--   UPDATE guest_yeucauhotro
--   SET trang_thai_staging = 'HET_HAN'
--   WHERE trang_thai_staging = 'CHO_XAC_MINH'
--     AND otp_expires_at < NOW() - INTERVAL 24 HOUR;
--
--   (Làm tương tự cho guest_khoantaitro)
--
-- Sau 7 ngày có thể DELETE các bản ghi HET_HAN để dọn bảng.
-- ------------------------------------------------------------

CREATE TABLE tintuc (
    tintuc_id       INT AUTO_INCREMENT PRIMARY KEY,

    -- Nội dung bài viết
    tieude          VARCHAR(255)    NOT NULL,
    mota_ngan       VARCHAR(500)    NULL        COMMENT 'Mô tả ngắn hiển thị ở card preview trên Landing Page',
    noidung         LONGTEXT        NOT NULL    COMMENT 'Nội dung đầy đủ bài viết (có thể chứa HTML/Markdown)',
    avatar    VARCHAR(255)    NULL        COMMENT 'Đường dẫn ảnh thumbnail hiển thị ở card tin tức',

    -- Phân loại
    danh_muc        ENUM(
                        'Tin hoc bong',
                        'Tin giao duc',
                        'Su kien',
                        'Thong bao',
                        'Khac'
                    ) DEFAULT 'Thong bao',
    la_noi_bat      TINYINT(1)      DEFAULT 0   COMMENT '1 = Hiển thị ở vị trí featured (card lớn) trên Landing Page',

    -- Trạng thái xuất bản
    trangthai       ENUM(
                        'Ban nhap',
                        'Da xuat ban',
                        'Da an'
                    ) DEFAULT 'Ban nhap',
    ngay_xuat_ban   TIMESTAMP       NULL        COMMENT 'Thời điểm bài được xuất bản công khai',

    -- Người quản lý
    nguoitao_id     INT             NOT NULL    COMMENT 'Admin hoặc Cán bộ tạo bài viết',
    nguoisua_id     INT             NULL        COMMENT 'Người chỉnh sửa lần cuối',

    -- Timestamps
    ngaytao         TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    ngaycapnhat     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Index
    INDEX idx_trangthai     (trangthai),
    INDEX idx_danhmuc       (danh_muc),
    INDEX idx_noi_bat       (la_noi_bat),
    INDEX idx_ngayxuatban   (ngay_xuat_ban),
    INDEX idx_nguoitao      (nguoitao_id),

    FOREIGN KEY (nguoitao_id)
        REFERENCES nguoidung(nguoidung_id)
        ON UPDATE CASCADE,

    FOREIGN KEY (nguoisua_id)
        REFERENCES nguoidung(nguoidung_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);