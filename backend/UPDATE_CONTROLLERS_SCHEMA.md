# CẬP NHẬT CONTROLLERS - DATABASE MIGRATION

## 📋 DANH SÁCH TÊN BẢN MIGRATION:

### Tên bảng (Table names):
| Cũ | Mới |
|----|-----|
| `Quy` | `quy` |
| `NhaTaiTro` | `nhataitro` |
| `KhoanTaiTro` | `khoantaitro` |
| `YeuCauHoTro` | `yeucauhotro` |
| `nguoidung` | `nguoidung` (giữ nguyên) |
| `vaitro` | `vaitro` (giữ nguyên) |
| `GiaoDich` | `giaodich` |
| `pheduyet` | `pheduyet` (giữ nguyên) |
| `taikhoannganhang` | `taikhoannganhang` (giữ nguyên) |
| `sinhviennoibat` | `sinhviennoibat` (giữ nguyên) |
| `nhat_ky_he_thong` | `nhatkyhethong` |

### Tên cột (Column names) - QUAN TRỌNG NHẤT:

#### Bảng vaitro:
- `role_id` → `vaitro_id`
- `ten_vai_tro` → `tenvaitro`
- `mo_ta` → `mota`
- `trang_thai` → `trangthai`
- `created_at` → `ngaytao`
- `updated_at` → `ngaycapnhat`

#### Bảng nguoidung:
- `user_id` → `nguoidung_id`
- `ma_so_dinh_danh` → `masodinhdanh`
- `ho_ten` → `hoten`
- `mat_khau` → `matkhau`
- `ngay_sinh` → `ngaysinh`
- `gioi_tinh` → `gioitinh`
- `so_dien_thoai` → `sodienthoai`
- `dia_chi` → `diachi`
- `khoa_phong` → `khoaphong`
- `nganh_hoc` → `nganhhoc`
- `khoa_hoc` → `khoahoc`
- `so_tai_khoan` → `sotaikhoan`
- `ngan_hang` → `nganhang`
- `chu_tai_khoan` → `chutaikhoan`
- `role_id` → `vaitro_id`
- `loai_tai_khoan` → **XÓA**
- `trang_thai` → `trangthai`
- `created_at` → `ngaytao`
- `updated_at` → `ngaycapnhat`

#### Bảng quy:
- `quy_id` → `quy_id` (giữ nguyên)
- `ten_quy` → `tenquy`
- `loai_quy` → `loaiquy_id` (đổi thành FK)
- `mo_ta` → `mota`
- `hinh_anh` → `hinhanh`
- `so_tien_toi_thieu` → **XÓA**
- `so_tien_toi_da` → **XÓA**
- `so_tien_muc_tieu` → `sotienmuctieu`
- `so_luong_chi_tieu` → `soluonghotrotoida`
- `han_nop_don` → **XÓA**
- `dieu_kien_tom_tat` → `dieukienhotro`
- `so_du` → `sodu`
- `nguoi_tao_id` → `nguoitao_id`
- `trang_thai` → `trangthai`
- `ngay_tao` → `ngaytao`
- `ngay_cap_nhat` → `ngaycapnhat`

#### Bảng nhataitro:
- `nha_tai_tro_id` → `nhataitro_id`
- `user_id` → `nguoidung_id`
- `ten_nha_tai_tro` → `tennhataitro`
- `loai` → `loainhataitro`
- `so_dien_thoai` → `sodienthoai`
- `dia_chi` → `diachi`
- `tong_so_tien_da_tai_tro` → **XÓA** (tính động)
- `so_lan_tai_tro` → **XÓA** (tính động)
- `so_quy_da_ho_tro` → **XÓA** (tính động)
- `lan_tai_tro_gan_nhat` → **XÓA** (tính động)
- `created_at` → `ngaytao`
- `updated_at` → `ngaycapnhat`

#### Bảng khoantaitro:
- `khoan_tai_tro_id` → `khoantaitro_id`
- `nha_tai_tro_id` → `nhataitro_id`
- `quy_id` → `quy_id` (giữ nguyên)
- `so_tien` → `sotien`
- `hinh_anh_minh_chung` → `chungtu`
- `ngay_tai_tro` → `ngaytaitro`
- `trang_thai` → `trangthai`
- `ghi_chu` → `ghichu`
- `nguoi_xac_nhan_id` → `nguoixacnhan_id`
- `ngay_xac_nhan` → `ngayxacnhan`
- `ngay_cap_nhat` → `ngaycapnhat`
- `created_at` → `ngaytao`

#### Bảng yeucauhotro:
- `request_id` → `yeucauhotro_id`
- `user_id` → `nguoidung_id`
- `quy_id` → `quy_id` (giữ nguyên)
- `tieu_de` → **XÓA**
- `mo_ta` → `lydo`
- `so_tien_yeu_cau` → `sotiendenghi`
- `file_dinh_kem` → `tailieudinhkem`
- `trang_thai` → `trangthai`
- `ly_do_tu_choi` → `ghichu`
- `ngay_tao` → `ngaynop`
- `ngay_cap_nhat` → `ngaycapnhat`

#### Bảng giaodich:
- `transaction_id` → `giaodich_id`
- `khoan_tai_tro_id` → **XÓA**
- `request_id` → `yeucauhotro_id`
- `nguoi_tao_id` → `nguoithuchien_id`
- `nguoi_nhan_id` → `nguoinhan_id`
- `loai` → **XÓA**
- `so_tien` → `sotien`
- `trang_thai` → `trangthai`
- `minh_chung_chuyen_khoan` → `chungtu`
- `ghi_chu` → `ghichu`
- `ngay_giao_dich` → `ngaygiaodich`
- `ngay_cap_nhat` → `ngaycapnhat`
- `doi_soat_trang_thai` → **XÓA**

#### Bảng pheduyet:
- `phe_duyet_id` → `pheduyet_id`
- `request_id` → `yeucauhotro_id`
- `nguoi_duyet_id` → `nguoiduyet_id`
- `cap_do_duyet` → `capduyet`
- `ket_qua` → `ketqua`
- `ghi_chu` → `ghichu`
- `ly_do_tu_choi` → `lydo`
- `ngay_tao` → **XÓA**
- `ngay_duyet` → `ngayduyet`
- `ngay_cap_nhat` → **XÓA**

#### Bảng sinhviennoibat:
- `id` → `sinhviennoibat_id`
- `user_id` → `nguoidung_id`
- `ho_ten` → `hoten`
- `khoa_phong` → `khoaphong`
- `nam_hoc` → `namhoc`
- `hinh_anh` → `hinhanh`
- `thanh_tich` → `thanhtich`
- `thu_tu` → `thutu`
- `trang_thai` → `trangthai`
- `ngay_tao` → `ngaytao`
- `ngay_cap_nhat` → `ngaycapnhat`

#### Bảng nhatkyhethong:
- `log_id` → `nhatkyhethong_id`
- `nguoi_dung_id` → `nguoidung_id`
- `hanh_dong` → `hanhdong`
- `loai_doi_tuong` → `loaidoituong`
- `doi_tuong_id` → `doituong_id`
- `mo_ta` → `mota`
- `du_lieu_cu` → `dulieucu`
- `du_lieu_moi` → `dulieumoi`
- `ip_address` → `ipaddress`
- `created_at` → `createdat`

### ENUM Values:
| Cũ | Mới |
|----|-----|
| `'HOAT_DONG'` | `'Hoat dong'` |
| `'KHOA'` | `'Khoa'` |
| `'TAM_DUNG'` | `'Tam dung'` |
| `'SINH_VIEN'` | `'Sinh vien'` |
| `'NHA_TAI_TRO'` | `'Nha tai tro'` |
| `'Dang hoat dong'` | `'Dang hoat dong'` (giữ nguyên) |
| `'Da duyet'` | `'Da duyet cap 3'` (cho yeucauhotro) |
| `'Cho duyet'` | `'Cho duyet cap 1'` (cho yeucauhotro)|

## 🔧 CẦN CẬP NHẬT TRONG CÁC CONTROLLERS:

### 1. systemController.js
- [x] Line 57: `SELECT role_id, ten_vai_tro` → `SELECT vaitro_id, tenvaitro`
- [x] Line 90: `SELECT * FROM vaitro WHERE role_id` → `SELECT * FROM vaitro WHERE vaitro_id`
- [x] Line 133: `UPDATE vaitro SET` → giữ nguyên
- [x] Line 189: Tất cả queries trong getNguoiDung cần update column names
- [x] Line 274-302: Tất cả queries trong getNhatKy cần update

### 2. userController.js  
- [x] Line 110-113: `INSERT INTO nhataitro` cần update column names
- [x] Line 320-323: `UPDATE nhataitro SET` cần update column names

### 3. baoCaoController.js
- [x] Line 47: `SELECT ten_quy FROM Quy` → `SELECT tenquy FROM quy`
- [x] Tất cả các query trong file này cần update (rất nhiều!)

### 4. pheDuyetController.js
- [x] Tất cả queries cần update theo schema mới

### 5. statisticsController.js
- [x] Tất cả queries cần update theo schema mới

## ⚠️ LƯU Ý:
- Controllers KHÔNG SỬ DỤNG Model sẽ có NHIỀU query trực tiếp → cần update từng query
- Ưu tiên update: systemController, baoCaoController, statisticsController, pheDuyetController
- Các controller khác thông qua Model đã được update rồi nên ít lỗi hơn
