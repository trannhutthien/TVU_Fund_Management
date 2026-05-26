# Database Setup Guide

## 1. Tạo bảng vai trò (vaitro)

Chạy SQL sau để tạo 4 vai trò trong hệ thống:

```sql
INSERT INTO vaitro (ten_vai_tro, mo_ta, trang_thai)
VALUES
  ('Admin', 'Quản trị hệ thống', 'HOAT_DONG'),
  ('KeToan', 'Quản lý giải ngân và tài chính', 'HOAT_DONG'),
  ('CanBoQuy', 'Xét duyệt và quản lý quỹ', 'HOAT_DONG'),
  ('NguoiDung', 'Người dùng hệ thống', 'HOAT_DONG');
```

## 2. Tạo tài khoản staff

### Phương án 1: Seed trực tiếp vào database (Khuyến nghị)

Chạy script Node.js để tạo 3 tài khoản staff:

```bash
cd backend
npm run seed:staff
```

Hoặc:

```bash
node utils/seedStaffUsers.js
```

Script sẽ tạo:
- **Admin**: admin@tvu.edu.vn / 123456 (role_id: 1)
- **Kế toán**: ketoan@tvu.edu.vn / 123456 (role_id: 2)
- **Cán bộ Quỹ**: canbo@tvu.edu.vn / 123456 (role_id: 3)

### Phương án 2: Tạo qua API

Nếu đã có tài khoản Admin hoặc Cán bộ Quỹ, có thể tạo user mới qua API:

```bash
node utils/createStaffViaAPI.js
```

Script sẽ:
1. Đăng nhập với tài khoản có quyền (Admin/Cán bộ Quỹ)
2. Gọi API `POST /api/users` để tạo user mới
3. Tự động hash mật khẩu và lưu vào database

### Phương án 3: SQL thủ công

Nếu muốn tạo thủ công, sử dụng file `seed_staff_users.sql`:

```bash
mysql -u root -p tvu_fund < backend/database/seed_staff_users.sql
```

**Lưu ý**: Mật khẩu trong file SQL đã được hash sẵn với bcrypt (mật khẩu gốc: `123456`)

## 3. Thông tin đăng nhập

Sau khi seed thành công, sử dụng các tài khoản sau để đăng nhập:

| Vai trò | Email | Mật khẩu | Route |
|---------|-------|----------|-------|
| Admin | admin@tvu.edu.vn | 123456 | /admin/dashboard |
| Kế toán | ketoan@tvu.edu.vn | 123456 | /ke-toan/dashboard |
| Cán bộ Quỹ | canbo@tvu.edu.vn | 123456 | /can-bo/dashboard |

## 4. Cấu trúc vai trò

- **Role 1 (Admin)**: Quản trị toàn bộ hệ thống
- **Role 2 (Kế toán)**: Quản lý giải ngân, giao dịch, báo cáo tài chính
- **Role 3 (Cán bộ Quỹ)**: Xét duyệt hồ sơ, quản lý quỹ, nhà tài trợ
- **Role 4 (Người dùng)**: Sinh viên và nhà tài trợ

## 5. Scripts có sẵn

```bash
# Tạo staff users
npm run seed:staff

# Kiểm tra staff users hiện có
npm run check:staff

# Tạo hash cho mật khẩu
node utils/generateHash.js
```

## 6. Troubleshooting

### Lỗi: "Email đã được sử dụng"
Script sẽ tự động cập nhật user hiện có thay vì tạo mới.

### Lỗi: "Cannot connect to database"
Kiểm tra file `.env` và đảm bảo database đang chạy:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tvu_fund
```

### Lỗi: "Table 'vaitro' doesn't exist"
Chạy lại migration hoặc tạo bảng vaitro trước (bước 1).

## 7. Lưu ý bảo mật

- Mật khẩu mặc định `123456` chỉ dùng cho development
- Nên đổi mật khẩu sau khi đăng nhập lần đầu
- Không commit file chứa mật khẩu thật vào Git
