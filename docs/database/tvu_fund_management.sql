-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th7 04, 2026 lúc 08:02 PM
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
-- Cấu trúc bảng cho bảng `danhgia`
--

CREATE TABLE `danhgia` (
  `danhgia_id` int(11) NOT NULL COMMENT 'Mã đánh giá',
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
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Ng?y g?i ??nh gi?'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(1, NULL, 1, NULL, 100000000.00, 'Chuyen khoan', NULL, 'uploads/documents/DHTV_1783161932756_70885091.jpg', 'Thanh cong', 'Da_doi_soat', 100000000.00, 1, '2026-07-04 23:52:17', 'Đả nhận được tiền', 'Đả nhận được tiền', 2, '2026-07-04 10:45:32', '2026-07-04 16:52:17');

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

--
-- Đang đổ dữ liệu cho bảng `guest_khoantaitro`
--

INSERT INTO `guest_khoantaitro` (`guest_khoantaitro_id`, `guest_hoten`, `guest_email`, `guest_sodienthoai`, `guest_tochuc`, `guest_diachi`, `quy_id`, `sotien`, `hinhthuc`, `magiaodich`, `ngaytaitro`, `chungtu`, `ghichu`, `trang_thai_staging`, `khoantaitro_id_ref`, `nhataitro_id_ref`, `otp_code`, `otp_expires_at`, `is_email_verified`, `tracking_uuid`, `ngaytao`, `ngaycapnhat`) VALUES
(1, 'BIDV Trà Vinh.', 'dendung855@gmail.com', '0294385558', 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam – Chi nhánh Trà Vinh.', '2B, Đường Nguyễn Thị Minh Khai, Phường 2, Thành phố Trà Vinh, Tỉnh Trà Vinh.', 1, 100000000.00, 'Khac', 'VNPAY63872678', '2026-07-04', 'uploads/documents/1_1783161701612_439929109.jpg', 'Là những người đi trước đã từng học tập dưới mái trường Tra Vinh University, chúng tôi mong muốn được đóng góp một phần nguồn lực vào Quỹ Phát triển Trường. Hy vọng khoản tài trợ này sẽ góp phần tiếp sức cho thế hệ đàn em vững bước trên con đường lập nghiệp, đồng thời đồng hành cùng sự phát triển bền vững của Nhà trường.', 'DA_CHUYEN', 1, 1, NULL, NULL, 1, '536af03e-f920-4cdc-81b2-2082e765af04', '2026-07-04 10:42:14', '2026-07-04 10:42:14');

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
(1, 1, 1, 100000000.00, 'Khac', 'VNPAY63872678', '2026-07-04', 'uploads/documents/DHTV_1783161932756_70885091.jpg', 'Da nhan', 'duyệt', 1, '2026-07-04 10:47:31', '2026-07-04 10:42:14', '2026-07-04 10:47:31'),
(2, 1, 1, 200000000.00, 'Chuyen khoan', NULL, '2026-07-05', 'uploads/documents/1_1783186161875_959382373.jpg', 'Cho duyet', 'Gốp phần xây dựng Quỹ phát triển Đại học Trà Vinh phát triển hơn.', NULL, NULL, '2026-07-04 17:29:21', '2026-07-04 17:29:21'),
(3, 2, 1, 300000000.00, 'Chuyen khoan', NULL, '2026-07-05', 'uploads/documents/1_1783186400923_478583297.jpg', 'Cho duyet', 'Vietcombank Trà Vinh mong muốn đồng hành cùng Quỹ Phát triển ĐHTV trong việc trao tặng các suất học bổng tài năng cho sinh viên xuất sắc vượt khó. Chúng tôi hy vọng sự đóng góp này sẽ góp phần nâng cao chất lượng nguồn nhân lực địa phương và thắt chặt hơn nữa mối quan hệ hợp tác chiến lược giữa hai đơn vị trong các dự án giáo dục tiếp theo.', NULL, NULL, '2026-07-04 17:33:20', '2026-07-04 17:33:20'),
(4, 3, 1, 300000000.00, 'Chuyen khoan', NULL, '2026-07-05', 'uploads/documents/1_1783186647587_424996124.jpg', 'Cho duyet', 'Agribank Trà Vinh rất vinh dự khi được đóng góp một phần nguồn lực vào Quỹ Phát triển ĐHTV. Chúng tôi đặc biệt hướng tới các chương trình tài trợ tín dụng học tập ưu đãi và học bổng cho sinh viên thuộc diện chính sách, vùng sâu vùng xa, vùng đồng bào dân tộc thiểu số tại Trà Vinh để các em có cơ hội tiếp cận tri thức toàn diện.', NULL, NULL, '2026-07-04 17:37:27', '2026-07-04 17:37:27'),
(5, 4, 1, 400000000.00, 'Chuyen khoan', NULL, '2026-07-05', 'uploads/documents/1_1783187129137_985720991.jpg', 'Cho duyet', 'Điện lực Trà Vinh gửi tặng khoản tài trợ này với mong muốn tiếp sức cho các đề tài nghiên cứu khoa học mang tính ứng dụng cao của giảng viên và sinh viên ĐHTV, đặc biệt là các sáng kiến về năng lượng xanh và chuyển đổi số. Rất mong Quỹ sử dụng hiệu quả và đúng mục đích.', NULL, NULL, '2026-07-04 17:45:29', '2026-07-04 17:45:29');

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
(1, 'binh@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Nguyễn Văn Bình', 'ADMIN001', NULL, NULL, '0987654321', NULL, NULL, NULL, 1, NULL, 'Hoat dong', '2026-06-02 11:40:34', '2026-07-03 09:56:18', NULL),
(2, 'ketoan@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Trần Thị Kế Toán', 'KT001', NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, 'Hoat dong', '2026-06-02 11:40:34', '2026-07-03 09:56:18', NULL),
(3, 'canboquy@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Lê Văn Tùng', 'CB001', NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, 'Hoat dong', '2026-06-02 11:40:34', '2026-07-03 09:56:18', NULL),
(4, 'dendung855@gmail.com', '$2b$10$.aYzHwopjs66jWh2PjsOIOClg3zRIaN8.ZQrrmF5UYLH51lnLMIlm', 'BIDV Trà Vinh.', 'GG1783161734523', NULL, NULL, '0294385558', '2B, Đường Nguyễn Thị Minh Khai, Phường 2, Thành phố Trà Vinh, Tỉnh Trà Vinh.', NULL, NULL, 4, 'Nha tai tro', 'Hoat dong', '2026-07-04 10:42:14', '2026-07-04 10:42:14', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nhataitro`
--

CREATE TABLE `nhataitro` (
  `nhataitro_id` int(11) NOT NULL,
  `tennhataitro` varchar(200) NOT NULL,
  `loainhataitro` enum('Ca nhan','To chuc','Doanh nghiep','Doi tac') NOT NULL,
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
(1, 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam – Chi nhánh Trà Vinh.', 'To chuc', 'dendung855@gmail.com', '0294385558', '2B, Đường Nguyễn Thị Minh Khai, Phường 2, Thành phố Trà Vinh, Tỉnh Trà Vinh.', NULL, NULL, NULL, 4, 'Hoat dong', '2026-07-04 10:42:14', '2026-07-04 10:42:14'),
(2, 'Vietcombank Trà Vinh', 'To chuc', 'vietcombanktravinh@gmail.com', '02943855888', 'Số 26, Đường Nguyễn Thị Minh Khai, Khóm 3, Phường 2, TP. Trà Vinh, Tỉnh Trà Vinh', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-07-04 17:33:20', '2026-07-04 17:33:20'),
(3, 'Agribank Trà Vinh', 'To chuc', 'agribanktravinh@gmail.com', '02943862444', 'Số 50, Đường Võ Nguyên Giáp, Phường 6, TP. Trà Vinh, Tỉnh Trà Vinh', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-07-04 17:37:27', '2026-07-04 17:37:27'),
(4, 'Điện lực Trà Vinh', 'To chuc', 'dienluctravinh@gmail.com', '02943833444', 'Số 16, Đường Nguyễn Thái Học, Phường 1, TP. Trà Vinh, Tỉnh Trà Vinh', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-07-04 17:45:29', '2026-07-04 17:45:29');

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
(1, 1, 'DANG_XUAT', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-07-03 10:32:02'),
(2, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-03 10:33:20'),
(3, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":36,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-03 10:42:49'),
(4, 1, 'THEM_MOI_QUY', 'quy', 2, '[Nhân viên hệ thống] Nguyễn Văn Bình: Thêm mới quỹ hỗ trợ: Quỹ Học bổng Hỗ trợ Sinh viên Nghèo Vượt khó TVU', NULL, '{\"tenQuy\":\"Quỹ Học bổng Hỗ trợ Sinh viên Nghèo Vượt khó TVU\",\"loaiQuy\":\"Hoc bong\",\"moTa\":\"Quỹ chuyên cung cấp các suất học bổng toàn phần và bán phần cho sinh viên có hoàn cảnh đặc biệt khó khăn, vươn lên trong học tập tại Đại học Trà Vinh.\",\"hinhAnh\":\"uploads/avatars/fund/250_1781674629998_996093529_1783075369386_972057262.jpg\",\"soTienMucTieu\":100000000000000000000,\"soTienHoTroToiDa\":999999999998,\"soLuongChiTieu\":20,\"hanNopDon\":\"2027-03-03\",\"dieuKienTomTat\":null,\"soDu\":10000000000000000,\"trangThai\":\"Dang hoat dong\",\"nguoiTao\":1,\"ngayBatDau\":\"2026-07-03\",\"loaiDieuHanh\":\"Tap trung - Muc chi\",\"quyChaId\":1}', '127.0.0.1', '2026-07-03 10:44:06'),
(5, 1, 'CAP_NHAT_TRANG_THAI_QUY', 'quy', 2, '[Nhân viên hệ thống] Nguyễn Văn Bình: Thay đổi trạng thái quỹ Quỹ Học bổng Hỗ trợ Sinh viên Nghèo Vượt khó TVU từ \'Dang hoat dong\' sang \'Da dong\'', '{\"trangThai\":\"Dang hoat dong\"}', '{\"trangThai\":\"Da dong\"}', '127.0.0.1', '2026-07-03 10:45:10'),
(6, 3, 'DANG_NHAP', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Tùng: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-03 10:52:50'),
(7, 3, 'CAP_NHAT_QUY', 'quy', 1, '[Nhân viên hệ thống] Lê Văn Tùng: Cập nhật thông tin quỹ: Quỹ phát triển Đại học Trà Vinh', '{\"quy_id\":1,\"ten_quy\":\"Quỹ phát triển Đại học Trà Vinh\",\"loaiquy_id\":5,\"loai_quy\":\"Khac\",\"ten_loai_quy\":\"Khác\",\"mo_ta\":null,\"hinh_anh\":null,\"so_tien_muc_tieu\":\"5000000000.00\",\"so_tien_toi_thieu\":\"5000000000.00\",\"so_tien_ho_tro_toi_da\":null,\"so_tien_toi_da\":null,\"so_luong_chi_tieu\":null,\"dieu_kien_tom_tat\":null,\"ngaybatdau\":\"2026-07-02T17:00:00.000Z\",\"han_nop_don\":\"2027-12-30T17:00:00.000Z\",\"so_du\":\"1000000000.00\",\"nguoitao_id\":null,\"ngay_tao\":\"2026-07-03T10:15:23.000Z\",\"ngay_cap_nhat\":\"2026-07-03T10:15:23.000Z\",\"trang_thai\":\"Dang hoat dong\",\"loai_dieu_hanh\":\"Tap trung - Be chung\",\"quy_cha_id\":null,\"ten_quy_cha\":null}', '{\"tenQuy\":\"Quỹ phát triển Đại học Trà Vinh\",\"loaiQuy\":\"Hoc bong\",\"moTa\":null,\"hinhAnh\":null,\"soTienMucTieu\":5000000000,\"soTienHoTroToiDa\":null,\"soLuongChiTieu\":null,\"hanNopDon\":\"2027-12-30\",\"dieuKienTomTat\":null,\"soDu\":\"1000000000.00\",\"trangThai\":\"Dang hoat dong\"}', '127.0.0.1', '2026-07-03 11:12:24'),
(8, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-03 16:45:46'),
(9, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":16,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-03 16:52:46'),
(10, 1, 'CAP_NHAT_QUY', 'quy', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật thông tin quỹ: Quỹ phát triển Đại học Trà Vinh', '{\"quy_id\":1,\"ten_quy\":\"Quỹ phát triển Đại học Trà Vinh\",\"loaiquy_id\":2,\"loai_quy\":\"Hoc bong\",\"ten_loai_quy\":\"Học bổng\",\"mo_ta\":null,\"hinh_anh\":null,\"so_tien_muc_tieu\":\"5000000000.00\",\"so_tien_toi_thieu\":\"5000000000.00\",\"so_tien_ho_tro_toi_da\":null,\"so_tien_toi_da\":null,\"so_luong_chi_tieu\":null,\"dieu_kien_tom_tat\":null,\"ngaybatdau\":\"2026-07-02T17:00:00.000Z\",\"han_nop_don\":\"2027-12-29T17:00:00.000Z\",\"so_du\":\"1000000000.00\",\"nguoitao_id\":null,\"ngay_tao\":\"2026-07-03T10:15:23.000Z\",\"ngay_cap_nhat\":\"2026-07-03T16:45:52.000Z\",\"trang_thai\":\"Dang hoat dong\",\"loai_dieu_hanh\":\"Tap trung - Be chung\",\"quy_cha_id\":null,\"ten_quy_cha\":null}', '{\"tenQuy\":\"Quỹ phát triển Đại học Trà Vinh\",\"loaiQuy\":\"Hoc bong\",\"moTa\":null,\"hinhAnh\":\"uploads/avatars/fund/250_1781674629998_996093529_1783097566841_600534754.jpg\",\"soTienMucTieu\":5000000000,\"soTienHoTroToiDa\":null,\"soLuongChiTieu\":null,\"hanNopDon\":\"2027-12-29\",\"dieuKienTomTat\":null,\"soDu\":\"1000000000.00\",\"trangThai\":\"Dang hoat dong\"}', '127.0.0.1', '2026-07-03 16:52:54'),
(11, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":24,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-03 16:57:05'),
(12, 1, 'THEM_MOI_QUY', 'quy', 4, '[Nhân viên hệ thống] Nguyễn Văn Bình: Thêm mới quỹ hỗ trợ: Quỹ Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU', NULL, '{\"tenQuy\":\"Quỹ Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU\",\"loaiQuy\":\"Hoc bong\",\"moTa\":\"Quỹ chuyên trách cung cấp kinh phí hỗ trợ học tập, sinh hoạt phí và trợ cấp đột xuất cho sinh viên hoàn cảnh khó khăn nhưng có tinh thần vươn lên, đạt thành tích khá tốt trở lên tại Đại học Trà Vinh.\",\"hinhAnh\":\"uploads/avatars/fund/153004-truong-dai-hoc-tra-vinh-ky-niem-ngay-nha-giao-viet-nam-va-trao-hoc-bong-cho-sinh-vien-vuot-kho-hoc-gioi_1781674663123_108544383_1783097825872_664555170.jpg\",\"soTienMucTieu\":400000000,\"soTienHoTroToiDa\":20000000,\"soLuongChiTieu\":20,\"hanNopDon\":\"2027-07-03\",\"dieuKienTomTat\":\"- Thuộc diện hộ nghèo hoặc hộ cận nghèo (có sổ hoặc giấy xác nhận từ địa phương).\\n- Điểm trung bình học tập tích lũy (GPA) từ 2.5/4.0 hoặc 7.0/10.0 trở lên.\\n- Điểm rèn luyện đạt loại Tốt trở lên.\",\"soDu\":300000000,\"trangThai\":\"Dang hoat dong\",\"nguoiTao\":1,\"ngayBatDau\":\"2026-07-03\"}', '127.0.0.1', '2026-07-03 17:00:13'),
(13, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":21,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-03 17:24:20'),
(14, 1, 'THEM_MOI_QUY', 'quy', 5, '[Nhân viên hệ thống] Nguyễn Văn Bình: Thêm mới quỹ hỗ trợ: Quỹ Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU', NULL, '{\"tenQuy\":\"Quỹ Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU\",\"loaiQuy\":\"Hoc bong\",\"moTa\":\"- Thuộc diện hộ nghèo hoặc hộ cận nghèo (có sổ hoặc giấy xác nhận từ địa phương).\\n- Điểm trung bình học tập tích lũy (GPA) từ 2.5/4.0 hoặc 7.0/10.0 trở lên.\\n- Điểm rèn luyện đạt loại Tốt trở lên.\\n- Chưa nhận bất kỳ học bổng tài trợ nào khác trong cùng\",\"hinhAnh\":\"uploads/avatars/fund/153004-truong-dai-hoc-tra-vinh-ky-niem-ngay-nha-giao-viet-nam-va-trao-hoc-bong-cho-sinh-vien-vuot-kho-hoc-gioi_1781674663123_108544383_1783099460741_662453561.jpg\",\"soTienMucTieu\":400000000,\"soTienHoTroToiDa\":20000000,\"soLuongChiTieu\":20,\"hanNopDon\":\"2027-01-04\",\"dieuKienTomTat\":null,\"soDu\":300000000,\"trangThai\":\"Dang hoat dong\",\"nguoiTao\":1,\"ngayBatDau\":\"2026-07-03\",\"loaiDieuHanh\":\"Tap trung - Muc chi\",\"quyChaId\":1}', '127.0.0.1', '2026-07-03 17:26:02'),
(15, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/upload/public - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/public\",\"statusCode\":200,\"durationMs\":14,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-04 10:20:27'),
(16, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/upload/public - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/public\",\"statusCode\":200,\"durationMs\":4,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-04 10:20:45'),
(17, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/upload/public - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/public\",\"statusCode\":200,\"durationMs\":4,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-04 10:21:06'),
(18, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/upload/public - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/public\",\"statusCode\":200,\"durationMs\":4,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-04 10:21:17'),
(19, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/upload/public - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/public\",\"statusCode\":200,\"durationMs\":4,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-04 10:31:14'),
(20, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/upload/public - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/public\",\"statusCode\":200,\"durationMs\":22,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-04 10:37:48'),
(21, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/guest/tai-tro - tác động dữ liệu thành công (201)', NULL, '{\"method\":\"POST\",\"path\":\"/api/guest/tai-tro\",\"statusCode\":201,\"durationMs\":3720,\"params\":{},\"query\":{},\"body\":{\"guestHoTen\":\"BIDV Trà Vinh.\",\"guestEmail\":\"travinh@bidv.com.vn\",\"guestSoDienThoai\":\"0294385535\",\"guestToChuc\":\"Ngân hàng TMCP Đầu tư và Phát triển Việt Nam – Chi nhánh Trà Vinh.\",\"guestDiaChi\":\"Số 2B, Đường Nguyễn Thị Minh Khai, Phường 2, Thành phố Trà Vinh, Tỉnh Trà Vinh.\",\"quyId\":1,\"soTien\":100000000,\"hinhThuc\":\"Khac\",\"maGiaoDich\":\"VNPAY74919026\",\"chungTu\":\"uploads/documents/1_1783161468305_188285289.jpg\",\"ghiChu\":\"Là những người đi trước đã từng học tập dưới mái trường Tra Vinh University, chúng tôi mong muốn được đóng góp một phần nguồn lực vào Quỹ Phát triển Trường. Hy vọng khoản tài trợ này sẽ góp phần tiếp sức cho thế hệ đàn em vững bước trên con đường lập nghiệp, đồng thời đồng hành cùng sự phát triển bền vững của Nhà trường.\"}}', '127.0.0.1', '2026-07-04 10:37:52'),
(22, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/upload/public - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/public\",\"statusCode\":200,\"durationMs\":7,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-04 10:41:41'),
(23, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/guest/tai-tro - tác động dữ liệu thành công (201)', NULL, '{\"method\":\"POST\",\"path\":\"/api/guest/tai-tro\",\"statusCode\":201,\"durationMs\":3270,\"params\":{},\"query\":{},\"body\":{\"guestHoTen\":\"BIDV Trà Vinh.\",\"guestEmail\":\"dendung855@gmail.com\",\"guestSoDienThoai\":\"0294385558\",\"guestToChuc\":\"Ngân hàng TMCP Đầu tư và Phát triển Việt Nam – Chi nhánh Trà Vinh.\",\"guestDiaChi\":\"2B, Đường Nguyễn Thị Minh Khai, Phường 2, Thành phố Trà Vinh, Tỉnh Trà Vinh.\",\"quyId\":1,\"soTien\":100000000,\"hinhThuc\":\"Khac\",\"maGiaoDich\":\"VNPAY63872678\",\"chungTu\":\"uploads/documents/1_1783161701612_439929109.jpg\",\"ghiChu\":\"Là những người đi trước đã từng học tập dưới mái trường Tra Vinh University, chúng tôi mong muốn được đóng góp một phần nguồn lực vào Quỹ Phát triển Trường. Hy vọng khoản tài trợ này sẽ góp phần tiếp sức cho thế hệ đàn em vững bước trên con đường lập nghiệp, đồng thời đồng hành cùng sự phát triển bền vững của Nhà trường.\"}}', '127.0.0.1', '2026-07-04 10:41:44'),
(24, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/guest/verify-otp - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/guest/verify-otp\",\"statusCode\":200,\"durationMs\":3086,\"params\":{},\"query\":{},\"body\":{\"email\":\"dendung855@gmail.com\",\"otpCode\":\"491536\",\"type\":\"donation\",\"otpToken\":\"eyJ0eXBlIjoiZG9uYXRpb24iLCJlbWFpbCI6ImRlbmR1bmc4NTVAZ21haWwuY29tIiwidHJhY2tpbmdVdWlkIjoiNTM2YWYwM2UtZjkyMC00Y2RjLTgxYjItMjA4MmU3NjVhZjA0Iiwib3RwSGFzaCI6IjM2ZTRlZThlOGNlODkwMTVkODc1OWU1ZWRmYjdmNDJmYTdkNzQ3MGQ0ZjkzMWI3ZjkwNDg5MDZiODdlYjk1ZTMiLCJleHBpcmVzQXQiOiIyMDI2LTA3LTA0VDExOjExOjQxLjYyNVoiLCJkb25hdGlvbiI6eyJndWVzdEhvVGVuIjoiQklEViBUcsOgIFZpbmguIiwiZ3Vlc3RFbWFpbCI6ImRlbmR1bmc4NTVAZ21haWwuY29tIiwiZ3Vlc3RTb0RpZW5UaG9haSI6IjAyOTQzODU1NTgiLCJndWVzdFRvQ2h1YyI6Ik5nw6JuIGjDoG5nIFRNQ1AgxJDhuqd1IHTGsCB2w6AgUGjDoXQgdHJp4buDbiBWaeG7h3QgTmFtIOKAkyBDaGkgbmjDoW5oIFRyw6AgVmluaC4iLCJndWVzdERpYUNoaSI6IjJCLCDEkMaw4budbmcgTmd1eeG7hW4gVGjhu4sgTWluaCBLaGFpLCBQaMaw4budbmcgMiwgVGjDoG5oIHBo4buRIFRyw6AgVmluaCwgVOG7iW5oIFRyw6AgVmluaC4iLCJxdXlJZCI6MSwic29UaWVuIjoxMDAwMDAwMDAsImhpbmhUaHVjIjoiS2hhYyIsIm1hR2lhb0RpY2giOiJWTlBBWTYzODcyNjc4IiwibmdheVRhaVRybyI6IjIwMjYtMDctMDQiLCJjaHVuZ1R1IjoidXBsb2Fkcy9kb2N1bWVudHMvMV8xNzgzMTYxNzAxNjEyXzQzOTkyOTEwOS5qcGciLCJnaGlDaHUiOiJMw6Agbmjhu69uZyBuZ8aw4budaSDEkWkgdHLGsOG7m2MgxJHDoyB04burbmcgaOG7jWMgdOG6rXAgZMaw4bubaSBtw6FpIHRyxrDhu51uZyBUcmEgVmluaCBVbml2ZXJzaXR5LCBjaMO6bmcgdMO0aSBtb25nIG114buRbiDEkcaw4bujYyDEkcOzbmcgZ8OzcCBt4buZdCBwaOG6p24gbmd14buTbiBs4buxYyB2w6BvIFF14bu5IFBow6F0IHRyaeG7g24gVHLGsOG7nW5nLiBIeSB24buNbmcga2hv4bqjbiB0w6BpIHRy4bujIG7DoHkgc-G6vSBnw7NwIHBo4bqnbiB0aeG6v3Agc-G7qWMgY2hvIHRo4bq_IGjhu4cgxJHDoG4gZW0gduG7r25nIGLGsOG7m2MgdHLDqm4gY29uIMSRxrDhu51uZyBs4bqtcCBuZ2hp4buHcCwgxJHhu5NuZyB0aOG7nWkgxJHhu5NuZyBow6BuaCBjw7luZyBz4buxIHBow6F0IHRyaeG7g24gYuG7gW4gduG7r25nIGPhu6dhIE5ow6AgdHLGsOG7nW5nLiIsInRyYWNraW5nVXVpZCI6IjUzNmFmMDNlLWY5MjAtNGNkYy04MWIyLTIwODJlNzY1YWYwNCJ9fQ.hjV62WSNQkCZwKkPhxfwjInLrQKjUXPIG2PjZe42rXo\"}}', '127.0.0.1', '2026-07-04 10:42:17'),
(25, 2, 'DANG_NHAP', 'nguoidung', 2, '[Nhân viên hệ thống] Trần Thị Kế Toán: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-04 10:44:52'),
(26, 2, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Trần Thị Kế Toán: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":7,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-04 10:45:32'),
(27, 2, 'DUYET_KHOAN_TAI_TRO', 'khoantaitro', 1, '[Nhân viên hệ thống] Trần Thị Kế Toán: Duyệt khoản tài trợ ID 1 số tiền 100000000.00 VNĐ của nhà tài trợ \'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam – Chi nhánh Trà Vinh.\' vào quỹ \'Quỹ phát triển Đại học Trà Vinh\'', '{\"trangthai\":\"Cho duyet\"}', '{\"trangthai\":\"Da duyet\"}', '127.0.0.1', '2026-07-04 10:45:32'),
(28, 2, 'DANG_XUAT', 'nguoidung', 2, '[Nhân viên hệ thống] Trần Thị Kế Toán: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-07-04 10:45:56'),
(29, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-04 10:46:16'),
(30, 1, 'XAC_NHAN_KHOAN_TAI_TRO', 'khoantaitro', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Xác nhận đã nhận tiền đóng góp số tiền 100000000.00 VNĐ cho khoản tài trợ ID 1', '{\"trangthai\":\"Da duyet\"}', '{\"trangthai\":\"Da nhan\"}', '127.0.0.1', '2026-07-04 10:47:31'),
(31, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-04 15:48:37'),
(32, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-04 16:51:16'),
(33, 1, 'API_CAP_NHAT', 'doi-soat', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: PATCH /api/transactions/1/doi-soat - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"PATCH\",\"path\":\"/api/transactions/1/doi-soat\",\"statusCode\":200,\"durationMs\":16,\"params\":{\"id\":\"1\"},\"query\":{},\"body\":{\"doiSoatTrangThai\":\"Bat_thuong\",\"ghiChu\":\"Đả nhận được tiền\"}}', '127.0.0.1', '2026-07-04 16:52:05'),
(34, 1, 'API_CAP_NHAT', 'doi-soat', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: PATCH /api/transactions/1/doi-soat - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"PATCH\",\"path\":\"/api/transactions/1/doi-soat\",\"statusCode\":200,\"durationMs\":9,\"params\":{\"id\":\"1\"},\"query\":{},\"body\":{\"doiSoatTrangThai\":\"Da_doi_soat\",\"ghiChu\":\"Đả nhận được tiền\"}}', '127.0.0.1', '2026-07-04 16:52:17'),
(35, 1, 'DANG_XUAT', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-07-04 16:52:35'),
(36, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-04 16:53:21'),
(37, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":28,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-04 17:29:21'),
(38, 1, 'THEM_MOI_KHOAN_TAI_TRO', 'khoantaitro', 2, '[Nhân viên hệ thống] Nguyễn Văn Bình: Ghi nhận khoản tài trợ số tiền 200.000.000 VNĐ vào quỹ \'Quỹ phát triển Đại học Trà Vinh\'', NULL, '{\"nhaTaiTroId\":1,\"quyId\":1,\"soTien\":200000000}', '127.0.0.1', '2026-07-04 17:29:22'),
(39, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":6,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-04 17:33:20'),
(40, 1, 'THEM_MOI_KHOAN_TAI_TRO', 'khoantaitro', 3, '[Nhân viên hệ thống] Nguyễn Văn Bình: Ghi nhận khoản tài trợ số tiền 300.000.000 VNĐ vào quỹ \'Quỹ phát triển Đại học Trà Vinh\'', NULL, '{\"nhaTaiTroId\":2,\"quyId\":1,\"soTien\":300000000}', '127.0.0.1', '2026-07-04 17:33:20'),
(41, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":7,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-04 17:37:27'),
(42, 1, 'THEM_MOI_KHOAN_TAI_TRO', 'khoantaitro', 4, '[Nhân viên hệ thống] Nguyễn Văn Bình: Ghi nhận khoản tài trợ số tiền 300.000.000 VNĐ vào quỹ \'Quỹ phát triển Đại học Trà Vinh\'', NULL, '{\"nhaTaiTroId\":3,\"quyId\":1,\"soTien\":300000000}', '127.0.0.1', '2026-07-04 17:37:27'),
(43, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":17,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-04 17:45:29'),
(44, 1, 'THEM_MOI_KHOAN_TAI_TRO', 'khoantaitro', 5, '[Nhân viên hệ thống] Nguyễn Văn Bình: Ghi nhận khoản tài trợ số tiền 400.000.000 VNĐ vào quỹ \'Quỹ phát triển Đại học Trà Vinh\'', NULL, '{\"nhaTaiTroId\":4,\"quyId\":1,\"soTien\":400000000}', '127.0.0.1', '2026-07-04 17:45:29');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phanbongansach`
--

CREATE TABLE `phanbongansach` (
  `phanbongansach_id` int(11) NOT NULL,
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
  `ghichu` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Quản lý trích lập ngân sách nội bộ';

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
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `loaidieuhanh` enum('Tap trung - Be chung','Tap trung - Muc chi') NOT NULL DEFAULT 'Tap trung - Be chung' COMMENT 'Hình thức vận hành quỹ',
  `quy_cha_id` int(11) DEFAULT NULL COMMENT 'ID của Quỹ cha (Bể tiền lớn)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `quy`
--

INSERT INTO `quy` (`quy_id`, `tenquy`, `loaiquy_id`, `mota`, `hinhanh`, `sotienmuctieu`, `sodu`, `sotienhotrotoida`, `soluonghotrotoida`, `dieukienhotro`, `ngaybatdau`, `ngayketthuc`, `trangthai`, `nguoitao_id`, `ngaytao`, `ngaycapnhat`, `loaidieuhanh`, `quy_cha_id`) VALUES
(1, 'Quỹ phát triển Đại học Trà Vinh', 2, NULL, 'uploads/avatars/fund/250_1781674629998_996093529_1783097566841_600534754.jpg', 5000000000.00, 800000000.00, NULL, NULL, NULL, '2026-07-03', '2027-12-29', 'Dang hoat dong', NULL, '2026-07-03 10:15:23', '2026-07-04 10:45:32', 'Tap trung - Be chung', NULL),
(5, 'Quỹ Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU', 2, '- Thuộc diện hộ nghèo hoặc hộ cận nghèo (có sổ hoặc giấy xác nhận từ địa phương).\n- Điểm trung bình học tập tích lũy (GPA) từ 2.5/4.0 hoặc 7.0/10.0 trở lên.\n- Điểm rèn luyện đạt loại Tốt trở lên.\n- Chưa nhận bất kỳ học bổng tài trợ nào khác trong cùng', 'uploads/avatars/fund/153004-truong-dai-hoc-tra-vinh-ky-niem-ngay-nha-giao-viet-nam-va-trao-hoc-bong-cho-sinh-vien-vuot-kho-hoc-gioi_1781674663123_108544383_1783099460741_662453561.jpg', 400000000.00, 300000000.00, 20000000.00, 20, NULL, '2026-07-03', '2027-01-04', 'Dang hoat dong', 1, '2026-07-03 17:26:02', '2026-07-03 17:26:02', 'Tap trung - Muc chi', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sinhviennoibat`
--

CREATE TABLE `sinhviennoibat` (
  `sinhviennoibat_id` int(11) NOT NULL,
  `nguoidung_id` int(11) NOT NULL COMMENT 'ID liên kết tới tài khoản sinh viên',
  `namhoc` varchar(20) DEFAULT NULL,
  `thanhtich` text DEFAULT NULL,
  `thutu` int(11) DEFAULT 0,
  `trangthai` enum('Hien thi','An') DEFAULT 'Hien thi',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tintuc`
--

CREATE TABLE `tintuc` (
  `tintuc_id` int(11) NOT NULL,
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
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tintuc`
--

INSERT INTO `tintuc` (`tintuc_id`, `tieude`, `motangan`, `noidung`, `avatar`, `danhmuc`, `phanloai`, `lanoibat`, `trangthai`, `ngayxuatban`, `nguoitao_id`, `nguoisua_id`, `ngaytao`, `ngaycapnhat`) VALUES
(9, 'TVU trao 50 suất học bổng trị giá 500 triệu đồng cho sinh viên vượt khó năm học 2025-2026', 'Ngày 10/6/2025, Quỹ Phát triển TVU tổ chức lễ trao 50 suất học bổng trị giá hơn 500 triệu đồng cho sinh viên có hoàn cảnh khó khăn nhưng đạt thành tích học tập xuất sắc trong năm học 2025-2026.', '<p>Ngày 10/6/2025, tại Hội trường lớn Trường Đại học Trà Vinh, Quỹ Phát triển TVU tổ chức Lễ trao học bổng hỗ trợ sinh viên vượt khó năm học 2025-2026. Buổi lễ có sự tham dự của Ban Giám hiệu nhà trường và 50 sinh viên xuất sắc đến từ nhiều ngành học khác nhau. Mỗi suất học bổng trị giá 10 triệu đồng, tổng kinh phí hơn 500 triệu đồng được huy động từ các nhà hảo tâm, doanh nghiệp và cựu sinh viên TVU trên cả nước. Đây là nguồn động lực tinh thần to lớn, khích lệ các em tiếp tục nỗ lực vươn lên.</p>', 'uploads/tintuc/HB-thientai_1781667807032_685539573.jpg', 'Tin hoc bong', 'Tin noi bat', 1, 'Da xuat ban', '2025-06-09 18:00:00', 3, 1, '2026-06-16 17:27:22', '2026-06-17 04:30:58'),
(10, 'Thông báo mở hồ sơ xét học bổng hỗ trợ sinh viên khó khăn học kỳ 1 năm học 2025-2026', 'Phòng Công tác Sinh viên thông báo nhận hồ sơ xét cấp học bổng hỗ trợ dành cho sinh viên có hoàn cảnh đặc biệt khó khăn. Thời gian nộp hồ sơ từ ngày 01/08/2025 đến hết ngày 31/08/2025.', '<p>Căn cứ kế hoạch hoạt động của Quỹ Phát triển TVU, Phòng Công tác Sinh viên thông báo đến toàn thể sinh viên về việc nhận hồ sơ xét cấp học bổng hỗ trợ học kỳ 1 năm học 2025-2026. Đối tượng xét duyệt là sinh viên hệ chính quy thuộc hộ nghèo hoặc cận nghèo, không bị kỷ luật trong năm học. Sinh viên nộp hồ sơ trực tuyến qua hệ thống TVU Fund hoặc nộp trực tiếp tại Phòng Công tác Sinh viên trước ngày 31/08/2025.</p>', 'uploads/tintuc/dhtv2_1781667826744_698406462.jpg', 'Thong bao', 'Tin noi bat', 3, 'Da xuat ban', '2025-07-19 18:00:00', 3, 1, '2026-06-16 17:27:22', '2026-06-17 04:30:58'),
(11, 'TVU Fund triển khai tính năng nộp hồ sơ trực tuyến cho sinh viên chưa có tài khoản', 'Từ tháng 8/2025, hệ thống TVU Fund chính thức cho phép sinh viên chưa có tài khoản nộp đơn xin hỗ trợ trực tuyến thông qua quy trình xác minh email OTP nhanh chóng, không cần đến phòng ban.', '<p>Nhằm tạo điều kiện thuận lợi cho sinh viên tiếp cận các nguồn hỗ trợ, hệ thống TVU Fund chính thức triển khai tính năng nộp hồ sơ trực tuyến dành cho sinh viên chưa có tài khoản kể từ tháng 8/2025. Sinh viên chỉ cần điền thông tin cá nhân, xác minh email bằng mã OTP và hệ thống sẽ tự động tạo tài khoản, tiếp nhận đơn vào hàng chờ xét duyệt. Tính năng này giúp rút ngắn thời gian tiếp nhận và giảm tải cho bộ phận hành chính nhà trường.</p>', 'uploads/tintuc/NHS-online_1781674393806_895672768.jpg', 'Tin giao duc', 'Tin noi bat', 3, 'Da xuat ban', '2025-07-31 19:00:00', 3, 1, '2026-06-16 17:27:22', '2026-06-17 05:33:15'),
(12, 'Hội thảo Kết nối Doanh nghiệp — Đồng hành cùng Sinh viên Trà Vinh 2025', 'Quỹ TVU phối hợp tổ chức hội thảo kết nối nhà tài trợ và sinh viên, thu hút hơn 30 doanh nghiệp trong và ngoài tỉnh tham gia đăng ký đồng hành tài trợ học bổng giai đoạn 2025-2027.', '<p>Ngày 20/5/2025, Quỹ Phát triển TVU tổ chức thành công Hội thảo Kết nối Doanh nghiệp — Đồng hành cùng Sinh viên Trà Vinh 2025. Hội thảo thu hút hơn 30 doanh nghiệp trong và ngoài tỉnh tham dự, cùng gần 200 sinh viên đại diện các khoa. Kết quả, 12 doanh nghiệp ký kết biên bản ghi nhớ với tổng giá trị cam kết tài trợ đạt hơn 2 tỷ đồng. Đây là hoạt động thường niên nhằm mở rộng mạng lưới nhà tài trợ bền vững cho sinh viên TVU.</p>', 'uploads/tintuc/250_1781674629998_996093529.jpg', 'Su kien', 'Tin noi bat', 2, 'Da xuat ban', '2025-05-19 12:00:00', 3, 1, '2026-06-16 17:27:22', '2026-06-17 05:37:12'),
(13, 'TVU Fund nhận tài trợ 1 tỷ đồng từ Tập đoàn FPT — Cột mốc lớn nhất lịch sử Quỹ', 'Ngày 15/8/2025, Quỹ Phát triển TVU ký kết hợp đồng tài trợ với Tập đoàn FPT trị giá 1 tỷ đồng, là khoản tài trợ đơn lẻ lớn nhất trong lịch sử hoạt động của Quỹ, mở ra cơ hội hỗ trợ hàng trăm sinh viên ngành CNTT.', '<p>Ngày 15/8/2025, Lễ ký kết Hợp đồng tài trợ giữa Quỹ Phát triển TVU và Tập đoàn FPT diễn ra trang trọng với sự tham dự của Ban Giám hiệu nhà trường và lãnh đạo FPT khu vực miền Nam. Với tổng giá trị 1 tỷ đồng giải ngân trong 3 năm từ 2025 đến 2028, đây là khoản tài trợ lớn nhất trong lịch sử 10 năm hoạt động của Quỹ TVU. Toàn bộ nguồn tài trợ dành cho học bổng sinh viên ngành Công nghệ Thông tin xuất sắc có hoàn cảnh khó khăn.</p>', 'uploads/tintuc/DHTVHTGDVN_1781674481108_234934273.jpg', 'Tin hoc bong', 'Tin noi bat', 2, 'Da xuat ban', '2025-08-14 18:00:00', 3, 1, '2026-06-16 17:27:22', '2026-06-17 05:34:45'),
(14, 'Quỹ TVU mở đợt xét duyệt học bổng khẩn cấp hỗ trợ sinh viên bị ảnh hưởng thiên tai', 'Trước tình hình thiên tai ảnh hưởng nhiều gia đình sinh viên tại Đồng bằng Sông Cửu Long, Quỹ TVU quyết định mở đợt xét duyệt học bổng khẩn cấp với tổng kinh phí 300 triệu đồng.', '<p>Trước diễn biến phức tạp của thiên tai tại Đồng bằng Sông Cửu Long cuối năm 2025, Ban Điều hành Quỹ Phát triển TVU họp khẩn và thống nhất mở đợt xét duyệt học bổng hỗ trợ khẩn cấp. Mỗi suất học bổng trị giá từ 5 đến 15 triệu đồng tùy theo mức độ thiệt hại được xác nhận bởi chính quyền địa phương. Sinh viên nộp hồ sơ trực tuyến qua hệ thống TVU Fund hoặc liên hệ Phòng Công tác Sinh viên trước ngày 30/09/2025.</p>', 'uploads/tintuc/HB-tieuso_1781674431490_421848547.jpg', 'Thong bao', 'Tin noi bat', 3, 'Da xuat ban', '2025-08-31 17:30:00', 3, 1, '2026-06-16 17:27:22', '2026-06-17 05:33:53'),
(15, 'Sinh viên TVU vượt khó: Hành trình từ mái nhà dột nát đến tấm bằng kỹ sư xuất sắc', 'Câu chuyện của Nguyễn Văn An, sinh viên ngành Kỹ thuật Phần mềm khóa 2021, vượt qua hoàn cảnh cực kỳ khó khăn nhờ học bổng TVU Fund để tốt nghiệp loại giỏi và được nhận vào doanh nghiệp công nghệ hàng đầu.', '<p>Sinh ra trong gia đình thuần nông tại huyện Cầu Ngang, Nguyễn Văn An từng nhiều lần nghĩ đến việc bỏ học vì gánh nặng học phí. Năm học thứ 2, An được Quỹ TVU cấp học bổng toàn phần trị giá 15 triệu đồng mỗi năm, đó là bước ngoặt thay đổi toàn bộ hành trình của cậu. Tốt nghiệp loại giỏi tháng 6/2025, An hiện làm việc tại công ty công nghệ tại TP.HCM và đã đăng ký trở thành nhà tài trợ nhỏ để đóng góp lại cho các thế hệ sinh viên tiếp theo.</p>', 'uploads/tintuc/153004-truong-dai-hoc-tra-vinh-ky-niem-ngay-nha-giao-viet-nam-va-trao-hoc-bong-cho-sinh-vien-vuot-kho-hoc-gioi_1781674663123_108544383.jpg', 'Tin hoc bong', 'Tin noi bat', 2, 'Da xuat ban', '2025-07-04 20:00:00', 3, 1, '2026-06-16 17:27:22', '2026-06-17 05:37:45'),
(16, 'Trường Đại học Trà Vinh ra mắt Chương trình học bổng toàn phần dành cho sinh viên khuyết tật', 'Nhằm tạo cơ hội học tập bình đẳng, TVU Fund phối hợp Phòng Công tác Sinh viên chính thức ra mắt chương trình học bổng toàn phần dành riêng cho sinh viên khuyết tật năm học 2025-2026.', '<p>Nhằm tạo cơ hội học tập bình đẳng cho tất cả sinh viên, Quỹ Phát triển TVU phối hợp cùng Phòng Công tác Sinh viên chính thức ra mắt chương trình học bổng toàn phần dành riêng cho sinh viên khuyết tật năm học 2025-2026. Chương trình hỗ trợ toàn bộ học phí, chi phí sinh hoạt và trang thiết bị học tập phù hợp. Sinh viên quan tâm liên hệ Phòng Công tác Sinh viên hoặc nộp hồ sơ trực tiếp trên hệ thống TVU Fund trước ngày 15/09/2025.</p>', 'uploads/tintuc/tvu-IMG_8704_1781674765127_566630775.png', 'Tin giao duc', 'Tin noi bat', 3, 'Da xuat ban', '2025-08-19 18:00:00', 3, 1, '2026-06-16 17:27:22', '2026-06-17 05:39:27'),
(17, 'TVU Fund công bố báo cáo tài chính minh bạch 6 tháng đầu năm 2025', 'Quỹ Phát triển TVU công bố báo cáo tài chính 6 tháng đầu năm 2025 với tổng thu hơn 3,2 tỷ đồng và tổng chi hỗ trợ sinh viên đạt 1,8 tỷ đồng, đảm bảo nguyên tắc minh bạch và công khai.', '<p>Thực hiện nguyên tắc minh bạch tài chính, Quỹ Phát triển TVU công bố báo cáo tài chính 6 tháng đầu năm 2025. Tổng thu đạt hơn 3,2 tỷ đồng từ các nguồn tài trợ doanh nghiệp, cá nhân và cựu sinh viên. Tổng chi hỗ trợ sinh viên đạt 1,8 tỷ đồng, giúp 187 sinh viên vượt qua khó khăn duy trì việc học. Báo cáo đầy đủ được công bố công khai trên hệ thống TVU Fund và tại Phòng Công tác Sinh viên.</p>', 'uploads/tintuc/HB8_1781674806938_584612889.jpg', 'Thong bao', 'Tin noi bat', 3, 'Da xuat ban', '2025-07-14 19:00:00', 3, 1, '2026-06-16 17:27:22', '2026-06-17 05:40:08'),
(18, 'Lễ kỷ niệm 10 năm thành lập Quỹ Phát triển TVU — Hành trình một thập kỷ đồng hành', 'Quỹ Phát triển TVU long trọng tổ chức Lễ kỷ niệm 10 năm thành lập với sự tham dự của hơn 500 khách mời, trong đó có nhiều cựu sinh viên từng nhận học bổng nay đã thành công và quay lại đóng góp cho Quỹ.', '<p>Ngày 05/10/2025, Quỹ Phát triển TVU long trọng tổ chức Lễ kỷ niệm 10 năm thành lập tại Hội trường lớn Trường Đại học Trà Vinh. Buổi lễ có sự tham dự của hơn 500 khách mời gồm Ban Giám hiệu, nhà tài trợ, đối tác doanh nghiệp và đặc biệt là nhiều cựu sinh viên từng nhận học bổng TVU nay đã thành công và quay lại đóng góp. Trong 10 năm qua, Quỹ đã hỗ trợ hơn 2.000 sinh viên với tổng giá trị hơn 25 tỷ đồng.</p>', 'uploads/tintuc/dhtv2_1781674787060_346562126.jpg', 'Su kien', 'Tin noi bat', 2, 'Da xuat ban', '2025-10-04 18:00:00', 3, 1, '2026-06-16 17:27:22', '2026-06-17 05:39:51'),
(19, 'TVU tiếp nhận hơn 3 tỷ đồng tài trợ học bổng từ các doanh nghiệp năm 2026', 'Hơn 20 doanh nghiệp đã ký kết đồng hành cùng Quỹ TVU với tổng giá trị tài trợ vượt 3 tỷ đồng nhằm hỗ trợ sinh viên trong năm học mới.', '<p>Ngày 12/01/2026, Trường Đại học Trà Vinh tổ chức chương trình ký kết hợp tác cùng các doanh nghiệp trong và ngoài tỉnh. Tổng kinh phí tài trợ hơn 3 tỷ đồng sẽ được sử dụng để trao học bổng khuyến học, học bổng vượt khó và hỗ trợ các đề tài nghiên cứu khoa học của sinh viên trong giai đoạn 2026-2027. Chương trình đánh dấu bước phát triển mạnh mẽ của Quỹ TVU trong việc kết nối nguồn lực xã hội.</p>', 'uploads/tintuc/HB3_1781667580513_379818869.jpg', 'Tin hoc bong', 'Tin moi', 1, 'Da xuat ban', '2026-01-11 11:30:00', 3, 1, '2026-06-16 17:46:51', '2026-06-17 03:39:45'),
(20, 'Lễ tuyên dương 200 sinh viên đạt thành tích học tập xuất sắc toàn trường', '200 sinh viên được tuyên dương và nhận giấy khen cùng học bổng trong lễ tổng kết năm học.', '<p>Nhằm ghi nhận những nỗ lực trong học tập và rèn luyện, Trường Đại học Trà Vinh tổ chức lễ tuyên dương 200 sinh viên xuất sắc. Ngoài giấy khen và học bổng, các sinh viên còn được gặp gỡ các doanh nghiệp để tìm hiểu cơ hội thực tập và việc làm sau tốt nghiệp.</p>', 'uploads/tintuc/HB-2_1781667011641_195193965.jpg', 'Tin giao duc', 'Tin moi', 2, 'Da xuat ban', '2026-02-14 19:00:00', 3, 1, '2026-06-16 17:46:51', '2026-06-17 03:30:22'),
(21, 'Quỹ TVU phát động chương trình \"Tiếp sức đến trường\" năm 2026', 'Chương trình vận động quyên góp nhằm hỗ trợ tân sinh viên có hoàn cảnh khó khăn trước thềm năm học mới.', '<p>Quỹ Phát triển TVU chính thức phát động chương trình \"Tiếp sức đến trường\" với mục tiêu trao hơn 300 suất hỗ trợ cho tân sinh viên. Chương trình kêu gọi sự chung tay của doanh nghiệp, cựu sinh viên và các tổ chức xã hội nhằm giúp các em yên tâm bước vào giảng đường đại học.</p>', 'uploads/tintuc/HB-tieuso_1781667088111_777112698.jpg', 'Su kien', 'Tin moi', 2, 'Da xuat ban', '2026-03-04 18:00:00', 3, 1, '2026-06-16 17:46:51', '2026-06-17 03:31:30'),
(22, 'TVU triển khai Quỹ hỗ trợ nghiên cứu khoa học dành cho sinh viên', 'Nhà trường dành nguồn kinh phí riêng để hỗ trợ các đề tài nghiên cứu có tính ứng dụng cao.', '<p>Từ năm 2026, Quỹ TVU triển khai chương trình hỗ trợ nghiên cứu khoa học với mức kinh phí từ 10 đến 50 triệu đồng cho mỗi đề tài. Sinh viên có ý tưởng sáng tạo sẽ được hướng dẫn hoàn thiện hồ sơ và tham gia xét duyệt theo từng đợt trong năm.</p>', 'uploads/tintuc/HB-vuotkho_1781667063892_236824022.jpg', 'Tin giao duc', 'Tin moi', 3, 'Da xuat ban', '2026-03-19 19:30:00', 3, 1, '2026-06-16 17:46:51', '2026-06-17 03:31:06'),
(23, 'Thông báo tiếp nhận hồ sơ học bổng doanh nghiệp học kỳ II năm học 2025-2026', 'Sinh viên đủ điều kiện có thể đăng ký học bổng doanh nghiệp từ ngày 01/04 đến 20/04/2026.', '<p>Phòng Công tác Sinh viên thông báo tiếp nhận hồ sơ học bổng do các doanh nghiệp tài trợ. Chương trình ưu tiên sinh viên có thành tích học tập tốt, tích cực tham gia hoạt động phong trào và có hoàn cảnh khó khăn.</p>', 'uploads/tintuc/HB6_1781667620646_597845464.jpg', 'Thong bao', 'Tin moi', 3, 'Da xuat ban', '2026-03-31 18:00:00', 3, 1, '2026-06-16 17:46:51', '2026-06-17 03:40:22'),
(24, 'Cựu sinh viên TVU trao tặng Quỹ học bổng trị giá 800 triệu đồng', 'Nhiều cựu sinh viên thành đạt quay trở về trường đóng góp cho Quỹ phát triển TVU.', '<p>Trong chương trình Gặp mặt cựu sinh viên năm 2026, nhiều cựu sinh viên đã trao tặng tổng cộng 800 triệu đồng cho Quỹ học bổng TVU. Nguồn kinh phí sẽ được sử dụng để hỗ trợ sinh viên nghèo vượt khó và trao học bổng khuyến học trong các học kỳ tiếp theo.</p>', 'uploads/tintuc/HB5_1781667653396_329955300.jpg', 'Tin hoc bong', 'Tin moi', 2, 'Da xuat ban', '2026-04-17 19:00:00', 3, 1, '2026-06-16 17:46:51', '2026-06-17 03:41:01'),
(25, 'TVU tổ chức Ngày hội Nhà tài trợ và Sinh viên năm 2026', 'Sự kiện quy tụ hơn 40 doanh nghiệp và hàng nghìn sinh viên tham gia giao lưu, kết nối.', '<p>Ngày hội Nhà tài trợ và Sinh viên năm 2026 là dịp để doanh nghiệp gặp gỡ sinh viên, giới thiệu các chương trình học bổng, thực tập và tuyển dụng. Đồng thời, Quỹ TVU cũng công bố nhiều chương trình hỗ trợ mới nhằm khuyến khích sinh viên học tập, nghiên cứu và khởi nghiệp.</p>', 'uploads/tintuc/HB4_1781667769658_17740821.jpg', 'Su kien', 'Tin moi', 1, 'Da xuat ban', '2026-05-09 18:00:00', 3, 1, '2026-06-16 17:46:51', '2026-06-17 03:42:53');

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
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  ADD PRIMARY KEY (`danhgia_id`),
  ADD KEY `nguoidung_id` (`nguoidung_id`),
  ADD KEY `nguoiduyet_id` (`nguoiduyet_id`);

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
-- Chỉ mục cho bảng `phanbongansach`
--
ALTER TABLE `phanbongansach`
  ADD PRIMARY KEY (`phanbongansach_id`),
  ADD KEY `quy_nguon_id` (`quy_nguon_id`),
  ADD KEY `quy_dich_id` (`quy_dich_id`),
  ADD KEY `nguoi_de_xuat_id` (`nguoi_de_xuat_id`),
  ADD KEY `nguoi_duyet_id` (`nguoi_duyet_id`);

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
  ADD KEY `nguoitao_id` (`nguoitao_id`),
  ADD KEY `fk_quy_parent` (`quy_cha_id`);

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
-- Chỉ mục cho bảng `tintuc`
--
ALTER TABLE `tintuc`
  ADD PRIMARY KEY (`tintuc_id`),
  ADD KEY `idx_trangthai` (`trangthai`),
  ADD KEY `idx_danhmuc` (`danhmuc`),
  ADD KEY `idx_noi_bat` (`lanoibat`),
  ADD KEY `idx_ngayxuatban` (`ngayxuatban`),
  ADD KEY `idx_nguoitao` (`nguoitao_id`),
  ADD KEY `nguoisua_id` (`nguoisua_id`);

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
-- AUTO_INCREMENT cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  MODIFY `danhgia_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Mã đánh giá';

--
-- AUTO_INCREMENT cho bảng `donvihoc`
--
ALTER TABLE `donvihoc`
  MODIFY `donvihoc_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `giaodich`
--
ALTER TABLE `giaodich`
  MODIFY `giaodich_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `guest_khoantaitro`
--
ALTER TABLE `guest_khoantaitro`
  MODIFY `guest_khoantaitro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `guest_yeucauhotro`
--
ALTER TABLE `guest_yeucauhotro`
  MODIFY `guest_yeucauhotro_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `khoantaitro`
--
ALTER TABLE `khoantaitro`
  MODIFY `khoantaitro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `loaiquy`
--
ALTER TABLE `loaiquy`
  MODIFY `loaiquy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `nguoidung_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `nhataitro`
--
ALTER TABLE `nhataitro`
  MODIFY `nhataitro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `nhatkyhethong`
--
ALTER TABLE `nhatkyhethong`
  MODIFY `nhatkyhethong_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT cho bảng `phanbongansach`
--
ALTER TABLE `phanbongansach`
  MODIFY `phanbongansach_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `pheduyet`
--
ALTER TABLE `pheduyet`
  MODIFY `pheduyet_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `quy`
--
ALTER TABLE `quy`
  MODIFY `quy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `sinhviennoibat`
--
ALTER TABLE `sinhviennoibat`
  MODIFY `sinhviennoibat_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `taikhoannganhang`
--
ALTER TABLE `taikhoannganhang`
  MODIFY `taikhoannganhang_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `tintuc`
--
ALTER TABLE `tintuc`
  MODIFY `tintuc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT cho bảng `vaitro`
--
ALTER TABLE `vaitro`
  MODIFY `vaitro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `yeucauhotro`
--
ALTER TABLE `yeucauhotro`
  MODIFY `yeucauhotro_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  ADD CONSTRAINT `danhgia_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `danhgia_ibfk_2` FOREIGN KEY (`nguoiduyet_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
-- Các ràng buộc cho bảng `phanbongansach`
--
ALTER TABLE `phanbongansach`
  ADD CONSTRAINT `phanbongansach_ibfk_1` FOREIGN KEY (`quy_nguon_id`) REFERENCES `quy` (`quy_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `phanbongansach_ibfk_2` FOREIGN KEY (`quy_dich_id`) REFERENCES `quy` (`quy_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `phanbongansach_ibfk_3` FOREIGN KEY (`nguoi_de_xuat_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `phanbongansach_ibfk_4` FOREIGN KEY (`nguoi_duyet_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE;

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
  ADD CONSTRAINT `fk_quy_parent` FOREIGN KEY (`quy_cha_id`) REFERENCES `quy` (`quy_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `quy_ibfk_1` FOREIGN KEY (`loaiquy_id`) REFERENCES `loaiquy` (`loaiquy_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `quy_ibfk_2` FOREIGN KEY (`nguoitao_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `sinhviennoibat`
--
ALTER TABLE `sinhviennoibat`
  ADD CONSTRAINT `sinhviennoibat_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `taikhoannganhang`
--
ALTER TABLE `taikhoannganhang`
  ADD CONSTRAINT `taikhoannganhang_ibfk_1` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `tintuc`
--
ALTER TABLE `tintuc`
  ADD CONSTRAINT `tintuc_ibfk_1` FOREIGN KEY (`nguoitao_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tintuc_ibfk_2` FOREIGN KEY (`nguoisua_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
