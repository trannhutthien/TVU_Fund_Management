-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 14, 2026 lúc 06:16 PM
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
-- Cấu trúc bảng cho bảng `nguoidung`
--

DROP TABLE IF EXISTS `nguoidung`;
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
(3, 'canboquy@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Le Van Can Bo Mod', 'CB001', NULL, NULL, NULL, NULL, 3, NULL, 3, NULL, 'Hoat dong', '2026-06-02 11:40:34', '2026-06-14 15:02:18', NULL),
(4, 'sinhvien@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Nguyễn Văn Sinh Viên', 'SV001', NULL, NULL, NULL, NULL, 4, NULL, 4, 'Sinh vien', 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 13:35:12', 4),
(5, 'nhataitro@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Công ty Cổ phần Nhà tài trợ TVU', 'NTT001', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'Nha tai tro', 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 12:50:47', NULL),
(6, 'dienmayxanh@gmail.com', '$2b$10$oRlqjqBdw3W5Um/hSsI9huELwoEjTT7HQw3AzPxqfEY3HyU.JO8Zy', 'Điện máy xinh TV', 'NTT1781224561828', NULL, NULL, '0782884717', NULL, 5, NULL, 4, 'Nha tai tro', 'Hoat dong', '2026-06-12 00:36:01', '2026-06-12 00:36:01', NULL),
(7, 'can@gmail.com', '$2b$10$98fgzJPfOLf7wu6kVuVkEelYl6wGXdzgairpUlyPpPeE1Gry0O.g2', 'Lê minh cần', '110122172', NULL, NULL, NULL, NULL, 6, NULL, 4, 'Sinh vien', 'Hoat dong', '2026-06-12 00:40:22', '2026-06-12 00:57:43', 8),
(8, 'trannhutthien012345@gmail.com', NULL, 'thiên nhựt', 'GG1781228341312', NULL, NULL, NULL, NULL, NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJxVSoZLkHbaHj8WQQ6GsObHn6yvmm8vQXbM4x44P-Cay05Lm3N=s96-c', 4, 'Sinh vien', 'Hoat dong', '2026-06-12 01:39:01', '2026-06-12 01:39:01', NULL),
(9, 'anhben3122@gmail.com', '$2b$10$3u16nHWGUCFpxIn0nW.6suF9.RfBE/bMu7m6/elaTjkFcGw2YBSBu', 'Thạch Phan dựng', '110122678', NULL, NULL, '0397942310', NULL, 7, NULL, 4, 'Sinh vien', 'Hoat dong', '2026-06-13 15:19:44', '2026-06-13 15:19:44', 9),
(10, 'kimhong@gmail.com', '$2b$10$r7IaNPAS.qOrop01N840I.N3v35l7FlG1H208X47O1P0ehp0XW6CW', 'trần thị kim hồng', '123456789', NULL, NULL, '0789456323', 'ấp 10 long hữu duyên hải trà vinh', NULL, NULL, 2, NULL, 'Hoat dong', '2026-06-14 15:31:32', '2026-06-14 15:31:32', NULL),
(11, 'vanthang@gmail.com', '$2b$10$2LhNMT3j/MvupgGhHqz4UukNAibYsvk8PZoQEzGCvx9qlfQxVl6MK', 'trần Văn Thắng', '1234567654', NULL, NULL, '12345678902', 'ấp 10 long hữu duyên hải trà vinh', NULL, NULL, 2, NULL, 'Hoat dong', '2026-06-14 15:38:41', '2026-06-14 15:38:41', NULL),
(12, 'nhutkhanh@gmail.com', '$2b$10$sBgjPxChmNL537gH5z/4..UN1JsoBlnEcl97T0QWi8SloSu/dZyOm', 'Trần Nhựt khánh', '0987654321', NULL, NULL, '1324534657', 'ấp 11 xã long hữu thị xã duyên hải trà vinh', NULL, NULL, 3, NULL, 'Hoat dong', '2026-06-14 15:44:40', '2026-06-14 15:44:40', NULL),
(13, 'nhutquang@gmail.com', '$2b$10$MiplL/COBpXVKAYvbl3itOqX52FuTYTFQpIyjndO.oXxXndbSDdkC', 'Trần Nhựt Quang', '0987654321', NULL, NULL, NULL, 'ấp 11 xã long hữu thị xã duyên hải trà vinh', NULL, NULL, 3, NULL, 'Hoat dong', '2026-06-14 15:45:41', '2026-06-14 15:45:41', NULL),
(14, 'tansang@gmail.com', '$2b$10$73KPQ8uXsV8VT.mgeO/Sm.TAxILHvdWLmXKd8Tj/OyBiHyLWargCW', 'Nguyễn tấn sang', '233135432345', NULL, NULL, '09382736382', 'âp 12 xã long hữu thị xã duyên hải tỉnh trà vinh', NULL, NULL, 3, NULL, 'Hoat dong', '2026-06-14 15:51:45', '2026-06-14 15:51:45', NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

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
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `nguoidung_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD CONSTRAINT `fk_nguoidung_donvihoc` FOREIGN KEY (`donvihoc_id`) REFERENCES `donvihoc` (`donvihoc_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_nguoidung_taikhoannganhang` FOREIGN KEY (`taikhoannganhang_id`) REFERENCES `taikhoannganhang` (`taikhoannganhang_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `nguoidung_ibfk_1` FOREIGN KEY (`vaitro_id`) REFERENCES `vaitro` (`vaitro_id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
