-- TVU Fund Management - Live Schema Dump
-- Generated on: 2026-07-03T05:47:57.697Z

CREATE DATABASE IF NOT EXISTS `tvu_fund_management` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tvu_fund_management`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `danhgia` (
  `danhgia_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Mã đánh giá',
  `nguoidung_id` int(11) DEFAULT NULL COMMENT 'Người gửi (NULL nếu gửi với tư cách khách)',
  `hoten` varchar(100) NOT NULL COMMENT 'Họ tên hiển thị',
  `khoa` varchar(100) DEFAULT NULL COMMENT 'Tên khoa',
  `nienkhoa` varchar(20) DEFAULT NULL COMMENT 'Ví dụ: Khóa 2022-2026',
  `avatar` varchar(255) DEFAULT NULL COMMENT 'Ảnh đại diện, NULL thì dùng ảnh mặc định',
  `noidung` text NOT NULL COMMENT 'Lời chia sẻ',
  `trangthai` enum('Cho duyet','Da duyet','Tu choi') NOT NULL DEFAULT 'Cho duyet' COMMENT 'Trạng thái kiểm duyệt',
  `lydotuchoi` text DEFAULT NULL COMMENT 'Lý do từ chối (nếu có)',
  `nguoiduyet_id` int(11) DEFAULT NULL COMMENT 'Người duyệt',
  `ngayduyet` timestamp NULL DEFAULT NULL COMMENT 'Ngày duyệt',
  `noibat` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = Hiển thị nổi bật trên Landing Page, 0 = Bình thường',
  `thutu` int(11) NOT NULL DEFAULT 0 COMMENT 'Thứ tự hiển thị thủ công',
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Ngày cập nhật cuối cùng',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Ng?y g?i ??nh gi?',
  PRIMARY KEY (`danhgia_id`),
  KEY `nguoidung_id` (`nguoidung_id`),
  KEY `nguoiduyet_id` (`nguoiduyet_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `giaodich` (
  `giaodich_id` int(11) NOT NULL AUTO_INCREMENT,
  `yeucauhotro_id` int(11) DEFAULT NULL,
  `quy_id` int(11) NOT NULL,
  `nguoinhan_id` int(11) DEFAULT NULL,
  `sotien` decimal(15,2) NOT NULL,
  `hinhthuc` enum('Tien mat','Chuyen khoan') NOT NULL,
  `magiaodich` varchar(100) DEFAULT NULL,
  `chungtu` varchar(255) DEFAULT NULL,
  `trangthai` enum('Thanh cong','That bai','Dang xu ly') DEFAULT 'Dang xu ly',
  `doisoattrangthai` enum('Chua_doi_soat','Da_doi_soat','Bat_thuong') NOT NULL DEFAULT 'Chua_doi_soat',
  `sotienthucte` decimal(15,2) DEFAULT NULL,
  `doisoatboiid` int(11) DEFAULT NULL,
  `doisoatluc` datetime DEFAULT NULL,
  `doisoatghichu` varchar(255) DEFAULT NULL,
  `ghichu` text DEFAULT NULL,
  `nguoithuchien_id` int(11) NOT NULL,
  `ngaygiaodich` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`giaodich_id`),
  KEY `idx_yeucauhotro` (`yeucauhotro_id`),
  KEY `idx_quy` (`quy_id`),
  KEY `idx_nguoinhan` (`nguoinhan_id`),
  KEY `nguoithuchien_id` (`nguoithuchien_id`),
  KEY `fk_doisoatboiid` (`doisoatboiid`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `guest_khoantaitro` (
  `guest_khoantaitro_id` int(11) NOT NULL AUTO_INCREMENT,
  `guest_hoten` varchar(100) NOT NULL,
  `guest_email` varchar(100) NOT NULL,
  `guest_sodienthoai` varchar(15) DEFAULT NULL,
  `guest_tochuc` varchar(200) DEFAULT NULL COMMENT 'Tên tổ chức / doanh nghiệp nếu có',
  `guest_diachi` varchar(255) DEFAULT NULL,
  `quy_id` int(11) NOT NULL COMMENT 'Tham chiếu quy(quy_id), không đặt FK',
  `sotien` decimal(15,2) NOT NULL,
  `hinhthuc` enum('Tien mat','Chuyen khoan','Khac') NOT NULL,
  `magiaodich` varchar(100) DEFAULT NULL,
  `ngaytaitro` date NOT NULL,
  `chungtu` varchar(255) DEFAULT NULL,
  `ghichu` text DEFAULT NULL,
  `trang_thai_staging` enum('CHO_XAC_MINH','DA_CHUYEN','HET_HAN') DEFAULT 'CHO_XAC_MINH',
  `khoantaitro_id_ref` int(11) DEFAULT NULL COMMENT 'ID trong khoantaitro sau khi migrate',
  `nhataitro_id_ref` int(11) DEFAULT NULL COMMENT 'ID trong nhataitro sau khi tạo tự động',
  `otp_code` varchar(6) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `is_email_verified` tinyint(1) DEFAULT 0,
  `tracking_uuid` varchar(64) NOT NULL,
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`guest_khoantaitro_id`),
  UNIQUE KEY `tracking_uuid` (`tracking_uuid`),
  KEY `idx_guest_email` (`guest_email`),
  KEY `idx_tracking_uuid` (`tracking_uuid`),
  KEY `idx_staging_status` (`trang_thai_staging`),
  KEY `idx_otp_expires` (`otp_expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `guest_yeucauhotro` (
  `guest_yeucauhotro_id` int(11) NOT NULL AUTO_INCREMENT,
  `guest_hoten` varchar(100) NOT NULL,
  `guest_email` varchar(100) NOT NULL,
  `guest_sodienthoai` varchar(15) DEFAULT NULL,
  `guest_mssv` varchar(20) DEFAULT NULL COMMENT 'Mã số sinh viên',
  `guest_khoa` varchar(100) DEFAULT NULL,
  `guest_lop` varchar(50) DEFAULT NULL,
  `guest_sotaikhoan` varchar(50) DEFAULT NULL,
  `guest_nganhang` varchar(100) DEFAULT NULL,
  `guest_chutaikhoan` varchar(100) DEFAULT NULL,
  `quy_id` int(11) NOT NULL COMMENT 'Tham chiếu quy(quy_id), không đặt FK',
  `lydo` text NOT NULL,
  `sotiendenghi` decimal(15,2) NOT NULL,
  `tailieudinhkem` text DEFAULT NULL,
  `trang_thai_staging` enum('CHO_XAC_MINH','DA_CHUYEN','HET_HAN') DEFAULT 'CHO_XAC_MINH',
  `yeucauhotro_id_ref` int(11) DEFAULT NULL COMMENT 'ID trong yeucauhotro sau khi migrate',
  `nguoidung_id_ref` int(11) DEFAULT NULL COMMENT 'ID trong nguoidung sau khi tạo tài khoản tự động',
  `otp_code` varchar(6) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `is_email_verified` tinyint(1) DEFAULT 0,
  `tracking_uuid` varchar(64) NOT NULL,
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`guest_yeucauhotro_id`),
  UNIQUE KEY `tracking_uuid` (`tracking_uuid`),
  KEY `idx_guest_email` (`guest_email`),
  KEY `idx_tracking_uuid` (`tracking_uuid`),
  KEY `idx_staging_status` (`trang_thai_staging`),
  KEY `idx_otp_expires` (`otp_expires_at`) COMMENT 'Dùng cho cron job dọn dẹp bản ghi hết hạn'
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `khoantaitro` (
  `khoantaitro_id` int(11) NOT NULL AUTO_INCREMENT,
  `nhataitro_id` int(11) NOT NULL,
  `quy_id` int(11) NOT NULL,
  `sotien` decimal(15,2) NOT NULL,
  `hinhthuc` enum('Tien mat','Chuyen khoan','Khac') NOT NULL,
  `magiaodich` varchar(100) DEFAULT NULL,
  `ngaytaitro` date NOT NULL,
  `chungtu` varchar(255) DEFAULT NULL,
  `trangthai` enum('Cho duyet','Da duyet','Da nhan','Tu choi') DEFAULT 'Cho duyet',
  `ghichu` text DEFAULT NULL,
  `nguoixacnhan_id` int(11) DEFAULT NULL,
  `ngayxacnhan` timestamp NULL DEFAULT NULL,
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`khoantaitro_id`),
  KEY `idx_nhataitro` (`nhataitro_id`),
  KEY `idx_quy` (`quy_id`),
  KEY `nguoixacnhan_id` (`nguoixacnhan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `loaiquy` (
  `loaiquy_id` int(11) NOT NULL AUTO_INCREMENT,
  `maloai` varchar(50) NOT NULL,
  `tenloai` varchar(100) NOT NULL,
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`loaiquy_id`),
  UNIQUE KEY `uk_maloai` (`maloai`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `nguoidung` (
  `nguoidung_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `matkhau` varchar(255) DEFAULT NULL,
  `hoten` varchar(100) NOT NULL,
  `masodinhdanh` varchar(20) DEFAULT NULL,
  `ngaysinh` date DEFAULT NULL,
  `gioitinh` enum('Nam','Nu','Khac') DEFAULT NULL,
  `sodienthoai` varchar(15) DEFAULT NULL,
  `diachi` text DEFAULT NULL,
  `donvihoc_id` int(11) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `vaitro_id` int(11) NOT NULL,
  `loaitaikhoan` enum('Sinh vien','Nha tai tro') DEFAULT NULL,
  `trangthai` enum('Hoat dong','Khoa','Cho duyet') DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `taikhoannganhang_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`nguoidung_id`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `vaitro_id` (`vaitro_id`),
  KEY `fk_nguoidung_donvihoc` (`donvihoc_id`),
  KEY `fk_nguoidung_taikhoannganhang` (`taikhoannganhang_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `nhataitro` (
  `nhataitro_id` int(11) NOT NULL AUTO_INCREMENT,
  `tennhataitro` varchar(200) NOT NULL,
  `loainhataitro` enum('Ca nhan','To chuc','Doanh nghiep') NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `sodienthoai` varchar(15) DEFAULT NULL,
  `diachi` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `mota` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `nguoidung_id` int(11) DEFAULT NULL,
  `trangthai` enum('Hoat dong','Ngung hoat dong') DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`nhataitro_id`),
  KEY `nguoidung_id` (`nguoidung_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `nhatkyhethong` (
  `nhatkyhethong_id` int(11) NOT NULL AUTO_INCREMENT,
  `nguoidung_id` int(11) DEFAULT NULL,
  `hanhdong` varchar(100) NOT NULL,
  `loaidoituong` varchar(50) DEFAULT NULL,
  `doituong_id` int(11) DEFAULT NULL,
  `mota` text DEFAULT NULL,
  `dulieucu` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dulieucu`)),
  `dulieumoi` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dulieumoi`)),
  `ipaddress` varchar(45) DEFAULT NULL,
  `createdat` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`nhatkyhethong_id`),
  KEY `idx_nguoidung` (`nguoidung_id`),
  KEY `idx_hanhdong` (`hanhdong`)
) ENGINE=InnoDB AUTO_INCREMENT=226 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `phanbongansach` (
  `phanbongansach_id` int(11) NOT NULL AUTO_INCREMENT,
  `quy_nguon_id` int(11) NOT NULL COMMENT 'ID của bể tiền lớn (quy_cha)',
  `quy_dich_id` int(11) NOT NULL COMMENT 'ID của mục chi (quy_con)',
  `sotien` decimal(15,2) NOT NULL COMMENT 'Số tiền đề xuất trích lập',
  `soquyetdinh` varchar(100) NOT NULL COMMENT 'Số quyết định trích lập',
  `filequyetdinh` varchar(255) DEFAULT NULL COMMENT 'File minh chứng quyết định',
  `trangthai` enum('Cho duyet','Da duyet','Tu choi','Da thu hoi') NOT NULL DEFAULT 'Cho duyet' COMMENT 'Trạng thái đề xuất',
  `lydotuchoi` text DEFAULT NULL COMMENT 'Lý do nếu bị từ chối duyệt',
  `nguoi_de_xuat_id` int(11) NOT NULL COMMENT 'Cán bộ đề xuất trích tiền',
  `nguoi_duyet_id` int(11) DEFAULT NULL COMMENT 'Người phê duyệt đề xuất (Admin)',
  `ngaydexuat` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngayduyet` timestamp NULL DEFAULT NULL,
  `ghichu` text DEFAULT NULL,
  PRIMARY KEY (`phanbongansach_id`),
  KEY `quy_nguon_id` (`quy_nguon_id`),
  KEY `quy_dich_id` (`quy_dich_id`),
  KEY `nguoi_de_xuat_id` (`nguoi_de_xuat_id`),
  KEY `nguoi_duyet_id` (`nguoi_duyet_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý trích lập ngân sách nội bộ';

CREATE TABLE `pheduyet` (
  `pheduyet_id` int(11) NOT NULL AUTO_INCREMENT,
  `yeucauhotro_id` int(11) NOT NULL,
  `capduyet` tinyint(4) NOT NULL,
  `nguoiduyet_id` int(11) DEFAULT NULL,
  `ketqua` enum('Cho duyet','Duyet','Da duyet','Tu choi') NOT NULL DEFAULT 'Cho duyet',
  `lydo` text DEFAULT NULL,
  `ghichu` text DEFAULT NULL,
  `ngayduyet` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`pheduyet_id`),
  KEY `idx_yeucauhotro` (`yeucauhotro_id`),
  KEY `idx_nguoiduyet` (`nguoiduyet_id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quy` (
  `quy_id` int(11) NOT NULL AUTO_INCREMENT,
  `tenquy` varchar(200) NOT NULL,
  `loaiquy_id` int(11) NOT NULL,
  `mota` text DEFAULT NULL,
  `hinhanh` varchar(255) DEFAULT NULL,
  `sotienmuctieu` decimal(15,2) DEFAULT 0.00,
  `sodu` decimal(15,2) DEFAULT 0.00,
  `sotienhotrotoida` decimal(15,2) DEFAULT NULL,
  `soluonghotrotoida` int(11) DEFAULT NULL,
  `dieukienhotro` text DEFAULT NULL,
  `ngaybatdau` date DEFAULT NULL,
  `ngayketthuc` date DEFAULT NULL,
  `trangthai` enum('Dang hoat dong','Tam dung','Da dong') DEFAULT 'Dang hoat dong',
  `nguoitao_id` int(11) DEFAULT NULL,
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `loaidieuhanh` enum('Tap trung - Be chung','Tap trung - Muc chi') NOT NULL DEFAULT 'Tap trung - Be chung' COMMENT 'Hình thức vận hành quỹ',
  `quy_cha_id` int(11) DEFAULT NULL COMMENT 'ID của Quỹ cha (Bể tiền lớn)',
  PRIMARY KEY (`quy_id`),
  KEY `loaiquy_id` (`loaiquy_id`),
  KEY `nguoitao_id` (`nguoitao_id`),
  KEY `fk_quy_parent` (`quy_cha_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sinhviennoibat` (
  `sinhviennoibat_id` int(11) NOT NULL AUTO_INCREMENT,
  `nguoidung_id` int(11) NOT NULL COMMENT 'ID liên kết tới tài khoản sinh viên',
  `namhoc` varchar(20) DEFAULT NULL,
  `thanhtich` text DEFAULT NULL,
  `thutu` int(11) DEFAULT 0,
  `trangthai` enum('Hien thi','An') DEFAULT 'Hien thi',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`sinhviennoibat_id`),
  KEY `idx_thutu` (`thutu`),
  KEY `nguoidung_id` (`nguoidung_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `taikhoannganhang` (
  `taikhoannganhang_id` int(11) NOT NULL AUTO_INCREMENT,
  `quy_id` int(11) DEFAULT NULL,
  `sotaikhoan` varchar(50) NOT NULL,
  `nganhang` varchar(100) NOT NULL,
  `chinhanh` varchar(100) DEFAULT NULL,
  `chutaikhoan` varchar(100) NOT NULL,
  `trangthai` enum('Hoat dong','Khoa') DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`taikhoannganhang_id`),
  KEY `idx_quy` (`quy_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tintuc` (
  `tintuc_id` int(11) NOT NULL AUTO_INCREMENT,
  `tieude` varchar(255) NOT NULL,
  `motangan` varchar(500) DEFAULT NULL,
  `noidung` longtext NOT NULL COMMENT 'Nội dung đầy đủ bài viết (có thể chứa HTML/Markdown)',
  `avatar` varchar(255) DEFAULT NULL COMMENT 'Đường dẫn ảnh thumbnail hiển thị ở card tin tức',
  `danhmuc` enum('Tin hoc bong','Tin giao duc','Su kien','Thong bao','Khac') DEFAULT 'Thong bao',
  `phanloai` enum('Tin moi','Tin noi bat') DEFAULT 'Tin moi' COMMENT 'Tin moi = hiển thị section Tin Mới, Tin noi bat = hiển thị section Tin Nổi Bật',
  `lanoibat` tinyint(4) DEFAULT 0 COMMENT '0=Bình thường, 1=Featured lớn, 2=Featured nhỏ hàng dưới, 3=Sidebar',
  `trangthai` enum('Ban nhap','Da xuat ban','Da an') DEFAULT 'Ban nhap',
  `ngayxuatban` timestamp NULL DEFAULT NULL,
  `nguoitao_id` int(11) NOT NULL COMMENT 'Admin hoặc Cán bộ tạo bài viết',
  `nguoisua_id` int(11) DEFAULT NULL COMMENT 'Người chỉnh sửa lần cuối',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`tintuc_id`),
  KEY `idx_trangthai` (`trangthai`),
  KEY `idx_danhmuc` (`danhmuc`),
  KEY `idx_noi_bat` (`lanoibat`),
  KEY `idx_ngayxuatban` (`ngayxuatban`),
  KEY `idx_nguoitao` (`nguoitao_id`),
  KEY `nguoisua_id` (`nguoisua_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `vaitro` (
  `vaitro_id` int(11) NOT NULL AUTO_INCREMENT,
  `tenvaitro` varchar(50) NOT NULL,
  `mota` text DEFAULT NULL,
  `trangthai` enum('Hoat dong','Tam dung') DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`vaitro_id`),
  UNIQUE KEY `uk_tenvaitro` (`tenvaitro`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `yeucauhotro` (
  `yeucauhotro_id` int(11) NOT NULL AUTO_INCREMENT,
  `nguoidung_id` int(11) NOT NULL,
  `quy_id` int(11) NOT NULL,
  `lydo` text NOT NULL,
  `sotiendenghi` decimal(15,2) NOT NULL,
  `tailieudinhkem` text DEFAULT NULL,
  `trangthai` enum('Cho duyet cap 1','Da duyet cap 1','Tu choi cap 1','Cho duyet cap 2','Da duyet cap 2','Tu choi cap 2','Cho duyet cap 3','Da duyet cap 3','Tu choi cap 3','Cho giai ngan','Da giai ngan','Tu choi') DEFAULT 'Cho duyet cap 1',
  `ghichu` text DEFAULT NULL,
  `ngaynop` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`yeucauhotro_id`),
  KEY `idx_nguoidung` (`nguoidung_id`),
  KEY `idx_quy` (`quy_id`),
  KEY `idx_trangthai` (`trangthai`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Foreign key constraints
ALTER TABLE `danhgia` ADD CONSTRAINT `danhgia_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `danhgia` ADD CONSTRAINT `danhgia_ibfk_2` FOREIGN KEY (`nguoiduyet_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `giaodich` ADD CONSTRAINT `fk_doisoatboiid` FOREIGN KEY (`doisoatboiid`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `giaodich` ADD CONSTRAINT `giaodich_ibfk_1` FOREIGN KEY (`yeucauhotro_id`) REFERENCES `yeucauhotro` (`yeucauhotro_id`) ON UPDATE CASCADE;
ALTER TABLE `giaodich` ADD CONSTRAINT `giaodich_ibfk_2` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON UPDATE CASCADE;
ALTER TABLE `giaodich` ADD CONSTRAINT `giaodich_ibfk_3` FOREIGN KEY (`nguoinhan_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE;
ALTER TABLE `giaodich` ADD CONSTRAINT `giaodich_ibfk_4` FOREIGN KEY (`nguoithuchien_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE;
ALTER TABLE `khoantaitro` ADD CONSTRAINT `khoantaitro_ibfk_1` FOREIGN KEY (`nhataitro_id`) REFERENCES `nhataitro` (`nhataitro_id`) ON UPDATE CASCADE;
ALTER TABLE `khoantaitro` ADD CONSTRAINT `khoantaitro_ibfk_2` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON UPDATE CASCADE;
ALTER TABLE `khoantaitro` ADD CONSTRAINT `khoantaitro_ibfk_3` FOREIGN KEY (`nguoixacnhan_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `nguoidung` ADD CONSTRAINT `fk_nguoidung_donvihoc` FOREIGN KEY (`donvihoc_id`) REFERENCES `donvihoc` (`donvihoc_id`) ON UPDATE CASCADE;
ALTER TABLE `nguoidung` ADD CONSTRAINT `fk_nguoidung_taikhoannganhang` FOREIGN KEY (`taikhoannganhang_id`) REFERENCES `taikhoannganhang` (`taikhoannganhang_id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `nguoidung` ADD CONSTRAINT `nguoidung_ibfk_1` FOREIGN KEY (`vaitro_id`) REFERENCES `vaitro` (`vaitro_id`) ON UPDATE CASCADE;
ALTER TABLE `nhataitro` ADD CONSTRAINT `nhataitro_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `nhatkyhethong` ADD CONSTRAINT `nhatkyhethong_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `phanbongansach` ADD CONSTRAINT `phanbongansach_ibfk_1` FOREIGN KEY (`quy_nguon_id`) REFERENCES `quy` (`quy_id`) ON UPDATE CASCADE;
ALTER TABLE `phanbongansach` ADD CONSTRAINT `phanbongansach_ibfk_2` FOREIGN KEY (`quy_dich_id`) REFERENCES `quy` (`quy_id`) ON UPDATE CASCADE;
ALTER TABLE `phanbongansach` ADD CONSTRAINT `phanbongansach_ibfk_3` FOREIGN KEY (`nguoi_de_xuat_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE;
ALTER TABLE `phanbongansach` ADD CONSTRAINT `phanbongansach_ibfk_4` FOREIGN KEY (`nguoi_duyet_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE;
ALTER TABLE `pheduyet` ADD CONSTRAINT `pheduyet_ibfk_1` FOREIGN KEY (`yeucauhotro_id`) REFERENCES `yeucauhotro` (`yeucauhotro_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `pheduyet` ADD CONSTRAINT `pheduyet_ibfk_2` FOREIGN KEY (`nguoiduyet_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE;
ALTER TABLE `quy` ADD CONSTRAINT `fk_quy_parent` FOREIGN KEY (`quy_cha_id`) REFERENCES `quy` (`quy_id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `quy` ADD CONSTRAINT `quy_ibfk_1` FOREIGN KEY (`loaiquy_id`) REFERENCES `loaiquy` (`loaiquy_id`) ON UPDATE CASCADE;
ALTER TABLE `quy` ADD CONSTRAINT `quy_ibfk_2` FOREIGN KEY (`nguoitao_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `sinhviennoibat` ADD CONSTRAINT `sinhviennoibat_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `taikhoannganhang` ADD CONSTRAINT `taikhoannganhang_ibfk_1` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `tintuc` ADD CONSTRAINT `tintuc_ibfk_1` FOREIGN KEY (`nguoitao_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE;
ALTER TABLE `tintuc` ADD CONSTRAINT `tintuc_ibfk_2` FOREIGN KEY (`nguoisua_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `yeucauhotro` ADD CONSTRAINT `yeucauhotro_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `yeucauhotro` ADD CONSTRAINT `yeucauhotro_ibfk_2` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON DELETE CASCADE ON UPDATE CASCADE;
