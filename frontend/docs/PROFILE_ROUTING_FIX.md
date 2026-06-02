# Profile Routing Fix - Donor Support

## Vấn đề

ProfilePage đã có logic routing giữa StudentProfile và DonorProfile, nhưng **không hoạt động** vì:
- Backend trả về field `loai_tai_khoan` (snake_case)
- Frontend đang check field `loai_nguoi_dung` (không tồn tại)
- Không có fallback cho các tên field khác nhau

## Giải pháp

Cập nhật logic để **hỗ trợ nhiều tên field** (snake_case, camelCase, legacy):

```javascript
// Hỗ trợ cả 3 tên field
const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loai_nguoi_dung;
const isDonor = userType === 'NHA_TAI_TRO';
```

## Files đã cập nhật

### 1. ProfilePage.jsx (Router)

**Trước:**
```javascript
const isDonor = user?.loai_nguoi_dung === 'NHA_TAI_TRO';
```

**Sau:**
```javascript
const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loai_nguoi_dung;
const isDonor = userType === 'NHA_TAI_TRO';

// Debug log để kiểm tra
useEffect(() => {
  if (user) {
    console.log('🔍 ProfilePage - User data:', {
      loai_tai_khoan: user.loai_tai_khoan,
      loaiTaiKhoan: user.loaiTaiKhoan,
      loai_nguoi_dung: user.loai_nguoi_dung,
      userType,
      isDonor,
    });
  }
}, [user, userType, isDonor]);
```

### 2. ApplyPage.jsx

**Trước:**
```javascript
const isDonor = user?.loai_nguoi_dung === 'NHA_TAI_TRO';
```

**Sau:**
```javascript
const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loai_nguoi_dung;
const isDonor = userType === 'NHA_TAI_TRO';
```

### 3. PersonalInfoSection.jsx

**Trước:**
```javascript
const isSinhVien = user?.loai_nguoi_dung === 'SINH_VIEN';
```

**Sau:**
```javascript
const userType = user?.loai_tai_khoan || user?.loaiTaiKhoan || user?.loai_nguoi_dung;
const isSinhVien = userType === 'SINH_VIEN';
```

### 4. ProfileHeader.jsx

**Trước:**
```javascript
if (user.vaiTro === 4) {
  return user.loai_nguoi_dung;
}
```

**Sau:**
```javascript
if (user.vaiTro === 4) {
  return user.loai_tai_khoan || user.loaiTaiKhoan || user.loai_nguoi_dung;
}
```

## Backend Field Names

Từ backend (`authController.js`):

```javascript
// Response structure
{
  user: {
    nguoiDungId: 1,
    hoTen: "Nguyễn Văn A",
    email: "nguyenvana@tvu.edu.vn",
    vaiTro: 4,
    loai_tai_khoan: "SINH_VIEN" // hoặc "NHA_TAI_TRO"
  }
}
```

## Routing Logic

```
User đăng nhập (role_id = 4)
    ↓
Kiểm tra loai_tai_khoan
    ↓
┌─────────────────┬─────────────────┐
│  SINH_VIEN      │  NHA_TAI_TRO    │
│  ↓              │  ↓              │
│  StudentProfile │  DonorProfile   │
└─────────────────┴─────────────────┘
```

## Testing

### Test Cases

1. **Sinh viên đăng nhập:**
   - ✅ Vào `/profile` → Hiện StudentProfile
   - ✅ Badge hiện "SINH VIÊN"
   - ✅ Có sections: Personal Info, Bank Account, Overview, History

2. **Nhà tài trợ đăng nhập:**
   - ✅ Vào `/profile` → Hiện DonorProfile
   - ✅ Badge hiện "NHÀ TÀI TRỢ"
   - ✅ Có placeholder sections (TODO)

3. **Debug log:**
   - ✅ Console log hiện đúng user type
   - ✅ isDonor = true/false đúng

### Manual Testing Steps

1. Đăng nhập với tài khoản sinh viên
2. Click menu "Cá nhân" → Kiểm tra StudentProfile hiện ra
3. Đăng xuất
4. Đăng nhập với tài khoản nhà tài trợ
5. Click menu "Cá nhân" → Kiểm tra DonorProfile hiện ra
6. Mở Console → Kiểm tra debug log

## Field Name Priority

```javascript
// Priority order (first found wins)
1. user.loai_tai_khoan    // Backend snake_case (primary)
2. user.loaiTaiKhoan      // Frontend camelCase (if transformed)
3. user.loai_nguoi_dung   // Legacy fallback
```

## Related Files

- `frontend/src/pages/User/Student/ProfilePage/ProfilePage.jsx`
- `frontend/src/pages/User/Student/ApplyPage/ApplyPage.jsx`
- `frontend/src/pages/User/Student/ProfilePage/student/sections/PersonalInfoSection.jsx`
- `frontend/src/pages/User/Student/ProfilePage/shared/ProfileHeader.jsx`
- `backend/controllers/authController.js`

## Next Steps

1. ✅ Cập nhật logic routing
2. ✅ Thêm debug logs
3. ⏳ Test với tài khoản thật
4. ⏳ Implement DonorProfile sections
5. ⏳ Remove debug logs sau khi verify

## Notes

- **Không cần thay đổi backend** - Backend đã đúng
- **Chỉ cần fix frontend** - Đọc đúng field name
- **Backward compatible** - Hỗ trợ cả tên cũ và mới
- **Debug friendly** - Console log để dễ troubleshoot

## Date

Fix completed: 2026-05-27
