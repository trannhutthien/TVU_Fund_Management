# TVU Fund Management — Database Schema Reference

> **Database:** `tvu_fund_management` · **Charset:** utf8mb4 · **Engine:** InnoDB
> **Cập nhật từ DB thực tế localhost:** 2026-07-13

---

## 1. Tổng quan bảng

| # | Bảng | Mô tả | Dòng |
|---|------|-------|------|
| 1 | `vaitro` | Phân quyền người dùng | 5 |
| 2 | `donvihoc` | Đơn vị học (khoa, ngành, lớp) | 1 |
| 3 | `taikhoannganhang` | Tài khoản ngân hàng | 8 |
| 4 | `nguoidung` | Người dùng (SV, NTT, Admin, KT) | 10 |
| 5 | `loaiquy` | Loại quỹ | 14 |
| 6 | `quy` | Quỹ phát triển | 12 |
| 7 | `nhataitro` | Nhà tài trợ | 12 |
| 8 | `khoantaitro` | Khoản tài trợ đã xác nhận | 16 |
| 9 | `yeucauhotro` | Đề xuất hỗ trợ sinh viên | 1 |
| 10 | `dotgiaingan` | Đợt giải ngân | 8 |
| 11 | `pheduyet` | Phiếu duyệt (3 cấp) | 6 |
| 12 | `giaodich` | Giao dịch Thu/Chi | 6 |
| 13 | `phanbongansach` | Phân bổ ngân sách nội bộ | 5 |
| 14 | `nhatkyhethong` | Nhật ký hệ thống | 115 |
| 15 | `sinhviennoibat` | Sinh viên nổi bật | 2 |
| 16 | `tintuc` | Tin tức | 34 |
| 17 | `dieukhoanthuhoi` | Điều khoản thu hồi (cho vay) | 1 |
| 18 | `hopdongvayvon` | Hợp đồng vay vốn | 0 |
| 19 | `lichtrano` | Lịch trả nợ | 0 |
| 20 | `nghiemthu` | Nghiệm thu dự án | 2 |
| 21 | `dutoanhangnam` | Dự toán bộ máy hoạt động năm | 0 |
| 22 | `guest_khoantaitro` | Guest donation staging | 2 |
| 23 | `guest_yeucauhotro` | Guest support request staging | 2 |
| 24 | `danhgia` | Đánh giá / phản hồi | 0 |
| 25 | `chucvuquy` | Chức vụ tổ chức trong Quỹ | 0 |

---

## 2. Schema chi tiết từng bảng

### 2.1 `vaitro` — Phân quyền

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `vaitro_id` | int(11) | NO | PK | |
| `tenvaitro` | varchar(50) | NO | UNIQUE | VD: "Admin", "Ke toan", "Uy ban Quan ly" |
| `mota` | text | YES | NULL | |
| `trangthai` | enum | YES | `'Hoat dong'` | `Hoat dong` · `Tam dung` |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |

---

### 2.2 `donvihoc` — Đơn vị học

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `donvihoc_id` | int(11) | NO | PK | |
| `madonvi` | varchar(20) | NO | UNIQUE | Mã khoa/ngành |
| `tenkhoa` | varchar(200) | NO | | Tên khoa |
| `tennganh` | varchar(200) | YES | NULL | Tên ngành |
| `lop` | varchar(100) | YES | NULL | Lớp |
| `khoahoc` | varchar(50) | YES | NULL | Khóa học |
| `mota` | text | YES | NULL | |
| `trangthai` | enum | YES | `'Hoat dong'` | `Hoat dong` · `Ngung hoat dong` |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |

---

### 2.3 `taikhoannganhang` — Tài khoản ngân hàng

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `taikhoannganhang_id` | int(11) | NO | PK | |
| `quy_id` | int(11) | YES | NULL | FK → `quy` (ON DELETE CASCADE) |
| `loaitaikhoan` | enum | NO | `'Sinh vien'` | `Nha truong` · `Sinh vien` |
| `sotaikhoan` | varchar(50) | NO | | Số tài khoản |
| `nganhang` | varchar(100) | NO | | Tên ngân hàng |
| `chinhanh` | varchar(100) | YES | NULL | Chi nhánh |
| `chutaikhoan` | varchar(100) | NO | | Chủ tài khoản |
| `trangthai` | enum | YES | `'Hoat dong'` | `Hoat dong` · `Khoa` |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |

---

### 2.4 `nguoidung` — Người dùng

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `nguoidung_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `email` | varchar(100) | NO | UNIQUE | |
| `matkhau` | varchar(255) | YES | NULL | bcrypt hash |
| `hoten` | varchar(100) | NO | | Họ tên |
| `masodinhdanh` | varchar(20) | YES | NULL | MSSV / Mã CB |
| `ngaysinh` | date | YES | NULL | |
| `gioitinh` | enum | YES | NULL | `Nam` · `Nu` · `Khac` |
| `sodienthoai` | varchar(15) | YES | NULL | |
| `diachi` | text | YES | NULL | |
| `donvihoc_id` | int(11) | YES | NULL | FK → `donvihoc` |
| `avatar` | varchar(255) | YES | NULL | |
| `vaitro_id` | int(11) | NO | | FK → `vaitro` (1=Admin, 2=KT, 3=UBQL) |
| `loaitaikhoan` | enum | YES | NULL | `Sinh vien` · `Nha tai tro` · `Can bo` · `Nha khoa hoc` |
| `tinhtrangcongtac` | enum | YES | NULL | `Dang cong tac` · `Da nghi huu` (chỉ khi loaitaikhoan='Can bo') |
| `trangthai` | enum | YES | `'Hoat dong'` | `Hoat dong` · `Khoa` · `Cho duyet` |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |
| `taikhoannganhang_id` | int(11) | YES | NULL | FK → `taikhoannganhang` |

---

### 2.5 `loaiquy` — Loại quỹ

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `loaiquy_id` | int(11) | NO | PK | |
| `maloai` | varchar(50) | NO | UNIQUE | Mã loại |
| `tenloai` | varchar(100) | NO | | Tên loại |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |

---

### 2.6 `quy` — Quỹ phát triển

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `quy_id` | int(11) | NO | PK | |
| `tenquy` | varchar(200) | NO | | Tên quỹ |
| `loaiquy_id` | int(11) | NO | | FK → `loaiquy` |
| `mota` | text | YES | NULL | |
| `hinhanh` | varchar(255) | YES | NULL | URL ảnh |
| `sotienmuctieu` | decimal(15,2) | YES | 0.00 | Mục tiêu quỹ |
| `sodu` | decimal(15,2) | YES | 0.00 | Số dư hiện tại |
| `sotienhotrotoida` | decimal(15,2) | YES | NULL | Số tiền hỗ trợ tối đại/lần |
| `soluonghotrotoida` | int(11) | YES | NULL | Số lượng hỗ trợ tối đa |
| `dieukienhotro` | text | YES | NULL | Điều kiện hỗ trợ |
| `ngaybatdau` | date | YES | NULL | |
| `ngayketthuc` | date | YES | NULL | |
| `trangthai` | enum | YES | `'Dang hoat dong'` | `Dang hoat dong` · `Tam dung` · `Da dong` |
| `nguoitao_id` | int(11) | YES | NULL | FK → `nguoidung` |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |
| `loaidieuhanh` | enum | NO | `'Tap trung - Be chung'` | `Tap trung - Be chung` · `Tap trung - Muc chi` |
| `quy_cha_id` | int(11) | YES | NULL | FK → `quy` (self-ref, Bể tiền lớn) |

---

### 2.7 `nhataitro` — Nhà tài trợ

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `nhataitro_id` | int(11) | NO | PK | |
| `tennhataitro` | varchar(200) | NO | | Tên NTT |
| `loainhataitro` | enum | NO | | `Ca nhan` · `To chuc` · `Doanh nghiep` · `Doi tac` |
| `email` | varchar(100) | YES | NULL | |
| `sodienthoai` | varchar(15) | YES | NULL | |
| `diachi` | text | YES | NULL | |
| `website` | varchar(255) | YES | NULL | |
| `mota` | text | YES | NULL | |
| `logo` | varchar(255) | YES | NULL | |
| `nguoidung_id` | int(11) | YES | NULL | FK → `nguoidung` (nếu NTT có tài khoản) |
| `trangthai` | enum | YES | `'Hoat dong'` | `Hoat dong` · `Ngung hoat dong` |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |

---

### 2.8 `khoantaitro` — Khoản tài trợ

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `khoantaitro_id` | int(11) | NO | PK | |
| `nhataitro_id` | int(11) | NO | | FK → `nhataitro` |
| `quy_id` | int(11) | NO | | FK → `quy` |
| `sotien` | decimal(15,2) | NO | | Số tiền tài trợ |
| `hinhthuc` | enum | NO | | `Tien mat` · `Chuyen khoan` · `Khac` |
| `magiaodich` | varchar(100) | YES | NULL | Mã GD ngân hàng |
| `ngaytaitro` | date | NO | | Ngày tài trợ |
| `chungtu` | varchar(255) | YES | NULL | File chứng từ |
| `trangthai` | enum | YES | `'Cho duyet'` | `Cho duyet` · `Da duyet` · `Da nhan` · `Tu choi` |
| `ghichu` | text | YES | NULL | |
| `nguoixacnhan_id` | int(11) | YES | NULL | FK → `nguoidung` |
| `ngayxacnhan` | timestamp | YES | NULL | |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |

---

### 2.9 `yeucauhotro` — Đề xuất hỗ trợ

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `yeucauhotro_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `nguoidung_id` | int(11) | NO | | FK → `nguoidung` (ON DELETE CASCADE) |
| `quy_id` | int(11) | NO | | FK → `quy` (ON DELETE CASCADE) |
| `danhnghia` | enum | NO | `'Ca nhan'` | `Ca nhan` · `Tap the` · `Don vi` |
| `tendaidien` | varchar(200) | YES | NULL | Tên tập thể/đơn vị khi danhnghia != Ca nhan |
| `dot_id` | int(11) | YES | NULL | FK → `dotgiaingan` |
| `lydo` | text | NO | | Lý do hỗ trợ |
| `sotiendenghi` | decimal(15,2) | NO | | Số tiền đề nghị |
| `tailieudinhkem` | text | YES | NULL | JSON hoặc URL file |
| `trangthai` | enum(15) | YES | `'Cho duyet cap 1'` | Xem chi tiết bên dưới |
| `ghichu` | text | YES | NULL | |
| `ngaynop` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |
| `loaihotro` | enum | YES | `'Tai tro khong hoan lai'` | `Tai tro khong hoan lai` · `Tai tro co thu hoi` · `Cho vay` |
| `canghiemthu` | tinyint(1) | NO | 0 | 1 = cần nghiệm thu |
| `tongkinhphidudan` | decimal(15,2) | YES | NULL | Tổng kinh phí dự kiến |

**Enum `trangthai` (15 giá trị):**
`Cho duyet cap 1` · `Da duyet cap 1` · `Tu choi cap 1` · `Cho duyet cap 2` · `Da duyet cap 2` · `Tu choi cap 2` · `Cho duyet cap 3` · `Da duyet cap 3` · `Tu choi cap 3` · `Cho giai ngan` · `Da giai ngan` · `Cho nghiem thu` · `Da nghiem thu` · `Nghiem thu khong dat` · `Tu choi`

---

### 2.10 `dotgiaingan` — Đợt giải ngân

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `dot_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `quy_id` | int(11) | NO | | FK → `quy` |
| `thutu` | int(11) | NO | | Thứ tự đợt |
| `tendot` | varchar(100) | YES | NULL | Tên đợt |
| `mota` | varchar(255) | YES | NULL | |
| `sotiendukien` | decimal(15,2) | NO | 0.00 | Số tiền dự kiến |
| `sotiendachi` | decimal(15,2) | NO | 0.00 | Số tiền đã chi |
| `ngaydukien` | date | YES | NULL | Ngày dự kiến giải ngân |
| `ngaythucte` | date | YES | NULL | Ngày thực tế giải ngân |
| `trangthai` | enum | NO | `'chuatoi'` | `chuatoi` · `dangchodutien` · `hoanthanh` |
| `ngaytao` | datetime | YES | CURRENT_TIMESTAMP | |

---

### 2.11 `pheduyet` — Phiếu duyệt (3 cấp)

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `pheduyet_id` | int(11) | NO | PK | |
| `yeucauhotro_id` | int(11) | NO | | FK → `yeucauhotro` (ON DELETE CASCADE) |
| `capduyet` | tinyint(4) | NO | | 1, 2, hoặc 3 |
| `nguoiduyet_id` | int(11) | YES | NULL | FK → `nguoidung` |
| `ketqua` | enum | NO | `'Cho duyet'` | `Cho duyet` · `Duyet` · `Da duyet` · `Tu choi` |
| `lydo` | text | YES | NULL | Lý do duyệt/từ chối |
| `ghichu` | text | YES | NULL | |
| `ngayduyet` | timestamp | NO | CURRENT_TIMESTAMP | |

---

### 2.12 `giaodich` — Giao dịch Thu/Chi

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `giaodich_id` | int(11) | NO | PK | |
| `yeucauhotro_id` | int(11) | YES | NULL | FK → `yeucauhotro` |
| `lichtrano_id` | int(11) | YES | NULL | FK → `lichtrano` |
| `quy_id` | int(11) | NO | | FK → `quy` |
| `loaigiaodich` | enum | NO | `'Thu'` | `Thu` · `Chi` · `Thu hoi no` |
| `hangmucchi` | enum | YES | NULL | `Tai_tro_cho_vay` · `Tham_dinh_du_an` · `Bo_may_hoat_dong` · `Nhiem_vu_khac` |
| `nguoinhan_id` | int(11) | YES | NULL | FK → `nguoidung` |
| `sotien` | decimal(15,2) | NO | | Số tiền giao dịch |
| `hinhthuc` | enum | NO | | `Tien mat` · `Chuyen khoan` |
| `magiaodich` | varchar(100) | YES | NULL | Mã GD |
| `chungtu` | varchar(255) | YES | NULL | File chứng từ |
| `trangthai` | enum | YES | `'Dang xu ly'` | `Thanh cong` · `That bai` · `Dang xu ly` |
| `doisoattrangthai` | enum | NO | `'Chua_doi_soat'` | `Chua_doi_soat` · `Da_doi_soat` · `Bat_thuong` |
| `sotienthucte` | decimal(15,2) | YES | NULL | Số tiền thực tế (sau đối soát) |
| `doisoatboiid` | int(11) | YES | NULL | FK → `nguoidung` (người đối soát) |
| `doisoatluc` | datetime | YES | NULL | Thời điểm đối soát |
| `doisoatghichu` | varchar(255) | YES | NULL | |
| `ghichu` | text | YES | NULL | |
| `nguoithuchien_id` | int(11) | NO | | FK → `nguoidung` (người thực hiện) |
| `ngaygiaodich` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |

---

### 2.13 `phanbongansach` — Phân bổ ngân sách nội bộ

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `phanbongansach_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `quy_nguon_id` | int(11) | NO | | FK → `quy` (Bể tiền lớn) |
| `quy_dich_id` | int(11) | NO | | FK → `quy` (Mục chi) |
| `sotien` | decimal(15,2) | NO | | Số tiền trích |
| `soquyetdinh` | varchar(100) | NO | | Số QĐ trích lập |
| `filequyetdinh` | varchar(255) | YES | NULL | File QĐ |
| `trangthai` | enum | NO | `'Cho duyet'` | `Cho duyet` · `Da duyet` · `Tu choi` · `Da thu hoi` |
| `lydotuchoi` | text | YES | NULL | |
| `nguoi_de_xuat_id` | int(11) | NO | | FK → `nguoidung` |
| `nguoi_duyet_id` | int(11) | YES | NULL | FK → `nguoidung` |
| `ngaydexuat` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngayduyet` | timestamp | YES | NULL | |
| `ghichu` | text | YES | NULL | |
| `namtaichinh` | year(4) | YES | NULL | Năm tài chính (VD: 2026) |

---

### 2.14 `nhatkyhethong` — Nhật ký hệ thống

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `nhatkyhethong_id` | int(11) | NO | PK | |
| `nguoidung_id` | int(11) | YES | NULL | FK → `nguoidung` |
| `hanhdong` | varchar(100) | NO | | Hành động (VD: "Tao giao dich") |
| `loaidoituong` | varchar(50) | YES | NULL | Loại đối tượng (VD: "giaodich") |
| `doituong_id` | int(11) | YES | NULL | ID đối tượng |
| `mota` | text | YES | NULL | Mô tả chi tiết |
| `dulieucu` | longtext | YES | NULL | JSON data cũ |
| `dulieumoi` | longtext | YES | NULL | JSON data mới |
| `ipaddress` | varchar(45) | YES | NULL | IPv4/IPv6 |
| `createdat` | timestamp | NO | CURRENT_TIMESTAMP | |

---

### 2.15 `sinhviennoibat` — Sinh viên nổi bật

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `sinhviennoibat_id` | int(11) | NO | PK | |
| `nguoidung_id` | int(11) | NO | | FK → `nguoidung` (ON DELETE CASCADE) |
| `namhoc` | varchar(20) | YES | NULL | VD: "2025-2026" |
| `thanhtich` | text | YES | NULL | Thành tích |
| `thutu` | int(11) | YES | 0 | Thứ tự hiển thị |
| `trangthai` | enum | YES | `'Hien thi'` | `Hien thi` · `An` |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |

---

### 2.16 `tintuc` — Tin tức

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `tintuc_id` | int(11) | NO | PK | |
| `tieude` | varchar(255) | NO | | Tiêu đề |
| `motangan` | varchar(500) | YES | NULL | Mô tả ngắn |
| `noidung` | longtext | NO | | Nội dung đầy đủ (HTML/Markdown) |
| `avatar` | varchar(255) | YES | NULL | Ảnh thumbnail |
| `danhmuc` | enum | YES | `'Thong bao'` | `Tin hoc bong` · `Tin giao duc` · `Su kien` · `Thong bao` · `Khac` |
| `phanloai` | enum | YES | `'Tin moi'` | `Tin moi` · `Tin noi bat` |
| `lanoibat` | tinyint(4) | YES | 0 | 0=Bình thường, 1=Featured lớn, 2=Featured nhỏ, 3=Sidebar |
| `trangthai` | enum | YES | `'Ban nhap'` | `Ban nhap` · `Da xuat ban` · `Da an` |
| `ngayxuatban` | timestamp | YES | NULL | |
| `nguoitao_id` | int(11) | NO | | FK → `nguoidung` |
| `nguoisua_id` | int(11) | YES | NULL | FK → `nguoidung` |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |

---

### 2.17 `dieukhoanthuhoi` — Điều khoản thu hồi

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `dieukhoanthuhoi_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `yeucauhotro_id` | int(11) | NO | UNIQUE | FK → `yeucauhotro` |
| `mucthuhoi` | decimal(15,2) | NO | | Số tiền phải thu hồi |
| `laisuat` | decimal(5,2) | YES | NULL | Lãi suất (%) |
| `thoihanhoantra_thang` | int(11) | YES | NULL | Thời hạn hoàn trả (tháng) |
| `soquyetdinh_hopdong` | varchar(100) | YES | NULL | Số QĐ/Hợp đồng |
| `filehopdong` | varchar(255) | YES | NULL | File hợp đồng |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |

---

### 2.18 `hopdongvayvon` — Hợp đồng vay vốn

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `hopdongvayvon_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `yeucauhotro_id` | int(11) | NO | UNIQUE | FK → `yeucauhotro` |
| `sotienvon` | decimal(15,2) | NO | | Số tiền vay |
| `laisuatphantram` | decimal(5,2) | NO | 0.00 | Lãi suất (%/năm) |
| `ngaykyhopdong` | date | NO | | Ngày ký |
| `kyhandothang` | int(11) | NO | | Kỳ hạn (tháng) |
| `ngaydaohan` | date | NO | | Ngày đáo hạn |
| `trangthai` | enum | NO | `'Dang thuc hien'` | `Dang thuc hien` · `Da tat toan` · `Qua han` |
| `filehopdong` | varchar(255) | YES | NULL | |
| `nguoiduyet_id` | int(11) | YES | NULL | FK → `nguoidung` |
| `ghichu` | text | YES | NULL | |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |

---

### 2.19 `lichtrano` — Lịch trả nợ

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `lichtrano_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `hopdongvayvon_id` | int(11) | NO | | FK → `hopdongvayvon` |
| `kythu` | int(11) | NO | | Kỳ thứ (1, 2, 3...) |
| `ngaydenhan` | date | NO | | Ngày đến hạn |
| `sotiengocphaitra` | decimal(15,2) | NO | 0.00 | Gốc phải trả |
| `sotienlaiphaitra` | decimal(15,2) | NO | 0.00 | Lãi phải trả |
| `ngaythuctra` | date | YES | NULL | Ngày thực trả |
| `sotienthuctra` | decimal(15,2) | YES | NULL | Số tiền thực trả |
| `trangthai` | enum | NO | `'Chua den han'` | `Chua den han` · `Da tra` · `Qua han` · `Tra mot phan` |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |

---

### 2.20 `nghiemthu` — Nghiệm thu

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `nghiemthu_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `yeucauhotro_id` | int(11) | NO | | FK → `yeucauhotro` |
| `lanthu` | int(11) | NO | 1 | Lần nghiệm thu |
| `loaikiemtra` | enum | NO | `'Nghiem thu cuoi cung'` | `Kiem tra tien do` · `Nghiem thu cuoi cung` |
| `ketqua` | enum | NO | `'Cho danh gia'` | `Cho danh gia` · `Dat` · `Dat co dieu chinh` · `Khong dat` |
| `soquyetdinh` | varchar(100) | YES | NULL | |
| `filebienban` | varchar(255) | YES | NULL | |
| `nguoinghiemthu_id` | int(11) | YES | NULL | FK → `nguoidung` |
| `nhanxet` | text | YES | NULL | |
| `ngaynghiemthu` | timestamp | YES | NULL | |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |

---

### 2.21 `dutoanhangnam` — Dự toán bộ máy hoạt động

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `dutoanhangnam_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `namtaichinh` | int(11) | NO | UNIQUE | Năm tài chính |
| `sotiendutoan` | decimal(15,2) | NO | | Số tiền dự toán |
| `trangthai` | enum | NO | `'Cho duyet'` | `Cho duyet` · `Da duyet` · `Tu choi` |
| `lydotuchoi` | text | YES | NULL | |
| `nguoidexuat_id` | int(11) | NO | | FK → `nguoidung` |
| `nguoiduyet_id` | int(11) | YES | NULL | FK → `nguoidung` |
| `ngaydexuat` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngayduyet` | timestamp | YES | NULL | |
| `ghichu` | text | YES | NULL | |

---

### 2.22 `guest_khoantaitro` — Guest donation staging

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `guest_khoantaitro_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `guest_hoten` | varchar(100) | NO | | |
| `guest_email` | varchar(100) | NO | | |
| `guest_sodienthoai` | varchar(15) | YES | NULL | |
| `guest_tochuc` | varchar(200) | YES | NULL | |
| `guest_diachi` | varchar(255) | YES | NULL | |
| `quy_id` | int(11) | NO | | Tham chiếu `quy` (không FK) |
| `sotien` | decimal(15,2) | NO | | |
| `hinhthuc` | enum | NO | | `Tien mat` · `Chuyen khoan` · `Khac` |
| `magiaodich` | varchar(100) | YES | NULL | |
| `ngaytaitro` | date | NO | | |
| `chungtu` | varchar(255) | YES | NULL | |
| `ghichu` | text | YES | NULL | |
| `trang_thai_staging` | enum | YES | `'CHO_XAC_MINH'` | `CHO_XAC_MINH` · `DA_CHUYEN` · `HET_HAN` |
| `khoantaitro_id_ref` | int(11) | YES | NULL | ID trong `khoantaitro` sau migrate |
| `nhataitro_id_ref` | int(11) | YES | NULL | ID trong `nhataitro` sau migrate |
| `otp_code` | varchar(6) | YES | NULL | |
| `otp_expires_at` | datetime | YES | NULL | |
| `is_email_verified` | tinyint(1) | YES | 0 | |
| `tracking_uuid` | varchar(64) | NO | UNIQUE | |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |

---

### 2.23 `guest_yeucauhotro` — Guest support request staging

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `guest_yeucauhotro_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `guest_hoten` | varchar(100) | NO | | |
| `guest_email` | varchar(100) | NO | | |
| `guest_sodienthoai` | varchar(15) | YES | NULL | |
| `guest_mssv` | varchar(20) | YES | NULL | |
| `guest_khoa` | varchar(100) | YES | NULL | |
| `guest_lop` | varchar(50) | YES | NULL | |
| `guest_sotaikhoan` | varchar(50) | YES | NULL | |
| `guest_nganhang` | varchar(100) | YES | NULL | |
| `guest_chutaikhoan` | varchar(100) | YES | NULL | |
| `quy_id` | int(11) | NO | | Tham chiếu `quy` (không FK) |
| `lydo` | text | NO | | |
| `sotiendenghi` | decimal(15,2) | NO | | |
| `tailieudinhkem` | text | YES | NULL | |
| `trang_thai_staging` | enum | YES | `'CHO_XAC_MINH'` | `CHO_XAC_MINH` · `DA_CHUYEN` · `HET_HAN` |
| `yeucauhotro_id_ref` | int(11) | YES | NULL | ID trong `yeucauhotro` sau migrate |
| `nguoidung_id_ref` | int(11) | YES | NULL | ID trong `nguoidung` sau migrate |
| `otp_code` | varchar(6) | YES | NULL | |
| `otp_expires_at` | datetime | YES | NULL | |
| `is_email_verified` | tinyint(1) | YES | 0 | |
| `tracking_uuid` | varchar(64) | NO | UNIQUE | |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |

---

### 2.24 `danhgia` — Đánh giá / phản hồi

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `danhgia_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `nguoidung_id` | int(11) | NO | | FK → `nguoidung` (ON DELETE CASCADE) |
| `noidung` | text | NO | | Nội dung cảm nhận |
| `trangthai` | varchar(30) | YES | `'Cho duyet'` | `Cho duyet` · `Da duyet` · `Tu choi` |
| `lydotuchoi` | text | YES | NULL | Lý do từ chối |
| `nguoiduyet_id` | int(11) | YES | NULL | FK → `nguoidung` (ON DELETE SET NULL) |
| `ngayduyet` | datetime | YES | NULL | |
| `noibat` | tinyint(1) | YES | 0 | 1 = nổi bật trên landing |
| `thutu` | int(11) | YES | 0 | Thứ tự hiển thị |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |

---

### 2.25 `chucvuquy` — Chức vụ tổ chức trong Quỹ

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `chucvu_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `nguoidung_id` | int(11) | YES | NULL | FK → `nguoidung` (ON DELETE SET NULL) |
| `hoten` | varchar(100) | YES | NULL | Họ tên (fallback từ nguoidung nếu có nguoidung_id) |
| `chucdanh` | varchar(150) | NO | | Chức danh / Chức vụ trong Quỹ |
| `nhom` | enum | NO | | `Hoi dong quy` · `Ban dieu hanh` · `Ban kiem soat` · `Van phong thuong truc` |
| `ngaybatdaunhiemky` | date | YES | NULL | Ngày bắt đầu nhiệm kỳ |
| `ngayketthucnhiemky` | date | YES | NULL | Ngày kết thúc nhiệm kỳ |
| `anh` | varchar(255) | YES | NULL | Ảnh chân dung (fallback từ nguoidung.avatar) |
| `mota` | text | YES | NULL | Mô tả thêm |
| `thutu` | int(11) | YES | 0 | Thứ tự hiển thị |
| `trangthai` | enum | YES | `'Dang nhiem'` | `Dang nhiem` · `Het nhiem ky` |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |

---

## 3. Quan hệ FK (Foreign Keys)

| Bảng | Cột FK | → Bảng tham chiếu | ON DELETE | ON UPDATE |
|------|--------|-------------------|-----------|-----------|
| `nguoidung` | `vaitro_id` | `vaitro` | — | CASCADE |
| `nguoidung` | `donvihoc_id` | `donvihoc` | — | CASCADE |
| `nguoidung` | `taikhoannganhang_id` | `taikhoannganhang` | SET NULL | CASCADE |
| `quy` | `loaiquy_id` | `loaiquy` | — | CASCADE |
| `quy` | `nguoitao_id` | `nguoidung` | SET NULL | CASCADE |
| `quy` | `quy_cha_id` | `quy` (self) | SET NULL | CASCADE |
| `nhataitro` | `nguoidung_id` | `nguoidung` | SET NULL | CASCADE |
| `khoantaitro` | `nhataitro_id` | `nhataitro` | — | CASCADE |
| `khoantaitro` | `quy_id` | `quy` | — | CASCADE |
| `khoantaitro` | `nguoixacnhan_id` | `nguoidung` | SET NULL | CASCADE |
| `yeucauhotro` | `nguoidung_id` | `nguoidung` | CASCADE | CASCADE |
| `yeucauhotro` | `quy_id` | `quy` | CASCADE | CASCADE |
| `yeucauhotro` | `dot_id` | `dotgiaingan` | — | — |
| `pheduyet` | `yeucauhotro_id` | `yeucauhotro` | CASCADE | CASCADE |
| `pheduyet` | `nguoiduyet_id` | `nguoidung` | — | CASCADE |
| `giaodich` | `yeucauhotro_id` | `yeucauhotro` | — | CASCADE |
| `giaodich` | `lichtrano_id` | `lichtrano` | — | — |
| `chucvuquy` | `nguoidung_id` | `nguoidung` | SET NULL | CASCADE |
| `giaodich` | `quy_id` | `quy` | — | CASCADE |
| `giaodich` | `nguoinhan_id` | `nguoidung` | — | CASCADE |
| `giaodich` | `nguoithuchien_id` | `nguoidung` | — | CASCADE |
| `giaodich` | `doisoatboiid` | `nguoidung` | SET NULL | CASCADE |
| `phanbongansach` | `quy_nguon_id` | `quy` | — | CASCADE |
| `phanbongansach` | `quy_dich_id` | `quy` | — | CASCADE |
| `phanbongansach` | `nguoi_de_xuat_id` | `nguoidung` | — | CASCADE |
| `phanbongansach` | `nguoi_duyet_id` | `nguoidung` | — | CASCADE |
| `nhatkyhethong` | `nguoidung_id` | `nguoidung` | SET NULL | CASCADE |
| `sinhviennoibat` | `nguoidung_id` | `nguoidung` | CASCADE | CASCADE |
| `taikhoannganhang` | `quy_id` | `quy` | CASCADE | CASCADE |
| `tintuc` | `nguoitao_id` | `nguoidung` | — | CASCADE |
| `tintuc` | `nguoisua_id` | `nguoidung` | SET NULL | CASCADE |
| `dotgiaingan` | `quy_id` | `quy` | — | — |
| `dieukhoanthuhoi` | `yeucauhotro_id` | `yeucauhotro` | — | — |
| `hopdongvayvon` | `yeucauhotro_id` | `yeucauhotro` | — | — |
| `hopdongvayvon` | `nguoiduyet_id` | `nguoidung` | — | — |
| `lichtrano` | `hopdongvayvon_id` | `hopdongvayvon` | — | — |
| `nghiemthu` | `yeucauhotro_id` | `yeucauhotro` | — | — |
| `nghiemthu` | `nguoinghiemthu_id` | `nguoidung` | — | — |
| `dutoanhangnam` | `nguoidexuat_id` | `nguoidung` | — | — |
| `dutoanhangnam` | `nguoiduyet_id` | `nguoidung` | — | — |

---

## 4. Quick Reference — Tất cả Enum values

| Bảng | Cột | Giá trị |
|------|-----|---------|
| `vaitro` | `trangthai` | `Hoat dong`, `Tam dung` |
| `donvihoc` | `trangthai` | `Hoat dong`, `Ngung hoat dong` |
| `taikhoannganhang` | `loaitaikhoan` | `Nha truong`, `Sinh vien` |
| `taikhoannganhang` | `trangthai` | `Hoat dong`, `Khoa` |
| `nguoidung` | `gioitinh` | `Nam`, `Nu`, `Khac` |
| `nguoidung` | `loaitaikhoan` | `Sinh vien`, `Nha tai tro`, `Can bo`, `Nha khoa hoc` |
| `nguoidung` | `tinhtrangcongtac` | `Dang cong tac`, `Da nghi huu` |
| `nguoidung` | `trangthai` | `Hoat dong`, `Khoa`, `Cho duyet` |
| `chucvuquy` | `nhom` | `Hoi dong quy`, `Ban dieu hanh`, `Ban kiem soat`, `Van phong thuong truc` |
| `chucvuquy` | `trangthai` | `Dang nhiem`, `Het nhiem ky` |
| `quy` | `trangthai` | `Dang hoat dong`, `Tam dung`, `Da dong` |
| `quy` | `loaidieuhanh` | `Tap trung - Be chung`, `Tap trung - Muc chi` |
| `nhataitro` | `loainhataitro` | `Ca nhan`, `To chuc`, `Doanh nghiep`, `Doi tac` |
| `nhataitro` | `trangthai` | `Hoat dong`, `Ngung hoat dong` |
| `khoantaitro` | `hinhthuc` | `Tien mat`, `Chuyen khoan`, `Khac` |
| `khoantaitro` | `trangthai` | `Cho duyet`, `Da duyet`, `Da nhan`, `Tu choi` |
| `yeucauhotro` | `loaihotro` | `Tai tro khong hoan lai`, `Tai tro co thu hoi`, `Cho vay` |
| `yeucauhotro` | `trangthai` | `Cho duyet cap 1`, `Da duyet cap 1`, `Tu choi cap 1`, `Cho duyet cap 2`, `Da duyet cap 2`, `Tu choi cap 2`, `Cho duyet cap 3`, `Da duyet cap 3`, `Tu choi cap 3`, `Cho giai ngan`, `Da giai ngan`, `Cho nghiem thu`, `Da nghiem thu`, `Nghiem thu khong dat`, `Tu choi` |
| `dotgiaingan` | `trangthai` | `chuatoi`, `dangchodutien`, `hoanthanh` |
| `pheduyet` | `ketqua` | `Cho duyet`, `Duyet`, `Da duyet`, `Tu choi` |
| `giaodich` | `loaigiaodich` | `Thu`, `Chi`, `Thu hoi no` |
| `giaodich` | `hangmucchi` | `Tai_tro_cho_vay`, `Tham_dinh_du_an`, `Bo_may_hoat_dong`, `Nhiem_vu_khac` |
| `giaodich` | `hinhthuc` | `Tien mat`, `Chuyen khoan` |
| `giaodich` | `trangthai` | `Thanh cong`, `That bai`, `Dang xu ly` |
| `giaodich` | `doisoattrangthai` | `Chua_doi_soat`, `Da_doi_soat`, `Bat_thuong` |
| `phanbongansach` | `trangthai` | `Cho duyet`, `Da duyet`, `Tu choi`, `Da thu hoi` |
| `sinhviennoibat` | `trangthai` | `Hien thi`, `An` |
| `tintuc` | `danhmuc` | `Tin hoc bong`, `Tin giao duc`, `Su kien`, `Thong bao`, `Khac` |
| `tintuc` | `phanloai` | `Tin moi`, `Tin noi bat` |
| `tintuc` | `trangthai` | `Ban nhap`, `Da xuat ban`, `Da an` |
| `hopdongvayvon` | `trangthai` | `Dang thuc hien`, `Da tat toan`, `Qua han` |
| `lichtrano` | `trangthai` | `Chua den han`, `Da tra`, `Qua han`, `Tra mot phan` |
| `nghiemthu` | `loaikiemtra` | `Kiem tra tien do`, `Nghiem thu cuoi cung` |
| `nghiemthu` | `ketqua` | `Cho danh gia`, `Dat`, `Dat co dieu chinh`, `Khong dat` |
| `dutoanhangnam` | `trangthai` | `Cho duyet`, `Da duyet`, `Tu choi` |
| `guest_khoantaitro` | `hinhthuc` | `Tien mat`, `Chuyen khoan`, `Khac` |
| `guest_khoantaitro` | `trang_thai_staging` | `CHO_XAC_MINH`, `DA_CHUYEN`, `HET_HAN` |
| `guest_yeucauhotro` | `trang_thai_staging` | `CHO_XAC_MINH`, `DA_CHUYEN`, `HET_HAN` |

---

## 5. Ghi chú

- **`danhgia`**: Bảng bị corrupt trong InnoDB engine. Schema có trong SQL dump gốc nhưng không query được.
- **`yeucauhotro.trangthai`**: Luồng duyệt 3 cấp → giải ngân → nghiệm thu. Mỗi cấp có 3 trạng thái (Chờ duyệt, Đã duyệt, Từ chối).
- **`giaodich.loaigiaodich`**: `Thu` = tiền vào quỹ, `Chi` = tiền ra quỹ, `Thu hoi no` = thu hồi khoản vay.
- **`giaodich.hangmucchi`**: Chỉ điền khi `loaigiaodich = 'Chi'`.
- **`phanbongansach.namtaichinh`**: Dùng để lọc phân bổ theo năm tài chính (cột `year(4)`).
- **`quy.loaidieuhanh`**: `Tap trung - Be chung` = tiền gộp vào bể lớn, `Tap trung - Muc chi` = tiền riêng theo mục chi.
- **`quy.quy_cha_id`**: Self-reference FK. Quỹ con trỏ đến quỹ cha (bể tiền lớn).
