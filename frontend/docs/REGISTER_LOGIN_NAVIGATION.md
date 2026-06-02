# Đường dẫn giữa Form Đăng ký và Đăng nhập

## Tổng quan
Đã thêm navigation links giữa trang đăng ký và đăng nhập để người dùng có thể chuyển đổi dễ dàng.

## Các thay đổi

### 1. LoginForm - Link đến Register
**File**: `frontend/src/components/forms/LoginForm/LoginForm.jsx`

```jsx
<div className="login-form-footer">
  <span className="login-form-footer-text">Chưa có tài khoản?</span>
  <a href="/register" className="login-form-footer-link">
    Đăng ký ngay
  </a>
</div>
```

### 2. RegisterPage - Link đến Login
**File**: `frontend/src/pages/Auth/RegisterPage.jsx`

```jsx
<div className="register-footer">
  <span className="register-footer-text">Đã có tài khoản?</span>
  <a href="/login" className="register-footer-link">
    Đăng nhập ngay
  </a>
</div>
```

### 3. RegisterPage SCSS
**File**: `frontend/src/pages/Auth/RegisterPage.scss`

- Tạo styles hoàn chỉnh cho RegisterPage
- Match với design pattern của LoginForm
- Responsive design cho mobile
- Animations và transitions mượt mà

**Highlights**:
- Account type tabs (Sinh viên / Nhà tài trợ)
- Custom select dropdown styling
- Footer với link navigation
- Fade-in animation

### 4. App.jsx - Route Configuration
**File**: `frontend/src/App.jsx`

```jsx
import RegisterPage from './pages/Auth/RegisterPage'

// ...

<Route element={<AuthLayout />}>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
</Route>
```

## User Flow

### Đăng ký mới
1. User vào `/login`
2. Click "Đăng ký ngay" ở footer
3. Redirect đến `/register`
4. Chọn loại tài khoản (Sinh viên / Nhà tài trợ)
5. Điền form và submit
6. Sau khi đăng ký thành công → Auto redirect về `/login` sau 1.5s
7. Đăng nhập với tài khoản vừa tạo

### Đã có tài khoản
1. User vào `/register`
2. Click "Đăng nhập ngay" ở footer
3. Redirect đến `/login`
4. Đăng nhập với tài khoản có sẵn

## API Integration

### Register Endpoint
**Backend**: `POST /api/auth/register`

**Payload cho Sinh viên**:
```json
{
  "loaiTaiKhoan": "sinhvien",
  "hoTen": "Nguyễn Văn A",
  "mssv": "2021000000",
  "lopKhoa": "CNTT K45",
  "email": "example@tvu.edu.vn",
  "password": "password123"
}
```

**Payload cho Nhà tài trợ**:
```json
{
  "loaiTaiKhoan": "nhataitro",
  "tenToChuc": "Công ty ABC",
  "loaiNhaTaiTro": "To chuc",
  "soDienThoai": "0901234567",
  "email": "contact@abc.com",
  "password": "password123"
}
```

### Response
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "user": { ... }
}
```

## Validation

### Frontend Validation
- **Sinh viên**: Họ tên, MSSV, Lớp/Khoa bắt buộc
- **Nhà tài trợ**: Tên tổ chức, Số điện thoại bắt buộc
- **Chung**: Email format, Password min 8 ký tự, Confirm password match

### Backend Validation
- Email format validation
- Email uniqueness check
- Password length >= 8 characters
- Required fields based on account type

## Styling

### CSS Variables Used
- `$color-primary` - Primary color
- `$color-primary-dark` - Hover states
- `$bg-card` - Card background
- `$bg-input` - Input background
- `$text-body`, `$text-secondary` - Text colors
- `$shadow-xl`, `$shadow-sm` - Shadows
- `$radius-lg`, `$radius-xl` - Border radius
- `$space-*` - Spacing scale

### Components Used
- `Button` from `@components/common/Button`
- `Input` from `@components/common/Input`
- `Logo` from `@components/common/Logo`

## Testing Checklist

- [ ] Click "Đăng ký ngay" từ login → Redirect đến register
- [ ] Click "Đăng nhập ngay" từ register → Redirect đến login
- [ ] Đăng ký Sinh viên thành công
- [ ] Đăng ký Nhà tài trợ thành công
- [ ] Validation errors hiển thị đúng
- [ ] Auto redirect về login sau đăng ký thành công
- [ ] Responsive trên mobile
- [ ] Tab switching giữa Sinh viên / Nhà tài trợ

## Notes

- Links sử dụng `<a href>` thay vì `<Link>` để force full page reload
- Toast notifications cho success/error states
- Auto redirect sau 1.5s khi đăng ký thành công
- Form reset khi switch giữa account types
- Password toggle cho security
