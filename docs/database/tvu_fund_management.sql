-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th7 06, 2026 lúc 06:25 PM
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

--
-- Đang đổ dữ liệu cho bảng `donvihoc`
--

INSERT INTO `donvihoc` (`donvihoc_id`, `madonvi`, `tenkhoa`, `tennganh`, `lop`, `khoahoc`, `mota`, `trangthai`, `ngaytao`) VALUES
(1, 'DV1783272979818613', 'Công Nghệ Thông tin', NULL, NULL, NULL, NULL, 'Hoat dong', '2026-07-05 17:36:19');

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

--
-- Đang đổ dữ liệu cho bảng `dotgiaingan`
--

INSERT INTO `dotgiaingan` (`dot_id`, `quy_id`, `thutu`, `tendot`, `mota`, `sotiendukien`, `sotiendachi`, `ngaydukien`, `ngaythucte`, `trangthai`, `ngaytao`) VALUES
(1, 6, 1, 'Đợt 1', 'Đợt giải ngân thứ 1', 300000000.00, 0.00, '2026-11-05', NULL, 'chuatoi', '2026-07-06 22:07:59'),
(2, 6, 2, 'Đợt 2', 'Đợt giải ngân thứ 2', 300000000.00, 0.00, '2027-03-06', NULL, 'chuatoi', '2026-07-06 22:07:59');

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
(1, NULL, 1, NULL, 100000000.00, 'Chuyen khoan', NULL, 'uploads/documents/DHTV_1783161932756_70885091.jpg', 'Thanh cong', 'Da_doi_soat', 100000000.00, 1, '2026-07-04 23:52:17', 'Đả nhận được tiền', 'Đả nhận được tiền', 2, '2026-07-04 10:45:32', '2026-07-04 16:52:17'),
(2, NULL, 1, NULL, 200000000.00, 'Chuyen khoan', NULL, 'uploads/documents/DHTV_1783255112597_779088582.jpg', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'đủ yêu cầu', 2, '2026-07-05 12:38:32', '2026-07-05 12:38:32'),
(3, NULL, 1, NULL, 300000000.00, 'Chuyen khoan', NULL, 'uploads/documents/DHTV_1783255122207_166601721.jpg', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'đủ yêu cầu', 2, '2026-07-05 12:38:42', '2026-07-05 12:38:42'),
(4, NULL, 1, NULL, 300000000.00, 'Chuyen khoan', NULL, 'uploads/documents/DHTV_1783255149274_809554832.jpg', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'đủ yêu cầu', 2, '2026-07-05 12:39:09', '2026-07-05 12:39:09'),
(5, NULL, 1, NULL, 400000000.00, 'Chuyen khoan', NULL, 'uploads/documents/DHTV_1783255159894_264194685.jpg', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'đủ yêu cầu', 2, '2026-07-05 12:39:19', '2026-07-05 12:39:19'),
(6, 1, 5, 13, 20000000.00, 'Chuyen khoan', NULL, 'uploads/documents/5YTKN_1783273221351_213193129.pdf', 'Thanh cong', 'Chua_doi_soat', NULL, NULL, NULL, NULL, 'đủ yêu cầu', 2, '2026-07-05 17:40:21', '2026-07-05 17:40:21');

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
(1, 'BIDV Trà Vinh.', 'dendung855@gmail.com', '0294385558', 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam – Chi nhánh Trà Vinh.', '2B, Đường Nguyễn Thị Minh Khai, Phường 2, Thành phố Trà Vinh, Tỉnh Trà Vinh.', 1, 100000000.00, 'Khac', 'VNPAY63872678', '2026-07-04', 'uploads/documents/1_1783161701612_439929109.jpg', 'Là những người đi trước đã từng học tập dưới mái trường Tra Vinh University, chúng tôi mong muốn được đóng góp một phần nguồn lực vào Quỹ Phát triển Trường. Hy vọng khoản tài trợ này sẽ góp phần tiếp sức cho thế hệ đàn em vững bước trên con đường lập nghiệp, đồng thời đồng hành cùng sự phát triển bền vững của Nhà trường.', 'DA_CHUYEN', 1, 1, NULL, NULL, 1, '536af03e-f920-4cdc-81b2-2082e765af04', '2026-07-04 10:42:14', '2026-07-04 10:42:14'),
(2, 'Nguyễn Văn Minh', 'jskkak598@gmail.com', '0912345678', 'Công ty Cổ phần Trà Bắc', 'Số 29, Đường 19/5, Phường Trà Vinh, Tỉnh Vĩnh Long (trước đây là TP. Trà Vinh)', 1, 250000000.00, 'Khac', 'VNPAY20481679', '2026-07-05', 'uploads/documents/1_1783254846271_407626674.jpg', 'Công ty Cổ phần Trà Bắc (TRABACO) đồng hành cùng Quỹ Phát triển Đại học Trà Vinh với mong muốn góp phần hỗ trợ sinh viên có hoàn cảnh khó khăn, khuyến khích tinh thần học tập và đóng góp vào sự phát triển nguồn nhân lực chất lượng cao cho địa phương. Chúc Quỹ ngày càng phát triển và lan tỏa nhiều giá trị tốt đẹp đến cộng đồng.', 'DA_CHUYEN', 6, 5, NULL, NULL, 1, 'd2e9dbf8-ad18-4e20-8557-0385bb7ac7c2', '2026-07-05 12:34:45', '2026-07-05 12:34:45');

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

--
-- Đang đổ dữ liệu cho bảng `guest_yeucauhotro`
--

INSERT INTO `guest_yeucauhotro` (`guest_yeucauhotro_id`, `guest_hoten`, `guest_email`, `guest_sodienthoai`, `guest_mssv`, `guest_khoa`, `guest_lop`, `guest_sotaikhoan`, `guest_nganhang`, `guest_chutaikhoan`, `quy_id`, `lydo`, `sotiendenghi`, `tailieudinhkem`, `trang_thai_staging`, `yeucauhotro_id_ref`, `nguoidung_id_ref`, `otp_code`, `otp_expires_at`, `is_email_verified`, `tracking_uuid`, `ngaytao`, `ngaycapnhat`) VALUES
(1, 'Trần Nhựt Thiên', 'nthienwww@gmail.com', '0393498927', '110122162', 'Công Nghệ Thông tin', 'Da22TTC', '7340318818', 'BIDV', 'TRAN NHUT THIEN', 5, '[Đơn xin Quỹ Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU học kỳ II năm học 2026-2027] - CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập – Tự do – Hạnh phúc\n-----------------------------------\n\nThành phố Trà Vinh, ngày ...... tháng ...... năm ......\n\n**ĐƠN XIN HỖ TRỢ TỪ QUỸ HỌC BỔNG ĐỒNG HÀNH CÙNG SINH VIÊN NGHÈO VƯỢT KHÓ TVU**\n\nKính gửi:\n*   Ban Giám hiệu Trường Đại học Trà Vinh;\n*   Ban Quản lý Quỹ \"Quỹ Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU\".\n\nEm tên là: [Họ và tên sinh viên]\nNgày sinh: [Ngày/tháng/năm sinh]\nMã số sinh viên: [MSSV]\nLớp: [Tên lớp]\nKhoa: [Tên Khoa]\nNgành học: [Tên Ngành học]\nSố điện thoại: [Số điện thoại]\nEmail: [Địa chỉ email]\n\nEm viết đơn này với lòng kính trọng và mong muốn được trình bày hoàn cảnh của bản thân, kính mong Ban Giám hiệu Nhà trường và Ban Quản lý Quỹ xem xét hỗ trợ em có thêm điều kiện tiếp tục học tập.\n\nGia đình em hiện đang sinh sống tại [Địa chỉ nơi ở hiện tại của gia đình, ví dụ: thôn X, xã Y, huyện Z, tỉnh T]. Hoàn cảnh gia đình em đặc biệt khó khăn, thuộc diện hộ nghèo theo xác nhận của chính quyền địa phương (có sổ hộ nghèo đính kèm). Nguồn thu nhập chính của gia đình phụ thuộc vào [Nêu rõ nguồn thu nhập, ví dụ: công việc nông nghiệp bấp bênh của cha mẹ] vốn rất hạn chế và không ổn định. Với [Số lượng thành viên trong gia đình] nhân khẩu cùng sinh sống, trong đó có [Số lượng người phụ thuộc, ví dụ: các em nhỏ đang đi học hoặc người già yếu], việc chi tiêu cho cuộc sống hàng ngày đã là một gánh nặng lớn, chưa kể đến các khoản học phí và sinh hoạt phí cho em trong suốt quá trình học đại học.\n\nMặc dù hoàn cảnh gia đình còn nhiều chật vật, em luôn ý thức được tầm quan trọng của việc học và không ngừng nỗ lực vươn lên. Từ khi bước chân vào Trường Đại học Trà Vinh, em luôn cố gắng học tập hết mình để đạt kết quả tốt nhất. Kết quả học tập của em trong các học kỳ vừa qua luôn đạt thành tích xuất sắc, với điểm trung bình học tập tích lũy (GPA) là [Điền GPA cụ thể, ví dụ: X.X/4.0 hoặc Y.Y/10.0], vượt xa tiêu chí tối thiểu của Quỹ. Đồng thời, điểm rèn luyện của em cũng đạt loại Tốt trở lên. Em tin rằng những nỗ lực này không chỉ thể hiện khả năng học tập mà còn là ý chí quyết tâm vượt khó để không phụ lòng mong mỏi của gia đình và thầy cô.\n\nEm hiểu rằng Quỹ \"Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU\" được thành lập để hỗ trợ những sinh viên có hoàn cảnh khó khăn nhưng có ý chí vươn lên trong học tập. Em nhận thấy mình đủ các điều kiện mà Quỹ đưa ra: gia đình thuộc diện hộ nghèo, có thành tích học tập xuất sắc với GPA cao và điểm rèn luyện tốt. Hiện tại, em chưa nhận bất kỳ học bổng tài trợ nào khác trong cùng học kỳ/năm học. Khoản hỗ trợ từ Quỹ sẽ là nguồn động viên vô cùng quý giá, giúp em trang trải một phần chi phí học tập và sinh hoạt, giảm bớt gánh nặng tài chính cho gia đình, từ đó em có thể yên tâm tập trung vào việc học.\n\nEm xin cam kết sẽ sử dụng khoản hỗ trợ một cách hiệu quả, đúng mục đích để phục vụ cho việc học tập, không ngừng phấn đấu rèn luyện đạo đức, nâng cao kiến thức, kỹ năng để xứng đáng với sự tin tưởng và giúp đỡ của Quỹ, của Nhà trường. Em sẽ cố gắng hết sức để đạt được những thành tích cao hơn nữa, góp phần xây dựng hình ảnh sinh viên TVU năng động, tài năng và có ích cho xã hội.\n\nKính mong Ban Giám hiệu Nhà trường và Ban Quản lý Quỹ xem xét, tạo điều kiện và chấp thuận nguyện vọng của em.\n\nEm xin chân thành cảm ơn!\n\nTrân trọng kính đơn!\n\n**Người làm đơn**\n(Ký và ghi rõ họ tên)\n\n[Họ và tên sinh viên]', 20000000.00, 'uploads/documents/1_1783272904630_503982205.jpg', 'DA_CHUYEN', 1, 13, NULL, NULL, 1, '485220f2-f173-4403-9747-c93cbfd431e5', '2026-07-05 17:36:19', '2026-07-05 17:36:19');

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
(2, 1, 1, 200000000.00, 'Chuyen khoan', NULL, '2026-07-05', 'uploads/documents/DHTV_1783255112597_779088582.jpg', 'Da nhan', 'đủ yêu cầu', 1, '2026-07-05 12:44:07', '2026-07-04 17:29:21', '2026-07-05 12:44:07'),
(3, 2, 1, 300000000.00, 'Chuyen khoan', NULL, '2026-07-05', 'uploads/documents/DHTV_1783255122207_166601721.jpg', 'Da nhan', 'đủ yêu cầu', 1, '2026-07-05 12:44:11', '2026-07-04 17:33:20', '2026-07-05 12:44:11'),
(4, 3, 1, 300000000.00, 'Chuyen khoan', NULL, '2026-07-05', 'uploads/documents/DHTV_1783255149274_809554832.jpg', 'Da nhan', 'đủ yêu cầu', 1, '2026-07-05 12:44:15', '2026-07-04 17:37:27', '2026-07-05 12:44:15'),
(5, 4, 1, 400000000.00, 'Chuyen khoan', NULL, '2026-07-05', 'uploads/documents/DHTV_1783255159894_264194685.jpg', 'Da nhan', 'đủ yêu cầu', 1, '2026-07-05 12:44:19', '2026-07-04 17:45:29', '2026-07-05 12:44:19'),
(6, 5, 1, 250000000.00, 'Khac', 'VNPAY20481679', '2026-07-05', 'uploads/documents/1_1783254846271_407626674.jpg', 'Cho duyet', 'Công ty Cổ phần Trà Bắc (TRABACO) đồng hành cùng Quỹ Phát triển Đại học Trà Vinh với mong muốn góp phần hỗ trợ sinh viên có hoàn cảnh khó khăn, khuyến khích tinh thần học tập và đóng góp vào sự phát triển nguồn nhân lực chất lượng cao cho địa phương. Chúc Quỹ ngày càng phát triển và lan tỏa nhiều giá trị tốt đẹp đến cộng đồng.', NULL, NULL, '2026-07-05 12:34:45', '2026-07-05 12:34:45'),
(7, 1, 1, 5000000.00, 'Tien mat', NULL, '2026-07-05', NULL, 'Cho duyet', 'Test tung', NULL, NULL, '2026-07-05 16:50:52', '2026-07-05 16:50:52'),
(8, 6, 1, 150000000.00, 'Chuyen khoan', NULL, '2026-07-05', 'uploads/documents/1_1783270384581_853373761.jpg', 'Cho duyet', 'Công ty Nhiệt điện Duyên Hải (EVNGENCO1) mong muốn chung tay cùng Quỹ Phát triển Đại học Trà Vinh nhằm hỗ trợ sinh viên vượt khó, khuyến khích học tập và góp phần xây dựng nguồn nhân lực chất lượng cao cho khu vực Đồng bằng sông Cửu Long. Chúc Quỹ ngày càng phát triển và mang lại nhiều giá trị thiết thực cho cộng đồng.', NULL, NULL, '2026-07-05 16:53:04', '2026-07-05 16:53:04');

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
(6, 'Quy thi dua', 'Quỹ thi đua', '2026-06-02 11:59:11'),
(7, 'Phat trien', 'Phát triển ĐH Trà Vinh', '2026-07-06 08:11:36');

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
(4, 'dendung855@gmail.com', '$2b$10$.aYzHwopjs66jWh2PjsOIOClg3zRIaN8.ZQrrmF5UYLH51lnLMIlm', 'BIDV Trà Vinh.', 'GG1783161734523', NULL, NULL, '0294385558', '2B, Đường Nguyễn Thị Minh Khai, Phường 2, Thành phố Trà Vinh, Tỉnh Trà Vinh.', NULL, NULL, 4, 'Nha tai tro', 'Hoat dong', '2026-07-04 10:42:14', '2026-07-04 10:42:14', NULL),
(5, 'jskkak598@gmail.com', '$2b$10$BP2ReG2Ga1q.6HzVfsJB1.sa/Ll1XWZ.slDu10lliowCKvC4ZHXNG', 'Nguyễn Văn Minh', 'GG1783254885910', NULL, NULL, '0912345678', 'Số 29, Đường 19/5, Phường Trà Vinh, Tỉnh Vĩnh Long (trước đây là TP. Trà Vinh)', NULL, NULL, 4, 'Nha tai tro', 'Hoat dong', '2026-07-05 12:34:45', '2026-07-05 12:34:45', NULL),
(6, 'lehoangphuc@evngenco1.vn', '$2b$10$VSQJGWMErjesJWBwVgaxe.FRQxtKsxcC1rAHAOtTUZGk.N0FNrK1C', 'Lê Hoàng Phúc', 'NTT384766', NULL, NULL, '0987654321', 'Trung tâm Điện lực Duyên Hải, Phường Duyên Hải, Tỉnh Vĩnh Long (trước đây thuộc thị xã Duyên Hải, Trà Vinh)', NULL, NULL, 4, '', 'Hoat dong', '2026-07-05 16:53:04', '2026-07-05 16:53:04', NULL),
(10, 'vietcombanktravinh@gmail.com', '$2b$10$ERybfFULlOM1w1wMheEM2OSjJ3RjWLcldGrGjWqgdB3ANTWQJJHUu', 'Vietcombank Trà Vinh', NULL, NULL, NULL, '02943855888', NULL, NULL, NULL, 4, 'Sinh vien', 'Hoat dong', '2026-07-05 17:07:55', '2026-07-05 17:07:55', NULL),
(11, 'agribanktravinh@gmail.com', '$2b$10$ERybfFULlOM1w1wMheEM2OSjJ3RjWLcldGrGjWqgdB3ANTWQJJHUu', 'Agribank Trà Vinh', NULL, NULL, NULL, '02943862444', NULL, NULL, NULL, 4, 'Sinh vien', 'Hoat dong', '2026-07-05 17:07:55', '2026-07-05 17:07:55', NULL),
(12, 'dienluctravinh@gmail.com', '$2b$10$ERybfFULlOM1w1wMheEM2OSjJ3RjWLcldGrGjWqgdB3ANTWQJJHUu', 'Điện lực Trà Vinh', NULL, NULL, NULL, '02943833444', NULL, NULL, NULL, 4, 'Sinh vien', 'Hoat dong', '2026-07-05 17:07:55', '2026-07-05 17:07:55', NULL),
(13, 'nthienwww@gmail.com', '$2b$10$ezNqnvxKPvXW4l8rfCU0E.5awf5QRAb65CjLXDhz3S9DOlkD4LWN.', 'Trần Nhựt Thiên', '110122162', NULL, NULL, '0393498927', NULL, 1, NULL, 4, 'Sinh vien', 'Hoat dong', '2026-07-05 17:36:19', '2026-07-05 17:36:19', 4);

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
(2, 'Vietcombank Trà Vinh', 'To chuc', 'vietcombanktravinh@gmail.com', '02943855888', 'Số 26, Đường Nguyễn Thị Minh Khai, Khóm 3, Phường 2, TP. Trà Vinh, Tỉnh Trà Vinh', NULL, NULL, NULL, 10, 'Hoat dong', '2026-07-04 17:33:20', '2026-07-05 17:07:55'),
(3, 'Agribank Trà Vinh', 'To chuc', 'agribanktravinh@gmail.com', '02943862444', 'Số 50, Đường Võ Nguyên Giáp, Phường 6, TP. Trà Vinh, Tỉnh Trà Vinh', NULL, NULL, NULL, 11, 'Hoat dong', '2026-07-04 17:37:27', '2026-07-05 17:07:55'),
(4, 'Điện lực Trà Vinh', 'To chuc', 'dienluctravinh@gmail.com', '02943833444', 'Số 16, Đường Nguyễn Thái Học, Phường 1, TP. Trà Vinh, Tỉnh Trà Vinh', NULL, NULL, NULL, 12, 'Hoat dong', '2026-07-04 17:45:29', '2026-07-05 17:07:55'),
(5, 'Công ty Cổ phần Trà Bắc', 'To chuc', 'jskkak598@gmail.com', '0912345678', 'Số 29, Đường 19/5, Phường Trà Vinh, Tỉnh Vĩnh Long (trước đây là TP. Trà Vinh)', NULL, NULL, NULL, 5, 'Hoat dong', '2026-07-05 12:34:45', '2026-07-05 12:34:45'),
(6, 'Lê Hoàng Phúc', 'To chuc', 'lehoangphuc@evngenco1.vn', '0987654321', 'Trung tâm Điện lực Duyên Hải, Phường Duyên Hải, Tỉnh Vĩnh Long (trước đây thuộc thị xã Duyên Hải, Trà Vinh)', NULL, NULL, NULL, 6, 'Hoat dong', '2026-07-05 16:53:04', '2026-07-05 16:53:04');

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
(66, 3, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Lê Văn Tùng: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":15,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-05 16:25:38'),
(67, 3, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Lê Văn Tùng: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":14,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-05 16:45:30'),
(68, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-05 16:50:52'),
(69, 1, 'THEM_MOI_KHOAN_TAI_TRO', 'khoantaitro', 7, '[Nhân viên hệ thống] Nguyễn Văn Bình: Ghi nhận khoản tài trợ số tiền 5.000.000 VNĐ vào quỹ \'Quỹ phát triển Đại học Trà Vinh\'', NULL, '{\"nhaTaiTroId\":1,\"quyId\":1,\"soTien\":5000000}', '127.0.0.1', '2026-07-05 16:50:52'),
(70, 3, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Lê Văn Tùng: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":17,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-05 16:53:04'),
(71, 3, 'THEM_MOI_KHOAN_TAI_TRO', 'khoantaitro', 8, '[Nhân viên hệ thống] Lê Văn Tùng: Ghi nhận khoản tài trợ số tiền 150.000.000 VNĐ vào quỹ \'Quỹ phát triển Đại học Trà Vinh\'', NULL, '{\"nhaTaiTroId\":6,\"quyId\":1,\"soTien\":150000000}', '127.0.0.1', '2026-07-05 16:53:04'),
(72, 3, 'DANG_XUAT', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Tùng: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-07-05 17:14:42'),
(73, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/upload/public - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/public\",\"statusCode\":200,\"durationMs\":7,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-05 17:24:37'),
(74, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/upload/public - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/public\",\"statusCode\":200,\"durationMs\":43,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-05 17:35:04'),
(75, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/guest/yeu-cau - tác động dữ liệu thành công (201)', NULL, '{\"method\":\"POST\",\"path\":\"/api/guest/yeu-cau\",\"statusCode\":201,\"durationMs\":32,\"params\":{},\"query\":{},\"body\":{\"guestHoTen\":\"Trần Nhựt Thiên\",\"guestEmail\":\"nthienwww@gmail.com\",\"guestSoDienThoai\":\"0393498927\",\"guestMssv\":\"110122162\",\"guestKhoa\":\"Công Nghệ Thông tin\",\"guestLop\":\"Da22TTC\",\"guestSoTaiKhoan\":\"7340318818\",\"guestNganHang\":\"BIDV\",\"guestChuTaiKhoan\":\"TRAN NHUT THIEN\",\"quyId\":5,\"lyDo\":\"[Đơn xin Quỹ Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU học kỳ II năm học 2026-2027] - CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\\nĐộc lập – Tự do – Hạnh phúc\\n-----------------------------------\\n\\nThành phố Trà Vinh, ngày ...... tháng ...... năm ......\\n\\n**ĐƠN XIN HỖ TRỢ TỪ QUỸ HỌC BỔNG ĐỒNG HÀNH CÙNG SINH VIÊN NGHÈO VƯỢT KHÓ TVU**\\n\\nKính gửi:\\n*   Ban Giám hiệu Trường Đại học Trà Vinh;\\n*   Ban Quản lý Quỹ \\\"Quỹ Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU\\\".\\n\\nEm tên là: [Họ và tên sinh viên]\\nNgày sinh: [Ngày/tháng/năm sinh]\\nMã số sinh viên: [MSSV]\\nLớp: [Tên lớp]\\nKhoa: [Tên Khoa]\\nNgành học: [Tên Ngành học]\\nSố điện thoại: [Số điện thoại]\\nEmail: [Địa chỉ email]\\n\\nEm viết đơn này với lòng kính trọng và mong muốn được trình bày hoàn cảnh của bản thân, kính mong Ban Giám hiệu Nhà trường và Ban Quản lý Quỹ xem xét hỗ trợ em có thêm điều kiện tiếp tục học tập.\\n\\nGia đình em hiện đang sinh sống tại [Địa chỉ nơi ở hiện tại của gia đình, ví dụ: thôn X, xã Y, huyện Z, tỉnh T]. Hoàn cảnh gia đình em đặc biệt khó khăn, thuộc diện hộ nghèo theo xác nhận của chính quyền địa phương (có sổ hộ nghèo đính kèm). Nguồn thu nhập chính của gia đình phụ thuộc vào [Nêu rõ nguồn thu nhập, ví dụ: công việc nông nghiệp bấp bênh của cha mẹ] vốn rất hạn chế và không ổn định. Với [Số lượng thành viên trong gia đình] nhân khẩu cùng sinh sống, trong đó có [Số lượng người phụ thuộc, ví dụ: các em nhỏ đang đi học hoặc người già yếu], việc chi tiêu cho cuộc sống hàng ngày đã là một gánh nặng lớn, chưa kể đến các khoản học phí và sinh hoạt phí cho em trong suốt quá trình học đại học.\\n\\nMặc dù hoàn cảnh gia đình còn nhiều chật vật, em luôn ý thức được tầm quan trọng của việc học và không ngừng nỗ lực vươn lên. Từ khi bước chân vào Trường Đại học Trà Vinh, em luôn cố gắng học tập hết mình để đạt kết quả tốt nhất. Kết quả học tập của em trong các học kỳ vừa qua luôn đạt thành tích xuất sắc, với điểm trung bình học tập tích lũy (GPA) là [Điền GPA cụ thể, ví dụ: X.X/4.0 hoặc Y.Y/10.0], vượt xa tiêu chí tối thiểu của Quỹ. Đồng thời, điểm rèn luyện của em cũng đạt loại Tốt trở lên. Em tin rằng những nỗ lực này không chỉ thể hiện khả năng học tập mà còn là ý chí quyết tâm vượt khó để không phụ lòng mong mỏi của gia đình và thầy cô.\\n\\nEm hiểu rằng Quỹ \\\"Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU\\\" được thành lập để hỗ trợ những sinh viên có hoàn cảnh khó khăn nhưng có ý chí vươn lên trong học tập. Em nhận thấy mình đủ các điều kiện mà Quỹ đưa ra: gia đình thuộc diện hộ nghèo, có thành tích học tập xuất sắc với GPA cao và điểm rèn luyện tốt. Hiện tại, em chưa nhận bất kỳ học bổng tài trợ nào khác trong cùng học kỳ/năm học. Khoản hỗ trợ từ Quỹ sẽ là nguồn động viên vô cùng quý giá, giúp em trang trải một phần chi phí học tập và sinh hoạt, giảm bớt gánh nặng tài chính cho gia đình, từ đó em có thể yên tâm tập trung vào việc học.\\n\\nEm xin cam kết sẽ sử dụng khoản hỗ trợ một cách hiệu quả, đúng mục đích để phục vụ cho việc học tập, không ngừng phấn đấu rèn luyện đạo đức, nâng cao kiến thức, kỹ năng để xứng đáng với sự tin tưởng và giúp đỡ của Quỹ, của Nhà trường. Em sẽ cố gắng hết sức để đạt được những thành tích cao hơn nữa, góp phần xây dựng hình ảnh sinh viên TVU năng động, tài năng và có ích cho xã hội.\\n\\nKính mong Ban Giám hiệu Nhà trường và Ban Quản lý Quỹ xem xét, tạo điều kiện và chấp thuận nguyện vọng của em.\\n\\nEm xin chân thành cảm ơn!\\n\\nTrân trọng kính đơn!\\n\\n**Người làm đơn**\\n(Ký và ghi rõ họ tên)\\n\\n[Họ và tên sinh viên]\",\"soTienDeNghi\":20000000,\"taiLieuDinhKem\":\"uploads/documents/1_1783272904630_503982205.jpg\"}}', '127.0.0.1', '2026-07-05 17:35:04'),
(76, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/guest/resend-otp - tác động dữ liệu thành công (200)', NULL, '{\"truncated\":true,\"length\":7221,\"preview\":\"{\\\"method\\\":\\\"POST\\\",\\\"path\\\":\\\"/api/guest/resend-otp\\\",\\\"statusCode\\\":200,\\\"durationMs\\\":8,\\\"params\\\":{},\\\"query\\\":{},\\\"body\\\":{\\\"email\\\":\\\"nthienwww@gmail.com\\\",\\\"type\\\":\\\"application\\\",\\\"otpToken\\\":\\\"eyJ0eXBlIjoiYXBwbGljYXRpb24iLCJlbWFpbCI6Im50aGllbnd3d0BnbWFpbC5jb20iLCJ0cmFja2luZ1V1aWQiOiI0ODUyMjBmMi1mMTczLTQ0MDMtOTc0Ny1jOTNjYmZkNDMxZTUiLCJvdHBIYXNoIjoiN2FiZjY5Y2Y4OGJjN2UyNjA2YTIxYjAxN2M1OTUxYjQxMmE4NGVlY2IyZGNmYWE1MzFjYjFiNGJjMGFjMzgzMCIsImV4cGlyZXNBdCI6IjIwMjYtMDctMDVUMTg6MDU6MDQuNjg1WiIsImFwcGxpY2F0aW9uIjp7Imd1ZXN0SG9UZW4iOiJUcuG6p24gTmjhu7F0IFRoacOqbiIsImd1ZXN0RW1haWwiOiJudGhpZW53d3dAZ21haWwuY29tIiwiZ3Vlc3RTb0RpZW5UaG9haSI6IjAzOTM0OTg5MjciLCJndWVzdE1zc3YiOiIxMTAxMjIxNjIiLCJndWVzdEtob2EiOiJDw7RuZyBOZ2jhu4cgVGjDtG5nIHRpbiIsImd1ZXN0TG9wIjoiRGEyMlRUQyIsImd1ZXN0U29UYWlLaG9hbiI6IjczNDAzMTg4MTgiLCJndWVzdE5nYW5IYW5nIjoiQklEViIsImd1ZXN0Q2h1VGFpS2hvYW4iOiJUUkFOIE5IVVQgVEhJRU4iLCJxdXlJZCI6NSwibHlEbyI6IlvEkMahbiB4aW4gUXXhu7kgSOG7jWMgYuG7lW5nIMSQ4buTbmcgaMOgbmggY8O5bmcgU2luaCB2acOqbiBOZ2jDqG8gVsaw4bujdCBraMOzIFRWVSBo4buNYyBr4buzIElJIG7Eg20gaOG7jWMgMjAyNi0yMDI3XSAtIEPhu5hORyBIw5JBIFjDgyBI4buYSSBDSOG7piBOR0jEqEEgVknhu4ZUIE5BTVxuxJDhu5ljIGzhuq1wIOKAkyBU4buxIGRvIOKAkyBI4bqhbmggcGjDumNcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblRow6BuaCBwaOG7kSBUcsOgIFZpbmgsIG5nw6B5IC4uLi4uLiB0aMOhbmcgLi4uLi4uIG7Eg20gLi4uLi4uXG5cbioqxJDGoE4gWElOIEjhu5YgVFLhu6IgVOG7qiBRVeG7uCBI4buMQyBC4buUTkcgxJDhu5JORyBIw4BOSCBDw5lORyBTSU5IIFZJw4pOIE5HSMOITyBWxq_hu6JUIEtIw5MgVFZVKipcblxuS8OtbmggZ-G7rWk6XG4qICAgQmFuIEdpw6FtIGhp4buHdSBUcsaw4budbmcgxJDhuqFpIGjhu41jIFRyw6AgVmluaDtcbiogICBCYW4gUXXhuqNuIGzDvSBRdeG7uSBcIlF14bu5IEjhu41jIGLhu5VuZyDEkOG7k25nIGjDoG5oIGPDuW5nIFNpbmggdmnDqm4gTmdow6hvIFbGsOG7o3Qga2jDsyBUVlVcIi5cblxuRW0gdMOqbiBsw6A6IFtI4buNIHbDoCB0w6puIHNpbmggdmnDqm5dXG5OZ8OgeSBzaW5oOiBbTmfDoHkvdGjDoW5nL27Eg20gc2luaF1cbk3DoyBz4buRIHNpbmggdmnDqm46IFtNU1NWXVxuTOG7m3A6IFtUw6puIGzhu5twXVxuS2hvYTogW1TDqm4gS2hvYV1cbk5nw6BuaCBo4buNYzogW1TDqm4gTmfDoG5oIGjhu41jXVxuU-G7kSDEkWnhu4duIHRob-G6oWk6IFtT4buRIMSRaeG7h24gdGhv4bqhaV1cbkVtYWlsOiBbxJDhu4thIGNo4buJIGVtYWlsXVxuXG5FbSB2aeG6v3QgxJHGoW4gbsOgeSB24bubaSBsw7JuZyBrw61uaCB0cuG7jW5nIHbDoCBtb25nIG114buRbiDEkcaw4bujYyB0csOsbmggYsOgeSBob8OgbiBj4bqjbmggY-G7p2EgYuG6o24gdGjDom4sIGvDrW5oIG1vbmcgQmFuIEdpw6FtIGhp4buHdSBOaMOgIHRyxrDhu51uZyB2w6AgQmFuIFF14bqjbiBsw70gUXXhu7kgeGVtIHjDqXQgaOG7lyB0cuG7oyBlbSBjw7MgdGjDqm0gxJFp4buBdSBraeG7h24gdGnhur9wIHThu6VjIGjhu41jIHThuq1wLlxuXG5HaWEgxJHDrG5oIGVtIGhp4buHbiDEkWFuZyBzaW5oIHPhu5FuZyB04bqhaSBbxJDhu4thIGNo4buJIG7GoWkg4bufIGhp4buHbiB04bqhaSBj4bunYSBnaWEgxJHDrG5oLCB2w60gZOG7pTogdGjDtG4gWCwgeMOjIFksIGh1eeG7h24gWiwgdOG7iW5oIFRdLiBIb8OgbiBj4bqjbmggZ2lhIMSRw6xuaCBlbSDEkeG6t2MgYmnhu4d0IGtow7Mga2jEg24sIHRodeG7mWMgZGnhu4duIGjhu5kgbmdow6hvIHRoZW8geMOhYyBuaOG6rW4gY-G7p2EgY2jDrW5oIHF1eeG7gW4gxJHhu4thIHBoxrDGoW5nIChjw7Mgc-G7lSBo4buZIG5naMOobyDEkcOtbmgga8OobSkuIE5ndeG7k24gdGh1IG5o4bqtcCBjaMOtbmggY-G7p2EgZ2lhIMSRw6xuaCBwaOG7pSB0aHXhu5ljIHbDoG8gW07DqnUgcsO1IG5ndeG7k24gdGh1IG5o4bqtcCwgdsOtIGThu6U6IGPDtG5nIHZp4buHYyBuw7RuZyBuZ2hp4buHcCBi4bqlcCBiw6puaCBj4bunYSBjaGEgbeG6uV0gduG7kW4gcuG6pXQgaOG6oW4gY2jhur8gdsOgIGtow7RuZyDhu5VuIMSR4buLbmguIFbhu5tpIFtT4buRIGzGsOG7o25nIHRow6BuaCB2acOqbiB0cm9uZyBnaWEgxJHDrG5oXSBuaMOibiBraOG6qXUgY8O5bmcgc2luaCBz4buRbmcsIHRyb25nIMSRw7MgY8OzIFtT4buRIGzGsOG7o25nIG5nxrDhu51pIHBo4bulIHRodeG7mWMsIHbDrSBk4bulOiBjw6FjIGVtIG5o4buPIMSRYW5nIMSRaSBo4buNYyBob-G6t2MgbmfGsOG7nWkgZ2nDoCB54bq_dV0sIHZp4buHYyBjaGkgdGnDqnUgY2hvIGN14buZYyBz4buRbmcgaMOgbmcgbmfDoHkgxJHDoyBsw6AgbeG7mXQgZ8OhbmggbuG6t25nIGzhu5tuLCBjaMawYSBr4buDIMSR4bq_biBjw6FjIGtob-G6o24gaOG7jWMgcGjDrSB2w6Agc2luaCBob-G6oXQgcGjDrSBjaG8gZW0gdHJvbmcgc3Xhu5F0IHF1w6EgdHLDrG5oIGjhu41jIMSR4bqhaSBo4buNYy5cblxuTeG6t2MgZMO5IGhvw6BuIGPhuqNuaCBnaWEgxJHDrG5oIGPDsm4gbmhp4buBdSBjaOG6rXQgduG6rXQsIGVtIGx1w7RuIMO9IHRo4bupYyDEkcaw4bujYyB04bqnbSBxdWFuIHRy4buNbmcgY-G7p2Egdmnhu4djIGjhu41jIHbDoCBraMO0bmcgbmfhu6tuZyBu4buXIGzhu7FjIHbGsMahbiBsw6puLiBU4burIGtoaSBixrDhu5tjIGNow6JuIHbDoG8gVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBUcsOgIFZpbmgsIGVtIGx1w7RuIGPhu5EgZ-G6r25nIGjhu41jIHThuq1wIGjhur90IG3DrG5oIMSR4buDIMSR4bqhdCBr4bq_dCBxdeG6oyB04buRdCBuaOG6pXQuIEvhur90IHF14bqjIGjhu41jIHThuq1wIGPhu6dhIGVtIHRyb25nIGPDoWMgaOG7jWMga-G7syB24burYSBxdWEgbHXDtG4gxJHhuqF0IHRow6BuaCB0w61jaCB4deG6pXQgc-G6r2MsIHbhu5tpIMSRaeG7g20gdHJ1bmcgYsOsbmggaOG7jWMgdOG6rXAgdMOtY2ggbMWpeSAoR1BBKSBsw6AgW8SQaeG7gW4gR1BBIGPhu6UgdGjhu4MsIHbDrSBk4bulOiBYLlgvNC4wIGhv4bq3YyBZLlkvMTAuMF0sIHbGsOG7o3QgeGEgdGnDqnUgY2jDrSB04buRaSB0aGnhu4N1IGPhu6dhIFF14bu5LiDEkOG7k25nIHRo4budaSwgxJFp4buDbSByw6huIGx1eeG7h24gY-G7p2EgZW0gY8WpbmcgxJHhuqF0IGxv4bqhaSBU4buRdCB0cuG7nyBsw6puLiBFbSB0aW4gcuG6sW5nIG5o4buvbmcgbuG7lyBs4buxYyBuw6B5IGtow7RuZyBjaOG7iSB0aOG7gyBoaeG7h24ga2jhuqMgbsSDbmcgaOG7jWMgdOG6rXAgbcOgIGPDsm4gbMOgIMO9IGNow60gcXV54bq_dCB0w6JtIHbGsOG7o3Qga2jDsyDEkeG7gyBraMO0bmcgcGjhu6UgbMOybmcgbW9uZyBt4buPaSBj4bunYSBnaWEgxJHDrG5oIHbDoCB0aOG6p3kgY8O0LlxuXG5FbSBoaeG7g3UgcuG6sW5nIFF14bu5IFwiSOG7jWMgYuG7lW5nIMSQ4buTbmcgaMOgbmggY8O5bmcgU2luaCB2acOqbiBOZ2jDqG8gVsaw4bujdCBraMOzIFRWVVwiIMSRxrDhu6NjIHRow6BuaCBs4bqtcCDEkeG7gyBo4buXIHRy4bujIG5o4buvbmcgc2luaCB2acOqbiBjw7MgaG_DoG4gY-G6o25oIGtow7Mga2jEg24gbmjGsG5nIGPDsyDDvSBjaMOtIHbGsMahbiBsw6puIHRyb25nIGjhu41jIHThuq1wLiBFbSBuaOG6rW4gdGjhuqV5IG3DrG5oIMSR4bunIGPDoWMgxJFp4buBdSBraeG7h24gbcOgIFF14bu5IMSRxrBhIHJhOiBnaWEgxJHDrG5oIHRodeG7mWMgZGnhu4duIGjhu5kgbmdow6hvLCBjw7MgdGjDoG5oIHTDrWNoIGjhu41jIHThuq1wIHh14bqldCBz4bqvYyB24bubaSBHUEEgY2FvIHbDoCDEkWnhu4NtIHLDqG4gbHV54buHbiB04buRdC4gSGnhu4duIHThuqFpLCBlbSBjaMawYSBuaOG6rW4gYuG6pXQga-G7syBo4buNYyBi4buVbmcgdMOgaSB0cuG7oyBuw6BvIGtow6FjIHRyb25nIGPDuW5nIGjhu41jIGvhu7MvbsSDbSBo4buNYy4gS2hv4bqjbiBo4buXIHRy4bujIHThu6sgUXXhu7kgc-G6vSBsw6Agbmd14buTbiDEkeG7mW5nIHZpw6puIHbDtCBjw7luZyBxdcO9IGdpw6EsIGdpw7pwIGVtIHRyYW5nIHRy4bqjaSBt4buZdCBwaOG6p24gY2hpIHBow60gaOG7jWMgdOG6rXAgdsOgIHNpbmggaG_huqF0LCBnaeG6o20gYuG7m3QgZ8OhbmggbuG6t25nIHTDoGkgY2jDrW5oIGNobyBnaWEgxJHDrG5oLCB04burIMSRw7MgZW0gY8OzIHRo4buDIHnDqm4gdMOibSB04bqtcCB0cnVuZyB2w6BvIHZp4buHYyBo4buNYy5cblxuRW0geGluIGNhbSBr4bq_dCBz4bq9IHPhu60gZOG7pW5nIGtob-G6o24gaOG7lyB0cuG7oyBt4buZdCBjw6FjaCBoaeG7h3UgcXXhuqMsIMSRw7puZyBt4b\"}', '127.0.0.1', '2026-07-05 17:35:58'),
(77, NULL, 'API_TAO_MOI', 'api', NULL, 'POST /api/guest/verify-otp - tác động dữ liệu thành công (200)', NULL, '{\"truncated\":true,\"length\":7242,\"preview\":\"{\\\"method\\\":\\\"POST\\\",\\\"path\\\":\\\"/api/guest/verify-otp\\\",\\\"statusCode\\\":200,\\\"durationMs\\\":180,\\\"params\\\":{},\\\"query\\\":{},\\\"body\\\":{\\\"email\\\":\\\"nthienwww@gmail.com\\\",\\\"otpCode\\\":\\\"841139\\\",\\\"type\\\":\\\"application\\\",\\\"otpToken\\\":\\\"eyJ0eXBlIjoiYXBwbGljYXRpb24iLCJlbWFpbCI6Im50aGllbnd3d0BnbWFpbC5jb20iLCJ0cmFja2luZ1V1aWQiOiI0ODUyMjBmMi1mMTczLTQ0MDMtOTc0Ny1jOTNjYmZkNDMxZTUiLCJvdHBIYXNoIjoiNDRjY2U4NjEzNjdlZTg4ZGRjM2RmOTlkMjc3YzYwN2NhOTg3ODYwZWI3MTc5OGQxODczZTUxM2JiODUzZWM2YSIsImV4cGlyZXNBdCI6IjIwMjYtMDctMDVUMTg6MDU6NTguNTYyWiIsImFwcGxpY2F0aW9uIjp7Imd1ZXN0SG9UZW4iOiJUcuG6p24gTmjhu7F0IFRoacOqbiIsImd1ZXN0RW1haWwiOiJudGhpZW53d3dAZ21haWwuY29tIiwiZ3Vlc3RTb0RpZW5UaG9haSI6IjAzOTM0OTg5MjciLCJndWVzdE1zc3YiOiIxMTAxMjIxNjIiLCJndWVzdEtob2EiOiJDw7RuZyBOZ2jhu4cgVGjDtG5nIHRpbiIsImd1ZXN0TG9wIjoiRGEyMlRUQyIsImd1ZXN0U29UYWlLaG9hbiI6IjczNDAzMTg4MTgiLCJndWVzdE5nYW5IYW5nIjoiQklEViIsImd1ZXN0Q2h1VGFpS2hvYW4iOiJUUkFOIE5IVVQgVEhJRU4iLCJxdXlJZCI6NSwibHlEbyI6IlvEkMahbiB4aW4gUXXhu7kgSOG7jWMgYuG7lW5nIMSQ4buTbmcgaMOgbmggY8O5bmcgU2luaCB2acOqbiBOZ2jDqG8gVsaw4bujdCBraMOzIFRWVSBo4buNYyBr4buzIElJIG7Eg20gaOG7jWMgMjAyNi0yMDI3XSAtIEPhu5hORyBIw5JBIFjDgyBI4buYSSBDSOG7piBOR0jEqEEgVknhu4ZUIE5BTVxuxJDhu5ljIGzhuq1wIOKAkyBU4buxIGRvIOKAkyBI4bqhbmggcGjDumNcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblRow6BuaCBwaOG7kSBUcsOgIFZpbmgsIG5nw6B5IC4uLi4uLiB0aMOhbmcgLi4uLi4uIG7Eg20gLi4uLi4uXG5cbioqxJDGoE4gWElOIEjhu5YgVFLhu6IgVOG7qiBRVeG7uCBI4buMQyBC4buUTkcgxJDhu5JORyBIw4BOSCBDw5lORyBTSU5IIFZJw4pOIE5HSMOITyBWxq_hu6JUIEtIw5MgVFZVKipcblxuS8OtbmggZ-G7rWk6XG4qICAgQmFuIEdpw6FtIGhp4buHdSBUcsaw4budbmcgxJDhuqFpIGjhu41jIFRyw6AgVmluaDtcbiogICBCYW4gUXXhuqNuIGzDvSBRdeG7uSBcIlF14bu5IEjhu41jIGLhu5VuZyDEkOG7k25nIGjDoG5oIGPDuW5nIFNpbmggdmnDqm4gTmdow6hvIFbGsOG7o3Qga2jDsyBUVlVcIi5cblxuRW0gdMOqbiBsw6A6IFtI4buNIHbDoCB0w6puIHNpbmggdmnDqm5dXG5OZ8OgeSBzaW5oOiBbTmfDoHkvdGjDoW5nL27Eg20gc2luaF1cbk3DoyBz4buRIHNpbmggdmnDqm46IFtNU1NWXVxuTOG7m3A6IFtUw6puIGzhu5twXVxuS2hvYTogW1TDqm4gS2hvYV1cbk5nw6BuaCBo4buNYzogW1TDqm4gTmfDoG5oIGjhu41jXVxuU-G7kSDEkWnhu4duIHRob-G6oWk6IFtT4buRIMSRaeG7h24gdGhv4bqhaV1cbkVtYWlsOiBbxJDhu4thIGNo4buJIGVtYWlsXVxuXG5FbSB2aeG6v3QgxJHGoW4gbsOgeSB24bubaSBsw7JuZyBrw61uaCB0cuG7jW5nIHbDoCBtb25nIG114buRbiDEkcaw4bujYyB0csOsbmggYsOgeSBob8OgbiBj4bqjbmggY-G7p2EgYuG6o24gdGjDom4sIGvDrW5oIG1vbmcgQmFuIEdpw6FtIGhp4buHdSBOaMOgIHRyxrDhu51uZyB2w6AgQmFuIFF14bqjbiBsw70gUXXhu7kgeGVtIHjDqXQgaOG7lyB0cuG7oyBlbSBjw7MgdGjDqm0gxJFp4buBdSBraeG7h24gdGnhur9wIHThu6VjIGjhu41jIHThuq1wLlxuXG5HaWEgxJHDrG5oIGVtIGhp4buHbiDEkWFuZyBzaW5oIHPhu5FuZyB04bqhaSBbxJDhu4thIGNo4buJIG7GoWkg4bufIGhp4buHbiB04bqhaSBj4bunYSBnaWEgxJHDrG5oLCB2w60gZOG7pTogdGjDtG4gWCwgeMOjIFksIGh1eeG7h24gWiwgdOG7iW5oIFRdLiBIb8OgbiBj4bqjbmggZ2lhIMSRw6xuaCBlbSDEkeG6t2MgYmnhu4d0IGtow7Mga2jEg24sIHRodeG7mWMgZGnhu4duIGjhu5kgbmdow6hvIHRoZW8geMOhYyBuaOG6rW4gY-G7p2EgY2jDrW5oIHF1eeG7gW4gxJHhu4thIHBoxrDGoW5nIChjw7Mgc-G7lSBo4buZIG5naMOobyDEkcOtbmgga8OobSkuIE5ndeG7k24gdGh1IG5o4bqtcCBjaMOtbmggY-G7p2EgZ2lhIMSRw6xuaCBwaOG7pSB0aHXhu5ljIHbDoG8gW07DqnUgcsO1IG5ndeG7k24gdGh1IG5o4bqtcCwgdsOtIGThu6U6IGPDtG5nIHZp4buHYyBuw7RuZyBuZ2hp4buHcCBi4bqlcCBiw6puaCBj4bunYSBjaGEgbeG6uV0gduG7kW4gcuG6pXQgaOG6oW4gY2jhur8gdsOgIGtow7RuZyDhu5VuIMSR4buLbmguIFbhu5tpIFtT4buRIGzGsOG7o25nIHRow6BuaCB2acOqbiB0cm9uZyBnaWEgxJHDrG5oXSBuaMOibiBraOG6qXUgY8O5bmcgc2luaCBz4buRbmcsIHRyb25nIMSRw7MgY8OzIFtT4buRIGzGsOG7o25nIG5nxrDhu51pIHBo4bulIHRodeG7mWMsIHbDrSBk4bulOiBjw6FjIGVtIG5o4buPIMSRYW5nIMSRaSBo4buNYyBob-G6t2MgbmfGsOG7nWkgZ2nDoCB54bq_dV0sIHZp4buHYyBjaGkgdGnDqnUgY2hvIGN14buZYyBz4buRbmcgaMOgbmcgbmfDoHkgxJHDoyBsw6AgbeG7mXQgZ8OhbmggbuG6t25nIGzhu5tuLCBjaMawYSBr4buDIMSR4bq_biBjw6FjIGtob-G6o24gaOG7jWMgcGjDrSB2w6Agc2luaCBob-G6oXQgcGjDrSBjaG8gZW0gdHJvbmcgc3Xhu5F0IHF1w6EgdHLDrG5oIGjhu41jIMSR4bqhaSBo4buNYy5cblxuTeG6t2MgZMO5IGhvw6BuIGPhuqNuaCBnaWEgxJHDrG5oIGPDsm4gbmhp4buBdSBjaOG6rXQgduG6rXQsIGVtIGx1w7RuIMO9IHRo4bupYyDEkcaw4bujYyB04bqnbSBxdWFuIHRy4buNbmcgY-G7p2Egdmnhu4djIGjhu41jIHbDoCBraMO0bmcgbmfhu6tuZyBu4buXIGzhu7FjIHbGsMahbiBsw6puLiBU4burIGtoaSBixrDhu5tjIGNow6JuIHbDoG8gVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBUcsOgIFZpbmgsIGVtIGx1w7RuIGPhu5EgZ-G6r25nIGjhu41jIHThuq1wIGjhur90IG3DrG5oIMSR4buDIMSR4bqhdCBr4bq_dCBxdeG6oyB04buRdCBuaOG6pXQuIEvhur90IHF14bqjIGjhu41jIHThuq1wIGPhu6dhIGVtIHRyb25nIGPDoWMgaOG7jWMga-G7syB24burYSBxdWEgbHXDtG4gxJHhuqF0IHRow6BuaCB0w61jaCB4deG6pXQgc-G6r2MsIHbhu5tpIMSRaeG7g20gdHJ1bmcgYsOsbmggaOG7jWMgdOG6rXAgdMOtY2ggbMWpeSAoR1BBKSBsw6AgW8SQaeG7gW4gR1BBIGPhu6UgdGjhu4MsIHbDrSBk4bulOiBYLlgvNC4wIGhv4bq3YyBZLlkvMTAuMF0sIHbGsOG7o3QgeGEgdGnDqnUgY2jDrSB04buRaSB0aGnhu4N1IGPhu6dhIFF14bu5LiDEkOG7k25nIHRo4budaSwgxJFp4buDbSByw6huIGx1eeG7h24gY-G7p2EgZW0gY8WpbmcgxJHhuqF0IGxv4bqhaSBU4buRdCB0cuG7nyBsw6puLiBFbSB0aW4gcuG6sW5nIG5o4buvbmcgbuG7lyBs4buxYyBuw6B5IGtow7RuZyBjaOG7iSB0aOG7gyBoaeG7h24ga2jhuqMgbsSDbmcgaOG7jWMgdOG6rXAgbcOgIGPDsm4gbMOgIMO9IGNow60gcXV54bq_dCB0w6JtIHbGsOG7o3Qga2jDsyDEkeG7gyBraMO0bmcgcGjhu6UgbMOybmcgbW9uZyBt4buPaSBj4bunYSBnaWEgxJHDrG5oIHbDoCB0aOG6p3kgY8O0LlxuXG5FbSBoaeG7g3UgcuG6sW5nIFF14bu5IFwiSOG7jWMgYuG7lW5nIMSQ4buTbmcgaMOgbmggY8O5bmcgU2luaCB2acOqbiBOZ2jDqG8gVsaw4bujdCBraMOzIFRWVVwiIMSRxrDhu6NjIHRow6BuaCBs4bqtcCDEkeG7gyBo4buXIHRy4bujIG5o4buvbmcgc2luaCB2acOqbiBjw7MgaG_DoG4gY-G6o25oIGtow7Mga2jEg24gbmjGsG5nIGPDsyDDvSBjaMOtIHbGsMahbiBsw6puIHRyb25nIGjhu41jIHThuq1wLiBFbSBuaOG6rW4gdGjhuqV5IG3DrG5oIMSR4bunIGPDoWMgxJFp4buBdSBraeG7h24gbcOgIFF14bu5IMSRxrBhIHJhOiBnaWEgxJHDrG5oIHRodeG7mWMgZGnhu4duIGjhu5kgbmdow6hvLCBjw7MgdGjDoG5oIHTDrWNoIGjhu41jIHThuq1wIHh14bqldCBz4bqvYyB24bubaSBHUEEgY2FvIHbDoCDEkWnhu4NtIHLDqG4gbHV54buHbiB04buRdC4gSGnhu4duIHThuqFpLCBlbSBjaMawYSBuaOG6rW4gYuG6pXQga-G7syBo4buNYyBi4buVbmcgdMOgaSB0cuG7oyBuw6BvIGtow6FjIHRyb25nIGPDuW5nIGjhu41jIGvhu7MvbsSDbSBo4buNYy4gS2hv4bqjbiBo4buXIHRy4bujIHThu6sgUXXhu7kgc-G6vSBsw6Agbmd14buTbiDEkeG7mW5nIHZpw6puIHbDtCBjw7luZyBxdcO9IGdpw6EsIGdpw7pwIGVtIHRyYW5nIHRy4bqjaSBt4buZdCBwaOG6p24gY2hpIHBow60gaOG7jWMgdOG6rXAgdsOgIHNpbmggaG_huqF0LCBnaeG6o20gYuG7m3QgZ8OhbmggbuG6t25nIHTDoGkgY2jDrW5oIGNobyBnaWEgxJHDrG5oLCB04burIMSRw7MgZW0gY8OzIHRo4buDIHnDqm4gdMOibSB04bqtcCB0cnVuZyB2w6BvIHZp4buHYyBo4buNYy5cblxuRW0geGluIGNhbSBr4bq_dCBz4bq9IHPhu60gZOG7pW5nIGtob-G6o24gaOG7lyB0cuG7oyBt4buZdCBjw6FjaCBoaeG7h3Ugc\"}', '127.0.0.1', '2026-07-05 17:36:19'),
(78, 13, 'DANG_NHAP', 'nguoidung', 13, '[Sinh viên] Trần Nhựt Thiên: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-05 17:37:25'),
(79, 13, 'DANG_XUAT', 'nguoidung', 13, '[Sinh viên] Trần Nhựt Thiên: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-07-05 17:37:46'),
(80, 3, 'DANG_NHAP', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Tùng: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-05 17:38:10'),
(81, 3, 'DUYET_YEU_CAU_HO_TRO_CAP_1', 'yeucauhotro', 1, '[Nhân viên hệ thống] Lê Văn Tùng: Duyệt đơn xin hỗ trợ ID 1 ở cấp 1 (Cán bộ Quỹ/Giáo vụ). Trạng thái đổi thành \'Chờ duyệt cấp 2\'', '{\"trangthai\":\"Cho duyet cap 1\"}', '{\"trangthai\":\"Cho duyet cap 2\"}', '127.0.0.1', '2026-07-05 17:38:29'),
(82, 3, 'DANG_XUAT', 'nguoidung', 3, '[Nhân viên hệ thống] Lê Văn Tùng: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-07-05 17:38:37'),
(83, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-05 17:38:53'),
(84, 1, 'DUYET_YEU_CAU_HO_TRO_CAP_2', 'yeucauhotro', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Duyệt đơn xin hỗ trợ ID 1 ở cấp 2 (Admin). Trạng thái đổi thành \'Chờ duyệt cấp 3\'', '{\"trangthai\":\"Cho duyet cap 2\"}', '{\"trangthai\":\"Cho duyet cap 3\"}', '127.0.0.1', '2026-07-05 17:39:12'),
(85, 1, 'DANG_XUAT', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng xuất khỏi hệ thống', NULL, NULL, '127.0.0.1', '2026-07-05 17:39:17'),
(86, 2, 'DANG_NHAP', 'nguoidung', 2, '[Nhân viên hệ thống] Trần Thị Kế Toán: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-05 17:39:33'),
(87, 2, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Trần Thị Kế Toán: POST /api/upload - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload\",\"statusCode\":200,\"durationMs\":11,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-05 17:40:21'),
(88, 2, 'CAP_NHAT_YEU_CAU_HO_TRO', 'yeucauhotro', 1, '[Nhân viên hệ thống] Trần Thị Kế Toán: Phê duyệt cấp 3 và giải ngân thành công số tiền 20.000.000 VNĐ từ quỹ \'Quỹ Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU\' cho đơn hỗ trợ ID 1', '{\"trangthai\":\"Cho duyet cap 3\"}', '{\"trangthai\":\"Da giai ngan\"}', '127.0.0.1', '2026-07-05 17:40:21'),
(89, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-06 07:05:58'),
(90, 1, 'API_CAP_NHAT', 'status', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: PUT /api/student-showcase/1/status - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"PUT\",\"path\":\"/api/student-showcase/1/status\",\"statusCode\":200,\"durationMs\":10,\"params\":{\"id\":\"1\"},\"query\":{},\"body\":{\"trangThai\":\"An\"}}', '127.0.0.1', '2026-07-06 07:07:08'),
(91, 1, 'API_CAP_NHAT', 'status', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: PUT /api/student-showcase/1/status - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"PUT\",\"path\":\"/api/student-showcase/1/status\",\"statusCode\":200,\"durationMs\":6,\"params\":{\"id\":\"1\"},\"query\":{},\"body\":{\"trangThai\":\"Hien thi\"}}', '127.0.0.1', '2026-07-06 07:07:11'),
(92, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-06 08:56:13'),
(93, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-06 10:29:28'),
(94, 1, 'DANG_NHAP', 'nguoidung', 1, '[Nhân viên hệ thống] Nguyễn Văn Bình: Đăng nhập hệ thống thành công', NULL, NULL, '127.0.0.1', '2026-07-06 14:12:34'),
(95, 1, 'API_TAO_MOI', 'api', NULL, '[Nhân viên hệ thống] Nguyễn Văn Bình: POST /api/upload/fund - tác động dữ liệu thành công (200)', NULL, '{\"method\":\"POST\",\"path\":\"/api/upload/fund\",\"statusCode\":200,\"durationMs\":22,\"params\":{},\"query\":{},\"body\":{}}', '127.0.0.1', '2026-07-06 15:01:50'),
(96, 1, 'THEM_MOI_QUY', 'quy', 6, '[Nhân viên hệ thống] Nguyễn Văn Bình: Thêm mới quỹ hỗ trợ: Quỹ Học Bổng Nghiên Cứu Khoa Học Sinh Viên', NULL, '{\"tenQuy\":\"Quỹ Học Bổng Nghiên Cứu Khoa Học Sinh Viên\",\"loaiQuy\":\"Hoc bong\",\"moTa\":\"Quỹ hỗ trợ và trao học bổng cho sinh viên có thành tích xuất sắc trong nghiên cứu khoa học, phát triển công nghệ và tham gia các cuộc thi học thuật trong nước và quốc tế.\",\"hinhAnh\":\"uploads/avatars/fund/HB-vuotkho_1781667063892_236824022_1783350110621_435954583.jpg\",\"soTienMucTieu\":600000000,\"soTienHoTroToiDa\":15000000,\"soLuongChiTieu\":40,\"hanNopDon\":\"2027-07-06\",\"dieuKienTomTat\":\"- Là sinh viên đang theo học tại trường.\\n- Có đề tài nghiên cứu khoa học được nghiệm thu hoặc đang triển khai.\\n- Có bài báo khoa học, sản phẩm nghiên cứu hoặc đạt giải tại các cuộc thi học thuật là một lợi thế.\\n- GPA từ 3.0/4.0 hoặc tương đương.\\n- Được giảng viên hướng dẫn hoặc khoa chuyên môn đề cử.\",\"soDu\":200000000,\"trangThai\":\"Dang hoat dong\",\"nguoiTao\":1,\"ngayBatDau\":\"2026-07-06\",\"loaiDieuHanh\":\"Tap trung - Muc chi\",\"quyChaId\":1,\"soDotGiaiNgan\":2,\"dotGiaiNgan\":[{\"thutu\":1,\"tenDot\":\"Đợt 1\",\"mota\":\"Đợt giải ngân thứ 1\",\"sotiendukien\":300000000,\"ngaydukien\":\"2026-11-05\"},{\"thutu\":2,\"tenDot\":\"Đợt 2\",\"mota\":\"Đợt giải ngân thứ 2\",\"sotiendukien\":300000000,\"ngaydukien\":\"2027-03-06\"}]}', '127.0.0.1', '2026-07-06 15:07:59');

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

--
-- Đang đổ dữ liệu cho bảng `phanbongansach`
--

INSERT INTO `phanbongansach` (`phanbongansach_id`, `quy_nguon_id`, `quy_dich_id`, `sotien`, `soquyetdinh`, `filequyetdinh`, `trangthai`, `lydotuchoi`, `nguoi_de_xuat_id`, `nguoi_duyet_id`, `ngaydexuat`, `ngayduyet`, `ghichu`) VALUES
(1, 1, 6, 200000000.00, 'AUTO-TAO-QUY-6', NULL, 'Da duyet', NULL, 1, 1, '2026-07-06 15:07:59', '2026-07-06 15:07:59', 'Tự động ghi nhận trích lập ngân sách khi tạo quỹ con \"Quỹ Học Bổng Nghiên Cứu Khoa Học Sinh Viên\".');

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
(1, 1, 1, 3, 'Da duyet', NULL, 'đủ yêu cầu\n', '2026-07-05 17:38:29'),
(2, 1, 2, 1, 'Da duyet', NULL, 'đủ yêu cầu', '2026-07-05 17:39:12'),
(3, 1, 3, 2, 'Da duyet', NULL, 'đủ yêu cầu', '2026-07-05 17:40:21');

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
(1, 'Quỹ phát triển Đại học Trà Vinh', 7, NULL, 'uploads/avatars/fund/250_1781674629998_996093529_1783097566841_600534754.jpg', 5000000000.00, 1800000000.00, NULL, NULL, NULL, '2026-07-03', '2027-12-29', 'Dang hoat dong', NULL, '2026-07-03 10:15:23', '2026-07-06 15:07:59', 'Tap trung - Be chung', NULL),
(5, 'Quỹ Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU', 2, '- Thuộc diện hộ nghèo hoặc hộ cận nghèo (có sổ hoặc giấy xác nhận từ địa phương).\n- Điểm trung bình học tập tích lũy (GPA) từ 2.5/4.0 hoặc 7.0/10.0 trở lên.\n- Điểm rèn luyện đạt loại Tốt trở lên.\n- Chưa nhận bất kỳ học bổng tài trợ nào khác trong cùng', 'uploads/avatars/fund/153004-truong-dai-hoc-tra-vinh-ky-niem-ngay-nha-giao-viet-nam-va-trao-hoc-bong-cho-sinh-vien-vuot-kho-hoc-gioi_1781674663123_108544383_1783099460741_662453561.jpg', 400000000.00, 280000000.00, 20000000.00, 20, NULL, '2026-07-03', '2027-01-04', 'Dang hoat dong', 1, '2026-07-03 17:26:02', '2026-07-05 17:40:21', 'Tap trung - Muc chi', 1),
(6, 'Quỹ Học Bổng Nghiên Cứu Khoa Học Sinh Viên', 2, 'Quỹ hỗ trợ và trao học bổng cho sinh viên có thành tích xuất sắc trong nghiên cứu khoa học, phát triển công nghệ và tham gia các cuộc thi học thuật trong nước và quốc tế.', 'uploads/avatars/fund/HB-vuotkho_1781667063892_236824022_1783350110621_435954583.jpg', 600000000.00, 200000000.00, 15000000.00, 40, '- Là sinh viên đang theo học tại trường.\n- Có đề tài nghiên cứu khoa học được nghiệm thu hoặc đang triển khai.\n- Có bài báo khoa học, sản phẩm nghiên cứu hoặc đạt giải tại các cuộc thi học thuật là một lợi thế.\n- GPA từ 3.0/4.0 hoặc tương đương.\n- Được giảng viên hướng dẫn hoặc khoa chuyên môn đề cử.', '2026-07-06', '2027-07-06', 'Dang hoat dong', 1, '2026-07-06 15:07:59', '2026-07-06 15:07:59', 'Tap trung - Muc chi', 1);

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

--
-- Đang đổ dữ liệu cho bảng `sinhviennoibat`
--

INSERT INTO `sinhviennoibat` (`sinhviennoibat_id`, `nguoidung_id`, `namhoc`, `thanhtich`, `thutu`, `trangthai`, `ngaytao`, `ngaycapnhat`) VALUES
(1, 13, '2026-2027', 'Nhận hỗ trợ từ TVU Fund và đạt thành tích tốt trong học tập.', 0, 'Hien thi', '2026-07-05 17:40:21', '2026-07-06 07:07:11');

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

--
-- Đang đổ dữ liệu cho bảng `taikhoannganhang`
--

INSERT INTO `taikhoannganhang` (`taikhoannganhang_id`, `quy_id`, `loaitaikhoan`, `sotaikhoan`, `nganhang`, `chinhanh`, `chutaikhoan`, `trangthai`, `ngaytao`, `ngaycapnhat`) VALUES
(1, NULL, 'Nha truong', '1018899889', 'VIETCOMBANK', 'Chi nhánh Trà Vinh', 'TRUONG DAI HOC TRA VINH', 'Hoat dong', '2026-07-05 04:45:34', '2026-07-05 04:45:34'),
(2, NULL, 'Nha truong', '1860205086886', 'AGRIBANK', 'Chi nhánh Trà Vinh', 'TRUONG DAI HOC TRA VINH', 'Hoat dong', '2026-07-05 05:29:01', '2026-07-05 05:29:01'),
(3, NULL, 'Nha truong', '109004285888', 'VIETINBANK', 'Chi nhánh Trà Vinh', 'TRUONG DAI HOC TRA VINH', 'Hoat dong', '2026-07-05 05:29:01', '2026-07-05 05:29:01'),
(4, NULL, 'Sinh vien', '7340318818', 'BIDV', NULL, 'TRAN NHUT THIEN', 'Hoat dong', '2026-07-05 17:36:19', '2026-07-05 17:36:19');

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
  `dot_id` int(11) DEFAULT NULL,
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

INSERT INTO `yeucauhotro` (`yeucauhotro_id`, `nguoidung_id`, `quy_id`, `dot_id`, `lydo`, `sotiendenghi`, `tailieudinhkem`, `trangthai`, `ghichu`, `ngaynop`, `ngaycapnhat`) VALUES
(1, 13, 5, NULL, '[Đơn xin Quỹ Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU học kỳ II năm học 2026-2027] - CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập – Tự do – Hạnh phúc\n-----------------------------------\n\nThành phố Trà Vinh, ngày ...... tháng ...... năm ......\n\n**ĐƠN XIN HỖ TRỢ TỪ QUỸ HỌC BỔNG ĐỒNG HÀNH CÙNG SINH VIÊN NGHÈO VƯỢT KHÓ TVU**\n\nKính gửi:\n*   Ban Giám hiệu Trường Đại học Trà Vinh;\n*   Ban Quản lý Quỹ \"Quỹ Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU\".\n\nEm tên là: [Họ và tên sinh viên]\nNgày sinh: [Ngày/tháng/năm sinh]\nMã số sinh viên: [MSSV]\nLớp: [Tên lớp]\nKhoa: [Tên Khoa]\nNgành học: [Tên Ngành học]\nSố điện thoại: [Số điện thoại]\nEmail: [Địa chỉ email]\n\nEm viết đơn này với lòng kính trọng và mong muốn được trình bày hoàn cảnh của bản thân, kính mong Ban Giám hiệu Nhà trường và Ban Quản lý Quỹ xem xét hỗ trợ em có thêm điều kiện tiếp tục học tập.\n\nGia đình em hiện đang sinh sống tại [Địa chỉ nơi ở hiện tại của gia đình, ví dụ: thôn X, xã Y, huyện Z, tỉnh T]. Hoàn cảnh gia đình em đặc biệt khó khăn, thuộc diện hộ nghèo theo xác nhận của chính quyền địa phương (có sổ hộ nghèo đính kèm). Nguồn thu nhập chính của gia đình phụ thuộc vào [Nêu rõ nguồn thu nhập, ví dụ: công việc nông nghiệp bấp bênh của cha mẹ] vốn rất hạn chế và không ổn định. Với [Số lượng thành viên trong gia đình] nhân khẩu cùng sinh sống, trong đó có [Số lượng người phụ thuộc, ví dụ: các em nhỏ đang đi học hoặc người già yếu], việc chi tiêu cho cuộc sống hàng ngày đã là một gánh nặng lớn, chưa kể đến các khoản học phí và sinh hoạt phí cho em trong suốt quá trình học đại học.\n\nMặc dù hoàn cảnh gia đình còn nhiều chật vật, em luôn ý thức được tầm quan trọng của việc học và không ngừng nỗ lực vươn lên. Từ khi bước chân vào Trường Đại học Trà Vinh, em luôn cố gắng học tập hết mình để đạt kết quả tốt nhất. Kết quả học tập của em trong các học kỳ vừa qua luôn đạt thành tích xuất sắc, với điểm trung bình học tập tích lũy (GPA) là [Điền GPA cụ thể, ví dụ: X.X/4.0 hoặc Y.Y/10.0], vượt xa tiêu chí tối thiểu của Quỹ. Đồng thời, điểm rèn luyện của em cũng đạt loại Tốt trở lên. Em tin rằng những nỗ lực này không chỉ thể hiện khả năng học tập mà còn là ý chí quyết tâm vượt khó để không phụ lòng mong mỏi của gia đình và thầy cô.\n\nEm hiểu rằng Quỹ \"Học bổng Đồng hành cùng Sinh viên Nghèo Vượt khó TVU\" được thành lập để hỗ trợ những sinh viên có hoàn cảnh khó khăn nhưng có ý chí vươn lên trong học tập. Em nhận thấy mình đủ các điều kiện mà Quỹ đưa ra: gia đình thuộc diện hộ nghèo, có thành tích học tập xuất sắc với GPA cao và điểm rèn luyện tốt. Hiện tại, em chưa nhận bất kỳ học bổng tài trợ nào khác trong cùng học kỳ/năm học. Khoản hỗ trợ từ Quỹ sẽ là nguồn động viên vô cùng quý giá, giúp em trang trải một phần chi phí học tập và sinh hoạt, giảm bớt gánh nặng tài chính cho gia đình, từ đó em có thể yên tâm tập trung vào việc học.\n\nEm xin cam kết sẽ sử dụng khoản hỗ trợ một cách hiệu quả, đúng mục đích để phục vụ cho việc học tập, không ngừng phấn đấu rèn luyện đạo đức, nâng cao kiến thức, kỹ năng để xứng đáng với sự tin tưởng và giúp đỡ của Quỹ, của Nhà trường. Em sẽ cố gắng hết sức để đạt được những thành tích cao hơn nữa, góp phần xây dựng hình ảnh sinh viên TVU năng động, tài năng và có ích cho xã hội.\n\nKính mong Ban Giám hiệu Nhà trường và Ban Quản lý Quỹ xem xét, tạo điều kiện và chấp thuận nguyện vọng của em.\n\nEm xin chân thành cảm ơn!\n\nTrân trọng kính đơn!\n\n**Người làm đơn**\n(Ký và ghi rõ họ tên)\n\n[Họ và tên sinh viên]', 20000000.00, 'uploads/documents/1_1783272904630_503982205.jpg', 'Da giai ngan', NULL, '2026-07-05 17:36:19', '2026-07-05 17:40:21');

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
-- Chỉ mục cho bảng `dotgiaingan`
--
ALTER TABLE `dotgiaingan`
  ADD PRIMARY KEY (`dot_id`),
  ADD KEY `quy_id` (`quy_id`);

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
  ADD KEY `idx_quy` (`quy_id`),
  ADD KEY `idx_loaitaikhoan` (`loaitaikhoan`,`trangthai`);

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
  ADD KEY `idx_trangthai` (`trangthai`),
  ADD KEY `dot_id` (`dot_id`);

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
  MODIFY `donvihoc_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `dotgiaingan`
--
ALTER TABLE `dotgiaingan`
  MODIFY `dot_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `giaodich`
--
ALTER TABLE `giaodich`
  MODIFY `giaodich_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `guest_khoantaitro`
--
ALTER TABLE `guest_khoantaitro`
  MODIFY `guest_khoantaitro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `guest_yeucauhotro`
--
ALTER TABLE `guest_yeucauhotro`
  MODIFY `guest_yeucauhotro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `khoantaitro`
--
ALTER TABLE `khoantaitro`
  MODIFY `khoantaitro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `loaiquy`
--
ALTER TABLE `loaiquy`
  MODIFY `loaiquy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `nguoidung_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `nhataitro`
--
ALTER TABLE `nhataitro`
  MODIFY `nhataitro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `nhatkyhethong`
--
ALTER TABLE `nhatkyhethong`
  MODIFY `nhatkyhethong_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT cho bảng `phanbongansach`
--
ALTER TABLE `phanbongansach`
  MODIFY `phanbongansach_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `pheduyet`
--
ALTER TABLE `pheduyet`
  MODIFY `pheduyet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `quy`
--
ALTER TABLE `quy`
  MODIFY `quy_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `sinhviennoibat`
--
ALTER TABLE `sinhviennoibat`
  MODIFY `sinhviennoibat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `taikhoannganhang`
--
ALTER TABLE `taikhoannganhang`
  MODIFY `taikhoannganhang_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `yeucauhotro_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
-- Các ràng buộc cho bảng `dotgiaingan`
--
ALTER TABLE `dotgiaingan`
  ADD CONSTRAINT `dotgiaingan_ibfk_1` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`);

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
  ADD CONSTRAINT `yeucauhotro_ibfk_2` FOREIGN KEY (`quy_id`) REFERENCES `quy` (`quy_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `yeucauhotro_ibfk_3` FOREIGN KEY (`dot_id`) REFERENCES `dotgiaingan` (`dot_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
