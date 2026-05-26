# Pages Structure

## 📁 Cấu Trúc Thư Mục

```
pages/
├── Public/              # Pages công khai (không cần đăng nhập)
│   ├── LandingPage/     # Trang chủ
│   ├── FundsPage/       # Danh sách quỹ
│   ├── DonorsPage/      # Nhà tài trợ
│   └── GuidelinesPage/  # Hướng dẫn
│
├── Student/             # Pages cho sinh viên (role_id = 4)
│   ├── Dashboard/       # Dashboard sinh viên
│   ├── ProfilePage/     # Trang cá nhân
│   └── ApplyPage/       # Nộp đơn xin hỗ trợ
│
├── Staff/               # Pages cho nhân viên (role_id = 1, 2, 3)
│   ├── Admin/           # Admin (role_id = 1)
│   │   ├── AdminDashboard.jsx
│   │   ├── UsersPage.jsx
│   │   ├── RolesPage.jsx
│   │   └── ApplicationsPage.jsx
│   │
│   ├── CanBo/           # Cán bộ Quỹ/Giáo vụ (role_id = 2)
│   │   ├── CanBoDashboard.jsx
│   │   └── ApplicationsPage.jsx
│   │
│   └── KeToan/          # Kế toán (role_id = 3)
│       ├── KeToanDashboard.jsx
│       └── DisbursementPage.jsx
│
├── Auth/                # Authentication pages
│   └── LoginPage.jsx
│
└── NotFound/            # 404 page
    └── NotFoundPage.jsx
```

## 🔐 Phân Quyền

### Public (Không cần đăng nhập)
- `/` - LandingPage
- `/funds` - FundsPage
- `/donors` - DonorsPage
- `/guidelines` - GuidelinesPage

### Student (role_id = 4)
- `/dashboard` - Dashboard sinh viên
- `/profile` - Trang cá nhân
- `/apply` - Nộp đơn xin hỗ trợ

### Admin (role_id = 1)
- `/admin/dashboard` - Dashboard admin
- `/admin/users` - Quản lý người dùng
- `/admin/roles` - Hệ thống & Phân quyền
- `/admin/xet-duyet` - Xét duyệt hồ sơ
- `/admin/quy` - Danh sách Quỹ
- `/admin/nha-tai-tro` - Nhà tài trợ
- `/admin/khoan-tai-tro` - Khoản tài trợ
- `/admin/giao-dich` - Lịch sử giao dịch
- `/admin/testimonials` - Sinh viên nổi bật
- `/admin/tin-tuc` - Tin tức & Sự kiện
- `/admin/bao-cao` - Thống kê & Báo cáo

### Cán bộ Quỹ (role_id = 2)
- `/can-bo/dashboard` - Dashboard cán bộ
- `/can-bo/xet-duyet` - Xét duyệt hồ sơ
- `/can-bo/khoan-tai-tro` - Khoản tài trợ
- `/can-bo/quy` - Danh sách Quỹ
- `/can-bo/nha-tai-tro` - Nhà tài trợ
- `/can-bo/giao-dich` - Lịch sử giao dịch
- `/can-bo/testimonials` - Sinh viên nổi bật
- `/can-bo/tin-tuc` - Tin tức & Sự kiện
- `/can-bo/bao-cao` - Thống kê & Báo cáo

### Kế toán (role_id = 3)
- `/ke-toan/dashboard` - Dashboard kế toán
- `/ke-toan/giai-ngan` - Giải ngân hồ sơ
- `/ke-toan/giao-dich` - Lịch sử giao dịch
- `/ke-toan/khoan-tai-tro` - Khoản tài trợ
- `/ke-toan/bao-cao` - Thống kê thu chi
- `/ke-toan/chung-tu` - Đối soát chứng từ

## 📝 Quy Tắc Đặt Tên

- **Folder**: PascalCase (VD: `LandingPage`, `ProfilePage`)
- **Component file**: PascalCase.jsx (VD: `LandingPage.jsx`)
- **Style file**: PascalCase.module.scss (VD: `LandingPage.module.scss`)
- **Index file**: index.js (export default)

## 🚀 Thêm Page Mới

### Public Page
```bash
# Tạo folder
mkdir frontend/src/pages/Public/NewPage

# Tạo component
touch frontend/src/pages/Public/NewPage/NewPage.jsx
touch frontend/src/pages/Public/NewPage/NewPage.module.scss
```

### Staff Page
```bash
# Admin
mkdir frontend/src/pages/Staff/Admin
touch frontend/src/pages/Staff/Admin/NewPage.jsx

# Cán bộ
mkdir frontend/src/pages/Staff/CanBo
touch frontend/src/pages/Staff/CanBo/NewPage.jsx

# Kế toán
mkdir frontend/src/pages/Staff/KeToan
touch frontend/src/pages/Staff/KeToan/NewPage.jsx
```

## 📦 Import Examples

```javascript
// Public pages
import LandingPage from '@pages/Public/LandingPage/LandingPage'

// Student pages
import ProfilePage from '@pages/Student/ProfilePage/ProfilePage'

// Staff pages
import AdminDashboard from '@pages/Staff/Admin/AdminDashboard'
import CanBoDashboard from '@pages/Staff/CanBo/CanBoDashboard'
import KeToanDashboard from '@pages/Staff/KeToan/KeToanDashboard'
```
