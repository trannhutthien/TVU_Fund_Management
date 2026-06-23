-- TVU Fund Management - Database schema
-- Generated from live database: defaultdb
-- MySQL/MariaDB version: 8.4.8
-- Purpose: create database and tables manually without seed data.

CREATE DATABASE IF NOT EXISTS `tvu_fund_management`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `tvu_fund_management`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE `danhgia` (
  `danhgia_id` int NOT NULL AUTO_INCREMENT COMMENT 'Mã đánh giá',
  `nguoidung_id` int DEFAULT NULL COMMENT 'Người gửi (NULL nếu gửi với tư cách khách)',
  `hoten` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Họ tên hiển thị',
  `khoa` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tên khoa',
  `nienkhoa` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ví dụ: Khóa 2022-2026',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh đại diện, NULL thì dùng ảnh mặc định',
  `noidung` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Lời chia sẻ',
  `trangthai` enum('Cho duyet','Da duyet','Tu choi') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Cho duyet' COMMENT 'Trạng thái kiểm duyệt',
  `lydotuchoi` text COLLATE utf8mb4_unicode_ci COMMENT 'Lý do từ chối (nếu có)',
  `nguoiduyet_id` int DEFAULT NULL COMMENT 'Người duyệt',
  `ngayduyet` timestamp NULL DEFAULT NULL COMMENT 'Ngày duyệt',
  `noibat` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = Hiển thị nổi bật trên Landing Page, 0 = Bình thường',
  `thutu` int NOT NULL DEFAULT '0' COMMENT 'Thứ tự hiển thị thủ công',
  `ngaycapnhat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngày cập nhật cuối cùng',
  `ngaytao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ng?y g?i ??nh gi?',
  PRIMARY KEY (`danhgia_id`),
  KEY `nguoidung_id` (`nguoidung_id`),
  KEY `nguoiduyet_id` (`nguoiduyet_id`)
);

CREATE TABLE `donvihoc` (
  `donvihoc_id` int NOT NULL AUTO_INCREMENT,
  `madonvi` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenkhoa` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tennganh` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lop` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `khoahoc` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mota` text COLLATE utf8mb4_unicode_ci,
  `trangthai` enum('Hoat dong','Ngung hoat dong') COLLATE utf8mb4_unicode_ci DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`donvihoc_id`),
  UNIQUE KEY `uk_madonvi` (`madonvi`)
);

CREATE TABLE `giaodich` (
  `giaodich_id` int NOT NULL AUTO_INCREMENT,
  `yeucauhotro_id` int DEFAULT NULL,
  `quy_id` int NOT NULL,
  `nguoinhan_id` int DEFAULT NULL,
  `sotien` decimal(15,2) NOT NULL,
  `hinhthuc` enum('Tien mat','Chuyen khoan') COLLATE utf8mb4_unicode_ci NOT NULL,
  `magiaodich` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chungtu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangthai` enum('Thanh cong','That bai','Dang xu ly') COLLATE utf8mb4_unicode_ci DEFAULT 'Dang xu ly',
  `doisoattrangthai` enum('Chua_doi_soat','Da_doi_soat','Bat_thuong') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Chua_doi_soat',
  `sotienthucte` decimal(15,2) DEFAULT NULL,
  `doisoatboiid` int DEFAULT NULL,
  `doisoatluc` datetime DEFAULT NULL,
  `doisoatghichu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ghichu` text COLLATE utf8mb4_unicode_ci,
  `nguoithuchien_id` int NOT NULL,
  `ngaygiaodich` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`giaodich_id`),
  KEY `idx_yeucauhotro` (`yeucauhotro_id`),
  KEY `idx_quy` (`quy_id`),
  KEY `idx_nguoinhan` (`nguoinhan_id`),
  KEY `nguoithuchien_id` (`nguoithuchien_id`),
  KEY `fk_doisoatboiid` (`doisoatboiid`)
);

CREATE TABLE `guest_khoantaitro` (
  `guest_khoantaitro_id` int NOT NULL AUTO_INCREMENT,
  `guest_hoten` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_sodienthoai` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_tochuc` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tên tổ chức / doanh nghiệp nếu có',
  `guest_diachi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quy_id` int NOT NULL COMMENT 'Tham chiếu quy(quy_id), không đặt FK',
  `sotien` decimal(15,2) NOT NULL,
  `hinhthuc` enum('Tien mat','Chuyen khoan','Khac') COLLATE utf8mb4_unicode_ci NOT NULL,
  `magiaodich` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngaytaitro` date NOT NULL,
  `chungtu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ghichu` text COLLATE utf8mb4_unicode_ci,
  `trang_thai_staging` enum('CHO_XAC_MINH','DA_CHUYEN','HET_HAN') COLLATE utf8mb4_unicode_ci DEFAULT 'CHO_XAC_MINH',
  `khoantaitro_id_ref` int DEFAULT NULL COMMENT 'ID trong khoantaitro sau khi migrate',
  `nhataitro_id_ref` int DEFAULT NULL COMMENT 'ID trong nhataitro sau khi tạo tự động',
  `otp_code` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `is_email_verified` tinyint(1) DEFAULT '0',
  `tracking_uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngaytao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`guest_khoantaitro_id`),
  UNIQUE KEY `tracking_uuid` (`tracking_uuid`),
  KEY `idx_guest_email` (`guest_email`),
  KEY `idx_tracking_uuid` (`tracking_uuid`),
  KEY `idx_staging_status` (`trang_thai_staging`),
  KEY `idx_otp_expires` (`otp_expires_at`)
);

CREATE TABLE `guest_yeucauhotro` (
  `guest_yeucauhotro_id` int NOT NULL AUTO_INCREMENT,
  `guest_hoten` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_sodienthoai` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_mssv` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mã số sinh viên',
  `guest_khoa` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_lop` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_sotaikhoan` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_nganhang` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_chutaikhoan` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quy_id` int NOT NULL COMMENT 'Tham chiếu quy(quy_id), không đặt FK',
  `lydo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sotiendenghi` decimal(15,2) NOT NULL,
  `tailieudinhkem` text COLLATE utf8mb4_unicode_ci,
  `trang_thai_staging` enum('CHO_XAC_MINH','DA_CHUYEN','HET_HAN') COLLATE utf8mb4_unicode_ci DEFAULT 'CHO_XAC_MINH',
  `yeucauhotro_id_ref` int DEFAULT NULL COMMENT 'ID trong yeucauhotro sau khi migrate',
  `nguoidung_id_ref` int DEFAULT NULL COMMENT 'ID trong nguoidung sau khi tạo tài khoản tự động',
  `otp_code` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `is_email_verified` tinyint(1) DEFAULT '0',
  `tracking_uuid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngaytao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`guest_yeucauhotro_id`),
  UNIQUE KEY `tracking_uuid` (`tracking_uuid`),
  KEY `idx_guest_email` (`guest_email`),
  KEY `idx_tracking_uuid` (`tracking_uuid`),
  KEY `idx_staging_status` (`trang_thai_staging`),
  KEY `idx_otp_expires` (`otp_expires_at`)
);

CREATE TABLE `khoantaitro` (
  `khoantaitro_id` int NOT NULL AUTO_INCREMENT,
  `nhataitro_id` int NOT NULL,
  `quy_id` int NOT NULL,
  `sotien` decimal(15,2) NOT NULL,
  `hinhthuc` enum('Tien mat','Chuyen khoan','Khac') COLLATE utf8mb4_unicode_ci NOT NULL,
  `magiaodich` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngaytaitro` date NOT NULL,
  `chungtu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangthai` enum('Cho duyet','Da duyet','Da nhan','Tu choi') COLLATE utf8mb4_unicode_ci DEFAULT 'Cho duyet',
  `ghichu` text COLLATE utf8mb4_unicode_ci,
  `nguoixacnhan_id` int DEFAULT NULL,
  `ngayxacnhan` timestamp NULL DEFAULT NULL,
  `ngaytao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`khoantaitro_id`),
  KEY `idx_nhataitro` (`nhataitro_id`),
  KEY `idx_quy` (`quy_id`),
  KEY `nguoixacnhan_id` (`nguoixacnhan_id`)
);

CREATE TABLE `loaiquy` (
  `loaiquy_id` int NOT NULL AUTO_INCREMENT,
  `maloai` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenloai` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ngaytao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`loaiquy_id`),
  UNIQUE KEY `uk_maloai` (`maloai`)
);

CREATE TABLE `nguoidung` (
  `nguoidung_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matkhau` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hoten` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `masodinhdanh` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngaysinh` date DEFAULT NULL,
  `gioitinh` enum('Nam','Nu','Khac') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sodienthoai` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diachi` text COLLATE utf8mb4_unicode_ci,
  `donvihoc_id` int DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vaitro_id` int NOT NULL,
  `loaitaikhoan` enum('Sinh vien','Nha tai tro') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trangthai` enum('Hoat dong','Khoa','Cho duyet') COLLATE utf8mb4_unicode_ci DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `taikhoannganhang_id` int DEFAULT NULL,
  PRIMARY KEY (`nguoidung_id`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `vaitro_id` (`vaitro_id`),
  KEY `fk_nguoidung_donvihoc` (`donvihoc_id`),
  KEY `fk_nguoidung_taikhoannganhang` (`taikhoannganhang_id`)
);

CREATE TABLE `nhataitro` (
  `nhataitro_id` int NOT NULL AUTO_INCREMENT,
  `tennhataitro` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loainhataitro` enum('Ca nhan','To chuc','Doanh nghiep') COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sodienthoai` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diachi` text COLLATE utf8mb4_unicode_ci,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mota` text COLLATE utf8mb4_unicode_ci,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nguoidung_id` int DEFAULT NULL,
  `trangthai` enum('Hoat dong','Ngung hoat dong') COLLATE utf8mb4_unicode_ci DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`nhataitro_id`),
  KEY `nguoidung_id` (`nguoidung_id`)
);

CREATE TABLE `nhatkyhethong` (
  `nhatkyhethong_id` int NOT NULL AUTO_INCREMENT,
  `nguoidung_id` int DEFAULT NULL,
  `hanhdong` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaidoituong` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doituong_id` int DEFAULT NULL,
  `mota` text COLLATE utf8mb4_unicode_ci,
  `dulieucu` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `dulieumoi` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `ipaddress` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`nhatkyhethong_id`),
  KEY `idx_nguoidung` (`nguoidung_id`),
  KEY `idx_hanhdong` (`hanhdong`),
  CONSTRAINT `nhatkyhethong_chk_1` CHECK (json_valid(`dulieucu`)),
  CONSTRAINT `nhatkyhethong_chk_2` CHECK (json_valid(`dulieumoi`))
);

CREATE TABLE `pheduyet` (
  `pheduyet_id` int NOT NULL AUTO_INCREMENT,
  `yeucauhotro_id` int NOT NULL,
  `capduyet` tinyint NOT NULL,
  `nguoiduyet_id` int DEFAULT NULL,
  `ketqua` enum('Cho duyet','Duyet','Da duyet','Tu choi') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Cho duyet',
  `lydo` text COLLATE utf8mb4_unicode_ci,
  `ghichu` text COLLATE utf8mb4_unicode_ci,
  `ngayduyet` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pheduyet_id`),
  KEY `idx_yeucauhotro` (`yeucauhotro_id`),
  KEY `idx_nguoiduyet` (`nguoiduyet_id`)
);

CREATE TABLE `quy` (
  `quy_id` int NOT NULL AUTO_INCREMENT,
  `tenquy` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `loaiquy_id` int NOT NULL,
  `mota` text COLLATE utf8mb4_unicode_ci,
  `hinhanh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sotienmuctieu` decimal(15,2) DEFAULT '0.00',
  `sodu` decimal(15,2) DEFAULT '0.00',
  `sotienhotrotoida` decimal(15,2) DEFAULT NULL,
  `soluonghotrotoida` int DEFAULT NULL,
  `dieukienhotro` text COLLATE utf8mb4_unicode_ci,
  `ngaybatdau` date DEFAULT NULL,
  `ngayketthuc` date DEFAULT NULL,
  `trangthai` enum('Dang hoat dong','Tam dung','Da dong') COLLATE utf8mb4_unicode_ci DEFAULT 'Dang hoat dong',
  `nguoitao_id` int DEFAULT NULL,
  `ngaytao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`quy_id`),
  KEY `loaiquy_id` (`loaiquy_id`),
  KEY `nguoitao_id` (`nguoitao_id`)
);

CREATE TABLE `sinhviennoibat` (
  `sinhviennoibat_id` int NOT NULL AUTO_INCREMENT,
  `nguoidung_id` int DEFAULT NULL,
  `hoten` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `khoaphong` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `namhoc` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hinhanh` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thanhtich` text COLLATE utf8mb4_unicode_ci,
  `thutu` int DEFAULT '0',
  `trangthai` enum('Hien thi','An') COLLATE utf8mb4_unicode_ci DEFAULT 'Hien thi',
  `ngaytao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`sinhviennoibat_id`),
  KEY `idx_thutu` (`thutu`),
  KEY `nguoidung_id` (`nguoidung_id`)
);

CREATE TABLE `taikhoannganhang` (
  `taikhoannganhang_id` int NOT NULL AUTO_INCREMENT,
  `quy_id` int DEFAULT NULL,
  `sotaikhoan` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nganhang` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `chinhanh` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `chutaikhoan` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trangthai` enum('Hoat dong','Khoa') COLLATE utf8mb4_unicode_ci DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`taikhoannganhang_id`),
  KEY `idx_quy` (`quy_id`)
);

CREATE TABLE `tintuc` (
  `tintuc_id` int NOT NULL AUTO_INCREMENT,
  `tieude` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `motangan` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noidung` longtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung đầy đủ bài viết (có thể chứa HTML/Markdown)',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Đường dẫn ảnh thumbnail hiển thị ở card tin tức',
  `danhmuc` enum('Tin hoc bong','Tin giao duc','Su kien','Thong bao','Khac') COLLATE utf8mb4_unicode_ci DEFAULT 'Thong bao',
  `phanloai` enum('Tin moi','Tin noi bat') COLLATE utf8mb4_unicode_ci DEFAULT 'Tin moi' COMMENT 'Tin moi = hiển thị section Tin Mới, Tin noi bat = hiển thị section Tin Nổi Bật',
  `lanoibat` tinyint DEFAULT '0' COMMENT '0=Bình thường, 1=Featured lớn, 2=Featured nhỏ hàng dưới, 3=Sidebar',
  `trangthai` enum('Ban nhap','Da xuat ban','Da an') COLLATE utf8mb4_unicode_ci DEFAULT 'Ban nhap',
  `ngayxuatban` timestamp NULL DEFAULT NULL,
  `nguoitao_id` int NOT NULL COMMENT 'Admin hoặc Cán bộ tạo bài viết',
  `nguoisua_id` int DEFAULT NULL COMMENT 'Người chỉnh sửa lần cuối',
  `ngaytao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tintuc_id`),
  KEY `idx_trangthai` (`trangthai`),
  KEY `idx_danhmuc` (`danhmuc`),
  KEY `idx_noi_bat` (`lanoibat`),
  KEY `idx_ngayxuatban` (`ngayxuatban`),
  KEY `idx_nguoitao` (`nguoitao_id`),
  KEY `nguoisua_id` (`nguoisua_id`)
);

CREATE TABLE `vaitro` (
  `vaitro_id` int NOT NULL AUTO_INCREMENT,
  `tenvaitro` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mota` text COLLATE utf8mb4_unicode_ci,
  `trangthai` enum('Hoat dong','Tam dung') COLLATE utf8mb4_unicode_ci DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`vaitro_id`),
  UNIQUE KEY `uk_tenvaitro` (`tenvaitro`)
);

CREATE TABLE `yeucauhotro` (
  `yeucauhotro_id` int NOT NULL AUTO_INCREMENT,
  `nguoidung_id` int NOT NULL,
  `quy_id` int NOT NULL,
  `lydo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sotiendenghi` decimal(15,2) NOT NULL,
  `tailieudinhkem` text COLLATE utf8mb4_unicode_ci,
  `trangthai` enum('Cho duyet cap 1','Da duyet cap 1','Tu choi cap 1','Cho duyet cap 2','Da duyet cap 2','Tu choi cap 2','Cho duyet cap 3','Da duyet cap 3','Tu choi cap 3','Cho giai ngan','Da giai ngan','Tu choi') COLLATE utf8mb4_unicode_ci DEFAULT 'Cho duyet cap 1',
  `ghichu` text COLLATE utf8mb4_unicode_ci,
  `ngaynop` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngaycapnhat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`yeucauhotro_id`),
  KEY `idx_nguoidung` (`nguoidung_id`),
  KEY `idx_quy` (`quy_id`),
  KEY `idx_trangthai` (`trangthai`)
);

SET FOREIGN_KEY_CHECKS = 1;

-- Foreign key constraints are added after all tables are created to avoid
-- dependency-order issues when creating the schema manually.
ALTER TABLE `danhgia`
  ADD CONSTRAINT `danhgia_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `danhgia`
  ADD CONSTRAINT `danhgia_ibfk_2` FOREIGN KEY (`nguoiduyet_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `giaodich`
  ADD CONSTRAINT `fk_doisoatboiid` FOREIGN KEY (`doisoatboiid`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `giaodich`
  ADD CONSTRAINT `giaodich_ibfk_1` FOREIGN KEY (`yeucauhotro_id`) REFERENCES `yeucauhotro` (`yeucauhotro_id`) ON UPDATE CASCADE;

ALTER TABLE `giaodich`
  ADD CONSTRAINT `giaodich_ibfk_2` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON UPDATE CASCADE;

ALTER TABLE `giaodich`
  ADD CONSTRAINT `giaodich_ibfk_3` FOREIGN KEY (`nguoinhan_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE;

ALTER TABLE `giaodich`
  ADD CONSTRAINT `giaodich_ibfk_4` FOREIGN KEY (`nguoithuchien_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE;

ALTER TABLE `khoantaitro`
  ADD CONSTRAINT `khoantaitro_ibfk_1` FOREIGN KEY (`nhataitro_id`) REFERENCES `nhataitro` (`nhataitro_id`) ON UPDATE CASCADE;

ALTER TABLE `khoantaitro`
  ADD CONSTRAINT `khoantaitro_ibfk_2` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON UPDATE CASCADE;

ALTER TABLE `khoantaitro`
  ADD CONSTRAINT `khoantaitro_ibfk_3` FOREIGN KEY (`nguoixacnhan_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `nguoidung`
  ADD CONSTRAINT `fk_nguoidung_donvihoc` FOREIGN KEY (`donvihoc_id`) REFERENCES `donvihoc` (`donvihoc_id`) ON UPDATE CASCADE;

ALTER TABLE `nguoidung`
  ADD CONSTRAINT `fk_nguoidung_taikhoannganhang` FOREIGN KEY (`taikhoannganhang_id`) REFERENCES `taikhoannganhang` (`taikhoannganhang_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `nguoidung`
  ADD CONSTRAINT `nguoidung_ibfk_1` FOREIGN KEY (`vaitro_id`) REFERENCES `vaitro` (`vaitro_id`) ON UPDATE CASCADE;

ALTER TABLE `nhataitro`
  ADD CONSTRAINT `nhataitro_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `nhatkyhethong`
  ADD CONSTRAINT `nhatkyhethong_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `pheduyet`
  ADD CONSTRAINT `pheduyet_ibfk_1` FOREIGN KEY (`yeucauhotro_id`) REFERENCES `yeucauhotro` (`yeucauhotro_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `pheduyet`
  ADD CONSTRAINT `pheduyet_ibfk_2` FOREIGN KEY (`nguoiduyet_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE;

ALTER TABLE `quy`
  ADD CONSTRAINT `quy_ibfk_1` FOREIGN KEY (`loaiquy_id`) REFERENCES `loaiquy` (`loaiquy_id`) ON UPDATE CASCADE;

ALTER TABLE `quy`
  ADD CONSTRAINT `quy_ibfk_2` FOREIGN KEY (`nguoitao_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `sinhviennoibat`
  ADD CONSTRAINT `sinhviennoibat_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `taikhoannganhang`
  ADD CONSTRAINT `taikhoannganhang_ibfk_1` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `tintuc`
  ADD CONSTRAINT `tintuc_ibfk_1` FOREIGN KEY (`nguoitao_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE;

ALTER TABLE `tintuc`
  ADD CONSTRAINT `tintuc_ibfk_2` FOREIGN KEY (`nguoisua_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `yeucauhotro`
  ADD CONSTRAINT `yeucauhotro_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `yeucauhotro`
  ADD CONSTRAINT `yeucauhotro_ibfk_2` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON DELETE CASCADE ON UPDATE CASCADE;
