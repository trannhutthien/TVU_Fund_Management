# TVU Fund Management — Database Schema Reference

> **Database:** `tvu_fund_management` · **Charset:** utf8mb4 · **Engine:** InnoDB
> **Cập nhật:** 2026-08-23 · **Source:** Aiven Cloud production + migrations

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
| 22 | `guest_tracking` | Tracking đơn khách (thay thế 2 bảng cũ) | 2 |
| 23 | `danhgia` | Đánh giá / phản hồi | 0 |
| 24 | `chucvuquy` | Chức vụ tổ chức trong Quỹ | 0 |
| 25 | `thong_bao` | Thong bao trong he thong (bell notification) | 0 |
| 26 | `chitiet_dutoan` | Chi tiet khoan chi cua de xuat du toan | 0 |
| 27 | `dexuatchuongtrinh` | Đề xuất chương trình mới từ nhà tài trợ (3-cấp duyệt) | 0 |

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

### 2.2 `donvihoc` — Đơn vị học (Danh mục Khoa/Trường TVU)

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `donvihoc_id` | int(11) | NO | PK | Mã tự tăng |
| `madonvi` | varchar(20) | NO | UNIQUE | Mã khoa/trường (VD: `TVU-CNTT`) |
| `tenkhoa` | varchar(200) | NO | | Tên khoa/trường quy chuẩn |
| `trangthai` | enum | YES | `'Hoat dong'` | `Hoat dong` · `Ngung hoat dong` |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |

> **Bảng danh mục quy chuẩn (3NF)**: Quản lý danh sách 17 Khoa quy chuẩn của Đại học Trà Vinh. Đã tinh gọn hoàn toàn 4 cột thừa (`lop`, `khoahoc`, `mota`, `tennganh`). Cột `lop` (mã lớp riêng của sinh viên) được lưu trực tiếp tại thuộc tính `nguoidung.lop`.

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
| `donvihoc_id` | int(11) | YES | NULL | FK → `donvihoc` (Khoa/Trường) |
| `lop` | varchar(100) | YES | NULL | Mã lớp riêng của sinh viên (VD: `DA21TTA`) |
| `avatar` | varchar(255) | YES | NULL | |
| `vaitro_id` | int(11) | NO | | FK → `vaitro` (1=Admin, 2=KT, 3=UBQL) |
| `loaitaikhoan` | enum | YES | NULL | `Sinh vien` · `Nha tai tro` · `Can bo` · `Nha khoa hoc` |
| `tinhtrangcongtac` | enum | YES | NULL | `Dang cong tac` · `Da nghi huu` (chỉ khi loaitaikhoan='Can bo') |
| `donvicongtac` | varchar(200) | YES | NULL | Đơn vị công tác |
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
| `loaihotro` | enum | YES | `'Tai tro khong hoan lai'` | `Tai tro khong hoan lai` · `Tai tro co thu hoi` · `Cho vay` |
| `tilethuhoi` | decimal(5,2) | YES | NULL | Tỷ lệ thu hồi (%). VD: 30 = 30%. Chỉ dùng cho `loaihotro` có thu hồi/cho vay |

---

### 2.7 `nhataitro` — Nhà tài trợ

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `nhataitro_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `tennhataitro` | varchar(200) | NO | | Tên NTT |
| `loainhataitro` | enum | NO | | `Ca nhan` · `To chuc` · `Doanh nghiep` |
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
| `trangthai` | enum(23) | YES | `'Cho duyet cap 1'` | Xem chi tiết bên dưới (23 trạng thái) |
| `ghichu` | text | YES | NULL | |
| `ngaynop` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngaycapnhat` | timestamp | NO | CURRENT_TIMESTAMP | ON UPDATE |
| `loaihotro` | enum | YES | `'Tai tro khong hoan lai'` | `Tai tro khong hoan lai` · `Tai tro co thu hoi` · `Cho vay` |
| `canghiemthu` | tinyint(1) | NO | 0 | 1 = cần nghiệm thu (Điều 15 Điều lệ) |
| `tongkinhphidudan` | decimal(15,2) | YES | NULL | Tổng kinh phí dự kiến |
| `tieu_de` | varchar(200) | YES | NULL | Tiêu đề đơn |
| `ladetai` | tinyint(1) | YES | 0 | 1 = đề tài/dự án nghiên cứu (cần nghiệm thu theo Điều 15b,c) |

> **UI Label Mapping (2026-08-23):** Giá trị enum DB giữ nguyên, chỉ thay nhãn hiển thị trên giao diện:
> - `Tai tro khong hoan lai` → **Tài trợ không thu hồi**
> - `Tai tro co thu hoi` → **Tài trợ thu hồi một phần**
> - `Cho vay` → **Tài trợ thu hồi toàn phần**

**Enum `trangthai` (23 giá trị):**
`Cho duyet cap 1` · `Da duyet cap 1` · `Tu choi cap 1` · `Cho duyet cap 2` · `Da duyet cap 2` · `Tu choi cap 2` · `Cho duyet cap 3` · `Da duyet cap 3` · `Tu choi cap 3` · `Cho giai ngan` · `Da giai ngan` · `Cho nghiem thu` · `Da nghiem thu` · `Nghiem thu khong dat` · `Tu choi` · `Cho giai ngan dot 1` · `Da giai ngan dot 1` · `Cho nghiem thu dot 1` · `Da nghiem thu dot 1` · `Cho giai ngan dot 2` · `Da giai ngan dot 2` · `Dang thu hoi no` · `Hoan thanh`

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
| `ngaybatdau` | date | YES | NULL | Ngày bắt đầu đợt |
| `ngayketthuc` | date | YES | NULL | Ngày kết thúc đợt |
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
| `trangthai` | enum | NO | `'Chua thu'` | `Chua thu` · `Dang thu` · `Da thu het` |
| `ngaybatdauthuhoi` | date | YES | NULL | Ngày bắt đầu thu hồi |
| `sotiendadathu` | decimal(15,2) | NO | 0.00 | Số tiền đã thu hồi |
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
| `sotien_dot1` | decimal(15,2) | YES | NULL | Số tiền giải ngân đợt 1 (50%) |
| `sotien_dot2` | decimal(15,2) | YES | NULL | Số tiền giải ngân đợt 2 (50%) |
| `ngay_giai_ngan_dot1` | date | YES | NULL | Ngày giải ngân đợt 1 |
| `ngay_giai_ngan_dot2` | date | YES | NULL | Ngày giải ngân đợt 2 |
| `lan_nghiem_thu_dat` | int(11) | YES | 0 | Số lần nghiệm thu cuối cùng đạt |
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
| `trangthaixacnhan` | enum | NO | `'Cho xac nhan'` | `Cho xac nhan` · `Da xac nhan` · `Bi tu choi` |
| `sotienlaiphat` | decimal(15,2) | YES | NULL | Tien lai phat qua han (tinh tu he so phat) |
| `ngayxacnhan` | datetime | YES | NULL | Thời điểm xác nhận |
| `nguoiduyet_id` | int(11) | YES | NULL | FK → `nguoidung` (người xác nhận) |
| `minhchungtrano` | varchar(255) | YES | NULL | File minh chứng trả nợ |
| `ghichuxacnhan` | text | YES | NULL | Ghi chú xác nhận |
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
| `dotgiaingan` | int(11) | YES | 1 | Đợt giải ngân (1 hoặc 2) |
| `ngaynghiemthu` | timestamp | YES | NULL | |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |

---

### 2.21 `dutoanhangnam` — Dự toán bộ máy hoạt động

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `dutoanhangnam_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `namtaichinh` | int(11) | NO | | Nam tai chinh |
| `capduyet` | tinyint(4) | NO | 1 | Cap duyet: 1=Hoi dong Quyc, 2=Hieu truong |
| `parent_id` | int(11) | YES | NULL | FK self-ref → `dutoanhangnam` (cap 2 link ve cap 1) |
| `sotiendutoan` | decimal(15,2) | NO | | So tien du toan |
| `trangthai` | enum | NO | `'Cho duyet'` | `Cho duyet` · `Da duyet` · `Tu choi` |
| `trangthai_tong` | enum | YES | NULL | Trang thai tong hop: `Cho duyet` · `Da duyet` · `Tu choi` |
| `lydotuchoi` | text | YES | NULL | |
| `lydodeXuat` | text | YES | NULL | Ly do de xuat du toan |
| `fileMinhChung` | varchar(500) | YES | NULL | File minh chung dinh kem |
| `nguoidexuat_id` | int(11) | NO | | FK → `nguoidung` |
| `nguoiduyet_id` | int(11) | YES | NULL | FK → `nguoidung` |
| `ngaydexuat` | timestamp | NO | CURRENT_TIMESTAMP | |
| `ngayduyet` | timestamp | YES | NULL | |
| `ghichu` | text | YES | NULL | |

**Luu y:** UNIQUE constraint la `(namtaichinh, capduyet)` — moi nam chi co 1 de xuat moi cap.

---

### 2.22 `guest_tracking` — Tracking đơn khách

> **Thay thế** 2 bảng cũ `guest_khoantaitro` + `guest_yeucauhotro` (đơn giản hóa, giảm từ 45 cột xuống 10 cột). Dữ liệu form lưu trong JWT token (stateless), bảng này chỉ track minimal info.

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `tracking_uuid` | varchar(36) | NO | PK | UUID theo dõi |
| `hoten` | varchar(100) | NO | | Họ tên khách |
| `email` | varchar(100) | NO | | Email khách |
| `loai` | enum | NO | | `yeucauhotro` · `khoantaitro` |
| `quy_id` | int(11) | NO | | Tham chiếu `quy` (không FK) |
| `sotien` | decimal(15,2) | NO | | Số tiền |
| `otp_hash` | varchar(64) | YES | NULL | Hash của OTP 6 chữ số |
| `doituong_id` | int(11) | YES | NULL | ID trong `yeucauhotro`/`khoantaitro` sau migrate |
| `nguoidung_id` | int(11) | YES | NULL | ID trong `nguoidung` sau migrate |
| `trangthai` | varchar(30) | YES | `'CHO_XAC_MINH'` | `CHO_XAC_MINH` · `DA_CHUYEN` · `HET_HAN` |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |

**Indexes:** `idx_email`, `idx_trangthai`, `idx_otp_hash`

**Luồng:** Submit → INSERT guest_tracking (CHO_XAC_MINH) → Verify OTP → create main records + UPDATE guest_tracking (DA_CHUYEN)

---

### 2.23 `danhgia` — Đánh giá / phản hồi

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

### 2.24 `chucvuquy` — Chức vụ tổ chức trong Quỹ

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `chucvu_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `nguoidung_id` | int(11) | YES | NULL | FK → `nguoidung` (ON DELETE SET NULL) |
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

### 2.25 `thong_bao` — Thong bao trong he thong

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `thong_bao_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `nguoidung_id` | int(11) | NO | | FK → `nguoidung` |
| `loaithongbao` | varchar(30) | NO | `'hethong'` | `thanhtoan` · `nhacno` · `hethong` |
| `tieude` | varchar(255) | NO | | Tieu de thong bao |
| `noidung` | text | NO | | Noi dung chi tiet |
| `daDoc` | tinyint(1) | NO | 0 | 0=Chua doc, 1=Da doc |
| `duongdan` | varchar(255) | YES | NULL | Link dieu huong (VD: `/cong-no/chi-tiet/1`) |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |

---

### 2.26 `chitiet_dutoan` — Chi tiet khoan chi du toan

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `chitiet_dutoan_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `dutoanhangnam_id` | int(11) | NO | | FK → `dutoanhangnam` (ON DELETE CASCADE) |
| `khoanchi` | varchar(200) | NO | | Ten khoan chi |
| `sotiendutoan` | decimal(15,2) | NO | 0.00 | So tien du toan cho khoan chi |
| `ghichu` | text | YES | NULL | Ghi chu |

---

### 2.27 `dexuatchuongtrinh` — Đề xuất chương trình mới từ nhà tài trợ

> **Luồng 3 cấp duyệt:** (1) Cán bộ duyệt nội dung → (2) Kế toán xác nhận tiền + cộng vào Quỹ Thành Phần (Cấp 2) → (3) Admin duyệt tạo hoạt động (Auto-tạo Quỹ Cấp 3). Xem chi tiết tại `backend/docs/PROPOSAL_APPROVAL_WORKFLOW.md`.

| Cột | Kiểu | Null | Default | Ghi chú |
|-----|------|------|---------|---------|
| `dexuatchuongtrinh_id` | int(11) | NO | PK AUTO_INCREMENT | |
| `quythanhphan_id` | int(11) | NO | | FK → `quy` (Quỹ Thành Phần - Cấp 2) |
| `khoantaitro_id` | int(11) | YES | NULL | FK → `khoantaitro` (nếu có khoản tài trợ liên quan) |
| `nhataitro_id` | int(11) | NO | | FK → `nhataitro` (Nhà tài trợ đề xuất) |
| `tenchuongtrinh` | varchar(255) | NO | | Tên chương trình đề xuất |
| `mota` | text | YES | NULL | Mô tả chi tiết chương trình |
| `soluongsuat` | int(11) | NO | | Số lượng suất hỗ trợ |
| `sotienmoisuat` | decimal(15,2) | NO | | Số tiền mỗi suất |
| `sotientaitro` | decimal(15,2) | YES | NULL | Tổng số tiền tài trợ (= soluongsuat × sotienmoisuat) |
| `mucthuhoi` | decimal(15,2) | YES | NULL | Số tiền thu hồi (VNĐ). Tính = sotientaitro × tilethuhoi / 100 |
| `tilethuhoi` | decimal(5,2) | YES | NULL | Tỷ lệ thu hồi (%) do nhà tài trợ đề xuất |
| `loaihotro` | enum | YES | `'Tien mat'` | `Tien mat` · `Hoc phi` · `Sinh hoat phi` · `Tai lieu` · `Khac` |
| `ngaybatdau` | date | YES | NULL | Ngày bắt đầu chương trình |
| `ngayketthuc` | date | YES | NULL | Ngày kết thúc chương trình |
| `trangthai` | enum | YES | `'Cho duyet'` | `Cho duyet` · `Can bo da duyet` · `Tu choi` · `Da nhan tien` · `Da tao hoat dong` |
| `lydotuchoi` | text | YES | NULL | Lý do từ chối (nếu có) |
| `nguoiduyet_id` | int(11) | YES | NULL | FK → `nguoidung` (backward compatibility, không dùng trong luồng mới) |
| `ngayduyet` | timestamp | YES | NULL | Ngày duyệt (backward compatibility) |
| `quyketqua_id` | int(11) | YES | NULL | FK → `quy` (Quỹ Hoạt Động - Cấp 3 sau khi tạo) |
| `ngaytao` | timestamp | NO | CURRENT_TIMESTAMP | |
| `canbo_duyet_id` | int(11) | YES | NULL | FK → `nguoidung` (Cán bộ duyệt nội dung - Bước 1) |
| `ngay_canbo_duyet` | datetime | YES | NULL | Ngày cán bộ duyệt |
| `ghi_chu_canbo` | text | YES | NULL | Ghi chú của cán bộ |
| `ketoan_xacnhan_id` | int(11) | YES | NULL | FK → `nguoidung` (Kế toán xác nhận tiền - Bước 2) |
| `ngay_ketoan_xacnhan` | datetime | YES | NULL | Ngày kế toán xác nhận |
| `so_tien_thuc_te` | decimal(15,2) | YES | NULL | Số tiền thực tế nhận được (có thể khác với đề xuất) |
| `admin_duyet_id` | int(11) | YES | NULL | FK → `nguoidung` (Admin duyệt tạo hoạt động - Bước 3) |
| `ngay_admin_duyet` | datetime | YES | NULL | Ngày admin duyệt |
| `ghi_chu_admin` | text | YES | NULL | Ghi chú của admin |

**Enum `trangthai` (5 giá trị):**
- `Cho duyet`: Mới tạo, chờ cán bộ duyệt
- `Can bo da duyet`: Cán bộ đã duyệt, chờ kế toán xác nhận tiền
- `Tu choi`: Cán bộ từ chối
- `Da nhan tien`: Kế toán đã xác nhận tiền + cộng vào Quỹ Thành Phần
- `Da tao hoat dong`: Admin đã tạo hoạt động (Quỹ Cấp 3) - Hoàn tất

**Enum `loaihotro` (5 giá trị):**
`Tien mat` · `Hoc phi` · `Sinh hoat phi` · `Tai lieu` · `Khac`

**Luồng tiền:**
```
Nhà Tài Trợ → (Bước 2: Kế toán xác nhận) → Quỹ Thành Phần (Cấp 2)
                                              ↓
                         (Bước 3: Admin tạo hoạt động) → Quỹ Hoạt Động (Cấp 3)
```

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
| `dutoanhangnam` | `parent_id` | `dutoanhangnam` (self) | SET NULL | — |
| `thong_bao` | `nguoidung_id` | `nguoidung` | CASCADE | CASCADE |
| `chitiet_dutoan` | `dutoanhangnam_id` | `dutoanhangnam` | CASCADE | — |
| `dexuatchuongtrinh` | `quythanhphan_id` | `quy` | — | CASCADE |
| `dexuatchuongtrinh` | `khoantaitro_id` | `khoantaitro` | SET NULL | CASCADE |
| `dexuatchuongtrinh` | `nhataitro_id` | `nhataitro` | — | CASCADE |
| `dexuatchuongtrinh` | `nguoiduyet_id` | `nguoidung` | SET NULL | CASCADE |
| `dexuatchuongtrinh` | `quyketqua_id` | `quy` | SET NULL | CASCADE |
| `dexuatchuongtrinh` | `canbo_duyet_id` | `nguoidung` | SET NULL | CASCADE |
| `dexuatchuongtrinh` | `ketoan_xacnhan_id` | `nguoidung` | SET NULL | CASCADE |
| `dexuatchuongtrinh` | `admin_duyet_id` | `nguoidung` | SET NULL | CASCADE |

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
| `quy` | `loaihotro` | `Tai tro khong hoan lai`, `Tai tro co thu hoi`, `Cho vay` (UI: Tài trợ không thu hồi, Tài trợ thu hồi một phần, Tài trợ thu hồi toàn phần) |
| `nhataitro` | `loainhataitro` | `Ca nhan`, `To chuc`, `Doanh nghiep`, `Doi tac` |
| `nhataitro` | `trangthai` | `Hoat dong`, `Ngung hoat dong` |
| `khoantaitro` | `hinhthuc` | `Tien mat`, `Chuyen khoan`, `Khac` |
| `khoantaitro` | `trangthai` | `Cho duyet`, `Da duyet`, `Da nhan`, `Tu choi` |
| `yeucauhotro` | `loaihotro` | `Tai tro khong hoan lai`, `Tai tro co thu hoi`, `Cho vay` (UI: Tài trợ không thu hồi, Tài trợ thu hồi một phần, Tài trợ thu hồi toàn phần) |
| `yeucauhotro` | `trangthai` | `Cho duyet cap 1`, `Da duyet cap 1`, `Tu choi cap 1`, `Cho duyet cap 2`, `Da duyet cap 2`, `Tu choi cap 2`, `Cho duyet cap 3`, `Da duyet cap 3`, `Tu choi cap 3`, `Cho giai ngan`, `Da giai ngan`, `Cho nghiem thu`, `Da nghiem thu`, `Nghiem thu khong dat`, `Tu choi`, `Cho giai ngan dot 1`, `Da giai ngan dot 1`, `Cho nghiem thu dot 1`, `Da nghiem thu dot 1`, `Cho giai ngan dot 2`, `Da giai ngan dot 2`, `Dang thu hoi no`, `Hoan thanh` |
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
| `lichtrano` | `trangthaixacnhan` | `Cho xac nhan`, `Da xac nhan`, `Bi tu choi` |
| `dieukhoanthuhoi` | `trangthai` | `Chua thu`, `Dang thu`, `Da thu het` |
| `nghiemthu` | `loaikiemtra` | `Kiem tra tien do`, `Nghiem thu cuoi cung` |
| `nghiemthu` | `ketqua` | `Cho danh gia`, `Dat`, `Dat co dieu chinh`, `Khong dat` |
| `dutoanhangnam` | `trangthai` | `Cho duyet`, `Da duyet`, `Tu choi` |
| `thong_bao` | `loaithongbao` | `thanhtoan`, `nhacno`, `hethong` |
| `guest_tracking` | `loai` | `yeucauhotro`, `khoantaitro` |
| `guest_tracking` | `trangthai` | `CHO_XAC_MINH`, `DA_CHUYEN`, `HET_HAN` |
| `dexuatchuongtrinh` | `trangthai` | `Cho duyet`, `Can bo da duyet`, `Tu choi`, `Da nhan tien`, `Da tao hoat dong` |
| `dexuatchuongtrinh` | `loaihotro` | `Tien mat`, `Hoc phi`, `Sinh hoat phi`, `Tai lieu`, `Khac` |

---

## 5. Ghi chú

- **`danhgia`**: Bảng bị corrupt trong InnoDB engine. Schema có trong SQL dump gốc nhưng không query được.
- **`yeucauhotro.trangthai`**: Luồng duyệt 3 cấp → giải ngân → nghiệm thu. Mỗi cấp có 3 trạng thái (Chờ duyệt, Đã duyệt, Từ chối). Có 22 trạng thái tổng cộng.
- **`yeucauhotro.canghiemthu`**: Được xác định tự động theo Điều 15 Điều lệ:
  * **Cần nghiệm thu (=1)**: (b,c) Đề tài/dự án nghiên cứu (`ladetai=1`), (d,e) Cho vay (`loaihotro='Cho vay'`), Tài trợ có thu hồi (`loaihotro='Tai tro co thu hoi'`)
  * **Không cần nghiệm thu (=0)**: (a) Hỗ trợ thường (học bổng, CSVC, sự kiện) - `loaihotro='Tai tro khong hoan lai'` và `ladetai=0`
- **`giaodich.loaigiaodich`**: `Thu` = tiền vào quỹ, `Chi` = tiền ra quỹ, `Thu hoi no` = thu hồi khoản vay.
- **`giaodich.hangmucchi`**: Chỉ điền khi `loaigiaodich = 'Chi'`.
- **`phanbongansach.namtaichinh`**: Dùng để lọc phân bổ theo năm tài chính (cột `year(4)`).
- **`quy.loaidieuhanh`**: `Tap trung - Be chung` = tiền gộp vào bể lớn, `Tap trung - Muc chi` = tiền riêng theo mục chi.
- **`quy.quy_cha_id`**: Self-reference FK. Quỹ con trỏ đến quỹ cha (bể tiền lớn).
- **`dutoanhangnam`**: 2 cap duyet — cap 1 (Hoi dong Quyc) va cap 2 (Hieu truong). Cap 2 link ve cap 1 qua `parent_id`. `trangthai_tong` la trang thai tong hop ca 2 cap.
- **`chitiet_dutoan`**: Chi tiet tung khoan chi trong de xuat du toan. Moi de xuat co nhieu chi tiet.
- **`thong_bao`**: Thong bao trong he thong (bell notification). `daDoc=0` la chua doc, `daDoc=1` la da doc.
- **`lichtrano.sotienlaiphat`**: Tinh theo cong thuc: `GocConLai x LaiSuatPhat x SoNgayQH / 365`. LaiSuatPhat = LaiSuatThamChieu x HeSoPhat (he so mac dinh = 2).
- **`nhataitro.logo`**: Đường dẫn file logo nhà tài trợ (upload qua `POST /api/upload/donor`, lưu tại `uploads/avatars/donor/`). Được hiển thị trên trang vinh danh (donor wall) và trang đối tác staff. Camera button trong drawer cho phép cập nhật logo trực tiếp.
- **`khoantaitro.chungtu`**: File minh chứng chuyển khoản (upload qua `POST /api/upload/public` bởi khách, hoặc `POST /api/upload` bởi user đã đăng nhập). Được sử dụng trong quy trình đóng góp `/dong-gop`: nhà tài trợ upload ảnh minh chứng CK, lưu vào trường này để kế toán đối soát.
- **`nhataitro.loainhataitro`**: Giá trị `Doi tac` được dùng cho tab "Đối tác" trên trang staff — hiển thị nhà tài trợ dạng card logo + tên (đơn giản, không stats).
- **`guest_tracking`**: Thay thế 2 bang cu `guest_khoantaitro` + `guest_yeucauhotro`. Du lieu form luu trong JWT token (stateless), bang nay chi track minimal info (uuid, ten, email, loai, quy, sotien, otp_hash). Luong: Submit → INSERT (CHO_XAC_MINH) → Verify OTP → create main records + UPDATE (DA_CHUYEN).
- **`hopdongvayvon` 2 giai doan**: `sotien_dot1` = 50% so tien vay, `sotien_dot2` = 50% con lai. `lan_nghiem_thu_dat` dem so lan nghiem thu cuoi cung dat. Can 2/3 lan dat de chuyen dot 2.
- **`nghiemthu.dotgiaingan`**: Phan biet nghiem thu dot 1 (1) va dot 2 (2). Chi dem ket qua `'Nghiem thu cuoi cung'` khi tinh 2/3 threshold.
- **`yeucauhotro.trangthai` 2 giai doan**: Them cac trang thai: `Cho giai ngan dot 1`, `Da giai ngan dot 1`, `Cho nghiem thu dot 1`, `Da nghiem thu dot 1`, `Cho giai ngan dot 2`, `Dang thu hoi no`, `Hoan thanh`.
- **`dexuatchuongtrinh` — Quy trình 3 cấp duyệt đề xuất chương trình**: 
  * **Bước 1 — Cán bộ duyệt nội dung**: Kiểm tra tính hợp lệ, có thể sửa `quythanhphan_id` nếu nhà tài trợ chọn sai. Trạng thái: `Cho duyet` → `Can bo da duyet` hoặc `Tu choi`.
  * **Bước 2 — Kế toán xác nhận tiền**: Xác nhận đã nhận tiền thực tế, **cộng tiền vào Quỹ Thành Phần (Cấp 2)**, tạo giao dịch `Thu`. Trạng thái: `Can bo da duyet` → `Da nhan tien`.
  * **Bước 3 — Admin tạo hoạt động**: Kiểm tra ngân sách Quỹ Thành Phần, **tạo Quỹ Cấp 3 (Hoạt động)**, **trích tiền từ Quỹ Thành Phần → Quỹ Hoạt Động**, tạo bản ghi `phanbongansach`. Trạng thái: `Da nhan tien` → `Da tao hoat dong`.
  * **Luồng tiền**: Nhà Tài Trợ → (Kế toán xác nhận) → Quỹ Thành Phần (Cấp 2) → (Admin tạo hoạt động) → Quỹ Hoạt Động (Cấp 3).
  * **Lý do thiết kế**: Đảm bảo tiền được cộng vào Quỹ Thành Phần trước khi trích ra tạo hoạt động, tạo chuỗi trách nhiệm rõ ràng và audit trail đầy đủ.
  * **Backward compatibility**: Các cột `nguoiduyet_id`, `ngayduyet` được giữ lại để tương thích với dữ liệu cũ, nhưng không sử dụng trong luồng mới.

---

## 6. Logic nghiệm thu (Verification Logic)

### 6.1 Đơn CHO VAY (loaihotro = 'Cho vay')

#### Đợt 1:
- **Nghiệm thu ĐẠT**: Cần 2/3 lần "Nghiệm thu cuối cùng" có kết quả "Đạt" hoặc "Đạt có điều chỉnh"
  * Nếu đạt ≥2 lần: `trangthai` → `'Cho giai ngan dot 2'`
  * Nếu có 3 lần nghiệm thu mà chỉ đạt <2 lần: `trangthai` → `'Dang thu hoi no'` + Tạo điều khoản thu hồi + Cập nhật lịch trả nợ (xóa kỳ 2, cập nhật kỳ 1 với thời hạn 3 tháng)
- **Nghiệm thu KHÔNG ĐẠT**: Ngay lập tức chuyển `trangthai` → `'Dang thu hoi no'` + Tạo điều khoản thu hồi + Cập nhật lịch trả nợ

#### Đợt 2:
- **Nghiệm thu ĐẠT**: Chuyển `trangthai` → `'Hoan thanh'` + Tăng `hopdongvayvon.lan_nghiem_thu_dat`
- **Nghiệm thu KHÔNG ĐẠT**: Chuyển `trangthai` → `'Dang thu hoi no'` + Tạo điều khoản thu hồi + Cập nhật lịch trả nợ

### 6.2 Đơn TÀI TRỢ CÓ THU HỒI (loaihotro = 'Tai tro co thu hoi')

⚠️ **HIỆN TRẠNG (Cần xem xét lại):**
- **Nghiệm thu ĐẠT**: Chỉ cần 1 lần đạt → Chuyển `trangthai` → `'Da nghiem thu'` (KHÔNG giống Cho vay)
- **Nghiệm thu KHÔNG ĐẠT**: Chuyển `trangthai` → `'Nghiem thu khong dat'` (KHÔNG tạo điều khoản thu hồi)

⚠️ **VẤN ĐỀ**: Logic hiện tại không xử lý "Tài trợ có thu hồi" giống "Cho vay" (không có yêu cầu 2/3 lần, không tạo điều khoản thu hồi khi không đạt). Cần làm rõ quy tắc nghiệp vụ.

### 6.3 Đơn TÀI TRỢ KHÔNG HOÀN LẠI (loaihotro = 'Tai tro khong hoan lai')

- Nếu `canghiemthu = 0`: Không cần nghiệm thu
- Nếu `canghiemthu = 1` (đề tài/dự án nghiên cứu):
  * **Nghiệm thu ĐẠT**: Chuyển `trangthai` → `'Da nghiem thu'`
  * **Nghiệm thu KHÔNG ĐẠT**: Chuyển `trangthai` → `'Nghiem thu khong dat'`

### 6.4 Loại nghiệm thu (nghiemthu.loaikiemtra)

- **Kiểm tra tiến độ** (`'Kiem tra tien do'`): Không ảnh hưởng đến trạng thái đơn
- **Nghiệm thu cuối cùng** (`'Nghiem thu cuoi cung'`): Ảnh hưởng đến trạng thái đơn theo logic trên

### 6.5 Kết quả nghiệm thu (nghiemthu.ketqua)

- `'Cho danh gia'`: Chưa duyệt (mặc định khi tạo)
- `'Dat'`: Đạt
- `'Dat co dieu chinh'`: Đạt có điều chỉnh (tính như Đạt)
- `'Khong dat'`: Không đạt
