# PHÂN TÍCH CẦN SỬA BACKEND SAU KHI ĐỔI TÊN DATABASE

## 📋 TỔNG QUAN
Database đã được đổi tên từ **snake_case với gạch dưới** sang **lowercase không dấu**.

---

## 🔍 SO SÁNH TÊN BẢNG

| Tên CŨ (Backend hiện tại) | Tên MỚI (Database) | Trạng thái |
|---------------------------|-------------------|-----------|
| `vaitro` | `vaitro` | ✅ Giống |
| `nguoidung` | `nguoidung` | ✅ Giống |
| `loaiquy` | `loaiquy` | ✅ Giống |
| `nhataitro` | `nhataitro` | ✅ Giống |
| `quy` | `quy` | ✅ Giống |
| `yeucauhotro` | `yeucauhotro` | ✅ Giống |
| `pheduyet` | `pheduyet` | ✅ Giống |
| `khoantaitro` | `khoantaitro` | ✅ Giống |
| `giaodich` | `giaodich` | ✅ Giống |
| `taikhoannganhang` | `taikhoannganhang` | ✅ Giống |
| `sinhviennoibat` | `sinhviennoibat` | ✅ Giống |
| `nhatkyhethong` | `nhatkyhethong` | ✅ Giống |

**KẾT LUẬN TÊN BẢNG**: ✅ **KHÔNG CẦN SỬA** - Tất cả tên bảng đã giống nhau

---

## 🔍 SO SÁNH TÊN CỘT

### 1. Bảng `vaitro`
| Tên CŨ (Backend) | Tên MỚI (Database) | Cần sửa |
|-----------------|-------------------|---------|
| `role_id` | `vaitro_id` | ❌ SAI |
| `ten_vai_tro` | `tenvaitro` | ❌ SAI |
| `mo_ta` | `mota` | ❌ SAI |
| `created_at` | `ngaytao` | ❌ SAI |
| `updated_at` | `ngaycapnhat` | ❌ SAI |

### 2. Bảng `nguoidung`
| Tên CŨ (Backend) | Tên MỚI (Database) | Cần sửa |
|-----------------|-------------------|---------|
| `user_id` | `nguoidung_id` | ❌ SAI |
| `ma_so_dinh_danh` | `masodinhdanh` | ❌ SAI |
| `ho_ten` | `hoten` | ❌ SAI |
| `mat_khau` | `matkhau` | ❌ SAI |
| `ngay_sinh` | `ngaysinh` | ❌ SAI |
| `gioi_tinh` | `gioitinh` | ❌ SAI |
| `so_dien_thoai` | `sodienthoai` | ❌ SAI |
| `dia_chi` | `diachi` | ❌ SAI |
| `khoa_phong` | `khoaphong` | ❌ SAI |
| `nganh_hoc` | `nganhhoc` | ❌ SAI |
| `khoa_hoc` | `khoahoc` | ❌ SAI |
| `so_tai_khoan` | `sotaikhoan` | ❌ SAI |
| `ngan_hang` | `nganhang` | ❌ SAI |
| `chu_tai_khoan` | `chutaikhoan` | ❌ SAI |
| `role_id` | `vaitro_id` | ❌ SAI |
| `trang_thai` | `trangthai` | ❌ SAI |
| `created_at` | `ngaytao` | ❌ SAI |
| `updated_at` | `ngaycapnhat` | ❌ SAI |

### 3. Bảng `loaiquy`
| Tên CŨ (Backend) | Tên MỚI (Database) | Cần sửa |
|-----------------|-------------------|---------|
| `loai_quy_id` | `loaiquy_id` | ❌ SAI |
| `ma_loai` | `maloai` | ❌ SAI |
| `ten_loai` | `tenloai` | ❌ SAI |
| `created_at` | `ngaytao` | ❌ SAI |

### 4. Bảng `nhataitro`
| Tên CŨ (Backend) | Tên MỚI (Database) | Cần sửa |
|-----------------|-------------------|---------|
| `nha_tai_tro_id` | `nhataitro_id` | ❌ SAI |
| `ten_nha_tai_tro` | `tennhataitro` | ❌ SAI |
| `loai` | `loainhataitro` | ❌ SAI |
| `so_dien_thoai` | `sodienthoai` | ❌ SAI |
| `dia_chi` | `diachi` | ❌ SAI |
| `mo_ta` | `mota` | ❌ SAI |
| `user_id` | `nguoidung_id` | ❌ SAI |
| `trang_thai` | `trangthai` | ❌ SAI |
| `created_at` | `ngaytao` | ❌ SAI |
| `updated_at` | `ngaycapnhat` | ❌ SAI |

### 5. Bảng `quy`
| Tên CŨ (Backend) | Tên MỚI (Database) | Cần sửa |
|-----------------|-------------------|---------|
| `quy_id` | `quy_id` | ✅ Giống |
| `ten_quy` | `tenquy` | ❌ SAI |
| `loai_quy_id` | `loaiquy_id` | ❌ SAI |
| `mo_ta` | `mota` | ❌ SAI |
| `hinh_anh` | `hinhanh` | ❌ SAI |
| `so_tien_muc_tieu` | `sotienmuctieu` | ❌ SAI |
| `so_du` | `sodu` | ❌ SAI |
| `so_tien_ho_tro_toi_da` | `sotienhotrotoida` | ❌ SAI |
| `so_luong_ho_tro_toi_da` | `soluonghotrotoida` | ❌ SAI |
| `dieu_kien_ho_tro` | `dieukienhotro` | ❌ SAI |
| `ngay_bat_dau` | `ngaybatdau` | ❌ SAI |
| `ngay_ket_thuc` | `ngayketthuc` | ❌ SAI |
| `trang_thai` | `trangthai` | ❌ SAI |
| `nguoi_tao_id` | `nguoitao_id` | ❌ SAI |
| `created_at` | `ngaytao` | ❌ SAI |
| `updated_at` | `ngaycapnhat` | ❌ SAI |

### 6. Bảng `yeucauhotro`
| Tên CŨ (Backend) | Tên MỚI (Database) | Cần sửa |
|-----------------|-------------------|---------|
| `request_id` | `yeucauhotro_id` | ❌ SAI |
| `user_id` | `nguoidung_id` | ❌ SAI |
| `quy_id` | `quy_id` | ✅ Giống |
| `ly_do` | `lydo` | ❌ SAI |
| `so_tien_yeu_cau` | `sotiendenghi` | ❌ SAI |
| `tai_lieu_dinh_kem` | `tailieudinhkem` | ❌ SAI |
| `trang_thai` | `trangthai` | ❌ SAI |
| `ghi_chu` | `ghichu` | ❌ SAI |
| `ngay_nop` | `ngaynop` | ❌ SAI |
| `updated_at` | `ngaycapnhat` | ❌ SAI |

### 7. Bảng `pheduyet`
| Tên CŨ (Backend) | Tên MỚI (Database) | Cần sửa |
|-----------------|-------------------|---------|
| `approval_id` | `pheduyet_id` | ❌ SAI |
| `request_id` | `yeucauhotro_id` | ❌ SAI |
| `cap_duyet` | `capduyet` | ❌ SAI |
| `nguoi_duyet_id` | `nguoiduyet_id` | ❌ SAI |
| `ket_qua` | `ketqua` | ❌ SAI |
| `ly_do` | `lydo` | ❌ SAI |
| `ghi_chu` | `ghichu` | ❌ SAI |
| `ngay_duyet` | `ngayduyet` | ❌ SAI |

### 8. Bảng `khoantaitro`
| Tên CŨ (Backend) | Tên MỚI (Database) | Cần sửa |
|-----------------|-------------------|---------|
| `khoan_tai_tro_id` | `khoantaitro_id` | ❌ SAI |
| `nha_tai_tro_id` | `nhataitro_id` | ❌ SAI |
| `quy_id` | `quy_id` | ✅ Giống |
| `so_tien` | `sotien` | ❌ SAI |
| `hinh_thuc` | `hinhthuc` | ❌ SAI |
| `ma_giao_dich` | `magiaodich` | ❌ SAI |
| `ngay_tai_tro` | `ngaytaitro` | ❌ SAI |
| `chung_tu` | `chungtu` | ❌ SAI |
| `trang_thai` | `trangthai` | ❌ SAI |
| `ghi_chu` | `ghichu` | ❌ SAI |
| `nguoi_xac_nhan_id` | `nguoixacnhan_id` | ❌ SAI |
| `ngay_xac_nhan` | `ngayxacnhan` | ❌ SAI |
| `created_at` | `ngaytao` | ❌ SAI |
| `updated_at` | `ngaycapnhat` | ❌ SAI |

### 9. Bảng `giaodich`
| Tên CŨ (Backend) | Tên MỚI (Database) | Cần sửa |
|-----------------|-------------------|---------|
| `transaction_id` | `giaodich_id` | ❌ SAI |
| `request_id` | `yeucauhotro_id` | ❌ SAI |
| `quy_id` | `quy_id` | ✅ Giống |
| `nguoi_nhan_id` | `nguoinhan_id` | ❌ SAI |
| `so_tien` | `sotien` | ❌ SAI |
| `hinh_thuc` | `hinhthuc` | ❌ SAI |
| `ma_giao_dich` | `magiaodich` | ❌ SAI |
| `chung_tu` | `chungtu` | ❌ SAI |
| `trang_thai` | `trangthai` | ❌ SAI |
| `ghi_chu` | `ghichu` | ❌ SAI |
| `nguoi_thuc_hien_id` | `nguoithuchien_id` | ❌ SAI |
| `ngay_giao_dich` | `ngaygiaodich` | ❌ SAI |
| `updated_at` | `ngaycapnhat` | ❌ SAI |

### 10. Bảng `taikhoannganhang`
| Tên CŨ (Backend) | Tên MỚI (Database) | Cần sửa |
|-----------------|-------------------|---------|
| `bank_account_id` | `taikhoannganhang_id` | ❌ SAI |
| `quy_id` | `quy_id` | ✅ Giống |
| `so_tai_khoan` | `sotaikhoan` | ❌ SAI |
| `ngan_hang` | `nganhang` | ❌ SAI |
| `chi_nhanh` | `chinhanh` | ❌ SAI |
| `chu_tai_khoan` | `chutaikhoan` | ❌ SAI |
| `trang_thai` | `trangthai` | ❌ SAI |
| `created_at` | `ngaytao` | ❌ SAI |
| `updated_at` | `ngaycapnhat` | ❌ SAI |

### 11. Bảng `sinhviennoibat`
| Tên CŨ (Backend) | Tên MỚI (Database) | Cần sửa |
|-----------------|-------------------|---------|
| `id` | `sinhviennoibat_id` | ❌ SAI |
| `user_id` | `nguoidung_id` | ❌ SAI |
| `ho_ten` | `hoten` | ❌ SAI |
| `khoa_phong` | `khoaphong` | ❌ SAI |
| `nam_hoc` | `namhoc` | ❌ SAI |
| `hinh_anh` | `hinhanh` | ❌ SAI |
| `thanh_tich` | `thanhtich` | ❌ SAI |
| `thu_tu` | `thutu` | ❌ SAI |
| `trang_thai` | `trangthai` | ❌ SAI |
| `ngay_tao` | `ngaytao` | ❌ SAI |
| `ngay_cap_nhat` | `ngaycapnhat` | ❌ SAI |

---

## 📊 THỐNG KÊ

- **Tổng số bảng**: 12
- **Tên bảng cần sửa**: 0 ✅
- **Tên cột cần sửa**: **TOÀN BỘ** ❌

---

## 🎯 KẾT LUẬN

**TẤT CẢ các tên cột trong backend đều dùng `snake_case` với gạch dưới `_`**
**Database MỚI đã bỏ hết dấu gạch dưới `_` → lowercase liền không dấu**

### Ví dụ:
- `user_id` → `nguoidung_id`
- `ho_ten` → `hoten`
- `ma_so_dinh_danh` → `masodinhdanh`
- `created_at` → `ngaytao`
- `updated_at` → `ngaycapnhat`

---

## 📝 CÁCH XỬ LÝ

### Có 2 phương án:

#### **Phương án 1: Sửa Backend (KHUYẾN NGHỊ)**
- Tìm và thay thế TẤT CẢ tên cột trong backend models
- Ưu điểm: Database chuẩn, dễ đọc
- Nhược điểm: Phải sửa nhiều file

#### **Phương án 2: Sửa lại Database**
- Đổi tên cột trong database về snake_case
- Ưu điểm: Backend không cần sửa
- Nhược điểm: Database không nhất quán

---

## ✅ QUYẾT ĐỊNH: PHƯƠNG ÁN 1 - SỬA BACKEND

Tôi đề xuất sửa backend vì:
1. Database đã được chuẩn hóa (lowercase, không gạch dưới)
2. Dễ bảo trì về lâu dài
3. Nhất quán với quy tắc đặt tên tiếng Việt không dấu

---

## 🔧 CÁC BƯỚC THỰC HIỆN

### Bước 1: Sửa Models (Ưu tiên cao)
- [ ] `backend/models/auth/UserModel.js`
- [ ] `backend/models/auth/NguoiDungModel.js`
- [ ] `backend/models/users/RoleModel.js`
- [ ] `backend/models/funds/FundModel.js`
- [ ] `backend/models/funds/BankAccountModel.js`
- [ ] `backend/models/applications/ApplicationModel.js`
- [ ] `backend/models/applications/PheDuyetModel.js`
- [ ] `backend/models/donations/DonationModel.js`
- [ ] `backend/models/donations/DonorModel.js`
- [ ] `backend/models/transactions/TransactionModel.js`
- [ ] `backend/models/showcase/StudentShowcaseModel.js`

### Bước 2: Sửa Controllers (Nếu có query trực tiếp)
- Kiểm tra tất cả controllers xem có query database trực tiếp không

### Bước 3: Test
- [ ] Test đăng nhập
- [ ] Test tạo user
- [ ] Test CRUD quỹ
- [ ] Test yêu cầu hỗ trợ
- [ ] Test phê duyệt
- [ ] Test giao dịch

---

**BẮT ĐẦU TỪ BƯỚC 1: Sửa từng Model một, test từng bước**
