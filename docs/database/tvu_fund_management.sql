-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 12, 2026 lúc 11:46 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `tvu_fund_management`
--
CREATE DATABASE IF NOT EXISTS `tvu_fund_management` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tvu_fund_management`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `donvihoc`
--

CREATE TABLE `donvihoc` (
  `donvihoc_id` int(11) NOT NULL,
  `madonvi` varchar(20) NOT NULL,
  `tenkhoa` varchar(200) NOT NULL,
  `tennganh` varchar(200) DEFAULT NULL,
  `lop` varchar(100) DEFAULT NULL,
  `khoahoc` varchar(50) DEFAULT NULL,
  `mota` text DEFAULT NULL,
  `trangthai` enum('Hoat dong','Ngung hoat dong') DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `donvihoc`
--

INSERT INTO `donvihoc` (`donvihoc_id`, `madonvi`, `tenkhoa`, `tennganh`, `lop`, `khoahoc`, `mota`, `trangthai`, `ngaytao`) VALUES
(1, 'DV1780401284638421', 'Ban Giám Hiệu', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-06-02 11:54:44'),
(2, 'DV1780401284649485', 'Phòng Kế Hoạch Tài Chính', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-06-02 11:54:44'),
(3, 'DV1780401284657382', 'Văn phòng Quỹ Hỗ trợ', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-06-02 11:54:44'),
(4, 'DV1780401284665177', 'Khoa Công nghệ Thông tin', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-06-02 11:54:44'),
(5, 'DV1781224561834525', 'Doanh nghiep', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-06-12 00:36:01'),
(6, 'DV1781224822891449', 'DA22DCNA', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-06-12 00:40:22');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `giaodich`
--

CREATE TABLE `giaodich` (
  `giaodich_id` int(11) NOT NULL,
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
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `giaodich`
--

INSERT INTO `giaodich` (`giaodich_id`, `yeucauhotro_id`, `quy_id`, `nguoinhan_id`, `sotien`, `hinhthuc`, `magiaodich`, `chungtu`, `trangthai`, `doisoattrangthai`, `sotienthucte`, `doisoatboiid`, `doisoatluc`, `doisoatghichu`, `ghichu`, `nguoithuchien_id`, `ngaygiaodich`, `ngaycapnhat`) VALUES
(1, 1, 2, 4, 6000000.00, 'Chuyen khoan', NULL, 'uploads/documents/logo_1780410690471_872447363.png', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'đả giải ngân', 2, '2026-06-02 14:31:30', '2026-06-02 14:31:30'),
(3, NULL, 3, NULL, 20000000.00, 'Chuyen khoan', NULL, 'uploads/documents/logo_1780416637468_847559612.png', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'Duyệt khoản tài trợ #1', 2, '2026-06-02 16:10:37', '2026-06-02 16:10:37');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `guest_khoantaitro`
--

CREATE TABLE `guest_khoantaitro` (
  `guest_khoantaitro_id` int(11) NOT NULL,
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
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `guest_yeucauhotro`
--

CREATE TABLE `guest_yeucauhotro` (
  `guest_yeucauhotro_id` int(11) NOT NULL,
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
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `khoantaitro`
--

CREATE TABLE `khoantaitro` (
  `khoantaitro_id` int(11) NOT NULL,
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
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `khoantaitro`
--

INSERT INTO `khoantaitro` (`khoantaitro_id`, `nhataitro_id`, `quy_id`, `sotien`, `hinhthuc`, `magiaodich`, `ngaytaitro`, `chungtu`, `trangthai`, `ghichu`, `nguoixacnhan_id`, `ngayxacnhan`, `ngaytao`, `ngaycapnhat`) VALUES
(1, 1, 3, 20000000.00, 'Tien mat', NULL, '2026-06-02', 'uploads/documents/logo_1780416637468_847559612.png', 'Da nhan', 'Quyên góp từ Công ty Cổ phần Nhà tài trợ TVU', 1, '2026-06-02 16:12:21', '2026-06-02 15:55:42', '2026-06-02 16:12:21'),
(2, 3, 3, 20000000.00, 'Tien mat', NULL, '2026-06-12', NULL, 'Cho duyet', 'Quyên góp từ Điện máy xinh TV', NULL, NULL, '2026-06-12 00:37:38', '2026-06-12 00:37:38');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `loaiquy`
--

CREATE TABLE `loaiquy` (
  `loaiquy_id` int(11) NOT NULL,
  `maloai` varchar(50) NOT NULL,
  `tenloai` varchar(100) NOT NULL,
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `loaiquy`
--

INSERT INTO `loaiquy` (`loaiquy_id`, `maloai`, `tenloai`, `ngaytao`) VALUES
(1, 'Tu thien', 'Từ thiện', '2026-06-02 08:37:25'),
(2, 'Hoc bong', 'Học bổng', '2026-06-02 08:37:25'),
(3, 'Y te', 'Y tế', '2026-06-02 08:37:25'),
(4, 'Moi truong', 'Môi trường', '2026-06-02 08:37:25'),
(5, 'Khac', 'Khác', '2026-06-02 08:37:25'),
(6, 'Quy thi dua', 'Quỷ thi đua', '2026-06-02 11:59:11');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguoidung`
--

CREATE TABLE `nguoidung` (
  `nguoidung_id` int(11) NOT NULL,
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
  `taikhoannganhang_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `nguoidung`
--

INSERT INTO `nguoidung` (`nguoidung_id`, `email`, `matkhau`, `hoten`, `masodinhdanh`, `ngaysinh`, `gioitinh`, `sodienthoai`, `diachi`, `donvihoc_id`, `avatar`, `vaitro_id`, `loaitaikhoan`, `trangthai`, `ngaytao`, `ngaycapnhat`, `taikhoannganhang_id`) VALUES
(1, 'admin@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Nguyễn Văn Admin', 'ADMIN001', NULL, NULL, NULL, NULL, 1, NULL, 1, NULL, 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 11:54:44', NULL),
(2, 'ketoan@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Trần Thị Kế Toán', 'KT001', NULL, NULL, NULL, NULL, 2, NULL, 2, NULL, 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 11:54:44', NULL),
(3, 'canboquy@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Lê Văn Cán Bộ', 'CB001', NULL, NULL, NULL, NULL, 3, NULL, 3, NULL, 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 11:54:44', NULL),
(4, 'sinhvien@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Nguyễn Văn Sinh Viên', 'SV001', NULL, NULL, NULL, NULL, 4, NULL, 4, 'Sinh vien', 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 13:35:12', 4),
(5, 'nhataitro@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Công ty Cổ phần Nhà tài trợ TVU', 'NTT001', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'Nha tai tro', 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 12:50:47', NULL),
(6, 'dienmayxanh@gmail.com', '$2b$10$oRlqjqBdw3W5Um/hSsI9huELwoEjTT7HQw3AzPxqfEY3HyU.JO8Zy', 'Điện máy xinh TV', 'NTT1781224561828', NULL, NULL, '0782884717', NULL, 5, NULL, 4, 'Nha tai tro', 'Hoat dong', '2026-06-12 00:36:01', '2026-06-12 00:36:01', NULL),
(7, 'can@gmail.com', '$2b$10$98fgzJPfOLf7wu6kVuVkEelYl6wGXdzgairpUlyPpPeE1Gry0O.g2', 'Lê minh cần', '110122172', NULL, NULL, NULL, NULL, 6, NULL, 4, 'Sinh vien', 'Hoat dong', '2026-06-12 00:40:22', '2026-06-12 00:57:43', 8),
(8, 'trannhutthien012345@gmail.com', NULL, 'thiên nhựt', 'GG1781228341312', NULL, NULL, NULL, NULL, NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJxVSoZLkHbaHj8WQQ6GsObHn6yvmm8vQXbM4x44P-Cay05Lm3N=s96-c', 4, 'Sinh vien', 'Hoat dong', '2026-06-12 01:39:01', '2026-06-12 01:39:01', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nhataitro`
--

CREATE TABLE `nhataitro` (
  `nhataitro_id` int(11) NOT NULL,
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
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `nhataitro`
--

INSERT INTO `nhataitro` (`nhataitro_id`, `tennhataitro`, `loainhataitro`, `email`, `sodienthoai`, `diachi`, `website`, `mota`, `logo`, `nguoidung_id`, `trangthai`, `ngaytao`, `ngaycapnhat`) VALUES
(1, 'Công ty Cổ phần Nhà tài trợ TVU', 'To chuc', 'nhataitro@tvu.edu.vn', '0909999999', NULL, NULL, NULL, NULL, 5, 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 11:40:34'),
(2, 'Điện máy xinh TV', 'Ca nhan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Hoat dong', '2026-06-12 00:36:01', '2026-06-12 00:36:01'),
(3, 'Nhà tài trợ', 'Ca nhan', NULL, NULL, NULL, NULL, NULL, NULL, 6, 'Hoat dong', '2026-06-12 00:37:38', '2026-06-12 00:37:38');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nhatkyhethong`
--

CREATE TABLE `nhatkyhethong` (
  `nhatkyhethong_id` int(11) NOT NULL,
  `nguoidung_id` int(11) DEFAULT NULL,
  `hanhdong` varchar(100) NOT NULL,
  `loaidoituong` varchar(50) DEFAULT NULL,
  `doituong_id` int(11) DEFAULT NULL,
  `mota` text DEFAULT NULL,
  `dulieucu` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dulieucu`)),
  `dulieumoi` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dulieumoi`)),
  `ipaddress` varchar(45) DEFAULT NULL,
  `createdat` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `nhatkyhethong`
--

INSERT INTO `nhatkyhethong` (`nhatkyhethong_id`, `nguoidung_id`, `hanhdong`, `loaidoituong`, `doituong_id`, `mota`, `dulieucu`, `dulieumoi`, `ipaddress`, `createdat`) VALUES
(1, 3, 'DANG_NHAP', 'nguoidung', 3, 'Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-02 11:58:15'),
(2, 3, 'THEM_MOI_QUY', 'quy', 2, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Thêm mới quỹ hỗ trợ: Quỷ sinh viên xuất sắc', NULL, '{\"tenQuy\":\"Quỷ sinh viên xuất sắc\",\"loaiQuy\":\"Quy thi dua\",\"moTa\":\"trao tặng phần thưởng cho sinh viên có kết quả thi đua tốt\",\"hinhAnh\":\"uploads/avatars/fund/logo_1780403608636_272893710.png\",\"soTienToiThieu\":4000000,\"soTienToiDa\":6000000,\"soLuongChiTieu\":3,\"hanNopDon\":\"2026-10-08\",\"dieuKienTomTat\":\"sinh viên có bằng khen thi đua\",\"soDu\":20000000,\"trangThai\":\"Dang hoat dong\"}', '::1', '2026-06-02 12:40:01'),
(3, 3, 'CAP_NHAT_TRANG_THAI_NGUOI_DUNG', 'nguoidung', 5, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Thay đổi trạng thái tài khoản nhataitro@tvu.edu.vn sang \'HOAT_DONG\'', '{\"trangthai\":\"Hoat dong\"}', '{\"trangthai\":\"HOAT_DONG\"}', '::1', '2026-06-02 12:44:50'),
(4, 3, 'CAP_NHAT_TRANG_THAI_NGUOI_DUNG', 'nguoidung', 5, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Thay đổi trạng thái tài khoản nhataitro@tvu.edu.vn sang \'HOAT_DONG\'', '{\"trangthai\":\"\"}', '{\"trangthai\":\"HOAT_DONG\"}', '::1', '2026-06-02 12:45:34'),
(5, 3, 'CAP_NHAT_TRANG_THAI_NGUOI_DUNG', 'nguoidung', 4, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Thay đổi trạng thái tài khoản sinhvien@tvu.edu.vn sang \'HOAT_DONG\'', '{\"trangthai\":\"Hoat dong\"}', '{\"trangthai\":\"HOAT_DONG\"}', '::1', '2026-06-02 12:46:00'),
(6, 3, 'CAP_NHAT_TRANG_THAI_NGUOI_DUNG', 'nguoidung', 4, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Thay đổi trạng thái tài khoản sinhvien@tvu.edu.vn sang \'HOAT_DONG\'', '{\"trangthai\":\"\"}', '{\"trangthai\":\"HOAT_DONG\"}', '::1', '2026-06-02 12:47:29'),
(7, 3, 'CAP_NHAT_TRANG_THAI_NGUOI_DUNG', 'nguoidung', 5, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Thay đổi trạng thái tài khoản nhataitro@tvu.edu.vn sang \'HOAT_DONG\'', '{\"trangthai\":\"\"}', '{\"trangthai\":\"HOAT_DONG\"}', '::1', '2026-06-02 12:50:47'),
(8, 3, 'CAP_NHAT_TRANG_THAI_NGUOI_DUNG', 'nguoidung', 4, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Thay đổi trạng thái tài khoản sinhvien@tvu.edu.vn sang \'HOAT_DONG\'', '{\"trangthai\":\"\"}', '{\"trangthai\":\"HOAT_DONG\"}', '::1', '2026-06-02 12:51:17'),
(9, 3, 'DANG_XUAT', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Đăng xuất khỏi hệ thống', NULL, NULL, '::1', '2026-06-02 12:52:20'),
(10, 4, 'DANG_NHAP', 'nguoidung', 4, '[Sinh viên] Nguyễn Văn Sinh Viên: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-02 12:52:42'),
(11, 4, 'DANG_NHAP', 'nguoidung', 4, '[Sinh viên] Nguyễn Văn Sinh Viên: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-02 13:11:49'),
(12, 4, 'DANG_NHAP', 'nguoidung', 4, '[Sinh viên] Nguyễn Văn Sinh Viên: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-02 13:33:43'),
(13, 4, 'NOP_YEU_CAU_HO_TRO', 'yeucauhotro', 1, '[Sinh viên] Nguyễn Văn Sinh Viên: Nộp đơn xin hỗ trợ từ quỹ \'undefined\' với số tiền đề nghị: 6.000.000 VNĐ', NULL, '{\"nguoiDungId\":4,\"quyId\":2,\"lyDo\":\"đả đạt được thành tích xuất sắc trong quá trình thi đua cuộc thi nghiên cứu khoa học của sinh viên đả giải nhất\",\"soTienDeNghi\":6000000,\"taiLieuDinhKem\":\"uploads/documents/logo_1780407875152_887301976.png\"}', '::1', '2026-06-02 13:44:35'),
(14, 4, 'NOP_YEU_CAU_HO_TRO', 'yeucauhotro', 2, '[Sinh viên] Nguyễn Văn Sinh Viên: Nộp đơn xin hỗ trợ từ quỹ \'undefined\' với số tiền đề nghị: 6.000.000 VNĐ', NULL, '{\"nguoiDungId\":4,\"quyId\":2,\"lyDo\":\"đả đạt được thành tích xuất sắc trong quá trình thi đua cuộc thi nghiên cứu khoa học của sinh viên đả giải nhất\",\"soTienDeNghi\":6000000,\"taiLieuDinhKem\":\"uploads/documents/logo_1780408030864_637321269.png\"}', '::1', '2026-06-02 13:47:10'),
(15, 4, 'NOP_YEU_CAU_HO_TRO', 'yeucauhotro', 3, '[Sinh viên] Nguyễn Văn Sinh Viên: Nộp đơn xin hỗ trợ từ quỹ \'undefined\' với số tiền đề nghị: 6.000.000 VNĐ', NULL, '{\"nguoiDungId\":4,\"quyId\":2,\"lyDo\":\"đả đạt được thành tích xuất sắc trong quá trình thi đua cuộc thi nghiên cứu khoa học của sinh viên đả giải nhất\",\"soTienDeNghi\":6000000,\"taiLieuDinhKem\":\"uploads/documents/logo_1780408158782_6328942.png\"}', '::1', '2026-06-02 13:49:18'),
(16, 4, 'NOP_YEU_CAU_HO_TRO', 'yeucauhotro', 4, '[Sinh viên] Nguyễn Văn Sinh Viên: Nộp đơn xin hỗ trợ từ quỹ \'undefined\' với số tiền đề nghị: 6.000.000 VNĐ', NULL, '{\"nguoiDungId\":4,\"quyId\":2,\"lyDo\":\"đả đạt được thành tích xuất sắc trong quá trình thi đua cuộc thi nghiên cứu khoa học của sinh viên đả giải nhất\",\"soTienDeNghi\":6000000,\"taiLieuDinhKem\":\"uploads/documents/logo_1780408241313_977933567.png\"}', '::1', '2026-06-02 13:50:41'),
(17, 4, 'DANG_XUAT', 'nguoidung', 4, '[Sinh viên] Nguyễn Văn Sinh Viên: Đăng xuất khỏi hệ thống', NULL, NULL, '::1', '2026-06-02 13:51:29'),
(18, 3, 'DANG_NHAP', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-02 13:51:57'),
(19, 3, 'DUYET_YEU_CAU_HO_TRO_CAP_1', 'yeucauhotro', 1, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Duyệt đơn xin hỗ trợ ID 1 ở cấp 1 (Cán bộ Quỹ/Giáo vụ). Trạng thái đổi thành \'Chờ duyệt cấp 2\'', '{\"trangthai\":\"Cho duyet cap 1\"}', '{\"trangthai\":\"Cho duyet cap 2\"}', '::1', '2026-06-02 14:09:11'),
(20, 3, 'DANG_XUAT', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Đăng xuất khỏi hệ thống', NULL, NULL, '::1', '2026-06-02 14:09:30'),
(21, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-02 14:09:47'),
(22, 1, 'DUYET_YEU_CAU_HO_TRO_CAP_2', 'yeucauhotro', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Duyệt đơn xin hỗ trợ ID 1 ở cấp 2 (Admin). Trạng thái đổi thành \'Chờ duyệt cấp 3\'', '{\"trangthai\":\"Cho duyet cap 2\"}', '{\"trangthai\":\"Cho duyet cap 3\"}', '::1', '2026-06-02 14:26:25'),
(23, 1, 'DANG_XUAT', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng xuất khỏi hệ thống', NULL, NULL, '::1', '2026-06-02 14:27:01'),
(24, 2, 'DANG_NHAP', 'nguoidung', 2, '[Nhân viên hệ thống] Trần Thị Kế Toán: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-02 14:27:17'),
(25, 2, 'CAP_NHAT_YEU_CAU_HO_TRO', 'yeucauhotro', 1, '[Nhân viên hệ thống] Trần Thị Kế Toán: Phê duyệt cấp 3 và giải ngân thành công số tiền 6.000.000 VNĐ từ quỹ \'undefined\' cho đơn hỗ trợ ID 1', '{\"trangthai\":\"Cho duyet cap 3\"}', '{\"trangthai\":\"Da giai ngan\"}', '::1', '2026-06-02 14:31:30'),
(26, 2, 'DANG_XUAT', 'nguoidung', 2, '[Nhân viên hệ thống] Trần Thị Kế Toán: Đăng xuất khỏi hệ thống', NULL, NULL, '::1', '2026-06-02 14:32:27'),
(27, 5, 'DANG_NHAP', 'nguoidung', 5, '[Nhà tài trợ] Công ty Cổ phần Nhà tài trợ TVU: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-02 14:32:46'),
(28, 5, 'DANG_XUAT', 'nguoidung', 5, '[Nhà tài trợ] Công ty Cổ phần Nhà tài trợ TVU: Đăng xuất khỏi hệ thống', NULL, NULL, '::1', '2026-06-02 14:33:08'),
(29, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-02 14:33:35'),
(30, 1, 'CAP_NHAT_QUY', 'nguoidung', NULL, '[Nhân viên hệ thống] Nguyễn Văn Admin: Cập nhật ma trận phân quyền truy cập trang', '{\"landing_page\":{\"label\":\"Trang chủ\",\"path\":\"/\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"funds\":{\"label\":\"Danh mục quỹ\",\"path\":\"/funds\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"guidelines\":{\"label\":\"Hướng dẫn & Quy định\",\"path\":\"/guidelines\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"donors\":{\"label\":\"Vinh danh\",\"path\":\"/donors\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"profile\":{\"label\":\"Cá nhân\",\"path\":\"/profile\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"apply\":{\"label\":\"Tạo đơn\",\"path\":\"/apply\",\"admin\":false,\"canbo\":false,\"ketoan\":false,\"sinhvien\":true,\"nhataitro\":false},\"dashboard\":{\"label\":\"Trang tổng quan\",\"path\":\"/dashboard\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"users\":{\"label\":\"Quản lý người dùng\",\"path\":\"/users\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"xet_duyet\":{\"label\":\"Xét duyệt hồ sơ\",\"path\":\"/xet-duyet\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"quy\":{\"label\":\"Danh sách Quỹ\",\"path\":\"/quy\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nha_tai_tro\":{\"label\":\"Nhà tài trợ\",\"path\":\"/nha-tai-tro\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"sinh_vien_noi_bat\":{\"label\":\"Sinh viên nổi bật\",\"path\":\"/sinh-vien-noi-bat\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"tin_tuc\":{\"label\":\"Tin tức & Sự kiện\",\"path\":\"/tin-tuc\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"bao_cao\":{\"label\":\"Thống kê & Báo cáo\",\"path\":\"/bao-cao\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"khoan_tai_tro\":{\"label\":\"Khoản tài trợ\",\"path\":\"/khoan-tai-tro\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giao_dich\":{\"label\":\"Lịch sử giao dịch\",\"path\":\"/giao-dich\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giai_ngan\":{\"label\":\"Giải ngân hồ sơ\",\"path\":\"/giai-ngan\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"chung_tu\":{\"label\":\"Đối soát chứng từ\",\"path\":\"/chung-tu\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"phe_duyet\":{\"label\":\"Lịch sử phê duyệt\",\"path\":\"/phe-duyet\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"roles\":{\"label\":\"Hệ thống & Phân quyền\",\"path\":\"/roles\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false}}', '{\"landing_page\":{\"label\":\"Trang chủ\",\"path\":\"/\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"funds\":{\"label\":\"Danh mục quỹ\",\"path\":\"/funds\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"guidelines\":{\"label\":\"Hướng dẫn & Quy định\",\"path\":\"/guidelines\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"donors\":{\"label\":\"Vinh danh\",\"path\":\"/donors\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"profile\":{\"label\":\"Cá nhân\",\"path\":\"/profile\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"apply\":{\"label\":\"Tạo đơn\",\"path\":\"/apply\",\"admin\":false,\"canbo\":false,\"ketoan\":false,\"sinhvien\":true,\"nhataitro\":true},\"dashboard\":{\"label\":\"Trang tổng quan\",\"path\":\"/dashboard\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"users\":{\"label\":\"Quản lý người dùng\",\"path\":\"/users\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"xet_duyet\":{\"label\":\"Xét duyệt hồ sơ\",\"path\":\"/xet-duyet\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"quy\":{\"label\":\"Danh sách Quỹ\",\"path\":\"/quy\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nha_tai_tro\":{\"label\":\"Nhà tài trợ\",\"path\":\"/nha-tai-tro\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"sinh_vien_noi_bat\":{\"label\":\"Sinh viên nổi bật\",\"path\":\"/sinh-vien-noi-bat\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"tin_tuc\":{\"label\":\"Tin tức & Sự kiện\",\"path\":\"/tin-tuc\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"bao_cao\":{\"label\":\"Thống kê & Báo cáo\",\"path\":\"/bao-cao\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"khoan_tai_tro\":{\"label\":\"Khoản tài trợ\",\"path\":\"/khoan-tai-tro\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giao_dich\":{\"label\":\"Lịch sử giao dịch\",\"path\":\"/giao-dich\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giai_ngan\":{\"label\":\"Giải ngân hồ sơ\",\"path\":\"/giai-ngan\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"chung_tu\":{\"label\":\"Đối soát chứng từ\",\"path\":\"/chung-tu\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"phe_duyet\":{\"label\":\"Lịch sử phê duyệt\",\"path\":\"/phe-duyet\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"roles\":{\"label\":\"Hệ thống & Phân quyền\",\"path\":\"/roles\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false}}', '::1', '2026-06-02 14:33:55'),
(31, 1, 'DANG_XUAT', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng xuất khỏi hệ thống', NULL, NULL, '::1', '2026-06-02 14:34:05'),
(32, 5, 'DANG_NHAP', 'nguoidung', 5, '[Nhà tài trợ] Công ty Cổ phần Nhà tài trợ TVU: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-02 14:34:30'),
(33, 5, 'DANG_XUAT', 'nguoidung', 5, '[Nhà tài trợ] Công ty Cổ phần Nhà tài trợ TVU: Đăng xuất khỏi hệ thống', NULL, NULL, '::1', '2026-06-02 14:34:53'),
(34, 3, 'DANG_NHAP', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-02 14:35:20'),
(35, 3, 'THEM_MOI_QUY', 'quy', 3, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Thêm mới quỹ hỗ trợ: quỷ từ thiện sinh viên khuyết tật', NULL, '{\"tenQuy\":\"quỷ từ thiện sinh viên khuyết tật\",\"loaiQuy\":\"Tu thien\",\"moTa\":\"hổ trợ học phí cho sinh viên hộ nghèo khuyết tật\",\"hinhAnh\":\"uploads/avatars/fund/logo_1780410968550_276808347.png\",\"soTienToiThieu\":5000000,\"soTienToiDa\":10000000,\"soLuongChiTieu\":10,\"hanNopDon\":\"2027-06-02\",\"dieuKienTomTat\":\"hổ trợ sinh viên khó khăn mắt bệnh bẩm sinh được đến trường\",\"soDu\":0,\"trangThai\":\"Dang hoat dong\"}', '::1', '2026-06-02 14:37:10'),
(36, 3, 'DANG_XUAT', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Đăng xuất khỏi hệ thống', NULL, NULL, '::1', '2026-06-02 14:37:16'),
(37, 5, 'DANG_NHAP', 'nguoidung', 5, '[Nhà tài trợ] Công ty Cổ phần Nhà tài trợ TVU: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-02 14:37:39'),
(38, 5, 'DANG_XUAT', 'nguoidung', 5, '[Nhà tài trợ] Công ty Cổ phần Nhà tài trợ TVU: Đăng xuất khỏi hệ thống', NULL, NULL, '::1', '2026-06-02 15:57:02'),
(39, 2, 'DANG_NHAP', 'nguoidung', 2, '[Nhân viên hệ thống] Trần Thị Kế Toán: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-02 15:57:20'),
(40, 2, 'DUYET_KHOAN_TAI_TRO', 'khoantaitro', 1, '[Nhân viên hệ thống] Trần Thị Kế Toán: Duyệt khoản tài trợ ID 1 số tiền 20000000.00 VNĐ của nhà tài trợ \'Công ty Cổ phần Nhà tài trợ TVU\' vào quỹ \'quỷ từ thiện sinh viên khuyết tật\'', '{\"trangthai\":\"Cho duyet\"}', '{\"trangthai\":\"Da duyet\"}', '::1', '2026-06-02 16:10:37'),
(41, 2, 'DANG_XUAT', 'nguoidung', 2, '[Nhân viên hệ thống] Trần Thị Kế Toán: Đăng xuất khỏi hệ thống', NULL, NULL, '::1', '2026-06-02 16:11:41'),
(42, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-02 16:12:02'),
(43, 1, 'XAC_NHAN_KHOAN_TAI_TRO', 'khoantaitro', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Xác nhận đã nhận tiền đóng góp số tiền 20000000.00 VNĐ cho khoản tài trợ ID 1', '{\"trangthai\":\"Da duyet\"}', '{\"trangthai\":\"Da nhan\"}', '::1', '2026-06-02 16:12:21'),
(44, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-03 04:14:04'),
(45, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng nhập hệ thống thành công', NULL, NULL, '::1', '2026-06-03 05:15:42'),
(46, 1, 'CAP_NHAT_TRANG_THAI_QUY', 'quy', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Thay đổi trạng thái quỹ Quỹ học bổng vược khó 2026 từ \'Dang hoat dong\' sang \'Tam dung\'', '{\"trangThai\":\"Dang hoat dong\"}', '{\"trangThai\":\"Tam dung\"}', '::1', '2026-06-03 05:27:36'),
(47, 1, 'CAP_NHAT_TRANG_THAI_QUY', 'quy', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Thay đổi trạng thái quỹ Quỹ học bổng vược khó 2026 từ \'Tam dung\' sang \'Dang hoat dong\'', '{\"trangThai\":\"Tam dung\"}', '{\"trangThai\":\"Dang hoat dong\"}', '::1', '2026-06-03 05:27:58'),
(48, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-12 00:31:04'),
(49, 1, 'CAP_NHAT_QUY', 'nguoidung', NULL, '[Nhân viên hệ thống] Nguyễn Văn Admin: Cập nhật ma trận phân quyền truy cập trang', '{\"landing_page\":{\"label\":\"Trang chủ\",\"path\":\"/\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"funds\":{\"label\":\"Danh mục quỹ\",\"path\":\"/funds\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"guidelines\":{\"label\":\"Hướng dẫn & Quy định\",\"path\":\"/guidelines\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"donors\":{\"label\":\"Vinh danh\",\"path\":\"/donors\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"profile\":{\"label\":\"Cá nhân\",\"path\":\"/profile\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"apply\":{\"label\":\"Tạo đơn\",\"path\":\"/apply\",\"admin\":false,\"canbo\":false,\"ketoan\":false,\"sinhvien\":true,\"nhataitro\":true},\"dashboard\":{\"label\":\"Trang tổng quan\",\"path\":\"/dashboard\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"users\":{\"label\":\"Quản lý người dùng\",\"path\":\"/users\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"xet_duyet\":{\"label\":\"Xét duyệt hồ sơ\",\"path\":\"/xet-duyet\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"quy\":{\"label\":\"Danh sách Quỹ\",\"path\":\"/quy\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nha_tai_tro\":{\"label\":\"Nhà tài trợ\",\"path\":\"/nha-tai-tro\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"sinh_vien_noi_bat\":{\"label\":\"Sinh viên nổi bật\",\"path\":\"/sinh-vien-noi-bat\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"tin_tuc\":{\"label\":\"Tin tức & Sự kiện\",\"path\":\"/tin-tuc\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"bao_cao\":{\"label\":\"Thống kê & Báo cáo\",\"path\":\"/bao-cao\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"khoan_tai_tro\":{\"label\":\"Khoản tài trợ\",\"path\":\"/khoan-tai-tro\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giao_dich\":{\"label\":\"Lịch sử giao dịch\",\"path\":\"/giao-dich\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giai_ngan\":{\"label\":\"Giải ngân hồ sơ\",\"path\":\"/giai-ngan\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"chung_tu\":{\"label\":\"Đối soát chứng từ\",\"path\":\"/chung-tu\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"phe_duyet\":{\"label\":\"Lịch sử phê duyệt\",\"path\":\"/phe-duyet\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"roles\":{\"label\":\"Hệ thống & Phân quyền\",\"path\":\"/roles\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nhat_ky\":{\"label\":\"Nhật ký hệ thống\",\"path\":\"/nhat-ky\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false}}', '{\"landing_page\":{\"label\":\"Trang chủ\",\"path\":\"/\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"funds\":{\"label\":\"Danh mục quỹ\",\"path\":\"/funds\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"guidelines\":{\"label\":\"Hướng dẫn & Quy định\",\"path\":\"/guidelines\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"donors\":{\"label\":\"Vinh danh\",\"path\":\"/donors\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"profile\":{\"label\":\"Cá nhân\",\"path\":\"/profile\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"apply\":{\"label\":\"Tạo đơn\",\"path\":\"/apply\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":true,\"nhataitro\":true},\"dashboard\":{\"label\":\"Trang tổng quan\",\"path\":\"/dashboard\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"users\":{\"label\":\"Quản lý người dùng\",\"path\":\"/users\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"xet_duyet\":{\"label\":\"Xét duyệt hồ sơ\",\"path\":\"/xet-duyet\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"quy\":{\"label\":\"Danh sách Quỹ\",\"path\":\"/quy\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nha_tai_tro\":{\"label\":\"Nhà tài trợ\",\"path\":\"/nha-tai-tro\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"sinh_vien_noi_bat\":{\"label\":\"Sinh viên nổi bật\",\"path\":\"/sinh-vien-noi-bat\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"tin_tuc\":{\"label\":\"Tin tức & Sự kiện\",\"path\":\"/tin-tuc\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"bao_cao\":{\"label\":\"Thống kê & Báo cáo\",\"path\":\"/bao-cao\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"khoan_tai_tro\":{\"label\":\"Khoản tài trợ\",\"path\":\"/khoan-tai-tro\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giao_dich\":{\"label\":\"Lịch sử giao dịch\",\"path\":\"/giao-dich\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giai_ngan\":{\"label\":\"Giải ngân hồ sơ\",\"path\":\"/giai-ngan\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"chung_tu\":{\"label\":\"Đối soát chứng từ\",\"path\":\"/chung-tu\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"phe_duyet\":{\"label\":\"Lịch sử phê duyệt\",\"path\":\"/phe-duyet\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"roles\":{\"label\":\"Hệ thống & Phân quyền\",\"path\":\"/roles\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nhat_ky\":{\"label\":\"Nhật ký hệ thống\",\"path\":\"/nhat-ky\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false}}', '127.0.0.1', '2026-06-12 00:32:55'),
(50, 1, 'CAP_NHAT_QUY', 'nguoidung', NULL, '[Nhân viên hệ thống] Nguyễn Văn Admin: Cập nhật ma trận phân quyền truy cập trang', '{\"landing_page\":{\"label\":\"Trang chủ\",\"path\":\"/\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"funds\":{\"label\":\"Danh mục quỹ\",\"path\":\"/funds\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"guidelines\":{\"label\":\"Hướng dẫn & Quy định\",\"path\":\"/guidelines\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"donors\":{\"label\":\"Vinh danh\",\"path\":\"/donors\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"profile\":{\"label\":\"Cá nhân\",\"path\":\"/profile\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"apply\":{\"label\":\"Tạo đơn\",\"path\":\"/apply\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":true,\"nhataitro\":true},\"dashboard\":{\"label\":\"Trang tổng quan\",\"path\":\"/dashboard\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"users\":{\"label\":\"Quản lý người dùng\",\"path\":\"/users\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"xet_duyet\":{\"label\":\"Xét duyệt hồ sơ\",\"path\":\"/xet-duyet\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"quy\":{\"label\":\"Danh sách Quỹ\",\"path\":\"/quy\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nha_tai_tro\":{\"label\":\"Nhà tài trợ\",\"path\":\"/nha-tai-tro\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"sinh_vien_noi_bat\":{\"label\":\"Sinh viên nổi bật\",\"path\":\"/sinh-vien-noi-bat\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"tin_tuc\":{\"label\":\"Tin tức & Sự kiện\",\"path\":\"/tin-tuc\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"bao_cao\":{\"label\":\"Thống kê & Báo cáo\",\"path\":\"/bao-cao\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"khoan_tai_tro\":{\"label\":\"Khoản tài trợ\",\"path\":\"/khoan-tai-tro\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giao_dich\":{\"label\":\"Lịch sử giao dịch\",\"path\":\"/giao-dich\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giai_ngan\":{\"label\":\"Giải ngân hồ sơ\",\"path\":\"/giai-ngan\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"chung_tu\":{\"label\":\"Đối soát chứng từ\",\"path\":\"/chung-tu\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"phe_duyet\":{\"label\":\"Lịch sử phê duyệt\",\"path\":\"/phe-duyet\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"roles\":{\"label\":\"Hệ thống & Phân quyền\",\"path\":\"/roles\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nhat_ky\":{\"label\":\"Nhật ký hệ thống\",\"path\":\"/nhat-ky\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false}}', '{\"landing_page\":{\"label\":\"Trang chủ\",\"path\":\"/\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"funds\":{\"label\":\"Danh mục quỹ\",\"path\":\"/funds\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"guidelines\":{\"label\":\"Hướng dẫn & Quy định\",\"path\":\"/guidelines\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"donors\":{\"label\":\"Vinh danh\",\"path\":\"/donors\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"profile\":{\"label\":\"Cá nhân\",\"path\":\"/profile\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"apply\":{\"label\":\"Tạo đơn\",\"path\":\"/apply\",\"admin\":false,\"canbo\":false,\"ketoan\":false,\"sinhvien\":true,\"nhataitro\":true},\"dashboard\":{\"label\":\"Trang tổng quan\",\"path\":\"/dashboard\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"users\":{\"label\":\"Quản lý người dùng\",\"path\":\"/users\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"xet_duyet\":{\"label\":\"Xét duyệt hồ sơ\",\"path\":\"/xet-duyet\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"quy\":{\"label\":\"Danh sách Quỹ\",\"path\":\"/quy\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nha_tai_tro\":{\"label\":\"Nhà tài trợ\",\"path\":\"/nha-tai-tro\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"sinh_vien_noi_bat\":{\"label\":\"Sinh viên nổi bật\",\"path\":\"/sinh-vien-noi-bat\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"tin_tuc\":{\"label\":\"Tin tức & Sự kiện\",\"path\":\"/tin-tuc\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"bao_cao\":{\"label\":\"Thống kê & Báo cáo\",\"path\":\"/bao-cao\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"khoan_tai_tro\":{\"label\":\"Khoản tài trợ\",\"path\":\"/khoan-tai-tro\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giao_dich\":{\"label\":\"Lịch sử giao dịch\",\"path\":\"/giao-dich\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giai_ngan\":{\"label\":\"Giải ngân hồ sơ\",\"path\":\"/giai-ngan\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"chung_tu\":{\"label\":\"Đối soát chứng từ\",\"path\":\"/chung-tu\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"phe_duyet\":{\"label\":\"Lịch sử phê duyệt\",\"path\":\"/phe-duyet\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"roles\":{\"label\":\"Hệ thống & Phân quyền\",\"path\":\"/roles\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nhat_ky\":{\"label\":\"Nhật ký hệ thống\",\"path\":\"/nhat-ky\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false}}', '127.0.0.1', '2026-06-12 00:33:10'),
(51, 1, 'DANG_XUAT', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-12 00:35:06'),
(52, 6, 'DANG_XUAT', 'nguoidung', 6, '[Nhà tài trợ] Điện máy xinh TV: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-12 00:37:49'),
(53, 3, 'DANG_NHAP', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-12 00:38:30'),
(54, 3, 'DANG_XUAT', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-12 00:39:38'),
(55, 7, 'NOP_YEU_CAU_HO_TRO', 'yeucauhotro', 5, '[Sinh viên] Lê minh cần: Nộp đơn xin hỗ trợ từ quỹ \'Quỷ sinh viên xuất sắc\' với số tiền đề nghị: 5.000.000 VNĐ', NULL, '{\"nguoiDungId\":7,\"quyId\":2,\"lyDo\":\"**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**\\n**Độc lập – Tự do – Hạnh phúc**\\n***\\n\\nTrà Vinh, ngày …… tháng …… năm ……\\n\\n**ĐƠN XIN HỖ TRỢ TỪ QUỸ \\\"QUỸ SINH VIÊN XUẤT SẮC\\\"**\\n\\n**Kính gửi:** Ban Giám hiệu Trường Đại học Trà Vinh;\\nKính gửi: Ban Quản lý Quỹ \\\"Quỹ sinh viên xuất sắc\\\".\\n\\nTôi tên là: [Họ và tên]\\nMã số sinh viên: [MSSV]\\nLớp: [Lớp]\\nKhoa: [Khoa]\\nSố điện thoại liên hệ: [Số điện thoại]\\n\\nTôi viết đơn này với lòng kính trọng và mong muốn trình bày hoàn cảnh của mình để được Ban Giám hiệu và Ban Quản lý Quỹ xem xét hỗ trợ từ Quỹ \\\"Quỹ sinh viên xuất sắc\\\".\\n\\nGia đình tôi hiện đang gặp nhiều khó khăn về kinh tế. Nguồn thu nhập chính của gia đình không ổn định, chỉ đủ trang trải các chi phí sinh hoạt thiết yếu hàng ngày, khiến việc chi trả học phí và các khoản phí sinh hoạt, học tập khác của tôi trở thành một gánh nặng không nhỏ. Dù vậy, với khao khát được học tập và vươn lên, tôi luôn cố gắng nỗ lực hết mình trong mọi hoạt động học tập và rèn luyện tại trường.\\n\\nTrong suốt quá trình học tập tại Trường Đại học Trà Vinh, tôi luôn ý thức được tầm quan trọng của việc học và không ngừng phấn đấu để đạt được kết quả tốt nhất. Nhờ sự cố gắng không ngừng nghỉ, tôi đã đạt được nhiều thành tích cao trong học tập và rèn luyện, minh chứng bằng các Giấy khen thi đua mà nhà trường đã trao tặng. Những Giấy khen này không chỉ là niềm tự hào của bản thân mà còn là động lực lớn lao giúp tôi vượt qua khó khăn.\\n\\nTôi được biết Quỹ \\\"Quỹ sinh viên xuất sắc\\\" được thành lập nhằm trao tặng phần thưởng và hỗ trợ cho những sinh viên có kết quả thi đua tốt và đạt bằng khen thi đua. Nhận thấy bản thân đáp ứng các điều kiện của Quỹ, và với hoàn cảnh khó khăn hiện tại, tôi kính mong nhận được sự quan tâm, hỗ trợ từ Quỹ để có thêm điều kiện tiếp tục con đường học vấn, giảm bớt gánh nặng tài chính cho gia đình, và chuyên tâm hơn vào việc học tập, rèn luyện.\\n\\nNếu được Quỹ xem xét và hỗ trợ, tôi xin cam kết sẽ sử dụng nguồn hỗ trợ một cách hiệu quả, đúng mục đích, và tiếp tục nỗ lực không ngừng để giữ vững thành tích học tập, rèn luyện, xứng đáng với sự tin tưởng của Quý Ban, đóng góp vào sự phát triển của nhà trường và xã hội.\\n\\nTôi xin chân thành cảm ơn Ban Giám hiệu Trường Đại học Trà Vinh và Ban Quản lý Quỹ \\\"Quỹ sinh viên xuất sắc\\\" đã dành thời gian xem xét lá đơn này.\\n\\nKính mong nhận được sự quan tâm và giúp đỡ của Quý Ban.\\n\\nTrân trọng kính chào!\\n\\n**Người làm đơn**\\n(Ký và ghi rõ họ tên)\\n\\n[Họ và tên]\",\"soTienDeNghi\":5000000,\"taiLieuDinhKem\":\"uploads/documents/logo_1781226310050_283300664.png\"}', '127.0.0.1', '2026-06-12 01:05:10'),
(56, 7, 'DANG_XUAT', 'nguoidung', 7, '[Sinh viên] Lê minh cần: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-12 01:07:16'),
(57, 3, 'DANG_NHAP', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-12 01:07:36'),
(58, 3, 'DANG_XUAT', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-12 01:18:40'),
(59, 2, 'DANG_NHAP', 'nguoidung', 2, '[Nhân viên hệ thống] Trần Thị Kế Toán: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-12 01:18:58'),
(60, 2, 'DANG_XUAT', 'nguoidung', 2, '[Nhân viên hệ thống] Trần Thị Kế Toán: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-12 01:26:31'),
(61, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-12 01:26:51'),
(62, 1, 'DANG_XUAT', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-12 01:28:13'),
(63, 4, 'DANG_NHAP', 'nguoidung', 4, '[Sinh viên] Nguyễn Văn Sinh Viên: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-12 01:29:01'),
(64, 4, 'DANG_XUAT', 'nguoidung', 4, '[Sinh viên] Nguyễn Văn Sinh Viên: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-12 01:30:35'),
(65, 4, 'DANG_NHAP', 'nguoidung', 4, '[Sinh viên] Nguyễn Văn Sinh Viên: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-12 01:37:41'),
(66, 4, 'DANG_XUAT', 'nguoidung', 4, '[Sinh viên] Nguyễn Văn Sinh Viên: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-12 01:38:49'),
(67, 8, 'DANG_NHAP', 'nguoidung', 8, '[Sinh viên] thiên nhựt: Đăng nhập hệ thống qua Google OAuth', NULL, NULL, '127.0.0.1', '2026-06-12 01:39:01'),
(68, 8, 'DANG_XUAT', 'nguoidung', 8, '[Sinh viên] thiên nhựt: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-12 01:41:12'),
(69, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-12 01:41:27'),
(70, 1, 'CAP_NHAT_QUY', 'nguoidung', NULL, '[Nhân viên hệ thống] Nguyễn Văn Admin: Cập nhật ma trận phân quyền truy cập trang', '{\"landing_page\":{\"label\":\"Trang chủ\",\"path\":\"/\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"funds\":{\"label\":\"Danh mục quỹ\",\"path\":\"/funds\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"guidelines\":{\"label\":\"Hướng dẫn & Quy định\",\"path\":\"/guidelines\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"donors\":{\"label\":\"Vinh danh\",\"path\":\"/donors\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"profile\":{\"label\":\"Cá nhân\",\"path\":\"/profile\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"apply\":{\"label\":\"Tạo đơn\",\"path\":\"/apply\",\"admin\":false,\"canbo\":false,\"ketoan\":false,\"sinhvien\":true,\"nhataitro\":true},\"dashboard\":{\"label\":\"Trang tổng quan\",\"path\":\"/dashboard\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"users\":{\"label\":\"Quản lý người dùng\",\"path\":\"/users\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"xet_duyet\":{\"label\":\"Xét duyệt hồ sơ\",\"path\":\"/xet-duyet\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"quy\":{\"label\":\"Danh sách Quỹ\",\"path\":\"/quy\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nha_tai_tro\":{\"label\":\"Nhà tài trợ\",\"path\":\"/nha-tai-tro\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"sinh_vien_noi_bat\":{\"label\":\"Sinh viên nổi bật\",\"path\":\"/sinh-vien-noi-bat\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"tin_tuc\":{\"label\":\"Tin tức & Sự kiện\",\"path\":\"/tin-tuc\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"bao_cao\":{\"label\":\"Thống kê & Báo cáo\",\"path\":\"/bao-cao\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"khoan_tai_tro\":{\"label\":\"Khoản tài trợ\",\"path\":\"/khoan-tai-tro\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giao_dich\":{\"label\":\"Lịch sử giao dịch\",\"path\":\"/giao-dich\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giai_ngan\":{\"label\":\"Giải ngân hồ sơ\",\"path\":\"/giai-ngan\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"chung_tu\":{\"label\":\"Đối soát chứng từ\",\"path\":\"/chung-tu\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"phe_duyet\":{\"label\":\"Lịch sử phê duyệt\",\"path\":\"/phe-duyet\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"roles\":{\"label\":\"Hệ thống & Phân quyền\",\"path\":\"/roles\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nhat_ky\":{\"label\":\"Nhật ký hệ thống\",\"path\":\"/nhat-ky\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false}}', '{\"landing_page\":{\"label\":\"Trang chủ\",\"path\":\"/\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"funds\":{\"label\":\"Danh mục quỹ\",\"path\":\"/funds\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"guidelines\":{\"label\":\"Hướng dẫn & Quy định\",\"path\":\"/guidelines\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"donors\":{\"label\":\"Vinh danh\",\"path\":\"/donors\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"profile\":{\"label\":\"Cá nhân\",\"path\":\"/profile\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"apply\":{\"label\":\"Tạo đơn\",\"path\":\"/apply\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":true,\"nhataitro\":true},\"dashboard\":{\"label\":\"Trang tổng quan\",\"path\":\"/dashboard\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"users\":{\"label\":\"Quản lý người dùng\",\"path\":\"/users\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"xet_duyet\":{\"label\":\"Xét duyệt hồ sơ\",\"path\":\"/xet-duyet\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"quy\":{\"label\":\"Danh sách Quỹ\",\"path\":\"/quy\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nha_tai_tro\":{\"label\":\"Nhà tài trợ\",\"path\":\"/nha-tai-tro\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"sinh_vien_noi_bat\":{\"label\":\"Sinh viên nổi bật\",\"path\":\"/sinh-vien-noi-bat\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"tin_tuc\":{\"label\":\"Tin tức & Sự kiện\",\"path\":\"/tin-tuc\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"bao_cao\":{\"label\":\"Thống kê & Báo cáo\",\"path\":\"/bao-cao\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"khoan_tai_tro\":{\"label\":\"Khoản tài trợ\",\"path\":\"/khoan-tai-tro\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giao_dich\":{\"label\":\"Lịch sử giao dịch\",\"path\":\"/giao-dich\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giai_ngan\":{\"label\":\"Giải ngân hồ sơ\",\"path\":\"/giai-ngan\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"chung_tu\":{\"label\":\"Đối soát chứng từ\",\"path\":\"/chung-tu\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"phe_duyet\":{\"label\":\"Lịch sử phê duyệt\",\"path\":\"/phe-duyet\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"roles\":{\"label\":\"Hệ thống & Phân quyền\",\"path\":\"/roles\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nhat_ky\":{\"label\":\"Nhật ký hệ thống\",\"path\":\"/nhat-ky\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false}}', '127.0.0.1', '2026-06-12 01:41:52'),
(71, 1, 'DANG_XUAT', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-12 01:42:11'),
(72, 3, 'DANG_NHAP', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-12 01:42:35'),
(73, 3, 'DUYET_YEU_CAU_HO_TRO_CAP_1', 'yeucauhotro', 5, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Duyệt đơn xin hỗ trợ ID 5 ở cấp 1 (Cán bộ Quỹ/Giáo vụ). Trạng thái đổi thành \'Chờ duyệt cấp 2\'', '{\"trangthai\":\"Cho duyet cap 1\"}', '{\"trangthai\":\"Cho duyet cap 2\"}', '127.0.0.1', '2026-06-12 01:42:54'),
(74, 3, 'DANG_XUAT', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-12 01:42:59'),
(75, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-12 01:43:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `pheduyet`
--

CREATE TABLE `pheduyet` (
  `pheduyet_id` int(11) NOT NULL,
  `yeucauhotro_id` int(11) NOT NULL,
  `capduyet` tinyint(4) NOT NULL,
  `nguoiduyet_id` int(11) DEFAULT NULL,
  `ketqua` enum('Cho duyet','Duyet','Da duyet','Tu choi') NOT NULL DEFAULT 'Cho duyet',
  `lydo` text DEFAULT NULL,
  `ghichu` text DEFAULT NULL,
  `ngayduyet` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `pheduyet`
--

INSERT INTO `pheduyet` (`pheduyet_id`, `yeucauhotro_id`, `capduyet`, `nguoiduyet_id`, `ketqua`, `lydo`, `ghichu`, `ngayduyet`) VALUES
(10, 1, 1, 3, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-02 14:09:11'),
(11, 1, 2, 1, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-02 14:26:25'),
(12, 1, 3, 2, 'Da duyet', NULL, 'đả giải ngân', '2026-06-02 14:31:30'),
(13, 5, 1, 3, 'Da duyet', NULL, 'đúng yêu cầu', '2026-06-12 01:42:54'),
(14, 5, 2, NULL, 'Cho duyet', NULL, NULL, '2026-06-12 01:05:10'),
(15, 5, 3, NULL, 'Cho duyet', NULL, NULL, '2026-06-12 01:05:10');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `quy`
--

CREATE TABLE `quy` (
  `quy_id` int(11) NOT NULL,
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
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `quy`
--

INSERT INTO `quy` (`quy_id`, `tenquy`, `loaiquy_id`, `mota`, `hinhanh`, `sotienmuctieu`, `sodu`, `sotienhotrotoida`, `soluonghotrotoida`, `dieukienhotro`, `ngaybatdau`, `ngayketthuc`, `trangthai`, `nguoitao_id`, `ngaytao`, `ngaycapnhat`) VALUES
(1, 'Quỹ học bổng vược khó 2026', 2, 'Quỷ học bổng cho những sinh viên khó khăn nhưng có thành tích học xuất sắc', 'uploads/avatars/fund/khuonVienTruong_1780401893979_441709797.png', 5000000.00, 20000000.00, 10000000.00, 4, 'có sổ hộ nghèo, có học lức trên 3.0', NULL, '2026-09-30', 'Dang hoat dong', NULL, '2026-06-02 12:06:46', '2026-06-03 05:27:58'),
(2, 'Quỷ sinh viên xuất sắc', 6, 'trao tặng phần thưởng cho sinh viên có kết quả thi đua tốt', 'uploads/avatars/fund/logo_1780403608636_272893710.png', 4000000.00, 14000000.00, 6000000.00, 3, 'sinh viên có bằng khen thi đua', NULL, '2026-10-08', 'Dang hoat dong', NULL, '2026-06-02 12:40:01', '2026-06-02 14:31:30'),
(3, 'quỷ từ thiện sinh viên khuyết tật', 1, 'hổ trợ học phí cho sinh viên hộ nghèo khuyết tật', 'uploads/avatars/fund/logo_1780410968550_276808347.png', 5000000.00, 20000000.00, 10000000.00, 10, 'hổ trợ sinh viên khó khăn mắt bệnh bẩm sinh được đến trường', NULL, '2027-06-02', 'Dang hoat dong', NULL, '2026-06-02 14:37:10', '2026-06-02 16:10:37');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sinhviennoibat`
--

CREATE TABLE `sinhviennoibat` (
  `sinhviennoibat_id` int(11) NOT NULL,
  `nguoidung_id` int(11) DEFAULT NULL,
  `hoten` varchar(100) NOT NULL,
  `khoaphong` varchar(100) DEFAULT NULL,
  `namhoc` varchar(20) DEFAULT NULL,
  `hinhanh` varchar(255) DEFAULT NULL,
  `thanhtich` text DEFAULT NULL,
  `thutu` int(11) DEFAULT 0,
  `trangthai` enum('Hien thi','An') DEFAULT 'Hien thi',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sinhviennoibat`
--

INSERT INTO `sinhviennoibat` (`sinhviennoibat_id`, `nguoidung_id`, `hoten`, `khoaphong`, `namhoc`, `hinhanh`, `thanhtich`, `thutu`, `trangthai`, `ngaytao`, `ngaycapnhat`) VALUES
(1, NULL, 'Nguyễn Văn Sinh Viên', 'Khoa Công nghệ Thông tin', '2026-2027', 'uploads/avatars/students/logo_1781224730118_15269930.png', 'Nhận hỗ trợ từ TVU Fund và đạt thành tích tốt trong học tập.', 0, 'Hien thi', '2026-06-02 14:31:30', '2026-06-12 00:38:52');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `taikhoannganhang`
--

CREATE TABLE `taikhoannganhang` (
  `taikhoannganhang_id` int(11) NOT NULL,
  `quy_id` int(11) DEFAULT NULL,
  `sotaikhoan` varchar(50) NOT NULL,
  `nganhang` varchar(100) NOT NULL,
  `chinhanh` varchar(100) DEFAULT NULL,
  `chutaikhoan` varchar(100) NOT NULL,
  `trangthai` enum('Hoat dong','Khoa') DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `taikhoannganhang`
--

INSERT INTO `taikhoannganhang` (`taikhoannganhang_id`, `quy_id`, `sotaikhoan`, `nganhang`, `chinhanh`, `chutaikhoan`, `trangthai`, `ngaytao`, `ngaycapnhat`) VALUES
(4, NULL, '0743836850', 'BIDV', NULL, 'TRAN NHUT THIEN', 'Hoat dong', '2026-06-02 13:35:12', '2026-06-02 13:35:12'),
(5, 1, '1000000001', 'Vietcombank', 'Tra Vinh', 'QUY HOC BONG VUOT KHO TVU', 'Hoat dong', '2026-06-02 14:48:38', '2026-06-02 14:48:38'),
(6, 2, '1000000002', 'Vietcombank', 'Tra Vinh', 'QUY SINH VIEN XUAT SAC TVU', 'Hoat dong', '2026-06-02 14:48:38', '2026-06-02 14:48:38'),
(7, 3, '1000000003', 'Vietcombank', 'Tra Vinh', 'QUY SINH VIEN KHUYET TAT TVU', 'Hoat dong', '2026-06-02 14:48:38', '2026-06-02 14:48:38'),
(8, NULL, '0743836850', 'BIDV', NULL, 'LE MINH CAN', 'Hoat dong', '2026-06-12 00:57:43', '2026-06-12 00:57:43');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `vaitro`
--

CREATE TABLE `vaitro` (
  `vaitro_id` int(11) NOT NULL,
  `tenvaitro` varchar(50) NOT NULL,
  `mota` text DEFAULT NULL,
  `trangthai` enum('Hoat dong','Tam dung') DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `vaitro`
--

INSERT INTO `vaitro` (`vaitro_id`, `tenvaitro`, `mota`, `trangthai`, `ngaytao`, `ngaycapnhat`) VALUES
(1, 'admin', 'Quản trị viên hệ thống', 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 11:40:34'),
(2, 'ketoan', 'Bộ phận tài chính kế toán', 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 11:40:34'),
(3, 'canboquy', 'Cán bộ quản lý Quỹ', 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 11:40:34'),
(4, 'sinhvien', 'Người dùng (Sinh viên, Nhà tài trợ)', 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 11:40:34');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `yeucauhotro`
--

CREATE TABLE `yeucauhotro` (
  `yeucauhotro_id` int(11) NOT NULL,
  `nguoidung_id` int(11) NOT NULL,
  `quy_id` int(11) NOT NULL,
  `lydo` text NOT NULL,
  `sotiendenghi` decimal(15,2) NOT NULL,
  `tailieudinhkem` text DEFAULT NULL,
  `trangthai` enum('Cho duyet cap 1','Da duyet cap 1','Tu choi cap 1','Cho duyet cap 2','Da duyet cap 2','Tu choi cap 2','Cho duyet cap 3','Da duyet cap 3','Tu choi cap 3','Cho giai ngan','Da giai ngan','Tu choi') DEFAULT 'Cho duyet cap 1',
  `ghichu` text DEFAULT NULL,
  `ngaynop` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `yeucauhotro`
--

INSERT INTO `yeucauhotro` (`yeucauhotro_id`, `nguoidung_id`, `quy_id`, `lydo`, `sotiendenghi`, `tailieudinhkem`, `trangthai`, `ghichu`, `ngaynop`, `ngaycapnhat`) VALUES
(1, 4, 2, 'đả đạt được thành tích xuất sắc trong quá trình thi đua cuộc thi nghiên cứu khoa học của sinh viên đả giải nhất', 6000000.00, 'uploads/documents/logo_1780407875152_887301976.png', 'Da giai ngan', NULL, '2026-06-02 13:44:35', '2026-06-02 14:31:30'),
(5, 7, 2, '**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**\n**Độc lập – Tự do – Hạnh phúc**\n***\n\nTrà Vinh, ngày …… tháng …… năm ……\n\n**ĐƠN XIN HỖ TRỢ TỪ QUỸ \"QUỸ SINH VIÊN XUẤT SẮC\"**\n\n**Kính gửi:** Ban Giám hiệu Trường Đại học Trà Vinh;\nKính gửi: Ban Quản lý Quỹ \"Quỹ sinh viên xuất sắc\".\n\nTôi tên là: [Họ và tên]\nMã số sinh viên: [MSSV]\nLớp: [Lớp]\nKhoa: [Khoa]\nSố điện thoại liên hệ: [Số điện thoại]\n\nTôi viết đơn này với lòng kính trọng và mong muốn trình bày hoàn cảnh của mình để được Ban Giám hiệu và Ban Quản lý Quỹ xem xét hỗ trợ từ Quỹ \"Quỹ sinh viên xuất sắc\".\n\nGia đình tôi hiện đang gặp nhiều khó khăn về kinh tế. Nguồn thu nhập chính của gia đình không ổn định, chỉ đủ trang trải các chi phí sinh hoạt thiết yếu hàng ngày, khiến việc chi trả học phí và các khoản phí sinh hoạt, học tập khác của tôi trở thành một gánh nặng không nhỏ. Dù vậy, với khao khát được học tập và vươn lên, tôi luôn cố gắng nỗ lực hết mình trong mọi hoạt động học tập và rèn luyện tại trường.\n\nTrong suốt quá trình học tập tại Trường Đại học Trà Vinh, tôi luôn ý thức được tầm quan trọng của việc học và không ngừng phấn đấu để đạt được kết quả tốt nhất. Nhờ sự cố gắng không ngừng nghỉ, tôi đã đạt được nhiều thành tích cao trong học tập và rèn luyện, minh chứng bằng các Giấy khen thi đua mà nhà trường đã trao tặng. Những Giấy khen này không chỉ là niềm tự hào của bản thân mà còn là động lực lớn lao giúp tôi vượt qua khó khăn.\n\nTôi được biết Quỹ \"Quỹ sinh viên xuất sắc\" được thành lập nhằm trao tặng phần thưởng và hỗ trợ cho những sinh viên có kết quả thi đua tốt và đạt bằng khen thi đua. Nhận thấy bản thân đáp ứng các điều kiện của Quỹ, và với hoàn cảnh khó khăn hiện tại, tôi kính mong nhận được sự quan tâm, hỗ trợ từ Quỹ để có thêm điều kiện tiếp tục con đường học vấn, giảm bớt gánh nặng tài chính cho gia đình, và chuyên tâm hơn vào việc học tập, rèn luyện.\n\nNếu được Quỹ xem xét và hỗ trợ, tôi xin cam kết sẽ sử dụng nguồn hỗ trợ một cách hiệu quả, đúng mục đích, và tiếp tục nỗ lực không ngừng để giữ vững thành tích học tập, rèn luyện, xứng đáng với sự tin tưởng của Quý Ban, đóng góp vào sự phát triển của nhà trường và xã hội.\n\nTôi xin chân thành cảm ơn Ban Giám hiệu Trường Đại học Trà Vinh và Ban Quản lý Quỹ \"Quỹ sinh viên xuất sắc\" đã dành thời gian xem xét lá đơn này.\n\nKính mong nhận được sự quan tâm và giúp đỡ của Quý Ban.\n\nTrân trọng kính chào!\n\n**Người làm đơn**\n(Ký và ghi rõ họ tên)\n\n[Họ và tên]', 5000000.00, 'uploads/documents/logo_1781226310050_283300664.png', 'Cho duyet cap 2', NULL, '2026-06-12 01:05:10', '2026-06-12 01:42:54');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `donvihoc`
--
ALTER TABLE `donvihoc`
  ADD PRIMARY KEY (`donvihoc_id`),
  ADD UNIQUE KEY `uk_madonvi` (`madonvi`);

--
-- Chỉ mục cho bảng `giaodich`
--
ALTER TABLE `giaodich`
  ADD PRIMARY KEY (`giaodich_id`),
  ADD KEY `idx_yeucauhotro` (`yeucauhotro_id`),
  ADD KEY `idx_quy` (`quy_id`),
  ADD KEY `idx_nguoinhan` (`nguoinhan_id`),
  ADD KEY `nguoithuchien_id` (`nguoithuchien_id`),
  ADD KEY `fk_doisoatboiid` (`doisoatboiid`);

--
-- Chỉ mục cho bảng `guest_khoantaitro`
--
ALTER TABLE `guest_khoantaitro`
  ADD PRIMARY KEY (`guest_khoantaitro_id`),
  ADD UNIQUE KEY `tracking_uuid` (`tracking_uuid`),
  ADD KEY `idx_guest_email` (`guest_email`),
  ADD KEY `idx_tracking_uuid` (`tracking_uuid`),
  ADD KEY `idx_staging_status` (`trang_thai_staging`),
  ADD KEY `idx_otp_expires` (`otp_expires_at`);

--
-- Chỉ mục cho bảng `guest_yeucauhotro`
--
ALTER TABLE `guest_yeucauhotro`
  ADD PRIMARY KEY (`guest_yeucauhotro_id`),
  ADD UNIQUE KEY `tracking_uuid` (`tracking_uuid`),
  ADD KEY `idx_guest_email` (`guest_email`),
  ADD KEY `idx_tracking_uuid` (`tracking_uuid`),
  ADD KEY `idx_staging_status` (`trang_thai_staging`),
  ADD KEY `idx_otp_expires` (`otp_expires_at`) COMMENT 'Dùng cho cron job dọn dẹp bản ghi hết hạn';

--
-- Chỉ mục cho bảng `khoantaitro`
--
ALTER TABLE `khoantaitro`
  ADD PRIMARY KEY (`khoantaitro_id`),
  ADD KEY `idx_nhataitro` (`nhataitro_id`),
  ADD KEY `idx_quy` (`quy_id`),
  ADD KEY `nguoixacnhan_id` (`nguoixacnhan_id`);

--
-- Chỉ mục cho bảng `loaiquy`
--
ALTER TABLE `loaiquy`
  ADD PRIMARY KEY (`loaiquy_id`),
  ADD UNIQUE KEY `uk_maloai` (`maloai`);

--
-- Chỉ mục cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`nguoidung_id`),
  ADD UNIQUE KEY `uk_email` (`email`),
  ADD KEY `vaitro_id` (`vaitro_id`),
  ADD KEY `fk_nguoidung_donvihoc` (`donvihoc_id`),
  ADD KEY `fk_nguoidung_taikhoannganhang` (`taikhoannganhang_id`);

--
-- Chỉ mục cho bảng `nhataitro`
--
ALTER TABLE `nhataitro`
  ADD PRIMARY KEY (`nhataitro_id`),
  ADD KEY `nguoidung_id` (`nguoidung_id`);

--
-- Chỉ mục cho bảng `nhatkyhethong`
--
ALTER TABLE `nhatkyhethong`
  ADD PRIMARY KEY (`nhatkyhethong_id`),
  ADD KEY `idx_nguoidung` (`nguoidung_id`),
  ADD KEY `idx_hanhdong` (`hanhdong`);

--
-- Chỉ mục cho bảng `pheduyet`
--
ALTER TABLE `pheduyet`
  ADD PRIMARY KEY (`pheduyet_id`),
  ADD KEY `idx_yeucauhotro` (`yeucauhotro_id`),
  ADD KEY `idx_nguoiduyet` (`nguoiduyet_id`);

--
-- Chỉ mục cho bảng `quy`
--
ALTER TABLE `quy`
  ADD PRIMARY KEY (`quy_id`),
  ADD KEY `loaiquy_id` (`loaiquy_id`),
  ADD KEY `nguoitao_id` (`nguoitao_id`);

--
-- Chỉ mục cho bảng `sinhviennoibat`
--
ALTER TABLE `sinhviennoibat`
  ADD PRIMARY KEY (`sinhviennoibat_id`),
  ADD KEY `idx_thutu` (`thutu`),
  ADD KEY `nguoidung_id` (`nguoidung_id`);

--
-- Chỉ mục cho bảng `taikhoannganhang`
--
ALTER TABLE `taikhoannganhang`
  ADD PRIMARY KEY (`taikhoannganhang_id`),
  ADD KEY `idx_quy` (`quy_id`);

--
-- Chỉ mục cho bảng `vaitro`
--
ALTER TABLE `vaitro`
  ADD PRIMARY KEY (`vaitro_id`),
  ADD UNIQUE KEY `uk_tenvaitro` (`tenvaitro`);

--
-- Chỉ mục cho bảng `yeucauhotro`
--
ALTER TABLE `yeucauhotro`
  ADD PRIMARY KEY (`yeucauhotro_id`),
  ADD KEY `idx_nguoidung` (`nguoidung_id`),
  ADD KEY `idx_quy` (`quy_id`),
  ADD KEY `idx_trangthai` (`trangthai`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `donvihoc`
--
ALTER TABLE `donvihoc`
  MODIFY `donvihoc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `giaodich`
--
ALTER TABLE `giaodich`
  MODIFY `giaodich_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `guest_khoantaitro`
--
ALTER TABLE `guest_khoantaitro`
  MODIFY `guest_khoantaitro_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `guest_yeucauhotro`
--
ALTER TABLE `guest_yeucauhotro`
  MODIFY `guest_yeucauhotro_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `khoantaitro`
--
ALTER TABLE `khoantaitro`
  MODIFY `khoantaitro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `loaiquy`
--
ALTER TABLE `loaiquy`
  MODIFY `loaiquy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `nguoidung_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `nhataitro`
--
ALTER TABLE `nhataitro`
  MODIFY `nhataitro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `nhatkyhethong`
--
ALTER TABLE `nhatkyhethong`
  MODIFY `nhatkyhethong_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT cho bảng `pheduyet`
--
ALTER TABLE `pheduyet`
  MODIFY `pheduyet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT cho bảng `quy`
--
ALTER TABLE `quy`
  MODIFY `quy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `sinhviennoibat`
--
ALTER TABLE `sinhviennoibat`
  MODIFY `sinhviennoibat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `taikhoannganhang`
--
ALTER TABLE `taikhoannganhang`
  MODIFY `taikhoannganhang_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `vaitro`
--
ALTER TABLE `vaitro`
  MODIFY `vaitro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `yeucauhotro`
--
ALTER TABLE `yeucauhotro`
  MODIFY `yeucauhotro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `giaodich`
--
ALTER TABLE `giaodich`
  ADD CONSTRAINT `fk_doisoatboiid` FOREIGN KEY (`doisoatboiid`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `giaodich_ibfk_1` FOREIGN KEY (`yeucauhotro_id`) REFERENCES `yeucauhotro` (`yeucauhotro_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `giaodich_ibfk_2` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `giaodich_ibfk_3` FOREIGN KEY (`nguoinhan_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `giaodich_ibfk_4` FOREIGN KEY (`nguoithuchien_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `khoantaitro`
--
ALTER TABLE `khoantaitro`
  ADD CONSTRAINT `khoantaitro_ibfk_1` FOREIGN KEY (`nhataitro_id`) REFERENCES `nhataitro` (`nhataitro_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `khoantaitro_ibfk_2` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `khoantaitro_ibfk_3` FOREIGN KEY (`nguoixacnhan_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD CONSTRAINT `fk_nguoidung_donvihoc` FOREIGN KEY (`donvihoc_id`) REFERENCES `donvihoc` (`donvihoc_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_nguoidung_taikhoannganhang` FOREIGN KEY (`taikhoannganhang_id`) REFERENCES `taikhoannganhang` (`taikhoannganhang_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `nguoidung_ibfk_1` FOREIGN KEY (`vaitro_id`) REFERENCES `vaitro` (`vaitro_id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `nhataitro`
--
ALTER TABLE `nhataitro`
  ADD CONSTRAINT `nhataitro_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `nhatkyhethong`
--
ALTER TABLE `nhatkyhethong`
  ADD CONSTRAINT `nhatkyhethong_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `pheduyet`
--
ALTER TABLE `pheduyet`
  ADD CONSTRAINT `pheduyet_ibfk_1` FOREIGN KEY (`yeucauhotro_id`) REFERENCES `yeucauhotro` (`yeucauhotro_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pheduyet_ibfk_2` FOREIGN KEY (`nguoiduyet_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `quy`
--
ALTER TABLE `quy`
  ADD CONSTRAINT `quy_ibfk_1` FOREIGN KEY (`loaiquy_id`) REFERENCES `loaiquy` (`loaiquy_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `quy_ibfk_2` FOREIGN KEY (`nguoitao_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `sinhviennoibat`
--
ALTER TABLE `sinhviennoibat`
  ADD CONSTRAINT `sinhviennoibat_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `taikhoannganhang`
--
ALTER TABLE `taikhoannganhang`
  ADD CONSTRAINT `taikhoannganhang_ibfk_1` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `yeucauhotro`
--
ALTER TABLE `yeucauhotro`
  ADD CONSTRAINT `yeucauhotro_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `yeucauhotro_ibfk_2` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
