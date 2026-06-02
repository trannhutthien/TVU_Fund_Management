# DonorWallSection - Contact Button Logic

## 📋 Tổng Quan

Đã cập nhật logic cho button **"Liên hệ hợp tác"** trong DonorWallSection với xử lý phân quyền và kiểm tra loại tài khoản.

---

## 🎯 Logic Flow

### Case 1: Chưa Đăng Nhập
```
User chưa đăng nhập
  ↓
Click "Liên hệ hợp tác"
  ↓
Mở form đăng ký (RegisterForm)
```

**Action**: Gọi `onRegisterClick()` callback

---

### Case 2: Đã Đăng Nhập - Role 4 (Người dùng)

#### Sub-case 2a: Tài khoản Nhà Tài Trợ
```
User đăng nhập
  ↓
vaiTro = 4
  ↓
loaiTaiKhoan = 'NHA_TAI_TRO'
  ↓
Navigate to /donor/create-donation
```

**Action**: 
- Message success: "Chuyển đến trang tạo khoản tài trợ"
- Navigate: `/donor/create-donation`

#### Sub-case 2b: Tài khoản Sinh Viên
```
User đăng nhập
  ↓
vaiTro = 4
  ↓
loaiTaiKhoan ≠ 'NHA_TAI_TRO'
  ↓
Hiển thị thông báo
```

**Action**: 
- Message warning: "Tài khoản của bạn không phải là tài khoản nhà tài trợ. Vui lòng liên hệ quản trị viên để được hỗ trợ."

---

### Case 3: Đã Đăng Nhập - Staff (Role 1, 2, 3)
```
User đăng nhập
  ↓
vaiTro ∈ {1, 2, 3}
  ↓
Hiển thị thông báo
```

**Action**: 
- Message info: "Tính năng này dành cho nhà tài trợ. Vui lòng đăng nhập bằng tài khoản nhà tài trợ."

---

## 🔧 Implementation

### Updated Files

#### 1. DonorWallSection.jsx
```jsx
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { message } from 'antd';
import useAuthStore from '@stores/authStore';

const DonorWallSection = ({ onRegisterClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const handleContactClick = () => {
    // Case 1: Chưa đăng nhập
    if (!isAuthenticated) {
      if (onRegisterClick) {
        onRegisterClick();
      } else {
        message.info('Vui lòng đăng ký tài khoản để trở thành nhà tài trợ');
      }
      return;
    }

    // Case 2: Role 4 (Người dùng)
    if (user?.vaiTro === 4) {
      const accountType = user?.loaiTaiKhoan || user?.loai_tai_khoan;
      
      if (accountType === 'NHA_TAI_TRO') {
        // Navigate đến trang tạo khoản tài trợ
        message.success('Chuyển đến trang tạo khoản tài trợ');
        navigate('/donor/create-donation');
      } else {
        message.warning('Tài khoản của bạn không phải là tài khoản nhà tài trợ...');
      }
      return;
    }

    // Case 3: Staff
    message.info('Tính năng này dành cho nhà tài trợ...');
  };

  return (
    // ...
    <Button onClick={handleContactClick}>
      Liên hệ hợp tác →
    </Button>
  );
};

DonorWallSection.propTypes = {
  onRegisterClick: PropTypes.func,
};
```

#### 2. LandingPage.jsx
```jsx
<DonorWallSection onRegisterClick={openRegisterModal} />
```

---

## 📊 User Object Structure

### Expected Fields
```javascript
user = {
  vaiTro: 4,                    // Role ID (1=Admin, 2=Kế toán, 3=Cán bộ, 4=Người dùng)
  loaiTaiKhoan: 'NHA_TAI_TRO',  // Account type
  // hoặc
  loai_tai_khoan: 'NHA_TAI_TRO' // Snake case variant
}
```

### Account Types
- `'SINH_VIEN'` - Sinh viên
- `'NHA_TAI_TRO'` - Nhà tài trợ

---

## 🚀 Testing Scenarios

### Test 1: Chưa Đăng Nhập
1. Logout (nếu đang đăng nhập)
2. Scroll đến DonorWallSection
3. Click "Liên hệ hợp tác"
4. **Expected**: Form đăng ký mở ra

### Test 2: Đăng Nhập - Nhà Tài Trợ
1. Login với tài khoản:
   - `vaiTro = 4`
   - `loaiTaiKhoan = 'NHA_TAI_TRO'`
2. Scroll đến DonorWallSection
3. Click "Liên hệ hợp tác"
4. **Expected**: 
   - Message success
   - Navigate to `/donor/create-donation`

### Test 3: Đăng Nhập - Sinh Viên
1. Login với tài khoản:
   - `vaiTro = 4`
   - `loaiTaiKhoan = 'SINH_VIEN'`
2. Scroll đến DonorWallSection
3. Click "Liên hệ hợp tác"
4. **Expected**: Message warning (không phải nhà tài trợ)

### Test 4: Đăng Nhập - Staff
1. Login với tài khoản Admin/Kế toán/Cán bộ
   - `vaiTro ∈ {1, 2, 3}`
2. Scroll đến DonorWallSection
3. Click "Liên hệ hợp tác"
4. **Expected**: Message info (dành cho nhà tài trợ)

---

## 📝 TODO

### Next Steps
1. **Tạo trang `/donor/create-donation`**
   - Form tạo khoản tài trợ mới
   - Chọn quỹ
   - Nhập số tiền
   - Upload minh chứng chuyển khoản

2. **Cập nhật authStore**
   - Đảm bảo `loaiTaiKhoan` được lưu khi login
   - Sync với backend API `/auth/me`

3. **Backend API**
   - Endpoint tạo khoản tài trợ: `POST /api/donations`
   - Validate user là nhà tài trợ

---

## 🔒 Security Considerations

### Frontend Validation
- ✅ Check `isAuthenticated`
- ✅ Check `vaiTro`
- ✅ Check `loaiTaiKhoan`

### Backend Validation (Required)
- ⚠️ **MUST** validate user role on server
- ⚠️ **MUST** validate account type on server
- ⚠️ **MUST** check permissions before creating donation

**Note**: Frontend checks are for UX only. Backend must enforce all security rules.

---

## 🎨 UX Improvements

### Messages
- **Info**: Blue - Thông tin chung
- **Success**: Green - Thành công
- **Warning**: Orange - Cảnh báo
- **Error**: Red - Lỗi

### Navigation
- Smooth transition to `/donor/create-donation`
- Preserve scroll position when opening RegisterForm

---

## 📊 Flow Diagram

```
┌─────────────────────────────────────┐
│  Click "Liên hệ hợp tác"            │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌──────────────┐
        │ Authenticated?│
        └──────┬───────┘
               │
       ┌───────┴────────┐
       │                │
      NO               YES
       │                │
       ▼                ▼
  ┌─────────┐    ┌──────────┐
  │ Open    │    │ Check    │
  │ Register│    │ vaiTro   │
  │ Form    │    └────┬─────┘
  └─────────┘         │
                      │
            ┌─────────┼─────────┐
            │         │         │
          Role 4    Role 1-3  Other
            │         │         │
            ▼         ▼         ▼
      ┌──────────┐ ┌──────┐  ┌──────┐
      │ Check    │ │ Info │  │ Info │
      │ loaiTK   │ │ Msg  │  │ Msg  │
      └────┬─────┘ └──────┘  └──────┘
           │
    ┌──────┴──────┐
    │             │
NHA_TAI_TRO   SINH_VIEN
    │             │
    ▼             ▼
┌────────┐   ┌─────────┐
│Navigate│   │ Warning │
│to Page │   │ Message │
└────────┘   └─────────┘
```

---

## ✅ Checklist

- [x] Import dependencies (useNavigate, PropTypes, message, useAuthStore)
- [x] Add `onRegisterClick` prop
- [x] Implement `handleContactClick` function
- [x] Add onClick handler to Button
- [x] Update LandingPage to pass prop
- [x] Add PropTypes validation
- [x] Documentation complete

---

## 🎉 Kết Quả

Button **"Liên hệ hợp tác"** đã có logic đầy đủ:
- ✅ Kiểm tra đăng nhập
- ✅ Kiểm tra role
- ✅ Kiểm tra loại tài khoản
- ✅ Navigate đúng trang
- ✅ Hiển thị message phù hợp

**Sẵn sàng để test!** 🚀

---

**Created**: 27/05/2026  
**Status**: Complete ✅  
**Next**: Tạo trang `/donor/create-donation`
