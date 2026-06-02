# TỔNG HỢP THAY ĐỔI DATABASE

## 📋 Mục lục
1. [Bảng mới tạo](#bảng-mới-tạo)
2. [Bảng cập nhật cấu trúc](#bảng-cập-nhật-cấu-trúc)
3. [Cập nhật logic nghiệp vụ](#cập-nhật-logic-nghiệp-vụ)
4. [Files SQL](#files-sql)
5. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)

---

## 🆕 Bảng mới tạo

### 1. sinh_vien_noi_bat
**Ngày tạo**: 28/05/2026  
**Mục đích**: Quản lý sinh viên xuất sắc hiển thị trên Landing Page

#### Cấu trúc:
| Cột | Kiểu dữ liệu | Mô tả |
|-----|-------------|-------|
| id | INT (PK) | ID tự tăng |
| ho_ten | VARCHAR(100) | Họ và tên sinh viên |
| khoa_phong | VARCHAR(100) | Khoa/Ngành học |
| nam_hoc | VARCHAR(20) | Năm học (VD: 2023-2024) |
| hinh_anh | VARCHAR(255) | Đường dẫn ảnh sinh viên |
| thanh_tich | TEXT | Mô tả thành tích nổi bật |
| thu_tu | INT | Thứ tự hiển thị (số nhỏ hiển thị trước) |
| trang_thai | ENUM | 'Hien thi', 'An' |
| ngay_tao | TIMESTAMP | Ngày tạo |
| ngay_cap_nhat | TIMESTAMP | Ngày cập nhật |

#### Indexes:
- `idx_trang_thai` - Index trên cột trang_thai
- `idx_thu_tu` - Index trên cột thu_tu

#### Dữ liệu mẫu:
- 4 sinh viên mẫu đã được thêm vào

#### File SQL:
- `NEW_TABLES.sql` - Script tạo bảng và dữ liệu mẫu
- `create_sinh_vien_noi_bat.sql` - Script riêng cho bảng này

---

## 🔄 Bảng cập nhật cấu trúc

### ❌ KHÔNG CÓ BẢNG NÀO ĐƯỢC CẬP NHẬT CẤU TRÚC

Tất cả các bảng hiện tại giữ nguyên cấu trúc. Chỉ có logic nghiệp vụ được cập nhật.

---

## 💼 Cập nhật logic nghiệp vụ

### 1. Bảng: quy (Quỹ)

#### 1.1. Quản lý trạng thái quỹ
**Cột**: `trang_thai` (đã có sẵn, không thay đổi cấu trúc)

**Cập nhật logic**:
- ✅ **Dang hoat dong**: Hiển thị công khai, cho phép nộp đơn
- ✅ **Tam dung**: Hiển thị nhưng disable, không cho nộp đơn mới
- ✅ **Da dong**: KHÔNG hiển thị công khai, đóng vĩnh viễn

**API mới**:
```
PUT /api/funds/:id/status
Body: { status: 'Dang hoat dong' | 'Tam dung' | 'Da dong' }
```

**Query cập nhật**:
```sql
-- Lấy quỹ công khai (không bao gồm quỹ đã đóng)
SELECT * FROM quy 
WHERE trang_thai IN ('Dang hoat dong', 'Tam dung')
ORDER BY ngay_tao DESC;
```

#### 1.2. Tính toán số dư thực tế
**Cột**: `so_du` (đã có sẵn, không thay đổi cấu trúc)

**Cập nhật logic**:
```
so_du_thuc_te = so_du - SUM(so_tien_de_nghi WHERE trang_thai = 'Cho giai ngan')
```

**Lý do**: Các đơn "Cho giai ngan" đã được duyệt và sẽ được giải ngân, cần trừ vào số dư khả dụng

**Query cập nhật**:
```sql
SELECT 
  q.*,
  q.so_du - COALESCE(SUM(CASE 
    WHEN y.trang_thai = 'Cho giai ngan' 
    THEN y.so_tien_de_nghi 
    ELSE 0 
  END), 0) as so_du_thuc_te
FROM quy q
LEFT JOIN yeucauhotro y ON q.id = y.quy_id
GROUP BY q.id;
```

---

### 2. Bảng: yeucauhotro (Yêu cầu hỗ trợ)

#### Đếm số đơn đã nộp
**Cột**: `trang_thai` (đã có sẵn, không thay đổi cấu trúc)

**Cập nhật logic**:
```sql
-- Trước: Chỉ đếm 'Da giai ngan'
-- Sau: Đếm cả 'Cho giai ngan' và 'Da giai ngan'
so_don_da_nop = COUNT(WHERE trang_thai IN ('Cho giai ngan', 'Da giai ngan'))
```

**Lý do**: Đơn "Cho giai ngan" đã được duyệt 3 cấp, cần tính vào số đơn đã được duyệt

---

### 3. Bảng: khoantaitro (Khoản tài trợ)

#### Tính tổng tiền đã nhận thực tế
**Cột**: `trang_thai` (đã có sẵn, không thay đổi cấu trúc)

**Cập nhật logic**:
```sql
-- Chỉ tính các khoản có trạng thái 'Da nhan'
tong_tien_da_nhan = SUM(so_tien WHERE trang_thai = 'Da nhan')
```

**Hiển thị**: ImpactStatsSection trên Landing Page

---

### 4. Bảng: nhataitro (Nhà tài trợ)

#### Tự động tạo từ người dùng
**Cột**: `nguoi_dung_id` (đã có sẵn, không thay đổi cấu trúc)

**Cập nhật logic**:
- Khi người dùng tạo khoản tài trợ lần đầu, tự động tạo record trong `nhataitro`
- Liên kết với `nguoi_dung_id`

**Lý do**: Giảm bước thao tác, tăng trải nghiệm người dùng

---

## 📁 Files SQL

### 1. COMPLETE_DATABASE_SCHEMA.sql
**Mô tả**: Schema đầy đủ của toàn bộ database  
**Nội dung**:
- Tất cả 10 bảng trong hệ thống
- Bao gồm bảng mới `sinh_vien_noi_bat`
- Indexes, Foreign Keys, Comments đầy đủ
- Dữ liệu mẫu cho các bảng cần thiết

**Sử dụng**: Tạo database mới từ đầu

---

### 2. NEW_TABLES.sql
**Mô tả**: Chỉ chứa các bảng mới tạo  
**Nội dung**:
- Bảng `sinh_vien_noi_bat`
- 4 dữ liệu mẫu sinh viên
- Hướng dẫn sử dụng (queries mẫu)

**Sử dụng**: Thêm bảng mới vào database hiện có

---

### 3. create_sinh_vien_noi_bat.sql
**Mô tả**: Script riêng cho bảng sinh viên nổi bật  
**Nội dung**: Giống NEW_TABLES.sql

**Sử dụng**: Tạo riêng bảng sinh_vien_noi_bat

---

### 4. BUSINESS_LOGIC_UPDATES.md
**Mô tả**: Tài liệu chi tiết về các cập nhật logic nghiệp vụ  
**Nội dung**:
- Giải thích chi tiết từng cập nhật
- Queries cũ vs queries mới
- Lý do thay đổi
- Ví dụ sử dụng

**Sử dụng**: Tham khảo khi cần hiểu logic nghiệp vụ

---

### 5. DATABASE_CHANGES_SUMMARY.md (file này)
**Mô tả**: Tổng hợp tất cả thay đổi database  
**Sử dụng**: Điểm khởi đầu để hiểu toàn bộ thay đổi

---

## 🚀 Hướng dẫn sử dụng

### Tình huống 1: Tạo database mới từ đầu
```bash
# Sử dụng file COMPLETE_DATABASE_SCHEMA.sql
mysql -u root -p tvu_fund_management < COMPLETE_DATABASE_SCHEMA.sql
```

### Tình huống 2: Thêm bảng mới vào database hiện có
```bash
# Sử dụng file NEW_TABLES.sql
mysql -u root -p tvu_fund_management < NEW_TABLES.sql

# Hoặc chỉ tạo bảng sinh_vien_noi_bat
mysql -u root -p tvu_fund_management < create_sinh_vien_noi_bat.sql
```

### Tình huống 3: Cập nhật logic nghiệp vụ
**Không cần chạy SQL script**  
Các cập nhật logic đã được implement trong code backend:
- `backend/models/FundModel.js` - Tính số dư thực tế
- `backend/controllers/fundController.js` - API quản lý trạng thái
- `backend/controllers/donationController.js` - Tự động tạo nhà tài trợ
- `backend/controllers/statisticsController.js` - Tính tổng tiền đã nhận

---

## 📊 Thống kê

### Tổng số bảng trong database: 10
1. vaitro (Vai trò)
2. nguoidung (Người dùng)
3. nhataitro (Nhà tài trợ)
4. quy (Quỹ)
5. yeucauhotro (Yêu cầu hỗ trợ)
6. pheduyet (Phê duyệt)
7. khoantaitro (Khoản tài trợ)
8. giaodich (Giao dịch)
9. taikhoannganhang (Tài khoản ngân hàng)
10. **sinh_vien_noi_bat** (Sinh viên nổi bật) ⭐ MỚI

### Bảng mới tạo: 1
- sinh_vien_noi_bat

### Bảng cập nhật cấu trúc: 0
- Không có

### Bảng cập nhật logic: 4
- quy (2 cập nhật)
- yeucauhotro (1 cập nhật)
- khoantaitro (1 cập nhật)
- nhataitro (1 cập nhật)

---

## 📝 Ghi chú

### Lưu ý quan trọng:
1. ✅ Tất cả các bảng hiện tại **GIỮ NGUYÊN CẤU TRÚC**
2. ✅ Không cần chạy migration cho các bảng cũ
3. ✅ Chỉ cần chạy script tạo bảng `sinh_vien_noi_bat`
4. ✅ Logic nghiệp vụ đã được implement trong code backend
5. ✅ Backend server cần restart sau khi cập nhật code

### Kiểm tra sau khi cập nhật:
```sql
-- Kiểm tra bảng sinh_vien_noi_bat đã tạo chưa
SHOW TABLES LIKE 'sinh_vien_noi_bat';

-- Kiểm tra cấu trúc bảng
DESCRIBE sinh_vien_noi_bat;

-- Kiểm tra dữ liệu mẫu
SELECT * FROM sinh_vien_noi_bat;

-- Kiểm tra số lượng bảng trong database
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'tvu_fund_management';
-- Kết quả mong đợi: 10
```

---

**Ngày cập nhật**: 28/05/2026  
**Phiên bản**: 1.0  
**Người thực hiện**: Kiro AI Assistant  
**Database**: tvu_fund_management
