-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 17, 2026 lúc 05:16 PM
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

--
-- Đang đổ dữ liệu cho bảng `danhgia`
--

INSERT INTO `danhgia` (`danhgia_id`, `nguoidung_id`, `hoten`, `khoa`, `nienkhoa`, `avatar`, `noidung`, `trangthai`, `lydotuchoi`, `nguoiduyet_id`, `ngayduyet`, `noibat`, `thutu`, `ngaycapnhat`, `ngaytao`) VALUES
(1, 13, 'Ha Văn Khâu', 'DA22TSA', NULL, 'http://localhost:5001/uploads/avatars/staffs/khau_1781677025608_155195514.jpg', '**\"Em thật sự biết ơn Quỹ Phát triển Trường Đại học Trà Vinh đã trao cho em cơ hội tiếp tục con đường học tập. Khoản hỗ trợ không chỉ giúp em trang trải một phần học phí và chi phí sinh hoạt mà còn là nguồn động viên rất lớn để em cố gắng hơn mỗi ngày. Em cảm nhận được sự quan tâm của Nhà trường, các doanh nghiệp và những nhà hảo tâm luôn đồng hành cùng sinh viên có hoàn cảnh khó khăn. Em sẽ nỗ lực học tập, rèn luyện thật tốt để không phụ lòng tin của mọi người và hy vọng sau khi tốt nghiệp sẽ c', 'Da duyet', NULL, 3, '2026-06-17 14:41:44', 0, 0, '2026-06-17 14:41:44', '2026-06-17 14:40:34'),
(2, 12, 'Nguyễn Minh cần', 'DA22DCNA', '2022- 2026', 'http://localhost:5001/uploads/avatars/staffs/can_1781676538644_207500683.jpg', '\"Trước đây em đã nhiều lần lo lắng vì hoàn cảnh gia đình khó khăn, có lúc tưởng chừng phải tạm dừng việc học để phụ giúp ba mẹ. May mắn nhận được sự hỗ trợ từ Quỹ Phát triển Trường Đại học Trà Vinh, em có thêm điều kiện để tiếp tục theo đuổi ước mơ của mình. Sự giúp đỡ này không chỉ mang giá trị về vật chất mà còn tiếp thêm cho em niềm tin và động lực để cố gắng học tập, rèn luyện bản thân. Em xin gửi lời cảm ơn chân thành đến Nhà trường, Quỹ và các nhà tài trợ đã luôn quan tâm, đồng hành cùng', 'Da duyet', NULL, 3, '2026-06-17 14:45:52', 1, 0, '2026-06-17 14:45:54', '2026-06-17 14:44:34');

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
(6, 'DV1781224822891449', 'DA22DCNA', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-06-12 00:40:22'),
(7, 'DV1781363984429603', 'Nông nghiện Thủy sản', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-06-13 15:19:44'),
(8, 'DV1781632337433491', 'DA22TTA', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-06-16 17:52:17'),
(9, 'DV1781675035212920', 'DÁ22TSB', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-06-17 05:43:55'),
(10, 'DV1781677016600865', 'DA22TSA', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-06-17 06:16:56'),
(11, 'DV178167723062195', 'DA22TTC', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-06-17 06:20:30');

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
(4, NULL, 4, NULL, 30000000.00, 'Chuyen khoan', NULL, 'uploads/documents/ERD_1781682785803_162627670.png', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'Duyệt khoản tài trợ #32', 2, '2026-06-17 07:53:05', '2026-06-17 07:53:05'),
(5, NULL, 12, NULL, 80000000.00, 'Chuyen khoan', NULL, 'uploads/documents/cccd_1781682796451_586872476.jpg', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'Duyệt khoản tài trợ #31', 2, '2026-06-17 07:53:16', '2026-06-17 07:53:16'),
(6, NULL, 5, NULL, 100000000.00, 'Chuyen khoan', NULL, 'uploads/documents/cccdms_1781682812200_43481673.jpg', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'đủ yêu cầu', 2, '2026-06-17 07:53:32', '2026-06-17 07:53:32'),
(7, NULL, 8, NULL, 200000000.00, 'Chuyen khoan', NULL, 'uploads/documents/cccdms_1781682832121_892772731.jpg', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'đủ yêu cầu', 2, '2026-06-17 07:53:52', '2026-06-17 07:53:52'),
(8, NULL, 7, NULL, 300000000.00, 'Chuyen khoan', NULL, 'uploads/documents/cccd_1781682845330_419727864.jpg', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'đủ yêu cầu', 2, '2026-06-17 07:54:05', '2026-06-17 07:54:05'),
(9, NULL, 11, NULL, 120000000.00, 'Chuyen khoan', NULL, NULL, 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'Duyệt khoản tài trợ #28', 2, '2026-06-17 07:54:16', '2026-06-17 07:54:16'),
(10, NULL, 9, NULL, 80000000.00, 'Chuyen khoan', NULL, NULL, 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'Duyệt khoản tài trợ #27', 2, '2026-06-17 07:54:19', '2026-06-17 07:54:19'),
(11, NULL, 6, NULL, 500000000.00, 'Chuyen khoan', NULL, NULL, 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'Duyệt khoản tài trợ #19', 2, '2026-06-17 07:54:21', '2026-06-17 07:54:21'),
(12, 13, 9, 15, 20000000.00, 'Chuyen khoan', NULL, 'uploads/documents/cccdms_1781686735641_906820919.jpg', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'đủ yêu cầu', 2, '2026-06-17 08:58:55', '2026-06-17 08:58:55'),
(13, 12, 12, 14, 16000000.00, 'Chuyen khoan', NULL, 'uploads/documents/cccdms_1781686748942_37458525.jpg', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'đủ yêu cầu', 2, '2026-06-17 08:59:08', '2026-06-17 08:59:08'),
(14, 11, 6, 13, 15000000.00, 'Chuyen khoan', NULL, 'uploads/documents/cccdms_1781686762267_873499184.jpg', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'đủ yêu cầu', 2, '2026-06-17 08:59:22', '2026-06-17 08:59:22'),
(15, 10, 7, 12, 10000000.00, 'Chuyen khoan', NULL, 'uploads/documents/cccdms_1781686776363_560873193.jpg', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'đủ yêu cầu', 2, '2026-06-17 08:59:36', '2026-06-17 08:59:36');

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
(18, 14, 6, 500000000.00, 'Chuyen khoan', 'FPT-TVU-2025-001', '2025-01-15', '/uploads/chungtu/fpt-tvu-001.pdf', 'Cho duyet', 'Đợt 1 giải ngân năm 2025 theo hợp đồng tài trợ 3 năm FPT-TVU', NULL, NULL, '2026-06-17 07:52:35', '2026-06-17 07:52:35'),
(19, 14, 6, 500000000.00, 'Chuyen khoan', 'FPT-TVU-2025-002', '2025-07-15', '/uploads/chungtu/fpt-tvu-002.pdf', 'Da nhan', 'đủ yêu cầu', 1, '2026-06-17 07:56:16', '2026-06-17 07:52:35', '2026-06-17 07:56:16'),
(20, 15, 7, 300000000.00, 'Chuyen khoan', 'ACB-TVU-2025-001', '2025-03-10', '/uploads/chungtu/acb-tvu-001.pdf', 'Cho duyet', 'Khoản tài trợ học kỳ 1 năm học 2025-2026 từ chương trình ACB đồng hành', NULL, NULL, '2026-06-17 07:52:35', '2026-06-17 07:52:35'),
(21, 15, 7, 300000000.00, 'Chuyen khoan', 'ACB-TVU-2025-002', '2025-08-05', 'uploads/documents/cccd_1781682845330_419727864.jpg', 'Da nhan', 'đủ yêu cầu', 1, '2026-06-17 07:56:12', '2026-06-17 07:52:35', '2026-06-17 07:56:12'),
(22, 16, 4, 150000000.00, 'Chuyen khoan', 'XDTV-TVU-2025-001', '2025-02-20', '/uploads/chungtu/xdtv-001.pdf', 'Cho duyet', 'Tài trợ thường niên từ Công ty Xây dựng Trà Vinh cho Quỹ hỗ trợ sinh viên vượt khó', NULL, NULL, '2026-06-17 07:52:35', '2026-06-17 07:52:35'),
(23, 17, 4, 200000000.00, 'Chuyen khoan', 'THIENTAM-TVU-2025-001', '2025-04-01', '/uploads/chungtu/thientam-001.pdf', 'Cho duyet', 'Quỹ Thiện Tâm Vingroup tài trợ đợt 1 cho Quỹ hỗ trợ sinh viên vượt khó TVU', NULL, NULL, '2026-06-17 07:52:35', '2026-06-17 07:52:35'),
(24, 18, 4, 50000000.00, 'Chuyen khoan', 'NMT-TVU-2025-001', '2025-05-15', '/uploads/chungtu/nmt-001.pdf', 'Cho duyet', 'Đóng góp cá nhân từ cựu sinh viên Nguyễn Minh Tuấn nhân dịp 10 năm tốt nghiệp', NULL, NULL, '2026-06-17 07:52:35', '2026-06-17 07:52:35'),
(25, 19, 5, 100000000.00, 'Tien mat', 'COOPMART-TVU-2025-001', '2025-09-10', 'uploads/documents/cccdms_1781682812200_43481673.jpg', 'Da nhan', 'đủ yêu cầu', 1, '2026-06-17 07:56:04', '2026-06-17 07:52:35', '2026-06-17 07:56:04'),
(26, 20, 9, 30000000.00, 'Chuyen khoan', 'TTBN-TVU-2025-001', '2025-03-25', '/uploads/chungtu/ttbn-001.pdf', 'Cho duyet', 'Đóng góp cá nhân từ bà Trần Thị Bích Ngọc cho Quỹ hỗ trợ chi phí y tế sinh viên', NULL, NULL, '2026-06-17 07:52:35', '2026-06-17 07:52:35'),
(27, 21, 9, 80000000.00, 'Chuyen khoan', 'TVPHARMA-TVU-2025-001', '2025-06-01', '/uploads/chungtu/tvpharma-001.pdf', 'Da duyet', 'Trà Vinh Pharma tài trợ thuốc và chi phí y tế cho sinh viên TVU bệnh hiểm nghèo năm 2025', NULL, NULL, '2026-06-17 07:52:35', '2026-06-17 07:54:19'),
(28, 22, 11, 120000000.00, 'Chuyen khoan', 'HCSV-TVU-2025-001', '2025-04-20', '/uploads/chungtu/hcsv-001.pdf', 'Da duyet', 'Hội cựu sinh viên TVU tại TP.HCM đóng góp tập thể cho Quỹ hỗ trợ sinh viên khởi nghiệp', NULL, NULL, '2026-06-17 07:52:35', '2026-06-17 07:54:16'),
(29, 23, 8, 200000000.00, 'Chuyen khoan', 'VCB-TVU-2025-001', '2025-08-20', 'uploads/documents/cccdms_1781682832121_892772731.jpg', 'Da nhan', 'đủ yêu cầu', 1, '2026-06-17 07:56:08', '2026-06-17 07:52:35', '2026-06-17 07:56:08'),
(30, 17, 10, 50000000.00, 'Chuyen khoan', 'THIENTAM-TVU-2025-002', '2025-05-01', '/uploads/chungtu/thientam-002.pdf', 'Cho duyet', 'Quỹ Thiện Tâm Vingroup hỗ trợ chương trình Sinh viên TVU Xanh bảo vệ môi trường', NULL, NULL, '2026-06-17 07:52:35', '2026-06-17 07:52:35'),
(31, 14, 12, 80000000.00, 'Chuyen khoan', 'FPT-TVU-2025-003', '2025-10-01', 'uploads/documents/cccd_1781682796451_586872476.jpg', 'Da nhan', 'FPT tài trợ cho giải thưởng Nghiên cứu Khoa học sinh viên TVU năm học 2025-2026', 1, '2026-06-17 07:55:55', '2026-06-17 07:52:35', '2026-06-17 07:55:55'),
(32, 19, 4, 30000000.00, 'Tien mat', NULL, '2025-10-15', 'uploads/documents/ERD_1781682785803_162627670.png', 'Da nhan', 'Co.opMart Trà Vinh trao trực tiếp tại lễ kỷ niệm 10 năm thành lập Quỹ TVU', 1, '2026-06-17 07:55:53', '2026-06-17 07:52:35', '2026-06-17 07:55:53');

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
(1, 'binh@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Nguyễn Văn Bình', 'ADMIN001', NULL, NULL, '0987654321', NULL, 1, NULL, 1, NULL, 'Hoat dong', '2026-06-02 11:40:34', '2026-06-17 05:42:54', NULL),
(2, 'ketoan@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Trần Thị Kế Toán', 'KT001', NULL, NULL, NULL, NULL, 2, NULL, 2, NULL, 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 11:54:44', NULL),
(3, 'canboquy@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Lê Văn Tùng', 'CB001', NULL, NULL, NULL, NULL, 3, NULL, 3, NULL, 'Hoat dong', '2026-06-02 11:40:34', '2026-06-17 08:55:44', NULL),
(4, 'sinhvien@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Nguyễn Văn Sinh Viên', 'SV001', NULL, NULL, NULL, NULL, 4, NULL, 4, 'Sinh vien', 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 13:35:12', NULL),
(5, 'nhataitro@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Công ty Cổ phần Nhà tài trợ TVU', 'NTT001', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'Nha tai tro', 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 12:50:47', NULL),
(10, 'minhkhang@gmail.com', '$2b$10$siiHzu.icCpEojPuZYTvN.whKhcwxgceFg8cTJDLsJy.6y1tDcmjm', 'Nguyễn Minh Khang', '110122001', NULL, NULL, '0912345678', NULL, 8, NULL, 4, 'Sinh vien', 'Hoat dong', '2026-06-16 17:52:17', '2026-06-16 17:53:08', 10),
(11, 'dung@gmail.com', '$2b$10$j5BbOprhj/NcNXNYH/JLLe4l0luZ9YhOmJ/nZ4m5nxuXxwPeyQT8a', 'Thạch Phan Dựng', '110122178', NULL, NULL, NULL, NULL, 9, 'uploads/avatars/staffs/dung_1781675085028_652949673.jpg', 4, 'Sinh vien', 'Hoat dong', '2026-06-17 05:43:55', '2026-06-17 05:44:45', 11),
(12, 'can@gmail.com', '$2b$10$y0l2hbvDOgYjgyTlRtiwCObJmPOb1CbZ0rDzClaOrZU8z.P4XDNj.', 'Nguyễn Minh cần', '110122174', NULL, NULL, NULL, NULL, 6, 'uploads/avatars/staffs/can_1781676538644_207500683.jpg', 4, 'Sinh vien', 'Hoat dong', '2026-06-17 06:08:43', '2026-06-17 06:09:38', 12),
(13, 'khau@gmail.com', '$2b$10$jbYEgbkCgoU57rpno6OBveBLwNzZpuhwcL87CkSsJYq0oNgG4ikGW', 'Ha Văn Khâu', '110122145', NULL, NULL, NULL, NULL, 10, 'uploads/avatars/staffs/khau_1781677025608_155195514.jpg', 4, 'Sinh vien', 'Hoat dong', '2026-06-17 06:16:56', '2026-06-17 06:17:34', 13),
(14, 'thong@gmail.com', '$2b$10$/k0hRvKz0tupjK4FUVnPFeoPKWgThxjzbt6TPtr1amUjS4eRVISnW', 'Nguyễn Quỳnh Thông', '110122156', NULL, NULL, NULL, NULL, 11, 'uploads/avatars/staffs/thong_1781677246966_590348501.jpg', 4, 'Sinh vien', 'Hoat dong', '2026-06-17 06:20:30', '2026-06-17 06:21:15', 14),
(15, 'thuy@gmail.com', '$2b$10$bMj6dky.ohKF8mtL.NjWI.2hqueL9uUWC0WhIwpkmNLk4nl9/Yw7W', 'Châu Ngọc Thúy', '110232542', NULL, NULL, NULL, NULL, 11, 'uploads/avatars/staffs/thuy_1781677453108_453803590.jpg', 4, 'Sinh vien', 'Hoat dong', '2026-06-17 06:24:04', '2026-06-17 06:24:33', 15),
(16, 'foundation@fpt.com.vn', '$2b$10$892fVvWh8ryEjBfXXwpvdu4hjcol1uUFiuBSC3YVdgIwIAC/PlGbu', 'Tập đoàn FPT', 'MST-0101684378', NULL, 'Khac', '02473008000', '17 Duy Tân, Cầu Giấy, Hà Nội', NULL, '/uploads/avatar/logo-fpt.png', 4, 'Nha tai tro', 'Hoat dong', '2026-06-17 06:38:30', '2026-06-17 06:45:13', NULL),
(17, 'csr@acb.com.vn', '$2b$10$892fVvWh8ryEjBfXXwpvdu4hjcol1uUFiuBSC3YVdgIwIAC/PlGbu', 'Ngân hàng TMCP Á Châu (ACB)', 'MST-0301452948', NULL, 'Khac', '02838247247', '442 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', NULL, '/uploads/avatar/logo-acb.png', 4, 'Nha tai tro', 'Hoat dong', '2026-06-17 06:38:30', '2026-06-17 06:45:13', NULL),
(18, 'lienhe@xdtravinhco.vn', '$2b$10$892fVvWh8ryEjBfXXwpvdu4hjcol1uUFiuBSC3YVdgIwIAC/PlGbu', 'Công ty TNHH Xây dựng Trà Vinh', 'MST-1300687412', NULL, 'Khac', '02943856789', '45 Nguyễn Đáng, Phường 1, TP Trà Vinh', NULL, '/uploads/avatar/logo-xd-travinh.png', 4, 'Nha tai tro', 'Hoat dong', '2026-06-17 06:38:30', '2026-06-17 06:45:13', NULL),
(19, 'thientam@vingroup.net', '$2b$10$892fVvWh8ryEjBfXXwpvdu4hjcol1uUFiuBSC3YVdgIwIAC/PlGbu', 'Quỹ Thiện Tâm — Vingroup', 'MST-0108801938', NULL, 'Khac', '02439743556', '458 Minh Khai, Hai Bà Trưng, Hà Nội', NULL, '/uploads/avatar/logo-thientam-vingroup.png', 4, 'Nha tai tro', 'Hoat dong', '2026-06-17 06:38:30', '2026-06-17 06:45:13', NULL),
(20, 'tuan.nguyen.alumni@gmail.com', '$2b$10$892fVvWh8ryEjBfXXwpvdu4hjcol1uUFiuBSC3YVdgIwIAC/PlGbu', 'Nguyễn Minh Tuấn', 'CMND-079082012345', '1988-05-20', 'Nam', '0912345678', '123 Lê Lợi, Phường 3, TP Trà Vinh', NULL, '/uploads/avatar/avatar-nguyen-minh-tuan.jpg', 4, 'Nha tai tro', 'Hoat dong', '2026-06-17 06:38:30', '2026-06-17 06:45:13', NULL),
(21, 'travinhcoopmart@saigonco.op.vn', '$2b$10$892fVvWh8ryEjBfXXwpvdu4hjcol1uUFiuBSC3YVdgIwIAC/PlGbu', 'Siêu thị Co.opMart Trà Vinh', 'MST-1300456789', NULL, 'Khac', '02943812345', '1 Đinh Tiên Hoàng, Phường 1, TP Trà Vinh', NULL, '/uploads/avatar/logo-coopmart.png', 4, 'Nha tai tro', 'Hoat dong', '2026-06-17 06:38:30', '2026-06-17 06:45:13', NULL),
(22, 'bichngoc.tran@yahoo.com', '$2b$10$892fVvWh8ryEjBfXXwpvdu4hjcol1uUFiuBSC3YVdgIwIAC/PlGbu', 'Trần Thị Bích Ngọc', 'CMND-082076054321', '1976-11-08', 'Nu', '0987654321', '78 Trần Phú, Phường 4, TP Trà Vinh', NULL, '/uploads/avatar/avatar-tran-thi-bich-ngoc.jpg', 4, 'Nha tai tro', 'Hoat dong', '2026-06-17 06:38:30', '2026-06-17 06:45:13', NULL),
(23, 'info@travinhpharma.vn', '$2b$10$892fVvWh8ryEjBfXXwpvdu4hjcol1uUFiuBSC3YVdgIwIAC/PlGbu', 'Công ty CP Dược phẩm Trà Vinh Pharma', 'MST-1300512367', NULL, 'Khac', '02943867890', '200 Nguyễn Thái Học, Phường 2, TP Trà Vinh', NULL, '/uploads/avatar/logo-travinh-pharma.png', 4, 'Nha tai tro', 'Hoat dong', '2026-06-17 06:38:30', '2026-06-17 06:45:13', NULL),
(24, 'hoicusinhvien.tvu.hcm@gmail.com', '$2b$10$892fVvWh8ryEjBfXXwpvdu4hjcol1uUFiuBSC3YVdgIwIAC/PlGbu', 'Hội Cựu sinh viên TVU tại TP.HCM', 'QD-HCS-TVU-HCM-2015', NULL, 'Khac', '0909123456', '55 Nguyễn Văn Cừ, Quận 5, TP.HCM', NULL, '/uploads/avatar/logo-hoi-cusinhvien.png', 4, 'Nha tai tro', 'Hoat dong', '2026-06-17 06:38:30', '2026-06-17 06:45:13', NULL),
(25, 'vcb.travinh@vietcombank.com.vn', '$2b$10$892fVvWh8ryEjBfXXwpvdu4hjcol1uUFiuBSC3YVdgIwIAC/PlGbu', 'Ngân hàng Vietcombank Chi nhánh Trà Vinh', 'MST-0100112437', NULL, 'Khac', '02943822222', '3 Lê Thánh Tôn, Phường 1, TP Trà Vinh', NULL, '/uploads/avatar/logo-vietcombank.png', 4, 'Nha tai tro', 'Hoat dong', '2026-06-17 06:38:30', '2026-06-17 06:45:13', NULL);

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
(14, 'Tập đoàn FPT', 'Doanh nghiep', 'foundation@fpt.com.vn', '02473008000', '17 Duy Tân, Cầu Giấy, Hà Nội', 'https://fpt.com.vn', 'Tập đoàn Công nghệ FPT — doanh nghiệp công nghệ hàng đầu Việt Nam, đồng hành cùng TVU Fund trong việc phát triển nhân tài ngành Công nghệ Thông tin.', NULL, 16, 'Hoat dong', '2026-06-17 06:38:39', '2026-06-17 06:38:39'),
(15, 'Ngân hàng TMCP Á Châu (ACB)', 'Doanh nghiep', 'csr@acb.com.vn', '02838247247', '442 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', 'https://acb.com.vn', 'Ngân hàng TMCP Á Châu với chương trình học bổng thường niên đồng hành cùng sinh viên TVU vượt khó học tốt nhiều năm liên tiếp.', NULL, 17, 'Hoat dong', '2026-06-17 06:38:39', '2026-06-17 06:38:39'),
(16, 'Công ty TNHH Xây dựng Trà Vinh', 'Doanh nghiep', 'lienhe@xdtravinhco.vn', '02943856789', '45 Nguyễn Đáng, Phường 1, TP Trà Vinh', NULL, 'Doanh nghiệp xây dựng uy tín tại tỉnh Trà Vinh, cam kết đóng góp hàng năm vào Quỹ hỗ trợ sinh viên vượt khó của TVU.', NULL, 18, 'Hoat dong', '2026-06-17 06:38:39', '2026-06-17 06:38:39'),
(17, 'Quỹ Thiện Tâm — Vingroup', 'To chuc', 'thientam@vingroup.net', '02439743556', '458 Minh Khai, Hai Bà Trưng, Hà Nội', 'https://thientam.com.vn', 'Quỹ Thiện Tâm thuộc Tập đoàn Vingroup — tổ chức từ thiện lớn nhất Việt Nam, hỗ trợ giáo dục và y tế cho học sinh sinh viên khó khăn trên toàn quốc.', NULL, 19, 'Hoat dong', '2026-06-17 06:38:39', '2026-06-17 06:38:39'),
(18, 'Nguyễn Minh Tuấn', 'Ca nhan', 'tuan.nguyen.alumni@gmail.com', '0912345678', '123 Lê Lợi, Phường 3, TP Trà Vinh', NULL, 'Cựu sinh viên TVU khóa 2010, hiện là Giám đốc Công ty Phần mềm TechVN, đóng góp thường xuyên cho Quỹ để tri ân alma mater.', NULL, 20, 'Hoat dong', '2026-06-17 06:38:39', '2026-06-17 06:38:39'),
(19, 'Siêu thị Co.opMart Trà Vinh', 'Doanh nghiep', 'travinhcoopmart@saigonco.op.vn', '02943812345', '1 Đinh Tiên Hoàng, Phường 1, TP Trà Vinh', 'https://coopmarttravinh.vn', 'Hệ thống siêu thị Co.opMart Trà Vinh đồng hành cùng Quỹ TVU trong các chương trình hỗ trợ sinh viên có hoàn cảnh khó khăn tại địa phương.', NULL, 21, 'Hoat dong', '2026-06-17 06:38:39', '2026-06-17 06:38:39'),
(20, 'Trần Thị Bích Ngọc', 'Ca nhan', 'bichngoc.tran@yahoo.com', '0987654321', '78 Trần Phú, Phường 4, TP Trà Vinh', NULL, 'Nhà hảo tâm tại TP Trà Vinh, thường xuyên đóng góp vào các quỹ hỗ trợ y tế và học bổng cho sinh viên nghèo vượt khó.', NULL, 22, 'Hoat dong', '2026-06-17 06:38:39', '2026-06-17 06:38:39'),
(21, 'Công ty CP Dược phẩm Trà Vinh Pharma', 'Doanh nghiep', 'info@travinhpharma.vn', '02943867890', '200 Nguyễn Thái Học, Phường 2, TP Trà Vinh', 'https://travinhpharma.vn', 'Công ty dược phẩm hàng đầu tỉnh Trà Vinh, tài trợ đặc biệt cho Quỹ hỗ trợ chi phí y tế sinh viên TVU gặp bệnh hiểm nghèo.', NULL, 23, 'Hoat dong', '2026-06-17 06:38:39', '2026-06-17 06:38:39'),
(22, 'Hội Cựu sinh viên TVU tại TP.HCM', 'To chuc', 'hoicusinhvien.tvu.hcm@gmail.com', '0909123456', '55 Nguyễn Văn Cừ, Quận 5, TP.HCM', NULL, 'Hội cựu sinh viên TVU tại TP.HCM quy tụ hàng trăm thành viên là cựu sinh viên thành đạt, cùng nhau đóng góp định kỳ cho Quỹ phát triển TVU.', NULL, 24, 'Hoat dong', '2026-06-17 06:38:39', '2026-06-17 06:38:39'),
(23, 'Ngân hàng Vietcombank Chi nhánh Trà Vinh', 'Doanh nghiep', 'vcb.travinh@vietcombank.com.vn', '02943822222', '3 Lê Thánh Tôn, Phường 1, TP Trà Vinh', 'https://vietcombank.com.vn', 'Vietcombank Chi nhánh Trà Vinh đồng hành cùng Quỹ TVU qua các chương trình học bổng và hỗ trợ sinh viên khởi nghiệp sáng tạo hàng năm.', NULL, 25, 'Hoat dong', '2026-06-17 06:38:39', '2026-06-17 06:38:39');

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
(76, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-16 17:12:10'),
(77, 1, 'DANG_XUAT', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-16 17:19:34'),
(78, 10, 'CAP_NHAT_THONG_TIN_NGUOI_DUNG', 'nguoidung', 10, '[Sinh viên] Nguyễn Minh Khang: Cập nhật thông tin tài khoản cho người dùng minhkhang@gmail.com (Họ tên: Nguyễn Minh Khang)', '{\"nguoidung_id\":10,\"masodinhdanh\":\"110122001\",\"hoten\":\"Nguyễn Minh Khang\",\"email\":\"minhkhang@gmail.com\",\"avatar\":null,\"sodienthoai\":null,\"diachi\":null,\"vaitro_id\":4,\"loaitaikhoan\":\"SINH_VIEN\",\"khoaphong\":\"DA22TTA\",\"trangthai\":\"HOAT_DONG\",\"ngaytao\":\"2026-06-16T17:52:17.000Z\",\"tenvaitro\":\"sinhvien\",\"mota_vaitro\":\"Người dùng (Sinh viên, Nhà tài trợ)\"}', '{\"ho_ten\":\"Nguyễn Minh Khang\",\"email\":\"minhkhang@gmail.com\",\"so_dien_thoai\":\"0912345678\",\"dia_chi\":null,\"khoa_phong\":\"DA22TTA\"}', '127.0.0.1', '2026-06-16 17:52:38'),
(79, 10, 'NOP_YEU_CAU_HO_TRO', 'yeucauhotro', 8, '[Sinh viên] Nguyễn Minh Khang: Nộp đơn xin hỗ trợ từ quỹ \'Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU\' với số tiền đề nghị: 12.000.000 VNĐ', NULL, '{\"nguoiDungId\":10,\"quyId\":12,\"lyDo\":\"**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**\\n**Độc lập – Tự do – Hạnh phúc**\\n***\\nTrà Vinh, ngày .... tháng .... năm ....\\n\\n**ĐƠN XIN HỖ TRỢ KINH PHÍ TỪ QUỸ KHEN THƯỞNG NGHIÊN CỨU KHOA HỌC SINH VIÊN TVU**\\n\\n**Kính gửi:**\\n*   Ban Giám hiệu Trường Đại học Trà Vinh;\\n*   Phòng Khoa học Công nghệ, Trường Đại học Trà Vinh;\\n*   Ban Quản lý Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU.\\n\\nEm tên là: [Họ và tên sinh viên]\\nNgày sinh: [Ngày/tháng/năm sinh]\\nMã số sinh viên: [MSSV]\\nLớp: [Tên lớp/Ngành học]\\nKhoa: [Tên Khoa]\\nSố điện thoại: [Số điện thoại liên hệ]\\nEmail: [Địa chỉ email]\\n\\nEm xin trình bày nội dung như sau:\\n\\nLà một sinh viên của Trường Đại học Trà Vinh, em luôn ý thức được tầm quan trọng của việc học tập gắn liền với nghiên cứu khoa học để phát triển bản thân và đóng góp cho cộng đồng. Với sự nỗ lực và niềm đam mê nghiên cứu, trong năm học [Năm học hiện tại], em đã mạnh dạn tham gia và hoàn thành xuất sắc đề tài nghiên cứu khoa học \\\"[Tên đề tài nghiên cứu của sinh viên]\\\" và vinh dự đạt được **Giải Nhất** tại cuộc thi Nghiên cứu Khoa học cấp [Trường/Tỉnh/Quốc gia] do [Đơn vị tổ chức cuộc thi] tổ chức. Thành tích này đã được Phòng Khoa học Công nghệ của Nhà trường xác nhận.\\n\\nKính thưa Quý Ban,\\nTrong quá trình thực hiện đề tài nghiên cứu khoa học, em đã dành rất nhiều thời gian, công sức và tâm huyết. Mặc dù luôn nhận được sự hướng dẫn tận tình từ giảng viên và sự hỗ trợ từ Nhà trường, nhưng việc cân bằng giữa lịch học chính khóa và yêu cầu của một đề tài nghiên cứu khoa học cũng đặt ra không ít thử thách và đòi hỏi sự chủ động cao về mọi mặt, bao gồm cả việc trang trải một phần chi phí phát sinh cho tài liệu, vật tư thí nghiệm hay in ấn tài liệu phục vụ nghiên cứu. Đây là những khó khăn mà bất kỳ sinh viên nào cũng có thể gặp phải khi dấn thân vào con đường nghiên cứu khoa học.\\n\\nEm hiểu rằng Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU được thành lập nhằm kịp thời động viên, khen thưởng và hỗ trợ kinh phí cho các sinh viên có thành tích xuất sắc trong nghiên cứu khoa học. Với giải Nhất mà em đã đạt được, em tha thiết làm đơn này kính mong Ban Quản lý Quỹ xem xét và hỗ trợ một phần kinh phí từ Quỹ.\\n\\nKhoản hỗ trợ này sẽ là nguồn động viên vô cùng to lớn, giúp em có thêm động lực để tiếp tục theo đuổi đam mê nghiên cứu khoa học, không ngừng học hỏi, sáng tạo và phát huy năng lực của bản thân trong tương lai. Em xin cam kết sẽ sử dụng nguồn kinh phí được hỗ trợ một cách hợp lý, đúng mục đích và hiệu quả nhất, góp phần vào thành tích chung của Nhà trường.\\n\\nEm xin chân thành cảm ơn sự quan tâm và tạo điều kiện của Ban Giám hiệu Nhà trường, Phòng Khoa học Công nghệ và Ban Quản lý Quỹ.\\n\\nKính mong Quý Ban xem xét và chấp thuận.\\n\\n**Kính đơn,**\\n\\n**(Ký và ghi rõ họ tên)**\\n[Họ và tên sinh viên]\",\"soTienDeNghi\":12000000,\"taiLieuDinhKem\":\"uploads/documents/cccdms_1781632952113_151923069.jpg\"}', '127.0.0.1', '2026-06-16 18:02:32'),
(80, 10, 'DANG_XUAT', 'nguoidung', 10, '[Sinh viên] Nguyễn Minh Khang: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-16 18:03:01'),
(81, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 03:22:38'),
(82, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 04:30:46'),
(83, 1, 'DANG_XUAT', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 04:37:24'),
(84, 10, 'DANG_NHAP', 'nguoidung', 10, '[Sinh viên] Nguyễn Minh Khang: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 04:38:17'),
(85, 10, 'DANG_XUAT', 'nguoidung', 10, '[Sinh viên] Nguyễn Minh Khang: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 05:29:40'),
(86, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Admin: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 05:30:05'),
(87, 1, 'API_CAP_NHAT', 'api', 12, '[Nhân viên hệ thống] Nguyễn Văn Admin: PUT /api/news/12 - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"PUT\",\"path\":\"/api/news/12\",\"statusCode\":200,\"durationMs\":19,\"params\":{\"id\":\"12\"},\"query\":{},\"body\":{\"title\":\"Hội thảo Kết nối Doanh nghiệp — Đồng hành cùng Sinh viên Trà Vinh 2025\",\"summary\":\"Quỹ TVU phối hợp tổ chức hội thảo kết nối nhà tài trợ và sinh viên, thu hút hơn 30 doanh nghiệp trong và ngoài tỉnh tham gia đăng ký đồng hành tài trợ học bổng giai đoạn 2025-2027.\",\"content\":\"<p>Ngày 20/5/2025, Quỹ Phát triển TVU tổ chức thành công Hội thảo Kết nối Doanh nghiệp — Đồng hành cùng Sinh viên Trà Vinh 2025. Hội thảo thu hút hơn 30 doanh nghiệp trong và ngoài tỉnh tham dự, cùng gần 200 sinh viên đại diện các khoa. Kết quả, 12 doanh nghiệp ký kết biên bản ghi nhớ với tổng giá trị cam kết tài trợ đạt hơn 2 tỷ đồng. Đây là hoạt động thường niên nhằm mở rộng mạng lưới nhà tài trợ bền vững cho sinh viên TVU.</p>\",\"avatar\":\"/uploads/tintuc/hoi-thao-ket-noi-2025.jpg\",\"category\":\"Su kien\",\"phanloai\":\"Tin noi bat\",\"status\":\"Da xuat ban\",\"publishDate\":\"2025-05-20T02:00:00.000Z\",\"lanoibat\":2}}', '127.0.0.1', '2026-06-17 05:36:51'),
(88, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Admin: POST /api/upload/news - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/news\",\"statusCode\":200,\"durationMs\":30,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:37:10'),
(89, 1, 'API_CAP_NHAT', 'api', 12, '[Nhân viên hệ thống] Nguyễn Văn Admin: PUT /api/news/12 - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"PUT\",\"path\":\"/api/news/12\",\"statusCode\":200,\"durationMs\":16,\"params\":{\"id\":\"12\"},\"query\":{},\"body\":{\"title\":\"Hội thảo Kết nối Doanh nghiệp — Đồng hành cùng Sinh viên Trà Vinh 2025\",\"summary\":\"Quỹ TVU phối hợp tổ chức hội thảo kết nối nhà tài trợ và sinh viên, thu hút hơn 30 doanh nghiệp trong và ngoài tỉnh tham gia đăng ký đồng hành tài trợ học bổng giai đoạn 2025-2027.\",\"content\":\"<p>Ngày 20/5/2025, Quỹ Phát triển TVU tổ chức thành công Hội thảo Kết nối Doanh nghiệp — Đồng hành cùng Sinh viên Trà Vinh 2025. Hội thảo thu hút hơn 30 doanh nghiệp trong và ngoài tỉnh tham dự, cùng gần 200 sinh viên đại diện các khoa. Kết quả, 12 doanh nghiệp ký kết biên bản ghi nhớ với tổng giá trị cam kết tài trợ đạt hơn 2 tỷ đồng. Đây là hoạt động thường niên nhằm mở rộng mạng lưới nhà tài trợ bền vững cho sinh viên TVU.</p>\",\"avatar\":\"uploads/tintuc/250_1781674629998_996093529.jpg\",\"category\":\"Su kien\",\"phanloai\":\"Tin noi bat\",\"status\":\"Da xuat ban\",\"publishDate\":\"2025-05-19T19:00:00.000Z\",\"lanoibat\":2}}', '127.0.0.1', '2026-06-17 05:37:12'),
(90, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Admin: POST /api/upload/news - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/news\",\"statusCode\":200,\"durationMs\":44,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:37:43'),
(91, 1, 'API_CAP_NHAT', 'api', 15, '[Nhân viên hệ thống] Nguyễn Văn Admin: PUT /api/news/15 - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"PUT\",\"path\":\"/api/news/15\",\"statusCode\":200,\"durationMs\":12,\"params\":{\"id\":\"15\"},\"query\":{},\"body\":{\"title\":\"Sinh viên TVU vượt khó: Hành trình từ mái nhà dột nát đến tấm bằng kỹ sư xuất sắc\",\"summary\":\"Câu chuyện của Nguyễn Văn An, sinh viên ngành Kỹ thuật Phần mềm khóa 2021, vượt qua hoàn cảnh cực kỳ khó khăn nhờ học bổng TVU Fund để tốt nghiệp loại giỏi và được nhận vào doanh nghiệp công nghệ hàng đầu.\",\"content\":\"<p>Sinh ra trong gia đình thuần nông tại huyện Cầu Ngang, Nguyễn Văn An từng nhiều lần nghĩ đến việc bỏ học vì gánh nặng học phí. Năm học thứ 2, An được Quỹ TVU cấp học bổng toàn phần trị giá 15 triệu đồng mỗi năm, đó là bước ngoặt thay đổi toàn bộ hành trình của cậu. Tốt nghiệp loại giỏi tháng 6/2025, An hiện làm việc tại công ty công nghệ tại TP.HCM và đã đăng ký trở thành nhà tài trợ nhỏ để đóng góp lại cho các thế hệ sinh viên tiếp theo.</p>\",\"avatar\":\"uploads/tintuc/153004-truong-dai-hoc-tra-vinh-ky-niem-ngay-nha-giao-viet-nam-va-trao-hoc-bong-cho-sinh-vien-vuot-kho-hoc-gioi_1781674663123_108544383.jpg\",\"category\":\"Tin hoc bong\",\"phanloai\":\"Tin noi bat\",\"status\":\"Da xuat ban\",\"publishDate\":\"2025-07-05T03:00:00.000Z\",\"lanoibat\":2}}', '127.0.0.1', '2026-06-17 05:37:45'),
(92, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Admin: POST /api/upload/news - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/news\",\"statusCode\":200,\"durationMs\":54,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:39:25'),
(93, 1, 'API_CAP_NHAT', 'api', 16, '[Nhân viên hệ thống] Nguyễn Văn Admin: PUT /api/news/16 - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"PUT\",\"path\":\"/api/news/16\",\"statusCode\":200,\"durationMs\":13,\"params\":{\"id\":\"16\"},\"query\":{},\"body\":{\"title\":\"Trường Đại học Trà Vinh ra mắt Chương trình học bổng toàn phần dành cho sinh viên khuyết tật\",\"summary\":\"Nhằm tạo cơ hội học tập bình đẳng, TVU Fund phối hợp Phòng Công tác Sinh viên chính thức ra mắt chương trình học bổng toàn phần dành riêng cho sinh viên khuyết tật năm học 2025-2026.\",\"content\":\"<p>Nhằm tạo cơ hội học tập bình đẳng cho tất cả sinh viên, Quỹ Phát triển TVU phối hợp cùng Phòng Công tác Sinh viên chính thức ra mắt chương trình học bổng toàn phần dành riêng cho sinh viên khuyết tật năm học 2025-2026. Chương trình hỗ trợ toàn bộ học phí, chi phí sinh hoạt và trang thiết bị học tập phù hợp. Sinh viên quan tâm liên hệ Phòng Công tác Sinh viên hoặc nộp hồ sơ trực tiếp trên hệ thống TVU Fund trước ngày 15/09/2025.</p>\",\"avatar\":\"uploads/tintuc/tvu-IMG_8704_1781674765127_566630775.png\",\"category\":\"Tin giao duc\",\"phanloai\":\"Tin noi bat\",\"status\":\"Da xuat ban\",\"publishDate\":\"2025-08-20T01:00:00.000Z\",\"lanoibat\":3}}', '127.0.0.1', '2026-06-17 05:39:27'),
(94, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Admin: POST /api/upload/news - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/news\",\"statusCode\":200,\"durationMs\":15,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:39:47'),
(95, 1, 'API_CAP_NHAT', 'api', 18, '[Nhân viên hệ thống] Nguyễn Văn Admin: PUT /api/news/18 - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"PUT\",\"path\":\"/api/news/18\",\"statusCode\":200,\"durationMs\":8,\"params\":{\"id\":\"18\"},\"query\":{},\"body\":{\"title\":\"Lễ kỷ niệm 10 năm thành lập Quỹ Phát triển TVU — Hành trình một thập kỷ đồng hành\",\"summary\":\"Quỹ Phát triển TVU long trọng tổ chức Lễ kỷ niệm 10 năm thành lập với sự tham dự của hơn 500 khách mời, trong đó có nhiều cựu sinh viên từng nhận học bổng nay đã thành công và quay lại đóng góp cho Quỹ.\",\"content\":\"<p>Ngày 05/10/2025, Quỹ Phát triển TVU long trọng tổ chức Lễ kỷ niệm 10 năm thành lập tại Hội trường lớn Trường Đại học Trà Vinh. Buổi lễ có sự tham dự của hơn 500 khách mời gồm Ban Giám hiệu, nhà tài trợ, đối tác doanh nghiệp và đặc biệt là nhiều cựu sinh viên từng nhận học bổng TVU nay đã thành công và quay lại đóng góp. Trong 10 năm qua, Quỹ đã hỗ trợ hơn 2.000 sinh viên với tổng giá trị hơn 25 tỷ đồng.</p>\",\"avatar\":\"uploads/tintuc/dhtv2_1781674787060_346562126.jpg\",\"category\":\"Su kien\",\"phanloai\":\"Tin noi bat\",\"status\":\"Da xuat ban\",\"publishDate\":\"2025-10-05T01:00:00.000Z\",\"lanoibat\":2}}', '127.0.0.1', '2026-06-17 05:39:51'),
(96, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Admin: POST /api/upload/news - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/news\",\"statusCode\":200,\"durationMs\":30,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:40:06'),
(97, 1, 'API_CAP_NHAT', 'api', 17, '[Nhân viên hệ thống] Nguyễn Văn Admin: PUT /api/news/17 - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"PUT\",\"path\":\"/api/news/17\",\"statusCode\":200,\"durationMs\":9,\"params\":{\"id\":\"17\"},\"query\":{},\"body\":{\"title\":\"TVU Fund công bố báo cáo tài chính minh bạch 6 tháng đầu năm 2025\",\"summary\":\"Quỹ Phát triển TVU công bố báo cáo tài chính 6 tháng đầu năm 2025 với tổng thu hơn 3,2 tỷ đồng và tổng chi hỗ trợ sinh viên đạt 1,8 tỷ đồng, đảm bảo nguyên tắc minh bạch và công khai.\",\"content\":\"<p>Thực hiện nguyên tắc minh bạch tài chính, Quỹ Phát triển TVU công bố báo cáo tài chính 6 tháng đầu năm 2025. Tổng thu đạt hơn 3,2 tỷ đồng từ các nguồn tài trợ doanh nghiệp, cá nhân và cựu sinh viên. Tổng chi hỗ trợ sinh viên đạt 1,8 tỷ đồng, giúp 187 sinh viên vượt qua khó khăn duy trì việc học. Báo cáo đầy đủ được công bố công khai trên hệ thống TVU Fund và tại Phòng Công tác Sinh viên.</p>\",\"avatar\":\"uploads/tintuc/HB8_1781674806938_584612889.jpg\",\"category\":\"Thong bao\",\"phanloai\":\"Tin noi bat\",\"status\":\"Da xuat ban\",\"publishDate\":\"2025-07-15T02:00:00.000Z\",\"lanoibat\":3}}', '127.0.0.1', '2026-06-17 05:40:08'),
(98, 1, 'CAP_NHAT_THONG_TIN_NGUOI_DUNG', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật thông tin tài khoản cho người dùng admin@tvu.edu.vn (Họ tên: Nguyễn Văn Admin)', '{\"nguoidung_id\":1,\"masodinhdanh\":\"ADMIN001\",\"hoten\":\"Nguyễn Văn Admin\",\"email\":\"admin@tvu.edu.vn\",\"avatar\":null,\"sodienthoai\":null,\"diachi\":null,\"vaitro_id\":1,\"loaitaikhoan\":null,\"khoaphong\":\"Ban Giám Hiệu\",\"trangthai\":\"HOAT_DONG\",\"ngaytao\":\"2026-06-02T11:40:34.000Z\",\"tenvaitro\":\"admin\",\"mota_vaitro\":\"Quản trị viên hệ thống\"}', '{\"ho_ten\":\"Nguyễn Văn Bình\",\"email\":\"binh@tvu.edu.vn\",\"so_dien_thoai\":\"0987654321\",\"dia_chi\":null,\"khoa_phong\":null}', '127.0.0.1', '2026-06-17 05:42:54'),
(99, 1, 'DANG_XUAT', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 05:43:06'),
(100, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/auth/register - tác động dữ liệu thành công (201)', NULL, '{\"method\":\"POST\",\"path\":\"/api/auth/register\",\"statusCode\":201,\"durationMs\":309,\"params\":{},\"query\":{},\"body\":{\"hoTen\":\"Thạch Phan Dựng\",\"mssv\":\"110122178\",\"lopKhoa\":\"DÁ22TSB\",\"email\":\"dung@gmail.com\",\"password\":\"[hidden]\",\"loaiTaiKhoan\":\"sinhvien\"}}', '127.0.0.1', '2026-06-17 05:43:55'),
(101, 11, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Thạch Phan Dựng: POST /api/bank-accounts - tác động dữ liệu thành công (201)', NULL, '{\"method\":\"POST\",\"path\":\"/api/bank-accounts\",\"statusCode\":201,\"durationMs\":9,\"params\":{},\"query\":{},\"body\":{\"soTaiKhoan\":\"189278367456\",\"tenNganHang\":\"BIDV\",\"chuTaiKhoan\":\"THAC PHAN DUNG\",\"laMacDinh\":true}}', '127.0.0.1', '2026-06-17 05:44:26'),
(102, 11, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Thạch Phan Dựng: POST /api/upload/avatar - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/avatar\",\"statusCode\":200,\"durationMs\":14,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:44:45'),
(103, 11, 'CAP_NHAT_THONG_TIN_NGUOI_DUNG', 'nguoidung', 11, '[Sinh viên] Thạch Phan Dựng: Cập nhật thông tin tài khoản cho người dùng dung@gmail.com (Họ tên: Thạch Phan Dựng)', '{\"nguoidung_id\":11,\"masodinhdanh\":\"110122178\",\"hoten\":\"Thạch Phan Dựng\",\"email\":\"dung@gmail.com\",\"avatar\":null,\"sodienthoai\":null,\"diachi\":null,\"vaitro_id\":4,\"loaitaikhoan\":\"SINH_VIEN\",\"khoaphong\":\"DÁ22TSB\",\"trangthai\":\"HOAT_DONG\",\"ngaytao\":\"2026-06-17T05:43:55.000Z\",\"tenvaitro\":\"sinhvien\",\"mota_vaitro\":\"Người dùng (Sinh viên, Nhà tài trợ)\"}', '{\"avatar\":\"uploads/avatars/staffs/dung_1781675085028_652949673.jpg\"}', '127.0.0.1', '2026-06-17 05:44:45'),
(104, 11, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Thạch Phan Dựng: POST /api/applications/ai-suggest - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/applications/ai-suggest\",\"statusCode\":200,\"durationMs\":13198,\"params\":{},\"query\":{},\"body\":{\"quyId\":4,\"action\":\"draft\",\"moTa\":\"vì hoàn cánh gia đình khó khăn không đủ kinh tế đống học phí đến trương\",\"tieuDe\":\"Đơn xin Quỹ Hỗ trợ Sinh viên Vượt khó Trà Vinh học kỳ I năm học 2026-2027\"}}', '127.0.0.1', '2026-06-17 05:45:54'),
(105, 11, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Thạch Phan Dựng: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":12,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:47:01'),
(106, 11, 'NOP_YEU_CAU_HO_TRO', 'yeucauhotro', 9, '[Sinh viên] Thạch Phan Dựng: Nộp đơn xin hỗ trợ từ quỹ \'Quỹ Hỗ trợ Sinh viên Vượt khó Trà Vinh\' với số tiền đề nghị: 10.000.000 VNĐ', NULL, '{\"nguoiDungId\":11,\"quyId\":4,\"lyDo\":\"**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**\\n**Độc lập – Tự do – Hạnh phúc**\\n***\\n*Trà Vinh, ngày [Ngày] tháng [Tháng] năm [Năm]*\\n\\n**ĐƠN XIN HỖ TRỢ TỪ QUỸ \\\"QUỸ HỖ TRỢ SINH VIÊN VƯỢT KHÓ TRÀ VINH\\\"**\\n\\n**Kính gửi:**\\n*   **Ban Quản lý Quỹ \\\"Quỹ Hỗ trợ Sinh viên Vượt khó Trà Vinh\\\"**\\n*   **Ban Giám hiệu Trường Đại học Trà Vinh**\\n\\nTôi tên là: [Họ và tên sinh viên]\\nMã số sinh viên: [Mã số sinh viên]\\nLớp: [Tên lớp]\\nNgành: [Tên ngành học]\\nKhoa: [Tên khoa]\\nĐiện thoại: [Số điện thoại]\\nEmail: [Địa chỉ email]\\n\\nTôi viết đơn này kính mong Quý Ban xem xét, tạo điều kiện hỗ trợ kinh phí từ Quỹ \\\"Quỹ Hỗ trợ Sinh viên Vượt khó Trà Vinh\\\" để tôi có thể tiếp tục việc học tập tại Trường.\\n\\n**Hoàn cảnh gia đình và lý do xin hỗ trợ:**\\nGia đình tôi hiện đang gặp rất nhiều khó khăn về kinh tế. Thu nhập chính của gia đình rất bấp bênh và không đủ để trang trải các chi phí sinh hoạt hàng ngày, cũng như các khoản chi phí học tập của tôi. Điều này khiến việc đóng học phí đúng hạn để duy trì việc học tại Trường trở thành một gánh nặng rất lớn và vượt quá khả năng chi trả của gia đình tôi vào thời điểm hiện tại.\\n\\nTôi là sinh viên hệ chính quy của Trường Đại học Trà Vinh, luôn cố gắng trong học tập và rèn luyện. Tuy nhiên, trước hoàn cảnh kinh tế eo hẹp của gia đình, tôi đang đối mặt với nguy cơ rất lớn là phải gián đoạn việc học, thậm chí là bỏ học giữa chừng nếu không nhận được sự giúp đỡ. Ước mơ được tốt nghiệp đại học, có một tương lai tốt đẹp hơn để phụ giúp gia đình đang đứng trước thử thách lớn.\\n\\nTôi nhận thấy Quỹ \\\"Quỹ Hỗ trợ Sinh viên Vượt khó Trà Vinh\\\" được thành lập nhằm hỗ trợ những sinh viên có hoàn cảnh đặc biệt khó khăn như tôi để các em có thể duy trì việc học, không bỏ học giữa chừng vì lý do kinh tế. Tôi cam đoan bản thân đáp ứng các tiêu chí của Quỹ, cụ thể là sinh viên hệ chính quy, không bị kỷ luật từ mức cảnh cáo trở lên, và gia đình tôi thuộc diện có hoàn cảnh đặc biệt khó khăn (thuộc hộ nghèo/cận nghèo/có xác nhận của địa phương về hoàn cảnh khó khăn đặc biệt).\\n\\nVới tất cả sự chân thành và niềm hy vọng, tôi tha thiết kính mong Ban Quản lý Quỹ và Ban Giám hiệu Nhà trường xem xét hoàn cảnh của tôi và tạo điều kiện giúp đỡ tôi vượt qua giai đoạn khó khăn này, để tôi có thể tiếp tục con đường học vấn và hoàn thành ước mơ của mình.\\n\\n**Lời cam kết:**\\nNếu được Quý Ban hỗ trợ, tôi xin cam kết sẽ sử dụng số tiền hỗ trợ đúng mục đích, phục vụ trực tiếp cho việc đóng học phí và các chi phí thiết yếu khác liên quan đến học tập như mua sách vở, tài liệu. Tôi sẽ cố gắng hết sức mình trong học tập và rèn luyện để đạt được kết quả tốt nhất, xứng đáng với sự tin tưởng và hỗ trợ của Quý Ban, không phụ lòng cha mẹ, thầy cô và những người đã giúp đỡ tôi.\\n\\nKính mong Quý Ban xem xét và chấp thuận.\\n\\nTôi xin chân thành cảm ơn!\\n\\n**Người làm đơn**\\n*(Ký và ghi rõ họ tên)*\\n[Họ và tên sinh viên]\",\"soTienDeNghi\":10000000,\"taiLieuDinhKem\":\"uploads/documents/DHTV_1781675221538_895102938.jpg\"}', '127.0.0.1', '2026-06-17 05:47:01'),
(107, 11, 'DANG_XUAT', 'nguoidung', 11, '[Sinh viên] Thạch Phan Dựng: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 05:47:58'),
(108, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 05:48:41'),
(109, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":11,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:49:24'),
(110, 1, 'CAP_NHAT_QUY', 'quy', 12, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật thông tin quỹ: Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU', '{\"quy_id\":12,\"ten_quy\":\"Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU\",\"loaiquy_id\":6,\"loai_quy\":\"Quy thi dua\",\"ten_loai_quy\":\"Quỷ thi đua\",\"mo_ta\":\"Quỹ trao thưởng và hỗ trợ kinh phí nghiên cứu cho sinh viên TVU đạt giải tại các cuộc thi Nghiên cứu Khoa học cấp trường, cấp tỉnh và cấp quốc gia trong năm học hiện tại.\",\"hinh_anh\":null,\"so_tien_muc_tieu\":\"250000000.00\",\"so_tien_toi_thieu\":\"250000000.00\",\"so_tien_ho_tro_toi_da\":\"30000000.00\",\"so_tien_toi_da\":\"30000000.00\",\"so_luong_chi_tieu\":20,\"dieu_kien_tom_tat\":\"Sinh viên đạt giải Nhất, Nhì, Ba tại cuộc thi Nghiên cứu Khoa học cấp trường trở lên trong năm học hiện tại, có xác nhận của Phòng Khoa học Công nghệ.\",\"ngaybatdau\":\"2024-12-31T17:00:00.000Z\",\"han_nop_don\":\"2025-12-30T17:00:00.000Z\",\"so_du\":\"130000000.00\",\"nguoitao_id\":3,\"ngay_tao\":\"2026-06-16T17:25:23.000Z\",\"ngay_cap_nhat\":\"2026-06-16T17:25:23.000Z\",\"trang_thai\":\"Dang hoat dong\"}', '{\"tenQuy\":\"Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU\",\"loaiQuy\":\"Quy thi dua\",\"moTa\":\"Quỹ trao thưởng và hỗ trợ kinh phí nghiên cứu cho sinh viên TVU đạt giải tại các cuộc thi Nghiên cứu Khoa học cấp trường, cấp tỉnh và cấp quốc gia trong năm học hiện tại.\",\"hinhAnh\":\"uploads/avatars/fund/DHTV_1781675364511_625372277.jpg\",\"soTienMucTieu\":250000000,\"soTienHoTroToiDa\":30000000,\"soLuongChiTieu\":20,\"hanNopDon\":\"2027-03-28\",\"dieuKienTomTat\":\"Sinh viên đạt giải Nhất, Nhì, Ba tại cuộc thi Nghiên cứu Khoa học cấp trường trở lên trong năm học hiện tại, có xác nhận của Phòng Khoa học Công nghệ.\",\"soDu\":130000000,\"trangThai\":\"Dang hoat dong\"}', '127.0.0.1', '2026-06-17 05:49:31'),
(111, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":37,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:50:00'),
(112, 1, 'CAP_NHAT_QUY', 'quy', 4, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật thông tin quỹ: Quỹ Hỗ trợ Sinh viên Vượt khó Trà Vinh', '{\"quy_id\":4,\"ten_quy\":\"Quỹ Hỗ trợ Sinh viên Vượt khó Trà Vinh\",\"loaiquy_id\":1,\"loai_quy\":\"Tu thien\",\"ten_loai_quy\":\"Từ thiện\",\"mo_ta\":\"Quỹ được thành lập nhằm hỗ trợ sinh viên Trường Đại học Trà Vinh có hoàn cảnh gia đình đặc biệt khó khăn, giúp các em duy trì việc học và không bỏ học giữa chừng vì lý do kinh tế.\",\"hinh_anh\":null,\"so_tien_muc_tieu\":\"500000000.00\",\"so_tien_toi_thieu\":\"500000000.00\",\"so_tien_ho_tro_toi_da\":\"10000000.00\",\"so_tien_toi_da\":\"10000000.00\",\"so_luong_chi_tieu\":50,\"dieu_kien_tom_tat\":\"Sinh viên hệ chính quy, thuộc hộ nghèo hoặc cận nghèo có xác nhận của địa phương, không bị kỷ luật từ mức cảnh cáo trở lên.\",\"ngaybatdau\":\"2024-12-31T17:00:00.000Z\",\"han_nop_don\":\"2025-12-30T17:00:00.000Z\",\"so_du\":\"320000000.00\",\"nguoitao_id\":3,\"ngay_tao\":\"2026-06-16T17:25:23.000Z\",\"ngay_cap_nhat\":\"2026-06-16T17:25:23.000Z\",\"trang_thai\":\"Dang hoat dong\"}', '{\"tenQuy\":\"Quỹ Hỗ trợ Sinh viên Vượt khó Trà Vinh\",\"loaiQuy\":\"Tu thien\",\"moTa\":\"Quỹ được thành lập nhằm hỗ trợ sinh viên Trường Đại học Trà Vinh có hoàn cảnh gia đình đặc biệt khó khăn, giúp các em duy trì việc học và không bỏ học giữa chừng vì lý do kinh tế.\",\"hinhAnh\":\"uploads/avatars/fund/tvu-IMG_8704_1781675400458_351184858.png\",\"soTienMucTieu\":500000000,\"soTienHoTroToiDa\":10000000,\"soLuongChiTieu\":50,\"hanNopDon\":\"2028-01-28\",\"dieuKienTomTat\":\"Sinh viên hệ chính quy, thuộc hộ nghèo hoặc cận nghèo có xác nhận của địa phương, không bị kỷ luật từ mức cảnh cáo trở lên.\",\"soDu\":320000000,\"trangThai\":\"Dang hoat dong\"}', '127.0.0.1', '2026-06-17 05:50:13'),
(113, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":4,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:50:30'),
(114, 1, 'CAP_NHAT_QUY', 'quy', 5, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật thông tin quỹ: Quỹ Cứu trợ Khẩn cấp Sinh viên Bị Thiên tai', '{\"quy_id\":5,\"ten_quy\":\"Quỹ Cứu trợ Khẩn cấp Sinh viên Bị Thiên tai\",\"loaiquy_id\":1,\"loai_quy\":\"Tu thien\",\"ten_loai_quy\":\"Từ thiện\",\"mo_ta\":\"Quỹ hỗ trợ khẩn cấp dành cho sinh viên có gia đình bị ảnh hưởng nặng nề bởi thiên tai như lũ lụt, sạt lở đất tại khu vực Đồng bằng Sông Cửu Long.\",\"hinh_anh\":null,\"so_tien_muc_tieu\":\"300000000.00\",\"so_tien_toi_thieu\":\"300000000.00\",\"so_tien_ho_tro_toi_da\":\"15000000.00\",\"so_tien_toi_da\":\"15000000.00\",\"so_luong_chi_tieu\":20,\"dieu_kien_tom_tat\":\"Sinh viên có gia đình bị thiệt hại tài sản do thiên tai, có xác nhận của UBND xã/phường nơi cư trú.\",\"ngaybatdau\":\"2025-05-31T17:00:00.000Z\",\"han_nop_don\":\"2025-12-30T17:00:00.000Z\",\"so_du\":\"180000000.00\",\"nguoitao_id\":3,\"ngay_tao\":\"2026-06-16T17:25:23.000Z\",\"ngay_cap_nhat\":\"2026-06-16T17:25:23.000Z\",\"trang_thai\":\"Dang hoat dong\"}', '{\"tenQuy\":\"Quỹ Cứu trợ Khẩn cấp Sinh viên Bị Thiên tai\",\"loaiQuy\":\"Tu thien\",\"moTa\":\"Quỹ hỗ trợ khẩn cấp dành cho sinh viên có gia đình bị ảnh hưởng nặng nề bởi thiên tai như lũ lụt, sạt lở đất tại khu vực Đồng bằng Sông Cửu Long.\",\"hinhAnh\":\"uploads/avatars/fund/HB-tieuso_1781675430227_969890714.jpg\",\"soTienMucTieu\":300000000,\"soTienHoTroToiDa\":15000000,\"soLuongChiTieu\":20,\"hanNopDon\":\"2027-12-28\",\"dieuKienTomTat\":\"Sinh viên có gia đình bị thiệt hại tài sản do thiên tai, có xác nhận của UBND xã/phường nơi cư trú.\",\"soDu\":180000000,\"trangThai\":\"Dang hoat dong\"}', '127.0.0.1', '2026-06-17 05:50:47'),
(115, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":4,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:52:44'),
(116, 1, 'CAP_NHAT_QUY', 'quy', 6, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật thông tin quỹ: Học bổng Tài năng TVU — Khối ngành Công nghệ Thông tin', '{\"quy_id\":6,\"ten_quy\":\"Học bổng Tài năng TVU — Khối ngành Công nghệ Thông tin\",\"loaiquy_id\":2,\"loai_quy\":\"Hoc bong\",\"ten_loai_quy\":\"Học bổng\",\"mo_ta\":\"Học bổng dành riêng cho sinh viên xuất sắc khối ngành Công nghệ Thông tin, Kỹ thuật Phần mềm và Trí tuệ Nhân tạo. Được tài trợ bởi Tập đoàn FPT giai đoạn 2025-2028.\",\"hinh_anh\":null,\"so_tien_muc_tieu\":\"1000000000.00\",\"so_tien_toi_thieu\":\"1000000000.00\",\"so_tien_ho_tro_toi_da\":\"20000000.00\",\"so_tien_toi_da\":\"20000000.00\",\"so_luong_chi_tieu\":30,\"dieu_kien_tom_tat\":\"Sinh viên ngành CNTT đạt GPA từ 3.2 trở lên, có hoàn cảnh khó khăn hoặc đạt giải thưởng học thuật cấp trường trở lên.\",\"ngaybatdau\":\"2024-12-31T17:00:00.000Z\",\"han_nop_don\":\"2028-12-30T17:00:00.000Z\",\"so_du\":\"750000000.00\",\"nguoitao_id\":3,\"ngay_tao\":\"2026-06-16T17:25:23.000Z\",\"ngay_cap_nhat\":\"2026-06-16T17:25:23.000Z\",\"trang_thai\":\"Dang hoat dong\"}', '{\"tenQuy\":\"Học bổng Tài năng TVU — Khối ngành Công nghệ Thông tin\",\"loaiQuy\":\"Hoc bong\",\"moTa\":\"Học bổng dành riêng cho sinh viên xuất sắc khối ngành Công nghệ Thông tin, Kỹ thuật Phần mềm và Trí tuệ Nhân tạo. Được tài trợ bởi Tập đoàn FPT giai đoạn 2025-2028.\",\"hinhAnh\":\"uploads/avatars/fund/online-bachelor-card-2_Bnt_8bKX_1781675564393_170159643.png\",\"soTienMucTieu\":1000000000,\"soTienHoTroToiDa\":20000000,\"soLuongChiTieu\":30,\"hanNopDon\":\"2028-12-30\",\"dieuKienTomTat\":\"Sinh viên ngành CNTT đạt GPA từ 3.2 trở lên, có hoàn cảnh khó khăn hoặc đạt giải thưởng học thuật cấp trường trở lên.\",\"soDu\":750000000,\"trangThai\":\"Dang hoat dong\"}', '127.0.0.1', '2026-06-17 05:52:47'),
(117, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":9,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:53:09'),
(118, 1, 'CAP_NHAT_QUY', 'quy', 7, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật thông tin quỹ: Học bổng ACB Đồng hành cùng Sinh viên TVU Vượt khó Học tốt', '{\"quy_id\":7,\"ten_quy\":\"Học bổng ACB Đồng hành cùng Sinh viên TVU Vượt khó Học tốt\",\"loaiquy_id\":2,\"loai_quy\":\"Hoc bong\",\"ten_loai_quy\":\"Học bổng\",\"mo_ta\":\"Chương trình học bổng phối hợp giữa Quỹ Phát triển TVU và Ngân hàng TMCP Á Châu, trao tặng hàng năm cho sinh viên có thành tích học tập tốt và hoàn cảnh khó khăn thuộc mọi ngành học.\",\"hinh_anh\":null,\"so_tien_muc_tieu\":\"600000000.00\",\"so_tien_toi_thieu\":\"600000000.00\",\"so_tien_ho_tro_toi_da\":\"12000000.00\",\"so_tien_toi_da\":\"12000000.00\",\"so_luong_chi_tieu\":50,\"dieu_kien_tom_tat\":\"Sinh viên hệ chính quy từ năm 2 trở lên, GPA học kỳ gần nhất đạt từ 2.8 trở lên, thuộc hộ nghèo hoặc cận nghèo.\",\"ngaybatdau\":\"2025-02-28T17:00:00.000Z\",\"han_nop_don\":\"2025-11-29T17:00:00.000Z\",\"so_du\":\"420000000.00\",\"nguoitao_id\":3,\"ngay_tao\":\"2026-06-16T17:25:23.000Z\",\"ngay_cap_nhat\":\"2026-06-16T17:25:23.000Z\",\"trang_thai\":\"Dang hoat dong\"}', '{\"tenQuy\":\"Học bổng ACB Đồng hành cùng Sinh viên TVU Vượt khó Học tốt\",\"loaiQuy\":\"Hoc bong\",\"moTa\":\"Chương trình học bổng phối hợp giữa Quỹ Phát triển TVU và Ngân hàng TMCP Á Châu, trao tặng hàng năm cho sinh viên có thành tích học tập tốt và hoàn cảnh khó khăn thuộc mọi ngành học.\",\"hinhAnh\":\"uploads/avatars/fund/HB7_1781675589859_499560317.jpg\",\"soTienMucTieu\":600000000,\"soTienHoTroToiDa\":12000000,\"soLuongChiTieu\":50,\"hanNopDon\":\"2026-06-17\",\"dieuKienTomTat\":\"Sinh viên hệ chính quy từ năm 2 trở lên, GPA học kỳ gần nhất đạt từ 2.8 trở lên, thuộc hộ nghèo hoặc cận nghèo.\",\"soDu\":420000000,\"trangThai\":\"Dang hoat dong\"}', '127.0.0.1', '2026-06-17 05:53:26'),
(119, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":24,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:53:44'),
(120, 1, 'CAP_NHAT_QUY', 'quy', 8, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật thông tin quỹ: Học bổng Thủ khoa Tuyển sinh TVU', '{\"quy_id\":8,\"ten_quy\":\"Học bổng Thủ khoa Tuyển sinh TVU\",\"loaiquy_id\":2,\"loai_quy\":\"Hoc bong\",\"ten_loai_quy\":\"Học bổng\",\"mo_ta\":\"Quỹ học bổng danh giá dành riêng để trao tặng cho thủ khoa đầu vào của Trường Đại học Trà Vinh mỗi năm học, nhằm thu hút và giữ chân nhân tài về học tập tại tỉnh nhà.\",\"hinh_anh\":null,\"so_tien_muc_tieu\":\"200000000.00\",\"so_tien_toi_thieu\":\"200000000.00\",\"so_tien_ho_tro_toi_da\":\"30000000.00\",\"so_tien_toi_da\":\"30000000.00\",\"so_luong_chi_tieu\":5,\"dieu_kien_tom_tat\":\"Thủ khoa đầu vào của từng khối ngành trong kỳ tuyển sinh chính thức của Trường Đại học Trà Vinh.\",\"ngaybatdau\":\"2025-07-31T17:00:00.000Z\",\"han_nop_don\":\"2026-07-30T17:00:00.000Z\",\"so_du\":\"200000000.00\",\"nguoitao_id\":3,\"ngay_tao\":\"2026-06-16T17:25:23.000Z\",\"ngay_cap_nhat\":\"2026-06-16T17:25:23.000Z\",\"trang_thai\":\"Dang hoat dong\"}', '{\"tenQuy\":\"Học bổng Thủ khoa Tuyển sinh TVU\",\"loaiQuy\":\"Hoc bong\",\"moTa\":\"Quỹ học bổng danh giá dành riêng để trao tặng cho thủ khoa đầu vào của Trường Đại học Trà Vinh mỗi năm học, nhằm thu hút và giữ chân nhân tài về học tập tại tỉnh nhà.\",\"hinhAnh\":\"uploads/avatars/fund/dhtv2_1781675624046_257915435.jpg\",\"soTienMucTieu\":200000000,\"soTienHoTroToiDa\":30000000,\"soLuongChiTieu\":5,\"hanNopDon\":\"2026-07-30\",\"dieuKienTomTat\":\"Thủ khoa đầu vào của từng khối ngành trong kỳ tuyển sinh chính thức của Trường Đại học Trà Vinh.\",\"soDu\":200000000,\"trangThai\":\"Dang hoat dong\"}', '127.0.0.1', '2026-06-17 05:53:46'),
(121, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":8,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:54:05'),
(122, 1, 'CAP_NHAT_QUY', 'quy', 9, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật thông tin quỹ: Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU', '{\"quy_id\":9,\"ten_quy\":\"Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU\",\"loaiquy_id\":3,\"loai_quy\":\"Y te\",\"ten_loai_quy\":\"Y tế\",\"mo_ta\":\"Quỹ hỗ trợ một phần chi phí khám chữa bệnh, phẫu thuật và điều trị dài hạn cho sinh viên và thân nhân trực tiếp gặp bệnh hiểm nghèo hoặc tai nạn bất ngờ trong năm học.\",\"hinh_anh\":null,\"so_tien_muc_tieu\":\"400000000.00\",\"so_tien_toi_thieu\":\"400000000.00\",\"so_tien_ho_tro_toi_da\":\"25000000.00\",\"so_tien_toi_da\":\"25000000.00\",\"so_luong_chi_tieu\":15,\"dieu_kien_tom_tat\":\"Sinh viên đang theo học hệ chính quy, có hóa đơn viện phí hoặc chứng từ y tế xác nhận tình trạng bệnh và chi phí điều trị.\",\"ngaybatdau\":\"2024-12-31T17:00:00.000Z\",\"han_nop_don\":\"2025-12-30T17:00:00.000Z\",\"so_du\":\"210000000.00\",\"nguoitao_id\":3,\"ngay_tao\":\"2026-06-16T17:25:23.000Z\",\"ngay_cap_nhat\":\"2026-06-16T17:25:23.000Z\",\"trang_thai\":\"Dang hoat dong\"}', '{\"tenQuy\":\"Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU\",\"loaiQuy\":\"Y te\",\"moTa\":\"Quỹ hỗ trợ một phần chi phí khám chữa bệnh, phẫu thuật và điều trị dài hạn cho sinh viên và thân nhân trực tiếp gặp bệnh hiểm nghèo hoặc tai nạn bất ngờ trong năm học.\",\"hinhAnh\":\"uploads/avatars/fund/dhtv2_1781675645238_6732910.jpg\",\"soTienMucTieu\":400000000,\"soTienHoTroToiDa\":25000000,\"soLuongChiTieu\":15,\"hanNopDon\":\"2028-01-28\",\"dieuKienTomTat\":\"Sinh viên đang theo học hệ chính quy, có hóa đơn viện phí hoặc chứng từ y tế xác nhận tình trạng bệnh và chi phí điều trị.\",\"soDu\":210000000,\"trangThai\":\"Dang hoat dong\"}', '127.0.0.1', '2026-06-17 05:54:18'),
(123, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":7,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:54:33'),
(124, 1, 'CAP_NHAT_QUY', 'quy', 8, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật thông tin quỹ: Học bổng Thủ khoa Tuyển sinh TVU', '{\"quy_id\":8,\"ten_quy\":\"Học bổng Thủ khoa Tuyển sinh TVU\",\"loaiquy_id\":2,\"loai_quy\":\"Hoc bong\",\"ten_loai_quy\":\"Học bổng\",\"mo_ta\":\"Quỹ học bổng danh giá dành riêng để trao tặng cho thủ khoa đầu vào của Trường Đại học Trà Vinh mỗi năm học, nhằm thu hút và giữ chân nhân tài về học tập tại tỉnh nhà.\",\"hinh_anh\":\"uploads/avatars/fund/dhtv2_1781675624046_257915435.jpg\",\"so_tien_muc_tieu\":\"200000000.00\",\"so_tien_toi_thieu\":\"200000000.00\",\"so_tien_ho_tro_toi_da\":\"30000000.00\",\"so_tien_toi_da\":\"30000000.00\",\"so_luong_chi_tieu\":5,\"dieu_kien_tom_tat\":\"Thủ khoa đầu vào của từng khối ngành trong kỳ tuyển sinh chính thức của Trường Đại học Trà Vinh.\",\"ngaybatdau\":\"2025-07-31T17:00:00.000Z\",\"han_nop_don\":\"2026-07-29T17:00:00.000Z\",\"so_du\":\"200000000.00\",\"nguoitao_id\":3,\"ngay_tao\":\"2026-06-16T17:25:23.000Z\",\"ngay_cap_nhat\":\"2026-06-17T05:53:46.000Z\",\"trang_thai\":\"Dang hoat dong\"}', '{\"tenQuy\":\"Học bổng Thủ khoa Tuyển sinh TVU\",\"loaiQuy\":\"Hoc bong\",\"moTa\":\"Quỹ học bổng danh giá dành riêng để trao tặng cho thủ khoa đầu vào của Trường Đại học Trà Vinh mỗi năm học, nhằm thu hút và giữ chân nhân tài về học tập tại tỉnh nhà.\",\"hinhAnh\":\"uploads/avatars/fund/img_6264_1781675673103_519141767.jpeg\",\"soTienMucTieu\":200000000,\"soTienHoTroToiDa\":30000000,\"soLuongChiTieu\":5,\"hanNopDon\":\"2026-07-29\",\"dieuKienTomTat\":\"Thủ khoa đầu vào của từng khối ngành trong kỳ tuyển sinh chính thức của Trường Đại học Trà Vinh.\",\"soDu\":200000000,\"trangThai\":\"Dang hoat dong\"}', '127.0.0.1', '2026-06-17 05:54:35'),
(125, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":5,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:55:14'),
(126, 1, 'CAP_NHAT_QUY', 'quy', 10, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật thông tin quỹ: Quỹ Sinh viên TVU Xanh — Hành động vì Môi trường', '{\"quy_id\":10,\"ten_quy\":\"Quỹ Sinh viên TVU Xanh — Hành động vì Môi trường\",\"loaiquy_id\":4,\"loai_quy\":\"Moi truong\",\"ten_loai_quy\":\"Môi trường\",\"mo_ta\":\"Quỹ tài trợ cho các dự án và hoạt động bảo vệ môi trường do sinh viên TVU khởi xướng, bao gồm trồng cây, làm sạch bãi biển, tái chế rác thải và nâng cao ý thức cộng đồng địa phương.\",\"hinh_anh\":null,\"so_tien_muc_tieu\":\"150000000.00\",\"so_tien_toi_thieu\":\"150000000.00\",\"so_tien_ho_tro_toi_da\":\"5000000.00\",\"so_tien_toi_da\":\"5000000.00\",\"so_luong_chi_tieu\":30,\"dieu_kien_tom_tat\":\"Nhóm sinh viên từ 3 người trở lên, có đề xuất dự án môi trường rõ ràng, được Đoàn Thanh niên hoặc Hội Sinh viên nhà trường xác nhận.\",\"ngaybatdau\":\"2025-03-31T17:00:00.000Z\",\"han_nop_don\":\"2025-10-30T17:00:00.000Z\",\"so_du\":\"80000000.00\",\"nguoitao_id\":3,\"ngay_tao\":\"2026-06-16T17:25:23.000Z\",\"ngay_cap_nhat\":\"2026-06-16T17:25:23.000Z\",\"trang_thai\":\"Dang hoat dong\"}', '{\"tenQuy\":\"Quỹ Sinh viên TVU Xanh — Hành động vì Môi trường\",\"loaiQuy\":\"Moi truong\",\"moTa\":\"Quỹ tài trợ cho các dự án và hoạt động bảo vệ môi trường do sinh viên TVU khởi xướng, bao gồm trồng cây, làm sạch bãi biển, tái chế rác thải và nâng cao ý thức cộng đồng địa phương.\",\"hinhAnh\":\"uploads/avatars/fund/DHTVHTGDVN_1781675714504_786906039.jpg\",\"soTienMucTieu\":150000000,\"soTienHoTroToiDa\":5000000,\"soLuongChiTieu\":30,\"hanNopDon\":\"2028-04-28\",\"dieuKienTomTat\":\"Nhóm sinh viên từ 3 người trở lên, có đề xuất dự án môi trường rõ ràng, được Đoàn Thanh niên hoặc Hội Sinh viên nhà trường xác nhận.\",\"soDu\":80000000,\"trangThai\":\"Dang hoat dong\"}', '127.0.0.1', '2026-06-17 05:55:16'),
(127, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":11,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:55:40'),
(128, 1, 'CAP_NHAT_QUY', 'quy', 11, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật thông tin quỹ: Quỹ Hỗ trợ Sinh viên Khởi nghiệp TVU', '{\"quy_id\":11,\"ten_quy\":\"Quỹ Hỗ trợ Sinh viên Khởi nghiệp TVU\",\"loaiquy_id\":5,\"loai_quy\":\"Khac\",\"ten_loai_quy\":\"Khác\",\"mo_ta\":\"Quỹ cung cấp nguồn vốn ban đầu và hỗ trợ kết nối mentor cho các nhóm sinh viên TVU có ý tưởng khởi nghiệp sáng tạo, tiềm năng thương mại hóa cao trong lĩnh vực công nghệ và nông nghiệp.\",\"hinh_anh\":null,\"so_tien_muc_tieu\":\"800000000.00\",\"so_tien_toi_thieu\":\"800000000.00\",\"so_tien_ho_tro_toi_da\":\"50000000.00\",\"so_tien_toi_da\":\"50000000.00\",\"so_luong_chi_tieu\":10,\"dieu_kien_tom_tat\":\"Nhóm sinh viên từ 2 đến 5 người, có bản kế hoạch kinh doanh chi tiết, đã tham gia ít nhất 1 buổi workshop khởi nghiệp do nhà trường tổ chức.\",\"ngaybatdau\":\"2025-01-31T17:00:00.000Z\",\"han_nop_don\":\"2026-01-30T17:00:00.000Z\",\"so_du\":\"350000000.00\",\"nguoitao_id\":3,\"ngay_tao\":\"2026-06-16T17:25:23.000Z\",\"ngay_cap_nhat\":\"2026-06-16T17:25:23.000Z\",\"trang_thai\":\"Dang hoat dong\"}', '{\"tenQuy\":\"Quỹ Hỗ trợ Sinh viên Khởi nghiệp TVU\",\"loaiQuy\":\"Khac\",\"moTa\":\"Quỹ cung cấp nguồn vốn ban đầu và hỗ trợ kết nối mentor cho các nhóm sinh viên TVU có ý tưởng khởi nghiệp sáng tạo, tiềm năng thương mại hóa cao trong lĩnh vực công nghệ và nông nghiệp.\",\"hinhAnh\":\"uploads/avatars/fund/HB-2025_1781675740918_210848626.jpg\",\"soTienMucTieu\":800000000,\"soTienHoTroToiDa\":50000000,\"soLuongChiTieu\":10,\"hanNopDon\":\"2027-12-28\",\"dieuKienTomTat\":\"Nhóm sinh viên từ 2 đến 5 người, có bản kế hoạch kinh doanh chi tiết, đã tham gia ít nhất 1 buổi workshop khởi nghiệp do nhà trường tổ chức.\",\"soDu\":350000000,\"trangThai\":\"Dang hoat dong\"}', '127.0.0.1', '2026-06-17 05:55:46'),
(129, 1, 'CAP_NHAT_TRANG_THAI_QUY', 'quy', 13, '[Nhân viên hệ thống] Nguyễn Văn Bình: Thay đổi trạng thái quỹ Quỹ Hỗ trợ Sinh viên TVU Tham gia Thi đấu Thể thao Quốc gia từ \'Tam dung\' sang \'Dang hoat dong\'', '{\"trangThai\":\"Tam dung\"}', '{\"trangThai\":\"Dang hoat dong\"}', '127.0.0.1', '2026-06-17 05:55:54'),
(130, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":5,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 05:56:22'),
(131, 1, 'CAP_NHAT_QUY', 'quy', 13, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật thông tin quỹ: Quỹ Hỗ trợ Sinh viên TVU Tham gia Thi đấu Thể thao Quốc gia', '{\"quy_id\":13,\"ten_quy\":\"Quỹ Hỗ trợ Sinh viên TVU Tham gia Thi đấu Thể thao Quốc gia\",\"loaiquy_id\":6,\"loai_quy\":\"Quy thi dua\",\"ten_loai_quy\":\"Quỷ thi đua\",\"mo_ta\":\"Quỹ hỗ trợ chi phí đi lại, ăn ở và trang thiết bị thi đấu cho sinh viên TVU được tuyển chọn đại diện tỉnh Trà Vinh tham dự các giải thể thao sinh viên cấp quốc gia.\",\"hinh_anh\":null,\"so_tien_muc_tieu\":\"120000000.00\",\"so_tien_toi_thieu\":\"120000000.00\",\"so_tien_ho_tro_toi_da\":\"8000000.00\",\"so_tien_toi_da\":\"8000000.00\",\"so_luong_chi_tieu\":15,\"dieu_kien_tom_tat\":\"Sinh viên được Ban Giám hiệu hoặc Phòng Công tác Sinh viên xác nhận đại diện trường tham dự giải thể thao cấp tỉnh hoặc quốc gia.\",\"ngaybatdau\":\"2025-02-28T17:00:00.000Z\",\"han_nop_don\":\"2025-12-30T17:00:00.000Z\",\"so_du\":\"65000000.00\",\"nguoitao_id\":3,\"ngay_tao\":\"2026-06-16T17:25:23.000Z\",\"ngay_cap_nhat\":\"2026-06-17T05:55:54.000Z\",\"trang_thai\":\"Dang hoat dong\"}', '{\"tenQuy\":\"Quỹ Hỗ trợ Sinh viên TVU Tham gia Thi đấu Thể thao Quốc gia\",\"loaiQuy\":\"Quy thi dua\",\"moTa\":\"Quỹ hỗ trợ chi phí đi lại, ăn ở và trang thiết bị thi đấu cho sinh viên TVU được tuyển chọn đại diện tỉnh Trà Vinh tham dự các giải thể thao sinh viên cấp quốc gia.\",\"hinhAnh\":\"uploads/avatars/fund/img_6264_1781675782769_925998934.jpeg\",\"soTienMucTieu\":120000000,\"soTienHoTroToiDa\":8000000,\"soLuongChiTieu\":15,\"hanNopDon\":\"2028-03-28\",\"dieuKienTomTat\":\"Sinh viên được Ban Giám hiệu hoặc Phòng Công tác Sinh viên xác nhận đại diện trường tham dự giải thể thao cấp tỉnh hoặc quốc gia.\",\"soDu\":65000000,\"trangThai\":\"Dang hoat dong\"}', '127.0.0.1', '2026-06-17 05:56:24'),
(132, 1, 'DANG_XUAT', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 06:00:53'),
(133, 12, 'DANG_KY_TAI_KHOAN', 'nguoidung', 12, '[Sinh viên] Nguyễn Minh cần: Đăng ký tài khoản sinh viên thành công', NULL, '{\"nguoidung_id\":12,\"hoten\":\"Nguyễn Minh cần\",\"email\":\"can@gmail.com\",\"vaitro_id\":4,\"loaitaikhoan\":\"SINH_VIEN\"}', '127.0.0.1', '2026-06-17 06:08:43'),
(134, 12, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Nguyễn Minh cần: POST /api/upload/avatar - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/avatar\",\"statusCode\":200,\"durationMs\":49,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 06:08:58'),
(135, 12, 'CAP_NHAT_THONG_TIN_NGUOI_DUNG', 'nguoidung', 12, '[Sinh viên] Nguyễn Minh cần: Cập nhật thông tin tài khoản cho người dùng can@gmail.com (Họ tên: Nguyễn Minh cần)', '{\"nguoidung_id\":12,\"masodinhdanh\":\"110122174\",\"hoten\":\"Nguyễn Minh cần\",\"email\":\"can@gmail.com\",\"avatar\":null,\"sodienthoai\":null,\"diachi\":null,\"vaitro_id\":4,\"loaitaikhoan\":\"SINH_VIEN\",\"khoaphong\":\"DA22DCNA\",\"trangthai\":\"HOAT_DONG\",\"ngaytao\":\"2026-06-17T06:08:43.000Z\",\"tenvaitro\":\"sinhvien\",\"mota_vaitro\":\"Người dùng (Sinh viên, Nhà tài trợ)\"}', '{\"avatar\":\"uploads/avatars/staffs/can_1781676538644_207500683.jpg\"}', '127.0.0.1', '2026-06-17 06:08:58'),
(136, 12, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Nguyễn Minh cần: POST /api/bank-accounts - tác động dữ liệu thành công (201)', NULL, '{\"method\":\"POST\",\"path\":\"/api/bank-accounts\",\"statusCode\":201,\"durationMs\":17,\"params\":{},\"query\":{},\"body\":{\"soTaiKhoan\":\"0234516789\",\"tenNganHang\":\"vietinbank\",\"chuTaiKhoan\":\"NGUYEN MINH CAN\",\"laMacDinh\":true}}', '127.0.0.1', '2026-06-17 06:09:38'),
(137, 12, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Nguyễn Minh cần: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":22,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 06:11:42');
INSERT INTO `nhatkyhethong` (`nhatkyhethong_id`, `nguoidung_id`, `hanhdong`, `loaidoituong`, `doituong_id`, `mota`, `dulieucu`, `dulieumoi`, `ipaddress`, `createdat`) VALUES
(138, 12, 'NOP_YEU_CAU_HO_TRO', 'yeucauhotro', 10, '[Sinh viên] Nguyễn Minh cần: Nộp đơn xin hỗ trợ từ quỹ \'Học bổng ACB Đồng hành cùng Sinh viên TVU Vượt khó Học tốt\' với số tiền đề nghị: 10.000.000 VNĐ', NULL, '{\"nguoiDungId\":12,\"quyId\":7,\"lyDo\":\"**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**\\n**Độc lập – Tự do – Hạnh phúc**\\n***\\n*Trà Vinh, ngày [Ngày] tháng [Tháng] năm [Năm]*\\n\\n**ĐƠN XIN HỖ TRỢ TỪ QUỸ \\\"HỌC BỔNG ACB ĐỒNG HÀNH CÙNG SINH VIÊN TVU VƯỢT KHÓ HỌC TỐT\\\"**\\n\\nKính gửi:\\n*   Ban Giám hiệu Trường Đại học Trà Vinh;\\n*   Ban Quản lý Quỹ Phát triển Trường Đại học Trà Vinh;\\n*   Ngân hàng TMCP Á Châu (ACB).\\n\\nEm tên là: [Họ và tên]\\nNgày sinh: [Ngày/tháng/năm]\\nMã số sinh viên (MSSV): [MSSV]\\nLớp: [Lớp]\\nKhoa: [Khoa]\\nNgành học: [Ngành học]\\nĐiện thoại: [Số điện thoại]\\nEmail: [Địa chỉ email]\\nNăm học hiện tại: [Ví dụ: Năm thứ 3]\\n\\nEm viết đơn này với lòng kính trọng và mong muốn được trình bày hoàn cảnh của mình, xin được xem xét nhận hỗ trợ từ Quỹ \\\"Học bổng ACB Đồng hành cùng Sinh viên TVU Vượt khó Học tốt\\\".\\n\\nLà sinh viên hệ chính quy từ năm thứ [Ghi rõ năm thứ hiện tại, ví dụ: hai, ba...] trở lên của Trường Đại học Trà Vinh, em luôn ý thức được tầm quan trọng của việc học tập và không ngừng nỗ lực phấn đấu để đạt kết quả tốt nhất. Trong học kỳ gần nhất, em đã đạt điểm trung bình tích lũy (GPA) là [GPA, ví dụ: 3.5/4.0], vượt mức quy định của Quỹ.\\n\\nTuy nhiên, gia đình em hiện đang gặp rất nhiều khó khăn về tài chính. [Trình bày chi tiết hoàn cảnh khó khăn của gia đình một cách chân thành, ví dụ: \\\"Cha mẹ em đều là nông dân/công nhân, thu nhập không ổn định và chỉ đủ trang trải cuộc sống cơ bản hàng ngày. Trong gia đình còn có [số] anh chị em đang đi học/người thân bệnh tật, khiến gánh nặng kinh tế càng chồng chất. Mọi khoản chi phí từ học phí, sách vở cho đến sinh hoạt phí đều là một thách thức lớn đối với gia đình em, đôi khi phải vay mượn để đảm bảo em được tiếp tục đến trường.\\\"]. Gia đình em hiện thuộc diện [Hộ nghèo/Hộ cận nghèo] do chính quyền địa phương xác nhận, điều này càng làm tăng thêm áp lực trong việc duy trì việc học tập của em tại Trường.\\n\\nMặc dù hoàn cảnh khó khăn, em vẫn luôn cố gắng sắp xếp thời gian để vừa học tập, vừa tranh thủ làm thêm những công việc phù hợp để phụ giúp gia đình và trang trải một phần chi phí sinh hoạt. Tuy nhiên, nguồn thu nhập từ việc làm thêm vẫn chưa đủ để bù đắp các khoản chi phí học tập và sinh hoạt ngày càng tăng cao.\\n\\nVới niềm khao khát được tiếp tục học tập, rèn luyện và hoàn thành chương trình đại học tại TVU, em mạnh dạn kính mong Ban Giám hiệu Nhà trường, Ban Quản lý Quỹ Phát triển TVU và Ngân hàng TMCP Á Châu xem xét, tạo điều kiện giúp đỡ em nhận được học bổng quý báu này. Khoản hỗ trợ từ Quỹ không chỉ giúp em trang trải một phần học phí, chi phí sinh hoạt mà còn là nguồn động viên tinh thần to lớn, tiếp thêm sức mạnh để em vượt qua khó khăn, an tâm học tập và theo đuổi ước mơ.\\n\\nEm xin cam kết sẽ sử dụng khoản hỗ trợ một cách hiệu quả, đúng mục đích, tiếp tục nỗ lực không ngừng trong học tập và rèn luyện để đạt thành tích cao nhất, góp phần xây dựng Nhà trường và xã hội, xứng đáng với sự tin tưởng và kỳ vọng của Quỹ.\\n\\nEm xin chân thành cảm ơn!\\n\\nKính đơn,\\n[Ký và ghi rõ họ tên]\\n[Họ và tên]\",\"soTienDeNghi\":10000000,\"taiLieuDinhKem\":\"uploads/documents/cccd_1781676702821_684556124.jpg\"}', '127.0.0.1', '2026-06-17 06:11:42'),
(139, 12, 'DANG_XUAT', 'nguoidung', 12, '[Sinh viên] Nguyễn Minh cần: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 06:16:10'),
(140, 13, 'DANG_KY_TAI_KHOAN', 'nguoidung', 13, '[Sinh viên] Ha Văn Khâu: Đăng ký tài khoản sinh viên thành công', NULL, '{\"nguoidung_id\":13,\"hoten\":\"Ha Văn Khâu\",\"email\":\"khau@gmail.com\",\"vaitro_id\":4,\"loaitaikhoan\":\"SINH_VIEN\"}', '127.0.0.1', '2026-06-17 06:16:56'),
(141, 13, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Ha Văn Khâu: POST /api/upload/avatar - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/avatar\",\"statusCode\":200,\"durationMs\":22,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 06:17:05'),
(142, 13, 'CAP_NHAT_THONG_TIN_NGUOI_DUNG', 'nguoidung', 13, '[Sinh viên] Ha Văn Khâu: Cập nhật thông tin tài khoản cho người dùng khau@gmail.com (Họ tên: Ha Văn Khâu)', '{\"nguoidung_id\":13,\"masodinhdanh\":\"110122145\",\"hoten\":\"Ha Văn Khâu\",\"email\":\"khau@gmail.com\",\"avatar\":null,\"sodienthoai\":null,\"diachi\":null,\"vaitro_id\":4,\"loaitaikhoan\":\"SINH_VIEN\",\"khoaphong\":\"DA22TSA\",\"trangthai\":\"HOAT_DONG\",\"ngaytao\":\"2026-06-17T06:16:56.000Z\",\"tenvaitro\":\"sinhvien\",\"mota_vaitro\":\"Người dùng (Sinh viên, Nhà tài trợ)\"}', '{\"avatar\":\"uploads/avatars/staffs/khau_1781677025608_155195514.jpg\"}', '127.0.0.1', '2026-06-17 06:17:05'),
(143, 13, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Ha Văn Khâu: POST /api/bank-accounts - tác động dữ liệu thành công (201)', NULL, '{\"method\":\"POST\",\"path\":\"/api/bank-accounts\",\"statusCode\":201,\"durationMs\":8,\"params\":{},\"query\":{},\"body\":{\"soTaiKhoan\":\"0987678956745\",\"tenNganHang\":\"Agribank\",\"chuTaiKhoan\":\"HA VAN KHAU\",\"laMacDinh\":true}}', '127.0.0.1', '2026-06-17 06:17:34'),
(144, 13, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Ha Văn Khâu: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":69,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 06:19:21'),
(145, 13, 'NOP_YEU_CAU_HO_TRO', 'yeucauhotro', 11, '[Sinh viên] Ha Văn Khâu: Nộp đơn xin hỗ trợ từ quỹ \'Học bổng Tài năng TVU — Khối ngành Công nghệ Thông tin\' với số tiền đề nghị: 15.000.000 VNĐ', NULL, '{\"nguoiDungId\":13,\"quyId\":6,\"lyDo\":\"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\\nĐộc lập – Tự do – Hạnh phúc\\n----------------------------------\\n\\nTrà Vinh, ngày ... tháng ... năm ...\\n\\n**ĐƠN XIN HỖ TRỢ TỪ QUỸ \\\"HỌC BỔNG TÀI NĂNG TVU — KHỐI NGÀNH CÔNG NGHỆ THÔNG TIN\\\"**\\n\\n**Kính gửi:**\\n*   Ban Giám hiệu Trường Đại học Trà Vinh;\\n*   Ban Quản lý Quỹ \\\"Học bổng Tài năng TVU — Khối ngành Công nghệ Thông tin\\\".\\n\\n**Tôi tên là:** [Họ và tên sinh viên]\\n**Ngày sinh:** [Ngày/tháng/năm]\\n**Mã số sinh viên:** [Mã số sinh viên]\\n**Lớp:** [Tên lớp]\\n**Ngành học:** Công nghệ Thông tin\\n**Khoa:** [Tên Khoa, ví dụ: Khoa Kỹ thuật và Công nghệ]\\n**Số điện thoại:** [Số điện thoại liên hệ]\\n**Email:** [Địa chỉ Email]\\n\\nTôi viết đơn này với lòng kính trọng và mong muốn được Ban Quản lý Quỹ xem xét, hỗ trợ từ Quỹ \\\"Học bổng Tài năng TVU — Khối ngành Công nghệ Thông tin\\\".\\n\\nTrong suốt quá trình học tập tại Trường Đại học Trà Vinh, tôi luôn dành trọn tâm huyết và sự nỗ lực cao nhất để theo đuổi niềm đam mê với lĩnh vực Công nghệ Thông tin, một ngành học đầy tiềm năng và thách thức. Với tinh thần học hỏi không ngừng nghỉ và sự cố gắng trong rèn luyện, tôi đã vinh dự đạt được danh hiệu và **giải thưởng \\\"Sinh viên xuất sắc ngành Công nghệ Thông tin\\\"** trong năm học vừa qua. Thành tích này không chỉ là niềm tự hào của bản thân mà còn là minh chứng cho sự phấn đấu không ngừng, đáp ứng tiêu chí là sinh viên xuất sắc khối ngành Công nghệ Thông tin và đã đạt giải thưởng học thuật cấp trường trở lên, phù hợp với điều kiện của Quỹ học bổng.\\n\\nViệc được nhận học bổng từ Quỹ \\\"Học bổng Tài năng TVU — Khối ngành Công nghệ Thông tin\\\", một học bổng được tài trợ bởi Tập đoàn FPT – một đơn vị hàng đầu trong lĩnh vực này, sẽ là nguồn động viên vô cùng to lớn. Khoản hỗ trợ này không chỉ giúp tôi có thêm điều kiện và động lực để tiếp tục chuyên tâm vào việc học tập, nghiên cứu chuyên sâu, tham gia các dự án thực tế, mà còn phát triển các kỹ năng cần thiết cho sự nghiệp tương lai trong ngành Công nghệ Thông tin. Tôi tin rằng sự hỗ trợ này sẽ là bệ phóng vững chắc để tôi phát huy tối đa năng lực và đóng góp tích cực cho cộng đồng.\\n\\nKính mong Ban Quản lý Quỹ và Ban Giám hiệu Nhà trường xem xét và chấp thuận nguyện vọng của tôi.\\n\\nTôi xin chân thành cảm ơn sự quan tâm và tạo điều kiện của quý Ban. Tôi cam kết sẽ sử dụng khoản học bổng một cách hiệu quả nhất, tiếp tục giữ vững thành tích học tập xuất sắc, không ngừng trau dồi kiến thức và kỹ năng, xứng đáng với sự tin tưởng và hỗ trợ của Quỹ và Nhà trường.\\n\\nTrân trọng kính chào!\\n\\n**Người làm đơn**\\n(Ký và ghi rõ họ tên)\\n[Chữ ký]\\n[Họ và tên sinh viên]\",\"soTienDeNghi\":15000000,\"taiLieuDinhKem\":\"uploads/documents/cccdms_1781677161045_247609762.jpg\"}', '127.0.0.1', '2026-06-17 06:19:21'),
(146, 13, 'DANG_XUAT', 'nguoidung', 13, '[Sinh viên] Ha Văn Khâu: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 06:19:29'),
(147, 14, 'DANG_KY_TAI_KHOAN', 'nguoidung', 14, '[Sinh viên] Nguyễn Quỳnh Thông: Đăng ký tài khoản sinh viên thành công', NULL, '{\"nguoidung_id\":14,\"hoten\":\"Nguyễn Quỳnh Thông\",\"email\":\"thong@gmail.com\",\"vaitro_id\":4,\"loaitaikhoan\":\"SINH_VIEN\"}', '127.0.0.1', '2026-06-17 06:20:30'),
(148, 14, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Nguyễn Quỳnh Thông: POST /api/upload/avatar - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/avatar\",\"statusCode\":200,\"durationMs\":18,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 06:20:46'),
(149, 14, 'CAP_NHAT_THONG_TIN_NGUOI_DUNG', 'nguoidung', 14, '[Sinh viên] Nguyễn Quỳnh Thông: Cập nhật thông tin tài khoản cho người dùng thong@gmail.com (Họ tên: Nguyễn Quỳnh Thông)', '{\"nguoidung_id\":14,\"masodinhdanh\":\"110122156\",\"hoten\":\"Nguyễn Quỳnh Thông\",\"email\":\"thong@gmail.com\",\"avatar\":null,\"sodienthoai\":null,\"diachi\":null,\"vaitro_id\":4,\"loaitaikhoan\":\"SINH_VIEN\",\"khoaphong\":\"DA22TTC\",\"trangthai\":\"HOAT_DONG\",\"ngaytao\":\"2026-06-17T06:20:30.000Z\",\"tenvaitro\":\"sinhvien\",\"mota_vaitro\":\"Người dùng (Sinh viên, Nhà tài trợ)\"}', '{\"avatar\":\"uploads/avatars/staffs/thong_1781677246966_590348501.jpg\"}', '127.0.0.1', '2026-06-17 06:20:46'),
(150, 14, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Nguyễn Quỳnh Thông: POST /api/bank-accounts - tác động dữ liệu thành công (201)', NULL, '{\"method\":\"POST\",\"path\":\"/api/bank-accounts\",\"statusCode\":201,\"durationMs\":17,\"params\":{},\"query\":{},\"body\":{\"soTaiKhoan\":\"03456789123\",\"tenNganHang\":\"Mbbank\",\"chuTaiKhoan\":\"NGUYEN QUYNH THONG\",\"laMacDinh\":true}}', '127.0.0.1', '2026-06-17 06:21:15'),
(151, 14, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Nguyễn Quỳnh Thông: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":50,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 06:22:51'),
(152, 14, 'NOP_YEU_CAU_HO_TRO', 'yeucauhotro', 12, '[Sinh viên] Nguyễn Quỳnh Thông: Nộp đơn xin hỗ trợ từ quỹ \'Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU\' với số tiền đề nghị: 16.000.000 VNĐ', NULL, '{\"nguoiDungId\":14,\"quyId\":12,\"lyDo\":\"**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**\\n**Độc lập – Tự do – Hạnh phúc**\\n***\\n*Trà Vinh, ngày [Điền ngày] tháng [Điền tháng] năm [Điền năm]*\\n\\n**ĐƠN XIN HỖ TRỢ TỪ QUỸ KHEN THƯỞNG NGHIÊN CỨU KHOA HỌC SINH VIÊN TVU**\\n\\n**Kính gửi:**\\n*   **Ban Quản lý Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU**\\n*   **Ban Giám hiệu Trường Đại học Trà Vinh**\\n*   **Phòng Khoa học Công nghệ**\\n\\nTôi tên là: **[Họ và tên sinh viên]**\\nNgày sinh: **[Ngày/tháng/năm]**\\nMã số sinh viên (MSSV): **[Điền MSSV]**\\nLớp: **[Điền Lớp]**\\nKhoa: **[Điền Khoa]**\\nNiên khóa: **[Điền Niên khóa]**\\nSố điện thoại: **[Điền SĐT]**\\nEmail: **[Điền Email]**\\n\\nVới lòng nhiệt huyết và niềm đam mê nghiên cứu khoa học, trong năm học hiện tại, tôi đã tham gia cuộc thi Nghiên cứu Khoa học cấp Trường với đề tài: **[Điền Tên đề tài nghiên cứu của bạn]**.\\n\\nBằng sự nỗ lực và tập trung cao độ trong suốt quá trình thực hiện, đề tài của tôi đã vinh dự đạt được **Giải Nhất** trong cuộc thi Nghiên cứu Khoa học sinh viên cấp Trường **[Điền Tên cuộc thi đầy đủ nếu có, ví dụ: \\\"Nghiên cứu khoa học sinh viên TVU năm học 2023-2024\\\"]**, một thành tích đáng tự hào và là kết quả của sự cống hiến không ngừng nghỉ. Thành tích này đã được Phòng Khoa học Công nghệ xác nhận.\\n\\nTheo thể lệ của Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU, Quỹ trao thưởng và hỗ trợ kinh phí nghiên cứu cho sinh viên đạt giải Nhất, Nhì, Ba tại các cuộc thi Nghiên cứu Khoa học cấp trường trở lên trong năm học hiện tại. Với thành tích đạt Giải Nhất cấp Trường, tôi kính mong Ban Quản lý Quỹ xem xét và hỗ trợ kinh phí theo quy định của Quỹ.\\n\\nKhoản hỗ trợ này không chỉ là sự công nhận cho những nỗ lực đã qua mà còn là nguồn động viên, khích lệ to lớn, tiếp thêm động lực để tôi tiếp tục theo đuổi con đường học tập và nghiên cứu khoa học, đóng góp vào sự phát triển chung của Nhà trường. Tôi cam kết sẽ sử dụng nguồn kinh phí này một cách hiệu quả, đúng mục đích, phục vụ cho việc học tập, phát triển bản thân và có thể đầu tư vào các dự án nghiên cứu khoa học tiếp theo.\\n\\nKính mong Ban Quản lý Quỹ, Ban Giám hiệu Nhà trường và Phòng Khoa học Công nghệ xem xét đơn và tạo điều kiện giúp đỡ.\\n\\nTôi xin chân thành cảm ơn.\\n\\n**Kính đơn,**\\n*(Ký và ghi rõ họ tên)*\\n\\n**[Họ và tên sinh viên]**\",\"soTienDeNghi\":16000000,\"taiLieuDinhKem\":\"uploads/documents/cccd_1781677371801_884357361.jpg\"}', '127.0.0.1', '2026-06-17 06:22:51'),
(153, 14, 'DANG_XUAT', 'nguoidung', 14, '[Sinh viên] Nguyễn Quỳnh Thông: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 06:22:58'),
(154, 15, 'DANG_KY_TAI_KHOAN', 'nguoidung', 15, '[Sinh viên] Châu Ngọc Thúy: Đăng ký tài khoản sinh viên thành công', NULL, '{\"nguoidung_id\":15,\"hoten\":\"Châu Ngọc Thúy\",\"email\":\"thuy@gmail.com\",\"vaitro_id\":4,\"loaitaikhoan\":\"SINH_VIEN\"}', '127.0.0.1', '2026-06-17 06:24:04'),
(155, 15, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Châu Ngọc Thúy: POST /api/upload/avatar - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/avatar\",\"statusCode\":200,\"durationMs\":14,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 06:24:13'),
(156, 15, 'CAP_NHAT_THONG_TIN_NGUOI_DUNG', 'nguoidung', 15, '[Sinh viên] Châu Ngọc Thúy: Cập nhật thông tin tài khoản cho người dùng thuy@gmail.com (Họ tên: Châu Ngọc Thúy)', '{\"nguoidung_id\":15,\"masodinhdanh\":\"110232542\",\"hoten\":\"Châu Ngọc Thúy\",\"email\":\"thuy@gmail.com\",\"avatar\":null,\"sodienthoai\":null,\"diachi\":null,\"vaitro_id\":4,\"loaitaikhoan\":\"SINH_VIEN\",\"khoaphong\":\"DA22TTC\",\"trangthai\":\"HOAT_DONG\",\"ngaytao\":\"2026-06-17T06:24:04.000Z\",\"tenvaitro\":\"sinhvien\",\"mota_vaitro\":\"Người dùng (Sinh viên, Nhà tài trợ)\"}', '{\"avatar\":\"uploads/avatars/staffs/thuy_1781677453108_453803590.jpg\"}', '127.0.0.1', '2026-06-17 06:24:13'),
(157, 15, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Châu Ngọc Thúy: POST /api/bank-accounts - tác động dữ liệu thành công (201)', NULL, '{\"method\":\"POST\",\"path\":\"/api/bank-accounts\",\"statusCode\":201,\"durationMs\":12,\"params\":{},\"query\":{},\"body\":{\"soTaiKhoan\":\"098765456789\",\"tenNganHang\":\"BIDV\",\"chuTaiKhoan\":\"CHAU NGOC THUY\",\"laMacDinh\":true}}', '127.0.0.1', '2026-06-17 06:24:34'),
(158, 15, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Châu Ngọc Thúy: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":14,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 06:26:22'),
(159, 15, 'NOP_YEU_CAU_HO_TRO', 'yeucauhotro', 13, '[Sinh viên] Châu Ngọc Thúy: Nộp đơn xin hỗ trợ từ quỹ \'Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU\' với số tiền đề nghị: 20.000.000 VNĐ', NULL, '{\"nguoiDungId\":15,\"quyId\":9,\"lyDo\":\"**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**\\n**Độc lập – Tự do – Hạnh phúc**\\n***\\n*Trà Vinh, ngày [Ngày] tháng [Tháng] năm [Năm]*\\n\\n**ĐƠN XIN HỖ TRỢ CHI PHÍ Y TẾ**\\n\\n**Kính gửi:**\\n*   **Ban Giám hiệu Trường Đại học Trà Vinh**\\n*   **Ban Quản lý Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU**\\n\\nTôi tên là: [Họ và tên sinh viên]\\nMã số sinh viên: [Mã số sinh viên]\\nLớp: [Lớp/Ngành học]\\nKhoa: [Tên Khoa]\\nĐiện thoại: [Số điện thoại]\\nEmail: [Địa chỉ email]\\n\\nTôi viết đơn này với lòng kính trọng và sự chân thành nhất, kính mong nhận được sự quan tâm, xem xét và hỗ trợ từ Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU.\\n\\nHiện tại, tôi đang trong quá trình điều trị một căn bệnh cần sự theo dõi và điều trị dài ngày, phát sinh nhiều chi phí y tế không nhỏ. Đây là một gánh nặng rất lớn đối với tôi và gia đình.\\n\\nHoàn cảnh gia đình tôi thuộc diện khó khăn, thu nhập chính của bố mẹ không ổn định và chỉ đủ trang trải các chi phí sinh hoạt thiết yếu hàng ngày, không có khả năng tích lũy để chi trả cho các khoản viện phí và thuốc men điều trị bệnh. Mọi nỗ lực của gia đình đều đang tập trung để duy trì việc điều trị, điều này đã và đang ảnh hưởng nghiêm trọng đến khả năng chi trả học phí và các chi phí sinh hoạt khác của tôi trong quá trình học tập tại trường.\\n\\nMặc dù gặp nhiều khó khăn về sức khỏe và hoàn cảnh gia đình, tôi luôn ý thức được tầm quan trọng của việc học và không ngừng nỗ lực vươn lên. Trong các học kỳ vừa qua, tôi đã cố gắng hết sức và đạt được nhiều thành tích học tập xuất sắc, nhận được sự đánh giá cao từ thầy cô và bạn bè. Tôi luôn khao khát được tiếp tục học tập và cống hiến sau này, nhưng gánh nặng bệnh tật và chi phí điều trị đang đe dọa trực tiếp đến tương lai đó.\\n\\nTôi hiểu rằng Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU được thành lập nhằm hỗ trợ một phần chi phí khám chữa bệnh, phẫu thuật và điều trị dài hạn cho sinh viên và thân nhân trực tiếp gặp bệnh hiểm nghèo hoặc tai nạn bất ngờ. Với hoàn cảnh hiện tại, tôi kính mong Ban Quản lý Quỹ xem xét và hỗ trợ một phần chi phí điều trị để tôi có thể yên tâm tiếp tục điều trị bệnh và duy trì việc học tập tại trường.\\n\\nTôi xin cam đoan những thông tin trên là hoàn toàn đúng sự thật và sẽ cung cấp đầy đủ các giấy tờ y tế liên quan, hóa đơn viện phí cùng các minh chứng về hoàn cảnh gia đình khi Quỹ yêu cầu.\\n\\nTôi xin chân thành cảm ơn sự quan tâm, giúp đỡ của Ban Giám hiệu Nhà trường và Ban Quản lý Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU. Tôi xin cam kết sẽ sử dụng khoản hỗ trợ đúng mục đích, phục vụ cho việc điều trị bệnh và không ngừng cố gắng trong học tập để xứng đáng với sự giúp đỡ quý báu này.\\n\\nKính mong nhận được sự xem xét và phản hồi sớm từ Quỹ.\\n\\nTrân trọng kính chào!\\n\\n**Người làm đơn**\\n*(Ký và ghi rõ họ tên)*\\n[Họ và tên sinh viên]\",\"soTienDeNghi\":20000000,\"taiLieuDinhKem\":\"uploads/documents/cccd_1781677582046_606236822.jpg\"}', '127.0.0.1', '2026-06-17 06:26:22'),
(160, 15, 'DANG_XUAT', 'nguoidung', 15, '[Sinh viên] Châu Ngọc Thúy: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 06:39:43'),
(161, 17, 'DANG_NHAP', 'nguoidung', 17, '[Nhà tài trợ] Ngân hàng TMCP Á Châu (ACB): Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 06:49:41'),
(162, 17, 'DANG_XUAT', 'nguoidung', 17, '[Nhà tài trợ] Ngân hàng TMCP Á Châu (ACB): Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 07:45:05'),
(163, 2, 'DANG_NHAP', 'nguoidung', 2, '[Nhân viên hệ thống] Trần Thị Kế Toán: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 07:45:23'),
(164, 2, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Trần Thị Kế Toán: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":7,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 07:53:05'),
(165, 2, 'DUYET_KHOAN_TAI_TRO', 'khoantaitro', 32, '[Nhân viên hệ thống] Trần Thị Kế Toán: Duyệt khoản tài trợ ID 32 số tiền 30000000.00 VNĐ của nhà tài trợ \'Siêu thị Co.opMart Trà Vinh\' vào quỹ \'Quỹ Hỗ trợ Sinh viên Vượt khó Trà Vinh\'', '{\"trangthai\":\"Cho duyet\"}', '{\"trangthai\":\"Da duyet\"}', '127.0.0.1', '2026-06-17 07:53:05'),
(166, 2, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Trần Thị Kế Toán: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":5,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 07:53:16'),
(167, 2, 'DUYET_KHOAN_TAI_TRO', 'khoantaitro', 31, '[Nhân viên hệ thống] Trần Thị Kế Toán: Duyệt khoản tài trợ ID 31 số tiền 80000000.00 VNĐ của nhà tài trợ \'Tập đoàn FPT\' vào quỹ \'Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU\'', '{\"trangthai\":\"Cho duyet\"}', '{\"trangthai\":\"Da duyet\"}', '127.0.0.1', '2026-06-17 07:53:16'),
(168, 2, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Trần Thị Kế Toán: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":25,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 07:53:32'),
(169, 2, 'DUYET_KHOAN_TAI_TRO', 'khoantaitro', 25, '[Nhân viên hệ thống] Trần Thị Kế Toán: Duyệt khoản tài trợ ID 25 số tiền 100000000.00 VNĐ của nhà tài trợ \'Siêu thị Co.opMart Trà Vinh\' vào quỹ \'Quỹ Cứu trợ Khẩn cấp Sinh viên Bị Thiên tai\'', '{\"trangthai\":\"Cho duyet\"}', '{\"trangthai\":\"Da duyet\"}', '127.0.0.1', '2026-06-17 07:53:32'),
(170, 2, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Trần Thị Kế Toán: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":7,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 07:53:52'),
(171, 2, 'DUYET_KHOAN_TAI_TRO', 'khoantaitro', 29, '[Nhân viên hệ thống] Trần Thị Kế Toán: Duyệt khoản tài trợ ID 29 số tiền 200000000.00 VNĐ của nhà tài trợ \'Ngân hàng Vietcombank Chi nhánh Trà Vinh\' vào quỹ \'Học bổng Thủ khoa Tuyển sinh TVU\'', '{\"trangthai\":\"Cho duyet\"}', '{\"trangthai\":\"Da duyet\"}', '127.0.0.1', '2026-06-17 07:53:52'),
(172, 2, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Trần Thị Kế Toán: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":10,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 07:54:05'),
(173, 2, 'DUYET_KHOAN_TAI_TRO', 'khoantaitro', 21, '[Nhân viên hệ thống] Trần Thị Kế Toán: Duyệt khoản tài trợ ID 21 số tiền 300000000.00 VNĐ của nhà tài trợ \'Ngân hàng TMCP Á Châu (ACB)\' vào quỹ \'Học bổng ACB Đồng hành cùng Sinh viên TVU Vượt khó Học tốt\'', '{\"trangthai\":\"Cho duyet\"}', '{\"trangthai\":\"Da duyet\"}', '127.0.0.1', '2026-06-17 07:54:05'),
(174, 2, 'DUYET_KHOAN_TAI_TRO', 'khoantaitro', 28, '[Nhân viên hệ thống] Trần Thị Kế Toán: Duyệt khoản tài trợ ID 28 số tiền 120000000.00 VNĐ của nhà tài trợ \'Hội Cựu sinh viên TVU tại TP.HCM\' vào quỹ \'Quỹ Hỗ trợ Sinh viên Khởi nghiệp TVU\'', '{\"trangthai\":\"Cho duyet\"}', '{\"trangthai\":\"Da duyet\"}', '127.0.0.1', '2026-06-17 07:54:16'),
(175, 2, 'DUYET_KHOAN_TAI_TRO', 'khoantaitro', 27, '[Nhân viên hệ thống] Trần Thị Kế Toán: Duyệt khoản tài trợ ID 27 số tiền 80000000.00 VNĐ của nhà tài trợ \'Công ty CP Dược phẩm Trà Vinh Pharma\' vào quỹ \'Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU\'', '{\"trangthai\":\"Cho duyet\"}', '{\"trangthai\":\"Da duyet\"}', '127.0.0.1', '2026-06-17 07:54:19'),
(176, 2, 'DUYET_KHOAN_TAI_TRO', 'khoantaitro', 19, '[Nhân viên hệ thống] Trần Thị Kế Toán: Duyệt khoản tài trợ ID 19 số tiền 500000000.00 VNĐ của nhà tài trợ \'Tập đoàn FPT\' vào quỹ \'Học bổng Tài năng TVU — Khối ngành Công nghệ Thông tin\'', '{\"trangthai\":\"Cho duyet\"}', '{\"trangthai\":\"Da duyet\"}', '127.0.0.1', '2026-06-17 07:54:21'),
(177, 2, 'DANG_XUAT', 'nguoidung', 2, '[Nhân viên hệ thống] Trần Thị Kế Toán: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 07:55:17'),
(178, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 07:55:36'),
(179, 1, 'XAC_NHAN_KHOAN_TAI_TRO', 'khoantaitro', 32, '[Nhân viên hệ thống] Nguyễn Văn Bình: Xác nhận đã nhận tiền đóng góp số tiền 30000000.00 VNĐ cho khoản tài trợ ID 32', '{\"trangthai\":\"Da duyet\"}', '{\"trangthai\":\"Da nhan\"}', '127.0.0.1', '2026-06-17 07:55:53'),
(180, 1, 'XAC_NHAN_KHOAN_TAI_TRO', 'khoantaitro', 31, '[Nhân viên hệ thống] Nguyễn Văn Bình: Xác nhận đã nhận tiền đóng góp số tiền 80000000.00 VNĐ cho khoản tài trợ ID 31', '{\"trangthai\":\"Da duyet\"}', '{\"trangthai\":\"Da nhan\"}', '127.0.0.1', '2026-06-17 07:55:55'),
(181, 1, 'XAC_NHAN_KHOAN_TAI_TRO', 'khoantaitro', 25, '[Nhân viên hệ thống] Nguyễn Văn Bình: Xác nhận đã nhận tiền đóng góp số tiền 100000000.00 VNĐ cho khoản tài trợ ID 25', '{\"trangthai\":\"Da duyet\"}', '{\"trangthai\":\"Da nhan\"}', '127.0.0.1', '2026-06-17 07:56:04'),
(182, 1, 'XAC_NHAN_KHOAN_TAI_TRO', 'khoantaitro', 29, '[Nhân viên hệ thống] Nguyễn Văn Bình: Xác nhận đã nhận tiền đóng góp số tiền 200000000.00 VNĐ cho khoản tài trợ ID 29', '{\"trangthai\":\"Da duyet\"}', '{\"trangthai\":\"Da nhan\"}', '127.0.0.1', '2026-06-17 07:56:08'),
(183, 1, 'XAC_NHAN_KHOAN_TAI_TRO', 'khoantaitro', 21, '[Nhân viên hệ thống] Nguyễn Văn Bình: Xác nhận đã nhận tiền đóng góp số tiền 300000000.00 VNĐ cho khoản tài trợ ID 21', '{\"trangthai\":\"Da duyet\"}', '{\"trangthai\":\"Da nhan\"}', '127.0.0.1', '2026-06-17 07:56:12'),
(184, 1, 'XAC_NHAN_KHOAN_TAI_TRO', 'khoantaitro', 19, '[Nhân viên hệ thống] Nguyễn Văn Bình: Xác nhận đã nhận tiền đóng góp số tiền 500000000.00 VNĐ cho khoản tài trợ ID 19', '{\"trangthai\":\"Da duyet\"}', '{\"trangthai\":\"Da nhan\"}', '127.0.0.1', '2026-06-17 07:56:16'),
(185, 1, 'CAP_NHAT_PHAN_QUYEN', 'phanquyen', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật ma trận phân quyền truy cập trang', '{\"landing_page\":{\"label\":\"Trang chủ\",\"path\":\"/\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"funds\":{\"label\":\"Danh mục quỹ\",\"path\":\"/funds\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"guidelines\":{\"label\":\"Hướng dẫn & Quy định\",\"path\":\"/guidelines\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"donors\":{\"label\":\"Vinh danh\",\"path\":\"/donors\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"profile\":{\"label\":\"Cá nhân\",\"path\":\"/profile\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"apply\":{\"label\":\"Tạo đơn\",\"path\":\"/apply\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":true,\"nhataitro\":true},\"track\":{\"label\":\"Tra cứu\",\"path\":\"/track\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"dashboard\":{\"label\":\"Trang tổng quan\",\"path\":\"/dashboard\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"users\":{\"label\":\"Quản lý người dùng\",\"path\":\"/users\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"xet_duyet\":{\"label\":\"Xét duyệt hồ sơ\",\"path\":\"/xet-duyet\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"quy\":{\"label\":\"Danh sách Quỹ\",\"path\":\"/quy\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nha_tai_tro\":{\"label\":\"Nhà tài trợ\",\"path\":\"/nha-tai-tro\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"sinh_vien_noi_bat\":{\"label\":\"Sinh viên nổi bật\",\"path\":\"/sinh-vien-noi-bat\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"tin_tuc\":{\"label\":\"Tin tức & Sự kiện\",\"path\":\"/tin-tuc\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"bao_cao\":{\"label\":\"Thống kê & Báo cáo\",\"path\":\"/bao-cao\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"khoan_tai_tro\":{\"label\":\"Khoản tài trợ\",\"path\":\"/khoan-tai-tro\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giao_dich\":{\"label\":\"Lịch sử giao dịch\",\"path\":\"/giao-dich\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giai_ngan\":{\"label\":\"Giải ngân hồ sơ\",\"path\":\"/giai-ngan\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"chung_tu\":{\"label\":\"Đối soát chứng từ\",\"path\":\"/chung-tu\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"phe_duyet\":{\"label\":\"Lịch sử phê duyệt\",\"path\":\"/phe-duyet\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"roles\":{\"label\":\"Hệ thống & Phân quyền\",\"path\":\"/roles\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nhat_ky\":{\"label\":\"Nhật ký hệ thống\",\"path\":\"/nhat-ky\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false}}', '{\"landing_page\":{\"label\":\"Trang chủ\",\"path\":\"/\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"funds\":{\"label\":\"Danh mục quỹ\",\"path\":\"/funds\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"guidelines\":{\"label\":\"Hướng dẫn & Quy định\",\"path\":\"/guidelines\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"donors\":{\"label\":\"Vinh danh\",\"path\":\"/donors\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"profile\":{\"label\":\"Cá nhân\",\"path\":\"/profile\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"apply\":{\"label\":\"Tạo đơn\",\"path\":\"/apply\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":true,\"nhataitro\":true},\"track\":{\"label\":\"Tra cứu\",\"path\":\"/track\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"dashboard\":{\"label\":\"Trang tổng quan\",\"path\":\"/dashboard\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"users\":{\"label\":\"Quản lý người dùng\",\"path\":\"/users\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"xet_duyet\":{\"label\":\"Xét duyệt hồ sơ\",\"path\":\"/xet-duyet\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"quy\":{\"label\":\"Danh sách Quỹ\",\"path\":\"/quy\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nha_tai_tro\":{\"label\":\"Nhà tài trợ\",\"path\":\"/nha-tai-tro\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"sinh_vien_noi_bat\":{\"label\":\"Sinh viên nổi bật\",\"path\":\"/sinh-vien-noi-bat\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"tin_tuc\":{\"label\":\"Tin tức & Sự kiện\",\"path\":\"/tin-tuc\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"bao_cao\":{\"label\":\"Thống kê & Báo cáo\",\"path\":\"/bao-cao\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"khoan_tai_tro\":{\"label\":\"Khoản tài trợ\",\"path\":\"/khoan-tai-tro\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giao_dich\":{\"label\":\"Lịch sử giao dịch\",\"path\":\"/giao-dich\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giai_ngan\":{\"label\":\"Giải ngân hồ sơ\",\"path\":\"/giai-ngan\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"chung_tu\":{\"label\":\"Đối soát chứng từ\",\"path\":\"/chung-tu\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"phe_duyet\":{\"label\":\"Lịch sử phê duyệt\",\"path\":\"/phe-duyet\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"roles\":{\"label\":\"Hệ thống & Phân quyền\",\"path\":\"/roles\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nhat_ky\":{\"label\":\"Nhật ký hệ thống\",\"path\":\"/nhat-ky\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false}}', '127.0.0.1', '2026-06-17 07:58:33'),
(186, 1, 'CAP_NHAT_PHAN_QUYEN', 'phanquyen', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật ma trận phân quyền truy cập trang', '{\"landing_page\":{\"label\":\"Trang chủ\",\"path\":\"/\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"funds\":{\"label\":\"Danh mục quỹ\",\"path\":\"/funds\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"guidelines\":{\"label\":\"Hướng dẫn & Quy định\",\"path\":\"/guidelines\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"donors\":{\"label\":\"Vinh danh\",\"path\":\"/donors\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"profile\":{\"label\":\"Cá nhân\",\"path\":\"/profile\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"apply\":{\"label\":\"Tạo đơn\",\"path\":\"/apply\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":true,\"nhataitro\":true},\"track\":{\"label\":\"Tra cứu\",\"path\":\"/track\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"dashboard\":{\"label\":\"Trang tổng quan\",\"path\":\"/dashboard\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"users\":{\"label\":\"Quản lý người dùng\",\"path\":\"/users\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"xet_duyet\":{\"label\":\"Xét duyệt hồ sơ\",\"path\":\"/xet-duyet\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"quy\":{\"label\":\"Danh sách Quỹ\",\"path\":\"/quy\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nha_tai_tro\":{\"label\":\"Nhà tài trợ\",\"path\":\"/nha-tai-tro\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"sinh_vien_noi_bat\":{\"label\":\"Sinh viên nổi bật\",\"path\":\"/sinh-vien-noi-bat\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"tin_tuc\":{\"label\":\"Tin tức & Sự kiện\",\"path\":\"/tin-tuc\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"bao_cao\":{\"label\":\"Thống kê & Báo cáo\",\"path\":\"/bao-cao\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"khoan_tai_tro\":{\"label\":\"Khoản tài trợ\",\"path\":\"/khoan-tai-tro\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giao_dich\":{\"label\":\"Lịch sử giao dịch\",\"path\":\"/giao-dich\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giai_ngan\":{\"label\":\"Giải ngân hồ sơ\",\"path\":\"/giai-ngan\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"chung_tu\":{\"label\":\"Đối soát chứng từ\",\"path\":\"/chung-tu\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"phe_duyet\":{\"label\":\"Lịch sử phê duyệt\",\"path\":\"/phe-duyet\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"roles\":{\"label\":\"Hệ thống & Phân quyền\",\"path\":\"/roles\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nhat_ky\":{\"label\":\"Nhật ký hệ thống\",\"path\":\"/nhat-ky\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false}}', '{\"landing_page\":{\"label\":\"Trang chủ\",\"path\":\"/\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"funds\":{\"label\":\"Danh mục quỹ\",\"path\":\"/funds\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"guidelines\":{\"label\":\"Hướng dẫn & Quy định\",\"path\":\"/guidelines\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"donors\":{\"label\":\"Vinh danh\",\"path\":\"/donors\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"profile\":{\"label\":\"Cá nhân\",\"path\":\"/profile\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"apply\":{\"label\":\"Tạo đơn\",\"path\":\"/apply\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":true,\"nhataitro\":true},\"track\":{\"label\":\"Tra cứu\",\"path\":\"/track\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"dashboard\":{\"label\":\"Trang tổng quan\",\"path\":\"/dashboard\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"users\":{\"label\":\"Quản lý người dùng\",\"path\":\"/users\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"xet_duyet\":{\"label\":\"Xét duyệt hồ sơ\",\"path\":\"/xet-duyet\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"quy\":{\"label\":\"Danh sách Quỹ\",\"path\":\"/quy\",\"admin\":false,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nha_tai_tro\":{\"label\":\"Nhà tài trợ\",\"path\":\"/nha-tai-tro\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"sinh_vien_noi_bat\":{\"label\":\"Sinh viên nổi bật\",\"path\":\"/sinh-vien-noi-bat\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"tin_tuc\":{\"label\":\"Tin tức & Sự kiện\",\"path\":\"/tin-tuc\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"bao_cao\":{\"label\":\"Thống kê & Báo cáo\",\"path\":\"/bao-cao\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"khoan_tai_tro\":{\"label\":\"Khoản tài trợ\",\"path\":\"/khoan-tai-tro\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giao_dich\":{\"label\":\"Lịch sử giao dịch\",\"path\":\"/giao-dich\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giai_ngan\":{\"label\":\"Giải ngân hồ sơ\",\"path\":\"/giai-ngan\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"chung_tu\":{\"label\":\"Đối soát chứng từ\",\"path\":\"/chung-tu\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"phe_duyet\":{\"label\":\"Lịch sử phê duyệt\",\"path\":\"/phe-duyet\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"roles\":{\"label\":\"Hệ thống & Phân quyền\",\"path\":\"/roles\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nhat_ky\":{\"label\":\"Nhật ký hệ thống\",\"path\":\"/nhat-ky\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false}}', '127.0.0.1', '2026-06-17 07:59:46'),
(187, 1, 'CAP_NHAT_PHAN_QUYEN', 'phanquyen', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật ma trận phân quyền truy cập trang', '{\"landing_page\":{\"label\":\"Trang chủ\",\"path\":\"/\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"funds\":{\"label\":\"Danh mục quỹ\",\"path\":\"/funds\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"guidelines\":{\"label\":\"Hướng dẫn & Quy định\",\"path\":\"/guidelines\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"donors\":{\"label\":\"Vinh danh\",\"path\":\"/donors\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"profile\":{\"label\":\"Cá nhân\",\"path\":\"/profile\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"apply\":{\"label\":\"Tạo đơn\",\"path\":\"/apply\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":true,\"nhataitro\":true},\"track\":{\"label\":\"Tra cứu\",\"path\":\"/track\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"dashboard\":{\"label\":\"Trang tổng quan\",\"path\":\"/dashboard\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"users\":{\"label\":\"Quản lý người dùng\",\"path\":\"/users\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"xet_duyet\":{\"label\":\"Xét duyệt hồ sơ\",\"path\":\"/xet-duyet\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"quy\":{\"label\":\"Danh sách Quỹ\",\"path\":\"/quy\",\"admin\":false,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nha_tai_tro\":{\"label\":\"Nhà tài trợ\",\"path\":\"/nha-tai-tro\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"sinh_vien_noi_bat\":{\"label\":\"Sinh viên nổi bật\",\"path\":\"/sinh-vien-noi-bat\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"tin_tuc\":{\"label\":\"Tin tức & Sự kiện\",\"path\":\"/tin-tuc\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"bao_cao\":{\"label\":\"Thống kê & Báo cáo\",\"path\":\"/bao-cao\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"khoan_tai_tro\":{\"label\":\"Khoản tài trợ\",\"path\":\"/khoan-tai-tro\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giao_dich\":{\"label\":\"Lịch sử giao dịch\",\"path\":\"/giao-dich\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giai_ngan\":{\"label\":\"Giải ngân hồ sơ\",\"path\":\"/giai-ngan\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"chung_tu\":{\"label\":\"Đối soát chứng từ\",\"path\":\"/chung-tu\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"phe_duyet\":{\"label\":\"Lịch sử phê duyệt\",\"path\":\"/phe-duyet\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"roles\":{\"label\":\"Hệ thống & Phân quyền\",\"path\":\"/roles\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nhat_ky\":{\"label\":\"Nhật ký hệ thống\",\"path\":\"/nhat-ky\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false}}', '{\"landing_page\":{\"label\":\"Trang chủ\",\"path\":\"/\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"funds\":{\"label\":\"Danh mục quỹ\",\"path\":\"/funds\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"guidelines\":{\"label\":\"Hướng dẫn & Quy định\",\"path\":\"/guidelines\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"donors\":{\"label\":\"Vinh danh\",\"path\":\"/donors\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"profile\":{\"label\":\"Cá nhân\",\"path\":\"/profile\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"apply\":{\"label\":\"Tạo đơn\",\"path\":\"/apply\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":true,\"nhataitro\":true},\"track\":{\"label\":\"Tra cứu\",\"path\":\"/track\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":true,\"nhataitro\":true},\"dashboard\":{\"label\":\"Trang tổng quan\",\"path\":\"/dashboard\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"users\":{\"label\":\"Quản lý người dùng\",\"path\":\"/users\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"xet_duyet\":{\"label\":\"Xét duyệt hồ sơ\",\"path\":\"/xet-duyet\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"quy\":{\"label\":\"Danh sách Quỹ\",\"path\":\"/quy\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nha_tai_tro\":{\"label\":\"Nhà tài trợ\",\"path\":\"/nha-tai-tro\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"sinh_vien_noi_bat\":{\"label\":\"Sinh viên nổi bật\",\"path\":\"/sinh-vien-noi-bat\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"tin_tuc\":{\"label\":\"Tin tức & Sự kiện\",\"path\":\"/tin-tuc\",\"admin\":true,\"canbo\":true,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"bao_cao\":{\"label\":\"Thống kê & Báo cáo\",\"path\":\"/bao-cao\",\"admin\":true,\"canbo\":true,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"khoan_tai_tro\":{\"label\":\"Khoản tài trợ\",\"path\":\"/khoan-tai-tro\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giao_dich\":{\"label\":\"Lịch sử giao dịch\",\"path\":\"/giao-dich\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"giai_ngan\":{\"label\":\"Giải ngân hồ sơ\",\"path\":\"/giai-ngan\",\"admin\":false,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"chung_tu\":{\"label\":\"Đối soát chứng từ\",\"path\":\"/chung-tu\",\"admin\":true,\"canbo\":false,\"ketoan\":true,\"sinhvien\":false,\"nhataitro\":false},\"phe_duyet\":{\"label\":\"Lịch sử phê duyệt\",\"path\":\"/phe-duyet\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"roles\":{\"label\":\"Hệ thống & Phân quyền\",\"path\":\"/roles\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false},\"nhat_ky\":{\"label\":\"Nhật ký hệ thống\",\"path\":\"/nhat-ky\",\"admin\":true,\"canbo\":false,\"ketoan\":false,\"sinhvien\":false,\"nhataitro\":false}}', '127.0.0.1', '2026-06-17 08:00:14'),
(188, 1, 'CAP_NHAT_CAI_DAT_HE_THONG', 'caidathethong', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: Cập nhật cấu hình hệ thống', '{\"ten_he_thong\":\"TVU Fund Management\",\"email_lien_he\":\"contact@tvu.edu.vn\",\"so_dien_thoai\":\"0294.3855246\",\"thoi_han_xu_ly_ngay\":5,\"so_cap_duyet\":2,\"ky_tu_ly_do_toi_thieu\":10,\"kich_thuoc_toi_da_mb\":5,\"so_file_toi_da\":5,\"dinh_dang_cho_phep\":[\"PDF\",\"JPG\",\"PNG\",\"DOC\"],\"maintenanceMode\":false}', '{\"ten_he_thong\":\"TVU Fund Management\",\"email_lien_he\":\"TVU@tvu.edu.vn\",\"so_dien_thoai\":\"0294.3855246\",\"thoi_han_xu_ly_ngay\":5,\"so_cap_duyet\":2,\"ky_tu_ly_do_toi_thieu\":10,\"kich_thuoc_toi_da_mb\":5,\"so_file_toi_da\":5,\"dinh_dang_cho_phep\":[\"PDF\",\"JPG\",\"PNG\",\"DOC\"],\"maintenanceMode\":false}', '127.0.0.1', '2026-06-17 08:50:15'),
(189, 1, 'DANG_XUAT', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 08:54:54'),
(190, 3, 'DANG_NHAP', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Cán Bộ: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 08:55:19'),
(191, 3, 'CAP_NHAT_THONG_TIN_NGUOI_DUNG', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Tùng: Cập nhật thông tin tài khoản cho người dùng canboquy@tvu.edu.vn (Họ tên: Lê Văn Cán Bộ)', '{\"nguoidung_id\":3,\"masodinhdanh\":\"CB001\",\"hoten\":\"Lê Văn Cán Bộ\",\"email\":\"canboquy@tvu.edu.vn\",\"avatar\":null,\"sodienthoai\":null,\"diachi\":null,\"vaitro_id\":3,\"loaitaikhoan\":null,\"khoaphong\":\"Văn phòng Quỹ Hỗ trợ\",\"trangthai\":\"HOAT_DONG\",\"ngaytao\":\"2026-06-02T11:40:34.000Z\",\"tenvaitro\":\"canboquy\",\"mota_vaitro\":\"Cán bộ quản lý Quỹ\"}', '{\"ho_ten\":\"Lê Văn Tùng\",\"email\":\"canboquy@tvu.edu.vn\",\"so_dien_thoai\":null,\"dia_chi\":null,\"khoa_phong\":null}', '127.0.0.1', '2026-06-17 08:55:44'),
(192, 3, 'DUYET_YEU_CAU_HO_TRO_CAP_1', 'yeucauhotro', 13, '[Nhân viên hệ thống] Lê Văn Tùng: Duyệt đơn xin hỗ trợ ID 13 ở cấp 1 (Cán bộ Quỹ/Giáo vụ). Trạng thái đổi thành \'Chờ duyệt cấp 2\'', '{\"trangthai\":\"Cho duyet cap 1\"}', '{\"trangthai\":\"Cho duyet cap 2\"}', '127.0.0.1', '2026-06-17 08:56:01'),
(193, 3, 'DUYET_YEU_CAU_HO_TRO_CAP_1', 'yeucauhotro', 12, '[Nhân viên hệ thống] Lê Văn Tùng: Duyệt đơn xin hỗ trợ ID 12 ở cấp 1 (Cán bộ Quỹ/Giáo vụ). Trạng thái đổi thành \'Chờ duyệt cấp 2\'', '{\"trangthai\":\"Cho duyet cap 1\"}', '{\"trangthai\":\"Cho duyet cap 2\"}', '127.0.0.1', '2026-06-17 08:56:10'),
(194, 3, 'DUYET_YEU_CAU_HO_TRO_CAP_1', 'yeucauhotro', 11, '[Nhân viên hệ thống] Lê Văn Tùng: Duyệt đơn xin hỗ trợ ID 11 ở cấp 1 (Cán bộ Quỹ/Giáo vụ). Trạng thái đổi thành \'Chờ duyệt cấp 2\'', '{\"trangthai\":\"Cho duyet cap 1\"}', '{\"trangthai\":\"Cho duyet cap 2\"}', '127.0.0.1', '2026-06-17 08:56:26'),
(195, 3, 'DUYET_YEU_CAU_HO_TRO_CAP_1', 'yeucauhotro', 9, '[Nhân viên hệ thống] Lê Văn Tùng: Duyệt đơn xin hỗ trợ ID 9 ở cấp 1 (Cán bộ Quỹ/Giáo vụ). Trạng thái đổi thành \'Chờ duyệt cấp 2\'', '{\"trangthai\":\"Cho duyet cap 1\"}', '{\"trangthai\":\"Cho duyet cap 2\"}', '127.0.0.1', '2026-06-17 08:56:37'),
(196, 3, 'DUYET_YEU_CAU_HO_TRO_CAP_1', 'yeucauhotro', 10, '[Nhân viên hệ thống] Lê Văn Tùng: Duyệt đơn xin hỗ trợ ID 10 ở cấp 1 (Cán bộ Quỹ/Giáo vụ). Trạng thái đổi thành \'Chờ duyệt cấp 2\'', '{\"trangthai\":\"Cho duyet cap 1\"}', '{\"trangthai\":\"Cho duyet cap 2\"}', '127.0.0.1', '2026-06-17 08:56:55'),
(197, 3, 'DANG_XUAT', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Tùng: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 08:57:01'),
(198, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 08:57:17');
INSERT INTO `nhatkyhethong` (`nhatkyhethong_id`, `nguoidung_id`, `hanhdong`, `loaidoituong`, `doituong_id`, `mota`, `dulieucu`, `dulieumoi`, `ipaddress`, `createdat`) VALUES
(199, 1, 'DUYET_YEU_CAU_HO_TRO_CAP_2', 'yeucauhotro', 13, '[Nhân viên hệ thống] Nguyễn Văn Bình: Duyệt đơn xin hỗ trợ ID 13 ở cấp 2 (Admin). Trạng thái đổi thành \'Chờ duyệt cấp 3\'', '{\"trangthai\":\"Cho duyet cap 2\"}', '{\"trangthai\":\"Cho duyet cap 3\"}', '127.0.0.1', '2026-06-17 08:57:38'),
(200, 1, 'DUYET_YEU_CAU_HO_TRO_CAP_2', 'yeucauhotro', 12, '[Nhân viên hệ thống] Nguyễn Văn Bình: Duyệt đơn xin hỗ trợ ID 12 ở cấp 2 (Admin). Trạng thái đổi thành \'Chờ duyệt cấp 3\'', '{\"trangthai\":\"Cho duyet cap 2\"}', '{\"trangthai\":\"Cho duyet cap 3\"}', '127.0.0.1', '2026-06-17 08:57:44'),
(201, 1, 'DUYET_YEU_CAU_HO_TRO_CAP_2', 'yeucauhotro', 11, '[Nhân viên hệ thống] Nguyễn Văn Bình: Duyệt đơn xin hỗ trợ ID 11 ở cấp 2 (Admin). Trạng thái đổi thành \'Chờ duyệt cấp 3\'', '{\"trangthai\":\"Cho duyet cap 2\"}', '{\"trangthai\":\"Cho duyet cap 3\"}', '127.0.0.1', '2026-06-17 08:57:51'),
(202, 1, 'DUYET_YEU_CAU_HO_TRO_CAP_2', 'yeucauhotro', 10, '[Nhân viên hệ thống] Nguyễn Văn Bình: Duyệt đơn xin hỗ trợ ID 10 ở cấp 2 (Admin). Trạng thái đổi thành \'Chờ duyệt cấp 3\'', '{\"trangthai\":\"Cho duyet cap 2\"}', '{\"trangthai\":\"Cho duyet cap 3\"}', '127.0.0.1', '2026-06-17 08:57:59'),
(203, 1, 'DANG_XUAT', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 08:58:04'),
(204, 2, 'DANG_NHAP', 'nguoidung', 2, '[Nhân viên hệ thống] Trần Thị Kế Toán: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 08:58:19'),
(205, 2, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Trần Thị Kế Toán: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":34,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 08:58:55'),
(206, 2, 'CAP_NHAT_YEU_CAU_HO_TRO', 'yeucauhotro', 13, '[Nhân viên hệ thống] Trần Thị Kế Toán: Phê duyệt cấp 3 và giải ngân thành công số tiền 20.000.000 VNĐ từ quỹ \'Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU\' cho đơn hỗ trợ ID 13', '{\"trangthai\":\"Cho duyet cap 3\"}', '{\"trangthai\":\"Da giai ngan\"}', '127.0.0.1', '2026-06-17 08:58:55'),
(207, 2, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Trần Thị Kế Toán: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":15,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 08:59:08'),
(208, 2, 'CAP_NHAT_YEU_CAU_HO_TRO', 'yeucauhotro', 12, '[Nhân viên hệ thống] Trần Thị Kế Toán: Phê duyệt cấp 3 và giải ngân thành công số tiền 16.000.000 VNĐ từ quỹ \'Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU\' cho đơn hỗ trợ ID 12', '{\"trangthai\":\"Cho duyet cap 3\"}', '{\"trangthai\":\"Da giai ngan\"}', '127.0.0.1', '2026-06-17 08:59:08'),
(209, 2, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Trần Thị Kế Toán: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":10,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 08:59:22'),
(210, 2, 'CAP_NHAT_YEU_CAU_HO_TRO', 'yeucauhotro', 11, '[Nhân viên hệ thống] Trần Thị Kế Toán: Phê duyệt cấp 3 và giải ngân thành công số tiền 15.000.000 VNĐ từ quỹ \'Học bổng Tài năng TVU — Khối ngành Công nghệ Thông tin\' cho đơn hỗ trợ ID 11', '{\"trangthai\":\"Cho duyet cap 3\"}', '{\"trangthai\":\"Da giai ngan\"}', '127.0.0.1', '2026-06-17 08:59:22'),
(211, 2, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Trần Thị Kế Toán: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":6,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-06-17 08:59:36'),
(212, 2, 'CAP_NHAT_YEU_CAU_HO_TRO', 'yeucauhotro', 10, '[Nhân viên hệ thống] Trần Thị Kế Toán: Phê duyệt cấp 3 và giải ngân thành công số tiền 10.000.000 VNĐ từ quỹ \'Học bổng ACB Đồng hành cùng Sinh viên TVU Vượt khó Học tốt\' cho đơn hỗ trợ ID 10', '{\"trangthai\":\"Cho duyet cap 3\"}', '{\"trangthai\":\"Da giai ngan\"}', '127.0.0.1', '2026-06-17 08:59:36'),
(213, 13, 'DANG_NHAP', 'nguoidung', 13, '[Sinh viên] Ha Văn Khâu: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 14:34:10'),
(214, 13, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Ha Văn Khâu: POST /api/danhgia - tác động dữ liệu thành công (201)', NULL, '{\"method\":\"POST\",\"path\":\"/api/danhgia\",\"statusCode\":201,\"durationMs\":88,\"params\":{},\"query\":{},\"body\":{\"hoTen\":\"Ha Văn Khâu\",\"khoa\":\"\",\"nienKhoa\":\"\",\"avatar\":\"http://localhost:5001/uploads/avatars/staffs/khau_1781677025608_155195514.jpg\",\"noiDung\":\"**\\\"Em thật sự biết ơn Quỹ Phát triển Trường Đại học Trà Vinh đã trao cho em cơ hội tiếp tục con đường học tập. Khoản hỗ trợ không chỉ giúp em trang trải một phần học phí và chi phí sinh hoạt mà còn là nguồn động viên rất lớn để em cố gắng hơn mỗi ngày. Em cảm nhận được sự quan tâm của Nhà trường, các doanh nghiệp và những nhà hảo tâm luôn đồng hành cùng sinh viên có hoàn cảnh khó khăn. Em sẽ nỗ lực học tập, rèn luyện thật tốt để không phụ lòng tin của mọi người và hy vọng sau khi tốt nghiệp sẽ c\"}}', '127.0.0.1', '2026-06-17 14:40:34'),
(215, 13, 'DANG_XUAT', 'nguoidung', 13, '[Sinh viên] Ha Văn Khâu: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 14:40:49'),
(216, 3, 'DANG_NHAP', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Tùng: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 14:41:17'),
(217, 3, 'API_CAP_NHAT', 'trangthai', 1, '[Nhân viên hệ thống] Lê Văn Tùng: PATCH /api/danhgia/1/trangthai - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"PATCH\",\"path\":\"/api/danhgia/1/trangthai\",\"statusCode\":200,\"durationMs\":12,\"params\":{\"id\":\"1\"},\"query\":{},\"body\":{\"trangThai\":\"Da duyet\"}}', '127.0.0.1', '2026-06-17 14:41:44'),
(218, 3, 'DANG_XUAT', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Tùng: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 14:43:12'),
(219, 12, 'DANG_NHAP', 'nguoidung', 12, '[Sinh viên] Nguyễn Minh cần: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 14:43:30'),
(220, 12, 'API_TAO_MOI', 'api', NULL, '[Sinh viên] Nguyễn Minh cần: POST /api/danhgia - tác động dữ liệu thành công (201)', NULL, '{\"method\":\"POST\",\"path\":\"/api/danhgia\",\"statusCode\":201,\"durationMs\":11,\"params\":{},\"query\":{},\"body\":{\"hoTen\":\"Nguyễn Minh cần\",\"khoa\":\"\",\"nienKhoa\":\"2022- 2026\",\"avatar\":\"http://localhost:5001/uploads/avatars/staffs/can_1781676538644_207500683.jpg\",\"noiDung\":\"\\\"Trước đây em đã nhiều lần lo lắng vì hoàn cảnh gia đình khó khăn, có lúc tưởng chừng phải tạm dừng việc học để phụ giúp ba mẹ. May mắn nhận được sự hỗ trợ từ Quỹ Phát triển Trường Đại học Trà Vinh, em có thêm điều kiện để tiếp tục theo đuổi ước mơ của mình. Sự giúp đỡ này không chỉ mang giá trị về vật chất mà còn tiếp thêm cho em niềm tin và động lực để cố gắng học tập, rèn luyện bản thân. Em xin gửi lời cảm ơn chân thành đến Nhà trường, Quỹ và các nhà tài trợ đã luôn quan tâm, đồng hành cùng\"}}', '127.0.0.1', '2026-06-17 14:44:34'),
(221, 12, 'DANG_XUAT', 'nguoidung', 12, '[Sinh viên] Nguyễn Minh cần: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-06-17 14:44:43'),
(222, 3, 'DANG_NHAP', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Tùng: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-06-17 14:45:44'),
(223, 3, 'API_CAP_NHAT', 'trangthai', 2, '[Nhân viên hệ thống] Lê Văn Tùng: PATCH /api/danhgia/2/trangthai - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"PATCH\",\"path\":\"/api/danhgia/2/trangthai\",\"statusCode\":200,\"durationMs\":11,\"params\":{\"id\":\"2\"},\"query\":{},\"body\":{\"trangThai\":\"Da duyet\"}}', '127.0.0.1', '2026-06-17 14:45:52'),
(224, 3, 'API_CAP_NHAT', 'noi-bat', 2, '[Nhân viên hệ thống] Lê Văn Tùng: PATCH /api/danhgia/2/noi-bat - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"PATCH\",\"path\":\"/api/danhgia/2/noi-bat\",\"statusCode\":200,\"durationMs\":9,\"params\":{\"id\":\"2\"},\"query\":{},\"body\":{\"noiBat\":true,\"thuTu\":0}}', '127.0.0.1', '2026-06-17 14:45:54');

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
(22, 8, 1, NULL, 'Cho duyet', NULL, NULL, '2026-06-16 18:02:32'),
(23, 8, 2, NULL, 'Cho duyet', NULL, NULL, '2026-06-16 18:02:32'),
(24, 8, 3, NULL, 'Cho duyet', NULL, NULL, '2026-06-16 18:02:32'),
(25, 9, 1, 3, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-17 08:56:37'),
(26, 9, 2, NULL, 'Cho duyet', NULL, NULL, '2026-06-17 05:47:01'),
(27, 9, 3, NULL, 'Cho duyet', NULL, NULL, '2026-06-17 05:47:01'),
(28, 10, 1, 3, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-17 08:56:55'),
(29, 10, 2, 1, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-17 08:57:59'),
(30, 10, 3, 2, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-17 08:59:36'),
(31, 11, 1, 3, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-17 08:56:26'),
(32, 11, 2, 1, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-17 08:57:51'),
(33, 11, 3, 2, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-17 08:59:22'),
(34, 12, 1, 3, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-17 08:56:10'),
(35, 12, 2, 1, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-17 08:57:44'),
(36, 12, 3, 2, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-17 08:59:08'),
(37, 13, 1, 3, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-17 08:56:01'),
(38, 13, 2, 1, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-17 08:57:38'),
(39, 13, 3, 2, 'Da duyet', NULL, 'đủ yêu cầu', '2026-06-17 08:58:55');

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
(4, 'Quỹ Hỗ trợ Sinh viên Vượt khó Trà Vinh', 1, 'Quỹ được thành lập nhằm hỗ trợ sinh viên Trường Đại học Trà Vinh có hoàn cảnh gia đình đặc biệt khó khăn, giúp các em duy trì việc học và không bỏ học giữa chừng vì lý do kinh tế.', 'uploads/avatars/fund/tvu-IMG_8704_1781675400458_351184858.png', 500000000.00, 350000000.00, 10000000.00, 50, 'Sinh viên hệ chính quy, thuộc hộ nghèo hoặc cận nghèo có xác nhận của địa phương, không bị kỷ luật từ mức cảnh cáo trở lên.', '2025-01-01', '2028-01-28', 'Dang hoat dong', 3, '2026-06-16 17:25:23', '2026-06-17 07:53:05'),
(5, 'Quỹ Cứu trợ Khẩn cấp Sinh viên Bị Thiên tai', 1, 'Quỹ hỗ trợ khẩn cấp dành cho sinh viên có gia đình bị ảnh hưởng nặng nề bởi thiên tai như lũ lụt, sạt lở đất tại khu vực Đồng bằng Sông Cửu Long.', 'uploads/avatars/fund/HB-tieuso_1781675430227_969890714.jpg', 300000000.00, 280000000.00, 15000000.00, 20, 'Sinh viên có gia đình bị thiệt hại tài sản do thiên tai, có xác nhận của UBND xã/phường nơi cư trú.', '2025-06-01', '2027-12-28', 'Dang hoat dong', 3, '2026-06-16 17:25:23', '2026-06-17 07:53:32'),
(6, 'Học bổng Tài năng TVU — Khối ngành Công nghệ Thông tin', 2, 'Học bổng dành riêng cho sinh viên xuất sắc khối ngành Công nghệ Thông tin, Kỹ thuật Phần mềm và Trí tuệ Nhân tạo. Được tài trợ bởi Tập đoàn FPT giai đoạn 2025-2028.', 'uploads/avatars/fund/online-bachelor-card-2_Bnt_8bKX_1781675564393_170159643.png', 1000000000.00, 1235000000.00, 20000000.00, 30, 'Sinh viên ngành CNTT đạt GPA từ 3.2 trở lên, có hoàn cảnh khó khăn hoặc đạt giải thưởng học thuật cấp trường trở lên.', '2025-01-01', '2028-12-30', 'Dang hoat dong', 3, '2026-06-16 17:25:23', '2026-06-17 08:59:22'),
(7, 'Học bổng ACB Đồng hành cùng Sinh viên TVU Vượt khó Học tốt', 2, 'Chương trình học bổng phối hợp giữa Quỹ Phát triển TVU và Ngân hàng TMCP Á Châu, trao tặng hàng năm cho sinh viên có thành tích học tập tốt và hoàn cảnh khó khăn thuộc mọi ngành học.', 'uploads/avatars/fund/HB7_1781675589859_499560317.jpg', 600000000.00, 710000000.00, 12000000.00, 50, 'Sinh viên hệ chính quy từ năm 2 trở lên, GPA học kỳ gần nhất đạt từ 2.8 trở lên, thuộc hộ nghèo hoặc cận nghèo.', '2025-03-01', '2026-06-17', 'Dang hoat dong', 3, '2026-06-16 17:25:23', '2026-06-17 08:59:36'),
(8, 'Học bổng Thủ khoa Tuyển sinh TVU', 2, 'Quỹ học bổng danh giá dành riêng để trao tặng cho thủ khoa đầu vào của Trường Đại học Trà Vinh mỗi năm học, nhằm thu hút và giữ chân nhân tài về học tập tại tỉnh nhà.', 'uploads/avatars/fund/img_6264_1781675673103_519141767.jpeg', 200000000.00, 400000000.00, 30000000.00, 5, 'Thủ khoa đầu vào của từng khối ngành trong kỳ tuyển sinh chính thức của Trường Đại học Trà Vinh.', '2025-08-01', '2026-07-29', 'Dang hoat dong', 3, '2026-06-16 17:25:23', '2026-06-17 07:53:52'),
(9, 'Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU', 3, 'Quỹ hỗ trợ một phần chi phí khám chữa bệnh, phẫu thuật và điều trị dài hạn cho sinh viên và thân nhân trực tiếp gặp bệnh hiểm nghèo hoặc tai nạn bất ngờ trong năm học.', 'uploads/avatars/fund/dhtv2_1781675645238_6732910.jpg', 400000000.00, 270000000.00, 25000000.00, 15, 'Sinh viên đang theo học hệ chính quy, có hóa đơn viện phí hoặc chứng từ y tế xác nhận tình trạng bệnh và chi phí điều trị.', '2025-01-01', '2028-01-28', 'Dang hoat dong', 3, '2026-06-16 17:25:23', '2026-06-17 08:58:55'),
(10, 'Quỹ Sinh viên TVU Xanh — Hành động vì Môi trường', 4, 'Quỹ tài trợ cho các dự án và hoạt động bảo vệ môi trường do sinh viên TVU khởi xướng, bao gồm trồng cây, làm sạch bãi biển, tái chế rác thải và nâng cao ý thức cộng đồng địa phương.', 'uploads/avatars/fund/DHTVHTGDVN_1781675714504_786906039.jpg', 150000000.00, 80000000.00, 5000000.00, 30, 'Nhóm sinh viên từ 3 người trở lên, có đề xuất dự án môi trường rõ ràng, được Đoàn Thanh niên hoặc Hội Sinh viên nhà trường xác nhận.', '2025-04-01', '2028-04-28', 'Dang hoat dong', 3, '2026-06-16 17:25:23', '2026-06-17 05:55:16'),
(11, 'Quỹ Hỗ trợ Sinh viên Khởi nghiệp TVU', 5, 'Quỹ cung cấp nguồn vốn ban đầu và hỗ trợ kết nối mentor cho các nhóm sinh viên TVU có ý tưởng khởi nghiệp sáng tạo, tiềm năng thương mại hóa cao trong lĩnh vực công nghệ và nông nghiệp.', 'uploads/avatars/fund/HB-2025_1781675740918_210848626.jpg', 800000000.00, 470000000.00, 50000000.00, 10, 'Nhóm sinh viên từ 2 đến 5 người, có bản kế hoạch kinh doanh chi tiết, đã tham gia ít nhất 1 buổi workshop khởi nghiệp do nhà trường tổ chức.', '2025-02-01', '2027-12-28', 'Dang hoat dong', 3, '2026-06-16 17:25:23', '2026-06-17 07:54:16'),
(12, 'Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU', 6, 'Quỹ trao thưởng và hỗ trợ kinh phí nghiên cứu cho sinh viên TVU đạt giải tại các cuộc thi Nghiên cứu Khoa học cấp trường, cấp tỉnh và cấp quốc gia trong năm học hiện tại.', 'uploads/avatars/fund/DHTV_1781675364511_625372277.jpg', 250000000.00, 194000000.00, 30000000.00, 20, 'Sinh viên đạt giải Nhất, Nhì, Ba tại cuộc thi Nghiên cứu Khoa học cấp trường trở lên trong năm học hiện tại, có xác nhận của Phòng Khoa học Công nghệ.', '2025-01-01', '2027-03-28', 'Dang hoat dong', 3, '2026-06-16 17:25:23', '2026-06-17 08:59:08'),
(13, 'Quỹ Hỗ trợ Sinh viên TVU Tham gia Thi đấu Thể thao Quốc gia', 6, 'Quỹ hỗ trợ chi phí đi lại, ăn ở và trang thiết bị thi đấu cho sinh viên TVU được tuyển chọn đại diện tỉnh Trà Vinh tham dự các giải thể thao sinh viên cấp quốc gia.', 'uploads/avatars/fund/img_6264_1781675782769_925998934.jpeg', 120000000.00, 65000000.00, 8000000.00, 15, 'Sinh viên được Ban Giám hiệu hoặc Phòng Công tác Sinh viên xác nhận đại diện trường tham dự giải thể thao cấp tỉnh hoặc quốc gia.', '2025-03-01', '2028-03-28', 'Dang hoat dong', 3, '2026-06-16 17:25:23', '2026-06-17 05:56:24');

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
(2, 15, 'Châu Ngọc Thúy', 'DA22TTC', '2026-2027', NULL, 'Nhận hỗ trợ từ TVU Fund và đạt thành tích tốt trong học tập.', 0, 'Hien thi', '2026-06-17 08:58:55', '2026-06-17 08:58:55'),
(3, 14, 'Nguyễn Quỳnh Thông', 'DA22TTC', '2026-2027', NULL, 'Nhận hỗ trợ từ TVU Fund và đạt thành tích tốt trong học tập.', 0, 'Hien thi', '2026-06-17 08:59:08', '2026-06-17 08:59:08'),
(4, 13, 'Ha Văn Khâu', 'DA22TSA', '2026-2027', NULL, 'Nhận hỗ trợ từ TVU Fund và đạt thành tích tốt trong học tập.', 0, 'Hien thi', '2026-06-17 08:59:22', '2026-06-17 08:59:22'),
(5, 12, 'Nguyễn Minh cần', 'DA22DCNA', '2026-2027', NULL, 'Nhận hỗ trợ từ TVU Fund và đạt thành tích tốt trong học tập.', 0, 'Hien thi', '2026-06-17 08:59:36', '2026-06-17 08:59:36');

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
(10, NULL, '0987654321', 'BIDV', NULL, 'NGUYEN MINH KHANG', 'Hoat dong', '2026-06-16 17:53:08', '2026-06-16 17:53:08'),
(11, NULL, '189278367456', 'BIDV', NULL, 'THAC PHAN DUNG', 'Hoat dong', '2026-06-17 05:44:26', '2026-06-17 05:44:26'),
(12, NULL, '0234516789', 'vietinbank', NULL, 'NGUYEN MINH CAN', 'Hoat dong', '2026-06-17 06:09:38', '2026-06-17 06:09:38'),
(13, NULL, '0987678956745', 'Agribank', NULL, 'HA VAN KHAU', 'Hoat dong', '2026-06-17 06:17:34', '2026-06-17 06:17:34'),
(14, NULL, '03456789123', 'Mbbank', NULL, 'NGUYEN QUYNH THONG', 'Hoat dong', '2026-06-17 06:21:15', '2026-06-17 06:21:15'),
(15, NULL, '098765456789', 'BIDV', NULL, 'CHAU NGOC THUY', 'Hoat dong', '2026-06-17 06:24:33', '2026-06-17 06:24:33');

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
-- Đang đổ dữ liệu cho bảng `yeucauhotro`
--

INSERT INTO `yeucauhotro` (`yeucauhotro_id`, `nguoidung_id`, `quy_id`, `lydo`, `sotiendenghi`, `tailieudinhkem`, `trangthai`, `ghichu`, `ngaynop`, `ngaycapnhat`) VALUES
(8, 10, 12, '**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**\n**Độc lập – Tự do – Hạnh phúc**\n***\nTrà Vinh, ngày .... tháng .... năm ....\n\n**ĐƠN XIN HỖ TRỢ KINH PHÍ TỪ QUỸ KHEN THƯỞNG NGHIÊN CỨU KHOA HỌC SINH VIÊN TVU**\n\n**Kính gửi:**\n*   Ban Giám hiệu Trường Đại học Trà Vinh;\n*   Phòng Khoa học Công nghệ, Trường Đại học Trà Vinh;\n*   Ban Quản lý Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU.\n\nEm tên là: [Họ và tên sinh viên]\nNgày sinh: [Ngày/tháng/năm sinh]\nMã số sinh viên: [MSSV]\nLớp: [Tên lớp/Ngành học]\nKhoa: [Tên Khoa]\nSố điện thoại: [Số điện thoại liên hệ]\nEmail: [Địa chỉ email]\n\nEm xin trình bày nội dung như sau:\n\nLà một sinh viên của Trường Đại học Trà Vinh, em luôn ý thức được tầm quan trọng của việc học tập gắn liền với nghiên cứu khoa học để phát triển bản thân và đóng góp cho cộng đồng. Với sự nỗ lực và niềm đam mê nghiên cứu, trong năm học [Năm học hiện tại], em đã mạnh dạn tham gia và hoàn thành xuất sắc đề tài nghiên cứu khoa học \"[Tên đề tài nghiên cứu của sinh viên]\" và vinh dự đạt được **Giải Nhất** tại cuộc thi Nghiên cứu Khoa học cấp [Trường/Tỉnh/Quốc gia] do [Đơn vị tổ chức cuộc thi] tổ chức. Thành tích này đã được Phòng Khoa học Công nghệ của Nhà trường xác nhận.\n\nKính thưa Quý Ban,\nTrong quá trình thực hiện đề tài nghiên cứu khoa học, em đã dành rất nhiều thời gian, công sức và tâm huyết. Mặc dù luôn nhận được sự hướng dẫn tận tình từ giảng viên và sự hỗ trợ từ Nhà trường, nhưng việc cân bằng giữa lịch học chính khóa và yêu cầu của một đề tài nghiên cứu khoa học cũng đặt ra không ít thử thách và đòi hỏi sự chủ động cao về mọi mặt, bao gồm cả việc trang trải một phần chi phí phát sinh cho tài liệu, vật tư thí nghiệm hay in ấn tài liệu phục vụ nghiên cứu. Đây là những khó khăn mà bất kỳ sinh viên nào cũng có thể gặp phải khi dấn thân vào con đường nghiên cứu khoa học.\n\nEm hiểu rằng Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU được thành lập nhằm kịp thời động viên, khen thưởng và hỗ trợ kinh phí cho các sinh viên có thành tích xuất sắc trong nghiên cứu khoa học. Với giải Nhất mà em đã đạt được, em tha thiết làm đơn này kính mong Ban Quản lý Quỹ xem xét và hỗ trợ một phần kinh phí từ Quỹ.\n\nKhoản hỗ trợ này sẽ là nguồn động viên vô cùng to lớn, giúp em có thêm động lực để tiếp tục theo đuổi đam mê nghiên cứu khoa học, không ngừng học hỏi, sáng tạo và phát huy năng lực của bản thân trong tương lai. Em xin cam kết sẽ sử dụng nguồn kinh phí được hỗ trợ một cách hợp lý, đúng mục đích và hiệu quả nhất, góp phần vào thành tích chung của Nhà trường.\n\nEm xin chân thành cảm ơn sự quan tâm và tạo điều kiện của Ban Giám hiệu Nhà trường, Phòng Khoa học Công nghệ và Ban Quản lý Quỹ.\n\nKính mong Quý Ban xem xét và chấp thuận.\n\n**Kính đơn,**\n\n**(Ký và ghi rõ họ tên)**\n[Họ và tên sinh viên]', 12000000.00, 'uploads/documents/cccdms_1781632952113_151923069.jpg', 'Cho duyet cap 1', NULL, '2026-06-16 18:02:32', '2026-06-16 18:02:32'),
(9, 11, 4, '**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**\n**Độc lập – Tự do – Hạnh phúc**\n***\n*Trà Vinh, ngày [Ngày] tháng [Tháng] năm [Năm]*\n\n**ĐƠN XIN HỖ TRỢ TỪ QUỸ \"QUỸ HỖ TRỢ SINH VIÊN VƯỢT KHÓ TRÀ VINH\"**\n\n**Kính gửi:**\n*   **Ban Quản lý Quỹ \"Quỹ Hỗ trợ Sinh viên Vượt khó Trà Vinh\"**\n*   **Ban Giám hiệu Trường Đại học Trà Vinh**\n\nTôi tên là: [Họ và tên sinh viên]\nMã số sinh viên: [Mã số sinh viên]\nLớp: [Tên lớp]\nNgành: [Tên ngành học]\nKhoa: [Tên khoa]\nĐiện thoại: [Số điện thoại]\nEmail: [Địa chỉ email]\n\nTôi viết đơn này kính mong Quý Ban xem xét, tạo điều kiện hỗ trợ kinh phí từ Quỹ \"Quỹ Hỗ trợ Sinh viên Vượt khó Trà Vinh\" để tôi có thể tiếp tục việc học tập tại Trường.\n\n**Hoàn cảnh gia đình và lý do xin hỗ trợ:**\nGia đình tôi hiện đang gặp rất nhiều khó khăn về kinh tế. Thu nhập chính của gia đình rất bấp bênh và không đủ để trang trải các chi phí sinh hoạt hàng ngày, cũng như các khoản chi phí học tập của tôi. Điều này khiến việc đóng học phí đúng hạn để duy trì việc học tại Trường trở thành một gánh nặng rất lớn và vượt quá khả năng chi trả của gia đình tôi vào thời điểm hiện tại.\n\nTôi là sinh viên hệ chính quy của Trường Đại học Trà Vinh, luôn cố gắng trong học tập và rèn luyện. Tuy nhiên, trước hoàn cảnh kinh tế eo hẹp của gia đình, tôi đang đối mặt với nguy cơ rất lớn là phải gián đoạn việc học, thậm chí là bỏ học giữa chừng nếu không nhận được sự giúp đỡ. Ước mơ được tốt nghiệp đại học, có một tương lai tốt đẹp hơn để phụ giúp gia đình đang đứng trước thử thách lớn.\n\nTôi nhận thấy Quỹ \"Quỹ Hỗ trợ Sinh viên Vượt khó Trà Vinh\" được thành lập nhằm hỗ trợ những sinh viên có hoàn cảnh đặc biệt khó khăn như tôi để các em có thể duy trì việc học, không bỏ học giữa chừng vì lý do kinh tế. Tôi cam đoan bản thân đáp ứng các tiêu chí của Quỹ, cụ thể là sinh viên hệ chính quy, không bị kỷ luật từ mức cảnh cáo trở lên, và gia đình tôi thuộc diện có hoàn cảnh đặc biệt khó khăn (thuộc hộ nghèo/cận nghèo/có xác nhận của địa phương về hoàn cảnh khó khăn đặc biệt).\n\nVới tất cả sự chân thành và niềm hy vọng, tôi tha thiết kính mong Ban Quản lý Quỹ và Ban Giám hiệu Nhà trường xem xét hoàn cảnh của tôi và tạo điều kiện giúp đỡ tôi vượt qua giai đoạn khó khăn này, để tôi có thể tiếp tục con đường học vấn và hoàn thành ước mơ của mình.\n\n**Lời cam kết:**\nNếu được Quý Ban hỗ trợ, tôi xin cam kết sẽ sử dụng số tiền hỗ trợ đúng mục đích, phục vụ trực tiếp cho việc đóng học phí và các chi phí thiết yếu khác liên quan đến học tập như mua sách vở, tài liệu. Tôi sẽ cố gắng hết sức mình trong học tập và rèn luyện để đạt được kết quả tốt nhất, xứng đáng với sự tin tưởng và hỗ trợ của Quý Ban, không phụ lòng cha mẹ, thầy cô và những người đã giúp đỡ tôi.\n\nKính mong Quý Ban xem xét và chấp thuận.\n\nTôi xin chân thành cảm ơn!\n\n**Người làm đơn**\n*(Ký và ghi rõ họ tên)*\n[Họ và tên sinh viên]', 10000000.00, 'uploads/documents/DHTV_1781675221538_895102938.jpg', 'Cho duyet cap 2', NULL, '2026-06-17 05:47:01', '2026-06-17 08:56:37'),
(10, 12, 7, '**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**\n**Độc lập – Tự do – Hạnh phúc**\n***\n*Trà Vinh, ngày [Ngày] tháng [Tháng] năm [Năm]*\n\n**ĐƠN XIN HỖ TRỢ TỪ QUỸ \"HỌC BỔNG ACB ĐỒNG HÀNH CÙNG SINH VIÊN TVU VƯỢT KHÓ HỌC TỐT\"**\n\nKính gửi:\n*   Ban Giám hiệu Trường Đại học Trà Vinh;\n*   Ban Quản lý Quỹ Phát triển Trường Đại học Trà Vinh;\n*   Ngân hàng TMCP Á Châu (ACB).\n\nEm tên là: [Họ và tên]\nNgày sinh: [Ngày/tháng/năm]\nMã số sinh viên (MSSV): [MSSV]\nLớp: [Lớp]\nKhoa: [Khoa]\nNgành học: [Ngành học]\nĐiện thoại: [Số điện thoại]\nEmail: [Địa chỉ email]\nNăm học hiện tại: [Ví dụ: Năm thứ 3]\n\nEm viết đơn này với lòng kính trọng và mong muốn được trình bày hoàn cảnh của mình, xin được xem xét nhận hỗ trợ từ Quỹ \"Học bổng ACB Đồng hành cùng Sinh viên TVU Vượt khó Học tốt\".\n\nLà sinh viên hệ chính quy từ năm thứ [Ghi rõ năm thứ hiện tại, ví dụ: hai, ba...] trở lên của Trường Đại học Trà Vinh, em luôn ý thức được tầm quan trọng của việc học tập và không ngừng nỗ lực phấn đấu để đạt kết quả tốt nhất. Trong học kỳ gần nhất, em đã đạt điểm trung bình tích lũy (GPA) là [GPA, ví dụ: 3.5/4.0], vượt mức quy định của Quỹ.\n\nTuy nhiên, gia đình em hiện đang gặp rất nhiều khó khăn về tài chính. [Trình bày chi tiết hoàn cảnh khó khăn của gia đình một cách chân thành, ví dụ: \"Cha mẹ em đều là nông dân/công nhân, thu nhập không ổn định và chỉ đủ trang trải cuộc sống cơ bản hàng ngày. Trong gia đình còn có [số] anh chị em đang đi học/người thân bệnh tật, khiến gánh nặng kinh tế càng chồng chất. Mọi khoản chi phí từ học phí, sách vở cho đến sinh hoạt phí đều là một thách thức lớn đối với gia đình em, đôi khi phải vay mượn để đảm bảo em được tiếp tục đến trường.\"]. Gia đình em hiện thuộc diện [Hộ nghèo/Hộ cận nghèo] do chính quyền địa phương xác nhận, điều này càng làm tăng thêm áp lực trong việc duy trì việc học tập của em tại Trường.\n\nMặc dù hoàn cảnh khó khăn, em vẫn luôn cố gắng sắp xếp thời gian để vừa học tập, vừa tranh thủ làm thêm những công việc phù hợp để phụ giúp gia đình và trang trải một phần chi phí sinh hoạt. Tuy nhiên, nguồn thu nhập từ việc làm thêm vẫn chưa đủ để bù đắp các khoản chi phí học tập và sinh hoạt ngày càng tăng cao.\n\nVới niềm khao khát được tiếp tục học tập, rèn luyện và hoàn thành chương trình đại học tại TVU, em mạnh dạn kính mong Ban Giám hiệu Nhà trường, Ban Quản lý Quỹ Phát triển TVU và Ngân hàng TMCP Á Châu xem xét, tạo điều kiện giúp đỡ em nhận được học bổng quý báu này. Khoản hỗ trợ từ Quỹ không chỉ giúp em trang trải một phần học phí, chi phí sinh hoạt mà còn là nguồn động viên tinh thần to lớn, tiếp thêm sức mạnh để em vượt qua khó khăn, an tâm học tập và theo đuổi ước mơ.\n\nEm xin cam kết sẽ sử dụng khoản hỗ trợ một cách hiệu quả, đúng mục đích, tiếp tục nỗ lực không ngừng trong học tập và rèn luyện để đạt thành tích cao nhất, góp phần xây dựng Nhà trường và xã hội, xứng đáng với sự tin tưởng và kỳ vọng của Quỹ.\n\nEm xin chân thành cảm ơn!\n\nKính đơn,\n[Ký và ghi rõ họ tên]\n[Họ và tên]', 10000000.00, 'uploads/documents/cccd_1781676702821_684556124.jpg', 'Da giai ngan', NULL, '2026-06-17 06:11:42', '2026-06-17 08:59:36'),
(11, 13, 6, 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập – Tự do – Hạnh phúc\n----------------------------------\n\nTrà Vinh, ngày ... tháng ... năm ...\n\n**ĐƠN XIN HỖ TRỢ TỪ QUỸ \"HỌC BỔNG TÀI NĂNG TVU — KHỐI NGÀNH CÔNG NGHỆ THÔNG TIN\"**\n\n**Kính gửi:**\n*   Ban Giám hiệu Trường Đại học Trà Vinh;\n*   Ban Quản lý Quỹ \"Học bổng Tài năng TVU — Khối ngành Công nghệ Thông tin\".\n\n**Tôi tên là:** [Họ và tên sinh viên]\n**Ngày sinh:** [Ngày/tháng/năm]\n**Mã số sinh viên:** [Mã số sinh viên]\n**Lớp:** [Tên lớp]\n**Ngành học:** Công nghệ Thông tin\n**Khoa:** [Tên Khoa, ví dụ: Khoa Kỹ thuật và Công nghệ]\n**Số điện thoại:** [Số điện thoại liên hệ]\n**Email:** [Địa chỉ Email]\n\nTôi viết đơn này với lòng kính trọng và mong muốn được Ban Quản lý Quỹ xem xét, hỗ trợ từ Quỹ \"Học bổng Tài năng TVU — Khối ngành Công nghệ Thông tin\".\n\nTrong suốt quá trình học tập tại Trường Đại học Trà Vinh, tôi luôn dành trọn tâm huyết và sự nỗ lực cao nhất để theo đuổi niềm đam mê với lĩnh vực Công nghệ Thông tin, một ngành học đầy tiềm năng và thách thức. Với tinh thần học hỏi không ngừng nghỉ và sự cố gắng trong rèn luyện, tôi đã vinh dự đạt được danh hiệu và **giải thưởng \"Sinh viên xuất sắc ngành Công nghệ Thông tin\"** trong năm học vừa qua. Thành tích này không chỉ là niềm tự hào của bản thân mà còn là minh chứng cho sự phấn đấu không ngừng, đáp ứng tiêu chí là sinh viên xuất sắc khối ngành Công nghệ Thông tin và đã đạt giải thưởng học thuật cấp trường trở lên, phù hợp với điều kiện của Quỹ học bổng.\n\nViệc được nhận học bổng từ Quỹ \"Học bổng Tài năng TVU — Khối ngành Công nghệ Thông tin\", một học bổng được tài trợ bởi Tập đoàn FPT – một đơn vị hàng đầu trong lĩnh vực này, sẽ là nguồn động viên vô cùng to lớn. Khoản hỗ trợ này không chỉ giúp tôi có thêm điều kiện và động lực để tiếp tục chuyên tâm vào việc học tập, nghiên cứu chuyên sâu, tham gia các dự án thực tế, mà còn phát triển các kỹ năng cần thiết cho sự nghiệp tương lai trong ngành Công nghệ Thông tin. Tôi tin rằng sự hỗ trợ này sẽ là bệ phóng vững chắc để tôi phát huy tối đa năng lực và đóng góp tích cực cho cộng đồng.\n\nKính mong Ban Quản lý Quỹ và Ban Giám hiệu Nhà trường xem xét và chấp thuận nguyện vọng của tôi.\n\nTôi xin chân thành cảm ơn sự quan tâm và tạo điều kiện của quý Ban. Tôi cam kết sẽ sử dụng khoản học bổng một cách hiệu quả nhất, tiếp tục giữ vững thành tích học tập xuất sắc, không ngừng trau dồi kiến thức và kỹ năng, xứng đáng với sự tin tưởng và hỗ trợ của Quỹ và Nhà trường.\n\nTrân trọng kính chào!\n\n**Người làm đơn**\n(Ký và ghi rõ họ tên)\n[Chữ ký]\n[Họ và tên sinh viên]', 15000000.00, 'uploads/documents/cccdms_1781677161045_247609762.jpg', 'Da giai ngan', NULL, '2026-06-17 06:19:21', '2026-06-17 08:59:22'),
(12, 14, 12, '**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**\n**Độc lập – Tự do – Hạnh phúc**\n***\n*Trà Vinh, ngày [Điền ngày] tháng [Điền tháng] năm [Điền năm]*\n\n**ĐƠN XIN HỖ TRỢ TỪ QUỸ KHEN THƯỞNG NGHIÊN CỨU KHOA HỌC SINH VIÊN TVU**\n\n**Kính gửi:**\n*   **Ban Quản lý Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU**\n*   **Ban Giám hiệu Trường Đại học Trà Vinh**\n*   **Phòng Khoa học Công nghệ**\n\nTôi tên là: **[Họ và tên sinh viên]**\nNgày sinh: **[Ngày/tháng/năm]**\nMã số sinh viên (MSSV): **[Điền MSSV]**\nLớp: **[Điền Lớp]**\nKhoa: **[Điền Khoa]**\nNiên khóa: **[Điền Niên khóa]**\nSố điện thoại: **[Điền SĐT]**\nEmail: **[Điền Email]**\n\nVới lòng nhiệt huyết và niềm đam mê nghiên cứu khoa học, trong năm học hiện tại, tôi đã tham gia cuộc thi Nghiên cứu Khoa học cấp Trường với đề tài: **[Điền Tên đề tài nghiên cứu của bạn]**.\n\nBằng sự nỗ lực và tập trung cao độ trong suốt quá trình thực hiện, đề tài của tôi đã vinh dự đạt được **Giải Nhất** trong cuộc thi Nghiên cứu Khoa học sinh viên cấp Trường **[Điền Tên cuộc thi đầy đủ nếu có, ví dụ: \"Nghiên cứu khoa học sinh viên TVU năm học 2023-2024\"]**, một thành tích đáng tự hào và là kết quả của sự cống hiến không ngừng nghỉ. Thành tích này đã được Phòng Khoa học Công nghệ xác nhận.\n\nTheo thể lệ của Quỹ Khen thưởng Nghiên cứu Khoa học Sinh viên TVU, Quỹ trao thưởng và hỗ trợ kinh phí nghiên cứu cho sinh viên đạt giải Nhất, Nhì, Ba tại các cuộc thi Nghiên cứu Khoa học cấp trường trở lên trong năm học hiện tại. Với thành tích đạt Giải Nhất cấp Trường, tôi kính mong Ban Quản lý Quỹ xem xét và hỗ trợ kinh phí theo quy định của Quỹ.\n\nKhoản hỗ trợ này không chỉ là sự công nhận cho những nỗ lực đã qua mà còn là nguồn động viên, khích lệ to lớn, tiếp thêm động lực để tôi tiếp tục theo đuổi con đường học tập và nghiên cứu khoa học, đóng góp vào sự phát triển chung của Nhà trường. Tôi cam kết sẽ sử dụng nguồn kinh phí này một cách hiệu quả, đúng mục đích, phục vụ cho việc học tập, phát triển bản thân và có thể đầu tư vào các dự án nghiên cứu khoa học tiếp theo.\n\nKính mong Ban Quản lý Quỹ, Ban Giám hiệu Nhà trường và Phòng Khoa học Công nghệ xem xét đơn và tạo điều kiện giúp đỡ.\n\nTôi xin chân thành cảm ơn.\n\n**Kính đơn,**\n*(Ký và ghi rõ họ tên)*\n\n**[Họ và tên sinh viên]**', 16000000.00, 'uploads/documents/cccd_1781677371801_884357361.jpg', 'Da giai ngan', NULL, '2026-06-17 06:22:51', '2026-06-17 08:59:08'),
(13, 15, 9, '**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**\n**Độc lập – Tự do – Hạnh phúc**\n***\n*Trà Vinh, ngày [Ngày] tháng [Tháng] năm [Năm]*\n\n**ĐƠN XIN HỖ TRỢ CHI PHÍ Y TẾ**\n\n**Kính gửi:**\n*   **Ban Giám hiệu Trường Đại học Trà Vinh**\n*   **Ban Quản lý Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU**\n\nTôi tên là: [Họ và tên sinh viên]\nMã số sinh viên: [Mã số sinh viên]\nLớp: [Lớp/Ngành học]\nKhoa: [Tên Khoa]\nĐiện thoại: [Số điện thoại]\nEmail: [Địa chỉ email]\n\nTôi viết đơn này với lòng kính trọng và sự chân thành nhất, kính mong nhận được sự quan tâm, xem xét và hỗ trợ từ Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU.\n\nHiện tại, tôi đang trong quá trình điều trị một căn bệnh cần sự theo dõi và điều trị dài ngày, phát sinh nhiều chi phí y tế không nhỏ. Đây là một gánh nặng rất lớn đối với tôi và gia đình.\n\nHoàn cảnh gia đình tôi thuộc diện khó khăn, thu nhập chính của bố mẹ không ổn định và chỉ đủ trang trải các chi phí sinh hoạt thiết yếu hàng ngày, không có khả năng tích lũy để chi trả cho các khoản viện phí và thuốc men điều trị bệnh. Mọi nỗ lực của gia đình đều đang tập trung để duy trì việc điều trị, điều này đã và đang ảnh hưởng nghiêm trọng đến khả năng chi trả học phí và các chi phí sinh hoạt khác của tôi trong quá trình học tập tại trường.\n\nMặc dù gặp nhiều khó khăn về sức khỏe và hoàn cảnh gia đình, tôi luôn ý thức được tầm quan trọng của việc học và không ngừng nỗ lực vươn lên. Trong các học kỳ vừa qua, tôi đã cố gắng hết sức và đạt được nhiều thành tích học tập xuất sắc, nhận được sự đánh giá cao từ thầy cô và bạn bè. Tôi luôn khao khát được tiếp tục học tập và cống hiến sau này, nhưng gánh nặng bệnh tật và chi phí điều trị đang đe dọa trực tiếp đến tương lai đó.\n\nTôi hiểu rằng Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU được thành lập nhằm hỗ trợ một phần chi phí khám chữa bệnh, phẫu thuật và điều trị dài hạn cho sinh viên và thân nhân trực tiếp gặp bệnh hiểm nghèo hoặc tai nạn bất ngờ. Với hoàn cảnh hiện tại, tôi kính mong Ban Quản lý Quỹ xem xét và hỗ trợ một phần chi phí điều trị để tôi có thể yên tâm tiếp tục điều trị bệnh và duy trì việc học tập tại trường.\n\nTôi xin cam đoan những thông tin trên là hoàn toàn đúng sự thật và sẽ cung cấp đầy đủ các giấy tờ y tế liên quan, hóa đơn viện phí cùng các minh chứng về hoàn cảnh gia đình khi Quỹ yêu cầu.\n\nTôi xin chân thành cảm ơn sự quan tâm, giúp đỡ của Ban Giám hiệu Nhà trường và Ban Quản lý Quỹ Hỗ trợ Chi phí Y tế Sinh viên TVU. Tôi xin cam kết sẽ sử dụng khoản hỗ trợ đúng mục đích, phục vụ cho việc điều trị bệnh và không ngừng cố gắng trong học tập để xứng đáng với sự giúp đỡ quý báu này.\n\nKính mong nhận được sự xem xét và phản hồi sớm từ Quỹ.\n\nTrân trọng kính chào!\n\n**Người làm đơn**\n*(Ký và ghi rõ họ tên)*\n[Họ và tên sinh viên]', 20000000.00, 'uploads/documents/cccd_1781677582046_606236822.jpg', 'Da giai ngan', NULL, '2026-06-17 06:26:22', '2026-06-17 08:58:55');

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
  MODIFY `danhgia_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Mã đánh giá', AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `donvihoc`
--
ALTER TABLE `donvihoc`
  MODIFY `donvihoc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `giaodich`
--
ALTER TABLE `giaodich`
  MODIFY `giaodich_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT cho bảng `guest_khoantaitro`
--
ALTER TABLE `guest_khoantaitro`
  MODIFY `guest_khoantaitro_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `guest_yeucauhotro`
--
ALTER TABLE `guest_yeucauhotro`
  MODIFY `guest_yeucauhotro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `khoantaitro`
--
ALTER TABLE `khoantaitro`
  MODIFY `khoantaitro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT cho bảng `loaiquy`
--
ALTER TABLE `loaiquy`
  MODIFY `loaiquy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `nguoidung_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT cho bảng `nhataitro`
--
ALTER TABLE `nhataitro`
  MODIFY `nhataitro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT cho bảng `nhatkyhethong`
--
ALTER TABLE `nhatkyhethong`
  MODIFY `nhatkyhethong_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=225;

--
-- AUTO_INCREMENT cho bảng `pheduyet`
--
ALTER TABLE `pheduyet`
  MODIFY `pheduyet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT cho bảng `quy`
--
ALTER TABLE `quy`
  MODIFY `quy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `sinhviennoibat`
--
ALTER TABLE `sinhviennoibat`
  MODIFY `sinhviennoibat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `taikhoannganhang`
--
ALTER TABLE `taikhoannganhang`
  MODIFY `taikhoannganhang_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

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
  MODIFY `yeucauhotro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
