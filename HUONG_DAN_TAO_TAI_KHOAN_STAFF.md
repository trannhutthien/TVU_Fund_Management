# Hướng dẫn tạo tài khoản Staff

## Bước 1: Tạo bảng vai trò (nếu chưa có)

Mở MySQL Workbench hoặc phpMyAdmin, chạy SQL sau:

```sql
INSERT INTO vaitro (ten_vai_tro, mo_ta, trang_thai)
VALUES
  ('Admin', 'Quản trị hệ thống', 'HOAT_DONG'),
  ('KeToan', 'Quản lý giải ngân và tài chính', 'HOAT_DONG'),
  ('CanBoQuy', 'Xét duyệt và quản lý quỹ', 'HOAT_DONG'),
  ('NguoiDung', 'Người dùng hệ thống', 'HOAT_DONG');
```

## Bước 2: Tạo tài khoản staff

### Phương án 1: Dùng script Node.js (Khuyến nghị)

1. Mở terminal trong thư mục `backend`
2. Chạy lệnh:

```bash
npm run seed:staff
```

Hoặc:

```bash
node utils/seedStaffUsers.js
```

3. Kết quả:

```
🚀 Bắt đầu tạo staff users...

✅ Tạo mới: Nguyễn Văn Admin (admin@tvu.edu.vn) - Role 1
✅ Tạo mới: Trần Thị Kế Toán (ketoan@tvu.edu.vn) - Role 2
✅ Tạo mới: Lê Văn Cán Bộ (canbo@tvu.edu.vn) - Role 3

============================================================
📊 KẾT QUẢ:
   ✅ Tạo mới: 3 tài khoản
   🔄 Cập nhật: 0 tài khoản
============================================================

🎉 HOÀN TẤT! Thông tin đăng nhập:

┌─────────────────────────────────────────────────────┐
│  ADMIN                                              │
│  Email: admin@tvu.edu.vn                            │
│  Mật khẩu: 123456                                   │
│  Route: /admin/dashboard                            │
├─────────────────────────────────────────────────────┤
│  KẾ TOÁN                                            │
│  Email: ketoan@tvu.edu.vn                           │
│  Mật khẩu: 123456                                   │
│  Route: /ke-toan/dashboard                          │
├─────────────────────────────────────────────────────┤
│  CÁN BỘ QUỸ                                         │
│  Email: canbo@tvu.edu.vn                            │
│  Mật khẩu: 123456                                   │
│  Route: /can-bo/dashboard                           │
└─────────────────────────────────────────────────────┘
```

### Phương án 2: Dùng SQL thủ công

Nếu script Node.js không chạy được, dùng file SQL:

```bash
mysql -u root -p tvu_fund < backend/database/seed_staff_users.sql
```

## Bước 3: Đăng nhập và kiểm tra

1. Mở trình duyệt, truy cập: `http://localhost:3000/login`

2. Đăng nhập với tài khoản Cán bộ Quỹ:
   - Email: `canbo@tvu.edu.vn`
   - Mật khẩu: `123456`

3. Sau khi đăng nhập thành công:
   - Sidebar sẽ hiển thị bên trái
   - Click vào "Xét duyệt hồ sơ" trong menu NGHIỆP VỤ
   - Trang XetDuyetPage sẽ render

## Bước 4: Kiểm tra trong Console (F12)

Nếu trang không hiển thị, mở Console (F12) và kiểm tra:

1. **Kiểm tra user trong localStorage:**

```javascript
console.log(JSON.parse(localStorage.getItem('user')))
```

Kết quả mong đợi:
```json
{
  "id": "...",
  "email": "canbo@tvu.edu.vn",
  "vaiTro": 3,
  "hoTen": "Lê Văn Cán Bộ",
  ...
}
```

2. **Kiểm tra route hiện tại:**

```javascript
console.log(window.location.pathname)
```

Kết quả mong đợi: `/can-bo/xet-duyet`

3. **Kiểm tra lỗi:**

Xem tab Console có lỗi màu đỏ không. Nếu có, copy lỗi và báo lại.

## Troubleshooting

### Lỗi: "Email đã được sử dụng"

Script sẽ tự động cập nhật user hiện có. Không cần lo lắng.

### Lỗi: "Cannot connect to database"

Kiểm tra file `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tvu_fund
DB_PORT=3306
```

Đảm bảo MySQL đang chạy.

### Sidebar không hiển thị

1. Kiểm tra `vaiTro` trong localStorage (phải là 1, 2, hoặc 3)
2. Xóa cache trình duyệt (Ctrl + Shift + Delete)
3. Đăng xuất và đăng nhập lại

### XetDuyetPage không render

1. Kiểm tra route: `/can-bo/xet-duyet`
2. Kiểm tra Console có lỗi không
3. Kiểm tra file `frontend/src/pages/Staff/CanBo/XetDuyetPage/XetDuyetPage.jsx` có tồn tại không

## Cấu trúc vai trò

| Role ID | Tên vai trò | Quyền hạn |
|---------|-------------|-----------|
| 1 | Admin | Quản trị toàn bộ hệ thống |
| 2 | Kế toán | Quản lý giải ngân, giao dịch, báo cáo tài chính |
| 3 | Cán bộ Quỹ | Xét duyệt hồ sơ, quản lý quỹ, nhà tài trợ |
| 4 | Người dùng | Sinh viên và nhà tài trợ |

## Lưu ý

- Mật khẩu mặc định `123456` chỉ dùng cho development
- Nên đổi mật khẩu sau khi đăng nhập lần đầu
- Không commit file chứa mật khẩu thật vào Git
