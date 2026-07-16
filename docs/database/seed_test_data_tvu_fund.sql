-- =====================================================================
-- TVU FUND MANAGEMENT — SEED DATA CHO KIỂM THỬ (TEST DATA)
-- Mục đích: Cung cấp dữ liệu mẫu đầy đủ cho TẤT CẢ các luồng nghiệp vụ
--           (Xin tài trợ / Yêu cầu hỗ trợ + Tài trợ / Donation),
--           mỗi kịch bản có 2 bản ghi mẫu, kèm đầy đủ các bảng bị kéo theo.
-- Charset: utf8mb4 | Database: tvu_fund_management
-- =====================================================================
--
-- ⚠️ GHI CHÚ QUAN TRỌNG TRƯỚC KHI CHẠY:
--
-- 1) VAITRO_ID: Script này GIẢ ĐỊNH ánh xạ vaitro_id như sau:
--       1 = Admin | 2 = Ke toan | 3 = Can bo Quy | 4 = Nguoi dung (SV/NTT/CB/NKH) | 5 = Ban Kiem Soat
--    → Trước khi chạy, hãy kiểm tra lại bằng:
--         SELECT vaitro_id, tenvaitro FROM vaitro;
--    Nếu thứ tự khác, sửa lại giá trị vaitro_id trong khối "1. NGƯỜI DÙNG" bên dưới.
--
-- 2) DẢI ID DÙNG CHO DỮ LIỆU TEST (để tránh đụng ID dữ liệu thật đang có sẵn):
--       nguoidung        : 9001 - 9050
--       donvihoc         : 901 - 905   (thêm mới, không đụng donvihoc_id=1 có sẵn)
--       loaiquy          : 901 - 903   (thêm mới)
--       quy              : 901 - 905
--       taikhoannganhang : 901 - 910
--       dotgiaingan      : 901 - 910
--       nhataitro        : 901 - 910
--       yeucauhotro      : 90001 - 90031
--       khoantaitro      : 90101 - 90111
--       (pheduyet, giaodich, dieukhoanthuhoi, hopdongvayvon, lichtrano, nghiemthu:
--        dùng AUTO_INCREMENT, không cần ID cố định vì không bị FK nào khác trỏ tới ngược lại)
--
-- 3) MẬT KHẨU: cột `matkhau` dùng chuỗi giả lập bcrypt (KHÔNG dùng để đăng nhập thật).
--    Trước khi test đăng nhập, cần hash lại bằng bcrypt thực tế của backend.
--
-- 4) `pheduyet.ketqua`: Script dùng nhất quán 'Duyet' cho duyệt thành công,
--    'Tu choi' cho từ chối, 'Cho duyet' cho cấp đang chờ xử lý (chưa có kết quả).
--    (Enum còn có giá trị 'Da duyet' — không dùng trong script này để tránh nhập nhằng,
--    điều chỉnh lại theo đúng quy ước thực tế nếu code của bạn dùng 'Da duyet'.)
--
-- 5) Toàn bộ ngày tháng nằm trong khoảng năm học 2025-2026 (hiện tại: 2026-07-15).
--
-- =====================================================================


-- =====================================================================
-- KHỐI 0 — DỌN DẸP DẢI ID TEST (chạy an toàn nhiều lần, không lỗi trùng khóa)
-- =====================================================================
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM lichtrano WHERE hopdongvayvon_id IN (SELECT hopdongvayvon_id FROM hopdongvayvon WHERE yeucauhotro_id BETWEEN 90000 AND 90040);
DELETE FROM hopdongvayvon WHERE yeucauhotro_id BETWEEN 90000 AND 90040;
DELETE FROM nghiemthu WHERE yeucauhotro_id BETWEEN 90000 AND 90040;
DELETE FROM dieukhoanthuhoi WHERE yeucauhotro_id BETWEEN 90000 AND 90040;
DELETE FROM giaodich WHERE yeucauhotro_id BETWEEN 90000 AND 90040 OR quy_id BETWEEN 901 AND 905;
DELETE FROM pheduyet WHERE yeucauhotro_id BETWEEN 90000 AND 90040;
DELETE FROM yeucauhotro WHERE yeucauhotro_id BETWEEN 90000 AND 90040;
DELETE FROM khoantaitro WHERE khoantaitro_id BETWEEN 90100 AND 90120;
DELETE FROM guest_yeucauhotro WHERE tracking_uuid LIKE 'TEST-%';
DELETE FROM guest_khoantaitro WHERE tracking_uuid LIKE 'TEST-%';
DELETE FROM dotgiaingan WHERE dot_id BETWEEN 901 AND 910;
DELETE FROM taikhoannganhang WHERE taikhoannganhang_id BETWEEN 901 AND 910;
DELETE FROM nhataitro WHERE nhataitro_id BETWEEN 901 AND 910;
DELETE FROM quy WHERE quy_id BETWEEN 901 AND 905;
DELETE FROM loaiquy WHERE loaiquy_id BETWEEN 901 AND 903;
DELETE FROM nguoidung WHERE nguoidung_id BETWEEN 9001 AND 9050;
DELETE FROM donvihoc WHERE donvihoc_id BETWEEN 901 AND 905;

SET FOREIGN_KEY_CHECKS = 1;


-- =====================================================================
-- KHỐI 1 — ĐƠN VỊ HỌC (donvihoc)
-- =====================================================================
INSERT INTO donvihoc (donvihoc_id, madonvi, tenkhoa, tennganh, lop, khoahoc, trangthai) VALUES
(901, 'CNTT', 'Khoa Kỹ thuật và Công nghệ', 'Công nghệ thông tin', 'DA21TIN01', '2021-2025', 'Hoat dong'),
(902, 'KT', 'Khoa Kinh tế - Luật', 'Tài chính - Ngân hàng', 'DA22TCNH02', '2022-2026', 'Hoat dong'),
(903, 'NN', 'Khoa Ngôn ngữ - Văn hóa - Nghệ thuật Khmer Nam Bộ', 'Sư phạm Ngữ văn', 'DA20NV01', '2020-2024', 'Hoat dong');


-- =====================================================================
-- KHỐI 2 — NGƯỜI DÙNG (nguoidung)
-- =====================================================================

-- --- 2.1 Nhân sự nội bộ (Admin / Kế toán / Cán bộ Quỹ / Ban Kiểm soát) ---
INSERT INTO nguoidung (nguoidung_id, email, matkhau, hoten, masodinhdanh, ngaysinh, gioitinh, sodienthoai, diachi, donvihoc_id, vaitro_id, loaitaikhoan, tinhtrangcongtac, trangthai) VALUES
(9001, 'tranminhbinh.admin@tvu.edu.vn', '$2b$10$TESTHASHADMIN000000000000000000000000000000000000', 'Trần Minh Bình', 'NV0001', '1980-03-12', 'Nam', '0909111001', '126 Nguyễn Thiện Thành, P.5, TP. Trà Vinh', NULL, 1, NULL, NULL, 'Hoat dong'),
(9002, 'lethihongtham.ketoan@tvu.edu.vn', '$2b$10$TESTHASHKETOAN0000000000000000000000000000000000000', 'Lê Thị Hồng Thắm', 'NV0002', '1985-07-20', 'Nu', '0909111002', '45 Lê Lợi, P.1, TP. Trà Vinh', NULL, 2, NULL, NULL, 'Hoat dong'),
(9003, 'phamvanduc.canbo@tvu.edu.vn', '$2b$10$TESTHASHCANBO10000000000000000000000000000000000000', 'Phạm Văn Đức', 'NV0003', '1988-11-05', 'Nam', '0909111003', '78 Trần Phú, P.2, TP. Trà Vinh', NULL, 3, NULL, NULL, 'Hoat dong'),
(9004, 'vothingocha.canbo@tvu.edu.vn', '$2b$10$TESTHASHCANBO20000000000000000000000000000000000000', 'Võ Thị Ngọc Hà', 'NV0004', '1990-02-14', 'Nu', '0909111004', '12 Phạm Ngũ Lão, P.3, TP. Trà Vinh', NULL, 3, NULL, NULL, 'Hoat dong'),
(9005, 'dangquochuy.bks@tvu.edu.vn', '$2b$10$TESTHASHBKS000000000000000000000000000000000000000', 'Đặng Quốc Huy', 'NV0005', '1975-09-01', 'Nam', '0909111005', '9 Hùng Vương, P.4, TP. Trà Vinh', NULL, 5, NULL, NULL, 'Hoat dong');

-- --- 2.2 Sinh viên (nhóm dùng cho luồng cơ bản: học bổng, từ chối các cấp, chờ xử lý) ---
INSERT INTO nguoidung (nguoidung_id, email, matkhau, hoten, masodinhdanh, ngaysinh, gioitinh, sodienthoai, diachi, donvihoc_id, vaitro_id, loaitaikhoan, tinhtrangcongtac, trangthai) VALUES
(9010, 'nguyenthimyduyen@st.tvu.edu.vn', '$2b$10$TESTHASHSV0000000000000000000000000000000000000000', 'Nguyễn Thị Mỹ Duyên', '110121001', '2003-01-15', 'Nu', '0912345001', 'Ấp Long Trị, X. Long Đức, TP. Trà Vinh', 901, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9011, 'tranvankhoa@st.tvu.edu.vn', '$2b$10$TESTHASHSV0100000000000000000000000000000000000000', 'Trần Văn Khoa', '110121002', '2003-04-22', 'Nam', '0912345002', 'Ấp Vĩnh Yên, X. Long Hòa, H. Châu Thành', 901, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9012, 'lethibichngoc@st.tvu.edu.vn', '$2b$10$TESTHASHSV0200000000000000000000000000000000000000', 'Lê Thị Bích Ngọc', '110122010', '2004-06-30', 'Nu', '0912345003', 'Ấp Sóc Tro, X. Đại An, H. Trà Cú', 902, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9013, 'phamhoangnam@st.tvu.edu.vn', '$2b$10$TESTHASHSV0300000000000000000000000000000000000000', 'Phạm Hoàng Nam', '110122011', '2004-08-18', 'Nam', '0912345004', 'Ấp Bào Sen, X. Hòa Thuận, H. Châu Thành', 902, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9014, 'huynhthithanhtruc@st.tvu.edu.vn', '$2b$10$TESTHASHSV0400000000000000000000000000000000000000', 'Huỳnh Thị Thanh Trúc', '110120005', '2002-12-02', 'Nu', '0912345005', 'Ấp Cây Da, X. Lương Hòa, H. Châu Thành', 903, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9015, 'dovantai@st.tvu.edu.vn', '$2b$10$TESTHASHSV0500000000000000000000000000000000000000', 'Đỗ Văn Tài', '110120006', '2002-05-09', 'Nam', '0912345006', 'Ấp Chợ, X. Đa Lộc, H. Châu Thành', 903, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9016, 'nguyenhuuphat@st.tvu.edu.vn', '$2b$10$TESTHASHSV0600000000000000000000000000000000000000', 'Nguyễn Hữu Phát', '110121007', '2003-03-03', 'Nam', '0912345007', 'Ấp Bình An, X. Hòa Lợi, H. Châu Thành', 901, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9017, 'truongthikimanh@st.tvu.edu.vn', '$2b$10$TESTHASHSV0700000000000000000000000000000000000000', 'Trương Thị Kim Anh', '110121008', '2003-07-07', 'Nu', '0912345008', 'Ấp Giồng Lức, X. Đức Mỹ, H. Càng Long', 901, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9018, 'lamvansang@st.tvu.edu.vn', '$2b$10$TESTHASHSV0800000000000000000000000000000000000000', 'Lâm Văn Sang', '110122012', '2004-01-25', 'Nam', '0912345009', 'Ấp Ba So, X. Nhị Trường, H. Cầu Ngang', 902, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9019, 'buithihongnhung@st.tvu.edu.vn', '$2b$10$TESTHASHSV0900000000000000000000000000000000000000', 'Bùi Thị Hồng Nhung', '110122013', '2004-09-10', 'Nu', '0912345010', 'Ấp Bến Cát, X. Mỹ Hòa, H. Cầu Ngang', 902, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9020, 'ngovanhai@st.tvu.edu.vn', '$2b$10$TESTHASHSV1000000000000000000000000000000000000000', 'Ngô Văn Hải', '110120014', '2002-10-11', 'Nam', '0912345011', 'Ấp Xoài Xiêm, X. Ngãi Xuyên, H. Trà Cú', 903, 4, 'Sinh vien', NULL, 'Hoat dong');

-- --- 2.3 Sinh viên/nhóm chủ nhiệm đề tài nghiên cứu (cần nghiệm thu) ---
INSERT INTO nguoidung (nguoidung_id, email, matkhau, hoten, masodinhdanh, ngaysinh, gioitinh, sodienthoai, diachi, donvihoc_id, vaitro_id, loaitaikhoan, tinhtrangcongtac, trangthai) VALUES
(9021, 'lythicamtu@st.tvu.edu.vn', '$2b$10$TESTHASHSV1100000000000000000000000000000000000000', 'Lý Thị Cẩm Tú', '110119015', '2001-02-20', 'Nu', '0912345012', 'Ấp Sâm Bua, X. Lưu Nghiệp Anh, H. Trà Cú', 901, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9022, 'phanvanlong@st.tvu.edu.vn', '$2b$10$TESTHASHSV1200000000000000000000000000000000000000', 'Phan Văn Long', '110119016', '2001-11-19', 'Nam', '0912345013', 'Ấp Bình Trung, X. Mỹ Cẩm, H. Càng Long', 901, 4, 'Sinh vien', NULL, 'Hoat dong');

-- --- 2.4 Sinh viên nhận "Tài trợ có thu hồi" ---
INSERT INTO nguoidung (nguoidung_id, email, matkhau, hoten, masodinhdanh, ngaysinh, gioitinh, sodienthoai, diachi, donvihoc_id, vaitro_id, loaitaikhoan, tinhtrangcongtac, trangthai) VALUES
(9023, 'dinhthingocmai@st.tvu.edu.vn', '$2b$10$TESTHASHSV1300000000000000000000000000000000000000', 'Đinh Thị Ngọc Mai', '110118017', '2000-04-14', 'Nu', '0912345014', 'Ấp Trà Kháo, X. Hòa Ân, H. Cầu Kè', 902, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9024, 'vuvankien@st.tvu.edu.vn', '$2b$10$TESTHASHSV1400000000000000000000000000000000000000', 'Vũ Văn Kiên', '110118018', '2000-08-27', 'Nam', '0912345015', 'Ấp An Trại, X. An Phú Tân, H. Cầu Kè', 902, 4, 'Sinh vien', NULL, 'Hoat dong');

-- --- 2.5 Sinh viên vay vốn ("Cho vay") ---
INSERT INTO nguoidung (nguoidung_id, email, matkhau, hoten, masodinhdanh, ngaysinh, gioitinh, sodienthoai, diachi, donvihoc_id, vaitro_id, loaitaikhoan, tinhtrangcongtac, trangthai) VALUES
(9025, 'trinhthiyenNhi@st.tvu.edu.vn', '$2b$10$TESTHASHSV1500000000000000000000000000000000000000', 'Trịnh Thị Yến Nhi', '110119019', '2001-05-05', 'Nu', '0912345016', 'Ấp Cây Da, X. Long Sơn, H. Cầu Ngang', 901, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9026, 'hovanthinh@st.tvu.edu.vn', '$2b$10$TESTHASHSV1600000000000000000000000000000000000000', 'Hồ Văn Thịnh', '110118020', '2000-06-06', 'Nam', '0912345017', 'Ấp Rạch Bót, X. Định An, H. Trà Cú', 901, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9027, 'maithilanphuong@st.tvu.edu.vn', '$2b$10$TESTHASHSV1700000000000000000000000000000000000000', 'Mai Thị Lan Phương', '110118021', '2000-01-30', 'Nu', '0912345018', 'Ấp Chợ, X. Tập Sơn, H. Trà Cú', 901, 4, 'Sinh vien', NULL, 'Hoat dong');

-- --- 2.6 Danh nghĩa Tập thể / Đơn vị (người đại diện đứng tên) ---
INSERT INTO nguoidung (nguoidung_id, email, matkhau, hoten, masodinhdanh, ngaysinh, gioitinh, sodienthoai, diachi, donvihoc_id, vaitro_id, loaitaikhoan, tinhtrangcongtac, trangthai) VALUES
(9028, 'caovanduoc@st.tvu.edu.vn', '$2b$10$TESTHASHSV1800000000000000000000000000000000000000', 'Cao Văn Được', '110120022', '2002-02-02', 'Nam', '0912345019', 'Ấp Kinh Xáng, X. Lương Hòa A, H. Châu Thành', 901, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9029, 'nguyenthixuandao@st.tvu.edu.vn', '$2b$10$TESTHASHSV1900000000000000000000000000000000000000', 'Nguyễn Thị Xuân Đào', '110120023', '2002-03-03', 'Nu', '0912345020', 'Ấp Đầu Giồng, X. Song Lộc, H. Châu Thành', 901, 4, 'Sinh vien', NULL, 'Hoat dong');

-- --- 2.7 Cán bộ / Giảng viên (loaitaikhoan = 'Can bo') ---
INSERT INTO nguoidung (nguoidung_id, email, matkhau, hoten, masodinhdanh, ngaysinh, gioitinh, sodienthoai, diachi, donvihoc_id, vaitro_id, loaitaikhoan, tinhtrangcongtac, trangthai) VALUES
(9030, 'duongvantoan.cb@tvu.edu.vn', '$2b$10$TESTHASHCB0100000000000000000000000000000000000000', 'Dương Văn Toàn', 'CB01120', '1978-06-15', 'Nam', '0913456001', '34 Điện Biên Phủ, P.6, TP. Trà Vinh', NULL, 4, 'Can bo', 'Dang cong tac', 'Hoat dong'),
(9031, 'tranthibaochau.cb@tvu.edu.vn', '$2b$10$TESTHASHCB0200000000000000000000000000000000000000', 'Trần Thị Bảo Châu', 'CB00987', '1962-10-08', 'Nu', '0913456002', '56 Nguyễn Đáng, P.1, TP. Trà Vinh', NULL, 4, 'Can bo', 'Da nghi huu', 'Hoat dong');

-- --- 2.8 Nhà khoa học hợp tác ngoài trường (loaitaikhoan = 'Nha khoa hoc', tạo bởi Admin/Cán bộ Quỹ, KHÔNG tự đăng ký) ---
INSERT INTO nguoidung (nguoidung_id, email, matkhau, hoten, masodinhdanh, ngaysinh, gioitinh, sodienthoai, diachi, donvihoc_id, vaitro_id, loaitaikhoan, tinhtrangcongtac, trangthai) VALUES
(9032, 'nguyendinhkhai.nkh@gmail.com', '$2b$10$TESTHASHNKH0000000000000000000000000000000000000000', 'Nguyễn Đình Khải', 'NKH-0001', '1970-01-01', 'Nam', '0918888001', '12 Nguyễn Văn Cừ, Q.5, TP.HCM', NULL, 4, 'Nha khoa hoc', NULL, 'Hoat dong');

-- --- 2.9 Nhà tài trợ có tài khoản đăng nhập (loaitaikhoan = 'Nha tai tro') ---
INSERT INTO nguoidung (nguoidung_id, email, matkhau, hoten, masodinhdanh, ngaysinh, gioitinh, sodienthoai, diachi, donvihoc_id, vaitro_id, loaitaikhoan, tinhtrangcongtac, trangthai) VALUES
(9040, 'dangthithuha@gmail.com', '$2b$10$TESTHASHNTT0000000000000000000000000000000000000000', 'Đặng Thị Thu Hà', NULL, '1990-09-09', 'Nu', '0918888002', '89 Lê Thánh Tôn, Q.1, TP.HCM', NULL, 4, 'Nha tai tro', NULL, 'Hoat dong');

-- --- 2.10 Người dùng dùng để migrate từ Guest (support request + donation) ---
INSERT INTO nguoidung (nguoidung_id, email, matkhau, hoten, masodinhdanh, ngaysinh, gioitinh, sodienthoai, diachi, donvihoc_id, vaitro_id, loaitaikhoan, tinhtrangcongtac, trangthai) VALUES
(9033, 'tranvanduoc.guest@st.tvu.edu.vn', '$2b$10$TESTHASHGUEST0000000000000000000000000000000000000', 'Trần Văn Được', '110123024', '2005-03-19', 'Nam', '0912345021', 'Ấp Sóc Ruộng, X. Tân Mỹ, H. Trà Cú', 901, 4, 'Sinh vien', NULL, 'Hoat dong'),
(9041, 'lethikimcuong.guest@gmail.com', '$2b$10$TESTHASHGUESTNTT0000000000000000000000000000000000', 'Lê Thị Kim Cương', NULL, '1995-12-12', 'Nu', '0918888003', '23 Trần Hưng Đạo, TP. Cần Thơ', NULL, 4, 'Nha tai tro', NULL, 'Hoat dong');


-- =====================================================================
-- KHỐI 3 — LOẠI QUỸ, QUỸ, TÀI KHOẢN NGÂN HÀNG, ĐỢT GIẢI NGÂN
-- =====================================================================

INSERT INTO loaiquy (loaiquy_id, maloai, tenloai) VALUES
(901, 'HOCBONG_KK', 'Học bổng Khuyến học'),
(902, 'NCKH', 'Nghiên cứu Khoa học & Đổi mới sáng tạo'),
(903, 'VAYVON_KN', 'Vay vốn Khởi nghiệp Sinh viên');

INSERT INTO quy (quy_id, tenquy, loaiquy_id, mota, sotienmuctieu, sodu, sotienhotrotoida, soluonghotrotoida, dieukienhotro, ngaybatdau, ngayketthuc, trangthai, nguoitao_id, loaidieuhanh, quy_cha_id) VALUES
(901, 'Quỹ Học bổng Khuyến học TVU 2025-2026', 901, 'Hỗ trợ học bổng, trợ cấp khó khăn cho sinh viên có hoàn cảnh khó khăn, không hoàn lại.', 500000000.00, 180000000.00, 15000000.00, 40, 'Sinh viên có điểm trung bình từ 7.0 trở lên, hoàn cảnh gia đình khó khăn.', '2025-09-01', '2026-08-31', 'Dang hoat dong', 9003, 'Tap trung - Muc chi', NULL),
(902, 'Quỹ Nghiên cứu Khoa học & Đổi mới sáng tạo', 902, 'Tài trợ đề tài/dự án nghiên cứu khoa học, có thể có thu hồi một phần nếu thương mại hóa.', 800000000.00, 320000000.00, 60000000.00, 15, 'Đề tài có thuyết minh, có khả năng ứng dụng hoặc thương mại hóa.', '2025-09-01', '2026-12-31', 'Dang hoat dong', 9001, 'Tap trung - Muc chi', NULL),
(903, 'Quỹ Vay vốn Khởi nghiệp Sinh viên', 903, 'Cho sinh viên vay vốn khởi nghiệp, ứng dụng công nghệ, lãi suất ưu đãi tối đa 70% lãi suất ngân hàng.', 400000000.00, 210000000.00, 40000000.00, 10, 'Có kế hoạch kinh doanh/dự án khả thi, cam kết hoàn trả đúng hạn.', '2025-09-01', '2026-12-31', 'Dang hoat dong', 9001, 'Tap trung - Muc chi', NULL),
(904, 'Quỹ Phát triển Đại học Trà Vinh (Bể tiền lớn)', 901, 'Quỹ tổng, tập trung nguồn tài trợ trước khi phân bổ xuống các quỹ con.', 2000000000.00, 450000000.00, NULL, NULL, NULL, '2025-01-01', NULL, 'Dang hoat dong', 9001, 'Tap trung - Be chung', NULL),
(905, 'Quỹ Hỗ trợ Cán bộ - Giảng viên nghiên cứu', 902, 'Hỗ trợ cán bộ, giảng viên (kể cả đã nghỉ hưu có hợp đồng) thực hiện nhiệm vụ KHCN.', 300000000.00, 95000000.00, 30000000.00, 8, 'Cán bộ/giảng viên cơ hữu hoặc đã nghỉ hưu có hợp đồng lao động với ĐHTV.', '2025-09-01', '2026-12-31', 'Dang hoat dong', 9001, 'Tap trung - Muc chi', NULL);

INSERT INTO taikhoannganhang (taikhoannganhang_id, quy_id, loaitaikhoan, sotaikhoan, nganhang, chinhanh, chutaikhoan, trangthai) VALUES
(901, 901, 'Nha truong', '0071000901234', 'Vietcombank', 'Chi nhánh Trà Vinh', 'Quỹ Học bổng Khuyến học TVU', 'Hoat dong'),
(902, 902, 'Nha truong', '0071000905678', 'Vietcombank', 'Chi nhánh Trà Vinh', 'Quỹ Nghiên cứu Khoa học & Đổi mới sáng tạo', 'Hoat dong'),
(903, 903, 'Nha truong', '0071000909012', 'Vietcombank', 'Chi nhánh Trà Vinh', 'Quỹ Vay vốn Khởi nghiệp Sinh viên', 'Hoat dong');

INSERT INTO dotgiaingan (dot_id, quy_id, thutu, tendot, mota, sotiendukien, sotiendachi, ngaydukien, ngaythucte, trangthai) VALUES
(901, 901, 1, 'Đợt 1 - Học kỳ I 2025-2026', 'Giải ngân học bổng đầu năm học', 100000000.00, 65000000.00, '2025-10-15', '2025-10-15', 'hoanthanh'),
(902, 901, 2, 'Đợt 2 - Học kỳ II 2025-2026', 'Giải ngân học bổng học kỳ 2', 100000000.00, 0.00, '2026-03-15', NULL, 'dangchodutien'),
(903, 902, 1, 'Đợt 1 - Xét duyệt đề tài NCKH 2025', 'Giải ngân đề tài nghiên cứu đợt 1', 200000000.00, 120000000.00, '2025-11-01', '2025-11-05', 'hoanthanh'),
(904, 903, 1, 'Đợt 1 - Vay vốn khởi nghiệp 2025', 'Giải ngân vốn vay khởi nghiệp đợt 1', 150000000.00, 90000000.00, '2025-10-20', '2025-10-22', 'hoanthanh'),
(905, 905, 1, 'Đợt 1 - Hỗ trợ CB-GV NCKH 2025', 'Giải ngân hỗ trợ cán bộ nghiên cứu', 100000000.00, 40000000.00, '2025-11-10', '2025-11-12', 'hoanthanh');


-- =====================================================================
-- KHỐI 4 — NHÀ TÀI TRỢ (nhataitro)
-- =====================================================================
INSERT INTO nhataitro (nhataitro_id, tennhataitro, loainhataitro, email, sodienthoai, diachi, website, mota, nguoidung_id, trangthai) VALUES
(901, 'Đặng Thị Thu Hà', 'Ca nhan', 'dangthithuha@gmail.com', '0918888002', '89 Lê Thánh Tôn, Q.1, TP.HCM', NULL, 'Cựu sinh viên TVU, tài trợ định kỳ hàng năm.', 9040, 'Hoat dong'),
(902, 'Công ty TNHH Đầu tư Giáo dục Cửu Long', 'Doanh nghiep', 'contact@cuulong-edu.vn', '0292222222', '15 Nguyễn Thị Minh Khai, TP. Trà Vinh', 'https://cuulong-edu.vn', 'Doanh nghiệp đối tác đào tạo, tài trợ học bổng thường niên.', NULL, 'Hoat dong'),
(903, 'Hội Cựu sinh viên Đại học Trà Vinh', 'To chuc', 'hoicuusinhvien@tvu.edu.vn', '0292233445', 'Số 126 Nguyễn Thiện Thành, TP. Trà Vinh', NULL, 'Tổ chức cựu sinh viên, gây quỹ hỗ trợ khóa sau.', NULL, 'Hoat dong'),
(904, 'Nguyễn Thành Lộc', 'Doi tac', 'nguyenthanhloc.doanhnhan@gmail.com', '0909876543', '200 Ba Tháng Hai, Q.10, TP.HCM', NULL, 'Doanh nhân, đối tác chiến lược tài trợ dự án NCKH.', NULL, 'Hoat dong'),
(905, 'Quỹ Từ thiện Ánh Dương', 'To chuc', 'info@anhduong-charity.org', '0287778899', '50 Cách Mạng Tháng Tám, TP.HCM', 'https://anhduong-charity.org', 'Tổ chức từ thiện, khoản tài trợ bị từ chối do chứng từ không hợp lệ.', NULL, 'Hoat dong'),
(906, 'Lê Thị Kim Cương', 'Ca nhan', 'lethikimcuong.guest@gmail.com', '0918888003', '23 Trần Hưng Đạo, TP. Cần Thơ', NULL, 'Nhà tài trợ đăng ký qua luồng khách (guest), đã xác thực OTP.', 9041, 'Hoat dong');


-- =====================================================================
-- =====================================================================
-- PHẦN A — LUỒNG XIN TÀI TRỢ / YÊU CẦU HỖ TRỢ (yeucauhotro)
-- Mỗi kịch bản: 2 bản ghi, kèm pheduyet / giaodich / dieukhoanthuhoi /
--               hopdongvayvon / lichtrano / nghiemthu tương ứng.
-- =====================================================================
-- =====================================================================


-- ---------------------------------------------------------------------
-- KỊCH BẢN A1 — Tài trợ không hoàn lại, hoàn tất đầy đủ (học bổng đơn giản,
--                KHÔNG cần nghiệm thu — canghiemthu = 0)
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90001, 9010, 901, 'Ca nhan', NULL, 901, 'Gia đình thuộc hộ cận nghèo, cha mất sớm, mẹ làm nông không đủ trang trải học phí học kỳ I năm học 2025-2026.', 10000000.00, '["/uploads/documents/ho-can-ngheo-90001.pdf"]', 'Da giai ngan', 'Hồ sơ đầy đủ, đúng đối tượng.', '2025-09-20 08:30:00', 'Tai tro khong hoan lai', 0, NULL),
(90002, 9011, 901, 'Ca nhan', NULL, 901, 'Sinh viên mồ côi cha lẫn mẹ, sống cùng bà ngoại, cần hỗ trợ chi phí sinh hoạt và học tập.', 12000000.00, '["/uploads/documents/mo-coi-90002.pdf"]', 'Da giai ngan', 'Đã xác minh qua địa phương.', '2025-09-21 09:15:00', 'Tai tro khong hoan lai', 0, NULL);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90001, 1, 9003, 'Duyet', NULL, 'Hồ sơ hợp lệ, đủ điều kiện cấp 1.', '2025-09-22 10:00:00'),
(90001, 2, 9001, 'Duyet', NULL, 'Đồng ý mức hỗ trợ đề nghị.', '2025-09-24 14:00:00'),
(90001, 3, 9002, 'Duyet', NULL, 'Đủ số dư, tiến hành giải ngân.', '2025-09-26 09:00:00'),
(90002, 1, 9003, 'Duyet', NULL, 'Hồ sơ hợp lệ, đủ điều kiện cấp 1.', '2025-09-23 10:00:00'),
(90002, 2, 9001, 'Duyet', NULL, 'Đồng ý mức hỗ trợ đề nghị.', '2025-09-25 14:00:00'),
(90002, 3, 9002, 'Duyet', NULL, 'Đủ số dư, tiến hành giải ngân.', '2025-09-27 09:00:00');

INSERT INTO giaodich (giaodich_id, yeucauhotro_id, quy_id, loaigiaodich, hangmucchi, nguoinhan_id, sotien, hinhthuc, magiaodich, trangthai, nguoithuchien_id, ngaygiaodich) VALUES
(101, 90001, 901, 'Chi', 'Tai_tro_cho_vay', 9010, 10000000.00, 'Chuyen khoan', 'GD-HB-90001', 'Thanh cong', 9002, '2025-09-27 10:00:00'),
(102, 90002, 901, 'Chi', 'Tai_tro_cho_vay', 9011, 12000000.00, 'Chuyen khoan', 'GD-HB-90002', 'Thanh cong', 9002, '2025-09-28 10:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN A2 — Tài trợ không hoàn lại CHO DỰ ÁN NGHIÊN CỨU (canghiemthu = 1),
--                đã giải ngân + đã nghiệm thu ĐẠT
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90003, 9021, 902, 'Ca nhan', NULL, 903, 'Đề tài "Ứng dụng IoT giám sát chất lượng nước ao nuôi tôm tại Trà Vinh" — nghiên cứu ứng dụng phục vụ đào tạo.', 45000000.00, '["/uploads/documents/thuyet-minh-de-tai-90003.pdf"]', 'Da nghiem thu', 'Đề tài đào tạo, không thu hồi kinh phí.', '2025-10-01 08:00:00', 'Tai tro khong hoan lai', 1, 45000000.00),
(90004, 9022, 902, 'Ca nhan', NULL, 903, 'Đề tài "Xây dựng mô hình dự báo sạt lở bờ sông bằng học máy" — nghiên cứu triển khai phục vụ giảng dạy.', 50000000.00, '["/uploads/documents/thuyet-minh-de-tai-90004.pdf"]', 'Da nghiem thu', 'Đề tài đào tạo, không thu hồi kinh phí.', '2025-10-02 08:00:00', 'Tai tro khong hoan lai', 1, 50000000.00);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90003, 1, 9003, 'Duyet', NULL, 'Thuyết minh đạt yêu cầu.', '2025-10-03 10:00:00'),
(90003, 2, 9001, 'Duyet', NULL, 'Phù hợp định hướng KHCN của trường.', '2025-10-05 14:00:00'),
(90003, 3, 9002, 'Duyet', NULL, 'Đủ số dư quỹ NCKH.', '2025-10-08 09:00:00'),
(90004, 1, 9003, 'Duyet', NULL, 'Thuyết minh đạt yêu cầu.', '2025-10-04 10:00:00'),
(90004, 2, 9001, 'Duyet', NULL, 'Phù hợp định hướng KHCN của trường.', '2025-10-06 14:00:00'),
(90004, 3, 9002, 'Duyet', NULL, 'Đủ số dư quỹ NCKH.', '2025-10-09 09:00:00');

INSERT INTO giaodich (giaodich_id, yeucauhotro_id, quy_id, loaigiaodich, hangmucchi, nguoinhan_id, sotien, hinhthuc, magiaodich, trangthai, nguoithuchien_id, ngaygiaodich) VALUES
(103, 90003, 902, 'Chi', 'Tai_tro_cho_vay', 9021, 45000000.00, 'Chuyen khoan', 'GD-NCKH-90003', 'Thanh cong', 9002, '2025-10-09 10:00:00'),
(104, 90004, 902, 'Chi', 'Tai_tro_cho_vay', 9022, 50000000.00, 'Chuyen khoan', 'GD-NCKH-90004', 'Thanh cong', 9002, '2025-10-10 10:00:00');

INSERT INTO nghiemthu (yeucauhotro_id, lanthu, loaikiemtra, ketqua, soquyetdinh, nguoinghiemthu_id, nhanxet, ngaynghiemthu) VALUES
(90003, 1, 'Kiem tra tien do', 'Dat', NULL, 9004, 'Tiến độ đúng kế hoạch, đã thu thập đủ dữ liệu thực địa.', '2025-12-15 09:00:00'),
(90003, 2, 'Nghiem thu cuoi cung', 'Dat', 'QD-NT-90003/2026', 9004, 'Sản phẩm đạt yêu cầu, có bài báo khoa học kèm theo.', '2026-05-20 09:00:00'),
(90004, 1, 'Kiem tra tien do', 'Dat co dieu chinh', NULL, 9004, 'Cần bổ sung tập dữ liệu huấn luyện mô hình.', '2025-12-18 09:00:00'),
(90004, 2, 'Nghiem thu cuoi cung', 'Dat', 'QD-NT-90004/2026', 9004, 'Đã bổ sung đầy đủ, mô hình đạt độ chính xác yêu cầu.', '2026-06-10 09:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN A3 — Bị TỪ CHỐI ở CẤP 1
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90005, 9016, 901, 'Ca nhan', NULL, 902, 'Xin hỗ trợ chi phí mua laptop phục vụ học tập.', 15000000.00, '["/uploads/documents/don-90005.pdf"]', 'Tu choi cap 1', NULL, '2026-02-10 08:00:00', 'Tai tro khong hoan lai', 0, NULL),
(90006, 9017, 901, 'Ca nhan', NULL, 902, 'Xin hỗ trợ chi phí đi lại thực tập xa nhà.', 8000000.00, '["/uploads/documents/don-90006.pdf"]', 'Tu choi cap 1', NULL, '2026-02-11 08:00:00', 'Tai tro khong hoan lai', 0, NULL);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90005, 1, 9003, 'Tu choi', 'Hồ sơ không có xác nhận hoàn cảnh gia đình từ địa phương theo quy định, không đúng đối tượng học bổng khuyến khích.', NULL, '2026-02-12 10:00:00'),
(90006, 1, 9003, 'Tu choi', 'Nội dung xin hỗ trợ không thuộc phạm vi Điều kiện hỗ trợ của quỹ Học bổng Khuyến học (chi phí đi lại thực tập không nằm trong danh mục được hỗ trợ).', NULL, '2026-02-13 10:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN A4 — Bị TỪ CHỐI ở CẤP 2
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90007, 9018, 901, 'Ca nhan', NULL, 902, 'Gia đình khó khăn do thiên tai, xin hỗ trợ khẩn cấp học phí học kỳ II.', 20000000.00, '["/uploads/documents/don-90007.pdf"]', 'Tu choi cap 2', NULL, '2026-02-15 08:00:00', 'Tai tro khong hoan lai', 0, NULL),
(90008, 9019, 901, 'Ca nhan', NULL, 902, 'Cha bị tai nạn lao động, xin hỗ trợ chi phí học tập học kỳ II.', 18000000.00, '["/uploads/documents/don-90008.pdf"]', 'Tu choi cap 2', NULL, '2026-02-16 08:00:00', 'Tai tro khong hoan lai', 0, NULL);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90007, 1, 9003, 'Duyet', NULL, 'Hồ sơ hợp lệ, chuyển cấp 2.', '2026-02-17 10:00:00'),
(90007, 2, 9001, 'Tu choi', 'Mức đề nghị vượt quá sotienhotrotoida của quỹ (15.000.000đ/lần); đề nghị sinh viên nộp lại với mức phù hợp.', NULL, '2026-02-19 14:00:00'),
(90008, 1, 9003, 'Duyet', NULL, 'Hồ sơ hợp lệ, chuyển cấp 2.', '2026-02-18 10:00:00'),
(90008, 2, 9001, 'Tu choi', 'Đã nhận hỗ trợ 1 lần trong năm học, vượt quá soluonghotrotoida cho phép của quỹ.', NULL, '2026-02-20 14:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN A5 — Bị TỪ CHỐI ở CẤP 3 (Kế toán từ chối giải ngân)
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90009, 9010, 902, 'Ca nhan', NULL, 903, 'Đề xuất hỗ trợ mua thiết bị thí nghiệm bổ sung cho đề tài đã đăng ký.', 30000000.00, '["/uploads/documents/don-90009.pdf"]', 'Tu choi cap 3', NULL, '2026-03-01 08:00:00', 'Tai tro khong hoan lai', 1, 30000000.00),
(90010, 9011, 902, 'Ca nhan', NULL, 903, 'Đề xuất hỗ trợ khảo sát thực địa bổ sung ngoài kế hoạch ban đầu.', 22000000.00, '["/uploads/documents/don-90010.pdf"]', 'Tu choi cap 3', NULL, '2026-03-02 08:00:00', 'Tai tro khong hoan lai', 1, 22000000.00);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90009, 1, 9003, 'Duyet', NULL, NULL, '2026-03-03 10:00:00'),
(90009, 2, 9001, 'Duyet', NULL, NULL, '2026-03-05 14:00:00'),
(90009, 3, 9002, 'Tu choi', 'Chứng từ đề nghị thanh toán không khớp với báo giá thiết bị đính kèm, cần bổ sung lại hồ sơ.', NULL, '2026-03-07 09:00:00'),
(90010, 1, 9003, 'Duyet', NULL, NULL, '2026-03-04 10:00:00'),
(90010, 2, 9001, 'Duyet', NULL, NULL, '2026-03-06 14:00:00'),
(90010, 3, 9002, 'Tu choi', 'Kế hoạch khảo sát bổ sung không nằm trong thuyết minh đề tài đã được phê duyệt ban đầu.', NULL, '2026-03-08 09:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN A6 — MỚI NỘP, đang CHỜ DUYỆT CẤP 1
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90011, 9012, 901, 'Ca nhan', NULL, 902, 'Xin hỗ trợ chi phí sinh hoạt do gia đình vừa gặp hỏa hoạn.', 14000000.00, '["/uploads/documents/don-90011.pdf"]', 'Cho duyet cap 1', NULL, '2026-07-10 08:00:00', 'Tai tro khong hoan lai', 0, NULL),
(90012, 9013, 901, 'Ca nhan', NULL, 902, 'Xin hỗ trợ học phí học kỳ II do mẹ vừa qua đời.', 16000000.00, '["/uploads/documents/don-90012.pdf"]', 'Cho duyet cap 1', NULL, '2026-07-12 08:00:00', 'Tai tro khong hoan lai', 0, NULL);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90011, 1, NULL, 'Cho duyet', NULL, NULL, '2026-07-10 08:00:00'),
(90012, 1, NULL, 'Cho duyet', NULL, NULL, '2026-07-12 08:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN A7 — Đã duyệt ĐỦ 3 CẤP nhưng QUỸ THIẾU TIỀN
--                (trạng thái "Cho giai ngan", chờ bổ sung số dư)
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90013, 9014, 903, 'Ca nhan', NULL, 904, 'Xin vay vốn mở rộng mô hình bán hàng online, quỹ tạm thời không đủ số dư khả dụng.', 40000000.00, '["/uploads/documents/don-90013.pdf"]', 'Cho giai ngan', 'Chờ quỹ bổ sung tài trợ.', '2026-06-01 08:00:00', 'Cho vay', 0, NULL),
(90014, 9015, 903, 'Ca nhan', NULL, 904, 'Xin vay vốn đầu tư máy móc xưởng in ấn nhỏ, quỹ tạm thời không đủ số dư khả dụng.', 38000000.00, '["/uploads/documents/don-90014.pdf"]', 'Cho giai ngan', 'Chờ quỹ bổ sung tài trợ.', '2026-06-02 08:00:00', 'Cho vay', 0, NULL);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90013, 1, 9003, 'Duyet', NULL, NULL, '2026-06-03 10:00:00'),
(90013, 2, 9001, 'Duyet', NULL, NULL, '2026-06-05 14:00:00'),
(90013, 3, 9002, 'Cho duyet', NULL, 'Số dư khả dụng của quỹ không đủ, tạm giữ chờ bổ sung.', '2026-06-07 09:00:00'),
(90014, 1, 9003, 'Duyet', NULL, NULL, '2026-06-04 10:00:00'),
(90014, 2, 9001, 'Duyet', NULL, NULL, '2026-06-06 14:00:00'),
(90014, 3, 9002, 'Cho duyet', NULL, 'Số dư khả dụng của quỹ không đủ, tạm giữ chờ bổ sung.', '2026-06-08 09:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN A8 — Tài trợ CÓ THU HỒI, đã giải ngân, đang CHỜ NGHIỆM THU
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90015, 9023, 902, 'Ca nhan', NULL, 903, 'Dự án "Nghiên cứu quy trình sản xuất chả cá thát lát ứng dụng công nghệ sấy lạnh" — có khả năng thương mại hóa.', 60000000.00, '["/uploads/documents/du-an-90015.pdf"]', 'Cho nghiem thu', 'Đã giải ngân, đang triển khai.', '2025-10-15 08:00:00', 'Tai tro co thu hoi', 1, 200000000.00),
(90016, 9024, 902, 'Ca nhan', NULL, 903, 'Dự án "Chuyển giao công nghệ ép dầu dừa tinh khiết quy mô nhỏ" — có khả năng thương mại hóa.', 55000000.00, '["/uploads/documents/du-an-90016.pdf"]', 'Cho nghiem thu', 'Đã giải ngân, đang triển khai.', '2025-10-16 08:00:00', 'Tai tro co thu hoi', 1, 190000000.00);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90015, 1, 9003, 'Duyet', NULL, NULL, '2025-10-17 10:00:00'),
(90015, 2, 9001, 'Duyet', NULL, 'Mức thu hồi 30.000.000đ (~15% tổng kinh phí 200.000.000đ) — trong hạn mức 30% theo Điều 15 Điều lệ.', '2025-10-19 14:00:00'),
(90015, 3, 9002, 'Duyet', NULL, NULL, '2025-10-22 09:00:00'),
(90016, 1, 9003, 'Duyet', NULL, NULL, '2025-10-18 10:00:00'),
(90016, 2, 9001, 'Duyet', NULL, 'Mức thu hồi 28.500.000đ (~15% tổng kinh phí 190.000.000đ) — trong hạn mức 30%.', '2025-10-20 14:00:00'),
(90016, 3, 9002, 'Duyet', NULL, NULL, '2025-10-23 09:00:00');

INSERT INTO giaodich (giaodich_id, yeucauhotro_id, quy_id, loaigiaodich, hangmucchi, nguoinhan_id, sotien, hinhthuc, magiaodich, trangthai, nguoithuchien_id, ngaygiaodich) VALUES
(105, 90015, 902, 'Chi', 'Tai_tro_cho_vay', 9023, 60000000.00, 'Chuyen khoan', 'GD-THUHOI-90015', 'Thanh cong', 9002, '2025-10-23 10:00:00'),
(106, 90016, 902, 'Chi', 'Tai_tro_cho_vay', 9024, 55000000.00, 'Chuyen khoan', 'GD-THUHOI-90016', 'Thanh cong', 9002, '2025-10-24 10:00:00');

-- Điều khoản thu hồi (mức thu hồi ≤ 30% tổng kinh phí dự án — KHÔNG có lãi suất,
-- theo đúng Điều 15.1 Điều lệ; cột `laisuat` để NULL — xem lưu ý mục 1.5 đã trao đổi trước đó)
INSERT INTO dieukhoanthuhoi (yeucauhotro_id, mucthuhoi, laisuat, thoihanhoantra_thang, soquyetdinh_hopdong, filehopdong) VALUES
(90015, 30000000.00, NULL, 24, 'QD-THUHOI-90015/2025', '/uploads/documents/hopdong-thuhoi-90015.pdf'),
(90016, 28500000.00, NULL, 24, 'QD-THUHOI-90016/2025', '/uploads/documents/hopdong-thuhoi-90016.pdf');

-- Nghiệm thu cấp 1 (kiểm tra tiến độ) đã thực hiện, chờ nghiệm thu cuối cùng
INSERT INTO nghiemthu (yeucauhotro_id, lanthu, loaikiemtra, ketqua, soquyetdinh, nguoinghiemthu_id, nhanxet, ngaynghiemthu) VALUES
(90015, 1, 'Kiem tra tien do', 'Dat', NULL, 9004, 'Quy trình sấy lạnh đã hoàn thiện 70%, đúng tiến độ.', '2026-04-10 09:00:00'),
(90016, 1, 'Kiem tra tien do', 'Dat', NULL, 9004, 'Đã ký hợp đồng thử nghiệm với 2 cơ sở sản xuất, đúng tiến độ.', '2026-04-12 09:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN A9 — Tài trợ CÓ THU HỒI, NGHIỆM THU KHÔNG ĐẠT
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90017, 9010, 902, 'Ca nhan', NULL, 903, 'Dự án "Sản xuất thử nghiệm phân hữu cơ vi sinh từ phụ phẩm nông nghiệp" — có khả năng thương mại hóa.', 48000000.00, '["/uploads/documents/du-an-90017.pdf"]', 'Nghiem thu khong dat', 'Dừng giải ngân đợt tiếp theo do nghiệm thu không đạt.', '2025-09-05 08:00:00', 'Tai tro co thu hoi', 1, 160000000.00),
(90018, 9011, 902, 'Ca nhan', NULL, 903, 'Dự án "Ứng dụng máy học phân loại trái cây theo chất lượng" — có khả năng thương mại hóa.', 52000000.00, '["/uploads/documents/du-an-90018.pdf"]', 'Nghiem thu khong dat', 'Dừng giải ngân đợt tiếp theo do nghiệm thu không đạt.', '2025-09-06 08:00:00', 'Tai tro co thu hoi', 1, 175000000.00);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90017, 1, 9003, 'Duyet', NULL, NULL, '2025-09-08 10:00:00'),
(90017, 2, 9001, 'Duyet', NULL, 'Mức thu hồi 24.000.000đ (15% kinh phí), đúng hạn mức.', '2025-09-10 14:00:00'),
(90017, 3, 9002, 'Duyet', NULL, NULL, '2025-09-12 09:00:00'),
(90018, 1, 9003, 'Duyet', NULL, NULL, '2025-09-09 10:00:00'),
(90018, 2, 9001, 'Duyet', NULL, 'Mức thu hồi 26.250.000đ (15% kinh phí), đúng hạn mức.', '2025-09-11 14:00:00'),
(90018, 3, 9002, 'Duyet', NULL, NULL, '2025-09-13 09:00:00');

INSERT INTO giaodich (giaodich_id, yeucauhotro_id, quy_id, loaigiaodich, hangmucchi, nguoinhan_id, sotien, hinhthuc, magiaodich, trangthai, nguoithuchien_id, ngaygiaodich) VALUES
(107, 90017, 902, 'Chi', 'Tai_tro_cho_vay', 9010, 48000000.00, 'Chuyen khoan', 'GD-THUHOI-90017', 'Thanh cong', 9002, '2025-09-13 10:00:00'),
(108, 90018, 902, 'Chi', 'Tai_tro_cho_vay', 9011, 52000000.00, 'Chuyen khoan', 'GD-THUHOI-90018', 'Thanh cong', 9002, '2025-09-14 10:00:00');

INSERT INTO dieukhoanthuhoi (yeucauhotro_id, mucthuhoi, laisuat, thoihanhoantra_thang, soquyetdinh_hopdong, filehopdong) VALUES
(90017, 24000000.00, NULL, 18, 'QD-THUHOI-90017/2025', '/uploads/documents/hopdong-thuhoi-90017.pdf'),
(90018, 26250000.00, NULL, 18, 'QD-THUHOI-90018/2025', '/uploads/documents/hopdong-thuhoi-90018.pdf');

INSERT INTO nghiemthu (yeucauhotro_id, lanthu, loaikiemtra, ketqua, soquyetdinh, nguoinghiemthu_id, nhanxet, ngaynghiemthu) VALUES
(90017, 1, 'Kiem tra tien do', 'Khong dat', NULL, 9004, 'Sản phẩm phân vi sinh không đạt chỉ tiêu hàm lượng dinh dưỡng đăng ký, chưa thể tiếp tục thử nghiệm mở rộng.', '2026-01-20 09:00:00'),
(90018, 1, 'Kiem tra tien do', 'Khong dat', NULL, 9004, 'Mô hình máy học có độ chính xác dưới 50%, không đạt yêu cầu tối thiểu đề ra trong thuyết minh.', '2026-01-22 09:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN A10 — CHO VAY, hợp đồng đang thực hiện, TRẢ NỢ ĐÚNG HẠN
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90019, 9025, 903, 'Ca nhan', NULL, 904, 'Vay vốn mở rộng xưởng may gia công đồng phục học sinh, quy mô nhỏ tại địa phương.', 35000000.00, '["/uploads/documents/vay-90019.pdf"]', 'Da giai ngan', 'Đang trả nợ đúng hạn.', '2025-09-10 08:00:00', 'Cho vay', 1, 35000000.00),
(90020, 9026, 903, 'Ca nhan', NULL, 904, 'Vay vốn đầu tư dây chuyền rang xay cà phê nguyên chất quy mô hộ gia đình.', 40000000.00, '["/uploads/documents/vay-90020.pdf"]', 'Da giai ngan', 'Đang trả nợ đúng hạn.', '2025-09-11 08:00:00', 'Cho vay', 1, 40000000.00);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90019, 1, 9003, 'Duyet', NULL, NULL, '2025-09-12 10:00:00'),
(90019, 2, 9001, 'Duyet', NULL, 'Lãi suất đề nghị 4.5%/năm, thấp hơn 70% lãi suất ngân hàng tham chiếu (7.5% x 70% = 5.25%).', '2025-09-14 14:00:00'),
(90019, 3, 9002, 'Duyet', NULL, NULL, '2025-09-16 09:00:00'),
(90020, 1, 9003, 'Duyet', NULL, NULL, '2025-09-13 10:00:00'),
(90020, 2, 9001, 'Duyet', NULL, 'Lãi suất đề nghị 5.0%/năm, trong hạn mức 70% lãi suất ngân hàng tham chiếu.', '2025-09-15 14:00:00'),
(90020, 3, 9002, 'Duyet', NULL, NULL, '2025-09-17 09:00:00');

INSERT INTO giaodich (giaodich_id, yeucauhotro_id, quy_id, loaigiaodich, hangmucchi, nguoinhan_id, sotien, hinhthuc, magiaodich, trangthai, nguoithuchien_id, ngaygiaodich) VALUES
(109, 90019, 903, 'Chi', 'Tai_tro_cho_vay', 9025, 35000000.00, 'Chuyen khoan', 'GD-VAY-90019', 'Thanh cong', 9002, '2025-09-17 10:00:00'),
(110, 90020, 903, 'Chi', 'Tai_tro_cho_vay', 9026, 40000000.00, 'Chuyen khoan', 'GD-VAY-90020', 'Thanh cong', 9002, '2025-09-18 10:00:00');

INSERT INTO hopdongvayvon (hopdongvayvon_id, yeucauhotro_id, sotienvon, laisuatphantram, ngaykyhopdong, kyhandothang, ngaydaohan, trangthai, filehopdong, nguoiduyet_id, ghichu) VALUES
(9019, 90019, 35000000.00, 4.50, '2025-09-17', 12, '2026-09-17', 'Dang thuc hien', '/uploads/documents/hopdong-vay-90019.pdf', 9001, 'Trả góp hàng tháng, đã trả 4/12 kỳ đúng hạn.'),
(9020, 90020, 40000000.00, 5.00, '2025-09-18', 12, '2026-09-18', 'Dang thuc hien', '/uploads/documents/hopdong-vay-90020.pdf', 9001, 'Trả góp hàng tháng, đã trả 4/12 kỳ đúng hạn.');

INSERT INTO lichtrano (hopdongvayvon_id, kythu, ngaydenhan, sotiengocphaitra, sotienlaiphaitra, ngaythuctra, sotienthuctra, trangthai) VALUES
(9019, 1, '2025-10-17', 2916666.67, 131250.00, '2025-10-17', 3047916.67, 'Da tra'),
(9019, 2, '2025-11-17', 2916666.67, 120468.75, '2025-11-17', 3037135.42, 'Da tra'),
(9019, 3, '2025-12-17', 2916666.67, 109687.50, '2025-12-17', 3026354.17, 'Da tra'),
(9019, 4, '2026-01-17', 2916666.67, 98906.25, '2026-01-17', 3015572.92, 'Da tra'),
(9019, 5, '2026-02-17', 2916666.67, 88125.00, NULL, NULL, 'Chua den han'),
(9020, 1, '2025-10-18', 3333333.33, 166666.67, '2025-10-18', 3500000.00, 'Da tra'),
(9020, 2, '2025-11-18', 3333333.33, 152777.78, '2025-11-18', 3486111.11, 'Da tra'),
(9020, 3, '2025-12-18', 3333333.33, 138888.89, '2025-12-18', 3472222.22, 'Da tra'),
(9020, 4, '2026-01-18', 3333333.33, 125000.00, '2026-01-18', 3458333.33, 'Da tra'),
(9020, 5, '2026-02-18', 3333333.33, 111111.11, NULL, NULL, 'Chua den han');

INSERT INTO nghiemthu (yeucauhotro_id, lanthu, loaikiemtra, ketqua, soquyetdinh, nguoinghiemthu_id, nhanxet, ngaynghiemthu) VALUES
(90019, 1, 'Kiem tra tien do', 'Dat', NULL, 9004, 'Xưởng đã đi vào hoạt động, có đơn hàng ổn định.', '2026-01-15 09:00:00'),
(90020, 1, 'Kiem tra tien do', 'Dat', NULL, 9004, 'Dây chuyền đã lắp đặt xong, đang vận hành thử.', '2026-01-16 09:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN A11 — CHO VAY, hợp đồng đã TẤT TOÁN (trả đủ toàn bộ các kỳ)
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90021, 9027, 903, 'Ca nhan', NULL, NULL, 'Vay vốn kinh doanh tạp hóa nhỏ phục vụ sinh viên trong ký túc xá — đã hoàn tất chu kỳ vay đầu tiên.', 20000000.00, '["/uploads/documents/vay-90021.pdf"]', 'Da giai ngan', 'Hợp đồng đã tất toán đúng hạn.', '2024-10-01 08:00:00', 'Cho vay', 0, 20000000.00),
(90022, 9010, 903, 'Ca nhan', NULL, NULL, 'Vay vốn mua xe máy điện phục vụ dịch vụ giao hàng bán thời gian — đã hoàn tất chu kỳ vay.', 18000000.00, '["/uploads/documents/vay-90022.pdf"]', 'Da giai ngan', 'Hợp đồng đã tất toán đúng hạn.', '2024-10-05 08:00:00', 'Cho vay', 0, 18000000.00);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90021, 1, 9003, 'Duyet', NULL, NULL, '2024-10-03 10:00:00'),
(90021, 2, 9001, 'Duyet', NULL, 'Lãi suất 4.0%/năm.', '2024-10-05 14:00:00'),
(90021, 3, 9002, 'Duyet', NULL, NULL, '2024-10-07 09:00:00'),
(90022, 1, 9003, 'Duyet', NULL, NULL, '2024-10-07 10:00:00'),
(90022, 2, 9001, 'Duyet', NULL, 'Lãi suất 4.2%/năm.', '2024-10-09 14:00:00'),
(90022, 3, 9002, 'Duyet', NULL, NULL, '2024-10-11 09:00:00');

INSERT INTO giaodich (giaodich_id, yeucauhotro_id, quy_id, loaigiaodich, hangmucchi, nguoinhan_id, sotien, hinhthuc, magiaodich, trangthai, nguoithuchien_id, ngaygiaodich) VALUES
(111, 90021, 903, 'Chi', 'Tai_tro_cho_vay', 9027, 20000000.00, 'Chuyen khoan', 'GD-VAY-90021', 'Thanh cong', 9002, '2024-10-07 10:00:00'),
(112, 90022, 903, 'Chi', 'Tai_tro_cho_vay', 9010, 18000000.00, 'Chuyen khoan', 'GD-VAY-90022', 'Thanh cong', 9002, '2024-10-11 10:00:00'),
(113, 90021, 903, 'Thu hoi no', NULL, NULL, 21100000.00, 'Chuyen khoan', 'GD-THUHOI-VAY-90021', 'Thanh cong', 9002, '2025-10-07 10:00:00'),
(114, 90022, 903, 'Thu hoi no', NULL, NULL, 19080000.00, 'Chuyen khoan', 'GD-THUHOI-VAY-90022', 'Thanh cong', 9002, '2025-10-11 10:00:00');

INSERT INTO hopdongvayvon (hopdongvayvon_id, yeucauhotro_id, sotienvon, laisuatphantram, ngaykyhopdong, kyhandothang, ngaydaohan, trangthai, filehopdong, nguoiduyet_id, ghichu) VALUES
(9021, 90021, 20000000.00, 4.00, '2024-10-07', 12, '2025-10-07', 'Da tat toan', '/uploads/documents/hopdong-vay-90021.pdf', 9001, 'Đã trả đủ 12/12 kỳ, tất toán đúng hạn.'),
(9022, 90022, 18000000.00, 4.20, '2024-10-11', 12, '2025-10-11', 'Da tat toan', '/uploads/documents/hopdong-vay-90022.pdf', 9001, 'Đã trả đủ 12/12 kỳ, tất toán đúng hạn.');

-- (Chỉ chèn mẫu kỳ đầu + kỳ cuối để minh họa — thực tế đủ 12 kỳ 'Da tra')
INSERT INTO lichtrano (hopdongvayvon_id, kythu, ngaydenhan, sotiengocphaitra, sotienlaiphaitra, ngaythuctra, sotienthuctra, trangthai) VALUES
(9021, 1, '2024-11-07', 1666666.67, 66666.67, '2024-11-07', 1733333.34, 'Da tra'),
(9021, 12, '2025-10-07', 1666666.67, 5555.56, '2025-10-07', 1672222.23, 'Da tra'),
(9022, 1, '2024-11-11', 1500000.00, 63000.00, '2024-11-11', 1563000.00, 'Da tra'),
(9022, 12, '2025-10-11', 1500000.00, 5250.00, '2025-10-11', 1505250.00, 'Da tra');


-- ---------------------------------------------------------------------
-- KỊCH BẢN A12 — CHO VAY, QUÁ HẠN trả nợ
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90023, 9011, 903, 'Ca nhan', NULL, NULL, 'Vay vốn kinh doanh quán nước giải khát trước cổng trường — hiện đang chậm trả 2 kỳ liên tiếp.', 25000000.00, '["/uploads/documents/vay-90023.pdf"]', 'Da giai ngan', 'Đang quá hạn, đã nhắc nhở qua điện thoại.', '2025-08-01 08:00:00', 'Cho vay', 0, 25000000.00),
(90024, 9012, 903, 'Ca nhan', NULL, NULL, 'Vay vốn mua máy in phục vụ dịch vụ photocopy sinh viên — hiện đang chậm trả 1 kỳ.', 22000000.00, '["/uploads/documents/vay-90024.pdf"]', 'Da giai ngan', 'Đang quá hạn, đã gửi thông báo chính thức.', '2025-08-05 08:00:00', 'Cho vay', 0, 22000000.00);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90023, 1, 9003, 'Duyet', NULL, NULL, '2025-08-03 10:00:00'),
(90023, 2, 9001, 'Duyet', NULL, 'Lãi suất 5.2%/năm.', '2025-08-05 14:00:00'),
(90023, 3, 9002, 'Duyet', NULL, NULL, '2025-08-07 09:00:00'),
(90024, 1, 9003, 'Duyet', NULL, NULL, '2025-08-07 10:00:00'),
(90024, 2, 9001, 'Duyet', NULL, 'Lãi suất 5.0%/năm.', '2025-08-09 14:00:00'),
(90024, 3, 9002, 'Duyet', NULL, NULL, '2025-08-11 09:00:00');

INSERT INTO giaodich (giaodich_id, yeucauhotro_id, quy_id, loaigiaodich, hangmucchi, nguoinhan_id, sotien, hinhthuc, magiaodich, trangthai, nguoithuchien_id, ngaygiaodich) VALUES
(115, 90023, 903, 'Chi', 'Tai_tro_cho_vay', 9011, 25000000.00, 'Chuyen khoan', 'GD-VAY-90023', 'Thanh cong', 9002, '2025-08-07 10:00:00'),
(116, 90024, 903, 'Chi', 'Tai_tro_cho_vay', 9012, 22000000.00, 'Chuyen khoan', 'GD-VAY-90024', 'Thanh cong', 9002, '2025-08-11 10:00:00');

INSERT INTO hopdongvayvon (hopdongvayvon_id, yeucauhotro_id, sotienvon, laisuatphantram, ngaykyhopdong, kyhandothang, ngaydaohan, trangthai, filehopdong, nguoiduyet_id, ghichu) VALUES
(9023, 90023, 25000000.00, 5.20, '2025-08-07', 12, '2026-08-07', 'Qua han', '/uploads/documents/hopdong-vay-90023.pdf', 9001, 'Chậm trả kỳ 4, 5 — đang trong quy trình nhắc nợ.'),
(9024, 90024, 22000000.00, 5.00, '2025-08-11', 12, '2026-08-11', 'Qua han', '/uploads/documents/hopdong-vay-90024.pdf', 9001, 'Chậm trả kỳ 5 — đã gửi thông báo chính thức.');

INSERT INTO lichtrano (hopdongvayvon_id, kythu, ngaydenhan, sotiengocphaitra, sotienlaiphaitra, ngaythuctra, sotienthuctra, trangthai) VALUES
(9023, 1, '2025-09-07', 2083333.33, 108333.33, '2025-09-07', 2191666.66, 'Da tra'),
(9023, 2, '2025-10-07', 2083333.33, 99444.44, '2025-10-07', 2182777.77, 'Da tra'),
(9023, 3, '2025-11-07', 2083333.33, 90555.56, '2025-11-07', 2173888.89, 'Da tra'),
(9023, 4, '2025-12-07', 2083333.33, 81666.67, NULL, NULL, 'Qua han'),
(9023, 5, '2026-01-07', 2083333.33, 72777.78, NULL, NULL, 'Qua han'),
(9024, 1, '2025-09-11', 1833333.33, 91666.67, '2025-09-11', 1925000.00, 'Da tra'),
(9024, 2, '2025-10-11', 1833333.33, 84166.67, '2025-10-11', 1917500.00, 'Da tra'),
(9024, 3, '2025-11-11', 1833333.33, 76666.67, '2025-11-11', 1910000.00, 'Da tra'),
(9024, 4, '2025-12-11', 1833333.33, 69166.67, '2026-01-05', 1000000.00, 'Tra mot phan'),
(9024, 5, '2026-01-11', 1833333.33, 61666.67, NULL, NULL, 'Qua han');


-- ---------------------------------------------------------------------
-- KỊCH BẢN A13 — Đơn nộp với DANH NGHĨA TẬP THỂ / ĐƠN VỊ
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90025, 9028, 902, 'Tap the', 'Câu lạc bộ Nghiên cứu Khoa học Sinh viên TVU (SRC-TVU)', 903, 'Xin tài trợ tổ chức "Ngày hội Khởi nghiệp Đổi mới sáng tạo TVU 2026" cho toàn thể sinh viên.', 35000000.00, '["/uploads/documents/tap-the-90025.pdf"]', 'Cho duyet cap 2', NULL, '2026-05-01 08:00:00', 'Tai tro khong hoan lai', 0, NULL),
(90026, 9029, 905, 'Don vi', 'Khoa Kỹ thuật và Công nghệ', 905, 'Xin tài trợ tổ chức hội thảo khoa học cấp Khoa "Chuyển đổi số trong giáo dục đại học".', 25000000.00, '["/uploads/documents/don-vi-90026.pdf"]', 'Da duyet cap 1', NULL, '2026-05-10 08:00:00', 'Tai tro khong hoan lai', 0, NULL);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90025, 1, 9003, 'Duyet', NULL, 'Xác nhận Cao Văn Được là đại diện hợp lệ của CLB SRC-TVU.', '2026-05-03 10:00:00'),
(90025, 2, NULL, 'Cho duyet', NULL, NULL, '2026-05-03 10:00:00'),
(90026, 1, 9003, 'Duyet', NULL, 'Xác nhận Nguyễn Thị Xuân Đào là đại diện hợp lệ của Khoa Kỹ thuật và Công nghệ.', '2026-05-12 10:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN A14 — Đơn của CÁN BỘ / GIẢNG VIÊN (loaitaikhoan = 'Can bo')
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90027, 9030, 905, 'Ca nhan', NULL, 905, 'Đề tài "Nghiên cứu quy trình canh tác lúa hữu cơ thích ứng biến đổi khí hậu vùng Trà Vinh" do cán bộ giảng viên đang công tác chủ trì.', 42000000.00, '["/uploads/documents/de-tai-cb-90027.pdf"]', 'Da giai ngan', 'Cán bộ đang công tác tại Khoa Nông nghiệp - Thủy sản.', '2025-10-20 08:00:00', 'Tai tro khong hoan lai', 1, 42000000.00),
(90028, 9031, 905, 'Ca nhan', NULL, 905, 'Đề tài "Biên soạn tài liệu giảng dạy tiếng Khmer ứng dụng cho vùng đồng bào dân tộc" do giảng viên đã nghỉ hưu, còn hợp đồng thỉnh giảng, chủ trì.', 30000000.00, '["/uploads/documents/de-tai-cb-90028.pdf"]', 'Cho duyet cap 3', NULL, '2026-01-10 08:00:00', 'Tai tro khong hoan lai', 1, 30000000.00);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90027, 1, 9003, 'Duyet', NULL, NULL, '2025-10-22 10:00:00'),
(90027, 2, 9001, 'Duyet', NULL, NULL, '2025-10-24 14:00:00'),
(90027, 3, 9002, 'Duyet', NULL, NULL, '2025-10-27 09:00:00'),
(90028, 1, 9003, 'Duyet', NULL, 'Đã xác minh hợp đồng thỉnh giảng còn hiệu lực đến 2027.', '2026-01-12 10:00:00'),
(90028, 2, 9001, 'Duyet', NULL, NULL, '2026-01-14 14:00:00'),
(90028, 3, NULL, 'Cho duyet', NULL, NULL, '2026-01-14 14:00:00');

INSERT INTO giaodich (giaodich_id, yeucauhotro_id, quy_id, loaigiaodich, hangmucchi, nguoinhan_id, sotien, hinhthuc, magiaodich, trangthai, nguoithuchien_id, ngaygiaodich) VALUES
(117, 90027, 905, 'Chi', 'Tai_tro_cho_vay', 9030, 42000000.00, 'Chuyen khoan', 'GD-CB-90027', 'Thanh cong', 9002, '2025-10-27 10:00:00');

INSERT INTO nghiemthu (yeucauhotro_id, lanthu, loaikiemtra, ketqua, soquyetdinh, nguoinghiemthu_id, nhanxet, ngaynghiemthu) VALUES
(90027, 1, 'Kiem tra tien do', 'Dat', NULL, 9004, 'Đã hoàn thành mô hình thử nghiệm trên 2 hecta, đúng tiến độ.', '2026-05-15 09:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN A15 — Đơn của NHÀ KHOA HỌC hợp tác ngoài trường
--                (loaitaikhoan = 'Nha khoa hoc', tài khoản do Admin/Cán bộ Quỹ tạo)
-- ---------------------------------------------------------------------
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90029, 9032, 902, 'Ca nhan', NULL, 903, 'Đề tài hợp tác "Đánh giá đa dạng sinh học vùng ven biển Duyên Hải, Trà Vinh" theo lời mời hợp tác của ĐHTV.', 65000000.00, '["/uploads/documents/de-tai-nkh-90029.pdf"]', 'Da nghiem thu', 'Nhà khoa học hợp tác ngoài trường, được ĐHTV mời theo Điều 15 Điều lệ.', '2025-09-15 08:00:00', 'Tai tro co thu hoi', 1, 220000000.00),
(90030, 9032, 902, 'Ca nhan', NULL, 903, 'Đề tài hợp tác "Xây dựng cơ sở dữ liệu chất lượng nước sông Cổ Chiên phục vụ nuôi trồng thủy sản".', 58000000.00, '["/uploads/documents/de-tai-nkh-90030.pdf"]', 'Cho duyet cap 2', NULL, '2026-04-01 08:00:00', 'Tai tro co thu hoi', 1, 195000000.00);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90029, 1, 9003, 'Duyet', NULL, 'Xác nhận thư mời hợp tác của Ban Giám hiệu ĐHTV.', '2025-09-17 10:00:00'),
(90029, 2, 9001, 'Duyet', NULL, 'Mức thu hồi 33.000.000đ (15% kinh phí 220.000.000đ) — trong hạn mức 30%.', '2025-09-19 14:00:00'),
(90029, 3, 9002, 'Duyet', NULL, NULL, '2025-09-22 09:00:00'),
(90030, 1, 9003, 'Duyet', NULL, 'Xác nhận thư mời hợp tác của Ban Giám hiệu ĐHTV.', '2026-04-03 10:00:00'),
(90030, 2, NULL, 'Cho duyet', NULL, NULL, '2026-04-03 10:00:00');

INSERT INTO giaodich (giaodich_id, yeucauhotro_id, quy_id, loaigiaodich, hangmucchi, nguoinhan_id, sotien, hinhthuc, magiaodich, trangthai, nguoithuchien_id, ngaygiaodich) VALUES
(118, 90029, 902, 'Chi', 'Tai_tro_cho_vay', 9032, 65000000.00, 'Chuyen khoan', 'GD-NKH-90029', 'Thanh cong', 9002, '2025-09-22 10:00:00');

INSERT INTO dieukhoanthuhoi (yeucauhotro_id, mucthuhoi, laisuat, thoihanhoantra_thang, soquyetdinh_hopdong, filehopdong) VALUES
(90029, 33000000.00, NULL, 24, 'QD-THUHOI-90029/2025', '/uploads/documents/hopdong-thuhoi-90029.pdf');

INSERT INTO nghiemthu (yeucauhotro_id, lanthu, loaikiemtra, ketqua, soquyetdinh, nguoinghiemthu_id, nhanxet, ngaynghiemthu) VALUES
(90029, 1, 'Kiem tra tien do', 'Dat', NULL, 9004, 'Đã hoàn thành khảo sát thực địa đợt 1.', '2026-01-10 09:00:00'),
(90029, 2, 'Nghiem thu cuoi cung', 'Dat', 'QD-NT-90029/2026', 9004, 'Báo cáo tổng kết đạt yêu cầu, có dữ liệu công bố quốc tế.', '2026-06-25 09:00:00');


-- =====================================================================
-- =====================================================================
-- PHẦN B — LUỒNG TÀI TRỢ / KHOẢN TÀI TRỢ (khoantaitro)
-- Mỗi kịch bản: 2 bản ghi, kèm giaodich tương ứng khi đã duyệt.
-- =====================================================================
-- =====================================================================


-- ---------------------------------------------------------------------
-- KỊCH BẢN B1 — Khoản tài trợ MỚI, đang CHỜ DUYỆT (Cho duyet)
-- ---------------------------------------------------------------------
INSERT INTO khoantaitro (khoantaitro_id, nhataitro_id, quy_id, sotien, hinhthuc, magiaodich, ngaytaitro, chungtu, trangthai, ghichu) VALUES
(90101, 901, 901, 20000000.00, 'Chuyen khoan', 'CTV260701001', '2026-07-01', '/uploads/proofs/ctv-90101.jpg', 'Cho duyet', 'Tài trợ định kỳ hàng năm cho Quỹ Học bổng.'),
(90102, 903, 902, 50000000.00, 'Chuyen khoan', 'CTV260705002', '2026-07-05', '/uploads/proofs/ctv-90102.jpg', 'Cho duyet', 'Hội Cựu sinh viên gây quỹ đợt hè 2026.');


-- ---------------------------------------------------------------------
-- KỊCH BẢN B2 — Khoản tài trợ ĐÃ DUYỆT (quỹ đã được cộng tiền, có giao dịch Thu)
-- ---------------------------------------------------------------------
INSERT INTO khoantaitro (khoantaitro_id, nhataitro_id, quy_id, sotien, hinhthuc, magiaodich, ngaytaitro, chungtu, trangthai, ghichu, nguoixacnhan_id, ngayxacnhan) VALUES
(90103, 902, 901, 100000000.00, 'Chuyen khoan', 'CTV260215003', '2026-02-15', '/uploads/proofs/ctv-90103.jpg', 'Da duyet', 'Tài trợ học bổng thường niên năm học 2025-2026.', 9002, '2026-02-16 09:00:00'),
(90104, 904, 902, 150000000.00, 'Chuyen khoan', 'CTV260310004', '2026-03-10', '/uploads/proofs/ctv-90104.jpg', 'Da duyet', 'Tài trợ Quỹ NCKH đợt 1/2026.', 9002, '2026-03-11 09:00:00');

INSERT INTO giaodich (giaodich_id, quy_id, loaigiaodich, sotien, hinhthuc, magiaodich, trangthai, nguoithuchien_id, ngaygiaodich) VALUES
(119, 901, 'Thu', 100000000.00, 'Chuyen khoan', 'CTV260215003', 'Thanh cong', 9002, '2026-02-16 09:00:00'),
(120, 902, 'Thu', 150000000.00, 'Chuyen khoan', 'CTV260310004', 'Thanh cong', 9002, '2026-03-11 09:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN B3 — Khoản tài trợ ĐÃ XÁC NHẬN CUỐI CÙNG (Da nhan)
-- ---------------------------------------------------------------------
INSERT INTO khoantaitro (khoantaitro_id, nhataitro_id, quy_id, sotien, hinhthuc, magiaodich, ngaytaitro, chungtu, trangthai, ghichu, nguoixacnhan_id, ngayxacnhan) VALUES
(90105, 901, 903, 30000000.00, 'Chuyen khoan', 'CTV251020005', '2025-10-20', '/uploads/proofs/ctv-90105.jpg', 'Da nhan', 'Đã đối chiếu khớp sao kê ngân hàng, xác nhận tiền đã về tài khoản trường.', 9001, '2025-10-22 10:00:00'),
(90106, 902, 903, 45000000.00, 'Tien mat', NULL, '2025-11-02', '/uploads/proofs/ctv-90106.jpg', 'Da nhan', 'Nộp trực tiếp tại văn phòng Quỹ, đã lập phiếu thu.', 9001, '2025-11-03 10:00:00');

INSERT INTO giaodich (giaodich_id, quy_id, loaigiaodich, sotien, hinhthuc, magiaodich, trangthai, nguoithuchien_id, ngaygiaodich) VALUES
(121, 903, 'Thu', 30000000.00, 'Chuyen khoan', 'CTV251020005', 'Thanh cong', 9002, '2025-10-22 10:00:00'),
(122, 903, 'Thu', 45000000.00, 'Tien mat', NULL, 'Thanh cong', 9002, '2025-11-03 10:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN B4 — Khoản tài trợ BỊ TỪ CHỐI
-- ---------------------------------------------------------------------
INSERT INTO khoantaitro (khoantaitro_id, nhataitro_id, quy_id, sotien, hinhthuc, magiaodich, ngaytaitro, chungtu, trangthai, ghichu, nguoixacnhan_id, ngayxacnhan) VALUES
(90107, 905, 901, 25000000.00, 'Chuyen khoan', 'CTV260420006', '2026-04-20', '/uploads/proofs/ctv-90107.jpg', 'Tu choi', 'Chứng từ chuyển khoản không khớp số tiền và ngày giao dịch khai báo.', 9002, '2026-04-22 09:00:00'),
(90108, 905, 902, 18000000.00, 'Chuyen khoan', 'CTV260425007', '2026-04-25', '/uploads/proofs/ctv-90108.jpg', 'Tu choi', 'Không cung cấp được chứng từ gốc theo yêu cầu đối soát.', 9002, '2026-04-27 09:00:00');


-- ---------------------------------------------------------------------
-- KỊCH BẢN B5 — Nhà tài trợ đa dạng loại hình (Đối tác, Doanh nghiệp) — đã duyệt
-- ---------------------------------------------------------------------
INSERT INTO khoantaitro (khoantaitro_id, nhataitro_id, quy_id, sotien, hinhthuc, magiaodich, ngaytaitro, chungtu, trangthai, ghichu, nguoixacnhan_id, ngayxacnhan) VALUES
(90109, 904, 903, 80000000.00, 'Chuyen khoan', 'CTV260605008', '2026-06-05', '/uploads/proofs/ctv-90109.jpg', 'Da duyet', 'Đối tác chiến lược tài trợ vốn mồi cho Quỹ Vay vốn Khởi nghiệp.', 9002, '2026-06-06 09:00:00'),
(90110, 902, 905, 40000000.00, 'Chuyen khoan', 'CTV260610009', '2026-06-10', '/uploads/proofs/ctv-90110.jpg', 'Da duyet', 'Doanh nghiệp tài trợ Quỹ Hỗ trợ Cán bộ - Giảng viên nghiên cứu.', 9002, '2026-06-11 09:00:00');

INSERT INTO giaodich (giaodich_id, quy_id, loaigiaodich, sotien, hinhthuc, magiaodich, trangthai, nguoithuchien_id, ngaygiaodich) VALUES
(123, 903, 'Thu', 80000000.00, 'Chuyen khoan', 'CTV260605008', 'Thanh cong', 9002, '2026-06-06 09:00:00'),
(124, 905, 'Thu', 40000000.00, 'Chuyen khoan', 'CTV260610009', 'Thanh cong', 9002, '2026-06-11 09:00:00');


-- =====================================================================
-- PHẦN C — LUỒNG KHÁCH (GUEST FLOW) — chưa có tài khoản đăng nhập
-- =====================================================================

-- --- C1: Guest xin hỗ trợ — CHƯA xác thực OTP (còn nằm ở bảng staging) ---
INSERT INTO guest_yeucauhotro (guest_yeucauhotro_id, guest_hoten, guest_email, guest_sodienthoai, guest_mssv, guest_khoa, guest_lop, guest_sotaikhoan, guest_nganhang, guest_chutaikhoan, quy_id, lydo, sotiendenghi, tailieudinhkem, trang_thai_staging, otp_code, otp_expires_at, is_email_verified, tracking_uuid) VALUES
(2, 'Trần Văn Được', 'tranvanduoc.chuaxacthuc@gmail.com', '0912345099', '110123099', 'Khoa Kỹ thuật và Công nghệ', 'DA23TIN01', '0501123456789', 'Agribank', 'Trần Văn Được', 901, 'Xin hỗ trợ khẩn cấp do gia đình bị ngập lụt, chưa kịp xác thực email.', 9000000.00, '["/uploads/documents/guest-don-01.pdf"]', 'CHO_XAC_MINH', '482913', '2026-07-15 23:59:59', 0, 'TEST-GYC-0001-CHUAXACTHUC');

-- --- C2: Guest xin hỗ trợ — ĐÃ xác thực OTP, đã migrate thành tài khoản + đơn chính thức ---
INSERT INTO guest_yeucauhotro (guest_yeucauhotro_id, guest_hoten, guest_email, guest_sodienthoai, guest_mssv, guest_khoa, guest_lop, guest_sotaikhoan, guest_nganhang, guest_chutaikhoan, quy_id, lydo, sotiendenghi, tailieudinhkem, trang_thai_staging, yeucauhotro_id_ref, nguoidung_id_ref, otp_code, otp_expires_at, is_email_verified, tracking_uuid) VALUES
(3, 'Trần Văn Được', 'tranvanduoc.guest@st.tvu.edu.vn', '0912345021', '110123024', 'Khoa Kỹ thuật và Công nghệ', 'DA23TIN02', '0501987654321', 'Agribank', 'Trần Văn Được', 901, 'Xin hỗ trợ chi phí học tập, đã xác thực qua OTP email và được chuyển thành đơn chính thức.', 11000000.00, '["/uploads/documents/guest-don-02.pdf"]', 'DA_CHUYEN', 90031, 9033, '751204', '2026-06-20 23:59:59', 1, 'TEST-GYC-0002-DAXACTHUC');

-- Đơn chính thức được tạo ra sau khi migrate từ guest_yeucauhotro ở trên
INSERT INTO yeucauhotro (yeucauhotro_id, nguoidung_id, quy_id, danhnghia, tendaidien, dot_id, lydo, sotiendenghi, tailieudinhkem, trangthai, ghichu, ngaynop, loaihotro, canghiemthu, tongkinhphidudan) VALUES
(90031, 9033, 901, 'Ca nhan', NULL, 902, 'Xin hỗ trợ chi phí học tập, đã xác thực qua OTP email và được chuyển thành đơn chính thức.', 11000000.00, '["/uploads/documents/guest-don-02.pdf"]', 'Cho duyet cap 1', 'Đơn được tạo tự động sau khi khách xác thực OTP thành công.', '2026-06-18 08:00:00', 'Tai tro khong hoan lai', 0, NULL);

INSERT INTO pheduyet (yeucauhotro_id, capduyet, nguoiduyet_id, ketqua, lydo, ghichu, ngayduyet) VALUES
(90031, 1, NULL, 'Cho duyet', NULL, NULL, '2026-06-18 08:00:00');


-- --- C3: Guest tài trợ — CHƯA xác thực OTP ---
INSERT INTO guest_khoantaitro (guest_khoantaitro_id, guest_hoten, guest_email, guest_sodienthoai, guest_tochuc, guest_diachi, quy_id, sotien, hinhthuc, magiaodich, ngaytaitro, chungtu, ghichu, trang_thai_staging, otp_code, otp_expires_at, is_email_verified, tracking_uuid) VALUES
(3, 'Lê Thị Kim Cương', 'lethikimcuong.chuaxacthuc@gmail.com', '0918888099', NULL, '23 Trần Hưng Đạo, TP. Cần Thơ', 902, 15000000.00, 'Chuyen khoan', 'CTV-GUEST-001', '2026-07-14', '/uploads/proofs/guest-ctv-01.jpg', 'Tài trợ lần đầu qua form khách, chưa xác thực email.', 'CHO_XAC_MINH', '390215', '2026-07-16 23:59:59', 0, 'TEST-GKT-0001-CHUAXACTHUC');

-- --- C4: Guest tài trợ — ĐÃ xác thực OTP, đã migrate thành tài khoản + khoản tài trợ chính thức ---
INSERT INTO guest_khoantaitro (guest_khoantaitro_id, guest_hoten, guest_email, guest_sodienthoai, guest_tochuc, guest_diachi, quy_id, sotien, hinhthuc, magiaodich, ngaytaitro, chungtu, ghichu, trang_thai_staging, khoantaitro_id_ref, nhataitro_id_ref, otp_code, otp_expires_at, is_email_verified, tracking_uuid) VALUES
(4, 'Lê Thị Kim Cương', 'lethikimcuong.guest@gmail.com', '0918888003', NULL, '23 Trần Hưng Đạo, TP. Cần Thơ', 903, 22000000.00, 'Chuyen khoan', 'CTV-GUEST-002', '2026-06-25', '/uploads/proofs/guest-ctv-02.jpg', 'Đã xác thực OTP, chuyển thành khoản tài trợ chính thức.', 'DA_CHUYEN', 90111, 906, '627340', '2026-06-27 23:59:59', 1, 'TEST-GKT-0002-DAXACTHUC');

-- Khoản tài trợ chính thức được tạo ra sau khi migrate từ guest_khoantaitro ở trên
INSERT INTO khoantaitro (khoantaitro_id, nhataitro_id, quy_id, sotien, hinhthuc, magiaodich, ngaytaitro, chungtu, trangthai, ghichu) VALUES
(90111, 906, 903, 22000000.00, 'Chuyen khoan', 'CTV-GUEST-002', '2026-06-25', '/uploads/proofs/guest-ctv-02.jpg', 'Cho duyet', 'Khoản tài trợ được tạo tự động sau khi khách xác thực OTP thành công.');


-- =====================================================================
-- HẾT FILE — TỔNG KẾT DỮ LIỆU ĐÃ TẠO
-- =====================================================================
-- PHẦN A (Xin tài trợ / Yêu cầu hỗ trợ) — 15 kịch bản x 2 record = 30 đơn + 1 đơn từ guest = 31 đơn:
--   A1  - Không hoàn lại, hoàn tất, không cần nghiệm thu
--   A2  - Không hoàn lại, dự án cần nghiệm thu, đã ĐẠT
--   A3  - Từ chối cấp 1
--   A4  - Từ chối cấp 2
--   A5  - Từ chối cấp 3
--   A6  - Mới nộp, chờ duyệt cấp 1
--   A7  - Đã duyệt 3 cấp, chờ giải ngân (quỹ thiếu tiền)
--   A8  - Có thu hồi, đã giải ngân, chờ nghiệm thu
--   A9  - Có thu hồi, nghiệm thu KHÔNG đạt
--   A10 - Cho vay, đang thực hiện, trả đúng hạn
--   A11 - Cho vay, đã tất toán
--   A12 - Cho vay, quá hạn
--   A13 - Danh nghĩa Tập thể / Đơn vị
--   A14 - Đơn của Cán bộ/Giảng viên
--   A15 - Đơn của Nhà khoa học hợp tác ngoài trường
--
-- PHẦN B (Tài trợ / Khoản tài trợ) — 5 kịch bản x 2 record = 10 khoản + 1 khoản từ guest = 11 khoản:
--   B1 - Mới, chờ duyệt
--   B2 - Đã duyệt (đã cộng số dư quỹ)
--   B3 - Đã xác nhận cuối cùng
--   B4 - Bị từ chối
--   B5 - Đối tác/Doanh nghiệp tài trợ
--
-- PHẦN C (Guest flow) — 4 record: 2 support request + 2 donation (1 pending, 1 đã migrate mỗi loại)
-- =====================================================================
