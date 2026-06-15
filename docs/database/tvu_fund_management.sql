-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 15, 2026 lúc 09:05 PM
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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tintuc`
--

DROP TABLE IF EXISTS `tintuc`;
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
(10, 'Thông báo mở đăng ký Quỹ Hỗ trợ Sinh viên Khó khăn năm 2026', 'Sinh viên có hoàn cảnh khó khăn có thể nộp hồ sơ trực tuyến từ ngày 01/08/2026.', '<p>Nhà trường chính thức mở tiếp nhận hồ sơ đăng ký Quỹ Hỗ trợ Sinh viên Khó khăn. Sinh viên vui lòng chuẩn bị đầy đủ giấy tờ và nộp hồ sơ đúng thời hạn.</p>', 'uploads/tintuc/HB-tieuso_1781548503878_996005885.jpg', 'Thong bao', 'Tin moi', 3, 'Da xuat ban', '2026-06-15 11:34:00', 1, NULL, '2026-06-15 18:35:08', '2026-06-15 18:42:50'),
(11, 'Trao 100 suất học bổng khuyến học cho sinh viên xuất sắc', 'Chương trình học bổng khuyến học học kỳ II năm học 2025-2026', '<p>Trường Đại học Trà Vinh đã trao 100 suất học bổng cho các sinh viên có thành tích học tập xuất sắc.</p>', 'uploads/tintuc/HB-hk2-2025_1781548781011_48626826.jpg', 'Tin hoc bong', 'Tin moi', 1, 'Da xuat ban', '2026-06-15 11:39:00', 1, NULL, '2026-06-15 18:39:44', '2026-06-15 18:39:44');

--
-- Chỉ mục cho các bảng đã đổ
--

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
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `tintuc`
--
ALTER TABLE `tintuc`
  MODIFY `tintuc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `tintuc`
--
ALTER TABLE `tintuc`
  ADD CONSTRAINT `tintuc_ibfk_1` FOREIGN KEY (`nguoitao_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `tintuc_ibfk_2` FOREIGN KEY (`nguoisua_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
