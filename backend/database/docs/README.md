# Database Scripts

This directory contains database-related scripts and utilities for the TVU Fund Management system.

## 📁 Files Overview

### 🆕 Bảng mới & Schema đầy đủ
- **`COMPLETE_DATABASE_SCHEMA.sql`** - Schema đầy đủ của toàn bộ database (10 bảng)
- **`NEW_TABLES.sql`** - Chỉ chứa các bảng mới tạo (sinh_vien_noi_bat)
- **`create_sinh_vien_noi_bat.sql`** - Script riêng cho bảng sinh viên nổi bật

### 📖 Tài liệu
- **`DATABASE_CHANGES_SUMMARY.md`** - Tổng hợp tất cả thay đổi database ⭐ ĐỌC ĐẦU TIÊN
- **`BUSINESS_LOGIC_UPDATES.md`** - Chi tiết các cập nhật logic nghiệp vụ

### 🔧 Utility Scripts
- **`seed_staff_users.sql`** - Tạo tài khoản staff mẫu (Admin, Kế toán, Cán bộ)
- **`fix_existing_donors.sql`** - Sửa và liên kết nhà tài trợ với tài khoản người dùng

---

## 🚀 Quick Start

### 1. Tạo database mới từ đầu
```bash
# Tạo database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS tvu_fund_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema đầy đủ
mysql -u root -p tvu_fund_management < COMPLETE_DATABASE_SCHEMA.sql

# Tạo tài khoản staff mẫu (optional)
mysql -u root -p tvu_fund_management < seed_staff_users.sql
```

### 2. Thêm bảng mới vào database hiện có
```bash
# Chỉ tạo bảng sinh_vien_noi_bat
mysql -u root -p tvu_fund_management < NEW_TABLES.sql

# Hoặc
mysql -u root -p tvu_fund_management < create_sinh_vien_noi_bat.sql
```

### 3. Sử dụng XAMPP (Windows)
```bash
# Nếu MySQL không có trong PATH
C:\xampp\mysql\bin\mysql.exe -u root tvu_fund_management < COMPLETE_DATABASE_SCHEMA.sql
```

---

## 📊 Database Structure

### Tổng số bảng: 10

#### Core Tables (9 bảng cũ)
1. **vaitro** - Vai trò người dùng
2. **nguoidung** - Người dùng hệ thống
3. **nhataitro** - Nhà tài trợ
4. **quy** - Quỹ hỗ trợ
5. **yeucauhotro** - Yêu cầu hỗ trợ
6. **pheduyet** - Phê duyệt đơn
7. **khoantaitro** - Khoản tài trợ
8. **giaodich** - Giao dịch giải ngân
9. **taikhoannganhang** - Tài khoản ngân hàng

#### New Tables (1 bảng mới) ⭐
10. **sinh_vien_noi_bat** - Sinh viên nổi bật (Landing Page)

---

## 🔄 Recent Changes

### Bảng mới tạo (28/05/2026)
✅ **sinh_vien_noi_bat** - Quản lý sinh viên xuất sắc hiển thị trên Landing Page
- 4 dữ liệu mẫu đã được thêm
- Hỗ trợ upload ảnh, sắp xếp thứ tự, ẩn/hiện

### Cập nhật logic nghiệp vụ (KHÔNG thay đổi cấu trúc)
✅ **quy** - Quản lý trạng thái quỹ (Tam dung, Da dong)  
✅ **quy** - Tính toán số dư thực tế  
✅ **yeucauhotro** - Đếm số đơn đã nộp (bao gồm Cho giai ngan)  
✅ **khoantaitro** - Tính tổng tiền đã nhận thực tế  
✅ **nhataitro** - Tự động tạo từ người dùng  

👉 **Chi tiết**: Xem file `BUSINESS_LOGIC_UPDATES.md`

---

## 👥 Default Staff Users

Sau khi chạy `seed_staff_users.sql`:

| Role | Email | Password | Mô tả |
|------|-------|----------|-------|
| Admin | admin@tvu.edu.vn | admin123 | Quản trị viên |
| Kế toán | ketoan@tvu.edu.vn | ketoan123 | Nhân viên kế toán |
| Cán bộ | canbo@tvu.edu.vn | canbo123 | Cán bộ quỹ |

⚠️ **Lưu ý**: Đổi mật khẩu sau lần đăng nhập đầu tiên!

---

## 🔍 Kiểm tra Database

```sql
-- Kiểm tra số lượng bảng
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'tvu_fund_management';
-- Kết quả mong đợi: 10

-- Kiểm tra bảng sinh_vien_noi_bat
SHOW TABLES LIKE 'sinh_vien_noi_bat';

-- Xem cấu trúc bảng
DESCRIBE sinh_vien_noi_bat;

-- Xem dữ liệu mẫu
SELECT id, ho_ten, khoa_phong, trang_thai FROM sinh_vien_noi_bat;
```

---

## 📝 Notes

### Quan trọng:
- ✅ Backup database trước khi chạy bất kỳ script nào
- ✅ Tất cả scripts đều idempotent (có thể chạy nhiều lần)
- ✅ Sử dụng charset `utf8mb4` và collation `utf8mb4_unicode_ci`
- ✅ Đổi mật khẩu mặc định sau lần đăng nhập đầu

### Hỗ trợ:
- 📖 Đọc `DATABASE_CHANGES_SUMMARY.md` để hiểu toàn bộ thay đổi
- 💼 Đọc `BUSINESS_LOGIC_UPDATES.md` để hiểu logic nghiệp vụ
- 🔧 Tất cả scripts đều có comments chi tiết

---

**Database**: tvu_fund_management  
**Charset**: utf8mb4  
**Collation**: utf8mb4_unicode_ci  
**Engine**: InnoDB  
**Last Updated**: 28/05/2026
