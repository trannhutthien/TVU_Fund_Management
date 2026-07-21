-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th7 15, 2026 lúc 07:00 PM
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
-- Cấu trúc bảng cho bảng `chucvuquy`
--

CREATE TABLE `chucvuquy` (
  `chucvu_id` int(11) NOT NULL,
  `nguoidung_id` int(11) DEFAULT NULL,
  `chucdanh` varchar(150) NOT NULL,
  `nhom` enum('Hoi dong quy','Ban dieu hanh','Ban kiem soat','Van phong thuong truc') NOT NULL,
  `ngaybatdaunhiemky` date DEFAULT NULL,
  `ngayketthucnhiemky` date DEFAULT NULL,
  `anh` varchar(255) DEFAULT NULL,
  `mota` text DEFAULT NULL,
  `thutu` int(11) DEFAULT 0,
  `trangthai` enum('Dang nhiem','Het nhiem ky') DEFAULT 'Dang nhiem',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhgia`
--

CREATE TABLE `danhgia` (
  `danhgia_id` int(11) NOT NULL,
  `nguoidung_id` int(11) NOT NULL,
  `noidung` text NOT NULL,
  `trangthai` varchar(30) DEFAULT 'Cho duyet',
  `lydotuchoi` text DEFAULT NULL,
  `nguoiduyet_id` int(11) DEFAULT NULL,
  `ngayduyet` datetime DEFAULT NULL,
  `noibat` tinyint(1) DEFAULT 0,
  `thutu` int(11) DEFAULT 0,
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dieukhoanthuhoi`
--

CREATE TABLE `dieukhoanthuhoi` (
  `dieukhoanthuhoi_id` int(11) NOT NULL,
  `yeucauhotro_id` int(11) NOT NULL,
  `mucthuhoi` decimal(15,2) NOT NULL COMMENT 'So tien phai hoan tra',
  `laisuat` decimal(5,2) DEFAULT NULL COMMENT 'Lai suat %/nam',
  `thoihanhoantra_thang` int(11) DEFAULT NULL COMMENT 'Thoi han hoan tra theo thang',
  `soquyetdinh_hopdong` varchar(100) DEFAULT NULL COMMENT 'So hop dong',
  `filehopdong` varchar(255) DEFAULT NULL COMMENT 'File hop dong',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
-- Cấu trúc bảng cho bảng `dotgiaingan`
--

CREATE TABLE `dotgiaingan` (
  `dot_id` int(11) NOT NULL,
  `quy_id` int(11) NOT NULL,
  `thutu` int(11) NOT NULL,
  `tendot` varchar(100) DEFAULT NULL,
  `mota` varchar(255) DEFAULT NULL,
  `sotiendukien` decimal(15,2) NOT NULL DEFAULT 0.00,
  `sotiendachi` decimal(15,2) NOT NULL DEFAULT 0.00,
  `ngaydukien` date DEFAULT NULL,
  `ngaythucte` date DEFAULT NULL,
  `trangthai` enum('chuatoi','dangchodutien','hoanthanh') NOT NULL DEFAULT 'chuatoi',
  `ngaytao` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dutoanhangnam`
--

CREATE TABLE `dutoanhangnam` (
  `dutoanhangnam_id` int(11) NOT NULL,
  `namtaichinh` int(11) NOT NULL COMMENT 'Nam ap dung du toan',
  `sotiendutoan` decimal(15,2) NOT NULL COMMENT 'Tong du toan chi bo may hoat dong cho ca nam',
  `trangthai` enum('Cho duyet','Da duyet','Tu choi') NOT NULL DEFAULT 'Cho duyet',
  `lydotuchoi` text DEFAULT NULL,
  `nguoidexuat_id` int(11) NOT NULL COMMENT 'Ke toan de xuat - Dieu 9.3',
  `nguoiduyet_id` int(11) DEFAULT NULL COMMENT 'Admin duyet - dong vai tro Chu tich HD Quy, Dieu 18.3',
  `ngaydexuat` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngayduyet` timestamp NULL DEFAULT NULL,
  `ghichu` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Du toan chi bo may hoat dong hang nam - Dieu 18.3, thiet ke theo dung pattern de xuat/duyet cua phanbongansach';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `giaodich`
--

CREATE TABLE `giaodich` (
  `giaodich_id` int(11) NOT NULL,
  `yeucauhotro_id` int(11) DEFAULT NULL,
  `lichtrano_id` int(11) DEFAULT NULL COMMENT 'Liên kết kỳ trả nợ nếu loaigiaodich = Thu hoi no',
  `quy_id` int(11) NOT NULL,
  `loaigiaodich` enum('Thu','Chi','Thu hoi no') NOT NULL DEFAULT 'Thu' COMMENT 'Thu = nhận tài trợ, Chi = giải ngân, Thu hoi no = thu hồi vốn vay',
  `hangmucchi` enum('Tai_tro_cho_vay','Tham_dinh_du_an','Bo_may_hoat_dong','Nhiem_vu_khac') DEFAULT NULL COMMENT 'Chi ap dung khi loaigiaodich = Chi, anh xa 4 khoan Dieu 18. NULL neu loaigiaodich = Thu',
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
  `loaihotro` enum('Tai tro khong hoan lai','Tai tro co thu hoi','Cho vay') DEFAULT 'Tai tro khong hoan lai',
  `tongkinhphidudan` decimal(15,2) DEFAULT NULL,
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
-- Cấu trúc bảng cho bảng `hopdongvayvon`
--

CREATE TABLE `hopdongvayvon` (
  `hopdongvayvon_id` int(11) NOT NULL,
  `yeucauhotro_id` int(11) NOT NULL COMMENT 'Đơn xin hỗ trợ dạng cho vay tương ứng',
  `sotienvon` decimal(15,2) NOT NULL COMMENT 'Số tiền gốc cho vay',
  `laisuatphantram` decimal(5,2) NOT NULL DEFAULT 0.00 COMMENT '%/năm, tối đa 70% lãi suất ngân hàng cùng thời điểm theo Điều 15',
  `ngaykyhopdong` date NOT NULL,
  `kyhandothang` int(11) NOT NULL COMMENT 'Kỳ hạn vay tính theo tháng',
  `ngaydaohan` date NOT NULL COMMENT 'Ngày đáo hạn cuối cùng',
  `trangthai` enum('Dang thuc hien','Da tat toan','Qua han') NOT NULL DEFAULT 'Dang thuc hien',
  `filehopdong` varchar(255) DEFAULT NULL COMMENT 'File hợp đồng đã ký (scan/pdf)',
  `nguoiduyet_id` int(11) DEFAULT NULL COMMENT 'Người phê duyệt khoản vay',
  `ghichu` text DEFAULT NULL,
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Hợp đồng cho vay vốn - Điều 15, 19 Điều lệ';

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

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichtrano`
--

CREATE TABLE `lichtrano` (
  `lichtrano_id` int(11) NOT NULL,
  `hopdongvayvon_id` int(11) NOT NULL,
  `kythu` int(11) NOT NULL COMMENT 'Kỳ trả nợ thứ mấy (1, 2, 3...)',
  `ngaydenhan` date NOT NULL,
  `sotiengocphaitra` decimal(15,2) NOT NULL DEFAULT 0.00,
  `sotienlaiphaitra` decimal(15,2) NOT NULL DEFAULT 0.00,
  `ngaythuctra` date DEFAULT NULL COMMENT 'NULL nếu chưa trả',
  `sotienthuctra` decimal(15,2) DEFAULT NULL,
  `trangthai` enum('Chua den han','Da tra','Qua han','Tra mot phan') NOT NULL DEFAULT 'Chua den han',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lịch trả nợ gốc/lãi theo từng kỳ của hợp đồng vay vốn';

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
(1, 'PHAT_TRIEN', 'Phát triển', '2026-07-15 15:45:08'),
(2, 'HOC_BONG', 'Học bổng', '2026-07-15 15:45:08'),
(3, 'NGHIEN_CUU', 'Nghiên cứu khoa học', '2026-07-15 15:45:08'),
(4, 'VAY_VON', 'Vay vốn sinh viên', '2026-07-15 15:45:08'),
(5, 'KHOI_NGHIEP', 'Khởi nghiệp', '2026-07-15 15:45:08'),
(6, 'HOAT_DONG_PHONG_TRAO', 'Hoạt động phong trào', '2026-07-15 15:45:08'),
(7, 'XA_HOI', 'Xã hội - Từ thiện', '2026-07-15 15:45:08'),
(8, 'CO_SO_VAT_CHAT', 'Cơ sở vật chất', '2026-07-15 15:45:08'),
(9, 'DAO_TAO', 'Đào tạo & Đổi mới', '2026-07-15 15:45:08');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nghiemthu`
--

CREATE TABLE `nghiemthu` (
  `nghiemthu_id` int(11) NOT NULL,
  `yeucauhotro_id` int(11) NOT NULL,
  `lanthu` int(11) NOT NULL DEFAULT 1 COMMENT 'Lần thứ mấy: hỗ trợ kiểm tra tiến độ nhiều vòng theo Điều 20.5',
  `loaikiemtra` enum('Kiem tra tien do','Nghiem thu cuoi cung') NOT NULL DEFAULT 'Nghiem thu cuoi cung',
  `ketqua` enum('Cho danh gia','Dat','Dat co dieu chinh','Khong dat') NOT NULL DEFAULT 'Cho danh gia',
  `soquyetdinh` varchar(100) DEFAULT NULL COMMENT 'Số QĐ nghiệm thu của Hiệu trưởng - Điều 20.4',
  `filebienban` varchar(255) DEFAULT NULL COMMENT 'Biên bản/minh chứng nghiệm thu',
  `nguoinghiemthu_id` int(11) DEFAULT NULL COMMENT 'Người/đại diện hội đồng đánh giá',
  `nhanxet` text DEFAULT NULL,
  `ngaynghiemthu` timestamp NULL DEFAULT NULL,
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Nghiệm thu dự án/đề tài theo Điều 20 Điều lệ QPTĐHTV';

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
  `loaitaikhoan` enum('Sinh vien','Nha tai tro','Can bo','Nha khoa hoc') DEFAULT NULL,
  `tinhtrangcongtac` enum('Dang cong tac','Da nghi huu') DEFAULT NULL,
  `donvicongtac` varchar(200) DEFAULT NULL,
  `trangthai` enum('Hoat dong','Khoa','Cho duyet') DEFAULT 'Hoat dong',
  `ngaytao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `taikhoannganhang_id` int(11) DEFAULT NULL,
  `xacnhandoclap` tinyint(1) DEFAULT NULL COMMENT 'Chi dung khi vaitro=Ban Kiem Soat: Admin xac nhan khong co quan he than nhan theo Dieu 8'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `nguoidung`
--

INSERT INTO `nguoidung` (`nguoidung_id`, `email`, `matkhau`, `hoten`, `masodinhdanh`, `ngaysinh`, `gioitinh`, `sodienthoai`, `diachi`, `donvihoc_id`, `avatar`, `vaitro_id`, `loaitaikhoan`, `tinhtrangcongtac`, `donvicongtac`, `trangthai`, `ngaytao`, `ngaycapnhat`, `taikhoannganhang_id`, `xacnhandoclap`) VALUES
(1, 'binh@tvu.edu.vn', '$2b$10$Na73pLlsi0OZaIalztXtZOgKxUJAHhW.QXM98siPMrG9bO6mOeKXy', 'Nguyễn Văn Bình', 'ADMIN001', NULL, NULL, '0987654321', NULL, NULL, NULL, 1, NULL, NULL, NULL, 'Hoat dong', '2026-06-02 11:40:34', '2026-07-11 18:53:44', NULL, NULL),
(2, 'ketoan@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Trần Thị Kế Toán', 'KT001', NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, NULL, NULL, 'Hoat dong', '2026-06-02 11:40:34', '2026-07-03 09:56:18', NULL, NULL),
(3, 'canboquy@tvu.edu.vn', '$2b$10$XtEgUgbxwOf5qoudQSir0.9K9iQ/Ym5IQeshlAsYEHfqWtkDDbvSW', 'Lê Văn Tùng', 'CB001', NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, 'Hoat dong', '2026-06-02 11:40:34', '2026-07-03 09:56:18', NULL, NULL);

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
  `ghichu` text DEFAULT NULL,
  `namtaichinh` year(4) DEFAULT NULL COMMENT 'Nam tai chinh'
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
(1, 'Quỹ phát triển Đại học Trà Vinh', 1, 'Quỹ mẹ phát triển chung của trường Đại học Trà Vinh', NULL, 2000000000.00, 2000000000.00, NULL, NULL, NULL, '2026-07-15', NULL, 'Dang hoat dong', NULL, '2026-07-15 15:39:18', '2026-07-15 15:39:18', 'Tap trung - Be chung', NULL);

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
  `quy_id` int(11) DEFAULT NULL COMMENT 'Legacy: Không còn dùng làm FK, chỉ lưu lịch sử',
  `loaitaikhoan` enum('Nha truong','Sinh vien') NOT NULL DEFAULT 'Sinh vien' COMMENT 'Phân loại: Nha truong (nhận tài trợ) hoặc Sinh vien (nhận giải ngân)',
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
(4, 'sinhvien', 'Người dùng (Sinh viên, Nhà tài trợ)', 'Hoat dong', '2026-06-02 11:40:34', '2026-06-02 11:40:34'),
(5, 'bankiemsoat', 'Giam sat doc lap theo Dieu le Quy (Dieu 8)', 'Hoat dong', '2026-07-13 14:36:01', '2026-07-13 14:36:01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `yeucauhotro`
--

CREATE TABLE `yeucauhotro` (
  `yeucauhotro_id` int(11) NOT NULL,
  `nguoidung_id` int(11) NOT NULL,
  `quy_id` int(11) NOT NULL,
  `danhnghia` enum('Ca nhan','Tap the','Don vi') NOT NULL DEFAULT 'Ca nhan',
  `tendaidien` varchar(200) DEFAULT NULL COMMENT 'Ten tap the/don vi neu danhnghia != Ca nhan',
  `dot_id` int(11) DEFAULT NULL,
  `lydo` text NOT NULL,
  `sotiendenghi` decimal(15,2) NOT NULL,
  `tailieudinhkem` text DEFAULT NULL,
  `trangthai` enum('Cho duyet cap 1','Da duyet cap 1','Tu choi cap 1','Cho duyet cap 2','Da duyet cap 2','Tu choi cap 2','Cho duyet cap 3','Da duyet cap 3','Tu choi cap 3','Cho giai ngan','Da giai ngan','Cho nghiem thu','Da nghiem thu','Nghiem thu khong dat','Tu choi') DEFAULT 'Cho duyet cap 1',
  `ghichu` text DEFAULT NULL,
  `ngaynop` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngaycapnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `loaihotro` enum('Tai tro khong hoan lai','Tai tro co thu hoi','Cho vay') DEFAULT 'Tai tro khong hoan lai',
  `canghiemthu` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = đơn thuộc loại Dự án/Đề tài, bắt buộc nghiệm thu theo Điều 20; 0 = học bổng/hỗ trợ đơn giản, không cần',
  `laidetac` tinyint(1) NOT NULL DEFAULT 0,
  `tongkinhphidudan` decimal(15,2) DEFAULT NULL COMMENT 'Tong kinh phi du an (bat buoc khi loai co thu hoi)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `chucvuquy`
--
ALTER TABLE `chucvuquy`
  ADD PRIMARY KEY (`chucvu_id`),
  ADD KEY `nguoidung_id` (`nguoidung_id`);

--
-- Chỉ mục cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  ADD PRIMARY KEY (`danhgia_id`),
  ADD KEY `idx_nguoidung` (`nguoidung_id`);

--
-- Chỉ mục cho bảng `dieukhoanthuhoi`
--
ALTER TABLE `dieukhoanthuhoi`
  ADD PRIMARY KEY (`dieukhoanthuhoi_id`),
  ADD UNIQUE KEY `uk_yeucauhotro` (`yeucauhotro_id`);

--
-- Chỉ mục cho bảng `donvihoc`
--
ALTER TABLE `donvihoc`
  ADD PRIMARY KEY (`donvihoc_id`),
  ADD UNIQUE KEY `uk_madonvi` (`madonvi`);

--
-- Chỉ mục cho bảng `dotgiaingan`
--
ALTER TABLE `dotgiaingan`
  ADD PRIMARY KEY (`dot_id`),
  ADD KEY `quy_id` (`quy_id`);

--
-- Chỉ mục cho bảng `dutoanhangnam`
--
ALTER TABLE `dutoanhangnam`
  ADD PRIMARY KEY (`dutoanhangnam_id`),
  ADD UNIQUE KEY `uk_namtaichinh` (`namtaichinh`) COMMENT 'Moi nam chi co dung 1 ban du toan',
  ADD KEY `nguoidexuat_id` (`nguoidexuat_id`),
  ADD KEY `nguoiduyet_id` (`nguoiduyet_id`);

--
-- Chỉ mục cho bảng `giaodich`
--
ALTER TABLE `giaodich`
  ADD PRIMARY KEY (`giaodich_id`),
  ADD KEY `idx_yeucauhotro` (`yeucauhotro_id`),
  ADD KEY `idx_quy` (`quy_id`),
  ADD KEY `idx_nguoinhan` (`nguoinhan_id`),
  ADD KEY `nguoithuchien_id` (`nguoithuchien_id`),
  ADD KEY `fk_doisoatboiid` (`doisoatboiid`),
  ADD KEY `giaodich_ibfk_5` (`lichtrano_id`);

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
-- Chỉ mục cho bảng `hopdongvayvon`
--
ALTER TABLE `hopdongvayvon`
  ADD PRIMARY KEY (`hopdongvayvon_id`),
  ADD UNIQUE KEY `uk_yeucauhotro` (`yeucauhotro_id`),
  ADD KEY `nguoiduyet_id` (`nguoiduyet_id`);

--
-- Chỉ mục cho bảng `lichtrano`
--
ALTER TABLE `lichtrano`
  ADD PRIMARY KEY (`lichtrano_id`),
  ADD UNIQUE KEY `uk_hopdong_ky` (`hopdongvayvon_id`,`kythu`),
  ADD KEY `idx_hopdong` (`hopdongvayvon_id`);

--
-- Chỉ mục cho bảng `nghiemthu`
--
ALTER TABLE `nghiemthu`
  ADD PRIMARY KEY (`nghiemthu_id`),
  ADD KEY `idx_yeucauhotro` (`yeucauhotro_id`),
  ADD KEY `idx_nguoinghiemthu` (`nguoinghiemthu_id`);

--
-- Chỉ mục cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`nguoidung_id`);

--
-- Chỉ mục cho bảng `phanbongansach`
--
ALTER TABLE `phanbongansach`
  ADD PRIMARY KEY (`phanbongansach_id`);

--
-- Chỉ mục cho bảng `yeucauhotro`
--
ALTER TABLE `yeucauhotro`
  ADD PRIMARY KEY (`yeucauhotro_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `chucvuquy`
--
ALTER TABLE `chucvuquy`
  MODIFY `chucvu_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  MODIFY `danhgia_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `dieukhoanthuhoi`
--
ALTER TABLE `dieukhoanthuhoi`
  MODIFY `dieukhoanthuhoi_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `dutoanhangnam`
--
ALTER TABLE `dutoanhangnam`
  MODIFY `dutoanhangnam_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `hopdongvayvon`
--
ALTER TABLE `hopdongvayvon`
  MODIFY `hopdongvayvon_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9025;

--
-- AUTO_INCREMENT cho bảng `lichtrano`
--
ALTER TABLE `lichtrano`
  MODIFY `lichtrano_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT cho bảng `nghiemthu`
--
ALTER TABLE `nghiemthu`
  MODIFY `nghiemthu_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `nguoidung_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9042;

--
-- AUTO_INCREMENT cho bảng `phanbongansach`
--
ALTER TABLE `phanbongansach`
  MODIFY `phanbongansach_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `yeucauhotro`
--
ALTER TABLE `yeucauhotro`
  MODIFY `yeucauhotro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90032;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `chucvuquy`
--
ALTER TABLE `chucvuquy`
  ADD CONSTRAINT `chucvuquy_ibfk_1` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `dieukhoanthuhoi`
--
ALTER TABLE `dieukhoanthuhoi`
  ADD CONSTRAINT `dieukhoanthuhoi_ibfk_1` FOREIGN KEY (`yeucauhotro_id`) REFERENCES `yeucauhotro` (`yeucauhotro_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `dutoanhangnam`
--
ALTER TABLE `dutoanhangnam`
  ADD CONSTRAINT `dutoanhangnam_ibfk_1` FOREIGN KEY (`nguoidexuat_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `dutoanhangnam_ibfk_2` FOREIGN KEY (`nguoiduyet_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `giaodich`
--
ALTER TABLE `giaodich`
  ADD CONSTRAINT `giaodich_ibfk_5` FOREIGN KEY (`lichtrano_id`) REFERENCES `lichtrano` (`lichtrano_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `hopdongvayvon`
--
ALTER TABLE `hopdongvayvon`
  ADD CONSTRAINT `hopdongvayvon_ibfk_1` FOREIGN KEY (`yeucauhotro_id`) REFERENCES `yeucauhotro` (`yeucauhotro_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdongvayvon_ibfk_2` FOREIGN KEY (`nguoiduyet_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `lichtrano`
--
ALTER TABLE `lichtrano`
  ADD CONSTRAINT `lichtrano_ibfk_1` FOREIGN KEY (`hopdongvayvon_id`) REFERENCES `hopdongvayvon` (`hopdongvayvon_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `nghiemthu`
--
ALTER TABLE `nghiemthu`
  ADD CONSTRAINT `nghiemthu_ibfk_1` FOREIGN KEY (`yeucauhotro_id`) REFERENCES `yeucauhotro` (`yeucauhotro_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiemthu_ibfk_2` FOREIGN KEY (`nguoinghiemthu_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
